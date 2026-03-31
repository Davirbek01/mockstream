"""Fix unescaped double quotes inside double-quoted JS string values in article files.
Pattern: exampleUzbek: ""SomeWord" ..." -> exampleUzbek: "\u201CSomeWord\u201D ..."
Also handles definition, example, uzbek fields.
"""
import os, re

ARTICLES_DIR = "questions Articles"
broken = [80, 82, 107, 115, 118, 138, 139, 143, 176]

def fix_article(num):
    path = os.path.join(ARTICLES_DIR, f"article-{num}.js")
    with open(path, encoding='utf-8') as f:
        content = f.read()
    
    original = content
    lines = content.split('\n')
    fixed_lines = []
    fixes = 0
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        # Look for property lines like:   key: "value"
        # where value contains unescaped inner double quotes
        match = re.match(r'^(\s+\w+:\s*)"(.+)"(,?)$', line)
        if match:
            prefix = match.group(1)  # indentation + key: 
            value = match.group(2)   # content between outer quotes
            suffix = match.group(3)  # trailing comma
            
            # Check if content has unescaped inner double quotes
            if '"' in value:
                # Replace inner double quotes with Unicode curly quotes
                # But we need to be careful: the value might have \" which are already escaped
                new_value = value.replace('"', '\u201C', 1)  # first inner quote -> left curly
                # Find each pair
                new_value_chars = list(new_value)
                in_quote = '\u201C' in new_value
                result = []
                open_quote = False
                for ch in new_value:
                    if ch == '\u201C':
                        result.append(ch)
                        open_quote = True
                    elif ch == '"' and open_quote:
                        result.append('\u201D')
                        open_quote = False
                    elif ch == '"' and not open_quote:
                        result.append('\u201C')
                        open_quote = True
                    else:
                        result.append(ch)
                new_value = ''.join(result)
                
                if new_value != value:
                    line = f'{prefix}"{new_value}"{suffix}'
                    fixes += 1
                    print(f"  Fixed line {i+1}: ...{stripped[:80]}...")
        
        fixed_lines.append(line)
    
    if fixes > 0:
        with open(path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(fixed_lines))
        print(f"  -> {fixes} fix(es) applied")
    else:
        print(f"  -> No simple quote fixes found, manual check needed")
    
    return fixes

total_fixes = 0
for num in broken:
    num_str = str(num).zfill(2) if num <= 9 else str(num).zfill(2) if num <= 99 else str(num)
    print(f"\nArticle {num_str}:")
    total_fixes += fix_article(num_str)

print(f"\nTotal fixes: {total_fixes}")
