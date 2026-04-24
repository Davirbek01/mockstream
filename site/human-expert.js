// ============================================================================
// HUMAN EXPERT + PAPER-MODE HELPER
// ============================================================================
// Provides a single source of truth for the per-center "Official Scoring
// Service" (Human Expert) modal content + Telegram prefilled message, and
// applies the "Paper-Based Exam" disabled state on writing mocks.
//
// Reads from  window._centerConfig  which is populated by center-guard.js
// (site-config/center-guard.js) after it fetches the row
//   site_settings.key = 'center_config_' + testIdentifier
//
// Fields consumed (all optional — defaults below):
//   humanExpert.enabled          : boolean (shows/hides #consultBtn and similar)
//   humanExpert.title            : string  (modal <h2> text)
//   humanExpert.warningHtml      : string  (modal body HTML; supports {price},{delivery})
//   humanExpert.price            : string  (e.g. "20,000 so'm")
//   humanExpert.delivery         : string  (e.g. "24 hours")
//   humanExpert.cardNumber       : string  (e.g. "9860 1606 4003 0377")
//   humanExpert.telegramUser     : string  ("@handle", "handle", or full URL)
//   humanExpert.messageTemplate  : string  (placeholders: {test},{name},{mock},{date},{testId},{price},{card},{delivery})
//   writingPaperMode             : boolean (true = show paper button; false = grey+deactivated)
//
// Public API:
//   window.MockStream.humanExpert.resolveConfig()          → resolved config object
//   window.MockStream.humanExpert.buildTelegramUrl(vars)   → full t.me URL with prefilled text
//   window.MockStream.humanExpert.renderModal(el|id)       → fills #paidServiceModal content
//   window.MockStream.humanExpert.applyPaperModeState(el|id) → greys #paperExamBtn if disabled
//   window.MockStream.humanExpert.isEnabled()              → boolean for #consultBtn visibility
// ============================================================================

(function () {
  'use strict';

  var DEFAULTS = {
    enabled: true,
    title: "Official Scoring Service",
    warningHtml:
      "\u26a0\ufe0f <strong>This is a PAID service.</strong><br><br>" +
      "Your work will be checked by an <strong>officially certified team of professionals</strong>.<br><br>" +
      "\ud83d\udccb Results will be delivered within <strong>{delivery}</strong>.<br><br>" +
      "\ud83d\udcb0 Service fee: <strong>{price}</strong>",
    price: "20,000 so'm",
    delivery: "24 hours",
    cardNumber: "9860 1606 4003 0377",
    telegramUser: "https://t.me/mrkhasanoff3",
    messageTemplate:
      "\ud83d\udc4b Assalomu alaykum!\n" +
      "Men mock topshirdim va ishimni sertifikatga ega mutaxassislar tomonidan tekshirilishini istayman.\n\n" +
      "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n" +
      "\ud83d\udcdd Mock details:\n" +
      "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n" +
      "\ud83c\udf10 Test: {test}\n" +
      "\ud83d\udc64 Test Taker: {name}\n" +
      "\ud83d\udcc4 Mock number: {mock}\n" +
      "\ud83d\udcc5 Test Date: {date}\n" +
      "\ud83c\udff7\ufe0f #{testId}{viewReportLine}\n\n" +
      "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n" +
      "\ud83d\udcb3 To'lov ma'lumotlari:\n" +
      "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n" +
      "\ud83d\udcb0 Narxi: {price}\n" +
      "\ud83c\udfe6 Karta: {card}\n" +
      "\u26a0\ufe0f Screenshot yuborilishi shart!\n\n" +
      "\u2705 Natija {delivery} ichida yuboriladi."
  };

  function interpolate(s, vars) {
    return String(s == null ? '' : s).replace(/\{(\w+)\}/g, function (_, k) {
      return (vars && vars[k] != null) ? vars[k] : '';
    });
  }

  function resolveConfig() {
    var cc = (window._centerConfig && typeof window._centerConfig === 'object') ? window._centerConfig : {};
    var he = (cc.humanExpert && typeof cc.humanExpert === 'object') ? cc.humanExpert : {};
    var out = {};
    for (var k in DEFAULTS) {
      if (!Object.prototype.hasOwnProperty.call(DEFAULTS, k)) continue;
      var v = he[k];
      out[k] = (v === undefined || v === null || v === '') ? DEFAULTS[k] : v;
    }
    // Normalize telegram URL: accept "@handle", "handle", or full URL.
    var tg = String(out.telegramUser || '').trim();
    if (!tg) tg = DEFAULTS.telegramUser;
    if (!/^https?:\/\//i.test(tg) && !/^tg:\/\//i.test(tg)) {
      tg = 'https://t.me/' + tg.replace(/^@+/, '').replace(/^\/+/, '');
    }
    out.telegramUrl = tg;
    return out;
  }

  function isEnabled() {
    var cfg = resolveConfig();
    return cfg.enabled !== false;
  }

  function buildTelegramUrl(vars) {
    var cfg = resolveConfig();
    vars = vars || {};
    // Build the protected View Report line. We auto-pick the URL from
    // window._lastSavedViewUrl (stamped by supabase-send.js after a
    // successful save). Caller can also pass `vars.viewUrl` to override.
    // We append `&lock=1` so view.html will require a passcode to open
    // (prevents leakage if the teacher forwards the prefilled message).
    var rawViewUrl = vars.viewUrl || (typeof window !== 'undefined' && window._lastSavedViewUrl) || '';
    var lockedViewUrl = '';
    if (rawViewUrl) {
      lockedViewUrl = rawViewUrl + (rawViewUrl.indexOf('?') === -1 ? '?' : '&') + 'lock=1';
    }
    var viewReportLine = lockedViewUrl ? ('\n\ud83d\udcce View Report: ' + lockedViewUrl) : '';
    var filled = interpolate(cfg.messageTemplate, {
      test: vars.test || '',
      name: vars.name || 'Unknown',
      mock: vars.mock || '01',
      date: vars.date || '',
      testId: vars.testId || (window.SITE_CONFIG && window.SITE_CONFIG.testIdentifier) || 'mock_stream',
      price: cfg.price,
      card: cfg.cardNumber,
      delivery: cfg.delivery,
      viewReport: lockedViewUrl,
      viewReportLine: viewReportLine
    });
    return cfg.telegramUrl + '?text=' + encodeURIComponent(filled);
  }

  function _el(x) { return (typeof x === 'string') ? document.getElementById(x) : x; }

  function renderModal(modalOrId) {
    var modal = _el(modalOrId) || document.getElementById('paidServiceModal');
    if (!modal) return;
    var cfg = resolveConfig();

    // Title — first <h2> inside the modal card
    var h2 = modal.querySelector('h2');
    if (h2) h2.textContent = cfg.title;

    // Warning body: prefer explicit [data-he-warning] hook; else first <p> in the warning box.
    var warnEl = modal.querySelector('[data-he-warning]');
    if (!warnEl) {
      // Heuristic: find a <p> that currently contains "paid" / "certified" / "Service fee"
      var ps = modal.querySelectorAll('p');
      for (var i = 0; i < ps.length; i++) {
        var t = (ps[i].textContent || '').toLowerCase();
        if (t.indexOf('paid') !== -1 || t.indexOf('certified') !== -1 || t.indexOf('service fee') !== -1) {
          warnEl = ps[i];
          break;
        }
      }
    }
    if (warnEl) {
      warnEl.innerHTML = interpolate(cfg.warningHtml, { price: cfg.price, delivery: cfg.delivery });
    }
  }

  // Apply expert-enabled toggle — hides #consultBtn (or any [data-he-btn]) if disabled.
  function applyEnabledState() {
    var enabled = isEnabled();
    var btns = document.querySelectorAll('#consultBtn, [data-he-btn]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].style.display = enabled ? '' : 'none';
    }
  }

  function applyPaperModeState(btnOrId) {
    var btn = _el(btnOrId) || document.getElementById('paperExamBtn');
    if (!btn) return;
    var cc = window._centerConfig || {};
    // Default: enabled unless explicitly set to false
    var enabled = cc.writingPaperMode !== false;

    // Clean prior state
    var oldBadge = btn.querySelector('.he-deactivated-badge');
    if (oldBadge) oldBadge.remove();
    btn.removeAttribute('data-he-paper-locked');

    if (enabled) {
      btn.style.opacity = '';
      btn.style.cursor = '';
      btn.style.filter = '';
      btn.disabled = false;
    } else {
      btn.style.opacity = '0.55';
      btn.style.cursor = 'not-allowed';
      btn.style.filter = 'grayscale(60%)';
      // Don't set `disabled` — we want to still catch clicks to show the reason.
      btn.setAttribute('data-he-paper-locked', '1');

      var badge = document.createElement('span');
      badge.className = 'he-deactivated-badge';
      badge.textContent = 'Deactivated by your center';
      badge.style.cssText = 'display:block;color:#dc2626;font-weight:700;font-size:12px;margin-top:4px;letter-spacing:0.3px;';
      btn.appendChild(badge);

      // Capture-phase click blocker: must be installed once.
      if (!btn.__heCaptureInstalled) {
        btn.__heCaptureInstalled = true;
        btn.addEventListener('click', function (e) {
          if (btn.getAttribute('data-he-paper-locked') === '1') {
            e.preventDefault();
            e.stopImmediatePropagation();
            alert('Paper-Based Exam is deactivated by your center administrator.\nPlease use the Computer-Delivered Exam instead.');
          }
        }, true);
      }
    }
  }

  function autoApply() {
    try { renderModal('paidServiceModal'); } catch (e) {}
    try { applyPaperModeState('paperExamBtn'); } catch (e) {}
    try { applyEnabledState(); } catch (e) {}
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  window.MockStream = window.MockStream || {};
  window.MockStream.humanExpert = {
    resolveConfig: resolveConfig,
    isEnabled: isEnabled,
    buildTelegramUrl: buildTelegramUrl,
    renderModal: renderModal,
    applyPaperModeState: applyPaperModeState,
    applyEnabledState: applyEnabledState,
    autoApply: autoApply,
    defaults: DEFAULTS
  };

  // ── Auto-apply ─────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoApply);
  } else {
    autoApply();
  }
  // center-guard.js emits this event once the fresh config is fetched.
  document.addEventListener('mockStream:centerConfigLoaded', autoApply);
})();
