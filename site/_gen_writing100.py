"""
Generate CEFR Writing Mock 100 leveled samples using Gemini API.
Topic: Reading — printed books vs e-books.
"""
import json, re, subprocess, textwrap

API_KEY = "AIzaSyC61g88nXtTAlY53GVKl4HE-gjzAvz1T-o"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"

# ── Context & prompts designed for Mock 100 ──────────────────────────
P1_CONTEXT = "You are a student at a local college. The college library has recently announced a plan to replace most of its printed books with e-books and digital reading devices."
P1_SCENARIO = (
    "Dear Students,\n\n"
    "We are excited to announce that our library will soon transition to a primarily digital collection! "
    "E-readers and tablets will be available for loan, and thousands of new e-book titles will be added.\n"
    "We would love to hear your thoughts. How do you feel about this change? "
    "Do you prefer reading printed books or e-books?\n"
    "What suggestions do you have to make this transition smoother for everyone?\n\n"
    "Best regards,\nThe Library Committee"
)

T11_PROMPT = "Write a letter to your friend, who loves reading but has never tried e-books. Tell them about the library's plan and share your opinion about printed books versus e-books."
T12_PROMPT = "Write a letter to the library committee. Share your feelings about the plan and suggest what they should do to improve the transition."
T2_PROMPT = 'You are participating in an online discussion. The question is: Should people read printed books or e-books? Post your response, giving reasons and examples. Write 180–200 words.'

LEVELS = ["A1", "A2", "B1", "B2"]

def ask_gemini(prompt, retries=2):
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.85, "maxOutputTokens": 4096}
    }
    payload_json = json.dumps(payload, ensure_ascii=False)
    for attempt in range(retries + 1):
        try:
            result = subprocess.run(
                ["curl.exe", "-s", "--max-time", "60", "-X", "POST",
                 "-H", "Content-Type: application/json",
                 "-d", payload_json, URL],
                capture_output=True, text=True, timeout=70, encoding="utf-8"
            )
            data = json.loads(result.stdout)
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            print(f"  ⚠ attempt {attempt+1} failed: {e}")
    return ""

def gen_model_sample(task_key, prompt, target, context_info):
    """Generate a model answer WITH token annotations."""
    system = textwrap.dedent(f"""\
    You are an expert CEFR B1–B2 English writing sample generator.
    Context: {context_info}
    Task: {prompt}
    Target length: {target}

    Write a SINGLE model answer at solid B1–B2 level.
    Annotate vocabulary with HTML spans using these classes:
      - colloc  → collocations (2-3 word phrases)
      - phrasal → phrasal verbs
      - adv     → useful adverbs / linking words
      - modal   → modal verbs (should, would, could, may, might, must)
      - idiom   → idiomatic expressions

    Format: <span class="ml-token TYPE">WORD</span>
    Example: I <span class="ml-token adv">recently</span> discovered that <span class="ml-token colloc">digital reading</span> is ...

    Include 8-15 annotated tokens spread naturally. Use \\n for paragraph breaks.
    Output ONLY the sample text, no extra commentary.""")
    return ask_gemini(system)

def gen_leveled_sample(task_key, prompt, target, level, context_info):
    """Generate a sample at a specific CEFR level."""
    level_guides = {
        "A1": "Very basic English. 2-4 very short sentences. Simple subject-verb-object structures. Limited vocabulary (50-100 most common words). Many grammar mistakes. May be incomplete or incoherent.",
        "A2": "Basic English. 4-6 simple sentences. Present and past tense mainly. Basic connectors (and, but, because). Some errors but message is understandable. Around 40-60 words for short tasks, 80-100 for longer.",
        "B1": "Intermediate English. Well-organized paragraphs. Uses connectors like 'however', 'for example', 'in my opinion'. Some complex sentences. Mostly accurate grammar. Meets the word target approximately.",
        "B2": "Upper-intermediate English. Sophisticated vocabulary and varied sentence structures. Uses advanced connectors ('Furthermore', 'Nevertheless', 'Consequently'). Nuanced arguments. Accurate grammar with occasional minor errors. Meets or slightly exceeds word target.",
    }
    system = textwrap.dedent(f"""\
    You are generating a CEFR {level} level writing sample.
    Context: {context_info}
    Task: {prompt}
    Target length: {target}
    Level characteristics: {level_guides[level]}

    Write a SINGLE sample answer that clearly demonstrates {level} level writing.
    Wrap the answer in <p> tags. Use <br> for line breaks within paragraphs.
    Output ONLY the sample text wrapped in <p> tags, no commentary.""")
    return ask_gemini(system)

def gen_uz_translation(en_text, level_label):
    """Translate an English sample to Uzbek."""
    clean = re.sub(r'<span[^>]*>', '', en_text)
    clean = clean.replace('</span>', '')
    system = textwrap.dedent(f"""\
    Translate the following English text to Uzbek. Keep HTML tags (<p>, <br>) intact.
    Do not add any commentary, just output the Uzbek translation.

    {clean}""")
    return ask_gemini(system)

def gen_vocabulary(task_key, prompt, context_info):
    """Generate vocabulary list for a task."""
    system = textwrap.dedent(f"""\
    Context: {context_info}
    Task prompt: {prompt}

    Generate exactly 15 English-Uzbek vocabulary pairs relevant to this writing task.
    These should be useful collocations, phrases, and key words a student would need.
    Output as a JSON array of objects with "en" and "uz" keys.
    Example: [{{"en": "printed books", "uz": "bosma kitoblar"}}, ...]
    Output ONLY valid JSON, no commentary.""")
    raw = ask_gemini(system)
    # Extract JSON array
    match = re.search(r'\[.*\]', raw, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except:
            pass
    return []

def gen_token_translations(model_sample):
    """Extract annotated tokens and generate translations."""
    tokens = re.findall(r'<span class="ml-token (\w+)">([^<]+)</span>', model_sample)
    result = {}
    if not tokens:
        return result
    token_list = [(t, typ) for typ, t in tokens]
    prompt = textwrap.dedent(f"""\
    Translate these English words/phrases to Uzbek. Return as JSON object.
    Each key is the English phrase, value is an object with "uz" (Uzbek translation) and "type" (provided).

    Tokens: {json.dumps(token_list)}

    Example output: {{"digital reading": {{"uz": "raqamli o'qish", "type": "colloc"}}}}
    Output ONLY valid JSON.""")
    raw = ask_gemini(prompt)
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        try:
            result = json.loads(match.group())
        except:
            pass
    return result

# ── Main generation ──────────────────────────────────────────────────
print("=" * 60)
print("Generating CEFR Writing Mock 100")
print("=" * 60)

tasks_data = {
    "p1_context": P1_CONTEXT,
    "p1_scenario": P1_SCENARIO,
}

context_info = f"{P1_CONTEXT}\nScenario letter: {P1_SCENARIO}"

task_configs = [
    ("t11", "Task 1.1", "50–70 words", T11_PROMPT),
    ("t12", "Task 1.2", "120–150 words", T12_PROMPT),
    ("t2",  "Task 2",   "180–200 words", T2_PROMPT),
]

all_token_translations = {}

for tkey, title, target, prompt in task_configs:
    print(f"\n{'─'*50}")
    print(f"Generating {title} ({tkey})...")
    print(f"{'─'*50}")

    task = {"title": title, "target": target, "prompt": prompt}

    # Model sample
    print(f"  ✍ Model sample...")
    task["sample"] = gen_model_sample(tkey, prompt, target, context_info)
    print(f"    ✓ done ({len(task['sample'])} chars)")

    # Leveled samples
    for level in LEVELS:
        key = f"sample{level}"
        print(f"  ✍ {level} sample...")
        task[key] = gen_leveled_sample(tkey, prompt, target, level, context_info)
        print(f"    ✓ done ({len(task[key])} chars)")

    # Uzbek translations
    print(f"  🌐 Translating model → Uzbek...")
    task["uzSample"] = gen_uz_translation(task["sample"], "Model")
    for level in LEVELS:
        print(f"  🌐 Translating {level} → Uzbek...")
        task[f"uzSample{level}"] = gen_uz_translation(task[f"sample{level}"], level)

    # Token translations from model sample
    print(f"  📖 Extracting token translations...")
    tt = gen_token_translations(task["sample"])
    all_token_translations.update(tt)

    tasks_data[tkey] = task

# Vocabulary
print(f"\n{'─'*50}")
print("Generating vocabulary...")
print(f"{'─'*50}")
vocab = {}
for tkey, title, target, prompt in task_configs:
    vkey = tkey.replace("t", "task")  # task11, task12, task2
    if tkey == "t2":
        vkey = "task2"
    print(f"  📚 Vocabulary for {title}...")
    vocab[vkey] = gen_vocabulary(tkey, prompt, context_info)
    print(f"    ✓ {len(vocab[vkey])} items")

# ── Assemble final JS file ───────────────────────────────────────────
print(f"\n{'─'*50}")
print("Writing writing-questions100.js ...")
print(f"{'─'*50}")

output = {
    "settings": {
        "logoUrl": "https://i.ibb.co/WN0XY5Lv/logo.png",
        "logoWording": "Mock Stream",
        "testIdentifier": "mock_stream",
        "heading1": "Bilim va malakalarni baholash agentligi",
        "heading2": "Chet tilini bilish darajasi",
        "examTitle": "Writing exam"
    },
    "tasks": tasks_data,
    "vocabulary": vocab,
    "tokenTranslations": all_token_translations
}

js_content = (
    "// ================================================================================\n"
    "// WRITING MOCK TEST - QUESTIONS DATA\n"
    "// ================================================================================\n"
    "// Mock 100 — Printed Books vs E-Books\n"
    "// ================================================================================\n\n"
    "window.WRITING_TEST_DATA = " + json.dumps(output, indent=2, ensure_ascii=False) + ";\n"
)

out_path = r"questions W\writing-questions100.js"
with open(out_path, "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"\n✅ Done! Written to: {out_path}")
print(f"   File size: {len(js_content):,} bytes")
