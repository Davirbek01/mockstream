"""
Generate vocabulary test JS files using Gemini API.
Style: englishtestsonline.com MCQ vocabulary tests.
Each set: 30 MCQ questions with 4 options, Uzbek translations.
Output: questions V/<topic>.js files with window.ALL_QUESTIONS array.
"""

import json
import time
import re
import os
import google.generativeai as genai

API_KEY = "AIzaSyA7fuFZpM3RsmkbO9gaSWDI0IzsEp6Uqf4"
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

TOPICS = [
    {
        "file": "aviation-aerospace01",
        "title": "✈️ Aviation & Aerospace",
        "icon": "✈️",
        "prompt_topic": "Aviation and Aerospace — advanced vocabulary (B2-C1). Include sentence completion with words like 'turbulence', 'fuselage', 'cockpit', 'altitude', 'runway', 'navigation', 'aerodynamics', 'thrust', 'orbit', 'propulsion'. Mix collocations (e.g. 'clear for takeoff', 'make an emergency landing'), phrasal verbs (e.g. 'touch down', 'take off'), synonyms, antonyms, and gap-fill about flight mechanics, space exploration, air traffic control, pilot training, satellite technology."
    },
    {
        "file": "charity-volunteering01",
        "title": "🤝 Charity & Volunteering",
        "icon": "🤝",
        "prompt_topic": "Charity and Volunteering — advanced vocabulary (B2-C1). Include sentence completion with words like 'fundraiser', 'philanthropy', 'donation', 'outreach', 'beneficiary', 'altruism', 'grassroots', 'humanitarian', 'nonprofit', 'campaign'. Mix collocations (e.g. 'raise awareness', 'make a donation'), phrasal verbs (e.g. 'give back', 'reach out'), synonyms, antonyms, and gap-fill about community service, NGOs, social causes, poverty relief, crowdfunding for charity."
    },
    {
        "file": "education-academia01",
        "title": "🎓 Education & Academia",
        "icon": "🎓",
        "prompt_topic": "Education and Academia — advanced vocabulary (B2-C1). Include sentence completion with words like 'curriculum', 'dissertation', 'scholarship', 'tuition', 'seminar', 'plagiarism', 'tenure', 'pedagogy', 'enrolment', 'accreditation'. Mix collocations (e.g. 'pursue a degree', 'submit a thesis'), phrasal verbs (e.g. 'drop out', 'catch up'), synonyms, antonyms, and gap-fill about higher education, research, online learning, student debt, academic integrity."
    },
    {
        "file": "forensics-investigation01",
        "title": "🔍 Forensics & Investigation",
        "icon": "🔍",
        "prompt_topic": "Forensics and Investigation — advanced vocabulary (B2-C1). Include sentence completion with words like 'autopsy', 'forensic evidence', 'suspect', 'DNA profiling', 'ballistics', 'testimony', 'surveillance', 'alibi', 'motive', 'warrant'. Mix collocations (e.g. 'gather evidence', 'conduct an investigation'), phrasal verbs (e.g. 'track down', 'rule out'), synonyms, antonyms, and gap-fill about crime scene analysis, detective work, courtroom procedures, cybercrime investigation, cold cases."
    },
    {
        "file": "gaming-esports01",
        "title": "🎮 Gaming & Esports",
        "icon": "🎮",
        "prompt_topic": "Gaming and Esports — advanced vocabulary (B2-C1). Include sentence completion with words like 'avatar', 'multiplayer', 'graphics', 'console', 'virtual reality', 'tournament', 'strategy', 'leaderboard', 'streaming', 'franchise'. Mix collocations (e.g. 'play competitively', 'level up'), phrasal verbs (e.g. 'log in', 'team up'), synonyms, antonyms, and gap-fill about video game culture, professional gaming, game development, online communities, gaming addiction."
    },
    {
        "file": "housing-property01",
        "title": "🏠 Housing & Property",
        "icon": "🏠",
        "prompt_topic": "Housing and Property — advanced vocabulary (B2-C1). Include sentence completion with words like 'mortgage', 'tenant', 'lease', 'eviction', 'deposit', 'estate agent', 'renovation', 'foreclosure', 'suburb', 'amenity'. Mix collocations (e.g. 'take out a mortgage', 'put down a deposit'), phrasal verbs (e.g. 'move in', 'do up'), synonyms, antonyms, and gap-fill about renting, buying, real estate market, homelessness, housing crisis, property development."
    },
    {
        "file": "manufacturing-industry01",
        "title": "🏭 Manufacturing & Industry",
        "icon": "🏭",
        "prompt_topic": "Manufacturing and Industry — advanced vocabulary (B2-C1). Include sentence completion with words like 'assembly line', 'automation', 'raw materials', 'quality control', 'output', 'warehouse', 'supply chain', 'inventory', 'outsource', 'prototype'. Mix collocations (e.g. 'mass-produce', 'meet demand'), phrasal verbs (e.g. 'turn out', 'roll out'), synonyms, antonyms, and gap-fill about factory work, industrial revolution, lean manufacturing, robotics, trade unions."
    },
    {
        "file": "oceanography-marine01",
        "title": "🌊 Oceanography & Marine Life",
        "icon": "🐋",
        "prompt_topic": "Oceanography and Marine Life — advanced vocabulary (B2-C1). Include sentence completion with words like 'coral reef', 'tide', 'marine ecosystem', 'plankton', 'overfishing', 'biodiversity', 'submarine', 'current', 'habitat', 'endangered species'. Mix collocations (e.g. 'protect marine habitats', 'conduct research'), phrasal verbs (e.g. 'dive into', 'wipe out'), synonyms, antonyms, and gap-fill about ocean conservation, deep sea exploration, whale migration, coral bleaching, sustainable fishing."
    },
    {
        "file": "photography-visual01",
        "title": "📷 Photography & Visual Arts",
        "icon": "📷",
        "prompt_topic": "Photography and Visual Arts — advanced vocabulary (B2-C1). Include sentence completion with words like 'exposure', 'lens', 'composition', 'aperture', 'resolution', 'portrait', 'retouching', 'gallery', 'perspective', 'shutter speed'. Mix collocations (e.g. 'capture an image', 'adjust the focus'), phrasal verbs (e.g. 'zoom in', 'stand out'), synonyms, antonyms, and gap-fill about digital photography, exhibitions, photo editing, landscape photography, visual storytelling."
    },
    {
        "file": "taxation-economics01",
        "title": "💰 Taxation & Economics",
        "icon": "💰",
        "prompt_topic": "Taxation and Economics — advanced vocabulary (B2-C1). Include sentence completion with words like 'revenue', 'fiscal policy', 'inflation', 'deduction', 'audit', 'tax evasion', 'subsidy', 'recession', 'stimulus', 'GDP'. Mix collocations (e.g. 'file a tax return', 'impose a tax'), phrasal verbs (e.g. 'pay off', 'write off'), synonyms, antonyms, and gap-fill about government spending, income tax, corporate tax, economic growth, austerity measures, tax reform."
    }
]

PROMPT_TEMPLATE = """You are creating a multiple-choice vocabulary test in the style of englishtestsonline.com — advanced MCQ English vocabulary exercises.

Topic: {topic}

Generate EXACTLY 30 MCQ vocabulary questions as a JSON array. 

Use a MIX of these question types (roughly equal distribution):
1. "Complete the sentence:" — A sentence with a blank (use ___ for the blank). The student picks the correct word/phrase.
2. "Find the SYNONYM:" — A word or phrase is given. The student picks the word closest in meaning.
3. "Find the ANTONYM:" — A word or phrase is given. The student picks the opposite.
4. "Complete the collocation:" — An incomplete collocation. The student picks the missing word.
5. "What does this mean?" — An idiom, phrase, or advanced word. The student picks the correct definition.
6. "Choose the correct option:" — A sentence with a blank. The student picks the right word (often testing confusable words).

Each question must have these exact JSON fields:
- "type": one of the types above (string)
- "question": the question text — a sentence with ___ blank, a word, a collocation, or a phrase (string)
- "correct": the correct answer (string)
- "options": array of exactly 4 strings — the CORRECT answer MUST be the FIRST element, followed by 3 wrong options
- "def": Uzbek translation/definition of the correct answer (string)
- "meanings": object where keys are the 3 WRONG options and values are their Uzbek translations

IMPORTANT RULES:
1. ALL 4 options must be plausible — wrong answers should be tempting distractors, not obviously wrong.
2. The correct answer MUST ALWAYS be the FIRST element in the "options" array.
3. "meanings" must contain exactly the 3 wrong options as keys (NOT the correct answer).
4. Questions should be at B2-C1 level — challenging but fair for upper-intermediate to advanced learners.
5. Uzbek translations must be natural Uzbek, not word-for-word.
6. Sentences should be realistic, like from newspapers, textbooks, or academic writing.
7. No duplicate questions. All 30 must be different.
8. For "Complete the sentence:" type, use ___ to show where the blank is.
9. Return ONLY a valid JSON array, no markdown, no explanation, no code fences.

Example format:
[
  {{
    "type": "Complete the sentence:",
    "question": "The company decided to ___ its operations to Asia.",
    "correct": "expand",
    "options": ["expand", "expend", "expose", "export"],
    "def": "kengaytirmoq",
    "meanings": {{"expend": "sarflamoq", "expose": "fosh qilmoq", "export": "eksport qilmoq"}}
  }},
  {{
    "type": "Find the SYNONYM:",
    "question": "abundant",
    "correct": "plentiful",
    "options": ["plentiful", "scarce", "rare", "limited"],
    "def": "ko'p, mo'l",
    "meanings": {{"scarce": "kam", "rare": "noyob", "limited": "cheklangan"}}
  }},
  {{
    "type": "Complete the collocation:",
    "question": "make a ___",
    "correct": "decision",
    "options": ["decision", "homework", "problem", "sleep"],
    "def": "qaror qabul qilish",
    "meanings": {{"homework": "uy vazifasi", "problem": "muammo", "sleep": "uxlash"}}
  }}
]

Now generate exactly 30 questions for the topic described above. Return ONLY the JSON array."""


def clean_json_response(text):
    """Extract JSON array from Gemini response, handling markdown fences."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r'^```(?:json)?\s*\n?', '', text)
        text = re.sub(r'\n?```\s*$', '', text)
    text = text.strip()
    return text


def validate_question(q):
    """Validate a single question has all required fields and correct structure."""
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
    return True


def generate_vocab_test(topic_info):
    """Call Gemini API and return parsed questions."""
    prompt = PROMPT_TEMPLATE.format(topic=topic_info["prompt_topic"])

    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = model.generate_content(prompt)
            raw = response.text
            cleaned = clean_json_response(raw)
            questions = json.loads(cleaned)

            if not isinstance(questions, list):
                print(f"  WARNING: Response is not a list, retrying...")
                continue

            valid = []
            for q in questions:
                if validate_question(q):
                    valid.append(q)
                else:
                    print(f"  WARNING: Skipping invalid question: {q.get('question', '???')[:50]}")

            if len(valid) < 25:
                print(f"  WARNING: Only {len(valid)} valid questions, retrying...")
                continue

            return valid[:30]

        except json.JSONDecodeError as e:
            print(f"  JSON parse error (attempt {attempt+1}): {e}")
            if attempt < max_retries - 1:
                time.sleep(3)
            continue
        except Exception as e:
            print(f"  API error (attempt {attempt+1}): {e}")
            if attempt < max_retries - 1:
                time.sleep(5)
            continue

    return None


def escape_js_string(s):
    """Escape a string for use inside JS double quotes."""
    if s is None:
        return ""
    return str(s).replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')


def write_vocab_test_js(topic_info, questions):
    """Write the vocabulary test JS file."""
    filename = f"questions V/{topic_info['file']}.js"

    lines = []
    title_text = topic_info["title"].split(" ", 1)[-1] if " " in topic_info["title"] else topic_info["title"]
    lines.append(f'// Vocabulary Test: {title_text} (B2–C1)')
    lines.append(f'// Generated via Gemini API')
    lines.append(f'// Total: {len(questions)} questions')
    lines.append('')
    lines.append('window.ALL_QUESTIONS = [')

    for i, q in enumerate(questions):
        comma = ',' if i < len(questions) - 1 else ''
        qtype = escape_js_string(q['type'])
        question = escape_js_string(q['question'])
        correct = escape_js_string(q['correct'])
        opts = ', '.join(f'"{escape_js_string(o)}"' for o in q['options'])
        defn = escape_js_string(q['def'])

        # Build meanings object string
        meanings_parts = []
        for wrong_opt, uz_meaning in q['meanings'].items():
            meanings_parts.append(f'"{escape_js_string(wrong_opt)}": "{escape_js_string(uz_meaning)}"')
        meanings_str = ', '.join(meanings_parts)

        lines.append(f'  {{type: "{qtype}", question: "{question}", correct: "{correct}", options: [{opts}], def: "{defn}", meanings: {{{meanings_str}}}}}{comma}')

    lines.append('];')
    lines.append('')

    filepath = os.path.join(os.path.dirname(__file__), filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    return filename


def main():
    print(f"Generating {len(TOPICS)} vocabulary tests...\n")

    generated = []
    failed = []

    for i, topic in enumerate(TOPICS):
        print(f"[{i+1}/{len(TOPICS)}] Generating: {topic['title']}...")

        questions = generate_vocab_test(topic)

        if questions:
            filename = write_vocab_test_js(topic, questions)
            print(f"  ✓ Saved {len(questions)} questions to {filename}")
            generated.append(topic)
        else:
            print(f"  ✗ FAILED to generate questions for {topic['title']}")
            failed.append(topic)

        # Rate limiting
        if i < len(TOPICS) - 1:
            time.sleep(4)

    print(f"\n{'='*50}")
    print(f"DONE: {len(generated)} generated, {len(failed)} failed")

    if generated:
        print(f"\nAdd these to vocabTests in landing.html:")
        for t in generated:
            name = t['title'].split(' ', 1)[-1] if ' ' in t['title'] else t['title']
            print(f"      {{ file: 'test.html?test={t['file']}&type=vocabulary', name: '{name}', icon: '{t['icon']}' }},")

    if failed:
        print(f"\nFAILED topics:")
        for t in failed:
            print(f"  - {t['title']}")


if __name__ == "__main__":
    main()
