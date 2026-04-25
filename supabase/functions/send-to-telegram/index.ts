// =====================================================================
// Supabase Edge Function: send-to-telegram
// ---------------------------------------------------------------------
// Replaces the alwaysdata routing backend (u-se-r.alwaysdata.net) for
// Mock Stream + clones. Looks up per-center channel mapping from
// site_settings, then calls Telegram Bot API directly.
//
// Channel mapping is stored as:
//   key   = 'center_telegram_channels_<centerId>'
//   value = { reading, listening, writing, speaking, full_mock,
//             plus_listening?, plus_reading?, plus_speaking?, plus_writing? }
// where each value is either a numeric chat_id ("-1001234567890")
// or a public username ("@channelname").
//
// Request: multipart/form-data POST, fields:
//   testIdentifier  — center id (e.g. "mockstream", "achievers")
//   skill           — one of: reading | listening | writing | speaking |
//                     full-mock | full_mock | plus-listening | ...
//   caption         — string (optional)
//   text            — plain message (optional, used if no file)
//   file            — Blob (optional; sent via sendDocument)
//
// Response: JSON  { ok: bool, routedTo?: { chat_id, title? }, error? }
//
// Secrets:
//   TELEGRAM_BOT_TOKEN  — single bot token used for all centers
//
// Deploy:
//   supabase functions deploy send-to-telegram --no-verify-jwt
// =====================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL          = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TELEGRAM_BOT_TOKEN    = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age':       '86400',
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}

// Normalize incoming skill names to the keys we store in site_settings.
function normalizeSkill(raw: string): string {
  const s = (raw || '').toLowerCase().trim().replace(/-/g, '_');
  // Common aliases
  if (s === 'fullmock') return 'full_mock';
  return s;
}

// Center-id translation: client may send "mock_stream" (testIdentifier),
// but channel rows are keyed by the storage id. Translate the special
// mock_stream → mockstream case for consistency with admin convention.
function normalizeCenterId(raw: string): string {
  const c = (raw || '').toLowerCase().trim();
  if (c === 'mock_stream') return 'mockstream';
  return c;
}

async function loadChannels(centerId: string): Promise<Record<string, string> | null> {
  const key = 'center_telegram_channels_' + centerId;
  const { data, error } = await sb
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (error) {
    console.error('[send-to-telegram] DB error:', error.message);
    return null;
  }
  if (!data || !data.value) return null;
  // value can be a JSON object or a stringified JSON; handle both.
  let v: unknown = data.value;
  if (typeof v === 'string') {
    try { v = JSON.parse(v); } catch { return null; }
  }
  if (!v || typeof v !== 'object') return null;
  return v as Record<string, string>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (req.method !== 'POST') {
    return json(405, { ok: false, error: 'method_not_allowed' });
  }
  if (!TELEGRAM_BOT_TOKEN) {
    return json(500, { ok: false, error: 'TELEGRAM_BOT_TOKEN not configured' });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch (e) {
    return json(400, { ok: false, error: 'invalid_form_data: ' + (e as Error).message });
  }

  const centerIdRaw = String(form.get('testIdentifier') || '').trim();
  const skillRaw    = String(form.get('skill') || '').trim();
  const caption     = String(form.get('caption') || '');
  const text        = String(form.get('text') || '');
  const file        = form.get('file');

  if (!centerIdRaw) return json(400, { ok: false, error: 'missing_testIdentifier' });
  if (!skillRaw)    return json(400, { ok: false, error: 'missing_skill' });

  const centerId = normalizeCenterId(centerIdRaw);
  const skill    = normalizeSkill(skillRaw);

  const channels = await loadChannels(centerId);
  if (!channels) {
    return json(404, {
      ok: false,
      error: 'no_channel_mapping_for_center',
      centerId,
      hint: 'Add row in site_settings with key=center_telegram_channels_' + centerId
    });
  }

  const chatId = channels[skill];
  if (!chatId) {
    return json(404, {
      ok: false,
      error: 'no_channel_for_skill',
      centerId,
      skill,
      availableSkills: Object.keys(channels)
    });
  }

  // Build Telegram API call. Use sendDocument for files, sendMessage for text.
  const apiBase = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN;

  // Auto-fanout: also send to the "general" mixed-centers channels (super-admin
  // oversight). Skip for the general center itself to avoid loops, and skip if
  // no general row is configured.
  const fanoutTargets: { chatId: string; tag: string }[] = [{ chatId, tag: centerId }];
  if (centerId !== 'general') {
    const generalChannels = await loadChannels('general');
    const generalChatId = generalChannels && generalChannels[skill];
    if (generalChatId && generalChatId !== chatId) {
      fanoutTargets.push({ chatId: generalChatId, tag: 'general' });
    }
  }

  // Read the file body ONCE into memory so we can re-send it to multiple
  // channels (Request body streams can't be replayed).
  let fileBytes: Uint8Array | null = null;
  let fileName  = 'file';
  let fileType  = 'application/octet-stream';
  if (file && file instanceof File) {
    fileBytes = new Uint8Array(await file.arrayBuffer());
    fileName  = file.name || 'file';
    fileType  = file.type || 'application/octet-stream';
  }

  const results: Array<Record<string, unknown>> = [];
  let primaryOk = false;
  let primaryError: Record<string, unknown> | null = null;

  for (const target of fanoutTargets) {
    try {
      let tgResp: Response;
      if (fileBytes) {
        const tgForm = new FormData();
        tgForm.append('chat_id', target.chatId);
        if (caption) tgForm.append('caption', caption);
        tgForm.append('document', new Blob([fileBytes], { type: fileType }), fileName);
        tgResp = await fetch(apiBase + '/sendDocument', { method: 'POST', body: tgForm });
      } else {
        const body = caption || text;
        if (!body) {
          results.push({ target: target.tag, ok: false, error: 'no_file_no_text' });
          continue;
        }
        tgResp = await fetch(apiBase + '/sendMessage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: target.chatId, text: body, disable_web_page_preview: true })
        });
      }
      const tgJson = await tgResp.json().catch(() => ({}));
      if (!tgResp.ok || !tgJson.ok) {
        const err = { target: target.tag, ok: false, status: tgResp.status, telegram: tgJson };
        results.push(err);
        if (target.tag === centerId) primaryError = err;
      } else {
        results.push({
          target: target.tag,
          ok: true,
          chat_id: target.chatId,
          title: tgJson.result?.chat?.title,
          message_id: tgJson.result?.message_id
        });
        if (target.tag === centerId) primaryOk = true;
      }
    } catch (e) {
      const err = { target: target.tag, ok: false, error: 'fetch_failed: ' + (e as Error).message };
      results.push(err);
      if (target.tag === centerId) primaryError = err;
    }
  }

  if (!primaryOk) {
    return json(502, { ok: false, error: 'telegram_api_error', primary: primaryError, results });
  }

  // Find primary result for backward-compat shape (routedTo, message_id)
  const primary = results.find(r => r.target === centerId) as Record<string, unknown> | undefined;
  return json(200, {
    ok: true,
    routedTo: { chat_id: primary?.chat_id, title: primary?.title },
    message_id: primary?.message_id,
    results
  });
});
