// og-articles — Open Graph tags for shared graded-article links.
// ----------------------------------------------------------------------------
// Learn cards share /Articles.html?article=01&level=B1 — the identity is in
// the QUERY STRING, which crawlers do send, so tags can vary per article.
// Same pattern as og-take.ts: let the request resolve normally via
// context.next(), then inject tags before </head>. Titles are derived from
// the query alone (no DB lookup — zero added latency for students).

const SB_KEY = "sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

export default async (request: Request, context: { next: () => Promise<Response> }) => {
  const response = await context.next();
  const type = response.headers.get("content-type") || "";
  if (!response.ok || !type.includes("text/html")) return response;

  const url = new URL(request.url);
  const art = (url.searchParams.get("article") || "").trim();
  const level = (url.searchParams.get("level") || "").trim().toUpperCase();

  let title = "Graded Reading Articles";
  let image = `${url.origin}/og/articles.png`;
  let desc = "Levelled reading with natural audio and karaoke highlighting.";
  const num = /^\d{1,4}$/.test(art) ? parseInt(art, 10) : null;
  if (num) {
    title = `Graded Reading · Article ${art}`;
    if (/^[ABC][12]$/.test(level)) title += ` (${level})`;
    // Every published article stores its topic image at a number-derived GCS
    // path (verified across all 220 on 2026-08-09): 2-digit padding below
    // 100, plain above. No lookup needed for the image.
    const pad = num < 100 ? String(num).padStart(2, "0") : String(num);
    image = `https://storage.googleapis.com/mockstream-samples-audio/cefr-articles/article-${pad}/image.jpg`;

    // Real headline — but ONLY for preview crawlers, so student page loads
    // never pay for the round-trip. Any failure keeps the generic title.
    if (/telegram|whatsapp|facebookexternalhit|twitterbot|linkedin|slack|discord|skypeuripreview|viber|vkshare/i
        .test(request.headers.get("user-agent") || "")) {
      try {
        const ac = new AbortController();
        const timer = setTimeout(() => ac.abort(), 1500);
        const r = await fetch(
          "https://zknyukkbtbcqgvkgjktb.supabase.co/rest/v1/mock_tests" +
            `?select=title:mock_data->>title,img:mock_data->>imageUrl` +
            `&mock_type=eq.article&status=eq.published&mock_number=eq.${num}&limit=1`,
          { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }, signal: ac.signal },
        );
        clearTimeout(timer);
        if (r.ok) {
          const rows = await r.json();
          const row = rows && rows[0];
          if (row && row.title) {
            title = row.title;
            desc = `Graded article ${art}` +
              (/^[ABC][12]$/.test(level) ? ` (${level})` : "") +
              " — read & listen with karaoke highlighting.";
          }
          if (row && row.img) image = row.img; // authoritative if it differs
        }
      } catch (_e) { /* generic title stands */ }
    }
  }

  const tags =
    `\n<meta property="og:type" content="article">` +
    `\n<meta property="og:title" content="${esc(title)}">` +
    `\n<meta property="og:description" content="${esc(desc)}">` +
    `\n<meta property="og:image" content="${esc(image)}">` +
    `\n<meta property="og:image:width" content="1200">` +
    `\n<meta property="og:image:height" content="630">` +
    `\n<meta property="og:url" content="${esc(url.origin + url.pathname + url.search)}">` +
    `\n<meta name="twitter:card" content="summary_large_image">` +
    `\n<meta name="twitter:title" content="${esc(title)}">` +
    `\n<meta name="twitter:image" content="${esc(image)}">\n`;

  let html = await response.text();
  // Defensive parity with og-take: drop any pre-existing og/twitter tags so
  // the injected set is the only one crawlers can meet first.
  html = html.replace(/<meta\s+(?:property="og:|name="twitter:)[^>]*>\s*/g, "");
  const out = html.includes("</head>") ? html.replace("</head>", tags + "</head>") : html;

  return new Response(out, { status: response.status, headers: response.headers });
};

// Netlify Pretty URLs 301s /Articles.html -> /articles; crawlers follow the
// redirect, so the FINAL path needs the binding too (the .html form only ever
// answers 301, which this function passes through untouched).
export const config = { path: ["/articles", "/Articles.html"] };
