// ═══════════════════════════════════════════════════════════════════════
// Writing Plus — admin host panel (Phase 6-E pilot).
// Source: landing.html lines 28800-29222. Extracted as IIFE; landing.html
// keeps its inline copy so the legacy Site Management grid → Writing
// Plus flow remains byte-for-byte intact.
//
// Reuses the .ru-* CSS chrome (overlay/panel/header/list/empty) so the
// markup the original _ensureWpOverlay produces paints identically.
// If registered-users.js has already injected #ruPanelStyles, we skip
// our duplicate inject; otherwise we drop in the minimal subset WP needs.
//
// Inline-mount mode:  window.AdminPanels.writingPlus.open(container)
//   - skips the passcode gate (admin.html host already verified super-admin)
//   - renders the panel directly into `container` (no fixed overlay)
// ═══════════════════════════════════════════════════════════════════════
(function () {
  var _inlineContainer = null;
  var _siteAdminUnlocked = false;
  var _wpStylesInjected = false;

  function _wpInjectStyles() {
    if (_wpStylesInjected) return;
    if (document.getElementById('ruPanelStyles') || document.getElementById('wpPanelStyles')) {
      _wpStylesInjected = true; return;
    }
    var s = document.createElement('style');
    s.id = 'wpPanelStyles';
    s.textContent = [
      '.ru-overlay{position:fixed;inset:0;z-index:10100;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .25s ease;}',
      '.ru-overlay.active{opacity:1;pointer-events:auto;}',
      '.ru-panel{background:var(--surface,#fff);border-radius:16px;width:94vw;max-width:560px;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden;}',
      '.ru-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--ring,#e5e7eb);background:linear-gradient(135deg,#6366f122,#818cf822);}',
      '.ru-header h3{margin:0;font-size:16px;font-weight:700;}',
      '.ru-close{background:none;border:none;font-size:22px;cursor:pointer;color:var(--ink,#333);line-height:1;}',
      '.ru-search{margin:0;padding:10px 14px;border:1px solid var(--ring,#e5e7eb);border-radius:10px;font-size:14px;outline:none;background:var(--surface,#fff);color:var(--ink,#333);}',
      '.ru-search:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,0.15);}',
      '.ru-list{flex:1;overflow-y:auto;padding:0 16px 16px;display:flex;flex-direction:column;gap:10px;}',
      '.ru-empty{text-align:center;padding:32px 0;color:#aaa;font-size:14px;}'
    ].join('\n');
    document.head.appendChild(s);
    _wpStylesInjected = true;
  }

    var _wpAdminUnlocked = false;

    function _showWpPasscode() {
      var existing = document.getElementById('wpPasscodeOverlay');
      if (existing) { existing.classList.add('active'); document.getElementById('wpPasscodeInput').value = ''; document.getElementById('wpPasscodeInput').focus(); return; }
      var div = document.createElement('div');
      div.id = 'wpPasscodeOverlay';
      div.className = 'ru-overlay';
      div.style.zIndex = '10150';
      div.onclick = function(e) { if (e.target === div) _closeWpPasscode(); };
      div.innerHTML = '<div style="background:var(--surface,#fff);border-radius:16px;padding:28px 24px;width:90vw;max-width:360px;box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center;">' +
        '<div style="font-size:28px;margin-bottom:8px;">🔐</div>' +
        '<h3 style="margin:0 0 4px;font-size:16px;">Admin Access Required</h3>' +
        '<p style="margin:0 0 16px;font-size:13px;color:#888;">Enter passcode to view Writing Plus submissions</p>' +
        '<input type="password" id="wpPasscodeInput" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code" placeholder="••••••••" maxlength="20" style="width:100%;padding:12px 14px;border:1px solid var(--ring,#e5e7eb);border-radius:10px;font-size:15px;text-align:center;outline:none;background:var(--surface,#fff);color:var(--ink,#333);box-sizing:border-box;" onkeypress="if(event.key===\'Enter\')_verifyWpPasscode()">' +
        '<div id="wpPasscodeError" style="min-height:20px;margin:8px 0;font-size:13px;color:#f87171;"></div>' +
        '<button id="wpPasscodeBtn" onclick="_verifyWpPasscode()" style="width:100%;padding:12px;border:none;border-radius:10px;background:linear-gradient(135deg,#0d9488,#115e59);color:#fff;font-weight:600;font-size:14px;cursor:pointer;">Unlock</button>' +
        '<button onclick="_closeWpPasscode()" style="margin-top:8px;background:none;border:none;color:#888;font-size:13px;cursor:pointer;">Cancel</button>' +
        '</div>';
      document.body.appendChild(div);
      setTimeout(function() { div.classList.add('active'); document.getElementById('wpPasscodeInput').focus(); }, 10);
    }

    function _closeWpPasscode() {
      var el = document.getElementById('wpPasscodeOverlay');
      if (el) el.classList.remove('active');
    }

    async function _verifyWpPasscode() {
      var input = document.getElementById('wpPasscodeInput');
      var error = document.getElementById('wpPasscodeError');
      var btn = document.getElementById('wpPasscodeBtn');
      var code = (input.value || '').trim();
      if (!code) { error.textContent = '❌ Please enter a passcode'; return; }
      btn.disabled = true; btn.textContent = '⏳ Verifying...';
      error.textContent = '';
      try {
        var resp = await fetch('https://admin0709.alwaysdata.net/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passcode: code, type: 'bsb', validate: true, timestamp: Date.now(), source: 'writing-plus', center: ((window.SITE_CONFIG&&window.SITE_CONFIG.testIdentifier)||'mock_stream').replace(/_/g,'') })
        });
        if (!resp.ok) throw new Error('Server error');
        var data = await resp.json();
        if (data.access) {
          _wpAdminUnlocked = true;
          _closeWpPasscode();
          openWritingPlusPanel();
        } else { throw new Error('Invalid'); }
      } catch (e) {
        error.textContent = '❌ Incorrect passcode';
        input.value = ''; input.focus();
      } finally {
        btn.disabled = false; btn.textContent = 'Unlock';
      }
    }

    function _ensureWpOverlay() {
      if (document.getElementById('wpOverlay')) return;
      var div = document.createElement('div');
      div.id = 'wpOverlay';
      div.className = 'ru-overlay';
      div.onclick = function(e) { if (e.target === div) closeWritingPlusPanel(); };
      div.innerHTML = '<div class="ru-panel" style="max-width:800px;">' +
        '<div class="ru-header" style="background:linear-gradient(135deg,#0d9488,#115e59);"><h3 style="color:#fff;">✏️ Writing Plus Submissions</h3><button class="ru-close" onclick="closeWritingPlusPanel()">&times;</button></div>' +
        '<div style="padding:12px 16px;display:flex;gap:8px;align-items:center;border-bottom:1px solid var(--ring,#e5e7eb);">' +
          '<input class="ru-search" id="wpSearch" type="text" placeholder="Search by name..." style="margin:0;flex:1;" oninput="_filterWpList()">' +
          '<select id="wpStatusFilter" onchange="_filterWpList()" style="padding:8px 12px;border:1px solid var(--ring,#e5e7eb);border-radius:8px;font-size:13px;background:var(--surface,#fff);color:var(--ink,#333);cursor:pointer;"><option value="">All Status</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="draft">Draft</option><option value="deleted">Deleted</option></select>' +
          '<select id="wpCenterFilter" onchange="_filterWpList()" style="padding:8px 12px;border:1px solid var(--ring,#e5e7eb);border-radius:8px;font-size:13px;background:var(--surface,#fff);color:var(--ink,#333);cursor:pointer;"><option value="">All Centers</option></select>' +
          '<button onclick="_loadWpData()" style="padding:8px 14px;border:none;border-radius:8px;background:linear-gradient(135deg,#0d9488,#115e59);color:#fff;font-weight:600;font-size:12px;cursor:pointer;white-space:nowrap;">🔄 Refresh</button>' +
          '<button onclick="_wpToggleDeleteMode()" id="wpDeleteModeBtn" style="padding:8px 14px;border:none;border-radius:8px;background:#ef4444;color:#fff;font-weight:600;font-size:12px;cursor:pointer;white-space:nowrap;">🗑️ Delete</button>' +
        '</div>' +
        '<div id="wpBulkBar" style="display:none;padding:8px 16px;background:#fef2f2;border-bottom:1px solid #fca5a5;display:none;align-items:center;gap:8px;">' +
          '<button onclick="_wpSelectAll()" style="padding:6px 12px;border:1.5px solid #ef4444;border-radius:6px;background:#fff;color:#ef4444;font-weight:600;font-size:12px;cursor:pointer;">☑️ Select All</button>' +
          '<button onclick="_wpDeselectAll()" style="padding:6px 12px;border:1.5px solid #64748b;border-radius:6px;background:#fff;color:#64748b;font-weight:600;font-size:12px;cursor:pointer;">Deselect All</button>' +
          '<span id="wpSelectedCount" style="font-size:12px;color:#ef4444;font-weight:600;">0 selected</span>' +
          '<button onclick="_wpDeleteSelected()" id="wpDeleteSelBtn" style="margin-left:auto;padding:6px 14px;border:none;border-radius:6px;background:#ef4444;color:#fff;font-weight:700;font-size:12px;cursor:pointer;opacity:0.5;pointer-events:none;">🗑️ Delete Selected</button>' +
          '<button onclick="_wpToggleDeleteMode()" style="padding:6px 12px;border:1.5px solid #64748b;border-radius:6px;background:#fff;color:#64748b;font-weight:600;font-size:12px;cursor:pointer;">✕ Cancel</button>' +
        '</div>' +
        '<div id="wpStats" style="padding:8px 16px;font-size:12px;color:#64748b;"></div>' +
        '<div class="ru-list" id="wpList" style="padding:8px 16px;"><div class="ru-empty">Loading...</div></div>' +
        '</div>';
      document.body.appendChild(div);
    }

    var _wpData = [];
    var _wpDeleteMode = false;
    var _wpSelected = {};

    async function openWritingPlusPanel() {
      if (!_wpAdminUnlocked && !_siteAdminUnlocked) { _showWpPasscode(); return; }
      _ensureWpOverlay();
      document.getElementById('wpOverlay').classList.add('active');
      document.getElementById('wpList').innerHTML = '<div class="ru-empty">Loading...</div>';
      document.getElementById('wpSearch').value = '';
      document.getElementById('wpStatusFilter').value = '';
      document.getElementById('wpStats').textContent = '';
      await _loadWpData();
    }

    function closeWritingPlusPanel() {
      var el = document.getElementById('wpOverlay');
      if (el) el.classList.remove('active');
    }

    async function _loadWpData() {
      var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
      var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
      var listEl = document.getElementById('wpList');
      var statsEl = document.getElementById('wpStats');
      listEl.innerHTML = '<div class="ru-empty">⏳ Loading...</div>';
      try {
        var r = await fetch(SB_URL + '/rest/v1/writing_plus_submissions?status=neq.deleted&order=created_at.desc&limit=200', {
          headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        _wpData = await r.json();
        statsEl.textContent = _wpData.length + ' submission' + (_wpData.length !== 1 ? 's' : '') + ' found';
        // Populate center filter
        var centers = []; _wpData.forEach(function(row) { if (row.center && centers.indexOf(row.center) === -1) centers.push(row.center); });
        var cSel = document.getElementById('wpCenterFilter');
        if (cSel) { var cv = cSel.value; cSel.innerHTML = '<option value="">All Centers</option>' + centers.sort().map(function(c) { return '<option value="' + c + '">' + c + '</option>'; }).join(''); cSel.value = cv; }
        _renderWpList(_wpData);
      } catch (e) {
        listEl.innerHTML = '<div class="ru-empty">❌ Failed to load: ' + e.message + '</div>';
        _wpData = [];
      }
    }

    function _filterWpList() {
      var q = (document.getElementById('wpSearch').value || '').toLowerCase().trim();
      var status = document.getElementById('wpStatusFilter').value;
      var center = document.getElementById('wpCenterFilter') ? document.getElementById('wpCenterFilter').value : '';
      var filtered = _wpData.filter(function(row) {
        if (status && row.status !== status) return false;
        if (center && row.center !== center) return false;
        if (q && (row.student_name || '').toLowerCase().indexOf(q) === -1) return false;
        return true;
      });
      _renderWpList(filtered);
    }

    function _wpToggleDeleteMode() {
      _wpDeleteMode = !_wpDeleteMode;
      _wpSelected = {};
      var bar = document.getElementById('wpBulkBar');
      var btn = document.getElementById('wpDeleteModeBtn');
      if (_wpDeleteMode) {
        bar.style.display = 'flex';
        btn.style.background = '#64748b'; btn.textContent = '✕ Cancel';
      } else {
        bar.style.display = 'none';
        btn.style.background = '#ef4444'; btn.textContent = '🗑️ Delete';
      }
      _wpUpdateSelectedCount();
      _filterWpList();
    }
    function _wpToggleSelect(id) {
      if (_wpSelected[id]) delete _wpSelected[id]; else _wpSelected[id] = true;
      var cb = document.getElementById('wpCb_' + id);
      if (cb) cb.checked = !!_wpSelected[id];
      _wpUpdateSelectedCount();
    }
    function _wpSelectAll() {
      var q = (document.getElementById('wpSearch').value || '').toLowerCase().trim();
      var status = document.getElementById('wpStatusFilter').value;
      var center = document.getElementById('wpCenterFilter') ? document.getElementById('wpCenterFilter').value : '';
      _wpData.forEach(function(row) {
        if (status && row.status !== status) return;
        if (center && row.center !== center) return;
        if (q && (row.student_name || '').toLowerCase().indexOf(q) === -1) return;
        _wpSelected[row.id] = true;
      });
      _wpUpdateSelectedCount();
      _filterWpList();
    }
    function _wpDeselectAll() {
      _wpSelected = {};
      _wpUpdateSelectedCount();
      _filterWpList();
    }
    function _wpUpdateSelectedCount() {
      var cnt = Object.keys(_wpSelected).length;
      var el = document.getElementById('wpSelectedCount');
      var btn = document.getElementById('wpDeleteSelBtn');
      if (el) el.textContent = cnt + ' selected';
      if (btn) { btn.style.opacity = cnt > 0 ? '1' : '0.5'; btn.style.pointerEvents = cnt > 0 ? 'auto' : 'none'; }
    }
    function _wpConfirm(msg) {
      return new Promise(function(resolve) {
        var ov = document.createElement('div');
        ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10300;display:flex;align-items:center;justify-content:center;padding:20px;';
        ov.onclick = function(e) { if (e.target === ov) { ov.remove(); resolve(false); } };
        var card = document.createElement('div');
        card.style.cssText = 'background:#fff;border-radius:16px;padding:28px 24px;max-width:380px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.25);';
        card.innerHTML = '<div style="font-size:40px;margin-bottom:12px;">⚠️</div>' +
          '<h3 style="margin:0 0 8px;font-size:17px;color:#1e293b;">Are you sure?</h3>' +
          '<p style="margin:0 0 20px;font-size:14px;color:#64748b;line-height:1.5;">' + msg + '</p>' +
          '<div style="display:flex;gap:10px;justify-content:center;">' +
            '<button id="_wpConfirmCancel" style="flex:1;padding:10px;border:1.5px solid #e5e7eb;border-radius:10px;background:#fff;color:#64748b;font-weight:600;font-size:14px;cursor:pointer;">Cancel</button>' +
            '<button id="_wpConfirmOk" style="flex:1;padding:10px;border:none;border-radius:10px;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;font-weight:700;font-size:14px;cursor:pointer;box-shadow:0 4px 12px rgba(239,68,68,0.3);">Delete</button>' +
          '</div>';
        ov.appendChild(card);
        document.body.appendChild(ov);
        card.querySelector('#_wpConfirmCancel').onclick = function() { ov.remove(); resolve(false); };
        card.querySelector('#_wpConfirmOk').onclick = function() { ov.remove(); resolve(true); };
      });
    }

    async function _wpDeleteSelected() {
      var ids = Object.keys(_wpSelected);
      if (!ids.length) return;
      var confirmed = await _wpConfirm('Permanently delete <strong>' + ids.length + ' submission' + (ids.length !== 1 ? 's' : '') + '</strong>? This cannot be undone.');
      if (!confirmed) return;
      var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
      var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
      var btn = document.getElementById('wpDeleteSelBtn');
      if (btn) { btn.textContent = '⏳ Deleting...'; btn.style.pointerEvents = 'none'; }
      try {
        for (var i = 0; i < ids.length; i++) {
          var r = await fetch(SB_URL + '/rest/v1/writing_plus_submissions?id=eq.' + ids[i], {
            method: 'DELETE',
            headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Prefer': 'return=representation' }
          });
          var deleted = r.ok ? await r.json() : [];
          if (!deleted.length) {
            await fetch(SB_URL + '/rest/v1/writing_plus_submissions?id=eq.' + ids[i], {
              method: 'PATCH',
              headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'deleted' })
            });
          }
        }
      } catch(e) { console.warn('WP bulk delete error:', e); }
      _wpSelected = {};
      _wpToggleDeleteMode();
      await _loadWpData();
    }

    function _renderWpList(rows) {
      var listEl = document.getElementById('wpList');
      if (!rows.length) { listEl.innerHTML = '<div class="ru-empty">No submissions found</div>'; return; }
      var statusColors = { pending: '#f59e0b', approved: '#10b981', draft: '#6366f1', deleted: '#ef4444' };
      listEl.innerHTML = rows.map(function(row) {
        var sc = statusColors[row.status] || '#64748b';
        var tasks = row.tasks || [];
        var scores = row.scores || [];
        var fmt = (row.exam_format || '').toUpperCase();
        var date = new Date(row.created_at);
        var dateStr = String(date.getDate()).padStart(2,'0') + '.' + String(date.getMonth()+1).padStart(2,'0') + '.' + date.getFullYear();
        var timeStr = String(date.getHours()).padStart(2,'0') + ':' + String(date.getMinutes()).padStart(2,'0');
        var centerLabel = (row.center || 'unknown').replace(/([A-Z])/g,' $1').trim();
        // Try to get AI scores from scores array
        var aiResult = (scores[0] && scores[0].aiResult) || null;
        var scoreDisplay = '-';
        if (aiResult && aiResult.certificate_score !== undefined) {
          scoreDisplay = aiResult.certificate_score + '/75 · ' + (aiResult.cefr_level || '');
        } else if (scores.length) {
          var avg = scores.reduce(function(s,x){ return s + (x.score||0); }, 0) / scores.length;
          scoreDisplay = avg.toFixed(1);
        }
        var cbHtml = _wpDeleteMode ? '<input type="checkbox" id="wpCb_' + row.id + '" ' + (_wpSelected[row.id] ? 'checked' : '') + ' onclick="_wpToggleSelect(\'' + row.id + '\')" style="width:18px;height:18px;cursor:pointer;accent-color:#ef4444;flex-shrink:0;">' : '';
        return '<div style="border:1.5px solid ' + (_wpDeleteMode && _wpSelected[row.id] ? '#ef4444' : '#e5e7eb') + ';border-radius:12px;padding:14px;margin-bottom:10px;background:' + (_wpDeleteMode && _wpSelected[row.id] ? '#fef2f2' : '#fafafa') + ';transition:all 0.15s ease;cursor:' + (_wpDeleteMode ? 'pointer' : 'default') + ';" ' + (_wpDeleteMode ? 'onclick="_wpToggleSelect(\'' + row.id + '\')"' : 'onmouseenter="this.style.borderColor=\'#0d9488\'" onmouseleave="this.style.borderColor=\'#e5e7eb\'"') + '>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">' +
            '<div style="display:flex;align-items:center;gap:8px;min-width:0;">' + cbHtml +
              '<strong style="font-size:14px;">' + (row.student_name || 'Unknown').replace(/</g,'&lt;') + '</strong>' +
              '<span style="background:' + sc + ';color:#fff;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">' + (row.status || 'pending') + '</span>' +
              '<span style="background:#e0e7ff;color:#3730a3;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:600;">' + centerLabel + '</span>' +
            '</div>' +
            '<div style="font-size:12px;color:#64748b;">' + dateStr + ' ' + timeStr + '</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;flex-wrap:wrap;gap:8px;">' +
            '<div style="display:flex;gap:4px;flex-wrap:wrap;">' +
              tasks.map(function(t) {
                return '<span style="background:#e0f2fe;color:#0369a1;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;">' + ((t.label || t.id) + '').replace(/</g,'&lt;') + '</span>';
              }).join('') +
              '<span style="background:#f0fdfa;color:#0d9488;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;">' + scoreDisplay + '</span>' +
            '</div>' +
            '<div style="display:flex;gap:4px;flex-wrap:wrap;">' +
              '<button onclick="_viewWpDetail(\'' + row.id + '\')" style="background:#0d9488;color:#fff;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">👁️ View</button>' +
              (row.status !== 'approved' ? '<button onclick="_updateWpStatus(\'' + row.id + '\',\'approved\')" style="background:#10b981;color:#fff;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">✅</button>' : '') +
              (row.status !== 'draft' ? '<button onclick="_updateWpStatus(\'' + row.id + '\',\'draft\')" style="background:#6366f1;color:#fff;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">📌</button>' : '') +
              (row.status !== 'deleted' ? '<button onclick="_updateWpStatus(\'' + row.id + '\',\'deleted\')" style="background:#ef4444;color:#fff;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">🗑️</button>' : '') +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    async function _updateWpStatus(id, status) {
      var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
      var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
      if (status === 'deleted') {
        var confirmed = await _wpConfirm('Permanently delete this submission? This cannot be undone.');
        if (!confirmed) return;
        try {
          var r = await fetch(SB_URL + '/rest/v1/writing_plus_submissions?id=eq.' + id, {
            method: 'DELETE',
            headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Prefer': 'return=representation' }
          });
          var deleted = r.ok ? await r.json() : [];
          if (!deleted.length) {
            await fetch(SB_URL + '/rest/v1/writing_plus_submissions?id=eq.' + id, {
              method: 'PATCH',
              headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'deleted' })
            });
          }
        } catch(e) { console.warn('WP delete error:', e); }
        await _loadWpData();
      } else {
        try {
          var r = await fetch(SB_URL + '/rest/v1/writing_plus_submissions?id=eq.' + id, {
            method: 'PATCH',
            headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status })
          });
          if (r.ok) await _loadWpData();
        } catch(e) { console.warn('WP status update failed:', e); }
      }
    }

    async function _viewWpDetail(id) {
      var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
      var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
      try {
        var r = await fetch(SB_URL + '/rest/v1/writing_plus_submissions?id=eq.' + id, {
          headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
        });
        var rows = await r.json();
        if (!rows.length) return;
        var row = rows[0];
        var tasks = row.tasks || [];
        var scores = row.scores || [];
        var aiResult = (scores[0] && scores[0].aiResult) || null;
        var esc = function(s) { return (s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };

        var html = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">';
        html += '<h3 style="color:#0d9488;margin:0;">' + esc(row.student_name || 'Unknown') + '</h3>';
        html += '<span style="font-size:12px;color:#64748b;">' + (row.exam_format || '').toUpperCase() + ' · ' + (row.exam_mode || '') + ' · ' + (row.center || '') + ' · ' + new Date(row.created_at).toLocaleDateString() + '</span>';
        html += '</div>';

        // AI Scores grid
        if (aiResult && aiResult.raw_score !== undefined) {
          html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;">';
          html += '<div style="background:linear-gradient(135deg,#116a60,#0d9488);padding:14px;border-radius:10px;text-align:center;color:white;"><div style="font-size:12px;opacity:0.85;">Raw Score</div><div style="font-size:22px;font-weight:800;">' + (aiResult.raw_score||0) + '/16</div></div>';
          html += '<div style="background:linear-gradient(135deg,#3b82f6,#2563eb);padding:14px;border-radius:10px;text-align:center;color:white;"><div style="font-size:12px;opacity:0.85;">Certificate</div><div style="font-size:22px;font-weight:800;">' + (aiResult.certificate_score||0) + '/75</div></div>';
          html += '<div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:14px;border-radius:10px;text-align:center;color:white;"><div style="font-size:12px;opacity:0.85;">CEFR</div><div style="font-size:22px;font-weight:800;">' + esc(aiResult.cefr_level||'N/A') + '</div></div>';
          html += '</div>';
        }

        // Per-task details
        var taskColors = [{ border:'#f59e0b', bg:'#fef3c7', dark:'#92400e' }, { border:'#3b82f6', bg:'#dbeafe', dark:'#1e40af' }, { border:'#8b5cf6', bg:'#ede9fe', dark:'#5b21b6' }];
        tasks.forEach(function(t, i) {
          var tc = taskColors[i] || taskColors[0];
          var aiKey = i === 0 ? 't11' : i === 1 ? 't12' : 't2';
          var taskScore = aiResult ? aiResult[aiKey + '_score'] : null;
          var maxScore = i < 2 ? 5 : 6;
          var relevance = aiResult ? aiResult[aiKey + '_relevance'] : null;
          var feedback = aiResult ? aiResult[aiKey + '_feedback'] : null;
          var corrected = aiResult ? aiResult[aiKey + '_corrected'] : null;
          var sample = aiResult ? aiResult[aiKey + '_sample'] : null;

          html += '<div style="border:2px solid ' + tc.border + ';border-radius:10px;overflow:hidden;margin-bottom:12px;">';
          html += '<div style="background:' + tc.bg + ';padding:10px 14px;display:flex;justify-content:space-between;align-items:center;">';
          html += '<strong style="color:' + tc.dark + ';font-size:14px;">📝 ' + esc(t.label || t.id) + '</strong>';
          html += '<div style="display:flex;align-items:center;gap:8px;">';
          if (taskScore !== null && taskScore !== undefined) html += '<span style="font-weight:700;font-size:15px;color:' + tc.dark + ';">' + taskScore + '/' + maxScore + '</span>';
          if (relevance) html += '<span style="font-size:10px;padding:2px 8px;border-radius:10px;background:' + (relevance === 'ON-TOPIC' ? '#dcfce7;color:#166534' : '#fee2e2;color:#991b1b') + ';font-weight:700;">' + esc(relevance) + '</span>';
          html += '</div></div>';
          html += '<div style="padding:12px 14px;background:#fff;">';

          // Prompt
          html += '<div style="margin-bottom:8px;"><div style="font-size:11px;font-weight:700;color:#64748b;margin-bottom:4px;">PROMPT:</div><div style="background:#f8fafc;padding:8px 10px;border-radius:6px;font-size:12px;line-height:1.5;white-space:pre-wrap;max-height:120px;overflow-y:auto;border:1px solid #e5e7eb;">' + esc(t.prompt || '-') + '</div></div>';

          // Graph
          if (t.graph_url) html += '<div style="margin-bottom:8px;"><img src="' + t.graph_url + '" style="max-width:100%;border-radius:8px;border:1px solid #e5e7eb;" alt="Graph"></div>';

          // Answer
          html += '<div style="margin-bottom:8px;"><div style="font-size:11px;font-weight:700;color:#64748b;margin-bottom:4px;">ANSWER:</div><div style="background:#fff;padding:10px;border:1.5px solid #e5e7eb;border-radius:6px;font-size:13px;line-height:1.7;white-space:pre-wrap;max-height:200px;overflow-y:auto;font-family:\'Times New Roman\',serif;">' + esc(t.answer || '-') + '</div></div>';

          // Corrected text
          if (corrected) {
            html += '<div style="margin-bottom:8px;"><div style="font-size:11px;font-weight:700;color:#dc2626;margin-bottom:4px;">CORRECTED TEXT:</div><div style="background:' + tc.bg + ';padding:10px;border-radius:6px;font-size:12px;line-height:1.8;white-space:pre-wrap;max-height:200px;overflow-y:auto;">' + esc(corrected) + '</div></div>';
          }

          // Feedback
          if (feedback) {
            html += '<div style="margin-bottom:8px;background:#fef2f2;border:1.5px solid #fca5a5;border-radius:6px;padding:10px;"><div style="font-size:11px;font-weight:700;color:#dc2626;margin-bottom:4px;">📌 EXAMINER NOTE:</div><div style="font-size:12px;line-height:1.6;color:#333;">' + esc(feedback) + '</div></div>';
          }

          // Sample answer
          if (sample) {
            html += '<details style="border:1.5px solid #10b981;border-radius:6px;overflow:hidden;"><summary style="background:#ecfdf5;padding:8px 12px;cursor:pointer;font-weight:700;color:#065f46;font-size:11px;">📖 Sample Answer</summary><div style="padding:10px 12px;background:#f0fdf4;font-size:12px;color:#064e3b;line-height:1.6;white-space:pre-wrap;">' + esc(sample) + '</div></details>';
          }

          html += '</div></div>';
        });

        // Overall feedback
        if (aiResult && aiResult.overall_feedback) {
          html += '<div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:2px solid #22c55e;border-radius:10px;padding:14px;margin-bottom:12px;"><div style="font-size:11px;font-weight:700;color:#166534;margin-bottom:6px;">📊 OVERALL ASSESSMENT:</div><div style="font-size:13px;color:#15803d;line-height:1.6;">' + esc(aiResult.overall_feedback) + '</div></div>';
        }

        // Raw feedback fallback
        if (!aiResult && scores[0] && scores[0].rawFeedback) {
          html += '<div style="background:#f8fafc;border:1.5px solid #e5e7eb;border-radius:10px;padding:14px;white-space:pre-wrap;font-size:13px;line-height:1.7;">' + esc(scores[0].rawFeedback) + '</div>';
        }

        html += '<div style="text-align:right;margin-top:16px;"><button onclick="this.closest(\'.admin-modal-overlay\').remove()" style="background:#64748b;color:#fff;border:none;padding:8px 20px;border-radius:8px;cursor:pointer;font-weight:600;">Close</button></div>';

        // Show overlay
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:10200;display:flex;align-items:center;justify-content:center;padding:20px;';
        overlay.className = 'admin-modal-overlay';
        overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
        var card = document.createElement('div');
        card.style.cssText = 'background:#fff;border-radius:16px;padding:24px;max-width:750px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,0.2);';
        card.innerHTML = html;
        overlay.appendChild(card);
        document.body.appendChild(overlay);
      } catch(e) { console.warn('WP view failed:', e); }
    }

  // ── Inline-mount adaptation ─────────────────────────────────────────
  var _origOpenWp = openWritingPlusPanel;
  openWritingPlusPanel = async function () {
    if (!_inlineContainer && !_wpAdminUnlocked && !_siteAdminUnlocked) {
      _showWpPasscode();
      return;
    }
    _wpInjectStyles();
    if (_inlineContainer) {
      // Render the panel body directly into the host container; no fixed
      // overlay. Layout mirrors _ensureWpOverlay's inner .ru-panel chunk.
      _inlineContainer.innerHTML =
        '<div class="ru-panel sp-inline-panel" style="width:100%;max-width:100%;max-height:none;box-shadow:0 1px 3px rgba(0,0,0,0.06);border:1px solid var(--ring,#e5e7eb);">' +
          '<div class="ru-header" style="background:linear-gradient(135deg,#0d9488,#115e59);">' +
            '<h3 style="color:#fff;">✏️ Writing Plus Submissions</h3>' +
          '</div>' +
          '<div style="padding:12px 16px;display:flex;gap:8px;align-items:center;border-bottom:1px solid var(--ring,#e5e7eb);flex-wrap:wrap;">' +
            '<input class="ru-search" id="wpSearch" type="text" placeholder="Search by name..." style="margin:0;flex:1;min-width:160px;" oninput="_filterWpList()">' +
            '<select id="wpStatusFilter" onchange="_filterWpList()" style="padding:8px 12px;border:1px solid var(--ring,#e5e7eb);border-radius:8px;font-size:13px;background:var(--surface,#fff);color:var(--ink,#333);cursor:pointer;"><option value="">All Status</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="draft">Draft</option><option value="deleted">Deleted</option></select>' +
            '<select id="wpCenterFilter" onchange="_filterWpList()" style="padding:8px 12px;border:1px solid var(--ring,#e5e7eb);border-radius:8px;font-size:13px;background:var(--surface,#fff);color:var(--ink,#333);cursor:pointer;"><option value="">All Centers</option></select>' +
            '<button onclick="_loadWpData()" style="padding:8px 14px;border:none;border-radius:8px;background:linear-gradient(135deg,#0d9488,#115e59);color:#fff;font-weight:600;font-size:12px;cursor:pointer;white-space:nowrap;">🔄 Refresh</button>' +
            '<button onclick="_wpToggleDeleteMode()" id="wpDeleteModeBtn" style="padding:8px 14px;border:none;border-radius:8px;background:#ef4444;color:#fff;font-weight:600;font-size:12px;cursor:pointer;white-space:nowrap;">🗑️ Delete</button>' +
          '</div>' +
          '<div id="wpBulkBar" style="display:none;padding:8px 16px;background:#fef2f2;border-bottom:1px solid #fca5a5;align-items:center;gap:8px;flex-wrap:wrap;">' +
            '<button onclick="_wpSelectAll()" style="padding:6px 12px;border:1.5px solid #ef4444;border-radius:6px;background:#fff;color:#ef4444;font-weight:600;font-size:12px;cursor:pointer;">☑️ Select All</button>' +
            '<button onclick="_wpDeselectAll()" style="padding:6px 12px;border:1.5px solid #64748b;border-radius:6px;background:#fff;color:#64748b;font-weight:600;font-size:12px;cursor:pointer;">Deselect All</button>' +
            '<span id="wpSelectedCount" style="font-size:12px;color:#ef4444;font-weight:600;">0 selected</span>' +
            '<button onclick="_wpDeleteSelected()" id="wpDeleteSelBtn" style="margin-left:auto;padding:6px 14px;border:none;border-radius:6px;background:#ef4444;color:#fff;font-weight:700;font-size:12px;cursor:pointer;opacity:0.5;pointer-events:none;">🗑️ Delete Selected</button>' +
            '<button onclick="_wpToggleDeleteMode()" style="padding:6px 12px;border:1.5px solid #64748b;border-radius:6px;background:#fff;color:#64748b;font-weight:600;font-size:12px;cursor:pointer;">✕ Cancel</button>' +
          '</div>' +
          '<div id="wpStats" style="padding:8px 16px;font-size:12px;color:#64748b;"></div>' +
          '<div class="ru-list" id="wpList" style="padding:8px 16px;"><div class="ru-empty">Loading...</div></div>' +
        '</div>';
    } else {
      _ensureWpOverlay();
      document.getElementById('wpOverlay').classList.add('active');
      document.getElementById('wpList').innerHTML = '<div class="ru-empty">Loading...</div>';
      document.getElementById('wpSearch').value = '';
      document.getElementById('wpStatusFilter').value = '';
      document.getElementById('wpStats').textContent = '';
    }
    await _loadWpData();
  };

  // Expose inline-onclick targets (window-resolved by browsers).
  window._showWpPasscode      = _showWpPasscode;
  window._closeWpPasscode     = _closeWpPasscode;
  window._verifyWpPasscode    = _verifyWpPasscode;
  window.openWritingPlusPanel = openWritingPlusPanel;
  window.closeWritingPlusPanel= closeWritingPlusPanel;
  window._filterWpList        = _filterWpList;
  window._loadWpData          = _loadWpData;
  window._wpToggleDeleteMode  = _wpToggleDeleteMode;
  window._wpToggleSelect      = _wpToggleSelect;
  window._wpSelectAll         = _wpSelectAll;
  window._wpDeselectAll       = _wpDeselectAll;
  window._wpDeleteSelected    = _wpDeleteSelected;
  window._viewWpDetail        = _viewWpDetail;
  window._updateWpStatus      = _updateWpStatus;

  window.AdminPanels = window.AdminPanels || {};
  window.AdminPanels.writingPlus = {
    open: function (container) {
      _inlineContainer = container || null;
      return openWritingPlusPanel();
    }
  };
})();
