#!/usr/bin/env python3
"""
Batch-generate rich explanations (with verbatim passage quotes) for all IELTS Reading tests
using the Gemini API.

Usage:
    python generate_explanations_batch.py              # process all tests 01-38
    python generate_explanations_batch.py 5 12         # process tests 05 to 12 (inclusive)
    python generate_explanations_batch.py 5            # process tests 05 to 38

Skips any question that already has a rich {text, quote} explanation.
Saves after every passage so progress is never lost.
"""

import json
import os
import re
import sys
import time
import requests
from html.parser import HTMLParser

# ─── Config ───────────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyAgsMeOT8t-8AGcEE0QWgh4VLubxti7xL8")
GEMINI_MODEL   = "gemini-2.0-flash"
SCRIPT_DIR     = os.path.dirname(os.path.abspath(__file__))
QUESTIONS_DIR  = os.path.join(SCRIPT_DIR, "questions IELTS R")
TOTAL_TESTS    = 38
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


# ─── Prompt builder ───────────────────────────────────────────────────────────
def build_prompt(passage_text, q_num, q_type_name, q_text, options, features, correct_answer):
    answer_str = " / ".join(str(c) for c in correct_answer)

    opt_block = ""
    if options:
        letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        opt_block = "\nOptions:\n" + "\n".join(f"  {letters[i]}) {o}" for i, o in enumerate(options))

    feat_block = ""
    if features and not options:
        feat_block = "\nAvailable choices:\n" + "\n".join(f"  {f}" for f in features)

    return f"""You are an expert IELTS reading answer-key writer.

PASSAGE TEXT:
{passage_text}

---
QUESTION {q_num} (Type: {q_type_name})
{q_text}{opt_block}{feat_block}

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
- If the answer is NOT GIVEN (no passage evidence exists), set "quote" to "".
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
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    match = re.search(r"window\.IELTS_READING_TEST\s*=\s*(\{.*\})\s*;?\s*$", content, re.DOTALL)
    if not match:
        raise ValueError(f"Could not find window.IELTS_READING_TEST in {filepath}")
    json_str = match.group(1)
    try:
        data = json.loads(json_str)
    except json.JSONDecodeError:
        print("  ⚠  Corrupted JSON — auto-repairing…", flush=True)
        fixed = _fix_json_control_chars(json_str)
        data = json.loads(fixed)
        repaired_content = content[: match.start(1)] + fixed + content[match.end(1):]
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(repaired_content)
        content = repaired_content
        print("  ✓  File repaired.", flush=True)
    return data, content


def save_test_data(filepath: str, original_content: str, data: dict) -> str:
    json_str = json.dumps(data, indent=4, ensure_ascii=False)
    replacement = f"window.IELTS_READING_TEST = {json_str};\n"
    new_content = re.sub(
        r"window\.IELTS_READING_TEST\s*=\s*\{.*\}\s*;?\s*$",
        lambda _: replacement,
        original_content,
        flags=re.DOTALL,
    )
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    return new_content


# ─── Process one test file ─────────────────────────────────────────────────────
def process_test(test_num: int) -> tuple[int, int, int]:
    filename = f"ielts-reading-test-{test_num:02d}.js"
    filepath = os.path.join(QUESTIONS_DIR, filename)

    if not os.path.exists(filepath):
        print(f"  ⚠  File not found, skipping: {filename}")
        return 0, 0, 0

    print(f"\n{'#'*64}")
    print(f"  TEST {test_num:02d}  —  {filename}")
    print(f"{'#'*64}")

    data, original_content = load_test_data(filepath)
    updated = skipped = errors = 0

    for passage in data["passages"]:
        passage_text = strip_html(passage.get("passage", ""))
        pid = passage["id"]
        print(f"\n  {'='*56}")
        print(f"  Passage {pid}: {passage.get('title', '')}")
        print(f"  {'='*56}")

        if "explanations" not in passage:
            passage["explanations"] = {}

        for section in passage.get("questionSections", []):
            q_type_name = section.get("typeName", section.get("type", "Unknown"))
            global_features = section.get("featuresList", [])

            for q in section.get("questions", []):
                q_id  = q["id"]
                key   = f"q{q_id}"
                existing = passage["explanations"].get(key)

                # Already a rich object? Skip.
                if isinstance(existing, dict) and existing.get("text") and existing.get("quote") is not None:
                    print(f"    Q{q_id:02d}: SKIP (already enriched)")
                    skipped += 1
                    continue

                q_text   = strip_html(q.get("text", ""))
                options  = list(q.get("options") or [])
                features = global_features if not options else []

                correct_raw = passage["correctAnswers"].get(key, [])
                correct = list(correct_raw) if isinstance(correct_raw, list) else [correct_raw]

                print(f"    Q{q_id:02d} ({q_type_name}): ", end="", flush=True)

                prompt = build_prompt(passage_text, q_id, q_type_name, q_text, options, features, correct)

                try:
                    result = call_gemini_with_retry(prompt)
                    if isinstance(result, list):
                        result = result[0] if result else {}
                    if not isinstance(result, dict) or "text" not in result:
                        raise ValueError(f"Unexpected shape: {result}")

                    expl_text  = result.get("text",  "").strip()
                    expl_quote = result.get("quote", "").strip()

                    passage["explanations"][key] = {"text": expl_text, "quote": expl_quote}

                    preview = expl_quote[:70] + "…" if len(expl_quote) > 70 else expl_quote
                    print(f'✓  "{preview}"')
                    updated += 1

                except Exception as e:
                    print(f"✗  ERROR: {e}")
                    errors += 1
                    passage["explanations"][key] = {
                        "text":  str(existing) if existing else "",
                        "quote": "",
                    }

                time.sleep(DELAY_SECS)

        # Save after every passage
        print(f"  → Saving Passage {pid}…", end=" ", flush=True)
        original_content = save_test_data(filepath, original_content, data)
        print("saved ✓")

    print(f"\n  Test {test_num:02d} complete: {updated} updated, {skipped} skipped, {errors} errors")
    return updated, skipped, errors


# ─── Entry point ──────────────────────────────────────────────────────────────
def main():
    args = sys.argv[1:]
    start = int(args[0]) if len(args) >= 1 else 1
    end   = int(args[1]) if len(args) >= 2 else TOTAL_TESTS

    print(f"Batch explanations generator — tests {start:02d} to {end:02d}")
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
