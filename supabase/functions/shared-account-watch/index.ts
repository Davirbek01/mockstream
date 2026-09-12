// ============================================================================
// shared-account-watch — one message a day about accounts being shared.
// ----------------------------------------------------------------------------
// WATCHING ONLY. Nothing here blocks an account, warns a student, or changes
// anything a student can see. It reads, it formats, it sends to the admin chat.
// The Warn/Block buttons Davirbek wants come later, deliberately: the point of
// this week is to find out whether the threshold is right BEFORE anyone can act
// on it with one tap.
//
// Why the threshold matters more than the feature. On 2026-09-11 the loose
// detector flagged 14 accounts and TEN of them had two or three devices —
// a phone and a laptop, or one cleared cookie jar. Send that list every evening
// and within a fortnight the buttons get tapped without reading; the first real
// cost of that is a paying student locked out of an exam they paid for.
//
// shared_account_watch() asks for a shape one person cannot make: several
// devices that actually overlapped, more than one day, and peak_concurrent —
// the most devices with a mock open at the same instant. One person is 1,
// sometimes 2 with a tab left behind. It cut 14 to 4, and the top one was 7.
//
// Only accounts not reported before are shown in full; the rest are a tally, so
// a week of watching does not become the same four names every evening.
// ============================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const BOT_TOKEN    = Deno.env.get('TELEGRAM_NEWS_BOT_TOKEN') || '';

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const esc = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

interface Row {
  user_email: string;
  center: string;
  overlap_events: number;
  overlap_devices: number;
  total_devices: number;
  active_days: number;
  peak_concurrent: number;
  ip_count: number;
  network_count: number;
  first_at: string;
  last_at: string;
  devices: Array<{ device: string; n: number; from: string; to: string }> | null;
}

/**
 * A Telegram sign-in has no real address — `tg_<id>@telegram.mock-stream.com`
 * is a placeholder for a domain that does not exist. Worth saying on the line,
 * because it decides how such an account could ever be warned: not by email.
 */
const isPlaceholder = (email: string) => /@telegram\.[^@]+$/i.test(email);

function describe(r: Row): string[] {
  const L: string[] = [];
  const who = esc(r.user_email) + (isPlaceholder(r.user_email) ? ' <i>(Telegram — no real address)</i>' : '');
  L.push(`<b>${who}</b> · ${esc(r.center)}`);
  L.push(`  <b>${r.peak_concurrent} at once</b> · ${r.overlap_devices} devices overlapped` +
         ` · ${r.overlap_events} events · ${r.active_days} day${r.active_days === 1 ? '' : 's'}`);

  // The line that decides what this even IS. Many devices behind ONE
  // network is a classroom — a teacher signing a group in on the centre's
  // own account, which is not a student cheating and must not be answered
  // as though it were. Several networks is a password passed around.
  if (r.network_count >= 1) {
    const room = r.network_count === 1;
    L.push(`  ${room ? '🏫' : '🌍'} ${r.ip_count} IP${r.ip_count === 1 ? '' : 's'}` +
           ` on ${r.network_count} network${r.network_count === 1 ? '' : 's'}` +
           (room ? ' — <b>looks like one room</b>' : ' — <b>spread across networks</b>'));
  } else {
    // The IPs come from ai_submission_logs, so an account that opens mocks but
    // never submits one for AI scoring has no IP on record at all. Printing
    // nothing read as "no networks", which is the opposite of what it means:
    // cambridge.itroom (0 submissions) looked tidier than the classroom it is.
    L.push('  ❔ <i>no network data — nothing submitted for AI scoring</i>');
  }

  // The evidence, not the summary. Six devices doing 5-8 attempts each across
  // two days reads very differently from two devices, one used once.
  const devs = (r.devices || []).slice(0, 6);
  for (const d of devs) {
    L.push(`  · ${esc(d.device)} — ${d.n} attempt${d.n === 1 ? '' : 's'}, ${esc(d.from)} → ${esc(d.to)}`);
  }
  const more = (r.devices || []).length - devs.length;
  if (more > 0) L.push(`  · +${more} more device${more === 1 ? '' : 's'}`);
  return L;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  let body: any = {};
  try { body = await req.json(); } catch { /* cron posts nothing */ }
  const dry         = body?.dry === true;
  const daysBack    = Number.isFinite(body?.days_back) ? Number(body.days_back) : 2;
  const minDevices  = Number.isFinite(body?.min_devices) ? Number(body.min_devices) : 4;
  const minAtOnce   = Number.isFinite(body?.min_concurrent) ? Number(body.min_concurrent) : 3;

  const { data, error } = await sb.rpc('shared_account_watch', {
    p_days_back: daysBack, p_min_devices: minDevices, p_min_concurrent: minAtOnce,
  });
  if (error) return json(500, { ok: false, error: error.message });

  const rows: Row[] = (data || []) as Row[];

  // Which of these have been reported before?
  const { data: seenRows } = await sb
    .from('shared_account_reports')
    .select('user_email, center, times_seen');
  const seen = new Map<string, number>();
  for (const s of (seenRows || []) as any[]) seen.set(`${s.user_email}|${s.center}`, s.times_seen ?? 1);

  const fresh = rows.filter((r) => !seen.has(`${r.user_email}|${r.center}`));
  const ongoing = rows.filter((r) => seen.has(`${r.user_email}|${r.center}`));

  const L: string[] = [];
  if (!rows.length) {
    L.push('🟢 <b>Shared accounts — none over the line</b>');
    L.push(`<i>${minAtOnce}+ at once and ${minDevices}+ devices overlapping, last ${daysBack} days</i>`);
  } else {
    L.push(`🚩 <b>Shared accounts — ${rows.length} over the line</b>`);
    L.push(`<i>${minAtOnce}+ at once and ${minDevices}+ devices overlapping, last ${daysBack} days</i>`);
    L.push('');
    if (fresh.length) {
      L.push(`<b>NEW (${fresh.length})</b>`);
      for (const r of fresh) { for (const line of describe(r)) L.push(line); L.push(''); }
    }
    if (ongoing.length) {
      L.push(`<b>Already known (${ongoing.length})</b>`);
      for (const r of ongoing) {
        L.push(`  ${esc(r.user_email)} · ${esc(r.center)} — ${r.peak_concurrent} at once,` +
               ` seen ${(seen.get(`${r.user_email}|${r.center}`) || 1) + 1}×`);
      }
      L.push('');
    }
  }
  L.push('<i>Watching only — nobody is blocked, nobody is warned.</i>');
  if (rows.some((r) => r.network_count === 1)) {
    L.push('<i>🏫 = one network: probably a centre signing a class in on its own account, not a student sharing a password. A different problem with a different answer.</i>');
  }
  const text = L.join('\n');

  // Remember what was reported, so tomorrow's message can lead with what is new.
  if (!dry && rows.length) {
    for (const r of rows) {
      const key = `${r.user_email}|${r.center}`;
      await sb.from('shared_account_reports').upsert({
        user_email: r.user_email,
        center: r.center,
        last_seen: new Date().toISOString(),
        times_seen: (seen.get(key) || 0) + 1,
        peak_concurrent: r.peak_concurrent,
      }, { onConflict: 'user_email,center' });
    }
  }

  let sent = false;
  let sendError: string | null = null;
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
      if (!r.ok) sendError = `telegram ${r.status}`;
    } else {
      sendError = 'no admin_chat_id in channel_post_settings';
    }
  }

  return json(200, { ok: true, flagged: rows.length, fresh: fresh.length, sent, sendError, text });
});
