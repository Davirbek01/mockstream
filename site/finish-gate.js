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

// ============================================================================
// SIGN-IN GATE — a mock may only be opened by a signed-in account
// ============================================================================
// Guest mode is gone. Until now ~41% of attempts came from people the platform
// could not identify at all, which made every per-student rule impossible: a
// shared premium account or VIP code was indistinguishable from one student
// working hard, and the only fallback identifier was the IP — which a whole
// centre shares.
//
// The check runs at page load, NOT at submit. A student who finds out after
// forty minutes of work that they cannot continue has lost the forty minutes;
// that is the one outcome worth designing against.
//
// This is a UX gate, not a security boundary — it runs in the browser and can
// be bypassed there, like every client-side check. It exists so the ordinary
// path produces an identified student.
// ============================================================================
(function () {
  if (window.__MS_SIGNIN_GATE__) return;
  window.__MS_SIGNIN_GATE__ = true;

  // auth.js is NOT loaded on exam pages, so isSignedIn() does not exist here.
  // The session lives in localStorage under the storageKey auth.js configures.
  // Presence of a token is enough: we deliberately do NOT check expiry, because
  // an expired access token with a refresh token is still a real account and
  // auth.js renews it on the next page that loads it. Blocking those would sign
  // out people who did nothing wrong.
  function hasAccountSession() {
    try {
      var raw = localStorage.getItem('ms_auth_session');
      if (!raw) return false;
      var s = JSON.parse(raw);
      if (!s || typeof s !== 'object') return false;
      return !!(s.access_token || s.refresh_token ||
                (s.currentSession && (s.currentSession.access_token || s.currentSession.refresh_token)));
    } catch (_e) {
      // Unreadable storage (private mode, a format change) must not lock the
      // whole platform out — fail open and let the page load.
      return true;
    }
  }

  function showSignInWall() {
    if (document.getElementById('msSignInWall')) return;
    // index.html already has a return-path mechanism and validates it
    // (same-origin paths starting with "/" only). Reuse it rather than
    // inventing a ?next= param it would ignore — otherwise signing in drops
    // the student on the home page and they have to find the mock again.
    try {
      localStorage.setItem('ms_oauth_next', location.pathname + location.search + location.hash);
    } catch (_e) {}
    var d = document.createElement('div');
    d.id = 'msSignInWall';
    d.style.cssText =
      'position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;' +
      'justify-content:center;background:rgba(15,23,42,.96);padding:24px;' +
      'font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;';
    d.innerHTML =
      '<div style="max-width:420px;width:100%;background:#fff;border-radius:18px;padding:32px 26px;text-align:center;">' +
        '<div style="font-size:44px;margin-bottom:10px;">🔐</div>' +
        '<h2 style="margin:0 0 10px;font-size:20px;color:#0f172a;font-weight:800;">Mok ishlash uchun tizimga kiring</h2>' +
        '<p style="margin:0 0 22px;font-size:14px;line-height:1.6;color:#475569;">' +
          'Natijalaringiz saqlanishi va barcha qurilmalaringizda ko‘rinishi uchun ' +
          'Google, Telegram yoki email orqali kiring. Bir marta kirasiz — keyin so‘ralmaydi.' +
        '</p>' +
        '<a href="index.html" style="display:block;background:linear-gradient(135deg,#2563eb,#6366f1);' +
          'color:#fff;padding:13px 22px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none;">Kirish →</a>' +
        '<a href="landing-v3.html" style="display:inline-block;margin-top:14px;font-size:13px;color:#64748b;text-decoration:underline;">Bosh sahifaga qaytish</a>' +
      '</div>' +
    '</div>';
    (document.body || document.documentElement).appendChild(d);
    try { document.documentElement.style.overflow = 'hidden'; } catch (_e) {}
  }

  if (!hasAccountSession()) {
    if (document.body) showSignInWall();
    else document.addEventListener('DOMContentLoaded', showSignInWall);
  }
})();

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

    var studentName = '';
    try {
      studentName = (sessionStorage.getItem('CANDIDATE_FULL_NAME') ||
                     localStorage.getItem('ms_candidate_name') || '').toString().trim().slice(0, 120);
    } catch (e) {}

    var payload = {
      brandName:      cfg.brandName      || '',
      testIdentifier: cfg.testIdentifier || '',
      logoUrl:        cfg.logoUrl        || '',
      directorName:   cfg.directorName   || '',
      studentName:    studentName
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
