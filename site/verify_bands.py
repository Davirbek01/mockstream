import re, json
c = open(r'c:\Users\user\Desktop\Mock Stream\site\questions IELTS W\ielts-mock-01.js','r',encoding='utf-8').read()
m = re.search(r'window\.IELTS_WRITING_TEST_DATA\s*=\s*(\{.*\})\s*;?\s*$', c, re.DOTALL)
d = json.loads(m.group(1))
for tk in ['task1','task2']:
    t = d['tasks'][tk]
    print(f'\n{tk.upper()}:')
    for b in [5,6,7,8,9]:
        en = t.get(f'sampleBand{b}','')
        uz = t.get(f'uzSampleBand{b}','')
        words_en = len(re.sub(r'<[^>]+>','',en).split()) if en else 0
        marks = len(re.findall(r'<mark>',en)) if en else 0
        has_uz = 'YES' if uz else 'NO'
        print(f'  Band {b}: {words_en} EN words, {marks} highlights, UZ={has_uz}')
tokens = d.get('tokenTranslations',{})
print(f'\nToken translations: {len(tokens)}')
print('Sample:', list(tokens.keys())[:5])
