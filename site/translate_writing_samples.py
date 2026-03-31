"""
Translate CEFR Writing sample answers to Uzbek using Gemini API.
Adds uzSample, uzSampleA1, uzSampleA2, uzSampleB1, uzSampleB2 fields to each task.
"""

import json
import re
import time
import sys
import requests

API_KEY = "AIzaSyCfnYXgCySMlckKOdJw6vzRDlBVvJvZrZo"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"


def call_gemini(prompt, retries=3):
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 4096}
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


def translate_sample(english_html, level_label, task_prompt):
    prompt = f"""You are a professional English-to-Uzbek translator. Translate the following CEFR writing sample answer into accurate, natural Uzbek.

RULES:
1. This is a LITERAL translation — preserve the meaning and structure faithfully
2. Keep the same paragraph structure (preserve <p>, <br> tags)
3. REMOVE all <span> tags and their class attributes — just keep the text inside them
4. REMOVE any <!DOCTYPE>, <html>, <head>, <style>, <body> wrappers — output ONLY the inner content paragraphs
5. REMOVE any markdown code fences (```html or ```)
6. The translation should sound natural in Uzbek, not word-for-word robotic
7. Output ONLY the translated HTML content (with <p> tags), nothing else — no explanation, no preamble
8. This is a {level_label} level answer to the task: "{task_prompt}"

English HTML to translate:
{english_html}"""

    result = call_gemini(prompt)
    if result:
        result = re.sub(r'^```html?\s*', '', result)
        result = re.sub(r'\s*```$', '', result)
        result = result.strip()
    return result


def process_file(filepath):
    print(f"\n📂 Processing: {filepath}")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    match = re.search(r'window\.WRITING_TEST_DATA\s*=\s*(\{.*\})\s*;?\s*$', content, re.DOTALL)
    if not match:
        print("❌ Could not parse WRITING_TEST_DATA")
        return False

    data = json.loads(match.group(1))
    tasks = data.get("tasks", {})

    task_keys = ["t11", "t12", "t2"]
    sample_keys = [
        ("sample", "uzSample", "C1/C2"),
        ("sampleA1", "uzSampleA1", "A1"),
        ("sampleA2", "uzSampleA2", "A2"),
        ("sampleB1", "uzSampleB1", "B1"),
        ("sampleB2", "uzSampleB2", "B2"),
    ]

    total_translations = 0

    for tk in task_keys:
        task = tasks.get(tk)
        if not task:
            continue
        prompt_text = task.get("prompt", "")
        print(f"\n   🔄 Task {tk}: {prompt_text[:60]}...")

        for eng_key, uz_key, level in sample_keys:
            if eng_key not in task or not task[eng_key]:
                continue

            if uz_key in task and task[uz_key]:
                print(f"      ✅ {level} already translated, skipping")
                continue

            print(f"      🌐 Translating {level}...", end=" ", flush=True)
            translated = translate_sample(task[eng_key], level, prompt_text)

            if translated:
                task[uz_key] = translated
                total_translations += 1
                print(f"Done ({len(translated)} chars)")
            else:
                print("FAILED")

            time.sleep(1)

    # Write back
    prefix = content[:match.start()]
    new_json = json.dumps(data, ensure_ascii=False, indent=2)
    new_content = prefix + "window.WRITING_TEST_DATA = " + new_json + ";"

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"\n   ✅ Saved! {total_translations} translations added.")
    return True


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "questions W/writing-questions.js"
    process_file(target)
