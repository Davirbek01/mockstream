// =====================================================================
// Supabase Edge Function: support-bot
// ---------------------------------------------------------------------
// Standalone Telegram bot @MS23_support1_bot that mirrors two tabs of
// the website's chat-bubble:
//
//   🆓 Support     — Gemini-powered chat. If the user asks for a free
//                    mock code, calls get-promo-code to issue one and
//                    appends a "👑 Get Premium" upsell button.
//   📖 Dictionary  — English ⇄ Uzbek dictionary lookup (same Gemini
//                    JSON prompt the chat-bubble uses).
//   👑 Premium     — opens https://t.me/mrkhasanoff3 in a chat.
//
// Independent rate limits (separate user_key namespace = "tg_support_bot:<id>")
//
// Webhook URL:
//   https://<project>.functions.supabase.co/support-bot
//
// Bot token secret:  MS23_SUPPORT_BOT_TOKEN
// =====================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const BOT_TOKEN        = Deno.env.get('MS23_SUPPORT_BOT_TOKEN') || '';

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const PREMIUM_TG    = 'mrkhasanoff3';
const PREMIUM_TEXT  =
  '💎 Salom!\n\n🚀 Men Mock Stream Premium obunasini sotib olmoqchiman. ' +
  'Iltimos narxlar va imkoniyatlar haqida ma\'lumot bera olasizmi?';
const CENTER        = 'mock_stream'; // get-promo-code will normalise → 'mockstream'

// ─────────────────────────────────────────────────────────────────────
// Telegram helpers
// ─────────────────────────────────────────────────────────────────────
async function tg(method: string, payload: Record<string, unknown>) {
  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await r.json().catch(() => ({}));
  } catch (e) {
    console.warn('[support-bot] tg fetch failed', method, e);
    return null;
  }
}
const send = (chat_id: number, text: string, extra: Record<string, unknown> = {}) =>
  tg('sendMessage', { chat_id, text, parse_mode: 'HTML', disable_web_page_preview: true, ...extra });
const sendChatAction = (chat_id: number, action: string) =>
  tg('sendChatAction', { chat_id, action });

function esc(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─────────────────────────────────────────────────────────────────────
// Keyboards
// ─────────────────────────────────────────────────────────────────────
const BTN = {
  SUPPORT:  '🆓 Support',
  DICT:     '📖 Dictionary',
  PREMIUM:  '👑 Premium',
  // Skill picker (after a code-request without a clear skill)
  LISTEN:   '🎧 Listening',
  READ:     '📖 Reading',
  WRITE:    '✍️ Writing',
  SPEAK:    '🎤 Speaking',
  FULL:     '📚 Full mock',
  CANCEL:   '❌ Cancel'
};

function mainKeyboard() {
  return {
    keyboard: [
      [{ text: BTN.SUPPORT }, { text: BTN.DICT }],
      [{ text: BTN.PREMIUM }]
    ],
    resize_keyboard: true,
    is_persistent:   true
  };
}

function skillKeyboard() {
  return {
    keyboard: [
      [{ text: BTN.LISTEN }, { text: BTN.READ }],
      [{ text: BTN.WRITE  }, { text: BTN.SPEAK }],
      [{ text: BTN.FULL }],
      [{ text: BTN.CANCEL }]
    ],
    resize_keyboard:  true,
    one_time_keyboard: true
  };
}

function premiumInline() {
  return {
    inline_keyboard: [[
      { text: '👑 Get Premium', url: `https://t.me/${PREMIUM_TG}?text=${encodeURIComponent(PREMIUM_TEXT)}` }
    ]]
  };
}

// ─────────────────────────────────────────────────────────────────────
// Per-user mode (DB-backed; isolates are ephemeral)
// ─────────────────────────────────────────────────────────────────────
type Mode = 'support' | 'dictionary' | 'await_skill';

async function getMode(tgUserId: number): Promise<Mode> {
  const { data } = await sb
    .from('support_bot_user_modes')
    .select('mode')
    .eq('tg_user_id', tgUserId)
    .maybeSingle();
  const m = (data?.mode as Mode | undefined) || 'support';
  return (m === 'support' || m === 'dictionary' || m === 'await_skill') ? m : 'support';
}
async function setMode(tgUserId: number, mode: Mode): Promise<void> {
  await sb.from('support_bot_user_modes').upsert({
    tg_user_id: tgUserId,
    mode,
    updated_at: new Date().toISOString()
  });
}

// ─────────────────────────────────────────────────────────────────────
// Gemini API key — pulled once per cold start from site_settings
// ─────────────────────────────────────────────────────────────────────
let _geminiKey: string | null = null;
async function getGeminiKey(): Promise<string | null> {
  if (_geminiKey) return _geminiKey;
  try {
    const { data } = await sb
      .from('site_settings')
      .select('key,value')
      .in('key', [
        'gemini_active_plan',
        'gemini_api_key_prepay', 'gemini_api_key_prepay_2',
        'gemini_api_key_postpay', 'gemini_api_key_postpay_2'
      ]);
    const map = new Map<string, string>();
    (data ?? []).forEach((r: { key: string; value: string }) => map.set(r.key, r.value));
    const plan = (map.get('gemini_active_plan') || 'prepay').toLowerCase();
    const key  = map.get(`gemini_api_key_${plan}`) || map.get(`gemini_api_key_${plan}_2`) ||
                 map.get('gemini_api_key_prepay') || map.get('gemini_api_key_postpay');
    if (key) { _geminiKey = key; return key; }
  } catch (e) { console.warn('[support-bot] gemini key load failed:', e); }
  // Fallback to env var if site_settings has nothing
  const envKey = Deno.env.get('GEMINI_API_KEY');
  if (envKey) { _geminiKey = envKey; return envKey; }
  return null;
}

async function callGemini(prompt: string, temperature = 0.7): Promise<string | null> {
  const key = await getGeminiKey();
  if (!key) { console.warn('[support-bot] no gemini key'); return null; }
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature, maxOutputTokens: 600 }
        })
      }
    );
    const j = await r.json();
    const txt = j?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof txt === 'string' ? txt.trim() : null;
  } catch (e) {
    console.warn('[support-bot] gemini call failed:', e);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────
// SUPPORT mode — chat + free code issuing
// ─────────────────────────────────────────────────────────────────────
const MOCK_CODE_INTENT_RX =
  /\b(give\s*(me)?\s*(a\s*)?(free\s*)?(mock\s*)?(code|promo|kod|kod\s*ber|free\s*test|free\s*mock)|promokod|promo\s*kod|free\s*code|code\s*for|kod\s*kerak|kod\s*ber|menga\s*kod|bepul\s*kod|test\s*kod|mock\s*kod|kod\s*olish|kod\s*ola|код|промокод|бесплатн.*код|нужен\s*код|дай\s*код|free\s*try|try\s*free|test\s*the\s*mock)\b/i;

function detectSkill(text: string): string | null {
  const t = text.toLowerCase();
  if (/\blisten|listening|tinglash|тинглаш|аудио|audio\b/.test(t)) return 'listening';
  if (/\bread|reading|o['']?qish|ўқиш|чтение\b/.test(t))           return 'reading';
  if (/\bwrit|writing|yoz|ёз|письм\b/.test(t))                       return 'writing';
  if (/\bspeak|speaking|gapir|гапир|разговор|устн\b/.test(t))        return 'speaking';
  if (/\bfull[\s_-]*mock|to['']?liq|toliq|полный\b/.test(t))         return 'full_mock';
  return null;
}

function skillFromButton(text: string): string | null {
  switch (text) {
    case BTN.LISTEN: return 'listening';
    case BTN.READ:   return 'reading';
    case BTN.WRITE:  return 'writing';
    case BTN.SPEAK:  return 'speaking';
    case BTN.FULL:   return 'full_mock';
    default:         return null;
  }
}

async function issueCode(chatId: number, tgUserId: number, skill: string) {
  await sendChatAction(chatId, 'typing');
  const userKey = `tg_support_bot:${tgUserId}`;
  try {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/get-promo-code`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ center: CENTER, skill, user_key: userKey })
    });
    const j = await r.json();

    if (r.ok && j?.ok && j?.code) {
      const skillLabel = ({
        listening: '🎧 Listening',
        reading:   '📖 Reading',
        writing:   '✍️ Writing',
        speaking:  '🎤 Speaking',
        full_mock: '📚 Full mock'
      } as Record<string, string>)[skill] || skill;
      const remaining = (typeof j.daily_remaining === 'number') ? j.daily_remaining : null;
      await send(chatId,
        `✅ <b>Here's your free regular code</b>\n\n` +
        `<b>${skillLabel}</b>${j.mock_number ? ` — mock #${j.mock_number}` : ''}\n\n` +
        `<code>${esc(String(j.code))}</code>\n\n` +
        `<i>Regular tier: unlocks the mock so you can practice. ` +
        `<b>No</b> AI scoring, <b>no</b> transcripts, <b>no</b> retries — those are Premium-only.</i>` +
        (remaining !== null ? `\n\n<i>${remaining} free code(s) left today.</i>` : ''),
        { reply_markup: premiumInline() });
      await send(chatId,
        `<b>🔥 Want more?</b> Unlock instant AI scoring, full transcripts, unlimited retries and one code that opens every skill.`,
        { reply_markup: { ...mainKeyboard() } });
      return;
    }

    // Rate-limit / no-stock paths
    const err  = String(j?.error || 'unknown');
    const msg  = String(j?.message || '');
    const wait = Number(j?.retry_after_seconds || 0);
    if (err === 'hourly_limit_reached' || err === 'daily_limit_reached') {
      const mins = Math.max(1, Math.ceil(wait / 60));
      await send(chatId,
        `⏳ <b>Free-tier limit reached</b>\n\n` +
        (err === 'hourly_limit_reached'
          ? `Free tier allows 1 mock code per hour. Try again in <b>~${mins} min</b>.`
          : `Free tier allows 4 mock codes per day. Try again in <b>~${mins} min</b>.`) +
        `\n\nUpgrade to Premium for instant unlimited access.`,
        { reply_markup: premiumInline() });
      return;
    }
    if (err === 'no_stock' || err === 'no_codes_available') {
      await send(chatId,
        `😔 No free codes available for this skill right now. ` +
        `Please try another skill, or get instant Premium access.`,
        { reply_markup: premiumInline() });
      return;
    }
    await send(chatId,
      `⚠️ Couldn't issue a code: ${esc(msg || err)}.`,
      { reply_markup: premiumInline() });
  } catch (e) {
    console.warn('[support-bot] issueCode failed:', e);
    await send(chatId, `⚠️ Sorry, something went wrong issuing your code. Please try again in a moment.`);
  }
}

const SUPPORT_SYSTEM = (
  `You are Mock Stream AI, a friendly bilingual (English / Uzbek) assistant for an IELTS & CEFR ` +
  `mock-exam platform. The user is chatting with you via Telegram. ` +
  `Help with technical issues, exam questions, platform navigation. ` +
  `Keep replies SHORT (max 4–5 sentences). Use the user's language. ` +
  `If they sound interested in pricing, plans, payment, premium, or account upgrade — ` +
  `briefly mention that Premium unlocks AI scoring, full transcripts, unlimited retries and ` +
  `every skill from one code, and tell them to tap the "👑 Premium" button to message the admin. ` +
  `Do NOT invent prices.`
);

async function handleSupportText(chatId: number, tgUserId: number, text: string) {
  // Code request? Detect skill or ask for one.
  if (MOCK_CODE_INTENT_RX.test(text)) {
    const skill = detectSkill(text);
    if (skill) { await issueCode(chatId, tgUserId, skill); return; }
    await setMode(tgUserId, 'await_skill');
    await send(chatId,
      `🎯 <b>Pick a skill</b> for your free regular code:`,
      { reply_markup: skillKeyboard() });
    return;
  }
  // Otherwise: Gemini chat.
  await sendChatAction(chatId, 'typing');
  const reply = await callGemini(`${SUPPORT_SYSTEM}\n\nUser: ${text}\nAssistant:`, 0.6);
  await send(chatId,
    reply || `Sorry, I couldn't reach the AI service. Please try again.`,
    { reply_markup: premiumInline() });
}

// ─────────────────────────────────────────────────────────────────────
// DICTIONARY mode
// ─────────────────────────────────────────────────────────────────────
const DICT_PROMPT = (word: string) => (
  `You are a bilingual English⇄Uzbek dictionary assistant. The user typed: "${word}"\n\n` +
  `Respond ONLY with valid JSON (no markdown, no commentary) in this exact shape:\n` +
  `{\n` +
  `  "direction": "en2uz" | "uz2en",\n` +
  `  "word": "the corrected input word/phrase",\n` +
  `  "misspelled": true | false,\n` +
  `  "english": "the English form",\n` +
  `  "uzbek": "the Uzbek form (Latin script)",\n` +
  `  "definition": "Brief plain-English explanation (1-2 sentences)",\n` +
  `  "example_en": "A short natural English example sentence",\n` +
  `  "example_uz": "The same sentence translated to Uzbek"\n` +
  `}\n\n` +
  `Detect direction automatically. If misspelled, gently correct in "word".`
);

interface DictResult {
  direction?: string;
  word?: string;
  misspelled?: boolean;
  english?: string;
  uzbek?: string;
  definition?: string;
  example_en?: string;
  example_uz?: string;
}

async function handleDictText(chatId: number, _tgUserId: number, text: string) {
  await sendChatAction(chatId, 'typing');
  const raw = await callGemini(DICT_PROMPT(text), 0.2);
  if (!raw) {
    await send(chatId, `⚠️ Sorry, the dictionary service is unreachable. Please try again.`);
    return;
  }
  let parsed: DictResult | null = null;
  try {
    // Strip code fences if model added any.
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (_e) {
    await send(chatId,
      `📖 <b>Couldn't parse a structured answer.</b>\n\n${esc(raw).slice(0, 1500)}`);
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
  await send(chatId, lines.join('\n'));
}

// ─────────────────────────────────────────────────────────────────────
// Webhook entry
// ─────────────────────────────────────────────────────────────────────
async function welcome(chatId: number, firstName: string) {
  await send(chatId,
    `<b>👋 Welcome, ${esc(firstName || 'friend')}!</b>\n\n` +
    `I'm <b>Mock Stream AI</b> — your free helper:\n\n` +
    `<b>🆓 Support</b> — ask me anything, or request a free regular mock code.\n` +
    `<b>📖 Dictionary</b> — quick English ⇄ Uzbek translations.\n` +
    `<b>👑 Premium</b> — unlock instant AI scoring, transcripts &amp; unlimited retries.\n\n` +
    `Tap a button below to begin.`,
    { reply_markup: mainKeyboard() });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'GET')  return new Response('support-bot online', { status: 200 });
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });
  if (!BOT_TOKEN) return new Response('bot token not configured', { status: 500 });

  let update: Record<string, unknown>;
  try { update = await req.json(); }
  catch { return new Response('bad json', { status: 400 }); }

  try {
    const message = update.message as Record<string, unknown> | undefined;
    if (!message) return new Response('ok');

    const chat      = (message.chat as Record<string, unknown>) || {};
    const from      = (message.from as Record<string, unknown>) || {};
    const chatId    = Number(chat.id);
    const tgUserId  = Number(from.id);
    const firstName = String(from.first_name || '');
    const text      = String(message.text || '').trim();
    if (!chatId || !tgUserId) return new Response('ok');

    // /start /help /menu → welcome
    if (/^\/(start|menu|help)\b/i.test(text)) {
      await setMode(tgUserId, 'support');
      await welcome(chatId, firstName);
      return new Response('ok');
    }

    // Premium — always works, regardless of mode
    if (text === BTN.PREMIUM) {
      await send(chatId,
        `👑 <b>Mock Stream Premium</b>\n\n` +
        `Tap below to message the admin (<b>@${esc(PREMIUM_TG)}</b>) about prices &amp; activation.\n\n` +
        `Premium unlocks:\n` +
        `🤖 Instant AI scoring &amp; feedback\n` +
        `📝 Full transcripts (speaking + writing)\n` +
        `♾️ Unlimited retries\n` +
        `🔓 One code unlocks every skill`,
        { reply_markup: premiumInline() });
      return new Response('ok');
    }

    // Mode-switch buttons
    if (text === BTN.SUPPORT) {
      await setMode(tgUserId, 'support');
      await send(chatId,
        `🆓 <b>Support mode</b>\n\nAsk me anything, or just say <i>"give me a free code"</i> to get a regular mock code.`,
        { reply_markup: mainKeyboard() });
      return new Response('ok');
    }
    if (text === BTN.DICT) {
      await setMode(tgUserId, 'dictionary');
      await send(chatId,
        `📖 <b>Dictionary mode</b>\n\nSend any English or Uzbek word/phrase and I'll translate &amp; define it.`,
        { reply_markup: mainKeyboard() });
      return new Response('ok');
    }

    if (!text) return new Response('ok');

    const mode = await getMode(tgUserId);

    // Awaiting skill choice (after a code request without skill)
    if (mode === 'await_skill') {
      if (text === BTN.CANCEL || /^\/cancel\b/i.test(text)) {
        await setMode(tgUserId, 'support');
        await send(chatId, `❌ Cancelled.`, { reply_markup: mainKeyboard() });
        return new Response('ok');
      }
      const skill = skillFromButton(text) || detectSkill(text);
      if (skill) {
        await setMode(tgUserId, 'support');
        await issueCode(chatId, tgUserId, skill);
        return new Response('ok');
      }
      await send(chatId, `Please tap one of the skill buttons below.`, { reply_markup: skillKeyboard() });
      return new Response('ok');
    }

    if (mode === 'dictionary') {
      await handleDictText(chatId, tgUserId, text);
      return new Response('ok');
    }

    // Default: support
    await handleSupportText(chatId, tgUserId, text);
    return new Response('ok');
  } catch (e) {
    console.error('[support-bot] handler error:', e);
    return new Response('ok');
  }
});
