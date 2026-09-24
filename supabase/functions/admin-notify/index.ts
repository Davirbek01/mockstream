// =====================================================================
// Supabase Edge Function: admin-notify
// ---------------------------------------------------------------------
// One line of text, delivered to the same Telegram chat the 08:00 health
// report goes to. That report is written by a function, so it can reach the
// phone on its own; anything watched from a laptop (Gmail, for one — no
// server here can read it) had no way to do the same, and an alarm nobody
// sees on the right day is not an alarm.
//
// Request:  POST { "text": "…", "silent"?: true }
// Response: { ok: bool, chat_id?: number, error?: string }
//
// Auth: the gateway's own JWT check. Call it with the service-role key —
// that is why this one is NOT deployed with --no-verify-jwt: nothing in the
// browser should be able to push a message to the owner's phone.
//
// Deploy:
//   supabase functions deploy admin-notify
// =====================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const BOT_TOKEN        = Deno.env.get('TELEGRAM_NEWS_BOT_TOKEN') || '';

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}

/** Telegram rejects the whole message over 4096 characters — trim, don't lose it. */
function clamp(s: string) {
  return s.length <= 4000 ? s : s.slice(0, 3990) + '\n…';
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json(405, { ok: false, error: 'POST only' });
  if (!BOT_TOKEN) return json(500, { ok: false, error: 'TELEGRAM_NEWS_BOT_TOKEN not set' });

  let body: any = {};
  try { body = await req.json(); } catch { /* empty body is just a missing text */ }
  const text = String(body?.text || '').trim();
  if (!text) return json(400, { ok: false, error: 'text is required' });

  const { data: cfg } = await sb
    .from('channel_post_settings')
    .select('admin_chat_id')
    .limit(1)
    .maybeSingle();
  const chatId = cfg?.admin_chat_id;
  if (!chatId) return json(500, { ok: false, error: 'no admin_chat_id in channel_post_settings' });

  const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: clamp(text),
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      disable_notification: body?.silent === true,
    }),
  });
  if (!r.ok) return json(502, { ok: false, error: (await r.text()).slice(0, 300) });
  return json(200, { ok: true, chat_id: chatId });
});
