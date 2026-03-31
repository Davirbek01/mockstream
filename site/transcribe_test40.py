"""Transcribe IELTS Listening Test 40 audio files using Gemini API."""
import os, json, time, tempfile, urllib.request, urllib.parse, ssl, base64

API_KEY = "AIzaSyC61g88nXtTAlY53GVKl4HE-gjzAvz1T-o"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"
ctx = ssl.create_default_context()

AUDIO_URLS = [
    "https://storage.googleapis.com/mockstream-listening-audio/IELTS%20listening/test40/TEST%202%20(1).mp3",
    "https://storage.googleapis.com/mockstream-listening-audio/IELTS%20listening/test40/TEST%202%20(2).mp3",
    "https://storage.googleapis.com/mockstream-listening-audio/IELTS%20listening/test40/TEST%202%20(3).mp3",
    "https://storage.googleapis.com/mockstream-listening-audio/IELTS%20listening/test40/TEST%202%20(4).mp3",
]

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

def download_audio(url):
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
    print(f"  Downloading: {url[:80]}...")
    req = urllib.request.Request(url)
    resp = urllib.request.urlopen(req, context=ctx)
    tmp.write(resp.read())
    tmp.close()
    size_mb = os.path.getsize(tmp.name) / (1024*1024)
    print(f"  Downloaded: {size_mb:.1f} MB")
    return tmp.name

def transcribe(audio_path):
    with open(audio_path, "rb") as f:
        audio_b64 = base64.b64encode(f.read()).decode("utf-8")

    payload = {
        "contents": [{
            "parts": [
                {"inlineData": {"mimeType": "audio/mpeg", "data": audio_b64}},
                {"text": (
                    "Transcribe this IELTS listening audio exactly and completely. "
                    "Include ALL spoken words verbatim. Label each speaker clearly "
                    "(e.g., Narrator:, Man:, Woman:, Speaker 1:). "
                    "Use proper punctuation and paragraph breaks between speaker turns. "
                    "Output ONLY the transcript text, nothing else."
                )}
            ]
        }],
        "generationConfig": {"maxOutputTokens": 8192}
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(GEMINI_URL, data=data,
                                headers={"Content-Type": "application/json"}, method="POST")
    print("  Sending to Gemini for transcription...")
    resp = urllib.request.urlopen(req, context=ctx, timeout=120)
    result = json.loads(resp.read().decode("utf-8"))
    return result["candidates"][0]["content"]["parts"][0]["text"].strip()

for i, url in enumerate(AUDIO_URLS, 1):
    print(f"\n{'='*50}")
    print(f"Section {i}")
    print(f"{'='*50}")
    tmp = download_audio(url)
    try:
        transcript = transcribe(tmp)
        out_file = os.path.join(OUTPUT_DIR, f"test40_s{i}.txt")
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(transcript)
        print(f"  Saved: test40_s{i}.txt ({len(transcript)} chars)")
    except Exception as e:
        print(f"  ERROR: {e}")
        import traceback; traceback.print_exc()
    finally:
        os.remove(tmp)
    time.sleep(3)

print("\n\nAll sections transcribed!")
