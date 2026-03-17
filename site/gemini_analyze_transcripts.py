"""
Gemini CEFR Listening Transcript Analyzer
==========================================
Sends each part's transcript + questions + answers to Gemini API.
Gemini identifies which transcript lines contain each answer.
Writes an `answerHighlights` property into each part of every test JS file.
"""

import os, re, json, time, sys

try:
    import google.generativeai as genai
except ImportError:
    print("Installing google-generativeai...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "google-generativeai"])
    import google.generativeai as genai

# ── Config ──────────────────────────────────────────────────────────────
API_KEY = "AIzaSyA1y9LU2Iyojc343iQYUjyVM-2jGx1qVV4"
MODEL   = "gemini-2.0-flash"
TESTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "questions CEFR L")

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel(MODEL)

# ── Parse JS test file into Python dict ─────────────────────────────────
def parse_test_file(filepath):
    """Read JS file, extract the JSON-like object, return (raw_text, parsed_parts)."""
    with open(filepath, "r", encoding="utf-8") as f:
        raw = f.read()
    return raw

def extract_parts_info(raw_js):
    """Extract transcript, questions, answers for each part using regex."""
    parts = []
    # Split by partNumber markers
    part_blocks = re.split(r'(?=partNumber\s*:\s*\d)', raw_js)
    
    for block in part_blocks:
        pn_match = re.search(r'partNumber\s*:\s*(\d+)', block)
        if not pn_match:
            continue
        part_num = int(pn_match.group(1))
        
        # Extract type
        type_match = re.search(r'type\s*:\s*["\']([^"\']+)["\']', block)
        part_type = type_match.group(1) if type_match else "unknown"
        
        # Extract transcript
        transcript = ""
        t_match = re.search(r'transcript\s*:\s*"((?:[^"\\]|\\.)*)"|transcript\s*:\s*`((?:[^`\\]|\\.)*)`', block, re.DOTALL)
        if not t_match:
            # Try single quotes
            t_match = re.search(r"transcript\s*:\s*'((?:[^'\\]|\\.)*)'", block, re.DOTALL)
        if t_match:
            transcript = t_match.group(1) or t_match.group(2) or ""
            # Unescape
            transcript = transcript.replace('\\n', '\n').replace("\\'", "'").replace('\\"', '"')
        
        # Extract questionRange
        qr_match = re.search(r'questionRange\s*:\s*["\']([^"\']+)["\']', block)
        question_range = qr_match.group(1) if qr_match else ""
        
        # Extract answers object
        answers = {}
        ans_match = re.search(r'answers\s*:\s*\{([^}]+)\}', block)
        if ans_match:
            ans_text = ans_match.group(1)
            # Parse key-value pairs: number: "letter" or number: ["val1", "val2"]
            for m in re.finditer(r'(\d+)\s*:\s*(?:"([^"]+)"|\'([^\']+)\'|\[([^\]]+)\])', ans_text):
                qid = int(m.group(1))
                if m.group(2):
                    answers[qid] = m.group(2)
                elif m.group(3):
                    answers[qid] = m.group(3)
                elif m.group(4):
                    # Array of values - take first one
                    arr_vals = re.findall(r'["\']([^"\']+)["\']', m.group(4))
                    answers[qid] = arr_vals[0] if arr_vals else ""
        
        # Extract questions text for MCQ types
        questions_info = []
        if part_type in ("mcq-extracts",):
            # Extract question text and options
            for qm in re.finditer(r'id\s*:\s*(\d+)\s*,\s*\n\s*text\s*:\s*["\']([^"\']+)["\']', block):
                qid = int(qm.group(1))
                qtext = qm.group(2)
                # Find options for this question
                questions_info.append({"id": qid, "text": qtext})
        
        # Extract question hints for gap-fill / sentence-completion
        if part_type in ("gap-fill-form", "sentence-completion"):
            for qm in re.finditer(r'id\s*:\s*(\d+)\s*,\s*hint\s*:\s*["\']([^"\']+)["\']', block):
                qid = int(qm.group(1))
                hint = qm.group(2)
                questions_info.append({"id": qid, "hint": hint})
        
        # Extract formContent text for gap-fill-form
        form_texts = []
        if part_type == "gap-fill-form":
            for fm in re.finditer(r'text\s*:\s*["\']([^"\']+)["\']', block):
                form_texts.append(fm.group(1))
        
        # Extract matching speakers options  
        speaker_options = []
        if part_type == "matching-speakers":
            for om in re.finditer(r'letter\s*:\s*["\']([A-H])["\'].*?text\s*:\s*["\']([^"\']+)["\']', block, re.DOTALL):
                speaker_options.append({"letter": om.group(1), "text": om.group(2)})
        
        # Extract map questions (place names)
        map_places = []
        if part_type == "map-labeling":
            for pm in re.finditer(r'place\s*:\s*["\']([^"\']+)["\']', block):
                map_places.append(pm.group(1))
        
        parts.append({
            "partNumber": part_num,
            "type": part_type,
            "questionRange": question_range,
            "transcript": transcript,
            "answers": answers,
            "questions_info": questions_info,
            "form_texts": form_texts,
            "speaker_options": speaker_options,
            "map_places": map_places
        })
    
    return parts


def build_prompt(part):
    """Build a Gemini prompt for a given part."""
    transcript = part["transcript"]
    answers = part["answers"]
    part_type = part["type"]
    
    if not transcript or not answers:
        return None
    
    # Number the lines
    lines = transcript.split('\n')
    numbered_transcript = ""
    for i, line in enumerate(lines):
        numbered_transcript += f"LINE {i}: {line}\n"
    
    # Build answer descriptions
    answer_desc = ""
    for qid, ans in sorted(answers.items()):
        if part_type == "mcq-reply":
            answer_desc += f"  Q{qid}: The correct reply is option '{ans}'. Find the sentence in the transcript that this question's speaker says (Speaker {qid}).\n"
        elif part_type in ("gap-fill-form", "sentence-completion"):
            answer_desc += f"  Q{qid}: The answer is '{ans}'. Find the line(s) in the transcript where this answer word/phrase is spoken or directly implied.\n"
        elif part_type == "matching-speakers":
            # Find the option text
            opt_text = ""
            for opt in part["speaker_options"]:
                if opt["letter"] == ans:
                    opt_text = opt["text"]
                    break
            answer_desc += f"  Q{qid} (Speaker {qid - min(answers.keys()) + 1}): Matched to '{ans}' = '{opt_text}'. Find the key line(s) from this speaker's section that reveal this answer.\n"
        elif part_type == "map-labeling":
            answer_desc += f"  Q{qid}: Answer is map label '{ans}'. Find the line(s) where the location for this question is described.\n"
        elif part_type == "mcq-extracts":
            answer_desc += f"  Q{qid}: Correct answer is option '{ans}'. Find the line(s) that support/contain this answer.\n"
        else:
            answer_desc += f"  Q{qid}: Answer is '{ans}'. Find the line(s) in the transcript containing this answer.\n"
    
    prompt = f"""You are analyzing a CEFR listening test transcript. Each line is numbered.

TRANSCRIPT (with line numbers):
{numbered_transcript}

QUESTION TYPE: {part_type}
QUESTION RANGE: {part["questionRange"]}

ANSWERS AND WHAT TO FIND:
{answer_desc}

TASK: For EACH question, identify the EXACT line number(s) from the transcript where the answer is found or most directly supported. Pick only the most relevant 1-3 lines per answer. Focus on the FIRST occurrence (not the repeated "listen again" section).

IMPORTANT: Return ONLY valid JSON in this exact format, nothing else:
{{
  "highlights": {{
    "<question_id>": [<line_number>, <line_number>],
    "<question_id>": [<line_number>]
  }}
}}

Example:
{{
  "highlights": {{
    "9": [5, 6],
    "10": [8]
  }}
}}

Return ONLY the JSON object. No explanation, no markdown formatting, no code fences."""

    return prompt


def call_gemini(prompt, retries=3):
    """Call Gemini API and parse JSON response."""
    for attempt in range(retries):
        try:
            response = model.generate_content(prompt)
            text = response.text.strip()
            # Remove markdown code fences if present
            text = re.sub(r'^```(?:json)?\s*', '', text)
            text = re.sub(r'\s*```$', '', text)
            text = text.strip()
            result = json.loads(text)
            return result
        except json.JSONDecodeError as e:
            print(f"    JSON parse error (attempt {attempt+1}): {e}")
            print(f"    Raw response: {text[:300]}")
            if attempt < retries - 1:
                time.sleep(2)
        except Exception as e:
            print(f"    API error (attempt {attempt+1}): {e}")
            if attempt < retries - 1:
                time.sleep(3)
    return None


def inject_highlights_into_js(filepath, all_highlights):
    """
    Add answerHighlights to each part in the JS file.
    all_highlights = { partNumber: { "qId": [lineNums] } }
    """
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    for part_num, highlights in sorted(all_highlights.items()):
        if not highlights:
            continue
        
        # Build the answerHighlights JS object string
        hl_entries = []
        for qid, lines in sorted(highlights.items(), key=lambda x: int(x[0])):
            lines_str = ", ".join(str(l) for l in lines)
            hl_entries.append(f"        {qid}: [{lines_str}]")
        hl_block = "answerHighlights: {\n" + ",\n".join(hl_entries) + "\n      }"
        
        # Find the answers block for this part and insert answerHighlights after it
        # Strategy: find the `answers: { ... }` that belongs to this partNumber,
        # and insert answerHighlights right after the closing }
        
        # Find partNumber: N in the content  
        part_pattern = rf'partNumber\s*:\s*{part_num}\b'
        part_match = re.search(part_pattern, content)
        if not part_match:
            print(f"  WARNING: Could not find partNumber {part_num} in file")
            continue
        
        # From this part's start, find the LAST `answers: {` block before the next part
        # Find the end of this part (next partNumber or end of parts array)
        next_part_pattern = rf'partNumber\s*:\s*{part_num + 1}\b'
        next_part_match = re.search(next_part_pattern, content)
        
        if next_part_match:
            part_section = content[part_match.start():next_part_match.start()]
            section_offset = part_match.start()
        else:
            part_section = content[part_match.start():]
            section_offset = part_match.start()
        
        # Find the answers: { ... } block in this section
        # We need to match nested braces properly
        answers_match = None
        for m in re.finditer(r'answers\s*:\s*\{', part_section):
            # Find matching closing brace
            start = m.end()
            depth = 1
            pos = start
            while pos < len(part_section) and depth > 0:
                if part_section[pos] == '{':
                    depth += 1
                elif part_section[pos] == '}':
                    depth -= 1
                pos += 1
            answers_match = (m.start(), pos)  # relative to part_section
        
        if not answers_match:
            print(f"  WARNING: Could not find answers block for part {part_num}")
            continue
        
        # Check if answerHighlights already exists for this part
        if 'answerHighlights' in part_section:
            # Remove existing answerHighlights block
            ahl_match = re.search(r',?\s*answerHighlights\s*:\s*\{', part_section)
            if ahl_match:
                ahl_start = ahl_match.start()
                depth = 0
                pos = ahl_match.end()
                # Find the opening brace
                depth = 1
                while pos < len(part_section) and depth > 0:
                    if part_section[pos] == '{':
                        depth += 1
                    elif part_section[pos] == '}':
                        depth -= 1
                    pos += 1
                # Remove this block from content
                abs_start = section_offset + ahl_start
                abs_end = section_offset + pos
                content = content[:abs_start] + content[abs_end:]
                # Re-find the part section after removal
                part_match = re.search(part_pattern, content)
                if next_part_match:
                    next_part_match = re.search(next_part_pattern, content)
                    part_section = content[part_match.start():next_part_match.start()] if next_part_match else content[part_match.start():]
                else:
                    part_section = content[part_match.start():]
                section_offset = part_match.start()
                # Re-find answers block
                for m in re.finditer(r'answers\s*:\s*\{', part_section):
                    start = m.end()
                    depth = 1
                    pos = start
                    while pos < len(part_section) and depth > 0:
                        if part_section[pos] == '{':
                            depth += 1
                        elif part_section[pos] == '}':
                            depth -= 1
                        pos += 1
                    answers_match = (m.start(), pos)
        
        # Insert answerHighlights after the answers block
        abs_insert_pos = section_offset + answers_match[1]
        insert_text = ",\n      " + hl_block
        content = content[:abs_insert_pos] + insert_text + content[abs_insert_pos:]
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)


def process_test_file(filepath):
    """Process a single test file."""
    filename = os.path.basename(filepath)
    print(f"\n{'='*60}")
    print(f"Processing: {filename}")
    print(f"{'='*60}")
    
    raw_js = parse_test_file(filepath)
    parts = extract_parts_info(raw_js)
    
    if not parts:
        print("  No parts found!")
        return
    
    all_highlights = {}
    
    for part in parts:
        pn = part["partNumber"]
        print(f"\n  Part {pn} ({part['type']}, questions {part['questionRange']})")
        
        if not part["transcript"]:
            print(f"    No transcript - skipping")
            continue
        
        if not part["answers"]:
            print(f"    No answers - skipping")
            continue
        
        prompt = build_prompt(part)
        if not prompt:
            print(f"    Could not build prompt - skipping")
            continue
        
        print(f"    Sending to Gemini ({len(part['transcript'])} chars, {len(part['answers'])} answers)...")
        result = call_gemini(prompt)
        
        if result and "highlights" in result:
            highlights = result["highlights"]
            # Validate: ensure line numbers are within range
            max_line = len(part["transcript"].split('\n')) - 1
            valid_highlights = {}
            for qid, lines in highlights.items():
                # Normalize key: "Q1" -> "1", "1" -> "1"
                clean_qid = re.sub(r'\D', '', str(qid))
                if not clean_qid:
                    continue
                valid_lines = [l for l in lines if isinstance(l, int) and 0 <= l <= max_line]
                if valid_lines:
                    valid_highlights[clean_qid] = valid_lines
            
            all_highlights[pn] = valid_highlights
            print(f"    ✓ Got highlights for {len(valid_highlights)} questions")
            for qid, lines in sorted(valid_highlights.items(), key=lambda x: int(x[0])):
                print(f"      Q{qid} → lines {lines}")
        else:
            print(f"    ✗ Failed to get highlights")
        
        # Rate limiting
        time.sleep(1)
    
    if all_highlights:
        print(f"\n  Writing highlights to {filename}...")
        inject_highlights_into_js(filepath, all_highlights)
        print(f"  ✓ Done!")
    else:
        print(f"\n  No highlights to write.")


def main():
    """Process all CEFR listening test files."""
    print("CEFR Listening Transcript Analyzer")
    print("=" * 60)
    print(f"Tests directory: {TESTS_DIR}")
    
    if not os.path.isdir(TESTS_DIR):
        print(f"ERROR: Directory not found: {TESTS_DIR}")
        return
    
    files = sorted([
        f for f in os.listdir(TESTS_DIR)
        if f.startswith("cefr-listening-test-") and f.endswith(".js")
    ])
    
    print(f"Found {len(files)} test files\n")
    
    for filename in files:
        filepath = os.path.join(TESTS_DIR, filename)
        process_test_file(filepath)
        time.sleep(1)  # Between files
    
    print("\n" + "=" * 60)
    print("ALL DONE!")
    print("=" * 60)


if __name__ == "__main__":
    main()
