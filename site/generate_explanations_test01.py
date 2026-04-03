#!/usr/bin/env python3
"""
Generate rich explanations (with verbatim passage quotes) for IELTS Reading Test 01
using the Gemini API.

Usage:
    python generate_explanations_test01.py

The script reads/writes:
    questions IELTS R/ielts-reading-test-01.js

It skips any question that already has a rich explanation object {"text":..., "quote":...}.
Existing plain-string explanations are upgraded in-place.
"""

import json
import os
import re
import time
import requests
from html.parser import HTMLParser

# ─── Config ───────────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyAgsMeOT8t-8AGcEE0QWgh4VLubxti7xL8")
GEMINI_MODEL   = "gemini-2.0-flash"
SCRIPT_DIR     = os.path.dirname(os.path.abspath(__file__))
TEST_FILE      = os.path.join(SCRIPT_DIR, "questions IELTS R", "ielts-reading-test-01.js")
DELAY_SECS     = 1.5   # between API calls to avoid rate-limit


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
    raw = s.get_data()
    return re.sub(r"\s+", " ", raw).strip()


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
    # Strip markdown code fences if Gemini wraps them anyway
    raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text.strip())
    raw_text = re.sub(r"\s*```$", "", raw_text.strip())
    return json.loads(raw_text)


# ─── Prompt builder ───────────────────────────────────────────────────────────
def build_prompt(
    passage_text: str,
    q_num: int,
    q_type_name: str,
    q_text: str,
    options: list,
    features: list,
    correct_answer: list,
) -> str:
    answer_str = " / ".join(str(c) for c in correct_answer)

    opt_block = ""
    if options:
        letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        opt_block = "\nOptions:\n" + "\n".join(
            f"  {letters[i]}) {o}" for i, o in enumerate(options)
        )

    feat_block = ""
    if features and not options:
        feat_block = "\nAvailable choices:\n" + "\n".join(
            f"  {f}" for f in features
        )

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
- If the answer is NOT GIVEN or NOT GIVEN (no passage evidence exists), set "quote" to "".
- Do NOT include markdown, code fences, or any text outside the JSON.

Respond with ONLY this JSON object:
{{"quote": "exact verbatim sentence/phrase from the passage, or empty string", "text": "your concise explanation"}}"""


def _fix_json_control_chars(json_str: str) -> str:
    """Escape literal control characters (newlines, tabs, etc.) inside JSON strings.
    Needed when re.sub replacement corrupted the file by converting \\n to real newlines."""
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


# ─── JS file I/O ──────────────────────────────────────────────────────────────
def load_test_data(filepath: str):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    match = re.search(
        r"window\.IELTS_READING_TEST\s*=\s*(\{.*\})\s*;?\s*$",
        content,
        re.DOTALL,
    )
    if not match:
        raise ValueError("Could not find window.IELTS_READING_TEST in file")
    json_str = match.group(1)
    try:
        data = json.loads(json_str)
    except json.JSONDecodeError:
        print("  ⚠  Corrupted JSON detected — auto-repairing…", flush=True)
        fixed = _fix_json_control_chars(json_str)
        data = json.loads(fixed)
        # Resave repaired file immediately
        repaired_content = content[: match.start(1)] + fixed + content[match.end(1):]
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(repaired_content)
        content = repaired_content
        print("  ✓  File repaired and resaved.", flush=True)
    return data, content


def save_test_data(filepath: str, original_content: str, data: dict) -> str:
    """Returns the new file content so caller can update original_content."""
    json_str = json.dumps(data, indent=4, ensure_ascii=False)
    replacement = f"window.IELTS_READING_TEST = {json_str};\n"
    # Use a lambda so re.sub never processes backslash-escapes in json_str
    new_content = re.sub(
        r"window\.IELTS_READING_TEST\s*=\s*\{.*\}\s*;?\s*$",
        lambda _: replacement,
        original_content,
        flags=re.DOTALL,
    )
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    return new_content


# ─── Main ─────────────────────────────────────────────────────────────────────
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


def main():
    print(f"Loading: {TEST_FILE}")
    data, original_content = load_test_data(TEST_FILE)

    updated = 0
    skipped = 0
    errors  = 0

    for passage in data["passages"]:
        passage_text = strip_html(passage.get("passage", ""))
        pid = passage["id"]
        print(f"\n{'='*60}")
        print(f"Passage {pid}: {passage.get('title', '')}")
        print(f"{'='*60}")

        if "explanations" not in passage:
            passage["explanations"] = {}

        for section in passage.get("questionSections", []):
            q_type_name = section.get("typeName", section.get("type", "Unknown"))
            global_features = section.get("featuresList", [])

            for q in section.get("questions", []):
                q_id  = q["id"]
                key   = f"q{q_id}"
                existing = passage["explanations"].get(key)

                # Already enriched? Skip.
                if isinstance(existing, dict) and existing.get("text") and existing.get("quote") is not None:
                    print(f"  Q{q_id:02d}: SKIP (already enriched)")
                    skipped += 1
                    continue

                q_text   = strip_html(q.get("text", ""))
                options  = list(q.get("options") or [])
                features = global_features if not options else []

                correct_raw = passage["correctAnswers"].get(key, [])
                correct = (
                    list(correct_raw)
                    if isinstance(correct_raw, list)
                    else [correct_raw]
                )

                print(f"  Q{q_id:02d} ({q_type_name}): ", end="", flush=True)

                prompt = build_prompt(
                    passage_text, q_id, q_type_name, q_text,
                    options, features, correct
                )

                try:
                    result = call_gemini_with_retry(prompt)
                    # Gemini occasionally returns an array — take the first item
                    if isinstance(result, list):
                        result = result[0] if result else {}
                    if not isinstance(result, dict) or "text" not in result:
                        raise ValueError(f"Unexpected response shape: {result}")

                    expl_text  = result.get("text", "").strip()
                    expl_quote = result.get("quote", "").strip()

                    passage["explanations"][key] = {
                        "text":  expl_text,
                        "quote": expl_quote,
                    }

                    quote_preview = expl_quote[:70] + "…" if len(expl_quote) > 70 else expl_quote
                    print(f"✓  quote: \"{quote_preview}\"")
                    updated += 1

                except Exception as e:
                    print(f"✗  ERROR: {e}")
                    errors += 1
                    passage["explanations"][key] = {
                        "text":  str(existing) if existing else "",
                        "quote": "",
                    }

                time.sleep(DELAY_SECS)

        # ── Save after each passage so progress is never lost ──
        print(f"  → Saving progress after Passage {pid}…", end=" ", flush=True)
        original_content = save_test_data(TEST_FILE, original_content, data)
        print("saved ✓")

    print(f"\n{'='*60}")
    print(f"All done!  ({updated} updated, {skipped} skipped, {errors} errors)")


if __name__ == "__main__":
    main()
