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
  // Current legacy anon key (matches landing-v3 / index.html). The previous key
  // (iat 1738…) was rotated and now 401s, which had silently broken all Supabase
  // session save/restore — fixed here.
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprbnl1a2tidGJjcWd2a2dqa3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTUyODIsImV4cCI6MjA5MDI5MTI4Mn0.gGRtl2TVCn_PnY1aITFdX76yxZu3QZsbdrqI5hXioEw';
  var SAVE_INTERVAL = 30000;   // 30 seconds
  // A draft whose exam is still open (saved "live" within this window) is shown
  // as "in progress" with its start time, not as Continue - the student has
  // not left it yet (2026-09-16).
  var LIVE_WINDOW = 75000;
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

    // ── Signed-in account (email) ───────────────────────────────────────
    // Read straight from supabase-js's stored session: the exam pages do not
    // load auth.js. Expiry is irrelevant here — this names whose draft it is,
    // it grants nothing.
    _account: function () {
      try {
        var s = JSON.parse(localStorage.getItem('ms_auth_session') || 'null');
        if (s && s.currentSession) s = s.currentSession;
        var em = s && s.user && s.user.email;
        return em ? String(em).trim().toLowerCase() : '';
      } catch (e) { return ''; }
    },
    // Types whose recordings have a server draft (the full mocks' speaking too).
    _isSpeaking: function (tt) { return /speaking|full-mock/i.test(String(tt || '')); },

    // The dashboard's Resume adds ?resume=1: the student already chose to
    // continue, so the page must not ask again.
    resumeRequested: function () {
      try { return /[?&]resume=1(&|$)/.test(location.search); } catch (e) { return false; }
    },

    // Which mock this is. Reading/listening pages used a fixed name for every
    // mock ("cefr-reading-test-01"), so a draft of Mock 7 was offered - and
    // restored - on Mock 3 (found 2026-09-17). The Supabase id in the URL is
    // unique per mock.
    sbTestId: function (fallback) {
      try {
        var sb = new URLSearchParams(location.search).get('sbmock');
        if (sb) return 'sb' + String(sb).replace(/[^A-Za-z0-9_-]/g, '');
      } catch (e) { /* ignore */ }
      return fallback || '';
    },

    // Is this saved draft the exam open on this page (same mock, same part)?
    // Drafts saved before sbTestId carry the page's old fixed name; their saved
    // URL tells which mock and part they were.
    sameTest: function (session, fallbackId, part) {
      if (!session) return false;
      var sd = session.session_data || {};
      part = String(part || '');
      if (session.test_id === this.sbTestId(fallbackId)) return String(sd.practicePart || '') === part;
      var sb = '';
      try { sb = new URLSearchParams(location.search).get('sbmock') || ''; } catch (e) { /* ignore */ }
      if (!sb || session.test_id !== fallbackId || sd.practicePart != null) return false;
      var url = String(sd.__resumeUrl || '');
      var m = /[?&]sbmock=([^&]+)/.exec(url);
      var pm = /[?&](?:part|task|passage)=([^&]+)/.exec(url);
      return !!(m && decodeURIComponent(m[1]) === sb) && (pm ? decodeURIComponent(pm[1]) : '') === part;
    },

    // ── User identifier ─────────────────────────────────────────────────
    // Signed in: "acct:<email>" — the draft follows the account to any device
    // and is invisible to another account on this one. Speaking is the
    // exception for now (its recordings live only on the device that made
    // them), so it keeps the device key below. Signed out: "name::device".
    _uid: function () {
      if (!this._config || !this._config.getUserId) return null;
      var acct = this._account();
      // Speaking too, since 2026-09-16: its recordings now have a server copy
      // (speaking-draft.js), so a speaking draft can follow the account.
      if (acct) return 'acct:' + acct;
      return this._legacyUid();
    },
    _legacyUid: function () {
      if (!this._config || !this._config.getUserId) return null;
      var did = localStorage.getItem('ms_device_id');
      if (!did) {
        // Generate + persist a device id if none exists yet, so the guest
        // fallback below keys consistently across leave/return on this device.
        did = 'dev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
        try { localStorage.setItem('ms_device_id', did); } catch (e) { did = 'unknown'; }
      }
      var name = (this._config.getUserId() || '').toLowerCase().trim();
      // The candidate name isn't always captured before the exam starts — the
      // frictionless speaking deep-link skips name entry, so getUserId() is ''.
      // Previously this returned null and save()/_saveSync() bailed, so speaking
      // sessions were NEVER persisted and the dashboard "Continue" banner never
      // appeared for speaking (Reading/Listening/Writing capture a name, so they
      // saved fine). Fall back to a device-scoped guest id — the banner is
      // device-scoped anyway — so speaking saves + resumes like the other skills.
      if (!name) name = 'guest';
      return name + '::' + did;
    },

    // ── Supabase fetch helper ───────────────────────────────────────────
    // Shallow-copy the runner's state and stamp the exact URL that reopens this
    // mock, so the dashboard "Continue" banner can resume without guessing the
    // runner page / mock param. Backward-compatible: unknown key, ignored on restore.
    _enrich: function (state, live) {
      var sd = {};
      try { for (var k in state) { if (Object.prototype.hasOwnProperty.call(state, k)) sd[k] = state[k]; } }
      catch (e) { sd = state; }
      try { sd.__resumeUrl = location.pathname + location.search.replace(/([?&])resume=1(&|$)/, function (m, a, b) { return b ? a : ''; }); } catch (e) { /* ignore */ }
      try { var a = this._account(); if (a) sd.__account = a; } catch (e) { /* ignore */ }
      sd.__live = !!live;   // exam page open and in view when this was saved
      try { sd.__device = localStorage.getItem('ms_device_id') || ''; } catch (e) { /* ignore */ }
      if (!this._startedAt) this._startedAt = new Date().toISOString();
      sd.__startedAt = this._startedAt;
      return sd;
    },

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
    // Only removes the local copy if Supabase confirms a successful upsert.
    // If the table is locked down (401/403/4xx) or the network is offline,
    // the local copy stays so check() can still find it.
    // "sr_synced_<type>" records that the server has held this draft. If the
    // server is reachable, holds no row for the account, and the marker is
    // there, the draft was finished or discarded on another device - so the
    // local copy is stale and must not come back (2026-09-16). A draft that
    // never reached the server (taken offline) has no marker and is kept.
    _markSynced: function (tt) {
      try { localStorage.setItem('sr_synced_' + tt, '1'); } catch (e) { /* ignore */ }
    },
    _dropLocal: function (tt) {
      try { localStorage.removeItem('sr_' + tt); localStorage.removeItem('sr_synced_' + tt); } catch (e) { /* ignore */ }
    },
    _wasSynced: function (tt) {
      try { return localStorage.getItem('sr_synced_' + tt) === '1'; } catch (e) { return false; }
    },
    // Server reachable, no account row: the local copy is gone elsewhere if the
    // server ever held it, or if it is older than 2 minutes (a save that has
    // not landed yet is younger than that).
    _staleLocal: function (payload, tt) {
      if (this._wasSynced(tt)) return true;
      var t = new Date((payload && payload.updated_at) || 0).getTime();
      return !t || (Date.now() - t) > 120000;
    },

    _syncLocalBackup: async function () {
      if (!this._config) return;
      var key = 'sr_' + this._config.testType;
      try {
        var raw = localStorage.getItem(key);
        if (!raw) return;
        var payload = JSON.parse(raw);
        // Check if it's for the same user — wrong user → drop the leftover
        var uid = this._uid();
        if (!uid || payload.user_identifier !== uid) {
          localStorage.removeItem(key);
          return;
        }
        // Compare with the server first. Another device may have saved newer
        // progress since this copy was written - uploading it would overwrite
        // that (2026-09-17: words typed on an iPhone and on Windows vanished
        // when the exam was resumed on a Mac that still held its own older
        // copy). And a synced copy the server no longer has was finished or
        // discarded elsewhere.
        var tt = this._config.testType;
        var rc = await this._fetch(
          'test_sessions?user_identifier=eq.' + encodeURIComponent(payload.user_identifier)
          + '&test_type=eq.' + encodeURIComponent(tt) + '&select=updated_at&limit=1'
        );
        if (rc && rc.ok) {
          var rows = await rc.json();
          if (rows && rows.length) {
            if (new Date(rows[0].updated_at).getTime() >= new Date(payload.updated_at || 0).getTime()) {
              localStorage.removeItem(key);   // the server's copy is the newer one
              this._markSynced(tt);
              return;
            }
          } else if (String(payload.user_identifier || '').indexOf('acct:') === 0 && this._staleLocal(payload, tt)) {
            this._dropLocal(tt);
            return;
          }
        }
        // Try to upsert to Supabase; only clear local copy on success
        var r = await this._fetch('test_sessions?on_conflict=user_identifier,test_type', {
          method: 'POST',
          headers: { 'Prefer': 'resolution=merge-duplicates' },
          body: JSON.stringify(payload)
        });
        if (r && r.ok) {
          localStorage.removeItem(key);
          this._markSynced(this._config.testType);
        }
        // else: leave local copy in place as the source of truth
      } catch (e) { /* network failure — keep local copy */ }
    },

    // ── Read most-recent payload from localStorage for current user ─────
    _readLocal: function () {
      if (!this._config) return null;
      var key = 'sr_' + this._config.testType;
      try {
        var raw = localStorage.getItem(key);
        if (!raw) return null;
        var payload = JSON.parse(raw);
        var uid = this._uid();
        if (!uid || payload.user_identifier !== uid) return null;
        // Honour expiry
        if (payload.expires_at && new Date(payload.expires_at) < new Date()) {
          localStorage.removeItem(key);
          return null;
        }
        // Match Supabase row shape so callers don't need to branch
        return {
          id: 'local',
          user_identifier: payload.user_identifier,
          test_type: payload.test_type,
          test_id: payload.test_id,
          session_data: payload.session_data,
          updated_at: payload.updated_at,
          expires_at: payload.expires_at
        };
      } catch (e) { return null; }
    },

    // ── Write payload to localStorage (sync) ────────────────────────────
    _writeLocal: function (payload) {
      if (!this._config) return;
      try {
        localStorage.setItem('sr_' + this._config.testType, JSON.stringify(payload));
      } catch (e) { /* quota exceeded — ignore */ }
    },

    // ── Check for existing session ──────────────────────────────────────
    // Returns session object or null. Tries Supabase first; falls back
    // to localStorage if the table is locked down or the network is offline.
    // The draft found here keeps its original start time when resumed.
    check: async function () {
      var row = await this._checkRow();
      try { if (row && row.session_data && row.session_data.__startedAt) this._startedAt = row.session_data.__startedAt; } catch (e) { /* ignore */ }
      return row;
    },

    _checkRow: async function () {
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
        if (!r.ok) {
          // Supabase rejected (401 RLS, 403, 5xx) — fall back to local
          return this._readLocal();
        }
        var data = await r.json();
        if (data && data.length > 0) {
          // Check expiry
          if (new Date(data[0].expires_at) < new Date()) {
            this._deleteById(data[0].id);
            return this._readLocal();
          }
          return data[0];
        }
        // Nothing under the account key: a draft saved before drafts followed
        // the account sits under this device's old "name::device" key. Adopt
        // it — the next save writes it under the account.
        var legacy = this._legacyUid();
        if (legacy && legacy !== uid) {
          try {
            var r2 = await this._fetch(
              'test_sessions?user_identifier=eq.' + encodeURIComponent(legacy)
              + '&test_type=eq.' + encodeURIComponent(this._config.testType)
              + '&select=*&limit=1'
            );
            if (r2.ok) {
              var d2 = await r2.json();
              if (d2 && d2.length > 0 && new Date(d2[0].expires_at) >= new Date()) {
                var sd2 = d2[0].session_data || {};
                if (!sd2.__account || sd2.__account === this._account()) return d2[0];
              }
            }
          } catch (e) { /* fall through */ }
        }
        // Supabase returned no rows — fall back to local in case a save
        // succeeded only locally (e.g. after the table was locked down)
        return this._readLocal();
      } catch (e) {
        return this._readLocal();
      }
    },

    // ── Show resume / start-fresh popup ─────────────────────────────────
    // Returns a Promise that resolves to 'resume' or 'fresh'
    // No "Unfinished Test Found" question any more (2026-09-17). A draft is
    // continued only through the home page's Resume (?resume=1, which the pages
    // check before ever calling this); opening a mock any other way starts it
    // afresh and drops that draft. Every page still calls prompt(); it now
    // answers 'fresh' at once. The old dialog is kept below as _promptDialog
    // in case a page ever needs to ask again.
    prompt: function () {
      return Promise.resolve('fresh');
    },

    _promptDialog: function (session) {
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
      this.save(true);

      // Periodic save — "live" while the page is in view
      this._saveTimer = setInterval(function () {
        if (self._active) self.save(!document.hidden);
      }, SAVE_INTERVAL);

      // Save soon after the student types or answers (1.5 s after the last
      // change, and at least every 10 s while they keep going), so what is
      // on screen is what another device resumes - not a copy up to 30 s old.
      var inputTimer = null;
      document.addEventListener('input', this._onInput = function () {
        if (!self._active) return;
        if (inputTimer) clearTimeout(inputTimer);
        if (Date.now() - (self._lastSaveAt || 0) > 10000) { self.save(!document.hidden); return; }
        inputTimer = setTimeout(function () { inputTimer = null; if (self._active) self.save(!document.hidden); }, 1500);
      }, true);
      document.addEventListener('change', this._onInput, true);

      // Tab hidden (switched away / phone locked): no longer live, so the
      // student can continue elsewhere; back in view: live again.
      document.addEventListener('visibilitychange', this._onVisChange = function () {
        if (self._active) self.save(!document.hidden);
      });

      // Save on beforeunload / pagehide (iOS Safari fires only pagehide)
      window.addEventListener('beforeunload', this._onUnload = function () {
        if (self._active) self._saveSync();
      });
      window.addEventListener('pagehide', this._onUnload);
    },

    // ── Async save to Supabase + localStorage fallback ─────────────────
    // Always writes to localStorage first (synchronous, can't fail other
    // than on quota), then tries Supabase. If Supabase 401/403/5xx or the
    // network is offline, the local copy is still there for check() to find.
    save: async function (live) {
      if (!this._config || !this._active) return;
      var state = this._config.getState();
      if (!state) return;
      var uid = this._uid();
      if (!uid) return;

      var payload = {
        user_identifier: uid,
        test_type: this._config.testType,
        test_id: this._config.getTestId ? this._config.getTestId() : '',
        session_data: this._enrich(state, live),
        updated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + EXPIRY_HOURS * 3600000).toISOString()
      };

      // Always persist to localStorage first — survives backend outages
      this._writeLocal(payload);
      this._lastSaveAt = Date.now();

      try {
        var body = JSON.stringify(payload);
        var r = await this._fetch('test_sessions?on_conflict=user_identifier,test_type', {
          method: 'POST',
          headers: { 'Prefer': 'resolution=merge-duplicates' },
          body: body,
          // Leaving the page (hidden): let the request outlive it, as iOS
          // suspends the tab right away. keepalive bodies are capped at 64 KB.
          keepalive: !live && body.length < 60000
        });
        // If Supabase took it, the local copy can be cleared on next sync.
        // We leave it in place for now — _syncLocalBackup() handles cleanup.
        if (r && r.ok) this._markSynced(this._config.testType);
      } catch (e) { /* offline — local copy is the source of truth */ }
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
        session_data: this._enrich(state),
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
      this._startedAt = null;
      if (this._saveTimer) { clearInterval(this._saveTimer); this._saveTimer = null; }

      // Remove listeners
      if (this._onVisChange) document.removeEventListener('visibilitychange', this._onVisChange);
      if (this._onInput) { document.removeEventListener('input', this._onInput, true); document.removeEventListener('change', this._onInput, true); }
      if (this._onUnload) { window.removeEventListener('beforeunload', this._onUnload); window.removeEventListener('pagehide', this._onUnload); }

      if (!this._config) return;
      var uid = this._uid();
      var tt = this._config.testType;

      // Clear localStorage
      this._dropLocal(tt);
      // A speaking draft's recordings live on the server as well.
      try { if (this._isSpeaking(tt) && window.SpeakingDraft) window.SpeakingDraft.clear(tt); } catch (e) { /* ignore */ }

      // Delete from Supabase — the account row and the old device row alike
      var ids = [uid, this._legacyUid()].filter(function (x, i, arr) { return x && arr.indexOf(x) === i; });
      for (var i = 0; i < ids.length; i++) {
        if (!tt) break;
        try {
          await this._fetch(
            'test_sessions?user_identifier=eq.' + encodeURIComponent(ids[i])
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

    // ── Dashboard support: list this DEVICE's active (unexpired) sessions ──
    // Keyed by ms_device_id (the tail of user_identifier "name::device"), so it
    // works regardless of which candidate-name key a runner saved under, and is
    // device-scoped for privacy. Returns [] when no device id / none active.
    // Signed in: the account's drafts (any device) plus this device's
    // speaking drafts, minus anything stamped with a different account.
    // Signed out: this device's drafts, minus anything stamped with an account.
    listActiveOnDevice: async function () {
      var now = Date.now();
      var byType = {};
      var acct = this._account();
      function mine(row) {
        var sd = (row && row.session_data) || {};
        var uidv = String(row && row.user_identifier || '');
        if (acct) {
          if (uidv === 'acct:' + acct) return true;
          if (uidv.indexOf('acct:') === 0) return false;        // another account
          return !sd.__account || sd.__account === acct;        // device row
        }
        if (uidv.indexOf('acct:') === 0) return false;
        return !sd.__account;
      }
      function take(p) {
        if (!p || !p.test_type || !p.expires_at || new Date(p.expires_at).getTime() <= now) return;
        if (!mine(p)) return;
        // Exam still open on some device: listed, but marked as ongoing.
        p.__ongoing = !!(p.session_data && p.session_data.__live && (now - new Date(p.updated_at || 0).getTime()) < LIVE_WINDOW);
        var ex = byType[p.test_type];
        if (!ex || new Date(p.updated_at || 0).getTime() > new Date(ex.updated_at || 0).getTime()) byType[p.test_type] = p;
      }
      // 1) localStorage sr_* — written synchronously on EVERY save (before the
      //    Supabase POST, so it survives an offline/blocked backend). Device-local,
      //    so this is the reliable primary source for the dashboard banner.
      var locals = [];
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (!k || k.indexOf('sr_') !== 0 || k.indexOf('sr_synced_') === 0) continue;
          try { locals.push(JSON.parse(localStorage.getItem(k))); } catch (e) { /* skip malformed entry */ }
        }
      } catch (e) { /* ignore */ }
      // 2) Supabase (same device) — adds sessions not in localStorage and keeps
      //    the fresher copy where both exist.
      var did = '';
      try { did = localStorage.getItem('ms_device_id') || ''; } catch (e) { /* ignore */ }
      var queries = [];
      if (did) queries.push('test_sessions?user_identifier=like.*' + encodeURIComponent('::' + did) + '&select=*&order=updated_at.desc');
      if (acct) queries.push('test_sessions?user_identifier=eq.' + encodeURIComponent('acct:' + acct) + '&select=*&order=updated_at.desc');
      var acctRows = null;   // the account's server rows, when that query worked
      var serverRows = [];
      for (var qi = 0; qi < queries.length; qi++) {
        try {
          var r = await this._fetch(queries[qi]);
          if (r && r.ok) {
            var rows = (await r.json()) || [];
            serverRows = serverRows.concat(rows);
            if (acct && queries[qi].indexOf('user_identifier=eq.') !== -1) acctRows = rows;
          }
        } catch (e) { /* ignore — localStorage already covers it */ }
      }
      var self = this;
      locals.forEach(function (p) {
        if (acctRows && p && p.test_type && String(p.user_identifier || '') === 'acct:' + acct
            && self._staleLocal(p, p.test_type)
            && !acctRows.some(function (x) { return x.test_type === p.test_type; })) {
          self._dropLocal(p.test_type);   // finished or discarded on another device
          return;
        }
        take(p);
      });
      serverRows.forEach(take);
      var arr = Object.keys(byType).map(function (kk) { return byType[kk]; });
      arr.sort(function (a, b) { return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime(); });
      return arr;
    },

    // Discard one session everywhere — localStorage + Supabase (by id if known,
    // else by user_identifier+test_type). Accepts a session ROW.
    discard: function (row) {
      if (!row) return Promise.resolve();
      if (row.test_type) this._dropLocal(row.test_type);
      try { if (this._isSpeaking(row.test_type)) this._clearSpeakingServer(row.test_type); } catch (e) { /* ignore */ }
      if (row.id) return this._deleteById(row.id);
      if (row.user_identifier && row.test_type) {
        return this._fetch(
          'test_sessions?user_identifier=eq.' + encodeURIComponent(row.user_identifier)
          + '&test_type=eq.' + encodeURIComponent(row.test_type),
          { method: 'DELETE' }
        ).catch(function () {});
      }
      return Promise.resolve();
    },

    // The landing page's Discard does not load speaking-draft.js, so it asks
    // the function directly.
    _clearSpeakingServer: function (tt) {
      try {
        var s = JSON.parse(localStorage.getItem('ms_auth_session') || 'null');
        if (s && s.currentSession) s = s.currentSession;
        if (!s || !s.access_token) return;
        fetch(SUPABASE_URL + '/functions/v1/speaking-draft', {
          method: 'POST',
          headers: { 'apikey': 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2', 'Authorization': 'Bearer ' + s.access_token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'clear', test_type: tt })
        }).catch(function () {});
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

  // Leave warnings say where the saved test can be continued: a signed-in
  // student's draft follows the account, a guest's stays on this device.
  // The exam pages mark that phrase with data-ms-leave-where; some build the
  // warning only when it is first shown, so watch the body for it too.
  function fillLeaveWhere(root) {
    try {
      var els = (root || document).querySelectorAll ? (root || document).querySelectorAll('[data-ms-leave-where]') : [];
      if (!els.length) return;
      var txt = SR._account() ? 'shu yoki boshqa qurilmada' : 'shu qurilmada';
      for (var i = 0; i < els.length; i++) els[i].textContent = txt;
    } catch (e) { /* ignore */ }
  }
  function watchLeaveWarnings() {
    fillLeaveWhere(document);
    try {
      new MutationObserver(function (list) {
        for (var i = 0; i < list.length; i++) {
          var added = list[i].addedNodes;
          for (var j = 0; j < added.length; j++) if (added[j].nodeType === 1) fillLeaveWhere(added[j]);
        }
      }).observe(document.body, { childList: true });
    } catch (e) { /* ignore */ }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchLeaveWarnings);
  else watchLeaveWarnings();
})();
