# Samples PDF (Model-Answer Booklet) — Design Spec

- **Date:** 2026-07-06
- **Status:** APPROVED design — ready for implementation plan.
- **Owner:** davirbekkhasanov02@gmail.com
- **Rollout:** **DEV ONLY** for now (mock-stream.com) so owner can test. Do **NOT** cherry-pick to master/clones until owner tests and approves.

## 1. Goal
Add a second, separate PDF download — a **model-answer booklet** — to the existing mock PDF menu, alongside the current questions PDF. Professional layout matching the questions PDF (centre-logo watermark, header, A4 chrome). One **B2-level** model answer per task/question, with the `ml-token` vocabulary highlights rendered in colour, plus a per-answer **Key vocabulary** gloss (English → Uzbek).

## 2. Scope
- **CEFR Writing + CEFR Speaking only** for v1. IELTS writing/speaking (different `mock_data` shape) = later follow-up.
- Reading/Listening get **no** Samples button (they have an answer key, not model answers).
- **Only the `sampleB2` field** per task/question. Fallback: if `sampleB2` missing, use the top `sample` (still labelled B2); if neither exists, render a small "— sample not available —" line and skip.

## 3. Data shapes (already in Supabase `mock_tests.mock_data`)
- **CEFR Writing** — `tasks` object with `t11` (informal, ~50-70w), `t12` (formal, ~120-150w), `t2` (essay/forum, ~180-200w). Each task has `prompt`, `title`, `chip`/`genre`, `target`, and per-level samples incl. `sampleB2` (English, may contain `<span class="ml-token TYPE">…</span>`). Top-level `mock_data.tokenTranslations` = `{ "phrase": { uz, type } }` for the gloss.
- **CEFR Speaking** — `questions` array (8 items, grouped by `part`). Each has `prompt` (the question text), `part`, and per-level samples incl. `sampleB2`. Same top-level `tokenTranslations`.
- Highlights & tokenTranslations were backfilled for Writing #101/#102 this session; older mocks already carried them from the maker pipeline.

## 4. Pipeline changes (minimal, isolated — questions PDF untouched)
Reuse the **same** `print-mock.html` + `mock-pdf` shell ⇒ identical watermark/header/A4 chrome by construction.

1. **`netlify/functions/mock-pdf.mjs`** — pass one new param through to the print URL: `&variant=samples` (mirror the existing `&key=1` passthrough at line ~39). No other change.
2. **`site/print-mock.html`**
   - In `render(type, md)` (~line 619): if `qp('variant')==='samples'` AND type ∈ {`cefr-writing`,`cefr-speaking`}, dispatch to new `renderWritingSamples(md)` / `renderSpeakingSamples(md)`. Existing `renderWriting`/`renderSpeaking` stay untouched.
   - Add `.ml-token` colour CSS (one rule per type: colloc/phrasal/idiom/academic/linking/modal) so highlights print. Reuse the on-screen palette from `Writing Mocks.html` for visual parity.
   - Set page `<title>` to `<Mock title> — Model Answers B2` when `variant==='samples'` ⇒ download filename differs from the questions PDF.
   - Header sub-title: **"Model Answers — B2 Level"** under the existing centre logo + mock title.
3. **`site/pdf-menu.js`** — on the mock-pick screen, for `cefr-writing`/`cefr-speaking` render **two** buttons: `⬇ Questions PDF` (existing flow) and `⬇ Samples PDF (B2)` (same `download()` with `&variant=samples` appended). All other skills keep the single button unchanged.

## 5. Layout (Option A — brief prompt + sample)
**Header (both skills):** centre logo (existing) + "Model Answers — B2 Level" + mock title. Watermark on every page (existing).

**Writing** — one block per task with a sample (t11, t12, t2), in order:
- Compact task header: `Task 1.2 · Formal letter · ~120 words` (from title/chip/target) + `Prompt: <task.prompt one-liner>` (the short prompt only — NOT the full Part-1 scenario or both options).
- The `sampleB2` HTML with `ml-token` highlights in colour; word count at the end.
- **Key vocabulary** gloss line: each highlighted phrase in this answer → its Uzbek from `tokenTranslations`, comma-separated (e.g. *partial refund — qisman pul qaytarish · in the meantime — shu orada*). Only phrases present in this answer; skip if none.

**Speaking** — grouped by Part, one block per question with a sample:
- Header: `Part 2 · Q4` + the **question text** (`prompt`) as the heading (the question IS the prompt, and is short).
- The `sampleB2` model answer with highlights. **No** word count (spoken answers have a speak-time target, not a word target).
- Same **Key vocabulary** gloss line.

## 6. Key vocabulary gloss (study aid) — INCLUDED
Because print has no hover tooltips, surface the `tokenTranslations` inline as a compact gloss beneath each answer. Build it by scanning the answer's `ml-token` phrases and looking each up in `mock_data.tokenTranslations`. Small, muted styling; one line/wrapped list per answer.

## 7. Rollout & verification
- **Additive only:** new param + two new render functions + one menu button. Questions PDF path untouched ⇒ zero regression to the existing document.
- **DEV ONLY:** ship `print-mock.html`, `pdf-menu.js`, `mock-pdf.mjs` to `dev` (mock-stream.com). **No master/clone push** until owner tests and approves. (Owner will download both PDFs on mock-stream.com and confirm.)
- **Verify before/after push:** render mock #101 (writing) + a speaking mock via the headless path / Playwright; confirm B2 samples, colour highlights, gloss, watermark/header, and a distinct filename. Confirm the questions PDF still renders identically.
- No Supabase or content changes.

## 8. Open items to resolve at implementation
1. Re-grep exact current line numbers in `print-mock.html` (`render`, renderer map ~613, CSS block) — they shift.
2. Confirm `sampleB2` presence across live CEFR writing (102) + speaking (65) mocks; wire the fallback for any gaps.
3. Pull the exact on-screen `ml-token` colour values from `Writing Mocks.html` for print parity.
4. Speaking: confirm part/question labelling (`part` values, Q numbering) matches the on-screen booklet.

## Key reference facts
- Menu → download: `pdf-menu.js` `download(type,id)` → `/.netlify/functions/mock-pdf?type=&id=` (+`&key=1` reading/listening). Add `&variant=samples`.
- `mock-pdf.mjs`: puppeteer-core + @sparticuz/chromium; builds `print-mock.html?type=&id=[&key=1]`; `page.pdf({format:'A4', margin:14/12mm})`; filename from page `<title>`; `Cache-Control: no-store`.
- `print-mock.html` renderers: `renderWriting` (~493, CEFR part1+t11/t12/t2), `renderSpeaking` (~550, questions[] by part), map ~613, `render()` ~619, `qp()` reads query params, `window.__printReady` gates capture.
- Supabase project `zknyukkbtbcqgvkgjktb`; anon key `sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2`.
- Branches: `dev` → mock-stream.com only; `master` → 6 clones. This feature stays on `dev` until approved.
