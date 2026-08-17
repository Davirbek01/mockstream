// report — serves a stored result report as real text/html.
//
// Supabase Storage forces `text/plain` + nosniff when serving user HTML from the
// public *.supabase.co domain (anti-XSS), so opening a report's public URL shows
// raw source. Edge Function responses are NOT subject to that override, so this
// fetches the report from the `reports` bucket and returns it as text/html —
// making "View full report", Share links, and Telegram links render properly.
//
// GET /functions/v1/report?p=<center>/<uuid>.html
// Deploy with --no-verify-jwt (report links are public, same as the bucket was).
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
// @ts-ignore - plain ESM modules shared with report-locked + the local harness
import { renderStored } from './renderStored.js';
// @ts-ignore - shared with report-locked
import { withAudioFallback } from './audioFallback.js';

const SB_URL = Deno.env.get('SUPABASE_URL')!;
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
  const url = new URL(req.url);
  const p = (url.searchParams.get('p') || '').trim();
  // Serve "<center>/<uuid>.html" (legacy stored reports) or "<center>/<uuid>.json"
  // (attempt payloads rendered on the fly). Anything else is blocked — no traversal.
  if (!/^[a-z0-9_-]+\/[0-9a-fA-F-]+\.(html|json)$/.test(p)) {
    return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
  }
  const sb = createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });
  // Stored html as it stands; a payload rendered fresh on every open, so a
  // design change here improves every past report at once.
  const out = await renderStored(sb, p);
  if (out.error === 'not_found') {
    return new Response('Report not found — it may have been cleared.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  if (out.error) {
    return new Response('Could not render this report: ' + out.error, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  // Speaking reports embed reports-bucket audio URLs; retention deletes the
  // audio before the html — retry any failed player from the GCS archive.
  const html = withAudioFallback(out.html as string);
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'Access-Control-Allow-Origin': '*',
    },
  });
});
