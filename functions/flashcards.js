// og-flashcards — Open Graph tags for shared flashcard sets.
// ----------------------------------------------------------------------------
// Shared as /flashcards.html?topic=<slug> ("appearance-fashion-advanced");
// Pages 308s to /flashcards?topic=… with the query intact and crawlers follow.
//
// All 507 sets store a real title, so a crawler gets the real one — but the
// lookup runs ONLY for crawlers, so a student opening the page never waits on
// it. Fallback is the humanised slug.
import { withOg, isCrawler, fetchWithTimeout } from '../og-shared/inject.js';

const SB = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
const SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';

/** "appearance-fashion-advanced" → "Appearance Fashion (Advanced)" */
export function humanise(slug) {
  let level = '';
  let s = slug.toLowerCase();
  const lv = s.match(/-(beginner|elementary|pre-intermediate|intermediate|upper-intermediate|advanced)$/);
  if (lv) { level = lv[1]; s = s.slice(0, -lv[0].length); }
  const cap = (w) => w[0].toUpperCase() + w.slice(1);
  let out = s.split('-').filter(Boolean).map(cap).join(' ');
  if (level) out += ` (${level.split('-').map(cap).join(' ')})`;
  return out;
}

export const onRequest = (context) =>
  withOg(context, async (url, request) => {
    const topic = (url.searchParams.get('topic') || '').trim();
    const image = `${url.origin}/og/flashcards.png`;
    const description = 'Flip-card vocabulary with term audio — study on web or in the app.';

    if (!/^[a-z0-9-]{1,60}$/i.test(topic)) {
      return { title: 'Vocabulary Flashcards', description, image };
    }

    let title = `Flashcards · ${humanise(topic)}`;
    if (isCrawler(request)) {
      try {
        const r = await fetchWithTimeout(
          `${SB}/rest/v1/mock_tests?select=title:mock_data->>title` +
            `&mock_type=eq.flashcard&status=eq.published` +
            `&mock_data->>slug=eq.${encodeURIComponent(topic.toLowerCase())}&limit=1`,
          { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } },
        );
        if (r.ok) {
          const rows = await r.json();
          if (rows && rows[0] && rows[0].title) title = rows[0].title;
        }
      } catch { /* humanised slug stands */ }
    }
    return { title, description, image };
  });
