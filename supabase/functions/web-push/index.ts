// =====================================================================
// Supabase Edge Function: web-push
// ---------------------------------------------------------------------
// Web-Push (VAPID) fan-out to browser/PWA subscriptions stored in
// public.web_push_subs — the WEBSITE twin of send-push (which serves the
// native apps via Expo). Callers:
//
//   1. Auto "new mock available" DB trigger (notify_new_mock_web)
//      POST { title, body, url?, center?, data? }
//      with  Authorization: Bearer <service-role>
//
//   2. Manual/system sends (same service-role bearer).
//
// Prunes subscriptions the push service reports gone (404/410).
//
// Deploy:  supabase functions deploy web-push --no-verify-jwt
// NOTE: VAPID keys are embedded below (function source is server-side
// only). If they ever leak, regenerate with `npx web-push
// generate-vapid-keys` and update VAPID_PUBLIC in site/push-client.js.
// =====================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const VAPID_PUBLIC  = 'BLOG-3UZIHOkfV3JfmU87axC9_90Copk5QirJ9nc9TAwZw-umPpkW0orROSmsj79y7_yPerI-Tcs3N22sAnYnmw';
const VAPID_PRIVATE = 'v8ugkIgRMo-exFhIZbI5MGkiIf7Cly---FsQ15SPJWo';
webpush.setVapidDetails('mailto:davirbekkhasanov02@gmail.com', VAPID_PUBLIC, VAPID_PRIVATE);

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'POST only' });

  // System sends only: the bearer must be the service-role key (DB trigger
  // and server-side callers). Browser clients never call this function.
  // The injected env key isn't always byte-identical to the vault one the
  // trigger sends, so fall back to the vault check RPC (same pattern as
  // send-push).
  const bearer = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  let authed = bearer === SERVICE_ROLE_KEY;
  if (!authed && bearer && !bearer.startsWith('sb_')) {
    const { data: ok } = await sb.rpc('_cleanup_token_ok', { p_token: bearer });
    authed = ok === true;
  }
  if (!authed) return json(401, { error: 'unauthorized' });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json(400, { error: 'bad json' }); }

  const title  = String(body.title || '').slice(0, 120);
  const text   = String(body.body  || '').slice(0, 300);
  const url    = String(body.url   || '/landing-v3.html');
  const center = String(body.center || 'all').toLowerCase().trim();
  if (!title) return json(400, { error: 'title required' });

  let q = sb.from('web_push_subs').select('endpoint,p256dh,auth');
  if (center && center !== 'all') q = q.eq('center_id', center);
  const { data: subs, error } = await q;
  if (error) return json(500, { error: error.message });
  if (!subs || subs.length === 0) return json(200, { sent: 0, pruned: 0 });

  const payload = JSON.stringify({
    title,
    body: text,
    url,
    tag: String((body.data as Record<string, unknown> | undefined)?.type || 'mockstream'),
    data: body.data || {},
  });

  let sent = 0;
  const dead: string[] = [];
  const CHUNK = 50;
  for (let i = 0; i < subs.length; i += CHUNK) {
    await Promise.allSettled(subs.slice(i, i + CHUNK).map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
          { TTL: 24 * 3600 },
        );
        sent++;
      } catch (e) {
        const code = (e as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) dead.push(s.endpoint);
      }
    }));
  }

  if (dead.length) await sb.from('web_push_subs').delete().in('endpoint', dead);

  return json(200, { sent, pruned: dead.length, total: subs.length });
});
