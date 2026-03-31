import json
d = json.load(open('c:/Users/user/Desktop/Mock Stream/site/digital-frontier_levels.json','r',encoding='utf-8'))
all_t = []
for k, v in d.items():
    print(f'{k}: {len(v)} cards')
    all_t.extend([c['term'].lower() for c in v])
    max_uz = max(len(c['uz']) for c in v)
    avg_uz = sum(len(c['uz']) for c in v) // len(v)
    print(f'  uz lengths: avg={avg_uz}, max={max_uz}')
    # Show first 5 uz values
    for c in v[:5]:
        print(f'    {c["term"]} -> {c["uz"]}')

from collections import Counter
dups = {t:c for t,c in Counter(all_t).items() if c > 1}
if dups:
    print(f'DUPLICATES: {dups}')
else:
    print('No duplicates!')
print(f'Total unique: {len(set(all_t))}')
