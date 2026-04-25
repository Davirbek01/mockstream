// =====================================================================
// Supabase Edge Function: telegram-bot-webhook
// ---------------------------------------------------------------------
// Receives Telegram bot updates and runs an admin-only conversation
// for managing VIP codes per center.
//
// Flow:
//   /start  →  "Send super admin passcode"
//   user types digits  →  validate against admin_passcodes(__super__)
//   on success  →  reply keyboard listing all centers
//   tap center  →  inline buttons: 👑 Premium / 🎟 Regular
//   tap type    →  show current code + inline button "🔄 Revoke & New"
//   tap revoke  →  generate new code, update vip_codes, show new code
//
// State is persisted in bot_chat_sessions (per chat_id).
//
// Env:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  — auto-injected
//   TELEGRAM_BOT_TOKEN                       — same bot used by send-to-telegram
//   TELEGRAM_BOT_WEBHOOK_SECRET              — random string; Telegram sends it
//                                              in X-Telegram-Bot-Api-Secret-Token
//
// Deploy:
//   supabase functions deploy telegram-bot-webhook --no-verify-jwt
//
// Register webhook (one-time, after deploy):
//   curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
//     -d "url=https://<project>.supabase.co/functions/v1/telegram-bot-webhook" \
//     -d "secret_token=<TELEGRAM_BOT_WEBHOOK_SECRET>"
// =====================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL       = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const BOT_TOKEN          = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';
const WEBHOOK_SECRET     = Deno.env.get('TELEGRAM_BOT_WEBHOOK_SECRET') || '';

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Sessions older than this are treated as logged-out.
const AUTH_TTL_MS = 30 * 60 * 1000; // 30 min

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function ctEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

function genCode(length = 8): string {
  const buf = new Uint32Array(length);
  crypto.getRandomValues(buf);
  let out = '';
  for (let i = 0; i < length; i++) out += String(buf[i] % 10);
  return out;
}

async function tg(method: string, payload: Record<string, unknown>): Promise<unknown> {
  try {
    const r = await fetch(`${TG_API}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await r.json().catch(() => ({}));
  } catch (e) {
    console.warn('[bot] tg fetch failed', method, e);
    return null;
  }
}

function send(chat_id: number, text: string, extra: Record<string, unknown> = {}) {
  return tg('sendMessage', { chat_id, text, parse_mode: 'HTML', ...extra });
}

function answerCb(callback_query_id: string, text?: string) {
  return tg('answerCallbackQuery', { callback_query_id, text: text || '' });
}

function editText(chat_id: number, message_id: number, text: string, extra: Record<string, unknown> = {}) {
  return tg('editMessageText', { chat_id, message_id, text, parse_mode: 'HTML', ...extra });
}

// ─────────────────────────────────────────────────────────────────────
// Session
// ─────────────────────────────────────────────────────────────────────

interface Session {
  chat_id: number;
  username: string | null;
  authed: boolean;
  authed_at: string | null;
  current_center: string | null;
  state: string;
}

async function loadSession(chat_id: number, username: string | null): Promise<Session> {
  const { data } = await sb
    .from('bot_chat_sessions')
    .select('*')
    .eq('chat_id', chat_id)
    .maybeSingle();

  if (data) {
    // Expire stale auth
    if (data.authed && data.authed_at) {
      const age = Date.now() - new Date(data.authed_at).getTime();
      if (age > AUTH_TTL_MS) {
        data.authed = false;
        data.state = 'await_passcode';
        await sb.from('bot_chat_sessions').update({
          authed: false, state: 'await_passcode', updated_at: new Date().toISOString()
        }).eq('chat_id', chat_id);
      }
    }
    return data as Session;
  }

  const fresh: Session = {
    chat_id,
    username,
    authed: false,
    authed_at: null,
    current_center: null,
    state: 'await_passcode'
  };
  await sb.from('bot_chat_sessions').insert(fresh);
  return fresh;
}

async function saveSession(s: Partial<Session> & { chat_id: number }) {
  await sb.from('bot_chat_sessions').upsert({
    ...s, updated_at: new Date().toISOString()
  });
}

// ─────────────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────────────

async function isSuperAdminPasscode(passcode: string): Promise<boolean> {
  if (!passcode) return false;
  const { data } = await sb
    .from('admin_passcodes')
    .select('passcode')
    .eq('center', '__super__')
    .maybeSingle();
  if (!data) return false;
  return ctEq(data.passcode, passcode);
}

// ─────────────────────────────────────────────────────────────────────
// UI builders
// ─────────────────────────────────────────────────────────────────────

async function sendCenterMenu(chat_id: number) {
  const { data: centers } = await sb.from('centers').select('id, display_name').order('display_name');
  const list = centers ?? [];
  if (!list.length) {
    return send(chat_id, '⚠️ No centers found.\n\nAdd centers via the Code Management panel first.');
  }

  // Build a 2-column reply keyboard. Each button is just the display_name.
  const rows: Array<Array<{ text: string }>> = [];
  for (let i = 0; i < list.length; i += 2) {
    const row = [{ text: list[i].display_name }];
    if (list[i + 1]) row.push({ text: list[i + 1].display_name });
    rows.push(row);
  }
  rows.push([{ text: '🔄 Refresh' }, { text: '🚪 Logout' }]);

  return send(chat_id,
    '🏫 <b>Select a center</b> to manage its codes:',
    {
      reply_markup: {
        keyboard: rows,
        resize_keyboard: true,
        is_persistent: true
      }
    }
  );
}

async function sendCenterTypePrompt(chat_id: number, center_id: string, center_name: string) {
  return send(chat_id,
    `🏫 <b>${esc(center_name)}</b>\n\nWhich VIP code do you want?`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '👑 Premium', callback_data: `type:${center_id}:premium` },
            { text: '🎟 Regular', callback_data: `type:${center_id}:regular` }
          ],
          [{ text: '⬅️ Back to centers', callback_data: 'back:centers' }]
        ]
      }
    }
  );
}

async function sendVipCodeCard(chat_id: number, center_id: string, center_name: string, type: 'premium' | 'regular', message_id?: number) {
  const { data } = await sb
    .from('vip_codes')
    .select('code, expires_at, last_renewed_at')
    .eq('center', center_id)
    .eq('type', type)
    .maybeSingle();

  const typeLabel = type === 'premium' ? '👑 Premium' : '🎟 Regular';
  let text: string;
  if (!data) {
    text =
      `🏫 <b>${esc(center_name)}</b> — ${typeLabel}\n\n` +
      `<i>No code yet.</i>\n\n` +
      `Tap below to generate a fresh code.`;
  } else {
    const expiry = data.expires_at
      ? `\n📅 Expires: ${new Date(data.expires_at).toLocaleString('en-GB')}`
      : `\n♾ Never expires`;
    const renewed = data.last_renewed_at
      ? `\n🕒 Last renewed: ${new Date(data.last_renewed_at).toLocaleString('en-GB')}`
      : '';
    text =
      `🏫 <b>${esc(center_name)}</b> — ${typeLabel}\n\n` +
      `<b>Current code:</b>\n<code>${esc(data.code)}</code>` +
      expiry + renewed;
  }

  const kb = {
    inline_keyboard: [
      [{ text: '🔄 Revoke & generate new', callback_data: `renew:${center_id}:${type}` }],
      [
        { text: '⬅️ Back', callback_data: `center:${center_id}` },
        { text: '🏫 Centers', callback_data: 'back:centers' }
      ]
    ]
  };

  if (message_id) {
    return editText(chat_id, message_id, text, { reply_markup: kb });
  }
  return send(chat_id, text, { reply_markup: kb });
}

function esc(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─────────────────────────────────────────────────────────────────────
// Conversation handlers
// ─────────────────────────────────────────────────────────────────────

async function handleMessage(msg: any) {
  const chat_id = msg.chat?.id;
  if (!chat_id) return;
  const username = msg.from?.username || msg.from?.first_name || null;
  const textRaw = String(msg.text || '').trim();
  const session = await loadSession(chat_id, username);

  // /start always resets to passcode prompt (unless already authed)
  if (textRaw === '/start') {
    if (session.authed) {
      await send(chat_id,
        `👋 Welcome back${username ? ', <b>' + esc(username) + '</b>' : ''}!\n\nYou are already signed in.`);
      return sendCenterMenu(chat_id);
    }
    return send(chat_id,
      '🔐 <b>Mock Stream — Code Management</b>\n\n' +
      'Send your <b>super admin passcode</b> to continue.',
      { reply_markup: { remove_keyboard: true } }
    );
  }

  if (textRaw === '/logout' || textRaw === '🚪 Logout') {
    await saveSession({ chat_id, authed: false, authed_at: null, state: 'await_passcode', current_center: null });
    return send(chat_id,
      '🚪 Logged out.\n\nSend /start to sign in again.',
      { reply_markup: { remove_keyboard: true } }
    );
  }

  // ── Not authed yet: treat any message as a passcode attempt ─────────
  if (!session.authed) {
    if (!/^\d{4,8}$/.test(textRaw)) {
      return send(chat_id,
        '❌ Passcode must be 4–8 digits.\n\nSend your super admin passcode:');
    }
    const ok = await isSuperAdminPasscode(textRaw);
    if (!ok) {
      return send(chat_id,
        '❌ Wrong passcode.\n\nTry again:');
    }
    await saveSession({
      chat_id, username, authed: true,
      authed_at: new Date().toISOString(),
      state: 'menu', current_center: null
    });
    await send(chat_id,
      `✅ <b>Authenticated</b> as super admin.\n\n` +
      `Pick a center below. Session lasts 30 min.`);
    return sendCenterMenu(chat_id);
  }

  // ── Authed: handle reply-keyboard taps ──────────────────────────────
  if (textRaw === '🔄 Refresh') {
    return sendCenterMenu(chat_id);
  }

  // Otherwise: did the text match a center display_name?
  const { data: centers } = await sb.from('centers').select('id, display_name');
  const match = (centers ?? []).find(c => c.display_name === textRaw);
  if (match) {
    await saveSession({ chat_id, current_center: match.id, state: 'await_type' });
    return sendCenterTypePrompt(chat_id, match.id, match.display_name);
  }

  // Fallback help
  return send(chat_id,
    `ℹ️ Tap a <b>center button</b> below, or use /logout to end the session.`);
}

async function handleCallback(cb: any) {
  const chat_id = cb.message?.chat?.id;
  const message_id = cb.message?.message_id;
  if (!chat_id) return;
  const username = cb.from?.username || cb.from?.first_name || null;
  const session = await loadSession(chat_id, username);

  if (!session.authed) {
    await answerCb(cb.id, 'Session expired — send /start');
    return send(chat_id, '🔐 Session expired. Send /start.', { reply_markup: { remove_keyboard: true } });
  }

  const data = String(cb.data || '');
  // back:centers
  if (data === 'back:centers') {
    await answerCb(cb.id);
    return sendCenterMenu(chat_id);
  }

  // center:<id>  (re-show type prompt)
  if (data.startsWith('center:')) {
    const center_id = data.slice('center:'.length);
    const { data: c } = await sb.from('centers').select('id, display_name').eq('id', center_id).maybeSingle();
    if (!c) { await answerCb(cb.id, 'Center not found'); return; }
    await saveSession({ chat_id, current_center: c.id, state: 'await_type' });
    await answerCb(cb.id);
    return editText(chat_id, message_id,
      `🏫 <b>${esc(c.display_name)}</b>\n\nWhich VIP code do you want?`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '👑 Premium', callback_data: `type:${c.id}:premium` },
              { text: '🎟 Regular', callback_data: `type:${c.id}:regular` }
            ],
            [{ text: '⬅️ Back to centers', callback_data: 'back:centers' }]
          ]
        }
      }
    );
  }

  // type:<center>:<premium|regular>
  if (data.startsWith('type:')) {
    const [, center_id, type] = data.split(':');
    if (type !== 'premium' && type !== 'regular') { await answerCb(cb.id); return; }
    const { data: c } = await sb.from('centers').select('id, display_name').eq('id', center_id).maybeSingle();
    if (!c) { await answerCb(cb.id, 'Center not found'); return; }
    await answerCb(cb.id);
    return sendVipCodeCard(chat_id, c.id, c.display_name, type as 'premium' | 'regular', message_id);
  }

  // renew:<center>:<premium|regular>
  if (data.startsWith('renew:')) {
    const [, center_id, type] = data.split(':');
    if (type !== 'premium' && type !== 'regular') { await answerCb(cb.id); return; }
    const { data: c } = await sb.from('centers').select('id, display_name').eq('id', center_id).maybeSingle();
    if (!c) { await answerCb(cb.id, 'Center not found'); return; }

    const code = genCode(8);
    const { error } = await sb.from('vip_codes').upsert({
      center: center_id,
      type,
      code,
      expires_at: null,
      last_renewed_at: new Date().toISOString(),
      last_renewed_by: 'bot'
    });
    if (error) {
      await answerCb(cb.id, 'Error generating code');
      return send(chat_id, `❌ Failed to renew code: ${esc(error.message)}`);
    }

    // Audit log
    sb.from('code_audit').insert({
      actor: 'bot',
      action: 'renew_vip',
      center: center_id,
      details: { type, length: 8, via: 'telegram', chat_id, username }
    }).then(() => {});

    await answerCb(cb.id, '✅ New code generated!');
    return sendVipCodeCard(chat_id, c.id, c.display_name, type as 'premium' | 'regular', message_id);
  }

  await answerCb(cb.id);
}

// ─────────────────────────────────────────────────────────────────────
// Main handler
// ─────────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('ok');

  // Verify Telegram secret token (optional but recommended)
  if (WEBHOOK_SECRET) {
    const got = req.headers.get('x-telegram-bot-api-secret-token') || '';
    if (got !== WEBHOOK_SECRET) {
      return new Response('forbidden', { status: 403 });
    }
  }

  let update: any = {};
  try { update = await req.json(); } catch { return new Response('bad json', { status: 400 }); }

  try {
    if (update.message) {
      await handleMessage(update.message);
    } else if (update.callback_query) {
      await handleCallback(update.callback_query);
    }
  } catch (e) {
    console.error('[bot] handler error', e);
  }

  // Always 200 so Telegram doesn't retry storms.
  return new Response('ok');
});
