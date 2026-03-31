"""
Translate CEFR Speaking sample answers to Uzbek using Gemini API.
Adds uzSampleAnswer, uzSampleA1, uzSampleA2, uzSampleB1, uzSampleB2 fields.
"""

import json
import re
import time
import sys
import requests

API_KEY = "AIzaSyCfnYXgCySMlckKOdJw6vzRDlBVvJvZrZo"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"

def call_gemini(prompt, retries=3):
    """Call Gemini API with retry logic."""
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 4096
        }
    }
    for attempt in range(retries):
        try:
            resp = requests.post(GEMINI_URL, json=payload, timeout=60)
            resp.raise_for_status()
            data = resp.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return text.strip()
        except Exception as e:
            print(f"  ⚠ Attempt {attempt+1} failed: {e}")
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
    return None


def translate_sample(english_html, level_label, question_prompt):
    """Translate a single sample answer HTML to Uzbek via Gemini."""
    prompt = f"""You are a professional English-to-Uzbek translator. Translate the following IELTS/CEFR speaking sample answer into accurate, natural Uzbek.

RULES:
1. This is a LITERAL translation — preserve the meaning and structure faithfully
2. Keep the same paragraph structure (preserve <p> tags)
3. REMOVE all <span> tags and their class attributes — just keep the text inside them
4. The translation should sound natural in Uzbek, not word-for-word robotic
5. Keep any quoted proverbs/sayings and translate them too
6. Output ONLY the translated HTML (with <p> tags), nothing else — no explanation, no preamble
7. This is a {level_label} level answer to the question: "{question_prompt}"

English HTML to translate:
{english_html}"""

    result = call_gemini(prompt)
    if result:
        # Clean up any markdown code fences Gemini might add
        result = re.sub(r'^```html?\s*', '', result)
        result = re.sub(r'\s*```$', '', result)
        result = result.strip()
    return result


def process_file(filepath):
    """Process a single questions JS file."""
    print(f"\n📂 Processing: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract the JSON object from window.SPEAKING_TEST_DATA = {...}
    match = re.search(r'window\.SPEAKING_TEST_DATA\s*=\s*(\{.*\})\s*;?\s*$', content, re.DOTALL)
    if not match:
        print("❌ Could not parse SPEAKING_TEST_DATA")
        return False
    
    json_str = match.group(1)
    data = json.loads(json_str)
    
    questions = data.get("questions", [])
    print(f"   Found {len(questions)} questions")
    
    sample_keys = [
        ("sampleAnswer", "uzSampleAnswer", "C1/C2"),
        ("sampleA1", "uzSampleA1", "A1"),
        ("sampleA2", "uzSampleA2", "A2"),
        ("sampleB1", "uzSampleB1", "B1"),
        ("sampleB2", "uzSampleB2", "B2"),
    ]
    
    total_translations = 0
    
    for q in questions:
        qnum = q.get("number", "?")
        prompt_text = q.get("prompt", "")
        print(f"\n   🔄 Question {qnum}: {prompt_text[:60]}...")
        
        for eng_key, uz_key, level in sample_keys:
            if eng_key not in q or not q[eng_key]:
                continue
            
            # Skip if already translated
            if uz_key in q and q[uz_key]:
                print(f"      ✅ {level} already translated, skipping")
                continue
            
            print(f"      🌐 Translating {level}...", end=" ", flush=True)
            translated = translate_sample(q[eng_key], level, prompt_text)
            
            if translated:
                q[uz_key] = translated
                total_translations += 1
                print(f"Done ({len(translated)} chars)")
            else:
                print("FAILED")
            
            # Rate limit: small delay between calls
            time.sleep(1)
    
    # Write back
    prefix = content[:match.start()]
    new_json = json.dumps(data, ensure_ascii=False, indent=2)
    new_content = prefix + "window.SPEAKING_TEST_DATA = " + new_json + ";"
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"\n   ✅ Saved! {total_translations} translations added.")
    return True


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "questions S/questions.js"
    process_file(target)
