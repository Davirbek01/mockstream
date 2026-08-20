// =====================================================================
// Supabase Edge Function: ai-credit-watch
// ---------------------------------------------------------------------
// Tells the admin the moment an AI lane stops accepting work, instead of
// letting students find out for him.
//
// When the credit runs out nothing breaks visibly: the platform keeps
// taking submissions and the provider keeps refusing them. DeepSeek
// answered HTTP 402 to 5,988 calls from 187 students between 16 May and
// 2 Aug 2026 — 1,889 of them in ONE day, 144 students, all of whom had
// already done the exam. The first person to notice was a student.
//
// TWO LANES, NOT ONE PROVIDER. Groq does the real work here and it does it
// twice: the scorer (chat/completions, gpt-oss-120b) grades every mock, and
// Whisper (audio/transcriptions) turns every speaking answer into the text
// the scorer reads. Merged under one provider name they hide each other —
// a dead Whisper leaves chat answering normally while every speaking answer
// is scored 0. ai_submission_logs.endpoint splits them, and this alerts per
// lane and names the one that is down.
//
// NOT EVERY PROVIDER SAYS 402. Only DeepSeek does. Groq's balance running
// out drops the account to free-tier limits and answers 429 with the limit
// in the body ("tokens per day (TPD)", "spending limit"), which is why the
// wording is matched as well as the code and treated just as seriously.
//
// So every ten minutes this looks at the last fifteen and speaks up:
//
//   402, or money wording  → the credit is gone      (alert on the first one)
//   401  unauthorized      → the key is dead         (alert on the first one)
//   429  too many requests → rate limit              (alert on a burst)
//   half the calls failing → something else is wrong (catch-all)
//
// Refusals caused by the student's own device — a phone recording that
// arrives empty or 0.01s long, which Whisper rightly rejects — are counted
// separately and never raise an alert. They are chronic (158 in a week) and
// counting them as provider failures would leave a real outage to climb
// over background noise.
//
// It repeats at most once an hour per lane while the trouble lasts, and
// says so again when the lane answers — so a top-up is confirmed without
// having to go and check.
//
// Trigger: pg_cron 'ai-credit-watch-10min'. Manual run:
//   POST /functions/v1/ai-credit-watch              → check and alert
//   POST /functions/v1/ai-credit-watch {"dry":true} → report, send nothing
//
// Deploy: supabase functions deploy ai-credit-watch --no-verify-jwt
// =====================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const BOT_TOKEN = Deno.env.get('TELEGRAM_NEWS_BOT_TOKEN') || '';
const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const STATE_KEY = 'scoring_ai_alert_state';   // scoring_* is readable by the admin panel
const REPEAT_AFTER_MS = 60 * 60 * 1000;       // one reminder an hour while it lasts
const BURST_429 = 10;                         // a rate limit worth waking someone for

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
};
const json = (s: number, b: unknown) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });

type Row = {
  provider: string; lane: string; calls: number; errors: number;
  client_errors: number; code_402: number; code_401: number;
  code_429: number; quota_words: number;
  students: number; sample_err: string | null;
};

/** What this lane is to a student, so the alert says what has actually
 *  stopped rather than which URL path it was. */
function laneName(r: Row): string {
  if (r.lane === 'transcribe') return ' — transcription (Whisper)';
  if (r.lane === 'chat') return ' — scoring';
  if (r.lane === 'vision' || r.lane.includes('vision')) return ' — image reading';
  return '';
}

/** The harm being done while this lasts. A student never sees "provider
 *  error"; they see a mark they did not earn. */
function harm(r: Row): string {
  if (r.lane === 'transcribe') {
    return 'Speaking answers are not being transcribed, so they are scored on empty text — the student gets 0 for work they did.';
  }
  return 'Submissions are refused and the student gets no score.';
}

/** What kind of trouble this is, or null when the lane is merely having a
 *  bad minute. The wording is the message the admin receives. */
function classify(r: Row): { kind: string; head: string; advice: string } | null {
  const who = r.provider.toUpperCase() + laneName(r);

  // Money, however the provider chooses to phrase it. DeepSeek answers 402;
  // Groq answers 429 and names the limit in the body.
  if (r.code_402 > 0 || r.quota_words > 0) {
    return {
      kind: 'credit',
      head: `💳 <b>${who} — credit or quota is gone</b>`,
      advice: `Top the account up. Until then ${harm(r).charAt(0).toLowerCase() + harm(r).slice(1)}`,
    };
  }
  if (r.code_401 > 0) {
    return {
      kind: '401',
      head: `🔑 <b>${who} — key rejected</b>`,
      advice: 'The API key is expired, revoked or wrong. Replace it in the function secrets.',
    };
  }
  if (r.code_429 >= BURST_429 || (r.code_429 >= 3 && r.code_429 * 4 >= r.calls)) {
    return {
      kind: '429',
      head: `⏳ <b>${who} — rate limited</b>`,
      advice: `Too many calls for the plan's limit. ${harm(r)}`,
    };
  }
  if (r.calls >= 10 && r.errors * 2 >= r.calls) {
    return {
      kind: 'mostly-failing',
      head: `⚠️ <b>${who} — most calls are failing</b>`,
      advice: 'Not a billing code. Check the sample below — a retired model answers 404, an oversized request 400.',
    };
  }
  return null;
}

async function loadState(): Promise<Record<string, { kind: string; at: number }>> {
  const { data } = await sb.from('site_settings').select('value').eq('key', STATE_KEY).maybeSingle();
  try { return data ? JSON.parse(data.value) : {}; } catch { return {}; }
}
async function saveState(state: unknown) {
  await sb.from('site_settings').upsert({ key: STATE_KEY, value: JSON.stringify(state) }, { onConflict: 'key' });
}

async function tell(text: string) {
  if (!BOT_TOKEN) return false;
  const { data: cfg } = await sb.from('channel_post_settings').select('admin_chat_id').limit(1).maybeSingle();
  const chatId = cfg?.admin_chat_id;
  if (!chatId) return false;
  const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
  });
  return r.ok;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  let body: any = {};
  try { body = await req.json(); } catch { /* cron posts an empty body */ }
  const dry = body?.dry === true;
  const minutes = Number.isFinite(body?.minutes) ? Number(body.minutes) : 15;

  const { data, error } = await sb.rpc('ai_provider_health_window', { p_minutes: minutes });
  if (error) return json(500, { ok: false, error: error.message });

  const rows = (data || []) as Row[];
  const state = await loadState();
  const now = Date.now();
  const sent: string[] = [];
  const troubled = new Set<string>();
  // A lane is remembered as provider/lane, so Whisper going down does not
  // clear an alert still standing on the scorer.
  const keyOf = (r: Row) => `${r.provider}/${r.lane}`;

  for (const r of rows) {
    const verdict = classify(r);
    if (!verdict) continue;
    const key = keyOf(r);
    troubled.add(key);

    const prev = state[key];
    const isNew = !prev || prev.kind !== verdict.kind;
    if (!isNew && now - prev.at < REPEAT_AFTER_MS) continue;   // already said, recently

    const text =
      verdict.head + '\n' +
      `<i>last ${minutes} minutes</i>\n\n` +
      `Calls: ${r.calls} · failed: <b>${r.errors}</b>` +
      (r.students > 0 ? ` · students affected: <b>${r.students}</b>` : '') + '\n' +
      (r.code_402 ? `402 payment required: ${r.code_402}\n` : '') +
      (r.code_401 ? `401 unauthorized: ${r.code_401}\n` : '') +
      (r.code_429 ? `429 rate limited: ${r.code_429}\n` : '') +
      (r.client_errors ? `<i>(plus ${r.client_errors} unusable recordings from students' phones — not this)</i>\n` : '') +
      (r.sample_err ? `\n<code>${String(r.sample_err).replace(/[<>&]/g, '').slice(0, 200)}</code>\n` : '') +
      `\n${verdict.advice}`;

    if (!dry) await tell(text);
    state[key] = { kind: verdict.kind, at: now };
    sent.push(`${key}:${verdict.kind}`);
  }

  // Say when it comes back, so a top-up does not need checking by hand.
  for (const key of Object.keys(state)) {
    if (troubled.has(key)) continue;
    const [prov, lane] = key.split('/');
    const label = prov.toUpperCase() + laneName({ provider: prov, lane: lane || 'all' } as Row);
    if (!dry) {
      await tell(`✅ <b>${label} is answering again</b>\n<i>no failures in the last ${minutes} minutes</i>`);
    }
    sent.push(`${key}:recovered`);
    delete state[key];
  }

  if (!dry) await saveState(state);

  return json(200, {
    ok: true,
    window_minutes: minutes,
    lanes: rows.map((r) => ({
      provider: r.provider, lane: r.lane, calls: r.calls,
      errors: r.errors, client_errors: r.client_errors,
      c402: r.code_402, c401: r.code_401, c429: r.code_429, money_words: r.quota_words,
      verdict: classify(r)?.kind || 'fine',
    })),
    alerts: sent,
  });
});
