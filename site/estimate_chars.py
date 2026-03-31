"""Estimate total characters across all 220 article passages for ElevenLabs TTS."""
import os, re, subprocess, json

ARTICLES_DIR = "questions Articles"

total_chars = 0
article_chars = []

for i in range(1, 221):
    num = str(i).zfill(2) if i <= 99 else str(i)
    path = os.path.join(ARTICLES_DIR, f"article-{num}.js").replace("\\", "/")
    
    result = subprocess.run(
        ['node', '-e', f'global.window = {{}}; require("./{path}"); const d = document = {{createElement: () => ({{set innerHTML(v) {{ this._html = v; }}, get textContent() {{ return this._html ? this._html.replace(/<[^>]+>/g, "") : ""; }}}})}};  const div = document.createElement("div"); div.innerHTML = window.ARTICLE_DATA.passage; console.log(div.textContent.length);'],
        capture_output=True, text=True, timeout=10
    )
    
    if result.returncode == 0:
        chars = int(result.stdout.strip())
        total_chars += chars
        article_chars.append((num, chars))
    else:
        print(f"Error on article {num}: {result.stderr.strip()[-100:]}")

article_chars.sort(key=lambda x: x[1])

print(f"Total articles: {len(article_chars)}")
print(f"Total characters: {total_chars:,}")
print(f"Average per article: {total_chars // len(article_chars):,}")
print(f"Shortest: Article {article_chars[0][0]} ({article_chars[0][1]:,} chars)")
print(f"Longest: Article {article_chars[-1][0]} ({article_chars[-1][1]:,} chars)")

# Show cumulative to see how many we can do with various budgets
print(f"\n--- Cumulative character budget ---")
running = 0
for num, chars in sorted(article_chars, key=lambda x: int(x[0])):
    running += chars

# Show how many articles fit in various budgets
for budget in [10000, 20000, 50000, 100000, 200000, 500000]:
    running = 0
    count = 0
    for num, chars in sorted(article_chars, key=lambda x: int(x[0])):
        if running + chars <= budget:
            running += chars
            count += 1
        else:
            break
    print(f"  {budget:>10,} chars -> {count} articles ({running:,} chars used)")
