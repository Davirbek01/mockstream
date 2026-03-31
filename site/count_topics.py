import re, os
content = open('landing.html','r',encoding='utf-8').read()
match = re.search(r'const flashcardTopics = \[(.*?)\];', content, re.DOTALL)
block = match.group(1)
seen = set()
topics = []
for line in block.split('\n'):
    m = re.search(r"file: '([^']+)'.*?name: '([^']+)'.*?icon: '([^']+)'", line)
    if m:
        f,n,i = m.groups()
        if f not in seen:
            seen.add(f)
            slug = f.replace('01.js','')
            topics.append((slug,n,i))

print(f'Total unique: {len(topics)}')
done = 0
for s,n,i in topics:
    ok = all(os.path.exists(f'flashcards/{s}-{l}.js') for l in ['intermediate','upper-intermediate','advanced'])
    if ok:
        done += 1
        print(f'  DONE: {n}')
print(f'Done: {done}, Remaining: {len(topics)-done}')
print(f'API calls needed: {(len(topics)-done)*3}')
