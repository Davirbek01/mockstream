// news-bot-webhook
// -----------------------------------------------------------------------------
// Telegram webhook for @mockstream_news_bot. Handles two things:
//
//  1. /start in DM — replies with the user's chat_id and instructions to paste
//     it into the News Settings panel on the dashboard. No persistence here;
//     admin manually copies the id (so a random user who finds the bot
//     can't take over admin notifications).
//
//  2. callback_query (Approve / Reject button taps) — verifies the from.id
//     matches the saved admin_chat_id, executes the action (publish or reject),
//     edits the original draft message to remove the buttons + show status.
//
// Telegram pushes EVERY update for the bot to this URL. Anything we don't
// recognize is silently ack'd with a 200 (Telegram's webhook contract).
//
// To register the webhook (one-time setup):
//   curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
//     -d "url=https://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/news-bot-webhook"
//
// verify_jwt: false (Telegram doesn't carry a Supabase JWT). We accept any
// POST that looks like a valid Telegram update; access control happens by
// matching from.id against settings.admin_chat_id.
// -----------------------------------------------------------------------------

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const FOOTER_FALLBACK = '\n\n━━━━━━━━━━━━━\n🌐 mock-stream.com\n📺 youtube.com/@Mock-Stream\n💬 @DavirbekKhasanov\n📧 davirbekkhasanov@gmail.com';

// Telegram requires us to ack the webhook fast or it retries. We always
// return 200 with empty body unless we want to short-reply.
const ACK = new Response('', { status: 200 });

async function tg(method: string, body: unknown, botToken: string) {
  const r = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return r.json();
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return ACK;

  let update: any;
  try { update = await req.json(); } catch { return ACK; }

  const botToken = Deno.env.get('TELEGRAM_NEWS_BOT_TOKEN');
  if (!botToken) {
    console.error('[news-bot-webhook] TELEGRAM_NEWS_BOT_TOKEN missing');
    return ACK;
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // ── 1. /start in DM ───────────────────────────────────────────────
  const msg = update.message;
  if (msg && typeof msg.text === 'string' && msg.text.trim().toLowerCase().startsWith('/start') && msg.chat?.type === 'private') {
    const chatId = msg.chat.id;
    const firstName = msg.from?.first_name || '';
    await tg('sendMessage', {
      chat_id: chatId,
      text:
        `👋 Hello ${firstName}!\n\n` +
        `This is the Mock Stream News bot. I post AI-generated educational content to t.me/mock_stream.\n\n` +
        `🆔 Your Telegram chat ID is:\n\`${chatId}\`\n\n` +
        `If you're an admin and want to receive each new draft here for one-tap Approve/Reject:\n` +
        `1. Copy the number above.\n` +
        `2. Open the Mock Stream Results Dashboard → 📰 News → ⚙️ Settings.\n` +
        `3. Paste it into "Admin Telegram chat ID" → Save.\n\n` +
        `From then on, every new draft will land here.`,
      parse_mode: 'Markdown',
    }, botToken);
    return ACK;
  }

  // ── 2. callback_query (button tap) ────────────────────────────────
  const cq = update.callback_query;
  if (cq && typeof cq.data === 'string') {
    const fromId = cq.from?.id;
    const data = cq.data;
    const messageId = cq.message?.message_id;

    // Verify caller is the saved admin
    const { data: settings } = await supabase
      .from('channel_post_settings')
      .select('admin_chat_id, channel_id, footer_text')
      .eq('id', 1)
      .maybeSingle();
    const adminChatId = settings?.admin_chat_id;

    if (!adminChatId || fromId !== adminChatId) {
      await tg('answerCallbackQuery', {
        callback_query_id: cq.id,
        text: 'You are not the configured admin. Action denied.',
        show_alert: true,
      }, botToken);
      return ACK;
    }

    // Parse callback_data — format: "<action>:<post_id>"
    const colonIdx = data.indexOf(':');
    const action = colonIdx >= 0 ? data.slice(0, colonIdx) : data;
    const postId = colonIdx >= 0 ? data.slice(colonIdx + 1) : '';

    if (!postId) {
      await tg('answerCallbackQuery', { callback_query_id: cq.id, text: 'Invalid button payload.' }, botToken);
      return ACK;
    }

    // Fetch the post
    const { data: post } = await supabase
      .from('channel_posts')
      .select('id, status, text_content, image_url')
      .eq('id', postId)
      .maybeSingle();

    if (!post) {
      await tg('answerCallbackQuery', { callback_query_id: cq.id, text: 'Post not found.', show_alert: true }, botToken);
      return ACK;
    }

    if (post.status === 'published') {
      await tg('answerCallbackQuery', { callback_query_id: cq.id, text: 'Already published.', show_alert: true }, botToken);
      // Strip the buttons since the post is done
      if (messageId) {
        await tg('editMessageReplyMarkup', {
          chat_id: fromId, message_id: messageId, reply_markup: { inline_keyboard: [] },
        }, botToken);
      }
      return ACK;
    }

    if (action === 'reject') {
      await supabase.from('channel_posts')
        .update({ status: 'rejected', rejected_at: new Date().toISOString() })
        .eq('id', postId);
      await tg('answerCallbackQuery', { callback_query_id: cq.id, text: '❌ Rejected' }, botToken);
      // Edit the draft message: append a status line, remove buttons
      if (messageId) {
        const newCaption = (cq.message?.caption || cq.message?.text || '') + '\n\n— ❌ Rejected —';
        if (cq.message?.photo) {
          await tg('editMessageCaption', {
            chat_id: fromId, message_id: messageId, caption: newCaption,
          }, botToken);
        } else {
          await tg('editMessageText', {
            chat_id: fromId, message_id: messageId, text: newCaption,
            disable_web_page_preview: true,
          }, botToken);
        }
      }
      return ACK;
    }

    if (action === 'approve') {
      // Publish to the channel via the same flow as channel-posts-admin's publish op
      const channelId = settings?.channel_id || '@mock_stream';
      const footer = settings?.footer_text || FOOTER_FALLBACK;
      const captionOrText = (post.text_content || '') + footer;
      const useImage = !!post.image_url && captionOrText.length <= 1024;

      const tgResp = useImage
        ? await tg('sendPhoto', { chat_id: channelId, photo: post.image_url, caption: captionOrText }, botToken)
        : await tg('sendMessage', { chat_id: channelId, text: captionOrText, disable_web_page_preview: true }, botToken);

      if (!tgResp.ok) {
        const errMsg = tgResp?.description || 'Telegram send failed';
        await supabase.from('channel_posts')
          .update({ status: 'failed', error_message: errMsg })
          .eq('id', postId);
        await tg('answerCallbackQuery', {
          callback_query_id: cq.id,
          text: '⚠️ Publish failed: ' + errMsg.slice(0, 180),
          show_alert: true,
        }, botToken);
        return ACK;
      }

      const channelMsgId = tgResp.result?.message_id;
      await supabase.from('channel_posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          telegram_message_id: channelMsgId,
          approved_at: new Date().toISOString(),
          error_message: null,
        })
        .eq('id', postId);

      await tg('answerCallbackQuery', { callback_query_id: cq.id, text: '✅ Published!' }, botToken);
      if (messageId) {
        const newCaption = (cq.message?.caption || cq.message?.text || '') + `\n\n— ✅ Published in channel (msg #${channelMsgId}) —`;
        if (cq.message?.photo) {
          await tg('editMessageCaption', {
            chat_id: fromId, message_id: messageId, caption: newCaption,
          }, botToken);
        } else {
          await tg('editMessageText', {
            chat_id: fromId, message_id: messageId, text: newCaption,
            disable_web_page_preview: true,
          }, botToken);
        }
      }
      return ACK;
    }

    // Unknown action
    await tg('answerCallbackQuery', { callback_query_id: cq.id, text: 'Unknown action.' }, botToken);
    return ACK;
  }

  // Anything else (group messages, edited messages, etc.) — silent ack.
  return ACK;
});
