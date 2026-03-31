"""
Batch generate IELTS Speaking band-leveled samples (Band 5-9) for all 66 speaking mocks.
For each question: generates 5 band-level samples with ml-token markup,
Uzbek translations for all 6 versions (original + 5 bands),
and tokenTranslations for highlighted vocabulary.

Usage:
  python batch_ielts_speaking_bands.py --start 1 --end 66
  python batch_ielts_speaking_bands.py --status
  python batch_ielts_speaking_bands.py --start 1 --end 5 --force
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
DELAY = 6          # seconds between API calls
MOCK_DELAY = 12    # extra seconds between mocks

QUESTIONS_DIR = os.path.join(os.path.dirname(__file__), "questions IELTS S")
LOG_FILE = os.path.join(os.path.dirname(__file__), "batch_ielts_speaking_band_log.txt")
LOCK_FILE = os.path.join(os.path.dirname(__file__), "batch_ielts_speaking_band.lock")


def log(msg):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {msg}"
    try:
        print(line)
    except UnicodeEncodeError:
        print(line.encode('ascii', 'replace').decode('ascii'))
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def call_gemini(prompt, retries=4, temperature=0.7):
    for attempt in range(retries):
        try:
            resp = requests.post(GEMINI_URL, json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": temperature, "maxOutputTokens": 8192}
            }, timeout=(30, 300))
            if resp.status_code == 429:
                wait = 15 * (2 ** attempt)
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
        except KeyboardInterrupt:
            raise
        except Exception as e:
            log(f"  ❌ Error: {e}")
            if attempt < retries - 1:
                time.sleep(10)
    return None


# ──────────────────────────────────────────────────
# Word count guidelines by badge (speaking time) and band
# ──────────────────────────────────────────────────
WORD_TARGETS = {
    "30s":  {5: "30-50",  6: "40-65",  7: "55-85",  8: "70-110",  9: "85-130"},
    "60s":  {5: "55-80",  6: "70-100", 7: "85-125", 8: "105-155", 9: "125-175"},
    "120s": {5: "100-145", 6: "130-175", 7: "160-210", 8: "195-250", 9: "225-290"},
}

TOKEN_COUNTS = {5: "2-3", 6: "3-4", 7: "4-6", 8: "5-8", 9: "7-10"}


def get_word_target(badge, band):
    badge_key = badge.lower().replace(" ", "")
    if badge_key in WORD_TARGETS:
        return WORD_TARGETS[badge_key].get(band, "60-100")
    # Fallback for unusual badges
    return WORD_TARGETS["30s"].get(band, "60-100")


# ──────────────────────────────────────────────────
# IELTS Speaking Band Descriptors
# ──────────────────────────────────────────────────

FC_DESCRIPTORS = {
    5: """FLUENCY AND COHERENCE (Band 5):
- Usually maintains flow of speech but uses repetition, self-correction and/or slow speech to keep going
- May over-use certain connectives and discourse markers
- Produces simple speech fluently, but more complex communication causes fluency problems
- Ideas may not be clearly related or sequenced""",
    6: """FLUENCY AND COHERENCE (Band 6):
- Is willing to speak at length, though may lose coherence at times due to occasional repetition, self-correction or hesitation
- Uses a range of connectives and discourse markers but not always appropriately
- Can discuss topics at length even if there are occasional digressions""",
    7: """FLUENCY AND COHERENCE (Band 7):
- Speaks at length without noticeable effort or loss of coherence
- May demonstrate language-related hesitation at times, or some repetition and/or self-correction
- Uses a range of connectives and discourse markers with some flexibility
- Develops topics coherently and appropriately""",
    8: """FLUENCY AND COHERENCE (Band 8):
- Speaks fluently with only occasional repetition or self-correction; hesitation is usually content-related
- Develops topics coherently and appropriately
- Uses a wide range of connectives and discourse markers naturally and appropriately""",
    9: """FLUENCY AND COHERENCE (Band 9):
- Speaks fluently with only rare repetition or self-correction
- Any hesitation is content-related rather than to find words or grammar
- Speaks coherently with fully appropriate cohesive features
- Develops topics fully and appropriately"""
}

LR_DESCRIPTORS = {
    5: """LEXICAL RESOURCE (Band 5):
- Manages to talk about familiar and unfamiliar topics but uses vocabulary with limited flexibility
- Attempts to use paraphrase but with mixed success
- Has limited ability to express abstract ideas
- Uses basic vocabulary for familiar topics""",
    6: """LEXICAL RESOURCE (Band 6):
- Has a wide enough vocabulary to discuss topics at length and make meaning clear in spite of inappropriacies
- Generally paraphrases successfully
- Uses some less common and idiomatic vocabulary, though not always accurately""",
    7: """LEXICAL RESOURCE (Band 7):
- Uses vocabulary resource flexibly to discuss a variety of topics
- Uses some less common and idiomatic vocabulary and shows some awareness of style and collocation, with some inappropriate choices
- Uses paraphrase effectively""",
    8: """LEXICAL RESOURCE (Band 8):
- Uses a wide vocabulary resource readily and flexibly to convey precise meaning
- Uses less common and idiomatic vocabulary skilfully, with occasional inaccuracies
- Uses paraphrase effectively as required""",
    9: """LEXICAL RESOURCE (Band 9):
- Uses vocabulary with full flexibility and precision in all topics
- Uses idiomatic language naturally and accurately
- Paraphrases fully and seamlessly throughout the response"""
}

GRA_DESCRIPTORS = {
    5: """GRAMMATICAL RANGE AND ACCURACY (Band 5):
- Uses a limited range of more complex structures, but these usually contain errors
- Produces basic sentence forms with reasonable accuracy
- Frequently produces errors in more complex structures, though these rarely cause comprehension problems
- May make noticeable errors""",
    6: """GRAMMATICAL RANGE AND ACCURACY (Band 6):
- Uses a mix of simple and complex structures, but with limited flexibility
- May make frequent mistakes with complex structures, though these rarely cause comprehension problems
- Uses a range of sentence structures with some accuracy""",
    7: """GRAMMATICAL RANGE AND ACCURACY (Band 7):
- Uses a range of complex structures with some flexibility
- Frequently produces error-free sentences, though some grammatical mistakes persist
- Good control of grammar with occasional errors that do not impede meaning""",
    8: """GRAMMATICAL RANGE AND ACCURACY (Band 8):
- Uses a wide range of structures flexibly
- Produces a majority of error-free sentences with only very occasional inappropriacies or basic/non-systematic errors
- Complex structures are used naturally and accurately""",
    9: """GRAMMATICAL RANGE AND ACCURACY (Band 9):
- Uses a full range of structures naturally and appropriately
- Produces consistently accurate structures apart from 'slips' characteristic of native speaker speech
- Expert command of grammar with effortless accuracy"""
}


def generate_all_bands_for_question(question_data, part_info=""):
    """Generate Band 5-9 sample answers for a single question in one API call."""
    prompt_text = question_data.get("prompt", "")
    part = question_data.get("part", "Part 1")
    badge = question_data.get("badge", "30s")
    topic = question_data.get("topic", "")
    bullet_points = question_data.get("bulletPoints", [])

    bp_text = ""
    if bullet_points:
        bp_text = "\nBullet points to cover:\n" + "\n".join(f"- {bp}" for bp in bullet_points)

    prompt = f"""You are a senior IELTS Speaking examiner with 15+ years of experience. Generate sample answers at 5 IELTS band levels (5, 6, 7, 8, 9) for this speaking question.

QUESTION: {prompt_text}
PART: {part}
TOPIC: {topic}
TIME ALLOWED: {badge}{bp_text}
{part_info}

Generate a natural spoken response for EACH band level. Each response MUST:
1. Sound like authentic natural speech (not written English)
2. Match the band level precisely per the official IELTS Speaking band descriptors below
3. Be approximately the word count shown for each band
4. Contain highlighted vocabulary using <span class="ml-token TYPE">phrase</span> markup

TOKEN TYPES (use these exact class names):
- idiom: idiomatic expressions (e.g., "break the ice", "in the long run")
- colloc: collocations (e.g., "heavy traffic", "make progress")
- phrasal: phrasal verbs (e.g., "pick up", "come across")
- adv: discourse markers/adverbs (e.g., "honestly", "moreover", "particularly")
- proverb: proverbs/sayings (e.g., "practice makes perfect")

BAND DESCRIPTORS FOR EACH LEVEL:

{FC_DESCRIPTORS[5]}
{LR_DESCRIPTORS[5]}
{GRA_DESCRIPTORS[5]}

{FC_DESCRIPTORS[6]}
{LR_DESCRIPTORS[6]}
{GRA_DESCRIPTORS[6]}

{FC_DESCRIPTORS[7]}
{LR_DESCRIPTORS[7]}
{GRA_DESCRIPTORS[7]}

{FC_DESCRIPTORS[8]}
{LR_DESCRIPTORS[8]}
{GRA_DESCRIPTORS[8]}

{FC_DESCRIPTORS[9]}
{LR_DESCRIPTORS[9]}
{GRA_DESCRIPTORS[9]}

WORD COUNT TARGETS:
- Band 5: {get_word_target(badge, 5)} words, {TOKEN_COUNTS[5]} highlighted tokens
- Band 6: {get_word_target(badge, 6)} words, {TOKEN_COUNTS[6]} highlighted tokens
- Band 7: {get_word_target(badge, 7)} words, {TOKEN_COUNTS[7]} highlighted tokens
- Band 8: {get_word_target(badge, 8)} words, {TOKEN_COUNTS[8]} highlighted tokens
- Band 9: {get_word_target(badge, 9)} words, {TOKEN_COUNTS[9]} highlighted tokens

KEY RULES:
- Band 5-6: Include natural hesitation fillers (Well, Um, I mean...), simpler vocabulary, some grammatical errors for Band 5
- Band 7: Mostly fluent with good vocabulary range, occasional minor errors
- Band 8-9: Sophisticated, natural, idiomatic — sounds like an educated native speaker
- For Band 5: deliberately use simpler structures and limited vocabulary
- Always make it sound like SPOKEN English, not a written essay
- If Part 2: structure as a monologue covering the bullet points

Return ONLY a valid JSON object with this EXACT structure (no markdown, no commentary):
{{
  "band5": "answer html with <span class=\\"ml-token TYPE\\">phrase</span> markup",
  "band6": "answer html...",
  "band7": "answer html...",
  "band8": "answer html...",
  "band9": "answer html..."
}}"""

    result = call_gemini(prompt)
    if not result:
        return None

    # Clean markdown wrapping
    result = re.sub(r'^```(?:json)?\s*', '', result, flags=re.MULTILINE)
    result = re.sub(r'```\s*$', '', result, flags=re.MULTILINE)
    result = result.strip()

    try:
        data = json.loads(result)
        # Validate structure
        for band in ["band5", "band6", "band7", "band8", "band9"]:
            if band not in data or not isinstance(data[band], str) or len(data[band]) < 20:
                log(f"    ⚠️ Missing or invalid '{band}' in response")
                return None
        return data
    except json.JSONDecodeError as e:
        log(f"    ⚠️ JSON parse error: {e}")
        # Try to extract JSON from response
        m = re.search(r'\{.*\}', result, re.DOTALL)
        if m:
            try:
                data = json.loads(m.group(0))
                for band in ["band5", "band6", "band7", "band8", "band9"]:
                    if band not in data:
                        return None
                return data
            except:
                pass
        return None


def generate_uzbek_translations(question_data, band_samples, original_sample):
    """Generate Uzbek translations for all band samples + original in one API call."""
    prompt_text = question_data.get("prompt", "")

    samples_text = f'"original": {json.dumps(original_sample, ensure_ascii=False)}'
    for band in [5, 6, 7, 8, 9]:
        key = f"band{band}"
        if key in band_samples:
            samples_text += f',\n"{key}": {json.dumps(band_samples[key], ensure_ascii=False)}'

    prompt = f"""Translate these IELTS Speaking sample answers from English to Uzbek.

QUESTION: {prompt_text}

SAMPLES TO TRANSLATE:
{{
{samples_text}
}}

RULES:
1. Keep ALL HTML tags exactly as they are (<span class="ml-token ...">...</span>)
2. Translate ONLY the text content — do NOT modify any HTML tags, attributes, or class names
3. The translation should sound natural in Uzbek (spoken style)
4. Translate the content inside <span> tags to Uzbek equivalents
5. Preserve the HTML structure completely

Return ONLY a valid JSON object (no markdown, no commentary):
{{
  "uzOriginal": "translated html...",
  "uzBand5": "translated html...",
  "uzBand6": "translated html...",
  "uzBand7": "translated html...",
  "uzBand8": "translated html...",
  "uzBand9": "translated html..."
}}"""

    result = call_gemini(prompt)
    if not result:
        return None

    result = re.sub(r'^```(?:json)?\s*', '', result, flags=re.MULTILINE)
    result = re.sub(r'```\s*$', '', result, flags=re.MULTILINE)
    result = result.strip()

    try:
        return json.loads(result)
    except json.JSONDecodeError:
        m = re.search(r'\{.*\}', result, re.DOTALL)
        if m:
            try:
                return json.loads(m.group(0))
            except:
                pass
        return None


def generate_token_translations(all_html_samples):
    """Extract all ml-token spans and generate Uzbek translations."""
    tokens = set()
    for html in all_html_samples:
        if not html:
            continue
        # Extract ml-token content with type
        matches = re.findall(r'<span\s+class="ml-token\s+(\w+)">(.*?)</span>', html, re.DOTALL)
        for token_type, token_text in matches:
            clean = token_text.strip()
            if clean:
                tokens.add((clean, token_type))

    if not tokens:
        return {}

    # Build list for prompt
    token_list = [{"text": t, "type": tp} for t, tp in sorted(tokens)]

    prompt = f"""Translate these English expressions/phrases to Uzbek. These are from IELTS Speaking sample answers.

EXPRESSIONS:
{json.dumps(token_list, ensure_ascii=False, indent=2)}

For each expression, provide:
- "uz": Natural Uzbek translation/equivalent (not word-for-word — give the idiomatic Uzbek equivalent)
- "type": Keep the same type as provided

Return ONLY a valid JSON object where keys are the English text and values have "uz" and "type":
{{
  "expression text": {{"uz": "Uzbek equivalent", "type": "idiom"}},
  "another expression": {{"uz": "O'zbek ekvivalenti", "type": "colloc"}},
  ...
}}

IMPORTANT: For idioms and proverbs, give the Uzbek EQUIVALENT expression/proverb, not a literal translation.
For collocations and phrasal verbs, give the closest natural Uzbek equivalent.
For discourse markers (adv), give the Uzbek discourse marker equivalent.

Return ONLY valid JSON, no markdown, no commentary."""

    result = call_gemini(prompt, temperature=0.3)
    if not result:
        return {}

    result = re.sub(r'^```(?:json)?\s*', '', result, flags=re.MULTILINE)
    result = re.sub(r'```\s*$', '', result, flags=re.MULTILINE)
    result = result.strip()

    try:
        return json.loads(result)
    except json.JSONDecodeError:
        log("  ⚠️ Token translation JSON parse failed, retrying...")
        time.sleep(DELAY)
        result2 = call_gemini(prompt, temperature=0.3)
        if result2:
            result2 = re.sub(r'^```(?:json)?\s*', '', result2, flags=re.MULTILINE)
            result2 = re.sub(r'```\s*$', '', result2, flags=re.MULTILINE)
            try:
                return json.loads(result2.strip())
            except:
                return {}
    return {}


def is_mock_processed(filepath):
    """Check if a speaking mock file already has band samples."""
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
        filename = f"ielts-speaking-mock-{n}.js"
        filepath = os.path.join(QUESTIONS_DIR, filename)
        if os.path.exists(filepath):
            files.append((n, filepath))
    return files


def process_mock(mock_num, filepath):
    """Process a single IELTS Speaking mock."""
    log(f"{'='*60}")
    log(f"🎤 Processing Speaking Mock {mock_num}: {os.path.basename(filepath)}")
    log(f"{'='*60}")

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Parse the JS data - strip JS comments first
    match = re.search(r'window\.SPEAKING_TEST_DATA\s*=\s*(\{.*\})\s*;?\s*$', content, re.DOTALL)
    if not match:
        log(f"  ❌ Could not parse data file for Mock {mock_num}")
        return False

    json_text = match.group(1)
    # Remove single-line JS comments (// ...) but NOT inside strings
    # Simple approach: remove lines that are only comments
    lines = json_text.split('\n')
    cleaned_lines = []
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('//'):
            continue  # Skip comment-only lines
        cleaned_lines.append(line)
    json_text = '\n'.join(cleaned_lines)

    try:
        data = json.loads(json_text)
    except json.JSONDecodeError as e:
        log(f"  ❌ JSON parse error: {e}")
        return False

    questions = data.get("questions", [])
    if not questions:
        log(f"  ❌ No questions found in Mock {mock_num}")
        return False

    log(f"  📋 {len(questions)} questions to process")

    all_html_samples = []
    success_count = 0
    fail_count = 0

    for qi, q in enumerate(questions):
        q_num = q.get("number", qi + 1)
        part = q.get("part", "Part 1")
        prompt_text = q.get("prompt", "")[:60]
        log(f"\n  Q{q_num} ({part}): {prompt_text}...")

        # Part 2 extra info
        part_info = ""
        if part == "Part 2":
            part_info = "This is Part 2 — a 2-minute monologue. The answer should be a structured, extended response covering all bullet points."

        # Step 1: Generate all 5 band samples
        log(f"    📝 Generating Band 5-9 samples...")
        band_data = generate_all_bands_for_question(q, part_info)
        if band_data:
            for band in [5, 6, 7, 8, 9]:
                key = f"band{band}"
                if key in band_data:
                    q[f"sampleBand{band}"] = band_data[key]
                    all_html_samples.append(band_data[key])
                    words = len(re.sub(r'<[^>]+>', '', band_data[key]).split())
                    tokens = len(re.findall(r'ml-token', band_data[key]))
                    log(f"    ✅ Band {band}: {words}w, {tokens} tokens")
            success_count += 1
        else:
            log(f"    ❌ Band samples generation FAILED for Q{q_num}")
            fail_count += 1

        time.sleep(DELAY)

        # Step 2: Generate Uzbek translations
        original = q.get("sampleAnswer", "")
        if band_data:
            log(f"    🇺🇿 Translating to Uzbek...")
            uz_data = generate_uzbek_translations(q, band_data, original)
            if uz_data:
                if "uzOriginal" in uz_data:
                    q["uzSampleAnswer"] = uz_data["uzOriginal"]
                for band in [5, 6, 7, 8, 9]:
                    uz_key = f"uzBand{band}"
                    if uz_key in uz_data:
                        q[f"uzSampleBand{band}"] = uz_data[uz_key]
                uz_count = sum(1 for b in [5,6,7,8,9] if f"uzSampleBand{b}" in q)
                log(f"    ✅ UZ: {uz_count}/5 bands" + (" + original" if "uzSampleAnswer" in q else ""))
                success_count += 1
            else:
                log(f"    ❌ Uzbek translation FAILED for Q{q_num}")
                fail_count += 1
        else:
            log(f"    ⏭️ Skipping UZ (no band samples)")

        time.sleep(DELAY)

    # Step 3: Token translations (one batch for entire mock)
    log(f"\n  🔤 Generating token translations for {len(all_html_samples)} samples...")
    # Also include original sampleAnswers that have ml-token spans
    for q in questions:
        sa = q.get("sampleAnswer", "")
        if "ml-token" in sa:
            all_html_samples.append(sa)

    token_translations = generate_token_translations(all_html_samples)
    if token_translations:
        # Merge with existing tokenTranslations if any
        existing = data.get("tokenTranslations", {})
        existing.update(token_translations)
        data["tokenTranslations"] = existing
        log(f"  ✅ {len(token_translations)} token translations generated (total: {len(existing)})")
    else:
        log(f"  ⚠️ Token translations empty or failed")

    # Save the file
    json_str = json.dumps(data, ensure_ascii=False, indent=2)

    # Handle JS comments — we need to strip them from the original before replacing
    # Since JSON.parse can't handle comments, reconstruct the file cleanly
    header = f"""// ================================================================================
// IELTS SPEAKING MOCK TEST {mock_num} - QUESTIONS DATA
// ================================================================================
// Band-leveled samples (5-9) with Uzbek translations added: {datetime.now().strftime('%Y-%m-%d')}
// ================================================================================

"""
    output = header + f"window.SPEAKING_TEST_DATA = {json_str};\n"

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(output)

    # Summary
    en_total = sum(1 for q in questions for b in [5,6,7,8,9] if f"sampleBand{b}" in q)
    uz_total = sum(1 for q in questions for b in [5,6,7,8,9] if f"uzSampleBand{b}" in q)
    uz_orig = sum(1 for q in questions if "uzSampleAnswer" in q)
    log(f"\n  💾 Saved Mock {mock_num}")
    log(f"  📊 EN samples: {en_total}/{len(questions)*5}, UZ samples: {uz_total}/{len(questions)*5}, UZ originals: {uz_orig}/{len(questions)}")
    log(f"  📊 Success: {success_count}, Failed: {fail_count}")

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
        print(f"  {status} Mock {n:>2}: {size:>10,} bytes")
        if processed:
            done += 1
        else:
            pending += 1
    print(f"\n  Total: {done} done, {pending} pending out of {len(files)}")


def main():
    parser = argparse.ArgumentParser(description="Batch generate IELTS Speaking band samples")
    parser.add_argument("--start", type=int, default=1, help="Start mock number (default: 1)")
    parser.add_argument("--end", type=int, default=66, help="End mock number (default: 66)")
    parser.add_argument("--status", action="store_true", help="Show processing status only")
    parser.add_argument("--force", action="store_true", help="Re-process already done mocks")
    args = parser.parse_args()

    if args.status:
        print(f"\n📊 IELTS Speaking Band Samples Status (Mocks {args.start}-{args.end}):")
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
        log(f"   Range: Mock {to_process[0][0]} - Mock {to_process[-1][0]}")
        log(f"   API delay: {DELAY}s between calls, {MOCK_DELAY}s between mocks")

        completed = 0
        failed = 0

        for i, (mock_num, filepath) in enumerate(to_process):
            ok = process_mock(mock_num, filepath)
            if ok:
                completed += 1
            else:
                failed += 1

            if i < len(to_process) - 1:
                log(f"\n  ⏳ Waiting {MOCK_DELAY}s before next mock...")
                time.sleep(MOCK_DELAY)

            log(f"\n📊 Progress: {completed + failed}/{len(to_process)} ({completed} OK, {failed} partial)")

        log(f"\n{'='*60}")
        log(f"🏁 BATCH COMPLETE: {completed} OK, {failed} partial out of {len(to_process)} mocks")
        log(f"{'='*60}")

    finally:
        if os.path.exists(LOCK_FILE):
            os.remove(LOCK_FILE)


if __name__ == "__main__":
    main()
