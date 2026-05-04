// =====================================================================
// Supabase Edge Function: telegram-center-bot
// ---------------------------------------------------------------------
// Student-facing Telegram bot, one per center, served by a single
// dispatcher. Routes by `?center=<id>` query string in the webhook URL.
//
// /start  →  shows 3 buttons:
//   👨‍🏫 Admin     — passcode-gated (uses public.admin_passcodes for the center)
//   🎯 Take Mock   — opens the Mini App (web_app button → site landing page)
//   💬 Support    — relays subsequent messages to bot_support_messages
//
// All buttons can be individually toggled per-center via center_bots.show_*
//
// Webhook URL pattern:
//   https://<project>.functions.supabase.co/telegram-center-bot?center=mock_stream
//
// Secret per bot: the token lives in a Supabase secret whose name is in
// center_bots.bot_token_env (e.g. MOCK_STREAM_CENTER_BOT_TOKEN).
//
// Deploy:
//   supabase functions deploy telegram-center-bot --no-verify-jwt
//
// Set webhook (one time, per bot):
//   curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
//        -d "url=https://<project>.functions.supabase.co/telegram-center-bot?center=mock_stream"
// =====================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Manager bot that owns the full admin panel — every center hands off here.
const MANAGER_BOT_USERNAME = 'MS23_manager_bot';
const SUPPORT_BOT_USERNAME = 'MS23_support1_bot';

// ─────────────────────────────────────────────────────────────────────
// Telegram helpers (per-bot — token is resolved per request)
// ─────────────────────────────────────────────────────────────────────
async function tg(token: string, method: string, payload: Record<string, unknown>) {
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await r.json().catch(() => ({}));
  } catch (e) {
    console.warn('[center-bot] tg fetch failed', method, e);
    return null;
  }
}
const send = (token: string, chat_id: number, text: string, extra: Record<string, unknown> = {}) =>
  tg(token, 'sendMessage', { chat_id, text, parse_mode: 'HTML', ...extra });
const editText = (token: string, chat_id: number, message_id: number, text: string, extra: Record<string, unknown> = {}) =>
  tg(token, 'editMessageText', { chat_id, message_id, text, parse_mode: 'HTML', ...extra });
const answerCb = (token: string, callback_query_id: string, text?: string) =>
  tg(token, 'answerCallbackQuery', { callback_query_id, text: text || '' });

function ctEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
function esc(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─────────────────────────────────────────────────────────────────────
// Center config loader (cached briefly per invocation)
// ─────────────────────────────────────────────────────────────────────
interface CenterConfig {
  center_id: string;
  bot_token: string;
  webapp_url: string;
  show_admin_btn: boolean;
  show_mock_btn: boolean;
  show_support_btn: boolean;
  show_dict_btn: boolean;
  active: boolean;
}

async function loadCenterConfig(centerId: string): Promise<CenterConfig | null> {
  const { data, error } = await sb
    .from('center_bots')
    .select('*')
    .eq('center_id', centerId)
    .maybeSingle();
  if (error || !data) {
    console.warn('[center-bot] no config for center', centerId, error?.message);
    return null;
  }
  if (!data.active) {
    console.log('[center-bot] center', centerId, 'is disabled');
    return null;
  }
  const tokenEnv = String(data.bot_token_env || '').trim();
  const token = tokenEnv ? Deno.env.get(tokenEnv) : null;
  if (!token) {
    console.error('[center-bot] missing secret', tokenEnv, 'for center', centerId);
    return null;
  }
  return {
    center_id:        data.center_id,
    bot_token:        token,
    webapp_url:       String(data.webapp_url || ''),
    show_admin_btn:   data.show_admin_btn !== false,
    show_mock_btn:    data.show_mock_btn  !== false,
    show_support_btn: data.show_support_btn !== false,
    show_dict_btn:    data.show_dict_btn !== false,
    active:           data.active !== false
  };
}

async function getAdminPasscode(centerId: string): Promise<string | null> {
  const { data } = await sb
    .from('admin_passcodes')
    .select('passcode')
    .eq('center', centerId)
    .maybeSingle();
  return data?.passcode ? String(data.passcode) : null;
}

// ─────────────────────────────────────────────────────────────────────
// UI builders — persistent ReplyKeyboard (big buttons in place of input)
// ─────────────────────────────────────────────────────────────────────
const BTN = {
  TAKE_MOCK:  '🎯 Take Mock',
  ADMIN:      '👨\u200d🏫 Admin',
  SUPPORT:    '🎁 Code',
  DICT:       '📖 Dictionary',
  CANCEL:     '❌ Cancel',
  // admin sub-menu
  MOCK_CODES: '🎫 Mock codes',
  PREMIUM:    '👑 Premium',
  STATS:      '📊 Stats',
  BROADCAST:  '📣 Broadcast',
  LOCK_ADMIN: '🔒 Lock admin',
  MAIN_MENU:  '⬅️ Main menu',
  // support sub-menu
  LEAVE_SUP:  '🚪 Leave Code'
};

function mainKeyboard(cfg: CenterConfig) {
  const rows: unknown[][] = [];
  if (cfg.show_mock_btn) {
    // Single full-width Take Mock button — opens the site as a fullscreen
    // Mini App via Telegram.WebApp.requestFullscreen() in index.html.
    rows.push([
      { text: BTN.TAKE_MOCK, web_app: { url: cfg.webapp_url } }
    ]);
  }
  const second: unknown[] = [];
  if (cfg.show_admin_btn)   second.push({ text: BTN.ADMIN });
  if (cfg.show_support_btn) second.push({ text: BTN.SUPPORT });
  if (second.length) rows.push(second);
  // Dictionary sits on its own row beneath Admin/Code so it's full-width and
  // recognisable as a separate utility (it deep-links to the support bot
  // straight into Dictionary mode).
  if (cfg.show_dict_btn) rows.push([{ text: BTN.DICT }]);
  return {
    keyboard:        rows,
    resize_keyboard: true,
    is_persistent:   true
  };
}

function adminKeyboard(cfg: CenterConfig) {
  // Admin shares the same main keyboard — actual code management lives in the manager bot.
  return mainKeyboard(cfg);
}

function supportKeyboard() {
  return {
    keyboard:        [[{ text: BTN.LEAVE_SUP }]],
    resize_keyboard: true,
    is_persistent:   true
  };
}

function passcodeKeyboard() {
  return {
    keyboard:        [[{ text: BTN.CANCEL }]],
    resize_keyboard: true,
    is_persistent:   true,
    one_time_keyboard: false
  };
}

function welcomeText(cfg: CenterConfig, firstName: string): string {
  return (
    `<b>👋 Welcome, ${esc(firstName || 'student')}!</b>\n\n` +
    `<b>🎯 Take Mock</b> — open the platform in fullscreen and take a mock now.\n` +
    (cfg.show_admin_btn   ? `<b>👨‍🏫 Admin</b> — center management (passcode).\n` : '') +
    (cfg.show_support_btn ? `<b>🎁 Code</b> — free regular mock codes &amp; AI help.\n` : '') +
    (cfg.show_dict_btn    ? `<b>📖 Dictionary</b> — quick English ⇄ Uzbek lookup.\n` : '') +
    `\n<i>Need a free code right now or want help from AI? Tap below ⤵️</i>`
  );
}

function supportBotInlineKeyboard(centerId: string) {
  return {
    inline_keyboard: [[
      { text: '🆓 Free codes & AI help',
        url: `https://t.me/${SUPPORT_BOT_USERNAME}?start=${encodeURIComponent(centerId)}` }
    ]]
  };
}

function adminMenuText(cfg: CenterConfig): string {
  return (
    `<b>✅ Admin unlocked — ${esc(cfg.center_id)}</b>\n\n` +
    `Tap the button below to open the full code-management panel in <b>@${esc(MANAGER_BOT_USERNAME)}</b>.\n\n` +
    `• 👑 Premium / 🎟 Regular passcodes\n` +
    `• 📚 Mock codes per skill\n` +
    `• 🔄 Revoke & regenerate\n\n` +
    `<i>You'll be asked for the same passcode (<b>${esc(cfg.center_id)}</b>) once — then you'll see only your center.</i>`
  );
}

function adminInlineKeyboard() {
  return {
    inline_keyboard: [[
      { text: '🔓 Open admin panel', url: `https://t.me/${MANAGER_BOT_USERNAME}` }
    ]]
  };
}

// ─────────────────────────────────────────────────────────────────────
// Admin / support state helpers
// ─────────────────────────────────────────────────────────────────────
async function isAdminUnlocked(centerId: string, tgUserId: number): Promise<boolean> {
  const { data } = await sb
    .from('center_bot_admin_sessions')
    .select('expires_at')
    .eq('center_id', centerId)
    .eq('tg_user_id', tgUserId)
    .maybeSingle();
  if (!data) return false;
  return new Date(data.expires_at).getTime() > Date.now();
}
async function unlockAdmin(centerId: string, tgUserId: number): Promise<void> {
  await sb.from('center_bot_admin_sessions').upsert({
    center_id:   centerId,
    tg_user_id:  tgUserId,
    unlocked_at: new Date().toISOString(),
    expires_at:  new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
  });
}
async function isInSupportMode(centerId: string, tgUserId: number): Promise<boolean> {
  const { data } = await sb
    .from('center_bot_support_sessions')
    .select('opened_at')
    .eq('center_id', centerId)
    .eq('tg_user_id', tgUserId)
    .maybeSingle();
  return !!data;
}
async function setSupportMode(centerId: string, tgUserId: number, on: boolean): Promise<void> {
  if (on) {
    await sb.from('center_bot_support_sessions').upsert({
      center_id:  centerId,
      tg_user_id: tgUserId,
      opened_at:  new Date().toISOString()
    });
  } else {
    await sb.from('center_bot_support_sessions')
      .delete()
      .eq('center_id', centerId)
      .eq('tg_user_id', tgUserId);
  }
}

// ─────────────────────────────────────────────────────────────────────
// Per-user state for "awaiting passcode entry"
// Persisted in DB because Edge Function isolates are ephemeral — an
// in-memory Map would silently lose the flag between the prompt request
// and the user's reply (often served by a different cold isolate).
// ─────────────────────────────────────────────────────────────────────
const PROMPT_TTL_MINUTES = 5;
async function setAwaitingPasscode(centerId: string, tgUserId: number) {
  await sb.from('center_bot_passcode_prompts').upsert({
    center_id:  centerId,
    tg_user_id: tgUserId,
    set_at:     new Date().toISOString()
  });
}
async function isAwaitingPasscode(centerId: string, tgUserId: number): Promise<boolean> {
  const { data } = await sb
    .from('center_bot_passcode_prompts')
    .select('set_at')
    .eq('center_id', centerId)
    .eq('tg_user_id', tgUserId)
    .maybeSingle();
  if (!data) return false;
  const ageMs = Date.now() - new Date(data.set_at).getTime();
  if (ageMs > PROMPT_TTL_MINUTES * 60 * 1000) {
    await clearAwaitingPasscode(centerId, tgUserId);
    return false;
  }
  return true;
}
async function clearAwaitingPasscode(centerId: string, tgUserId: number) {
  await sb.from('center_bot_passcode_prompts')
    .delete()
    .eq('center_id',  centerId)
    .eq('tg_user_id', tgUserId);
}

// ─────────────────────────────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────────────────────────────
async function showMainMenu(cfg: CenterConfig, chatId: number, firstName: string) {
  await send(cfg.bot_token, chatId, welcomeText(cfg, firstName), {
    reply_markup: mainKeyboard(cfg)
  });
  // (The "Free helper bot" inline-button promo used to live here as a
  // follow-up message but was removed: the 🎁 Code button already routes
  // users to the same support bot, and 📖 Dictionary covers lookup —
  // there's no longer a separate path that needs advertising.)
}

async function showAdminMenu(cfg: CenterConfig, chatId: number) {
  await send(cfg.bot_token, chatId, adminMenuText(cfg), {
    reply_markup: adminInlineKeyboard()
  });
}

async function handleAdminTap(cfg: CenterConfig, chatId: number, tgUserId: number) {
  // Already unlocked in this 12h window? Skip the passcode prompt.
  if (await isAdminUnlocked(cfg.center_id, tgUserId)) {
    await clearAwaitingPasscode(cfg.center_id, tgUserId); // drop any stale flag
    await showAdminMenu(cfg, chatId);
    return;
  }
  // Otherwise prompt for the center's admin passcode.
  await setAwaitingPasscode(cfg.center_id, tgUserId);
  await send(cfg.bot_token, chatId,
    `🔐 <b>Admin passcode required</b>\n\nSend the admin passcode for <b>${esc(cfg.center_id)}</b>.\n\nTap <b>${BTN.CANCEL}</b> to abort.`,
    { reply_markup: passcodeKeyboard() });
}

async function handlePasscodeAttempt(cfg: CenterConfig, chatId: number, tgUserId: number, firstName: string, text: string) {
  if (text === BTN.CANCEL || /^\/cancel\b/i.test(text)) {
    await clearAwaitingPasscode(cfg.center_id, tgUserId);
    await send(cfg.bot_token, chatId, `❌ Cancelled.`);
    await showMainMenu(cfg, chatId, firstName);
    return;
  }
  const expected = await getAdminPasscode(cfg.center_id);
  if (!expected) {
    await clearAwaitingPasscode(cfg.center_id, tgUserId);
    await send(cfg.bot_token, chatId,
      `⚠️ No admin passcode is configured for this center.\nAsk the owner to add one in <code>admin_passcodes</code>.`);
    await showMainMenu(cfg, chatId, firstName);
    return;
  }
  if (!ctEq(text.trim(), expected.trim())) {
    await send(cfg.bot_token, chatId, `❌ Wrong passcode. Try again or tap <b>${BTN.CANCEL}</b>.`);
    return;
  }
  // ✓ unlocked
  await clearAwaitingPasscode(cfg.center_id, tgUserId);
  await unlockAdmin(cfg.center_id, tgUserId);
  await showAdminMenu(cfg, chatId);
}

async function handleSupportEnter(cfg: CenterConfig, chatId: number, tgUserId: number) {
  await setSupportMode(cfg.center_id, tgUserId, true);
  // Code mode keeps the support-bot promo because that's literally what
  // the button does — surface free codes + AI help. Removed from the
  // welcome flow only (where it was redundant alongside the new buttons).
  await send(cfg.bot_token, chatId,
    `🆓 <b>Free helper bot</b>\n\n` +
    `Get a free regular mock code, ask AI any question or use the dictionary — all in one place.`,
    { reply_markup: supportBotInlineKeyboard(cfg.center_id) });
  await send(cfg.bot_token, chatId,
    `🎁 <b>Code mode</b>\n\nGrab a free regular mock code from our helper bot above. ` +
    `If you'd rather talk to a human from the team, just send any message below and we'll forward it — we reply right here.\n\n` +
    `Tap <b>${BTN.LEAVE_SUP}</b> when you're done.`,
    { reply_markup: supportKeyboard() });
}

async function handleSupportMessage(
  cfg: CenterConfig,
  chatId: number,
  tgUserId: number,
  username: string | null,
  displayName: string,
  text: string
) {
  const trimmed = text.trim();
  if (!trimmed) return;
  await sb.from('bot_support_messages').insert({
    center_id:         cfg.center_id,
    source:            'support',
    from_tg_user_id:   tgUserId,
    from_username:     username,
    from_display_name: displayName,
    body:              trimmed.slice(0, 4000)
  });
  await send(cfg.bot_token, chatId, `📨 Sent. We'll reply here as soon as possible.`);
}

async function handleAdminAction(cfg: CenterConfig, chatId: number, label: string) {
  await send(cfg.bot_token, chatId,
    `🛠 <b>${esc(label)}</b> — coming in the next update.\n\n` +
    `For now, manage these from the website's <b>Code Management</b> panel.`);
}

// ─────────────────────────────────────────────────────────────────────
// Webhook entry
// ─────────────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === 'GET') return new Response('telegram-center-bot online', { status: 200 });
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  const url = new URL(req.url);
  const centerId = (url.searchParams.get('center') || '').trim();
  if (!centerId) {
    console.warn('[center-bot] missing ?center query');
    return new Response('missing center', { status: 400 });
  }

  const cfg = await loadCenterConfig(centerId);
  if (!cfg) return new Response('center not configured', { status: 404 });

  let update: Record<string, unknown>;
  try { update = await req.json(); }
  catch { return new Response('bad json', { status: 400 }); }

  try {
    // We no longer use inline callback buttons; ignore any stray callback_query.
    if (update.callback_query) {
      const cb = update.callback_query as Record<string, unknown>;
      await answerCb(cfg.bot_token, String(cb.id));
      return new Response('ok');
    }

    // ── plain message ─────────────────────────────────────────────────
    const message = update.message as Record<string, unknown> | undefined;
    if (!message) return new Response('ok');

    const chat       = (message.chat as Record<string, unknown>) || {};
    const from       = (message.from as Record<string, unknown>) || {};
    const chatId     = Number(chat.id);
    const tgUserId   = Number(from.id);
    const username   = (from.username as string | undefined) || null;
    const firstName  = String(from.first_name || '');
    const lastName   = String(from.last_name  || '');
    const displayNm  = [firstName, lastName].filter(Boolean).join(' ').trim() || (username ? '@' + username : '');
    const text       = String(message.text || '').trim();

    if (!chatId || !tgUserId) return new Response('ok');

    // ── /start /menu /help → reset to main ────────────────────────────
    if (/^\/(start|menu|help)\b/i.test(text)) {
      await clearAwaitingPasscode(cfg.center_id, tgUserId);
      await setSupportMode(cfg.center_id, tgUserId, false);
      await showMainMenu(cfg, chatId, firstName);
      return new Response('ok');
    }

    // Main-menu button taps always escape any pending passcode prompt
    // (otherwise a stale "awaiting" row would treat the button text as
    // the user's passcode attempt → "Wrong passcode" loop).
    const isMenuButton = (
      text === BTN.TAKE_MOCK ||
      text === BTN.ADMIN     || text === BTN.SUPPORT  ||
      text === BTN.DICT      ||
      text === BTN.CANCEL    || text === BTN.LEAVE_SUP
    );

    // ── Awaiting admin passcode ──────────────────────────────────────
    if (!isMenuButton && await isAwaitingPasscode(cfg.center_id, tgUserId)) {
      await handlePasscodeAttempt(cfg, chatId, tgUserId, firstName, text);
      return new Response('ok');
    }
    // If user pressed a menu button, drop any stale awaiting flag.
    if (isMenuButton) {
      await clearAwaitingPasscode(cfg.center_id, tgUserId);
    }

    // ── In support mode ──────────────────────────────────────────────
    if (await isInSupportMode(cfg.center_id, tgUserId)) {
      if (text === BTN.LEAVE_SUP) {
        await setSupportMode(cfg.center_id, tgUserId, false);
        await send(cfg.bot_token, chatId, `👋 You've left support mode.`);
        await showMainMenu(cfg, chatId, firstName);
        return new Response('ok');
      }
      await handleSupportMessage(cfg, chatId, tgUserId, username, displayNm, text);
      return new Response('ok');
    }

    // ── Main / admin menu button taps (text-matched) ─────────────────
    if (text === BTN.ADMIN) {
      if (!cfg.show_admin_btn) {
        await send(cfg.bot_token, chatId, 'Admin button is disabled.');
      } else {
        await handleAdminTap(cfg, chatId, tgUserId);
      }
      return new Response('ok');
    }

    if (text === BTN.SUPPORT) {
      if (!cfg.show_support_btn) {
        await send(cfg.bot_token, chatId, 'Support button is disabled.');
      } else {
        await handleSupportEnter(cfg, chatId, tgUserId);
      }
      return new Response('ok');
    }
    if (text === BTN.DICT) {
      if (!cfg.show_dict_btn) {
        await send(cfg.bot_token, chatId, 'Dictionary button is disabled.');
      } else {
        // Send a one-line message + an inline button that deep-links into
        // the support bot's Dictionary mode (see support-bot /start handler
        // for the `dict_<center>` payload).
        await send(cfg.bot_token, chatId,
          `📖 <b>Dictionary</b> — quick English ⇄ Uzbek lookup.\n\nTap the button below to open it.`,
          { reply_markup: { inline_keyboard: [[
            { text: '📖 Open Dictionary',
              url: `https://t.me/${SUPPORT_BOT_USERNAME}?start=dict_${encodeURIComponent(cfg.center_id)}` }
          ]] } });
      }
      return new Response('ok');
    }

    // ── Admin sub-menu actions (only if admin is unlocked) ───────────
    const isAdmin = await isAdminUnlocked(cfg.center_id, tgUserId);
    if (isAdmin) {
      if (text === BTN.MAIN_MENU) {
        await showMainMenu(cfg, chatId, firstName);
        return new Response('ok');
      }
      if (text === BTN.LOCK_ADMIN) {
        await sb.from('center_bot_admin_sessions')
          .delete()
          .eq('center_id', cfg.center_id)
          .eq('tg_user_id', tgUserId);
        await send(cfg.bot_token, chatId, `🔒 Admin locked.`);
        await showMainMenu(cfg, chatId, firstName);
        return new Response('ok');
      }
    }

    // ── Default: re-show main menu ──────────────────────────────────────────────────────────────────────────────────────────────────
    await showMainMenu(cfg, chatId, firstName);
    return new Response('ok');

  } catch (e) {
    console.error('[center-bot] handler error', e);
    return new Response('ok'); // always 200 so Telegram doesn't retry-spam
  }
});
