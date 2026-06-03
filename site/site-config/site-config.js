// ============================================================================
// SITE CONFIG — Dynamic (Supabase-backed)
// ============================================================================
// Reads center identity from center-id.js (window.__CENTER_ID).
// Loads config from localStorage cache (instant), refreshes from Supabase
// in the background. Falls back to hardcoded Mock Stream defaults.
// ============================================================================

// ─── Defaults (Mock Stream) — used until cache/fetch populates ──────────────
window.SITE_CONFIG = {
  pwaFolder:            'site-config',
  brandName:            'Mock Stream',
  testIdentifier:       'mock_stream',
  logoUrl:              'https://i.ibb.co/WN0XY5Lv/logo.png',
  heading1:             'Bilim va malakalarni baholash agentligi',
  heading2:             'Chet tilini bilish darajasi',
  telegramChannel:      '@mock_stream',
  telegramUrl:          'https://t.me/mock_stream',
  ieltsTelegramChannel: '@ieltsmockstream',
  adminTelegram:        'https://t.me/mrkhasanoff3',
  directorName:         'D. KHASANOV',
  directorFullName:     'Davirbek Khasanov',
  directorTitle:        'Direktor | Director',
  ceoTitle:             'CEO of Mock Stream Inc.',
  siteDomain:           'mockstream.site',
  backendUrl:           'https://davirbek.alwaysdata.net',
  adminBackendUrl:      'https://admin0709.alwaysdata.net',
  routingBackendUrl:    'https://u-se-r.alwaysdata.net',
  access:               'default',
  scoreBoost:           1,
  // Full-screen IELTS Reading picker (replaces the popup categoryModal).
  // Set to false to revert instantly with no redeploy.
  useNewIeltsReadingPicker: true,
  // Full-screen CEFR Reading picker (same flow as IELTS, 5-part cards).
  // Set to false to revert to the popup categoryModal without redeploy.
  useNewCefrReadingPicker: true,
};

// ─── Load from localStorage cache (synchronous — instant) ───────────────────
(function () {
  var centerId = window.__CENTER_ID || 'mock_stream';
  // Also store it for other code that needs the active center
  try { localStorage.setItem('ms_active_center', centerId); } catch (e) {}

  var cacheKey = 'ms_sc_' + centerId;
  var tsKey = 'ms_sc_ts_' + centerId;
  var CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Try to load from cache
  try {
    var cached = localStorage.getItem(cacheKey);
    var cachedTs = parseInt(localStorage.getItem(tsKey) || '0', 10);
    if (cached && (Date.now() - cachedTs < CACHE_TTL)) {
      var sc = JSON.parse(cached);
      window.SITE_CONFIG = Object.assign(window.SITE_CONFIG, sc);
    }
  } catch (e) {}

  // Background refresh from Supabase
  var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
  try {
    fetch(SB_URL + '/rest/v1/site_settings?key=eq.center_site_config_' +
      encodeURIComponent(centerId) + '&select=value', {
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
    })
    .then(function (r) { return r.json(); })
    .then(function (rows) {
      if (rows && rows.length && rows[0].value) {
        var sc = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
        // Update SITE_CONFIG in place (keeps reference alive for all code)
        Object.assign(window.SITE_CONFIG, sc);
        // Update legacy globals
        window._siteLogoUrl = window.SITE_CONFIG.logoUrl;
        window._siteLogoWording = window.SITE_CONFIG.brandName;
        window._siteTestId = window.SITE_CONFIG.testIdentifier;
        window._siteTelegramChannel = window.SITE_CONFIG.telegramChannel;
        // Update page title & favicon
        try { document.title = window.SITE_CONFIG.brandName; } catch (e) {}
        try {
          var fav = document.getElementById('site-favicon');
          if (fav) fav.href = window.SITE_CONFIG.logoUrl;
        } catch (e) {}
        // Update splash/welcome screen elements (index.html)
        try {
          var bl = document.getElementById('brandTitle');
          if (bl) bl.textContent = window.SITE_CONFIG.brandName;
          var lo = document.getElementById('logo');
          if (lo) lo.src = window.SITE_CONFIG.logoUrl;
          var fc = document.getElementById('footerCopyright');
          if (fc) fc.innerHTML = '&copy; ' + new Date().getFullYear() + ' ' + window.SITE_CONFIG.brandName + '. All rights reserved.';
          var ncb = document.getElementById('nameCardBrand');
          if (ncb) ncb.textContent = window.SITE_CONFIG.brandName;
          var ncl = document.getElementById('nameCardLogo');
          var nce = document.getElementById('nameCardEmoji');
          if (ncl && window.SITE_CONFIG.logoUrl) {
            ncl.onload  = function () { ncl.hidden = false; if (nce) nce.style.display = 'none'; };
            ncl.onerror = function () { ncl.hidden = true;  if (nce) nce.style.display = '';     };
            ncl.src = window.SITE_CONFIG.logoUrl;
          }
        } catch (e) {}
        // Update welcome logo/header elements (landing.html)
        try {
          var wl = document.getElementById('welcomeLogo');
          if (wl) wl.src = window.SITE_CONFIG.logoUrl;
          var ht = document.getElementById('headerTitle');
          if (ht) ht.textContent = window.SITE_CONFIG.brandName + ' Exams';
          var hl = document.getElementById('headerLogo');
          if (hl) hl.src = window.SITE_CONFIG.logoUrl;
        } catch (e) {}
        // Cache for next page load
        try {
          localStorage.setItem(cacheKey, JSON.stringify(sc));
          localStorage.setItem(tsKey, String(Date.now()));
        } catch (e) {}
      }
    })
    .catch(function () {})
    .finally(function () {
      // Signal to finish-gate.js (and any other listener) that SITE_CONFIG
      // is populated with server values. Fire on both success and failure
      // so the gate can always proceed.
      try {
        window.__SITE_CONFIG_READY__ = true;
        document.dispatchEvent(new Event('ms:config-ready'));
      } catch (e) {}
    });

  // ─── Also fetch the centre's AI/scoring config row (separate from
  // site-config branding above). Reads `center_config_<id>` and merges
  // specific runtime-relevant fields into SITE_CONFIG. Today: just
  // visionFactCheck. Future fields can be added to PICK below.
  // ──────────────────────────────────────────────────────────────────
  var ccCacheKey = 'ms_cc_' + centerId;
  var ccTsKey = 'ms_cc_ts_' + centerId;
  // Try cache first (instant)
  try {
    var ccCached = localStorage.getItem(ccCacheKey);
    var ccCachedTs = parseInt(localStorage.getItem(ccTsKey) || '0', 10);
    if (ccCached && (Date.now() - ccCachedTs < CACHE_TTL)) {
      var ccPick = JSON.parse(ccCached);
      Object.assign(window.SITE_CONFIG, ccPick);
    }
  } catch (e) {}
  // Background refresh
  try {
    fetch(SB_URL + '/rest/v1/site_settings?key=eq.center_config_' +
      encodeURIComponent(centerId) + '&select=value', {
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
    })
    .then(function (r) { return r.json(); })
    .then(function (rows) {
      if (rows && rows.length && rows[0].value) {
        var cc = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
        // PICK: only the AI/runtime fields the runner pages actually need.
        // Keeps SITE_CONFIG focused; admin-only fields stay in center_config.
        var picked = {
          visionFactCheck: cc.visionFactCheck === true,
          // New: which vision AI handles the pre-pass. Defaults to gemini
          // when unset so existing centres keep their current behaviour.
          visionFactCheckProvider: (cc.visionFactCheckProvider || 'gemini')
        };
        Object.assign(window.SITE_CONFIG, picked);
        try {
          localStorage.setItem(ccCacheKey, JSON.stringify(picked));
          localStorage.setItem(ccTsKey, String(Date.now()));
        } catch (e) {}
      }
    })
    .catch(function () {});
  } catch (e) {}
  } catch (e) {
    try {
      window.__SITE_CONFIG_READY__ = true;
      document.dispatchEvent(new Event('ms:config-ready'));
    } catch (_) {}
  }
})();

// ─── Routing backend — helper with retry for reliability ────────────────────
// Sends results to the Supabase `send-to-telegram` Edge Function which:
//   1. Looks up the per-center channel mapping in `site_settings`
//   2. Posts to the correct Telegram channel via Bot API
//   3. Auto-fanouts to the "general" mixed-centers channels (super-admin view)
//
// Override knobs (for testing):
//   window.__ROUTING_PROXY_BASE  – use a different Edge Function URL
//   window.__ROUTING_DIRECT=true – bypass and hit cfg.routingBackendUrl (legacy alwaysdata)
window.sendToRoutingBackend = function sendToRoutingBackend(opts) {
  try {
    var cfg = window.SITE_CONFIG || {};
    var endpoint, isLegacy = false;
    if (window.__ROUTING_DIRECT) {
      var legacyBase = (cfg.routingBackendUrl || '').replace(/\/+$/, '');
      if (!legacyBase) return;
      endpoint = legacyBase + '/send-result';
      isLegacy = true;
    } else {
      endpoint = (window.__ROUTING_PROXY_BASE
        || 'https://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/send-to-telegram'
      ).replace(/\/+$/, '');
    }
    // Edge Function normalizes "mock_stream" → "mockstream", but keep the
    // translation here too for legacy alwaysdata mode.
    var routingId = (cfg.testIdentifier === 'mock_stream') ? 'mockstream' : (cfg.testIdentifier || '');

    var MAX_RETRIES = 2;
    var RETRY_DELAYS = [0, 5000]; // immediate + 5s retry

    // Idempotency key: same value reused across retries so the server can
    // dedupe and avoid posting the same result twice to Telegram channels
    // when a slow/failed response triggers a retry of an already-processed
    // upload. Generated ONCE per submission (outside attempt()).
    var idemKey = (function () {
      try {
        if (window.crypto && typeof window.crypto.randomUUID === 'function') {
          return window.crypto.randomUUID();
        }
      } catch (_) {}
      return 'idem-' + Date.now().toString(36) + '-' +
             Math.random().toString(36).slice(2, 10) + '-' +
             Math.random().toString(36).slice(2, 10);
    })();

    function attempt(n) {
      // Rebuild FormData on retry (streams may be consumed)
      var body = new FormData();
      body.append('testIdentifier', routingId);
      body.append('skill', opts.skill || '');
      body.append('idempotency_key', idemKey);
      if (opts.text)    body.append('text', opts.text);
      if (opts.caption) body.append('caption', opts.caption);
      if (opts.file)    body.append('file', opts.file);

      fetch(endpoint, { method: 'POST', body: body })
        .then(function (r) {
          return r.json().catch(function () {
            return { ok: false, error: 'HTTP ' + r.status + ' (non-JSON response)' };
          });
        })
        .then(function (d) {
          if (d.ok) {
            console.log('[Routing] \u2705 Sent to', d.routedTo && d.routedTo.title, n > 0 ? '(retry ' + n + ')' : '');
          } else {
            console.warn('[Routing] \u26a0\ufe0f', d.error);
            if (n < MAX_RETRIES - 1) {
              console.log('[Routing] Retrying in ' + (RETRY_DELAYS[n + 1] / 1000) + 's...');
              setTimeout(function () { attempt(n + 1); }, RETRY_DELAYS[n + 1]);
            }
          }
        })
        .catch(function (e) {
          console.warn('[Routing] fetch failed (attempt ' + (n + 1) + '):', e);
          if (n < MAX_RETRIES - 1) {
            console.log('[Routing] Retrying in ' + (RETRY_DELAYS[n + 1] / 1000) + 's...');
            setTimeout(function () { attempt(n + 1); }, RETRY_DELAYS[n + 1]);
          }
        });
    }

    attempt(0);
  } catch (e) { console.warn('[Routing] error:', e); }
};

// ─── Seed legacy window._site* globals ───────────────────────────────────────
// Many existing pages use  window._siteLogoUrl || 'fallback'  etc.
// Pre-populating these means all those fallbacks resolve from this config.
window._siteLogoUrl         = window.SITE_CONFIG.logoUrl;
window._siteLogoWording     = window.SITE_CONFIG.brandName;
window._siteTestId          = window.SITE_CONFIG.testIdentifier;
window._siteTelegramChannel = window.SITE_CONFIG.telegramChannel;

// ─── VIP Access Policy auto-activation ───────────────────────────────────────
// SECURITY: We do NOT trust SITE_CONFIG.access alone — a hacker could edit the
// localStorage cache to set it to 'premium'. Instead we call the server's
// verify-passcode function with no code; the server checks centers.premium_mode
// (RLS-protected, anon-write blocked) and only mints a signed token when the
// DB says the center is genuinely in premium mode. Tampered cache = no token =
// no unlock (the page-load validator in landing.html clears the flag).
(function () {
  var mode = (window.SITE_CONFIG.access || 'default').toLowerCase();
  if (mode !== 'premium' && mode !== 'regular') return;

  // Skip if a valid token is already stored.
  try { if (sessionStorage.getItem('vipToken')) return; } catch (_e) {}

  var centerId = (window.SITE_CONFIG.testIdentifier || 'mock_stream').replace(/_/g, '');
  var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';

  fetch(SB_URL + '/functions/v1/verify-passcode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY },
    body: JSON.stringify({ center: centerId })
  }).then(function (r) { return r.json(); }).then(function (data) {
    if (data && data.access && typeof data.token === 'string' && data.token.length > 20) {
      try {
        sessionStorage.setItem('vipToken', data.token);
        sessionStorage.setItem('vipSessionAccess', 'true');
        if (mode === 'premium' || data.role === 'premium') {
          sessionStorage.setItem('vipPremiumAi', 'true');
        }
      } catch (_e) {}
    }
    // If server returns access:false, the cache was tampered with (or the
    // center is no longer in premium mode). Do not unlock anything.
  }).catch(function () { /* silent — visitor stays locked, can enter code manually */ });
})();

// --- Center Guard --- auto-load enforcement layer ---
(function () {
  var scripts = document.getElementsByTagName('script');
  var me = scripts[scripts.length - 1];
  var basePath = me.src ? me.src.substring(0, me.src.lastIndexOf('/') + 1) : 'site-config/';
  var s = document.createElement('script');
  s.src = basePath + 'center-guard.js';
  me.parentNode.insertBefore(s, me.nextSibling);
})();
