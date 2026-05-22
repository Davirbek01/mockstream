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
  // Browser admins authenticate via their Supabase JWT (Google sign-in or
  // magic link). The Edge Function still accepts adminPasscode for Telegram
  // bots / manager bots that don't have a Supabase session.
  async function getUserJwt() {
    try {
      var aa = window.AdminAuth;
      if (aa && aa.currentSession) {
        var s = await aa.currentSession();
        return s && s.access_token ? s.access_token : '';
      }
    } catch (e) {}
    return '';
  }

  // Fallback: dashboards that signed in via passcode (no Google JWT) stash
  // the admin passcode in sessionStorage so we can relay it to the Edge
  // Function as `adminPasscode`. This keeps the Code Management panel
  // accessible for users who chose the passcode tab on results dashboard.
  function getDashboardPasscode() {
    try { return sessionStorage.getItem('dashboard-admin-passcode') || ''; } catch (e) { return ''; }
  }

  async function call(action, args) {
    var jwt = await getUserJwt();
    var body = Object.assign({ userJwt: jwt, action: action }, args || {});
    if (!jwt) {
      var pc = getDashboardPasscode();
      if (pc) body.adminPasscode = pc;
    }
    var resp = await fetch(FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON
        // NOTE: no Authorization header — function is deployed with
        // --no-verify-jwt, and sending a non-JWT publishable key as a
        // Bearer token causes the Supabase gateway to 401 before our
        // handler runs (which strips the CORS headers). The user's JWT
        // travels in the request body as `userJwt` instead.
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
      // Hide-Regular path drops the regular column → grid becomes Mock# + premium.
      '.cm-card.cm-hide-reg .cm-mock-row{grid-template-columns:90px 1fr;}',
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
    // Use a unique id distinct from the Centers panel's overlay (which also
    // claims 'cmOverlay'); without this rename, reopening Site Management and
    // picking Centers after Code Management was open returns to landing
    // because _cmEnsureOverlay() finds the leftover Code Management element
    // by id and short-circuits.
    var ov = document.getElementById('codeMgmtOverlay');
    if (ov) { ov.style.display = 'block'; }
    else {
      ov = document.createElement('div');
      ov.id = 'codeMgmtOverlay';
      ov.className = 'cm-overlay';
      ov.innerHTML = '<div class="cm-panel"><div id="cmRoot"></div></div>';
      ov.addEventListener('click', function(e){ if (e.target === ov) hide(); });
      document.body.appendChild(ov);
    }
    // Show a transient “Loading…” frame while we verify the admin session.
    document.getElementById('cmRoot').innerHTML =
      '<div class="cm-header"><h3>🔑 Code Management</h3>' +
        '<button class="cm-close" id="cmCloseLoad">×</button></div>' +
      '<div class="cm-body"><div class="cm-empty">Verifying admin session…</div></div>';
    document.getElementById('cmCloseLoad').onclick = hide;
    call('list_centers', {}).then(function(r){
      if (r && r.ok) {
        // Hide the legacy 'mock_stream' (with underscore) row from the dropdown.
        // The canonical id for the main site in lookup tables (vip_codes,
        // mock_codes, admin_passcodes) is 'mockstream' — that's what
        // MAIN_SITE_ID points to. The 'mock_stream' centers row still exists
        // because some unnormalised write paths use it; it's not safe to
        // delete the row, but it shouldn't appear as a separate option here.
        state.centers = (r.centers || []).filter(function(c){ return c.id !== 'mock_stream'; });
        state.role = r.role;
        renderMain();
      } else {
        renderSignInPrompt(r && r.error);
      }
    }).catch(function(err){
      console.warn('[code-management] list_centers failed', err);
      renderSignInPrompt('network_error');
    });
  }
  function hide() {
    var ov = document.getElementById('codeMgmtOverlay');
    if (ov) ov.style.display = 'none';
  }

  var state = { centers: [], role: null, currentCenter: null, view: null, fromSMG: false, vipTab: 'premium' };
  var MAIN_SITE_ID = 'mockstream'; // governed by super-admin (no clone passcode needed)

  // Per-centre Hide Regular Codes filter. When the centre's
  // center_config_<id> JSON has hideRegularCodes:true AND the viewer is a
  // clone admin (not super-admin), the Codes panel hides every regular-tier
  // row + control. Super-admin always sees everything regardless of the flag.
  // Source of truth is window._centerConfig (set by site-config/center-guard.js)
  // — only meaningful when the clone admin is on their own centre's site,
  // which is exactly the case we filter for.
  function _cmHideRegular() {
    if (state.role === 'super_admin') return false;
    try {
      return !!(window._centerConfig && window._centerConfig.hideRegularCodes === true);
    } catch (e) { return false; }
  }

  /* -------------------------------------------------------------- gate */
  // Replaced the legacy numeric-passcode gate with a friendly prompt that
  // tells the user to sign in via the existing AdminAuth modal (Google or
  // magic link). Telegram bots still authenticate via adminPasscode
  // server-side; this UI only ever runs in a browser.
  function renderSignInPrompt(errCode) {
    var root = document.getElementById('cmRoot');
    var backHtml = state.fromSMG ? '<button class="cm-back-btn" id="cmBackBtn" aria-label="Back">&#8592;</button>' : '';
    var msg = (errCode === 'unauthorized' || !errCode)
      ? 'Sign in with your admin Google account (or request a magic link) to manage codes.'
      : 'Could not verify admin session: ' + errCode;
    root.innerHTML =
      '<div class="cm-header"><h3>🔑 Code Management</h3>' +
        '<div style="display:flex;gap:6px;align-items:center;">'+backHtml+'<button class="cm-close" id="cmCloseGate">×</button></div></div>' +
      '<div class="cm-body">' +
        '<div class="cm-gate">' +
          '<div style="font-size:42px;margin-bottom:6px;">🔐</div>' +
          '<h4 style="margin:0 0 4px;font:700 16px system-ui;">Admin sign-in required</h4>' +
          '<div style="font-size:12.5px;color:#64748b;margin-bottom:14px;">' + msg + '</div>' +
          '<button class="cm-btn" id="cmSignInBtn" style="width:100%;padding:12px;font-size:14px;">Sign in as admin</button>' +
        '</div>' +
      '</div>';
    document.getElementById('cmCloseGate').onclick = hide;
    if (state.fromSMG) {
      var bk = document.getElementById('cmBackBtn');
      if (bk) bk.onclick = function() { hide(); if (typeof window._showSiteMgmtGrid === 'function') window._showSiteMgmtGrid(); };
    }
    document.getElementById('cmSignInBtn').onclick = async function() {
      // Trigger the standard AdminAuth modal (Google + magic link). After
      // sign-in completes (page may redirect via OAuth), re-attempt show().
      try {
        var aa = window.AdminAuth;
        if (aa && aa.requireLogin) {
          await aa.requireLogin();
          show();
          return;
        }
      } catch (e) {
        // requireLogin throws when modal opened — that's expected.
      }
    };
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
        '<button class="cm-btn ghost" id="cmLogout" style="margin-left:auto;">Close</button>' +
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
    document.getElementById('cmLogout').onclick = function(){ hide(); };
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
    var hideReg = _cmHideRegular();
    // If admin disabled Regulars while user was on the Regular VIP pill,
    // snap them back to Premium so the active pill matches what's visible.
    if (hideReg && state.vipTab === 'regular') state.vipTab = 'premium';

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

    // Hide-Regular path: only ever look at premium full-mock so the card
    // never shows a regular code as a fallback.
    var fm = hideReg
      ? mockMap['full_mock#1#premium']
      : (mockMap['full_mock#1#premium'] || mockMap['full_mock#1#regular']);
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
      var entries = (r.mock||[]).filter(function(m){
        if (m.skill !== sk.key) return false;
        // Drop regular rows entirely when the filter is on — clone admin
        // never sees them, can't accidentally renew/revoke them.
        if (hideReg && (m.tier||'premium') === 'regular') return false;
        return true;
      });
      // Group by mock_number; row shows premium-only when hideReg is on,
      // both columns otherwise.
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
          (hideReg ? '' : tierCell(m.regular, sk.key, num, 'regular'))+
          tierCell(m.premium, sk.key, num, 'premium')+
        '</div>';
      }).join('') || '<div class="cm-empty" style="padding:10px;">No mock codes yet for this skill.</div>';
      return '<div class="cm-card' + (hideReg ? ' cm-hide-reg' : '') + '">' +
        '<h4>'+sk.label+' Mock Codes</h4>' +
        '<div class="cm-row">' +
          '<span class="cm-label">Mock #:</span>' +
          '<input class="cm-input num cm-mock-num" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="3" placeholder="1" style="width:70px;">' +
          '<select class="cm-select cm-mock-exp">'+EXPIRY_OPTIONS.map(function(o){return '<option value="'+o.v+'">'+o.label+'</option>';}).join('')+'</select>' +
          (hideReg ? '' : '<button class="cm-btn cm-gen-mock" data-skill="'+sk.key+'" data-tier="regular"'+(canEdit?'':' disabled')+'>+ 🟢 Regular</button>') +
          '<button class="cm-btn cm-gen-mock" data-skill="'+sk.key+'" data-tier="premium"'+(canEdit?'':' disabled')+'>+ 🔥 Premium</button>' +
        '</div>' +
        rows +
      '</div>';
    }).join('');

    // Hide-Regular path: drop the Regular VIP pill (premium-only switcher
    // collapses to a single label) and skip the bulk-generate panel, since
    // bulk-renew creates regular + premium together — exactly what we don't
    // want clone admins to be able to fire when regulars are off.
    var vipSwitcherHtml = hideReg
      ? '<div class="cm-vip-switcher"><button class="cm-vip-pill active" data-vip="premium">👑 Premium VIP</button></div>'
      : '<div class="cm-vip-switcher">' +
          '<button class="cm-vip-pill'+(state.vipTab==='premium'?' active':'')+' " data-vip="premium">👑 Premium VIP</button>' +
          '<button class="cm-vip-pill'+(state.vipTab==='regular'?' active':'')+' " data-vip="regular">🎟️ Regular VIP</button>' +
        '</div>';
    var bulkPanelHtml = hideReg ? '' :
      '<div class="cm-card" style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-color:#fbbf24;">' +
        '<h4 style="margin:0 0 6px;">⚡ Bulk generate (all 4 skills × both tiers)</h4>' +
        '<p style="margin:0 0 8px;font-size:12.5px;color:#78350f;">Generates Regular + Premium codes for every mock the site ships, across Listening / Reading / Writing / Speaking.</p>' +
        '<div id="cmBulkCounts" style="margin:0 0 10px;font:600 12.5px system-ui;color:#78350f;">📊 Detecting mock counts…</div>' +
        '<div class="cm-row">' +
          '<label class="cm-label">Expiry:</label>' +
          '<select class="cm-select" id="cmBulkExp">' +
            EXPIRY_OPTIONS.map(function(o){ return '<option value="'+o.v+'">'+o.label+'</option>'; }).join('') +
          '</select>' +
        '</div>' +
        '<div class="cm-row" style="margin-bottom:0;">' +
          '<button class="cm-btn" id="cmBulkMissing" disabled>⚡ Generate missing only</button>' +
          '<button class="cm-btn danger" id="cmBulkAll" disabled>🔄 Regenerate ALL (revokes existing)</button>' +
        '</div>' +
      '</div>';

    // Export-to-PDF card. Lets the admin pick which skills + ranges + tiers
    // to bundle into a single printable document with the centre's logo
    // and brand name in the header. hideReg pre-filters the tier picker
    // so a clone admin on a hidden-regulars centre can only ever export
    // premiums.
    var exportCardHtml =
      '<div class="cm-card" style="background:linear-gradient(135deg,#ede9fe,#ddd6fe);border-color:#a78bfa;margin-bottom:12px;">' +
        '<h4 style="margin:0 0 6px;color:#5b21b6;">📄 Export Codes to PDF</h4>' +
        '<p style="margin:0 0 8px;font-size:12.5px;color:#5b21b6;">Bundle selected mock + VIP codes into a printable PDF with the centre\'s logo in the header. Pick skills, ranges, and tiers, then generate.</p>' +
        '<button class="cm-btn" id="cmExportPdfBtn" style="background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;border-color:#5b21b6;font-weight:700;">📄 Open export dialog</button>' +
      '</div>';

    body.innerHTML =
      disabledHint +
      '<div id="cmFlash"></div>' +
      vipSwitcherHtml +
      '<div id="cmVipCard">' + buildVipCard(state.vipTab) + '</div>' +
      exportCardHtml +
      '<div class="cm-collapse-hdr" id="cmCollapseHdr">' +
        '<span>🏆 Full Mock &amp; Per-Mock Codes</span>' +
        '<span class="cm-collapse-chevron" id="cmChevron">▾</span>' +
      '</div>' +
      '<div class="cm-collapse-body" id="cmCollapseBody">' +
        fullMockHtml +
        '<p style="margin:14px 0 8px;font:600 13px system-ui;color:#64748b;">Per-Mock Codes (single-test access)</p>' +
        bulkPanelHtml +
        mockHtml +
      '</div>';

    // Export-PDF wiring. Defined inline (not inside renderCodesTab's helper
    // closures) because the modal is appended to <body> and lives outside
    // the codes panel — closing/reopening the codes panel must not orphan
    // the export modal.
    var exportBtn = document.getElementById('cmExportPdfBtn');
    if (exportBtn) {
      exportBtn.onclick = function () { _cmOpenExportModal(state.currentCenter, hideReg); };
    }

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

    // Bulk generate / regenerate buttons
    var bulkMissingBtn = cb.querySelector('#cmBulkMissing');
    var bulkAllBtn     = cb.querySelector('#cmBulkAll');
    var bulkCountsEl   = cb.querySelector('#cmBulkCounts');
    function bulkExp() { return (cb.querySelector('#cmBulkExp')||{}).value || ''; }

    // Detect per-skill mock counts from the promocode dictionaries the site
    // ships (loaded by landing.html). Falls back to whatever the server has.
    function detectLocalCounts() {
      function maxKey(dict) {
        if (!dict || typeof dict !== 'object') return 0;
        var max = 0;
        for (var k in dict) {
          if (!Object.prototype.hasOwnProperty.call(dict, k)) continue;
          var n = parseInt(k, 10);
          if (n >= 1 && n <= 999 && n > max) max = n;
        }
        return max;
      }
      return {
        listening: maxKey(window.LISTENING_MOCK_PROMOCODES),
        reading:   maxKey(window.READING_MOCK_PROMOCODES),
        writing:   maxKey(window.WRITING_MOCK_PROMOCODES),
        speaking:  maxKey(window.SPEAKING_MOCK_PROMOCODES)
      };
    }
    function countsFmt(c) {
      return '🎧 ' + (c.listening||0) + ' · 📖 ' + (c.reading||0)
           + ' · ✏️ ' + (c.writing||0) + ' · 🎤 ' + (c.speaking||0);
    }
    state.mockCounts = state.mockCounts || null;
    (async function loadCounts() {
      var local = detectLocalCounts();
      var hasLocal = local.listening + local.reading + local.writing + local.speaking > 0;
      // Always try to fetch the server's view first
      var server = await call('get_mock_counts', {});
      var counts = (server && server.ok && server.counts) ? server.counts : null;
      // If we detected fresh dicts locally and they differ (or server has no record), sync.
      if (hasLocal && (!counts ||
          local.listening !== counts.listening || local.reading !== counts.reading ||
          local.writing   !== counts.writing   || local.speaking !== counts.speaking)) {
        var pushed = await call('set_mock_counts', { counts: local });
        if (pushed && pushed.ok) counts = pushed.counts;
      }
      if (!counts) counts = local.listening ? local : { listening: 100, reading: 99, writing: 99, speaking: 99 };
      state.mockCounts = counts;
      var src = hasLocal ? 'detected from this page' : (server && server.ok && server.source === 'site_settings' ? 'last synced' : 'default');
      if (bulkCountsEl) bulkCountsEl.innerHTML = '📊 Mocks per skill (' + src + '): ' + countsFmt(counts);
      if (bulkMissingBtn) bulkMissingBtn.disabled = false;
      if (bulkAllBtn)     bulkAllBtn.disabled     = false;
    })();

    if (bulkMissingBtn) {
      bulkMissingBtn.onclick = async function() {
        var c = state.mockCounts;
        if (!c) { flash('err','Counts not loaded yet'); return; }
        if (!await cmConfirm({
          icon: '⚡',
          title: 'Generate missing codes?',
          message: 'For every mock the site has (' + countsFmt(c) + ') and both tiers (🟢 Regular + 🔥 Premium), this will create a code for any slot that does not yet have one.<br><br><b>Existing codes will NOT change.</b>',
          confirmLabel: 'Generate'
        })) return;
        bulkMissingBtn.disabled = true; bulkAllBtn.disabled = true;
        bulkMissingBtn.textContent = '⏳ Generating…';
        var r2 = await call('bulk_renew_mocks', {
          center: state.currentCenter, mode: 'missing',
          max_mock_by_skill: c, expiry: expiryToISO(bulkExp())
        });
        bulkMissingBtn.disabled = false; bulkAllBtn.disabled = false;
        bulkMissingBtn.textContent = '⚡ Generate missing only';
        if (r2.ok) { flash('ok','Generated '+r2.written+' new code'+(r2.written===1?'':'s')); renderTab(); }
        else flash('err', r2.error||'Failed');
      };
    }
    if (bulkAllBtn) {
      bulkAllBtn.onclick = async function() {
        var c = state.mockCounts;
        if (!c) { flash('err','Counts not loaded yet'); return; }
        if (!await cmConfirm({
          icon: '🔄',
          title: 'Regenerate ALL codes?',
          message: 'This will <b>revoke every existing</b> Regular and Premium mock code for every mock the site has (' + countsFmt(c) + ') and issue brand-new ones.<br><br>Anyone currently using an old code will lose access immediately.',
          confirmLabel: 'Yes, regenerate all',
          confirmClass: 'danger'
        })) return;
        bulkAllBtn.disabled = true; bulkMissingBtn.disabled = true;
        bulkAllBtn.textContent = '⏳ Regenerating…';
        var r2 = await call('bulk_renew_mocks', {
          center: state.currentCenter, mode: 'all',
          max_mock_by_skill: c, expiry: expiryToISO(bulkExp())
        });
        bulkAllBtn.disabled = false; bulkMissingBtn.disabled = false;
        bulkAllBtn.textContent = '🔄 Regenerate ALL (revokes existing)';
        if (r2.ok) { flash('ok','Regenerated '+r2.written+' code'+(r2.written===1?'':'s')); renderTab(); }
        else flash('err', r2.error||'Failed');
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
      // The super-admin passcode is for bot use only — the browser session
      // stays signed in via Google/JWT, so just refresh the panel.
      show();
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

  /* -------------------------------------------------------------- export PDF */
  // Open the "Export Codes to PDF" dialog. Pre-loads counts (so default
  // ranges are reasonable) and centre branding (so the PDF header shows
  // the correct logo/name) before the modal renders.
  async function _cmOpenExportModal(centerId, hideReg) {
    if (!centerId) { flash('err', 'Pick a centre first'); return; }
    // Mock counts for default ranges + brand info for the PDF header.
    var counts;
    try {
      var r1 = await call('get_mock_counts', {});
      counts = (r1 && r1.ok && r1.counts) ? r1.counts : { listening: 100, reading: 99, writing: 99, speaking: 99 };
    } catch (e) { counts = { listening: 100, reading: 99, writing: 99, speaking: 99 }; }
    var brand = await _cmFetchBrand(centerId);

    var bd = document.createElement('div');
    bd.className = 'cm-overlay';
    bd.style.zIndex = '10500';
    var skills = [
      { key: 'listening', label: '🎧 Listening', cap: counts.listening },
      { key: 'reading',   label: '📖 Reading',   cap: counts.reading   },
      { key: 'writing',   label: '✍️ Writing',   cap: counts.writing   },
      { key: 'speaking',  label: '🎤 Speaking',  cap: counts.speaking  },
      { key: 'full_mock', label: '🏆 Full Mock', cap: 1                },
    ];
    var rowsHtml = skills.map(function (s) {
      return '<div class="cm-row" style="align-items:center;gap:8px;margin-bottom:4px;">' +
        '<label class="cm-toggle" style="min-width:130px;flex:0 0 auto;">' +
          '<input type="checkbox" class="cm-exp-skill" data-skill="' + s.key + '" checked>' +
          '<span>' + s.label + '</span>' +
        '</label>' +
        '<span class="cm-label" style="font-size:11px;color:#64748b;">From #</span>' +
        '<input type="number" class="cm-input num cm-exp-from" data-skill="' + s.key + '" min="1" max="' + s.cap + '" value="1" style="width:64px;">' +
        '<span class="cm-label" style="font-size:11px;color:#64748b;">to #</span>' +
        '<input type="number" class="cm-input num cm-exp-to" data-skill="' + s.key + '" min="1" max="' + s.cap + '" value="' + s.cap + '" style="width:64px;">' +
      '</div>';
    }).join('');

    var tierRowHtml = '<div class="cm-row" style="gap:14px;align-items:center;">' +
      '<span class="cm-label">Tiers:</span>' +
      (hideReg
        ? '<label class="cm-toggle" style="opacity:0.5;cursor:not-allowed;"><input type="checkbox" disabled> 🟢 Regular <i style="font-size:11px;">(hidden for this centre)</i></label>'
        : '<label class="cm-toggle"><input type="checkbox" id="cmExpTierReg" checked> 🟢 Regular</label>') +
      '<label class="cm-toggle"><input type="checkbox" id="cmExpTierPre" checked> 🔥 Premium</label>' +
    '</div>';

    var vipRowHtml = '<div class="cm-row" style="gap:14px;align-items:center;">' +
      '<span class="cm-label">VIP codes:</span>' +
      '<label class="cm-toggle"><input type="checkbox" id="cmExpVip" checked> Include centre-wide VIP codes (Premium' + (hideReg ? '' : ' &amp; Regular') + ')</label>' +
    '</div>';

    // Modal uses inline styles instead of cm-modal-* classes (which the
    // panel's stylesheet doesn't define) so the layout is self-contained
    // and won't break if the cm-* CSS evolves separately.
    bd.innerHTML =
      '<div style="background:var(--card,#fff);max-width:640px;width:100%;margin:48px auto;border-radius:16px;box-shadow:0 24px 64px rgba(0,0,0,0.35);overflow:hidden;">' +
        '<div style="padding:14px 18px;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;display:flex;align-items:center;justify-content:space-between;">' +
          '<span style="font-weight:700;font-size:14.5px;">📄 Export Codes to PDF — ' + escapeHtml(brand.name) + '</span>' +
          '<button id="cmExpClose" style="background:rgba(255,255,255,0.2);border:0;color:#fff;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:16px;line-height:1;">×</button>' +
        '</div>' +
        '<div style="padding:14px 18px;max-height:70vh;overflow-y:auto;">' +
          '<p style="margin:0 0 10px;font-size:12.5px;color:#64748b;">Pick which mock codes to bundle. PDF will include the centre logo + brand name in the header.</p>' +
          rowsHtml +
          '<div style="height:8px;"></div>' +
          tierRowHtml +
          '<div style="height:6px;"></div>' +
          vipRowHtml +
          '<div id="cmExpStatus" style="margin-top:10px;font-size:12.5px;min-height:18px;color:#64748b;"></div>' +
        '</div>' +
        '<div style="padding:12px 18px;background:#f8fafc;border-top:1px solid #e5e7eb;display:flex;justify-content:flex-end;gap:8px;">' +
          '<button class="cm-btn" id="cmExpCancel">Cancel</button>' +
          '<button class="cm-btn" id="cmExpGo" style="background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;border-color:#5b21b6;font-weight:700;">📄 Generate PDF</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(bd);

    function done() { try { bd.remove(); } catch (e) {} }
    bd.querySelector('#cmExpClose').onclick  = done;
    bd.querySelector('#cmExpCancel').onclick = done;
    bd.addEventListener('click', function (e) { if (e.target === bd) done(); });

    bd.querySelector('#cmExpGo').onclick = async function () {
      var statusEl = bd.querySelector('#cmExpStatus');
      statusEl.style.color = '#5b21b6';
      statusEl.textContent = '⏳ Fetching codes…';

      // Read selections.
      var picks = [];
      bd.querySelectorAll('.cm-exp-skill').forEach(function (cb) {
        if (!cb.checked) return;
        var sk = cb.dataset.skill;
        var from = parseInt(bd.querySelector('.cm-exp-from[data-skill="' + sk + '"]').value, 10) || 1;
        var to   = parseInt(bd.querySelector('.cm-exp-to[data-skill="'   + sk + '"]').value, 10) || from;
        if (to < from) { var t = from; from = to; to = t; }
        picks.push({ skill: sk, from: from, to: to });
      });
      var includeReg = !hideReg && bd.querySelector('#cmExpTierReg') && bd.querySelector('#cmExpTierReg').checked;
      var includePre = bd.querySelector('#cmExpTierPre').checked;
      var includeVip = bd.querySelector('#cmExpVip').checked;
      if (!picks.length && !includeVip) {
        statusEl.style.color = '#dc2626';
        statusEl.textContent = '⚠ Pick at least one skill or VIP codes.';
        return;
      }
      if (!includeReg && !includePre) {
        statusEl.style.color = '#dc2626';
        statusEl.textContent = '⚠ Pick at least one tier.';
        return;
      }

      // Fetch latest codes for the centre. list_codes already respects the
      // hideRegularCodes server-side filter so a clone admin cannot pull
      // regulars even by manipulating the form.
      var data;
      try {
        data = await call('list_codes', { center: centerId });
      } catch (e) { data = { ok: false, error: 'network' }; }
      if (!data || !data.ok) {
        statusEl.style.color = '#dc2626';
        statusEl.textContent = '⚠ Failed to fetch codes' + (data && data.error ? ' (' + escapeHtml(data.error) + ')' : '') + '.';
        return;
      }

      statusEl.textContent = '⏳ Loading PDF library…';
      try {
        if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
          await new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            s.onload = resolve; s.onerror = reject;
            document.head.appendChild(s);
          });
        }
      } catch (e) {
        statusEl.style.color = '#dc2626';
        statusEl.textContent = '⚠ Could not load jsPDF.';
        return;
      }

      statusEl.textContent = '⏳ Building PDF…';
      try {
        await _cmGeneratePdf({
          centerId: centerId,
          brand: brand,
          picks: picks,
          includeReg: includeReg,
          includePre: includePre,
          includeVip: includeVip,
          vip: data.vip || [],
          mock: data.mock || [],
        });
        statusEl.style.color = '#047857';
        statusEl.textContent = '✓ PDF generated. Check your downloads.';
        setTimeout(done, 1200);
      } catch (e) {
        console.error('[cm export-pdf] failed:', e);
        statusEl.style.color = '#dc2626';
        statusEl.textContent = '⚠ Build error: ' + escapeHtml((e && e.message) || 'unknown');
      }
    };
  }

  // Pull centre brand info (logoUrl + brandName) from
  // site_settings.center_site_config_<id>. Falls back to the centres
  // table display_name + the dashboard's 'mock-stream' default logo.
  async function _cmFetchBrand(centerId) {
    var fallbackName = centerId.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    var fallbackLogo = 'https://i.ibb.co/WN0XY5Lv/logo.png';
    try {
      var r = await fetch(SUPABASE_URL + '/rest/v1/site_settings?key=eq.' + encodeURIComponent('center_site_config_' + centerId) + '&select=value', {
        headers: { 'apikey': ANON, 'Authorization': 'Bearer ' + ANON }
      });
      var rows = await r.json();
      if (rows && rows[0] && rows[0].value) {
        var v = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
        return {
          name: (v && v.brandName) || fallbackName,
          logoUrl: (v && v.logoUrl) || fallbackLogo,
          color: (v && v.brandColor) || '#7c3aed',
        };
      }
    } catch (e) { /* fall through to fallbacks */ }
    return { name: fallbackName, logoUrl: fallbackLogo, color: '#7c3aed' };
  }

  // Fetch a logo as a data-URL so jsPDF can embed it. Cross-origin images
  // need anonymous CORS; if the host doesn't allow it we silently skip the
  // image so the PDF still generates with just the brand name.
  function _cmFetchImageAsDataUrl(url) {
    return new Promise(function (resolve) {
      try {
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () {
          try {
            var canvas = document.createElement('canvas');
            canvas.width  = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d').drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } catch (e) { resolve(null); }
        };
        img.onerror = function () { resolve(null); };
        img.src = url;
      } catch (e) { resolve(null); }
    });
  }

  // jsPDF doesn't ship a font that can render emoji glyphs — they come
  // out as garbage like "Ø<ß§". Strip them everywhere we draw text on the
  // PDF (the panel UI keeps emoji because the browser supports them).
  function _cmStripEmoji(s) {
    if (s == null) return '';
    return String(s)
      // Standard emoji + symbol blocks
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
      .replace(/[\u{2600}-\u{27BF}]/gu, '')
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
      .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '')
      .replace(/[‍️⃣]/g, '') // ZWJ + variation selectors
      .replace(/\s+/g, ' ')
      .trim();
  }

  // jsPDF-driven export. Header = logo + brand name. Body = VIP section
  // (optional) then per-skill tables. Each skill table lists the picked
  // mock-number range with one row per mock and one column per included
  // tier. Sized for A4 portrait. Uses Helvetica + Courier (mono codes)
  // — both built into jsPDF, both render correctly without bundling a
  // unicode font.
  async function _cmGeneratePdf(opts) {
    var jsPDF = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    if (!jsPDF) throw new Error('jsPDF not available');
    var doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    var pageW = doc.internal.pageSize.getWidth();
    var pageH = doc.internal.pageSize.getHeight();
    var marginX = 14;
    var contentW = pageW - 2 * marginX;
    var brandColor = opts.brand.color || '#7c3aed';

    // ─── Brand-coloured top band ──────────────────────────────────────
    doc.setFillColor(brandColor);
    doc.rect(0, 0, pageW, 4, 'F');

    var y = 14;

    // ─── Header: logo (rounded white-bg circle) + brand name + subtitle
    var logoData = await _cmFetchImageAsDataUrl(opts.brand.logoUrl);
    var logoSize = 20;
    if (logoData) {
      // Subtle white rounded-rect behind the logo so coloured logos read
      // even on the brand-tinted band; jsPDF roundedRect uses the same
      // colour we set with setFillColor.
      doc.setFillColor('#ffffff');
      doc.roundedRect(marginX, y, logoSize, logoSize, 3, 3, 'F');
      try { doc.addImage(logoData, 'PNG', marginX + 1, y + 1, logoSize - 2, logoSize - 2); } catch (e) {}
    }
    var titleX = logoData ? marginX + logoSize + 6 : marginX;
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(brandColor);
    doc.text(_cmStripEmoji(opts.brand.name) || 'Mock Stream', titleX, y + 9);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#64748b');
    var todayStr = new Date().toLocaleDateString('en-GB');
    doc.text('Codes export  ·  ' + todayStr, titleX, y + 16);
    y += logoSize + 4;

    // Divider line under header.
    doc.setDrawColor('#e5e7eb');
    doc.setLineWidth(0.4);
    doc.line(marginX, y, pageW - marginX, y);
    y += 8;

    // Index VIP and mock codes for fast lookup.
    var vipMap = {}; (opts.vip || []).forEach(function (v) { vipMap[v.type] = v; });
    var mockIdx = {};
    (opts.mock || []).forEach(function (m) {
      var key = m.skill + '#' + m.mock_number;
      if (!mockIdx[key]) mockIdx[key] = {};
      mockIdx[key][m.tier || 'premium'] = m;
    });

    // Plain ASCII labels — jsPDF's stock fonts can't render emoji.
    var SKILL_LABEL = {
      listening: 'Listening',
      reading:   'Reading',
      writing:   'Writing',
      speaking:  'Speaking',
      full_mock: 'Full Mock',
    };

    function pageFooter() {
      // Page-of-N footer. We re-set on every page right before adding a
      // new one so the running page number is accurate; jsPDF does not
      // back-fill placeholders.
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#94a3b8');
      var pageNum = doc.internal.getNumberOfPages();
      var ts = 'Generated ' + new Date().toLocaleString('en-GB');
      doc.text(ts, marginX, pageH - 7);
      doc.text('Page ' + pageNum, pageW - marginX, pageH - 7, { align: 'right' });
    }

    function ensureSpace(rows) {
      var needed = rows * 7 + 18;
      if (y + needed > pageH - 14) {
        pageFooter();
        doc.addPage();
        // Re-paint the brand top band on every new page for continuity.
        doc.setFillColor(brandColor);
        doc.rect(0, 0, pageW, 4, 'F');
        y = 14;
      }
    }

    // Rounded coloured pill behind a section title — much more "designed"
    // than a plain text line, and uses the centre's brand colour so the
    // PDF feels custom for each clone.
    function drawSectionBar(text, fillHex) {
      ensureSpace(2);
      doc.setFillColor(fillHex || brandColor);
      doc.roundedRect(marginX, y, contentW, 9, 2, 2, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#ffffff');
      doc.text(_cmStripEmoji(text), marginX + 4, y + 6);
      y += 13;
    }

    // Striped table renderer. Header row uses a soft slate fill; body
    // rows alternate white / very-pale-slate so long lists stay scannable.
    // Code cells render in Courier (mono) so digits line up vertically.
    function drawTable(headers, rows, cellWidths) {
      ensureSpace(2);
      var totalW = cellWidths.reduce(function (a, b) { return a + b; }, 0);

      // Header
      doc.setFillColor('#f1f5f9');
      doc.setDrawColor('#cbd5e1');
      doc.setLineWidth(0.3);
      doc.rect(marginX, y, totalW, 8, 'FD');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#0f172a');
      var x = marginX;
      headers.forEach(function (h, i) {
        doc.text(_cmStripEmoji(String(h)), x + 3, y + 5.5);
        x += cellWidths[i];
      });
      y += 8;

      // Body rows (alternating)
      doc.setFontSize(10);
      doc.setDrawColor('#e2e8f0');
      doc.setLineWidth(0.2);
      rows.forEach(function (row, idx) {
        ensureSpace(1);
        var rowH = 7;
        if (idx % 2 === 0) {
          doc.setFillColor('#ffffff');
        } else {
          doc.setFillColor('#f8fafc');
        }
        doc.rect(marginX, y, totalW, rowH, 'FD');
        x = marginX;
        row.forEach(function (cell, i) {
          var c = (cell && typeof cell === 'object') ? cell : { text: cell };
          doc.setTextColor(c.color || '#0f172a');
          if (c.mono) doc.setFont('courier', c.bold ? 'bold' : 'normal');
          else        doc.setFont('helvetica', c.bold ? 'bold' : 'normal');
          doc.text(_cmStripEmoji(String(c.text == null ? '' : c.text)) || '-', x + 3, y + 4.8);
          x += cellWidths[i];
        });
        y += rowH;
      });
      y += 6;
    }

    // ─── VIP section ───────────────────────────────────────────────────
    if (opts.includeVip) {
      drawSectionBar('Centre VIP codes', brandColor);
      var vipRows = [];
      if (vipMap.premium) vipRows.push([
        { text: 'Premium', bold: true, color: '#7c3aed' },
        { text: vipMap.premium.code, mono: true, bold: true },
      ]);
      if (opts.includeReg && vipMap.regular) vipRows.push([
        { text: 'Regular', bold: true, color: '#0f766e' },
        { text: vipMap.regular.code, mono: true, bold: true },
      ]);
      if (!vipRows.length) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor('#94a3b8');
        doc.text('No VIP codes generated for this centre yet.', marginX, y + 4);
        y += 10;
      } else {
        drawTable(['Tier', 'Code'], vipRows, [40, contentW - 40]);
      }
    }

    // ─── Per-skill sections ────────────────────────────────────────────
    var SKILL_COLOR = {
      listening: '#0d9488',
      reading:   '#2563eb',
      writing:   '#d97706',
      speaking:  '#dc2626',
      full_mock: '#7c3aed',
    };
    opts.picks.forEach(function (pick) {
      var label = SKILL_LABEL[pick.skill] + '  ·  Mock #' + pick.from +
                  (pick.from === pick.to ? '' : ' – #' + pick.to);
      drawSectionBar(label, SKILL_COLOR[pick.skill] || brandColor);

      var headers = ['Mock #'];
      var widths  = [24];
      var remaining = contentW - 24;
      var tierCols = (opts.includeReg ? 1 : 0) + (opts.includePre ? 1 : 0);
      var tierW = tierCols ? Math.floor(remaining / tierCols) : remaining;
      if (opts.includeReg) { headers.push('Regular'); widths.push(tierW); }
      if (opts.includePre) { headers.push('Premium'); widths.push(tierW); }
      // Adjust last column to swallow rounding so total = contentW exactly.
      var sum = widths.reduce(function (a, b) { return a + b; }, 0);
      widths[widths.length - 1] += contentW - sum;

      var rows = [];
      for (var n = pick.from; n <= pick.to; n++) {
        var key = pick.skill + '#' + n;
        var entry = mockIdx[key] || {};
        var row = [{ text: '#' + n, bold: true }];
        if (opts.includeReg) {
          row.push(entry.regular
            ? { text: entry.regular.code, mono: true, color: '#0f766e' }
            : { text: '—', color: '#94a3b8' });
        }
        if (opts.includePre) {
          row.push(entry.premium
            ? { text: entry.premium.code, mono: true, bold: true, color: '#7c3aed' }
            : { text: '—', color: '#94a3b8' });
        }
        rows.push(row);
      }
      drawTable(headers, rows, widths);
    });

    pageFooter(); // last page

    var safeName = (_cmStripEmoji(opts.brand.name) || opts.centerId)
      .replace(/[^A-Za-z0-9_-]+/g, '_').slice(0, 40) || opts.centerId;
    var dateTag  = new Date().toISOString().slice(0, 10);
    doc.save(safeName + '-codes-' + dateTag + '.pdf');
  }

  /* -------------------------------------------------------------- expose */
  window.openCodesPanel = function(fromSMG) { state.fromSMG = !!fromSMG; show(); };
  window.codesPanel = { open: show, hide: hide, call: call };
})();
