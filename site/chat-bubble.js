// ============================================================================
// CHAT BUBBLE — Mock Stream global notification & mini-chat system
// ============================================================================
// Include on ANY page: <script src="chat-bubble.js"></script>
// Works standalone — no dependencies except site-config.js (optional).
// Features: floating bubble, unread badge, toast notifications, inline reply,
//           file/image/PDF attachment, voice message recording.
// ============================================================================
(function () {
  'use strict';

  // Skip in mockFrame (exam pages — landing.html's bubble already shows above the mockFrame)
  // Skip in deeply nested iframes (exam pages inside mockFrame inside appFrame)
  // landing.html: window.parent === window.top (both are index.html)
  // exam pages:   window.parent !== window.top (parent=landing, top=index)
  try {
    if (window.frameElement && window.frameElement.id === 'mockFrame') return;
    // Fallback: if we're in any iframe AND the parent already has a FAB, skip
    if (window.frameElement && window.parent.document.getElementById('cb-fab')) return;
    if (window.self !== window.top && window.parent !== window.top) return;
  } catch (e) { /* cross-origin — allow */ }

  // ─── CONFIG ───────────────────────────────────────────────────────────────
  var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
  var POLL_INTERVAL = 20000; // 20s
  var BUCKET = 'chat-attachments';
  var MAX_IMAGE_MB = 50;
  var MAX_PDF_MB = 100;
  var MAX_AI_INLINE_MB = 8;
  var HC_TEXT_ENABLED = true;
  var HC_VOICE_ENABLED = true;
  var HC_IMAGE_ENABLED = true;
  var HC_PDF_ENABLED = true;
  var MAX_VOICE_SEC = 120;

  // Load admin-configured settings from localStorage (cached) or Supabase
  function loadHcSettings() {
    // Fast path: localStorage cache
    var tx = localStorage.getItem('ms_hc_text_enabled');
    var v = localStorage.getItem('ms_hc_voice_enabled');
    var i = localStorage.getItem('ms_hc_image_enabled');
    var p = localStorage.getItem('ms_hc_pdf_enabled');
    if (tx !== null) HC_TEXT_ENABLED = tx !== 'false';
    if (v !== null) HC_VOICE_ENABLED = v !== 'false';
    if (i !== null) HC_IMAGE_ENABLED = i !== 'false';
    if (p !== null) HC_PDF_ENABLED = p !== 'false';
    var im = localStorage.getItem('ms_hc_max_image_mb');
    var pm = localStorage.getItem('ms_hc_max_pdf_mb');
    var am = localStorage.getItem('ms_hc_max_ai_inline_mb');
    var vs = localStorage.getItem('ms_hc_max_voice_sec');
    if (im) MAX_IMAGE_MB = parseInt(im) || 50;
    if (pm) MAX_PDF_MB = parseInt(pm) || 100;
    if (am) MAX_AI_INLINE_MB = parseInt(am) || 8;
    if (vs) MAX_VOICE_SEC = parseInt(vs) || 120;

    // Background refresh from Supabase
    try {
      fetch(SB_URL + '/rest/v1/site_settings?key=in.(hc_text_enabled,hc_voice_enabled,hc_image_enabled,hc_pdf_enabled,hc_max_image_mb,hc_max_pdf_mb,hc_max_ai_inline_mb,hc_max_voice_sec)&select=key,value', {
        headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
      }).then(function (r) { return r.json(); }).then(function (rows) {
        if (!rows || !rows.length) return;
        var map = {};
        rows.forEach(function (r) { map[r.key] = r.value; });
        if ('hc_max_voice_sec' in map) { MAX_VOICE_SEC = parseInt(map.hc_max_voice_sec) || 120; localStorage.setItem('ms_hc_max_voice_sec', map.hc_max_voice_sec); }
        if ('hc_text_enabled' in map) { HC_TEXT_ENABLED = map.hc_text_enabled !== 'false'; localStorage.setItem('ms_hc_text_enabled', map.hc_text_enabled); }
        if ('hc_voice_enabled' in map) { HC_VOICE_ENABLED = map.hc_voice_enabled !== 'false'; localStorage.setItem('ms_hc_voice_enabled', map.hc_voice_enabled); }
        if ('hc_image_enabled' in map) { HC_IMAGE_ENABLED = map.hc_image_enabled !== 'false'; localStorage.setItem('ms_hc_image_enabled', map.hc_image_enabled); }
        if ('hc_pdf_enabled' in map) { HC_PDF_ENABLED = map.hc_pdf_enabled !== 'false'; localStorage.setItem('ms_hc_pdf_enabled', map.hc_pdf_enabled); }
        if ('hc_max_image_mb' in map) { MAX_IMAGE_MB = parseInt(map.hc_max_image_mb) || 50; localStorage.setItem('ms_hc_max_image_mb', map.hc_max_image_mb); }
        if ('hc_max_pdf_mb' in map) { MAX_PDF_MB = parseInt(map.hc_max_pdf_mb) || 100; localStorage.setItem('ms_hc_max_pdf_mb', map.hc_max_pdf_mb); }
        if ('hc_max_ai_inline_mb' in map) { MAX_AI_INLINE_MB = parseInt(map.hc_max_ai_inline_mb) || 8; localStorage.setItem('ms_hc_max_ai_inline_mb', map.hc_max_ai_inline_mb); }
        applyHcSettingsVisibility();
      }).catch(function () {});
    } catch (e) {}
  }

  // Show/hide voice & attach buttons based on current settings
  function applyHcSettingsVisibility() {
    // Bubble chat buttons
    var bubbleAttach = document.querySelector('#cb-overlay .cb-attach-btn');
    var bubbleVoice = document.getElementById('cb-voice-btn');
    if (bubbleAttach) bubbleAttach.style.display = (HC_IMAGE_ENABLED || HC_PDF_ENABLED) ? '' : 'none';
    if (bubbleVoice) bubbleVoice.style.display = HC_VOICE_ENABLED ? '' : 'none';
    // Hide text input + send when text disabled
    var bubbleInput = document.getElementById('cb-input');
    var bubbleSend = document.querySelector('#cb-overlay .cb-send-btn');
    if (bubbleInput) bubbleInput.style.display = HC_TEXT_ENABLED ? '' : 'none';
    if (bubbleSend) bubbleSend.style.display = HC_TEXT_ENABLED ? '' : 'none';
    // Landing Help Center buttons
    var landingBar = document.querySelector('#helpCenterOverlay .helpcenter-input-bar');
    if (landingBar) {
      var lAttach = landingBar.querySelector('.cb-hc-action-btn[title="Attach file"]');
      var lVoice = landingBar.querySelector('#hc-voice-btn');
      var lInput = document.getElementById('helpCenterInput');
      var lSend = document.getElementById('helpCenterSendBtn');
      if (lAttach) lAttach.style.display = (HC_IMAGE_ENABLED || HC_PDF_ENABLED) ? '' : 'none';
      if (lVoice) lVoice.style.display = HC_VOICE_ENABLED ? '' : 'none';
      if (lInput) lInput.style.display = HC_TEXT_ENABLED ? '' : 'none';
      if (lSend) lSend.style.display = HC_TEXT_ENABLED ? '' : 'none';
    }
  }

  // ─── IDENTITY ─────────────────────────────────────────────────────────────
  function getDeviceId() {
    var id = localStorage.getItem('ms_device_id');
    if (!id) {
      id = 'dev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('ms_device_id', id);
    }
    return id;
  }

  function getUserName() {
    return sessionStorage.getItem('CANDIDATE_FULL_NAME') ||
           localStorage.getItem('ms_candidate_name') ||
           localStorage.getItem('ms_vip_email') || '';
  }

  function getSenderName() {
    return getUserName() || 'Anonymous';
  }

  function getCenter() {
    return (window.SITE_CONFIG && window.SITE_CONFIG.testIdentifier) || 'mock_stream';
  }

  function getConvId(category) {
    return getDeviceId() + '_' + (category || 'support');
  }

  // ─── STATE ────────────────────────────────────────────────────────────────
  var currentCategory = 'support';
  var messages = { support: [], premium: [], partner: [] };
  var lastSeenAdmin = { support: 0, premium: 0, partner: 0 };
  var isOpen = false;
  var isSending = false;
  var pollTimer = null;
  var _geminiKey = null;

  // ─── LOCAL PERSISTENCE ────────────────────────────────────────────────────
  function loadLocal() {
    try {
      var d = JSON.parse(localStorage.getItem('ms_chat_bubble') || '{}');
      if (d.messages) messages = d.messages;
      if (d.lastSeenAdmin) lastSeenAdmin = d.lastSeenAdmin;
    } catch (e) {}
  }

  function saveLocal() {
    try {
      // Keep max 50 per category
      var trimmed = {};
      ['support', 'premium', 'partner'].forEach(function (c) {
        trimmed[c] = (messages[c] || []).slice(-50);
      });
      localStorage.setItem('ms_chat_bubble', JSON.stringify({ messages: trimmed, lastSeenAdmin: lastSeenAdmin }));
      // Also write to landing page Help Center format for bi-directional sync
      var hcFormat = {};
      ['support', 'premium', 'partner'].forEach(function (c) {
        hcFormat[c] = { convId: getConvId(c), messages: trimmed[c] };
      });
      localStorage.setItem('ms_helpcenter_chats', JSON.stringify(hcFormat));
    } catch (e) {}
  }

  // ─── SUPABASE HELPERS ─────────────────────────────────────────────────────
  function sbFetch(path, opts) {
    opts = opts || {};
    opts.headers = Object.assign({
      'apikey': SB_KEY,
      'Authorization': 'Bearer ' + SB_KEY,
      'Content-Type': 'application/json'
    }, opts.headers || {});
    return fetch(SB_URL + path, opts);
  }

  async function saveMsg(msg) {
    var body = {
      conversation_id: getConvId(msg.category || currentCategory),
      role: msg.role,
      sender_name: getSenderName(),
      content: msg.text || '',
      category: msg.category || currentCategory,
      center: getCenter(),
      device_id: getDeviceId()
    };
    if (msg.attachment_url) {
      body.attachment_url = msg.attachment_url;
      body.attachment_type = msg.attachment_type || null;
      body.attachment_name = msg.attachment_name || null;
    }
    try {
      await sbFetch('/rest/v1/support_messages', {
        method: 'POST',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify(body)
      });
    } catch (e) { console.warn('[ChatBubble] Save error:', e); }
  }

  // ─── UPLOAD FILE/VOICE TO STORAGE ─────────────────────────────────────────
  async function uploadToStorage(file, prefix) {
    var ext = file.name ? file.name.split('.').pop() : 'webm';
    var path = (prefix || 'file') + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6) + '.' + ext;
    try {
      var resp = await fetch(SB_URL + '/storage/v1/object/' + BUCKET + '/' + path, {
        method: 'POST',
        headers: {
          'apikey': SB_KEY,
          'Authorization': 'Bearer ' + SB_KEY,
          'Content-Type': file.type || 'application/octet-stream',
          'x-upsert': 'true'
        },
        body: file
      });
      if (!resp.ok) throw new Error('Upload failed: ' + resp.status);
      return SB_URL + '/storage/v1/object/public/' + BUCKET + '/' + path;
    } catch (e) {
      console.error('[ChatBubble] Upload error:', e);
      return null;
    }
  }

  function formatFileSize(bytes) {
    if (!bytes || bytes < 1024) return (bytes || 0) + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function validateAttachmentFile(file) {
    if (!file) return { ok: false, message: 'No file selected.' };

    var mime = (file.type || '').toLowerCase();
    var isImage = mime.indexOf('image/') === 0;
    var isPdf = mime === 'application/pdf' || /\.pdf$/i.test(file.name || '');
    if (!isImage && !isPdf) {
      return { ok: false, message: 'Only images and PDF files are allowed.' };
    }

    if (isImage && !HC_IMAGE_ENABLED) {
      return { ok: false, message: 'Image attachments are currently disabled by the admin.' };
    }
    if (isPdf && !HC_PDF_ENABLED) {
      return { ok: false, message: 'PDF attachments are currently disabled by the admin.' };
    }

    var maxMb = isImage ? MAX_IMAGE_MB : MAX_PDF_MB;
    var maxBytes = maxMb * 1024 * 1024;
    if (file.size > maxBytes) {
      return {
        ok: false,
        message: (isImage ? 'Image' : 'PDF') + ' is too large (' + formatFileSize(file.size) + '). Max allowed is ' + maxMb + 'MB.'
      };
    }

    return { ok: true, type: isImage ? 'image' : 'pdf' };
  }

  function estimateAttachmentTokenRange(file, type) {
    var sizeMb = file && file.size ? (file.size / (1024 * 1024)) : 0;
    if (sizeMb > MAX_AI_INLINE_MB) {
      return {
        inline: false,
        tokenRange: '0 direct AI tokens',
        note: 'File is above ' + MAX_AI_INLINE_MB + 'MB, so AI will not read the full file content directly.'
      };
    }

    if (type === 'image') {
      if (sizeMb <= 1) return { inline: true, tokenRange: '~800-3,000', note: 'Image complexity can change token usage.' };
      if (sizeMb <= 4) return { inline: true, tokenRange: '~3,000-9,000', note: 'Image complexity can change token usage.' };
      return { inline: true, tokenRange: '~9,000-20,000', note: 'Large/complex images can use more tokens.' };
    }

    // PDF token cost varies heavily by page count and density.
    if (sizeMb <= 1) return { inline: true, tokenRange: '~2,000-8,000', note: 'Depends on pages, text density, and embedded images.' };
    if (sizeMb <= 4) return { inline: true, tokenRange: '~8,000-30,000', note: 'Depends on pages, text density, and embedded images.' };
    return { inline: true, tokenRange: '~30,000-70,000', note: 'Dense or long PDFs can exceed this range.' };
  }

  function confirmAttachmentAiUsage(file, type) {
    var est = estimateAttachmentTokenRange(file, type);
    var kind = type === 'pdf' ? 'PDF' : 'Image';
    var title = kind + ' attachment';
    var lines = [];
    if (!est.inline) {
      lines.push('File: ' + (file.name || 'attachment'));
      lines.push('Size: ' + formatFileSize(file.size));
      lines.push('Estimated AI usage: ' + est.tokenRange);
      lines.push(est.note);
      lines.push('This file will still upload, but AI will use metadata-only mode.');
      return showAttachmentConfirmDialog(title, lines, 'Continue Upload', false);
    } else {
      lines.push('File: ' + (file.name || 'attachment'));
      lines.push('Size: ' + formatFileSize(file.size));
      lines.push('Estimated AI input tokens: ' + est.tokenRange);
      lines.push(est.note);
      return showAttachmentConfirmDialog(title, lines, 'Continue and Send to AI', true);
    }
  }

  function showAttachmentConfirmDialog(title, lines, continueLabel, sendToAi) {
    return new Promise(function (resolve) {
      var existing = document.getElementById('cb-attach-confirm');
      if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

      var root = document.createElement('div');
      root.id = 'cb-attach-confirm';
      root.className = 'cb-attach-confirm-backdrop';

      var panel = document.createElement('div');
      panel.className = 'cb-attach-confirm-panel';

      var h = document.createElement('h4');
      h.className = 'cb-attach-confirm-title';
      h.textContent = title;
      panel.appendChild(h);

      var meta = document.createElement('div');
      meta.className = 'cb-attach-confirm-text';
      for (var i = 0; i < lines.length; i++) {
        var p = document.createElement('p');
        p.textContent = lines[i];
        meta.appendChild(p);
      }
      panel.appendChild(meta);

      var badge = document.createElement('div');
      badge.className = 'cb-attach-confirm-badge ' + (sendToAi ? 'ai-on' : 'ai-off');
      badge.textContent = sendToAi ? 'AI will analyze this attachment' : 'AI analysis is limited for this file';
      panel.appendChild(badge);

      var actions = document.createElement('div');
      actions.className = 'cb-attach-confirm-actions';

      var cancelBtn = document.createElement('button');
      cancelBtn.className = 'cb-attach-btn cb-cancel';
      cancelBtn.textContent = 'Cancel';

      var okBtn = document.createElement('button');
      okBtn.className = 'cb-attach-btn cb-continue';
      okBtn.textContent = continueLabel || 'Continue';

      actions.appendChild(cancelBtn);
      actions.appendChild(okBtn);
      panel.appendChild(actions);
      root.appendChild(panel);
      document.body.appendChild(root);

      var done = false;
      function finish(val) {
        if (done) return;
        done = true;
        if (root && root.parentNode) root.parentNode.removeChild(root);
        document.removeEventListener('keydown', onKeydown);
        resolve(!!val);
      }
      function onKeydown(e) {
        if (e.key === 'Escape') finish(false);
      }

      cancelBtn.addEventListener('click', function () { finish(false); });
      okBtn.addEventListener('click', function () { finish(true); });
      root.addEventListener('click', function (e) { if (e.target === root) finish(false); });
      document.addEventListener('keydown', onKeydown);
      });
      }

  async function buildGeminiAttachmentPayload(file, type) {
    if (!file || !type || (type !== 'image' && type !== 'pdf')) return null;
    var maxInlineBytes = MAX_AI_INLINE_MB * 1024 * 1024;
    if (file.size > maxInlineBytes) {
      return {
        mode: 'metadata-only',
        note: 'This ' + type + ' is too large for direct AI analysis. Please ask the user for a short summary or a smaller file if detailed analysis is required.',
        name: file.name || (type === 'pdf' ? 'document.pdf' : 'image')
      };
    }

    var mimeType = (file.type || '').toLowerCase();
    if (type === 'image' && mimeType.indexOf('image/') !== 0) mimeType = 'image/jpeg';
    if (type === 'pdf' && mimeType !== 'application/pdf') mimeType = 'application/pdf';
    var b64 = await blobToBase64(file);
    return {
      mode: 'inline',
      mimeType: mimeType,
      data: b64,
      name: file.name || (type === 'pdf' ? 'document.pdf' : 'image')
    };
  }

  // ─── GEMINI AI ────────────────────────────────────────────────────────────
  // audioBlob (optional): raw audio Blob to send to Gemini as inline_data
  // attachmentPayload (optional): image/pdf payload for multimodal analysis
  var _promptFilesCache = null; // { key, items: [ { url, b64, mime } ], ts }
  var _PROMPT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async function loadPromptFilesData() {
    // Always try Supabase first (source of truth), fall back to localStorage
    var files = [];
    try {
      var r = await sbFetch('/rest/v1/site_settings?key=in.(ai_prompt_files,ai_prompt_file_url,ai_prompt_file_mime,ai_prompt_pdf_url)&select=key,value');
      var d = await r.json();
      var map = {};
      (d || []).forEach(function (row) { map[row.key] = row.value; });
      if (map.ai_prompt_files) {
        try { files = JSON.parse(map.ai_prompt_files); } catch(e) { files = []; }
      } else if (map.ai_prompt_file_url) {
        files = [{ url: map.ai_prompt_file_url, mime: map.ai_prompt_file_mime || 'application/pdf' }];
      } else if (map.ai_prompt_pdf_url) {
        files = [{ url: map.ai_prompt_pdf_url, mime: 'application/pdf' }];
      }
      if (files.length > 0) {
        localStorage.setItem('ms_ai_prompt_files', JSON.stringify(files));
      } else {
        localStorage.removeItem('ms_ai_prompt_files');
      }
    } catch (e) {
      // Supabase failed — fall back to localStorage
      var filesJson = localStorage.getItem('ms_ai_prompt_files') || '';
      if (filesJson) { try { files = JSON.parse(filesJson); } catch(e2) { files = []; } }
    }
    if (!files || files.length === 0) return [];
    var cacheKey = JSON.stringify(files.map(function(f){ return f.url; }));
    if (_promptFilesCache && _promptFilesCache.key === cacheKey && (Date.now() - _promptFilesCache.ts < _PROMPT_CACHE_TTL)) return _promptFilesCache.items;
    var items = [];
    for (var i = 0; i < files.length; i++) {
      try {
        var resp = await fetch(files[i].url);
        if (!resp.ok) continue;
        var blob = await resp.blob();
        if (blob.size > 20 * 1024 * 1024) continue;
        var b64 = await blobToBase64(blob);
        var mime = files[i].mime || blob.type || 'application/octet-stream';
        items.push({ url: files[i].url, b64: b64, mime: mime });
      } catch (e) {}
    }
    _promptFilesCache = { key: cacheKey, items: items, ts: Date.now() };
    return items;
  }

  async function getAIReply(userText, audioBlob, attachmentPayload) {
    if (!_geminiKey) {
      try {
        var r = await fetch('https://davirbek.alwaysdata.net/key?model=gemini');
        var d = await r.json();
        _geminiKey = d.key;
      } catch (e) {}
    }
    if (!_geminiKey) return 'Our AI assistant is being set up. Your message has been saved and our team will respond shortly!';

    // Get system prompt — always check Supabase (source of truth), fall back to localStorage
    var systemPrompt = '';
    try {
      var pr = await sbFetch('/rest/v1/site_settings?key=eq.ai_system_prompt&select=value');
      var pd = await pr.json();
      if (pd && pd[0] && pd[0].value) { systemPrompt = pd[0].value; localStorage.setItem('ms_ai_prompt', systemPrompt); }
    } catch (e) {}
    if (!systemPrompt) systemPrompt = localStorage.getItem('ms_ai_prompt') || '';
    if (!systemPrompt) systemPrompt = 'You are Mock Stream AI, a friendly and professional assistant for Mock Stream — an online Mock platform for CEFR and IELTS exams. You help users with questions about the platform, premium access, partnerships, technical issues, and exam preparation tips. Users can send you voice messages, images, and PDF files — you can listen to audio and analyze attachments. Always respond in the same language the user writes or speaks in. Be concise, helpful, and encouraging. If you don\'t know something specific about the platform, suggest the user contact the admin team for detailed help.';

    // Capability block — always injected so Gemini knows about multimodal features
    var capabilityNote = '\n\n[Capabilities] Users in this chat can send: text messages, voice recordings (you will receive the audio inline), image attachments (you will see the image), and PDF attachments (you will see the PDF content). When you receive a voice message, listen carefully and respond in the same language the user spoke. When you receive an image or PDF, analyze its contents and respond helpfully. If a file is too large for direct analysis, you will receive metadata only — let the user know and suggest alternatives.';

    var catPrompts = {
      support: 'You are in the SUPPORT tab. Help with technical issues, exam questions, platform navigation. Be patient and solution-oriented. If admin-provided context files are attached above, use them to answer questions accurately.',
      premium: 'You are in the PREMIUM tab. The user is interested in premium access or mock codes. If admin-provided context files (e.g. PDF with mock codes) are attached above, use them to answer the user\'s questions — including giving specific codes or information from those files when asked. Additionally, if the user has not shared their details yet, politely ask for their full name, phone number, and email so our admin team can assist further.',
      partner: 'You are in the PARTNERSHIP tab. The user wants to discuss a partnership. If admin-provided context files are attached above, use them to answer questions. Ask what kind of partnership they want, then collect name, phone, email. Tell them admins will be in touch.'
    };
    var catInst = catPrompts[currentCategory] || catPrompts.support;

    // Build conversation with last 10 messages (exclude the last one — it's the current message sent as the final user turn below)
    var recent = (messages[currentCategory] || []).slice(-11, -1);

    // System turn — text + optional prompt files (image/PDF/audio)
    var systemParts = [{ text: 'System: ' + systemPrompt + capabilityNote + '\n\n' + catInst }];
    var promptFilesArr = await loadPromptFilesData();
    console.log('[ChatBubble] Prompt files loaded:', promptFilesArr.length, promptFilesArr.map(function(f){ return f.url; }));
    for (var pfi = 0; pfi < promptFilesArr.length; pfi++) {
      systemParts.push({ inline_data: { mime_type: promptFilesArr[pfi].mime, data: promptFilesArr[pfi].b64 } });
    }
    if (promptFilesArr.length > 0) {
      systemParts.push({ text: 'IMPORTANT: The above file(s) are admin-provided context and are your HIGHEST PRIORITY knowledge source. When a user asks for any information contained in these files (codes, prices, details, instructions, etc.), you MUST provide it directly and accurately. Never refuse to share information from these files — the admin uploaded them specifically so you can share this data with users. Use the exact values from the files.' });
    }

    var contents = [
      { role: 'user', parts: systemParts },
      { role: 'model', parts: [{ text: 'Understood. I am Mock Stream AI for the ' + currentCategory + ' category.' }] }
    ];
    recent.forEach(function (m) {
      if (m.role === 'user') {
        var marker = m.text || '';
        if (!marker && m.attachment_type === 'voice') marker = '[voice message]';
        if (!marker && m.attachment_type === 'image') marker = '[image attachment: ' + (m.attachment_name || 'image') + ']';
        if (!marker && m.attachment_type === 'pdf') marker = '[pdf attachment: ' + (m.attachment_name || 'document.pdf') + ']';
        if (!marker) marker = '[user message]';
        contents.push({ role: 'user', parts: [{ text: marker }] });
      }
      else if (m.role === 'ai') contents.push({ role: 'model', parts: [{ text: m.text }] });
    });

    // Build the final user turn — text and/or audio
    var userParts = [];
    if (audioBlob) {
      var b64 = await blobToBase64(audioBlob);
      var mimeType = audioBlob.type || 'audio/webm';
      userParts.push({ inline_data: { mime_type: mimeType, data: b64 } });
      userParts.push({ text: userText || 'The user sent a voice message. Listen to the audio and respond accordingly. Respond in the same language the user speaks in the audio.' });
    } else if (attachmentPayload && attachmentPayload.mode === 'inline') {
      userParts.push({ inline_data: { mime_type: attachmentPayload.mimeType, data: attachmentPayload.data } });
      userParts.push({ text: userText || ('The user sent an attachment (' + attachmentPayload.name + '). Analyze it and respond helpfully in the user\'s language.') });
    } else if (attachmentPayload && attachmentPayload.mode === 'metadata-only') {
      userParts.push({ text: (userText ? userText + '\n\n' : '') + 'User attached: ' + attachmentPayload.name + '. ' + attachmentPayload.note });
    } else {
      userParts.push({ text: userText });
    }
    contents.push({ role: 'user', parts: userParts });

    try {
      var gr = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + _geminiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: contents })
      });
      var gd = await gr.json();
      if (gd.candidates && gd.candidates[0] && gd.candidates[0].content) return gd.candidates[0].content.parts[0].text;
      return 'I received your message. Our team will follow up if needed!';
    } catch (e) { throw e; }
  }

  function blobToBase64(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onloadend = function () {
        // Strip the data:...;base64, prefix
        var result = reader.result;
        resolve(result.substring(result.indexOf(',') + 1));
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // ─── POLL FOR ADMIN REPLIES ───────────────────────────────────────────────
  async function pollAdminReplies() {
    var gotNew = false;
    var cats = ['support', 'premium', 'partner'];
    for (var i = 0; i < cats.length; i++) {
      var cat = cats[i];
      var convId = getConvId(cat);
      try {
        var resp = await sbFetch('/rest/v1/support_messages?conversation_id=eq.' + encodeURIComponent(convId) + '&role=eq.admin&order=created_at.desc&limit=20&select=content,created_at,attachment_url,attachment_type,attachment_name');
        var data = await resp.json();
        if (!data || !data.length) continue;

        var existingCount = (messages[cat] || []).filter(function (m) { return m.role === 'admin'; }).length;
        if (data.length > existingCount) {
          var newMsgs = data.slice(0, data.length - existingCount).reverse();
          newMsgs.forEach(function (am) {
            var msg = {
              role: 'admin',
              text: am.content,
              time: new Date(am.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              ts: new Date(am.created_at).getTime()
            };
            if (am.attachment_url) {
              msg.attachment_url = am.attachment_url;
              msg.attachment_type = am.attachment_type;
              msg.attachment_name = am.attachment_name;
            }
            messages[cat].push(msg);
          });
          gotNew = true;
        }
      } catch (e) {}
    }
    if (gotNew) {
      saveLocal();
      updateBadge();
      if (isOpen) renderMessages();
      else showToast();
    }
  }

  // ─── UNREAD BADGE ─────────────────────────────────────────────────────────
  function getUnreadCount() {
    var count = 0;
    ['support', 'premium', 'partner'].forEach(function (c) {
      var adminMsgs = (messages[c] || []).filter(function (m) { return m.role === 'admin'; });
      if (adminMsgs.length > (lastSeenAdmin[c] || 0)) count += adminMsgs.length - (lastSeenAdmin[c] || 0);
    });
    return count;
  }

  function updateBadge() {
    var badge = document.getElementById('cb-badge');
    var count = getUnreadCount();
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  function markSeen() {
    ['support', 'premium', 'partner'].forEach(function (c) {
      lastSeenAdmin[c] = (messages[c] || []).filter(function (m) { return m.role === 'admin'; }).length;
    });
    saveLocal();
    updateBadge();
  }

  // ─── TOAST NOTIFICATION ───────────────────────────────────────────────────
  function showToast() {
    // Find the latest admin message
    var latest = null;
    ['support', 'premium', 'partner'].forEach(function (c) {
      var admins = (messages[c] || []).filter(function (m) { return m.role === 'admin'; });
      if (admins.length) {
        var last = admins[admins.length - 1];
        if (!latest || (last.ts || 0) > (latest.ts || 0)) latest = last;
      }
    });
    if (!latest) return;

    var existing = document.getElementById('cb-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.id = 'cb-toast';
    toast.innerHTML =
      '<div class="cb-toast-inner">' +
      '<div class="cb-toast-icon">🛡️</div>' +
      '<div class="cb-toast-body">' +
      '<div class="cb-toast-title">Admin Reply</div>' +
      '<div class="cb-toast-text">' + escapeHtml(latest.text || '').substring(0, 120) + (latest.attachment_url ? ' 📎' : '') + '</div>' +
      '</div>' +
      '<button class="cb-toast-close" onclick="this.parentNode.parentNode.remove()">✕</button>' +
      '</div>';
    toast.addEventListener('click', function (e) {
      if (e.target.classList.contains('cb-toast-close')) return;
      toast.remove();
      openBubble();
    });
    document.body.appendChild(toast);

    // Position toast near the FAB
    var fab = document.getElementById('cb-fab');
    if (fab) {
      var rect = fab.getBoundingClientRect();
      toast.style.left = rect.left + 'px';
      toast.style.bottom = 'auto';
      toast.style.top = Math.max(8, rect.top - 64) + 'px';
    }

    // Auto-dismiss after 8s
    setTimeout(function () { if (toast.parentNode) toast.classList.add('cb-toast-hide'); }, 8000);
    setTimeout(function () { if (toast.parentNode) toast.remove(); }, 8500);
  }

  // ─── RENDER MESSAGES ──────────────────────────────────────────────────────
  function renderMessages() {
    var list = document.getElementById('cb-messages');
    if (!list) return;
    var msgs = messages[currentCategory] || [];

    // Category-specific welcome messages
    var welcomes = {
      support: '👋 Hi! I\'m <strong>Mock Stream AI</strong>. How can I help you? Describe your issue and I\'ll do my best to assist.',
      premium: '👑 Welcome! Interested in <strong>Premium access</strong>? Tell me a bit about yourself and I\'ll connect you with our team.',
      partner: '🤝 Hello! Looking to <strong>partner with us</strong>? Tell me about your organization and we\'ll get in touch.'
    };
    var welcomeHtml = welcomes[currentCategory] || welcomes.support;
    var html = '<div class="cb-msg cb-msg-ai"><div class="cb-msg-text">' + welcomeHtml + '</div></div>';

    msgs.forEach(function (m) {
      var cls = m.role === 'user' ? 'cb-msg-user' : (m.role === 'admin' ? 'cb-msg-admin' : 'cb-msg-ai');
      var label = m.role === 'user' ? '' : (m.role === 'admin' ? '<div class="cb-msg-label">🛡️ Admin</div>' : '');

      html += '<div class="cb-msg ' + cls + '">';
      html += label;

      // Loading spinner for pending uploads
      if (m._loading) {
        html += '<div class="cb-attach-loading"><div class="cb-attach-spinner"></div><div class="cb-attach-loading-text">' + escapeHtml(m._loading) + '</div></div>';
      } else if (m.attachment_url) {
        if (m.attachment_type === 'voice') {
          html += buildVoiceMsgHtml(m.attachment_url);
        } else if (m.attachment_type === 'image') {
          html += '<img src="' + escapeHtml(m.attachment_url) + '" class="cb-attachment-img" onclick="window.open(this.src)" alt="Image" onload="this.parentElement.parentElement.scrollIntoView({block:\'end\'})">';
        } else if (m.attachment_type === 'pdf') {
          html += '<a href="' + escapeHtml(m.attachment_url) + '" target="_blank" class="cb-attachment-file">📄 ' + escapeHtml(m.attachment_name || 'Document.pdf') + '</a>';
        }
      }

      if (m.text) html += '<div class="cb-msg-text">' + formatMsgText(m.text) + '</div>';
      if (m.time) html += '<div class="cb-msg-time">' + m.time + '</div>';
      html += '</div>';
    });
    list.innerHTML = html;
    list.scrollTop = list.scrollHeight;
    initVoicePlayers(list);
  }

  function formatMsgText(text) {
    // Convert markdown bold and newlines
    return escapeHtml(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  }

  function escapeHtml(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // ─── TELEGRAM-STYLE VOICE MESSAGE ─────────────────────────────────────────
  var _vmIdCounter = 0;
  function buildVoiceMsgHtml(url) {
    var id = 'cbvm-' + (++_vmIdCounter);
    // Generate random waveform bars (visual only — will update on play)
    var bars = '';
    for (var i = 0; i < 28; i++) {
      var h = Math.floor(Math.random() * 16) + 6;
      bars += '<div class="cb-bar" style="height:' + h + 'px"></div>';
    }
    return '<div class="cb-voice-msg" data-vm-id="' + id + '" data-src="' + escapeHtml(url) + '">' +
      '<button class="cb-voice-play" data-vm="' + id + '"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>' +
      '<div class="cb-voice-body"><div class="cb-voice-wave" data-vm="' + id + '">' + bars + '</div>' +
      '<div class="cb-voice-dur" data-vm="' + id + '">0:00</div></div></div>';
  }

  var _vmAudios = {};
  function initVoicePlayers(container) {
    var btns = container.querySelectorAll('.cb-voice-play');
    btns.forEach(function (btn) {
      var vmId = btn.getAttribute('data-vm');
      if (_vmAudios[vmId]) return; // already bound
      btn.addEventListener('click', function () { toggleVmPlay(vmId, container); });
    });
  }

  function toggleVmPlay(vmId, container) {
    var wrapper = container.querySelector('[data-vm-id="' + vmId + '"]');
    if (!wrapper) return;
    var src = wrapper.getAttribute('data-src');
    var btn = wrapper.querySelector('.cb-voice-play');
    var wave = wrapper.querySelector('.cb-voice-wave');
    var durEl = wrapper.querySelector('.cb-voice-dur');

    // Pause any other playing voice messages
    Object.keys(_vmAudios).forEach(function (k) {
      if (k !== vmId && _vmAudios[k] && !_vmAudios[k].paused) {
        _vmAudios[k].pause();
        var otherBtn = container.querySelector('.cb-voice-play[data-vm="' + k + '"]');
        if (otherBtn) otherBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
      }
    });

    if (!_vmAudios[vmId]) {
      var audio = new Audio(src);
      audio.preload = 'metadata';
      _vmAudios[vmId] = audio;

      audio.addEventListener('loadedmetadata', function () {
        if (audio.duration && isFinite(audio.duration)) {
          durEl.textContent = formatVmDur(audio.duration);
        }
      });
      audio.addEventListener('timeupdate', function () {
        if (!audio.duration) return;
        var pct = audio.currentTime / audio.duration;
        durEl.textContent = formatVmDur(audio.currentTime);
        updateWaveBars(wave, pct);
      });
      audio.addEventListener('ended', function () {
        btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
        durEl.textContent = formatVmDur(audio.duration);
        updateWaveBars(wave, 0);
      });
      audio.addEventListener('pause', function () {
        if (!audio.ended) btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
      });
    }

    var audio = _vmAudios[vmId];
    if (audio.paused) {
      audio.play();
      btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
    } else {
      audio.pause();
      btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    }
  }

  function formatVmDur(s) {
    if (!s || !isFinite(s)) return '0:00';
    var m = Math.floor(s / 60);
    var sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function updateWaveBars(wave, pct) {
    var bars = wave.querySelectorAll('.cb-bar');
    var playedCount = Math.floor(pct * bars.length);
    for (var i = 0; i < bars.length; i++) {
      if (i < playedCount) bars[i].classList.add('played');
      else bars[i].classList.remove('played');
    }
  }

  // ─── SEND MESSAGE ─────────────────────────────────────────────────────────
  async function sendMessage() {
    if (isSending) return;
    var input = document.getElementById('cb-input');
    var text = (input.value || '').trim();
    if (!text) return;
    if (!HC_TEXT_ENABLED) { alert('Text messages are currently disabled by the admin.'); return; }
    isSending = true;
    input.disabled = true;

    var timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Auto-detect category and switch if needed
    var detectedCat = _detectCategory(text);
    if (detectedCat && detectedCat !== currentCategory) {
      var catLabels = { premium: '👑 Premium', partner: '🤝 Partnership', support: '💬 Support' };
      switchCategory(detectedCat);
      var noteMsg = { role: 'ai', text: '📂 Switched to ' + catLabels[detectedCat] + ' tab based on your message.', time: timeStr };
      messages[detectedCat].push(noteMsg);
      renderMessages();
    }

    var userMsg = { role: 'user', text: text, category: currentCategory, time: timeStr };
    messages[currentCategory].push(userMsg);
    renderMessages();
    saveLocal();
    input.value = '';

    // Save to Supabase
    saveMsg(userMsg);

    // Show typing indicator
    var typingEl = document.createElement('div');
    typingEl.className = 'cb-typing';
    typingEl.innerHTML = '<span></span><span></span><span></span>';
    var list = document.getElementById('cb-messages');
    if (list) { list.appendChild(typingEl); list.scrollTop = list.scrollHeight; }

    // Get AI reply
    try {
      var aiText = await getAIReply(text);
      if (typingEl.parentNode) typingEl.remove();
      var aiMsg = { role: 'ai', text: aiText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      messages[currentCategory].push(aiMsg);
      renderMessages();
      saveLocal();
      saveMsg(aiMsg);
    } catch (e) {
      if (typingEl.parentNode) typingEl.remove();
      var errMsg = { role: 'ai', text: 'Sorry, I couldn\'t process that right now. Your message has been saved — our team will respond!', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      messages[currentCategory].push(errMsg);
      renderMessages();
      saveLocal();
    }

    isSending = false;
    input.disabled = false;
    input.focus();
  }

  // ─── FILE ATTACHMENT ──────────────────────────────────────────────────────
  async function handleFileAttach() {
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    var acceptParts = [];
    if (HC_IMAGE_ENABLED) acceptParts.push('image/*');
    if (HC_PDF_ENABLED) acceptParts.push('application/pdf');
    fileInput.accept = acceptParts.join(',') || 'image/*,application/pdf';
    fileInput.onchange = async function () {
      var file = fileInput.files[0];
      if (!file) return;
      var validation = validateAttachmentFile(file);
      if (!validation.ok) { alert(validation.message); return; }
      if (!(await confirmAttachmentAiUsage(file, validation.type))) return;

      var type = validation.type;
      var prefix = type === 'image' ? 'img' : 'doc';
      var aiAttachmentPayload = null;
      try { aiAttachmentPayload = await buildGeminiAttachmentPayload(file, type); } catch (e) {}

      // Show uploading indicator with spinner
      var timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      var pendingMsg = { role: 'user', text: '', category: currentCategory, time: timeStr, _loading: 'Uploading ' + file.name + '…' };
      messages[currentCategory].push(pendingMsg);
      renderMessages();

      var url = await uploadToStorage(file, prefix);
      // Remove pending msg
      messages[currentCategory].pop();

      if (url) {
        var msg = {
          role: 'user', text: '', category: currentCategory, time: timeStr,
          attachment_url: url, attachment_type: type, attachment_name: file.name
        };
        messages[currentCategory].push(msg);
        renderMessages();
        saveLocal();
        saveMsg(msg);

        var typingEl = document.createElement('div');
        typingEl.className = 'cb-typing';
        typingEl.innerHTML = '<span></span><span></span><span></span>';
        var list = document.getElementById('cb-messages');
        if (list) { list.appendChild(typingEl); list.scrollTop = list.scrollHeight; }
        try {
          var aiText = await getAIReply('', null, aiAttachmentPayload);
          if (typingEl.parentNode) typingEl.remove();
          var aiMsg = { role: 'ai', text: aiText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
          messages[currentCategory].push(aiMsg);
          renderMessages();
          saveLocal();
          saveMsg(aiMsg);
        } catch (e) {
          if (typingEl.parentNode) typingEl.remove();
          var errMsg = { role: 'ai', text: 'I received your attachment. Our team can still review it if AI analysis is limited.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
          messages[currentCategory].push(errMsg);
          renderMessages();
          saveLocal();
        }
      } else {
        var errMsg = { role: 'ai', text: '⚠️ Upload failed. Please try again.', time: timeStr };
        messages[currentCategory].push(errMsg);
        renderMessages();
      }
    };
    fileInput.click();
  }

  // ─── VOICE RECORDING ─────────────────────────────────────────────────────
  var voiceRecorder = null;
  var voiceChunks = [];
  var voiceStream = null;
  var isRecording = false;

  function getVoiceMime() {
    var types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
    for (var i = 0; i < types.length; i++) { if (MediaRecorder.isTypeSupported(types[i])) return types[i]; }
    return '';
  }

  var _recTimerInterval = null;
  var _recStartTime = 0;
  var _recOverlayEl = null;

  async function startVoiceRecord() {
    if (isRecording) return;
    if (!HC_VOICE_ENABLED) { alert('Voice messages are currently disabled by the admin.'); return; }
    try {
      voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      alert('Microphone access denied. Please allow microphone access to send voice messages.');
      return;
    }

    voiceChunks = [];
    var mime = getVoiceMime();
    voiceRecorder = new MediaRecorder(voiceStream, mime ? { mimeType: mime } : {});
    voiceRecorder.ondataavailable = function (e) { if (e.data.size > 0) voiceChunks.push(e.data); };
    voiceRecorder.onstop = async function () {
      isRecording = false;
      hideRecOverlay();
      updateVoiceBtn();
      if (voiceStream) voiceStream.getTracks().forEach(function (t) { t.stop(); });

      if (!voiceChunks.length) return;
      var blob = new Blob(voiceChunks, { type: mime || 'audio/webm' });
      if (blob.size < 1000) return;

      var timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      var pendingMsg = { role: 'user', text: '', time: timeStr, _loading: 'Sending voice…' };
      messages[currentCategory].push(pendingMsg);
      renderMessages();

      var file = new File([blob], 'voice_' + Date.now() + '.webm', { type: mime || 'audio/webm' });
      var url = await uploadToStorage(file, 'voice');
      messages[currentCategory].pop();

      if (url) {
        var msg = {
          role: 'user', text: '', category: currentCategory, time: timeStr,
          attachment_url: url, attachment_type: 'voice', attachment_name: file.name
        };
        messages[currentCategory].push(msg);
        renderMessages();
        saveLocal();
        saveMsg(msg);

        // Get AI reply by sending the audio blob to Gemini
        var typingEl = document.createElement('div');
        typingEl.className = 'cb-typing';
        typingEl.innerHTML = '<span></span><span></span><span></span>';
        var list = document.getElementById('cb-messages');
        if (list) { list.appendChild(typingEl); list.scrollTop = list.scrollHeight; }
        try {
          var aiText = await getAIReply('', blob);
          if (typingEl.parentNode) typingEl.remove();
          var aiMsg = { role: 'ai', text: aiText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
          messages[currentCategory].push(aiMsg);
          renderMessages();
          saveLocal();
          saveMsg(aiMsg);
        } catch (e) {
          if (typingEl.parentNode) typingEl.remove();
          var errMsg = { role: 'ai', text: 'I received your voice message. Our team will follow up if needed!', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
          messages[currentCategory].push(errMsg);
          renderMessages();
          saveLocal();
        }
      } else {
        messages[currentCategory].push({ role: 'ai', text: '⚠️ Voice upload failed.', time: timeStr });
        renderMessages();
      }
    };

    voiceRecorder.start();
    isRecording = true;
    _recStartTime = Date.now();
    updateVoiceBtn();
    showRecOverlay(document.querySelector('#cb-overlay .cb-hc-container') || document.getElementById('cb-overlay'));
  }

  function stopVoiceRecord() {
    if (!isRecording) return;
    if (voiceRecorder && voiceRecorder.state !== 'inactive') voiceRecorder.stop();
  }

  function showRecOverlay(parent) {
    if (!parent) return;
    _recOverlayEl = document.createElement('div');
    _recOverlayEl.className = 'cb-rec-overlay';
    _recOverlayEl.innerHTML = '<div class="cb-rec-indicator"><div class="cb-rec-red-dot"></div><div class="cb-rec-timer" id="cbRecTimer">0:00</div></div><div class="cb-rec-hint">🎤 Recording…</div><button class="cb-rec-stop" id="cbRecStop"><div class="cb-rec-stop-sq"></div></button><div class="cb-rec-cancel">Tap circle to send · Tap here to cancel</div>';
    parent.appendChild(_recOverlayEl);
    _recOverlayEl.querySelector('#cbRecStop').addEventListener('click', function () {
      stopVoiceRecord();
    });
    _recOverlayEl.querySelector('.cb-rec-cancel').addEventListener('click', function () {
      voiceChunks = [];
      stopVoiceRecord();
    });
    _recTimerInterval = setInterval(function () {
      var elapsed = (Date.now() - _recStartTime) / 1000;
      var el = document.getElementById('cbRecTimer');
      if (el) el.textContent = formatVmDur(elapsed);
      if (elapsed >= MAX_VOICE_SEC) stopVoiceRecord();
    }, 200);
  }

  function hideRecOverlay() {
    if (_recTimerInterval) { clearInterval(_recTimerInterval); _recTimerInterval = null; }
    if (_recOverlayEl && _recOverlayEl.parentNode) _recOverlayEl.remove();
    _recOverlayEl = null;
  }

  function updateVoiceBtn() {
    var btn = document.getElementById('cb-voice-btn');
    if (btn) {
      btn.innerHTML = isRecording ? '<span class="cb-rec-dot"></span>' : '🎤';
      btn.classList.toggle('recording', isRecording);
    }
  }

  function bindHoldToRecord(btn, startFn, stopFn) {
    var holdTimer = null;
    var started = false;
    function onDown(e) {
      e.preventDefault();
      started = false;
      holdTimer = setTimeout(function () { started = true; startFn(); }, 200);
    }
    function onUp(e) {
      if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
      if (started) { stopFn(); started = false; }
    }
    btn.addEventListener('mousedown', onDown);
    btn.addEventListener('touchstart', onDown, { passive: false });
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchend', onUp);
    // Also allow click for short tap
    btn.addEventListener('click', function () {
      if (!started) { startFn(); setTimeout(function () {}, 100); }
    });
  }

  // ─── OPEN / CLOSE BUBBLE ──────────────────────────────────────────────────
  function openBubble() {
    isOpen = true;
    var btn = document.getElementById('cb-fab');
    if (btn) { btn.classList.add('open'); btn.classList.remove('cb-faded'); }
    if (_fadeTimer) clearTimeout(_fadeTimer);

    if (_isLanding) {
      // On landing page, open the existing Help Center overlay
      if (window.openHelpCenter) window.openHelpCenter();
    } else {
      // On other pages, open our overlay
      var overlay = document.getElementById('cb-overlay');
      if (overlay) overlay.classList.add('active');
      markSeen();
      renderMessages();
      var input = document.getElementById('cb-input');
      if (input) setTimeout(function () { input.focus(); }, 200);
    }
  }

  function closeBubble() {
    isOpen = false;
    var btn = document.getElementById('cb-fab');
    if (btn) btn.classList.remove('open');
    resetFadeTimer();

    if (_isLanding) {
      if (window.closeHelpCenter) window.closeHelpCenter();
    } else {
      var overlay = document.getElementById('cb-overlay');
      if (overlay) overlay.classList.remove('active');
    }
  }

  function toggleBubble() {
    if (_isLanding) {
      // Check if the Help Center overlay is currently active
      var hcOverlay = document.getElementById('helpCenterOverlay');
      if (hcOverlay && hcOverlay.classList.contains('active')) {
        closeBubble();
      } else {
        openBubble();
      }
    } else {
      if (isOpen) closeBubble(); else openBubble();
    }
  }

  function switchCategory(cat) {
    currentCategory = cat;
    var overlay = document.getElementById('cb-overlay');
    if (overlay) {
      overlay.querySelectorAll('.cb-cat-btn').forEach(function (b) {
        b.classList.toggle('active', b.dataset.cat === cat);
      });
    }
    renderMessages();
  }

  // ─── SYNC WITH LANDING PAGE HELP CENTER ───────────────────────────────────
  // If the landing page Help Center also has messages, merge them
  function syncFromLandingHC() {
    try {
      var hc = JSON.parse(localStorage.getItem('ms_helpcenter_chats') || '{}');
      ['support', 'premium', 'partner'].forEach(function (cat) {
        var stored = hc[cat];
        if (stored && stored.messages && stored.messages.length) {
          var existingTexts = new Set((messages[cat] || []).map(function (m) { return m.role + ':' + (m.text || '').substring(0, 50); }));
          stored.messages.forEach(function (m) {
            var key = m.role + ':' + (m.text || '').substring(0, 50);
            if (!existingTexts.has(key)) {
              messages[cat].push(m);
              existingTexts.add(key);
            }
          });
        }
      });
    } catch (e) {}
  }

  // ─── AUTO CATEGORY DETECTION ─────────────────────────────────────────────
  function _detectCategory(text) {
    var t = text.toLowerCase();
    // Partnership — English + Uzbek
    if (/partner|collab|collaborat|business deal|advertis|sponsor|affiliate|b2b|resell|white.?label|bulk|wholesale|integrate|api access|hamkorlik|hamkor|sheriklik|sherik|birgalik|shartnoma|reklama|taklif|korporativ|muvofiq|aloqa o'rnat/.test(t)) return 'partner';
    // Premium — English + Uzbek
    if (/premium|subscri|buy|purchas|price|pric|cost|pay|payment|upgrade|plan|tier|pro account|unlock|access fee|tarif|69[,\s]*000|card number|transfer|activate|obuna|sotib|narx|to['']?lov|karta|aktivlash|pul o'tkaz|xizmat|yuborish|o'tkazma|pullik/.test(t)) return 'premium';
    return null;
  }

  // ─── DETECT LANDING PAGE ────────────────────────────────────────────────
  // On landing.html the Help Center overlay already exists — we reuse it.
  var _isLanding = false;

  // ─── BUILD DOM ────────────────────────────────────────────────────────────
  function injectCSS() {
    var style = document.createElement('style');
    style.textContent = `
      /* ── Floating Action Button ── */
      #cb-fab{position:fixed;bottom:24px;left:24px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;border:none;cursor:grab;box-shadow:0 4px 16px rgba(37,99,235,.4);z-index:99998;display:flex;align-items:center;justify-content:center;font-size:24px;transition:transform .2s,box-shadow .2s,opacity .6s ease;opacity:1}
      #cb-fab:active{cursor:grabbing}
      #cb-fab:hover{transform:scale(1.08);box-shadow:0 6px 24px rgba(37,99,235,.5)}
      #cb-fab.open{transform:rotate(45deg) scale(1.08)}
      #cb-fab.cb-faded{opacity:.25;transition:opacity 1.2s ease}
      #cb-fab.cb-faded:hover{opacity:1;transition:opacity .2s ease}
      #cb-badge{position:absolute;top:-2px;right:-2px;min-width:18px;height:18px;border-radius:9px;background:#ef4444;color:#fff;font-size:11px;font-weight:700;display:none;align-items:center;justify-content:center;padding:0 5px;box-shadow:0 2px 6px rgba(239,68,68,.4)}
      #cb-badge:not(:empty){display:flex}

      /* ── Centered Help-Center Overlay (non-landing pages) ── */
      #cb-overlay{display:none;position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);justify-content:center;align-items:center;animation:cbHcFadeIn .25s ease}
      #cb-overlay.active{display:flex}
      @keyframes cbHcFadeIn{from{opacity:0}to{opacity:1}}
      #cb-overlay .cb-hc-container{position:relative;width:420px;max-width:95vw;height:600px;max-height:90vh;background:#fff;border-radius:20px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,.3);border:1px solid #e5e7eb;animation:cbHcSlideUp .3s ease}
      @keyframes cbHcSlideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
      #cb-overlay .cb-hc-header{background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);color:#fff;padding:16px 20px;display:flex;align-items:center;flex-shrink:0}
      #cb-overlay .cb-hc-close{position:absolute;top:10px;right:10px;z-index:3;background:rgba(0,0,0,0.35);border:none;color:#fff;width:32px;height:32px;border-radius:50%;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
      #cb-overlay .cb-hc-close:hover{background:rgba(0,0,0,0.55)}
      #cb-overlay .cb-hc-tabs{display:flex;gap:6px;padding:10px 16px;border-bottom:1px solid #e5e7eb;flex-shrink:0;overflow-x:auto}
      #cb-overlay .cb-cat-btn{padding:6px 14px;border-radius:20px;border:1.5px solid #e5e7eb;background:#fff;color:#1e293b;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .2s ease}
      #cb-overlay .cb-cat-btn:hover{border-color:#2563eb;color:#2563eb}
      #cb-overlay .cb-cat-btn.active{background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);color:#fff;border-color:transparent}
      #cb-overlay #cb-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}
      #cb-overlay .cb-msg{max-width:85%;display:flex;flex-direction:column}
      #cb-overlay .cb-msg-user{align-self:flex-end}
      #cb-overlay .cb-msg-ai{align-self:flex-start}
      #cb-overlay .cb-msg-admin{align-self:flex-start}
      #cb-overlay .cb-msg-label{font-size:10px;opacity:.6;margin-bottom:3px;font-weight:600}
      #cb-overlay .cb-msg-text{padding:10px 14px;border-radius:16px;font-size:13px;line-height:1.5;word-break:break-word}
      #cb-overlay .cb-msg-user .cb-msg-text{background:linear-gradient(135deg,#2563eb 0%,#3b82f6 100%);color:#fff;border-bottom-right-radius:4px}
      #cb-overlay .cb-msg-ai .cb-msg-text{background:#e5e7eb;color:#1e293b;border-bottom-left-radius:4px}
      #cb-overlay .cb-msg-admin .cb-msg-text{background:linear-gradient(135deg,#059669 0%,#10b981 100%);color:#fff;border-bottom-left-radius:4px}
      #cb-overlay .cb-msg-time{font-size:10px;opacity:.5;margin-top:4px}
      #cb-overlay .cb-msg-user .cb-msg-time{text-align:right}

      /* ── Attachments (overlay) ── */
      #cb-overlay .cb-attachment-img{max-width:200px;max-height:160px;border-radius:10px;margin:4px 0;cursor:pointer;object-fit:cover}
      #cb-overlay .cb-attachment-file{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;background:rgba(255,255,255,.2);border-radius:8px;color:inherit;text-decoration:none;font-size:12px;font-weight:600;margin:4px 0}

      /* ── Attachment loading spinner ── */
      .cb-attach-loading{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:14px;background:rgba(0,0,0,.04);margin:4px 0;min-width:160px}
      .cb-attach-spinner{width:22px;height:22px;border:2.5px solid rgba(0,0,0,.1);border-top-color:#2563eb;border-radius:50%;animation:cb-spin .7s linear infinite;flex-shrink:0}
      .cb-attach-loading-text{font-size:12px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .cb-msg-user .cb-attach-loading{background:rgba(255,255,255,.15)}
      .cb-msg-user .cb-attach-spinner{border-color:rgba(255,255,255,.25);border-top-color:#fff}
      .cb-msg-user .cb-attach-loading-text{color:rgba(255,255,255,.85)}
      @keyframes cb-spin{to{transform:rotate(360deg)}}

      /* ── Telegram-style voice message ── */
      .cb-voice-msg{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:16px;min-width:200px;max-width:260px;margin:4px 0;user-select:none}
      .cb-msg-user .cb-voice-msg{background:linear-gradient(135deg,#2563eb 0%,#3b82f6 100%);border-bottom-right-radius:4px}
      .cb-msg-ai .cb-voice-msg{background:#e5e7eb;border-bottom-left-radius:4px}
      .cb-msg-admin .cb-voice-msg{background:linear-gradient(135deg,#059669 0%,#10b981 100%);border-bottom-left-radius:4px}
      .cb-voice-play{width:36px;height:36px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .15s}
      .cb-voice-play:hover{transform:scale(1.08)}
      .cb-voice-play svg{width:16px;height:16px;fill:currentColor}
      .cb-msg-user .cb-voice-play{background:rgba(255,255,255,.9);color:#2563eb}
      .cb-msg-ai .cb-voice-play{background:#6366f1;color:#fff}
      .cb-msg-admin .cb-voice-play{background:rgba(255,255,255,.9);color:#059669}
      .cb-voice-body{flex:1;display:flex;flex-direction:column;gap:3px;min-width:0}
      .cb-voice-wave{display:flex;align-items:center;gap:2px;height:28px}
      .cb-voice-wave .cb-bar{width:3.5px;border-radius:2px;transition:background .15s;min-height:4px}
      .cb-msg-user .cb-voice-wave .cb-bar{background:rgba(255,255,255,.55)}
      .cb-msg-user .cb-voice-wave .cb-bar.played{background:#fff}
      .cb-msg-ai .cb-voice-wave .cb-bar{background:rgba(99,102,241,.35)}
      .cb-msg-ai .cb-voice-wave .cb-bar.played{background:#6366f1}
      .cb-msg-admin .cb-voice-wave .cb-bar{background:rgba(255,255,255,.45)}
      .cb-msg-admin .cb-voice-wave .cb-bar.played{background:#fff}
      .cb-voice-dur{font-size:11px;font-variant-numeric:tabular-nums;white-space:nowrap}
      .cb-msg-user .cb-voice-dur,.cb-msg-admin .cb-voice-dur{color:rgba(255,255,255,.8)}
      .cb-msg-ai .cb-voice-dur{color:#475569}

      /* ── Hold-to-record overlay ── */
      .cb-rec-overlay{position:absolute;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;z-index:20;border-radius:0 0 20px 20px;animation:cbHcFadeIn .15s ease}
      .cb-rec-indicator{display:flex;align-items:center;gap:8px}
      .cb-rec-red-dot{width:10px;height:10px;border-radius:50%;background:#ef4444;animation:cb-pulse 1s infinite}
      .cb-rec-timer{font-size:20px;font-weight:700;color:#fff;font-variant-numeric:tabular-nums}
      .cb-rec-hint{font-size:12px;color:rgba(255,255,255,.7)}
      .cb-rec-cancel{font-size:11px;color:rgba(255,255,255,.5);margin-top:4px}
      .cb-rec-stop{width:52px;height:52px;border-radius:50%;border:3px solid #fff;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;margin-top:6px;transition:transform .15s}
      .cb-rec-stop:hover{transform:scale(1.08)}
      .cb-rec-stop-sq{width:20px;height:20px;border-radius:4px;background:#ef4444}

      /* ── Input Bar (overlay) ── */
      #cb-overlay .cb-input-bar{display:flex;align-items:center;gap:6px;padding:12px 16px;border-top:1px solid #e5e7eb;background:#fff;flex-shrink:0}
      #cb-overlay .cb-attach-btn,#cb-overlay .cb-send-btn,#cb-overlay #cb-voice-btn{width:40px;height:40px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;transition:all .2s}
      #cb-overlay .cb-attach-btn{background:#f1f5f9;color:#64748b}#cb-overlay .cb-attach-btn:hover{background:#e2e8f0}
      #cb-overlay .cb-send-btn{background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);color:#fff}#cb-overlay .cb-send-btn:hover{transform:scale(1.1)}
      #cb-overlay #cb-voice-btn{background:#f1f5f9;color:#64748b}#cb-overlay #cb-voice-btn:hover{background:#e2e8f0}
      #cb-overlay #cb-voice-btn.recording{background:#ef4444;color:#fff;animation:cb-pulse 1s infinite}
      .cb-rec-dot{width:8px;height:8px;border-radius:50%;background:#fff;display:inline-block;margin-right:4px}
      #cb-overlay #cb-input{flex:1;padding:10px 14px;border-radius:24px;border:1.5px solid #e5e7eb;background:#f9fafb;color:#1e293b;font-size:13px;outline:none;transition:border-color .2s}
      #cb-overlay #cb-input:focus{border-color:#2563eb}
      #cb-overlay .cb-empty{text-align:center;color:#94a3b8;font-size:13px;margin-top:60px}

      /* ── Typing Indicator ── */
      .cb-typing{display:flex;gap:4px;padding:8px 12px;align-self:flex-start}
      .cb-typing span{width:7px;height:7px;border-radius:50%;background:#94a3b8;animation:cb-bounce .6s infinite alternate}
      .cb-typing span:nth-child(2){animation-delay:.15s}
      .cb-typing span:nth-child(3){animation-delay:.3s}

      /* ── Toast ── */
      #cb-toast{position:fixed;bottom:90px;left:24px;z-index:99999;animation:cb-slideIn .3s ease}
      .cb-toast-inner{display:flex;align-items:flex-start;gap:10px;background:#fff;border-radius:14px;padding:12px 14px;box-shadow:0 8px 32px rgba(0,0,0,.16);max-width:340px;border-left:4px solid #10b981;cursor:pointer;position:relative}
      .cb-toast-icon{font-size:20px;flex-shrink:0;margin-top:2px}
      .cb-toast-body{flex:1;min-width:0}
      .cb-toast-title{font-size:12px;font-weight:700;color:#059669;margin-bottom:2px}
      .cb-toast-text{font-size:13px;color:#334155;line-height:1.4;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
      .cb-toast-close{position:absolute;top:6px;right:8px;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:14px;padding:2px}
      .cb-toast-hide{opacity:0;transform:translateY(8px);transition:all .3s}

      /* ── Attachment Confirm Modal ── */
      .cb-attach-confirm-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.42);backdrop-filter:blur(2px);z-index:100001;display:flex;align-items:center;justify-content:center;padding:16px;animation:cbHcFadeIn .16s ease}
      .cb-attach-confirm-panel{width:100%;max-width:430px;background:#fff;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 20px 55px rgba(0,0,0,.28);padding:16px}
      .cb-attach-confirm-title{margin:0 0 8px;font-size:16px;color:#0f172a;font-weight:800}
      .cb-attach-confirm-text{display:flex;flex-direction:column;gap:5px;margin-bottom:10px}
      .cb-attach-confirm-text p{margin:0;font-size:13px;line-height:1.45;color:#334155}
      .cb-attach-confirm-badge{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;border-radius:999px;padding:6px 10px;margin-bottom:12px}
      .cb-attach-confirm-badge.ai-on{background:#dbeafe;color:#1d4ed8}
      .cb-attach-confirm-badge.ai-off{background:#fee2e2;color:#b91c1c}
      .cb-attach-confirm-actions{display:flex;gap:10px;justify-content:flex-end}
      .cb-attach-btn{border:none;border-radius:10px;padding:9px 12px;font-size:12px;font-weight:700;cursor:pointer;transition:transform .15s,opacity .15s}
      .cb-attach-btn:hover{transform:translateY(-1px)}
      .cb-attach-btn.cb-cancel{background:#e2e8f0;color:#334155}
      .cb-attach-btn.cb-continue{background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);color:#fff}

      /* ── Animations ── */
      @keyframes cb-bounce{to{transform:translateY(-4px)}}
      @keyframes cb-pulse{0%,100%{opacity:1}50%{opacity:.7}}
      @keyframes cb-slideIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

      /* ── Dark Mode (overlay) ── */
      @media(prefers-color-scheme:dark){
        #cb-overlay .cb-hc-container{background:#1e293b;border-color:rgba(255,255,255,.1)}
        #cb-overlay .cb-hc-tabs{border-color:rgba(255,255,255,.1)}
        #cb-overlay .cb-cat-btn{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.15);color:#e2e8f0}
        #cb-overlay .cb-cat-btn:hover{border-color:#60a5fa;color:#60a5fa}
        #cb-overlay .cb-msg-ai .cb-msg-text{background:rgba(255,255,255,.1);color:#e2e8f0}
        #cb-overlay .cb-input-bar{background:#1e293b;border-color:rgba(255,255,255,.1)}
        #cb-overlay #cb-input{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.15);color:#e2e8f0}
        #cb-overlay #cb-input:focus{border-color:#60a5fa}
        #cb-overlay .cb-attach-btn,#cb-overlay #cb-voice-btn{background:rgba(255,255,255,.1);color:#94a3b8}
        #cb-overlay .cb-hc-close{background:rgba(0,0,0,0.5);color:#fff}#cb-overlay .cb-hc-close:hover{background:rgba(0,0,0,0.7)}
        .cb-toast-inner{background:#1e293b;border-left-color:#10b981}
        .cb-toast-text{color:#cbd5e1}
      }
      [data-theme="dark"] #cb-overlay .cb-hc-container{background:#1e293b;border-color:rgba(255,255,255,.1)}
      [data-theme="dark"] #cb-overlay .cb-hc-tabs{border-color:rgba(255,255,255,.1)}
      [data-theme="dark"] #cb-overlay .cb-cat-btn{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.15);color:#e2e8f0}
      [data-theme="dark"] #cb-overlay .cb-cat-btn:hover{border-color:#60a5fa;color:#60a5fa}
      [data-theme="dark"] #cb-overlay .cb-msg-ai .cb-msg-text{background:rgba(255,255,255,.1);color:#e2e8f0}
      [data-theme="dark"] #cb-overlay .cb-input-bar{background:#1e293b;border-color:rgba(255,255,255,.1)}
      [data-theme="dark"] #cb-overlay #cb-input{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.15);color:#e2e8f0}
      [data-theme="dark"] #cb-overlay #cb-input:focus{border-color:#60a5fa}
      [data-theme="dark"] #cb-overlay .cb-attach-btn,[data-theme="dark"] #cb-overlay #cb-voice-btn{background:rgba(255,255,255,.1);color:#94a3b8}
      [data-theme="dark"] #cb-overlay .cb-hc-close{background:rgba(0,0,0,0.5);color:#fff}[data-theme="dark"] #cb-overlay .cb-hc-close:hover{background:rgba(0,0,0,0.7)}
      [data-theme="dark"] .cb-toast-inner{background:#1e293b;border-left-color:#10b981}
      [data-theme="dark"] .cb-toast-text{color:#cbd5e1}
      [data-theme="dark"] .cb-attach-confirm-panel{background:#1e293b;border-color:#334155}
      [data-theme="dark"] .cb-attach-confirm-title{color:#f1f5f9}
      [data-theme="dark"] .cb-attach-confirm-text p{color:#cbd5e1}
      [data-theme="dark"] .cb-attach-btn.cb-cancel{background:#334155;color:#e2e8f0}

      /* ── Mobile (overlay) ── */
      @media(max-width:480px){
        #cb-overlay .cb-hc-container{width:92vw;max-width:360px;height:auto;max-height:75vh;border-radius:16px}
        #cb-toast{left:12px;right:12px;bottom:84px}.cb-toast-inner{max-width:100%}
        #cb-fab.open{display:none}
      }
    `;
    document.head.appendChild(style);
  }

  function buildDOM() {
    // Don't inject on admin dashboard
    if (window.location.pathname.includes('/results/')) return;

    // Prevent double-init (e.g. bfcache restore, script loaded twice)
    if (document.getElementById('cb-fab')) return;

    // Always use the new white #cb-overlay (even on landing page)
    _isLanding = false;

    // Floating button
    var fab = document.createElement('button');
    fab.id = 'cb-fab';
    fab.title = 'Chat with Mock Stream AI — drag to move';
    fab.innerHTML = '💬<span id="cb-badge"></span>';
    document.body.appendChild(fab);

    // Always create the new white overlay
    {
      // On other pages: create the centered overlay
      var overlay = document.createElement('div');
      overlay.id = 'cb-overlay';
      overlay.innerHTML =
        '<div class="cb-hc-container">' +
          '<button class="cb-hc-close" title="Close">✕</button>' +
          '<div class="cb-hc-header">' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
              '<span style="font-size:24px;">🤖</span>' +
              '<div>' +
                '<h3 style="margin:0;font-size:16px;font-weight:700;">Mock Stream AI</h3>' +
                '<span style="font-size:11px;opacity:0.8;">Help Center — Always Online</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="cb-hc-tabs">' +
            '<button class="cb-cat-btn active" data-cat="support">💬 Support</button>' +
            '<button class="cb-cat-btn" data-cat="premium">👑 Premium</button>' +
            '<button class="cb-cat-btn" data-cat="partner">🤝 Partnership</button>' +
          '</div>' +
          '<div id="cb-messages"></div>' +
          '<div class="cb-input-bar">' +
            '<button class="cb-attach-btn" title="Attach file">📎</button>' +
            '<input type="text" id="cb-input" placeholder="Type your message..." autocomplete="off">' +
            '<button id="cb-voice-btn" title="Voice message">🎤</button>' +
            '<button class="cb-send-btn" title="Send">➤</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);

      // Click backdrop to close
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeBubble();
      });

      // Event listeners for the overlay
      overlay.querySelector('.cb-hc-close').addEventListener('click', closeBubble);
      overlay.querySelector('.cb-send-btn').addEventListener('click', sendMessage);
      overlay.querySelector('.cb-attach-btn').addEventListener('click', handleFileAttach);
      bindHoldToRecord(overlay.querySelector('#cb-voice-btn'), startVoiceRecord, stopVoiceRecord);

      // Category tabs
      overlay.querySelectorAll('.cb-cat-btn').forEach(function (btn) {
        btn.addEventListener('click', function () { switchCategory(btn.dataset.cat); });
      });

      // Enter key
      overlay.querySelector('#cb-input').addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
      });

      // Apply visibility based on admin settings
      applyHcSettingsVisibility();
    }

    // ── Draggable FAB ───────────────────────────────────────────────────────
    initDrag(fab);

    // ── Auto-Fade ───────────────────────────────────────────────────────────
    initAutoFade(fab);

    // ── Restore saved position ──────────────────────────────────────────────
    restoreFabPosition(fab);

    // ── Redirect landing page openHelpCenter/closeHelpCenter to new bubble ──
    if (document.getElementById('helpCenterOverlay')) {
      window.openHelpCenter = openBubble;
      window.closeHelpCenter = closeBubble;
      enhanceLandingHelpCenter();
      applyHcSettingsVisibility();
    }

    // Load admin settings (async, applies visibility when ready)
    loadHcSettings();
  }

  // ─── ENHANCE LANDING PAGE HELP CENTER ─────────────────────────────────────
  // Adds voice + attach buttons to the existing Help Center input bar,
  // and wires them into chat-bubble upload/voice logic.
  function enhanceLandingHelpCenter() {
    var inputBar = document.querySelector('#helpCenterOverlay .helpcenter-input-bar');
    if (!inputBar) return;
    if (inputBar.getAttribute('data-enhanced-chat') === '1') return;
    inputBar.setAttribute('data-enhanced-chat', '1');

    // Add attach button before the input
    var attachBtn = document.createElement('button');
    attachBtn.className = 'cb-hc-action-btn';
    attachBtn.title = 'Attach file';
    attachBtn.innerHTML = '📎';
    attachBtn.style.cssText = 'width:40px;height:40px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;transition:all .2s;background:var(--ring,#f1f5f9);color:var(--muted,#64748b)';
    attachBtn.addEventListener('click', handleLandingFileAttach);

    // Add voice button after input
    var voiceBtn = document.createElement('button');
    voiceBtn.id = 'hc-voice-btn';
    voiceBtn.className = 'cb-hc-action-btn';
    voiceBtn.title = 'Voice message';
    voiceBtn.innerHTML = '🎤';
    voiceBtn.style.cssText = 'width:40px;height:40px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;transition:all .2s;background:var(--ring,#f1f5f9);color:var(--muted,#64748b)';
    bindHoldToRecord(voiceBtn, startLandingVoiceRecord, stopLandingVoiceRecord);

    var input = inputBar.querySelector('#helpCenterInput');
    var sendBtn = inputBar.querySelector('#helpCenterSendBtn');

    // Insert: [attach] [input] [voice] [send]
    inputBar.insertBefore(attachBtn, input);
    inputBar.insertBefore(voiceBtn, sendBtn);

    // Override landing page functions to support attachments
    overrideLandingFunctions();
  }

  // ─── LANDING PAGE: FILE ATTACHMENT ────────────────────────────────────────
  async function handleLandingFileAttach() {
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    var acceptParts = [];
    if (HC_IMAGE_ENABLED) acceptParts.push('image/*');
    if (HC_PDF_ENABLED) acceptParts.push('application/pdf');
    fileInput.accept = acceptParts.join(',') || 'image/*,application/pdf';
    fileInput.onchange = async function () {
      var file = fileInput.files[0];
      if (!file) return;
      var validation = validateAttachmentFile(file);
      if (!validation.ok) { alert(validation.message); return; }
      if (!(await confirmAttachmentAiUsage(file, validation.type))) return;

      var type = validation.type;
      var prefix = type === 'image' ? 'img' : 'doc';
      var aiAttachmentPayload = null;
      try { aiAttachmentPayload = await buildGeminiAttachmentPayload(file, type); } catch (e) {}
      var timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Use landing page state
      var cat = window.helpCenterCategory || 'support';
      if (!window.helpCenterConvId) {
        var _did = getDeviceId();
        window.helpCenterConvId = _did + '_' + cat;
      }

      var pendingMsg = { role: 'user', text: '', time: timeStr, _loading: 'Uploading ' + file.name + '…' };
      window.helpCenterMessages.push(pendingMsg);
      if (window.renderHelpCenterMessages) window.renderHelpCenterMessages();

      var url = await uploadToStorage(file, prefix);
      window.helpCenterMessages.pop();

      if (url) {
        var msg = { role: 'user', text: '', category: cat, time: timeStr, attachment_url: url, attachment_type: type, attachment_name: file.name };
        window.helpCenterMessages.push(msg);
        if (window.renderHelpCenterMessages) window.renderHelpCenterMessages();
        if (window.saveHelpCenterHistory) window.saveHelpCenterHistory();
        // Save to Supabase with attachment fields
        saveMsgLanding(msg);

        if (typeof window.getGeminiResponse === 'function') {
          try {
            var aiText = await window.getGeminiResponse('', null, aiAttachmentPayload);
            var aiTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            var aiMsg = { role: 'ai', text: aiText, time: aiTimeStr };
            window.helpCenterMessages.push(aiMsg);
            if (window.renderHelpCenterMessages) window.renderHelpCenterMessages();
            if (window.saveHelpCenterHistory) window.saveHelpCenterHistory();
            saveMsgLanding(aiMsg);
          } catch (e) {
            var errTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            window.helpCenterMessages.push({ role: 'ai', text: 'I received your attachment. Our team can still review it if AI analysis is limited.', time: errTime });
            if (window.renderHelpCenterMessages) window.renderHelpCenterMessages();
          }
        }
      } else {
        window.helpCenterMessages.push({ role: 'ai', text: '⚠️ Upload failed. Please try again.', time: timeStr });
        if (window.renderHelpCenterMessages) window.renderHelpCenterMessages();
      }
    };
    fileInput.click();
  }

  // ─── LANDING PAGE: VOICE RECORDING ────────────────────────────────────────
  var _lcVoiceRecorder = null;
  var _lcVoiceChunks = [];
  var _lcVoiceStream = null;
  var _lcIsRecording = false;
  var _lcRecTimerInterval = null;
  var _lcRecStartTime = 0;
  var _lcRecOverlayEl = null;

  async function startLandingVoiceRecord() {
    if (_lcIsRecording) return;
    if (!HC_VOICE_ENABLED) { alert('Voice messages are currently disabled by the admin.'); return; }
    try {
      _lcVoiceStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      alert('Microphone access denied. Please allow microphone to send voice messages.');
      return;
    }

    _lcVoiceChunks = [];
    var mime = getVoiceMime();
    _lcVoiceRecorder = new MediaRecorder(_lcVoiceStream, mime ? { mimeType: mime } : {});
    _lcVoiceRecorder.ondataavailable = function (e) { if (e.data.size > 0) _lcVoiceChunks.push(e.data); };
    _lcVoiceRecorder.onstop = async function () {
      _lcIsRecording = false;
      hideLcRecOverlay();
      updateLandingVoiceBtn();
      if (_lcVoiceStream) _lcVoiceStream.getTracks().forEach(function (t) { t.stop(); });
      if (!_lcVoiceChunks.length) return;

      var blob = new Blob(_lcVoiceChunks, { type: mime || 'audio/webm' });
      if (blob.size < 1000) return;

      var cat = window.helpCenterCategory || 'support';
      if (!window.helpCenterConvId) {
        window.helpCenterConvId = getDeviceId() + '_' + cat;
      }

      var timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      var pendingMsg = { role: 'user', text: '', time: timeStr, _loading: 'Sending voice…' };
      window.helpCenterMessages.push(pendingMsg);
      if (window.renderHelpCenterMessages) window.renderHelpCenterMessages();

      var file = new File([blob], 'voice_' + Date.now() + '.webm', { type: mime || 'audio/webm' });
      var url = await uploadToStorage(file, 'voice');
      window.helpCenterMessages.pop();

      if (url) {
        var msg = { role: 'user', text: '', category: cat, time: timeStr, attachment_url: url, attachment_type: 'voice', attachment_name: file.name };
        window.helpCenterMessages.push(msg);
        if (window.renderHelpCenterMessages) window.renderHelpCenterMessages();
        if (window.saveHelpCenterHistory) window.saveHelpCenterHistory();
        saveMsgLanding(msg);

        // Get AI reply by sending the audio blob to Gemini
        if (typeof window.getGeminiResponse === 'function') {
          try {
            var aiText = await window.getGeminiResponse('', blob);
            var aiTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            var aiMsg = { role: 'ai', text: aiText, time: aiTimeStr };
            window.helpCenterMessages.push(aiMsg);
            if (window.renderHelpCenterMessages) window.renderHelpCenterMessages();
            if (window.saveHelpCenterHistory) window.saveHelpCenterHistory();
            saveMsgLanding(aiMsg);
          } catch (e) {
            var errTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            window.helpCenterMessages.push({ role: 'ai', text: 'I received your voice message. Our team will follow up if needed!', time: errTime });
            if (window.renderHelpCenterMessages) window.renderHelpCenterMessages();
          }
        }
      } else {
        window.helpCenterMessages.push({ role: 'ai', text: '⚠️ Voice upload failed.', time: timeStr });
        if (window.renderHelpCenterMessages) window.renderHelpCenterMessages();
      }
    };

    _lcVoiceRecorder.start();
    _lcIsRecording = true;
    _lcRecStartTime = Date.now();
    updateLandingVoiceBtn();
    showLcRecOverlay();
  }

  function stopLandingVoiceRecord() {
    if (!_lcIsRecording) return;
    if (_lcVoiceRecorder && _lcVoiceRecorder.state !== 'inactive') _lcVoiceRecorder.stop();
  }

  function showLcRecOverlay() {
    var parent = document.querySelector('#helpCenterOverlay .helpcenter-container') || document.getElementById('helpCenterOverlay');
    if (!parent) return;
    _lcRecOverlayEl = document.createElement('div');
    _lcRecOverlayEl.className = 'cb-rec-overlay';
    _lcRecOverlayEl.innerHTML = '<div class="cb-rec-indicator"><div class="cb-rec-red-dot"></div><div class="cb-rec-timer" id="lcRecTimer">0:00</div></div><div class="cb-rec-hint">🎤 Recording…</div><button class="cb-rec-stop" id="lcRecStop"><div class="cb-rec-stop-sq"></div></button><div class="cb-rec-cancel">Tap circle to send · Tap here to cancel</div>';
    parent.style.position = 'relative';
    parent.appendChild(_lcRecOverlayEl);
    _lcRecOverlayEl.querySelector('#lcRecStop').addEventListener('click', function () {
      stopLandingVoiceRecord();
    });
    _lcRecOverlayEl.querySelector('.cb-rec-cancel').addEventListener('click', function () {
      _lcVoiceChunks = [];
      stopLandingVoiceRecord();
    });
    _lcRecTimerInterval = setInterval(function () {
      var elapsed = (Date.now() - _lcRecStartTime) / 1000;
      var el = document.getElementById('lcRecTimer');
      if (el) el.textContent = formatVmDur(elapsed);
      if (elapsed >= MAX_VOICE_SEC) stopLandingVoiceRecord();
    }, 200);
  }

  function hideLcRecOverlay() {
    if (_lcRecTimerInterval) { clearInterval(_lcRecTimerInterval); _lcRecTimerInterval = null; }
    if (_lcRecOverlayEl && _lcRecOverlayEl.parentNode) _lcRecOverlayEl.remove();
    _lcRecOverlayEl = null;
  }

  function updateLandingVoiceBtn() {
    var btn = document.getElementById('hc-voice-btn');
    if (btn) {
      btn.innerHTML = _lcIsRecording ? '<span style="width:8px;height:8px;border-radius:50%;background:#fff;display:inline-block"></span>' : '🎤';
      btn.style.background = _lcIsRecording ? '#ef4444' : '';
      btn.style.color = _lcIsRecording ? '#fff' : '';
    }
  }

  // ─── LANDING PAGE: SAVE MESSAGE WITH ATTACHMENTS ──────────────────────────
  async function saveMsgLanding(msg) {
    try {
      var cat = window.helpCenterCategory || 'support';
      var body = {
        conversation_id: window.helpCenterConvId || (getDeviceId() + '_' + cat),
        role: msg.role,
        sender_name: getSenderName(),
        content: msg.text || '',
        category: cat,
        center: getCenter(),
        device_id: getDeviceId()
      };
      if (msg.attachment_url) {
        body.attachment_url = msg.attachment_url;
        body.attachment_type = msg.attachment_type || null;
        body.attachment_name = msg.attachment_name || null;
      }
      await sbFetch('/rest/v1/support_messages', {
        method: 'POST',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify(body)
      });
    } catch (e) { console.warn('[ChatBubble] Landing save error:', e); }
  }

  // ─── OVERRIDE LANDING PAGE FUNCTIONS ──────────────────────────────────────
  // Patch renderHelpCenterMessages and saveMessageToSupabase to support attachments
  // Also sync FAB state with Help Center open/close
  function overrideLandingFunctions() {
    // Hook closeHelpCenter to also update FAB state
    var _origClose = window.closeHelpCenter;
    window.closeHelpCenter = function () {
      if (_origClose) _origClose();
      isOpen = false;
      var fab = document.getElementById('cb-fab');
      if (fab) fab.classList.remove('open');
      resetFadeTimer();
    };

    // Hook openHelpCenter to also update FAB state
    var _origOpen = window.openHelpCenter;
    window.openHelpCenter = function () {
      if (_origOpen) _origOpen();
      isOpen = true;
      var fab = document.getElementById('cb-fab');
      if (fab) { fab.classList.add('open'); fab.classList.remove('cb-faded'); }
      if (_fadeTimer) clearTimeout(_fadeTimer);
      // Also clear our badge
      markSeen();
    };

    // Add backdrop click to close the Help Center overlay
    var hcOverlay = document.getElementById('helpCenterOverlay');
    if (hcOverlay) {
      hcOverlay.addEventListener('click', function (e) {
        if (e.target === hcOverlay) window.closeHelpCenter();
      });
    }

    // Override render function to support attachments
    var _origRender = window.renderHelpCenterMessages;
    window.renderHelpCenterMessages = function () {
      var container = document.getElementById('helpCenterMessages');
      if (!container) return;
      var cat = window.helpCenterCategory || 'support';
      var welcomes = {
        support: '👋 Hi! I\'m <strong>Mock Stream AI</strong>. How can I help you? Describe your issue and I\'ll do my best to assist.',
        premium: '👑 Welcome! Interested in <strong>Premium access</strong>? Tell me a bit about yourself and I\'ll connect you with our team.',
        partner: '🤝 Hello! Looking to <strong>partner with us</strong>? Tell me about your organization and we\'ll get in touch.'
      };
      var welcomeHtml = welcomes[cat] || welcomes.support;
      var html = '<div class="hc-msg ai"><div class="hc-msg-bubble">' + welcomeHtml + '</div></div>';
      var msgs = window.helpCenterMessages || [];
      msgs.forEach(function (m) {
        var cls = m.role === 'user' ? 'user' : (m.role === 'admin' ? 'admin' : 'ai');
        var sender = m.role === 'admin' ? '<div class="hc-msg-sender">🛡️ Admin</div>' : '';
        var time = m.time ? '<div class="hc-msg-time">' + m.time + '</div>' : '';
        var attachHtml = '';
        if (m._loading) {
          attachHtml = '<div class="cb-attach-loading"><div class="cb-attach-spinner"></div><div class="cb-attach-loading-text">' + escapeHtml(m._loading) + '</div></div>';
        } else if (m.attachment_url) {
          if (m.attachment_type === 'voice') {
            attachHtml = buildVoiceMsgHtml(m.attachment_url);
          } else if (m.attachment_type === 'image') {
            attachHtml = '<img src="' + escapeHtml(m.attachment_url) + '" style="max-width:200px;max-height:160px;border-radius:10px;margin:4px 0;cursor:pointer;object-fit:cover" onclick="window.open(this.src)" alt="Image" onload="this.closest && this.closest(\'#helpCenterMessages\').scrollTop=this.closest(\'#helpCenterMessages\').scrollHeight">';
          } else if (m.attachment_type === 'pdf') {
            attachHtml = '<a href="' + escapeHtml(m.attachment_url) + '" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:8px 12px;background:rgba(0,0,0,.06);border-radius:8px;color:inherit;text-decoration:none;font-size:12px;font-weight:600;margin:4px 0">📄 ' + escapeHtml(m.attachment_name || 'Document.pdf') + '</a>';
          }
        }
        var textContent = m.text ? escapeHtml(m.text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>') : '';
        html += '<div class="hc-msg ' + cls + '"><div>' + sender + attachHtml + (textContent ? '<div class="hc-msg-bubble">' + textContent + '</div>' : '') + time + '</div></div>';
      });
      container.innerHTML = html;
      container.scrollTop = container.scrollHeight;
      initVoicePlayers(container);
    };

    // Override saveMessageToSupabase to include attachment fields
    var _origSave = window.saveMessageToSupabase;
    window.saveMessageToSupabase = function (msg) {
      if (msg.attachment_url) {
        // Use our enhanced save function
        saveMsgLanding(msg);
      } else if (_origSave) {
        _origSave(msg);
      }
    };
  }

  // ─── DRAGGABLE FAB ────────────────────────────────────────────────────────
  // Allows the user to drag the bubble anywhere on screen; saves position.
  function initDrag(fab) {
    var isDragging = false;
    var wasDragged = false; // distinguish drag from click
    var startX = 0, startY = 0, fabStartX = 0, fabStartY = 0;

    function pointerDown(e) {
      if (isOpen) return; // don't drag when panel is open
      isDragging = true;
      wasDragged = false;
      var touch = e.touches ? e.touches[0] : e;
      startX = touch.clientX;
      startY = touch.clientY;
      var rect = fab.getBoundingClientRect();
      fabStartX = rect.left;
      fabStartY = rect.top;
      fab.style.transition = 'box-shadow .2s';
      e.preventDefault();
    }

    function pointerMove(e) {
      if (!isDragging) return;
      var touch = e.touches ? e.touches[0] : e;
      var dx = touch.clientX - startX;
      var dy = touch.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) wasDragged = true;
      if (!wasDragged) return;

      var newX = fabStartX + dx;
      var newY = fabStartY + dy;

      // Clamp to viewport
      var maxX = window.innerWidth - 56;
      var maxY = window.innerHeight - 56;
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      fab.style.left = newX + 'px';
      fab.style.top = newY + 'px';
      fab.style.bottom = 'auto';
      fab.style.right = 'auto';
      e.preventDefault();
    }

    function pointerUp(e) {
      if (!isDragging) return;
      isDragging = false;
      fab.style.transition = '';
      if (wasDragged) {
        // Save position
        var rect = fab.getBoundingClientRect();
        saveFabPosition(rect.left, rect.top);
        resetFadeTimer();
      } else {
        // It was a click/tap
        toggleBubble();
      }
    }

    // Mouse events
    fab.addEventListener('mousedown', pointerDown);
    document.addEventListener('mousemove', pointerMove);
    document.addEventListener('mouseup', pointerUp);

    // Touch events
    fab.addEventListener('touchstart', pointerDown, { passive: false });
    document.addEventListener('touchmove', pointerMove, { passive: false });
    document.addEventListener('touchend', pointerUp);
  }

  function saveFabPosition(x, y) {
    try { localStorage.setItem('ms_chat_fab_pos', JSON.stringify({ x: x, y: y })); } catch (e) {}
  }

  function restoreFabPosition(fab) {
    try {
      var pos = JSON.parse(localStorage.getItem('ms_chat_fab_pos'));
      if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
        // Clamp to current viewport
        var maxX = window.innerWidth - 56;
        var maxY = window.innerHeight - 56;
        var x = Math.max(0, Math.min(pos.x, maxX));
        var y = Math.max(0, Math.min(pos.y, maxY));
        fab.style.left = x + 'px';
        fab.style.top = y + 'px';
        fab.style.bottom = 'auto';
        fab.style.right = 'auto';
      }
    } catch (e) {}
  }

  // ─── AUTO-FADE ────────────────────────────────────────────────────────────
  // Fades the bubble to 25% opacity after 6 seconds of inactivity.
  var _fadeTimer = null;
  var FADE_DELAY = 6000; // 6 seconds

  function initAutoFade(fab) {
    resetFadeTimer();
    // Any page interaction resets the timer
    ['mousemove', 'touchstart', 'scroll', 'keydown'].forEach(function (evt) {
      document.addEventListener(evt, function () {
        var f = document.getElementById('cb-fab');
        if (f && f.classList.contains('cb-faded')) {
          f.classList.remove('cb-faded');
        }
        resetFadeTimer();
      }, { passive: true });
    });
  }

  function resetFadeTimer() {
    if (_fadeTimer) clearTimeout(_fadeTimer);
    _fadeTimer = setTimeout(function () {
      var fab = document.getElementById('cb-fab');
      if (fab && !isOpen) {
        fab.classList.add('cb-faded');
      }
    }, FADE_DELAY);
  }

  // ─── INIT ─────────────────────────────────────────────────────────────────
  function init() {
    loadLocal();
    syncFromLandingHC();
    injectCSS();
    buildDOM();
    updateBadge();

    // Start polling
    pollAdminReplies();
    pollTimer = setInterval(pollAdminReplies, POLL_INTERVAL);

    // Also persist candidate name to localStorage for cross-session identity
    var fullName = sessionStorage.getItem('CANDIDATE_FULL_NAME');
    if (fullName) localStorage.setItem('ms_candidate_name', fullName);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
