"""
Generate grammar test JS files using Gemini API.
Style: englishtestsonline.com MCQ grammar tests.
Each set: 30 MCQ questions with 4 options, grammar rule explanations.
Output: questions G/<topic>.js files with window.ALL_QUESTIONS array.
"""

import json
import time
import re
import os
import google.generativeai as genai

API_KEY = "AIzaSyCJw33IioCjDJUUe66wnP05IWyk1kb5iO4"
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

TOPICS = [
    {
        "file": "nominal-relative-clauses01",
        "title": "🌀 Nominal Relative Clauses",
        "icon": "🌀",
        "prompt_topic": "Nominal Relative Clauses (Free Relative Clauses) — B2-C1 level. Test: whatever (Whatever you say, I won't change my mind = No matter what / anything that), whoever (Whoever finishes first can leave = Anyone who), whichever (Take whichever seat you like = any one that), wherever (Sit wherever you want = in any place that), whenever (Come whenever you like = at any time that), however (However hard I try, I can't do it = No matter how), what as nominal relative (What she said was true = The thing that, I'll give you what you need = the thing that you need), whatever vs what (What he said surprised me — specific vs Whatever he says surprises me — any/all). Distinguish nominal relatives from interrogative clauses (I don't know what she said — indirect question vs What she said was wrong — nominal relative)."
    },
    {
        "file": "transitive-intransitive01",
        "title": "🔄 Transitive vs Intransitive",
        "icon": "🔄",
        "prompt_topic": "Transitive and Intransitive Verbs — B1-C1 level. Test: strictly transitive verbs that need an object (enjoy, discuss, mention, suggest — I enjoyed the film NOT I enjoyed), strictly intransitive verbs that cannot take an object (arrive, sleep, die, happen, occur, appear, disappear — She arrived NOT She arrived the airport), verbs that are both transitive and intransitive with same meaning (eat, read, write, sing, cook — She's eating / She's eating lunch), ergative verbs where subject = object (The door opened / He opened the door, The glass broke / She broke the glass, The water boiled / I boiled the water, The ship sank / They sank the ship), common errors (discuss about — WRONG, enter into the room — WRONG, marry with — WRONG, explain me — WRONG should be explain to me, reach to — WRONG). Raise vs rise, lay vs lie, sit vs set."
    },
    {
        "file": "ditransitive-verbs01",
        "title": "🎁 Double Object Verbs",
        "icon": "🎁",
        "prompt_topic": "Ditransitive Verbs and Double Object Constructions — B1-C1 level. Test: verbs with two objects: indirect + direct (She gave me a book = She gave a book to me), verbs with 'to' pattern (give/send/show/tell/teach/offer/lend/pass/bring/write/read + object + to + person), verbs with 'for' pattern (buy/make/cook/get/find/build/save/order + object + for + person — She bought me a gift = She bought a gift for me), verbs that ONLY allow double object (cost, wish, charge — It cost me $50 — NOT It cost $50 to me), verbs that DON'T allow double object (explain, describe, suggest, announce, say — Explain it to me NOT Explain me it, Say it to me NOT Say me it), passive of ditransitive (I was given a book / A book was given to me — both possible). Common errors with explain, suggest, describe, say."
    },
    {
        "file": "extraposition01",
        "title": "📤 Extraposition",
        "icon": "📤",
        "prompt_topic": "Extraposition — B2-C1 level. Test: extraposed subject with 'it' (It is important to study hard = To study hard is important, It surprised me that she left = That she left surprised me, It's no use complaining = Complaining is no use), extraposed subject with 'there' (There's no point arguing, There's nothing wrong with asking), object extraposition (I find it difficult to concentrate = I find concentrating difficult, She made it clear that she disagreed, I owe it to you that I passed, I take it that you agree), extraposition after adjectives (It is essential that..., It is vital to..., It is worth noting that...), extraposition with passive reporting verbs (It is believed that..., It has been suggested that..., It was announced that...), when NOT to extrapose (short subjects: He is wrong — NOT It is wrong, he). Recognise extraposed vs non-extraposed versions."
    },
    {
        "file": "gradable-ungradable01",
        "title": "🌡️ Gradable vs Ungradable",
        "icon": "🌡️",
        "prompt_topic": "Gradable and Ungradable Adjectives — B1-C1 level. Test: gradable adjectives with grading adverbs (very hot, quite cold, a bit tired, fairly expensive, rather good, extremely difficult, slightly nervous), ungradable/extreme adjectives with non-grading adverbs (absolutely exhausted NOT very exhausted, completely destroyed NOT very destroyed, utterly ridiculous, totally impossible, absolutely furious, entirely different, perfectly fine), classifying adjectives (no degree — nuclear, digital, annual, medical, wooden, daily — NOT very nuclear), gradable-ungradable pairs (hot/boiling, cold/freezing, tired/exhausted, big/enormous, small/tiny, angry/furious, good/excellent, bad/awful, hungry/starving, funny/hilarious, surprised/amazed), 'really' with both types (really hot / really boiling — both OK), 'pretty' as informal intensifier. Common collocations: deeply concerned, highly unlikely, bitterly disappointed, widely known."
    },
    {
        "file": "nominalisation01",
        "title": "📝 Nominalisation",
        "icon": "📝",
        "prompt_topic": "Nominalisation — B2-C1 level. Test: verb to noun (decide → decision, develop → development, arrive → arrival, discover → discovery, refuse → refusal, fail → failure, grow → growth, lose → loss, permit → permission, explain → explanation, survive → survival, respond → response, occur → occurrence), adjective to noun (important → importance, different → difference, strong → strength, weak → weakness, happy → happiness, poor → poverty, wide → width, deep → depth, able → ability, generous → generosity, real → reality), using nominalisation in formal writing (We decided to... → The decision to..., They failed because... → Their failure was due to..., People discovered that... → The discovery that...), common suffixes (-tion, -sion, -ment, -ance/-ence, -ity, -ness, -al, -ure, -th). Identify correct nominalized form in context."
    },
    {
        "file": "auxiliary-verbs01",
        "title": "⚙️ Auxiliary Verbs",
        "icon": "⚙️",
        "prompt_topic": "Auxiliary Verbs and Their Patterns — B1-C1 level. Test: primary auxiliaries be/have/do in questions and negatives (Do you like it?, She hasn't finished, Is he coming?), auxiliary 'do' for emphasis (I DO like coffee, She DOES work hard, He DID come), auxiliary in short answers (Yes, I do / No, she hasn't / Yes, he is), echo questions with auxiliary (She left. — Did she? / He's coming. — Is he?), auxiliary in reply questions and short responses (So do I, Neither did she, I hope so, I think not), auxiliary in tag questions (She's coming, isn't she? / They don't like it, do they?), auxiliary after 'so/neither/nor' for agreement (So have I, Neither would I), avoiding repetition with auxiliary (She can swim and so can I, He hasn't been there and neither have I, I told him to leave but he wouldn't), dare and need as auxiliaries vs main verbs (He daren't go vs He doesn't dare to go, You needn't worry vs You don't need to worry)."
    },
    {
        "file": "common-grammar-errors01",
        "title": "⚠️ Common Grammar Errors",
        "icon": "⚠️",
        "prompt_topic": "Common Grammar Errors and Corrections — B1-C1 level. Test: subject-verb agreement errors (Everyone are → Everyone is, The news are → The news is, Neither of them have → Neither of them has), pronoun errors (between you and I → between you and me, Me and him went → He and I went), double negatives (I don't know nothing → I don't know anything), misplaced modifiers (I only eat fish → I eat only fish, Running down the street, the bus was missed → While I was running...), dangling participles (Having finished dinner, the TV was turned on — WHO finished?), incorrect prepositions (interested about → interested in, depend of → depend on, married with → married to), tense consistency errors, comma splices (She was tired, she left → She was tired, so she left), its vs it's, their vs there vs they're, your vs you're, affect vs effect, fewer vs less, who vs whom."
    },
    {
        "file": "conditional-inversion01",
        "title": "🔃 Conditional Inversion",
        "icon": "🔃",
        "prompt_topic": "Conditional Inversion (Inverted Conditionals) — B2-C1 level. Test: Type 1 inversion with should (Should you need any help, please call me = If you should need...), Type 2 inversion with were (Were I you, I would accept = If I were you, Were she here, she would help = If she were here), Type 3 inversion with had (Had I known, I would have come = If I had known, Had she studied harder, she would have passed = If she had studied harder), negative inversion (Had it not been for your help, I would have failed = If it hadn't been for..., Were it not for the rain, we would go = If it weren't for...), formal register (these are more formal than 'if' versions), mixing inverted conditionals in longer passages, common errors (NOT: Would I have known — WRONG, must be Had I known). Recognise inverted conditionals in reading and convert between forms."
    },
    {
        "file": "tense-aspect-review01",
        "title": "🕰️ Tense & Aspect Review",
        "icon": "🕰️",
        "prompt_topic": "Tense and Aspect Comprehensive Review — B2-C1 level. Test all 12 tense-aspect combinations in context: present simple (facts, habits, schedules), present continuous (now, temporary, future arrangement), present perfect simple (experience, result, unfinished), present perfect continuous (duration, recent activity), past simple (finished past), past continuous (interrupted, background), past perfect simple (before past), past perfect continuous (duration before past), future simple will (prediction, decision), future continuous (in progress in future), future perfect (completed before future point), future perfect continuous (duration up to future point). Key contrasts: present perfect vs past simple, past simple vs past continuous, present perfect simple vs continuous, will vs going to vs present continuous for future. Choose the correct tense-aspect in complex paragraphs."
    }
]

PROMPT_TEMPLATE = """You are creating a multiple-choice English grammar test in the style of englishtestsonline.com — MCQ grammar exercises.

Topic: {topic}

Generate EXACTLY 30 MCQ grammar questions as a JSON array.

Use a MIX of these question types (distribute roughly equally):
1. "Complete the sentence:" — A sentence with a blank (use ___ for the blank). The student picks the correct grammar form.
2. "Choose the correct option:" — A sentence where students must pick the grammatically correct word/phrase to fill a blank.
3. "Which is correct?" — Present a question like "Which sentence is grammatically correct?" and give 4 sentence options.

Each question must have these exact JSON fields:
- "type": one of the types above (string)
- "question": the question text — a sentence with ___ blank, or "Which sentence is grammatically correct?" (string, plain text only, NO HTML tags)
- "correct": the correct answer (string)
- "options": array of exactly 4 strings — the CORRECT answer MUST be the FIRST element, followed by 3 wrong options
- "def": a SHORT English explanation of the grammar rule being tested (string, max 15 words)

IMPORTANT RULES:
1. ALL 4 options must be plausible — wrong answers should be common grammar mistakes students actually make.
2. The correct answer MUST ALWAYS be the FIRST element in the "options" array.
3. Questions should be at B1-C1 level — challenging but fair for intermediate to advanced learners.
4. "def" should briefly explain WHY the correct answer is right (the grammar rule), in English.
5. Sentences should be realistic, like from textbooks, newspapers, or everyday communication.
6. No duplicate questions. All 30 must be different.
7. For "Complete the sentence:" type, use ___ to show where the blank is.
8. Return ONLY a valid JSON array, no markdown, no explanation, no code fences.
9. Test a VARIETY of sub-rules within the topic — don't repeat the same grammar pattern.
10. Do NOT use any HTML tags like <u>, <b>, etc. Plain text only.

Example format:
[
  {{
    "type": "Complete the sentence:",
    "question": "If I ___ you, I would take that job offer.",
    "correct": "were",
    "options": ["were", "was", "am", "would be"],
    "def": "Second conditional uses 'were' for all subjects"
  }},
  {{
    "type": "Choose the correct option:",
    "question": "By the time we arrived, the film ___.",
    "correct": "had already started",
    "options": ["had already started", "already started", "has already started", "was already starting"],
    "def": "Past perfect for action completed before another past action"
  }},
  {{
    "type": "Which is correct?",
    "question": "Which sentence is grammatically correct?",
    "correct": "She suggested going to the cinema.",
    "options": ["She suggested going to the cinema.", "She suggested to go to the cinema.", "She suggested us to go to the cinema.", "She suggested that we should to go."],
    "def": "suggest + gerund OR suggest + (that) + subjunctive"
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
    required = ("type", "question", "correct", "options", "def")
    if not all(k in q for k in required):
        return False
    if not isinstance(q["options"], list) or len(q["options"]) != 4:
        return False
    if q["correct"] != q["options"][0]:
        return False
    return True


def generate_grammar_test(topic_info):
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
                    print(f"  WARNING: Skipping invalid question: {str(q.get('question', '???'))[:60]}")

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


def write_grammar_test_js(topic_info, questions):
    """Write the grammar test JS file."""
    filename = f"questions G/{topic_info['file']}.js"

    lines = []
    title_text = topic_info["title"].split(" ", 1)[-1] if " " in topic_info["title"] else topic_info["title"]
    lines.append(f'// Grammar Test: {title_text} (B1–C1)')
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

        lines.append(f'  {{type: "{qtype}", question: "{question}", correct: "{correct}", options: [{opts}], def: "{defn}"}}{comma}')

    lines.append('];')
    lines.append('')

    filepath = os.path.join(os.path.dirname(__file__), filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    return filename


def main():
    print(f"Generating {len(TOPICS)} grammar tests...\n")

    generated = []
    failed = []

    for i, topic in enumerate(TOPICS):
        print(f"[{i+1}/{len(TOPICS)}] Generating: {topic['title']}...")

        questions = generate_grammar_test(topic)

        if questions:
            filename = write_grammar_test_js(topic, questions)
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
        print(f"\nAdd these to grammarTests in landing.html:")
        for t in generated:
            name = t['title'].split(' ', 1)[-1] if ' ' in t['title'] else t['title']
            print(f"      {{ file: 'test.html?test={t['file']}&type=grammar', name: '{name}', icon: '{t['icon']}' }},")

    if failed:
        print(f"\nFAILED topics:")
        for t in failed:
            print(f"  - {t['title']}")


if __name__ == "__main__":
    main()
