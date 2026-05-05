// telegram-center-bot — student-facing Telegram bot per center, dispatched
// by ?center=<id>. /start shows: 🎯 Take Mock, 👨‍🏫 Admin, 🎁 Code, 📖 Dictionary.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const MANAGER_BOT_USERNAME = 'MS23_manager_bot';

// Premium-upsell target. Same Telegram handle support-bot uses so all
// premium leads land in one inbox; matches the web Help Center pitch.
const PREMIUM_TG = 'mrkhasanoff3';
const PREMIUM_TEXT =
  '💎 Salom!\n\n🚀 Men Mock Stream Premium obunasini sotib olmoqchiman. ' +
  'Iltimos narxlar va imkoniyatlar haqida ma\'lumot bera olasizmi?';

async function tg(token: string, method: string, payload: Record<string, unknown>) {
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await r.json().catch(() => ({}));
  } catch (e) { console.warn('[center-bot] tg fetch failed', method, e); return null; }
}
const send = (token: string, chat_id: number, text: string, extra: Record<string, unknown> = {}) =>
  tg(token, 'sendMessage', { chat_id, text, parse_mode: 'HTML', ...extra });
const sendChatAction = (token: string, chat_id: number, action: string) =>
  tg(token, 'sendChatAction', { chat_id, action });
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

interface CenterConfig {
  center_id: string; bot_token: string; webapp_url: string;
  show_admin_btn: boolean; show_mock_btn: boolean; show_support_btn: boolean;
  show_dict_btn: boolean; active: boolean;
}
async function loadCenterConfig(centerId: string): Promise<CenterConfig | null> {
  const { data, error } = await sb.from('center_bots').select('*').eq('center_id', centerId).maybeSingle();
  if (error || !data) { console.warn('[center-bot] no config for', centerId, error?.message); return null; }
  if (!data.active) return null;
  const tokenEnv = String(data.bot_token_env || '').trim();
  const token = tokenEnv ? Deno.env.get(tokenEnv) : null;
  if (!token) { console.error('[center-bot] missing secret', tokenEnv, 'for', centerId); return null; }

  // Per-centre Free Code Dispenser kill-switch lives in site_settings
  // (`center_config_<id>` JSON, written by the Centers Management panel).
  // When false, we hide the Code button entirely — Telegram has no greyed
  // reply-keyboard state, so removing the button is the only honest UX.
  let freeCodeEnabled = true;
  try {
    const { data: cc } = await sb.from('site_settings').select('value').eq('key', `center_config_${centerId}`).maybeSingle();
    if (cc?.value) {
      const parsed = JSON.parse(String(cc.value));
      if (parsed && parsed.freeCodeDispenser === false) freeCodeEnabled = false;
    }
  } catch (e) { console.warn('[center-bot] freeCodeDispenser load failed', e); }

  return {
    center_id: data.center_id, bot_token: token,
    webapp_url: String(data.webapp_url || ''),
    show_admin_btn:   data.show_admin_btn   !== false,
    show_mock_btn:    data.show_mock_btn    !== false,
    show_support_btn: (data.show_support_btn !== false) && freeCodeEnabled,
    show_dict_btn:    data.show_dict_btn    !== false,
    active:           data.active           !== false,
  };
}
async function getAdminPasscode(centerId: string): Promise<string | null> {
  const { data } = await sb.from('admin_passcodes').select('passcode').eq('center', centerId).maybeSingle();
  return data?.passcode ? String(data.passcode) : null;
}

const BTN = {
  TAKE_MOCK:  '🎯 Take Mock',
  ADMIN:      '👨‍🏫 Admin',
  SUPPORT:    '🎁 Code',
  DICT:       '📖 Dictionary',
  CANCEL:     '❌ Cancel',
  MAIN_MENU:  '⬅️ Main menu',
  LEAVE_SUP:  '🚪 Leave Code',
  LEAVE_DICT: '🚪 Leave Dictionary',
  // Skill picker (Code mode)
  LISTEN: '🎧 Listening',
  READ:   '📖 Reading',
  WRITE:  '✍️ Writing',
  SPEAK:  '🎤 Speaking',
  FULL:   '📚 Full mock — 👑 Premium',
};
function mainKeyboard(cfg: CenterConfig) {
  const rows: unknown[][] = [];
  if (cfg.show_mock_btn) rows.push([{ text: BTN.TAKE_MOCK, web_app: { url: cfg.webapp_url } }]);
  const second: unknown[] = [];
  if (cfg.show_admin_btn)   second.push({ text: BTN.ADMIN });
  if (cfg.show_support_btn) second.push({ text: BTN.SUPPORT });
  if (second.length) rows.push(second);
  if (cfg.show_dict_btn) rows.push([{ text: BTN.DICT }]);
  return { keyboard: rows, resize_keyboard: true, is_persistent: false };
}
function codeSkillKeyboard() {
  return {
    keyboard: [
      [{ text: BTN.LISTEN }, { text: BTN.READ  }],
      [{ text: BTN.WRITE  }, { text: BTN.SPEAK }],
      [{ text: BTN.FULL }],
      [{ text: BTN.LEAVE_SUP }],
    ],
    resize_keyboard: true, is_persistent: false,
  };
}
function codeNumberKeyboard() {
  return { keyboard: [[{ text: BTN.LEAVE_SUP }]], resize_keyboard: true, is_persistent: false };
}
function dictKeyboard()    { return { keyboard: [[{ text: BTN.LEAVE_DICT }]], resize_keyboard: true, is_persistent: false }; }
function passcodeKeyboard(){ return { keyboard: [[{ text: BTN.CANCEL }]], resize_keyboard: true, is_persistent: false, one_time_keyboard: false }; }

function premiumInline() {
  return { inline_keyboard: [[{ text: '👑 Get Premium', url: `https://t.me/${PREMIUM_TG}?text=${encodeURIComponent(PREMIUM_TEXT)}` }]] };
}
function premiumBenefitsHtml(): string {
  return (
    `🔥 <b>Want more? Upgrade to Premium</b>\n` +
    `🤖 Instant AI scoring &amp; feedback\n` +
    `📝 Full transcripts (speaking + writing)\n` +
    `🔄 Unlimited retries\n` +
    `⚡ One code unlocks all skills\n` +
    `😊 No daily / hourly limits`
  );
}

function welcomeText(cfg: CenterConfig, firstName: string): string {
  return (
    `<b>👋 Welcome, ${esc(firstName || 'student')}!</b>\n\n` +
    `<b>🎯 Take Mock</b> — open mocks in fullscreen.\n` +
    (cfg.show_admin_btn   ? `<b>👨‍🏫 Admin</b> — center management (passcode).\n` : '') +
    (cfg.show_support_btn ? `<b>🎁 Code</b> — free regular mock codes.\n` : '') +
    (cfg.show_dict_btn    ? `<b>📖 Dictionary</b> — quick English ⇄ Uzbek lookup.\n` : '') +
    `\n<i>Tap any button below ⤵️</i>`
  );
}
function adminMenuText(cfg: CenterConfig): string {
  return `<b>✅ Admin unlocked — ${esc(cfg.center_id)}</b>\n\nTap the button below to open the full code-management panel in <b>@${esc(MANAGER_BOT_USERNAME)}</b>.`;
}
function adminInlineKeyboard() {
  return { inline_keyboard: [[{ text: '🔓 Open admin panel', url: `https://t.me/${MANAGER_BOT_USERNAME}` }]] };
}

async function isAdminUnlocked(centerId: string, tgUserId: number): Promise<boolean> {
  const { data } = await sb.from('center_bot_admin_sessions').select('expires_at').eq('center_id', centerId).eq('tg_user_id', tgUserId).maybeSingle();
  if (!data) return false;
  return new Date(data.expires_at).getTime() > Date.now();
}
async function unlockAdmin(centerId: string, tgUserId: number): Promise<void> {
  await sb.from('center_bot_admin_sessions').upsert({
    center_id: centerId, tg_user_id: tgUserId,
    unlocked_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
  });
}
async function getSupportMode(centerId: string, tgUserId: number): Promise<string | null> {
  const { data } = await sb.from('center_bot_support_sessions').select('mode').eq('center_id', centerId).eq('tg_user_id', tgUserId).maybeSingle();
  return (data?.mode as string | null | undefined) || null;
}
async function setSupportMode(centerId: string, tgUserId: number, mode: string | null): Promise<void> {
  if (mode === null) {
    await sb.from('center_bot_support_sessions').delete().eq('center_id', centerId).eq('tg_user_id', tgUserId);
  } else {
    await sb.from('center_bot_support_sessions').upsert({
      center_id: centerId, tg_user_id: tgUserId, mode,
      opened_at: new Date().toISOString(),
    });
  }
}
async function isInDictMode(centerId: string, tgUserId: number): Promise<boolean> {
  const { data } = await sb.from('center_bot_dict_sessions').select('opened_at').eq('center_id', centerId).eq('tg_user_id', tgUserId).maybeSingle();
  return !!data;
}
async function setDictMode(centerId: string, tgUserId: number, on: boolean): Promise<void> {
  if (on) await sb.from('center_bot_dict_sessions').upsert({ center_id: centerId, tg_user_id: tgUserId, opened_at: new Date().toISOString() });
  else    await sb.from('center_bot_dict_sessions').delete().eq('center_id', centerId).eq('tg_user_id', tgUserId);
}

const PROMPT_TTL_MINUTES = 5;
async function setAwaitingPasscode(centerId: string, tgUserId: number) {
  await sb.from('center_bot_passcode_prompts').upsert({ center_id: centerId, tg_user_id: tgUserId, set_at: new Date().toISOString() });
}
async function isAwaitingPasscode(centerId: string, tgUserId: number): Promise<boolean> {
  const { data } = await sb.from('center_bot_passcode_prompts').select('set_at').eq('center_id', centerId).eq('tg_user_id', tgUserId).maybeSingle();
  if (!data) return false;
  if (Date.now() - new Date(data.set_at).getTime() > PROMPT_TTL_MINUTES * 60 * 1000) {
    await clearAwaitingPasscode(centerId, tgUserId); return false;
  }
  return true;
}
async function clearAwaitingPasscode(centerId: string, tgUserId: number) {
  await sb.from('center_bot_passcode_prompts').delete().eq('center_id', centerId).eq('tg_user_id', tgUserId);
}

let _geminiKey: string | null = null;
async function getGeminiKey(): Promise<string | null> {
  if (_geminiKey) return _geminiKey;
  try {
    const { data } = await sb.from('site_settings').select('key,value').in('key', [
      'gemini_active_plan',
      'gemini_api_key_prepay', 'gemini_api_key_prepay_2',
      'gemini_api_key_postpay', 'gemini_api_key_postpay_2',
    ]);
    const map = new Map<string, string>();
    (data ?? []).forEach((r: { key: string; value: string }) => map.set(r.key, r.value));
    const plan = (map.get('gemini_active_plan') || 'prepay').toLowerCase();
    const key  = map.get(`gemini_api_key_${plan}`) || map.get(`gemini_api_key_${plan}_2`) ||
                 map.get('gemini_api_key_prepay') || map.get('gemini_api_key_postpay');
    if (key) { _geminiKey = key; return key; }
  } catch (e) { console.warn('[center-bot] gemini key load failed', e); }
  const env = Deno.env.get('GEMINI_API_KEY');
  if (env) { _geminiKey = env; return env; }
  return null;
}
async function callGemini(prompt: string, temperature = 0.2, maxOutputTokens = 800): Promise<string | null> {
  const key = await getGeminiKey();
  if (!key) return null;
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature, maxOutputTokens } }),
    });
    const j = await r.json();
    const txt = j?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof txt === 'string' ? txt.trim() : null;
  } catch (e) { console.warn('[center-bot] gemini call failed', e); return null; }
}

const DICT_PROMPT = (word: string) => (
  `You are a bilingual English⇄Uzbek dictionary assistant. The user typed: \"${word}\"\n\n` +
  `Respond ONLY with valid JSON (no markdown) in this exact shape:\n` +
  `{\n  \"direction\": \"en2uz\" | \"uz2en\",\n  \"word\": \"the corrected input\",\n  \"misspelled\": true | false,\n  \"english\": \"\",\n  \"uzbek\": \"\",\n  \"definition\": \"\",\n  \"example_en\": \"\",\n  \"example_uz\": \"\"\n}\n` +
  `Detect direction automatically. If misspelled, gently correct in \"word\".`
);
interface DictResult {
  direction?: string; word?: string; misspelled?: boolean;
  english?: string; uzbek?: string; definition?: string;
  example_en?: string; example_uz?: string;
}
async function lookupDictWord(token: string, chatId: number, text: string) {
  await sendChatAction(token, chatId, 'typing');
  const raw = await callGemini(DICT_PROMPT(text), 0.2, 800);
  if (!raw) { await send(token, chatId, `⚠️ Dictionary unreachable. Try again in a moment.`, { reply_markup: dictKeyboard() }); return; }
  let parsed: DictResult | null = null;
  const stripped = raw.replace(/```(?:json)?/gi, '').trim();
  const start = stripped.indexOf('{');
  if (start >= 0) {
    let depth = 0, end = -1, inStr = false, esc2 = false;
    for (let i = start; i < stripped.length; i++) {
      const c = stripped[i];
      if (inStr) { if (esc2) { esc2 = false; continue; } if (c === '\\\\') { esc2 = true; continue; } if (c === '\"') inStr = false; continue; }
      if (c === '\"') { inStr = true; continue; }
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) { end = i; break; } }
    }
    if (end > start) { try { parsed = JSON.parse(stripped.slice(start, end + 1)); } catch { /* fall through */ } }
  }
  if (!parsed) {
    await send(token, chatId, `📖 Couldn't parse a structured answer.\n\n${esc(raw).slice(0, 1500)}`, { reply_markup: dictKeyboard() });
    return;
  }
  const p = parsed!;
  const lines: string[] = [];
  lines.push(`📖 <b>${esc(p.word || text)}</b>` + (p.misspelled ? `  <i>(corrected)</i>` : ''));
  if (p.english) lines.push(`🇬🇧 <b>EN:</b> ${esc(p.english)}`);
  if (p.uzbek)   lines.push(`🇺🇿 <b>UZ:</b> ${esc(p.uzbek)}`);
  if (p.definition) lines.push(`\n<i>${esc(p.definition)}</i>`);
  if (p.example_en) lines.push(`\n💬 <b>Example:</b>\n• ${esc(p.example_en)}`);
  if (p.example_uz) lines.push(`• ${esc(p.example_uz)}`);
  await send(token, chatId, lines.join('\n'), { reply_markup: dictKeyboard() });
}

function skillFromButton(text: string): string | null {
  switch (text) {
    case BTN.LISTEN: return 'listening';
    case BTN.READ:   return 'reading';
    case BTN.WRITE:  return 'writing';
    case BTN.SPEAK:  return 'speaking';
    default:         return null;
  }
}
async function issueCode(token: string, chatId: number, tgUserId: number, centerId: string, skill: string, mockNumber?: number) {
  await sendChatAction(token, chatId, 'typing');
  const userKey = `tg_support_bot:${tgUserId}`;
  try {
    const body: Record<string, unknown> = { center: centerId, skill, user_key: userKey };
    if (typeof mockNumber === 'number' && mockNumber > 0) body.mock_number = mockNumber;
    const r = await fetch(`${SUPABASE_URL}/functions/v1/get-promo-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    if (r.ok && j?.ok && j?.code) {
      const skillLabel = ({ listening: '🎧 Listening', reading: '📖 Reading', writing: '✍️ Writing', speaking: '🎤 Speaking', full_mock: '📚 Full mock' } as Record<string, string>)[skill] || skill;
      const remaining = (typeof j.daily_remaining === 'number') ? j.daily_remaining : null;
      await send(token, chatId,
        `✅ <b>Here's your free regular code</b>\n\n<b>${skillLabel}</b>${j.mock_number ? ` — mock #${j.mock_number}` : ''}\n\n<code>${esc(String(j.code))}</code>` +
        (remaining !== null ? `\n\n<i>${remaining} free code(s) left today.</i>` : ''),
        { reply_markup: premiumInline() });
      return;
    }
    const err  = String(j?.error || 'unknown');
    const msg  = String(j?.message || '');
    const wait = Number(j?.retry_after_seconds || 0);
    if (err === 'hourly_limit_reached' || err === 'daily_limit_reached') {
      const mins = Math.max(1, Math.ceil(wait / 60));
      const limitLine = err === 'daily_limit_reached'
        ? `Free tier allows 4 mock codes per day. Try again in <b>~${mins} min</b>, or upgrade to <b>Premium</b> for instant unlimited access.`
        : `Free tier allows 1 mock code per hour. Try again in <b>~${mins} min</b>, or upgrade to <b>Premium</b> for instant unlimited access.`;
      await send(token, chatId,
        `⏳ <b>Free-tier limit reached</b>\n\n${limitLine}\n\n${premiumBenefitsHtml()}`,
        { reply_markup: premiumInline() });
      return;
    }
    if (err === 'no_stock' || err === 'no_codes_available') {
      await send(token, chatId,
        `😔 <b>No free codes available right now</b>\n\nTry another skill, or upgrade to <b>Premium</b> for instant unlimited access.\n\n${premiumBenefitsHtml()}`,
        { reply_markup: premiumInline() });
      return;
    }
    await send(token, chatId, `⚠️ Couldn't issue a code: ${esc(msg || err)}.`);
  } catch (e) {
    console.warn('[center-bot] issueCode failed:', e);
    await send(token, chatId, `⚠️ Sorry, something went wrong.`);
  }
}

async function showMainMenu(cfg: CenterConfig, chatId: number, firstName: string) {
  await send(cfg.bot_token, chatId, welcomeText(cfg, firstName), { reply_markup: mainKeyboard(cfg) });
}
async function showAdminMenu(cfg: CenterConfig, chatId: number) {
  await send(cfg.bot_token, chatId, adminMenuText(cfg), { reply_markup: adminInlineKeyboard() });
}
async function handleAdminTap(cfg: CenterConfig, chatId: number, tgUserId: number) {
  if (await isAdminUnlocked(cfg.center_id, tgUserId)) {
    await clearAwaitingPasscode(cfg.center_id, tgUserId);
    await showAdminMenu(cfg, chatId); return;
  }
  await setAwaitingPasscode(cfg.center_id, tgUserId);
  await send(cfg.bot_token, chatId,
    `🔐 <b>Admin passcode required</b>\n\nSend the admin passcode for <b>${esc(cfg.center_id)}</b>.\n\nTap <b>${BTN.CANCEL}</b> to abort.`,
    { reply_markup: passcodeKeyboard() });
}
async function handlePasscodeAttempt(cfg: CenterConfig, chatId: number, tgUserId: number, firstName: string, text: string) {
  if (text === BTN.CANCEL || /^\/cancel\b/i.test(text)) {
    await clearAwaitingPasscode(cfg.center_id, tgUserId);
    await send(cfg.bot_token, chatId, `❌ Cancelled.`);
    await showMainMenu(cfg, chatId, firstName); return;
  }
  const expected = await getAdminPasscode(cfg.center_id);
  if (!expected) {
    await clearAwaitingPasscode(cfg.center_id, tgUserId);
    await send(cfg.bot_token, chatId, `⚠️ No admin passcode is configured for this center.`);
    await showMainMenu(cfg, chatId, firstName); return;
  }
  if (!ctEq(text.trim(), expected.trim())) {
    await send(cfg.bot_token, chatId, `❌ Wrong passcode. Try again or tap <b>${BTN.CANCEL}</b>.`); return;
  }
  await clearAwaitingPasscode(cfg.center_id, tgUserId);
  await unlockAdmin(cfg.center_id, tgUserId);
  await showAdminMenu(cfg, chatId);
}
async function handleSupportEnter(cfg: CenterConfig, chatId: number, tgUserId: number) {
  await setDictMode(cfg.center_id, tgUserId, false);
  await clearAwaitingPasscode(cfg.center_id, tgUserId);
  await setSupportMode(cfg.center_id, tgUserId, 'await_skill');
  await send(cfg.bot_token, chatId,
    `🎁 <b>Free regular code</b>\n\nPick a skill to get a free code right here. ` +
    `<i>(Free tier: 1/hour, 4/day per Telegram user.)</i>`,
    { reply_markup: codeSkillKeyboard() });
}
async function handleDictEnter(cfg: CenterConfig, chatId: number, tgUserId: number) {
  await setSupportMode(cfg.center_id, tgUserId, null);
  await clearAwaitingPasscode(cfg.center_id, tgUserId);
  await setDictMode(cfg.center_id, tgUserId, true);
  await send(cfg.bot_token, chatId,
    `📖 <b>Dictionary mode</b>\n\nSend any English or Uzbek word/phrase and I'll translate &amp; define it.\n\nTap <b>${BTN.LEAVE_DICT}</b> to exit.`,
    { reply_markup: dictKeyboard() });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'GET') return new Response('telegram-center-bot online', { status: 200 });
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });
  const url = new URL(req.url);
  const centerId = (url.searchParams.get('center') || '').trim();
  if (!centerId) return new Response('missing center', { status: 400 });
  const cfg = await loadCenterConfig(centerId);
  if (!cfg) return new Response('center not configured', { status: 404 });

  let update: Record<string, unknown>;
  try { update = await req.json(); } catch { return new Response('bad json', { status: 400 }); }

  try {
    if (update.callback_query) {
      const cb = update.callback_query as Record<string, unknown>;
      await answerCb(cfg.bot_token, String(cb.id));
      return new Response('ok');
    }
    const message = update.message as Record<string, unknown> | undefined;
    if (!message) return new Response('ok');
    const chat       = (message.chat as Record<string, unknown>) || {};
    const from       = (message.from as Record<string, unknown>) || {};
    const chatId     = Number(chat.id);
    const tgUserId   = Number(from.id);
    const firstName  = String(from.first_name || '');
    const text       = String(message.text || '').trim();
    if (!chatId || !tgUserId) return new Response('ok');

    if (/^\/(start|menu|help)\b/i.test(text)) {
      await clearAwaitingPasscode(cfg.center_id, tgUserId);
      await setSupportMode(cfg.center_id, tgUserId, null);
      await setDictMode(cfg.center_id, tgUserId, false);
      await showMainMenu(cfg, chatId, firstName);
      return new Response('ok');
    }

    const isMenuButton = (
      text === BTN.TAKE_MOCK ||
      text === BTN.ADMIN     || text === BTN.SUPPORT  ||
      text === BTN.DICT      ||
      text === BTN.CANCEL    || text === BTN.LEAVE_SUP || text === BTN.LEAVE_DICT ||
      text === BTN.LISTEN    || text === BTN.READ      || text === BTN.WRITE     ||
      text === BTN.SPEAK     || text === BTN.FULL
    );

    if (!isMenuButton && await isAwaitingPasscode(cfg.center_id, tgUserId)) {
      await handlePasscodeAttempt(cfg, chatId, tgUserId, firstName, text);
      return new Response('ok');
    }
    if (isMenuButton) await clearAwaitingPasscode(cfg.center_id, tgUserId);

    if (await isInDictMode(cfg.center_id, tgUserId)) {
      if (text === BTN.LEAVE_DICT) {
        await setDictMode(cfg.center_id, tgUserId, false);
        await send(cfg.bot_token, chatId, `👋 You've left Dictionary mode.`);
        await showMainMenu(cfg, chatId, firstName);
        return new Response('ok');
      }
      if (text === BTN.DICT) {
        await send(cfg.bot_token, chatId,
          `You're already in Dictionary mode. Send any word, or tap <b>${BTN.LEAVE_DICT}</b> to exit.`,
          { reply_markup: dictKeyboard() });
        return new Response('ok');
      }
      if (text === BTN.TAKE_MOCK || text === BTN.ADMIN || text === BTN.SUPPORT) {
        await setDictMode(cfg.center_id, tgUserId, false);
      } else {
        if (text) await lookupDictWord(cfg.bot_token, chatId, text);
        return new Response('ok');
      }
    }

    const supportMode = await getSupportMode(cfg.center_id, tgUserId);
    if (supportMode) {
      if (!cfg.show_support_btn) {
        await setSupportMode(cfg.center_id, tgUserId, null);
        await send(cfg.bot_token, chatId,
          `🚫 <b>Free codes deactivated by your center</b>\n\nUpgrade to <b>Premium</b> for instant unlimited access.\n\n${premiumBenefitsHtml()}`,
          { reply_markup: premiumInline() });
        await showMainMenu(cfg, chatId, firstName);
        return new Response('ok');
      }
      if (text === BTN.LEAVE_SUP) {
        await setSupportMode(cfg.center_id, tgUserId, null);
        await send(cfg.bot_token, chatId, `👋 You've left Code mode.`);
        await showMainMenu(cfg, chatId, firstName);
        return new Response('ok');
      }
      if (text === BTN.TAKE_MOCK || text === BTN.ADMIN || text === BTN.DICT) {
        await setSupportMode(cfg.center_id, tgUserId, null);
      } else if (supportMode === 'await_skill') {
        if (text === BTN.FULL) {
          await send(cfg.bot_token, chatId,
            `📚 <b>Full Mock is a Premium feature</b>\n\n` +
            `The free regular tier covers each skill <b>individually</b>. Pick a single skill ` +
            `(Listening / Reading / Writing / Speaking) for a free code, or upgrade to <b>Premium</b> — ` +
            `one code unlocks the whole mock plus AI scoring and full transcripts.\n\n` +
            premiumBenefitsHtml(),
            { reply_markup: premiumInline() });
          await send(cfg.bot_token, chatId,
            `🎯 Pick a single skill below, or tap <b>${BTN.LEAVE_SUP}</b> to exit.`,
            { reply_markup: codeSkillKeyboard() });
          return new Response('ok');
        }
        const skill = skillFromButton(text);
        if (skill) {
          await setSupportMode(cfg.center_id, tgUserId, `await_mock:${skill}`);
          const label = ({ listening: '🎧 Listening', reading: '📖 Reading', writing: '✍️ Writing', speaking: '🎤 Speaking' } as Record<string, string>)[skill];
          await send(cfg.bot_token, chatId,
            `🔢 <b>${label} — pick a mock #</b>\n\nType the mock number you want a free code for.`,
            { reply_markup: codeNumberKeyboard() });
          return new Response('ok');
        }
        if (text === BTN.SUPPORT) {
          await send(cfg.bot_token, chatId,
            `You're already in Code mode. Pick a skill below, or tap <b>${BTN.LEAVE_SUP}</b>.`,
            { reply_markup: codeSkillKeyboard() });
          return new Response('ok');
        }
        await send(cfg.bot_token, chatId,
          `Please tap a skill button:`, { reply_markup: codeSkillKeyboard() });
        return new Response('ok');
      } else if (supportMode.startsWith('await_mock:')) {
        const skill = supportMode.slice('await_mock:'.length);
        const m = text.match(/\d{1,3}/);
        const n = m ? parseInt(m[0], 10) : NaN;
        if (!Number.isInteger(n) || n < 1 || n > 999) {
          await send(cfg.bot_token, chatId,
            `⚠️ Send a valid mock number (1-999), or tap <b>${BTN.LEAVE_SUP}</b>.`,
            { reply_markup: codeNumberKeyboard() });
          return new Response('ok');
        }
        await issueCode(cfg.bot_token, chatId, tgUserId, cfg.center_id, skill, n);
        await setSupportMode(cfg.center_id, tgUserId, 'await_skill');
        await send(cfg.bot_token, chatId,
          `🎯 Pick another skill or tap <b>${BTN.LEAVE_SUP}</b> to exit.`,
          { reply_markup: codeSkillKeyboard() });
        return new Response('ok');
      }
    }

    if (text === BTN.ADMIN) {
      if (!cfg.show_admin_btn) await send(cfg.bot_token, chatId, 'Admin button is disabled.');
      else                     await handleAdminTap(cfg, chatId, tgUserId);
      return new Response('ok');
    }
    if (text === BTN.SUPPORT) {
      if (!cfg.show_support_btn) {
        await send(cfg.bot_token, chatId,
          `🚫 <b>Free codes deactivated by your center</b>\n\nUpgrade to <b>Premium</b> for instant unlimited access.\n\n${premiumBenefitsHtml()}`,
          { reply_markup: premiumInline() });
      } else {
        await handleSupportEnter(cfg, chatId, tgUserId);
      }
      return new Response('ok');
    }
    if (text === BTN.DICT) {
      if (!cfg.show_dict_btn) await send(cfg.bot_token, chatId, 'Dictionary button is disabled.');
      else                    await handleDictEnter(cfg, chatId, tgUserId);
      return new Response('ok');
    }

    const isAdmin = await isAdminUnlocked(cfg.center_id, tgUserId);
    if (isAdmin) {
      if (text === BTN.MAIN_MENU) { await showMainMenu(cfg, chatId, firstName); return new Response('ok'); }
    }

    await showMainMenu(cfg, chatId, firstName);
    return new Response('ok');
  } catch (e) {
    console.error('[center-bot] handler error', e);
    return new Response('ok');
  }
});
