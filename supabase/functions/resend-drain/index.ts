// =====================================================================
// Supabase Edge Function: resend-drain
// ---------------------------------------------------------------------
// Sends what the Resend Reports panel put in the queue.
//
// The panel used to do this itself, in a loop inside the page. Chrome
// throttles a hidden tab's timers and eventually freezes the tab, so
// switching to Telegram to watch the reports arrive stopped the sending —
// the batch only ran while somebody was looking at it.
//
// The work belongs on the server for the same reason deliver-pending does:
// once the button is pressed, nothing about the browser should matter.
//
// PACING. resend_queue.send_after carries the interval the admin chose, so
// this function has no schedule of its own to keep — it takes what is due
// and stops. With no interval every row is due at once and BATCH is the
// only limit, which is deliberate: Telegram rate-limits a channel at
// roughly 20 messages a minute, and a teacher does not want fifty files
// landing in one go either.
//
// Trigger: pg_cron 'resend-drain-1min'. Manual run:
//   POST /functions/v1/resend-drain            → send what is due
//   POST /functions/v1/resend-drain {"dry":true} → list it, send nothing
//
// Deploy: supabase functions deploy resend-drain --no-verify-jwt
// =====================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
};
const json = (s: number, b: unknown) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });

/** Where each centre's report viewer lives. The panel builds this from the page
 *  it runs on; there is no page here. site_settings.siteDomain is NOT it — that
 *  field is a file:// fallback and reads 'mockstream.site' for four of seven. */
const CENTER_HOST: Record<string, string> = {
  mock_stream: 'mock-stream.com',
  bek: 'bekzodsmultilevel.com',
  niners: 'ninersacademy.com',
  global: 'global-education.netlify.app',
  muzaffars: 'muzaffars-english.netlify.app',
  achievers: 'achievers-mocks.netlify.app',
  record: 'multilevelrecord.com',
};
const routingId = (c: string) => (c === 'mock_stream' ? 'mockstream' : c);

function fileName(row: any): string {
  const who = String(row.student_name || 'Student').replace(/[^\w]+/g, '_').slice(0, 40);
  const d = new Date(row.date_mode === 'today' ? Date.now() : row.created_at);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const skill = String(row.skill || 'report').replace('-', '');
  const mock = String(row.mock_number || '').replace(/[^\w]+/g, '');
  return `${who}_${dd}_${mm}_${routingId(row.center)}_${skill}${mock ? '_' + mock : ''}_locked.html`;
}

/** Start and Finish are dropped, Duration stays.
 *
 *  Start and Finish are wall-clock times of the sitting; beside a message that
 *  arrives days later they read as if the exam had just been taken. How long a
 *  student took is true whenever it is read. Two icon sets appear in the stored
 *  captions, so the LABEL decides which line goes, not the emoji — the same
 *  rule the panel used before the sending moved here. */
function stripTiming(caption: string): string {
  return String(caption || '').split('\n').filter((ln) => {
    const t = ln.replace(/^[^A-Za-z]+/, '').trim();
    return !/^(Start|Finish)\s*:/i.test(t);
  }).join('\n');
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Move every date in a caption to today — the "Caption date: Today" choice.
 *
 *  Three things carry a date: the readable line, the day hashtags and the month
 *  hashtags. A re-send in a new month has to move all of them, or the channel's
 *  own counts disagree with each other. */
function retagCaption(caption: string, centre: string): string {
  if (!caption) return caption;
  const now = new Date(Date.now() + 5 * 3600000);        // Asia/Tashkent
  const d = now.getUTCDate(), m = now.getUTCMonth() + 1, y = now.getUTCFullYear();
  const yy = String(y).slice(-2);
  const day = pad2(d) + '_' + pad2(m) + '_' + yy;
  const mon = pad2(m) + '_' + yy;
  const rid = routingId(centre);
  let out = caption;
  out = out.replace(/(📅 Date:\s*)\d{1,2}\/\d{1,2}\/\d{4}/, '$1' + m + '/' + d + '/' + y);
  out = out.replace(new RegExp('#' + rid + '_\\d{2}_\\d{2}_\\d{2}', 'g'), '#' + rid + '_' + day);
  out = out.replace(/#all_\d{2}_\d{2}_\d{2}/g, '#all_' + day);
  out = out.replace(new RegExp('#' + rid + '_\\d{2}_\\d{2}(?!_)', 'g'), '#' + rid + '_' + mon);
  out = out.replace(/#all_\d{2}_\d{2}(?!_)/g, '#all_' + mon);
  out = out.replace(new RegExp('#' + rid + '_\\d{4}', 'g'), '#' + rid + '_' + y);
  out = out.replace(/#all_\d{4}/g, '#all_' + y);
  return out;
}

function buildCaption(row: any): string {
  const base = row.date_mode === 'today'
    ? retagCaption(row.caption || '', row.center)
    : (row.caption || '');
  let caption = stripTiming(base);
  if (row.login_line && !/(^|\n)\S* ?Login: /.test(caption)) caption += '\n' + row.login_line;
  const host = CENTER_HOST[row.center];
  if (host && caption.indexOf('View Report') < 0) {
    caption += `\n\n📎 View Report: https://${host}/results/view.html?id=${row.result_id}&lock=1`;
  }
  return caption;
}

async function sendOne(row: any): Promise<{ ok: boolean; error?: string }> {
  const path = String(row.report_path || '');
  if (!path) return { ok: false, error: 'no report' };

  let file: Blob;
  let name = fileName(row);
  if (/\.zip$/i.test(path)) {
    // An attempt from before 18 Aug 2026 is a zip, and report-locked cannot
    // open one — send it exactly as it was sent originally.
    const urls = [
      `${SUPABASE_URL}/storage/v1/object/public/reports/${encodeURI(path)}`,
      `https://storage.googleapis.com/mockstream-report-archive/${encodeURI(path)}`,
    ];
    let got: Blob | null = null;
    for (const u of urls) {
      const r = await fetch(u);
      if (r.ok) { got = await r.blob(); break; }
    }
    if (!got) return { ok: false, error: 'zip not found' };
    file = got;
    name = name.replace(/_locked\.html$/, '.zip');
  } else {
    const lr = await fetch(`${SUPABASE_URL}/functions/v1/report-locked?p=${encodeURIComponent(path)}`);
    if (!lr.ok) return { ok: false, error: `report-locked ${lr.status}` };
    file = new Blob([await lr.text()], { type: 'text/html' });
  }

  const caption = buildCaption(row);
  const fd = new FormData();
  fd.append('testIdentifier', routingId(row.center));
  fd.append('skill', row.skill || '');
  // The timestamp keeps a second re-send of the same report from being deduped
  // against the first; tg_result_id() unwraps it back to the row it rescued.
  fd.append('idempotency_key', `resend-${row.result_id}-${Date.now()}`);
  fd.append('caption', caption);
  fd.append('text', caption);
  fd.append('file', file, name);

  const r = await fetch(`${SUPABASE_URL}/functions/v1/send-to-telegram`, { method: 'POST', body: fd });
  const j = await r.json().catch(() => ({}));
  return (r.ok && (j as any).ok !== false)
    ? { ok: true }
    : { ok: false, error: (j as any).error || `HTTP ${r.status}` };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  let body: any = {};
  try { body = await req.json(); } catch { /* cron posts an empty body */ }
  const dry = body?.dry === true;
  // Each send costs about 3s (fetch the locker, upload to the channel), so ten
  // is roughly a minute of work — one cron tick. It is also close to Telegram's
  // per-channel ceiling, which makes it a sensible cap even when the admin
  // chose no interval at all.
  const limit = Number.isFinite(body?.limit) ? Number(body.limit) : 10;

  // A dry run must not CLAIM anything — take_due marks rows 'sending', which
  // would leave them stuck for a run that never sends them.
  if (dry) {
    const { data: peek, error: peekErr } = await sb
      .from('resend_queue')
      .select('result_id, send_after, center, skill')
      .eq('status', 'queued')
      .lte('send_after', new Date().toISOString())
      .order('send_after')
      .limit(limit);
    if (peekErr) return json(500, { ok: false, error: peekErr.message });
    return json(200, { ok: true, dry_run: true, due: (peek || []).length, rows: peek || [] });
  }

  // A run that died mid-flight leaves rows marked 'sending' for ever. Anything
  // stuck for more than ten minutes goes back in the queue — worst case a
  // report is sent twice, which is far better than never.
  await sb.from('resend_queue')
    .update({ status: 'queued' })
    .eq('status', 'sending')
    .lt('created_at', new Date(Date.now() - 10 * 60_000).toISOString());

  const { data: due, error } = await sb.rpc('resend_take_due', { p_limit: limit });
  if (error) return json(500, { ok: false, error: error.message });
  const rows = (due || []) as any[];

  let sent = 0;
  const failed: any[] = [];
  for (const row of rows) {
    const res = await sendOne(row);            // serial: the channel has rate limits
    if (res.ok) {
      sent++;
      await sb.from('resend_queue').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', row.queue_id);
      if (row.in_dashboard) {
        await sb.rpc('record_report_resend', { p_result_id: row.result_id, p_in_dashboard: true })
          .catch(() => { /* the send is what matters; the dashboard row is a bonus */ });
      }
    } else {
      failed.push({ id: row.result_id, error: res.error });
      // Three tries, then leave it failed with the reason on the row so the
      // panel can show WHY rather than a bare cross.
      const attempts = Number(row.attempts || 0) + 1;
      await sb.from('resend_queue')
        .update({ status: attempts >= 3 ? 'failed' : 'queued', attempts, error: res.error,
                  send_after: new Date(Date.now() + 60_000).toISOString() })
        .eq('id', row.queue_id);
    }
  }

  return json(200, { ok: true, due: rows.length, sent, failed });
});
