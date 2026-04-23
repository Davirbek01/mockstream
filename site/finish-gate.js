// ============================================================================
// FINISH GATE — Anti-tamper check before showing any finish modal / cert
// ============================================================================
// Strategy:
//   1. On DOMContentLoaded, call the edge function to verify that
//      window.SITE_CONFIG matches the real center data in Supabase.
//      If OK → set __FINISH_AUTHORIZED__ = true.
//      If tampered → show UNAUTHORIZED overlay, block the page.
//
//   2. Install a MutationObserver that watches the finish / results modals.
//      If any attempt is made to show them without authorization → hide them
//      and re-verify. This catches mid-session tampering (user opens DevTools
//      after the page loaded, changes SITE_CONFIG, then clicks Finish).
//
//   3. Also expose window.requireFinishGate() as a manual async check that
//      callers (e.g. PDF download buttons) can use directly.
// ============================================================================

(function () {
  if (window.__FINISH_GATE_INSTALLED__) return;
  window.__FINISH_GATE_INSTALLED__ = true;

  var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
  var EDGE   = SB_URL + '/functions/v1/authorize-finish';

  // Element IDs that represent mock/cert finish overlays across the site.
  var SHIELD_IDS = [
    'finishModal',
    'finishConfirmOverlay',
    'resultsOverlay',
    'finishOverlay'
  ];

  // --- Unauthorized block screen -------------------------------------------
  function showUnauthorized(reason, mismatches) {
    try {
      SHIELD_IDS.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) {
          el.classList.remove('show');
          el.style.display = 'none';
        }
      });
    } catch (e) {}

    var existing = document.getElementById('msFinishGateBlock');
    if (existing) return; // already shown

    var div = document.createElement('div');
    div.id = 'msFinishGateBlock';
    div.style.cssText =
      'position:fixed;inset:0;z-index:2147483647;' +
      'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'background:#b00020;color:#fff;' +
      'font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;' +
      'text-align:center;padding:24px;';

    var detail;
    if (reason === 'tamper_detected' && mismatches && mismatches.length) {
      detail = 'Tampering detected in: ' + mismatches.join(', ');
    } else if (reason === 'unknown_center') {
      detail = 'This center is not registered.';
    } else if (reason === 'inactive_center') {
      detail = 'This center is currently inactive.';
    } else if (reason === 'missing_center') {
      detail = 'Missing center identifier.';
    } else if (reason === 'blocked_ip') {
      detail = 'This IP address has been blocked.';
    } else if (reason === 'network') {
      detail = 'Could not reach the authorization server. Check your connection and try again.';
    } else {
      detail = 'Access denied.';
    }

    div.innerHTML =
      '<div style="font-size:80px;margin-bottom:16px;">\u26D4</div>' +
      '<h1 style="font-size:28px;font-weight:800;margin:0 0 12px;letter-spacing:.5px;">UNAUTHORIZED</h1>' +
      '<p style="font-size:16px;margin:0 0 8px;max-width:480px;line-height:1.5;">' + detail + '</p>' +
      '<p style="font-size:13px;margin:20px 0 0;opacity:.85;">This incident has been logged.</p>' +
      '<div style="margin-top:28px;">' +
        '<button id="msFinishGateClose" style="padding:10px 22px;font-size:14px;border-radius:8px;' +
        'border:2px solid #fff;background:transparent;color:#fff;cursor:pointer;font-weight:600;">Close</button>' +
      '</div>';
    (document.body || document.documentElement).appendChild(div);
    try { document.body.style.overflow = 'hidden'; } catch (e) {}

    var btn = document.getElementById('msFinishGateClose');
    if (btn) btn.addEventListener('click', function () {
      try { location.href = '/'; } catch (e) {}
    });
  }

  // --- Core verification call ----------------------------------------------
  var inFlight = null;   // dedupe concurrent calls
  var lastSnapshot = ''; // re-verify when SITE_CONFIG changes

  function snapshot() {
    var cfg = window.SITE_CONFIG || {};
    return [
      (window.__CENTER_ID || ''),
      cfg.brandName      || '',
      cfg.testIdentifier || '',
      cfg.logoUrl        || '',
      cfg.directorName   || ''
    ].join('|');
  }

  async function verify() {
    var cfg = window.SITE_CONFIG || {};
    var centerId = (window.__CENTER_ID || '').toString().trim();

    var payload = {
      brandName:      cfg.brandName      || '',
      testIdentifier: cfg.testIdentifier || '',
      logoUrl:        cfg.logoUrl        || '',
      directorName:   cfg.directorName   || ''
    };

    try {
      var r = await fetch(EDGE, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'apikey':        SB_KEY,
          'Authorization': 'Bearer ' + SB_KEY,
          'x-ms-center':   centerId
        },
        body: JSON.stringify(payload)
      });
      var j = {};
      try { j = await r.json(); } catch (e) { j = {}; }

      if (!r.ok || !j.ok) {
        window.__FINISH_AUTHORIZED__ = false;
        showUnauthorized(j.error || 'denied', j.mismatches || []);
        return { ok: false, reason: j.error || 'denied' };
      }

      // Defence-in-depth: overwrite SITE_CONFIG with server-trusted values.
      if (j.data && typeof j.data === 'object') {
        try { Object.assign(window.SITE_CONFIG, j.data); } catch (e) {}
        try {
          window._siteLogoUrl     = window.SITE_CONFIG.logoUrl;
          window._siteLogoWording = window.SITE_CONFIG.brandName;
          window._siteTestId      = window.SITE_CONFIG.testIdentifier;
        } catch (e) {}
      }
      window.__FINISH_AUTHORIZED__ = true;
      lastSnapshot = snapshot();
      return { ok: true, data: j.data || {} };
    } catch (e) {
      window.__FINISH_AUTHORIZED__ = false;
      showUnauthorized('network');
      return { ok: false, reason: 'network' };
    }
  }

  // Re-run verify whenever caller asks; re-verify if the snapshot changed
  // (catches mid-session tampering with SITE_CONFIG).
  window.mockFinishGate = function mockFinishGate() {
    if (window.__FINISH_AUTHORIZED__ === true && snapshot() === lastSnapshot) {
      return Promise.resolve({ ok: true });
    }
    if (inFlight) return inFlight;
    inFlight = verify().finally(function () { inFlight = null; });
    return inFlight;
  };

  window.requireFinishGate = async function requireFinishGate() {
    var g = await window.mockFinishGate();
    return !!(g && g.ok);
  };

  // --- MutationObserver: auto-block unauthorized modals --------------------
  function looksVisible(el) {
    if (!el) return false;
    if (el.classList && el.classList.contains('show')) return true;
    var st = el.style || {};
    if (st.display && st.display !== 'none') return true;
    return false;
  }

  function installObserver() {
    try {
      var obs = new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var m = muts[i];
          if (m.type !== 'attributes') continue;
          var el = m.target;
          if (!el || !el.id || SHIELD_IDS.indexOf(el.id) < 0) continue;
          if (!looksVisible(el)) continue;

          // If not yet authorized OR the snapshot changed → hide + re-verify.
          if (window.__FINISH_AUTHORIZED__ !== true || snapshot() !== lastSnapshot) {
            (function (target) {
              try { target.classList.remove('show'); } catch (e) {}
              try { target.style.display = 'none'; } catch (e) {}
              window.mockFinishGate().then(function (g) {
                if (g && g.ok) {
                  // Auth succeeded — re-show the modal with trusted data.
                  try { target.classList.add('show'); } catch (e) {}
                  try { target.style.display = ''; } catch (e) {}
                }
                // else: showUnauthorized() already invoked inside verify()
              });
            })(el);
          }
        }
      });
      obs.observe(document.documentElement, {
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });
    } catch (e) {}
  }

  // --- Kick-off ------------------------------------------------------------
  // We must wait for site-config.js to populate SITE_CONFIG from Supabase,
  // otherwise the eager verify runs against the hardcoded Mock Stream
  // defaults and mismatches for every non-Mock-Stream clone.
  function boot() {
    installObserver();

    var fired = false;
    function runOnce() {
      if (fired) return;
      fired = true;
      window.mockFinishGate();
    }

    if (window.__SITE_CONFIG_READY__ === true) {
      runOnce();
    } else {
      document.addEventListener('ms:config-ready', runOnce, { once: true });
      // Safety net — if site-config never fires the event (old cached page,
      // offline, etc.) verify after a generous timeout so gate still runs.
      setTimeout(runOnce, 4000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
