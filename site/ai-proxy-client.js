// =====================================================================
// ai-proxy-client.js
// Drop-in helper so HTML pages can call the Supabase Edge Function
// `ai-proxy` INSTEAD of calling Gemini/OpenAI/Claude/etc. directly.
//
// Include ONCE in every page that grades/chats with AI:
//   <script src="/ai-proxy-client.js"></script>
//
// Then inside _callScoringAI (or anywhere you call an AI provider),
// replace the provider-specific fetch with a single call:
//
//   const text = await window.AIProxy.call({
//     provider:    'gemini',                 // or 'openai' | 'claude' | 'grok' | 'deepseek'
//     centerId:    window.__CENTER_ID || 'mock_stream',
//     skill:       'writing',                // or 'speaking' | 'chat'
//     systemText:  systemText,
//     userPrompt:  userPrompt,
//     contentParts: opts.contentParts,       // optional (Gemini multi-part)
//     temperature: opts.temperature,
//     maxTokens:   opts.maxTokens,
//     jsonMode:    opts.jsonMode,
//     model:       opts.model                // optional override
//   });
//
// The API key never leaves the server. If the center isn't in
// allowed_centers, or the IP is blocked, or the rate limit is hit,
// you'll get a thrown Error with the reason.
// =====================================================================
(function () {
  'use strict';

  // Your project URL (same one used elsewhere in the site)
  var SUPABASE_URL     = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var SUPABASE_ANONKEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';

  async function call(req) {
    if (!req || !req.provider) throw new Error('AIProxy.call: provider required');
    if (!req.centerId)         throw new Error('AIProxy.call: centerId required');

    var r = await fetch(SUPABASE_URL + '/functions/v1/ai-proxy', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_ANONKEY,
        'Authorization': 'Bearer ' + SUPABASE_ANONKEY
      },
      body: JSON.stringify(req)
    });

    var j = null;
    try { j = await r.json(); } catch (_e) { /* non-json */ }

    if (!r.ok) {
      var msg = (j && (j.error || j.detail)) || ('ai-proxy HTTP ' + r.status);
      throw new Error(msg);
    }
    return (j && j.text) || '';
  }

  window.AIProxy = { call: call };
})();
