/* ============================================================================
 * listening-review-bar — the score strip that sits above the exam window after
 * a listening mock is submitted.
 * ----------------------------------------------------------------------------
 * The exam page already marks the questions in place (showReview). What it
 * lacked was the header the stored report has: the three score tiles, the
 * per-part scores, and the Answers table. This adds exactly that, so the
 * in-app screen and the report a student opens later are the same thing.
 *
 * Loaded by CEFR Listening.html and IELTS listening.html — one file, because a
 * copy in each page is a copy that drifts.
 * ========================================================================== */
(function () {
  'use strict';

  var CSS = [
    '#lrBar{position:sticky;top:0;z-index:900;background:linear-gradient(90deg,rgba(13,148,136,.10),rgba(13,148,136,.02)),#fff;',
    ' border-bottom:1px solid #e5e7eb;padding:10px 16px;display:flex;flex-direction:column;gap:8px}',
    '#lrBar .lrb-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}',
    '#lrBar .lrb-tile{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:7px 16px;text-align:center;',
    ' min-width:96px;box-shadow:0 1px 2px rgba(15,23,42,.04)}',
    '#lrBar .lrb-tile .n{font-size:22px;font-weight:800;line-height:1.05;color:#0d9488}',
    '#lrBar .lrb-tile .n span{font-size:14px;font-weight:700;color:#64748b}',
    '#lrBar .lrb-tile .l{font-size:10px;text-transform:uppercase;letter-spacing:.7px;color:#64748b;margin-top:2px;font-weight:700}',
    '#lrBar .lrb-tile.lvl .n{color:#b45309}',
    '#lrBar .lrb-btn{border:1px solid #e5e7eb;background:#fff;border-radius:999px;padding:7px 14px;font-size:13.5px;',
    ' font-weight:600;cursor:pointer;color:#0f172a}',
    '#lrBar .lrb-btn:hover{border-color:#0d9488}',
    '#lrBar .lrb-btn.on{background:#0d9488;border-color:#0d9488;color:#fff}',
    '#lrBar .lrb-who{color:#64748b;font-size:12.5px;margin-left:auto}',
    /* answers drawer — half the screen on a desktop so the paper stays beside
       it, the whole screen on a phone where half of anything is unreadable */
    '#lrAnswers{position:fixed;top:0;right:0;bottom:0;width:50%;min-width:420px;max-width:760px;background:#fff;',
    ' border-left:1px solid #e5e7eb;box-shadow:-18px 0 40px rgba(15,23,42,.18);z-index:1200;display:flex;',
    ' flex-direction:column;transform:translateX(102%);transition:transform .22s ease}',
    '#lrAnswers.open{transform:none}',
    '#lrAnswers .hd{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid #e5e7eb;',
    ' background:linear-gradient(90deg,rgba(13,148,136,.10),rgba(13,148,136,.02))}',
    '#lrAnswers .hd h3{margin:0;font-size:15px}',
    '#lrAnswers .hd .sub{color:#64748b;font-size:12.5px}',
    '#lrAnswers .x{margin-left:auto;border:1px solid #e5e7eb;background:#fff;border-radius:10px;width:34px;height:34px;',
    ' font-size:16px;cursor:pointer;line-height:1}',
    '#lrAnswers .sc{overflow:auto;padding:0 0 24px}',
    '#lrAnswers table{width:100%;border-collapse:collapse;font-size:13.5px}',
    '#lrAnswers th,#lrAnswers td{border-bottom:1px solid #e5e7eb;padding:8px 14px;text-align:left}',
    '#lrAnswers th{background:#f8fafc;font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:#64748b;',
    ' position:sticky;top:0;z-index:1}',
    '#lrAnswers tr.part td{background:#f1f5f9;font-weight:800;font-size:12.5px}',
    '#lrAnswers td.q{width:48px;font-weight:800;color:#64748b}',
    '#lrAnswers td.mine.no{color:#991b1b;text-decoration:line-through}',
    '#lrAnswers td.mine.ok{color:#14532d;font-weight:700}',
    '#lrAnswers td.mine.blank{color:#991b1b;font-style:italic}',
    '#lrAnswers td.key{font-weight:700;color:#166534}',
    '#lrAnswers td.v{width:52px;text-align:center;font-weight:800}',
    '#lrAnswers td.v.ok{color:#10b981}',
    '#lrAnswers td.v.no{color:#ef4444}',
    '#lrBackdrop{position:fixed;inset:0;background:rgba(15,23,42,.35);z-index:1150;opacity:0;pointer-events:none;',
    ' transition:opacity .22s ease}',
    '#lrBackdrop.open{opacity:1;pointer-events:auto}',
    '@media (max-width:820px){',
    '  #lrBar{padding:8px 10px}',
    '  #lrBar .lrb-tile{flex:1 1 0;min-width:0;padding:7px 4px}',
    '  #lrBar .lrb-tile .n{font-size:19px}',
    '  #lrBar .lrb-tile.lvl .n{font-size:16px}',
    '  #lrBar .lrb-tile .l{font-size:9px;letter-spacing:.4px}',
    '  #lrBar .lrb-who{display:none}',
    '  #lrAnswers{width:100%;min-width:0;max-width:none;border-left:0}',
    '}'
  ].join('');

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function el(html) {
    var d = document.createElement('div');
    d.innerHTML = html;
    return d.firstElementChild;
  }

  function tiles(r, exam) {
    var out = '<div class="lrb-tile"><div class="n">' + esc(r.correct) +
      '<span>/' + esc(r.total) + '</span></div><div class="l">Correct</div></div>';
    if (exam === 'ielts') {
      if (r.band != null) out += '<div class="lrb-tile lvl"><div class="n">' + esc(r.band) + '</div><div class="l">Band</div></div>';
    } else {
      if (r.certificateScore != null) {
        out += '<div class="lrb-tile"><div class="n">' + esc(r.certificateScore) +
          '<span>/75</span></div><div class="l">Certificate</div></div>';
      }
      if (r.cefrLevel) out += '<div class="lrb-tile lvl"><div class="n">' + esc(r.cefrLevel) + '</div><div class="l">Level</div></div>';
    }
    return out;
  }

  function answersTable(r) {
    var byPart = {};
    (r.questions || []).forEach(function (q) {
      var k = q.part == null ? 0 : Number(q.part);
      (byPart[k] = byPart[k] || []).push(q);
    });
    var titleFor = function (n) {
      var p = (r.perPart || []).filter(function (x) { return Number(x.part) === Number(n); })[0];
      return p ? (p.title || 'Part ' + n) + ' · ' + p.correct + '/' + p.total : 'Part ' + n;
    };
    var rows = Object.keys(byPart).map(Number).sort(function (a, b) { return a - b; }).map(function (k) {
      var head = k ? '<tr class="part"><td colspan="4">' + esc(titleFor(k)) + '</td></tr>' : '';
      return head + byPart[k].sort(function (a, b) { return a.id - b.id; }).map(function (q) {
        var mine = String(q.userAnswer || '').trim();
        var cls = !mine ? 'blank' : q.correct ? 'ok' : 'no';
        return '<tr><td class="q">' + esc(q.id) + '</td>' +
          '<td class="mine ' + cls + '">' + (mine ? esc(mine) : 'not answered') + '</td>' +
          '<td class="key">' + esc(q.correctAnswer || '') + '</td>' +
          '<td class="v ' + (q.correct ? 'ok' : 'no') + '">' + (q.correct ? '✓' : '✗') + '</td></tr>';
      }).join('');
    }).join('');

    return '<aside id="lrAnswers" aria-hidden="true">' +
      '<div class="hd"><div><h3>Answers</h3><div class="sub">' + esc(r.correct) + ' of ' + esc(r.total) +
      ' correct</div></div><button class="x" id="lrAnswersClose" aria-label="Close">✕</button></div>' +
      '<div class="sc"><table><tr><th>Q</th><th>Your answer</th><th>Correct answer</th><th></th></tr>' +
      rows + '</table></div></aside>';
  }

  /** Per-part scores go into the part buttons the page already renders, so the
   *  strip doesn't repeat a row of chips the student is looking at anyway. */
  function fillPartStatus(r) {
    (r.perPart || []).forEach(function (p, i) {
      // CEFR ships a status span inside each part button; IELTS buttons carry a
      // data-part index and nothing to write into, so make the span there.
      var span = document.getElementById('status-p' + i);
      if (!span) {
        var btn = document.querySelector('.part-btn[data-part="' + i + '"]');
        if (!btn) return;
        span = btn.querySelector('.lrb-partscore');
        if (!span) {
          span = document.createElement('span');
          span.className = 'lrb-partscore';
          span.style.marginLeft = '6px';
          btn.appendChild(span);
        }
      }
      var good = p.total ? p.correct / p.total >= 0.6 : false;
      span.textContent = p.correct + '/' + p.total;
      span.style.cssText += ';font-weight:800;color:' + (good ? '#10b981' : '#ef4444');
    });
  }

  /** The exam harness falls back to 'Unknown' when no name was captured —
   *  printing that is worse than printing nothing. */
  function who(payload) {
    var name = String(payload.student || '').trim();
    if (!name || name.toLowerCase() === 'unknown' || name.toLowerCase() === 'student') return '';
    return '<span class="lrb-who">' + esc(name) + '</span>';
  }

  var mounted = false;

  function mount(opts) {
    if (mounted) return;
    var payload = opts && opts.payload;
    var r = payload && payload.result;
    if (!r) return;
    mounted = true;

    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var btns = '<button class="lrb-btn" id="lrAnswersBtn">📋 Answers</button>';
    // The old results modal is still reachable — it carries the per-part
    // breakdown with explanations, which the drawer deliberately keeps short.
    if (opts.onDetails) btns += '<button class="lrb-btn" id="lrDetails">📊 Details</button>';
    if (opts.onTranscripts) btns += '<button class="lrb-btn" id="lrTranscripts">📜 Transcript</button>';
    if (opts.onTryAgain) btns += '<button class="lrb-btn" id="lrTryAgain">🔄 Try Again</button>';
    if (opts.onBack) btns += '<button class="lrb-btn" id="lrBack">← Back</button>';

    var bar = el('<div id="lrBar">' +
      '<div class="lrb-row">' + tiles(r, payload.kind === 'ielts-listening' ? 'ielts' : 'cefr') + '</div>' +
      '<div class="lrb-row">' + btns + who(payload) + '</div></div>');
    document.body.insertBefore(bar, document.body.firstChild);

    var back = el('<div id="lrBackdrop"></div>');
    document.body.appendChild(back);
    document.body.appendChild(el(answersTable(r)));

    var drawer = document.getElementById('lrAnswers');
    var btn = document.getElementById('lrAnswersBtn');
    function setOpen(on) {
      drawer.classList.toggle('open', on);
      drawer.setAttribute('aria-hidden', String(!on));
      back.classList.toggle('open', on);
      btn.classList.toggle('on', on);
      // On a phone the drawer covers everything, so the page behind it must not
      // scroll away underneath.
      document.body.style.overflow = on && window.matchMedia('(max-width:820px)').matches ? 'hidden' : '';
    }
    btn.addEventListener('click', function () { setOpen(!drawer.classList.contains('open')); });
    document.getElementById('lrAnswersClose').addEventListener('click', function () { setOpen(false); });
    back.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });

    if (opts.onDetails) document.getElementById('lrDetails').addEventListener('click', opts.onDetails);
    if (opts.onTranscripts) document.getElementById('lrTranscripts').addEventListener('click', opts.onTranscripts);
    if (opts.onTryAgain) document.getElementById('lrTryAgain').addEventListener('click', opts.onTryAgain);
    if (opts.onBack) document.getElementById('lrBack').addEventListener('click', opts.onBack);

    var timer = document.querySelector('.timer-box');
    if (timer) timer.style.display = 'none';

    fillPartStatus(r);
  }

  window.ListeningReviewBar = { mount: mount };
})();
