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
import { CSS, esc, htmlToText } from './reviewShell.js';

const EXAM_CSS = `
.lx-wrap{max-width:980px;margin:0 auto;padding:0 16px 90px}
.lx-partband{background:#f1f5f9;border:1px solid var(--line);border-radius:12px;padding:12px 16px;margin:18px 0 14px}
.lx-partband h2{margin:0;font-size:17px}
.lx-partband p{margin:3px 0 0;color:var(--muted);font-size:13px}
.lx-aud{border:1px solid var(--line);border-radius:12px;background:#f8fafc;padding:10px 12px;margin:0 0 16px}
.lx-aud audio{width:100%;height:40px}
.lx-instr{margin:16px 0 10px;font-size:14.5px}
.lx-card{border:1px solid var(--line);border-radius:12px;background:#fbfcfe;padding:18px;margin:12px 0}
.lx-card h3{margin:0 0 14px;text-align:center;font-size:15px}
.lx-row{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px;margin:10px 0;line-height:1.9}
.lx-html{line-height:2}
.lx-html h3,.lx-html h4,.lx-html h5{margin:14px 0 6px;font-size:14.5px;text-align:left}
.lx-html p,.lx-html li{margin:8px 0}
.lx-html ul,.lx-html ol{margin:8px 0;padding-left:22px}
.lx-html table{width:100%;border-collapse:collapse;margin:8px 0}
.lx-html td,.lx-html th{border:1px solid var(--line);padding:8px 11px;vertical-align:top}
.lx-head{font-weight:800;margin:16px 0 6px}
.lx-text{margin:8px 0}

/* one answered gap, as it looked in the exam but frozen */
.lx-gap{display:inline-flex;align-items:baseline;gap:6px;vertical-align:baseline}
.lx-n{display:inline-flex;min-width:24px;height:22px;border-radius:7px;background:#e2e8f0;color:#334155;
 align-items:center;justify-content:center;font-size:11.5px;font-weight:800;padding:0 5px}
.lx-in{min-width:120px;border-bottom:2px solid;padding:1px 10px 2px;border-radius:5px 5px 0 0;font-weight:700;
 display:inline-block;text-align:center}
.lx-in.ok{border-color:var(--ok);background:#dcfce7;color:#14532d}
.lx-in.no{border-color:var(--no);background:#fee2e2;color:#7f1d1d;text-decoration:line-through}
.lx-in.blank{border-color:var(--no);background:#fee2e2;color:#991b1b;font-style:italic;font-weight:600}
.lx-key{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;font-weight:800;color:#166534;
 background:#dcfce7;border:1px solid #86efac;border-radius:999px;padding:2px 9px}

/* option lists (mcq, mcq-reply, mcq-extracts, matching) */
.lx-q{border-left:4px solid transparent;padding:2px 0 2px 12px;margin:16px 0}
.lx-q.ok{border-left-color:var(--ok)}
.lx-q.no{border-left-color:var(--no)}
.lx-qhead{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:8px}
.lx-qtext{font-weight:700}
.lx-tag{font-size:12px;font-weight:800;border-radius:999px;padding:2px 9px}
.lx-tag.ok{color:#166534;background:#dcfce7;border:1px solid #86efac}
.lx-tag.no{color:#991b1b;background:#fee2e2;border:1px solid #fca5a5}
.lx-opt{display:flex;gap:10px;align-items:flex-start;padding:7px 10px;border-radius:9px;border:1px solid transparent;margin:3px 0}
.lx-bul{width:18px;height:18px;border-radius:50%;border:2px solid #cbd5e1;flex:none;margin-top:2px}
.lx-opt.chose{border-color:#fca5a5;background:#fef2f2}
.lx-opt.chose .lx-bul{border-color:var(--no);background:var(--no)}
.lx-opt.right{border-color:#86efac;background:#f0fdf4}
.lx-opt.right .lx-bul{border-color:var(--ok);background:var(--ok)}
.lx-opt .lx-mark{margin-left:auto;font-size:12px;font-weight:800;white-space:nowrap}
.lx-opt.right .lx-mark{color:#166534}
.lx-opt.chose .lx-mark{color:#991b1b}

/* table completion */
.lx-table{width:100%;border-collapse:collapse;font-size:14px;margin:6px 0}
.lx-table th,.lx-table td{border:1px solid var(--line);padding:9px 12px;text-align:left;vertical-align:top}
.lx-table th{background:#f8fafc;font-weight:800}

/* flowchart */
.lx-flow{display:flex;flex-direction:column;gap:8px;align-items:stretch;margin:8px 0}
.lx-step{border:1px solid var(--line);border-radius:12px;background:#fff;padding:11px 14px}
.lx-arrow{text-align:center;color:var(--muted);font-size:16px;line-height:1}

/* matching / letter answers */
.lx-letters{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.lx-letter{min-width:38px;text-align:center;border:1px solid var(--line);border-radius:9px;padding:6px 8px;font-weight:800}
.lx-letter.right{border-color:var(--ok);background:#dcfce7;color:#166534}
.lx-letter.chose{border-color:var(--no);background:#fee2e2;color:#991b1b}
.lx-refbox{background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:14px 16px;margin:12px 0}
.lx-refbox .lx-ref{margin:5px 0}
.lx-refbox b{color:#c2410c}

/* map labelling */
.lx-map{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;align-items:start}
.lx-map img{width:100%;border:1px solid var(--line);border-radius:12px;background:#fff}
.lx-grid{width:100%;border-collapse:collapse;font-size:13.5px}
.lx-grid th,.lx-grid td{border:1px solid var(--line);padding:6px 8px;text-align:center}
.lx-grid th{background:#f8fafc}
.lx-grid td.lbl{text-align:left;font-weight:700}
.lx-cell.right{background:#dcfce7;color:#166534;font-weight:800}
.lx-cell.chose{background:#fee2e2;color:#991b1b;font-weight:800}
@media (max-width:820px){.lx-map{grid-template-columns:1fr}}

/* transcript, folded away until asked for */
.lx-scriptbtn{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--line);background:#fff;
 border-radius:10px;padding:7px 13px;font-weight:700;font-size:13px;cursor:pointer;margin:4px 0 14px}
.lx-script{border:1px solid var(--line);border-radius:12px;background:#fff;padding:16px 18px;margin:0 0 16px}
.lx-script p{margin:0 0 9px;line-height:1.75}
.lx-script .spk{font-weight:700;color:var(--teal)}
.lx-hl{background:#fef9c3;border-bottom:2px solid #fde047;border-radius:3px;padding:0 2px}
@media print{.lx-aud,.lx-scriptbtn{display:none}.lx-script{display:block !important}}

/* score board — tiles, not a run-on line */
.lx-board{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.lx-tile{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:8px 16px;text-align:center;
 min-width:96px;box-shadow:0 1px 2px rgba(15,23,42,.04)}
.lx-tile .n{font-size:24px;font-weight:800;line-height:1.05;color:var(--teal)}
.lx-tile .n span{font-size:15px;font-weight:700;color:var(--muted)}
.lx-tile .l{font-size:10.5px;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);margin-top:3px;font-weight:700}
.lx-tile.lvl .n{color:#b45309}
.lx-chips{display:flex;gap:8px;flex-wrap:wrap;flex:1;min-width:0}
.lx-chip{display:inline-flex;gap:7px;align-items:baseline;padding:6px 13px;background:var(--surface);
 border:1px solid var(--line);border-radius:999px;font-size:13.5px;text-decoration:none;color:inherit}
.lx-chip b{font-weight:800}
.lx-chip b.good{color:var(--ok)}
.lx-chip b.bad{color:var(--no)}
.lx-chip:hover{border-color:var(--teal)}

/* answers — a drawer, not a block: the paper stays visible beside it on a
   desktop, and it takes the whole screen on a phone where half is unusable */
.lx-answers{position:fixed;top:0;right:0;bottom:0;width:50%;min-width:420px;max-width:760px;
 background:#fff;border-left:1px solid var(--line);box-shadow:-18px 0 40px rgba(15,23,42,.18);
 z-index:60;display:flex;flex-direction:column;transform:translateX(102%);
 transition:transform .22s ease;will-change:transform}
.lx-answers.open{transform:none}
.lx-ahead{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid var(--line);
 background:linear-gradient(90deg,rgba(13,148,136,.10),rgba(13,148,136,.02))}
.lx-ahead h3{margin:0;font-size:15px}
.lx-ahead .sub{color:var(--muted);font-size:12.5px}
.lx-close{margin-left:auto;border:1px solid var(--line);background:#fff;border-radius:10px;
 width:34px;height:34px;font-size:16px;cursor:pointer;line-height:1}
.lx-ascroll{overflow:auto;padding:0 0 24px}
.lx-answers table{width:100%;border-collapse:collapse;font-size:13.5px}
.lx-answers th,.lx-answers td{border-bottom:1px solid var(--line);padding:8px 14px;text-align:left}
.lx-answers th{background:#f8fafc;font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);
 position:sticky;top:0;z-index:1}
.lx-answers tr.part td{background:#f1f5f9;font-weight:800;font-size:12.5px}
.lx-answers td.q{width:48px;font-weight:800;color:var(--muted)}
.lx-answers td.mine.no{color:#991b1b;text-decoration:line-through}
.lx-answers td.mine.ok{color:#14532d;font-weight:700}
.lx-answers td.mine.blank{color:#991b1b;font-style:italic}
.lx-answers td.key{font-weight:700;color:#166534}
.lx-answers td.v{width:52px;text-align:center;font-weight:800}
.lx-answers td.v.ok{color:var(--ok)}
.lx-answers td.v.no{color:var(--no)}
.lx-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.35);z-index:55;opacity:0;pointer-events:none;
 transition:opacity .22s ease}
.lx-backdrop.open{opacity:1;pointer-events:auto}
@media (max-width:820px){
  .lx-answers{width:100%;min-width:0;max-width:none;border-left:0}
}
/* printing wants the list inline, not a panel hanging off the side */
@media print{
  .lx-answers{position:static;transform:none;width:auto;min-width:0;max-width:none;box-shadow:none;
   border:1px solid var(--line);border-radius:12px;margin:16px 0;display:block}
  .lx-close,.lx-backdrop{display:none}
}

`;

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/** Verdict for one question id, from the payload's question list. */
function verdictMap(payload) {
  const m = new Map();
  for (const q of (payload.result && payload.result.questions) || []) m.set(String(q.id), q);
  return m;
}

/** The student's answer, frozen in place. */
function gapHtml(id, v) {
  const num = `<span class="lx-n">${esc(id)}</span>`;
  if (!v) return `${num}<span class="lx-in blank">not answered</span>`;
  const user = String(v.userAnswer || '').trim();
  if (v.correct) return `${num}<span class="lx-in ok">${esc(user)}</span>`;
  return `${num}<span class="lx-in no">${user ? esc(user) : '—'}</span>` +
         `<span class="lx-key">✓ ${esc(v.correctAnswer || '')}</span>`;
}

function gapRow(inner) {
  return `<p class="lx-row">${inner}</p>`;
}

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


/** A form kept as HTML: <input data-q="N"> and <span data-gap="N"> are the
 *  gaps. Everything else is reduced to a small, attribute-free tag set so the
 *  layout survives without carrying the exam page's own styling or scripts. */
const KEEP_TAGS = new Set(['h3', 'h4', 'h5', 'p', 'br', 'hr', 'ul', 'ol', 'li',
  'table', 'thead', 'tbody', 'tr', 'td', 'th', 'strong', 'b', 'em', 'i', 'u', 'div']);

function gappedHtml(html, vm) {
  let out = String(html || '');
  const gaps = [];
  // Park the gaps behind markers first: sanitising would otherwise eat them.
  const park = (id) => { gaps.push(id); return '\u0001' + (gaps.length - 1) + '\u0001'; };
  out = out.replace(/<input[^>]*\bdata-q(?:uestion)?=["'](\d+)["'][^>]*>/gi, (_m, id) => park(id));
  out = out.replace(/<span[^>]*\bdata-gap=["'](\d+)["'][^>]*>[\s\S]*?<\/span>/gi, (_m, id) => park(id));

  out = out.replace(/<(script|style)[\s\S]*?<\/\1>/gi, '');
  out = out.replace(/<(\/?)([a-z0-9]+)[^>]*>/gi, (_m, slash, tag) => {
    const t = tag.toLowerCase();
    return KEEP_TAGS.has(t) ? '<' + slash + t + '>' : '';
  });

  // Whatever text is left is untrusted, so escape it and only then put the
  // answers back.
  out = out.split(/(<\/?[a-z0-9]+>)/i)
    .map((chunk, i) => (i % 2 ? chunk : esc(chunk)))
    .join('');
  out = out.replace(/\u0001(\d+)\u0001/g, (_m, i) => {
    const id = gaps[Number(i)];
    return '<span class="lx-gap">' + gapHtml(id, vm.get(String(id))) + '</span>';
  });
  return '<div class="lx-html">' + out + '</div>';
}

/** sentence-completion: HTML carrying <span data-gap="N"> markers. */
function gappedText(html, vm) {
  const re = /<span[^>]*data-gap=["'](\d+)["'][^>]*>[\s\S]*?<\/span>/gi;
  let out = '';
  let last = 0;
  let m;
  while ((m = re.exec(html))) {
    const before = htmlToText(html.slice(last, m.index));
    if (before) out += `<span>${esc(before)}</span> `;
    out += `<span class="lx-gap">${gapHtml(m[1], vm.get(String(m[1])))}</span> `;
    last = m.index + m[0].length;
  }
  const tail = htmlToText(html.slice(last));
  if (tail) out += `<span>${esc(tail)}</span>`;
  return gapRow(out);
}

/** One option list question (mcq, mcq-reply, an extract's question). */
function optionQuestion(q, vm) {
  const v = vm.get(String(q.id));
  const chosen = String((v && v.userAnswer) || '').trim().toUpperCase();
  const right = String((v && v.correctAnswer) || '')
    .split(/[\/,]/).map((x) => x.trim().toUpperCase()).filter(Boolean);
  const cls = !v ? '' : v.correct ? 'ok' : 'no';
  const tag = !v ? ''
    : v.correct ? '<span class="lx-tag ok">✓ correct</span>'
    : `<span class="lx-tag no">✗ correct: ${esc(right.join(' / ') || '—')}</span>`;

  const opts = (q.options || []).map((o, i) => {
    const letter = String(o.letter || LETTERS[i] || '').toUpperCase();
    const isRight = right.includes(letter);
    const isChosen = chosen.split(/[\s,/]+/).includes(letter);
    const kls = isRight ? 'right' : isChosen ? 'chose' : '';
    const mark = isRight ? '<span class="lx-mark">correct answer</span>'
      : isChosen ? '<span class="lx-mark">✗ your answer</span>' : '';
    return `<div class="lx-opt ${kls}"><span class="lx-bul"></span>` +
           `<span>${esc(letter)}. ${esc(htmlToText(o.text || o))}</span>${mark}</div>`;
  }).join('');

  return `<div class="lx-q ${cls}" data-ok="${v && v.correct ? 1 : 0}">
    <div class="lx-qhead"><span class="lx-n">${esc(q.id)}</span>
      <span class="lx-qtext">${esc(htmlToText(q.text || ''))}</span>${tag}</div>
    ${opts}
  </div>`;
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


/** Every question in one table: what was written, what was expected. */
function answersTable(payload) {
  const r = (payload && payload.result) || {};
  const byPart = new Map();
  for (const q of r.questions || []) {
    const k = q.part == null ? 0 : Number(q.part);
    if (!byPart.has(k)) byPart.set(k, []);
    byPart.get(k).push(q);
  }
  const titleFor = (n) => {
    const p = (r.perPart || []).find((x) => Number(x.part) === Number(n));
    return p ? `${p.title || `Part ${n}`} · ${p.correct}/${p.total}` : `Part ${n}`;
  };
  const rows = [...byPart.keys()].sort((a, b) => a - b).map((k) => {
    const head = k ? `<tr class="part"><td colspan="4">${esc(titleFor(k))}</td></tr>` : '';
    const body = byPart.get(k).sort((a, b) => a.id - b.id).map((q) => {
      const mine = String(q.userAnswer || '').trim();
      const cls = !mine ? 'blank' : q.correct ? 'ok' : 'no';
      return `<tr>
        <td class="q">${esc(q.id)}</td>
        <td class="mine ${cls}">${mine ? esc(mine) : 'not answered'}</td>
        <td class="key">${esc(q.correctAnswer || '')}</td>
        <td class="v ${q.correct ? 'ok' : 'no'}">${q.correct ? '✓' : '✗'}</td>
      </tr>`;
    }).join('');
    return head + body;
  }).join('');

  return `<div class="lx-backdrop" id="answersBackdrop"></div>
  <aside class="lx-answers" id="answersBox" aria-hidden="true">
    <div class="lx-ahead">
      <div>
        <h3>Answers</h3>
        <div class="sub">${esc(r.correct)} of ${esc(r.total)} correct</div>
      </div>
      <button class="lx-close" id="answersClose" aria-label="Close">✕</button>
    </div>
    <div class="lx-ascroll">
      <table>
        <tr><th>Q</th><th>Your answer</th><th>Correct answer</th><th></th></tr>
        ${rows}
      </table>
    </div>
  </aside>`;
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
