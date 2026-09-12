// ============================================================================
// unscored-watch — notice when students stop getting scores.
// ----------------------------------------------------------------------------
// Every alarm we had watched the PROVIDERS: ai-credit-watch reads
// ai_submission_logs and the 08:00 digest counts AI errors. Both measure
// failures among calls that ARRIVE. On 2026-09-11 09:34 an ai-proxy redeploy
// reset verify_jwt to true, so the Supabase gateway rejected every call from
// the exam pages BEFORE the function ran — nothing was logged, nothing failed,
// and both alarms reported a healthy platform for 24 hours while 268
// submissions came out unscored. Bekzod found it, then Cambridge Record's
// admin found it again.
//
// The lesson: an alarm fed by the thing that breaks cannot see it break. So
// this one watches the students instead. A submitted writing or speaking mock
// that carries no score is the harm itself, whatever the cause upstream —
// gateway, key, provider, quota, or a bug we have not met yet.
//
// Threshold comes from measurement, not taste: over 4-10 Sep 2026 between 0%
// and 1.4% of writing/speaking results were unscored on any given day. During
// the outage it was 73% and 85%. "3+ submissions in the window and more than
// half unscored" sits far above the noise and would have fired within half an
// hour of 09:34.
//
// Repeats at most once an hour while it lasts, and says so when scores come
// back — same manners as ai-credit-watch.
//
// Trigger: pg_cron 'unscored-watch-15min'. Manual:
//   POST /functions/v1/unscored-watch                 → check and alert
//   POST /functions/v1/unscored-watch {"dry":true}    → report, send nothing
//   POST /functions/v1/unscored-watch {"minutes":120} → wider window
// ============================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const BOT_TOKEN    = Deno.env.get('TELEGRAM_NEWS_BOT_TOKEN') || '';

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const STATE_KEY      = 'scoring_unscored_alert_state';  // scoring_* is readable by the admin panel
const REPEAT_AFTER_MS = 60 * 60 * 1000;                 // one reminder an hour while it lasts
const MIN_SUBMISSIONS = 3;                              // below this, one bad take proves nothing
const AI_SKILLS = ['writing', 'speaking'];              // reading/listening are marked, not AI-scored

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
};
const json = (s: number, b: unknown) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });

const esc = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** A score the student can read. Anything else — empty, a dash, a literal
 *  "null" — is a mock that finished with nothing to show for it. */
function isScored(score: unknown): boolean {
  const s = String(score ?? '').trim();
  if (!s) return false;
  return !['-', '—', '–', 'null', 'N/A', '0'].includes(s);
}

async function tell(text: string): Promise<boolean> {
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

async function loadState(): Promise<{ kind?: string; at?: number }> {
  const { data } = await sb.from('site_settings').select('value').eq('key', STATE_KEY).maybeSingle();
  try { return data ? JSON.parse(data.value) : {}; } catch { return {}; }
}
async function saveState(state: unknown) {
  await sb.from('site_settings').upsert({ key: STATE_KEY, value: JSON.stringify(state) }, { onConflict: 'key' });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  let body: any = {};
  try { body = await req.json(); } catch { /* cron posts an empty body */ }
  const dry     = body?.dry === true;
  const minutes = Number.isFinite(body?.minutes) ? Math.max(5, Number(body.minutes)) : 40;

  const since = new Date(Date.now() - minutes * 60_000).toISOString();
  const { data, error } = await sb
    .from('results')
    .select('center, skill, score, created_at')
    .gte('created_at', since)
    .in('skill', AI_SKILLS);
  if (error) return json(500, { ok: false, error: error.message });

  const rows = (data || []) as Array<{ center: string; skill: string; score: string }>;
  const total = rows.length;
  const unscored = rows.filter((r) => !isScored(r.score)).length;

  // Per centre, so the message says whether this is everyone or one site.
  const per = new Map<string, { n: number; bad: number }>();
  for (const r of rows) {
    const k = r.center || '(none)';
    const e = per.get(k) || { n: 0, bad: 0 };
    e.n++; if (!isScored(r.score)) e.bad++;
    per.set(k, e);
  }

  const tripped = total >= MIN_SUBMISSIONS && unscored * 2 > total;
  const state = await loadState();
  const now = Date.now();
  let sent = false;

  if (tripped) {
    const pct = Math.round((unscored / total) * 100);
    const isNew = state.kind !== 'unscored';
    const due = isNew || !state.at || (now - state.at) >= REPEAT_AFTER_MS;
    if (due) {
      const lines = [
        `🚨 <b>Students are not getting scores</b>`,
        `<i>last ${minutes} minutes · writing + speaking</i>`,
        '',
        `<b>${unscored} of ${total}</b> submissions came out unscored (${pct}%).`,
        `<i>Normal is 0-1.4%.</i>`,
        '',
      ];
      for (const [centre, e] of [...per.entries()].sort((a, b) => b[1].bad - a[1].bad)) {
        if (!e.bad) continue;
        lines.push(`  ${esc(centre)} — ${e.bad}/${e.n} unscored`);
      }
      lines.push('');
      lines.push('This says the student saw "AI Scoring Failed", not why. Check in this order:');
      lines.push('1. <code>curl -X POST -H "x-ms-center: bek" --data \'{}\' .../functions/v1/ai-proxy</code>');
      lines.push('   → <code>missing_provider</code> = healthy · <b>401 = ai-proxy lost --no-verify-jwt</b>');
      lines.push('2. ai-credit-watch for a provider refusal (402 / 401 / 429).');
      lines.push('3. Supabase function logs for ai-proxy.');
      if (!dry) sent = await tell(lines.join('\n'));
      if (!dry) await saveState({ kind: 'unscored', at: now });
    }
  } else if (state.kind === 'unscored') {
    if (!dry) {
      sent = await tell(
        `✅ <b>Scoring is working again</b>\n<i>last ${minutes} minutes: ${total - unscored} of ${total} scored</i>`,
      );
      await saveState({});
    }
  }

  return json(200, {
    ok: true,
    window_minutes: minutes,
    total,
    unscored,
    pct: total ? Math.round((unscored / total) * 100) : 0,
    tripped,
    sent,
    per_centre: [...per.entries()].map(([c, e]) => ({ centre: c, submissions: e.n, unscored: e.bad })),
  });
});
