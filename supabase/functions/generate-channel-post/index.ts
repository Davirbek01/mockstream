// generate-channel-post
// -----------------------------------------------------------------------------
// Cron-triggered (twice daily M-F by default) generator. Reads topics + settings
// from public.channel_topics + public.channel_post_settings (admin-editable),
// calls Gemini for text + image, inserts pending row. If settings.auto_publish
// is true, also publishes to Telegram inline.
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

// Strict format guard appended to every text prompt — keeps the model from
// emitting MarkdownV2 syntax, which Telegram's parser rejects on missing
// escapes. We post in plain-text mode.
function plainTextRules(minWords: number, maxWords: number): string {
  return `

OUTPUT FORMAT RULES (strict):
- Length: ${minWords}-${maxWords} words.
- Plain text only. NO markdown syntax of any kind.
- Do NOT use *, _, [, ], (, ), \`, ~, # for formatting — they will appear literally.
- Do NOT escape any character with backslash. Write punctuation normally.
- Use emojis and line breaks for visual structure.
- Do NOT include any URLs (footer is appended separately).
- Output the post body directly with no preamble, no "Here's a post:", no quotes around it.`;
}

async function pickTopic(supabase: any, override?: string): Promise<{ key: string; label: string; text_prompt: string; image_prompt: string }> {
  // Fetch all enabled topics
  const { data: topics, error } = await supabase
    .from('channel_topics')
    .select('key, label, text_prompt, image_prompt, sort_order')
    .eq('enabled', true)
    .order('sort_order', { ascending: true });
  if (error) throw new Error('topics_fetch_failed: ' + error.message);
  if (!topics || topics.length === 0) throw new Error('no_enabled_topics');

  if (override) {
    const match = topics.find((t: any) => t.key === override);
    if (match) return match;
  }

  // Avoid the most recent topic to keep the channel feed varied
  const { data: recent } = await supabase
    .from('channel_posts')
    .select('topic')
    .order('created_at', { ascending: false })
    .limit(1);
  const lastKey = recent && recent.length > 0 ? recent[0].topic : null;
  const pool = lastKey ? topics.filter((t: any) => t.key !== lastKey) : topics;
  const choices = pool.length > 0 ? pool : topics;
  return choices[Math.floor(Math.random() * choices.length)];
}

async function geminiText(prompt: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.85, maxOutputTokens: 800 }
    })
  });
  if (!resp.ok) throw new Error(`Gemini text error ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned empty text');
  return text.trim();
}

async function geminiImage(prompt: string, apiKey: string): Promise<Uint8Array> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE'] }
    })
  });
  if (!resp.ok) throw new Error(`Gemini image error ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  for (const p of parts) {
    if (p.inlineData?.data) {
      const bin = atob(p.inlineData.data);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes;
    }
  }
  throw new Error('Gemini returned no image data');
}

// Inline publish path used when settings.auto_publish === true.
async function publishToTelegram(
  channelId: string, footerText: string,
  textContent: string, imageUrl: string | null
): Promise<{ messageId: number; usedImage: boolean }> {
  const botToken = Deno.env.get('TELEGRAM_NEWS_BOT_TOKEN');
  if (!botToken) throw new Error('bot_token_unset');

  const captionOrText = textContent + footerText;
  const useImage = !!imageUrl && captionOrText.length <= 1024;

  const tgResp = useImage
    ? await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: channelId, photo: imageUrl, caption: captionOrText }),
      })
    : await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: channelId, text: captionOrText, disable_web_page_preview: true }),
      });

  const tgData = await tgResp.json();
  if (!tgResp.ok || !tgData.ok) {
    throw new Error('telegram_send_failed: ' + (tgData?.description || `HTTP ${tgResp.status}`));
  }
  return { messageId: tgData?.result?.message_id, usedImage: useImage };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST')   return jerr(405, 'method_not_allowed');

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* tolerate empty body from cron */ }
  const slot = typeof body.slot === 'string' ? body.slot : 'manual';
  const overrideTopic = typeof body.topic === 'string' ? body.topic : undefined;

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return jerr(500, 'gemini_api_key_unset');

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // KILL SWITCH. channel_post_settings.cron_preset = 'off' stops generation
  // dead, whoever calls this and however they call it.
  //
  // This exists because the caller turned out not to be a schedule at all: the
  // 08:00 health report sweeps every Edge Function by POSTing an empty body to
  // it, to find the ones that have lost their code — and an empty body is
  // exactly what the cron used to send here, so the sweep was quietly
  // commissioning Gemini posts. Ten of them between 19 and 20 Aug 2026. The
  // sweep now sends OPTIONS, but a guard that depends on every caller behaving
  // is not a guard.
  {
    const { data: sw } = await supabase
      .from('channel_post_settings').select('cron_preset').eq('id', 1).maybeSingle();
    if ((sw?.cron_preset || '') === 'off') {
      return jok({ skipped: 'channel posts are switched off (cron_preset = off)' });
    }
  }

  // Read settings (singleton row id=1)
  const { data: settings, error: settingsErr } = await supabase
    .from('channel_post_settings')
    .select('channel_id, footer_text, min_words, max_words, auto_publish, admin_chat_id')
    .eq('id', 1)
    .maybeSingle();
  if (settingsErr || !settings) return jerr(500, 'settings_fetch_failed', settingsErr?.message);

  // Pick topic
  let topic;
  try { topic = await pickTopic(supabase, overrideTopic); }
  catch (e) { return jerr(500, 'topic_pick_failed', String((e as Error).message || e)); }

  // Generate text with the per-topic prompt + global word-count rules
  const fullPrompt = topic.text_prompt + plainTextRules(settings.min_words, settings.max_words);
  let textContent: string;
  try { textContent = await geminiText(fullPrompt, apiKey); }
  catch (e) { return jerr(500, 'text_generation_failed', String((e as Error).message || e)); }

  // Generate image (non-fatal if it fails — text-only post is still publishable)
  let imageUrl: string | null = null;
  let imageError: string | null = null;
  try {
    const bytes = await geminiImage(topic.image_prompt, apiKey);
    const filename = `${topic.key}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`;
    const { data: upData, error: upErr } = await supabase.storage
      .from('channel-post-images')
      .upload(filename, bytes, { contentType: 'image/png', upsert: false });
    if (upErr) throw upErr;
    const { data: pubData } = supabase.storage
      .from('channel-post-images')
      .getPublicUrl(upData.path);
    imageUrl = pubData.publicUrl;
  } catch (e) {
    imageError = String((e as Error).message || e);
    console.warn('[generate-channel-post] image generation failed:', imageError);
  }

  // Insert as pending first so we have a row id even if auto-publish fails
  const { data: inserted, error: insErr } = await supabase
    .from('channel_posts')
    .insert({
      topic: topic.key,
      text_content: textContent,
      image_url: imageUrl,
      image_prompt: topic.image_prompt,
      status: 'pending',
      scheduled_for: new Date().toISOString(),
      error_message: imageError,
    })
    .select('id, topic, status')
    .single();
  if (insErr) return jerr(500, 'insert_failed', insErr.message);

  // ── DM the draft to admin (review queue mode only) ────────────────
  // If admin_chat_id is set AND auto_publish is OFF, send the draft to the
  // admin's Telegram with inline Approve/Reject buttons. The message_id is
  // saved on the row so news-bot-webhook can edit it on button tap.
  let adminDraftMessageId: number | null = null;
  if (settings.admin_chat_id && !settings.auto_publish) {
    try {
      const botToken = Deno.env.get('TELEGRAM_NEWS_BOT_TOKEN');
      if (botToken) {
        const reviewCaption = `📝 New draft for review (topic: ${topic.label})\n\n${textContent}`;
        const truncated = reviewCaption.length > 1024 ? reviewCaption.slice(0, 1021) + '…' : reviewCaption;
        const dashboardUrl = 'https://mock-stream.com/results/index.html';
        const replyMarkup = {
          inline_keyboard: [
            [
              { text: '✅ Approve & Publish', callback_data: `approve:${inserted.id}` },
              { text: '❌ Reject', callback_data: `reject:${inserted.id}` },
            ],
            [
              { text: '🌐 Open dashboard for editing', url: dashboardUrl },
            ],
          ],
        };
        let dmResp: any;
        if (imageUrl && truncated.length <= 1024) {
          dmResp = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: settings.admin_chat_id,
              photo: imageUrl,
              caption: truncated,
              reply_markup: replyMarkup,
            }),
          }).then(r => r.json());
        } else {
          dmResp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: settings.admin_chat_id,
              text: reviewCaption,
              disable_web_page_preview: true,
              reply_markup: replyMarkup,
            }),
          }).then(r => r.json());
        }
        if (dmResp?.ok) {
          adminDraftMessageId = dmResp.result?.message_id;
          await supabase.from('channel_posts')
            .update({ admin_draft_message_id: adminDraftMessageId })
            .eq('id', inserted.id);
        } else {
          console.warn('[generate-channel-post] admin DM failed:', dmResp?.description);
        }
      }
    } catch (e) {
      console.warn('[generate-channel-post] admin DM exception:', String((e as Error).message || e));
    }
  }

  // Auto-publish if enabled
  let autoPublishStatus: string | null = null;
  let autoPublishMsgId: number | null = null;
  if (settings.auto_publish) {
    try {
      const r = await publishToTelegram(settings.channel_id, settings.footer_text, textContent, imageUrl);
      await supabase.from('channel_posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          telegram_message_id: r.messageId,
          approved_at: new Date().toISOString(),
          error_message: null,
        })
        .eq('id', inserted.id);
      autoPublishStatus = 'published';
      autoPublishMsgId = r.messageId;
    } catch (e) {
      const errMsg = String((e as Error).message || e);
      await supabase.from('channel_posts')
        .update({ status: 'failed', error_message: errMsg })
        .eq('id', inserted.id);
      autoPublishStatus = 'failed';
    }
  }

  return jok({
    ok: true,
    post_id: inserted.id,
    topic: topic.key,
    slot,
    has_image: !!imageUrl,
    image_error: imageError,
    auto_published: autoPublishStatus === 'published',
    auto_publish_status: autoPublishStatus,
    telegram_message_id: autoPublishMsgId,
    admin_dm_sent: adminDraftMessageId !== null,
    admin_draft_message_id: adminDraftMessageId,
    text_preview: textContent.slice(0, 200) + (textContent.length > 200 ? '…' : ''),
  });
});
