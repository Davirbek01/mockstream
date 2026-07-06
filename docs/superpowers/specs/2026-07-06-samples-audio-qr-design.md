# Samples Audio — QR-linked pronunciation player

**Date:** 2026-07-06
**Status:** Approved (design), pre-build
**Depends on:** the B2 sample regeneration completing (voice the *final* text). See `project_cefr_samples_pdf_and_regen`.

## Goal
Let a student scan a QR on the **Samples PDF** and hear the B2 model answers read aloud in a natural neural voice, with the ability to tap any highlighted vocabulary phrase to hear just that phrase — pronunciation practice on top of the written booklet.

## Decisions (locked)
- **Voice:** `en-GB-RyanNeural` (edge-tts — free Microsoft neural voice, no API key).
- **Scope:** full-answer playback **+ tap-a-word**, via word-sync (not thousands of per-word files).
- **QR:** one QR at the top of each Samples PDF → opens that mock's player page.
- **Skills:** both; **speaking first**, writing right after.
- **Generation:** pre-generated, not on-the-fly.

## Architecture

### 1. Audio generation (`scratchpad`/tooling, run after regen)
For each sample (writing: t11/t12/t2; speaking: q1..q8):
- Strip the `<span class="ml-token">` tags → plain text.
- `edge-tts` with `en-GB-RyanNeural`, capturing **WordBoundary** events → produces:
  - `<key>.mp3` — the audio
  - `<key>.json` — word timings `[{w, start, end}]` (seconds)
- Upload both to GCS.

**Storage:** `gs://mockstream-samples-audio/cefr-<skill>/mock-<N>/<key>.{mp3,json}` (public-read; samples aren't sensitive). `<key>` = `t11|t12|t2` or `q1..q8`.

### 2. Player page — `site/listen-samples.html` (branded, sibling of `listen.html`)
- URL: `listen-samples.html?skill=cefr-writing&number=<N>` (also accepts `id`).
- Fetches the mock's `mock_data` from Supabase (anon read, same as print-mock) to get each sample's **highlighted HTML** + the question/task label.
- For each sample: shows the label + the highlighted text + a ▶ **Play full answer** button.
- On play: loads `<key>.mp3` + `<key>.json`; **karaoke-highlights** the current word using the timings; a **tap on any highlighted phrase** seeks to that phrase's start time and plays through its end (phrase→word-range mapped via the timing list).
- Branded per centre (logo/name) like the other player.

### 3. QR in the Samples PDF — `site/print-mock.html`
- In the samples renderer, add one QR block near the header linking to the player page for that mock+skill. Reuse the existing QR helper used for listening audio.

## Build order (player plumbing can start now; audio waits for final text)
1. Generation script + GCS bucket; prove the edge-tts word-boundary pipeline on one already-final writing mock (Mock 1).
2. `listen-samples.html` player; test end-to-end against that mock's audio.
3. QR block in the samples PDF.
4. After the regen finishes: batch-generate all audio (speaking + writing), verify.

## Out of scope (v1)
Offline playback (the PDF is the offline artifact), per-word audio files, non-CEFR skills.
