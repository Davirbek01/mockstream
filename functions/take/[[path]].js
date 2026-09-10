// og-take — Open Graph tags for /take/<slug> deep links.
// ----------------------------------------------------------------------------
// Share buttons produce /take/<exam>-<skill>-<n> (e.g. /take/cefr-reading-45).
// _redirects rewrites that to /landing-v3?take=<slug>, whose static tags are
// the generic landing card — so before this existed, every mock ever shared in
// a Telegram channel previewed identically.
//
// Titles are generic patterns built from the slug; no database lookup, so a
// student's page load costs nothing extra. Unknown slug → generic cover and
// "Mock Exam", and the page still serves.
import { withOg } from '../../og-shared/inject.js';

const SKILLS = {
  listening: 'Listening',
  reading: 'Reading',
  writing: 'Writing',
  speaking: 'Speaking',
};
const EXAMS = { cefr: 'CEFR Multilevel', ielts: 'IELTS' };

export const onRequest = (context) =>
  withOg(context, (url) => {
    // slug = last path segment: "<exam>-<skill>-<n>" (n may be "1.2" etc.)
    const slug = decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || '');
    const m = slug.match(/^(cefr|ielts)-(listening|reading|writing|speaking)-(.+)$/i);

    if (!m) {
      return {
        title: 'Mock Exam',
        description: 'Sit the mock online — timed, auto-scored, with AI feedback.',
        image: `${url.origin}/og/generic.png`,
      };
    }
    const exam = m[1].toLowerCase();
    const skill = m[2].toLowerCase();
    return {
      title: `${EXAMS[exam]} ${SKILLS[skill]} · Mock ${m[3]}`,
      description: 'Sit the mock online — timed, auto-scored, with AI feedback.',
      image: `${url.origin}/og/${exam}-${skill}.png`,
    };
  });
