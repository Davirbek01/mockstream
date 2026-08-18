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
      '@media (max-width: -1px){#ms-progress-bar-track{background:rgba(255,255,255,.08)}' + /* OS dark-mode auto-detect disabled site-wide */
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
    // panel can count Google-signed-in users (filter: user_email IS NOT NULL)
    // and so the My Results page can filter by user_email = me. Guests are
    // still saved — just without an email stamp.
    var _userEmail = '';
    try {
      if (window.MockStream && window.MockStream.auth) {
        var _u = window.MockStream.auth.getCurrentUser();
        if (_u && _u.email) _userEmail = String(_u.email).toLowerCase();
      }
    } catch (_e) {}
    // Fallback: most mock test pages (CEFR Listening / Reading / Writing /
    // Speaking, IELTS variants, Full Mock, etc.) load supabase-send.js but
    // not auth.js itself, so window.MockStream.auth is undefined there even
    // though the user is signed in. auth.js on landing.html caches the
    // profile (including email) under 'ms_candidate_profile' — read it as
    // a fallback so the result is still stamped with the right email and
    // My Results can find it.
    if (!_userEmail) {
      try {
        var cached = localStorage.getItem('ms_candidate_profile');
        if (cached) {
          var profile = JSON.parse(cached);
          if (profile && profile.email) _userEmail = String(profile.email).toLowerCase();
        }
      } catch (_e) {}
    }
    // Last-resort fallback: VIP email-sign-in path (auth.js writes
    // 'ms_vip_email' separately from the OAuth profile), so a VIP user who
    // signed in by entering their email also gets their results stamped.
    if (!_userEmail) {
      try {
        var vipEmail = localStorage.getItem('ms_vip_email');
        if (vipEmail) _userEmail = String(vipEmail).toLowerCase();
      } catch (_e) {}
    }
    // Final fallback: read the live Supabase session straight from the
    // storage key that supabase-js writes ('ms_auth_session', set in
    // auth.js's createClient call). This catches Telegram Mini-App users
    // whose synthetic email ('tg_<id>@telegram.mock-stream.com') never
    // landed in the ms_candidate_profile cache because auth.js wasn't
    // loaded on the mock page they are currently submitting from.
    // Without this, Telegram users' rows save with user_email=NULL and
    // their My Results page is empty even though submissions go through.
    if (!_userEmail) {
      try {
        var rawSession = localStorage.getItem('ms_auth_session');
        if (rawSession) {
          var sess = JSON.parse(rawSession);
          var sessEmail = (sess && sess.user && sess.user.email)
                       || (sess && sess.currentSession && sess.currentSession.user && sess.currentSession.user.email);
          if (sessEmail) _userEmail = String(sessEmail).toLowerCase();
        }
      } catch (_e) {}
    }

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
      //    When opts.file is null/undefined (e.g. Human Expert request sent
      //    BEFORE the student runs AI Score), we auto-generate a minimal
      //    placeholder HTML so the admin view link is still valid.
      // 'payload' stores the attempt as JSON and lets the `report` Edge
      // Function render the review page on every open (score strip, passage
      // evidence, verdicts) — the same report the apps now save, so a student
      // sees one format everywhere. 'zip'/'html' keep the legacy paths.
      var isPayload = (opts.fileType === 'payload');
      var ext = (opts.fileType === 'zip') ? '.zip' : (isPayload ? '.json' : '.html');
      var contentType = (opts.fileType === 'zip')
        ? 'application/zip'
        : (isPayload ? 'application/json' : 'text/html; charset=utf-8');
      var centreId = cfg.testIdentifier || 'unknown';
      var storagePath = centreId + '/' + id + ext;

      var fileToUpload = opts.file;

      // ── Full mock: four reports + the recordings, stored side by side ──
      // Instead of one zip nobody can open from a link, each skill report is
      // uploaded next to the attempt and a small MANIFEST names them; the
      // `report` Edge Function assembles the tabbed page on every open.
      //   opts.fullMock = { exam, overall:{label,note}, source,
      //                     skills:[{skill,label,score,mock,html}],
      //                     audio:{ 1: Blob, … } }
      if (opts.fullMock) {
        ext = '.json';
        contentType = 'application/json';
        storagePath = centreId + '/' + id + ext;
        var fm = opts.fullMock;
        var fmAudio = fm.audio || {};
        if (window.msProgress) window.msProgress.update('📦 Saving your full mock...');
        var fmUrls = {};
        await Promise.all(Object.keys(fmAudio).map(async function (qn) {
          var b = fmAudio[qn];
          if (!b) return;
          var aExt = (b.type && b.type.indexOf('mp4') > -1) ? 'm4a' : 'webm';
          var aPath = centreId + '/' + id + '/q' + qn + '.' + aExt;
          try {
            var ar = await fetch(SUPABASE_URL + '/storage/v1/object/reports/' + aPath, {
              method: 'POST',
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
                'Content-Type': b.type || 'audio/webm',
                'x-upsert': 'true'
              },
              body: b
            });
            if (ar.ok) fmUrls[qn] = SUPABASE_URL + '/storage/v1/object/public/reports/' + aPath;
          } catch (e) { console.warn('[Supabase] full-mock audio q' + qn, e); }
        }));

        var fmSkills = [];
        await Promise.all((fm.skills || []).map(async function (sk) {
          if (!sk || !sk.html) return;
          var body = String(sk.html);
          Object.keys(fmUrls).forEach(function (qn) {
            // Every local name a report page uses for an answer file. IELTS full
            // mocks name theirs "S-<index>.webm" — miss that and the stored
            // report keeps a dead relative src and plays nothing.
            ['answer_q' + qn + '.webm', 'answer-q' + qn + '.m4a', 'answer_q' + qn + '.m4a', 'S-' + qn + '.webm']
              .forEach(function (local) { body = body.split(local).join(fmUrls[qn]); });
          });
          var sPath = centreId + '/' + id + '/' + sk.skill + '.html';
          try {
            var sr = await fetch(SUPABASE_URL + '/storage/v1/object/reports/' + sPath, {
              method: 'POST',
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
                'Content-Type': 'text/html; charset=utf-8',
                'x-upsert': 'true'
              },
              body: body
            });
            if (sr.ok) {
              fmSkills.push({ skill: sk.skill, label: sk.label || sk.skill, score: sk.score || '', mock: sk.mock || '', path: sPath });
            } else {
              console.warn('[Supabase] full-mock report upload failed', sk.skill, sr.status);
            }
          } catch (e) { console.warn('[Supabase] full-mock report', sk.skill, e); }
        }));

        // The certificate PDF used to live in the zip and nowhere else; store it
        // beside the attempt so the page can offer it from the link AND the
        // encrypted file.
        var fmCertPath = '';
        if (fm.certificate) {
          var cPath = centreId + '/' + id + '/certificate.pdf';
          try {
            var cr = await fetch(SUPABASE_URL + '/storage/v1/object/reports/' + cPath, {
              method: 'POST',
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
                'Content-Type': 'application/pdf',
                'x-upsert': 'true'
              },
              body: fm.certificate
            });
            if (cr.ok) fmCertPath = cPath;
            else console.warn('[Supabase] certificate upload failed', cr.status);
          } catch (e) { console.warn('[Supabase] certificate upload error', e); }
        }

        var ORDER_FM = ['listening', 'reading', 'writing', 'speaking'];
        fmSkills.sort(function (a, b) { return ORDER_FM.indexOf(a.skill) - ORDER_FM.indexOf(b.skill); });
        fileToUpload = new Blob([JSON.stringify({
          v: 1,
          kind: 'full-mock',
          student: (opts.studentName || 'Student').substring(0, 200),
          exam: fm.exam || opts.examType || 'cefr',
          takenAt: new Date().toISOString(),
          source: fm.source || 'Website',
          overall: fm.overall || null,
          certificate: fmCertPath || undefined,
          skills: fmSkills
        })], { type: 'application/json' });
      }

      // ── Speaking: the recordings live BESIDE the report, not inside a zip ──
      // Each answer is uploaded to "<centre>/<id>/q<N>.<ext>" and the report's
      // local <source src="answer_qN.webm"> is repointed at that public URL.
      // That is what lets the report open from a link, be encrypted for the
      // channel, and keep playing after retention (the GCS archive serves the
      // same paths for ever).
      if (opts.audio && typeof opts.html === 'string') {
        var qNums = Object.keys(opts.audio).filter(function (k) { return opts.audio[k]; });
        if (window.msProgress && qNums.length) window.msProgress.update('🎤 Saving your recordings...');
        var reportHtml = opts.html;
        var uploaded = await Promise.all(qNums.map(async function (qn) {
          var blob = opts.audio[qn];
          var aExt = (opts.audioExt || (blob.type && blob.type.indexOf('mp4') > -1 ? 'm4a' : 'webm'));
          var aPath = centreId + '/' + id + '/q' + qn + '.' + aExt;
          try {
            var ar = await fetch(SUPABASE_URL + '/storage/v1/object/reports/' + aPath, {
              method: 'POST',
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
                'Content-Type': blob.type || 'audio/webm',
                'x-upsert': 'true'
              },
              body: blob
            });
            if (!ar.ok) { console.warn('[Supabase] audio upload failed q' + qn, ar.status); return null; }
            return { qn: qn, url: SUPABASE_URL + '/storage/v1/object/public/reports/' + aPath };
          } catch (e) {
            console.warn('[Supabase] audio upload error q' + qn, e);
            return null;
          }
        }));
        uploaded.forEach(function (u) {
          if (!u) return;
          // Every local spelling the report pages use for an answer file.
          ['answer_q' + u.qn + '.webm', 'answer-q' + u.qn + '.m4a', 'answer_q' + u.qn + '.m4a', 'S-' + u.qn + '.webm']
            .forEach(function (local) { reportHtml = reportHtml.split(local).join(u.url); });
        });
        fileToUpload = new Blob([reportHtml], { type: 'text/html;charset=utf-8' });
        contentType = 'text/html; charset=utf-8';
      }
      if (!fileToUpload) {
        var _placeholderHtml =
          '<!doctype html><html><head><meta charset="utf-8">' +
          '<title>Human Expert Request</title></head>' +
          '<body style="font-family:system-ui,sans-serif;max-width:640px;margin:40px auto;padding:24px;">' +
          '<h1 style="color:#059669">Human Expert Request</h1>' +
          '<p>This student requested a Human Expert review but did not run AI Score first, so no automated report is available.</p>' +
          '<p><strong>Student:</strong> ' + ((opts.studentName || 'Unknown').replace(/[<>&]/g, '')) + '</p>' +
          '<p><strong>Exam:</strong> ' + ((opts.examType || '') + ' ' + (opts.skill || '')).replace(/[<>&]/g, '') + '</p>' +
          '<p><strong>Mock:</strong> ' + ((opts.mockNumber || '').replace(/[<>&]/g, '')) + '</p>' +
          '<p><strong>Saved:</strong> ' + new Date().toISOString() + '</p>' +
          '</body></html>';
        fileToUpload = new Blob([_placeholderHtml], { type: 'text/html;charset=utf-8' });
        contentType = 'text/html; charset=utf-8';
      }

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
          body: fileToUpload
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
      // Stamp the candidates table so the Registered Users panel reflects this
      // test-taker. Non-blocking — the result has already been saved above.
      try {
        if (window.MockStream && window.MockStream.auth && typeof window.MockStream.auth.upsertCandidate === 'function') {
          window.MockStream.auth.upsertCandidate(
            (opts.studentName || '').substring(0, 200),
            _userEmail || '',
            cfg.testIdentifier || ''
          );
        }
      } catch (_e) {}
      if (window.msProgress) window.msProgress.update('📨 Sending notification...');
      // Stash on window AND sessionStorage so per-page features (e.g. the
      // Human Expert Telegram prefilled message) can append a "View Report"
      // link without re-saving — and survive a page reload / popup.
      try {
        window._lastSavedResultId = id;
        window._lastSavedViewUrl = viewUrl;
        window._lastSavedReportPath = storagePath;
        try {
          sessionStorage.setItem('ms_lastSavedResultId', id);
          sessionStorage.setItem('ms_lastSavedViewUrl', viewUrl);
        } catch (_ss) {}
      } catch (_e) {}
      return { id: id, viewUrl: viewUrl, reportPath: storagePath };

    } catch (err) {
      console.warn('[Supabase] Error:', err);
      if (window.msProgress) window.msProgress.error('⚠️ Save error — results sent via Telegram');
      return null;
    }
  };

  // ─── LOGIN IDENTITY ───────────────────────────────────────────────────────
  // Which account submitted this result: Google email, Telegram @handle, or
  // Guest. Deliberately reads ONLY synchronous local sources (in-memory auth
  // object, localStorage) — never a network call — so it can never delay a
  // student's submission. If a Telegram handle isn't already cached we print
  // "Telegram user" rather than querying for it.
  //
  // NOTE: this is the account used to sign in, NOT proof of who sat the exam
  // (the candidate name is typed by the student). A mismatch between the two
  // is itself useful signal for the examiner.
  function _readSessionUser() {
    try {
      if (window.MockStream && window.MockStream.auth &&
          typeof window.MockStream.auth.getCurrentUser === 'function') {
        var u = window.MockStream.auth.getCurrentUser();
        if (u) return u;
      }
    } catch (_e) {}
    try {
      var raw = localStorage.getItem('ms_auth_session');
      if (raw) {
        var s = JSON.parse(raw);
        return (s && s.user) || (s && s.currentSession && s.currentSession.user) || null;
      }
    } catch (_e) {}
    return null;
  }

  window.getLoginIdentity = function getLoginIdentity() {
    var email = '', tg = '';
    var u = _readSessionUser();
    try {
      if (u) {
        if (u.email) email = String(u.email).toLowerCase();
        var meta = u.user_metadata || u.userMetadata || u.raw_user_meta_data || {};
        if (typeof meta.telegram_username === 'string') tg = meta.telegram_username;
      }
    } catch (_e) {}
    // Cached profile / VIP email fallbacks (same sources the row stamp uses).
    if (!email) {
      try {
        var p = JSON.parse(localStorage.getItem('ms_candidate_profile') || 'null');
        if (p) {
          if (p.email) email = String(p.email).toLowerCase();
          if (!tg && typeof p.telegram_username === 'string') tg = p.telegram_username;
        }
      } catch (_e) {}
    }
    if (!email) {
      try { email = (localStorage.getItem('ms_vip_email') || '').toLowerCase(); } catch (_e) {}
    }
    tg = String(tg || '').replace(/^@/, '').trim();
    // Telegram sign-ins carry a synthetic address (tg_<id>@telegram.…) that is
    // meaningless to an examiner — show the handle instead.
    var isSyntheticTg = /^tg_\d+@telegram\./i.test(email);
    if (tg)            return { kind: 'telegram', label: '@' + tg };
    if (isSyntheticTg) return { kind: 'telegram', label: 'Telegram user' };
    if (email)         return { kind: 'google',   label: email };
    return { kind: 'guest', label: 'Guest' };
  };

  // ─── CAPTION HELPERS ──────────────────────────────────────────────────────
  // Adds the "🔐 Login:" line. Idempotent — safe if a page ever calls twice.
  window.appendLoginIdentity = function appendLoginIdentity(caption) {
    caption = caption || '';
    // Guard on the text, not the icon — the icon varies per sign-in kind
    // (📧 / ✈️ / 👥), so an icon-specific check never matched and a second
    // call stamped a duplicate line.
    if (/(^|\n)\S* ?Login: /.test(caption)) return caption;
    var id;
    try { id = window.getLoginIdentity(); } catch (_e) { return caption; }
    if (!id) return caption;
    var ICON = { google: '📧', telegram: '✈️', guest: '👥' };
    return caption + '\n' + (ICON[id.kind] || '🔐') + ' Login: ' + id.label;
  };

  // Appends a "📎 View Report" link to an existing Telegram caption.
  // Always appends `&lock=1` so the report viewer requires the BSB
  // management code before opening — protects student work even if the
  // channel link is forwarded outside the team.
  // Also stamps the login identity, so every page that already calls this
  // gets it without needing its own edit.
  window.appendResultLink = function appendResultLink(caption, viewUrl) {
    caption = window.appendLoginIdentity(caption);
    if (!viewUrl) return caption;
    var locked = viewUrl + (viewUrl.indexOf('?') === -1 ? '?' : '&') + 'lock=1';
    return caption + '\n\n📎 View Report: ' + locked;
  };

})();
