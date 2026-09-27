/* ============================================================================
 * block-guard — tell a blocked student before the exam, not after it
 * ----------------------------------------------------------------------------
 * Blocking an account used to mean one thing, in one place: the AI proxy
 * refused to score. Everything else worked. So a blocked student signed in,
 * picked a mock, spoke for thirty minutes, submitted — and got a 403 with
 * nothing to explain it. They lost the half hour and learned nothing.
 *
 * This asks the question at the door instead. `is_account_blocked` answers a
 * yes/no for one email and nothing else, so the page can check without being
 * able to read the table.
 *
 * The answer is fetched up front and kept in memory, because the place that
 * needs it — `_msGateAllow`, the one function every launch already passes
 * through — is synchronous. It is refreshed on sign-in and when the tab comes
 * back to the foreground, so unblocking takes effect without a reload.
 *
 * Deliberately NOT a sign-in gate: a blocked student can still sign in and read
 * their own past reports. What they cannot do is start another mock.
 * ==========================================================================*/

(function () {
  'use strict';

  var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';

  // On the landing page the guard answers a question ("may this launch go
  // ahead?"). On a runner page — an exam, a flashcard set, an article — there
  // is no question left to ask: the student is already there, having arrived by
  // a saved link, a bookmark, a shared URL or a tab that was open before the
  // block. So those pages load it with data-runner and it turns the student
  // round by itself. Without this the whole guard is one bookmark deep.
  var IS_RUNNER = (function () {
    try {
      var el = document.currentScript ||
               document.querySelector('script[src*="block-guard.js"]');
      return !!(el && el.getAttribute('data-runner') !== null);
    } catch (e) { return false; }
  })();

  var blocked = false;         // last known answer; false until proven otherwise
  var checkedFor = '';         // the email that answer belongs to
  var inFlight = null;

  /**
   * The same precedence ai-proxy-interceptor uses, so the page and the proxy
   * are always talking about the same person.
   */
  function currentEmail() {
    var em = '';
    try {
      var u = window.MockStream && window.MockStream.auth &&
              typeof window.MockStream.auth.getUser === 'function'
                ? window.MockStream.auth.getUser() : null;
      if (u && u.email) em = u.email;
    } catch (e) { }
    if (!em) {
      try {
        var s = JSON.parse(localStorage.getItem('ms_auth_session') || 'null');
        var su = s && (s.user || (s.currentSession && s.currentSession.user));
        if (su && su.email) em = su.email;
      } catch (e) { }
    }
    if (!em) {
      try {
        var p = JSON.parse(localStorage.getItem('ms_candidate_profile') || 'null');
        if (p && p.email) em = p.email;
      } catch (e) { }
    }
    return String(em || '').trim().toLowerCase();
  }

  function ask(email) {
    return fetch(SB_URL + '/rest/v1/rpc/is_account_blocked', {
      method: 'POST',
      headers: {
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_email: email })
    }).then(function (r) {
      return r.ok ? r.json() : false;
    }).then(function (v) {
      return v === true;
    }).catch(function () {
      // A network failure must not lock anybody out. The proxy still refuses
      // to score a blocked account, so an outage costs a wasted sitting at
      // worst, never a wrongly barred student.
      return false;
    });
  }

  function refresh() {
    var em = currentEmail();
    if (!em) { blocked = false; checkedFor = ''; return Promise.resolve(false); }
    if (inFlight) return inFlight;
    inFlight = ask(em).then(function (v) {
      blocked = v; checkedFor = em; inFlight = null;
      return v;
    });
    return inFlight;
  }

  function isBlocked() {
    // A signed-in email we have not asked about yet reads as not blocked, and
    // the answer lands a moment later.
    var em = currentEmail();
    if (em && em !== checkedFor) { refresh(); return false; }
    return blocked;
  }

  function centreContact() {
    var c = (window.SITE_CONFIG || {});
    return c.adminTelegram || c.telegramUrl || '';
  }

  function showModal(opts) {
    if (document.getElementById('msBlockedModal')) return;
    var leave = !!(opts && opts.leave);

    var contact = centreContact();
    var d = document.createElement('div');
    d.id = 'msBlockedModal';
    d.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:2147483600',
      'background:rgba(15,23,42,.62)', 'backdrop-filter:blur(3px)',
      'display:flex', 'align-items:center', 'justify-content:center',
      'padding:20px'
    ].join(';');

    d.innerHTML =
      '<div style="background:#fff;color:#0f172a;border-radius:18px;max-width:380px;width:100%;' +
             'padding:26px 22px;text-align:center;box-shadow:0 24px 70px rgba(0,0,0,.35);' +
             'font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">' +
        '<div style="font-size:38px;line-height:1;margin-bottom:10px;">🔒</div>' +
        '<div style="font-size:17px;font-weight:800;margin-bottom:8px;">Hisobingiz vaqtincha cheklangan</div>' +
        '<div style="font-size:14px;line-height:1.55;color:#475569;">' +
          'Mok topshirish hozircha mavjud emas. Oldingi natijalaringiz va hisobotlaringiz ' +
          'joyida turibdi — ularni ko\'rishingiz mumkin.<br><br>' +
          'Cheklovni olib tashlash uchun o\'quv markazingiz bilan bog\'laning.' +
        '</div>' +
        '<div style="display:flex;gap:8px;margin-top:18px;">' +
          (contact
            ? '<a href="' + contact.replace(/"/g, '&quot;') + '" target="_blank" rel="noopener" ' +
              'style="flex:1;padding:11px 0;border-radius:11px;background:#2563eb;color:#fff;' +
              'font-weight:700;font-size:14px;text-decoration:none;">Bog\'lanish</a>'
            : '') +
          '<button type="button" id="msBlockedClose" style="flex:1;padding:11px 0;border:0;' +
            'border-radius:11px;background:#e2e8f0;color:#334155;font-weight:700;font-size:14px;' +
            'cursor:pointer;">' + (leave ? 'Bosh sahifa' : 'Yopish') + '</button>' +
        '</div>' +
      '</div>';

    function close() {
      if (leave) { window.location.replace('/landing-v3.html'); return; }
      if (d.parentNode) d.parentNode.removeChild(d);
    }
    // On a runner page the notice is the end of the road, so tapping the
    // backdrop must not dismiss it into a page they may not use.
    if (!leave) d.addEventListener('click', function (e) { if (e.target === d) close(); });
    document.body.appendChild(d);
    var btn = document.getElementById('msBlockedClose');
    if (btn) btn.addEventListener('click', close);
  }

  /** True when the caller may proceed; shows the notice and returns false when not. */
  function allow() {
    if (!isBlocked()) return true;
    showModal();
    return false;
  }

  window.MsBlockGuard = {
    refresh: refresh, isBlocked: isBlocked, showModal: showModal, allow: allow
  };

  function enforceOnRunner() {
    if (!IS_RUNNER) return;
    refresh().then(function (v) { if (v) showModal({ leave: true }); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { refresh(); enforceOnRunner(); });
  } else {
    refresh();
    enforceOnRunner();
  }

  // Sign-in lands after the first check, and an admin may lift the block while
  // the tab sits open.
  try {
    ['mockStream:userSignedIn', 'mockStream:userSignedOut'].forEach(function (ev) {
      window.addEventListener(ev, function () { checkedFor = ''; blocked = false; refresh(); });
    });
  } catch (e) { }
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) { refresh(); enforceOnRunner(); }
  });
  setInterval(function () { refresh(); enforceOnRunner(); }, 5 * 60 * 1000);
})();
