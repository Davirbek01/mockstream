"""
Transcribe IELTS Listening audio for tests 48, 49, 50 using Gemini API.
Downloads each part's audio, sends to Gemini, inserts transcript into JS files.
"""

import os
import re
import json
import time
import sys
import tempfile
import urllib.request
import urllib.parse
import ssl
import base64

API_KEY = "AIzaSyA_5cnPFwirsJC9K5Clsc9ka3wCbqHkTNE"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"

QUESTIONS_DIR = os.path.join(os.path.dirname(__file__), "questions IELTS L")
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


def transcribe_with_gemini(audio_path, mime_type):
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
                        "Transcribe this IELTS listening audio exactly and completely. "
                        "Include all spoken words faithfully. "
                        "If there are multiple speakers, label them (e.g., Narrator:, Speaker 1:, Speaker 2:, Man:, Woman:). "
                        "Each speaker turn should be on its own line. "
                        "Output only the transcript text, no markdown formatting, no extra commentary."
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
    resp = urllib.request.urlopen(req, context=ctx, timeout=300)
    result = json.loads(resp.read().decode("utf-8"))
    text = result["candidates"][0]["content"]["parts"][0]["text"]
    return text.strip()


def process_test_file(filepath):
    filename = os.path.basename(filepath)
    print(f"\n{'='*60}")
    print(f"Processing: {filename}")
    print(f"{'='*60}")

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Extract audio URLs (quoted keys)
    audio_pattern = r'"audioFile"\s*:\s*"([^"]+)"'
    audio_urls = [m.group(1) for m in re.finditer(audio_pattern, content)]

    # Find all empty transcript positions
    empty_pattern = r'"transcript"\s*:\s*""'
    empty_matches = list(re.finditer(empty_pattern, content))

    if not empty_matches:
        print(f"  [SKIP] No empty transcripts found in {filename}")
        return

    print(f"  Found {len(empty_matches)} empty transcripts, {len(audio_urls)} audio parts")

    # Process in reverse order so insertions don't shift positions
    for i in range(len(empty_matches) - 1, -1, -1):
        part_num = i + 1
        m = empty_matches[i]
        audio_url = audio_urls[i] if i < len(audio_urls) else None

        if not audio_url:
            print(f"  Part {part_num}: [SKIP] No audio URL found")
            continue

        print(f"\n  Part {part_num} (audio: ...{audio_url[-40:]})")

        tmp_path = None
        try:
            tmp_path, mime = download_audio(audio_url)
            transcript = transcribe_with_gemini(tmp_path, mime)
            print(f"    [OK] Transcript length: {len(transcript)} chars")

            # Escape backticks and ${} for JS template literal safety
            safe_transcript = transcript.replace('`', "'").replace('${', '$\\{')

            # Replace "transcript": "" with "transcript": `...`
            replacement = f'"transcript": `{safe_transcript}`'
            content = content[:m.start()] + replacement + content[m.end():]

            time.sleep(3)  # Rate limiting

        except Exception as e:
            print(f"    [FAIL] Error on Part {part_num}: {e}")
            import traceback
            traceback.print_exc()
        finally:
            if tmp_path and os.path.exists(tmp_path):
                os.remove(tmp_path)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"\n  [SAVED] {filename}")


def main():
    tests = sys.argv[1:] if len(sys.argv) > 1 else ["48", "49", "50"]
    for test_num in tests:
        filepath = os.path.join(QUESTIONS_DIR, f"ielts-listening-test-{test_num}.js")
        if not os.path.exists(filepath):
            print(f"[ERROR] File not found: {filepath}")
            continue
        process_test_file(filepath)

    print("\n\nDone!")


if __name__ == "__main__":
    main()
