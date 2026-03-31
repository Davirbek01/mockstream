with open('questions Articles/article-131.js', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")
for i, line in enumerate(lines):
    q = line.count('"')
    if q >= 4:
        print(f"L{i+1} ({q} quotes): {line.strip()[:150]}")
