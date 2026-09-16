/* =========================================================================
 * exam-lock.js — one exam at a time for a Premium account (2026-09-15)
 * -------------------------------------------------------------------------
 * Loaded on every exam, practice and Plus page. While an exam page is open
 * on one device, the same Premium account opening another exam page on a
 * second device is stopped with the device that holds it (type, IP, exam,
 * start time). The second device can ask to continue here; the first device
 * is asked to approve, and only then does the exam move.
 *
 * Who is affected is decided by the server (exam-session Edge Function):
 * Premium accounts only. Ultra, admins, code users and anyone signed out get
 * { tracked: false } and this script goes quiet after one request.
 *
 * Every failure fails OPEN — a network error, a timeout, a server bug or an
 * expired sign-in never stops a student from taking a mock.
 *
 * Lifecycle
 *   load      → start (JWT from the stored session; skipped when there is
 *               none or it has expired)
 *   allowed   → heartbeat every beat_seconds, telling the server whether
 *               anybody is actually working here (taps, keys, scrolling,
 *               audio playing, the microphone recording)
 *   blocked   → "another exam is running" overlay → request → poll
 *   request   → the holder sees "allow / refuse"
 *   ended     → handed to another device: the page is covered and media stops
 *   pagehide  → end (a submitted result also ends it, server-side)
 * ========================================================================= */
(function () {
  'use strict';
  if (window.MsExamLock) return;

  var FN_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/exam-session';
  var ANON   = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
  var REQUEST_TIMEOUT_MS = 8000;

  // page (lower-case, no .html) → [key, label]
  var PAGES = {
    'cefr reading':             ['cefr-reading', 'CEFR Reading'],
    'ielts reading':            ['ielts-reading', 'IELTS Reading'],
    'cefr listening':           ['cefr-listening', 'CEFR Listening'],
    'ielts listening':          ['ielts-listening', 'IELTS Listening'],
    'speaking mocks':           ['cefr-speaking', 'CEFR Speaking'],
    'ielts speaking mocks':     ['ielts-speaking', 'IELTS Speaking'],
    'writing mocks':            ['cefr-writing', 'CEFR Writing'],
    'writing ielts mock':       ['ielts-writing', 'IELTS Writing'],
    'full-mock':                ['cefr-full-mock', 'CEFR Full Mock'],
    'ielts-full-mock':          ['ielts-full-mock', 'IELTS Full Mock'],
    'reading plus':             ['reading-plus', 'Reading Plus'],
    'listening plus':           ['listening-plus', 'Listening Plus'],
    'writing plus':             ['writing-plus', 'Writing Plus'],
    'speaking plus':            ['speaking-plus', 'Speaking Plus'],
    'pet reading & writing':    ['pet-reading-writing', 'PET Reading & Writing'],
    'fce reading & writing':    ['fce-reading-writing', 'FCE Reading & Writing'],
    'cae reading & writing':    ['cae-reading-writing', 'CAE Reading & Writing'],
    'cpe reading & writing':    ['cpe-reading-writing', 'CPE Reading & Writing'],
    'sat':                      ['sat', 'SAT']
  };

  // ---------------------------------------------------------------- context

  function storedSession() {
    try {
      var s = JSON.parse(localStorage.getItem('ms_auth_session') || 'null');
      if (!s) return null;
      return s.currentSession || s;
    } catch (e) { return null; }
  }

  function accessToken() {
    var s = storedSession();
    var t = s && s.access_token ? String(s.access_token) : '';
    if (!t) return '';
    // An expired token would only be refused; nothing on an exam page can
    // refresh it without racing the landing page's own refresh.
    try {
      var p = JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (p && p.exp && p.exp * 1000 < Date.now() + 5000) return '';
    } catch (e) {}
    return t;
  }

  function deviceKey() {
    try {
      var d = localStorage.getItem('ms_device_id') || '';
      if (!d) {
        d = 'dev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('ms_device_id', d);
      }
      return d;
    } catch (e) { return ''; }
  }

  function centerId() {
    return String(window.__CENTER_ID ||
      (window.SITE_CONFIG && window.SITE_CONFIG.testIdentifier) || 'mock_stream');
  }

  function deviceLabel() {
    var ua = navigator.userAgent || '';
    var os = /iPhone/.test(ua) ? 'iPhone'
      : (/iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) ? 'iPad'
      : /Android/.test(ua) ? 'Android'
      : /Windows/.test(ua) ? 'Windows'
      : /Macintosh|Mac OS X/.test(ua) ? 'Mac'
      : /CrOS/.test(ua) ? 'Chromebook'
      : /Linux/.test(ua) ? 'Linux' : 'Qurilma';
    var tg = !!(window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData);
    var br = tg || /Telegram/i.test(ua) ? 'Telegram'
      : /Edg\//.test(ua) ? 'Edge'
      : /OPR\//.test(ua) ? 'Opera'
      : /YaBrowser/.test(ua) ? 'Yandex Browser'
      : /SamsungBrowser/.test(ua) ? 'Samsung Internet'
      : /CriOS|Chrome\//.test(ua) ? 'Chrome'
      : /FxiOS|Firefox\//.test(ua) ? 'Firefox'
      : /Safari\//.test(ua) ? 'Safari' : 'brauzer';
    return os + ' · ' + br;
  }

  function examInfo() {
    var path = '';
    try { path = decodeURIComponent(location.pathname); } catch (e) { path = location.pathname; }
    var page = path.split('/').pop().replace(/\.html$/i, '').toLowerCase();
    var def = PAGES[page];
    if (!def) return null;
    var q = new URLSearchParams(location.search);
    var num = q.get('num') || q.get('mock') || '';
    if (!num) { var m = /(\d+)\s*$/.exec(q.get('test') || ''); if (m) num = m[1]; }
    num = String(num).replace(/^0+(?=\d)/, '');
    var part = q.get('part') || q.get('passage') || q.get('task') || '';
    var keyParts = [def[0]];
    ['sbmock', 'num', 'mock', 'test', 'part', 'passage', 'task', 'L', 'R', 'W', 'S'].forEach(function (k) {
      if (q.get(k)) keyParts.push(k + '=' + q.get(k));
    });
    var label = def[1] + (num ? ' · Mock ' + num : '') + (part ? ' · mashq (' + part + ')' : '');
    return { key: keyParts.join(':').slice(0, 120), label: label, practice: !!part };
  }

  // ---------------------------------------------------------------- network

  function call(body, withJwt) {
    var headers = { 'Content-Type': 'application/json', 'apikey': ANON };
    var token = withJwt ? accessToken() : '';
    headers.Authorization = 'Bearer ' + (token || ANON);
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, REQUEST_TIMEOUT_MS) : null;
    return fetch(FN_URL, {
      method: 'POST', headers: headers, body: JSON.stringify(body),
      signal: ctrl ? ctrl.signal : undefined, keepalive: body.action === 'end'
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; })
      .then(function (j) { if (timer) clearTimeout(timer); return j; });
  }

  // ---------------------------------------------------------------- activity

  var lastInteraction = Date.now();
  ['pointerdown', 'keydown', 'wheel', 'touchstart', 'input', 'scroll'].forEach(function (ev) {
    try { window.addEventListener(ev, function () { lastInteraction = Date.now(); }, { passive: true, capture: true }); } catch (e) {}
  });

  // Streams the page opened for recording — a speaking student can talk for
  // two minutes without touching anything, and that is not "idle".
  var streams = [];
  try {
    var md = navigator.mediaDevices;
    if (md && typeof md.getUserMedia === 'function') {
      var orig = md.getUserMedia.bind(md);
      md.getUserMedia = function (c) {
        return orig(c).then(function (s) { streams.push(s); return s; });
      };
    }
  } catch (e) {}

  function micLive() {
    for (var i = 0; i < streams.length; i++) {
      var t = streams[i].getAudioTracks ? streams[i].getAudioTracks() : [];
      for (var j = 0; j < t.length; j++) if (t[j].readyState === 'live' && t[j].enabled) return true;
    }
    return false;
  }

  function mediaPlaying() {
    var els = document.querySelectorAll('audio, video');
    for (var i = 0; i < els.length; i++) {
      if (!els[i].paused && !els[i].ended && els[i].currentTime > 0) return true;
    }
    return false;
  }

  function activeSince(ts) {
    if (micLive()) return true;
    if (document.visibilityState === 'hidden') return false;
    return lastInteraction >= ts || mediaPlaying();
  }

  function stopMedia() {
    try { document.querySelectorAll('audio, video').forEach(function (m) { try { m.pause(); } catch (e) {} }); } catch (e) {}
    streams.forEach(function (s) { try { s.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {} });
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
  }

  // ---------------------------------------------------------------- UI

  var host = null, root = null;

  var CSS = [
    ':host{all:initial}',
    '.bk{position:fixed;inset:0;z-index:2147483000;background:rgba(15,23,42,.72);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}',
    '.bk.soft{background:rgba(15,23,42,.55)}',
    '.card{width:100%;max-width:460px;max-height:calc(100vh - 32px);overflow:auto;background:#fff;color:#0f172a;border-radius:18px;box-shadow:0 24px 60px rgba(2,6,23,.35);padding:24px 22px 20px;box-sizing:border-box}',
    '.ico{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 14px;background:#fef3c7}',
    '.ico.blue{background:#dbeafe}.ico.red{background:#fee2e2}',
    'h2{font-size:18px;line-height:1.35;font-weight:800;text-align:center;margin:0 0 8px}',
    'p{font-size:14px;line-height:1.55;color:#334155;margin:0 0 14px;text-align:center}',
    '.dl{border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;padding:4px 14px;margin:0 0 14px}',
    '.row{display:flex;gap:12px;justify-content:space-between;padding:9px 0;border-bottom:1px solid #e2e8f0;font-size:13.5px}',
    '.row:last-child{border-bottom:0}',
    '.k{color:#64748b;flex:0 0 auto}',
    '.v{color:#0f172a;font-weight:600;text-align:right;word-break:break-word}',
    '.v.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-weight:600}',
    '.note{font-size:12.5px;line-height:1.5;color:#64748b;background:#f1f5f9;border-radius:10px;padding:10px 12px;margin:0 0 16px;text-align:left}',
    '.status{font-size:13.5px;line-height:1.5;border-radius:10px;padding:10px 12px;margin:0 0 14px;text-align:center}',
    '.status.wait{background:#eff6ff;color:#1e40af}.status.bad{background:#fef2f2;color:#991b1b}',
    '.btns{display:flex;flex-direction:column;gap:8px}',
    'button{font:inherit;font-size:14.5px;font-weight:700;border-radius:12px;padding:12px 14px;cursor:pointer;border:0;width:100%}',
    'button:disabled{opacity:.55;cursor:default}',
    '.primary{background:#2563eb;color:#fff}.primary:hover:not(:disabled){background:#1d4ed8}',
    '.danger{background:#dc2626;color:#fff}.danger:hover:not(:disabled){background:#b91c1c}',
    '.ghost{background:#f1f5f9;color:#0f172a}.ghost:hover:not(:disabled){background:#e2e8f0}',
    '.hint{font-size:12px;color:#64748b;text-align:center;margin:-2px 0 4px}',
    '.countdown{border-radius:14px;background:#fff7ed;border:1px solid #fed7aa;padding:12px 14px;margin:0 0 14px;text-align:center}',
    '.cd-num{font-size:34px;line-height:1.1;font-weight:800;color:#c2410c;font-variant-numeric:tabular-nums}',
    '.cd-num.urgent{color:#dc2626;animation:pulse 1s ease-in-out infinite}',
    '@keyframes pulse{50%{opacity:.45}}',
    '.cd-text{font-size:13px;line-height:1.5;color:#7c2d12;margin-top:6px}',
    '@media (prefers-color-scheme: dark){.card{background:#0f172a;color:#e2e8f0}p{color:#cbd5e1}h2{color:#f8fafc}.dl{background:#111c33;border-color:#1e293b}.row{border-color:#1e293b}.v{color:#f1f5f9}.note{background:#111c33;color:#94a3b8}.ghost{background:#1e293b;color:#e2e8f0}.ghost:hover:not(:disabled){background:#334155}.ico{background:#422006}.ico.blue{background:#172554}.ico.red{background:#450a0a}.status.wait{background:#172554;color:#bfdbfe}.status.bad{background:#450a0a;color:#fecaca}.countdown{background:#431407;border-color:#7c2d12}.cd-num{color:#fdba74}.cd-text{color:#fed7aa}}'
  ].join('');

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function show(html, soft) {
    if (!host) {
      host = document.createElement('div');
      host.setAttribute('data-ms-exam-lock', '');
      root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
      (document.body || document.documentElement).appendChild(host);
    }
    // A runner in element fullscreen would hide anything outside it.
    try {
      var fs = document.fullscreenElement || document.webkitFullscreenElement;
      if (fs && fs !== document.documentElement && fs !== document.body) {
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      }
    } catch (e) {}
    root.innerHTML = '<style>' + CSS + '</style><div class="bk' + (soft ? ' soft' : '') + '" role="dialog" aria-modal="true">' + html + '</div>';
    return root;
  }

  function hide() {
    stopAlert();
    if (host && host.parentNode) host.parentNode.removeChild(host);
    host = null; root = null;
  }

  function $(id) { return root ? root.getElementById ? root.getElementById(id) : root.querySelector('#' + id) : null; }

  function deviceText(d) {
    if (!d) return 'Noma’lum qurilma';
    var label = d.device_label || '';
    var p = d.platform || 'web';
    if (p === 'android') return (label ? label + ' · ' : '') + 'Android ilovasi';
    if (p === 'ios') return (label ? label + ' · ' : '') + 'iOS ilovasi';
    if (p === 'windows') return (label ? label + ' · ' : '') + 'Windows dasturi';
    if (p === 'mac') return (label ? label + ' · ' : '') + 'Mac dasturi';
    return label ? label + ' (veb-sayt)' : 'Veb-sayt';
  }

  function ipText(d) {
    if (!d || !d.ip) return 'aniqlanmadi';
    return d.ip + (d.country ? ' (' + d.country + ')' : '');
  }

  function timeText(iso) {
    var t = Date.parse(iso || '');
    if (!isFinite(t)) return '—';
    var dt = new Date(t);
    var hm = String(dt.getHours()).padStart(2, '0') + ':' + String(dt.getMinutes()).padStart(2, '0');
    var min = Math.max(0, Math.round((Date.now() - t) / 60000));
    return hm + (min < 1 ? ' (hozirgina)' : ' (' + min + ' daqiqa oldin)');
  }

  function rows(list) {
    return '<div class="dl">' + list.map(function (r) {
      return '<div class="row"><span class="k">' + esc(r[0]) + '</span><span class="v' + (r[2] ? ' mono' : '') + '">' + esc(r[1]) + '</span></div>';
    }).join('') + '</div>';
  }

  function goHome() {
    try { location.href = '/'; } catch (e) {}
  }

  function mmss(sec) {
    sec = Math.max(0, Math.ceil(sec));
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }

  // ---------------------------------------------------------------- state

  var info = null;
  var dkey = '';
  var sessionId = null;
  var beatTimer = null;
  var beatSeconds = 15;
  var lastBeatAt = Date.now();
  var stopped = false;
  var approvedHere = false;
  var answeringId = null;

  function stopBeats() {
    if (beatTimer) clearTimeout(beatTimer);
    beatTimer = null;
  }

  function scheduleBeat(delaySec) {
    stopBeats();
    if (stopped || !sessionId) return;
    beatTimer = setTimeout(beat, Math.max(0.1, delaySec || beatSeconds) * 1000);
  }

  function beat() {
    if (stopped || !sessionId) return;
    var since = lastBeatAt;
    lastBeatAt = Date.now();
    call({ action: 'beat', session_id: sessionId, device_key: dkey, active: activeSince(since) }, false)
      .then(function (r) {
        if (stopped) return;
        if (!r) { scheduleBeat(); return; }              // network: carry on
        if (r.beat_seconds) beatSeconds = Number(r.beat_seconds) || beatSeconds;
        if (r.state === 'request' && r.request) { showRequest(r.request); scheduleBeat(5); return; }
        if (r.state === 'ended') {
          if (r.reason === 'taken_over' || r.reason === 'expired') { showEnded(r.reason, r.by); return; }
          sessionId = null; stopBeats(); return;         // submitted / closed / replaced
        }
        if (r.state === 'unknown') { sessionId = null; stopBeats(); return; }
        if (answeringId) { answeringId = null; hide(); releaseExam(); } // request lapsed while shown
        scheduleBeat();
      });
  }

  // ---------------------------------------------------------------- flows

  function start() {
    info = examInfo();
    dkey = deviceKey();
    if (!info || !dkey) return;
    if (!accessToken()) {
      // Signed out, or a token that ran out before this page opened. Either
      // way nothing can be proven about the account here, so nothing is locked.
      try { console.info('[exam-lock] not checked: ' + (storedSession() ? 'sign-in token expired' : 'not signed in')); } catch (e) {}
      trace('exam-lock: not checked (' + (storedSession() ? 'token expired' : 'not signed in') + ')');
      return;
    }
    call({
      action: 'start', center: centerId(), device_key: dkey, platform: 'web',
      device_label: deviceLabel(), exam_key: info.key, exam_label: info.label, practice: info.practice
    }, true).then(function (r) {
      if (!r || stopped) return;
      try { console.info('[exam-lock] start: ' + (r.tracked ? 'tracked' : r.allowed === false ? 'blocked' : (r.reason || 'not tracked'))); } catch (e) {}
      trace('exam-lock start: ' + (r.tracked ? 'tracked' : r.allowed === false ? 'blocked' : (r.reason || 'not tracked')));
      if (r.allowed === false && r.holder) { showBlocked(r.holder); return; }
      if (r.tracked && r.session_id) {
        sessionId = r.session_id;
        beatSeconds = Number(r.beat_seconds) || 15;
        lastBeatAt = Date.now();
        scheduleBeat();
      }
    });
  }

  function showBlocked(holder, statusHtml) {
    // Nothing on this page may keep playing behind the notice.
    try { document.querySelectorAll('audio, video').forEach(function (m) { try { m.pause(); } catch (e) {} }); } catch (e) {}
    show(
      '<div class="card">' +
        '<div class="ico">🔒</div>' +
        '<h2>Bu hisobda hozir boshqa imtihon davom etmoqda</h2>' +
        '<p>Premium obuna bir vaqtning o‘zida faqat bitta qurilmada imtihon topshirish imkonini beradi. Hisobingiz orqali boshqa qurilmada imtihon ochilgan.</p>' +
        rows([
          ['Qurilma', deviceText(holder)],
          ['IP manzil', ipText(holder), true],
          ['Imtihon', holder.exam_label || '—'],
          ['Boshlangan', timeText(holder.started_at)]
        ]) +
        '<div id="st">' + (statusHtml || '') + '</div>' +
        '<div class="note">Agar bu qurilma sizga tegishli bo‘lmasa, hisobingizdan boshqa shaxs foydalanayotgan bo‘lishi mumkin. Bu holatda markaz administratoriga murojaat qiling.</div>' +
        '<div class="btns">' +
          '<button class="primary" id="go">Shu qurilmada davom ettirish</button>' +
          '<div class="hint" id="goHint">Boshqa qurilmaga tasdiqlash so‘rovi yuboriladi</div>' +
          '<button class="ghost" id="home">Bosh sahifaga qaytish</button>' +
        '</div>' +
      '</div>'
    );
    $('home').onclick = goHome;
    $('go').onclick = function () { requestTakeover(holder); };
  }

  function setStatus(kind, text) {
    var st = $('st');
    if (st) st.innerHTML = text ? '<div class="status ' + kind + '">' + text + '</div>' : '';
  }

  var pollTimer = null, countdownTimer = null;
  function clearWaits() {
    if (pollTimer) clearTimeout(pollTimer);
    if (countdownTimer) clearInterval(countdownTimer);
    pollTimer = countdownTimer = null;
  }

  function requestTakeover(holder) {
    var btn = $('go'), hint = $('goHint');
    if (btn) btn.disabled = true;
    setStatus('wait', 'So‘rov yuborilmoqda…');
    call({
      action: 'request', center: centerId(), device_key: dkey, platform: 'web',
      device_label: deviceLabel(), exam_key: info.key, exam_label: info.label, practice: info.practice
    }, true).then(function (r) {
      if (!r || r.allowed === true) { proceed(null); return; }        // fail open
      if (r.status === 'released' || r.status === 'approved') { proceed(r.session_id); return; }
      if (r.status === 'rate_limited') {
        waitRetry(Number(r.retry_in) || 60, holder, 'Yangi so‘rovni biroz keyinroq yuborish mumkin.');
        return;
      }
      if (r.status === 'pending' && r.request_id) {
        if (hint) hint.textContent = '';
        waitForAnswer(r.request_id, Number(r.expires_in) || 60, holder);
        return;
      }
      proceed(null);
    });
  }

  function waitForAnswer(requestId, expiresIn, holder) {
    clearWaits();
    var deadline = Date.now() + (expiresIn + 5) * 1000;
    var render = function () {
      var left = Math.max(0, (deadline - Date.now()) / 1000 - 5);
      setStatus('wait', 'Boshqa qurilmada tasdiqlash kutilmoqda… <b>' + mmss(left) + '</b><br>Javob kelmasa, sanoq tugagach imtihon shu qurilmada avtomatik ochiladi.');
    };
    render();
    countdownTimer = setInterval(render, 1000);
    var poll = function () {
      call({ action: 'poll', request_id: requestId, device_key: dkey }, false).then(function (r) {
        if (!r) { if (Date.now() > deadline + 30000) { clearWaits(); proceed(null); return; } pollTimer = setTimeout(poll, 3000); return; }
        var s = r.status;
        if (s === 'pending') { pollTimer = setTimeout(poll, 3000); return; }
        clearWaits();
        if (s === 'approved' || s === 'auto_approved' || s === 'released') { proceed(r.session_id); return; }
        if (s === 'denied') { waitRetry(300, holder, 'Boshqa qurilmada so‘rov rad etildi. U qurilmada imtihon davom etmoqda.'); return; }
        if (s === 'no_answer') { waitRetry(300, holder, 'Boshqa qurilmadan javob olinmadi.'); return; }
        proceed(null);
      });
    };
    pollTimer = setTimeout(poll, 3000);
  }

  function waitRetry(seconds, holder, message) {
    clearWaits();
    var until = Date.now() + seconds * 1000;
    var btn = $('go'), hint = $('goHint');
    var render = function () {
      var left = (until - Date.now()) / 1000;
      if (left <= 0) {
        clearWaits();
        setStatus('bad', message);
        if (btn) btn.disabled = false;
        if (hint) hint.textContent = 'Boshqa qurilmaga tasdiqlash so‘rovi yuboriladi';
        return;
      }
      setStatus('bad', message);
      if (btn) btn.disabled = true;
      if (hint) hint.textContent = 'Qayta so‘rov yuborish: ' + mmss(left);
    };
    render();
    countdownTimer = setInterval(render, 1000);
  }

  function proceed(newSessionId) {
    clearWaits();
    hide();
    if (newSessionId) {
      sessionId = newSessionId;
      lastBeatAt = Date.now();
      scheduleBeat();
    }
  }

  // Draws attention to the prompt: a student speaking into the microphone or
  // looking at the paper must not miss it and lose the exam at zero.
  // ALERT_URL is the spoken Uzbek announcement Davirbek recorded (17 s);
  // whenever it cannot play (autoplay refused, offline) a two-tone chime
  // stands in. It stops the moment the student answers.
  var ALERT_URL = '/sounds/exam-lock-request.mp3?v=1';
  var alertAudio = null;
  function chime() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ctx = new Ctx();
      [[880, 0], [660, 0.22], [880, 0.44]].forEach(function (t) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = t[0];
        g.gain.setValueAtTime(0.0001, ctx.currentTime + t[1]);
        g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t[1] + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t[1] + 0.2);
        o.connect(g); g.connect(ctx.destination);
        o.start(ctx.currentTime + t[1]); o.stop(ctx.currentTime + t[1] + 0.22);
      });
      setTimeout(function () { try { ctx.close(); } catch (e) {} }, 1200);
    } catch (e) {}
  }
  function playAlert() {
    try { if (navigator.vibrate) navigator.vibrate([200, 120, 200]); } catch (e) {}
    if (!ALERT_URL) { chime(); return; }
    try {
      stopAlert();
      var a = new Audio(ALERT_URL);
      alertAudio = a;
      var p = a.play();
      if (p && p.catch) p.catch(chime);
    } catch (e) { chime(); }
  }
  function stopAlert() {
    if (!alertAudio) return;
    try { alertAudio.pause(); } catch (e) {}
    alertAudio = null;
  }

  // ---------------------------------------------------------------- pause
  // While the takeover prompt is up the exam underneath must stand still: the
  // question audio, the speaking timer and the recorder kept running behind
  // the prompt in the first test. Each runner has its own pause control, so
  // the prompt presses it (and presses it again when the student refuses).
  // A runner the student had already paused is left alone.
  var PAUSERS = [
    { // CEFR + IELTS full mock
      match: function () { return document.getElementById('hdrPauseBtn') && document.getElementById('pauseResumeBtn'); },
      isPaused: function () { return window.examPaused === true; },
      pause: function () { document.getElementById('hdrPauseBtn').click(); },
      resume: function () { document.getElementById('pauseResumeBtn').click(); }
    },
    { // CEFR + IELTS speaking, CEFR writing: #pauseBtn toggles #pauseOverlay
      match: function () { return document.getElementById('pauseBtn') && document.getElementById('pauseOverlay'); },
      isPaused: function () { return document.getElementById('pauseOverlay').classList.contains('show'); },
      pause: function () { document.getElementById('pauseBtn').click(); },
      resume: function () { document.getElementById('pauseBtn').click(); }
    },
    { // IELTS writing: #pauseBtn toggles between ⏸ and ▶
      match: function () { return document.getElementById('pauseBtn'); },
      isPaused: function () { return (document.getElementById('pauseBtn').textContent || '').indexOf('▶') !== -1; },
      pause: function () { document.getElementById('pauseBtn').click(); },
      resume: function () { document.getElementById('pauseBtn').click(); }
    }
  ];
  var heldPauser = null, heldMedia = [], heldSpeech = false;

  function holdExam() {
    if (heldPauser || heldMedia.length || heldSpeech) return;
    try {
      for (var i = 0; i < PAUSERS.length; i++) {
        if (PAUSERS[i].match()) {
          if (!PAUSERS[i].isPaused()) { PAUSERS[i].pause(); heldPauser = PAUSERS[i]; }
          break;
        }
      }
    } catch (e) {}
    // Anything still playing that the runner's own pause did not cover
    // (listening audio, reading pages without a pause button).
    try {
      document.querySelectorAll('audio, video').forEach(function (m) {
        if (!m.paused && !m.ended) { try { m.pause(); heldMedia.push(m); } catch (e) {} }
      });
    } catch (e) {}
    try {
      if (window.speechSynthesis && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause(); heldSpeech = true;
      }
    } catch (e) {}
  }

  function releaseExam() {
    var p = heldPauser, media = heldMedia, speech = heldSpeech;
    heldPauser = null; heldMedia = []; heldSpeech = false;
    try { if (p && p.isPaused()) p.resume(); } catch (e) {}
    media.forEach(function (m) { try { var r = m.play(); if (r && r.catch) r.catch(function () {}); } catch (e) {} });
    try { if (speech && window.speechSynthesis) window.speechSynthesis.resume(); } catch (e) {}
  }

  // The last five seconds tick audibly: five short beeps, the last one higher.
  function tickBeep(last) {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ctx = new Ctx(), o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = last ? 1320 : 880;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (last ? 0.35 : 0.15));
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + (last ? 0.4 : 0.18));
      setTimeout(function () { try { ctx.close(); } catch (e) {} }, 700);
    } catch (e) {}
  }

  function showRequest(req) {
    if (answeringId === req.id && root) {
      var c = $('cd'); if (c) c.textContent = mmss(Number(req.expires_in) || 0);
      return;
    }
    answeringId = req.id;
    var deadline = Date.now() + (Number(req.expires_in) || 60) * 1000;
    show(
      '<div class="card">' +
        '<div class="ico blue">📲</div>' +
        '<h2>Boshqa qurilmadan so‘rov keldi</h2>' +
        '<p>Hisobingiz orqali boshqa qurilmada imtihonni davom ettirish so‘ralmoqda.</p>' +
        rows([
          ['Qurilma', deviceText(req)],
          ['IP manzil', ipText(req), true],
          ['Imtihon', req.exam_label || '—']
        ]) +
        '<div class="countdown"><div class="cd-num" id="cd">' + mmss((deadline - Date.now()) / 1000) + '</div>' +
          '<div class="cd-text">Javob bermasangiz, sanoq tugagach <b>imtihon boshqa qurilmaga o‘tkaziladi va bu qurilmada to‘xtatiladi</b>.</div></div>' +
        '<div class="note">Imtihonni shu qurilmada davom ettirish uchun <b>“Rad etish”</b> tugmasini bosing. Agar bu so‘rovni siz yubormagan bo‘lsangiz, markaz administratoriga murojaat qiling.</div>' +
        '<div class="btns">' +
          '<button class="primary" id="deny">Rad etish — shu yerda davom etaman</button>' +
          '<button class="danger" id="allow">Ruxsat berish</button>' +
        '</div>' +
      '</div>', true
    );
    holdExam();
    playAlert();
    var lastBeep = 0;
    var tick = setInterval(function () {
      var c = $('cd');
      if (!c || answeringId !== req.id) { clearInterval(tick); return; }
      var left = (deadline - Date.now()) / 1000;
      c.textContent = mmss(left);
      if (left <= 10) c.classList.add('urgent');
      var whole = Math.ceil(left);
      if (whole >= 1 && whole <= 5 && whole !== lastBeep) {
        lastBeep = whole;
        if (whole === 5) stopAlert();
        tickBeep(whole === 1);
      }
      // At zero ask the server at once rather than waiting for the next beat.
      if (left <= -1) { clearInterval(tick); scheduleBeat(0.1); }
    }, 250);
    var answer = function (approve) {
      stopAlert();
      var a = $('allow'), d = $('deny');
      if (a) a.disabled = true; if (d) d.disabled = true;
      call({ action: 'answer', session_id: sessionId, device_key: dkey, request_id: req.id, approve: approve }, false)
        .then(function (r) {
          clearInterval(tick);
          answeringId = null;
          if (approve && r && r.status === 'approved') { approvedHere = true; showEnded('taken_over', req); return; }
          hide();
          releaseExam();
          scheduleBeat();
        });
    };
    $('deny').onclick = function () { answer(false); };
    $('allow').onclick = function () { answer(true); };
  }

  function showEnded(reason, by) {
    stopped = true;
    stopBeats();
    clearWaits();
    stopMedia();
    sessionId = null;
    var lead = reason === 'expired'
      ? 'Bu qurilma bilan aloqa uzilgan paytda hisobingiz orqali boshqa qurilmada imtihon boshlandi.'
      : approvedHere
        ? 'Siz ruxsat berganingizdan so‘ng imtihon boshqa qurilmaga o‘tkazildi. Bu qurilmada imtihon to‘xtatildi.'
        : 'Boshqa qurilmadan kelgan so‘rovga 1 daqiqa ichida javob berilmagani sababli imtihon o‘sha qurilmaga o‘tkazildi.';
    show(
      '<div class="card">' +
        '<div class="ico red">⛔</div>' +
        '<h2>Imtihon boshqa qurilmada davom etmoqda</h2>' +
        '<p>' + lead + '</p>' +
        (by ? rows([['Qurilma', deviceText(by)], ['IP manzil', ipText(by), true]]) : '') +
        '<div class="note">Premium obunada bir vaqtning o‘zida faqat bitta qurilmada imtihon topshirish mumkin.</div>' +
        '<div class="btns"><button class="primary" id="home">Bosh sahifaga qaytish</button></div>' +
      '</div>'
    );
    $('home').onclick = goHome;
  }

  // ---------------------------------------------------------------- page life

  function end(reason) {
    if (!sessionId) return;
    var id = sessionId;
    sessionId = null;
    stopBeats();
    call({ action: 'end', session_id: id, device_key: dkey, reason: reason || 'closed' }, false);
  }

  window.addEventListener('pagehide', function () { end('closed'); });
  window.addEventListener('pageshow', function (e) {
    // Back from the bfcache: the session was ended on the way out.
    if (e.persisted && !stopped && !sessionId && !host) start();
  });

  window.MsExamLock = {
    end: end,
    // for the localhost preview and support: what this page thinks it is
    info: function () { return { exam: examInfo(), device: deviceLabel(), center: centerId(), session: sessionId, tracked: !!sessionId }; },
    _preview: { blocked: showBlocked, request: showRequest, ended: showEnded, hide: hide }
  };

  // Support trace (see landing-v3 head + /diag): why did this page leave?
  function trace(m) {
    try {
      var a = JSON.parse(sessionStorage.getItem('ms_trace') || '[]');
      a.push(new Date().toTimeString().slice(0, 8) + ' ' + String(m).slice(0, 160));
      if (a.length > 80) a = a.slice(-80);
      sessionStorage.setItem('ms_trace', JSON.stringify(a));
    } catch (e) {}
  }
  trace('exam page loaded ' + decodeURIComponent(location.pathname).split('/').pop() + location.search.slice(0, 50));
  function wrapLeave(name) {
    var orig = window[name];
    if (typeof orig !== 'function' || orig.__msWrapped) return;
    var w = function () {
      var where = '';
      try { where = (new Error().stack || '').split('\n').slice(2, 4).join(' | ').replace(/https?:\/\/[^\s)]*\//g, ''); } catch (e) {}
      trace(name + '() called ' + where.slice(0, 140));
      return orig.apply(this, arguments);
    };
    w.__msWrapped = true;
    window[name] = w;
  }
  ['goToLanding', 'goBack', 'returnToLanding'].forEach(wrapLeave);
  document.addEventListener('DOMContentLoaded', function () { ['goToLanding', 'goBack', 'returnToLanding'].forEach(wrapLeave); });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
