"""
Extract highlighted tokens from CEFR Writing sample answers and translate to Uzbek.
Adds a tokenTranslations map: { "english phrase": { "uz": "uzbek", "type": "colloc|..." } }
"""

import json
import re
import time
import sys
import requests
from html.parser import HTMLParser

API_KEY = "AIzaSyCfnYXgCySMlckKOdJw6vzRDlBVvJvZrZo"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"


def call_gemini(prompt, retries=3):
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 4096}
    }
    for attempt in range(retries):
        try:
            resp = requests.post(GEMINI_URL, json=payload, timeout=60)
            resp.raise_for_status()
            data = resp.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return text.strip()
        except Exception as e:
            print(f"  ⚠ Attempt {attempt+1} failed: {e}")
            if attempt < retries - 1:
                time.sleep(2 ** (attempt + 1))
    return None


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
                    if cls not in ("ml-token",):
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


def translate_tokens_batch(tokens_with_context):
    lines = []
    for i, (token_type, token_text, task_prompt) in enumerate(tokens_with_context):
        lines.append(f"{i+1}. [{token_type}] \"{token_text}\" (from answer to: \"{task_prompt}\")")

    token_list = "\n".join(lines)

    prompt = f"""You are an expert English-to-Uzbek translator specializing in linguistics and phraseology.

Translate each English word/phrase below into Uzbek. Follow these rules strictly:

RULES BY TYPE:
- **adv** (adverbials like "Honestly", "Moreover", "Certainly"): Give the direct Uzbek equivalent adverb/connector.
- **colloc** (collocations like "quite an extensive collection", "high-street stores"): Give the natural Uzbek collocation equivalent.
- **phrasal** (phrasal verbs like "pick up", "make it a point"): Give the Uzbek verb equivalent that carries the same meaning.
- **idiom** (idioms like "let my hair down", "escape the hustle and bustle"): Find the Uzbek EQUIVALENT idiom or expression. Do NOT translate word-for-word.
- **proverb** (proverbs): Find the closest Uzbek EQUIVALENT proverb/maqol.
- **modal** (modal verbs/expressions like "believe", "could", "might consider"): Give the direct Uzbek equivalent.

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
        print(f"  ❌ JSON parse error: {e}")
        print(f"  Raw response: {result[:500]}")
        return None


def process_file(filepath):
    print(f"\n📂 Processing: {filepath}")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    match = re.search(r'window\.WRITING_TEST_DATA\s*=\s*(\{.*\})\s*;?\s*$', content, re.DOTALL)
    if not match:
        print("❌ Could not parse WRITING_TEST_DATA")
        return False

    data = json.loads(match.group(1))
    tasks = data.get("tasks", {})

    task_keys = ["t11", "t12", "t2"]
    sample_keys = ["sample", "sampleA1", "sampleA2", "sampleB1", "sampleB2"]

    all_tokens = []
    seen = set()

    for tk in task_keys:
        task = tasks.get(tk)
        if not task:
            continue
        for sk in sample_keys:
            if sk not in task or not task[sk]:
                continue
            tokens = extract_tokens(task[sk])
            for ttype, ttext in tokens:
                key = ttext.lower().strip('"').strip()
                if key not in seen:
                    seen.add(key)
                    all_tokens.append((ttype, ttext, task.get("prompt", "")))

    print(f"   Found {len(all_tokens)} unique tokens across {len(task_keys)} tasks")
    for t in all_tokens:
        print(f"      [{t[0]}] {t[1]}")

    batch_size = 25
    all_translations = {}

    for i in range(0, len(all_tokens), batch_size):
        batch = all_tokens[i:i+batch_size]
        print(f"\n   🌐 Translating batch {i//batch_size + 1} ({len(batch)} tokens)...", flush=True)

        result = translate_tokens_batch(batch)
        if result:
            for item in result:
                en = item.get("en", "").strip()
                uz = item.get("uz", "").strip()
                ttype = item.get("type", "")
                if en and uz:
                    all_translations[en] = {"uz": uz, "type": ttype}
            print(f"      ✅ Got {len(result)} translations")
        else:
            print(f"      ❌ Batch failed")

        time.sleep(2)

    print(f"\n   📝 Total translations: {len(all_translations)}")
    for en, val in all_translations.items():
        print(f"      [{val['type']}] \"{en}\" → \"{val['uz']}\"")

    data["tokenTranslations"] = all_translations

    prefix = content[:match.start()]
    new_json = json.dumps(data, ensure_ascii=False, indent=2)
    new_content = prefix + "window.WRITING_TEST_DATA = " + new_json + ";"

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"\n   ✅ Saved tokenTranslations to {filepath}")
    return True


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "questions W/writing-questions.js"
    process_file(target)
