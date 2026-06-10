/* =========================================================================
 * premium-gate.js — Tier detection, upgrade modal, lock decorator,
 * and mock-attempt tracker for the regular-tier paywall.
 *
 * Exposes window.PremiumGate with:
 *   .isPremiumTier(skill)        — boolean
 *   .isAdmin()                   — boolean
 *   .hasTaken({skill, mock_number, exam_type})
 *   .attemptCount({skill, mock_number, exam_type})
 *   .recordOpen({skill, mock_number, exam_type, center, tier})
 *   .recordSubmit({skill, mock_number, exam_type})
 *   .openUpgradeModal(reason)
 *   .applyLockBadge(element, reason)
 *   .fetchTakenForUser()         — Promise<row[]> from Supabase merged with localStorage
 * ========================================================================= */
(function () {
  'use strict';

  var SB_URL  = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var SB_ANON = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
  var LS_KEY  = 'ms_mock_attempts_v1';
  var LS_MAX  = 500;

  function _normName(n) {
    return (n || '').toString().trim().toLowerCase();
  }

  // Read candidate name with the same fallback chain the rest of the codebase uses:
  //   sessionStorage CANDIDATE_FULL_NAME (set by Google sign-in or guest welcome submit)
  //   → localStorage ms_candidate_name (auth.js / chat-bubble cache)
  //   → localStorage CANDIDATE_SURNAME + CANDIDATE_FIRSTNAME (welcome page persistent cache)
  // Without this fallback, recordOpen wrote rows with candidate_name='' in cases where
  // sessionStorage had been wiped or the user navigated cross-tab.
  function _candidateName() {
    var n = '';
    try {
      if (window.sessionStorage) n = sessionStorage.getItem('CANDIDATE_FULL_NAME') || '';
      if (!n && window.localStorage) n = localStorage.getItem('ms_candidate_name') || '';
      if (!n && window.localStorage) {
        var sn = (localStorage.getItem('CANDIDATE_SURNAME')   || '').trim();
        var fn = (localStorage.getItem('CANDIDATE_FIRSTNAME') || '').trim();
        if (sn || fn) n = (sn + ' ' + fn).trim();
      }
    } catch (e) {}
    return n;
  }

  function _center() {
    try {
      var c = (window.SITE_CONFIG && window.SITE_CONFIG.testIdentifier) || 'mock_stream';
      return String(c);
    } catch (e) { return 'mock_stream'; }
  }

  function isPremiumTier(skill) {
    try {
      if (skill === 'speaking') {
        var ind = sessionStorage.getItem('speakingIndividualCode');
        if (ind === 'premium') return true;
        if (ind === 'regular') return false;
      }
      if (sessionStorage.getItem('vipPremiumAi') === 'true') return true;
      var keyMap = {
        speaking:  'speakingPremiumEntry',
        writing:   'writingPremiumEntry',
        reading:   'readingPremiumEntry',
        listening: 'listeningPremiumEntry'
      };
      var k = keyMap[skill];
      if (k) {
        var v = sessionStorage.getItem(k);
        if (v === 'true')  return true;
        if (v === 'false') return false;
      }
      if (sessionStorage.getItem('vipSessionAccess') === 'true') return false;
    } catch (e) {}
    return false;
  }

  function isAdmin() {
    try {
      if (window.MockStream && window.MockStream.auth && typeof window.MockStream.auth.isAdmin === 'function') {
        return !!window.MockStream.auth.isAdmin();
      }
      if (sessionStorage.getItem('ms_is_admin') === 'true') return true;
      if (localStorage.getItem('ms_is_admin')  === 'true') return true;
    } catch (e) {}
    return false;
  }

  // ───── localStorage tracker ───────────────────────────────────────────────

  function _lsRead() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function _lsWrite(arr) {
    try {
      if (arr.length > LS_MAX) arr = arr.slice(arr.length - LS_MAX);
      localStorage.setItem(LS_KEY, JSON.stringify(arr));
    } catch (e) {}
  }

  function _lsAppend(row) {
    var arr = _lsRead();
    var now = Date.now();
    var dupKey = row.skill + '|' + row.exam_type + '|' + row.mock_number;
    for (var i = arr.length - 1; i >= 0 && i >= arr.length - 20; i--) {
      var r = arr[i];
      var rk = r.skill + '|' + r.exam_type + '|' + r.mock_number;
      if (rk === dupKey && (now - new Date(r.opened_at).getTime()) < 5000) return;
    }
    arr.push(row);
    _lsWrite(arr);
  }

  function _matches(r, q) {
    return r.skill === q.skill
        && String(r.mock_number) === String(q.mock_number)
        && (!q.exam_type || r.exam_type === q.exam_type);
  }

  function hasTaken(q) {
    if (!q || !q.skill || q.mock_number == null) return false;
    var arr = _lsRead();
    for (var i = 0; i < arr.length; i++) if (_matches(arr[i], q)) return true;
    return false;
  }

  function attemptCount(q) {
    if (!q || !q.skill || q.mock_number == null) return 0;
    var arr = _lsRead();
    var n = 0;
    for (var i = 0; i < arr.length; i++) if (_matches(arr[i], q)) n++;
    return n;
  }

  function recordOpen(o) {
    if (!o || !o.skill || o.mock_number == null) return;
    if (isAdmin()) return;
    var name = _candidateName();
    var row = {
      candidate_name: _normName(name),
      center:         o.center || _center(),
      exam_type:      o.exam_type || 'cefr',
      skill:          o.skill,
      mock_number:    Number(o.mock_number),
      tier_at_open:   o.tier || (isPremiumTier(o.skill) ? 'premium' : 'regular'),
      opened_at:      new Date().toISOString(),
      submitted_at:   null
    };
    _lsAppend(row);
    _sbInsert(row);
  }

  function recordSubmit(o) {
    if (!o || !o.skill || o.mock_number == null) return;
    if (isAdmin()) return;
    var arr = _lsRead();
    var stamped = false;
    for (var i = arr.length - 1; i >= 0; i--) {
      var r = arr[i];
      if (_matches(r, o) && !r.submitted_at) {
        r.submitted_at = new Date().toISOString();
        stamped = true;
        break;
      }
    }
    if (stamped) _lsWrite(arr);
    _sbPatchSubmit(o);
  }

  // ───── Supabase REST ──────────────────────────────────────────────────────

  function _sbHeaders() {
    return {
      'Content-Type':  'application/json',
      'apikey':        SB_ANON,
      'Authorization': 'Bearer ' + SB_ANON,
      'Prefer':        'return=minimal'
    };
  }

  function _sbInsert(row) {
    if (!row || !row.candidate_name) return;
    if (typeof fetch !== 'function') return;
    try {
      fetch(SB_URL + '/rest/v1/mock_attempts', {
        method: 'POST',
        headers: _sbHeaders(),
        body: JSON.stringify(row),
        keepalive: true
      }).catch(function (e) { try { console.info('[premium-gate] sb insert failed', e); } catch (_) {} });
    } catch (e) {}
  }

  function _sbPatchSubmit(o) {
    var name = _normName(_candidateName());
    if (!name) return;
    if (typeof fetch !== 'function') return;
    try {
      var qs = '?candidate_name=eq.' + encodeURIComponent(name)
             + '&skill=eq.'         + encodeURIComponent(o.skill)
             + '&mock_number=eq.'   + Number(o.mock_number)
             + '&submitted_at=is.null'
             + '&order=opened_at.desc&limit=1';
      fetch(SB_URL + '/rest/v1/mock_attempts' + qs, {
        method: 'PATCH',
        headers: _sbHeaders(),
        body: JSON.stringify({ submitted_at: new Date().toISOString() }),
        keepalive: true
      }).catch(function (e) { try { console.info('[premium-gate] sb patch failed', e); } catch (_) {} });
    } catch (e) {}
  }

  function fetchTakenForUser() {
    var name = _normName(_candidateName());
    if (!name || typeof fetch !== 'function') return Promise.resolve(_lsRead());
    var qs = '?candidate_name=eq.' + encodeURIComponent(name)
           + '&select=skill,mock_number,exam_type,opened_at';
    return fetch(SB_URL + '/rest/v1/mock_attempts' + qs, { headers: _sbHeaders() })
      .then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; })
      .then(function (rows) {
        var local = _lsRead();
        var seen = {};
        var out = [];
        function key(r) { return [r.skill, r.exam_type, r.mock_number, String(r.opened_at).slice(0, 16)].join('|'); }
        function push(r) { var k = key(r); if (!seen[k]) { seen[k] = 1; out.push(r); } }
        rows.forEach(push); local.forEach(push);
        return out;
      });
  }

  // ───── Modal + lock badge ─────────────────────────────────────────────────

  var _modalEl = null;

  function openUpgradeModal(reason, opts) {
    try { console.info('[premium-gate] upgrade prompted:', reason || 'unknown'); } catch (e) {}
    if (_modalEl) return;
    if (typeof document === 'undefined') return;
    var overlay = document.createElement('div');
    overlay.className = 'pg-modal-overlay';
    overlay.innerHTML =
      '<div class="pg-modal" role="dialog" aria-modal="true" aria-label="Upgrade to Premium">' +
        '<button class="pg-modal-x" aria-label="Close">×</button>' +
        '<div class="pg-modal-head">' +
          '<div class="pg-modal-title">🔥 Want more? Upgrade to Premium</div>' +
        '</div>' +
        '<ul class="pg-modal-list">' +
          '<li>🤖 Instant AI scoring &amp; feedback</li>' +
          '<li>📜 Full transcripts (speaking + writing)</li>' +
          '<li>🔁 Unlimited retries</li>' +
          '<li>🎯 One code unlocks all skills</li>' +
          '<li>⚡ No daily / hourly limits</li>' +
        '</ul>' +
        '<button class="pg-modal-cta">🎁 Open Premium tab</button>' +
      '</div>';
    document.body.appendChild(overlay);
    _modalEl = overlay;
    function close() {
      if (_modalEl) { _modalEl.remove(); _modalEl = null; }
      try { if (opts && typeof opts.onClose === 'function') opts.onClose(); } catch (e) {}
    }
    overlay.querySelector('.pg-modal-x').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    overlay.querySelector('.pg-modal-cta').addEventListener('click', function () {
      try {
        var msg =
          '💎 *Salom!*\n\n' +
          '🚀 Men *Mock Stream Premium obunasini* sotib olmoqchiman.\n\n' +
          '✨ Iltimos, narx, toʼlov usullari va premiumda ochiladigan imkoniyatlar haqida *qisqacha maʼlumot* bera olasizmi?\n\n' +
          '🙏 Rahmat!';
        window.open('https://t.me/mrkhasanoff3?text=' + encodeURIComponent(msg), '_blank', 'noopener');
      } catch (e) {}
    });
  }

  // Render an inline "upgrade to unlock AI feedback" card into a container.
  // Shown to REGULAR-tier users on result/finish screens where the premium
  // auto-AI analysis does not run, instead of leaving a silent dead-end.
  // Clicking opens the existing upgrade modal (with the Telegram purchase CTA).
  // No-op for premium/admin, and idempotent per container.
  function renderUpsellCard(container, skill, opts) {
    try {
      if (typeof container === 'string') container = document.querySelector(container);
      if (!container) return null;
      if ((skill && isPremiumTier(skill)) || isAdmin()) return null;
      var existing = container.querySelector(':scope > .pg-upsell-card');
      if (existing) { existing.style.display = ''; return existing; }
      var card = document.createElement('div');
      card.className = 'pg-upsell-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.style.cssText = 'margin-top:16px;padding:18px 20px;border-radius:14px;cursor:pointer;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;box-shadow:0 6px 18px rgba(124,58,237,0.35);text-align:left;transition:transform .15s ease,box-shadow .15s ease;';
      card.innerHTML =
        '<div style="display:flex;align-items:center;gap:12px;">' +
          '<div style="font-size:30px;line-height:1;">🔒</div>' +
          '<div style="flex:1;min-width:0;">' +
            '<div style="font-weight:900;font-size:16px;margin-bottom:3px;">Unlock your AI band score &amp; feedback</div>' +
            '<div style="font-size:12.5px;opacity:0.92;line-height:1.5;">See your real band, detailed corrections and model answers. Upgrade to <b>Premium</b> — one code unlocks instant AI scoring across all skills.</div>' +
          '</div>' +
          '<div style="background:rgba(255,255,255,0.18);border-radius:10px;padding:9px 14px;font-weight:800;font-size:13px;white-space:nowrap;">💎 Upgrade</div>' +
        '</div>';
      function go() { openUpgradeModal((skill || 'result') + '_result_upsell'); }
      card.addEventListener('click', go);
      card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      card.addEventListener('mouseover', function () { card.style.transform = 'translateY(-2px)'; card.style.boxShadow = '0 8px 22px rgba(124,58,237,0.45)'; });
      card.addEventListener('mouseout',  function () { card.style.transform = 'translateY(0)';     card.style.boxShadow = '0 6px 18px rgba(124,58,237,0.35)'; });
      if (opts && opts.prepend && container.firstChild) container.insertBefore(card, container.firstChild);
      else container.appendChild(card);
      return card;
    } catch (e) { return null; }
  }

  // Show a tier-confirmation step right after a code validates, BEFORE the test
  // starts, so the candidate knows whether they have AI scoring. Premium → a
  // quick positive confirm; Regular → a heads-up + an Upgrade option (and a
  // "Continue as regular" path). opts.onContinue() proceeds into the test.
  // Admins skip the notice. Reuses openUpgradeModal for the purchase CTA.
  function showTierNotice(opts) {
    opts = opts || {};
    var onContinue = typeof opts.onContinue === 'function' ? opts.onContinue : function () {};
    try {
      if (typeof document === 'undefined' || isAdmin()) { onContinue(); return null; }
      var premium = (opts.tier === 'premium') || (opts.premiumEntry === true);
      var skill = opts.skill || '';
      var overlay = document.createElement('div');
      overlay.className = 'pg-tier-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(15,23,42,0.55);display:flex;align-items:center;justify-content:center;padding:20px;';
      overlay.innerHTML =
        '<div role="dialog" aria-modal="true" style="background:#fff;border-radius:18px;max-width:420px;width:100%;padding:26px 24px;box-shadow:0 20px 60px rgba(0,0,0,0.35);text-align:center;font-family:inherit;">' +
          (premium
            ? '<div style="font-size:44px;line-height:1;margin-bottom:10px;">✅</div>' +
              '<h3 style="margin:0 0 8px;font-size:20px;color:#16a34a;">Premium unlocked</h3>' +
              '<p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.55;">You\'ll get <b>instant AI band scoring &amp; detailed feedback</b> at the end of this test.</p>' +
              '<button class="pg-tier-go" style="width:100%;padding:14px;border:none;border-radius:12px;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-weight:800;font-size:15px;cursor:pointer;">Start test →</button>'
            : '<div style="font-size:44px;line-height:1;margin-bottom:10px;">ℹ️</div>' +
              '<h3 style="margin:0 0 8px;font-size:20px;color:#d97706;">Regular access</h3>' +
              '<p style="margin:0 0 8px;font-size:14px;color:#475569;line-height:1.55;">This code does <b>not</b> include AI scoring. You\'ll still get your answers, <b>model samples</b> and <b>topic vocabulary</b> — but <b>no AI band score</b>.</p>' +
              '<p style="margin:0 0 18px;font-size:12.5px;color:#92400e;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:8px 10px;">💡 Want your real band, corrections &amp; AI feedback? Upgrade to Premium.</p>' +
              '<button class="pg-tier-up" style="width:100%;padding:13px;border:none;border-radius:12px;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;font-weight:800;font-size:15px;cursor:pointer;margin-bottom:8px;">💎 Upgrade to Premium</button>' +
              '<button class="pg-tier-go" style="width:100%;padding:12px;border:1px solid #cbd5e1;border-radius:12px;background:#f8fafc;color:#475569;font-weight:700;font-size:14px;cursor:pointer;">Continue as regular →</button>') +
        '</div>';
      document.body.appendChild(overlay);
      var done = false;
      function close() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }
      function go() { if (done) return; done = true; close(); try { onContinue(); } catch (e) {} }
      var goBtn = overlay.querySelector('.pg-tier-go');
      if (goBtn) goBtn.addEventListener('click', go);
      var upBtn = overlay.querySelector('.pg-tier-up');
      if (upBtn) upBtn.addEventListener('click', function () { openUpgradeModal((skill || 'entry') + '_tier_upsell'); });
      return overlay;
    } catch (e) { onContinue(); return null; }
  }

  // Derive the skill name from the reason string so applyLockBadge can re-check
  // isPremiumTier(skill) at click time. Reasons follow the convention
  //   <prefix>_<skill>[_<exam>]  (e.g. 'plus_speaking', 'part_practice_listening_cefr',
  //   'listening_result_#aiAnalyzeBtn').
  function _skillFromReason(reason) {
    var r = (reason || '').toString();
    if (r.indexOf('speaking')  !== -1) return 'speaking';
    if (r.indexOf('writing')   !== -1) return 'writing';
    if (r.indexOf('reading')   !== -1) return 'reading';
    if (r.indexOf('listening') !== -1) return 'listening';
    return '';
  }

  function _unlockEl(el) {
    if (!el) return;
    el.dataset.pgLocked = '0';
    el.classList.remove('pg-locked');
    var b = el.querySelector(':scope > .pg-lock-badge');
    if (b) b.remove();
  }

  // Re-evaluate every locked element. Called when the page learns the user
  // has become premium (e.g. async Google email-auth unlock completes after
  // DOMContentLoaded-time decoration already locked things).
  function _refreshLocks() {
    try {
      var nodes = document.querySelectorAll('[data-pg-locked="1"]');
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        var sk = el.dataset.pgSkill || '';
        if ((sk && isPremiumTier(sk)) || isAdmin()) _unlockEl(el);
      }
    } catch (e) {}
  }

  function applyLockBadge(el, reason) {
    if (!el || el.dataset.pgLocked === '1') return;
    var skill = _skillFromReason(reason);
    // If the user is already premium for this skill (or admin), don't lock at all.
    if ((skill && isPremiumTier(skill)) || isAdmin()) return;
    el.dataset.pgLocked = '1';
    if (skill) el.dataset.pgSkill = skill;
    el.classList.add('pg-locked');
    var badge = document.createElement('span');
    badge.className = 'pg-lock-badge';
    badge.textContent = '🔒 Premium';
    el.appendChild(badge);
    el.addEventListener('click', function (e) {
      // Re-check at click time so a lock applied before async sign-in completed
      // self-corrects on first click instead of trapping a real premium user.
      var sk = el.dataset.pgSkill || '';
      if ((sk && isPremiumTier(sk)) || isAdmin()) {
        _unlockEl(el);
        return; // let the click through to original handlers
      }
      e.preventDefault();
      e.stopImmediatePropagation();
      openUpgradeModal(reason || el.getAttribute('data-pg-reason') || 'lock');
    }, true);
  }

  // Listen for late premium signals (Google sign-in completing async) so locked
  // tiles visually unlock without requiring the user to click first.
  try {
    window.addEventListener('mockStream:premiumUnlocked', _refreshLocks);
    window.addEventListener('mockStream:userSignedIn',    _refreshLocks);
  } catch (e) {}

  window.PremiumGate = {
    isPremiumTier:     isPremiumTier,
    isAdmin:           isAdmin,
    hasTaken:          hasTaken,
    attemptCount:      attemptCount,
    recordOpen:        recordOpen,
    recordSubmit:      recordSubmit,
    fetchTakenForUser: fetchTakenForUser,
    openUpgradeModal:  openUpgradeModal,
    renderUpsellCard:  renderUpsellCard,
    showTierNotice:    showTierNotice,
    applyLockBadge:    applyLockBadge,
    _normName:         _normName,
    _center:           _center,
    _SB_URL:           SB_URL,
    _SB_ANON:          SB_ANON,
    _LS_KEY:           LS_KEY,
    _LS_MAX:           LS_MAX
  };
})();
