// Apply OS dark/light preference to the document on load + react to changes.
// Used by KET pages so they pick up the user's system theme even when opened
// directly (not via landing.html which has its own copy of this logic).
(function () {
  function applySystemTheme() {
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
  applySystemTheme();
  try {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', applySystemTheme);
    else if (mq.addListener) mq.addListener(applySystemTheme);  // older Safari
  } catch (e) {}
})();
