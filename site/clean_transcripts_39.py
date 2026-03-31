import json, os, re

MOCK_FILE = os.path.join(os.path.dirname(__file__), "questions IELTS L", "ielts-listening-test-39.js")
TRANSCRIPTS_FILE = os.path.join(os.path.dirname(__file__), "test39_transcripts.json")

with open(TRANSCRIPTS_FILE, "r", encoding="utf-8") as f:
    transcripts = json.load(f)

with open(MOCK_FILE, "r", encoding="utf-8") as f:
    content = f.read()

sections = ["section_1", "section_2", "section_3", "section_4"]

# Find all transcript: "..." fields using regex
pattern = r'transcript: "(?:[^"\\]|\\.)*"'
matches = list(re.finditer(pattern, content))
print(f"Found {len(matches)} transcript fields in the file")

if len(matches) != 4:
    print(f"ERROR: Expected 4 transcript fields, found {len(matches)}")
    exit(1)

new_content = content
offset = 0

for i, section in enumerate(sections):
    text = transcripts.get(section, "")
    if not text:
        print(f"WARNING: No transcript for {section}")
        continue
    
    # Gemini output has literal \n text markers (backslash + n chars)
    # AND real newline characters.
    # Remove the literal \n markers, keep real newlines.
    text = text.replace("\\n", "")
    
    # Now escape for JS string:
    text = text.replace("\\", "\\\\")   # escape any remaining backslashes
    text = text.replace('"', '\\"')      # escape double quotes
    text = text.replace("\n", "\\n")     # convert real newlines to \n escape
    
    # Clean up whitespace artifacts
    text = re.sub(r'\\n +', '\\n', text)   # leading spaces after newline
    text = re.sub(r' +\\n', '\\n', text)   # trailing spaces before newline
    text = re.sub(r'(\\n){3,}', '\\n\\n', text)  # collapse 3+ newlines
    text = re.sub(r'  +', ' ', text)       # collapse double spaces
    text = text.strip()
    if text.startswith('\\n'):
        text = text[2:]
    
    replacement = f'transcript: "{text}"'
    
    m = matches[i]
    start = m.start() + offset
    end = m.end() + offset
    new_content = new_content[:start] + replacement + new_content[end:]
    offset += len(replacement) - (m.end() - m.start())
    
    print(f"OK: Replaced {section} ({len(text)} chars)")

with open(MOCK_FILE, "w", encoding="utf-8") as f:
    f.write(new_content)

print("\nDone! Transcripts cleaned and re-inserted.")
