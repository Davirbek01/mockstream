/* ============================================================================
 * exam-back-guard — keep an accidental swipe from ending the exam
 * ----------------------------------------------------------------------------
 * On an iPhone, "back" is a swipe from the edge of the screen, and it is easy
 * to do by accident while holding the phone. The browser does not ask before
 * obeying it: `beforeunload` is ignored by iOS Safari, so the student is simply
 * gone, mid-answer, with no way back into a timed sitting.
 *
 * The gesture cannot be turned off from a web page. What can be done is to give
 * it somewhere harmless to go: history entries of our own, stacked in front of
 * the real one. A swipe pops one of ours, we hear popstate, put another back,
 * and ask the student whether they meant to leave.
 *
 * The pages each had a version of this already, and the thin spots showed on a
 * phone rather than a desk:
 *   - Speaking and Writing kept a cushion of ONE entry. Two quick swipes — easy
 *     to do by accident — went through the second one.
 *   - Both full mocks had no guard at all.
 *   - All of them armed once, at load, so anything that rewrote history later
 *     left the exam unprotected.
 *
 * So: a cushion of three, topped back up on every pop, re-armed when the exam
 * starts and whenever the page is restored from the back/forward cache.
 *
 * Reads the flags the pages already keep — window.testStarted (or
 * window.testInProgress) and window.__okToLeave — and calls the page's own
 * modal when there is one, so nothing here needs to know what leaving looks
 * like. Include it on any exam page; it installs itself.
 * ==========================================================================*/

(function () {
  'use strict';

  var CUSHION = 3;
  var armed = false;
  var depth = 0;

  function examRunning() {
    if (window.__okToLeave) return false;
    return !!(window.testStarted || window.testInProgress || window.__examInProgress);
  }

  /** Stack entries until the cushion is full. Same URL — the address bar never moves. */
  function topUp() {
    try {
      while (depth < CUSHION) {
        history.pushState({ msExamGuard: ++depth }, '', location.href);
      }
    } catch (e) {
      // A page served from file:// or an over-tight sandbox can refuse
      // pushState. Nothing else here depends on it.
      console.warn('[BackGuard] could not push history state', e && e.message);
    }
  }

  /** Whatever this page shows when someone tries to leave mid-exam. */
  function ask() {
    var fns = ['showLeaveWarningModal', 'showExitWarning', 'showLeaveModal'];
    for (var i = 0; i < fns.length; i++) {
      if (typeof window[fns[i]] === 'function') {
        try { window[fns[i]](); return; } catch (e) { /* try the next one */ }
      }
    }
    // No modal on this page: say it plainly rather than let the swipe pass.
    try {
      alert('Imtihon davom etmoqda.\n\nChiqish uchun sahifadagi tugmadan foydalaning — ' +
            'aks holda javoblaringiz saqlanmasligi mumkin.');
    } catch (e) { }
  }

  window.addEventListener('popstate', function () {
    // One of ours was just consumed, whoever did it.
    if (depth > 0) depth--;
    if (!examRunning()) return;
    topUp();
    ask();
  });

  // iOS restores a page from the back/forward cache without re-running the
  // script, so the cushion has to be rebuilt on the way back in.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted && examRunning()) { depth = 0; topUp(); }
  });

  /** Arm now. Safe to call repeatedly — the cushion is only topped up. */
  function arm() {
    armed = true;
    topUp();
  }

  /** Let the student leave: stop replacing what the browser pops. */
  function release() {
    window.__okToLeave = true;
  }

  window.ExamBackGuard = { arm: arm, release: release, running: examRunning };

  // Arm as soon as the page is usable, and again once the exam actually
  // starts — pages flip their own flag at different moments.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arm);
  } else {
    arm();
  }
  // Cheap poll for the first minute: the exam flag is set by page code we do
  // not control, and re-arming after it flips costs nothing.
  var tries = 0;
  var iv = setInterval(function () {
    if (++tries > 60) { clearInterval(iv); return; }
    if (examRunning()) { topUp(); clearInterval(iv); }
  }, 1000);
})();
