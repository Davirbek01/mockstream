// ============================================================================
// renderListeningExam — the listening report AS THE EXAM, checked.
// ----------------------------------------------------------------------------
// The old listening report was an answer-key table; the previous review page
// was a transcript with a verdict column beside it. Neither is what a student
// recognises. This renders the paper they actually sat — the same note-completion
// forms, option lists, matching rows and map grids — read-only, with their own
// answer in place, wrong ones struck through and the correct answer beside them.
//
// It is a STATIC page on purpose: the file is downloaded from Telegram and has
// to open with no network and no framework. The audio players are the only live
// part (and they degrade to nothing when offline).
//
// Payload v2 (v1 still renders — it just has no `raw`):
//   { v:2, kind:'cefr-listening'|'ielts-listening', student, mockNumber, takenAt,
//     result: { correct, total, certificateScore?, cefrLevel?, band?,
//               perPart:[{part,title,correct,total}],
//               questions:[{id,part,correct,userAnswer,correctAnswer,explanation}] },
//     parts: [{ part, title, instruction, questionRange, transcript, audio,
//               raw: <the mock's part object> }] }
//
// Part shapes handled (every type present in the mocks today):
//   gap-fill-form · sentence-completion · mcq · mcq-reply · mcq-extracts ·
//   matching-speakers · map-labeling · mixed (IELTS: a list of the above in
//   `subParts`)
// ============================================================================
import { CSS } from './reviewShell.js';
// The score strip, the Answers drawer, the gap markup and the option rows
// are shared with the reading paper — see examReviewShell.
import {
  EXAM_CSS, LETTERS, answersTable, decodeEntities, esc, gapHtml, gapRow,
  gappedHtml, gappedText, htmlToText, optionQuestion, verdictMap,
} from './examReviewShell.js';


/** gap-fill-form / table content: heading, plain text, and gapped items. */
function formContent(items, vm) {
  return (items || []).map((it) => {
    // A third shape: one item whose text is the whole form as HTML.
    if (/<input|data-gap=/i.test(it.text || '')) return gappedHtml(it.text, vm);
    const t = htmlToText(it.text || '');
    if (it.type === 'item-gap') {
      const suffix = it.gapSuffix ? `<span>${esc(htmlToText(it.gapSuffix))}</span>` : '';
      return gapRow(`${t ? `<span>${esc(t)}</span>` : ''}<span class="lx-gap">${gapHtml(it.gapId, vm.get(String(it.gapId)))}</span>${suffix}`);
    }
    if (it.type === 'heading') return `<p class="lx-head">${esc(t)}</p>`;
    return `<p class="lx-text">${esc(t)}</p>`;
  }).join('');
}


/** matching-speakers: the option bank, then one lettered answer per speaker. */
function matching(part, vm) {
  const options = [...(part.options || []), ...(part.extraOptions || [])];
  const title = part.boxTitle || part.optionsTitle || part.boxHeading;
  const bank = options.map((o, i) => {
    const letter = String(o.letter || LETTERS[i] || '').toUpperCase();
    return `<p class="lx-ref"><b>${esc(letter)}.</b> ${esc(htmlToText(o.text || o))}</p>`;
  }).join('');
  // CEFR keeps the rows under `speakers`, IELTS under `questions`.
  const rows = (part.questions || part.speakers || []).map((q) => {
    const v = vm.get(String(q.id));
    const chosen = String((v && v.userAnswer) || '').trim().toUpperCase();
    const right = String((v && v.correctAnswer) || '').trim().toUpperCase();
    const letters = options.map((o, i) => {
      const letter = String(o.letter || LETTERS[i] || '').toUpperCase();
      const kls = letter === right ? 'right' : letter === chosen ? 'chose' : '';
      return `<span class="lx-letter ${kls}">${esc(letter)}${letter === right ? ' ✓' : ''}</span>`;
    }).join('');
    const tag = !v ? '' : v.correct ? '<span class="lx-tag ok">✓ correct</span>'
      : `<span class="lx-tag no">✗ correct: ${esc(right || '—')}</span>`;
    return `<div class="lx-q ${v && v.correct ? 'ok' : 'no'}" data-ok="${v && v.correct ? 1 : 0}">
      <div class="lx-qhead"><span class="lx-n">${esc(q.id)}</span>
        <span class="lx-qtext">${esc(htmlToText(q.text || q.label || q.speaker || ''))}</span>${tag}</div>
      <div class="lx-letters">${letters}</div></div>`;
  }).join('');
  return (bank ? `<div class="lx-refbox">${title ? `<h3>${esc(htmlToText(title))}</h3>` : ''}${bank}</div>` : '') + rows;
}

/** map-labeling: the image beside the A–N grid, the chosen cell marked. */
function mapLabeling(part, vm) {
  const letters = [...(part.mapLabels || part.mapLetters || part.letters ||
    LETTERS.slice(0, Number(part.letterCount) || 9)), ...(part.extraLabels || [])]
    .map((x) => String((x && x.letter) || x).toUpperCase());
  const head = `<tr><th></th>${letters.map((l) => `<th>${esc(l)}</th>`).join('')}</tr>`;
  const rows = (part.questions || []).map((q) => {
    const v = vm.get(String(q.id));
    const chosen = String((v && v.userAnswer) || '').trim().toUpperCase();
    const right = String((v && v.correctAnswer) || '').trim().toUpperCase();
    const cells = letters.map((l) => {
      const kls = l === right ? 'right' : l === chosen ? 'chose' : '';
      return `<td class="lx-cell ${kls}">${l === right ? '✓' : l === chosen ? '✗' : ''}</td>`;
    }).join('');
    return `<tr><td class="lbl"><span class="lx-n">${esc(q.id)}</span> ${esc(htmlToText(q.place || q.text || q.label || ''))}</td>${cells}</tr>`;
  }).join('');
  const img = part.image || part.mapImage || part.imageUrl;
  return `<div class="lx-map">
    ${part.mapTitle ? `<h3 style="grid-column:1/-1;margin:0">${esc(htmlToText(part.mapTitle))}</h3>` : ''}
    ${img ? `<div><img src="${esc(img)}" alt="map"></div>` : ''}
    <div><table class="lx-grid">${head}${rows}</table></div>
  </div>`;
}


/** mcq-multi: pick N letters from one list. The chosen letters live on N
 *  question ids, so the marks are gathered before the list is drawn. */
function mcqMulti(part, vm) {
  const ids = (part.questionIds || (part.questions || []).map((q) => q.id)).map(String);
  const chosen = new Set();
  const right = new Set();
  let allOk = ids.length > 0;
  for (const id of ids) {
    const v = vm.get(id);
    if (!v) { allOk = false; continue; }
    if (!v.correct) allOk = false;
    String(v.userAnswer || '').split(/[\s,/]+/).filter(Boolean).forEach((l) => chosen.add(l.toUpperCase()));
    String(v.correctAnswer || '').split(/[\s,/]+/).filter(Boolean).forEach((l) => right.add(l.toUpperCase()));
  }
  const opts = (part.options || []).map((o, i) => {
    const letter = String(o.letter || LETTERS[i] || '').toUpperCase();
    const isRight = right.has(letter);
    const isChosen = chosen.has(letter);
    const kls = isRight ? 'right' : isChosen ? 'chose' : '';
    const mark = isRight ? '<span class="lx-mark">correct answer</span>'
      : isChosen ? '<span class="lx-mark">✗ your answer</span>' : '';
    return `<div class="lx-opt ${kls}"><span class="lx-bul"></span>` +
           `<span>${esc(letter)}. ${esc(htmlToText(o.text || o))}</span>${mark}</div>`;
  }).join('');
  const tag = allOk ? '<span class="lx-tag ok">✓ correct</span>'
    : `<span class="lx-tag no">✗ correct: ${esc([...right].join(' / ') || '—')}</span>`;
  return `<div class="lx-q ${allOk ? 'ok' : 'no'}" data-ok="${allOk ? 1 : 0}">
    <div class="lx-qhead"><span class="lx-n">${esc(ids.join(', '))}</span>${tag}</div>${opts}</div>`;
}

/** table-completion: the same grid, with the answered gaps in their cells. */
function tableCompletion(part, vm) {
  const head = (part.headers || []).length
    ? `<tr>${part.headers.map((h) => `<th>${esc(htmlToText(h))}</th>`).join('')}</tr>` : '';
  const body = (part.rows || []).map((row) => {
    const cells = (row || []).map((cell) => {
      if (cell && typeof cell === 'object' && cell.type === 'gap') {
        const pre = cell.prefix ? `<span>${esc(htmlToText(cell.prefix))}</span> ` : '';
        const suf = cell.suffix ? ` <span>${esc(htmlToText(cell.suffix))}</span>` : '';
        return `<td>${pre}<span class="lx-gap">${gapHtml(cell.gapId, vm.get(String(cell.gapId)))}</span>${suf}</td>`;
      }
      return `<td>${esc(htmlToText(typeof cell === 'string' ? cell : (cell && cell.text) || ''))}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  return `<div class="lx-card">${part.tableTitle ? `<h3>${esc(htmlToText(part.tableTitle))}</h3>` : ''}
    <table class="lx-table">${head}${body}</table></div>`;
}

/** flowchart: boxed steps whose trailing question number becomes the answer. */
function flowchart(part, vm) {
  const bank = (part.options || []).map((o, i) => {
    const letter = String(o.letter || LETTERS[i] || '').toUpperCase();
    return `<p class="lx-ref"><b>${esc(letter)}.</b> ${esc(htmlToText(o.text || o))}</p>`;
  }).join('');
  const steps = (part.steps || []).map((st, i) => {
    const text = htmlToText(st.text || st || '');
    // The question number sits inside the sentence ("…all the same 26").
    const m = text.match(/(\d{1,2})\s*$/);
    const body = m
      ? `${esc(text.slice(0, m.index))}<span class="lx-gap">${gapHtml(m[1], vm.get(String(m[1])))}</span>`
      : esc(text);
    return `<div class="lx-step">${body}</div>` +
           (i < (part.steps || []).length - 1 ? '<div class="lx-arrow">↓</div>' : '');
  }).join('');
  return (bank ? `<div class="lx-refbox">${bank}</div>` : '') + `<div class="lx-flow">${steps}</div>`;
}

/** One part body — or one subPart of an IELTS "mixed" part. */
function partBody(part, vm) {
  const type = String(part.type || '');
  let out = '';

  if (part.instruction) out += `<p class="lx-instr">${esc(htmlToText(part.instruction))}</p>`;

  if (type === 'gap-fill-form') {
    out += `<div class="lx-card">${part.formTitle ? `<h3>${esc(htmlToText(part.formTitle))}</h3>` : ''}
      ${Array.isArray(part.formContent) ? formContent(part.formContent, vm) : gappedHtml(part.formContent, vm)}</div>`;
  } else if (type === 'sentence-completion') {
    const html = part.passageContent || part.content || part.text || '';
    out += `<div class="lx-card">${part.passageTitle ? `<h3>${esc(htmlToText(part.passageTitle))}</h3>` : ''}
      ${/<input/i.test(html) ? gappedHtml(html, vm) : gappedText(html, vm)}</div>`;
  } else if (type === 'mcq' || type === 'mcq-reply') {
    out += (part.questions || []).map((q) => optionQuestion(q, vm)).join('');
  } else if (type === 'mcq-extracts') {
    out += (part.extracts || []).map((ex) =>
      `<div class="lx-card">${ex.title ? `<h3>${esc(htmlToText(ex.title))}</h3>` : ''}
        ${(ex.questions || []).map((q) => optionQuestion(q, vm)).join('')}</div>`).join('');
  } else if (type === 'mcq-multi') {
    out += mcqMulti(part, vm);
  } else if (type === 'table-completion') {
    out += tableCompletion(part, vm);
  } else if (type === 'flowchart' || type === 'flowchart-completion') {
    out += flowchart(part, vm);
  } else if (type === 'summary-completion') {
    // Same shape as sentence-completion in every mock that has one.
    const sum = part.summaryText || part.content || part.text || '';
    out += `<div class="lx-card">${/<input/i.test(sum) ? gappedHtml(sum, vm) : gappedText(sum, vm)}</div>`;
  } else if (type === 'matching-speakers' || type === 'matching') {
    out += matching(part, vm);
  } else if (type === 'map-labeling') {
    out += mapLabeling(part, vm);
  } else if (type === 'mixed') {
    out += (part.subParts || []).map((sp) => partBody(sp, vm)).join('');
  } else if (part.formContent) {
    out += `<div class="lx-card">${Array.isArray(part.formContent)
      ? formContent(part.formContent, vm) : gappedHtml(part.formContent, vm)}</div>`;
  } else if (part.questions) {
    out += (part.questions || []).map((q) => optionQuestion(q, vm)).join('');
  }
  return out;
}

/** Transcript with the answering lines marked, folded behind a button. */
function transcriptBlock(p, idx) {
  const text = String(p.transcript || '').trim();
  if (!text) return '';
  const hl = p.highlights || (p.raw && p.raw.answerHighlights) || {};
  const marked = new Map();
  for (const [qid, val] of Object.entries(hl)) {
    for (const li of Array.isArray(val) ? val : []) {
      if (!marked.has(li)) marked.set(li, []);
      marked.get(li).push(qid);
    }
  }
  const lines = text.split('\n');
  const body = lines.map((ln, i) => {
    const t = ln.trim();
    if (!t) return '';
    const ids = marked.get(i);
    const spk = /^(speaker|narrator|man|woman|part)\b/i.test(t) ? ' spk' : '';
    const inner = ids ? `<span class="lx-hl">${esc(t)}</span> <span class="lx-n">${esc(ids.join(', '))}</span>` : esc(t);
    return `<p class="${spk.trim()}">${inner}</p>`;
  }).join('');
  return `<button class="lx-scriptbtn" data-script="${idx}">📄 Transcript</button>
    <div class="lx-script" id="script${idx}" style="display:none">${body}</div>`;
}



export function renderListeningExam(payload) {
  const r = (payload && payload.result) || {};
  const vm = verdictMap(payload);
  const parts = payload.parts || [];
  const ielts = String(payload.kind || '').startsWith('ielts');

  const chips = (r.perPart || []).map((p) => {
    const good = p.total ? p.correct / p.total >= 0.6 : false;
    return `<a class="lx-chip" href="#part${esc(p.part)}">Part ${esc(p.part)} ` +
           `<b class="${good ? 'good' : 'bad'}">${esc(p.correct)}/${esc(p.total)}</b></a>`;
  }).join('');

  const sections = parts.map((p, i) => {
    const raw = p.raw || p;
    const per = (r.perPart || []).find((x) => Number(x.part) === Number(p.part || i + 1));
    return `<section id="part${esc(p.part || i + 1)}">
      <div class="lx-partband">
        <h2>${esc(p.title || `Part ${p.part || i + 1}`)}${per ? ` <span style="float:right">${esc(per.correct)}/${esc(per.total)}</span>` : ''}</h2>
        ${p.questionRange ? `<p>Questions ${esc(p.questionRange)}</p>` : ''}
      </div>
      ${p.audio ? `<div class="lx-aud"><audio controls preload="none" src="${esc(p.audio)}"></audio></div>` : ''}
      ${partBody(raw, vm)}
      ${transcriptBlock(p, i)}
    </section>`;
  }).join('');

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(payload.student || 'Student')} — ${ielts ? 'IELTS' : 'Multilevel'} Listening${payload.mockNumber ? ` Mock ${esc(payload.mockNumber)}` : ''}</title>
<style>${CSS}${EXAM_CSS}</style></head><body>
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
<div class="lx-wrap">${sections}</div>
<script>
  document.querySelectorAll('[data-script]').forEach(function (b) {
    b.addEventListener('click', function () {
      var el = document.getElementById('script' + b.dataset.script);
      var on = el.style.display === 'none';
      el.style.display = on ? 'block' : 'none';
      b.textContent = on ? '📄 Hide transcript' : '📄 Transcript';
    });
  });
  var ab = document.getElementById('answersBtn');
  var box = document.getElementById('answersBox');
  var back = document.getElementById('answersBackdrop');
  function setAnswers(on) {
    if (!box) return;
    box.classList.toggle('open', on);
    box.setAttribute('aria-hidden', String(!on));
    if (back) back.classList.toggle('open', on);
    if (ab) ab.classList.toggle('on', on);
    // On a phone the drawer covers everything, so the page behind it must not
    // scroll away underneath.
    document.body.style.overflow = on && window.matchMedia('(max-width:820px)').matches ? 'hidden' : '';
  }
  if (ab) ab.addEventListener('click', function () { setAnswers(!box.classList.contains('open')); });
  var ac = document.getElementById('answersClose');
  if (ac) ac.addEventListener('click', function () { setAnswers(false); });
  if (back) back.addEventListener('click', function () { setAnswers(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setAnswers(false); });
  var ow = document.getElementById('onlyWrong');
  if (ow) ow.addEventListener('click', function () {
    var on = ow.getAttribute('aria-pressed') !== 'true';
    ow.setAttribute('aria-pressed', String(on));
    ow.classList.toggle('on', on);
    document.querySelectorAll('.lx-q').forEach(function (q) {
      q.style.display = on && q.dataset.ok === '1' ? 'none' : '';
    });
  });
</script>
</body></html>`;
}
