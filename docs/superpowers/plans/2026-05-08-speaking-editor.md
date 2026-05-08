# Speaking Editor Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fully-functional structured editor for CEFR Speaking and IELTS Speaking mocks to the existing Mock Settings panel in `site/landing.html`, with Gemini-TTS audio generation, GCS upload, voice picker, and parity with the writing editor's tab pattern.

**Architecture:** Extends the existing Mock Settings JSON-source-of-truth tab system. Two new entries register into `_MMG_STRUCTURED_TYPES`. Five new panes (Settings · Part 1.1 · Part 1.2 · Part 2 · Part 3) render question blocks shared by both exam types. One new server action `generate_speaking_audio` lives inside the existing `admin-mocks` Edge Function and reuses its GCS V4 signing infrastructure. A run-once Node script pre-generates 16 voice preview WAVs.

**Tech Stack:** Vanilla HTML+JS (no build step), Deno+TypeScript Supabase Edge Function, GCS V4 signed URLs (existing), Gemini 2.5 TTS API, Node.js (for the one-time preview generation script).

**Reference:** [Speaking Editor Design](../specs/2026-05-08-speaking-editor-design.md)

**Verification model:** No JS test runner exists in this repo. Each task ends with either a curl-based smoke (server-side changes) or a browser-action verification (client-side changes). Final task runs the full §16 manual test plan from the spec on the dev deploy.

---

## File structure

| File | Action | Responsibility |
|---|---|---|
| `supabase/functions/admin-mocks/index.ts` | modify | Add `voice-preview` GCS folder, WAV header helper, `generate_speaking_audio` action |
| `supabase/scripts/generate-voice-previews.mjs` | create | Run-once script generating the 16 preview WAVs |
| `site/landing.html` | modify | Tab buttons + panes + helpers + render/collect functions |

No other files are touched. `vite-app/` and `react-app/` are out of scope per project rules.

### `landing.html` — sections that get edited

All edits are in one file but logically grouped:

1. **Markup (~line 25909):** new tab buttons added to `#mmgTabsBar`; classes `mmg-tab-cs`/`mmg-tab-is` added to existing Tokens + Raw buttons.
2. **Markup (under existing panes):** five new `<div id="mmgPaneSp*" class="mmg-pane">` containers.
3. **JS const region (~line 26277):** `_MMG_STRUCTURED_TYPES` gets two new entries.
4. **JS const region (~line 26306):** `_MMG_TAB_TO_PANE` gets five new entries; new top-level consts `_MMG_TTS_VOICES`, `_MMG_TTS_MODELS`, `_MMG_VOICE_PREVIEW_URL`.
5. **JS switch (`_mmgFlushStructuredToRaw`, ~line 26350):** five new cases.
6. **JS switch (`_mmgRenderPane`, ~line 26380):** five new cases.
7. **JS helper region (after existing `_mmgUploadBind` and `_mmgFieldSample`):** all the new `_mmg*` helpers (~700 lines added).

---

## Task 1: Add `voice-preview` GCS folder + WAV header helper

**Files:**
- Modify: `supabase/functions/admin-mocks/index.ts:151-160` (extend `GCS_FOLDERS`)
- Modify: `supabase/functions/admin-mocks/index.ts` (add `pcmToWav` helper near other byte-arithmetic helpers around line 200)

- [ ] **Step 1: Add the new GCS folder entry**

In `supabase/functions/admin-mocks/index.ts`, locate the `GCS_FOLDERS` const (~line 151). Add the `voice-preview` entry as the last line:

```ts
const GCS_FOLDERS: Record<string, string> = {
  'ielts-writing':   'IELTS writing task one graphs',
  'cefr-writing':    'CEFR writing media',
  'ielts-listening': 'IELTS listening audio',
  'cefr-listening':  'CEFR listening audio',
  'ielts-speaking':  'IELTS speaking media',
  'cefr-speaking':   'CEFR speaking media',
  'ielts-reading':   'IELTS reading media',
  'cefr-reading':    'CEFR reading media',
  'voice-preview':   'Voice previews'
};
```

- [ ] **Step 2: Add the `pcmToWav` helper**

After `encodeObjectPath` (~line 214), add this helper:

```ts
// Wrap raw 16-bit signed PCM mono bytes in a 44-byte RIFF/WAVE header.
// Gemini TTS returns 24 kHz mono PCM (mime audio/L16;codecs=pcm;rate=24000).
// Browsers play WAV natively — wrap once on the server and we never need
// a client-side decoder.
function pcmToWav(pcmBytes: Uint8Array, sampleRate: number = 24000): Uint8Array {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = pcmBytes.length;
  const fileSize = 36 + dataSize;
  const buf = new Uint8Array(44 + dataSize);
  const dv = new DataView(buf.buffer);
  // "RIFF" chunk descriptor
  buf.set([0x52,0x49,0x46,0x46], 0);            // "RIFF"
  dv.setUint32(4, fileSize, true);
  buf.set([0x57,0x41,0x56,0x45], 8);            // "WAVE"
  // "fmt " sub-chunk
  buf.set([0x66,0x6d,0x74,0x20], 12);           // "fmt "
  dv.setUint32(16, 16, true);                   // PCM fmt chunk size
  dv.setUint16(20, 1, true);                    // audio format = PCM
  dv.setUint16(22, numChannels, true);
  dv.setUint32(24, sampleRate, true);
  dv.setUint32(28, byteRate, true);
  dv.setUint16(32, blockAlign, true);
  dv.setUint16(34, bitsPerSample, true);
  // "data" sub-chunk
  buf.set([0x64,0x61,0x74,0x61], 36);           // "data"
  dv.setUint32(40, dataSize, true);
  buf.set(pcmBytes, 44);
  return buf;
}
```

- [ ] **Step 3: Verify by deploying**

Run:
```bash
supabase functions deploy admin-mocks --no-verify-jwt
```
Expected: deploy succeeds (no TS errors). The new helper is syntactically correct and referenced by Task 3.

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/admin-mocks/index.ts
git commit -m "admin-mocks: add voice-preview GCS folder + pcmToWav helper"
```

---

## Task 2: Add `generate_speaking_audio` action — auth, validation, error responses

**Files:**
- Modify: `supabase/functions/admin-mocks/index.ts` (new switch case before `default:` at ~line 508)
- Modify: `supabase/functions/admin-mocks/index.ts` (add server-side voice/model consts near existing top-level consts)

- [ ] **Step 1: Add the curated voice + model consts**

Below `MAX_UPLOAD_MB` (~line 170), add:

```ts
// Curated TTS voice list — must match _MMG_TTS_VOICES in site/landing.html.
// Adding a new voice: update both lists AND re-run the preview-generation script.
const TTS_VOICES = ['Kore','Charon','Aoede','Orus','Achird','Vindemiatrix','Leda','Puck'];

// Two model tiers exposed in the editor — must match _MMG_TTS_MODELS in landing.html.
const TTS_MODELS: Record<string, string> = {
  budget:  'gemini-2.5-flash-preview-tts',
  premium: 'gemini-2.5-pro-preview-tts'
};

// Per-skill style prefix prepended to the question text. Empty string for
// voice-preview because the preview sample text is self-contained.
const TTS_STYLE_PREFIX: Record<string, string> = {
  'ielts-speaking': 'Read the following in a calm, clear, professional IELTS speaking examiner tone with natural intonation: ',
  'cefr-speaking':  'Read the following in a calm, clear, professional CEFR speaking examiner tone with natural intonation: ',
  'voice-preview':  ''
};
```

- [ ] **Step 2: Add the action switch case (skeleton — no Gemini call yet)**

Add this case right before `default:` in the actions switch (~line 508):

```ts
// ── Generate speaking question audio via Gemini TTS ───────────────
// Body: { skill, mock_number, question_number, text, voice?, model?, filename_override? }
// Returns: { publicUrl, objectPath, sizeBytes, durationSec, skipped? }
case 'generate_speaking_audio': {
  // 1) Validate inputs.
  const skill            = (body.skill || '') as string;
  const mockNumber       = Number(body.mock_number);
  const questionNumber   = Number(body.question_number);
  const text             = String(body.text || '').trim();
  const voice            = String(body.voice || 'Kore');
  const model            = String(body.model || 'premium');
  const filenameOverride = String(body.filename_override || '').trim();

  if (!skill)                               return json(400, { error: 'bad_request', detail: 'skill required' });
  if (!Number.isFinite(mockNumber)     || mockNumber     < 0) return json(400, { error: 'bad_request', detail: 'mock_number must be non-negative integer' });
  if (!Number.isFinite(questionNumber) || questionNumber < 0) return json(400, { error: 'bad_request', detail: 'question_number must be non-negative integer' });
  if (!text)                                return json(400, { error: 'bad_request', detail: 'text required' });
  if (text.length > 1500)                   return json(400, { error: 'text_too_long', limit: 1500, got: text.length });
  if (!GCS_FOLDERS[skill])                  return json(400, { error: 'unknown_skill', skill });
  if (!TTS_VOICES.includes(voice))          return json(400, { error: 'unknown_voice', voice });
  if (!TTS_MODELS[model])                   return json(400, { error: 'unknown_model', model });

  // 2) Stub return — Tasks 3 + 4 fill in TTS + GCS upload.
  return json(501, { error: 'not_implemented', stage: 'task2-skeleton' });
}
```

- [ ] **Step 3: Deploy and curl-smoke**

Run:
```bash
supabase functions deploy admin-mocks --no-verify-jwt
```

Then curl with **bad input** to confirm validation:
```bash
curl -s -X POST 'https://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/admin-mocks' \
  -H "apikey: sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2" \
  -H "Authorization: Bearer sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2" \
  -H 'Content-Type: application/json' \
  -d '{"action":"generate_speaking_audio","adminPasscode":"<PASSCODE>","skill":"unknown","mock_number":1,"question_number":1,"text":"hi"}'
```
Expected: `{"error":"unknown_skill","skill":"unknown"}` with HTTP 400.

Then curl with **valid input** to confirm we hit the not-implemented stub:
```bash
curl -s -X POST 'https://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/admin-mocks' \
  -H "apikey: sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2" \
  -H "Authorization: Bearer sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2" \
  -H 'Content-Type: application/json' \
  -d '{"action":"generate_speaking_audio","adminPasscode":"<PASSCODE>","skill":"cefr-speaking","mock_number":1,"question_number":1,"text":"hi","voice":"Kore","model":"premium"}'
```
Expected: `{"error":"not_implemented","stage":"task2-skeleton"}` with HTTP 501.

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/admin-mocks/index.ts
git commit -m "admin-mocks: scaffold generate_speaking_audio action with validation"
```

---

## Task 3: Implement Gemini TTS call inside `generate_speaking_audio`

**Files:**
- Modify: `supabase/functions/admin-mocks/index.ts` (replace the stub return in the case from Task 2)

- [ ] **Step 1: Implement the TTS call**

Replace the stub `return json(501, ...)` line with:

```ts
  // 3) Build the Gemini request.
  const apiKey = Deno.env.get('GEMINI_API_KEY') || '';
  if (!apiKey) return json(500, { error: 'gemini_api_key_missing' });

  const resolvedModel = TTS_MODELS[model];
  const stylePrefix   = TTS_STYLE_PREFIX[skill] || '';
  const fullText      = stylePrefix + text;

  let pcmBytes: Uint8Array;
  try {
    const ttsRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${resolvedModel}:generateContent`,
      {
        method: 'POST',
        headers: {
          'x-goog-api-key': apiKey,
          'Content-Type':   'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullText }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voice }
              }
            }
          }
        })
      }
    );
    if (!ttsRes.ok) {
      const errText = await ttsRes.text().catch(() => '');
      return json(502, { error: 'gemini_tts_failed', status: ttsRes.status, detail: errText.slice(0, 500) });
    }
    const ttsJson = await ttsRes.json();
    const b64 = ttsJson?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!b64) {
      return json(502, { error: 'gemini_tts_failed', detail: 'no inlineData in response', sample: JSON.stringify(ttsJson).slice(0, 400) });
    }
    pcmBytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  } catch (e) {
    return json(502, { error: 'gemini_tts_failed', detail: (e as Error).message });
  }

  // 4) Wrap PCM as WAV (24 kHz mono 16-bit).
  const wavBytes = pcmToWav(pcmBytes, 24000);
  const sizeBytes   = wavBytes.length;
  const durationSec = +(pcmBytes.length / 2 / 24000).toFixed(2);

  // 5) Stub return — Task 4 fills in GCS upload.
  return json(501, { error: 'not_implemented', stage: 'task3-tts-only', sizeBytes, durationSec });
```

- [ ] **Step 2: Deploy and verify the TTS call**

```bash
supabase functions deploy admin-mocks --no-verify-jwt

curl -s -X POST 'https://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/admin-mocks' \
  -H "apikey: sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2" \
  -H "Authorization: Bearer sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2" \
  -H 'Content-Type: application/json' \
  -d '{"action":"generate_speaking_audio","adminPasscode":"<PASSCODE>","skill":"cefr-speaking","mock_number":1,"question_number":1,"text":"Hello, do you like photographs?","voice":"Kore","model":"budget"}'
```
Expected: `{"error":"not_implemented","stage":"task3-tts-only","sizeBytes":<integer ~50000-200000>,"durationSec":<float ~2-5>}`. Non-zero `sizeBytes` proves Gemini returned audio bytes.

If you instead get `gemini_api_key_missing`: the secret needs to be set (`supabase secrets set GEMINI_API_KEY=...`).
If you get `gemini_tts_failed` with a 4xx status: check the model name + key permissions on the Google AI console.

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/admin-mocks/index.ts
git commit -m "admin-mocks: call Gemini TTS, wrap PCM as WAV"
```

---

## Task 4: Upload the WAV to GCS, return public URL

**Files:**
- Modify: `supabase/functions/admin-mocks/index.ts` (replace the Task-3 stub return with the upload flow)

- [ ] **Step 1: Implement the GCS upload**

Replace the `return json(501, { error: 'not_implemented', stage: 'task3-tts-only', ... })` line with:

```ts
  // 5) Resolve the object path. filename_override is used by the preview script
  //    (deterministic name); per-question audio gets a timestamp suffix to
  //    bust browser cache after regeneration.
  const folder = GCS_FOLDERS[skill];
  let objectPath: string;
  if (filenameOverride) {
    // Sanitise — same rules as gcs_signed_upload_url.
    const safe = filenameOverride
      .replace(/[\\\/\x00]/g, '')
      .replace(/^\.+/, '')
      .replace(/[^A-Za-z0-9._\- ]/g, '_')
      .slice(0, 200);
    if (!safe || safe === '.') return json(400, { error: 'bad_filename' });
    objectPath = `${folder}/${safe}`;
  } else {
    const nn = String(mockNumber).padStart(2, '0');
    const ts = Math.floor(Date.now() / 1000);
    objectPath = `${folder}/${skill}-mock-${nn}-q${questionNumber}-${ts}.wav`;
  }

  // 6) Idempotency — only when filename_override is set, skip if the file
  //    already exists at that exact path.
  const publicUrl = `https://storage.googleapis.com/${GCS_BUCKET}/${encodeObjectPath(objectPath)}`;
  if (filenameOverride) {
    try {
      const headRes = await fetch(publicUrl, { method: 'HEAD' });
      if (headRes.ok) {
        return json(200, { publicUrl, objectPath, sizeBytes, durationSec, skipped: true });
      }
    } catch (_) { /* not present — proceed to generate */ }
  }

  // 7) Sign + PUT to GCS using the existing service-account infra.
  const sa = Deno.env.get('GCS_SERVICE_ACCOUNT_JSON') || '';
  if (!sa) return json(500, { error: 'gcs_secret_missing' });
  let saObj: { client_email: string; private_key: string };
  try { saObj = JSON.parse(sa); } catch { return json(500, { error: 'gcs_secret_invalid' }); }
  let privateKey: CryptoKey;
  try { privateKey = await importPrivateKey(saObj.private_key); }
  catch (e) { return json(500, { error: 'gcs_key_import_failed', detail: (e as Error).message }); }

  const { uploadUrl } = await generateV4SignedPutUrl({
    objectPath,
    contentType: 'audio/wav',
    ttlSeconds: 600,
    serviceAccountEmail: saObj.client_email,
    privateKey
  });

  try {
    const putRes = await fetch(uploadUrl, {
      method:  'PUT',
      headers: { 'Content-Type': 'audio/wav' },
      body:    wavBytes
    });
    if (!putRes.ok) {
      const errText = await putRes.text().catch(() => '');
      return json(502, { error: 'gcs_upload_failed', status: putRes.status, detail: errText.slice(0, 400) });
    }
  } catch (e) {
    return json(502, { error: 'gcs_upload_failed', detail: (e as Error).message });
  }

  return json(200, { publicUrl, objectPath, sizeBytes, durationSec });
```

- [ ] **Step 2: Deploy and end-to-end smoke**

```bash
supabase functions deploy admin-mocks --no-verify-jwt

curl -s -X POST 'https://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/admin-mocks' \
  -H "apikey: sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2" \
  -H "Authorization: Bearer sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2" \
  -H 'Content-Type: application/json' \
  -d '{"action":"generate_speaking_audio","adminPasscode":"<PASSCODE>","skill":"cefr-speaking","mock_number":99,"question_number":1,"text":"Hello, do you like photographs?","voice":"Kore","model":"budget"}'
```
Expected: `{"publicUrl":"https://storage.googleapis.com/mockstream-listening-audio/CEFR%20speaking%20media/cefr-speaking-mock-99-q1-<timestamp>.wav","objectPath":"...","sizeBytes":<integer>,"durationSec":<float>}`.

Then open `publicUrl` in a browser → audio file plays Gemini-generated speech in the Kore voice with examiner intonation.

Then run **idempotency test** with `filename_override`:
```bash
curl -s -X POST 'https://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/admin-mocks' \
  -H "apikey: sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2" \
  -H "Authorization: Bearer sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2" \
  -H 'Content-Type: application/json' \
  -d '{"action":"generate_speaking_audio","adminPasscode":"<PASSCODE>","skill":"voice-preview","mock_number":0,"question_number":0,"text":"Test sample.","voice":"Kore","model":"budget","filename_override":"budget-Kore.wav"}'
```
Run twice. Expected: first call returns `{publicUrl, ...}` without `skipped`; second call returns same `publicUrl` with `"skipped":true`.

Then clean up the test file:
```bash
gcloud storage rm 'gs://mockstream-listening-audio/CEFR speaking media/cefr-speaking-mock-99-q1-*.wav'
gcloud storage rm 'gs://mockstream-listening-audio/Voice previews/budget-Kore.wav'
```

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/admin-mocks/index.ts
git commit -m "admin-mocks: upload generated TTS audio to GCS, return publicUrl"
```

---

## Task 5: Run-once script that generates the 16 voice preview WAVs

**Files:**
- Create: `supabase/scripts/generate-voice-previews.mjs`

- [ ] **Step 1: Write the script**

Create `supabase/scripts/generate-voice-previews.mjs`:

```js
#!/usr/bin/env node
// Run-once: generate the 16 voice-preview WAVs (8 voices × 2 models).
//
// Usage:
//   ADMIN_PASSCODE=... node supabase/scripts/generate-voice-previews.mjs
//
// Idempotent: server-side HEADs the GCS public URL when filename_override
// is set and skips already-generated files. Re-run safe.

const FN_URL  = 'https://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/admin-mocks';
const ANON    = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
const SAMPLE  = "Welcome to your speaking exam. Let's begin with the first question.";
const VOICES  = ['Kore','Charon','Aoede','Orus','Achird','Vindemiatrix','Leda','Puck'];
const MODELS  = ['budget','premium'];

const passcode = process.env.ADMIN_PASSCODE;
if (!passcode) {
  console.error('Set ADMIN_PASSCODE env var (super-admin passcode).');
  process.exit(1);
}

let ok = 0, skipped = 0, failed = 0;
for (const model of MODELS) {
  for (const voice of VOICES) {
    const filename = `${model}-${voice}.wav`;
    process.stdout.write(`  ${filename.padEnd(36)} `);
    try {
      const res = await fetch(FN_URL, {
        method: 'POST',
        headers: {
          'apikey':        ANON,
          'Authorization': `Bearer ${ANON}`,
          'Content-Type':  'application/json'
        },
        body: JSON.stringify({
          action:            'generate_speaking_audio',
          adminPasscode:     passcode,
          skill:             'voice-preview',
          mock_number:       0,
          question_number:   0,
          text:              SAMPLE,
          voice,
          model,
          filename_override: filename
        })
      });
      const j = await res.json();
      if (!res.ok || j.error) {
        console.log(`✗ ${j.error || res.status}`);
        failed++;
      } else if (j.skipped) {
        console.log(`↺ skipped (already exists)`);
        skipped++;
      } else {
        console.log(`✓ ${(j.sizeBytes/1024).toFixed(0)} KB · ${j.durationSec}s`);
        ok++;
      }
    } catch (e) {
      console.log(`✗ ${e.message}`);
      failed++;
    }
  }
}
console.log(`\nDone: ${ok} generated · ${skipped} skipped · ${failed} failed.`);
process.exit(failed ? 1 : 0);
```

- [ ] **Step 2: Run the script**

```bash
ADMIN_PASSCODE=<PASSCODE> node supabase/scripts/generate-voice-previews.mjs
```
Expected output:
```
  budget-Kore.wav                    ✓ 142 KB · 5.21s
  budget-Charon.wav                  ✓ 138 KB · 5.04s
  ... (14 more lines, all ✓)

Done: 16 generated · 0 skipped · 0 failed.
```

- [ ] **Step 3: Verify the files in GCS**

Browser-test one URL:
```
https://storage.googleapis.com/mockstream-listening-audio/Voice%20previews/premium-Kore.wav
```
Expected: audio plays "Welcome to your speaking exam. Let's begin with the first question." in the Kore voice (firm, professional).

Re-run the script:
```bash
ADMIN_PASSCODE=<PASSCODE> node supabase/scripts/generate-voice-previews.mjs
```
Expected: all 16 lines say `↺ skipped (already exists)`. Confirms idempotency.

- [ ] **Step 4: Commit**

```bash
git add supabase/scripts/generate-voice-previews.mjs
git commit -m "scripts: add run-once voice preview generator (16 WAVs to GCS)"
```

---

## Task 6: Add new tab buttons + pane scaffolding to `landing.html`

**Files:**
- Modify: `site/landing.html` (~line 25909, the `#mmgTabsBar` block)
- Modify: `site/landing.html` (~line 25910 onward, where panes live)

- [ ] **Step 1: Locate and update the tab bar markup**

Find the existing `<div id="mmgTabsBar" ...>` block (~line 25909). Add `mmg-tab-cs mmg-tab-is` to the existing **Settings**, **Tokens**, and **Raw** buttons so they appear for speaking too. Insert **four** new Part buttons before the Tokens button. The block should end up as:

```html
<div id="mmgTabsBar" class="mmg-tabs-bar" style="display:none;">
  <button class="mmg-tab mmg-tab-cw mmg-tab-iw mmg-tab-cs mmg-tab-is" data-tab="settings"  onclick="_mmgSwitchTab('settings')">Settings</button>
  <button class="mmg-tab mmg-tab-cw"           data-tab="part1"     onclick="_mmgSwitchTab('part1')">Part 1 (shared)</button>
  <button class="mmg-tab mmg-tab-cw"           data-tab="t11"       onclick="_mmgSwitchTab('t11')">Task 1.1</button>
  <button class="mmg-tab mmg-tab-cw"           data-tab="t12"       onclick="_mmgSwitchTab('t12')">Task 1.2</button>
  <button class="mmg-tab mmg-tab-cw"           data-tab="t2"        onclick="_mmgSwitchTab('t2')">Task 2</button>
  <button class="mmg-tab mmg-tab-iw"           data-tab="iw_task1"  onclick="_mmgSwitchTab('iw_task1')">Task 1</button>
  <button class="mmg-tab mmg-tab-iw"           data-tab="iw_task2"  onclick="_mmgSwitchTab('iw_task2')">Task 2</button>
  <button class="mmg-tab mmg-tab-cs mmg-tab-is" data-tab="sp_part11" onclick="_mmgSwitchTab('sp_part11')">Part 1.1</button>
  <button class="mmg-tab mmg-tab-cs mmg-tab-is" data-tab="sp_part12" onclick="_mmgSwitchTab('sp_part12')">Part 1.2</button>
  <button class="mmg-tab mmg-tab-cs mmg-tab-is" data-tab="sp_part2"  onclick="_mmgSwitchTab('sp_part2')">Part 2</button>
  <button class="mmg-tab mmg-tab-cs mmg-tab-is" data-tab="sp_part3"  onclick="_mmgSwitchTab('sp_part3')">Part 3</button>
  <button class="mmg-tab mmg-tab-cw mmg-tab-iw" data-tab="samples"  onclick="_mmgSwitchTab('samples')">Samples</button>
  <button class="mmg-tab mmg-tab-cw mmg-tab-iw" data-tab="vocab"    onclick="_mmgSwitchTab('vocab')">Vocabulary</button>
  <button class="mmg-tab mmg-tab-cw mmg-tab-iw mmg-tab-cs mmg-tab-is" data-tab="tokens"   onclick="_mmgSwitchTab('tokens')">Tokens</button>
  <button class="mmg-tab mmg-tab-raw mmg-tab-cw mmg-tab-iw mmg-tab-cs mmg-tab-is" data-tab="raw" onclick="_mmgSwitchTab('raw')">⚙ Raw JSON</button>
</div>
```

Settings tab is shared across all four exam types — note `mmg-tab-cs mmg-tab-is` were added to it.

- [ ] **Step 2: Add the four new pane divs**

Just below the existing pane divs (e.g., after `<div id="mmgPaneRaw" class="mmg-pane mmg-pane-raw">…</div>` — find this region) add:

```html
<div id="mmgPaneSpPart11" class="mmg-pane"></div>
<div id="mmgPaneSpPart12" class="mmg-pane"></div>
<div id="mmgPaneSpPart2"  class="mmg-pane"></div>
<div id="mmgPaneSpPart3"  class="mmg-pane"></div>
```

(No new `mmgPaneSpSettings` pane — Settings reuses the existing `mmgPaneSettings` since it's already shared with writing. Speaking-specific render code branches inside `_mmgRenderSettings` — done in Task 11.)

- [ ] **Step 3: Verify the markup is in place**

Open `site/landing.html` in your browser via the dev site (`mock-stream.com/landing.html`). Open Mock Settings → Speaking → CEFR → Mock #11 (the Phase-1 pilot). The four new Part tab buttons appear in the sidebar but clicking them does nothing yet (panes are empty).

- [ ] **Step 4: Commit**

```bash
git add site/landing.html
git commit -m "landing: add speaking editor tab buttons + pane scaffolding"
```

---

## Task 7: Register types into the structured-editor switch

**Files:**
- Modify: `site/landing.html` (~line 26277, `_MMG_STRUCTURED_TYPES`)
- Modify: `site/landing.html` (~line 26306, `_MMG_TAB_TO_PANE`)
- Modify: `site/landing.html` (~line 26350, `_mmgFlushStructuredToRaw` switch)
- Modify: `site/landing.html` (~line 26380, `_mmgRenderPane` switch)

- [ ] **Step 1: Register the two new structured types**

Locate `var _MMG_STRUCTURED_TYPES = { ... };` (~line 26277). Replace with:

```js
var _MMG_STRUCTURED_TYPES = {
  'cefr-writing':   { tabClass: 'mmg-tab-cw', defaultTab: 'part1' },
  'ielts-writing':  { tabClass: 'mmg-tab-iw', defaultTab: 'iw_task1' },
  'cefr-speaking':  { tabClass: 'mmg-tab-cs', defaultTab: 'settings' },
  'ielts-speaking': { tabClass: 'mmg-tab-is', defaultTab: 'settings' }
};
```

- [ ] **Step 2: Extend the tab→pane map**

Locate `var _MMG_TAB_TO_PANE = { ... };` (~line 26306). Replace with:

```js
var _MMG_TAB_TO_PANE = {
  settings:'Settings', part1:'Part1', t11:'T11', t12:'T12', t2:'T2',
  iw_task1:'IwTask1', iw_task2:'IwTask2',
  sp_part11:'SpPart11', sp_part12:'SpPart12', sp_part2:'SpPart2', sp_part3:'SpPart3',
  samples:'Samples',
  vocab:'Vocab', tokens:'Tokens', raw:'Raw'
};
```

- [ ] **Step 3: Add cases to the flush switch**

In `_mmgFlushStructuredToRaw` (~line 26350), the existing `switch (tab) {` block. Add these cases before the final `}`:

```js
        case 'sp_part11': _mmgCollectSpPart(md, 'part11'); break;
        case 'sp_part12': _mmgCollectSpPart(md, 'part12'); break;
        case 'sp_part2':  _mmgCollectSpPart(md, 'part2');  break;
        case 'sp_part3':  _mmgCollectSpPart(md, 'part3');  break;
```

(The `settings` case already exists for writing — Task 11 extends `_mmgCollectSettings` to handle speaking too, no new case needed here.)

- [ ] **Step 4: Add cases to the render switch**

In `_mmgRenderPane` (~line 26380), add inside the `switch (tabId) {`:

```js
        case 'sp_part11': _mmgRenderSpPart(md, 'part11'); break;
        case 'sp_part12': _mmgRenderSpPart(md, 'part12'); break;
        case 'sp_part2':  _mmgRenderSpPart(md, 'part2');  break;
        case 'sp_part3':  _mmgRenderSpPart(md, 'part3');  break;
```

- [ ] **Step 5: Add no-op stubs so the file parses**

The four functions referenced above (`_mmgRenderSpPart`, `_mmgCollectSpPart`) are defined in Task 10. For now, add temporary no-op stubs at the top of the speaking-helpers region (just after `_mmgUploadBind` ends, around line 26830). These will be fully implemented in later tasks — adding them now keeps the page loadable without `ReferenceError`s between commits:

```js
// ═══════════════════════════════════════════════════════════════════════
//   Speaking editor — CEFR + IELTS. Reuses sample editor toolbar +
//   GCS upload helpers from the writing editor; adds Gemini TTS audio
//   generation per question.
// ═══════════════════════════════════════════════════════════════════════
function _mmgRenderSpPart(md, partKey) {
  var pane = document.getElementById('mmgPaneSp' + partKey.charAt(0).toUpperCase() + partKey.slice(1));
  if (pane) pane.innerHTML = '<div class="mmg-empty-hint">Pane stub — implemented in Task 10.</div>';
}
function _mmgCollectSpPart(md, partKey) { /* stub — Task 10 */ }
```

- [ ] **Step 6: Verify in browser**

Reload `landing.html`, open Mock Settings → CEFR Speaking → Mock #11. Clicking the four new Part tabs swaps the pane content to the placeholder text. Switching between Part tabs and Raw tab still works for existing logic.

- [ ] **Step 7: Commit**

```bash
git add site/landing.html
git commit -m "landing: register speaking types, extend tab/pane switches"
```

---

## Task 8: Add hardcoded TTS voice + model + preview-URL constants

**Files:**
- Modify: `site/landing.html` (add new top-level consts in the speaking-helpers region from Task 7)

- [ ] **Step 1: Add the consts**

Just after the section header comment block from Task 7 step 5 (and **before** the `_mmgRenderSpPart` stub), insert:

```js
// Curated list — must match TTS_VOICES in supabase/functions/admin-mocks/index.ts.
// Adding a voice: update both lists AND re-run generate-voice-previews.mjs.
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
var _MMG_TTS_MODELS = [
  { code: 'budget',  label: 'Budget (Flash) — fast, cheap' },
  { code: 'premium', label: 'Premium (Pro) — richer intonation' }
];
// Pre-generated voice preview URLs in GCS (created by generate-voice-previews.mjs).
function _mmgVoicePreviewUrl(model, voice) {
  return 'https://storage.googleapis.com/mockstream-listening-audio/Voice%20previews/'
       + encodeURIComponent(model) + '-' + encodeURIComponent(voice) + '.wav';
}
```

- [ ] **Step 2: Verify the consts load**

Reload `landing.html`. In the browser console:
```js
_MMG_TTS_VOICES.length  // → 8
_MMG_TTS_MODELS.length  // → 2
_mmgVoicePreviewUrl('premium', 'Kore')  // → "https://storage.googleapis.com/.../premium-Kore.wav"
```
Open the returned URL in a new tab → audio plays (validates Task 5 succeeded).

- [ ] **Step 3: Commit**

```bash
git add site/landing.html
git commit -m "landing: add TTS voice/model consts + preview URL helper"
```

---

## Task 9: Audio row helper + per-question generation helpers

**Files:**
- Modify: `site/landing.html` (add helpers in speaking region)

- [ ] **Step 1: Add `_mmgFieldAudio`**

After `_mmgVoicePreviewUrl`, add:

```js
// Audio row: URL input + 🎙 Generate + 📤 Upload + per-Q voice/model + inline player.
// `id` is the unique DOM id prefix; the row writes to `<id>` (text input) and
// reads voice/model from `<id>_voice` and `<id>_model` (selects).
function _mmgFieldAudio(label, id, value, opts) {
  opts = opts || {};
  var skill   = opts.skill   || 'cefr-speaking';
  var qIndex  = opts.qIndex == null ? -1 : opts.qIndex;
  var defVoice = opts.defaultVoice || 'Kore';
  var defModel = opts.defaultModel || 'premium';
  var voiceOpts = _MMG_TTS_VOICES.map(function(v){
    return '<option value="' + v.code + '"' + (v.code === defVoice ? ' selected' : '') + '>' + _mmgEsc(v.code) + '</option>';
  }).join('');
  var modelOpts = _MMG_TTS_MODELS.map(function(m){
    return '<option value="' + m.code + '"' + (m.code === defModel ? ' selected' : '') + '>' + _mmgEsc(m.label) + '</option>';
  }).join('');
  return '<div class="mmg-field"><label>' + _mmgEsc(label) + '</label>'
    + '<div class="mmg-audio-row" style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">'
    +   '<input type="text" id="' + id + '" value="' + _mmgEsc(value || '') + '" '
    +     'placeholder="https://… or empty (TTS fallback)" '
    +     'oninput="_mmgRebindAudioPlayer(\'' + id + '\')" style="flex:1;min-width:240px;">'
    +   '<button type="button" class="mmg-icon-btn" title="Generate via Gemini TTS" '
    +     'onclick="_mmgGenerateAudio(' + qIndex + ', \'' + id + '\')">🎙</button>'
    +   '<button type="button" class="mmg-icon-btn" id="' + id + '_upbtn" title="Upload MP3/WAV">📤</button>'
    +   '<input type="file" id="' + id + '_upfile" accept="audio/*" style="display:none;">'
    +   '<select id="' + id + '_voice" title="Voice override (this regen only)" style="font-size:12px;padding:4px;">' + voiceOpts + '</select>'
    +   '<select id="' + id + '_model" title="Model override (this regen only)" style="font-size:12px;padding:4px;">' + modelOpts + '</select>'
    + '</div>'
    + '<div id="' + id + '_upprog" class="mmg-upload-progress"></div>'
    + '<audio id="' + id + '_audio" controls preload="none" style="' + (value ? 'display:block;' : 'display:none;') + 'width:100%;margin-top:6px;" src="' + (value ? _mmgEsc(value) + (value.indexOf('?') === -1 ? '?t=' + Date.now() : '') : '') + '"></audio>'
    + '</div>';
}

// Re-bind <audio src> when the URL input changes. Called by oninput.
window._mmgRebindAudioPlayer = function (id) {
  var input = document.getElementById(id);
  var aud   = document.getElementById(id + '_audio');
  if (!input || !aud) return;
  var url = (input.value || '').trim();
  if (!url) { aud.style.display = 'none'; aud.removeAttribute('src'); return; }
  var sep = url.indexOf('?') === -1 ? '?' : '&';
  aud.src = url + sep + 't=' + Date.now();
  aud.style.display = 'block';
};
```

- [ ] **Step 2: Add `_mmgGenerateAudio`**

```js
// Generate audio for question `qIndex` and fill the URL input at `id`.
// Reads the current text from mock_data.questions[qIndex].prompt and the
// per-Q voice/model overrides from the row's selects (defaulting to mock-level).
window._mmgGenerateAudio = async function (qIndex, id) {
  var md = _mmgGetMockData();
  if (!md || !md.questions || !md.questions[qIndex]) {
    alert('Question data not found. Save the prompt first.');
    return;
  }
  var q = md.questions[qIndex];
  var promptText = (q.prompt || '').trim();
  if (!promptText) { alert('Question prompt is empty — write the prompt first.'); return; }

  var voiceEl = document.getElementById(id + '_voice');
  var modelEl = document.getElementById(id + '_model');
  var voice   = voiceEl ? voiceEl.value : (md.settings && md.settings.voice) || 'Kore';
  var model   = modelEl ? modelEl.value : (md.settings && md.settings.tts_model) || 'premium';

  var skill = _mmgCurrentType(); // 'cefr-speaking' | 'ielts-speaking'
  var mockNumber = parseInt(document.getElementById('mmgFldNum').value || '0', 10) || 0;

  var btnEl = document.querySelector('.mmg-audio-row [onclick*="_mmgGenerateAudio(' + qIndex + ',"]');
  if (btnEl) { btnEl.disabled = true; btnEl.textContent = '⏳'; }

  try {
    var j = await _mmgCall('generate_speaking_audio', {
      skill, mock_number: mockNumber, question_number: q.number || (qIndex + 1),
      text: promptText, voice, model
    });
    if (!j || !j.publicUrl) throw new Error((j && j.error) || 'no publicUrl');
    var input = document.getElementById(id);
    if (input) {
      input.value = j.publicUrl;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    _mmgStatus('🎙 Generated ' + (j.durationSec || '?') + 's audio for Q' + (q.number || (qIndex + 1)), '#15803d');
  } catch (e) {
    alert('Audio generation failed: ' + (e.message || e));
  } finally {
    if (btnEl) { btnEl.disabled = false; btnEl.textContent = '🎙'; }
  }
};
```

- [ ] **Step 3: Add `_mmgGenerateAllAudios`**

```js
// Sequential bulk generation. scope: 'all' or 'part11'/'part12'/'part2'/'part3'.
// Stops at the first failure so the user can see which question failed.
window._mmgGenerateAllAudios = async function (scope) {
  var md = _mmgGetMockData(); if (!md || !md.questions) return;
  var indices = [];
  for (var i = 0; i < md.questions.length; i++) {
    if (scope === 'all' || _mmgQuestionPartKey(md.questions[i]) === scope) indices.push(i);
  }
  if (!indices.length) { alert('No questions found for scope: ' + scope); return; }
  if (!confirm('Generate audio for ' + indices.length + ' question(s)? Existing URLs will be overwritten.')) return;

  for (var k = 0; k < indices.length; k++) {
    var qIndex = indices[k];
    _mmgStatus('Generating ' + (k + 1) + ' / ' + indices.length + ' (Q' + (md.questions[qIndex].number || (qIndex + 1)) + ')…');
    var id = 'spQ' + qIndex + '_audio';
    try {
      await window._mmgGenerateAudio(qIndex, id);
    } catch (e) {
      _mmgStatus('Stopped at Q' + (md.questions[qIndex].number || (qIndex + 1)) + ' — ' + e.message, '#dc2626');
      return;
    }
  }
  _mmgStatus('✓ All ' + indices.length + ' audios generated.', '#15803d');
};
```

- [ ] **Step 4: Add `_mmgQuestionPartKey` mapping helper**

```js
// Map a question's `part` field to one of the 4 Part tab keys.
// CEFR uses Q-numbers (1–3 → part11, 4–6 → part12, 7 → part2, 8 → part3).
// IELTS uses the `part` string directly.
function _mmgQuestionPartKey(q) {
  if (!q) return 'part11';
  var p = String(q.part || '').toLowerCase();
  if (p.indexOf('part 3') !== -1) return 'part3';
  if (p.indexOf('part 2') !== -1) return 'part2'; // matches "Part 2" and "Part 2 Follow-up"
  // Part 1 — split by question number for CEFR (Q1–3 vs Q4–6).
  var n = Number(q.number || 0);
  if (n >= 4 && n <= 6) return 'part12';
  return 'part11';
}
```

- [ ] **Step 5: Verify in browser console**

Open Mock Settings → CEFR Speaking → Mock #11. In console:
```js
_mmgQuestionPartKey({ number: 1, part: 'Part 1' })  // → 'part11'
_mmgQuestionPartKey({ number: 5, part: 'Part 1' })  // → 'part12'
_mmgQuestionPartKey({ number: 7, part: 'Part 2' })  // → 'part2'
_mmgQuestionPartKey({ number: 8, part: 'Part 3' })  // → 'part3'

// Build a temporary audio row in console:
document.body.insertAdjacentHTML('beforeend', _mmgFieldAudio('Test', 'tmpAud', '', { skill:'cefr-speaking' }));
// → DOM appears with all controls. Type any URL into the input → <audio> shows.
// Clean up: document.querySelector('.mmg-field:last-of-type').remove();
```

- [ ] **Step 6: Commit**

```bash
git add site/landing.html
git commit -m "landing: add audio row + Gemini-gen + bulk-gen + part-key helpers"
```

---

## Task 10: Render shared question block + Part-pane functions

**Files:**
- Modify: `site/landing.html` (extends speaking helpers from Task 9; replaces the stubs from Task 7)

- [ ] **Step 1: Add `_mmgLevelTabsFor`**

```js
// Returns the level array for the given mock_type. Each entry is
// { key: 'A1', label: 'A1', enKey: 'sampleA1', uzKey: 'uzSampleA1' }.
// `Main` maps to sampleAnswer / uzSampleAnswer.
function _mmgLevelTabsFor(type) {
  var levels = [{ key: 'main', label: 'Main', enKey: 'sampleAnswer', uzKey: 'uzSampleAnswer' }];
  if (type === 'cefr-speaking') {
    ['A1','A2','B1','B2'].forEach(function(L) {
      levels.push({ key: L.toLowerCase(), label: L, enKey: 'sample' + L, uzKey: 'uzSample' + L });
    });
  } else {
    [5,6,7,8,9].forEach(function(N) {
      levels.push({ key: 'band' + N, label: 'Band ' + N, enKey: 'sampleBand' + N, uzKey: 'uzSampleBand' + N });
    });
  }
  return levels;
}
// Status dot for a level: ✓ green = both filled, ● amber = one filled, ○ grey = both empty.
function _mmgLevelStatus(q, level) {
  var en = (q[level.enKey] || '').trim();
  var uz = (q[level.uzKey] || '').trim();
  if (en && uz) return '✓';
  if (en || uz) return '●';
  return '○';
}
```

- [ ] **Step 2: Add `_mmgRenderQuestionBlock`**

```js
// Render one collapsed question block. qIndex is the absolute index into
// mock_data.questions. Output is a `<details>` so blocks collapse independently.
function _mmgRenderQuestionBlock(md, qIndex) {
  var q = md.questions[qIndex] || {};
  var type = _mmgCurrentType();
  var levels = _mmgLevelTabsFor(type);
  var idP = 'spQ' + qIndex;            // id prefix unique per question

  // Header.
  var headerExtras = '';
  if (type === 'ielts-speaking' && q.topic) {
    headerExtras = ' · <span style="color:#64748b;">' + _mmgEsc(q.topic) + '</span>';
  }

  // Audio row.
  var audioHtml = _mmgFieldAudio('Audio (URL or upload)', idP + '_audio', q.audioFile || '', {
    skill: type, qIndex: qIndex,
    defaultVoice: (md.settings && md.settings.voice) || 'Kore',
    defaultModel: (md.settings && md.settings.tts_model) || 'premium'
  });

  // Timing.
  var timingHtml =
      '<div class="mmg-field-row" style="display:flex;gap:10px;">'
    +   '<div class="mmg-field" style="flex:1;"><label>Prep time (sec)</label>'
    +     '<input type="number" min="0" id="' + idP + '_prep" value="' + (q.prepTime == null ? '' : q.prepTime) + '"></div>'
    +   '<div class="mmg-field" style="flex:1;"><label>Speak time (sec)</label>'
    +     '<input type="number" min="0" id="' + idP + '_speak" value="' + (q.speakTime == null ? '' : q.speakTime) + '"></div>'
    + '</div>';

  // CEFR Q4 hasImages toggle.
  var imagesHtml = '';
  if (type === 'cefr-speaking' && (q.number === 4 || q.hasImages)) {
    var checked = q.hasImages ? ' checked' : '';
    var img1 = (md.images && md.images.img1) || '';
    var img2 = (md.images && md.images.img2) || '';
    imagesHtml =
        '<div class="mmg-field"><label><input type="checkbox" id="' + idP + '_hasimg"' + checked + '> hasImages (Q4 image-pair)</label>'
      +   '<div class="mmg-field-help">Images come from Settings tab → Top-level images. Toggle controls whether the runner displays them on this question.</div>'
      +   (q.hasImages && (img1 || img2) ? '<div style="display:flex;gap:8px;margin-top:6px;">'
          + (img1 ? '<img src="' + _mmgEsc(img1) + '" style="max-width:120px;max-height:80px;border:1px solid #e2e8f0;border-radius:6px;">' : '')
          + (img2 ? '<img src="' + _mmgEsc(img2) + '" style="max-width:120px;max-height:80px;border:1px solid #e2e8f0;border-radius:6px;">' : '')
          + '</div>' : '')
      + '</div>';
  }

  // IELTS cue card bullet points.
  var bulletsHtml = '';
  if (type === 'ielts-speaking' && _mmgQuestionPartKey(q) === 'part2' && q.part === 'Part 2') {
    bulletsHtml = _mmgFieldBulletList('Cue card bullet points', idP + '_bullets', q.bulletPoints || []);
  }

  // Sample editor with level tabs.
  var levelChips = levels.map(function(L) {
    var dot = _mmgLevelStatus(q, L);
    return '<button type="button" class="mmg-level-chip" data-level="' + L.key + '" '
      + 'onclick="_mmgSpPickLevel(' + qIndex + ', \'' + L.key + '\')">'
      + '<span class="mmg-level-dot mmg-level-dot-' + dot.charCodeAt(0) + '">' + dot + '</span> '
      + _mmgEsc(L.label) + '</button>';
  }).join('');

  // Initial active level state lives on a per-question window key.
  window._mmgSpLevel = window._mmgSpLevel || {};
  if (!window._mmgSpLevel[qIndex]) window._mmgSpLevel[qIndex] = 'main';
  var activeLevel = window._mmgSpLevel[qIndex];
  var activeLevelDef = levels.find(function(L){ return L.key === activeLevel; }) || levels[0];

  var samplesHtml =
      '<div class="mmg-field"><label>Samples (English ↔ Uzbek)</label>'
    +   '<div class="mmg-level-chips" style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px;">' + levelChips + '</div>'
    +   '<div class="mmg-sample-pair" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">'
    +     '<div>' + _mmgFieldSample('English (' + activeLevelDef.label + ')', idP + '_en_' + activeLevel, q[activeLevelDef.enKey] || '', '') + '</div>'
    +     '<div>' + _mmgFieldArea('Uzbek (' + activeLevelDef.label + ')', idP + '_uz_' + activeLevel, q[activeLevelDef.uzKey] || '', '', 200) + '</div>'
    +   '</div>'
    + '</div>';

  // Vocabulary collapse.
  var voc = q.vocabulary || {};
  var vocabHtml =
      '<details class="mmg-vocab-details" ' + (voc.title || (voc.sentenceStarters && voc.sentenceStarters.length) ? 'open' : '') + '>'
    +   '<summary style="cursor:pointer;font-weight:600;color:#475569;">📚 Vocabulary</summary>'
    +   '<div class="mmg-field"><label>Title</label><input type="text" id="' + idP + '_voct" value="' + _mmgEsc(voc.title || '') + '" placeholder="e.g., Q1 - …"></div>'
    +   _mmgVocabSubList(idP + '_vocs', 'Sentence starters', voc.sentenceStarters || [])
    +   _mmgVocabSubList(idP + '_vocp', 'Phrases',           voc.phrases || [])
    +   _mmgVocabSubList(idP + '_voci', 'Idioms',            voc.idioms || [])
    + '</details>';

  // Wrap as <details>. Keep open by default.
  return '<details class="mmg-q-block" data-q-index="' + qIndex + '" open>'
    +     '<summary class="mmg-q-summary" style="cursor:pointer;padding:6px 8px;background:#f1f5f9;border-radius:6px;font-weight:700;">'
    +       'Q' + (q.number || (qIndex + 1)) + ' · ' + _mmgEsc(q.part || '') + headerExtras
    +     '</summary>'
    +     '<div class="mmg-q-body" style="display:flex;flex-direction:column;gap:10px;padding:10px 4px;">'
    +       _mmgFieldArea('Prompt', idP + '_prompt', q.prompt || '', '', 80)
    +       audioHtml + timingHtml + imagesHtml + bulletsHtml + samplesHtml + vocabHtml
    +     '</div>'
    + '</details>';
}

// Switch the level inside one question's sample editor.
window._mmgSpPickLevel = function (qIndex, levelKey) {
  var md = _mmgGetMockData(); if (!md) return;
  // Flush the current level's editors before swapping.
  _mmgCollectQuestionBlock(md, qIndex);
  _mmgSetMockData(md);
  window._mmgSpLevel = window._mmgSpLevel || {};
  window._mmgSpLevel[qIndex] = levelKey;
  // Re-render this single block in place.
  var existing = document.querySelector('.mmg-q-block[data-q-index="' + qIndex + '"]');
  if (existing) existing.outerHTML = _mmgRenderQuestionBlock(md, qIndex);
};
```

- [ ] **Step 3: Add `_mmgVocabSubList` and `_mmgFieldBulletList`**

```js
// Vocabulary sub-list (3 of these per question — starters, phrases, idioms).
// Each row is a single string input (the existing data style — see
// site/questions S/questions02.js for examples).
function _mmgVocabSubList(idPrefix, label, items) {
  var rows = (items || []).map(function(s, i) {
    return '<div class="mmg-bullet-row" data-idx="' + i + '" style="display:flex;gap:6px;margin:4px 0;">'
      +      '<input type="text" data-fld="v" value="' + _mmgEsc(s) + '" style="flex:1;">'
      +      '<button type="button" class="mmg-row-del" title="Remove" onclick="_mmgRemoveRow(this)">×</button>'
      +    '</div>';
  }).join('');
  return '<div class="mmg-field"><label>' + _mmgEsc(label) + '</label>'
    +    '<div id="' + idPrefix + '" class="mmg-vocab-sublist">' + (rows || '') + '</div>'
    +    '<button type="button" class="mmg-add-btn" onclick="_mmgAddBulletRow(\'' + idPrefix + '\')">＋ Add</button>'
    + '</div>';
}

// IELTS cue card bullet points editor (Q7 only).
function _mmgFieldBulletList(label, id, items) {
  var rows = (items || []).map(function(s, i) {
    return '<div class="mmg-bullet-row" data-idx="' + i + '" style="display:flex;gap:6px;margin:4px 0;">'
      +      '<input type="text" data-fld="b" value="' + _mmgEsc(s) + '" style="flex:1;" placeholder="e.g., Why was it memorable?">'
      +      '<button type="button" class="mmg-row-del" title="Remove" onclick="_mmgRemoveRow(this)">×</button>'
      +    '</div>';
  }).join('');
  return '<div class="mmg-field"><label>' + _mmgEsc(label) + '</label>'
    +    '<div id="' + id + '" class="mmg-bullets">' + (rows || '') + '</div>'
    +    '<button type="button" class="mmg-add-btn" onclick="_mmgAddBulletRow(\'' + id + '\')">＋ Add bullet</button>'
    + '</div>';
}

window._mmgAddBulletRow = function (hostId) {
  var host = document.getElementById(hostId); if (!host) return;
  var idx  = host.querySelectorAll('.mmg-bullet-row').length;
  var fld  = host.classList.contains('mmg-bullets') ? 'b' : 'v';
  var div  = document.createElement('div');
  div.className = 'mmg-bullet-row';
  div.dataset.idx = idx;
  div.style.cssText = 'display:flex;gap:6px;margin:4px 0;';
  div.innerHTML =
      '<input type="text" data-fld="' + fld + '" value="" style="flex:1;">'
    + '<button type="button" class="mmg-row-del" title="Remove" onclick="_mmgRemoveRow(this)">×</button>';
  host.appendChild(div);
};

window._mmgRemoveRow = function (btn) {
  var row = btn.closest('.mmg-bullet-row'); if (row) row.remove();
};
```

- [ ] **Step 4: Add `_mmgCollectQuestionBlock` (shared collector)**

```js
// Read every input inside one question block back into mock_data.questions[qIndex].
function _mmgCollectQuestionBlock(md, qIndex) {
  var q = md.questions[qIndex] = md.questions[qIndex] || {};
  var idP = 'spQ' + qIndex;
  var type = _mmgCurrentType();

  var promptEl = document.getElementById(idP + '_prompt');
  if (promptEl) q.prompt = promptEl.value;

  var audioEl = document.getElementById(idP + '_audio');
  if (audioEl) q.audioFile = audioEl.value;

  var prepEl  = document.getElementById(idP + '_prep');
  var speakEl = document.getElementById(idP + '_speak');
  if (prepEl  && prepEl.value  !== '') q.prepTime  = parseInt(prepEl.value,  10);
  if (speakEl && speakEl.value !== '') q.speakTime = parseInt(speakEl.value, 10);

  var imgEl = document.getElementById(idP + '_hasimg');
  if (imgEl) q.hasImages = imgEl.checked;

  // Active level only — others stay as last persisted in mock_data.
  var activeLevel = (window._mmgSpLevel && window._mmgSpLevel[qIndex]) || 'main';
  var levels = _mmgLevelTabsFor(type);
  var Ldef   = levels.find(function(L){ return L.key === activeLevel; }) || levels[0];
  var enEl = document.getElementById(idP + '_en_' + activeLevel);
  var uzEl = document.getElementById(idP + '_uz_' + activeLevel);
  if (enEl) q[Ldef.enKey] = enEl.value;
  if (uzEl) q[Ldef.uzKey] = uzEl.value;

  // Bullet points (IELTS Q7).
  var bulletsHost = document.getElementById(idP + '_bullets');
  if (bulletsHost) {
    var bRows = bulletsHost.querySelectorAll('.mmg-bullet-row input[data-fld="b"]');
    var bArr = [];
    for (var b = 0; b < bRows.length; b++) {
      var v = (bRows[b].value || '').trim();
      if (v) bArr.push(v);
    }
    q.bulletPoints = bArr;
  }

  // Vocabulary.
  var voc = q.vocabulary = q.vocabulary || {};
  var vTitleEl = document.getElementById(idP + '_voct');
  if (vTitleEl) voc.title = vTitleEl.value;
  ['s','p','i'].forEach(function (suffix, idx) {
    var key = ['sentenceStarters','phrases','idioms'][idx];
    var host = document.getElementById(idP + '_voc' + suffix);
    if (!host) return;
    var rows = host.querySelectorAll('.mmg-bullet-row input[data-fld="v"]');
    var arr = [];
    for (var r = 0; r < rows.length; r++) {
      var val = (rows[r].value || '').trim();
      if (val) arr.push(val);
    }
    voc[key] = arr;
  });
}
```

- [ ] **Step 5: Replace the stub `_mmgRenderSpPart` / `_mmgCollectSpPart`**

Find the Task-7 stubs and replace with:

```js
function _mmgRenderSpPart(md, partKey) {
  if (!md) return;
  var pane = document.getElementById('mmgPaneSp' + partKey.charAt(0).toUpperCase() + partKey.slice(1));
  if (!pane) return;
  md.questions = Array.isArray(md.questions) ? md.questions : [];

  var questionsInPart = [];
  for (var i = 0; i < md.questions.length; i++) {
    if (_mmgQuestionPartKey(md.questions[i]) === partKey) questionsInPart.push(i);
  }

  var partLabel = { part11:'Part 1.1', part12:'Part 1.2', part2:'Part 2', part3:'Part 3' }[partKey] || partKey;

  var html = '<div class="mmg-section-title" style="display:flex;align-items:center;gap:10px;">'
           +   '<span style="flex:1;">' + _mmgEsc(partLabel) + ' — ' + questionsInPart.length + ' question(s)</span>'
           +   '<button type="button" class="mmg-add-btn" onclick="_mmgGenerateAllAudios(\'' + partKey + '\')">🎙 Generate all audios in this part</button>'
           +   '<button type="button" class="mmg-add-btn" onclick="_mmgSpAddQuestion(\'' + partKey + '\')">＋ Add question</button>'
           + '</div>';

  if (!questionsInPart.length) {
    html += '<div class="mmg-empty-hint">No questions in this part yet. Click <em>＋ Add question</em>.</div>';
  } else {
    for (var k = 0; k < questionsInPart.length; k++) {
      html += _mmgRenderQuestionBlock(md, questionsInPart[k]);
    }
  }

  pane.innerHTML = html;

  // Wire upload buttons for each question's audio row.
  for (var k2 = 0; k2 < questionsInPart.length; k2++) {
    var qi = questionsInPart[k2];
    _mmgUploadBind({
      id:    'spQ' + qi + '_audio',
      skill: _mmgCurrentType()
    });
  }
}

function _mmgCollectSpPart(md, partKey) {
  if (!md) return;
  md.questions = Array.isArray(md.questions) ? md.questions : [];
  for (var i = 0; i < md.questions.length; i++) {
    if (_mmgQuestionPartKey(md.questions[i]) === partKey) {
      _mmgCollectQuestionBlock(md, i);
    }
  }
}

// Append a new question to mock_data.questions, defaulting `part` so it
// lands in the requested Part tab on next render.
window._mmgSpAddQuestion = function (partKey) {
  var md = _mmgGetMockData(); if (!md) return;
  _mmgCollectSpPart(md, partKey);
  md.questions = Array.isArray(md.questions) ? md.questions : [];
  var defaults = {
    part11: { part: 'Part 1', prepTime: 5,  speakTime: 30,  number: md.questions.length + 1 },
    part12: { part: 'Part 1', prepTime: 10, speakTime: 45,  number: md.questions.length + 1 },
    part2:  { part: 'Part 2', prepTime: 60, speakTime: 120, number: md.questions.length + 1 },
    part3:  { part: 'Part 3', prepTime: 5,  speakTime: 30,  number: md.questions.length + 1 }
  }[partKey] || {};
  md.questions.push(Object.assign({ prompt: '', audioFile: '' }, defaults));
  _mmgSetMockData(md);
  _mmgRenderSpPart(md, partKey);
};
```

- [ ] **Step 6: Verify Part panes render**

Reload `landing.html`. Open Mock Settings → CEFR Speaking → Mock #11. Click each Part tab — questions appear as collapsible blocks with prompts, audio rows, timing inputs, level chips, and vocabulary `<details>`. Edit the Q1 prompt → click another Part tab → click back to Part 1.1 → edit persists. Click Save → close + re-open → still persists.

Click 🎙 on Q1 → Gemini generates audio → URL fills in → inline player plays the new audio.

Click a level chip (A1) → sample area swaps to A1 textareas. Status dot updates after typing.

- [ ] **Step 7: Commit**

```bash
git add site/landing.html
git commit -m "landing: render speaking question blocks + Part panes"
```

---

## Task 11: Extend Settings tab — voice picker + announcements + image uploads

**Files:**
- Modify: `site/landing.html` — extend `_mmgRenderSettings` and `_mmgCollectSettings` (locate near Task 7's switch additions)

- [ ] **Step 1: Find the existing Settings render/collect functions**

Search `landing.html` for `function _mmgRenderSettings` (it exists for writing). Note the function body. Locate the matching `_mmgCollectSettings`.

- [ ] **Step 2: Extend `_mmgRenderSettings` with speaking branches**

At the start of `_mmgRenderSettings(md)`, after any existing setup, branch by type. The existing writing-settings rendering should stay inside an `else` so it remains untouched. Wrap the existing body and add:

```js
function _mmgRenderSettings(md) {
  var pane = document.getElementById('mmgPaneSettings');
  if (!pane) return;
  var type = _mmgCurrentType();
  var settings = md.settings = md.settings || {};
  var images   = md.images   = md.images   || {};

  // Branding section (shared with writing — unchanged structure).
  var brandingHtml =
      '<div class="mmg-section-title">Branding</div>'
    + _mmgFieldText('logoUrl',         'mmgSetLogoUrl',     settings.logoUrl)
    + _mmgFieldText('logoWording',     'mmgSetLogoWording', settings.logoWording)
    + _mmgFieldText('telegramChannel', 'mmgSetTgChan',      settings.telegramChannel)
    + _mmgFieldText('testIdentifier',  'mmgSetTestId',      settings.testIdentifier)
    + _mmgFieldText('heading1',        'mmgSetH1',          settings.heading1)
    + _mmgFieldText('heading2',        'mmgSetH2',          settings.heading2);

  if (type !== 'cefr-speaking' && type !== 'ielts-speaking') {
    // Existing writing path — leave whatever was there before this task untouched.
    pane.innerHTML = brandingHtml /* + ... existing writing extras */;
    return;
  }

  // ── Speaking-specific Settings ──────────────────────────────────
  // Top-level images for Q4 image-pair (CEFR primarily; IELTS rarely uses them).
  var imagesHtml =
      '<div class="mmg-section-title">Top-level images (used by hasImages questions)</div>'
    + _mmgImageRow('img1', images.img1, images.img1Alt, type)
    + _mmgImageRow('img2', images.img2, images.img2Alt, type);

  // Voice & TTS model picker (see _mmgRenderVoicePreviewGrid).
  var voiceHtml = _mmgRenderVoicePreviewGrid(md);

  // IELTS announcements.
  var annHtml = '';
  if (type === 'ielts-speaking') {
    var ann = md.announcements = md.announcements || {};
    annHtml =
        '<div class="mmg-section-title">Examiner announcements (IELTS)</div>'
      + _mmgFieldArea('beforePart1',         'mmgAnnP1',  ann.beforePart1,         '', 60)
      + _mmgFieldArea('beforePart2',         'mmgAnnP2',  ann.beforePart2,         '', 60)
      + _mmgFieldArea('afterPart2Prep',      'mmgAnnP2P', ann.afterPart2Prep,      '', 60)
      + _mmgFieldArea('beforePart2FollowUp', 'mmgAnnP2F', ann.beforePart2FollowUp, '', 60)
      + _mmgFieldArea('beforePart3',         'mmgAnnP3',  ann.beforePart3,         '', 60)
      + _mmgFieldArea('afterExam',           'mmgAnnEnd', ann.afterExam,           '', 60);
  }

  // Bulk audio button.
  var bulkHtml = '<div style="margin-top:14px;"><button type="button" class="mmg-add-btn" onclick="_mmgGenerateAllAudios(\'all\')">🎙 Generate audio for all questions with current voice/model</button></div>';

  pane.innerHTML = brandingHtml + imagesHtml + voiceHtml + annHtml + bulkHtml;

  // Wire image upload buttons.
  _mmgUploadBind({ id: 'mmgSetImg1', skill: type });
  _mmgUploadBind({ id: 'mmgSetImg2', skill: type });
}

// Inline image row with upload button + thumbnail.
function _mmgImageRow(slot, url, alt, skill) {
  var thumbId = 'mmgSetImg' + (slot === 'img1' ? '1' : '2');
  return '<div class="mmg-field-row" style="display:flex;gap:10px;align-items:end;">'
    +   '<div class="mmg-field" style="flex:1;"><label>' + slot + ' URL</label>'
    +     '<input type="text" id="' + thumbId + '" value="' + _mmgEsc(url || '') + '" oninput="_mmgRebindThumb(\'' + thumbId + '\')"></div>'
    +   '<div class="mmg-field" style="flex:1;"><label>' + slot + ' Alt</label>'
    +     '<input type="text" id="' + thumbId + 'Alt" value="' + _mmgEsc(alt || '') + '"></div>'
    +   '<button type="button" class="mmg-icon-btn" id="' + thumbId + '_upbtn" title="Upload image">📤</button>'
    +   '<input type="file" id="' + thumbId + '_upfile" accept="image/*" style="display:none;">'
    + '</div>'
    + '<img id="' + thumbId + '_thumb" src="' + _mmgEsc(url || '') + '" style="' + (url ? '' : 'display:none;') + 'max-width:160px;max-height:100px;border:1px solid #e2e8f0;border-radius:6px;">'
    + '<div id="' + thumbId + '_upprog" class="mmg-upload-progress"></div>';
}
window._mmgRebindThumb = function (id) {
  var input = document.getElementById(id);
  var thumb = document.getElementById(id + '_thumb');
  if (!input || !thumb) return;
  thumb.src = input.value || '';
  thumb.style.display = input.value ? '' : 'none';
};
```

- [ ] **Step 3: Add `_mmgRenderVoicePreviewGrid`**

```js
function _mmgRenderVoicePreviewGrid(md) {
  var settings = md.settings = md.settings || {};
  var selVoice = settings.voice    || 'Kore';
  var selModel = settings.tts_model || 'premium';
  var modelToggle = _MMG_TTS_MODELS.map(function(m) {
    var act = m.code === selModel ? ' active' : '';
    return '<button type="button" class="mmg-chip' + act + '" onclick="_mmgPickTtsModel(\'' + m.code + '\')">' + _mmgEsc(m.label) + '</button>';
  }).join('');

  var rows = _MMG_TTS_VOICES.map(function(v) {
    var checked = v.code === selVoice ? ' checked' : '';
    return '<div class="mmg-voice-row" data-voice="' + v.code + '" style="display:grid;grid-template-columns:24px 130px 1fr 100px 100px;gap:8px;align-items:center;padding:6px 4px;border-bottom:1px solid #f1f5f9;">'
      +    '<input type="radio" name="mmgVoice" value="' + v.code + '"' + checked + ' onchange="_mmgPickTtsVoice(\'' + v.code + '\')">'
      +    '<strong>' + _mmgEsc(v.code) + '</strong>'
      +    '<span style="color:#64748b;font-size:12px;">' + _mmgEsc(v.label) + '</span>'
      +    '<button type="button" class="mmg-add-btn" onclick="_mmgPlayVoicePreview(\'budget\',\'' + v.code + '\',this)">▶ Budget</button>'
      +    '<button type="button" class="mmg-add-btn" onclick="_mmgPlayVoicePreview(\'premium\',\'' + v.code + '\',this)">▶ Premium</button>'
      + '</div>';
  }).join('');

  return '<div class="mmg-section-title">Voice &amp; TTS model</div>'
       + '<div style="display:flex;gap:8px;margin-bottom:10px;">' + modelToggle + '</div>'
       + '<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">' + rows + '</div>';
}

window._mmgPickTtsVoice = function (code) {
  var md = _mmgGetMockData(); if (!md) return;
  md.settings = md.settings || {};
  md.settings.voice = code;
  _mmgSetMockData(md);
};
window._mmgPickTtsModel = function (code) {
  var md = _mmgGetMockData(); if (!md) return;
  md.settings = md.settings || {};
  md.settings.tts_model = code;
  _mmgSetMockData(md);
  _mmgRenderSettings(md); // re-render so the toggle highlights the new pick
};
window._mmgPlayVoicePreview = function (model, voice, btnEl) {
  var url = _mmgVoicePreviewUrl(model, voice);
  // Tear down any previous preview audio above this row.
  var row = btnEl.closest('.mmg-voice-row');
  var existing = row.querySelector('audio.mmg-voice-preview-audio');
  if (existing) { existing.remove(); }
  var aud = document.createElement('audio');
  aud.className = 'mmg-voice-preview-audio';
  aud.controls = true;
  aud.src = url;
  aud.style.cssText = 'grid-column:1/-1;width:100%;margin-top:6px;';
  row.appendChild(aud);
  aud.play().catch(function(){ /* user gesture required on some browsers — controls let them retry */ });
};
```

- [ ] **Step 4: Extend `_mmgCollectSettings`**

Search for `function _mmgCollectSettings`. At the top, after any existing setup:

```js
function _mmgCollectSettings(md) {
  var type = _mmgCurrentType();
  var settings = md.settings = md.settings || {};
  // Branding (shared).
  var get = function (id) { var el = document.getElementById(id); return el ? el.value : undefined; };
  if (get('mmgSetLogoUrl')     !== undefined) settings.logoUrl         = get('mmgSetLogoUrl');
  if (get('mmgSetLogoWording') !== undefined) settings.logoWording     = get('mmgSetLogoWording');
  if (get('mmgSetTgChan')      !== undefined) settings.telegramChannel = get('mmgSetTgChan');
  if (get('mmgSetTestId')      !== undefined) settings.testIdentifier  = get('mmgSetTestId');
  if (get('mmgSetH1')          !== undefined) settings.heading1        = get('mmgSetH1');
  if (get('mmgSetH2')          !== undefined) settings.heading2        = get('mmgSetH2');

  if (type !== 'cefr-speaking' && type !== 'ielts-speaking') {
    // Existing writing-settings collect — keep prior implementation here.
    return;
  }

  var images = md.images = md.images || {};
  if (get('mmgSetImg1')    !== undefined) images.img1    = get('mmgSetImg1');
  if (get('mmgSetImg1Alt') !== undefined) images.img1Alt = get('mmgSetImg1Alt');
  if (get('mmgSetImg2')    !== undefined) images.img2    = get('mmgSetImg2');
  if (get('mmgSetImg2Alt') !== undefined) images.img2Alt = get('mmgSetImg2Alt');

  if (type === 'ielts-speaking') {
    var ann = md.announcements = md.announcements || {};
    if (get('mmgAnnP1')  !== undefined) ann.beforePart1         = get('mmgAnnP1');
    if (get('mmgAnnP2')  !== undefined) ann.beforePart2         = get('mmgAnnP2');
    if (get('mmgAnnP2P') !== undefined) ann.afterPart2Prep      = get('mmgAnnP2P');
    if (get('mmgAnnP2F') !== undefined) ann.beforePart2FollowUp = get('mmgAnnP2F');
    if (get('mmgAnnP3')  !== undefined) ann.beforePart3         = get('mmgAnnP3');
    if (get('mmgAnnEnd') !== undefined) ann.afterExam           = get('mmgAnnEnd');
  }
  // settings.voice / settings.tts_model are written immediately by
  // _mmgPickTtsVoice / _mmgPickTtsModel — nothing to flush here.
}
```

- [ ] **Step 5: Verify Settings tab**

Reload `landing.html`. Open Mock Settings → CEFR Speaking → Mock #11 → Settings tab.

Expected:
- Branding fields populate from existing `mock_data.settings`.
- Images section shows img1/img2 inputs + 📤 buttons + thumbnails.
- Voice & TTS model section: Budget/Premium pill toggle + 8-row voice grid; ▶ buttons play preview audio; radio sets `settings.voice`.
- "Generate audio for all questions" button at the bottom.

Open Mock Settings → IELTS Speaking → Mock #10 → Settings tab.
- Same as above PLUS the 6 announcement textareas appear.

Pick "Charon" voice + "Budget" model → click another tab → click back to Settings → radio + pill keep their state. Save → reopen → state still there.

- [ ] **Step 6: Commit**

```bash
git add site/landing.html
git commit -m "landing: speaking Settings tab — voice picker, images, IELTS announcements"
```

---

## Task 12: Make existing Tokens tab work for speaking

**Files:**
- Modify: `site/landing.html` — extend `_mmgVocabGroupsForType` (or its tokens-equivalent) to recognise the speaking types

- [ ] **Step 1: Find the type discriminator used by Tokens render**

Search `_mmgRenderTokens` (~line 27306). Trace what determines which token entries it shows — likely a helper like `_mmgVocabGroupsForType` or hardcoded by `_mmgCurrentType()`. The renderer reads from `mock_data.tokenTranslations`.

- [ ] **Step 2: Add speaking branch**

Inside whichever helper computes "groups for this type", add an early return for speaking. Example pattern (adjust to actual function name found in step 1):

```js
function _mmgVocabGroupsForType(type) {
  if (type === 'cefr-speaking' || type === 'ielts-speaking') {
    // Speaking has flat tokens (one bucket across all questions' samples).
    return [{ key: 'all', label: 'All tokens' }];
  }
  // ... existing writing branches unchanged
}
```

If `_mmgRenderTokens` doesn't use that helper, add a `if (type === 'cefr-speaking' || type === 'ielts-speaking')` guard at its top to render a single flat list of `mock_data.tokenTranslations` entries.

- [ ] **Step 3: Verify**

Reload, open Speaking mock → Tokens tab → existing tokens (if any in `mock_data.tokenTranslations`) display in one list. Add a token → save → reopen → persists.

- [ ] **Step 4: Commit**

```bash
git add site/landing.html
git commit -m "landing: extend Tokens tab to handle cefr/ielts speaking"
```

---

## Task 13: Add CSS for the new UI elements

**Files:**
- Modify: `site/landing.html` (`.mmg-*` CSS region around line 25571)

- [ ] **Step 1: Append speaking-specific styles**

After the existing `.mmg-pane` rules (~line 25588), add:

```css
/* Speaking editor extras */
.mmg-q-block { border:1px solid #e2e8f0; border-radius:8px; padding:8px; margin-bottom:10px; background:#fff; }
.mmg-q-block[open] > .mmg-q-summary { background:#dbeafe; }
.mmg-q-summary::-webkit-details-marker { color:#2563eb; }
.mmg-level-chip { background:#f1f5f9; border:1px solid #e2e8f0; border-radius:14px; padding:3px 9px; font-size:11.5px; cursor:pointer; }
.mmg-level-chip:hover { background:#e0f2fe; border-color:#7dd3fc; }
.mmg-level-dot-10003 { color:#15803d; }   /* ✓ */
.mmg-level-dot-9679  { color:#d97706; }   /* ● */
.mmg-level-dot-9675  { color:#94a3b8; }   /* ○ */
.mmg-icon-btn { background:#f1f5f9; border:1px solid #e2e8f0; border-radius:6px; padding:4px 8px; cursor:pointer; font-size:14px; }
.mmg-icon-btn:hover { background:#e0f2fe; }
.mmg-icon-btn:disabled { opacity:.5; cursor:wait; }
.mmg-bullet-row { display:flex; gap:6px; align-items:center; }
.mmg-row-del { background:#fef2f2; color:#b91c1c; border:1px solid #fecaca; border-radius:6px; padding:2px 8px; cursor:pointer; }
.mmg-row-del:hover { background:#fee2e2; }
.mmg-vocab-details { border:1px dashed #cbd5e1; border-radius:6px; padding:6px 10px; background:#f8fafc; }
@media (max-width: 700px) {
  .mmg-sample-pair { grid-template-columns:1fr !important; }
  .mmg-voice-row { grid-template-columns:24px 1fr !important; row-gap:4px; }
}
```

- [ ] **Step 2: Verify visual**

Reload. Open a Speaking mock → Part 1.1 tab. Question blocks have card-style borders, blue header on open, level chips render as pill chips with status-colored dots, vocabulary `<details>` has the dashed background.

- [ ] **Step 3: Commit**

```bash
git add site/landing.html
git commit -m "landing: speaking editor CSS — question blocks, level chips, voice rows"
```

---

## Task 14: End-to-end manual test pass on dev

**Files:** none (test pass)

- [ ] **Step 1: Push to dev**

```bash
git push origin dev
```
Wait ~1 minute for Netlify deploy on `mock-stream.com`.

- [ ] **Step 2: Run the spec §16 manual test plan**

Walk through every numbered item in [the spec §16](../specs/2026-05-08-speaking-editor-design.md#16-test-plan-manual). For each, confirm Expected matches Actual. Specifically:

1. Open `mock-stream.com/landing.html` → Mock Settings → CEFR Speaking → Mock #11. Settings tab loads; `mock_data` populates the fields.
2. Voice preview ▶ buttons play different voices; radio + Budget/Premium toggle persist after Save + reopen.
3. Part 1.1 renders Q1, Q2, Q3.
4. 🎙 Q1 → URL fills with `…/cefr-speaking-mock-01-q1-<ts>.wav` → inline player plays Gemini audio.
5. Per-Q voice override on Q2 → audio sounds different; selectors don't persist in `mock_data`.
6. "Generate all in this part" generates 3 sequentially; "Generate all 8" generates the full mock.
7. Sample editor toolbar wraps phrases as `ml-token` spans; preview shows highlights; level chip status dot updates correctly.
8. CEFR Q4 hasImages renders the Settings-tab images as thumbnails in the question block; the runner page (`Speaking Mocks.html?sbmock=11&auto=1`) shows them on the live exam.
9. IELTS-only items: Settings shows the 6 announcement textareas; Q7 cue card shows the bullet-points editor; sample levels are `Band 5..9` not `A1..B2`.
10. Break the JSON in Raw → switch to Part 1.1 → "Cannot render" hint appears.
11. Regenerate Q1 audio → `<audio src>` has a new `?t=<ts>` query → browser plays the new bytes immediately.

If any item fails: revert to a fix-it task, commit, re-push, re-test that item. Mark the §16 step as ✓ in your test notes.

- [ ] **Step 3: Push to master (with explicit user confirmation per memory rule)**

DO NOT push to master without an explicit "yes, push to master" from the user. Memory rule: "Master pushes always need explicit per-push confirmation." Once the user confirms:

```bash
git checkout master
git merge dev
git push origin master
git checkout dev
```
Wait for the 6 clone Netlify builds to finish (~2 minutes total). Confirm by clicking through Mock Settings on at least one clone (e.g., `bekzodsmultilevel.com/landing.html`) — Mock Settings should still be locked to the main centre (the existing `_cidGuard` blocks it, intended).

- [ ] **Step 4: Tag completion**

No commit — this task is verification only. Update the auto-memory:

Add a new project memory entry noting Phase 1.5 (speaking editor) is complete, with the date and the new server action name + GCS folder added. This helps future conversations orient quickly.

---

## Self-review notes

**Spec coverage check** (every spec section maps to one or more tasks):

- §3 data shape — Tasks 10 (renderer/collector) + 11 (settings/announcements/voice).
- §4 tab structure — Tasks 6 (markup) + 7 (switch wiring).
- §5 Settings tab — Task 11.
- §6 voice/model picker + previews — Tasks 5 (preview generation), 8 (consts), 11 (preview grid UI).
- §7 question block — Task 10.
- §8 audio row — Task 9.
- §9 sample editor — Task 10 (level chips inside `_mmgRenderQuestionBlock`).
- §10 Tokens tab — Task 12.
- §11 server action — Tasks 1–4.
- §12 client helpers — Tasks 8–11.
- §13 save/persistence — implicit; covered by Tasks 7 (switch hooks) + 10 (collector flushes).
- §14 centre lockdown — no code change needed (existing `_cidGuard`).
- §15 files touched — matches the file structure table above.
- §16 test plan — Task 14.

**Placeholder scan:** No "TBD"/"TODO" markers. No "implement later" steps. Every code block is complete.

**Type consistency check:**
- `_mmgRenderSpPart` / `_mmgCollectSpPart` (Tasks 7 + 10): same signatures `(md, partKey)`. ✓
- `_mmgRenderQuestionBlock` / `_mmgCollectQuestionBlock`: same `(md, qIndex)`. ✓
- `_mmgFieldAudio` opts shape consistent across Task 9 (definition) and Task 10 (use). ✓
- `_mmgGenerateAudio(qIndex, id)` — Task 9 defines, Task 10 calls with the same `id` pattern (`'spQ' + qIndex + '_audio'`). ✓
- `_mmgVoicePreviewUrl(model, voice)` — Task 8 defines, Task 11 calls with same arg order. ✓
- TTS_VOICES (server, Task 2) and `_MMG_TTS_VOICES` (client, Task 8): both list the same 8 voice codes. ✓

**Open verification gaps:**
- Task 12 depends on the actual structure of the existing Tokens helpers — the step calls out two adjustment paths because the exact helper name in the codebase needs grepping at execution time. This is the only place where the exact line edits aren't fully prescriptive; the engineer must read the file first.
- Task 11 step 1 says "leave whatever was there before" for the existing writing-settings code path — engineer must preserve the existing implementation when wrapping it in the new branch. Calling this out in the step text.
