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

  function openUpgradeModal(reason) {
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
    function close() { if (_modalEl) { _modalEl.remove(); _modalEl = null; } }
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
    applyLockBadge:    applyLockBadge,
    _normName:         _normName,
    _center:           _center,
    _SB_URL:           SB_URL,
    _SB_ANON:          SB_ANON,
    _LS_KEY:           LS_KEY,
    _LS_MAX:           LS_MAX
  };
})();
