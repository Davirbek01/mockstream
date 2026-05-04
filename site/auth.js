/* =========================================================================
 * auth.js — Google Sign-In + Guest Mode helper for Mock Stream
 * -------------------------------------------------------------------------
 * Exposes window.MockStream.auth with:
 *   .init()                    — call on page load; restores session & fills
 *                                sessionStorage/localStorage name keys
 *   .signInWithGoogle(redirectTo) — starts Google OAuth redirect flow
 *   .signOut()                 — signs out and clears local name
 *   .getCurrentUser()          — returns Supabase user object or null
 *   .isSignedIn()              — bool
 *   .onStateChange(callback)   — subscribe to sign-in/out events
 *
 * Requires the @supabase/supabase-js UMD build to already be loaded and
 * window.SUPABASE_URL / window.SUPABASE_ANONKEY to be available.
 * ========================================================================= */
(function () {
  'use strict';

  var SB_URL = window.SUPABASE_URL || 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var SB_KEY = window.SUPABASE_ANONKEY || 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';

  var _client = null;
  var _currentUser = null;
  var _listeners = [];

  function _getClient() {
    if (_client) return _client;
    if (!window.supabase || !window.supabase.createClient) {
      console.warn('[auth] supabase-js not loaded yet');
      return null;
    }
    // Single shared client (persistSession stores in localStorage, survives page reload)
    _client = window.supabase.createClient(SB_URL, SB_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,  // handles the ?code=... callback automatically
        storageKey: 'ms_auth_session'
      }
    });
    return _client;
  }

  function _extractProfile(user) {
    if (!user) return null;
    var meta = user.user_metadata || {};
    var fullName = meta.full_name || meta.name || '';
    // Google provides `given_name` and `family_name` — prefer explicit over split
    if (!fullName && (meta.given_name || meta.family_name)) {
      fullName = ((meta.family_name || '') + ' ' + (meta.given_name || '')).trim();
    }
    return {
      id: user.id,
      email: user.email || meta.email || '',
      fullName: fullName,
      avatarUrl: meta.avatar_url || meta.picture || '',
      provider: (user.app_metadata && user.app_metadata.provider) || 'email'
    };
  }

  function _applyToLocalStorage(profile) {
    if (!profile || !profile.fullName) return;
    try {
      sessionStorage.setItem('CANDIDATE_FULL_NAME', profile.fullName);
      localStorage.setItem('ms_candidate_name', profile.fullName);
      var parts = profile.fullName.trim().split(/\s+/);
      if (parts.length >= 2) {
        localStorage.setItem('CANDIDATE_SURNAME', parts[0]);
        localStorage.setItem('CANDIDATE_FIRSTNAME', parts.slice(1).join(' '));
      }
      if (profile.avatarUrl) {
        localStorage.setItem('ms_avatar_url', profile.avatarUrl);
      }
      // Merge email into ms_candidate_profile
      var prof = {};
      try { prof = JSON.parse(localStorage.getItem('ms_candidate_profile') || '{}'); } catch (e) {}
      if (profile.email && !prof.email) prof.email = profile.email;
      localStorage.setItem('ms_candidate_profile', JSON.stringify(prof));
      // Flag this as a Google-authenticated session
      localStorage.setItem('ms_auth_provider', profile.provider);
    } catch (e) {
      console.warn('[auth] applyToLocalStorage error:', e);
    }
  }

  function _notifyListeners(event, profile) {
    _listeners.forEach(function (cb) {
      try { cb(event, profile); } catch (e) { console.warn('[auth] listener error:', e); }
    });
  }

  async function init() {
    var client = _getClient();
    if (!client) return null;
    try {
      var resp = await client.auth.getSession();
      var session = resp && resp.data && resp.data.session;
      if (session && session.user) {
        _currentUser = session.user;
        var profile = _extractProfile(session.user);
        _applyToLocalStorage(profile);
        _notifyListeners('signed_in', profile);

        // Fire the same event the rest of the site already listens to
        try {
          window.dispatchEvent(new CustomEvent('mockStream:userSignedIn', { detail: profile }));
        } catch (e) {}
        // Premium / admin auto-unlock (non-blocking)
        try { applyPremiumUnlock(); } catch (e) {}
        // Claim previously-saved guest results under this email (non-blocking)
        try { _backfillGuestResults(profile); } catch (e) {}
        // Register this device so admin can DM the user (non-blocking)
        try { _registerSignedInDevice(profile); } catch (e) {}
        // Stamp the candidates table so the Registered Users panel reflects
        // this sign-in (Google or Telegram). Non-blocking.
        try { _upsertCandidateFromAuth(profile); } catch (e) {}
      }

      // Subscribe to future auth changes (e.g., user signs in from popup)
      client.auth.onAuthStateChange(function (event, session) {
        if (event === 'SIGNED_IN' && session && session.user) {
          _currentUser = session.user;
          var profile = _extractProfile(session.user);
          _applyToLocalStorage(profile);
          _notifyListeners('signed_in', profile);
          try {
            window.dispatchEvent(new CustomEvent('mockStream:userSignedIn', { detail: profile }));
          } catch (e) {}
          try { _premiumCache = null; applyPremiumUnlock(); } catch (e) {}
          try { _backfillGuestResults(profile); } catch (e) {}
          try { _registerSignedInDevice(profile); } catch (e) {}
          try { _upsertCandidateFromAuth(profile); } catch (e) {}
        } else if (event === 'SIGNED_OUT') {
          _currentUser = null;
          _premiumCache = null;
          _notifyListeners('signed_out', null);
          try {
            window.dispatchEvent(new CustomEvent('mockStream:userSignedOut'));
          } catch (e) {}
        }
      });

      return _currentUser;
    } catch (e) {
      console.warn('[auth] init error:', e);
      return null;
    }
  }

  async function signInWithGoogle(redirectTo) {
    var client = _getClient();
    if (!client) { alert('Sign-in temporarily unavailable. Please refresh and try again.'); return; }
    var target = redirectTo || (window.location.origin + window.location.pathname);
    try {
      var resp = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: target,
          queryParams: { access_type: 'offline', prompt: 'select_account' }
        }
      });
      if (resp && resp.error) {
        console.error('[auth] signInWithGoogle error:', resp.error);
        alert('Google sign-in failed: ' + (resp.error.message || 'unknown error'));
      }
      // On success the browser redirects away
    } catch (e) {
      console.error('[auth] signInWithGoogle exception:', e);
      alert('Google sign-in failed. Please try again.');
    }
  }

  async function signOut() {
    var client = _getClient();
    if (!client) return;
    try {
      await client.auth.signOut();
      // Clear local name so they return to guest state
      try {
        sessionStorage.removeItem('CANDIDATE_FULL_NAME');
        localStorage.removeItem('ms_candidate_name');
        localStorage.removeItem('CANDIDATE_SURNAME');
        localStorage.removeItem('CANDIDATE_FIRSTNAME');
        localStorage.removeItem('ms_avatar_url');
        localStorage.removeItem('ms_candidate_profile');
        localStorage.removeItem('ms_auth_provider');
      } catch (e) {}
      _currentUser = null;
      _notifyListeners('signed_out', null);
    } catch (e) {
      console.warn('[auth] signOut error:', e);
    }
  }

  function getCurrentUser() { return _currentUser; }
  function isSignedIn() { return !!_currentUser; }
  function onStateChange(cb) { if (typeof cb === 'function') _listeners.push(cb); }
  function getProvider() {
    if (_currentUser) return _extractProfile(_currentUser).provider;
    return localStorage.getItem('ms_auth_provider') || 'guest';
  }

  // --- Premium / admin role lookup (single source of truth) ---------------
  // Returns { tier, role, center, active, isAdmin } or null if not premium.
  // Cached per-session to avoid refetching on every click.
  // Matches premium_emails by either email (Google) or telegram_username
  // (Telegram-only users); RLS lets the user read their own row by either.
  var _premiumCache = null;
  async function checkPremiumRole(force) {
    if (_premiumCache && !force) return _premiumCache;
    var user = _currentUser;
    if (!user) { _premiumCache = null; return null; }
    var email = user.email ? String(user.email).toLowerCase() : '';
    // Telegram-signed-in users have user_metadata.telegram_username populated
    // by the verify-telegram-login Edge Function. Strip leading @ defensively.
    var meta = user.user_metadata || {};
    var tgUsernameRaw = typeof meta.telegram_username === 'string' ? meta.telegram_username : '';
    var tgUsername = tgUsernameRaw.toLowerCase().replace(/^@/, '').trim();
    if (!email && !tgUsername) { _premiumCache = null; return null; }
    try {
      // Use the signed-in user's JWT (not the anon key) so the premium_emails
      // RLS SELECT policy can match jwt.email = row.email OR
      // jwt.user_metadata.telegram_username = row.telegram_username.
      var token = SB_KEY;
      try {
        var client = (window.MockStream && window.MockStream.auth &&
                      typeof window.MockStream.auth.getClient === 'function')
                       ? window.MockStream.auth.getClient() : null;
        if (client && client.auth && typeof client.auth.getSession === 'function') {
          var sess = await client.auth.getSession();
          var at = sess && sess.data && sess.data.session && sess.data.session.access_token;
          if (at) token = at;
        }
      } catch (_) { /* fall through with anon */ }
      // Build PostgREST `or=` filter: email match OR telegram_username match.
      // If only one identity is known, use a single .eq() filter for clarity.
      var filterParam;
      if (email && tgUsername) {
        filterParam = 'or=(email.eq.' + encodeURIComponent(email) +
                      ',telegram_username.eq.' + encodeURIComponent(tgUsername) + ')';
      } else if (email) {
        filterParam = 'email=eq.' + encodeURIComponent(email);
      } else {
        filterParam = 'telegram_username=eq.' + encodeURIComponent(tgUsername);
      }
      var url = SB_URL + '/rest/v1/premium_emails?' + filterParam +
                '&select=tier,role,center,active,email,telegram_username';
      var resp = await fetch(url, {
        headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token }
      });
      if (!resp.ok) { _premiumCache = null; return null; }
      var rows = await resp.json();
      if (!rows.length) { _premiumCache = null; return null; }
      // If both an email-row AND a telegram-row exist (a user who linked both),
      // prefer the row with the more specific match for this session: email if
      // the user signed in with Google, telegram_username otherwise.
      var m = rows[0];
      if (rows.length > 1) {
        var byEmail = rows.find(function (r) { return email && r.email && r.email.toLowerCase() === email; });
        var byTg = rows.find(function (r) { return tgUsername && r.telegram_username && r.telegram_username.toLowerCase() === tgUsername; });
        // If user has an email (Google), prefer that match; else fall back to telegram.
        m = (email && byEmail) || byTg || m;
      }
      var info = {
        email: email,
        telegram_username: tgUsername,
        tier: m.tier || 'standard',
        role: m.role || null,
        center: m.center || '',
        active: m.active !== false,
        isAdmin: m.role === 'admin'
      };
      _premiumCache = info;
      return info;
    } catch (e) {
      console.warn('[auth] checkPremiumRole error:', e);
      _premiumCache = null;
      return null;
    }
  }

  // Apply premium auto-unlock: mirror the flags that the sidebar VIP-email
  // flow sets, so Google-signed-in premium users don't have to re-enter their
  // email in the sidebar. Respects the active + center restrictions.
  //
  // SECURITY: also obtains a server-signed HMAC vipToken from verify-passcode
  // so isSuperAccessUnlocked() (which now requires both flag AND token) lets
  // the page actually unlock. Without this, Google-signed-in premium users
  // would have the flag but no token and would still see locked mocks.
  async function applyPremiumUnlock() {
    var info = await checkPremiumRole();
    if (!info) return null;
    var siteCenter = (window.SITE_CONFIG && window.SITE_CONFIG.testIdentifier) || '';
    if (!info.active && !info.isAdmin) return null;
    if (info.center && info.center !== '' && info.center !== siteCenter) return null;

    // Mint a server-validated vipToken from the user's Supabase JWT.
    // The Edge Function re-checks premium_emails server-side — the client
    // cannot forge this even if it tampers with the local checkPremiumRole
    // result, because the token is HMAC-signed with VIP_TOKEN_SECRET.
    var serverInfo = null;
    try {
      var client = _getClient();
      var sess = client && client.auth ? await client.auth.getSession() : null;
      var jwt = sess && sess.data && sess.data.session && sess.data.session.access_token;
      if (jwt) {
        var resp = await fetch(SB_URL + '/functions/v1/verify-passcode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY },
          body: JSON.stringify({ email_auth: true, user_jwt: jwt, center: siteCenter })
        });
        if (resp.ok) {
          var data = await resp.json();
          if (data && data.access && data.token) {
            serverInfo = data;
            try { sessionStorage.setItem('vipToken', data.token); } catch (e) {}
          }
        }
      }
    } catch (e) { /* token mint best-effort; flag-only unlock won't pass new gate */ }

    // Only set the legacy flag if we actually got a server token, so the
    // hardened isSuperAccessUnlocked() (token + flag) consistently agrees.
    if (!serverInfo) return null;

    try {
      sessionStorage.setItem('vipSessionAccess', 'true');
      if (info.tier === 'premium' || info.isAdmin) {
        sessionStorage.setItem('vipPremiumAi', 'true');
      } else {
        // Regular VIP must NOT inherit a stale premium flag from a prior session.
        sessionStorage.removeItem('vipPremiumAi');
      }
      localStorage.setItem('ms_vip_email', info.email);
      localStorage.setItem('ms_vip_tier', info.tier);
      if (info.isAdmin) localStorage.setItem('ms_admin_email', info.email);
    } catch (e) {}
    // Let the page know premium state changed
    try {
      window.dispatchEvent(new CustomEvent('mockStream:premiumUnlocked', { detail: info }));
    } catch (e) {}
    return info;
  }

  // -----------------------------------------------------------------------
  // Register the current device under the signed-in user's email so the
  // admin's "Send Private Message" feature in the Registered Users panel
  // can find a device_id to deliver the DM to. Without this, only users
  // who entered a VIP email or who already opened the Help Center had a
  // device_id on record — every other Google user showed
  // "No device found for this user yet".
  // Uses upsert (Prefer: resolution=merge-duplicates) so re-signins just
  // update last_seen instead of erroring on the (email, device_id) UNIQUE.
  // -----------------------------------------------------------------------
  function _miniDeviceInfo() {
    var info = { type: 'desktop', os: 'Unknown', model: '', browser: 'Unknown' };
    try {
      var ua = navigator.userAgent || '';
      if (/Mobi|Android|iPhone|iPad/i.test(ua)) info.type = 'mobile';
      if (/Windows/i.test(ua)) info.os = 'Windows';
      else if (/Mac OS X/i.test(ua)) info.os = 'macOS';
      else if (/Android/i.test(ua)) info.os = 'Android';
      else if (/iPhone|iPad|iOS/i.test(ua)) info.os = 'iOS';
      else if (/Linux/i.test(ua)) info.os = 'Linux';
      if (/Edg\//i.test(ua)) info.browser = 'Edge';
      else if (/OPR|Opera/i.test(ua)) info.browser = 'Opera';
      else if (/Chrome|CriOS/i.test(ua)) info.browser = 'Chrome';
      else if (/Firefox|FxiOS/i.test(ua)) info.browser = 'Firefox';
      else if (/Safari/i.test(ua)) info.browser = 'Safari';
    } catch (_e) {}
    return info;
  }

  async function _registerSignedInDevice(profile) {
    try {
      if (!profile || !profile.email) return;
      var email = String(profile.email).toLowerCase();
      var deviceId = '';
      try { deviceId = localStorage.getItem('ms_device_id') || ''; } catch (_e) {}
      if (!deviceId) {
        deviceId = 'dev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        try { localStorage.setItem('ms_device_id', deviceId); } catch (_e) {}
      }
      var body = {
        email: email,
        device_id: deviceId,
        device_info: _miniDeviceInfo(),
        last_seen: new Date().toISOString()
      };
      // Upsert via PostgREST: on_conflict targets the (email, device_id) UNIQUE.
      var url = SB_URL + '/rest/v1/premium_devices?on_conflict=email,device_id';
      await fetch(url, {
        method: 'POST',
        headers: {
          'apikey':        SB_KEY,
          'Authorization': 'Bearer ' + SB_KEY,
          'Content-Type':  'application/json',
          'Prefer':        'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify(body)
      }).catch(function(){});
    } catch (_e) { /* non-fatal */ }
  }

  // -----------------------------------------------------------------------
  // Backfill: when a user signs in with Google, find any previously-saved
  // guest results that match this person and claim them under their email.
  // We try several name variants so historical tests captured under
  // different orderings ("Surname Firstname" vs "Firstname Surname") or
  // different casings still get linked.
  // This way old guest progress (e.g., last month's mocks) shows up in
  // My Results immediately after the first sign-in.
  // -----------------------------------------------------------------------
  async function _backfillGuestResults(profile) {
    try {
      if (!profile || !profile.email) return;
      var email = String(profile.email).toLowerCase();
      var name  = profile.fullName ||
                  sessionStorage.getItem('CANDIDATE_FULL_NAME') ||
                  localStorage.getItem('ms_candidate_name') || '';
      if (!name) return;
      var SB_URL = (window.SITE_CONFIG && window.SITE_CONFIG.SUPABASE_URL) || window.SUPABASE_URL || '';
      var SB_KEY = (window.SITE_CONFIG && window.SITE_CONFIG.SUPABASE_ANON_KEY) || window.SUPABASE_ANON_KEY || '';
      if (!SB_URL || !SB_KEY) return;

      // Build a small set of name variants to match against student_name.
      // Order doesn't matter — we'll OR them in PostgREST.
      var variants = {};
      var trimmed = name.trim().replace(/\s+/g, ' ');
      variants[trimmed.toLowerCase()] = true;
      var parts = trimmed.split(' ');
      if (parts.length >= 2) {
        variants[(parts.slice(1).join(' ') + ' ' + parts[0]).toLowerCase()] = true; // reverse order
        variants[(parts[0] + ' ' + parts.slice(1).join(' ')).toLowerCase()] = true; // canonical
      }
      // PostgREST supports case-insensitive match via ilike. Build an "or="
      // clause: or=(student_name.ilike.john*doe,student_name.ilike.doe*john,...)
      var orParts = Object.keys(variants).map(function (v) {
        // match exact (case-insensitive) — use ilike with no wildcards
        // PostgREST commas inside or() must be quoted/encoded; simplest is to
        // run one PATCH per variant which keeps URLs short and safe.
        return v;
      });

      // The PATCH is gated by `self_backfill_email` (USING user_email IS NULL,
      // CHECK user_email = jwt.email), which only applies for the `authenticated`
      // role. With the anon key alone, the request falls through to
      // `rls_results_update` (admin-only) and silently no-ops.
      var token = SB_KEY;
      try {
        var c = _getClient();
        if (c && c.auth && typeof c.auth.getSession === 'function') {
          var sess = await c.auth.getSession();
          var at = sess && sess.data && sess.data.session && sess.data.session.access_token;
          if (at) token = at;
        }
      } catch (_e) {}

      // Run one PATCH per variant (cheap, all hit the (student_name,center) index).
      // We don't constrain by center — students who travel between centers
      // (or whose center identifier differs across clones) still get linked.
      for (var i = 0; i < orParts.length; i++) {
        var v = orParts[i];
        var url = SB_URL + '/rest/v1/results' +
          '?student_name=ilike.' + encodeURIComponent(v) +
          '&user_email=is.null';
        await fetch(url, {
          method: 'PATCH',
          headers: {
            'apikey':        SB_KEY,
            'Authorization': 'Bearer ' + token,
            'Content-Type':  'application/json',
            'Prefer':        'return=minimal'
          },
          body: JSON.stringify({ user_email: email })
        }).catch(function(){});
      }
    } catch (_e) { /* non-fatal */ }
  }

  // Upsert a row into `candidates` so the Registered Users admin panel reflects
  // this user. Called automatically on every SIGNED_IN (Google + Telegram), and
  // exposed publicly so supabase-send.js / index.html can also call it on
  // result submit / guest name submit. Anon RLS allows the upsert.
  async function _upsertCandidateFromAuth(profile) {
    try {
      if (!profile || !profile.fullName) return;
      var center = (window.SITE_CONFIG && window.SITE_CONFIG.testIdentifier) || 'mock_stream';
      var row = {
        student_name: profile.fullName,
        email: (profile.email || '').toLowerCase(),
        center: center,
        avatar_url: profile.avatarUrl || '',
        updated_at: new Date().toISOString()
      };
      await fetch(SB_URL + '/rest/v1/candidates?on_conflict=student_name,center', {
        method: 'POST',
        headers: {
          'apikey':        SB_KEY,
          'Authorization': 'Bearer ' + SB_KEY,
          'Content-Type':  'application/json',
          'Prefer':        'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify(row)
      }).catch(function(){});
    } catch (_e) {}
  }

  // Lightweight variant for callers that only know name + email + center
  // (e.g. result submitters that don't have a full profile object).
  function _upsertCandidateLight(name, email, center) {
    if (!name) return;
    return _upsertCandidateFromAuth({
      fullName: name,
      email: email || '',
      avatarUrl: ''
    });
  }

  window.MockStream = window.MockStream || {};
  window.MockStream.auth = {
    init: init,
    signInWithGoogle: signInWithGoogle,
    signOut: signOut,
    getCurrentUser: getCurrentUser,
    isSignedIn: isSignedIn,
    onStateChange: onStateChange,
    getProvider: getProvider,
    getClient: _getClient,
    checkPremiumRole: checkPremiumRole,
    applyPremiumUnlock: applyPremiumUnlock,
    upsertCandidate: _upsertCandidateLight
  };

  // Auto-init on DOMContentLoaded so pages don't have to call it manually.
  // Pages that want to await it can still call window.MockStream.auth.init() again.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }
})();
