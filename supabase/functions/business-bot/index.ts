// ============================================================================
// Supabase Edge Function: business-bot
// ----------------------------------------------------------------------------
// A bot attached to a PERSONAL Telegram account through Telegram Business
// (Settings → Telegram Business → Chat Automation). Telegram forwards that
// account's incoming messages here as `business_message`, and a reply sent with
// the same `business_connection_id` leaves as the ACCOUNT's own message - the
// student sees the teacher, not a bot.
//
// What it does for students, and nothing else: someone writes the code (65 by
// default) to the account, and the account answers with one file plus a line of
// text.
//
// ⚠️ It sees every message that account receives, so silence is the default:
// anything that is not exactly the code is ignored. A bot that chatted back
// would be talking over the teacher's real conversations.
//
// The teacher owns the settings. Writing to the BOT ITSELF (a normal private
// chat with @…bot) opens a small menu - Matn / Fayl / Kod - so the file, the
// caption and the trigger can be changed without touching this code. Only the
// account that connected the bot may do that: the owner's id arrives with the
// `business_connection` update and is stored alongside the settings.
//
// Everything lives in ONE `site_settings` row (`business_bot_config`):
//   { code, caption, file_id, file_name, owner_id, connection_id, pending }
// The env vars below are only the first-run defaults.
//
// Secrets (supabase secrets set …):
//   BUSINESS_BOT_TOKEN   the bot's token from BotFather (Secretary/Business
//                        Mode must be ON, or Telegram refuses the connection)
//   BUSINESS_BOT_PDF     https url of the file to send until one is uploaded
//   BUSINESS_BOT_CODE    the first trigger, default "65"
//   BUSINESS_BOT_CAPTION the line sent with the file
//   BUSINESS_BOT_SECRET  optional; Telegram must echo it in the
//                        X-Telegram-Bot-Api-Secret-Token header
//
// Deploy: supabase functions deploy business-bot --no-verify-jwt
// Webhook: setWebhook url=<function url> secret_token=<BUSINESS_BOT_SECRET>
//          allowed_updates=["business_connection","business_message","message"]
// ============================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TOKEN = Deno.env.get('BUSINESS_BOT_TOKEN') ?? '';
const DEFAULT_PDF = Deno.env.get('BUSINESS_BOT_PDF') ?? '';
const DEFAULT_CODE = (Deno.env.get('BUSINESS_BOT_CODE') ?? '65').trim();
const DEFAULT_CAPTION = Deno.env.get('BUSINESS_BOT_CAPTION') ?? '';
const SECRET = Deno.env.get('BUSINESS_BOT_SECRET') ?? '';
const API = `https://api.telegram.org/bot${TOKEN}`;

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const KEY = 'business_bot_config';

/** Telegram retries anything that is not a 200, so we always answer 200 - a
 *  reply we could not send is not worth a retry storm against a teacher's
 *  personal chat. */
const ok = () => new Response('ok', { status: 200 });

interface Config {
  code: string;
  caption: string;
  /** Telegram describes bold/italic/links/spoilers/custom emoji as entities.
   *  Keeping them verbatim means the teacher's text arrives looking exactly as
   *  it was typed - no parse_mode, nothing to escape. */
  caption_entities?: Record<string, unknown>[];
  /** Telegram's own id for the uploaded file - instant, no bandwidth. */
  file_id?: string;
  file_name?: string;
  /** Fallback while nothing has been uploaded through the menu. */
  file_url?: string;
  owner_id?: number;
  connection_id?: string;
  /** Which answer the menu is waiting for from the owner. */
  pending?: 'text' | 'file' | 'code' | null;
}

async function loadConfig(): Promise<Config> {
  const base: Config = { code: DEFAULT_CODE, caption: DEFAULT_CAPTION, file_url: DEFAULT_PDF, pending: null };
  try {
    const { data } = await sb.from('site_settings').select('value').eq('key', KEY).limit(1);
    const raw = data?.[0]?.value;
    const v = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (v && typeof v === 'object') return { ...base, ...v };
  } catch { /* first run: defaults */ }
  return base;
}

async function saveConfig(next: Config): Promise<void> {
  try {
    // `site_settings.value` is a TEXT column (every other row in it is stored
    // the same way), so the settings travel as JSON text, not as jsonb.
    const { error } = await sb
      .from('site_settings')
      .upsert({ key: KEY, value: JSON.stringify(next) }, { onConflict: 'key' });
    if (error) console.error('[business-bot] could not save config:', error.message);
  } catch (e) {
    console.error('[business-bot] could not save config:', (e as Error)?.message);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** One Telegram call, with Telegram's own back-off honoured.
 *
 *  A bot may send roughly 30 messages a second. When a teacher posts "write 5
 *  for the PDF" to 80k followers, the answers arrive in a burst and Telegram
 *  starts refusing with 429 + `retry_after`. Giving up there would quietly
 *  leave students with nothing, so we wait exactly as long as Telegram asks
 *  and try again (twice at most - the webhook must still answer promptly).
 *  Server-side 5xx gets the same treatment on a short fixed delay. */
async function call(method: string, body: Record<string, unknown>, attempt = 1): Promise<Record<string, any>> {
  try {
    const r = await fetch(`${API}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    if (!j?.ok && attempt <= 3) {
      const wait = j?.parameters?.retry_after;
      if (r.status === 429 && typeof wait === 'number') {
        console.warn(`[business-bot] ${method} rate limited, waiting ${wait}s (try ${attempt})`);
        await sleep(Math.min(wait, 25) * 1000 + 250);
        return call(method, body, attempt + 1);
      }
      if (r.status >= 500) {
        await sleep(attempt * 800);
        return call(method, body, attempt + 1);
      }
    }
    return j;
  } catch (e) {
    // A dropped connection is worth one more go; a student's file should not
    // be lost to a blip.
    if (attempt <= 2) {
      await sleep(attempt * 800);
      return call(method, body, attempt + 1);
    }
    console.error(`[business-bot] ${method} failed:`, (e as Error)?.message);
    return { ok: false };
  }
}

// ── what a student gets ─────────────────────────────────────────────────────

async function sendMaterial(cfg: Config, connectionId: string, chatId: number | string): Promise<void> {
  const document = cfg.file_id || cfg.file_url;
  if (!document) {
    console.error('[business-bot] nothing to send: no file configured');
    return;
  }
  const body: Record<string, unknown> = { business_connection_id: connectionId, chat_id: chatId, document };
  // A caption tops out at 1024 characters; a longer note follows as its own
  // message rather than being cut in half.
  const longText = cfg.caption.length > 1024;
  if (cfg.caption && !longText) {
    body.caption = cfg.caption;
    if (cfg.caption_entities?.length) body.caption_entities = cfg.caption_entities;
  }

  let j = await call('sendDocument', body);
  // Telegram refuses entities it will not let this bot use (a custom emoji,
  // say). The text still matters more than its styling, so try again plain.
  if (!j?.ok && body.caption_entities) {
    delete body.caption_entities;
    j = await call('sendDocument', body);
  }
  // A stored file_id can go stale; fall back to the url once.
  if (!j?.ok && cfg.file_id && cfg.file_url) {
    body.document = cfg.file_url;
    j = await call('sendDocument', body);
  }
  if (!j?.ok) {
    console.error('[business-bot] sendDocument failed:', JSON.stringify(j).slice(0, 300));
    return;
  }
  if (longText) {
    const note: Record<string, unknown> = { business_connection_id: connectionId, chat_id: chatId, text: cfg.caption };
    if (cfg.caption_entities?.length) note.entities = cfg.caption_entities;
    let n = await call('sendMessage', note);
    if (!n?.ok && note.entities) { delete note.entities; n = await call('sendMessage', note); }
  }

  const fileId = j?.result?.document?.file_id;
  if (fileId && fileId !== cfg.file_id) await saveConfig({ ...cfg, file_id: fileId, pending: cfg.pending ?? null });
}

// ── the teacher's menu, in the bot's own chat ───────────────────────────────

// A keyboard that STAYS under the input box, the way the other Mock Stream
// bots work: the teacher should not have to scroll back to an old message to
// find the buttons.
const BTN_TEXT = '✏️ Matn';
const BTN_FILE = '📎 Fayl';
const BTN_CODE = '🔢 Kod';
const BTN_STATUS = 'ℹ️ Holat';

const MENU = {
  keyboard: [
    [{ text: BTN_TEXT }, { text: BTN_FILE }],
    [{ text: BTN_CODE }, { text: BTN_STATUS }],
  ],
  resize_keyboard: true,
  is_persistent: true,
  input_field_placeholder: 'Tugmani tanlang',
};

function statusText(cfg: Config): string {
  const file = cfg.file_name || (cfg.file_url ? cfg.file_url.split('/').pop() : '—');
  return [
    'Sozlamalar',
    '',
    `🔢 Kod: ${cfg.code || '—'}`,
    `📎 Fayl: ${file}`,
    cfg.caption_entities?.length ? '✏️ Matn: (quyida)' : `✏️ Matn: ${cfg.caption || '—'}`,
    '',
    'O‘zgartirish uchun tugmani bosing.',
  ].join('\n');
}

async function showMenu(chatId: number, cfg: Config): Promise<void> {
  await call('sendMessage', { chat_id: chatId, text: statusText(cfg), reply_markup: MENU });
  // Shown separately, with its own formatting, so the teacher sees exactly what
  // a student will get rather than a flattened copy.
  if (cfg.caption && cfg.caption_entities?.length) {
    const preview: Record<string, unknown> = { chat_id: chatId, text: cfg.caption, entities: cfg.caption_entities };
    let p = await call('sendMessage', preview);
    if (!p?.ok) { delete preview.entities; await call('sendMessage', preview); }
  }
}

/** A normal message to the bot itself. Only the owner of the connected account
 *  gets the menu; anyone else is ignored, so a student who stumbles onto the
 *  bot cannot change what it sends. */
async function handleOwnerMessage(msg: Record<string, any>, cfg: Config): Promise<void> {
  const chatId = msg.chat?.id;
  const text = String(msg.text ?? '').trim();

  // A button press arrives as its own label, so it is read BEFORE any pending
  // question - otherwise tapping "Matn" while the bot waits for text would
  // save the word "Matn" as the caption.
  const ASK: Record<string, [Exclude<Config['pending'], null | undefined>, string]> = {
    [BTN_TEXT]: ['text', 'Yangi matnni yuboring (fayl bilan birga ketadi). Formatlash saqlanadi.'],
    [BTN_FILE]: ['file', 'Yangi faylni hujjat sifatida yuboring.'],
    [BTN_CODE]: ['code', 'Yangi kodni yuboring (masalan 45).'],
  };
  if (ASK[text]) {
    const [pending, prompt] = ASK[text];
    await saveConfig({ ...cfg, pending });
    await call('sendMessage', { chat_id: chatId, text: prompt, reply_markup: MENU });
    return;
  }
  if (text === BTN_STATUS || text === '/start' || text === '/help') {
    if (cfg.pending) await saveConfig({ ...cfg, pending: null });
    await showMenu(chatId, { ...cfg, pending: null });
    return;
  }

  if (cfg.pending === 'text' && text) {
    // Whatever the teacher typed, styled the way they typed it.
    const next: Config = { ...cfg, caption: text, caption_entities: msg.entities ?? [], pending: null };
    await saveConfig(next);
    await call('sendMessage', { chat_id: chatId, text: '✅ Matn yangilandi.' });
    await showMenu(chatId, next);
    return;
  }

  if (cfg.pending === 'code' && text) {
    const code = text.replace(/\s+/g, '');
    await saveConfig({ ...cfg, code, pending: null });
    await call('sendMessage', { chat_id: chatId, text: `✅ Kod yangilandi: ${code}` });
    await showMenu(chatId, { ...cfg, code, pending: null });
    return;
  }

  if (cfg.pending === 'file') {
    const doc = msg.document;
    if (!doc?.file_id) {
      await call('sendMessage', { chat_id: chatId, text: 'Fayl (hujjat) yuboring — rasm yoki matn emas.' });
      return;
    }
    // A new file: the stored url no longer describes it, so it is dropped and
    // the file_id becomes the only source.
    const next: Config = {
      ...cfg,
      file_id: doc.file_id,
      file_name: doc.file_name || 'fayl',
      file_url: undefined,
      pending: null,
    };
    await saveConfig(next);
    await call('sendMessage', { chat_id: chatId, text: `✅ Fayl yangilandi: ${next.file_name}` });
    await showMenu(chatId, next);
    return;
  }

  // No question pending: show where things stand.
  await showMenu(chatId, cfg);
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return ok();
  if (SECRET && req.headers.get('x-telegram-bot-api-secret-token') !== SECRET) {
    console.warn('[business-bot] rejected: wrong secret token');
    return ok();
  }
  if (!TOKEN) {
    console.error('[business-bot] not configured (token missing)');
    return ok();
  }

  let update: Record<string, any> = {};
  try { update = await req.json(); } catch { return ok(); }
  const cfg = await loadConfig();

  // ── the teacher connected, edited or removed the bot ──────────────────────
  if (update.business_connection) {
    const c = update.business_connection;
    const enabled = c.is_enabled ?? true;
    console.log('[business-bot] connection', c.id, 'owner', c.user?.id, 'enabled:', enabled);
    await saveConfig({ ...cfg, owner_id: c.user?.id ?? cfg.owner_id, connection_id: c.id });
    return ok();
  }

  // ── the teacher writing to the bot itself: the settings menu ──────────────
  if (update.callback_query) {
    const q = update.callback_query;
    const from = q.from?.id;
    if (!cfg.owner_id || from !== cfg.owner_id) {
      await call('answerCallbackQuery', { callback_query_id: q.id });
      return ok();
    }
    const ask: Record<string, [Config['pending'], string]> = {
      set_text: ['text', 'Yangi matnni yuboring (fayl bilan birga ketadi).'],
      set_file: ['file', 'Yangi faylni hujjat sifatida yuboring.'],
      set_code: ['code', 'Yangi kodni yuboring (masalan 45).'],
    };
    const chosen = ask[String(q.data)];
    if (chosen) {
      await saveConfig({ ...cfg, pending: chosen[0] });
      await call('sendMessage', { chat_id: q.message?.chat?.id, text: chosen[1] });
    }
    await call('answerCallbackQuery', { callback_query_id: q.id });
    return ok();
  }

  if (update.message && update.message.chat?.type === 'private') {
    const from = update.message.from?.id;
    if (cfg.owner_id && from === cfg.owner_id) {
      await handleOwnerMessage(update.message, cfg);
    } else if (!cfg.owner_id) {
      // Nobody has connected the bot yet, so there is no owner to trust.
      console.log('[business-bot] message before any business connection, from', from);
    }
    return ok();
  }

  // ── a student writing to the teacher's account ────────────────────────────
  const msg = update.business_message;
  if (!msg || !msg.business_connection_id) return ok();
  // The account's OWN outgoing messages arrive here too. In a private chat an
  // incoming message has from.id === chat.id (the person writing); anything
  // else is the teacher typing, and answering that would be absurd.
  if (!msg.from?.id || !msg.chat?.id || msg.from.id !== msg.chat.id) return ok();

  const text = String(msg.text ?? '').trim();
  if (!cfg.code || text !== cfg.code) return ok();   // silence for everything else

  await sendMaterial(cfg, String(msg.business_connection_id), msg.chat.id);
  return ok();
});
