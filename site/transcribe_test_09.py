import os
import re
import json
import time
import tempfile
import urllib.request
import urllib.parse
import ssl

API_KEY = "AIzaSyA1y9LU2Iyojc343iQYUjyVM-2jGx1qVV4"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"

FILE_PATH = os.path.join(os.path.dirname(__file__), "questions IELTS L", "ielts-listening-test-09.js")

ctx = ssl.create_default_context()

def download_audio(url):
    parsed = urllib.parse.urlparse(url)
    ext = os.path.splitext(parsed.path)[1].lower()
    mime = "audio/mpeg" if ext == ".mp3" else "audio/mp4"

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
    print(f"    Downloading: {url}")
    req = urllib.request.Request(url)
    resp = urllib.request.urlopen(req, context=ctx)
    tmp.write(resp.read())
    tmp.close()
    return tmp.name, mime

def transcribe_with_answers(audio_path, mime_type, answers_dict):
    import base64
    with open(audio_path, "rb") as f:
        audio_b64 = base64.b64encode(f.read()).decode("utf-8")

    prompt = (
        "You are an expert transcriber. Transcribe this audio exactly and completely. "
        "Include all spoken words. If there are multiple speakers, label them (e.g., Speaker 1, Speaker 2, Narrator). "
        "Separate each distinct turn or sentence with a newline '\\n'. "
        "Also, I have a list of answers for a test based on this audio. "
        "Identify which line number (0-indexed, where line 0 is the first line of the transcript) "
        "contains the clue or the spoken answer for each question ID. "
        f"Here are the answers in JSON mapping QuestionID to expected answers: {json.dumps(answers_dict)}\n\n"
        "Return ONLY a valid JSON object without markdown formatting in this exact format:\n"
        "{\n"
        '  "transcript": "Speaker 1: Hello...\\nSpeaker 2: Hi there...",\n'
        '  "answerHighlights": {\n'
        '    "11": [0],\n'
        '    "12": [1]\n'
        '  }\n'
        "}"
    )

    payload = {
        "contents": [{
            "parts": [
                {"inlineData": {"mimeType": mime_type, "data": audio_b64}},
                {"text": prompt}
            ]
        }],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        GEMINI_URL,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    print("    Sending to Gemini for transcription and highlight mapping...")
    try:
        resp = urllib.request.urlopen(req, context=ctx)
        result = json.loads(resp.read().decode("utf-8"))
        text = result["candidates"][0]["content"]["parts"][0]["text"]
        
        # sometimes gemini wraps in ```json ... ``` even with responseMimeType
        if text.startswith("```json"):
            text = text[7:-3].strip()
        elif text.startswith("```"):
            text = text[3:-3].strip()

        return json.loads(text)
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        if 'resp' in locals():
            print(resp.read().decode("utf-8"))
        raise e

def process_test():
    print(f"Processing: {FILE_PATH}")
    with open(FILE_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # We will manually extract the URL and answers for the 4 parts
    # Using regex to find audioUrl and answers block
    # Actually, simpler: just match each part block
    parts = []
    part_strs = content.split("partNumber:")
    for i in range(1, 5):
        if i >= len(part_strs): break
        s = part_strs[i]
        
        url_match = re.search(r'audioFile:\s*"([^"]+)"', s)
        if not url_match: continue
        url = url_match.group(1)
        
        ans_match = re.search(r'answers:\s*({[^}]*})', s, re.DOTALL)
        if not ans_match: continue
        
        ans_str = ans_match.group(1)
        # convert JS object string to valid python dict (keys might not be quoted)
        ans_str = re.sub(r'(\d+):', r'"\1":', ans_str)
        # remove comments like // Note for multi-mcq
        ans_str = re.sub(r'//.*', '', ans_str)
        try:
            answers = json.loads(ans_str)
        except Exception as e:
            print(f"Failed to parse answers for part {i}: {e}")
            answers = {}
        
        parts.append({
            'part': i,
            'url': url,
            'answers': answers,
            'match_end': ans_match.end() + content.find(ans_match.group(0), content.find(url))
        })

    for p in parts:
        url = p['url']
        ans = p['answers']
        print(f"\nPart {p['part']}: {url}")
        tmp_path, mime = download_audio(url)
        try:
            res = transcribe_with_answers(tmp_path, mime, ans)
            transcript = res.get('transcript', '')
            highlights = res.get('answerHighlights', {})
            
            # replace in content
            part_str_before_replacement = f'partNumber: {p["part"]},' 
            part_start_idx = content.find(part_str_before_replacement)
            if part_start_idx == -1: continue
            
            # Find the answers block end in this part to insert answerHighlights
            ans_block_start = content.find('answers: {', part_start_idx)
            ans_block_end = content.find('}', ans_block_start) + 1
            
            escaped = transcript.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
            
            # 1. Replace transcript: "Pending" with transcript: "..."
            transcript_match = re.search(r'transcript:\s*"Pending"', content[part_start_idx:ans_block_end])
            if transcript_match:
                match_start = part_start_idx + transcript_match.start()
                match_end = part_start_idx + transcript_match.end()
                content = content[:match_start] + f'transcript: "{escaped}"' + content[match_end:]
                
                # Update indices after replacement
                ans_block_start = content.find('answers: {', part_start_idx)
                ans_block_end = content.find('}', ans_block_start) + 1
            
            # 2. Insert answerHighlights after answers block
            highlights_str = json.dumps(highlights, indent=4).replace('\\n', '\n')
            
            # To match JS format
            highlights_js = ",\n      answerHighlights: " + highlights_str
            
            content = content[:ans_block_end] + highlights_js + content[ans_block_end:]
            print(f"    [OK] Added transcript & highlights for Part {p['part']}")
            
            # Rate limiting
            time.sleep(2)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
                
    with open(FILE_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print("\nAll done!")

if __name__ == "__main__":
    process_test()
