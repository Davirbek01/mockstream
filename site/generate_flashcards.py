"""
Generate flashcard JS files using Gemini API.
Topics inspired by Oxford Word Skills Advanced themes.
Each set: 30 cards with collocations, phrases, phrasal verbs.
"""

import json
import time
import re
import os
import google.generativeai as genai

API_KEY = "AIzaSyA7fuFZpM3RsmkbO9gaSWDI0IzsEp6Uqf4"
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

TOPICS = [
    {
        "file": "war-conflict01",
        "title": "💣 War & Conflict",
        "icon": "💣",
        "prompt_topic": "War and Conflict — the kind of advanced collocations, phrasal verbs, and word combinations you would find in 'Oxford Word Skills Advanced' by Ruth Gairns & Stuart Redman. Include expressions like 'declare war on', 'a ceasefire agreement', 'be caught in the crossfire', 'wage a campaign against', 'a peace accord', 'inflict heavy casualties'. Focus on military operations, diplomacy, refugees, civil war, arms trade, peacekeeping, collateral damage."
    },
    {
        "file": "nature-wildlife01",
        "title": "🦁 Nature & Wildlife",
        "icon": "🦁",
        "prompt_topic": "Nature and Wildlife — the kind of advanced collocations, phrasal verbs, and word combinations you would find in 'Oxford Word Skills Advanced' by Ruth Gairns & Stuart Redman. Include expressions like 'an endangered species', 'a breeding ground for', 'in the wild', 'the balance of nature', 'a wildlife sanctuary', 'on the brink of extinction'. Focus on ecosystems, biodiversity, poaching, habitats, migration, conservation efforts, natural wonders."
    },
    {
        "file": "appearance-beauty01",
        "title": "💄 Appearance & Beauty",
        "icon": "💄",
        "prompt_topic": "Appearance and Beauty — the kind of advanced collocations, phrasal verbs, and word combinations you would find in 'Oxford Word Skills Advanced' by Ruth Gairns & Stuart Redman. Include expressions like 'be the spitting image of', 'look one's age', 'a striking resemblance to', 'age gracefully', 'beauty is skin deep', 'put on a brave face'. Focus on physical features, beauty standards, cosmetic surgery, body image, self-esteem, grooming, attractiveness."
    },
    {
        "file": "science-discovery01",
        "title": "🔬 Science & Discovery",
        "icon": "🔬",
        "prompt_topic": "Science and Discovery — the kind of advanced collocations, phrasal verbs, and word combinations you would find in 'Oxford Word Skills Advanced' by Ruth Gairns & Stuart Redman. Include expressions like 'a groundbreaking discovery', 'conduct an experiment', 'a scientific breakthrough', 'put a theory to the test', 'peer-reviewed research', 'push the boundaries of knowledge'. Focus on research methods, laboratory work, hypothesis testing, Nobel Prize, space exploration, genetics, innovation."
    },
    {
        "file": "cooking-recipes01",
        "title": "👨‍🍳 Cooking & Recipes",
        "icon": "👨‍🍳",
        "prompt_topic": "Cooking and Recipes — the kind of advanced collocations, phrasal verbs, and word combinations you would find in 'Oxford Word Skills Advanced' by Ruth Gairns & Stuart Redman. Include expressions like 'cook something from scratch', 'a mouth-watering dish', 'follow a recipe to the letter', 'simmer on a low heat', 'a culinary masterpiece', 'whip up a quick meal'. Focus on kitchen techniques, ingredients, flavours, baking, gourmet cuisine, comfort food, food presentation."
    },
    {
        "file": "volunteering-charity01",
        "title": "🤲 Volunteering & Charity",
        "icon": "🤲",
        "prompt_topic": "Volunteering and Charity — the kind of advanced collocations, phrasal verbs, and word combinations you would find in 'Oxford Word Skills Advanced' by Ruth Gairns & Stuart Redman. Include expressions like 'donate to a worthy cause', 'a charitable organisation', 'give something back to the community', 'raise funds for', 'a volunteer worker', 'make a difference in someone's life'. Focus on philanthropy, community service, humanitarian aid, fundraising events, altruism, non-profit organisations, social responsibility."
    },
    {
        "file": "art-creativity01",
        "title": "🎨 Art & Creativity",
        "icon": "🎨",
        "prompt_topic": "Art and Creativity — the kind of advanced collocations, phrasal verbs, and word combinations you would find in 'Oxford Word Skills Advanced' by Ruth Gairns & Stuart Redman. Include expressions like 'a work of art', 'a creative outlet', 'push creative boundaries', 'a prolific artist', 'an art exhibition', 'draw inspiration from'. Focus on painting, sculpture, galleries, artistic expression, contemporary art, craft, visual arts, aesthetic appreciation."
    },
    {
        "file": "addiction-dependency01",
        "title": "🚬 Addiction & Dependency",
        "icon": "🚬",
        "prompt_topic": "Addiction and Dependency — the kind of advanced collocations, phrasal verbs, and word combinations you would find in 'Oxford Word Skills Advanced' by Ruth Gairns & Stuart Redman. Include expressions like 'kick a habit', 'be hooked on something', 'a recovering addict', 'go cold turkey', 'a substance abuse problem', 'fall off the wagon'. Focus on drug abuse, alcohol dependency, gambling addiction, rehabilitation, withdrawal symptoms, support groups, prevention."
    },
    {
        "file": "negotiation-diplomacy01",
        "title": "🤝 Negotiation & Diplomacy",
        "icon": "🕊️",
        "prompt_topic": "Negotiation and Diplomacy — the kind of advanced collocations, phrasal verbs, and word combinations you would find in 'Oxford Word Skills Advanced' by Ruth Gairns & Stuart Redman. Include expressions like 'reach a compromise', 'drive a hard bargain', 'come to the negotiating table', 'break the deadlock', 'a diplomatic incident', 'smooth things over'. Focus on conflict resolution, trade deals, international relations, mediation, bargaining power, peace talks, mutual agreement."
    },
    {
        "file": "cinema-film01",
        "title": "🎬 Cinema & Film",
        "icon": "🎬",
        "prompt_topic": "Cinema and Film — the kind of advanced collocations, phrasal verbs, and word combinations you would find in 'Oxford Word Skills Advanced' by Ruth Gairns & Stuart Redman. Include expressions like 'a box-office hit', 'steal the show', 'a critically acclaimed film', 'be typecast as', 'a star-studded cast', 'give an Oscar-worthy performance'. Focus on movie genres, directing, screenwriting, film festivals, special effects, streaming platforms, cinematic techniques."
    }
]

PROMPT_TEMPLATE = """You are creating vocabulary flashcards modeled on the style and approach of "Oxford Word Skills Advanced" by Ruth Gairns and Stuart Redman (Oxford University Press).

This book is known for:
- Teaching vocabulary through COLLOCATIONS, PHRASAL VERBS, and WORD COMBINATIONS, not single words
- Emphasizing productive word skills — how words combine and function in real use
- Including word formation patterns (prefixes, suffixes, compounds) as multi-word entries
- Using authentic, natural example sentences from real-world contexts
- Grouping vocabulary thematically with a focus on how words work together
- Covering C1-C2 (Advanced to Proficiency) level language
- Definitions that are clear, precise, and learner-friendly

Topic: {topic}

Generate EXACTLY 30 flashcard entries as a JSON array. Each entry must be:
- A COLLOCATION, PHRASE, FIXED EXPRESSION, PHRASAL VERB, or COMPOUND EXPRESSION (never a single standalone word)
- At advanced level (C1-C2), the kind of expression that would appear in a Cambridge Advanced, IELTS 7+, or Oxford exam
- Practical, high-frequency in educated native-speaker English
- In the same spirit as Gairns & Redman's approach: productive word skills, authentic combinations, thematically coherent

Each entry must have these exact fields:
- "term": the collocation/phrase/phrasal verb (lowercase, no period at end)
- "en": a clear, concise English definition in the style of a learner dictionary (no period at end)
- "uz": Uzbek translation (natural Uzbek, not word-for-word)
- "ex": a natural example sentence using the term — should sound like it comes from a newspaper, academic text, or educated conversation
- "exUz": the Uzbek translation of that example sentence

IMPORTANT RULES:
1. Every "term" MUST be a multi-word expression. NO single words whatsoever.
2. Prefer collocations (adjective+noun, verb+noun, adverb+adjective) and phrasal verbs over simple phrases.
3. Definitions should be clear and concise — one sentence, no jargon.
4. Example sentences should demonstrate the term in a realistic, natural context.
5. Uzbek translations should be natural Uzbek, not literal word-by-word translations.
6. All 30 entries must be DIFFERENT — no duplicates or near-duplicates.
7. Do NOT include any term that is a single word (e.g. "negotiate" alone is NOT allowed, but "enter into negotiations" IS).
8. Return ONLY a valid JSON array, no markdown, no explanation, no code fences.

Example format:
[
  {{
    "term": "burst into tears",
    "en": "to suddenly start crying",
    "uz": "ko'z yoshini to'kib yig'lab yubormoq",
    "ex": "She burst into tears when she heard the tragic news.",
    "exUz": "U fojiali xabarni eshitganida ko'z yoshini to'kib yig'lab yubordi."
  }}
]

Now generate exactly 30 entries for the topic described above. Return ONLY the JSON array."""


def clean_json_response(text):
    """Extract JSON array from Gemini response, handling markdown fences."""
    text = text.strip()
    # Remove markdown code fences if present
    if text.startswith("```"):
        text = re.sub(r'^```(?:json)?\s*\n?', '', text)
        text = re.sub(r'\n?```\s*$', '', text)
    text = text.strip()
    return text


def generate_flashcard_set(topic_info):
    """Call Gemini API and return parsed cards."""
    prompt = PROMPT_TEMPLATE.format(topic=topic_info["prompt_topic"])
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = model.generate_content(prompt)
            raw = response.text
            cleaned = clean_json_response(raw)
            cards = json.loads(cleaned)
            
            if not isinstance(cards, list):
                print(f"  WARNING: Response is not a list, retrying...")
                continue
            
            # Validate all cards have required fields
            valid_cards = []
            for card in cards:
                if all(k in card for k in ("term", "en", "uz", "ex", "exUz")):
                    valid_cards.append(card)
                else:
                    print(f"  WARNING: Skipping card missing fields: {card.get('term', '???')}")
            
            if len(valid_cards) < 25:
                print(f"  WARNING: Only {len(valid_cards)} valid cards, retrying...")
                continue
                
            return valid_cards[:30]
            
        except json.JSONDecodeError as e:
            print(f"  JSON parse error (attempt {attempt+1}): {e}")
            if attempt < max_retries - 1:
                time.sleep(3)
            continue
        except Exception as e:
            print(f"  API error (attempt {attempt+1}): {e}")
            if attempt < max_retries - 1:
                time.sleep(5)
            continue
    
    return None


def escape_js_string(s):
    """Escape a string for use inside JS double quotes."""
    return s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')


def write_flashcard_js(topic_info, cards):
    """Write the flashcard JS file."""
    filename = f"flashcards/{topic_info['file']}.js"
    
    lines = []
    lines.append(f'// Flashcard Data: {topic_info["title"].split(" ", 1)[-1] if " " in topic_info["title"] else topic_info["title"]} (C1–C2)')
    lines.append('// Generated from advanced-level collocations, phrases & phrasal verbs')
    lines.append('')
    lines.append('window.FLASHCARD_DATA = {')
    lines.append(f'    title: "{escape_js_string(topic_info["title"])}",')
    lines.append('    cards: [')
    
    for i, card in enumerate(cards):
        comma = ',' if i < len(cards) - 1 else ''
        term = escape_js_string(card['term'])
        en = escape_js_string(card['en'])
        uz = escape_js_string(card['uz'])
        ex = escape_js_string(card['ex'])
        exUz = escape_js_string(card['exUz'])
        lines.append(f'        {{ term: "{term}", en: "{en}", uz: "{uz}", ex: "{ex}", exUz: "{exUz}" }}{comma}')
    
    lines.append('    ]')
    lines.append('};')
    lines.append('')
    
    filepath = os.path.join(os.path.dirname(__file__), filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    
    return filename


def main():
    print(f"Generating {len(TOPICS)} flashcard sets...\n")
    
    generated = []
    failed = []
    
    for i, topic in enumerate(TOPICS):
        print(f"[{i+1}/{len(TOPICS)}] Generating: {topic['title']}...")
        
        cards = generate_flashcard_set(topic)
        
        if cards:
            filename = write_flashcard_js(topic, cards)
            print(f"  ✓ Saved {len(cards)} cards to {filename}")
            generated.append(topic)
        else:
            print(f"  ✗ FAILED to generate cards for {topic['title']}")
            failed.append(topic)
        
        # Rate limiting — wait between requests
        if i < len(TOPICS) - 1:
            time.sleep(4)
    
    print(f"\n{'='*50}")
    print(f"DONE: {len(generated)} generated, {len(failed)} failed")
    
    if generated:
        print(f"\nAdd these to flashcardTopics in landing.html:")
        for t in generated:
            print(f"      {{ file: '{t['file']}.js', name: '{t['title'].split(' ', 1)[-1] if ' ' in t['title'] else t['title']}', icon: '{t['icon']}' }},")
    
    if failed:
        print(f"\nFAILED topics:")
        for t in failed:
            print(f"  - {t['title']}")


if __name__ == "__main__":
    main()
