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
//     notes?         : string,           // optional free-text hints to the AI
//     scope?         : "full" | "passage",   // default "full"
//     passage_index? : number            // 1-based, REQUIRED when scope === "passage"
//   }
//
// scope === "passage" returns a single passage object (IELTS) or a single
// part object (CEFR) instead of the full mock_data envelope, so admins can
// build a mock by importing one passage at a time when the source PDFs
// differ — fewer pages per call, less risk of hitting token / rate limits.
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
      "id": number,                                  // 1, 2, 3
      "title": string,                               // The CONTENT title of the passage, e.g. "The Industrial Revolution in Britain"
      "shortName": string,                           // Brief nav tag, derived from the content title
      "difficulty": string,                          // "Easy" | "Medium" | "Hard"
      "questionRange": string,                       // e.g. "1-13"
      "timeRecommended": number,                     // minutes — almost always 20

      "passageHeader": {
        "title": string,                             // **ALWAYS the literal label "READING PASSAGE 1" / "READING PASSAGE 2" / "READING PASSAGE 3"** — never the content title
        "instruction": string                        // The timing line, e.g. "You should spend about 20 minutes on <strong>Questions 1-13</strong>, which are based on Reading Passage 1 below." HTML allowed. NEVER omit; if the source omits it, write the standard 20-minute line.
      },

      "passage": string,                             // Full HTML of the body content only. Paragraphs wrapped in <p>…</p>. Do NOT repeat the content title inside the HTML — it already lives in passages[i].title and is rendered by the runner.

      "questionSections": [
        {
          "type": string,                            // EXACTLY one of: "completion" | "tfng" | "ynng" | "matching-headings" | "matching" | "multiple-choice"
          "typeName": string,                        // Human label, e.g. "Note Completion", "Sentence Completion", "Summary Completion", "Flowchart Completion", "True/False/Not Given", "Yes/No/Not Given", "Matching Headings", "Matching Information", "Matching Features", "Multiple Choice"
          "title": string,                           // e.g. "Questions 1-7"
          "instruction": string,                     // Full HTML instruction (use <br> for line breaks, <strong> for emphasis, exactly as in the source).

          "boxTitle": string,                        // For completion sections only: the heading printed above the notes / table / flowchart (e.g., "Britain's Industrial Revolution"). Empty string for tfng / matching / mcq.

          "headingsList": [string],                  // For "matching-headings" ONLY: the list of headings the student picks from (e.g., ["Action already taken by the UN", "Marketing the hydrogen car", …]). EMPTY ARRAY for every other type.

          "featuresList": [string],                  // For "matching" ONLY: the list of letters / labels students match TO. Two common shapes: a) plain letter list when matching statements to passage paragraphs ["A", "B", "C", "D", "E"]; b) labelled list when matching to people / theories ["A. Ian McCrae", "B. Nigel Millar", "C. Richard Medlicott", …]. EMPTY ARRAY for every other type.

          "questions": [
            { "id": number, "text": string, "options"?: [string] }   // text rules per type:
                                                     //   • completion: ONE {INPUT} per entry, one entry per numbered blank. text = a SHORT FRAGMENT (~10–25 words of surrounding context) centred on its single blank, NOT the whole summary. Example: if the source is "Mehrabian compared the {INPUT1} of communication. Subjects had to identify the {INPUT2} being conveyed", emit { "id":27, "text":"Mehrabian compared the {INPUT} of communication." } and { "id":28, "text":"Subjects had to identify the {INPUT} being conveyed." }. NEVER copy the entire summary into every entry — that produces visible duplicate paragraphs in the runner.
                                                     //   • tfng / ynng: text = the statement to evaluate
                                                     //   • matching / matching-headings: text = the statement / description students match
                                                     //   • multiple-choice: text = the question stem (no A/B/C/D embedded). ALSO REQUIRED — add an "options" array of 4 strings, each being just the choice text WITHOUT the leading letter prefix (the renderer prepends "A. ", "B. " automatically). If you omit "options", students see no answer choices.
          ]
        }
      ],

      "correctAnswers": { "q1": [string], "q2": [string] }    // string array allows alternative spellings ("LABOUR" / "LABOR")
    }
  ]
}`;

// Single-passage shapes — used when scope === 'passage'. Identical to the
// per-passage / per-part objects nested inside the full shapes above, just
// without the surrounding wrapper. The model returns one object, not
// wrapped in an array.
const IELTS_SINGLE_PASSAGE_SHAPE = `{
  "id": number,                                  // 1, 2, or 3 — the AI's best guess; the client overrides this anyway
  "title": string,                               // The CONTENT title of the passage, e.g. "The Industrial Revolution in Britain"
  "shortName": string,                           // Brief nav tag, derived from the content title
  "difficulty": string,                          // "Easy" | "Medium" | "Hard"
  "questionRange": string,                       // e.g. "1-13"
  "timeRecommended": number,                     // minutes — almost always 20

  "passageHeader": {
    "title": string,                             // **ALWAYS the literal label "READING PASSAGE 1" / "READING PASSAGE 2" / "READING PASSAGE 3"**
    "instruction": string                        // Timing line. HTML allowed.
  },

  "passage": string,                             // Full HTML of the body content only. Paragraphs wrapped in <p>…</p>.

  "questionSections": [
    {
      "type": string,                            // EXACTLY one of: "completion" | "tfng" | "ynng" | "matching-headings" | "matching" | "multiple-choice"
      "typeName": string,
      "title": string,
      "instruction": string,
      "boxTitle": string,
      "headingsList": [string],
      "featuresList": [string],
      "questions": [ { "id": number, "text": string, "options"?: [string] } ]   // For "completion" type: ONE {INPUT} per entry, text is a SHORT FRAGMENT around its blank (NOT the whole summary). For "multiple-choice": include an "options" array of 4 strings (no letter prefix).
    }
  ],

  "correctAnswers": { "q1": [string], "q2": [string] }
}`;

const CEFR_SINGLE_PART_SHAPE = `{
  "partNumber": number,
  "title": string,
  "type": string,                    // gap-fill-text | matching | matching-headings | multiple-choice | tfng | completion
  "questionRange": string,
  "instruction": string,
  "passage": { "title": string, "content": string },
  "questions": [ { "id": number, "hint": string } ],
  "answers": { "1": [string], "2": [string] },
  "explanations": { "q1": { "text": string, "quote": string } }
}`;

function buildPrompt(
  examType: string,
  notes: string,
  shape: string,
  scope: 'full' | 'passage' = 'full',
  passageIndex: number = 0
): string {
  const isIelts = examType === 'ielts-reading';
  const isCefr  = examType === 'cefr-reading';
  const unit    = isIelts ? 'passage' : 'part';
  const Unit    = isIelts ? 'Passage' : 'Part';

  // Gap-marker rule differs by exam: CEFR uses span tags, IELTS uses {INPUT}.
  const gapRule = isIelts
    ? `4. **Fill-in-the-blank gaps in question text use the literal placeholder "{INPUT}"** — exactly that, no variation. Example: "A greater supply of {INPUT} was required to power steam engines." Do NOT use HTML span tags.`
    : `4. **Fill-in-the-blank gaps in passage HTML use exactly:** <span class="gap" data-gap="N">_____(N)_____</span>  — where N is the question number. Do NOT vary the format.`;

  // Per-exam-type guidance for question-type detection + section structure.
  const ieltsTypeGuide = isIelts ? `
11. **IELTS question-type detection** — read each section's instruction text and pick the type from these patterns. Then populate the type-specific fields:

  | Source instruction looks like… | type | Required extras |
  |---|---|---|
  | "Complete the notes/sentences/summary/table/flow-chart below. Choose ONE WORD ONLY / NO MORE THAN TWO WORDS…" | "completion" | "boxTitle" = heading above the notes/table; "questions" — ONE entry per numbered blank, exactly ONE {INPUT} per entry. Each entry's text is a SHORT FRAGMENT (~10–25 words) around its blank — NEVER a copy of the whole summary. If the source summary has 6 blanks numbered 8–13, emit 6 entries (ids 8, 9, 10, 11, 12, 13) with 6 different fragments, never one entry per blank that all contain the same full summary. |
  | "Complete the summary below. Drag and drop the correct words A-H into the gaps." (or any drag-drop word-bank variant) | "completion" | Same as above PLUS populate "featuresList" with the labelled word bank verbatim (e.g. ["A. facial expressions", "B. purposes", "C. printed words", "D. effects", "E. word meanings", "F. gender differences", "G. feelings", "H. characteristics"]). |
  | "Do the following statements agree with the information / claims in Reading Passage X? … TRUE / FALSE / NOT GIVEN" | "tfng" | (none) |
  | "Do the following statements agree with the views/claims of the writer? … YES / NO / NOT GIVEN" | "ynng" | (none) |
  | "Reading Passage X has Y paragraphs, A-Z. Choose the correct heading for paragraphs A-F from the list of headings below. … i, ii, iii…" | "matching-headings" | "headingsList" = the i-ix headings list verbatim |
  | "Reading Passage X has Y paragraphs, A-Z. Which paragraph contains the following information? Write the correct letter, A-F…" | "matching" | "featuresList" = ["A", "B", "C", "D", "E"] (one entry per paragraph letter) |
  | "Look at the following statements and the list of people/theories/etc. Match each statement with the correct X, A-H." | "matching" | "featuresList" = the labelled list verbatim, e.g. ["A. Ian McCrae", "B. Nigel Millar", …] |
  | "Choose the correct letter, A, B, C or D" | "multiple-choice" | each question entry MUST include an "options" array of 4 strings (the A/B/C/D choices verbatim, WITHOUT the leading letter prefix — the renderer prepends "A. ", "B. " automatically). Without "options", students see no answer choices. Example: \`{ "id": 36, "text": "What does the writer say about X?", "options": ["It is the strongest point.", "It will appeal to superstitious people.", "It allows comparison.", "It makes claims more attractive."] }\` |

  ALWAYS include "headingsList" and "featuresList" keys on every section — empty arrays \`[]\` for sections where they don't apply, populated arrays for the matching types. Same for "boxTitle" — empty string for non-completion sections.

12. **IELTS passageHeader is a LABEL block, not the content title:**
  - "passageHeader.title" must be exactly "READING PASSAGE 1" / "READING PASSAGE 2" / "READING PASSAGE 3" (depending on which passage). Never the content title.
  - "passageHeader.instruction" must be the timing line, e.g. \`"You should spend about 20 minutes on <strong>Questions 1-13</strong>, which are based on Reading Passage 1 below."\`. If the source omits this line, write the standard one above with the right question range.
  - The actual content title (e.g., "The Industrial Revolution in Britain") goes ONLY in "passages[i].title". Do NOT also put it in "passageHeader.title".
  - The "passage" HTML must contain ONLY the body paragraphs (no <h1>/<h2> with the content title, since the runner renders that separately from passages[i].title).

13. **Lettered paragraphs** — when the source passage labels each paragraph with a capital letter (A, B, C, … — typical for "matching" and "matching-headings" question types), wrap the leading letter in a <strong> tag immediately inside the <p>, followed by ONE space, then the paragraph text. Example:
\`<p><strong>A</strong> At some time in their lives, nearly all New Zealanders will have to attend an after-hours clinic…</p>\`
\`<p><strong>B</strong> The irony is, New Zealand started out being ahead of the game…</p>\`
Do this only when the source actually shows the letter as a paragraph marker (you'll see it visually beside the paragraph in the original). Do NOT invent letters for passages that aren't lettered. Do NOT put the letter inside a separate <p> or as plain text "A ".
` : '';

  // Scope-specific framing. In "passage" mode the user is uploading just
  // ONE passage (typically because each passage comes from a different
  // source), so we tell the model to expect that and emit a single
  // passage object instead of a full mock envelope.
  const scopeIntro = scope === 'passage'
    ? `The user has uploaded image(s) and / or PDF(s) for **just ONE ${unit}** of a ${examType} reading mock — specifically ${Unit} ${passageIndex || '?'}. Treat the uploaded files as that single ${unit} only. The accompanying answer-key files (if any) cover ONLY this ${unit}'s questions. Output a single ${unit} object — NOT wrapped in a "${isIelts ? 'passages' : 'parts'}" array, NOT wrapped in any envelope.`
    : `The user has uploaded image(s) and / or PDF(s) of a ${examType} reading mock test that they own or have licensed.`;

  return `You are a faithful exam-content transcriber. ${scopeIntro}

Rules (non-negotiable, in this order):

1. VERBATIM, 100% identical. Every word, comma, dash, italics, capitalisation must match the source exactly. Do NOT paraphrase, summarise, abridge, fix typos, or normalise spelling. British vs American, hyphenation, em-dashes, italics, bold — preserve all of it.

1a. **COMPLETENESS, non-negotiable.** Transcribe EVERY question and the FULL passage to its final paragraph. If the source has 13 questions, the JSON must contain 13 questions; if the source has multiple question SECTIONS (e.g. TFNG 1-7 + Completion 8-13), every section must appear in "questionSections". If the passage spans several pages, follow it to the very last sentence — do NOT stop early. Do NOT abbreviate the passage with "…" or "[continues]". An incomplete output is a failed output.

2. Paragraph boundaries are NOT page breaks. A paragraph that visually continues from the bottom of one page to the top of the next is ONE paragraph. Detect actual paragraph breaks only by: (a) sentence-ending punctuation followed by (b) a blank line OR a clear indent on the next line. When in doubt, prefer ONE paragraph over two.

3. Preserve paragraph breaks; wrap each paragraph in <p>…</p> for HTML fields.

${gapRule}

5. Unreadable regions → put a string starting with "[UNREADABLE: " + best guess + "]". Do NOT fabricate content to fill gaps.

6. Answer keys: leave empty ({} or omitted) unless the source clearly contains an answer key. Do NOT guess answers — TFNG / matching / inference will be wrong.

7. Detect each part / section's question type from its instruction text. ${isIelts ? 'See rule 11 below for IELTS-specific patterns.' : 'Use exactly one of: gap-fill-text, matching, matching-headings, multiple-choice, tfng, completion.'}

8. Files come in two groups (each file's "group" field is provided in the file's preceding text marker). Group A = "test" (treat as consecutive pages of one document). Group B = "answer-key" (optional). Match each answer-key entry to the corresponding question by ID and populate answers / correctAnswers. If Group B is empty or unreadable, leave answer keys blank.

9. Skip non-content paratext: page numbers, page headers/footers, watermarks (faded overlays), distributor branding (Telegram handles, phone numbers, English-center names, school logos, "©" lines, URLs, "for sample only" stamps), advertisements / promotional inserts. Transcribe only content a student would see on their actual answer paper. When in doubt about a small fragment, prefer to skip.

10. Output JSON matching exactly this shape${scope === 'passage' ? ` (a single ${unit} object — NOT wrapped in any array or envelope)` : ''}:

${shape}

No commentary outside the JSON. No markdown fences. No explanation.
${ieltsTypeGuide}
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
      responseMimeType: 'application/json',
      // Pin to the 2.5 Pro ceiling explicitly. Without this, Gemini was
      // returning truncated transcriptions (passage cut mid-sentence, only
      // 5 of 13 questions emitted) — the default budget on 2.5 Pro is
      // shared with thinking tokens, so silent truncation is real.
      maxOutputTokens: 65536,
      // 2.5 Pro requires thinking mode (Google rejects thinkingBudget: 0 with
      // "Budget 0 is invalid. This model only works in thinking mode."). -1 =
      // dynamic budget, which is the model default and lets Gemini pick.
      thinkingConfig: { thinkingBudget: -1 }
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
  // STOP = clean finish. Anything else means truncation, refusal, or safety.
  // MAX_TOKENS used to be allowed, but in practice it produced silently
  // incomplete transcriptions (passage cut mid-sentence, missing questions),
  // so treat it as a failure now and let GPT-4o pick up the slack.
  if (fr && fr !== 'STOP') {
    throw new Error(`gemini finishReason=${fr} (truncated or blocked)`);
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

// ── Explanations generator ─────────────────────────────────────────
// Inputs the already-imported passage (passage HTML + questionSections
// + correctAnswers) and asks Gemini to produce a per-question
// { text, quote } object explaining WHY each correct answer is correct.
// Gemini sees the answer key, so it's JUSTIFYING a known answer — not
// guessing — which keeps hallucination low.
//
// Server-side quote verification: every returned `quote` must appear
// verbatim (case-insensitive) inside the passage HTML's textContent.
// Quotes that don't match are dropped (the explanation `text` is kept,
// but the runner's <mark> highlight won't render for that question).
// Returns { explanations: {qN:{text,quote}}, droppedQuotes: [qN,…] }.

function _stripHtml(html: string): string {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function _normaliseForQuoteMatch(s: string): string {
  return s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}

type ExplanationItem = { text: string; quote: string };
type ExplanationsResult = {
  explanations: Record<string, ExplanationItem>;
  droppedQuotes: string[];
};

async function generateExplanations(
  passage: Record<string, unknown>,
  examType: string
): Promise<ExplanationsResult> {
  // Pull the bits we need out of the passage shape (IELTS or CEFR).
  const passageHtml: string = examType === 'ielts-reading'
    ? String(passage.passage || '')
    : String((passage.passage as Record<string, unknown>)?.content || passage.passage || '');
  const passagePlain = _stripHtml(passageHtml);
  if (!passagePlain) throw new Error('passage body is empty');

  // Build a compact (q, text, correct) list from questionSections.
  const sections = Array.isArray(passage.questionSections) ? passage.questionSections : [];
  const correctAnswers = (passage.correctAnswers as Record<string, string[] | string> | undefined) || {};
  const qInputs: Array<{ id: number; text: string; correct: string }> = [];
  for (const sec of sections) {
    const qs = (sec as Record<string, unknown>).questions;
    if (!Array.isArray(qs)) continue;
    for (const q of qs) {
      const qo = q as Record<string, unknown>;
      const id = parseInt(String(qo.id || ''), 10);
      if (isNaN(id)) continue;
      const acc = correctAnswers[`q${id}`];
      const correctStr = Array.isArray(acc) ? acc.join(' / ') : String(acc || '');
      if (!correctStr) continue;   // skip questions without a known answer
      qInputs.push({ id, text: String(qo.text || ''), correct: correctStr });
    }
  }
  if (qInputs.length === 0) {
    return { explanations: {}, droppedQuotes: [] };
  }

  const prompt = `You are an IELTS reading explanation generator. The student has already been given the correct answers; your job is to JUSTIFY each one with a short explanation and the verbatim source sentence.

PASSAGE (plain text):
${passagePlain}

QUESTIONS (id · text · correct answer):
${qInputs.map(q => `Q${q.id} · ${q.text} · ${q.correct}`).join('\n')}

For each question, output ONE entry in this JSON shape:
{ "q<id>": { "text": "<1-2 sentence reason>", "quote": "<verbatim sentence from the passage that proves it>" } }

Rules:
1. "text" — one or two sentences IN UZBEK (Latin script — same script the user types Uzbek text in), max ~40 words. Explain WHY the given correct answer is correct (or, for TFNG / YNNG, why it is YES/NO/NOT GIVEN). Do NOT just restate the answer. The audience is Uzbek IELTS students; technical terms like "TRUE", "FALSE", "NOT GIVEN" stay in English (they're the answer labels), but everything else is Uzbek.
2. "quote" — a sentence (or short phrase, max ~200 chars) copied EXACTLY from the English passage above, preserving original spelling and punctuation. NO paraphrasing. NO ellipsis. NO smart-quote substitution. NO Uzbek translation — the quote stays in the original English. If you cannot find a verbatim sentence that supports the answer, return "quote": "" (empty string) rather than invent one.
3. NEVER guess. If the answer is "NOT GIVEN", quote MUST be empty (there is no sentence to point to).
4. Output ONLY the JSON object, no commentary, no markdown fences. Every input question id must appear as a top-level key in the output.`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
      maxOutputTokens: 16384,
      // 2.5 Pro requires thinking mode; -1 = dynamic budget (model default).
      thinkingConfig: { thinkingBudget: -1 }
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
  const cand = j.candidates?.[0];
  if (!cand) throw new Error('gemini returned no candidates');
  if (cand.finishReason && cand.finishReason !== 'STOP') {
    throw new Error(`gemini finishReason=${cand.finishReason}`);
  }
  const raw = cand.content?.parts?.map((p: { text?: string }) => p?.text || '').join('') || '';
  const parsed = tryParseModelJson(raw);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('gemini returned non-JSON: ' + raw.slice(0, 200));
  }

  // Server-side quote verification.
  const passageNorm = _normaliseForQuoteMatch(passagePlain);
  const out: Record<string, ExplanationItem> = {};
  const dropped: string[] = [];
  for (const key of Object.keys(parsed as Record<string, unknown>)) {
    const item = (parsed as Record<string, unknown>)[key];
    if (!item || typeof item !== 'object') continue;
    const it = item as Record<string, unknown>;
    const text  = String(it.text  || '').trim();
    const quote = String(it.quote || '').trim();
    let verifiedQuote = '';
    if (quote) {
      const qn = _normaliseForQuoteMatch(quote);
      // Substring match — quote must appear in passage. Accept short phrases
      // (>= 12 chars) only, since 1-2 word "quotes" risk false positives.
      if (qn.length >= 12 && passageNorm.indexOf(qn) !== -1) {
        verifiedQuote = quote;
      } else {
        dropped.push(key);
      }
    }
    out[key] = { text: text, quote: verifiedQuote };
  }
  return { explanations: out, droppedQuotes: dropped };
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

  // ── EXPLANATIONS scope: separate flow, no file upload ───────────
  // Generates { qN: { text, quote } } for an already-imported passage.
  // Quotes are server-side verified against the passage HTML; any quote
  // the model paraphrased rather than copied is dropped (text kept).
  if ((body.scope || '').toString() === 'explanations') {
    const passage = body.passage as Record<string, unknown> | undefined;
    if (!passage || typeof passage !== 'object') {
      return json(400, { error: 'bad_passage', detail: 'scope=explanations requires { passage: {...} }' });
    }
    try {
      const result = await generateExplanations(passage, examType);
      return json(200, {
        explanations:   result.explanations,
        dropped_quotes: result.droppedQuotes,
        model_used:     'gemini-2.5-pro',
        actor:          (auth as AuthOk).actor
      });
    } catch (e) {
      return json(502, {
        error:  'explanations_failed',
        detail: e instanceof Error ? e.message : String(e)
      });
    }
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

  // Scope: 'full' = whole mock_data envelope; 'passage' = a single passage
  // (IELTS) or part (CEFR) object. Per-passage scope was added so admins
  // can build a mock from multiple source PDFs (one passage at a time).
  const rawScope = (body.scope || 'full').toString();
  const scope: 'full' | 'passage' = rawScope === 'passage' ? 'passage' : 'full';
  const passageIndex = scope === 'passage'
    ? Math.max(1, Math.min(9, parseInt(String(body.passage_index || 1), 10) || 1))
    : 0;

  const shape = scope === 'passage'
    ? (examType === 'cefr-reading' ? CEFR_SINGLE_PART_SHAPE : IELTS_SINGLE_PASSAGE_SHAPE)
    : (examType === 'cefr-reading' ? CEFR_SHAPE             : IELTS_SHAPE);
  const prompt = buildPrompt(examType, notes, shape, scope, passageIndex);

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

  // Sanity check the parsed shape.
  //   • full:    root is an object containing the top-level "passages" /
  //              "parts" array.
  //   • passage: root is a single passage / part object (no envelope).
  //              For IELTS we look for a "passage" string field; for CEFR
  //              we look for a nested "passage" object with "content".
  if (scope === 'passage') {
    const ok = mockData && typeof mockData === 'object' && !Array.isArray(mockData)
      && (
        examType === 'ielts-reading'
          ? typeof (mockData as Record<string, unknown>).passage === 'string'
          : (() => {
              const pp = (mockData as Record<string, unknown>).passage;
              return pp && typeof pp === 'object' && !Array.isArray(pp);
            })()
      );
    if (!ok) {
      return json(502, {
        error:           'shape_mismatch',
        detail:          'expected a single ' + (examType === 'ielts-reading' ? 'passage' : 'part') + ' object',
        model_used:      modelUsed,
        fallback_reason: fallbackReason
      });
    }
  } else {
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
  }

  return json(200, {
    mock_data:       mockData,
    model_used:      modelUsed,
    fallback_reason: fallbackReason || undefined,
    actor:           (auth as AuthOk).actor
  });
});
