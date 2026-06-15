// storage-cleanup — nightly auto-cleanup of the `reports` bucket.
// Called by pg_cron via cleanup_old_reports() with the service-role key.
//
// Enumerates STORAGE directly (not report_path) so it also reaches orphaned
// files, and uses the service role so deletes actually succeed (the old
// report_path + net.http_delete approach silently orphaned files).
//
// Categories (mirrors the dashboard's manual panel):
//   • Recordings & bundles → .m4a (mobile speaking audio, nested in <id>/) and
//     .zip (legacy web speaking bundles)  — the space hogs
//   • Report pages → .html (tiny; the full analysis lives here)
//
// Settings (site_settings):
//   cleanup_enabled         'on'|'off'
//   cleanup_retention_days  int (default 30)
//   cleanup_delete_audio    'on'|'off' (default on)   → .m4a + .zip
//   cleanup_delete_reports  'on'|'off' (default off)  → .html
//
// POST {} → run.  POST {"dry_run":true} → report what WOULD be deleted.
// Deploy with --no-verify-jwt; the function enforces the service-role header.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SB_URL = Deno.env.get('SUPABASE_URL')!;
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

function json(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 });

  let body: any = {};
  try { body = await req.json(); } catch {}
  const dry = !!body.dry_run;

  const sb = createClient(SB_URL, SB_KEY);

  // Authorize: caller must present the cron's service-role token. Compared to the
  // vault value via RPC, so it works even if the injected key differs in format.
  const auth = req.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  let authorized = !!token && token === SB_KEY;
  if (!authorized && token) {
    const { data: ok } = await sb.rpc('_cleanup_token_ok', { p_token: token });
    authorized = ok === true;
  }
  if (!authorized) return json({ error: 'unauthorized' }, 401);

  const { data: st } = await sb
    .from('site_settings')
    .select('key,value')
    .in('key', ['cleanup_enabled', 'cleanup_retention_days', 'cleanup_delete_audio', 'cleanup_delete_reports']);
  const m: Record<string, string> = {};
  (st || []).forEach((r: any) => { m[r.key] = r.value; });

  if (m['cleanup_enabled'] !== 'on') return json({ skipped: true, reason: 'disabled' });
  const days = parseInt(m['cleanup_retention_days'] || '30', 10) || 30;
  const delAudio = (m['cleanup_delete_audio'] ?? 'on') !== 'off';
  const delReports = (m['cleanup_delete_reports'] ?? 'off') === 'on';
  const cutoff = Date.now() - days * 86_400_000;

  async function list(prefix: string): Promise<any[]> {
    let out: any[] = [], off = 0;
    while (true) {
      const { data, error } = await sb.storage.from('reports').list(prefix, {
        limit: 1000, offset: off, sortBy: { column: 'name', order: 'asc' },
      });
      if (error || !data || !data.length) break;
      out = out.concat(data);
      if (data.length < 1000) break;
      off += 1000;
    }
    return out;
  }
  const isOld = (f: any) => { const t = f.created_at ? new Date(f.created_at).getTime() : 0; return t > 0 && t < cutoff; };

  const toDelete: string[] = [];
  let html = 0, zip = 0, m4a = 0;

  const roots = await list('');
  const centers = roots.filter((f: any) => f.id == null).map((f: any) => f.name);

  for (const c of centers) {
    const entries = await list(c + '/');
    for (const f of entries) {
      if (f.id == null) {
        // an <id>/ folder — may hold nested mobile speaking audio
        if (delAudio) {
          const inner = await list(c + '/' + f.name + '/');
          for (const af of inner) {
            if (af.id != null && /\.m4a$/i.test(af.name) && isOld(af)) { toDelete.push(c + '/' + f.name + '/' + af.name); m4a++; }
          }
        }
        continue;
      }
      if (!isOld(f)) continue;
      if (/\.html$/i.test(f.name)) { if (delReports) { toDelete.push(c + '/' + f.name); html++; } }
      else if (/\.zip$/i.test(f.name)) { if (delAudio) { toDelete.push(c + '/' + f.name); zip++; } }
    }
  }

  if (dry) return json({ dry_run: true, days, delAudio, delReports, wouldDelete: toDelete.length, html, zip, m4a, sample: toDelete.slice(0, 25) });

  let deleted = 0;
  for (let i = 0; i < toDelete.length; i += 100) {
    const batch = toDelete.slice(i, i + 100);
    const { data, error } = await sb.storage.from('reports').remove(batch);
    if (!error) deleted += Array.isArray(data) ? data.length : batch.length;
  }

  // Null report_path for deleted top-level docs (center/file.html|zip) so the
  // dashboard stops linking to a gone file. (No-op for already-orphaned rows.)
  const docPaths = toDelete.filter((p) => p.split('/').length === 2 && /\.(html|zip)$/i.test(p));
  for (let i = 0; i < docPaths.length; i += 100) {
    await sb.from('results').update({ report_path: null }).in('report_path', docPaths.slice(i, i + 100));
  }

  return json({ ok: true, days, delAudio, delReports, deleted, html, zip, m4a });
});
