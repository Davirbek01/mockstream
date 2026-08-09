// og-flashcards — Open Graph tags for shared flashcard-set links.
// ----------------------------------------------------------------------------
// Learn cards share /flashcards.html?topic=<slug> (e.g.
// "appearance-fashion-advanced"). All 507 sets store a real title
// ("👗 Clothes & Fashion: Advanced"), fetched ONLY for preview crawlers —
// same crawler-gating as og-articles, so student page loads pay nothing.
// Fallback title = humanised slug. Same transform pattern as the other
// og-* functions: context.next() + strip stale tags + inject.

const SB_KEY = "sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

/** "appearance-fashion-upper-intermediate" → "Appearance Fashion (Upper Intermediate)" */
export function humanise(slug: string): string {
  let level = "";
  let s = slug.toLowerCase();
  const lv = s.match(/-(beginner|elementary|pre-intermediate|intermediate|upper-intermediate|advanced)$/);
  if (lv) { level = lv[1]; s = s.slice(0, -lv[0].length); }
  const cap = (w: string) => w[0].toUpperCase() + w.slice(1);
  let out = s.split("-").filter(Boolean).map(cap).join(" ");
  if (level) out += ` (${level.split("-").map(cap).join(" ")})`;
  return out;
}

export default async (request: Request, context: { next: () => Promise<Response> }) => {
  const response = await context.next();
  const type = response.headers.get("content-type") || "";
  if (!response.ok || !type.includes("text/html")) return response;

  const url = new URL(request.url);
  const topic = (url.searchParams.get("topic") || "").trim();

  let title = "Vocabulary Flashcards";
  const image = `${url.origin}/og/flashcards.png`;
  if (/^[a-z0-9-]{1,60}$/i.test(topic)) {
    title = `Flashcards · ${humanise(topic)}`;
    if (/telegram|whatsapp|facebookexternalhit|twitterbot|linkedin|slack|discord|skypeuripreview|viber|vkshare/i
        .test(request.headers.get("user-agent") || "")) {
      try {
        const ac = new AbortController();
        const timer = setTimeout(() => ac.abort(), 1500);
        const r = await fetch(
          "https://zknyukkbtbcqgvkgjktb.supabase.co/rest/v1/mock_tests" +
            `?select=title:mock_data->>title` +
            `&mock_type=eq.flashcard&status=eq.published` +
            `&mock_data->>slug=eq.${encodeURIComponent(topic.toLowerCase())}&limit=1`,
          { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }, signal: ac.signal },
        );
        clearTimeout(timer);
        if (r.ok) {
          const rows = await r.json();
          if (rows && rows[0] && rows[0].title) title = rows[0].title;
        }
      } catch (_e) { /* humanised slug stands */ }
    }
  }
  const desc = "Flip-card vocabulary with term audio — study on web or in the app.";

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

// Pretty URLs 301s /flashcards.html -> /flashcards: bind BOTH (og-articles trap).
export const config = { path: ["/flashcards", "/flashcards.html"] };
