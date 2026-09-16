/* =========================================================================
 * speaking-draft.js — continue an unfinished speaking exam on another device
 * -------------------------------------------------------------------------
 * Loaded by Speaking Mocks.html (CEFR) and IELTS Speaking Mocks.html.
 *
 * The pages keep every recorded answer in IndexedDB under
 * speaking_audio_q<N>, and everything downstream (transcription, scoring,
 * the ZIP, the report) reads from there. This module adds a server copy:
 *
 *   onSaved(key, blob)  right after an answer is saved: upload it to the
 *                       account's draft and, for a premium student,
 *                       transcribe it at once (as the mobile app does), so
 *                       the finish step only has to score.
 *   restore(save, clear, mock)
 *                       when a resume is chosen and the answers are not on
 *                       this device: download them back into IndexedDB
 *                       (with their transcripts), so the page's own resume
 *                       logic finds them.
 *   cachedTranscript(q, blob)
 *                       used by _transcribeWithRetry: the early transcript of
 *                       exactly this recording, if there is one.
 *   clear(testType)     submit / discard / a different mock: delete it.
 *
 * Signed-out students get none of this; their answers stay on the device as
 * before. Every failure is silent — the exam never waits on the draft.
 * ========================================================================= */
(function () {
  'use strict';
  if (window.SpeakingDraft) return;

  var FN = 'https://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/speaking-draft';
  var ANON = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';

  function testType() {
    var p = '';
    try { p = decodeURIComponent(location.pathname).toLowerCase(); } catch (e) { p = location.pathname.toLowerCase(); }
    return p.indexOf('ielts') !== -1 ? 'ielts-speaking' : 'cefr-speaking';
  }

  function session() {
    try {
      var s = JSON.parse(localStorage.getItem('ms_auth_session') || 'null');
      return s && s.currentSession ? s.currentSession : s;
    } catch (e) { return null; }
  }
  function token() { var s = session(); return (s && s.access_token) ? String(s.access_token) : ''; }
  function signedIn() { var s = session(); return !!(s && s.user && s.user.email && s.access_token); }
  function account() { var s = session(); return (s && s.user && s.user.email) ? String(s.user.email).toLowerCase() : ''; }

  function practice() { return !!window._practiceMode; }

  function mockKey() {
    var n = String(window.SELECTED_MOCK_NUMBER || '').replace(/[^A-Za-z0-9_-]/g, '');
    if (!n) {
      try { var q = new URLSearchParams(location.search); n = String(q.get('num') || q.get('mock') || '').replace(/[^A-Za-z0-9_-]/g, ''); } catch (e) {}
    }
    return n ? (practice() ? n + '-p' + String(window._practicePartId || '').replace(/[^A-Za-z0-9]/g, '') : n) : '';
  }

  function qFromKey(key) { var m = /q(\d+)$/.exec(String(key || '')); return m ? Number(m[1]) : 0; }

  // IndexedDB keeps speaking_audio_q1..qN with no mock or account attached,
  // and a finished exam leaves its answers there. This marker says whose
  // answers they are, so a resume never mistakes another mock's (or another
  // account's) recordings for this one's. (2026-09-16: an iPhone resumed a
  // mock at Q4 because Q3 of an older mock was still in IndexedDB.)
  var OWNER_KEY = 'ms_spk_idb_owner';
  function owner() { return testType() + '|' + mockKey() + '|' + account(); }
  function markLocal() { try { localStorage.setItem(OWNER_KEY, owner()); } catch (e) {} }
  function localOwner() { try { return localStorage.getItem(OWNER_KEY); } catch (e) { return null; } }

  // Premium decides whether a transcript is useful at all (regular students
  // are never scored by AI, so transcribing for them would only cost money).
  // Mirrors the page's isPremiumEntry rule.
  function premium() {
    try {
      var ind = sessionStorage.getItem('speakingIndividualCode');
      var p;
      if (ind) p = ind === 'premium';
      else {
        var spe = sessionStorage.getItem('speakingPremiumEntry');
        p = spe === 'true' ? true : spe === 'false' ? false : sessionStorage.getItem('vipPremiumAi') === 'true';
      }
      var cc = window._centerConfig;
      var cfgKey = testType() === 'ielts-speaking' ? 'ielts_speaking' : 'cefr_speaking';
      if (p && !(window._isVipPremiumEmail && window._isVipPremiumEmail()) && cc && cc.mocks && cc.mocks[cfgKey] === 'regular') p = false;
      return !!p;
    } catch (e) { return false; }
  }

  function post(body, isForm) {
    var headers = { 'apikey': ANON, 'Authorization': 'Bearer ' + token() };
    if (!isForm) headers['Content-Type'] = 'application/json';
    return fetch(FN, { method: 'POST', headers: headers, body: isForm ? body : JSON.stringify(body) })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  function upload(q, kind, blob, attempt) {
    attempt = attempt || 1;
    var fd = new FormData();
    fd.append('action', 'put');
    fd.append('test_type', testType());
    fd.append('mock', mockKey());
    fd.append('q', String(q));
    fd.append('kind', kind);
    fd.append('file', blob, 'q' + q + (kind === 'text' ? '.txt' : '.webm'));
    return post(fd, true).then(function (r) {
      if (r && r.ok) return true;
      if (attempt >= 3) return false;
      return new Promise(function (res) { setTimeout(res, attempt * 3000); })
        .then(function () { return upload(q, kind, blob, attempt + 1); });
    });
  }

  // ---------------------------------------------------------------- transcripts
  var transcripts = {};   // q -> { size, promise }

  function cachedTranscript(q, blob) {
    var c = transcripts[q];
    if (!c || !blob || c.size !== blob.size) return null;
    return c.promise.then(function (t) {
      if (typeof t !== 'string' || !t || t === '[Error]') throw new Error('no early transcript');
      return t;
    });
  }

  function transcribeNow(q, blob) {
    if (typeof window._transcribeWithRetry !== 'function') return;
    if (transcripts[q] && transcripts[q].size === blob.size) return;
    // Called before the entry exists, so _transcribeWithRetry does not find
    // (and wait on) its own promise.
    var p = Promise.resolve().then(function () { return window._transcribeWithRetry(blob, undefined, q); });
    transcripts[q] = { size: blob.size, promise: p };
    p.then(function (text) {
      if (signedIn() && mockKey() && typeof text === 'string' && text && text !== '[Error]') {
        upload(q, 'text', new Blob([JSON.stringify({ size: blob.size, text: text })], { type: 'text/plain' }));
      }
    }, function () { if (transcripts[q] && transcripts[q].promise === p) delete transcripts[q]; });
  }

  // ---------------------------------------------------------------- hooks
  function onSaved(key, blob) {
    try {
      var q = qFromKey(key);
      if (!q || !blob || !blob.size) return;
      markLocal();
      if (premium()) transcribeNow(q, blob);
      // Practice parts are not resumable, so only the full exam is uploaded.
      if (signedIn() && mockKey() && !practice()) upload(q, 'audio', blob);
    } catch (e) {}
  }

  // Fill IndexedDB from the server draft. Resolves to the number of answers
  // restored (0 when there is nothing to restore or anything fails).
  function restore(saveToDB, clearDB, mockNumber) {
    if (!signedIn()) return Promise.resolve(0);
    var mock = mockNumber ? String(mockNumber).replace(/[^A-Za-z0-9_-]/g, '') : mockKey();
    if (practice()) mock = mockKey();
    if (!mock) return Promise.resolve(0);
    return post({ action: 'list', test_type: testType(), mock: mock }).then(function (r) {
      var files = (r && r.files) || [];
      var audio = files.filter(function (f) { return f.kind === 'audio' && f.url; });
      if (!audio.length) return 0;
      var texts = {};
      files.forEach(function (f) { if (f.kind === 'text' && f.url) texts[f.q] = f.url; });
      return Promise.resolve(clearDB ? clearDB() : null).then(function () {
        return Promise.all(audio.map(function (f) {
          return fetch(f.url).then(function (res) { return res.ok ? res.blob() : null; }).then(function (blob) {
            if (!blob || !blob.size) return 0;
            var typed = blob.type && blob.type.indexOf('audio') === 0 ? blob : new Blob([blob], { type: 'audio/webm' });
            return Promise.resolve(saveToDB('speaking_audio_q' + f.q, typed)).then(function () {
              if (!texts[f.q]) return 1;
              return fetch(texts[f.q]).then(function (res) { return res.ok ? res.text() : ''; }).then(function (raw) {
                try {
                  var t = JSON.parse(raw);
                  if (t && typeof t.text === 'string' && t.text && Number(t.size) === typed.size) {
                    transcripts[f.q] = { size: typed.size, promise: Promise.resolve(t.text) };
                  }
                } catch (e) {}
                return 1;
              }, function () { return 1; });
            });
          }).catch(function () { return 0; });
        }));
      }).then(function (counts) {
        var n = counts.reduce(function (a, b) { return a + b; }, 0);
        try { console.info('[speaking-draft] restored ' + n + ' answer(s) from the account draft'); } catch (e) {}
        return n;
      });
    }).catch(function () { return 0; });
  }

  function fetchTranscript(url, size, q) {
    return fetch(url).then(function (res) { return res.ok ? res.text() : ''; }).then(function (raw) {
      try {
        var t = JSON.parse(raw);
        if (t && typeof t.text === 'string' && t.text && Number(t.size) === size) {
          transcripts[q] = { size: size, promise: Promise.resolve(t.text) };
        }
      } catch (e) {}
    }, function () {});
  }

  // Make IndexedDB hold THIS exam's answers before the page resumes, and say
  // where to resume. api = { save, clear, has, total }.
  //   - answers belonging to another mock/account are dropped
  //   - answers the server has and this device lacks are downloaded (the
  //     server is the meeting point of every device the student used)
  //   - resume = the first question without a saved answer. A question left
  //     half-spoken was never saved (answers save when their time ends or
  //     Next is pressed), so it is asked again.
  function prepareResume(api) {
    var total = Math.max(1, Number(api.total) || 8);
    var mine = owner();
    var marker = localOwner();
    var foreign = marker !== null && marker !== mine;
    return Promise.resolve(foreign ? api.clear() : null).then(function () {
      if (!signedIn() || practice() || !mockKey()) return [];
      return post({ action: 'list', test_type: testType(), mock: mockKey() }).then(function (r) { return (r && r.files) || []; });
    }).then(function (files) {
      var audio = files.filter(function (f) { return f.kind === 'audio' && f.url; });
      var texts = {};
      files.forEach(function (f) { if (f.kind === 'text' && f.url) texts[f.q] = f.url; });
      // No marker at all (answers saved before markers existed): when the
      // server holds this exam, trust the server rather than unknown audio.
      var wipe = !foreign && marker === null && audio.length > 0;
      return Promise.resolve(wipe ? api.clear() : null).then(function () {
        var dropped = foreign || wipe;
        return audio.reduce(function (chain, f) {
          return chain.then(function () {
            return Promise.resolve(dropped ? false : api.has('speaking_audio_q' + f.q)).then(function (present) {
              if (present) return;
              return fetch(f.url).then(function (res) { return res.ok ? res.blob() : null; }).then(function (blob) {
                if (!blob || !blob.size) return;
                var typed = blob.type && blob.type.indexOf('audio') === 0 ? blob : new Blob([blob], { type: 'audio/webm' });
                return Promise.resolve(api.save('speaking_audio_q' + f.q, typed)).then(function () {
                  if (texts[f.q]) return fetchTranscript(texts[f.q], typed.size, f.q);
                });
              }).catch(function () {});
            });
          });
        }, Promise.resolve());
      });
    }).then(function () {
      markLocal();
      var n = 0;
      var step = function (k) {
        if (k > total) return Promise.resolve(n);
        return Promise.resolve(api.has('speaking_audio_q' + k)).then(function (ok) {
          if (!ok) return n;
          n++;
          return step(k + 1);
        });
      };
      return step(1);
    }).then(function (n) {
      // All answered but not submitted: ask the last one again rather than
      // resume past the end of the exam.
      var idx = Math.min(n, total - 1);
      try { console.info('[speaking-draft] resume at question ' + (idx + 1) + ' (' + n + ' answer(s) on this device)'); } catch (e) {}
      return idx;
    }).catch(function () { return -1; });
  }

  function clear(tt) {
    transcripts = {};
    if (!signedIn()) return Promise.resolve();
    return post({ action: 'clear', test_type: tt || testType() });
  }

  window.SpeakingDraft = {
    onSaved: onSaved,
    restore: restore,
    prepareResume: prepareResume,
    markLocal: markLocal,
    cachedTranscript: cachedTranscript,
    clear: clear,
    _state: function () { return { testType: testType(), mock: mockKey(), signedIn: signedIn(), premium: premium(), transcripts: Object.keys(transcripts) }; }
  };
})();
