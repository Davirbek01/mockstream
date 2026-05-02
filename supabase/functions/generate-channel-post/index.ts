// generate-channel-post
// -----------------------------------------------------------------------------
// Cron-triggered (twice daily M-F via pg_cron) generator for AI-authored
// Telegram channel posts. Picks a topic from a rotating pool, calls Gemini
// for the post text + an illustrative image, uploads the image to Supabase
// Storage, and inserts a 'pending' row in channel_posts for admin review.
//
// Required Edge Function secrets:
//   GEMINI_API_KEY              (already set — shared with ai-proxy)
//   SUPABASE_URL                (auto-injected)
//   SUPABASE_SERVICE_ROLE_KEY   (auto-injected)
//
// Manual fire (for testing without waiting for cron):
//   POST https://<project>.supabase.co/functions/v1/generate-channel-post
//   Body: {"slot": "manual", "topic": "english_lifehack"}  (topic optional)
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

// Topic pool with system instructions for Gemini. Each topic yields a short
// channel post (100–250 words). Add new topics by appending here.
const TOPICS: Record<string, { label: string; textPrompt: string; imagePrompt: string }> = {
  ad_mock_stream: {
    label: 'Mock Stream promo',
    textPrompt: `Write a friendly, non-pushy Telegram channel post (100-150 words) promoting Mock Stream — a free CEFR & IELTS exam prep platform. Highlight ONE specific feature each time (e.g. AI scoring, mock tests, instant feedback, multi-skill coverage). Include 2-3 relevant emojis. End with a clear CTA. Use Telegram MarkdownV2 formatting (bold with *, italic with _, escape special chars). Do NOT include any URLs or contact info — those are appended as a footer.`,
    imagePrompt: `A clean, modern illustration of a student studying English for an exam, with subtle Mock Stream branding feel — teal and orange color palette. Flat design, minimal text on image, 1:1 square format suitable for social media.`,
  },
  english_lifehack: {
    label: 'English study lifehack',
    textPrompt: `Write a Telegram channel post (120-180 words) sharing ONE specific, actionable English-learning lifehack (e.g. shadowing technique, spaced repetition for vocab, reading aloud for fluency). Make it concrete with a 30-second example. Use 2-3 emojis. Telegram MarkdownV2 format (bold *, italic _, escape special chars). End with a question that invites engagement (no contact info — that's the footer).`,
    imagePrompt: `A flat illustration of a study lifehack concept — visual metaphor like a brain with arrows, a notebook with sticky notes, or earbuds with sound waves. Soft pastel colors, friendly, square format.`,
  },
  cefr_grammar_micro: {
    label: 'CEFR grammar micro-lesson',
    textPrompt: `Write a Telegram channel post (150-200 words) teaching ONE specific grammar point typically tested in CEFR exams (B1-C1 level). Pick a small precise topic — NOT "tenses in general" but e.g. "third conditional with 'wish'" or "reported speech: backshifting". Structure: 1) the rule in one sentence, 2) 2-3 example sentences, 3) ONE common mistake learners make. Use Telegram MarkdownV2. 2-3 emojis. No external links.`,
    imagePrompt: `A minimalist chalkboard or notebook page illustration showing a grammar concept abstractly — formula-like layout, neat handwriting feel. Educational, professional, square format.`,
  },
  ielts_writing_phrase: {
    label: 'IELTS writing phrase',
    textPrompt: `Write a Telegram channel post (120-180 words) introducing ONE high-impact phrase or collocation used in IELTS Writing Task 2 (band 7+ vocabulary). Format: 1) the phrase in bold, 2) what it means, 3) one example sentence in context, 4) when NOT to use it (overuse warning). Telegram MarkdownV2. 2-3 emojis. End with an encouragement to try using it in their next practice.`,
    imagePrompt: `An illustration of a hand writing in an exam booklet with a fountain pen, professional and academic feel. Subtle warm lighting, square format. No specific text on the page.`,
  },
  cefr_speaking_tip: {
    label: 'CEFR speaking exam tip',
    textPrompt: `Write a Telegram channel post (120-180 words) giving ONE practical tip for the CEFR Speaking exam (specific to the Uzbekistan CEFR format with 4 parts: Q1-3 short answers, Q4-6 picture description, Q7 monologue, Q8 discussion). Pick ONE: handling nerves, stalling phrases, comparing pictures, structuring a monologue, etc. Make it actionable. Telegram MarkdownV2. 2-3 emojis. No external links.`,
    imagePrompt: `A friendly illustration of a student speaking confidently in an exam setting with an examiner — clear gestures, calm vibe, soft warm colors, square format.`,
  },
};

// Round-robin / weighted-random picker — avoids picking the same topic two
// slots in a row. We pull the most recent post's topic and exclude it.
async function pickTopic(supabase: any, override?: string): Promise<string> {
  if (override && TOPICS[override]) return override;
  const allKeys = Object.keys(TOPICS);
  // Get last published or pending topic to avoid repeats
  const { data: recent } = await supabase
    .from('channel_posts')
    .select('topic')
    .order('created_at', { ascending: false })
    .limit(1);
  const lastTopic = recent && recent.length > 0 ? recent[0].topic : null;
  const pool = lastTopic ? allKeys.filter(k => k !== lastTopic) : allKeys;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Call Gemini for text generation
async function geminiText(prompt: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.85, maxOutputTokens: 600 }
    })
  });
  if (!resp.ok) throw new Error(`Gemini text error ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned empty text');
  return text.trim();
}

// Call Gemini for image generation (Gemini 2.5 Flash Image)
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
      // base64 → Uint8Array
      const bin = atob(p.inlineData.data);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes;
    }
  }
  throw new Error('Gemini returned no image data');
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

  // 1. Pick topic
  const topic = await pickTopic(supabase, overrideTopic);
  const t = TOPICS[topic];
  if (!t) return jerr(400, 'unknown_topic', topic);

  // 2. Generate text (independent of image — if image fails we still keep text)
  let textContent: string;
  try {
    textContent = await geminiText(t.textPrompt, apiKey);
  } catch (e) {
    return jerr(500, 'text_generation_failed', String((e as Error).message || e));
  }

  // 3. Generate image
  let imageUrl: string | null = null;
  let imageError: string | null = null;
  try {
    const bytes = await geminiImage(t.imagePrompt, apiKey);
    const filename = `${topic}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`;
    const { data: upData, error: upErr } = await supabase.storage
      .from('channel-post-images')
      .upload(filename, bytes, { contentType: 'image/png', upsert: false });
    if (upErr) throw upErr;
    const { data: pubData } = supabase.storage
      .from('channel-post-images')
      .getPublicUrl(upData.path);
    imageUrl = pubData.publicUrl;
  } catch (e) {
    // Non-fatal — text post can still be reviewed/published without image
    imageError = String((e as Error).message || e);
    console.warn('[generate-channel-post] image generation failed:', imageError);
  }

  // 4. Insert pending row
  const { data: inserted, error: insErr } = await supabase
    .from('channel_posts')
    .insert({
      topic,
      text_content: textContent,
      image_url: imageUrl,
      image_prompt: t.imagePrompt,
      status: 'pending',
      scheduled_for: new Date().toISOString(),
      error_message: imageError,
    })
    .select('id, topic, status')
    .single();

  if (insErr) return jerr(500, 'insert_failed', insErr.message);

  return jok({
    ok: true,
    post_id: inserted.id,
    topic,
    slot,
    has_image: !!imageUrl,
    image_error: imageError,
    text_preview: textContent.slice(0, 200) + (textContent.length > 200 ? '…' : ''),
  });
});
