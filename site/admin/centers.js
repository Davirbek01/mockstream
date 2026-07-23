// ═══════════════════════════════════════════════════════════════════════
// Centers Management — extracted from landing.html as the Phase 6-E pilot.
// landing.html still has its own inline copy of the same logic (so the
// legacy /landing.html?openSiteMgmt=1 → Centers card flow keeps working
// untouched). This module is loaded on demand by /admin.html when the
// "Centers" sidebar item is clicked, and mounts into the right-pane
// container passed by the host instead of creating a fixed-position
// modal overlay.
//
// Exposes window.AdminPanels.centers.open(container).
// ═══════════════════════════════════════════════════════════════════════
(function() {
    var _cmInlineContainer = null;  // set by AdminPanels.centers.open(container)
    var CM_SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
    var CM_SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';

    var CM_CENTERS = [
      { id: 'mock_stream', name: 'Mock Stream',        logo: 'https://i.ibb.co/WN0XY5Lv/logo.png' },
      { id: 'bek',         name: 'Bekzods Multilevel',  logo: 'https://storage.googleapis.com/mockstream-listening-audio/LOGOS/BEK.png' },
      { id: 'global',      name: 'Global Education LC', logo: 'https://i.ibb.co/Xrzrh7x6/image.png' },
      { id: 'niners',      name: 'Niners Academy',      logo: 'https://i.ibb.co/39jVLp1w/image.png' },
      { id: 'muzaffars',   name: 'Muzaffars English',   logo: 'https://i.ibb.co/gMQ80dNn/image.png' }
    ];

    var CM_MOCKS = [
      { key: 'cefr_speaking',  label: 'CEFR Speaking' },
      { key: 'ielts_speaking', label: 'IELTS Speaking' },
      { key: 'cefr_writing',   label: 'CEFR Writing' },
      { key: 'ielts_writing',  label: 'IELTS Writing' },
      { key: 'cefr_listening', label: 'CEFR Listening' },
      { key: 'ielts_listening',label: 'IELTS Listening' },
      { key: 'cefr_reading',   label: 'CEFR Reading' },
      { key: 'ielts_reading',  label: 'IELTS Reading' },
      { key: 'cefr_full_mock', label: 'CEFR Full Mock' },
      { key: 'ielts_full_mock',label: 'IELTS Full Mock' }
    ];

    // Default config for a new center
    function _cmDefaultConfig() {
      var mocks = {};
      CM_MOCKS.forEach(function(m) { mocks[m.key] = 'premium'; });
      return {
        active: true, locked: false, mocks: mocks,
        // Branding
        brandColor: '', welcomeMessage: '', hidePoweredBy: false,
        // AI & Scoring (geminiPlan / transcriberProvider / transcriberGeminiPlan
        // are 'default' = inherit from system prompts unless explicitly overridden)
        scoreBoost: 1, aiProvider: 'default', maxAiCallsDay: 0,
        geminiPlan: 'default', transcriberProvider: 'default', transcriberGeminiPlan: 'default',
        // Vision fact-check — OFF by default. When ON (and the primary
        // scoring AI is text-only), IELTS Writing Task 1 charts and CEFR
        // Speaking Q4 image-pairs get a vision pre-analysis before the
        // main scoring step. The provider for that pre-analysis is the
        // separate visionFactCheckProvider field below (gemini = cheapest;
        // llama-scout = bundle-on-Groq if you already use Groq Whisper).
        // When the primary AI is itself vision-capable (gemini / openai /
        // claude / llama-scout) this toggle is ignored — images are sent
        // straight to the primary in the same scoring call.
        visionFactCheck: false,
        visionFactCheckProvider: 'gemini',
        // Full Mock AI sub-controls
        fullMockAi: {
          cefr_speaking: 'premium', cefr_writing: 'premium',
          ielts_speaking: 'premium', ielts_writing: 'premium'
        },
        // Features
        helpCenter: true, announcements: false, certificates: false, telegramNotifs: true,
        flashcards: true, articles: true, leaderboard: true, writingPlus: true, speakingPlus: true, readingPlus: true, listeningPlus: true,
        // Scheduling
        operatingHoursEnabled: false, operatingHoursStart: '09:00', operatingHoursEnd: '18:00',
        examScheduleMode: false, examScheduleDate: '',
        maintenanceMode: false,
        iosAppDisabled: false, // mobile-app-only kill switch (web unaffected)
        androidAppDisabled: false,
        desktopAppDisabled: false,
        // Analytics
        resultsVisible: true, exportPermission: true, dataIsolation: false,
        // Limits
        maxAttemptsPerStudent: 0, dailyMockLimit: 0,
        // Global Access: 'off' (codes required), 'premium', or 'regular'
        globalAccess: 'off',
        // Skill Access: per-skill open access — 'off', 'premium', or 'regular'
        skillAccess: {
          speaking: 'off', writing: 'off', listening: 'off', reading: 'off', full_mock: 'off'
        },
        // Paper-Based Writing Exam toggle (shown on CEFR Writing Mocks + IELTS Writing Mock)
        writingPaperMode: true,
        // Human Expert modal (per-center editable "Official Scoring Service" popup + prefilled Telegram)
        humanExpert: {
          enabled: true,
          title: "Official Scoring Service",
          warningHtml: "\u26a0\ufe0f <strong>This is a PAID service.</strong><br><br>Your work will be checked by an <strong>officially certified team of professionals</strong>.<br><br>\ud83d\udccb Results will be delivered within <strong>{delivery}</strong>.<br><br>\ud83d\udcb0 Service fee: <strong>{price}</strong>",
          price: "20,000 so'm",
          delivery: "24 hours",
          cardNumber: "9860 1606 4003 0377",
          telegramUser: "https://t.me/mrkhasanoff3",
          messageTemplate: "\ud83d\udc4b Assalomu alaykum!\nMen mock topshirdim va ishimni sertifikatga ega mutaxassislar tomonidan tekshirilishini istayman.\n\n\ud83d\udcdd Mock details:\n\ud83c\udf10 Test: {test}\n\ud83d\udc64 Test Taker: {name}\n\ud83d\udcc4 Mock number: {mock}\n\ud83d\udcc5 Test Date: {date}\n\ud83c\udff7\ufe0f #{testId}\n\n\ud83d\udcb3 To'lov ma'lumotlari:\n\ud83d\udcb0 Narxi: {price}\n\ud83c\udfe6 Karta: {card}\n\u26a0\ufe0f Screenshot yuborilishi shart!\n\n\u2705 Natija {delivery} ichida yuboriladi."
        }
      };
    }

    // Merge saved config with defaults (so new fields get defaults)
    function _cmMergeDefaults(saved) {
      var def = _cmDefaultConfig();
      for (var k in def) {
        if (saved[k] === undefined) saved[k] = def[k];
      }
      if (!saved.mocks) saved.mocks = def.mocks;
      else {
        for (var mk in def.mocks) {
          if (saved.mocks[mk] === undefined) saved.mocks[mk] = def.mocks[mk];
        }
      }
      if (!saved.fullMockAi) saved.fullMockAi = def.fullMockAi;
      else {
        for (var fk in def.fullMockAi) {
          if (saved.fullMockAi[fk] === undefined) saved.fullMockAi[fk] = def.fullMockAi[fk];
        }
      }
      if (!saved.humanExpert) saved.humanExpert = def.humanExpert;
      else {
        for (var hek in def.humanExpert) {
          if (saved.humanExpert[hek] === undefined) saved.humanExpert[hek] = def.humanExpert[hek];
        }
      }
      if (!saved.skillAccess) saved.skillAccess = def.skillAccess;
      else {
        for (var sk in def.skillAccess) {
          if (saved.skillAccess[sk] === undefined) saved.skillAccess[sk] = def.skillAccess[sk];
        }
      }
      return saved;
    }

    var _cmConfigs = {};
    var _cmExpandedSections = {};

    // ── Helpers ──────────────────────────────────────────────────────────────
    function _cmSectionHeader(centerId, sectionKey, icon, title) {
      var expanded = !!(_cmExpandedSections[centerId + '_' + sectionKey]);
      return '<div onclick="_cmToggleSection(\'' + centerId + '\',\'' + sectionKey + '\')" style="display:flex;align-items:center;gap:8px;padding:10px 16px;cursor:pointer;user-select:none;border-top:1px solid var(--ring,#e5e7eb);background:var(--surface-alt,#f9fafb);">' +
        '<span style="font-size:13px;">' + icon + '</span>' +
        '<span style="flex:1;font-size:13px;font-weight:600;">' + title + '</span>' +
        '<span style="font-size:11px;color:#888;transition:transform .2s;' + (expanded ? 'transform:rotate(180deg);' : '') + '">▼</span>' +
      '</div>';
    }

    function _cmToggleInput(centerId, prop, label, checked) {
      return '<label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;user-select:none;">' +
        '<input type="checkbox" ' + (checked ? 'checked' : '') + ' onchange="_cmSetProp(\'' + centerId + '\',\'' + prop + '\',this.checked)" style="accent-color:#7c3aed;width:15px;height:15px;">' +
        '<span style="font-size:12px;">' + label + '</span>' +
      '</label>';
    }

    function _cmNumberInput(centerId, prop, label, value, placeholder) {
      return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;">' +
        '<span style="font-size:12px;min-width:140px;">' + label + '</span>' +
        '<input type="number" min="0" value="' + (value || 0) + '" placeholder="' + (placeholder || '0 = unlimited') + '" onchange="_cmSetProp(\'' + centerId + '\',\'' + prop + '\',parseInt(this.value)||0)" style="width:90px;padding:5px 8px;border:1px solid var(--ring,#e5e7eb);border-radius:6px;font-size:12px;background:var(--surface,#fff);color:var(--ink,#333);">' +
        '<span style="font-size:10px;color:#888;">' + (placeholder || '0 = unlimited') + '</span>' +
      '</div>';
    }

    function _cmTextInput(centerId, prop, label, value, placeholder) {
      return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;">' +
        '<span style="font-size:12px;min-width:140px;">' + label + '</span>' +
        '<input type="text" value="' + _cmEsc(value || '') + '" placeholder="' + (placeholder || '') + '" onchange="_cmSetProp(\'' + centerId + '\',\'' + prop + '\',this.value)" style="flex:1;padding:5px 8px;border:1px solid var(--ring,#e5e7eb);border-radius:6px;font-size:12px;background:var(--surface,#fff);color:var(--ink,#333);">' +
      '</div>';
    }

    // Text input for a nested property (e.g. humanExpert.price). Uses a custom setter function name.
    function _cmNestedTextInput(centerId, setterFn, subKey, label, value, placeholder) {
      return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;">' +
        '<span style="font-size:12px;min-width:140px;">' + label + '</span>' +
        '<input type="text" value="' + _cmEsc(value || '') + '" placeholder="' + (placeholder || '') + '" onchange="' + setterFn + '(\'' + centerId + '\',\'' + subKey + '\',this.value)" style="flex:1;padding:5px 8px;border:1px solid var(--ring,#e5e7eb);border-radius:6px;font-size:12px;background:var(--surface,#fff);color:var(--ink,#333);">' +
      '</div>';
    }

    function _cmNestedTextarea(centerId, setterFn, subKey, label, value, placeholder, rows) {
      return '<div style="display:flex;flex-direction:column;gap:4px;padding:6px 0;">' +
        '<span style="font-size:12px;font-weight:600;">' + label + '</span>' +
        '<textarea rows="' + (rows || 4) + '" placeholder="' + (placeholder || '') + '" onchange="' + setterFn + '(\'' + centerId + '\',\'' + subKey + '\',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--ring,#e5e7eb);border-radius:6px;font-size:12px;background:var(--surface,#fff);color:var(--ink,#333);font-family:inherit;resize:vertical;">' + _cmEsc(value || '') + '</textarea>' +
      '</div>';
    }

    function _cmNestedToggle(centerId, setterFn, subKey, label, checked) {
      return '<label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;user-select:none;">' +
        '<input type="checkbox" ' + (checked ? 'checked' : '') + ' onchange="' + setterFn + '(\'' + centerId + '\',\'' + subKey + '\',this.checked)" style="accent-color:#7c3aed;width:15px;height:15px;">' +
        '<span style="font-size:12px;">' + label + '</span>' +
      '</label>';
    }

    function _cmTimeInput(centerId, prop, label, value) {
      return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;">' +
        '<span style="font-size:12px;min-width:140px;">' + label + '</span>' +
        '<input type="time" value="' + (value || '') + '" onchange="_cmSetProp(\'' + centerId + '\',\'' + prop + '\',this.value)" style="padding:5px 8px;border:1px solid var(--ring,#e5e7eb);border-radius:6px;font-size:12px;background:var(--surface,#fff);color:var(--ink,#333);">' +
      '</div>';
    }

    function _cmSelectInput(centerId, prop, label, value, options) {
      var s = '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;">' +
        '<span style="font-size:12px;min-width:140px;">' + label + '</span>' +
        '<select onchange="_cmSetProp(\'' + centerId + '\',\'' + prop + '\',this.value)" style="padding:5px 8px;border:1px solid var(--ring,#e5e7eb);border-radius:6px;font-size:12px;background:var(--surface,#fff);color:var(--ink,#333);cursor:pointer;">';
      options.forEach(function(o) {
        s += '<option value="' + o.val + '"' + (value === o.val ? ' selected' : '') + '>' + o.label + '</option>';
      });
      s += '</select></div>';
      return s;
    }

    // Compact colour-input row used by the Branding section. Empty string for
    // `value` means "unset" — the swatch falls back to the placeholder hint
    // and the label says "default" so the admin sees the field is overridable.
    function _cmColorRow(centerId, prop, label, value, placeholder) {
      var v = value || '';
      var swatch = v || placeholder || '#cccccc';
      return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;">' +
        '<span style="font-size:12px;min-width:140px;">' + label + '</span>' +
        '<input type="color" value="' + swatch + '" ' +
          'onchange="_cmSetProp(\'' + centerId + '\',\'' + prop + '\',this.value)" ' +
          'style="width:36px;height:28px;border:1px solid var(--ring,#e5e7eb);border-radius:6px;cursor:pointer;padding:1px;">' +
        '<span style="font-size:11px;color:#888;">' + (v || 'default') + '</span>' +
        (v ? '<button type="button" onclick="_cmSetProp(\'' + centerId + '\',\'' + prop + '\',\'\');_cmRenderBody();" ' +
          'title="Clear" style="margin-left:auto;border:0;background:transparent;color:#aaa;font-size:14px;cursor:pointer;">✕</button>' : '') +
      '</div>';
    }

    function _cmEsc(str) { return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

    // ── Overlay ─────────────────────────────────────────────────────────────
    function _cmEnsureOverlay() {
      // Admin-host inline mode: when AdminPanels.centers.open(container) set
      // _cmInlineContainer, render the panel chrome + #cmBody directly into
      // that container — no fixed-position modal, no backdrop. The host page
      // already owns the layout (sidebar + right pane).
      if (_cmInlineContainer) {
        if (document.getElementById('cmBody')) return;
        _cmInlineContainer.innerHTML =
          '<div style="background:var(--surface,#fff);border-radius:14px;border:1px solid var(--ring,#e5e7eb);overflow:hidden;">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--ring,#e5e7eb);background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;">' +
              '<h3 style="margin:0;font-size:17px;font-weight:700;">🏢 Centers Management</h3>' +
            '</div>' +
            '<div id="cmBody" style="padding:16px;">' +
              '<div style="text-align:center;padding:40px;color:#888;">Loading...</div>' +
            '</div>' +
          '</div>';
        return;
      }
      // Legacy modal-overlay mode (preserved verbatim from landing.html in
      // case this module is ever loaded outside the admin host).
      if (document.getElementById('cmOverlay')) return;
      var div = document.createElement('div');
      div.id = 'cmOverlay';
      div.className = 'ru-overlay';
      div.onclick = function(e) { if (e.target === div) closeCentersPanel(); };

      var html = '<div class="ru-panel" style="max-width:900px;max-height:90vh;">' +
        '<div class="ru-header" style="background:linear-gradient(135deg,#7c3aed,#4f46e5);">' +
          '<h3 style="color:#fff;">🏢 Centers Management</h3>' +
          '<button class="ru-close" style="color:#fff;" onclick="closeCentersPanel()">&times;</button>' +
        '</div>' +
        '<div id="cmBody" style="flex:1;overflow-y:auto;padding:16px;">' +
          '<div style="text-align:center;padding:40px;color:#888;">Loading...</div>' +
        '</div>' +
      '</div>';

      div.innerHTML = html;
      document.body.appendChild(div);
    }

    // ── Render ──────────────────────────────────────────────────────────────
    function _cmRenderBody() {
      var body = document.getElementById('cmBody');
      if (!body) return;
      var h = '';

      CM_CENTERS.forEach(function(center) {
        var cfg = _cmConfigs[center.id] || _cmDefaultConfig();
        _cmConfigs[center.id] = cfg;

        var isActive = cfg.active !== false;
        var isLocked = cfg.locked !== false;
        var cid = center.id;

        h += '<div class="cm-card" id="cmCard_' + cid + '" style="border:1px solid var(--ring,#e5e7eb);border-radius:12px;margin-bottom:16px;overflow:hidden;' + (!isActive ? 'opacity:0.55;' : '') + '">';

        // ─── Header row ───
        h += '<div style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--surface-alt,#f9fafb);border-bottom:1px solid var(--ring,#e5e7eb);">';
        h += '<img src="' + center.logo + '" style="width:36px;height:36px;border-radius:8px;object-fit:contain;background:#fff;border:1px solid #e5e7eb;" onerror="this.style.display=\'none\'">';
        h += '<div style="flex:1;"><strong style="font-size:14px;">' + center.name + '</strong>';
        if (cfg.maintenanceMode) h += ' <span style="background:#f59e0b;color:#fff;font-size:10px;padding:2px 6px;border-radius:4px;font-weight:600;">🔧 MAINTENANCE</span>';
        if (cfg.iosAppDisabled) h += ' <span style="background:#6b7280;color:#fff;font-size:10px;padding:2px 6px;border-radius:4px;font-weight:600;">📵 iOS APP OFF</span>';
        if (cfg.androidAppDisabled) h += ' <span style="background:#6b7280;color:#fff;font-size:10px;padding:2px 6px;border-radius:4px;font-weight:600;">📵 ANDROID APP OFF</span>';
        if (cfg.desktopAppDisabled) h += ' <span style="background:#6b7280;color:#fff;font-size:10px;padding:2px 6px;border-radius:4px;font-weight:600;">💻 DESKTOP APP OFF</span>';
        h += '<br><span style="font-size:11px;color:#888;">' + cid + '</span></div>';

        // Active toggle
        h += '<label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;user-select:none;">';
        h += '<span style="color:' + (isActive ? '#10b981' : '#ef4444') + ';font-weight:600;">' + (isActive ? 'Active' : 'Inactive') + '</span>';
        h += '<input type="checkbox" ' + (isActive ? 'checked' : '') + ' onchange="_cmToggle(\'' + cid + '\',\'active\',this.checked)" style="accent-color:#7c3aed;width:16px;height:16px;">';
        h += '</label>';

        // Lock toggle
        h += '<label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;user-select:none;margin-left:8px;">';
        h += '<span>' + (isLocked ? '🔒' : '🔓') + '</span>';
        h += '<input type="checkbox" ' + (isLocked ? 'checked' : '') + ' onchange="_cmToggle(\'' + cid + '\',\'locked\',this.checked)" style="accent-color:#f59e0b;width:16px;height:16px;">';
        h += '</label>';

        h += '</div>'; // end header

        if (isActive) {

          // ═══════════════ MOCK ACCESS ═══════════════
          h += _cmSectionHeader(cid, 'mocks', '🎯', 'Mock Access');
          if (_cmExpandedSections[cid + '_mocks']) {
            h += '<div style="padding:12px 16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">';
            CM_MOCKS.forEach(function(mock) {
              var val = (cfg.mocks && cfg.mocks[mock.key]) || 'premium';
              var bgColor = val === 'premium' ? '#7c3aed' : val === 'regular' ? '#0d9488' : '#dc2626';
              var isFullMock = mock.key === 'cefr_full_mock' || mock.key === 'ielts_full_mock';
              var prefix = mock.key === 'cefr_full_mock' ? 'cefr' : 'ielts';
              h += '<div style="' + (isFullMock ? 'grid-column:1/-1;' : '') + 'padding:8px 10px;border-radius:8px;border:1px solid var(--ring,#e5e7eb);background:var(--surface,#fff);">';
              h += '<div style="display:flex;align-items:center;justify-content:space-between;">';
              h += '<span style="font-size:12px;font-weight:500;">' + mock.label + '</span>';
              h += '<select onchange="_cmSetMock(\'' + cid + '\',\'' + mock.key + '\',this.value)" style="font-size:11px;padding:4px 8px;border-radius:6px;border:1px solid ' + bgColor + ';color:' + bgColor + ';background:#fff;font-weight:600;cursor:pointer;">';
              h += '<option value="premium"' + (val === 'premium' ? ' selected' : '') + '>⭐ Premium</option>';
              h += '<option value="regular"' + (val === 'regular' ? ' selected' : '') + '>📗 Regular</option>';
              h += '<option value="disabled"' + (val === 'disabled' ? ' selected' : '') + '>🚫 Deactivated</option>';
              h += '</select>';
              h += '</div>';
              if (isFullMock && val !== 'disabled') {
                var fmAi = cfg.fullMockAi || {};
                h += '<div style="margin-top:6px;padding-top:6px;border-top:1px dashed #e5e7eb;display:flex;gap:10px;flex-wrap:wrap;">';
                h += '<div style="font-size:10px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;width:100%;">AI Scoring Controls</div>';
                var aiSubs = [
                  { key: prefix + '_speaking', label: '🎙️ Speaking AI' },
                  { key: prefix + '_writing',  label: '✍️ Writing AI' }
                ];
                aiSubs.forEach(function(sub) {
                  var sv = fmAi[sub.key] || 'premium';
                  var sc = sv === 'premium' ? '#7c3aed' : '#0d9488';
                  h += '<div style="display:flex;align-items:center;justify-content:space-between;flex:1;min-width:140px;padding:4px 8px;border-radius:6px;background:#f8fafc;">';
                  h += '<span style="font-size:11px;color:#64748b;">' + sub.label + '</span>';
                  h += '<select onchange="_cmSetFullMockAi(\'' + cid + '\',\'' + sub.key + '\',this.value)" style="font-size:10px;padding:3px 6px;border-radius:5px;border:1px solid ' + sc + ';color:' + sc + ';background:#fff;font-weight:600;cursor:pointer;">';
                  h += '<option value="premium"' + (sv === 'premium' ? ' selected' : '') + '>⭐ AI Enabled</option>';
                  h += '<option value="regular"' + (sv === 'regular' ? ' selected' : '') + '>📊 Standard</option>';
                  h += '</select>';
                  h += '</div>';
                });
                h += '</div>';
              }
              if (!isFullMock && val !== 'disabled') {
                var practiceVal = (cfg.mocks && cfg.mocks[mock.key + '_practice']) || 'enabled';
                var pcColor = practiceVal === 'disabled' ? '#dc2626' : '#0d9488';
                h += '<div style="margin-top:6px;padding-top:6px;border-top:1px dashed #e5e7eb;display:flex;align-items:center;justify-content:space-between;">';
                h += '<span style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">🧩 Practice Mode</span>';
                h += '<select onchange="_cmSetMockPractice(\'' + cid + '\',\'' + mock.key + '\',this.value)" style="font-size:10px;padding:3px 6px;border-radius:5px;border:1px solid ' + pcColor + ';color:' + pcColor + ';background:#fff;font-weight:600;cursor:pointer;">';
                h += '<option value="enabled"' + (practiceVal !== 'disabled' ? ' selected' : '') + '>✅ Enabled</option>';
                h += '<option value="disabled"' + (practiceVal === 'disabled' ? ' selected' : '') + '>🚫 Disabled</option>';
                h += '</select>';
                h += '</div>';
              }
              h += '</div>';
            });
            h += '</div>';
          }

          // ═══════════════ GLOBAL ACCESS ═══════════════
          h += _cmSectionHeader(cid, 'globalAccess', '🌐', 'Global Access');
          if (_cmExpandedSections[cid + '_globalAccess']) {
            var ga = cfg.globalAccess || 'off';
            h += '<div style="padding:12px 16px;">';
            h += '<p style="font-size:11px;color:#64748b;margin:0 0 10px;">When enabled, <strong>all mocks</strong> are accessible without any code, VIP, or email — everyone gets in.</p>';
            h += '<div style="display:flex;gap:8px;">';
            var gaOpts = [
              { val: 'off', label: '🔒 Off (Codes Required)', color: '#64748b' },
              { val: 'premium', label: '⭐ Premium (Open + AI)', color: '#7c3aed' },
              { val: 'regular', label: '📗 Regular (Open, No AI)', color: '#0d9488' }
            ];
            gaOpts.forEach(function(opt) {
              var sel = ga === opt.val;
              h += '<button onclick="_cmSetGlobalAccess(\'' + cid + '\',\'' + opt.val + '\')" style="flex:1;padding:10px 8px;border-radius:10px;border:2px solid ' + (sel ? opt.color : '#e5e7eb') + ';background:' + (sel ? opt.color + '12' : '#fff') + ';cursor:pointer;text-align:center;transition:all .15s;">';
              h += '<div style="font-size:13px;font-weight:700;color:' + (sel ? opt.color : '#333') + ';">' + opt.label + '</div>';
              h += '</button>';
            });
            h += '</div>';
            h += '</div>';
          }

          // ═══════════════ SKILL ACCESS ═══════════════
          h += _cmSectionHeader(cid, 'skillAccess', '🎯', 'Skill Access (Per-Skill Open Access)');
          if (_cmExpandedSections[cid + '_skillAccess']) {
            var sa = cfg.skillAccess || {};
            var ga2 = cfg.globalAccess || 'off';
            h += '<div style="padding:12px 16px;">';
            if (ga2 !== 'off') {
              h += '<div style="background:#fef3c7;border:1.5px solid #f59e0b;border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:11px;color:#92400e;font-weight:600;">⚠️ Global Access is ON — it overrides these per-skill settings.</div>';
            }
            h += '<p style="font-size:11px;color:#64748b;margin:0 0 10px;">Open access for individual skills. When a skill is set to Premium or Regular, <strong>no code/email is needed</strong> for that skill.</p>';
            h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">';
            var skills = [
              { key: 'speaking', label: '🎤 Speaking', icon: '🎤' },
              { key: 'writing', label: '✍️ Writing', icon: '✍️' },
              { key: 'listening', label: '🎧 Listening', icon: '🎧' },
              { key: 'reading', label: '📖 Reading', icon: '📖' },
              { key: 'full_mock', label: '🏆 Full Mock', icon: '🏆' }
            ];
            skills.forEach(function(skill) {
              var sv = sa[skill.key] || 'off';
              var bgColor = sv === 'premium' ? '#7c3aed' : sv === 'regular' ? '#0d9488' : '#64748b';
              h += '<div style="padding:8px 10px;border-radius:8px;border:1px solid var(--ring,#e5e7eb);background:var(--surface,#fff);">';
              h += '<div style="display:flex;align-items:center;justify-content:space-between;">';
              h += '<span style="font-size:12px;font-weight:500;">' + skill.label + '</span>';
              h += '<select onchange="_cmSetSkillAccess(\'' + cid + '\',\'' + skill.key + '\',this.value)" style="font-size:11px;padding:4px 8px;border-radius:6px;border:1px solid ' + bgColor + ';color:' + bgColor + ';background:#fff;font-weight:600;cursor:pointer;">';
              h += '<option value="off"' + (sv === 'off' ? ' selected' : '') + '>🔒 Off</option>';
              h += '<option value="premium"' + (sv === 'premium' ? ' selected' : '') + '>⭐ Premium</option>';
              h += '<option value="regular"' + (sv === 'regular' ? ' selected' : '') + '>📗 Regular</option>';
              h += '</select>';
              h += '</div>';
              h += '</div>';
            });
            h += '</div>';
            h += '</div>';
          }

          // ═══════════════ PER-MOCK ACCESS ═══════════════
          h += _cmSectionHeader(cid, 'mockAccess', '🎟️', 'Per-Mock Access (unlock one mock)');
          if (_cmExpandedSections[cid + '_mockAccess']) {
            var ma = cfg.mockAccess || {};
            var _today = new Date().toISOString().slice(0, 10);
            h += '<div style="padding:12px 16px;">';
            h += '<p style="font-size:11px;color:#64748b;margin:0 0 10px;">Unlock a single mock with no code. <strong>Premium</strong> = with AI · <strong>Regular</strong> = without AI. Optional expiry re-locks it automatically. Overrides Skill/Global Access for that one mock.</p>';
            h += '<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:10px;">';
            h += '<select id="cmMa_exam_' + cid + '" style="font-size:11px;padding:5px 8px;border-radius:6px;border:1px solid #cbd5e1;"><option value="cefr">CEFR</option><option value="ielts">IELTS</option></select>';
            h += '<select id="cmMa_skill_' + cid + '" style="font-size:11px;padding:5px 8px;border-radius:6px;border:1px solid #cbd5e1;"><option value="speaking">Speaking</option><option value="writing">Writing</option><option value="listening">Listening</option><option value="reading">Reading</option><option value="full_mock">Full Mock</option></select>';
            h += '<input id="cmMa_num_' + cid + '" type="number" min="1" placeholder="Mock #" style="width:74px;font-size:11px;padding:5px 8px;border-radius:6px;border:1px solid #cbd5e1;">';
            h += '<select id="cmMa_tier_' + cid + '" style="font-size:11px;padding:5px 8px;border-radius:6px;border:1px solid #cbd5e1;"><option value="premium">⭐ Premium</option><option value="regular">📗 Regular</option></select>';
            h += '<input id="cmMa_exp_' + cid + '" type="date" title="Optional expiry date" style="font-size:11px;padding:5px 8px;border-radius:6px;border:1px solid #cbd5e1;">';
            h += '<button onclick="_cmAddMockAccess(\'' + cid + '\')" style="font-size:11px;padding:6px 12px;border-radius:6px;border:none;background:#7c3aed;color:#fff;font-weight:600;cursor:pointer;">+ Add</button>';
            h += '</div>';
            var maKeys = Object.keys(ma);
            if (!maKeys.length) {
              h += '<p style="font-size:11px;color:#94a3b8;margin:0;">No per-mock unlocks yet.</p>';
            } else {
              maKeys.forEach(function(k) {
                var ent = ma[k] || {};
                var segs = k.split('_');
                var num = segs[segs.length - 1];
                var exam = segs[0];
                var skill = segs.slice(1, segs.length - 1).join(' ');
                var tierLabel = ent.tier === 'regular' ? '📗 Regular' : '⭐ Premium';
                var expired = ent.expiresAt && ent.expiresAt < _today;
                var expLabel = ent.expiresAt ? (expired ? ' · expired ' + ent.expiresAt : ' · until ' + ent.expiresAt) : '';
                h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;border:1px solid #e5e7eb;border-radius:6px;margin-bottom:5px;' + (expired ? 'opacity:0.5;' : '') + '">';
                h += '<span style="font-size:12px;">' + exam.toUpperCase() + ' ' + skill + ' #' + num + ' · ' + tierLabel + expLabel + '</span>';
                h += '<button onclick="_cmRemoveMockAccess(\'' + cid + '\',\'' + k + '\')" style="font-size:11px;padding:3px 8px;border-radius:5px;border:1px solid #dc2626;color:#dc2626;background:#fff;cursor:pointer;">Remove</button>';
                h += '</div>';
              });
            }
            h += '</div>';
          }

          // ═══════════════ BRANDING & IDENTITY ═══════════════
          h += _cmSectionHeader(cid, 'branding', '🎨', 'Branding & Identity');
          if (_cmExpandedSections[cid + '_branding']) {
            h += '<div style="padding:10px 16px;">';

            // ── Brand colours ──
            h += '<div style="font-size:11px;font-weight:700;color:#6b7280;letter-spacing:0.04em;text-transform:uppercase;margin:8px 0 4px;">Brand Colours</div>';
            h += _cmColorRow(cid, 'brandColor',  'Brand Color',  cfg.brandColor,  '#7c3aed');
            h += _cmColorRow(cid, 'accentColor', 'Accent Color', cfg.accentColor, '#0d9488');

            // ── Section colours (header / body / footer) and button colour.
            //    All four default to empty so the existing CSS / brand-derived
            //    gradient stays in effect; setting a value overrides one slice
            //    of the page without forcing the others. ──
            h += '<div style="font-size:11px;font-weight:700;color:#6b7280;letter-spacing:0.04em;text-transform:uppercase;margin:14px 0 4px;">Section Colours</div>';
            h += _cmColorRow(cid, 'headerBg', 'Header Color', cfg.headerBg, '');
            h += _cmColorRow(cid, 'bodyBg',   'Body Color',   cfg.bodyBg,   '');
            h += _cmColorRow(cid, 'footerBg', 'Footer Color', cfg.footerBg, '');
            h += _cmColorRow(cid, 'buttonBg', 'Button Color', cfg.buttonBg, '');

            // ── Welcome-screen gradient picker.
            //    Curated, vibrant CSS gradients that paint the splash page
            //    background (index.html — the page with logo + brand name +
            //    Continue button). Empty value = keep the default theme.
            //    Overrides Body Color on index.html only. ──
            h += '<div style="font-size:11px;font-weight:700;color:#6b7280;letter-spacing:0.04em;text-transform:uppercase;margin:14px 0 4px;">Welcome Page Gradient</div>';
            h += _cmSelectInput(cid, 'welcomeGradient', 'Welcome Gradient', cfg.welcomeGradient || '', [
              { val: '',                                                                  label: 'Default (current theme)' },
              { val: 'linear-gradient(135deg,#ffeaa7 0%,#fab1a0 50%,#fd79a8 100%)',       label: 'Sunrise — Peach + Pink' },
              { val: 'linear-gradient(135deg,#a8edea 0%,#fed6e3 100%)',                   label: 'Pastel — Mint + Pink' },
              { val: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',                   label: 'Indigo Dream' },
              { val: 'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)',                   label: 'Rose Burst' },
              { val: 'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)',                   label: 'Ocean Wave' },
              { val: 'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)',                   label: 'Mint Fresh' },
              { val: 'linear-gradient(135deg,#fa709a 0%,#fee140 100%)',                   label: 'Sunset Glow' },
              { val: 'linear-gradient(135deg,#30cfd0 0%,#330867 100%)',                   label: 'Aurora Blue' },
              { val: 'linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)',                   label: 'Lavender Pink' },
              { val: 'linear-gradient(135deg,#ff9a9e 0%,#fad0c4 100%)',                   label: 'Soft Coral' },
              { val: 'linear-gradient(135deg,#fbc2eb 0%,#a6c1ee 100%)',                   label: 'Pastel Sky' },
              { val: 'linear-gradient(135deg,#ffecd2 0%,#fcb69f 100%)',                   label: 'Apricot Cream' },
              { val: 'linear-gradient(135deg,#84fab0 0%,#8fd3f4 100%)',                   label: 'Aqua Mint' }
            ]);

            // ── Logo + hero copy. Placeholders show the LIVE default text so
            //    the admin sees exactly which string each field replaces. ──
            h += '<div style="font-size:11px;font-weight:700;color:#6b7280;letter-spacing:0.04em;text-transform:uppercase;margin:14px 0 4px;">Logo &amp; Hero</div>';
            h += _cmTextInput(cid, 'logoUrl',        'Logo URL',        cfg.logoUrl,        'https://i.ibb.co/WN0XY5Lv/logo.png');
            h += _cmTextInput(cid, 'heroImageUrl',   'Hero Image URL',  cfg.heroImageUrl,   '(optional) full-bleed background image URL');
            h += _cmTextInput(cid, 'heroHeading',    'Hero Heading',    cfg.heroHeading,    'Mock Stream  ← brand name shown above subtitle');
            h += _cmTextInput(cid, 'heroSubheading', 'Hero Subheading', cfg.heroSubheading, 'Your gateway to exam success. Practice makes perfect.');
            h += _cmTextInput(cid, 'ctaText',        'CTA Button Text', cfg.ctaText,        'Continue');
            h += _cmTextInput(cid, 'welcomeMessage', 'Welcome Message', cfg.welcomeMessage, 'Choose Your Mock Exam  ← landing page heading');

            // ── Typography ──
            h += '<div style="font-size:11px;font-weight:700;color:#6b7280;letter-spacing:0.04em;text-transform:uppercase;margin:14px 0 4px;">Typography</div>';
            h += _cmTextInput(cid, 'fontUrl', 'Google Font URL', cfg.fontUrl, 'https://fonts.googleapis.com/...');
            h += _cmTextInput(cid, 'fontFamily', 'Font Family', cfg.fontFamily, 'e.g. "Inter", sans-serif');

            // ── Footer ──
            h += '<div style="font-size:11px;font-weight:700;color:#6b7280;letter-spacing:0.04em;text-transform:uppercase;margin:14px 0 4px;">Footer &amp; Social</div>';
            h += _cmTextInput(cid, 'footerTagline', 'Footer Tagline', cfg.footerTagline, 'shown next to copyright');
            h += _cmTextInput(cid, 'socialFb', 'Facebook URL',  cfg.socialFb, 'https://fb.com/...');
            h += _cmTextInput(cid, 'socialIg', 'Instagram URL', cfg.socialIg, 'https://instagram.com/...');
            h += _cmTextInput(cid, 'socialYt', 'YouTube URL',   cfg.socialYt, 'https://youtube.com/@...');
            h += _cmTextInput(cid, 'socialTg', 'Telegram URL',  cfg.socialTg, 'https://t.me/...');

            h += '<div style="margin-top:14px;">';
            h += _cmToggleInput(cid, 'hidePoweredBy', 'Hide "Powered by Mock Stream"', cfg.hidePoweredBy);
            h += '</div>';

            // ── Reset to defaults ──
            // One-click clear of every Branding-section field so a centre
            // admin can experiment freely and bail out clean. Feature toggles
            // (Mock Access / AI / Limits / etc.) are left untouched.
            h += '<div style="margin-top:18px;padding-top:12px;border-top:1px dashed var(--ring,#e5e7eb);text-align:right;">' +
              '<button type="button" onclick="_cmResetBranding(\'' + cid + '\')" ' +
              'style="padding:6px 14px;border:1px solid #fecaca;border-radius:8px;background:#fff5f5;color:#b91c1c;font-size:12px;font-weight:600;cursor:pointer;">' +
              '↺ Reset Branding to defaults' +
            '</button></div>';
            h += '</div>';
          }

          // ═══════════════ AI & SCORING ═══════════════
          h += _cmSectionHeader(cid, 'ai', '🤖', 'AI & Scoring');
          if (_cmExpandedSections[cid + '_ai']) {
            h += '<div style="padding:10px 16px;">';
            h += _cmNumberInput(cid, 'scoreBoost', 'Score Boost', cfg.scoreBoost, '0-3');
            h += _cmSelectInput(cid, 'aiProvider', 'AI Provider', cfg.aiProvider || 'default', [
              { val: 'default', label: 'Default (system prompts)' },
              { val: 'gemini', label: 'Gemini (vision)' },
              { val: 'openai', label: 'OpenAI (vision)' },
              { val: 'claude', label: 'Claude (vision)' },
              { val: 'grok', label: 'Grok (vision · grok-4.x)' },
              { val: 'deepseek', label: 'DeepSeek ⚠️ (text only)' },
              { val: 'groq', label: 'Groq (uses System Prompts model)' }
            ]);
            // Per-centre fallback override. "default" = inherit global
            // scoring_ai_fallback. Empty / "none" = no fallback. Other values
            // are tried only when ALL primary keys fail terminally.
            h += _cmSelectInput(cid, 'aiFallback', 'Fallback if primary fails', cfg.aiFallback || 'default', [
              { val: 'default', label: 'Default (use global fallback)' },
              { val: 'none', label: 'None (show error if primary fails)' },
              { val: 'gemini', label: 'Gemini' },
              { val: 'openai', label: 'OpenAI' },
              { val: 'claude', label: 'Claude' },
              { val: 'grok', label: 'Grok (vision · grok-4.x)' },
              { val: 'deepseek', label: 'DeepSeek (text only)' },
              { val: 'groq:llama-3.3-70b-versatile', label: 'Groq Llama 3.3 70B' },
              { val: 'groq:qwen/qwen3.6-27b', label: 'Groq Qwen 3.6 27B' }
            ]);

            // ── Gemini billing-slot picker (shown only when Gemini is the per-center pick)
            if (cfg.aiProvider === 'gemini') {
              h += _cmSelectInput(cid, 'geminiPlan', '↳ Gemini Plan', cfg.geminiPlan || 'default', [
                { val: 'default',      label: 'Default (system prompts)' },
                { val: 'prepay',       label: 'Prepay · Key 1' },
                { val: 'prepay_2',     label: 'Prepay · Key 2' },
                { val: 'prepay_both',  label: 'Prepay · Both (auto-failover)' },
                { val: 'postpay',      label: 'Postpay · Key 1' },
                { val: 'postpay_2',    label: 'Postpay · Key 2' },
                { val: 'postpay_both', label: 'Postpay · Both (auto-failover)' }
              ]);
            }

            // ── Transcriber-AI picker (shown under EVERY scoring AI)
            // For text/vision-no-audio providers (Grok / DeepSeek / Llama
            // Scout / Groq Qwen) a non-default helper is REQUIRED, because
            // none of them transcribe audio. For OpenAI / Gemini / Claude
            // the default = use itself (native), but admins can still
            // override to a cheaper transcriber (e.g. AssemblyAI).
            {
              var _isTextOnly = (cfg.aiProvider === 'grok' || cfg.aiProvider === 'deepseek' ||
                                 cfg.aiProvider === 'llama-scout' || cfg.aiProvider === 'groq');
              var _providerLabel = (cfg.aiProvider === 'llama-scout' ? 'Llama Scout' :
                                    (cfg.aiProvider || 'gemini').charAt(0).toUpperCase() + (cfg.aiProvider || 'gemini').slice(1));
              if (_isTextOnly) {
                var _audioNote = (cfg.aiProvider === 'llama-scout')
                  ? '⚠️ ' + _providerLabel + ' has vision but no native audio. Pick a transcriber to convert speech first:'
                  : '⚠️ ' + _providerLabel + ' cannot process speaking-mock audio. Pick an assistant AI to transcribe audio first:';
                h += '<div style="padding:6px 0 4px 0;font-size:11px;color:#92400e;background:#fef3c7;border:1px solid #fde68a;border-radius:6px;margin:4px 0;padding:6px 10px;">' +
                  _audioNote +
                '</div>';
              } else {
                h += '<div style="padding:6px 0 4px 0;font-size:11px;color:#1e3a8a;background:#dbeafe;border:1px solid #93c5fd;border-radius:6px;margin:4px 0;padding:6px 10px;">' +
                  '💡 By default ' + _providerLabel + ' transcribes its own audio. Override to use a cheaper / faster transcriber (e.g. AssemblyAI):' +
                '</div>';
              }
              var _defaultLabel = _isTextOnly ? 'Default (system prompts)' : 'Default (' + _providerLabel + ' itself)';
              h += _cmSelectInput(cid, 'transcriberProvider', '↳ Transcriber AI', cfg.transcriberProvider || 'default', [
                { val: 'default',    label: _defaultLabel },
                { val: 'gemini',     label: 'Gemini' },
                { val: 'openai',     label: 'OpenAI (Whisper)' },
                { val: 'assemblyai', label: 'AssemblyAI (cheap & fast)' },
                { val: 'groq',       label: 'Groq (Whisper Turbo · cheapest)' }
              ]);
              // Nested Gemini-plan picker for the transcriber when it's Gemini.
              if (cfg.transcriberProvider === 'gemini') {
                h += _cmSelectInput(cid, 'transcriberGeminiPlan', '↳↳ Transcriber Gemini Plan', cfg.transcriberGeminiPlan || 'default', [
                  { val: 'default',      label: 'Default (system prompts)' },
                  { val: 'prepay',       label: 'Prepay · Key 1' },
                  { val: 'prepay_2',     label: 'Prepay · Key 2' },
                  { val: 'prepay_both',  label: 'Prepay · Both (auto-failover)' },
                  { val: 'postpay',      label: 'Postpay · Key 1' },
                  { val: 'postpay_2',    label: 'Postpay · Key 2' },
                  { val: 'postpay_both', label: 'Postpay · Both (auto-failover)' }
                ]);
              }
            }

            h += _cmNumberInput(cid, 'maxAiCallsDay', 'Max AI Calls/Day', cfg.maxAiCallsDay, '0 = unlimited');

            // ── Vision fact-check — separate pre-pass for text-only AIs.
            // When the primary AI is itself vision-capable (gemini / openai
            // / claude / llama-scout), this card is ignored and shown
            // greyed-out with an "auto-vision via primary AI" note, because
            // the primary already sees the images in the main scoring call.
            {
              var _primaryHasVision = (
                cfg.aiProvider === 'gemini' ||
                cfg.aiProvider === 'openai' ||
                cfg.aiProvider === 'claude' ||
                cfg.aiProvider === 'llama-scout' ||
                cfg.aiProvider === 'grok'
              );
              var _vfcOn = cfg.visionFactCheck === true;
              var _vfcProv = (cfg.visionFactCheckProvider || 'gemini');
              var _bg = _primaryHasVision ? '#f1f5f9' : '#eff6ff';
              var _bd = _primaryHasVision ? '#cbd5e1' : '#93c5fd';
              var _ttl = _primaryHasVision ? '#475569' : '#1e3a8a';
              h += '<div style="margin-top:10px;padding:10px 12px;background:' + _bg + ';border:1px solid ' + _bd + ';border-radius:8px;' + (_primaryHasVision ? 'opacity:.65;' : '') + '">';
              h += '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">';
              h += '<span style="font-size:14px;">🔍</span>';
              h += '<div style="flex:1;min-width:200px;">';
              h += '<div style="font-size:13px;font-weight:700;color:' + _ttl + ';">Vision fact-check</div>';
              if (_primaryHasVision) {
                h += '<div style="font-size:11.5px;color:#64748b;margin-top:2px;line-height:1.4;">'
                  +    'Not needed — the selected primary AI (<strong>' + _providerLabel + '</strong>) is vision-capable. '
                  +    'Images are sent straight to it inside the main scoring call. This toggle is ignored.'
                  + '</div>';
              } else {
                h += '<div style="font-size:11.5px;color:#475569;margin-top:2px;line-height:1.4;">'
                  +    'When ON, a separate vision AI pre-analyses <strong>IELTS Writing Task 1</strong> charts and '
                  +    '<strong>CEFR Speaking Question 4</strong> image-pairs before the main (text-only) scorer runs. '
                  +    'When OFF, images are not sent and the scorer skips image-relevance — only grammar, fluency, '
                  +    'lexical resource & coherence are graded. <strong>Recommended ON for graded mocks, OFF for daily practice.</strong>'
                  + '</div>';
              }
              h += '</div>';
              h += _cmToggleInput(cid, 'visionFactCheck', '', _vfcOn);
              h += '</div>';
              // Vision-provider dropdown — only meaningful when toggle ON
              // AND primary is text-only. Greyed if either condition fails.
              if (!_primaryHasVision) {
                var _dropDisabled = !_vfcOn;
                h += '<div style="margin-top:10px;' + (_dropDisabled ? 'opacity:.55;pointer-events:none;' : '') + '">';
                h += _cmSelectInput(cid, 'visionFactCheckProvider', '↳ Vision provider', _vfcProv, [
                  { val: 'gemini',      label: 'Gemini Flash (latest · cheapest · default)' },
                  { val: 'openai',      label: 'OpenAI gpt-4o-mini' },
                  { val: 'claude',      label: 'Claude Haiku 4.5' },
                  { val: 'grok',        label: 'Grok 4.20 · xAI (fast vision · recommended)' }
                ]);
                h += '</div>';
              }
              h += '</div>';
            }

            h += '</div>';
          }

          // ═══════════════ FEATURES TOGGLE ═══════════════
          h += _cmSectionHeader(cid, 'features', '⚙️', 'Features Toggle');
          if (_cmExpandedSections[cid + '_features']) {
            h += '<div style="padding:10px 16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:2px 16px;">';
            h += _cmToggleInput(cid, 'helpCenter', '💬 Help Center', cfg.helpCenter !== false);
            // Single switch for both surfaces: web Help Center's Code tab
            // (greyed + "Deactivated" badge when off) and the per-centre
            // Telegram bot's 🎁 Code button (removed from keyboard when off,
            // since Telegram has no greyed-button state).
            h += _cmToggleInput(cid, 'freeCodeDispenser', '🎁 Free Code Dispenser', cfg.freeCodeDispenser !== false);
            // Per-centre filter that hides regular-tier rows (8-digit Regular
            // VIP, 12-digit Regular individual, regular Full Mock) from clone
            // admins viewing the website Codes panel. Premium tier stays
            // visible. Super-admin (you) sees everything regardless. Bot side
            // is shipped separately.
            h += _cmToggleInput(cid, 'hideRegularCodes', '🙈 Hide Regular Codes (clone admin)', cfg.hideRegularCodes === true);
            h += _cmToggleInput(cid, 'announcements', '📢 Announcements Board', cfg.announcements === true);
            h += _cmToggleInput(cid, 'certificates', '🏆 Achievements Board', cfg.certificates === true);
            h += _cmToggleInput(cid, 'telegramNotifs', '📱 Telegram Notifications', cfg.telegramNotifs !== false);
            h += _cmToggleInput(cid, 'flashcards', '🃏 Flashcards', cfg.flashcards !== false);
            h += _cmToggleInput(cid, 'articles', '📰 Articles', cfg.articles !== false);
            h += _cmToggleInput(cid, 'leaderboard', '🏆 Leaderboard', cfg.leaderboard !== false);
            h += _cmToggleInput(cid, 'writingPlus', '✏️ Writing Plus', cfg.writingPlus !== false);
            h += _cmToggleInput(cid, 'speakingPlus', '🎤 Speaking Plus', cfg.speakingPlus !== false);
            h += _cmToggleInput(cid, 'readingPlus', '📖 Reading Plus', cfg.readingPlus !== false);
            h += _cmToggleInput(cid, 'listeningPlus', '🎧 Listening Plus', cfg.listeningPlus !== false);
            h += '</div>';
          }

          // ═══════════════ SCHEDULING & AVAILABILITY ═══════════════
          h += _cmSectionHeader(cid, 'schedule', '📅', 'Scheduling & Availability');
          if (_cmExpandedSections[cid + '_schedule']) {
            h += '<div style="padding:10px 16px;">';
            h += _cmToggleInput(cid, 'maintenanceMode', '🔧 Maintenance Mode', cfg.maintenanceMode);
            h += _cmToggleInput(cid, 'iosAppDisabled', '📵 iOS App Maintenance (mobile app only — website unaffected)', cfg.iosAppDisabled);
            h += _cmToggleInput(cid, 'androidAppDisabled', '📵 Android App Maintenance (mobile app only — website unaffected)', cfg.androidAppDisabled);
            h += _cmToggleInput(cid, 'desktopAppDisabled', '💻 Desktop App Maintenance (desktop app only — website unaffected)', cfg.desktopAppDisabled);
            h += '<div style="border-top:1px solid var(--ring,#e5e7eb);margin:8px 0;"></div>';
            h += _cmToggleInput(cid, 'operatingHoursEnabled', '⏰ Restrict Operating Hours', cfg.operatingHoursEnabled);
            if (cfg.operatingHoursEnabled) {
              h += '<div style="display:flex;gap:12px;padding-left:24px;">';
              h += _cmTimeInput(cid, 'operatingHoursStart', 'From', cfg.operatingHoursStart || '09:00');
              h += _cmTimeInput(cid, 'operatingHoursEnd', 'To', cfg.operatingHoursEnd || '18:00');
              h += '</div>';
            }
            h += '<div style="border-top:1px solid var(--ring,#e5e7eb);margin:8px 0;"></div>';
            h += _cmToggleInput(cid, 'examScheduleMode', '🗓️ Exam Schedule Mode', cfg.examScheduleMode);
            if (cfg.examScheduleMode) {
              h += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0 6px 24px;">' +
                '<span style="font-size:12px;min-width:140px;">Unlock Date/Time</span>' +
                '<input type="datetime-local" value="' + (cfg.examScheduleDate || '') + '" onchange="_cmSetProp(\'' + cid + '\',\'examScheduleDate\',this.value)" style="padding:5px 8px;border:1px solid var(--ring,#e5e7eb);border-radius:6px;font-size:12px;background:var(--surface,#fff);color:var(--ink,#333);">' +
              '</div>';
            }
            h += '</div>';
          }

          // ═══════════════ ANALYTICS & REPORTING ═══════════════
          h += _cmSectionHeader(cid, 'analytics', '📊', 'Analytics & Reporting');
          if (_cmExpandedSections[cid + '_analytics']) {
            h += '<div style="padding:10px 16px;">';
            h += _cmToggleInput(cid, 'resultsVisible', '👁️ Results Visible in Admin Dashboard', cfg.resultsVisible !== false);
            h += _cmToggleInput(cid, 'exportPermission', '📤 Allow Data Export', cfg.exportPermission !== false);
            h += _cmToggleInput(cid, 'dataIsolation', '🔐 Student Data Isolation', cfg.dataIsolation);
            h += '</div>';
          }

          // ═══════════════ LIMITS & QUOTAS ═══════════════
          h += _cmSectionHeader(cid, 'limits', '📏', 'Limits & Quotas');
          if (_cmExpandedSections[cid + '_limits']) {
            h += '<div style="padding:10px 16px;">';
            h += _cmNumberInput(cid, 'maxAttemptsPerStudent', 'Per-Student daily AI calls', cfg.maxAttemptsPerStudent, '0 = unlimited · tracked by Google account when signed in, otherwise by IP');
            h += _cmNumberInput(cid, 'dailyMockLimit', 'Center daily max AI calls', cfg.dailyMockLimit, '0 = unlimited · total successful AI calls across this center per 24h');
            h += '</div>';
          }

          // ═══════════════ HUMAN EXPERT & PAPER MODE ═══════════════
          h += _cmSectionHeader(cid, 'humanExpert', '🧑‍🏫', 'Human Expert & Paper Mode');
          if (_cmExpandedSections[cid + '_humanExpert']) {
            var he = cfg.humanExpert || {};
            h += '<div style="padding:10px 16px;">';

            // ── Paper Mode Toggle ──
            h += '<div style="padding:8px 10px;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:8px;margin-bottom:14px;">';
            h += '<div style="font-size:12px;font-weight:700;color:#475569;margin-bottom:4px;">📝 Paper-Based Writing Exam</div>';
            h += '<p style="font-size:11px;color:#64748b;margin:0 0 6px;">Shows the "Paper-Based Exam" button on CEFR Writing Mocks + IELTS Writing Mock. When off, the button stays visible but is greyed out with a red "Deactivated by your center" label.</p>';
            h += _cmToggleInput(cid, 'writingPaperMode', '✅ Paper-Based Exam Enabled', cfg.writingPaperMode !== false);
            h += '</div>';

            // ── Human Expert Modal ──
            h += '<div style="padding:10px 12px;background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;">';
            h += '<div style="font-size:12px;font-weight:700;color:#92400e;margin-bottom:2px;">💼 Human Expert "Official Scoring" popup</div>';
            h += '<p style="font-size:11px;color:#92400e;margin:0 0 8px;">Applies to IELTS Speaking, CEFR Speaking, IELTS Writing, CEFR Writing finish overlays. Edit below; changes save automatically.</p>';
            h += _cmNestedToggle(cid, '_cmSetHumanExpert', 'enabled', '✅ Show the Expert / Score button', he.enabled !== false);

            if (he.enabled !== false) {
              h += _cmNestedTextInput(cid, '_cmSetHumanExpert', 'title', 'Modal Title', he.title, 'e.g. Official Scoring Service');
              h += _cmNestedTextarea(cid, '_cmSetHumanExpert', 'warningHtml', 'Warning / Description (HTML allowed; placeholders: {price}, {delivery})', he.warningHtml, '', 4);
              h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
              h += _cmNestedTextInput(cid, '_cmSetHumanExpert', 'price', 'Price', he.price, "e.g. 20,000 so'm");
              h += _cmNestedTextInput(cid, '_cmSetHumanExpert', 'delivery', 'Delivery Time', he.delivery, 'e.g. 24 hours');
              h += '</div>';
              h += _cmNestedTextInput(cid, '_cmSetHumanExpert', 'cardNumber', 'Payment Card', he.cardNumber, 'e.g. 9860 1606 4003 0377');
              h += _cmNestedTextInput(cid, '_cmSetHumanExpert', 'telegramUser', 'Expert Telegram', he.telegramUser, '@handle  or  https://t.me/handle');
              h += _cmNestedTextarea(cid, '_cmSetHumanExpert', 'messageTemplate', 'Prefilled Telegram Message (placeholders: {test} {name} {mock} {date} {testId} {price} {card} {delivery})', he.messageTemplate, '', 10);
            }
            h += '</div>';

            h += '</div>';
          }

        } // end if active

        h += '</div>'; // end card
      });

      // Save + status
      h += '<div style="display:flex;justify-content:center;gap:12px;padding:8px 0 4px;">';
      h += '<button onclick="_cmSaveAll()" style="padding:10px 28px;border:none;border-radius:10px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;font-weight:700;font-size:14px;cursor:pointer;box-shadow:0 4px 14px rgba(124,58,237,0.3);">💾 Save All Centers</button>';
      h += '</div>';
      h += '<div id="cmStatus" style="text-align:center;font-size:12px;margin-top:8px;min-height:18px;"></div>';

      body.innerHTML = h;
    }

    // ── Auto-save (debounced per center) ────────────────────────────────────
    var _cmAutoSaveTimers = {};
    function _cmAutoSave(centerId) {
      if (_cmAutoSaveTimers[centerId]) clearTimeout(_cmAutoSaveTimers[centerId]);
      // Show saving indicator
      var status = document.getElementById('cmStatus');
      if (status) status.innerHTML = '<span style="color:#7c3aed;font-size:12px;">⏳ Auto-saving ' + centerId + '...</span>';
      _cmAutoSaveTimers[centerId] = setTimeout(async function() {
        try {
          var key = 'center_config_' + centerId;
          var val = JSON.stringify(_cmConfigs[centerId] || _cmDefaultConfig());
          var res = await fetch(CM_SB_URL + '/rest/v1/site_settings?key=eq.' + encodeURIComponent(key), {
            method: 'PATCH',
            headers: {
              'apikey': CM_SB_KEY, 'Authorization': 'Bearer ' + CM_SB_KEY,
              'Content-Type': 'application/json', 'Prefer': 'return=representation'
            },
            body: JSON.stringify({ value: val, updated_at: new Date().toISOString() })
          });
          var data = await res.json();
          if (!data || data.length === 0) {
            await fetch(CM_SB_URL + '/rest/v1/site_settings', {
              method: 'POST',
              headers: {
                'apikey': CM_SB_KEY, 'Authorization': 'Bearer ' + CM_SB_KEY,
                'Content-Type': 'application/json', 'Prefer': 'return=minimal'
              },
              body: JSON.stringify({ key: key, value: val })
            });
          }
          if (status) status.innerHTML = '<span style="color:#10b981;font-size:12px;">✓ ' + centerId + ' saved</span>';
          setTimeout(function() { if (status) status.textContent = ''; }, 2000);
        } catch(e) {
          if (status) status.innerHTML = '<span style="color:#dc2626;font-size:12px;">⚠ Save error: ' + e.message + '</span>';
        }
      }, 800); // 800ms debounce
    }

    // ── Actions ──────────────────────────────────────────────────────────────
    window._cmToggleSection = function(centerId, section) {
      var key = centerId + '_' + section;
      _cmExpandedSections[key] = !_cmExpandedSections[key];
      _cmRenderBody();
    };

    // Wipe every Branding-section property back to the default config so a
    // centre admin can bail out cleanly after experimenting. Feature toggles
    // (Mock Access / AI / Limits / Schedule / etc.) are intentionally left
    // alone — Reset is scoped just to the visual / copy fields.
    var _BRANDING_FIELDS = [
      'brandColor', 'accentColor',
      'headerBg', 'bodyBg', 'footerBg', 'buttonBg',
      'welcomeGradient',
      'logoUrl', 'heroImageUrl',
      'heroHeading', 'heroSubheading',
      'ctaText', 'welcomeMessage',
      'fontUrl', 'fontFamily',
      'footerTagline',
      'socialFb', 'socialIg', 'socialYt', 'socialTg',
      'hidePoweredBy'
    ];
    window._cmResetBranding = function(centerId) {
      if (!confirm('Reset ALL Branding fields for "' + centerId + '" back to defaults? This clears colours, logo, hero copy, fonts, footer tagline and social links. Feature toggles are left untouched.')) return;
      var cfg = _cmConfigs[centerId] || (_cmConfigs[centerId] = _cmDefaultConfig());
      var def = _cmDefaultConfig();
      _BRANDING_FIELDS.forEach(function (k) {
        if (Object.prototype.hasOwnProperty.call(def, k)) cfg[k] = def[k];
        else delete cfg[k];
      });
      _cmRenderBody();
      _cmAutoSave(centerId);
    };

    window._cmToggle = function(centerId, prop, val) {
      if (!_cmConfigs[centerId]) _cmConfigs[centerId] = _cmDefaultConfig();
      _cmConfigs[centerId][prop] = val;
      _cmRenderBody();
      _cmAutoSave(centerId);
    };

    window._cmSetProp = function(centerId, prop, val) {
      if (!_cmConfigs[centerId]) _cmConfigs[centerId] = _cmDefaultConfig();
      _cmConfigs[centerId][prop] = val;
      // Reset dependent sub-fields when the parent picker changes so a stale
      // (now-hidden) value can't accidentally get sent on the next request.
      if (prop === 'aiProvider') {
        if (val !== 'gemini') _cmConfigs[centerId].geminiPlan = 'default';
        if (val !== 'grok' && val !== 'deepseek') {
          _cmConfigs[centerId].transcriberProvider = 'default';
          _cmConfigs[centerId].transcriberGeminiPlan = 'default';
        }
      }
      if (prop === 'transcriberProvider' && val !== 'gemini') {
        _cmConfigs[centerId].transcriberGeminiPlan = 'default';
      }
      // Re-render only for toggles that show/hide sub-fields
      if (prop === 'operatingHoursEnabled' || prop === 'examScheduleMode' || prop === 'maintenanceMode' || prop === 'iosAppDisabled' || prop === 'androidAppDisabled' || prop === 'desktopAppDisabled'
          || prop === 'aiProvider' || prop === 'transcriberProvider'
          || prop === 'visionFactCheck') {
        _cmRenderBody();
      }
      _cmAutoSave(centerId);
    };

    window._cmSetMock = function(centerId, mockKey, val) {
      if (!_cmConfigs[centerId]) _cmConfigs[centerId] = _cmDefaultConfig();
      if (!_cmConfigs[centerId].mocks) _cmConfigs[centerId].mocks = {};
      _cmConfigs[centerId].mocks[mockKey] = val;
      // Re-render all cards so sub-controls appear/disappear properly
      _cmRenderBody();
      _cmAutoSave(centerId);
    };

    window._cmSetMockPractice = function(centerId, mockKey, val) {
      if (!_cmConfigs[centerId]) _cmConfigs[centerId] = _cmDefaultConfig();
      if (!_cmConfigs[centerId].mocks) _cmConfigs[centerId].mocks = {};
      _cmConfigs[centerId].mocks[mockKey + '_practice'] = val;
      _cmAutoSave(centerId);
    };

    window._cmSetFullMockAi = function(centerId, subKey, val) {
      if (!_cmConfigs[centerId]) _cmConfigs[centerId] = _cmDefaultConfig();
      if (!_cmConfigs[centerId].fullMockAi) _cmConfigs[centerId].fullMockAi = {};
      _cmConfigs[centerId].fullMockAi[subKey] = val;
      _cmAutoSave(centerId);
    };

    // Human Expert (nested)
    window._cmSetHumanExpert = function(centerId, subKey, val) {
      if (!_cmConfigs[centerId]) _cmConfigs[centerId] = _cmDefaultConfig();
      if (!_cmConfigs[centerId].humanExpert) _cmConfigs[centerId].humanExpert = {};
      _cmConfigs[centerId].humanExpert[subKey] = val;
      if (subKey === 'enabled') _cmRenderBody();
      _cmAutoSave(centerId);
    };

    window._cmSetGlobalAccess = function(centerId, val) {
      if (!_cmConfigs[centerId]) _cmConfigs[centerId] = _cmDefaultConfig();
      _cmConfigs[centerId].globalAccess = val;
      _cmRenderBody();
      _cmAutoSave(centerId);
      // Live-update window._centerAccess if this is the current site
      var curSite = (window.SITE_CONFIG && window.SITE_CONFIG.testIdentifier) || 'mock_stream';
      if (centerId === curSite) {
        if (!window._centerAccess) window._centerAccess = { globalAccess: 'off', skillAccess: {} };
        window._centerAccess.globalAccess = val;
      }
    };

    window._cmSetSkillAccess = function(centerId, skill, val) {
      if (!_cmConfigs[centerId]) _cmConfigs[centerId] = _cmDefaultConfig();
      if (!_cmConfigs[centerId].skillAccess) _cmConfigs[centerId].skillAccess = {};
      _cmConfigs[centerId].skillAccess[skill] = val;
      _cmRenderBody();
      _cmAutoSave(centerId);
      // Live-update window._centerAccess if this is the current site
      var curSite = (window.SITE_CONFIG && window.SITE_CONFIG.testIdentifier) || 'mock_stream';
      if (centerId === curSite) {
        if (!window._centerAccess) window._centerAccess = { globalAccess: 'off', skillAccess: {} };
        if (!window._centerAccess.skillAccess) window._centerAccess.skillAccess = {};
        window._centerAccess.skillAccess[skill] = val;
      }
    };

    // Per-mock access (single-mock unlock, optional expiry). Key shape:
    // "<exam>_<skill>_<num>" (skill may be 'full_mock'). Value: {tier, expiresAt?}.
    window._cmAddMockAccess = function(centerId) {
      var examEl = document.getElementById('cmMa_exam_' + centerId);
      var skillEl = document.getElementById('cmMa_skill_' + centerId);
      var numEl = document.getElementById('cmMa_num_' + centerId);
      var tierEl = document.getElementById('cmMa_tier_' + centerId);
      var expEl = document.getElementById('cmMa_exp_' + centerId);
      var exam = examEl && examEl.value;
      var skill = skillEl && skillEl.value;
      var num = parseInt(numEl && numEl.value, 10);
      if (!exam || !skill || !num || num < 1) { alert('Pick exam, skill and a valid mock number.'); return; }
      if (!_cmConfigs[centerId]) _cmConfigs[centerId] = _cmDefaultConfig();
      if (!_cmConfigs[centerId].mockAccess) _cmConfigs[centerId].mockAccess = {};
      var entry = { tier: (tierEl && tierEl.value === 'regular') ? 'regular' : 'premium' };
      if (expEl && expEl.value) entry.expiresAt = expEl.value; // YYYY-MM-DD
      _cmConfigs[centerId].mockAccess[exam + '_' + skill + '_' + num] = entry;
      _cmRenderBody();
      _cmAutoSave(centerId);
    };

    window._cmRemoveMockAccess = function(centerId, key) {
      if (_cmConfigs[centerId] && _cmConfigs[centerId].mockAccess) {
        delete _cmConfigs[centerId].mockAccess[key];
        _cmRenderBody();
        _cmAutoSave(centerId);
      }
    };

    // ── Load / Save ─────────────────────────────────────────────────────────
    async function _cmLoadAll() {
      try {
        // Fetch ALL center_config_* entries (not just known ones)
        var res = await fetch(CM_SB_URL + '/rest/v1/site_settings?key=like.center_config_*&select=key,value', {
          headers: { 'apikey': CM_SB_KEY, 'Authorization': 'Bearer ' + CM_SB_KEY }
        });
        var rows = await res.json();
        if (Array.isArray(rows)) {
          rows.forEach(function(row) {
            var cid = row.key.replace('center_config_', '');
            try { _cmConfigs[cid] = _cmMergeDefaults(JSON.parse(row.value)); } catch(e) {}
          });
        }
        // Also fetch center_site_config_* for brandName / logo of dynamic centers
        var res2 = await fetch(CM_SB_URL + '/rest/v1/site_settings?key=like.center_site_config_*&select=key,value', {
          headers: { 'apikey': CM_SB_KEY, 'Authorization': 'Bearer ' + CM_SB_KEY }
        });
        var siteRows = await res2.json();
        var siteMap = {};
        if (Array.isArray(siteRows)) {
          siteRows.forEach(function(r) {
            var id = r.key.replace('center_site_config_', '');
            try { siteMap[id] = typeof r.value === 'string' ? JSON.parse(r.value) : r.value; } catch(e) {}
          });
        }
        // Extend CM_CENTERS with any Supabase-only centers not already in the hardcoded list
        var seen = {};
        CM_CENTERS.forEach(function(c) { seen[c.id] = true; });
        // From guard configs
        for (var cid in _cmConfigs) {
          if (!seen[cid]) {
            var sc = siteMap[cid] || {};
            CM_CENTERS.push({
              id: cid,
              name: sc.brandName || _cmConfigs[cid].brandName || cid.replace(/_/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); }),
              logo: sc.logoUrl || ''
            });
            seen[cid] = true;
          }
        }
        // From site configs (centers that only have site config, no guard config yet)
        for (var sid in siteMap) {
          if (!seen[sid]) {
            CM_CENTERS.push({
              id: sid,
              name: siteMap[sid].brandName || sid.replace(/_/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); }),
              logo: siteMap[sid].logoUrl || ''
            });
            seen[sid] = true;
          }
        }
      } catch(e) {
        console.error('Centers load error:', e);
      }
      CM_CENTERS.forEach(function(c) {
        if (!_cmConfigs[c.id]) _cmConfigs[c.id] = _cmDefaultConfig();
      });
    }

    window._cmSaveAll = async function() {
      var status = document.getElementById('cmStatus');
      var setStatus = function(html, color) {
        if (status) status.innerHTML = '<span style="color:' + color + ';">' + html + '</span>';
      };

      // Pre-flight: site_settings RLS rejects writes from anon callers, and
      // the global fetch interceptor in admin-auth.js only attaches a JWT
      // when a Supabase Auth session is active. Confirm super-admin sign-in
      // before saving so we surface a clear prompt instead of a silent miss.
      if (window.AdminAuth && typeof window.AdminAuth.currentRole === 'function') {
        try {
          var roleInfo = await window.AdminAuth.currentRole();
          if (!roleInfo || roleInfo.role !== 'super_admin') {
            setStatus('Sign in as super-admin to save', '#dc2626');
            if (typeof window.AdminAuth.requireLogin === 'function') {
              try { window.AdminAuth.requireLogin(); } catch (_e) {}
            }
            return;
          }
        } catch (e) {
          setStatus('Auth check failed: ' + (e.message || e), '#dc2626');
          return;
        }
      }

      // 10s timeout per fetch so a hung request surfaces visibly instead of
      // leaving the panel stuck on "Saving...".
      var fetchWithTimeout = function(url, opts, ms) {
        return new Promise(function(resolve, reject) {
          var to = setTimeout(function() {
            reject(new Error('timeout after ' + ms + 'ms'));
          }, ms);
          fetch(url, opts).then(function(r) {
            clearTimeout(to);
            resolve(r);
          }, function(err) {
            clearTimeout(to);
            reject(err);
          });
        });
      };

      setStatus('Saving...', '#7c3aed');
      try {
        for (var i = 0; i < CM_CENTERS.length; i++) {
          var cid = CM_CENTERS[i].id;
          var key = 'center_config_' + cid;
          var val = JSON.stringify(_cmConfigs[cid] || _cmDefaultConfig());
          var res = await fetchWithTimeout(CM_SB_URL + '/rest/v1/site_settings?key=eq.' + encodeURIComponent(key), {
            method: 'PATCH',
            headers: {
              'apikey': CM_SB_KEY, 'Authorization': 'Bearer ' + CM_SB_KEY,
              'Content-Type': 'application/json', 'Prefer': 'return=representation'
            },
            body: JSON.stringify({ value: val, updated_at: new Date().toISOString() })
          }, 10000);
          if (!res.ok) {
            var errTxt = '';
            try { errTxt = await res.text(); } catch (_e) {}
            throw new Error('PATCH ' + cid + ' → ' + res.status + (errTxt ? ': ' + errTxt.slice(0, 200) : ''));
          }
          var data = await res.json();
          if (!data || data.length === 0) {
            var insRes = await fetchWithTimeout(CM_SB_URL + '/rest/v1/site_settings', {
              method: 'POST',
              headers: {
                'apikey': CM_SB_KEY, 'Authorization': 'Bearer ' + CM_SB_KEY,
                'Content-Type': 'application/json', 'Prefer': 'return=minimal'
              },
              body: JSON.stringify({ key: key, value: val })
            }, 10000);
            if (!insRes.ok) {
              var errTxt2 = '';
              try { errTxt2 = await insRes.text(); } catch (_e) {}
              throw new Error('POST ' + cid + ' → ' + insRes.status + (errTxt2 ? ': ' + errTxt2.slice(0, 200) : ''));
            }
          }
        }
        setStatus('✓ All centers saved successfully!', '#10b981');
        setTimeout(function() { if (status) status.textContent = ''; }, 3000);
      } catch(e) {
        setStatus('Error: ' + (e && e.message ? e.message : e), '#dc2626');
      }
    };

    // ── Open / Close ────────────────────────────────────────────────────────
    async function _openCentersPanel() {
      _cmEnsureOverlay();
      // Only toggle the modal "active" class in legacy overlay mode — in
      // admin-host inline mode there is no #cmOverlay element to activate.
      var overlay = document.getElementById('cmOverlay');
      if (overlay) overlay.classList.add('active');
      var body = document.getElementById('cmBody');
      if (body) body.innerHTML = '<div style="text-align:center;padding:40px;color:#888;">Loading...</div>';
      await _cmLoadAll();
      _cmRenderBody();
    }
    window.openCentersPanel = _openCentersPanel;
    window.closeCentersPanel = function() {
      var el = document.getElementById('cmOverlay');
      if (el) el.classList.remove('active');
    };

    // Admin-host entry point. Called by admin.html when the user clicks
    // the "Centers" sidebar item. Sets the inline mount target then runs
    // the same open flow the legacy modal used.
    window.AdminPanels = window.AdminPanels || {};
    window.AdminPanels.centers = {
      open: function (container) {
        _cmInlineContainer = container || null;
        return _openCentersPanel();
      }
    };
  })();
