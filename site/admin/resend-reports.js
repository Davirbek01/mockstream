/* ═══════════════════════════════════════════════════════════════════════════
   Resend Reports — the admin's safety net for Telegram delivery
   ───────────────────────────────────────────────────────────────────────────
   Supabase keeps every report; Telegram is the part that can drop one (an
   outage, a dead sender, a student who closed the tab mid-send). This panel
   lists a chosen day's submissions per centre, and posts the ticked ones to
   that centre's own channel again.

   WHAT GOES OUT is the stored caption and the encrypted report, exactly as the
   student's own submission would have sent them:
     • the caption comes from results.caption — the same text, same scores
     • the file is fetched from report-locked, so it stays encrypted and opens
       with the centre's current access code
     • old audio is not a problem: the player retries the permanent GCS archive

   THE DATE CHOICE matters more than it looks. The caption carries the exam
   date AND the dated hashtags (#<centre>_19_08_26, #all_19_08_26) that the
   channel's per-day counting relies on.
     • "Original" (default) — yesterday's mock stays counted on yesterday
     • "Today"              — the date line and every dated hashtag are moved
                              to today, which also moves it in the statistics

   Super admin only: the RPC returns nothing to a centre admin, and the panel
   says so rather than showing an empty table.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';

  var CENTER_LABELS = {
    'mock_stream': 'Mock Stream (main)',
    'bek':         'Bekzods Multilevel',
    'niners':      'Niners Academy',
    'global':      'Global Education',
    'muzaffars':   'Muzaffars English',
    'achievers':   'Achievers Mocks',
    'record':      'Multilevel Record'
  };
  var SKILLS = ['speaking', 'writing', 'reading', 'listening', 'full-mock'];
  var SKILL_ICON = {
    speaking: '🎤', writing: '✍️', reading: '📖', listening: '🎧', 'full-mock': '🎯'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function centreLabel(c) { return CENTER_LABELS[c] || c || '—'; }
  /** The routing id send-to-telegram expects (the main centre is 'mockstream'). */
  function routingId(c) { return c === 'mock_stream' ? 'mockstream' : c; }
  // Where each centre's report viewer lives. A student's own send builds this
  // from the page it ran on; this panel runs on the main site, so the centre's
  // domain has to be named here. site_settings.siteDomain is NOT it — that
  // field is a file:// fallback and reads 'mockstream.site' for four of seven.
  var CENTER_HOST = {
    'mock_stream': 'mock-stream.com',
    'bek':         'bekzodsmultilevel.com',
    'niners':      'ninersacademy.com',
    'global':      'global-education.netlify.app',
    'muzaffars':   'muzaffars-english.netlify.app',
    'achievers':   'achievers-mocks.netlify.app',
    'record':      'multilevelrecord.com'
  };
  function viewLink(row) {
    var host = CENTER_HOST[row.center];
    return host ? 'https://' + host + '/results/view.html?id=' + row.id + '&lock=1' : '';
  }
  function todayISO() {
    var d = new Date(Date.now() + 5 * 3600000);          // Asia/Tashkent
    return d.toISOString().slice(0, 10);
  }
  function pad(n) { return String(n).padStart(2, '0'); }

  async function accessToken() {
    try {
      var c = (window.MockStream && window.MockStream.auth &&
               typeof window.MockStream.auth.getClient === 'function')
        ? window.MockStream.auth.getClient() : null;
      if (!c || !c.auth) return null;
      var sess = await c.auth.getSession();
      var s = sess && sess.data && sess.data.session;
      return (s && s.access_token) ? s.access_token : null;
    } catch (_e) { return null; }
  }

  async function rpc(name, body) {
    var jwt = await accessToken();
    var r = await fetch(SB_URL + '/rest/v1/rpc/' + name, {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        Authorization: 'Bearer ' + (jwt || SB_KEY),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body || {})
    });
    if (!r.ok) throw new Error(name + ' → HTTP ' + r.status);
    return r.json();
  }

  // ── Caption date rewriting ────────────────────────────────────────────────
  // Only used for the "today" choice. Three things carry a date: the readable
  // line, the day hashtags, and the month hashtags — a re-send in a new month
  // has to move all of them or the counts disagree with each other.
  function retagCaption(caption, centre) {
    if (!caption) return caption;
    var now = new Date(Date.now() + 5 * 3600000);        // Asia/Tashkent
    var d = now.getUTCDate(), m = now.getUTCMonth() + 1, y = now.getUTCFullYear();
    var yy = String(y).slice(-2);
    var day = pad(d) + '_' + pad(m) + '_' + yy;          // 19_08_26
    var mon = pad(m) + '_' + yy;                         // 08_26
    var rid = routingId(centre);
    var out = caption;
    out = out.replace(/(📅 Date:\s*)\d{1,2}\/\d{1,2}\/\d{4}/, '$1' + m + '/' + d + '/' + y);
    out = out.replace(new RegExp('#' + rid + '_\\d{2}_\\d{2}_\\d{2}', 'g'), '#' + rid + '_' + day);
    out = out.replace(/#all_\d{2}_\d{2}_\d{2}/g, '#all_' + day);
    out = out.replace(new RegExp('#' + rid + '_\\d{2}_\\d{2}(?!_)', 'g'), '#' + rid + '_' + mon);
    out = out.replace(/#all_\d{2}_\d{2}(?!_)/g, '#all_' + mon);
    out = out.replace(new RegExp('#' + rid + '_\\d{4}', 'g'), '#' + rid + '_' + y);
    out = out.replace(/#all_\d{4}/g, '#all_' + y);
    return out;
  }

  /** The name the student's own send would have used, so the channel reads the
   *  same whether a report arrived the first time or the second. */
  function fileName(row, dateMode) {
    var who = String(row.student_name || 'Student').replace(/[^\w]+/g, '_').slice(0, 40);
    var src = row.report_path || '';
    var dd, mm;
    if (dateMode === 'today') {
      var now = new Date(Date.now() + 5 * 3600000);
      dd = pad(now.getUTCDate()); mm = pad(now.getUTCMonth() + 1);
    } else {
      var m = /📅 Date:\s*(\d{1,2})\/(\d{1,2})\//.exec(row.caption || '');
      if (m) { dd = pad(m[2]); mm = pad(m[1]); }         // caption is M/D/YYYY
      else { var n2 = new Date(); dd = pad(n2.getDate()); mm = pad(n2.getMonth() + 1); }
    }
    var skill = String(row.skill || 'report').replace('-', '');
    var mock = String(row.mock_number || '').replace(/[^\w]+/g, '');
    return who + '_' + dd + '_' + mm + '_' + routingId(row.center) + '_' +
           skill + (mock ? '_' + mock : '') + (src.endsWith('.json') ? '' : '') + '_locked.html';
  }

  /** Post ONE stored report to its centre's channel. Resolves to a status. */
  async function resendOne(row, dateMode) {
    var path = row.report_path || '';
    if (!path) return { ok: false, error: 'no report' };
    var lr = await fetch(SB_URL + '/functions/v1/report-locked?p=' + encodeURIComponent(path));
    if (!lr.ok) return { ok: false, error: 'report-locked ' + lr.status };
    var html = await lr.text();
    var file = new File([html], fileName(row, dateMode), { type: 'text/html' });

    // The stored caption stops before two lines the sender adds at send time:
    // who was signed in, and the link to the report. Without them a re-sent
    // message reads as a lesser copy of the original, so put them back.
    var caption = dateMode === 'today' ? retagCaption(row.caption, row.center) : (row.caption || '');
    if (row.login_line && !/(^|\n)\S* ?Login: /.test(caption)) caption += '\n' + row.login_line;
    var link = viewLink(row);
    if (link && caption.indexOf('View Report') < 0) caption += '\n\n📎 View Report: ' + link;

    var fd = new FormData();
    fd.append('testIdentifier', routingId(row.center));
    fd.append('skill', row.skill || '');
    // A fresh key every time: the sender de-duplicates for ten minutes, and a
    // deliberate re-send must never be mistaken for a retry of the original.
    fd.append('idempotency_key', 'resend-' + row.id + '-' + Date.now());
    fd.append('caption', caption);
    fd.append('text', caption);
    fd.append('file', file);

    var r = await fetch(SB_URL + '/functions/v1/send-to-telegram', { method: 'POST', body: fd });
    var j = await r.json().catch(function () { return {}; });
    return (r.ok && j.ok !== false) ? { ok: true } : { ok: false, error: j.error || ('HTTP ' + r.status) };
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  var CSS = [
    '.rsr-wrap{padding:16px 18px;font-family:inherit}',
    '.rsr-bar{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;margin-bottom:14px}',
    '.rsr-f{display:flex;flex-direction:column;gap:4px}',
    '.rsr-f label{font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#94a3b8;font-weight:700}',
    '.rsr-f select,.rsr-f input{padding:8px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;background:#fff;color:#111}',
    '.rsr-btn{padding:9px 16px;border-radius:9px;border:none;font-weight:700;cursor:pointer;font-size:14px}',
    '.rsr-btn.p{background:#116a60;color:#fff}.rsr-btn.p:disabled{background:#9ca3af;cursor:not-allowed}',
    '.rsr-btn.s{background:#eef2f7;color:#334155}',
    '.rsr-mode{display:flex;gap:14px;align-items:center;font-size:13px;color:#334155}',
    '.rsr-mode label{display:flex;gap:5px;align-items:center;cursor:pointer;font-weight:600}',
    '.rsr-note{font-size:12px;color:#b45309;background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:8px 10px;margin:8px 0 12px;display:none}',
    '.rsr-tbl{width:100%;border-collapse:collapse;font-size:14px}',
    '.rsr-tbl th{background:#f8fafc;color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:.5px;padding:8px;text-align:left;border-bottom:2px solid #e2e8f0;position:sticky;top:0}',
    '.rsr-tbl td{padding:8px;border-bottom:1px solid #f1f5f9;vertical-align:middle}',
    '.rsr-tbl tr:hover td{background:#f8fafc}',
    '.rsr-sc{font-weight:700;color:#0f172a}',
    '.rsr-badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;background:#eef2f7;color:#475569}',
    '.rsr-st{font-size:12px;font-weight:700}.rsr-st.ok{color:#16a34a}.rsr-st.no{color:#dc2626}.rsr-st.go{color:#2563eb}',
    '.rsr-miss td{background:#fef2f2}.rsr-miss:hover td{background:#fee2e2}',
    '.rsr-miss td:first-child{box-shadow:inset 3px 0 0 #dc2626}',
    '.rsr-dlv{white-space:nowrap}',
    '.rsr-yes{color:#16a34a;font-weight:700}',
    '.rsr-no{color:#dc2626;font-weight:700;font-size:12px}',
    '.rsr-unk{color:#cbd5e1;font-weight:700;cursor:help}',
    '.rsr-prac{display:inline-block;padding:1px 7px;border-radius:20px;font-size:10px;font-weight:700;background:#fef3c7;color:#92400e;margin-left:4px}',
    '.rsr-empty{padding:36px;text-align:center;color:#94a3b8}',
    '.rsr-count{margin-left:auto;font-size:13px;color:#64748b;font-weight:600}'
  ].join('');

  function ensureCss() {
    if (document.getElementById('rsr-css')) return;
    var s = document.createElement('style');
    s.id = 'rsr-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  var state = { rows: [], busy: false };

  function render(container) {
    var centreOpts = ['<option value="">All centres</option>'].concat(
      Object.keys(CENTER_LABELS).map(function (c) {
        return '<option value="' + c + '">' + esc(CENTER_LABELS[c]) + '</option>';
      })).join('');
    var skillOpts = SKILLS.map(function (s) {
      return '<option value="' + s + '"' + (s === 'speaking' ? ' selected' : '') + '>' +
             SKILL_ICON[s] + ' ' + s + '</option>';
    }).join('');

    container.innerHTML =
      '<div class="rsr-wrap">' +
        '<div class="rsr-bar">' +
          '<div class="rsr-f"><label>Date</label><input type="date" id="rsrDate" value="' + todayISO() + '"></div>' +
          '<div class="rsr-f"><label>Centre</label><select id="rsrCentre">' + centreOpts + '</select></div>' +
          '<div class="rsr-f"><label>Skill</label><select id="rsrSkill">' +
            '<option value="">All skills</option>' + skillOpts + '</select></div>' +
          '<div class="rsr-f"><label>Type</label><select id="rsrType">' +
            '<option value="all">All</option>' +
            '<option value="full">Full mocks</option>' +
            '<option value="practice">Practice</option></select></div>' +
          '<div class="rsr-f"><label>From</label><input type="time" id="rsrFrom"></div>' +
          '<div class="rsr-f"><label>To</label><input type="time" id="rsrTo"></div>' +
          '<button class="rsr-btn s" id="rsrLoad">Show</button>' +
          '<span class="rsr-count" id="rsrCount"></span>' +
        '</div>' +
        '<div class="rsr-bar">' +
          '<div class="rsr-mode">' +
            '<span style="font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#94a3b8;font-weight:700">Caption date</span>' +
            '<label><input type="radio" name="rsrDateMode" value="original" checked> Original</label>' +
            '<label><input type="radio" name="rsrDateMode" value="today"> Today</label>' +
          '</div>' +
          '<button class="rsr-btn p" id="rsrSend" disabled>Send to channel</button>' +
        '</div>' +
        '<div class="rsr-note" id="rsrNote">⚠️ “Today” moves the date line and every dated hashtag ' +
          '(#centre_dd_mm_yy, #all_dd_mm_yy) to today — the work will be counted on today in the channel statistics.</div>' +
        '<div id="rsrBody"><div class="rsr-empty">Pick a date and press <b>Show</b>.</div></div>' +
      '</div>';

    container.querySelector('#rsrLoad').addEventListener('click', function () { load(container); });
    container.querySelector('#rsrSend').addEventListener('click', function () { send(container); });
    container.querySelectorAll('input[name="rsrDateMode"]').forEach(function (el) {
      el.addEventListener('change', function () {
        container.querySelector('#rsrNote').style.display = (el.value === 'today' && el.checked) ? 'block' : 'none';
      });
    });
  }

  function rowsHtml(rows) {
    if (!rows.length) {
      return '<div class="rsr-empty">Nothing submitted that day for this filter.</div>';
    }
    // Below 60% linked the day predates the id-stamped senders, so an unmatched
    // row means "cannot tell", not "lost". Painting those red would be a lie.
    var known = rows.length ? Number(rows[0].day_linked_pct || 0) >= 60 : false;
    var body = rows.map(function (r, i) {
      var miss = known && !r.delivered;
      return '<tr data-i="' + i + '"' + (miss ? ' class="rsr-miss"' : '') + '>' +
        '<td><input type="checkbox" class="rsr-cb" data-i="' + i + '"></td>' +
        '<td>' + esc(r.taken_at) + '</td>' +
        '<td>' + esc(r.student_name || '—') + '</td>' +
        '<td><span class="rsr-badge">' + (SKILL_ICON[r.skill] || '') + ' ' + esc(r.skill) + '</span>' +
          (r.is_practice ? ' <span class="rsr-prac">practice</span>' : '') + '</td>' +
        '<td>' + esc(r.mock_number || '—') + '</td>' +
        '<td class="rsr-sc">' + esc(r.score || '—') + (r.level ? ' · ' + esc(r.level) : '') + '</td>' +
        '<td>' + esc(centreLabel(r.center)) + '</td>' +
        '<td class="rsr-dlv">' + (!known ? '<span class="rsr-unk" title="This day was sent before the senders stamped the submission id, so delivery cannot be matched.">?</span>'
          : r.delivered ? '<span class="rsr-yes">✓</span>'
                        : '<span class="rsr-no">not delivered</span>') + '</td>' +
        '<td class="rsr-st" data-st="' + i + '"></td>' +
      '</tr>';
    }).join('');
    return '<table class="rsr-tbl"><thead><tr>' +
      '<th><input type="checkbox" id="rsrAll"></th><th>Time</th><th>Student</th><th>Skill</th>' +
      '<th>Mock</th><th>Score</th><th>Centre</th><th>Telegram</th><th></th>' +
      '</tr></thead><tbody>' + body + '</tbody></table>';
  }

  async function load(container) {
    var date = container.querySelector('#rsrDate').value;
    var centre = container.querySelector('#rsrCentre').value;
    var skill = container.querySelector('#rsrSkill').value;
    var type = container.querySelector('#rsrType').value;
    var from = container.querySelector('#rsrFrom').value;
    var to = container.querySelector('#rsrTo').value;
    var body = container.querySelector('#rsrBody');
    body.innerHTML = '<div class="rsr-empty">Loading…</div>';
    try {
      var rows = await rpc('admin_day_submissions', {
        p_date: date, p_center: centre, p_skill: skill,
        p_type: type, p_from: from, p_to: to
      });
      state.rows = rows || [];
      body.innerHTML = rowsHtml(state.rows);
      var missing = state.rows.filter(function (r) { return !r.delivered; }).length;
      var linked = state.rows.length ? Number(state.rows[0].day_linked_pct || 0) : 0;
      container.querySelector('#rsrCount').innerHTML = !state.rows.length ? '' :
        state.rows.length + ' submission' + (state.rows.length === 1 ? '' : 's') +
        (linked >= 60
          ? (missing ? ' · <b style="color:#dc2626">' + missing + ' not delivered</b>' : ' · all delivered')
          : ' · <span title="Senders started stamping the submission id on 19 Aug 2026; before that a send cannot be matched to its row.">delivery unknown for this day (' + linked + '% linked)</span>');
      wireTable(container);
    } catch (e) {
      body.innerHTML = '<div class="rsr-empty">Could not load — ' + esc(e.message) + '</div>';
    }
  }

  function wireTable(container) {
    var all = container.querySelector('#rsrAll');
    var boxes = [].slice.call(container.querySelectorAll('.rsr-cb'));
    function refresh() {
      var n = boxes.filter(function (b) { return b.checked; }).length;
      var btn = container.querySelector('#rsrSend');
      btn.disabled = !n || state.busy;
      btn.textContent = n ? 'Send ' + n + ' to channel' : 'Send to channel';
    }
    if (all) all.addEventListener('change', function () {
      boxes.forEach(function (b) { b.checked = all.checked; });
      refresh();
    });
    boxes.forEach(function (b) { b.addEventListener('change', refresh); });
    refresh();
  }

  async function send(container) {
    if (state.busy) return;
    var mode = (container.querySelector('input[name="rsrDateMode"]:checked') || {}).value || 'original';
    var picked = [].slice.call(container.querySelectorAll('.rsr-cb'))
      .filter(function (b) { return b.checked; })
      .map(function (b) { return parseInt(b.dataset.i, 10); });
    if (!picked.length) return;

    state.busy = true;
    var btn = container.querySelector('#rsrSend');
    btn.disabled = true;
    var done = 0, failed = 0;

    for (var k = 0; k < picked.length; k++) {
      var i = picked[k];
      var cell = container.querySelector('[data-st="' + i + '"]');
      if (cell) { cell.className = 'rsr-st go'; cell.textContent = 'sending…'; }
      var res;
      try { res = await resendOne(state.rows[i], mode); }
      catch (e) { res = { ok: false, error: e.message }; }
      if (cell) {
        cell.className = 'rsr-st ' + (res.ok ? 'ok' : 'no');
        cell.textContent = res.ok ? '✓ sent' : '✗ ' + (res.error || 'failed');
      }
      if (res.ok) { done++; var cb = container.querySelector('.rsr-cb[data-i="' + i + '"]'); if (cb) cb.checked = false; }
      else failed++;
      btn.textContent = 'Sending… ' + (k + 1) + '/' + picked.length;
    }

    state.busy = false;
    btn.textContent = 'Sent ' + done + (failed ? ' · ' + failed + ' failed' : '');
    setTimeout(function () { wireTable(container); }, 1200);
  }

  window.AdminPanels = window.AdminPanels || {};
  window.AdminPanels.resendReports = {
    open: function (container) {
      ensureCss();
      render(container);
    }
  };
})();
