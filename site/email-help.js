// ============================================================================
// email-help.js — two small things that decide whether a student gets in.
// ----------------------------------------------------------------------------
// Measured on 2026-09-10, after email sign-in became the main way in:
//
//   • 40+ addresses sit on Resend's suppression list. Four of them are
//     "@gamil.com", one is "@gail.com". Those students typed their address
//     wrong, the mail bounced, and Resend now refuses that address FOREVER —
//     so even a corrected retry from the same person looks, to them, like the
//     site is broken.
//
//   • Every failure path said the same thing: "try again later". For a
//     suppressed or misspelled address that is simply false. Later never
//     comes, and the student keeps pressing the button.
//
// So: catch the typo BEFORE the send, and when a send does fail, say which
// kind of failure it was.
//
// Plain ES5, no build step, loaded with a <script> tag like everything else
// in site/. Defined ONCE and used from every sign-in path — see
// [[reference_shared_helper_across_pages]] for what happens otherwise.
// ============================================================================
(function () {
  'use strict';

  // The domains our students actually use. Anything within two edits of one
  // of these, but not equal to it, is probably a slip.
  var KNOWN = [
    'gmail.com', 'mail.ru', 'yandex.ru', 'yandex.com', 'yahoo.com',
    'outlook.com', 'hotmail.com', 'icloud.com', 'inbox.ru', 'bk.ru',
    'list.ru', 'internet.ru', 'proton.me', 'protonmail.com',
    'umail.uz', 'mail.uz', 'exam.uz', 'edu.uz'
  ];

  // Slips too common to leave to the distance check, and a couple the
  // distance check would miss because they are two edits from BOTH gmail.com
  // and a real domain.
  var EXACT = {
    'gamil.com': 'gmail.com',   'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',    'gmaill.com': 'gmail.com',
    'gmali.com': 'gmail.com',   'gnail.com': 'gmail.com',
    'gmil.com': 'gmail.com',    'gmaul.com': 'gmail.com',
    'gail.com': 'gmail.com',    'ymail.com': 'gmail.com',
    'gmail.con': 'gmail.com',   'gmail.cm': 'gmail.com',
    'gmail.co': 'gmail.com',    'gmail.comm': 'gmail.com',
    'gmail.ru': 'gmail.com',    'gmail.uz': 'gmail.com',
    'mail.ri': 'mail.ru',       'mail.rru': 'mail.ru',
    'mial.ru': 'mail.ru',       'maill.ru': 'mail.ru',
    'yaho.com': 'yahoo.com',    'yahooo.com': 'yahoo.com',
    'outlok.com': 'outlook.com','hotmial.com': 'hotmail.com',
    'iclod.com': 'icloud.com',  'icloud.co': 'icloud.com'
  };

  /** Classic Levenshtein, bailing out once it is clearly too far. */
  function distance(a, b) {
    if (a === b) return 0;
    if (Math.abs(a.length - b.length) > 2) return 99;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur[0] = i;
      var best = cur[0];
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(
          prev[j] + 1,
          cur[j - 1] + 1,
          prev[j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1)
        );
        if (cur[j] < best) best = cur[j];
      }
      if (best > 2) return 99;                 // no route back under 2
      prev = cur.slice();
    }
    return prev[b.length];
  }

  /**
   * The address this one was probably meant to be, or null.
   *
   * Only ever a SUGGESTION. "email.com" is one edit from "gmail.com" and is a
   * real domain, so this must never rewrite anything on its own — show it,
   * let the student decide, and send whatever they actually typed.
   */
  function suggest(email) {
    var s = String(email || '').trim().toLowerCase();
    var at = s.lastIndexOf('@');
    if (at < 1 || at === s.length - 1) return null;

    var local = s.slice(0, at);
    var domain = s.slice(at + 1);
    if (!local || domain.indexOf('.') < 0) return null;

    if (EXACT[domain]) return local + '@' + EXACT[domain];

    for (var i = 0; i < KNOWN.length; i++) {
      if (domain === KNOWN[i]) return null;    // already right
    }
    var bestDomain = null, bestScore = 3;
    for (var k = 0; k < KNOWN.length; k++) {
      var d = distance(domain, KNOWN[k]);
      // A one-edit slip on a short domain like "bk.ru" is as likely to be a
      // different real domain, so short names need an exact match.
      if (d < bestScore && KNOWN[k].length >= 8) { bestScore = d; bestDomain = KNOWN[k]; }
    }
    return bestDomain ? local + '@' + bestDomain : null;
  }

  /**
   * What went wrong with a send, in words a student can act on.
   *
   * Returns { text, permanent } — `permanent` means retrying the SAME address
   * will not help, which is exactly the case the old "try again later" got
   * backwards.
   */
  function sendError(err) {
    var msg = String((err && (err.message || err.msg)) || '').toLowerCase();
    var code = String((err && (err.code || err.error_code)) || '').toLowerCase();
    var status = Number(err && err.status) || 0;

    if (status === 429 || code.indexOf('rate_limit') >= 0 ||
        msg.indexOf('rate limit') >= 0 || msg.indexOf('too many') >= 0) {
      return {
        text: '⏳ Juda ko‘p urinish. 5–10 daqiqadan keyin qayta urining.',
        permanent: false
      };
    }
    // GoTrue reports an SMTP refusal as a 500 "error sending ... email".
    // Resend refuses a suppressed address exactly that way, and no amount of
    // waiting changes it.
    if (msg.indexOf('sending') >= 0 && msg.indexOf('email') >= 0) {
      return {
        text: '❌ Bu manzilga xat yetmadi. Imlosini tekshiring '
            + '(masalan .con emas .com), yoki Google bilan kiring.',
        permanent: true
      };
    }
    if (msg.indexOf('invalid') >= 0 && msg.indexOf('email') >= 0) {
      return { text: '❌ Email manzili noto‘g‘ri ko‘rinyapti.', permanent: true };
    }
    return { text: '❌ Kod yuborilmadi. Qayta urinib ko‘ring.', permanent: false };
  }

  /**
   * Wire a "did you mean …?" line under an email input. Clicking it accepts
   * the correction. Never blocks typing and never blocks sending.
   *
   * `input` is the <input>, `accent` an optional colour for the link.
   */
  function attachTypoHint(input, accent) {
    if (!input || input.getAttribute('data-typo-wired') === '1') return;
    input.setAttribute('data-typo-wired', '1');

    var hint = document.createElement('div');
    // width:100% plus a horizontal margin is 100% + 4px, which is enough to
    // give the gate card a horizontal scrollbar. Pad, do not margin.
    hint.style.cssText = 'display:none;font-size:12.5px;line-height:1.4;margin:6px 0 0;'
                       + 'box-sizing:border-box;padding:0 2px;'
                       + 'color:#64748b;width:100%;flex-basis:100%;'
                       + 'overflow-wrap:anywhere;';
    var link = document.createElement('button');
    link.type = 'button';
    link.style.cssText = 'background:none;border:none;padding:0;font:inherit;cursor:pointer;'
                       + 'font-weight:700;text-decoration:underline;text-align:left;'
                       + 'white-space:normal;word-break:break-word;max-width:100%;'
                       + 'color:' + (accent || '#4f46e5') + ';';
    hint.appendChild(document.createTextNode('Shuni nazarda tutdingizmi: '));
    hint.appendChild(link);
    hint.appendChild(document.createTextNode(' ?'));
    // The confirm row, hidden until the student tries to send an address we
    // have a correction for. Shares the hint's placement.
    var row = document.createElement('div');
    row.style.cssText = 'display:none;gap:8px;margin:8px 0 0;box-sizing:border-box;'
                      + 'padding:0 2px;width:100%;flex-basis:100%;flex-wrap:wrap;';
    function mkBtn(bg, fg, bd) {
      var b = document.createElement('button');
      b.type = 'button';
      b.style.cssText = 'flex:1 1 46%;min-width:0;padding:9px 8px;border-radius:10px;'
                      + 'font-size:12.5px;font-weight:700;cursor:pointer;line-height:1.25;'
                      + 'white-space:normal;word-break:break-word;'
                      + 'background:' + bg + ';color:' + fg + ';border:1px solid ' + bd + ';';
      return b;
    }
    var useFix  = mkBtn(accent || '#4f46e5', '#fff', accent || '#4f46e5');
    var useMine = mkBtn('transparent', '#64748b', '#cbd5e1');
    row.appendChild(useFix);
    row.appendChild(useMine);

    // The sign-in gate puts its input in a flex ROW next to the send
    // arrow. Dropping the hint straight after the input makes it a third
    // column: the input collapses to a few characters wide and the card
    // grows a horizontal scrollbar. Go out to the row and sit under it.
    var anchor = input;
    try {
      var par = input.parentNode;
      if (par && window.getComputedStyle &&
          /flex/.test(window.getComputedStyle(par).display) &&
          !/column/.test(window.getComputedStyle(par).flexDirection)) {
        anchor = par;
      }
    } catch (_e) {}
    if (anchor.parentNode) {
      anchor.parentNode.insertBefore(hint, anchor.nextSibling);
      anchor.parentNode.insertBefore(row, hint.nextSibling);
    }


    function check() {
      var s = suggest(input.value);
      input.setAttribute('data-typo-suggest', s || '');
      // A changed address is a new question: drop any previous answer.
      row.style.display = 'none';
      input.removeAttribute('data-typo-ack');
      if (!s) { hint.style.display = 'none'; return; }
      link.textContent = s;
      hint.style.display = '';
    }

    // How needsTypoConfirm drives this particular input.
    input._msTypoRow = {
      ask: function (typed, fixed, pick) {
        hint.style.display = 'none';
        useFix.textContent  = fixed;
        useMine.textContent = 'Baribir ' + typed;
        useFix.onclick  = function () { row.style.display = 'none'; pick(fixed); };
        useMine.onclick = function () { row.style.display = 'none'; pick(typed); };
        row.style.display = 'flex';
      }
    };
    link.addEventListener('click', function () {
      input.value = link.textContent;
      hint.style.display = 'none';
      try { input.focus(); } catch (_e) {}
    });
    // On blur, and while typing once the address looks finished — a hint that
    // appears mid-domain ("ali@g") would just be noise.
    input.addEventListener('blur', check);
    input.addEventListener('input', function () {
      if (/@[^@]+\.[a-z]{2,}$/i.test(input.value.trim())) check();
      else hint.style.display = 'none';
    });
  }

  /**
   * Call at the top of a send handler. Returns TRUE when a choice is now on
   * screen and the caller must stop; `proceed` runs once the student picks.
   *
   * A hint alone was not enough, and the reason is structural: a FIRST bounce
   * cannot be seen at send time. The receiving server rejects the mail seconds
   * later, and by the time anyone could say anything Resend has suppressed the
   * address for good. This is the only moment that can be defended. It still
   * never blocks — "Baribir" sends exactly what was typed.
   */
  function needsTypoConfirm(input, proceed) {
    if (!input) return false;
    if (input.getAttribute('data-typo-ack') === '1') return false;
    var fixed = input.getAttribute('data-typo-suggest') || suggest(input.value);
    if (!fixed) return false;
    if (!input._msTypoRow) return false;        // not wired; let the send go

    var typed = String(input.value || '').trim().toLowerCase();
    input._msTypoRow.ask(typed, fixed, function (chosen) {
      input.value = chosen;
      input.setAttribute('data-typo-ack', '1');
      input.setAttribute('data-typo-suggest', '');
      if (typeof proceed === 'function') proceed();
    });
    return true;
  }

  window.MsEmail = {
    suggest: suggest,
    sendError: sendError,
    attachTypoHint: attachTypoHint,
    needsTypoConfirm: needsTypoConfirm
  };
})();
