import requests, base64, json, sys, time

API_KEY = "AIzaSyCfnYXgCySMlckKOdJw6vzRDlBVvJvZrZo"
MODEL = "gemini-2.0-flash"

URLS = {
    "section_1": "https://storage.googleapis.com/mockstream-listening-audio/IELTS%20listening/test36/TEST%208%20(1).mp3",
    "section_2": "https://storage.googleapis.com/mockstream-listening-audio/IELTS%20listening/test36/TEST%208%20(2).mp3",
    "section_3": "https://storage.googleapis.com/mockstream-listening-audio/IELTS%20listening/test36/TEST%208%20(3).mp3",
    "section_4": "https://storage.googleapis.com/mockstream-listening-audio/IELTS%20listening/test36/TEST%208%20(4).mp3",
}

PROMPT = (
    "Transcribe this IELTS listening audio EXACTLY as spoken, word for word. "
    "Include all speaker labels (Narrator, Man, Woman, Speaker, etc). "
    "Use \\n for line breaks between speaker turns. "
    "Do NOT summarize or paraphrase. Transcribe everything."
)

results = {}
for section, url in URLS.items():
    print(f"\n{'='*50}")
    print(f"Downloading {section}...")
    audio = requests.get(url, timeout=120)
    print(f"  Size: {len(audio.content)} bytes")
    b64 = base64.b64encode(audio.content).decode()

    print(f"Transcribing {section}...")
    resp = requests.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}",
        json={
            "contents": [{"parts": [
                {"inline_data": {"mime_type": "audio/mpeg", "data": b64}},
                {"text": PROMPT}
            ]}],
            "generationConfig": {"temperature": 0.1, "maxOutputTokens": 8192}
        },
        timeout=300
    )
    if resp.status_code != 200:
        print(f"  ERROR {resp.status_code}: {resp.text[:300]}")
        sys.exit(1)
    
    text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
    results[section] = text
    print(f"  OK: {len(text)} chars")
    time.sleep(2)

with open("test36_transcripts.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"\nAll done! Saved to test36_transcripts.json")
for k, v in results.items():
    print(f"  {k}: {len(v)} chars")
