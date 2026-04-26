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
// Default center for users who open the bot via search (no deep-link).
// Per-user override is stored in support_bot_user_centers.
const DEFAULT_CENTER = 'mock_stream';

// ---------------------------------------------------------------------
// Per-user center (deep-link from each center bot sets this)
// ---------------------------------------------------------------------
async function getUserCenter(tgUserId: number): Promise<string> {
  const { data } = await sb
    .from('support_bot_user_centers')
    .select('center_id')
    .eq('tg_user_id', tgUserId)
    .maybeSingle();
  return (data?.center_id as string | undefined) || DEFAULT_CENTER;
}
async function setUserCenter(tgUserId: number, centerId: string): Promise<boolean> {
  // Validate against centers table
  const { data: c } = await sb
    .from('centers')
    .select('id, display_name')
    .eq('id', centerId)
    .maybeSingle();
  if (!c) return false;
  await sb.from('support_bot_user_centers').upsert({
    tg_user_id: tgUserId,
    center_id:  centerId,
    updated_at: new Date().toISOString()
  });
  return true;
}
async function getCenterDisplayName(centerId: string): Promise<string> {
  const { data } = await sb
    .from('centers')
    .select('display_name')
    .eq('id', centerId)
    .maybeSingle();
  return (data?.display_name as string | undefined) || centerId;
}

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
  SUPPORT:  '� Support',
  DICT:     '📖 Dictionary',
  PREMIUM:  '👑 Premium',
  // Skill picker (always visible on the main keyboard now)
  LISTEN:   '🎧 Listening',
  READ:     '📖 Reading',
  WRITE:    '✍️ Writing',
  SPEAK:    '🎤 Speaking',
  FULL:     '📚 Full mock',
  CANCEL:   '❌ Cancel'
};

function mainKeyboard() {
  // Code-first layout: skill buttons always visible. AI Support is opt-in.
  return {
    keyboard: [
      [{ text: BTN.LISTEN }, { text: BTN.READ }],
      [{ text: BTN.WRITE  }, { text: BTN.SPEAK }],
      [{ text: BTN.FULL }],
      [{ text: BTN.SUPPORT }, { text: BTN.DICT }],
      [{ text: BTN.PREMIUM }]
    ],
    resize_keyboard: true,
    is_persistent:   true
  };
}

function skillKeyboard() {
  // Same layout as mainKeyboard — persistent, always visible. Avoids the
  // collapsible 'one_time_keyboard' UX that hid skills after first tap.
  return mainKeyboard();
}

// Reusable response when a user asks for a full-mock free code.
// Regular full-mock codes are NOT issued by the support bot — full mock is a
// Premium-only perk (one code unlocks every skill).
async function sendFullMockPremiumOnly(chatId: number) {
  await send(chatId,
    `📚 <b>Full mock is a Premium perk</b>\n\n` +
    `The free regular tier covers each skill individually. Pick a single skill ` +
    `(<b>Listening / Reading / Writing / Speaking</b>) for a free code, or upgrade to ` +
    `<b>Premium</b> — one code that opens the whole mock plus AI scoring &amp; full transcripts.`,
    { reply_markup: premiumInline() });
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
// Modes: 'idle' (default — automated code flow only, no AI)
//        | 'support' (AI conversation, opted-in via 🆘 Support button)
//        | 'dictionary'
//        | 'await_skill' | 'await_mock:<skill>'
// ─────────────────────────────────────────────────────────────────────
type Mode = string;

async function getMode(tgUserId: number): Promise<Mode> {
  const { data } = await sb
    .from('support_bot_user_modes')
    .select('mode')
    .eq('tg_user_id', tgUserId)
    .maybeSingle();
  return (data?.mode as Mode | undefined) || 'idle';
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

async function callGemini(prompt: string, temperature = 0.7, maxOutputTokens = 1024): Promise<string | null> {
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
          generationConfig: { temperature, maxOutputTokens }
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
    default:         return null;
  }
}

async function issueCode(chatId: number, tgUserId: number, skill: string, mockNumber?: number) {
  await sendChatAction(chatId, 'typing');
  const userKey = `tg_support_bot:${tgUserId}`;
  const center  = await getUserCenter(tgUserId);
  try {
    const body: Record<string, unknown> = { center, skill, user_key: userKey };
    if (typeof mockNumber === 'number' && mockNumber > 0) body.mock_number = mockNumber;
    const r = await fetch(`${SUPABASE_URL}/functions/v1/get-promo-code`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify(body)
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
    if (skill === 'full_mock') {
      await sendFullMockPremiumOnly(chatId);
      return;
    }
    if (skill) {
      await setMode(tgUserId, `await_mock:${skill}`);
      const label = ({
        listening: '🎧 Listening',
        reading:   '📖 Reading',
        writing:   '✍️ Writing',
        speaking:  '🎤 Speaking'
      } as Record<string, string>)[skill] || skill;
      await send(chatId,
        `🔢 <b>${label} — pick a mock #</b>\n\n` +
        `Type the mock number you want to try (e.g. <b>1</b>, <b>5</b>, <b>12</b>).\n\n` +
        `Send <b>/cancel</b> to go back.`,
        { reply_markup: { remove_keyboard: true } });
      return;
    }
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
  const raw = await callGemini(DICT_PROMPT(text), 0.2, 800);
  if (!raw) {
    await send(chatId, `⚠️ Sorry, the dictionary service is unreachable. Please try again.`);
    return;
  }
  let parsed: DictResult | null = null;
  // Strip code fences then extract the first balanced {...} block (Gemini sometimes
  // appends commentary or wraps in ```json fences).
  const stripped = raw.replace(/```(?:json)?/gi, '').trim();
  const start = stripped.indexOf('{');
  if (start >= 0) {
    let depth = 0, end = -1, inStr = false, esc2 = false;
    for (let i = start; i < stripped.length; i++) {
      const c = stripped[i];
      if (inStr) {
        if (esc2) { esc2 = false; continue; }
        if (c === '\\') { esc2 = true; continue; }
        if (c === '"') inStr = false;
        continue;
      }
      if (c === '"') { inStr = true; continue; }
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) { end = i; break; } }
    }
    if (end > start) {
      try { parsed = JSON.parse(stripped.slice(start, end + 1)); } catch { /* fall through */ }
    }
  }
  if (!parsed) {
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
async function welcome(chatId: number, firstName: string, centerName: string) {
  await send(chatId,
    `<b>👋 Welcome, ${esc(firstName || 'friend')}!</b>\n\n` +
    `I'm your free helper bot for <b>${esc(centerName)}</b>.\n\n` +
    `🎁 <b>Tap a skill button below to get a free regular code</b> instantly:\n` +
    `🎧 Listening &nbsp; 📖 Reading &nbsp; ✍️ Writing &nbsp; 🎤 Speaking\n\n` +
    `📚 <b>Full mock</b> — Premium only.\n` +
    `🆘 <b>Support</b> — talk to AI for help with anything else.\n` +
    `📖 <b>Dictionary</b> — quick English ⇄ Uzbek lookup.\n` +
    `👑 <b>Premium</b> — unlock AI scoring, transcripts &amp; unlimited retries.\n\n` +
    `<i>Free tier: 1 code/hour, 4 codes/day. Send /center to switch center.</i>`,
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

    // /start [center_id] /help /menu  → welcome (deep-link payload sets center)
    const startMatch = text.match(/^\/start(?:@\w+)?(?:\s+(.+))?$/i);
    if (startMatch || /^\/(menu|help)\b/i.test(text)) {
      const payload = (startMatch?.[1] || '').trim().toLowerCase();
      if (payload) {
        const ok = await setUserCenter(tgUserId, payload);
        if (!ok) {
          await send(chatId,
            `⚠️ Unknown center "<code>${esc(payload)}</code>". Using default.\n\n` +
            `Send /center &lt;center_id&gt; to set it manually.`);
        }
      }
      const center     = await getUserCenter(tgUserId);
      const centerName = await getCenterDisplayName(center);
      await setMode(tgUserId, 'idle');
      await welcome(chatId, firstName, centerName);
      return new Response('ok');
    }

    // /center [center_id] — show or set the user's center
    const centerCmd = text.match(/^\/center(?:@\w+)?(?:\s+(.+))?$/i);
    if (centerCmd) {
      const arg = (centerCmd[1] || '').trim().toLowerCase();
      if (arg) {
        const ok = await setUserCenter(tgUserId, arg);
        if (ok) {
          const name = await getCenterDisplayName(arg);
          await send(chatId, `✅ Center set to <b>${esc(name)}</b>. Free codes will now come from this center.`);
        } else {
          await send(chatId, `⚠️ Unknown center "<code>${esc(arg)}</code>".`);
        }
      } else {
        const cur     = await getUserCenter(tgUserId);
        const curName = await getCenterDisplayName(cur);
        await send(chatId,
          `🏫 <b>Current center:</b> ${esc(curName)} (<code>${esc(cur)}</code>)\n\n` +
          `To switch, send <code>/center &lt;center_id&gt;</code>.\n` +
          `Or open this bot from your center's official Telegram bot — that sets it automatically.`);
      }
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
        `� <b>Support mode — AI is now active</b>\n\n` +
        `Hi! I'm <b>Mock Stream AI</b>. Describe your issue (login, payment, code not working, ` +
        `technical problem, exam question — anything) and I'll do my best to help.\n\n` +
        `<i>Tap any skill button to exit Support and grab a free code instead.</i>`,
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

    // Skill buttons — always work from any mode (code-first UX)
    {
      const directSkill = skillFromButton(text);
      if (directSkill) {
        await setMode(tgUserId, `await_mock:${directSkill}`);
        const label = ({
          listening: '🎧 Listening',
          reading:   '📖 Reading',
          writing:   '✍️ Writing',
          speaking:  '🎤 Speaking'
        } as Record<string, string>)[directSkill] || directSkill;
        await send(chatId,
          `🔢 <b>${label} — pick a mock #</b>\n\n` +
          `Type the mock number you want to try (e.g. <b>1</b>, <b>5</b>, <b>12</b>).\n\n` +
          `Send <b>/cancel</b> to go back.`);
        return new Response('ok');
      }
      if (text === BTN.FULL) {
        await setMode(tgUserId, 'idle');
        await sendFullMockPremiumOnly(chatId);
        return new Response('ok');
      }
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
        if (skill === 'full_mock') {
          await setMode(tgUserId, 'support');
          await sendFullMockPremiumOnly(chatId);
          return new Response('ok');
        }
        await setMode(tgUserId, `await_mock:${skill}`);
        const label = ({
          listening: '🎧 Listening',
          reading:   '📖 Reading',
          writing:   '✍️ Writing',
          speaking:  '🎤 Speaking'
        } as Record<string, string>)[skill] || skill;
        await send(chatId,
          `🔢 <b>${label} — pick a mock #</b>\n\n` +
          `Type the mock number you want to try (e.g. <b>1</b>, <b>5</b>, <b>12</b>).\n\n` +
          `Send <b>/cancel</b> to go back.`,
          { reply_markup: { remove_keyboard: true } });
        return new Response('ok');
      }
      await send(chatId, `Please tap one of the skill buttons below.`, { reply_markup: skillKeyboard() });
      return new Response('ok');
    }

    // Awaiting mock-number input (skill already chosen)
    if (mode.startsWith('await_mock:')) {
      if (/^\/cancel\b/i.test(text) || text === BTN.CANCEL) {
        await setMode(tgUserId, 'support');
        await send(chatId, `❌ Cancelled.`, { reply_markup: mainKeyboard() });
        return new Response('ok');
      }
      const skill = mode.slice('await_mock:'.length);
      const m     = text.match(/\d{1,3}/);
      const n     = m ? parseInt(m[0], 10) : NaN;
      if (!Number.isInteger(n) || n < 1 || n > 999) {
        await send(chatId,
          `⚠️ Please send a valid mock number between <b>1</b> and <b>999</b> (e.g. <b>3</b>).\n\n` +
          `Or send <b>/cancel</b> to go back.`);
        return new Response('ok');
      }
      await setMode(tgUserId, 'support');
      await issueCode(chatId, tgUserId, skill, n);
      return new Response('ok');
    }

    if (mode === 'dictionary') {
      await handleDictText(chatId, tgUserId, text);
      return new Response('ok');
    }

    if (mode === 'support') {
      // AI conversation — user opted in via the 🆘 Support button.
      await handleSupportText(chatId, tgUserId, text);
      return new Response('ok');
    }

    // Default: 'idle' — automated code-flow mode. Free text is NOT sent to the AI.
    // Gently nudge the user toward the buttons (or the explicit Support button).
    await send(chatId,
      `🎁 <b>Tap a skill button</b> below to get a free regular code instantly.\n\n` +
      `Need help with something else? Tap <b>🆘 Support</b> to start an AI conversation.`,
      { reply_markup: mainKeyboard() });
    return new Response('ok');
  } catch (e) {
    console.error('[support-bot] handler error:', e);
    return new Response('ok');
  }
});
