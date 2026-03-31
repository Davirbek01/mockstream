// ============================================================================
// SESSION RECOVERY — Auto-save & resume unfinished tests
// ============================================================================
// Include this script in every test page AFTER site-config.js.
// Each test page registers its state with SessionRecovery.init({...}).
//
// Flow:
//   1. Page loads → init({...}) → check() → if session found → prompt()
//   2. User chooses Resume (restore state) or Start Fresh (delete session)
//   3. start() → auto-saves every 30s + on visibility change + beforeunload
//   4. On test submit → clear()
//
// Supabase table: test_sessions (user_identifier, test_type, session_data JSONB)
// Sessions expire after 72 hours.
// ============================================================================

(function () {
  'use strict';

  var SUPABASE_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprbnl1a2tidGJjcWd2a2dqa3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMTc2NTgsImV4cCI6MjA1Mzg5MzY1OH0.VETrnOjJMGpPHSIFMRBSFkB-iCNTbMVFFkIhLKjJBSY';
  var SAVE_INTERVAL = 30000;   // 30 seconds
  var EXPIRY_HOURS  = 72;

  var SR = {
    _config: null,
    _saveTimer: null,
    _active: false,

    // ── Register test page ──────────────────────────────────────────────
    // config = {
    //   testType:   'cefr-listening',          // unique key for this test type
    //   getUserId:  function() { return name }, // candidate name
    //   getTestId:  function() { return '01' }, // mock number / test file
    //   getState:   function() { return {...} },// snapshot of current test state
    //   onRestore:  function(data) { ... }      // restore DOM from saved state
    // }
    init: function (config) {
      this._config = config;
    },

    // ── User identifier (name + device) ─────────────────────────────────
    _uid: function () {
      if (!this._config || !this._config.getUserId) return null;
      var name = (this._config.getUserId() || '').toLowerCase().trim();
      if (!name) return null;
      var did = localStorage.getItem('ms_device_id') || 'unknown';
      return name + '::' + did;
    },

    // ── Supabase fetch helper ───────────────────────────────────────────
    _fetch: function (path, opts) {
      opts = opts || {};
      var h = {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json'
      };
      if (opts.headers) {
        for (var k in opts.headers) h[k] = opts.headers[k];
      }
      opts.headers = h;
      return fetch(SUPABASE_URL + '/rest/v1/' + path, opts);
    },

    // ── Sync localStorage backup to Supabase ────────────────────────────
    _syncLocalBackup: async function () {
      if (!this._config) return;
      var key = 'sr_' + this._config.testType;
      try {
        var raw = localStorage.getItem(key);
        if (!raw) return;
        var payload = JSON.parse(raw);
        // Check if it's for the same user
        var uid = this._uid();
        if (!uid || payload.user_identifier !== uid) {
          localStorage.removeItem(key);
          return;
        }
        // Upsert to Supabase
        await this._fetch('test_sessions?on_conflict=user_identifier,test_type', {
          method: 'POST',
          headers: { 'Prefer': 'resolution=merge-duplicates' },
          body: JSON.stringify(payload)
        });
        localStorage.removeItem(key);
      } catch (e) { /* ignore */ }
    },

    // ── Check for existing session ──────────────────────────────────────
    // Returns session object or null
    check: async function () {
      if (!this._config) return null;
      var uid = this._uid();
      if (!uid) return null;

      // First sync any localStorage backup from a previous beforeunload
      await this._syncLocalBackup();

      try {
        var r = await this._fetch(
          'test_sessions?user_identifier=eq.' + encodeURIComponent(uid)
          + '&test_type=eq.' + encodeURIComponent(this._config.testType)
          + '&select=*&limit=1'
        );
        if (!r.ok) return null;
        var data = await r.json();
        if (data && data.length > 0) {
          // Check expiry
          if (new Date(data[0].expires_at) < new Date()) {
            this._deleteById(data[0].id);
            return null;
          }
          return data[0];
        }
      } catch (e) { /* ignore */ }
      return null;
    },

    // ── Show resume / start-fresh popup ─────────────────────────────────
    // Returns a Promise that resolves to 'resume' or 'fresh'
    prompt: function (session) {
      return new Promise(function (resolve) {
        var sd = session.session_data || {};
        var updated = new Date(session.updated_at);
        var ago = Math.round((Date.now() - updated.getTime()) / 60000);
        var agoText = ago < 60
          ? ago + ' minute' + (ago !== 1 ? 's' : '') + ' ago'
          : Math.round(ago / 60) + ' hour' + (Math.round(ago / 60) !== 1 ? 's' : '') + ' ago';

        // Build info lines
        var info = '';
        if (sd.timeRemaining != null) {
          var m = Math.floor(sd.timeRemaining / 60);
          var s = sd.timeRemaining % 60;
          info += '<div>⏱️ Timer: <strong>' + m + ':' + (s < 10 ? '0' : '') + s + ' remaining</strong></div>';
        }
        if (sd.elapsedSeconds != null) {
          var em = Math.floor(sd.elapsedSeconds / 60);
          var es = sd.elapsedSeconds % 60;
          info += '<div>⏱️ Elapsed: <strong>' + em + ':' + (es < 10 ? '0' : '') + es + '</strong></div>';
        }

        var answerCount = 0;
        if (sd.userAnswers) answerCount = Object.keys(sd.userAnswers).length;
        if (sd.answers && typeof sd.answers === 'object') {
          Object.keys(sd.answers).forEach(function (k) {
            var v = sd.answers[k];
            if (v && typeof v === 'object') answerCount += Object.keys(v).length;
          });
        }
        if (answerCount) info += '<div>✏️ Answers saved: <strong>' + answerCount + '</strong></div>';
        if (sd.currentPart != null) info += '<div>📄 Section: <strong>' + (sd.currentPart + 1) + '</strong></div>';
        if (sd.step != null) info += '<div>📄 Module: <strong>' + (sd.step + 1) + ' / 4</strong></div>';

        // Create overlay
        var ov = document.createElement('div');
        ov.id = 'srOverlay';
        ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.55);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';
        ov.innerHTML =
          '<div style="background:#fff;border-radius:18px;padding:32px 28px;max-width:400px;width:92%;text-align:center;box-shadow:0 24px 64px rgba(0,0,0,.25);animation:srFadeIn .25s ease">'
          + '<div style="font-size:52px;margin-bottom:10px;">📋</div>'
          + '<h2 style="margin:0 0 6px;color:#1e293b;font-size:20px;">Unfinished Test Found</h2>'
          + '<p style="color:#64748b;font-size:13px;margin:0 0 16px;">Saved <strong>' + agoText + '</strong></p>'
          + (info ? '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px 14px;margin-bottom:18px;text-align:left;font-size:13px;color:#475569;line-height:1.7;">' + info + '</div>' : '')
          + '<div style="display:flex;gap:10px;">'
          + '<button id="srBtnResume" style="flex:1;padding:13px 0;border:none;border-radius:12px;background:linear-gradient(135deg,#059669,#047857);color:#fff;font-weight:700;font-size:15px;cursor:pointer;transition:transform .1s;">📝 Resume</button>'
          + '<button id="srBtnFresh" style="flex:1;padding:13px 0;border:none;border-radius:12px;background:linear-gradient(135deg,#6b7280,#4b5563);color:#fff;font-weight:700;font-size:15px;cursor:pointer;transition:transform .1s;">🔄 Start Fresh</button>'
          + '</div>'
          + '</div>';

        // Inject animation keyframes
        if (!document.getElementById('srStyle')) {
          var sty = document.createElement('style');
          sty.id = 'srStyle';
          sty.textContent = '@keyframes srFadeIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}';
          document.head.appendChild(sty);
        }

        document.body.appendChild(ov);

        document.getElementById('srBtnResume').onclick = function () { ov.remove(); resolve('resume'); };
        document.getElementById('srBtnFresh').onclick = function () { ov.remove(); resolve('fresh'); };
      });
    },

    // ── Start auto-saving (call after test begins) ─────────────────────
    start: function () {
      if (this._active) return;
      this._active = true;
      var self = this;

      // Initial save
      this.save();

      // Periodic save
      this._saveTimer = setInterval(function () {
        if (self._active) self.save();
      }, SAVE_INTERVAL);

      // Save when tab becomes hidden (user switches tab / minimizes)
      document.addEventListener('visibilitychange', this._onVisChange = function () {
        if (document.hidden && self._active) self.save();
      });

      // Save on beforeunload (keepalive fetch + localStorage backup)
      window.addEventListener('beforeunload', this._onUnload = function () {
        if (self._active) self._saveSync();
      });
    },

    // ── Async save to Supabase ──────────────────────────────────────────
    save: async function () {
      if (!this._config || !this._active) return;
      var state = this._config.getState();
      if (!state) return;
      var uid = this._uid();
      if (!uid) return;

      var payload = {
        user_identifier: uid,
        test_type: this._config.testType,
        test_id: this._config.getTestId ? this._config.getTestId() : '',
        session_data: state,
        updated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + EXPIRY_HOURS * 3600000).toISOString()
      };

      try {
        await this._fetch('test_sessions?on_conflict=user_identifier,test_type', {
          method: 'POST',
          headers: { 'Prefer': 'resolution=merge-duplicates' },
          body: JSON.stringify(payload)
        });
      } catch (e) { /* ignore */ }
    },

    // ── Sync save for beforeunload ──────────────────────────────────────
    _saveSync: function () {
      if (!this._config) return;
      var state = this._config.getState();
      if (!state) return;
      var uid = this._uid();
      if (!uid) return;

      var payload = {
        user_identifier: uid,
        test_type: this._config.testType,
        test_id: this._config.getTestId ? this._config.getTestId() : '',
        session_data: state,
        updated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + EXPIRY_HOURS * 3600000).toISOString()
      };

      // Always write to localStorage (instant, synchronous)
      try {
        localStorage.setItem('sr_' + this._config.testType, JSON.stringify(payload));
      } catch (e) { /* ignore */ }

      // Also attempt a keepalive fetch (may succeed in modern browsers)
      try {
        fetch(SUPABASE_URL + '/rest/v1/test_sessions?on_conflict=user_identifier,test_type', {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(payload),
          keepalive: true
        });
      } catch (e) { /* ignore */ }
    },

    // ── Clear session on test completion ────────────────────────────────
    clear: async function () {
      this._active = false;
      if (this._saveTimer) { clearInterval(this._saveTimer); this._saveTimer = null; }

      // Remove listeners
      if (this._onVisChange) document.removeEventListener('visibilitychange', this._onVisChange);
      if (this._onUnload) window.removeEventListener('beforeunload', this._onUnload);

      if (!this._config) return;
      var uid = this._uid();
      var tt = this._config.testType;

      // Clear localStorage
      try { localStorage.removeItem('sr_' + tt); } catch (e) { /* ignore */ }

      // Delete from Supabase
      if (uid && tt) {
        try {
          await this._fetch(
            'test_sessions?user_identifier=eq.' + encodeURIComponent(uid)
            + '&test_type=eq.' + encodeURIComponent(tt),
            { method: 'DELETE' }
          );
        } catch (e) { /* ignore */ }
      }
    },

    // ── Delete session by id ────────────────────────────────────────────
    _deleteById: async function (id) {
      try {
        await this._fetch('test_sessions?id=eq.' + id, { method: 'DELETE' });
      } catch (e) { /* ignore */ }
    },

    // ── Generic answer restoration ──────────────────────────────────────
    // Tries common DOM patterns to restore answers.
    // qId → answer value
    restoreAnswers: function (answers) {
      if (!answers || typeof answers !== 'object') return;
      Object.keys(answers).forEach(function (qId) {
        var val = answers[qId];
        if (val === null || val === undefined || val === '') return;
        var valStr = String(val);

        // 1. MCQ / option items  [data-q][data-val]
        var found = false;
        document.querySelectorAll('[data-q="' + qId + '"]').forEach(function (el) {
          if (el.dataset.val === valStr) { el.click(); found = true; }
        });
        if (found) return;

        // 2. Text / gap inputs  [data-q]  or  input[name="qId"]
        var inp = document.querySelector('input[data-q="' + qId + '"], .gap-input[data-q="' + qId + '"]')
               || document.querySelector('input[name="' + qId + '"]');
        if (inp && (inp.type === 'text' || inp.type === '' || inp.classList.contains('gap-input'))) {
          inp.value = valStr;
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          return;
        }

        // 3. Radio buttons
        var radio = document.querySelector('input[type="radio"][name="' + qId + '"]');
        if (radio) {
          var match = document.querySelector('input[type="radio"][name="' + qId + '"][value="' + CSS.escape(valStr) + '"]');
          if (match) { match.checked = true; match.dispatchEvent(new Event('change', { bubbles: true })); }
          return;
        }

        // 4. Select dropdowns
        var sel = document.querySelector('select[data-q="' + qId + '"], select[name="' + qId + '"]');
        if (sel) {
          sel.value = valStr;
          sel.dispatchEvent(new Event('change', { bubbles: true }));
          return;
        }

        // 5. Textarea (writing tests)
        var ta = document.querySelector('textarea[data-q="' + qId + '"], textarea#' + qId);
        if (ta) {
          ta.value = valStr;
          ta.dispatchEvent(new Event('input', { bubbles: true }));
          return;
        }

        // 6. By element id
        var byId = document.getElementById(qId);
        if (byId && (byId.tagName === 'INPUT' || byId.tagName === 'TEXTAREA' || byId.tagName === 'SELECT')) {
          byId.value = valStr;
          byId.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    }
  };

  window.SessionRecovery = SR;
})();
