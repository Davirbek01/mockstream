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
  var HC_COMMUNITY_ENABLED = true;
  var HC_COMMUNITY_TEXT_ENABLED = true;
  var HC_COMMUNITY_VOICE_ENABLED = true;
  var HC_COMMUNITY_IMAGE_ENABLED = true;
  var HC_COMMUNITY_PDF_ENABLED = true;
  var HC_PRIVATE_ENABLED = true;
  var HC_PRIVATE_TEXT_ENABLED = true;
  var HC_PRIVATE_VOICE_ENABLED = true;
  var HC_PRIVATE_IMAGE_ENABLED = true;
  var HC_PRIVATE_PDF_ENABLED = true;
  var HC_DICT_ENABLED = true;
  var HC_DICT_TEXT = true;
  var HC_DICT_VOICE = false;
  var HC_DICT_IMAGE = false;
  var HC_AI_MODEL = 'gemini';
  var HC_DICT_AI_MODEL = 'gemini';

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
    // Community settings from localStorage
    var ce = localStorage.getItem('ms_hc_community_enabled');
    var ct = localStorage.getItem('ms_hc_community_text_enabled');
    var cv = localStorage.getItem('ms_hc_community_voice_enabled');
    var ci = localStorage.getItem('ms_hc_community_image_enabled');
    var cpdf = localStorage.getItem('ms_hc_community_pdf_enabled');
    if (ce !== null) HC_COMMUNITY_ENABLED = ce !== 'false';
    if (ct !== null) HC_COMMUNITY_TEXT_ENABLED = ct !== 'false';
    if (cv !== null) HC_COMMUNITY_VOICE_ENABLED = cv !== 'false';
    if (ci !== null) HC_COMMUNITY_IMAGE_ENABLED = ci !== 'false';
    if (cpdf !== null) HC_COMMUNITY_PDF_ENABLED = cpdf !== 'false';

    // Private settings from localStorage
    var pe = localStorage.getItem('ms_hc_private_enabled');
    var pt = localStorage.getItem('ms_hc_private_text_enabled');
    var pv = localStorage.getItem('ms_hc_private_voice_enabled');
    var pi = localStorage.getItem('ms_hc_private_image_enabled');
    var ppdf = localStorage.getItem('ms_hc_private_pdf_enabled');
    if (pe !== null) HC_PRIVATE_ENABLED = pe !== 'false';
    if (pt !== null) HC_PRIVATE_TEXT_ENABLED = pt !== 'false';
    if (pv !== null) HC_PRIVATE_VOICE_ENABLED = pv !== 'false';
    if (pi !== null) HC_PRIVATE_IMAGE_ENABLED = pi !== 'false';
    if (ppdf !== null) HC_PRIVATE_PDF_ENABLED = ppdf !== 'false';

    // Dictionary & AI model settings from localStorage
    var de = localStorage.getItem('ms_hc_dict_enabled');
    var dt = localStorage.getItem('ms_hc_dict_text');
    var dv = localStorage.getItem('ms_hc_dict_voice');
    var di = localStorage.getItem('ms_hc_dict_image');
    var aim = localStorage.getItem('ms_hc_ai_model');
    var daim = localStorage.getItem('ms_hc_dict_ai_model');
    if (de !== null) HC_DICT_ENABLED = de !== 'false';
    if (dt !== null) HC_DICT_TEXT = dt !== 'false';
    if (dv !== null) HC_DICT_VOICE = dv === 'true';
    if (di !== null) HC_DICT_IMAGE = di === 'true';
    if (aim) HC_AI_MODEL = aim;
    if (daim) HC_DICT_AI_MODEL = daim;

    // Background refresh from Supabase
    try {
      fetch(SB_URL + '/rest/v1/site_settings?key=in.(hc_text_enabled,hc_voice_enabled,hc_image_enabled,hc_pdf_enabled,hc_max_image_mb,hc_max_pdf_mb,hc_max_ai_inline_mb,hc_max_voice_sec,hc_community_enabled,hc_community_text_enabled,hc_community_voice_enabled,hc_community_image_enabled,hc_community_pdf_enabled,hc_private_enabled,hc_private_text_enabled,hc_private_voice_enabled,hc_private_image_enabled,hc_private_pdf_enabled,hc_dict_enabled,hc_dict_text,hc_dict_voice,hc_dict_image,hc_ai_model,hc_dict_ai_model)&select=key,value', {
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
        if ('hc_community_enabled' in map) { HC_COMMUNITY_ENABLED = map.hc_community_enabled !== 'false'; localStorage.setItem('ms_hc_community_enabled', map.hc_community_enabled); }
        if ('hc_community_text_enabled' in map) { HC_COMMUNITY_TEXT_ENABLED = map.hc_community_text_enabled !== 'false'; localStorage.setItem('ms_hc_community_text_enabled', map.hc_community_text_enabled); }
        if ('hc_community_voice_enabled' in map) { HC_COMMUNITY_VOICE_ENABLED = map.hc_community_voice_enabled !== 'false'; localStorage.setItem('ms_hc_community_voice_enabled', map.hc_community_voice_enabled); }
        if ('hc_community_image_enabled' in map) { HC_COMMUNITY_IMAGE_ENABLED = map.hc_community_image_enabled !== 'false'; localStorage.setItem('ms_hc_community_image_enabled', map.hc_community_image_enabled); }
        if ('hc_community_pdf_enabled' in map) { HC_COMMUNITY_PDF_ENABLED = map.hc_community_pdf_enabled !== 'false'; localStorage.setItem('ms_hc_community_pdf_enabled', map.hc_community_pdf_enabled); }
        if ('hc_private_enabled' in map) { HC_PRIVATE_ENABLED = map.hc_private_enabled !== 'false'; localStorage.setItem('ms_hc_private_enabled', map.hc_private_enabled); }
        if ('hc_private_text_enabled' in map) { HC_PRIVATE_TEXT_ENABLED = map.hc_private_text_enabled !== 'false'; localStorage.setItem('ms_hc_private_text_enabled', map.hc_private_text_enabled); }
        if ('hc_private_voice_enabled' in map) { HC_PRIVATE_VOICE_ENABLED = map.hc_private_voice_enabled !== 'false'; localStorage.setItem('ms_hc_private_voice_enabled', map.hc_private_voice_enabled); }
        if ('hc_private_image_enabled' in map) { HC_PRIVATE_IMAGE_ENABLED = map.hc_private_image_enabled !== 'false'; localStorage.setItem('ms_hc_private_image_enabled', map.hc_private_image_enabled); }
        if ('hc_private_pdf_enabled' in map) { HC_PRIVATE_PDF_ENABLED = map.hc_private_pdf_enabled !== 'false'; localStorage.setItem('ms_hc_private_pdf_enabled', map.hc_private_pdf_enabled); }
        if ('hc_dict_enabled' in map) { HC_DICT_ENABLED = map.hc_dict_enabled !== 'false'; localStorage.setItem('ms_hc_dict_enabled', map.hc_dict_enabled); }
        if ('hc_dict_text' in map) { HC_DICT_TEXT = map.hc_dict_text !== 'false'; localStorage.setItem('ms_hc_dict_text', map.hc_dict_text); }
        if ('hc_dict_voice' in map) { HC_DICT_VOICE = map.hc_dict_voice === 'true'; localStorage.setItem('ms_hc_dict_voice', map.hc_dict_voice); }
        if ('hc_dict_image' in map) { HC_DICT_IMAGE = map.hc_dict_image === 'true'; localStorage.setItem('ms_hc_dict_image', map.hc_dict_image); }
        if ('hc_dict_text' in map) { HC_DICT_TEXT = map.hc_dict_text !== 'false'; localStorage.setItem('ms_hc_dict_text', map.hc_dict_text); }
        if ('hc_dict_voice' in map) { HC_DICT_VOICE = map.hc_dict_voice === 'true'; localStorage.setItem('ms_hc_dict_voice', map.hc_dict_voice); }
        if ('hc_dict_image' in map) { HC_DICT_IMAGE = map.hc_dict_image === 'true'; localStorage.setItem('ms_hc_dict_image', map.hc_dict_image); }
        if ('hc_ai_model' in map) { HC_AI_MODEL = map.hc_ai_model; localStorage.setItem('ms_hc_ai_model', map.hc_ai_model); }
        if ('hc_dict_ai_model' in map) { HC_DICT_AI_MODEL = map.hc_dict_ai_model; localStorage.setItem('ms_hc_dict_ai_model', map.hc_dict_ai_model); }
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
    // Community tab button visibility
    var communityBtn = document.querySelector('.cb-cat-btn[data-cat="community"]');
    if (communityBtn) communityBtn.style.display = HC_COMMUNITY_ENABLED ? '' : 'none';
    // If community is hidden and currently active, switch to support
    if (!HC_COMMUNITY_ENABLED && currentCategory === 'community') {
      switchCategory('support');
    }
    // Private tab button visibility
    var privateBtn = document.querySelector('.cb-cat-btn[data-cat="private"]');
    if (privateBtn) privateBtn.style.display = HC_PRIVATE_ENABLED ? '' : 'none';
    if (!HC_PRIVATE_ENABLED && currentCategory === 'private') {
      switchCategory('support');
    }
    // Dictionary tab button visibility
    var dictBtn = document.querySelector('.cb-cat-btn[data-cat="dictionary"]');
    if (dictBtn) dictBtn.style.display = HC_DICT_ENABLED ? '' : 'none';
    if (!HC_DICT_ENABLED && currentCategory === 'dictionary') {
      switchCategory('support');
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
  var messages = { support: [], premium: [], partner: [], private: [] };
  var lastSeenAdmin = { support: 0, premium: 0, partner: 0, private: 0 };
  var isOpen = false;
  var isSending = false;
  var pollTimer = null;
  var _geminiKey = null;
  var _globalMsg = null; // { text, sent_at }

  // ─── COMMUNITY STATE ──────────────────────────────────────────────────────
  var _communityMessages = [];      // [{id, content, sender_name, device_id, role, parent_id, created_at}]
  var _communityLastPoll = 0;
  var _communityReplyTo = null;     // message id being replied to
  var _communityLoaded = false;
  var _communityLastSeenId = 0;  // highest community message ID the user has seen
  var _communityBlockedUsers = [];  // array of blocked device_id strings

  // ─── ADMIN ROLE CACHE ──────────────────────────────────────────────────────
  var _communityUserRole = null;    // null = unchecked, 'user', 'admin', 'super_admin'
  var _communityRoleChecked = false;
  var _communityAdminUnlocked = false; // passcode-gated admin features in community

  async function _checkCommunityRole() {
    if (_communityRoleChecked) return _communityUserRole || 'user';
    _communityRoleChecked = true;
    var email = localStorage.getItem('ms_admin_email') || localStorage.getItem('ms_vip_email') || '';
    if (!email) { _communityUserRole = 'user'; return 'user'; }
    try {
      var resp = await sbFetch('/rest/v1/premium_emails?email=eq.' + encodeURIComponent(email) + '&active=eq.true&role=eq.admin&select=email,role,center');
      var rows = await resp.json();
      if (Array.isArray(rows) && rows.length) {
        var row = rows[0];
        _communityUserRole = (!row.center || row.center === '') ? 'super_admin' : 'admin';
      } else {
        _communityUserRole = 'user';
      }
    } catch(e) { _communityUserRole = 'user'; }
    return _communityUserRole;
  }

  // ─── BLOCKED USERS ────────────────────────────────────────────────────────
  async function _fetchBlockedUsers() {
    try {
      var resp = await sbFetch('/rest/v1/site_settings?key=eq.hc_blocked_users&select=value');
      var rows = await resp.json();
      if (Array.isArray(rows) && rows.length && rows[0].value) {
        _communityBlockedUsers = JSON.parse(rows[0].value);
      }
    } catch (e) { console.warn('[Community] Failed to load blocked users:', e); }
  }

  async function _saveBlockedUsers() {
    try {
      var val = JSON.stringify(_communityBlockedUsers);
      var patchResp = await sbFetch('/rest/v1/site_settings?key=eq.hc_blocked_users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify({ value: val, updated_at: new Date().toISOString() })
      });
      var patchData = await patchResp.json();
      if (!patchData || patchData.length === 0) {
        await sbFetch('/rest/v1/site_settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify({ key: 'hc_blocked_users', value: val })
        });
      }
    } catch (e) { console.warn('[Community] Failed to save blocked users:', e); }
  }

  async function _toggleBlockUser(deviceId, senderName) {
    var idx = _communityBlockedUsers.indexOf(deviceId);
    var action = idx >= 0 ? 'unblock' : 'block';
    var confirmMsg = action === 'block'
      ? 'Block "' + senderName + '" from sending messages?'
      : 'Unblock "' + senderName + '"?';
    if (!confirm(confirmMsg)) return;
    if (action === 'block') {
      _communityBlockedUsers.push(deviceId);
    } else {
      _communityBlockedUsers.splice(idx, 1);
    }
    await _saveBlockedUsers();
    renderCommunityMessages();
  }

  async function _deleteCommunityMsg(msgId) {
    if (!confirm('Delete this message?')) return;
    try {
      var resp = await fetch(SB_URL + '/rest/v1/community_messages?id=eq.' + msgId, {
        method: 'DELETE',
        headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Prefer': 'return=minimal' }
      });
      if (!resp.ok) throw new Error('Delete failed');
      _communityMessages = _communityMessages.filter(function(m) { return String(m.id) !== String(msgId); });
      renderCommunityMessages();
    } catch (e) {
      console.error('Delete community msg error:', e);
      alert('Failed to delete message.');
    }
  }

  function _startPrivateDM(targetDeviceId, targetName, msgContent) {
    // Close chat bubble and open the Private Messages admin panel
    closeBubble();
    // Store the quoted community message for display in PM panel
    window._pmDmQuote = { name: targetName, content: msgContent || '' };
    // If openPrivateMessagesPanel exists (landing.html), open it and expand the conversation
    if (typeof window.openPrivateMessagesPanel === 'function') {
      window.openPrivateMessagesPanel().then(function() {
        // After loading, expand the conversation for this device (conversation_id = deviceId_private)
        setTimeout(function() {
          if (typeof window._pmExpandConv === 'function') {
            window._pmExpandConv(targetDeviceId + '_private', targetName);
          }
        }, 300);
      });
    }
  }

  function _isUserBlocked(deviceId) {
    return _communityBlockedUsers.indexOf(deviceId) >= 0;
  }

  // ─── REALTIME STATE ───────────────────────────────────────────────────────
  var _sbClient = null;            // Supabase JS client (loaded dynamically)
  var _realtimeChannel = null;     // Realtime channel for community_messages
  var _typingChannel = null;       // Broadcast channel for typing indicators
  var _typingUsers = {};           // { deviceId: { name, timestamp } }
  var _typingTimer = null;         // debounce timer for sending typing events
  var _typingDisplayTimer = null;  // interval to clean up stale typing indicators
  var _communityJumpSeenId = 0;  // highest reply-to-me ID acknowledged via jump bar

  // Load from localStorage
  try { _communityLastSeenId = parseInt(localStorage.getItem('ms_community_last_seen_id')) || 0; } catch(e) {}
  try { _communityJumpSeenId = parseInt(localStorage.getItem('ms_community_jump_seen_id')) || 0; } catch(e) {}

  // Count unread community messages (all messages with id > lastSeenId, excluding own)
  function _getCommunityUnreadCount() {
    var myDevice = getDeviceId();
    var count = 0;
    _communityMessages.forEach(function(m) {
      if (m.id > _communityLastSeenId && m.device_id !== myDevice) count++;
    });
    return count;
  }

  // Update the badge on the Community tab button
  function _updateCommunityBadge() {
    var unseen = _getCommunityUnreadCount();
    // Tab badge
    var btn = document.querySelector('.cb-cat-btn[data-cat="community"]');
    if (btn) {
      var badge = btn.querySelector('.cb-comm-badge');
      if (unseen > 0) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'cb-comm-badge';
          btn.appendChild(badge);
        }
        badge.textContent = unseen > 99 ? '99+' : unseen;
        badge.style.display = '';
      } else if (badge) {
        badge.style.display = 'none';
      }
    }
    // Also update the main FAB badge (combines support + community)
    updateBadge();
  }

  // Mark all community messages as seen (called when viewing community tab)
  function _markCommunityAllSeen() {
    if (!_communityMessages.length) return;
    var maxId = 0;
    _communityMessages.forEach(function(m) { if (m.id > maxId) maxId = m.id; });
    if (maxId > _communityLastSeenId) {
      _communityLastSeenId = maxId;
      try { localStorage.setItem('ms_community_last_seen_id', String(maxId)); } catch(e) {}
    }
    _updateCommunityBadge();
  }

  // Show/hide the "@" jump bar above input when there are replies to my messages
  function _updateCommunityJumpBar(myDevice) {
    var bar = document.getElementById('cb-comm-jump-bar');
    if (!bar) return;

    // Find my root message IDs
    var myMsgIds = {};
    _communityMessages.forEach(function(m) { if (m.device_id === myDevice && !m.parent_id) myMsgIds[String(m.id)] = true; });

    // Collect only UNSEEN replies to my messages (from others)
    var unseenReplies = [];
    _communityMessages.forEach(function(m) {
      if (m.parent_id && myMsgIds[String(m.parent_id)] && m.device_id !== myDevice && m.id > _communityJumpSeenId) {
        unseenReplies.push(m);
      }
    });

    if (!unseenReplies.length) {
      bar.style.display = 'none';
      return;
    }

    // Get the latest unseen reply-to-me
    var latest = unseenReplies[unseenReplies.length - 1];
    var name = latest.sender_name || 'Someone';
    var count = unseenReplies.length;

    bar.style.display = 'flex';
    bar.innerHTML =
      '<span class="cb-jump-icon">@</span>' +
      '<span class="cb-jump-text">' + (count === 1
        ? escapeHtml(name) + ' replied to you'
        : count + ' new replies to your messages') +
      ' ↓</span>';

    bar.onclick = function() {
      // Mark all current replies-to-me as seen
      var maxReplyId = 0;
      unseenReplies.forEach(function(r) { if (r.id > maxReplyId) maxReplyId = r.id; });
      if (maxReplyId > _communityJumpSeenId) {
        _communityJumpSeenId = maxReplyId;
        try { localStorage.setItem('ms_community_jump_seen_id', String(maxReplyId)); } catch(e) {}
      }
      // Hide the jump bar immediately
      bar.style.display = 'none';
      // Scroll to the latest reply
      var list = document.getElementById('cb-messages');
      if (!list) return;
      var target = list.querySelector('.cb-comm-msg[data-msg-id="' + latest.id + '"]');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Flash highlight
        target.style.transition = 'box-shadow .2s';
        target.style.boxShadow = 'inset 0 0 0 2px rgba(139,92,246,.7), 0 0 12px rgba(139,92,246,.3)';
        target.style.borderRadius = '14px';
        setTimeout(function() {
          target.style.boxShadow = '';
          if (!target.classList.contains('cb-comm-reply-to-me')) target.style.borderRadius = '';
        }, 1500);
      }
    };
  }

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
      ['support', 'premium', 'partner', 'private'].forEach(function (c) {
        trimmed[c] = (messages[c] || []).slice(-50);
      });
      localStorage.setItem('ms_chat_bubble', JSON.stringify({ messages: trimmed, lastSeenAdmin: lastSeenAdmin }));
      // Also write to landing page Help Center format for bi-directional sync
      var hcFormat = {};
      ['support', 'premium', 'partner', 'private'].forEach(function (c) {
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

  // ─── POLL FOR GLOBAL ANNOUNCEMENT ─────────────────────────────────────────
  function _getSeenAnnouncement() {
    try { return localStorage.getItem('ms_global_msg_seen') || ''; } catch(e) { return ''; }
  }
  function _markAnnouncementSeen() {
    if (_globalMsg && _globalMsg.sent_at) {
      try { localStorage.setItem('ms_global_msg_seen', _globalMsg.sent_at); } catch(e) {}
    }
  }
  function _hasUnseenAnnouncement() {
    return _globalMsg && _globalMsg.text && _globalMsg.sent_at && _globalMsg.sent_at !== _getSeenAnnouncement();
  }

  async function pollGlobalMessage() {
    try {
      var resp = await sbFetch('/rest/v1/site_settings?key=eq.global_message&select=value');
      var rows = await resp.json();
      if (rows && rows.length && rows[0].value) {
        var parsed = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
        if (parsed && parsed.text) {
          var oldSentAt = _globalMsg ? _globalMsg.sent_at : null;
          _globalMsg = parsed;
          // New announcement the user hasn't seen yet
          if (_hasUnseenAnnouncement() && parsed.sent_at !== oldSentAt) {
            if (isOpen) {
              renderMessages();
              _markAnnouncementSeen();
            } else {
              showGlobalToast(parsed.text);
              updateBadge();
            }
          }
          return;
        }
      }
      _globalMsg = null;
      if (isOpen) renderMessages();
    } catch (e) {}
  }

  function updateGlobalBanner() {
    var banner = document.getElementById('cb-global-banner');
    if (!banner) return;
    if (_globalMsg && _globalMsg.text) {
      banner.innerHTML = '<div class="cb-global-announce">' +
        '<div class="cb-global-announce-icon">📢</div>' +
        '<div class="cb-global-announce-body">' +
        '<div class="cb-global-announce-label">Announcement</div>' +
        '<div class="cb-global-announce-text">' + escapeHtml(_globalMsg.text) + '</div>' +
        '</div></div>';
      banner.style.display = '';
    } else {
      banner.innerHTML = '';
      banner.style.display = 'none';
    }
  }

  function showGlobalToast(text) {
    var existing = document.getElementById('cb-toast-global');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.id = 'cb-toast-global';
    toast.style.cssText = 'position:fixed;bottom:90px;left:24px;z-index:99999;animation:cb-slideIn .3s ease';
    toast.innerHTML = '<div class="cb-toast-inner" style="border-left-color:#f59e0b;cursor:pointer">' +
      '<span class="cb-toast-icon">📢</span>' +
      '<div class="cb-toast-body"><div class="cb-toast-title" style="color:#d97706">Announcement</div>' +
      '<div class="cb-toast-text">' + escapeHtml(text) + '</div></div>' +
      '<button class="cb-toast-close" onclick="this.closest(\&#39;#cb-toast-global\&#39;).remove()">✕</button></div>';
    toast.querySelector('.cb-toast-inner').addEventListener('click', function(e) {
      if (e.target.closest('.cb-toast-close')) return;
      toast.remove();
      openBubble();
    });
    document.body.appendChild(toast);
    setTimeout(function () { if (toast.parentNode) toast.classList.add('cb-toast-hide'); }, 10000);
    setTimeout(function () { if (toast.parentNode) toast.remove(); }, 10500);
  }

  // ─── POLL FOR ADMIN REPLIES ───────────────────────────────────────────────
  async function pollAdminReplies() {
    var gotNew = false;
    var cats = ['support', 'premium', 'partner', 'private'];
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
    ['support', 'premium', 'partner', 'private'].forEach(function (c) {
      var adminMsgs = (messages[c] || []).filter(function (m) { return m.role === 'admin'; });
      if (adminMsgs.length > (lastSeenAdmin[c] || 0)) count += adminMsgs.length - (lastSeenAdmin[c] || 0);
    });
    if (_hasUnseenAnnouncement()) count += 1;
    // Include community unread in FAB badge
    count += _getCommunityUnreadCount();
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
    ['support', 'premium', 'partner', 'private'].forEach(function (c) {
      lastSeenAdmin[c] = (messages[c] || []).filter(function (m) { return m.role === 'admin'; }).length;
    });
    _markAnnouncementSeen();
    saveLocal();
    updateBadge();
  }

  // ─── TOAST NOTIFICATION ───────────────────────────────────────────────────
  function showToast() {
    // Find the latest admin message
    var latest = null;
    ['support', 'premium', 'partner', 'private'].forEach(function (c) {
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
      partner: '🤝 Hello! Looking to <strong>partner with us</strong>? Tell me about your organization and we\'ll get in touch.',
      private: '✉️ Hi! Send a <strong>private message</strong> directly to our admins. They\'ll reply here as soon as possible.'
    };
    var welcomeHtml = welcomes[currentCategory] || welcomes.support;
    var html = '';

    // Update pinned global announcement banner (outside scrollable area)
    updateGlobalBanner();

    html += '<div class="cb-msg cb-msg-ai"><div class="cb-msg-text">' + welcomeHtml + '</div></div>';

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

    // Community mode — different path
    if (currentCategory === 'community') {
      return sendCommunityMessage(text);
    }

    // Dictionary mode — different path
    if (currentCategory === 'dictionary') {
      return _sendDictLookup(text);
    }

    // Private mode — save to Supabase, no AI reply
    if (currentCategory === 'private') {
      if (!HC_PRIVATE_TEXT_ENABLED) { alert('Text messages are currently disabled by the admin.'); return; }
      isSending = true;
      input.disabled = true;
      var timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Check if admin is DM-ing a specific user from Community tab
      var dmTarget = window._privateDmTarget;
      if (dmTarget) {
        // Admin sending DM to a specific user
        var body = {
          conversation_id: dmTarget.deviceId + '_private',
          role: 'admin',
          sender_name: getSenderName(),
          content: text,
          category: 'private',
          center: getCenter(),
          device_id: 'admin_bubble'
        };
        try {
          await sbFetch('/rest/v1/support_messages', {
            method: 'POST',
            headers: { 'Prefer': 'return=minimal' },
            body: JSON.stringify(body)
          });
        } catch (e) { console.warn('[Private DM] Send error:', e); }
        var adminMsg = { role: 'user', text: '✉️ DM to ' + dmTarget.name + ': ' + text, category: 'private', time: timeStr };
        messages.private.push(adminMsg);
        renderMessages();
        saveLocal();
        input.value = '';
        window._privateDmTarget = null;
        if (input) input.placeholder = 'Send a private message to admin...';
      } else {
        // Regular user sending private message
        var userMsg = { role: 'user', text: text, category: 'private', time: timeStr };
        messages.private.push(userMsg);
        renderMessages();
        saveLocal();
        input.value = '';
        saveMsg(userMsg);
      }

      isSending = false;
      input.disabled = false;
      input.focus();
      return;
    }

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
    var imgOn, pdfOn;
    if (currentCategory === 'community') {
      imgOn = HC_COMMUNITY_IMAGE_ENABLED; pdfOn = HC_COMMUNITY_PDF_ENABLED;
    } else if (currentCategory === 'private') {
      imgOn = HC_PRIVATE_IMAGE_ENABLED; pdfOn = HC_PRIVATE_PDF_ENABLED;
    } else if (currentCategory === 'dictionary') {
      imgOn = HC_DICT_IMAGE; pdfOn = false;
    } else {
      imgOn = HC_IMAGE_ENABLED; pdfOn = HC_PDF_ENABLED;
    }
    if (imgOn) acceptParts.push('image/*');
    if (pdfOn) acceptParts.push('application/pdf');
    if (!acceptParts.length) { alert('File attachments are currently disabled by the admin.'); return; }
    fileInput.accept = acceptParts.join(',');
    fileInput.onchange = async function () {
      var file = fileInput.files[0];
      if (!file) return;
      var validation = validateAttachmentFile(file);
      if (!validation.ok) { alert(validation.message); return; }

      var type = validation.type;
      var prefix = type === 'image' ? 'img' : 'doc';

      // ─── Dictionary tab: extract text from image via AI, then look up ───
      if (currentCategory === 'dictionary') {
        _dictHistory.push({ role: 'user', html: '<div style="color:#64748b;font-size:12px;">📎 <em>' + escapeHtml(file.name) + '</em></div>' });
        _dictHistory.push({ role: 'ai', html: '<div style="color:#64748b;font-size:12px;font-style:italic;">⏳ Reading image…</div>' });
        _renderDictionary();
        try {
          var b64 = await blobToBase64(file);
          var mimeType = file.type || 'image/jpeg';
          var key = await _fetchAiKey('gemini');
          if (!key) throw new Error('No API key');
          var r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + key, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [
                { inline_data: { mime_type: mimeType, data: b64 } },
                { text: 'Extract the single English or Uzbek word or short phrase shown in this image. Reply with ONLY the word or phrase, nothing else.' }
              ]}]
            })
          });
          var j = await r.json();
          var extracted = '';
          if (j.candidates && j.candidates[0]) extracted = j.candidates[0].content.parts[0].text.trim();
          _dictHistory.pop(); _dictHistory.pop();
          _renderDictionary();
          if (extracted) {
            _sendDictLookup(extracted);
          } else {
            _dictHistory.push({ role: 'ai', html: '<div style="color:#ef4444;font-size:12px;">⚠️ Could not read any word from the image.</div>' });
            _renderDictionary();
          }
        } catch (e) {
          _dictHistory.pop(); _dictHistory.pop();
          _dictHistory.push({ role: 'ai', html: '<div style="color:#ef4444;font-size:12px;">⚠️ Failed to process image.</div>' });
          _renderDictionary();
        }
        return;
      }

      // ─── Community tab: upload file and send as community message ───
      if (currentCategory === 'community') {
        var url = await uploadToStorage(file, prefix);
        if (url) {
          await sendCommunityMessage('', { url: url, type: type, name: file.name });
        } else {
          alert('Upload failed. Please try again.');
        }
        return;
      }

      // ─── Private tab: upload file and save to support_messages, no AI ───
      if (currentCategory === 'private') {
        var pendingMsg = { role: 'user', text: '', category: 'private', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), _loading: 'Uploading ' + file.name + '…' };
        messages.private.push(pendingMsg);
        renderMessages();
        var url = await uploadToStorage(file, prefix);
        messages.private.pop();
        if (url) {
          var msg = { role: 'user', text: '', category: 'private', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), attachment_url: url, attachment_type: type, attachment_name: file.name };
          messages.private.push(msg);
          renderMessages();
          saveLocal();
          saveMsg(msg);
        } else {
          alert('Upload failed. Please try again.');
        }
        return;
      }

      // ─── Support/Premium/Partner: existing AI-powered flow ───
      if (!(await confirmAttachmentAiUsage(file, type))) return;

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
    var voiceOn = currentCategory === 'community' ? HC_COMMUNITY_VOICE_ENABLED : currentCategory === 'private' ? HC_PRIVATE_VOICE_ENABLED : currentCategory === 'dictionary' ? HC_DICT_VOICE : HC_VOICE_ENABLED;
    if (!voiceOn) { alert('Voice messages are currently disabled by the admin.'); return; }
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

      var file = new File([blob], 'voice_' + Date.now() + '.webm', { type: mime || 'audio/webm' });
      var timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // ─── Dictionary tab: transcribe voice and look up the word ───
      if (currentCategory === 'dictionary') {
        _dictHistory.push({ role: 'user', html: '<div style="color:#64748b;font-size:12px;">🎤 <em>Voice message</em></div>' });
        _dictHistory.push({ role: 'ai', html: '<div style="color:#64748b;font-size:12px;font-style:italic;">⏳ Transcribing…</div>' });
        _renderDictionary();
        try {
          var b64 = await blobToBase64(blob);
          var mimeType = blob.type || 'audio/webm';
          var key = await _fetchAiKey('gemini');
          if (!key) throw new Error('No API key');
          var r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + key, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [
                { inline_data: { mime_type: mimeType, data: b64 } },
                { text: 'The user said a single English or Uzbek word or short phrase. Transcribe ONLY the word or phrase they said, nothing else. No punctuation, no quotes.' }
              ]}]
            })
          });
          var j = await r.json();
          var transcribed = '';
          if (j.candidates && j.candidates[0]) transcribed = j.candidates[0].content.parts[0].text.trim();
          _dictHistory.pop(); _dictHistory.pop();
          _renderDictionary();
          if (transcribed) {
            _sendDictLookup(transcribed);
          } else {
            _dictHistory.push({ role: 'ai', html: '<div style="color:#ef4444;font-size:12px;">⚠️ Could not understand the voice message.</div>' });
            _renderDictionary();
          }
        } catch (e) {
          _dictHistory.pop(); _dictHistory.pop();
          _dictHistory.push({ role: 'ai', html: '<div style="color:#ef4444;font-size:12px;">⚠️ Failed to transcribe voice.</div>' });
          _renderDictionary();
        }
        return;
      }

      // ─── Community tab: upload voice and send as community message ───
      if (currentCategory === 'community') {
        var url = await uploadToStorage(file, 'voice');
        if (url) {
          await sendCommunityMessage('', { url: url, type: 'voice', name: file.name });
        } else {
          alert('Voice upload failed. Please try again.');
        }
        return;
      }

      // ─── Private tab: upload voice and save to support_messages, no AI ───
      if (currentCategory === 'private') {
        var pendingMsg = { role: 'user', text: '', category: 'private', time: timeStr, _loading: 'Sending voice…' };
        messages.private.push(pendingMsg);
        renderMessages();
        var url = await uploadToStorage(file, 'voice');
        messages.private.pop();
        if (url) {
          var msg = { role: 'user', text: '', category: 'private', time: timeStr, attachment_url: url, attachment_type: 'voice', attachment_name: file.name };
          messages.private.push(msg);
          renderMessages();
          saveLocal();
          saveMsg(msg);
        } else {
          alert('Voice upload failed. Please try again.');
        }
        return;
      }

      // ─── Support/Premium/Partner: existing AI-powered flow ───
      var pendingMsg = { role: 'user', text: '', time: timeStr, _loading: 'Sending voice…' };
      messages[currentCategory].push(pendingMsg);
      renderMessages();

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
  // Track whether we exited fullscreen so we can restore it
  var _wasFullscreen = false;

  function _exitFullscreenForChat() {
    try {
      var doc = window.top ? window.top.document : document;
      var fsEl = doc.fullscreenElement || doc.webkitFullscreenElement;
      if (fsEl) {
        _wasFullscreen = true;
        if (doc.exitFullscreen) doc.exitFullscreen().catch(function(){});
        else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
      } else {
        _wasFullscreen = false;
      }
    } catch (e) { _wasFullscreen = false; }
  }

  function _restoreFullscreen() {
    if (!_wasFullscreen) return;
    _wasFullscreen = false;
    try {
      var doc = window.top ? window.top.document : document;
      var elem = doc.documentElement;
      if (elem.requestFullscreen) elem.requestFullscreen().catch(function(){});
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    } catch (e) {}
  }

  function openBubble() {
    isOpen = true;
    var btn = document.getElementById('cb-fab');
    if (btn) { btn.classList.add('open'); btn.classList.remove('cb-faded'); }
    if (_fadeTimer) clearTimeout(_fadeTimer);

    // Exit fullscreen so mobile keyboard can resize viewport properly
    _exitFullscreenForChat();

    if (_isLanding) {
      // On landing page, open the existing Help Center overlay
      if (window.openHelpCenter) window.openHelpCenter();
    } else {
      // On other pages, open our overlay
      var overlay = document.getElementById('cb-overlay');
      if (overlay) {
        overlay.classList.add('active', 'cb-kb-closed');
        // Reset any leftover keyboard-adjust styles
        overlay.style.top = '';
        overlay.style.height = '';
        var container = overlay.querySelector('.cb-hc-container');
        if (container) { container.style.maxHeight = ''; container.style.marginBottom = ''; }
      }
      markSeen();
      renderMessages();
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
      if (overlay) {
        overlay.classList.remove('active', 'cb-kb-closed');
        // Reset keyboard-adjust inline styles
        overlay.style.top = '';
        overlay.style.height = '';
        var container = overlay.querySelector('.cb-hc-container');
        if (container) { container.style.maxHeight = ''; container.style.marginBottom = ''; }
      }
    }

    // Re-enter fullscreen if we exited it for the chat
    _restoreFullscreen();
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
    _communityReplyTo = null;
    var overlay = document.getElementById('cb-overlay');
    if (overlay) {
      overlay.querySelectorAll('.cb-cat-btn').forEach(function (b) {
        b.classList.toggle('active', b.dataset.cat === cat);
      });
    }
    // Show/hide admin lock button based on tab
    var lockBtn = document.getElementById('cb-comm-admin-lock');
    if (lockBtn) {
      lockBtn.style.display = (cat === 'community') ? '' : 'none';
      lockBtn.textContent = _communityAdminUnlocked ? '🔓' : '🔒';
      lockBtn.style.opacity = _communityAdminUnlocked ? '1' : '.6';
    }
    // Show/hide input bar elements based on tab
    var inputBar = overlay && overlay.querySelector('.cb-input-bar');
    var attachBtn = overlay && overlay.querySelector('.cb-attach-btn');
    var voiceBtn = document.getElementById('cb-voice-btn');
    var replyBanner = document.getElementById('cb-reply-banner');
    if (cat === 'community') {
      // Community: show/hide based on community-specific toggles
      if (attachBtn) attachBtn.style.display = (HC_COMMUNITY_IMAGE_ENABLED || HC_COMMUNITY_PDF_ENABLED) ? '' : 'none';
      if (voiceBtn) voiceBtn.style.display = HC_COMMUNITY_VOICE_ENABLED ? '' : 'none';
      if (replyBanner) replyBanner.style.display = 'none';
      _renderTypingIndicator();
      var input = document.getElementById('cb-input');
      var sendBtn = overlay && overlay.querySelector('.cb-send-btn');
      if (HC_COMMUNITY_TEXT_ENABLED) {
        if (input) { input.style.display = ''; input.placeholder = 'Write to the community...'; }
        if (sendBtn) sendBtn.style.display = '';
      } else {
        if (input) input.style.display = 'none';
        if (sendBtn) sendBtn.style.display = 'none';
      }
      if (!_communityLoaded) loadCommunityMessages();
      renderCommunityMessages();
    } else if (cat === 'dictionary') {
      // Dictionary: show/hide inputs based on admin settings
      if (attachBtn) attachBtn.style.display = HC_DICT_IMAGE ? '' : 'none';
      if (voiceBtn) voiceBtn.style.display = HC_DICT_VOICE ? '' : 'none';
      if (replyBanner) replyBanner.style.display = 'none';
      var input = document.getElementById('cb-input');
      var sendBtn = overlay && overlay.querySelector('.cb-send-btn');
      if (input) { input.style.display = HC_DICT_TEXT ? '' : 'none'; input.placeholder = 'Type a word in English or Uzbek...'; }
      if (sendBtn) sendBtn.style.display = HC_DICT_TEXT ? '' : 'none';
      var jumpBar = document.getElementById('cb-comm-jump-bar');
      if (jumpBar) jumpBar.style.display = 'none';
      var typingBar = document.getElementById('cb-typing-bar');
      if (typingBar) typingBar.style.display = 'none';
      // Load from Supabase then render
      if (!_dictLoaded) {
        _renderDictionary(); // show welcome while loading
        _loadDictFromSupabase().then(function() { _renderDictionary(); });
      } else {
        _renderDictionary();
      }
    } else if (cat === 'private') {
      // Private: show/hide based on private-specific toggles
      if (attachBtn) attachBtn.style.display = (HC_PRIVATE_IMAGE_ENABLED || HC_PRIVATE_PDF_ENABLED) ? '' : 'none';
      if (voiceBtn) voiceBtn.style.display = HC_PRIVATE_VOICE_ENABLED ? '' : 'none';
      if (replyBanner) replyBanner.style.display = 'none';
      var input = document.getElementById('cb-input');
      var sendBtn = overlay && overlay.querySelector('.cb-send-btn');
      if (HC_PRIVATE_TEXT_ENABLED) {
        if (input) { input.style.display = ''; input.placeholder = 'Send a private message to admin...'; }
        if (sendBtn) sendBtn.style.display = '';
      } else {
        if (input) input.style.display = 'none';
        if (sendBtn) sendBtn.style.display = 'none';
      }
      var jumpBar = document.getElementById('cb-comm-jump-bar');
      if (jumpBar) jumpBar.style.display = 'none';
      var typingBar = document.getElementById('cb-typing-bar');
      if (typingBar) typingBar.style.display = 'none';
      renderMessages();
    } else {
      // Restore normal visibility
      applyHcSettingsVisibility();
      var input = document.getElementById('cb-input');
      if (input) input.placeholder = 'Type your message...';
      if (replyBanner) replyBanner.style.display = 'none';
      var jumpBar = document.getElementById('cb-comm-jump-bar');
      if (jumpBar) jumpBar.style.display = 'none';
      var typingBar = document.getElementById('cb-typing-bar');
      if (typingBar) typingBar.style.display = 'none';
      renderMessages();
    }
  }

  // ─── DICTIONARY TAB ──────────────────────────────────────────────────────
  var _dictHistory = []; // { role:'user'|'ai', text/html, id? }
  var _dictSending = false;
  var _dictApiKeys = {}; // cached keys per model
  var _dictLoaded = false; // whether we've loaded from Supabase

  function _getDeviceId() {
    var id = localStorage.getItem('ms_device_id');
    if (!id) { id = 'dev_' + Math.random().toString(36).substr(2, 12); localStorage.setItem('ms_device_id', id); }
    return id;
  }

  // Save a single lookup to Supabase
  function _saveDictToSupabase(input, direction, english, uzbek, definition, example_en, example_uz, cardHtml) {
    sbFetch('/rest/v1/dict_lookups', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify({
        input: input,
        direction: direction,
        english: english,
        uzbek: uzbek,
        definition: definition || '',
        example_en: example_en || '',
        example_uz: example_uz || '',
        card_html: cardHtml,
        device_id: _getDeviceId()
      })
    }).catch(function(e) { console.warn('[Dict] Save to Supabase failed:', e); });
  }

  // Load dictionary history from Supabase
  function _loadDictFromSupabase() {
    if (_dictLoaded) return Promise.resolve();
    return sbFetch('/rest/v1/dict_lookups?device_id=eq.' + encodeURIComponent(_getDeviceId()) + '&order=created_at.asc&limit=40&select=id,input,card_html,created_at')
      .then(function(r) { return r.json(); })
      .then(function(rows) {
        _dictHistory = [];
        rows.forEach(function(row) {
          _dictHistory.push({ role: 'user', text: row.input });
          _dictHistory.push({ role: 'ai', html: row.card_html, sbId: row.id });
        });
        _dictLoaded = true;
      }).catch(function(e) {
        console.warn('[Dict] Load from Supabase failed:', e);
        _dictLoaded = true;
      });
  }

  function _renderDictionary() {
    var el = document.getElementById('cb-messages');
    if (!el) return;
    if (!_dictHistory.length) {
      el.innerHTML = '<div style="padding:16px;text-align:center;">' +
        '<div style="font-size:32px;margin-bottom:8px;">📖</div>' +
        '<div style="font-size:14px;font-weight:700;color:#1e293b;margin-bottom:4px;">English ⇄ Uzbek Dictionary</div>' +
        '<div style="font-size:12px;color:#64748b;line-height:1.5;">Type a word in English or Uzbek.<br>Get instant translation with examples.</div>' +
        '</div>';
      return;
    }
    el.innerHTML = _dictHistory.map(function(item) {
      if (item.role === 'user') {
        return '<div style="text-align:right;margin:8px 12px;"><span style="display:inline-block;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;padding:8px 14px;border-radius:16px 16px 4px 16px;font-size:13px;font-weight:600;max-width:80%;">' + _escDict(item.text) + '</span></div>';
      }
      return '<div style="margin:8px 12px;">' + item.html + '</div>';
    }).join('');
    el.scrollTop = el.scrollHeight;
  }

  function _escDict(s) { return (s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  async function _fetchAiKey(model) {
    if (_dictApiKeys[model]) return _dictApiKeys[model];
    if (model === 'gemini' && _geminiKey) { _dictApiKeys.gemini = _geminiKey; return _geminiKey; }
    try {
      var r = await fetch('https://davirbek.alwaysdata.net/key?model=' + model);
      var d = await r.json();
      if (d.key) { _dictApiKeys[model] = d.key; return d.key; }
    } catch(e) {}
    return null;
  }

  async function _callDictAI(prompt) {
    var model = HC_DICT_AI_MODEL || 'gemini';
    var key = await _fetchAiKey(model);
    if (!key) throw new Error('No API key for ' + model);

    if (model === 'gemini') {
      var r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + key, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2 }
        })
      });
      var j = await r.json();
      if (j.candidates && j.candidates[0]) return j.candidates[0].content.parts[0].text;
      throw new Error('No response');
    } else if (model === 'openai') {
      var r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], temperature: 0.2 })
      });
      var j = await r.json();
      return j.choices[0].message.content;
    } else if (model === 'claude') {
      var r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1024, messages: [{ role: 'user', content: prompt }], temperature: 0.2 })
      });
      var j = await r.json();
      return j.content[0].text;
    } else if (model === 'grok') {
      var r = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
        body: JSON.stringify({ model: 'grok-3-mini', messages: [{ role: 'user', content: prompt }], temperature: 0.2 })
      });
      var j = await r.json();
      return j.choices[0].message.content;
    } else if (model === 'deepseek') {
      var r = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
        body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'user', content: prompt }], temperature: 0.2 })
      });
      var j = await r.json();
      return j.choices[0].message.content;
    }
    throw new Error('Unknown model: ' + model);
  }

  async function _sendDictLookup(text) {
    if (_dictSending) return;
    _dictSending = true;
    var input = document.getElementById('cb-input');
    if (input) { input.value = ''; input.disabled = true; }

    _dictHistory.push({ role: 'user', text: text });
    _renderDictionary();

    // Show typing indicator
    _dictHistory.push({ role: 'ai', html: '<div style="color:#64748b;font-size:12px;font-style:italic;">⏳ Looking up...</div>' });
    _renderDictionary();

    try {
      var prompt = 'You are a bilingual English⇄Uzbek dictionary assistant. The user typed: "' + text + '"\n\n' +
        'First, detect the language of the input:\n' +
        '- If the input is in English (or looks like an English word/phrase), translate English → Uzbek\n' +
        '- If the input is in Uzbek (or looks like an Uzbek word/phrase), translate Uzbek → English\n\n' +
        'Respond with EXACTLY this JSON format (no markdown, no extra text, ONLY raw JSON):\n' +
        '{\n' +
        '  "direction": "en2uz" or "uz2en",\n' +
        '  "word": "the CORRECT input word/phrase (fix any spelling mistakes)",\n' +
        '  "misspelled": true or false,\n' +
        '  "english": "the English word/phrase",\n' +
        '  "uzbek": "the Uzbek translation/equivalent",\n' +
        '  "definition": "Brief explanation in the TARGET language, or empty string",\n' +
        '  "example_en": "One natural example sentence in English",\n' +
        '  "example_uz": "Uzbek translation of the example sentence"\n' +
        '}\n\n' +
        'Rules:\n' +
        '- direction: "en2uz" if user typed English, "uz2en" if user typed Uzbek\n' +
        '- word: the corrected version of what the user typed (in the SAME language they typed)\n' +
        '- misspelled: true if you corrected a spelling mistake, false otherwise\n' +
        '- english: always the English word/phrase\n' +
        '- uzbek: always the Uzbek word/phrase\n' +
        '- IDIOMS & PROVERBS: For idioms, proverbs, and figurative expressions, ALWAYS provide the culturally equivalent idiom/proverb in the target language, NOT a literal translation. Examples: "when pigs fly" → "tuyaning dumi yerga tekkanda", "break the ice" → "muzni eritmoq", "piece of cake" → "qo\'lning kiri bilan". If no exact equivalent exists, give the closest Uzbek/English idiom with similar meaning.\n' +
        '- definition: a SHORT explanation of the meaning in the target language (especially useful for idioms to clarify the shared meaning)\n' +
        '- example_en & example_uz: matching example sentences in both languages\n' +
        '- Respond ONLY with the JSON object, nothing else';

      var raw = await _callDictAI(prompt);
      // Parse JSON from response (strip markdown fences if any)
      var cleaned = raw.trim();
      var fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fenceMatch) cleaned = fenceMatch[1].trim();
      var data = JSON.parse(cleaned);

      var isUz2En = data.direction === 'uz2en';
      var headWord = isUz2En ? _escDict(data.uzbek) : _escDict(data.english);
      var transWord = isUz2En ? _escDict(data.english) : _escDict(data.uzbek);
      var speakWord = _escDict(data.english);

      // Build beautiful dictionary card HTML
      var html = '<div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:14px;padding:16px;max-width:100%;">';
      // Direction badge
      html += '<div style="text-align:center;margin-bottom:8px;"><span style="font-size:10px;font-weight:600;color:#fff;background:' + (isUz2En ? '#059669' : '#2563eb') + ';padding:2px 8px;border-radius:10px;letter-spacing:0.5px;">' + (isUz2En ? 'UZ → EN' : 'EN → UZ') + '</span></div>';
      // Misspelling notice
      if (data.misspelled) {
        html += '<div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:6px 10px;margin-bottom:10px;font-size:11px;color:#92400e;text-align:center;">✏️ Did you mean: <strong>' + _escDict(data.word) + '</strong>?</div>';
      }
      // Head word (what user typed, corrected)
      html += '<div style="text-align:center;margin-bottom:10px;">';
      html += '<div style="font-size:20px;font-weight:800;color:#1e293b;letter-spacing:-0.5px;">' + headWord + '</div>';
      // TTS button only for English word
      if (!isUz2En) {
        html += '<button onclick="_dictSpeak(\'' + speakWord.replace(/'/g, "\\'") + '\')" style="margin-top:4px;width:32px;height:32px;border-radius:50%;border:none;background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff;cursor:pointer;font-size:14px;display:inline-flex;align-items:center;justify-content:center;" title="Listen">🔊</button>';
      }
      html += '</div>';
      // Translation
      html += '<div style="text-align:center;margin-bottom:6px;">';
      html += '<span style="font-size:16px;font-weight:700;color:#dc2626;font-style:italic;">' + transWord + '</span>';
      // TTS button next to English translation (for uz2en)
      if (isUz2En) {
        html += ' <button onclick="_dictSpeak(\'' + speakWord.replace(/'/g, "\\'") + '\')" style="width:26px;height:26px;border-radius:50%;border:none;background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff;cursor:pointer;font-size:12px;display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;" title="Listen">🔊</button>';
      }
      if (data.definition) {
        html += '<br><span style="font-size:12px;color:#64748b;font-style:italic;">(' + _escDict(data.definition) + ')</span>';
      }
      html += '</div>';
      // Example sentence
      html += '<div style="background:#eef2ff;border-left:3px solid #dc2626;border-radius:0 8px 8px 0;padding:10px 12px;margin-top:10px;">';
      html += '<div style="font-size:13px;font-weight:700;color:#1e293b;line-height:1.5;">' + _escDict(data.example_en) + '</div>';
      html += '<div style="font-size:13px;color:#dc2626;font-style:italic;line-height:1.5;margin-top:2px;border-left:2px solid #dc2626;padding-left:8px;">' + _escDict(data.example_uz) + '</div>';
      html += '</div>';
      html += '</div>';

      // Replace typing indicator
      _dictHistory[_dictHistory.length - 1] = { role: 'ai', html: html };
      // Save to Supabase
      _saveDictToSupabase(text, data.direction || 'en2uz', data.english, data.uzbek, data.definition, data.example_en, data.example_uz, html);
    } catch(e) {
      console.warn('[Dict] AI lookup failed:', e);
      _dictHistory[_dictHistory.length - 1] = { role: 'ai', html: '<div style="color:#dc2626;font-size:13px;padding:8px 12px;background:#fef2f2;border-radius:10px;">❌ Could not translate. Please try again.</div>' };
    }

    _renderDictionary();
    _dictSending = false;
    if (input) input.disabled = false;
    if (input) input.focus();
  }

  var GTTS_SERVER_URL = 'https://english-server-p7y6.onrender.com/tts/audio';
  var _dictGttsCache = {};
  function _dictSpeak(word) {
    // Check cache first
    if (_dictGttsCache[word]) {
      _playDictBlob(_dictGttsCache[word]);
      return;
    }
    // Fetch from GTTS server (same as flashcards)
    fetch(GTTS_SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phrase: word })
    }).then(function(r) {
      if (!r.ok) throw new Error('GTTS server error');
      return r.blob();
    }).then(function(blob) {
      _dictGttsCache[word] = blob;
      _playDictBlob(blob);
    }).catch(function() {
      // Fallback to browser speech
      if ('speechSynthesis' in window) {
        var u = new SpeechSynthesisUtterance(word);
        u.lang = 'en-US'; u.rate = 0.9;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }
    });
  }
  function _playDictBlob(blob) {
    var url = URL.createObjectURL(blob);
    var a = new Audio(url);
    a.onended = function() { URL.revokeObjectURL(url); };
    a.onerror = function() { URL.revokeObjectURL(url); };
    a.play().catch(function() { URL.revokeObjectURL(url); });
  }
  // Expose to global scope for onclick in card HTML
  window._dictSpeak = _dictSpeak;

  // ─── CLEAR DATA (called from settings panel) ─────────────────────────────
  window._hcClearSupport = function() {
    messages = { support: [], premium: [], partner: [], private: [] };
    lastSeenAdmin = { support: 0, premium: 0, partner: 0, private: 0 };
    saveLocal();
    if (currentCategory === 'support' || currentCategory === 'premium' || currentCategory === 'partner' || currentCategory === 'private') renderMessages();
  };
  window._hcClearCommunity = function() {
    _communityMessages = [];
    _communityLoaded = false;
    if (currentCategory === 'community') renderCommunityMessages();
  };
  window._hcClearDictionary = function() {
    _dictHistory = [];
    _dictLoaded = false;
    if (currentCategory === 'dictionary') _renderDictionary();
  };

  // ─── SYNC WITH LANDING PAGE HELP CENTER ───────────────────────────────────
  // If the landing page Help Center also has messages, merge them
  function syncFromLandingHC() {
    try {
      var hc = JSON.parse(localStorage.getItem('ms_helpcenter_chats') || '{}');
      ['support', 'premium', 'partner', 'private'].forEach(function (cat) {
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
      #cb-overlay{display:none;position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);justify-content:center;align-items:flex-end;animation:cbHcFadeIn .25s ease}
      #cb-overlay.active{display:flex}
      #cb-overlay.cb-kb-closed{align-items:center}
      @keyframes cbHcFadeIn{from{opacity:0}to{opacity:1}}
      #cb-overlay .cb-hc-container{position:relative;width:420px;max-width:95vw;height:600px;max-height:90vh;max-height:90dvh;background:#fff;border-radius:20px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,.3);border:1px solid #e5e7eb;animation:cbHcSlideUp .3s ease}
      @keyframes cbHcSlideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
      #cb-overlay .cb-hc-header{background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);color:#fff;padding:16px 20px;display:flex;align-items:center;flex-shrink:0}
      #cb-overlay .cb-hc-close{position:absolute;top:10px;right:10px;z-index:3;background:rgba(0,0,0,0.35);border:none;color:#fff;width:32px;height:32px;border-radius:50%;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
      #cb-overlay .cb-hc-close:hover{background:rgba(0,0,0,0.55)}
      #cb-overlay .cb-hc-tabs{display:flex;gap:5px;padding:8px 12px;border-bottom:1px solid #e5e7eb;flex-shrink:0;overflow-x:auto;-webkit-overflow-scrolling:touch}
      #cb-global-banner{flex-shrink:0;padding:0}
      #cb-global-banner .cb-global-announce{margin:10px 14px 0;border-radius:12px}
      #cb-overlay .cb-cat-btn{padding:5px 10px;border-radius:20px;border:1.5px solid #e5e7eb;background:#fff;color:#1e293b;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .2s ease}
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

      /* ── Global Announcement Banner ── */
      .cb-global-announce{display:flex;gap:10px;padding:10px 14px;border-radius:14px;background:linear-gradient(135deg,#fef3c7,#fde68a);border:1.5px solid #f59e0b;margin-bottom:4px;align-items:flex-start}
      .cb-global-announce-icon{font-size:20px;flex-shrink:0;margin-top:1px}
      .cb-global-announce-body{flex:1;min-width:0}
      .cb-global-announce-label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:#92400e;margin-bottom:2px}
      .cb-global-announce-text{font-size:13px;line-height:1.45;color:#78350f;word-break:break-word}
      [data-theme="dark"] .cb-global-announce{background:linear-gradient(135deg,#451a03,#78350f);border-color:#d97706}
      [data-theme="dark"] .cb-global-announce-label{color:#fbbf24}
      [data-theme="dark"] .cb-global-announce-text{color:#fde68a}
      @media(prefers-color-scheme:dark){.cb-global-announce{background:linear-gradient(135deg,#451a03,#78350f);border-color:#d97706}.cb-global-announce-label{color:#fbbf24}.cb-global-announce-text{color:#fde68a}}

      /* ── Animations ── */
      @keyframes cb-bounce{to{transform:translateY(-4px)}}
      @keyframes cb-pulse{0%,100%{opacity:1}50%{opacity:.7}}
      @keyframes cb-slideIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

      /* ── Community Chat ── */
      .cb-comm-msg{display:flex;flex-direction:column;max-width:88%;animation:cbHcFadeIn .15s ease;touch-action:pan-y;-webkit-user-select:none;user-select:none;will-change:transform}
      .cb-comm-mine{align-self:flex-end}
      .cb-comm-other,.cb-comm-admin{align-self:flex-start}
      .cb-swipe-arrow{position:absolute;right:10px;width:30px;height:30px;border-radius:50%;background:rgba(99,102,241,.2);display:flex;align-items:center;justify-content:center;color:#6366f1;font-size:15px;opacity:0;pointer-events:none;z-index:0;transition:transform .12s,opacity .12s}
      .cb-swipe-arrow.cb-swipe-ready{background:rgba(99,102,241,.4);color:#4f46e5}
      .cb-comm-reply-quote{background:rgba(99,102,241,.1);border-left:3px solid #6366f1;border-radius:0 8px 8px 0;padding:6px 10px;margin-bottom:4px;cursor:pointer;transition:background .15s;max-width:100%}
      .cb-comm-reply-quote:hover{background:rgba(99,102,241,.18)}
      .cb-comm-reply-quote-name{font-size:11px;font-weight:700;color:#6366f1;line-height:1.4}
      .cb-comm-reply-quote-text{font-size:12px;color:#475569;line-height:1.4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:220px}
      .cb-comm-mine .cb-comm-reply-quote{background:rgba(37,99,235,.1);border-left-color:#3b82f6}
      .cb-comm-mine .cb-comm-reply-quote-name{color:#2563eb}
      .cb-comm-mine .cb-comm-reply-quote-text{color:#475569}
      .cb-comm-name{font-size:11px;font-weight:700;color:#6366f1;margin-bottom:2px}
      .cb-comm-name-admin{color:#059669}
      .cb-comm-text{padding:8px 12px;border-radius:14px;font-size:13px;line-height:1.5;word-break:break-word}
      .cb-comm-mine .cb-comm-text{background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;border-bottom-right-radius:4px}
      .cb-comm-other .cb-comm-text{background:#f1f5f9;color:#1e293b;border-bottom-left-radius:4px}
      .cb-comm-admin .cb-comm-text{background:linear-gradient(135deg,#059669,#10b981);color:#fff;border-bottom-left-radius:4px}
      .cb-comm-admin .cb-comm-reply-quote{background:rgba(255,255,255,.18);border-left-color:rgba(255,255,255,.7)}
      .cb-comm-admin .cb-comm-reply-quote-name{color:rgba(255,255,255,.95)}
      .cb-comm-admin .cb-comm-reply-quote-text{color:rgba(255,255,255,.8)}
      .cb-comm-footer{display:flex;align-items:center;gap:8px;margin-top:3px}
      .cb-comm-time{font-size:10px;color:#94a3b8}
      .cb-comm-reply-btn{background:none;border:none;font-size:10px;color:#6366f1;cursor:pointer;padding:0;font-weight:600;opacity:.7;transition:opacity .15s}
      .cb-comm-reply-btn:hover{opacity:1}
      .cb-comm-reply-to-me{box-shadow:inset 0 0 0 1.5px rgba(139,92,246,.35);border-radius:16px;padding:4px}
      #cb-comm-jump-bar{display:none;align-items:center;justify-content:center;gap:6px;padding:7px 14px;background:linear-gradient(135deg,rgba(139,92,246,.12),rgba(99,102,241,.10));border-top:1px solid rgba(139,92,246,.2);cursor:pointer;flex-shrink:0;transition:background .15s}
      #cb-comm-jump-bar:hover{background:linear-gradient(135deg,rgba(139,92,246,.22),rgba(99,102,241,.18))}
      #cb-comm-jump-bar .cb-jump-icon{font-size:14px;width:22px;height:22px;border-radius:50%;background:rgba(139,92,246,.18);display:flex;align-items:center;justify-content:center;color:#8b5cf6;font-weight:700}
      #cb-comm-jump-bar .cb-jump-text{font-size:12px;font-weight:600;color:#7c3aed}
      .cb-comm-badge{position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;line-height:16px;text-align:center;font-size:9px;font-weight:800;color:#fff;background:#ef4444;border-radius:10px;padding:0 4px;box-sizing:border-box;animation:cb-pulse 1.5s infinite}
      .cb-cat-btn{position:relative}
      #cb-typing-bar{display:none;align-items:center;gap:8px;padding:6px 16px;flex-shrink:0;min-height:24px}
      .cb-typing-text{font-size:11px;color:#6366f1;font-weight:600;font-style:italic}
      .cb-typing-dots{display:inline-flex;gap:3px;align-items:center}
      .cb-typing-dots span{width:5px;height:5px;border-radius:50%;background:#818cf8;animation:cb-typingBounce 1.2s infinite ease-in-out}
      .cb-typing-dots span:nth-child(2){animation-delay:.2s}
      .cb-typing-dots span:nth-child(3){animation-delay:.4s}
      @keyframes cb-typingBounce{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-4px);opacity:1}}
      #cb-reply-banner{display:none;align-items:center;padding:6px 14px;background:#f1f5f9;border-bottom:1px solid #e5e7eb;flex-shrink:0;gap:8px}

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
        #cb-comm-jump-bar{background:linear-gradient(135deg,rgba(139,92,246,.15),rgba(99,102,241,.12));border-top-color:rgba(167,139,250,.25)}
        #cb-comm-jump-bar:hover{background:linear-gradient(135deg,rgba(139,92,246,.25),rgba(99,102,241,.20))}
        #cb-comm-jump-bar .cb-jump-icon{background:rgba(167,139,250,.2);color:#a78bfa}
        #cb-comm-jump-bar .cb-jump-text{color:#a78bfa}
        .cb-typing-text{color:#a78bfa}
        .cb-typing-dots span{background:#a78bfa}
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
      [data-theme="dark"] .cb-comm-other .cb-comm-text{background:rgba(255,255,255,.1);color:#e2e8f0}
      [data-theme="dark"] .cb-comm-name{color:#818cf8}
      [data-theme="dark"] .cb-comm-reply-quote{background:rgba(167,139,250,.1);border-left-color:#a78bfa}
      [data-theme="dark"] .cb-comm-reply-quote:hover{background:rgba(167,139,250,.18)}
      [data-theme="dark"] .cb-comm-reply-quote-name{color:#a78bfa}
      [data-theme="dark"] .cb-comm-reply-quote-text{color:#94a3b8}
      [data-theme="dark"] .cb-comm-reply-btn{color:#818cf8}
      [data-theme="dark"] .cb-comm-reply-to-me{box-shadow:inset 0 0 0 1.5px rgba(167,139,250,.4)}
      [data-theme="dark"] .cb-typing-text{color:#a78bfa}
      [data-theme="dark"] .cb-typing-dots span{background:#a78bfa}
      [data-theme="dark"] #cb-comm-jump-bar{background:linear-gradient(135deg,rgba(139,92,246,.15),rgba(99,102,241,.12));border-top-color:rgba(167,139,250,.25)}
      [data-theme="dark"] #cb-comm-jump-bar:hover{background:linear-gradient(135deg,rgba(139,92,246,.25),rgba(99,102,241,.20))}
      [data-theme="dark"] #cb-comm-jump-bar .cb-jump-icon{background:rgba(167,139,250,.2);color:#a78bfa}
      [data-theme="dark"] #cb-comm-jump-bar .cb-jump-text{color:#a78bfa}
      [data-theme="dark"] #cb-reply-banner{background:#1e293b;border-color:rgba(255,255,255,.1)}

      /* ── Mobile (overlay) ── */
      @media(max-width:480px){
        #cb-overlay .cb-hc-container{width:96vw;max-width:none;height:75vh;height:75dvh;max-height:75vh;max-height:75dvh;border-radius:16px}
        #cb-overlay .cb-input-bar{gap:5px;padding:10px 10px}
        #cb-overlay .cb-attach-btn,#cb-overlay .cb-send-btn,#cb-overlay #cb-voice-btn{width:36px;height:36px;font-size:14px}
        #cb-overlay #cb-input{padding:8px 12px;font-size:13px}
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
          '<button id="cb-comm-admin-lock" title="Admin unlock" style="display:none;position:absolute;top:16px;right:48px;background:none;border:none;font-size:18px;cursor:pointer;padding:4px 6px;opacity:.6;transition:opacity .15s;z-index:2;">🔒</button>' +
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
            '<button class="cb-cat-btn" data-cat="premium" style="display:none">👑 Premium</button>' +
            '<button class="cb-cat-btn" data-cat="partner" style="display:none">🤝 Partnership</button>' +
            '<button class="cb-cat-btn" data-cat="community">🌍 Community</button>' +
            '<button class="cb-cat-btn" data-cat="private">✉️ Private</button>' +
            '<button class="cb-cat-btn" data-cat="dictionary">📖 Dictionary</button>' +
          '</div>' +
          '<div id="cb-global-banner"></div>' +
          '<div id="cb-typing-bar" style="display:none;"></div>' +
          '<div id="cb-reply-banner" style="display:none;"></div>' +
          '<div id="cb-messages"></div>' +
          '<div id="cb-comm-jump-bar" style="display:none;"></div>' +
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

      // Admin lock button for community tab
      var lockBtn = overlay.querySelector('#cb-comm-admin-lock');
      if (lockBtn) {
        lockBtn.addEventListener('click', function () {
          if (_communityAdminUnlocked) return;
          _showCommunityAdminPasscode();
        });
      }

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

    // Pre-load community messages for badge (don't wait for tab switch)
    setTimeout(function() { if (!_communityLoaded) loadCommunityMessages(); }, 2000);
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

    // ── Mobile keyboard fix: adjust overlay when virtual keyboard opens ──
    // Works in both normal mode and fullscreen iframe mode
    (function () {
      var initialHeight = window.innerHeight;
      var kbOpen = false;

      function adjustForKeyboard() {
        var ov = document.getElementById('cb-overlay');
        if (!ov || !ov.classList.contains('active')) return;
        var container = ov.querySelector('.cb-hc-container');
        if (!container) return;

        // Detect available height: prefer visualViewport, fall back to innerHeight
        var availH = (window.visualViewport ? window.visualViewport.height : window.innerHeight);
        var heightRatio = availH / initialHeight;

        if (heightRatio < 0.75) {
          // Keyboard is open — shrink container to fit visible area
          kbOpen = true;
          ov.classList.remove('cb-kb-closed');
          container.style.maxHeight = (availH - 12) + 'px';
          container.style.marginBottom = '0';
          // Scroll input into view
          var input = document.getElementById('cb-input');
          if (input && document.activeElement === input) {
            setTimeout(function () { input.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 100);
          }
        } else {
          // Keyboard closed — reset
          kbOpen = false;
          ov.classList.add('cb-kb-closed');
          container.style.maxHeight = '';
          container.style.marginBottom = '';
          ov.style.top = '';
          ov.style.height = '';
        }
      }

      // visualViewport resize (works in some browsers/contexts)
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', adjustForKeyboard);
        window.visualViewport.addEventListener('scroll', function () {
          var ov = document.getElementById('cb-overlay');
          if (!ov || !ov.classList.contains('active') || !kbOpen) return;
          ov.style.top = window.visualViewport.offsetTop + 'px';
          ov.style.height = window.visualViewport.height + 'px';
        });
      }

      // window resize fallback (works in fullscreen iframes where visualViewport may not fire)
      window.addEventListener('resize', function () {
        // Update initial height when keyboard is definitely closed (e.g. orientation change)
        if (window.innerHeight > initialHeight) initialHeight = window.innerHeight;
        adjustForKeyboard();
      });

      // Focus/blur on input — extra safety net
      document.addEventListener('focusin', function (e) {
        if (e.target && e.target.id === 'cb-input') {
          // On some devices resize fires late; retry after a delay
          setTimeout(adjustForKeyboard, 300);
          setTimeout(adjustForKeyboard, 600);
        }
      });
      document.addEventListener('focusout', function (e) {
        if (e.target && e.target.id === 'cb-input') {
          setTimeout(adjustForKeyboard, 300);
        }
      });
    })();
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

  // ─── COMMUNITY CHAT ──────────────────────────────────────────────────────
  // Public community chat: anyone sends, anyone replies, threaded view
  // Uses Supabase table: community_messages
  // Columns: id, content, sender_name, device_id, center, role, parent_id, created_at

  async function loadCommunityMessages() {
    try {
      // Fetch blocked users list (super admins need it for block buttons, all users for send check)
      await _fetchBlockedUsers();
      var resp = await sbFetch('/rest/v1/community_messages?order=created_at.asc&limit=200&select=id,content,sender_name,device_id,center,role,parent_id,created_at,attachment_url,attachment_type,attachment_name');
      var data = await resp.json();
      if (Array.isArray(data)) {
        _communityMessages = data;
        _communityLoaded = true;
        _communityLastPoll = Date.now();
        if (currentCategory === 'community') renderCommunityMessages();
        else _updateCommunityBadge();
      }
    } catch (e) { console.warn('[Community] Load error:', e); }
  }

  async function pollCommunityMessages() {
    if (!_communityLoaded) return;
    if (Date.now() - _communityLastPoll < 15000) return; // throttle 15s
    await loadCommunityMessages();
  }

  function _buildThreadTree(msgs) {
    var byId = {};
    var roots = [];
    msgs.forEach(function (m) {
      m.replies = [];
      byId[m.id] = m;
    });
    msgs.forEach(function (m) {
      if (m.parent_id && byId[m.parent_id]) {
        byId[m.parent_id].replies.push(m);
      } else {
        roots.push(m);
      }
    });
    return roots;
  }

  function renderCommunityMessages() {
    var list = document.getElementById('cb-messages');
    if (!list) return;

    if (!_communityMessages.length) {
      list.innerHTML = '<div style="text-align:center;color:#94a3b8;font-size:13px;margin-top:60px;">🌍 Welcome to the community!<br><span style="font-size:12px;">Be the first to start a conversation.</span></div>';
      return;
    }

    // Build ID lookup for parent references (use String keys for type safety)
    var byId = {};
    _communityMessages.forEach(function(m) { byId[String(m.id)] = m; });

    var myDevice = getDeviceId();
    var html = '';

    // Flat chronological: render every message in order
    _communityMessages.forEach(function (m) {
      var isReply = !!m.parent_id;
      var parentMsg = isReply ? (byId[String(m.parent_id)] || null) : null;
      html += _renderCommunityMsg(m, myDevice, isReply, parentMsg);
    });

    list.innerHTML = html;
    list.scrollTop = list.scrollHeight;

    // Mark all community messages as seen when viewing
    _markCommunityAllSeen();

    // Show jump bar if there are replies to my messages
    _updateCommunityJumpBar(myDevice);

    // Bind reply buttons
    list.querySelectorAll('.cb-comm-reply-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        _setCommunityReplyTo(btn.dataset.msgId, btn.dataset.msgName);
      });
    });

    // Bind block buttons (super admin only)
    list.querySelectorAll('.cb-comm-block-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        _toggleBlockUser(btn.dataset.deviceId, btn.dataset.senderName);
      });
    });

    // Bind delete buttons (super admin only)
    list.querySelectorAll('.cb-comm-delete-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        _deleteCommunityMsg(btn.dataset.msgId);
      });
    });

    // Bind DM buttons (admin only)
    list.querySelectorAll('.cb-comm-dm-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        _startPrivateDM(btn.dataset.deviceId, btn.dataset.senderName, btn.dataset.msgContent);
      });
    });

    // Bind quote previews — tap to scroll to original message
    list.querySelectorAll('.cb-comm-reply-quote[data-scroll-to]').forEach(function (q) {
      q.addEventListener('click', function () {
        var targetId = q.dataset.scrollTo;
        var target = list.querySelector('.cb-comm-msg[data-msg-id="' + targetId + '"]');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.style.transition = 'background .2s';
          target.style.background = 'rgba(99,102,241,.1)';
          setTimeout(function () { target.style.background = ''; }, 1200);
        }
      });
    });
    // Init voice players for community voice messages
    initVoicePlayers(list);

    // ── Swipe-to-reply (Telegram style) ──
    if (!list._swipeInit) {
      list._swipeInit = true;
      list.style.position = 'relative';
      var arrow = document.createElement('div');
      arrow.className = 'cb-swipe-arrow';
      arrow.textContent = '↩';
      list._swipeArrow = arrow;
      var _sw = null; // swipe state

      list.addEventListener('touchstart', function (e) {
        var msg = e.target.closest('.cb-comm-msg');
        if (!msg || !msg.dataset.msgId) return;
        var t = e.touches[0];
        _sw = { msg: msg, startX: t.clientX, startY: t.clientY, swiping: false, locked: false, dx: 0 };
        msg.style.transition = 'none';
      }, { passive: true });

      list.addEventListener('touchmove', function (e) {
        if (!_sw) return;
        var t = e.touches[0];
        var dx = _sw.startX - t.clientX;
        var dy = Math.abs(t.clientY - _sw.startY);
        if (!_sw.locked) {
          if (dy > 10 && dx < 10) { _sw = null; return; }
          if (dx > 10) { _sw.locked = true; _sw.swiping = true; }
          else return;
        }
        e.preventDefault();
        dx = Math.max(0, Math.min(dx, 80));
        _sw.dx = dx;
        _sw.msg.style.transform = 'translateX(' + (-dx) + 'px)';
        var msgRect = _sw.msg.getBoundingClientRect();
        var listRect = list.getBoundingClientRect();
        arrow.style.top = (msgRect.top - listRect.top + list.scrollTop + msgRect.height / 2 - 15) + 'px';
        if (!arrow.parentNode) list.appendChild(arrow);
        var progress = Math.min(dx / 50, 1);
        arrow.style.opacity = String(progress);
        arrow.style.transform = 'scale(' + (0.5 + 0.5 * progress) + ')';
        if (dx >= 50) { arrow.classList.add('cb-swipe-ready'); } else { arrow.classList.remove('cb-swipe-ready'); }
        if (dx >= 50 && !_sw._vibrated) { _sw._vibrated = true; try { navigator.vibrate(10); } catch(ex){} }
      }, { passive: false });

      list.addEventListener('touchend', function () {
        if (!_sw) return;
        var st = _sw; _sw = null;
        st.msg.style.transition = 'transform .2s ease';
        st.msg.style.transform = '';
        arrow.style.opacity = '0';
        arrow.style.transform = 'scale(.5)';
        arrow.classList.remove('cb-swipe-ready');
        if (st.dx >= 50 && st.msg.dataset.msgId && st.msg.dataset.msgName) {
          _setCommunityReplyTo(st.msg.dataset.msgId, st.msg.dataset.msgName);
        }
      }, { passive: true });

      list.addEventListener('touchcancel', function () {
        if (!_sw) return;
        var st = _sw; _sw = null;
        st.msg.style.transition = 'transform .2s ease';
        st.msg.style.transform = '';
        arrow.style.opacity = '0';
        arrow.style.transform = 'scale(.5)';
        arrow.classList.remove('cb-swipe-ready');
      }, { passive: true });

      // Mouse support for desktop
      var _mw = null;
      list.addEventListener('mousedown', function (e) {
        var msg = e.target.closest('.cb-comm-msg');
        if (!msg || !msg.dataset.msgId) return;
        if (e.target.closest('button,a,input,textarea,audio')) return;
        _mw = { msg: msg, startX: e.clientX, swiping: false, dx: 0 };
        msg.style.transition = 'none';
        e.preventDefault();
      });
      document.addEventListener('mousemove', function (e) {
        if (!_mw) return;
        var dx = _mw.startX - e.clientX;
        if (!_mw.swiping && dx > 6) _mw.swiping = true;
        if (!_mw.swiping) return;
        dx = Math.max(0, Math.min(dx, 80));
        _mw.dx = dx;
        _mw.msg.style.transform = 'translateX(' + (-dx) + 'px)';
        var msgRect = _mw.msg.getBoundingClientRect();
        var listRect = list.getBoundingClientRect();
        arrow.style.top = (msgRect.top - listRect.top + list.scrollTop + msgRect.height / 2 - 15) + 'px';
        if (!arrow.parentNode) list.appendChild(arrow);
        var progress = Math.min(dx / 50, 1);
        arrow.style.opacity = String(progress);
        arrow.style.transform = 'scale(' + (0.5 + 0.5 * progress) + ')';
        if (dx >= 50) { arrow.classList.add('cb-swipe-ready'); } else { arrow.classList.remove('cb-swipe-ready'); }
      });
      document.addEventListener('mouseup', function () {
        if (!_mw) return;
        var st = _mw; _mw = null;
        st.msg.style.transition = 'transform .2s ease';
        st.msg.style.transform = '';
        arrow.style.opacity = '0';
        arrow.style.transform = 'scale(.5)';
        arrow.classList.remove('cb-swipe-ready');
        if (st.dx >= 50 && st.msg.dataset.msgId && st.msg.dataset.msgName) {
          _setCommunityReplyTo(st.msg.dataset.msgId, st.msg.dataset.msgName);
        }
      });
    } else {
      // Re-append the reusable arrow element
      if (list._swipeArrow && !list.contains(list._swipeArrow)) {
        list.appendChild(list._swipeArrow);
      }
    }
  }

  function _renderCommunityMsg(m, myDevice, isReply, parentMsg) {
    var isMine = m.device_id === myDevice;
    var isAdmin = m.role === 'admin' || m.role === 'super_admin';
    var isSuperAdmin = m.role === 'super_admin';
    var cls = isMine ? 'cb-comm-mine' : (isAdmin ? 'cb-comm-admin' : 'cb-comm-other');
    // Is this reply to one of MY messages?
    var isReplyToMe = isReply && parentMsg && parentMsg.device_id === myDevice && !isMine;
    var time = '';
    try {
      var d = new Date(m.created_at);
      var now = new Date();
      var isToday = d.toDateString() === now.toDateString();
      time = isToday
        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {}

    // Center badge
    var _centerLabels = { mock_stream: 'Mock Stream', bek: 'Bekzods Multilevel', global: 'Global Education LC', niners: 'Niners Academy', muzaffars: "Muzaffars English" };
    var centerBadge = '';
    if (m.center) {
      var cLabel = _centerLabels[m.center] || m.center;
      centerBadge = ' <span style="font-size:9px;background:rgba(239,68,68,.1);color:#dc2626;padding:1px 5px;border-radius:6px;font-weight:600;">' + escapeHtml(cLabel) + '</span>';
    }

    // Blocked badge (visible when admin unlocked)
    var blockedBadge = '';
    if (_communityAdminUnlocked && _isUserBlocked(m.device_id)) {
      blockedBadge = ' <span style="font-size:9px;background:rgba(220,38,38,.1);color:#dc2626;padding:1px 5px;border-radius:6px;font-weight:700;">🚫 BLOCKED</span>';
    }

    var nameHtml = '';
    if (!isMine) {
      var displayName = escapeHtml(m.sender_name || 'Anonymous');
      if (isAdmin) {
        var badgeLabel = isSuperAdmin ? '⚡ SUPER ADMIN' : 'ADMIN';
        var badgeIcon = isSuperAdmin ? '⚡' : '🛡️';
        var badgeBg = isSuperAdmin ? 'rgba(124,58,237,.15)' : 'rgba(5,150,105,.15)';
        var badgeColor = isSuperAdmin ? '#7c3aed' : '#059669';
        nameHtml = '<div class="cb-comm-name cb-comm-name-admin">' + badgeIcon + ' ' + displayName + ' <span style="font-size:9px;background:' + badgeBg + ';color:' + badgeColor + ';padding:1px 6px;border-radius:8px;font-weight:700;">' + badgeLabel + '</span>' + centerBadge + '</div>';
      } else {
        nameHtml = '<div class="cb-comm-name">' + displayName + blockedBadge + centerBadge + '</div>';
      }
    } else if (isMine && isAdmin) {
      // Show admin badge on own messages too
      var badgeLabel2 = isSuperAdmin ? '⚡ SUPER ADMIN' : 'ADMIN';
      var badgeBg2 = isSuperAdmin ? 'rgba(124,58,237,.15)' : 'rgba(5,150,105,.15)';
      var badgeColor2 = isSuperAdmin ? '#7c3aed' : '#059669';
      nameHtml = '<div class="cb-comm-name" style="text-align:right;"><span style="font-size:9px;background:' + badgeBg2 + ';color:' + badgeColor2 + ';padding:1px 6px;border-radius:8px;font-weight:700;">' + badgeLabel2 + '</span>' + centerBadge + '</div>';
    } else if (isMine) {
      // Regular user's own messages — show center badge on the right
      if (centerBadge) {
        nameHtml = '<div class="cb-comm-name" style="text-align:right;">' + centerBadge + '</div>';
      }
    }

    var replyBtn = '<button class="cb-comm-reply-btn" data-msg-id="' + m.id + '" data-msg-name="' + escapeHtml(m.sender_name || 'Anonymous') + '">↩ Reply</button>';

    // Block/Unblock button (admin unlocked only, on non-admin users' messages)
    var blockBtn = '';
    if (_communityAdminUnlocked && !isMine && !isAdmin) {
      var isBlocked = _isUserBlocked(m.device_id);
      blockBtn = '<button class="cb-comm-block-btn" data-device-id="' + escapeHtml(m.device_id) + '" data-sender-name="' + escapeHtml(m.sender_name || 'Anonymous') + '" style="background:none;border:none;cursor:pointer;font-size:11px;color:' + (isBlocked ? '#059669' : '#dc2626') + ';padding:0 4px;">' + (isBlocked ? '✅ Unblock' : '🚫 Block') + '</button>';
    }

    // Quote preview for replies
    var quoteHtml = '';
    if (isReply) {
      if (parentMsg) {
        var quoteName = parentMsg.device_id === myDevice ? 'You' : escapeHtml(parentMsg.sender_name || 'Anonymous');
        var quoteSnippet = escapeHtml((parentMsg.content || '').substring(0, 80));
        if ((parentMsg.content || '').length > 80) quoteSnippet += '…';
        quoteHtml = '<div class="cb-comm-reply-quote" data-scroll-to="' + parentMsg.id + '">' +
          '<div class="cb-comm-reply-quote-name">' + quoteName + '</div>' +
          '<div class="cb-comm-reply-quote-text">' + quoteSnippet + '</div>' +
        '</div>';
      } else {
        quoteHtml = '<div class="cb-comm-reply-quote">' +
          '<div class="cb-comm-reply-quote-name">Reply</div>' +
          '<div class="cb-comm-reply-quote-text" style="font-style:italic;">Original message</div>' +
        '</div>';
      }
    }

    var extraClass = (isReplyToMe ? ' cb-comm-reply-to-me' : '');

    // Render attachment if present
    var attachHtml = '';
    if (m.attachment_url) {
      if (m.attachment_type === 'voice') {
        attachHtml = buildVoiceMsgHtml(m.attachment_url);
      } else if (m.attachment_type === 'image') {
        attachHtml = '<img src="' + escapeHtml(m.attachment_url) + '" style="max-width:100%;border-radius:10px;margin-bottom:4px;cursor:pointer;" onclick="window.open(this.src)" alt="Image">';
      } else if (m.attachment_type === 'pdf') {
        attachHtml = '<a href="' + escapeHtml(m.attachment_url) + '" target="_blank" style="display:inline-block;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;padding:6px 10px;font-size:12px;color:#2563eb;text-decoration:none;margin-bottom:4px;">📄 ' + escapeHtml(m.attachment_name || 'Document.pdf') + '</a>';
      }
    }

    // Delete button (admin unlocked only)
    var deleteBtn = '';
    if (_communityAdminUnlocked) {
      deleteBtn = '<button class="cb-comm-delete-btn" data-msg-id="' + m.id + '" style="background:none;border:none;cursor:pointer;font-size:11px;color:#dc2626;padding:0 4px;">🗑</button>';
    }

    // DM button (admin unlocked only, on non-admin, non-own messages)
    var dmBtn = '';
    if (_communityAdminUnlocked && !isMine && !isAdmin) {
      dmBtn = '<button class="cb-comm-dm-btn" data-device-id="' + escapeHtml(m.device_id) + '" data-sender-name="' + escapeHtml(m.sender_name || 'Anonymous') + '" data-msg-content="' + escapeHtml((m.content || '').substring(0, 200)) + '" style="background:none;border:none;cursor:pointer;font-size:11px;color:#ec4899;padding:0 4px;">✉️ DM</button>';
    }

    return '<div class="cb-comm-msg ' + cls + extraClass + '" data-msg-id="' + m.id + '" data-msg-name="' + escapeHtml(m.sender_name || 'Anonymous') + '">' +
      nameHtml +
      quoteHtml +
      attachHtml +
      (m.content ? '<div class="cb-comm-text">' + formatMsgText(m.content) + '</div>' : '') +
      '<div class="cb-comm-footer">' +
        '<span class="cb-comm-time">' + time + '</span>' +
        replyBtn +
        blockBtn +
        deleteBtn +
        dmBtn +
      '</div>' +
    '</div>';
  }

  function _setCommunityReplyTo(msgId, senderName) {
    _communityReplyTo = msgId;
    var banner = document.getElementById('cb-reply-banner');
    if (banner) {
      banner.style.display = 'flex';
      banner.innerHTML =
        '<div style="flex:1;font-size:12px;color:#64748b;">↩ Replying to <strong>' + escapeHtml(senderName) + '</strong></div>' +
        '<button id="cb-reply-cancel" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:14px;padding:2px 6px;">✕</button>';
      banner.querySelector('#cb-reply-cancel').addEventListener('click', _cancelCommunityReply);
    }
    var input = document.getElementById('cb-input');
    if (input) { input.placeholder = 'Reply to ' + senderName + '...'; input.focus(); }
  }

  // ─── Community Admin Passcode Popup ─────────────────────────────────────
  function _showCommunityAdminPasscode() {
    var existing = document.getElementById('cb-comm-passcode-overlay');
    if (existing) { existing.style.display = 'flex'; var inp = document.getElementById('cb-comm-passcode-input'); if (inp) { inp.value = ''; inp.focus(); } return; }
    var div = document.createElement('div');
    div.id = 'cb-comm-passcode-overlay';
    div.style.cssText = 'position:fixed;inset:0;z-index:10200;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45);animation:cbHcFadeIn .15s ease;';
    div.onclick = function(e) { if (e.target === div) { div.style.display = 'none'; } };
    div.innerHTML =
      '<div style="background:#fff;border-radius:16px;padding:28px 24px;width:90vw;max-width:340px;box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center;">' +
        '<div style="font-size:28px;margin-bottom:8px;">🔐</div>' +
        '<h3 style="margin:0 0 4px;font-size:16px;font-weight:700;color:#1e293b;">Admin Access</h3>' +
        '<p style="margin:0 0 16px;font-size:13px;color:#64748b;">Enter passcode to unlock admin features</p>' +
        '<input type="password" id="cb-comm-passcode-input" placeholder="••••••••" maxlength="20" style="width:100%;padding:12px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:15px;text-align:center;outline:none;box-sizing:border-box;">' +
        '<div id="cb-comm-passcode-error" style="min-height:20px;margin:8px 0;font-size:13px;color:#f87171;"></div>' +
        '<button id="cb-comm-passcode-btn" style="width:100%;padding:12px;border:none;border-radius:10px;background:linear-gradient(135deg,#6366f1,#7c3aed);color:#fff;font-weight:600;font-size:14px;cursor:pointer;">Unlock</button>' +
        '<button id="cb-comm-passcode-cancel" style="margin-top:8px;background:none;border:none;color:#94a3b8;font-size:13px;cursor:pointer;">Cancel</button>' +
      '</div>';
    document.body.appendChild(div);

    var inp = document.getElementById('cb-comm-passcode-input');
    var errEl = document.getElementById('cb-comm-passcode-error');
    var btn = document.getElementById('cb-comm-passcode-btn');

    inp.addEventListener('keypress', function(e) { if (e.key === 'Enter') _verifyCommunityPasscode(); });
    btn.addEventListener('click', _verifyCommunityPasscode);
    document.getElementById('cb-comm-passcode-cancel').addEventListener('click', function() { div.style.display = 'none'; });

    setTimeout(function() { inp.focus(); }, 50);

    async function _verifyCommunityPasscode() {
      var code = (inp.value || '').trim();
      if (!code) { errEl.textContent = '❌ Please enter a passcode'; return; }
      btn.disabled = true; btn.textContent = '⏳ Verifying...';
      errEl.textContent = '';
      try {
        var resp = await fetch('https://admin0709.alwaysdata.net/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passcode: code, type: 'bsb', validate: true, timestamp: Date.now(), source: 'community-admin', center: ((window.SITE_CONFIG && window.SITE_CONFIG.testIdentifier) || 'mock_stream').replace(/_/g, '') })
        });
        if (!resp.ok) throw new Error('Server error');
        var data = await resp.json();
        if (data.access) {
          _communityAdminUnlocked = true;
          div.style.display = 'none';
          // Update lock icon
          var lockBtn = document.getElementById('cb-comm-admin-lock');
          if (lockBtn) { lockBtn.textContent = '🔓'; lockBtn.style.opacity = '1'; }
          // Re-render to show admin buttons
          renderCommunityMessages();
        } else {
          throw new Error('Invalid');
        }
      } catch (e) {
        errEl.textContent = '❌ Incorrect passcode';
        inp.value = '';
        inp.focus();
      } finally {
        btn.disabled = false; btn.textContent = 'Unlock';
      }
    }
  }

  function _cancelCommunityReply() {
    _communityReplyTo = null;
    var banner = document.getElementById('cb-reply-banner');
    if (banner) banner.style.display = 'none';
    var input = document.getElementById('cb-input');
    if (input) input.placeholder = 'Write to the community...';
  }

  async function sendCommunityMessage(text, attachment) {
    // Block check
    if (_isUserBlocked(getDeviceId())) {
      alert('You have been blocked from sending messages in the community.');
      return;
    }
    isSending = true;
    var input = document.getElementById('cb-input');
    if (input) { input.value = ''; input.disabled = true; }

    var myRole = await _checkCommunityRole();
    var body = {
      content: text || '',
      sender_name: getSenderName(),
      device_id: getDeviceId(),
      center: getCenter(),
      role: myRole === 'super_admin' ? 'super_admin' : (myRole === 'admin' ? 'admin' : 'user'),
      parent_id: _communityReplyTo || null
    };
    if (attachment) {
      body.attachment_url = attachment.url;
      body.attachment_type = attachment.type || null;
      body.attachment_name = attachment.name || null;
    }

    try {
      var resp = await sbFetch('/rest/v1/community_messages', {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify(body)
      });
      var rows = await resp.json();
      if (Array.isArray(rows) && rows.length) {
        _communityMessages.push(rows[0]);
      } else if (rows && rows.id) {
        _communityMessages.push(rows);
      }
      _cancelCommunityReply();
      renderCommunityMessages();
    } catch (e) {
      console.warn('[Community] Send error:', e);
    }

    isSending = false;
    if (input) { input.disabled = false; input.focus(); }
  }

  // ─── SUPABASE REALTIME ────────────────────────────────────────────────────

  function _loadSupabaseClient(cb) {
    if (window.supabase) { cb(); return; }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    s.onload = cb;
    s.onerror = function () { console.warn('[Community] Could not load Supabase Realtime'); };
    document.head.appendChild(s);
  }

  function _initRealtime() {
    _loadSupabaseClient(function () {
      try {
        _sbClient = window.supabase.createClient(SB_URL, SB_KEY);
        _subscribeToMessages();
        _subscribeToTyping();
      } catch (e) { console.warn('[Community] Realtime init error:', e); }
    });
  }

  function _subscribeToMessages() {
    if (!_sbClient) return;
    _realtimeChannel = _sbClient.channel('community-global')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_messages' },
        function (payload) {
          var msg = payload.new;
          if (!msg || !msg.id) return;
          // Avoid duplicates
          var exists = false;
          for (var i = 0; i < _communityMessages.length; i++) {
            if (_communityMessages[i].id === msg.id) { exists = true; break; }
          }
          if (!exists) {
            _communityMessages.push(msg);
            _communityLoaded = true;
            if (currentCategory === 'community') {
              // Append without full re-render for performance
              _appendCommunityMsg(msg);
              _markCommunityAllSeen();
              _updateCommunityJumpBar(getDeviceId());
            } else {
              _updateCommunityBadge();
            }
          }
          // Clear typing indicator for this sender
          if (msg.device_id && _typingUsers[msg.device_id]) {
            delete _typingUsers[msg.device_id];
            _renderTypingIndicator();
          }
        })
      .subscribe();
  }

  // Append a single new message to the bottom without full re-render
  function _appendCommunityMsg(msg) {
    var list = document.getElementById('cb-messages');
    if (!list) return;
    // Remove the "Welcome" placeholder if present
    var placeholder = list.querySelector('div[style*="text-align:center"]');
    if (placeholder && _communityMessages.length === 1) list.innerHTML = '';

    var myDevice = getDeviceId();
    var byId = {};
    _communityMessages.forEach(function(m) { byId[String(m.id)] = m; });
    var isReply = !!msg.parent_id;
    var parentMsg = isReply ? (byId[String(msg.parent_id)] || null) : null;
    var html = _renderCommunityMsg(msg, myDevice, isReply, parentMsg);

    var wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    var el = wrapper.firstChild;
    list.appendChild(el);

    // Bind reply button
    var btn = el.querySelector('.cb-comm-reply-btn');
    if (btn) {
      btn.addEventListener('click', function () {
        _setCommunityReplyTo(btn.dataset.msgId, btn.dataset.msgName);
      });
    }
    // Bind block button
    var blockBtn = el.querySelector('.cb-comm-block-btn');
    if (blockBtn) {
      blockBtn.addEventListener('click', function () {
        _toggleBlockUser(blockBtn.dataset.deviceId, blockBtn.dataset.senderName);
      });
    }
    // Bind delete button
    var delBtn = el.querySelector('.cb-comm-delete-btn');
    if (delBtn) {
      delBtn.addEventListener('click', function () {
        _deleteCommunityMsg(delBtn.dataset.msgId);
      });
    }
    // Bind DM button
    var dmBtnEl = el.querySelector('.cb-comm-dm-btn');
    if (dmBtnEl) {
      dmBtnEl.addEventListener('click', function () {
        _startPrivateDM(dmBtnEl.dataset.deviceId, dmBtnEl.dataset.senderName, dmBtnEl.dataset.msgContent);
      });
    }
    // Bind quote click
    var q = el.querySelector('.cb-comm-reply-quote[data-scroll-to]');
    if (q) {
      q.addEventListener('click', function () {
        var target = list.querySelector('.cb-comm-msg[data-msg-id="' + q.dataset.scrollTo + '"]');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.style.transition = 'background .2s';
          target.style.background = 'rgba(99,102,241,.1)';
          setTimeout(function () { target.style.background = ''; }, 1200);
        }
      });
    }

    // Auto-scroll to bottom
    list.scrollTop = list.scrollHeight;
  }

  // ─── TYPING INDICATORS ───────────────────────────────────────────────────

  function _subscribeToTyping() {
    if (!_sbClient) return;
    _typingChannel = _sbClient.channel('typing-global');
    _typingChannel.on('broadcast', { event: 'typing' }, function (payload) {
      var data = payload.payload;
      if (!data || data.device_id === getDeviceId()) return;
      _typingUsers[data.device_id] = { name: data.name, ts: Date.now() };
      _renderTypingIndicator();
    });
    _typingChannel.subscribe();

    // Clean up stale typing indicators every 2s
    _typingDisplayTimer = setInterval(function () {
      var now = Date.now();
      var changed = false;
      Object.keys(_typingUsers).forEach(function (k) {
        if (now - _typingUsers[k].ts > 4000) { delete _typingUsers[k]; changed = true; }
      });
      if (changed) _renderTypingIndicator();
    }, 2000);
  }

  function _broadcastTyping() {
    if (!_typingChannel || currentCategory !== 'community') return;
    _typingChannel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { device_id: getDeviceId(), name: getSenderName() }
    });
  }

  function _onCommunityInput() {
    if (currentCategory !== 'community') return;
    if (_typingTimer) clearTimeout(_typingTimer);
    _broadcastTyping();
    _typingTimer = setTimeout(function () { _typingTimer = null; }, 2500);
  }

  function _renderTypingIndicator() {
    var bar = document.getElementById('cb-typing-bar');
    if (!bar) return;
    if (currentCategory !== 'community') { bar.style.display = 'none'; return; }

    var names = [];
    Object.keys(_typingUsers).forEach(function (k) {
      names.push(_typingUsers[k].name || 'Someone');
    });

    if (!names.length) {
      bar.style.display = 'none';
      return;
    }

    var text = '';
    if (names.length === 1) text = names[0] + ' is typing';
    else if (names.length === 2) text = names[0] + ' and ' + names[1] + ' are typing';
    else text = names[0] + ' and ' + (names.length - 1) + ' others are typing';

    bar.style.display = 'flex';
    bar.innerHTML =
      '<span class="cb-typing-dots"><span></span><span></span><span></span></span>' +
      '<span class="cb-typing-text">' + escapeHtml(text) + '</span>';
  }

  // ─── INIT ─────────────────────────────────────────────────────────────────
  function init() {
    loadLocal();
    syncFromLandingHC();
    injectCSS();
    buildDOM();
    updateBadge();

    // Start polling (fallback — Realtime handles community messages when available)
    pollGlobalMessage();
    pollAdminReplies();
    pollTimer = setInterval(function() { pollAdminReplies(); pollGlobalMessage(); pollCommunityMessages(); }, POLL_INTERVAL);

    // Initialize Supabase Realtime for community
    _initRealtime();

    // Pre-check admin role for community messages
    _checkCommunityRole();

    // Bind typing indicator to input
    setTimeout(function () {
      var input = document.getElementById('cb-input');
      if (input) input.addEventListener('input', _onCommunityInput);
    }, 500);

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
