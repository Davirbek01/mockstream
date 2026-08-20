// Word of the Day — ONE shared word per day for ALL users/centres, generated
// once through ai-proxy and cached in public.word_of_day. The first request of
// the day triggers generation; everyone else reads the cached row, so the
// provider is hit ~once per day total (not once per user).
//
// Provider: Groq / openai/gpt-oss-120b — the same model that scores the mocks.
// It used to ask DeepSeek for `deepseek-chat`, a model the vendor retired on
// 24 Jul 2026; that call could only have been failing, leaving the site with
// whatever word happened to be cached. Keeping this on the platform's live
// scorer means one place to change when the model changes, and the call is
// logged and priced with everything else.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
const AI_PROXY = `${SUPABASE_URL}/functions/v1/ai-proxy/groq/openai/v1/chat/completions`;
const MODEL = 'openai/gpt-oss-120b';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Local calendar day at UTC+5 (Uzbekistan) so the word flips at local midnight.
function todayKey(): string {
  const d = new Date(Date.now() + 5 * 3600 * 1000);
  return d.toISOString().slice(0, 10);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

function normalize(r: any) {
  const word = String(r?.word ?? '').trim();
  const meaning = String(r?.meaning ?? '').trim();
  if (!word || !meaning) return null;
  const syn = Array.isArray(r?.synonyms) ? r.synonyms.map((s: any) => String(s).trim()).filter(Boolean).slice(0, 4) : [];
  return {
    word,
    pos: String(r?.pos ?? '').trim() || 'word',
    phonetic: String(r?.phonetic ?? '').trim(),
    meaning,
    example: String(r?.example ?? '').trim(),
    synonyms: syn,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const supa = createClient(SUPABASE_URL, SERVICE_KEY);
  const day = todayKey();

  // Already have today's word? Return it (the common path — 0 AI cost).
  const { data: existing } = await supa.from('word_of_day').select('data').eq('day', day).maybeSingle();
  if (existing?.data) return json({ data: existing.data, cached: true });

  // Avoid recent repeats.
  const { data: recent } = await supa.from('word_of_day').select('data').order('day', { ascending: false }).limit(45);
  const avoid = (recent ?? []).map((r: any) => r?.data?.word).filter(Boolean);

  const prompt = `Give ONE interesting, exam-relevant English vocabulary word for CEFR B2–C1 learners (IELTS / Multilevel). Prefer academic or high-frequency useful words; avoid slang and proper nouns.\n${avoid.length ? `Do NOT choose any of these recently used words: ${avoid.slice(0, 40).join(', ')}.` : ''}\nRespond with VALID JSON ONLY, no prose, in exactly this shape:\n{"word":"<word>","pos":"noun|verb|adjective|adverb","phonetic":"/IPA transcription/","meaning":"one clear sentence definition","example":"one natural sentence using the word","synonyms":["syn1","syn2","syn3"]}`;

  let word: any = null;
  try {
    const res = await fetch(AI_PROXY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: ANON,
        Authorization: `Bearer ${ANON}`,
        'x-ms-center': 'mock_stream',
        // Its own skill tag: one call a day is not a student's writing
        // submission, and mixing it into that count skews the daily figures.
        'x-ms-skill': 'word-of-day',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
        // gpt-oss-120b reasons before it answers, and that reasoning is
        // charged against the same budget. A 400-token cap was spent thinking
        // and the reply came back "max completion tokens reached before
        // generating valid JSON" — the same trap DeepSeek v4 set. The answer
        // is six short fields; the headroom is for the thinking.
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      }),
    });
    if (res.ok) {
      const j = await res.json();
      const content = j?.choices?.[0]?.message?.content;
      if (content) {
        let parsed: any;
        try { parsed = JSON.parse(content); } catch { const m = String(content).match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); }
        word = normalize(parsed);
      }
    }
  } catch (_e) { /* fall through */ }

  if (!word) return json({ data: null, error: 'generation_failed' });

  // Insert; if another concurrent request won the race, keep theirs.
  await supa.from('word_of_day').upsert({ day, data: word }, { onConflict: 'day', ignoreDuplicates: true });
  const { data: fresh } = await supa.from('word_of_day').select('data').eq('day', day).maybeSingle();
  return json({ data: fresh?.data ?? word, generated: true });
});
