"""
Phase 4: Sync "Find the error" options with actual bold tags in question text.
After merging compound bold tags, options like "is" no longer match any <b>...</b>.
Fix: set all 4 options to the 4 bold spans, ensuring correct is among them.
Also handles the "has been knowing" 3-word compound.
"""
import os, re, glob

SITE = os.path.dirname(os.path.abspath(__file__))
GRAMMAR_DIR = os.path.join(SITE, "questions G")

fixed_count = 0
files_modified = set()

def get_field(block, field):
    m = re.search(rf'{field}:\s*"([^"]*)"', block)
    return m.group(1) if m else None

def get_options(block):
    m = re.search(r'options:\s*\[([^\]]*)\]', block)
    if not m: return []
    return re.findall(r'"([^"]*)"', m.group(1))

def get_bold_spans(text):
    return re.findall(r'<b>([^<]+)</b>', text)

def fix_file(filepath):
    global fixed_count, files_modified
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    original = content
    fname = os.path.basename(filepath)
    
    # Find all question blocks
    for match in re.finditer(r'\{([^{}]+)\}', content):
        block = match.group(0)
        qtype = get_field(block, 'type')
        if qtype != 'Find the error:':
            continue
        
        correct = get_field(block, 'correct')
        question = get_field(block, 'question')
        options = get_options(block)
        
        if not correct or not question or not options:
            continue
        
        bold_spans = get_bold_spans(question)
        
        # Check if all options and correct are in bold spans
        all_good = correct in bold_spans and all(o in bold_spans for o in options)
        if all_good:
            continue
        
        new_question = question
        new_correct = correct
        new_options = list(options)
        changed = False
        
        # Step 1: If correct is compound and not in bold, try to merge adjacent bolds
        if correct not in bold_spans:
            correct_words = correct.split()
            if len(correct_words) >= 2:
                # Build pattern: <b>w1</b> optional_text <b>w2</b> ...
                # Allow "been" or other words between bold tags
                parts = []
                for w in correct_words:
                    parts.append(rf'<b>{re.escape(w)}</b>')
                # Allow optional non-bold text between them
                merge_pat = r'[\s]*(?:[^<]*[\s]*)?'.join(parts)
                m = re.search(merge_pat, new_question)
                if m:
                    new_question = new_question[:m.start()] + f'<b>{correct}</b>' + new_question[m.end():]
                    changed = True
        
        # Step 2: Refresh bold spans
        bold_spans = get_bold_spans(new_question)
        
        # Step 3: If we now have exactly 4 bold spans, use them as options
        if len(bold_spans) == 4 and new_correct in bold_spans:
            new_options = list(bold_spans)
            changed = True
        elif len(bold_spans) >= 4 and new_correct in bold_spans:
            # Pick correct + 3 others from bold spans
            others = [b for b in bold_spans if b != new_correct][:3]
            new_options = [new_correct] + others
            changed = True
        elif len(bold_spans) < 4 and new_correct in bold_spans:
            # Not enough bold spans — fix options to use what we have
            new_options = []
            for b in bold_spans:
                new_options.append(b)
            # Pad with existing options that aren't duplicates
            for o in options:
                if o not in new_options and len(new_options) < 4:
                    new_options.append(o)
            changed = True
        
        if changed and len(new_options) == 4 and new_correct in new_options:
            new_block = block
            # Replace question
            new_block = new_block.replace(f'question: "{question}"', f'question: "{new_question}"')
            # Replace correct if changed
            if new_correct != correct:
                new_block = new_block.replace(f'correct: "{correct}"', f'correct: "{new_correct}"')
            # Replace options
            old_opts_match = re.search(r'options:\s*\[([^\]]*)\]', new_block)
            if old_opts_match:
                new_opts_str = 'options: [' + ', '.join(f'"{o}"' for o in new_options) + ']'
                new_block = new_block[:old_opts_match.start()] + new_opts_str + new_block[old_opts_match.end():]
            
            if new_block != block:
                content = content.replace(block, new_block, 1)
                fixed_count += 1
                print(f"  FIX [{fname}]: correct='{correct}' -> synced options with bold tags")
    
    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        files_modified.add(filepath)

# ── Main ──
print("=" * 60)
print("PHASE 4: Sync Find-the-error options with bold tags")
print("=" * 60)

target_files = sorted(set(
    glob.glob(os.path.join(GRAMMAR_DIR, "*-intermediate.js")) +
    glob.glob(os.path.join(GRAMMAR_DIR, "*-upper-intermediate.js")) +
    glob.glob(os.path.join(GRAMMAR_DIR, "*-advanced.js"))
))

print(f"Scanning {len(target_files)} files...\n")

for f in target_files:
    fix_file(f)

print(f"\n{'=' * 60}")
print(f"Fixed {fixed_count} questions in {len(files_modified)} files")
print("=" * 60)
