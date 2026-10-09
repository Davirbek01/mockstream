// =============================================================================
// Web Push client — subscribes this browser/installed app to "new mock"
// notifications. Pairs with sw.js's push handlers and the web-push Edge
// Function (fan-out). Subscriptions land in Supabase web_push_subs.
//
// API:  MSPush.supported()  → bool
//       MSPush.enable()     → Promise<'granted'|'denied'|'unsupported'>
//   On load, if permission is already granted, the subscription is silently
//   refreshed (handles push-service rotation).
// =============================================================================
(function () {
  'use strict';

  var SUPABASE_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  // Legacy anon JWT (same as session-recovery.js) — the sb_publishable_* key
  // is rejected by the REST gateway (401).
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprbnl1a2tidGJjcWd2a2dqa3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTUyODIsImV4cCI6MjA5MDI5MTI4Mn0.gGRtl2TVCn_PnY1aITFdX76yxZu3QZsbdrqI5hXioEw';
  var VAPID_PUBLIC = 'BLOG-3UZIHOkfV3JfmU87axC9_90Copk5QirJ9nc9TAwZw-umPpkW0orROSmsj79y7_yPerI-Tcs3N22sAnYnmw';

  function b64ToUint8(base64) {
    var padding = '='.repeat((4 - base64.length % 4) % 4);
    var raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
    var arr = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    return arr;
  }

  function supported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  function saveSub(sub) {
    var json = sub.toJSON();
    // Plain POST — a repeat registration hits the unique(endpoint) index and
    // returns 409, which simply means "already subscribed" (the upsert modes
    // need a SELECT policy anon deliberately doesn't have).
    return fetch(SUPABASE_URL + '/rest/v1/web_push_subs', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: sub.endpoint,
        p256dh: (json.keys && json.keys.p256dh) || '',
        auth: (json.keys && json.keys.auth) || '',
        center_id: (window.__CENTER_ID || 'mock_stream'),
        ua: (navigator.userAgent || '').slice(0, 200)
      })
    }).catch(function () { /* offline — will retry next visit */ });
  }

  // The signed-in account's access token, if there is one. Mirrors the
  // lookup landing-v3 uses; returns '' for a signed-out visitor.
  function userToken() {
    try {
      var c = window.MockStream && window.MockStream.auth &&
              typeof window.MockStream.auth.getClient === 'function'
                ? window.MockStream.auth.getClient() : null;
      if (c && c.auth && typeof c.auth.getSession === 'function') {
        return c.auth.getSession().then(function (r) {
          var t = r && r.data && r.data.session && r.data.session.access_token;
          return t || localToken();
        }).catch(function () { return localToken(); });
      }
    } catch (_e) {}
    return Promise.resolve(localToken());
  }

  function localToken() {
    try {
      var raw = JSON.parse(localStorage.getItem('ms_auth_session') || 'null');
      if (raw && raw.access_token) return raw.access_token;
    } catch (_e) {}
    return '';
  }

  // Bind this browser to the signed-in account so a private message can reach
  // it. The address is NEVER sent: web_push_subs takes anon inserts with
  // check(true), so a body-supplied email would let anyone subscribe to
  // someone else's messages. The RPC reads it from the caller's own JWT.
  // Needed as well as the insert trigger, because a browser that subscribed
  // before signing in already has a row with no address.
  function claimSub(sub) {
    if (!sub || !sub.endpoint) return Promise.resolve();
    return userToken().then(function (tok) {
      if (!tok) return;
      return fetch(SUPABASE_URL + '/rest/v1/rpc/web_push_claim', {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + tok,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ p_endpoint: sub.endpoint })
      }).catch(function () { /* offline — retried next visit */ });
    }).catch(function () { });
  }

  function subscribe() {
    return navigator.serviceWorker.ready.then(function (reg) {
      return reg.pushManager.getSubscription().then(function (existing) {
        if (existing) return existing;
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: b64ToUint8(VAPID_PUBLIC)
        });
      });
    }).then(function (sub) {
      return saveSub(sub).then(function () { return claimSub(sub); })
                         .then(function () { return sub; });
    });
  }

  window.MSPush = {
    supported: supported,
    enable: function () {
      if (!supported()) return Promise.resolve('unsupported');
      return Notification.requestPermission().then(function (perm) {
        if (perm !== 'granted') return perm;
        return subscribe().then(function () { return 'granted'; })
          .catch(function () { return 'granted'; }); // permission ok even if save flaked
      });
    }
  };

  // Silent refresh when permission was already granted earlier.
  if (supported() && Notification.permission === 'granted') {
    subscribe().catch(function () { });
    // On a cold load the Supabase session is usually not restored yet, so the
    // first claim finds no token and does nothing. Try again a few times, and
    // when the tab comes back — a sign-in that happens later still binds.
    var tries = 0;
    var retry = setInterval(function () {
      if (++tries > 4) { clearInterval(retry); return; }
      navigator.serviceWorker.ready
        .then(function (reg) { return reg.pushManager.getSubscription(); })
        .then(claimSub).catch(function () { });
    }, 5000);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) return;
      navigator.serviceWorker.ready
        .then(function (reg) { return reg.pushManager.getSubscription(); })
        .then(claimSub).catch(function () { });
    });
  }
})();
