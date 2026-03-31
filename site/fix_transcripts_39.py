import os

f = os.path.join(os.path.dirname(__file__), "questions IELTS L", "ielts-listening-test-39.js")

with open(f, "r", encoding="utf-8") as fh:
    content = fh.read()

# The file contains the two-char sequence: backslash + n
# In Python, that's the string '\\n' when read from file
target = "\\" + "n"  # This is literally: \n (2 chars)
replacement = "\n"    # This is a real newline (1 char)

count = content.count(target)
print(f"Found {count} occurrences of literal backslash-n")

# But we only want to fix those INSIDE transcript strings, not the \n in JS code
# Actually in JS strings: \n means newline. \\n means literal \n text.
# The file currently has \\n which JS interprets as literal \n text.
# We want \n which JS interprets as newline character.
# So actually we need to find \\n (two chars in file: \ and n) that are EXTRA
# and shouldn't be there.

# Let me check: inside transcript: "..." strings, 
# the file has sequences like: Part one. \\n\nYou will hear
# That means: Part one. [literal \n][newline]You will hear
# The \\n renders as visible \n, the \n is a real newline
# We need to remove the \\n and keep just the \n

# Actually looking at the raw repr: 'Part one. \\nYou will hear'
# In the file that's: Part one. \nYou will hear
# Where \n is TWO characters (backslash + n) in the actual file
# But JS will interpret \n as a newline - that's CORRECT!
# Wait... let me re-read the screenshot. The user sees literal "\n" text.

# Looking at read_file output: transcript: "Narrator: Part one. \\n\n
# In the RAW file, that's: \n followed by actual newline
# In JS: \\n = literal \n display, \n = newline
# So YES, the \\n in the file (which is backslash-backslash-n) shows as \n

# Actually from repr: 'Part one. \\nYou will hear'
# repr shows \\n which means the actual file bytes are: \ n (two characters)
# In JS string context, \n = newline. That's fine.
# But the user sees \n as text... 

# Wait - the repr showed: 'Part one. \\n'
# In Python repr, \\n means the string contains backslash followed by n 
# In the actual file: Part one. \n (where \ and n are two chars)
# In a JS string "Part one. \n" - the \n IS a newline escape. 
# That should render as a newline, NOT as literal \n text.

# Unless the rendering code is using textContent or something that doesn't 
# process \n... But we can see from the screenshot it DOES show line breaks
# between sentences, so \n IS being rendered.

# The issue is there are EXTRA \n at end of sentences that show as TEXT.
# Let me look more carefully at repr:
# 'Part one. \\nYou will hear...'
# This means file has: Part one. \nYou will hear
# \n here is the newline escape. JS renders this as newline.
# But user sees: "Part one. \n" with \n visible as text.

# OH WAIT. Maybe the file has actual literal characters \ and n followed by nothing.
# And there's NO actual newline after it in some places.
# Let me see: the read_file showed:
# "Narrator: Part one. \\n\nYou will hear"
# That means in the file: \\ n \n  
# \\  = literal backslash
# n  = letter n  
# \n = newline
# So JS sees: \n (literal) followed by newline
# Display: shows \n as text then line break

# So the fix is: replace \\ + n with just \n (keeping the actual newline that follows most of them)

# In the raw file bytes, we have: backslash backslash n
# We need: backslash n

raw = open(f, "rb").read()
# Count occurrences of the byte sequence: 0x5C 0x5C 0x6E (\\n in file)
seq = b"\\\\n"
bc = raw.count(seq)
print(f"Found {bc} byte sequences of double-backslash-n")

# Also check for just backslash-n: 0x5C 0x6E
seq2 = b"\\n" 
bc2 = raw.count(seq2)
print(f"Found {bc2} byte sequences of backslash-n (includes the double ones)")

# Show a small sample
idx = raw.find(b"Part one")
sample = raw[idx:idx+100]
print(f"Sample bytes: {sample}")
