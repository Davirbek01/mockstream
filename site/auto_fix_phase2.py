"""
Phase-2 fix: remaining "Find the error" questions with non-contiguous compound answers.
These questions have correct answers like "is knowing" where the words aren't adjacent in the sentence.
Solution: use Gemini to regenerate with CONTIGUOUS error phrases and proper 4-bold-span structure.
"""
import os, re, json, time, glob, urllib.request

SITE = os.path.dirname(os.path.abspath(__file__))
GRAMMAR_DIR = os.path.join(SITE, "questions G")
API_KEY = "AIzaSyAgsMeOT8t-8AGcEE0QWgh4VLubxti7xL8"
MODEL = "gemini-2.0-flash"

stats = {"files_fixed": 0, "questions_fixed": 0, "questions_failed": 0}

def call_gemini(prompt, retries=3):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"
    body = json.dumps({"contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {"temperature": 0.8, "maxOutputTokens": 8192}}).encode()
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read())
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return text
        except Exception as e:
            if "429" in str(e) or "503" in str(e):
                wait = 15 * (attempt + 1)
                print(f"    Rate limited, waiting {wait}s...")
                time.sleep(wait)
            else:
                print(f"    API error: {e}")
                time.sleep(5)
    return None

def parse_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        text = f.read()
    
    # Split into lines
    lines = text.split('\n')
    header_lines = []
    q_lines = []
    footer_lines = []
    state = 'header'
    
    for line in lines:
        if state == 'header':
            header_lines.append(line)
            if 'window.ALL_QUESTIONS' in line and '[' in line:
                state = 'questions'
        elif state == 'questions':
            if line.strip() == '];':
                footer_lines.append(line)
                state = 'footer'
            elif line.strip().startswith('{'):
                q_lines.append(line)
            else:
                footer_lines.append(line)
        else:
            footer_lines.append(line)
    
    questions = []
    for raw in q_lines:
        q = {"raw": raw}
        tm = re.search(r'type:\s*"([^"]*)"', raw)
        if tm: q["type"] = tm.group(1)
        qm = re.search(r'question:\s*"((?:[^"\\]|\\.)*)"', raw)
        if qm: q["question"] = qm.group(1)
        cm = re.search(r'correct:\s*"((?:[^"\\]|\\.)*)"', raw)
        if cm: q["correct"] = cm.group(1)
        om = re.search(r'options:\s*\[([^\]]*)\]', raw)
        if om: q["options"] = re.findall(r'"((?:[^"\\]|\\.)*)"', om.group(1))
        dm = re.search(r'def:\s*"((?:[^"\\]|\\.)*)"', raw)
        if dm: q["def"] = dm.group(1)
        lm = re.search(r'level:\s*"([^"]*)"', raw)
        if lm: q["level"] = lm.group(1)
        questions.append(q)
    
    return header_lines, questions, footer_lines

def write_file(filepath, header_lines, questions, footer_lines):
    with open(filepath, "w", encoding="utf-8") as f:
        f.write('\n'.join(header_lines) + '\n')
        for i, q in enumerate(questions):
            opts = ", ".join(f'"{o}"' for o in q["options"])
            comma = "," if i < len(questions) - 1 else ""
            f.write(f'  {{type: "{q["type"]}", question: "{q["question"]}", correct: "{q["correct"]}", options: [{opts}], def: "{q["def"]}", level: "{q["level"]}"}}{comma}\n')
        f.write('\n'.join(footer_lines))

def find_issues(questions):
    """Find "Find the error" questions with compound answers not matching bold spans."""
    issues = []
    for i, q in enumerate(questions):
        if q.get("type") != "Find the error:":
            continue
        text = q.get("question", "")
        correct = q.get("correct", "")
        opts = q.get("options", [])
        bolded = re.findall(r'<b>([^<]+)</b>', text)
        
        has_issue = False
        # Check if correct is in bold spans
        if correct not in bolded:
            has_issue = True
        # Check all options
        for opt in opts:
            if opt not in bolded:
                has_issue = True
        # Check duplicate options
        if len(opts) != len(set(opts)):
            has_issue = True
        # Check 4 bold spans
        if len(bolded) != 4:
            has_issue = True
        
        if has_issue:
            issues.append(i)
    return issues

def fix_file(filepath):
    fname = os.path.basename(filepath)
    header, questions, footer = parse_file(filepath)
    
    if len(questions) != 30:
        return
    
    bad_indices = find_issues(questions)
    if not bad_indices:
        return
    
    # Get topic and level info
    first_line = header[0] if header else ""
    tm = re.search(r'// Grammar Test:\s*(.+?)\s*[—–-]', first_line)
    topic = tm.group(1) if tm else fname.rsplit("-", 1)[0].replace("-", " ").title()
    
    if "-upper-intermediate.js" in fname:
        level_tag = "B2–C1"
    elif "-advanced.js" in fname:
        level_tag = "C1–C2"
    else:
        level_tag = "B1–B2"
    
    print(f"  📝 {fname}: {len(bad_indices)} flawed 'Find the error' questions")
    
    # Build prompt with all bad questions
    items = []
    for idx in bad_indices:
        q = questions[idx]
        items.append(f"Q{idx+1}: correct=\"{q['correct']}\", options={q['options']}\n  Sentence: {q['question']}")
    
    prompt = f"""Fix these flawed "Find the error" grammar questions for the topic "{topic}" at {level_tag} level.

PROBLEMS WITH CURRENT QUESTIONS:
{chr(10).join(items)}

The issue: compound correct answers like "is knowing" must appear as a SINGLE contiguous phrase in the sentence. They must NOT be split by other words.

GENERATE {len(bad_indices)} replacement "Find the error" questions. STRICT RULES:

1. Each sentence must have EXACTLY 4 bold segments: <b>segment1</b> ... <b>segment2</b> ... <b>segment3</b> ... <b>segment4</b>
2. Each bold segment = one option button the student clicks
3. The 4 options array must EXACTLY match the 4 bold segments (same text, same order)
4. The correct answer must be ONE of the 4 options (the error)
5. The error phrase must be CONTIGUOUS — no words between parts of the error. 
   BAD:  "She <b>is</b> always <b>knowing</b>" → "is knowing" is NOT contiguous
   GOOD: "She <b>is knowing</b> the <b>answer</b> <b>but</b> <b>won't</b> tell."
6. All 4 options must be UNIQUE (no duplicates like "the", "the")
7. Question max 15 words, options max 6 words each
8. def: explain the error, max 15 words
9. level: "{level_tag}"

Output ONLY a JSON array:
[{{"type":"Find the error:","question":"...","correct":"...","options":["A","B","C","D"],"def":"...","level":"{level_tag}"}}]"""

    response = call_gemini(prompt)
    if not response:
        stats["questions_failed"] += len(bad_indices)
        print(f"    ❌ API call failed")
        return
    
    # Parse response
    try:
        match = re.search(r'\[[\s\S]*\]', response)
        if not match:
            stats["questions_failed"] += len(bad_indices)
            print(f"    ❌ No JSON array in response")
            return
        replacements = json.loads(match.group())
    except json.JSONDecodeError as e:
        stats["questions_failed"] += len(bad_indices)
        print(f"    ❌ JSON parse error: {e}")
        return
    
    if len(replacements) != len(bad_indices):
        print(f"    ⚠ Expected {len(bad_indices)} replacements, got {len(replacements)}")
    
    fixed = 0
    for j, idx in enumerate(bad_indices):
        if j >= len(replacements):
            stats["questions_failed"] += 1
            continue
        
        new_q = replacements[j]
        
        # Validate
        required = ["type", "question", "correct", "options", "def", "level"]
        if not all(k in new_q for k in required):
            print(f"    Q{idx+1}: Missing fields")
            stats["questions_failed"] += 1
            continue
        if len(new_q["options"]) != 4:
            print(f"    Q{idx+1}: Wrong option count")
            stats["questions_failed"] += 1
            continue
        if new_q["correct"] not in new_q["options"]:
            print(f"    Q{idx+1}: Correct not in options")
            stats["questions_failed"] += 1
            continue
        if len(set(new_q["options"])) != 4:
            print(f"    Q{idx+1}: Duplicate options")
            stats["questions_failed"] += 1
            continue
        
        # Verify bold spans match options
        bolded = re.findall(r'<b>([^<]+)</b>', new_q["question"])
        if len(bolded) != 4:
            print(f"    Q{idx+1}: Not exactly 4 bold spans ({len(bolded)} found)")
            stats["questions_failed"] += 1
            continue
        if new_q["correct"] not in bolded:
            print(f"    Q{idx+1}: Correct not in bold spans")
            stats["questions_failed"] += 1
            continue
        
        questions[idx].update(new_q)
        fixed += 1
        stats["questions_fixed"] += 1
    
    if fixed > 0:
        write_file(filepath, header, questions, footer)
        stats["files_fixed"] += 1
        print(f"    ✅ Fixed {fixed}/{len(bad_indices)} questions")
    else:
        print(f"    ❌ No questions could be fixed")

# ─── Main ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 70)
    print("PHASE 2: Fix remaining 'Find the error' compound-answer issues")
    print("=" * 70)
    
    all_files = glob.glob(os.path.join(GRAMMAR_DIR, "*.js"))
    level_files = sorted(set(f for f in all_files 
                             if re.search(r'-(intermediate|upper-intermediate|advanced)\.js$', os.path.basename(f))))
    
    print(f"\nScanning {len(level_files)} files...\n")
    
    for filepath in level_files:
        fix_file(filepath)
        time.sleep(1)
    
    print("\n" + "=" * 70)
    print("RESULTS")
    print("=" * 70)
    print(f"  Files fixed:      {stats['files_fixed']}")
    print(f"  Questions fixed:  {stats['questions_fixed']}")
    print(f"  Questions failed: {stats['questions_failed']}")
    print("\nDone. Run health_check_tests.py to verify.")
