// =====================================================================
// Vision fact-check helper (multi-provider via ai-proxy)
// =====================================================================
// One module, two callers today:
//   - Writing IELTS Mock.html (Task 1 chart description)
//   - Speaking Mocks.html (CEFR Speaking Q4 image-pair)
//
// What it does:
//   1. Reads window.SITE_CONFIG.visionFactCheck. If false → returns null.
//      (Centre admin opted out; no vision call, no extra cost.)
//   2. Reads window.SITE_CONFIG.visionFactCheckProvider (gemini | openai |
//      claude | llama-scout). Defaults to gemini.
//   3. Fetches each image URL → base64.
//   4. POSTs to ai-proxy with the selected vision model + system prompt
//      + images. The provider for this image step is INDEPENDENT of the
//      centre's primary scoring AI — that's the whole point of the
//      design: text-only scorers (DeepSeek / Grok / Groq Qwen) borrow a
//      vision pass to stay honest about image content.
//   5. Returns a structured JSON fact-check report. The caller injects
//      this into the main scoring prompt so the text-only scorer judges
//      Task Achievement with chart-aware context.
//
// Failure mode: any error (network, broken image URL, provider 5xx)
// returns null. The caller falls back to text-only scoring. Student
// always gets a score, just without the fact-check that one time.
// =====================================================================

(function () {
  if (window.factCheckImages) return; // idempotent

  var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';

  // Per-provider endpoints (all flow through ai-proxy so the secrets
  // stay server-side). Models are picked to match the cheapest /
  // fastest vision-capable tier each provider offers.
  var PROVIDER_ENDPOINTS = {
    gemini:        SB_URL + '/functions/v1/ai-proxy/gemini/v1beta/models/gemini-flash-latest:generateContent',
    openai:        SB_URL + '/functions/v1/ai-proxy/openai/v1/chat/completions',
    claude:        SB_URL + '/functions/v1/ai-proxy/claude/v1/messages',
    // Groq RETIRED Llama 4 Scout (404 as of 2026-07) and hosts no vision
    // model anymore — the 'llama-scout' key is kept as an ALIAS routed to
    // Grok vision so centres with the old value keep working.
    'llama-scout': SB_URL + '/functions/v1/ai-proxy/grok/v1/chat/completions',
    grok:          SB_URL + '/functions/v1/ai-proxy/grok/v1/chat/completions'
  };
  var PROVIDER_MODELS = {
    openai:        'gpt-4o-mini',
    claude:        'claude-haiku-4-5',
    'llama-scout': 'grok-4.20-0309-non-reasoning',  // alias → Grok (see above)
    // grok-4.x is vision-capable via the OpenAI-compatible API; the 4.20
    // non-reasoning variant is the fastest for fact-check work (~2s).
    grok:          'grok-4.20-0309-non-reasoning'
  };

  // System prompts per task type — kept here so the helper is the single
  // source of truth for "how Vision evaluates each kind of image task".
  var SYSTEM_PROMPTS = {
    'ielts-writing-task1':
      'You are an IELTS Writing Task 1 examiner verifying chart description accuracy.\n' +
      'You will see: (1) the chart image, (2) the prompt shown to the student, (3) the student\'s written response.\n' +
      'Your job: identify factual claims in the response that do not match the chart.\n\n' +
      'Severity guide:\n' +
      '  - "major"    = wrong direction of trend, or a number off by >10 percentage points\n' +
      '  - "moderate" = a number off by 5-10 points, or a missed major feature\n' +
      '  - "minor"    = a number off by <5 points, or imprecise wording that\'s mostly accurate\n\n' +
      'Coverage guide:\n' +
      '  - "FULL"     = student described every key feature (overall trend + major comparisons)\n' +
      '  - "PARTIAL"  = student covered some features but missed at least one important comparison\n' +
      '  - "MINIMAL"  = student only mentioned 1-2 data points, ignored the broader picture\n\n' +
      'Confidence guide:\n' +
      '  - "high"   = chart is fully legible and all student claims can be verified\n' +
      '  - "medium" = some axis labels or numbers are partially unclear\n' +
      '  - "low"    = chart is genuinely ambiguous; do not penalise the student here\n\n' +
      'Return JSON ONLY in this exact shape:\n' +
      '{\n' +
      '  "chart_summary": "<1-2 sentence neutral description of what the chart actually shows>",\n' +
      '  "factual_errors": [\n' +
      '    {"claim": "<what the student said>", "actual": "<what the chart shows>", "severity": "minor|moderate|major"}\n' +
      '  ],\n' +
      '  "coverage": "FULL|PARTIAL|MINIMAL",\n' +
      '  "confidence": "high|medium|low"\n' +
      '}\n' +
      'If the response has no factual errors, return an empty array for factual_errors.',

    'cefr-speaking-q4':
      'You are a CEFR Speaking examiner verifying image-comparison accuracy.\n' +
      'You will see: (1) two images, (2) the question shown to the student, (3) the student\'s transcribed spoken response.\n' +
      'The student is comparing and contrasting the two images.\n' +
      'Your job: identify factual claims that do not match what the images actually show.\n\n' +
      'Severity guide:\n' +
      '  - "major"    = misidentified an object, person, or setting\n' +
      '  - "moderate" = wrong about an attribute (color, count, action)\n' +
      '  - "minor"    = imprecise but recognisable\n\n' +
      'Coverage guide:\n' +
      '  - "FULL"     = student compared / contrasted both images on multiple dimensions\n' +
      '  - "PARTIAL"  = mentioned both images but compared only superficially\n' +
      '  - "MINIMAL"  = barely described one image, ignored the other\n\n' +
      'Confidence guide:\n' +
      '  - "high"   = both images are fully clear and the student\'s claims can be verified\n' +
      '  - "medium" = one image is partially ambiguous (e.g. could read multiple ways)\n' +
      '  - "low"    = images are genuinely ambiguous; do not penalise the student here\n\n' +
      'Return JSON ONLY in this exact shape:\n' +
      '{\n' +
      '  "image1_summary": "<1-2 sentence neutral description>",\n' +
      '  "image2_summary": "<1-2 sentence neutral description>",\n' +
      '  "factual_errors": [\n' +
      '    {"claim": "<what the student said>", "actual": "<what the images show>", "severity": "minor|moderate|major"}\n' +
      '  ],\n' +
      '  "coverage": "FULL|PARTIAL|MINIMAL",\n' +
      '  "confidence": "high|medium|low"\n' +
      '}\n' +
      'If the response has no factual errors, return an empty array for factual_errors.'
  };

  // Helper: fetch URL → { mime, b64 } for any provider. We materialise
  // both fields so each provider's payload builder can reshape as needed.
  function urlToImageData(url) {
    return fetch(url, { mode: 'cors' })
      .then(function (r) {
        if (!r.ok) throw new Error('image fetch ' + r.status);
        return r.blob();
      })
      .then(function (blob) {
        // Downscale before sending — large originals blow past provider request-size
        // limits (Groq/Llama-Scout returns 413 "request_too_large" on multi-MB images).
        function rawBytes() {
          return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onloadend = function () {
              var s = reader.result || '';
              var commaAt = s.indexOf(',');
              resolve({ mime: blob.type || 'image/png', b64: commaAt >= 0 ? s.slice(commaAt + 1) : s });
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }
        if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') return rawBytes();
        return createImageBitmap(blob).then(function (bmp) {
          var maxDim = 1024, w = bmp.width, h = bmp.height;
          var scale = Math.min(1, maxDim / Math.max(w, h));
          w = Math.round(w * scale); h = Math.round(h * scale);
          var c = document.createElement('canvas'); c.width = w; c.height = h;
          c.getContext('2d').drawImage(bmp, 0, 0, w, h);
          try { bmp.close(); } catch (e) {}
          var dataUrl = c.toDataURL('image/jpeg', 0.72);
          return { mime: 'image/jpeg', b64: dataUrl.split(',')[1] };
        }).catch(function () { return rawBytes(); });
      })
      .catch(function (e) {
        console.warn('[Vision] image fetch failed:', url, e.message || e);
        return null;
      });
  }

  // ─── Per-provider request shapers ────────────────────────────────────
  // Each returns a Promise<string> resolving to the raw JSON text the
  // provider produced (which we then JSON.parse upstream).
  // ────────────────────────────────────────────────────────────────────

  async function callGemini(systemPrompt, userText, images) {
    var body = {
      contents: [{
        role: 'user',
        parts: [{ text: systemPrompt + '\n\n' + userText }].concat(
          images.map(function (img) { return { inline_data: { mime_type: img.mime, data: img.b64 } }; })
        )
      }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2, maxOutputTokens: 1200 }
    };
    var res = await fetch(PROVIDER_ENDPOINTS.gemini, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'x-ms-center': ((typeof window !== 'undefined' && window.__CENTER_ID) || 'mock_stream'), 'x-ms-skill': 'vision' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      var t = await res.text().catch(function () { return ''; });
      throw new Error('Gemini ' + res.status + ': ' + t.slice(0, 300));
    }
    var data = await res.json();
    return data && data.candidates && data.candidates[0] && data.candidates[0].content &&
           data.candidates[0].content.parts && data.candidates[0].content.parts[0] &&
           data.candidates[0].content.parts[0].text;
  }

  // OpenAI-style chat body — also used by Llama Scout (Groq exposes the
  // same /chat/completions shape).
  async function callOpenAiCompatible(endpoint, model, systemPrompt, userText, images) {
    var imageParts = images.map(function (img) {
      return { type: 'image_url', image_url: { url: 'data:' + img.mime + ';base64,' + img.b64 } };
    });
    var body = {
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: imageParts.concat([{ type: 'text', text: userText }]) }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1200
    };
    var res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'x-ms-center': ((typeof window !== 'undefined' && window.__CENTER_ID) || 'mock_stream'), 'x-ms-skill': 'vision' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      var t = await res.text().catch(function () { return ''; });
      throw new Error(model + ' ' + res.status + ': ' + t.slice(0, 300));
    }
    var data = await res.json();
    return data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  }

  async function callClaude(systemPrompt, userText, images) {
    var imageParts = images.map(function (img) {
      return { type: 'image', source: { type: 'base64', media_type: img.mime, data: img.b64 } };
    });
    var body = {
      model: PROVIDER_MODELS.claude,
      max_tokens: 1200,
      temperature: 0.2,
      system: systemPrompt,
      messages: [
        { role: 'user', content: imageParts.concat([{ type: 'text', text: userText }]) }
      ]
    };
    var res = await fetch(PROVIDER_ENDPOINTS.claude, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY,
        'x-ms-center': ((typeof window !== 'undefined' && window.__CENTER_ID) || 'mock_stream'),
        'x-ms-skill': 'vision',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      var t = await res.text().catch(function () { return ''; });
      throw new Error('Claude ' + res.status + ': ' + t.slice(0, 300));
    }
    var data = await res.json();
    return data && data.content && data.content[0] && data.content[0].text;
  }

  /**
   * Fact-check student work against image content.
   *
   * @param {Object} opts
   * @param {string} opts.taskType    'ielts-writing-task1' | 'cefr-speaking-q4'
   * @param {string[]} opts.imageUrls Public image URLs
   * @param {string} opts.prompt      Task prompt shown to student
   * @param {string} opts.studentText Student's response (written or transcribed)
   * @param {string=} opts.provider   Override per-call (otherwise reads SITE_CONFIG)
   * @returns {Promise<Object|null>}  Fact-check report, or null if disabled / failed
   */
  window.factCheckImages = async function (opts) {
    if (!window.SITE_CONFIG || window.SITE_CONFIG.visionFactCheck !== true) return null;
    if (!opts || !opts.imageUrls || !opts.imageUrls.length) return null;
    var systemPrompt = SYSTEM_PROMPTS[opts.taskType];
    if (!systemPrompt) { console.warn('[Vision] unknown taskType:', opts.taskType); return null; }
    if (!opts.studentText || !opts.studentText.trim()) return null;

    var provider = (opts.provider || window.SITE_CONFIG.visionFactCheckProvider || 'gemini').toLowerCase();
    if (!PROVIDER_ENDPOINTS[provider]) {
      // NO silent provider substitution (2026-07-24): an unknown vision
      // provider skips the fact-check entirely rather than billing gemini.
      console.warn('[Vision] unknown provider "' + provider + '" — fact-check skipped (no fallback)');
      return null;
    }

    try {
      var imageData = await Promise.all(opts.imageUrls.map(urlToImageData));
      var validImages = imageData.filter(function (d) { return d !== null; });
      if (!validImages.length) { console.warn('[Vision] no images fetched; skipping'); return null; }

      var userText =
        'PROMPT SHOWN TO STUDENT:\n' + opts.prompt + '\n\n' +
        'STUDENT\'S RESPONSE:\n' + opts.studentText;

      var t0 = Date.now();
      var text;
      if (provider === 'gemini') {
        text = await callGemini(systemPrompt, userText, validImages);
      } else if (provider === 'claude') {
        text = await callClaude(systemPrompt, userText, validImages);
      } else {
        // openai + llama-scout share OpenAI-compatible /chat/completions
        text = await callOpenAiCompatible(
          PROVIDER_ENDPOINTS[provider],
          PROVIDER_MODELS[provider],
          systemPrompt, userText, validImages
        );
      }
      if (!text) { console.warn('[Vision] empty response from ' + provider); return null; }
      var report = JSON.parse(text);
      report._provider = provider;
      console.log('[Vision] ' + provider + ' fact-check ' + (Date.now() - t0) + 'ms', report);
      return report;
    } catch (e) {
      console.warn('[Vision] fact-check failed (' + provider + '):', e.message || e);
      return null;
    }
  };

  // ─── Helper: format the Vision report as a text block ready to be
  // appended to a scoring prompt. The default AI reads this as part of
  // its input and uses it to inform Task Achievement scoring. ─────────
  window.formatVisionReportForScoring = function (report, label) {
    if (!report) return '';
    label = label || 'CHART FACT-CHECK';
    var providerTag = report._provider ? ' [' + report._provider + ']' : '';
    var out = '\n=== ' + label + providerTag + ' ===\n';
    if (report.chart_summary)  out += 'Chart actually shows: ' + report.chart_summary + '\n';
    if (report.image1_summary) out += 'Image 1: ' + report.image1_summary + '\n';
    if (report.image2_summary) out += 'Image 2: ' + report.image2_summary + '\n';
    if (report.coverage)       out += 'Coverage: ' + report.coverage + '\n';
    if (report.confidence)     out += 'Vision confidence: ' + report.confidence + '\n';
    // Low-confidence path: don't surface errors as penalties; just include
    // the summaries so the scorer has context but no off-topic cap.
    var lowConf = (report.confidence === 'low');
    if (Array.isArray(report.factual_errors) && report.factual_errors.length && !lowConf) {
      out += 'Factual errors detected:\n';
      report.factual_errors.forEach(function (e) {
        out += '  - [' + (e.severity || '?').toUpperCase() + '] '
            + 'Student claimed: "' + e.claim + '" — Actual: "' + e.actual + '"\n';
      });
    } else {
      out += 'Factual errors detected: none.\n';
    }
    if (lowConf) {
      out += '\n⚠️ Vision confidence was LOW — do NOT apply any image-relevance cap. '
          +  'Score grammar / fluency / lexical / coherence normally.\n';
    } else {
      out += '\n⚠️ USE THIS REPORT to inform Task Achievement scoring:\n';
      out += '  - Any "major" factual error → cap Task Achievement at 5\n';
      out += '  - Any "moderate" factual error → cap Task Achievement at 6\n';
      out += '  - Only "minor" errors or none → no cap from fact-check\n';
      out += '  - Coverage MINIMAL → cap at 5; PARTIAL → cap at 6.5\n';
    }
    out += '====================================\n';
    return out;
  };

  // ─── Helper: build the "no vision pass" preamble when the toggle is
  // OFF and the primary scorer is text-only. Tells the scorer to ignore
  // any image-relevance criterion that might otherwise leak in from the
  // prompt template. The caller injects this in place of the picture
  // context block.
  window.noVisionPreambleForScoring = function (label) {
    label = label || 'IMAGE CHECK SKIPPED';
    return '\n=== ' + label + ' ===\n'
      + 'No vision pass was run for this submission and the scorer cannot see images. '
      + 'DO NOT penalise the candidate for image-relevance or "off-topic vs picture". '
      + 'Score grammar, fluency, lexical resource, coherence and task structure only.\n'
      + '====================================\n';
  };
})();
