"""Health check all 220 article JS files for syntax errors, missing fields, etc."""
import os, subprocess, json

ARTICLES_DIR = "questions Articles"
TOTAL = 220
errors = []
warnings = []

for i in range(1, TOTAL + 1):
    num = str(i).zfill(2) if i < 100 else str(i)
    # Actually the files use the same format as AVAILABLE_ARTICLES: '01'..'220'
    num = str(i).zfill(2) if i <= 9 else str(i).zfill(2) if i <= 99 else str(i)
    path = os.path.join(ARTICLES_DIR, f"article-{num}.js")
    
    # Check file exists
    if not os.path.exists(path):
        errors.append(f"Article {num}: FILE MISSING ({path})")
        continue
    
    # Check file size
    size = os.path.getsize(path)
    if size < 100:
        errors.append(f"Article {num}: FILE TOO SMALL ({size} bytes)")
        continue
    
    # Check JS syntax via Node
    result = subprocess.run(
        ['node', '-e', f'global.window = {{}}; require("./{path.replace(chr(92), "/")}"); const d = window.ARTICLE_DATA; if (!d) throw new Error("No ARTICLE_DATA"); if (!d.title) throw new Error("No title"); if (!d.passage) throw new Error("No passage"); if (!d.vocabulary) throw new Error("No vocabulary"); if (!d.translation) throw new Error("No translation"); console.log(JSON.stringify({{title: d.title, vocabCount: Object.keys(d.vocabulary).length, passageLen: d.passage.length, transLen: d.translation.length}}));'],
        capture_output=True, text=True, timeout=10
    )
    
    if result.returncode != 0:
        errors.append(f"Article {num}: JS ERROR - {result.stderr.strip().split(chr(10))[-1]}")
        continue
    
    try:
        info = json.loads(result.stdout.strip())
        if info['vocabCount'] < 3:
            warnings.append(f"Article {num}: Only {info['vocabCount']} vocab words")
        if info['passageLen'] < 200:
            warnings.append(f"Article {num}: Very short passage ({info['passageLen']} chars)")
        if info['transLen'] < 100:
            warnings.append(f"Article {num}: Very short translation ({info['transLen']} chars)")
    except json.JSONDecodeError:
        errors.append(f"Article {num}: Could not parse output: {result.stdout.strip()[:100]}")

# Check images
img_missing = 0
for i in range(1, TOTAL + 1):
    num = str(i).zfill(2) if i <= 9 else str(i).zfill(2) if i <= 99 else str(i)
    img_path = os.path.join(ARTICLES_DIR, f"article-{num}.png")
    if not os.path.exists(img_path):
        img_missing += 1

print(f"\n=== ARTICLE HEALTH CHECK RESULTS ===")
print(f"Total articles checked: {TOTAL}")
print(f"Errors: {len(errors)}")
print(f"Warnings: {len(warnings)}")
print(f"Images missing: {img_missing}/{TOTAL}")

if errors:
    print(f"\n--- ERRORS ---")
    for e in errors:
        print(f"  ❌ {e}")

if warnings:
    print(f"\n--- WARNINGS ---")
    for w in warnings:
        print(f"  ⚠️  {w}")

if not errors and not warnings:
    print("\n✅ All articles passed health check!")
