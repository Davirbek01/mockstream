// ============================================================================
// examReviewShell — the parts a marked exam page needs whichever skill it is.
// ----------------------------------------------------------------------------
// Listening had all of this to itself. Reading needs the same score strip, the
// same Answers drawer, the same "your word, struck through, with the right one
// beside it" gap, and the same option rows — so it lives in one place rather
// than being copied and left to drift. The two renderers keep only what is
// genuinely their own: a listening part is audio + questions, a reading part is
// a passage + questions.
// ============================================================================
import { CSS, decodeEntities, esc, htmlToText } from './reviewShell.js';

export { CSS, decodeEntities, esc, htmlToText };

export const EXAM_CSS = `
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
/* On a phone the three tiles stacked one per line and ate half the screen.
   Keep them on ONE row sharing the width, and push the part chips below. */
@media (max-width:820px){
  /* The shell stacks every striprow on phones (reading's design) and does it
     with .striprow:first-child, which outranks a single class — so the
     override has to carry both classes. The score board is the one row that
     must stay a row. */
  .striprow.lx-board{flex-direction:row;align-items:stretch;flex-wrap:wrap}
  .lx-tile{flex:1 1 0;min-width:0;padding:8px 4px}
  .lx-tile .n{font-size:20px}
  .lx-tile.lvl .n{font-size:17px}
  .lx-tile .n span{font-size:13px}
  .lx-tile .l{font-size:9.5px;letter-spacing:.5px}
  .lx-chips{flex:1 1 100%}
}
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

export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/** Verdict for one question id, from the payload's question list. */
export function verdictMap(payload) {
  const m = new Map();
  for (const q of (payload.result && payload.result.questions) || []) m.set(String(q.id), q);
  return m;
}

/** The student's answer, frozen in place. */
export function gapHtml(id, v) {
  const num = `<span class="lx-n">${esc(id)}</span>`;
  if (!v) return `${num}<span class="lx-in blank">not answered</span>`;
  const user = String(v.userAnswer || '').trim();
  if (v.correct) return `${num}<span class="lx-in ok">${esc(user)}</span>`;
  return `${num}<span class="lx-in no">${user ? esc(user) : '—'}</span>` +
         `<span class="lx-key">✓ ${esc(v.correctAnswer || '')}</span>`;
}

export function gapRow(inner) {
  return `<p class="lx-row">${inner}</p>`;
}

/** A form kept as HTML: <input data-q="N"> and <span data-gap="N"> are the
 *  gaps. Everything else is reduced to a small, attribute-free tag set so the
 *  layout survives without carrying the exam page's own styling or scripts. */
const KEEP_TAGS = new Set(['h3', 'h4', 'h5', 'p', 'br', 'hr', 'ul', 'ol', 'li',
  'table', 'thead', 'tbody', 'tr', 'td', 'th', 'strong', 'b', 'em', 'i', 'u', 'div']);

export function gappedHtml(html, vm) {
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
    // Decode first: the source writes &nbsp; and &amp;, and escaping those
    // again would print the entity itself on the page.
    .map((chunk, i) => (i % 2 ? chunk : esc(decodeEntities(chunk))))
    .join('');
  out = out.replace(/\u0001(\d+)\u0001/g, (_m, i) => {
    const id = gaps[Number(i)];
    return '<span class="lx-gap">' + gapHtml(id, vm.get(String(id))) + '</span>';
  });
  return '<div class="lx-html">' + out + '</div>';
}

/** sentence-completion: HTML carrying <span data-gap="N"> markers. */
export function gappedText(html, vm) {
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
export function optionQuestion(q, vm) {
  const v = vm.get(String(q.id));
  const chosen = String((v && v.userAnswer) || '').trim().toUpperCase();
  const right = String((v && v.correctAnswer) || '')
    .split(/[\/,]/).map((x) => x.trim().toUpperCase()).filter(Boolean);
  const cls = !v ? '' : v.correct ? 'ok' : 'no';
  const tag = !v ? ''
    : v.correct ? '<span class="lx-tag ok">✓ correct</span>'
    // Reading stores the correct answer as "C / They lack sufficient training…",
    // so the tag repeated the whole option in shouty caps right above the same
    // option marked in green. When a letter is available, the letter is the tag.
    : `<span class="lx-tag no">✗ correct: ${esc(
        (right.filter((x) => /^[A-Z]$/.test(x)).join(' / ') || right.join(' / ')) || '—')}</span>`;

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

/** Every question in one table: what was written, what was expected. */
export function answersTable(payload) {
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
