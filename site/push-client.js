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

  function subscribe() {
    return navigator.serviceWorker.ready.then(function (reg) {
      return reg.pushManager.getSubscription().then(function (existing) {
        if (existing) return existing;
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: b64ToUint8(VAPID_PUBLIC)
        });
      });
    }).then(function (sub) { return saveSub(sub).then(function () { return sub; }); });
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
  }
})();
