// ═══════════════════════════════════════════════════════════════════════
// AI Grading Router — admin host panel (Phase 6-E pilot).
// Per-center, per-skill AI routing mode: API only / GEMMA 4 / BOTH.
// Writes to site_settings.ai_routing_mode_<skill>_<centerId>.
//
// landing.html keeps its own inline copy of this logic (lines 28091-28249)
// so the legacy /landing.html?openSiteMgmt=1 → AI Grading Router flow
// stays byte-for-byte untouched.
//
// Exposes window.AdminPanels.aiRouter.open(container).
// ═══════════════════════════════════════════════════════════════════════
(function () {
  var _inlineContainer = null;
  var _SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var _SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';

  var _colors = { api: '#2563eb', gemma4: '#16a34a', both: '#7c3aed' };
  var _labels = { api: '☁️ API', gemma4: '🦙 GEMMA 4', both: '🔀 BOTH' };
  var _skillLabels = { writing: '✍️ Writing', speaking: '🎤 Speaking' };

  function _renderRow(centerId, brandName, writingMode, speakingMode) {
    var safeId = centerId.replace(/[^a-zA-Z0-9_]/g, '_');
    var row = document.createElement('div');
    row.style.cssText = 'border:1.5px solid #e5e7eb;border-radius:12px;overflow:hidden;background:#fff;';
    row.id = 'aiRouterRow_' + safeId;

    var header = '<div style="background:#f9fafb;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;">' +
      '<div>' +
        '<div style="font-weight:700;font-size:14px;color:#111;">' + (brandName || centerId) + '</div>' +
        '<div style="font-size:11px;color:#9ca3af;">' + centerId + '</div>' +
      '</div>' +
    '</div>';

    function _skillRow(skill, borderTop) {
      var bt = borderTop ? 'border-top:1px solid #e5e7eb;' : '';
      var html = '<div style="' + bt + '">' +
        '<div style="padding:6px 14px 4px;font-size:11px;font-weight:600;color:#6b7280;background:#fafafa;border-bottom:1px solid #f3f4f6;">' +
          _skillLabels[skill] +
          (skill === 'speaking' ? ' <span style="font-size:10px;color:#d97706;font-weight:400;">(transcription always via API)</span>' : '') +
        '</div>' +
        '<div style="display:flex;">';
      ['api', 'gemma4', 'both'].forEach(function (m, i) {
        var borderR = i < 2 ? 'border-right:1px solid #e5e7eb;' : '';
        html += '<button id="aiRouterRowBtn_' + safeId + '_' + skill + '_' + m + '" ' +
          'onclick="setAiRoutingModeForCenter(\'' + centerId + '\',\'' + safeId + '\',\'' + skill + '\',\'' + m + '\')" ' +
          'style="flex:1;padding:9px 4px;border:none;background:#fff;cursor:pointer;font-weight:600;font-size:12px;transition:all .15s;' + borderR + '">' +
          _labels[m] + '</button>';
      });
      html += '</div></div>';
      return html;
    }

    row.innerHTML = header + _skillRow('writing', true) + _skillRow('speaking', true);
    _applyRowUI(safeId, 'writing', writingMode || 'api');
    _applyRowUI(safeId, 'speaking', speakingMode || 'api');
    return row;
  }

  function _applyRowUI(safeId, skill, mode) {
    ['api', 'gemma4', 'both'].forEach(function (m) {
      var btn = document.getElementById('aiRouterRowBtn_' + safeId + '_' + skill + '_' + m);
      if (!btn) return;
      if (m === mode) {
        btn.style.background = _colors[m];
        btn.style.color = '#fff';
        btn.style.fontWeight = '700';
      } else {
        btn.style.background = '#fff';
        btn.style.color = '#374151';
        btn.style.fontWeight = '600';
      }
    });
  }

  async function openPanel() {
    var container = _inlineContainer;
    if (!container) return; // admin-host mode only — legacy stays in landing.html
    container.innerHTML =
      '<div style="background:#fff;border-radius:14px;border:1px solid var(--ring,#e5e7eb);overflow:hidden;">' +
        '<div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:16px 20px;color:#fff;">' +
          '<h3 style="margin:0;font-size:17px;font-weight:700;">🤖 AI Grading Router</h3>' +
        '</div>' +
        '<div style="padding:16px 20px;">' +
          '<p style="margin:0 0 14px;font-size:13px;color:#6b7280;">Set AI grading mode per center. Changes apply instantly.</p>' +
          '<div id="aiRouterCentersList" style="display:flex;flex-direction:column;gap:12px;">' +
            '<div style="text-align:center;padding:24px;color:#9ca3af;font-size:13px;">Loading centers...</div>' +
          '</div>' +
          '<p style="margin:14px 0 0;font-size:11px;color:#9ca3af;">☁️ API Only = paid cloud APIs &nbsp;|&nbsp; 🦙 GEMMA 4 = local laptop &nbsp;|&nbsp; 🔀 BOTH = laptop first, fallback to paid API</p>' +
        '</div>' +
      '</div>';

    var list = document.getElementById('aiRouterCentersList');
    try {
      var r1 = await fetch(_SB_URL + '/rest/v1/site_settings?key=like.center_site_config_*&select=key,value', {
        headers: { 'apikey': _SB_KEY, 'Authorization': 'Bearer ' + _SB_KEY }
      });
      var cfgRows = await r1.json();

      var r2 = await fetch(_SB_URL + '/rest/v1/site_settings?key=like.ai_routing_mode_*&select=key,value', {
        headers: { 'apikey': _SB_KEY, 'Authorization': 'Bearer ' + _SB_KEY }
      });
      var modeRows = await r2.json();
      var writingMap = {}, speakingMap = {};
      if (Array.isArray(modeRows)) modeRows.forEach(function (r) {
        var k = r.key;
        if (k.startsWith('ai_routing_mode_writing_')) writingMap[k.replace('ai_routing_mode_writing_', '')] = r.value;
        else if (k.startsWith('ai_routing_mode_speaking_')) speakingMap[k.replace('ai_routing_mode_speaking_', '')] = r.value;
        else { var id = k.replace('ai_routing_mode_', ''); if (!writingMap[id]) writingMap[id] = r.value; if (!speakingMap[id]) speakingMap[id] = r.value; }
      });

      var centers = [{ id: 'mock_stream', brand: 'Mock Stream (Main Site)' }];
      if (Array.isArray(cfgRows)) {
        cfgRows.forEach(function (r) {
          var id = r.key.replace('center_site_config_', '');
          if (id === 'mock_stream') return;
          var cfg = {};
          try { cfg = typeof r.value === 'string' ? JSON.parse(r.value) : r.value; } catch (e) {}
          centers.push({ id: id, brand: cfg.brandName || id });
        });
      }

      list.innerHTML = '';
      centers.forEach(function (c) {
        var row = _renderRow(c.id, c.brand, writingMap[c.id] || 'api', speakingMap[c.id] || 'api');
        list.appendChild(row);
      });
    } catch (e) {
      list.innerHTML = '<div style="color:#ef4444;padding:16px;font-size:13px;">Failed to load centers. Please try again.</div>';
    }
  }

  async function setAiRoutingModeForCenter(centerId, safeId, skill, mode) {
    var key = 'ai_routing_mode_' + skill + '_' + centerId;
    ['api', 'gemma4', 'both'].forEach(function (m) {
      var b = document.getElementById('aiRouterRowBtn_' + safeId + '_' + skill + '_' + m);
      if (b) b.style.opacity = '0.5';
    });
    try {
      var patchResp = await fetch(_SB_URL + '/rest/v1/site_settings?key=eq.' + key, {
        method: 'PATCH',
        headers: { 'apikey': _SB_KEY, 'Authorization': 'Bearer ' + _SB_KEY,
          'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify({ value: mode, updated_at: new Date().toISOString() })
      });
      var patchData = await patchResp.json();
      if (!patchData || patchData.length === 0) {
        await fetch(_SB_URL + '/rest/v1/site_settings', {
          method: 'POST',
          headers: { 'apikey': _SB_KEY, 'Authorization': 'Bearer ' + _SB_KEY,
            'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify({ key: key, value: mode })
        });
      }
      ['api', 'gemma4', 'both'].forEach(function (m) {
        var b = document.getElementById('aiRouterRowBtn_' + safeId + '_' + skill + '_' + m);
        if (b) b.style.opacity = '1';
      });
      _applyRowUI(safeId, skill, mode);
    } catch (e) {
      ['api', 'gemma4', 'both'].forEach(function (m) {
        var b = document.getElementById('aiRouterRowBtn_' + safeId + '_' + skill + '_' + m);
        if (b) { b.style.opacity = '1'; b.title = 'Save failed!'; }
      });
    }
  }

  // Expose for inline onclick attributes (browsers resolve against window).
  window.setAiRoutingModeForCenter = setAiRoutingModeForCenter;

  window.AdminPanels = window.AdminPanels || {};
  window.AdminPanels.aiRouter = {
    open: function (container) {
      _inlineContainer = container || null;
      return openPanel();
    }
  };
})();
