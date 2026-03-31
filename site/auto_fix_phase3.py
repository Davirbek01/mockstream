"""
Phase 3: Fix remaining "Find the error" compound-answer mismatches.
For questions where correct answer is e.g. "is knowing" but bold tags are separate,
merge adjacent <b> tags and update options to match.
"""
import os, re, glob

SITE = os.path.dirname(os.path.abspath(__file__))
GRAMMAR_DIR = os.path.join(SITE, "questions G")

fixed_count = 0
files_modified = set()

def parse_questions_raw(filepath):
    """Return list of (start, end, raw_text) for each question block."""
    with open(filepath, "r", encoding="utf-8") as f:
        text = f.read()
    m = re.search(r'window\.ALL_QUESTIONS\s*=\s*\[', text)
    if not m:
        return text, []
    results = []
    for match in re.finditer(r'\{([^{}]+)\}', text[m.start():]):
        block = match.group(0)
        start = m.start() + match.start()
        end = m.start() + match.end()
        results.append((start, end, block))
    return text, results

def get_field(block, field):
    m = re.search(rf'{field}:\s*"([^"]*)"', block)
    return m.group(1) if m else None

def get_options(block):
    m = re.search(r'options:\s*\[([^\]]*)\]', block)
    if not m: return []
    return re.findall(r'"([^"]*)"', m.group(1))

def get_bold_words(question_text):
    return re.findall(r'<b>([^<]+)</b>', question_text)

def fix_file(filepath):
    global fixed_count, files_modified
    
    text, blocks = parse_questions_raw(filepath)
    if not blocks:
        return
    
    replacements = []
    
    for start, end, block in blocks:
        qtype = get_field(block, 'type')
        if qtype != 'Find the error:':
            continue
        
        correct = get_field(block, 'correct')
        question = get_field(block, 'question')
        options = get_options(block)
        
        if not correct or not question or not options:
            continue
        
        bold_words = get_bold_words(question)
        
        # Check if correct answer is already in bold words
        if correct in bold_words:
            # But also check all options are in bold words
            bad_opts = [o for o in options if o not in bold_words]
            if not bad_opts:
                continue
        
        # The correct answer is a compound like "is knowing" — individual words are bolded
        # Strategy: find the compound in the question text and merge bold tags
        correct_words = correct.split()
        
        if len(correct_words) < 2:
            # Single word but not in bold — different issue, skip
            if correct not in bold_words:
                # Try to find it as a substring of a bold word or vice versa
                continue
            continue
        
        # Build pattern to find adjacent <b>word1</b> <b>word2</b> ... and merge
        # Allow optional spaces/text between bold tags
        pattern_parts = []
        for w in correct_words:
            pattern_parts.append(rf'<b>{re.escape(w)}</b>')
        merge_pattern = r'\s*'.join(pattern_parts)
        
        m = re.search(merge_pattern, question)
        if m:
            old_question = question
            merged = f'<b>{correct}</b>'
            new_question = question[:m.start()] + merged + question[m.end():]
            
            # Also fix options — each option should be a single bold span
            new_options = []
            new_bold_words = get_bold_words(new_question)
            
            for opt in options:
                if opt in new_bold_words:
                    new_options.append(opt)
                elif opt == correct:
                    new_options.append(opt)
                else:
                    # Try to find this compound in the question and merge too
                    opt_words = opt.split()
                    if len(opt_words) >= 2:
                        opt_pattern_parts = [rf'<b>{re.escape(w)}</b>' for w in opt_words]
                        opt_merge_pattern = r'\s*'.join(opt_pattern_parts)
                        om = re.search(opt_merge_pattern, new_question)
                        if om:
                            new_question = new_question[:om.start()] + f'<b>{opt}</b>' + new_question[om.end():]
                            new_options.append(opt)
                        else:
                            # Can't find compound — use individual word that's bolded
                            found = False
                            for w in opt_words:
                                if w in get_bold_words(new_question):
                                    new_options.append(w)
                                    found = True
                                    break
                            if not found:
                                new_options.append(opt)  # leave as-is
                    else:
                        new_options.append(opt)
            
            # Build replacement block
            old_block = block
            new_block = block.replace(f'question: "{old_question}"', f'question: "{new_question}"')
            
            # Replace options
            old_opts_str = re.search(r'options:\s*\[([^\]]*)\]', new_block).group(0)
            new_opts_str = 'options: [' + ', '.join(f'"{o}"' for o in new_options) + ']'
            new_block = new_block.replace(old_opts_str, new_opts_str)
            
            if new_block != old_block:
                replacements.append((old_block, new_block))
                fname = os.path.basename(filepath)
                print(f"  FIX [{fname}]: '{correct}' -> merged <b> tags")
    
    if replacements:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        for old, new in replacements:
            content = content.replace(old, new, 1)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        fixed_count += len(replacements)
        files_modified.add(filepath)

# ── Main ──
print("=" * 60)
print("PHASE 3: Fix compound bold-tag mismatches")
print("=" * 60)

target_files = sorted(glob.glob(os.path.join(GRAMMAR_DIR, "*-intermediate.js")) +
                      glob.glob(os.path.join(GRAMMAR_DIR, "*-upper-intermediate.js")) +
                      glob.glob(os.path.join(GRAMMAR_DIR, "*-advanced.js")))

# Deduplicate (upper-intermediate matched by *-intermediate too)
target_files = sorted(set(target_files))

print(f"Scanning {len(target_files)} files...\n")

for f in target_files:
    fix_file(f)

print(f"\n{'=' * 60}")
print(f"Fixed {fixed_count} questions in {len(files_modified)} files")
print("=" * 60)
