import json, re

# Read transcripts
with open("test38_transcripts.json", "r", encoding="utf-8") as f:
    transcripts = json.load(f)

# Read the mock file
with open("questions IELTS L/ielts-listening-test-38.js", "r", encoding="utf-8") as f:
    content = f.read()

# Clean up transcripts: normalize \\n literals to actual newlines, then join as single line for JS
for key in transcripts:
    t = transcripts[key]
    # Replace literal \\n with actual newlines
    t = t.replace("\\n", "\n")
    # Collapse multiple newlines
    t = re.sub(r'\n{2,}', '\n', t)
    # Strip and normalize
    t = t.strip()
    # Escape for JS string: backslashes, then quotes
    t = t.replace("\\", "\\\\")
    t = t.replace('"', '\\"')
    # Replace newlines with \n for JS
    t = t.replace("\n", "\\n")
    transcripts[key] = t

# Replace empty transcript fields
sections = ["section_1", "section_2", "section_3", "section_4"]
for i, key in enumerate(sections):
    # Find the i-th occurrence of transcript: ""
    old = 'transcript: ""'
    idx = content.find(old)
    if idx == -1:
        print(f"ERROR: Could not find empty transcript for {key}")
        continue
    new = f'transcript: "{transcripts[key]}"'
    content = content[:idx] + new + content[idx+len(old):]
    print(f"Inserted {key}: {len(transcripts[key])} chars")

with open("questions IELTS L/ielts-listening-test-38.js", "w", encoding="utf-8") as f:
    f.write(content)

print("Done! Transcripts inserted.")
