/* =========================================================================
 * back-guard.js — make the exam pages' "Don't leave" back-button trap hold
 * on phones too.
 * -------------------------------------------------------------------------
 * Every exam page traps Back by pushing an extra history entry at load and
 * showing its leave warning on popstate. Chrome skips history entries that a
 * page added without the user touching it when Back is pressed, and on Android
 * the system Back button did exactly that: straight past the trap, no warning
 * (2026-09-17; desktop showed the warning). An entry added while the user taps
 * or types is honoured, so on the first interaction add one more, identical to
 * the current entry. The page's own popstate handler does the rest.
 * ========================================================================= */
(function () {
  'use strict';
  if (window.__backGuardArmed) return;
  window.__backGuardArmed = true;
  var done = false;
  function arm() {
    if (done) return;
    done = true;
    ['pointerdown', 'touchend', 'keydown'].forEach(function (t) { document.removeEventListener(t, arm, true); });
    try { history.pushState(history.state, '', location.href); } catch (e) { /* ignore */ }
  }
  ['pointerdown', 'touchend', 'keydown'].forEach(function (t) { document.addEventListener(t, arm, true); });
})();
