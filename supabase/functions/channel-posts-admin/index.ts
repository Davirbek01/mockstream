// channel-posts-admin
// -----------------------------------------------------------------------------
// Single admin endpoint for the news review queue. Handles list/update/publish/
// reject/delete with server-side admin verification (no JWT required, since the
// Results Dashboard supports both Google sign-in AND email-only admin mode).
//
// Auth: caller MUST pass admin_email in the body. We look it up in
// premium_emails server-side via service-role to confirm it's an active admin.
// This matches the trust model of the existing email-mode dashboard auth.
//
// Required Edge Function secrets:
//   TELEGRAM_NEWS_BOT_TOKEN     (for op='publish')
//   SUPABASE_URL                (auto-injected)
//   SUPABASE_SERVICE_ROLE_KEY   (auto-injected)
// -----------------------------------------------------------------------------

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CHANNEL_ID = '@mock_stream';
// Plain-text footer (no parse_mode = no escaping needed). Telegram still
// renders the URLs as clickable links and the emojis as emojis.
const FOOTER = `\n\n━━━━━━━━━━━━━\n🌐 mock-stream.com\n📺 youtube.com/@Mock-Stream\n💬 @DavirbekKhasanov\n📧 davirbekkhasanov@gmail.com`;

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

  // Verify the email is an active admin (super-admin escape hatch matches the DB function).
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

  // ── op: list ──────────────────────────────────────────────────────
  if (op === 'list') {
    const status = typeof body.status === 'string' ? body.status : null;
    let q = supabase.from('channel_posts')
      .select('id, topic, text_content, image_url, status, created_at, scheduled_for, published_at, telegram_message_id, error_message')
      .order('created_at', { ascending: false })
      .limit(200);
    if (status) q = q.eq('status', status);
    const { data, error } = await q;
    if (error) return jerr(500, 'list_failed', error.message);
    // Per-status counts (so the UI can populate filter badges in one round trip)
    const { data: countRows } = await supabase
      .from('channel_posts')
      .select('status');
    const counts: Record<string, number> = { pending:0, published:0, rejected:0, failed:0, approved:0 };
    (countRows || []).forEach((r: any) => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return jok({ ok: true, rows: data || [], counts });
  }

  // ── op: update_text ───────────────────────────────────────────────
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

  // ── op: reject ────────────────────────────────────────────────────
  if (op === 'reject') {
    const postId = typeof body.post_id === 'string' ? body.post_id : '';
    if (!postId) return jerr(400, 'missing_post_id');
    const { error } = await supabase.from('channel_posts')
      .update({ status: 'rejected', rejected_at: new Date().toISOString() })
      .eq('id', postId);
    if (error) return jerr(500, 'reject_failed', error.message);
    return jok({ ok: true });
  }

  // ── op: delete ────────────────────────────────────────────────────
  if (op === 'delete') {
    const postId = typeof body.post_id === 'string' ? body.post_id : '';
    if (!postId) return jerr(400, 'missing_post_id');
    const { error } = await supabase.from('channel_posts')
      .delete()
      .eq('id', postId);
    if (error) return jerr(500, 'delete_failed', error.message);
    return jok({ ok: true });
  }

  // ── op: publish ───────────────────────────────────────────────────
  if (op === 'publish') {
    const postId = typeof body.post_id === 'string' ? body.post_id : '';
    if (!postId) return jerr(400, 'missing_post_id');

    // Optional: caller may have edited text in-place and wants us to publish
    // the latest. They should call update_text first; we re-fetch from DB here
    // to be sure we publish what's persisted.
    const { data: post, error: fetchErr } = await supabase
      .from('channel_posts')
      .select('id, topic, text_content, image_url, status')
      .eq('id', postId)
      .maybeSingle();
    if (fetchErr || !post) return jerr(404, 'post_not_found', fetchErr?.message);
    if (post.status === 'published') return jerr(409, 'already_published');

    const botToken = Deno.env.get('TELEGRAM_NEWS_BOT_TOKEN');
    if (!botToken) return jerr(500, 'bot_token_unset');

    const captionOrText = (post.text_content || '') + FOOTER;
    const useImage = !!post.image_url && captionOrText.length <= 1024;

    let tgResp: Response;
    if (useImage) {
      tgResp = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHANNEL_ID,
          photo: post.image_url,
          caption: captionOrText,
          // No parse_mode — plain text. Avoids Telegram's strict MarkdownV2
          // escaping rules that Gemini gets wrong intermittently.
        }),
      });
    } else {
      tgResp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHANNEL_ID,
          text: captionOrText,
          // No parse_mode — plain text. Avoids Telegram's strict MarkdownV2
          // escaping rules that Gemini gets wrong intermittently.
          disable_web_page_preview: true,
        }),
      });
    }

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
        // approved_by stays null in email-mode — we have the email but not the auth.users uuid
        error_message: null,
      })
      .eq('id', postId);

    return jok({ ok: true, post_id: postId, telegram_message_id: messageId, used_image: useImage });
  }

  return jerr(400, 'unknown_op', op);
});
