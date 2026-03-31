import json, re, os

MOCK_FILE = os.path.join(os.path.dirname(__file__), "questions IELTS L", "ielts-listening-test-39.js")
TRANSCRIPTS_FILE = os.path.join(os.path.dirname(__file__), "test39_transcripts.json")

with open(TRANSCRIPTS_FILE, "r", encoding="utf-8") as f:
    transcripts = json.load(f)

with open(MOCK_FILE, "r", encoding="utf-8") as f:
    content = f.read()

sections = ["section_1", "section_2", "section_3", "section_4"]
count = 0

for section in sections:
    text = transcripts.get(section, "")
    if not text:
        print(f"WARNING: No transcript for {section}")
        continue
    
    # Escape for JS string
    escaped = text.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
    
    # Find the Nth empty transcript field and replace it
    # Each section has transcript: ""
    old = 'transcript: ""'
    if old not in content:
        print(f"ERROR: No more empty transcript fields to fill for {section}")
        continue
    
    new = f'transcript: "{escaped}"'
    content = content.replace(old, new, 1)  # Replace only the first occurrence
    count += 1
    print(f"OK: Inserted {section} transcript ({len(text)} chars)")

with open(MOCK_FILE, "w", encoding="utf-8") as f:
    f.write(content)

print(f"\nDone! Inserted {count}/4 transcripts into {MOCK_FILE}")
