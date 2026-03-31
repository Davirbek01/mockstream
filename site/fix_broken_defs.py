"""Scan and fix all broken def fields with inner double quotes."""
import os, glob, re

SITE = os.path.dirname(os.path.abspath(__file__))
count = 0
fixed = 0

for d in ['questions G', 'questions V']:
    dirpath = os.path.join(SITE, d)
    for fp in sorted(glob.glob(os.path.join(dirpath, '*.js'))):
        with open(fp, 'r', encoding='utf-8') as f:
            text = f.read()
        
        # Pattern: def: ""Word" ... rest ..."  (inner straight double quotes)
        # The broken pattern is def: "" followed by a word char
        if 'def: ""' not in text:
            continue
        
        original = text
        fname = os.path.basename(fp)
        
        # Find and fix each occurrence
        # Replace inner double quotes in def field with single quotes
        def fix_def(m):
            global count, fixed
            count += 1
            inner = m.group(1)
            # Replace all double quotes with single quotes
            fixed_inner = inner.replace('"', "'")
            fixed += 1
            return f'def: "{fixed_inner}"'
        
        # Match def: "..." but handle the broken nested quotes
        # Strategy: find def: " and then everything up to ", level:
        text = re.sub(
            r'def: "(""[^,]*?)",?\s*level:',
            lambda m: f'def: "{m.group(1).replace(chr(34), chr(39))}", level:',
            text
        )
        
        if text != original:
            with open(fp, 'w', encoding='utf-8') as f:
                f.write(text)
            print(f"  Fixed: {fname}")

print(f"\nDone. Found and fixed additional broken defs.")
