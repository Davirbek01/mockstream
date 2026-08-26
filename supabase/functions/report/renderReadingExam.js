// ============================================================================
// renderReadingExam — a submitted reading mock, drawn as the paper the student
// actually sat.
// ----------------------------------------------------------------------------
// What this replaces: a two-column analysis that listed each question as a card
// reading "Your answer: — · Correct: D / health workers outside psychology".
// The other options were never shown, so a student could not see what they had
// chosen D from, nor why their own pick was wrong. The passage was there, but
// the questions were a summary of the paper rather than the paper.
//
// So: the passage as it was, every question as it was, every option as it was —
// the student's pick struck through, the right one marked, and the explanation
// underneath where the mock carries one.
//
// Part shapes in CEFR reading (all four appear in the live mocks):
//   gap-fill-text        passage {title, content} with <span data-gap="N">
//   matching             texts[] + statements[] (+ extraStatements)
//   matching-headings    passage {title, paragraphs[]} + headings[]
//   reading-comprehension passage {title, content} + questionSections[]:
//                          mcq (options per question), tfni (options on the
//                          section), gap-fill (summaryText with gaps)
// IELTS passages are questionSections only.
//
// Shares its strip, Answers drawer, gap markup and option rows with the
// listening paper — see examReviewShell.
// ============================================================================
import { CSS } from './reviewShell.js';
import {
  EXAM_CSS, LETTERS, answersTable, esc, gapHtml, gappedHtml, gappedText,
  htmlToText, optionQuestion, verdictMap,
} from './examReviewShell.js';

const READ_CSS = `
.rx-passage{border:1px solid var(--line);border-radius:12px;background:#fff;padding:20px 22px;margin:12px 0 18px;
 line-height:1.85;font-size:15px}
.rx-passage h3{margin:0 0 14px;text-align:center;font-size:16px}
.rx-passage p{margin:0 0 12px}
.rx-para{display:flex;gap:14px;margin:0 0 14px}
.rx-para-n{flex:0 0 auto;font-weight:800;color:var(--teal);min-width:34px}
.rx-bank{border:1px solid var(--line);border-radius:12px;background:#f8fafc;padding:14px 18px;margin:12px 0}
.rx-bank h4{margin:0 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:.6px;color:var(--muted)}
.rx-bank p{margin:5px 0;font-size:14px}
.rx-text{border:1px solid var(--line);border-radius:12px;background:#fff;padding:14px 18px;margin:10px 0}
.rx-text .n{display:inline-block;background:var(--teal);color:#fff;font-weight:800;border-radius:8px;
 padding:1px 9px;margin-bottom:7px;font-size:13px}
.rx-expl{margin:8px 0 0;padding:9px 13px;background:#fffbeb;border-left:3px solid #f59e0b;border-radius:0 8px 8px 0;
 font-size:13.5px;line-height:1.55;color:#78350f}
.rx-sec{margin:18px 0 6px}
.rx-sec h4{margin:0 0 4px;font-size:14.5px}
.rx-sec p{margin:0 0 10px;color:var(--muted);font-size:13.5px}
`;

/** The explanation the mock ships for a question, if any.
 *  Mocks store these as plain text, as HTML, or as an object with the text
 *  under one of several keys — printing "[object Object]" at a student would
 *  be worse than printing nothing. */
function explain(v) {
  let e = v && v.explanation;
  if (e && typeof e === 'object') e = e.text ?? e.content ?? e.explanation ?? e.reason ?? '';
  const t = htmlToText(String(e ?? '')).trim();
  return t ? `<p class="rx-expl">💡 ${esc(t)}</p>` : '';
}

/** A question answered by choosing a letter (matching, headings, tfni without
 *  per-question options). Shows every letter, the pick and the right one. */
function letterQuestion(id, label, letters, vm) {
  const v = vm.get(String(id));
  const chosen = String((v && v.userAnswer) || '').trim().toUpperCase();
  const right = String((v && v.correctAnswer) || '').trim().toUpperCase();
  const cells = letters.map((l) => {
    const L = String(l).toUpperCase();
    const kls = L === right ? 'right' : L === chosen ? 'chose' : '';
    return `<span class="lx-letter ${kls}">${esc(L)}${L === right ? ' ✓' : ''}</span>`;
  }).join('');
  const tag = !v ? ''
    : v.correct ? '<span class="lx-tag ok">✓ correct</span>'
    : `<span class="lx-tag no">✗ correct: ${esc(right || '—')}</span>`;
  return `<div class="lx-q ${v && v.correct ? 'ok' : 'no'}" data-ok="${v && v.correct ? 1 : 0}">
    <div class="lx-qhead"><span class="lx-n">${esc(id)}</span>
      <span class="lx-qtext">${esc(label || '')}</span>${tag}</div>
    <div class="lx-letters">${cells}</div>${explain(v)}</div>`;
}

/** The option bank a matching task chooses from. */
function bank(title, items, extras) {
  const rows = (items || []).map((o, i) => {
    const letter = String(o.letter || LETTERS[i] || '').toUpperCase();
    return `<p><b>${esc(letter)}.</b> ${esc(htmlToText(o.text || o))}</p>`;
  }).join('');
  const spare = (extras || []).length
    ? `<p style="color:var(--muted);font-size:12.5px;margin-top:9px">
         Also offered, matching nothing: ${(extras || []).map((x) => esc(String(x))).join(', ')}</p>`
    : '';
  if (!rows) return '';
  return `<div class="rx-bank">${title ? `<h4>${esc(title)}</h4>` : ''}${rows}${spare}</div>`;
}

/** passage: { title, content } or { title, paragraphs:[{number,content}] }. */
function passageBlock(passage, vm) {
  if (!passage) return '';
  const p = typeof passage === 'string' ? { content: passage } : passage;
  const head = p.title ? `<h3>${esc(htmlToText(p.title))}</h3>` : '';

  if (Array.isArray(p.paragraphs)) {
    const body = p.paragraphs.map((par) => `
      <div class="rx-para">
        <span class="rx-para-n">${esc(String(par.number ?? ''))}</span>
        <div>${esc(htmlToText(par.content ?? par.text ?? ''))}</div>
      </div>`).join('');
    return `<div class="rx-passage">${head}${body}</div>`;
  }

  const content = String(p.content ?? p.text ?? '');
  // A gapped passage keeps its gaps — the student's word goes back where they
  // typed it, which is the whole point of showing the passage at all.
  const body = /data-gap=|<input/i.test(content)
    ? gappedHtml(content, vm)
    : `<div class="lx-html">${gappedHtml(content, vm)}</div>`;
  return `<div class="rx-passage">${head}${body}</div>`;
}

/** reading-comprehension: the passage, then each section of questions. */
function sections(list, vm) {
  return (list || []).map((sec) => {
    const type = String(sec.type || '').toLowerCase();
    const head = `<div class="rx-sec">
      ${sec.title ? `<h4>${esc(htmlToText(sec.title))}</h4>` : ''}
      ${sec.instruction ? `<p>${esc(htmlToText(sec.instruction))}</p>` : ''}</div>`;

    if (type === 'mcq') {
      return head + (sec.questions || []).map((q) => {
        const v = vm.get(String(q.id));
        return optionQuestion(q, vm).replace('</div>\n  </div>', '</div>' + explain(v) + '</div>');
      }).join('');
    }

    if (type === 'tfni') {
      // The three choices sit on the SECTION, not on each question.
      const opts = (sec.options || []).map((o, i) => ({
        letter: String((o && o.letter) || LETTERS[i] || '').toUpperCase(),
        text: (o && o.text) || o,
      }));
      const letters = opts.length ? opts.map((o) => o.letter) : ['A', 'B', 'C'];
      const legend = opts.length
        ? `<div class="rx-bank">${opts.map((o) => `<p><b>${esc(o.letter)}.</b> ${esc(htmlToText(o.text))}</p>`).join('')}</div>`
        : '';
      return head + legend + (sec.questions || []).map((q) =>
        letterQuestion(q.id, htmlToText(q.text || ''), letters, vm)).join('');
    }

    if (type === 'gap-fill') {
      const summary = String(sec.summaryText || sec.summary || '');
      const title = sec.summaryTitle ? `<h3>${esc(htmlToText(sec.summaryTitle))}</h3>` : '';
      const body = /data-gap=|<input/i.test(summary) ? gappedHtml(summary, vm) : gappedText(summary, vm);
      const loose = (sec.questions || [])
        .filter((q) => !new RegExp(`data-gap=["']${q.id}["']`).test(summary))
        .map((q) => {
          const v = vm.get(String(q.id));
          return `<p class="lx-row">${q.hint ? `<span>${esc(htmlToText(q.hint))}</span>` : ''}
            <span class="lx-gap">${gapHtml(q.id, v)}</span></p>${explain(v)}`;
        }).join('');
      return head + `<div class="rx-passage">${title}${body}${loose}</div>`;
    }

    // Unknown section type: still show its questions rather than nothing.
    return head + (sec.questions || []).map((q) => {
      const v = vm.get(String(q.id));
      return `<div class="lx-q ${v && v.correct ? 'ok' : 'no'}">
        <div class="lx-qhead"><span class="lx-n">${esc(q.id)}</span>
          <span class="lx-qtext">${esc(htmlToText(q.text || q.hint || ''))}</span></div>
        <p class="lx-row"><span class="lx-gap">${gapHtml(q.id, v)}</span></p>${explain(v)}</div>`;
    }).join('');
  }).join('');
}

/** One part of the paper. */
function partBody(part, vm) {
  const type = String(part.type || '').toLowerCase();
  let out = '';
  if (part.instruction) out += `<p class="lx-instr">${esc(htmlToText(part.instruction))}</p>`;

  if (type === 'gap-fill-text') {
    out += passageBlock(part.passage, vm);
    if (part.wordBank) out += bank('Word bank', (part.wordBank || []).map((w) => ({ text: w })), null);
    // Any gap the passage did not carry inline still needs its answer shown.
    const content = String((part.passage && (part.passage.content || part.passage.text)) || '');
    const missed = (part.questions || []).filter((q) => !new RegExp(`data-gap=["']${q.id}["']`).test(content));
    out += missed.map((q) => {
      const v = vm.get(String(q.id));
      return `<p class="lx-row">${q.hint ? `<span>${esc(htmlToText(q.hint))}</span>` : ''}
        <span class="lx-gap">${gapHtml(q.id, v)}</span></p>${explain(v)}`;
    }).join('');
    // Explanations for the gaps that WERE inline.
    out += (part.questions || []).filter((q) => !missed.includes(q)).map((q) => {
      const v = vm.get(String(q.id));
      const e = explain(v);
      return e ? `<div class="lx-q ${v && v.correct ? 'ok' : 'no'}">
        <div class="lx-qhead"><span class="lx-n">${esc(q.id)}</span>
          <span class="lx-qtext">${esc(htmlToText(q.hint || ''))}</span></div>${e}</div>` : '';
    }).join('');
    return out;
  }

  if (type === 'matching') {
    const letters = [...(part.statements || []).map((st, i) => String(st.letter || LETTERS[i] || '')),
                     ...(part.extraStatements || []).map(String)];
    const statementBank = bank(part.topicTitle || 'Statements', part.statements, part.extraStatements);
    const texts = (part.texts || []).map((t) => `
      <div class="rx-text"><span class="n">${esc(String(t.number ?? ''))}</span>
        <div>${esc(htmlToText(t.content ?? t.text ?? ''))}</div></div>`).join('');
    const qs = (part.questions || []).map((q) => {
      const t = (part.texts || []).find((x) => String(x.number) === String(q.textNumber));
      const label = t ? `Text ${q.textNumber}` : '';
      return letterQuestion(q.id, label, letters, vm);
    }).join('');
    // statementsFirst decides which side the paper showed first.
    return out + (part.statementsFirst ? statementBank + texts : texts + statementBank) + qs;
  }

  if (type === 'matching-headings') {
    const letters = [...(part.headings || []).map((h, i) => String(h.letter || LETTERS[i] || '')),
                     ...(part.extraHeadings || []).map(String)];
    out += bank('Headings', part.headings, part.extraHeadings);
    out += passageBlock(part.passage, vm);
    out += (part.questions || []).map((q) =>
      letterQuestion(q.id, q.paragraphNumber ? `Paragraph ${q.paragraphNumber}` : '', letters, vm)).join('');
    if (part.closingParagraph) out += `<div class="rx-passage">${esc(htmlToText(part.closingParagraph))}</div>`;
    return out;
  }

  // reading-comprehension, and the IELTS passages, which are sections only.
  out += passageBlock(part.passage, vm);
  out += sections(part.questionSections, vm);
  if (!part.questionSections && part.questions) {
    out += (part.questions || []).map((q) => {
      const v = vm.get(String(q.id));
      return `<div class="lx-q ${v && v.correct ? 'ok' : 'no'}">
        <div class="lx-qhead"><span class="lx-n">${esc(q.id)}</span>
          <span class="lx-qtext">${esc(htmlToText(q.text || q.hint || ''))}</span></div>
        <p class="lx-row"><span class="lx-gap">${gapHtml(q.id, v)}</span></p>${explain(v)}</div>`;
    }).join('');
  }
  return out;
}

export function renderReadingExam(payload) {
  const r = (payload && payload.result) || {};
  const ielts = String(payload.kind || '').indexOf('ielts') === 0;
  const vm = verdictMap(payload);
  const parts = (payload.parts || []).map((p) => ({ ...p, ...(p.raw || {}) }));

  const chips = (r.perPart || []).map((p) => {
    const good = p.total ? p.correct / p.total >= 0.6 : false;
    return `<a class="lx-chip" href="#part${esc(p.part)}">Part ${esc(p.part)} ` +
           `<b class="${good ? 'good' : 'bad'}">${esc(p.correct)}/${esc(p.total)}</b></a>`;
  }).join('');

  const sectionsHtml = parts.map((part, i) => {
    const no = part.part || i + 1;
    const per = (r.perPart || []).find((x) => Number(x.part) === Number(no));
    return `<section class="lx-part" id="part${esc(no)}">
      <div class="lx-partband">
        <h2>${esc(htmlToText(part.title || `Part ${no}`))}
          <span style="float:right">${per ? `${esc(per.correct)}/${esc(per.total)}` : ''}</span></h2>
        ${part.questionRange ? `<p>Questions ${esc(part.questionRange)}</p>` : ''}
      </div>
      ${partBody(part, vm)}
    </section>`;
  }).join('');

  const title = `${payload.student || 'Student'} — ${ielts ? 'IELTS' : 'Multilevel'} Reading Mock ${payload.mockNumber || ''}`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>${CSS}${EXAM_CSS}${READ_CSS}</style>
</head><body>
<div class="wrap">
<div class="strip">
  <div class="striprow lx-board">
    <div class="lx-tile"><div class="n">${esc(r.correct)}<span>/${esc(r.total)}</span></div><div class="l">Correct</div></div>
    ${ielts
      ? (r.band != null ? `<div class="lx-tile lvl"><div class="n">${esc(r.band)}</div><div class="l">Band</div></div>` : '')
      : (r.certificateScore != null ? `<div class="lx-tile"><div class="n">${esc(r.certificateScore)}<span>/75</span></div><div class="l">Certificate</div></div>` : '') +
        (r.cefrLevel ? `<div class="lx-tile lvl"><div class="n">${esc(r.cefrLevel)}</div><div class="l">Level</div></div>` : '')}
    <span class="lx-chips">${chips}</span>
  </div>
  <div class="striprow striprow2">
    <button class="chip" id="answersBtn">📋 Answers</button>
    <button class="chip" id="onlyWrong">✗ Mistakes only</button>
    <span class="who">${esc(payload.student || '')}${payload.takenAt ? ` · ${new Date(payload.takenAt).toLocaleString()}` : ''}</span>
  </div>
</div>
${answersTable(payload)}
<div class="lx-wrap">${sectionsHtml}</div>
</div>
<script>
(function () {
  var ab = document.getElementById('answersBtn');
  var box = document.getElementById('answersBox');
  var back = document.getElementById('answersBackdrop');
  function setAnswers(on) {
    if (!box) return;
    box.classList.toggle('open', on);
    box.setAttribute('aria-hidden', String(!on));
    if (back) back.classList.toggle('open', on);
    if (ab) ab.classList.toggle('on', on);
    document.body.style.overflow = on && window.matchMedia('(max-width:820px)').matches ? 'hidden' : '';
  }
  if (ab) ab.addEventListener('click', function () { setAnswers(!box.classList.contains('open')); });
  var ac = document.getElementById('answersClose');
  if (ac) ac.addEventListener('click', function () { setAnswers(false); });
  if (back) back.addEventListener('click', function () { setAnswers(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setAnswers(false); });

  var ow = document.getElementById('onlyWrong');
  if (ow) ow.addEventListener('click', function () {
    var on = !document.body.classList.contains('only-wrong');
    document.body.classList.toggle('only-wrong', on);
    ow.setAttribute('aria-pressed', String(on));
    ow.classList.toggle('on', on);
  });
})();
</script>
</body></html>`;
}
