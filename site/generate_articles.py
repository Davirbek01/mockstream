"""
Generate reading articles using Gemini API.
Each article: 900-1200 word passage, 18-25 highlighted vocabulary words,
full Uzbek translation, vocabulary entries.
"""

import os
import json
import re
import time
import google.generativeai as genai

GEMINI_API_KEY = "AIzaSyA7fuFZpM3RsmkbO9gaSWDI0IzsEp6Uqf4"
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(
    "gemini-2.0-flash",
    generation_config={"response_mime_type": "application/json"}
)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "questions Articles")

# Articles to generate in this batch
ARTICLES = [
    (211, "The Collapse of Insect Populations and Its Threat to Food Security"),
]

needs_regen = True


def escape_js_string(s):
    """Escape backticks and backslashes for JS template literals."""
    if s is None:
        return ""
    return s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")


def check_duplicate(title):
    """Check if an article with a similar title already exists."""
    title_lower = title.lower().strip()
    # Extract key words (3+ chars) for fuzzy match
    key_words = [w for w in re.findall(r'[a-z]+', title_lower) if len(w) >= 4]
    
    for fname in os.listdir(OUTPUT_DIR):
        if not fname.endswith('.js'):
            continue
        fpath = os.path.join(OUTPUT_DIR, fname)
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                first_lines = f.read(500)
            # Extract existing title
            m = re.search(r'title:\s*["\'](.+?)["\']', first_lines)
            if not m:
                m = re.search(r'title:\s*"(.+?)"', first_lines)
            if m:
                existing_title = m.group(1).lower().strip()
                # Exact match
                if existing_title == title_lower:
                    return True
                # Check if 60%+ of key words overlap
                existing_words = set(re.findall(r'[a-z]+', existing_title))
                if key_words:
                    overlap = sum(1 for w in key_words if w in existing_words)
                    if overlap / len(key_words) >= 0.6:
                        return True
        except Exception:
            continue
    return False


def generate_article(num, title):
    """Generate a single article via Gemini API."""
    
    prompt = f"""Generate an original English reading article for IELTS/CEFR vocabulary practice.

TOPIC: "{title}"

REQUIREMENTS:
1. PASSAGE: Write an original article of 900-1200 words at B2-C1 level. 
   - 6-8 paragraphs wrapped in <p> tags
   - Highlight 18-25 important/useful vocabulary words or phrases by wrapping them in <strong> tags
   - The highlighted words should be useful academic/professional vocabulary chunks
   - Write in a formal, journalistic style similar to The Economist, New Scientist, or National Geographic
   - Cover the topic thoroughly with examples, statistics (can be illustrative), and analysis

2. TRANSLATION: Provide a complete Uzbek translation of the passage.
   - Same number of paragraphs, each wrapped in <p> tags
   - Accurate, natural Uzbek (Latin script)

3. VOCABULARY: For EACH highlighted word/phrase, provide:
   - definition: A clear English definition (1 sentence)
   - uzbek: Uzbek translation of the word
   - example: An example sentence using the word (different from the passage)
   - exampleUzbek: Uzbek translation of the example sentence

OUTPUT FORMAT - Return ONLY valid JSON (no markdown, no code blocks):
{{
  "title": "{title}",
  "passage": "<p>...text with <strong>word</strong>...</p>\\n\\n<p>...</p>",
  "translation": "<p>...uzbek text...</p>\\n\\n<p>...</p>",
  "vocabulary": {{
    "word1": {{
      "definition": "...",
      "uzbek": "...",
      "example": "...",
      "exampleUzbek": "..."
    }},
    "word2": {{ ... }}
  }}
}}

IMPORTANT:
- You MUST include exactly 20-25 vocabulary entries
- Every <strong>word</strong> in the passage MUST have a matching entry in vocabulary
- The vocabulary keys must exactly match what's between <strong> tags (case-sensitive, lowercase preferred)
- Do NOT use backticks or template literals in the output
- Passage must be 900-1200 words (excluding HTML tags)
- Use double quotes for all JSON strings
- Escape any quotes inside strings with backslash
- Do NOT include literal newlines inside JSON string values. Use \\n for newlines within passage and translation strings.
"""

    for attempt in range(5):
        try:
            response = model.generate_content(prompt)
            text = response.text.strip()
            
            # Clean up markdown code blocks if present
            if text.startswith("```"):
                text = re.sub(r'^```(?:json)?\s*\n?', '', text)
                text = re.sub(r'\n?```\s*$', '', text)
            
            data = json.loads(text)
            
            # Convert markdown bold (**text**) to <strong>text</strong>
            if "passage" in data:
                data["passage"] = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', data["passage"])
            if "translation" in data:
                data["translation"] = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', data["translation"])
            
            # Validate
            if not data.get("passage") or not data.get("translation") or not data.get("vocabulary"):
                print(f"  [!] Missing fields, retrying...")
                continue
            
            # Count strong tags
            strong_count = len(re.findall(r'<strong>', data["passage"]))
            vocab_count = len(data["vocabulary"])
            
            # Count words in passage (strip HTML)
            plain = re.sub(r'<[^>]+>', '', data["passage"])
            word_count = len(plain.split())
            
            print(f"  Passage: {word_count} words, {strong_count} highlights, {vocab_count} vocab entries")
            
            if word_count < 600:
                print(f"  [!] Too short ({word_count} words), retrying...")
                continue
            
            if vocab_count < 15:
                print(f"  [!] Too few vocab entries ({vocab_count}), retrying...")
                continue
                
            return data
            
        except json.JSONDecodeError as e:
            print(f"  [!] JSON parse error: {e}, retrying...")
            time.sleep(2)
        except Exception as e:
            print(f"  [!] Error: {e}, retrying...")
            time.sleep(3)
    
    return None


def write_article_js(num, data):
    """Write article data to JS file."""
    padded = str(num).zfill(2)
    filepath = os.path.join(OUTPUT_DIR, f"article-{padded}.js")
    
    passage = escape_js_string(data["passage"])
    translation = escape_js_string(data["translation"])
    title = data["title"].replace("'", "\\'").replace('"', '\\"')
    
    vocab_entries = []
    for word, info in data["vocabulary"].items():
        safe_word = word.replace('"', '\\"')
        defn = escape_js_string(info.get("definition", ""))
        uzb = escape_js_string(info.get("uzbek", ""))
        ex = escape_js_string(info.get("example", ""))
        exUzb = escape_js_string(info.get("exampleUzbek", ""))
        
        vocab_entries.append(f'''        "{safe_word}": {{
            definition: "{defn}",
            uzbek: "{uzb}",
            example: "{ex}",
            exampleUzbek: "{exUzb}"
        }}''')
    
    vocab_block = ",\n".join(vocab_entries)
    
    js_content = f'''window.ARTICLE_DATA = {{
    title: "{title}",
    passage: `{passage}`,
    translation: `{translation}`,
    vocabulary: {{
{vocab_block}
    }}
}};
'''
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    return filepath


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print(f"=== Generating {len(ARTICLES)} articles ===\n")
    
    generated = []
    
    for num, title in ARTICLES:
        padded = str(num).zfill(2)
        filepath = os.path.join(OUTPUT_DIR, f"article-{padded}.js")
        
        # Check if file already exists (skip unless it needs regeneration)
        needs_regen = False
        if os.path.exists(filepath):
            # Quick quality check — does it have enough vocab?
            with open(filepath, 'r', encoding='utf-8') as f:
                existing = f.read()
            existing_vocab = len(re.findall(r'definition:', existing))
            existing_strong = len(re.findall(r'<strong>', existing))
            if existing_vocab >= 15 and existing_strong >= 15:
                print(f"[SKIP] article-{padded}.js already exists ({existing_vocab} vocab, {existing_strong} highlights)")
                continue
            else:
                print(f"[REGEN] article-{padded}.js has only {existing_vocab} vocab/{existing_strong} highlights, regenerating...")
                needs_regen = True
        
        # Duplicate check (skip if we're regenerating a low-quality file)
        if not needs_regen and check_duplicate(title):
            print(f"[DUP] '{title}' — similar article already exists, skipping")
            continue
        
        print(f"[{num}] Generating: {title}")
        data = generate_article(num, title)
        
        if data:
            path = write_article_js(num, data)
            vocab_count = len(data.get("vocabulary", {}))
            generated.append((num, title, vocab_count))
            print(f"  ✓ Saved: {os.path.basename(path)} ({vocab_count} vocab words)\n")
        else:
            print(f"  ✗ FAILED after retries\n")
        
        time.sleep(2)  # Rate limit
    
    print(f"\n=== DONE: {len(generated)}/{len(ARTICLES)} articles generated ===")
    for num, title, vc in generated:
        print(f"  article-{str(num).zfill(2)}.js — {title} ({vc} words)")


if __name__ == "__main__":
    main()
