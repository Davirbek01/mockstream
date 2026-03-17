"""
Generate A1, A2, B1, B2 level sample answers for CEFR Writing questions using Gemini API.
Reads existing C1/C2 samples, generates lower-level versions, and saves them as new fields.
"""

import os
import re
import json
import time
import urllib.request
import ssl

API_KEY = "AIzaSyA1y9LU2Iyojc343iQYUjyVM-2jGx1qVV4"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"
QUESTIONS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "questions W")

ctx = ssl.create_default_context()

PROMPT_TEMPLATE = """You are a CEFR language expert. I will give you a writing exam task (including scenario/context) and its C1/C2 level sample answer.

Generate 4 sample answers at these CEFR levels: A1, A2, B1, B2.

IMPORTANT RULES:
- Each level must sound NATURAL for that level — do NOT make A1 sound like B1, or B1 sound like C1.
- A1: Very basic vocabulary. Very short, simple sentences. Present tense mostly. Can write very basic personal information. Many grammatical mistakes are acceptable. Much shorter than the target word count.
- A2: Simple vocabulary. Short sentences joined with "and", "but", "because". Can describe familiar topics simply. Some basic connectors. Somewhat shorter than target.
- B1: Intermediate vocabulary. Can express opinions with "I think", "In my opinion". Uses some linking words like "however", "also", "for example". Some variety in sentence structure. Approaching the target word count.
- B2: Upper-intermediate vocabulary. Can discuss abstract topics. Uses complex sentences, varied connectors, some less common vocabulary. Shows good range but NOT as polished as C1. Meets or slightly exceeds the target word count.
- Keep the same topic/task but adjust complexity naturally.
- Use HTML formatting: <p> for paragraphs, <br> for line breaks within paragraphs where appropriate.
- Do NOT use any <span> tags, class attributes, or ml-token markup — just plain text inside <p>/<br> tags.
- For letters, keep the appropriate greeting/closing for each level (A1 might just say "Hi" and "Bye", B2 would use proper letter conventions).
- Answer naturally and authentically for each level.

Context/Scenario: {context}

Task: {task_prompt}
Target length: {target}

C1/C2 Sample (for reference — do NOT copy, create fresh answers):
{sample_text}

Return ONLY a valid JSON object with exactly this format (no markdown, no code fences):
{{"A1": "<p>...</p>", "A2": "<p>...</p>", "B1": "<p>...</p>", "B2": "<p>...</p>"}}
"""


def strip_html_tags(html):
    """Remove HTML tags to get plain text for the prompt."""
    return re.sub(r'<[^>]+>', ' ', html).replace('  ', ' ').strip()


def call_gemini(prompt, retries=3):
    """Send prompt to Gemini and return response text."""
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "topP": 0.9
        }
    }
    data = json.dumps(payload).encode("utf-8")
    for attempt in range(retries):
        try:
            req = urllib.request.Request(
                GEMINI_URL, data=data,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            resp = urllib.request.urlopen(req, context=ctx, timeout=60)
            result = json.loads(resp.read().decode("utf-8"))
            return result["candidates"][0]["content"]["parts"][0]["text"].strip()
        except Exception as e:
            if attempt < retries - 1:
                wait = (attempt + 1) * 5
                print(f"      Retry {attempt+1}/{retries} after error: {e}, waiting {wait}s")
                time.sleep(wait)
            else:
                raise


def parse_json_response(text):
    """Extract JSON from Gemini response, stripping code fences if present."""
    text = re.sub(r'^```(?:json)?\s*\n?', '', text)
    text = re.sub(r'\n?```\s*$', '', text)
    text = text.strip()
    return json.loads(text)


def load_js_data(filepath):
    """Load a writing questions JS file and return the JSON data."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    match = re.search(r'window\.WRITING_TEST_DATA\s*=\s*', content)
    if not match:
        raise ValueError("Could not find WRITING_TEST_DATA assignment")
    json_str = content[match.end():].rstrip().rstrip(';')
    return json.loads(json_str)


def save_js_data(filepath, data):
    """Save the data back to a JS file."""
    header = (
        "// ================================================================================\n"
        "// WRITING MOCK TEST - QUESTIONS DATA\n"
        "// ================================================================================\n"
        "// This file contains all question content for the Writing Mock Test\n"
        "// Update this file to change questions across all writing mocks automatically\n"
        "// ================================================================================\n\n"
    )
    json_str = json.dumps(data, indent=2, ensure_ascii=False)
    content = header + "window.WRITING_TEST_DATA = " + json_str + ";\n"
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)


def process_file(filepath):
    """Process a single writing questions JS file."""
    filename = os.path.basename(filepath)
    print(f"\n{'='*60}")
    print(f"Processing: {filename}")
    print(f"{'='*60}")

    data = load_js_data(filepath)
    tasks = data.get("tasks", {})

    if not tasks:
        print(f"  [WARN] No tasks found in {filename}")
        return

    # Skip if already has level samples
    if tasks.get("t11", {}).get("sampleA1"):
        print(f"  [SKIP] Level samples already exist in {filename}")
        return

    # Build context string from scenario
    context_parts = []
    if tasks.get("p1_context"):
        context_parts.append(tasks["p1_context"])
    if tasks.get("p1_scenario"):
        context_parts.append(tasks["p1_scenario"])
    context = "\n".join(context_parts) if context_parts else "General writing task"

    task_keys = ["t11", "t12", "t2"]
    for task_key in task_keys:
        task = tasks.get(task_key)
        if not task or not task.get("sample"):
            print(f"  [WARN] No sample for {task_key}")
            continue

        prompt_text = task.get("prompt", "")
        target = task.get("target", "")
        sample = task.get("sample", "")
        plain_sample = strip_html_tags(sample)

        print(f"\n  {task_key.upper()}: {prompt_text[:60]}...")

        try:
            prompt = PROMPT_TEMPLATE.format(
                context=context,
                task_prompt=prompt_text,
                target=target,
                sample_text=plain_sample[:3000]
            )
            response = call_gemini(prompt)
            levels = parse_json_response(response)

            for key in ["A1", "A2", "B1", "B2"]:
                if key not in levels:
                    raise ValueError(f"Missing {key} in response")

            task["sampleA1"] = levels["A1"]
            task["sampleA2"] = levels["A2"]
            task["sampleB1"] = levels["B1"]
            task["sampleB2"] = levels["B2"]

            print(f"    [OK] A1({len(levels['A1'])}), A2({len(levels['A2'])}), B1({len(levels['B1'])}), B2({len(levels['B2'])}) chars")

            time.sleep(1)

        except Exception as e:
            print(f"    [FAIL] {task_key}: {e}")

    save_js_data(filepath, data)
    print(f"\n  [SAVED] {filename}")


def main():
    files = sorted([
        f for f in os.listdir(QUESTIONS_DIR)
        if f.startswith("writing-questions") and f.endswith(".js")
    ])

    print(f"Found {len(files)} writing question files")
    print(f"Tasks per file: 3 (t11, t12, t2)")
    print(f"Estimated API calls: ~{len(files) * 3}")

    for filename in files:
        filepath = os.path.join(QUESTIONS_DIR, filename)
        process_file(filepath)

    print("\n\nAll done!")


if __name__ == "__main__":
    main()
