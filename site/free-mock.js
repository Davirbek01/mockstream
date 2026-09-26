/* ============================================================================
 * free-mock — one mock per set a student may sit once, without a code
 * ----------------------------------------------------------------------------
 * Every locked card in the picker used to show its topics in full, so a code
 * bought nothing a student could see: the content was already on the screen.
 * This changes both halves of that.
 *
 *   - One mock per set (Mock 1 by default) opens without a code, once per
 *     account, ever — with the full AI report, because a trial that hides the
 *     best part of the product argues against itself.
 *   - Every mock still locked has its topic list blurred behind a lock, so the
 *     card still says what it is and no longer gives away what is in it.
 *
 * Both follow the centre's existing access settings. Turn global access on and
 * nothing here applies: no blur, no lock, no badge — the free mock is simply
 * one of many open ones. That falls out of reading the same flags the rest of
 * the site reads, rather than from a rule of its own.
 *
 * How the free mock actually opens: it is published into
 * window._centerAccess.mockAccess, the per-mock unlock the admin panel has
 * always written by hand. Every skill's launch path already consults that, so
 * none of them needed changing.
 *
 * The claim is spent when the mock is opened, not when it is submitted —
 * otherwise a student could open it repeatedly, read the questions, and never
 * finish. That is a real cost to someone who opens one by accident, and the
 * honest trade: the alternative gives the whole set away.
 * ==========================================================================*/

(function () {
  'use strict';

  var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';

  var cfg = null;        // { cefr_speaking: 1, ... }
  var usedSets = null;   // ['cefr_reading', ...] — null until known
  var who = '';          // the signed-in account, '' for a guest

  /* ── who is this ─────────────────────────────────────────────────────── */

  function identity() {
    try {
      var u = window.MockStream && window.MockStream.auth &&
              window.MockStream.auth.getCurrentUser && window.MockStream.auth.getCurrentUser();
      if (u && u.email) return String(u.email).toLowerCase();
    } catch (e) { }
    // The Telegram sign-in stores its own account the same way the rest of the
    // site reads it back.
    try {
      var s = JSON.parse(localStorage.getItem('ms_auth_session') || 'null');
      if (s && s.email) return String(s.email).toLowerCase();
    } catch (e) { }
    return '';
  }

  function rpc(fn, body, keepalive) {
    // keepalive matters for the claim: clicking the card starts the exam, the
    // browser leaves this page immediately, and an ordinary fetch is cancelled
    // on the way out. The claim then never lands and the free mock can be sat
    // again and again — which is exactly what happened on the first day.
    return fetch(SB_URL + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY },
      body: JSON.stringify(body),
      keepalive: !!keepalive
    }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }

  /* ── what counts as unlocked already ─────────────────────────────────── */

  /** True when this student can already open everything — nothing to tease. */
  function everythingOpen() {
    try {
      if (window.isSuperAccessUnlocked && window.isSuperAccessUnlocked()) return true;
      var ca = window._centerAccess || {};
      if (ca.globalAccess && ca.globalAccess !== 'off') return true;
    } catch (e) { }
    return false;
  }

  function skillOpen(skill) {
    try {
      var ca = window._centerAccess || {};
      var lvl = ca.skillAccess && ca.skillAccess[skill];
      return !!(lvl && lvl !== 'off');
    } catch (e) { return false; }
  }

  /* ── the sets ────────────────────────────────────────────────────────── */

  function setKey(exam, skill) { return exam + '_' + skill; }

  function freeNumber(exam, skill) {
    if (!cfg) return null;
    var n = cfg[setKey(exam, skill)];
    return (typeof n === 'number' && n > 0) ? n : null;
  }

  function stillAvailable(exam, skill) {
    if (!who || !usedSets) return false;
    return usedSets.indexOf(setKey(exam, skill)) === -1;
  }

  /**
   * Publish the still-unspent free mocks as per-mock unlocks, which is what
   * every launch path already understands. Premium tier: the free sitting
   * includes its AI report.
   */
  function publishUnlocks() {
    if (!cfg || !who || !usedSets) return;
    try {
      var ca = window._centerAccess = window._centerAccess || { mockAccess: {} };
      ca.mockAccess = ca.mockAccess || {};
      Object.keys(cfg).forEach(function (k) {
        var parts = k.split('_');            // cefr_speaking
        if (parts.length !== 2) return;
        if (usedSets.indexOf(k) !== -1) return;
        var n = cfg[k];
        if (!(typeof n === 'number' && n > 0)) return;
        // Both spellings of the number. The launch paths look this key up with
        // whatever they happen to hold: reading and speaking pad it to two
        // digits ('01') before asking, writing and listening do not. Publishing
        // one form meant the free reading mock still asked for a code.
        var entry = { tier: 'premium', free: true };
        ca.mockAccess[parts[0] + '_' + parts[1] + '_' + n] = entry;
        ca.mockAccess[parts[0] + '_' + parts[1] + '_' + String(n).padStart(2, '0')] = entry;
      });
    } catch (e) { }
  }

  /* ── the cards ───────────────────────────────────────────────────────── */

  var STYLE_ID = 'msFreeMockStyle';
  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = [
      /* Blur the topics, never the card's identity: the number, title, date and
         how many people sat it all stay readable. */
      '.ms-locked .ilet-sections,',
      '.ms-locked .ilet-mock-sections,',
      '.ms-locked .iret-passages,',
      '.ms-locked .cret-parts{',
      '  filter:blur(5px);opacity:.55;user-select:none;pointer-events:none;}',
      '.ms-locked{position:relative;}',
      '.ms-lockbadge{position:absolute;left:50%;top:58%;transform:translate(-50%,-50%);',
      '  display:flex;flex-direction:column;align-items:center;gap:5px;',
      '  background:rgba(15,23,42,.86);color:#fff;border-radius:14px;padding:11px 15px;',
      '  box-shadow:0 8px 24px rgba(0,0,0,.28);pointer-events:none;z-index:3;text-align:center;}',
      '.ms-lockbadge .i{font-size:18px;line-height:1;}',
      '.ms-lockbadge .t{font-size:12px;font-weight:700;}',
      '.ms-freeflag{background:#f59e0b;color:#241a00;font-weight:800;font-size:11px;',
      '  letter-spacing:.05em;padding:4px 9px;border-radius:999px;margin-left:4px;}',
      '.ms-usedbar{display:flex;align-items:center;justify-content:space-between;gap:10px;',
      '  background:#fff7ed;border:1px solid #fed7aa;border-radius:11px;',
      '  padding:9px 12px;margin:8px 0 2px;cursor:pointer;}',
      '.ms-usedbar-t{font-size:12.5px;font-weight:700;color:#9a3412;}',
      '.ms-usedbar-a{font-size:12.5px;font-weight:800;color:#c2410c;white-space:nowrap;}',
      '#msFreeUpsell{position:fixed;inset:0;z-index:2147483100;display:flex;',
      '  align-items:center;justify-content:center;padding:18px;}',
      '#msFreeUpsell .ms-up-back{position:absolute;inset:0;background:rgba(15,23,42,.55);}',
      '#msFreeUpsell .ms-up-box{position:relative;background:#fff;color:#0f172a;border-radius:18px;',
      '  padding:24px 22px 18px;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.3);',
      '  font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;}',
      '#msFreeUpsell h3{margin:0 0 6px;font-size:19px;}',
      '#msFreeUpsell p{margin:0 0 14px;color:#64748b;font-size:14px;}',
      '#msFreeUpsell .ms-up-gains{list-style:none;margin:0 0 18px;padding:0;display:flex;',
      '  flex-direction:column;gap:8px;font-size:14px;}',
      '#msFreeUpsell .ms-up-gains li{display:flex;gap:9px;align-items:flex-start;}',
      '#msFreeUpsell .ms-up-gains span{color:#059669;font-weight:800;}',
      '#msFreeUpsell .ms-up-cta{display:flex;gap:10px;flex-wrap:wrap;}',
      '#msFreeUpsell .ms-up-primary{background:#059669;color:#fff;border:0;border-radius:11px;',
      '  padding:12px 18px;font-weight:700;text-decoration:none;display:inline-block;}',
      '#msFreeUpsell .ms-up-ghost{background:transparent;border:1px solid #e2e8f0;color:#0f172a;',
      '  border-radius:11px;padding:12px 16px;font:600 14px/1 inherit;cursor:pointer;}',
      '#msFreeUpsell .ms-up-foot{margin:14px 0 0;font-size:13px;}',
      '#msFreeUpsell .ms-up-foot a{color:#7c3aed;}',
      '#msFreeUpsell .ms-up-x{position:absolute;top:10px;right:12px;background:none;border:0;',
      '  font-size:22px;line-height:1;color:#94a3b8;cursor:pointer;}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(st);
  }

  /**
   * Which set a card belongs to.
   *
   * Its id is the only thing every picker agrees on: the eight renderers each
   * stamp their own prefix (cspet-card-01, cret-card-1, iwet-card-3 …). The
   * first attempt read data-file instead, which the two speaking pickers never
   * write and which reading spells differently — so speaking and reading were
   * silently skipped while writing and listening worked.
   */
  var PREFIX = {
    cspet: ['cefr', 'speaking'],  ispet: ['ielts', 'speaking'],
    cwet:  ['cefr', 'writing'],   iwet:  ['ielts', 'writing'],
    cret:  ['cefr', 'reading'],   iret:  ['ielts', 'reading'],
    clet:  ['cefr', 'listening'], ilet:  ['ielts', 'listening']
  };

  function setOfCard(card) {
    var m = /^([a-z]+)-card-/.exec(card.id || '');
    if (m && PREFIX[m[1]]) return { exam: PREFIX[m[1]][0], skill: PREFIX[m[1]][1] };
    // Older markup that carries the page it opens.
    var f = (card.getAttribute('data-file') || '').toLowerCase();
    if (!f) return null;
    var exam = f.indexOf('ielts') !== -1 ? 'ielts' : 'cefr';
    var skill = f.indexOf('speaking') !== -1 ? 'speaking'
              : f.indexOf('writing') !== -1 ? 'writing'
              : f.indexOf('listening') !== -1 ? 'listening'
              : f.indexOf('reading') !== -1 ? 'reading' : null;
    return skill ? { exam: exam, skill: skill } : null;
  }

  function paintCards() {
    if (!cfg) return;
    // Until the answer about this account is back, say nothing: locking on an
    // unknown would put a lock over the student's own free mock for as long as
    // the query takes, and show it lifting a moment later.
    if (who && usedSets === null) return;
    // center-guard rebuilds window._centerAccess from scratch more than once,
    // which drops the unlocks published before its last pass. Publishing again
    // here costs nothing and keeps them present whenever a card is drawn.
    publishUnlocks();
    installStyle();
    var cards = document.querySelectorAll('.ilet-card, .cret-card, .iret-card');
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var s = setOfCard(card);
      if (!s) continue;
      if (everythingOpen() || skillOpen(s.skill)) { unlockCard(card); continue; }

      var mock = parseInt(card.getAttribute('data-mock'), 10);
      var free = freeNumber(s.exam, s.skill);
      var isFree = free !== null && mock === free;

      // The free mock stays open whatever its state. Blurring it once it is
      // spent would hide the one thing that makes the offer land: the student
      // sat this mock and can see exactly what they got. So the card keeps its
      // topics and carries a notice instead.
      if (isFree) {
        var left = stillAvailable(s.exam, s.skill);
        unlockCard(card, left);
        if (left) clearUsedBanner(card); else showUsedBanner(card);
        continue;
      }
      lockCard(card);
    }
  }

  function unlockCard(card, markFree) {
    card.classList.remove('ms-locked');
    if (markFree) clearUsedBanner(card);
    else {
      // The sitting is spent: the badge would be a promise the card cannot keep.
      var stale = card.querySelector('.ms-freeflag');
      if (stale) stale.remove();
    }
    var b = card.querySelector('.ms-lockbadge');
    if (b) b.remove();
    if (markFree && !card.querySelector('.ms-freeflag')) {
      var head = card.querySelector('.ilet-card-head, .cret-card-head, .iret-card-head');
      if (head) {
        var f = document.createElement('span');
        f.className = 'ms-freeflag';
        f.textContent = 'BEPUL';
        head.appendChild(f);
      }
    }
  }

  function clearUsedBanner(card) {
    var b = card.querySelector('.ms-usedbar');
    if (b) b.remove();
  }

  /** Says what happened, on the card, without taking anything away. */
  function showUsedBanner(card) {
    if (card.querySelector('.ms-usedbar')) return;
    var bar = document.createElement('div');
    bar.className = 'ms-usedbar';
    bar.innerHTML = '<span class="ms-usedbar-t">Bepul urinishingiz ishlatilgan</span>' +
                    '<span class="ms-usedbar-a">Kod olish →</span>';
    bar.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      showUpsell(card);
    });
    var foot = card.querySelector('.ilet-card-foot, .cret-card-foot, .iret-card-foot');
    if (foot && foot.parentNode) foot.parentNode.insertBefore(bar, foot);
    else card.appendChild(bar);
  }

  function lockCard(card) {
    if (/-card-disabled/.test(card.className)) return;   // "Coming soon" already says it
    card.classList.add('ms-locked');
    var flag = card.querySelector('.ms-freeflag');
    if (flag) flag.remove();
    if (!card.querySelector('.ms-lockbadge')) {
      var b = document.createElement('div');
      b.className = 'ms-lockbadge';
      b.innerHTML = '<span class="i">🔒</span><span class="t">Kod kerak</span>';
      card.appendChild(b);
    }
  }


  /* ── when the free sitting is spent ───────────────────────────────────────
   * The code gate is the right answer for a mock the student never had. It is
   * the wrong one here: they sat this exact mock, read their own analysis, and
   * came back to it. Telling them "enter a code" explains nothing and asks for
   * something they may not know how to get. So this says what happened, what a
   * code opens, and where to get one — with the code box still there for
   * anyone who already has one.
   */
  function centreContact() {
    var c = (window.SITE_CONFIG || {});
    return c.adminTelegram || c.telegramUrl || '';
  }
  function centreName() {
    var c = (window.SITE_CONFIG || {});
    return c.brandName || 'markazingiz';
  }

  function closeUpsell() {
    var m = document.getElementById('msFreeUpsell');
    if (m) m.remove();
  }

  function showUpsell(card) {
    closeUpsell();
    var link = centreContact();
    var wrap = document.createElement('div');
    wrap.id = 'msFreeUpsell';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-label', 'Bepul urinish ishlatilgan');
    wrap.innerHTML =
      '<div class="ms-up-back"></div>' +
      '<div class="ms-up-box">' +
        '<h3>Bepul urinishingiz ishlatilgan</h3>' +
        '<p>Bu mokni topshirdingiz va tahlilingizni oldingiz. Qolgan moklar kod bilan ochiladi.</p>' +
        '<ul class="ms-up-gains">' +
          '<li><span>✓</span>8 ta to‘plam — CEFR va IELTS, to‘rttala ko‘nikma</li>' +
          '<li><span>✓</span>Har to‘plamda o‘nlab variant</li>' +
          '<li><span>✓</span>Har topshiriqda to‘liq AI tahlili</li>' +
        '</ul>' +
        '<div class="ms-up-cta">' +
          (link ? '<a class="ms-up-primary" href="' + link + '" target="_blank" rel="noopener">Kod olish</a>' : '') +
          '<button type="button" class="ms-up-ghost" id="msUpHaveCode">Kodim bor</button>' +
        '</div>' +
        '<p class="ms-up-foot"><a href="/results/my-results.html">Oldingi natijangizni ko‘ring →</a></p>' +
        '<button type="button" class="ms-up-x" aria-label="Yopish">×</button>' +
      '</div>';
    document.body.appendChild(wrap);

    wrap.querySelector('.ms-up-back').addEventListener('click', closeUpsell);
    wrap.querySelector('.ms-up-x').addEventListener('click', closeUpsell);
    // Someone who already has a code should not be trapped behind the offer:
    // close it and let the card's own gate open, exactly as before.
    wrap.querySelector('#msUpHaveCode').addEventListener('click', function () {
      closeUpsell();
      var btn = card && card.querySelector('.ilet-take');
      if (btn) { upsellBypass = true; btn.click(); upsellBypass = false; }
    });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { closeUpsell(); document.removeEventListener('keydown', esc); }
    });
  }

  var upsellBypass = false;

  /* ── spending the claim ──────────────────────────────────────────────── */

  document.addEventListener('click', function (e) {
    if (!cfg || !who) return;
    var btn = e.target && e.target.closest && e.target.closest('.ilet-take');
    if (!btn) return;
    var card = btn.closest('.ilet-card, .cret-card, .iret-card');
    if (!card) return;
    var s = setOfCard(card);
    if (!s) return;
    var mock = parseInt(card.getAttribute('data-mock'), 10);
    if (freeNumber(s.exam, s.skill) !== mock) return;
    if (everythingOpen() || skillOpen(s.skill)) return;      // not a free sitting at all
    if (!stillAvailable(s.exam, s.skill)) {
      if (upsellBypass) return;                              // they said they have a code
      e.preventDefault();
      e.stopPropagation();
      showUpsell(card);
      return;
    }

    // Spend it. The insert is the lock, so two devices racing still yield one.
    var key = setKey(s.exam, s.skill);
    if (usedSets.indexOf(key) === -1) usedSets.push(key);
    rpc('claim_free_mock', { p_user: who, p_set: key, p_mock: mock }, true);
  }, true);

  /* ── start ───────────────────────────────────────────────────────────── */

  function start() {
    var ca = window._centerAccess || {};
    cfg = ca.freeMocks && Object.keys(ca.freeMocks).length ? ca.freeMocks : null;
    if (!cfg) return;                       // centre offers none — do nothing
    who = identity();
    installStyle();

    if (!who) {                             // a guest gets the teaser, not the gift
      usedSets = [];
      paintCards();
      watch();
      return;
    }
    rpc('free_mocks_used', { p_user: who }).then(function (list) {
      usedSets = Array.isArray(list) ? list : [];
      publishUnlocks();
      paintCards();
      watch();
    });
  }

  /** Cards arrive after their own fetches, and pickers redraw on filters. */
  function watch() {
    try {
      var mo = new MutationObserver(function () {
        clearTimeout(watch._t);
        watch._t = setTimeout(paintCards, 60);
      });
      mo.observe(document.body, { childList: true, subtree: true });
    } catch (e) {
      setInterval(paintCards, 1500);
    }
  }

  window.MsFreeMock = {
    numberFor: freeNumber,
    availableFor: stillAvailable,
    repaint: paintCards
  };

  // The centre's config decides everything here, so wait for it.
  document.addEventListener('mockStream:centerConfigLoaded', function () {
    // Fires on each of center-guard's passes: restart if this is the first,
    // otherwise just put the unlocks back into the object it just replaced.
    if (!cfg) { setTimeout(start, 0); }
    else { setTimeout(function () { publishUnlocks(); paintCards(); }, 0); }
  });
  if (window._centerAccess && window._centerAccess.freeMocks) setTimeout(start, 0);
})();
