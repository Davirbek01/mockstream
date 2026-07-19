// =====================================================================
// Supabase Edge Function: telegram-bot-webhook
// ---------------------------------------------------------------------
// Admin-only Telegram bot for managing VIP + mock codes per center.
//
// Roles
//   • super   → __super__ passcode → sees & manages every center
//   • clone   → per-center passcode → sees & manages only that center
//
// Conversation
//   /start                      → ask passcode
//   passcode entered            → role-aware center menu
//   tap center                  → 👑 Premium / 🎟 Regular / 📚 Mock codes
//   tap Premium/Regular         → show code card + 🔄 Revoke & generate new
//   tap Mock codes              → choose skill (5 buttons)
//   choose skill                → list existing mock # + ➕ New mock #
//   tap mock #                  → show that mock's code + 🔄 Revoke & new
//   tap ➕ New mock #           → bot asks "Send the mock number"
//   user types number           → bot creates code and shows the card
//
// Sessions stored in bot_chat_sessions; auth expires after 30 min.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto),
//      TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_WEBHOOK_SECRET
//
// Deploy:  supabase functions deploy telegram-bot-webhook --no-verify-jwt
// =====================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const BOT_TOKEN        = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';
const WEBHOOK_SECRET   = Deno.env.get('TELEGRAM_BOT_WEBHOOK_SECRET') || '';

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const AUTH_TTL_MS = 30 * 60 * 1000;
const SKILLS = ['listening','reading','writing','speaking','full_mock'] as const;
type Skill = typeof SKILLS[number];
const SKILL_LABEL: Record<Skill, string> = {
  listening:  '🎧 Listening',
  reading:    '📖 Reading',
  writing:    '✍️ Writing',
  speaking:   '🎙 Speaking',
  full_mock:  '🏆 Full Mock'
};

// ─────────────────────────────────────────────────────────────────────
// Telegram + utility helpers
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
function esc(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Per-skill mock counts, synced into site_settings(key='mock_counts') by the
// admin panel whenever it loads on landing.html (where the promocode dicts live).
async function fetchMockCounts(): Promise<Record<'listening'|'reading'|'writing'|'speaking', number>> {
  // Live from mock_tests: highest mock_number per skill, unioned across
  // CEFR + IELTS (a code is keyed by skill+number, no exam dimension). Matches
  // codes-manager get_mock_counts so bot + panel + auto-gen trigger all agree.
  // (Formerly read the stale site_settings.mock_counts blob, which drifted.)
  const def = { listening: 100, reading: 99, writing: 99, speaking: 99 };
  const skills = ['listening', 'reading', 'writing', 'speaking'] as const;
  const out: Record<string, number> = { ...def };
  try {
    for (const s of skills) {
      const { data, error } = await sb.from('mock_tests')
        .select('mock_number')
        .in('mock_type', ['cefr-' + s, 'ielts-' + s])
        .order('mock_number', { ascending: false })
        .limit(1);
      if (error) throw error;
      const n = data && data[0] ? parseInt(String(data[0].mock_number), 10) : 0;
      if (Number.isInteger(n) && n >= 1) out[s] = n;
    }
    return out as typeof def;
  } catch {
    return def;
  }
}
async function tg(method: string, payload: Record<string, unknown>) {
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
const send       = (chat_id: number, text: string, extra: Record<string, unknown> = {}) =>
  tg('sendMessage', { chat_id, text, parse_mode: 'HTML', ...extra });
const editText   = (chat_id: number, message_id: number, text: string, extra: Record<string, unknown> = {}) =>
  tg('editMessageText', { chat_id, message_id, text, parse_mode: 'HTML', ...extra });
const answerCb   = (callback_query_id: string, text?: string) =>
  tg('answerCallbackQuery', { callback_query_id, text: text || '' });

// ─────────────────────────────────────────────────────────────────────
// Session
// ─────────────────────────────────────────────────────────────────────
interface Session {
  chat_id: number;
  username: string | null;
  authed: boolean;
  authed_at: string | null;
  role: 'super' | 'clone' | null;
  current_center: string | null;
  current_skill: string | null;
  state: string;
}

async function loadSession(chat_id: number, username: string | null): Promise<Session> {
  const { data } = await sb.from('bot_chat_sessions').select('*').eq('chat_id', chat_id).maybeSingle();
  if (data) {
    if (data.authed && data.authed_at) {
      const age = Date.now() - new Date(data.authed_at).getTime();
      if (age > AUTH_TTL_MS) {
        await sb.from('bot_chat_sessions').update({
          authed: false, role: null, state: 'await_passcode',
          current_center: null, current_skill: null,
          updated_at: new Date().toISOString()
        }).eq('chat_id', chat_id);
        data.authed = false; data.role = null; data.state = 'await_passcode';
        data.current_center = null; data.current_skill = null;
      }
    }
    return data as Session;
  }
  const fresh: Session = {
    chat_id, username,
    authed: false, authed_at: null, role: null,
    current_center: null, current_skill: null,
    state: 'await_passcode'
  };
  await sb.from('bot_chat_sessions').insert(fresh);
  return fresh;
}

async function saveSession(s: Partial<Session> & { chat_id: number }) {
  await sb.from('bot_chat_sessions').upsert({ ...s, updated_at: new Date().toISOString() });
}

// ─────────────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────────────
type AuthResult =
  | { role: 'super' }
  | { role: 'clone'; center: string }
  | { role: 'none' };

async function authenticate(passcode: string): Promise<AuthResult> {
  if (!/^\d{4,8}$/.test(passcode)) return { role: 'none' };
  const { data } = await sb.from('admin_passcodes').select('center, passcode');
  if (!data) return { role: 'none' };
  for (const row of data) {
    if (ctEq(row.passcode, passcode)) {
      if (row.center === '__super__') return { role: 'super' };
      return { role: 'clone', center: row.center };
    }
  }
  return { role: 'none' };
}

async function ownsCenter(session: Session, center_id: string): Promise<boolean> {
  if (!session.authed) return false;
  if (session.role === 'super') return true;
  return session.role === 'clone' && session.current_center === center_id;
}

// ─────────────────────────────────────────────────────────────────────
// UI builders
// ─────────────────────────────────────────────────────────────────────
async function sendCenterMenu(chat_id: number, session: Session) {
  let centers: Array<{ id: string; display_name: string }> = [];
  if (session.role === 'super') {
    const { data } = await sb.from('centers').select('id, display_name').order('display_name');
    centers = data ?? [];
  } else if (session.role === 'clone' && session.current_center) {
    const { data } = await sb.from('centers').select('id, display_name')
      .eq('id', session.current_center).maybeSingle();
    if (data) centers = [data];
  }

  if (!centers.length) {
    return send(chat_id, '⚠️ No centers available.');
  }

  // Clone admin → jump straight into their single center
  if (session.role === 'clone' && centers.length === 1) {
    await saveSession({ chat_id: session.chat_id, current_center: centers[0].id, state: 'menu' });
    return sendCenterTypePrompt(chat_id, centers[0].id, centers[0].display_name);
  }

  const rows: Array<Array<{ text: string }>> = [];
  for (let i = 0; i < centers.length; i += 2) {
    const row = [{ text: centers[i].display_name }];
    if (centers[i + 1]) row.push({ text: centers[i + 1].display_name });
    rows.push(row);
  }
  rows.push([{ text: '🔄 Refresh' }, { text: '🚪 Logout' }]);

  // NOTE: `is_persistent` removed so the user can collapse the center keyboard
  // via Telegram's standard keyboard-toggle button (the icon next to paperclip).
  return send(chat_id,
    '🏫 <b>Select a center</b> to manage its codes:\n\n<i>Tap the keyboard icon (next to the paperclip) to hide / show these buttons.</i>',
    { reply_markup: { keyboard: rows, resize_keyboard: true } }
  );
}

function centerActionsKeyboard(center_id: string, isClone: boolean) {
  const back = isClone
    ? [{ text: '🚪 Logout', callback_data: 'logout' }]
    : [{ text: '⬅️ Back to centers', callback_data: 'back:centers' }];
  return {
    inline_keyboard: [
      [
        { text: '👑 Premium', callback_data: `type:${center_id}:premium` },
        { text: '🎟 Regular', callback_data: `type:${center_id}:regular` }
      ],
      [{ text: '📚 Mock codes', callback_data: `mock:${center_id}` }],
      back
    ]
  };
}

async function sendCenterTypePrompt(chat_id: number, center_id: string, center_name: string, message_id?: number) {
  // Respect role for the back-button shape
  const { data: sess } = await sb.from('bot_chat_sessions').select('role').eq('chat_id', chat_id).maybeSingle();
  const isClone = sess?.role === 'clone';
  const text = `🏫 <b>${esc(center_name)}</b>\n\nWhat do you want to manage?`;
  const kb   = centerActionsKeyboard(center_id, isClone);
  if (message_id) return editText(chat_id, message_id, text, { reply_markup: kb });
  return send(chat_id, text, { reply_markup: kb });
}

async function sendVipCodeCard(
  chat_id: number, center_id: string, center_name: string,
  type: 'premium' | 'regular', message_id?: number
) {
  const { data } = await sb.from('vip_codes')
    .select('code, expires_at, last_renewed_at, last_renewed_by')
    .eq('center', center_id).eq('type', type).maybeSingle();

  const typeLabel = type === 'premium' ? '👑 Premium' : '🎟 Regular';
  let text: string;
  if (!data) {
    text = `🏫 <b>${esc(center_name)}</b> — ${typeLabel}\n\n<i>No code yet.</i>\n\nTap below to generate one.`;
  } else {
    const expiry  = data.expires_at
      ? `\n📅 Expires: ${new Date(data.expires_at).toLocaleString('en-GB')}`
      : `\n♾ Never expires`;
    const renewed = data.last_renewed_at
      ? `\n🕒 Last renewed: ${new Date(data.last_renewed_at).toLocaleString('en-GB')}` +
        (data.last_renewed_by ? ` <i>by ${esc(data.last_renewed_by)}</i>` : '')
      : '';
    text = `🏫 <b>${esc(center_name)}</b> — ${typeLabel}\n\n` +
           `<b>Current code:</b>\n<code>${esc(data.code)}</code>` + expiry + renewed;
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

  if (message_id) return editText(chat_id, message_id, text, { reply_markup: kb });
  return send(chat_id, text, { reply_markup: kb });
}

async function sendMockSkillsMenu(chat_id: number, center_id: string, center_name: string, message_id?: number) {
  const text = `🏫 <b>${esc(center_name)}</b> — 📚 Mock codes\n\nPick a skill:`;
  const rows = SKILLS.map(s => [{ text: SKILL_LABEL[s], callback_data: `mock_skill:${center_id}:${s}` }]);
  rows.push([{ text: '⚡ Bulk generate (all skills)', callback_data: `mock_bulk:${center_id}` }]);
  rows.push([{ text: '⬅️ Back', callback_data: `center:${center_id}` }]);
  const kb = { inline_keyboard: rows };
  if (message_id) return editText(chat_id, message_id, text, { reply_markup: kb });
  return send(chat_id, text, { reply_markup: kb });
}

async function sendMockListMenu(
  chat_id: number, center_id: string, center_name: string, skill: Skill, message_id?: number, page = 0
) {
  const { data } = await sb.from('mock_codes')
    .select('mock_number')
    .eq('center', center_id).eq('skill', skill);

  // Distinct mock numbers (a mock # can have up to 2 rows: regular + premium)
  const nums = Array.from(new Set((data ?? []).map(m => m.mock_number))).sort((a, b) => a - b);
  // Telegram rejects/truncates inline keyboards past ~100 buttons, so page the
  // grid (40 numbers/page) with ◀️/▶️ nav once a skill exceeds one page.
  const PAGE = 40;
  const pageCount = Math.max(1, Math.ceil(nums.length / PAGE));
  const p = Math.min(Math.max(0, page), pageCount - 1);
  const slice = nums.slice(p * PAGE, (p + 1) * PAGE);
  const lines = [
    `🏫 <b>${esc(center_name)}</b>`,
    `${SKILL_LABEL[skill]} — mock codes`,
    ''
  ];
  if (!nums.length) {
    lines.push('<i>No mock codes yet.</i>', 'Tap ➕ to add one.');
  } else {
    lines.push(`Tap a number to view its 🟢 regular & 🔥 premium codes.`);
    if (pageCount > 1) lines.push('', `Page <b>${p + 1}</b>/${pageCount} · #${slice[0]}–#${slice[slice.length - 1]}`);
  }

  const buttons: Array<Array<{ text: string; callback_data: string }>> = [];
  for (let i = 0; i < slice.length; i += 4) {
    buttons.push(slice.slice(i, i + 4).map(n => ({
      text: `#${n}`,
      callback_data: `mock_code:${center_id}:${skill}:${n}`
    })));
  }
  if (pageCount > 1) {
    const nav: Array<{ text: string; callback_data: string }> = [];
    if (p > 0) nav.push({ text: '◀️ Prev', callback_data: `mock_pg:${center_id}:${skill}:${p - 1}` });
    nav.push({ text: `${p + 1}/${pageCount}`, callback_data: 'noop' });
    if (p < pageCount - 1) nav.push({ text: 'Next ▶️', callback_data: `mock_pg:${center_id}:${skill}:${p + 1}` });
    buttons.push(nav);
  }
  buttons.push([{ text: '➕ New mock #', callback_data: `mock_new:${center_id}:${skill}` }]);
  buttons.push([
    { text: '⬅️ Skills', callback_data: `mock:${center_id}` },
    { text: '🏫 Centers', callback_data: 'back:centers' }
  ]);

  const kb = { inline_keyboard: buttons };
  if (message_id) return editText(chat_id, message_id, lines.join('\n'), { reply_markup: kb });
  return send(chat_id, lines.join('\n'), { reply_markup: kb });
}

// Tier picker: shown when a mock # is tapped. Asks user to choose Regular vs Premium.
async function sendMockCodeCard(
  chat_id: number, center_id: string, center_name: string, skill: Skill, num: number, message_id?: number
) {
  const { data } = await sb.from('mock_codes')
    .select('tier').eq('center', center_id).eq('skill', skill).eq('mock_number', num);
  const has = new Set((data ?? []).map(r => r.tier));
  const regTag = has.has('regular') ? '✅' : '⚪️';
  const preTag = has.has('premium') ? '✅' : '⚪️';

  const text =
    `🏫 <b>${esc(center_name)}</b>\n${SKILL_LABEL[skill]} #${num}\n\n` +
    `Pick the <b>tier</b> you want to manage:\n\n` +
    `${regTag} 🟢 <b>Regular</b>\n<i>Unlocks the mock only — no AI grading, no retries, no transcripts.</i>\n\n` +
    `${preTag} 🔥 <b>Premium</b>\n<i>Unlocks the mock + AI auto-analysis, retries, review screen, and transcripts.</i>`;

  const kb = {
    inline_keyboard: [
      [{ text: '🟢 Regular', callback_data: `mock_tier:${center_id}:${skill}:${num}:regular` }],
      [{ text: '🔥 Premium', callback_data: `mock_tier:${center_id}:${skill}:${num}:premium` }],
      [
        { text: '⬅️ Back', callback_data: `mock_skill:${center_id}:${skill}` },
        { text: '🏫 Centers', callback_data: 'back:centers' }
      ]
    ]
  };
  if (message_id) return editText(chat_id, message_id, text, { reply_markup: kb });
  return send(chat_id, text, { reply_markup: kb });
}

// Single-tier card: shows the chosen tier's code + 3 buttons (Renew, Back, Home).
async function sendMockTierCard(
  chat_id: number, center_id: string, center_name: string,
  skill: Skill, num: number, tier: 'regular' | 'premium', message_id?: number
) {
  const { data } = await sb.from('mock_codes')
    .select('code, expires_at, last_renewed_at')
    .eq('center', center_id).eq('skill', skill).eq('mock_number', num).eq('tier', tier)
    .maybeSingle();

  const tierTitle = tier === 'regular'
    ? '🟢 <b>Regular</b> <i>(unlocks mock only)</i>'
    : '🔥 <b>Premium</b> <i>(unlocks + AI grading + bonus features)</i>';

  let body: string;
  if (!data) {
    body = '<i>— not generated yet —</i>\nTap 🔄 to issue a fresh code.';
  } else {
    const expiry = data.expires_at
      ? `📅 Expires: ${new Date(data.expires_at).toLocaleString('en-GB')}`
      : `♾ Never expires`;
    const renewed = data.last_renewed_at
      ? `\n🕒 Renewed: ${new Date(data.last_renewed_at).toLocaleString('en-GB')}`
      : '';
    body = `<code>${esc(data.code)}</code>\n${expiry}${renewed}`;
  }

  const text =
    `🏫 <b>${esc(center_name)}</b>\n${SKILL_LABEL[skill]} #${num}\n\n` +
    `${tierTitle}\n${body}`;

  const renewLabel = data ? '🔄 Renew' : '➕ Generate';
  const kb = {
    inline_keyboard: [
      [{ text: renewLabel, callback_data: `mock_renew:${center_id}:${skill}:${num}:${tier}` }],
      [{ text: '⬅️ Back', callback_data: `mock_code:${center_id}:${skill}:${num}` }],
      [{ text: '🏫 Home', callback_data: 'back:centers' }]
    ]
  };
  if (message_id) return editText(chat_id, message_id, text, { reply_markup: kb });
  return send(chat_id, text, { reply_markup: kb });
}

// ─────────────────────────────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────────────────────────────
async function handleMessage(msg: any) {
  const chat_id = msg.chat?.id;
  if (!chat_id) return;
  const username = msg.from?.username || msg.from?.first_name || null;
  const textRaw = String(msg.text || '').trim();
  const session = await loadSession(chat_id, username);

  // /start
  if (textRaw === '/start') {
    if (session.authed) {
      await send(chat_id,
        `👋 Welcome back${username ? ', <b>' + esc(username) + '</b>' : ''}!\n\nAlready signed in as <b>${session.role === 'super' ? 'super admin' : 'clone admin'}</b>.`);
      return sendCenterMenu(chat_id, session);
    }
    return send(chat_id,
      '🔐 <b>Mock Stream — Code Management</b>\n\n' +
      'Send your <b>admin passcode</b> to continue.\n' +
      '• Super admins → manage every center\n' +
      '• Clone admins → manage only your own center',
      { reply_markup: { remove_keyboard: true } }
    );
  }

  // /logout
  if (textRaw === '/logout' || textRaw === '🚪 Logout') {
    await saveSession({
      chat_id, authed: false, authed_at: null, role: null,
      current_center: null, current_skill: null, state: 'await_passcode'
    });
    return send(chat_id, '🚪 Logged out.\n\nSend /start to sign in again.',
      { reply_markup: { remove_keyboard: true } });
  }

  // ── Not authed: passcode attempt ─────────────────────────────────
  if (!session.authed) {
    if (!/^\d{4,8}$/.test(textRaw)) {
      return send(chat_id, '❌ Passcode must be 4–8 digits.\n\nSend your admin passcode:');
    }
    const auth = await authenticate(textRaw);
    if (auth.role === 'none') {
      return send(chat_id, '❌ Wrong passcode.\n\nTry again:');
    }
    const center = auth.role === 'clone' ? auth.center : null;
    await saveSession({
      chat_id, username,
      authed: true, authed_at: new Date().toISOString(),
      role: auth.role,
      current_center: center, current_skill: null,
      state: 'menu'
    });
    const greeting = auth.role === 'super'
      ? `✅ <b>Authenticated</b> as super admin.\nPick a center below. Session lasts 30 min.`
      : `✅ <b>Authenticated</b> as clone admin for <b>${esc(center || '')}</b>.\nSession lasts 30 min.`;
    await send(chat_id, greeting);
    const fresh = await loadSession(chat_id, username);
    return sendCenterMenu(chat_id, fresh);
  }

  // ── Authed: state-driven inputs ──────────────────────────────────
  if (session.state === 'await_mock_number'
      && session.current_center && session.current_skill
      && /^\d{1,3}$/.test(textRaw)) {
    const num = parseInt(textRaw, 10);
    if (num < 1 || num > 999) {
      return send(chat_id, '❌ Mock number must be 1–999. Try again:');
    }
    if (!await ownsCenter(session, session.current_center)) {
      return send(chat_id, '❌ Forbidden.');
    }
    const skill = session.current_skill as Skill;
    if (!SKILLS.includes(skill)) {
      return send(chat_id, '❌ Bad skill.');
    }
    // Just open the card. Admin then taps Generate 🟢 / 🔥 to create codes.
    await saveSession({ chat_id, state: 'menu' });
    const { data: c } = await sb.from('centers').select('display_name').eq('id', session.current_center).maybeSingle();
    return sendMockCodeCard(chat_id, session.current_center, c?.display_name || session.current_center, skill, num);
  }

  // Reply-keyboard buttons
  if (textRaw === '🔄 Refresh') return sendCenterMenu(chat_id, session);

  // Center display_name match
  const { data: centers } = await sb.from('centers').select('id, display_name');
  const match = (centers ?? []).find(c => c.display_name === textRaw);
  if (match) {
    if (session.role === 'clone' && session.current_center !== match.id) {
      return send(chat_id, '❌ You can only manage your own center.');
    }
    await saveSession({ chat_id, current_center: match.id, current_skill: null, state: 'menu' });
    return sendCenterTypePrompt(chat_id, match.id, match.display_name);
  }

  return send(chat_id, `ℹ️ Tap a button below, or use /logout.`);
}

async function handleCallback(cb: any) {
  const chat_id    = cb.message?.chat?.id;
  const message_id = cb.message?.message_id;
  if (!chat_id) return;
  const username = cb.from?.username || cb.from?.first_name || null;
  const session  = await loadSession(chat_id, username);

  if (!session.authed) {
    await answerCb(cb.id, 'Session expired — send /start');
    return send(chat_id, '🔐 Session expired. Send /start.', { reply_markup: { remove_keyboard: true } });
  }

  const data = String(cb.data || '');

  // logout
  if (data === 'logout') {
    await answerCb(cb.id);
    await saveSession({
      chat_id, authed: false, authed_at: null, role: null,
      current_center: null, current_skill: null, state: 'await_passcode'
    });
    return send(chat_id, '🚪 Logged out.\n\nSend /start to sign in again.',
      { reply_markup: { remove_keyboard: true } });
  }

  // back:centers
  if (data === 'back:centers') {
    await answerCb(cb.id);
    await saveSession({ chat_id, current_skill: null, state: 'menu' });
    return sendCenterMenu(chat_id, session);
  }

  // center:<id>
  if (data.startsWith('center:')) {
    const center_id = data.slice('center:'.length);
    if (!await ownsCenter({ ...session, current_center: center_id }, center_id) && session.role !== 'super') {
      await answerCb(cb.id, 'Forbidden'); return;
    }
    const { data: c } = await sb.from('centers').select('id, display_name').eq('id', center_id).maybeSingle();
    if (!c) { await answerCb(cb.id, 'Center not found'); return; }
    await saveSession({ chat_id, current_center: c.id, current_skill: null, state: 'menu' });
    await answerCb(cb.id);
    return sendCenterTypePrompt(chat_id, c.id, c.display_name, message_id);
  }

  // type:<center>:<premium|regular>
  if (data.startsWith('type:')) {
    const [, center_id, type] = data.split(':');
    if (type !== 'premium' && type !== 'regular') { await answerCb(cb.id); return; }
    if (!await ownsCenter({ ...session, current_center: center_id }, center_id) && session.role !== 'super') {
      await answerCb(cb.id, 'Forbidden'); return;
    }
    const { data: c } = await sb.from('centers').select('display_name').eq('id', center_id).maybeSingle();
    if (!c) { await answerCb(cb.id, 'Center not found'); return; }
    await answerCb(cb.id);
    return sendVipCodeCard(chat_id, center_id, c.display_name, type as 'premium' | 'regular', message_id);
  }

  // renew:<center>:<premium|regular>
  if (data.startsWith('renew:')) {
    const [, center_id, type] = data.split(':');
    if (type !== 'premium' && type !== 'regular') { await answerCb(cb.id); return; }
    if (!await ownsCenter({ ...session, current_center: center_id }, center_id) && session.role !== 'super') {
      await answerCb(cb.id, 'Forbidden'); return;
    }
    const { data: c } = await sb.from('centers').select('display_name').eq('id', center_id).maybeSingle();
    if (!c) { await answerCb(cb.id, 'Center not found'); return; }
    const code = genCode(8);
    const actor = session.role === 'super' ? 'bot:super' : `bot:clone:${center_id}`;
    const { error } = await sb.from('vip_codes').upsert({
      center: center_id, type, code, expires_at: null,
      last_renewed_at: new Date().toISOString(), last_renewed_by: actor
    });
    if (error) { await answerCb(cb.id, 'Error'); return send(chat_id, `❌ ${esc(error.message)}`); }
    sb.from('code_audit').insert({
      actor: 'bot', action: 'renew_vip', center: center_id,
      details: { type, length: 8, via: 'telegram', chat_id, role: session.role, username }
    }).then(() => {});
    await answerCb(cb.id, '✅ New code generated!');
    return sendVipCodeCard(chat_id, center_id, c.display_name, type as 'premium' | 'regular', message_id);
  }

  // mock:<center>  → skills menu
  if (data.startsWith('mock:')) {
    const center_id = data.slice('mock:'.length);
    if (!await ownsCenter({ ...session, current_center: center_id }, center_id) && session.role !== 'super') {
      await answerCb(cb.id, 'Forbidden'); return;
    }
    const { data: c } = await sb.from('centers').select('display_name').eq('id', center_id).maybeSingle();
    if (!c) { await answerCb(cb.id); return; }
    await saveSession({ chat_id, current_center: center_id, current_skill: null, state: 'menu' });
    await answerCb(cb.id);
    return sendMockSkillsMenu(chat_id, center_id, c.display_name, message_id);
  }

  // mock_skill:<center>:<skill>
  if (data.startsWith('mock_skill:')) {
    const [, center_id, skill] = data.split(':');
    if (!SKILLS.includes(skill as Skill)) { await answerCb(cb.id); return; }
    if (!await ownsCenter({ ...session, current_center: center_id }, center_id) && session.role !== 'super') {
      await answerCb(cb.id, 'Forbidden'); return;
    }
    const { data: c } = await sb.from('centers').select('display_name').eq('id', center_id).maybeSingle();
    if (!c) { await answerCb(cb.id); return; }
    await saveSession({ chat_id, current_center: center_id, current_skill: skill, state: 'menu' });
    await answerCb(cb.id);
    return sendMockListMenu(chat_id, center_id, c.display_name, skill as Skill, message_id);
  }

  // mock_pg:<center>:<skill>:<page> — paginated grid navigation
  if (data.startsWith('mock_pg:')) {
    const [, center_id, skill, pgStr] = data.split(':');
    if (!SKILLS.includes(skill as Skill)) { await answerCb(cb.id); return; }
    if (!await ownsCenter({ ...session, current_center: center_id }, center_id) && session.role !== 'super') {
      await answerCb(cb.id, 'Forbidden'); return;
    }
    const { data: c } = await sb.from('centers').select('display_name').eq('id', center_id).maybeSingle();
    if (!c) { await answerCb(cb.id); return; }
    await answerCb(cb.id);
    return sendMockListMenu(chat_id, center_id, c.display_name, skill as Skill, message_id, parseInt(pgStr, 10) || 0);
  }
  if (data === 'noop') { await answerCb(cb.id); return; }

  // mock_bulk:<center>  → show detected counts + mode buttons
  if (data.startsWith('mock_bulk:')) {
    const center_id = data.slice('mock_bulk:'.length);
    if (!await ownsCenter({ ...session, current_center: center_id }, center_id) && session.role !== 'super') {
      await answerCb(cb.id, 'Forbidden'); return;
    }
    const { data: c } = await sb.from('centers').select('display_name').eq('id', center_id).maybeSingle();
    if (!c) { await answerCb(cb.id); return; }
    await answerCb(cb.id);
    const counts = await fetchMockCounts();
    const total = (counts.listening + counts.reading + counts.writing + counts.speaking) * 2;
    const text =
      `🏫 <b>${esc(c.display_name)}</b> — ⚡ <b>Bulk generate</b>\n\n` +
      `📊 Mocks per skill (auto-detected):\n` +
      `🎧 Listening: <b>${counts.listening}</b>\n` +
      `📖 Reading: <b>${counts.reading}</b>\n` +
      `✏️ Writing: <b>${counts.writing}</b>\n` +
      `🎤 Speaking: <b>${counts.speaking}</b>\n` +
      `<i>Total slots = ${total} (×2 tiers)</i>\n\n` +
      `• <b>Generate missing</b>: keeps existing codes, fills gaps only.\n` +
      `• <b>Regenerate ALL</b>: <u>revokes</u> existing codes and issues fresh ones.`;
    const kb = {
      inline_keyboard: [
        [{ text: '⚡ Generate missing', callback_data: `mock_bulk_run:${center_id}:missing` }],
        [{ text: '🔄 Regenerate ALL', callback_data: `mock_bulk_run:${center_id}:all` }],
        [{ text: '⬅️ Back', callback_data: `mock:${center_id}` }]
      ]
    };
    if (message_id) return editText(chat_id, message_id, text, { reply_markup: kb });
    return send(chat_id, text, { reply_markup: kb });
  }

  // mock_bulk_run:<center>:<mode>  → execute bulk upsert using detected counts
  if (data.startsWith('mock_bulk_run:')) {
    const [, center_id, mode] = data.split(':');
    if (mode !== 'missing' && mode !== 'all') {
      await answerCb(cb.id, 'Bad input'); return;
    }
    if (!await ownsCenter({ ...session, current_center: center_id }, center_id) && session.role !== 'super') {
      await answerCb(cb.id, 'Forbidden'); return;
    }
    const { data: c } = await sb.from('centers').select('display_name').eq('id', center_id).maybeSingle();
    if (!c) { await answerCb(cb.id); return; }
    await answerCb(cb.id, 'Working…');

    const counts = await fetchMockCounts();
    const allSkills: Skill[] = ['listening','reading','writing','speaking'];
    const tiers = ['regular','premium'] as const;
    const actor = session.role === 'super' ? 'bot:super' : `bot:clone:${center_id}`;
    const nowIso = new Date().toISOString();

    const existing = new Set<string>();
    if (mode === 'missing') {
      const { data: rows } = await sb.from('mock_codes')
        .select('skill, mock_number, tier').eq('center', center_id);
      for (const r of rows ?? []) existing.add(`${r.skill}#${r.mock_number}#${r.tier}`);
    }
    const batch: Array<Record<string, unknown>> = [];
    for (const skill of allSkills) {
      const cap = counts[skill] || 0;
      for (let m = 1; m <= cap; m++) {
        for (const tier of tiers) {
          if (mode === 'missing' && existing.has(`${skill}#${m}#${tier}`)) continue;
          batch.push({
            center: center_id, skill, mock_number: m, tier,
            code: genCode(8), expires_at: null,
            last_renewed_at: nowIso, last_renewed_by: actor
          });
        }
      }
    }
    let written = 0;
    for (let i = 0; i < batch.length; i += 250) {
      const chunk = batch.slice(i, i + 250);
      const { error } = await sb.from('mock_codes').upsert(chunk);
      if (error) {
        return send(chat_id, `❌ ${esc(error.message)}`);
      }
      written += chunk.length;
    }
    sb.from('code_audit').insert({
      actor: 'bot', action: 'bulk_renew_mocks', center: center_id,
      details: { mode, counts, written, via: 'telegram', chat_id, role: session.role, username }
    }).then(() => {});

    const verb = mode === 'all' ? 'Regenerated' : 'Generated';
    const text =
      `✅ <b>${verb} ${written}</b> mock code${written === 1 ? '' : 's'} for <b>${esc(c.display_name)}</b>\n` +
      `<i>(🎧${counts.listening} · 📖${counts.reading} · ✏️${counts.writing} · 🎤${counts.speaking}) × 2 tiers, mode: <b>${mode}</b></i>`;
    const kb = {
      inline_keyboard: [
        [{ text: '📚 Mock skills', callback_data: `mock:${center_id}` }],
        [{ text: '🏫 Centers', callback_data: 'back:centers' }]
      ]
    };
    if (message_id) return editText(chat_id, message_id, text, { reply_markup: kb });
    return send(chat_id, text, { reply_markup: kb });
  }

  // mock_new:<center>:<skill>  → ask for number
  if (data.startsWith('mock_new:')) {
    const [, center_id, skill] = data.split(':');
    if (!SKILLS.includes(skill as Skill)) { await answerCb(cb.id); return; }
    if (!await ownsCenter({ ...session, current_center: center_id }, center_id) && session.role !== 'super') {
      await answerCb(cb.id, 'Forbidden'); return;
    }
    await saveSession({
      chat_id, current_center: center_id, current_skill: skill,
      state: 'await_mock_number'
    });
    await answerCb(cb.id);
    return send(chat_id, `📚 Send the <b>mock number</b> (1–999) for ${SKILL_LABEL[skill as Skill]}:`);
  }

  // mock_code:<center>:<skill>:<num>  → tier picker
  if (data.startsWith('mock_code:')) {
    const [, center_id, skill, numStr] = data.split(':');
    const num = parseInt(numStr, 10);
    if (!SKILLS.includes(skill as Skill) || !Number.isInteger(num)) { await answerCb(cb.id); return; }
    if (!await ownsCenter({ ...session, current_center: center_id }, center_id) && session.role !== 'super') {
      await answerCb(cb.id, 'Forbidden'); return;
    }
    const { data: c } = await sb.from('centers').select('display_name').eq('id', center_id).maybeSingle();
    if (!c) { await answerCb(cb.id); return; }
    await answerCb(cb.id);
    return sendMockCodeCard(chat_id, center_id, c.display_name, skill as Skill, num, message_id);
  }

  // mock_tier:<center>:<skill>:<num>:<tier>  → single-tier card
  if (data.startsWith('mock_tier:')) {
    const [, center_id, skill, numStr, tierRaw] = data.split(':');
    const num = parseInt(numStr, 10);
    const tier = (tierRaw === 'regular' || tierRaw === 'premium') ? tierRaw : null;
    if (!SKILLS.includes(skill as Skill) || !Number.isInteger(num) || !tier) { await answerCb(cb.id); return; }
    if (!await ownsCenter({ ...session, current_center: center_id }, center_id) && session.role !== 'super') {
      await answerCb(cb.id, 'Forbidden'); return;
    }
    const { data: c } = await sb.from('centers').select('display_name').eq('id', center_id).maybeSingle();
    if (!c) { await answerCb(cb.id); return; }
    await answerCb(cb.id);
    return sendMockTierCard(chat_id, center_id, c.display_name, skill as Skill, num, tier, message_id);
  }

  // mock_renew:<center>:<skill>:<num>:<tier>
  if (data.startsWith('mock_renew:')) {
    const [, center_id, skill, numStr, tierRaw] = data.split(':');
    const num = parseInt(numStr, 10);
    const tier = (tierRaw === 'regular' || tierRaw === 'premium') ? tierRaw : 'premium';
    if (!SKILLS.includes(skill as Skill) || !Number.isInteger(num)) { await answerCb(cb.id); return; }
    if (!await ownsCenter({ ...session, current_center: center_id }, center_id) && session.role !== 'super') {
      await answerCb(cb.id, 'Forbidden'); return;
    }
    const { data: c } = await sb.from('centers').select('display_name').eq('id', center_id).maybeSingle();
    if (!c) { await answerCb(cb.id); return; }
    const code  = genCode(8);
    const actor = session.role === 'super' ? 'bot:super' : `bot:clone:${center_id}`;
    const { error } = await sb.from('mock_codes').upsert({
      center: center_id, skill, mock_number: num, tier, code, expires_at: null,
      last_renewed_at: new Date().toISOString(), last_renewed_by: actor
    });
    if (error) { await answerCb(cb.id, 'Error'); return send(chat_id, `❌ ${esc(error.message)}`); }
    sb.from('code_audit').insert({
      actor: 'bot', action: 'renew_mock', center: center_id,
      details: { skill, mock_number: num, tier, via: 'telegram', chat_id, role: session.role, username }
    }).then(() => {});
    await answerCb(cb.id, `✅ New ${tier} code generated!`);
    return sendMockTierCard(chat_id, center_id, c.display_name, skill as Skill, num, tier, message_id);
  }

  // mock_delete:<center>:<skill>:<num>:<tier?>  (tier optional = delete both)
  if (data.startsWith('mock_delete:')) {
    const [, center_id, skill, numStr, tierRaw] = data.split(':');
    const num = parseInt(numStr, 10);
    if (!SKILLS.includes(skill as Skill) || !Number.isInteger(num)) { await answerCb(cb.id); return; }
    if (!await ownsCenter({ ...session, current_center: center_id }, center_id) && session.role !== 'super') {
      await answerCb(cb.id, 'Forbidden'); return;
    }
    let q = sb.from('mock_codes').delete()
      .eq('center', center_id).eq('skill', skill).eq('mock_number', num);
    if (tierRaw === 'regular' || tierRaw === 'premium') q = q.eq('tier', tierRaw);
    const { error } = await q;
    if (error) { await answerCb(cb.id, 'Error'); return send(chat_id, `❌ ${esc(error.message)}`); }
    sb.from('code_audit').insert({
      actor: 'bot', action: 'revoke_mock', center: center_id,
      details: { skill, mock_number: num, tier: tierRaw || 'all', via: 'telegram', chat_id, role: session.role, username }
    }).then(() => {});
    const { data: c } = await sb.from('centers').select('display_name').eq('id', center_id).maybeSingle();
    await answerCb(cb.id, '🗑 Deleted');
    // If no rows left for this mock #, go back to list; otherwise stay on card
    const { data: remain } = await sb.from('mock_codes').select('tier')
      .eq('center', center_id).eq('skill', skill).eq('mock_number', num);
    if (!remain || !remain.length) {
      return sendMockListMenu(chat_id, center_id, c?.display_name || center_id, skill as Skill, message_id);
    }
    return sendMockCodeCard(chat_id, center_id, c?.display_name || center_id, skill as Skill, num, message_id);
  }

  await answerCb(cb.id);
}

// ─────────────────────────────────────────────────────────────────────
// Main handler
// ─────────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('ok');
  if (WEBHOOK_SECRET) {
    const got = req.headers.get('x-telegram-bot-api-secret-token') || '';
    if (got !== WEBHOOK_SECRET) return new Response('forbidden', { status: 403 });
  }
  let update: any = {};
  try { update = await req.json(); } catch { return new Response('bad json', { status: 400 }); }

  try {
    if (update.message) await handleMessage(update.message);
    else if (update.callback_query) await handleCallback(update.callback_query);
  } catch (e) {
    console.error('[bot] handler error', e);
  }
  return new Response('ok');
});
