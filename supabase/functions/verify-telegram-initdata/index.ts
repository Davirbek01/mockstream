// verify-telegram-initdata
// -----------------------------------------------------------------------------
// Server-side verification + auto-sign-in for the Telegram Mini App.
//
// Flow (mirrors verify-telegram-login but for the Mini App's initData
// payload instead of the Login Widget's user object):
//   1. Client posts { initData, center } where initData is the raw URL-
//      encoded string from Telegram.WebApp.initData
//   2. Verify HMAC per https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
//      NOTE the formula is INVERTED vs the Login Widget:
//        Widget:    secret_key = SHA256(bot_token)
//        Mini App:  secret_key = HMAC_SHA256(bot_token, key='WebAppData')
//      "WebAppData" is the HMAC KEY (constant), bot_token is the MESSAGE.
//      Getting this backwards silently 401s.
//   3. Verify auth_date is within 24h
//   4. Same user-lookup logic as verify-telegram-login: by telegram_id in
//      user_telegram_links, else strict name-match against existing auth.users,
//      else create a fresh auth user.
//   5. Upsert bot_users so admin grants by @username resolve correctly later.
//   6. Check premium_emails for an active grant matching this telegram_id OR
//      telegram_username, then mint a magic-link OTP and return it so the
//      client can establish a Supabase session via supabase.auth.verifyOtp.
//
// Token map matches the existing center_bots table (NOT the login bots —
// the Mini App uses each centre's MAIN bot, which is what hosts the Take
// Mock web_app button):
//   MOCK_STREAM_CENTER_BOT_TOKEN  (mockstream / mock_stream)
//   BEK_CENTER_BOT_TOKEN          (bek)
//   NINERS_CENTER_BOT_TOKEN       (niners)
//   GLOBAL_CENTER_BOT_TOKEN       (global)
//   MUZAFFARS_CENTER_BOT_TOKEN    (muzaffars)
//   ACHIEVERS_CENTER_BOT_TOKEN    (achievers)
//   RECORD_CENTER_BOT_TOKEN       (record)
//
// Phase 1 scope: only mockstream is wired up client-side. Other centres
// still fall through to the existing Welcome card. The token map below
// is populated for all 7 so a future client-side change to enable them
// only needs an index.html edit, no function redeploy.
//
// Deploy: supabase functions deploy verify-telegram-initdata --no-verify-jwt
// Revert: delete the function via dashboard or
//   `supabase functions delete verify-telegram-initdata` (if CLI installed)
// -----------------------------------------------------------------------------

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jerr(status: number, code: string, detail?: string) {
  return new Response(JSON.stringify({ error: code, detail: detail ?? null }), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}
function jok(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

async function importHmacKey(keyBytes: ArrayBuffer | Uint8Array): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    keyBytes instanceof Uint8Array ? keyBytes : new Uint8Array(keyBytes),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}
async function hmacBytes(key: CryptoKey, message: string): Promise<ArrayBuffer> {
  return await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
}
function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function normName(s: string | null | undefined): string {
  return String(s ?? '').toLowerCase().trim().replace(/\s+/g, ' ');
}

// Verify the Mini App initData string and return the parsed user, or null
// if the HMAC doesn't match (or any field is missing).
interface VerifiedUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
}
async function verifyInitData(
  initData: string,
  botToken: string,
): Promise<{ user: VerifiedUser; auth_date: number } | null> {
  if (!botToken || !initData) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get('hash') || '';
  if (!hash) return null;
  params.delete('hash');

  const pairs: string[] = [];
  for (const k of Array.from(params.keys()).sort()) {
    pairs.push(`${k}=${params.get(k)}`);
  }
  const dataCheck = pairs.join('\n');

  // secret_key = HMAC_SHA256(bot_token, key="WebAppData") — "WebAppData"
  // is KEY, bot_token is MESSAGE. Inverted vs Login Widget.
  const baseKey   = await importHmacKey(new TextEncoder().encode('WebAppData'));
  const secretBuf = await hmacBytes(baseKey, botToken);
  const secretKey = await importHmacKey(secretBuf);
  const calc = toHex(await hmacBytes(secretKey, dataCheck));
  if (calc !== hash) return null;

  const authDate = Number(params.get('auth_date') || 0);
  if (!authDate || (Math.floor(Date.now() / 1000) - authDate) > 86400) return null;

  const userRaw = params.get('user');
  if (!userRaw) return null;
  let user: VerifiedUser;
  try { user = JSON.parse(userRaw); } catch { return null; }
  if (!user || typeof user.id !== 'number') return null;
  return { user, auth_date: authDate };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST')    return jerr(405, 'method_not_allowed');

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return jerr(400, 'bad_json'); }

  const initData  = typeof body.initData === 'string' ? body.initData : '';
  const centerRaw = typeof body.center === 'string' ? body.center.trim().toLowerCase() : '';
  // The center_bots table uses "mockstream" (no underscore) but the rest
  // of the codebase often refers to it as "mock_stream". Normalise here so
  // either spelling works.
  const center = (centerRaw === 'mock_stream') ? 'mockstream' : (centerRaw || 'mockstream');

  if (!initData) return jerr(400, 'missing_initdata');

  // Mock Stream's Mini App bots — keyed by the same center_id the rest of
  // the codebase uses. Each centre's "main" bot (the one that hosts the
  // Take Mock web_app button) has its token in one of these env vars.
  const TOKEN_ENV_BY_CENTER: Record<string, string> = {
    mockstream: 'MOCK_STREAM_CENTER_BOT_TOKEN',
    bek:        'BEK_CENTER_BOT_TOKEN',
    niners:     'NINERS_CENTER_BOT_TOKEN',
    global:     'GLOBAL_CENTER_BOT_TOKEN',
    muzaffars:  'MUZAFFARS_CENTER_BOT_TOKEN',
    achievers:  'ACHIEVERS_CENTER_BOT_TOKEN',
    record:     'RECORD_CENTER_BOT_TOKEN',
  };
  const envName = TOKEN_ENV_BY_CENTER[center];
  if (!envName) return jerr(400, 'unknown_center', center);
  const botToken = Deno.env.get(envName);
  if (!botToken) return jerr(500, 'bot_token_unset', envName);

  const verified = await verifyInitData(initData, botToken);
  if (!verified) return jerr(401, 'telegram_signature_invalid');

  const u = verified.user;
  const id          = String(u.id);
  const first_name  = u.first_name || '';
  const last_name   = u.last_name  || '';
  const username    = u.username   || '';
  const photo_url   = u.photo_url  || '';
  const language    = u.language_code || '';

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Upsert bot_users so admin @username → telegram_id resolution works
  // later. Fire-and-forget — failure shouldn't block sign-in.
  supabase.from('bot_users').upsert({
    telegram_id:   u.id,
    center_id:     center,
    username:      username || null,
    first_name:    first_name || null,
    last_name:     last_name || null,
    photo_url:     photo_url || null,
    language_code: language  || null,
    is_premium:    u.is_premium === true,
    last_seen:     new Date().toISOString(),
  }, { onConflict: 'telegram_id,center_id' }).then(() => {}).catch(() => {});

  // Find / link / create the Supabase auth user.
  let userId: string;
  let userEmail: string;
  let createdNew = false;
  let mergedFromGoogle = false;

  const { data: existingLink, error: linkErr } = await supabase
    .from('user_telegram_links')
    .select('user_id')
    .eq('telegram_id', id)
    .maybeSingle();
  if (linkErr) return jerr(500, 'link_lookup_failed', linkErr.message);

  if (existingLink?.user_id) {
    userId = existingLink.user_id;
    const { data: uRow, error: getErr } = await supabase.auth.admin.getUserById(userId);
    if (getErr || !uRow?.user?.email) return jerr(500, 'user_fetch_failed', getErr?.message);
    userEmail = uRow.user.email;
    await supabase.from('user_telegram_links')
      .update({ telegram_username: username || null, telegram_photo_url: photo_url || null })
      .eq('telegram_id', id);
  } else {
    // Strict name-match against existing auth.users — same logic as
    // verify-telegram-login so Google-signed users get linked rather than
    // duplicated when they later open the Mini App.
    const candidate = normName(`${first_name} ${last_name}`);
    let matchedUserId: string | null = null;
    let matchedEmail: string | null = null;

    if (candidate) {
      const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      if (listErr) return jerr(500, 'list_users_failed', listErr.message);
      const matches = (list?.users ?? []).filter(u2 => {
        const fn = normName((u2.user_metadata as Record<string, unknown> | null)?.full_name as string | undefined);
        return fn && fn === candidate;
      });
      if (matches.length === 1) {
        matchedUserId = matches[0].id;
        matchedEmail  = matches[0].email ?? null;
      }
    }

    if (matchedUserId && matchedEmail) {
      userId = matchedUserId;
      userEmail = matchedEmail;
      mergedFromGoogle = true;
    } else {
      userEmail = `tg_${id}@telegram.mock-stream.com`;
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: userEmail,
        email_confirm: true,
        user_metadata: {
          full_name: `${first_name} ${last_name}`.trim(),
          first_name,
          last_name,
          telegram_username: username || null,
          telegram_id: id,
          provider: 'telegram',
          source:   'tg_mini_app',
          avatar_url: photo_url || null,
        },
      });
      if (createErr || !created?.user?.id) return jerr(500, 'create_user_failed', createErr?.message);
      userId = created.user.id;
      createdNew = true;
    }

    const { error: insertErr } = await supabase.from('user_telegram_links').insert({
      telegram_id: id,
      user_id: userId,
      telegram_username: username || null,
      telegram_photo_url: photo_url || null,
    });
    if (insertErr) return jerr(500, 'link_insert_failed', insertErr.message);
  }

  // Premium lookup — match by telegram_id (preferred) OR telegram_username
  // (legacy grants made before the telegram_id column existed). Active +
  // not expired.
  let isPremium = false;
  try {
    const orParts: string[] = [`telegram_id.eq.${u.id}`];
    if (username) {
      // ILIKE-style — pg's PostgREST `ilike` operator wants the value
      // wrapped, but for an exact case-insensitive match we just lowercase
      // both sides ourselves and use eq on a normalised expression. Two
      // queries is cleaner than a complex `or`.
    }
    const { data: byId } = await supabase.from('premium_emails')
      .select('id,tier,active,expires_at,telegram_id,telegram_username')
      .eq('telegram_id', u.id)
      .eq('active', true)
      .maybeSingle();
    if (byId && byId.active &&
        (!byId.expires_at || new Date(byId.expires_at).getTime() > Date.now())) {
      isPremium = true;
    } else if (username) {
      const { data: byName } = await supabase.from('premium_emails')
        .select('id,tier,active,expires_at,telegram_username')
        .ilike('telegram_username', username)
        .eq('active', true)
        .maybeSingle();
      if (byName && byName.active &&
          (!byName.expires_at || new Date(byName.expires_at).getTime() > Date.now())) {
        isPremium = true;
        // Opportunistically backfill telegram_id so future lookups are
        // single-hop. Best-effort, ignore errors.
        await supabase.from('premium_emails')
          .update({ telegram_id: u.id })
          .eq('id', byName.id)
          .then(() => {}).catch(() => {});
      }
    }
  } catch (_) { /* default: not premium */ }

  // Mint magic-link OTP. Client uses { email, otp } with supabase.auth.verifyOtp
  // to establish a session — same shape as verify-telegram-login.
  const { data: linkData, error: genErr } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: userEmail,
  });
  if (genErr || !linkData?.properties?.email_otp) {
    return jerr(500, 'magic_link_failed', genErr?.message);
  }

  return jok({
    email: userEmail,
    otp: linkData.properties.email_otp,
    user_id: userId,
    created_new: createdNew,
    merged_from_google: mergedFromGoogle,
    is_premium: isPremium,
    profile: {
      telegram_id: u.id,
      first_name,
      last_name,
      username: username || null,
      photo_url: photo_url || null,
      language_code: language || null,
    },
  });
});
