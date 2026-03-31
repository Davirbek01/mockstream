"""
Generate leveled vocabulary test JS files using Gemini API.
Each set: 30 MCQ questions (10 B1 + 10 B2 + 10 C1) with Uzbek translations.
Output: questions V/<topic>.js files with window.ALL_QUESTIONS array.

Usage:
  python generate_vocab_batch.py 1        # batch 1 (topics 1-10)
  python generate_vocab_batch.py 2        # batch 2 (topics 11-20)
  python generate_vocab_batch.py 3        # batch 3 (topics 21-30)
  python generate_vocab_batch.py all      # all topics
"""

import json
import time
import re
import os
import sys
import google.generativeai as genai

API_KEY = "AIzaSyCfnYXgCySMlckKOdJw6vzRDlBVvJvZrZo"
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")

ALL_TOPICS = [
    # --- Batch 1: Brand-new topics ---
    {"file": "artificial-intelligence01", "title": "AI & Machine Learning", "icon": "🤖",
     "prompt_topic": "Artificial Intelligence and Machine Learning — vocabulary about neural networks, deep learning, algorithms, training data, natural language processing, computer vision, automation, chatbots, predictive models, bias in AI."},
    {"file": "mental-health01", "title": "Mental Health & Well-being", "icon": "🧘",
     "prompt_topic": "Mental Health and Psychological Well-being — vocabulary about anxiety, depression, therapy, counselling, resilience, self-care, mindfulness, burnout, stigma, coping mechanisms, emotional intelligence, trauma recovery."},
    {"file": "social-justice01", "title": "Social Justice & Activism", "icon": "✊",
     "prompt_topic": "Social Justice and Activism — vocabulary about equality, discrimination, protest, advocacy, civil rights, systemic racism, gender equality, inclusivity, privilege, marginalization, grassroots movements, solidarity."},
    {"file": "renewable-energy01", "title": "Renewable Energy & Clean Tech", "icon": "🌱",
     "prompt_topic": "Renewable Energy and Clean Technology — vocabulary about solar panels, wind turbines, hydropower, geothermal, carbon footprint, emissions, sustainability, grid, battery storage, electric vehicles, green hydrogen, decarbonization."},
    {"file": "urban-development01", "title": "Urban Development & Smart Cities", "icon": "🏙️",
     "prompt_topic": "Urban Development and Smart Cities — vocabulary about infrastructure, zoning, gentrification, public transport, urban sprawl, sustainability, IoT sensors, traffic management, green buildings, pedestrian zones, mixed-use development."},
    {"file": "cryptocurrency01", "title": "Cryptocurrency & Blockchain", "icon": "💎",
     "prompt_topic": "Cryptocurrency and Blockchain Technology — vocabulary about Bitcoin, mining, wallet, decentralization, ledger, smart contracts, tokens, DeFi, exchange, volatility, staking, consensus mechanism, encryption."},
    {"file": "robotics-automation01", "title": "Robotics & Automation", "icon": "🦾",
     "prompt_topic": "Robotics and Industrial Automation — vocabulary about sensors, actuators, programming, assembly line robots, drones, autonomous vehicles, machine learning integration, cobots (collaborative robots), precision engineering, AI-driven manufacturing."},
    {"file": "public-health01", "title": "Public Health & Epidemics", "icon": "🦠",
     "prompt_topic": "Public Health and Epidemics — vocabulary about pandemic, quarantine, vaccination, outbreak, epidemiology, contact tracing, herd immunity, WHO, sanitation, mortality rate, healthcare system, preventive medicine."},
    {"file": "sustainability01", "title": "Sustainability & Green Living", "icon": "♻️",
     "prompt_topic": "Sustainability and Green Living — vocabulary about recycling, composting, zero waste, eco-friendly, carbon offset, reusable, biodegradable, organic, ethical consumption, circular economy, upcycling, environmental footprint."},
    {"file": "remote-work01", "title": "Remote Work & Digital Nomads", "icon": "🏠",
     "prompt_topic": "Remote Work and Digital Nomad Lifestyle — vocabulary about telecommuting, coworking space, work-life balance, virtual meetings, freelancing, time zones, productivity tools, digital collaboration, asynchronous communication, gig economy."},

    # --- Batch 2: More new topics ---
    {"file": "data-analytics01", "title": "Data Science & Analytics", "icon": "📊",
     "prompt_topic": "Data Science and Analytics — vocabulary about datasets, visualization, machine learning, statistics, regression, prediction, dashboard, big data, correlation, outlier, algorithm, data mining, preprocessing."},
    {"file": "e-commerce01", "title": "E-Commerce & Online Business", "icon": "🛒",
     "prompt_topic": "E-Commerce and Online Business — vocabulary about platform, checkout, shopping cart, payment gateway, drop-shipping, fulfillment, conversion rate, SEO, digital marketing, customer retention, subscription model, marketplace."},
    {"file": "elderly-care01", "title": "Elderly Care & Aging", "icon": "👴",
     "prompt_topic": "Elderly Care and Aging Society — vocabulary about dementia, care home, pension, retirement, geriatrics, mobility, assisted living, loneliness, palliative care, social isolation, cognitive decline, caregiver."},
    {"file": "marine-pollution01", "title": "Marine Pollution & Ocean Health", "icon": "🌊",
     "prompt_topic": "Marine Pollution and Ocean Health — vocabulary about microplastics, oil spill, coral bleaching, ocean acidification, marine debris, sewage discharge, toxic waste, dead zones, biodiversity loss, coastal erosion, conservation efforts."},
    {"file": "biotechnology01", "title": "Biotechnology & Innovation", "icon": "🧪",
     "prompt_topic": "Biotechnology and Scientific Innovation — vocabulary about gene editing, CRISPR, cloning, stem cells, biofuel, fermentation, pharmaceutical, clinical trial, enzyme, DNA sequencing, GMO, bioethics, synthetic biology."},

    # --- Batch 2 continued: "02" versions with DIFFERENT content ---
    {"file": "crime-law02", "title": "Crime & Justice: Advanced", "icon": "⚖️",
     "prompt_topic": "Crime and Justice advanced vocabulary — topics like cybercrime, white-collar crime, sentencing reform, rehabilitation, recidivism, parole, probation, plea bargain, juror, verdict, extradition, statute of limitations. IMPORTANT: Do NOT use questions from basic crime-law topics (murder, theft, robbery). Focus on ADVANCED legal and criminal justice concepts."},
    {"file": "business-economics02", "title": "Business & Economics: Advanced", "icon": "📈",
     "prompt_topic": "Business and Economics advanced vocabulary — topics like mergers and acquisitions, venture capital, IPO, hedge fund, bear/bull market, bankruptcy, diversification, yield, deficit, austerity, quantitative easing, market capitalization. IMPORTANT: Focus on ADVANCED financial and macroeconomic terms, NOT basic business words."},
    {"file": "medicine-healthcare02", "title": "Medicine: Cutting Edge", "icon": "🏥",
     "prompt_topic": "Medicine and Healthcare advanced vocabulary — topics like immunotherapy, telemedicine, organ transplant, prognosis, chronic condition, remission, clinical trial, biopsy, pathogen, antibiotic resistance, precision medicine, gene therapy. IMPORTANT: Focus on ADVANCED medical and healthcare terminology, NOT basic body parts or common illnesses."},
    {"file": "education-learning02", "title": "Education: Modern Trends", "icon": "📚",
     "prompt_topic": "Education modern trends vocabulary — topics like blended learning, gamification, MOOCs, digital literacy, standardized testing, inclusive education, flipped classroom, learning management system, microlearning, peer assessment, EdTech, learning outcomes. IMPORTANT: Focus on MODERN education technology and pedagogy, NOT basic school vocabulary."},
    {"file": "environment-climate02", "title": "Environment: Advanced", "icon": "🌍",
     "prompt_topic": "Environment and Climate Change advanced vocabulary — topics like carbon capture, deforestation, greenhouse effect, ozone depletion, environmental audit, cap-and-trade, rewilding, ecological footprint, climate refugee, permafrost thawing, net-zero emissions, biomass. IMPORTANT: Focus on ADVANCED environmental science terms, NOT basic nature words."},

    # --- Batch 3: More "02" versions + new topics ---
    {"file": "science-research02", "title": "Science: Cutting Edge", "icon": "🔬",
     "prompt_topic": "Science and Research advanced vocabulary — topics like peer review, hypothesis, methodology, replication crisis, double-blind study, control group, quantum computing, nanotechnology, particle physics, scientific consensus, falsifiability, meta-analysis. IMPORTANT: Focus on ADVANCED scientific method and cutting-edge research terms."},
    {"file": "politics-government02", "title": "Politics: Advanced", "icon": "🏛️",
     "prompt_topic": "Politics and Government advanced vocabulary — topics like gerrymandering, filibuster, bipartisan, constituency, referendum, manifesto, coalition, lobbying, impeachment, sovereignty, autocracy, parliamentary procedure. IMPORTANT: Focus on ADVANCED political science concepts, NOT basic government vocabulary."},
    {"file": "travel-holiday02", "title": "Travel: Advanced", "icon": "✈️",
     "prompt_topic": "Travel and Tourism advanced vocabulary — topics like ecotourism, sustainable travel, overtourism, cultural immersion, visa waiver, layover, itinerary, expedition, backpacking, travel advisory, customs declaration, jet lag, acclimatization. IMPORTANT: Different content from basic travel vocabulary."},
    {"file": "food-nutrition02", "title": "Food & Health: Advanced", "icon": "🥗",
     "prompt_topic": "Food and Nutrition advanced vocabulary — topics like macronutrients, micronutrients, dietary fiber, glycemic index, food additives, preservatives, plant-based diet, food insecurity, malnutrition, metabolism, caloric deficit, intermittent fasting, probiotics. IMPORTANT: Focus on ADVANCED nutrition science terms."},
    {"file": "psychology-mind02", "title": "Psychology: Advanced", "icon": "🧠",
     "prompt_topic": "Psychology advanced vocabulary — topics like cognitive dissonance, Pavlovian conditioning, attachment theory, neuroplasticity, implicit bias, Maslow's hierarchy, defense mechanism, psychosomatic, dissociative disorder, positive reinforcement, placebo effect, Gestalt. IMPORTANT: Focus on ADVANCED psychology theories and clinical terms."},
    {"file": "technology-digital02", "title": "Digital Technology: Advanced", "icon": "💻",
     "prompt_topic": "Digital Technology advanced vocabulary — topics like cloud computing, API, open source, bandwidth, encryption, firewall, phishing, two-factor authentication, user interface, backend, latency, scalability, agile development. IMPORTANT: Different content from basic technology vocabulary."},
    {"file": "sports-competition02", "title": "Sports: Advanced", "icon": "🏆",
     "prompt_topic": "Sports and Competition advanced vocabulary — topics like doping, anti-doping agency, sportsmanship, relegation, draft pick, seeding, underdog, forfeit, penalty shootout, extra time, VAR, transfer window, hat-trick. IMPORTANT: Focus on ADVANCED sports terminology and competition concepts."},
    {"file": "health-body02", "title": "Health & Fitness: Advanced", "icon": "💪",
     "prompt_topic": "Health and Fitness advanced vocabulary — topics like cardiovascular, resistance training, HIIT, flexibility, core strength, repetitions, progressive overload, muscle hypertrophy, VO2 max, recovery, stretching routine, supplements, body composition. IMPORTANT: Focus on ADVANCED fitness and exercise science terms."},
    {"file": "work-career02", "title": "Career Development: Advanced", "icon": "💼",
     "prompt_topic": "Career Development advanced vocabulary — topics like mentorship, networking, upskilling, career pivot, headhunter, severance, probation period, KPIs, performance review, corporate ladder, glass ceiling, burnout, work culture. IMPORTANT: Focus on ADVANCED career and professional development terms."},
    {"file": "media-advertising02", "title": "Media & PR: Advanced", "icon": "📢",
     "prompt_topic": "Media and Public Relations advanced vocabulary — topics like spin doctor, press release, viral marketing, clickbait, media bias, censorship, propaganda, editorial, investigative journalism, defamation, libel, news cycle, fact-checking. IMPORTANT: Focus on ADVANCED media literacy and PR concepts."},
]

PROMPT_TEMPLATE = """You are creating a LEVELED multiple-choice vocabulary test for English learners.

Topic: {topic}

Generate EXACTLY 30 MCQ vocabulary questions as a JSON array:
- Questions 1–10: B1 level (intermediate — everyday vocabulary, common collocations)
- Questions 11–20: B2 level (upper-intermediate — more sophisticated vocabulary, less common expressions)
- Questions 21–30: C1 level (advanced — academic/professional vocabulary, nuanced meanings, rare collocations)

Use a MIX of these question types (roughly equal distribution across all levels):
1. "Complete the sentence:" — A sentence with a blank (use ___ for the blank). The student picks the correct word/phrase.
2. "Find the SYNONYM:" — A word or phrase is given. The student picks the closest meaning.
3. "Find the ANTONYM:" — A word or phrase is given. The student picks the opposite.
4. "Complete the collocation:" — An incomplete collocation. The student picks the missing word.
5. "What does this mean?" — An idiom, phrase, or advanced word. The student picks the correct definition.
6. "Choose the correct option:" — A sentence with a blank. The student picks the right word (testing confusable words).

Each question must have these exact JSON fields:
- "type": one of the 6 types above (string)
- "question": the question text (string). Use ___ for blanks.
- "correct": the correct answer (string)
- "options": array of exactly 4 strings — the CORRECT answer MUST be the FIRST element, followed by 3 wrong options
- "def": Uzbek translation/definition of the correct answer (string, natural Uzbek)
- "meanings": object where keys are the 3 WRONG options and values are their Uzbek translations
- "level": exactly "B1", "B2", or "C1" depending on which group (1-10 = B1, 11-20 = B2, 21-30 = C1)

IMPORTANT RULES:
1. ALL 4 options must be plausible — wrong answers should be tempting distractors, not obviously wrong.
2. The correct answer MUST ALWAYS be the FIRST element in the "options" array.
3. "meanings" must contain exactly the 3 wrong options as keys (NOT the correct answer).
4. B1 questions should use common, everyday vocabulary related to the topic.
5. B2 questions should use more sophisticated, less common vocabulary.
6. C1 questions should use academic, professional, or rare vocabulary with nuanced meanings.
7. Uzbek translations must be natural Uzbek, not word-for-word.
8. No duplicate questions. All 30 must be different.
9. Sentences should be realistic, from newspapers, textbooks, or academic writing.
10. Return ONLY a valid JSON array, no markdown, no explanation, no code fences.

Example format:
[
  {{"type": "Complete the sentence:", "question": "Many people now ___ from home instead of going to the office.", "correct": "work", "options": ["work", "job", "employ", "career"], "def": "ishlash", "meanings": {{"job": "ish o'rni", "employ": "ishga olmoq", "career": "martaba"}}, "level": "B1"}},
  {{"type": "Find the SYNONYM:", "question": "abundant", "correct": "plentiful", "options": ["plentiful", "scarce", "rare", "limited"], "def": "ko'p, mo'l", "meanings": {{"scarce": "kam", "rare": "noyob", "limited": "cheklangan"}}, "level": "B2"}},
  {{"type": "What does this mean?", "question": "paradigm shift", "correct": "A fundamental change in approach or underlying assumptions.", "options": ["A fundamental change in approach or underlying assumptions.", "A minor adjustment to a plan.", "A gradual improvement over time.", "A return to traditional methods."], "def": "yondashuvning tubdan o'zgarishi", "meanings": {{"A minor adjustment to a plan.": "rejaga kichik tuzatish", "A gradual improvement over time.": "vaqt o'tishi bilan asta-sekin yaxshilanish", "A return to traditional methods.": "an'anaviy usullarga qaytish"}}, "level": "C1"}}
]

Now generate exactly 30 questions (10 B1 + 10 B2 + 10 C1) for the topic described above. Return ONLY the JSON array."""


def clean_json_response(text):
    """Extract JSON array from Gemini response, handling markdown fences."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r'^```(?:json)?\s*\n?', '', text)
        text = re.sub(r'\n?```\s*$', '', text)
    text = text.strip()
    # Try to find the JSON array if there's extra text
    start = text.find('[')
    if start > 0:
        text = text[start:]
    # Find the last ] and trim
    end = text.rfind(']')
    if end >= 0 and end < len(text) - 1:
        text = text[:end+1]
    return text


def validate_question(q):
    """Validate a single question has all required fields and correct structure."""
    required = ("type", "question", "correct", "options", "def", "meanings", "level")
    if not all(k in q for k in required):
        return False
    if not isinstance(q["options"], list) or len(q["options"]) != 4:
        return False
    if q["correct"] != q["options"][0]:
        return False
    if not isinstance(q["meanings"], dict) or len(q["meanings"]) != 3:
        return False
    wrong_opts = set(q["options"][1:])
    meaning_keys = set(q["meanings"].keys())
    if wrong_opts != meaning_keys:
        return False
    if q["level"] not in ("B1", "B2", "C1"):
        return False
    return True


def generate_vocab_test(topic_info):
    """Call Gemini API and return parsed questions."""
    prompt = PROMPT_TEMPLATE.format(topic=topic_info["prompt_topic"])

    max_retries = 5
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
                time.sleep(5)
            continue
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "quota" in err_str.lower() or "rate" in err_str.lower():
                wait = 60 * (attempt + 1)
                print(f"  Rate limited (attempt {attempt+1}), waiting {wait}s...")
                time.sleep(wait)
            else:
                print(f"  API error (attempt {attempt+1}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(5)
            continue

    return None


def escape_js_string(s):
    """Escape a string for use inside JS double quotes."""
    if s is None:
        return ""
    return str(s).replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n').replace("'", "\\'")


def write_vocab_test_js(topic_info, questions):
    """Write the vocabulary test JS file."""
    filename = f"questions V/{topic_info['file']}.js"

    # Count levels
    b1 = sum(1 for q in questions if q['level'] == 'B1')
    b2 = sum(1 for q in questions if q['level'] == 'B2')
    c1 = sum(1 for q in questions if q['level'] == 'C1')

    lines = []
    lines.append(f'// Vocabulary Test: {topic_info["title"]} (Leveled: B1→B2→C1)')
    lines.append(f'// Generated via Gemini API — 10 B1 + 10 B2 + 10 C1')
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
        level = q['level']

        meanings_parts = []
        for wrong_opt, uz_meaning in q['meanings'].items():
            meanings_parts.append(f'"{escape_js_string(wrong_opt)}": "{escape_js_string(uz_meaning)}"')
        meanings_str = ', '.join(meanings_parts)

        lines.append(f'  {{type: "{qtype}", question: "{question}", correct: "{correct}", options: [{opts}], def: "{defn}", meanings: {{{meanings_str}}}, level: "{level}"}}{comma}')

    lines.append('];')
    lines.append('')

    filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    return filename, b1, b2, c1


def main():
    # Parse CLI args for batch selection
    if len(sys.argv) < 2:
        print("Usage: python generate_vocab_batch.py <batch_number|all>")
        print("  batch 1 = topics 1-10, batch 2 = topics 11-20, batch 3 = topics 21-30")
        sys.exit(1)

    arg = sys.argv[1].lower()
    if arg == "all":
        topics = ALL_TOPICS
    elif arg in ("1", "2", "3"):
        batch = int(arg)
        start = (batch - 1) * 10
        topics = ALL_TOPICS[start:start + 10]
    else:
        print(f"Invalid argument: {arg}")
        sys.exit(1)

    print(f"Generating {len(topics)} vocabulary tests...\n")

    generated = []
    skipped = []
    failed = []

    for i, topic in enumerate(topics):
        idx = ALL_TOPICS.index(topic) + 1
        filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), f"questions V/{topic['file']}.js")

        # Skip already-generated files
        if os.path.exists(filepath):
            print(f"[{idx}/30] SKIP (exists): {topic['icon']} {topic['title']}")
            skipped.append(topic)
            continue

        print(f"[{idx}/30] Generating: {topic['icon']} {topic['title']}...")

        questions = generate_vocab_test(topic)

        if questions:
            filename, b1, b2, c1 = write_vocab_test_js(topic, questions)
            print(f"  ✓ Saved {len(questions)} questions to {filename} (B1:{b1} B2:{b2} C1:{c1})")
            generated.append(topic)
        else:
            print(f"  ✗ FAILED to generate: {topic['title']}")
            failed.append(topic)

        # Rate limiting
        if i < len(topics) - 1:
            time.sleep(4)

    print(f"\n{'='*60}")
    print(f"DONE: {len(generated)} generated, {len(skipped)} skipped, {len(failed)} failed")

    if generated:
        print(f"\nAdd these to vocabTests in landing.html:")
        for t in generated:
            print(f"      {{ file: 'test.html?test={t['file']}&type=vocabulary', name: '{t['title']}', icon: '{t['icon']}' }},")

    if failed:
        print(f"\nFAILED topics:")
        for t in failed:
            print(f"  - {t['icon']} {t['title']}")


if __name__ == "__main__":
    main()
