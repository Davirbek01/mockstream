/* =========================================================================
 * code-persistence.js — "Remember my VIP activation on this device"
 * -------------------------------------------------------------------------
 * Mirrors the mobile apps (src/lib/access.ts + AuthContext.tsx): a site-wide
 * VIP code entered once is remembered across browser restarts, and RE-VALIDATED
 * against verify-passcode on the next load so an expired / rotated / revoked
 * code stops working immediately (the server is the source of truth).
 *
 * SCOPE (v1): site-wide VIP codes only — the sidebar / welcome VIP path that
 * sets vipSessionAccess (+ vipPremiumAi for premium) + vipToken. Per-mock codes
 * (skill + mock_number) are deliberately NOT remembered here.
 *
 * WHY the account path already works and is untouched: Google / Telegram
 * premium is re-derived every load by auth.js -> applyPremiumUnlock() (it
 * re-reads premium_emails and re-mints vipToken). Only RAW CODES were session-
 * only (sessionStorage, wiped on browser close) — that is the gap this closes.
 *
 * SAFETY:
 *   • Server re-validation on every fresh browser session — expiry/rotation
 *     enforced server-side (verify-passcode checks expires_at + the row still
 *     existing). Authoritative "invalid" -> the saved code is forgotten.
 *   • Fail-open on network / 429 only, and only within a 7-day grace window,
 *     so a flaky connection never locks out a paying student but a long-dead
 *     code can't live forever offline.
 *   • Opt-out for shared / public computers via the "Remember on this device"
 *     checkbox (default ON) -> the `ms_remember_codes` pref. When off, nothing
 *     is stored and any existing record is cleared.
 *   • A fresh HMAC vipToken (4 h TTL) is minted on each restore, so the
 *     hardened isSuperAccessUnlocked() (flag + token) gate is satisfied.
 * ========================================================================= */
(function () {
  'use strict';

  var SB_URL  = window.SUPABASE_URL || 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var SB_ANON = window.SB_ANON_KEY || window.SUPABASE_ANONKEY || window.SUPABASE_ANON_KEY
             || 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';

  var PREF_KEY = 'ms_remember_codes';   // '0' = opted out; anything else = on (default)
  var SAVE_KEY = 'ms_saved_vip';        // { code, center, tier, savedAt, lastValidated }
  var SKILLS   = ['reading', 'listening', 'writing', 'speaking'];
  var OFFLINE_GRACE_MS = 7 * 24 * 60 * 60 * 1000; // fail-open only if validated within 7 days
  var VERIFY_URL = SB_URL + '/functions/v1/verify-passcode';

  function _center() {
    try {
      var c = window.__CENTER_ID
           || (window.SITE_CONFIG && window.SITE_CONFIG.testIdentifier)
           || 'mock_stream';
      return String(c).replace(/[_\s]/g, '').toLowerCase();
    } catch (e) { return 'mockstream'; }
  }

  function isRemembering() {
    try { return localStorage.getItem(PREF_KEY) !== '0'; } catch (e) { return true; }
  }

  function _load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      return (o && typeof o.code === 'string' && o.code) ? o : null;
    } catch (e) { return null; }
  }

  function _save(rec) {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(rec)); } catch (e) {}
  }

  function forget() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  }

  // Opt in / out of remembering. Turning it off forgets any stored code but
  // does NOT sign the user out of the current session (flags stay until the
  // tab closes) — it only stops the code persisting to the next launch.
  function setRemember(on) {
    try { localStorage.setItem(PREF_KEY, on ? '1' : '0'); } catch (e) {}
    if (!on) forget();
  }

  // Apply the exact flag bundle the live entry paths set, so a remembered
  // session is indistinguishable from a fresh code entry:
  //   regular VIP  -> vipSessionAccess (+ vipToken); NO skill flags, NO premium AI
  //   premium VIP  -> vipSessionAccess + vipPremiumAi + all <skill>PremiumEntry (+ vipToken)
  function _setFlags(token, premium) {
    try {
      sessionStorage.setItem('vipSessionAccess', 'true');
      if (premium) {
        sessionStorage.setItem('vipPremiumAi', 'true');
        SKILLS.forEach(function (s) {
          try { sessionStorage.setItem(s + 'PremiumEntry', 'true'); } catch (e) {}
        });
      } else {
        sessionStorage.removeItem('vipPremiumAi');
      }
      if (token) sessionStorage.setItem('vipToken', token);
    } catch (e) {}
    // Let premium-gate.js / decorate() re-evaluate any locks applied early.
    try {
      window.dispatchEvent(new CustomEvent('mockStream:premiumUnlocked', {
        detail: { source: 'code_persistence', premium_ai: !!premium }
      }));
    } catch (e) {}
  }

  // POST the saved code to verify-passcode. Returns a small verdict object.
  //   { access:true,  role, token }              — still valid
  //   { access:false }                           — authoritative reject (expired/rotated)
  //   { network:true }                           — could not decide (offline / 429 / non-OK)
  function _verifyRemote(code) {
    return fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SB_ANON, 'Authorization': 'Bearer ' + SB_ANON },
      body: JSON.stringify({ code: String(code), center: _center() })
    }).then(function (resp) {
      // 429 (rate-limit) and any non-OK are NOT authoritative "invalid" — treat
      // like a network error so we keep the last-known unlock instead of wiping.
      if (resp.status === 429 || !resp.ok) return { network: true };
      return resp.json().then(function (d) {
        if (d && (d.access || d.valid)) {
          return { access: true, role: d.role || (d.tier === 'premium' ? 'premium' : 'regular'),
                   token: (typeof d.token === 'string' && d.token.length > 20) ? d.token : null };
        }
        return { access: false };
      }).catch(function () { return { network: true }; });
    }).catch(function () { return { network: true }; });
  }

  // Remember a freshly-verified site-wide VIP code. Called by the fetch
  // interceptor below (auto-capture) — no per-page wiring needed.
  //   tier: 'premium' | 'regular'
  function remember(code, tier) {
    if (!isRemembering()) return;
    var c = String(code == null ? '' : code).trim();
    if (!/^\d{4,12}$/.test(c)) return;
    _save({
      code: c,
      center: _center(),
      tier: (tier === 'premium') ? 'premium' : 'regular',
      savedAt: Date.now(),
      lastValidated: Date.now()
    });
  }

  // On load: if this is a fresh browser session (no live vipToken) and we have a
  // remembered code, re-validate it and restore the unlock.
  function restore() {
    // Already unlocked in THIS tab session — nothing to do (and avoids an extra
    // verify-passcode call on every same-session navigation, keeping us well
    // under the per-IP rate limit).
    try {
      if (sessionStorage.getItem('vipToken') && sessionStorage.getItem('vipSessionAccess') === 'true') return;
    } catch (e) {}

    if (!isRemembering()) { forget(); return; }
    var rec = _load();
    if (!rec) return;

    // Centre mismatch (e.g. a code saved on one clone, opened on another) —
    // don't apply it; let the user re-enter on the new centre.
    if (rec.center && rec.center !== _center()) return;

    _verifyRemote(rec.code).then(function (v) {
      if (v.access) {
        var premium = v.role === 'premium' || v.role === 'admin';
        _setFlags(v.token, premium);
        rec.tier = premium ? 'premium' : 'regular';
        rec.lastValidated = Date.now();
        _save(rec);
      } else if (v.network) {
        // Fail-open, but bounded: only honour a recently-validated code so a
        // long-dead one can't live forever without a server round-trip. No
        // fresh token offline -> premium MOCK opening stays protected; only the
        // lighter UI flags come back so the student isn't bounced to sign-in.
        var age = Date.now() - (rec.lastValidated || rec.savedAt || 0);
        if (age <= OFFLINE_GRACE_MS) _setFlags(null, rec.tier === 'premium');
      } else {
        // Authoritative reject — expired / rotated / revoked. Forget it so the
        // next load falls straight through to the access-code prompt.
        forget();
      }
    });
  }

  // ── Auto-capture: transparently remember any successful site-wide VIP
  //    unlock, wherever the code was entered, with zero per-page edits.
  //    We only capture code-bearing VIP calls (NOT email_auth, NOT per-mock
  //    skill+mock_number) and only genuine student roles (never admin).
  (function installCapture() {
    if (typeof window.fetch !== 'function' || window.__msCodePersistWrapped) return;
    window.__msCodePersistWrapped = true;
    var _origFetch = window.fetch;
    window.fetch = function (input, init) {
      var url = '';
      try { url = typeof input === 'string' ? input : (input && input.url) || ''; } catch (e) {}
      var isVerify = url && url.indexOf('/functions/v1/verify-passcode') !== -1;

      // Extract the request body (the code lives here) BEFORE the call.
      var reqBody = null;
      if (isVerify) {
        try {
          var b = (init && init.body) || (typeof input !== 'string' && input && input.body);
          if (typeof b === 'string') reqBody = JSON.parse(b);
        } catch (e) { reqBody = null; }
      }

      var p = _origFetch.apply(this, arguments);
      if (!isVerify || !reqBody) return p;

      // Only site-wide VIP codes: a code, but no email_auth and no per-mock scope.
      var code = reqBody.code != null ? reqBody.code : reqBody.passcode;
      var isSiteWideVip = code != null && !reqBody.email_auth &&
                          reqBody.skill == null && reqBody.mock_number == null;
      if (!isSiteWideVip) return p;

      return p.then(function (resp) {
        try {
          resp.clone().json().then(function (d) {
            if (!d || !(d.access || d.valid)) return;
            var role = d.role || (d.tier === 'premium' ? 'premium' : 'regular');
            if (role === 'admin' || role === 'super_admin') return; // never remember admin
            remember(code, role);
          }).catch(function () {});
        } catch (e) {}
        return resp;
      });
    };
  })();

  window.MockStream = window.MockStream || {};
  window.MockStream.codeMemory = {
    remember:      remember,
    forget:        forget,
    restore:       restore,
    isRemembering: isRemembering,
    setRemember:   setRemember
  };

  // Restore as early as possible (async network, but flags land before most
  // decorate() passes finish and premium-gate re-checks on the event we fire).
  restore();
})();
