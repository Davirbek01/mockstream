/* ====================================================================
   Speaking Plus realtime — engine module
   --------------------------------------------------------------------
   Wraps the Gemini Live API (gemini-3.1-flash-live-preview) plumbing
   so the UI layer just calls high-level methods:

     var session = new RealtimeSession({ vipToken, persona, ... });
     session.on('ready',      function () { ... });
     session.on('transcript', function (t) { ... });
     session.on('audio',      function () { ... });   // when AI starts speaking
     session.on('userSpoke',  function () { ... });   // when user voice detected
     session.on('error',      function (e) { ... });
     session.on('close',      function () { ... });
     await session.start();          // mints token + opens WS + sends setup
     await session.startMic();       // requests mic, starts streaming
     session.sendText('Hello');      // for system / scripted prompts
     session.sendSystem('Now move to Part 2.');
     await session.close();

   Audio I/O:
     - OUT: Google streams 24 kHz mono PCM (16-bit, little-endian).
            We decode + queue + play via Web Audio.
     - IN:  Browser mic at native rate → resample to 16 kHz mono PCM
            → 200 ms chunks → base64 → realtime_input.

   Persona / system_instruction is whatever the caller passes in.
   Phase 2 onward will use the full 4-part exam persona; Phase 1
   tests with a 1-sentence "friendly assistant" persona.
   ==================================================================== */

(function (global) {
  'use strict';

  var DEFAULTS = {
    // WebSocket proxy. Browser connects here; the Edge Function pipes
    // to Google with the real API key (server-side). Ephemeral tokens
    // via Google's auth_tokens endpoint don't authenticate the Live
    // WebSocket (returns "API key not valid"), so we proxy instead.
    proxyWsBase: 'wss://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/gemini-live-proxy',
    apiPath:     'v1beta',
    model:       'gemini-3.1-flash-live-preview',
    // Maya's own speech language. Uzbek is not on Google's documented Live
    // output list, so `start()` falls back to no language code if the server
    // refuses the session — see onclose. Override per page or with ?lang=.
    languageCode: 'uz-UZ',
    // Audio settings
    outputSampleRate: 24000,     // Live API speaks at 24 kHz
    inputSampleRate:  16000,     // Live API accepts 16 kHz from mic
    micChunkMs:       200        // how often to flush mic data to server
  };

  function RealtimeSession(opts) {
    if (!(this instanceof RealtimeSession)) return new RealtimeSession(opts);
    opts = opts || {};
    this.opts = Object.assign({}, DEFAULTS, opts);
    this.vipToken = opts.vipToken || '';
    this.persona = opts.persona || 'You are a helpful AI assistant.';

    this.ephemeralToken = null;
    this.ws = null;
    this.audioCtx = null;
    this.playbackTime = 0;
    this.micStream = null;
    this.micCtx = null;
    this.micProc = null;
    this.micRunning = false;
    this.closed = false;
    this._listeners = {};
    // Recording state (Phase 3)
    this._micRecorder = null;
    this._micChunks = [];
    this._micRecording = false;
    this._transcriptLog = [];
    this._startedAt = null;
    // AI-speaking gate — when true, skip sending mic chunks so the
    // speaker→mic echo of the AI's voice doesn't loop back into the
    // model. Set on first inlineData chunk, cleared shortly after the
    // model's last queued audio chunk has finished playing.
    this._aiSpeaking = false;
    this._aiSpeakingUntil = 0;
  }

  RealtimeSession.prototype.on = function (event, cb) {
    (this._listeners[event] = this._listeners[event] || []).push(cb);
    return this;
  };
  RealtimeSession.prototype._emit = function (event, payload) {
    var list = this._listeners[event] || [];
    for (var i = 0; i < list.length; i++) {
      try { list[i](payload); } catch (e) { console.error('listener error', e); }
    }
    // Auto-capture transcript events for Phase 3 export.
    if (event === 'transcript' && payload && payload.text) {
      this._transcriptLog.push({
        role: payload.role,
        text: payload.text,
        at_ms: this._startedAt ? (Date.now() - this._startedAt) : 0
      });
    }
  };
  /* ── Phase 3 capture: transcript + mic recording ─────────────── */
  RealtimeSession.prototype.getTranscript = function () {
    return this._transcriptLog.slice();
  };
  // Start MediaRecorder that captures BOTH the student's mic AND the AI's
  // playback. Mic + AI are routed into a single MediaStreamDestination via
  // the AudioContext, then MediaRecorder records that mixed stream as
  // a single Opus file. ~14MB for 10 min of conversation.
  RealtimeSession.prototype.startRecording = function () {
    if (this._micRecording) return;
    if (!this.micStream) throw new Error('mic not running; call startMic first');
    // Ensure we have an AudioContext (created lazily in _enqueueAudio).
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: this.opts.outputSampleRate });
      this.playbackTime = this.audioCtx.currentTime;
    }
    // Create the mix destination + route mic into it.
    this._recDest = this.audioCtx.createMediaStreamDestination();
    var micSrc = this.audioCtx.createMediaStreamSource(this.micStream);
    micSrc.connect(this._recDest);
    // AI side gets connected per-chunk inside _enqueueAudio.
    var mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '');
    var opts = mime ? { mimeType: mime, audioBitsPerSecond: 24000 } : {};
    this._micRecorder = new MediaRecorder(this._recDest.stream, opts);
    this._micChunks = [];
    var self = this;
    this._micRecorder.ondataavailable = function (e) {
      if (e.data && e.data.size > 0) self._micChunks.push(e.data);
    };
    this._micRecorder.start(1000);
    this._micRecording = true;
    this._emit('recordingOn');
  };
  RealtimeSession.prototype.stopRecording = function () {
    if (!this._micRecording) return Promise.resolve(null);
    var self = this;
    return new Promise(function (resolve) {
      self._micRecorder.onstop = function () {
        self._micRecording = false;
        self._emit('recordingOff');
        var blob = new Blob(self._micChunks, { type: self._micRecorder.mimeType || 'audio/webm' });
        resolve(blob);
      };
      try { self._micRecorder.stop(); } catch (_e) { resolve(null); }
    });
  };
  RealtimeSession.prototype.isRecording = function () { return this._micRecording; };

  /* ── start: open WebSocket to our proxy + send setup ─── */
  RealtimeSession.prototype.start = async function () {
    if (this.ws) throw new Error('session already started');
    if (!this.vipToken) throw new Error('vipToken required');
    this._startedAt = Date.now();

    // Open WebSocket directly to our Supabase proxy. The proxy verifies
    // the VIP token + premium gate, then opens an upstream WS to Google
    // with the real GEMINI_API_KEY. Returns 403 in the upgrade response
    // if the gate fails (browser sees code 1006 / close).
    var url = this.opts.proxyWsBase
      + '?token=' + encodeURIComponent(this.vipToken)
      + '&model=' + encodeURIComponent(this.opts.model)
      + '&api='   + encodeURIComponent(this.opts.apiPath);
    var self = this;
    return new Promise(function (resolve, reject) {
      try {
        self.ws = new WebSocket(url);
      } catch (e) {
        reject(e); return;
      }
      self.ws.binaryType = 'arraybuffer';

      var settled = false;
      self.ws.onopen = function () {
        // 3. send setup — required first message
        // Minimal setup. Voice locked to a specific pre-built so
        // auto-reconnects don't switch the AI's gender / tone mid-chat.
        // Available prebuilt voices on Live API: Puck, Charon, Kore,
        // Fenrir, Aoede. Puck = friendly young male (best fit for the
        // Uzbek-23yo persona).
        // Without a language_code the Live API answers in English and will
        // not be talked out of it — asking in the persona is not enough,
        // because the output language is pinned here, not in the prompt.
        // Maya speaks Uzbek to the student; the student practises English
        // back at her. Left out entirely (never sent as null) once the
        // fallback in onclose has cleared it.
        var speechCfg = {
          voice_config: {
            prebuilt_voice_config: { voice_name: self.opts.voiceName || 'Puck' }
          }
        };
        if (self.opts.languageCode) speechCfg.language_code = self.opts.languageCode;

        var setup = {
          setup: {
            model: 'models/' + self.opts.model,
            generation_config: {
              response_modalities: ['AUDIO'],
              speech_config: speechCfg
            },
            system_instruction: {
              parts: [{ text: self.persona }]
            }
          }
        };
        self.ws.send(JSON.stringify(setup));
      };

      self.ws.onmessage = function (evt) {
        // Decode binary → text up front (used by both setupComplete check
        // and _handleMessage below).
        var text;
        if (typeof evt.data === 'string') text = evt.data;
        else if (evt.data instanceof ArrayBuffer) text = new TextDecoder().decode(evt.data);
        else text = null;
        if (!settled && text) {
          try {
            var msg = JSON.parse(text);
            if (msg && msg.setupComplete) {
              settled = true;
              self._emit('ready');
              resolve();
              return; // skip the regular handler for the setup frame
            }
          } catch (_e) {}
        }
        self._handleMessage(evt);
      };
      self.ws.onerror = function (e) {
        self._emit('error', { stage: 'ws', message: e.message || 'ws error' });
        if (!settled) { settled = true; reject(new Error('ws error')); }
      };
      self.ws.onclose = function (e) {
        self.closed = true;
        // If the server rejected the session before it ever completed setup,
        // and we asked for a speech language, assume that language is the
        // reason and try once more without it. Uzbek voice output is not on
        // Google's documented Live list; if it turns out unsupported the
        // student still gets the English Maya that worked yesterday, rather
        // than a chat that will not open at all.
        if (!settled && self.opts.languageCode && !self._langRetried) {
          self._langRetried = true;
          self._emit('error', {
            stage: 'setup',
            message: 'speech language ' + self.opts.languageCode +
                     ' refused (' + (e.reason || e.code) + ') — retrying without it',
          });
          self.opts.languageCode = null;
          settled = true;
          self.closed = false;
          self.start().then(resolve, reject);
          return;
        }
        self._emit('close', { code: e.code, reason: e.reason });
      };
    });
  };

  /* ── _handleMessage: parse Live API replies ──────────────────── */
  RealtimeSession.prototype._handleMessage = function (evt) {
    // Google's Live WS sends JSON as binary frames. Decode either way.
    var text;
    if (typeof evt.data === 'string') {
      text = evt.data;
    } else if (evt.data instanceof ArrayBuffer) {
      text = new TextDecoder().decode(evt.data);
    } else if (evt.data && evt.data.arrayBuffer) {
      // Blob path (some browsers)
      var self = this;
      evt.data.arrayBuffer().then(function (buf) {
        self._handleMessage({ data: buf });
      });
      return;
    } else {
      return;
    }
    var msg;
    try { msg = JSON.parse(text); } catch { return; }

    // Server content — model speaking
    var sc = msg.serverContent;
    if (sc) {
      if (sc.modelTurn && sc.modelTurn.parts) {
        for (var i = 0; i < sc.modelTurn.parts.length; i++) {
          var p = sc.modelTurn.parts[i];
          if (p.inlineData && p.inlineData.data) {
            this._enqueueAudio(p.inlineData.data, p.inlineData.mimeType || 'audio/pcm');
          }
          if (p.text) {
            this._emit('transcript', { role: 'model', text: p.text, at: Date.now() });
          }
        }
      }
      // Server-side voice-activity-detection signal
      if (sc.inputTranscription && sc.inputTranscription.text) {
        this._emit('transcript', { role: 'user', text: sc.inputTranscription.text, at: Date.now() });
      }
      if (sc.outputTranscription && sc.outputTranscription.text) {
        this._emit('transcript', { role: 'model', text: sc.outputTranscription.text, at: Date.now() });
      }
      if (sc.interrupted) this._emit('interrupted');
      if (sc.turnComplete) this._emit('turnComplete');
    }
  };

  /* ── Audio OUT — decode PCM, queue, play with continuous scheduling ── */
  RealtimeSession.prototype._enqueueAudio = function (b64data) {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: this.opts.outputSampleRate
      });
      this.playbackTime = this.audioCtx.currentTime;
    }
    var pcm = this._b64toPCM16(b64data);
    var buf = this.audioCtx.createBuffer(1, pcm.length, this.opts.outputSampleRate);
    var ch = buf.getChannelData(0);
    for (var i = 0; i < pcm.length; i++) ch[i] = pcm[i] / 32768;
    var src = this.audioCtx.createBufferSource();
    src.buffer = buf;
    src.connect(this.audioCtx.destination);
    // ALSO tee the AI playback into the recording destination if
    // recording is active — captures the AI side of the conversation.
    if (this._recDest) {
      try { src.connect(this._recDest); } catch (_e) {}
    }
    var startAt = Math.max(this.audioCtx.currentTime, this.playbackTime);
    src.start(startAt);
    this.playbackTime = startAt + buf.duration;
    // Mark the AI as actively speaking. We extend the "until" by each
    // new chunk's duration + a small grace so the tail-end echo
    // doesn't sneak back into the mic.
    this._aiSpeaking = true;
    var endsAt = Date.now() + (this.playbackTime - this.audioCtx.currentTime) * 1000 + 400;
    if (endsAt > this._aiSpeakingUntil) this._aiSpeakingUntil = endsAt;
    this._emit('audio', { durationMs: buf.duration * 1000 });
  };
  RealtimeSession.prototype._b64toPCM16 = function (b64) {
    var raw = atob(b64);
    var pcm = new Int16Array(raw.length / 2);
    for (var i = 0; i < pcm.length; i++) {
      var lo = raw.charCodeAt(i * 2);
      var hi = raw.charCodeAt(i * 2 + 1);
      var v = lo | (hi << 8);
      if (v >= 0x8000) v -= 0x10000;
      pcm[i] = v;
    }
    return pcm;
  };

  /* ── Audio IN — mic capture + resample + stream ─────────────── */
  RealtimeSession.prototype.startMic = async function () {
    if (this.micRunning) return;
    if (!this.ws || this.ws.readyState !== 1) throw new Error('ws not open');

    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    this.micCtx = new (window.AudioContext || window.webkitAudioContext)();
    // Some browsers (esp. mobile Safari) start the context suspended.
    // Explicitly resume — user just clicked the mic button so it's
    // a valid user-gesture window.
    try { await this.micCtx.resume(); } catch (_e) {}
    var source = this.micCtx.createMediaStreamSource(this.micStream);
    var BUFFER = 4096;
    var proc = this.micCtx.createScriptProcessor(BUFFER, 1, 1);
    source.connect(proc);
    // Route processor to a MUTED gain so the node actually fires its
    // onaudioprocess callback (some browsers won't fire it if the node
    // is dangling). The gain is at 0 so we DON'T loop mic back to the
    // speakers — that was feedbacking the AI's voice back to Google
    // and causing the session to close mid-stream.
    var muteGain = this.micCtx.createGain();
    muteGain.gain.value = 0;
    proc.connect(muteGain);
    muteGain.connect(this.micCtx.destination);

    var self = this;
    var srcRate = this.micCtx.sampleRate;
    var dstRate = this.opts.inputSampleRate;
    var pendingFloat = [];
    var chunkSize = Math.floor(dstRate * (this.opts.micChunkMs / 1000));

    proc.onaudioprocess = function (e) {
      if (!self.micRunning) return;
      var input = e.inputBuffer.getChannelData(0);
      // simple linear resample
      var resampled = self._resample(input, srcRate, dstRate);
      // accumulate
      for (var i = 0; i < resampled.length; i++) pendingFloat.push(resampled[i]);
      while (pendingFloat.length >= chunkSize) {
        var slice = pendingFloat.splice(0, chunkSize);
        var pcm = new Int16Array(slice.length);
        for (var j = 0; j < slice.length; j++) {
          var s = Math.max(-1, Math.min(1, slice[j]));
          pcm[j] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        self._sendMicChunk(pcm);
      }
    };
    this.micProc = proc;
    this.micRunning = true;
    this._emit('micOn');
  };

  RealtimeSession.prototype._resample = function (data, srcRate, dstRate) {
    if (srcRate === dstRate) return data;
    var ratio = srcRate / dstRate;
    var outLen = Math.floor(data.length / ratio);
    var out = new Float32Array(outLen);
    for (var i = 0; i < outLen; i++) {
      var idx = i * ratio;
      var lo = Math.floor(idx);
      var hi = Math.min(lo + 1, data.length - 1);
      var frac = idx - lo;
      out[i] = data[lo] * (1 - frac) + data[hi] * frac;
    }
    return out;
  };

  RealtimeSession.prototype._sendMicChunk = function (pcm16) {
    if (!this.ws || this.ws.readyState !== 1) return;
    // Try BOTH paths — first the JSON-base64 form (what proto-JSON
    // docs describe), then the raw-binary form (what one community
    // sample claimed is required for the new Live API). We toggle
    // between them by mode flag; default is JSON.
    if (this.opts.audioWire === 'binary') {
      // Raw little-endian PCM16 bytes — no JSON wrapper.
      this.ws.send(pcm16.buffer);
    } else {
      var bytes = new Uint8Array(pcm16.buffer);
      var bin = '';
      for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      var b64 = btoa(bin);
      var msg = {
        realtimeInput: {
          audio: { mimeType: 'audio/pcm;rate=' + this.opts.inputSampleRate, data: b64 }
        }
      };
      this.ws.send(JSON.stringify(msg));
    }
    // Diagnostic: emit a 'micChunk' event so the test UI can show how
    // much audio is flowing. We expect ~5 chunks/sec at 200ms each.
    this._micChunkCount = (this._micChunkCount || 0) + 1;
    if (this._micChunkCount % 25 === 0) {
      this._emit('micProgress', { chunks: this._micChunkCount, bytesPerChunk: pcm16.length * 2 });
    }
  };

  RealtimeSession.prototype.stopMic = function () {
    this.micRunning = false;
    if (this.micProc) { try { this.micProc.disconnect(); } catch (_e) {} this.micProc = null; }
    if (this.micCtx)  { try { this.micCtx.close(); } catch (_e) {} this.micCtx = null; }
    if (this.micStream) {
      this.micStream.getTracks().forEach(function (t) { t.stop(); });
      this.micStream = null;
    }
    this._emit('micOff');
  };

  /* ── Send text + system messages ─────────────────────────────── */
  RealtimeSession.prototype.sendText = function (text) {
    if (!this.ws || this.ws.readyState !== 1) throw new Error('ws not open');
    this.ws.send(JSON.stringify({
      clientContent: {
        turns: [{ role: 'user', parts: [{ text: text }] }],
        turnComplete: true
      }
    }));
  };
  // Used by Phase 2+ exam state machine to nudge the model into the next
  // part. NB: there's no formal "system" role mid-session — we send it
  // as a user message but the persona system_instruction tells the model
  // to treat bracketed control text differently.
  RealtimeSession.prototype.sendSystem = function (text) {
    if (!this.ws || this.ws.readyState !== 1) throw new Error('ws not open');
    this.ws.send(JSON.stringify({
      clientContent: {
        turns: [{ role: 'user', parts: [{ text: '[SYSTEM]: ' + text }] }],
        turnComplete: true
      }
    }));
  };
  // Send a user turn with one or more inline images + optional text.
  // images: [{ mimeType: 'image/jpeg', data: '<base64>' }, ...]
  // Used by Phase 2 when entering Part 1.2 (picture description).
  RealtimeSession.prototype.sendContent = function (opts) {
    if (!this.ws || this.ws.readyState !== 1) throw new Error('ws not open');
    var parts = [];
    if (opts.text) parts.push({ text: opts.text });
    var images = opts.images || [];
    for (var i = 0; i < images.length; i++) {
      parts.push({ inlineData: { mimeType: images[i].mimeType || 'image/jpeg', data: images[i].data } });
    }
    this.ws.send(JSON.stringify({
      clientContent: {
        turns: [{ role: 'user', parts: parts }],
        turnComplete: opts.turnComplete !== false
      }
    }));
  };

  /* ── close ────────────────────────────────────────────────── */
  RealtimeSession.prototype.close = function () {
    this.stopMic();
    if (this.ws) { try { this.ws.close(); } catch (_e) {} this.ws = null; }
    if (this.audioCtx) { try { this.audioCtx.close(); } catch (_e) {} this.audioCtx = null; }
  };

  global.RealtimeSession = RealtimeSession;
})(window);
