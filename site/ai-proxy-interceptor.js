/* =====================================================================
 * ai-proxy-interceptor.js
 * ---------------------------------------------------------------------
 * Wraps window.fetch so any direct call to a known AI-provider URL is
 * transparently rewritten to go through our Supabase Edge Function
 * (ai-proxy), which holds the real API keys server-side.
 *
 * Drop this <script> in <head> of any page that talks to AI providers.
 * NO other code changes required — existing fetch calls keep working.
 *
 * Required globals:
 *   window.__CENTER_ID  (set by site/center-id.js)
 * Optional override:
 *   window.__AI_PROXY_BASE  (defaults to project URL + /functions/v1/ai-proxy)
 * ===================================================================== */
(function () {
  'use strict';
  if (window.__AI_PROXY_INSTALLED__) return;
  window.__AI_PROXY_INSTALLED__ = true;

  var PROXY_BASE = window.__AI_PROXY_BASE
    || 'https://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/ai-proxy';

  // host → provider slug used by the Edge Function path
  var HOST_MAP = {
    'generativelanguage.googleapis.com': 'gemini',
    'api.openai.com':                    'openai',
    'api.anthropic.com':                 'claude',
    'api.x.ai':                          'grok',       // xAI Grok (text)
    'api.deepseek.com':                  'deepseek',
    'api.assemblyai.com':                'assemblyai',
    'api.groq.com':                      'groq'        // Groq Whisper (audio→text)
  };

  var origFetch = window.fetch.bind(window);

  function rewriteUrl(input) {
    try {
      var raw = (typeof input === 'string') ? input
              : (input && input.url) ? input.url
              : null;
      if (!raw) return null;
      // Only rewrite absolute URLs to known providers
      if (!/^https?:\/\//i.test(raw)) return null;
      var u = new URL(raw);
      var provider = HOST_MAP[u.hostname];
      if (!provider) return null;
      // Build new URL: PROXY_BASE/<provider><pathname><search>
      // pathname already starts with '/'
      var newUrl = PROXY_BASE + '/' + provider + u.pathname + u.search;
      return newUrl;
    } catch (_e) { return null; }
  }

  function stripProviderAuthHeaders(h) {
    // Don't leak the (now-invalid) client-side keys upstream.
    // Edge Function injects the real key.
    try {
      if (h && typeof h.delete === 'function') {
        h.delete('authorization');
        h.delete('Authorization');
        h.delete('x-api-key');
        h.delete('X-Api-Key');
        h.delete('anthropic-version');
      } else if (h && typeof h === 'object') {
        delete h.Authorization; delete h.authorization;
        delete h['x-api-key']; delete h['X-Api-Key'];
        delete h['anthropic-version'];
      }
    } catch (_e) {}
    return h;
  }

  window.fetch = function (input, init) {
    // Short-circuit the dead legacy browser key-fetch. Older pages still call
    // davirbek.alwaysdata.net/key?model=<provider> to grab a raw client-side
    // key before making the AI call. That host is retired and now throws
    // ("Failed to fetch"), aborting grading. The real key is injected
    // server-side by ai-proxy, so any non-empty stub key lets the page proceed.
    try {
      var _raw = (typeof input === 'string') ? input : (input && input.url) ? input.url : '';
      if (/(?:^|\/\/)[^/]*alwaysdata\.net\/key\b/.test(_raw)) {
        return Promise.resolve(new Response(
          JSON.stringify({ key: 'via-ai-proxy' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        ));
      }
    } catch (_e) {}

    var newUrl = rewriteUrl(input);
    if (!newUrl) return origFetch(input, init);

    // Build a fresh init so we can attach our gating headers
    var nextInit = init ? Object.assign({}, init) : {};
    var headers  = new Headers(nextInit.headers || (input && input.headers) || {});
    stripProviderAuthHeaders(headers);
    headers.set('x-ms-center', String(window.__CENTER_ID || ''));

    // Per-center Gemini billing-slot override. Set on the request only when
    // the upstream is Gemini. Priority: a thread-local __geminiPlanOverride
    // (used by speaking-mock transcription helpers) > center config.
    try {
      if (newUrl.indexOf('/gemini/') !== -1) {
        var plan = '';
        try { plan = String(window.__geminiPlanOverride || '').trim().toLowerCase(); } catch (e) {}
        if (!plan) {
          try {
            var cc = window._centerConfig;
            if (cc && cc.geminiPlan) plan = String(cc.geminiPlan).trim().toLowerCase();
          } catch (e) {}
        }
        if (plan && plan !== 'default') headers.set('x-ms-gemini-plan', plan);
      }
    } catch (_e) {}
    try {
      var _sn = '';
      try { _sn = sessionStorage.getItem('CANDIDATE_FULL_NAME') || ''; } catch (e) {}
      if (!_sn) { try { _sn = localStorage.getItem('ms_candidate_name') || ''; } catch (e) {} }
      if (_sn) headers.set('x-ms-student', String(_sn).slice(0, 120));
    } catch (_e) {}
    // Email of signed-in user (Google) — more reliable than name for per-student tracking.
    try {
      var _em = '';
      try {
        var _u = window.MockStream && window.MockStream.auth && window.MockStream.auth.getCurrentUser
                  ? window.MockStream.auth.getCurrentUser() : null;
        if (_u && _u.email) _em = _u.email;
      } catch (e) {}
      if (!_em) { try { _em = localStorage.getItem('ms_user_email') || ''; } catch (e) {} }
      if (_em) headers.set('x-ms-email', String(_em).slice(0, 160));
    } catch (_e) {}
    // Per-page skill hint so the proxy can apply Plus-mode toggle gating.
    // Pages set window.__MS_SKILL_HINT once near the top (e.g. 'writing-plus').
    try {
      var _sh = '';
      try { _sh = String(window.__MS_SKILL_HINT || '').trim(); } catch (_e) {}
      if (_sh) headers.set('x-ms-skill', _sh.slice(0, 32));
    } catch (_e) {}
    nextInit.headers = headers;

    // Preserve method/body when input was a Request object
    if (typeof input !== 'string' && input && input.url) {
      if (!nextInit.method) nextInit.method = input.method;
      if (nextInit.body == null && input.method !== 'GET' && input.method !== 'HEAD') {
        // Clone body lazily
        try { nextInit.body = input.clone().body; } catch (_e) {}
      }
    }

    // ── "Which AI actually ran" badge ─────────────────────────────────
    // Scoring pages render #_aiProviderBadge with the PROVIDER only (e.g.
    // "GROQ"). Hosts like Groq serve many different models, so the provider
    // alone never says whether Qwen or Llama did the scoring. Every provider
    // request funnels through this wrapper, so take the provider from the
    // rewritten URL and the model from the outgoing body and show
    // "GROQ · qwen3.6-27b". Doing it here means it works on every page and
    // stays correct for models added later — no per-page edits.
    // Cosmetic only, fully guarded: it must never affect the request.
    try {
      var _bodyStr = (typeof nextInit.body === 'string') ? nextInit.body : '';
      if (_bodyStr && _bodyStr.charAt(0) === '{') {
        var _mm = /"model"\s*:\s*"([^"]+)"/.exec(_bodyStr);
        var _pm = /\/ai-proxy\/([a-z0-9_-]+)\//i.exec(newUrl);
        // Skip the transcriber — it's a separate model from the scorer and
        // would otherwise overwrite the label mid-run.
        if (_mm && _pm && !/whisper/i.test(_mm[1])) {
          var _short = String(_mm[1])
            .replace(/^[^/]+\//, '')                              // drop org prefix: qwen/… meta-llama/…
            .replace(/-(versatile|instruct|latest|preview)$/i, ''); // drop marketing suffixes
          var _label = _pm[1].toUpperCase() + ' · ' + _short;
          var _badge = document.getElementById('_aiProviderBadge');
          // Text only — leave the page's own show/fade timing alone.
          if (_badge) _badge.textContent = '\u{1F916} AI: ' + _label;
          console.log('%c[AI] ' + _label, 'color:#fff;background:#0f766e;padding:2px 8px;border-radius:4px;font-weight:bold');
        }
      }
    } catch (_e) {}

    return origFetch(newUrl, nextInit);
  };
})();
