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
      "type": string,                    // EXACTLY one of: "gap-fill-text" | "matching" | "matching-headings" | "reading-comprehension"
      "questionRange": string,           // e.g. "1-6"
      "instruction": string,             // HTML allowed
      "passage": { "title": string, "content": string },   // HTML wrapped in <p>…</p>. For gap-fill-text, content carries <span class="gap" data-gap="N">_____(N)_____</span> markers (one per blank, N matches question id).
      "questions": [ { "id": number, "hint": string } ],   // For "matching" use { "id": number, "textNumber": number }; for "matching-headings" use { "id": number, "paragraphNumber": string (Roman numeral or "1","2",…) }; for "reading-comprehension" the top-level questions array is usually EMPTY — questions live inside questionSections.
      "answers": { "1": [string], "2": [string] },         // string array allows alternative spellings. Always includes EVERY question id from this part, regardless of which section/structure it came from.
      "explanations": { "q1": { "text": string, "quote": string } },

      // Type-specific extras — include only when the "type" matches:
      "topicTitle":        string,       // matching ONLY: a SHORT (2-4 word) theme name for the set of texts, used by the picker as a row label since matching parts have no single passage.title. e.g. "Hotels", "Job ads", "Restaurant ads", "Course brochures". Derive it from the common subject of texts[].
      "statements":        [ { "letter": "A", "text": string } ],   // matching ONLY: the labelled options the student picks from
      "texts":             [ { "number": number, "content": string } ],   // matching ONLY: short ads/blurbs being matched (numbered 7-14 etc.)
      "extraStatements":   [string],     // matching ONLY: letters from statements[] that don't match any text (distractors)
      "statementsFirst":   boolean,      // matching ONLY: UI layout hint — true if statements are shown above texts

      "headings":          [ { "letter": "A", "text": string } ],   // matching-headings ONLY
      "extraHeadings":     [string],     // matching-headings ONLY: distractor heading letters

      "questionSections":  [             // reading-comprehension ONLY: nested sections. Each section is one of three shapes:
        // mcq:        { "type": "mcq",     "title": "Questions 21-24: Multiple Choice", "instruction": "<HTML>", "questions": [ { "id": number, "text": string, "options": [ { "letter": "A", "text": string } ] } ] }
        // tfni:       { "type": "tfni",    "title": "Questions 25-29: True/False/No Information", "instruction": "<HTML>", "options": ["True","False","No Information"], "questions": [ { "id": number, "text": string } ] }
        // gap-fill:   { "type": "gap-fill","title": "Questions 30-33: Gap Filling Section", "instruction": "<HTML>", "summaryText": "<HTML with <span class=\\"gap-input\\" data-gap=\\"N\\">_____(N)_____</span> markers>", "questions": [ { "id": number, "hint": string } ] }
      ]
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

const IELTS_LISTENING_SINGLE_PART_SHAPE = `{
  "partNumber": number,                          // 1, 2, 3, or 4 — client overrides this
  "title": string,                               // SHORT CONTENT TOPIC (3-6 words), e.g. "Guitar group enrolment" / "Lifeboat volunteer interview" / "Tardigrades zoology lecture". Do NOT output just "Section 1" — describe what this section is ACTUALLY about. The picker shows this as the section row label next to the section number.
  "type": "mixed",                               // always "mixed" — structural variety lives in subParts[]
  "questionRange": string,                       // e.g. "1-10"
  "instruction": string,                         // plain-text section instruction (no HTML)
  "subParts": [ /* one or more sub-part objects — see rule 11 below for the 12 supported shapes */ ],
  "answers": { "1": [string] }                   // per-question — array allows alternative spellings
}`;

const IELTS_LISTENING_SHAPE = `{
  "testInfo": {
    "id":              string,                   // e.g. "ielts-listening-test-02"
    "title":           string,                   // Human-readable test title. If the source files show an attribution (e.g. "Cambridge IELTS 18 Test 3"), use that. Otherwise output a generic "IELTS Listening Practice Test NN".
    "totalTime":       40,
    "totalQuestions":  40
  },
  "source":            string,                   // OPTIONAL top-level source attribution from the cover page / header / footer / distributor caption (e.g. "Cambridge IELTS 18 Test 3", "The Official Cambridge Guide to IELTS Test 5"). Picker displays this as a chip on the card. OMIT the field entirely if no clear attribution is visible — do NOT guess.
  "parts": [ /* 4 single-section objects, partNumber 1..4 — see single-section shape. Each MUST have a CONTENT-TOPIC title, NOT just "Section N". */ ]
}`;

// ── CEFR Listening shapes ─────────────────────────────────────────────
// A standard CEFR B1-B2-C1 Listening mock has EXACTLY 6 parts in this
// fixed order. Each part has a fixed `type`; structural variety lives
// per-part-type (no subParts[] wrapper like IELTS Listening uses).
//
// 1. mcq-reply           Q1-8   short A/B/C replies to single-sentence prompts
// 2. gap-fill-form       Q9-14  form completion (one-word fills)
// 3. matching-speakers   Q15-19 5 speakers → A-F option pool (1 extra)
// 4. map-labeling        Q20-24 map image labels → A-I option pool
// 5. mcq-extracts        Q25-30 3 extracts × 2 MCQ questions each
// 6. sentence-completion Q31-36 passage HTML with inline {gap-input} markers

const CEFR_LISTENING_SINGLE_PART_SHAPE = `{
  "partNumber": number,                          // 1, 2, 3, 4, 5, or 6 — client overrides this
  "title": string,                               // SHORT CONTENT TOPIC (3-6 words), e.g. "Sports Festival" / "Community Area Map" / "Roman tablets". For Part 1 (mcq-reply) the source rarely has a unifying topic so emit a generic "Short replies (A/B/C)". For Part 3 (matching-speakers) emit the topic of what the speakers are talking about (e.g. "Hotels with children"). For Part 5 (mcq-extracts) emit "MCQ extracts" unless the extracts share a clear theme. Do NOT just output "Part N".
  "type": string,                                // EXACTLY one of: "mcq-reply" | "gap-fill-form" | "matching-speakers" | "map-labeling" | "mcq-extracts" | "sentence-completion" — chosen by part number (see rule 11)
  "questionRange": string,                       // e.g. "1-8" — REFLECTS THE ACTUAL question span in the source. Hand-made mocks often deviate from the official ranges; emit whatever range the source actually shows (e.g. "1-7" if Part 1 only has 7 questions, "9-15" if Part 2 has 7). Do NOT pad to the official length.
  "instruction": string,                         // plain-text part instruction (no HTML)
  "answers": { "1": [string] },                  // per-question; arrays wrap every answer so alt spellings can be added later

  // Type-specific extras — emit ONLY the ones for the matching "type":

  // mcq-reply (Part 1):
  "questions": [ { "id": number, "options": [ { "letter": "A", "text": string }, { "letter": "B", "text": string }, { "letter": "C", "text": string } ] } ],   // 8 entries, options always A/B/C

  // gap-fill-form (Part 2):
  "formTitle": string,                           // e.g. "Sports Festival"
  "formContent": [                               // ordered list of form lines — emit ONE entry per visible line
    { "type": "heading", "text": "<section heading, e.g. 'The Date'>" }
    | { "type": "item",    "text": "<literal line with no blank>" }
    | { "type": "item-gap","text": "<context label BEFORE the blank, e.g. '30th June -'>", "gapId": number, "gapAfter": true, "gapSuffix"?: "<context AFTER the blank, e.g. 'July'>" }
  ],
  // (also emit a flat "questions" array as { "id": N, "hint": "<short hint with ____ where the gap is>" } — one per gapId)

  // matching-speakers (Part 3):
  "speakers": [ { "id": number, "label": "Speaker 1" }, { "id": number, "label": "Speaker 2" }, ... ],   // 5 entries
  "options": [ { "letter": "A", "text": string }, { "letter": "B", "text": string }, ... ],             // 6 options A-F (sometimes 7 A-G)
  "extraOptions": [string],                      // the letters that don't match any speaker (typically 1 extra; rare cases 2)

  // map-labeling (Part 4):
  "mapTitle": string,                            // e.g. "Community Area Map"
  "mapImage": "",                                // ALWAYS leave EMPTY here — admin uploads via the editor; the editor populates parts[3].mapImage separately
  "mapLabels": ["A", "B", "C", "D", "E", "F", "G", "H", "I"],   // all letters present on the map (typically A-I or A-H)
  "extraLabels": [string],                       // letters that don't match any place (typically 4 extras when there are 9 labels for 5 questions)
  // (also emit a flat "questions" array as { "id": N, "place": "<thing being placed on the map, e.g. 'New car park'>" } — 5 entries)

  // mcq-extracts (Part 5):
  "extracts": [                                  // 3 extracts × 2 questions each
    { "extractNumber": 1, "title": "Extract One",
      "intro": "<context lead-in for the whole extract, e.g. 'You overhear a man telling a friend about a trip to the theatre.' — OMIT or set to '' if the source does not show one>",
      "questions": [
        { "id": number, "text": "<just the question stem — DO NOT prefix with the question number; DO NOT include the extract intro/context here>", "options": [ { "letter": "A", "text": string }, { "letter": "B", "text": string }, { "letter": "C", "text": string } ] }
      ]
    }
  ],

  // sentence-completion (Part 6):
  "passageTitle": string,                        // e.g. "Roman tablets" / "Origins of ceramics"
  "passageContent": string,                      // HTML with inline gap markers <span class="gap-input" data-gap="N">_____(N)_____</span> — one per blank, where N matches the question id. Use <br><br> between sentences/items (no <p> tags). Sentence text BEFORE the gap is the context.
  // (also emit a flat "questions" array as { "id": N, "hint": "<short context fragment around the blank, e.g. 'At the site of an old ____'>" } — 6 entries)
}`;

const CEFR_LISTENING_SHAPE = `{
  "testInfo": {
    "title":           string,                   // Human-readable title (e.g. "CEFR Listening Mock Test 12"). If the source shows a number, use it; otherwise a generic title is fine.
    "totalTime":       40,
    "totalQuestions":  number,                   // SUM of questions across all parts as actually transcribed. Usually 36 in official mocks; hand-made mocks may have 30-40+. Compute from the source, do NOT default.
    "parts":           6,
    "level":           "B1-B2-C1"
  },
  "source":            string,                   // OPTIONAL top-level source attribution. OMIT entirely if no clear attribution is visible — do NOT guess.
  "parts": [ /* 6 single-part objects, partNumber 1..6 — see single-part shape. Each part's "type" is FIXED by its position: 1=mcq-reply, 2=gap-fill-form, 3=matching-speakers, 4=map-labeling, 5=mcq-extracts, 6=sentence-completion. Question COUNTS within each part are NOT fixed — emit however many the source shows. */ ]
}`;

const CEFR_SINGLE_PART_SHAPE = `{
  "partNumber": number,
  "title": string,
  "type": string,                    // EXACTLY one of: "gap-fill-text" | "matching" | "matching-headings" | "reading-comprehension"
  "questionRange": string,
  "instruction": string,
  "passage": { "title": string, "content": string },   // HTML wrapped in <p>…</p>. For gap-fill-text, content carries <span class="gap" data-gap="N">_____(N)_____</span> markers. **EXCEPTION**: for "matching-headings" parts, use { "title": string, "paragraphs": [{ "number": "A"|"I", "content": "…", "questionId": 15 }, …] } — a structured paragraphs[] array, NOT a content HTML string. See rule 11 below.
  "questions": [ { "id": number, "hint": string } ],   // matching: { id, textNumber }; matching-headings: { id, paragraphNumber }; reading-comprehension: usually EMPTY (questions live inside questionSections).
  "answers": { "1": [string], "2": [string] },
  "explanations": { "q1": { "text": string, "quote": string } },

  // Type-specific extras — include only when "type" matches:
  "topicTitle":        string,       // matching ONLY: short 2-4 word theme name (e.g. "Hotels", "Job ads") — picker row label
  "statements":        [ { "letter": "A", "text": string } ],   // matching ONLY
  "texts":             [ { "number": number, "content": string } ],   // matching ONLY
  "extraStatements":   [string],     // matching ONLY: distractor letters
  "statementsFirst":   boolean,      // matching ONLY

  "headings":          [ { "letter": "A", "text": string } ],   // matching-headings ONLY
  "extraHeadings":     [string],     // matching-headings ONLY

  "questionSections":  [             // reading-comprehension ONLY: array of sections, each one of three shapes:
    // mcq:      { "type": "mcq",     "title": "Questions 21-24: Multiple Choice", "instruction": "<HTML>", "questions": [ { "id": number, "text": string, "options": [ { "letter": "A", "text": string } ] } ] }
    // tfni:     { "type": "tfni",    "title": "Questions 25-29: True/False/No Information", "instruction": "<HTML>", "options": ["True","False","No Information"], "questions": [ { "id": number, "text": string } ] }
    // gap-fill: { "type": "gap-fill","title": "Questions 30-33: Gap Filling Section", "instruction": "<HTML>", "summaryText": "<HTML with <span class=\\"gap-input\\" data-gap=\\"N\\">_____(N)_____</span> markers>", "questions": [ { "id": number, "hint": string } ] }
  ]
}`;

function buildPrompt(
  examType: string,
  notes: string,
  shape: string,
  scope: 'full' | 'passage' = 'full',
  passageIndex: number = 0
): string {
  const isIelts          = examType === 'ielts-reading';
  const isCefr           = examType === 'cefr-reading';
  const isIeltsListening = examType === 'ielts-listening';
  const isCefrListening  = examType === 'cefr-listening';
  const unit = isIelts ? 'passage' : (isIeltsListening || isCefrListening) ? 'part' : 'part';
  const Unit = isIelts ? 'Passage' : (isIeltsListening || isCefrListening) ? 'Part' : 'Part';

  // Gap-marker rule. CEFR Reading uses <span class="gap"> tags. IELTS
  // Reading uses "{INPUT}" placeholders. IELTS Listening uses both
  // (subPart gapIds + {INPUT} for sentence-completion items). CEFR
  // Listening uses two patterns: gapId-on-form-row for Part 2 (gap-fill-
  // form), and <span class="gap-input"> markers for Part 6 (sentence-
  // completion's passageContent).
  const gapRule = (isIelts || isIeltsListening)
    ? `4. **Fill-in-the-blank gaps in question text use the literal placeholder "{INPUT}"** — exactly that, no variation. Example: "Address: {INPUT} Street." Do NOT use HTML span tags. ${isIeltsListening ? 'For "gap-fill-form" / "table-completion" sub-parts, the gap is described via the gapId field on the row/item — the surrounding "text" / "prefix" / "suffix" supplies the context. No {INPUT} marker is needed there; only in "sentence-completion" item text.' : ''}`
    : isCefrListening
    ? `4. **Fill-in-the-blank gaps depend on the part type.** For Part 2 (gap-fill-form): emit ONE "item-gap" object per numbered blank inside formContent[]; the gap is identified by gapId, and the surrounding "text" / "gapSuffix" supplies the context. No {INPUT} marker inside formContent. For Part 6 (sentence-completion): the passageContent HTML carries the gap markers inline as <span class="gap-input" data-gap="N">_____(N)_____</span> — exactly that format, where N matches the question id. Use <br><br> between sentences within passageContent (NOT <p> tags). For all other CEFR Listening part types, no fill-in-the-blank gaps exist.`
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

  // IELTS-Listening-specific type guide. The structural variety in
  // listening lives in subParts[] inside each section; the section
  // itself is always type="mixed". One section can contain multiple
  // sub-parts (e.g., Section 1 is typically gap-fill-form for Q1-6 and
  // table-completion for Q7-10). Read the section instructions + visible
  // structure and emit ONE subPart per visibly-distinct block.
  const ieltsListeningTypeGuide = isIeltsListening ? `
11. **IELTS Listening sub-part type detection.** A section may contain ONE or MORE sub-parts. Each sub-part is exactly ONE of the 12 shapes below. Pick the one matching each visible block; emit them in source order inside subParts[]. Every question id in this section must be covered by exactly ONE sub-part.

  • **gap-fill-form** — Section 1 most common (forms / notes / records). \`{ "type": "gap-fill-form", "instruction": string, "formTitle": string, "formContent": [
        { "type": "text",     "text": "<literal context line, no blank>" }
      | { "type": "item-gap", "text": "<context label before the blank, e.g. 'Address: '>", "gapId": number, "gapSuffix"?: "<context after the blank, e.g. ' Street'>" }
    ] }\` — emit ONE item-gap per numbered blank; "text" / "gapSuffix" should be the SHORT label text adjacent to the blank, NOT a long summary.

  • **table-completion** — Section 1 / 2. \`{ "type": "table-completion", "instruction": string, "tableTitle": string,
       "headers": [string],
       "rows": [
         [ "<literal cell>" | { "type": "gap", "prefix": "<context before blank>", "gapId": number, "suffix"?: "<context after blank>" } ]
       ] }\` — one row per table row; each cell is either a literal string OR a gap object (when the cell contains a numbered blank).

  • **mcq-extracts** — single-answer A/B/C MCQ (Section 2/3 typical). \`{ "type": "mcq-extracts", "instruction": string,
       "extracts": [
         { "title"?: string,    // optional sub-heading (e.g. "Working as a lifeboat volunteer")
           "intro"?: string,    // optional context lead-in shown ABOVE the questions (e.g. "You overhear a man telling a friend about a trip to the theatre."). Put the extract's context paragraph here — NEVER inside the first question's text.
           "questions": [
             { "id": number, "text": "<just the question stem — DO NOT prefix with the question number, DO NOT include the extract's intro/context>", "options": [ { "letter": "A", "text": string }, { "letter": "B", ... }, { "letter": "C", ... } ] }
           ] }
       ] }\` — group questions into "extracts" only if the source visibly groups them under a sub-heading; otherwise use one extract.

  • **mcq-multi** — "Choose TWO letters, A-E" (Section 2/3). \`{ "type": "mcq-multi", "instruction": string, "stem": string,
       "options": [ { "letter": "A", "text": string }, ... ],
       "questions": [ { "id": number }, { "id": number } ] }\` — emit TWO question entries (one per blank) that share the same options.

  • **matching** — match items to a letter pool (Section 3 typical, also Section 2 sometimes). \`{ "type": "matching", "instruction": string, "boxTitle": string,
       "options": [ { "letter": "A", "text": string }, ... ],   // letter pool — includes distractors
       "questions": [ { "id": number, "text": "<the thing being matched>" } ] }\`.

  • **sentence-completion** — "Complete the sentences. Write NO MORE THAN TWO WORDS…" (Section 4 typical). \`{ "type": "sentence-completion", "instruction": string,
       "items": [ { "id": number, "text": "Sentence with a {INPUT} marker where the blank is." } ] }\` — exactly ONE {INPUT} per item.

  • **summary-completion** — long paragraph with multiple inline blanks (Section 4 sometimes). \`{ "type": "summary-completion", "instruction": string,
       "summaryText": "<HTML paragraph with markers <span class=\\"gap-input\\" data-gap=\\"N\\">_____(N)_____</span>>",
       "questions": [ { "id": number, "hint"?: string } ] }\`.

  • **flowchart-completion** — labelled flow chart with blanks (Section 3/4 less common). \`{ "type": "flowchart-completion", "instruction": string, "boxTitle"?: string,
       "options"?: [ { "letter": "A", "text": string } ],   // present only when the flow chart uses a word bank A-H
       "steps": [
         { "label": "<box label / step title>", "items": [ "<literal line>" | { "type": "gap", "gapId": number, "prefix"?: string, "suffix"?: string } ] }
       ] }\`.

  • **map-labelling** — "Label the map below. Write the correct letter…" (Section 2 sometimes). \`{ "type": "map-labelling", "instruction": string,
       "mapImage"?: string,         // ALWAYS leave empty here — admin uploads via the editor; the editor populates parts[1].mapImage separately
       "options": [ { "letter": "A", "text": "<feature description>" } ],   // labels A-H typically
       "questions": [ { "id": number, "text": "<thing being placed on the map, e.g. 'Cafe'>" } ] }\` — note: do NOT include a mapImage URL here; the editor manages map uploads separately.

  • **diagram-labelling** — "Label the diagram below." (Section 4 sometimes). \`{ "type": "diagram-labelling", "instruction": string,
       "items": [ { "id": number, "text": "<label or pointer text containing {INPUT}>" } ] }\`.

  • **short-answer** — "Answer the questions below. Write NO MORE THAN THREE WORDS…" (any section). \`{ "type": "short-answer", "instruction": string,
       "items": [ { "id": number, "text": "<the question itself, e.g. 'How long is the course?'>" } ] }\`.

  • **classification** — "Classify the following as A / B / C" (Section 3 sometimes). \`{ "type": "classification", "instruction": string,
       "categories": [ { "letter": "A", "text": "<category label>" } ],
       "questions": [ { "id": number, "text": "<the item being classified>" } ] }\`.

12. **IELTS Listening — fields NOT to emit on import**. Leave \`audioFile\`, \`transcript\`, \`audioStartSec\`, \`audioLayout\`, and (for Section 2) \`mapImage\` OUT of the JSON — the admin sets those via separate upload + transcribe flows. Emit only the structural content listed above.

13. **Always emit a flat \`answers\` dict** keyed by question id (as a string), regardless of which sub-part the question lives in. Example: \`{ "1": ["Mathieson"], "2": ["beginners"], "11": ["B"], "17": ["A"], "23": ["F"] }\`. Arrays wrap every answer so alternative spellings can be added later. For multi-answer questions (mcq-multi), each id holds ONE of the chosen letters: \`{ "16": ["B"], "17": ["D"] }\` — the runner treats the pair as interchangeable.
` : '';

  // CEFR-specific type guide. A real CEFR B1-B2-C1 Reading test ALWAYS has
  // these 5 parts in this order; the model should set "type" accordingly
  // and emit the type-specific extras documented in the shape above.
  const cefrTypeGuide = isCefr ? `
11. **CEFR Reading question-type detection** — a standard CEFR B1-B2-C1 Reading test has 5 parts in a fixed order. Set each part's "type" exactly as shown, populate the type-specific fields, and put EVERY question id in the part's top-level "answers". Use this table:

  | Part # | Source instruction looks like… | type | Required extras |
  |---|---|---|---|
  | 1 (typically Qs 1-6 or 1-7) | "Read the text. Fill in each gap with ONE word. You must use a word which is somewhere in the rest of the text." | "gap-fill-text" | Passage HTML carries the gap markers: \`<span class="gap" data-gap="N">_____(N)_____</span>\` — one per blank, where N matches the question id. "questions": [{ "id": N, "hint": "…SHORT FRAGMENT (~5-10 words) around the blank with the gap shown as _____…" }]. "answers": { "1": ["word"], "2": ["word"] }. NO statements, headings, or sections. |
  | 2 (typically Qs 7-14) | "Read the texts 7-14 and the statements A-J. Decide which text matches with the situation described in the statements. Each statement can be used ONCE only. There are TWO extra statements which you do not need to use." | "matching" | Top-level **statements**: [{ "letter": "A", "text": "…" }, { "letter": "B", "text": "…" }, …] — the labelled options. **texts**: [{ "number": 7, "content": "…" }, { "number": 8, "content": "…" }, …] — the short ad/blurb texts being matched. **extraStatements**: ["E", "H"] — the letters from statements[] that don't match any text (the "TWO extra" the instruction names). **statementsFirst**: true (UI hint — almost always true here). "questions": [{ "id": 7, "textNumber": 7 }, …]. "answers": { "7": ["F"], "8": ["D"], … }. **REQUIRED**: also emit a top-level **topicTitle** — a short 2-4 word theme name shared by the texts (e.g. "Hotels", "Job ads", "Restaurant ads", "Course brochures", "Volunteer opportunities", "Travel destinations"). Pick whatever genre best describes the group of texts. Used by the picker as a row label since matching parts have no natural single passage.title. |
  | 3 (typically Qs 15-20 or 15-21) | "Read the text. Choose the correct heading for each paragraph from the list of headings A-J. There are extra headings which you do not need to use." | "matching-headings" | Top-level **headings**: [{ "letter": "A", "text": "…" }, …]. **extraHeadings**: ["C", "E"] — distractor heading letters. "questions": [{ "id": 15, "paragraphNumber": "I" }, { "id": 16, "paragraphNumber": "II" }, …] — use Roman numerals or numbers EXACTLY as the source labels them. "answers": { "15": ["F"], … }. **REQUIRED shape**: passage MUST be \`{ "title": string, "paragraphs": [{ "number": "A"|"I", "content": "…", "questionId": 15 }, …] }\` — a **structured array of paragraph objects**, NOT a single HTML string in passage.content. Each paragraph object carries: \`number\` (the source label exactly as printed: "A"/"B" if letters, "I"/"II" if Romans), \`content\` (the paragraph body text, plain or with inline HTML but WITHOUT the leading label), and \`questionId\` (the question id this paragraph maps to — e.g. paragraph A → 15, paragraph B → 16). Do NOT emit \`passage.content\` for this type — the runner reads \`passage.paragraphs[]\` directly and crashes if it's missing. passage.title MUST also be set (e.g. "Rock the Boat", "FALKLAND ISLANDS", "Buses") — the picker uses it as a row label. If the source doesn't print an explicit title, infer a short 2-4 word topic from the paragraphs. |
  | 4 (typically Qs 21-29) | A single longer passage followed by MULTIPLE question sections (MCQ + True/False/No Information). | "reading-comprehension" | Use **questionSections**: an array of section objects. See section types below. Top-level "questions" stays empty; top-level "answers" collects ALL ids from every section: { "21": ["A"], "22": ["B"], …, "25": ["True"], "26": ["No Information"], … }. |
  | 5 (typically Qs 30-35) | A single passage followed by MULTIPLE question sections — usually Gap Filling Section + MCQ. | "reading-comprehension" | Same shape as Part 4. |

  **Section shapes for reading-comprehension parts** (questionSections array, in source order):

  • **section type "mcq"** — \`{ "type": "mcq", "title": "Questions 21-24: Multiple Choice", "instruction": "<HTML — usually 'Choose the correct option A, B, C or D'>", "questions": [ { "id": 21, "text": "<the question stem>", "options": [ { "letter": "A", "text": "psychologists" }, { "letter": "B", "text": "patients at a clinic" }, { "letter": "C", "text": "…" }, { "letter": "D", "text": "…" } ] } ] }\`. Options live INLINE on each question (NOT on the section).

  • **section type "tfni"** — True / False / No Information. \`{ "type": "tfni", "title": "Questions 25-29: True/False/No Information", "instruction": "<HTML>", "options": ["True", "False", "No Information"], "questions": [ { "id": 25, "text": "<the statement to evaluate>" } ] }\`. The 3-way \`options\` array lives on the SECTION (not per question). The "answers" entry for these uses the FULL string: { "25": ["True"] }, { "26": ["No Information"] }, etc.

  • **section type "gap-fill"** (inside reading-comprehension Part 5) — \`{ "type": "gap-fill", "title": "Questions 30-33: Gap Filling Section", "instruction": "<HTML>", "summaryText": "<HTML paragraphs with gap markers>", "questions": [ { "id": 30, "hint": "…fragment with _____…" } ] }\`. Gap markers inside summaryText use the **gap-input** class (NOT "gap"): \`<span class="gap-input" data-gap="30">_____(30)_____</span>\`. The summaryText is a SEPARATE block from the main passage.content.

12. **Single-word vs lettered answers** — for "gap-fill-text" and the "gap-fill" section, answers are usually single words: { "1": ["dinner"] }. For "matching" / "matching-headings" / "mcq", answers are single uppercase letters: { "7": ["F"] }. For "tfni", answers are the literal strings "True", "False", or "No Information" with that capitalisation. Always wrap the answer in an array (even a single value) so alternative spellings can be added later.

13. **Empty answers are fine** — if the source doesn't include an answer key, leave "answers" as \`{}\` (do NOT guess). The admin can add answers manually in the editor.
` : '';

  // CEFR-Listening-specific type guide. A standard CEFR Listening test
  // has EXACTLY 6 parts in this fixed order, each with a fixed type.
  // Unlike IELTS Listening, there is no subParts[] wrapper — every
  // part's structure is determined by its position (1=mcq-reply,
  // 2=gap-fill-form, etc.). The model should set the type accordingly
  // and emit only the type-specific extras documented in the shape.
  const cefrListeningTypeGuide = isCefrListening ? `
11. **CEFR Listening part-type detection** — a standard CEFR B1-B2-C1 Listening test has 6 parts in a fixed order, and each part's TYPE is fixed by position. Question COUNTS per part are NOT fixed: official mocks use 8/6/5/5/6/6 (total 36) but hand-made mocks may deviate (Part 1 with 7 or 10 questions, Part 3 with 4 or 6 speakers, etc.). Extract however many questions the source actually shows; never pad or truncate to the official count.

  Set each part's "type" exactly as shown, populate only the type-specific fields, and put EVERY question id in the part's top-level "answers".

  | Part # | Typical range | type | Source instruction looks like… | Required extras |
  |---|---|---|---|---|
  | 1 | Q1-8 (varies)   | "mcq-reply"           | "You will hear some sentences. You will hear each sentence twice. Choose the correct reply to each sentence (A, B, or C)." | "questions": [{ "id": N, "options": [{ "letter": "A", "text": "..." }, { "letter": "B", "text": "..." }, { "letter": "C", "text": "..." }] }] — one entry per question shown in the source (count is whatever the source has, not always 8). Always A/B/C. NO sentence stem; the audio plays the prompt sentence, and the printed options ARE the candidate replies. "answers" keys are single letters. |
  | 2 | Q9-14 (varies)  | "gap-fill-form"       | "You will hear someone giving a talk. For each question, fill in the missing information in the numbered space. Write ONE WORD and/or A NUMBER for each answer." | "formTitle": short topic (e.g. "Sports Festival"). "formContent": ordered list — emit ONE entry per visible form line. Three entry types: \`{ "type": "heading", "text": "..." }\` for section headings, \`{ "type": "item", "text": "..." }\` for literal lines with no blank, \`{ "type": "item-gap", "text": "<context BEFORE blank>", "gapId": N, "gapAfter": true, "gapSuffix"?: "<context AFTER blank>" }\` for lines with a numbered blank. Also emit a flat top-level "questions" array: [{ "id": N, "hint": "<short hint with ____ where the gap is>" }] — one per gapId (count = however many gaps the source shows, often 6 but can be 5 or 7+). "answers" keys are single words / numbers (wrap each in an array; include capitalised + lowercase variants when the source allows: \`{ "9": ["13th", "thirteenth", "13"] }\`). |
  | 3 | Q15-19 (varies) | "matching-speakers"   | "You will hear N different people talking about [topic]. For questions X-Y, choose from the list (A-F/G/H) what each speaker says. Use the letters only once. There is/are EXTRA letter(s) which you do not need to use." | "speakers": [{ "id": <first-id>, "label": "Speaker 1" }, …] — one entry per speaker in the source (typically 5, sometimes 4 or 6). "options": [{ "letter": "A", "text": "..." }, ...] — full pool of letter options as shown (A-F, A-G, or A-H). "extraOptions": [letters that don't match any speaker]. "answers" keys are single letters. NO "questions" array. The "title" for this part should describe what the speakers discuss (e.g. "Hotels with children"). |
  | 4 | Q20-24 (varies) | "map-labeling"        | "You will hear someone giving a talk. Label the places on the map. There is/are N extra option(s) which you do not need to use." | "mapTitle": e.g. "Community Area Map". "mapImage": "" (ALWAYS empty here — admin uploads the map image separately via the editor). "mapLabels": full pool of letters on the map as shown (A-I, A-H, A-J, etc.). "extraLabels": letters not assigned to any place. "questions": [{ "id": N, "place": "<thing being placed on the map, e.g. 'New car park'>" }] — one entry per labelled place shown in the source (typically 5, can be 4 or 6). "answers" keys are single letters. |
  | 5 | Q25-30 (varies) | "mcq-extracts"        | "You will hear three extracts. Choose the correct answer (A, B or C) for each question. There are N questions for each extract." | "extracts": [ { "extractNumber": 1, "title": "Extract One", "questions": [{ "id": N, "text": "<question stem>", "options": [{ "letter": "A", "text": "..." }, { "letter": "B", "text": "..." }, { "letter": "C", "text": "..." }] }] }, … ] — emit as many extracts as the source shows (usually 3) with as many questions each as the source has (usually 2, sometimes 1 or 3). "answers" keys are single letters. |
  | 6 | Q31-36 (varies) | "sentence-completion" | "You will hear someone giving a talk. For each question, fill in the missing information in the numbered space. Write ONE WORD and/or A NUMBER for each answer." | "passageTitle": short topic (e.g. "Roman tablets"). "passageContent": HTML string with inline gap markers <span class="gap-input" data-gap="N">_____(N)_____</span> — one per blank shown in the source (count varies, typically 6). Use <br><br> between sentences (NOT <p> tags). "questions": [{ "id": N, "hint": "<short context fragment with ____ where the blank is, e.g. 'At the site of an old ____'>" }] — one per gap. "answers" keys are single words / numbers (wrap each in an array; include capitalised + lowercase variants: \`{ "31": ["fort", "Fort"] }\`). |

12. **Fields NOT to emit on import.** Leave \`audioFile\`, \`transcript\`, \`answerHighlights\`, and (for Part 4) \`mapImage\` OUT of the JSON — the admin sets those via separate upload + transcribe flows. Emit only the structural content listed above.

13. **Answer arrays MUST wrap every value.** Always emit \`"<id>": [ ... ]\` — even when there's one value. For Parts 2 + 6 (word/number answers), include alternative spellings + the capitalised + lowercase form (e.g. \`{ "9": ["13th", "thirteenth", "13"], "10": ["park", "Park"] }\`). For Parts 1, 3, 4, 5 (letter answers), arrays still wrap: \`{ "1": ["C"], "15": ["D"] }\`. If the source doesn't include an answer key, leave "answers" as \`{}\` — do NOT guess.

14. **Part-by-part question-id continuity.** Question ids run consecutively from 1 in Part 1 onward. Never restart numbering inside a part. Always emit a \`questionRange\` matching the part's id span ACTUALLY found in the source — e.g. if Part 1 has 7 questions emit "1-7", and Part 2 then starts at 8. The id of the FIRST question in any part should be exactly (previous part's last id) + 1. If the source has its own numbered ids (Q1-Q40 visible on the page), follow those numbers verbatim — don't renumber.
` : '';

  // Scope-specific framing. In "passage" mode the user is uploading just
  // ONE passage (typically because each passage comes from a different
  // source), so we tell the model to expect that and emit a single
  // passage object instead of a full mock envelope.
  const examLabel = isIeltsListening ? 'IELTS Listening' : isCefrListening ? 'CEFR Listening' : (isIelts ? 'IELTS Reading' : 'CEFR Reading');
  const scopeIntro = scope === 'passage'
    ? `The user has uploaded image(s) and / or PDF(s) for **just ONE ${unit}** of an ${examLabel} mock — specifically ${Unit} ${passageIndex || '?'}. Treat the uploaded files as that single ${unit} only. The accompanying answer-key files (if any) cover ONLY this ${unit}'s questions. Output a single ${unit} object — NOT wrapped in any envelope or array.`
    : `The user has uploaded image(s) and / or PDF(s) of an ${examLabel} mock test that they own or have licensed.`;

  return `You are a faithful exam-content transcriber. ${scopeIntro}

Rules (non-negotiable, in this order):

1. VERBATIM, 100% identical. Every word, comma, dash, italics, capitalisation must match the source exactly. Do NOT paraphrase, summarise, abridge, fix typos, or normalise spelling. British vs American, hyphenation, em-dashes, italics, bold — preserve all of it.

1a. **COMPLETENESS, non-negotiable.** Transcribe EVERY question and the FULL passage to its final paragraph. If the source has 13 questions, the JSON must contain 13 questions; if the source has multiple question SECTIONS (e.g. TFNG 1-7 + Completion 8-13), every section must appear in "questionSections". If the passage spans several pages, follow it to the very last sentence — do NOT stop early. Do NOT abbreviate the passage with "…" or "[continues]". An incomplete output is a failed output.

2. Paragraph boundaries are NOT page breaks. A paragraph that visually continues from the bottom of one page to the top of the next is ONE paragraph. Detect actual paragraph breaks only by: (a) sentence-ending punctuation followed by (b) a blank line OR a clear indent on the next line. When in doubt, prefer ONE paragraph over two.

3. Preserve paragraph breaks; wrap each paragraph in <p>…</p> for HTML fields.

${gapRule}

5. Unreadable regions → put a string starting with "[UNREADABLE: " + best guess + "]". Do NOT fabricate content to fill gaps.

6. Answer keys: leave empty ({} or omitted) unless the source clearly contains an answer key. Do NOT guess answers — TFNG / matching / inference will be wrong.

7. Detect each part / section's question type from its instruction text. ${isIelts ? 'See rule 11 below for IELTS Reading patterns.' : isIeltsListening ? 'See rule 11 below for the 12 IELTS Listening sub-part shapes — one section can contain multiple sub-parts.' : isCefrListening ? 'See rule 11 below for the CEFR Listening per-part table — exactly 6 parts in a fixed order, each with a fixed type.' : 'See rule 11 below for the CEFR per-part table (a standard test has exactly 5 parts in a fixed order — gap-fill-text, matching, matching-headings, reading-comprehension, reading-comprehension).'}

8. Files come in two groups (each file's "group" field is provided in the file's preceding text marker). Group A = "test" (treat as consecutive pages of one document). Group B = "answer-key" (optional). Match each answer-key entry to the corresponding question by ID and populate answers / correctAnswers. If Group B is empty or unreadable, leave answer keys blank.

9. Skip non-content paratext: page numbers, page headers/footers, watermarks (faded overlays), distributor branding (Telegram handles, phone numbers, English-center names, school logos, "©" lines, URLs, "for sample only" stamps), advertisements / promotional inserts. Transcribe only content a student would see on their actual answer paper. When in doubt about a small fragment, prefer to skip.

10. Output JSON matching exactly this shape${scope === 'passage' ? ` (a single ${unit} object — NOT wrapped in any array or envelope)` : ''}:

${shape}

No commentary outside the JSON. No markdown fences. No explanation.
${ieltsTypeGuide}${cefrTypeGuide}${ieltsListeningTypeGuide}${cefrListeningTypeGuide}
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
  explanations:   Record<string, ExplanationItem>;
  droppedQuotes:  string[];
  modelUsed:      'gemini-2.5-pro' | 'gpt-4o';
  fallbackReason: string | null;
};

// ── Text-only model calls for the explanations endpoint ──────────────
// Mirrors the Gemini → GPT-4o fallback used in the import path, but
// without file uploads (explanations are pure text-in/text-out).

async function _explanationsViaGemini(prompt: string): Promise<string> {
  if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY not set in secrets');
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
      maxOutputTokens: 16384,
      thinkingConfig: { thinkingBudget: -1 }
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_ONLY_HIGH' },
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
  if (!raw.trim()) throw new Error('gemini returned empty content');
  return raw;
}

async function _explanationsViaGPT4o(prompt: string): Promise<string> {
  if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY not set in secrets');
  const body = {
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You output ONLY a JSON object as specified in the user instructions. No prose, no markdown.' },
      { role: 'user',   content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1
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
  if (!text.trim()) throw new Error('gpt-4o returned empty content');
  return text;
}

async function generateExplanations(
  passage: Record<string, unknown>,
  examType: string
): Promise<ExplanationsResult> {
  const isCefr          = examType === 'cefr-reading';
  const isListening     = examType === 'ielts-listening';
  const isCefrListening = examType === 'cefr-listening';

  // CEFR Reading has four distinct part types and each stores its
  // "passage" + questions differently. An earlier version of this code
  // assumed passage.content for every type — that throws on matching
  // (no passage), silently returns 0 explanations on reading-comprehension
  // (questions live in questionSections, not the top-level questions[]),
  // and only ever worked for gap-fill-text. Build per-type.
  //   • gap-fill-text         → passage.content + questions[].hint
  //   • matching              → texts[] (numbered short blurbs);
  //                             questions[].textNumber → text id;
  //                             correct answer = statement letter A-J
  //   • matching-headings     → passage.paragraphs[] (numbered I, II…);
  //                             questions[].paragraphNumber → paragraph;
  //                             correct answer = heading letter
  //   • reading-comprehension → passage.content + questionSections[]
  //                             holding MCQ (inline options), TFNI
  //                             (section-level options array), or
  //                             gap-fill (uses summaryText)
  let passagePlain = '';
  const qInputs: Array<{ id: number; text: string; correct: string }> = [];

  if (isListening) {
    // IELTS Listening — `transcript` is the source for quotes (the audio
    // text). Questions live INSIDE subParts[] (gap-fill-form, table-
    // completion, mcq-extracts, matching, sentence-completion, …), not
    // in top-level questions[]. We walk every common sub-part shape to
    // gather question text per id, then iterate the flat `answers` dict
    // for the correct answer. Quote verification runs against transcript.
    passagePlain = String(passage.transcript || '');
    const answers = (passage.answers as Record<string, string[] | string> | undefined) || {};
    const subParts = Array.isArray(passage.subParts)
      ? passage.subParts as Array<Record<string, unknown>> : [];
    const textByQid: Record<string, string> = {};

    for (const sp of subParts) {
      if (!sp || typeof sp !== 'object') continue;

      // mcq-extracts → extracts[].questions[].text
      if (Array.isArray(sp.extracts)) {
        for (const ex of sp.extracts as Array<Record<string, unknown>>) {
          if (Array.isArray(ex?.questions)) {
            for (const q of ex.questions as Array<Record<string, unknown>>) {
              if (q?.id != null) textByQid[String(q.id)] = String(q.text || '');
            }
          }
        }
      }
      // mcq-multi, matching, etc. — top-level questions[].text / .id
      if (Array.isArray(sp.questions)) {
        for (const q of sp.questions as Array<Record<string, unknown>>) {
          if (q?.id != null) textByQid[String(q.id)] = String(q.text || q.hint || '');
        }
      }
      // sentence-completion → items[].id / .text
      if (Array.isArray(sp.items)) {
        for (const it of sp.items as Array<Record<string, unknown>>) {
          if (it?.id != null) textByQid[String(it.id)] = String(it.text || '');
        }
      }
      // gap-fill-form → formContent[].item-gap with gapId; build a label.
      if (Array.isArray(sp.formContent)) {
        for (const it of sp.formContent as Array<Record<string, unknown>>) {
          if (it?.type === 'item-gap' && it.gapId != null) {
            const before = String(it.text || '').trim();
            const after  = String(it.gapSuffix || '').trim();
            textByQid[String(it.gapId)] = `${before} {INPUT}${after ? ' ' + after : ''}`.trim();
          }
        }
      }
      // table-completion → rows[][] with gap cells.
      if (Array.isArray(sp.rows)) {
        for (const row of sp.rows as Array<unknown>) {
          if (!Array.isArray(row)) continue;
          for (const cell of row) {
            const c = cell as Record<string, unknown>;
            if (c && typeof c === 'object' && c.type === 'gap' && c.gapId != null) {
              const before = String(c.prefix || '').trim();
              const after  = String(c.suffix || '').trim();
              textByQid[String(c.gapId)] = `${before} {INPUT}${after ? ' ' + after : ''}`.trim();
            }
          }
        }
      }
    }

    for (const qid of Object.keys(answers).sort((a, b) => parseInt(a, 10) - parseInt(b, 10))) {
      const id = parseInt(qid, 10);
      if (isNaN(id)) continue;
      const acc = answers[qid];
      const correctStr = Array.isArray(acc) ? acc.join(' / ') : String(acc || '');
      if (!correctStr) continue;
      qInputs.push({ id, text: textByQid[qid] || '', correct: correctStr });
    }
  } else if (isCefrListening) {
    // CEFR Listening — like IELTS Listening, `transcript` is the source
    // for quotes (the audio text). Question content varies by part type:
    //   • mcq-reply           → questions[].options (no stem; audio plays it)
    //   • gap-fill-form       → formContent[].item-gap (gapId → context)
    //   • matching-speakers   → speakers[] (no question text — label only)
    //                           + options[] (lettered statements)
    //   • map-labeling        → questions[].place
    //   • mcq-extracts        → extracts[].questions[].text + options
    //   • sentence-completion → questions[].hint + passageContent
    passagePlain = String(passage.transcript || '');
    const answers = (passage.answers as Record<string, string[] | string> | undefined) || {};
    const partType = String((passage as Record<string, unknown>).type || '');
    const textByQid: Record<string, string> = {};
    const optionsByQid: Record<string, string> = {};

    const stringifyOpts = (opts: Array<Record<string, unknown>>): string =>
      opts.map((o) => `${o.letter}: ${String(o.text || '').trim()}`).join(' | ');

    if (partType === 'mcq-reply') {
      const qs = Array.isArray(passage.questions)
        ? passage.questions as Array<Record<string, unknown>> : [];
      for (const q of qs) {
        if (q?.id == null) continue;
        const opts = Array.isArray(q.options) ? q.options as Array<Record<string, unknown>> : [];
        textByQid[String(q.id)]    = '(Audio plays a short prompt)';
        optionsByQid[String(q.id)] = stringifyOpts(opts);
      }
    } else if (partType === 'gap-fill-form') {
      const fc = Array.isArray(passage.formContent)
        ? passage.formContent as Array<Record<string, unknown>> : [];
      for (const it of fc) {
        if (it?.type === 'item-gap' && it.gapId != null) {
          const before = String(it.text || '').trim();
          const after  = String(it.gapSuffix || '').trim();
          textByQid[String(it.gapId)] = `${before} {INPUT}${after ? ' ' + after : ''}`.trim();
        }
      }
    } else if (partType === 'matching-speakers') {
      const speakers = Array.isArray(passage.speakers)
        ? passage.speakers as Array<Record<string, unknown>> : [];
      const opts = Array.isArray(passage.options)
        ? passage.options as Array<Record<string, unknown>> : [];
      const optsStr = stringifyOpts(opts);
      for (const s of speakers) {
        if (s?.id == null) continue;
        textByQid[String(s.id)]    = `${String(s.label || 'Speaker')} — pick the matching statement`;
        optionsByQid[String(s.id)] = optsStr;
      }
    } else if (partType === 'map-labeling') {
      const qs = Array.isArray(passage.questions)
        ? passage.questions as Array<Record<string, unknown>> : [];
      const labels = Array.isArray(passage.mapLabels)
        ? (passage.mapLabels as unknown[]).map(String) : [];
      const optsStr = labels.length ? `Pick one letter from: ${labels.join(', ')}` : '';
      for (const q of qs) {
        if (q?.id == null) continue;
        textByQid[String(q.id)]    = `Place on map: ${String(q.place || q.text || '')}`;
        if (optsStr) optionsByQid[String(q.id)] = optsStr;
      }
    } else if (partType === 'mcq-extracts') {
      const exs = Array.isArray(passage.extracts)
        ? passage.extracts as Array<Record<string, unknown>> : [];
      for (const ex of exs) {
        if (!Array.isArray(ex?.questions)) continue;
        for (const q of ex.questions as Array<Record<string, unknown>>) {
          if (q?.id == null) continue;
          const opts = Array.isArray(q.options) ? q.options as Array<Record<string, unknown>> : [];
          textByQid[String(q.id)]    = String(q.text || '');
          optionsByQid[String(q.id)] = stringifyOpts(opts);
        }
      }
    } else if (partType === 'sentence-completion') {
      const qs = Array.isArray(passage.questions)
        ? passage.questions as Array<Record<string, unknown>> : [];
      for (const q of qs) {
        if (q?.id == null) continue;
        textByQid[String(q.id)] = String(q.hint || q.text || '');
      }
    }

    for (const qid of Object.keys(answers).sort((a, b) => parseInt(a, 10) - parseInt(b, 10))) {
      const id = parseInt(qid, 10);
      if (isNaN(id)) continue;
      const acc = answers[qid];
      const correctStr = Array.isArray(acc) ? acc.join(' / ') : String(acc || '');
      if (!correctStr) continue;
      const base = textByQid[qid] || '';
      const opts = optionsByQid[qid];
      const text = opts ? `${base} [Options: ${opts}]` : base;
      qInputs.push({ id, text, correct: correctStr });
    }
  } else if (isCefr) {
    const partType = String((passage as Record<string, unknown>).type || '');
    const answers  = ((passage as Record<string, unknown>).answers as Record<string, string[] | string> | undefined) || {};
    const getCorrect = (id: number) => {
      const acc = answers[String(id)] ?? answers[`q${id}`];
      return Array.isArray(acc) ? acc.join(' / ') : String(acc || '');
    };

    if (partType === 'matching') {
      const texts = Array.isArray((passage as Record<string, unknown>).texts)
        ? (passage as Record<string, unknown>).texts as Array<Record<string, unknown>> : [];
      const statements = Array.isArray((passage as Record<string, unknown>).statements)
        ? (passage as Record<string, unknown>).statements as Array<Record<string, unknown>> : [];
      // For matching parts, the supporting evidence almost always lives
      // in the LETTERED statements[] (long ad/blurb descriptions —
      // SEA PATH, CUTTERS WAY, etc.), NOT in the numbered texts[]
      // (short people-preference statements that already appear in
      // the question stem). Include BOTH sides in passagePlain so
      // server-side quote verification can match a Gemini-quoted
      // sentence from either source. Without statements here, the
      // verifier sees only the numbered texts and rejects ~100% of
      // quotes as paraphrased.
      const statementsBlock = statements.map((s) => {
        const letter = s.letter;
        const content = _stripHtml(String(s.text || ''));
        return `[Statement ${letter}]: ${content}`;
      }).join('\n\n');
      const textsBlock = texts.map((t) => {
        const num = t.number;
        const content = _stripHtml(String(t.content || ''));
        return `[Text ${num}]: ${content}`;
      }).join('\n\n');
      passagePlain = [statementsBlock, textsBlock].filter(Boolean).join('\n\n');

      // Build the per-question prompt list. Prefer the explicit questions[]
      // array, but if it's missing (some legacy mocks like CEFR 03 have an
      // empty questions array even though answers[] and texts[] are
      // populated), fall back to synthesising one entry per text where the
      // question id equals the text number — this matches every well-formed
      // CEFR matching part we've inspected.
      let questions = Array.isArray((passage as Record<string, unknown>).questions)
        ? (passage as Record<string, unknown>).questions as Array<Record<string, unknown>> : [];
      if (questions.length === 0 && texts.length > 0) {
        questions = texts.map((t) => ({ id: t.number, textNumber: t.number }));
      }
      for (const q of questions) {
        const id = parseInt(String(q.id || ''), 10);
        if (isNaN(id)) continue;
        const correctStr = getCorrect(id);
        if (!correctStr) continue;
        const textNumber = q.textNumber;
        const matchedText = texts.find((t) => t.number === textNumber);
        const textContent = matchedText ? _stripHtml(String(matchedText.content || '')) : '';
        const preview = textContent.length > 250 ? textContent.slice(0, 250) + '…' : textContent;
        qInputs.push({
          id,
          text: `Text ${textNumber}: ${preview}`,
          correct: correctStr
        });
      }
    } else if (partType === 'matching-headings') {
      const passageObj = ((passage as Record<string, unknown>).passage as Record<string, unknown>) || {};
      let paragraphs = Array.isArray(passageObj.paragraphs)
        ? passageObj.paragraphs as Array<Record<string, unknown>> : [];
      // Fallback for Gemini-per-part-imported mocks where the passage
      // ships as a single passage.content HTML string instead of a
      // structured paragraphs[] array. Parse the <p>…</p> blocks and
      // their leading paragraph labels (A, B / I, II / etc.) into the
      // legacy shape so the rest of this function works unchanged.
      if (paragraphs.length === 0 && typeof passageObj.content === 'string' && passageObj.content) {
        const html = String(passageObj.content);
        const qList = Array.isArray((passage as Record<string, unknown>).questions)
          ? (passage as Record<string, unknown>).questions as Array<Record<string, unknown>> : [];
        const qMap: Record<string, unknown> = {};
        for (const q of qList) {
          const pn = q.paragraphNumber;
          if (pn != null) qMap[String(pn).toUpperCase()] = q.id;
        }
        const parsed: Array<Record<string, unknown>> = [];
        const re = /<p[^>]*>([\s\S]*?)<\/p>/gi;
        let m: RegExpExecArray | null;
        while ((m = re.exec(html)) !== null) {
          const inner = m[1].trim();
          const lm = inner.match(/^<strong>\s*([A-Z]+|[ivxlcdm]+)\s*<\/strong>\s*\.?\s*([\s\S]*)$/i)
                  || inner.match(/^([A-Z]+|[ivxlcdm]+)\s*\.\s+([\s\S]*)$/)
                  || inner.match(/^([A-Z]+|[ivxlcdm]+)\s+([\s\S]+)$/);
          if (lm) {
            const label = lm[1].toUpperCase();
            parsed.push({ number: label, content: lm[2].trim(), questionId: qMap[label] });
          }
        }
        // Positional fallback when Gemini's questions[] lacks paragraphNumber.
        // See runner-side _cefrParseHeadingsHtml for rationale.
        if (parsed.some((p) => p.questionId == null)) {
          const sortedIds = qList
            .map((q) => q.id)
            .filter((id): id is number => typeof id === 'number')
            .sort((a, b) => a - b);
          parsed.forEach((p, i) => {
            if (p.questionId == null && sortedIds[i] != null) {
              p.questionId = sortedIds[i];
            }
          });
        }
        if (parsed.length > 0) paragraphs = parsed;
      }
      passagePlain = paragraphs.map((p) => {
        const num = p.number || '';
        const content = _stripHtml(String(p.content || ''));
        return `[Paragraph ${num}]: ${content}`;
      }).join('\n\n');

      // Same fallback story as matching — if questions[] is empty, derive
      // one entry per paragraph from its embedded questionId field (well-
      // formed paragraphs carry it).
      let questions = Array.isArray((passage as Record<string, unknown>).questions)
        ? (passage as Record<string, unknown>).questions as Array<Record<string, unknown>> : [];
      if (questions.length === 0 && paragraphs.length > 0) {
        questions = paragraphs.map((p) => ({
          id: p.questionId,
          paragraphNumber: p.number
        }));
      }
      for (const q of questions) {
        const id = parseInt(String(q.id || ''), 10);
        if (isNaN(id)) continue;
        const correctStr = getCorrect(id);
        if (!correctStr) continue;
        const paragraphNumber = q.paragraphNumber;
        const matchedPara = paragraphs.find((p) => p.number === paragraphNumber);
        const paraContent = matchedPara ? _stripHtml(String(matchedPara.content || '')) : '';
        const preview = paraContent.length > 350 ? paraContent.slice(0, 350) + '…' : paraContent;
        qInputs.push({
          id,
          text: `Paragraph ${paragraphNumber}: ${preview}`,
          correct: correctStr
        });
      }
    } else if (partType === 'reading-comprehension') {
      const passageObj = ((passage as Record<string, unknown>).passage as Record<string, unknown>) || {};
      passagePlain = _stripHtml(String(passageObj.content || ''));
      const sections = Array.isArray((passage as Record<string, unknown>).questionSections)
        ? (passage as Record<string, unknown>).questionSections as Array<Record<string, unknown>> : [];
      for (const sec of sections) {
        const secType = String(sec.type || '');
        const secOptions = Array.isArray(sec.options) ? sec.options as Array<unknown> : null;
        const summaryText = _stripHtml(String(sec.summaryText || ''));
        const questions = Array.isArray(sec.questions) ? sec.questions as Array<Record<string, unknown>> : [];
        for (const q of questions) {
          const id = parseInt(String(q.id || ''), 10);
          if (isNaN(id)) continue;
          const correctStr = getCorrect(id);
          if (!correctStr) continue;
          let qText: string;
          if (secType === 'mcq') {
            // Include the lettered options inline so the model can name the right one.
            const opts = Array.isArray(q.options) ? q.options as Array<Record<string, unknown>> : [];
            const optStr = opts.map((o) => `${o.letter}: ${o.text}`).join(' | ');
            qText = String(q.text || '') + (optStr ? ' [Options: ' + optStr + ']' : '');
          } else if (secType === 'tfni') {
            qText = String(q.text || '') + (secOptions ? ' [Pick one: ' + secOptions.join(' / ') + ']' : '');
          } else if (secType === 'gap-fill') {
            qText = `Gap fill — hint: "${String(q.hint || '')}" — summary context: ${summaryText.slice(0, 250)}`;
          } else {
            qText = String(q.text || q.hint || '');
          }
          qInputs.push({ id, text: qText, correct: correctStr });
        }
      }
    } else {
      // gap-fill-text or unknown — passage.content + flat questions[].hint
      const passageObj = ((passage as Record<string, unknown>).passage as Record<string, unknown>) || {};
      passagePlain = _stripHtml(String(passageObj.content || passage.passage || ''));
      const questions = Array.isArray((passage as Record<string, unknown>).questions)
        ? (passage as Record<string, unknown>).questions as Array<Record<string, unknown>> : [];
      for (const q of questions) {
        const id = parseInt(String(q.id || ''), 10);
        if (isNaN(id)) continue;
        const correctStr = getCorrect(id);
        if (!correctStr) continue;
        qInputs.push({ id, text: String(q.hint || q.text || ''), correct: correctStr });
      }
    }
  } else {
    // IELTS — passage is a string, questions live in questionSections[].
    passagePlain = _stripHtml(String(passage.passage || ''));
    const sections        = Array.isArray(passage.questionSections) ? passage.questionSections : [];
    const correctAnswers  = (passage.correctAnswers as Record<string, string[] | string> | undefined) || {};
    for (const sec of sections) {
      const qs = (sec as Record<string, unknown>).questions;
      if (!Array.isArray(qs)) continue;
      for (const q of qs) {
        const qo = q as Record<string, unknown>;
        const id = parseInt(String(qo.id || ''), 10);
        if (isNaN(id)) continue;
        const acc = correctAnswers[`q${id}`];
        const correctStr = Array.isArray(acc) ? acc.join(' / ') : String(acc || '');
        if (!correctStr) continue;
        qInputs.push({ id, text: String(qo.text || ''), correct: correctStr });
      }
    }
  }

  if (!passagePlain) throw new Error('passage body is empty');
  if (qInputs.length === 0) {
    return { explanations: {}, droppedQuotes: [] };
  }

  // CEFR matching / multiple-choice parts carry their answer options in
  // sibling fields (statements / headings / options). Include them inline
  // so the model can write a meaningful explanation for letter-coded
  // answers like "B" or "C".
  let extras = '';
  if (isCefr) {
    const partType = String(passage.type || '');
    const statements = Array.isArray(passage.statements) ? passage.statements : null;
    const headings   = Array.isArray(passage.headings)   ? passage.headings   : null;
    if (statements && statements.length) {
      extras += '\n\nSTATEMENTS / OPTIONS (matched by letter):\n' +
        statements.map((s) => {
          const so = s as Record<string, unknown>;
          return `${so.letter ?? ''}: ${so.text ?? ''}`;
        }).join('\n');
    }
    if (headings && headings.length) {
      extras += '\n\nHEADINGS (matched by number/letter):\n' +
        headings.map((h) => {
          const ho = h as Record<string, unknown>;
          return `${ho.id ?? ho.letter ?? ho.number ?? ''}: ${ho.text ?? ''}`;
        }).join('\n');
    }
    if (partType) extras = `\n\nPART TYPE: ${partType}` + extras;
  }

  const examLabel = isCefr ? 'CEFR' : 'IELTS';
  const callOutHint = isCefr
    ? `   • Gap-fill / word-formation: "…that's why the correct answer is 'celebrated'."
   • Matching / multiple-choice: "…that's why the correct answer is B."`
    : `   • Multiple-choice / matching / completion: "…that's why the correct answer is D." (or "…the correct answer is 'grain'." for word-bank items)
   • TFNG / YNNG: "…that's why the answer is FALSE." (or TRUE / NOT GIVEN / YES / NO)`;

  const prompt = `You are a ${examLabel} reading explanation generator. The student has already been given the correct answers; your job is to JUSTIFY each one with a short explanation and the verbatim source sentence.

PASSAGE (plain text):
${passagePlain}${extras}

QUESTIONS (id · ${isCefr ? 'hint' : 'text'} · correct answer):
${qInputs.map(q => `Q${q.id} · ${q.text} · ${q.correct}`).join('\n')}

For each question, output ONE entry in this JSON shape:
{ "q<id>": { "text": "<1-2 sentence reason>", "quote": "<verbatim sentence from the passage that proves it>" } }

Rules:
1. "text" — one or two sentences IN PLAIN ENGLISH, max ~45 words. Explain WHY the given correct answer is correct${isCefr ? '' : ' (or, for TFNG / YNNG, why it is YES / NO / NOT GIVEN)'}. Always end with an explicit answer call-out so the student knows which option you settled on, in one of these formats:
${callOutHint}
   Do NOT just restate the answer with no reasoning — the call-out comes after the WHY.
2. "quote" — a sentence (or short phrase, max ~200 chars) copied EXACTLY from the English passage above, preserving original spelling and punctuation. NO paraphrasing. NO ellipsis. NO smart-quote substitution. If you cannot find a verbatim sentence that supports the answer, return "quote": "" (empty string) rather than invent one.
3. NEVER guess.${isCefr ? '' : ' If the answer is "NOT GIVEN", quote MUST be empty (there is no sentence to point to) and the text should explain that the passage neither confirms nor denies the statement.'}
4. Output ONLY the JSON object, no commentary, no markdown fences. Every input question id must appear as a top-level key in the output.`;

  // Try Gemini → GPT-4o fallback. Mirrors the import-path fallback so
  // a project-quota suspension on the Gemini side (PERMISSION_DENIED,
  // 429, etc.) doesn't block authoring — admins keep generating
  // explanations via GPT-4o until the Gemini flag is lifted.
  let raw = '';
  let modelUsed: 'gemini-2.5-pro' | 'gpt-4o' = 'gemini-2.5-pro';
  let fallbackReason: string | null = null;
  try {
    raw = await _explanationsViaGemini(prompt);
  } catch (geminiErr) {
    fallbackReason = geminiErr instanceof Error ? geminiErr.message : String(geminiErr);
    console.warn('[explanations] gemini failed, falling back to gpt-4o:', fallbackReason);
    try {
      raw = await _explanationsViaGPT4o(prompt);
      modelUsed = 'gpt-4o';
    } catch (gptErr) {
      const gptMsg = gptErr instanceof Error ? gptErr.message : String(gptErr);
      throw new Error(`both models failed. gemini: ${fallbackReason}; gpt-4o: ${gptMsg}`);
    }
  }
  const parsed = tryParseModelJson(raw);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`${modelUsed} returned non-JSON: ` + raw.slice(0, 200));
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
  return { explanations: out, droppedQuotes: dropped, modelUsed, fallbackReason };
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
  if (examType !== 'cefr-reading' && examType !== 'ielts-reading' && examType !== 'ielts-listening' && examType !== 'cefr-listening') {
    return json(400, { error: 'bad_exam_type', detail: 'expected "cefr-reading", "ielts-reading", "ielts-listening", or "cefr-listening"' });
  }

  // IELTS Listening import is now fully wired (see buildPrompt's
  // ieltsListeningTypeGuide rule 11). Single shared code path with reading.

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
        explanations:    result.explanations,
        dropped_quotes:  result.droppedQuotes,
        model_used:      result.modelUsed,
        fallback_reason: result.fallbackReason || undefined,
        actor:           (auth as AuthOk).actor
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

  // ── IELTS Listening bulk special-case: 4 PARALLEL per-section runs ──
  // The old single-shot bulk prompt asked Gemini to emit all 4 sections +
  // answers in one go. In practice the model frequently dropped the
  // top-level `part.answers` dict for one or more sections (Mock 52
  // shipped with answers_count=0 across all 4 parts, so the picker
  // greyed it out as "0/4 Ready"). The reliability gap is prompt
  // breadth — narrowing to one section at a time with the per-section
  // shape consistently populates answers.
  //
  // Calls fire in PARALLEL (Promise.all) so total wall time ≈ max
  // single-call duration (~60s) rather than 4× that. Sequential blew
  // past Supabase's 150 s Edge Function timeout (504 at 153 s).
  if (examType === 'ielts-listening' && scope === 'full') {
    let modelUsed: 'gemini-2.5-pro' | 'gpt-4o' = 'gemini-2.5-pro';
    let fallbackReason: string | null = null;

    async function importOneSection(i: number): Promise<any> {
      const idx1 = i + 1;
      const basePrompt = buildPrompt(examType, notes, IELTS_LISTENING_SINGLE_PART_SHAPE, 'passage', idx1);
      const sectionPrompt = basePrompt.replace(
        /The user has uploaded image\(s\) and \/ or PDF\(s\) for \*\*just ONE section\*\* of an IELTS Listening mock — specifically Section \d+\. Treat the uploaded files as that single section only\. The accompanying answer-key files \(if any\) cover ONLY this section's questions\./,
        `The user has uploaded image(s) and / or PDF(s) covering ALL FOUR sections of an IELTS Listening mock. For THIS call, extract ONLY **Section ${idx1}** (questions ${i*10+1}–${(i+1)*10}). Ignore the other three sections entirely — do not include their questions, subParts, or answers. The answer-key files contain ALL 40 answers; from them, populate the "answers" dict with ONLY the ${i*10+1}–${(i+1)*10} entries that correspond to Section ${idx1}.`
      );
      let sectionRaw = '';
      let sectionFallback: string | null = null;
      try {
        sectionRaw = await callGemini(sectionPrompt, files);
      } catch (e) {
        sectionFallback = (e instanceof Error ? e.message : String(e));
        console.warn(`[transcribe-mock] section ${idx1} gemini failed:`, sectionFallback);
      }
      let parsed: any = sectionRaw ? tryParseModelJson(sectionRaw) : null;
      if (parsed === null) {
        const allImages = files.every((f) => f.mime.startsWith('image/'));
        if (allImages) {
          try {
            const gptRaw = await callGPT4o(sectionPrompt, files);
            parsed = tryParseModelJson(gptRaw);
            if (parsed) modelUsed = 'gpt-4o';
          } catch (gptErr) {
            const gptMsg = gptErr instanceof Error ? gptErr.message : String(gptErr);
            throw new Error(`section ${idx1}: ${gptMsg}`);
          }
        }
      }
      if (!parsed || typeof parsed !== 'object') {
        throw new Error(`section ${idx1}: ${sectionFallback || 'no usable JSON'}`);
      }
      (parsed as Record<string, unknown>).partNumber = idx1;
      if (sectionFallback && !fallbackReason) fallbackReason = sectionFallback;
      return parsed;
    }

    let sections: any[];
    try {
      sections = await Promise.all([0, 1, 2, 3].map(importOneSection));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return json(502, { error: 'section_failed', detail: msg, fallback_reason: fallbackReason });
    }

    // Assemble the full mock envelope. testInfo + source are inferred
    // from whichever section had them populated (Gemini sometimes copies
    // these into every section, sometimes none).
    let testInfo: any = null;
    let source: string | undefined;
    for (const s of sections) {
      const ti = (s && (s as Record<string, unknown>).testInfo) as any;
      if (ti && typeof ti === 'object' && !testInfo) testInfo = ti;
      const src = (s && (s as Record<string, unknown>).source) as any;
      if (typeof src === 'string' && src.trim() && !source) source = src.trim();
      // Strip per-section envelope leftovers so each part stays clean.
      delete (s as Record<string, unknown>).testInfo;
      delete (s as Record<string, unknown>).source;
    }
    const assembled: Record<string, unknown> = {
      testInfo: testInfo || { title: 'IELTS Listening Practice Test', totalTime: 40, totalQuestions: 40 },
      parts: sections,
    };
    if (source) assembled.source = source;

    return json(200, {
      mock_data:        assembled,
      model_used:       modelUsed,
      fallback_reason:  fallbackReason || undefined,
      actor:            (auth as AuthOk).actor,
    });
  }
  // ── End IELTS Listening bulk special-case ──

  // ── CEFR Listening bulk special-case: 6 PARALLEL per-part runs ──
  // Same reliability play as IELTS Listening (line 1227): asking Gemini
  // to emit all 6 parts in a single shot routinely dropped the per-part
  // "answers" dict for some parts. Narrowing each call to ONE part (with
  // the single-part shape) keeps answers consistently populated.
  // Parallelism keeps wall time ≈ max single-call duration; sequential
  // would risk the 150 s Edge timeout.
  if (examType === 'cefr-listening' && scope === 'full') {
    let modelUsed: 'gemini-2.5-pro' | 'gpt-4o' = 'gemini-2.5-pro';
    let fallbackReason: string | null = null;

    async function importOnePart(i: number): Promise<any> {
      const idx1 = i + 1;
      const basePrompt = buildPrompt(examType, notes, CEFR_LISTENING_SINGLE_PART_SHAPE, 'passage', idx1);
      // Note: we deliberately do NOT pre-compute a "questions X-Y" range
      // here. Hand-made mocks routinely have Part N with a non-standard
      // count (e.g. Part 1 with 7 questions instead of 8). The model
      // identifies the Part boundary from the source's own headings and
      // emits whatever question span it sees there.
      const partPrompt = basePrompt.replace(
        /The user has uploaded image\(s\) and \/ or PDF\(s\) for \*\*just ONE part\*\* of an CEFR Listening mock — specifically Part \d+\. Treat the uploaded files as that single part only\. The accompanying answer-key files \(if any\) cover ONLY this part's questions\./,
        `The user has uploaded image(s) and / or PDF(s) covering ALL SIX parts of a CEFR Listening mock. For THIS call, extract ONLY **Part ${idx1}**. Identify the Part ${idx1} boundary from the source's own headings / numbering (look for "Part ${idx1}" / "PART ${idx1}" / "Part ${['One','Two','Three','Four','Five','Six'][i]}" or the matching question-range heading). Emit whatever question count the source actually shows for Part ${idx1} — do NOT pad or truncate to the official 8/6/5/5/6/6 count. Ignore the other five parts entirely. The answer-key files contain answers for ALL parts; populate the "answers" dict with ONLY the entries that fall within Part ${idx1}'s question id range as you identified it from the source.`
      );
      let partRaw = '';
      let partFallback: string | null = null;
      try {
        partRaw = await callGemini(partPrompt, files);
      } catch (e) {
        partFallback = (e instanceof Error ? e.message : String(e));
        console.warn(`[transcribe-mock] cefr-listening part ${idx1} gemini failed:`, partFallback);
      }
      let parsed: any = partRaw ? tryParseModelJson(partRaw) : null;
      if (parsed === null) {
        const allImages = files.every((f) => f.mime.startsWith('image/'));
        if (allImages) {
          try {
            const gptRaw = await callGPT4o(partPrompt, files);
            parsed = tryParseModelJson(gptRaw);
            if (parsed) modelUsed = 'gpt-4o';
          } catch (gptErr) {
            const gptMsg = gptErr instanceof Error ? gptErr.message : String(gptErr);
            throw new Error(`part ${idx1}: ${gptMsg}`);
          }
        }
      }
      if (!parsed || typeof parsed !== 'object') {
        throw new Error(`part ${idx1}: ${partFallback || 'no usable JSON'}`);
      }
      (parsed as Record<string, unknown>).partNumber = idx1;
      if (partFallback && !fallbackReason) fallbackReason = partFallback;
      return parsed;
    }

    let parts: any[];
    try {
      parts = await Promise.all([0, 1, 2, 3, 4, 5].map(importOnePart));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return json(502, { error: 'part_failed', detail: msg, fallback_reason: fallbackReason });
    }

    // Assemble the full mock envelope. testInfo + source come from
    // whichever part(s) had them populated.
    let testInfo: any = null;
    let source: string | undefined;
    for (const p of parts) {
      const ti = (p && (p as Record<string, unknown>).testInfo) as any;
      if (ti && typeof ti === 'object' && !testInfo) testInfo = ti;
      const src = (p && (p as Record<string, unknown>).source) as any;
      if (typeof src === 'string' && src.trim() && !source) source = src.trim();
      delete (p as Record<string, unknown>).testInfo;
      delete (p as Record<string, unknown>).source;
    }
    // Compute totalQuestions from the actual extracted parts so hand-made
    // mocks with non-official counts report the right number.
    function _clCountPartQuestions(p: any): number {
      if (!p || typeof p !== 'object') return 0;
      if (Array.isArray(p.answers)) return p.answers.length;
      if (p.answers && typeof p.answers === 'object') return Object.keys(p.answers).length;
      if (Array.isArray(p.questions)) return p.questions.length;
      if (Array.isArray(p.speakers))  return p.speakers.length;
      if (Array.isArray(p.extracts)) {
        let c = 0;
        for (const ex of p.extracts) {
          if (ex && Array.isArray(ex.questions)) c += ex.questions.length;
        }
        return c;
      }
      return 0;
    }
    const sumQs = parts.reduce((acc: number, p: any) => acc + _clCountPartQuestions(p), 0);
    const assembled: Record<string, unknown> = {
      testInfo: testInfo || {
        title: 'CEFR Listening Practice Test',
        totalTime: 40,
        totalQuestions: sumQs || 36,
        parts: 6,
        level: 'B1-B2-C1'
      },
      parts,
    };
    // If Gemini DID provide testInfo but with a wrong totalQuestions, fix it.
    if (testInfo && typeof (assembled.testInfo as any).totalQuestions !== 'number' && sumQs > 0) {
      (assembled.testInfo as any).totalQuestions = sumQs;
    }
    if (source) assembled.source = source;

    return json(200, {
      mock_data:        assembled,
      model_used:       modelUsed,
      fallback_reason:  fallbackReason || undefined,
      actor:            (auth as AuthOk).actor,
    });
  }
  // ── End CEFR Listening bulk special-case ──

  const shape = scope === 'passage'
    ? (examType === 'cefr-reading'    ? CEFR_SINGLE_PART_SHAPE
    :  examType === 'ielts-listening' ? IELTS_LISTENING_SINGLE_PART_SHAPE
    :  examType === 'cefr-listening'  ? CEFR_LISTENING_SINGLE_PART_SHAPE
    :  IELTS_SINGLE_PASSAGE_SHAPE)
    : (examType === 'cefr-reading'    ? CEFR_SHAPE
    :  examType === 'ielts-listening' ? IELTS_LISTENING_SHAPE
    :  examType === 'cefr-listening'  ? CEFR_LISTENING_SHAPE
    :  IELTS_SHAPE);
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
          : examType === 'ielts-listening'
            ? Array.isArray((mockData as Record<string, unknown>).subParts)
          : examType === 'cefr-listening'
            ? (() => {
                // CEFR Listening per-part shape varies by part type. Each
                // single-part object MUST carry a "type" field that names
                // exactly one of the six allowed types; the structural
                // payload is type-specific.
                const md   = mockData as Record<string, unknown>;
                const type = String(md.type || '');
                if (type === 'mcq-reply')           return Array.isArray(md.questions);
                if (type === 'gap-fill-form')      return Array.isArray(md.formContent);
                if (type === 'matching-speakers')  return Array.isArray(md.speakers) && Array.isArray(md.options);
                if (type === 'map-labeling')       return Array.isArray(md.questions) && Array.isArray(md.mapLabels);
                if (type === 'mcq-extracts')       return Array.isArray(md.extracts);
                if (type === 'sentence-completion') return typeof md.passageContent === 'string';
                return false;
              })()
          : (() => {
              // CEFR per-part shape varies by question type:
              //   • matching                   → texts[] + statements[] (NO passage)
              //   • gap-fill-text              → passage.content + gap markers
              //   • matching-headings          → passage.paragraphs[] + headings[]
              //   • reading-comprehension      → passage.content + questionSections[]
              const md   = mockData as Record<string, unknown>;
              const type = String(md.type || '');
              if (type === 'matching') {
                return Array.isArray(md.texts) && Array.isArray(md.statements);
              }
              const pp = md.passage;
              return pp && typeof pp === 'object' && !Array.isArray(pp);
            })()
      );
    if (!ok) {
      return json(502, {
        error:           'shape_mismatch',
        detail:          'expected a single ' + (examType === 'ielts-reading' ? 'passage' : (examType === 'ielts-listening' || examType === 'cefr-listening') ? 'part' : 'part') + ' object',
        model_used:      modelUsed,
        fallback_reason: fallbackReason
      });
    }
  } else {
    // IELTS Listening + CEFR Listening + CEFR Reading all use `parts[]`.
    // Only IELTS Reading uses `passages[]`.
    const rootKey = (examType === 'cefr-reading' || examType === 'ielts-listening' || examType === 'cefr-listening') ? 'parts' : 'passages';
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
