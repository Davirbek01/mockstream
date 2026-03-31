"""
Generate pre-baked article passage audio using ElevenLabs TTS.
Reads passage HTML from each article JS file, strips HTML to plain text,
generates audio via ElevenLabs TTS (MP3), and saves to questions Articles/audio/.

Usage:
  python generate_article_audio.py              # Generate for all articles (1-220)
  python generate_article_audio.py 1            # Generate for article 1 only
  python generate_article_audio.py 1 50         # Generate for articles 1-50
  python generate_article_audio.py --force 1 50 # Overwrite existing files
"""

import os
import sys
import re
import time
import json
import subprocess
import requests

ELEVENLABS_API_KEY = "sk_fbb9e76dca02b8252c1ca98fa4e64e4ff52251869cac3ef6"
ELEVENLABS_VOICE_ID = "onwK4e9ZLuTAKqWW03F9"  # Daniel - British male
ELEVENLABS_MODEL = "eleven_multilingual_v2"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ARTICLES_DIR = os.path.join(SCRIPT_DIR, "questions Articles")
AUDIO_DIR = os.path.join(ARTICLES_DIR, "audio")

FORCE_OVERWRITE = False


def get_article_num_str(num):
    """Return zero-padded article number string matching file naming."""
    return str(num).zfill(2) if num <= 99 else str(num)


def extract_plain_text(article_num):
    """Extract plain text from article passage by loading the JS file with Node."""
    num_str = get_article_num_str(article_num)
    rel_path = f"questions Articles/article-{num_str}.js"
    
    # Use Node.js to parse the JS and extract plain text
    node_code = (
        f'global.window = {{}}; '
        f'require("./{ rel_path }"); '
        f'const html = window.ARTICLE_DATA.passage; '
        f'const text = html.replace(/<[^>]+>/g, " ").replace(/\\s+/g, " ").trim(); '
        f'console.log(text);'
    )
    
    result = subprocess.run(
        ['node', '-e', node_code],
        capture_output=True, text=True, timeout=10,
        cwd=SCRIPT_DIR
    )
    
    if result.returncode != 0:
        print(f"  [ERROR] Could not extract text from article {num_str}: {result.stderr.strip()[-200:]}")
        return None
    
    return result.stdout.strip()


def generate_audio(text, output_path):
    """Generate TTS audio using ElevenLabs and save as MP3."""
    if os.path.exists(output_path) and not FORCE_OVERWRITE:
        size_kb = os.path.getsize(output_path) / 1024
        print(f"  [EXISTS] {os.path.basename(output_path)} ({size_kb:.1f} KB) - skipping")
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
            response = requests.post(url, json=payload, headers=headers, timeout=180)

            if response.status_code == 200:
                with open(output_path, "wb") as f:
                    f.write(response.content)
                size_kb = os.path.getsize(output_path) / 1024
                print(f"  [OK] {os.path.basename(output_path)} ({size_kb:.1f} KB, {len(text):,} chars)")
                return True
            elif response.status_code == 429:
                wait = 15 * (attempt + 1)
                print(f"  [RATE LIMIT] Waiting {wait}s...")
                time.sleep(wait)
            elif response.status_code == 401:
                print(f"  [QUOTA EXHAUSTED] API returned 401 - likely out of credits")
                return "quota_exhausted"
            else:
                error_text = response.text[:300]
                print(f"  [HTTP {response.status_code}] {error_text}")
                # Check for quota-related errors
                if "quota" in error_text.lower() or "limit" in error_text.lower() or "exceeded" in error_text.lower():
                    return "quota_exhausted"
                if attempt < max_retries - 1:
                    time.sleep(5)
                else:
                    return False

        except requests.exceptions.Timeout:
            print(f"  [TIMEOUT] Attempt {attempt + 1}/{max_retries}")
            if attempt < max_retries - 1:
                time.sleep(10)
            else:
                return False
        except Exception as e:
            print(f"  [ERROR] {e}")
            if attempt < max_retries - 1:
                time.sleep(5)
            else:
                return False

    return False


def main():
    global FORCE_OVERWRITE

    args = [a for a in sys.argv[1:] if a != "--force"]
    if "--force" in sys.argv:
        FORCE_OVERWRITE = True
        print("[MODE] Force overwrite enabled")

    # Determine range
    start_num = 1
    end_num = 220

    if len(args) >= 1:
        start_num = int(args[0])
    if len(args) >= 2:
        end_num = int(args[1])

    # Create audio directory
    os.makedirs(AUDIO_DIR, exist_ok=True)

    print(f"\n{'='*60}")
    print(f"  ElevenLabs Article Audio Generator")
    print(f"  Articles: {start_num} to {end_num}")
    print(f"  Voice: Daniel ({ELEVENLABS_VOICE_ID})")
    print(f"  Model: {ELEVENLABS_MODEL}")
    print(f"  Output: {AUDIO_DIR}")
    print(f"{'='*60}\n")

    total_chars = 0
    generated = 0
    skipped = 0
    failed = 0

    for num in range(start_num, end_num + 1):
        num_str = get_article_num_str(num)
        output_path = os.path.join(AUDIO_DIR, f"article-{num_str}.mp3")

        print(f"\nArticle {num_str}:")

        # Check if already exists
        if os.path.exists(output_path) and not FORCE_OVERWRITE:
            size_kb = os.path.getsize(output_path) / 1024
            print(f"  [EXISTS] {os.path.basename(output_path)} ({size_kb:.1f} KB) - skipping")
            skipped += 1
            continue

        # Extract text
        text = extract_plain_text(num)
        if not text:
            failed += 1
            continue

        char_count = len(text)
        total_chars += char_count
        print(f"  Passage: {char_count:,} characters")

        # Generate audio
        result = generate_audio(text, output_path)

        if result == "quota_exhausted":
            print(f"\n{'='*60}")
            print(f"  QUOTA EXHAUSTED - Stopping generation")
            print(f"  Last attempted: Article {num_str}")
            print(f"  Generated: {generated} articles")
            print(f"  Total chars used: {total_chars:,}")
            print(f"{'='*60}")
            break
        elif result:
            generated += 1
            # Brief pause between requests to be respectful
            time.sleep(1)
        else:
            failed += 1
            print(f"  [FAILED] Article {num_str}")

    print(f"\n{'='*60}")
    print(f"  GENERATION COMPLETE")
    print(f"  Generated: {generated}")
    print(f"  Skipped (existing): {skipped}")
    print(f"  Failed: {failed}")
    print(f"  Total characters sent: {total_chars:,}")
    print(f"{'='*60}")

    # List all generated audio files
    if os.path.exists(AUDIO_DIR):
        audio_files = sorted([f for f in os.listdir(AUDIO_DIR) if f.endswith('.mp3') and f.startswith('article-')])
        print(f"\n  Audio files in {AUDIO_DIR}: {len(audio_files)}")


if __name__ == "__main__":
    main()
