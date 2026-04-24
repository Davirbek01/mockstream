// ============================================================================
// SUPABASE SEND — Mock Stream
// ============================================================================
// Shared utility for saving exam results to Supabase (Database + Storage).
// Load AFTER site-config.js:  <script src="supabase-send.js"></script>
//
// Usage in any exam page:
//   var sb = await window.sendToSupabase({
//     studentName: 'John Doe',
//     examType:    'cefr',           // 'cefr' | 'ielts'
//     skill:       'reading',        // 'reading' | 'listening' | 'speaking' | 'writing' | 'full-mock'
//     score:       '55/75',          // display score string
//     level:       'B2',             // CEFR level
//     mockNumber:  'Mock 12',
//     file:        htmlBlob,         // Blob (HTML or ZIP)
//     fileType:    'html',           // 'html' | 'zip'
//     caption:     '...',            // Telegram caption for reference
//     metadata:    { ... }           // optional extra JSON
//   });
//   if (sb) caption = window.appendResultLink(caption, sb.viewUrl);
// ============================================================================

(function () {

  // ─── CONFIG (fill in after creating Supabase project) ─────────────────────
  var SUPABASE_URL      = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';

  // Public viewer URL — auto-detected from current domain
  // When running from file://, fall back to the configured siteDomain
  var _origin = window.location.origin;
  if (!_origin || _origin === 'null' || _origin === 'file://') {
    var _dom = (window.SITE_CONFIG && window.SITE_CONFIG.siteDomain) || 'mockstream.site';
    _origin = 'https://' + _dom;
  }
  var VIEWER_BASE = _origin + '/results/view.html';

  // ─── GLOBAL PROGRESS OVERLAY ──────────────────────────────────────────────
  // Auto-injects a floating progress bar visible during background operations.
  // API: window.msProgress.show(msg), .update(msg), .hide(), .success(msg)
  (function initProgressOverlay() {
    if (window.msProgress) return; // already initialised

    var style = document.createElement('style');
    style.textContent =
      '#ms-progress-overlay{position:fixed;top:0;left:0;right:0;z-index:2147483646;pointer-events:none;' +
      'opacity:0;transition:opacity .3s ease;font-family:"Segoe UI",system-ui,-apple-system,sans-serif}' +
      '#ms-progress-overlay.visible{opacity:1;pointer-events:auto}' +
      '#ms-progress-bar-track{height:3px;background:rgba(0,0,0,.06);width:100%}' +
      '#ms-progress-bar{height:100%;width:30%;background:linear-gradient(90deg,#6366f1,#8b5cf6,#6366f1);' +
      'border-radius:0 2px 2px 0;animation:ms-prog-slide 1.5s ease-in-out infinite}' +
      '@keyframes ms-prog-slide{0%{width:10%;margin-left:0}50%{width:50%;margin-left:25%}100%{width:10%;margin-left:90%}}' +
      '#ms-progress-pill{display:inline-flex;align-items:center;gap:8px;margin:10px auto 0;' +
      'padding:8px 18px;background:#fff;border-radius:24px;box-shadow:0 2px 12px rgba(0,0,0,.12);' +
      'font-size:13px;color:#334155;font-weight:500;position:relative;left:50%;transform:translateX(-50%);' +
      'max-width:90vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '#ms-progress-pill .ms-dot{width:8px;height:8px;border-radius:50%;background:#6366f1;' +
      'animation:ms-dot-pulse 1s ease-in-out infinite}' +
      '@keyframes ms-dot-pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}' +
      '#ms-progress-pill.success{background:#ecfdf5;color:#065f46}' +
      '#ms-progress-pill.success .ms-dot{background:#10b981;animation:none}' +
      '#ms-progress-pill.error{background:#fef2f2;color:#991b1b}' +
      '#ms-progress-pill.error .ms-dot{background:#ef4444;animation:none}' +
      '@media(prefers-color-scheme:dark){#ms-progress-bar-track{background:rgba(255,255,255,.08)}' +
      '#ms-progress-pill{background:#1e293b;color:#e2e8f0;box-shadow:0 2px 12px rgba(0,0,0,.4)}' +
      '#ms-progress-pill.success{background:#064e3b;color:#a7f3d0}' +
      '#ms-progress-pill.error{background:#450a0a;color:#fca5a5}}';
    (document.head || document.documentElement).appendChild(style);

    var overlay = document.createElement('div');
    overlay.id = 'ms-progress-overlay';
    overlay.innerHTML =
      '<div id="ms-progress-bar-track"><div id="ms-progress-bar"></div></div>' +
      '<div id="ms-progress-pill"><span class="ms-dot"></span><span id="ms-progress-msg">Working...</span></div>';

    function ensureMount() {
      if (!overlay.parentNode) {
        (document.body || document.documentElement).appendChild(overlay);
      }
    }

    var hideTimer = null;

    window.msProgress = {
      show: function (msg) {
        ensureMount();
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
        var pill = document.getElementById('ms-progress-pill');
        if (pill) { pill.className = ''; }
        document.getElementById('ms-progress-msg').textContent = msg || 'Working...';
        overlay.classList.add('visible');
      },
      update: function (msg) {
        var el = document.getElementById('ms-progress-msg');
        if (el) el.textContent = msg || 'Working...';
      },
      success: function (msg) {
        var el = document.getElementById('ms-progress-msg');
        if (el) el.textContent = msg || 'Done!';
        var pill = document.getElementById('ms-progress-pill');
        if (pill) pill.className = 'success';
        var bar = document.getElementById('ms-progress-bar');
        if (bar) bar.style.cssText = 'width:100%;margin-left:0;animation:none;background:#10b981';
        hideTimer = setTimeout(function () {
          overlay.classList.remove('visible');
          if (bar) bar.style.cssText = '';
          if (pill) pill.className = '';
        }, 2500);
      },
      error: function (msg) {
        var el = document.getElementById('ms-progress-msg');
        if (el) el.textContent = msg || 'Something went wrong';
        var pill = document.getElementById('ms-progress-pill');
        if (pill) pill.className = 'error';
        hideTimer = setTimeout(function () {
          overlay.classList.remove('visible');
          if (pill) pill.className = '';
        }, 4000);
      },
      hide: function () {
        overlay.classList.remove('visible');
        var bar = document.getElementById('ms-progress-bar');
        if (bar) bar.style.cssText = '';
        var pill = document.getElementById('ms-progress-pill');
        if (pill) pill.className = '';
      }
    };
  })();

  // ─── UUID GENERATOR ───────────────────────────────────────────────────────
  function uuid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  // ─── DEVICE INFO PARSER ────────────────────────────────────────────────
  function parseDeviceInfo() {
    var ua = navigator.userAgent || '';
    var info = { type: 'Desktop', os: 'Unknown', model: 'PC', browser: 'Unknown' };

    // Type
    if (/iPad|Tablet|PlayBook/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
      info.type = 'Tablet';
    } else if (/Mobile|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) {
      info.type = 'Mobile';
    }

    // OS
    if (/iPhone|iPad|iPod/i.test(ua)) {
      var iosV = ua.match(/OS (\d+[_\.]\d+)/);
      info.os = 'iOS' + (iosV ? ' ' + iosV[1].replace('_', '.') : '');
    } else if (/Android/i.test(ua)) {
      var avr = ua.match(/Android (\d+[\.\d]*)/);
      info.os = 'Android' + (avr ? ' ' + avr[1] : '');
    } else if (/Macintosh/i.test(ua)) { info.os = 'macOS'; }
    else if (/Windows/i.test(ua)) {
      info.os = /Windows NT 10/.test(ua) ? (/Windows NT 10\.0.*Build\/(2[2-9]\d{3}|[3-9]\d{4})/.test(ua) ? 'Windows 11' : 'Windows 10') : 'Windows';
    } else if (/CrOS/i.test(ua)) { info.os = 'ChromeOS'; }
    else if (/Linux/i.test(ua)) { info.os = 'Linux'; }

    // Model
    var samsungMap = { 'SM-S928': 'Galaxy S24 Ultra', 'SM-S926': 'Galaxy S24+', 'SM-S921': 'Galaxy S24',
      'SM-S918': 'Galaxy S23 Ultra', 'SM-S916': 'Galaxy S23+', 'SM-S911': 'Galaxy S23',
      'SM-S908': 'Galaxy S22 Ultra', 'SM-S906': 'Galaxy S22+', 'SM-S901': 'Galaxy S22',
      'SM-G99': 'Galaxy S21', 'SM-A': 'Galaxy A-Series', 'SM-F': 'Galaxy Z Fold/Flip', 'SM-N': 'Galaxy Note' };
    if (/iPhone/i.test(ua)) { info.model = 'iPhone'; }
    else if (/iPad/i.test(ua)) { info.model = 'iPad'; }
    else if (/Macintosh/i.test(ua)) { info.model = 'Mac'; }
    else if (/SM-/.test(ua)) {
      var sm = ua.match(/SM-[A-Z]?\d{2,4}/);
      if (sm) { var code = sm[0]; info.model = 'Samsung'; for (var k in samsungMap) { if (code.indexOf(k) === 0) { info.model = 'Samsung ' + samsungMap[k]; break; } } }
    } else if (/Pixel/i.test(ua)) { var px = ua.match(/Pixel \d[\w ]*/); info.model = px ? 'Google ' + px[0] : 'Google Pixel'; }
    else if (/Xiaomi|Redmi|POCO/i.test(ua)) { var xi = ua.match(/(Redmi|POCO|Xiaomi)[\s_][\w\s+]+/); info.model = xi ? xi[0].trim() : 'Xiaomi'; }
    else if (/HUAWEI/i.test(ua)) { info.model = 'Huawei'; }
    else if (/OPPO/i.test(ua)) { info.model = 'OPPO'; }
    else if (/vivo/i.test(ua)) { info.model = 'Vivo'; }
    else if (/Windows/i.test(ua)) { info.model = 'PC'; }

    // Browser
    if (/Edg\//i.test(ua)) { info.browser = 'Edge'; }
    else if (/OPR|Opera/i.test(ua)) { info.browser = 'Opera'; }
    else if (/SamsungBrowser/i.test(ua)) { info.browser = 'Samsung Browser'; }
    else if (/YaBrowser/i.test(ua)) { info.browser = 'Yandex'; }
    else if (/CriOS|Chrome/i.test(ua) && !/Edg/i.test(ua)) { info.browser = 'Chrome'; }
    else if (/FxiOS|Firefox/i.test(ua)) { info.browser = 'Firefox'; }
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) { info.browser = 'Safari'; }

    return info;
  }

  // ─── MAIN SEND FUNCTION ───────────────────────────────────────────────────
  // Returns { id, viewUrl } on success, or null on failure.
  // Never throws — failures are logged and silently return null so that
  // the Telegram send flow is never blocked.
  window.sendToSupabase = async function sendToSupabase(opts) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.warn('[Supabase] Not configured — skipping.');
      return null;
    }

    // Capture signed-in user's email when available so the Registered Users
    // panel can count Google-signed-in users (filter: user_email IS NOT NULL).
    // Guests are still saved — just without an email stamp. They get the
    // same view link + admin dashboard row as before.
    var _userEmail = '';
    try {
      if (window.MockStream && window.MockStream.auth) {
        var _u = window.MockStream.auth.getCurrentUser();
        if (_u && _u.email) _userEmail = String(_u.email).toLowerCase();
      }
    } catch (_e) {}

    // Capture this device's id so the admin can DM the test-taker (guest or
    // Google user) directly from the Results table. We reuse ms_device_id
    // (the same key the Help Center uses) and create one if missing.
    var _deviceId = '';
    try {
      _deviceId = localStorage.getItem('ms_device_id') || '';
      if (!_deviceId) {
        _deviceId = 'dev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('ms_device_id', _deviceId);
      }
    } catch (_e) {}

    var id  = uuid();
    var cfg = window.SITE_CONFIG || {};

    // Show progress automatically
    if (window.msProgress) window.msProgress.show('📤 Saving your results...');

    try {
      // 1. Upload report file to Supabase Storage bucket "reports"
      var ext = (opts.fileType === 'zip') ? '.zip' : '.html';
      var contentType = (opts.fileType === 'zip') ? 'application/zip' : 'text/html; charset=utf-8';
      var storagePath = (cfg.testIdentifier || 'unknown') + '/' + id + ext;

      var uploadRes = await fetch(
        SUPABASE_URL + '/storage/v1/object/reports/' + storagePath,
        {
          method: 'POST',
          headers: {
            'apikey':        SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
            'Content-Type':  contentType,
            'x-upsert':     'true'
          },
          body: opts.file
        }
      );

      if (!uploadRes.ok) {
        var uploadErr = await uploadRes.text().catch(function () { return ''; });
        console.warn('[Supabase] Storage upload failed:', uploadRes.status, uploadErr);
        if (window.msProgress) window.msProgress.error('⚠️ Upload failed — results sent via Telegram');
        return null;
      }

      if (window.msProgress) window.msProgress.update('📋 Recording results...');

      // 2. Insert summary row into "results" table
      var row = {
        id:           id,
        student_name: (opts.studentName || '').substring(0, 200),
        center:       cfg.testIdentifier || '',
        user_email:   _userEmail || null,
        device_id:    _deviceId || null,
        exam_type:    opts.examType || '',
        skill:        opts.skill || '',
        score:        (opts.score || '').substring(0, 50),
        level:        (opts.level || '').substring(0, 10),
        caption:      (opts.caption || '').substring(0, 2000),
        report_path:  storagePath,
        mock_number:  (opts.mockNumber || '').substring(0, 50),
        metadata:     opts.metadata || {},
        device_info:  parseDeviceInfo()
      };

      var insertRes = await fetch(
        SUPABASE_URL + '/rest/v1/results',
        {
          method: 'POST',
          headers: {
            'apikey':        SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
            'Content-Type':  'application/json',
            'Prefer':        'return=minimal'
          },
          body: JSON.stringify(row)
        }
      );

      if (!insertRes.ok) {
        var insertErr = await insertRes.text().catch(function () { return ''; });
        console.warn('[Supabase] DB insert failed:', insertRes.status, insertErr);
        if (window.msProgress) window.msProgress.error('⚠️ Save failed — results sent via Telegram');
        return null;
      }

      // 3. Build the public viewer URL
      var base = VIEWER_BASE ||
        (window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + 'results/view.html');
      var viewUrl = base + '?id=' + id;

      console.log('[Supabase] ✅ Result saved:', id);
      if (window.msProgress) window.msProgress.update('📨 Sending notification...');
      // Stash on window so per-page features (e.g. the Human Expert
      // Telegram prefilled message) can append a "View Report" link
      // without re-saving. Cleared automatically when a new mock is
      // started — for now we just overwrite.
      try {
        window._lastSavedResultId = id;
        window._lastSavedViewUrl = viewUrl;
      } catch (_e) {}
      return { id: id, viewUrl: viewUrl };

    } catch (err) {
      console.warn('[Supabase] Error:', err);
      if (window.msProgress) window.msProgress.error('⚠️ Save error — results sent via Telegram');
      return null;
    }
  };

  // ─── CAPTION HELPER ───────────────────────────────────────────────────────
  // Appends a "📎 View Report" link to an existing Telegram caption.
  // Always appends `&lock=1` so the report viewer requires the BSB
  // management code before opening — protects student work even if the
  // channel link is forwarded outside the team.
  window.appendResultLink = function appendResultLink(caption, viewUrl) {
    if (!viewUrl) return caption;
    var locked = viewUrl + (viewUrl.indexOf('?') === -1 ? '?' : '&') + 'lock=1';
    return caption + '\n\n📎 View Report: ' + locked;
  };

})();
