// og-take — inject Open Graph tags into /take/<slug> deep links.
// ----------------------------------------------------------------------------
// Share buttons produce /take/<exam>-<skill>-<n> (e.g. /take/cefr-reading-45).
// site/_redirects rewrites that to landing-v3.html, which has no og: tags, so
// Telegram/WhatsApp previews were bare links. This function lets the rewrite
// happen (context.next() → the exact response the redirect always produced)
// and then injects og:/twitter: tags before </head>.
//
// Design decisions (spec 2026-08-09-og-link-previews-design.md):
//  - Titles are generic patterns ("CEFR Reading · Mock 45") — no DB lookup.
//  - og:image is centre-neutral art served from THIS site's own /og/ dir, so
//    the absolute URL is built from the request host (works for all 7 sites).
//  - Unknown slug → generic cover + "Mock Exam" title; the page always serves.
//  - No user-agent sniffing: browsers get the same HTML, tags are inert.

const SKILLS: Record<string, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};
const EXAMS: Record<string, string> = {
  cefr: "CEFR Multilevel",
  ielts: "IELTS",
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

export default async (request: Request, context: { next: () => Promise<Response> }) => {
  const response = await context.next();

  // Only touch successful HTML responses; anything else passes through.
  const type = response.headers.get("content-type") || "";
  if (!response.ok || !type.includes("text/html")) return response;

  const url = new URL(request.url);
  // slug = last path segment: "<exam>-<skill>-<n>" (n may be "1.2" etc.)
  const slug = decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() || "");
  const m = slug.match(/^(cefr|ielts)-(listening|reading|writing|speaking)-(.+)$/i);

  let title = "Mock Exam";
  let image = `${url.origin}/og/generic.png`;
  if (m) {
    const exam = m[1].toLowerCase();
    const skill = m[2].toLowerCase();
    title = `${EXAMS[exam]} ${SKILLS[skill]} · Mock ${m[3]}`;
    image = `${url.origin}/og/${exam}-${skill}.png`;
  }
  const desc = "Sit the mock online — timed, auto-scored, with AI feedback.";

  const tags =
    `\n<meta property="og:type" content="website">` +
    `\n<meta property="og:title" content="${esc(title)}">` +
    `\n<meta property="og:description" content="${esc(desc)}">` +
    `\n<meta property="og:image" content="${esc(image)}">` +
    `\n<meta property="og:image:width" content="1200">` +
    `\n<meta property="og:image:height" content="630">` +
    `\n<meta property="og:url" content="${esc(url.origin + url.pathname)}">` +
    `\n<meta name="twitter:card" content="summary_large_image">` +
    `\n<meta name="twitter:title" content="${esc(title)}">` +
    `\n<meta name="twitter:image" content="${esc(image)}">\n`;

  let html = await response.text();
  // landing-v3 carries STATIC og tags (its own direct-share preview). Crawlers
  // honour the FIRST og:title they meet, so leaving both sets in place made
  // every /take/ link preview as the generic landing card. Strip the static
  // set, then inject the slug-specific one.
  html = html.replace(/<meta\s+(?:property="og:|name="twitter:)[^>]*>\s*/g, "");
  // Inject just before </head>; if the marker is somehow missing, serve as-is.
  const out = html.includes("</head>") ? html.replace("</head>", tags + "</head>") : html;

  return new Response(out, {
    status: response.status,
    headers: response.headers,
  });
};

export const config = { path: "/take/*" };
