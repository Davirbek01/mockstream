// ============================================================================
// renderReadingReview — turns a stored attempt PAYLOAD into the review page the
// student saw the moment they finished: score strip, passage with the evidence
// sentence highlighted per question, answers marked, explanations inline.
// ----------------------------------------------------------------------------
// Why a renderer and not stored HTML: the app uploads a small JSON payload, and
// this function renders it on every open. Restyling here improves EVERY past
// report at once — a student always finds the same, current-looking review.
//
// Plain ESM JavaScript with no imports so it runs unchanged in the Deno edge
// runtime and in Node (the local prototype harness).
//
// Payload shape (v1):
//   { v:1, kind:'ielts-reading', student, mockNumber, takenAt,
//     result: { correct, total, band, perPassage:[{passage,title,correct,total}],
//               questions:[{id, correct, userAnswer, correctAnswer, explanation}] },
//     passages: [{ title, text, explanations:{ q1:{text,quote}, … } }] }
// ============================================================================

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');


const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', hellip: '…' };
function decodeEntities(s) {
  return String(s ?? '')
    .replace(/&#(\d+);/g, (_m, d) => String.fromCharCode(parseInt(d, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[String(name).toLowerCase()] ?? m);
}

/** Same conversion the apps use, so quotes anchor identically
 *  (mirror of readingScoring.htmlToText — keep the two in step). */
function htmlToText(html) {
  const NL = String.fromCharCode(10);
  return decodeEntities(
    String(html ?? '')
      .replace(/<\s*br\s*\/?\s*>/gi, NL)
      .replace(/<\/\s*(td|th)\s*>/gi, ' · ')
      .replace(/<\/\s*tr\s*>/gi, NL)
      .replace(/<\/\s*p\s*>/gi, NL + NL)
      .replace(/<\/\s*(div|h\d|li)\s*>/gi, NL)
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<[^>]+>/g, '')
      .replace(/ ·\s*\n/g, NL),
  )
    .replace(/\n{3,}/g, NL + NL)
    .trim();
}

/** Normalise for tolerant quote matching, keeping norm→original index map. */
function normalizeWithMap(raw) {
  const norm = [];
  const map = [];
  let prevSpace = false;
  for (let i = 0; i < raw.length; i++) {
    let ch = raw[i];
    if (ch === '‘' || ch === '’' || ch === 'ʼ' || ch === '′') ch = "'";
    else if (ch === '“' || ch === '”' || ch === '″') ch = '"';
    else if (ch === '–' || ch === '—' || ch === '−') ch = '-';
    if (/\s/.test(ch)) {
      if (prevSpace) continue;
      ch = ' ';
      prevSpace = true;
    } else {
      prevSpace = false;
    }
    norm.push(ch.toLowerCase());
    map.push(i);
  }
  return { norm: norm.join(''), map };
}

/** Locate each evidence quote inside the passage text. Unmatched = skipped. */
function locateRanges(fullText, quotes) {
  const { norm, map } = normalizeWithMap(fullText);
  const ranges = [];
  for (const q of quotes) {
    const needle = normalizeWithMap(q.text).norm.trim();
    if (needle.length < 6) continue;
    const at = norm.indexOf(needle);
    if (at < 0) continue;
    const start = map[at];
    const end = map[at + needle.length - 1] + 1;
    if (!(end > start)) continue;
    ranges.push({ start, end, qid: q.qid, correct: q.correct });
  }
  ranges.sort((a, b) => a.start - b.start);
  // drop overlaps (first match wins) so the marks never nest
  const out = [];
  let lastEnd = -1;
  for (const r of ranges) {
    if (r.start < lastEnd) continue;
    out.push(r);
    lastEnd = r.end;
  }
  return out;
}

/** Passage text with <mark> around each located evidence sentence + a Q# tag. */
function markPassage(text, ranges) {
  if (!ranges.length) return esc(text).replace(/\n{2,}/g, '</p><p>');
  let html = '';
  let cursor = 0;
  for (const r of ranges) {
    html += esc(text.slice(cursor, r.start));
    const cls = r.correct ? 'ok' : 'no';
    html += `<mark class="${cls}" id="m${r.qid}" data-m="${r.qid}" title="Question ${r.qid} — click to see it">${esc(text.slice(r.start, r.end))}<sup class="qtag ${cls}">Q${r.qid}</sup></mark>`;
    cursor = r.end;
  }
  html += esc(text.slice(cursor));
  return html.replace(/\n{2,}/g, '</p><p>');
}

function passageQuotes(passage, questions) {
  const correctByQid = new Map();
  for (const q of questions) correctByQid.set(Number(q.id), !!q.correct);
  const expl = passage.explanations || {};
  const out = [];
  const seen = new Set();
  for (const [key, val] of Object.entries(expl)) {
    const qid = parseInt(String(key).replace(/\D/g, ''), 10);
    if (!Number.isFinite(qid) || seen.has(qid)) continue;
    const quote = val && typeof val === 'object' ? String(val.quote ?? '').trim() : '';
    if (!quote) continue;
    seen.add(qid);
    out.push({ qid, text: quote, correct: correctByQid.get(qid) ?? false });
  }
  return out.sort((a, b) => a.qid - b.qid);
}

/** Questions that belong to a passage, by the explanation keys it carries. */
function questionsForPassage(passage, questions, index, perPassage) {
  const ids = new Set(
    Object.keys(passage.explanations || {})
      .map((k) => parseInt(String(k).replace(/\D/g, ''), 10))
      .filter((n) => Number.isFinite(n)),
  );
  if (ids.size) return questions.filter((q) => ids.has(Number(q.id)));
  // Fallback: split by the per-passage counts, in order.
  let start = 0;
  for (let i = 0; i < index; i++) start += perPassage[i]?.total ?? 0;
  return questions.slice(start, start + (perPassage[index]?.total ?? 0));
}

const CSS = `
:root{--ink:#0f172a;--muted:#64748b;--line:#e5e7eb;--ok:#16a34a;--okbg:#dcfce7;--no:#dc2626;--nobg:#fee2e2;--teal:#0d9488;--surface:#fff;--bg:#f8fafc}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif}
.wrap{max-width:none;margin:0;padding:12px 16px 28px}
.strip{display:flex;flex-direction:column;gap:8px;padding:12px 18px;margin-bottom:14px;background:linear-gradient(90deg,rgba(13,148,136,.10),rgba(13,148,136,.02));border:1px solid rgba(13,148,136,.35);border-radius:12px}
.striprow{display:flex;align-items:center;gap:14px;min-width:0}
.striprow2{border-top:1px dashed rgba(13,148,136,.25);padding-top:8px}
.bandline{display:flex;align-items:baseline;gap:10px;flex:0 0 auto}
.band{font-size:24px;font-weight:800;color:var(--teal)}
.correct{font-size:14px;font-weight:700;color:var(--muted)}
.chips{display:flex;flex-wrap:nowrap;gap:8px;flex:1;min-width:0;overflow-x:auto;scrollbar-width:thin}
.chip{display:inline-flex;gap:8px;align-items:baseline;padding:7px 14px;background:var(--surface);border:1px solid var(--line);border-radius:999px;font-size:14px;white-space:nowrap;flex:0 0 auto}
.chip>span{max-width:230px;overflow:hidden;text-overflow:ellipsis}
.chip b{font-weight:800}
.who{font-size:13px;color:var(--muted)}
.psec{margin:0 0 18px;background:var(--surface);border:1px solid var(--line);border-radius:12px;overflow:hidden}
.phead{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 18px;background:#f1f5f9;border-bottom:1px solid var(--line);font-weight:800}
.phead .score{color:var(--teal)}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:0}
.col{padding:16px 18px;min-width:0}
.col+.col{border-left:1px solid var(--line)}
.ptext p{margin:0 0 12px}
mark{background:var(--okbg);border-bottom:2px solid var(--ok);padding:1px 0;border-radius:2px}
mark.no{background:var(--nobg);border-bottom-color:var(--no)}
.qtag{display:inline-block;margin-left:4px;padding:1px 6px;border-radius:999px;background:var(--ok);color:#fff;font-size:10px;font-weight:800;vertical-align:super}
.qtag.no{background:var(--no)}
.q{padding:12px 0;border-bottom:1px solid var(--line)}
.q:last-child{border-bottom:0}
.qnum{display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;padding:0 6px;border-radius:999px;background:var(--ok);color:#fff;font-size:13px;font-weight:800}
.qnum.no{background:var(--no)}
.verdict{margin-left:8px;font-weight:800;font-size:13px;color:var(--ok)}
.verdict.no{color:var(--no)}
.ans{margin:8px 0 0;font-size:14px}
.ans .lbl{color:var(--muted)}
.ans .yours{font-weight:700}
.ans .yours.no{color:var(--no);text-decoration:line-through}
.ans .right{font-weight:800;color:var(--ok)}
.expl{margin-top:8px;padding:10px 12px;background:#fffbeb;border-left:3px solid #f59e0b;border-radius:6px;font-size:14px;color:#78350f}
.quote{margin-top:6px;font-style:italic;color:var(--muted);font-size:13px}

.chip{cursor:pointer;font:inherit;font-size:14px}
.chip.on{border-color:var(--teal);background:rgba(13,148,136,.10);color:var(--teal)}
.psec{display:none}
.psec.on{display:block}
.strip{position:sticky;top:0;z-index:5;backdrop-filter:blur(6px);background:linear-gradient(90deg,rgba(236,253,250,.97),rgba(248,250,252,.97))}
.tools{display:flex;gap:8px;align-items:center}
.tool{padding:6px 12px;font:inherit;font-size:13px;font-weight:700;color:var(--muted);background:var(--surface);border:1px solid var(--line);border-radius:999px;cursor:pointer}
.tool.on{color:var(--no);border-color:var(--no);background:var(--nobg)}
.qhead{display:flex;align-items:center;gap:8px}
.jump{margin-left:auto;padding:3px 10px;font:inherit;font-size:12px;font-weight:700;color:var(--teal);background:var(--surface);border:1px solid rgba(13,148,136,.4);border-radius:999px;cursor:pointer}
.expl-wrap{margin-top:8px}
.expl-wrap summary{cursor:pointer;font-size:13px;font-weight:700;color:#b45309;list-style:none}
.expl-wrap summary::-webkit-details-marker{display:none}
.expl{margin-top:6px}
mark{cursor:pointer;scroll-margin-top:90px}
.q{scroll-margin-top:90px}
mark.flash{animation:fl 1.2s ease}
.q.flash{animation:fl 1.2s ease;border-radius:8px}
@keyframes fl{0%,100%{box-shadow:0 0 0 0 rgba(13,148,136,0)}30%{box-shadow:0 0 0 6px rgba(13,148,136,.35)}}
body.only-wrong .q:not(.wrong){display:none}
@media print{.tools,.jump{display:none}.psec{display:block}.strip{position:static}}
@media (max-width:820px){
  .cols{grid-template-columns:1fr}
  .col+.col{border-left:0;border-top:1px solid var(--line)}
  /* Edge to edge on phones, and the score header scrolls away with the page
     (sticky ate a third of a small screen). */
  .wrap{padding:0 0 24px}
  .strip{position:static;margin:0 0 10px;border-radius:0;border-left:0;border-right:0;border-top:0}
  .psec{margin:0 0 12px;border-radius:0;border-left:0;border-right:0}
  .col{padding:14px}
  /* Stack the passage chips on phones — side by side they scrolled off the
     screen and a student could not see which passages existed. */
  /* Band on its own line, then the passage chips stacked full width — side by
     side they scrolled off screen and a student could not see all passages. */
  .striprow{flex-direction:column;align-items:stretch;gap:8px}
  .striprow:first-child{flex-direction:column}
  .bandline{display:flex;align-items:baseline;gap:10px}
  .chips{flex-direction:column;flex-wrap:wrap;overflow:visible;width:100%}
  .chip{width:100%;justify-content:space-between;white-space:normal;text-align:left}
  .chip>span{max-width:none;overflow:visible}
  .striprow2{flex-direction:row;flex-wrap:wrap;align-items:center}
}
@media print{body{background:#fff}.psec{break-inside:avoid}}
`;

/** Render the stored payload as a self-contained review page. */
export function renderReadingReview(payload) {
  const r = payload.result || {};
  const questions = r.questions || [];
  const perPassage = r.perPassage || [];
  const passages = payload.passages || [];

  const chips = passages
    .map((p, i) => {
      const pp = perPassage[i] || {};
      const title = p.title || pp.title || `Passage ${i + 1}`;
      return `<button type="button" class="chip${i === 0 ? ' on' : ''}" data-tab="${i}"><span>${esc(title)}</span><b>${pp.correct ?? 0}/${pp.total ?? 0}</b></button>`;
    })
    .join('');

  const sections = passages
    .map((p, i) => {
      let text = htmlToText(p.text || '');
      const ptitle = String(p.title || '').trim();
      if (ptitle) {
        const nl = text.indexOf(String.fromCharCode(10));
        const first = (nl >= 0 ? text.slice(0, nl) : text).trim();
        if (first.toLowerCase() === ptitle.toLowerCase()) text = nl >= 0 ? text.slice(nl + 1).replace(/^\s+/, '') : '';
      }
      const qs = questionsForPassage(p, questions, i, perPassage);
      const ranges = locateRanges(text, passageQuotes(p, questions));
      const pp = perPassage[i] || {};
      const qHtml = qs
        .map((q) => {
          const cls = q.correct ? '' : 'no';
          const expl = q.explanation
            ? typeof q.explanation === 'object'
              ? q.explanation
              : { text: q.explanation }
            : null;
          return `<div class="q${q.correct ? '' : ' wrong'}" id="q${esc(q.id)}" data-q="${esc(q.id)}">
  <div class="qhead">
    <span class="qnum ${cls}">${esc(q.id)}</span>
    <span class="verdict ${cls}">${q.correct ? '✓ Correct' : '✗ Incorrect'}</span>
    <button type="button" class="jump" data-jump="${esc(q.id)}" title="Show the evidence in the passage">🔍 evidence</button>
  </div>
  <div class="ans">
    <span class="lbl">Your answer:</span>
    <span class="yours ${cls}">${esc(q.userAnswer || '—')}</span>
    ${q.correct ? '' : `<span class="lbl"> · Correct:</span> <span class="right">${esc(q.correctAnswer ?? '')}</span>`}
  </div>
  ${
    expl?.text || expl?.quote
      ? `<details class="expl-wrap"${q.correct ? '' : ' open'}>
    <summary>💡 Explain more</summary>
    ${expl?.text ? `<div class="expl">${esc(expl.text)}</div>` : ''}
    ${expl?.quote ? `<div class="quote">“${esc(expl.quote)}”</div>` : ''}
  </details>`
      : ''
  }
</div>`;
        })
        .join('');

      return `<section class="psec${i === 0 ? ' on' : ''}" id="p${i}" data-panel="${i}">
  <div class="phead"><span>${esc(p.title || `Passage ${i + 1}`)}</span><span class="score">${pp.correct ?? 0}/${pp.total ?? 0}</span></div>
  <div class="cols">
    <div class="col ptext"><p>${markPassage(text, ranges)}</p></div>
    <div class="col">${qHtml}</div>
  </div>
</section>`;
    })
    .join('');

  const band = typeof r.band === 'number' ? `Band ${r.band.toFixed(1)}` : '';
  const when = payload.takenAt ? new Date(payload.takenAt).toLocaleString() : '';

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(payload.student || 'Student')} — IELTS Reading${payload.mockNumber ? ` Mock ${payload.mockNumber}` : ''}</title>
<style>${CSS}</style></head><body><div class="wrap">
<div class="strip">
  <div class="striprow">
    <span class="bandline">
      <span class="band">${esc(band)}</span>
      <span class="correct">${r.correct ?? 0}/${r.total ?? 0} correct</span>
    </span>
    <span class="chips">${chips}</span>
  </div>
  <div class="striprow striprow2">
    <span class="tools">
      <button type="button" class="tool" id="toolWrong">✗ Mistakes only</button>
      <button type="button" class="tool" id="toolExpl" data-open="0">💡 Explanations</button>
    </span>
    <span class="who">${esc(payload.student || '')}${when ? ` · ${esc(when)}` : ''}</span>
  </div>
</div>
${sections}
</div>
<script>
(function(){
  var body=document.body;
  function show(i){
    document.querySelectorAll('.psec').forEach(function(s){ s.classList.toggle('on', s.dataset.panel===String(i)); });
    document.querySelectorAll('.chip').forEach(function(c){ c.classList.toggle('on', c.dataset.tab===String(i)); });
  }
  function panelOf(el){ var s=el.closest('.psec'); return s?s.dataset.panel:null; }
  function flash(el){ if(!el) return; el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
    el.scrollIntoView({behavior:'smooth',block:'center'}); }
  document.addEventListener('click', function(e){
    var chip=e.target.closest('.chip'); if(chip){ show(chip.dataset.tab); return; }
    var jump=e.target.closest('.jump');
    if(jump){ var m=document.getElementById('m'+jump.dataset.jump);
      if(m){ show(panelOf(m)); flash(m); } else { jump.textContent='no evidence quote'; jump.disabled=true; }
      return; }
    var mk=e.target.closest('mark[data-m]');
    if(mk){ var q=document.getElementById('q'+mk.dataset.m); if(q){ var d=q.querySelector('details'); if(d) d.open=true; flash(q); } }
  });
  var tw=document.getElementById('toolWrong');
  if(tw) tw.addEventListener('click', function(){ body.classList.toggle('only-wrong'); tw.classList.toggle('on');
    tw.textContent = body.classList.contains('only-wrong') ? '✗ Mistakes only · on' : '✗ Mistakes only'; });
  var te=document.getElementById('toolExpl');
  if(te) te.addEventListener('click', function(){
    var open = te.dataset.open !== '1'; te.dataset.open = open ? '1' : '0';
    document.querySelectorAll('details.expl-wrap').forEach(function(d){ d.open = open; });
    te.textContent = open ? '💡 Explanations · all' : '💡 Explanations';
  });
})();
</script>
</body></html>`;
}

export default renderReadingReview;
