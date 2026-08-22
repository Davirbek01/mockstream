// ============================================================================
// attempt-payload.js — build the JSON an attempt is STORED as, on the websites.
// ----------------------------------------------------------------------------
// The `report` Edge Function renders this payload into the review page (score
// strip, passage with the evidence sentence marked per question, verdicts,
// explanations) every time it is opened. Storing the payload instead of a
// pre-rendered report means one format across web, mobile and desktop — and a
// restyle improves every past report at once, with no release.
//
// Keep in step with:
//   supabase/functions/report/renderReadingReview.js  (payload v1 shape)
//   mockstream-runner/src/lib/attemptPayload.ts       (desktop twin)
//   mockstream-mobile/src/lib/attemptPayload.ts       (mobile twin)
// ============================================================================
(function () {
  var NL2 = String.fromCharCode(10, 10);

  /** CEFR parts hold their text as a string, { content }, { paragraphs[] }, or a
   *  `texts` list (matching tasks) — flatten whichever is present. */
  function cefrPartText(part) {
    if (Array.isArray(part.texts)) {
      return part.texts
        .map(function (t) {
          return (t.number ? t.number + '. ' : '') + String(t.content || t.text || '');
        })
        .join(NL2);
    }
    var raw = part.passage;
    if (typeof raw === 'string') return raw;
    if (raw && typeof raw === 'object') {
      if (Array.isArray(raw.paragraphs)) {
        return raw.paragraphs
          .map(function (p) {
            return (p.number ? p.number + ' ' : '') + String(p.content || p.text || '');
          })
          .join(NL2);
      }
      if (raw.content) return String(raw.content);
    }
    return '';
  }

  /** An explanation may be a plain string or { text, quote }; the renderer wants
   *  one string (it splits a trailing curly-quoted sentence back out). */
  function explToText(expl) {
    if (expl == null) return undefined;
    if (typeof expl === 'string') return expl.trim() || undefined;
    if (typeof expl === 'object') {
      var text = String(expl.text || '').trim();
      var quote = String(expl.quote || '').trim();
      return [text, quote ? '“' + quote + '”' : ''].filter(Boolean).join('\n') || undefined;
    }
    return String(expl);
  }


  /** Options can arrive as a real array or as a printed list ("['a', 'b']")
   *  from the authoring tools; return an array either way. */
  function toOptionArray(raw) {
    if (Array.isArray(raw)) return raw;
    if (typeof raw !== 'string') return null;
    var t = raw.trim();
    if (t.charAt(0) !== '[') return null;
    try { return JSON.parse(t); } catch (e) {}
    try { return JSON.parse(t.replace(/'/g, '"')); } catch (e) {}
    return null;
  }

  /** question id → { prompt, options, optionLabels } for an IELTS reading mock.
   *  The stored report used to be a bare answer key; carrying the wording and
   *  the choices makes it the exam window the student actually saw. */
  function ieltsQuestionMeta(data) {
    var meta = {};
    ((data && data.passages) || []).forEach(function (pg) {
      (pg.questionSections || []).forEach(function (sec) {
        var headings = sec.headingsList || sec.headings || null;
        var features = sec.featuresList || null;
        (sec.questions || []).forEach(function (q) {
          var own = toOptionArray(q.options);
          var opts = own || (headings && headings.length ? headings : null) || (features && features.length ? features : null);
          meta[String(q.id)] = {
            prompt: String(q.text || q.question || '').trim() || undefined,
            options: opts && opts.length ? opts : undefined,
            // A headings list is numbered i, ii, iii in the exam window.
            optionLabels: !own && headings && headings.length ? 'roman' : undefined,
          };
        });
      });
    });
    return meta;
  }

  /** Same for CEFR reading parts (questions live directly on the part). */
  function cefrQuestionMeta(data) {
    var meta = {};
    ((data && data.parts) || []).forEach(function (part) {
      var partOpts = toOptionArray(part.options);
      (part.questions || []).forEach(function (q) {
        var opts = toOptionArray(q.options) || partOpts;
        meta[String(q.id)] = {
          prompt: String(q.text || q.question || q.hint || '').trim() || undefined,
          options: opts && opts.length ? opts : undefined,
        };
      });
    });
    return meta;
  }

  /**
   * CEFR reading payload from the page's own state.
   * @param o.data        TEST_DATA (parts[])
   * @param o.userAnswers answers keyed by question id
   * @param o.matches     fn(userAnswer, correctArray) → boolean (the page's own
   *                      matcher, so the report agrees with the score shown)
   * @param o.result      { correct, total, certificateScore, cefrLevel }
   */
  function buildCefrReadingPayload(o) {
    var allParts = (o.data && o.data.parts) || [];
    o._qmeta = cefrQuestionMeta(o.data);
    // Part practice: keep ONLY the practised part, else the report lists the
    // whole mock and marks 29 untouched questions wrong.
    var parts = o.onlyPart
      ? allParts.filter(function (p, i) { return (p.partNumber || i + 1) === Number(o.onlyPart); })
      : allParts;
    var questions = [];
    var perPart = [];

    parts.forEach(function (part, i) {
      var answers = part.answers || {};
      var correctCount = 0;
      var total = 0;
      Object.keys(answers).forEach(function (key) {
        var id = parseInt(String(key).replace(/\D/g, ''), 10);
        if (!isFinite(id)) return;
        var acc = Array.isArray(answers[key]) ? answers[key] : [answers[key]];
        var user = String((o.userAnswers || {})[id] || (o.userAnswers || {})[key] || '').trim();
        var ok = !!user && (o.matches ? !!o.matches(user, acc) : String(acc[0]).toLowerCase() === user.toLowerCase());
        total += 1;
        if (ok) correctCount += 1;
        var cmeta = (o._qmeta || {})[String(id)] || {};
        questions.push({
          id: id,
          correct: ok,
          userAnswer: user,
          correctAnswer: acc.join(' / '),
          prompt: cmeta.prompt,
          options: cmeta.options,
          optionLabels: cmeta.optionLabels,
          explanation: explToText((part.explanations || {})['q' + id] || (part.explanations || {})[id]),
        });
      });
      perPart.push({
        part: part.partNumber || i + 1,
        title: part.title || 'Part ' + (i + 1),
        correct: correctCount,
        total: total,
      });
    });

    questions.sort(function (a, b) {
      return a.id - b.id;
    });

    return {
      v: 1,
      kind: 'cefr-reading',
      student: o.student || 'Student',
      mockNumber: o.mockNumber,
      takenAt: new Date().toISOString(),
      result: {
        // When practising, derive from the practised questions so the header
        // agrees with what is shown.
        correct: o.onlyPart || !(o.result && o.result.correct != null)
          ? questions.filter(function (q) { return q.correct; }).length
          : o.result.correct,
        total: o.onlyPart || !(o.result && o.result.total != null) ? questions.length : o.result.total,
        certificateScore: o.onlyPart ? undefined : (o.result && o.result.certificateScore),
        cefrLevel: o.onlyPart ? undefined : (o.result && o.result.cefrLevel),
        perPart: perPart,
        questions: questions,
      },
      passages: parts.map(function (part, i) {
        return {
          title: part.title || 'Part ' + (i + 1),
          text: cefrPartText(part),
          explanations: part.explanations || {},
        };
      }),
    };
  }

  /**
   * IELTS reading payload from the page's own state. Website mocks keep
   * correctAnswers/explanations at the TOP level (per-passage on newer ones), so
   * both shapes are accepted; every passage receives the explanation map and the
   * renderer keeps only the quotes it can actually locate in that passage.
   * @param o.data     window.IELTS_READING_TEST (passages[], correctAnswers, explanations)
   * @param o.getAnswer fn(qid) → the student's answer string
   * @param o.matches  fn(userAnswer, correctArray) → boolean (page's matcher)
   * @param o.result   { correct, total, band }
   */
  function buildIeltsReadingPayload(o) {
    var data = o.data || {};
    o._qmeta = ieltsQuestionMeta(data);
    var allPassages = data.passages || [];
    var globalAnswers = data.correctAnswers || {};
    var globalExpl = data.explanations || {};
    var questions = [];
    var perPassage = [];

    // Question ids per passage: prefer the passage's own answer/explanation keys,
    // else split the global answer list evenly in order.
    var globalIds = Object.keys(globalAnswers)
      .map(function (k) { return parseInt(String(k).replace(/\D/g, ''), 10); })
      .filter(function (n) { return isFinite(n); })
      .sort(function (a, b) { return a - b; });
    var cursor = 0;
    // Passage practice keeps only the practised passage; ids are still derived
    // from the full mock so numbering stays 1-13 / 14-26 / 27-40 as in the exam.
    var keep = o.onlyPassage ? Number(o.onlyPassage) : 0;
    var passages = allPassages;

    passages.forEach(function (pg, i) {
      var own = pg.correctAnswers || {};
      var ids = Object.keys(own)
        .map(function (k) { return parseInt(String(k).replace(/\D/g, ''), 10); })
        .filter(function (n) { return isFinite(n); })
        .sort(function (a, b) { return a - b; });
      if (!ids.length) {
        var take = Math.round(globalIds.length / Math.max(1, passages.length));
        ids = globalIds.slice(cursor, i === passages.length - 1 ? undefined : cursor + take);
        cursor += ids.length;
      }
      var c = 0;
      var keepThis = !keep || i + 1 === keep;
      ids.forEach(function (id) {
        var raw = own['q' + id] || own[id] || globalAnswers['q' + id] || globalAnswers[id];
        var acc = Array.isArray(raw) ? raw : [raw];
        var user = String(o.getAnswer ? o.getAnswer(id) || '' : '').trim();
        var ok = !!user && (o.matches ? !!o.matches(user, acc) : String(acc[0]).toLowerCase() === user.toLowerCase());
        if (ok) c += 1;
        if (!keepThis) return;
        var imeta = (o._qmeta || {})[String(id)] || {};
        questions.push({
          id: id,
          correct: ok,
          userAnswer: user,
          correctAnswer: acc.join(' / '),
          prompt: imeta.prompt,
          options: imeta.options,
          optionLabels: imeta.optionLabels,
          explanation: explToText(
            (pg.explanations || {})['q' + id] || (pg.explanations || {})[id] ||
            globalExpl['q' + id] || globalExpl[id],
          ),
        });
      });
      if (keep && i + 1 !== keep) return; // practised passage only
      perPassage.push({
        passage: i + 1,
        title: pg.title || pg.shortName || 'Passage ' + (i + 1),
        correct: c,
        total: ids.length,
      });
    });

    return {
      v: 1,
      kind: 'ielts-reading',
      student: o.student || 'Student',
      mockNumber: o.mockNumber,
      takenAt: new Date().toISOString(),
      result: {
        correct: keep || !(o.result && o.result.correct != null)
          ? questions.filter(function (q) { return q.correct; }).length
          : o.result.correct,
        total: keep || !(o.result && o.result.total != null) ? questions.length : o.result.total,
        band: keep ? undefined : (o.result && o.result.band),
        perPassage: perPassage,
        questions: questions,
      },
      passages: allPassages
        .filter(function (pg, i) { return !keep || i + 1 === keep; })
        .map(function (pg, i0) {
        var i = keep ? keep - 1 : i0;
        return {
          title: pg.title || pg.shortName || 'Passage ' + (i + 1),
          text: String(pg.passage || pg.text || ''),
          // Per-passage map when present, else the global one (unmatched quotes
          // are dropped by the renderer, so this can't mislabel a passage).
          explanations: pg.explanations || globalExpl,
        };
      }),
    };
  }

  /**
   * Swap a page's plain report file for the ENCRYPTED locker file, so the
   * Telegram attachment is protected exactly like the View Report link (the
   * code is checked live, server-side; the app never sees it).
   * Returns a File to attach, or null when the locker isn't available (caller
   * then keeps its legacy html/zip).
   * @param centre  window.SITE_CONFIG.testIdentifier
   * @param id      the id sendToSupabase returned
   * @param name    base filename, e.g. 'Davirbek_IELTS_Reading_Mock02'
   * @param ext     'json' (attempt payload, default) or 'html' (a stored report
   *                such as writing — encrypted as it stands)
   */
  async function fetchLockedReportFile(centre, id, name, ext) {
    var SB = (window.SUPABASE_URL || 'https://zknyukkbtbcqgvkgjktb.supabase.co');
    var path = centre + '/' + id + '.' + (ext === 'html' ? 'html' : 'json');
    var url = SB + '/functions/v1/report-locked?p=' + encodeURIComponent(path);
    var last = '';
    var tries = 0;

    // Three tries, 0.5 s and 1.5 s apart. This runs at the busiest moment of a
    // submission — the report has just been uploaded and a scoring call may
    // still be retrying — and one dropped connection here costs the channel
    // its encrypted copy for good.
    for (var attempt = 1; attempt <= 3; attempt++) {
      tries = attempt;
      try {
        var r = await fetch(url);
        if (r.ok) {
          var html = await r.text();
          // A locker that answers 200 with nothing is not a report; treat it
          // as a failure rather than attaching an empty file.
          if (html && html.length > 200) {
            return new File([html], (name || 'report') + '_locked.html', { type: 'text/html' });
          }
          last = 'empty body';
        } else {
          last = 'HTTP ' + r.status;
          // 4xx = the path is wrong or the report is not stored. Retrying
          // cannot change that; only 408/429 are worth another go.
          if (r.status >= 400 && r.status < 500 && r.status !== 408 && r.status !== 429) break;
        }
      } catch (e) {
        last = (e && e.message) || 'network error';
      }
      if (attempt < 3) await new Promise(function (r2) { setTimeout(r2, attempt === 1 ? 500 : 1500); });
    }

    console.warn('[locked report] giving up after ' + tries + ' tr' + (tries === 1 ? 'y' : 'ies') + ' (' + last +
                 ') — the channel gets the legacy zip for ' + path);
    return null;
  }


  // ── Violation log for the STORED report ─────────────────────────────────
  // It used to travel as violation_report.json inside the zip; the encrypted
  // html replaced the zip, so the detail now rides inside the report itself
  // (the header already shows the count).
  function violationDetailsHtml(list, tabSwitches, blurs) {
    var esc = function (x) { return String(x == null ? '' : x).replace(/[<>&]/g, ''); };
    var rows = (list || []).map(function (v) {
      var t = '';
      try { t = new Date(v.timestamp).toLocaleString('en-GB'); } catch (e) { t = String(v.timestamp || ''); }
      return '<tr><td style="padding:6px">' + esc(v.type) + '</td>' +
             '<td style="padding:6px;text-align:center">' + (v.count == null ? '' : esc(v.count)) + '</td>' +
             '<td style="padding:6px">' + esc(t) + '</td></tr>';
    }).join('');
    if (!rows) {
      return '<details style="margin:18px 0"><summary style="cursor:pointer;font-weight:700">' +
        'Exam integrity — no violations detected</summary></details>';
    }
    return '<details style="margin:18px 0"><summary style="cursor:pointer;font-weight:700;color:#b91c1c">' +
      'Exam integrity — ' + list.length + ' violation(s)</summary>' +
      '<div style="font-size:13px;color:#475569;margin:8px 0">Tab switches: ' + (tabSwitches || 0) +
      ' &middot; Window blurs: ' + (blurs || 0) + '</div>' +
      '<table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #e2e8f0">' +
      '<tr style="background:#f1f5f9"><th style="text-align:left;padding:6px">Type</th>' +
      '<th style="padding:6px">Count</th><th style="text-align:left;padding:6px">Time</th></tr>' +
      rows + '</table></details>';
  }

  /** Append the violation log to a finished report, just before </body>. */
  function withViolationLog(html, list, tabSwitches, blurs) {
    var block = violationDetailsHtml(list, tabSwitches, blurs);
    if (!html) return html;
    return html.indexOf('</body>') !== -1 ? html.replace('</body>', block + '</body>') : html + block;
  }

  window.violationDetailsHtml = violationDetailsHtml;
  window.withViolationLog = withViolationLog;

  window.buildCefrReadingPayload = buildCefrReadingPayload;
  window.buildIeltsReadingPayload = buildIeltsReadingPayload;
  window.fetchLockedReportFile = fetchLockedReportFile;
})();
