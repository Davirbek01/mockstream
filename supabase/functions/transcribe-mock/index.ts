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

// ── IELTS Writing single-task shape ───────────────────────────────────
// Per-task import only — admins prefer uploading one task's screenshot
// at a time. Returns a flat object that the client slots into
// mock_data.tasks.task1 or mock_data.tasks.task2 based on passage_index.
// chartImageUrl is intentionally always empty — admin uploads chart
// images via the editor (same as Part 4 map images for CEFR Listening).
const IELTS_WRITING_SINGLE_TASK_SHAPE = `{
  "title": string,                                  // SHORT TOPIC TITLE (3-6 words), e.g. "Online shopping growth" (Task 1) / "Working from home" (Task 2). Used as the picker row label. Do NOT output "Task 1" / "Task 2".
  "prompt": string,                                 // Verbatim task instruction text from the source (e.g. "The graph below shows the percentage of households…"). Plain text — no HTML.
  "instruction": string,                            // The sub-instruction shown below the prompt — usually the standard IELTS rubric ("Summarise the information…" for Task 1, "Give reasons for your answer…" for Task 2). Copy verbatim if visible in the source; otherwise emit the matching default below.
  "wordGoal": number,                               // Task 1 = 150, Task 2 = 250. Override only if the source explicitly states a different word count.
  "timeMinutes": number,                            // Task 1 = 20, Task 2 = 40. Override only if the source explicitly states a different time.

  // Task 1 ONLY (passage_index = 1) — emit these:
  "chartImageUrl": "",                              // ALWAYS empty — admin uploads the chart image separately via the editor's 📁 Upload button.
  "chartType": string,                              // EXACTLY one of: "line_graph" | "bar_chart" | "pie_chart" | "table" | "map" | "process_diagram". Pick the visualisation that best matches the chart in the source.
  "dataNature": string,                             // EXACTLY one of: "over-time" | "static" | "not-applicable". Use "over-time" when the chart's x-axis is years/months/decades/days (line graph, multi-year bar chart). Use "static" for single-time snapshots (single-year pie, comparison table, snapshot bar). Use "not-applicable" for maps and process diagrams.

  // Task 2 ONLY (passage_index = 2) — emit these instead:
  "essayType": string                               // EXACTLY one of: "opinion" | "balanced" | "problem-solution" | "advantage-disadvantage" | "two-part". Pattern-match on the prompt's question form: "To what extent do you agree or disagree" → opinion; "Discuss both views" → balanced; "What are the problems / what can be done" → problem-solution; "Do the advantages outweigh the disadvantages" → advantage-disadvantage; two distinct questions → two-part.
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
  const isIeltsWriting   = examType === 'ielts-writing';
  const unit = isIelts ? 'passage' : isIeltsWriting ? 'task' : (isIeltsListening || isCefrListening) ? 'part' : 'part';
  const Unit = isIelts ? 'Passage' : isIeltsWriting ? 'Task' : (isIeltsListening || isCefrListening) ? 'Part' : 'Part';

  // Gap-marker rule. CEFR Reading uses <span class="gap"> tags. IELTS
  // Reading uses "{INPUT}" placeholders. IELTS Listening uses both
  // (subPart gapIds + {INPUT} for sentence-completion items). CEFR
  // Listening uses two patterns: gapId-on-form-row for Part 2 (gap-fill-
  // form), and <span class="gap-input"> markers for Part 6 (sentence-
  // completion's passageContent).
  // IELTS Writing has no gap markers — it's open-response writing tasks.
  // Short-circuit the gap rule so it doesn't appear in the writing prompt.
  const gapRule = isIeltsWriting
    ? `4. **No fill-in-the-blank markers** — IELTS Writing tasks are open-response. Just transcribe the task prompt verbatim.`
    : (isIelts || isIeltsListening)
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

  // IELTS Writing per-task type guide. The source for each call is ONE
  // screenshot of a single task — Task 1 (chart description) or Task 2
  // (essay prompt). passage_index tells us which task we're extracting.
  // Output is the single-task object documented in the shape.
  const ieltsWritingTypeGuide = isIeltsWriting ? `
11. **IELTS Writing per-task extraction.** This call is for **Task ${passageIndex || '?'} only**. Treat the uploaded screenshot(s) as that single task's pages. Emit the flat single-task object documented in the shape, with the fields appropriate to whichever task this is:

  • **Task 1 (passage_index = 1, chart description, 150 words / 20 min):**
    - "title": Short topic phrase (3-6 words) derived from the chart caption or subject. e.g. "Online shopping growth", "Coffee consumption trends", "Population by age". Do NOT output "Task 1" — that's redundant.
    - "prompt": Verbatim task instruction text — e.g. *"The graph below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011."*
    - "instruction": If the source shows a sub-instruction, copy it verbatim. Otherwise emit the standard rubric: *"Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words."*
    - "chartType": Pick the BEST match from the closed list \`line_graph | bar_chart | pie_chart | table | map | process_diagram\` based on what the source's image shows. Examples: a graph with year axis = line_graph; a row of bars over years = bar_chart; multiple circular sector charts = pie_chart; a numeric grid = table; a labelled top-down view of a place = map; a flowchart with arrows showing stages = process_diagram.
    - "dataNature": Pick from \`over-time | static | not-applicable\`. "over-time" when the x-axis shows years/months/decades/days or two snapshots being compared across time. "static" for a single-point-in-time view (e.g. *"in 2020"*, a single-year pie, an item-comparison table). "not-applicable" for maps and process diagrams — they have no time dimension.
    - "wordGoal": 150. "timeMinutes": 20.
    - "chartImageUrl": ALWAYS "" — admin uploads the chart separately.
    - Do NOT emit "essayType".

  • **Task 2 (passage_index = 2, essay, 250 words / 40 min):**
    - "title": Short topic phrase (3-6 words) from the essay subject. e.g. "Working from home", "Renewable energy", "University education". Do NOT output "Task 2".
    - "prompt": Verbatim essay prompt including any introductory framing and the final question(s).
    - "instruction": If the source shows a sub-instruction, copy verbatim. Otherwise emit the standard rubric: *"Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words."*
    - "essayType": Pattern-match the prompt's question form:
      - \`opinion\` — "To what extent do you agree or disagree?", "Do you think…", "Is this a positive or negative development?"
      - \`balanced\` — "Discuss both views and give your opinion." (paired views are presented and the writer takes a side after weighing both)
      - \`problem-solution\` — "What are the problems caused by X? What can be done to solve them?" (or "causes / effects" variants pointing toward fixes)
      - \`advantage-disadvantage\` — "Do the advantages outweigh the disadvantages?", "Discuss the advantages and disadvantages."
      - \`two-part\` — Two distinct numbered or sentence-form questions in the prompt (e.g. "Why has this happened? What can be done about it?" where the two questions are different topics, not a problem→solution chain).
      Pick exactly ONE — if the prompt is ambiguous between two patterns, pick the closer match and trust the admin to override.
    - "wordGoal": 250. "timeMinutes": 40.
    - Do NOT emit "chartType", "dataNature", or "chartImageUrl".

12. **What NOT to emit:** "chartImageUrl" beyond the empty string (admin uploads separately), "sampleAnswer" / "sampleBand5-9" / "uzSampleBand5-9" (admin curates samples in a separate editor tab — never auto-generate them here).

13. **Answer key behaviour:** IELTS Writing tasks have no machine-checkable answer key. If admin uploaded an "answer key" file with a model essay, IGNORE IT for this extraction — model answers are handled in the Samples editor tab separately. Stick to extracting the task prompt structure.
` : '';

  // Scope-specific framing. In "passage" mode the user is uploading just
  // ONE passage (typically because each passage comes from a different
  // source), so we tell the model to expect that and emit a single
  // passage object instead of a full mock envelope.
  const examLabel = isIeltsListening ? 'IELTS Listening'
                  : isCefrListening  ? 'CEFR Listening'
                  : isIeltsWriting   ? 'IELTS Writing'
                  : isIelts          ? 'IELTS Reading'
                  : 'CEFR Reading';
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

7. Detect each part / section's question type from its instruction text. ${isIelts ? 'See rule 11 below for IELTS Reading patterns.' : isIeltsListening ? 'See rule 11 below for the 12 IELTS Listening sub-part shapes — one section can contain multiple sub-parts.' : isCefrListening ? 'See rule 11 below for the CEFR Listening per-part table — exactly 6 parts in a fixed order, each with a fixed type.' : isIeltsWriting ? 'See rule 11 below for the IELTS Writing per-task extraction rules — Task 1 (chart description) vs Task 2 (essay) have different field sets.' : 'See rule 11 below for the CEFR per-part table (a standard test has exactly 5 parts in a fixed order — gap-fill-text, matching, matching-headings, reading-comprehension, reading-comprehension).'}

8. Files come in two groups (each file's "group" field is provided in the file's preceding text marker). Group A = "test" (treat as consecutive pages of one document). Group B = "answer-key" (optional). Match each answer-key entry to the corresponding question by ID and populate answers / correctAnswers. If Group B is empty or unreadable, leave answer keys blank.

9. Skip non-content paratext: page numbers, page headers/footers, watermarks (faded overlays), distributor branding (Telegram handles, phone numbers, English-center names, school logos, "©" lines, URLs, "for sample only" stamps), advertisements / promotional inserts. Transcribe only content a student would see on their actual answer paper. When in doubt about a small fragment, prefer to skip.

10. Output JSON matching exactly this shape${scope === 'passage' ? ` (a single ${unit} object — NOT wrapped in any array or envelope)` : ''}:

${shape}

No commentary outside the JSON. No markdown fences. No explanation.
${ieltsTypeGuide}${cefrTypeGuide}${ieltsListeningTypeGuide}${cefrListeningTypeGuide}${ieltsWritingTypeGuide}
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

// ── IELTS Writing source lookup (scope=find-source) ───────────────
// Uses Gemini 2.5 Pro with Google Search grounding to attribute a
// prompt pair to a Cambridge IELTS book / Actual Tests volume /
// reported real-exam date. JSON output is parsed from text (the
// responseMimeType=application/json fails when tools are enabled,
// so we strip ```json fences and parse manually). Returns null +
// low confidence when nothing reliable is found — never guess.
type FindSourceResult = {
  source:     string | null;
  examDate:   string | null;   // YYYY-MM-DD or null
  confidence: 'high' | 'medium' | 'low';
  notes:      string;
};

async function findIeltsWritingSource(opts: {
  task1Prompt: string;
  task2Prompt: string;
  geminiKey:   string;
}): Promise<FindSourceResult> {
  if (!opts.geminiKey) throw new Error('GEMINI_API_KEY not set in secrets');
  const t1 = opts.task1Prompt.trim();
  const t2 = opts.task2Prompt.trim();

  const prompt =
`You are looking up the original source of an IELTS Academic Writing test.

Task 1 prompt:
"${t1 || '(empty)'}"

Task 2 prompt:
"${t2 || '(empty)'}"

Use Google Search to find:
1. The most likely source / book where these prompts appear together as one test (e.g. "Cambridge IELTS 18 Test 3", "IELTS Recent Actual Test Vol 7", "Actual exam YYYY-MM-DD" if reported as a real exam paper).
2. If the two prompts don't appear together in any indexed source, search each one SEPARATELY and use the better-attributed single task's source (note in "notes" which task it came from).
3. The date the test was used in a real IELTS exam if any source attributes it as an actual exam day.

Output ONLY a JSON object — no commentary, no markdown fences:
{
  "source":     "<best attribution string, or null if NEITHER task has any reliable source>",
  "examDate":   "<YYYY-MM-DD if a real-exam date is reported, or null>",
  "confidence": "high" | "medium" | "low",
  "notes":      "<one short sentence justifying the call; mention if the attribution is for one task only>"
}

Rules:
- Preference order: pair appears together in ONE Cambridge book + test > pair as ONE actual exam day > single task with high-confidence attribution > "Recent IELTS test" > null.
- confidence=high only when the pair appears together in a named Cambridge book + test number OR is widely-reported as a single actual exam day. confidence=medium when only one of the two tasks has a clear attribution. confidence=low when both are vague or unattributed.
- examDate should be set only when the source explicitly attributes the prompts (the pair, OR the better-attributed single task) to a specific real-exam day. Otherwise null.
- Do NOT guess a Cambridge book number just because a prompt looks "Cambridge-style".
- Keep "notes" under 30 words.`;

  // Gemini 2.5 Pro with google_search grounding. Note we cannot use
  // responseMimeType: 'application/json' here — that flag is rejected
  // when tools are enabled, so we parse the JSON out of the text body.
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    tools: [{ google_search: {} }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1024,
      thinkingConfig: { thinkingBudget: -1 }
    }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${opts.geminiKey}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`gemini http ${r.status}: ${t.slice(0, 300)}`);
  }
  const j = await r.json();
  const cand = j?.candidates?.[0];
  if (cand?.finishReason && cand.finishReason !== 'STOP') {
    throw new Error(`gemini finishReason=${cand.finishReason}`);
  }
  const raw = cand?.content?.parts?.map((p: { text?: string }) => p?.text || '').join('') || '';
  if (!raw.trim()) throw new Error('gemini returned empty text');

  // Strip optional code fences + leading prose before/after the JSON.
  let cleaned = raw.trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '');
  // Find the first '{' and matching '}' to be defensive against the
  // model emitting a sentence before the JSON.
  const firstBrace = cleaned.indexOf('{');
  const lastBrace  = cleaned.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  let parsed: any;
  try { parsed = JSON.parse(cleaned); }
  catch (e) { throw new Error(`find-source JSON parse failed: ${(e as Error).message} — raw: ${raw.slice(0, 200)}`); }

  // Sanity-check + normalise.
  const sourceVal = (typeof parsed.source === 'string' && parsed.source.trim()) ? parsed.source.trim() : null;
  let dateVal: string | null = null;
  if (typeof parsed.examDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.examDate.trim())) {
    dateVal = parsed.examDate.trim();
  }
  const conf = ['high','medium','low'].includes(parsed.confidence) ? parsed.confidence : 'low';
  const notes = typeof parsed.notes === 'string' ? parsed.notes.slice(0, 200) : '';
  return { source: sourceVal, examDate: dateVal, confidence: conf, notes };
}

// ── IELTS Writing auto-tag (scope=tags) ────────────────────────────
// One-shot: given the existing task prompts and an optional Task 1
// chart image, emit the picker-filter tags for both tasks. Used by
// the editor's Settings-tab "✨ Auto-tag this mock" button.
//   • task1.title          — short topic phrase (3-6 words)
//   • task1.chartType      — line_graph | bar_chart | pie_chart | table | map | process_diagram
//   • task1.dataNature     — over-time | static | not-applicable
//   • task2.title          — short topic phrase (3-6 words)
//   • task2.essayType      — opinion | balanced | problem-solution | advantage-disadvantage | two-part
type TagsResult = {
  tags: {
    task1: { title?: string; chartType?: string; dataNature?: string };
    task2: { title?: string; essayType?: string };
  };
  modelUsed:      'gemini-2.5-pro' | 'gpt-4o';
  fallbackReason: string | null;
};

// ── CEFR Writing auto-tag (scope=tags) ─────────────────────────────
// Reads the three task prompts (+ optional p1_context / p1_scenario)
// and emits a short tag set the cwetPicker displays on each card:
//   part1.topic           — shared Part 1 heading
//   t11.title             — informal register tag ("informal note · to friend")
//   t12.title             — formal register tag ("formal letter · to manager")
//   t2.title              — Part 2 topic
//   t2.genre              — Part 2 genre (forum / article / blog post / report)
//   topics[]              — controlled-vocab filter chips
//   targetLevel           — A2 / B1 / B2
// Does NOT touch prompts / samples / vocab — admin reviews + edits + saves.
async function generateCefrWritingTags(opts: {
  t11Prompt:     string;
  t12Prompt:     string;
  t2Prompt:      string;
  p1Context?:    string;
  p1Scenario?:   string;
  geminiKey:     string;
}): Promise<{ tags: any; modelUsed: string; fallbackReason: string | null }> {
  const { t11Prompt, t12Prompt, t2Prompt, p1Context, p1Scenario, geminiKey } = opts;

  const promptText = `You are tagging a CEFR Writing mock test so a student-facing picker can preview it at a glance. Output ONLY a JSON object — no prose, no markdown fence.

Required shape:
{
  "part1": {
    "topic": string,                // 2-5 word heading shared by T1.1 + T1.2 (same scenario, different registers). Sentence case. e.g. "Club management issue", "Library renovation".
    "chip":  string                 // ONE category chip describing what Part 1 is about. Pick from this closed vocabulary: education, work, health, technology, environment, transport, housing, entertainment, safety, family, travel, food, sports, media, money, culture, community, science.
  },
  "t11":   { "title": string },     // Register tag for the informal task. Pattern: "<register> · to <recipient>". e.g. "informal note · to friend".
  "t12":   { "title": string },     // Register tag for the formal task. Same pattern but formal. e.g. "formal letter · to manager".
  "t2": {
    "title": string,                // The T2 topic (subject of the forum / blog / article). e.g. "Cell phones in schools".
    "genre": "forum" | "blog post" | "article",  // Format the prompt asked for. CEFR Writing Part 2 is ALWAYS one of these three — never "essay", "report", or anything else.
    "chip":  string                 // ONE category chip for Part 2 from the same closed vocabulary as part1.chip.
  },
  "targetLevel": "A2" | "B1" | "B2" // Best CEFR fit for the hardest of the three tasks (saved for future filtering, not displayed on the card)
}

Rules:
- All strings sentence case, no trailing punctuation.
- Recipient on t11 / t12 is ONE noun (friend, neighbour, manager, council, principal, mayor, editor, employer, club leader…). Don't use proper names from the prompt.
- T1.1 and T1.2 MUST share part1.topic exactly; they only differ in register + recipient.
- part1.chip describes the Part 1 scenario only. t2.chip describes Part 2 only. They MAY be the same chip if both halves cover the same subject area, but you should still emit one for each independently.
- Pick the SINGLE best-fitting chip for each part — don't emit fallback or umbrella chips ("community" when "safety" fits better).
- For genre, match the wording: "discussion forum" / "online forum" → "forum", "blog post" / "blog" → "blog post", "magazine article" / "newspaper article" / "article" → "article". If the prompt isn't explicit, infer the closest fit from these THREE — never emit "essay" or "report".

INPUT:
${p1Context ? 'Part 1 context: ' + p1Context + '\n' : ''}${p1Scenario ? 'Part 1 scenario: ' + p1Scenario + '\n' : ''}Task 1.1 (informal, ~50 words): ${t11Prompt || '(empty)'}

Task 1.2 (formal, ~120 words): ${t12Prompt || '(empty)'}

Task 2 (~180 words): ${t2Prompt || '(empty)'}`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: promptText }] }],
    generationConfig: {
      temperature:      0.1,
      responseMimeType: 'application/json',
      maxOutputTokens:  1024,
      thinkingConfig:   { thinkingBudget: 512 }
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
    ]
  };

  let modelUsed: 'gemini-2.5-pro' | 'gpt-4o' = 'gemini-2.5-pro';
  let fallbackReason: string | null = null;
  let raw = '';
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );
    if (!r.ok) throw new Error(`gemini http ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const j = await r.json();
    const cand = j?.candidates?.[0];
    if (cand?.finishReason && cand.finishReason !== 'STOP') throw new Error(`gemini finishReason=${cand.finishReason}`);
    raw = cand?.content?.parts?.map((p: { text?: string }) => p?.text || '').join('') || '';
    if (!raw.trim()) throw new Error('gemini returned empty text');
  } catch (e) {
    fallbackReason = e instanceof Error ? e.message : String(e);
    try {
      const r2 = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You output ONLY the JSON object the user describes — no prose, no markdown.' },
            { role: 'user',   content: promptText }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        })
      });
      if (!r2.ok) throw new Error(`gpt-4o http ${r2.status}: ${(await r2.text()).slice(0, 200)}`);
      const j2 = await r2.json();
      raw = j2?.choices?.[0]?.message?.content || '';
      modelUsed = 'gpt-4o';
    } catch (gptErr) {
      throw new Error(`both models failed. gemini: ${fallbackReason}; gpt-4o: ${gptErr instanceof Error ? gptErr.message : String(gptErr)}`);
    }
  }

  let parsed: any;
  try { parsed = JSON.parse(raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')); }
  catch (e) { throw new Error(`tag JSON parse failed: ${(e as Error).message} — raw: ${raw.slice(0, 200)}`); }

  const TOPIC_SET = new Set(['education','work','health','technology','environment','transport','housing','entertainment','safety','family','travel','food','sports','media','money','culture','community','science']);
  const GENRE_SET = new Set(['forum','blog post','article']);
  const LEVEL_SET = new Set(['A2','B1','B2']);
  const pickStr   = (v: unknown) => typeof v === 'string' && v.trim() ? v.trim() : '';
  const pickEnum  = (v: unknown, set: Set<string>) => typeof v === 'string' && set.has(v) ? v : '';
  const pickChip  = (v: unknown) => typeof v === 'string' && TOPIC_SET.has(v.trim().toLowerCase()) ? v.trim().toLowerCase() : '';

  const p1   = parsed?.part1 || {};
  const t11o = parsed?.t11   || {};
  const t12o = parsed?.t12   || {};
  const t2o  = parsed?.t2    || {};
  return {
    tags: {
      part1: {
        topic: pickStr(p1.topic) || undefined,
        chip:  pickChip(p1.chip) || undefined
      },
      t11:   { title: pickStr(t11o.title) || undefined },
      t12:   { title: pickStr(t12o.title) || undefined },
      t2: {
        title: pickStr(t2o.title) || undefined,
        genre: pickEnum(t2o.genre, GENRE_SET) || undefined,
        chip:  pickChip(t2o.chip) || undefined
      },
      targetLevel: pickEnum(parsed?.targetLevel, LEVEL_SET) || undefined
    },
    modelUsed,
    fallbackReason
  };
}

// CEFR Writing — single-task extraction from screenshots. Called when the
// admin clicks "Import task" on T1.1 / T1.2 / T2's tab. Returns only the
// structural fields (title / target / prompt); picker tags (genre, chip,
// part1.topic) come from the bulk-import path or the Auto-tag button.
async function generateCefrWritingTask(opts: {
  taskIndex:  0 | 1 | 2;          // 0 = T1.1 informal, 1 = T1.2 formal, 2 = T2
  files:      FileItem[];
  notes:      string;
  geminiKey:  string;
}): Promise<{ task: { title: string; target: string; prompt: string }; modelUsed: string; fallbackReason: string | null }> {
  const { taskIndex, files, notes, geminiKey } = opts;
  const taskName = taskIndex === 0 ? 'Task 1.1 (informal short letter, ~50 words)'
                 : taskIndex === 1 ? 'Task 1.2 (formal short letter, ~120 words)'
                 :                   'Task 2 (forum / blog post / magazine article, ~180 words)';
  const defaultTarget = taskIndex === 0 ? '50–70 words'
                      : taskIndex === 1 ? '120–150 words'
                      :                   '180–200 words';

  // Per-task example tuned to the task variant — gives Gemini a concrete
  // pattern for what "title" extraction looks like for this register.
  const exampleByIndex: Record<0 | 1 | 2, { source: string; out: { title: string; target: string; prompt: string } }> = {
    0: {
      source:
`Task 1.1
Your friend Anna has invited you to her birthday party next Saturday. Write an email to her.

In your email:
- thank her for the invitation
- say whether you can come
- suggest what to bring

Write 50–70 words.`,
      out: {
        title:  "Friend's birthday invitation",
        target: "50–70 words",
        prompt: "Your friend Anna has invited you to her birthday party next Saturday. Write an email to her.\n\nIn your email:\n- thank her for the invitation\n- say whether you can come\n- suggest what to bring"
      }
    },
    1: {
      source:
`Task 1.2
Write a letter to your school principal about the same trip.

In your letter:
- introduce yourself
- explain the proposed trip
- ask for permission and request a meeting

Write 120–150 words.`,
      out: {
        title:  "School trip permission request",
        target: "120–150 words",
        prompt: "Write a letter to your school principal about the same trip.\n\nIn your letter:\n- introduce yourself\n- explain the proposed trip\n- ask for permission and request a meeting"
      }
    },
    2: {
      source:
`Task 2
You see this post on an online forum:

"Mobile phones are now banned in many schools. Some students say this rule unfairly punishes them; others say it helps them focus. What's your view?"

Write your reply in 180–200 words.`,
      out: {
        title:  "Mobile phones in schools",
        target: "180–200 words",
        prompt: "You see this post on an online forum:\n\n\"Mobile phones are now banned in many schools. Some students say this rule unfairly punishes them; others say it helps them focus. What's your view?\"\n\nWrite your reply."
      }
    }
  };
  const ex = exampleByIndex[taskIndex];

  const hasFiles = files.length > 0;
  const sourceLabel = hasFiles
    ? 'a screenshot or scanned PDF'
    : 'pasted raw text (no screenshots — read the text in the "Admin notes" block below as the SOLE source)';
  const promptText =
`You are extracting ONE CEFR Writing task from ${sourceLabel}. Output ONLY a JSON object — no prose, no markdown fence.

You are extracting: ${taskName}

Required shape:
{
  "title":  string,    // 3-6 word topic phrase, sentence case. e.g. "Library opening hours", "Cell phones in schools". NEVER "Task 1.1" / "Task 1.2" / "Task 2".
  "target": string,    // Word count target shown to the student, e.g. "50–70 words", "120–150 words", "180–200 words". If the source states a different range, use that. Default for this task is "${defaultTarget}".
  "prompt": string     // The exact instruction the student reads. Verbatim from the source — DON'T paraphrase. Plain text. Include any preamble ("Read the following email…") or scenario context that's part of the task. Convert line breaks to "\\n\\n". Drop the trailing "Write X-Y words." sentence (it's captured in "target").
}

Rules:
- "title" is a 3-6 word SHORT topic phrase, not the full prompt. e.g. for "Write a letter to your friend about the camping trip you went on" → title is "Camping trip with a friend".
- "prompt" is the COMPLETE task brief verbatim — context paragraph + the bullet points or sub-questions the student must address. Keep bullet markers ("- ", "• ", "1. "). Preserve double-quoted snippets from the source verbatim.
- If the screenshot mentions a word count (e.g., "Write 50-70 words"), put it in "target". Otherwise default to "${defaultTarget}".
- If the screenshot shows a numbered task header like "Task 1.1" / "Task 2", IGNORE that header — never include it in either "title" or "prompt".

CRITICAL — the example below is ONLY a SHAPE reference. The content of YOUR output MUST come from the user's screenshot. NEVER copy words from the worked example into your output unless they actually appear in the user's screenshot. If the example talks about birthdays and your screenshot is about a sports center, your output must be about the sports center.

Worked example (FOR SHAPE ONLY — DO NOT REUSE ITS CONTENT):

INPUT (what the screenshot shows):
"""
${ex.source}
"""

OUTPUT:
${JSON.stringify(ex.out, null, 2)}

Now extract from the user's actual screenshot that follows.
${notes ? '\nAdmin notes:\n' + notes : ''}`;

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: promptText }
  ];
  for (const f of files) {
    if (!f.base64 || !f.mime) continue;
    parts.push({ inlineData: { mimeType: f.mime, data: f.base64 } });
  }

  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature:      0.1,
      responseMimeType: 'application/json',
      maxOutputTokens:  2048,
      thinkingConfig:   { thinkingBudget: 1024 }
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
    ]
  };

  let modelUsed: 'gemini-2.5-pro' | 'gpt-4o' = 'gemini-2.5-pro';
  let fallbackReason: string | null = null;
  let raw = '';
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );
    if (!r.ok) throw new Error(`gemini http ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const j = await r.json();
    const cand = j?.candidates?.[0];
    if (cand?.finishReason && cand.finishReason !== 'STOP') throw new Error(`gemini finishReason=${cand.finishReason}`);
    raw = cand?.content?.parts?.map((p: { text?: string }) => p?.text || '').join('') || '';
    if (!raw.trim()) throw new Error('gemini returned empty text');
  } catch (e) {
    fallbackReason = e instanceof Error ? e.message : String(e);
    // GPT-4o fallback — uses vision via the image_url format.
    try {
      const userContent: Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }> = [
        { type: 'text', text: promptText }
      ];
      for (const f of files) {
        if (!f.base64 || !f.mime) continue;
        userContent.push({ type: 'image_url', image_url: { url: `data:${f.mime};base64,${f.base64}` } });
      }
      const r2 = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You output ONLY the JSON object the user describes — no prose, no markdown.' },
            { role: 'user',   content: userContent }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
          max_tokens: 2048
        })
      });
      if (!r2.ok) throw new Error(`gpt-4o http ${r2.status}: ${(await r2.text()).slice(0, 200)}`);
      const j2 = await r2.json();
      raw = j2?.choices?.[0]?.message?.content || '';
      modelUsed = 'gpt-4o';
    } catch (gptErr) {
      throw new Error(`both models failed. gemini: ${fallbackReason}; gpt-4o: ${gptErr instanceof Error ? gptErr.message : String(gptErr)}`);
    }
  }

  let parsed: any;
  try { parsed = JSON.parse(raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')); }
  catch (e) { throw new Error(`task JSON parse failed: ${(e as Error).message} — raw: ${raw.slice(0, 200)}`); }

  const pickStr = (v: unknown) => typeof v === 'string' && v.trim() ? v.trim() : '';
  return {
    task: {
      title:  pickStr(parsed?.title)  || taskName.split(' (')[0],
      target: pickStr(parsed?.target) || defaultTarget,
      prompt: pickStr(parsed?.prompt) || ''
    },
    modelUsed,
    fallbackReason
  };
}

// CEFR Writing — whole-mock extraction from screenshots. Called when the
// admin clicks "Import mock" on the Settings tab. Returns the full mock_data
// shell covering all three tasks + the shared Part 1 topic + auto-tagged
// chips. Samples are NOT generated here — admin populates them separately
// on the Samples tab (or via the Samples bulk-generate button).
async function generateCefrWritingFull(opts: {
  files:     FileItem[];
  notes:     string;
  geminiKey: string;
}): Promise<{ mockData: any; modelUsed: string; fallbackReason: string | null }> {
  const { files, notes, geminiKey } = opts;

  // Worked example showing all three tasks plus shared Part 1 topic. Helps
  // Gemini disambiguate which screenshot block belongs to T1.1 vs T1.2 vs
  // T2 when the admin uploads one big multi-page image. Includes the
  // shared Part 1 context + scenario/email so T1.1 and T1.2 both have
  // something to react to (the runner shows context + scenario on top
  // of each Part 1 task page).
  // The example domain is deliberately a niche scenario (community
  // beekeeping society) so Gemini can't echo phrasing from it when the
  // user's actual screenshots are about a different topic. Combined with
  // the "DO NOT REUSE EXAMPLE CONTENT" rule below, this prevents the
  // model from defaulting to the example's domain on partial-OCR pages.
  const exampleSource =
`Part 1

You are a member of the Greendale Beekeeping Society. You received an email from the society chairperson.

Dear Member,

We are pleased to share that the society will host its annual honey tasting evening at the village hall on the last Friday of next month.

We would like members to vote on three things: which guest beekeeper to invite, what label design to use for this year's honey jars, and whether to include a short children's workshop. Please send your replies by Sunday.

Warm regards,
Iris Whitfield
Chair, Greendale Beekeeping Society

Task 1.1
Write an email to your friend Theo who also keeps bees.

In your email:
- tell Theo about the honey tasting evening
- say which guest beekeeper you want to invite
- ask Theo to bring a sample of his honey

Write 50–70 words.

Task 1.2
Write a letter to Iris Whitfield, the society chairperson.

In your letter:
- introduce yourself
- give your vote on the label design and the children's workshop
- suggest a way to advertise the evening locally

Write 120–150 words.

Part 2

Task 2
You see this post in a gardening magazine:

"Urban beekeeping is becoming a popular hobby, but some neighbours worry about safety. Should councils encourage hives in city gardens or restrict them?"

Write an article for the magazine in 180–200 words.`;

  const exampleOut = {
    partOne: {
      context:  "You are a member of the Greendale Beekeeping Society. You received an email from the society chairperson.",
      scenario: "Dear Member,\n\nWe are pleased to share that the society will host its annual honey tasting evening at the village hall on the last Friday of next month.\n\nWe would like members to vote on three things: which guest beekeeper to invite, what label design to use for this year's honey jars, and whether to include a short children's workshop. Please send your replies by Sunday.\n\nWarm regards,\nIris Whitfield\nChair, Greendale Beekeeping Society"
    },
    tasks: {
      t11: {
        title:  "Beekeeping tasting evening",
        target: "50–70 words",
        prompt: "Write an email to your friend Theo who also keeps bees.\n\nIn your email:\n- tell Theo about the honey tasting evening\n- say which guest beekeeper you want to invite\n- ask Theo to bring a sample of his honey"
      },
      t12: {
        title:  "Beekeeping society votes",
        target: "120–150 words",
        prompt: "Write a letter to Iris Whitfield, the society chairperson.\n\nIn your letter:\n- introduce yourself\n- give your vote on the label design and the children's workshop\n- suggest a way to advertise the evening locally"
      },
      t2: {
        title:  "Urban beekeeping rules",
        target: "180–200 words",
        prompt: "You see this post in a gardening magazine:\n\n\"Urban beekeeping is becoming a popular hobby, but some neighbours worry about safety. Should councils encourage hives in city gardens or restrict them?\"\n\nWrite an article for the magazine.",
        genre:  "article",
        chip:   "community"
      }
    },
    part1: {
      topic: "Beekeeping society event",
      chip:  "community"
    },
    targetLevel: "B1"
  };

  const hasFilesBulk = files.length > 0;
  const sourceLabelBulk = hasFilesBulk
    ? 'one or more screenshots / scanned PDF pages'
    : 'pasted raw text (no screenshots — read the text in the "Admin notes" block below as the SOLE source for all three tasks + the Part 1 scenario)';
  const promptText =
`You are extracting a complete CEFR Writing mock test (Part 1 + Part 2) from ${sourceLabelBulk}. Output ONLY one JSON object — no prose, no markdown.

A CEFR Writing test has exactly three tasks:
  • Task 1.1 — short informal letter (~50–70 words, e.g. to a friend)
  • Task 1.2 — short formal letter (~120–150 words, e.g. to a manager / authority)
  • Task 2   — longer piece in ONE of three genres: "forum" (online discussion reply), "blog post", or "article" (~180–200 words)
T1.1 and T1.2 share the SAME Part 1 scenario but differ in register + recipient.

The admin may have uploaded:
  (a) one screenshot containing ALL three tasks back-to-back, OR
  (b) two-to-three separate screenshots (one per task). Either way, identify each task by its heading ("Task 1.1", "Task 1.2", "Task 2") or its content shape (informal short letter vs formal short letter vs longer forum/blog/article piece). Treat them as the same mock and emit ONE combined JSON.

Required shape:
{
  "partOne": {
    "context":  string,         // ONE-SENTENCE setup that frames who the student is in this scenario. e.g. "You are a member of the local library." or "You are a student at City College." If the source labels this block as "Part 1" or shows it as a lead-in paragraph above the email, that's the context.
    "scenario": string           // The FULL email / letter / notice the student is reacting to — verbatim from the source, including the greeting line ("Dear Member,") and the signature ("Kind regards, The Library Committee"). Newlines preserved as "\\n\\n". This is what T1.1 and T1.2 both refer to.
  },
  "tasks": {
    "t11": { "title": string, "target": "50–70 words" | "<source's count>", "prompt": "<verbatim task brief>" },
    "t12": { "title": string, "target": "120–150 words" | "<source's count>", "prompt": "<verbatim task brief>" },
    "t2":  {
      "title":  string,
      "target": "180–200 words" | "<source's count>",
      "prompt": "<verbatim task brief>",
      "genre":  "forum" | "blog post" | "article",
      "chip":   "<one chip from the closed vocab below>"
    }
  },
  "part1": {
    "topic": string,             // 2-5 word shared heading (the scenario T1.1 and T1.2 both reference). e.g. "Library renovation", "Music club issue".
    "chip":  "<one chip from the closed vocab>"
  },
  "targetLevel": "A2" | "B1" | "B2"   // best CEFR fit for the hardest task
}

Closed chip vocab (pick ONE per part): education, work, health, technology, environment, transport, housing, entertainment, safety, family, travel, food, sports, media, money, culture, community, science.

Rules:
- partOne.context is ONE sentence ("You are a …"). If the source doesn't have an explicit setup line, INFER a natural one from the scenario / email recipient ("You are a member of the sports center.").
- partOne.scenario is the COMPLETE email / letter / notice the student responds to — verbatim. Include greeting + body + sign-off. Convert blank lines to "\\n\\n". If the source has no scenario block (Part 2-only screenshot), leave scenario="".
- Each task's "title" is 3-6 words, sentence case, NEVER literal "Task 1.1" / "Task 1.2" / "Task 2".
- Each task "prompt" is the SHORT instruction that follows the "Task 1.1" / "Task 1.2" / "Task 2" heading — NOT the shared scenario / email above it (that lives in partOne.scenario). Keep bullet markers ("- ", "• ", "1. "). Convert line breaks to "\\n\\n". Drop the trailing "Write X-Y words." sentence (it's captured in "target").
- t11 and t12 MUST share part1.topic exactly; they only differ in register + recipient.
- t2.genre matches the source wording: "online forum" / "discussion forum" → "forum", "blog" / "blog post" → "blog post", "magazine article" / "newspaper article" / "article" → "article". CEFR Writing Part 2 is ALWAYS one of those three — never "essay" or "report".
- part1.chip describes Part 1 only; t2.chip describes Part 2 only. They may be the same chip if both halves cover the same subject.
- If a task is missing from the source (e.g., admin only uploaded Part 1 screenshots), leave that task's title="" target="" prompt="" — DON'T fabricate content.

CRITICAL — the example below is ONLY a SHAPE reference. The content of YOUR output MUST come from the user's screenshots. NEVER copy words like "beekeeping", "honey", "Greendale", "Iris Whitfield", or any other phrase from the worked example into your output unless those exact words actually appear in the user's screenshots. If the user's screenshot subject is "swimming lessons", your output must be about swimming lessons — not about the example's beekeeping society.

Worked example (FOR SHAPE ONLY — DO NOT REUSE ITS CONTENT):

INPUT (what the screenshots together show):
"""
${exampleSource}
"""

OUTPUT:
${JSON.stringify(exampleOut, null, 2)}

Now extract the user's actual mock from the screenshots that follow.
${notes ? '\nAdmin notes:\n' + notes : ''}`;

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: promptText }
  ];
  for (const f of files) {
    if (!f.base64 || !f.mime) continue;
    parts.push({ inlineData: { mimeType: f.mime, data: f.base64 } });
  }

  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature:      0.1,
      responseMimeType: 'application/json',
      maxOutputTokens:  4096,
      thinkingConfig:   { thinkingBudget: 2048 }
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
    ]
  };

  let modelUsed: 'gemini-2.5-pro' | 'gpt-4o' = 'gemini-2.5-pro';
  let fallbackReason: string | null = null;
  let raw = '';
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );
    if (!r.ok) throw new Error(`gemini http ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const j = await r.json();
    const cand = j?.candidates?.[0];
    if (cand?.finishReason && cand.finishReason !== 'STOP') throw new Error(`gemini finishReason=${cand.finishReason}`);
    raw = cand?.content?.parts?.map((p: { text?: string }) => p?.text || '').join('') || '';
    if (!raw.trim()) throw new Error('gemini returned empty text');
  } catch (e) {
    fallbackReason = e instanceof Error ? e.message : String(e);
    // GPT-4o fallback with vision support — passes the same images through
    // the image_url format. Same prompt text and structure so the output
    // shape doesn't drift between models.
    try {
      const userContent: Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }> = [
        { type: 'text', text: promptText }
      ];
      for (const f of files) {
        if (!f.base64 || !f.mime) continue;
        userContent.push({ type: 'image_url', image_url: { url: `data:${f.mime};base64,${f.base64}` } });
      }
      const r2 = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You output ONLY the JSON object the user describes — no prose, no markdown.' },
            { role: 'user',   content: userContent }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
          max_tokens: 4096
        })
      });
      if (!r2.ok) throw new Error(`gpt-4o http ${r2.status}: ${(await r2.text()).slice(0, 200)}`);
      const j2 = await r2.json();
      raw = j2?.choices?.[0]?.message?.content || '';
      modelUsed = 'gpt-4o';
    } catch (gptErr) {
      throw new Error(`both models failed. gemini: ${fallbackReason}; gpt-4o: ${gptErr instanceof Error ? gptErr.message : String(gptErr)}`);
    }
  }

  let parsed: any;
  try { parsed = JSON.parse(raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')); }
  catch (e) { throw new Error(`full JSON parse failed: ${(e as Error).message} — raw: ${raw.slice(0, 200)}`); }

  const TOPIC_SET = new Set(['education','work','health','technology','environment','transport','housing','entertainment','safety','family','travel','food','sports','media','money','culture','community','science']);
  const GENRE_SET = new Set(['forum','blog post','article']);
  const LEVEL_SET = new Set(['A2','B1','B2']);
  const pickStr  = (v: unknown) => typeof v === 'string' && v.trim() ? v.trim() : '';
  const pickEnum = (v: unknown, set: Set<string>) => typeof v === 'string' && set.has(v) ? v : '';
  const pickChip = (v: unknown) => typeof v === 'string' && TOPIC_SET.has(v.trim().toLowerCase()) ? v.trim().toLowerCase() : '';

  const tasksIn   = parsed?.tasks   || {};
  const t11In     = tasksIn.t11    || {};
  const t12In     = tasksIn.t12    || {};
  const t2In      = tasksIn.t2     || {};
  const p1In      = parsed?.part1  || {};
  const partOneIn = parsed?.partOne || {};

  const buildTask = (raw: any, defaultLabel: string, defaultTarget: string) => ({
    title:  pickStr(raw.title)  || defaultLabel,
    target: pickStr(raw.target) || defaultTarget,
    prompt: pickStr(raw.prompt) || ''
  });

  const mockData: any = {
    // Minimal settings block so the runner doesn't crash on
    // window.WRITING_TEST_DATA.settings.examTitle. Per-clone branding
    // (logo / heading1 / heading2) is the preferred source via
    // SITE_CONFIG; this just gives the gate a non-empty exam title.
    settings: {
      examTitle: 'CEFR Writing'
    },
    tasks: {
      // Part 1 shared context + scenario live UNDER mock_data.tasks (not
      // mock_data.part1) — that's where _mmgRenderPart1 reads from.
      p1_context:  pickStr(partOneIn.context)  || '',
      p1_scenario: pickStr(partOneIn.scenario) || '',
      t11: buildTask(t11In, 'Task 1.1', '50–70 words'),
      t12: buildTask(t12In, 'Task 1.2', '120–150 words'),
      t2:  {
        ...buildTask(t2In,  'Task 2',   '180–200 words'),
        genre: pickEnum(t2In.genre, GENRE_SET) || undefined,
        chip:  pickChip(t2In.chip) || undefined
      }
    },
    part1: {
      topic: pickStr(p1In.topic) || undefined,
      chip:  pickChip(p1In.chip) || undefined
    },
    targetLevel: pickEnum(parsed?.targetLevel, LEVEL_SET) || undefined
  };

  return { mockData, modelUsed, fallbackReason };
}

// CEFR Writing — sample-answer generation for the ticked levels × tasks.
// Returns a partial object per task so the client can merge without
// touching slots that already have content. Each requested level slot
// gets a fresh sample at that CEFR proficiency. Uzbek translations live
// at uzSampleA1 / uzSampleA2 / etc. Main (the band-7-equivalent model
// answer) lives at `sample` and its Uzbek pair is `uzSample`.
async function generateCefrWritingSamples(opts: {
  levels:        string[];
  includeUzbek:  boolean;
  includeMain:   boolean;
  t11Prompt:     string;
  t12Prompt:     string;
  t2Prompt:      string;
  p1Context:     string;
  p1Scenario:    string;
  t2Genre:       string;
  geminiKey:     string;
}): Promise<{ samples: any; modelUsed: string; fallbackReason: string | null }> {
  const { levels, includeUzbek, includeMain, t11Prompt, t12Prompt, t2Prompt,
          p1Context, p1Scenario, t2Genre, geminiKey } = opts;

  const VALID_LEVELS = new Set(['A1','A2','B1','B2','C1','C2']);
  const cleanLevels = levels.filter(l => VALID_LEVELS.has(l));

  const LEVEL_NOTES: Record<string,string> = {
    A1: 'Very basic vocabulary, present + simple past, short sentences (~5-9 words). Some natural beginner errors (missing articles, wrong word order, simple verb tense slips) — like a real A1 student.',
    A2: 'Common everyday vocabulary, simple + compound sentences. Few errors but limited range. Like a real A2 student.',
    B1: 'Range of common topics, simple linkers (because, however, also). Mostly accurate; occasional slips in complex grammar. Like a real B1 student.',
    B2: 'Wider range of vocabulary, complex sentences with subordinate clauses, accurate use of tenses. Some sophisticated linkers (despite, although, on the other hand).',
    C1: 'Effective, fluent English with idiomatic expressions and a wide range of complex grammatical structures. Cohesive use of advanced linkers (whereas, furthermore, in light of, notwithstanding). Nuanced control of tone and register; very few errors.',
    C2: 'Native-like mastery — sophisticated lexis, precise word choice, complex syntax executed with full accuracy. Idiomatic, with rhetorical flair where appropriate. Reads like a polished newspaper opinion piece or a top-band academic essay.'
  };

  const TARGETS: Record<string,{t11:string;t12:string;t2:string}> = {
    A1: { t11: '40-50 words', t12: '80-100 words',  t2: '120-140 words' },
    A2: { t11: '45-55 words', t12: '100-120 words', t2: '140-160 words' },
    B1: { t11: '50-60 words', t12: '110-130 words', t2: '160-180 words' },
    B2: { t11: '55-70 words', t12: '120-150 words', t2: '180-200 words' },
    C1: { t11: '60-75 words', t12: '130-160 words', t2: '200-230 words' },
    C2: { t11: '65-80 words', t12: '140-170 words', t2: '220-260 words' }
  };
  const MAIN_TARGETS = { t11: '50-70 words', t12: '120-150 words', t2: '180-200 words' };

  // Build a description of what we want emitted per task. Only the
  // tasks the admin ticked have a non-empty prompt.
  const taskList: Array<{ key: 't11'|'t12'|'t2'; label: string; prompt: string; register: string }> = [];
  if (t11Prompt) taskList.push({ key: 't11', label: 'Task 1.1', prompt: t11Prompt, register: 'short informal letter to a friend (~50–70 words)' });
  if (t12Prompt) taskList.push({ key: 't12', label: 'Task 1.2', prompt: t12Prompt, register: 'short formal letter to an authority (~120–150 words, signed off with name)' });
  if (t2Prompt)  taskList.push({ key: 't2',  label: 'Task 2',   prompt: t2Prompt,  register: t2Genre ? ('a ' + t2Genre + ' (~180–200 words)') : 'an extended written response (~180–200 words)' });

  // Build the JSON shape Gemini should emit per task — only the slots
  // we actually want, so it doesn't waste tokens on unrequested ones.
  const slotsLines: string[] = [];
  if (includeMain) {
    slotsLines.push('"sample": "<the main model-answer essay (target band ~B2). Wrap 4-8 high-value chunks (collocations, advanced phrases) in <mark>…</mark>>"');
    if (includeUzbek) slotsLines.push('"uzSample": "<faithful Uzbek translation of the main sample (natural, modern Uzbek in Latin script). Wrap the SAME 4-8 chunks in <mark>…</mark>>"');
  }
  for (const lvl of cleanLevels) {
    slotsLines.push(`"sample${lvl}": "<a ${lvl}-level essay at the target word count for that level for this task. Wrap 2-4 phrases in <mark>…</mark> to highlight the level-appropriate vocabulary>"`);
    if (includeUzbek) {
      slotsLines.push(`"uzSample${lvl}": "<faithful Uzbek translation of sample${lvl} (preserve the level — DON'T polish an A1 essay into B2 Uzbek prose). Wrap the SAME marked phrases in <mark>…</mark>>"`);
    }
  }

  const tasksBlock = taskList.map(t => {
    const target = (cleanLevels[0] && TARGETS[cleanLevels[0]]) ? TARGETS[cleanLevels[0]][t.key] : MAIN_TARGETS[t.key];
    return `─ ${t.label} (${t.register}, default target ~${target}):
${t.prompt}`;
  }).join('\n\n');

  const promptText =
`You are writing sample answers for a CEFR Writing mock test. The student studies for CEFR (A1 → B2) so your samples must match the requested level accurately. Output ONLY a JSON object — no prose, no markdown.

For each task you emit, fill ONLY the slot keys listed below for THAT task. Leave out any slot we did NOT list.

Required output shape:
{
${taskList.map(t => `  "${t.key}": {\n    ${slotsLines.join(',\n    ')}\n  }`).join(',\n')}
}

CEFR level guidance (use these as targets when writing each sample):
${cleanLevels.map(l => `• ${l}: ${LEVEL_NOTES[l]}`).join('\n')}
${includeMain ? '• Main (sample): a polished B2-equivalent model answer that demonstrates strong organisation, varied vocabulary, and accurate complex sentences. Aim for a student aiming at B2 / mid-band-7 IELTS quality.' : ''}

Word-count targets per task per level:
${taskList.map(t => `• ${t.label}: ` + cleanLevels.map(l => `${l} ${TARGETS[l] ? TARGETS[l][t.key] : ''}`).join(', ') + (includeMain ? `, Main ${MAIN_TARGETS[t.key]}` : '')).join('\n')}

Rules:
- Each essay must actually do what the task asks (greet the recipient, cover every bullet point in the brief, sign off appropriately). The reader is a real student, not a marker — write naturally.
- Lower levels should make natural learner-mistakes (article slips, simple tense errors, limited linkers). Higher levels should be more accurate AND show wider range.
- For T1.1 and T1.2, reference details from the Part 1 scenario / email above when relevant — don't invent unrelated facts.
- For T2, frame the response as the requested genre (forum reply / blog post / magazine article).
- Wrap high-value chunks (collocations, advanced phrases) in <mark>…</mark> so the reader sees what's worth memorising. Match the same chunks across the English and Uzbek versions of the same level.
- Uzbek translations must mirror the level — DON'T polish an A1 essay into eloquent Uzbek. Render natural modern Uzbek (Latin script).
- DO NOT emit Markdown, code fences, or commentary — JSON only.

CONTEXT:
${p1Context ? 'Part 1 context: ' + p1Context + '\n' : ''}${p1Scenario ? 'Part 1 scenario / email (T1.1 + T1.2 both respond to this):\n' + p1Scenario + '\n\n' : ''}TASKS:
${tasksBlock}`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: promptText }] }],
    generationConfig: {
      temperature:      0.45,
      responseMimeType: 'application/json',
      maxOutputTokens:  16384,
      thinkingConfig:   { thinkingBudget: 2048 }
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
    ]
  };

  let modelUsed: 'gemini-2.5-pro' | 'gpt-4o' = 'gemini-2.5-pro';
  let fallbackReason: string | null = null;
  let raw = '';
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );
    if (!r.ok) throw new Error(`gemini http ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const j = await r.json();
    const cand = j?.candidates?.[0];
    if (cand?.finishReason && cand.finishReason !== 'STOP') throw new Error(`gemini finishReason=${cand.finishReason}`);
    raw = cand?.content?.parts?.map((p: { text?: string }) => p?.text || '').join('') || '';
    if (!raw.trim()) throw new Error('gemini returned empty text');
  } catch (e) {
    fallbackReason = e instanceof Error ? e.message : String(e);
    try {
      const r2 = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You output ONLY the JSON object the user describes — no prose, no markdown.' },
            { role: 'user',   content: promptText }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.45,
          max_tokens: 8192
        })
      });
      if (!r2.ok) throw new Error(`gpt-4o http ${r2.status}: ${(await r2.text()).slice(0, 200)}`);
      const j2 = await r2.json();
      raw = j2?.choices?.[0]?.message?.content || '';
      modelUsed = 'gpt-4o';
    } catch (gptErr) {
      throw new Error(`both models failed. gemini: ${fallbackReason}; gpt-4o: ${gptErr instanceof Error ? gptErr.message : String(gptErr)}`);
    }
  }

  let parsed: any;
  try { parsed = JSON.parse(raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')); }
  catch (e) { throw new Error(`samples JSON parse failed: ${(e as Error).message} — raw: ${raw.slice(0, 200)}`); }

  // Sanitise: only return keys that match the slots we actually
  // requested for each task. Any extra keys Gemini emitted are dropped.
  const wantedSlots = new Set<string>();
  if (includeMain) { wantedSlots.add('sample'); if (includeUzbek) wantedSlots.add('uzSample'); }
  for (const lvl of cleanLevels) {
    wantedSlots.add('sample' + lvl);
    if (includeUzbek) wantedSlots.add('uzSample' + lvl);
  }
  const samples: any = {};
  for (const t of taskList) {
    const taskOut: Record<string, string> = {};
    const src = parsed?.[t.key] || {};
    for (const k of wantedSlots) {
      const v = src[k];
      if (typeof v === 'string' && v.trim()) taskOut[k] = v.trim();
    }
    if (Object.keys(taskOut).length) samples[t.key] = taskOut;
  }

  return { samples, modelUsed, fallbackReason };
}

// CEFR Writing — vocabulary generation for one task. Returns a list of
// {en, uz} pairs. The client dedupes against the existing vocab list.
async function generateCefrWritingVocab(opts: {
  taskKey:    't11' | 't12' | 't2';
  prompt:     string;
  p1Context:  string;
  p1Scenario: string;
  count:      number;
  geminiKey:  string;
}): Promise<{ vocabulary: Array<{ en: string; uz: string }>; modelUsed: string; fallbackReason: string | null }> {
  const { taskKey, prompt, p1Context, p1Scenario, count, geminiKey } = opts;
  const taskLabel = taskKey === 't11' ? 'Task 1.1 (informal short letter, ~50-70 words)'
                  : taskKey === 't12' ? 'Task 1.2 (formal short letter, ~120-150 words)'
                  : 'Task 2 (forum / blog / article, ~180-200 words)';

  const promptText =
`You are building a topical English ↔ Uzbek vocabulary list for a CEFR Writing student preparing for this task:

${taskLabel}

Prompt:
${prompt}
${p1Context  ? '\nPart 1 context: ' + p1Context  : ''}
${p1Scenario ? '\nPart 1 scenario / email:\n' + p1Scenario : ''}

Output ONLY a JSON object — no prose, no markdown:
{
  "vocabulary": [
    { "en": "<English word or short phrase>", "uz": "<faithful Uzbek translation, Latin script>" }
  ]
}

Rules:
- Emit exactly ${count} entries.
- Mix levels: ~30% A2-B1 everyday lexis, ~50% B1-B2 topical phrases, ~20% B2 collocations / advanced expressions.
- Each entry must be USEFUL for THIS specific task (not generic IELTS-style filler). Include topic nouns, common verbs, useful adjectives, idiomatic phrases the student would naturally reach for.
- Uzbek must be natural modern Uzbek in Latin script — NOT word-for-word from a dictionary. e.g. "to address an issue" → "muammoni hal qilish".
- No duplicates. No proper names from the prompt.`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: promptText }] }],
    generationConfig: {
      temperature:      0.4,
      responseMimeType: 'application/json',
      maxOutputTokens:  4096,
      thinkingConfig:   { thinkingBudget: 1024 }
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
    ]
  };

  let modelUsed: 'gemini-2.5-pro' | 'gpt-4o' = 'gemini-2.5-pro';
  let fallbackReason: string | null = null;
  let raw = '';
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );
    if (!r.ok) throw new Error(`gemini http ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const j = await r.json();
    const cand = j?.candidates?.[0];
    if (cand?.finishReason && cand.finishReason !== 'STOP') throw new Error(`gemini finishReason=${cand.finishReason}`);
    raw = cand?.content?.parts?.map((p: { text?: string }) => p?.text || '').join('') || '';
    if (!raw.trim()) throw new Error('gemini returned empty text');
  } catch (e) {
    fallbackReason = e instanceof Error ? e.message : String(e);
    try {
      const r2 = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You output ONLY the JSON object the user describes — no prose, no markdown.' },
            { role: 'user',   content: promptText }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.4,
          max_tokens: 4096
        })
      });
      if (!r2.ok) throw new Error(`gpt-4o http ${r2.status}: ${(await r2.text()).slice(0, 200)}`);
      const j2 = await r2.json();
      raw = j2?.choices?.[0]?.message?.content || '';
      modelUsed = 'gpt-4o';
    } catch (gptErr) {
      throw new Error(`both models failed. gemini: ${fallbackReason}; gpt-4o: ${gptErr instanceof Error ? gptErr.message : String(gptErr)}`);
    }
  }

  let parsed: any;
  try { parsed = JSON.parse(raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')); }
  catch (e) { throw new Error(`vocab JSON parse failed: ${(e as Error).message} — raw: ${raw.slice(0, 200)}`); }

  const list = Array.isArray(parsed?.vocabulary) ? parsed.vocabulary : [];
  const vocabulary: Array<{ en: string; uz: string }> = [];
  const seen = new Set<string>();
  for (const row of list) {
    if (!row || typeof row.en !== 'string' || typeof row.uz !== 'string') continue;
    const en = row.en.trim();
    const uz = row.uz.trim();
    if (!en || !uz) continue;
    const k = en.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    vocabulary.push({ en, uz });
  }

  return { vocabulary, modelUsed, fallbackReason };
}

async function generateIeltsWritingTags(opts: {
  task1Prompt: string;
  task2Prompt: string;
  chartFile:   FileItem | null;
  geminiKey:   string;
}): Promise<TagsResult> {
  const t1 = opts.task1Prompt.trim();
  const t2 = opts.task2Prompt.trim();

  const promptText =
`You are tagging an IELTS Writing mock for a fullscreen mock picker. The admin has already typed the task prompts below; your job is to infer the picker filter tags. DO NOT rewrite the prompts — only emit the tag fields. Output ONE JSON object, no commentary, no markdown.

Output shape (omit any tag you genuinely cannot infer — leave it as null):
{
  "task1": {
    "title":      "<3-6 word short topic phrase derived from the chart subject, e.g. 'Online shopping growth'. NEVER 'Task 1'>" | null,
    "chartType":  "line_graph" | "bar_chart" | "pie_chart" | "table" | "map" | "process_diagram" | null,
    "dataNature": "over-time" | "static" | "not-applicable" | null
  },
  "task2": {
    "title":     "<3-6 word short topic phrase derived from the essay subject, e.g. 'Working from home'. NEVER 'Task 2'>" | null,
    "essayType": "opinion" | "balanced" | "problem-solution" | "advantage-disadvantage" | "two-part" | null
  }
}

Detection rules:
• chartType: read the prompt wording. "The graph below" / "line graph" → line_graph; "bar chart" → bar_chart; "pie chart" → pie_chart; "the table" → table; "the map" / "the maps" / "the changes that have taken place" with two-time-period plans → map; "the diagram" / "process" / "stages of" → process_diagram. If a T1 chart image is attached, use it as the visual tie-breaker.
• dataNature: "over-time" when years/decades/months appear in the prompt (X-axis is time) OR the chart visibly tracks a metric across a time span. "static" for single-time-point comparisons (one year, one pie, one comparison table). "not-applicable" for map and process_diagram chart types — they don't have a time dimension.
• essayType (Task 2): pattern-match the question form:
  - "To what extent do you agree or disagree" / "Do you think…" / "Is this a positive or negative development" → opinion
  - "Discuss both views and give your opinion" → balanced
  - "What are the problems…?" + "What can be done…?" or "causes / solutions" pointing at fixes → problem-solution
  - "Do the advantages outweigh the disadvantages" / "advantages and disadvantages" → advantage-disadvantage
  - Two distinct numbered or sentence-form questions on different topics → two-part

Task 1 prompt:
${t1 || '(empty — task 1 not yet written; leave all task1 tags null)'}

Task 2 prompt:
${t2 || '(empty — task 2 not yet written; leave all task2 tags null)'}`;

  // Build the multimodal call. If we have a chart image, ship it inline
  // so Gemini can disambiguate chart types whose prompt wording is
  // ambiguous ("the chart below shows…").
  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: promptText }
  ];
  if (opts.chartFile && opts.chartFile.base64) {
    parts.push({ text: '\n[Task 1 chart image follows — use it as visual tie-breaker for chartType + dataNature]' });
    parts.push({ inlineData: { mimeType: opts.chartFile.mime, data: opts.chartFile.base64 } });
  }

  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
      maxOutputTokens: 1024,
      thinkingConfig: { thinkingBudget: -1 }
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
    ]
  };

  let modelUsed: 'gemini-2.5-pro' | 'gpt-4o' = 'gemini-2.5-pro';
  let fallbackReason: string | null = null;
  let raw = '';
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${opts.geminiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );
    if (!r.ok) throw new Error(`gemini http ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const j = await r.json();
    const cand = j?.candidates?.[0];
    if (cand?.finishReason && cand.finishReason !== 'STOP') throw new Error(`gemini finishReason=${cand.finishReason}`);
    raw = cand?.content?.parts?.map((p: { text?: string }) => p?.text || '').join('') || '';
    if (!raw.trim()) throw new Error('gemini returned empty text');
  } catch (e) {
    fallbackReason = e instanceof Error ? e.message : String(e);
    // GPT-4o fallback. Only available when there's no PDF; tags-only flow has no PDFs.
    try {
      const r2 = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You output ONLY the JSON object the user describes — no prose, no markdown.' },
            { role: 'user',   content: promptText }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        })
      });
      if (!r2.ok) throw new Error(`gpt-4o http ${r2.status}: ${(await r2.text()).slice(0, 200)}`);
      const j2 = await r2.json();
      raw = j2?.choices?.[0]?.message?.content || '';
      modelUsed = 'gpt-4o';
    } catch (gptErr) {
      throw new Error(`both models failed. gemini: ${fallbackReason}; gpt-4o: ${gptErr instanceof Error ? gptErr.message : String(gptErr)}`);
    }
  }

  let parsed: any;
  try { parsed = JSON.parse(raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')); }
  catch (e) { throw new Error(`tag JSON parse failed: ${(e as Error).message} — raw: ${raw.slice(0, 200)}`); }

  // Sanity-check the values against the closed enums; anything outside
  // the enum collapses to null so the client doesn't pollute mock_data
  // with a model-invented label.
  const CHART_SET = new Set(['line_graph','bar_chart','pie_chart','table','map','process_diagram']);
  const NATURE_SET = new Set(['over-time','static','not-applicable']);
  const ESSAY_SET = new Set(['opinion','balanced','problem-solution','advantage-disadvantage','two-part']);
  const pick = (v: unknown, set: Set<string>) => typeof v === 'string' && set.has(v) ? v : null;
  const pickStr = (v: unknown) => typeof v === 'string' && v.trim() ? v.trim() : null;

  const t1Out = parsed?.task1 || {};
  const t2Out = parsed?.task2 || {};
  return {
    tags: {
      task1: {
        title:      pickStr(t1Out.title)      || undefined,
        chartType:  pick(t1Out.chartType,  CHART_SET)  || undefined,
        dataNature: pick(t1Out.dataNature, NATURE_SET) || undefined
      },
      task2: {
        title:     pickStr(t2Out.title)     || undefined,
        essayType: pick(t2Out.essayType, ESSAY_SET) || undefined
      }
    },
    modelUsed,
    fallbackReason
  };
}

// ── IELTS Writing chart enhance (scope=enhance-chart) ──────────────
// Returns a cleaned-up chart image in one of two modes:
//
//   • 'visual'    — Gemini 2.5 Flash Image takes the raw screenshot
//                   and returns a polished version (same data,
//                   sharper text, white background, no watermark).
//   • 'rerender'  — Two-pass: Gemini 2.5 Pro reads the chart and
//                   emits a structured spec (type, axes, series);
//                   Gemini 2.5 Flash Image then draws a fresh chart
//                   from that spec in Cambridge-IELTS style.
//
// Both modes return base64 PNG. 'rerender' additionally returns the
// extracted spec so the frontend can show it for debugging.
async function enhanceIeltsChart(opts: {
  imageBase64: string;
  mimeType:    string;
  mode:        'visual' | 'rerender';
  chartTypeHint?: string;
  geminiKey:   string;
}): Promise<{ imageBase64: string; mimeType: string; spec?: unknown; modelChain: string }> {
  const { imageBase64, mimeType, mode, chartTypeHint, geminiKey } = opts;

  if (mode === 'visual') {
    // Direct image-in image-out via gemini-2.5-flash-image. The model
    // takes the original screenshot and the text prompt as parts; we
    // ask for an IMAGE-only response back. Prompt is intentionally
    // short and directive — earlier versions said "produce a polished
    // version" which invited Flash Image to redraw creatively and
    // shift digits. Framing as "regenerate this image sharper" (the
    // wording gemini.google.com uses for the same task) keeps the
    // model in upscale-mode rather than re-paint-mode.
    const prompt = `Regenerate THIS chart image to be sharper, clearer, and easier to read. Treat this as an upscale / denoise pass on the EXACT same picture — do NOT redraw or restyle.

KEEP IDENTICAL (do not change any of these):
- Every number / percentage / digit visible
- Every text label, title, legend entry, axis label, footnote
- Every colour (slice colours, bar colours, line colours)
- Slice angles / bar heights / line positions — the geometry of every shape
- Layout — number of panels, their order, the position of titles and legends
${chartTypeHint ? '- The chart type is a ' + chartTypeHint.replace('_', ' ') + ' — keep it that way.' : '- The chart type as it appears in the source.'}

WHAT TO IMPROVE:
- Background → pure white (#FFFFFF)
- Watermarks, stamps, logos, site URLs (e.g. "ieltsmaterial.com", "ieltsonlinetests", text/image overlays bleeding through the page) → REMOVE COMPLETELY. The output must look like a clean exam handout, not a marked-up download.
- Page tint, drop shadows, scan artefacts, fold lines, paper texture → remove
- Text and numerals → crisp, anti-aliased, Arial / sans-serif typography
- Lines → clean, no JPEG halos / scan noise

Output ONE image only. No commentary, no extra annotations.`;
    const parts = [
      { text: prompt },
      { inlineData: { mimeType, data: imageBase64 } }
    ];
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: { responseModalities: ['IMAGE'] }
        })
      }
    );
    if (!r.ok) throw new Error(`flash-image http ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const j = await r.json();
    const cand = j?.candidates?.[0];
    const respParts = cand?.content?.parts || [];
    for (const p of respParts) {
      if (p.inlineData?.data) {
        return {
          imageBase64: p.inlineData.data,
          mimeType:    p.inlineData.mimeType || 'image/png',
          modelChain:  'gemini-2.5-flash-image'
        };
      }
    }
    // No image — capture Gemini's text response + finishReason so the
    // admin can see WHY it refused (safety filter, can't reproduce
    // copyrighted material, etc.) instead of an opaque error.
    const textOut    = respParts.map((p: { text?: string }) => p?.text || '').join('').trim();
    const finish     = cand?.finishReason || 'NO_CANDIDATE';
    const safetyHit  = (cand?.safetyRatings || []).find((s: { blocked?: boolean }) => s.blocked);
    const safetyTxt  = safetyHit ? ` · safety blocked: ${(safetyHit as { category?: string }).category}` : '';
    throw new Error(`flash-image returned no image (finish=${finish}${safetyTxt})${textOut ? ' · response: ' + textOut.slice(0, 200) : ''}`);
  }

  // ── 'rerender' mode: two-pass ──────────────────────────────────────
  // Pass 1 — Gemini 2.5 Pro reads the chart and emits a structured spec.
  // The spec is ALWAYS panel-based — even single-chart screenshots get
  // wrapped in panels[0], and multi-panel composites (2x2 pies, side-
  // by-side bars, etc.) populate panels[] in reading order. Without this,
  // Pro silently collapsed 4 pies into a single series, Flash Image got
  // told to draw "one pie" and returned NO_IMAGE.
  const specPrompt = `You are analysing an IELTS Writing Task 1 chart. Read the image carefully and emit JSON describing every chart panel visible. Output ONLY the JSON object — no prose, no markdown fence.

Shape:
{
  "title":   string,                                    // overall caption / question above the panels (or between rows). Use "" if there's none.
  "layout":  "single" | "grid_1x2" | "grid_2x1" | "grid_2x2" | "row" | "column",
  "panels":  [                                          // ONE entry per visible chart, in reading order (left→right, top→bottom)
    {
      "label":     string,                              // EXACT sub-caption above the panel (e.g. "Full-time students"). USE "" (empty string) if the panel has NO sub-caption — do NOT invent labels like "Panel 1".
      "chartType": "line_graph" | "bar_chart" | "pie_chart" | "table",
      "xAxis":     { "label": string, "values": string[] },   // omit / leave empty for pie/table
      "yAxis":     { "label": string, "unit": string },       // omit / leave empty for pie/table
      "legend":    string[],                             // human-readable category names ("Quite happy", "Not at all", "1995"…). NEVER put hex codes (#a1b2c3, 22cc55e) or rgb() values here — those go in "colors".
      "values":    number[] | number[][],                // pie: ONE array aligned to legend. Pie values are percentages and MUST sum to 100 (±2 for rounding). bar/line: 2D array, one row per series, columns aligned to xAxis.values. table: 2D matrix.
      "colors":    string[]                              // optional hex colours per legend entry, e.g. ["#fbbf24","#3b82f6","#22c55e"]. Must be prefixed with #.
    }
  ],
  "notes":   string                                     // anything else worth preserving (source line, axis range, footer text…)
}

CRITICAL CONSTRAINTS:
1. Multi-panel charts: if the screenshot contains more than one chart side-by-side or in a grid (very common with IELTS pies — "full-time students" vs "part-time students", "1995" vs "2005", etc.), emit ONE entry in panels[] per chart, NOT a single merged chart. Set layout to the closest grid shape.
2. Unique legend entries: each panel's legend[] must have NO duplicates. If you see the same category twice, deduplicate it.
3. Pie sum rule: pie values are percentages. They MUST sum to 100 (±2 for rounding). If the values you can read don't sum to ~100, recheck the image — DO NOT submit pies where a slice exceeds 100% (no "111%" slices).
4. No hex in legend: legend strings are HUMAN-READABLE category names ("Quite happy", "1995", "Asia"). Hex / rgb / oklch colour values belong in "colors", never "legend".
5. Faithfulness over guessing: if a value is hard to read, prefer the closest visible value or omit that panel entirely. Do NOT invent percentages to make a sum work — round known sectors and let the remainder fall on the largest slice.
6. Labels: panel.label must come VERBATIM from the image. If a panel has no visible sub-caption, set label="" — never invent "Panel 1" / "Chart 1".
7. Maps / process diagrams: the structured shape doesn't fit — return { "title":"...", "layout":"single", "panels":[], "notes":"Not re-renderable — use visual mode." }.`;
  const specParts = [
    { text: specPrompt },
    { inlineData: { mimeType, data: imageBase64 } }
  ];
  const r1 = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: specParts }],
        generationConfig: {
          temperature:        0.1,
          responseMimeType:   'application/json',
          // Pro on a vision task wants headroom — bump to 8192 so chart
          // specs with 10+ data points fit. Cap thinking at 1024 so the
          // budget can't be consumed before output starts (the symptom
          // was an empty `raw` and a JSON parse error).
          maxOutputTokens:    8192,
          thinkingConfig:     { thinkingBudget: 1024 }
        }
      })
    }
  );
  if (!r1.ok) throw new Error(`pro-spec http ${r1.status}: ${(await r1.text()).slice(0, 200)}`);
  const j1     = await r1.json();
  const cand1  = j1?.candidates?.[0];
  const raw1   = cand1?.content?.parts?.map((p: { text?: string }) => p?.text || '').join('') || '';
  if (!raw1.trim()) {
    const finish    = cand1?.finishReason || 'NO_CANDIDATE';
    const safetyHit = (cand1?.safetyRatings || []).find((s: { blocked?: boolean }) => s.blocked);
    const safetyTxt = safetyHit ? ` · safety blocked: ${(safetyHit as { category?: string }).category}` : '';
    throw new Error(`pro-spec returned empty text (finish=${finish}${safetyTxt})`);
  }
  let spec: any;
  try { spec = JSON.parse(raw1.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')); }
  catch (e) { throw new Error(`spec JSON parse failed: ${(e as Error).message} — raw: ${raw1.slice(0, 200)}`); }

  // ── Sanitise the spec before handing to Flash Image ─────────────
  // Pro routinely leaks hex codes into legend strings, duplicates a
  // category in pie legends, and emits pie sums that bust 100. Each of
  // these wrecks the draw prompt; clean before passing along.
  const isHexish = (s: string) =>
    /^#?[0-9a-fA-F]{3,8}$/.test(String(s).trim()) ||                  // #abc / abcdef / 22cc55e
    /^rgba?\s*\(/i.test(String(s)) || /^oklch\b/i.test(String(s));    // rgb()/oklch
  const panelsIn = Array.isArray(spec?.panels) ? spec.panels : [];
  spec.panels = panelsIn.map((p: any) => {
    p = p && typeof p === 'object' ? p : {};
    // Legend: dedupe + strip hex-y entries
    const seen = new Set<string>();
    const legendOut: string[] = [];
    const keepIdx: number[] = [];
    (Array.isArray(p.legend) ? p.legend : []).forEach((l: unknown, i: number) => {
      const s = String(l == null ? '' : l).trim();
      if (!s) return;
      if (isHexish(s)) return;                                        // colour value leaked into legend — drop
      const k = s.toLowerCase();
      if (seen.has(k)) return;
      seen.add(k);
      legendOut.push(s);
      keepIdx.push(i);
    });
    p.legend = legendOut;
    // Re-align values to the surviving legend indices (only for 1D pie values)
    if (Array.isArray(p.values) && p.values.length && !Array.isArray(p.values[0])) {
      const filtered = keepIdx.map(i => p.values[i]).filter((v: unknown) => v != null);
      p.values = filtered;
      // Pie-sum normalisation — if the values clearly don't sum to ~100,
      // rescale so the proportions are preserved but the prompt doesn't
      // tell Flash Image to draw 111% slices.
      if (String(p.chartType).includes('pie') && filtered.length) {
        const nums = filtered.map((v: unknown) => Number(v) || 0);
        const sum  = nums.reduce((a: number, b: number) => a + b, 0);
        if (sum > 0 && (sum < 95 || sum > 105)) {
          p.values = nums.map((v: number) => Math.round((v / sum) * 100));
        }
      }
    }
    // Colours: keep only legitimate hex (with or without #), prefix any missing #.
    if (Array.isArray(p.colors)) {
      p.colors = p.colors
        .map((c: unknown) => String(c == null ? '' : c).trim())
        .filter((c: string) => /^#?[0-9a-fA-F]{3,8}$/.test(c))
        .map((c: string) => c.startsWith('#') ? c : '#' + c);
    }
    // Label: trim; empty strings stay empty (do NOT synthesise "Panel N")
    p.label = p.label ? String(p.label).trim() : '';
    return p;
  });

  // Pass 2 — Gemini 2.5 Flash Image draws a brand-new clean chart from
  // the spec in Cambridge-IELTS style. The prompt makes the panel layout
  // explicit so Flash Image renders a composite (e.g. 2x2 pies) rather
  // than collapsing to a single chart and returning NO_IMAGE.
  const panels: any[] = Array.isArray(spec?.panels) ? spec.panels : [];
  if (!panels.length) {
    throw new Error('pro-spec returned no panels (chart not re-renderable; try visual mode instead)');
  }
  const layout = String(spec?.layout || 'single');
  const layoutDesc: Record<string, string> = {
    single:   'a single panel',
    row:      'a horizontal row of panels (one row, side-by-side)',
    column:   'a vertical column of panels (one column, stacked)',
    grid_1x2: 'a 1×2 grid (one row, two panels side-by-side)',
    grid_2x1: 'a 2×1 grid (two rows, one panel each)',
    grid_2x2: 'a 2×2 grid (two rows, two columns — top-left, top-right, bottom-left, bottom-right)'
  };
  const layoutText = layoutDesc[layout] || (panels.length > 1 ? 'a grid of ' + panels.length + ' panels' : 'a single panel');

  function panelBlock(p: any, idx: number): string {
    const label    = p.label ? String(p.label) : '';        // empty → no sub-title for this panel
    const chartT   = String(p.chartType || 'chart').replace('_', ' ');
    const legend   = Array.isArray(p.legend) ? p.legend : [];
    const xVals    = Array.isArray(p?.xAxis?.values) ? p.xAxis.values : [];
    const isPieish = chartT === 'pie chart' || chartT === 'table';
    let body = label
      ? `  Sub-title above this panel: "${label}"\n`
      : `  Sub-title above this panel: (none — do NOT add a generic label like "Panel ${idx + 1}", leave the area blank)\n`;
    body += `  Chart type: ${chartT}\n  Legend (in display order, exactly ${legend.length} item${legend.length === 1 ? '' : 's'}): ${legend.join(', ') || '(none)'}\n`;
    if (!isPieish && xVals.length) {
      body += `  X axis (${p?.xAxis?.label || 'category'}): ${xVals.join(', ')}\n  Y axis (${p?.yAxis?.label || 'value'}${p?.yAxis?.unit ? ', unit ' + p.yAxis.unit : ''})\n`;
    }
    // values can be 1D (pie) or 2D (bar/line/table)
    const vals = p.values;
    if (Array.isArray(vals) && vals.length) {
      if (Array.isArray(vals[0])) {
        body += '  Data rows (each row = one series, columns aligned to legend / x-axis):\n';
        vals.forEach((row: any, i: number) => {
          body += `    • ${legend[i] || ('Row ' + (i + 1))}: ${Array.isArray(row) ? row.join(', ') : row}\n`;
        });
      } else if (chartT === 'pie chart') {
        const nums = vals.map((v: any) => Number(v) || 0);
        const sum  = nums.reduce((a: number, b: number) => a + b, 0);
        const pairs = legend.map((l: string, i: number) => `${l} = ${nums[i] ?? 0}%`).join(', ');
        body += `  Pie slices (must sum to 100): ${pairs} (sum ${sum})\n`;
      } else {
        body += `  Values: ${vals.join(', ')}\n`;
      }
    }
    if (Array.isArray(p.colors) && p.colors.length) {
      body += `  Colours (per legend entry, same order): ${p.colors.join(', ')}\n`;
    }
    return body;
  }
  const panelsText = panels.map(panelBlock).join('\n');
  const overallTitle = spec?.title ? String(spec.title) : '';

  const drawPrompt = `Draw ONE clean Cambridge-IELTS-style composite image showing ${layoutText} (${panels.length} chart${panels.length === 1 ? '' : 's'} total) from this exact data. Render EXACTLY what is given — do not invent any labels, slices, or legend entries.

${overallTitle ? 'Overall caption (centred between the rows OR above the whole grid): "' + overallTitle + '"\n\n' : ''}Panels (in reading order):

${panelsText}
${spec?.notes ? 'Notes: ' + spec.notes + '\n' : ''}
ACCURACY REQUIREMENTS (these override style):
- Use the EXACT legend, slice values, and sub-titles given above. Do not add or remove categories. Do not relabel slices.
- Pie slices: the percentage written inside each slice MUST match the value given in the panel block. Slices must sum to 100. No "111%" labels.
- Sub-title above a panel: if the panel block says "(none)" leave that space blank — do not write "Panel 1" / "Chart 1" / etc.
- Legend entries are HUMAN-READABLE words from the panel block. Never write a hex code (#a1b2c3, 22cc55e) or rgb() inside the legend or anywhere on the chart.
- No duplicate legend entries on any panel.

Layout requirements:
- Render ALL ${panels.length} panel${panels.length === 1 ? '' : 's'} in the SAME output image, arranged as ${layoutText}.
- Equal panel sizes; consistent fonts and palette across panels.
- Each panel shows its own sub-title above it (only if non-empty).
- The overall caption appears once — centred between the rows OR above the grid, NEVER duplicated inside each panel.

Visual style:
- Pure white background (#FFFFFF). REMOVE every watermark, stamp, logo, site URL, page tint, or fold/scan artefact from the source — output looks like a fresh exam handout, not a marked-up download.
- Clean black axes, tick marks, light-grey gridlines (0.5px) — for bar / line / table panels.
- Pie slices labelled with their percentage value inside the slice, in dark text on light slices and white text on dark slices.
- Typography: Arial / sans-serif, crisp at small sizes. Sub-titles bold.
- Bar / line colours: Cambridge Press palette (#1f77b4 navy, #d62728 red, #2ca02c green, #ff7f0e orange, #9467bd purple) unless the spec supplies colours.
- Legend appears ONCE if all panels share the same legend (preferred). Per-panel legend only if panels differ.
- Output ONE composite image only. Do not add explanatory text outside the chart area.`;
  const r2 = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: drawPrompt }] }],
        generationConfig: { responseModalities: ['IMAGE'] }
      })
    }
  );
  if (!r2.ok) throw new Error(`flash-image-render http ${r2.status}: ${(await r2.text()).slice(0, 200)}`);
  const j2 = await r2.json();
  const cand2     = j2?.candidates?.[0];
  const respParts2 = cand2?.content?.parts || [];
  for (const p of respParts2) {
    if (p.inlineData?.data) {
      return {
        imageBase64: p.inlineData.data,
        mimeType:    p.inlineData.mimeType || 'image/png',
        spec,
        modelChain:  'gemini-2.5-pro → gemini-2.5-flash-image'
      };
    }
  }
  const textOut2 = respParts2.map((p: { text?: string }) => p?.text || '').join('').trim();
  const finish2  = cand2?.finishReason || 'NO_CANDIDATE';
  throw new Error(`flash-image-render returned no image (finish=${finish2})${textOut2 ? ' · response: ' + textOut2.slice(0, 200) : ''}`);
}

// ── Variant C: Real-ESRGAN via Replicate ─────────────────────────
// Generative models (variants A/B) shift digits because they're
// re-drawing. Real-ESRGAN is a non-generative super-resolution model
// — it upscales/denoises pixels without inventing new content, so
// numbers and labels stay byte-identical. No watermark removal, no
// restyling. Pure clarity pass.
//
// Cost: ~$0.002 per image (Replicate billed-time pricing, vs $0.04
// for a Flash Image call).
async function enhanceWithRealEsrgan(opts: {
  imageBase64:    string;
  mimeType:       string;
  replicateToken: string;
}): Promise<{ imageBase64: string; mimeType: string; modelChain: string }> {
  const dataUri = `data:${opts.mimeType};base64,${opts.imageBase64}`;
  // Use the official `models/<owner>/<name>/predictions` endpoint so
  // we don't have to track version hashes. Prefer: wait makes Replicate
  // block up to 60s and return the final status inline (synchronous
  // workflow that matches how variants A/B already behave).
  const resp = await fetch(
    'https://api.replicate.com/v1/models/nightmareai/real-esrgan/predictions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${opts.replicateToken}`,
        'Content-Type':  'application/json',
        'Prefer':        'wait=60'
      },
      body: JSON.stringify({
        input: {
          image:        dataUri,
          scale:        2,
          face_enhance: false
        }
      })
    }
  );
  if (!resp.ok) {
    const detail = (await resp.text()).slice(0, 300);
    if (resp.status === 402) {
      throw new Error('Replicate account has no credit. Add a card or buy credit at https://replicate.com/account/billing — Real-ESRGAN costs ~$0.002 per run.');
    }
    if (resp.status === 401) {
      throw new Error('Replicate token is invalid or revoked. Set a fresh token: replicate.com → Settings → API → Create a new token, then update Supabase secret REPLICATE_API_TOKEN.');
    }
    throw new Error(`replicate http ${resp.status}: ${detail}`);
  }
  const j = await resp.json();
  if (j.status === 'failed') {
    throw new Error(`replicate failed: ${j.error || 'unknown'}`);
  }
  if (j.status !== 'succeeded') {
    throw new Error(`replicate did not complete in 60s (status=${j.status}). Try again or fall back to variant A.`);
  }
  const outputUrl: string | undefined = Array.isArray(j.output) ? j.output[0] : j.output;
  if (!outputUrl) throw new Error('replicate returned no output URL');
  // Fetch the upscaled PNG and base64-encode for the JSON response.
  // Replicate output URLs are signed and expire in ~24h, so we MUST
  // re-host the bytes ourselves (the client uploads to GCS via the
  // existing _mmgIwUseEnhanced flow).
  const imgResp = await fetch(outputUrl);
  if (!imgResp.ok) throw new Error(`fetch result image http ${imgResp.status}`);
  const buf   = await imgResp.arrayBuffer();
  const bytes = new Uint8Array(buf);
  const CHUNK = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CHUNK)));
  }
  const outBase64 = btoa(binary);
  return {
    imageBase64: outBase64,
    mimeType:    imgResp.headers.get('content-type') || 'image/png',
    modelChain:  'nightmareai/real-esrgan'
  };
}

// ── IELTS Writing samples (scope=samples) ──────────────────────────
// Generates the full set of leveled sample answers for both tasks in
// a single Pro call:
//   task1.sampleAnswer / sampleBand5..9 / uzSampleBand5..9
//   task2.sampleAnswer / sampleBand5..9 / uzSampleBand5..9
// Returns whatever subset Pro could produce; the client merges into
// existing samples (never overwrites a field the admin already wrote).
async function generateIeltsWritingSamples(opts: {
  task1Prompt:        string;
  task1Instruction?:  string;
  task1ChartFile?:    { mime: string; base64: string };
  task2Prompt:        string;
  task2Instruction?:  string;
  bands:              number[];           // which leveled samples to produce (e.g. [7,9])
  includeUzbek:       boolean;            // include uzSampleBandN for each band
  includeMain:        boolean;            // include sampleAnswer (Band 8 model)
  geminiKey:          string;
}): Promise<{ samples: any; modelUsed: string }> {
  const { task1Prompt, task1Instruction, task1ChartFile, task2Prompt, task2Instruction, bands, includeUzbek, includeMain, geminiKey } = opts;

  // Build a dynamic per-task shape based on what the admin actually ticked.
  // Pro generates only what we describe, so unticked slots cost nothing.
  const wordTarget = (which: 'task1' | 'task2') => which === 'task1' ? '~150 words' : '~250 words';
  const fieldDesc = (band: number) => {
    const descByBand: Record<number, string> = {
      5: 'faithfully demonstrating Band 5 issues: limited vocab, frequent grammar errors, simple structures, basic linking',
      6: 'Band 6: clear overall but with errors, mostly accurate data, some range of vocab and grammar',
      7: 'Band 7: well-organised, accurate, good range with occasional slip-ups',
      8: 'Band 8: precise, sophisticated, well-developed, near-flawless',
      9: 'Band 9: expert use of language, fully accurate, naturally varied'
    };
    return descByBand[band] || `Band ${band}`;
  };
  const taskShape = (which: 'task1' | 'task2'): string => {
    const lines: string[] = ['  "' + which + '": {'];
    if (includeMain) {
      lines.push(`    "sampleAnswer":  string,   // ${wordTarget(which)}, polished model answer (Band 8 target)`);
    }
    bands.forEach(b => {
      lines.push(`    "sampleBand${b}":  string,   // ${wordTarget(which)}, ${fieldDesc(b)}`);
    });
    if (includeUzbek) {
      bands.forEach(b => {
        lines.push(`    "uzSampleBand${b}": string,  // Uzbek translation of sampleBand${b} (preserve the level — do not polish a Band 5 essay into Band 9 Uzbek prose)`);
      });
    }
    // Trim trailing comma on the last field line
    if (lines.length > 1) {
      lines[lines.length - 1] = lines[lines.length - 1].replace(/,(\s*\/\/[^\n]*)?\s*$/, '$1');
    }
    lines.push('  }');
    return lines.join('\n');
  };
  const tasksRequested: string[] = [];
  if (task1Prompt) tasksRequested.push('task1');
  if (task2Prompt) tasksRequested.push('task2');

  const promptText = `You are a senior IELTS examiner generating sample answers for a Writing test. Output ONLY a JSON object (no prose, no markdown fence).

Required shape (produce ONLY these keys — do not invent extras):
{
${tasksRequested.map(t => taskShape(t as 'task1' | 'task2')).join(',\n')}
}

IELTS band conventions to honour:
- Band 5 ≠ deliberately broken English. It's a real student who's working hard but makes systematic errors with tense, articles, word choice, and complex grammar. Word count near 150 / 250.
- Band 6 ≈ clear and on-topic; tense errors, some awkward collocations, occasional underdevelopment.
- Band 7 ≈ well-developed, mostly accurate, good range; minor slips.
- Band 8 ≈ precise, sophisticated lexical choices, full range of structures with very few errors.
- Band 9 ≈ effortless command, fully integrated argumentation, idiomatic vocabulary.

Task 1 specifics:
- Describe the chart factually. Open with a paraphrased question (overview sentence), then group + compare key features.
- DO NOT invent numbers — use only what is shown in the chart image (if provided) or referenced in the prompt.
- Avoid personal opinion; keep it descriptive.

Task 2 specifics:
- Take a clear position appropriate to the question type (opinion / discussion / problem-solution / advantage-disadvantage / two-part).
- Introduction → 2 body paragraphs → conclusion. Strong topic sentences.
- Examples should be plausible, not exaggerated.

Uzbek translations:
- Translate the corresponding English Band-N text faithfully into modern, natural Uzbek (Latin script). Preserve the writer's level — DON'T polish a Band 5 essay into Band 9 Uzbek prose. If the English makes a grammar mistake, render it naturally as a beginner-level Uzbek learner might write it (but keep it readable).

INPUT:
Task 1 instruction: ${task1Instruction || '(use the standard IELTS Task 1 rubric)'}
Task 1 prompt: ${task1Prompt || '(empty)'}

Task 2 instruction: ${task2Instruction || '(use the standard IELTS Task 2 rubric)'}
Task 2 prompt: ${task2Prompt || '(empty)'}
${task1ChartFile ? '\n[Task 1 chart image follows — use it as the source of truth for all numbers and labels in Task 1 samples]' : ''}`;

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: promptText }
  ];
  if (task1ChartFile && task1ChartFile.base64) {
    parts.push({ inlineData: { mimeType: task1ChartFile.mime, data: task1ChartFile.base64 } });
  }

  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature:      0.4,
          responseMimeType: 'application/json',
          maxOutputTokens:  32768,
          thinkingConfig:   { thinkingBudget: 4096 }
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
        ]
      })
    }
  );
  if (!r.ok) throw new Error(`samples http ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  const cand = j?.candidates?.[0];
  const raw  = cand?.content?.parts?.map((p: { text?: string }) => p?.text || '').join('') || '';
  if (!raw.trim()) {
    const finish    = cand?.finishReason || 'NO_CANDIDATE';
    const safetyHit = (cand?.safetyRatings || []).find((s: { blocked?: boolean }) => s.blocked);
    const safetyTxt = safetyHit ? ` · safety blocked: ${(safetyHit as { category?: string }).category}` : '';
    throw new Error(`samples returned empty text (finish=${finish}${safetyTxt})`);
  }
  let parsed: any;
  try { parsed = JSON.parse(raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')); }
  catch (e) { throw new Error(`samples JSON parse failed: ${(e as Error).message} — raw: ${raw.slice(0, 200)}`); }

  // Whitelist the keys we expect — drops any extras Pro might invent.
  // Built from the actual selection so nothing outside the asked-for
  // slots leaks into the saved mock_data.
  const wantedFields: string[] = [];
  if (includeMain) wantedFields.push('sampleAnswer');
  bands.forEach(b => wantedFields.push('sampleBand' + b));
  if (includeUzbek) bands.forEach(b => wantedFields.push('uzSampleBand' + b));
  const pickTask = (t: any) => {
    const out: Record<string, string> = {};
    if (t && typeof t === 'object') {
      for (const k of wantedFields) {
        if (typeof t[k] === 'string' && t[k].trim()) out[k] = String(t[k]).trim();
      }
    }
    return out;
  };
  return {
    samples: {
      task1: tasksRequested.includes('task1') ? pickTask(parsed.task1) : {},
      task2: tasksRequested.includes('task2') ? pickTask(parsed.task2) : {}
    },
    modelUsed: 'gemini-2.5-pro'
  };
}

// ── IELTS Writing topical vocabulary (scope=vocab) ─────────────────
// Generates a list of useful EN↔UZ pairs tied to one task's prompt
// and (for T1) the chart image. Default count 20.
async function generateIeltsWritingVocab(opts: {
  taskKey:      'task1' | 'task2';
  prompt:       string;
  count:        number;
  chartFile?:   { mime: string; base64: string };
  geminiKey:    string;
}): Promise<{ vocabulary: Array<{ en: string; uz: string }>; modelUsed: string }> {
  const { taskKey, prompt, count, chartFile, geminiKey } = opts;
  const isT1 = taskKey === 'task1';
  const promptText = `You are an IELTS Writing tutor curating a vocabulary list for a Band 6-8 student preparing for the following ${isT1 ? 'Task 1 chart description' : 'Task 2 essay'}. Output ONLY a JSON object — no prose, no markdown fence.

Shape:
{ "vocabulary": [ { "en": string, "uz": string }, ... ] }

Requirements:
- Exactly ${count} entries.
- Topical: every entry must be useful for THIS specific prompt's subject matter, NOT generic IELTS filler.
- Mix of single words, collocations, and short phrases (2-4 words). Bias toward collocations and chunks, which is what raises a student's lexical band.
- Each en entry should be the EXACT form a student would write (e.g. "to constitute the majority", "labour force participation"). Avoid bare nouns unless they're genuinely useful in isolation.
- Each uz entry should be a natural modern-Uzbek translation in Latin script. Use the form that fits the en collocation grammatically.
${isT1 ? '- For T1 lean toward data-description phrases (trends, comparisons, percentages, units, time markers).' : '- For T2 include opinion/argument language (concession, cause/effect, exemplification, evaluation) plus topic-specific terms.'}
- No duplicates. No hex codes or rgb() values. No emojis.

INPUT:
Task: ${isT1 ? 'IELTS Writing Task 1' : 'IELTS Writing Task 2'}
Prompt: ${prompt || '(empty)'}
${chartFile ? '\n[Task 1 chart image follows — use it to ground the vocabulary in the actual data shown]' : ''}`;

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: promptText }
  ];
  if (chartFile && chartFile.base64) {
    parts.push({ inlineData: { mimeType: chartFile.mime, data: chartFile.base64 } });
  }

  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature:      0.55,
          responseMimeType: 'application/json',
          maxOutputTokens:  4096,
          thinkingConfig:   { thinkingBudget: 1024 }
        }
      })
    }
  );
  if (!r.ok) throw new Error(`vocab http ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  const cand = j?.candidates?.[0];
  const raw  = cand?.content?.parts?.map((p: { text?: string }) => p?.text || '').join('') || '';
  if (!raw.trim()) {
    const finish = cand?.finishReason || 'NO_CANDIDATE';
    throw new Error(`vocab returned empty text (finish=${finish})`);
  }
  let parsed: any;
  try { parsed = JSON.parse(raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')); }
  catch (e) { throw new Error(`vocab JSON parse failed: ${(e as Error).message} — raw: ${raw.slice(0, 200)}`); }

  const seen = new Set<string>();
  const list: Array<{ en: string; uz: string }> = [];
  const arr = Array.isArray(parsed?.vocabulary) ? parsed.vocabulary : [];
  for (const row of arr) {
    if (!row || typeof row !== 'object') continue;
    const en = String(row.en || '').trim();
    const uz = String(row.uz || '').trim();
    if (!en || !uz) continue;
    const key = en.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    list.push({ en, uz });
  }
  return { vocabulary: list, modelUsed: 'gemini-2.5-pro' };
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
  if (examType !== 'cefr-reading' && examType !== 'ielts-reading' && examType !== 'ielts-listening' && examType !== 'cefr-listening' && examType !== 'ielts-writing' && examType !== 'cefr-writing') {
    return json(400, { error: 'bad_exam_type', detail: 'expected "cefr-reading", "ielts-reading", "ielts-listening", "cefr-listening", or "ielts-writing"' });
  }
  // IELTS Writing supports per-task import (scope=passage) for full
  // structural extraction, scope=tags for the Settings-tab auto-tag
  // button, and scope=find-source for the Gemini-grounded source
  // attribution lookup. Full-mock auto-import doesn't make sense for
  // two free-response tasks — reject any other scope.
  if (examType === 'ielts-writing') {
    const _iwScope = (body.scope || 'full').toString();
    const _iwOk = ['passage','tags','find-source','enhance-chart','samples','vocab'];
    if (!_iwOk.includes(_iwScope)) {
      return json(400, { error: 'bad_scope', detail: 'IELTS Writing supports scope: ' + _iwOk.map(s => '"' + s + '"').join(' / ') + '. Got "' + _iwScope + '".' });
    }
  }
  if (examType === 'cefr-writing') {
    const _cwScope = (body.scope || 'tags').toString();
    const _cwOk = ['tags','passage','full','samples','vocab'];
    if (!_cwOk.includes(_cwScope)) {
      return json(400, { error: 'bad_scope', detail: 'CEFR Writing supports scope: ' + _cwOk.map(s => '"' + s + '"').join(' / ') + '. Got "' + _cwScope + '".' });
    }
  }

  // ── PASSAGE scope (CEFR Writing only): single-task extraction from
  //    one or more screenshots OR pasted text. passage_index is 1-based
  //    (1 = T1.1, 2 = T1.2, 3 = T2). Returns mock_data = { title,
  //    target, prompt } so the client slots it into mock_data.tasks[…].
  if ((body.scope || '').toString() === 'passage' && examType === 'cefr-writing') {
    const idx1 = Number(body.passage_index) || 0;
    if (idx1 < 1 || idx1 > 3) {
      return json(400, { error: 'bad_passage_index', detail: 'cefr-writing scope=passage requires passage_index ∈ {1,2,3}.' });
    }
    const incomingFiles = (Array.isArray(body.files) ? body.files : []) as FileItem[];
    const testFiles = incomingFiles.filter(f => (f.group || 'test') === 'test');
    const notesText = String(body.notes || '').trim();
    if (testFiles.length === 0 && notesText.length < 20) {
      return json(400, { error: 'no_source', detail: 'cefr-writing scope=passage requires at least one screenshot OR pasted task text (≥20 chars) in notes.' });
    }
    try {
      const result = await generateCefrWritingTask({
        taskIndex: (idx1 - 1) as 0 | 1 | 2,
        files:     testFiles,
        notes:     notesText,
        geminiKey: GEMINI_KEY
      });
      return json(200, {
        mock_data:       result.task,
        model_used:      result.modelUsed,
        fallback_reason: result.fallbackReason,
        actor:           (auth as AuthOk).actor
      });
    } catch (e) {
      return json(502, {
        error:  'cefr_writing_task_failed',
        detail: e instanceof Error ? e.message : String(e)
      });
    }
  }

  // ── FULL scope (CEFR Writing): whole-mock extraction from screenshots
  //    OR pasted text. Returns the full mock_data shell covering all
  //    three tasks + part1.topic + auto-tagged chips + targetLevel.
  //    Samples are NOT generated here — admin uses the Samples tab.
  if ((body.scope || '').toString() === 'full' && examType === 'cefr-writing') {
    const incomingFiles = (Array.isArray(body.files) ? body.files : []) as FileItem[];
    const testFiles = incomingFiles.filter(f => (f.group || 'test') === 'test');
    const notesText = String(body.notes || '').trim();
    if (testFiles.length === 0 && notesText.length < 20) {
      return json(400, { error: 'no_source', detail: 'cefr-writing scope=full requires at least one screenshot OR pasted task text (≥20 chars) in notes.' });
    }
    try {
      const result = await generateCefrWritingFull({
        files:     testFiles,
        notes:     notesText,
        geminiKey: GEMINI_KEY
      });
      return json(200, {
        mock_data:       result.mockData,
        model_used:      result.modelUsed,
        fallback_reason: result.fallbackReason,
        actor:           (auth as AuthOk).actor
      });
    } catch (e) {
      return json(502, {
        error:  'cefr_writing_full_failed',
        detail: e instanceof Error ? e.message : String(e)
      });
    }
  }

  // ── SAMPLES scope (CEFR Writing): Gemini-generated sample answers
  //    for the ticked levels × tasks. Returns { samples: { t11: {…},
  //    t12: {…}, t2: {…} } } where each task object only contains
  //    the requested level slots (sample / sampleA1 / sampleA2 /
  //    sampleB1 / sampleB2 + uz variants). Empty slots aren't filled.
  if ((body.scope || '').toString() === 'samples' && examType === 'cefr-writing') {
    const levels       = Array.isArray(body.levels) ? body.levels.filter((l: unknown) => typeof l === 'string') : [];
    const includeUzbek = !!body.include_uzbek;
    const includeMain  = !!body.include_main;
    const t11Prompt    = String(body.t11_prompt || '').trim();
    const t12Prompt    = String(body.t12_prompt || '').trim();
    const t2Prompt     = String(body.t2_prompt  || '').trim();
    const p1Context    = String(body.p1_context  || '').trim();
    const p1Scenario   = String(body.p1_scenario || '').trim();
    const t2Genre      = String(body.t2_genre    || '').trim();
    if (!t11Prompt && !t12Prompt && !t2Prompt) {
      return json(400, { error: 'no_prompts', detail: 'cefr-writing scope=samples needs at least one of t11_prompt / t12_prompt / t2_prompt.' });
    }
    if (!levels.length && !includeMain) {
      return json(400, { error: 'no_slots', detail: 'cefr-writing scope=samples needs at least one level (A1/A2/B1/B2) or include_main=true.' });
    }
    try {
      const result = await generateCefrWritingSamples({
        levels,
        includeUzbek,
        includeMain,
        t11Prompt,
        t12Prompt,
        t2Prompt,
        p1Context,
        p1Scenario,
        t2Genre,
        geminiKey: GEMINI_KEY
      });
      return json(200, {
        samples:         result.samples,
        model_used:      result.modelUsed,
        fallback_reason: result.fallbackReason,
        actor:           (auth as AuthOk).actor
      });
    } catch (e) {
      return json(502, {
        error:  'cefr_writing_samples_failed',
        detail: e instanceof Error ? e.message : String(e)
      });
    }
  }

  // ── VOCAB scope (CEFR Writing): Gemini-generated topical EN↔UZ
  //    vocabulary list for one task. Returns { vocabulary: [{en, uz}] }.
  if ((body.scope || '').toString() === 'vocab' && examType === 'cefr-writing') {
    const taskKey = String(body.task_key || '').trim();
    if (taskKey !== 't11' && taskKey !== 't12' && taskKey !== 't2') {
      return json(400, { error: 'bad_task_key', detail: 'cefr-writing scope=vocab needs task_key ∈ {t11,t12,t2}.' });
    }
    const taskPrompt = String(body.prompt || '').trim();
    if (!taskPrompt) {
      return json(400, { error: 'no_prompt', detail: 'cefr-writing scope=vocab needs the active task prompt.' });
    }
    const count = Math.max(5, Math.min(60, Number(body.count) || 20));
    const p1Context  = String(body.p1_context  || '').trim();
    const p1Scenario = String(body.p1_scenario || '').trim();
    try {
      const result = await generateCefrWritingVocab({
        taskKey:  taskKey as 't11' | 't12' | 't2',
        prompt:   taskPrompt,
        p1Context,
        p1Scenario,
        count,
        geminiKey: GEMINI_KEY
      });
      return json(200, {
        vocabulary:      result.vocabulary,
        model_used:      result.modelUsed,
        fallback_reason: result.fallbackReason,
        actor:           (auth as AuthOk).actor
      });
    } catch (e) {
      return json(502, {
        error:  'cefr_writing_vocab_failed',
        detail: e instanceof Error ? e.message : String(e)
      });
    }
  }

  // IELTS Listening import is now fully wired (see buildPrompt's
  // ieltsListeningTypeGuide rule 11). Single shared code path with reading.

  // ── FIND-SOURCE scope (IELTS Writing only): Gemini-grounded
  //    lookup. Uses Google Search to find the most likely
  //    source/attribution + real-exam date for a given pair of
  //    Task 1 + Task 2 prompts. Returns null + low confidence when
  //    the prompts don't appear together in any indexed source.
  if ((body.scope || '').toString() === 'find-source' && examType === 'ielts-writing') {
    const t1Prompt = String(body.task1_prompt || '').trim();
    const t2Prompt = String(body.task2_prompt || '').trim();
    if (!t1Prompt && !t2Prompt) {
      return json(400, { error: 'no_prompts', detail: 'scope=find-source requires at least one of task1_prompt / task2_prompt.' });
    }
    try {
      const result = await findIeltsWritingSource({
        task1Prompt: t1Prompt,
        task2Prompt: t2Prompt,
        geminiKey:   GEMINI_KEY
      });
      return json(200, {
        source:     result.source,
        examDate:   result.examDate,
        confidence: result.confidence,
        notes:      result.notes,
        actor:      (auth as AuthOk).actor
      });
    } catch (e) {
      return json(502, {
        error:  'find_source_failed',
        detail: e instanceof Error ? e.message : String(e)
      });
    }
  }

  // ── ENHANCE-CHART scope (IELTS Writing only) ───────────────────────
  // Cleans up a Task 1 chart screenshot in one of three modes:
  //   • visual     — Flash Image polishes pixels (generative)
  //   • rerender   — Pro extracts spec → Flash Image redraws (generative)
  //   • realesrgan — Real-ESRGAN via Replicate upscales non-generatively
  //                  (no digit drift, no watermark removal)
  if ((body.scope || '').toString() === 'enhance-chart' && examType === 'ielts-writing') {
    const enhanceMode = (body.mode || 'visual').toString();
    if (enhanceMode !== 'visual' && enhanceMode !== 'rerender' && enhanceMode !== 'realesrgan') {
      return json(400, { error: 'bad_mode', detail: 'scope=enhance-chart requires mode: "visual" | "rerender" | "realesrgan". Got "' + enhanceMode + '".' });
    }
    const incomingFiles = (Array.isArray(body.files) ? body.files : []) as FileItem[];
    const img = incomingFiles[0];
    if (!img || !img.base64 || !img.mime) {
      return json(400, { error: 'no_chart', detail: 'scope=enhance-chart requires files[0] = { base64, mime, name } for the chart image to enhance.' });
    }
    try {
      let result;
      if (enhanceMode === 'realesrgan') {
        const replicateToken = Deno.env.get('REPLICATE_API_TOKEN') || '';
        if (!replicateToken) {
          return json(503, {
            error:  'replicate_token_missing',
            detail: 'Variant C needs REPLICATE_API_TOKEN set as a Supabase Edge Function secret. Get a token from replicate.com → Settings → API and run `npx supabase secrets set REPLICATE_API_TOKEN=<token> --project-ref zknyukkbtbcqgvkgjktb`.',
            mode:   enhanceMode
          });
        }
        result = await enhanceWithRealEsrgan({
          imageBase64:    img.base64,
          mimeType:       img.mime,
          replicateToken
        });
      } else {
        const chartTypeHint = body.chart_type_hint ? String(body.chart_type_hint) : undefined;
        result = await enhanceIeltsChart({
          imageBase64:   img.base64,
          mimeType:      img.mime,
          mode:          enhanceMode as 'visual' | 'rerender',
          chartTypeHint,
          geminiKey:     GEMINI_KEY
        });
      }
      return json(200, {
        imageBase64: result.imageBase64,
        mimeType:    result.mimeType,
        spec:        (result as { spec?: unknown }).spec,
        modelChain:  result.modelChain,
        mode:        enhanceMode,
        actor:       (auth as AuthOk).actor
      });
    } catch (e) {
      return json(502, {
        error:  'enhance_chart_failed',
        detail: e instanceof Error ? e.message : String(e),
        mode:   enhanceMode
      });
    }
  }

  // ── SAMPLES scope (IELTS Writing only): generate Band 5-9 EN + Uz
  //    for both tasks in a single Pro call. ~$0.20-0.40, ~60-90s.
  if ((body.scope || '').toString() === 'samples' && examType === 'ielts-writing') {
    const t1Prompt = String(body.task1_prompt || '').trim();
    const t2Prompt = String(body.task2_prompt || '').trim();
    if (!t1Prompt && !t2Prompt) {
      return json(400, { error: 'no_prompts', detail: 'scope=samples requires at least one of task1_prompt / task2_prompt.' });
    }
    const incomingFiles = (Array.isArray(body.files) ? body.files : []) as FileItem[];
    const chartFile = incomingFiles[0] && incomingFiles[0].base64 ? { mime: incomingFiles[0].mime, base64: incomingFiles[0].base64 } : undefined;
    // Sanitise the band selection so we never burn tokens on garbage
    // input (e.g. body.bands = [11, "x", -2]). Default falls back to
    // the full 5-9 set to preserve callers that don't pass anything.
    const rawBands = Array.isArray(body.bands) ? body.bands : [5, 6, 7, 8, 9];
    const bands = Array.from(new Set(
      rawBands.map((b: unknown) => parseInt(String(b), 10)).filter((b: number) => [5,6,7,8,9].includes(b))
    )).sort();
    if (!bands.length) {
      return json(400, { error: 'no_bands', detail: 'scope=samples requires bands to be a non-empty subset of [5,6,7,8,9].' });
    }
    const includeUzbek = body.include_uzbek !== false;        // default true (backward compat)
    const includeMain  = !!body.include_main;                  // default false
    try {
      const result = await generateIeltsWritingSamples({
        task1Prompt:       t1Prompt,
        task1Instruction:  body.task1_instruction ? String(body.task1_instruction) : undefined,
        task1ChartFile:    chartFile,
        task2Prompt:       t2Prompt,
        task2Instruction:  body.task2_instruction ? String(body.task2_instruction) : undefined,
        bands,
        includeUzbek,
        includeMain,
        geminiKey:         GEMINI_KEY
      });
      return json(200, {
        samples:    result.samples,
        model_used: result.modelUsed,
        actor:      (auth as AuthOk).actor
      });
    } catch (e) {
      return json(502, {
        error:  'samples_failed',
        detail: e instanceof Error ? e.message : String(e)
      });
    }
  }

  // ── VOCAB scope (IELTS Writing only): generate ~20 EN↔UZ pairs for
  //    one task. ~$0.05, ~10-15s.
  if ((body.scope || '').toString() === 'vocab' && examType === 'ielts-writing') {
    const taskKey = String(body.task_key || '').trim();
    if (taskKey !== 'task1' && taskKey !== 'task2') {
      return json(400, { error: 'bad_task_key', detail: 'scope=vocab requires task_key: "task1" | "task2".' });
    }
    const prompt = String(body.prompt || '').trim();
    if (!prompt) {
      return json(400, { error: 'no_prompt', detail: 'scope=vocab requires the task prompt in body.prompt.' });
    }
    const count = Math.min(60, Math.max(5, Number(body.count) || 20));
    const incomingFiles = (Array.isArray(body.files) ? body.files : []) as FileItem[];
    const chartFile = (taskKey === 'task1' && incomingFiles[0] && incomingFiles[0].base64)
      ? { mime: incomingFiles[0].mime, base64: incomingFiles[0].base64 }
      : undefined;
    try {
      const result = await generateIeltsWritingVocab({
        taskKey,
        prompt,
        count,
        chartFile,
        geminiKey: GEMINI_KEY
      });
      return json(200, {
        task_key:   taskKey,
        vocabulary: result.vocabulary,
        model_used: result.modelUsed,
        actor:      (auth as AuthOk).actor
      });
    } catch (e) {
      return json(502, {
        error:  'vocab_failed',
        detail: e instanceof Error ? e.message : String(e)
      });
    }
  }

  // ── TAGS scope (IELTS Writing only): one-click auto-tag flow ─────
  // Sends Gemini the existing task1/task2 prompts (plus an optional
  // T1 chart image) and asks for just the picker-filter fields back:
  //   task1.title / chartType / dataNature
  //   task2.title / essayType
  // The handler does NOT touch prompts, instructions, word goals,
  // chart images, or sample answers — admin runs this on a mock that
  // already has prompts filled in and just wants the tags inferred.
  if ((body.scope || '').toString() === 'tags' && examType === 'ielts-writing') {
    const t1Prompt = String(body.task1_prompt || '').trim();
    const t2Prompt = String(body.task2_prompt || '').trim();
    if (!t1Prompt && !t2Prompt) {
      return json(400, { error: 'no_prompts', detail: 'scope=tags requires at least one of task1_prompt / task2_prompt to be non-empty.' });
    }
    const chartFiles = (Array.isArray(body.files) ? body.files : []) as FileItem[];
    try {
      const result = await generateIeltsWritingTags({
        task1Prompt: t1Prompt,
        task2Prompt: t2Prompt,
        chartFile:   chartFiles.find(f => f && f.mime && f.mime.startsWith('image/')) || null,
        geminiKey:   GEMINI_KEY
      });
      return json(200, {
        tags:           result.tags,
        model_used:     result.modelUsed,
        fallback_reason: result.fallbackReason || undefined,
        actor:           (auth as AuthOk).actor
      });
    } catch (e) {
      return json(502, {
        error:  'tags_failed',
        detail: e instanceof Error ? e.message : String(e)
      });
    }
  }

  // ── TAGS scope (CEFR Writing): three-task auto-tag flow ──────────
  // Reads t11 / t12 / t2 prompts (+ optional p1_context / p1_scenario)
  // and emits Part 1 shared topic + per-task register tags + Part 2
  // topic+genre + topics[] + targetLevel. Does NOT touch prompts /
  // samples — admin reviews + edits + saves.
  if ((body.scope || '').toString() === 'tags' && examType === 'cefr-writing') {
    const t11p = String(body.t11_prompt || '').trim();
    const t12p = String(body.t12_prompt || '').trim();
    const t2p  = String(body.t2_prompt  || '').trim();
    if (!t11p && !t12p && !t2p) {
      return json(400, { error: 'no_prompts', detail: 'scope=tags (cefr-writing) requires at least one of t11_prompt / t12_prompt / t2_prompt.' });
    }
    try {
      const result = await generateCefrWritingTags({
        t11Prompt:   t11p,
        t12Prompt:   t12p,
        t2Prompt:    t2p,
        p1Context:   body.p1_context  ? String(body.p1_context)  : undefined,
        p1Scenario:  body.p1_scenario ? String(body.p1_scenario) : undefined,
        geminiKey:   GEMINI_KEY
      });
      return json(200, {
        tags:            result.tags,
        model_used:      result.modelUsed,
        fallback_reason: result.fallbackReason || undefined,
        actor:           (auth as AuthOk).actor
      });
    } catch (e) {
      return json(502, {
        error:  'tags_failed',
        detail: e instanceof Error ? e.message : String(e)
      });
    }
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
    :  examType === 'ielts-writing'   ? IELTS_WRITING_SINGLE_TASK_SHAPE
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
          : examType === 'ielts-writing'
            ? (() => {
                // IELTS Writing per-task shape: just a flat object with
                // "prompt" (required). chartType / essayType / dataNature
                // are optional per the schema — admin can fix any missing
                // field manually.
                const md = mockData as Record<string, unknown>;
                return typeof md.prompt === 'string' && md.prompt.length > 0;
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
        detail:          'expected a single ' + (examType === 'ielts-reading' ? 'passage' : (examType === 'ielts-listening' || examType === 'cefr-listening') ? 'part' : examType === 'ielts-writing' ? 'task' : 'part') + ' object',
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
