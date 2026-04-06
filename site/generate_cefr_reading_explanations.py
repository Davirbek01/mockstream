#!/usr/bin/env python3
"""
Batch-generate rich explanations (with verbatim passage quotes) for all CEFR Reading tests
using the Gemini API.

Usage:
    python generate_cefr_reading_explanations.py              # process all tests 01-14
    python generate_cefr_reading_explanations.py 5 12         # process tests 05 to 12
    python generate_cefr_reading_explanations.py 5            # process tests 05 to 14

Skips any question that already has a rich {text, quote} explanation.
Saves after every part so progress is never lost.
"""

import json
import os
import re
import sys
import time
import requests
from html.parser import HTMLParser

# ─── Config ───────────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL   = "gemini-2.0-flash"
SCRIPT_DIR     = os.path.dirname(os.path.abspath(__file__))
QUESTIONS_DIR  = os.path.join(SCRIPT_DIR, "questions CEFR R")
TOTAL_TESTS    = 33
DELAY_SECS     = 1.5   # between API calls


# ─── HTML stripping ───────────────────────────────────────────────────────────
class _Stripper(HTMLParser):
    def __init__(self):
        super().__init__()
        self._parts = []

    def handle_data(self, d):
        self._parts.append(d)

    def get_data(self):
        return " ".join(self._parts).strip()


def strip_html(text: str) -> str:
    s = _Stripper()
    s.feed(text or "")
    return re.sub(r"\s+", " ", s.get_data()).strip()


# ─── Gemini API ───────────────────────────────────────────────────────────────
def call_gemini(prompt: str) -> dict:
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.1,
        },
    }
    resp = requests.post(url, json=payload, timeout=30)
    resp.raise_for_status()
    raw_text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
    raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text.strip())
    raw_text = re.sub(r"\s*```$", "", raw_text.strip())
    return json.loads(raw_text)


def call_gemini_with_retry(prompt: str, retries: int = 3) -> dict:
    for attempt in range(1, retries + 1):
        try:
            return call_gemini(prompt)
        except Exception as e:
            if attempt < retries:
                wait = 4 * attempt
                print(f"\n    ↺ attempt {attempt} failed ({e}), retrying in {wait}s…", end="", flush=True)
                time.sleep(wait)
            else:
                raise


# ─── Prompt builders (per part type) ─────────────────────────────────────────
def build_prompt_gap_fill(passage_text, q_id, hint, correct_answer):
    return f"""You are an expert CEFR reading answer-key writer.

PASSAGE TEXT:
{passage_text}

---
QUESTION {q_id} (Type: Gap Fill from Text)
Fill in the gap: {hint}

CORRECT ANSWER: {correct_answer}
---

Your tasks:
1. Find the EXACT sentence from the PASSAGE TEXT that contains this gap (where the answer word fits).
   Copy the full sentence verbatim — do NOT paraphrase.
2. Write a concise explanation (1-2 sentences) of WHY this word is the correct answer,
   referencing context clues from the passage.

Rules:
- "quote" must be copied word-for-word from the passage (the sentence containing the gap).
- Do NOT include markdown, code fences, or any text outside the JSON.

Respond with ONLY this JSON object:
{{"quote": "exact verbatim sentence from the passage", "text": "your concise explanation"}}"""


def build_prompt_matching(texts_block, statements_block, q_id, text_content, correct_letter, statement_text):
    return f"""You are an expert CEFR reading answer-key writer.

TEXTS:
{texts_block}

STATEMENTS:
{statements_block}

---
QUESTION {q_id} (Type: Matching Texts to Statements)
Text {q_id}: {text_content}

CORRECT ANSWER: Statement {correct_letter} — "{statement_text}"
---

Your tasks:
1. Find the EXACT sentence or phrase from Text {q_id} that most directly supports
   why it matches Statement {correct_letter}. Copy it verbatim.
2. Write a concise explanation (1-2 sentences) of WHY this text matches this statement.

Rules:
- "quote" must be copied word-for-word from the text. Keep it to one sentence or
  the shortest phrase that proves the match.
- Do NOT include markdown, code fences, or any text outside the JSON.

Respond with ONLY this JSON object:
{{"quote": "exact verbatim sentence/phrase from the text", "text": "your concise explanation"}}"""


def build_prompt_matching_headings(passage_text, q_id, paragraph_text, correct_letter, heading_text):
    return f"""You are an expert CEFR reading answer-key writer.

FULL PASSAGE:
{passage_text}

---
QUESTION {q_id} (Type: Matching Headings to Paragraphs)
Paragraph text: {paragraph_text}

CORRECT ANSWER: Heading {correct_letter} — "{heading_text}"
---

Your tasks:
1. Find the EXACT sentence or phrase from the paragraph that most directly supports
   why heading "{heading_text}" is the correct heading. Copy it verbatim.
2. Write a concise explanation (1-2 sentences) of WHY this heading fits this paragraph.

Rules:
- "quote" must be copied word-for-word from the paragraph text.
- Do NOT include markdown, code fences, or any text outside the JSON.

Respond with ONLY this JSON object:
{{"quote": "exact verbatim sentence/phrase from the paragraph", "text": "your concise explanation"}}"""


def build_prompt_comprehension(passage_text, q_id, q_type, q_text, options, correct_answer):
    answer_str = " / ".join(str(c) for c in correct_answer)

    opt_block = ""
    if options:
        opt_block = "\nOptions:\n" + "\n".join(f"  {o['letter']}) {o['text']}" for o in options)

    type_label = "Multiple Choice" if q_type == "mcq" else "True/False/No Information" if q_type == "tfni" else "Gap Fill"

    return f"""You are an expert CEFR reading answer-key writer.

PASSAGE TEXT:
{passage_text}

---
QUESTION {q_id} (Type: {type_label})
{q_text}{opt_block}

CORRECT ANSWER: {answer_str}
---

Your tasks:
1. Find the EXACT sentence or short phrase from the PASSAGE TEXT above that most directly
   supports or justifies this answer. Copy it verbatim — do NOT paraphrase.
2. Write a concise explanation (1-2 sentences) of WHY this is the correct answer,
   referencing the passage evidence.

Rules:
- "quote" must be copied word-for-word from the passage. Keep it to one sentence or
  the shortest phrase that proves the answer.
- If the answer is "No Information" (no passage evidence exists), set "quote" to "".
- Do NOT include markdown, code fences, or any text outside the JSON.

Respond with ONLY this JSON object:
{{"quote": "exact verbatim sentence/phrase from the passage, or empty string", "text": "your concise explanation"}}"""


# ─── JS file helpers ──────────────────────────────────────────────────────────
def _fix_json_control_chars(json_str: str) -> str:
    out = []
    in_string = False
    skip_next = False
    for ch in json_str:
        if skip_next:
            out.append(ch)
            skip_next = False
        elif ch == '\\' and in_string:
            out.append(ch)
            skip_next = True
        elif ch == '"':
            out.append(ch)
            in_string = not in_string
        elif in_string and ch == '\n':
            out.append('\\n')
        elif in_string and ch == '\r':
            out.append('\\r')
        elif in_string and ch == '\t':
            out.append('\\t')
        elif in_string and ord(ch) < 0x20:
            out.append(f'\\u{ord(ch):04x}')
        else:
            out.append(ch)
    return ''.join(out)


def load_test_data(filepath: str):
    """Load CEFR reading test data using Node.js to parse JS syntax."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Use Node.js to evaluate the JS and extract the data as JSON
    node_script = f"""
const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync({json.dumps(filepath)}, 'utf8');
const ctx = {{ window: {{}} }};
vm.createContext(ctx);
vm.runInContext(code, ctx);
process.stdout.write(JSON.stringify(ctx.window.CEFR_READING_TEST));
"""
    import subprocess
    result = subprocess.run(
        ["node", "-e", node_script],
        capture_output=True, text=True, timeout=15, encoding="utf-8"
    )
    if result.returncode != 0:
        raise ValueError(f"Node.js parse failed: {result.stderr.strip()}")
    data = json.loads(result.stdout)
    return data, content


def _convert_backticks_to_strings(js_str: str) -> str:
    """Convert JS template literals (backtick strings) to JSON-safe double-quoted strings."""
    result = []
    i = 0
    in_double_string = False
    in_single_string = False
    escape_next = False

    while i < len(js_str):
        ch = js_str[i]

        if escape_next:
            result.append(ch)
            escape_next = False
            i += 1
            continue

        if ch == '\\' and (in_double_string or in_single_string):
            result.append(ch)
            escape_next = True
            i += 1
            continue

        if ch == '"' and not in_single_string:
            in_double_string = not in_double_string
            result.append(ch)
            i += 1
            continue

        if ch == "'" and not in_double_string:
            in_single_string = not in_single_string
            result.append(ch)
            i += 1
            continue

        if ch == '`' and not in_double_string and not in_single_string:
            # Start of template literal — find matching backtick
            end = js_str.index('`', i + 1)
            inner = js_str[i + 1:end]
            # Escape for JSON: backslashes, double quotes, newlines, tabs
            inner = inner.replace('\\', '\\\\')
            inner = inner.replace('"', '\\"')
            inner = inner.replace('\n', '\\n')
            inner = inner.replace('\r', '\\r')
            inner = inner.replace('\t', '\\t')
            result.append('"')
            result.append(inner)
            result.append('"')
            i = end + 1
            continue

        result.append(ch)
        i += 1

    return ''.join(result)


def save_test_data(filepath: str, original_content: str, data: dict) -> str:
    json_str = json.dumps(data, indent=4, ensure_ascii=False)
    replacement = f"window.CEFR_READING_TEST = {json_str};\n"
    new_content = re.sub(
        r"(?:^\s*//.*\n)*\s*window\.CEFR_READING_TEST\s*=\s*\{.*\}\s*;?\s*$",
        lambda _: replacement,
        original_content,
        flags=re.DOTALL,
    )
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    return new_content


# ─── Extract passage text for each part type ─────────────────────────────────
def get_passage_text(part: dict) -> str:
    """Extract the relevant text content from a part for prompt building."""
    ptype = part.get("type", "")

    if ptype == "gap-fill-text":
        return strip_html(part.get("passage", {}).get("content", ""))

    elif ptype == "matching":
        # Combine all text items
        texts = part.get("texts", [])
        return "\n\n".join(
            f"Text {t['number']}: {strip_html(t.get('content', ''))}"
            for t in texts
        )

    elif ptype == "matching-headings":
        paras = part.get("passage", {}).get("paragraphs", [])
        return "\n\n".join(
            f"Paragraph {p['number']}: {strip_html(p.get('content', ''))}"
            for p in paras
        )

    elif ptype == "reading-comprehension":
        return strip_html(part.get("passage", {}).get("content", ""))

    return ""


# ─── Process one part of a test ──────────────────────────────────────────────
def process_part(part: dict, passage_text: str) -> tuple[int, int, int]:
    """Process all questions in a part, generating explanations via Gemini."""
    ptype = part.get("type", "")
    answers = part.get("answers", {})
    updated = skipped = errors = 0

    if "explanations" not in part:
        part["explanations"] = {}

    if ptype == "gap-fill-text":
        for q in part.get("questions", []):
            q_id = q["id"]
            key = f"q{q_id}"
            existing = part["explanations"].get(key)
            if isinstance(existing, dict) and existing.get("text") and existing.get("quote") is not None:
                print(f"    Q{q_id:02d}: SKIP (already enriched)")
                skipped += 1
                continue

            correct_raw = answers.get(str(q_id), answers.get(q_id, []))
            correct = correct_raw if isinstance(correct_raw, list) else [correct_raw]
            correct_str = " / ".join(str(c) for c in correct)
            hint = q.get("hint", f"Q{q_id}")

            print(f"    Q{q_id:02d} (gap-fill-text): ", end="", flush=True)
            prompt = build_prompt_gap_fill(passage_text, q_id, hint, correct_str)

            try:
                result = call_gemini_with_retry(prompt)
                if isinstance(result, list):
                    result = result[0] if result else {}
                if not isinstance(result, dict) or "text" not in result:
                    raise ValueError(f"Unexpected shape: {result}")
                part["explanations"][key] = {"text": result.get("text", "").strip(), "quote": result.get("quote", "").strip()}
                preview = result.get("quote", "")[:70]
                print(f'✓  "{preview}…"' if len(result.get("quote", "")) > 70 else f'✓  "{preview}"')
                updated += 1
            except Exception as e:
                print(f"✗  ERROR: {e}")
                errors += 1
                part["explanations"][key] = {"text": str(existing) if existing else "", "quote": ""}
            time.sleep(DELAY_SECS)

    elif ptype == "matching":
        texts = part.get("texts", [])
        statements = part.get("statements", [])
        texts_block = "\n".join(f"Text {t['number']}: {strip_html(t.get('content', ''))}" for t in texts)
        stmts_block = "\n".join(f"{s['letter']}) {s['text']}" for s in statements)
        stmt_map = {s["letter"]: s["text"] for s in statements}

        for q in part.get("questions", []):
            q_id = q["id"]
            key = f"q{q_id}"
            existing = part["explanations"].get(key)
            if isinstance(existing, dict) and existing.get("text") and existing.get("quote") is not None:
                print(f"    Q{q_id:02d}: SKIP (already enriched)")
                skipped += 1
                continue

            correct_raw = answers.get(str(q_id), answers.get(q_id, []))
            correct = correct_raw if isinstance(correct_raw, list) else [correct_raw]
            correct_letter = correct[0]
            statement_text = stmt_map.get(correct_letter, "")
            text_content = ""
            for t in texts:
                if t["number"] == q_id:
                    text_content = strip_html(t.get("content", ""))
                    break

            print(f"    Q{q_id:02d} (matching): ", end="", flush=True)
            prompt = build_prompt_matching(texts_block, stmts_block, q_id, text_content, correct_letter, statement_text)

            try:
                result = call_gemini_with_retry(prompt)
                if isinstance(result, list):
                    result = result[0] if result else {}
                if not isinstance(result, dict) or "text" not in result:
                    raise ValueError(f"Unexpected shape: {result}")
                part["explanations"][key] = {"text": result.get("text", "").strip(), "quote": result.get("quote", "").strip()}
                preview = result.get("quote", "")[:70]
                print(f'✓  "{preview}…"' if len(result.get("quote", "")) > 70 else f'✓  "{preview}"')
                updated += 1
            except Exception as e:
                print(f"✗  ERROR: {e}")
                errors += 1
                part["explanations"][key] = {"text": str(existing) if existing else "", "quote": ""}
            time.sleep(DELAY_SECS)

    elif ptype == "matching-headings":
        paras = part.get("passage", {}).get("paragraphs", [])
        headings = part.get("headings", [])
        heading_map = {h["letter"]: h["text"] for h in headings}
        full_passage = "\n\n".join(
            f"Paragraph {p['number']}: {strip_html(p.get('content', ''))}" for p in paras
        )

        for q in part.get("questions", []):
            q_id = q["id"]
            key = f"q{q_id}"
            existing = part["explanations"].get(key)
            if isinstance(existing, dict) and existing.get("text") and existing.get("quote") is not None:
                print(f"    Q{q_id:02d}: SKIP (already enriched)")
                skipped += 1
                continue

            correct_raw = answers.get(str(q_id), answers.get(q_id, []))
            correct = correct_raw if isinstance(correct_raw, list) else [correct_raw]
            correct_letter = correct[0]
            heading_text = heading_map.get(correct_letter, "")

            # Find paragraph text
            para_text = ""
            para_num = q.get("paragraphNumber", "")
            for p in paras:
                if str(p["number"]) == str(para_num) or p.get("questionId") == q_id:
                    para_text = strip_html(p.get("content", ""))
                    break

            print(f"    Q{q_id:02d} (matching-headings): ", end="", flush=True)
            prompt = build_prompt_matching_headings(full_passage, q_id, para_text, correct_letter, heading_text)

            try:
                result = call_gemini_with_retry(prompt)
                if isinstance(result, list):
                    result = result[0] if result else {}
                if not isinstance(result, dict) or "text" not in result:
                    raise ValueError(f"Unexpected shape: {result}")
                part["explanations"][key] = {"text": result.get("text", "").strip(), "quote": result.get("quote", "").strip()}
                preview = result.get("quote", "")[:70]
                print(f'✓  "{preview}…"' if len(result.get("quote", "")) > 70 else f'✓  "{preview}"')
                updated += 1
            except Exception as e:
                print(f"✗  ERROR: {e}")
                errors += 1
                part["explanations"][key] = {"text": str(existing) if existing else "", "quote": ""}
            time.sleep(DELAY_SECS)

    elif ptype == "reading-comprehension":
        for section in part.get("questionSections", []):
            sec_type = section.get("type", "")
            for q in section.get("questions", []):
                q_id = q["id"]
                key = f"q{q_id}"
                existing = part["explanations"].get(key)
                if isinstance(existing, dict) and existing.get("text") and existing.get("quote") is not None:
                    print(f"    Q{q_id:02d}: SKIP (already enriched)")
                    skipped += 1
                    continue

                correct_raw = answers.get(str(q_id), answers.get(q_id, []))
                correct = correct_raw if isinstance(correct_raw, list) else [correct_raw]
                q_text = strip_html(q.get("text", q.get("hint", "")))
                options = q.get("options", [])

                print(f"    Q{q_id:02d} ({sec_type}): ", end="", flush=True)
                prompt = build_prompt_comprehension(passage_text, q_id, sec_type, q_text, options, correct)

                try:
                    result = call_gemini_with_retry(prompt)
                    if isinstance(result, list):
                        result = result[0] if result else {}
                    if not isinstance(result, dict) or "text" not in result:
                        raise ValueError(f"Unexpected shape: {result}")
                    part["explanations"][key] = {"text": result.get("text", "").strip(), "quote": result.get("quote", "").strip()}
                    preview = result.get("quote", "")[:70]
                    print(f'✓  "{preview}…"' if len(result.get("quote", "")) > 70 else f'✓  "{preview}"')
                    updated += 1
                except Exception as e:
                    print(f"✗  ERROR: {e}")
                    errors += 1
                    part["explanations"][key] = {"text": str(existing) if existing else "", "quote": ""}
                time.sleep(DELAY_SECS)

    return updated, skipped, errors


# ─── Process one test file ────────────────────────────────────────────────────
def process_test(test_num: int) -> tuple[int, int, int]:
    filename = f"cefr-reading-test-{test_num:02d}.js"
    filepath = os.path.join(QUESTIONS_DIR, filename)

    if not os.path.exists(filepath):
        print(f"  ⚠  File not found, skipping: {filename}")
        return 0, 0, 0

    print(f"\n{'#'*64}")
    print(f"  TEST {test_num:02d}  —  {filename}")
    print(f"{'#'*64}")

    data, original_content = load_test_data(filepath)
    total_updated = total_skipped = total_errors = 0

    for part in data.get("parts", []):
        pnum = part.get("partNumber", "?")
        ptype = part.get("type", "unknown")
        print(f"\n  {'='*56}")
        print(f"  Part {pnum}: {part.get('title', '')} ({ptype})")
        print(f"  {'='*56}")

        passage_text = get_passage_text(part)
        u, s, e = process_part(part, passage_text)
        total_updated += u
        total_skipped += s
        total_errors += e

        # Save after every part
        print(f"  → Saving Part {pnum}…", end=" ", flush=True)
        original_content = save_test_data(filepath, original_content, data)
        print("saved ✓")

    print(f"\n  Test {test_num:02d} complete: {total_updated} updated, {total_skipped} skipped, {total_errors} errors")
    return total_updated, total_skipped, total_errors


# ─── Entry point ──────────────────────────────────────────────────────────────
def main():
    args = sys.argv[1:]
    start = int(args[0]) if len(args) >= 1 else 1
    end   = int(args[1]) if len(args) >= 2 else TOTAL_TESTS

    print(f"CEFR Reading Explanations Generator — tests {start:02d} to {end:02d}")
    print(f"Questions dir: {QUESTIONS_DIR}\n")

    total_updated = total_skipped = total_errors = 0

    for n in range(start, end + 1):
        u, s, e = process_test(n)
        total_updated += u
        total_skipped += s
        total_errors  += e

    print(f"\n{'='*64}")
    print(f"BATCH COMPLETE")
    print(f"  Updated : {total_updated}")
    print(f"  Skipped : {total_skipped}")
    print(f"  Errors  : {total_errors}")
    print(f"{'='*64}")


if __name__ == "__main__":
    main()
