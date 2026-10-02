// pdf-menu.js — unified "Download mock PDFs" menu for the v3 sidebar.
// Admin gating is done by the caller (landing-v3 mirrors its other admin rows).
// Flow: pick exam+skill -> pick a published mock -> ask sign-mock-pdf for a
// short-lived presigned URL -> download the blob from it.
(function () {
  // ── Pre-generated PDFs on R2 (replaces the Netlify function) ──────────
  // The old download called /.netlify/functions/mock-pdf, a headless-Chromium
  // render that only ever existed on Netlify. The sites moved to Cloudflare
  // Pages, which does not run it, and the request quietly returned the
  // landing page with HTTP 200 — an admin got a 244 KB "PDF" and no error.
  //
  // Now the papers are rendered once, up front, and stored on R2 as
  //   pdf/<mock_type>/mock-NN.pdf
  // No server, no cold start, no timeout. They are NOT fetched from the public
  // domain any more — see signedUrl() below for why that route is closed.
  // PDF_BASE now only reaches the manifest, which lists numbers, not content.
  //
  // MANIFEST is the source of truth for what exists, not the mock's status:
  // cefr-listening 34 is published and has no PDF, while the seven
  // deactivated cefr-reading papers are listed so their numbers stay
  // visible. The file is rebuilt after every upload.
  //   { "cefr-reading": { "questions": [1,2,...], "samples": [],
  //                        "missing": [39,41,...] }, ... }
  // "missing" holds the numbers that must still be listed although no file
  // exists. It has to come from the manifest, not from the mock's status:
  // RLS hides deactivated rows from the publishable key, and opening that up
  // would also expose them to the 23 `mock_tests?id=eq.` lookups in the exam
  // pages, which do not filter on status.
  var PDF_BASE = 'https://audio.mock-stream.com/pdf';
  var MANIFEST = null;

  async function manifest(){
    if (MANIFEST) return MANIFEST;
    try {
      var r = await fetch(PDF_BASE + '/manifest.json', { cache: 'no-cache' });
      MANIFEST = r.ok ? await r.json() : {};
    } catch (_e) { MANIFEST = {}; }
    return MANIFEST;
  }
  function has(type, variant, number){
    var m = (MANIFEST || {})[type];
    if (!m) return false;
    var list = m[variant === 'samples' ? 'samples' : 'questions'] || [];
    return list.indexOf(Number(number)) !== -1;
  }
  function anyOf(type, variant){
    var m = (MANIFEST || {})[type];
    return !!(m && (m[variant === 'samples' ? 'samples' : 'questions'] || []).length);
  }

  var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';

  var SKILLS = [
    { key: 'listening', label: 'Listening', icon: '🎧' },
    { key: 'reading',   label: 'Reading',   icon: '📖' },
    { key: 'writing',   label: 'Writing',   icon: '✍️' },
    { key: 'speaking',  label: 'Speaking',  icon: '🗣️' }
  ];

  function el(id){ return document.getElementById(id); }

  function inject(){
    if (el('mpm-overlay')) return;
    var css = ''
      + '#mpm-overlay{position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:100030;display:none;align-items:center;justify-content:center;padding:18px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;}'
      + '#mpm-overlay.show{display:flex;}'
      + '.mpm-card{background:#fff;border-radius:16px;max-width:560px;width:100%;max-height:88vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,.3);padding:22px 22px 18px;}'
      + '.mpm-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;}'
      + '.mpm-h h3{margin:0;font-size:20px;color:#4f46e5;}'
      + '.mpm-x{background:transparent;border:none;font-size:22px;cursor:pointer;color:#64748b;line-height:1;}'
      + '.mpm-sub{color:#64748b;font-size:13px;margin:0 0 16px;}'
      + '.mpm-exam{font-weight:700;color:#0d9488;margin:14px 0 8px;font-size:13px;letter-spacing:.4px;text-transform:uppercase;}'
      + '.mpm-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;}'
      + '.mpm-skill{display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;cursor:pointer;font-size:14px;font-weight:600;color:#1e293b;transition:all .15s;}'
      + '.mpm-skill:hover{border-color:#6366f1;background:#eef2ff;transform:translateY(-1px);}'
      + '.mpm-skill .i{font-size:18px;}'
      + '.mpm-pick label{display:block;font-size:13px;color:#64748b;margin:0 0 6px;}'
      + '.mpm-pick select{width:100%;padding:11px 12px;border:1px solid #cbd5e1;border-radius:10px;font-size:14px;margin-bottom:14px;}'
      + '.mpm-btn{width:100%;padding:12px;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;color:#fff;background:linear-gradient(135deg,#6366f1,#4f46e5);}'
      + '.mpm-btn:disabled{opacity:.6;cursor:default;}'
      + '.mpm-btn-alt{margin-top:8px;background:linear-gradient(135deg,#0d9488,#0f766e);}'
      + '.mpm-btn-note{font-size:11px;color:#94a3b8;margin:8px 0 0;text-align:center;}'
      + '.mpm-back{background:transparent;border:none;color:#6366f1;cursor:pointer;font-size:13px;padding:0;margin-bottom:12px;}'
      + '.mpm-msg{font-size:13px;margin-top:10px;min-height:18px;}'
      + '.mpm-msg.err{color:#dc2626;} .mpm-msg.ok{color:#0d9488;}';
    var style = document.createElement('style'); style.id = 'mpm-style'; style.textContent = css;
    document.head.appendChild(style);

    var ov = document.createElement('div'); ov.id = 'mpm-overlay';
    ov.innerHTML =
      '<div class="mpm-card">'
      + '<div class="mpm-h"><h3>📥 Download mock PDFs</h3><button class="mpm-x" id="mpm-x">&times;</button></div>'
      + '<p class="mpm-sub">Choose an exam and skill, then a mock to download as a printable PDF.</p>'
      + '<div id="mpm-home"></div>'
      + '<div id="mpm-pick" style="display:none;"></div>'
      + '</div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    el('mpm-x').addEventListener('click', close);

    var home = el('mpm-home');
    ['ielts', 'cefr'].forEach(function (exam) {
      var sec = document.createElement('div');
      sec.innerHTML = '<div class="mpm-exam">' + (exam === 'ielts' ? 'IELTS' : 'CEFR') + '</div>';
      var grid = document.createElement('div'); grid.className = 'mpm-grid';
      SKILLS.forEach(function (s) {
        var b = document.createElement('button');
        b.className = 'mpm-skill';
        b.innerHTML = '<span class="i">' + s.icon + '</span>' + s.label;
        b.addEventListener('click', function () { openPicker(exam, s); });
        grid.appendChild(b);
      });
      sec.appendChild(grid);
      home.appendChild(sec);
    });
  }

  function open(){
    inject();
    showHome();
    el('mpm-overlay').classList.add('show');
    manifest();   // fonda yuklanadi, ko'nikma tanlangunicha ulguradi
  }

  // Says what is happening and when it returns. An admin who clicks this
  // deserves better than a spinner that ends in an error.
  function showFrozen(){
    el('mpm-home').style.display = 'none';
    var pick = el('mpm-pick');
    pick.style.display = '';
    pick.innerHTML =
      '<div style="text-align:center;padding:18px 6px 6px;">'
      + '<div style="font-size:34px;line-height:1;margin-bottom:10px;">⏸️</div>'
      + '<div style="font-size:15px;font-weight:700;color:#1e293b;margin-bottom:8px;">Vaqtincha o‘chirilgan</div>'
      + '<p style="font-size:13px;color:#64748b;margin:0 0 6px;line-height:1.55;">'
      + 'PDF yuklab olish hozircha ishlamaydi. Sayt Cloudflare’ga ko‘chirilyapti va PDF’lar '
      + 'oldindan tayyorlanib saqlanadigan qilib qayta qurilyapti — shundan keyin yuklab olish '
      + 'bir necha soniya emas, bir zumda bo‘ladi.</p>'
      + '<p style="font-size:12px;color:#94a3b8;margin:10px 0 0;">Moklarning o‘zi va boshqa hamma narsa odatdagidek ishlaydi.</p>'
      + '</div>';
  }
  function close(){ var o = el('mpm-overlay'); if (o) o.classList.remove('show'); }
  function showHome(){ el('mpm-home').style.display = ''; el('mpm-pick').style.display = 'none'; }

  async function openPicker(exam, skill){
    var type = exam + '-' + skill.key;        // e.g. ielts-reading
    var pick = el('mpm-pick');
    el('mpm-home').style.display = 'none';
    pick.style.display = '';
    pick.innerHTML = '<button class="mpm-back" id="mpm-back">&larr; Back</button>'
      + '<div class="mpm-exam">' + (exam === 'ielts' ? 'IELTS' : 'CEFR') + ' ' + skill.label + '</div>'
      + '<div class="mpm-pick"><label>Loading mocks…</label></div>'
      + '<div class="mpm-msg" id="mpm-msg"></div>';
    el('mpm-back').addEventListener('click', showHome);

    await manifest();
    if (!anyOf(type)) {
      var ready = Object.keys(MANIFEST || {}).filter(function (t) { return anyOf(t); })
        .map(function (t) { return t.replace('-', ' ').toUpperCase(); }).join(', ');
      pick.querySelector('.mpm-pick').innerHTML =
        '<label>Bu ko‘nikma hali tayyor emas</label>'
        + '<p style="font-size:13px;color:#64748b;line-height:1.55;margin:6px 0 0;">'
        + 'PDF’lar ko‘nikma bo‘yicha navbat bilan tayyorlanmoqda. '
        + 'Hozircha tayyor: <b>' + (ready || '—') + '</b>.</p>';
      return;
    }

    var rows = [];
    try {
      // Deactivated mocks are listed too. Their numbers stay visible so the
      // gaps are explained rather than silently missing, and when a sound
      // paper replaces one its PDF simply appears.
      var r = await fetch(SB_URL + '/rest/v1/mock_tests?mock_type=eq.' + encodeURIComponent(type)
        + '&status=in.(published,deactivated)&select=mock_number,title,status&order=mock_number.asc',
        { headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY } });
      if (r.ok) rows = await r.json();
    } catch (_e) {}

    // Deactivated papers never arrive in `rows` — RLS filters them out — so
    // their numbers are folded in from the manifest. Without this the gaps
    // would just be absent, which is the one thing they must not be.
    var known = {};
    rows.forEach(function (m) { known[Number(m.mock_number)] = 1; });
    (((MANIFEST || {})[type] || {}).missing || []).forEach(function (n) {
      if (!known[Number(n)]) rows.push({ mock_number: Number(n), status: 'deactivated' });
    });
    rows.sort(function (a, b) { return Number(a.mock_number) - Number(b.mock_number); });

    if (!rows.length){
      pick.querySelector('.mpm-pick').innerHTML = '<label>No mocks found for this skill.</label>';
      return;
    }

    var missing = 0;
    var opts = rows.map(function (m) {
      var n = Number(m.mock_number);
      var label = skill.label + ' Mock ' + String(n).padStart(2, '0');
      var ok = has(type, null, n);
      if (!ok) missing++;
      return '<option value="' + n + '"' + (ok ? '' : ' data-nopdf="1"') + '>'
        + label + (ok ? '' : ' — PDF mavjud emas') + '</option>';
    }).join('');

    var hasSamples = anyOf(type, 'samples');
    var btns = '<button class="mpm-btn" id="mpm-dl">⬇ ' + (hasSamples ? 'Questions PDF' : 'Download PDF') + '</button>';
    if (hasSamples) {
      var band = exam === 'ielts' ? 'Band 7–7.5' : 'B2–C1';
      btns += '<button class="mpm-btn mpm-btn-alt" id="mpm-dl-s">⬇ Samples PDF (' + band + ')</button>'
        + '<p class="mpm-btn-note">Samples = ' + band + ' model answers with key vocabulary.</p>';
    }
    if (missing) {
      btns += '<p class="mpm-btn-note">' + missing + ' ta mokda PDF yo‘q — ular nostandart yoki chala, '
        + 'o‘rniga yaroqli mok qo‘yilganda PDF ham paydo bo‘ladi.</p>';
    }
    pick.querySelector('.mpm-pick').innerHTML =
      '<label>Select a mock</label><select id="mpm-sel">' + opts + '</select>' + btns;

    // Keeps the buttons honest: a mock with no file cannot be downloaded.
    var sel = el('mpm-sel');
    function sync(){
      var o = sel.options[sel.selectedIndex];
      var no = !!(o && o.getAttribute('data-nopdf'));
      el('mpm-dl').disabled = no;
      var sb = el('mpm-dl-s'); if (sb) sb.disabled = no || !has(type, 'samples', sel.value);
      var msg = el('mpm-msg');
      if (no) { msg.className = 'mpm-msg'; msg.textContent = 'Bu mok uchun PDF tayyorlanmagan.'; }
      else if (msg.textContent === 'Bu mok uchun PDF tayyorlanmagan.') msg.textContent = '';
    }
    sel.addEventListener('change', sync);
    sync();

    el('mpm-dl').addEventListener('click', function () { download(type, el('mpm-sel').value, null, this); });
    if (hasSamples) el('mpm-dl-s').addEventListener('click', function () { download(type, el('mpm-sel').value, 'samples', this); });
  }

  // The papers are no longer fetched from a public URL. `audio.mock-stream.com`
  // cannot be made private — exam audio lives in the same bucket and R2 grants
  // public access per BUCKET, not per prefix — so the public route to
  // `/pdf/*.pdf` is blocked at the edge and the file is fetched from the S3
  // endpoint with a 60-second presigned URL instead.
  //
  // The admin padlock on the sidebar was never protection: it hid this menu,
  // while the files sat on a guessable path that `manifest.json` indexed in
  // full. `sign-mock-pdf` re-checks the caller's JWT server-side, applies a
  // daily quota and logs every grant.
  async function signedUrl(type, number, variant){
    var token = null;
    try {
      var c = window.MockStream && window.MockStream.auth
        && typeof window.MockStream.auth.getClient === 'function'
        ? window.MockStream.auth.getClient() : null;
      if (c && c.auth && typeof c.auth.getSession === 'function') {
        var sess = await c.auth.getSession();
        token = sess && sess.data && sess.data.session && sess.data.session.access_token;
      }
    } catch (_e) {}
    if (!token) throw new Error('Admin hisobi bilan qayta kiring');

    var r = await fetch(SB_URL + '/functions/v1/sign-mock-pdf', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: type, number: Number(number), variant: variant })
    });
    var j = null;
    try { j = await r.json(); } catch (_e) {}
    if (!r.ok || !j || !j.url) {
      throw new Error((j && j.error) || ('Ruxsat olinmadi (' + r.status + ')'));
    }
    if (typeof j.used === 'number' && typeof j.quota === 'number' && j.used >= j.quota - 3) {
      var m = el('mpm-msg');
      if (m) { m.className = 'mpm-msg'; m.textContent = 'Kunlik chegara: ' + j.used + '/' + j.quota; }
    }
    return j.url;
  }

  async function download(type, number, variant, btn){
    btn = btn || el('mpm-dl'); var msg = el('mpm-msg');
    var orig = btn.textContent;
    btn.disabled = true; btn.textContent = 'Downloading…';
    msg.className = 'mpm-msg'; msg.textContent = '';

    var nn = String(number).padStart(2, '0');
    var name = 'mock-' + nn + (variant === 'samples' ? '-samples' : '') + '.pdf';
    var fname = type + '-' + name;

    try {
      var url = await signedUrl(type, number, variant);
      var r = await fetch(url);
      if (r.status === 404) throw new Error('Bu mok uchun PDF hali yuklanmagan');
      if (!r.ok) throw new Error('Server ' + r.status);
      var blob = await r.blob();
      // Serving a 244 KB landing page as a PDF is exactly how the old path
      // failed, so check what actually arrived before handing it over.
      if (blob.type && blob.type.indexOf('pdf') === -1) throw new Error('PDF emas (' + blob.type + ')');
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = fname;
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
      msg.className = 'mpm-msg ok'; msg.textContent = '✓ ' + fname;
    } catch (e) {
      msg.className = 'mpm-msg err'; msg.textContent = '✗ ' + (e.message || 'Yuklab bo‘lmadi');
    } finally {
      btn.disabled = false; btn.textContent = orig;
    }
  }

  window.MockPdfMenu = { open: open, close: close };
})();
