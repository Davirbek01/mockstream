/* =====================================================================
 * code-management.js
 * Shared "🔑 Codes" admin panel for main site (landing.html → Site
 * Management grid) and clone sites (results/index.html → topbar).
 *
 * Public API:
 *   window.openCodesPanel()      // opens the gate → unlocks → main UI
 *   window.codesPanel.call(...)  // raw Edge Function caller
 *
 * Server: supabase/functions/codes-manager
 * ===================================================================== */
(function () {
  if (window.openCodesPanel) return; // idempotent

  var SUPABASE_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var FN_URL       = SUPABASE_URL + '/functions/v1/codes-manager';
  var ANON         = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
  var SS_KEY       = 'cm_admin_passcode_v1';
  var ROLE_KEY     = 'cm_admin_role_v1';
  var SS_CENTER    = 'cm_admin_center_v1';

  var SKILLS = [
    { key: 'listening', label: '🎧 Listening' },
    { key: 'reading',   label: '📖 Reading'   },
    { key: 'writing',   label: '✏️ Writing'   },
    { key: 'speaking',  label: '🎤 Speaking'  }
  ];

  var EXPIRY_OPTIONS = [
    { v: '',  label: 'Never (no expiry)' },
    { v: '1h',label: '1 hour' },
    { v: '1d',label: '1 day' },
    { v: '1w',label: '1 week' },
    { v: '1m',label: '1 month' }
  ];

  function expiryToISO(token) {
    if (!token) return null;
    var ms = { '1h':3600e3, '1d':86400e3, '1w':7*86400e3, '1m':30*86400e3 }[token];
    if (!ms) return null;
    return new Date(Date.now() + ms).toISOString();
  }

  function fmtCountdown(iso) {
    if (!iso) return 'Never';
    var ms = new Date(iso).getTime() - Date.now();
    if (ms <= 0) return 'Expired';
    var s = Math.floor(ms/1000);
    var d = Math.floor(s/86400); s -= d*86400;
    var h = Math.floor(s/3600);  s -= h*3600;
    var m = Math.floor(s/60);
    if (d > 0) return d + 'd ' + h + 'h';
    if (h > 0) return h + 'h ' + m + 'm';
    return m + 'm';
  }

  /* -------------------------------------------------------------- API */
  async function call(action, args) {
    var passcode = sessionStorage.getItem(SS_KEY) || '';
    var body = Object.assign({ adminPasscode: passcode, action: action }, args || {});
    var resp = await fetch(FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON
        // NOTE: no Authorization header — function is deployed with
        // --no-verify-jwt, and sending a non-JWT publishable key as a
        // Bearer token causes the Supabase gateway to 401 before our
        // handler runs (which strips the CORS headers).
      },
      body: JSON.stringify(body)
    });
    var data;
    try { data = await resp.json(); } catch(e) { data = { ok: false, error: 'bad_response' }; }
    if (!resp.ok) data.ok = false;
    return data;
  }

  /* -------------------------------------------------------------- styles */
  function injectStyles() {
    if (document.getElementById('cmStyles')) return;
    var s = document.createElement('style');
    s.id = 'cmStyles';
    s.textContent = [
      '.cm-overlay{position:fixed;inset:0;z-index:10200;background:rgba(15,23,42,.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:block;padding:10px;overflow-y:auto;-webkit-overflow-scrolling:touch;}',
      '.cm-panel{width:100%;max-width:900px;margin:0 auto;background:var(--surface,#fff);color:var(--ink,#0f172a);border-radius:16px;box-shadow:0 30px 80px rgba(0,0,0,.45);overflow:hidden;}',
      '.cm-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid rgba(148,163,184,.25);background:linear-gradient(135deg,#7c3aed,#4338ca);color:#fff;border-radius:16px 16px 0 0;}',
      '.cm-header h3{margin:0;font:700 15px system-ui,-apple-system,Segoe UI,sans-serif;}',
      '.cm-header .cm-role{font-size:11px;opacity:.85;margin-left:8px;padding:2px 7px;background:rgba(255,255,255,.18);border-radius:999px;}',
      '.cm-close{background:rgba(255,255,255,.18);border:0;color:#fff;font-size:18px;cursor:pointer;width:28px;height:28px;border-radius:50%;line-height:1;}',
      '.cm-back-btn{background:rgba(255,255,255,.18);border:0;color:#fff;font-size:18px;cursor:pointer;width:28px;height:28px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;}',
      '.cm-back-btn:hover{background:rgba(255,255,255,.3);}',
      '.cm-tabs{display:flex;gap:2px;padding:6px 10px 0;border-bottom:1px solid rgba(148,163,184,.18);background:var(--surface-alt,#f8fafc);overflow-x:auto;}',
      '.cm-tab{flex:0 0 auto;padding:8px 12px;font:600 13px system-ui;background:transparent;border:0;border-bottom:2px solid transparent;cursor:pointer;color:#64748b;}',
      '.cm-tab.active{color:#7c3aed;border-bottom-color:#7c3aed;}',
      '.cm-body{padding:14px 16px;}',
      '@media(max-width:500px){.cm-overlay{padding:6px;}.cm-panel{border-radius:12px;}.cm-header{padding:10px 12px;}.cm-header h3{font-size:14px;}.cm-body{padding:10px 12px;}}',
      '.cm-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:14px;}',
      '.cm-label{font:600 12.5px system-ui;color:#64748b;}',
      '.cm-input,.cm-select{padding:9px 12px;border:1px solid rgba(148,163,184,.4);border-radius:9px;font-size:13.5px;background:var(--surface,#fff);color:var(--ink,#0f172a);min-width:0;}',
      '.cm-input.num{font-variant-numeric:tabular-nums;letter-spacing:1px;}',
      '.cm-btn{padding:9px 14px;border:0;border-radius:9px;font:600 12.5px system-ui;cursor:pointer;background:#7c3aed;color:#fff;transition:opacity .15s,transform .1s;}',
      '.cm-btn:hover{opacity:.9;}',
      '.cm-btn:active{transform:scale(.97);}',
      '.cm-btn:disabled{opacity:.45;cursor:not-allowed;}',
      '.cm-btn.ghost{background:transparent;color:#7c3aed;border:1px solid #7c3aed;}',
      '.cm-btn.danger{background:#dc2626;}',
      '.cm-btn.muted{background:#94a3b8;}',
      '.cm-card{padding:14px 16px;border:1px solid rgba(148,163,184,.25);border-radius:12px;margin-bottom:12px;background:var(--surface,#fff);}',
      '.cm-card h4{margin:0 0 8px;font:700 13.5px system-ui;}',
      '.cm-code{display:inline-block;padding:6px 12px;border-radius:8px;background:#0f172a;color:#fbbf24;font:700 17px ui-monospace,Consolas,monospace;letter-spacing:2px;user-select:all;cursor:pointer;}',
      '.cm-code.empty{background:rgba(148,163,184,.15);color:#94a3b8;font-weight:500;}',
      '.cm-code-vip{display:block;width:100%;text-align:center;padding:18px 24px;border-radius:14px;background:#0f172a;color:#fbbf24;font:800 36px ui-monospace,Consolas,monospace;letter-spacing:8px;user-select:all;cursor:pointer;box-shadow:0 0 0 1px rgba(251,191,36,.2),0 0 18px rgba(251,191,36,.25),0 0 40px rgba(251,191,36,.12);transition:box-shadow .2s,transform .15s;}',
      '.cm-code-vip:hover{box-shadow:0 0 0 1px rgba(251,191,36,.4),0 0 28px rgba(251,191,36,.45),0 0 60px rgba(251,191,36,.2);transform:scale(1.01);}',
      '.cm-code-vip.empty{background:rgba(148,163,184,.08);color:#94a3b8;font-weight:500;font-size:18px;letter-spacing:2px;box-shadow:none;cursor:default;}',
      '.cm-vip-wrap{position:relative;border-radius:14px;overflow:hidden;}',
      '.cm-copy-check{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:rgba(15,23,42,.88);border-radius:14px;opacity:0;pointer-events:none;transition:opacity .15s;}',
      '.cm-copy-check.show{opacity:1;}',
      '.cm-copy-check-icon{font-size:48px;line-height:1;filter:drop-shadow(0 0 12px rgba(16,185,129,.8));}',
      '.cm-copy-check-label{font:700 14px system-ui,-apple-system,Segoe UI,sans-serif;color:#10b981;letter-spacing:.5px;}',
      '@keyframes cmCheckPop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}',
      '.cm-copy-check.show .cm-copy-check-icon{animation:cmCheckPop .28s ease forwards;}',,
      '.cm-meta{font-size:11.5px;color:#94a3b8;margin-left:8px;}',
      '.cm-grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}',
      '@media(max-width:560px){.cm-grid2{grid-template-columns:1fr;}}',
      '.cm-toggle{display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;}',
      '.cm-toggle input{width:36px;height:20px;-webkit-appearance:none;appearance:none;background:#cbd5e1;border-radius:999px;position:relative;cursor:pointer;transition:background .15s;}',
      '.cm-toggle input:checked{background:#10b981;}',
      '.cm-toggle input:before{content:"";position:absolute;width:16px;height:16px;background:#fff;border-radius:50%;top:2px;left:2px;transition:left .15s;}',
      '.cm-toggle input:checked:before{left:18px;}',
      '.cm-msg{padding:9px 12px;border-radius:8px;font-size:12.5px;margin:8px 0;}',
      '.cm-msg.ok{background:rgba(16,185,129,.12);color:#047857;}',
      '.cm-msg.err{background:rgba(220,38,38,.12);color:#b91c1c;}',
      '.cm-mock-row{display:grid;grid-template-columns:90px 1fr 1fr;gap:10px;align-items:center;padding:8px 0;border-bottom:1px dashed rgba(148,163,184,.2);}',
      '.cm-mock-tier{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:12.5px;}',
      '.cm-mock-tier.empty{opacity:.65;}',
      '.cm-tier-badge{display:inline-block;font-size:14px;line-height:1;}',
      '@media(max-width:560px){.cm-mock-row{grid-template-columns:1fr;}.cm-mock-tier{padding:4px 0;}}',
      '.cm-audit{font:12px ui-monospace,Consolas,monospace;background:#0f172a;color:#cbd5e1;padding:12px;border-radius:10px;max-height:380px;overflow:auto;white-space:pre-wrap;}',
      '.cm-gate{max-width:380px;margin:0 auto;text-align:center;padding:28px 22px;}',
      '.cm-gate input{width:100%;padding:12px 14px;border:1.5px solid rgba(148,163,184,.4);border-radius:10px;font-size:18px;text-align:center;letter-spacing:4px;font-variant-numeric:tabular-nums;outline:none;background:var(--surface,#fff);color:var(--ink,#0f172a);box-sizing:border-box;margin:14px 0 6px;}',
      '.cm-gate input:focus{border-color:#7c3aed;}',
      '.cm-empty{text-align:center;padding:30px 14px;color:#94a3b8;font-size:13px;}',
      /* confirm dialog */
      '.cm-confirm-bd{position:fixed;inset:0;z-index:10220;background:rgba(15,23,42,.62);display:flex;align-items:center;justify-content:center;padding:20px;}',
      '.cm-confirm-box{background:var(--surface,#fff);color:var(--ink,#0f172a);border-radius:18px;padding:28px 24px 22px;max-width:370px;width:100%;box-shadow:0 28px 72px rgba(0,0,0,.38);text-align:center;animation:cmcPop .18s ease;}',
      '@keyframes cmcPop{from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}',
      '.cm-confirm-icon{font-size:42px;margin-bottom:10px;line-height:1;}',
      '.cm-confirm-title{font:700 16px system-ui,-apple-system,Segoe UI,sans-serif;margin:0 0 8px;}',
      '.cm-confirm-msg{font-size:13px;color:#64748b;margin:0 0 22px;line-height:1.6;}',
      '.cm-confirm-code{display:inline-block;padding:2px 8px;background:#0f172a;color:#fbbf24;font:600 14px ui-monospace,Consolas,monospace;border-radius:5px;letter-spacing:1.5px;vertical-align:middle;}',
      '.cm-confirm-actions{display:flex;gap:10px;justify-content:center;}',
      '.cm-confirm-actions .cm-btn{min-width:104px;padding:10px 18px;}',
      /* VIP switcher */
      '.cm-vip-switcher{display:flex;gap:8px;margin-bottom:14px;}',
      '.cm-vip-pill{flex:1;padding:10px 12px;border:1.5px solid rgba(148,163,184,.3);border-radius:10px;background:var(--surface,#fff);color:#64748b;font:600 13.5px system-ui;cursor:pointer;text-align:center;transition:all .15s;}',
      '.cm-vip-pill.active{background:#7c3aed;color:#fff;border-color:#7c3aed;box-shadow:0 2px 10px rgba(124,58,237,.3);}',
      '.cm-vip-pill:hover:not(.active){border-color:#7c3aed;color:#7c3aed;}',
      /* collapsible */
      '.cm-collapse-hdr{display:flex;align-items:center;justify-content:space-between;padding:11px 14px;cursor:pointer;border:1px solid rgba(148,163,184,.25);border-radius:10px;margin-top:18px;background:var(--surface-alt,#f8fafc);font:600 13px system-ui;color:#475569;user-select:none;transition:background .15s;}',
      '.cm-collapse-hdr:hover{background:rgba(124,58,237,.06);border-color:rgba(124,58,237,.3);color:#7c3aed;}',
      '.cm-collapse-chevron{font-size:11px;transition:transform .2s;display:inline-block;margin-left:6px;}',
      '.cm-collapse-body{display:none;padding-top:12px;}',
      '.cm-collapse-body.open{display:block;}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* -------------------------------------------------------------- shell */
  function show() {
    injectStyles();
    var ov = document.getElementById('cmOverlay');
    if (ov) { ov.style.display = 'block'; }
    else {
      ov = document.createElement('div');
      ov.id = 'cmOverlay';
      ov.className = 'cm-overlay';
      ov.innerHTML = '<div class="cm-panel"><div id="cmRoot"></div></div>';
      ov.addEventListener('click', function(e){ if (e.target === ov) hide(); });
      document.body.appendChild(ov);
    }
    var saved = sessionStorage.getItem(SS_KEY);
    if (saved) {
      // verify still valid
      call('list_centers', {}).then(function(r){
        if (r && r.ok) {
          state.centers = r.centers || [];
          state.role = r.role;
          renderMain();
        } else {
          sessionStorage.removeItem(SS_KEY);
          renderGate();
        }
      });
    } else {
      renderGate();
    }
  }
  function hide() {
    var ov = document.getElementById('cmOverlay');
    if (ov) ov.style.display = 'none';
  }

  var state = { centers: [], role: null, currentCenter: null, view: null, fromSMG: false, vipTab: 'premium' };
  var MAIN_SITE_ID = 'mockstream'; // governed by super-admin passcode, no clone passcode needed

  /* -------------------------------------------------------------- gate */
  function renderGate() {
    var root = document.getElementById('cmRoot');
    var backHtml = state.fromSMG ? '<button class="cm-back-btn" id="cmBackBtn" aria-label="Back">&#8592;</button>' : '';
    root.innerHTML =
      '<div class="cm-header"><h3>🔑 Code Management</h3>' +
        '<div style="display:flex;gap:6px;align-items:center;">'+backHtml+'<button class="cm-close" id="cmCloseGate">×</button></div></div>' +
      '<div class="cm-body">' +
        '<div class="cm-gate">' +
          '<div style="font-size:42px;margin-bottom:6px;">🔐</div>' +
          '<h4 style="margin:0 0 4px;font:700 16px system-ui;">Admin passcode required</h4>' +
          '<div style="font-size:12.5px;color:#64748b;">Super-admin or per-center passcode (4–8 digits).</div>' +
          '<input id="cmPass" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="one-time-code" placeholder="••••••••">' +
          '<div id="cmGateMsg" class="cm-msg" style="display:none;"></div>' +
          '<button class="cm-btn" id="cmUnlock" style="width:100%;padding:12px;font-size:14px;margin-top:6px;">Unlock</button>' +
        '</div>' +
      '</div>';
    document.getElementById('cmCloseGate').onclick = hide;
    if (state.fromSMG) {
      var bk = document.getElementById('cmBackBtn');
      if (bk) bk.onclick = function() { hide(); if (typeof window._showSiteMgmtGrid === 'function') window._showSiteMgmtGrid(); };
    }
    var input = document.getElementById('cmPass');
    var btn = document.getElementById('cmUnlock');
    input.addEventListener('input', function(){ this.value = this.value.replace(/\D/g,'').slice(0,8); });
    input.addEventListener('keydown', function(e){ if (e.key === 'Enter') doUnlock(); });
    btn.onclick = doUnlock;
    setTimeout(function(){ input.focus(); }, 50);
    async function doUnlock() {
      var msg = document.getElementById('cmGateMsg');
      msg.style.display = 'none';
      var v = (input.value||'').trim();
      if (!/^\d{4,8}$/.test(v)) {
        msg.className = 'cm-msg err'; msg.style.display = 'block'; msg.textContent = '❌ Enter 4–8 digits';
        return;
      }
      btn.disabled = true; btn.textContent = '⏳ Verifying…';
      sessionStorage.setItem(SS_KEY, v);
      var r = await call('list_centers', {});
      btn.disabled = false; btn.textContent = 'Unlock';
      if (!r.ok) {
        sessionStorage.removeItem(SS_KEY);
        msg.className = 'cm-msg err'; msg.style.display = 'block';
        msg.textContent = '❌ ' + (r.error || 'Unauthorized');
        return;
      }
      state.centers = r.centers || [];
      state.role = r.role;
      sessionStorage.setItem(ROLE_KEY, r.role);
      renderMain();
    }
  }

  /* -------------------------------------------------------------- main */
  function renderMain() {
    var root = document.getElementById('cmRoot');
    if (!state.currentCenter && state.centers.length) {
      // Default to URL-detected center on clone, else first
      var detected = detectCenter();
      var match = state.centers.find(function(c){ return c.id === detected; });
      state.currentCenter = (match || state.centers[0]).id;
    }
    var isSuper = state.role === 'super_admin';
    var centerOpts = state.centers.map(function(c){
      return '<option value="'+c.id+'"'+(c.id===state.currentCenter?' selected':'')+'>'+escapeHtml(c.display_name||c.id)+'</option>';
    }).join('');

    var tabs = [
      { k:'codes',  label:'Codes' },
      { k:'flags',  label:'Flags' },
      { k:'audit',  label:'Audit' }
    ];
    if (isSuper) tabs.push({ k:'admin', label:'Admin' });
    if (!state.view) state.view = 'codes';

    var backHtml = state.fromSMG ? '<button class="cm-back-btn" id="cmBackBtn" aria-label="Back">&#8592;</button>' : '';
    root.innerHTML =
      '<div class="cm-header">' +
        '<div><h3>🔑 Code Management</h3>' +
        '<span class="cm-role">'+(isSuper?'super-admin':'clone admin')+'</span></div>' +
        '<div style="display:flex;gap:6px;align-items:center;">'+backHtml+'<button class="cm-close" id="cmCloseMain">×</button></div>' +
      '</div>' +
      '<div style="padding:12px 20px 0;display:flex;gap:10px;align-items:center;flex-wrap:wrap;">' +
        '<span class="cm-label">Center:</span>' +
        '<select class="cm-select" id="cmCenter"'+(isSuper?'':' disabled')+'>'+centerOpts+'</select>' +
        '<button class="cm-btn ghost" id="cmLogout" style="margin-left:auto;">Lock</button>' +
      '</div>' +
      '<div class="cm-tabs">' +
        tabs.map(function(t){ return '<button class="cm-tab'+(t.k===state.view?' active':'')+'" data-tab="'+t.k+'">'+t.label+'</button>'; }).join('') +
      '</div>' +
      '<div class="cm-body" id="cmBody"><div class="cm-empty">Loading…</div></div>';

    document.getElementById('cmCloseMain').onclick = hide;
    if (state.fromSMG) {
      var bk = document.getElementById('cmBackBtn');
      if (bk) bk.onclick = function() { hide(); if (typeof window._showSiteMgmtGrid === 'function') window._showSiteMgmtGrid(); };
    }
    document.getElementById('cmCenter').onchange = function(){ state.currentCenter = this.value; renderTab(); };
    document.getElementById('cmLogout').onclick = function(){ sessionStorage.removeItem(SS_KEY); sessionStorage.removeItem(ROLE_KEY); state.role=null; state.centers=[]; renderGate(); };
    root.querySelectorAll('.cm-tab').forEach(function(b){
      b.onclick = function(){ state.view = b.dataset.tab; renderMain(); };
    });
    renderTab();
  }

  function detectCenter() {
    try {
      var c = (window.SITE_CONFIG && window.SITE_CONFIG.testIdentifier) || '';
      return c.toLowerCase().replace(/[_\s]/g,'');
    } catch(e) { return ''; }
  }

  /* -------------------------------------------------------------- tabs */
  async function renderTab() {
    var body = document.getElementById('cmBody');
    if (!body) return;
    body.innerHTML = '<div class="cm-empty">Loading…</div>';
    if (state.view === 'codes')  return renderCodesTab(body);
    if (state.view === 'flags')  return renderFlagsTab(body);
    if (state.view === 'audit')  return renderAuditTab(body);
    if (state.view === 'admin')  return renderAdminTab(body);
  }

  /* ---- Codes tab ----------------------------------------------------- */
  async function renderCodesTab(body) {
    var center = state.currentCenter;
    var r = await call('list_codes', { center: center });
    if (!r.ok) { body.innerHTML = errMsg(r.error); return; }
    var canEdit = state.role === 'super_admin' || (r.center && r.center.clone_can_edit);
    var disabledHint = canEdit ? '' :
      '<div class="cm-msg err">Renewing/revoking is disabled for clone admins (super-admin must enable <b>clone_can_edit</b>).</div>';

    var vipMap = {};
    (r.vip||[]).forEach(function(v){ vipMap[v.type] = v; });
    var mockMap = {};
    (r.mock||[]).forEach(function(m){ mockMap[m.skill+'#'+m.mock_number+'#'+(m.tier||'premium')] = m; });

    function buildVipCard(type) {
      var v = vipMap[type];
      var code = v ? v.code : '';
      var meta = v ? ('Expires: ' + fmtCountdown(v.expires_at) + (v.last_renewed_at ? ' · Renewed: ' + new Date(v.last_renewed_at).toLocaleString() : '')) : 'No code yet';
      return '<div class="cm-card" style="margin-bottom:0;text-align:center;">' +
        '<div class="cm-vip-wrap">' +
          (code
            ? '<div class="cm-code-vip" title="Click to copy" data-copy="'+code+'">'+code+'</div>'
            : '<div class="cm-code-vip empty">— no code yet —</div>') +
          '<div class="cm-copy-check" id="cmCopyCheck"><div class="cm-copy-check-icon">✅</div><div class="cm-copy-check-label">Copied!</div></div>' +
        '</div>' +
        '<div style="font-size:11.5px;color:#94a3b8;margin:8px 0 14px;">'+escapeHtml(meta)+'</div>' +
        '<div class="cm-row" style="margin-bottom:0;justify-content:center;">' +
          '<span class="cm-label">Expiry:</span>' +
          '<select class="cm-select cm-vip-exp" data-type="'+type+'">'+EXPIRY_OPTIONS.map(function(o){return '<option value="'+o.v+'">'+o.label+'</option>';}).join('')+'</select>' +
          '<button class="cm-btn cm-renew-vip" data-type="'+type+'"'+(canEdit?'':' disabled')+'>↻ Renew</button>' +
          (code ? '<button class="cm-btn danger cm-revoke-vip" data-type="'+type+'"'+(canEdit?'':' disabled')+'>Revoke</button>' : '') +
        '</div>' +
      '</div>';
    }

    var fm = mockMap['full_mock#1#premium'] || mockMap['full_mock#1#regular'];
    var fmCode = fm ? fm.code : '';
    var fmMeta = fm ? ('Expires: ' + fmtCountdown(fm.expires_at) + (fm.last_renewed_at ? ' · Renewed: ' + new Date(fm.last_renewed_at).toLocaleString() : '')) : 'No code yet';
    var fullMockHtml = '<div class="cm-card">' +
      '<h4>🏆 Full Mock Code</h4>' +
      '<div class="cm-row">' +
        (fmCode ? '<span class="cm-code" title="Click to copy" data-copy="'+fmCode+'">'+fmCode+'</span>' : '<span class="cm-code empty">— no code —</span>') +
        '<span class="cm-meta">'+escapeHtml(fmMeta)+'</span>' +
      '</div>' +
      '<div class="cm-row">' +
        '<span class="cm-label">Expiry:</span>' +
        '<select class="cm-select cm-fm-exp">'+EXPIRY_OPTIONS.map(function(o){return '<option value="'+o.v+'">'+o.label+'</option>';}).join('')+'</select>' +
        '<button class="cm-btn cm-renew-fm"'+(canEdit?'':' disabled')+'>↻ Renew</button>' +
        (fmCode ? '<button class="cm-btn danger cm-revoke-fm"'+(canEdit?'':' disabled')+'>Revoke</button>' : '') +
      '</div>' +
    '</div>';

    var mockHtml = SKILLS.map(function(sk){
      var entries = (r.mock||[]).filter(function(m){ return m.skill === sk.key; });
      // Group by mock_number, each row shows regular + premium tier columns
      var byNum = {};
      entries.forEach(function(m){ (byNum[m.mock_number] = byNum[m.mock_number] || {})[m.tier||'premium'] = m; });
      var nums = Object.keys(byNum).map(function(n){return parseInt(n,10);}).sort(function(a,b){return a-b;});
      function tierCell(m, sk_key, num, tier) {
        if (m) {
          return '<span class="cm-mock-tier" title="'+tier+'">'+
            '<span class="cm-tier-badge cm-tier-'+tier+'">'+(tier==='premium'?'🔥':'🟢')+'</span> '+
            '<span class="cm-code" title="Click to copy" data-copy="'+m.code+'">'+m.code+'</span> '+
            '<button class="cm-btn cm-renew-mock" data-skill="'+sk_key+'" data-num="'+num+'" data-tier="'+tier+'"'+(canEdit?'':' disabled')+'>↻</button> '+
            '<button class="cm-btn danger cm-revoke-mock" data-skill="'+sk_key+'" data-num="'+num+'" data-tier="'+tier+'"'+(canEdit?'':' disabled')+'>×</button>'+
          '</span>';
        }
        return '<span class="cm-mock-tier empty">'+
          '<span class="cm-tier-badge cm-tier-'+tier+'">'+(tier==='premium'?'🔥':'🟢')+'</span> '+
          '<span class="cm-code empty">—</span> '+
          '<button class="cm-btn cm-gen-mock-tier" data-skill="'+sk_key+'" data-num="'+num+'" data-tier="'+tier+'"'+(canEdit?'':' disabled')+'>+ Generate</button>'+
        '</span>';
      }
      var rows = nums.map(function(num){
        var m = byNum[num];
        return '<div class="cm-mock-row">'+
          '<span><b>Mock #'+num+'</b></span>'+
          tierCell(m.regular, sk.key, num, 'regular')+
          tierCell(m.premium, sk.key, num, 'premium')+
        '</div>';
      }).join('') || '<div class="cm-empty" style="padding:10px;">No mock codes yet for this skill.</div>';
      return '<div class="cm-card">' +
        '<h4>'+sk.label+' Mock Codes</h4>' +
        '<div class="cm-row">' +
          '<span class="cm-label">Mock #:</span>' +
          '<input class="cm-input num cm-mock-num" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="3" placeholder="1" style="width:70px;">' +
          '<select class="cm-select cm-mock-exp">'+EXPIRY_OPTIONS.map(function(o){return '<option value="'+o.v+'">'+o.label+'</option>';}).join('')+'</select>' +
          '<button class="cm-btn cm-gen-mock" data-skill="'+sk.key+'" data-tier="regular"'+(canEdit?'':' disabled')+'>+ 🟢 Regular</button>' +
          '<button class="cm-btn cm-gen-mock" data-skill="'+sk.key+'" data-tier="premium"'+(canEdit?'':' disabled')+'>+ 🔥 Premium</button>' +
        '</div>' +
        rows +
      '</div>';
    }).join('');

    body.innerHTML =
      disabledHint +
      '<div id="cmFlash"></div>' +
      '<div class="cm-vip-switcher">' +
        '<button class="cm-vip-pill'+(state.vipTab==='premium'?' active':'')+' " data-vip="premium">👑 Premium VIP</button>' +
        '<button class="cm-vip-pill'+(state.vipTab==='regular'?' active':'')+' " data-vip="regular">🎟️ Regular VIP</button>' +
      '</div>' +
      '<div id="cmVipCard">' + buildVipCard(state.vipTab) + '</div>' +
      '<div class="cm-collapse-hdr" id="cmCollapseHdr">' +
        '<span>🏆 Full Mock &amp; Per-Mock Codes</span>' +
        '<span class="cm-collapse-chevron" id="cmChevron">▾</span>' +
      '</div>' +
      '<div class="cm-collapse-body" id="cmCollapseBody">' +
        fullMockHtml +
        '<p style="margin:14px 0 8px;font:600 13px system-ui;color:#64748b;">Per-Mock Codes (single-test access)</p>' +
        mockHtml +
      '</div>';

    function wireVipCard() {
      var vc = document.getElementById('cmVipCard');
      vc.querySelectorAll('[data-copy]').forEach(function(el){
        el.onclick = function(){
          navigator.clipboard.writeText(el.dataset.copy).then(function(){
            var overlay = vc.querySelector('#cmCopyCheck');
            if (!overlay) return;
            overlay.classList.add('show');
            setTimeout(function(){ overlay.classList.remove('show'); }, 1400);
          });
        };
      });
      vc.querySelectorAll('.cm-renew-vip').forEach(function(b){
        b.onclick = async function(){
          var type = b.dataset.type;
          var exp = vc.querySelector('.cm-vip-exp[data-type="'+type+'"]').value;
          var existing = vipMap[type];
          var renewMsg = existing
            ? 'A new code will be generated. The current code <span class="cm-confirm-code">'+existing.code+'</span> will stop working immediately — anyone using it will lose access.'
            : 'A fresh access code will be created for this center. Share it only with authorised users.';
          if (!await cmConfirm({ icon: existing ? '🔄' : '🔑', title: 'Generate new '+(type==='premium'?'Premium':'Regular')+' VIP code?', message: renewMsg, confirmLabel: existing ? 'Yes, replace' : 'Generate' })) return;
          b.disabled = true; b.textContent = '⏳';
          var r2 = await call('renew_vip', { center: state.currentCenter, type: type, expiry: expiryToISO(exp) });
          if (r2.ok) { flash('ok', 'New '+type+' code: '+r2.code); renderTab(); }
          else { flash('err', r2.error||'Failed'); b.disabled=false; b.textContent='↻ Renew'; }
        };
      });
      vc.querySelectorAll('.cm-revoke-vip').forEach(function(b){
        b.onclick = async function(){
          var rCode = (vipMap[b.dataset.type] || {}).code || '—';
          if (!await cmConfirm({ icon: '🗑️', title: 'Revoke '+(b.dataset.type==='premium'?'Premium':'Regular')+' VIP code?', message: 'Code <span class="cm-confirm-code">'+rCode+'</span> will be deactivated immediately. Anyone using it will lose access.', confirmLabel: 'Revoke', confirmClass: 'danger' })) return;
          var r2 = await call('revoke_vip', { center: state.currentCenter, type: b.dataset.type });
          if (r2.ok) { flash('ok','Revoked'); renderTab(); } else flash('err', r2.error||'Failed');
        };
      });
    }
    wireVipCard();

    body.querySelectorAll('.cm-vip-pill').forEach(function(pill){
      pill.onclick = function(){
        state.vipTab = pill.dataset.vip;
        body.querySelectorAll('.cm-vip-pill').forEach(function(p){ p.classList.toggle('active', p.dataset.vip === state.vipTab); });
        document.getElementById('cmVipCard').innerHTML = buildVipCard(state.vipTab);
        wireVipCard();
      };
    });

    document.getElementById('cmCollapseHdr').onclick = function(){
      var bd = document.getElementById('cmCollapseBody');
      var open = bd.classList.toggle('open');
      document.getElementById('cmChevron').textContent = open ? '▴' : '▾';
    };

    var cb = document.getElementById('cmCollapseBody');
    cb.querySelectorAll('[data-copy]').forEach(function(el){
      el.onclick = function(){ navigator.clipboard.writeText(el.dataset.copy).then(function(){ flash('ok','Copied: '+el.dataset.copy); }); };
    });
    cb.querySelectorAll('.cm-mock-num').forEach(function(inp){
      inp.addEventListener('input', function(){ inp.value = inp.value.replace(/\D/g,'').slice(0,3); });
    });
    cb.querySelectorAll('.cm-gen-mock').forEach(function(b){
      b.onclick = async function(){
        var skill = b.dataset.skill;
        var tier = b.dataset.tier || 'premium';
        var card = b.closest('.cm-card');
        var num = parseInt(card.querySelector('.cm-mock-num').value, 10);
        var exp = card.querySelector('.cm-mock-exp').value;
        if (!num || num < 1) { flash('err','Enter mock number'); return; }
        var genExisting = mockMap[skill+'#'+num+'#'+tier];
        if (genExisting) {
          if (!await cmConfirm({ icon: '🔄', title: 'Replace existing '+tier+' code?', message: 'A '+tier+' code already exists for Mock #'+num+': <span class="cm-confirm-code">'+genExisting.code+'</span>. It will stop working immediately.', confirmLabel: 'Replace' })) return;
        }
        b.disabled = true; b.textContent = '⏳';
        var r2 = await call('renew_mock', { center: state.currentCenter, skill: skill, mock_number: num, tier: tier, expiry: expiryToISO(exp) });
        if (r2.ok) { flash('ok', skill+' #'+num+' '+tier+' code: '+r2.code); renderTab(); }
        else { flash('err', r2.error||'Failed'); b.disabled=false; b.textContent='+ Generate'; }
      };
    });
    cb.querySelectorAll('.cm-gen-mock-tier').forEach(function(b){
      b.onclick = async function(){
        var skill = b.dataset.skill, num = parseInt(b.dataset.num,10), tier = b.dataset.tier;
        b.disabled = true; b.textContent = '⏳';
        var r2 = await call('renew_mock', { center: state.currentCenter, skill: skill, mock_number: num, tier: tier });
        if (r2.ok) { flash('ok', skill+' #'+num+' '+tier+' code: '+r2.code); renderTab(); }
        else { flash('err', r2.error||'Failed'); b.disabled=false; b.textContent='+ Generate'; }
      };
    });
    cb.querySelectorAll('.cm-renew-mock').forEach(function(b){
      b.onclick = async function(){
        var skill = b.dataset.skill, num = parseInt(b.dataset.num,10), tier = b.dataset.tier || 'premium';
        var mExisting = mockMap[skill+'#'+num+'#'+tier] || {};
        if (!await cmConfirm({ icon: '🔄', title: 'Renew '+tier+' code for Mock #'+num+'?', message: 'Current '+tier+' code <span class="cm-confirm-code">'+(mExisting.code||'—')+'</span> will stop working immediately. A new code will be issued.', confirmLabel: 'Renew' })) return;
        var r2 = await call('renew_mock', { center: state.currentCenter, skill: skill, mock_number: num, tier: tier });
        if (r2.ok) { flash('ok','New '+tier+' code: '+r2.code); renderTab(); } else flash('err', r2.error||'Failed');
      };
    });
    cb.querySelectorAll('.cm-revoke-mock').forEach(function(b){
      b.onclick = async function(){
        var tier = b.dataset.tier || 'premium';
        var mRevoke = mockMap[b.dataset.skill+'#'+b.dataset.num+'#'+tier] || {};
        if (!await cmConfirm({ icon: '🗑️', title: 'Revoke '+tier+' mock code?', message: 'Code <span class="cm-confirm-code">'+(mRevoke.code||'—')+'</span> will be deactivated immediately.', confirmLabel: 'Revoke', confirmClass: 'danger' })) return;
        var r2 = await call('revoke_mock', { center: state.currentCenter, skill: b.dataset.skill, mock_number: parseInt(b.dataset.num,10), tier: tier });
        if (r2.ok) { flash('ok','Revoked'); renderTab(); } else flash('err', r2.error||'Failed');
      };
    });
    var fmRenewBtn = cb.querySelector('.cm-renew-fm');
    if (fmRenewBtn) {
      fmRenewBtn.onclick = async function() {
        var exp = cb.querySelector('.cm-fm-exp').value;
        var fmRenewMsg = fmCode
          ? 'Current code <span class="cm-confirm-code">'+fmCode+'</span> will stop working immediately — anyone using it will lose access.'
          : 'A new Full Mock access code will be created for this center.';
        if (!await cmConfirm({ icon: fmCode ? '🔄' : '🔑', title: 'Generate new Full Mock code?', message: fmRenewMsg, confirmLabel: fmCode ? 'Yes, replace' : 'Generate' })) return;
        fmRenewBtn.disabled = true; fmRenewBtn.textContent = '⏳';
        var r2 = await call('renew_mock', { center: state.currentCenter, skill: 'full_mock', mock_number: 1, expiry: expiryToISO(exp) });
        if (r2.ok) { flash('ok', 'New Full Mock code: '+r2.code); renderTab(); }
        else { flash('err', r2.error||'Failed'); fmRenewBtn.disabled=false; fmRenewBtn.textContent='↻ Renew'; }
      };
    }
    var fmRevokeBtn = cb.querySelector('.cm-revoke-fm');
    if (fmRevokeBtn) {
      fmRevokeBtn.onclick = async function() {
        if (!await cmConfirm({ icon: '🗑️', title: 'Revoke Full Mock code?', message: 'Code <span class="cm-confirm-code">'+fmCode+'</span> will be deactivated immediately. Anyone using it will lose access.', confirmLabel: 'Revoke', confirmClass: 'danger' })) return;
        var r2 = await call('revoke_mock', { center: state.currentCenter, skill: 'full_mock', mock_number: 1 });
        if (r2.ok) { flash('ok','Revoked'); renderTab(); } else flash('err', r2.error||'Failed');
      };
    }
  }

  /* ---- Flags tab ----------------------------------------------------- */
  async function renderFlagsTab(body) {
    var r = await call('list_codes', { center: state.currentCenter });
    if (!r.ok || !r.center) { body.innerHTML = errMsg(r.error||'no center'); return; }
    var c = r.center;
    var isSuper = state.role === 'super_admin';
    body.innerHTML =
      '<div id="cmFlash"></div>' +
      '<div class="cm-card">' +
        '<h4>Center: '+escapeHtml(c.display_name||c.id)+'</h4>' +
        '<div class="cm-row"><label class="cm-toggle">' +
          '<input type="checkbox" id="cmFlagClone"'+(c.clone_can_edit?' checked':'')+(isSuper?'':' disabled')+'>' +
          '<span>Clone admin can renew/revoke codes</span></label></div>' +
        '<div class="cm-row"><label class="cm-toggle">' +
          '<input type="checkbox" id="cmFlagPremium"'+(c.premium_mode?' checked':'')+(isSuper?'':' disabled')+'>' +
          '<span>Premium mode (whole-center bypass — anyone enters)</span></label></div>' +
        (isSuper?'':'<div class="cm-msg err" style="margin-top:10px;">Only super-admin can change these flags.</div>') +
      '</div>';
    if (isSuper) {
      document.getElementById('cmFlagClone').onchange = async function(){
        var r = await call('set_center_flag', { center: state.currentCenter, flag: 'clone_can_edit', value: this.checked });
        flash(r.ok?'ok':'err', r.ok?'Saved':(r.error||'Failed'));
      };
      document.getElementById('cmFlagPremium').onchange = async function(){
        var r = await call('set_center_flag', { center: state.currentCenter, flag: 'premium_mode', value: this.checked });
        flash(r.ok?'ok':'err', r.ok?'Saved':(r.error||'Failed'));
      };
    }
  }

  /* ---- Audit tab ----------------------------------------------------- */
  async function renderAuditTab(body) {
    var args = { limit: 200 };
    if (state.role !== 'super_admin') args.center = state.currentCenter;
    var r = await call('audit', args);
    if (!r.ok) { body.innerHTML = errMsg(r.error); return; }
    var lines = (r.audit||[]).map(function(a){
      return '['+new Date(a.ts).toLocaleString()+'] '+a.actor+' → '+a.action+(a.center?(' ('+a.center+')'):'')+
        (a.details ? '  ' + JSON.stringify(a.details) : '');
    }).join('\n') || '(no entries)';
    body.innerHTML = '<div class="cm-audit">'+escapeHtml(lines)+'</div>';
  }

  /* ---- Admin tab (super only) --------------------------------------- */
  async function renderAdminTab(body) {
    body.innerHTML =
      '<div id="cmFlash"></div>' +
      '<div class="cm-card">' +
        '<h4>🆕 Add new center</h4>' +
        '<div class="cm-row">' +
          '<input class="cm-input" id="cmNewCenterId" placeholder="id (e.g. newschool)" maxlength="30">' +
          '<input class="cm-input" id="cmNewCenterName" placeholder="Display name" maxlength="60">' +
          '<button class="cm-btn" id="cmAddCenter">+ Add</button>' +
        '</div>' +
      '</div>' +
      '<div class="cm-card">' +
        '<h4>🔑 Per-center admin passcode</h4>' +
        '<div class="cm-meta" style="margin-bottom:10px;">Pick a center to see its current passcode. Tap Generate to instantly replace it. <i>(The main site uses the super-admin passcode below — it is not in this list.)</i></div>' +
        '<div class="cm-row" style="margin-bottom:10px;">' +
          '<select class="cm-select" id="cmPcCenter" style="flex:1;">' +
            state.centers.filter(function(c){ return c.id !== MAIN_SITE_ID; }).map(function(c){ return '<option value="'+c.id+'">'+escapeHtml(c.display_name||c.id)+'</option>'; }).join('') +
          '</select>' +
        '</div>' +
        '<div class="cm-vip-wrap">' +
          '<div class="cm-code-vip empty" id="cmPcDisplay">— click Generate —</div>' +
          '<div class="cm-copy-check" id="cmPcCopyCheck"><div class="cm-copy-check-icon">✅</div><div class="cm-copy-check-label">Copied!</div></div>' +
        '</div>' +
        '<div class="cm-row" style="margin-top:14px;justify-content:center;">' +
          '<button class="cm-btn" id="cmGenPc">🎲 Generate &amp; replace</button>' +
        '</div>' +
      '</div>' +
      '<div class="cm-card">' +
        '<h4>🛡️ SUPER-admin passcode</h4>' +
        '<div class="cm-meta" style="margin-bottom:10px;">Tap Generate to instantly replace the super-admin passcode. <b>You will be logged out</b> — copy the new code first!</div>' +
        '<div class="cm-vip-wrap">' +
          '<div class="cm-code-vip empty" id="cmSuperDisplay">— click Generate —</div>' +
          '<div class="cm-copy-check" id="cmSuperCopyCheck"><div class="cm-copy-check-icon">✅</div><div class="cm-copy-check-label">Copied!</div></div>' +
        '</div>' +
        '<div class="cm-row" style="margin-top:14px;justify-content:center;">' +
          '<button class="cm-btn danger" id="cmGenSuper">🎲 Generate &amp; replace</button>' +
        '</div>' +
      '</div>';

    document.getElementById('cmAddCenter').onclick = async function(){
      var id = document.getElementById('cmNewCenterId').value.trim().toLowerCase().replace(/[^a-z0-9]/g,'');
      var name = document.getElementById('cmNewCenterName').value.trim() || id;
      if (!id) { flash('err','Need an id'); return; }
      var r = await call('add_center', { id: id, displayName: name });
      if (r.ok) { flash('ok','Added'); var c = await call('list_centers',{}); state.centers = c.centers||[]; renderMain(); }
      else flash('err', r.error||'Failed');
    };

    function showCopyCheck(overlayId) {
      var o = document.getElementById(overlayId);
      if (!o) return;
      o.classList.add('show');
      setTimeout(function(){ o.classList.remove('show'); }, 1400);
    }

    function wireCodeClick(displayId, overlayId) {
      var d = document.getElementById(displayId);
      d.onclick = function(){
        if (d.classList.contains('empty')) return;
        var code = d.textContent.trim();
        if (!code) return;
        navigator.clipboard.writeText(code).then(function(){ showCopyCheck(overlayId); });
      };
    }
    wireCodeClick('cmPcDisplay', 'cmPcCopyCheck');
    wireCodeClick('cmSuperDisplay', 'cmSuperCopyCheck');

    // Load and show current passcode for selected center / super-admin
    async function loadCurrentPasscode(center, displayId) {
      var d = document.getElementById(displayId);
      if (!d) return;
      d.classList.add('empty');
      d.textContent = '⏳ loading…';
      var r = await call('get_admin_passcode', { center: center });
      if (!r.ok) { d.textContent = '— (cannot read) —'; return; }
      if (r.passcode) {
        d.classList.remove('empty');
        d.textContent = r.passcode;
      } else {
        d.classList.add('empty');
        d.textContent = '— not set yet —';
      }
    }
    var pcSel = document.getElementById('cmPcCenter');
    pcSel.onchange = function(){ loadCurrentPasscode(pcSel.value, 'cmPcDisplay'); };
    if (pcSel.value) loadCurrentPasscode(pcSel.value, 'cmPcDisplay');
    loadCurrentPasscode('__super__', 'cmSuperDisplay');

    document.getElementById('cmGenPc').onclick = async function(){
      var c = document.getElementById('cmPcCenter').value;
      var cName = (state.centers.find(function(x){return x.id===c;})||{}).display_name || c;
      if (!await cmConfirm({
        icon: '🔑',
        title: 'Replace passcode for ' + cName + '?',
        message: 'The old passcode will stop working immediately. The new one will be shown here — copy it before closing.',
        confirmLabel: 'Generate & replace',
        confirmClass: ''
      })) return;
      var p = genPasscode(6);
      var btn = document.getElementById('cmGenPc');
      btn.disabled = true; btn.textContent = '⏳ Saving…';
      var r = await call('set_admin_passcode', { center: c, newPasscode: p });
      btn.disabled = false; btn.innerHTML = '🎲 Generate &amp; replace';
      if (!r.ok) { flash('err', r.error||'Failed'); return; }
      var d = document.getElementById('cmPcDisplay');
      d.classList.remove('empty');
      d.textContent = p;
      try { navigator.clipboard.writeText(p).then(function(){ showCopyCheck('cmPcCopyCheck'); }); } catch(e){}
      flash('ok', 'Saved. New passcode for ' + cName + ': ' + p);
    };

    document.getElementById('cmGenSuper').onclick = async function(){
      if (!await cmConfirm({
        icon: '🛡️',
        title: 'Replace SUPER-admin passcode?',
        message: 'A new code will be generated and saved. You\'ll see it in a window that <b>requires you to confirm you copied it</b> before logout — no time pressure.',
        confirmLabel: 'Generate & replace',
        confirmClass: 'danger'
      })) return;
      var p = genPasscode(6);
      var btn = document.getElementById('cmGenSuper');
      btn.disabled = true; btn.textContent = '⏳ Saving…';
      var r = await call('set_admin_passcode', { center: '__super__', newPasscode: p });
      btn.disabled = false; btn.innerHTML = '🎲 Generate &amp; replace';
      if (!r.ok) { flash('err', r.error||'Failed'); return; }
      var d = document.getElementById('cmSuperDisplay');
      d.classList.remove('empty');
      d.textContent = p;
      try { navigator.clipboard.writeText(p); } catch(e){}
      await showSuperReveal(p);
      sessionStorage.removeItem(SS_KEY); sessionStorage.removeItem(ROLE_KEY);
      state.role=null; state.centers=[]; renderGate();
    };
  }

  /* Modal that reveals the new super-admin passcode and blocks logout
     until user explicitly confirms they copied it. */
  function showSuperReveal(code) {
    return new Promise(function(resolve) {
      var bd = document.createElement('div');
      bd.className = 'cm-confirm-bd';
      bd.innerHTML =
        '<div class="cm-confirm-box" style="max-width:460px;">' +
          '<div class="cm-confirm-icon">🛡️</div>' +
          '<div class="cm-confirm-title">Your new SUPER-admin passcode</div>' +
          '<div class="cm-confirm-msg">Save this somewhere safe <b>before</b> clicking continue. There is no way to recover it later.</div>' +
          '<div class="cm-vip-wrap" style="margin:14px 0 6px;">' +
            '<div class="cm-code-vip" id="cmRevealCode" style="cursor:pointer;">' + escapeHtml(code) + '</div>' +
            '<div class="cm-copy-check" id="cmRevealCheck"><div class="cm-copy-check-icon">✅</div><div class="cm-copy-check-label">Copied!</div></div>' +
          '</div>' +
          '<div class="cm-row" style="justify-content:center;gap:10px;margin:6px 0 14px;">' +
            '<button class="cm-btn ghost" id="cmRevealCopy">📋 Copy again</button>' +
          '</div>' +
          '<label style="display:flex;align-items:center;gap:8px;justify-content:center;font-size:13px;color:#444;margin-bottom:12px;cursor:pointer;">' +
            '<input type="checkbox" id="cmRevealAck" style="width:18px;height:18px;cursor:pointer;"> I have saved this passcode somewhere safe' +
          '</label>' +
          '<div class="cm-confirm-actions" style="justify-content:center;">' +
            '<button class="cm-btn danger" id="cmRevealOk" disabled>Log me out</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(bd);
      function showCheck() {
        var o = bd.querySelector('#cmRevealCheck');
        o.classList.add('show');
        setTimeout(function(){ o.classList.remove('show'); }, 1400);
      }
      function copy() {
        try { navigator.clipboard.writeText(code).then(showCheck, showCheck); } catch(e){ showCheck(); }
      }
      bd.querySelector('#cmRevealCode').onclick = copy;
      bd.querySelector('#cmRevealCopy').onclick = copy;
      var ack = bd.querySelector('#cmRevealAck');
      var ok = bd.querySelector('#cmRevealOk');
      ack.onchange = function(){ ok.disabled = !ack.checked; };
      ok.onclick = function(){ bd.remove(); resolve(); };
      // initial copy already happened in caller — show the check overlay
      setTimeout(showCheck, 60);
    });
  }

  /* -------------------------------------------------------------- utils */
  function escapeHtml(s) {
    return String(s==null?'':s).replace(/[&<>"']/g, function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }
  function errMsg(e) { return '<div class="cm-msg err">⚠️ ' + escapeHtml(e||'Failed') + '</div>'; }

  function cmConfirm(opts) {
    return new Promise(function(resolve) {
      var bd = document.createElement('div');
      bd.className = 'cm-confirm-bd';
      bd.innerHTML =
        '<div class="cm-confirm-box">' +
          '<div class="cm-confirm-icon">' + (opts.icon || '⚠️') + '</div>' +
          '<div class="cm-confirm-title">' + escapeHtml(opts.title || 'Are you sure?') + '</div>' +
          '<div class="cm-confirm-msg">' + (opts.message || '') + '</div>' +
          '<div class="cm-confirm-actions">' +
            '<button class="cm-btn muted" id="cmCfxCancel">Cancel</button>' +
            '<button class="cm-btn ' + (opts.confirmClass || '') + '" id="cmCfxOk">' + escapeHtml(opts.confirmLabel || 'Confirm') + '</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(bd);
      function done(v) { bd.remove(); resolve(v); }
      bd.querySelector('#cmCfxCancel').onclick = function() { done(false); };
      bd.querySelector('#cmCfxOk').onclick = function() { done(true); };
      bd.addEventListener('click', function(e) { if (e.target === bd) done(false); });
      setTimeout(function() { var ok = bd.querySelector('#cmCfxOk'); if (ok) ok.focus(); }, 30);
    });
  }

  function flash(kind, text) {
    var el = document.getElementById('cmFlash');
    if (!el) return;
    el.innerHTML = '<div class="cm-msg '+kind+'">'+escapeHtml(text)+'</div>';
    setTimeout(function(){ if (el.firstChild) el.firstChild.style.opacity = '0.4'; }, 2200);
    setTimeout(function(){ el.innerHTML = ''; }, 4000);
  }

  function genPasscode(len) {
    len = len || 6;
    var buf = new Uint32Array(len);
    crypto.getRandomValues(buf);
    var out = '';
    for (var i = 0; i < len; i++) out += String(buf[i] % 10);
    return out;
  }

  function copyAndFlash(text, msg) {
    try {
      navigator.clipboard.writeText(text).then(
        function(){ flash('ok', msg || ('Copied: ' + text)); },
        function(){ flash('ok', msg || ('Generated: ' + text)); }
      );
    } catch (e) {
      flash('ok', msg || ('Generated: ' + text));
    }
  }

  /* -------------------------------------------------------------- expose */
  window.openCodesPanel = function(fromSMG) { state.fromSMG = !!fromSMG; show(); };
  window.codesPanel = { open: show, hide: hide, call: call };
})();
