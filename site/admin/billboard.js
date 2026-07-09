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
  var EXAM_TYPES = ['IELTS Academic','IELTS General','CEFR Multilevel','Cambridge PET','Cambridge FCE','Cambridge CAE','Cambridge CPE','SAT','TOEFL','Other'];
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

  // Extract the storage object path from a public Supabase URL so we can
  // DELETE it. Returns null for any URL that isn't one of our own bucket
  // objects (manually-pasted external URLs are left alone).
  function _storagePath(url) {
    if (!url) return null;
    var prefix = SB_URL + '/storage/v1/object/public/' + BUCKET + '/';
    var s = String(url);
    if (s.indexOf(prefix) !== 0) return null;
    return s.slice(prefix.length);
  }
  // Best-effort storage delete — failures get logged but never block the
  // row delete/update (better an orphan than a stuck row).
  async function deleteStorageObject(url) {
    var path = _storagePath(url);
    if (!path) return;
    try {
      var sess = await _session();
      var token = (sess && sess.access_token) || SB_KEY;
      var r = await fetch(SB_URL + '/storage/v1/object/' + BUCKET + '/' + path, {
        method: 'DELETE',
        headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token }
      });
      if (!r.ok) {
        var t = ''; try { t = await r.text(); } catch (_e) {}
        console.warn('[billboard] storage delete ' + r.status + ': ' + path + ' ' + t);
      }
    } catch (e) { console.warn('[billboard] storage delete error', e); }
  }
  function _rowUrls(table, row) {
    if (!row) return [];
    if (table === 'center_announcements') return [row.image_url].filter(Boolean);
    return [row.certificate_image_url, row.secondary_image_url].filter(Boolean);
  }

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
    .bbA-modal{position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:10000;display:flex;align-items:flex-start;justify-content:center;padding:24px 18px;overflow-y:auto;backdrop-filter:blur(5px);}\
    .bbA-mcard{background:#fff;border-radius:18px;max-width:520px;width:100%;box-shadow:0 24px 60px rgba(15,23,42,.45);overflow:hidden;position:relative;}\
    .bbA-mhead{padding:14px 18px;display:flex;justify-content:space-between;align-items:center;background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%);color:#fff;}\
    .bbA-mhead h3{margin:0;font-size:16px;font-weight:800;letter-spacing:.005em;display:flex;align-items:center;gap:7px;}\
    .bbA-mhead h3::before{content:"🏆";font-size:18px;}\
    .bbA-mhead.ann h3::before{content:"📢";}\
    .bbA-mclose{width:28px;height:28px;border-radius:50%;border:0;background:rgba(255,255,255,.22);cursor:pointer;font-size:17px;color:#fff;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);transition:background .15s;}\
    .bbA-mclose:hover{background:rgba(255,255,255,.35);}\
    .bbA-mbody{padding:14px 18px 16px;display:flex;flex-direction:column;gap:11px;}\
    .bbA-field{display:flex;flex-direction:column;gap:4px;}\
    .bbA-field label{font-size:11px;font-weight:800;color:#4f46e5;text-transform:uppercase;letter-spacing:.06em;}\
    .bbA-field input,.bbA-field textarea,.bbA-field select{padding:8px 11px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:13.5px;font-family:inherit;background:#fff;color:#0f172a;transition:border-color .15s,box-shadow .15s;}\
    .bbA-field input:focus,.bbA-field textarea:focus,.bbA-field select:focus{outline:none;border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.18);}\
    .bbA-field textarea{min-height:60px;resize:vertical;}\
    .bbA-subform{max-width:560px;display:flex;flex-direction:column;gap:14px;background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:18px 20px;box-shadow:0 2px 10px rgba(15,23,42,.05);}\
    .bbA-subhint{margin:0;font-size:12.5px;line-height:1.55;color:#475569;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:11px 13px;}\
    .bbA-subgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}\
    .bbA-subfoot{display:flex;align-items:center;gap:12px;justify-content:flex-end;margin-top:2px;}\
    .bbA-subfoot .msg{flex:1;font-size:12.5px;font-weight:600;}\
    .bbA-subimgs{display:flex;flex-wrap:wrap;gap:10px;}\
    .bbA-subimg{position:relative;width:120px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;background:#f8fafc;}\
    .bbA-subimg img{display:block;width:100%;height:78px;object-fit:cover;}\
    .bbA-subimg-ctl{display:flex;border-top:1px solid #e2e8f0;}\
    .bbA-subimg-ctl button{flex:1;border:0;background:#fff;padding:5px 0;font-size:12px;cursor:pointer;color:#475569;border-right:1px solid #f1f5f9;}\
    .bbA-subimg-ctl button:last-child{border-right:0;color:#dc2626;}\
    .bbA-subimg-ctl button:disabled{opacity:.35;cursor:default;}\
    .bbA-subimg-ctl button:hover:not(:disabled){background:#f8fafc;}\
    .bbA-subimg-empty{font-size:12.5px;color:#94a3b8;padding:8px 0;}\
    .bbA-subimg-actions{display:flex;align-items:center;gap:8px;margin-top:8px;}\
    @media(max-width:560px){.bbA-subgrid{grid-template-columns:1fr;}}\
    .bbA-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;}\
    .bbA-foot{display:flex;justify-content:flex-end;align-items:center;gap:8px;padding:11px 18px;border-top:1px solid #eef2ff;background:linear-gradient(180deg,#f8fafc 0%,#f5f3ff 100%);flex-wrap:wrap;}\
    .bbA-foot .msg{font-size:12px;color:#475569;flex:1;}\
    .bbA-foot .msg.err{color:#991b1b;}\
    .bbA-consent{display:flex;gap:8px;align-items:flex-start;font-size:12.5px;color:#0f172a;background:#fffbeb;border:1px solid #fde68a;padding:10px;border-radius:8px;}\
    .bbA-consent input{margin-top:2px;}\
    .bbA-fileinfo{font-size:10.5px;color:#64748b;margin-top:3px;line-height:1.4;}\
    .bbA-preview{margin-top:5px;max-height:110px;border-radius:6px;display:block;}\
    .bbA-filerow{display:flex;gap:6px;align-items:center;}\
    .bbA-filerow input[type="file"]{flex:1 1 0;min-width:0;font-size:12px;color:#475569;}\
    .bbA-filerow input[type="file"]::file-selector-button{padding:6px 10px;border:1.5px solid #c7d2fe;border-radius:6px;background:#eef2ff;color:#4338ca;font-weight:700;font-size:11.5px;cursor:pointer;margin-right:8px;font-family:inherit;}\
    .bbA-filerow input[type="file"]::file-selector-button:hover{background:#e0e7ff;}\
    .bbA-paste-btn,.bbA-clear-btn{padding:6px 10px;border:1.5px solid #e2e8f0;background:#fff;border-radius:7px;font-size:11.5px;font-weight:700;cursor:pointer;color:#475569;white-space:nowrap;font-family:inherit;display:inline-flex;align-items:center;gap:3px;}\
    .bbA-paste-btn:hover{background:#eef2ff;border-color:#a5b4fc;color:#4338ca;}\
    .bbA-clear-btn:hover{background:#fef2f2;border-color:#fca5a5;color:#b91c1c;}\
    .bbA-paste-btn:active,.bbA-clear-btn:active{transform:scale(.96);}\
    .bbA-paste-status{font-size:11px;color:#16a34a;margin-top:3px;min-height:0;font-weight:700;}\
    .bbA-paste-status.err{color:#dc2626;}\
    .bbA-exam-toggle{display:flex;gap:4px;background:#eef2ff;padding:3px;border-radius:11px;border:1.5px solid #c7d2fe;}\
    .bbA-exam-btn{flex:1;padding:9px;border:0;background:transparent;font-size:13.5px;font-weight:800;color:#6366f1;border-radius:8px;cursor:pointer;font-family:inherit;transition:background .15s,color .15s,box-shadow .15s,transform .15s;}\
    .bbA-exam-btn:hover{color:#4338ca;}\
    .bbA-exam-btn.active{background:linear-gradient(135deg,#6366f1,#7c3aed);color:#fff;box-shadow:0 4px 12px rgba(99,102,241,.35);}\
    .bbA-tag-grid{display:flex;flex-wrap:wrap;gap:4px;background:#eef2ff;padding:3px;border-radius:11px;border:1.5px solid #c7d2fe;}\
    .bbA-tag-btn{flex:1 1 auto;min-width:78px;padding:8px 6px;border:0;background:transparent;font-size:12.5px;font-weight:800;color:#6366f1;border-radius:8px;cursor:pointer;font-family:inherit;transition:background .15s,color .15s,box-shadow .15s,transform .15s;}\
    .bbA-tag-btn:hover{color:#4338ca;}\
    .bbA-tag-btn.active{color:#fff;box-shadow:0 4px 12px rgba(99,102,241,.32);}\
    .bbA-tag-btn.active[data-tag="course"]{background:linear-gradient(135deg,#6366f1,#8b5cf6);}\
    .bbA-tag-btn.active[data-tag="new"]{background:linear-gradient(135deg,#0ea5e9,#06b6d4);box-shadow:0 4px 12px rgba(14,165,233,.32);}\
    .bbA-tag-btn.active[data-tag="results"]{background:linear-gradient(135deg,#f59e0b,#ef4444);box-shadow:0 4px 12px rgba(239,68,68,.32);}\
    .bbA-tag-btn.active[data-tag="event"]{background:linear-gradient(135deg,#10b981,#059669);box-shadow:0 4px 12px rgba(16,185,129,.32);}\
    .bbA-tag-btn.active[data-tag="news"]{background:linear-gradient(135deg,#4f46e5,#6366f1);}\
    .bbA-collapse{margin-top:4px;background:linear-gradient(180deg,#f5f3ff,#eef2ff);border:1.5px solid #ddd6fe;border-radius:11px;padding:0;}\
    .bbA-collapse summary{padding:10px 14px;cursor:pointer;font-size:12.5px;font-weight:800;color:#4338ca;list-style:none;display:flex;align-items:center;gap:6px;user-select:none;}\
    .bbA-collapse summary::-webkit-details-marker{display:none;}\
    .bbA-collapse summary::after{content:"▾";margin-left:auto;transition:transform .2s;color:#6366f1;}\
    .bbA-collapse[open] summary::after{transform:rotate(180deg);}\
    .bbA-collapse-body{padding:0 14px 12px;display:flex;flex-direction:column;gap:9px;}\
    .bbA-cefr-hint{font-size:11.5px;color:#16a34a;margin-top:3px;font-weight:700;min-height:14px;display:inline-flex;align-items:center;gap:4px;}\
    .bbA-cefr-hint:not(:empty){background:#dcfce7;padding:3px 9px;border-radius:999px;border:1px solid #bbf7d0;align-self:flex-start;}\
    .bbA-cefr-hint.warn{color:#92400e;}\
    .bbA-cefr-hint.warn:not(:empty){background:#fef3c7;border-color:#fde68a;}\
    .bbA-toast{position:absolute;left:50%;top:12px;transform:translate(-50%,-30px);background:linear-gradient(135deg,#10b981,#059669);color:#fff;padding:8px 18px;border-radius:999px;font-size:13px;font-weight:800;box-shadow:0 8px 20px rgba(16,185,129,.4);opacity:0;transition:transform .25s,opacity .25s;pointer-events:none;z-index:5;}\
    .bbA-toast.show{transform:translate(-50%,0);opacity:1;}\
    .bbA-foot .bbA-btn{padding:9px 16px;font-size:13px;}\
    .bbA-foot .bbA-btn.ghost{background:#fff;border:1.5px solid #e2e8f0;}\
    .bbA-foot .bbA-btn.ghost:hover{background:#f8fafc;border-color:#c7d2fe;color:#4338ca;}\
    @media (max-width: 640px) {\
      .bbA-modal{padding:10px;}\
      .bbA-mcard{max-width:100%;border-radius:14px;}\
      .bbA-mhead{padding:12px 14px;}\
      .bbA-mhead h3{font-size:15px;}\
      .bbA-mbody{padding:12px 14px 14px;gap:9px;}\
      .bbA-foot{padding:10px 12px;gap:6px;}\
      .bbA-foot .msg{flex:1 1 100%;text-align:center;margin:0 0 2px;}\
      .bbA-foot .bbA-btn{flex:1 1 auto;padding:9px 10px;font-size:12.5px;}\
      .bbA-row{grid-template-columns:1fr;gap:9px;}\
      .bbA-exam-btn{font-size:12.5px;padding:8px;}\
      .bbA-head{flex-direction:column;align-items:stretch;}\
      .bbA-toolbar{gap:8px;}\
      .bbA-tabs{flex:1;}\
      .bbA-tab{flex:1;text-align:center;}\
      .bbA-grid{grid-template-columns:1fr;}\
      .bbA-fileinfo{font-size:10px;}\
      .bbA-filerow input[type="file"]{font-size:11px;}\
      .bbA-paste-btn,.bbA-clear-btn{padding:6px 8px;font-size:11px;}\
    }\
    </style>';

  // ── render ────────────────────────────────────────────────────────
  async function render() {
    var c = state.container;
    var isSuper = state.role && state.role.role === 'super_admin';
    // The centre picker only appears for a super-admin ON THE MAIN SITE.
    // On a clone site the centre is locked to that clone.
    var showPicker = isSuper && _isMainSite();

    c.innerHTML = STYLES + '\
      <div class="bbA-wrap">\
        <div class="bbA-head">\
          <h2 class="bbA-title">📢 Billboard <span style="font-size:11px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;padding:3px 8px;border-radius:999px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">' + (showPicker ? 'Super-admin · all centres' : (isSuper ? 'Super-admin · ' + _esc(centerLabel(state.centerId)) + ' only' : 'Centre admin')) + '</span></h2>\
          <div class="bbA-tabs">\
            <button class="bbA-tab' + (state.tab === 'announcements' ? ' active' : '') + '" data-tab="announcements">📢 Announcements</button>\
            <button class="bbA-tab' + (state.tab === 'certificates' ? ' active' : '') + '" data-tab="certificates">🏆 Achievements</button>\
            <button class="bbA-tab' + (state.tab === 'subscription' ? ' active' : '') + '" data-tab="subscription">💳 Obuna</button>\
          </div>\
        </div>\
        <div class="bbA-toolbar">\
          ' + (showPicker ? _centerSelectHtml() : '<span style="font-size:13px;color:#475569;">Centre: <b>' + _esc(centerLabel(state.centerId)) + '</b></span>') + '\
          <span style="flex:1;"></span>\
          ' + (state.tab === 'subscription' ? '' : '<button class="bbA-btn" id="bbAAdd">+ Add new</button>') + '\
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
    var _addBtn = c.querySelector('#bbAAdd');
    if (_addBtn) _addBtn.addEventListener('click', function () { openForm(null); });
    c.querySelector('#bbARefresh').addEventListener('click', function () { renderList(); });
    if (showPicker) {
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
    if (state.tab === 'subscription') return renderSubscription(list);
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

  // ── Subscription ("Obuna") config — one row per centre in center_subscription.
  // Benefits + preview in the landing modal are static/global; these fields set
  // the price, payment card and Telegram username shown for this centre.
  async function renderSubscription(list) {
    list.innerHTML = '<div class="bbA-loading">Loading…</div>';
    var row = {};
    try {
      var url = SB_URL + '/rest/v1/center_subscription?center_id=eq.'
              + encodeURIComponent(state.centerId) + '&select=*&limit=1';
      var r = await window.AdminAuth.fetch(url, { method: 'GET' });
      if (r.ok) { var rows = await r.json(); row = (rows && rows[0]) || {}; }
    } catch (_e) {}
    var pub = row.status === 'published';
    list.innerHTML =
      '<div class="bbA-subform">' +
        '<p class="bbA-subhint">The <b>Obuna bo\'lish</b> panel\'s benefits &amp; screenshots are the same on every site. The fields below set the <b>price, payment card and Telegram</b> shown for <b>' + _esc(centerLabel(state.centerId)) + '</b>. Leave a field empty to hide it. Set <b>Status = Published</b> for the payment details to go live.</p>' +
        '<div class="bbA-field"><label>Status</label><select id="fs_status">' +
          '<option value="draft"' + (!pub ? ' selected' : '') + '>Draft — hidden (visitors see benefits only)</option>' +
          '<option value="published"' + (pub ? ' selected' : '') + '>Published — live</option>' +
        '</select></div>' +
        '<div class="bbA-subgrid">' +
          '<div class="bbA-field"><label>Period label</label><input id="fs_period" type="text" value="' + _attr(row.period_label) + '" placeholder="1 oylik obuna" /></div>' +
          '<div class="bbA-field"><label>Price</label><input id="fs_price" type="text" value="' + _attr(row.price_text) + '" placeholder="119 000 so&#39;m" /></div>' +
        '</div>' +
        '<div class="bbA-field"><label>Card number</label><input id="fs_card" type="text" value="' + _attr(row.card_number) + '" placeholder="5614 6814 2820 6829" /></div>' +
        '<div class="bbA-field"><label>Card holder</label><input id="fs_holder" type="text" value="' + _attr(row.card_holder) + '" placeholder="Dilshodbek Abdullajonov" /></div>' +
        '<div class="bbA-field"><label>Telegram username <span style="color:#94a3b8;font-weight:600;">(no @ — receipts go here)</span></label><input id="fs_tg" type="text" value="' + _attr(row.telegram_username) + '" placeholder="DilshodbekAbdullajonov" /></div>' +
        '<div class="bbA-field"><label>Instructor / teacher name <span style="color:#94a3b8;font-weight:600;">(optional)</span></label><input id="fs_instr" type="text" value="' + _attr(row.instructor) + '" placeholder="Dilshodbek Abdullajonov" /></div>' +
        '<div class="bbA-field"><label>Tagline / quote <span style="color:#94a3b8;font-weight:600;">(optional)</span></label><input id="fs_quote" type="text" value="' + _attr(row.quote) + '" placeholder="🚀 Writing &amp; Speaking balingizni keyingi darajaga olib chiqing!" /></div>' +
        '<div class="bbA-field"><label>Pitch / about the platform <span style="color:#94a3b8;font-weight:600;">(optional — line breaks kept)</span></label><textarea id="fs_pitch" rows="6" placeholder="Marketing description shown in the modal.">' + _esc(row.pitch) + '</textarea></div>' +
        '<div class="bbA-field"><label>Preview images <span style="color:#94a3b8;font-weight:600;">(optional — empty = default screenshots)</span></label>' +
          '<div id="fs_imgs_list" class="bbA-subimgs"></div>' +
          '<div class="bbA-subimg-actions"><input type="file" id="fs_imgfile" accept="image/*" /><span style="font-size:12px;color:#94a3b8;">Upload a screenshot to add it</span></div>' +
        '</div>' +
        '<div class="bbA-subfoot"><span class="msg" id="bbASubMsg"></span><button class="bbA-btn" id="bbASubSave">💾 Save</button></div>' +
      '</div>';
    // ── preview-image manager ──
    state.subImgs = Array.isArray(row.preview_images) ? row.preview_images.slice() : [];
    function _renderSubImgs() {
      var box = document.getElementById('fs_imgs_list');
      if (!box) return;
      if (!state.subImgs.length) {
        box.innerHTML = '<div class="bbA-subimg-empty">No custom images — visitors see the default screenshots.</div>';
        return;
      }
      box.innerHTML = state.subImgs.map(function (u, i) {
        return '<div class="bbA-subimg" data-i="' + i + '"><img src="' + _attr(u) + '" alt="" />' +
          '<div class="bbA-subimg-ctl">' +
            '<button type="button" data-act="up" title="Move left"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
            '<button type="button" data-act="down" title="Move right"' + (i === state.subImgs.length - 1 ? ' disabled' : '') + '>↓</button>' +
            '<button type="button" data-act="del" title="Remove">✕</button>' +
          '</div></div>';
      }).join('');
      box.querySelectorAll('button[data-act]').forEach(function (b) {
        b.addEventListener('click', function () {
          var i = parseInt(b.closest('.bbA-subimg').getAttribute('data-i'), 10);
          var act = b.getAttribute('data-act'), a = state.subImgs;
          if (act === 'del') a.splice(i, 1);
          else if (act === 'up' && i > 0) { var t = a[i - 1]; a[i - 1] = a[i]; a[i] = t; }
          else if (act === 'down' && i < a.length - 1) { var t2 = a[i + 1]; a[i + 1] = a[i]; a[i] = t2; }
          _renderSubImgs();
        });
      });
    }
    _renderSubImgs();
    var imgfile = document.getElementById('fs_imgfile');
    if (imgfile) imgfile.addEventListener('change', async function () {
      var f = imgfile.files && imgfile.files[0];
      if (!f) return;
      var msg = document.getElementById('bbASubMsg');
      if (msg) { msg.textContent = 'Uploading image…'; msg.style.color = '#475569'; }
      try {
        var url = await uploadImage(f, state.centerId, 'subscription');
        state.subImgs.push(url); _renderSubImgs();
        if (msg) { msg.textContent = '✓ Image added — remember to Save'; msg.style.color = '#15803d'; }
      } catch (e) {
        if (msg) { msg.textContent = 'Upload failed: ' + (e && e.message ? e.message : e); msg.style.color = '#991b1b'; }
      }
      imgfile.value = '';
    });

    document.getElementById('bbASubSave').addEventListener('click', function () { saveSubscription(row.id); });
  }

  async function saveSubscription(existingId) {
    var msg = document.getElementById('bbASubMsg');
    function _v(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
    var data = {
      center_id:         state.centerId,
      status:            document.getElementById('fs_status').value,
      period_label:      _v('fs_period') || null,
      price_text:        _v('fs_price') || null,
      card_number:       _v('fs_card') || null,
      card_holder:       _v('fs_holder') || null,
      telegram_username: _v('fs_tg').replace(/^@/, '') || null,
      instructor:        _v('fs_instr') || null,
      quote:             _v('fs_quote') || null,
      pitch:             _v('fs_pitch') || null,
      preview_images:    (state.subImgs || []),
      updated_at:        new Date().toISOString()
    };
    if (msg) { msg.textContent = 'Saving…'; msg.style.color = '#475569'; }
    try {
      await saveRow('center_subscription', data, existingId);
      if (msg) { msg.textContent = '✓ Saved'; msg.style.color = '#15803d'; }
      // Reload so a freshly-created row picks up its id for the next save.
      setTimeout(function () { if (state.tab === 'subscription') renderList(); }, 700);
    } catch (e) {
      if (msg) { msg.textContent = 'Failed: ' + (e && e.message ? e.message : e); msg.style.color = '#991b1b'; }
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
            var tableName = state.tab === 'announcements' ? 'center_announcements' : 'center_certificates';
            // Storage cleanup BEFORE the row delete — that way we still
            // have the URLs (if the row delete races ahead, the URLs are
            // gone and we can never reach the objects).
            var urls = _rowUrls(tableName, row);
            await Promise.all(urls.map(deleteStorageObject));
            await deleteRow(tableName, id);
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
        '<div class="bbA-mhead' + (isAnn ? ' ann' : '') + '">' +
          '<h3>' + (isEdit ? 'Edit' : 'New') + ' ' + (isAnn ? 'announcement' : 'achievement') + '</h3>' +
          '<button class="bbA-mclose" title="Cancel">×</button>' +
        '</div>' +
        '<div class="bbA-mbody">' + (isAnn ? _annFormHtml(existing) : _certFormHtml(existing)) + '</div>' +
        '<div class="bbA-foot">' +
          '<span class="msg" id="bbAFormMsg"></span>' +
          '<button class="bbA-btn ghost" data-act="cancel">Cancel</button>' +
          (!isEdit ? '<button class="bbA-btn ghost" data-act="save-add">💾 Save &amp; Add another</button>' : '') +
          '<button class="bbA-btn" data-act="save">' + (isEdit ? '💾 Save' : '➕ Create') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="bbA-toast" id="bbAToast">✓ Saved</div>';
    document.body.appendChild(modal);

    // Wire the IELTS / Multilevel exam toggle + dynamic CEFR hint.
    var cefrHint  = modal.querySelector('#bbA_cefr_hint');
    var scoreEl   = modal.querySelector('#f_score');
    function _currentExamMode() {
      var active = modal.querySelector('.bbA-exam-btn.active');
      return active ? active.getAttribute('data-exam') : 'multilevel';
    }
    function _refreshScoreField() {
      if (!scoreEl) return;
      var mode = _currentExamMode();
      if (mode === 'ielts') {
        scoreEl.setAttribute('placeholder', '7.5');
        scoreEl.setAttribute('min', '0');
        scoreEl.setAttribute('max', '9');
        scoreEl.setAttribute('step', '0.5');
      } else {
        scoreEl.setAttribute('placeholder', '67');
        scoreEl.setAttribute('min', '0');
        scoreEl.setAttribute('max', '75');
        scoreEl.setAttribute('step', '1');
      }
      _updateCefrHint();
    }
    function _updateCefrHint() {
      if (!cefrHint || !scoreEl) return;
      var raw = parseFloat(scoreEl.value);
      if (isNaN(raw)) { cefrHint.textContent = ''; return; }
      var mode = _currentExamMode();
      var result = mode === 'ielts' ? _cefrFromIelts(raw) : _cefrFromMultilevel(raw);
      if (!result) { cefrHint.textContent = ''; return; }
      var hue = result.level === 'B1' || result.level.indexOf('A') === 0 ? 'warn' : '';
      cefrHint.className = 'bbA-cefr-hint' + (hue ? ' ' + hue : '');
      cefrHint.textContent = '→ ' + result.level + (result.note ? ' · ' + result.note : '');
    }
    modal.querySelectorAll('.bbA-exam-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        modal.querySelectorAll('.bbA-exam-btn').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        _refreshScoreField();
      });
    });
    // Announcement type pills (auto-set palette + emoji).
    modal.querySelectorAll('.bbA-tag-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        modal.querySelectorAll('.bbA-tag-btn').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
      });
    });
    if (scoreEl) scoreEl.addEventListener('input', _updateCefrHint);
    _refreshScoreField();

    // ✕ Clear buttons — drop the chosen / pasted file before saving.
    modal.querySelectorAll('[data-clear-target]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-clear-target');
        var input  = modal.querySelector('#' + id);
        var status = modal.querySelector('#' + id + '_status');
        if (input) input.value = '';
        if (status) { status.className = 'bbA-paste-status'; status.textContent = 'Cleared'; setTimeout(function () { status.textContent = ''; }, 1500); }
      });
    });

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
    async function _saveOnce(closeAfter) {
      var msg = modal.querySelector('#bbAFormMsg');
      msg.className = 'msg';
      msg.textContent = 'Saving…';
      try {
        var data;
        if (isAnn) data = await _readAnnForm(modal);
        else       data = await _readCertForm(modal);
        data.center_id = state.centerId;
        // URLs to orphan-clean after a successful update.
        var toOrphan = [];
        if (isEdit && existing) {
          if (isAnn) {
            if (data.image_url && existing.image_url) toOrphan.push(existing.image_url);
          } else {
            if (data.certificate_image_url && existing.certificate_image_url) toOrphan.push(existing.certificate_image_url);
            if (data.secondary_image_url   && existing.secondary_image_url)   toOrphan.push(existing.secondary_image_url);
          }
        }
        await saveRow(isAnn ? 'center_announcements' : 'center_certificates', data, existing && existing.id);
        if (toOrphan.length) await Promise.all(toOrphan.map(deleteStorageObject));
        msg.textContent = '';
        if (closeAfter) {
          close();
          renderList();
        } else {
          // Show toast + reset per-candidate fields, keep exam type / date
          var toast = modal.querySelector('#bbAToast');
          if (toast) { toast.classList.add('show'); setTimeout(function () { toast.classList.remove('show'); }, 1500); }
          _resetForNextCandidate();
        }
      } catch (e) {
        msg.className = 'msg err';
        msg.textContent = e.message || String(e);
      }
    }
    function _resetForNextCandidate() {
      if (isAnn) {
        var t = modal.querySelector('#f_title');   if (t) { t.value = ''; t.focus(); }
        var b = modal.querySelector('#f_body');    if (b) b.value = '';
        var ai= modal.querySelector('#f_annfile'); if (ai) ai.value = '';
        var tm= modal.querySelector('#f_tg_msg');  if (tm) tm.value = '';
        // Type pill, date range, Telegram username + button label all stay
        // so a batch of "Results" or "Course" announcements goes fast.
      } else {
        var n = modal.querySelector('#f_name');    if (n) { n.value = ''; n.focus(); }
        var s = modal.querySelector('#f_score');   if (s) s.value = '';
        var f1= modal.querySelector('#f_file');    if (f1) f1.value = '';
        var f2= modal.querySelector('#f_file2');   if (f2) f2.value = '';
        var fb= modal.querySelector('#f_fb');      if (fb) fb.value = '';
        // Exam type + date are intentionally preserved.
      }
      modal.querySelectorAll('.bbA-paste-status').forEach(function (e) { e.textContent = ''; });
      if (cefrHint) cefrHint.textContent = '';
    }
    modal.querySelector('[data-act="save"]').addEventListener('click', function () { _saveOnce(true); });
    var saveAddBtn = modal.querySelector('[data-act="save-add"]');
    if (saveAddBtn) saveAddBtn.addEventListener('click', function () { _saveOnce(false); });
  }

  // Tag → palette + emoji preset (used to auto-derive the fallback cover).
  var TAG_PRESETS = {
    course:  { pal: 'c1', icon: '🎓', label: '🎓 Course' },
    event:   { pal: 'c4', icon: '🗓️', label: '🗓️ Event'  },
    news:    { pal: 'c1', icon: '📢', label: '📢 News'   }
  };

  function _annFormHtml(r) {
    r = r || {};
    var currentTag = (r.tag && TAG_PRESETS[r.tag]) ? r.tag : 'news';
    var tagPills = Object.keys(TAG_PRESETS).map(function (key) {
      var p = TAG_PRESETS[key];
      return '<button type="button" class="bbA-tag-btn' + (key === currentTag ? ' active' : '') +
             '" data-tag="' + key + '" data-pal="' + p.pal + '" data-icon="' + _attr(p.icon) + '">' + _esc(p.label) + '</button>';
    }).join('');
    var hasTg = !!(r.tg_username || r.tg_message || r.cta_label);
    return '\
      <div class="bbA-field"><label>Type *</label>\
        <div class="bbA-tag-grid">' + tagPills + '</div>\
        <div class="bbA-fileinfo">Sets the fallback cover colour and icon when no image is uploaded.</div>\
      </div>\
      <div class="bbA-field"><label>Title *</label><input id="f_title" type="text" value="' + _attr(r.title) + '" placeholder="Summer IELTS Crash Course — enrollment open" /></div>\
      <div class="bbA-field"><label>Body</label><textarea id="f_body" rows="4" placeholder="Two short sentences. Start a line with &quot;- &quot; for bullets.&#10;Example:&#10;Our 6-week intensive program includes:&#10;- Daily mocks&#10;- Personal feedback">' + _esc(r.body) + '</textarea><div class="bbA-fileinfo">Tip: <code>- </code> for bullets, <code>**stars**</code> for <b>bold</b>.</div></div>\
      <div class="bbA-field"><label>Cover image (optional)</label>\
        <div class="bbA-filerow"><input id="f_annfile" type="file" accept="image/*" /><button type="button" class="bbA-paste-btn" data-paste-target="f_annfile">📋 Paste</button><button type="button" class="bbA-clear-btn" data-clear-target="f_annfile">✕ Clear</button></div>\
        <div class="bbA-paste-status" id="f_annfile_status"></div>' +
        (r.image_url ? '<img class="bbA-preview" src="' + _attr(r.image_url) + '" alt="current" />' : '') +
        '<div class="bbA-fileinfo">If set, this image replaces the type cover on the card.' + (r.image_url ? ' Leave empty to keep the current image.' : '') + '</div>\
        <div class="bbA-fitrow" style="margin-top:6px;display:flex;gap:14px;align-items:center;font-size:12px;">\
          <span style="color:#64748b;">Image rendering:</span>\
          <label style="display:flex;align-items:center;gap:4px;cursor:pointer;"><input type="radio" name="f_imgfit" value="cover"' + ((r.image_fit || 'cover') === 'cover' ? ' checked' : '') + ' /> <b>Fill</b> <span style="color:#94a3b8;">(full bleed, may crop edges)</span></label>\
          <label style="display:flex;align-items:center;gap:4px;cursor:pointer;"><input type="radio" name="f_imgfit" value="contain"' + (r.image_fit === 'contain' ? ' checked' : '') + ' /> <b>Fit</b> <span style="color:#94a3b8;">(whole image, with bars)</span></label>\
        </div></div>\
      <details class="bbA-collapse"' + (hasTg ? ' open' : '') + '>\
        <summary>📩 Telegram CTA <span class="bbA-fileinfo" style="margin-left:6px;color:#94a3b8;">(optional)</span></summary>\
        <div class="bbA-collapse-body">\
          <div class="bbA-row">\
            <div class="bbA-field"><label>Telegram username</label><input id="f_tg_user" type="text" placeholder="turgunov_kx (no @)" value="' + _attr(r.tg_username) + '" /></div>\
            <div class="bbA-field"><label>Button label</label><input id="f_cta" type="text" placeholder="Kursga qo&#39;shilish" value="' + _attr(r.cta_label) + '" /></div>\
          </div>\
          <div class="bbA-field"><label>Pre-filled Telegram message</label><textarea id="f_tg_msg" rows="3" placeholder="Men 3 oy, har kuni jonli dars o&#39;tiladigan Multilevel Sentabr kursida tayyorlanmoqchiman.">' + _esc(r.tg_message) + '</textarea><div class="bbA-fileinfo">Shown in the visitor&#39;s Telegram input box when they tap the button.</div></div>\
        </div>\
      </details>';
  }
  async function _readAnnForm(modal) {
    var title = modal.querySelector('#f_title').value.trim();
    if (!title) throw new Error('Title is required');
    var file = modal.querySelector('#f_annfile').files[0];
    var imageUrl = null;
    if (file) {
      imageUrl = await uploadAnnImage(file, state.centerId);
    }
    var activeTag = modal.querySelector('.bbA-tag-btn.active');
    var tag       = activeTag ? activeTag.getAttribute('data-tag') : 'news';
    var pal       = activeTag ? activeTag.getAttribute('data-pal') : 'c1';
    var icon      = activeTag ? activeTag.getAttribute('data-icon') : '📢';
    var tgUser = (modal.querySelector('#f_tg_user').value || '').trim().replace(/^@/, '');
    var out = {
      title:          title,
      body:           modal.querySelector('#f_body').value,
      tag:            tag,
      cover_icon:     icon,
      cover_palette:  pal,
      starts_at:      null,
      ends_at:        null,
      link_url:       null,
      status:         'published',
      tg_username:    tgUser || null,
      tg_message:     modal.querySelector('#f_tg_msg').value || null,
      cta_label:      modal.querySelector('#f_cta').value || null
    };
    if (imageUrl) out.image_url = imageUrl;
    var fitRadio = modal.querySelector('input[name="f_imgfit"]:checked');
    out.image_fit = fitRadio ? fitRadio.value : 'cover';
    return out;
  }

  // Map a raw score to a CEFR level + descriptive note.
  function _cefrFromMultilevel(score) {
    if (isNaN(score) || score < 0) return null;
    if (score < 51)  return { level: 'B1',  note: 'below B2 threshold' };
    if (score <= 56) return { level: 'B2',  note: 'just achieved' };
    if (score <= 61) return { level: 'B2',  note: 'strong B2' };
    if (score <= 64) return { level: 'B2+', note: 'a bit shy from C1' };
    if (score <= 67) return { level: 'C1',  note: 'lucky candidate' };
    if (score <= 71) return { level: 'C1',  note: 'strong C1' };
    return { level: 'C1', note: 'outstanding' };
  }
  function _cefrFromIelts(band) {
    if (isNaN(band) || band < 0) return null;
    if (band < 4.0)  return { level: 'A2',  note: '' };
    if (band < 5.0)  return { level: 'A2+', note: 'edge of B1' };
    if (band <= 5.5) return { level: 'B1',  note: '' };
    if (band <= 6.0) return { level: 'B2',  note: 'just achieved' };
    if (band <= 6.5) return { level: 'B2',  note: 'strong B2' };
    if (band <= 7.0) return { level: 'C1',  note: 'just achieved' };
    if (band <= 7.5) return { level: 'C1',  note: 'strong C1' };
    if (band <= 8.5) return { level: 'C2',  note: 'high proficiency' };
    return { level: 'C2', note: 'expert' };
  }

  function _certFormHtml(r) {
    r = r || {};
    // Map legacy exam_type strings to one of two tabs.
    var examMode = 'multilevel';
    if (r.exam_type && /ielts/i.test(r.exam_type)) examMode = 'ielts';
    return '\
      <div class="bbA-field"><label>Exam type *</label>\
        <div class="bbA-exam-toggle">\
          <button type="button" class="bbA-exam-btn' + (examMode === 'multilevel' ? ' active' : '') + '" data-exam="multilevel">🇺🇿 Multilevel</button>\
          <button type="button" class="bbA-exam-btn' + (examMode === 'ielts' ? ' active' : '') + '" data-exam="ielts">🇬🇧 IELTS</button>\
        </div>\
      </div>\
      <div class="bbA-field"><label>Student name (optional)</label><input id="f_name" type="text" value="' + _attr(r.student_name) + '" placeholder="Aziza Karimova" /></div>\
      <div class="bbA-row">\
        <div class="bbA-field"><label>Score *</label><input id="f_score" type="number" inputmode="decimal" value="' + _attr(r.score) + '" /><div class="bbA-cefr-hint" id="bbA_cefr_hint"></div></div>\
        <div class="bbA-field"><label>Exam date (optional)</label><input id="f_date" type="date" value="' + _attr(r.exam_date) + '" /></div>\
      </div>\
      <div class="bbA-field"><label>Primary image (e.g., certificate scan)</label>\
        <div class="bbA-filerow"><input id="f_file" type="file" accept="image/*" /><button type="button" class="bbA-paste-btn" data-paste-target="f_file">📋 Paste</button><button type="button" class="bbA-clear-btn" data-clear-target="f_file">✕ Clear</button></div>\
        <div class="bbA-paste-status" id="f_file_status"></div>' +
        (r.certificate_image_url ? '<img class="bbA-preview" src="' + _attr(r.certificate_image_url) + '" alt="current" />' : '') +
        '<div class="bbA-fileinfo">Leave empty to keep ' + (r.certificate_image_url ? 'the current image.' : 'no image (a styled placeholder will be shown).') + ' Paste from clipboard with 📋.</div>\
        <div class="bbA-fitrow" style="margin-top:6px;display:flex;gap:14px;align-items:center;font-size:12px;flex-wrap:wrap;">\
          <span style="color:#64748b;">Image rendering:</span>\
          <label style="display:flex;align-items:center;gap:4px;cursor:pointer;"><input type="radio" name="f_certfit" value="cover"' + ((r.image_fit || 'cover') === 'cover' ? ' checked' : '') + ' /> <b>Fill</b> <span style="color:#94a3b8;">(full bleed, may crop)</span></label>\
          <label style="display:flex;align-items:center;gap:4px;cursor:pointer;"><input type="radio" name="f_certfit" value="contain"' + (r.image_fit === 'contain' ? ' checked' : '') + ' /> <b>Fit</b> <span style="color:#94a3b8;">(whole image, with bars)</span></label>\
        </div></div>\
      <div class="bbA-field"><label>Secondary image (optional, e.g., student testimonial screenshot)</label>\
        <div class="bbA-filerow"><input id="f_file2" type="file" accept="image/*" /><button type="button" class="bbA-paste-btn" data-paste-target="f_file2">📋 Paste</button><button type="button" class="bbA-clear-btn" data-clear-target="f_file2">✕ Clear</button></div>\
        <div class="bbA-paste-status" id="f_file2_status"></div>' +
        (r.secondary_image_url ? '<img class="bbA-preview" src="' + _attr(r.secondary_image_url) + '" alt="current" />' : '') +
        '<div class="bbA-fileinfo">' + (r.secondary_image_url ? 'Leave empty to keep the current image. ' : '') + 'Both images appear stacked inside the detail popup.</div>\
        <div class="bbA-fitrow" style="margin-top:6px;display:flex;gap:14px;align-items:center;font-size:12px;flex-wrap:wrap;">\
          <span style="color:#64748b;">Image rendering:</span>\
          <label style="display:flex;align-items:center;gap:4px;cursor:pointer;"><input type="radio" name="f_certfit2" value="cover"' + ((r.secondary_image_fit || 'cover') === 'cover' ? ' checked' : '') + ' /> <b>Fill</b> <span style="color:#94a3b8;">(full bleed)</span></label>\
          <label style="display:flex;align-items:center;gap:4px;cursor:pointer;"><input type="radio" name="f_certfit2" value="contain"' + (r.secondary_image_fit === 'contain' ? ' checked' : '') + ' /> <b>Fit</b> <span style="color:#94a3b8;">(letterboxed)</span></label>\
        </div></div>\
      <div class="bbA-field"><label>Student feedback (testimonial, optional)</label><textarea id="f_fb" rows="4" placeholder="The mock interviews were exactly like the real exam. - Lots of practice - Helpful tutors">' + _esc(r.student_feedback) + '</textarea><div class="bbA-fileinfo">Tip: same formatting as announcements — <code>- </code> for bullets, <code>**stars**</code> for <b>bold</b>.</div></div>';
  }
  // Generic congratulations + encouragement messages used when the
  // testimonial field is left empty. Each one is 4+ lines of warm,
  // positive copy that doesn't put words in the student's mouth.
  // Picked at random per save so consecutive cards don't read the same.
  var DEFAULT_FEEDBACKS = [
    "Hard work always pays off, and this result is proof.\n" +
    "Every late evening, every retake, every page of notes brought you here.\n" +
    "Congratulations on a well-earned achievement — you should be proud.\n" +
    "We wish you even bigger wins and brighter milestones ahead. 🎯",

    "Discipline turns goals into certificates, and you've shown plenty of it.\n" +
    "This score reflects real focus and patience — keep that energy going.\n" +
    "We're proud to have been part of your journey so far.\n" +
    "Wishing you greater achievements and the future you've been working for. ✨",

    "Behind every score is a story of focus, patience and effort.\n" +
    "This achievement reflects all of that, and so much more.\n" +
    "Congratulations — you've earned every point of it.\n" +
    "Onwards to the next chapter and even bigger milestones. 🚀",

    "Hardworking students always get what they want, and you've proved it.\n" +
    "Your consistency over the months has finally translated into this result.\n" +
    "Take a moment to celebrate — you've earned it.\n" +
    "We wish you even bigger achievements on the road ahead. 🌟",

    "Some results are earned, not given. This is one of them.\n" +
    "Long hours, real focus, and a clear goal — they all led here.\n" +
    "Congratulations on a fantastic outcome.\n" +
    "May this be the first of many bigger milestones to come. 💪"
  ];

  async function _readCertForm(modal) {
    var name = modal.querySelector('#f_name').value.trim();
    var examMode = modal.querySelector('.bbA-exam-btn.active').getAttribute('data-exam');
    var exam = examMode === 'ielts' ? 'IELTS Academic' : 'CEFR Multilevel';
    var score = modal.querySelector('#f_score').value.trim();
    if (!score) throw new Error('Score is required');
    var feedback = modal.querySelector('#f_fb').value.trim();
    if (!feedback) {
      feedback = DEFAULT_FEEDBACKS[Math.floor(Math.random() * DEFAULT_FEEDBACKS.length)];
    }
    var file  = modal.querySelector('#f_file').files[0];
    var file2 = modal.querySelector('#f_file2').files[0];
    var imageUrl = null, secondaryUrl = null;
    if (file)  imageUrl     = await uploadCertImage(file,  state.centerId);
    if (file2) secondaryUrl = await uploadCertImage(file2, state.centerId);
    var out = {
      student_name:     name,
      name_visibility:  name ? 'full' : 'initials',
      exam_type:        exam,
      score:            score,
      exam_date:        modal.querySelector('#f_date').value || null,
      student_feedback: feedback,
      consent_given:    true,
      status:           'published'
    };
    if (imageUrl)     out.certificate_image_url = imageUrl;
    if (secondaryUrl) out.secondary_image_url   = secondaryUrl;
    var fitRadio  = modal.querySelector('input[name="f_certfit"]:checked');
    var fit2Radio = modal.querySelector('input[name="f_certfit2"]:checked');
    out.image_fit           = fitRadio  ? fitRadio.value  : 'cover';
    out.secondary_image_fit = fit2Radio ? fit2Radio.value : 'cover';
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
    // On a clone site, scope everything to that clone — even a super-admin
    // cannot manage other centres' billboards from a clone URL. Only the
    // main site (mock_stream) exposes the full centre picker.
    if (!_isMainSite()) {
      state.centerId = _siteCenter();
    } else if (!state.centerId) {
      state.centerId = isSuper ? 'mock_stream' : (state.role.center || 'mock_stream');
    }
    render();
  }

  // Current site's centre id, from the Netlify-injected window.__CENTER_ID.
  function _siteCenter() { return String(window.__CENTER_ID || 'mock_stream').trim() || 'mock_stream'; }
  function _isMainSite() { return _siteCenter() === 'mock_stream'; }

  window.AdminPanels = window.AdminPanels || {};
  window.AdminPanels.billboard = { open: open };
})();
