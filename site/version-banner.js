/* ═══════════════════════════════════════════════════════════════════════
 * version-banner.js — "A new version is available · Refresh" toast.
 *
 *   Self-contained module. Include with:
 *       <script src="version-banner.js" defer></script>
 *
 *   Polls every 3 minutes for changes in:
 *     1. sw.js CACHE_NAME  (auto, bumped on every deploy)
 *     2. site_settings.force_reload_version  (admin-fired manual push)
 *   When either changes from the page-load snapshot, the banner slides
 *   in. Refresh button clears all caches, unregisters the service worker,
 *   then hard-reloads.
 *
 *   Designed to be included on PAGES the student is unlikely to be
 *   actively writing in (landing pages) — runners (Speaking Mocks.html,
 *   etc.) deliberately don't include it so a deploy mid-mock doesn't
 *   disturb the student.
 * ═══════════════════════════════════════════════════════════════════════ */
(function newVersionBanner() {
  'use strict';

  // Don't double-inject if this script loads twice.
  if (window.__mmgVerBannerLoaded) return;
  window.__mmgVerBannerLoaded = true;

  var bannerHtml =
      '<div id="mmgVerBanner" style="position:fixed;top:0;left:0;right:0;z-index:99999;display:none;'
    +   'background:linear-gradient(135deg,#0ea5e9,#7c3aed);color:#fff;'
    +   'box-shadow:0 4px 16px rgba(15,23,42,.25);transform:translateY(-100%);'
    +   'transition:transform .3s ease;font:600 13.5px system-ui,-apple-system,Segoe UI,sans-serif;">'
    +   '<div style="max-width:1100px;margin:0 auto;padding:11px 16px;display:flex;align-items:center;gap:12px;">'
    +     '<span aria-hidden="true">🔔</span>'
    +     '<span id="mmgVerBannerMsg" style="flex:1;line-height:1.3;">A new version is available.</span>'
    +     '<button id="mmgVerRefresh" type="button" style="background:#fff;color:#0ea5e9;border:0;border-radius:7px;padding:7px 14px;font-size:12.5px;font-weight:700;cursor:pointer;">🔄 Refresh</button>'
    +     '<button id="mmgVerDismiss" type="button" title="Dismiss until next change" style="background:transparent;border:0;color:rgba(255,255,255,.85);font-size:18px;cursor:pointer;padding:2px 6px;line-height:1;">×</button>'
    +   '</div>'
    + '</div>';

  function inject() {
    if (document.getElementById('mmgVerBanner')) return;
    var holder = document.createElement('div');
    holder.innerHTML = bannerHtml;
    document.body.insertBefore(holder.firstChild, document.body.firstChild);
    wire();
  }

  var bannerEl, refreshEl, dismissEl;
  var seenSwVer = '', seenForceVer = '';
  var currentSwVer = '', currentForceVer = '';

  function showBanner(msg) {
    var m = document.getElementById('mmgVerBannerMsg');
    if (m) m.textContent = msg || 'A new version is available.';
    if (!bannerEl) return;
    bannerEl.style.display = 'block';
    // Force reflow so the transition kicks in.
    // eslint-disable-next-line no-unused-expressions
    void bannerEl.offsetWidth;
    bannerEl.style.transform = 'translateY(0)';
  }
  function hideBanner() {
    if (!bannerEl) return;
    bannerEl.style.transform = 'translateY(-100%)';
    setTimeout(function () { bannerEl.style.display = 'none'; }, 300);
  }

  function wire() {
    bannerEl  = document.getElementById('mmgVerBanner');
    refreshEl = document.getElementById('mmgVerRefresh');
    dismissEl = document.getElementById('mmgVerDismiss');

    if (dismissEl) dismissEl.addEventListener('click', function () {
      seenSwVer    = currentSwVer;
      seenForceVer = currentForceVer;
      hideBanner();
    });
    if (refreshEl) refreshEl.addEventListener('click', async function () {
      refreshEl.disabled = true;
      refreshEl.textContent = '⏳ Refreshing…';
      try {
        if ('caches' in window) {
          var keys = await caches.keys();
          await Promise.all(keys.map(function (k) { return caches.delete(k); }));
        }
      } catch (e) { console.warn('cache clear failed:', e); }
      try {
        if (navigator.serviceWorker) {
          var regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map(function (r) { return r.unregister(); }));
        }
      } catch (e) { console.warn('sw unregister failed:', e); }
      // Land on a clean home URL after refresh. Without this, a reload
      // from a /take/<slug> URL or a handoff query (?openSelector=...)
      // would re-trigger the deep-link flow and auto-reopen the picker
      // the student had just dismissed — which is not what "Refresh"
      // implies. location.replace ensures the browser doesn't keep the
      // pre-refresh entry in history.
      location.replace('/landing-v3.html');
    });
  }

  async function fetchSwVersion() {
    try {
      var r = await fetch('sw.js?t=' + Date.now(), { cache: 'no-cache' });
      if (!r.ok) return '';
      var txt = await r.text();
      var m = txt.match(/CACHE_NAME\s*=\s*['"]([^'"]+)['"]/);
      return m ? m[1] : '';
    } catch (e) { return ''; }
  }
  async function fetchForceVersion() {
    try {
      var SB  = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
      var KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
      var r = await fetch(SB + '/rest/v1/site_settings?key=eq.force_reload_version&select=value', {
        headers: { apikey: KEY, Authorization: 'Bearer ' + KEY },
        cache: 'no-cache'
      });
      if (!r.ok) return '';
      var arr = await r.json();
      return (arr && arr[0] && arr[0].value) ? String(arr[0].value) : '';
    } catch (e) { return ''; }
  }
  async function snapshotInitial() {
    currentSwVer    = await fetchSwVersion();
    currentForceVer = await fetchForceVersion();
    seenSwVer    = currentSwVer;
    seenForceVer = currentForceVer;
  }
  async function pollOnce() {
    var sw = await fetchSwVersion();
    var fc = await fetchForceVersion();
    if (sw) currentSwVer    = sw;
    if (fc) currentForceVer = fc;
    var newCode  = sw && sw !== seenSwVer    && seenSwVer    !== '';
    var newForce = fc && fc !== seenForceVer && seenForceVer !== '';
    if (newCode && newForce) showBanner('New version available (code + admin push) — refresh to apply.');
    else if (newCode)        showBanner('A new code version is available — refresh to apply.');
    else if (newForce)       showBanner('Admin pushed new content — refresh to see the latest mocks / settings.');
  }

  function start() {
    inject();
    snapshotInitial().then(function () {
      setInterval(pollOnce, 180000); // every 3 min
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') pollOnce();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
