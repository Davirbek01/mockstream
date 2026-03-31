"""Rebuild articles_index.json from all article JS files."""
import os, re, json

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ARTICLES_DIR = os.path.join(SCRIPT_DIR, "questions Articles")

articles = []
for i in range(1, 221):
    key = str(i).zfill(2) if i < 100 else str(i)
    path = os.path.join(ARTICLES_DIR, f"article-{key}.js")
    if not os.path.exists(path):
        print(f"MISSING: article-{key}.js")
        continue
    
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Extract title - match based on the opening quote type
    m = re.search(r'title:\s*"(.*?)"', content)
    if not m:
        m = re.search(r"title:\s*'(.*?)'", content)
    if not m:
        m = re.search(r"title:\s*`(.*?)`", content)
    title = m.group(1) if m else "UNKNOWN"
    
    # Count vocab words
    vc = len(re.findall(r"word:", content))
    
    articles.append({"num": key, "title": title, "vocab": vc})

print(f"Found {len(articles)} articles")
print(f"First: {articles[0]}")
print(f"Last: {articles[-1]}")

# Check article 71
a71 = [a for a in articles if a["num"] == "71"]
print(f"Article 71: {a71}")

# Save
out_path = os.path.join(SCRIPT_DIR, "articles_index.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(articles, f, indent=2, ensure_ascii=False)
print(f"Saved to {out_path}")
