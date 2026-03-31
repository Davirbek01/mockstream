"""
Batch generate CEFR-leveled article versions (B1, B2, C1) for all 220 articles.
For each article: generates 3 level-specific passages with vocabulary markup,
level-appropriate vocabulary definitions (EN+UZ), and Uzbek translations.

Usage:
  python batch_article_levels.py --start 1 --end 220
  python batch_article_levels.py --status --start 1 --end 220
  python batch_article_levels.py --start 1 --end 5 --force
"""

import json
import re
import time
import sys
import os
import argparse
from datetime import datetime

import requests

GEMINI_API_KEY = "AIzaSyAgsMeOT8t-8AGcEE0QWgh4VLubxti7xL8"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
DELAY = 5           # seconds between API calls
ARTICLE_DELAY = 8   # extra seconds between articles

QUESTIONS_DIR = os.path.join(os.path.dirname(__file__), "questions Articles")
LOG_FILE = os.path.join(os.path.dirname(__file__), "batch_article_levels_log.txt")
LOCK_FILE = os.path.join(os.path.dirname(__file__), "batch_article_levels.lock")


def log(msg):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {msg}"
    try:
        print(line)
    except UnicodeEncodeError:
        print(line.encode('ascii', 'replace').decode('ascii'))
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def call_gemini(prompt, retries=4, temperature=0.7, max_tokens=16384):
    for attempt in range(retries):
        try:
            resp = requests.post(GEMINI_URL, json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": temperature, "maxOutputTokens": max_tokens}
            }, timeout=(30, 300))
            if resp.status_code == 429:
                wait = 20 * (2 ** attempt)
                log(f"  Rate limited, waiting {wait}s... (attempt {attempt+1}/{retries})")
                time.sleep(wait)
                continue
            if resp.status_code >= 500:
                log(f"  Server error {resp.status_code}, retrying in 15s...")
                time.sleep(15)
                continue
            resp.raise_for_status()
            data = resp.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return text.strip()
        except KeyboardInterrupt:
            raise
        except Exception as e:
            log(f"  Error: {e}")
            if attempt < retries - 1:
                time.sleep(10)
    return None


def extract_json(text):
    """Extract JSON from Gemini response (handles markdown fences)."""
    if not text:
        return None
    # Remove markdown fences
    text = re.sub(r'^```(?:json)?\s*\n?', '', text, flags=re.MULTILINE)
    text = re.sub(r'\n?```\s*$', '', text, flags=re.MULTILINE)
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to find JSON object in the text
        match = re.search(r'\{[\s\S]*\}', text)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                return None
    return None


def read_article_file(filepath):
    """Read a .js article file and parse the ARTICLE_DATA object."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract the JSON-like object from window.ARTICLE_DATA = { ... };
    match = re.search(r'window\.ARTICLE_DATA\s*=\s*(\{[\s\S]*\})\s*;?\s*$', content)
    if not match:
        return None, content

    raw_js = match.group(1)

    # Convert JS template literals `` to JSON strings ""
    # This is tricky because the passages contain HTML with quotes
    # Instead, let's use a different approach: evaluate the structure manually

    # Extract fields using regex
    data = {}

    # Title
    title_m = re.search(r'title:\s*["\']([^"\']+)["\']', raw_js)
    if title_m:
        data['title'] = title_m.group(1)

    # Passage (template literal)
    passage_m = re.search(r'passage:\s*`([\s\S]*?)`', raw_js)
    if passage_m:
        data['passage'] = passage_m.group(1).strip()

    # Translation (template literal)
    trans_m = re.search(r'(?<![a-zA-Z])translation:\s*`([\s\S]*?)`', raw_js)
    if trans_m:
        data['translation'] = trans_m.group(1).strip()

    # Check for existing level fields
    for level in ['B1', 'B2', 'C1']:
        pm = re.search(rf'passage{level}:\s*`([\s\S]*?)`', raw_js)
        if pm:
            data[f'passage{level}'] = pm.group(1).strip()

    return data, content


def strip_html(html):
    """Remove HTML tags to get plain text."""
    return re.sub(r'<[^>]+>', '', html).strip()


def is_article_processed(filepath):
    """Check if article already has level versions."""
    data, _ = read_article_file(filepath)
    if not data:
        return False
    return 'passageB1' in data and 'passageC1' in data


LEVEL_DESCRIPTIONS = {
    "B1": """B1 (Intermediate):
- Simple, clear sentences (mostly simple and compound, few complex)
- Common everyday vocabulary and basic academic words
- Basic collocations: "make a decision", "take part in", "pay attention"
- Simple phrasal verbs: "find out", "look for", "give up", "come back"
- Common fixed phrases: "on the other hand", "as a result", "for example"
- Avoid idioms, proverbs, and sophisticated expressions
- Short to medium paragraphs, direct structure""",

    "B2": """B2 (Upper-Intermediate):
- Mix of sentence types including relative clauses and conditionals
- Broader vocabulary including less frequent words
- Standard collocations: "raise awareness", "pose a threat", "draw conclusions"
- Phrasal verbs: "come up with", "carry out", "bring about", "look into"
- Common idioms: "a double-edged sword", "the tip of the iceberg"
- Set expressions: "it goes without saying", "needless to say"
- Adjective phrases: "highly significant", "deeply concerned"
- Some noun phrases: "a growing body of evidence", "the root cause" """,

    "C1": """C1 (Advanced):
- Complex, nuanced sentence structures (cleft sentences, inversions, participle clauses)
- Sophisticated vocabulary and academic register
- Advanced collocations: "exert influence", "reap the benefits", "exacerbate the problem"
- Advanced phrasal verbs: "account for", "dawn on", "stem from", "hinge on"
- Idioms and proverbs where natural: "bite the bullet", "break new ground"
- Complex noun phrases: "the far-reaching implications of", "an ever-growing demand for"
- Hedging language: "it could be argued that", "one might contend"
- Sophisticated connectors: "notwithstanding", "insofar as", "thereby" """
}


def generate_single_level(title, passage_text, level):
    """Generate one CEFR level version of the article with vocabulary."""
    plain_text = strip_html(passage_text)
    word_count = len(plain_text.split())
    desc = LEVEL_DESCRIPTIONS[level]

    prompt = f"""You are an expert English language educator. Rewrite this article at CEFR {level} level.

Article: "{title}" ({word_count} words)

{plain_text}

=== Target Level ===
{desc}

Instructions:
1. Keep the same topic, key information, and approximate paragraph count
2. Similar length to the original (~{word_count} words, +/- 20%)
3. Wrap 15-25 KEY vocabulary words/phrases in <strong> tags (level-appropriate)
4. Format as HTML with <p> tags
5. Provide vocabulary definitions for each <strong> word/phrase

Return ONLY valid JSON (no markdown fences, no commentary):
{{
  "passage": "<p>paragraph with <strong>vocab</strong> words...</p>",
  "vocabulary": {{
    "vocab word": {{
      "definition": "Clear English definition",
      "uzbek": "Uzbek translation",
      "example": "Example sentence using this word",
      "exampleUzbek": "Uzbek translation of the example"
    }}
  }}
}}"""

    raw = call_gemini(prompt, max_tokens=8192)
    result = extract_json(raw)

    if not result or 'passage' not in result or 'vocabulary' not in result:
        return None
    return result


def generate_single_translation(title, passage, level):
    """Generate Uzbek translation for one level's passage."""
    prompt = f"""Translate this English article ("{title}", {level} version) into natural, fluent Uzbek.
Keep the exact same HTML <p> paragraph structure. Translate ALL content accurately.

{passage}

Return ONLY the translated HTML (no JSON wrapper, no markdown fences, just the HTML with <p> tags)."""

    raw = call_gemini(prompt, max_tokens=6000)
    if not raw:
        return None
    # Clean up any markdown fences
    raw = re.sub(r'^```(?:html)?\s*\n?', '', raw, flags=re.MULTILINE)
    raw = re.sub(r'\n?```\s*$', '', raw, flags=re.MULTILINE)
    return raw.strip()


def generate_level_passages(title, passage_text):
    """Generate B1, B2, C1 passage rewrites with vocabulary — one level at a time."""
    result = {}
    for level in ['B1', 'B2', 'C1']:
        log(f"    Generating {level} passage...")
        level_data = generate_single_level(title, passage_text, level)
        if not level_data:
            log(f"    Failed to generate {level} passage")
            return None
        result[level] = level_data
        words = len(strip_html(level_data['passage']).split())
        vocab_count = len(level_data['vocabulary'])
        log(f"    {level}: {words} words, {vocab_count} vocab items")
        time.sleep(DELAY)
    return result


def generate_translations(title, passages):
    """Generate Uzbek translations for B1, B2, C1 passages — one at a time."""
    result = {}
    for level in ['B1', 'B2', 'C1']:
        log(f"    Translating {level}...")
        translation = generate_single_translation(title, passages[level], level)
        if not translation:
            log(f"    Failed to translate {level}")
            return None
        result[level] = translation
        time.sleep(DELAY)
    return result


def escape_template_literal(text):
    """Escape backticks and ${} inside JS template literals."""
    text = text.replace('\\', '\\\\')
    text = text.replace('`', '\\`')
    text = text.replace('${', '\\${')
    return text


def write_article_with_levels(filepath, original_content, level_data, translations):
    """Write the updated article file with level versions appended."""
    # Find the closing of window.ARTICLE_DATA = { ... };
    # We need to insert the new fields before the closing }

    # Strategy: find the last } before the end, insert our fields before it
    # The file ends with: \n};\n or similar

    # Find the vocabulary object end (last field), then add our new fields
    # Let's find the position to insert

    # Approach: replace the final }; with new fields + };
    # Find the last occurrence of "};" or "}" at the end of the file
    stripped = original_content.rstrip()

    # Check if it ends with }; or just }
    if stripped.endswith('};'):
        insert_pos = len(stripped) - 2
        suffix = '\n};'
    elif stripped.endswith('}'):
        insert_pos = len(stripped) - 1
        suffix = '\n};'
    else:
        log(f"    Unexpected file ending, skipping")
        return False

    # Build new fields
    new_fields = ""
    for level in ['B1', 'B2', 'C1']:
        passage = escape_template_literal(level_data[level]['passage'])
        vocab_json = json.dumps(level_data[level]['vocabulary'], ensure_ascii=False, indent=8)
        translation = escape_template_literal(translations[level])

        new_fields += f""",
    passage{level}: `{passage}`,
    translation{level}: `{translation}`,
    vocabulary{level}: {vocab_json}"""

    new_content = stripped[:insert_pos] + new_fields + suffix + '\n'

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return True


def process_article(num, force=False):
    """Process a single article: generate B1/B2/C1 versions."""
    padded = str(num).zfill(2)
    filepath = os.path.join(QUESTIONS_DIR, f"article-{padded}.js")

    if not os.path.exists(filepath):
        log(f"  Article {padded}: file not found, skipping")
        return False

    if not force and is_article_processed(filepath):
        log(f"  Article {padded}: already processed, skipping")
        return True

    data, original_content = read_article_file(filepath)
    if not data or 'passage' not in data:
        log(f"  Article {padded}: could not parse, skipping")
        return False

    title = data.get('title', f'Article {num}')
    log(f"  Article {padded}: '{title}'")

    # Step 1: Generate B1/B2/C1 passages + vocabulary
    level_data = generate_level_passages(title, data['passage'])
    if not level_data:
        log(f"  Article {padded}: FAILED to generate level passages")
        return False

    time.sleep(DELAY)

    # Step 2: Generate Uzbek translations
    passages = {
        'B1': level_data['B1']['passage'],
        'B2': level_data['B2']['passage'],
        'C1': level_data['C1']['passage'],
    }
    translations = generate_translations(title, passages)
    if not translations:
        log(f"  Article {padded}: FAILED to generate translations")
        return False

    # Step 3: Write back to file
    success = write_article_with_levels(filepath, original_content, level_data, translations)
    if success:
        # Validate
        b1_words = len(strip_html(level_data['B1']['passage']).split())
        b2_words = len(strip_html(level_data['B2']['passage']).split())
        c1_words = len(strip_html(level_data['C1']['passage']).split())
        b1_vocab = len(level_data['B1']['vocabulary'])
        b2_vocab = len(level_data['B2']['vocabulary'])
        c1_vocab = len(level_data['C1']['vocabulary'])
        log(f"  Article {padded}: OK - B1({b1_words}w/{b1_vocab}v) B2({b2_words}w/{b2_vocab}v) C1({c1_words}w/{c1_vocab}v)")
    else:
        log(f"  Article {padded}: FAILED to write file")

    return success


def get_article_files(start, end):
    """Get list of article file (num, path) tuples in range."""
    articles = []
    for n in range(start, end + 1):
        padded = str(n).zfill(2)
        fp = os.path.join(QUESTIONS_DIR, f"article-{padded}.js")
        if os.path.exists(fp):
            articles.append((n, padded, fp))
    return articles


def show_status(start, end):
    """Show processing status for articles in range."""
    articles = get_article_files(start, end)
    done = 0
    pending = []
    for n, padded, fp in articles:
        if is_article_processed(fp):
            done += 1
        else:
            pending.append(padded)
    print(f"Status: {done}/{len(articles)} articles processed")
    if pending:
        if len(pending) <= 20:
            print(f"Pending: {', '.join(pending)}")
        else:
            print(f"Pending: {', '.join(pending[:20])}... and {len(pending)-20} more")
    else:
        print("All articles in range are processed!")


def main():
    parser = argparse.ArgumentParser(description="Batch generate CEFR-leveled article versions")
    parser.add_argument("--start", type=int, default=1)
    parser.add_argument("--end", type=int, default=220)
    parser.add_argument("--force", action="store_true", help="Re-process already done articles")
    parser.add_argument("--status", action="store_true", help="Show status only")
    args = parser.parse_args()

    if args.status:
        show_status(args.start, args.end)
        return

    # Lock file
    if os.path.exists(LOCK_FILE):
        with open(LOCK_FILE, 'r') as f:
            pid = f.read().strip()
        print(f"Another instance may be running (PID {pid}). Delete {LOCK_FILE} to override.")
        sys.exit(1)

    with open(LOCK_FILE, 'w') as f:
        f.write(str(os.getpid()))

    try:
        articles = get_article_files(args.start, args.end)
        log(f"=== Batch Article Levels: articles {args.start}-{args.end} ({len(articles)} files) ===")

        success_count = 0
        fail_count = 0
        skip_count = 0

        for i, (n, padded, fp) in enumerate(articles):
            if not args.force and is_article_processed(fp):
                skip_count += 1
                continue

            ok = process_article(n, force=args.force)
            if ok:
                success_count += 1
            else:
                fail_count += 1

            # Delay between articles
            if i < len(articles) - 1:
                time.sleep(ARTICLE_DELAY)

        log(f"=== DONE: {success_count} success, {fail_count} failed, {skip_count} skipped ===")

    finally:
        if os.path.exists(LOCK_FILE):
            os.remove(LOCK_FILE)


if __name__ == "__main__":
    main()
