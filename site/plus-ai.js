// =====================================================================
// plus-ai.js
// Shared AI helper for Reading Plus + Listening Plus (and any future
// Plus modules). Reads the active provider from System Prompts default
// (site_settings.scoring_ai_provider) — NOT the per-centre Centers row,
// so per-centre AI choice never bleeds into the platform-wide Plus pool.
//
// Usage on a page:
//   <script src="/ai-proxy-client.js"></script>   <!-- optional, for shared SB consts -->
//   <script src="/plus-ai.js"></script>
//   const text = await PlusAI.call(systemText, userPrompt, { jsonMode:true });
//
// PlusAI.refresh()  → clears the localStorage cache so the next call
//                     re-fetches the provider (admin changed it).
// PlusAI.resolved() → current { provider, model } for debugging.
// =====================================================================
(function () {
  'use strict';

  var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
  var CACHE_KEY = 'ms_plus_ai_provider_v1';
  var CACHE_TTL = 5 * 60 * 1000;

  // Defaults if scoring_model_<provider> is unset. Kept conservative —
  // cheap models for everything except Claude (no haiku in current keys).
  var DEFAULT_MODELS = {
    gemini:   'gemini-flash-latest',
    openai:   'gpt-4o-mini',
    deepseek: 'deepseek-v4-flash',
    grok:     'grok-4.20-0309-non-reasoning',
    // Both of these were RETIRED and answered 404 — checked against the
    // providers' live model lists on 21 Aug 2026, along with everything else
    // in this map. A dead default is worse than none: the call fails only for
    // the centres that never set an explicit model.
    groq:     'openai/gpt-oss-120b',
    claude:   'claude-haiku-4-5'
  };

  var _resolved = null;
  var _resolvePromise = null;

  function _proxyHeaders(extra) {
    var h = {
      'Content-Type': 'application/json',
      'apikey': SB_KEY,
      'Authorization': 'Bearer ' + SB_KEY,
      'x-ms-center': (window.__CENTER_ID || 'mock_stream').toString().trim(),
      'x-ms-skill': (extra && extra.skill) || 'plus'
    };
    return h;
  }

  async function _loadProvider() {
    // localStorage fast path
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        var c = JSON.parse(raw);
        if (c && c.t && (Date.now() - c.t) < CACHE_TTL && c.provider) {
          return { provider: c.provider, model: c.model || '' };
        }
      }
    } catch (_) {}

    try {
      var keys = 'scoring_ai_provider,scoring_model_gemini,scoring_model_openai,scoring_model_claude,scoring_model_grok,scoring_model_deepseek,scoring_model_groq';
      var r = await fetch(SB_URL + '/rest/v1/site_settings?key=in.(' + keys + ')&select=key,value', {
        headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY }
      });
      var rows = r.ok ? await r.json() : [];
      var map = {};
      rows.forEach(function (x) { map[x.key] = x.value; });
      var prov = (map.scoring_ai_provider || 'gemini').toLowerCase();
      var model = map['scoring_model_' + prov] || DEFAULT_MODELS[prov] || '';
      var out = { provider: prov, model: model };
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), provider: out.provider, model: out.model })); } catch (_) {}
      return out;
    } catch (e) {
      console.warn('[plus-ai] provider fetch failed, defaulting to gemini', e);
      return { provider: 'gemini', model: DEFAULT_MODELS.gemini };
    }
  }

  // ── Provider-specific transports (path-based ai-proxy) ──────────────

  async function _callGeminiPath(model, systemText, userPrompt, opts) {
    var combined = systemText ? (systemText + '\n\n' + userPrompt) : userPrompt;
    var body = {
      contents: [{ parts: [{ text: combined }] }],
      generationConfig: {
        temperature: opts.temperature != null ? opts.temperature : 0.85,
        maxOutputTokens: opts.maxTokens || 2048
      }
    };
    if (opts.jsonMode !== false) body.generationConfig.responseMimeType = 'application/json';
    var r = await fetch(SB_URL + '/functions/v1/ai-proxy/gemini/v1beta/models/' + encodeURIComponent(model) + ':generateContent', {
      method: 'POST', headers: _proxyHeaders(opts), body: JSON.stringify(body)
    });
    if (!r.ok) { var t = ''; try { t = await r.text(); } catch (_) {} throw new Error('Gemini ' + r.status + ': ' + t.slice(0, 200)); }
    var j = await r.json();
    var cand = j.candidates && j.candidates[0];
    if (!cand) throw new Error('Gemini: no candidates');
    return cand.content.parts[0].text;
  }

  // OpenAI-shaped: deepseek / openai / grok / groq all use the same body
  async function _callOpenAIShape(providerSlug, model, systemText, userPrompt, opts) {
    var messages = [];
    if (systemText) messages.push({ role: 'system', content: systemText });
    var userText = userPrompt;
    if (opts.jsonMode !== false) userText += '\n\nIMPORTANT: Respond with valid JSON only, no markdown, no backticks.';
    messages.push({ role: 'user', content: userText });
    var body = {
      model: model,
      messages: messages,
      temperature: opts.temperature != null ? opts.temperature : 0.85,
      max_tokens: opts.maxTokens || 2048
    };
    if (opts.jsonMode !== false && (providerSlug === 'openai' || providerSlug === 'groq' || providerSlug === 'deepseek')) {
      body.response_format = { type: 'json_object' };
    }
    var path = providerSlug + '/chat/completions';
    var r = await fetch(SB_URL + '/functions/v1/ai-proxy/' + path, {
      method: 'POST', headers: _proxyHeaders(opts), body: JSON.stringify(body)
    });
    if (!r.ok) { var t = ''; try { t = await r.text(); } catch (_) {} throw new Error(providerSlug + ' ' + r.status + ': ' + t.slice(0, 200)); }
    var j = await r.json();
    if (j.error) throw new Error(j.error.message || (providerSlug + ' API error'));
    return j.choices[0].message.content;
  }

  async function _callClaudePath(model, systemText, userPrompt, opts) {
    var body = {
      model: model,
      max_tokens: opts.maxTokens || 2048,
      temperature: opts.temperature != null ? opts.temperature : 0.85,
      system: systemText || '',
      messages: [{ role: 'user', content: opts.jsonMode !== false ? (userPrompt + '\n\nIMPORTANT: Respond with valid JSON only, no markdown, no backticks.') : userPrompt }]
    };
    var r = await fetch(SB_URL + '/functions/v1/ai-proxy/anthropic/v1/messages', {
      method: 'POST', headers: _proxyHeaders(opts), body: JSON.stringify(body)
    });
    if (!r.ok) { var t = ''; try { t = await r.text(); } catch (_) {} throw new Error('Claude ' + r.status + ': ' + t.slice(0, 200)); }
    var j = await r.json();
    if (j.error) throw new Error(j.error.message || 'Claude API error');
    return (j.content && j.content[0] && j.content[0].text) || '';
  }

  // ── Public entry ────────────────────────────────────────────────────

  async function call(systemText, userPrompt, opts) {
    opts = opts || {};
    if (!_resolved) {
      if (!_resolvePromise) _resolvePromise = _loadProvider();
      _resolved = await _resolvePromise;
    }
    var provider = (opts.providerOverride || _resolved.provider || 'gemini').toLowerCase();
    // When the caller overrides the provider (e.g. fallback to Gemini), the
    // resolved model belongs to the OTHER provider — don't ship it. Use the
    // override provider's default model instead, unless the caller also gave
    // an explicit modelOverride.
    var model;
    if (opts.modelOverride) {
      model = opts.modelOverride;
    } else if (opts.providerOverride && opts.providerOverride !== _resolved.provider) {
      model = DEFAULT_MODELS[provider] || '';
    } else {
      model = _resolved.model || DEFAULT_MODELS[provider] || '';
    }

    if (provider === 'gemini')   return _callGeminiPath(model, systemText, userPrompt, opts);
    if (provider === 'openai')   return _callOpenAIShape('openai',   model, systemText, userPrompt, opts);
    if (provider === 'deepseek') return _callOpenAIShape('deepseek', model, systemText, userPrompt, opts);
    if (provider === 'grok')     return _callOpenAIShape('grok',     model, systemText, userPrompt, opts);
    if (provider === 'groq')     return _callOpenAIShape('groq',     model, systemText, userPrompt, opts);
    if (provider === 'claude')   return _callClaudePath(model, systemText, userPrompt, opts);
    throw new Error('Unknown provider: ' + provider);
  }

  function refresh() {
    _resolved = null;
    _resolvePromise = null;
    try { localStorage.removeItem(CACHE_KEY); } catch (_) {}
  }

  function resolved() { return _resolved; }

  window.PlusAI = { call: call, refresh: refresh, resolved: resolved };
})();
