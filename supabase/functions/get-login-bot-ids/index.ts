// get-login-bot-ids — public map of {center_id: telegram_login_bot_id}.
//
// The Telegram Login widget / oauth.telegram.org needs the bot's NUMERIC id.
// Each centre has its own login bot (Telegram allows one /setdomain per bot);
// their tokens live as function secrets (same ones verify-telegram-login uses
// to check auth hashes). A bot token is "<bot_id>:<secret>", so the id is just
// the prefix — no Telegram API call needed and no secret is exposed.
//
// Recreated 2026-06-12: the original deployment was corrupted (LOAD_FUNCTION_ERROR
// 503 on every call; bundle unretrievable) and its source was never committed.
// Deploy with: supabase functions deploy get-login-bot-ids --no-verify-jwt

const TOKEN_ENV_BY_CENTER: Record<string, string> = {
  mock_stream: 'TELEGRAM_LOGIN_BOT_TOKEN',
  bek: 'TELEGRAM_LOGIN_BOT_TOKEN_BEK',
  niners: 'TELEGRAM_LOGIN_BOT_TOKEN_NINERS',
  global: 'TELEGRAM_LOGIN_BOT_TOKEN_GLOBAL',
  muzaffars: 'TELEGRAM_LOGIN_BOT_TOKEN_MUZAFFARS',
  achievers: 'TELEGRAM_LOGIN_BOT_TOKEN_ACHEIVERS', // env name keeps the historic misspelling
  record: 'TELEGRAM_LOGIN_BOT_TOKEN_RECORD',
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

Deno.serve((req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }
  const ids: Record<string, string> = {};
  for (const [center, envName] of Object.entries(TOKEN_ENV_BY_CENTER)) {
    const token = Deno.env.get(envName) || '';
    const m = token.match(/^(\d+):/);
    if (m) ids[center] = m[1];
  }
  return new Response(JSON.stringify(ids), {
    status: 200,
    headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
  });
});
