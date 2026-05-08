# Speaking Editor Panel — Design

**Status:** Spec
**Date:** 2026-05-08
**Owner:** davirbekkhasanov02@gmail.com
**Scope:** Mock Settings panel inside `site/landing.html`. CEFR Speaking + IELTS Speaking, both in v1.

## 1. Goal

Add a fully-functional, structured editor for **CEFR Speaking** (`mock_type = 'cefr-speaking'`) and **IELTS Speaking** (`mock_type = 'ielts-speaking'`) mocks to the existing Mock Settings panel. Feature-parity with the Writing editor's pattern: tabbed structured panes that read from and flush back to a JSON textarea source-of-truth, all inside the existing `_mmgEdit*` modal driven by the `admin-mocks` Edge Function.

Non-goals: changing the runner (`Speaking Mocks.html` / `IELTS Speaking Mocks.html`), changing the Phase-1 picker URL contract, migrating additional mocks beyond what already exists in `mock_tests`.

## 2. Background — what already exists

- **Mock Settings panel:** `site/landing.html` ~lines 25862–27500. Hierarchical nav (exam → skill → mocks). Edits a single `mock_tests` row via the `admin-mocks` Edge Function (`/functions/v1/admin-mocks`).
- **Tab system:** `_MMG_STRUCTURED_TYPES` registers per-`mock_type` configs `{ tabClass, defaultTab }`. CSS classes `.mmg-tabs-bar`, `.mmg-tab`, `.mmg-pane` already implement a 200-px vertical sidebar layout (desktop) with horizontal-scroll fallback ≤700 px.
- **Writing editor** (`cefr-writing` / `ielts-writing`) implements: Settings, per-Task panes, Samples, Vocabulary, Tokens, Raw JSON, with sample editor toolbar (`phrasal/adv/modal/colloc/idiom`) and live preview. Source-of-truth is `#mmgFldData` textarea; per-pane `_mmgRender*` / `_mmgCollect*` functions flush JSON on tab switch.
- **GCS upload pipeline:** `admin-mocks` action `gcs_signed_upload_url` returns a V4 signed PUT URL plus a public read URL. `GCS_FOLDERS` already maps `'cefr-speaking': 'CEFR speaking media'` and `'ielts-speaking': 'IELTS speaking media'`. `ALLOWED_MIME` already covers `audio/mpeg`, `audio/mp4`, `audio/wav`, `audio/x-m4a`, `audio/ogg`. `_mmgFieldUploader()` is the in-editor helper that drives this flow.
- **Gemini API key:** `GEMINI_API_KEY` is already a Supabase function secret (used by `ai-proxy` for scoring + vision-factcheck). Re-used here; no new secret.
- **Phase-1 Supabase mocks:** `id=10 ielts-speaking`, `id=11 cefr-speaking` already live; their `mock_data` is the canonical shape this editor edits.

## 3. Data shape (`mock_data`) — what the editor reads/writes

### 3.1 CEFR speaking
```jsonc
{
  "settings": {
    "logoUrl": "...", "logoWording": "...",
    "telegramChannel": "...", "testIdentifier": "...",
    "heading1": "...", "heading2": "...",
    "voice": "Kore",                 // NEW — Gemini TTS prebuilt voice name
    "tts_model": "premium"           // NEW — "budget" | "premium"
  },
  "images": {
    "img1": "https://storage.googleapis.com/.../...jpg", "img1Alt": "...",
    "img2": "https://storage.googleapis.com/.../...jpg", "img2Alt": "..."
  },
  "questions": [
    {
      "number": 1, "part": "Part 1", "badge": "30s",
      "prepTime": 5, "speakTime": 30,
      "prompt": "...",
      "audioFile": "https://storage.googleapis.com/.../cefr-speaking-mock-NN-qN-<ts>.wav",
      "hasImages": false,
      "sampleAnswer": "<p>... <span class=\"ml-token phrasal\">...</span> ...</p>",
      "sampleA1": "...", "sampleA2": "...", "sampleB1": "...", "sampleB2": "...",
      "uzSampleAnswer": "...",
      "uzSampleA1": "...", "uzSampleA2": "...", "uzSampleB1": "...", "uzSampleB2": "...",
      "vocabulary": {
        "title": "Q1 - ...",
        "sentenceStarters": ["..."],
        "phrases":          ["<strong>...</strong> - \"...\""],
        "idioms":           ["<strong>...</strong> - \"...\""]
      }
    }
    // Q2..Q8
  ],
  "tokenTranslations": { /* same shape as writing's Tokens tab */ }
}
```

### 3.2 IELTS speaking
Same as CEFR with the following differences:

```jsonc
{
  "settings": { /* + voice/tts_model as above */ },
  "images":   { /* unchanged */ },
  "announcements": {                  // IELTS-only top-level block
    "beforePart1": "...", "beforePart2": "...",
    "afterPart2Prep": "...", "beforePart2FollowUp": "...",
    "beforePart3": "...", "afterExam": "..."
  },
  "questions": [
    {
      "number": 1, "part": "Part 1", "topic": "Work or Study",   // adds `topic`
      "badge": "30s", "prepTime": 5, "speakTime": 30,
      "prompt": "...", "audioFile": "...",
      "sampleAnswer": "...",
      "sampleBand5": "...", "sampleBand6": "...", "sampleBand7": "...", "sampleBand8": "...", "sampleBand9": "...",
      "uzSampleAnswer": "...",
      "uzSampleBand5": "...", "uzSampleBand6": "...", "uzSampleBand7": "...", "uzSampleBand8": "...", "uzSampleBand9": "...",
      "vocabulary": { /* same shape as CEFR */ },
      "bulletPoints": ["..."]         // present on Part 2 cue card question only
    }
  ]
}
```

The renderer already accepts both shapes from existing static mocks; the editor must round-trip them losslessly.

## 4. Tab structure

Two new entries register into `_MMG_STRUCTURED_TYPES`:

```js
'cefr-speaking':  { tabClass: 'mmg-tab-cs', defaultTab: 'sp_settings' }
'ielts-speaking': { tabClass: 'mmg-tab-is', defaultTab: 'sp_settings' }
```

Tab list (vertical sidebar, identical CSS):

| Tab id        | Label        | CEFR | IELTS | Pane id              |
|---------------|--------------|------|-------|----------------------|
| `sp_settings` | Settings     | ✓    | ✓     | `mmgPaneSpSettings`  |
| `sp_part11`   | Part 1.1     | ✓    | ✓     | `mmgPaneSpPart11`    |
| `sp_part12`   | Part 1.2     | ✓    | ✓     | `mmgPaneSpPart12`    |
| `sp_part2`    | Part 2       | ✓    | ✓     | `mmgPaneSpPart2`     |
| `sp_part3`    | Part 3       | ✓    | ✓     | `mmgPaneSpPart3`     |
| `tokens`      | Tokens       | ✓    | ✓     | `mmgPaneTokens` (existing — extended) |
| `raw`         | ⚙ Raw JSON   | ✓    | ✓     | `mmgPaneRaw` (existing) |

Question-to-part mapping (drives which questions render in which Part tab):

- **CEFR:** Part 1.1 = Q1–Q3, Part 1.2 = Q4–Q6, Part 2 = Q7, Part 3 = Q8.
- **IELTS:** Part 1.1 = Q1–Q3 (or first 3 questions tagged "Part 1"), Part 1.2 = remaining "Part 1" questions (Q4–Q6 typically), Part 2 = the cue-card question (`part: "Part 2"`) plus follow-ups (`part: "Part 2 Follow-up"`), Part 3 = `part: "Part 3"` questions.

Mapping is computed from each question's `part` field (string match). Questions whose `part` doesn't match any tab fall into a "Unsorted" warning bucket at the top of Part 1.1.

Existing tabs `tokens` and `raw` stay shared with writing — the only required change is that their Show/Hide logic lights up for `mmg-tab-cs` and `mmg-tab-is` classes too.

## 5. Settings tab contents

Order of sections:

1. **Branding** — logoUrl, logoWording, telegramChannel, testIdentifier, heading1, heading2 (text inputs).
2. **Top-level images** — img1 + img1Alt + img2 + img2Alt. Each URL field has a 📤 Upload button using the existing `_mmgFieldUploader` helper, scoped to the active mock's skill. Inline `<img>` thumbnail at 120 px.
3. **Voice & TTS model** — see §6 below.
4. **Examiner announcements** (IELTS only) — six labelled `<textarea>`s for `announcements.beforePart1`, `beforePart2`, `afterPart2Prep`, `beforePart2FollowUp`, `beforePart3`, `afterExam`. Hidden when `mock_type = 'cefr-speaking'`.
5. **Bulk audio toolbar** — single button: `🎙 Generate audio for all questions with current voice/model`. Calls `_mmgGenerateAllAudios('all')`. Label uses "all questions" (not "all 8") because IELTS mocks may have more than 8 questions when Part 2 follow-ups are listed separately.

## 6. Voice & TTS model picker (Settings tab)

### 6.1 Curated voice list (hardcoded in `landing.html`)

```js
var _MMG_TTS_VOICES = [
  { code: 'Kore',         label: 'Firm — neutral examiner' },
  { code: 'Charon',       label: 'Deep, informative — senior examiner' },
  { code: 'Aoede',        label: 'Warm, friendly' },
  { code: 'Orus',         label: 'Firm, articulate' },
  { code: 'Achird',       label: 'Friendly, approachable' },
  { code: 'Vindemiatrix', label: 'Gentle' },
  { code: 'Leda',         label: 'Youthful, clear' },
  { code: 'Puck',         label: 'Upbeat' }
];
var _MMG_TTS_MODELS = {
  budget:  'gemini-2.5-flash-preview-tts',
  premium: 'gemini-2.5-pro-preview-tts'
};
```

### 6.2 Preview grid UI

8 rows × 2 model columns. Each row:

```
[●] Kore        Firm — neutral examiner       [▶ Budget]  [▶ Premium]
```

- Radio at left binds to `mock_data.settings.voice`. Default `Kore` if unset.
- Model toggle (Budget/Premium pill above the grid) binds to `mock_data.settings.tts_model`. Default `premium` if unset.
- ▶ buttons play the pre-generated preview audio inline (`<audio controls>` reveals beneath the row on first click).
- Preview URLs are read from a hardcoded const map:

```js
var _MMG_VOICE_PREVIEW_URL = 'https://storage.googleapis.com/mockstream-listening-audio/Voice%20previews/{model}-{voice}.wav';
// e.g. premium-Kore.wav, budget-Charon.wav
```

### 6.3 Pre-generation script

`supabase/scripts/generate-voice-previews.mjs` — Node script (uses `node --env-file` for the passcode + admin-mocks URL). Loops 8 voices × 2 models = 16 generations. Body for each:

```jsonc
{
  "action": "generate_speaking_audio",
  "adminPasscode": "...",
  "skill": "voice-preview",
  "mock_number": 0,
  "question_number": 0,
  "text": "Welcome to your speaking exam. Let's begin with the first question.",
  "voice": "<voice>",
  "model": "<budget|premium>",
  "filename_override": "<model>-<voice>.wav"
}
```

Idempotent: server-side, before generating, the action HEADs the GCS public URL and skips if it already exists (only when `filename_override` is present). Re-run-safe.

## 7. Question block (the unit that repeats inside Part tabs)

Card-style block with `<details>` collapse. One per question. Header shows `Q{n}` badge + part label + topic (IELTS only).

Body sections, top to bottom:

1. **Prompt** — large `<textarea>`.
2. **Audio row** — see §8.
3. **Timing** — two number inputs (`prepTime`, `speakTime`) side by side.
4. **CEFR Q4 only:** `hasImages` toggle. When on, renders read-only thumbnails of `mock_data.images.img1` and `img2` (with a hint pointing to Settings tab to edit).
5. **IELTS Part 2 cue card only:** `bulletPoints[]` editor — vertical row list, 1-line input each, `＋ Add` and `×` per row.
6. **Samples** — see §9.
7. **Vocabulary** — collapsed `<details>` with: `vocabulary.title` input + three sub-lists (`sentenceStarters`, `phrases`, `idioms`). Each sub-list is a row builder with `＋ Add` and `×` per row. No translation pairing — entries are single strings (existing data style).

The block emits `data-q-index` so collect functions can match each block back to its question array index without relying on order.

Top-of-Part-tab toolbar: button `🎙 Generate all audios in this part` calling `_mmgGenerateAllAudios(<partKey>)`.

## 8. Audio row (per question)

Layout (single row, wraps on narrow screens):

```
[ URL text input — wide ─────────────] [ 🎙 ] [ 📤 ] [ voice ▾ ] [ model ▾ ]
[ <audio controls src="<URL>"> ─────────────────────────────────────────── ]
```

- **URL input** — bound to `q.audioFile`. Empty hides the player.
- **🎙 Generate** — calls `_mmgGenerateAudio(qIndex, { voice, model })` with the per-question override pair (defaults to mock-level Settings choice). Disables itself + shows spinner during request. On success: writes the returned `publicUrl` into the URL input, fires `input` event so the player rebinds with cache-busting `?t=<unix>` query param.
- **📤 Upload MP3/WAV** — wires `_mmgFieldUploader({ id, skill })` exactly like the chart-image upload. The hidden `<input type="file" accept="audio/*">` is built into the markup the helper attaches to (the existing helper does not take an `accept` option — accept lives on the input element). MIME validation is enforced server-side by `ALLOWED_MIME` in `admin-mocks`.
- **`[voice ▾][model ▾]`** override pair — small selects, default to mock-level Settings, **not persisted to `mock_data`**. Pure UI convenience for one-off regenerations.
- **`<audio controls>`** — auto-binds to URL value, re-binds on `input` event with cache-buster, hides when empty.

## 9. Sample editor (per question, all levels)

Inline level tabs at the top of the sample area.

- **CEFR:** `Main · A1 · A2 · B1 · B2` — 5 levels, mapping to `sampleAnswer`, `sampleA1`, `sampleA2`, `sampleB1`, `sampleB2`.
- **IELTS:** `Main · Band 5 · Band 6 · Band 7 · Band 8 · Band 9` — 6 levels, mapping to `sampleAnswer`, `sampleBand5..9`.

Each level tab shows the sample editor as a 2-column pair:

- **Left:** English textarea, with the existing `mmg-sample-source` toolbar (`phrasal · adv · modal · colloc · idiom · clear`) and live HTML preview. Reuses `_mmgFieldSample()` and `_mmgUpdatePreview()` verbatim.
- **Right:** Uzbek textarea, plain (no toolbar) — bound to the matching `uzSample*` key.

Each level tab shows a status dot:
- `✓` green — both English and Uzbek non-empty.
- `●` amber — one side filled, the other empty.
- `○` grey — both empty.

Computed from current `mock_data` on render.

## 10. Tokens tab

Reuses the existing writing-editor Tokens tab implementation. The chip-row needs a discriminator so it shows speaking-friendly groupings — but since the data shape is identical (`mock_data.tokenTranslations[token] = { type, uz }`), the existing render/collect code works as-is. Only change: `_mmgVocabGroupsForType()` (or its tokens equivalent) gets a branch for `cefr-speaking` / `ielts-speaking` that returns the same flat token bucket.

## 11. Server: new `generate_speaking_audio` action in `admin-mocks`

### 11.1 Request

```jsonc
{
  "action": "generate_speaking_audio",
  "adminPasscode": "...",
  "skill": "cefr-speaking" | "ielts-speaking" | "voice-preview",
  "mock_number": <int>,
  "question_number": <int>,
  "text": "...",                         // ≤1500 chars
  "voice": "Kore",                       // optional — falls back to "Kore"
  "model": "budget" | "premium",         // optional — falls back to "premium"
  "filename_override": "premium-Kore.wav" // optional — only used by the preview script
}
```

### 11.2 Server flow

1. **Auth** — existing `requireAuth(passcode)` path.
2. **Validate** — `skill` ∈ `GCS_FOLDERS`, `text` non-empty + ≤1500 chars, integers in range.
3. **Idempotency check** (only if `filename_override` is set) — HEAD the would-be public URL; if 200, return early with `{ publicUrl, skipped: true }`.
4. **Build the prompt** — prepend a per-skill style prefix:
   - IELTS: `"Read the following in a calm, clear, professional IELTS speaking examiner tone with natural intonation: "`
   - CEFR: `"Read the following in a calm, clear, professional CEFR speaking examiner tone with natural intonation: "`
   - voice-preview: no prefix (sample text is already self-contained).
5. **Call Gemini TTS:**
   ```
   POST https://generativelanguage.googleapis.com/v1beta/models/<resolved-model>:generateContent
   x-goog-api-key: <GEMINI_API_KEY>
   Content-Type: application/json

   {
     "contents":[{"parts":[{"text":"<prefix><text>"}]}],
     "generationConfig":{
       "responseModalities":["AUDIO"],
       "speechConfig":{"voiceConfig":{"prebuiltVoiceConfig":{"voiceName":"<voice>"}}}
     }
   }
   ```
   Resolved model: looked up in the server-side TS equivalent of `_MMG_TTS_MODELS` (declared inside `admin-mocks/index.ts`; mirrors the client list verbatim). The server-side voice list is also re-declared in TS and is the authority for `unknown_voice` rejection — keeping the two lists in sync is part of the future-add-voice checklist (also documented as a comment above both consts).
6. **Decode** — `candidates[0].content.parts[0].inlineData.data` → base64 → bytes. MIME is `audio/L16;codecs=pcm;rate=24000` (24 kHz, 16-bit, mono).
7. **Wrap as WAV** — prepend a 44-byte RIFF/fmt/data header. Pure byte arithmetic, no extra dependency.
8. **Upload to GCS** — reuse `generateV4SignedPutUrl()` and `importPrivateKey()` from the same file.
   - Filename when `filename_override` is set: that exact name (preview path).
   - Otherwise: `{skill}-mock-{NN}-q{N}-{unix-seconds}.wav`. Timestamp suffix busts browser cache after regeneration.
   - Folder: `GCS_FOLDERS[skill]`.
   - Server-side `fetch(uploadUrl, { method:'PUT', body: wavBytes, headers:{'Content-Type':'audio/wav'} })`.
9. **Return** `{ publicUrl, objectPath, sizeBytes, durationSec }`.

### 11.3 Error surfaces (all return JSON `{ error: <code>, ... }`)

| Code | Cause | HTTP |
|---|---|---|
| `unauthorized` | bad passcode | 401 |
| `bad_request` | missing `skill` / `text` / `mock_number` / `question_number` | 400 |
| `text_too_long` | >1500 chars | 400 |
| `unknown_skill` | `skill` not in `GCS_FOLDERS` | 400 |
| `unknown_voice` | `voice` not in curated list | 400 |
| `unknown_model` | `model` not `budget`/`premium` | 400 |
| `gemini_api_key_missing` | env not set | 500 |
| `gemini_tts_failed` | passes through Gemini error message | 502 |
| `gcs_upload_failed` | GCS PUT non-2xx | 502 |

### 11.4 GCS folder additions

```ts
const GCS_FOLDERS: Record<string, string> = {
  // ... existing entries unchanged
  'voice-preview':   'Voice previews'    // NEW
};
```

## 12. Client helpers added to `landing.html`

```js
_mmgFieldAudio(label, id, value, opts)     // builds the URL + buttons + player row
_mmgGenerateAudio(qIndex, opts)            // calls server, fills URL, rebinds player
_mmgGenerateAllAudios(scope)               // sequential loop, scope = 'all' | 'part11'..'part3'
_mmgRenderVoicePreviewGrid(md)             // renders the Settings-tab voice picker
_mmgPlayVoicePreview(model, voice)         // resolves URL from hardcoded map, plays inline
_mmgFieldBulletList(label, id, items)      // IELTS Q7 cue card bullet rows
_mmgRenderSpPart(md, partKey)              // renders one Part tab — Q1..Q3 etc.
_mmgCollectSpPart(md, partKey)             // flushes a Part tab's edits into mock_data.questions[]
_mmgRenderSpSettings(md)                   // renders Settings tab (branding + images + voice + announcements)
_mmgCollectSpSettings(md)                  // flushes Settings tab
_mmgQuestionsForPart(md, partKey)          // computes the question subset for a part
_mmgRenderQuestionBlock(md, qIndex)        // shared question-block renderer used by all Part tabs
_mmgCollectQuestionBlock(md, qIndex)       // shared question-block collector
_mmgLevelTabsFor(type)                     // returns level array — A1..B2 or Band5..9
```

Existing helpers reused without modification: `_mmgFieldUploader`, `_mmgUploadStatus`, `_mmgPrettyBytes`, `_mmgCall`, `_mmgFieldSample`, `_mmgUpdatePreview`, `_mmgMark`, `_mmgUnmark`, `_mmgEsc`, `_mmgFieldText`, `_mmgFieldArea`, `_mmgFilterRows`, `_mmgGetMockData`, `_mmgSetMockData`.

Extensions to existing helpers:

- `_MMG_STRUCTURED_TYPES` — add 2 entries (CEFR speaking, IELTS speaking).
- `_MMG_TAB_TO_PANE` — add 5 entries (`sp_settings → SpSettings`, `sp_part11 → SpPart11`, `sp_part12 → SpPart12`, `sp_part2 → SpPart2`, `sp_part3 → SpPart3`).
- `_mmgInitTabs()` — no change; works as-is via `tabClass` lookup.
- `_mmgFlushStructuredToRaw()` — switch gains 5 new cases that delegate to `_mmgCollectSpPart` / `_mmgCollectSpSettings`.
- `_mmgRenderPane()` — switch gains 5 new cases delegating to `_mmgRenderSpPart` / `_mmgRenderSpSettings`.
- New `<button class="mmg-tab mmg-tab-cs mmg-tab-is" data-tab="sp_settings" ...>` markup added to the existing `#mmgTabsBar`. Six new buttons total. Existing Tokens + Raw buttons gain the two new classes so they appear for speaking too.

## 13. Save / persistence flow

Unchanged from writing editor:

1. User edits a structured pane.
2. Clicking another tab → `_mmgFlushStructuredToRaw()` → invokes the collector → mutates parsed `mock_data` → writes back to `#mmgFldData` textarea.
3. Clicking Save → existing path POSTs `{ action:'update', id, mock_data }` to `admin-mocks`.
4. Per-question audio override `[voice ▾][model ▾]` is **not flushed** anywhere — read once at click time, discarded.

## 14. Centre lockdown

Mock Settings is already locked to the `mock_stream` centre via `_cidGuard` (`landing.html` line 26000). No change. The new action runs server-side under the existing super-admin passcode auth, so clones cannot trigger generation even if they reach the function URL.

## 15. Files touched

- `site/landing.html` — primary edits: new tab buttons, new pane divs, new helpers, register types into `_MMG_STRUCTURED_TYPES`, extend switch statements.
- `supabase/functions/admin-mocks/index.ts` — new `generate_speaking_audio` action + `voice-preview` folder entry.
- `supabase/scripts/generate-voice-previews.mjs` — new run-once setup script.

No other files require modification. Vite-app and react-app are out of scope.

## 16. Test plan (manual)

1. **Open the panel** on `mock-stream.com/landing.html` → Mock Settings → Speaking → CEFR → Mock #1 (Supabase pilot, id=11). Confirm the Settings tab loads with branding + image + voice fields populated from the existing `mock_data`.
2. **Settings tab — voice preview.** Click ▶ Premium on each of the 8 voices; each plays a different sample. Pick `Charon`, switch model toggle to `Budget`. Refresh → `mock_data.settings.voice` and `tts_model` survive the round-trip.
3. **Part 1.1 tab.** Confirm Q1, Q2, Q3 render as 3 question blocks. Edit Q1 prompt; click Save; reopen → change persists.
4. **Audio generation.** On Q1, click 🎙. Spinner → URL field fills with a `https://storage.googleapis.com/.../cefr-speaking-mock-01-q1-<ts>.wav` URL → inline player plays the freshly-generated audio with examiner intonation.
5. **Per-question voice override.** Q2's `[voice ▾]` set to `Aoede`, click 🎙 → audio is in Aoede; selectors do not persist (re-open the modal — selectors revert to the Settings default).
6. **Bulk generation.** Click 🎙 Generate all audios in this part on Part 1.1 → 3 sequential generations, progress shows 1/3, 2/3, 3/3. Click 🎙 Generate all 8 audios on Settings tab → 8 sequential.
7. **Sample editor.** Q1 → Samples → A1 tab; type a sample. Use the toolbar to wrap a phrase as `phrasal`. Preview shows highlighted span. Switch to A2 tab. The A1 status dot turns ✓ if Uzbek is also filled, ● otherwise.
8. **CEFR Q4 hasImages.** Q4 block → `hasImages` toggle on → thumbnails appear (using Settings tab img1/img2 URLs). Open the runner page (`Speaking Mocks.html?sbmock=11&auto=1`) → Q4 displays the image pair.
9. **IELTS-only flows.**
   - Open IELTS speaking mock (id=10). Settings tab shows the 6 announcement textareas; CEFR mock does not.
   - Part 2 cue card question shows the `bulletPoints[]` editor; CEFR Part 2 (Q7) does not.
   - Sample tabs show `Band 5..9` instead of `A1..B2`.
10. **Validation: bad data.** Manually break the JSON in the Raw tab → switch to Part 1.1 → pane shows the existing "Cannot render: JSON is invalid" hint.
11. **Cache-bust.** Regenerate Q1 audio → audio src reflects a new `?t=<unix>` query → browser plays the new bytes immediately, not the previous version.
12. **`dev` push** → verify on mock-stream.com per the standing branch workflow rule. Only after that, push to `master`.

## 17. Out of scope (Phase 2 / future)

- Migrating remaining ~50 speaking mocks per skill from static JS to Supabase (separate Phase 2 plan, uses this editor).
- Multi-speaker dialogue audio (Gemini supports it; not needed for monologue questions).
- A/B comparing voices in a single panel UI (the per-question override + regen is enough for now).
- Persisting per-question voice/model in `mock_data` (currently only mock-level setting is saved).
- Any change to the runner pages.

## 18. Risks / open issues

- **Gemini TTS preview-model availability.** If Google deprecates `gemini-2.5-flash-preview-tts` / `gemini-2.5-pro-preview-tts` to GA names, both server-side `_MMG_TTS_MODELS` and the editor-side const need updating; preview script re-runs to refresh URLs.
- **Per-question override drift.** A user generating Q3 on `Aoede` then Q4 on `Charon` produces a mid-exam voice change for students. Mitigation: the override selectors live next to the 🎙 button intentionally, but the "Generate all" button always uses the mock-level setting, so the bulk path is always voice-consistent.
- **Long question text.** Cue card prompts (IELTS Q7) can run long. 1500-char cap chosen as a comfortable upper bound (≈250 words).
- **Public bucket exposure.** All audio URLs are public-read, same as today's listening audio. Acceptable per existing project posture.
