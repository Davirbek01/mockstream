"""
Generate 3 leveled flashcard sets for Digital Frontier topic using Gemini API.
Levels: Intermediate (B1-B2), Upper-Intermediate (B2-C1), Advanced (C1-C2)
Each level: 30 cards
"""
import requests, json, time, re

API_KEY = "AIzaSyC61g88nXtTAlY53GVKl4HE-gjzAvz1T-o"
MODEL = "gemini-2.0-flash"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"

TOPIC = "Digital Frontier"
TOPIC_SLUG = "digital-frontier"

LEVELS = [
    {
        "name": "Intermediate",
        "slug": "intermediate",
        "cefr": "B1–B2",
        "description": "Intermediate level. Everyday tech vocabulary that people ACTUALLY USE when talking casually — at work, with friends, on social media. Think phrasal verbs (log in, sign up, scroll through), collocations (go viral, stay connected), slang and informal expressions. These should sound like something you'd hear a native speaker say in a normal conversation about technology, NOT from a textbook."
    },
    {
        "name": "Upper-Intermediate", 
        "slug": "upper-intermediate",
        "cefr": "B2–C1",
        "description": "Upper-intermediate level. More advanced but STILL conversational — the kind of vocabulary you hear in podcasts, YouTube videos, TED talks, Netflix shows, casual workplace debates. Phrasal verbs, idioms, set expressions, colloquial phrases about digital life and online culture. NOT academic jargon. Think: how would a smart, educated native speaker talk about tech in a coffee shop or group chat?"
    },
    {
        "name": "Advanced",
        "slug": "advanced", 
        "cefr": "C1–C2",
        "description": "Advanced level. Sophisticated BUT natural vocabulary — the kind used in quality journalism, opinion essays, IELTS/Cambridge essays, formal letters, and educated conversation. Include idiomatic expressions, advanced collocations, phrasal verbs, set expressions. These should still be words/phrases that REAL PEOPLE use — not obscure academic terminology. Think: how would a journalist, essayist, or educated professional discuss tech topics?"
    }
]

PROMPT_TEMPLATE = """You are an expert English language teacher creating flashcard sets for Uzbek-speaking students studying English.

Topic: "{topic}" — Technology, Internet, Digital Life, Social Media, Apps, Devices, Online Culture
Level: {level_name} ({cefr})
{level_desc}

Generate EXACTLY 35 flashcard entries as a JSON array. Each entry must have:
- "term": the English word, phrase, collocation, phrasal verb, set expression, or idiom (2-5 words typically)
- "uz": SHORT Uzbek equivalent or translation (1-4 words max). Just the Uzbek word/phrase that means the same thing. For example: "cybersecurity" → "kiberxavfsizlik", "go viral" → "tarqalib ketmoq", "tech-savvy" → "texnologiyadan xabardor".
- "uzDef": A brief, clear Uzbek definition/explanation of the English term (5-15 words). This MUST be provided for EVERY entry without exception. It should explain the meaning in simple Uzbek so that a student who doesn't know the English word can understand it. Examples: "go viral" → "internetda tez tarqalib, ko'p odamlar tomonidan ko'rilish", "cybersecurity" → "kompyuter va internet ma'lumotlarini himoya qilish tizimi", "tech-savvy" → "texnologiyalarni yaxshi tushunuvchi va mohirlik bilan ishlatuvchi". Keep it concise but informative.
- "ex": an authentic example sentence showing real usage (the kind you'd hear in conversation, podcasts, essays, or letters — NOT textbook-sounding)
- "exUz": Uzbek translation of the example sentence

CRITICAL RULES:
1. PRIORITIZE phrasal verbs, collocations, idioms, set expressions, and informal/colloquial phrases over single academic words. At least 60% of entries should be multi-word expressions.
2. Do NOT make entries artificially complicated or bookish. They should feel NATURAL and COLLOQUIAL — like real spoken English
3. Entries should be things people ACTUALLY say in spoken English, essays, and letters — NOT obscure academic jargon like "algorithmic transparency" or "digital sovereignty"
4. Every entry must genuinely belong to the "{topic}" theme
5. ABSOLUTELY DO NOT REPEAT any terms from other levels. Each term must be 100% unique across all levels.
6. Each example sentence should sound like something a real person would say or write — casual, authentic, not textbook-style
7. The "uz" field should be a SHORT equivalent/translation only (1-4 words max, NO definitions or brackets in this field).
8. The "uzDef" field is MANDATORY for EVERY entry. It is a brief Uzbek definition that explains the English term's meaning in plain Uzbek (5-15 words). This helps students who see an unfamiliar Uzbek equivalent understand the actual concept.
9. Do NOT include entries that overlap with basic/generic vocabulary (like "computer", "phone", "internet" for intermediate)
10. Make sure entries are INTERESTING and USEFUL — things students will actually encounter
11. Generate 35 entries (we will trim to 30 after deduplication)

Return ONLY the JSON array, no markdown, no explanation. Just the raw JSON array starting with [ and ending with ]."""


def generate_level(level_info, existing_terms):
    """Generate 30 flashcards for one level."""
    
    print(f"\n{'='*60}")
    print(f"Generating {level_info['name']} ({level_info['cefr']}) — 30 cards...")
    print(f"{'='*60}")
    
    all_unique = []
    seen = set()
    attempts = 0
    max_attempts = 3
    
    while len(all_unique) < 30 and attempts < max_attempts:
        attempts += 1
        if attempts > 1:
            print(f"  Retry #{attempts} — need {30 - len(all_unique)} more cards...")
            time.sleep(3)
        
        # Build exclusion list: existing terms + already collected terms
        all_excluded = list(existing_terms) + [c["term"] for c in all_unique]
        
        exclusion_note = ""
        if all_excluded:
            exclusion_note = f"\n\nCRITICAL — FORBIDDEN TERMS (already used, do NOT include ANY of these): {', '.join(all_excluded)}"
        
        current_prompt = PROMPT_TEMPLATE.format(
            topic=TOPIC,
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
        
        resp = requests.post(URL, json=payload, timeout=120)
        if resp.status_code != 200:
            print(f"  ERROR {resp.status_code}: {resp.text[:500]}")
            time.sleep(5)
            resp = requests.post(URL, json=payload, timeout=120)
            if resp.status_code != 200:
                print(f"  RETRY FAILED {resp.status_code}: {resp.text[:500]}")
                break
        
        data = resp.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
        
        if text.startswith("```"):
            text = re.sub(r'^```(?:json)?\s*', '', text)
            text = re.sub(r'\s*```$', '', text)
        
        cards = json.loads(text)
        print(f"  Got {len(cards)} cards from API")
        
        existing_lower = {t.lower() for t in existing_terms}
        new_count = 0
        for c in cards:
            term_lower = c["term"].lower().strip()
            if term_lower not in existing_lower and term_lower not in seen:
                seen.add(term_lower)
                all_unique.append(c)
                new_count += 1
        
        print(f"  {new_count} new unique, {len(cards) - new_count} duplicates skipped, total so far: {len(all_unique)}")
    
    cards = all_unique[:30]
    print(f"  Final: {len(cards)} cards")
    
    # Show first 3 as preview
    for i, c in enumerate(cards[:3]):
        print(f"  [{i+1}] {c['term']}: {c['uz']}")
    
    return cards


def build_js_file(level_info, cards):
    """Build the JS flashcard file content."""
    
    level_colors = {
        "intermediate": {"bg1": "#0f766e", "bg2": "#134e4a", "accent": "#0f766e", "progress": "#22c55e"},
        "upper-intermediate": {"bg1": "#7c3aed", "bg2": "#4c1d95", "accent": "#7c3aed", "progress": "#a78bfa"},
        "advanced": {"bg1": "#dc2626", "bg2": "#7f1d1d", "accent": "#dc2626", "progress": "#f87171"}
    }
    
    colors = level_colors[level_info["slug"]]
    
    lines = []
    lines.append(f'// Flashcard Data: {TOPIC} — {level_info["name"]} ({level_info["cefr"]})')
    lines.append(f'// 30 cards: words, phrases, collocations, phrasal verbs, set expressions')
    lines.append('')
    lines.append('window.FLASHCARD_DATA = {')
    lines.append(f'  title: "💻 {TOPIC}: {level_info["name"]}",')
    lines.append(f'  logo: "https://i.ibb.co/4RYmcG6R/Bekzod-Turgunov-Logo.jpg",')
    lines.append(f'  brand: "{TOPIC}",')
    lines.append(f'  subtitle: "Bekzod Turg\'unov",')
    lines.append(f'  colors: {{')
    lines.append(f'    bg1: "{colors["bg1"]}",')
    lines.append(f'    bg2: "{colors["bg2"]}",')
    lines.append(f'    accent: "{colors["accent"]}",')
    lines.append(f'    progress: "{colors["progress"]}"')
    lines.append(f'  }},')
    lines.append(f'  cards: [')
    
    for i, card in enumerate(cards):
        # Escape quotes in all fields
        term = card["term"].replace("'", "\\'").replace('"', '\\"')
        uz = card["uz"].replace("'", "\\'").replace('"', '\\"')
        uzDef = card.get("uzDef", "").replace("'", "\\'").replace('"', '\\"')
        ex = card["ex"].replace("'", "\\'").replace('"', '\\"')
        exUz = card["exUz"].replace("'", "\\'").replace('"', '\\"')
        
        comma = "," if i < len(cards) - 1 else ""
        lines.append(f'    {{term: "{term}", en: "", uz: "{uz}", uzDef: "{uzDef}", ex: "{ex}", exUz: "{exUz}"}}{comma}')
    
    lines.append('  ]')
    lines.append('};')
    
    return '\n'.join(lines)


def main():
    all_terms = []
    results = {}
    
    for level in LEVELS:
        cards = generate_level(level, all_terms)
        
        if len(cards) < 30:
            print(f"  WARNING: Only got {len(cards)} cards, expected 30!")
        
        # Track terms to avoid duplicates across levels
        for c in cards:
            all_terms.append(c["term"])
        
        results[level["slug"]] = {"info": level, "cards": cards}
        
        time.sleep(2)  # Brief pause between API calls
    
    # Write JS files
    for slug, data in results.items():
        filename = f"flashcards/{TOPIC_SLUG}-{slug}.js"
        content = build_js_file(data["info"], data["cards"])
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"\n  Wrote {filename} ({len(data['cards'])} cards)")
    
    # Also save raw JSON for reference
    raw = {}
    for slug, data in results.items():
        raw[slug] = data["cards"]
    
    with open(f"{TOPIC_SLUG}_levels.json", 'w', encoding='utf-8') as f:
        json.dump(raw, f, indent=2, ensure_ascii=False)
    
    print(f"\n  Saved raw JSON to {TOPIC_SLUG}_levels.json")
    print(f"\nDONE! Generated {sum(len(d['cards']) for d in results.values())} total cards across 3 levels.")


if __name__ == "__main__":
    main()
