// og-articles — Open Graph tags for shared graded-article links.
// ----------------------------------------------------------------------------
// Learn cards share /Articles.html?article=01&level=B1 — the identity is in
// the QUERY STRING, which crawlers do send, so tags can vary per article.
// Same pattern as og-take.ts: let the request resolve normally via
// context.next(), then inject tags before </head>. Titles are derived from
// the query alone (no DB lookup — zero added latency for students).

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
  if (/^[\w.-]{1,10}$/.test(art)) {
    title = `Graded Reading · Article ${art}`;
    if (/^[ABC][12]$/.test(level)) title += ` (${level})`;
  }
  const image = `${url.origin}/og/articles.png`;
  const desc = "Levelled reading with natural audio and karaoke highlighting.";

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

export const config = { path: "/Articles.html" };
