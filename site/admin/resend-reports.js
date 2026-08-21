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
  // Every skill a report exists for. Each format was fetched through
  // report-locked before being offered here: writing and listening are a
  // single html, speaking is html now and a zip before 18 Aug, reading comes
  // as either a review payload or an html twin, and a full mock as the tabbed
  // JSON or its original zip.
  var SKILLS = ['speaking', 'writing', 'reading', 'listening', 'full-mock'];
  var SKILL_ICON = {
    speaking: '🎤', writing: '✍️', reading: '📖', listening: '🎧', 'full-mock': '🎯'
  };

  /** The label for the empty filter, built from SKILLS so it can never
   *  disagree with what the panel shows: "All skills" when every skill is on
   *  the list, otherwise the ones that are. */
  var ALL_SKILLS = ['speaking', 'writing', 'reading', 'listening', 'full-mock'];
  function allSkillsLabel() {
    if (SKILLS.length >= ALL_SKILLS.length) return 'All skills';
    return SKILLS.map(function (s) {
      var t = s.replace('-', ' ');
      return t.charAt(0).toUpperCase() + t.slice(1);
    }).join(' + ');
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function centreLabel(c) { return CENTER_LABELS[c] || c || '—'; }
  /** The routing id send-to-telegram expects (the main centre is 'mockstream'). */
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

  // The browser no longer builds or sends the file — resend-drain does. The
  // caption rules, the zip fallback and the archive lookup therefore live in
  // ONE place. They used to live here as well, and two copies of a rule drift
  // apart the moment one of them is edited.

  var state = { rows: [], busy: false, batch: null, watchStop: null };

  /** One line of feedback, in the slot the row count already occupies. */
  function flash(container, msg) {
    var el = container.querySelector('#rsrCount');
    if (el) el.innerHTML = '<span style="color:#b45309">' + esc(msg) + '</span>';
  }

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
            '<option value="">' + esc(allSkillsLabel()) + '</option>' + skillOpts + '</select></div>' +
          '<div class="rsr-f"><label>Exam</label><select id="rsrExam">' +
            '<option value="">All exams</option>' +
            '<option value="cefr">🎓 CEFR Multilevel</option>' +
            '<option value="ielts">🌍 IELTS</option></select></div>' +
          '<div class="rsr-f"><label>Type</label><select id="rsrType">' +
            '<option value="all">All</option>' +
            '<option value="full">Full mocks</option>' +
            '<option value="practice">Practice</option></select></div>' +
          '<div class="rsr-f"><label>From</label><input type="time" id="rsrFrom"></div>' +
          '<div class="rsr-f"><label>To</label><input type="time" id="rsrTo"></div>' +
          '<div class="rsr-f"><label>Pace</label><select id="rsrPace">' +
            '<option value="0">Send now (10/min)</option>' +
            '<option value="60">1 per minute</option>' +
            '<option value="120">1 per 2 minutes</option>' +
            '<option value="300">1 per 5 minutes</option></select></div>' +
          '<button class="rsr-btn s" id="rsrLoad">Show</button>' +
          '<span class="rsr-count" id="rsrCount"></span>' +
        '</div>' +
        '<div class="rsr-bar">' +
          '<div class="rsr-mode">' +
            '<span style="font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#94a3b8;font-weight:700">Caption date</span>' +
            '<label><input type="radio" name="rsrDateMode" value="original" checked> Original</label>' +
            '<label><input type="radio" name="rsrDateMode" value="today"> Today</label>' +
            '<label style="margin-left:14px" title="The report appears in the Results Dashboard a second time, under today. Same submission — the totals still count it once.">' +
              '<input type="checkbox" id="rsrDash" checked> Show in dashboard too</label>' +
          '</div>' +
          '<button class="rsr-btn p" id="rsrSend" disabled>Send to channel</button>' +
          '<button class="rsr-btn" id="rsrStop" style="display:none">Stop</button>' +
        '</div>' +
        '<div class="rsr-note" id="rsrNote">⚠️ “Today” moves the date line and every dated hashtag ' +
          '(#centre_dd_mm_yy, #all_dd_mm_yy) to today — the work will be counted on today in the channel statistics.</div>' +
        '<div id="rsrBody"><div class="rsr-empty">Pick a date and press <b>Show</b>.</div></div>' +
      '</div>';

    container.querySelector('#rsrLoad').addEventListener('click', function () { load(container); });
    // Changing a filter reloads. Without this the table kept the previous
    // query while the controls showed the new one — a day of every centre
    // read as one centre's, and the counts disagreed with the dropdowns.
    ['#rsrDate', '#rsrCentre', '#rsrSkill', '#rsrExam', '#rsrType', '#rsrFrom', '#rsrTo'].forEach(function (sel) {
      var el = container.querySelector(sel);
      if (el) el.addEventListener('change', function () { load(container); });
    });
    container.querySelector('#rsrSend').addEventListener('click', function () { send(container); });
    var stopBtn = container.querySelector('#rsrStop');
    if (stopBtn) stopBtn.addEventListener('click', function () { cancelBatch(container); });
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
          // Which exam it was: the same mock number exists in both, so the
          // skill alone does not say what the teacher is looking at.
          (r.exam_type ? ' <span class="rsr-exam">' + esc(String(r.exam_type).toUpperCase()) + '</span>' : '') +
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
    var exam = container.querySelector('#rsrExam').value;
    var type = container.querySelector('#rsrType').value;
    var from = container.querySelector('#rsrFrom').value;
    var to = container.querySelector('#rsrTo').value;
    var body = container.querySelector('#rsrBody');
    body.innerHTML = '<div class="rsr-empty">Loading…</div>';
    try {
      var rows = await rpc('admin_day_submissions', {
        p_date: date, p_center: centre, p_skill: skill, p_exam: exam,
        p_type: type, p_from: from, p_to: to
      });
      // With no skill chosen the RPC returns every skill, so the panel keeps
      // only the ones it offers — otherwise the list shows rows the filter
      // above claims are not there.
      state.rows = (rows || []).filter(function (r) {
        return !r.skill || SKILLS.indexOf(String(r.skill).toLowerCase()) > -1;
      });
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
    var dashEl = container.querySelector('#rsrDash');
    var inDashboard = !dashEl || dashEl.checked;
    var pace = parseInt(container.querySelector('#rsrPace').value, 10) || 0;
    var picked = [].slice.call(container.querySelectorAll('.rsr-cb'))
      .filter(function (b) { return b.checked; })
      .map(function (b) { return parseInt(b.dataset.i, 10); });
    if (!picked.length) return;

    state.busy = true;
    var btn = container.querySelector('#rsrSend');
    btn.disabled = true;
    btn.textContent = 'Queueing…';

    var ids = picked.map(function (i) { return state.rows[i].id; });
    var byId = {};
    picked.forEach(function (i) { byId[state.rows[i].id] = i; });

    var res;
    try {
      res = await rpc('resend_enqueue', {
        p_result_ids: ids, p_date_mode: mode,
        p_in_dashboard: inDashboard, p_interval_seconds: pace
      });
    } catch (e) {
      state.busy = false;
      btn.disabled = false;
      btn.textContent = 'Send';
      flash(container, 'Could not queue: ' + e.message);
      return;
    }

    var batch = (res && res[0] && res[0].batch_id) || null;
    var queued = (res && res[0] && res[0].queued) || 0;
    if (!batch || !queued) {
      state.busy = false; btn.disabled = false; btn.textContent = 'Send';
      flash(container, 'Nothing to queue — those rows have no stored report.');
      return;
    }

    state.batch = batch;
    picked.forEach(function (i) {
      var cell = container.querySelector('[data-st="' + i + '"]');
      if (cell) { cell.className = 'rsr-st go'; cell.textContent = 'queued'; }
    });
    showStop(container, true);
    watch(container, batch, byId, queued);
  }

  /** Follow the batch the server is working through.
   *
   *  The polling lives in the page, but nothing depends on it: close the tab
   *  and the cron finishes the batch anyway. This only paints what already
   *  happened. */
  function watch(container, batch, byId, total) {
    var btn = container.querySelector('#rsrSend');
    var stop = false;
    state.watchStop = function () { stop = true; };

    (async function tick() {
      if (stop) return;
      var rows = [];
      try { rows = await rpc('resend_batch_rows', { p_batch: batch }); } catch (e) { /* keep watching */ }
      var done = 0, failed = 0, pending = 0;
      (rows || []).forEach(function (r) {
        var i = byId[r.result_id];
        var cell = (i === undefined) ? null : container.querySelector('[data-st="' + i + '"]');
        if (r.status === 'sent') {
          done++;
          if (cell) { cell.className = 'rsr-st ok'; cell.textContent = '✓ sent'; }
          var cb = (i === undefined) ? null : container.querySelector('.rsr-cb[data-i="' + i + '"]');
          if (cb) cb.checked = false;
        } else if (r.status === 'failed') {
          failed++;
          if (cell) { cell.className = 'rsr-st no'; cell.textContent = '✗ ' + (r.error || 'failed'); }
        } else if (r.status === 'cancelled') {
          if (cell) { cell.className = 'rsr-st'; cell.textContent = 'cancelled'; }
        } else {
          pending++;
          if (cell && cell.textContent.indexOf('✓') < 0) {
            var due = r.send_after ? new Date(r.send_after) : null;
            var wait = due ? Math.max(0, Math.round((due - Date.now()) / 1000)) : 0;
            cell.className = 'rsr-st go';
            cell.textContent = r.status === 'sending' ? 'sending…'
                             : (wait > 5 ? 'in ' + (wait >= 60 ? Math.round(wait / 60) + ' min' : wait + 's') : 'queued');
          }
        }
      });

      btn.textContent = pending
        ? 'Sending ' + (done + failed) + '/' + total + '…'
        : 'Sent ' + done + (failed ? ' · ' + failed + ' failed' : '');

      if (!pending) {
        state.busy = false;
        btn.disabled = false;
        showStop(container, false);
        setTimeout(function () { wireTable(container); }, 1200);
        return;
      }
      setTimeout(tick, 4000);
    })();
  }

  function showStop(container, on) {
    var b = container.querySelector('#rsrStop');
    if (b) b.style.display = on ? '' : 'none';
  }

  /** Cancel what has not gone yet. Anything already sent stays sent. */
  async function cancelBatch(container) {
    if (!state.batch) return;
    try { await rpc('resend_cancel', { p_batch: state.batch }); } catch (e) { /* nothing to undo */ }
    if (state.watchStop) state.watchStop();
    state.busy = false;
    var btn = container.querySelector('#rsrSend');
    btn.disabled = false;
    btn.textContent = 'Send';
    showStop(container, false);
    wireTable(container);
  }

  window.AdminPanels = window.AdminPanels || {};
  window.AdminPanels.resendReports = {
    open: function (container) {
      ensureCss();
      render(container);
    }
  };
})();
