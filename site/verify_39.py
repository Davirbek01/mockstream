import re

f = r'c:\Users\user\Desktop\Mock Stream\site\questions IELTS L\ielts-listening-test-39.js'
content = open(f, 'r', encoding='utf-8').read()

matches = re.findall(r'transcript: "(.{40})', content)
for i, m in enumerate(matches):
    print(f'Section {i+1} starts: {m}...')

lines = content.split('\n')
for i, line in enumerate(lines):
    if 'transcript:' in line and line.strip().startswith('transcript'):
        if line.strip().endswith(',') or line.strip().endswith('"'):
            print(f'  Line {i+1}: OK (single line)')
        else:
            print(f'  Line {i+1}: BROKEN')
