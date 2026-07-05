// pdf-menu.js — unified "Download mock PDFs" menu for the v3 sidebar.
// Admin gating is done by the caller (landing-v3 mirrors its other admin rows).
// Flow: pick exam+skill -> pick a published mock -> fetch the mock-pdf Netlify
// function (server-side headless-Chrome render of print-mock.html) -> download.
(function () {
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

  function open(){ inject(); showHome(); el('mpm-overlay').classList.add('show'); }
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

    var rows = [];
    try {
      var r = await fetch(SB_URL + '/rest/v1/mock_tests?mock_type=eq.' + encodeURIComponent(type)
        + '&status=eq.published&select=id,mock_number,title&order=mock_number.asc',
        { headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY } });
      if (r.ok) rows = await r.json();
    } catch (_e) {}

    if (!rows.length){
      pick.querySelector('.mpm-pick').innerHTML = '<label>No published mocks found for this skill.</label>';
      return;
    }
    var opts = rows.map(function (m) {
      var label = (m.title && m.title.trim()) ? m.title : (skill.label + ' Mock ' + String(m.mock_number).padStart(2, '0'));
      return '<option value="' + m.id + '">' + label.replace(/</g, '&lt;') + '</option>';
    }).join('');
    // CEFR Writing & Speaking also offer a separate B2 model-answer booklet.
    var hasSamples = (type === 'cefr-writing' || type === 'cefr-speaking');
    var btns = '<button class="mpm-btn" id="mpm-dl">⬇ ' + (hasSamples ? 'Questions PDF' : 'Download PDF') + '</button>';
    if (hasSamples) {
      btns += '<button class="mpm-btn mpm-btn-alt" id="mpm-dl-s">⬇ Samples PDF (B2)</button>'
        + '<p class="mpm-btn-note">Samples = B2 model answers with key vocabulary.</p>';
    }
    pick.querySelector('.mpm-pick').innerHTML =
      '<label>Select a mock</label><select id="mpm-sel">' + opts + '</select>' + btns;
    el('mpm-dl').addEventListener('click', function () { download(type, el('mpm-sel').value, null, this); });
    if (hasSamples) el('mpm-dl-s').addEventListener('click', function () { download(type, el('mpm-sel').value, 'samples', this); });
  }

  async function download(type, id, variant, btn){
    btn = btn || el('mpm-dl'); var msg = el('mpm-msg');
    var orig = btn.textContent;
    btn.disabled = true; btn.textContent = 'Generating PDF…';
    msg.className = 'mpm-msg'; msg.textContent = 'This can take a few seconds.';
    var url = '/.netlify/functions/mock-pdf?type=' + encodeURIComponent(type) + '&id=' + encodeURIComponent(id);
    // Reading & Listening papers get an Answer Key appended at the end (print-mock.html
    // renders it on &key=1). Speaking/Writing have no objective key, so it's omitted.
    if (/reading|listening/.test(type)) url += '&key=1';
    // Samples variant → B2 model-answer booklet instead of the question paper.
    if (variant === 'samples') url += '&variant=samples';
    try {
      var r = await fetch(url);
      if (!r.ok) throw new Error('Server returned ' + r.status);
      var blob = await r.blob();
      var cd = r.headers.get('Content-Disposition') || '';
      var m = /filename="?([^"]+)"?/.exec(cd);
      var fname = (m && m[1]) ? m[1] : (type + '.pdf');
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = fname;
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
      msg.className = 'mpm-msg ok'; msg.textContent = '✓ Downloaded ' + fname;
    } catch (e) {
      msg.className = 'mpm-msg err'; msg.textContent = '✗ ' + (e.message || 'Download failed') + '. Please try again.';
    } finally {
      btn.disabled = false; btn.textContent = orig;
    }
  }

  window.MockPdfMenu = { open: open, close: close };
})();
