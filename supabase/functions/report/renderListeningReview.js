// ============================================================================
// renderListeningReview — the listening review page, rendered from the stored
// attempt payload. It IS the reading review with one column swapped: where
// reading shows the passage with the evidence sentence marked, listening shows
// the TRANSCRIPT with the evidence line marked, and the part's audio pinned
// above it so a student can hear again what they misheard.
//
// Evidence comes from the mock's own `answerHighlights` (question id → 0-based
// transcript line indices) — the same source the desktop review uses, so there
// is no fuzzy text matching to get wrong. A quote string is accepted too and
// falls back to locating it in the text.
//
// Payload v1:
//   { v:1, kind:'cefr-listening'|'ielts-listening', student, mockNumber, takenAt,
//     result: { correct, total, certificateScore?, cefrLevel?, band?,
//               perPart:[{part,title,correct,total}],
//               questions:[{id,correct,userAnswer,correctAnswer,explanation,part}] },
//     parts: [{ title, transcript, audio, highlights:{ q1:[0,3] | "quote" } }] }
// ============================================================================
import { CSS, esc } from './reviewShell.js';

/** Audio player + transcript column, and the score strip's tab chips. */
const LISTEN_CSS = `
.aud{display:flex;align-items:center;gap:10px;margin:0 0 12px;padding:8px 10px;background:#f1f5f9;
 border:1px solid var(--line);border-radius:10px;position:sticky;top:0;z-index:2}
.aud audio{width:100%;height:38px}
.aud .audlbl{font-size:12px;font-weight:800;color:var(--muted);white-space:nowrap}
.tline{margin:0 0 10px}
.tline.spk{font-weight:700;color:var(--teal)}
.noscript{padding:22px 6px;color:var(--muted);font-size:14px;text-align:center}
@media (max-width:820px){.aud{position:static}}
@media print{.aud{display:none}}
`;

/** Transcript as lines.
 *  IELTS transcripts keep their line breaks and the stored `answerHighlights`
 *  are indices into exactly that list (the desktop review does
 *  `text.split('\n')`), so blanks must NOT be dropped or every tag shifts.
 *  CEFR transcripts were flattened into one paragraph when the mocks moved to
 *  Supabase — there is no line left to index, so they are split into sentences
 *  and the stored indices are ignored: measured against mock 59, they no longer
 *  point at the answer. Evidence then comes from the answer text itself. */
function transcriptLines(part) {
  const t = part.transcript;
  if (Array.isArray(t)) return { lines: t.map((x) => String(x == null ? '' : x)), indexed: true };
  const raw = String(t || '');
  if (raw.indexOf('\n') >= 0) return { lines: raw.split(/\r?\n/), indexed: true };
  return { lines: raw.split(/(?<=[.!?])\s+/), indexed: false };
}

/** The evidence line for a question: the sentence that actually contains the
 *  correct answer. A gap-fill answer is spoken verbatim (measured: CEFR 93%,
 *  IELTS 97%); a multiple-choice letter is not, and the speaker paraphrases the
 *  option (3% / 0%), so those get NO mark rather than a misleading one. */
function findAnswerLine(lines, answer) {
  const a = String(answer == null ? '' : answer).trim();
  if (a.length < 3 || /^[A-Za-z]$/.test(a)) return -1;
  const needle = a.toLowerCase().replace(/\s+/g, ' ');
  for (let i = 0; i < lines.length; i++) {
    if (String(lines[i]).toLowerCase().replace(/\s+/g, ' ').indexOf(needle) >= 0) return i;
  }
  return -1;
}

/** question id → the transcript line indices that answer it. Accepts the mock's
 *  `answerHighlights` shape (numbers / arrays of numbers) and plain quotes. */
function lineIndex(part, lines) {
  const out = new Map();
  const hl = part.highlights || part.answerHighlights || {};
  Object.keys(hl).forEach((key) => {
    const id = parseInt(String(key).replace(/\D/g, ''), 10);
    if (!isFinite(id)) return;
    const v = hl[key];
    const idxs = [];
    if (typeof v === 'number') idxs.push(v);
    else if (Array.isArray(v)) v.forEach((x) => { if (typeof x === 'number') idxs.push(x); else if (typeof x === 'string') idxs.push(...matchQuote(lines, x)); });
    else if (typeof v === 'string') idxs.push(...matchQuote(lines, v));
    idxs.forEach((i) => {
      if (i < 0 || i >= lines.length) return;
      if (!out.has(i)) out.set(i, []);
      if (!out.get(i).includes(id)) out.get(i).push(id);
    });
  });
  return out;
}

/** Locate a quoted sentence in the transcript when no line index was stored. */
function matchQuote(lines, quote) {
  const q = String(quote || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (q.length < 8) return [];
  const hit = [];
  lines.forEach((l, i) => {
    if (l.toLowerCase().replace(/\s+/g, ' ').indexOf(q) >= 0) hit.push(i);
  });
  return hit.slice(0, 1);
}

export function renderListeningReview(payload) {
  const r = payload.result || {};
  const questions = r.questions || [];
  const perPart = r.perPart || r.perPassage || [];
  const parts = payload.parts || payload.passages || [];
  const isIelts = payload.kind === 'ielts-listening';
  const partWord = isIelts ? 'Section' : 'Part';

  const chips = parts
    .map((p, i) => {
      const pp = perPart[i] || {};
      const title = p.title || pp.title || `${partWord} ${i + 1}`;
      return `<button type="button" class="chip${i === 0 ? ' on' : ''}" data-tab="${i}"><span>${esc(title)}</span><b>${pp.correct ?? 0}/${pp.total ?? 0}</b></button>`;
    })
    .join('');

  const sections = parts
    .map((p, i) => {
      const partNo = p.part ?? p.partNumber ?? i + 1;
      const { lines, indexed } = transcriptLines(p);
      // Stored indices only mean something where the transcript still has the
      // lines they were authored against; otherwise fall back to the answer.
      const marks = indexed ? lineIndex(p, lines) : new Map();
      const correctOf = new Map(questions.map((q) => [Number(q.id), !!q.correct]));

      // Questions belonging to this part: an explicit `part` on the question,
      // else the ids named in this part's own answer/highlight map, else split
      // evenly across parts (the shape older mocks stored).
      const own = Object.keys(p.highlights || p.answerHighlights || {})
        .map((k) => parseInt(String(k).replace(/\D/g, ''), 10))
        .filter((n) => isFinite(n));
      let qs = questions.filter((q) => Number(q.part) === Number(partNo));
      if (!qs.length && own.length) qs = questions.filter((q) => own.includes(Number(q.id)));
      if (!qs.length && perPart[i] && perPart[i].total) {
        let from = 0;
        for (let k = 0; k < i; k++) from += perPart[k]?.total || 0;
        qs = questions.slice(from, from + (perPart[i].total || 0));
      }

      // Fill in any question the stored indices did not cover.
      qs.forEach((q) => {
        const has = [...marks.values()].some((ids) => ids.includes(Number(q.id)));
        if (has) return;
        const li = findAnswerLine(lines, q.correctAnswer);
        if (li < 0) return;
        if (!marks.has(li)) marks.set(li, []);
        if (!marks.get(li).includes(Number(q.id))) marks.get(li).push(Number(q.id));
      });

      const tHtml = lines.some((l) => String(l).trim())
        ? lines
            .map((line, li) => {
              const ids = marks.get(li);
              // Blank spacer lines keep their index but need no paragraph.
              if (!String(line).trim() && !(ids && ids.length)) return '';
              const speaker = /^[A-Z][A-Za-z .'-]{0,24}:/.test(line);
              if (!ids || !ids.length) {
                return `<p class="tline${speaker ? ' spk' : ''}">${esc(line)}</p>`;
              }
              const ok = ids.every((id) => correctOf.get(id));
              const tags = ids.map((id) => `<sup class="qtag${ok ? '' : ' no'}">${id}</sup>`).join('');
              return `<p class="tline${speaker ? ' spk' : ''}"><mark class="${ok ? '' : 'no'}" id="m${ids[0]}" data-m="${ids[0]}">${esc(line)}</mark>${tags}</p>`;
            })
            .join('')
        : `<div class="noscript">No transcript was saved for this ${partWord.toLowerCase()}.</div>`;

      const audio = p.audio
        ? `<div class="aud"><span class="audlbl">🎧 ${esc(p.title || partWord + ' ' + partNo)}</span>
    <audio controls preload="none" src="${esc(p.audio)}"></audio></div>`
        : '';

      const qHtml = qs
        .map((q) => {
          const cls = q.correct ? '' : 'no';
          const expl = (() => {
            const raw = q.explanation;
            if (!raw) return null;
            if (typeof raw === 'object') return raw;
            const str = String(raw);
            const m = str.match(/^([\s\S]*?)\s*“([\s\S]+)”\s*$/);
            return m ? { text: m[1].trim(), quote: m[2].trim() } : { text: str };
          })();
          return `<div class="q${q.correct ? '' : ' wrong'}" id="q${esc(q.id)}" data-q="${esc(q.id)}">
  <div class="qhead">
    <span class="qnum ${cls}">${esc(q.id)}</span>
    <span class="verdict ${cls}">${q.correct ? '✓ Correct' : '✗ Incorrect'}</span>
    <button type="button" class="jump" data-jump="${esc(q.id)}" title="Show the line in the transcript">🔍 evidence</button>
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

      const pp = perPart[i] || {};
      return `<section class="psec${i === 0 ? ' on' : ''}" id="p${i}" data-panel="${i}">
  <div class="phead"><span>${esc(p.title || `${partWord} ${partNo}`)}</span><span class="score">${pp.correct ?? 0}/${pp.total ?? 0}</span></div>
  <div class="cols">
    <div class="col ptext">${audio}${tHtml}</div>
    <div class="col">${qHtml}</div>
  </div>
</section>`;
    })
    .join('');

  const answerRows = questions
    .map(
      (q) => `<tr class="${q.correct ? 'ok' : 'no'}">
    <td class="anum">${esc(q.id)}</td>
    <td class="ayours">${esc(q.userAnswer || '—')}</td>
    <td class="aright">${esc(q.correctAnswer ?? '')}</td>
    <td class="averdict">${q.correct ? '✓' : '✗'}</td>
  </tr>`,
    )
    .join('');
  const answersTable = `<section class="answers" id="answersPanel" hidden>
  <div class="phead"><span>📋 Answers — yours vs correct</span><span class="score">${r.correct ?? 0}/${r.total ?? 0}</span></div>
  <div class="atable-wrap"><table class="atable">
    <thead><tr><th>#</th><th>Your answer</th><th>Correct answer</th><th></th></tr></thead>
    <tbody>${answerRows}</tbody>
  </table></div>
</section>`;

  const band =
    typeof r.band === 'number' ? `Band ${r.band.toFixed(1)}` : r.cefrLevel ? `${r.cefrLevel}` : '';
  const subScore =
    typeof r.band === 'number'
      ? `${r.correct ?? 0}/${r.total ?? 0} correct`
      : `${r.certificateScore ?? 0}/75 · ${r.correct ?? 0}/${r.total ?? 0} correct`;
  const when = payload.takenAt ? new Date(payload.takenAt).toLocaleString() : '';

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="google" content="notranslate">
<title>${esc(payload.student || 'Student')} — ${isIelts ? 'IELTS' : 'Multilevel'} Listening${payload.mockNumber ? ` Mock ${payload.mockNumber}` : ''}</title>
<style>${CSS}${LISTEN_CSS}</style></head><body><div class="wrap">
<div class="strip">
  <div class="striprow">
    <span class="bandline">
      <span class="band">${esc(band)}</span>
      <span class="correct">${esc(subScore)}</span>
    </span>
    <span class="chips">${chips}</span>
  </div>
  <div class="striprow striprow2">
    <span class="tools">
      <button type="button" class="tool" id="toolWrong">✗ Mistakes only</button>
      <button type="button" class="tool" id="toolExpl" data-open="0">💡 Explanations</button>
      <button type="button" class="tool" id="toolAnswers">📋 Answers</button>
    </span>
    <span class="who">${esc(payload.student || '')}${when ? ` · ${esc(when)}` : ''}</span>
  </div>
</div>
${sections}
${answersTable}
</div>
<script>
(function(){
  var body=document.body;
  function show(i){
    document.querySelectorAll('.psec').forEach(function(s){ s.classList.toggle('on', s.dataset.panel===String(i)); });
    document.querySelectorAll('.chip').forEach(function(c){ c.classList.toggle('on', c.dataset.tab===String(i)); });
    // Never leave a hidden part's audio playing behind the tab you switched to.
    document.querySelectorAll('.psec:not(.on) audio').forEach(function(a){ try{ a.pause(); }catch(e){} });
  }
  function panelOf(el){ var s=el.closest('.psec'); return s?s.dataset.panel:null; }
  function flash(el){ if(!el) return; el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
    el.scrollIntoView({behavior:'smooth',block:'center'}); }
  document.addEventListener('click', function(e){
    var chip=e.target.closest('.chip'); if(chip){ show(chip.dataset.tab); return; }
    var jump=e.target.closest('.jump');
    if(jump){ var m=document.getElementById('m'+jump.dataset.jump);
      if(m){ show(panelOf(m)); flash(m); } else { jump.textContent='no transcript line'; jump.disabled=true; }
      return; }
    var mk=e.target.closest('mark[data-m]');
    if(mk){ var q=document.getElementById('q'+mk.dataset.m); if(q){ var d=q.querySelector('details'); if(d) d.open=true; flash(q); } }
  });
  var tw=document.getElementById('toolWrong');
  if(tw) tw.addEventListener('click', function(){ body.classList.toggle('only-wrong'); tw.classList.toggle('on');
    tw.textContent = body.classList.contains('only-wrong') ? '✗ Mistakes only · on' : '✗ Mistakes only'; });
  var ta=document.getElementById('toolAnswers');
  var panel=document.getElementById('answersPanel');
  if(ta&&panel) ta.addEventListener('click', function(){
    var on = body.classList.toggle('answers-on');
    panel.hidden = !on; ta.classList.toggle('on', on);
    ta.textContent = on ? '🎧 Back to transcript' : '📋 Answers';
    window.scrollTo({top:0,behavior:'smooth'});
  });
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

export default renderListeningReview;
