"""
Batch generate article header images using Gemini 2.5 Flash image generation.
Reads titles from articles_index.json, skips already-generated images.
Usage: python generate_article_images.py <start> <end>
  e.g. python generate_article_images.py 2 13
"""

import os
import sys
import json
import time
from google import genai
from google.genai import types

API_KEY = "AIzaSyA7fuFZpM3RsmkbO9gaSWDI0IzsEp6Uqf4"
client = genai.Client(api_key=API_KEY)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "questions Articles")
INDEX_PATH = os.path.join(SCRIPT_DIR, "articles_index.json")

# Load article index
with open(INDEX_PATH, "r", encoding="utf-8") as f:
    articles_index = json.load(f)

# Build lookup: num -> title
title_map = {a["num"]: a["title"] for a in articles_index}

def generate_image(num_int):
    padded = str(num_int).zfill(2) if num_int < 100 else str(num_int)
    # Match the format used in index (2-digit for <100, 3-digit for >=100)
    # Index uses: "01","02",...,"99","100",...,"220"
    if num_int < 10:
        key = f"0{num_int}"
    else:
        key = str(num_int)
    
    title = title_map.get(key)
    if not title:
        print(f"  [SKIP] No title found for article {key}")
        return False

    img_path = os.path.join(OUTPUT_DIR, f"article-{key}.png")
    if os.path.exists(img_path):
        size_kb = os.path.getsize(img_path) / 1024
        print(f"  [EXISTS] article-{key}.png ({size_kb:.1f} KB) - skipping")
        return True

    prompt = f"""Generate a clean, modern editorial illustration for an article titled "{title}".
The image should be:
- A wide banner/header image (landscape orientation, roughly 16:9 ratio)
- Clean, professional, magazine-quality style
- Relevant to the topic of {title}
- Visually appealing with a modern color palette
- No text or words in the image
- Suitable as an article header illustration
"""

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash-image",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_modalities=["TEXT", "IMAGE"]
                )
            )

            for part in response.candidates[0].content.parts:
                if part.inline_data is not None:
                    img_data = part.inline_data.data
                    with open(img_path, "wb") as f:
                        f.write(img_data)
                    size_kb = len(img_data) / 1024
                    print(f"  [OK] article-{key}.png ({size_kb:.1f} KB) - {title}")
                    return True

            print(f"  [WARN] No image data for article {key} (attempt {attempt+1})")
        except Exception as e:
            print(f"  [ERR] article {key} attempt {attempt+1}: {e}")
            time.sleep(5)

    print(f"  [FAIL] Could not generate image for article {key} after 3 attempts")
    return False


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python generate_article_images.py <start> <end>")
        sys.exit(1)

    start = int(sys.argv[1])
    end = int(sys.argv[2])
    
    print(f"\n=== Generating article images {start}-{end} ===\n")
    
    success = 0
    fail = 0
    skipped = 0
    
    for num in range(start, end + 1):
        padded = str(num).zfill(2) if num < 100 else str(num)
        key = f"0{num}" if num < 10 else str(num)
        img_path = os.path.join(OUTPUT_DIR, f"article-{key}.png")
        
        if os.path.exists(img_path):
            size_kb = os.path.getsize(img_path) / 1024
            print(f"  [EXISTS] article-{key}.png ({size_kb:.1f} KB)")
            skipped += 1
            continue
            
        result = generate_image(num)
        if result:
            success += 1
        else:
            fail += 1
        
        # Delay between API calls to avoid rate limiting
        if num < end:
            time.sleep(8)
    
    print(f"\n=== Done! Success: {success}, Skipped: {skipped}, Failed: {fail} ===\n")
