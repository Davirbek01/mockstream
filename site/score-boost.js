/* ═══════════════════════════════════════════════════════════════════════════
   score-boost.js — the per-centre raw-score boost, read from the SAME row the
   admin panel writes.
   ───────────────────────────────────────────────────────────────────────────
   Until 2026-08-22 every exam page added a boost of 1 to every raw score, for
   every centre, and no admin could see it: the value came from the hardcoded
   `scoreBoost: 1` in site-config/site-config.js. The per-centre setting DOES
   exist (`site_settings.center_config_<id>.scoreBoost`, edited in the Centers
   panel) but the only file that applied it, center-guard.js, is not loaded on
   the exam pages. So a candidate scoring 4+4+4+4 = 16 was shown 17/21 — and
   61/75 instead of 57/75 on the certificate scale. The apps, which apply no
   boost at all, disagreed with the website by a full point.

   Now: the panel's value is the truth, on the website and in both apps, and
   the built-in default is 0. Set a centre to 1 or 2 in the Centers panel and
   every platform follows.

   USE: `window.getScoreBoost()` — synchronous, safe to call at scoring time.
   The value is fetched at page load (and served from the same localStorage
   cache the other centre-config readers use), so by the time an exam is
   submitted it is already known. Anything unexpected reads as 0.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';

  function centreId() {
    return ((window.SITE_CONFIG && window.SITE_CONFIG.testIdentifier) ||
            window.__CENTER_ID || 'mock_stream').toString().trim();
  }

  /** Only a real number counts, and only within the range the panel offers.
   *  A missing key, a string or a stray 99 must never reach a student's score. */
  function fromCfg(cfg) {
    if (!cfg || typeof cfg.scoreBoost !== 'number' || !isFinite(cfg.scoreBoost)) return null;
    return Math.max(0, Math.min(3, Math.round(cfg.scoreBoost)));
  }

  window.getScoreBoost = function () {
    var live = fromCfg(window._centerConfig);        // fetched by the AI-provider lookup
    if (live !== null) return live;
    if (typeof window.__scoreBoost === 'number') return window.__scoreBoost;
    var s = window.SITE_CONFIG && window.SITE_CONFIG.scoreBoost;
    return (typeof s === 'number' && isFinite(s)) ? Math.max(0, Math.min(3, Math.round(s))) : 0;
  };

  // 1. Whatever a previous page already fetched — instant, works offline.
  try {
    var cached = JSON.parse(localStorage.getItem('cg_cc_' + centreId()) || 'null');
    var v = fromCfg(cached);
    if (v !== null) window.__scoreBoost = v;
  } catch (e) { /* a corrupt cache is not worth a crash */ }

  // 2. The current value, in the background. Scoring happens minutes later.
  try {
    fetch(SB_URL + '/rest/v1/site_settings?key=eq.' +
          encodeURIComponent('center_config_' + centreId()) + '&select=value',
          { headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (rows) {
        if (!rows || !rows.length || !rows[0].value) return;
        var cfg = (typeof rows[0].value === 'string') ? JSON.parse(rows[0].value) : rows[0].value;
        var val = fromCfg(cfg);
        if (val !== null) window.__scoreBoost = val;
        if (!window._centerConfig) window._centerConfig = cfg;
        try { localStorage.setItem('cg_cc_' + centreId(), JSON.stringify(cfg)); } catch (e2) {}
      })
      .catch(function () { /* keep whatever the cache gave us */ });
  } catch (e) { /* fetch missing is not a scoring problem */ }
})();
