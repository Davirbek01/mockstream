// og-tests — Open Graph tags for shared grammar/vocabulary test links.
// ----------------------------------------------------------------------------
// Learn cards share /test.html?test=<slug>&type=grammar|vocabulary. The 744
// tests in mock_tests carry no title field, but the slugs are descriptive
// ("subjunctive-mood01", "agriculture-farming01-advanced"), so the preview
// title is derived by humanising the slug — no DB lookup at all.
// Same transform pattern as og-take/og-articles: context.next() + inject.

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

/** "agriculture-farming01-advanced" → "Agriculture Farming 01 (Advanced)" */
export function humanise(slug: string): string {
  let level = "";
  let s = slug.toLowerCase();
  const lv = s.match(/-(beginner|elementary|intermediate|advanced)$/);
  if (lv) { level = lv[1]; s = s.slice(0, -lv[0].length); }
  const words = s
    .replace(/(\d+)/g, " $1")
    .split(/-|\s+/)
    .filter(Boolean)
    .map((w) => (/^\d+$/.test(w) ? w : w[0].toUpperCase() + w.slice(1)));
  let out = words.join(" ");
  if (level) out += ` (${level[0].toUpperCase() + level.slice(1)})`;
  return out;
}

export default async (request: Request, context: { next: () => Promise<Response> }) => {
  const response = await context.next();
  const type = response.headers.get("content-type") || "";
  if (!response.ok || !type.includes("text/html")) return response;

  const url = new URL(request.url);
  const slug = (url.searchParams.get("test") || "").trim();
  const kind = (url.searchParams.get("type") || "").trim().toLowerCase();
  const isVocab = kind === "vocabulary" || kind === "vocab";
  const kindName = isVocab ? "Vocabulary" : "Grammar";

  let title = `${kindName} Practice Tests`;
  let image = `${url.origin}/og/${isVocab ? "vocabulary" : "grammar"}.png`;
  if (/^[a-z0-9-]{1,60}$/i.test(slug)) {
    title = `${kindName} · ${humanise(slug)}`;
  }
  const desc = "MCQ practice with instant scoring and explanations.";

  const tags =
    `\n<meta property="og:type" content="website">` +
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
  html = html.replace(/<meta\s+(?:property="og:|name="twitter:)[^>]*>\s*/g, "");
  const out = html.includes("</head>") ? html.replace("</head>", tags + "</head>") : html;
  return new Response(out, { status: response.status, headers: response.headers });
};

// Netlify Pretty URLs 301s /test.html -> /test (same trap as og-articles):
// bind BOTH so the path crawlers actually land on carries the tags.
export const config = { path: ["/test", "/test.html"] };
