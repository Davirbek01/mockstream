"""
Auto-fix grammar test issues detected by health_check_tests.py
Handles: bold-tag mismatches, subjunctive flaws, duplicate options
"""
import os, re, json, time, glob, urllib.request, sys

SITE = os.path.dirname(os.path.abspath(__file__))
GRAMMAR_DIR = os.path.join(SITE, "questions G")
API_KEY = "AIzaSyAgsMeOT8t-8AGcEE0QWgh4VLubxti7xL8"
MODEL = "gemini-2.0-flash"

stats = {"files_scanned": 0, "bold_fixed": 0, "api_fixed": 0, "api_failed": 0, "files_written": 0}

# ─── Gemini API ───────────────────────────────────────────────────────
def call_gemini(prompt, retries=3):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"
    body = json.dumps({"contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 4096}}).encode()
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

# ─── Parsing ──────────────────────────────────────────────────────────
def parse_file(filepath):
    """Parse a JS file into header lines + list of question dicts with their raw lines."""
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    header = []
    q_lines = []
    footer = []
    in_array = False
    
    for line in lines:
        stripped = line.strip()
        if not in_array:
            header.append(line)
            if "window.ALL_QUESTIONS" in line and "[" in line:
                in_array = True
        elif stripped == "];":
            footer.append(line)
            in_array = False
        elif stripped.startswith("{"):
            q_lines.append(line)
        else:
            # Could be part of multi-line or blank
            if q_lines:
                q_lines[-1] += line
    
    questions = []
    for raw in q_lines:
        q = {}
        q["raw"] = raw
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
    
    return header, questions, footer

def rebuild_line(q, trailing_comma=True):
    """Rebuild a question as a single JS line."""
    opts = ", ".join(f'"{o}"' for o in q["options"])
    comma = "," if trailing_comma else ""
    return f'  {{type: "{q["type"]}", question: "{q["question"]}", correct: "{q["correct"]}", options: [{opts}], def: "{q["def"]}", level: "{q["level"]}"}}{comma}\n'

def write_file(filepath, header, questions, footer):
    with open(filepath, "w", encoding="utf-8") as f:
        for h in header:
            f.write(h)
        for i, q in enumerate(questions):
            f.write(rebuild_line(q, trailing_comma=(i < len(questions) - 1)))
        for ft in footer:
            f.write(ft)

# ─── Bold-tag fix (mechanical) ───────────────────────────────────────
def fix_find_error_bolds(question_text, correct, options):
    """
    Strip all bold tags, re-bold based on option positions.
    Returns (new_text, success).
    """
    plain = re.sub(r'</?b>', '', question_text)
    
    # Sort options by length descending to handle compound options first
    indexed_opts = sorted(enumerate(options), key=lambda x: -len(x[1]))
    
    claimed = set()
    placements = []  # (start, end, option_text)
    
    for orig_idx, opt in indexed_opts:
        search_start = 0
        placed = False
        while search_start < len(plain):
            idx = plain.find(opt, search_start)
            if idx < 0:
                break
            end_pos = idx + len(opt)
            if not any(i in claimed for i in range(idx, end_pos)):
                placements.append((idx, end_pos, opt))
                claimed.update(range(idx, end_pos))
                placed = True
                break
            search_start = idx + 1
        if not placed:
            return question_text, False  # Can't find option in text
    
    placements.sort()
    
    result = ''
    last = 0
    for start, end, opt in placements:
        result += plain[last:start] + f'<b>{opt}</b>'
        last = end
    result += plain[last:]
    
    return result, True

def validate_find_error(text, correct, options):
    bolded = re.findall(r'<b>([^<]+)</b>', text)
    return (correct in bolded and 
            all(opt in bolded for opt in options) and 
            len(bolded) == 4)

# ─── Issue detection ─────────────────────────────────────────────────
TRIGGER_VERBS = {'demand', 'suggest', 'require', 'urge', 'insist', 'advise',
                 'recommend', 'propose', 'request', 'ask', 'prefer', 'move'}

def detect_issues(questions):
    """Returns list of (index, issue_type, description)."""
    issues = []
    seen_texts = {}
    
    for i, q in enumerate(questions):
        if not q.get("question"):
            continue
        text = q.get("question", "")
        correct = q.get("correct", "")
        opts = q.get("options", [])
        qtype = q.get("type", "")
        
        # ── Find the error: bold mismatches ──
        if qtype == "Find the error:":
            bolded = re.findall(r'<b>([^<]+)</b>', text)
            if correct not in bolded or any(o not in bolded for o in opts):
                issues.append((i, "bold_mismatch", "bold tags don't match options/correct"))
        
        # ── Subjunctive main-verb flaw ──
        if qtype == "Complete with the correct form:":
            paren = re.search(r'\((\w+)\)', text)
            if paren:
                hint = paren.group(1).lower()
                if hint in TRIGGER_VERBS:
                    blank_pos = text.find('___')
                    that_pos = text.find(' that ')
                    if blank_pos > 0 and that_pos > 0 and blank_pos < that_pos:
                        # Exclude passive patterns: "It was ___ that", "It is ___ that"
                        before_blank = re.sub(r'</?b>', '', text[:blank_pos]).strip().lower()
                        if not before_blank.endswith(("it was", "it is", "it has been")):
                            issues.append((i, "subjunctive_flaw", f"blank tests main verb '{hint}'"))
        
        # ── Duplicate options ──
        if len(opts) != len(set(opts)):
            issues.append((i, "duplicate_options", f"duplicate options: {opts}"))
        
        # ── Missing blank in fill-in types ──
        if qtype in ("Fill in the blank:", "Complete with the correct form:") and '___' not in text:
            issues.append((i, "missing_blank", "no ___ in fill-in question"))
        
        # ── Correct not in options ──
        if correct and opts and correct not in opts:
            issues.append((i, "correct_not_in_options", f"correct '{correct}' not in options"))
    
    return issues

# ─── API regeneration ────────────────────────────────────────────────
def regenerate_questions(topic_name, level_tag, questions_to_fix):
    """
    Call Gemini to regenerate specific flawed questions.
    questions_to_fix: list of (index, old_question_dict, issue_description)
    Returns: dict of {index: new_question_dict}
    """
    if not questions_to_fix:
        return {}
    
    items = []
    for idx, old_q, issue in questions_to_fix:
        items.append(f"Question {idx+1} (type: \"{old_q['type']}\"):\n"
                     f"  Original: {json.dumps(old_q, ensure_ascii=False)}\n"
                     f"  Problem: {issue}")
    
    prompt = f"""You are fixing flawed questions in a grammar test on "{topic_name}" at {level_tag} level.

Here are the flawed questions. Generate EXACT replacements:

{chr(10).join(items)}

RULES:
- Keep the same question TYPE for each replacement
- For "Find the error:" questions: bold EXACTLY 4 segments using <b>...</b>, where each bold segment matches one option. The correct answer (the error) MUST be one single <b>...</b> span. If the error is a compound like "is knowing", wrap it as ONE bold span: <b>is knowing</b>
- For "Complete with the correct form:" questions: the blank <b>___</b> MUST test the SUBORDINATE clause verb (the subjunctive form), NOT the main clause verb. Example: "(eat) I suggest that she <b>___</b> something." correct: "eat"
- 4 UNIQUE options (no duplicates), max 6 words each
- Only ONE correct answer possible
- question max 15 words, def max 15 words (English)
- level: "{level_tag}"
- Use simple vocabulary for B1-B2, moderate for B2-C1, formal for C1-C2

Output ONLY a JSON array of replacement objects in order, one per flawed question:
[{{"type":"...","question":"...","correct":"...","options":["A","B","C","D"],"def":"...","level":"{level_tag}"}}]"""
    
    response = call_gemini(prompt)
    if not response:
        return {}
    
    # Parse JSON from response
    try:
        # Find JSON array in response
        match = re.search(r'\[[\s\S]*\]', response)
        if not match:
            print(f"    Could not find JSON array in response")
            return {}
        replacements = json.loads(match.group())
    except json.JSONDecodeError as e:
        print(f"    JSON parse error: {e}")
        return {}
    
    if len(replacements) != len(questions_to_fix):
        print(f"    Expected {len(questions_to_fix)} replacements, got {len(replacements)}")
        # Try to use what we got
        if len(replacements) < len(questions_to_fix):
            pass  # Some won't be fixed
    
    result = {}
    for j, (idx, old_q, issue) in enumerate(questions_to_fix):
        if j >= len(replacements):
            break
        new_q = replacements[j]
        # Validate the replacement
        required = ["type", "question", "correct", "options", "def", "level"]
        if all(k in new_q for k in required) and len(new_q["options"]) == 4:
            if new_q["correct"] in new_q["options"]:
                if len(set(new_q["options"])) == 4:  # No duplicates
                    result[idx] = new_q
                else:
                    print(f"    Q{idx+1}: Replacement still has duplicate options, skipping")
            else:
                print(f"    Q{idx+1}: Replacement correct not in options, skipping")
        else:
            print(f"    Q{idx+1}: Replacement missing fields/wrong option count, skipping")
    
    return result

# ─── Main pipeline ───────────────────────────────────────────────────
def get_topic_and_level(filepath):
    """Extract topic name and level from file header/name."""
    fname = os.path.basename(filepath)
    # Level from filename
    if "-intermediate.js" in fname and "-upper-" not in fname:
        level = "Intermediate"
        level_tag = "B1–B2"
    elif "-upper-intermediate.js" in fname:
        level = "Upper-Intermediate"
        level_tag = "B2–C1"
    elif "-advanced.js" in fname:
        level = "Advanced"
        level_tag = "C1–C2"
    else:
        level = "Unknown"
        level_tag = "B1–B2"
    
    # Topic from first line comment
    with open(filepath, "r", encoding="utf-8") as f:
        first_line = f.readline()
    tm = re.search(r'// Grammar Test:\s*(.+?)\s*[—–-]', first_line)
    topic = tm.group(1) if tm else fname.rsplit("-", 1)[0].replace("-", " ").title()
    
    return topic, level, level_tag

def process_file(filepath):
    """Process a single file: detect issues, fix what we can, API the rest."""
    fname = os.path.basename(filepath)
    stats["files_scanned"] += 1
    
    header, questions, footer = parse_file(filepath)
    if len(questions) != 30:
        print(f"  ⚠ {fname}: {len(questions)} questions (expected 30), skipping")
        return
    
    issues = detect_issues(questions)
    if not issues:
        return
    
    topic, level, level_tag = get_topic_and_level(filepath)
    print(f"  📝 {fname}: {len(issues)} issues found")
    
    # Deduplicate: one fix per question index (take worst issue)
    issue_map = {}  # index → list of (issue_type, description)
    for idx, itype, desc in issues:
        if idx not in issue_map:
            issue_map[idx] = []
        issue_map[idx].append((itype, desc))
    
    needs_api = []  # (index, question_dict, issue_description)
    modified = False
    
    for idx, issue_list in sorted(issue_map.items()):
        q = questions[idx]
        issue_types = [it for it, _ in issue_list]
        
        # Try mechanical bold-tag fix first
        if "bold_mismatch" in issue_types and q.get("type") == "Find the error:":
            new_text, success = fix_find_error_bolds(q["question"], q["correct"], q["options"])
            if success and validate_find_error(new_text, q["correct"], q["options"]):
                q["question"] = new_text
                modified = True
                stats["bold_fixed"] += 1
                # Remove bold_mismatch from remaining issues
                issue_list = [(it, d) for it, d in issue_list if it != "bold_mismatch"]
                if not issue_list:
                    continue
        
        # If still has issues, needs API regeneration
        remaining_issues = [d for _, d in issue_list if _ != "bold_mismatch"]
        if remaining_issues or ("bold_mismatch" in issue_types and 
                                not validate_find_error(q.get("question", ""), q.get("correct", ""), q.get("options", []))):
            desc = "; ".join(d for _, d in issue_list)
            needs_api.append((idx, q, desc))
    
    # API regeneration for remaining issues
    if needs_api:
        print(f"    → {len(needs_api)} questions need API regeneration...")
        replacements = regenerate_questions(topic, level_tag, needs_api)
        for idx, new_q in replacements.items():
            questions[idx].update(new_q)
            modified = True
            stats["api_fixed"] += 1
        
        failed = len(needs_api) - len(replacements)
        if failed > 0:
            stats["api_failed"] += failed
            print(f"    ⚠ {failed} questions could not be fixed")
    
    # Write back if modified
    if modified:
        write_file(filepath, header, questions, footer)
        stats["files_written"] += 1
        print(f"    ✅ Fixed and saved")

# ─── Main ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 70)
    print("AUTO-FIX: Grammar Test Issues")
    print("=" * 70)
    
    all_files = glob.glob(os.path.join(GRAMMAR_DIR, "*.js"))
    level_files = sorted(set(f for f in all_files if re.search(r'-(intermediate|upper-intermediate|advanced)\.js$', os.path.basename(f))))
    
    print(f"\nFound {len(level_files)} grammar level files to scan\n")
    
    for filepath in level_files:
        process_file(filepath)
        # Small delay between files to avoid hammering API
        if stats["api_fixed"] > 0 or stats["api_failed"] > 0:
            time.sleep(1)
    
    print("\n" + "=" * 70)
    print("RESULTS")
    print("=" * 70)
    print(f"  Files scanned:       {stats['files_scanned']}")
    print(f"  Bold-tag fixes:      {stats['bold_fixed']} (mechanical)")
    print(f"  API regenerations:   {stats['api_fixed']} (Gemini)")
    print(f"  API failures:        {stats['api_failed']}")
    print(f"  Files written:       {stats['files_written']}")
    print("\nDone. Run health_check_tests.py to verify.")
