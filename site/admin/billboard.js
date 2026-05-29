/* ════════════════════════════════════════════════════════════════════
   Billboard admin panel
   ───────────────────────────────────────────────────────────────────
   Manages two per-centre tables that drive the landing-v3 billboards:
     • center_announcements  → 📢 left slot
     • center_certificates   → 🏆 right slot

   Super-admin can pick any centre from a dropdown; centre admins are
   RLS-scoped to their own centre and the dropdown is hidden.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
  var BUCKET = 'billboard-assets';

  var CENTERS = [
    { id: 'mock_stream', label: 'Mock Stream (main)' },
    { id: 'bek',         label: 'Bekzods Multilevel' },
    { id: 'niners',      label: 'Niners Academy' },
    { id: 'global',      label: 'Global Education' },
    { id: 'muzaffars',   label: 'Muzaffars English' },
    { id: 'achievers',   label: 'Achievers Mocks' },
    { id: 'record',      label: 'Multilevel Record' }
  ];
  function centerLabel(cid) {
    for (var i = 0; i < CENTERS.length; i++) if (CENTERS[i].id === cid) return CENTERS[i].label;
    return cid || '(unknown)';
  }

  var TAGS = [
    { id: 'course',  label: 'Course',  cls: 'event' },
    { id: 'new',     label: 'New',     cls: 'new' },
    { id: 'results', label: 'Results', cls: 'win' },
    { id: 'event',   label: 'Event',   cls: 'event' },
    { id: 'news',    label: 'News',    cls: 'neutral' }
  ];
  var PALETTES = [
    { id: 'c1', label: 'Indigo / violet' },
    { id: 'c2', label: 'Sky / cyan' },
    { id: 'c3', label: 'Amber / red' },
    { id: 'c4', label: 'Emerald / green' }
  ];
  var EXAM_TYPES = ['IELTS Academic','IELTS General','CEFR Multilevel','Cambridge KET','Cambridge PET','Cambridge FCE','Cambridge CAE','Cambridge CPE','SAT','TOEFL','Other'];
  var VISIBILITY = [
    { id: 'full',     label: 'Full name' },
    { id: 'first',    label: 'First name only' },
    { id: 'initials', label: 'Initials only' }
  ];

  // ── auth helpers ──────────────────────────────────────────────────
  function _auth() {
    return (window.AdminAuth && typeof window.AdminAuth.fetch === 'function')
      ? window.AdminAuth : null;
  }
  async function _role() {
    if (!_auth() || typeof window.AdminAuth.currentRole !== 'function') return { role: null, center: '' };
    try { return await window.AdminAuth.currentRole(); } catch (_e) { return { role: null, center: '' }; }
  }
  async function _session() {
    if (!_auth() || typeof window.AdminAuth.currentSession !== 'function') return null;
    try { return await window.AdminAuth.currentSession(); } catch (_e) { return null; }
  }

  function _esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', '\'':'&#39;' }[c];
    });
  }
  function _attr(s) { return String(s == null ? '' : s).replace(/"/g, '&quot;'); }

  // ── state ─────────────────────────────────────────────────────────
  var state = {
    tab:        'announcements',  // 'announcements' | 'certificates'
    centerId:   '',               // active centre filter (super-admin only)
    role:       null,             // { role, center }
    items:      { announcements: [], certificates: [] },
    container:  null
  };

  // ── data fetches ──────────────────────────────────────────────────
  async function fetchList(table, centerId) {
    var url = SB_URL + '/rest/v1/' + table +
              '?center_id=eq.' + encodeURIComponent(centerId) +
              '&order=sort_order.asc,created_at.desc&select=*';
    var r = await window.AdminAuth.fetch(url, { method: 'GET' });
    if (!r.ok) throw new Error(table + ' fetch failed: ' + r.status);
    return r.json();
  }
  async function saveRow(table, row, id) {
    var body = JSON.stringify(row);
    var headers = { 'Content-Type': 'application/json', 'Prefer': 'return=representation' };
    var url, method;
    if (id) {
      url    = SB_URL + '/rest/v1/' + table + '?id=eq.' + encodeURIComponent(id);
      method = 'PATCH';
    } else {
      url    = SB_URL + '/rest/v1/' + table;
      method = 'POST';
    }
    var r = await window.AdminAuth.fetch(url, { method: method, headers: headers, body: body });
    if (!r.ok) {
      var t = ''; try { t = await r.text(); } catch (_e) {}
      throw new Error(table + ' ' + method + ' failed (' + r.status + '): ' + t);
    }
    return r.json();
  }
  async function deleteRow(table, id) {
    var url = SB_URL + '/rest/v1/' + table + '?id=eq.' + encodeURIComponent(id);
    var r = await window.AdminAuth.fetch(url, { method: 'DELETE' });
    if (!r.ok) {
      var t = ''; try { t = await r.text(); } catch (_e) {}
      throw new Error('delete failed (' + r.status + '): ' + t);
    }
  }
  async function uploadImage(file, centerId, prefix) {
    var ext = (file.name.match(/\.([a-z0-9]+)$/i) || [,'jpg'])[1].toLowerCase();
    var safe = (centerId || 'unknown').replace(/[^a-z0-9_-]/gi, '');
    var path = (prefix || 'misc') + '/' + safe + '/' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '.' + ext;
    var sess = await _session();
    var token = (sess && sess.access_token) || SB_KEY;
    var r = await fetch(SB_URL + '/storage/v1/object/' + BUCKET + '/' + path, {
      method: 'POST',
      headers: {
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + token,
        'Content-Type': file.type || 'application/octet-stream',
        'x-upsert': 'false'
      },
      body: file
    });
    if (!r.ok) {
      var t = ''; try { t = await r.text(); } catch (_e) {}
      throw new Error('upload failed (' + r.status + '): ' + t);
    }
    return SB_URL + '/storage/v1/object/public/' + BUCKET + '/' + path;
  }
  function uploadCertImage(file, centerId) { return uploadImage(file, centerId, 'certificates'); }
  function uploadAnnImage(file, centerId)  { return uploadImage(file, centerId, 'announcements'); }

  // ── styles ────────────────────────────────────────────────────────
  var STYLES = '\
    <style>\
    .bbA-wrap{font-family:inherit;color:#0f172a;}\
    .bbA-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 14px;flex-wrap:wrap;}\
    .bbA-title{font-size:18px;font-weight:800;display:flex;gap:8px;align-items:center;margin:0;}\
    .bbA-tabs{display:flex;gap:4px;background:#f1f5f9;padding:3px;border-radius:10px;border:1px solid #e2e8f0;}\
    .bbA-tab{padding:7px 14px;border:0;background:transparent;font-size:13px;font-weight:700;color:#475569;cursor:pointer;border-radius:8px;transition:background .15s,color .15s;}\
    .bbA-tab.active{background:#fff;color:#0f172a;box-shadow:0 1px 3px rgba(15,23,42,.08);}\
    .bbA-toolbar{display:flex;gap:10px;align-items:center;margin:0 0 14px;flex-wrap:wrap;}\
    .bbA-toolbar select,.bbA-toolbar input{padding:8px 10px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;background:#fff;}\
    .bbA-btn{padding:8px 14px;border:0;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;box-shadow:0 2px 6px rgba(99,102,241,.25);}\
    .bbA-btn:hover{filter:brightness(1.05);}\
    .bbA-btn.ghost{background:#fff;color:#475569;border:1px solid #cbd5e1;box-shadow:none;}\
    .bbA-btn.danger{background:linear-gradient(135deg,#ef4444,#dc2626);}\
    .bbA-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;}\
    .bbA-card{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:8px;box-shadow:0 1px 3px rgba(15,23,42,.04);}\
    .bbA-card .cov{height:80px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:32px;color:#fff;}\
    .bbA-card.c1 .cov{background:linear-gradient(135deg,#6366f1,#8b5cf6);}\
    .bbA-card.c2 .cov{background:linear-gradient(135deg,#0ea5e9,#06b6d4);}\
    .bbA-card.c3 .cov{background:linear-gradient(135deg,#f59e0b,#ef4444);}\
    .bbA-card.c4 .cov{background:linear-gradient(135deg,#10b981,#059669);}\
    .bbA-card .ttl{font-size:14px;font-weight:800;color:#0f172a;line-height:1.3;}\
    .bbA-card .meta{font-size:11px;color:#64748b;display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;}\
    .bbA-status{font-size:10px;font-weight:800;padding:2px 7px;border-radius:999px;text-transform:uppercase;letter-spacing:.04em;}\
    .bbA-status.draft{background:#fee2e2;color:#991b1b;border:1px solid #fecaca;}\
    .bbA-status.published{background:#dcfce7;color:#166534;border:1px solid #bbf7d0;}\
    .bbA-card .actions{display:flex;gap:6px;margin-top:4px;}\
    .bbA-card .actions button{flex:1;padding:6px 10px;border:0;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;}\
    .bbA-card .actions .edit{background:#eef2ff;color:#4338ca;border:1px solid #c7d2fe;}\
    .bbA-card .actions .del{background:#fee2e2;color:#991b1b;border:1px solid #fecaca;}\
    .bbA-card .actions .pub{background:#dcfce7;color:#166534;border:1px solid #bbf7d0;}\
    .bbA-card .actions .unpub{background:#fef3c7;color:#92400e;border:1px solid #fde68a;}\
    .bbA-card .certthumb{aspect-ratio:4/3;border-radius:10px;background-size:cover;background-position:center;background-color:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#fff;text-align:center;padding:14px;}\
    .bbA-card .certthumb.ielts{background:linear-gradient(135deg,#dc2626,#991b1b);}\
    .bbA-card .certthumb.cefr{background:linear-gradient(135deg,#0891b2,#155e75);}\
    .bbA-card .certthumb.camb{background:linear-gradient(135deg,#1e3a8a,#1e1b4b);}\
    .bbA-card .certthumb.sat{background:linear-gradient(135deg,#0f766e,#134e4a);}\
    .bbA-card .certthumb.toefl{background:linear-gradient(135deg,#1d4ed8,#1e3a8a);}\
    .bbA-card .certthumb .ex{font-size:10px;letter-spacing:.16em;text-transform:uppercase;opacity:.85;font-family:Georgia,serif;}\
    .bbA-card .certthumb .sc{font-size:24px;font-weight:900;font-family:Georgia,serif;line-height:1;}\
    .bbA-card .certthumb .nm{font-size:11px;font-style:italic;opacity:.9;font-family:Georgia,serif;}\
    .bbA-empty{padding:38px 18px;text-align:center;color:#64748b;background:#fff;border:1px dashed #cbd5e1;border-radius:14px;font-size:14px;}\
    .bbA-loading{padding:30px;text-align:center;color:#64748b;}\
    .bbA-modal{position:fixed;inset:0;background:rgba(15,23,42,.6);z-index:10000;display:flex;align-items:flex-start;justify-content:center;padding:32px 18px;overflow-y:auto;backdrop-filter:blur(4px);}\
    .bbA-mcard{background:#fff;border-radius:18px;max-width:560px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.4);overflow:hidden;}\
    .bbA-mhead{padding:16px 20px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;}\
    .bbA-mhead h3{margin:0;font-size:17px;font-weight:800;}\
    .bbA-mclose{width:30px;height:30px;border-radius:50%;border:1px solid #e2e8f0;background:#fff;cursor:pointer;font-size:18px;color:#475569;}\
    .bbA-mbody{padding:18px 20px 22px;display:flex;flex-direction:column;gap:12px;}\
    .bbA-field{display:flex;flex-direction:column;gap:5px;}\
    .bbA-field label{font-size:12px;font-weight:700;color:#475569;}\
    .bbA-field input,.bbA-field textarea,.bbA-field select{padding:9px 11px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;font-family:inherit;background:#fff;}\
    .bbA-field textarea{min-height:80px;resize:vertical;}\
    .bbA-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;}\
    .bbA-foot{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:14px 20px;border-top:1px solid #e2e8f0;background:#f8fafc;}\
    .bbA-foot .msg{font-size:12px;color:#475569;flex:1;}\
    .bbA-foot .msg.err{color:#991b1b;}\
    .bbA-consent{display:flex;gap:8px;align-items:flex-start;font-size:12.5px;color:#0f172a;background:#fffbeb;border:1px solid #fde68a;padding:10px;border-radius:8px;}\
    .bbA-consent input{margin-top:2px;}\
    .bbA-fileinfo{font-size:11px;color:#64748b;margin-top:4px;}\
    .bbA-preview{margin-top:6px;max-height:140px;border-radius:8px;}\
    .bbA-filerow{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}\
    .bbA-filerow input[type="file"]{flex:1 1 200px;}\
    .bbA-paste-btn{padding:7px 11px;border:1px solid #cbd5e1;background:#fff;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;color:#475569;white-space:nowrap;font-family:inherit;}\
    .bbA-paste-btn:hover{background:#f8fafc;border-color:#94a3b8;color:#0f172a;}\
    .bbA-paste-btn:active{transform:scale(.97);}\
    .bbA-paste-status{font-size:11px;color:#16a34a;margin-top:4px;min-height:14px;font-weight:600;}\
    .bbA-paste-status.err{color:#dc2626;}\
    </style>';

  // ── render ────────────────────────────────────────────────────────
  async function render() {
    var c = state.container;
    var isSuper = state.role && state.role.role === 'super_admin';

    c.innerHTML = STYLES + '\
      <div class="bbA-wrap">\
        <div class="bbA-head">\
          <h2 class="bbA-title">📢 Billboard <span style="font-size:11px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;padding:3px 8px;border-radius:999px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">' + (isSuper ? 'Super-admin · all centres' : 'Centre admin') + '</span></h2>\
          <div class="bbA-tabs">\
            <button class="bbA-tab' + (state.tab === 'announcements' ? ' active' : '') + '" data-tab="announcements">📢 Announcements</button>\
            <button class="bbA-tab' + (state.tab === 'certificates' ? ' active' : '') + '" data-tab="certificates">🏆 Achievements</button>\
          </div>\
        </div>\
        <div class="bbA-toolbar">\
          ' + (isSuper ? _centerSelectHtml() : '<span style="font-size:13px;color:#475569;">Centre: <b>' + _esc(centerLabel(state.centerId)) + '</b></span>') + '\
          <span style="flex:1;"></span>\
          <button class="bbA-btn" id="bbAAdd">+ Add new</button>\
          <button class="bbA-btn ghost" id="bbARefresh">↻ Refresh</button>\
        </div>\
        <div id="bbAList"><div class="bbA-loading">Loading…</div></div>\
      </div>';

    // wire tabs
    c.querySelectorAll('.bbA-tab').forEach(function (b) {
      b.addEventListener('click', function () {
        state.tab = b.getAttribute('data-tab');
        render();
      });
    });
    c.querySelector('#bbAAdd').addEventListener('click', function () { openForm(null); });
    c.querySelector('#bbARefresh').addEventListener('click', function () { renderList(); });
    if (isSuper) {
      c.querySelector('#bbACenter').addEventListener('change', function (e) {
        state.centerId = e.target.value;
        renderList();
      });
    }
    renderList();
  }

  function _centerSelectHtml() {
    var opts = CENTERS.map(function (c) {
      return '<option value="' + _attr(c.id) + '"' + (c.id === state.centerId ? ' selected' : '') + '>' + _esc(c.label) + '</option>';
    }).join('');
    return '<label style="display:flex;align-items:center;gap:6px;font-size:13px;color:#475569;font-weight:600;">Centre <select id="bbACenter">' + opts + '</select></label>';
  }

  async function renderList() {
    var list = document.getElementById('bbAList');
    if (!list) return;
    list.innerHTML = '<div class="bbA-loading">Loading…</div>';
    try {
      var rows = await fetchList(
        state.tab === 'announcements' ? 'center_announcements' : 'center_certificates',
        state.centerId
      );
      state.items[state.tab] = rows;
      if (!rows.length) {
        list.innerHTML = '<div class="bbA-empty">No ' + (state.tab === 'announcements' ? 'announcements' : 'achievements') + ' yet for <b>' + _esc(centerLabel(state.centerId)) + '</b>. Click <b>+ Add new</b> to create one.</div>';
        return;
      }
      list.innerHTML = '<div class="bbA-grid">' + rows.map(function (r) {
        return state.tab === 'announcements' ? _annCardHtml(r) : _certCardHtml(r);
      }).join('') + '</div>';
      _wireCardActions(list);
    } catch (e) {
      list.innerHTML = '<div class="bbA-empty" style="color:#991b1b;background:#fef2f2;border-color:#fca5a5;"><b>Failed to load:</b><br><code style="font-size:11px;">' + _esc(e && e.message ? e.message : e) + '</code></div>';
    }
  }

  function _annCardHtml(r) {
    var pal = r.cover_palette || 'c1';
    var statusCls = r.status === 'published' ? 'published' : 'draft';
    var cover = r.image_url
      ? '<div class="cov" style="background:url(\'' + _attr(r.image_url) + '\') center/cover;"></div>'
      : '<div class="cov">' + _esc(r.cover_icon || '📢') + '</div>';
    return '<div class="bbA-card ' + pal + '" data-id="' + _attr(r.id) + '">' +
      cover +
      '<div class="ttl">' + _esc(r.title) + '</div>' +
      '<div class="meta"><span>' + _esc((r.tag || '').toUpperCase()) + '</span><span class="bbA-status ' + statusCls + '">' + statusCls + '</span></div>' +
      '<div class="actions">' +
        '<button class="edit" data-act="edit">Edit</button>' +
        '<button class="' + (r.status === 'published' ? 'unpub' : 'pub') + '" data-act="togglepub">' + (r.status === 'published' ? 'Unpublish' : 'Publish') + '</button>' +
        '<button class="del" data-act="del">Delete</button>' +
      '</div>' +
    '</div>';
  }
  function _certCardHtml(r) {
    var cls = _examCls(r.exam_type);
    var displayName = _displayName(r.student_name, r.name_visibility);
    var statusCls = r.status === 'published' ? 'published' : 'draft';
    var thumb;
    if (r.certificate_image_url) {
      thumb = '<div class="certthumb" style="background-image:url(\'' + _attr(r.certificate_image_url) + '\');"></div>';
    } else {
      thumb = '<div class="certthumb ' + cls + '">' +
                '<div class="ex">' + _esc(r.exam_type) + '</div>' +
                '<div class="sc">' + _esc(r.score) + '</div>' +
                '<div class="nm">' + _esc(displayName) + '</div>' +
              '</div>';
    }
    return '<div class="bbA-card" data-id="' + _attr(r.id) + '">' +
      thumb +
      '<div class="ttl">' + _esc(displayName) + ' · ' + _esc(r.score) + '</div>' +
      '<div class="meta"><span>' + _esc(r.exam_type) + (r.exam_date ? ' · ' + _esc(_fmtDate(r.exam_date)) : '') + '</span><span class="bbA-status ' + statusCls + '">' + statusCls + '</span></div>' +
      '<div class="actions">' +
        '<button class="edit" data-act="edit">Edit</button>' +
        '<button class="' + (r.status === 'published' ? 'unpub' : 'pub') + '" data-act="togglepub">' + (r.status === 'published' ? 'Unpublish' : 'Publish') + '</button>' +
        '<button class="del" data-act="del">Delete</button>' +
      '</div>' +
    '</div>';
  }
  function _examCls(t) {
    t = String(t || '').toLowerCase();
    if (t.indexOf('ielts') >= 0) return 'ielts';
    if (t.indexOf('cefr') >= 0) return 'cefr';
    if (t.indexOf('cambridge') >= 0) return 'camb';
    if (t.indexOf('sat') >= 0) return 'sat';
    if (t.indexOf('toefl') >= 0) return 'toefl';
    return 'cefr';
  }
  function _displayName(full, vis) {
    full = String(full || '').trim();
    if (!full) return '';
    if (vis === 'full') return full;
    var parts = full.split(/\s+/);
    if (vis === 'first') return parts[0];
    return parts.map(function (p) { return p.charAt(0).toUpperCase() + '.'; }).join(' ').trim();
  }
  function _fmtDate(iso) {
    if (!iso) return '';
    var m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return iso;
    var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return MON[parseInt(m[2], 10) - 1] + ' ' + m[1];
  }

  function _wireCardActions(root) {
    root.querySelectorAll('.bbA-card .actions button').forEach(function (b) {
      b.addEventListener('click', async function (e) {
        e.stopPropagation();
        var card = b.closest('.bbA-card');
        var id = card.getAttribute('data-id');
        var row = (state.items[state.tab] || []).find(function (x) { return x.id === id; });
        if (!row) return;
        var act = b.getAttribute('data-act');
        if (act === 'edit') openForm(row);
        else if (act === 'del') {
          if (!confirm('Delete this ' + (state.tab === 'announcements' ? 'announcement' : 'achievement') + '? This cannot be undone.')) return;
          try {
            await deleteRow(state.tab === 'announcements' ? 'center_announcements' : 'center_certificates', id);
            renderList();
          } catch (er) { alert('Delete failed: ' + (er.message || er)); }
        } else if (act === 'togglepub') {
          var newStatus = row.status === 'published' ? 'draft' : 'published';
          try {
            await saveRow(state.tab === 'announcements' ? 'center_announcements' : 'center_certificates', { status: newStatus }, id);
            renderList();
          } catch (er) { alert('Publish toggle failed: ' + (er.message || er)); }
        }
      });
    });
  }

  // ── form modal ────────────────────────────────────────────────────
  function openForm(existing) {
    var isEdit = !!existing;
    var isAnn  = state.tab === 'announcements';
    var modal = document.createElement('div');
    modal.className = 'bbA-modal';
    modal.innerHTML =
      '<div class="bbA-mcard">' +
        '<div class="bbA-mhead">' +
          '<h3>' + (isEdit ? 'Edit' : 'New') + ' ' + (isAnn ? 'announcement' : 'achievement') + '</h3>' +
          '<button class="bbA-mclose" title="Cancel">×</button>' +
        '</div>' +
        '<div class="bbA-mbody">' + (isAnn ? _annFormHtml(existing) : _certFormHtml(existing)) + '</div>' +
        '<div class="bbA-foot">' +
          '<span class="msg" id="bbAFormMsg"></span>' +
          '<button class="bbA-btn ghost" data-act="cancel">Cancel</button>' +
          '<button class="bbA-btn" data-act="save">' + (isEdit ? '💾 Save' : '➕ Create') + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    // Wire the 📋 Paste buttons — read an image from the clipboard and
    // stuff it into the matching <input type="file"> via DataTransfer.
    modal.querySelectorAll('[data-paste-target]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var targetId = btn.getAttribute('data-paste-target');
        var input    = modal.querySelector('#' + targetId);
        var status   = modal.querySelector('#' + targetId + '_status');
        if (!input || !status) return;
        status.className = 'bbA-paste-status';
        status.textContent = 'Reading clipboard…';
        try {
          if (!navigator.clipboard || !navigator.clipboard.read) {
            throw new Error('Clipboard not available in this browser. Paste with Ctrl+V works in the latest Chrome / Edge.');
          }
          var items = await navigator.clipboard.read();
          for (var i = 0; i < items.length; i++) {
            var item = items[i];
            for (var j = 0; j < item.types.length; j++) {
              var t = item.types[j];
              if (t.indexOf('image/') === 0) {
                var blob = await item.getType(t);
                var ext  = t.split('/')[1] || 'png';
                var file = new File([blob], 'pasted.' + ext, { type: t });
                var dt   = new DataTransfer();
                dt.items.add(file);
                input.files = dt.files;
                status.textContent = '✓ Pasted ' + ext.toUpperCase() + ' image (' + Math.round(blob.size / 1024) + ' KB)';
                return;
              }
            }
          }
          throw new Error('No image found on clipboard. Copy an image first (Win+Shift+S, etc).');
        } catch (err) {
          status.className = 'bbA-paste-status err';
          status.textContent = err.message || String(err);
        }
      });
    });

    function close() { modal.remove(); }
    modal.querySelector('.bbA-mclose').addEventListener('click', close);
    modal.querySelector('[data-act="cancel"]').addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    modal.querySelector('[data-act="save"]').addEventListener('click', async function () {
      var msg = modal.querySelector('#bbAFormMsg');
      msg.className = 'msg';
      msg.textContent = 'Saving…';
      try {
        var data;
        if (isAnn) data = await _readAnnForm(modal);
        else       data = await _readCertForm(modal);
        data.center_id = state.centerId;
        await saveRow(isAnn ? 'center_announcements' : 'center_certificates', data, existing && existing.id);
        close();
        renderList();
      } catch (e) {
        msg.className = 'msg err';
        msg.textContent = e.message || String(e);
      }
    });
  }

  function _annFormHtml(r) {
    r = r || {};
    var tagOpts = TAGS.map(function (t) { return '<option value="' + _attr(t.id) + '"' + ((r.tag || 'news') === t.id ? ' selected' : '') + '>' + _esc(t.label) + '</option>'; }).join('');
    var palOpts = PALETTES.map(function (p) { return '<option value="' + _attr(p.id) + '"' + ((r.cover_palette || 'c1') === p.id ? ' selected' : '') + '>' + _esc(p.label) + '</option>'; }).join('');
    var statusOpts = ['draft','published'].map(function (s) { return '<option value="' + s + '"' + ((r.status || 'draft') === s ? ' selected' : '') + '>' + s + '</option>'; }).join('');
    return '\
      <div class="bbA-field"><label>Title *</label><input id="f_title" type="text" value="' + _attr(r.title) + '" placeholder="Summer IELTS Crash Course — enrollment open" /></div>\
      <div class="bbA-field"><label>Body</label><textarea id="f_body" rows="5" placeholder="Two short sentences. Use a new line starting with &quot;- &quot; for bullet points.&#10;Example:&#10;Our 6-week intensive program includes:&#10;- Daily mocks&#10;- Personal feedback&#10;- Speaking club">' + _esc(r.body) + '</textarea><div class="bbA-fileinfo">Tip: start a line with <code>- </code> for a bullet, wrap text in <code>**stars**</code> for <b>bold</b>.</div></div>\
      <div class="bbA-field"><label>Cover image (optional)</label>\
        <div class="bbA-filerow"><input id="f_annfile" type="file" accept="image/*" /><button type="button" class="bbA-paste-btn" data-paste-target="f_annfile">📋 Paste</button></div>\
        <div class="bbA-paste-status" id="f_annfile_status"></div>' +
        (r.image_url ? '<img class="bbA-preview" src="' + _attr(r.image_url) + '" alt="current" />' : '') +
        '<div class="bbA-fileinfo">If set, this image replaces the emoji cover on the card. Paste an image directly from clipboard with the 📋 Paste button.' + (r.image_url ? ' Leave empty to keep the current image.' : '') + '</div></div>\
      <div class="bbA-row">\
        <div class="bbA-field"><label>Tag</label><select id="f_tag">' + tagOpts + '</select></div>\
        <div class="bbA-field"><label>Cover gradient (fallback)</label><select id="f_pal">' + palOpts + '</select></div>\
      </div>\
      <div class="bbA-row">\
        <div class="bbA-field"><label>Cover icon emoji (fallback)</label><input id="f_cover" type="text" maxlength="6" value="' + _attr(r.cover_icon || '📢') + '" /></div>\
        <div class="bbA-field"><label>Status</label><select id="f_status">' + statusOpts + '</select></div>\
      </div>\
      <div class="bbA-row">\
        <div class="bbA-field"><label>Starts on (optional)</label><input id="f_start" type="date" value="' + _attr(r.starts_at) + '" /></div>\
        <div class="bbA-field"><label>Ends on (optional)</label><input id="f_end" type="date" value="' + _attr(r.ends_at) + '" /></div>\
      </div>\
      <div class="bbA-field"><label>Link URL (optional)</label><input id="f_link" type="url" placeholder="https://…" value="' + _attr(r.link_url) + '" /></div>\
      <div style="margin:8px -20px 0;padding:14px 20px 6px;border-top:1px solid #e2e8f0;background:#f8fafc;">\
        <div style="font-size:12px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px;">📩 Telegram CTA (optional)</div>\
        <div class="bbA-row">\
          <div class="bbA-field"><label>Telegram username</label><input id="f_tg_user" type="text" placeholder="turgunov_kx (no @)" value="' + _attr(r.tg_username) + '" /></div>\
          <div class="bbA-field"><label>Button label</label><input id="f_cta" type="text" placeholder="Kursga qo&#39;shilish" value="' + _attr(r.cta_label) + '" /></div>\
        </div>\
        <div class="bbA-field"><label>Pre-filled Telegram message</label><textarea id="f_tg_msg" rows="3" placeholder="Men 3 oy, har kuni jonli dars o&#39;tiladigan Multilevel Sentabr kursida tayyorlanmoqchiman.">' + _esc(r.tg_message) + '</textarea><div class="bbA-fileinfo">Shown in the user&#39;s Telegram input box when they tap the button. Same <code>**bold**</code> / bullets formatting as the body.</div></div>\
      </div>';
  }
  async function _readAnnForm(modal) {
    var title = modal.querySelector('#f_title').value.trim();
    if (!title) throw new Error('Title is required');
    var file = modal.querySelector('#f_annfile').files[0];
    var imageUrl = null;
    if (file) {
      imageUrl = await uploadAnnImage(file, state.centerId);
    }
    var tgUser = (modal.querySelector('#f_tg_user').value || '').trim().replace(/^@/, '');
    var out = {
      title:          title,
      body:           modal.querySelector('#f_body').value,
      tag:            modal.querySelector('#f_tag').value,
      cover_icon:     modal.querySelector('#f_cover').value || '📢',
      cover_palette:  modal.querySelector('#f_pal').value,
      starts_at:      modal.querySelector('#f_start').value || null,
      ends_at:        modal.querySelector('#f_end').value || null,
      link_url:       modal.querySelector('#f_link').value || null,
      status:         modal.querySelector('#f_status').value,
      tg_username:    tgUser || null,
      tg_message:     modal.querySelector('#f_tg_msg').value || null,
      cta_label:      modal.querySelector('#f_cta').value || null
    };
    if (imageUrl) out.image_url = imageUrl;
    return out;
  }

  function _certFormHtml(r) {
    r = r || {};
    var examOpts = EXAM_TYPES.map(function (t) { return '<option value="' + _attr(t) + '"' + (r.exam_type === t ? ' selected' : '') + '>' + _esc(t) + '</option>'; }).join('');
    var visOpts  = VISIBILITY.map(function (v) { return '<option value="' + _attr(v.id) + '"' + ((r.name_visibility || 'initials') === v.id ? ' selected' : '') + '>' + _esc(v.label) + '</option>'; }).join('');
    var statusOpts = ['draft','published'].map(function (s) { return '<option value="' + s + '"' + ((r.status || 'draft') === s ? ' selected' : '') + '>' + s + '</option>'; }).join('');
    return '\
      <div class="bbA-field"><label>Student name *</label><input id="f_name" type="text" value="' + _attr(r.student_name) + '" placeholder="Aziza Karimova" /></div>\
      <div class="bbA-row">\
        <div class="bbA-field"><label>Name visibility</label><select id="f_vis">' + visOpts + '</select></div>\
        <div class="bbA-field"><label>Exam type *</label><select id="f_exam">' + examOpts + '</select></div>\
      </div>\
      <div class="bbA-row">\
        <div class="bbA-field"><label>Score / band *</label><input id="f_score" type="text" value="' + _attr(r.score) + '" placeholder="8.0 / C1 / 1480" /></div>\
        <div class="bbA-field"><label>Exam date (optional)</label><input id="f_date" type="date" value="' + _attr(r.exam_date) + '" /></div>\
      </div>\
      <div class="bbA-field"><label>Primary image (e.g., certificate scan)</label>\
        <div class="bbA-filerow"><input id="f_file" type="file" accept="image/*" /><button type="button" class="bbA-paste-btn" data-paste-target="f_file">📋 Paste</button></div>\
        <div class="bbA-paste-status" id="f_file_status"></div>' +
        (r.certificate_image_url ? '<img class="bbA-preview" src="' + _attr(r.certificate_image_url) + '" alt="current" />' : '') +
        '<div class="bbA-fileinfo">Leave empty to keep ' + (r.certificate_image_url ? 'the current image.' : 'no image (a styled placeholder will be shown).') + ' Paste from clipboard with 📋.</div></div>\
      <div class="bbA-field"><label>Secondary image (optional, e.g., student testimonial screenshot)</label>\
        <div class="bbA-filerow"><input id="f_file2" type="file" accept="image/*" /><button type="button" class="bbA-paste-btn" data-paste-target="f_file2">📋 Paste</button></div>\
        <div class="bbA-paste-status" id="f_file2_status"></div>' +
        (r.secondary_image_url ? '<img class="bbA-preview" src="' + _attr(r.secondary_image_url) + '" alt="current" />' : '') +
        '<div class="bbA-fileinfo">' + (r.secondary_image_url ? 'Leave empty to keep the current image. ' : '') + 'Both images appear stacked inside the detail popup.</div></div>\
      <div class="bbA-field"><label>Student feedback (testimonial, optional)</label><textarea id="f_fb" rows="4" placeholder="The mock interviews were exactly like the real exam. - Lots of practice - Helpful tutors">' + _esc(r.student_feedback) + '</textarea><div class="bbA-fileinfo">Tip: same formatting as announcements — <code>- </code> for bullets, <code>**stars**</code> for <b>bold</b>.</div></div>\
      <div class="bbA-row">\
        <div class="bbA-field"><label>Status</label><select id="f_status">' + statusOpts + '</select></div>\
        <div class="bbA-field"><label>&nbsp;</label><div style="font-size:11px;color:#64748b;padding:6px 0;">Drafts are hidden on the landing page.</div></div>\
      </div>\
      <label class="bbA-consent"><input id="f_consent" type="checkbox"' + (r.consent_given ? ' checked' : '') + ' /><span>I confirm the student has given consent to display their name and certificate publicly on the landing page.</span></label>';
  }
  async function _readCertForm(modal) {
    var name = modal.querySelector('#f_name').value.trim();
    if (!name) throw new Error('Student name is required');
    var exam = modal.querySelector('#f_exam').value;
    var score = modal.querySelector('#f_score').value.trim();
    if (!score) throw new Error('Score / band is required');
    var consent = modal.querySelector('#f_consent').checked;
    if (!consent) throw new Error('Consent checkbox must be ticked');
    var file  = modal.querySelector('#f_file').files[0];
    var file2 = modal.querySelector('#f_file2').files[0];
    var imageUrl = null, secondaryUrl = null;
    if (file)  imageUrl     = await uploadCertImage(file,  state.centerId);
    if (file2) secondaryUrl = await uploadCertImage(file2, state.centerId);
    var out = {
      student_name:     name,
      name_visibility:  modal.querySelector('#f_vis').value,
      exam_type:        exam,
      score:            score,
      exam_date:        modal.querySelector('#f_date').value || null,
      student_feedback: modal.querySelector('#f_fb').value || null,
      consent_given:    true,
      status:           modal.querySelector('#f_status').value
    };
    if (imageUrl)     out.certificate_image_url = imageUrl;
    if (secondaryUrl) out.secondary_image_url   = secondaryUrl;
    return out;
  }

  // ── entry point ───────────────────────────────────────────────────
  async function open(container) {
    state.container = container;
    state.role = await _role();
    if (!state.role || state.role.role === null) {
      container.innerHTML =
        '<div style="background:#fff;border:1px solid #fca5a5;border-radius:12px;padding:18px;color:#991b1b;">' +
        '<strong>Admin sign-in required.</strong> Please sign in with a super-admin or centre-admin account.</div>';
      return;
    }
    var isSuper = state.role.role === 'super_admin';
    if (!state.centerId) {
      state.centerId = isSuper ? 'mock_stream' : (state.role.center || 'mock_stream');
    }
    render();
  }

  window.AdminPanels = window.AdminPanels || {};
  window.AdminPanels.billboard = { open: open };
})();
