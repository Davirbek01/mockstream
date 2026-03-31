"""
Batch generate LEVELED grammar tests for ALL grammar topics using Gemini API.
Each topic: 3 levels (Intermediate B1-B2, Upper-Intermediate B2-C1, Advanced C1-C2) × 30 questions = 90 questions
Resume-capable: skips topics that already have all 3 level files.
Rate limited: 5-second delay between API calls.

Usage:
  python generate_all_grammar_test_levels.py              # Process all remaining topics
"""
import requests, json, time, re, os, sys
from datetime import datetime

API_KEY = "AIzaSyAgsMeOT8t-8AGcEE0QWgh4VLubxti7xL8"
MODEL = "gemini-2.0-flash"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"
LOG_FILE = "batch_grammar_test_levels_log.txt"
PROGRESS_FILE = "batch_grammar_test_levels_progress.json"
OUTPUT_DIR = "questions G"

LEVELS = [
    {
        "name": "Intermediate",
        "slug": "intermediate",
        "cefr": "B1–B2",
        "description": (
            "Intermediate level (B1–B2). Test FUNDAMENTAL understanding of this grammar topic. "
            "Use simple, everyday vocabulary (go, eat, want, make, live, work, etc.). "
            "NEVER use complex or rare words like 'adjourned', 'stipulate', 'imperative'. "
            "Contexts: daily conversations, short emails, simple stories, common situations. "
            "Wrong options = TYPICAL B1-B2 mistakes (wrong tense, wrong form, missing article). "
            "Focus on the MAIN rules only — no exceptions or rare patterns."
        )
    },
    {
        "name": "Upper-Intermediate",
        "slug": "upper-intermediate",
        "cefr": "B2–C1",
        "description": (
            "Upper-Intermediate level (B2–C1). Test MORE NUANCED understanding of this grammar topic. "
            "Use wider but still common vocabulary — nothing obscure. "
            "Test: common exceptions, subtle differences between similar structures, context-dependent choices. "
            "Contexts: news articles, workplace emails, academic settings, podcasts. "
            "Wrong options should LOOK correct but violate a more advanced rule."
        )
    },
    {
        "name": "Advanced",
        "slug": "advanced",
        "cefr": "C1–C2",
        "description": (
            "Advanced level (C1–C2). Test SOPHISTICATED MASTERY of this grammar topic. "
            "Use academic/formal register but keep sentences readable — not excessively long. "
            "Test: rare patterns, formal register, subtle distinctions, edge cases. "
            "Contexts: academic papers, formal letters, quality journalism, professional documents. "
            "Wrong options should require near-native discrimination to reject."
        )
    }
]

PROMPT_TEMPLATE = """You are an expert English grammar teacher creating a multiple-choice grammar test.

Grammar Topic: "{topic}"
Level: {level_name} ({cefr})
{level_desc}

Generate EXACTLY 30 MCQ grammar questions as a JSON array.

QUESTION TYPES — use a mix of ALL 4 (roughly 7-8 each):

1. "Fill in the blank:" — Short sentence with <b>___</b> for the blank. Student picks the correct grammar form.
   Example question: "She <b>___</b> to school every day."
   Example options: ["goes", "go", "going", "gone"]

2. "Choose the correct option:" — Short sentence with <b>___</b>. Student picks the right word/form.
   Example question: "He <b>___</b> here since 2010."
   Example options: ["has lived", "lived", "is living", "lives"]

3. "Find the error:" — A sentence containing ONE grammar error. The question shows the sentence and asks "Which underlined word is wrong?" — wrap each tested word with <b> tags.
   Example question: "She <b>have</b> been <b>waiting</b> for two <b>hours</b> <b>already</b>."
   Example correct: "have"  (because it should be "has")
   Example options: ["have", "waiting", "hours", "already"]

4. "Complete with the correct form:" — Give a base word in brackets and a sentence with <b>___</b>. Student picks the correct derived form.
   Example question: "(teach) He <b>___</b> English for 10 years."
   Example options: ["has taught", "has teached", "taught", "is teaching"]

Each question MUST have these exact JSON fields:
- "type": one of the 4 types above (string)
- "question": the question text with <b> tags for highlighting key words, blanks, or error candidates (string)
- "correct": the correct answer (string, plain text, NO HTML)
- "options": array of exactly 4 strings — CORRECT answer MUST be FIRST, then 3 wrong. Options are plain text, NO HTML.
- "def": SHORT English explanation of the grammar rule (max 15 words)
- "level": "{cefr}"

CRITICAL FORMATTING RULES:
1. Keep questions SHORT — max 15 words per sentence. No long paragraphs.
2. Keep options SHORT — max 6 words per option. Single words or short phrases only.
3. Use <b>___</b> for blanks (not plain ___).
4. Use <b>word</b> to highlight key grammar words or error candidates in the question.
5. Options must be PLAIN TEXT — no <b> tags in options.
6. All 4 options must be plausible. Wrong answers = common grammar mistakes at THIS level.
7. The correct answer MUST be the FIRST element in "options".
8. Every question must test the grammar topic "{topic}" — be relevant.
9. No duplicate questions. Test DIFFERENT sub-rules of the topic.
10. Every question must have EXACTLY ONE correct answer.
11. "def" = brief explanation of WHY the answer is correct.
12. Do NOT use rare or complex vocabulary at Intermediate level.

Return ONLY a valid JSON array starting with [ and ending with ]. No markdown, no code fences."""


def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(line + '\n')


def parse_grammar_topics():
    """Parse all grammar test topics from landing.html."""
    with open('landing.html', 'r', encoding='utf-8') as f:
        content = f.read()

    match = re.search(r'const grammarTests = \[(.*?)\];', content, re.DOTALL)
    if not match:
        raise ValueError("Could not find grammarTests in landing.html")

    block = match.group(1)
    topics = []
    seen_slugs = set()

    for line in block.split('\n'):
        m = re.search(r"test=([^&']+)&type=grammar.*?name:\s*'([^']+)'.*?icon:\s*'([^']+)'", line)
        if m:
            slug, name, icon = m.groups()
            if slug in seen_slugs:
                continue
            seen_slugs.add(slug)
            topics.append({
                'slug': slug,
                'name': name,
                'icon': icon
            })

    return topics


def is_topic_complete(slug):
    """Check if all 3 level files exist for a topic."""
    for level in LEVELS:
        path = os.path.join(OUTPUT_DIR, f"{slug}-{level['slug']}.js")
        if not os.path.exists(path):
            return False
    return True


def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"completed": [], "failed": []}


def save_progress(progress):
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(progress, f, indent=2, ensure_ascii=False)


def generate_level(topic_name, level_info):
    """Generate 30 grammar questions for one level of a topic."""
    all_valid = []
    attempts = 0
    max_attempts = 3

    while len(all_valid) < 30 and attempts < max_attempts:
        attempts += 1
        if attempts > 1:
            log(f"      Retry #{attempts} — need {30 - len(all_valid)} more questions...")
            time.sleep(5)

        need = 30 - len(all_valid)
        # Ask for extra to account for invalid ones
        ask_count = min(35, need + 5) if attempts > 1 else 30

        current_prompt = PROMPT_TEMPLATE.format(
            topic=topic_name,
            level_name=level_info["name"],
            cefr=level_info["cefr"],
            level_desc=level_info["description"]
        )

        if attempts > 1:
            current_prompt = current_prompt.replace(
                "Generate EXACTLY 30 MCQ",
                f"Generate EXACTLY {ask_count} MCQ"
            )

        payload = {
            "contents": [{"parts": [{"text": current_prompt}]}],
            "generationConfig": {
                "temperature": 0.8,
                "maxOutputTokens": 8192
            }
        }

        try:
            resp = requests.post(URL, json=payload, timeout=120)

            if resp.status_code == 429:
                log(f"      Rate limited (429). Waiting 60s...")
                time.sleep(60)
                resp = requests.post(URL, json=payload, timeout=120)

            if resp.status_code != 200:
                log(f"      ERROR {resp.status_code}: {resp.text[:300]}")
                time.sleep(15)
                resp = requests.post(URL, json=payload, timeout=120)
                if resp.status_code != 200:
                    log(f"      RETRY FAILED {resp.status_code}")
                    break

            data = resp.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"].strip()

            if text.startswith("```"):
                text = re.sub(r'^```(?:json)?\s*', '', text)
                text = re.sub(r'\s*```$', '', text)

            questions = json.loads(text)

            valid_count = 0
            for q in questions:
                if len(all_valid) >= 30:
                    break
                if validate_question(q):
                    all_valid.append(q)
                    valid_count += 1

            log(f"      Got {len(questions)}, {valid_count} valid, total: {len(all_valid)}")

        except json.JSONDecodeError as e:
            log(f"      JSON parse error: {e}")
            time.sleep(10)
        except Exception as e:
            log(f"      API Error: {e}")
            time.sleep(10)

    return all_valid[:30]


def validate_question(q):
    """Validate a single question has all required fields."""
    required = ("type", "question", "correct", "options", "def")
    if not all(k in q for k in required):
        return False
    if not isinstance(q["options"], list) or len(q["options"]) != 4:
        return False
    if q["correct"] != q["options"][0]:
        return False
    # Check no empty fields
    if not q["question"].strip() or not q["correct"].strip():
        return False
    # Ensure options are not too long (max ~80 chars each)
    for opt in q["options"]:
        if len(str(opt)) > 100:
            return False
    return True


def escape_js_string(s):
    """Escape a string for use inside JS double quotes."""
    if s is None:
        return ""
    return str(s).replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n').replace('\r', '')


def build_js_file(topic, level_info, questions):
    """Build the JS test file content."""
    lines = []
    lines.append(f'// Grammar Test: {topic["name"]} — {level_info["name"]} ({level_info["cefr"]})')
    lines.append(f'// 30 MCQ questions — leveled grammar test')
    lines.append(f'// Generated via Gemini API')
    lines.append('')
    lines.append('window.ALL_QUESTIONS = [')

    for i, q in enumerate(questions):
        comma = ',' if i < len(questions) - 1 else ''
        qtype = escape_js_string(q['type'])
        question = escape_js_string(q['question'])
        correct = escape_js_string(q['correct'])
        opts = ', '.join(f'"{escape_js_string(o)}"' for o in q['options'])
        defn = escape_js_string(q['def'])
        level = escape_js_string(level_info['cefr'])

        lines.append(f'  {{type: "{qtype}", question: "{question}", correct: "{correct}", options: [{opts}], def: "{defn}", level: "{level}"}}{comma}')

    lines.append('];')
    return '\n'.join(lines)


def main():
    log("=" * 60)
    log("BATCH GRAMMAR TEST LEVELS GENERATOR")
    log(f"Model: {MODEL} | Levels per topic: 3 | Questions per level: 30")
    log("=" * 60)

    topics = parse_grammar_topics()
    progress = load_progress()

    log(f"Found {len(topics)} grammar topics in landing.html")

    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Build remaining list
    remaining = []
    for t in topics:
        if t['slug'] in progress['completed']:
            continue
        if is_topic_complete(t['slug']):
            if t['slug'] not in progress['completed']:
                progress['completed'].append(t['slug'])
                save_progress(progress)
            continue
        remaining.append(t)

    log(f"{len(remaining)} topics to process ({len(progress['completed'])} already done)")
    log(f"Estimated API calls: {len(remaining) * 3}")
    log(f"Estimated time: ~{len(remaining) * 3 * 12 // 60} minutes")

    if not remaining:
        log("Nothing to do! All topics already have level files.")
        return

    for i, topic in enumerate(remaining):
        log(f"")
        log(f"{'=' * 60}")
        log(f"TOPIC {i + 1}/{len(remaining)}: {topic['name']} ({topic['slug']})")
        log(f"{'=' * 60}")

        try:
            results = {}

            for level in LEVELS:
                # Check if this specific level file already exists
                level_path = os.path.join(OUTPUT_DIR, f"{topic['slug']}-{level['slug']}.js")
                if os.path.exists(level_path):
                    log(f"    {level['name']} — SKIP (file exists)")
                    results[level["slug"]] = None
                    continue

                log(f"    {level['name']} ({level['cefr']})...")
                questions = generate_level(topic['name'], level)

                if len(questions) < 25:
                    log(f"      WARNING: Only got {len(questions)} questions, expected 30!")

                results[level["slug"]] = {"info": level, "questions": questions}

                # Rate limiting between API calls
                time.sleep(5)

            # Write JS files
            all_written = True
            for slug, data in results.items():
                if data is None:
                    continue  # Already existed
                filename = os.path.join(OUTPUT_DIR, f"{topic['slug']}-{slug}.js")
                content = build_js_file(topic, data["info"], data["questions"])
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(content)
                log(f"    Wrote {filename} ({len(data['questions'])} questions)")

            # Check if all 3 levels are now complete
            if is_topic_complete(topic['slug']):
                total = sum(len(d["questions"]) for d in results.values() if d is not None)
                log(f"    DONE: {total} new questions for {topic['name']}")
                progress['completed'].append(topic['slug'])
                save_progress(progress)
            else:
                log(f"    INCOMPLETE: Not all level files generated")

        except Exception as e:
            log(f"    ERROR: {e}")
            import traceback
            log(f"    {traceback.format_exc()}")
            progress['failed'].append({'slug': topic['slug'], 'error': str(e)})
            save_progress(progress)
            time.sleep(10)

    log(f"")
    log(f"{'=' * 60}")
    log(f"BATCH COMPLETE!")
    log(f"  Completed: {len(progress['completed'])} topics")
    log(f"  Failed: {len(progress['failed'])} topics")
    if progress['failed']:
        for f_entry in progress['failed']:
            log(f"    FAILED: {f_entry['slug']}: {f_entry['error']}")
    log("=" * 60)


if __name__ == "__main__":
    main()
