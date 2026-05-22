// generate-channel-quizzes
// -----------------------------------------------------------------------------
// Generates N CEFR-level quiz questions for a given grammar/vocab topic via
// Gemini structured-JSON output, inserts them as pending rows with a shared
// batch_id, then DMs the admin with a button to open the batch in the bot.
//
// Body: { level: 'A2'|'B1'|'B2'|'C1'|'C2', topic: string, count: number,
//         requested_by_chat_id?: number }
//
// verify_jwt: false — invoked from news-bot-webhook with the service role key.
// -----------------------------------------------------------------------------

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const jerr = (s: number, c: string, d?: string) => new Response(JSON.stringify({ error: c, detail: d ?? null }), { status: s, headers: { 'Content-Type': 'application/json', ...CORS } });
const jok = (b: unknown) => new Response(JSON.stringify(b), { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });

const VALID_LEVELS = ['A2', 'B1', 'B2', 'C1', 'C2'];
const MAX_COUNT = 30;

// Telegram poll API limits — we tell Gemini and validate on insert.
const POLL_QUESTION_MAX = 300;
const POLL_OPTION_MAX   = 100;
const POLL_EXPLAIN_MAX  = 200;

type QuizItem = {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
};

async function geminiQuizzes(level: string, topic: string, count: number, apiKey: string): Promise<QuizItem[]> {
  const prompt =
    `Generate ${count} multiple-choice quiz questions for English learners at CEFR level ${level}.\n` +
    `Topic: ${topic}\n\n` +
    `Rules:\n` +
    `- Each question MUST have exactly 4 options.\n` +
    `- Exactly one option is correct (correct_index is 0-based, 0..3).\n` +
    `- Question text: max ${POLL_QUESTION_MAX} characters, plain text, no markdown.\n` +
    `- Each option: max ${POLL_OPTION_MAX} characters, plain text.\n` +
    `- Explanation: max ${POLL_EXPLAIN_MAX} characters, briefly justify the correct answer.\n` +
    `- Difficulty MUST match CEFR ${level} — vocabulary, grammar complexity, and idioms appropriate to that level.\n` +
    `- Vary question patterns across the set (gap-fill, identify the correct form, choose the synonym, etc.) when applicable to the topic.\n` +
    `- Do not repeat the same correct option text across questions; vary the correct_index across the set.\n` +
    `- Do not number the questions; do not include "Q1:" prefixes.\n`;

  const responseSchema = {
    type: 'OBJECT',
    properties: {
      quizzes: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            question:      { type: 'STRING' },
            options:       { type: 'ARRAY', items: { type: 'STRING' } },
            correct_index: { type: 'INTEGER' },
            explanation:   { type: 'STRING' },
          },
          required: ['question', 'options', 'correct_index', 'explanation'],
        },
      },
    },
    required: ['quizzes'],
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        responseMimeType: 'application/json',
        responseSchema,
        maxOutputTokens: 8000,
      },
    }),
  });
  if (!resp.ok) throw new Error(`Gemini error ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned empty quiz JSON');
  let parsed: any;
  try { parsed = JSON.parse(text); } catch { throw new Error('Gemini quiz JSON parse failed: ' + text.slice(0, 200)); }
  const list = parsed?.quizzes;
  if (!Array.isArray(list) || list.length === 0) throw new Error('Gemini returned no quizzes');
  return list as QuizItem[];
}

function validateQuiz(q: QuizItem): string | null {
  if (!q.question || typeof q.question !== 'string') return 'missing question';
  if (q.question.length > POLL_QUESTION_MAX) return 'question too long';
  if (!Array.isArray(q.options) || q.options.length !== 4) return 'options must be exactly 4';
  if (q.options.some((o) => typeof o !== 'string' || !o.length || o.length > POLL_OPTION_MAX)) return 'invalid option';
  if (!Number.isInteger(q.correct_index) || q.correct_index < 0 || q.correct_index > 3) return 'invalid correct_index';
  if (typeof q.explanation !== 'string') return 'missing explanation';
  if (q.explanation.length > POLL_EXPLAIN_MAX) return 'explanation too long';
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST')   return jerr(405, 'method_not_allowed');

  let body: any = {};
  try { body = await req.json(); } catch { return jerr(400, 'bad_json'); }

  const level = typeof body.level === 'string' ? body.level.toUpperCase() : '';
  const topic = typeof body.topic === 'string' ? body.topic.trim() : '';
  const count = typeof body.count === 'number' ? Math.floor(body.count) : 0;
  const requestedByChatId = typeof body.requested_by_chat_id === 'number' ? body.requested_by_chat_id : null;

  if (!VALID_LEVELS.includes(level)) return jerr(400, 'invalid_level', VALID_LEVELS.join(','));
  if (!topic) return jerr(400, 'missing_topic');
  if (count < 1 || count > MAX_COUNT) return jerr(400, 'invalid_count', `1..${MAX_COUNT}`);

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return jerr(500, 'gemini_api_key_unset');

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Generate
  let quizzes: QuizItem[];
  try { quizzes = await geminiQuizzes(level, topic, count, apiKey); }
  catch (e) { return jerr(500, 'generation_failed', String((e as Error).message || e)); }

  // Take up to `count` valid items (Gemini may over- or under-shoot)
  const valid: QuizItem[] = [];
  const skipped: { idx: number; reason: string }[] = [];
  for (let i = 0; i < quizzes.length && valid.length < count; i++) {
    const reason = validateQuiz(quizzes[i]);
    if (reason) { skipped.push({ idx: i, reason }); continue; }
    valid.push(quizzes[i]);
  }

  if (valid.length === 0) return jerr(500, 'all_quizzes_invalid', JSON.stringify(skipped));

  const batchId = crypto.randomUUID();
  const rows = valid.map((q) => ({
    kind: 'quiz',
    batch_id: batchId,
    topic: 'quiz_' + level.toLowerCase(),
    text_content: q.question,           // legacy field — keep populated for indexing
    quiz_question: q.question,
    quiz_options: q.options,
    quiz_correct_index: q.correct_index,
    quiz_explanation: q.explanation,
    quiz_level: level,
    quiz_topic: topic,
    status: 'pending',
    scheduled_for: new Date().toISOString(),
  }));

  const { data: inserted, error: insErr } = await supabase
    .from('channel_posts')
    .insert(rows)
    .select('id');
  if (insErr) return jerr(500, 'insert_failed', insErr.message);

  // Notify the admin via the news bot so they can review without leaving Telegram.
  const { data: settings } = await supabase
    .from('channel_post_settings')
    .select('admin_chat_id')
    .eq('id', 1)
    .maybeSingle();
  const dmChatId = requestedByChatId || settings?.admin_chat_id || null;
  const botToken = Deno.env.get('TELEGRAM_NEWS_BOT_TOKEN');
  if (dmChatId && botToken) {
    const text =
      `✅ Batch ready\n\n` +
      `Level: ${level}\n` +
      `Topic: ${topic}\n` +
      `Generated: ${valid.length}/${count}` +
      (skipped.length ? ` (${skipped.length} skipped — invalid output)` : '');
    const reply_markup = {
      inline_keyboard: [
        [{ text: '📋 Review batch', callback_data: `m:qb:view:${batchId}:0` }],
        [
          { text: '✅ Approve all', callback_data: `m:qb:approve_all:${batchId}` },
          { text: '❌ Reject all', callback_data: `m:qb:reject_all:${batchId}` },
        ],
      ],
    };
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: dmChatId, text, reply_markup }),
    }).catch((e) => console.warn('[generate-channel-quizzes] DM failed:', e));
  }

  return jok({ ok: true, batch_id: batchId, generated: valid.length, requested: count, skipped: skipped.length });
});
