// ============================================================================
// SITE CONFIG — Niners Academy
// ============================================================================
// Single source of truth for all branding, URLs, and identity settings.
// Load this file via <script src="site config/niners academy/site-config.js">
// BEFORE any other scripts so window.SITE_CONFIG is available everywhere.
// ============================================================================

window.SITE_CONFIG = {

  // ─── PWA / Clone folder ─────────────────────────────────────────────────────
  pwaFolder:        'site-config/4. niners academy',

  // ─── Brand Identity ────────────────────────────────────────────────────────
  brandName:        'Niners Academy',
  testIdentifier:   'niners',
  logoUrl:          'https://i.ibb.co/39jVLp1w/image.png',
  heading1:         'Speaking and Writing mock platform',
  heading2:         'Niners Academy - More than Knowledge',

  // ─── Telegram ──────────────────────────────────────────────────────────────
  telegramChannel:      '@mock_stream',
  telegramUrl:          'https://t.me/mock_stream',
  ieltsTelegramChannel: '@ieltsmockstream',
  adminTelegram:        'https://t.me/mrkhasanoff3',

  // ─── Certificate / PDF ─────────────────────────────────────────────────────
  directorName:     'D. KHASANOV',
  directorFullName: 'Davirbek Khasanov',
  directorTitle:    'Direktor | Director',
  ceoTitle:         'CEO of Niners Academy',
  siteDomain:       'mockstream.site',

  // ─── Backend ───────────────────────────────────────────────────────────────
  backendUrl:         'https://davirbek.alwaysdata.net',
  adminBackendUrl:    'https://admin0709.alwaysdata.net',
  routingBackendUrl:  'https://u-se-r.alwaysdata.net',

  access:             'default',

  // ─── AI Score Boost (temporary) ────────────────────────────────────────────
  // Gemini tends to score strictly. Set a number (0-3) to add to AI-graded
  // speaking & writing scores. 0 = no boost. Affects CEFR & IELTS mocks.
  scoreBoost:         1,
};

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

    var FALLBACK_BASE = 'https://davirbek.alwaysdata.net';

    function buildBody() {
      var body = new FormData();
      body.append('testIdentifier', cfg.testIdentifier || '');
      body.append('skill', opts.skill || '');
      if (opts.text)    body.append('text', opts.text);
      if (opts.caption) body.append('caption', opts.caption);
      if (opts.file)    body.append('file', opts.file);
      return body;
    }

    function attemptFallback() {
      if (base === FALLBACK_BASE) return;
      console.log('[Routing] Trying fallback backend...');
      fetch(FALLBACK_BASE + '/send-result', { method: 'POST', body: buildBody() })
        .then(function(r) { return r.json(); })
        .then(function(d) {
          if (d.ok) console.log('[Routing] \u2705 Sent via fallback backend');
          else console.warn('[Routing] fallback also failed:', d.error);
        })
        .catch(function(e) { console.warn('[Routing] fallback fetch failed:', e); });
    }

    function attempt(n) {
      fetch(base + '/send-result', { method: 'POST', body: buildBody() })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d.ok) {
            console.log('[Routing] \u2705 Sent to', d.routedTo && d.routedTo.title, n > 0 ? '(retry ' + n + ')' : '');
          } else {
            console.warn('[Routing] \u26a0\ufe0f', d.error);
            if (n < MAX_RETRIES - 1) {
              console.log('[Routing] Retrying in ' + (RETRY_DELAYS[n + 1] / 1000) + 's...');
              setTimeout(function () { attempt(n + 1); }, RETRY_DELAYS[n + 1]);
            } else { attemptFallback(); }
          }
        })
        .catch(function (e) {
          console.warn('[Routing] fetch failed (attempt ' + (n + 1) + '):', e);
          if (n < MAX_RETRIES - 1) {
            console.log('[Routing] Retrying in ' + (RETRY_DELAYS[n + 1] / 1000) + 's...');
            setTimeout(function () { attempt(n + 1); }, RETRY_DELAYS[n + 1]);
          } else { attemptFallback(); }
        });
    }

    attempt(0);
  } catch (e) { console.warn('[Routing] error:', e); }
};

// ─── Seed legacy window._site* globals ───────────────────────────────────────
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
