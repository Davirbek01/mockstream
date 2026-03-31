"""
Fix mock 39 transcripts: re-read from JSON and insert properly as single-line JS strings.
"""
import json, os, re

MOCK_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "questions IELTS L", "ielts-listening-test-39.js")
TRANSCRIPTS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test39_transcripts.json")

# Read original transcripts from JSON
with open(TRANSCRIPTS_FILE, "r", encoding="utf-8") as f:
    transcripts = json.load(f)

# Read the current mock file
with open(MOCK_FILE, "r", encoding="utf-8") as f:
    content = f.read()

# For each section, find the transcript field and replace it
# The transcript fields may span multiple lines now (broken), so use regex
sections = ["section_1", "section_2", "section_3", "section_4"]

for i, section in enumerate(sections):
    text = transcripts[section]
    
    # Clean up: remove literal \n text that Gemini added, keep real newlines as \n escape
    # The Gemini output has "sentence. \\n\nNext sentence" pattern
    # We want: "sentence. \nNext sentence"
    # First remove the literal \n markers Gemini added (they appear as \\n in the raw text)
    text = text.replace("\\n", "")
    
    # Now convert real newlines to \n escape sequences for JS
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    
    # Clean up double spaces and leading spaces on lines
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    text = "\n".join(lines)
    
    # Escape for JS string: backslashes first, then quotes, then newlines
    text = text.replace("\\", "\\\\")
    text = text.replace('"', '\\"')
    text = text.replace("'", "\\'")
    text = text.replace("\n", "\\n")
    
    print(f"{section}: {len(text)} chars (escaped)")

# Now rebuild the file from scratch using the original JSON transcripts
# Strategy: use regex to find each transcript field (possibly multi-line) and replace

# Read file fresh
with open(MOCK_FILE, "r", encoding="utf-8") as f:
    content = f.read()

# Find all transcript fields - they start with 'transcript: "' and end with '",'
# But they might span multiple lines now. Use a pattern that matches across lines.
pattern = r'(transcript: )"((?:[^"\\]|\\.)*)(")'

matches = list(re.finditer(pattern, content, re.DOTALL))
print(f"\nFound {len(matches)} transcript fields")

if len(matches) == 4:
    # Replace from last to first so indices don't shift
    for i in range(3, -1, -1):
        section = sections[i]
        text = transcripts[section]
        
        # Clean the text properly
        text = text.replace("\\n", "")  # Remove Gemini's literal \n markers
        text = text.replace("\r\n", "\n").replace("\r", "\n")
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        text = "\\n".join(lines)
        
        # Escape for JS string
        text = text.replace("\\", "\\\\")  # This would double-escape \\n to \\\\n
        # Undo the double-escape of our intentional \n
        # Actually let's do it differently...
    
    # Let me redo this more carefully
    for i in range(3, -1, -1):
        section = sections[i]
        text = transcripts[section]
        
        # Clean: remove Gemini's literal \n text markers  
        text = text.replace("\\n", "")
        text = text.replace("\r\n", "\n").replace("\r", "\n")
        
        # Split into clean lines
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        
        # Escape each line for JS (handle quotes and backslashes within lines)
        escaped_lines = []
        for line in lines:
            line = line.replace("\\", "\\\\")  # Escape backslashes
            line = line.replace('"', '\\"')      # Escape double quotes
            escaped_lines.append(line)
        
        # Join with \n (the JS escape sequence for newline)
        js_text = "\\n".join(escaped_lines)
        
        m = matches[i]
        content = content[:m.start(2)] + js_text + content[m.end(2):]
        print(f"Replaced {section} transcript")
    
    with open(MOCK_FILE, "w", encoding="utf-8") as f:
        f.write(content)
    print("\nDone! All transcripts fixed.")
else:
    print("ERROR: Expected 4 transcript fields, cannot auto-fix")
    # Try a different approach - look for transcript fields more broadly
    # Check what's actually in the file
    for i, m in enumerate(matches):
        start = max(0, m.start() - 20)
        end = min(len(content), m.end() + 20)
        print(f"  Match {i}: ...{repr(content[start:end])}...")
