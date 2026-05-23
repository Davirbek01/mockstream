// ═══════════════════════════════════════════════════════════════════════
// Registered Users — extracted from landing.html as Phase 6-E pilot panel
// 3. landing.html still has its own inline copy so legacy admin flows
// (sidebar → Registered Users; Site Management grid → Registered Users)
// keep working byte-for-byte untouched.
//
// Inline-mount mode (called by /admin.html):
//   window.AdminPanels.registeredUsers.open(container)
//     - sets _inlineContainer = container
//     - skips the passcode gate (admin.html already verified super_admin)
//     - renders the panel chrome directly into `container` (no overlay)
//
// Legacy modal mode (kept for completeness, not exercised here):
//   creates #ruOverlay with the original .ru-overlay backdrop styling.
// ═══════════════════════════════════════════════════════════════════════
(function () {
  var _inlineContainer = null;
  // landing.html had these as page-global vars; redeclared locally so
  // the IIFE is self-contained.
  var _siteAdminUnlocked = false;

  // Inject the panel's CSS once on first open. Copied verbatim from
  // landing.html lines 1591-1770 — same selectors, so the existing
  // _renderRuList markup paints with the cards/avatars/badges users expect.
  function _ruInjectStyles() {
    if (document.getElementById('ruPanelStyles')) return;
    var s = document.createElement('style');
    s.id = 'ruPanelStyles';
    s.textContent = [
      '.ru-overlay{position:fixed;inset:0;z-index:10100;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .25s ease;}',
      '.ru-overlay.active{opacity:1;pointer-events:auto;}',
      '.ru-panel{background:var(--surface,#fff);border-radius:16px;width:94vw;max-width:560px;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden;}',
      '.ru-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--ring,#e5e7eb);background:linear-gradient(135deg,#6366f122,#818cf822);}',
      '.ru-header h3{margin:0;font-size:16px;font-weight:700;}',
      '.ru-close{background:none;border:none;font-size:22px;cursor:pointer;color:var(--ink,#333);line-height:1;}',
      '.ru-search{margin:12px 16px 8px;padding:10px 14px;border:1px solid var(--ring,#e5e7eb);border-radius:10px;font-size:14px;outline:none;width:calc(100% - 32px);background:var(--surface,#fff);color:var(--ink,#333);}',
      '.ru-search:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,0.15);}',
      '.ru-stats{padding:4px 16px 8px;font-size:12px;color:#888;}',
      '.ru-list{flex:1;overflow-y:auto;padding:0 16px 16px;display:flex;flex-direction:column;gap:10px;}',
      '.ru-card{display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border-radius:12px;border:1px solid var(--ring,#e5e7eb);background:var(--surface,#fff);transition:all .15s ease;cursor:pointer;}',
      '.ru-card:hover{border-color:#6366f1;box-shadow:0 2px 8px rgba(99,102,241,0.1);}',
      '.ru-card-avatar{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#818cf8);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:15px;flex-shrink:0;overflow:hidden;}',
      '.ru-card-avatar img{width:100%;height:100%;object-fit:cover;}',
      '.ru-card-info{flex:1;min-width:0;}',
      '.ru-card-name{font-weight:600;font-size:14px;margin-bottom:2px;}',
      '.ru-card-detail{font-size:12px;color:#888;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.ru-center-badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;color:#fff;margin-top:4px;text-transform:capitalize;}',
      '.ru-center-badge.mock_stream{background:linear-gradient(135deg,#6366f1,#818cf8);}',
      '.ru-center-badge.bek{background:linear-gradient(135deg,#f59e0b,#d97706);}',
      '.ru-center-badge.global{background:linear-gradient(135deg,#10b981,#059669);}',
      '.ru-center-badge.niners{background:linear-gradient(135deg,#ef4444,#dc2626);}',
      '.ru-center-badge.muzaffars{background:linear-gradient(135deg,#8b5cf6,#7c3aed);}',
      '.ru-center-badge.achievers{background:linear-gradient(135deg,#14b8a6,#0d9488);}',
      '.ru-center-badge.record{background:linear-gradient(135deg,#0ea5e9,#0284c7);}',
      '.ru-center-badge.mockstream{background:linear-gradient(135deg,#6366f1,#818cf8);}',
      '.ru-center-badge.unknown{background:#888;}',
      '.ru-empty{text-align:center;padding:32px 0;color:#aaa;font-size:14px;}',
      '.ru-card-blocked{opacity:0.55;}',
      '.ru-role-badge{display:inline-block;font-size:10px;font-weight:700;padding:2px 7px;border-radius:6px;vertical-align:middle;margin-left:4px;}',
      '.ru-role-premium{background:#fff3e0;color:#e65100;border:1px solid #ffcc80;}',
      '.ru-role-admin{background:#e8f5e9;color:#2e7d32;border:1px solid #a5d6a7;}',
      '.ru-role-super-admin{background:#ede7f6;color:#4527a0;border:1px solid #b39ddb;}',
      '.ru-back-btn{background:none;border:none;font-size:14px;cursor:pointer;color:#6366f1;font-weight:600;display:flex;align-items:center;gap:4px;}',
      '.ru-back-btn:hover{text-decoration:underline;}',
      '.ru-result-card{display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border-radius:12px;border:1px solid var(--ring,#e5e7eb);background:var(--surface,#fff);transition:all .15s ease;cursor:pointer;}',
      '.ru-result-card:hover{border-color:#6366f1;box-shadow:0 2px 8px rgba(99,102,241,0.1);}',
      '.ru-result-score{min-width:56px;text-align:center;padding:6px 0;}',
      '.ru-result-score .big{font-size:20px;font-weight:800;color:#6366f1;line-height:1.1;}',
      '.ru-result-score .sub{font-size:11px;color:#888;}',
      '.ru-result-info{flex:1;min-width:0;}',
      '.ru-result-date{font-size:12px;color:#888;margin-bottom:2px;}',
      '.ru-result-badges{display:flex;flex-wrap:wrap;gap:4px;margin-top:3px;}',
      '.ru-result-badges .rb{display:inline-block;padding:2px 7px;border-radius:6px;font-size:10px;font-weight:600;color:#fff;}',
      '.rb-ielts{background:#3b82f6;}',
      '.rb-cefr{background:#8b5cf6;}',
      '.rb-speaking{background:#f59e0b;}',
      '.rb-writing{background:#10b981;}',
      '.rb-listening{background:#6366f1;}',
      '.rb-reading{background:#ec4899;}',
      '.rb-full{background:#ef4444;}',
      '.rb-practice{background:#94a3b8;}',
      '.rb-ai{background:linear-gradient(135deg,#6366f1,#818cf8);}',
      '.ru-result-details{font-size:11px;color:#888;margin-top:3px;line-height:1.5;}',
      '.ru-result-details .dl{font-weight:600;color:#666;}',
      '.ru-summary-row{display:flex;flex-wrap:wrap;gap:8px;padding:8px 0 4px;}',
      '.ru-summary-stat{flex:1;min-width:70px;text-align:center;padding:8px 4px;border-radius:10px;background:linear-gradient(135deg,#6366f108,#818cf808);border:1px solid var(--ring,#e5e7eb);}',
      '.ru-summary-stat .sv{font-size:18px;font-weight:800;color:#6366f1;}',
      '.ru-summary-stat .sl{font-size:10px;color:#888;margin-top:2px;}',
      '.ru-report-overlay{position:fixed;inset:0;z-index:10200;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .25s ease;}',
      '.ru-report-overlay.active{opacity:1;pointer-events:auto;}',
      '.ru-report-panel{background:#fff;border-radius:10px;width:100vw;max-width:100vw;height:100vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.35);overflow:hidden;}',
      '.ru-report-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #e5e7eb;background:linear-gradient(135deg,#6366f108,#818cf808);}',
      '.ru-report-header h4{margin:0;font-size:14px;font-weight:600;}',
      '.ru-report-close{background:none;border:none;font-size:22px;cursor:pointer;color:#333;line-height:1;}',
      '.ru-report-body{flex:1;overflow:hidden;position:relative;}',
      '.ru-report-body iframe{width:100%;height:100%;border:none;}',
      '.ru-report-progress{position:absolute;top:0;left:0;right:0;height:3px;background:#e5e7eb;z-index:2;overflow:hidden;}',
      '.ru-report-progress-bar{height:100%;width:0%;border-radius:3px;background:linear-gradient(90deg,#6366f1,#818cf8,#6366f1);background-size:200% 100%;animation:ruProgressShimmer 1.5s ease infinite;transition:width 0.3s ease;}',
      '.ru-report-progress.done{opacity:0;transition:opacity 0.4s ease 0.3s;}',
      '@keyframes ruProgressShimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}',
      '.ru-report-loading{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:var(--surface,#fff);z-index:1;}',
      '.ru-report-loading .spinner{width:36px;height:36px;border:3px solid #e5e7eb;border-top-color:#6366f1;border-radius:50%;animation:ruSpin 0.8s linear infinite;}',
      '.ru-report-loading .label{font-size:13px;color:#888;}',
      '@keyframes ruSpin{to{transform:rotate(360deg);}}'
    ].join('');
    document.head.appendChild(s);
  }

    // ===== REGISTERED USERS PANEL =====
    var _ruData = [];

    function _showRuPasscode() {
      var existing = document.getElementById('ruPasscodeOverlay');
      if (existing) { existing.classList.add('active'); document.getElementById('ruPasscodeInput').value = ''; document.getElementById('ruPasscodeInput').focus(); return; }
      var div = document.createElement('div');
      div.id = 'ruPasscodeOverlay';
      div.className = 'ru-overlay';
      div.style.zIndex = '10150';
      div.onclick = function(e) { if (e.target === div) _closeRuPasscode(); };
      div.innerHTML = '<div style="background:var(--surface,#fff);border-radius:16px;padding:28px 24px;width:90vw;max-width:360px;box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center;">' +
        '<div style="font-size:28px;margin-bottom:8px;">🔐</div>' +
        '<h3 style="margin:0 0 4px;font-size:16px;">Admin Access Required</h3>' +
        '<p style="margin:0 0 16px;font-size:13px;color:#888;">Enter passcode to view registered users</p>' +
        '<input type="password" id="ruPasscodeInput" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code" placeholder="••••••••" maxlength="20" style="width:100%;padding:12px 14px;border:1px solid var(--ring,#e5e7eb);border-radius:10px;font-size:15px;text-align:center;outline:none;background:var(--surface,#fff);color:var(--ink,#333);box-sizing:border-box;" onkeypress="if(event.key===\'Enter\')_verifyRuPasscode()">' +
        '<div id="ruPasscodeError" style="min-height:20px;margin:8px 0;font-size:13px;color:#f87171;"></div>' +
        '<button id="ruPasscodeBtn" onclick="_verifyRuPasscode()" style="width:100%;padding:12px;border:none;border-radius:10px;background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff;font-weight:600;font-size:14px;cursor:pointer;">Unlock</button>' +
        '<button onclick="_closeRuPasscode()" style="margin-top:8px;background:none;border:none;color:#888;font-size:13px;cursor:pointer;">Cancel</button>' +
        '</div>';
      document.body.appendChild(div);
      setTimeout(function() { div.classList.add('active'); document.getElementById('ruPasscodeInput').focus(); }, 10);
    }

    function _closeRuPasscode() {
      var el = document.getElementById('ruPasscodeOverlay');
      if (el) el.classList.remove('active');
    }

    async function _verifyRuPasscode() {
      var input = document.getElementById('ruPasscodeInput');
      var error = document.getElementById('ruPasscodeError');
      var btn = document.getElementById('ruPasscodeBtn');
      var code = (input.value || '').trim();
      if (!code) { error.textContent = '❌ Please enter a passcode'; return; }
      btn.disabled = true; btn.textContent = '⏳ Verifying...';
      error.textContent = '';
      try {
        var resp = await fetch('https://admin0709.alwaysdata.net/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passcode: code, type: 'bsb', validate: true, timestamp: Date.now(), source: 'registered-users' , center: ((window.SITE_CONFIG&&window.SITE_CONFIG.testIdentifier)||'mock_stream').replace(/_/g,'')})
        });
        if (!resp.ok) throw new Error('Server error');
        var data = await resp.json();
        if (data.access) {
          _ruAdminUnlocked = true;
          _closeRuPasscode();
          openRegisteredUsersPanel();
        } else {
          throw new Error('Invalid');
        }
      } catch (e) {
        error.textContent = '❌ Incorrect passcode';
        input.value = '';
        input.focus();
      } finally {
        btn.disabled = false; btn.textContent = 'Unlock';
      }
    }

    function _ensureRuOverlay() {
      // Admin-host inline mode: render the panel chrome directly into the
      // host's right-pane container — no fixed-position #ruOverlay modal.
      if (_inlineContainer) {
        if (_inlineContainer.querySelector('#ruTabs')) return;
        _inlineContainer.innerHTML = '<div class="ru-panel" style="position:static;width:auto;max-width:none;height:auto;max-height:none;border-radius:14px;border:1px solid var(--ring,#e5e7eb);background:var(--surface,#fff);overflow:hidden;">' +
          '<div class="ru-header" style="background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;">' +
            '<h3 style="margin:0;font-size:16px;font-weight:700;">👥 Registered Users</h3>' +
          '</div>' +
          '<div id="ruTabs" style="display:flex;gap:6px;padding:12px 14px 8px;flex-wrap:wrap;">' +
            '<button type="button" class="ru-tab-btn" data-rutab="all"      onclick="_setRuTab(\'all\')"      style="padding:6px 12px;border:1px solid #ddd;border-radius:18px;background:#6366f1;color:#fff;font-size:12px;font-weight:700;cursor:pointer;">All <span data-rucount="all"></span></button>' +
            '<button type="button" class="ru-tab-btn" data-rutab="google"   onclick="_setRuTab(\'google\')"   style="padding:6px 12px;border:1px solid #ddd;border-radius:18px;background:#fff;color:#333;font-size:12px;font-weight:700;cursor:pointer;">🔑 Google <span data-rucount="google"></span></button>' +
            '<button type="button" class="ru-tab-btn" data-rutab="telegram" onclick="_setRuTab(\'telegram\')" style="padding:6px 12px;border:1px solid #ddd;border-radius:18px;background:#fff;color:#333;font-size:12px;font-weight:700;cursor:pointer;">✈️ Telegram <span data-rucount="telegram"></span></button>' +
            '<button type="button" class="ru-tab-btn" data-rutab="guest"    onclick="_setRuTab(\'guest\')"    style="padding:6px 12px;border:1px solid #ddd;border-radius:18px;background:#fff;color:#333;font-size:12px;font-weight:700;cursor:pointer;">👤 Guests <span data-rucount="guest"></span></button>' +
          '</div>' +
          '<input class="ru-search" id="ruSearch" type="text" placeholder="Search by name, email, center..." oninput="_filterRuList()" style="margin:0 14px 8px;padding:8px 12px;border:1px solid var(--ring,#e5e7eb);border-radius:8px;font-size:13px;width:calc(100% - 28px);box-sizing:border-box;">' +
          '<div class="ru-stats" id="ruStats" style="padding:0 14px 8px;font-size:12px;color:var(--ink-muted,#64748b);"></div>' +
          '<div class="ru-list" id="ruList" style="padding:0 14px 14px;max-height:60vh;overflow-y:auto;"><div class="ru-empty" style="text-align:center;padding:40px;color:#888;">Loading...</div></div>' +
          '</div>';
        return;
      }
      // Legacy modal mode (preserved verbatim).
      var existing = document.getElementById('ruOverlay');
      if (existing) {
        if (existing.querySelector('#ruTabs')) return;
        existing.parentNode.removeChild(existing);
      }
      var div = document.createElement('div');
      div.id = 'ruOverlay';
      div.className = 'ru-overlay';
      div.onclick = function(e) { if (e.target === div) closeRegisteredUsersPanel(); };
      div.innerHTML = '<div class="ru-panel">' +
        '<div class="ru-header"><h3>👥 Registered Users</h3><button class="ru-close" onclick="closeRegisteredUsersPanel()">&times;</button></div>' +
        '<div id="ruTabs" style="display:flex;gap:6px;padding:0 14px 8px;flex-wrap:wrap;">' +
          '<button type="button" class="ru-tab-btn" data-rutab="all"      onclick="_setRuTab(\'all\')"      style="padding:6px 12px;border:1px solid #ddd;border-radius:18px;background:#6366f1;color:#fff;font-size:12px;font-weight:700;cursor:pointer;">All <span data-rucount="all"></span></button>' +
          '<button type="button" class="ru-tab-btn" data-rutab="google"   onclick="_setRuTab(\'google\')"   style="padding:6px 12px;border:1px solid #ddd;border-radius:18px;background:#fff;color:#333;font-size:12px;font-weight:700;cursor:pointer;">🔑 Google <span data-rucount="google"></span></button>' +
          '<button type="button" class="ru-tab-btn" data-rutab="telegram" onclick="_setRuTab(\'telegram\')" style="padding:6px 12px;border:1px solid #ddd;border-radius:18px;background:#fff;color:#333;font-size:12px;font-weight:700;cursor:pointer;">✈️ Telegram <span data-rucount="telegram"></span></button>' +
          '<button type="button" class="ru-tab-btn" data-rutab="guest"    onclick="_setRuTab(\'guest\')"    style="padding:6px 12px;border:1px solid #ddd;border-radius:18px;background:#fff;color:#333;font-size:12px;font-weight:700;cursor:pointer;">👤 Guests <span data-rucount="guest"></span></button>' +
        '</div>' +
        '<input class="ru-search" id="ruSearch" type="text" placeholder="Search by name, email, center..." oninput="_filterRuList()">' +
        '<div class="ru-stats" id="ruStats"></div>' +
        '<div class="ru-list" id="ruList"><div class="ru-empty">Loading...</div></div>' +
        '</div>';
      document.body.appendChild(div);
    }

    var _ruAdminUnlocked = false;

    async function openRegisteredUsersPanel() {
      // Admin-host inline mode skips the passcode gate — admin.html
      // already verified super_admin via AdminAuth before loading us.
      if (!_inlineContainer && !_ruAdminUnlocked && !_siteAdminUnlocked) {
        _showRuPasscode();
        return;
      }
      _ruInjectStyles();
      _ensureRuOverlay();
      var overlay = document.getElementById('ruOverlay');
      if (overlay) overlay.classList.add('active');
      document.getElementById('ruList').innerHTML = '<div class="ru-empty">Loading...</div>';
      document.getElementById('ruSearch').value = '';
      document.getElementById('ruStats').textContent = '';
      var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
      var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
      // Anon clients can no longer SELECT candidates (RLS now requires
      // _caller_is_admin()). Send the signed-in admin's JWT so the request
      // passes the policy check.
      var token = SB_KEY;
      try {
        var _c = window.MockStream && window.MockStream.auth &&
                 typeof window.MockStream.auth.getClient === 'function'
                   ? window.MockStream.auth.getClient() : null;
        if (_c && _c.auth && typeof _c.auth.getSession === 'function') {
          var _sess = await _c.auth.getSession();
          var _at = _sess && _sess.data && _sess.data.session && _sess.data.session.access_token;
          if (_at) token = _at;
        }
      } catch (_e) {}
      try {
        var [candResp, premResp] = await Promise.all([
          // Fetch ALL candidates so we can split into Google-account vs Guest tabs
          fetch(SB_URL + '/rest/v1/candidates?select=*&order=updated_at.desc&limit=5000', {
            headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token }
          }),
          fetch(SB_URL + '/rest/v1/premium_emails?select=email,telegram_username,tier,role,center,active', {
            headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token }
          })
        ]);
        if (!candResp.ok) throw new Error('HTTP ' + candResp.status);
        _ruData = await candResp.json();
        var premRows = premResp.ok ? await premResp.json() : [];
        // Build email→role lookup: { email: { tier, role, center, active, premiumEmail } }
        window._ruPremiumMap = {};
        premRows.forEach(function(p) {
          if (p.email) window._ruPremiumMap[p.email.toLowerCase()] = p;
        });
        // ---- Bulk-load today's AI-call counts so each row can show "AI: N today"
        try {
          window._ruAiTodayMap = {};  // { 'email|name': N }
          var since24 = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          var aiResp = await fetch(
            SB_URL + '/rest/v1/ai_submission_logs' +
              '?select=user_email,student_name&status=eq.ok&created_at=gte.' +
              encodeURIComponent(since24) + '&limit=10000',
            { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY } }
          );
          if (aiResp.ok) {
            var aiRows = await aiResp.json();
            aiRows.forEach(function(r) {
              var k = (r.user_email || r.student_name || '').toLowerCase();
              if (!k) return;
              window._ruAiTodayMap[k] = (window._ruAiTodayMap[k] || 0) + 1;
            });
          }
        } catch (_aiErr) { window._ruAiTodayMap = {}; }
      } catch (e) {
        _ruData = [];
        window._ruPremiumMap = {};
        console.warn('[RegisteredUsers] Fetch error:', e);
      }
      _updateRuTabCounts();
      _renderRuList(_ruData.filter(_ruTabFilter));
    }

    function closeRegisteredUsersPanel() {
      var overlay = document.getElementById('ruOverlay');
      if (overlay) overlay.classList.remove('active');
    }

    // Active sub-tab in the Registered Users panel:
    //   'all' | 'google' | 'telegram' | 'guest'
    // Telegram-only users carry a synthetic email shaped like
    // tg_<id>@telegram.mock-stream.com (created by the verify-telegram-login
    // Edge Function). That pattern is the cheapest reliable signal.
    var _ruTab = 'all';
    var _RU_TELEGRAM_EMAIL_RE = /^tg_\d+@telegram\.mock-stream\.com$/i;

    function _ruIsTelegram(c) {
      return !!(c.email && _RU_TELEGRAM_EMAIL_RE.test(c.email.trim()));
    }
    function _ruIsGoogle(c) {
      // Has an email that ISN'T the Telegram synthetic.
      return !!(c.email && c.email.trim() && !_ruIsTelegram(c));
    }
    function _ruIsGuest(c) {
      return !(c.email && c.email.trim());
    }

    function _setRuTab(tab) {
      _ruTab = tab;
      // Update button visuals
      var btns = document.querySelectorAll('#ruTabs .ru-tab-btn');
      btns.forEach(function(b) {
        var active = b.getAttribute('data-rutab') === tab;
        b.style.background = active ? '#6366f1' : '#fff';
        b.style.color      = active ? '#fff'    : '#333';
      });
      _filterRuList();
    }
    window._setRuTab = _setRuTab;

    function _ruTabFilter(c) {
      if (_ruTab === 'google')   return _ruIsGoogle(c);
      if (_ruTab === 'telegram') return _ruIsTelegram(c);
      if (_ruTab === 'guest')    return _ruIsGuest(c);
      return true;
    }

    function _updateRuTabCounts() {
      var counts = { all: _ruData.length, google: 0, telegram: 0, guest: 0 };
      _ruData.forEach(function(c) {
        if (_ruIsTelegram(c))    counts.telegram++;
        else if (_ruIsGoogle(c)) counts.google++;
        else                     counts.guest++;
      });
      ['all','google','telegram','guest'].forEach(function(k) {
        var el = document.querySelector('#ruTabs [data-rucount="' + k + '"]');
        if (el) el.textContent = '(' + counts[k] + ')';
      });
    }

    function _filterRuList() {
      var q = (document.getElementById('ruSearch').value || '').toLowerCase().trim();
      var base = _ruData.filter(_ruTabFilter);
      if (!q) { _renderRuList(base); return; }
      var filtered = base.filter(function(c) {
        var match = (c.student_name || '').toLowerCase().indexOf(q) !== -1 ||
               (c.email || '').toLowerCase().indexOf(q) !== -1 ||
               (c.center || '').toLowerCase().indexOf(q) !== -1 ||
               (c.phone || '').toLowerCase().indexOf(q) !== -1;
        if (!match && c.email && window._ruPremiumMap) {
          var p = window._ruPremiumMap[c.email.toLowerCase()];
          if (p && p.active) {
            var roleStr = (p.role === 'admin' ? ((!p.center || p.center === '') ? 'super admin' : 'admin') : '') + ' ' + (p.tier || '');
            match = roleStr.toLowerCase().indexOf(q) !== -1;
          }
        }
        if (!match && c.blocked && 'blocked'.indexOf(q) !== -1) match = true;
        return match;
      });
      _renderRuList(filtered);
    }

    function _getRoleBadge(email) {
      if (!email || !window._ruPremiumMap) return '';
      var p = window._ruPremiumMap[email.toLowerCase()];
      if (!p || !p.active) return '';
      if (p.role === 'admin' && (!p.center || p.center === '')) {
        return '<span class="ru-role-badge ru-role-super-admin">⚡ Super Admin</span>';
      }
      if (p.role === 'admin') {
        return '<span class="ru-role-badge ru-role-admin">🛡️ Admin</span>';
      }
      if (p.tier === 'premium') {
        return '<span class="ru-role-badge ru-role-premium">⭐ Premium</span>';
      }
      return '';
    }

    function _getRoleBadgeDetail(email) {
      if (!email || !window._ruPremiumMap) return '';
      var p = window._ruPremiumMap[email.toLowerCase()];
      if (!p || !p.active) return '';
      var label = '', cls = '';
      if (p.role === 'admin' && (!p.center || p.center === '')) {
        label = '⚡ Super Admin'; cls = 'ru-role-super-admin';
      } else if (p.role === 'admin') {
        label = '🛡️ Admin'; cls = 'ru-role-admin';
      } else if (p.tier === 'premium') {
        label = '⭐ Premium'; cls = 'ru-role-premium';
      }
      if (!label) return '';
      return '<div style="font-size:11px;margin-top:3px;"><span class="ru-role-badge ' + cls + '">' + label + '</span> <span style="color:#aaa;font-size:10px;">' + p.email.replace(/</g, '&lt;') + '</span></div>';
    }

    function _renderRuList(list) {
      var container = document.getElementById('ruList');
      var statsEl = document.getElementById('ruStats');
      if (!list.length) {
        container.innerHTML = '<div class="ru-empty">No users found</div>';
        statsEl.textContent = '0 users';
        return;
      }
      // Count by center
      var centerCounts = {};
      list.forEach(function(c) { var cn = c.center || 'unknown'; centerCounts[cn] = (centerCounts[cn] || 0) + 1; });
      var statsArr = [];
      Object.keys(centerCounts).sort().forEach(function(k) { statsArr.push(k + ': ' + centerCounts[k]); });
      // Count roles
      var premCount = 0, adminCount = 0, superCount = 0;
      if (window._ruPremiumMap) {
        list.forEach(function(c) {
          if (!c.email) return;
          var p = window._ruPremiumMap[c.email.toLowerCase()];
          if (!p || !p.active) return;
          if (p.role === 'admin' && (!p.center || p.center === '')) superCount++;
          else if (p.role === 'admin') adminCount++;
          else if (p.tier === 'premium') premCount++;
        });
      }
      var roleStats = [];
      if (premCount) roleStats.push('⭐ ' + premCount + ' premium');
      if (adminCount) roleStats.push('🛡️ ' + adminCount + ' admin');
      if (superCount) roleStats.push('⚡ ' + superCount + ' super admin');
      statsEl.textContent = list.length + ' users — ' + statsArr.join(' · ') + (roleStats.length ? ' — ' + roleStats.join(' · ') : '');

      var html = '';
      list.forEach(function(c) {
        var name = c.student_name || 'Unknown';
        var parts = name.trim().split(/\s+/);
        var initials = parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
        var avatarInner = c.avatar_url
          ? '<img src="' + c.avatar_url.replace(/"/g, '&quot;') + '" alt="Avatar">'
          : initials;
        var center = c.center || 'unknown';
        var badgeClass = ['mock_stream','bek','global','niners','muzaffars'].indexOf(center) !== -1 ? center : 'unknown';
        var details = [];
        if (c.email) details.push('📧 ' + c.email);
        if (c.phone) details.push('📱 ' + c.phone);
        if (c.address) details.push('📍 ' + c.address);
        // Daily AI-call count (today, last 24h)
        var _aiKey = (c.email || c.student_name || '').toLowerCase();
        var _aiToday = (window._ruAiTodayMap && window._ruAiTodayMap[_aiKey]) || 0;
        if (_aiToday > 0) details.push('🤖 ' + _aiToday + ' AI today');
        var updatedStr = '';
        if (c.updated_at) {
          var _ud = new Date(c.updated_at);
          updatedStr = '🕐 ' + _ud.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][_ud.getMonth()] + ' ' + _ud.getFullYear() + ', ' + String(_ud.getHours()).padStart(2,'0') + ':' + String(_ud.getMinutes()).padStart(2,'0');
        }
        html += '<div class="ru-card' + (c.blocked ? ' ru-card-blocked' : '') + '" onclick="_viewUserResults(\'' + name.replace(/'/g, "\\'").replace(/</g, '&lt;') + '\')">' +
          '<div class="ru-card-avatar">' + avatarInner + '</div>' +
          '<div class="ru-card-info">' +
            '<div class="ru-card-name">' + name.replace(/</g, '&lt;') + (c.blocked ? ' <span style="color:#e53935;font-size:11px;font-weight:700;">🚫 BLOCKED</span>' : '') + _getRoleBadge(c.email) + '</div>' +
            (details.length ? '<div class="ru-card-detail">' + details.join(' &nbsp;·&nbsp; ').replace(/</g, '&lt;') + '</div>' : '') +
            (updatedStr ? '<div style="font-size:11px;color:#aaa;margin-top:1px;">' + updatedStr + '</div>' : '') +
            '<span class="ru-center-badge ' + badgeClass + '">' + center.replace(/</g, '&lt;') + '</span>' +
          '</div></div>';
      });
      container.innerHTML = html;
    }

    async function _toggleBlockUser(studentName, center, currentlyBlocked) {
      var action = currentlyBlocked ? 'unblock' : 'block';
      if (!confirm('Are you sure you want to ' + action + ' "' + studentName + '"?')) return;
      var btn = document.getElementById('ruBlockBtn');
      if (btn) { btn.disabled = true; btn.textContent = '⏳ Updating...'; }
      var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
      var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
      try {
        var resp = await fetch(SB_URL + '/rest/v1/candidates?student_name=eq.' + encodeURIComponent(studentName) + '&center=eq.' + encodeURIComponent(center), {
          method: 'PATCH',
          headers: {
            'apikey': SB_KEY,
            'Authorization': 'Bearer ' + SB_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ blocked: !currentlyBlocked })
        });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        // Update button in-place
        var newBlocked = !currentlyBlocked;
        if (btn) {
          btn.style.background = newBlocked ? '#43a047' : '#e53935';
          btn.textContent = newBlocked ? '✅ Unblock User' : '🚫 Block User';
          btn.disabled = false;
          btn.setAttribute('onclick', "_toggleBlockUser('" + studentName.replace(/'/g, "\\'") + "', '" + center.replace(/'/g, "\\'") + "', " + newBlocked + ")");
        }
        // Also update the cached candidate list if present
        if (window._ruAllCandidates) {
          window._ruAllCandidates.forEach(function(c) {
            if (c.student_name === studentName && c.center === center) c.blocked = newBlocked;
          });
        }
      } catch (e) {
        alert('Failed to ' + action + ' user: ' + e.message);
        if (btn) { btn.disabled = false; btn.textContent = currentlyBlocked ? '✅ Unblock User' : '🚫 Block User'; }
      }
    }

    // ----- AI-call counts (today + lifetime) for the user being viewed -----
    async function _loadUserAiCallCounts(email, studentName) {
      var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
      var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
      var todayEl = document.getElementById('ruAiTodayStat');
      var totalEl = document.getElementById('ruAiTotalStat');
      function _set(el, n) { if (el) el.querySelector('.sv').textContent = n; }
      try {
        var since24 = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        var filterToday = '?select=id&status=eq.ok&created_at=gte.' + encodeURIComponent(since24);
        var filterTotal = '?select=id&status=eq.ok';
        if (email) {
          var em = encodeURIComponent(email.toLowerCase());
          filterToday += '&user_email=eq.' + em;
          filterTotal += '&user_email=eq.' + em;
        } else if (studentName) {
          var sn = encodeURIComponent(studentName);
          filterToday += '&student_name=eq.' + sn + '&user_email=is.null';
          filterTotal += '&student_name=eq.' + sn + '&user_email=is.null';
        } else { _set(todayEl, 0); _set(totalEl, 0); return; }
        var hdrs = { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Prefer': 'count=exact', 'Range-Unit': 'items', 'Range': '0-0' };
        var [tr, lr] = await Promise.all([
          fetch(SB_URL + '/rest/v1/ai_submission_logs' + filterToday, { headers: hdrs }),
          fetch(SB_URL + '/rest/v1/ai_submission_logs' + filterTotal, { headers: hdrs })
        ]);
        function _parseCount(resp) {
          var cr = resp.headers.get('content-range') || '';
          var m  = cr.match(/\/(\d+)$/);
          return m ? Number(m[1]) : 0;
        }
        _set(todayEl, _parseCount(tr));
        _set(totalEl, _parseCount(lr));
      } catch (e) {
        console.warn('[RU] AI count fetch error:', e);
        _set(todayEl, '?'); _set(totalEl, '?');
      }
    }

    // ----- Premium / Admin role assignment from the Registered Users panel -----
    function _ruRoleMsg(text, kind) {
      var el = document.getElementById('ruRoleMsg');
      if (!el) return;
      el.textContent = text || '';
      el.style.color = kind === 'error' ? '#e53935' : (kind === 'success' ? '#10b981' : '#666');
    }
    async function _saveUserRole(email) {
      var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
      var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
      var tier   = (document.getElementById('ruRoleTier') || {}).value || 'premium';
      var role   = (document.getElementById('ruRoleRole') || {}).value || 'user';
      var center = ((document.getElementById('ruRoleCenter') || {}).value || '').trim();
      var btn    = document.getElementById('ruRoleSaveBtn');
      if (btn) { btn.disabled = true; btn.textContent = '⏳ Saving...'; }
      var existing = (window._ruPremiumMap || {})[email];
      try {
        var resp;
        if (existing) {
          resp = await fetch(SB_URL + '/rest/v1/premium_emails?email=eq.' + encodeURIComponent(email), {
            method: 'PATCH',
            headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
            body: JSON.stringify({ tier: tier, role: role, center: center, active: true })
          });
        } else {
          resp = await fetch(SB_URL + '/rest/v1/premium_emails', {
            method: 'POST',
            headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
            body: JSON.stringify({ email: email, tier: tier, role: role, center: center, active: true })
          });
        }
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        // Update local cache so the next render reflects it
        window._ruPremiumMap = window._ruPremiumMap || {};
        window._ruPremiumMap[email] = { email: email, tier: tier, role: role, center: center, active: true };
        _ruRoleMsg('✅ Saved: ' + tier + ' / ' + role + (center ? ' @ ' + center : ''), 'success');
        if (btn) { btn.disabled = false; btn.textContent = '💾 Update'; }
      } catch (e) {
        _ruRoleMsg('Failed: ' + e.message, 'error');
        if (btn) { btn.disabled = false; btn.textContent = existing ? '💾 Update' : '➕ Assign'; }
      }
    }
    // Phase 2: grant premium by Telegram username (no email needed). The
    // student gives admin their @handle, admin types it here. When the student
    // signs in via Telegram on mock-stream.com, verify-passcode + auth.js's
    // checkPremiumRole() match by user_metadata.telegram_username and
    // unlock premium automatically — same way the existing email path works.
    async function _saveTelegramRole() {
      var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
      var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
      var rawU  = ((document.getElementById('ruTgUsername') || {}).value || '').trim();
      var u = rawU.replace(/^@/, '').toLowerCase();
      var tier   = (document.getElementById('ruTgTier') || {}).value || 'premium';
      var role   = (document.getElementById('ruTgRole') || {}).value || 'user';
      var center = ((document.getElementById('ruTgCenter') || {}).value || '').trim();
      var btn  = document.getElementById('ruTgSaveBtn');
      var msg  = document.getElementById('ruTgMsg');
      function _say(t, color) { if (msg) { msg.textContent = t; msg.style.color = color || '#475569'; } }
      if (!u || !/^[a-zA-Z0-9_]{3,32}$/.test(u)) {
        _say('Enter a valid Telegram username (3–32 chars, letters/digits/underscore).', '#dc2626');
        return;
      }
      if (btn) { btn.disabled = true; btn.textContent = '⏳ Saving...'; }
      try {
        // Try UPDATE first (in case already granted), fall back to INSERT.
        var patchResp = await fetch(SB_URL + '/rest/v1/premium_emails?telegram_username=eq.' + encodeURIComponent(u), {
          method: 'PATCH',
          headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
          body: JSON.stringify({ tier: tier, role: role, center: center, active: true })
        });
        var patchData = patchResp.ok ? await patchResp.json() : null;
        if (!patchData || patchData.length === 0) {
          // No existing row → INSERT
          var insResp = await fetch(SB_URL + '/rest/v1/premium_emails', {
            method: 'POST',
            headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
            body: JSON.stringify({ telegram_username: u, tier: tier, role: role, center: center, active: true })
          });
          if (!insResp.ok) {
            var errTxt = await insResp.text();
            throw new Error('HTTP ' + insResp.status + (errTxt ? (': ' + errTxt) : ''));
          }
        }
        _say('✅ Granted to @' + u + ': ' + tier + ' / ' + role + (center ? ' @ ' + center : ''), '#10b981');
      } catch (e) {
        _say('Failed: ' + (e.message || e), '#dc2626');
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = '➕ Grant'; }
      }
    }
    window._saveTelegramRole = _saveTelegramRole;

    async function _toggleUserRoleActive(email, makeActive) {
      var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
      var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
      try {
        var resp = await fetch(SB_URL + '/rest/v1/premium_emails?email=eq.' + encodeURIComponent(email), {
          method: 'PATCH',
          headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify({ active: !!makeActive })
        });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        if (window._ruPremiumMap && window._ruPremiumMap[email]) window._ruPremiumMap[email].active = !!makeActive;
        _ruRoleMsg(makeActive ? '▶ Activated' : '⏸ Deactivated', 'success');
      } catch (e) {
        _ruRoleMsg('Failed: ' + e.message, 'error');
      }
    }
    async function _removeUserRole(email) {
      if (!confirm('Remove premium / admin access for ' + email + '?')) return;
      var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
      var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
      try {
        var resp = await fetch(SB_URL + '/rest/v1/premium_emails?email=eq.' + encodeURIComponent(email), {
          method: 'DELETE',
          headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
        });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        if (window._ruPremiumMap) delete window._ruPremiumMap[email];
        _ruRoleMsg('🗑 Removed', 'success');
      } catch (e) {
        _ruRoleMsg('Failed: ' + e.message, 'error');
      }
    }

    // ----- Send Private DM from Registered Users panel → user's Help Center Private tab -----
    // Looks up every device_id known for this user (from premium_devices and from prior private
    // messages) and posts an admin reply into each <device_id>_private conversation, so the user
    // sees the message no matter which device they're on.
    async function _ruSendPrivateDm(email, studentName) {
      var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
      var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
      var ta = document.getElementById('ruDmText');
      var btn = document.getElementById('ruDmSendBtn');
      var msg = document.getElementById('ruDmMsg');
      function _say(t, color) { if (msg) { msg.textContent = t; msg.style.color = color || '#666'; } }
      var text = (ta && ta.value || '').trim();
      if (!text) { _say('Type a message first.', '#e53935'); return; }
      if (btn) { btn.disabled = true; btn.textContent = '⏳ Sending...'; }
      _say('Looking up devices...');
      try {
        var deviceIds = {};
        // Source 1: premium_devices (only for registered emails)
        if (email) {
          try {
            var dResp = await fetch(SB_URL + '/rest/v1/premium_devices?email=eq.' + encodeURIComponent(email) + '&select=device_id', {
              headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
            });
            if (dResp.ok) {
              var dRows = await dResp.json();
              dRows.forEach(function(r) { if (r.device_id) deviceIds[r.device_id] = true; });
            }
          } catch (_e) {}
        }
        // Source 2: prior private messages from this user
        try {
          var nameQ = encodeURIComponent(studentName);
          var sResp = await fetch(SB_URL + '/rest/v1/support_messages?sender_name=eq.' + nameQ + '&category=eq.private&role=eq.user&select=device_id&order=created_at.desc&limit=20', {
            headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
          });
          if (sResp.ok) {
            var sRows = await sResp.json();
            sRows.forEach(function(r) { if (r.device_id) deviceIds[r.device_id] = true; });
          }
        } catch (_e2) {}
        var ids = Object.keys(deviceIds);
        if (!ids.length) {
          _say('No device found for this user yet — they need to open the app at least once after signing in.', '#e53935');
          if (btn) { btn.disabled = false; btn.textContent = '📨 Send'; }
          return;
        }
        _say('Sending to ' + ids.length + ' device' + (ids.length === 1 ? '' : 's') + '...');
        var senderName = (typeof getMsAdminName === 'function' ? getMsAdminName() : null) || 'Admin';
        var center = (window.SITE_CONFIG && window.SITE_CONFIG.testIdentifier) || 'mock_stream';
        var sent = 0, failed = 0;
        for (var i = 0; i < ids.length; i++) {
          var body = {
            conversation_id: ids[i] + '_private',
            role: 'admin',
            sender_name: senderName,
            content: text,
            category: 'private',
            center: center,
            device_id: 'admin_panel'
          };
          try {
            var pResp = await fetch(SB_URL + '/rest/v1/support_messages', {
              method: 'POST',
              headers: {
                'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY,
                'Content-Type': 'application/json', 'Prefer': 'return=minimal'
              },
              body: JSON.stringify(body)
            });
            if (pResp.ok) sent++; else failed++;
          } catch (_e3) { failed++; }
        }
        if (sent > 0) {
          _say('✅ Delivered to ' + sent + ' device' + (sent === 1 ? '' : 's') + (failed ? ' (' + failed + ' failed)' : ''), '#10b981');
          if (ta) ta.value = '';
        } else {
          _say('❌ Send failed.', '#e53935');
        }
      } catch (e) {
        _say('Error: ' + (e && e.message || e), '#e53935');
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = '📨 Send'; }
      }
    }
    window._ruSendPrivateDm = _ruSendPrivateDm;

    async function _viewUserResults(studentName) {
      var searchEl = document.getElementById('ruSearch');
      var statsEl = document.getElementById('ruStats');
      var listEl = document.getElementById('ruList');
      // Save scroll state
      searchEl.style.display = 'none';
      var tabsEl = document.getElementById('ruTabs');
      if (tabsEl) tabsEl.style.display = 'none';
      statsEl.innerHTML = '<button class="ru-back-btn" onclick="_backToUsersList()">← Back to Users</button>';
      listEl.innerHTML = '<div class="ru-empty">Loading results...</div>';
      // Update header
      var headerH3 = document.querySelector('.ru-header h3');
      if (headerH3) headerH3.innerHTML = '📊 ' + studentName.replace(/</g, '&lt;');

      var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
      var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
      var results = [];
      try {
        var resp = await fetch(SB_URL + '/rest/v1/results?student_name=eq.' + encodeURIComponent(studentName) + '&select=*&order=created_at.desc', {
          headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
        });
        if (resp.ok) results = await resp.json();
      } catch (e) { console.warn('[RU] Results fetch error:', e); }

      var hasResults = results.length > 0;

      // Summary stats
      var totalTests = results.length;
      var aiCount = 0; var skills = {};
      results.forEach(function(r) {
        skills[r.skill] = true;
        if (r.metadata && (r.metadata.hasAi || r.metadata.fc || r.metadata.p11 || r.metadata.t1_band || r.metadata.raw_score)) aiCount++;
      });
      // Split by exam type
      var cefrResults = results.filter(function(r) { return r.exam_type !== 'ielts'; });
      var ieltsResults = results.filter(function(r) { return r.exam_type === 'ielts'; });
      var cefrLatest = cefrResults.length ? (cefrResults[0].score || '—') : null;
      var ieltsLatest = ieltsResults.length ? (ieltsResults[0].score || '—') : null;
      var cefrBest = null, ieltsBest = null;
      cefrResults.forEach(function(r) {
        var num = _parseNum(r.score);
        if (num !== null && (cefrBest === null || num > cefrBest)) cefrBest = num;
      });
      ieltsResults.forEach(function(r) {
        var num = _parseNum(r.score);
        if (num !== null && (ieltsBest === null || num > ieltsBest)) ieltsBest = num;
      });

      var html = '';

      // Profile contact card
      var candidate = _ruData.find(function(c) { return c.student_name === studentName; });
      if (candidate) {
        var avatarParts = studentName.trim().split(/\s+/);
        var avatarInitials = avatarParts.length >= 2 ? (avatarParts[0][0] + avatarParts[avatarParts.length - 1][0]).toUpperCase() : studentName.substring(0, 2).toUpperCase();
        var avatarInner = candidate.avatar_url
          ? '<img src="' + candidate.avatar_url.replace(/"/g, '&quot;') + '" alt="" style="width:100%;height:100%;object-fit:cover;">'
          : avatarInitials;
        var center = candidate.center || 'unknown';
        var badgeClass = ['mock_stream','bek','global','niners','muzaffars'].indexOf(center) !== -1 ? center : 'unknown';
        html += '<div style="display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:14px;border:1px solid var(--ring,#e5e7eb);background:linear-gradient(135deg,#6366f106,#818cf806);margin-bottom:10px;">';
        html += '<div class="ru-card-avatar" style="width:52px;height:52px;font-size:18px;">' + avatarInner + '</div>';
        html += '<div style="flex:1;min-width:0;">';
        html += '<div style="font-weight:700;font-size:15px;margin-bottom:3px;">' + studentName.replace(/</g, '&lt;') + '</div>';
        if (candidate.email) html += '<div style="font-size:12px;color:#888;margin-bottom:1px;">📧 ' + candidate.email.replace(/</g, '&lt;') + '</div>';
        if (candidate.phone) html += '<div style="font-size:12px;color:#888;margin-bottom:1px;">📱 ' + candidate.phone.replace(/</g, '&lt;') + '</div>';
        if (candidate.address) html += '<div style="font-size:12px;color:#888;margin-bottom:1px;">📍 ' + candidate.address.replace(/</g, '&lt;') + '</div>';
        if (!candidate.email && !candidate.phone && !candidate.address) html += '<div style="font-size:12px;color:#aaa;font-style:italic;">No contact details yet</div>';
        // Timestamps
        var _tsLines = [];
        if (candidate.created_at) {
          var cd = new Date(candidate.created_at);
          _tsLines.push('📅 Registered: ' + cd.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][cd.getMonth()] + ' ' + cd.getFullYear() + ', ' + String(cd.getHours()).padStart(2,'0') + ':' + String(cd.getMinutes()).padStart(2,'0'));
        }
        if (candidate.updated_at && candidate.updated_at !== candidate.created_at) {
          var ud = new Date(candidate.updated_at);
          _tsLines.push('🕐 Last updated: ' + ud.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][ud.getMonth()] + ' ' + ud.getFullYear() + ', ' + String(ud.getHours()).padStart(2,'0') + ':' + String(ud.getMinutes()).padStart(2,'0'));
        }
        if (results.length) {
          var lr = new Date(results[0].created_at);
          _tsLines.push('🎯 Last test: ' + lr.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][lr.getMonth()] + ' ' + lr.getFullYear() + ', ' + String(lr.getHours()).padStart(2,'0') + ':' + String(lr.getMinutes()).padStart(2,'0'));
        }
        if (_tsLines.length) html += '<div style="font-size:11px;color:#aaa;margin-top:4px;line-height:1.6;">' + _tsLines.join('<br>') + '</div>';
        html += '<span class="ru-center-badge ' + badgeClass + '" style="margin-top:4px;">' + center.replace(/</g, '&lt;') + '</span>';
        html += _getRoleBadgeDetail(candidate.email);
        // Block / Unblock button
        var _isBlocked = candidate && candidate.blocked;
        html += '<button id="ruBlockBtn" onclick="_toggleBlockUser(\'' + studentName.replace(/'/g, "\\'") + '\', \'' + center.replace(/'/g, "\\'") + '\', ' + (_isBlocked ? 'true' : 'false') + ')" style="margin-top:8px;padding:6px 16px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;color:#fff;background:' + (_isBlocked ? '#43a047' : '#e53935') + ';">' + (_isBlocked ? '✅ Unblock User' : '🚫 Block User') + '</button>';
        html += '</div></div>';

        // ---- Premium / Admin role assignment (admin-only) ----
        if (candidate.email) {
          var _emL  = candidate.email.toLowerCase();
          var _curP = (window._ruPremiumMap && window._ruPremiumMap[_emL]) || null;
          var _curTier   = _curP ? (_curP.tier   || 'premium') : 'premium';
          var _curRole   = _curP ? (_curP.role   || 'user')    : 'user';
          var _curCenter = _curP ? (_curP.center || center)    : center;
          var _curActive = _curP ? !!_curP.active : true;
          html += '<div id="ruRoleBox" style="margin-top:8px;padding:12px;border:1px solid var(--ring,#e5e7eb);border-radius:12px;background:#fafbff;">';
          html += '<div style="font-weight:700;font-size:13px;margin-bottom:8px;">🔑 Premium / Admin Access</div>';
          html += '<div id="ruRoleStatus" style="font-size:11px;color:#666;margin-bottom:8px;">' +
                  (_curP ? ('Current: <b>' + _curTier + '</b> / <b>' + _curRole + '</b> @ <b>' + (_curCenter || 'all') + '</b>' + (_curActive ? '' : ' (inactive)')) : 'No premium / admin role assigned.') +
                  '</div>';
          html += '<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">';
          html += '<select id="ruRoleTier" style="padding:5px 8px;border:1px solid #ddd;border-radius:6px;font-size:12px;">' +
                    '<option value="premium"' + (_curTier==='premium' ? ' selected' : '') + '>premium</option>' +
                    '<option value="free"'    + (_curTier==='free'    ? ' selected' : '') + '>free</option>' +
                  '</select>';
          html += '<select id="ruRoleRole" style="padding:5px 8px;border:1px solid #ddd;border-radius:6px;font-size:12px;">' +
                    '<option value="user"'  + (_curRole==='user'  ? ' selected' : '') + '>user</option>' +
                    '<option value="admin"' + (_curRole==='admin' ? ' selected' : '') + '>admin</option>' +
                  '</select>';
          html += '<input id="ruRoleCenter" type="text" value="' + (_curCenter || '').replace(/"/g,'&quot;') + '" placeholder="center (blank = all)" style="padding:5px 8px;border:1px solid #ddd;border-radius:6px;font-size:12px;flex:1;min-width:120px;">';
          html += '<button id="ruRoleSaveBtn" onclick="_saveUserRole(\'' + _emL.replace(/'/g, "\\'") + '\')" style="padding:6px 14px;border:none;border-radius:6px;font-size:12px;font-weight:700;color:#fff;background:#6366f1;cursor:pointer;">' + (_curP ? '💾 Update' : '➕ Assign') + '</button>';
          if (_curP) {
            html += '<button onclick="_toggleUserRoleActive(\'' + _emL.replace(/'/g, "\\'") + '\', ' + (!_curActive) + ')" style="padding:6px 12px;border:none;border-radius:6px;font-size:12px;font-weight:700;color:#fff;background:' + (_curActive ? '#f59e0b' : '#10b981') + ';cursor:pointer;">' + (_curActive ? '⏸ Deactivate' : '▶ Activate') + '</button>';
            html += '<button onclick="_removeUserRole(\'' + _emL.replace(/'/g, "\\'") + '\')" style="padding:6px 12px;border:none;border-radius:6px;font-size:12px;font-weight:700;color:#fff;background:#9ca3af;cursor:pointer;">🗑 Remove</button>';
          }
          html += '</div>';
          html += '<div id="ruRoleMsg" style="font-size:11px;margin-top:6px;min-height:14px;"></div>';
          html += '</div>';
        }

        // ---- Send Private Message (writes to support_messages → user's Private tab) ----
        if (candidate.email || studentName) {
          var _dmEmAttr = (candidate.email || '').replace(/"/g, '&quot;');
          var _dmNmAttr = studentName.replace(/'/g, "\\'").replace(/"/g, '&quot;');
          html += '<div id="ruDmBox" style="margin-top:8px;padding:12px;border:1px solid var(--ring,#e5e7eb);border-radius:12px;background:#f0f9ff;">';
          html += '<div style="font-weight:700;font-size:13px;margin-bottom:8px;">✉️ Send Private Message</div>';
          html += '<div style="font-size:11px;color:#666;margin-bottom:8px;">Sent to this user\'s Help Center → Private tab. They\'ll see a notification badge on the chat bubble.</div>';
          html += '<textarea id="ruDmText" placeholder="Type a private message..." rows="3" style="width:100%;padding:8px 10px;border:1px solid #ddd;border-radius:8px;font-size:13px;font-family:inherit;resize:vertical;box-sizing:border-box;"></textarea>';
          html += '<div style="display:flex;gap:8px;align-items:center;margin-top:6px;">';
          html += '<button id="ruDmSendBtn" onclick="_ruSendPrivateDm(\'' + _dmEmAttr + '\', \'' + _dmNmAttr + '\')" style="padding:7px 16px;border:none;border-radius:8px;font-size:12px;font-weight:700;color:#fff;background:#0ea5e9;cursor:pointer;">📨 Send</button>';
          html += '<div id="ruDmMsg" style="font-size:11px;color:#666;flex:1;"></div>';
          html += '</div>';
          html += '</div>';
        }
      }

      html += '<div class="ru-summary-row">';
      html += '<div class="ru-summary-stat"><div class="sv">' + totalTests + '</div><div class="sl">Tests</div></div>';
      if (cefrLatest !== null) html += '<div class="ru-summary-stat"><div class="sv">' + String(cefrLatest).replace(/</g, '&lt;') + '</div><div class="sl">CEFR Latest</div></div>';
      if (cefrBest !== null) html += '<div class="ru-summary-stat"><div class="sv">' + cefrBest + '</div><div class="sl">CEFR Best</div></div>';
      if (ieltsLatest !== null) html += '<div class="ru-summary-stat"><div class="sv">' + String(ieltsLatest).replace(/</g, '&lt;') + '</div><div class="sl">IELTS Latest</div></div>';
      if (ieltsBest !== null) html += '<div class="ru-summary-stat"><div class="sv">' + ieltsBest + '</div><div class="sl">IELTS Best</div></div>';
      html += '<div class="ru-summary-stat"><div class="sv">' + Object.keys(skills).length + '</div><div class="sl">Skills</div></div>';
      html += '<div class="ru-summary-stat"><div class="sv">' + aiCount + '</div><div class="sl">AI Scored</div></div>';
      // Daily + lifetime AI proxy calls (from ai_submission_logs)
      html += '<div class="ru-summary-stat" id="ruAiTodayStat"><div class="sv">…</div><div class="sl">AI Today</div></div>';
      html += '<div class="ru-summary-stat" id="ruAiTotalStat"><div class="sv">…</div><div class="sl">AI Total</div></div>';
      html += '</div>';

      // Kick off async fetch for AI-call counts (non-blocking)
      _loadUserAiCallCounts(candidate ? candidate.email : '', studentName);

      if (!hasResults) {
        html += '<div class="ru-empty" style="margin-top:12px;">No mock results yet for this user.</div>';
      }

      // Result cards
      results.forEach(function(r) {
        var d = new Date(r.created_at);
        var dateStr = d.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()] + ' ' + d.getFullYear() + ', ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
        var score = r.score || '—';
        var bigNum = score, subNum = '';
        if (score.indexOf('/') > -1) { var sp = score.split('/'); bigNum = sp[0]; subNum = '/ ' + sp[1]; }
        var level = r.level || '';
        var examCls = r.exam_type === 'ielts' ? 'rb-ielts' : 'rb-cefr';
        var skillCls = 'rb-' + (r.skill || 'speaking');
        var isPractice = (r.metadata && r.metadata.is_practice) || (r.mock_number && r.mock_number.indexOf('Practice') === 0);
        var hasAi = r.metadata && (r.metadata.hasAi || r.metadata.fc || r.metadata.p11 || r.metadata.t1_band);

        // Sub-score details
        var det = '';
        if (r.metadata) {
          var m = r.metadata;
          if (m.fc !== undefined) det += '<span class="dl">FC:</span> ' + m.fc + ' · <span class="dl">LR:</span> ' + m.lr + ' · <span class="dl">GRA:</span> ' + m.gra + ' · <span class="dl">P:</span> ' + m.p + '<br>';
          if (m.p11 !== undefined) det += '<span class="dl">P1.1:</span> ' + m.p11 + ' · <span class="dl">P1.2:</span> ' + m.p12 + ' · <span class="dl">P2:</span> ' + m.p2 + ' · <span class="dl">P3:</span> ' + m.p3 + '<br>';
          if (m.t1_band !== undefined) det += '<span class="dl">Task 1:</span> ' + m.t1_band + ' · <span class="dl">Task 2:</span> ' + m.t2_band + '<br>';
          if (m.l !== undefined && m.r !== undefined) det += '<span class="dl">L:</span> ' + m.l + ' · <span class="dl">R:</span> ' + m.r + ' · <span class="dl">W:</span> ' + (m.w||'—') + ' · <span class="dl">S:</span> ' + (m.s||'—') + '<br>';
          if (m.raw !== undefined && m.total !== undefined) det += '<span class="dl">Raw:</span> ' + m.raw + '/' + m.total + (m.percentage !== undefined ? ' (' + m.percentage + '%)' : '') + '<br>';
        }

        var reportClick = '';
        if (r.report_path) {
          reportClick = ' onclick="_openRuReport(\'' + (r.report_path || '').replace(/'/g, "\\'") + '\')" title="Click to view report"';
        }

        html += '<div class="ru-result-card"' + reportClick + '>' +
          '<div class="ru-result-score"><div class="big">' + bigNum.toString().replace(/</g,'&lt;') + '</div>' + (subNum ? '<div class="sub">' + subNum.replace(/</g,'&lt;') + '</div>' : '') + (level ? '<div class="sub">' + level.replace(/</g,'&lt;') + '</div>' : '') + '</div>' +
          '<div class="ru-result-info">' +
            '<div class="ru-result-date">' + dateStr + '</div>' +
            '<div class="ru-result-badges">' +
              '<span class="rb ' + examCls + '">' + (r.exam_type || '').toUpperCase() + '</span>' +
              '<span class="rb ' + skillCls + '">' + ((r.skill||'').charAt(0).toUpperCase() + (r.skill||'').slice(1)) + '</span>' +
              (isPractice ? '<span class="rb rb-practice">Practice</span>' : '') +
              (hasAi ? '<span class="rb rb-ai">AI ✓</span>' : '') +
              (r.mock_number ? '<span class="rb rb-practice">' + r.mock_number.replace(/</g,'&lt;') + '</span>' : '') +
            '</div>' +
            (det ? '<div class="ru-result-details">' + det + '</div>' : '') +
          '</div>' +
          (r.report_path ? '<div style="align-self:center;font-size:18px;color:#6366f1;flex-shrink:0;" title="View Report">📄</div>' : '') +
          '</div>';
      });

      listEl.innerHTML = html;
    }

    function _ensureRuReportOverlay() {
      if (document.getElementById('ruReportOverlay')) return;
      var div = document.createElement('div');
      div.id = 'ruReportOverlay';
      div.className = 'ru-report-overlay';
      div.onclick = function(e) { if (e.target === div) _closeRuReport(); };
      div.innerHTML = '<div class="ru-report-panel">' +
        '<div class="ru-report-header"><h4 id="ruReportTitle">Report</h4><button class="ru-report-close" onclick="_closeRuReport()">&times;</button></div>' +
        '<div class="ru-report-body">' +
          '<div class="ru-report-progress" id="ruReportProgress"><div class="ru-report-progress-bar" id="ruReportProgressBar"></div></div>' +
          '<div class="ru-report-loading" id="ruReportLoading"><div class="spinner"></div><div class="label">Loading report...</div></div>' +
          '<iframe id="ruReportIframe" src="about:blank"></iframe>' +
        '</div>' +
        '</div>';
      document.body.appendChild(div);
    }

    function _ruShowLoading() {
      var p = document.getElementById('ruReportProgress');
      var b = document.getElementById('ruReportProgressBar');
      var l = document.getElementById('ruReportLoading');
      if (p) { p.classList.remove('done'); p.style.display = ''; }
      if (b) b.style.width = '0%';
      if (l) l.style.display = '';
      // Animate progress
      setTimeout(function() { if (b) b.style.width = '30%'; }, 50);
    }
    function _ruProgress(pct) {
      var b = document.getElementById('ruReportProgressBar');
      if (b) b.style.width = pct + '%';
    }
    function _ruHideLoading() {
      var b = document.getElementById('ruReportProgressBar');
      var p = document.getElementById('ruReportProgress');
      var l = document.getElementById('ruReportLoading');
      if (b) b.style.width = '100%';
      if (p) setTimeout(function() { p.classList.add('done'); }, 300);
      if (l) l.style.display = 'none';
    }

    function _openRuReport(reportPath) {
      if (!reportPath) return;
      _ensureRuReportOverlay();
      var overlay = document.getElementById('ruReportOverlay');
      var iframe = document.getElementById('ruReportIframe');
      var title = document.getElementById('ruReportTitle');
      title.textContent = 'Loading report...';
      iframe.src = 'about:blank';
      overlay.classList.add('active');
      _ruShowLoading();

      var url = 'https://zknyukkbtbcqgvkgjktb.supabase.co/storage/v1/object/public/reports/' + reportPath;

      if (reportPath.toLowerCase().endsWith('.zip')) {
        _ruProgress(15);
        var loadJSZip = typeof JSZip !== 'undefined'
          ? Promise.resolve()
          : new Promise(function(resolve, reject) {
              var s = document.createElement('script');
              s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
              s.onload = resolve;
              s.onerror = reject;
              document.head.appendChild(s);
            });

        loadJSZip
          .then(function() { _ruProgress(25); return fetch(url); })
          .then(function(r) { _ruProgress(50); return r.arrayBuffer(); })
          .then(function(buf) { _ruProgress(65); return JSZip.loadAsync(buf); })
          .then(function(zip) {
            _ruProgress(80);
            var htmlFiles = [];
            zip.forEach(function(path, entry) {
              if (path.toLowerCase().endsWith('.html')) htmlFiles.push(entry);
            });
            if (htmlFiles.length === 0) throw new Error('No HTML in zip');
            return htmlFiles[0].async('text');
          })
          .then(function(html) {
            _ruProgress(95);
            var blob = new Blob([html], { type: 'text/html' });
            iframe.src = URL.createObjectURL(blob);
            title.textContent = reportPath.split('/').pop();
            _ruHideLoading();
          })
          .catch(function(e) {
            console.warn('[RU] Zip report error:', e);
            title.textContent = 'Failed to load report';
            _ruHideLoading();
          });
      } else {
        _ruProgress(20);
        fetch(url)
          .then(function(r) { _ruProgress(60); return r.text(); })
          .then(function(html) {
            _ruProgress(90);
            var blob = new Blob([html], { type: 'text/html' });
            iframe.src = URL.createObjectURL(blob);
            title.textContent = reportPath.split('/').pop();
            _ruHideLoading();
          })
          .catch(function(e) {
            console.warn('[RU] Report load error:', e);
            title.textContent = 'Failed to load report';
            _ruHideLoading();
          });
      }
    }

    function _closeRuReport() {
      var overlay = document.getElementById('ruReportOverlay');
      if (overlay) overlay.classList.remove('active');
      var iframe = document.getElementById('ruReportIframe');
      if (iframe) iframe.src = 'about:blank';
    }

    function _backToUsersList() {
      var searchEl = document.getElementById('ruSearch');
      searchEl.style.display = '';
      searchEl.value = '';
      var tabsEl = document.getElementById('ruTabs');
      if (tabsEl) tabsEl.style.display = '';
      var headerH3 = document.querySelector('.ru-header h3');
      if (headerH3) headerH3.innerHTML = '👥 Registered Users';
      _renderRuList(_ruData.filter(_ruTabFilter));
    }

    function _parseNum(score) {
      if (!score) return null;
      var s = String(score);
      if (s.indexOf('/') > -1) { var n = parseFloat(s.split('/')[0]); return isNaN(n) ? null : n; }
      var f = parseFloat(s); return isNaN(f) ? null : f;
    }

    // Expose every function referenced from inline onclick="..." attributes
    // to window so the browser can resolve them when the click fires. In
    // landing.html these were already globals because the script ran in
    // page-script scope; the IIFE made them local, which is why card
    // clicks did nothing in the admin host.
    window._verifyRuPasscode    = _verifyRuPasscode;
    window._closeRuPasscode     = _closeRuPasscode;
    window._filterRuList        = _filterRuList;
    window._viewUserResults     = _viewUserResults;
    window._backToUsersList     = _backToUsersList;
    window._toggleBlockUser     = _toggleBlockUser;
    window._saveUserRole        = _saveUserRole;
    window._toggleUserRoleActive= _toggleUserRoleActive;
    window._removeUserRole      = _removeUserRole;
    window._openRuReport        = _openRuReport;
    window._closeRuReport       = _closeRuReport;
    window.closeRegisteredUsersPanel = closeRegisteredUsersPanel;

    // Phase 6-E pilot: admin-host entry point. Called by /admin.html when
    // the user clicks the "Registered Users" sidebar item.
    window.AdminPanels = window.AdminPanels || {};
    window.AdminPanels.registeredUsers = {
      open: function (container) {
        _inlineContainer = container || null;
        return openRegisteredUsersPanel();
      }
    };
})();
