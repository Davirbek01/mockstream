"""Scan for (word) hints at start of questions across all grammar/vocab test files."""
import os, re, glob

SITE = os.path.dirname(os.path.abspath(__file__))
count = 0
files_with = {}

for d in ["questions G", "questions V"]:
    dirpath = os.path.join(SITE, d)
    for f in glob.glob(os.path.join(dirpath, "*.js")):
        with open(f, encoding="utf-8") as fh:
            text = fh.read()
        matches = re.findall(r'question:\s*"(\([^)]+\))\s', text)
        if matches:
            fname = os.path.basename(f)
            files_with[fname] = len(matches)
            count += len(matches)

print(f"Total questions with (word) hints: {count}")
print(f"Files affected: {len(files_with)}")
print()
for fname, c in sorted(files_with.items()):
    print(f"  {fname}: {c}")
