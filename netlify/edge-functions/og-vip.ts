// og-vip — Open Graph tags for the /vip deep link.
// ----------------------------------------------------------------------------
// /vip and /vip/<code> are rewritten to landing-v3.html (see site/_redirects),
// which opens the Profile tab with the code box focused — and the code filled
// in when the link carries one. Shared in Telegram those links previewed as
// bare text, so this injects the gold VIP cover the same way og-take does for
// mock links: let the rewrite happen, then rewrite the <head> of its response.
//
// The CODE IS NEVER PUT IN THE PREVIEW. A Telegram card is visible to everyone
// in the chat and is cached by Telegram's servers; the title stays generic so a
// forwarded preview cannot hand the code to someone the teacher did not give it
// to. The code travels only in the URL, where it belongs.

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

export default async (request: Request, context: { next: () => Promise<Response> }) => {
  const response = await context.next();

  const type = response.headers.get("content-type") || "";
  if (!response.ok || !type.includes("text/html")) return response;

  const url = new URL(request.url);
  const title = "Activate your VIP access";
  const desc = "Tap to open the code box — then every mock, transcript and AI report is unlocked.";
  const image = `${url.origin}/og/vip.png`;

  const tags =
    `\n<meta property="og:type" content="website">` +
    `\n<meta property="og:title" content="${esc(title)}">` +
    `\n<meta property="og:description" content="${esc(desc)}">` +
    `\n<meta property="og:image" content="${esc(image)}">` +
    `\n<meta property="og:image:width" content="1200">` +
    `\n<meta property="og:image:height" content="630">` +
    // The path, not the query: og:url is what a crawler canonicalises to, and
    // it has no business carrying an access code.
    `\n<meta property="og:url" content="${esc(url.origin + "/vip")}">` +
    `\n<meta name="twitter:card" content="summary_large_image">` +
    `\n<meta name="twitter:title" content="${esc(title)}">` +
    `\n<meta name="twitter:image" content="${esc(image)}">\n`;

  let html = await response.text();
  // landing-v3 carries its own static og tags; crawlers honour the first set
  // they meet, so the static ones go before ours are injected.
  html = html.replace(/<meta\s+(?:property="og:|name="twitter:)[^>]*>\s*/g, "");
  const out = html.includes("</head>") ? html.replace("</head>", tags + "</head>") : html;

  return new Response(out, { status: response.status, headers: response.headers });
};

export const config = { path: "/vip*" };
