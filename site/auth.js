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
  var _premiumCache = null;
  async function checkPremiumRole(force) {
    if (_premiumCache && !force) return _premiumCache;
    var user = _currentUser;
    if (!user || !user.email) { _premiumCache = null; return null; }
    var email = String(user.email).toLowerCase();
    try {
      var url = SB_URL + '/rest/v1/premium_emails?email=eq.' +
        encodeURIComponent(email) + '&select=tier,role,center,active';
      var resp = await fetch(url, {
        headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
      });
      if (!resp.ok) { _premiumCache = null; return null; }
      var rows = await resp.json();
      if (!rows.length) { _premiumCache = null; return null; }
      var m = rows[0];
      var info = {
        email: email,
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
  async function applyPremiumUnlock() {
    var info = await checkPremiumRole();
    if (!info) return null;
    var siteCenter = (window.SITE_CONFIG && window.SITE_CONFIG.testIdentifier) || '';
    if (!info.active && !info.isAdmin) return null;
    if (info.center && info.center !== '' && info.center !== siteCenter) return null;
    try {
      sessionStorage.setItem('vipSessionAccess', 'true');
      if (info.tier === 'premium') sessionStorage.setItem('vipPremiumAi', 'true');
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
  // Backfill: when a user signs in with Google, find any previously-saved
  // results in this center that match their student_name and have no
  // user_email yet, and claim them. This way old guest progress shows up
  // in My Results once they create an account.
  // -----------------------------------------------------------------------
  async function _backfillGuestResults(profile) {
    try {
      if (!profile || !profile.email) return;
      var email = String(profile.email).toLowerCase();
      var name  = profile.fullName ||
                  sessionStorage.getItem('CANDIDATE_FULL_NAME') ||
                  localStorage.getItem('ms_candidate_name') || '';
      if (!name) return;
      var center = (window.SITE_CONFIG && window.SITE_CONFIG.testIdentifier) || '';
      var SB_URL = (window.SITE_CONFIG && window.SITE_CONFIG.SUPABASE_URL) || window.SUPABASE_URL || '';
      var SB_KEY = (window.SITE_CONFIG && window.SITE_CONFIG.SUPABASE_ANON_KEY) || window.SUPABASE_ANON_KEY || '';
      if (!SB_URL || !SB_KEY) return;
      var url = SB_URL + '/rest/v1/results' +
        '?student_name=eq.' + encodeURIComponent(name) +
        '&center=eq.'       + encodeURIComponent(center) +
        '&user_email=is.null';
      await fetch(url, {
        method: 'PATCH',
        headers: {
          'apikey':        SB_KEY,
          'Authorization': 'Bearer ' + SB_KEY,
          'Content-Type':  'application/json',
          'Prefer':        'return=minimal'
        },
        body: JSON.stringify({ user_email: email })
      }).catch(function(){});
    } catch (_e) { /* non-fatal */ }
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
    applyPremiumUnlock: applyPremiumUnlock
  };

  // Auto-init on DOMContentLoaded so pages don't have to call it manually.
  // Pages that want to await it can still call window.MockStream.auth.init() again.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }
})();
