// =============================================================================
// PWA MANIFEST — Per-clone static-file picker
// -----------------------------------------------------------------------------
// Each Netlify clone deploys with its own __CENTER_ID (set by center-id.js).
// We point <link rel="manifest"> at a static, real-URL file per clone so the
// browser's "install app" prompt picks up the right brand name + icon.
//
// Why not a Blob URL?
//   Edge/Chrome reject Blob URLs for the installability check ("Add to Home
//   Screen" disappears). A real, fetchable manifest URL is required.
//
// Why not one shared manifest.json?
//   Then every clone shows the Mock Stream brand on install. Tried that, the
//   install prompt was wrong on multilevelrecord.com / bekzodsmultilevel.com /
//   etc. — that's the original bug this file fixes.
//
// Caveat: PWA install identity is frozen at deploy time. If an admin renames
// a clone via Centers Management, the website renames live, but the install
// prompt keeps the deployed name until someone updates manifest-<slug>.json
// and pushes a new build. PWAs that are *already installed* never auto-update
// their app name — uninstall and reinstall is the only way.
// =============================================================================
(function () {
  'use strict';

  var slug = (window.__CENTER_ID || 'mock_stream');
  // Whitelist of slugs we have a static manifest file for. Anything else
  // falls back to the default Mock Stream manifest.
  var KNOWN = {
    mock_stream: 1, bek: 1, niners: 1, global: 1,
    muzaffars: 1, record: 1, achievers: 1
  };
  if (!KNOWN[slug]) slug = 'mock_stream';

  // Resolve relative to wherever the calling page lives. index.html and
  // landing.html both sit in /site, so 'site-config/manifest-<slug>.json'
  // resolves correctly from either.
  var href = 'site-config/manifest-' + slug + '.json';

  var link = document.querySelector('link[rel="manifest"]');
  if (link) {
    link.href = href;
  } else {
    link = document.createElement('link');
    link.rel  = 'manifest';
    link.href = href;
    document.head.appendChild(link);
  }
})();
