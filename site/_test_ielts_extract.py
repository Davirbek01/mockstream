import generate_speaking_audio as g
qs = g.extract_questions_from_js('questions IELTS S/ielts-speaking-mock-1.js', 'ielts')
print(f'Found {len(qs)} questions')
for q in qs:
    print(f"  Q{q['number']} ({q['part']}): {q['speak_text'][:100]}...")
