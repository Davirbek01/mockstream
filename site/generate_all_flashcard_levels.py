"""
Batch generate 3 leveled flashcard sets for ALL flashcard topics using Gemini API.
Each topic: 3 levels (Intermediate B1-B2, Upper-Intermediate B2-C1, Advanced C1-C2) × 30 cards = 90 cards
Resume-capable: skips topics that already have all 3 level files.
Rate limited: 5-second delay between API calls.
"""
import requests, json, time, re, os, sys
from datetime import datetime

API_KEY = "AIzaSyC61g88nXtTAlY53GVKl4HE-gjzAvz1T-o"
MODEL = "gemini-2.0-flash"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"
LOG_FILE = "batch_flashcard_levels_log.txt"
PROGRESS_FILE = "batch_flashcard_levels_progress.json"

LEVELS = [
    {
        "name": "Intermediate",
        "slug": "intermediate",
        "cefr": "B1–B2",
        "description": "Intermediate level. Everyday vocabulary that people ACTUALLY USE when talking casually — at work, with friends, on social media. Think phrasal verbs (e.g. pick up, figure out), collocations (make a decision, take a break), common idioms, proverbs, and informal expressions. These should sound like something you'd hear a native speaker say in a normal conversation, NOT from a textbook."
    },
    {
        "name": "Upper-Intermediate",
        "slug": "upper-intermediate",
        "cefr": "B2–C1",
        "description": "Upper-intermediate level. More advanced but STILL conversational — the kind of vocabulary you hear in podcasts, YouTube videos, TED talks, Netflix shows, casual workplace debates. Phrasal verbs, idioms, set expressions, proverbs, colloquial phrases. NOT academic jargon. Think: how would a smart, educated native speaker talk about this topic in a coffee shop or group chat?"
    },
    {
        "name": "Advanced",
        "slug": "advanced",
        "cefr": "C1–C2",
        "description": "Advanced level. Sophisticated BUT natural vocabulary — the kind used in quality journalism, opinion essays, IELTS/Cambridge essays, formal letters, and educated conversation. Include idiomatic expressions, advanced collocations, phrasal verbs, set expressions, proverbs. These should still be words/phrases that REAL PEOPLE use — not obscure academic terminology."
    }
]

LEVEL_COLORS = {
    "intermediate": {"bg1": "#0f766e", "bg2": "#134e4a", "accent": "#0f766e", "progress": "#22c55e"},
    "upper-intermediate": {"bg1": "#7c3aed", "bg2": "#4c1d95", "accent": "#7c3aed", "progress": "#a78bfa"},
    "advanced": {"bg1": "#dc2626", "bg2": "#7f1d1d", "accent": "#dc2626", "progress": "#f87171"}
}

PROMPT_TEMPLATE = """You are an expert English language teacher creating flashcard sets for Uzbek-speaking students studying English.

Topic: "{topic}"
Focus: Frequently used LEXICAL RESOURCES — words, expressions, collocations, set expressions, phrasal verbs, idioms, and proverbs related to this topic.
Level: {level_name} ({cefr})
{level_desc}

Generate EXACTLY 35 flashcard entries as a JSON array. Each entry must have:
- "term": the English word, phrase, collocation, phrasal verb, set expression, idiom, or proverb (2-5 words typically)
- "uz": SHORT Uzbek equivalent or translation (1-4 words max). Just the Uzbek word/phrase that means the same thing.
- "uzDef": A brief, clear Uzbek definition/explanation of the English term (5-15 words). This MUST be provided for EVERY entry without exception. It should explain the meaning in simple Uzbek so that a student who doesn't know the English word can understand it. Keep it concise but informative.
- "ex": an authentic example sentence showing real usage (the kind you'd hear in conversation, podcasts, essays, or letters — NOT textbook-sounding)
- "exUz": Uzbek translation of the example sentence

CRITICAL RULES:
1. PRIORITIZE frequently used lexical resources: phrasal verbs, collocations, idioms, set expressions, proverbs, and informal/colloquial phrases over single academic words. At least 60% of entries should be multi-word expressions.
2. Do NOT make entries artificially complicated or bookish. They should feel NATURAL and COLLOQUIAL — like real spoken/written English.
3. Entries should be things people ACTUALLY say in spoken English, essays, and letters — NOT obscure academic jargon.
4. Every entry must genuinely belong to the "{topic}" theme.
5. ABSOLUTELY DO NOT REPEAT any terms from other levels. Each term must be 100% unique across all levels.
6. Each example sentence should sound like something a real person would say or write — casual, authentic, not textbook-style.
7. The "uz" field should be a SHORT equivalent/translation only (1-4 words max, NO definitions or brackets in this field).
8. The "uzDef" field is MANDATORY for EVERY entry. It is a brief Uzbek definition that explains the English term's meaning in plain Uzbek (5-15 words).
9. Do NOT include entries that overlap with basic/generic vocabulary.
10. Make sure entries are INTERESTING and USEFUL — things students will actually encounter and need.
11. Generate 35 entries (we will trim to 30 after deduplication).

Return ONLY the JSON array, no markdown, no explanation. Just the raw JSON array starting with [ and ending with ]."""


def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(line + '\n')


def parse_topics():
    """Parse all unique flashcard topics from landing.html."""
    with open('landing.html', 'r', encoding='utf-8') as f:
        content = f.read()

    match = re.search(r'const flashcardTopics = \[(.*?)\];', content, re.DOTALL)
    if not match:
        raise ValueError("Could not find flashcardTopics in landing.html")

    block = match.group(1)
    topics = []
    seen_files = set()

    for line in block.split('\n'):
        m = re.search(r"file: '([^']+)'.*?name: '([^']+)'.*?icon: '([^']+)'", line)
        if m:
            file_name, name, icon = m.groups()
            if file_name in seen_files:
                continue
            seen_files.add(file_name)
            slug = file_name.replace('01.js', '')
            topics.append({
                'file': file_name,
                'slug': slug,
                'name': name,
                'icon': icon
            })

    return topics


def is_topic_complete(slug):
    """Check if all 3 level files exist for a topic."""
    for level in LEVELS:
        path = f"flashcards/{slug}-{level['slug']}.js"
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


def generate_level(topic_name, level_info, existing_terms):
    """Generate 30 flashcards for one level of a topic."""
    all_unique = []
    seen = set()
    attempts = 0
    max_attempts = 3

    while len(all_unique) < 30 and attempts < max_attempts:
        attempts += 1
        if attempts > 1:
            log(f"      Retry #{attempts} — need {30 - len(all_unique)} more cards...")
            time.sleep(5)

        all_excluded = list(existing_terms) + [c["term"] for c in all_unique]
        exclusion_note = ""
        if all_excluded:
            exclusion_note = f"\n\nCRITICAL — FORBIDDEN TERMS (already used, do NOT include ANY of these): {', '.join(all_excluded)}"

        current_prompt = PROMPT_TEMPLATE.format(
            topic=topic_name,
            level_name=level_info["name"],
            cefr=level_info["cefr"],
            level_desc=level_info["description"]
        ) + exclusion_note

        payload = {
            "contents": [{"parts": [{"text": current_prompt}]}],
            "generationConfig": {
                "temperature": 0.9,
                "maxOutputTokens": 8192
            }
        }

        try:
            resp = requests.post(URL, json=payload, timeout=120)

            # Handle rate limiting with exponential backoff
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

            cards = json.loads(text)

            existing_lower = {t.lower() for t in existing_terms}
            new_count = 0
            for c in cards:
                term_lower = c["term"].lower().strip()
                if term_lower not in existing_lower and term_lower not in seen:
                    seen.add(term_lower)
                    all_unique.append(c)
                    new_count += 1

            log(f"      Got {len(cards)}, {new_count} new unique, total: {len(all_unique)}")

        except json.JSONDecodeError as e:
            log(f"      JSON parse error: {e}")
            time.sleep(10)
        except Exception as e:
            log(f"      API Error: {e}")
            time.sleep(10)

    return all_unique[:30]


def build_js_file(topic, level_info, cards):
    """Build the JS flashcard file content."""
    colors = LEVEL_COLORS[level_info["slug"]]

    lines = []
    lines.append(f'// Flashcard Data: {topic["name"]} \u2014 {level_info["name"]} ({level_info["cefr"]})')
    lines.append(f'// 30 cards: words, phrases, collocations, phrasal verbs, set expressions')
    lines.append('')
    lines.append('window.FLASHCARD_DATA = {')

    title_icon = topic["icon"]
    title_name = topic["name"].replace('"', '\\"')
    lines.append(f'  title: "{title_icon} {title_name}: {level_info["name"]}",')
    lines.append(f'  logo: "https://i.ibb.co/4RYmcG6R/Bekzod-Turgunov-Logo.jpg",')

    brand = topic["name"].replace('"', '\\"')
    lines.append(f'  brand: "{brand}",')
    lines.append(f'  subtitle: "Bekzod Turg\'unov",')
    lines.append(f'  colors: {{')
    lines.append(f'    bg1: "{colors["bg1"]}",')
    lines.append(f'    bg2: "{colors["bg2"]}",')
    lines.append(f'    accent: "{colors["accent"]}",')
    lines.append(f'    progress: "{colors["progress"]}"')
    lines.append(f'  }},')
    lines.append(f'  cards: [')

    for i, card in enumerate(cards):
        term = card["term"].replace('"', '\\"')
        uz = card["uz"].replace('"', '\\"')
        uzDef = card.get("uzDef", "").replace('"', '\\"')
        ex = card["ex"].replace('"', '\\"')
        exUz = card["exUz"].replace('"', '\\"')

        comma = "," if i < len(cards) - 1 else ""
        lines.append(f'    {{term: "{term}", en: "", uz: "{uz}", uzDef: "{uzDef}", ex: "{ex}", exUz: "{exUz}"}}{comma}')

    lines.append('  ]')
    lines.append('};')

    return '\n'.join(lines)


def main():
    log("=" * 60)
    log("BATCH FLASHCARD LEVELS GENERATOR")
    log(f"Model: {MODEL} | Levels per topic: 3 | Cards per level: 30")
    log("=" * 60)

    topics = parse_topics()
    progress = load_progress()

    log(f"Found {len(topics)} unique topics in landing.html")

    # Build remaining list — skip already completed or already having files
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
    log(f"Estimated time: ~{len(remaining) * 3 * 7 // 60} minutes")

    if not remaining:
        log("Nothing to do! All topics already have level files.")
        return

    for i, topic in enumerate(remaining):
        log(f"")
        log(f"{'=' * 60}")
        log(f"TOPIC {i + 1}/{len(remaining)}: {topic['name']} ({topic['slug']})")
        log(f"{'=' * 60}")

        try:
            all_terms = []
            results = {}

            for level in LEVELS:
                log(f"    {level['name']} ({level['cefr']})...")
                cards = generate_level(topic['name'], level, all_terms)

                if len(cards) < 30:
                    log(f"      WARNING: Only got {len(cards)} cards, expected 30!")

                for c in cards:
                    all_terms.append(c["term"])

                results[level["slug"]] = {"info": level, "cards": cards}

                # Rate limiting between API calls
                time.sleep(5)

            # Write JS files
            for slug, data in results.items():
                filename = f"flashcards/{topic['slug']}-{slug}.js"
                content = build_js_file(topic, data["info"], data["cards"])
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(content)

            total = sum(len(d["cards"]) for d in results.values())
            log(f"    DONE: {total} cards for {topic['name']}")

            progress['completed'].append(topic['slug'])
            save_progress(progress)

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
