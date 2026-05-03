// publish-channel-post
// -----------------------------------------------------------------------------
// Called when admin clicks Approve in the review UI. Fetches the post,
// posts it to t.me/mock_stream via @mockstream_news_bot's sendPhoto/sendMessage,
// updates status to 'published' (or 'failed' on error).
//
// Required Edge Function secrets:
//   TELEGRAM_NEWS_BOT_TOKEN     (set via dashboard)
//   SUPABASE_URL                (auto-injected)
//   SUPABASE_SERVICE_ROLE_KEY   (auto-injected)
//
// verify_jwt: true — only authenticated admin users can call this.
// Auth check: caller's email must have an active premium_emails row with role='admin'.
// -----------------------------------------------------------------------------

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CHANNEL_ID = '@mock_stream'; // t.me/mock_stream
const FOOTER = `\n\n━━━━━━━━━━━━━\n🌐 mock\\-stream\\.com\n📺 youtube\\.com/@Mock\\-Stream\n💬 @DavirbekKhasanov\n📧 davirbekkhasanov@gmail\\.com`;

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

// MarkdownV2 reserved chars need escaping when inserted as literal text.
// We don't escape the user's content (it should already be MarkdownV2 from
// Gemini per the prompt), but we DO escape the footer (which is literal text
// with dots/dashes/parens that would otherwise break parsing).
//
// (The footer above is already pre-escaped — backslashes in the string literal.)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST')   return jerr(405, 'method_not_allowed');

  // Caller must be authenticated. We verify the JWT and check admin role.
  const authHeader = req.headers.get('Authorization') || '';
  const jwt = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!jwt) return jerr(401, 'no_jwt');

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Validate JWT and pull email
  const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
  if (userErr || !userData?.user?.email) return jerr(401, 'invalid_jwt');
  const email = userData.user.email.toLowerCase();

  // Check admin role
  const { data: roleRows } = await supabase
    .from('premium_emails')
    .select('role, active')
    .eq('email', email)
    .eq('active', true)
    .eq('role', 'admin');
  // Hard-coded super-admin escape hatch (matches _caller_is_admin())
  const isSuper = email === 'davirbekkhasanov02@gmail.com';
  const isAdmin = isSuper || (roleRows && roleRows.length > 0);
  if (!isAdmin) return jerr(403, 'not_admin');

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return jerr(400, 'bad_json'); }
  const postId = typeof body.post_id === 'string' ? body.post_id : '';
  if (!postId) return jerr(400, 'missing_post_id');

  // Fetch the post (use service-role; bypasses RLS so we can read regardless
  // of the caller's RLS-allowed view — admin already verified above)
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

  // Telegram limits: photo caption max 1024 chars; text message max 4096.
  // If with footer the photo caption would exceed 1024, we send as a text
  // message instead (keeping the AI text intact). Image is sacrificed for
  // text in that case.
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
        parse_mode: 'MarkdownV2',
      }),
    });
  } else {
    tgResp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHANNEL_ID,
        text: captionOrText,
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true,
      }),
    });
  }

  const tgData = await tgResp.json();

  if (!tgResp.ok || !tgData.ok) {
    // Mark as failed; admin can retry by editing the text and re-approving.
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
      approved_by: userData.user.id,
      error_message: null,
    })
    .eq('id', postId);

  return jok({
    ok: true,
    post_id: postId,
    telegram_message_id: messageId,
    used_image: useImage,
  });
});
