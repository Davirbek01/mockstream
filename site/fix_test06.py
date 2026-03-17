"""Fix missing transcript for IELTS test 06, Part 2."""
import re, json, urllib.request, ssl, base64

API_KEY = "AIzaSyA1y9LU2Iyojc343iQYUjyVM-2jGx1qVV4"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"
ctx = ssl.create_default_context()

filepath = "questions IELTS L/ielts-listening-test-06.js"
url = "https://storage.googleapis.com/mockstream-listening-audio/IELTS%20listening/test6/2.mp3"

print("Downloading...")
resp = urllib.request.urlopen(urllib.request.Request(url), context=ctx)
audio_data = resp.read()
audio_b64 = base64.b64encode(audio_data).decode("utf-8")

print("Transcribing...")
payload = {
    "contents": [{
        "parts": [
            {"inlineData": {"mimeType": "audio/mpeg", "data": audio_b64}},
            {"text": "Transcribe this audio exactly and completely. Include all spoken words. If there are multiple speakers, label them (e.g., Speaker 1, Speaker 2, Narrator). Output only the transcript text, nothing else."}
        ]
    }]
}
data = json.dumps(payload).encode("utf-8")
req = urllib.request.Request(GEMINI_URL, data=data, headers={"Content-Type": "application/json"}, method="POST")
result = json.loads(urllib.request.urlopen(req, context=ctx).read().decode("utf-8"))
transcript = result["candidates"][0]["content"]["parts"][0]["text"].strip()
print(f"Got {len(transcript)} chars")

# Read file
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Find the second audioFile (Part 2) that doesn't have a transcript after it
matches = list(re.finditer(r'audioFile:\s*"[^"]+"', content))
m = matches[1]  # Part 2 = index 1
line_end = content.index("\n", m.end())

# Check if transcript already exists on next line
next_line = content[line_end+1:content.index("\n", line_end+1)].strip()
if next_line.startswith("transcript:"):
    print("Transcript already exists for Part 2, skipping.")
else:
    escaped = transcript.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
    insert_text = f'\n      transcript: "{escaped}",'
    content = content[:line_end] + insert_text + content[line_end:]
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("Done! Saved test 06 with Part 2 transcript.")
