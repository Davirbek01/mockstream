import json, requests

API_KEY = 'AIzaSyA_5cnPFwirsJC9K5Clsc9ka3wCbqHkTNE'
URL = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}'

with open('site/questions CEFR R/cefr-reading-test-17.js', 'r', encoding='utf-8') as f:
    content = f.read()

prompt = """You are generating explanations for a CEFR Reading test. I will give you the full test JSON.
For EVERY question (q1-q35), generate an explanation object with:
- "text": A clear, concise explanation of why the answer is correct (2-3 sentences max)
- "quote": The most relevant direct quote from the passage that supports the answer

Return ONLY a valid JSON object with keys q1 through q35, each having "text" and "quote" fields.

For Part 1 (gap-fill, q1-q7): Explain which word from the text fills the gap and why.
For Part 2 (matching people to courses, q8-q14): Explain why the course matches the person.
For Part 3 (matching-headings, q15-q20): Explain why each heading matches its paragraph.
For Part 4 (TFNI q21-q26, MCQ q27-q29): Explain the correct answer choice.
For Part 5 (gap-fill q30-q35): Explain the correct answer.

Here are the answers:
Part 1: 1=ATTRACTIONS, 2=OFFERS, 3=CASTLE, 4=LANE, 5=VIEWS, 6=FREE, 7=FERRY
Part 2: 8=D, 9=E, 10=C, 11=H, 12=B, 13=A, 14=G
Part 3: 15(A)=VII, 16(B)=VI, 17(C)=IV, 18(D)=I, 19(E)=VIII, 20(F)=III
Part 4: 21=True, 22=False, 23=False, 24=Not Given, 25=True, 26=Not Given, 27=D, 28=B, 29=C
Part 5: 30=WOOD, 31=HOSPITALITY, 32=STATUS AND WEALTH, 33=EXPENSIVE COMMODITY, 34=CLASSICAL, 35=FURNITURE AND TEXTILES

Here is the test:
""" + content

headers = {'Content-Type': 'application/json'}
data = {
    'contents': [{'parts': [{'text': prompt}]}],
    'generationConfig': {
        'temperature': 0.3,
        'maxOutputTokens': 8192,
        'responseMimeType': 'application/json'
    }
}

resp = requests.post(URL, headers=headers, json=data, timeout=120)
resp.raise_for_status()
result = resp.json()

text = result['candidates'][0]['content']['parts'][0]['text']
explanations = json.loads(text)

# Inject into the test file
js_data = content.replace('window.CEFR_READING_TEST = ', '', 1).rstrip().rstrip(';')
test = json.loads(js_data)

part_ranges = [(1, 8), (8, 15), (15, 21), (21, 30), (30, 36)]
for idx, (start, end) in enumerate(part_ranges):
    part_expl = {}
    for i in range(start, end):
        key = f'q{i}'
        if key in explanations:
            part_expl[key] = explanations[key]
    test['parts'][idx]['explanations'] = part_expl

output = 'window.CEFR_READING_TEST = ' + json.dumps(test, indent=4, ensure_ascii=False) + ';'
with open('site/questions CEFR R/cefr-reading-test-17.js', 'w', encoding='utf-8') as f:
    f.write(output)

print('Done! Keys:', sorted(explanations.keys(), key=lambda x: int(x[1:])))
for idx, p in enumerate(test['parts']):
    print(f'Part {idx+1}: {len(p.get("explanations", {}))} explanations')
