import re
import os

BT = chr(96)
directory = r'c:\Users\user\Desktop\Mock Stream\site\questions IELTS R'

def fix_backtick_string(m):
    inner = m.group(1)
    inner = inner.replace('\\', '\\\\')
    inner = inner.replace('"', '\\"')
    inner = inner.replace('\n', '\\n')
    inner = inner.replace('\r', '')
    inner = inner.replace('\t', '\\t')
    return '"' + inner + '"'

for fn in sorted(os.listdir(directory)):
    if not fn.endswith('.js'):
        continue
    path = os.path.join(directory, fn)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    count = content.count(BT)
    if count == 0:
        continue
    fixed = re.sub(BT + r'([^' + BT + r']*)' + BT, fix_backtick_string, content)
    remaining = fixed.count(BT)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(fixed)
    print(f'Fixed {fn}: {count} backticks -> {remaining} remaining')
