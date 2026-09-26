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

  /* ── Stop the gesture before it starts ────────────────────────────────────
   * The history cushion above catches a swipe that navigates. It cannot catch
   * the other case: in a home-screen web app a swipe with nothing behind it
   * closes the app outright — iOS shows the splash and the student lands back
   * on the picker, mid-exam, with nothing fired that a page could have heard.
   *
   * WebKit does give one way to refuse it. The edge swipe only begins if the
   * touch that starts it goes unclaimed, so a non-passive touchstart in the
   * edge strip that calls preventDefault() stops the gesture from starting at
   * all. It costs the outer few millimetres of the screen during an exam,
   * where there is nothing to tap, and only while the exam is running.
   */
  var EDGE = 24;   // px from either side — wide enough to catch the gesture,
                   // narrow enough that nothing real lives there
  document.addEventListener('touchstart', function (e) {
    if (!examRunning()) return;
    if (!e.touches || e.touches.length !== 1) return;     // never fight a pinch
    var x = e.touches[0].clientX;
    if (x > EDGE && x < (window.innerWidth - EDGE)) return;
    // Inside the strip: claim the touch so no back/forward swipe can begin.
    if (e.cancelable) e.preventDefault();
  }, { passive: false });

  /* ── A way out, now that the swipe has none ───────────────────────────────
   * Refusing the gesture leaves a phone with no exit at all: there is no
   * browser chrome in a home-screen web app, and the pages' own exit controls
   * assume a mouse or a visible toolbar. So the guard puts one back, in the
   * place the gesture used to live — a thin tab on the left edge — and routes
   * it through whatever confirmation the page already shows, so leaving looks
   * the same however it was asked for.
   */
  var exitBtn = null;

  function leaveToPicker() {
    var go = function () {
      try { window.__okToLeave = true; } catch (e) { }
      window.location.replace('/landing-v3.html');
    };
    // The page's own "are you sure", with our destination.
    if (typeof window.promptFriendlyLeave === 'function') {
      try { window.promptFriendlyLeave(go); return; } catch (e) { }
    }
    if (typeof window.showLeaveWarningModal === 'function') {
      try { window.showLeaveWarningModal(); return; } catch (e) { }
    }
    if (window.confirm('Imtihondan chiqasizmi?\n\nJavoblaringiz saqlanmasligi mumkin.')) go();
  }

  function showExitTab() {
    if (exitBtn || !document.body) return;
    // Only where the gesture was taken away: a pointer has the browser's own
    // back button and needs no help.
    if (!window.matchMedia || !window.matchMedia('(pointer: coarse)').matches) return;

    exitBtn = document.createElement('button');
    exitBtn.type = 'button';
    exitBtn.id = 'msExamExitTab';
    exitBtn.setAttribute('aria-label', 'Exit the exam');
    exitBtn.textContent = '‹';
    exitBtn.style.cssText = [
      'position:fixed', 'left:0', 'top:50%', 'transform:translateY(-50%)',
      'width:26px', 'height:64px', 'padding:0',
      'border:0', 'border-radius:0 12px 12px 0',
      'background:rgba(15,23,42,.42)', 'color:#fff',
      'font:700 22px/1 -apple-system,system-ui,sans-serif',
      'display:flex', 'align-items:center', 'justify-content:center',
      'z-index:2147483000', '-webkit-tap-highlight-color:transparent',
      'padding-left:env(safe-area-inset-left,0px)'
    ].join(';');
    exitBtn.addEventListener('click', function (e) {
      e.preventDefault();
      leaveToPicker();
    });
    // The edge listener above claims touches in this strip, so the tab has to
    // claim its own back or it would never see one.
    exitBtn.addEventListener('touchstart', function (e) { e.stopPropagation(); }, { passive: true });
    document.body.appendChild(exitBtn);
  }

  function hideExitTab() {
    if (exitBtn && exitBtn.parentNode) exitBtn.parentNode.removeChild(exitBtn);
    exitBtn = null;
  }

  window.ExamBackGuard = {
    arm: arm, release: release, running: examRunning, EDGE: EDGE,
    showExit: showExitTab, hideExit: hideExitTab
  };

  // Horizontal overscroll is the other way a swipe turns into navigation on
  // some builds; nothing in an exam scrolls sideways, so refuse it outright.
  try {
    var st = document.createElement('style');
    st.textContent = 'html,body{overscroll-behavior-x:none;}';
    (document.head || document.documentElement).appendChild(st);
  } catch (e) { }

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
    if (examRunning()) { topUp(); showExitTab(); clearInterval(iv); }
  }, 1000);

  // And keep it honest afterwards: once the exam is over the tab goes away.
  setInterval(function () {
    if (exitBtn && !examRunning()) hideExitTab();
  }, 2000);
})();
