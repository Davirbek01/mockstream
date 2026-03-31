"""
Unified batch processor for translating CEFR Speaking & Writing mocks to Uzbek.
Handles both sample translations and token translations.
Resumable: skips files/fields that are already translated.

Usage:
  python batch_translate.py                          # Process ALL remaining files
  python batch_translate.py --type speaking --start 2 --end 10   # Speaking mocks 02-10
  python batch_translate.py --type writing --start 2 --end 15    # Writing mocks 02-15
  python batch_translate.py --type speaking --start 11 --end 20  # Speaking mocks 11-20
  python batch_translate.py --status                 # Show progress summary
"""

import json
import re
import time
import sys
import os
import argparse
import requests
from html.parser import HTMLParser
from datetime import datetime

API_KEY = "AIzaSyCfnYXgCySMlckKOdJw6vzRDlBVvJvZrZo"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"

# Rate limit settings — Gemini free tier: 15 req/min
DELAY_BETWEEN_CALLS = 5        # seconds between individual API calls
DELAY_BETWEEN_FILES = 10       # seconds between files
DELAY_BETWEEN_BATCHES = 15     # seconds between sample and token phases

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SPEAKING_DIR = os.path.join(SCRIPT_DIR, "questions S")
WRITING_DIR = os.path.join(SCRIPT_DIR, "questions W")
LOG_FILE = os.path.join(SCRIPT_DIR, "batch_translate_log.txt")
LOCK_FILE = os.path.join(SCRIPT_DIR, "batch_translate.lock")


def acquire_lock():
    """Ensure only one batch_translate instance runs at a time."""
    if os.path.exists(LOCK_FILE):
        try:
            with open(LOCK_FILE, 'r') as f:
                old_pid = int(f.read().strip())
            # Check if that PID is still alive
            import ctypes
            kernel32 = ctypes.windll.kernel32
            handle = kernel32.OpenProcess(0x1000, False, old_pid)  # PROCESS_QUERY_LIMITED_INFORMATION
            if handle:
                kernel32.CloseHandle(handle)
                print(f"ERROR: Another batch_translate is already running (PID {old_pid}).")
                print(f"If this is stale, delete {LOCK_FILE} and retry.")
                sys.exit(1)
        except (ValueError, OSError):
            pass  # Stale lock, proceed
    with open(LOCK_FILE, 'w') as f:
        f.write(str(os.getpid()))


def release_lock():
    """Remove lock file on exit."""
    try:
        if os.path.exists(LOCK_FILE):
            with open(LOCK_FILE, 'r') as f:
                pid = int(f.read().strip())
            if pid == os.getpid():
                os.remove(LOCK_FILE)
    except:
        pass


def log(msg):
    timestamp = datetime.now().strftime("%H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line, flush=True)
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(line + "\n")
        f.flush()


# ─── Gemini API ───────────────────────────────────────────────────────────────

def call_gemini(prompt, retries=6):
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 4096}
    }
    for attempt in range(retries):
        try:
            resp = requests.post(GEMINI_URL, json=payload, timeout=120)
            if resp.status_code == 429:
                wait = min(2 ** (attempt + 3), 120)  # 8, 16, 32, 64, 120, 120s
                log(f"    ⏳ Rate limited (429), waiting {wait}s... (attempt {attempt+1}/{retries})")
                time.sleep(wait)
                continue
            if resp.status_code >= 500:
                wait = 2 ** (attempt + 2)
                log(f"    ⚠ Server error {resp.status_code}, retrying in {wait}s...")
                time.sleep(wait)
                continue
            resp.raise_for_status()
            data = resp.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return text.strip()
        except requests.exceptions.Timeout:
            log(f"    ⚠ Timeout on attempt {attempt+1}/{retries}")
            time.sleep(2 ** (attempt + 2))
        except Exception as e:
            log(f"    ⚠ Attempt {attempt+1} failed: {e}")
            if attempt < retries - 1:
                time.sleep(2 ** (attempt + 2))
    log(f"    ❌ All {retries} attempts failed")
    return None


# ─── Token Extraction ─────────────────────────────────────────────────────────

class TokenExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tokens = []
        self._in_token = False
        self._token_type = None
        self._token_text = ""

    def handle_starttag(self, tag, attrs):
        if tag == "span":
            classes = dict(attrs).get("class", "")
            if "ml-token" in classes:
                self._in_token = True
                for cls in classes.split():
                    if cls != "ml-token":
                        self._token_type = cls
                        break
                self._token_text = ""

    def handle_endtag(self, tag):
        if tag == "span" and self._in_token:
            self._in_token = False
            if self._token_text.strip():
                self.tokens.append((self._token_type, self._token_text.strip()))
            self._token_type = None
            self._token_text = ""

    def handle_data(self, data):
        if self._in_token:
            self._token_text += data


def extract_tokens(html):
    parser = TokenExtractor()
    parser.feed(html)
    return parser.tokens


# ─── Translation Prompts ──────────────────────────────────────────────────────

def translate_sample(english_html, level_label, prompt_text, exam_type="speaking"):
    prompt = f"""You are a professional English-to-Uzbek translator. Translate the following CEFR {exam_type} sample answer into accurate, natural Uzbek.

RULES:
1. This is a LITERAL translation — preserve the meaning and structure faithfully
2. Keep the same paragraph structure (preserve <p>, <br> tags)
3. REMOVE all <span> tags and their class attributes — just keep the text inside them
4. REMOVE any <!DOCTYPE>, <html>, <head>, <style>, <body> wrappers — output ONLY the inner content paragraphs
5. REMOVE any markdown code fences (```html or ```)
6. The translation should sound natural in Uzbek, not word-for-word robotic
7. Output ONLY the translated HTML content (with <p> tags), nothing else — no explanation, no preamble
8. This is a {level_label} level answer to the question: "{prompt_text}"

English HTML to translate:
{english_html}"""

    result = call_gemini(prompt)
    if result:
        result = re.sub(r'^```html?\s*', '', result)
        result = re.sub(r'\s*```$', '', result)
        result = result.strip()
    return result


def translate_tokens_batch(tokens_with_context):
    lines = []
    for i, (token_type, token_text, qprompt) in enumerate(tokens_with_context):
        lines.append(f"{i+1}. [{token_type}] \"{token_text}\" (from: \"{qprompt[:80]}\")")
    token_list = "\n".join(lines)

    prompt = f"""You are an expert English-to-Uzbek translator specializing in linguistics and phraseology.

Translate each English word/phrase below into Uzbek. Follow these rules strictly:

RULES BY TYPE:
- **adv** (adverbials): Give the direct Uzbek equivalent adverb/connector.
- **colloc** (collocations): Give the natural Uzbek collocation equivalent.
- **phrasal** (phrasal verbs): Give the Uzbek verb equivalent that carries the same meaning.
- **idiom** (idioms): Find the Uzbek EQUIVALENT idiom or expression. Do NOT translate word-for-word.
- **proverb** (proverbs): Find the closest Uzbek EQUIVALENT proverb/maqol.
- **modal** (modal verbs/expressions): Give the direct Uzbek equivalent.

OUTPUT FORMAT (strict JSON array, no markdown fences, no explanation):
[
  {{"en": "exact english text", "uz": "uzbek translation", "type": "adv"}},
  ...
]

Output ONLY the JSON array. No code fences. No preamble.

TOKENS TO TRANSLATE:
{token_list}"""

    result = call_gemini(prompt)
    if not result:
        return None
    result = re.sub(r'^```json?\s*', '', result)
    result = re.sub(r'\s*```$', '', result)
    result = result.strip()
    try:
        return json.loads(result)
    except json.JSONDecodeError as e:
        log(f"    ❌ JSON parse error: {e}")
        return None


# ─── Speaking File Processor ──────────────────────────────────────────────────

def process_speaking_file(filepath):
    log(f"  📂 SPEAKING: {os.path.basename(filepath)}")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    match = re.search(r'window\.SPEAKING_TEST_DATA\s*=\s*(\{.*\})\s*;?\s*$', content, re.DOTALL)
    if not match:
        log(f"    ❌ Could not parse SPEAKING_TEST_DATA")
        return False

    data = json.loads(match.group(1))
    questions = data.get("questions", [])

    # ── Phase 1: Sample translations ──
    sample_keys = [
        ("sampleAnswer", "uzSampleAnswer", "C1/C2"),
        ("sampleA1", "uzSampleA1", "A1"),
        ("sampleA2", "uzSampleA2", "A2"),
        ("sampleB1", "uzSampleB1", "B1"),
        ("sampleB2", "uzSampleB2", "B2"),
    ]

    samples_added = 0
    total_calls = sum(1 for q in questions for ek, uk, _ in sample_keys if q.get(ek) and not q.get(uk))
    call_num = 0
    for q in questions:
        qnum = q.get("number", "?")
        prompt_text = q.get("prompt", "")

        for eng_key, uz_key, level in sample_keys:
            if eng_key not in q or not q[eng_key]:
                continue
            if uz_key in q and q[uz_key]:
                continue  # already done

            call_num += 1
            log(f"      📝 Q{qnum}/{level} ({call_num}/{total_calls})")
            translated = translate_sample(q[eng_key], level, prompt_text, "speaking")
            if translated:
                q[uz_key] = translated
                samples_added += 1
            time.sleep(DELAY_BETWEEN_CALLS)

    log(f"    ✅ Samples: {samples_added} new translations")

    # ── Phase 2: Token translations ──
    tokens_added = 0
    if "tokenTranslations" not in data or not data["tokenTranslations"]:
        time.sleep(DELAY_BETWEEN_BATCHES)

        all_tokens = []
        seen = set()
        s_keys = ["sampleAnswer", "sampleA1", "sampleA2", "sampleB1", "sampleB2"]

        for q in questions:
            for sk in s_keys:
                if sk not in q or not q[sk]:
                    continue
                tokens = extract_tokens(q[sk])
                for ttype, ttext in tokens:
                    key = ttext.lower().strip('"').strip()
                    if key not in seen:
                        seen.add(key)
                        all_tokens.append((ttype, ttext, q.get("prompt", "")))

        if all_tokens:
            all_translations = {}
            batch_size = 25
            for i in range(0, len(all_tokens), batch_size):
                batch = all_tokens[i:i+batch_size]
                result = translate_tokens_batch(batch)
                if result:
                    for item in result:
                        en = item.get("en", "").strip()
                        uz = item.get("uz", "").strip()
                        ttype = item.get("type", "")
                        if en and uz:
                            all_translations[en] = {"uz": uz, "type": ttype}
                time.sleep(DELAY_BETWEEN_CALLS * 2)

            data["tokenTranslations"] = all_translations
            tokens_added = len(all_translations)

    log(f"    ✅ Tokens: {tokens_added} new translations")

    # ── Save ──
    prefix = content[:match.start()]
    new_json = json.dumps(data, ensure_ascii=False, indent=2)
    new_content = prefix + "window.SPEAKING_TEST_DATA = " + new_json + ";"
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    log(f"    💾 Saved {os.path.basename(filepath)}")
    return True


# ─── Writing File Processor ───────────────────────────────────────────────────

def process_writing_file(filepath):
    log(f"  📂 WRITING: {os.path.basename(filepath)}")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    match = re.search(r'window\.WRITING_TEST_DATA\s*=\s*(\{.*\})\s*;?\s*$', content, re.DOTALL)
    if not match:
        log(f"    ❌ Could not parse WRITING_TEST_DATA")
        return False

    data = json.loads(match.group(1))
    tasks = data.get("tasks", {})
    task_keys = ["t11", "t12", "t2"]

    # ── Phase 1: Sample translations ──
    sample_keys = [
        ("sample", "uzSample", "C1/C2"),
        ("sampleA1", "uzSampleA1", "A1"),
        ("sampleA2", "uzSampleA2", "A2"),
        ("sampleB1", "uzSampleB1", "B1"),
        ("sampleB2", "uzSampleB2", "B2"),
    ]

    samples_added = 0
    for tk in task_keys:
        task = tasks.get(tk)
        if not task:
            continue
        prompt_text = task.get("prompt", "")

        for eng_key, uz_key, level in sample_keys:
            if eng_key not in task or not task[eng_key]:
                continue
            if uz_key in task and task[uz_key]:
                continue

            translated = translate_sample(task[eng_key], level, prompt_text, "writing")
            if translated:
                task[uz_key] = translated
                samples_added += 1
            time.sleep(DELAY_BETWEEN_CALLS)

    log(f"    ✅ Samples: {samples_added} new translations")

    # ── Phase 2: Token translations ──
    tokens_added = 0
    if "tokenTranslations" not in data or not data["tokenTranslations"]:
        time.sleep(DELAY_BETWEEN_BATCHES)

        all_tokens = []
        seen = set()
        s_keys = ["sample", "sampleA1", "sampleA2", "sampleB1", "sampleB2"]

        for tk in task_keys:
            task = tasks.get(tk)
            if not task:
                continue
            for sk in s_keys:
                if sk not in task or not task[sk]:
                    continue
                tokens = extract_tokens(task[sk])
                for ttype, ttext in tokens:
                    key = ttext.lower().strip('"').strip()
                    if key not in seen:
                        seen.add(key)
                        all_tokens.append((ttype, ttext, task.get("prompt", "")))

        if all_tokens:
            all_translations = {}
            batch_size = 25
            for i in range(0, len(all_tokens), batch_size):
                batch = all_tokens[i:i+batch_size]
                result = translate_tokens_batch(batch)
                if result:
                    for item in result:
                        en = item.get("en", "").strip()
                        uz = item.get("uz", "").strip()
                        ttype = item.get("type", "")
                        if en and uz:
                            all_translations[en] = {"uz": uz, "type": ttype}
                time.sleep(DELAY_BETWEEN_CALLS * 2)

            data["tokenTranslations"] = all_translations
            tokens_added = len(all_translations)

    log(f"    ✅ Tokens: {tokens_added} new translations")

    # ── Save ──
    prefix = content[:match.start()]
    new_json = json.dumps(data, ensure_ascii=False, indent=2)
    new_content = prefix + "window.WRITING_TEST_DATA = " + new_json + ";"
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    log(f"    💾 Saved {os.path.basename(filepath)}")
    return True


# ─── File Discovery ───────────────────────────────────────────────────────────

def get_speaking_files():
    """Return sorted list of all speaking question files."""
    files = []
    # questions.js = mock 1
    f1 = os.path.join(SPEAKING_DIR, "questions.js")
    if os.path.exists(f1):
        files.append((1, f1))
    # questions02.js through questions65.js
    for i in range(2, 100):
        fname = f"questions{i:02d}.js"
        fpath = os.path.join(SPEAKING_DIR, fname)
        if os.path.exists(fpath):
            files.append((i, fpath))
    files.sort(key=lambda x: x[0])
    return files


def get_writing_files():
    """Return sorted list of all writing question files."""
    files = []
    f1 = os.path.join(WRITING_DIR, "writing-questions.js")
    if os.path.exists(f1):
        files.append((1, f1))
    for i in range(2, 200):
        fname = f"writing-questions{i:02d}.js"
        fpath = os.path.join(WRITING_DIR, fname)
        if os.path.exists(fpath):
            files.append((i, fpath))
    files.sort(key=lambda x: x[0])
    return files


def is_file_translated(filepath, file_type):
    """Check if a file already has translations (both samples and tokens)."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        if file_type == "speaking":
            match = re.search(r'window\.SPEAKING_TEST_DATA\s*=\s*(\{.*\})\s*;?\s*$', content, re.DOTALL)
            if not match:
                return False
            data = json.loads(match.group(1))
            questions = data.get("questions", [])
            if not questions:
                return False
            has_samples = all(q.get("uzSampleAnswer") for q in questions if q.get("sampleAnswer"))
            has_tokens = bool(data.get("tokenTranslations"))
            return has_samples and has_tokens
        else:
            match = re.search(r'window\.WRITING_TEST_DATA\s*=\s*(\{.*\})\s*;?\s*$', content, re.DOTALL)
            if not match:
                return False
            data = json.loads(match.group(1))
            tasks = data.get("tasks", {})
            has_samples = all(
                tasks.get(tk, {}).get("uzSample")
                for tk in ["t11", "t12", "t2"]
                if tasks.get(tk, {}).get("sample")
            )
            has_tokens = bool(data.get("tokenTranslations"))
            return has_samples and has_tokens
    except:
        return False


# ─── Status Report ────────────────────────────────────────────────────────────

def show_status():
    print("\n╔════════════════════════════════════════════╗")
    print("║     TRANSLATION PROGRESS REPORT            ║")
    print("╚════════════════════════════════════════════╝\n")

    speaking_files = get_speaking_files()
    writing_files = get_writing_files()

    s_done = sum(1 for _, fp in speaking_files if is_file_translated(fp, "speaking"))
    w_done = sum(1 for _, fp in writing_files if is_file_translated(fp, "writing"))

    print(f"  SPEAKING: {s_done}/{len(speaking_files)} complete")
    if s_done < len(speaking_files):
        remaining = [(n, fp) for n, fp in speaking_files if not is_file_translated(fp, "speaking")]
        nums = [str(n) for n, _ in remaining[:20]]
        print(f"    Next: mocks {', '.join(nums)}{'...' if len(remaining) > 20 else ''}")

    print(f"  WRITING:  {w_done}/{len(writing_files)} complete")
    if w_done < len(writing_files):
        remaining = [(n, fp) for n, fp in writing_files if not is_file_translated(fp, "writing")]
        nums = [str(n) for n, _ in remaining[:20]]
        print(f"    Next: mocks {', '.join(nums)}{'...' if len(remaining) > 20 else ''}")

    total = len(speaking_files) + len(writing_files)
    done = s_done + w_done
    print(f"\n  TOTAL: {done}/{total} ({done*100//total}%)\n")


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Batch translate CEFR mocks to Uzbek")
    parser.add_argument('--type', choices=['speaking', 'writing', 'both'], default='both',
                        help='Which mock type to process')
    parser.add_argument('--start', type=int, default=1,
                        help='Starting mock number (inclusive)')
    parser.add_argument('--end', type=int, default=999,
                        help='Ending mock number (inclusive)')
    parser.add_argument('--status', action='store_true',
                        help='Show progress summary and exit')

    args = parser.parse_args()

    if args.status:
        show_status()
        return

    # Lock to prevent duplicate instances
    acquire_lock()
    import atexit
    atexit.register(release_lock)

    log(f"\n{'='*60}")
    log(f"BATCH TRANSLATE — type={args.type} range={args.start}-{args.end}")
    log(f"{'='*60}")

    files_to_process = []

    if args.type in ('speaking', 'both'):
        for num, fp in get_speaking_files():
            if args.start <= num <= args.end:
                if not is_file_translated(fp, "speaking"):
                    files_to_process.append(("speaking", num, fp))
                else:
                    log(f"  ⏭ Speaking mock {num} already done, skipping")

    if args.type in ('writing', 'both'):
        for num, fp in get_writing_files():
            if args.start <= num <= args.end:
                if not is_file_translated(fp, "writing"):
                    files_to_process.append(("writing", num, fp))
                else:
                    log(f"  ⏭ Writing mock {num} already done, skipping")

    if not files_to_process:
        log("✅ Nothing to process — all files in range are already translated!")
        return

    log(f"\n📋 {len(files_to_process)} files to process\n")

    success = 0
    failed = 0

    for idx, (ftype, num, fp) in enumerate(files_to_process):
        log(f"\n[{idx+1}/{len(files_to_process)}] Mock {num} ({ftype})")
        try:
            if ftype == "speaking":
                ok = process_speaking_file(fp)
            else:
                ok = process_writing_file(fp)

            if ok:
                success += 1
            else:
                failed += 1
        except Exception as e:
            log(f"    ❌ ERROR: {e}")
            failed += 1

        # Delay between files
        if idx < len(files_to_process) - 1:
            time.sleep(DELAY_BETWEEN_FILES)

    log(f"\n{'='*60}")
    log(f"BATCH COMPLETE: {success} succeeded, {failed} failed")
    log(f"{'='*60}\n")

    show_status()


if __name__ == "__main__":
    main()
