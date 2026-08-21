// =====================================================================
// Supabase Edge Function: daily-health-check
// ---------------------------------------------------------------------
// The 08:00 (Asia/Tashkent) digest: what the platform did yesterday and
// what is quietly broken today. Born out of 19 Aug 2026, when Supabase
// lost the code blobs of 15 Edge Functions — students met a red
// UNAUTHORIZED wall and finished reports never reached Telegram, and
// nobody knew for half an hour.
//
// Four sections:
//   1. Submissions     — per centre and skill, against the 7-day average
//   2. Telegram        — logged failures, submitted-vs-sent gap, and the
//                        ten-minute windows with submissions but no send
//                        at all (the shape an outage actually makes)
//   3. Finish gate     — how often the red wall was shown, and why
//   4. Function sweep  — every Edge Function pinged for a lost code blob
//
// The counts come from daily_health_snapshot() so the SQL lives in a
// migration; this function formats, sweeps and delivers.
//
// Trigger: pg_cron job 'daily-health-0800' (03:00 UTC) via pg_net +
// vault service key. Manual run:
//   POST /functions/v1/daily-health-check           → yesterday
//   POST /functions/v1/daily-health-check {"days_back":0}  → today so far
//   POST /functions/v1/daily-health-check {"dry":true}     → no Telegram
//
// Deploy: supabase functions deploy daily-health-check --no-verify-jwt
// =====================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { gcpSpend, type GcpSpend } from './gcpSpend.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const BOT_TOKEN = Deno.env.get('TELEGRAM_NEWS_BOT_TOKEN') || '';
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

// Every function that must answer. A name missing from this list is never
// swept, so add new ones here — `ls supabase/functions` is the source.
const FUNCTIONS = [
  'admin-ips', 'admin-mocks', 'ai-health-check', 'ai-proxy', 'authorize-finish',
  'channel-posts-admin', 'codes-manager', 'daily-health-check', 'delete-account',
  'enrich-listening-meta', 'gcs-listening-helpers', 'gemini-live-proxy',
  'gemini-live-token', 'generate-channel-post', 'generate-channel-quizzes',
  'get-login-bot-ids', 'get-promo-code', 'guest-results', 'news-bot-webhook',
  'patch-listening-json', 'publish-channel-post', 'report', 'report-locked',
  'routing-proxy', 'send-push', 'send-to-telegram', 'speaking-realtime-admin',
  'speaking-realtime-save', 'storage-cleanup', 'support-bot',
  'telegram-bot-webhook', 'telegram-center-bot', 'transcribe-audio',
  'transcribe-mock', 'validate-vip-token', 'verify-passcode',
  'verify-telegram-initdata', 'verify-telegram-login', 'web-push',
];

/**
 * A lost code blob answers 404 at the GATEWAY, with sb-error-code
 * NOT_FOUND_FUNCTION_BLOB — a function that merely dislikes the empty body
 * answers from its own code and carries no such header. Only the first is
 * a fault; the rest is the function proving it is alive.
 */
async function sweepFunctions(): Promise<string[]> {
  const dead: string[] = [];
  for (const name of FUNCTIONS) {
    if (name === 'daily-health-check') continue;   // that is this call
    try {
      // OPTIONS, not POST. The sweep exists to find functions that have lost
      // their code, and the gateway answers that before any handler runs — but
      // a POST with an empty body is a real call, and some functions do real
      // work when they get one. This sweep commissioned ten Gemini-written
      // channel posts between 19 and 20 Aug 2026 before anyone noticed, and
      // it had been waking deliver-pending on every run.
      const r = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
        method: 'OPTIONS',
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
        },
      });
      if (r.headers.get('sb-error-code') === 'NOT_FOUND_FUNCTION_BLOB') dead.push(name);
      await r.body?.cancel();
    } catch {
      // A network blip is not evidence of a lost blob; the next run decides.
    }
  }
  return dead;
}

type Row = { center: string; skill: string; n: number };

function esc(s: string) {
  return String(s).replace(/[<>&]/g, (c) => (c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&amp;'));
}

/** Yesterday's AI bill, worked out from our own logs.
 *
 *  Groq publishes no billing API, so the only way to answer "what did
 *  yesterday cost" is to price the usage ourselves: every reply carries its
 *  token count, the proxy stores it, and site_settings.ai_price_table holds
 *  the rates. That makes the figure an ESTIMATE, and it is labelled as one —
 *  but an estimate that arrives every morning beats an exact number that
 *  arrives when the credit is already gone.
 *
 *  Whisper is billed per hour of audio. A transcription reply carries no
 *  duration unless it was requested, so when it is missing the audio is
 *  estimated from the bytes we uploaded at the configured bitrate. That part
 *  is marked ~ so it is never mistaken for a measurement.
 */
function spendSection(rows: any[], prices: any, gcp: GcpSpend | null): string[] {
  const L: string[] = [];
  if (!rows || !rows.length) return L;

  let total = 0, unpriced = 0, blind = 0, estimated = false;
  const lines: Array<{ label: string; usd: number; note: string }> = [];

  for (const r of rows) {
    const key = `${r.provider}/${r.lane}`;
    const p = prices[key] || prices[`${r.provider}/all`];
    blind += Number(r.no_usage || 0);
    if (!p) {
      // Rows logged before ai-proxy recorded the lane land in 'all' and carry
      // no usage at all, so they cost nothing to price and nothing to skip.
      // Counting them as "no price set" made the report nag about history.
      const nothingToPrice = r.lane === 'all' &&
        !Number(r.tokens_in) && !Number(r.tokens_out) && !Number(r.audio_sec) && !Number(r.bytes_in);
      if (!nothingToPrice) unpriced++;
      continue;
    }

    let usd = 0;
    let note = '';
    if (p.in || p.out) {
      usd += (Number(r.tokens_in) / 1e6) * Number(p.in || 0);
      usd += (Number(r.tokens_out) / 1e6) * Number(p.out || 0);
      note = `${Math.round(Number(r.tokens_in) / 1000)}k in · ${Math.round(Number(r.tokens_out) / 1000)}k out`;
    }
    if (p.hour) {
      let sec = Number(r.audio_sec || 0);
      if (!sec && p.est_kbps && Number(r.bytes_in)) {
        sec = (Number(r.bytes_in) * 8) / (Number(p.est_kbps) * 1000);
        estimated = true;
      }
      usd += (sec / 3600) * Number(p.hour);
      note = `${Math.round(sec / 60)} min audio${r.audio_sec ? '' : ' ~'}`;
    }
    total += usd;
    lines.push({ label: key, usd, note });
  }

  lines.sort((a, b) => b.usd - a.usd);
  const money = (n: number) => '$' + n.toFixed(2);

  // Google's half is the finished invoice, ours is an estimate. They are added
  // for the run rate — which is the number that matters — but kept on separate
  // lines so it stays clear which is which.
  const google = gcp && !gcp.note ? gcp.total : 0;
  const grand = total + google;

  L.push(`💰 <b>Spend</b> — ${money(grand)}  <i>(≈ ${money(grand * 30)}/month at this rate)</i>`);
  if (gcp) {
    if (gcp.note) {
      L.push(`  <b>Google</b>: <i>${esc(gcp.note)}</i>`);
    } else {
      L.push(`  <b>Google</b> ${money(gcp.total)}` +
             (gcp.day ? ` <i>(${esc(gcp.day)}, billed)</i>` : ''));
      for (const g of gcp.by.slice(0, 5)) {
        L.push(`   ${esc(g.service)}: ${money(g.cost)}`);
      }
    }
  }
  L.push(`  <b>AI</b> ${money(total)} <i>(estimated from our own logs)</i>`);
  for (const l of lines.slice(0, 6)) {
    L.push(`  ${esc(l.label)}: ${money(l.usd)}  <i>${esc(l.note)}</i>`);
  }
  if (estimated) L.push(`  <i>~ audio minutes estimated from upload size; the rest is the providers' own counts</i>`);
  if (blind) L.push(`  <i>${blind} call(s) reported no usage — not counted</i>`);
  if (unpriced) L.push(`  <i>${unpriced} lane(s) have no price set in ai_price_table</i>`);
  if (prices._confirmed !== true) {
    L.push(`  ⚠️ <i>prices not confirmed against the providers' consoles yet</i>`);
  }
  L.push('');
  return L;
}

function buildMessage(s: any, dead: string[], spend: any[], prices: any, gcp: GcpSpend | null): string {
  const L: string[] = [];
  const tg = s.telegram || {};
  const gate = s.gate || {};
  const ai = s.ai || {};

  // A headline that says at a glance whether anything needs attention.
  const alerts: string[] = [];
  if (dead.length) alerts.push(`${dead.length} function${dead.length > 1 ? 's' : ''} down`);
  if (Number(tg.dead_windows) > 0) alerts.push('Telegram silence');
  if (Number(tg.failed) > 0) alerts.push(`${tg.failed} send failures`);
  if (Number(tg.gap_pct) > Number(tg.gap_pct_7d) + 3) alerts.push('delivery gap up');

  L.push(alerts.length ? '🔴 <b>Health check — needs attention</b>' : '🟢 <b>Health check — all clear</b>');
  L.push(`<i>${esc(s.day)}</i>`);
  if (alerts.length) L.push('⚠️ ' + esc(alerts.join(' · ')));
  L.push('');

  // 1. Submissions
  const diff = Number(s.submissions) - Number(s.avg_7d);
  const trend = diff >= 0 ? `+${diff}` : String(diff);
  L.push(`📊 <b>Submissions: ${s.submissions}</b> <i>(7-day avg ${s.avg_7d}, ${trend})</i>`);
  const rows: Row[] = s.by_centre || [];
  const centres = new Map<string, Row[]>();
  for (const r of rows) {
    if (!centres.has(r.center)) centres.set(r.center, []);
    centres.get(r.center)!.push(r);
  }
  const totals = [...centres.entries()]
    .map(([c, rs]) => ({ c, rs, t: rs.reduce((a, x) => a + Number(x.n), 0) }))
    .sort((a, b) => b.t - a.t);
  for (const { c, rs, t } of totals) {
    const per = rs.sort((a, b) => Number(b.n) - Number(a.n))
      .map((r) => `${esc(r.skill || '?')} ${r.n}`).join(' · ');
    L.push(`  <b>${esc(c)}</b> ${t} — ${per}`);
  }
  L.push('');

  // 2. Telegram delivery
  //
  // A NEGATIVE gap is normal and used to be printed as "-23% not delivered",
  // which is not a number that can exist. Two causes, both benign: the sweep
  // delivers the previous evening's stragglers after midnight, and a re-send
  // writes its own key. Say what actually happened instead of the arithmetic.
  L.push(`📨 <b>Telegram</b> — sent ${tg.submissions}, failures ${tg.failed}` +
         (Number(tg.resends) ? ` · ${tg.resends} re-sent by hand` : ''));
  if (Number(tg.gap) > 0) {
    L.push(`  not delivered: ${tg.gap} (${tg.gap_pct}%, usual ${tg.gap_pct_7d}%)`);
  } else {
    L.push(`  ✅ every report delivered <i>(${Math.abs(Number(tg.gap))} of them last night's, arriving after midnight)</i>`);
  }
  // A send carries the id of its submission, so a miss can be named — but only
  // once most clients send that way. Below that, the names would be a list of
  // everyone on an old build rather than everyone who lost a report.
  const linked = Number(tg.linked_pct || 0);
  const misses = tg.missing || [];
  if (linked >= 60 && misses.length) {
    L.push(`  <b>missing reports:</b>`);
    for (const m of misses.slice(0, 10)) {
      L.push(`   ${esc(m.student || '—')} · ${esc(m.center || '?')} · ${esc(m.skill || '?')} · ${esc(m.at)}`);
    }
    if (misses.length > 10) L.push(`   …and ${misses.length - 10} more`);
  } else if (linked < 60) {
    L.push(`  <i>naming needs the linked senders — ${linked}% of today's submissions carry their id</i>`);
  }
  if (Number(tg.dead_windows) > 0) {
    L.push(`  🔴 silent windows: ${tg.dead_windows} (${tg.dead_subs} submissions) at ${esc(tg.dead_at)}`);
  }
  L.push('');

  // 3. Finish gate — the red UNAUTHORIZED wall
  L.push(`🛡 <b>Finish gate</b> — passed ${gate.ok}, blocked ${gate.blocked}`);
  for (const g of (gate.by || [])) L.push(`  ${esc(g.reason)}: ${g.n}`);
  L.push('');

  // 4. AI scoring
  L.push(`🤖 <b>AI calls</b> — ${ai.total}, errors ${ai.errors}`);
  for (const a of (ai.by || []).slice(0, 5)) {
    L.push(`  ${esc(a.center || '?')} / ${esc(a.provider || '?')}: ${a.n}`);
  }
  // One recent refusal in the provider's own words — 'HTTP 400' repeated 157
  // times says nothing; "max_tokens must be <= 16384" says what to change.
  const sample = (ai.by || []).find((a: any) => a.sample)?.sample;
  if (sample) L.push(`  <i>${esc(String(sample).slice(0, 160))}</i>`);
  L.push('');

  // 5. Clients left behind on an old build
  //
  // Since 5 Aug every client grades picture tasks from the text stored with
  // the mock, so a vision call means the caller is running older code. The
  // ones asking for the withdrawn model are worse than wasteful: they get no
  // description at all, and the examiner grades a picture task having seen
  // nothing. Small and shrinking on its own — this is here so that a centre
  // freezing on an old build shows up the next morning rather than never.
  for (const line of spendSection(spend, prices, gcp)) L.push(line);

  const stale = s.stale_app || {};
  if (Number(stale.total) > 0) {
    L.push(`📱 <b>Old app builds</b> — ${stale.total} picture task(s) graded without the stored description`);
    for (const s2 of (stale.by || []).slice(0, 6)) {
      L.push(`  ${esc(s2.center || '?')} / ${esc(s2.platform || '?')}: ${s2.n}` +
             (Number(s2.failed) ? ` (${s2.failed} got nothing back)` : ''));
    }
    if (Number(stale.retired) > 0) {
      L.push(`  <i>${stale.retired} asked for a model Groq withdrew — those images were never described</i>`);
    }
    L.push('');
  }

  // 6. Function sweep
  if (dead.length) {
    L.push(`🔴 <b>Edge Functions with no code</b> (${dead.length}/${FUNCTIONS.length - 1})`);
    for (const d of dead) L.push(`  ${esc(d)}`);
    L.push('  <i>Fix: supabase functions deploy &lt;name&gt; --no-verify-jwt</i>');
  } else {
    L.push(`✅ <b>Edge Functions</b> — all ${FUNCTIONS.length - 1} answered`);
  }

  return L.join('\n');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  let body: any = {};
  try { body = await req.json(); } catch { /* cron posts an empty body */ }
  const daysBack = Number.isFinite(body?.days_back) ? Number(body.days_back) : 1;
  const dry = body?.dry === true;

  const { data: snap, error } = await sb.rpc('daily_health_snapshot', { p_days_back: daysBack });
  if (error) return json(500, { ok: false, error: error.message });
  // A crash below used to answer a bare 'Internal Server Error' — nothing to
  // act on, on a report nobody looks at until 08:00 the next morning.
  if (!snap) return json(500, { ok: false, error: 'snapshot returned no rows' });
  try {

  // The sweep POSTs an empty body to every function, and some of them do real
  // work when they get one (deliver-pending sends the backlog). At 03:00 that
  // is free — nothing is pending — but a manual run in the middle of the day
  // can outlast the worker. skip_sweep lets a by-hand run check the numbers
  // without waking the rest of the estate.
  const dead = body?.skip_sweep === true ? [] : await sweepFunctions();
  // Prices live in a setting, not in this file: a provider changing its rate
  // should be a one-line edit, not a deploy.
  const [{ data: spend }, { data: priceRow }] = await Promise.all([
    sb.rpc('ai_spend_window', { p_days_back: daysBack }),
    sb.from('site_settings').select('value').eq('key', 'ai_price_table').maybeSingle(),
  ]);
  let prices: any = {};
  try { prices = priceRow ? JSON.parse(priceRow.value) : {}; } catch { /* keep going without costs */ }

  // Google's own numbers, if the billing export has been connected. A day
  // behind by nature: the export is written after the day closes.
  const gcp = await gcpSpend(daysBack);

  const text = buildMessage(snap, dead, spend || [], prices, gcp);

  // Keep the last report where the admin panel can read it, the same place
  // ai-health-check writes to (scoring_* is on the anon read whitelist).
  await sb.from('site_settings').upsert(
    { key: 'scoring_daily_health_report', value: JSON.stringify({ ts: new Date().toISOString(), snapshot: snap, dead_functions: dead, text }) },
    { onConflict: 'key' },
  );

  let sent = false;
  let sendError = '';
  if (!dry && BOT_TOKEN) {
    const { data: cfg } = await sb.from('channel_post_settings').select('admin_chat_id').limit(1).maybeSingle();
    const chatId = cfg?.admin_chat_id;
    if (chatId) {
      const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
      });
      sent = r.ok;
      if (!r.ok) sendError = await r.text();
    } else {
      sendError = 'no admin_chat_id in channel_post_settings';
    }
  }

  return json(200, { ok: true, day: snap?.day, dead_functions: dead, sent, sendError, text });
  } catch (e) {
    return json(500, { ok: false, error: String((e as any)?.stack || e).slice(0, 700) });
  }
});
