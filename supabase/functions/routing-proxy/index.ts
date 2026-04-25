// =====================================================================
// Supabase Edge Function: routing-proxy
// ---------------------------------------------------------------------
// The routing backend at https://u-se-r.alwaysdata.net does NOT allow
// CORS from mock-stream.com / *.netlify.app — so the browser's POST is
// blocked before it even reaches the server. This Edge Function takes
// the same multipart/form-data POST and forwards it server-side, where
// CORS does not apply. Response (status + body) is returned unchanged.
//
// Path scheme:
//   /functions/v1/routing-proxy/<rest-of-path>
//     →  https://u-se-r.alwaysdata.net/<rest-of-path>
//
// Deploy:
//   supabase functions deploy routing-proxy --no-verify-jwt
// =====================================================================

const UPSTREAM = 'https://u-se-r.alwaysdata.net';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age':       '86400',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  try {
    const url = new URL(req.url);
    // Strip the function-mount prefix so we can map to upstream path.
    // Supabase routes are: /functions/v1/routing-proxy/<rest>
    const m = url.pathname.match(/\/routing-proxy(\/.*)?$/);
    const restPath = (m && m[1]) || '/';
    const target = UPSTREAM + restPath + (url.search || '');

    // Forward as-is. Body is a stream (multipart/form-data with the zip).
    const upstreamResp = await fetch(target, {
      method: req.method,
      headers: (() => {
        // Drop hop-by-hop and Supabase auth headers; keep content-type so
        // the multipart boundary is preserved.
        const h = new Headers();
        const ct = req.headers.get('content-type');
        if (ct) h.set('content-type', ct);
        const cl = req.headers.get('content-length');
        if (cl) h.set('content-length', cl);
        return h;
      })(),
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
      // @ts-ignore Deno-specific option for streaming bodies
      duplex: 'half',
    });

    // Mirror status + body. Add CORS headers so the browser accepts it.
    const respHeaders = new Headers(CORS);
    const upCt = upstreamResp.headers.get('content-type');
    if (upCt) respHeaders.set('content-type', upCt);

    return new Response(upstreamResp.body, {
      status: upstreamResp.status,
      headers: respHeaders,
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: 'routing-proxy: ' + (e && (e as Error).message) }),
      { status: 502, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }
});
