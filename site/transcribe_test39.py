import requests, json, base64, time, os

API_KEY = "AIzaSyCfnYXgCySMlckKOdJw6vzRDlBVvJvZrZo"
MODEL = "gemini-2.0-flash"
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"

AUDIO_URLS = {
    "section_1": "https://storage.googleapis.com/mockstream-listening-audio/IELTS%20listening/test39/TEST%201%20(1).mp3",
    "section_2": "https://storage.googleapis.com/mockstream-listening-audio/IELTS%20listening/test39/TEST%201%20(2).mp3",
    "section_3": "https://storage.googleapis.com/mockstream-listening-audio/IELTS%20listening/test39/TEST%201%20(3).mp3",
    "section_4": "https://storage.googleapis.com/mockstream-listening-audio/IELTS%20listening/test39/TEST%201%20(4).mp3",
}

PROMPT = (
    "Transcribe this IELTS listening audio EXACTLY as spoken. "
    "Include all speaker changes (e.g. 'Narrator:', 'Man:', 'Woman:', 'Speaker 1:', etc.). "
    "Use \\n for line breaks between sentences/speaker changes. "
    "Do NOT add timestamps. Do NOT summarize. Transcribe EVERY word."
)

results = {}

for section, url in AUDIO_URLS.items():
    print(f"\n{'='*50}")
    print(f"Transcribing {section}...")
    print(f"Downloading audio from: {url}")
    
    try:
        audio_resp = requests.get(url, timeout=120)
        audio_resp.raise_for_status()
        audio_b64 = base64.b64encode(audio_resp.content).decode("utf-8")
        print(f"  Audio downloaded: {len(audio_resp.content)} bytes")
    except Exception as e:
        print(f"  ERROR downloading audio: {e}")
        results[section] = ""
        continue
    
    payload = {
        "contents": [{
            "parts": [
                {"inline_data": {"mime_type": "audio/mpeg", "data": audio_b64}},
                {"text": PROMPT}
            ]
        }],
        "generationConfig": {"temperature": 0.1, "maxOutputTokens": 8192}
    }
    
    try:
        resp = requests.post(API_URL, json=payload, timeout=300)
        resp.raise_for_status()
        data = resp.json()
        transcript = data["candidates"][0]["content"]["parts"][0]["text"]
        # Clean up
        transcript = transcript.replace("```", "").strip()
        results[section] = transcript
        print(f"  OK: {len(transcript)} chars")
    except Exception as e:
        print(f"  ERROR transcribing: {e}")
        if hasattr(resp, 'text'):
            print(f"  Response: {resp.text[:500]}")
        results[section] = ""
        continue
    
    time.sleep(2)

# Save results
out_path = os.path.join(os.path.dirname(__file__), "test39_transcripts.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"\n{'='*50}")
print(f"All done! Saved to {out_path}")
for s, t in results.items():
    print(f"  {s}: {len(t)} chars")
