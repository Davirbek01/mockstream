// =====================================================================
// Vision fact-check helper (Gemini 2.0 Flash via ai-proxy)
// =====================================================================
// One module, two callers today:
//   - Writing IELTS Mock.html (Task 1 chart description)
//   - Speaking Mocks.html (CEFR Speaking Q4 image-pair)
//
// What it does:
//   1. Reads window.SITE_CONFIG.visionFactCheck. If false → returns null.
//      (Centre admin opted out; no Vision call, no extra cost.)
//   2. Fetches each image URL → base64.
//   3. POSTs to ai-proxy with Gemini 2.0 Flash + system prompt + images.
//      Vision is FORCED to Gemini regardless of the centre's default
//      AI provider — this is the whole point of the design.
//   4. Returns a structured JSON fact-check report. The caller then
//      injects this into the main scoring prompt so the default AI
//      scores Task Achievement with chart-aware context.
//
// Failure mode: any error (network, broken image URL, Gemini 5xx)
// returns null. The caller falls back to text-only scoring. Student
// always gets a score, just without the fact-check that one time.
// =====================================================================

(function () {
  if (window.factCheckImages) return; // idempotent

  var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
  var GEMINI_ENDPOINT = SB_URL + '/functions/v1/ai-proxy/gemini/v1beta/models/gemini-2.0-flash:generateContent';

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
      'Return JSON ONLY in this exact shape:\n' +
      '{\n' +
      '  "chart_summary": "<1-2 sentence neutral description of what the chart actually shows>",\n' +
      '  "factual_errors": [\n' +
      '    {"claim": "<what the student said>", "actual": "<what the chart shows>", "severity": "minor|moderate|major"}\n' +
      '  ],\n' +
      '  "coverage": "FULL|PARTIAL|MINIMAL"\n' +
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
      'Return JSON ONLY in this exact shape:\n' +
      '{\n' +
      '  "image1_summary": "<1-2 sentence neutral description>",\n' +
      '  "image2_summary": "<1-2 sentence neutral description>",\n' +
      '  "factual_errors": [\n' +
      '    {"claim": "<what the student said>", "actual": "<what the images show>", "severity": "minor|moderate|major"}\n' +
      '  ],\n' +
      '  "coverage": "FULL|PARTIAL|MINIMAL"\n' +
      '}\n' +
      'If the response has no factual errors, return an empty array for factual_errors.'
  };

  // Helper: fetch URL → base64 inline_data part for Gemini.
  // Failure on any single image returns null for that slot; the caller
  // filters nulls out. Cross-origin fetches need CORS to be permissive
  // on the image host (GCS bucket with allUsers Object Viewer is fine;
  // ImgBB is fine; some private hosts may block).
  function urlToInlinePart(url) {
    return fetch(url, { mode: 'cors' })
      .then(function (r) {
        if (!r.ok) throw new Error('image fetch ' + r.status);
        return r.blob();
      })
      .then(function (blob) {
        return new Promise(function (resolve, reject) {
          var reader = new FileReader();
          reader.onloadend = function () {
            try {
              var s = reader.result || '';
              var commaAt = s.indexOf(',');
              var b64 = commaAt >= 0 ? s.slice(commaAt + 1) : s;
              resolve({
                inline_data: {
                  mime_type: blob.type || 'image/png',
                  data: b64
                }
              });
            } catch (e) { reject(e); }
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      })
      .catch(function (e) {
        console.warn('[Vision] image fetch failed:', url, e.message || e);
        return null;
      });
  }

  /**
   * Fact-check student work against image content.
   *
   * @param {Object} opts
   * @param {string} opts.taskType    'ielts-writing-task1' | 'cefr-speaking-q4'
   * @param {string[]} opts.imageUrls Public image URLs to send to Gemini
   * @param {string} opts.prompt      Task prompt shown to student
   * @param {string} opts.studentText Student's response (written or transcribed)
   * @returns {Promise<Object|null>}  Fact-check report, or null if disabled / failed
   */
  window.factCheckImages = async function (opts) {
    // Toggle: per-centre admin setting from window.SITE_CONFIG.
    if (!window.SITE_CONFIG || window.SITE_CONFIG.visionFactCheck !== true) {
      return null;
    }
    if (!opts || !opts.imageUrls || !opts.imageUrls.length) return null;
    var systemPrompt = SYSTEM_PROMPTS[opts.taskType];
    if (!systemPrompt) {
      console.warn('[Vision] unknown taskType:', opts.taskType);
      return null;
    }
    if (!opts.studentText || !opts.studentText.trim()) {
      // No response = nothing to fact-check; skip silently.
      return null;
    }

    try {
      // 1) Fetch each image as inline base64.
      var imageParts = await Promise.all(opts.imageUrls.map(urlToInlinePart));
      var validImages = imageParts.filter(function (p) { return p !== null; });
      if (!validImages.length) {
        console.warn('[Vision] no images could be fetched; skipping');
        return null;
      }

      // 2) Build the multimodal request body.
      var userText =
        'PROMPT SHOWN TO STUDENT:\n' + opts.prompt + '\n\n' +
        'STUDENT\'S RESPONSE:\n' + opts.studentText;

      var body = {
        contents: [{
          role: 'user',
          parts: [{ text: systemPrompt + '\n\n' + userText }].concat(validImages)
        }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
          maxOutputTokens: 1200
        }
      };

      // 3) Call Gemini 2.0 Flash via ai-proxy.
      var t0 = Date.now();
      var res = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SB_KEY,
          'Authorization': 'Bearer ' + SB_KEY
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        var errText = await res.text().catch(function () { return ''; });
        console.warn('[Vision] ai-proxy ' + res.status + ': ' + errText.slice(0, 300));
        return null;
      }
      var data = await res.json();
      var text = data && data.candidates && data.candidates[0] &&
                 data.candidates[0].content && data.candidates[0].content.parts &&
                 data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
      if (!text) {
        console.warn('[Vision] empty response from Gemini');
        return null;
      }
      var report = JSON.parse(text);
      console.log('[Vision] fact-check completed in ' + (Date.now() - t0) + 'ms', report);
      return report;
    } catch (e) {
      console.warn('[Vision] fact-check failed:', e.message || e);
      return null;
    }
  };

  // ─── Helper: format the Vision report as a text block ready to be
  // appended to a scoring prompt. The default AI reads this as part of
  // its input and uses it to inform Task Achievement scoring. ─────────
  window.formatVisionReportForScoring = function (report, label) {
    if (!report) return '';
    label = label || 'CHART FACT-CHECK (Gemini Vision)';
    var out = '\n=== ' + label + ' ===\n';
    if (report.chart_summary) out += 'Chart actually shows: ' + report.chart_summary + '\n';
    if (report.image1_summary) out += 'Image 1: ' + report.image1_summary + '\n';
    if (report.image2_summary) out += 'Image 2: ' + report.image2_summary + '\n';
    if (report.coverage) out += 'Coverage: ' + report.coverage + '\n';
    if (Array.isArray(report.factual_errors) && report.factual_errors.length) {
      out += 'Factual errors detected:\n';
      report.factual_errors.forEach(function (e) {
        out += '  - [' + (e.severity || '?').toUpperCase() + '] '
            + 'Student claimed: "' + e.claim + '" — Actual: "' + e.actual + '"\n';
      });
    } else {
      out += 'Factual errors detected: none.\n';
    }
    out += '\n⚠️ USE THIS REPORT to inform Task Achievement scoring:\n';
    out += '  - Any "major" factual error → cap Task Achievement at 5\n';
    out += '  - Any "moderate" factual error → cap Task Achievement at 6\n';
    out += '  - Only "minor" errors or none → no cap from fact-check\n';
    out += '  - Coverage MINIMAL → cap at 5; PARTIAL → cap at 6.5\n';
    out += '====================================\n';
    return out;
  };
})();
