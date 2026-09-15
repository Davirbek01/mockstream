// ============================================================================
// email-code-modal.js — the one place a student types the code we emailed.
// ----------------------------------------------------------------------------
// Every web email sign-in (the mock sign-in gate and the sidebar in
// landing-v3.html, the VIP box's email branch, the welcome card in index.html)
// sends the code itself and then hands over to MsEmailCode.open(). The code is
// entered HERE, in a popup of its own, never in a row squeezed under the
// sign-in buttons. Measured on 2026-09-14, before this existed:
//
//   • Students typed the mock or VIP code their teacher gave them into the
//     email-code box. All three are 8 digits, so nothing looked wrong — the
//     server just answered "token has expired or is invalid", and at Bekzod's
//     centre 64 codes were rejected against 74 accepted in one day.
//   • Students pressed "send" again while the first mail was on its way. Each
//     new code cancels the previous one, so the code in the mail that DID
//     arrive no longer worked. 14 addresses asking 2+ times produced two thirds
//     of all rejections.
//   • About half the students who asked for a code never typed anything —
//     the mail was late, or in Spam / Promotions, and they left.
//
// So the popup says, before anything else, what this code is and what it is
// not; shows the resend countdown instead of hiding it inside an error; and
// says where the mail may have gone.
//
// Plain ES5, no build step. ⚠️ Pages serves site/*.js with max-age=14400 —
// bump the ?v= on BOTH script tags (landing-v3.html, index.html) on every edit.
// ============================================================================
(function () {
  'use strict';

  var COOLDOWN_MS = 60000;
  // The same key every sender already writes, so the countdown is right no
  // matter which of the four entry points sent the last code.
  function cdKey(email) { return 'ms_email_cd_' + email; }

  function remainingMs(email) {
    try {
      var last = parseInt(localStorage.getItem(cdKey(email)) || '0', 10);
      return Math.max(0, COOLDOWN_MS - (Date.now() - last));
    } catch (_e) { return 0; }
  }

  function authClient() {
    var a = window.MockStream && window.MockStream.auth;
    return (a && typeof a.getClient === 'function') ? a.getClient() : null;
  }

  // Codes this tab just used to open a mock or unlock VIP — recorded by
  // mock-code-verifier.js (msRememberAccessCode). Compared in the browser
  // only: asking the server "is this a valid mock code?" would hand anyone a
  // way to test guesses.
  function isRecentAccessCode(code) {
    try {
      var list = JSON.parse(sessionStorage.getItem('ms_recent_access_codes') || '[]');
      return Array.isArray(list) && list.indexOf(code) !== -1;
    } catch (_e) { return false; }
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var STYLE_ID = 'msec-style';
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var css =
      '.msec-overlay{position:fixed;inset:0;z-index:100050;display:flex;align-items:center;justify-content:center;' +
        'padding:16px;background:rgba(15,23,42,.72);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}' +
      '.msec-card{position:relative;width:100%;max-width:400px;max-height:94vh;overflow-y:auto;box-sizing:border-box;' +
        'background:var(--card,#fff);color:var(--ink,#0f172a);border-radius:20px;padding:24px 20px 18px;' +
        'box-shadow:0 24px 64px rgba(0,0,0,.35);font-family:inherit;animation:msecUp .25s ease}' +
      '@keyframes msecUp{from{transform:translateY(14px);opacity:0}to{transform:none;opacity:1}}' +
      '.msec-x{position:absolute;top:10px;right:10px;width:34px;height:34px;border:0;border-radius:10px;' +
        'background:transparent;color:var(--muted,#64748b);font-size:18px;cursor:pointer}' +
      '.msec-x:hover{background:rgba(100,116,139,.12)}' +
      '.msec-icon{text-align:center;font-size:34px;line-height:1;margin-bottom:8px}' +
      '.msec-title{margin:0 0 6px;text-align:center;font-size:18px;font-weight:800;line-height:1.35}' +
      '.msec-sent{margin:0 0 14px;text-align:center;font-size:13px;line-height:1.5;color:var(--muted,#64748b);word-break:break-word}' +
      '.msec-sent b{color:var(--ink,#0f172a)}' +
      '.msec-note{display:flex;gap:10px;margin:0 0 14px;padding:12px 13px;border-radius:12px;' +
        'background:rgba(245,158,11,.12);border:1.5px solid rgba(245,158,11,.55);font-size:12.5px;line-height:1.55}' +
      '.msec-note-ico{font-size:17px;line-height:1.2;flex-shrink:0}' +
      '.msec-note b{display:block;margin-bottom:2px;font-size:13px}' +
      '.msec-input{display:block;width:100%;box-sizing:border-box;padding:14px 12px;border-radius:12px;' +
        'border:2px solid var(--ring,#cbd5e1);background:var(--bg,#fff);color:var(--ink,#0f172a);' +
        'font-size:26px;font-weight:800;letter-spacing:.32em;text-align:center;outline:none;font-variant-numeric:tabular-nums}' +
      '.msec-input::placeholder{font-size:15px;font-weight:600;letter-spacing:normal;color:var(--muted,#94a3b8)}' +
      '.msec-input:focus{border-color:var(--brand,#4f46e5)}' +
      '.msec-msg{min-height:18px;margin:8px 2px 0;font-size:12.5px;line-height:1.5;text-align:center;color:var(--muted,#64748b)}' +
      '.msec-msg.err{color:#dc2626}.msec-msg.ok{color:#15803d}' +
      '.msec-primary{display:block;width:100%;margin-top:10px;padding:13px;border:0;border-radius:12px;cursor:pointer;' +
        'background:var(--brand,#4f46e5);color:#fff;font-size:14.5px;font-weight:700}' +
      '.msec-primary:disabled{opacity:.6;cursor:default}' +
      '.msec-hints{margin:14px 0 0;padding:0;list-style:none;font-size:12px;line-height:1.55;color:var(--muted,#64748b)}' +
      '.msec-hints li{display:flex;gap:8px;margin-top:6px}' +
      '.msec-row{display:flex;gap:8px;margin-top:14px}' +
      '.msec-link{flex:1;padding:10px 6px;border-radius:10px;border:1.5px solid var(--ring,#e2e8f0);background:transparent;' +
        'color:var(--ink,#0f172a);font-size:12.5px;font-weight:600;cursor:pointer}' +
      '.msec-link:disabled{color:var(--muted,#94a3b8);cursor:default}';
    var st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = css;
    document.head.appendChild(st);
  }

  var current = null;

  /**
   * Open the code popup for an address a code was just sent to.
   *
   * opts.email          the address the code went to (required)
   * opts.resend()       async; sends a fresh code with the page's own options.
   *                     Resolve { ok:true } or { ok:false, text:'…' }.
   * opts.onVerified()   called once the session exists
   * opts.onChangeEmail() optional; the student wants a different address
   * opts.justSent       true when the page sent a code this moment (default);
   *                     false when reopening on a cooldown, so no "sent" claim
   */
  function open(opts) {
    opts = opts || {};
    var email = String(opts.email || '').trim().toLowerCase();
    if (!email) return;
    close();
    injectStyle();

    var justSent = opts.justSent !== false;
    var ov = document.createElement('div');
    ov.className = 'msec-overlay';
    ov.innerHTML =
      '<div class="msec-card" role="dialog" aria-modal="true" aria-labelledby="msecTitle">' +
        '<button type="button" class="msec-x" aria-label="Yopish">&#10005;</button>' +
        '<div class="msec-icon">&#9993;&#65039;</div>' +
        '<h3 class="msec-title" id="msecTitle">' +
          (justSent ? 'Emailingizga tasdiqlash kodi yuborildi' : 'Emailingizdagi kodni kiriting') + '</h3>' +
        '<p class="msec-sent">8 xonali kod <b>' + esc(email) + '</b> manziliga yuborildi.</p>' +
        '<div class="msec-note" role="note">' +
          '<span class="msec-note-ico">&#9888;&#65039;</span>' +
          '<span><b>Diqqat: bu mock yoki VIP kod emas</b>' +
          'Bu kod hisobingizga kirishingiz uchun emailingizga avtomatik yuborilgan bir martalik tasdiqlash kodi. ' +
          'Ustozingiz yoki markaz administratori bergan kodni bu yerga kiritmang.</span>' +
        '</div>' +
        '<input class="msec-input" id="msecCode" type="text" inputmode="numeric" autocomplete="one-time-code" ' +
          'maxlength="8" placeholder="8 xonali kod" autocorrect="off" spellcheck="false" aria-label="Emaildagi tasdiqlash kodi">' +
        '<p class="msec-msg" id="msecMsg" aria-live="polite"></p>' +
        '<button type="button" class="msec-primary" id="msecVerify">Tasdiqlash</button>' +
        '<ul class="msec-hints">' +
          '<li><span>&#9203;</span><span>Xat 1 daqiqagacha kechikishi mumkin. Topilmasa, &laquo;Spam&raquo; va &laquo;Promotions&raquo; papkalarini tekshiring.</span></li>' +
          '<li><span>&#128260;</span><span>Kodni qayta so&#8216;rasangiz, avvalgisi bekor bo&#8216;ladi &mdash; faqat eng so&#8216;nggi xatdagi kodni kiriting.</span></li>' +
        '</ul>' +
        '<div class="msec-row">' +
          '<button type="button" class="msec-link" id="msecResend"></button>' +
          '<button type="button" class="msec-link" id="msecChange">Boshqa email</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);

    var input  = ov.querySelector('#msecCode');
    var msg    = ov.querySelector('#msecMsg');
    var verBtn = ov.querySelector('#msecVerify');
    var resBtn = ov.querySelector('#msecResend');
    var busy = false;

    function say(text, kind) {
      msg.textContent = text || '';
      msg.className = 'msec-msg' + (kind ? ' ' + kind : '');
    }

    function tick() {
      var ms = remainingMs(email);
      if (ms > 0) {
        var total = Math.ceil(ms / 1000);
        var m = Math.floor(total / 60), s = total % 60;
        resBtn.disabled = true;
        resBtn.textContent = 'Qayta yuborish — ' + m + ':' + (s < 10 ? '0' : '') + s;
      } else {
        resBtn.disabled = busy;
        resBtn.textContent = 'Kodni qayta yuborish';
      }
    }
    var timer = setInterval(tick, 1000);
    tick();

    async function verify() {
      if (busy) return;
      var code = String(input.value || '').replace(/\D/g, '');
      if (code.length !== 8) { say('Emailingizdagi 8 xonali kodni to‘liq kiriting.', 'err'); return; }
      if (isRecentAccessCode(code)) {
        say('Bu — mockni ochish uchun kiritgan kodingiz. Bu yerga emailingizga yuborilgan tasdiqlash kodini kiriting.', 'err');
        input.select();
        return;
      }
      var client = authClient();
      if (!client || !client.auth) { say('Xatolik yuz berdi. Sahifani yangilab, qayta urinib ko‘ring.', 'err'); return; }
      busy = true; verBtn.disabled = true; tick();
      say('Tekshirilmoqda…', '');
      try {
        // type 'email' covers first-time addresses too (Supabase's own
        // reference calls this "Verify Signup OTP"). The old second try with
        // type 'signup' never rescued anyone in the logs; it only doubled
        // every rejection.
        var r = await client.auth.verifyOtp({ email: email, token: code, type: 'email' });
        if (r && r.error) throw r.error;
        say('Kirildi ✓', 'ok');
        var done = opts.onVerified;
        close();
        if (typeof done === 'function') done();
      } catch (e) {
        console.warn('[email-code] verify failed:', e);
        busy = false; verBtn.disabled = false; tick();
        say('Kod noto‘g‘ri yoki muddati o‘tgan. Emailingizga kelgan eng so‘nggi kodni kiriting — mock yoki VIP kodni emas.', 'err');
        input.select();
      }
    }

    async function resend() {
      if (busy || remainingMs(email) > 0 || typeof opts.resend !== 'function') return;
      busy = true; resBtn.disabled = true;
      say('Yangi kod yuborilmoqda…', '');
      var r;
      try { r = await opts.resend(); } catch (e) { r = { ok: false }; }
      busy = false;
      if (r && r.ok) {
        try { localStorage.setItem(cdKey(email), String(Date.now())); } catch (_e) {}
        input.value = '';
        say('Yangi kod yuborildi. Avvalgi kod endi ishlamaydi.', 'ok');
        input.focus();
      } else {
        say((r && r.text) || 'Kod yuborilmadi. Birozdan so‘ng qayta urinib ko‘ring.', 'err');
      }
      tick();
    }

    input.addEventListener('input', function () {
      var digits = input.value.replace(/\D/g, '').slice(0, 8);
      if (digits !== input.value) input.value = digits;
      if (msg.className.indexOf('err') !== -1) say('', '');
      // A full code submits itself — including a pasted one.
      if (digits.length === 8) verify();
    });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') verify(); });
    verBtn.addEventListener('click', verify);
    resBtn.addEventListener('click', resend);
    ov.querySelector('#msecChange').addEventListener('click', function () {
      var cb = opts.onChangeEmail;
      close();
      if (typeof cb === 'function') cb();
    });
    ov.querySelector('.msec-x').addEventListener('click', close);
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);

    current = { el: ov, timer: timer, onKey: onKey };
    setTimeout(function () { try { input.focus(); } catch (_e) {} }, 60);
  }

  function close() {
    if (!current) return;
    clearInterval(current.timer);
    document.removeEventListener('keydown', current.onKey);
    if (current.el && current.el.parentNode) current.el.parentNode.removeChild(current.el);
    current = null;
  }

  window.MsEmailCode = { open: open, close: close, remainingMs: remainingMs };
})();
