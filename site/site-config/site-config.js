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
        // Cache for next page load
        try {
          localStorage.setItem(cacheKey, JSON.stringify(sc));
          localStorage.setItem(tsKey, String(Date.now()));
        } catch (e) {}
      }
    })
    .catch(function () {});
  } catch (e) {}
})();

// ─── Routing backend — helper with retry for reliability ────────────────────
window.sendToRoutingBackend = function sendToRoutingBackend(opts) {
  try {
    var cfg = window.SITE_CONFIG || {};
    var base = (cfg.routingBackendUrl || '').replace(/\/+$/, '');
    if (!base) return;
    var fd = new FormData();
    fd.append('testIdentifier', cfg.testIdentifier || '');
    fd.append('skill', opts.skill || '');
    if (opts.text)    fd.append('text', opts.text);
    if (opts.caption) fd.append('caption', opts.caption);
    if (opts.file)    fd.append('file', opts.file);

    var MAX_RETRIES = 2;
    var RETRY_DELAYS = [0, 5000]; // immediate + 5s retry

    function attempt(n) {
      // Rebuild FormData on retry (streams may be consumed)
      var body = new FormData();
      body.append('testIdentifier', cfg.testIdentifier || '');
      body.append('skill', opts.skill || '');
      if (opts.text)    body.append('text', opts.text);
      if (opts.caption) body.append('caption', opts.caption);
      if (opts.file)    body.append('file', opts.file);

      fetch(base + '/send-result', { method: 'POST', body: body })
        .then(function (r) { return r.json(); })
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
(function () {
  var mode = (window.SITE_CONFIG.access || 'default').toLowerCase();
  if (mode === 'premium' || mode === 'regular') {
    try {
      sessionStorage.setItem('vipSessionAccess', 'true');
      if (mode === 'premium') {
        sessionStorage.setItem('vipPremiumAi', 'true');
      } else {
        sessionStorage.removeItem('vipPremiumAi');
      }
    } catch (e) { /* sessionStorage unavailable */ }
  }
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
