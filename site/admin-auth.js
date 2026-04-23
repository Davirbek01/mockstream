// =====================================================================
// admin-auth.js
// ---------------------------------------------------------------------
// Zero-dependency helper that lets admin pages do AUTHENTICATED writes
// to Supabase via Supabase Auth magic link.
//
// How it works:
//   1. Admin types their email → we call supabase.auth.signInWithOtp
//      → Supabase emails them a magic link → they click it →
//      their browser gets a JWT stored in localStorage.
//   2. From then on, `window.AdminAuth.fetch(path, opts)` sends that
//      JWT in the Authorization header. Supabase RLS checks
//      auth.jwt()->>'email' against premium_emails.
//   3. If the email is not in premium_emails as active admin → DB
//      returns empty on reads and 401/403 on writes. Safe by default.
//
// Drop-in usage:
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
//   <script src="/admin-auth.js"></script>
//   ...
//   await window.AdminAuth.requireLogin();  // opens modal if not logged in
//   await window.AdminAuth.fetch('/rest/v1/site_settings?key=eq.' + key, {
//     method: 'PATCH',
//     headers: { 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
//     body:    JSON.stringify({ value: newValue })
//   });
// =====================================================================
(function () {
  'use strict';

  var SUPABASE_URL     = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var SUPABASE_ANONKEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';

  if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
    console.error('[admin-auth] supabase-js not loaded. Add the <script> tag first.');
    return;
  }

  var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANONKEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      storageKey: 'ms-admin-auth'
    }
  });

  async function currentSession() {
    var r = await sb.auth.getSession();
    return r && r.data ? r.data.session : null;
  }

  async function currentEmail() {
    var s = await currentSession();
    return s && s.user ? String(s.user.email || '').toLowerCase() : '';
  }

  async function currentRole() {
    // Returns { role: 'super_admin'|'admin'|null, center: '' }.
    var email = await currentEmail();
    if (!email) return { role: null, center: '' };
    var s = await currentSession();
    var r = await fetch(
      SUPABASE_URL + '/rest/v1/premium_emails?email=eq.' + encodeURIComponent(email) +
      '&active=eq.true&role=eq.admin&select=center',
      {
        headers: {
          'apikey': SUPABASE_ANONKEY,
          'Authorization': 'Bearer ' + (s ? s.access_token : SUPABASE_ANONKEY)
        }
      }
    );
    if (!r.ok) return { role: null, center: '' };
    var rows = await r.json();
    if (!rows.length) return { role: null, center: '' };
    var c = rows[0].center || '';
    return { role: c ? 'admin' : 'super_admin', center: c };
  }

  async function sendMagicLink(email) {
    if (!email) throw new Error('email required');
    var redirect = window.location.origin + window.location.pathname;
    var res = await sb.auth.signInWithOtp({
      email: email,
      options: { emailRedirectTo: redirect }
    });
    if (res.error) throw res.error;
    return true;
  }

  async function signInWithGoogle() {
    var redirect = window.location.origin + window.location.pathname;
    var res = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirect,
        queryParams: { access_type: 'offline', prompt: 'select_account' }
      }
    });
    if (res.error) throw res.error;
    return true;
  }

  async function logout() {
    await sb.auth.signOut();
  }

  // Small modal for login.  Minimal styles so it works on any page.
  function openLoginModal() {
    if (document.getElementById('msAdminLoginModal')) return;
    var wrap = document.createElement('div');
    wrap.id = 'msAdminLoginModal';
    wrap.style.cssText =
      'position:fixed;inset:0;background:rgba(15,23,42,.65);z-index:2147483000;' +
      'display:flex;align-items:center;justify-content:center;font:14px system-ui';
    wrap.innerHTML =
      '<div style="background:#fff;border-radius:14px;max-width:360px;width:90%;padding:22px 22px 18px;box-shadow:0 20px 60px rgba(0,0,0,.3)">' +
        '<div style="font:700 16px system-ui;margin-bottom:10px">Admin sign-in</div>' +
        '<div style="color:#475569;margin-bottom:14px">Sign in with Google (recommended) or request a one-click email link.</div>' +
        '<button id="msAdminGoogleBtn" style="width:100%;padding:11px;border:1.5px solid #e2e8f0;border-radius:8px;background:#fff;color:#1e293b;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:14px">' +
          '<svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C33.9 5.9 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C33.9 5.9 29.2 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.2 5.2c-.4.4 6.6-4.9 6.6-14.9 0-1.3-.1-2.6-.4-3.9z"/></svg>' +
          'Continue with Google' +
        '</button>' +
        '<div style="display:flex;align-items:center;gap:10px;margin:4px 0 12px;color:#94a3b8;font-size:11px;font-weight:500">' +
          '<div style="flex:1;height:1px;background:#e2e8f0"></div>or email link<div style="flex:1;height:1px;background:#e2e8f0"></div>' +
        '</div>' +
        '<input id="msAdminEmail" type="email" placeholder="you@example.com" ' +
          'style="width:100%;padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;margin-bottom:10px" />' +
        '<button id="msAdminSendBtn" style="width:100%;padding:11px;border:0;border-radius:8px;' +
          'background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;font-weight:700;cursor:pointer">Send magic link</button>' +
        '<div id="msAdminMsg" style="color:#0f766e;margin-top:10px;min-height:18px"></div>' +
        '<button id="msAdminCloseBtn" style="margin-top:6px;background:none;border:0;color:#64748b;cursor:pointer;font-size:12px">Cancel</button>' +
      '</div>';
    document.body.appendChild(wrap);
    var close = function () { wrap.remove(); };
    wrap.querySelector('#msAdminCloseBtn').onclick = close;
    wrap.querySelector('#msAdminGoogleBtn').onclick = async function () {
      var btn = wrap.querySelector('#msAdminGoogleBtn');
      var msg = wrap.querySelector('#msAdminMsg');
      btn.disabled = true;
      btn.style.opacity = '0.6';
      msg.style.color = '#0f766e';
      msg.textContent = 'Redirecting to Google...';
      try {
        await signInWithGoogle();
      } catch (e) {
        btn.disabled = false;
        btn.style.opacity = '1';
        msg.style.color = '#b91c1c';
        msg.textContent = (e && e.message) || 'Google sign-in failed.';
      }
    };
    wrap.querySelector('#msAdminSendBtn').onclick = async function () {
      var em = (wrap.querySelector('#msAdminEmail').value || '').trim().toLowerCase();
      var msg = wrap.querySelector('#msAdminMsg');
      msg.style.color = '#0f766e';
      msg.textContent = '';
      try {
        await sendMagicLink(em);
        msg.textContent = 'Check your inbox. You can close this tab and come back via the link.';
      } catch (e) {
        msg.style.color = '#b91c1c';
        msg.textContent = (e && e.message) || 'Failed to send link.';
      }
    };
  }

  async function requireLogin() {
    var s = await currentSession();
    if (!s) { openLoginModal(); throw new Error('admin login required'); }
    var role = await currentRole();
    if (!role.role) { await logout(); openLoginModal(); throw new Error('not an admin'); }
    return role;
  }

  // Authed fetch — prepends Supabase URL when `path` starts with '/', and
  // attaches apikey + Bearer JWT automatically.
  async function authFetch(path, opts) {
    opts = opts || {};
    var s = await currentSession();
    if (!s) { openLoginModal(); throw new Error('admin login required'); }
    var url = path.indexOf('http') === 0 ? path : (SUPABASE_URL + path);
    var headers = Object.assign({}, opts.headers || {}, {
      'apikey': SUPABASE_ANONKEY,
      'Authorization': 'Bearer ' + s.access_token
    });
    return fetch(url, Object.assign({}, opts, { headers: headers }));
  }

  window.AdminAuth = {
    supabase:      sb,
    currentEmail:  currentEmail,
    currentRole:   currentRole,
    requireLogin:  requireLogin,
    sendMagicLink: sendMagicLink,
    signInWithGoogle: signInWithGoogle,
    logout:        logout,
    fetch:         authFetch
  };

  // -------------------------------------------------------------------
  // Auto write-interceptor
  // -------------------------------------------------------------------
  // Transparently upgrades Supabase write calls to use the logged-in
  // admin JWT so existing code that still uses the anon key keeps
  // working with RLS. Only activates for POST/PATCH/PUT/DELETE against
  // the whitelisted sensitive tables below — reads are untouched, and
  // non-Supabase requests are untouched.
  //
  // If you want to disable it on a page, set
  //   window.__MS_ADMIN_AUTH_NO_INTERCEPT = true
  // BEFORE this script runs.
  // -------------------------------------------------------------------
  if (!window.__MS_ADMIN_AUTH_NO_INTERCEPT) {
    var SENSITIVE_PATH_RE =
      /\/rest\/v1\/(site_settings|premium_emails|premium_devices|blocked_ips|ai_submission_logs|ai_center_limits)(\?|$|\/)/i;
    var WRITE_METHODS = { POST: 1, PATCH: 1, PUT: 1, DELETE: 1 };
    var _origFetch = window.fetch.bind(window);

    window.fetch = async function (input, init) {
      try {
        var url    = typeof input === 'string' ? input : (input && input.url) || '';
        var method = ((init && init.method) ||
                      (typeof input !== 'string' && input && input.method) ||
                      'GET').toUpperCase();

        if (url.indexOf(SUPABASE_URL) === 0 &&
            WRITE_METHODS[method] &&
            SENSITIVE_PATH_RE.test(url)) {
          var s = await currentSession();
          if (s && s.access_token) {
            init = init || {};
            var hdrs = new Headers(init.headers || {});
            hdrs.set('apikey', SUPABASE_ANONKEY);
            hdrs.set('Authorization', 'Bearer ' + s.access_token);
            init.headers = hdrs;
          } else {
            // No session — pop login modal and refuse the write.
            openLoginModal();
            return new Response(
              JSON.stringify({ error: 'admin login required' }),
              { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
          }
        }
      } catch (_e) { /* fall through to original fetch */ }

      return _origFetch(input, init);
    };
  }
})();
