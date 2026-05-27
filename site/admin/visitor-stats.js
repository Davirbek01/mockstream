/* ════════════════════════════════════════════════════════════════════
   Visitor Statistics admin panel
   ───────────────────────────────────────────────────────────────────
   Calls the admin-only RPC `landing_visit_stats(p_days)` and renders:
     • Headline totals: today, yesterday, last 7 days, last 30 days.
     • Line chart of total visitors per day (last 30 days).
     • Per-clone breakdown table (today + last 7 days side-by-side).
     • Raw per-day table (collapsible).
   The student-facing landing-v3 counter is unaffected by anything
   below — this entire module loads only when the admin clicks
   "Visitor Statistics" in the sidebar.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';

  // Map center_id → human label. Falls back to the raw id for any
  // centre not listed here.
  var CENTER_LABELS = {
    'mock_stream': 'Mock Stream (main)',
    'bek':         'Bekzods Multilevel',
    'niners':      'Niners Academy',
    'global':      'Global Education',
    'muzaffars':   'Muzaffars English',
    'achievers':   'Achievers Mocks',
    'record':      'Multilevel Record'
  };
  function _label(cid) {
    if (!cid) return 'Unknown / legacy';
    return CENTER_LABELS[cid] || cid;
  }

  // Get the JWT for the current session so we can hit the RPC as an
  // authenticated user (anon JWT would fail the is_any_admin() check).
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

  async function _fetchStats(days) {
    var jwt = await _accessToken();
    var headers = {
      apikey: SB_KEY,
      Authorization: 'Bearer ' + (jwt || SB_KEY),
      'Content-Type': 'application/json'
    };
    var r = await fetch(SB_URL + '/rest/v1/rpc/landing_visit_stats', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ p_days: days })
    });
    if (!r.ok) {
      var txt = '';
      try { txt = await r.text(); } catch (_e) {}
      throw new Error('stats RPC ' + r.status + ': ' + txt);
    }
    return r.json();
  }

  // Group raw rows by day → total, and by (day → center_id → count).
  function _aggregate(rows) {
    var byDay = {};
    var byDayCenter = {};
    var byCenterTotal = {};
    rows.forEach(function (row) {
      var d = row.day;
      var c = row.center_id || '';
      var n = Number(row.visitors) || 0;
      byDay[d] = (byDay[d] || 0) + n;
      byDayCenter[d] = byDayCenter[d] || {};
      byDayCenter[d][c] = (byDayCenter[d][c] || 0) + n;
      byCenterTotal[c] = (byCenterTotal[c] || 0) + n;
    });
    return { byDay: byDay, byDayCenter: byDayCenter, byCenterTotal: byCenterTotal };
  }

  function _todayStrTashkent() {
    // Build "YYYY-MM-DD" matching Asia/Tashkent (UTC+5) without a TZ lib.
    var nowUtc = Date.now();
    var tashkent = new Date(nowUtc + 5 * 3600 * 1000);
    var y = tashkent.getUTCFullYear();
    var m = String(tashkent.getUTCMonth() + 1).padStart(2, '0');
    var d = String(tashkent.getUTCDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }
  function _addDays(yyyymmdd, delta) {
    var t = new Date(yyyymmdd + 'T00:00:00Z');
    t.setUTCDate(t.getUTCDate() + delta);
    var y = t.getUTCFullYear();
    var m = String(t.getUTCMonth() + 1).padStart(2, '0');
    var d = String(t.getUTCDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  // SVG line chart — no external library. Renders into a fixed-size
  // viewBox so it scales with its container. Each day is a point; we
  // draw a polyline + filled area below it + axis labels.
  function _renderChart(container, byDay, days) {
    var today = _todayStrTashkent();
    var series = [];
    for (var i = days - 1; i >= 0; i--) {
      var d = _addDays(today, -i);
      series.push({ day: d, n: byDay[d] || 0 });
    }
    var max = Math.max.apply(null, series.map(function (p) { return p.n; }).concat([5]));
    var W = 1000, H = 260;
    var PAD_L = 44, PAD_R = 12, PAD_T = 14, PAD_B = 28;
    var plotW = W - PAD_L - PAD_R;
    var plotH = H - PAD_T - PAD_B;
    function x(i) { return PAD_L + (series.length === 1 ? plotW / 2 : (i * plotW / (series.length - 1))); }
    function y(n) { return PAD_T + plotH - (n / max) * plotH; }

    var points = series.map(function (p, i) { return x(i) + ',' + y(p.n); }).join(' ');
    var areaPts = 'M ' + x(0) + ',' + (PAD_T + plotH) + ' L ' +
                  series.map(function (p, i) { return x(i) + ',' + y(p.n); }).join(' L ') +
                  ' L ' + x(series.length - 1) + ',' + (PAD_T + plotH) + ' Z';

    // Y-axis gridlines at 25/50/75/100% of max.
    var grid = [0.25, 0.5, 0.75, 1].map(function (frac) {
      var yy = PAD_T + plotH - frac * plotH;
      var v = Math.round(max * frac);
      return '<line x1="' + PAD_L + '" x2="' + (W - PAD_R) + '" y1="' + yy + '" y2="' + yy + '" stroke="#e2e8f0" stroke-width="1" />' +
             '<text x="' + (PAD_L - 6) + '" y="' + (yy + 3) + '" text-anchor="end" fill="#94a3b8" font-size="10">' + v + '</text>';
    }).join('');

    // X-axis labels: every ~5 days for readability.
    var labelEvery = Math.max(1, Math.floor(series.length / 7));
    var xLabels = series.map(function (p, i) {
      if (i % labelEvery !== 0 && i !== series.length - 1) return '';
      var short = p.day.slice(5);  // MM-DD
      return '<text x="' + x(i) + '" y="' + (H - 10) + '" text-anchor="middle" fill="#64748b" font-size="10.5">' + short + '</text>';
    }).join('');

    // Dots on each point
    var dots = series.map(function (p, i) {
      return '<circle cx="' + x(i) + '" cy="' + y(p.n) + '" r="3" fill="#6366f1" />' +
             '<title>' + p.day + ' — ' + p.n + ' visitor' + (p.n === 1 ? '' : 's') + '</title>';
    }).join('');

    container.innerHTML =
      '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" ' +
        'style="width:100%;height:260px;display:block;background:#fff;border:1px solid #e2e8f0;border-radius:12px;">' +
        grid +
        '<path d="' + areaPts + '" fill="rgba(99,102,241,0.10)" />' +
        '<polyline points="' + points + '" fill="none" stroke="#6366f1" stroke-width="2" />' +
        dots +
        xLabels +
      '</svg>';
  }

  function _renderHeadlines(container, byDay) {
    var today = _todayStrTashkent();
    function rangeTotal(daysBack) {
      var sum = 0;
      for (var i = 0; i < daysBack; i++) sum += (byDay[_addDays(today, -i)] || 0);
      return sum;
    }
    var todayN = byDay[today] || 0;
    var yestN  = byDay[_addDays(today, -1)] || 0;
    var w7     = rangeTotal(7);
    var d30    = rangeTotal(30);
    var tiles = [
      { label: 'Today',          n: todayN, sub: 'so far (Asia/Tashkent)' },
      { label: 'Yesterday',      n: yestN,  sub: '' },
      { label: 'Last 7 days',    n: w7,     sub: 'rolling' },
      { label: 'Last 30 days',   n: d30,    sub: 'rolling' }
    ];
    container.innerHTML =
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:18px;">' +
        tiles.map(function (t) {
          return '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:14px 16px;">' +
                   '<div style="font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#94a3b8;">' + t.label + '</div>' +
                   '<div style="font-size:26px;font-weight:800;color:#0f172a;margin:6px 0 2px;">' + t.n.toLocaleString('en-US') + '</div>' +
                   '<div style="font-size:11.5px;color:#94a3b8;">' + (t.sub || '&nbsp;') + '</div>' +
                 '</div>';
        }).join('') +
      '</div>';
  }

  function _renderCenterTable(container, byDayCenter, byCenterTotal) {
    var today = _todayStrTashkent();
    var centersToday = byDayCenter[today] || {};

    // 7-day totals per center
    var byCenter7d = {};
    for (var i = 0; i < 7; i++) {
      var d = _addDays(today, -i);
      var dayMap = byDayCenter[d] || {};
      Object.keys(dayMap).forEach(function (c) {
        byCenter7d[c] = (byCenter7d[c] || 0) + dayMap[c];
      });
    }
    // Build the full set of center ids (today + 7d + all-time)
    var allCenters = {};
    Object.keys(centersToday).forEach(function (c) { allCenters[c] = true; });
    Object.keys(byCenter7d).forEach(function (c) { allCenters[c] = true; });
    var rows = Object.keys(allCenters).sort(function (a, b) {
      return (byCenter7d[b] || 0) - (byCenter7d[a] || 0);
    });

    if (!rows.length) {
      container.innerHTML = '<p style="color:#64748b;font-style:italic;">No per-clone data yet.</p>';
      return;
    }

    container.innerHTML =
      '<table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">' +
        '<thead><tr style="background:#f8fafc;">' +
          '<th style="text-align:left;padding:10px 14px;font-size:12px;font-weight:700;color:#475569;border-bottom:1px solid #e2e8f0;">Clone</th>' +
          '<th style="text-align:right;padding:10px 14px;font-size:12px;font-weight:700;color:#475569;border-bottom:1px solid #e2e8f0;">Today</th>' +
          '<th style="text-align:right;padding:10px 14px;font-size:12px;font-weight:700;color:#475569;border-bottom:1px solid #e2e8f0;">Last 7 days</th>' +
        '</tr></thead><tbody>' +
        rows.map(function (cid) {
          var t = centersToday[cid] || 0;
          var w = byCenter7d[cid] || 0;
          return '<tr>' +
                   '<td style="padding:9px 14px;border-bottom:1px solid #f1f5f9;color:#0f172a;font-weight:500;">' + _label(cid) + '</td>' +
                   '<td style="padding:9px 14px;border-bottom:1px solid #f1f5f9;text-align:right;color:#0f172a;font-weight:600;">' + t.toLocaleString('en-US') + '</td>' +
                   '<td style="padding:9px 14px;border-bottom:1px solid #f1f5f9;text-align:right;color:#64748b;">' + w.toLocaleString('en-US') + '</td>' +
                 '</tr>';
        }).join('') +
      '</tbody></table>';
  }

  function _renderRawTable(container, byDay) {
    var today = _todayStrTashkent();
    var rows = [];
    for (var i = 0; i < 30; i++) {
      var d = _addDays(today, -i);
      rows.push({ day: d, n: byDay[d] || 0 });
    }
    container.innerHTML =
      '<details style="margin-top:18px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:0;">' +
        '<summary style="cursor:pointer;padding:12px 16px;font-weight:600;color:#0f172a;list-style:none;">📋 Show per-day raw table (last 30 days)</summary>' +
        '<table style="width:100%;border-collapse:collapse;border-top:1px solid #e2e8f0;">' +
          '<thead><tr style="background:#f8fafc;">' +
            '<th style="text-align:left;padding:8px 14px;font-size:12px;color:#475569;">Day (Asia/Tashkent)</th>' +
            '<th style="text-align:right;padding:8px 14px;font-size:12px;color:#475569;">Visitors</th>' +
          '</tr></thead><tbody>' +
          rows.map(function (r) {
            return '<tr><td style="padding:7px 14px;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:13px;">' + r.day + '</td>' +
                   '<td style="padding:7px 14px;border-bottom:1px solid #f1f5f9;text-align:right;color:#64748b;">' + r.n.toLocaleString('en-US') + '</td></tr>';
          }).join('') +
        '</tbody></table>' +
      '</details>';
  }

  async function open(container) {
    container.innerHTML =
      '<div style="max-width:980px;">' +
        '<h2 style="margin:0 0 6px;font-size:20px;font-weight:700;color:#0f172a;">Visitor Statistics</h2>' +
        '<p style="margin:0 0 18px;color:#64748b;font-size:13.5px;">' +
          'Unique visitors to <code>landing-v3.html</code> across all 7 sites. ' +
          'Days roll over at Tashkent midnight (UTC+5). Data starts ' +
          '2026-05-27 (the day the counter went live).' +
        '</p>' +
        '<div id="vsHeadlines"><div style="color:#64748b;">Loading…</div></div>' +
        '<h3 style="margin:20px 0 10px;font-size:14px;color:#475569;font-weight:600;text-transform:uppercase;letter-spacing:.04em;">Last 30 days</h3>' +
        '<div id="vsChart"><div style="color:#64748b;">Loading chart…</div></div>' +
        '<h3 style="margin:20px 0 10px;font-size:14px;color:#475569;font-weight:600;text-transform:uppercase;letter-spacing:.04em;">Per clone</h3>' +
        '<div id="vsCenters"><div style="color:#64748b;">Loading…</div></div>' +
        '<div id="vsRaw"></div>' +
      '</div>';

    try {
      var rows = await _fetchStats(30);
      var agg = _aggregate(rows);
      _renderHeadlines(document.getElementById('vsHeadlines'), agg.byDay);
      _renderChart(document.getElementById('vsChart'), agg.byDay, 30);
      _renderCenterTable(document.getElementById('vsCenters'), agg.byDayCenter, agg.byCenterTotal);
      _renderRawTable(document.getElementById('vsRaw'), agg.byDay);
    } catch (e) {
      container.innerHTML =
        '<div style="background:#fff;border:1px solid #fca5a5;border-radius:12px;padding:18px;color:#991b1b;">' +
          '<strong>Failed to load Visitor Statistics.</strong><br>' +
          '<code style="display:block;margin-top:8px;font-size:12px;white-space:pre-wrap;">' +
            String(e && e.message ? e.message : e).replace(/</g, '&lt;') +
          '</code>' +
        '</div>';
    }
  }

  window.AdminPanels = window.AdminPanels || {};
  window.AdminPanels.visitorStats = { open: open };
})();
