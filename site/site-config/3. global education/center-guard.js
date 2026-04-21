// ============================================================================
// CENTER GUARD — Enforcement layer for Centers Management
// ============================================================================
// Loaded automatically by site-config.js on every page.
// Reads center config from Supabase (cached in localStorage for 5 min)
// and enforces: active/locked/maintenance, branding, feature toggles,
// operating hours, mock access, score boost, limits, etc.
// ============================================================================

(function () {
  'use strict';

  var CG_SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var CG_SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
  var CG_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  var cfg = window.SITE_CONFIG;
  if (!cfg || !cfg.testIdentifier) return;
  var testId = cfg.testIdentifier;

  // ── Blocking Overlay Helper ───────────────────────────────────────────────
  function _cgBlockScreen(icon, title, subtitle, color) {
    var existing = document.getElementById('cgBlockOverlay');
    if (existing) existing.remove();
    var div = document.createElement('div');
    div.id = 'cgBlockOverlay';
    div.style.cssText = 'position:fixed;inset:0;z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fff;color:#333;font-family:-apple-system,BlinkMacSystemFont,sans-serif;text-align:center;padding:24px;';
    div.innerHTML =
      '<div style="font-size:64px;margin-bottom:16px;">' + icon + '</div>' +
      '<h1 style="font-size:22px;font-weight:700;margin:0 0 8px;color:' + (color || '#333') + ';">' + title + '</h1>' +
      '<p style="font-size:14px;color:#666;max-width:400px;margin:0;">' + subtitle + '</p>' +
      '<div style="margin-top:24px;font-size:12px;color:#aaa;">If you believe this is an error, contact the administrator.</div>';
    (document.body || document.documentElement).appendChild(div);
    // Prevent interaction with page behind
    document.body.style.overflow = 'hidden';
  }

  function _cgRemoveBlock() {
    var el = document.getElementById('cgBlockOverlay');
    if (el) el.remove();
    document.body.style.overflow = '';
  }

  // ── Detect current mock page ──────────────────────────────────────────────
  function _cgDetectMockKey() {
    var path = location.pathname.toLowerCase();
    var map = {
      'speaking mocks':       'cefr_speaking',
      'speaking ielts':       'ielts_speaking',
      'ielts speaking':       'ielts_speaking',
      'writing mocks':        'cefr_writing',
      'writing ielts':        'ielts_writing',
      'cefr listening mocks': 'cefr_listening',
      'cefr listening':       'cefr_listening',
      'ielts listening mocks':'ielts_listening',
      'ielts listening':      'ielts_listening',
      'cefr reading mocks':   'cefr_reading',
      'cefr reading':         'cefr_reading',
      'ielts reading mocks':  'ielts_reading',
      'ielts reading':        'ielts_reading',
      'full-mock':            'cefr_full_mock',
      'ielts-full-mock':      'ielts_full_mock'
    };
    for (var key in map) {
      if (path.indexOf(key.replace(/ /g, '%20')) !== -1 || path.indexOf(key.replace(/ /g, '-')) !== -1 || path.indexOf(key) !== -1) {
        return map[key];
      }
    }
    return null;
  }

  // ── Cache Helpers (per-center to avoid cross-site collisions) ─────────────
  var CG_CACHE_KEY = 'cg_cc_' + testId;
  var CG_CACHE_TS_KEY = 'cg_cc_ts_' + testId;

  function _cgGetCached() {
    try {
      var ts = parseInt(localStorage.getItem(CG_CACHE_TS_KEY) || '0', 10);
      if (Date.now() - ts < CG_CACHE_TTL) {
        var raw = localStorage.getItem(CG_CACHE_KEY);
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {}
    return null;
  }

  function _cgSetCache(data) {
    try {
      localStorage.setItem(CG_CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CG_CACHE_TS_KEY, String(Date.now()));
    } catch (e) {}
  }

  // ── Fetch from Supabase ───────────────────────────────────────────────────
  function _cgFetchConfig() {
    var key = 'center_config_' + testId;
    return fetch(CG_SB_URL + '/rest/v1/site_settings?key=eq.' + encodeURIComponent(key) + '&select=value', {
      headers: { 'apikey': CG_SB_KEY, 'Authorization': 'Bearer ' + CG_SB_KEY }
    })
      .then(function (r) { return r.json(); })
      .then(function (rows) {
        if (Array.isArray(rows) && rows.length > 0 && rows[0].value) {
          var parsed = JSON.parse(rows[0].value);
          _cgSetCache(parsed);
          return parsed;
        }
        return null;
      })
      .catch(function (e) {
        console.warn('[CenterGuard] Fetch error:', e);
        return null;
      });
  }

  // ── Apply Enforcement ─────────────────────────────────────────────────────
  function _cgEnforce(cc) {
    if (!cc) return;

    // Store for other scripts to read
    window._centerConfig = cc;

    // ─── 1. ACTIVE CHECK ────────────────────────────────────────────────
    if (cc.active === false) {
      _cgBlockScreen('🚫', 'Center Deactivated', 'This learning center is currently deactivated. Access to all exams and features has been suspended.', '#dc2626');
      return; // No further enforcement needed
    }

    // ─── 2. MAINTENANCE MODE ────────────────────────────────────────────
    if (cc.maintenanceMode === true) {
      _cgBlockScreen('🔧', 'Under Maintenance', 'We are performing scheduled maintenance. Please check back shortly.', '#f59e0b');
      return;
    }

    // ─── 3. LOCKED ──────────────────────────────────────────────────────
    if (cc.locked === true) {
      _cgBlockScreen('🔒', 'Center Locked', 'This learning center is temporarily locked. Please contact the administrator to unlock access.', '#7c3aed');
      return;
    }

    // ─── 4. OPERATING HOURS ─────────────────────────────────────────────
    if (cc.operatingHoursEnabled) {
      var now = new Date();
      var hhmm = ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);
      var start = cc.operatingHoursStart || '09:00';
      var end = cc.operatingHoursEnd || '18:00';
      if (hhmm < start || hhmm >= end) {
        _cgBlockScreen('⏰', 'Outside Operating Hours', 'This center is available from ' + start + ' to ' + end + '. Please come back during operating hours.', '#6366f1');
        return;
      }
    }

    // ─── 5. EXAM SCHEDULE MODE ──────────────────────────────────────────
    if (cc.examScheduleMode && cc.examScheduleDate) {
      var scheduled = new Date(cc.examScheduleDate);
      if (!isNaN(scheduled.getTime()) && Date.now() < scheduled.getTime()) {
        var dateStr = scheduled.toLocaleDateString() + ' ' + scheduled.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        _cgBlockScreen('🗓️', 'Exam Not Yet Available', 'Mocks will unlock on: ' + dateStr, '#0d9488');
        return;
      }
    }

    // ─── 6. MOCK ACCESS (page-level block) ──────────────────────────────
    var mockKey = _cgDetectMockKey();
    if (mockKey && cc.mocks && cc.mocks[mockKey] === 'disabled') {
      _cgBlockScreen('🚫', 'Mock Not Available', 'This exam type is not available at your center.', '#dc2626');
      return;
    }

    // ─── 6b. PRACTICE MODE (hide part-based practice buttons) ──────────
    if (mockKey && cc.mocks && cc.mocks[mockKey + '_practice'] === 'disabled') {
      window.CG_PRACTICE_DISABLED = true;
      _cgWhenReady(function() {
        var s = document.getElementById('cg-practice-disabled');
        if (!s) {
          s = document.createElement('style');
          s.id = 'cg-practice-disabled';
          s.textContent = '.mode-practice{display:none!important}';
          document.head.appendChild(s);
        }
      });
    }

    // ─── 7. MOCK ACCESS LEVEL (override access) ────────────────────────
    if (mockKey && cc.mocks) {
      var lvl = cc.mocks[mockKey];
      if (lvl === 'regular') {
        // Grant access but without premium AI
        try {
          sessionStorage.setItem('vipSessionAccess', 'true');
          sessionStorage.removeItem('vipPremiumAi');
          // Also remove mock-specific premium flags set by URL params or landing page
          if (mockKey.indexOf('speaking') !== -1) sessionStorage.removeItem('speakingPremiumEntry');
          if (mockKey.indexOf('writing') !== -1) sessionStorage.removeItem('writingPremiumEntry');
        } catch (e) {}
      } else if (lvl === 'premium') {
        try {
          sessionStorage.setItem('vipSessionAccess', 'true');
          sessionStorage.setItem('vipPremiumAi', 'true');
        } catch (e) {}
      }
    }

    // ─── 8. SCORE BOOST OVERRIDE ────────────────────────────────────────
    if (typeof cc.scoreBoost === 'number' && window.SITE_CONFIG) {
      window.SITE_CONFIG.scoreBoost = cc.scoreBoost;
    }

    // Remove any stale block overlay
    _cgRemoveBlock();

    // ─── DOM-dependent enforcement (wait for DOM) ───────────────────────
    _cgWhenReady(function () {
      _cgApplyVisualSettings(cc);
    });
  }

  // ── Wait for DOM ──────────────────────────────────────────────────────────
  function _cgWhenReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  // ── Visual / Feature Enforcement ──────────────────────────────────────────
  function _cgApplyVisualSettings(cc) {

    // ─── BRAND COLOR ────────────────────────────────────────────────────
    if (cc.brandColor && cc.brandColor !== '#7c3aed' && cc.brandColor !== '') {
      var c = cc.brandColor;
      // Override header gradient
      var header = document.querySelector('.header');
      if (header) header.style.background = 'linear-gradient(135deg, ' + c + ', ' + _cgDarken(c, 30) + ')';
      // Override CSS variables for buttons and accents
      var style = document.createElement('style');
      style.textContent =
        '.skill-btn:hover, .skill-btn.active { border-color: ' + c + ' !important; }' +
        '.card-btn { background: linear-gradient(135deg, ' + c + ', ' + _cgDarken(c, 20) + ') !important; }' +
        '.full-mock-card { border-color: ' + c + '33 !important; }' +
        '.full-mock-card:hover { border-color: ' + c + ' !important; box-shadow: 0 8px 30px ' + c + '22 !important; }';
      document.head.appendChild(style);
    }

    // ─── WELCOME MESSAGE ────────────────────────────────────────────────
    if (cc.welcomeMessage) {
      var h2 = document.querySelector('.welcome-section h2');
      if (h2) h2.textContent = cc.welcomeMessage;
    }

    // ─── HIDE POWERED BY ────────────────────────────────────────────────
    if (cc.hidePoweredBy) {
      var footerEls = document.querySelectorAll('.footer, footer');
      footerEls.forEach(function (el) {
        var text = el.textContent || '';
        if (text.toLowerCase().indexOf('mock stream') !== -1 || text.toLowerCase().indexOf('powered') !== -1) {
          el.querySelectorAll('span, p, div, a').forEach(function (sub) {
            if ((sub.textContent || '').toLowerCase().indexOf('powered') !== -1 ||
                (sub.textContent || '').toLowerCase().indexOf('mock stream') !== -1) {
              sub.style.display = 'none';
            }
          });
        }
      });
    }

    // ─── FEATURE TOGGLES ────────────────────────────────────────────────
    // Help Center
    if (cc.helpCenter === false) {
      _cgHideAll('#chatBubble, #chatBubbleBtn, .helpcenter-overlay, .chat-bubble, [onclick*="openHelpCenter"]');
    }

    // Certificates (hide cert/PDF buttons)
    if (cc.certificates === false) {
      _cgHideAll('.modal-pdf-btn, #categoryModalPdfBtn, [onclick*="verifySpeaking"], [onclick*="downloadCertificate"], [onclick*="generateCertificate"]');
    }

    // Flashcards
    if (cc.flashcards === false) {
      _cgHideAll('.learning-tool-btn.flashcards, [onclick*="flashcards"]');
      // Also hide flashcards card in main content
      var fcards = document.querySelectorAll('.learning-tool-card');
      fcards.forEach(function (el) { if ((el.textContent || '').indexOf('Flashcards') !== -1) el.style.display = 'none'; });
    }

    // Articles
    if (cc.articles === false) {
      _cgHideAll('.learning-tool-btn.articles, [onclick*="articles"]');
      var acards = document.querySelectorAll('.learning-tool-card');
      acards.forEach(function (el) { if ((el.textContent || '').indexOf('Articles') !== -1) el.style.display = 'none'; });
    }

    // Telegram Notifications (disable result forwarding)
    if (cc.telegramNotifs === false) {
      window.sendToRoutingBackend = function () { /* disabled by center config */ };
    }

    // Leaderboard
    if (cc.leaderboard === false) {
      _cgHideAll('#fullMockProgress, .full-mock-progress-container, [onclick*="leaderboard"], .leaderboard');
    }

    // Plus feature deactivation helper
    function _cgDeactivatePlus(btnId, menuId) {
      var btn = document.getElementById(btnId);
      if (btn && !btn._cgDeactivated) {
        btn._cgDeactivated = true;
        btn.disabled = true;
        btn.style.cssText = 'width:100%;opacity:0.45;pointer-events:none;background:#f3f4f6 !important;border:2px solid #d1d5db !important;position:relative;overflow:hidden;';
        var title = btn.querySelector('.option-title'); if (title) title.style.color = '#9ca3af';
        var desc = btn.querySelector('.option-desc'); if (desc) { desc.textContent = 'Use your exam materials'; desc.style.color = '#ef4444'; }
        var badge = btn.querySelector('span[style*="background:linear-gradient"]');
        if (badge) { badge.style.background = '#9ca3af'; badge.textContent = 'OFF'; }
      }
      var menu = document.getElementById(menuId);
      if (menu) { menu.style.opacity = '0.45'; menu.style.pointerEvents = 'none'; }
    }
    if (cc.writingPlus === false) _cgDeactivatePlus('writingPlusBtn', 'writingPlusMenuItem');
    if (cc.speakingPlus === false) _cgDeactivatePlus('speakingPlusBtn', 'speakingPlusMenuItem');
    if (cc.readingPlus === false) _cgDeactivatePlus('readingPlusBtn', 'readingPlusMenuItem');
    if (cc.listeningPlus === false) _cgDeactivatePlus('listeningPlusBtn', 'listeningPlusMenuItem');

    // ─── MOCK ACCESS (hide disabled mocks from landing page cards) ──────
    if (cc.mocks) {
      var mockCardMap = {
        'cefr_speaking': 'Speaking',
        'ielts_speaking': 'IELTS Speaking',
        'cefr_writing': 'Writing',
        'ielts_writing': 'IELTS Writing',
        'cefr_listening': 'Listening',
        'ielts_listening': 'IELTS Listening',
        'cefr_reading': 'Reading',
        'ielts_reading': 'IELTS Reading',
        'cefr_full_mock': 'Full Mock',
        'ielts_full_mock': 'IELTS Full Mock'
      };
      for (var mk in cc.mocks) {
        if (cc.mocks[mk] === 'disabled' && mockCardMap[mk]) {
          // Find and badge disabled mock buttons/links in sidebar
          var allBtns = document.querySelectorAll('.skill-btn, .exam-card, .card-btn');
          allBtns.forEach(function (btn) {
            var txt = (btn.textContent || '').toLowerCase();
            var cardName = mockCardMap[mk].toLowerCase();
            if (txt.indexOf(cardName) !== -1) {
              btn.style.opacity = '0.4';
              btn.style.pointerEvents = 'none';
              btn.title = 'This mock is not available at your center';
            }
          });
        }
      }
    }

    // ─── LIMITS (daily mock limit & max attempts) ───────────────────────
    if (cc.dailyMockLimit && cc.dailyMockLimit > 0) {
      var today = new Date().toISOString().slice(0, 10);
      var dlKey = 'cg_daily_' + testId + '_' + today;
      var dailyCount = parseInt(localStorage.getItem(dlKey) || '0', 10);
      window._cgDailyMockCount = dailyCount;
      window._cgDailyMockLimit = cc.dailyMockLimit;
      // Expose for mock pages to call _cgIncrementDaily() after starting a mock
    }

    if (cc.maxAttemptsPerStudent && cc.maxAttemptsPerStudent > 0) {
      window._cgMaxAttempts = cc.maxAttemptsPerStudent;
      // Expose for mock pages to check before starting
    }
  }

  // ── Utility: Hide all elements matching a selector ────────────────────────
  function _cgHideAll(selector) {
    try {
      document.querySelectorAll(selector).forEach(function (el) {
        el.style.display = 'none';
      });
    } catch (e) {}
  }

  // ── Utility: Darken a hex color ───────────────────────────────────────────
  function _cgDarken(hex, amount) {
    hex = hex.replace('#', '');
    var r = Math.max(0, parseInt(hex.substring(0, 2), 16) - amount);
    var g = Math.max(0, parseInt(hex.substring(2, 4), 16) - amount);
    var b = Math.max(0, parseInt(hex.substring(4, 6), 16) - amount);
    return '#' + ('0' + r.toString(16)).slice(-2) + ('0' + g.toString(16)).slice(-2) + ('0' + b.toString(16)).slice(-2);
  }

  // ── Expose helpers for mock pages ─────────────────────────────────────────
  window._cgIncrementDaily = function () {
    if (!window._cgDailyMockLimit) return true;
    var today = new Date().toISOString().slice(0, 10);
    var dlKey = 'cg_daily_' + testId + '_' + today;
    var count = parseInt(localStorage.getItem(dlKey) || '0', 10) + 1;
    if (count > window._cgDailyMockLimit) {
      alert('Daily mock limit reached (' + window._cgDailyMockLimit + ' mocks/day). Please try again tomorrow.');
      return false;
    }
    localStorage.setItem(dlKey, String(count));
    return true;
  };

  window._cgCheckAttempts = function (mockKey) {
    if (!window._cgMaxAttempts) return true;
    var name = '';
    try { name = sessionStorage.getItem('studentName') || localStorage.getItem('ms_student_name') || 'unknown'; } catch (e) {}
    var aKey = 'cg_attempts_' + testId + '_' + name + '_' + (mockKey || 'general');
    var count = parseInt(localStorage.getItem(aKey) || '0', 10);
    if (count >= window._cgMaxAttempts) {
      alert('Maximum attempts reached (' + window._cgMaxAttempts + ') for this mock. Please contact the administrator.');
      return false;
    }
    localStorage.setItem(aKey, String(count + 1));
    return true;
  };

  // ── Apply access overrides immediately (before DOM ready) ─────────────────
  function _cgApplyAccessNow(cc) {
    if (!cc) return;
    window._centerConfig = cc;
    var mockKey = _cgDetectMockKey();
    if (mockKey && cc.mocks) {
      var lvl = cc.mocks[mockKey];
      if (lvl === 'regular') {
        try {
          sessionStorage.setItem('vipSessionAccess', 'true');
          sessionStorage.removeItem('vipPremiumAi');
          if (mockKey.indexOf('speaking') !== -1) sessionStorage.removeItem('speakingPremiumEntry');
          if (mockKey.indexOf('writing') !== -1) sessionStorage.removeItem('writingPremiumEntry');
        } catch (e) {}
      } else if (lvl === 'premium') {
        try {
          sessionStorage.setItem('vipSessionAccess', 'true');
          sessionStorage.setItem('vipPremiumAi', 'true');
        } catch (e) {}
      } else if (lvl === 'disabled') {
        // Will be fully blocked once DOM is ready
      }
    }
  }

  // ── Main: Load config and enforce ─────────────────────────────────────────
  // Step 1: Apply from cache immediately (non-blocking)
  var cached = _cgGetCached();
  if (cached) {
    // Immediately apply access override from cache (before inline scripts run)
    _cgApplyAccessNow(cached);
    // Full enforcement (blocking overlays, visual settings) at DOM ready
    _cgWhenReady(function () { _cgEnforce(cached); });
  }

  // Step 2: Fetch fresh config from Supabase (in background)
  _cgFetchConfig().then(function (fresh) {
    if (fresh) {
      // Always apply access override immediately from fresh config
      _cgApplyAccessNow(fresh);
      // If cache was stale or missing, do full enforcement now
      if (!cached) {
        _cgEnforce(fresh);
      } else {
        // If fresh differs from cache, re-enforce
        if (JSON.stringify(fresh) !== JSON.stringify(cached)) {
          _cgEnforce(fresh);
        }
      }
    }
  });

})();
