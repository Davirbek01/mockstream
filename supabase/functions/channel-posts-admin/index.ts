// channel-posts-admin
// -----------------------------------------------------------------------------
// Single admin endpoint for the news review queue + settings + topics.
// Verifies admin via admin_email lookup (works in either Google or email mode).
//
// Operations (op):
//   list           — list posts (optional filter by status)
//   update_text    — edit a pending post's text
//   reject         — mark post rejected
//   delete         — hard-delete a post row
//   publish        — send to Telegram, mark published
//   settings_get   — fetch the singleton settings row
//   settings_update — patch settings (also reschedules cron if cron_preset changed)
//   topics_list    — list all topics
//   topic_create   — add a new topic
//   topic_update   — edit a topic
//   topic_delete   — remove a topic
// -----------------------------------------------------------------------------

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
function jerr(status: number, code: string, detail?: string) {
  return new Response(JSON.stringify({ error: code, detail: detail ?? null }),
    { status, headers: { 'Content-Type': 'application/json', ...CORS } });
}
function jok(body: unknown) {
  return new Response(JSON.stringify(body),
    { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST')   return jerr(405, 'method_not_allowed');

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return jerr(400, 'bad_json'); }

  const op = typeof body.op === 'string' ? body.op : '';
  const adminEmailRaw = typeof body.admin_email === 'string' ? body.admin_email : '';
  const adminEmail = adminEmailRaw.toLowerCase().trim();

  if (!op) return jerr(400, 'missing_op');
  if (!adminEmail) return jerr(401, 'missing_admin_email');

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Verify admin (super-admin escape hatch matches the DB function)
  const isSuper = adminEmail === 'davirbekkhasanov02@gmail.com';
  if (!isSuper) {
    const { data: roleRows } = await supabase
      .from('premium_emails')
      .select('role, active')
      .eq('email', adminEmail)
      .eq('active', true)
      .eq('role', 'admin');
    if (!roleRows || roleRows.length === 0) return jerr(403, 'not_admin');
  }

  // ── POSTS: list ───────────────────────────────────────────────────
  if (op === 'list') {
    const status = typeof body.status === 'string' ? body.status : null;
    let q = supabase.from('channel_posts')
      .select('id, topic, text_content, image_url, status, created_at, scheduled_for, published_at, telegram_message_id, error_message')
      .order('created_at', { ascending: false })
      .limit(200);
    if (status) q = q.eq('status', status);
    const { data, error } = await q;
    if (error) return jerr(500, 'list_failed', error.message);
    const { data: countRows } = await supabase.from('channel_posts').select('status');
    const counts: Record<string, number> = { pending:0, published:0, rejected:0, failed:0, approved:0 };
    (countRows || []).forEach((r: any) => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return jok({ ok: true, rows: data || [], counts });
  }

  // ── POSTS: update_text ────────────────────────────────────────────
  if (op === 'update_text') {
    const postId = typeof body.post_id === 'string' ? body.post_id : '';
    const text = typeof body.text_content === 'string' ? body.text_content : '';
    if (!postId) return jerr(400, 'missing_post_id');
    const { error } = await supabase.from('channel_posts')
      .update({ text_content: text })
      .eq('id', postId);
    if (error) return jerr(500, 'update_failed', error.message);
    return jok({ ok: true });
  }

  // ── POSTS: reject ─────────────────────────────────────────────────
  if (op === 'reject') {
    const postId = typeof body.post_id === 'string' ? body.post_id : '';
    if (!postId) return jerr(400, 'missing_post_id');
    const { error } = await supabase.from('channel_posts')
      .update({ status: 'rejected', rejected_at: new Date().toISOString() })
      .eq('id', postId);
    if (error) return jerr(500, 'reject_failed', error.message);
    return jok({ ok: true });
  }

  // ── POSTS: delete ─────────────────────────────────────────────────
  if (op === 'delete') {
    const postId = typeof body.post_id === 'string' ? body.post_id : '';
    if (!postId) return jerr(400, 'missing_post_id');
    const { error } = await supabase.from('channel_posts').delete().eq('id', postId);
    if (error) return jerr(500, 'delete_failed', error.message);
    return jok({ ok: true });
  }

  // ── POSTS: publish ────────────────────────────────────────────────
  if (op === 'publish') {
    const postId = typeof body.post_id === 'string' ? body.post_id : '';
    if (!postId) return jerr(400, 'missing_post_id');

    // Read settings for channel_id + footer
    const { data: settings } = await supabase
      .from('channel_post_settings')
      .select('channel_id, footer_text')
      .eq('id', 1)
      .maybeSingle();
    const channelId = settings?.channel_id || '@mock_stream';
    const footerText = settings?.footer_text || '';

    const { data: post, error: fetchErr } = await supabase
      .from('channel_posts')
      .select('id, topic, text_content, image_url, status')
      .eq('id', postId)
      .maybeSingle();
    if (fetchErr || !post) return jerr(404, 'post_not_found', fetchErr?.message);
    if (post.status === 'published') return jerr(409, 'already_published');

    const botToken = Deno.env.get('TELEGRAM_NEWS_BOT_TOKEN');
    if (!botToken) return jerr(500, 'bot_token_unset');

    const captionOrText = (post.text_content || '') + footerText;
    const useImage = !!post.image_url && captionOrText.length <= 1024;

    const tgResp = useImage
      ? await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: channelId, photo: post.image_url, caption: captionOrText }),
        })
      : await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: channelId, text: captionOrText, disable_web_page_preview: true }),
        });

    const tgData = await tgResp.json();
    if (!tgResp.ok || !tgData.ok) {
      const errMsg = tgData?.description || `HTTP ${tgResp.status}`;
      await supabase.from('channel_posts')
        .update({ status: 'failed', error_message: errMsg })
        .eq('id', postId);
      return jerr(502, 'telegram_send_failed', errMsg);
    }

    const messageId = tgData?.result?.message_id;
    await supabase.from('channel_posts')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        telegram_message_id: messageId,
        approved_at: new Date().toISOString(),
        error_message: null,
      })
      .eq('id', postId);
    return jok({ ok: true, post_id: postId, telegram_message_id: messageId, used_image: useImage });
  }

  // ── SETTINGS: get ─────────────────────────────────────────────────
  if (op === 'settings_get') {
    const { data, error } = await supabase
      .from('channel_post_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (error) return jerr(500, 'settings_get_failed', error.message);
    return jok({ ok: true, settings: data });
  }

  // ── SETTINGS: update ──────────────────────────────────────────────
  if (op === 'settings_update') {
    const patch: Record<string, unknown> = {};
    if (typeof body.channel_id === 'string')  patch.channel_id  = body.channel_id;
    if (typeof body.footer_text === 'string') patch.footer_text = body.footer_text;
    if (typeof body.min_words === 'number')   patch.min_words   = Math.round(body.min_words);
    if (typeof body.max_words === 'number')   patch.max_words   = Math.round(body.max_words);
    if (typeof body.auto_publish === 'boolean') patch.auto_publish = body.auto_publish;
    if (typeof body.cron_preset === 'string') patch.cron_preset = body.cron_preset;
    // admin_chat_id may be null (clear), a number (set), or a digit-string (set)
    if (body.admin_chat_id !== undefined) {
      if (body.admin_chat_id === null) {
        patch.admin_chat_id = null;
      } else if (typeof body.admin_chat_id === 'number' && Number.isFinite(body.admin_chat_id)) {
        patch.admin_chat_id = Math.round(body.admin_chat_id);
      } else if (typeof body.admin_chat_id === 'string' && /^-?\d+$/.test(body.admin_chat_id.trim())) {
        patch.admin_chat_id = parseInt(body.admin_chat_id.trim(), 10);
      }
    }

    if (Object.keys(patch).length === 0) return jerr(400, 'no_fields_to_update');

    const { data: updated, error } = await supabase
      .from('channel_post_settings')
      .update(patch)
      .eq('id', 1)
      .select('*')
      .maybeSingle();
    if (error) return jerr(500, 'settings_update_failed', error.message);

    // If cron_preset changed, reschedule via the SQL helper
    let rescheduleMsg: string | null = null;
    if (typeof body.cron_preset === 'string') {
      const { data: rpcData, error: rpcErr } = await supabase.rpc('apply_channel_post_cron', { preset: body.cron_preset });
      if (rpcErr) return jerr(500, 'reschedule_failed', rpcErr.message);
      rescheduleMsg = rpcData as string;
    }

    return jok({ ok: true, settings: updated, reschedule: rescheduleMsg });
  }

  // ── TOPICS: list ──────────────────────────────────────────────────
  if (op === 'topics_list') {
    const { data, error } = await supabase
      .from('channel_topics')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) return jerr(500, 'topics_list_failed', error.message);
    return jok({ ok: true, topics: data || [] });
  }

  // ── TOPICS: create ────────────────────────────────────────────────
  if (op === 'topic_create') {
    const key          = typeof body.key === 'string' ? body.key.trim() : '';
    const label        = typeof body.label === 'string' ? body.label.trim() : '';
    const text_prompt  = typeof body.text_prompt === 'string' ? body.text_prompt : '';
    const image_prompt = typeof body.image_prompt === 'string' ? body.image_prompt : '';
    const enabled      = typeof body.enabled === 'boolean' ? body.enabled : true;
    if (!key || !/^[a-z][a-z0-9_]{2,40}$/.test(key)) return jerr(400, 'invalid_key', 'lowercase letters/digits/underscore, 3-41 chars, starting with letter');
    if (!label) return jerr(400, 'missing_label');
    if (!text_prompt) return jerr(400, 'missing_text_prompt');
    if (!image_prompt) return jerr(400, 'missing_image_prompt');

    const { data, error } = await supabase
      .from('channel_topics')
      .insert({ key, label, text_prompt, image_prompt, enabled })
      .select('*')
      .single();
    if (error) return jerr(error.code === '23505' ? 409 : 500, 'topic_create_failed', error.message);
    return jok({ ok: true, topic: data });
  }

  // ── TOPICS: update ────────────────────────────────────────────────
  if (op === 'topic_update') {
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) return jerr(400, 'missing_id');
    const patch: Record<string, unknown> = {};
    if (typeof body.label === 'string')        patch.label = body.label.trim();
    if (typeof body.text_prompt === 'string')  patch.text_prompt = body.text_prompt;
    if (typeof body.image_prompt === 'string') patch.image_prompt = body.image_prompt;
    if (typeof body.enabled === 'boolean')     patch.enabled = body.enabled;
    if (typeof body.sort_order === 'number')   patch.sort_order = Math.round(body.sort_order);
    if (Object.keys(patch).length === 0) return jerr(400, 'no_fields_to_update');

    const { data, error } = await supabase
      .from('channel_topics')
      .update(patch)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) return jerr(500, 'topic_update_failed', error.message);
    return jok({ ok: true, topic: data });
  }

  // ── TOPICS: delete ────────────────────────────────────────────────
  // ── BOT WEBHOOK: set / status ─────────────────────────────────────
  // setup_webhook: registers the news-bot-webhook URL with Telegram so
  //   @mockstream_news_bot starts pushing /start + callback_query updates
  //   to our Edge Function. One-time operation per environment.
  // webhook_status: read-only — fetches current webhook info from Telegram.
  if (op === 'setup_webhook' || op === 'webhook_status') {
    const botToken = Deno.env.get('TELEGRAM_NEWS_BOT_TOKEN');
    if (!botToken) return jerr(500, 'bot_token_unset');
    if (op === 'setup_webhook') {
      const url = `https://${Deno.env.get('SUPABASE_URL')!.split('://')[1]}/functions/v1/news-bot-webhook`;
      const r = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          allowed_updates: ['message', 'callback_query'],
          drop_pending_updates: true,
        }),
      }).then(r => r.json());
      if (!r.ok) return jerr(502, 'set_webhook_failed', r.description || 'Telegram refused setWebhook');
      return jok({ ok: true, webhook_url: url, telegram: r });
    } else {
      const r = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`).then(r => r.json());
      return jok({ ok: true, webhook_info: r.result || null });
    }
  }

  if (op === 'topic_delete') {
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) return jerr(400, 'missing_id');
    const { error } = await supabase.from('channel_topics').delete().eq('id', id);
    if (error) return jerr(500, 'topic_delete_failed', error.message);
    return jok({ ok: true });
  }

  return jerr(400, 'unknown_op', op);
});
