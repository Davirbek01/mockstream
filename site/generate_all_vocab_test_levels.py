"""
Batch generate LEVELED vocabulary tests for ALL vocab topics using Gemini API.
Each topic: 3 levels (Intermediate B1-B2, Upper-Intermediate B2-C1, Advanced C1-C2) × 30 questions = 90 questions
Resume-capable: skips topics that already have all 3 level files.
Rate limited: 5-second delay between API calls.

Usage:
  python generate_all_vocab_test_levels.py              # Process all remaining topics
"""
import requests, json, time, re, os, sys
from datetime import datetime

API_KEY = "AIzaSyAgsMeOT8t-8AGcEE0QWgh4VLubxti7xL8"
MODEL = "gemini-2.0-flash"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"
LOG_FILE = "batch_vocab_test_levels_log.txt"
PROGRESS_FILE = "batch_vocab_test_levels_progress.json"
OUTPUT_DIR = "questions V"

LEVELS = [
    {
        "name": "Intermediate",
        "slug": "intermediate",
        "cefr": "B1–B2",
        "description": (
            "Intermediate level (B1–B2). Test CORE VOCABULARY that every B1-B2 learner must know. "
            "Use ONLY common, high-frequency words — nothing rare or academic. "
            "NEVER use complex words like 'adjourned', 'demolish', 'dissemble', 'flourish'. "
            "Contexts: daily conversations, simple emails, short news, daily life. "
            "Test basic collocations ('make a decision'), common phrasal verbs ('give up'), everyday expressions. "
            "NO idioms at this level. Wrong options = words students commonly confuse. "
            "Question types: Fill in the blank, Synonym, Antonym, Definition, Collocation. NO idiom questions."
        )
    },
    {
        "name": "Upper-Intermediate",
        "slug": "upper-intermediate",
        "cefr": "B2–C1",
        "description": (
            "Upper-Intermediate level (B2–C1). Test MORE NUANCED VOCABULARY beyond basic words. "
            "Use wider vocabulary but still keep it accessible (not obscure). "
            "Include less common collocations, some idiomatic expressions, and specialized terms. "
            "Contexts: news articles, workplace communication, academic settings, podcasts. "
            "Test subtle differences between near-synonyms and words with multiple meanings. "
            "Include SOME idiom questions (3-4 out of 30)."
        )
    },
    {
        "name": "Advanced",
        "slug": "advanced",
        "cefr": "C1–C2",
        "description": (
            "Advanced level (C1–C2). Test SOPHISTICATED, LOW-FREQUENCY VOCABULARY. "
            "Include academic words, formal register, and precise terminology. "
            "Contexts: academic papers, quality journalism, formal speeches. "
            "Test rare collocations, register differences, connotation nuances. "
            "Include more idiom/phrase questions (5-6 out of 30). "
            "Wrong options should require near-native discrimination."
        )
    }
]

PROMPT_TEMPLATE = """You are an expert English vocabulary teacher creating a multiple-choice vocabulary test for Uzbek-speaking students.

Vocabulary Topic: "{topic}"
Level: {level_name} ({cefr})
{level_desc}

Generate EXACTLY 30 MCQ vocabulary questions as a JSON array.

QUESTION TYPES — use a mix of ALL these (distribute roughly equally, ~5-6 each):

1. "Fill in the blank:" — Short sentence with <b>___</b> for the blank. Student picks the correct word.
   Example question: "He <b>___</b> his keys and couldn't get in."
   Example options: ["lost", "missed", "forgot", "dropped"]

2. "Find the SYNONYM:" — A word highlighted with <b>. Student picks the closest meaning.
   Example question: "What is a synonym for <b>happy</b>?"
   Example options: ["glad", "sad", "angry", "tired"]

3. "Find the ANTONYM:" — A word highlighted with <b>. Student picks the opposite.
   Example question: "What is the opposite of <b>cheap</b>?"
   Example options: ["expensive", "free", "affordable", "low"]

4. "What does it mean?" — A word or phrase highlighted with <b>. Student picks the correct definition.
   Example question: "What does <b>generous</b> mean?"
   Example options: ["Willing to give", "Wanting to save", "Being careful", "Feeling sad"]

5. "Complete the collocation:" — An incomplete word pair with <b>___</b>. Student picks the missing word.
   Example question: "make a <b>___</b>"
   Example options: ["decision", "homework", "a job", "an error"]

6. "What does this phrase mean?" — An idiom/phrase in <b>. Student picks the correct meaning. (Use ONLY at Upper-Intermediate and Advanced levels, 0 at Intermediate)
   Example question: "What does <b>a piece of cake</b> mean?"
   Example options: ["Very easy", "Very tasty", "Very small", "Very cheap"]

Each question MUST have these exact JSON fields:
- "type": one of the types above (string)
- "question": the question text with <b> tags to highlight the key word/phrase/blank (string)
- "correct": the correct answer (string, plain text, NO HTML)
- "options": array of exactly 4 strings — CORRECT answer MUST be FIRST, then 3 wrong. Plain text, NO HTML.
- "def": Uzbek translation/definition of the correct answer (string, natural Uzbek)
- "meanings": object where keys are the 3 WRONG options and values are their Uzbek translations
- "level": "{cefr}"

CRITICAL FORMATTING RULES:
1. Keep questions SHORT — max 12 words per sentence. No long paragraphs.
2. Keep options SHORT — max 5 words per option.
3. Use <b>___</b> for blanks, <b>word</b> to highlight key vocabulary.
4. Options must be PLAIN TEXT — no <b> tags in options.
5. All 4 options must be plausible. Wrong answers = tempting distractors at THIS level.
6. The correct answer MUST be the FIRST element in "options".
7. "meanings" must contain EXACTLY the 3 wrong options as keys (NOT the correct answer).
8. Uzbek in "def" and "meanings" must be natural Uzbek.
9. Questions MUST test vocabulary from the topic "{topic}".
10. No duplicate questions. Test DIFFERENT words.
11. Every question must have EXACTLY ONE correct answer.
12. Do NOT use rare/complex vocabulary at Intermediate level.

Return ONLY a valid JSON array starting with [ and ending with ]. No markdown, no code fences."""


def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(line + '\n')


def parse_vocab_topics():
    """Parse all vocabulary test topics from landing.html."""
    with open('landing.html', 'r', encoding='utf-8') as f:
        content = f.read()

    match = re.search(r'const vocabTests = \[(.*?)\];', content, re.DOTALL)
    if not match:
        raise ValueError("Could not find vocabTests in landing.html")

    block = match.group(1)
    topics = []
    seen_slugs = set()

    for line in block.split('\n'):
        m = re.search(r"test=([^&']+)&type=vocabulary.*?name:\s*'([^']+)'.*?icon:\s*'([^']+)'", line)
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
    """Generate 30 vocab questions for one level of a topic."""
    all_valid = []
    attempts = 0
    max_attempts = 3

    while len(all_valid) < 30 and attempts < max_attempts:
        attempts += 1
        if attempts > 1:
            log(f"      Retry #{attempts} — need {30 - len(all_valid)} more questions...")
            time.sleep(5)

        need = 30 - len(all_valid)
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
                "maxOutputTokens": 12000
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
    """Validate a single vocab question has all required fields."""
    required = ("type", "question", "correct", "options", "def", "meanings")
    if not all(k in q for k in required):
        return False
    if not isinstance(q["options"], list) or len(q["options"]) != 4:
        return False
    if q["correct"] != q["options"][0]:
        return False
    if not isinstance(q["meanings"], dict) or len(q["meanings"]) != 3:
        return False
    # Check that meanings keys match the 3 wrong options
    wrong_opts = set(q["options"][1:])
    meaning_keys = set(q["meanings"].keys())
    if wrong_opts != meaning_keys:
        return False
    if not q["question"].strip() or not q["correct"].strip():
        return False
    # Ensure options are not too long
    for opt in q["options"]:
        if len(str(opt)) > 80:
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
    lines.append(f'// Vocabulary Test: {topic["name"]} — {level_info["name"]} ({level_info["cefr"]})')
    lines.append(f'// 30 MCQ questions — leveled vocabulary test')
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

        # Build meanings object string
        meanings_parts = []
        for wrong_opt, uz_meaning in q['meanings'].items():
            meanings_parts.append(f'"{escape_js_string(wrong_opt)}": "{escape_js_string(uz_meaning)}"')
        meanings_str = ', '.join(meanings_parts)

        lines.append(f'  {{type: "{qtype}", question: "{question}", correct: "{correct}", options: [{opts}], def: "{defn}", meanings: {{{meanings_str}}}, level: "{level}"}}{comma}')

    lines.append('];')
    return '\n'.join(lines)


def main():
    log("=" * 60)
    log("BATCH VOCAB TEST LEVELS GENERATOR")
    log(f"Model: {MODEL} | Levels per topic: 3 | Questions per level: 30")
    log("=" * 60)

    topics = parse_vocab_topics()
    progress = load_progress()

    log(f"Found {len(topics)} vocab topics in landing.html")

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
            for slug, data in results.items():
                if data is None:
                    continue
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
