// og-tests — Open Graph tags for shared Grammar/Vocabulary practice tests.
// ----------------------------------------------------------------------------
// Learn cards share /test.html?test=<slug>&type=<grammar|vocabulary>. Pages
// 308s that to /test?test=… keeping the query, and crawlers follow, so binding
// the clean path is enough.
//
// The tests in mock_tests carry no title field, but the slugs are descriptive
// ("agriculture-farming01-advanced"), so the title is humanised from the slug —
// no database lookup at all.
import { withOg } from '../og-shared/inject.js';

/** "agriculture-farming01-advanced" → "Agriculture Farming 01 (Advanced)" */
export function humanise(slug) {
  let level = '';
  let s = slug.toLowerCase();
  const lv = s.match(/-(beginner|elementary|intermediate|advanced)$/);
  if (lv) { level = lv[1]; s = s.slice(0, -lv[0].length); }
  const words = s
    .replace(/(\d+)/g, ' $1')
    .split(/-|\s+/)
    .filter(Boolean)
    .map((w) => (/^\d+$/.test(w) ? w : w[0].toUpperCase() + w.slice(1)));
  let out = words.join(' ');
  if (level) out += ` (${level[0].toUpperCase() + level.slice(1)})`;
  return out;
}

export const onRequest = (context) =>
  withOg(context, (url) => {
    const slug = (url.searchParams.get('test') || '').trim();
    const kind = (url.searchParams.get('type') || '').trim().toLowerCase();
    const isVocab = kind === 'vocabulary' || kind === 'vocab';
    const kindName = isVocab ? 'Vocabulary' : 'Grammar';

    return {
      title: /^[a-z0-9-]{1,60}$/i.test(slug)
        ? `${kindName} · ${humanise(slug)}`
        : `${kindName} Practice Tests`,
      description: 'MCQ practice with instant scoring and explanations.',
      image: `${url.origin}/og/${isVocab ? 'vocabulary' : 'grammar'}.png`,
    };
  });
