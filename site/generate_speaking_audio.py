"""
Generate pre-baked speaking question audio using ElevenLabs TTS.
Reads question prompts from CEFR or IELTS speaking mock data files,
generates audio via ElevenLabs TTS (MP3), and auto-injects
audioFile paths into the JS data files.

Usage:
  python generate_speaking_audio.py cefr 1        # Generate for CEFR mock 1
  python generate_speaking_audio.py cefr 1 5      # Generate for CEFR mocks 1-5
  python generate_speaking_audio.py ielts 1       # Generate for IELTS mock 1
  python generate_speaking_audio.py ielts 1 10    # Generate for IELTS mocks 1-10
"""

import os
import sys
import re
import time
import requests

ELEVENLABS_API_KEY = "sk_fbb9e76dca02b8252c1ca98fa4e64e4ff52251869cac3ef6"
# Daniel - British male voice, good for examiner
ELEVENLABS_VOICE_ID = "onwK4e9ZLuTAKqWW03F9"
ELEVENLABS_MODEL = "eleven_multilingual_v2"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


def get_question_file(exam_type, mock_num):
    """Return the path to the question JS file."""
    if exam_type == "cefr":
        folder = os.path.join(SCRIPT_DIR, "questions S")
        if mock_num == 1:
            return os.path.join(folder, "questions.js")
        else:
            return os.path.join(folder, f"questions{mock_num:02d}.js")
    else:  # ielts
        folder = os.path.join(SCRIPT_DIR, "questions IELTS S")
        return os.path.join(folder, f"ielts-speaking-mock-{mock_num}.js")


def get_audio_rel_path(exam_type, mock_num, q_num):
    """Return the relative audioFile path for injection into JS."""
    if exam_type == "cefr":
        return f"questions S/audio/cefr-speaking-mock-{mock_num:02d}-q{q_num}.mp3"
    else:
        return f"questions IELTS S/audio/ielts-speaking-mock-{mock_num:02d}-q{q_num}.mp3"


def extract_questions_from_js(filepath, exam_type):
    """Parse the JS file and extract question prompts + metadata."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    questions = []

    number_matches = list(re.finditer(r'"number"\s*:\s*(\d+)', content))
    prompt_matches = list(re.finditer(r'"prompt"\s*:\s*"([^"]*)"', content))
    part_matches = list(re.finditer(r'"part"\s*:\s*"([^"]*)"', content))

    # Also get bulletPoints for Part 2 questions
    bullet_sections = list(re.finditer(
        r'"bulletPoints"\s*:\s*\[(.*?)\]', content, re.DOTALL
    ))

    # Also detect debate questions (CEFR Part 3)
    debate_sections = list(re.finditer(r'"debatePoints"\s*:', content))

    # Build position maps
    q_positions = {}
    for m in number_matches:
        q_num = int(m.group(1))
        q_positions[q_num] = m.start()

    part_positions = {}
    for m in part_matches:
        part_positions[m.start()] = m.group(1)

    for i, pm in enumerate(prompt_matches):
        prompt_text = pm.group(1)
        prompt_pos = pm.start()

        # Find which question number this prompt belongs to
        q_num = None
        for num, pos in sorted(q_positions.items()):
            if pos < prompt_pos:
                q_num = num
        if q_num is None:
            q_num = i + 1

        # Find the part for this question
        q_part = ""
        for pos, part in sorted(part_positions.items()):
            if pos < prompt_pos:
                q_part = part

        # Get bullet points if nearby
        bullets = []
        for bs in bullet_sections:
            if abs(bs.start() - prompt_pos) < 2000:
                bullets = re.findall(r'"([^"]+)"', bs.group(1))

        # Check if debate question (CEFR Part 3)
        is_debate = any(abs(ds.start() - prompt_pos) < 2000 for ds in debate_sections)

        # Build speak text matching the HTML page logic
        if exam_type == "cefr":
            if bullets and q_num == 7:
                # Skip first bullet if it duplicates the prompt
                filtered_bullets = [b for b in bullets if b.strip().rstrip('.') != prompt_text.strip().rstrip('.')]
                bullet_text = ". ".join(filtered_bullets)
                speak_text = f"{prompt_text}. {bullet_text}. You have one minute to prepare."
            elif is_debate and q_num == 8:
                speak_text = f"{prompt_text}. Discuss both sides and give your opinion. You have one minute to prepare."
            else:
                speak_text = prompt_text
        else:  # ielts
            if q_part == "Part 2" and bullets:
                speak_text = f"{prompt_text}. You should say: {'. '.join(bullets)}."
            else:
                speak_text = prompt_text

        questions.append({
            "number": q_num,
            "part": q_part,
            "prompt": prompt_text,
            "speak_text": speak_text,
        })

    return questions


def inject_audio_files_into_js(filepath, exam_type, mock_num, question_numbers):
    """Auto-inject audioFile fields into the question JS data file."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    modified = False
    for q_num in question_numbers:
        rel_path = get_audio_rel_path(exam_type, mock_num, q_num)

        # Check if audioFile already exists for this question
        # Look for "number": N ... "audioFile" pattern within the same question block
        pattern = rf'("number"\s*:\s*{q_num}\s*,)'
        match = re.search(pattern, content)
        if not match:
            continue

        # Check if audioFile already exists after this number (within ~500 chars)
        after = content[match.end():match.end() + 500]
        if '"audioFile"' in after:
            # Update existing audioFile path if it's a .wav reference
            old_pattern = rf'("number"\s*:\s*{q_num}\s*,.*?"audioFile"\s*:\s*)"[^"]*"'
            new_content = re.sub(old_pattern, rf'\1"{rel_path}"', content, count=1, flags=re.DOTALL)
            if new_content != content:
                content = new_content
                modified = True
            continue

        # Insert audioFile after "prompt": "..." line for this question
        # Find the prompt line for this question number
        q_start = match.start()
        # Find the next "prompt": after the number
        prompt_match = re.search(r'"prompt"\s*:\s*"[^"]*"', content[q_start:])
        if prompt_match:
            insert_pos = q_start + prompt_match.end()
            # Add audioFile field after the prompt
            indent = '      '  # match existing indentation
            insertion = f',\n{indent}"audioFile": "{rel_path}"'
            content = content[:insert_pos] + insertion + content[insert_pos:]
            modified = True

    if modified:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"    [INJECT] Updated {filepath}")
    else:
        print(f"    [INJECT] No changes needed for {filepath}")


FORCE_OVERWRITE = False
ONLY_Q = None  # If set, only generate this question number


def generate_audio(text, output_path):
    """Generate TTS audio using ElevenLabs and save as MP3."""
    if os.path.exists(output_path) and not FORCE_OVERWRITE:
        size_kb = os.path.getsize(output_path) / 1024
        print(f"    [EXISTS] {os.path.basename(output_path)} ({size_kb:.1f} KB) - skipping")
        return True

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }
    payload = {
        "text": text,
        "model_id": ELEVENLABS_MODEL,
        "voice_settings": {
            "stability": 0.6,
            "similarity_boost": 0.75,
            "style": 0.2,
        },
    }

    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=120)

            if response.status_code == 200:
                with open(output_path, "wb") as f:
                    f.write(response.content)

                size_kb = os.path.getsize(output_path) / 1024
                print(f"    [OK] {os.path.basename(output_path)} ({size_kb:.1f} KB)")
                return True
            elif response.status_code == 429:
                wait = 10 * (attempt + 1)
                print(f"    [RATE LIMIT] Waiting {wait}s...")
                time.sleep(wait)
            else:
                print(f"    [HTTP {response.status_code}] {response.text[:200]}")
                if attempt < max_retries - 1:
                    time.sleep(5)
                else:
                    return False

        except Exception as e:
            if attempt < max_retries - 1:
                wait = 5 * (attempt + 1)
                print(f"    [RETRY {attempt+1}/{max_retries}] {e} — waiting {wait}s...")
                time.sleep(wait)
            else:
                print(f"    [ERROR] {e}")
                return False


def process_mock(exam_type, mock_num):
    """Generate all question audio files for one mock, then inject audioFile into JS."""
    js_path = get_question_file(exam_type, mock_num)
    if not os.path.exists(js_path):
        print(f"  [SKIP] File not found: {js_path}")
        return

    if exam_type == "cefr":
        out_folder = os.path.join(SCRIPT_DIR, "questions S", "audio")
        mock_prefix = f"cefr-speaking-mock-{mock_num:02d}"
    else:
        out_folder = os.path.join(SCRIPT_DIR, "questions IELTS S", "audio")
        mock_prefix = f"ielts-speaking-mock-{mock_num:02d}"

    os.makedirs(out_folder, exist_ok=True)

    print(f"\n{'='*60}")
    print(f"  Processing: {exam_type.upper()} Speaking Mock {mock_num}")
    print(f"  Source: {os.path.basename(js_path)}")
    print(f"  Output: {out_folder}")
    print(f"{'='*60}")

    questions = extract_questions_from_js(js_path, exam_type)
    if not questions:
        print("  [WARN] No questions found!")
        return

    print(f"  Found {len(questions)} questions\n")

    success = 0
    generated_q_nums = []
    for q in questions:
        if ONLY_Q is not None and q['number'] != ONLY_Q:
            continue
        filename = f"{mock_prefix}-q{q['number']}.mp3"
        output_path = os.path.join(out_folder, filename)

        print(f"  Q{q['number']}: \"{q['speak_text'][:80]}{'...' if len(q['speak_text']) > 80 else ''}\"")
        if generate_audio(q["speak_text"], output_path):
            success += 1
            generated_q_nums.append(q["number"])

        # Delay between API calls to avoid rate limiting
        time.sleep(2)

    print(f"\n  Audio: {success}/{len(questions)} files generated.")

    # Auto-inject audioFile paths into the JS data file
    if generated_q_nums:
        inject_audio_files_into_js(js_path, exam_type, mock_num, generated_q_nums)

    print(f"  Mock {mock_num} complete!\n")


def main():
    global FORCE_OVERWRITE, ONLY_Q

    # Parse flags
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    flags = [a for a in sys.argv[1:] if a.startswith('--')]
    for flag in flags:
        if flag == '--force':
            FORCE_OVERWRITE = True
        elif flag.startswith('--only-q='):
            ONLY_Q = int(flag.split('=')[1])

    if len(args) < 2:
        print(__doc__)
        sys.exit(1)

    exam_type = args[0].lower()
    if exam_type not in ("cefr", "ielts"):
        print("Error: exam_type must be 'cefr' or 'ielts'")
        sys.exit(1)

    start = int(args[1])
    end = int(args[2]) if len(args) > 2 else start

    if FORCE_OVERWRITE:
        print("[MODE] Force overwrite enabled")
    if ONLY_Q is not None:
        print(f"[MODE] Only generating Q{ONLY_Q}")

    for mock_num in range(start, end + 1):
        process_mock(exam_type, mock_num)
        # Extra delay between mocks to avoid rate limiting
        if mock_num < end:
            print("  Waiting 5s before next mock...")
            time.sleep(5)


if __name__ == "__main__":
    main()
