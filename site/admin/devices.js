/* ═══════════════════════════════════════════════════════════════════════════
   Devices admin panel — premium account device registry (phase 2)
   ───────────────────────────────────────────────────────────────────────────
   Renders device_admin_overview(): per premium account, the devices it uses
   across all five platforms, hardware-merged slot counts, and the four
   sharing signals (concurrency, impossible travel, IP spread, velocity)
   rolled into a risk score. Actions call device_admin_action().

   IMPORTANT CONTEXT
   • Detection is live everywhere; ENFORCEMENT is phase 3. A "blocked"
     status set here is recorded policy — students feel nothing until the
     device-gate ships. The banner in the panel says so.
   • Slot counts merge browsers on one machine via hardware_fp. "Raw ids"
     is shown separately because localStorage churn inflates it (one real
     account had 39 ids on 1 machine).
   • Scope: accounts on the premium panel's list only (premium_emails).
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';

  var CENTER_LABELS = {
    'mockstream': 'Mock Stream (main)',
    'bek':        'Bekzods Multilevel',
    'niners':     'Niners Academy',
    'global':     'Global Education',
    'muzaffars':  'Muzaffars English',
    'achievers':  'Achievers Mocks',
    'record':     'Multilevel Record'
  };
  var PLATFORM_ICON = { web: '🌐', android: '🤖', ios: '🍎', windows: '🪟', mac: '💻' };
  var DEFAULT_LIMIT = 3;

  function _esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function _label(cid) { return CENTER_LABELS[cid] || cid || '—'; }
  function _ago(iso) {
    if (!iso) return '—';
    var ms = Date.now() - new Date(iso).getTime();
    if (!isFinite(ms)) return '—';
    var d = Math.floor(ms / 86400000);
    if (d > 30) return Math.floor(d / 30) + 'mo ago';
    if (d >= 1) return d + 'd ago';
    var h = Math.floor(ms / 3600000);
    if (h >= 1) return h + 'h ago';
    return Math.max(1, Math.floor(ms / 60000)) + 'min ago';
  }

  async function _accessToken() {
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

  async function _rpc(name, body) {
    var jwt = await _accessToken();
    var r = await fetch(SB_URL + '/rest/v1/rpc/' + name, {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        Authorization: 'Bearer ' + (jwt || SB_KEY),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body || {})
    });
    if (!r.ok) {
      var txt = '';
      try { txt = await r.text(); } catch (_e) {}
      throw new Error(name + ' ' + r.status + ': ' + txt);
    }
    return r.json();
  }

  // ── state ────────────────────────────────────────────────────────────────
  var _data = null;          // last overview payload
  var _centerFilter = '';    // '' = all
  var _expanded = {};        // email|center -> bool
  var _container = null;

  function _riskBadge(risk) {
    var bg = risk >= 5 ? '#fee2e2' : risk >= 3 ? '#fef3c7' : '#f1f5f9';
    var fg = risk >= 5 ? '#b91c1c' : risk >= 3 ? '#b45309' : '#64748b';
    var word = risk >= 5 ? 'HIGH' : risk >= 3 ? 'MEDIUM' : 'low';
    return '<span style="background:' + bg + ';color:' + fg + ';font-weight:800;font-size:11px;' +
           'padding:3px 8px;border-radius:999px;">' + word + ' · ' + risk + '</span>';
  }
  function _signalChips(a) {
    var chips = [];
    if (a.concurrency >= 2) chips.push('⚡ ' + a.concurrency + ' at once');
    if (a.impossible_travel) chips.push('✈️ 2 countries &lt;1h');
    if (a.ip_spread >= 6) chips.push('🌐 ' + a.ip_spread + ' networks/7d');
    if (a.velocity_48h >= 3) chips.push('🚀 ' + a.velocity_48h + ' new/48h');
    if (!chips.length) return '<span style="color:#94a3b8;">—</span>';
    return chips.map(function (c) {
      return '<span style="background:#fff7ed;color:#c2410c;font-size:11px;font-weight:700;' +
             'padding:2px 7px;border-radius:6px;margin-right:4px;white-space:nowrap;">' + c + '</span>';
    }).join('');
  }
  function _platformIcons(platforms) {
    return (platforms || []).map(function (p) {
      return '<span title="' + _esc(p) + '" style="font-size:15px;margin-right:2px;">' +
             (PLATFORM_ICON[p] || '❓') + '</span>';
    }).join('');
  }
  function _statusBadge(a) {
    if (a.policy_status === 'blocked') {
      return '<span style="background:#fee2e2;color:#b91c1c;font-size:11px;font-weight:800;padding:3px 8px;border-radius:6px;">⛔ BLOCKED' +
             (a.policy_scope === 'all' ? ' (all centres)' : '') + '</span>';
    }
    if (a.policy_status === 'exempt') {
      return '<span style="background:#dcfce7;color:#15803d;font-size:11px;font-weight:800;padding:3px 8px;border-radius:6px;">∞ unlimited</span>';
    }
    if (a.policy_max) {
      return '<span style="background:#e0f2fe;color:#0369a1;font-size:11px;font-weight:800;padding:3px 8px;border-radius:6px;">limit ' + a.policy_max + '</span>';
    }
    return '<span style="color:#94a3b8;font-size:11px;">limit ' + DEFAULT_LIMIT + '</span>';
  }

  // ── actions ──────────────────────────────────────────────────────────────
  async function _act(action, email, center, value, reason) {
    try {
      await _rpc('device_admin_action', {
        p_action: action, p_email: email, p_center: center,
        p_value: value == null ? null : String(value), p_reason: reason || null
      });
      await _load();
    } catch (e) {
      alert('Action failed: ' + (e && e.message ? e.message : e));
    }
  }
  function _promptBlock(email, center) {
    var reason = prompt('Reason for blocking ' + email + ' (required):');
    if (reason == null) return;                     // cancelled
    if (!reason.trim()) { alert('A reason is required.'); return; }
    var all = confirm('Block on ALL centres?\nOK = all centres · Cancel = ' + _label(center) + ' only');
    _act('block', email, center, all ? 'all' : 'center', reason.trim());
  }
  function _promptLimit(email, center) {
    var v = prompt('Custom device limit for ' + email + ' (number, empty = back to default ' + DEFAULT_LIMIT + '):');
    if (v == null) return;
    v = v.trim();
    if (v !== '' && (!/^\d+$/.test(v) || parseInt(v, 10) < 1)) { alert('Enter a whole number ≥ 1, or leave empty.'); return; }
    var reason = prompt('Reason for the custom limit (required):');
    if (reason == null) return;
    if (!reason.trim()) { alert('A reason is required.'); return; }
    _act('set_limit', email, center, v === '' ? null : v, reason.trim());
  }
  function _promptExempt(email, center) {
    var reason = prompt('Reason for UNLIMITED devices for ' + email + ' (required — e.g. legal agreement):');
    if (reason == null) return;
    if (!reason.trim()) { alert('A reason is required.'); return; }
    _act('exempt', email, center, null, reason.trim());
  }

  // ── render ───────────────────────────────────────────────────────────────
  function _deviceRows(a) {
    return (a.devices || []).map(function (d) {
      var revoked = !!d.blocked_at;
      return '<tr style="border-top:1px solid #f1f5f9;' + (revoked ? 'opacity:.5;' : '') + '">' +
        '<td style="padding:6px 8px;font-size:15px;">' + (PLATFORM_ICON[d.platform] || '❓') + '</td>' +
        '<td style="padding:6px 8px;font-size:12px;color:#334155;">' + _esc(d.label || d.platform) + '</td>' +
        '<td style="padding:6px 8px;font-size:11px;color:#94a3b8;font-family:monospace;" title="' + _esc(d.device_key) + '">' +
          _esc(String(d.device_key).slice(0, 18)) + '…</td>' +
        '<td style="padding:6px 8px;font-size:11px;color:#64748b;">' + _esc(d.geo || '—') + '</td>' +
        '<td style="padding:6px 8px;font-size:11px;color:#64748b;white-space:nowrap;">' + _ago(d.first_seen) + '</td>' +
        '<td style="padding:6px 8px;font-size:11px;color:#334155;white-space:nowrap;font-weight:600;">' + _ago(d.last_seen) + '</td>' +
        '<td style="padding:6px 8px;">' +
          (revoked
            ? '<button data-unrevoke="' + _esc(d.device_key) + '" style="font-size:11px;padding:3px 8px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;cursor:pointer;">undo revoke</button>'
            : '<button data-revoke="' + _esc(d.device_key) + '" style="font-size:11px;padding:3px 8px;border:1px solid #fecaca;color:#b91c1c;border-radius:6px;background:#fff;cursor:pointer;">revoke</button>') +
        '</td></tr>';
    }).join('');
  }

  function _accountCard(a) {
    var key = a.email + '|' + a.center_id;
    var open = !!_expanded[key];
    var over = a.slots > (a.policy_status === 'exempt' ? Infinity : (a.policy_max || DEFAULT_LIMIT));
    // Roster row with no observed devices yet: compact grey card, no expand.
    if (a.seen === false) {
      return '<div style="background:#fafafa;border:1px dashed #e2e8f0;border-radius:12px;margin-bottom:6px;' +
        'display:flex;align-items:center;gap:12px;padding:8px 14px;opacity:.75;">' +
        '<div style="min-width:210px;flex:1;">' +
          '<span style="font-weight:600;color:#475569;font-size:13px;">' + _esc(a.email) + '</span> ' +
          '<span style="font-size:11px;color:#94a3b8;">' + _esc(_label(a.center_id)) + '</span>' +
        '</div>' +
        '<span style="font-size:11px;color:#94a3b8;font-style:italic;">no devices seen yet</span>' +
        '<div>' + _statusBadge(a) + '</div>' +
      '</div>';
    }
    return '<div data-card="' + _esc(key) + '" style="background:#fff;border:1px solid ' +
      (over ? '#fca5a5' : '#e2e8f0') + ';border-radius:12px;margin-bottom:10px;overflow:hidden;">' +
      '<div data-toggle="' + _esc(key) + '" style="display:flex;align-items:center;gap:12px;padding:12px 14px;cursor:pointer;flex-wrap:wrap;">' +
        '<div style="min-width:210px;flex:1;">' +
          '<div style="font-weight:700;color:#0f172a;font-size:13.5px;">' + _esc(a.email) + '</div>' +
          '<div style="font-size:11px;color:#94a3b8;">' + _esc(_label(a.center_id)) + ' · last seen ' + _ago(a.last_seen) + '</div>' +
        '</div>' +
        '<div style="text-align:center;min-width:70px;">' +
          '<div style="font-weight:800;font-size:18px;color:' + (over ? '#b91c1c' : '#0f172a') + ';">' + a.slots + '</div>' +
          '<div style="font-size:10px;color:#94a3b8;">devices (' + a.raw_devices + ' ids)</div>' +
        '</div>' +
        '<div style="min-width:90px;">' + _platformIcons(a.platforms) + '</div>' +
        '<div style="flex:1;min-width:150px;">' + _signalChips(a) + '</div>' +
        '<div>' + _riskBadge(a.risk) + '</div>' +
        '<div>' + _statusBadge(a) + '</div>' +
        '<div style="color:#94a3b8;font-size:12px;">' + (open ? '▲' : '▼') + '</div>' +
      '</div>' +
      (open ? (
        '<div style="border-top:1px solid #f1f5f9;padding:10px 14px;background:#f8fafc;">' +
          (a.policy_reason
            ? '<div style="font-size:11.5px;color:#64748b;margin-bottom:8px;">📝 <b>Note:</b> ' + _esc(a.policy_reason) + '</div>' : '') +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">' +
            (a.policy_status === 'blocked'
              ? '<button data-allow="1" style="font-size:12px;font-weight:700;padding:6px 12px;border:1px solid #86efac;color:#15803d;border-radius:8px;background:#fff;cursor:pointer;">✓ Unblock</button>'
              : '<button data-block="1" style="font-size:12px;font-weight:700;padding:6px 12px;border:1px solid #fecaca;color:#b91c1c;border-radius:8px;background:#fff;cursor:pointer;">⛔ Block account</button>') +
            '<button data-limit="1" style="font-size:12px;font-weight:700;padding:6px 12px;border:1px solid #bae6fd;color:#0369a1;border-radius:8px;background:#fff;cursor:pointer;">🔢 Set custom limit</button>' +
            (a.policy_status === 'exempt'
              ? '<button data-allow="1" style="font-size:12px;font-weight:700;padding:6px 12px;border:1px solid #cbd5e1;color:#334155;border-radius:8px;background:#fff;cursor:pointer;">Remove unlimited</button>'
              : '<button data-exempt="1" style="font-size:12px;font-weight:700;padding:6px 12px;border:1px solid #86efac;color:#15803d;border-radius:8px;background:#fff;cursor:pointer;">∞ Unlimited (agreement)</button>') +
          '</div>' +
          '<table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #f1f5f9;border-radius:8px;">' +
            '<thead><tr style="font-size:10px;text-transform:uppercase;letter-spacing:.04em;color:#94a3b8;">' +
              '<th style="padding:6px 8px;text-align:left;"></th><th style="padding:6px 8px;text-align:left;">Device</th>' +
              '<th style="padding:6px 8px;text-align:left;">Key</th><th style="padding:6px 8px;text-align:left;">Geo</th>' +
              '<th style="padding:6px 8px;text-align:left;">First</th><th style="padding:6px 8px;text-align:left;">Last</th><th></th>' +
            '</tr></thead><tbody>' + _deviceRows(a) + '</tbody></table>' +
        '</div>') : '') +
    '</div>';
  }

  function _render() {
    if (!_container || !_data) return;
    var accounts = (_data.accounts || []).filter(function (a) {
      return !_centerFilter || a.center_id === _centerFilter;
    });
    // seen accounts first (by risk, then slots); unseen roster rows trail
    accounts.sort(function (x, y) {
      var sx = x.seen === false ? 0 : 1, sy = y.seen === false ? 0 : 1;
      return (sy - sx) || (y.risk - x.risk) || (y.slots - x.slots) ||
             String(x.email).localeCompare(String(y.email));
    });
    var seen = accounts.filter(function (a) { return a.seen !== false; }).length;
    var over = accounts.filter(function (a) {
      return a.slots > (a.policy_status === 'exempt' ? Infinity : (a.policy_max || DEFAULT_LIMIT));
    }).length;

    var centers = {};
    (_data.accounts || []).forEach(function (a) { centers[a.center_id] = true; });
    var centerOpts = Object.keys(centers).sort().map(function (c) {
      return '<option value="' + _esc(c) + '"' + (c === _centerFilter ? ' selected' : '') + '>' + _esc(_label(c)) + '</option>';
    }).join('');

    var auto = _centerFilter && _data.centers && _data.centers[_centerFilter] &&
               _data.centers[_centerFilter].auto_block_enabled;

    _container.innerHTML =
      '<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:10px 14px;margin-bottom:14px;font-size:12.5px;color:#92400e;">' +
        '⚠️ <b>Detection is live; enforcement is not.</b> Blocks and limits set here are recorded policy — students feel nothing until the device-gate (phase 3) ships. Signals need app data: web history is backfilled, app devices appear as students update.' +
      '</div>' +
      '<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:14px;">' +
        '<select id="devCenterFilter" style="padding:7px 10px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;background:#fff;">' +
          '<option value="">All centres</option>' + centerOpts + '</select>' +
        (_centerFilter
          ? '<label style="display:flex;align-items:center;gap:6px;font-size:12.5px;color:#334155;cursor:pointer;">' +
              '<input type="checkbox" id="devAutoBlock"' + (auto ? ' checked' : '') + '> ' +
              'Auto-block over-limit accounts <span style="color:#94a3b8;">(bites in phase 3)</span></label>'
          : '<span style="font-size:12px;color:#94a3b8;">pick a centre to see its auto-block toggle</span>') +
        '<span style="margin-left:auto;font-size:12.5px;color:#64748b;">' +
          accounts.length + ' premium accounts · ' + seen + ' seen · <b style="color:' + (over ? '#b91c1c' : '#15803d') + ';">' + over + ' over limit</b></span>' +
      '</div>' +
      (accounts.length
        ? accounts.map(_accountCard).join('')
        : '<p style="color:#64748b;font-style:italic;">No device data' + (_centerFilter ? ' for this centre yet' : ' yet') + '.</p>');

    // wire events
    var sel = _container.querySelector('#devCenterFilter');
    if (sel) sel.onchange = function () { _centerFilter = sel.value; _render(); };
    var ab = _container.querySelector('#devAutoBlock');
    if (ab) ab.onchange = function () {
      _act('set_auto_block', null, _centerFilter, ab.checked ? 'on' : 'off', null);
    };
    _container.querySelectorAll('[data-toggle]').forEach(function (head) {
      head.addEventListener('click', function (ev) {
        if (ev.target.closest('button')) return;
        var k = head.getAttribute('data-toggle');
        _expanded[k] = !_expanded[k];
        _render();
      });
    });
    _container.querySelectorAll('[data-card]').forEach(function (card) {
      var k = card.getAttribute('data-card');
      var email = k.split('|')[0], center = k.split('|')[1];
      card.querySelectorAll('button').forEach(function (btn) {
        btn.addEventListener('click', function (ev) {
          ev.stopPropagation();
          if (btn.hasAttribute('data-block')) return _promptBlock(email, center);
          if (btn.hasAttribute('data-allow')) return _act('allow', email, center, null, null);
          if (btn.hasAttribute('data-limit')) return _promptLimit(email, center);
          if (btn.hasAttribute('data-exempt')) return _promptExempt(email, center);
          if (btn.hasAttribute('data-revoke')) return _act('revoke_device', email, center, btn.getAttribute('data-revoke'), null);
          if (btn.hasAttribute('data-unrevoke')) return _act('unrevoke_device', email, center, btn.getAttribute('data-unrevoke'), null);
        });
      });
    });
  }

  async function _load() {
    try {
      _data = await _rpc('device_admin_overview', {});
      _render();
    } catch (e) {
      if (_container) {
        _container.innerHTML = '<div style="color:#b91c1c;padding:20px;">Failed to load device data: ' +
          _esc(e && e.message ? e.message : e) + '</div>';
      }
    }
  }

  function open(container) {
    _container = container;
    container.innerHTML = '<div class="adm-loading"><div>Loading device registry…</div></div>';
    _load();
  }

  window.AdminPanels = window.AdminPanels || {};
  window.AdminPanels.devices = { open: open };
})();
