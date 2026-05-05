// =============================================================================
// PWA MANIFEST — Dynamic, per-clone
// -----------------------------------------------------------------------------
// Builds a Web App Manifest at runtime using the active centre's brand info
// (SITE_CONFIG.brandName / .logoUrl / .brandColor) and registers it via a
// Blob URL on the existing <link rel="manifest"> tag.
//
// Why dynamic instead of one static manifest.json per clone? Each centre's
// brand info already lives in Supabase (`center_site_config_<id>`) and is
// editable from Centers Management. With a Blob-URL manifest, an admin
// changing the Logo URL or Brand Colour from the panel sees that reflected
// in the next install prompt without a redeploy or a per-clone file.
//
// Re-runs on `ms:config-ready` (fired by site-config.js once the async
// Supabase fetch resolves), so the manifest reflects the freshest brand
// info — not just the synchronous default.
//
// Caveat: users who installed the PWA *before* this fix keep whatever name
// + icon they installed with until they uninstall and reinstall. There's no
// way to push a name change to an already-installed PWA.
// =============================================================================
(function () {
  'use strict';

  var DEFAULT_LOGO = 'https://i.ibb.co/WN0XY5Lv/logo.png';

  function buildManifestUrl() {
    var cfg  = window.SITE_CONFIG || {};
    var name = (cfg.brandName  || 'Mock Stream').toString();
    var logo = (cfg.logoUrl    || DEFAULT_LOGO).toString();
    var theme = (cfg.brandColor || '#0d9488').toString();

    var manifest = {
      name: name + ' — IELTS & CEFR Practice',
      short_name: name,
      description: 'Practice IELTS & CEFR Listening, Reading, Writing, and Speaking mock exams with AI assessment.',
      start_url: '/index.html',
      scope: '/',
      display: 'standalone',
      orientation: 'any',
      background_color: '#0f172a',
      theme_color: theme,
      categories: ['education'],
      icons: [
        { src: logo, sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: logo, sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: logo, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    };

    var blob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' });
    return URL.createObjectURL(blob);
  }

  function applyManifest() {
    try {
      var url = buildManifestUrl();
      var link = document.querySelector('link[rel="manifest"]');
      if (link) {
        // Revoke the previous blob URL we created (if any) so we don't leak.
        if (link.dataset.pwaBlob === '1' && /^blob:/i.test(link.href)) {
          try { URL.revokeObjectURL(link.href); } catch (e) {}
        }
        link.href = url;
      } else {
        link = document.createElement('link');
        link.rel  = 'manifest';
        link.href = url;
        document.head.appendChild(link);
      }
      link.dataset.pwaBlob = '1';
    } catch (e) {
      console.warn('[pwa-manifest] build failed', e);
    }
  }

  function init() {
    // Apply once with current SITE_CONFIG (sync default + cached values),
    // then re-apply when the Supabase fetch resolves so brand-panel edits
    // flow into the install prompt without a page reload.
    applyManifest();
    document.addEventListener('ms:config-ready', applyManifest);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
