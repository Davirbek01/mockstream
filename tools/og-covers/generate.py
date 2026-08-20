# ═══════════════════════════════════════════════════════════════════════════
# OG link-preview cover generator — ALL 13 covers in site/og/.
# ---------------------------------------------------------------------------
# Regenerate:  python tools/og-covers/generate.py
# Output:      site/og/*.png  (1200x630 each)
#
# ⚠️ If you REDESIGN a cover, give it a NEW filename and update the edge
# functions in netlify/edge-functions/og-*.ts — Telegram caches images by
# URL, so a changed file behind the same name keeps showing the old art
# (same rule as mock images).
#
# Palette map (keep families distinct):
#   CEFR blue · IELTS red · generic purple · articles teal ·
#   grammar amber · vocabulary rose · flashcards cyan
# Requires Pillow + Windows fonts (Segoe UI Semibold / Emoji).
# ═══════════════════════════════════════════════════════════════════════════
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

W, H = 1200, 630
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "site", "og")

def font(sz, bold=True):
    for name in (["seguisb.ttf", "segoeuib.ttf"] if bold else ["segoeui.ttf"]):
        try: return ImageFont.truetype("C:/Windows/Fonts/" + name, sz)
        except OSError: pass
    return ImageFont.load_default()

def emoji_font(sz):
    try: return ImageFont.truetype("C:/Windows/Fonts/seguiemj.ttf", sz)
    except OSError: return font(sz)

def lerp(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def base(c1, c2):
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    for y in range(H): d.line([(0, y), (W, y)], fill=lerp(c1, c2, y / H))
    glow = Image.new("RGB", (W, H), (0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([W-460, -220, W+220, 400], fill=lerp(c2, (255, 255, 255), 0.25))
    img = Image.blend(img, glow.filter(ImageFilter.GaussianBlur(120)), 0.35)
    d = ImageDraw.Draw(img)
    d.polygon([(0, H), (0, H-130), (W, H-320), (W, H)], fill=lerp(c1, (0, 0, 0), 0.25))
    return img, d

def cover(name, c1, c2, accent, icons, top, hero, pill, tagline,
          hero_sz=128, hero_y=210, pill_w=330):
    img, d = base(c1, c2)
    if len(icons) == 1:
        d.text((84, 130), icons[0], font=emoji_font(210), embedded_color=True)
    else:
        ic = emoji_font(96)
        for i, g in enumerate(icons):
            d.text((92, 108 + i * 112), g, font=ic, embedded_color=True)
    d.text((400, 130), top, font=font(64), fill=(255, 255, 255))
    d.text((394, hero_y), hero, font=font(hero_sz), fill=(255, 255, 255))
    d.rectangle([400, 370, 760, 384], fill=accent)
    d.rounded_rectangle([400, 420, 400 + pill_w, 486], radius=33, fill=(255, 255, 255))
    d.text((436, 430), pill, font=font(42), fill=c1)
    d.text((84, H - 84), tagline, font=font(34, bold=False), fill=(255, 255, 255))
    img.save(os.path.join(OUT, name + ".png"), optimize=True)
    print(name, "done")

CEFR  = ((13, 40, 120), (37, 99, 235), (96, 165, 250))
IELTS = ((105, 10, 25), (220, 38, 38), (252, 165, 165))
SKILLS = [("listening", "Listening", "🎧"), ("reading", "Reading", "📖"),
          ("writing", "Writing", "✍️"), ("speaking", "Speaking", "🎤")]
MOCK_TAG = "Timed · Auto-scored · AI feedback"

for ek, exname, pal in (("cefr", "CEFR MULTILEVEL", CEFR), ("ielts", "IELTS", IELTS)):
    for sk, sname, icon in SKILLS:
        cover(f"{ek}-{sk}", *pal, [icon], exname, sname.upper(), "MOCK EXAM", MOCK_TAG)
    cover(f"{ek}-full", *pal, ["🎧", "📖", "✍️", "🎤"], exname, "FULL MOCK",
          "ALL 4 SKILLS", MOCK_TAG, hero_sz=120, pill_w=430)

cover("generic", (49, 25, 105), (109, 40, 217), (196, 181, 253),
      ["🎧", "📖", "✍️", "🎤"], "ONLINE PRACTICE", "MOCK EXAMS", "ALL 4 SKILLS",
      MOCK_TAG, hero_sz=120, pill_w=430)
cover("articles", (6, 78, 59), (16, 185, 129), (110, 231, 183),
      ["📰"], "GRADED READING", "ARTICLES", "READ & LISTEN",
      "Levelled texts · Natural audio · Karaoke highlighting", pill_w=430)
cover("grammar", (120, 53, 15), (234, 88, 12), (253, 186, 116),
      ["📝"], "PRACTICE TESTS", "GRAMMAR", "MCQ TEST",
      "Instant scoring · Explanations · All levels")
cover("vocabulary", (131, 24, 67), (219, 39, 119), (249, 168, 212),
      ["🔤"], "PRACTICE TESTS", "VOCABULARY", "MCQ TEST",
      "Instant scoring · Explanations · All levels", hero_sz=104, hero_y=226)
cover("flashcards", (8, 51, 68), (6, 182, 212), (103, 232, 249),
      ["🗂️"], "VOCABULARY", "FLASHCARDS", "FLIP & LEARN",
      "Term audio · All levels · Study anywhere", hero_sz=112, hero_y=218, pill_w=390)

# The VIP deep link — /vip/<code>. Gold, because it is the only cover that
# stands for access rather than content.
cover("vip", (69, 26, 3), (217, 119, 6), (253, 224, 71),
      ["⭐"], "PREMIUM ACCESS", "VIP CODE", "TAP TO ACTIVATE",
      "One tap · Opens the code box · Unlocks every mock", hero_sz=116, hero_y=214, pill_w=430)
