"""
Annotate B1 and B2 speaking samples with ml-token vocabulary highlighting.
Adds <span class="ml-token {category}"> around notable vocabulary in sampleB1/sampleB2 fields.
"""
import os, re, glob

# ──────────────────────────────────────────────────────────
# VOCABULARY LISTS  (longest phrases first within each list)
# ──────────────────────────────────────────────────────────

ADV_MARKERS = [
    # Multi-word discourse markers
    "On the other hand", "From my point of view", "As far as I know",
    "Having said that", "That being said", "To be honest",
    "Not to mention", "On top of that", "Apart from that",
    "As a consequence", "Last but not least", "To begin with",
    "In my opinion", "For example", "For instance", "In addition",
    "As a result", "In other words", "In particular", "To some extent",
    "In contrast", "In terms of", "When it comes to",
    # Single-word discourse markers & sentence adverbs
    "Actually", "Additionally", "Admittedly", "Alternatively", "Apparently",
    "Basically", "Besides", "Certainly", "Clearly", "Consequently",
    "Conversely", "Definitely", "Especially", "Essentially", "Eventually",
    "Firstly", "Fortunately", "Furthermore", "Generally",
    "Hence", "However", "Ideally", "Importantly", "Increasingly",
    "Indeed", "Interestingly", "Meanwhile", "Moreover", "Naturally",
    "Nevertheless", "Nonetheless", "Notably", "Obviously", "Otherwise",
    "Overall", "Particularly", "Personally", "Presumably",
    "Primarily", "Secondly", "Significantly", "Similarly",
    "Specifically", "Surprisingly", "Therefore", "Thirdly",
    "Thus", "Typically", "Ultimately", "Undeniably", "Undoubtedly",
    "Unfortunately", "Whereas",
]

COLLOCATIONS = [
    # Multi-word collocations (longer first)
    "a wide range of", "a great deal of", "a wide variety of",
    "play a crucial role", "play an important role", "play a significant role",
    "standard of living", "work-life balance", "sense of accomplishment",
    "sense of fulfillment", "sense of community", "sense of belonging",
    "cost of living", "peace of mind", "quality of life",
    "social interaction", "critical thinking", "physical activity",
    "carbon footprint", "broader perspective", "global perspective",
    "informed decision", "personal growth", "personal development",
    "different cultures", "diverse cultures", "various aspects",
    "climate change", "daily routine", "daily basis",
    "balanced diet", "wide variety", "vast majority",
    "significant impact", "lasting impact", "positive impact",
    "negative impact", "profound impact", "direct impact",
    "crucial role", "vital role", "significant role",
    "important role", "essential part", "integral part",
    "key factor", "key role", "key advantage",
    "main reason", "primary reason", "main advantage",
    "mental health", "social media", "public transport",
    "quality time", "comfort zone", "time management",
    "healthy lifestyle", "healthy diet", "balanced lifestyle",
    "intimate atmosphere", "relaxed atmosphere", "lively atmosphere",
    "thought-provoking", "well-rounded", "well-balanced",
    "cost-effective", "fast-paced", "open-minded",
    "pros and cons", "trial and error", "ups and downs",
    "global issues", "social aspect", "social skills",
    "real time-saver", "time-saver",
]

PHRASAL_VERBS = [
    # Multi-word phrasal verbs (longer first)
    "look forward to", "keep up with", "come to terms with",
    "get along with", "catch up with", "put up with",
    "come up with", "make up for", "run out of",
    "get rid of", "take care of", "make the most of",
    "come across", "figure out", "find out", "work out",
    "turn out", "point out", "stand out", "carry out",
    "bring out", "check out", "sort out", "rule out",
    "look into", "look after", "look back",
    "set up", "give up", "take up", "pick up", "end up",
    "grow up", "bring up", "put off", "set off",
    "carry on", "move on", "rely on", "depend on",
    "go through", "break down", "make up", "get over",
    "cope with", "deal with", "interact with",
    "contribute to", "benefit from", "result in",
    "gravitate towards", "tend to gravitate",
]

# ──────────────────────────────────────────────────────────
# HTML PROCESSING
# ──────────────────────────────────────────────────────────

def split_html(html):
    """Split HTML into (type, content) tuples: 'tag' or 'text'."""
    segments = []
    pos = 0
    for m in re.finditer(r'<[^>]+>', html):
        if m.start() > pos:
            segments.append(('text', html[pos:m.start()]))
        segments.append(('tag', m.group()))
        pos = m.end()
    if pos < len(html):
        segments.append(('text', html[pos:]))
    return segments


def annotate_text_segment(text, patterns):
    """
    Apply vocabulary patterns to a plain-text segment.
    Uses placeholder tokens to prevent re-matching inside already-wrapped text.
    """
    placeholders = []

    for phrase, css_class in patterns:
        escaped = re.escape(phrase)
        regex = re.compile(r'\b(' + escaped + r')\b', re.IGNORECASE)

        def _replacer(m, cls=css_class, phs=placeholders):
            idx = len(phs)
            phs.append(
                f'<span class="ml-token {cls}">{m.group(1)}</span>'
            )
            return f'\x01PH{idx}\x01'

        text = regex.sub(_replacer, text)

    # Restore placeholders
    for i, repl in enumerate(placeholders):
        text = text.replace(f'\x01PH{i}\x01', repl)
    return text


def annotate_html(html):
    """Add ml-token spans to notable vocabulary in an HTML string."""
    # Build master pattern list sorted by phrase length DESC
    patterns = (
        [(p, 'adv')     for p in ADV_MARKERS] +
        [(p, 'colloc')  for p in COLLOCATIONS] +
        [(p, 'phrasal') for p in PHRASAL_VERBS]
    )
    patterns.sort(key=lambda x: len(x[0]), reverse=True)

    segments = split_html(html)
    result = []
    for seg_type, content in segments:
        if seg_type == 'text':
            result.append(annotate_text_segment(content, patterns))
        else:
            result.append(content)
    return ''.join(result)


# ──────────────────────────────────────────────────────────
# FILE PROCESSING
# ──────────────────────────────────────────────────────────

SAMPLE_RE = re.compile(r'"(sampleB[12])"\s*:\s*"((?:[^"\\]|\\.)*)"')


def unescape_js(s):
    """Unescape a JS string literal value."""
    return (s
        .replace('\\\\', '\x00BKSL\x00')
        .replace('\\"', '"')
        .replace('\\n', '\n')
        .replace('\\t', '\t')
        .replace('\x00BKSL\x00', '\\'))


def escape_js(s):
    """Re-escape a string for a JS string literal."""
    return (s
        .replace('\\', '\\\\')
        .replace('"', '\\"')
        .replace('\n', '\\n')
        .replace('\t', '\\t'))


def process_file(filepath):
    """Process a single question JS file. Returns (modified, stats) tuple."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    stats = {'b1': 0, 'b2': 0}
    modified = False

    def replacer(m):
        nonlocal modified
        key = m.group(1)        # "sampleB1" or "sampleB2"
        raw = m.group(2)        # escaped JS string content

        html = unescape_js(raw)

        # Skip if already annotated
        if 'ml-token' in html:
            return m.group(0)

        annotated = annotate_html(html)

        if annotated != html:
            modified = True
            level = 'b1' if key == 'sampleB1' else 'b2'
            stats[level] += 1
            return f'"{key}": "{escape_js(annotated)}"'
        return m.group(0)

    content = SAMPLE_RE.sub(replacer, content)

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

    return modified, stats


def main():
    folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'questions S')
    files = sorted(glob.glob(os.path.join(folder, 'questions*.js')))
    print(f'Found {len(files)} question files in {folder}\n')

    total_b1 = 0
    total_b2 = 0
    modified_files = 0

    for fp in files:
        name = os.path.basename(fp)
        was_modified, stats = process_file(fp)
        if was_modified:
            modified_files += 1
            total_b1 += stats['b1']
            total_b2 += stats['b2']
            print(f'  ✓ {name}: B1={stats["b1"]}, B2={stats["b2"]}')
        else:
            print(f'  – {name}: no changes')

    print(f'\nDone! Modified {modified_files} files.')
    print(f'  B1 samples annotated: {total_b1}')
    print(f'  B2 samples annotated: {total_b2}')
    print(f'  Total: {total_b1 + total_b2}')


if __name__ == '__main__':
    main()
