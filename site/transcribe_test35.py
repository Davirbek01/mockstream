"""Transcribe IELTS Listening Test 35 audio files using Gemini API."""
import requests
import base64
import time
import json
import os

API_KEY = "AIzaSyCfnYXgCySMlckKOdJw6vzRDlBVvJvZrZo"
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"

AUDIO_URLS = [
    "https://storage.googleapis.com/mockstream-listening-audio/IELTS%20listening/test35/TEST%207%20(1).mp3",
    "https://storage.googleapis.com/mockstream-listening-audio/IELTS%20listening/test35/TEST%207%20(2).mp3",
    "https://storage.googleapis.com/mockstream-listening-audio/IELTS%20listening/test35/TEST%207%20(3).mp3",
    "https://storage.googleapis.com/mockstream-listening-audio/IELTS%20listening/test35/TEST%207%20(4).mp3",
]

PROMPT = """You are transcribing an IELTS Listening test audio. 
Transcribe the ENTIRE audio word-for-word, including all narrator instructions, speaker labels, pauses, etc.
Format as a continuous transcript with speaker labels where identifiable (e.g., "Narrator:", "Speaker 1:", "Speaker 2:", "Man:", "Woman:", etc.).
Each speaker turn should be on a new line ending with \\n.
Be extremely accurate - this is for an exam and every word matters.
Do NOT add any commentary or notes - just the pure transcript."""

def transcribe_audio(url, section_num):
    print(f"\n{'='*60}")
    print(f"Section {section_num}: Downloading audio from {url[:80]}...")
    
    resp = requests.get(url, timeout=120)
    resp.raise_for_status()
    audio_bytes = resp.content
    print(f"  Downloaded {len(audio_bytes)} bytes ({len(audio_bytes)/1024/1024:.1f} MB)")
    
    audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
    
    payload = {
        "contents": [{
            "parts": [
                {"text": PROMPT},
                {
                    "inline_data": {
                        "mime_type": "audio/mpeg",
                        "data": audio_b64
                    }
                }
            ]
        }],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 8192
        }
    }
    
    print(f"  Sending to Gemini API ({len(audio_b64)/1024:.0f} KB base64)...")
    api_resp = requests.post(API_URL, json=payload, timeout=300)
    api_resp.raise_for_status()
    
    result = api_resp.json()
    transcript = result['candidates'][0]['content']['parts'][0]['text']
    print(f"  Transcript received: {len(transcript)} chars")
    
    return transcript

def main():
    transcripts = {}
    for i, url in enumerate(AUDIO_URLS, 1):
        transcript = transcribe_audio(url, i)
        transcripts[f"section_{i}"] = transcript
        
        # Save intermediate results
        with open("test35_transcripts.json", "w", encoding="utf-8") as f:
            json.dump(transcripts, f, ensure_ascii=False, indent=2)
        
        if i < len(AUDIO_URLS):
            print(f"  Waiting 5s before next section...")
            time.sleep(5)
    
    print(f"\n{'='*60}")
    print(f"All {len(transcripts)} sections transcribed!")
    print(f"Saved to test35_transcripts.json")
    
    # Print previews
    for key, val in transcripts.items():
        print(f"\n--- {key} (first 300 chars) ---")
        print(val[:300])

if __name__ == "__main__":
    main()
