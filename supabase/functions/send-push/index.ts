// =====================================================================
// Supabase Edge Function: send-push
// ---------------------------------------------------------------------
// Fans a push notification out to registered mobile devices via Expo's
// push service. Two callers:
//
//   1. Admin broadcast (web Tools/push-broadcast.html)
//      POST { userJwt | adminPasscode, center: 'all'|<id>, title, body, data? }
//      - super-admin may target 'all' or any centre
//      - a centre admin is forced to their own centre
//
//   2. Auto "new mock available" DB trigger (notify_new_mock)
//      POST { title, body, data?, center? }  with Authorization: Bearer <service-role>
//      - the service-role bearer authorises a system (super) send
//
// Reads push_tokens with the service role; prunes tokens Expo reports as
// DeviceNotRegistered.
//
// Deploy:  supabase functions deploy send-push --no-verify-jwt
// =====================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const EXPO_PUSH = 'https://exp.host/--/api/v2/push/send';

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

function ctEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

// Centre ids are matched EXACTLY against push_tokens.center_id (which stores the
// app's build-time flavor id, e.g. 'mock_stream', 'bek'). Just normalise case.
function cid(c: unknown): string {
  return typeof c === 'string' ? c.toLowerCase().trim() : '';
}

type Auth =
  | { role: 'super' }
  | { role: 'admin'; center: string }
  | { role: 'none' };

async function authViaJwt(jwt: string): Promise<Auth> {
  if (!jwt) return { role: 'none' };
  let email = '';
  try {
    const { data, error } = await sb.auth.getUser(jwt);
    if (error || !data?.user?.email) return { role: 'none' };
    email = data.user.email.toLowerCase();
  } catch { return { role: 'none' }; }
  if (email === 'davirbekkhasanov02@gmail.com') return { role: 'super' };
  const { data: row } = await sb
    .from('premium_emails')
    .select('center, role, active')
    .eq('email', email).eq('role', 'admin').eq('active', true)
    .maybeSingle();
  if (!row) return { role: 'none' };
  const center = cid(row.center);
  return center ? { role: 'admin', center } : { role: 'super' };
}

async function authViaPasscode(passcode: string): Promise<Auth> {
  if (!passcode) return { role: 'none' };
  const { data } = await sb.from('admin_passcodes').select('center, passcode');
  for (const row of data || []) {
    if (ctEq(row.passcode, passcode)) {
      return row.center === '__super__' ? { role: 'super' } : { role: 'admin', center: cid(row.center) };
    }
  }
  return { role: 'none' };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST')   return json(405, { ok: false, error: 'method' });

  let body: any = {};
  try { body = await req.json(); } catch {}

  const title = (body.title || '').toString().trim();
  const msg   = (body.body  || '').toString().trim();
  const data  = (body.data && typeof body.data === 'object') ? body.data : {};
  if (!title || !msg) return json(400, { ok: false, error: 'title_and_body_required' });

  // ---- authenticate -------------------------------------------------
  const bearer = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  let auth: Auth = { role: 'none' };
  if (bearer && ctEq(bearer, SERVICE_ROLE_KEY)) {
    auth = { role: 'super' };                       // system caller (injected key matches)
  } else if (body.userJwt) {
    auth = await authViaJwt(body.userJwt.toString());
  } else if (body.adminPasscode) {
    auth = await authViaPasscode(body.adminPasscode.toString());
  } else if (bearer && !bearer.startsWith('sb_')) {
    // Could be the vault service-role key (DB trigger / system call — the injected
    // env key isn't always byte-identical to the vault one) or an admin's JWT.
    const { data: ok } = await sb.rpc('_cleanup_token_ok', { p_token: bearer });
    auth = ok === true ? { role: 'super' } : await authViaJwt(bearer);
  }
  if (auth.role === 'none') return json(401, { ok: false, error: 'unauthorized' });

  // ---- resolve audience --------------------------------------------
  // super may pick; a centre admin is locked to their centre.
  const center: string = auth.role === 'admin' ? auth.center : (cid(body.center) || 'all');

  // Log to in-app notification history (so swiped/missed pushes are reviewable).
  // Best-effort — never block the actual push on a logging failure.
  try { await sb.from('notifications').insert({ title, body: msg, data, center }); } catch { /* noop */ }

  let q = sb.from('push_tokens').select('token, center_id');
  if (center !== 'all') q = q.eq('center_id', center);
  const { data: rows, error } = await q;
  if (error) return json(500, { ok: false, error: 'token_query_failed' });

  const tokens = (rows || []).map((r: any) => r.token).filter((t: string) => /^ExponentPushToken\[/.test(t));
  if (!tokens.length) return json(200, { ok: true, sent: 0, failed: 0, note: 'no_devices' });

  // ---- send via Expo (chunks of 100) -------------------------------
  let sent = 0, failed = 0;
  const dead: string[] = [];
  for (let i = 0; i < tokens.length; i += 100) {
    const chunk = tokens.slice(i, i + 100);
    const messages = chunk.map((to: string) => ({
      to, title, body: msg, data, sound: 'default', channelId: 'default', priority: 'high',
    }));
    try {
      const resp = await fetch(EXPO_PUSH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(messages),
      });
      const out = await resp.json().catch(() => ({}));
      const tickets = Array.isArray(out?.data) ? out.data : [];
      tickets.forEach((t: any, idx: number) => {
        if (t?.status === 'ok') sent++;
        else {
          failed++;
          if (t?.details?.error === 'DeviceNotRegistered') dead.push(chunk[idx]);
        }
      });
      if (!tickets.length) failed += chunk.length;
    } catch {
      failed += chunk.length;
    }
  }

  // prune dead tokens so we stop paying to message uninstalled devices
  if (dead.length) {
    for (let i = 0; i < dead.length; i += 100) {
      await sb.from('push_tokens').delete().in('token', dead.slice(i, i + 100));
    }
  }

  return json(200, { ok: true, sent, failed, devices: tokens.length, pruned: dead.length });
});
