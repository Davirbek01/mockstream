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
  TAKE_MOCK:  '🎯 Take Mock',  OPEN_WEB:   '🌐 Open in browser',  ADMIN:      '👨\u200d🏫 Admin',
  SUPPORT:    '💬 Support',
  CANCEL:     '❌ Cancel',
  // admin sub-menu
  MOCK_CODES: '🎫 Mock codes',
  PREMIUM:    '👑 Premium',
  STATS:      '📊 Stats',
  BROADCAST:  '📣 Broadcast',
  LOCK_ADMIN: '🔒 Lock admin',
  MAIN_MENU:  '⬅️ Main menu',
  // support sub-menu
  LEAVE_SUP:  '🚪 Leave Support'
};

function mainKeyboard(cfg: CenterConfig) {
  const rows: unknown[][] = [];
  if (cfg.show_mock_btn) {
    rows.push([{ text: BTN.TAKE_MOCK, web_app: { url: cfg.webapp_url } }]);
    rows.push([{ text: BTN.OPEN_WEB }]);
  }
  const second: unknown[] = [];
  if (cfg.show_admin_btn)   second.push({ text: BTN.ADMIN });
  if (cfg.show_support_btn) second.push({ text: BTN.SUPPORT });
  if (second.length) rows.push(second);
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
    `<b>📱 Take mock — Mobile</b> — opens inside Telegram (best on phone).\n` +
    `<b>💻 Take mock — PC/Mac</b> — full-screen in your browser (best on desktop).\n` +
    (cfg.show_admin_btn ? `<b>👨‍🏫 Admin</b> — center management (passcode).\n` : '') +
    (cfg.show_support_btn ? `<b>💬 Support</b> — message the team.\n` : '')
  );
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
// (lightweight in-memory map per isolate; OK because the wait is short
//  and falls back gracefully if the user re-/start's)
// ─────────────────────────────────────────────────────────────────────
const PASSCODE_PROMPT = new Map<string, number>();   // key = `${centerId}:${tgUserId}` → set time ms
const PROMPT_TTL_MS   = 5 * 60 * 1000;
function setAwaitingPasscode(centerId: string, tgUserId: number) {
  PASSCODE_PROMPT.set(`${centerId}:${tgUserId}`, Date.now());
}
function isAwaitingPasscode(centerId: string, tgUserId: number): boolean {
  const k = `${centerId}:${tgUserId}`;
  const t = PASSCODE_PROMPT.get(k);
  if (!t) return false;
  if (Date.now() - t > PROMPT_TTL_MS) { PASSCODE_PROMPT.delete(k); return false; }
  return true;
}
function clearAwaitingPasscode(centerId: string, tgUserId: number) {
  PASSCODE_PROMPT.delete(`${centerId}:${tgUserId}`);
}

// ─────────────────────────────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────────────────────────────
async function showMainMenu(cfg: CenterConfig, chatId: number, firstName: string) {
  await send(cfg.bot_token, chatId, welcomeText(cfg, firstName), {
    reply_markup: mainKeyboard(cfg)
  });
}

async function showAdminMenu(cfg: CenterConfig, chatId: number) {
  await send(cfg.bot_token, chatId, adminMenuText(cfg), {
    reply_markup: adminInlineKeyboard()
  });
}

async function handleAdminTap(cfg: CenterConfig, chatId: number, tgUserId: number) {
  if (await isAdminUnlocked(cfg.center_id, tgUserId)) {
    await showAdminMenu(cfg, chatId);
    return;
  }
  setAwaitingPasscode(cfg.center_id, tgUserId);
  await send(cfg.bot_token, chatId,
    `🔐 <b>Admin passcode required</b>\n\nReply with the admin passcode for <b>${esc(cfg.center_id)}</b>.\nTap <b>${BTN.CANCEL}</b> to go back.`,
    { reply_markup: passcodeKeyboard() });
}

async function handlePasscodeAttempt(cfg: CenterConfig, chatId: number, tgUserId: number, text: string) {
  const expected = await getAdminPasscode(cfg.center_id);
  const supplied = text.trim();
  if (expected && ctEq(expected, supplied)) {
    clearAwaitingPasscode(cfg.center_id, tgUserId);
    await unlockAdmin(cfg.center_id, tgUserId);
    await send(cfg.bot_token, chatId, `✅ <b>Admin unlocked</b> for 12 hours.`);
    await showAdminMenu(cfg, chatId);
  } else {
    await send(cfg.bot_token, chatId, `❌ Wrong passcode. Try again or tap ${BTN.CANCEL}.`);
  }
}

async function handleSupportEnter(cfg: CenterConfig, chatId: number, tgUserId: number) {
  await setSupportMode(cfg.center_id, tgUserId, true);
  await send(cfg.bot_token, chatId,
    `💬 <b>Support mode</b>\n\nSend any message and we'll forward it to the team. We reply right here.\n\nTap <b>${BTN.LEAVE_SUP}</b> when you're done.`,
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
      clearAwaitingPasscode(cfg.center_id, tgUserId);
      await setSupportMode(cfg.center_id, tgUserId, false);
      await showMainMenu(cfg, chatId, firstName);
      return new Response('ok');
    }

    // ── Cancel from passcode prompt ──────────────────────────────────
    if (text === BTN.CANCEL && isAwaitingPasscode(cfg.center_id, tgUserId)) {
      clearAwaitingPasscode(cfg.center_id, tgUserId);
      await showMainMenu(cfg, chatId, firstName);
      return new Response('ok');
    }

    // ── Awaiting admin passcode ──────────────────────────────────────
    if (isAwaitingPasscode(cfg.center_id, tgUserId)) {
      await handlePasscodeAttempt(cfg, chatId, tgUserId, text);
      return new Response('ok');
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
    if (text === BTN.OPEN_WEB) {
      if (!cfg.show_mock_btn) {
        await send(cfg.bot_token, chatId, 'Mock button is disabled.');
      } else {
        await send(cfg.bot_token, chatId,
          `🌐 <b>Open Mock Stream in your browser</b>\n\n` +
          `<a href="${esc(cfg.webapp_url)}">${esc(cfg.webapp_url)}</a>\n\n` +
          `<i>Tap the link above — it opens in Chrome / Edge / Safari at full size.</i>`,
          { disable_web_page_preview: false });
      }
      return new Response('ok');
    }

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
