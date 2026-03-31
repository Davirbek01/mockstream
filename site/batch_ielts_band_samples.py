"""
Batch generate IELTS Writing band-leveled samples (Band 5-9) for multiple mocks.
Uses same Gemini-powered generation as generate_ielts_band_samples.py but with:
- Batch processing (--start / --end range)
- Skip already-processed mocks
- Logging to batch_ielts_band_log.txt
- Lock file to prevent concurrent runs
- Configurable delay between API calls
"""

import json
import re
import time
import sys
import os
import argparse
from datetime import datetime

import requests

GEMINI_API_KEY = "AIzaSyCfnYXgCySMlckKOdJw6vzRDlBVvJvZrZo"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
DELAY = 8  # seconds between API calls (conservative to avoid quota)
MOCK_DELAY = 15  # extra seconds between mocks

QUESTIONS_DIR = os.path.join(os.path.dirname(__file__), "questions IELTS W")
LOG_FILE = os.path.join(os.path.dirname(__file__), "batch_ielts_band_log.txt")
LOCK_FILE = os.path.join(os.path.dirname(__file__), "batch_ielts_band.lock")


def log(msg):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def call_gemini(prompt, retries=4):
    for attempt in range(retries):
        try:
            resp = requests.post(GEMINI_URL, json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.7}
            }, timeout=60)
            if resp.status_code == 429:
                wait = 10 * (2 ** attempt)
                log(f"  ⏳ Rate limited, waiting {wait}s... (attempt {attempt+1}/{retries})")
                time.sleep(wait)
                continue
            if resp.status_code >= 500:
                log(f"  ⚠️ Server error {resp.status_code}, retrying in 15s...")
                time.sleep(15)
                continue
            resp.raise_for_status()
            data = resp.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return text.strip()
        except Exception as e:
            log(f"  ❌ Error: {e}")
            if attempt < retries - 1:
                time.sleep(10)
    return None


def generate_band_sample(task_prompt, task_instruction, band, task_type):
    if task_type == "task1":
        word_target = {5: "140-155", 6: "150-170", 7: "160-180", 8: "170-200", 9: "180-220"}
    else:
        word_target = {5: "240-260", 6: "250-280", 7: "260-300", 8: "270-320", 9: "280-340"}

    highlight_counts = {5: "3-4", 6: "4-5", 7: "5-7", 8: "7-9", 9: "9-12"}

    prompt = f"""You are a senior IELTS Writing examiner with 15+ years of experience. Write a Band {band} level IELTS {task_type.replace('task','Task ')} sample answer.

TASK PROMPT: {task_prompt}
TASK INSTRUCTION: {task_instruction}

You MUST write this sample to precisely match Band {band} according to the OFFICIAL IELTS Writing Band Descriptors across ALL FOUR criteria:

"""

    # --- Task Achievement (Task 1) / Task Response (Task 2) ---
    if task_type == "task1":
        ta_descriptors = {
            5: """TASK ACHIEVEMENT (Band 5):
- Generally addresses the task; the format may be inappropriate in places
- Recounts detail mechanically with no clear overview; there may be no data to support the description
- May present, but inadequately, key features; may focus on details
- There may be a tendency to focus on details""",
            6: """TASK ACHIEVEMENT (Band 6):
- Addresses the requirements of the task
- Presents an overview with information appropriately selected
- Presents and adequately highlights key features/bullet points but details may be irrelevant, inappropriate or inaccurate
- Some key features may be inadequately covered or unclear""",
            7: """TASK ACHIEVEMENT (Band 7):
- Covers the requirements of the task
- Presents a clear overview of main trends, differences or stages
- Clearly presents and highlights key features/bullet points but could be more fully extended
- (Academic) key features are clearly presented; data clearly selected to illustrate main features""",
            8: """TASK ACHIEVEMENT (Band 8):
- Covers all requirements of the task sufficiently
- Presents, highlights and illustrates key features / bullet points clearly and appropriately
- (Academic) presents a clear and well-developed overview that appropriately identifies trends / patterns / the key information
- Data is well selected to support the descriptions""",
            9: """TASK ACHIEVEMENT (Band 9):
- Fully satisfies all the requirements of the task
- Clearly presents a fully developed response
- (Academic) outstanding overview that identifies all key trends / patterns / information precisely
- Selects, compares and integrates data expertly"""
        }
        prompt += ta_descriptors[band] + "\n\n"
    else:
        tr_descriptors = {
            5: """TASK RESPONSE (Band 5):
- Addresses the task only partially; the format may be inappropriate in places
- Expresses a position but the development is not always clear and there may be no conclusions drawn
- Presents some main ideas but these are limited and not sufficiently developed; there may be irrelevant detail
- Arguments may not be identifiable""",
            6: """TASK RESPONSE (Band 6):
- Addresses all parts of the task although some parts may be more fully covered than others
- Presents a relevant position although the conclusions may become unclear or repetitive
- Presents relevant main ideas but some may be inadequately developed/unclear
- Some supporting ideas may lack relevance""",
            7: """TASK RESPONSE (Band 7):
- Addresses all parts of the task
- Presents a clear position throughout the response
- Presents, extends and supports main ideas, but there may be a tendency to overgeneralise and/or supporting ideas may lack focus
- Some argument stages may be unclear""",
            8: """TASK RESPONSE (Band 8):
- Sufficiently addresses all parts of the task
- Presents a well-developed response to the question with relevant, extended and supported ideas
- Clear position throughout with well-supported, relevant main ideas
- Effectively develops and supports ideas with logical, relevant examples""",
            9: """TASK RESPONSE (Band 9):
- Fully addresses all parts of the task
- Presents a fully developed position in answer to the question with relevant, fully extended and well supported ideas
- Any lapses in content or support are extremely rare
- The message is expert-level and comprehensive"""
        }
        prompt += tr_descriptors[band] + "\n\n"

    # --- Coherence & Cohesion ---
    cc_descriptors = {
        5: """COHERENCE AND COHESION (Band 5):
- Presents information with some organisation but there may be a lack of overall progression
- Makes inadequate, inaccurate or over-use of cohesive devices
- May be repetitive because of lack of referencing and substitution
- May not write in paragraphs, or paragraphing may be inadequate""",
        6: """COHERENCE AND COHESION (Band 6):
- Arranges information and ideas coherently and there is a clear overall progression
- Uses cohesive devices effectively, but cohesion within and/or between sentences may be faulty or mechanical
- May not always use referencing clearly or appropriately
- Uses paragraphing, but not always logically""",
        7: """COHERENCE AND COHESION (Band 7):
- Logically organises information and ideas; there is clear progression throughout
- Uses a range of cohesive devices appropriately although there may be some under-/over-use
- Presents a clear central topic within each paragraph
- Effectively manages paragraphing""",
        8: """COHERENCE AND COHESION (Band 8):
- Sequences information and ideas logically
- Manages all aspects of cohesion well
- Uses paragraphing sufficiently and appropriately
- Each paragraph has a clear central topic, and topic sentences are used effectively""",
        9: """COHERENCE AND COHESION (Band 9):
- Uses cohesion in such a way that it attracts no attention
- Skilfully manages paragraphing
- Sequencing is effortless and invisible
- Referencing is managed with complete precision"""
    }
    prompt += cc_descriptors[band] + "\n\n"

    # --- Lexical Resource ---
    lr_descriptors = {
        5: """LEXICAL RESOURCE (Band 5):
- Uses a limited range of vocabulary, but this is minimally adequate for the task
- May make noticeable errors in spelling and/or word formation that may cause some difficulty for the reader
- Attempts to use less common vocabulary but with some inaccuracy
- There may be errors in word choice and collocation""",
        6: """LEXICAL RESOURCE (Band 6):
- Uses an adequate range of vocabulary for the task
- Attempts to use less common vocabulary but with some inaccuracy
- Makes some errors in spelling and/or word formation, but they do not impede communication
- Uses some less common lexical items with occasional inaccurate word choice""",
        7: """LEXICAL RESOURCE (Band 7):
- Uses a sufficient range of vocabulary to allow some flexibility and precision
- Uses less common lexical items with some awareness of style and collocation
- May produce occasional errors in word choice, spelling and/or word formation
- Produces rare errors that do not impede communication""",
        8: """LEXICAL RESOURCE (Band 8):
- Uses a wide range of vocabulary fluently and flexibly to convey precise meanings
- Skilfully uses uncommon lexical items but there may be occasional inaccuracies in word choice and collocation
- Produces rare errors in spelling and/or word formation
- Effectively paraphrases throughout""",
        9: """LEXICAL RESOURCE (Band 9):
- Uses a wide range of vocabulary with very natural and sophisticated control of lexical features
- Rare minor errors occur only as 'slips'
- The vocabulary is used with full flexibility and precision throughout
- Uses appropriate academic and formal register throughout"""
    }
    prompt += lr_descriptors[band] + "\n\n"

    # --- Grammatical Range & Accuracy ---
    gra_descriptors = {
        5: """GRAMMATICAL RANGE AND ACCURACY (Band 5):
- Uses only a limited range of structures
- Attempts complex sentences but these tend to be less accurate than simple sentences
- May make frequent grammatical errors and punctuation may be faulty; errors can cause some difficulty for the reader
- Errors are noticeable but meaning can still be determined""",
        6: """GRAMMATICAL RANGE AND ACCURACY (Band 6):
- Uses a mix of simple and complex sentence forms
- Makes some errors in grammar and punctuation but they rarely reduce communication
- May produce some errors in complex structures
- Attempts a variety of sentence types with varying degrees of success""",
        7: """GRAMMATICAL RANGE AND ACCURACY (Band 7):
- Uses a variety of complex structures
- Produces frequent error-free sentences
- Has good control of grammar and punctuation but may make a few errors
- Complex language is used with a good degree of accuracy""",
        8: """GRAMMATICAL RANGE AND ACCURACY (Band 8):
- Uses a wide range of structures
- The majority of sentences are error-free
- Makes only very occasional errors or inappropriacies
- Full command of complex structures is evident throughout""",
        9: """GRAMMATICAL RANGE AND ACCURACY (Band 9):
- Uses a wide range of structures with full flexibility and accuracy
- Rare minor errors occur only as 'slips'
- Demonstrates complete control of complex grammatical structures
- Punctuation and grammar are used accurately throughout"""
    }
    prompt += gra_descriptors[band] + "\n\n"

    prompt += f"""REQUIREMENTS:
- Write exactly {word_target[band]} words
- The sample must AUTHENTICALLY demonstrate ALL FOUR criteria at Band {band} level — not just vocabulary, but also task fulfillment, coherence, and grammar accuracy
- For Band 5-6: include realistic errors, simpler structures, and less developed arguments as the descriptors specify
- For Band 7: good quality but with occasional minor weaknesses as described
- For Band 8-9: near-flawless with sophisticated language and full task coverage

CRITICAL FORMATTING:
- Wrap {highlight_counts[band]} key expressions/phrases that demonstrate Band {band} writing quality in <mark> tags
- These should be vocabulary, collocations, linking phrases, or academic expressions characteristic of this band level
- For lower bands (5-6), highlight the simpler phrases and attempts at less common vocabulary
- For higher bands (8-9), highlight sophisticated collocations, academic phrases, and nuanced expressions
- Use HTML paragraphs with <p> tags
- Do NOT include any title, band label, or word count — ONLY the essay text with <p> tags and <mark> highlights

Example format:
<p>The chart <mark>provides an overview of</mark> the main trends...</p>
<p>It is <mark>readily apparent</mark> that housing preferences <mark>vary considerably</mark> across the three areas...</p>

Write ONLY the essay HTML. No additional commentary."""

    result = call_gemini(prompt)
    if not result:
        return None

    result = re.sub(r'^```html?\s*', '', result, flags=re.MULTILINE)
    result = re.sub(r'```\s*$', '', result, flags=re.MULTILINE)
    result = result.strip()
    if not result.startswith('<p>'):
        result = '<p>' + result
    return result


def generate_uzbek_translation(english_html, band):
    prompt = f"""Translate the following IELTS Band {band} writing sample from English to Uzbek.

RULES:
- Keep all HTML tags exactly as they are (<p>, <mark>, etc.)
- Translate ONLY the text content, preserve all HTML structure
- The translation should sound natural in Uzbek
- Keep <mark> tags around the translated equivalents of the highlighted phrases

TEXT TO TRANSLATE:
{english_html}

Return ONLY the translated HTML. No commentary."""

    result = call_gemini(prompt)
    if not result:
        return None
    result = re.sub(r'^```html?\s*', '', result, flags=re.MULTILINE)
    result = re.sub(r'```\s*$', '', result, flags=re.MULTILINE)
    return result.strip()


def generate_token_translations(all_samples_html):
    marks = set()
    for html in all_samples_html:
        if html:
            found = re.findall(r'<mark>(.*?)</mark>', html, re.DOTALL)
            marks.update(found)
    if not marks:
        return {}

    marks_list = sorted(marks)
    prompt = f"""Translate these IELTS writing expressions from English to Uzbek.
Return a JSON object where keys are the English expressions and values are objects with "uz" (Uzbek translation) and "type" (one of: "academic", "colloc", "linking", "idiom", "lexical").

Expressions:
{json.dumps(marks_list, ensure_ascii=False)}

Return ONLY valid JSON. No markdown, no commentary."""

    result = call_gemini(prompt)
    if not result:
        return {}
    result = re.sub(r'^```json?\s*', '', result, flags=re.MULTILINE)
    result = re.sub(r'```\s*$', '', result, flags=re.MULTILINE)
    try:
        return json.loads(result.strip())
    except json.JSONDecodeError:
        log("  ⚠️ Token translation JSON parse failed, retrying...")
        time.sleep(DELAY)
        result2 = call_gemini(prompt)
        if result2:
            result2 = re.sub(r'^```json?\s*', '', result2, flags=re.MULTILINE)
            result2 = re.sub(r'```\s*$', '', result2, flags=re.MULTILINE)
            try:
                return json.loads(result2.strip())
            except:
                return {}
    return {}


def is_mock_processed(filepath):
    """Check if a mock file already has band samples."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        return "sampleBand5" in content and "sampleBand9" in content and "uzSampleBand5" in content
    except:
        return False


def get_mock_files(start, end):
    """Get list of mock file paths in range."""
    files = []
    for n in range(start, end + 1):
        filename = f"ielts-mock-{n:02d}.js"
        filepath = os.path.join(QUESTIONS_DIR, filename)
        if os.path.exists(filepath):
            files.append((n, filepath))
    return files


def process_mock(mock_num, filepath):
    """Process a single IELTS Writing mock — generate band samples, translations, tokens."""
    log(f"{'='*60}")
    log(f"📝 Processing Mock {mock_num:02d}: {os.path.basename(filepath)}")
    log(f"{'='*60}")

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    match = re.search(r'window\.IELTS_WRITING_TEST_DATA\s*=\s*(\{.*\})\s*;?\s*$', content, re.DOTALL)
    if not match:
        log(f"  ❌ Could not parse data file for Mock {mock_num:02d}")
        return False

    data = json.loads(match.group(1))
    bands = [5, 6, 7, 8, 9]
    all_mark_htmls = []
    success_count = 0
    fail_count = 0

    for task_key in ["task1", "task2"]:
        task = data["tasks"][task_key]
        task_label = task_key.replace("task", "Task ")
        log(f"\n  📄 {task_label}: {task['prompt'][:80]}...")

        for band in bands:
            log(f"    🎯 Band {band}...")
            sample = generate_band_sample(
                task["prompt"],
                task.get("instruction", ""),
                band,
                task_key
            )
            if sample:
                task[f"sampleBand{band}"] = sample
                all_mark_htmls.append(sample)
                marks_count = len(re.findall(r'<mark>', sample))
                words = len(re.sub(r'<[^>]+>', '', sample).split())
                log(f"    ✅ Band {band}: {words} words, {marks_count} highlights")
                success_count += 1
            else:
                log(f"    ❌ Band {band} generation FAILED")
                fail_count += 1
            time.sleep(DELAY)

        # Uzbek translations
        log(f"\n  🇺🇿 Translating {task_label} to Uzbek...")
        for band in bands:
            field = f"sampleBand{band}"
            if field in task:
                log(f"    🇺🇿 Band {band}...")
                uz = generate_uzbek_translation(task[field], band)
                if uz:
                    task[f"uzSampleBand{band}"] = uz
                    log(f"    ✅ Band {band} UZ done")
                    success_count += 1
                else:
                    log(f"    ❌ Band {band} UZ FAILED")
                    fail_count += 1
                time.sleep(DELAY)

    # Token translations
    log(f"\n  🔤 Generating token translations...")
    token_translations = generate_token_translations(all_mark_htmls)
    if token_translations:
        data["tokenTranslations"] = token_translations
        log(f"  ✅ {len(token_translations)} token translations")
    else:
        log(f"  ⚠️ Token translations failed or empty")

    # Preserve original header comment style but add band note
    original_date_match = re.search(r'// Date: (.+)', content)
    original_date = original_date_match.group(1).strip() if original_date_match else "Unknown"

    header = f"""// ================================================================================
// IELTS WRITING MOCK TEST - QUESTIONS DATA
// ================================================================================
// Generated by IELTS Writing Test Builder
// Date: {original_date}
// Band-leveled samples with highlights added: {datetime.now().strftime('%Y-%m-%d')}
// ================================================================================

"""

    json_str = json.dumps(data, ensure_ascii=False, indent=2)
    output = header + f"window.IELTS_WRITING_TEST_DATA = {json_str};\n"

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(output)

    log(f"\n  💾 Saved Mock {mock_num:02d} ({success_count} OK, {fail_count} failed)")

    # Summary
    for task_key in ["task1", "task2"]:
        task = data["tasks"][task_key]
        en_count = sum(1 for b in bands if f"sampleBand{b}" in task)
        uz_count = sum(1 for b in bands if f"uzSampleBand{b}" in task)
        log(f"  {task_key}: EN={en_count}/5, UZ={uz_count}/5")

    return fail_count == 0


def show_status(start, end):
    """Show which mocks have been processed."""
    files = get_mock_files(start, end)
    done = 0
    pending = 0
    for n, fp in files:
        processed = is_mock_processed(fp)
        status = "✅" if processed else "⏳"
        size = os.path.getsize(fp)
        print(f"  {status} Mock {n:02d}: {size:>8,} bytes")
        if processed:
            done += 1
        else:
            pending += 1
    print(f"\n  Total: {done} done, {pending} pending out of {len(files)}")


def main():
    parser = argparse.ArgumentParser(description="Batch generate IELTS Writing band samples")
    parser.add_argument("--start", type=int, default=2, help="Start mock number (default: 2)")
    parser.add_argument("--end", type=int, default=30, help="End mock number (default: 30)")
    parser.add_argument("--status", action="store_true", help="Show processing status only")
    parser.add_argument("--force", action="store_true", help="Re-process already done mocks")
    args = parser.parse_args()

    if args.status:
        print(f"\n📊 IELTS Writing Band Samples Status (Mocks {args.start}-{args.end}):")
        show_status(args.start, args.end)
        return

    # Lock file to prevent concurrent runs
    if os.path.exists(LOCK_FILE):
        print("❌ Another batch is already running (lock file exists).")
        print(f"   Delete {LOCK_FILE} if this is wrong.")
        sys.exit(1)

    with open(LOCK_FILE, "w") as f:
        f.write(f"PID: {os.getpid()}, Started: {datetime.now().isoformat()}")

    try:
        files = get_mock_files(args.start, args.end)
        if not files:
            log(f"No mock files found in range {args.start}-{args.end}")
            return

        # Filter already-processed
        if not args.force:
            to_process = [(n, fp) for n, fp in files if not is_mock_processed(fp)]
            skipped = len(files) - len(to_process)
            if skipped > 0:
                log(f"⏭️ Skipping {skipped} already-processed mocks")
        else:
            to_process = files

        if not to_process:
            log("✅ All mocks in range already processed!")
            return

        log(f"🚀 Starting batch: {len(to_process)} mocks to process")
        log(f"   Range: Mock {to_process[0][0]:02d} - Mock {to_process[-1][0]:02d}")
        log(f"   API delay: {DELAY}s between calls, {MOCK_DELAY}s between mocks")

        completed = 0
        failed = 0

        for i, (mock_num, filepath) in enumerate(to_process):
            ok = process_mock(mock_num, filepath)
            if ok:
                completed += 1
            else:
                failed += 1

            # Extra delay between mocks
            if i < len(to_process) - 1:
                log(f"\n  ⏳ Waiting {MOCK_DELAY}s before next mock...")
                time.sleep(MOCK_DELAY)

            log(f"\n📊 Progress: {completed + failed}/{len(to_process)} ({completed} OK, {failed} partial)")

        log(f"\n{'='*60}")
        log(f"🏁 BATCH COMPLETE: {completed} OK, {failed} partial out of {len(to_process)} mocks")
        log(f"{'='*60}")

    finally:
        # Clean up lock file
        if os.path.exists(LOCK_FILE):
            os.remove(LOCK_FILE)


if __name__ == "__main__":
    main()
