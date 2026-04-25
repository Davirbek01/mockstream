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
    { key: 'speaking',  label: '🎤 Speaking'  },
    { key: 'full_mock', label: '🏆 Full Mock' }
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
        'apikey': ANON,
        'Authorization': 'Bearer ' + ANON
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
      '.cm-overlay{position:fixed;inset:0;z-index:10200;background:rgba(15,23,42,.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:14px;overflow-y:auto;}',
      '.cm-panel{width:100%;max-width:980px;max-height:92vh;display:flex;flex-direction:column;background:var(--surface,#fff);color:var(--ink,#0f172a);border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.45);overflow:hidden;}',
      '.cm-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid rgba(148,163,184,.25);background:linear-gradient(135deg,#7c3aed,#4338ca);color:#fff;}',
      '.cm-header h3{margin:0;font:700 16px system-ui,-apple-system,Segoe UI,sans-serif;}',
      '.cm-header .cm-role{font-size:11.5px;opacity:.85;margin-left:8px;padding:2px 8px;background:rgba(255,255,255,.18);border-radius:999px;}',
      '.cm-close{background:rgba(255,255,255,.18);border:0;color:#fff;font-size:20px;cursor:pointer;width:30px;height:30px;border-radius:50%;line-height:1;}',
      '.cm-tabs{display:flex;gap:4px;padding:8px 12px 0;border-bottom:1px solid rgba(148,163,184,.18);background:var(--surface-alt,#f8fafc);overflow-x:auto;}',
      '.cm-tab{flex:0 0 auto;padding:10px 14px;font:600 13px system-ui;background:transparent;border:0;border-bottom:2px solid transparent;cursor:pointer;color:#64748b;}',
      '.cm-tab.active{color:#7c3aed;border-bottom-color:#7c3aed;}',
      '.cm-body{flex:1;overflow-y:auto;padding:18px 20px;}',
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
      '.cm-mock-row{display:grid;grid-template-columns:120px 80px 1fr auto;gap:8px;align-items:center;padding:8px 0;border-bottom:1px dashed rgba(148,163,184,.2);}',
      '@media(max-width:560px){.cm-mock-row{grid-template-columns:1fr 70px;grid-auto-rows:min-content;}.cm-mock-row .cm-mock-code-cell{grid-column:1/-1;}.cm-mock-row .cm-mock-actions{grid-column:1/-1;display:flex;gap:6px;}}',
      '.cm-audit{font:12px ui-monospace,Consolas,monospace;background:#0f172a;color:#cbd5e1;padding:12px;border-radius:10px;max-height:380px;overflow:auto;white-space:pre-wrap;}',
      '.cm-gate{max-width:380px;margin:0 auto;text-align:center;padding:28px 22px;}',
      '.cm-gate input{width:100%;padding:12px 14px;border:1.5px solid rgba(148,163,184,.4);border-radius:10px;font-size:18px;text-align:center;letter-spacing:4px;font-variant-numeric:tabular-nums;outline:none;background:var(--surface,#fff);color:var(--ink,#0f172a);box-sizing:border-box;margin:14px 0 6px;}',
      '.cm-gate input:focus{border-color:#7c3aed;}',
      '.cm-empty{text-align:center;padding:30px 14px;color:#94a3b8;font-size:13px;}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* -------------------------------------------------------------- shell */
  function show() {
    injectStyles();
    var ov = document.getElementById('cmOverlay');
    if (ov) { ov.style.display = 'flex'; }
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

  var state = { centers: [], role: null, currentCenter: null, view: null };

  /* -------------------------------------------------------------- gate */
  function renderGate() {
    var root = document.getElementById('cmRoot');
    root.innerHTML =
      '<div class="cm-header"><h3>🔑 Code Management</h3>' +
        '<button class="cm-close" id="cmCloseGate">×</button></div>' +
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

    root.innerHTML =
      '<div class="cm-header">' +
        '<div><h3>🔑 Code Management</h3>' +
        '<span class="cm-role">'+(isSuper?'super-admin':'clone admin')+'</span></div>' +
        '<button class="cm-close" id="cmCloseMain">×</button>' +
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
    (r.mock||[]).forEach(function(m){ mockMap[m.skill+'#'+m.mock_number] = m; });

    var vipHtml = ['premium','regular'].map(function(type){
      var v = vipMap[type];
      var code = v ? v.code : '';
      var meta = v ? ('Expires: ' + fmtCountdown(v.expires_at) + (v.last_renewed_at ? ' · Renewed: ' + new Date(v.last_renewed_at).toLocaleString() : '')) : 'No code yet';
      return '<div class="cm-card">' +
        '<h4>'+(type==='premium'?'👑 Premium VIP':'🎟️ Regular VIP')+'</h4>' +
        '<div class="cm-row">' +
          (code ? '<span class="cm-code" title="Click to copy" data-copy="'+code+'">'+code+'</span>' : '<span class="cm-code empty">— no code —</span>') +
          '<span class="cm-meta">'+escapeHtml(meta)+'</span>' +
        '</div>' +
        '<div class="cm-row">' +
          '<span class="cm-label">Expiry:</span>' +
          '<select class="cm-select cm-vip-exp" data-type="'+type+'">'+EXPIRY_OPTIONS.map(function(o){return '<option value="'+o.v+'">'+o.label+'</option>';}).join('')+'</select>' +
          '<button class="cm-btn cm-renew-vip" data-type="'+type+'"'+(canEdit?'':' disabled')+'>↻ Renew</button>' +
          (code ? '<button class="cm-btn danger cm-revoke-vip" data-type="'+type+'"'+(canEdit?'':' disabled')+'>Revoke</button>' : '') +
        '</div>' +
      '</div>';
    }).join('');

    var mockHtml = SKILLS.map(function(sk){
      var entries = (r.mock||[]).filter(function(m){ return m.skill === sk.key; }).sort(function(a,b){ return a.mock_number-b.mock_number; });
      var rows = entries.map(function(m){
        return '<div class="cm-mock-row">' +
          '<span><b>Mock #'+m.mock_number+'</b></span>' +
          '<span class="cm-mock-code-cell"><span class="cm-code" title="Click to copy" data-copy="'+m.code+'">'+m.code+'</span></span>' +
          '<span class="cm-meta">'+fmtCountdown(m.expires_at)+'</span>' +
          '<span class="cm-mock-actions">' +
            '<button class="cm-btn cm-renew-mock" data-skill="'+sk.key+'" data-num="'+m.mock_number+'"'+(canEdit?'':' disabled')+'>↻</button>' +
            '<button class="cm-btn danger cm-revoke-mock" data-skill="'+sk.key+'" data-num="'+m.mock_number+'"'+(canEdit?'':' disabled')+'>×</button>' +
          '</span>' +
        '</div>';
      }).join('') || '<div class="cm-empty" style="padding:10px;">No mock codes yet for this skill.</div>';
      return '<div class="cm-card">' +
        '<h4>'+sk.label+' Mock Codes</h4>' +
        '<div class="cm-row">' +
          '<span class="cm-label">Mock #:</span>' +
          '<input class="cm-input num cm-mock-num" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="3" placeholder="1" style="width:70px;">' +
          '<select class="cm-select cm-mock-exp">'+EXPIRY_OPTIONS.map(function(o){return '<option value="'+o.v+'">'+o.label+'</option>';}).join('')+'</select>' +
          '<button class="cm-btn cm-gen-mock" data-skill="'+sk.key+'"'+(canEdit?'':' disabled')+'>+ Generate</button>' +
        '</div>' +
        rows +
      '</div>';
    }).join('');

    body.innerHTML =
      disabledHint +
      '<div id="cmFlash"></div>' +
      '<h4 style="margin:4px 0 10px;font:700 14px system-ui;">VIP Codes (whole-center access)</h4>' +
      '<div class="cm-grid2">' + vipHtml + '</div>' +
      '<h4 style="margin:18px 0 10px;font:700 14px system-ui;">Per-Mock Codes (single-test access)</h4>' +
      mockHtml;

    // Click-to-copy
    body.querySelectorAll('[data-copy]').forEach(function(el){
      el.onclick = function(){
        var v = el.dataset.copy;
        navigator.clipboard.writeText(v).then(function(){ flash('ok', 'Copied: ' + v); });
      };
    });

    // VIP renew
    body.querySelectorAll('.cm-renew-vip').forEach(function(b){
      b.onclick = async function(){
        var type = b.dataset.type;
        var exp = body.querySelector('.cm-vip-exp[data-type="'+type+'"]').value;
        if (!confirm('Generate a NEW '+type+' VIP code? The old one will stop working immediately.')) return;
        b.disabled = true; b.textContent = '⏳';
        var r = await call('renew_vip', { center: state.currentCenter, type: type, expiry: expiryToISO(exp) });
        if (r.ok) { flash('ok', 'New '+type+' code: '+r.code); renderTab(); }
        else { flash('err', r.error||'Failed'); b.disabled=false; b.textContent='↻ Renew'; }
      };
    });
    body.querySelectorAll('.cm-revoke-vip').forEach(function(b){
      b.onclick = async function(){
        if (!confirm('Revoke the '+b.dataset.type+' VIP code?')) return;
        var r = await call('revoke_vip', { center: state.currentCenter, type: b.dataset.type });
        if (r.ok) { flash('ok','Revoked'); renderTab(); } else flash('err', r.error||'Failed');
      };
    });

    // Numeric-only enforcement on mock # inputs
    body.querySelectorAll('.cm-mock-num').forEach(function(inp){
      inp.addEventListener('input', function(){ inp.value = inp.value.replace(/\D/g,'').slice(0,3); });
    });

    // Generate mock
    body.querySelectorAll('.cm-gen-mock').forEach(function(b){
      b.onclick = async function(){
        var skill = b.dataset.skill;
        var card = b.closest('.cm-card');
        var num = parseInt(card.querySelector('.cm-mock-num').value, 10);
        var exp = card.querySelector('.cm-mock-exp').value;
        if (!num || num < 1) { flash('err','Enter mock number'); return; }
        b.disabled = true; b.textContent = '⏳';
        var r = await call('renew_mock', { center: state.currentCenter, skill: skill, mock_number: num, expiry: expiryToISO(exp) });
        if (r.ok) { flash('ok', skill+' mock #'+num+' code: '+r.code); renderTab(); }
        else { flash('err', r.error||'Failed'); b.disabled=false; b.textContent='+ Generate'; }
      };
    });

    body.querySelectorAll('.cm-renew-mock').forEach(function(b){
      b.onclick = async function(){
        var skill = b.dataset.skill, num = parseInt(b.dataset.num,10);
        if (!confirm('Renew '+skill+' mock #'+num+'? Old code stops working.')) return;
        var r = await call('renew_mock', { center: state.currentCenter, skill: skill, mock_number: num });
        if (r.ok) { flash('ok','New code: '+r.code); renderTab(); } else flash('err', r.error||'Failed');
      };
    });
    body.querySelectorAll('.cm-revoke-mock').forEach(function(b){
      b.onclick = async function(){
        if (!confirm('Revoke this mock code?')) return;
        var r = await call('revoke_mock', { center: state.currentCenter, skill: b.dataset.skill, mock_number: parseInt(b.dataset.num,10) });
        if (r.ok) { flash('ok','Revoked'); renderTab(); } else flash('err', r.error||'Failed');
      };
    });
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
        '<h4>🔑 Set per-center admin passcode</h4>' +
        '<div class="cm-row">' +
          '<select class="cm-select" id="cmPcCenter">' +
            state.centers.map(function(c){ return '<option value="'+c.id+'">'+escapeHtml(c.display_name||c.id)+'</option>'; }).join('') +
          '</select>' +
          '<input class="cm-input num" id="cmPcNew" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="8" placeholder="4–8 digits">' +
          '<button class="cm-btn" id="cmSetPc">Save</button>' +
        '</div>' +
      '</div>' +
      '<div class="cm-card">' +
        '<h4>🛡️ Change SUPER-admin passcode</h4>' +
        '<div class="cm-row">' +
          '<input class="cm-input num" id="cmPcSuper" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="8" placeholder="4–8 digits">' +
          '<button class="cm-btn danger" id="cmSetSuper">Replace super-admin passcode</button>' +
        '</div>' +
        '<div class="cm-meta">⚠️ You will be logged out and must re-enter the new passcode.</div>' +
      '</div>';

    body.querySelectorAll('input.num').forEach(function(inp){
      inp.addEventListener('input', function(){ inp.value = inp.value.replace(/\D/g,'').slice(0,8); });
    });

    document.getElementById('cmAddCenter').onclick = async function(){
      var id = document.getElementById('cmNewCenterId').value.trim().toLowerCase().replace(/[^a-z0-9]/g,'');
      var name = document.getElementById('cmNewCenterName').value.trim() || id;
      if (!id) { flash('err','Need an id'); return; }
      var r = await call('add_center', { id: id, displayName: name });
      if (r.ok) { flash('ok','Added'); var c = await call('list_centers',{}); state.centers = c.centers||[]; renderMain(); }
      else flash('err', r.error||'Failed');
    };

    document.getElementById('cmSetPc').onclick = async function(){
      var c = document.getElementById('cmPcCenter').value;
      var p = document.getElementById('cmPcNew').value;
      if (!/^\d{4,8}$/.test(p)) { flash('err','4–8 digits'); return; }
      var r = await call('set_admin_passcode', { center: c, newPasscode: p });
      flash(r.ok?'ok':'err', r.ok?'Saved':(r.error||'Failed'));
      if (r.ok) document.getElementById('cmPcNew').value = '';
    };

    document.getElementById('cmSetSuper').onclick = async function(){
      var p = document.getElementById('cmPcSuper').value;
      if (!/^\d{4,8}$/.test(p)) { flash('err','4–8 digits'); return; }
      if (!confirm('Replace SUPER-admin passcode? Make sure you remember it.')) return;
      var r = await call('set_admin_passcode', { center: '__super__', newPasscode: p });
      if (r.ok) {
        flash('ok','Replaced. Logging out…');
        setTimeout(function(){
          sessionStorage.removeItem(SS_KEY); sessionStorage.removeItem(ROLE_KEY);
          state.role=null; state.centers=[]; renderGate();
        }, 800);
      } else flash('err', r.error||'Failed');
    };
  }

  /* -------------------------------------------------------------- utils */
  function escapeHtml(s) {
    return String(s==null?'':s).replace(/[&<>"']/g, function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }
  function errMsg(e) { return '<div class="cm-msg err">⚠️ ' + escapeHtml(e||'Failed') + '</div>'; }
  function flash(kind, text) {
    var el = document.getElementById('cmFlash');
    if (!el) return;
    el.innerHTML = '<div class="cm-msg '+kind+'">'+escapeHtml(text)+'</div>';
    setTimeout(function(){ if (el.firstChild) el.firstChild.style.opacity = '0.4'; }, 2200);
    setTimeout(function(){ el.innerHTML = ''; }, 4000);
  }

  /* -------------------------------------------------------------- expose */
  window.openCodesPanel = show;
  window.codesPanel = { open: show, hide: hide, call: call };
})();
