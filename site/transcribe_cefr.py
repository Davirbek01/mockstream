"""
Transcribe CEFR Listening audio files using Gemini API.
Downloads each part's audio, sends to Gemini for transcription,
and inserts a 'transcript' field into the JS question files.
"""

import os
import re
import json
import time
import tempfile
import urllib.request
import urllib.parse
import ssl

# ── Gemini config ──
API_KEY = "AIzaSyA1y9LU2Iyojc343iQYUjyVM-2jGx1qVV4"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"

QUESTIONS_DIR = os.path.join(os.path.dirname(__file__), "questions CEFR L")

# Allow HTTPS
ctx = ssl.create_default_context()


def download_audio(url):
    """Download audio file to a temp file, return path and mime type."""
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


def transcribe_with_gemini(audio_path, mime_type):
    """Send audio to Gemini and get transcript text back."""
    import base64

    with open(audio_path, "rb") as f:
        audio_b64 = base64.b64encode(f.read()).decode("utf-8")

    payload = {
        "contents": [{
            "parts": [
                {
                    "inlineData": {
                        "mimeType": mime_type,
                        "data": audio_b64
                    }
                },
                {
                    "text": (
                        "Transcribe this audio exactly and completely. "
                        "Include all spoken words. If there are multiple speakers, "
                        "label them (e.g., Speaker 1, Speaker 2, Narrator). "
                        "Output only the transcript text, nothing else."
                    )
                }
            ]
        }]
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        GEMINI_URL,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    print("    Sending to Gemini for transcription...")
    resp = urllib.request.urlopen(req, context=ctx)
    result = json.loads(resp.read().decode("utf-8"))

    # Extract transcript text
    text = result["candidates"][0]["content"]["parts"][0]["text"]
    return text.strip()


def extract_audio_urls(js_content):
    """Extract all audioFile URLs and their positions from a JS file."""
    pattern = r'audioFile:\s*"([^"]+)"'
    return [(m.start(), m.end(), m.group(1)) for m in re.finditer(pattern, js_content)]


def insert_transcript(js_content, audio_match_end, transcript_text):
    """Insert a transcript field right after the audioFile line."""
    # Find the end of the audioFile line (after the comma or add one)
    line_end = js_content.index("\n", audio_match_end)
    # Escape the transcript for JS string (handle quotes and newlines)
    escaped = transcript_text.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
    insert_text = f'\n      transcript: "{escaped}",'
    return js_content[:line_end] + insert_text + js_content[line_end:]


def process_test_file(filepath):
    """Process a single test JS file: transcribe all parts and save."""
    filename = os.path.basename(filepath)
    print(f"\n{'='*60}")
    print(f"Processing: {filename}")
    print(f"{'='*60}")

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Check if transcripts already exist
    if "transcript:" in content:
        print(f"  [SKIP] Transcripts already exist in {filename}, skipping.")
        return

    audio_matches = extract_audio_urls(content)
    print(f"  Found {len(audio_matches)} audio parts")

    # Process in reverse order so insertions don't shift positions
    for i, (start, end, url) in reversed(list(enumerate(audio_matches))):
        part_num = i + 1
        print(f"\n  Part {part_num}:")
        tmp_path = None
        try:
            tmp_path, mime = download_audio(url)
            transcript = transcribe_with_gemini(tmp_path, mime)
            print(f"    [OK] Transcript length: {len(transcript)} chars")

            # Insert transcript into content
            content = insert_transcript(content, end, transcript)

            # Rate limiting - be gentle with the API
            time.sleep(2)

        except Exception as e:
            print(f"    [FAIL] Error on Part {part_num}: {e}")
        finally:
            if tmp_path and os.path.exists(tmp_path):
                os.remove(tmp_path)

    # Save the updated file
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"\n  [OK] Saved {filename} with transcripts")


def main():
    files = sorted([
        f for f in os.listdir(QUESTIONS_DIR)
        if f.startswith("cefr-listening-test-") and f.endswith(".js")
    ])

    print(f"Found {len(files)} CEFR listening test files")
    print(f"Total audio parts to transcribe: {len(files) * 6}")

    for filename in files:
        filepath = os.path.join(QUESTIONS_DIR, filename)
        process_test_file(filepath)

    print(f"\n{'='*60}")
    print("All done! Transcripts have been saved to the JS files.")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
