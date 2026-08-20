// =====================================================================
// Supabase Edge Function: deliver-pending
// ---------------------------------------------------------------------
// Finishes the deliveries the student's device could not.
//
// A report reaches Supabase in two quick REST calls, and then the client
// uploads the whole file a SECOND time to send-to-telegram — after the
// score is already on screen. Measured on 20 Aug 2026:
//
//   listening   2.0s to send   97% delivered
//   writing     4.7s           95%
//   reading     4.2s           92%
//   speaking    9.2s           80%   ← the biggest file, the worst loss
//
// The longer that window, the more often it ends early: a closed tab, a
// locked phone, a dip in signal. Storage and the results row are already
// complete by then, so nothing is lost except the channel copy — which is
// exactly what a centre admin looks at, and what makes them believe the
// platform dropped a student's work.
//
// So the server finishes it. Every few minutes this takes the reports with
// no successful send and posts them itself, with the SAME idempotency key
// the client uses (the row id) — so a late client send collapses into one
// message rather than two.
//
// Trigger: pg_cron 'deliver-pending-5min'. Manual run:
//   POST /functions/v1/deliver-pending            → deliver
//   POST /functions/v1/deliver-pending {"dry":true} → list only
//
// Deploy: supabase functions deploy deliver-pending --no-verify-jwt
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
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

/** Where each centre's report viewer lives — the client builds this from the
 *  page it ran on, and there is no page here. site_settings.siteDomain is not
 *  it: that field is a file:// fallback and reads 'mockstream.site' for four of
 *  the seven. */
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
  const d = new Date(row.created_at);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const skill = String(row.skill || 'report').replace('-', '');
  const mock = String(row.mock_number || '').replace(/[^\w]+/g, '');
  return `${who}_${dd}_${mm}_${routingId(row.center)}_${skill}${mock ? '_' + mock : ''}_locked.html`;
}

/** The caption the client would have sent: the stored text, the line naming who
 *  was signed in, and the link to the report. The last two are stamped at send
 *  time, which is why they are not in results.caption. */
function buildCaption(row: any): string {
  let caption = String(row.caption || '');
  if (row.login_line && !/(^|\n)\S* ?Login: /.test(caption)) caption += '\n' + row.login_line;
  const host = CENTER_HOST[row.center];
  if (host && caption.indexOf('View Report') < 0) {
    caption += `\n\n📎 View Report: https://${host}/results/view.html?id=${row.id}&lock=1`;
  }
  return caption;
}

async function deliver(row: any): Promise<{ id: string; ok: boolean; error?: string }> {
  const path = String(row.report_path || '');
  if (!path) return { id: row.id, ok: false, error: 'no report_path' };

  // A zip predates the encrypted html and report-locked cannot open one; send
  // the zip itself, the way it was sent originally.
  let file: Blob;
  let name = fileName(row);
  if (/\.zip$/i.test(path)) {
    const urls = [
      `${SUPABASE_URL}/storage/v1/object/public/reports/${encodeURI(path)}`,
      `https://storage.googleapis.com/mockstream-report-archive/${encodeURI(path)}`,
    ];
    let got: Blob | null = null;
    for (const u of urls) {
      const r = await fetch(u);
      if (r.ok) { got = await r.blob(); break; }
    }
    if (!got) return { id: row.id, ok: false, error: 'zip not found' };
    file = got;
    name = name.replace(/_locked\.html$/, '.zip');
  } else {
    const lr = await fetch(`${SUPABASE_URL}/functions/v1/report-locked?p=${encodeURIComponent(path)}`);
    if (!lr.ok) return { id: row.id, ok: false, error: `report-locked ${lr.status}` };
    file = new Blob([await lr.text()], { type: 'text/html' });
  }

  const caption = buildCaption(row);
  const fd = new FormData();
  fd.append('testIdentifier', routingId(row.center));
  fd.append('skill', row.skill || '');
  // The row id, exactly as the client keys it: a client send that lands late
  // is then recognised as the same delivery instead of doubling the message.
  fd.append('idempotency_key', String(row.id));
  fd.append('caption', caption);
  fd.append('text', caption);
  fd.append('file', file, name);

  const r = await fetch(`${SUPABASE_URL}/functions/v1/send-to-telegram`, { method: 'POST', body: fd });
  const j = await r.json().catch(() => ({}));
  return (r.ok && (j as any).ok !== false)
    ? { id: row.id, ok: true }
    : { id: row.id, ok: false, error: (j as any).error || `HTTP ${r.status}` };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  let body: any = {};
  try { body = await req.json(); } catch { /* cron posts an empty body */ }
  const dry = body?.dry === true;
  const limit = Number.isFinite(body?.limit) ? Number(body.limit) : 20;
  // Old enough that the client has finished trying or died; young enough that
  // a message still means something in the channel.
  const minAge = Number.isFinite(body?.min_age_min) ? Number(body.min_age_min) : 2;
  const maxAge = Number.isFinite(body?.max_age_min) ? Number(body.max_age_min) : 180;

  const { data: rows, error } = await sb.rpc('pending_telegram_deliveries', {
    p_min_age_min: minAge, p_max_age_min: maxAge, p_limit: limit,
  });
  if (error) return json(500, { ok: false, error: error.message });

  const pending = (rows || []) as any[];
  if (dry) {
    return json(200, {
      ok: true, dry_run: true, pending: pending.length,
      rows: pending.map((r) => ({ id: r.id, centre: r.center, skill: r.skill, student: r.student_name, at: r.created_at })),
    });
  }

  const results = [];
  for (const row of pending) results.push(await deliver(row));   // serial: the channel has rate limits
  const sent = results.filter((r) => r.ok).length;

  return json(200, {
    ok: true,
    pending: pending.length,
    sent,
    failed: results.filter((r) => !r.ok),
  });
});
