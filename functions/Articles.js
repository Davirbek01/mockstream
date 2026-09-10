// og-articles — Open Graph tags for shared graded-article links.
// ----------------------------------------------------------------------------
// Learn cards share /Articles.html?article=01&level=B1. Pages 308s that to
// /Articles?article=… with the query intact, so THIS is the path crawlers
// actually land on — hence the capital A, matching site/Articles.html.
//
// (Netlify also bound the lowercase /articles. Nothing links to that form, and
// a Windows checkout cannot hold both Articles.js and articles.js, so only the
// shared form is bound here.)
import { withOg, isCrawler, fetchWithTimeout } from '../og-shared/inject.js';

const SB = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
const SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';

export const onRequest = (context) =>
  withOg(context, async (url, request) => {
    const art = (url.searchParams.get('article') || '').trim();
    const level = (url.searchParams.get('level') || '').trim().toUpperCase();
    const num = /^\d{1,4}$/.test(art) ? parseInt(art, 10) : null;

    if (!num) {
      return {
        type: 'article',
        title: 'Graded Reading Articles',
        description: 'Levelled reading with natural audio and karaoke highlighting.',
        image: `${url.origin}/og/articles.png`,
      };
    }

    let title = `Graded Reading · Article ${art}`;
    if (/^[ABC][12]$/.test(level)) title += ` (${level})`;
    let description = 'Levelled reading with natural audio and karaoke highlighting.';

    // Every published article stores its topic image at a number-derived path
    // (verified across all 220 on 2026-08-09): 2-digit padding below 100,
    // plain above. No lookup needed for the image.
    const pad = num < 100 ? String(num).padStart(2, '0') : String(num);
    let image =
      `https://storage.googleapis.com/mockstream-samples-audio/cefr-articles/article-${pad}/image.jpg`;

    // The real headline — but only for crawlers, so student page loads never
    // pay for the round-trip. Any failure keeps the derived title.
    if (isCrawler(request)) {
      try {
        const r = await fetchWithTimeout(
          `${SB}/rest/v1/mock_tests?select=title:mock_data->>title,img:mock_data->>imageUrl` +
            `&mock_type=eq.article&status=eq.published&mock_number=eq.${num}&limit=1`,
          { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } },
        );
        if (r.ok) {
          const rows = await r.json();
          const row = rows && rows[0];
          if (row && row.title) {
            title = row.title;
            description =
              `Graded article ${art}` +
              (/^[ABC][12]$/.test(level) ? ` (${level})` : '') +
              ' — read & listen with karaoke highlighting.';
          }
          if (row && row.img) image = row.img; // authoritative if it differs
        }
      } catch { /* derived title stands */ }
    }

    return { type: 'article', title, description, image };
  });
