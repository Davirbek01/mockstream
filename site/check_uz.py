import json
d = json.load(open('c:/Users/user/Desktop/Mock Stream/site/digital-frontier_levels.json','r',encoding='utf-8'))
for lvl, cards in d.items():
    print(f'\n=== {lvl} ({len(cards)} cards) ===')
    for c in cards:
        uz = c['uz']
        marker = ' ***' if '(' in uz else ''
        print(f"  {c['term']:35s} -> {uz}{marker}")
