// verify-telegram-login
// -----------------------------------------------------------------------------
// Server-side verification + sign-in for the Telegram Login Widget.
//
// Flow:
//   1. Client widget posts {id, first_name, last_name, username, photo_url,
//      auth_date, hash} from window.onTelegramAuth(user)
//   2. We verify the HMAC-SHA256 hash against the bot token (per
//      https://core.telegram.org/widgets/login#checking-authorization)
//   3. We verify auth_date is within 24h
//   4. Look up the user (by telegram_id, then by strict name-match for
//      Google↔Telegram merging, else create a new auth user)
//   5. Generate a magic-link OTP and return {email, otp} so the client can
//      call supabase.auth.verifyOtp(...) to establish a session
//
// Required Supabase Edge Function secrets:
//   TELEGRAM_LOGIN_BOT_TOKEN    (set via dashboard — token for @mockstream_login_bot
//                                ONLY. The existing TELEGRAM_BOT_TOKEN secret is
//                                used by send-to-telegram + telegram-bot-webhook
//                                for a different bot — do NOT reuse it here.)
//   SUPABASE_URL                (auto-injected)
//   SUPABASE_SERVICE_ROLE_KEY   (auto-injected)
//
// Revert: delete the function via dashboard or
//   `supabase functions delete verify-telegram-login` (if CLI installed)
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

// SHA256 → HMAC-SHA256 of data, return lowercase hex
async function hmacHex(keyBytes: ArrayBuffer | Uint8Array, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes instanceof Uint8Array ? keyBytes : new Uint8Array(keyBytes),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(data: string): Promise<ArrayBuffer> {
  return await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
}

// Strict name-match: lowercased, trimmed, single internal-space normalized
function normName(s: string | null | undefined): string {
  return String(s ?? '').toLowerCase().trim().replace(/\s+/g, ' ');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST')   return jerr(405, 'method_not_allowed');

  // 1. Parse body
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return jerr(400, 'bad_json'); }

  const id          = body.id        != null ? String(body.id)         : '';
  const auth_date   = body.auth_date != null ? String(body.auth_date)  : '';
  const hash        = typeof body.hash === 'string' ? body.hash        : '';
  const first_name  = typeof body.first_name === 'string' ? body.first_name : '';
  const last_name   = typeof body.last_name  === 'string' ? body.last_name  : '';
  const username    = typeof body.username   === 'string' ? body.username   : '';
  const photo_url   = typeof body.photo_url  === 'string' ? body.photo_url  : '';

  if (!id || !auth_date || !hash) return jerr(400, 'missing_fields');

  // 2. Verify HMAC-SHA256 hash per Telegram spec
  //    secret_key = SHA256(bot_token)
  //    data_check_string = sorted "key=value" lines joined by '\n', excluding hash
  const botToken = Deno.env.get('TELEGRAM_LOGIN_BOT_TOKEN');
  if (!botToken) return jerr(500, 'bot_token_unset');

  const fields: Record<string, string> = { id, auth_date };
  if (first_name) fields.first_name = first_name;
  if (last_name)  fields.last_name  = last_name;
  if (username)   fields.username   = username;
  if (photo_url)  fields.photo_url  = photo_url;

  const dataCheckString = Object.keys(fields).sort().map(k => `${k}=${fields[k]}`).join('\n');
  const secretKey = await sha256(botToken);
  const computedHash = await hmacHex(secretKey, dataCheckString);

  if (computedHash !== hash) return jerr(401, 'invalid_hash');

  // 3. auth_date within 24h
  const now = Math.floor(Date.now() / 1000);
  const authDateInt = parseInt(auth_date, 10);
  if (!Number.isFinite(authDateInt) || Math.abs(now - authDateInt) > 86400) {
    return jerr(401, 'auth_expired');
  }

  // 4. Find / link / create user
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let userId: string;
  let userEmail: string;
  let createdNew = false;
  let mergedFromGoogle = false;

  // 4a. Lookup by telegram_id
  const { data: existingLink, error: linkErr } = await supabase
    .from('user_telegram_links')
    .select('user_id')
    .eq('telegram_id', id)
    .maybeSingle();

  if (linkErr) return jerr(500, 'link_lookup_failed', linkErr.message);

  if (existingLink?.user_id) {
    userId = existingLink.user_id;
    const { data: u, error: getErr } = await supabase.auth.admin.getUserById(userId);
    if (getErr || !u?.user?.email) return jerr(500, 'user_fetch_failed', getErr?.message);
    userEmail = u.user.email;

    // Refresh username/photo on every login
    await supabase.from('user_telegram_links')
      .update({ telegram_username: username || null, telegram_photo_url: photo_url || null })
      .eq('telegram_id', id);
  } else {
    // 4b. Strict name match against existing auth.users
    const candidate = normName(`${first_name} ${last_name}`);
    let matchedUserId: string | null = null;
    let matchedEmail: string | null = null;

    if (candidate) {
      // listUsers paginates; for Phase 1 we scan up to 1000 users (covers
      // current scale). If the user base grows past that, replace with a
      // direct SQL query against auth.users.
      const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      if (listErr) return jerr(500, 'list_users_failed', listErr.message);

      const matches = (list?.users ?? []).filter(u => {
        const fn = normName((u.user_metadata as Record<string, unknown> | null)?.full_name as string | undefined);
        return fn && fn === candidate;
      });

      if (matches.length === 1) {
        matchedUserId = matches[0].id;
        matchedEmail  = matches[0].email ?? null;
      }
      // matches.length === 0   → fall through, create new Telegram-only user
      // matches.length >= 2    → ambiguous, also fall through to create new
      //                          (safer than guessing the wrong account; an
      //                          admin can manually link later if needed)
    }

    if (matchedUserId && matchedEmail) {
      userId = matchedUserId;
      userEmail = matchedEmail;
      mergedFromGoogle = true;
    } else {
      // 4c. Create a fresh auth user with synthetic email
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
          avatar_url: photo_url || null,
        },
      });
      if (createErr || !created?.user?.id) {
        return jerr(500, 'create_user_failed', createErr?.message);
      }
      userId = created.user.id;
      createdNew = true;
    }

    // 4d. Insert link row
    const { error: insertErr } = await supabase.from('user_telegram_links').insert({
      telegram_id: id,
      user_id: userId,
      telegram_username: username || null,
      telegram_photo_url: photo_url || null,
    });
    if (insertErr) return jerr(500, 'link_insert_failed', insertErr.message);
  }

  // 5. Generate magic-link OTP for the user → return so client can verifyOtp
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
    needs_legal_name_confirm: createdNew, // client shows the confirmation modal
    profile: {
      first_name,
      last_name,
      username: username || null,
      photo_url: photo_url || null,
    },
  });
});
