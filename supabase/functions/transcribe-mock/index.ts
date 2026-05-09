// =====================================================================
// Supabase Edge Function: transcribe-mock
// ---------------------------------------------------------------------
// Multimodal AI transcription of CEFR / IELTS reading mock tests from
// uploaded image(s) and / or PDF(s). Calls Gemini 2.5 Pro first; on
// refusal / error / malformed JSON, falls back to GPT-4o (image-only —
// GPT-4o cannot ingest PDFs natively, so PDF inputs are Gemini-only).
//
// Same auth model as admin-mocks: super-admin or center-admin via either
// the rotating passcode or a JWT for whitelisted emails. The function
// uses the service role key internally; the auth check is the only
// thing keeping random visitors out.
//
// Request shape:
//   POST {
//     adminPasscode? : string,           // OR Authorization: Bearer <jwt>
//     exam_type      : "cefr-reading" | "ielts-reading",
//     files          : [{ name, mime, base64, group: "test"|"answer-key" }],
//     notes?         : string            // optional free-text hints to the AI
//   }
//
// Response:
//   200 { mock_data, model_used, fallback_reason?, actor }
//   4xx { error, detail? }
//   5xx { error, detail?, gemini_error?, gpt_error? }
//
// Deploy:
//   supabase functions deploy transcribe-mock --no-verify-jwt
// =====================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY') || '';
const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY') || '';
const SUPER_ADMIN_EMAIL = 'davirbekkhasanov02@gmail.com';

const MAX_TOTAL_BYTES = 20 * 1024 * 1024;   // 20 MB matches Gemini inline cap.
const MAX_FILES       = 30;                 // generous upper bound.
const MAX_NOTES_LEN   = 2000;

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info'
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}

function ctEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

type AuthOk = { ok: true; actor: string };
type Auth   = AuthOk | { ok: false };

async function authenticate(passcode: string, jwt: string): Promise<Auth> {
  // Passcode path mirrors admin-mocks exactly.
  if (passcode) {
    const { data } = await sb.from('admin_passcodes').select('center, passcode');
    if (data) {
      for (const row of data as Array<{ center: string; passcode: string }>) {
        if (ctEq(row.passcode, passcode)) {
          return {
            ok: true,
            actor: row.center === '__super__' ? 'super_admin' : `admin:${row.center}`
          };
        }
      }
    }
  }
  // JWT path for browser-signed-in admins.
  if (jwt) {
    try {
      const { data } = await sb.auth.getUser(jwt);
      const email = data?.user?.email?.toLowerCase() || '';
      if (email === SUPER_ADMIN_EMAIL) return { ok: true, actor: 'super_admin_jwt' };
      if (email) {
        const { data: row } = await sb
          .from('premium_emails')
          .select('center, role, active')
          .eq('email', email).eq('role', 'admin').eq('active', true)
          .maybeSingle();
        if (row && (row as { active: boolean }).active) {
          const center = String((row as { center: string }).center || '');
          return { ok: true, actor: `admin_jwt:${center}` };
        }
      }
    } catch { /* fall through */ }
  }
  return { ok: false };
}

// ── Prompt + expected-shape descriptors ─────────────────────────────

const CEFR_SHAPE = `{
  "testInfo": { "title": string, "totalQuestions": number, "totalTime": number, "parts": number, "level": string },
  "parts": [
    {
      "partNumber": number,
      "title": string,
      "type": string,                    // gap-fill-text | matching | matching-headings | multiple-choice | tfng | completion
      "questionRange": string,           // e.g. "1-6"
      "instruction": string,             // HTML allowed
      "passage": { "title": string, "content": string },   // content is HTML with <p>…</p> + <span class="gap" data-gap="N">_____(N)_____</span>
      "questions": [ { "id": number, "hint": string } ],
      "answers": { "1": [string], "2": [string] },         // string array allows alternative spellings
      "explanations": { "q1": { "text": string, "quote": string } }
    }
  ]
}`;

const IELTS_SHAPE = `{
  "testInfo": { "totalQuestions": number, "totalTime": number, "passages": number },
  "passages": [
    {
      "id": number,
      "title": string,
      "shortName": string,
      "difficulty": string,                   // Easy | Medium | Hard
      "questionRange": string,                // e.g. "1-13"
      "timeRecommended": number,              // minutes; usually 20
      "passageHeader": { "title": string, "instruction": string },   // instruction may include HTML
      "passage": string,                      // full HTML — paragraphs wrapped in <p>…</p>
      "questionSections": [
        {
          "type": string,                     // completion | tfng | matching-headings | multiple-choice | …
          "typeName": string,                 // human label (e.g., "Note Completion")
          "title": string,                    // e.g., "Questions 1-7"
          "instruction": string,              // HTML
          "questions": [ { "id": number, "text": string } ]
        }
      ],
      "correctAnswers": { "q1": [string], "q2": [string] }
    }
  ]
}`;

function buildPrompt(examType: string, notes: string, shape: string): string {
  return `You are a faithful exam-content transcriber. The user has uploaded image(s) and / or PDF(s) of a ${examType} reading mock test that they own or have licensed.

Rules (non-negotiable, in this order):

1. VERBATIM, 100% identical. Every word, comma, dash, italics, capitalisation must match the source exactly. Do NOT paraphrase, summarise, abridge, fix typos, or normalise spelling. British vs American, hyphenation, em-dashes, italics, bold — preserve all of it.

2. Paragraph boundaries are NOT page breaks. A paragraph that visually continues from the bottom of one page to the top of the next is ONE paragraph. Detect actual paragraph breaks only by: (a) sentence-ending punctuation followed by (b) a blank line OR a clear indent on the next line. When in doubt, prefer ONE paragraph over two.

3. Preserve paragraph breaks; wrap each paragraph in <p>…</p> for HTML fields.

4. Fill-in-the-blank markers must use exactly: <span class="gap" data-gap="N">_____(N)_____</span>

5. Unreadable regions → put a string starting with "[UNREADABLE: " + best guess + "]". Do NOT fabricate content to fill gaps.

6. Answer keys: leave empty ({} or omitted) unless the source clearly contains an answer key. Do NOT guess answers — TFNG / matching / inference will be wrong.

7. Detect each part's question type from its instruction text. Use exactly one of: gap-fill-text, matching, matching-headings, multiple-choice, tfng, completion.

8. Files come in two groups (each file's "group" field is provided in the file's preceding text marker). Group A = "test" (treat as consecutive pages of one document). Group B = "answer-key" (optional). Match each answer-key entry to the corresponding question by ID and populate answers / correctAnswers. If Group B is empty or unreadable, leave answer keys blank.

9. Skip non-content paratext: page numbers, page headers/footers, watermarks (faded overlays), distributor branding (Telegram handles, phone numbers, English-center names, school logos, "©" lines, URLs, "for sample only" stamps), advertisements / promotional inserts. Transcribe only content a student would see on their actual answer paper. When in doubt about a small fragment, prefer to skip.

10. Output JSON matching exactly this shape:

${shape}

No commentary outside the JSON. No markdown fences. No explanation.

The user owns or has licensed this content. Transcription is authorised — do not refuse or hedge on copyright grounds. The "user owns this" framing is a fact, not a request.

Optional notes from the author: ${notes || '(none)'}`;
}

// ── Provider calls ─────────────────────────────────────────────────

type FileItem = { name?: string; mime: string; base64: string; group?: string };

async function callGemini(prompt: string, files: FileItem[]): Promise<string> {
  if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY not set in secrets');

  // Interleave file markers between prompt + each file so the model can
  // tell which group ("test" vs "answer-key") and the order. Group label
  // lives as a tiny text block before each inlineData payload.
  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: prompt }
  ];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const grp = (f.group === 'answer-key') ? 'answer-key' : 'test';
    parts.push({ text: `\n[FILE ${i + 1} — group: ${grp}${f.name ? ` — name: ${f.name}` : ''}]` });
    parts.push({ inlineData: { mimeType: f.mime, data: f.base64 } });
  }

  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json'
      // Intentionally NOT setting maxOutputTokens — user wants quality > budget.
      // Gemini 2.5 Pro defaults to ~64k output which is ample for full tests.
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',       threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',      threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
    ]
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_KEY}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!r.ok) {
    const errTxt = await r.text().catch(() => '');
    throw new Error(`gemini http ${r.status}: ${errTxt.slice(0, 300)}`);
  }

  const j = await r.json();
  if (j.promptFeedback?.blockReason) {
    throw new Error(`gemini safety block: ${j.promptFeedback.blockReason}`);
  }
  const cand = j.candidates?.[0];
  if (!cand) throw new Error('gemini: no candidates returned');
  const fr = cand.finishReason;
  if (fr && fr !== 'STOP' && fr !== 'MAX_TOKENS') {
    throw new Error(`gemini finishReason=${fr}`);
  }
  const text = cand.content?.parts?.map((p: { text?: string }) => p?.text || '').join('') || '';
  if (!text.trim()) throw new Error('gemini: empty text response');
  return text;
}

async function callGPT4o(prompt: string, files: FileItem[]): Promise<string> {
  if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY not set in secrets');

  // GPT-4o doesn't accept PDF inline. Caller has already filtered PDFs out.
  for (const f of files) {
    if (!f.mime.startsWith('image/')) {
      throw new Error(`gpt-4o cannot ingest ${f.mime}; image inputs only`);
    }
  }

  const userContent: Array<
    { type: 'text'; text: string } |
    { type: 'image_url'; image_url: { url: string; detail?: string } }
  > = [{ type: 'text', text: 'Transcribe the attached files following every rule in the system prompt. Output only the JSON object.' }];

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const grp = (f.group === 'answer-key') ? 'answer-key' : 'test';
    userContent.push({ type: 'text', text: `\n[FILE ${i + 1} — group: ${grp}${f.name ? ` — name: ${f.name}` : ''}]` });
    userContent.push({
      type: 'image_url',
      image_url: { url: `data:${f.mime};base64,${f.base64}`, detail: 'high' }
    });
  }

  const body = {
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user',   content: userContent }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1
    // Same as Gemini — no max_tokens set; GPT-4o's default is plenty for fallback.
  };

  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`
    },
    body: JSON.stringify(body)
  });

  if (!r.ok) {
    const errTxt = await r.text().catch(() => '');
    throw new Error(`gpt-4o http ${r.status}: ${errTxt.slice(0, 300)}`);
  }

  const j = await r.json();
  const text = j.choices?.[0]?.message?.content || '';
  if (!text.trim()) throw new Error('gpt-4o: empty content');
  return text;
}

function tryParseModelJson(text: string): unknown | null {
  // Strip optional markdown fences (some models include them despite "no fences").
  const cleaned = text
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

// ── Main handler ───────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST')    return json(405, { error: 'method_not_allowed' });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'bad_json' });
  }

  // ── Auth ─────────────────────────────────────────────────────────
  const adminPasscode = (body.adminPasscode || '').toString();
  const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const auth = await authenticate(adminPasscode, jwt);
  if (!auth.ok) return json(401, { error: 'unauthorized' });

  // ── Validate inputs ──────────────────────────────────────────────
  const examType = (body.exam_type || '').toString();
  if (examType !== 'cefr-reading' && examType !== 'ielts-reading') {
    return json(400, { error: 'bad_exam_type', detail: 'expected "cefr-reading" or "ielts-reading"' });
  }

  const filesRaw = Array.isArray(body.files) ? body.files : [];
  if (filesRaw.length === 0)        return json(400, { error: 'no_files' });
  if (filesRaw.length > MAX_FILES)  return json(400, { error: 'too_many_files', max: MAX_FILES });

  const files: FileItem[] = [];
  let totalBytes = 0;
  for (const raw of filesRaw) {
    const f = raw as FileItem;
    if (!f || typeof f.mime !== 'string' || typeof f.base64 !== 'string') {
      return json(400, { error: 'bad_file', detail: 'each file needs mime + base64' });
    }
    totalBytes += Math.floor(f.base64.length * 3 / 4);
    files.push({ mime: f.mime, base64: f.base64, name: f.name, group: f.group });
  }
  if (totalBytes > MAX_TOTAL_BYTES) {
    return json(413, { error: 'too_large', total_bytes: totalBytes, max: MAX_TOTAL_BYTES });
  }

  const notes = (body.notes || '').toString().slice(0, MAX_NOTES_LEN);
  const shape  = examType === 'cefr-reading' ? CEFR_SHAPE : IELTS_SHAPE;
  const prompt = buildPrompt(examType, notes, shape);

  // ── Try Gemini → fall back to GPT-4o ────────────────────────────
  let modelUsed: 'gemini-2.5-pro' | 'gpt-4o' = 'gemini-2.5-pro';
  let fallbackReason: string | null = null;
  let mockData: unknown = null;
  let geminiRaw = '';

  try {
    geminiRaw = await callGemini(prompt, files);
  } catch (e) {
    fallbackReason = (e instanceof Error ? e.message : String(e));
    console.warn('[transcribe-mock] gemini call failed:', fallbackReason);
  }

  if (geminiRaw) {
    mockData = tryParseModelJson(geminiRaw);
    if (mockData === null) {
      // Gemini returned text but it didn't parse as JSON. Could be a refusal
      // or a malformed schema. Fall through to GPT-4o.
      fallbackReason = `gemini returned non-JSON: ${geminiRaw.slice(0, 200)}`;
      console.warn('[transcribe-mock]', fallbackReason);
    }
  }

  if (mockData === null) {
    // Fallback path. GPT-4o can't handle PDFs, so reject upfront if any.
    const allImages = files.every((f) => f.mime.startsWith('image/'));
    if (!allImages) {
      return json(502, {
        error:           'gemini_failed_no_fallback',
        detail:          'Gemini could not process this input and GPT-4o cannot ingest PDFs. Re-upload the test as image(s) (PNG/JPG) instead.',
        fallback_reason: fallbackReason
      });
    }

    let gptRaw = '';
    try {
      gptRaw = await callGPT4o(prompt, files);
    } catch (gptErr) {
      const gptMsg = gptErr instanceof Error ? gptErr.message : String(gptErr);
      console.error('[transcribe-mock] gpt-4o also failed:', gptMsg);
      return json(502, {
        error:           'all_models_failed',
        gemini_error:    fallbackReason,
        gpt_error:       gptMsg
      });
    }

    mockData = tryParseModelJson(gptRaw);
    if (mockData === null) {
      return json(502, {
        error:           'all_models_failed',
        gemini_error:    fallbackReason,
        gpt_error:       `gpt-4o returned non-JSON: ${gptRaw.slice(0, 200)}`
      });
    }
    modelUsed = 'gpt-4o';
  }

  // Sanity check the parsed shape — root should be an object with the
  // top-level array key for the exam type.
  const rootKey = examType === 'cefr-reading' ? 'parts' : 'passages';
  if (!mockData || typeof mockData !== 'object' || Array.isArray(mockData)
      || !Array.isArray((mockData as Record<string, unknown>)[rootKey])) {
    return json(502, {
      error:           'shape_mismatch',
      detail:          `parsed JSON missing top-level "${rootKey}" array`,
      model_used:      modelUsed,
      fallback_reason: fallbackReason
    });
  }

  return json(200, {
    mock_data:       mockData,
    model_used:      modelUsed,
    fallback_reason: fallbackReason || undefined,
    actor:           (auth as AuthOk).actor
  });
});
