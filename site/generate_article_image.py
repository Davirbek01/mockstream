"""
Test: Generate an article image using Gemini 2.0 Flash image generation.
Saves to questions Articles/article-01.png
"""

import os
import base64
from google import genai
from google.genai import types

API_KEY = "AIzaSyA7fuFZpM3RsmkbO9gaSWDI0IzsEp6Uqf4"
client = genai.Client(api_key=API_KEY)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "questions Articles")

article_title = "Green Packaging"
article_num = 1

prompt = f"""Generate a clean, modern editorial illustration for an article titled "{article_title}".
The image should be:
- A wide banner/header image (landscape orientation, roughly 16:9 ratio)
- Clean, professional, magazine-quality style
- Relevant to the topic of {article_title}
- Visually appealing with a modern color palette
- No text or words in the image
- Suitable as an article header illustration
"""

print(f"Generating image for article {article_num}: {article_title}...")

try:
    response = client.models.generate_content(
        model="gemini-2.5-flash-image",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_modalities=["TEXT", "IMAGE"]
        )
    )

    # Check response parts for image data
    image_saved = False
    for part in response.candidates[0].content.parts:
        if part.inline_data is not None:
            img_data = part.inline_data.data
            mime = part.inline_data.mime_type
            ext = "png" if "png" in mime else "jpg"
            
            padded = str(article_num).zfill(2)
            img_path = os.path.join(OUTPUT_DIR, f"article-{padded}.png")
            
            with open(img_path, "wb") as f:
                f.write(img_data)
            
            size_kb = len(img_data) / 1024
            print(f"Image saved: {img_path} ({size_kb:.1f} KB)")
            image_saved = True
            break
        elif part.text:
            print(f"Text response: {part.text[:200]}")
    
    if not image_saved:
        print("No image data in response!")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
