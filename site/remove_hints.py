"""Remove (word) hints from the start of questions across all grammar/vocab test files.
e.g. '(leave) She suggests that he ___ early today.' -> 'She suggests that he ___ early today.'
"""
import os, re, glob

SITE = os.path.dirname(os.path.abspath(__file__))
total_fixed = 0
files_fixed = 0

for d in ["questions G", "questions V"]:
    dirpath = os.path.join(SITE, d)
    for f in sorted(glob.glob(os.path.join(dirpath, "*.js"))):
        with open(f, encoding="utf-8") as fh:
            text = fh.read()
        
        # Pattern: question: "(word) rest of question"
        # Remove the (word) and the space after it
        new_text, count = re.subn(
            r'(question:\s*")\([^)]+\)\s+',
            r'\1',
            text
        )
        
        if count > 0:
            with open(f, "w", encoding="utf-8") as fh:
                fh.write(new_text)
            total_fixed += count
            files_fixed += 1
            print(f"  {os.path.basename(f)}: {count} hints removed")

print(f"\nTotal: {total_fixed} hints removed across {files_fixed} files")
