// ============================================================================
// inject — the one piece of machinery the five OG Pages Functions share.
// ----------------------------------------------------------------------------
// Port of the Netlify edge functions in netlify/edge-functions/og-*.ts, which
// Cloudflare Pages cannot run. Same contract: let the request resolve normally
// (context.next() → _redirects → the static asset), then rewrite the HTML that
// comes back. Crawlers get real tags; browsers get the same page with a few
// inert <meta> lines.
//
// Two differences from the Netlify original, both improvements:
//
//   • HTMLRewriter instead of `await response.text()` + regex. landing-v3.html
//     is ~244 KB; the old code pulled all of it into memory and ran two string
//     passes over it on every shared link. HTMLRewriter streams, and it edits
//     actual elements rather than whatever the regex happened to match.
//
//   • og:image is built from the REQUEST host. landing-v3's static tags
//     hard-code https://mock-stream.com/og/generic.png, so every clone's link
//     preview pulled Mock Stream's artwork — and would have lost its preview
//     entirely if that one host ever broke. Each centre now serves its own.
//
// Why this lives OUTSIDE functions/: every file inside functions/ becomes a
// route. A shared module in there would publish itself as a page.
// ============================================================================

/**
 * Crawlers that are worth a database round-trip. A student's page load must
 * never pay for a preview nobody will see, so the lookups in the article and
 * flashcard functions are gated on this.
 */
export const CRAWLER =
  /telegram|whatsapp|facebookexternalhit|twitterbot|linkedin|slack|discord|skypeuripreview|viber|vkshare/i;

export const isCrawler = (request) => CRAWLER.test(request.headers.get('user-agent') || '');

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/**
 * Fetch with a hard ceiling. A slow Supabase reply must not hold a preview
 * open — the generic title is a perfectly good answer.
 */
export async function fetchWithTimeout(url, options, ms = 1500) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ac.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Resolve the request, then replace its og:/twitter: tags with `build`'s.
 *
 * `build(url, request)` returns { type, title, description, image } — or null
 * to leave the page exactly as it was.
 *
 * Fails open in every direction: a non-HTML response, an error status, a
 * throwing builder or a page with no <head> all pass straight through. A link
 * preview is never worth breaking the page it previews.
 */
export async function withOg(context, build) {
  const response = await context.next();

  const type = response.headers.get('content-type') || '';
  if (!response.ok || !type.includes('text/html')) return response;

  let meta;
  try {
    meta = await build(new URL(context.request.url), context.request);
  } catch {
    return response;
  }
  if (!meta) return response;

  const url = new URL(context.request.url);
  const tags =
    `<meta property="og:type" content="${esc(meta.type || 'website')}">` +
    `<meta property="og:title" content="${esc(meta.title)}">` +
    `<meta property="og:description" content="${esc(meta.description)}">` +
    `<meta property="og:image" content="${esc(meta.image)}">` +
    `<meta property="og:image:width" content="1200">` +
    `<meta property="og:image:height" content="630">` +
    `<meta property="og:url" content="${esc(url.origin + url.pathname + url.search)}">` +
    `<meta name="twitter:card" content="summary_large_image">` +
    `<meta name="twitter:title" content="${esc(meta.title)}">` +
    `<meta name="twitter:image" content="${esc(meta.image)}">`;

  return new HTMLRewriter()
    // landing-v3 carries its own static set for direct shares of the landing
    // page. Crawlers honour the FIRST og:title they meet, so leaving both in
    // place made every deep link preview as the generic landing card.
    .on('meta[property^="og:"]', { element: (el) => el.remove() })
    .on('meta[name^="twitter:"]', { element: (el) => el.remove() })
    .on('head', { element: (el) => el.append(tags, { html: true }) })
    .transform(response);
}
