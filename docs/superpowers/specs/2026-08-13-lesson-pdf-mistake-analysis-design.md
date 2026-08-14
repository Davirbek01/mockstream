# Lesson PDF: common-mistake analysis + levelled model answers

**Date:** 2026-08-13
**Status:** design approved; mining in progress
**Deliverable:** one bilingual A4 PDF (English examples · Uzbek explanations),
previewed as HTML on localhost and converted only after Davirbek approves.

## Decisions (all confirmed)

- **Language:** bilingual — student texts/mistakes/model answers in English,
  explanations and teacher assessments in Uzbek.
- **Data:** all 7 centres, last 90 days, anonymized (no names anywhere).
  ~24k CEFR speaking + ~20k CEFR writing results; ~18k carry stored reports
  (`results.report_path` → public `reports` bucket; writing = .html,
  speaking = .zip of report files).
- **Model tasks:** CEFR **Speaking Mock 03 Q4** (real image embedded) and
  CEFR **Writing Mock 101** tasks 1.1 / 1.2 / Part 2 — prompts quoted
  VERBATIM from `mock_tests.mock_data`; 12 newly-authored model answers
  (B1/B2/C1 each) with teacher assessment per the official Uzbek criteria
  guides (`C:\Users\user\Desktop\Baholash mezonlari\*.pdf`, extracted to
  scratchpad `lesson/*.txt`).

## Document structure

1. **Ma'lumotlar manzarasi** — sample size, period, score distribution.
2. **Writing xatolari** — frequency charts: grammar subtypes (tenses,
   articles, agreement, prepositions, word order) + beyond-grammar:
   register (1.1 informal / 1.2 formal violations), cohesion, task
   misinterpretation, length. Each category tagged minor (tushunishga
   xalaqit bermaydi) / major (xalaqit beradi) with real anonymized
   wrong → corrected example pairs.
3. **Speaking xatolari** — same treatment + dedicated Q4 image-description
   block (descriptive language, speculation phrases, misinterpretation,
   fillers/silence).
4. **Speaking Mock 03 Q4 model answers** — B1/B2/C1 + assessment boxes with
   per-criterion scores.
5. **Writing Mock 101 model answers** — 3 tasks × B1/B2/C1 + assessment
   boxes with the 5-criteria breakdown and certificate-score mapping.
6. **Xulosa checklist** — one page.

## Method (stated inside the document too)

Stratified sample ≈ 1,000 reports (≈600 writing, ≈400 speaking) across
centres. Mistake frequencies = mined AI-feedback sections + direct reading
of sampled answers; labelled in the doc as covering the sampled period, not
a census. Charts follow the dataviz skill (read before chart code); inline
SVG so the PDF needs no external assets.

## Pipeline

1. SQL: sample report paths (stratified by centre) → download to scratchpad
   `lesson/reports/` (writing .html direct; speaking .zip → unzip).
2. Parse: extract student answers + AI feedback blocks per task.
3. Classify into the taxonomy above; produce counts + example pairs
   (anonymized, lightly edited only to remove identifying details).
4. Author model answers + assessments from the criteria guides.
5. Build `lesson.html` (A4 print CSS) → localhost preview → approval →
   Playwright print-to-PDF.

## Non-goals

- No per-student or per-centre naming in the document.
- No IELTS this round (CEFR speaking + writing only).
- No claims of exact census counts — sampled statistics, said plainly.
