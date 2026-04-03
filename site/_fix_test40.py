#!/usr/bin/env python3
"""Fix all transcription errors in ielts-reading-test-40.js to match original screenshots exactly."""
import os

path = os.path.join(os.path.dirname(__file__), "questions IELTS R", "ielts-reading-test-40.js")
with open(path, "r", encoding="utf-8") as f:
    txt = f.read()

original = txt  # keep for comparison

# ============================================================
# PASSAGE 1 FIXES
# ============================================================

# 1. Section D: fix quotes around 'the real' and 'the authentic'
txt = txt.replace(
    "the idea of the real or the authentic' in both images",
    "the idea of 'the real' or 'the authentic' in both images"
)

# 2. Section E: "with point Cubism being a major impact" → "at which point Cubism began to have a major impact"
txt = txt.replace(
    "with point Cubism being a major impact on the French art scene",
    "at which point Cubism began to have a major impact on the French art scene"
)

# 3. Section E: "whose practice were" → "whose practices were"
txt = txt.replace(
    "whose practice were closely linked",
    "whose practices were closely linked"
)

# 4. Q11: add context line about two issues
txt = txt.replace(
    '"<strong>Medieval European Art</strong><br>the course considers how artists could be original',
    '"<strong>Medieval European Art</strong><br>the course looks at two issues: artistic creativity and processes for teaching technique<br>the course considers how artists could be original'
)

# 5. Q12: add context line about life-sized sculpture
txt = txt.replace(
    '"<strong>Reception of Classical European Art</strong><br>painting is examined by looking',
    '"<strong>Reception of Classical European Art</strong><br>life-sized and miniature sculpture is examined<br>painting is examined by looking'
)

# ============================================================
# PASSAGE 2 FIXES
# ============================================================

# 6. Section C: "mud-flat-feeding" → "mudflat-feeding"
txt = txt.replace("mud-flat-feeding", "mudflat-feeding")

# 7. Section E: "before being taken" → "after being taken"
txt = txt.replace(
    "Experiments have shown that before being taken thousands",
    "Experiments have shown that after being taken thousands"
)

# 8. Section E: "perception than most small birds migrate" → "perception to ours. Most small birds migrate"
txt = txt.replace(
    "perception than most small birds migrate",
    "perception to ours. Most small birds migrate"
)

# 9. Section E: "Traveling at night" → "Travelling at night"  (British spelling)
txt = txt.replace("Traveling at night", "Travelling at night")

# 10. Section F: "accurate forecasting and intuitive familiarity with winds" → "accurate weather forecasting and utilizing favourable winds"
txt = txt.replace(
    "accurate forecasting and intuitive familiarity with winds",
    "accurate weather forecasting and utilizing favourable winds"
)

# 11. Section F: "Other birds react" → "Often birds react"  (in passage text only, not in explanations quote)
# We need to be careful here — only replace in the passage text, not the explanation quote
# The passage text has "ceiling of a room. Other birds react"
txt = txt.replace(
    "ceiling of a room. Other birds react",
    "ceiling of a room. Often birds react"
)

# 12. Section G: "Welsh man shearwater" → "Welsh Manx shearwater"
txt = txt.replace("Welsh man shearwater", "Welsh Manx shearwater")

# 13. Section G: "Skomholm Island" → "Skokholm Island"
txt = txt.replace("Skomholm Island", "Skokholm Island")

# 14. Section G: "before an unannouncing its release!" → "before a letter announcing its release!"
txt = txt.replace(
    "before an unannouncing its release!",
    "before a letter announcing its release!"
)

# 15. Section G: Add "in sunny African climes." at end of passage 2
txt = txt.replace(
    "spending the winter with European migrants.</p>\"",
    "spending the winter with European migrants in sunny African climes.</p>\""
)

# 16. Heading viii: "despite trouble of wind" → "despite the trouble of wind"
txt = txt.replace(
    "despite trouble of wind",
    "despite the trouble of wind"
)

# ============================================================
# PASSAGE 3 FIXES
# ============================================================

# 17. Blackberry: "exploratory systems" → "exploratory stems"
txt = txt.replace("exploratory systems", "exploratory stems")

# 18. Blackberry: "having slowly" → "waving slowly"
txt = txt.replace("having slowly", "waving slowly")

# 19. Blackberry: "nutrient minerals" → "nutriment"  (end of blackberry paragraph)
txt = txt.replace("extract nutrient minerals", "extract nutriment")

# 20. Silverweed: "travelling systems" → "travelling stems"
txt = txt.replace("travelling systems", "travelling stems")

# 21. Sycamore: "they can spin like tiny helicopters and land far from their parent" →
#     "these tiny spinning helicopters can land far from their parent"
txt = txt.replace(
    "they can spin like tiny helicopters and land far from their parent",
    "these tiny spinning helicopters can land far from their parent"
)

# 22. Grapple plant: "In the South African grape plant" → "The South African grapple plant"
txt = txt.replace(
    "In the South African grape plant",
    "The South African grapple plant"
)

# 23. Ants paragraph: fix garbled text
txt = txt.replace(
    "where the seeds are now safe in the covering. Inside this envelope no longer presents to germinate.",
    "where they eat the covering, leaving the seeds themselves in an ideal position to germinate."
)

# ============================================================
# FIX EXPLANATION QUOTES that reference now-corrected text
# ============================================================

# Q9 explanation quote
txt = txt.replace(
    "The course examines the development of Post-impressionist painting between 1880 and 1912, with point Cubism being a major impact on the French art scene.",
    "The course examines the development of Post-impressionist painting between 1880 and 1912, at which point Cubism began to have a major impact on the French art scene."
)

# Q20 explanation quote - Welsh man → Welsh Manx, Skomholm → Skokholm (already handled by global replace above)

# Q27 explanation text
txt = txt.replace(
    "The blackberry moves by putting out exploratory systems, which curve upwards, searching for another plant to advance towards.",
    "The blackberry moves by putting out exploratory stems, which curve upwards, searching for another plant to advance towards."
)

# Q28 explanation text  
txt = txt.replace(
    "The silverweed moves by putting out travelling systems that advance horizontally, creeping at a low level.",
    "The silverweed moves by putting out travelling stems that advance horizontally, creeping at a low level."
)

# Q33 explanation quote - fix sycamore quote
txt = txt.replace(
    "they can spin like tiny helicopters and land far from their parent.",
    "these tiny spinning helicopters can land far from their parent."
)

# Q35 explanation quote - fix ants paragraph quote
txt = txt.replace(
    "where the seeds are now safe in the covering.",
    "where they eat the covering, leaving the seeds themselves in an ideal position to germinate."
)

# Q26 explanation quote - update "Other" → "Often"
txt = txt.replace(
    '"quote": "Other birds react to weather changes',
    '"quote": "Often birds react to weather changes'
)

# ============================================================
# VERIFY & WRITE
# ============================================================
changes = 0
for i, (a, b) in enumerate(zip(original, txt)):
    if a != b:
        changes += 1

if txt == original:
    print("WARNING: No changes were made! Check replacements.")
else:
    with open(path, "w", encoding="utf-8") as f:
        f.write(txt)
    print(f"SUCCESS: File updated. {len(txt)} chars total.")
    
    # Print a summary of what was verified
    checks = [
        ("'the real' or 'the authentic'", "'the real' or 'the authentic'" in txt),
        ("at which point Cubism began", "at which point Cubism began" in txt),
        ("whose practices were", "whose practices were" in txt),
        ("after being taken", "after being taken thousands" in txt),
        ("perception to ours. Most", "perception to ours. Most" in txt),
        ("Travelling at night", "Travelling at night" in txt),
        ("weather forecasting and utilizing", "weather forecasting and utilizing" in txt),
        ("Often birds react", "Often birds react" in txt),
        ("Welsh Manx shearwater", "Welsh Manx shearwater" in txt),
        ("Skokholm Island", "Skokholm Island" in txt),
        ("a letter announcing", "a letter announcing" in txt),
        ("African climes", "African climes" in txt),
        ("despite the trouble of wind", "despite the trouble of wind" in txt),
        ("exploratory stems", "exploratory stems" in txt),
        ("waving slowly", "waving slowly" in txt),
        ("extract nutriment", "extract nutriment" in txt),
        ("travelling stems", "travelling stems" in txt),
        ("tiny spinning helicopters can land", "tiny spinning helicopters can land" in txt),
        ("grapple plant", "grapple plant" in txt),
        ("they eat the covering, leaving the seeds", "they eat the covering, leaving the seeds" in txt),
        ("two issues: artistic creativity", "two issues: artistic creativity" in txt),
        ("life-sized and miniature sculpture", "life-sized and miniature sculpture" in txt),
        ("mudflat-feeding", "mudflat-feeding" in txt),
    ]
    
    print("\nVerification:")
    for label, ok in checks:
        status = "OK" if ok else "FAIL"
        print(f"  [{status}] {label}")
