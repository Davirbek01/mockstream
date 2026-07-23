// =====================================================================
// Supabase Edge Function: delete-account
// ---------------------------------------------------------------------
// Permanently deletes the CALLING user's account: their saved results
// rows and the auth user itself. Called from the landing-v3 Account tab
// "Danger zone" with the user's own session access token — never with
// the service key from the browser.
//
//   POST /functions/v1/delete-account
//   Authorization: Bearer <user access_token>
//   → { ok: true, results_deleted: N }
//
// Deploy:  supabase functions deploy delete-account --no-verify-jwt
// =====================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

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

  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return json(401, { error: 'missing token' });

  // The token must belong to a real, current session — this is what makes
  // the endpoint safe to expose: you can only delete *yourself*.
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (userErr || !user) return json(401, { error: 'invalid session' });

  const email = (user.email || '').toLowerCase().trim();

  // 1. Personal data across every user-keyed table. Premium entitlement
  //    tables (premium_emails / premium_devices) and ai_submission_logs
  //    are intentionally kept — purchase + operational records belong to
  //    the centre, not the account.
  let resultsDeleted = 0;
  if (email) {
    const { count } = await admin
      .from('results')
      .delete({ count: 'exact' })
      .eq('user_email', email);
    resultsDeleted = count ?? 0;
    for (const [table, col] of [
      ['free_mock_attempts', 'user_email'],
      ['push_tokens', 'user_email'],
      ['speaking_realtime_sessions', 'user_email'],
      ['candidates', 'email'],
    ] as const) {
      try { await admin.from(table).delete().eq(col, email); } catch (_e) { /* best effort */ }
    }
  }
  try { await admin.from('user_telegram_links').delete().eq('user_id', user.id); } catch (_e) { /* best effort */ }

  // 2. The auth account itself.
  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) return json(500, { error: 'account deletion failed: ' + delErr.message });

  return json(200, { ok: true, results_deleted: resultsDeleted });
});
