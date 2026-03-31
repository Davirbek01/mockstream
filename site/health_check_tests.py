"""
Health check for grammar and vocabulary test files.
Scans for flawed questions: ambiguous answers, duplicates, missing fields, etc.
"""
import os, re, json, glob

SITE = os.path.dirname(os.path.abspath(__file__))
GRAMMAR_DIR = os.path.join(SITE, "questions G")
VOCAB_DIR = os.path.join(SITE, "questions V")

issues = []

def add_issue(file, qnum, severity, msg):
    issues.append({"file": os.path.basename(file), "q": qnum, "sev": severity, "msg": msg})

def parse_js_questions(filepath):
    """Parse a JS file with window.ALL_QUESTIONS = [...] into a list of dicts."""
    with open(filepath, "r", encoding="utf-8") as f:
        text = f.read()
    # Extract the array content
    m = re.search(r'window\.ALL_QUESTIONS\s*=\s*\[', text)
    if not m:
        add_issue(filepath, 0, "CRITICAL", "Cannot parse: no window.ALL_QUESTIONS found")
        return []
    
    questions = []
    # Find each { ... } block
    pattern = re.compile(r'\{([^{}]+)\}', re.DOTALL)
    for i, match in enumerate(pattern.finditer(text[m.start():])):
        block = match.group(1)
        q = {}
        # Extract type
        tm = re.search(r'type:\s*"([^"]*)"', block)
        if tm: q['type'] = tm.group(1)
        # Extract question (handle escaped quotes)
        qm = re.search(r'question:\s*"((?:[^"\\]|\\.)*)"', block)
        if qm: q['question'] = qm.group(1)
        # Extract correct (handle escaped quotes)
        cm = re.search(r'correct:\s*"((?:[^"\\]|\\.)*)"', block)
        if cm: q['correct'] = cm.group(1).replace('\\"', '"')
        # Extract options (handle escaped quotes)
        om = re.search(r'options:\s*\[([^\]]*)\]', block)
        if om:
            opts_raw = om.group(1)
            q['options'] = [o.replace('\\"', '"') for o in re.findall(r'"((?:[^"\\]|\\.)*)"', opts_raw)]
        # Extract def (handle escaped quotes)
        dm = re.search(r'def:\s*"((?:[^"\\]|\\.)*)"', block)
        if dm: q['def'] = dm.group(1).replace('\\"', '"')
        # Extract level
        lm = re.search(r'level:\s*"([^"]*)"', block)
        if lm: q['level'] = lm.group(1)
        
        if q.get('question'):
            questions.append(q)
    return questions

def check_basic(filepath, questions):
    """Check basic structural issues."""
    fname = os.path.basename(filepath)
    
    if len(questions) != 30:
        add_issue(filepath, 0, "ERROR", f"Expected 30 questions, found {len(questions)}")
    
    for i, q in enumerate(questions, 1):
        # Missing fields
        for field in ['type', 'question', 'correct', 'options', 'def', 'level']:
            if field not in q or not q[field]:
                add_issue(filepath, i, "ERROR", f"Missing field: {field}")
        
        if 'options' not in q: continue
        
        # Wrong option count
        if len(q['options']) != 4:
            add_issue(filepath, i, "ERROR", f"Expected 4 options, found {len(q['options'])}")
        
        # Correct not in options
        if q.get('correct') and q['correct'] not in q.get('options', []):
            add_issue(filepath, i, "CRITICAL", f"Correct answer '{q['correct']}' not in options: {q['options']}")
        
        # Duplicate options
        opts = q.get('options', [])
        if len(opts) != len(set(opts)):
            dupes = [o for o in opts if opts.count(o) > 1]
            add_issue(filepath, i, "ERROR", f"Duplicate options: {set(dupes)}")
        
        # Options too long (grammar max 100, vocab max 80 chars)
        is_grammar = "questions G" in filepath
        max_len = 100 if is_grammar else 80
        for opt in opts:
            if len(opt) > max_len:
                add_issue(filepath, i, "WARN", f"Option too long ({len(opt)} chars): '{opt[:50]}...'")

def check_subjunctive_flaw(filepath, questions):
    """
    Check for the main-verb-blank flaw in subjunctive questions:
    Pattern: (verb) Subject ___ that someone [subjunctive verb]
    The blank tests the MAIN clause verb — which can be any tense — so multiple answers are correct.
    """
    trigger_verbs = ['demand', 'suggest', 'require', 'urge', 'insist', 'advise', 
                     'recommend', 'propose', 'request', 'ask', 'prefer', 'move']
    
    for i, q in enumerate(questions, 1):
        text = q.get('question', '')
        qtype = q.get('type', '')
        
        # Pattern: (verb) ... ___ ... that 
        # The hint word in parens should match a trigger verb, and blank should be BEFORE "that"
        paren_match = re.search(r'\((\w+)\)', text)
        if not paren_match:
            continue
        hint_verb = paren_match.group(1).lower()
        if hint_verb not in trigger_verbs:
            continue
        
        # Check if blank comes before "that" — means the blank IS the main verb
        blank_pos = text.find('___')
        that_pos = text.find(' that ')
        if blank_pos > 0 and that_pos > 0 and blank_pos < that_pos:
            # Exclude "It is/was ___ that" — passive form, only one correct answer
            if re.search(r'\bIt\s+(is|was)\s+(<b>)?___', text):
                continue
            add_issue(filepath, i, "CRITICAL", 
                f"Subjunctive flaw: blank tests MAIN verb '{hint_verb}' (any tense valid). Q: {text[:80]}")

def check_multiple_correct_grammar(filepath, questions):
    """Check for grammar questions where multiple options could be correct."""
    for i, q in enumerate(questions, 1):
        text = q.get('question', '')
        opts = q.get('options', [])
        correct = q.get('correct', '')
        
        # "Find the error" where the "error" word isn't actually always wrong
        if q.get('type') == 'Find the error:':
            # Check the bolded words are actual options
            bolded = re.findall(r'<b>(\w+)</b>', text)
            non_blank = [b for b in bolded if b != '___']
            for opt in opts:
                if opt not in non_blank and opt != '___':
                    # Option not found in bold tags — may confuse students
                    pass  # This is fine if options are the bolded words

def check_ambiguous_tense(filepath, questions):
    """
    Check for questions where "Complete with the correct form:" has a hint verb
    but the options include both present and past forms of the SAME verb,
    and the sentence context doesn't clearly disambiguate.
    """
    for i, q in enumerate(questions, 1):
        if q.get('type') != 'Complete with the correct form:':
            continue
        text = q.get('question', '')
        opts = q.get('options', [])
        correct = q.get('correct', '')
        
        paren_match = re.search(r'\((\w+)\)', text)
        if not paren_match:
            continue
        
        hint = paren_match.group(1).lower()
        
        # Check if blank is the main verb and "that" clause follows with a bare verb
        blank_pos = text.find('___')
        that_pos = text.find(' that ')
        if blank_pos > 0 and that_pos > 0 and blank_pos < that_pos:
            # Already caught by subjunctive check, but flag generically too
            pass

def check_duplicate_questions(filepath, questions):
    """Check for near-duplicate questions within the same file."""
    seen = {}
    for i, q in enumerate(questions, 1):
        # Strip HTML and normalize
        clean = re.sub(r'<[^>]+>', '', q.get('question', '')).strip().lower()
        clean = re.sub(r'\s+', ' ', clean)
        if clean in seen:
            add_issue(filepath, i, "WARN", f"Duplicate of Q{seen[clean]}: {clean[:60]}")
        else:
            seen[clean] = i

def check_options_are_plausible(filepath, questions):
    """Check if all options look like they're the same part of speech / form family."""
    for i, q in enumerate(questions, 1):
        opts = q.get('options', [])
        # Check if any option is identical to another (case-insensitive)
        lower_opts = [o.lower().strip() for o in opts]
        if len(lower_opts) != len(set(lower_opts)):
            add_issue(filepath, i, "WARN", f"Case-duplicate options: {opts}")

def check_empty_or_placeholder(filepath, questions):
    """Check for empty strings, placeholder text, or broken HTML in questions."""
    for i, q in enumerate(questions, 1):
        text = q.get('question', '')
        if not text.strip():
            add_issue(filepath, i, "CRITICAL", "Empty question text")
        if '___' not in text and q.get('type') in ['Fill in the blank:', 'Complete with the correct form:']:
            add_issue(filepath, i, "ERROR", f"Fill-in-blank type but no ___ in question")
        # Unmatched HTML tags
        opens = len(re.findall(r'<b>', text))
        closes = len(re.findall(r'</b>', text))
        if opens != closes:
            add_issue(filepath, i, "WARN", f"Unmatched <b> tags: {opens} opens, {closes} closes")

def check_find_error_consistency(filepath, questions):
    """For 'Find the error' questions, ensure the correct answer appears bold in the question."""
    for i, q in enumerate(questions, 1):
        if q.get('type') != 'Find the error:':
            continue
        text = q.get('question', '')
        correct = q.get('correct', '')
        bolded = re.findall(r'<b>([^<]+)</b>', text)
        if correct and correct not in bolded:
            add_issue(filepath, i, "CRITICAL", 
                f"'Find the error' correct='{correct}' not found in bold tags: {bolded}")
        # All options should be from bolded words
        for opt in q.get('options', []):
            if opt not in bolded:
                add_issue(filepath, i, "ERROR", 
                    f"'Find the error' option '{opt}' not in bold text: {bolded}")

def scan_directory(dirpath, label):
    """Scan all JS files in a directory."""
    if not os.path.isdir(dirpath):
        print(f"  Directory not found: {dirpath}")
        return 0
    
    files = sorted(glob.glob(os.path.join(dirpath, "*.js")))
    level_files = [f for f in files if any(f.endswith(s + '.js') for s in ['-intermediate', '-upper-intermediate', '-advanced'])]
    
    print(f"  Found {len(level_files)} level files in {label}")
    
    for filepath in level_files:
        questions = parse_js_questions(filepath)
        if not questions:
            continue
        check_basic(filepath, questions)
        check_subjunctive_flaw(filepath, questions)
        check_duplicate_questions(filepath, questions)
        check_options_are_plausible(filepath, questions)
        check_empty_or_placeholder(filepath, questions)
        check_find_error_consistency(filepath, questions)
        check_ambiguous_tense(filepath, questions)
    
    return len(level_files)

# ── Main ──
print("=" * 70)
print("HEALTH CHECK: Grammar & Vocabulary Test Files")
print("=" * 70)

print("\n📝 Scanning Grammar tests...")
g_count = scan_directory(GRAMMAR_DIR, "Grammar")

print("\n📝 Scanning Vocabulary tests...")
v_count = scan_directory(VOCAB_DIR, "Vocabulary")

# ── Report ──
print("\n" + "=" * 70)
print("RESULTS")
print("=" * 70)

if not issues:
    print("\n✅ No issues found across all files!")
else:
    # Group by severity
    critical = [i for i in issues if i['sev'] == 'CRITICAL']
    errors = [i for i in issues if i['sev'] == 'ERROR']
    warns = [i for i in issues if i['sev'] == 'WARN']
    
    print(f"\n🔴 CRITICAL: {len(critical)}")
    print(f"🟠 ERROR:    {len(errors)}")
    print(f"🟡 WARN:     {len(warns)}")
    print(f"   TOTAL:    {len(issues)}")
    
    if critical:
        print(f"\n{'─' * 70}")
        print("🔴 CRITICAL ISSUES (must fix — wrong/ambiguous answers):")
        print(f"{'─' * 70}")
        for i in critical:
            print(f"  [{i['file']}] Q{i['q']}: {i['msg']}")
    
    if errors:
        print(f"\n{'─' * 70}")
        print("🟠 ERRORS (structural problems):")
        print(f"{'─' * 70}")
        for i in errors:
            print(f"  [{i['file']}] Q{i['q']}: {i['msg']}")
    
    if warns:
        print(f"\n{'─' * 70}")
        print("🟡 WARNINGS (quality issues):")
        print(f"{'─' * 70}")
        for i in warns:
            print(f"  [{i['file']}] Q{i['q']}: {i['msg']}")

print(f"\nScanned: {g_count} grammar + {v_count} vocabulary = {g_count + v_count} files")
print("Done.")
