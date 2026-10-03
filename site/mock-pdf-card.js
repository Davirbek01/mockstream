// mock-pdf-card.js — per-card "📄" button that offers that mock's PDF.
//
// The sidebar menu (pdf-menu.js) is an admin tool: pick a skill, pick a mock,
// download. This is the student-facing twin — one button on the mock card the
// person is already looking at, so nobody has to find the mock twice.
//
// What the menu offers comes from the manifest, not from guesswork:
//   Speaking / Writing  ->  Questions + Model answers (samples exist)
//   Reading / Listening ->  Questions only (there is no model-answer booklet)
//
// WHO MAY DOWNLOAD IS DECIDED ON THE SERVER, not here. The button is shown to
// everyone on purpose: a non-premium student should discover the feature and
// be told what unlocks it. `sign-mock-pdf` answers 402 for anyone without
// premium/ultra/VIP — including an ordinary mock code, which opens the exam
// but not the paper — and that 402 is what turns into the upgrade prompt
// below. Client-side flags are not used as the gate because they are
// trivially editable in the console.
(function () {
  var PDF_BASE = 'https://audio.mock-stream.com/pdf';
  var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var MANIFEST = null;
  var openEl = null;

  async function manifest() {
    if (MANIFEST) return MANIFEST;
    try {
      // Cache-busted on purpose: revalidation alone kept serving a stale
      // manifest for minutes after an upload (see pdf-menu.js).
      var r = await fetch(PDF_BASE + '/manifest.json?v=' + Date.now(),
                          { cache: 'no-store' });
      MANIFEST = r.ok ? await r.json() : {};
    } catch (_e) { MANIFEST = {}; }
    return MANIFEST;
  }

  function has(type, variant, n) {
    var m = (MANIFEST || {})[type];
    if (!m) return false;
    var list = m[variant === 'samples' ? 'samples' : 'questions'] || [];
    return list.indexOf(Number(n)) !== -1;
  }

  function style() {
    if (document.getElementById('mpc-style')) return;
    var s = document.createElement('style');
    s.id = 'mpc-style';
    s.textContent = [
      // Deliberately the same pill as the share button beside it — same
      // border, radius, padding and purple — so the card foot reads as one
      // row of controls rather than two unrelated shapes.
      '.mpc-btn{background:transparent;border:1px solid #c4b5fd;color:#6d28d9;',
      'border-radius:8px;padding:6px 10px;font-size:14px;line-height:1;',
      'cursor:pointer;margin-right:8px;white-space:nowrap;',
      'transition:background 120ms ease,border-color 120ms ease;}',
      '.mpc-btn:hover{background:#f5f3ff;border-color:#6d28d9;}',
      '.mpc-pop{position:absolute;z-index:99999;min-width:214px;background:#fff;',
      'border:1px solid #e2e8f0;border-radius:12px;padding:6px;',
      'box-shadow:0 12px 32px rgba(15,23,42,.16);font-size:13.5px;}',
      '.mpc-item{display:flex;align-items:center;gap:8px;width:100%;border:0;',
      'background:none;text-align:left;padding:9px 10px;border-radius:8px;',
      'cursor:pointer;font:inherit;color:#0f172a;}',
      '.mpc-item:hover{background:#f1f5f9;}',
      '.mpc-item[disabled]{opacity:.45;cursor:default;}',
      '.mpc-note{padding:8px 10px;color:#64748b;line-height:1.5;}',
      '.mpc-note b{color:#0f172a;}',
      '.mpc-up{display:block;width:100%;margin-top:6px;padding:9px 10px;border:0;',
      'border-radius:8px;cursor:pointer;font:inherit;font-weight:700;color:#fff;',
      'background:linear-gradient(135deg,#f59e0b,#d97706);}',
      '.mpc-err{padding:8px 10px;color:#b91c1c;line-height:1.45;}'
    ].join('');
    document.head.appendChild(s);
  }

  function close() {
    if (openEl) { openEl.remove(); openEl = null; }
  }

  function place(pop, btn) {
    var r = btn.getBoundingClientRect();
    pop.style.visibility = 'hidden';
    document.body.appendChild(pop);
    var w = pop.offsetWidth, h = pop.offsetHeight;
    var left = Math.min(r.left + window.scrollX, window.scrollX + window.innerWidth - w - 10);
    var top = r.bottom + window.scrollY + 6;
    // Not enough room underneath — hang it above the button instead.
    if (r.bottom + h + 12 > window.innerHeight) top = r.top + window.scrollY - h - 6;
    pop.style.left = Math.max(window.scrollX + 8, left) + 'px';
    pop.style.top = top + 'px';
    pop.style.visibility = '';
  }

  async function openMenu(btn) {
    close();
    style();
    var type = btn.getAttribute('data-mpc-type');
    var n = Number(btn.getAttribute('data-mpc-mock'));
    var pop = document.createElement('div');
    pop.className = 'mpc-pop';
    pop.innerHTML = '<div class="mpc-note">Yuklanmoqda…</div>';
    place(pop, btn);
    openEl = pop;

    await manifest();
    var q = has(type, null, n), s = has(type, 'samples', n);
    if (!q && !s) {
      pop.innerHTML = '<div class="mpc-note">Bu mok uchun PDF hali tayyorlanmagan.</div>';
      place(pop, btn);
      return;
    }
    var html = '<button class="mpc-item" data-mpc-v="">📄 Savollar</button>';
    if (s) html += '<button class="mpc-item" data-mpc-v="samples">📘 Namunaviy javoblar</button>';
    pop.innerHTML = html;
    pop.setAttribute('data-type', type);
    pop.setAttribute('data-mock', String(n));
    place(pop, btn);
  }

  function upgrade(pop, msg) {
    pop.innerHTML = '<div class="mpc-note"><b>Premium imkoniyat</b><br>'
      + (msg || 'PDF yuklab olish uchun premium yoki VIP kirish kerak.')
      + '</div><button class="mpc-up" id="mpc-up">Obuna bo‘lish</button>';
    var up = pop.querySelector('#mpc-up');
    if (up) up.addEventListener('click', function () {
      close();
      // Reuse the real subscription panel rather than inventing a second one.
      var b = document.getElementById('topbarSubscribeBtn');
      if (b) b.click();
    });
  }

  async function download(item) {
    var pop = item.closest('.mpc-pop');
    var type = pop.getAttribute('data-type');
    var n = Number(pop.getAttribute('data-mock'));
    var variant = item.getAttribute('data-mpc-v') === 'samples' ? 'samples' : null;
    var label = item.textContent;
    item.textContent = '⏳ Tayyorlanmoqda…';
    item.setAttribute('disabled', 'disabled');

    var headers = { 'Content-Type': 'application/json' };
    try {
      var c = window.MockStream && window.MockStream.auth
        && typeof window.MockStream.auth.getClient === 'function'
        ? window.MockStream.auth.getClient() : null;
      if (c && c.auth && typeof c.auth.getSession === 'function') {
        var sess = await c.auth.getSession();
        var tok = sess && sess.data && sess.data.session && sess.data.session.access_token;
        if (tok) headers.Authorization = 'Bearer ' + tok;
      }
    } catch (_e) {}
    try {
      var vip = sessionStorage.getItem('vipToken');
      if (vip) headers['x-vip-token'] = vip;
    } catch (_e) {}

    try {
      var r = await fetch(SB_URL + '/functions/v1/sign-mock-pdf', {
        method: 'POST', headers: headers,
        body: JSON.stringify({ type: type, number: n, variant: variant })
      });
      var j = null;
      try { j = await r.json(); } catch (_e) {}
      if (r.status === 402 || (j && j.upgrade)) { upgrade(pop, j && j.error); return; }
      if (!r.ok || !j || !j.url) throw new Error((j && j.error) || ('Server ' + r.status));

      var f = await fetch(j.url);
      if (!f.ok) throw new Error('Fayl olinmadi (' + f.status + ')');
      var blob = await f.blob();
      // The dead function used to return the landing page with HTTP 200, so
      // check what actually arrived before handing it to the browser.
      if (blob.type && blob.type.indexOf('pdf') === -1) throw new Error('PDF emas');
      var name = type + '-mock-' + String(n).padStart(2, '0')
        + (variant ? '-samples' : '') + '.pdf';
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
      close();
    } catch (e) {
      pop.innerHTML = '<div class="mpc-err">✗ ' + (e.message || 'Yuklab bo‘lmadi') + '</div>';
    } finally {
      item.textContent = label;
      item.removeAttribute('disabled');
    }
  }

  // Capture phase: the card itself opens the test on click, so the button and
  // the menu must swallow their own clicks before that handler runs.
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var btn = t.closest('.mpc-btn');
    if (btn) { e.preventDefault(); e.stopPropagation(); openMenu(btn); return; }
    var item = t.closest('.mpc-item');
    if (item) {
      e.preventDefault(); e.stopPropagation();
      if (!item.hasAttribute('disabled')) download(item);
      return;
    }
    if (openEl && !t.closest('.mpc-pop')) close();
  }, true);

  window.addEventListener('scroll', close, true);
  window.addEventListener('resize', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  // Injected at load, not on first open: the buttons are painted with the card
  // long before anyone clicks one, and without this they sat on the card as
  // bare default buttons — square, grey, nothing like the share pill beside them.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', style);
  } else {
    style();
  }

  window.MockPdfCard = {
    btn: function (type, n) {
      return '<button type="button" class="mpc-btn" data-mpc-type="' + type
        + '" data-mpc-mock="' + n + '" title="PDF yuklab olish"'
        + ' aria-label="Mock ' + n + ' PDF">📄</button>';
    },
    close: close
  };
})();
