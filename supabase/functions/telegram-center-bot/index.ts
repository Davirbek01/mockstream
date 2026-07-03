// telegram-center-bot — student-facing Telegram bot per center, dispatched
// by ?center=<id>. /start shows: 🎯 Take Mock, 👨‍🏫 Admin, 🎁 Code, 📖 Dictionary.
//
// v45: Admin button now opens a FULL in-bot admin panel scoped to that
// centre — no manager-bot redirect. Mirrors @MS23_manager_bot's flows
// (VIP, mock codes, bulk renew) inside the per-centre bot itself, with
// the hideRegularCodes flag filtering Regular tier rows + buttons for
// clone admins on hidden-regulars centres.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Premium-upsell target. Same Telegram handle support-bot uses so all
// premium leads land in one inbox; matches the web Help Center pitch.
const PREMIUM_TG = 'mrkhasanoff3';
const PREMIUM_TEXT =
  '💎 Salom!\n\n🚀 Men Mock Stream Premium obunasini sotib olmoqchiman. ' +
  'Iltimos narxlar va imkoniyatlar haqida ma\'lumot bera olasizmi?';

const SKILLS = ['listening','reading','writing','speaking','full_mock'] as const;
type Skill = typeof SKILLS[number];
const SKILL_LABEL: Record<Skill, string> = {
  listening: '🎧 Listening',
  reading:   '📖 Reading',
  writing:   '✍️ Writing',
  speaking:  '🎤 Speaking',
  full_mock: '🏆 Full Mock',
};

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
const editMessageText = (token: string, chat_id: number, message_id: number, text: string, extra: Record<string, unknown> = {}) =>
  tg(token, 'editMessageText', { chat_id, message_id, text, parse_mode: 'HTML', ...extra });
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
function genCode(length = 8): string {
  const buf = new Uint32Array(length);
  crypto.getRandomValues(buf);
  let out = '';
  for (let i = 0; i < length; i++) out += String(buf[i] % 10);
  return out;
}

interface CenterConfig {
  center_id: string; bot_token: string; webapp_url: string;
  // BotFather-registered Mini App slug (set via /newapp). When present
  // alongside bot_username, Take Mock renders as an inline `url` button
  // that opens https://t.me/<bot_username>/<mini_app_slug> — the only
  // launch path that reliably passes WebApp.initData on Telegram Desktop
  // 9.x. Without these, falls back to the legacy KeyboardButton.web_app
  // launch which has the empty-initData bug on Desktop.
  bot_username: string | null; mini_app_slug: string | null;
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
      const parsed = typeof cc.value === 'string' ? JSON.parse(cc.value) : cc.value;
      if (parsed && parsed.freeCodeDispenser === false) freeCodeEnabled = false;
    }
  } catch (e) { console.warn('[center-bot] freeCodeDispenser load failed', e); }

  return {
    center_id: data.center_id, bot_token: token,
    webapp_url: String(data.webapp_url || ''),
    bot_username:  data.bot_username  ? String(data.bot_username).replace(/^@/, '').trim() : null,
    mini_app_slug: data.mini_app_slug ? String(data.mini_app_slug).trim() : null,
    show_admin_btn:   data.show_admin_btn   !== false,
    show_mock_btn:    data.show_mock_btn    !== false,
    show_support_btn: (data.show_support_btn !== false) && freeCodeEnabled,
    show_dict_btn:    data.show_dict_btn    !== false,
    active:           data.active           !== false,
  };
}

// Compose the BotFather Mini App deeplink for this centre, if both
// bot_username and mini_app_slug are set. The t.me launch path is the
// only one that reliably passes WebApp.initData on Telegram Desktop 9.x
// — KeyboardButton.web_app and (sometimes) InlineKeyboardButton.web_app
// hand the client an empty initData string on Desktop, which then makes
// verify-telegram-initdata reject the user as un-signed.
function tmaDeeplink(cfg: CenterConfig): string | null {
  if (!cfg.bot_username || !cfg.mini_app_slug) return null;
  return `https://t.me/${cfg.bot_username}/${cfg.mini_app_slug}`;
}
async function getAdminPasscode(centerId: string): Promise<string | null> {
  const { data } = await sb.from('admin_passcodes').select('passcode').eq('center', centerId).maybeSingle();
  return data?.passcode ? String(data.passcode) : null;
}

// Per-centre Hide Regular Codes flag — set via Centers Management →
// Features Toggle. When true, the in-bot admin panel hides every Regular
// tier surface for THIS centre's admin (no Regular VIP, no Regular mock
// cell, bulk renew runs premium-only). The user already excluded
// super-admin from this filter on the website; per-centre bots only ever
// authenticate centre admins via the centre passcode, so the gate is
// purely "is this centre's flag on".
async function shouldHideRegulars(centerId: string): Promise<boolean> {
  if (!centerId) return false;
  try {
    const { data } = await sb.from('site_settings').select('value').eq('key', `center_config_${centerId}`).maybeSingle();
    if (!data?.value) return false;
    const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
    return !!(parsed && (parsed as Record<string, unknown>).hideRegularCodes === true);
  } catch (_e) { return false; }
}

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
  } catch { return def; }
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
  if (cfg.show_mock_btn) {
    // Centers with a registered Mini App slug: Take Mock is a plain
    // text reply button. Tapping it sends "🎯 Take Mock" to the bot,
    // which replies with an inline t.me-deeplink button — that path
    // reliably passes WebApp.initData on every client (mobile AND
    // Desktop). Direct web_app launch was tested 2026-06-04 and
    // confirmed empty-initData on Android TG 9.6 too, not just
    // Desktop. Centers without a slug still use the legacy
    // web_app launch (backward compatible).
    if (tmaDeeplink(cfg)) rows.push([{ text: BTN.TAKE_MOCK }]);
    else                  rows.push([{ text: BTN.TAKE_MOCK, web_app: { url: cfg.webapp_url } }]);
  }
  const second: unknown[] = [];
  if (cfg.show_admin_btn)   second.push({ text: BTN.ADMIN });
  if (cfg.show_support_btn) second.push({ text: BTN.SUPPORT });
  if (second.length) rows.push(second);
  if (cfg.show_dict_btn) rows.push([{ text: BTN.DICT }]);
  return { keyboard: rows, resize_keyboard: true, is_persistent: false };
}
// Inline keyboard with a single t.me/<bot>/<slug> URL — the reliable
// way to launch a Mini App so WebApp.initData is populated. Only built
// when both bot_username and mini_app_slug are configured.
function takeMockInline(cfg: CenterConfig) {
  const url = tmaDeeplink(cfg);
  if (!url) return null;
  return { inline_keyboard: [[{ text: '🎯 Open ' + (cfg.center_id === 'mockstream' ? 'Mock Stream' : 'Mocks'), url }]] };
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

// ── Admin session: unlock + state (admin_state column on center_bot_admin_sessions). ──
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
    admin_state: null,
  });
}
async function lockAdmin(centerId: string, tgUserId: number): Promise<void> {
  await sb.from('center_bot_admin_sessions').delete().eq('center_id', centerId).eq('tg_user_id', tgUserId);
}
async function getAdminState(centerId: string, tgUserId: number): Promise<string | null> {
  const { data } = await sb.from('center_bot_admin_sessions').select('admin_state').eq('center_id', centerId).eq('tg_user_id', tgUserId).maybeSingle();
  return (data?.admin_state as string | null | undefined) || null;
}
async function setAdminState(centerId: string, tgUserId: number, state: string | null): Promise<void> {
  await sb.from('center_bot_admin_sessions').update({ admin_state: state }).eq('center_id', centerId).eq('tg_user_id', tgUserId);
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

// ── Gemini lookup for the in-bot Dictionary mode (unchanged). ──
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
      if (inStr) { if (esc2) { esc2 = false; continue; } if (c === '\\') { esc2 = true; continue; } if (c === '\"') inStr = false; continue; }
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

// ── Free-code dispenser (Code button — unchanged). ──
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

// ─── In-bot ADMIN PANEL ──────────────────────────────────────────────────
// All admin views use inline_keyboard (callback_data buttons) so the same
// message can be edited in place as the admin navigates. The reply
// keyboard (Take Mock / Admin / Code / Dictionary) stays untouched.
async function showAdminMenu(cfg: CenterConfig, chatId: number, message_id?: number) {
  const hideReg = await shouldHideRegulars(cfg.center_id);
  const buttons: Array<Array<{ text: string; callback_data: string }>> = [];
  buttons.push([{ text: '👑 Premium VIP', callback_data: 'adm_vip:premium' }]);
  if (!hideReg) buttons.push([{ text: '🎟 Regular VIP', callback_data: 'adm_vip:regular' }]);
  buttons.push([{ text: '📚 Mock codes', callback_data: 'adm_mock' }]);
  buttons.push([{ text: hideReg ? '⚡ Bulk generate (premium-only)' : '⚡ Bulk generate (all skills)', callback_data: 'adm_bulk' }]);
  // Per-user Premium grants are restricted to the mockstream bot only.
  // Clone-bot admins manage codes; cross-centre per-user grants are a
  // super-admin workflow that lives on the main bot to prevent every
  // clone admin from being able to write into premium_emails.
  if (cfg.center_id === 'mockstream') {
    buttons.push([{ text: '🎁 Premium grants (@user / ID)', callback_data: 'adm_prem' }]);
  }
  buttons.push([{ text: '🔒 Lock admin', callback_data: 'adm_lock' }]);
  const lines = [
    `🛠 <b>Admin — ${esc(cfg.center_id)}</b>`,
    '',
    `Manage your centre's codes:`,
    '',
    `• 👑 Premium VIP code`,
  ];
  if (!hideReg) lines.push(`• 🎟 Regular VIP code`);
  lines.push(`• 📚 Mock codes per skill`);
  lines.push(`• ⚡ Bulk-generate every mock at once`);
  if (cfg.center_id === 'mockstream') {
    lines.push(`• 🎁 Grant Premium directly to a Telegram user`);
  }
  lines.push('');
  lines.push(`<i>Auto-locks after 12h.</i>`);
  const kb = { inline_keyboard: buttons };
  if (message_id) return editMessageText(cfg.bot_token, chatId, message_id, lines.join('\n'), { reply_markup: kb });
  return send(cfg.bot_token, chatId, lines.join('\n'), { reply_markup: kb });
}

// ─── Premium grants sub-panel ────────────────────────────────────────
// Restricted to @mock_stream_pc_bot — see mainKeyboard gate. From this
// panel the super-admin can grant / revoke / list Premium memberships
// for any centre by typing the user's Telegram @username or numeric ID
// then picking which centre(s) to apply it to. Backs the same
// premium_emails table the website's Registered Users panel uses.
const PREM_LIST_LIMIT = 20;

// All clones the centre picker can target. Order = display order in the
// inline keyboard. mockstream first, then the 6 clones. Update this
// list when a new centre comes online.
const PREM_CENTERS: ReadonlyArray<{ id: string; label: string }> = [
  { id: 'mockstream', label: 'Mock Stream' },
  { id: 'bek',        label: "Bekzod's Multilevel" },
  { id: 'record',     label: 'Multilevel Record' },
  { id: 'global',     label: 'Global Education' },
  { id: 'niners',     label: "Niner's Academy" },
  { id: 'muzaffars',  label: "Muzaffar's English" },
  { id: 'achievers',  label: "Achievers' Mocks" },
];
function premCenterLabel(id: string): string {
  return PREM_CENTERS.find(c => c.id === id)?.label || id;
}

// Parse an admin-typed target into the column we store it under.
// Accepts:
//   "@phd_khd"        → { kind: 'username', value: 'phd_khd' }
//   "phd_khd"         → { kind: 'username', value: 'phd_khd' }
//   "500742025"       → { kind: 'id', value: 500742025 }
//   "tg://user?id=N"  → { kind: 'id', value: N }   (rare paste form)
// Rejects strings that fail both checks.
function parsePremiumTarget(raw: string): { kind: 'id'; value: number } | { kind: 'username'; value: string } | null {
  const s = (raw || '').trim();
  if (!s) return null;
  const idMatch = s.match(/^(?:tg:\/\/user\?id=)?(\d{4,})$/);
  if (idMatch) {
    const n = parseInt(idMatch[1], 10);
    if (Number.isFinite(n) && n > 0) return { kind: 'id', value: n };
  }
  const unameMatch = s.match(/^@?([A-Za-z0-9_]{4,32})$/);
  if (unameMatch) return { kind: 'username', value: unameMatch[1].toLowerCase() };
  return null;
}
// Historic premium_emails rows may have either form ('mockstream' or
// 'mock_stream') because the website used both conventions over time.
// verify-passcode normalises both sides for matching, but PostgREST
// doesn't, so the bot has to query against the explicit variant list.
function centerVariants(centerId: string): string[] {
  const variants = new Set<string>([centerId, centerId.replace(/_/g, '')]);
  if (centerId === 'mockstream')  variants.add('mock_stream');
  if (centerId === 'mock_stream') variants.add('mockstream');
  return Array.from(variants);
}
async function fetchCenterPremiumRows(centerId: string, limit = PREM_LIST_LIMIT) {
  // mockstream bot acts as super-admin and lists rows across every
  // centre. Other bots wouldn't reach here (UI is gated) but if they
  // ever do, they only see their own centre's rows.
  const centers = centerId === 'mockstream'
    ? PREM_CENTERS.flatMap(c => centerVariants(c.id))
    : centerVariants(centerId);
  const { data } = await sb.from('premium_emails')
    .select('id, telegram_id, telegram_username, email, tier, role, active, center, created_at')
    .in('center', centers)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}
// Inline keyboard for picking which centre(s) to grant / revoke premium on.
// `flow` = 'g' (grant) or 'r' (revoke). The typed target is stored in
// admin_state so callbacks don't need to carry it in callback_data
// (which has a 64-byte cap that long @usernames would brush against).
function premiumCenterPicker(flow: 'g' | 'r') {
  const prefix = flow === 'g' ? 'apg' : 'apr';
  const rows: Array<Array<{ text: string; callback_data: string }>> = [];
  // Two-column layout for the 7 centres.
  for (let i = 0; i < PREM_CENTERS.length; i += 2) {
    const row = [PREM_CENTERS[i]];
    if (PREM_CENTERS[i + 1]) row.push(PREM_CENTERS[i + 1]);
    rows.push(row.map(c => ({ text: c.label, callback_data: `${prefix}:${c.id}` })));
  }
  rows.push([{ text: '🌐 All 7 centres', callback_data: `${prefix}:*` }]);
  rows.push([{ text: '❌ Cancel',         callback_data: `${prefix}_cancel` }]);
  return { inline_keyboard: rows };
}
async function sendAdminPremiumMenu(cfg: CenterConfig, chatId: number, message_id?: number) {
  const rows = await fetchCenterPremiumRows(cfg.center_id);
  const active = rows.filter(r => r.active !== false).length;
  const lines = [
    `🎁 <b>Premium grants — ${esc(cfg.center_id)}</b>`,
    '',
    `Grant Premium directly to a Telegram user. Works whether they're already in Telegram Mini App or sign in via web later.`,
    '',
    `<b>${active}</b> active grant${active === 1 ? '' : 's'} (last ${rows.length} shown via 📋).`,
  ];
  const kb = { inline_keyboard: [
    [{ text: '➕ Grant Premium',  callback_data: 'adm_prem_add' }],
    [{ text: '➖ Revoke Premium', callback_data: 'adm_prem_del' }],
    [{ text: '📋 List recent',    callback_data: 'adm_prem_list' }],
    [{ text: '⬅️ Back to admin menu', callback_data: 'adm_menu' }],
  ] };
  if (message_id) return editMessageText(cfg.bot_token, chatId, message_id, lines.join('\n'), { reply_markup: kb });
  return send(cfg.bot_token, chatId, lines.join('\n'), { reply_markup: kb });
}
async function sendAdminPremiumList(cfg: CenterConfig, chatId: number, message_id?: number) {
  const rows = await fetchCenterPremiumRows(cfg.center_id);
  const lines = [`📋 <b>Premium grants — ${esc(cfg.center_id)}</b>`, ''];
  if (!rows.length) {
    lines.push(`<i>None yet — tap ➕ on the Premium menu to grant one.</i>`);
  } else {
    for (const r of rows) {
      const who = r.telegram_username ? `@${esc(String(r.telegram_username))}`
                : r.telegram_id        ? `<code>${r.telegram_id}</code>`
                : r.email              ? esc(String(r.email))
                : '<i>(unknown)</i>';
      const tier = r.tier === 'premium' ? '👑' : r.role === 'admin' ? '🛡' : '🎟';
      const dot  = r.active === false ? '⚫' : '🟢';
      const cen  = r.center ? esc(premCenterLabel(String(r.center).replace(/_/g, ''))) : '<i>(global)</i>';
      lines.push(`${dot} ${tier} ${who} <i>· ${cen}</i>`);
    }
    if (rows.length === PREM_LIST_LIMIT) lines.push('', `<i>(showing latest ${PREM_LIST_LIMIT})</i>`);
  }
  const kb = { inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'adm_prem' }]] };
  if (message_id) return editMessageText(cfg.bot_token, chatId, message_id, lines.join('\n'), { reply_markup: kb });
  return send(cfg.bot_token, chatId, lines.join('\n'), { reply_markup: kb });
}
async function sendAdminVipCard(cfg: CenterConfig, chatId: number, type: 'premium' | 'regular', message_id?: number) {
  const { data } = await sb.from('vip_codes').select('code, expires_at, last_renewed_at, last_renewed_by').eq('center', cfg.center_id).eq('type', type).maybeSingle();
  const typeLabel = type === 'premium' ? '👑 Premium' : '🎟 Regular';
  let text: string;
  if (!data) {
    text = `<b>${esc(cfg.center_id)}</b> — ${typeLabel}\n\n<i>No code yet.</i>\n\nTap below to generate one.`;
  } else {
    const expiry = data.expires_at ? `\n📅 Expires: ${new Date(data.expires_at).toLocaleString('en-GB')}` : `\n♾ Never expires`;
    const renewed = data.last_renewed_at ? `\n🕒 Renewed: ${new Date(data.last_renewed_at).toLocaleString('en-GB')}` + (data.last_renewed_by ? ` <i>by ${esc(String(data.last_renewed_by))}</i>` : '') : '';
    text = `<b>${esc(cfg.center_id)}</b> — ${typeLabel}\n\n<b>Current code:</b>\n<code>${esc(data.code)}</code>${expiry}${renewed}`;
  }
  const kb = { inline_keyboard: [
    [{ text: '🔄 Revoke & generate new', callback_data: `adm_renew_vip:${type}` }],
    [{ text: '⬅️ Back to admin menu', callback_data: 'adm_menu' }],
  ] };
  if (message_id) return editMessageText(cfg.bot_token, chatId, message_id, text, { reply_markup: kb });
  return send(cfg.bot_token, chatId, text, { reply_markup: kb });
}
async function sendAdminMockSkills(cfg: CenterConfig, chatId: number, message_id?: number) {
  const text = `<b>${esc(cfg.center_id)}</b> — 📚 Mock codes\n\nPick a skill:`;
  const rows = SKILLS.map(s => [{ text: SKILL_LABEL[s], callback_data: `adm_mock_skill:${s}` }]);
  rows.push([{ text: '⬅️ Back to admin menu', callback_data: 'adm_menu' }]);
  const kb = { inline_keyboard: rows };
  if (message_id) return editMessageText(cfg.bot_token, chatId, message_id, text, { reply_markup: kb });
  return send(cfg.bot_token, chatId, text, { reply_markup: kb });
}
async function sendAdminMockList(cfg: CenterConfig, chatId: number, skill: Skill, message_id?: number) {
  const hideReg = await shouldHideRegulars(cfg.center_id);
  let q = sb.from('mock_codes').select('mock_number, tier').eq('center', cfg.center_id).eq('skill', skill);
  if (hideReg) q = q.eq('tier', 'premium');
  const { data } = await q;
  const nums = Array.from(new Set((data ?? []).map(m => m.mock_number))).sort((a, b) => a - b);
  const lines = [`<b>${esc(cfg.center_id)}</b>`, `${SKILL_LABEL[skill]} — mock codes`, ''];
  if (!nums.length) lines.push(`<i>No mock codes yet.</i>`, `Tap ➕ to add one.`);
  else lines.push(`Tap a number to view its ${hideReg ? 'premium' : '🟢 regular &amp; 🔥 premium'} code(s).`);
  const buttons: Array<Array<{ text: string; callback_data: string }>> = [];
  for (let i = 0; i < nums.length; i += 4) buttons.push(nums.slice(i, i + 4).map(n => ({ text: `#${n}`, callback_data: `adm_mock_n:${skill}:${n}` })));
  buttons.push([{ text: '➕ New mock #', callback_data: `adm_mock_new:${skill}` }]);
  buttons.push([{ text: '⬅️ Skills', callback_data: 'adm_mock' }]);
  const kb = { inline_keyboard: buttons };
  if (message_id) return editMessageText(cfg.bot_token, chatId, message_id, lines.join('\n'), { reply_markup: kb });
  return send(cfg.bot_token, chatId, lines.join('\n'), { reply_markup: kb });
}
async function sendAdminMockCard(cfg: CenterConfig, chatId: number, skill: Skill, num: number, message_id?: number) {
  const hideReg = await shouldHideRegulars(cfg.center_id);
  let q = sb.from('mock_codes').select('tier').eq('center', cfg.center_id).eq('skill', skill).eq('mock_number', num);
  if (hideReg) q = q.eq('tier', 'premium');
  const { data } = await q;
  const has = new Set((data ?? []).map(r => r.tier));
  const preTag = has.has('premium') ? '✅' : '⚪️';
  const regTag = has.has('regular') ? '✅' : '⚪️';
  const lines: string[] = [
    `<b>${esc(cfg.center_id)}</b>`,
    `${SKILL_LABEL[skill]} #${num}`,
    '',
    `Pick the <b>tier</b> you want to manage:`,
  ];
  if (!hideReg) lines.push('', `${regTag} 🟢 <b>Regular</b>  <i>(unlocks mock only)</i>`);
  lines.push('', `${preTag} 🔥 <b>Premium</b>  <i>(unlocks + AI grading + transcripts)</i>`);
  const buttons: Array<Array<{ text: string; callback_data: string }>> = [];
  if (!hideReg) buttons.push([{ text: '🟢 Regular', callback_data: `adm_mock_t:${skill}:${num}:regular` }]);
  buttons.push([{ text: '🔥 Premium', callback_data: `adm_mock_t:${skill}:${num}:premium` }]);
  buttons.push([{ text: '⬅️ Back', callback_data: `adm_mock_skill:${skill}` }]);
  const kb = { inline_keyboard: buttons };
  if (message_id) return editMessageText(cfg.bot_token, chatId, message_id, lines.join('\n'), { reply_markup: kb });
  return send(cfg.bot_token, chatId, lines.join('\n'), { reply_markup: kb });
}
async function sendAdminMockTierCard(cfg: CenterConfig, chatId: number, skill: Skill, num: number, tier: 'regular' | 'premium', message_id?: number) {
  const { data } = await sb.from('mock_codes').select('code, expires_at, last_renewed_at').eq('center', cfg.center_id).eq('skill', skill).eq('mock_number', num).eq('tier', tier).maybeSingle();
  const tierTitle = tier === 'regular' ? '🟢 <b>Regular</b> <i>(unlocks mock only)</i>' : '🔥 <b>Premium</b> <i>(unlocks + AI grading + transcripts)</i>';
  let body: string;
  if (!data) body = `<i>— not generated yet —</i>\nTap below to issue a fresh code.`;
  else {
    const expiry = data.expires_at ? `📅 Expires: ${new Date(data.expires_at).toLocaleString('en-GB')}` : `♾ Never expires`;
    const renewed = data.last_renewed_at ? `\n🕒 Renewed: ${new Date(data.last_renewed_at).toLocaleString('en-GB')}` : '';
    body = `<code>${esc(data.code)}</code>\n${expiry}${renewed}`;
  }
  const text = `<b>${esc(cfg.center_id)}</b>\n${SKILL_LABEL[skill]} #${num}\n\n${tierTitle}\n${body}`;
  const renewLabel = data ? '🔄 Renew' : '➕ Generate';
  const kb = { inline_keyboard: [
    [{ text: renewLabel, callback_data: `adm_mock_renew:${skill}:${num}:${tier}` }],
    [{ text: '⬅️ Back', callback_data: `adm_mock_n:${skill}:${num}` }],
  ] };
  if (message_id) return editMessageText(cfg.bot_token, chatId, message_id, text, { reply_markup: kb });
  return send(cfg.bot_token, chatId, text, { reply_markup: kb });
}
async function sendAdminBulkMenu(cfg: CenterConfig, chatId: number, message_id?: number) {
  const hideReg = await shouldHideRegulars(cfg.center_id);
  const counts = await fetchMockCounts();
  const tiersTxt = hideReg ? 'premium tier only' : 'both tiers (×2)';
  const total = (counts.listening + counts.reading + counts.writing + counts.speaking) * (hideReg ? 1 : 2);
  const text = `<b>${esc(cfg.center_id)}</b> — ⚡ <b>Bulk generate</b>\n\n📊 Mocks per skill (auto-detected):\n🎧 Listening: <b>${counts.listening}</b>\n📖 Reading: <b>${counts.reading}</b>\n✏️ Writing: <b>${counts.writing}</b>\n🎤 Speaking: <b>${counts.speaking}</b>\n<i>Total slots = ${total} (${tiersTxt})</i>\n\n• <b>Generate missing</b> — keeps existing codes, fills gaps only.\n• <b>Regenerate ALL</b> — <u>revokes</u> existing codes and issues fresh ones.`;
  const kb = { inline_keyboard: [
    [{ text: '⚡ Generate missing', callback_data: 'adm_bulk_run:missing' }],
    [{ text: '🔄 Regenerate ALL', callback_data: 'adm_bulk_run:all' }],
    [{ text: '⬅️ Back to admin menu', callback_data: 'adm_menu' }],
  ] };
  if (message_id) return editMessageText(cfg.bot_token, chatId, message_id, text, { reply_markup: kb });
  return send(cfg.bot_token, chatId, text, { reply_markup: kb });
}
async function runAdminBulk(cfg: CenterConfig, chatId: number, mode: 'missing' | 'all', message_id?: number) {
  const hideReg = await shouldHideRegulars(cfg.center_id);
  const counts = await fetchMockCounts();
  const allSkills = ['listening','reading','writing','speaking'] as const;
  const tiers = (hideReg ? ['premium'] : ['regular','premium']) as Array<'regular'|'premium'>;
  const actor = `bot:center:${cfg.center_id}`;
  const nowIso = new Date().toISOString();
  const existing = new Set<string>();
  if (mode === 'missing') {
    const { data: rows } = await sb.from('mock_codes').select('skill, mock_number, tier').eq('center', cfg.center_id);
    for (const r of rows ?? []) existing.add(`${r.skill}#${r.mock_number}#${r.tier}`);
  }
  const batch: Array<Record<string, unknown>> = [];
  for (const skill of allSkills) {
    const cap = (counts as Record<string, number>)[skill] || 0;
    for (let m = 1; m <= cap; m++) {
      for (const tier of tiers) {
        if (mode === 'missing' && existing.has(`${skill}#${m}#${tier}`)) continue;
        batch.push({ center: cfg.center_id, skill, mock_number: m, tier, code: genCode(8), expires_at: null, last_renewed_at: nowIso, last_renewed_by: actor });
      }
    }
  }
  let written = 0;
  for (let i = 0; i < batch.length; i += 250) {
    const chunk = batch.slice(i, i + 250);
    const { error } = await sb.from('mock_codes').upsert(chunk);
    if (error) { await send(cfg.bot_token, chatId, `❌ ${esc(error.message)}`); return; }
    written += chunk.length;
  }
  sb.from('code_audit').insert({ actor, action: 'bulk_renew_mocks', center: cfg.center_id, details: { mode, counts, tiers, written, via: 'center-bot' } }).then(() => {});
  const verb = mode === 'all' ? 'Regenerated' : 'Generated';
  const text = `✅ <b>${verb} ${written}</b> mock code${written === 1 ? '' : 's'} for <b>${esc(cfg.center_id)}</b>\n<i>(🎧${counts.listening} · 📖${counts.reading} · ✏️${counts.writing} · 🎤${counts.speaking}) × ${tiers.length} tier${tiers.length === 1 ? '' : 's'}, mode: <b>${mode}</b></i>`;
  const kb = { inline_keyboard: [
    [{ text: '📚 Mock skills', callback_data: 'adm_mock' }],
    [{ text: '⬅️ Admin menu', callback_data: 'adm_menu' }],
  ] };
  if (message_id) await editMessageText(cfg.bot_token, chatId, message_id, text, { reply_markup: kb });
  else await send(cfg.bot_token, chatId, text, { reply_markup: kb });
}

// ── Standard handlers (mostly unchanged from v44 except admin path) ──
async function showMainMenu(cfg: CenterConfig, chatId: number, firstName: string) {
  await send(cfg.bot_token, chatId, welcomeText(cfg, firstName), { reply_markup: mainKeyboard(cfg) });
}
async function handleAdminTap(cfg: CenterConfig, chatId: number, tgUserId: number) {
  if (await isAdminUnlocked(cfg.center_id, tgUserId)) {
    await clearAwaitingPasscode(cfg.center_id, tgUserId);
    await showAdminMenu(cfg, chatId);
    return;
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
  // Accept EITHER this centre's admin passcode OR the global super-admin
  // passcode (admin_passcodes row where center='__super__'). Mirrors how
  // @MS23_manager_bot authenticates — super admin can unlock any clone bot.
  const trimmed = text.trim();
  const { data: rows } = await sb.from('admin_passcodes')
    .select('center, passcode')
    .in('center', [cfg.center_id, '__super__']);
  let matched: { center: string; passcode: string } | null = null;
  for (const row of (rows ?? []) as Array<{ center: string; passcode: string }>) {
    if (row.passcode && ctEq(trimmed, String(row.passcode).trim())) { matched = row; break; }
  }
  if (!matched) {
    await send(cfg.bot_token, chatId, `❌ Wrong passcode. Try again or tap <b>${BTN.CANCEL}</b>.`); return;
  }
  await clearAwaitingPasscode(cfg.center_id, tgUserId);
  await unlockAdmin(cfg.center_id, tgUserId);
  const tag = matched.center === '__super__' ? ' <i>(super admin)</i>' : '';
  await send(cfg.bot_token, chatId, `✅ <b>Admin unlocked — ${esc(cfg.center_id)}</b>${tag}`, { reply_markup: { remove_keyboard: true } });
  await showMainMenu(cfg, chatId, firstName);
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

// ── Callback dispatcher (admin panel uses these). ──
async function handleCallback(cfg: CenterConfig, cb: Record<string, unknown>) {
  const cbId  = String(cb.id || '');
  const data  = String(cb.data || '');
  const msg   = (cb.message as Record<string, unknown> | undefined) || {};
  const chat  = (msg.chat as Record<string, unknown> | undefined) || {};
  const from  = (cb.from as Record<string, unknown> | undefined) || {};
  const chatId    = Number(chat.id);
  const messageId = Number(msg.message_id);
  const tgUserId  = Number(from.id);

  if (!chatId || !tgUserId) {
    await answerCb(cfg.bot_token, cbId);
    return;
  }
  // All admin callbacks require a still-valid unlock.
  if (!await isAdminUnlocked(cfg.center_id, tgUserId)) {
    await answerCb(cfg.bot_token, cbId, 'Admin session expired — tap 👨‍🏫 Admin again');
    return;
  }
  try {
    // Hard gate: any premium-grant callback fired against a non-mockstream
    // bot is rejected outright, even if the admin crafts the callback_data
    // manually. Covers the menu (adm_prem*) AND the centre-picker buttons
    // (apg:*, apr:*, *_cancel) so a clone admin can't write into
    // premium_emails at all.
    if ((data.startsWith('adm_prem') || data.startsWith('apg') || data.startsWith('apr'))
        && cfg.center_id !== 'mockstream') {
      await answerCb(cfg.bot_token, cbId, 'Premium grants are only available on the main bot');
      return;
    }
    if (data === 'adm_menu')      { await answerCb(cfg.bot_token, cbId); await showAdminMenu(cfg, chatId, messageId); return; }
    if (data === 'adm_lock')      {
      await answerCb(cfg.bot_token, cbId, 'Locked');
      await lockAdmin(cfg.center_id, tgUserId);
      await editMessageText(cfg.bot_token, chatId, messageId, '🔒 Admin session ended. Tap 👨‍🏫 Admin to unlock again.');
      return;
    }
    if (data.startsWith('adm_vip:')) {
      const type = data.slice('adm_vip:'.length) as 'premium' | 'regular';
      if (type === 'regular' && await shouldHideRegulars(cfg.center_id)) { await answerCb(cfg.bot_token, cbId, 'Regular VIP is hidden for this centre'); return; }
      await answerCb(cfg.bot_token, cbId);
      await sendAdminVipCard(cfg, chatId, type, messageId);
      return;
    }
    if (data.startsWith('adm_renew_vip:')) {
      const type = data.slice('adm_renew_vip:'.length) as 'premium' | 'regular';
      if (type === 'regular' && await shouldHideRegulars(cfg.center_id)) { await answerCb(cfg.bot_token, cbId, 'Regular VIP is hidden for this centre'); return; }
      const code = genCode(8);
      const actor = `bot:center:${cfg.center_id}`;
      const { error } = await sb.from('vip_codes').upsert({ center: cfg.center_id, type, code, expires_at: null, last_renewed_at: new Date().toISOString(), last_renewed_by: actor });
      if (error) { await answerCb(cfg.bot_token, cbId, 'Error'); return; }
      sb.from('code_audit').insert({ actor, action: 'renew_vip', center: cfg.center_id, details: { type, via: 'center-bot' } }).then(() => {});
      await answerCb(cfg.bot_token, cbId, '✅ New code generated!');
      await sendAdminVipCard(cfg, chatId, type, messageId);
      return;
    }
    if (data === 'adm_mock') { await answerCb(cfg.bot_token, cbId); await sendAdminMockSkills(cfg, chatId, messageId); return; }
    if (data.startsWith('adm_mock_skill:')) {
      const skill = data.slice('adm_mock_skill:'.length) as Skill;
      if (!SKILLS.includes(skill)) { await answerCb(cfg.bot_token, cbId); return; }
      await answerCb(cfg.bot_token, cbId);
      await sendAdminMockList(cfg, chatId, skill, messageId);
      return;
    }
    if (data.startsWith('adm_mock_n:')) {
      const [, skill, numStr] = data.split(':');
      const num = parseInt(numStr, 10);
      if (!SKILLS.includes(skill as Skill) || !Number.isInteger(num)) { await answerCb(cfg.bot_token, cbId); return; }
      await answerCb(cfg.bot_token, cbId);
      await sendAdminMockCard(cfg, chatId, skill as Skill, num, messageId);
      return;
    }
    if (data.startsWith('adm_mock_t:')) {
      const [, skill, numStr, tier] = data.split(':');
      const num = parseInt(numStr, 10);
      if (!SKILLS.includes(skill as Skill) || !Number.isInteger(num) || (tier !== 'regular' && tier !== 'premium')) { await answerCb(cfg.bot_token, cbId); return; }
      if (tier === 'regular' && await shouldHideRegulars(cfg.center_id)) { await answerCb(cfg.bot_token, cbId, 'Regular hidden for this centre'); return; }
      await answerCb(cfg.bot_token, cbId);
      await sendAdminMockTierCard(cfg, chatId, skill as Skill, num, tier, messageId);
      return;
    }
    if (data.startsWith('adm_mock_renew:')) {
      const [, skill, numStr, tier] = data.split(':');
      const num = parseInt(numStr, 10);
      if (!SKILLS.includes(skill as Skill) || !Number.isInteger(num) || (tier !== 'regular' && tier !== 'premium')) { await answerCb(cfg.bot_token, cbId); return; }
      if (tier === 'regular' && await shouldHideRegulars(cfg.center_id)) { await answerCb(cfg.bot_token, cbId, 'Regular hidden for this centre'); return; }
      const code = genCode(8);
      const actor = `bot:center:${cfg.center_id}`;
      const { error } = await sb.from('mock_codes').upsert({ center: cfg.center_id, skill, mock_number: num, tier, code, expires_at: null, last_renewed_at: new Date().toISOString(), last_renewed_by: actor });
      if (error) { await answerCb(cfg.bot_token, cbId, 'Error'); return; }
      sb.from('code_audit').insert({ actor, action: 'renew_mock', center: cfg.center_id, details: { skill, mock_number: num, tier, via: 'center-bot' } }).then(() => {});
      await answerCb(cfg.bot_token, cbId, `✅ New ${tier} code!`);
      await sendAdminMockTierCard(cfg, chatId, skill as Skill, num, tier, messageId);
      return;
    }
    if (data.startsWith('adm_mock_new:')) {
      const skill = data.slice('adm_mock_new:'.length) as Skill;
      if (!SKILLS.includes(skill)) { await answerCb(cfg.bot_token, cbId); return; }
      await setAdminState(cfg.center_id, tgUserId, `await_mock_num:${skill}`);
      await answerCb(cfg.bot_token, cbId);
      await send(cfg.bot_token, chatId, `📚 Send the <b>mock number</b> (1–999) for ${SKILL_LABEL[skill]}:`);
      return;
    }
    if (data === 'adm_prem')      { await answerCb(cfg.bot_token, cbId); await sendAdminPremiumMenu(cfg, chatId, messageId); return; }
    if (data === 'adm_prem_list') { await answerCb(cfg.bot_token, cbId); await sendAdminPremiumList(cfg, chatId, messageId); return; }
    if (data === 'adm_prem_add') {
      await setAdminState(cfg.center_id, tgUserId, 'await_prem_add');
      await answerCb(cfg.bot_token, cbId);
      await send(cfg.bot_token, chatId,
        `➕ <b>Grant Premium</b>\n\nSend the Telegram <b>@username</b> or numeric <b>ID</b>.\n\nExamples:\n• <code>@phd_khd</code>\n• <code>500742025</code>\n\nYou'll pick which centre(s) next.\n\nSend <b>/cancel</b> to abort.`);
      return;
    }
    if (data === 'adm_prem_del') {
      await setAdminState(cfg.center_id, tgUserId, 'await_prem_del');
      await answerCb(cfg.bot_token, cbId);
      await send(cfg.bot_token, chatId,
        `➖ <b>Revoke Premium</b>\n\nSend the Telegram <b>@username</b> or numeric <b>ID</b>.\n\nYou'll pick which centre(s) to revoke from next.\n\nSend <b>/cancel</b> to abort.`);
      return;
    }
    // Centre-picker cancel (grant or revoke flow).
    if (data === 'apg_cancel' || data === 'apr_cancel') {
      await setAdminState(cfg.center_id, tgUserId, null);
      await answerCb(cfg.bot_token, cbId, 'Cancelled');
      await editMessageText(cfg.bot_token, chatId, messageId, `❌ Cancelled.`);
      await sendAdminPremiumMenu(cfg, chatId);
      return;
    }
    // Centre-picker pick (grant or revoke). Reads target from admin_state.
    if (data.startsWith('apg:') || data.startsWith('apr:')) {
      const isGrant = data.startsWith('apg:');
      const chosen  = data.slice(4); // centre id, or '*'
      const state = await getAdminState(cfg.center_id, tgUserId);
      const prefix = isGrant ? 'pick_g:' : 'pick_r:';
      if (!state || !state.startsWith(prefix)) {
        await answerCb(cfg.bot_token, cbId, 'Session expired — start again');
        await sendAdminPremiumMenu(cfg, chatId);
        return;
      }
      // state: pick_g:i:500742025  or  pick_g:u:davirbekkhasanov
      const rest = state.slice(prefix.length);
      const colon = rest.indexOf(':');
      const kindChar = colon > 0 ? rest.slice(0, colon) : '';
      const valStr   = colon > 0 ? rest.slice(colon + 1) : '';
      const target = kindChar === 'i' && /^\d+$/.test(valStr)
        ? { kind: 'id' as const, value: parseInt(valStr, 10) }
        : kindChar === 'u' && valStr
          ? { kind: 'username' as const, value: valStr }
          : null;
      if (!target) {
        await setAdminState(cfg.center_id, tgUserId, null);
        await answerCb(cfg.bot_token, cbId, 'Bad state — start again');
        await sendAdminPremiumMenu(cfg, chatId);
        return;
      }
      // Resolve which centres this action covers.
      const targetCenters = chosen === '*'
        ? PREM_CENTERS.map(c => c.id)
        : (PREM_CENTERS.some(c => c.id === chosen) ? [chosen] : []);
      if (!targetCenters.length) {
        await answerCb(cfg.bot_token, cbId, 'Unknown centre');
        return;
      }
      await answerCb(cfg.bot_token, cbId, isGrant ? 'Granting…' : 'Revoking…');
      const actor = `bot:center:${cfg.center_id}:tg:${tgUserId}`;
      const applyTarget = <T extends { eq: (k: string, v: unknown) => T }>(q: T): T =>
        target.kind === 'id'
          ? q.eq('telegram_id', target.value)
          : q.eq('telegram_username', target.value);
      const who = target.kind === 'id' ? `<code>${target.value}</code>` : `@${esc(target.value)}`;

      if (isGrant) {
        // For each chosen centre: upsert (update if a row already exists
        // under any of that centre's underscore variants, else insert).
        const granted: string[] = [];
        for (const cid of targetCenters) {
          const variants = centerVariants(cid);
          const lookupQ = applyTarget(sb.from('premium_emails')
            .select('id, active, tier').in('center', variants));
          const { data: existingRows } = await lookupQ;
          const existing = (existingRows ?? [])[0];
          if (existing) {
            await sb.from('premium_emails').update({
              tier: 'premium', role: 'user', active: true, center: cid,
            }).eq('id', existing.id);
          } else {
            await sb.from('premium_emails').insert({
              ...(target.kind === 'id'
                ? { telegram_id: target.value }
                : { telegram_username: target.value }),
              center: cid,
              tier: 'premium', role: 'user', active: true,
            });
          }
          granted.push(cid);
        }
        sb.from('code_audit').insert({
          actor, action: 'premium_grant', center: cfg.center_id,
          details: { via: 'center-bot', target_kind: target.kind, target: target.value, centers: granted },
        }).then(() => {});
        await setAdminState(cfg.center_id, tgUserId, null);
        const where = chosen === '*' ? '<b>all 7 centres</b>' : `<b>${esc(premCenterLabel(chosen))}</b>`;
        await editMessageText(cfg.bot_token, chatId, messageId,
          `✅ <b>Premium granted</b> to ${who} on ${where}.\n\nThey'll see it on next Mini App open.`);
        await sendAdminPremiumMenu(cfg, chatId);
        return;
      }
      // Revoke flow.
      let totalDeleted = 0;
      const cleared: string[] = [];
      for (const cid of targetCenters) {
        const variants = centerVariants(cid);
        const hitQ = applyTarget(sb.from('premium_emails')
          .select('id').in('center', variants));
        const { data: hit } = await hitQ;
        const rowCount = (hit ?? []).length;
        if (rowCount) {
          const delQ = applyTarget(sb.from('premium_emails')
            .delete().in('center', variants));
          await delQ;
          totalDeleted += rowCount;
          cleared.push(cid);
        }
      }
      sb.from('code_audit').insert({
        actor, action: 'premium_revoke', center: cfg.center_id,
        details: { via: 'center-bot', target_kind: target.kind, target: target.value, centers: cleared, rows_deleted: totalDeleted },
      }).then(() => {});
      await setAdminState(cfg.center_id, tgUserId, null);
      if (!totalDeleted) {
        const where = chosen === '*' ? 'any centre' : `<b>${esc(premCenterLabel(chosen))}</b>`;
        await editMessageText(cfg.bot_token, chatId, messageId,
          `⚠️ No Premium grant found for ${who} on ${where}.`);
      } else {
        const where = chosen === '*' ? `<b>${cleared.length}</b> centre${cleared.length === 1 ? '' : 's'} (${cleared.map(c => esc(premCenterLabel(c))).join(', ')})`
                                     : `<b>${esc(premCenterLabel(chosen))}</b>`;
        await editMessageText(cfg.bot_token, chatId, messageId,
          `✅ <b>Premium revoked</b> for ${who} on ${where} (${totalDeleted} row${totalDeleted === 1 ? '' : 's'} removed).`);
      }
      await sendAdminPremiumMenu(cfg, chatId);
      return;
    }
    if (data === 'adm_bulk') { await answerCb(cfg.bot_token, cbId); await sendAdminBulkMenu(cfg, chatId, messageId); return; }
    if (data.startsWith('adm_bulk_run:')) {
      const mode = data.slice('adm_bulk_run:'.length) as 'missing' | 'all';
      if (mode !== 'missing' && mode !== 'all') { await answerCb(cfg.bot_token, cbId); return; }
      await answerCb(cfg.bot_token, cbId, 'Working…');
      await runAdminBulk(cfg, chatId, mode, messageId);
      return;
    }
    await answerCb(cfg.bot_token, cbId);
  } catch (e) {
    console.warn('[center-bot] callback handler error', e);
    await answerCb(cfg.bot_token, cbId);
  }
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
      await handleCallback(cfg, update.callback_query as Record<string, unknown>);
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

    // Admin state-driven text inputs — handled here BEFORE the passcode
    // attempt path so admin-typed values (mock numbers, @usernames, IDs)
    // don't get mis-read as wrong passcodes.
    if (await isAdminUnlocked(cfg.center_id, tgUserId)) {
      const adminState = await getAdminState(cfg.center_id, tgUserId);

      // ➕ New mock # — numeric reply expected
      if (adminState && adminState.startsWith('await_mock_num:') && /^\d{1,3}$/.test(text)) {
        const skill = adminState.slice('await_mock_num:'.length) as Skill;
        const n = parseInt(text, 10);
        if (n < 1 || n > 999 || !SKILLS.includes(skill)) {
          await send(cfg.bot_token, chatId, `❌ Mock number must be 1–999. Try again:`);
          return new Response('ok');
        }
        await setAdminState(cfg.center_id, tgUserId, null);
        await sendAdminMockCard(cfg, chatId, skill, n);
        return new Response('ok');
      }

      // 🎁 Premium grant / revoke — @username or numeric Telegram ID expected
      // Same defence-in-depth gate as the callback handler: even if a
      // clone-bot admin somehow has this state set, we drop it here.
      if ((adminState === 'await_prem_add' || adminState === 'await_prem_del') && cfg.center_id !== 'mockstream') {
        await setAdminState(cfg.center_id, tgUserId, null);
        // Fall through to normal dispatch.
      } else if (adminState === 'await_prem_add' || adminState === 'await_prem_del') {
        if (/^\/cancel\b/i.test(text)) {
          await setAdminState(cfg.center_id, tgUserId, null);
          await send(cfg.bot_token, chatId, `❌ Cancelled.`);
          await sendAdminPremiumMenu(cfg, chatId);
          return new Response('ok');
        }
        if (isMenuButton) {
          await setAdminState(cfg.center_id, tgUserId, null);
          // Fall through to the regular menu-button handling below.
        } else {
          const target = parsePremiumTarget(text);
          if (!target) {
            await send(cfg.bot_token, chatId,
              `❌ <b>Couldn't parse that.</b>\n\nSend a Telegram <b>@username</b> (4–32 letters/digits/underscores) or a numeric <b>ID</b> (4+ digits).\n\nOr send <b>/cancel</b>.`);
            return new Response('ok');
          }
          // Persist the parsed target in admin_state so the centre-picker
          // callbacks can act on it without having to stuff the @username
          // into 64-byte callback_data. Format:
          //   pick_g:i:500742025         — grant, telegram_id
          //   pick_g:u:davirbekkhasanov  — grant, telegram_username
          //   pick_r:i:500742025         — revoke, telegram_id
          //   pick_r:u:davirbekkhasanov  — revoke, telegram_username
          const flow = adminState === 'await_prem_add' ? 'g' : 'r';
          const targetEnc = target.kind === 'id' ? `i:${target.value}` : `u:${target.value}`;
          await setAdminState(cfg.center_id, tgUserId, `pick_${flow}:${targetEnc}`);
          const who = target.kind === 'id' ? `<code>${target.value}</code>` : `@${esc(target.value)}`;
          const verb = flow === 'g' ? 'grant' : 'revoke';
          await send(cfg.bot_token, chatId,
            `🎯 Target: ${who}\n\nWhich centre(s) should this Premium ${verb} apply to?`,
            { reply_markup: premiumCenterPicker(flow) });
          return new Response('ok');
        }
      }
    }

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

    if (text === BTN.TAKE_MOCK) {
      // Centers with a t.me Mini App deeplink: reply with an inline
      // launch button so the user gets the initData-passing launch path.
      // Centers without one: the reply-keyboard web_app already launches
      // them directly, so a typed "🎯 Take Mock" just re-shows the menu.
      const inline = takeMockInline(cfg);
      if (cfg.show_mock_btn && inline) {
        await send(cfg.bot_token, chatId,
          `🎯 <b>Tap below to open Mock Stream</b>\n\n` +
          `<i>You'll be signed in automatically.</i>`,
          { reply_markup: inline });
      } else {
        await showMainMenu(cfg, chatId, firstName);
      }
      return new Response('ok');
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

    await showMainMenu(cfg, chatId, firstName);
    return new Response('ok');
  } catch (e) {
    console.error('[center-bot] handler error', e);
    return new Response('ok');
  }
});
