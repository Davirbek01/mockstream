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

import { CSS, esc, htmlToText, locateRanges, markPassage, passageQuotes, questionsForPassage }
  from './reviewShell.js';


/** Render the stored payload as a self-contained review page. */
export function renderReadingReview(payload) {
  const r = payload.result || {};
  const questions = r.questions || [];
  const perPassage = r.perPassage || r.perPart || [];
  const passages = payload.passages || [];

  const chips = passages
    .map((p, i) => {
      const pp = perPassage[i] || {};
      const title = p.title || pp.title || `Part ${i + 1}`;
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
          // The apps flatten an explanation into ONE string: the reasoning, a
          // newline, then the passage sentence in curly quotes. Split it back so
          // the quote renders as a quote (raw {text,quote} objects pass through).
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
  <div class="phead"><span>${esc(p.title || `Part ${i + 1}`)}</span><span class="score">${pp.correct ?? 0}/${pp.total ?? 0}</span></div>
  <div class="cols">
    <div class="col ptext"><p>${markPassage(text, ranges)}</p></div>
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

  // IELTS reports a band; CEFR reports a certificate score + level.
  const band =
    typeof r.band === 'number'
      ? `Band ${r.band.toFixed(1)}`
      : r.cefrLevel
        ? `${r.cefrLevel}`
        : '';
  const subScore =
    typeof r.band === 'number'
      ? `${r.correct ?? 0}/${r.total ?? 0} correct`
      : `${r.certificateScore ?? 0}/75 · ${r.correct ?? 0}/${r.total ?? 0} correct`;
  const when = payload.takenAt ? new Date(payload.takenAt).toLocaleString() : '';

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(payload.student || 'Student')} — ${payload.kind === 'cefr-reading' ? 'Multilevel' : 'IELTS'} Reading${payload.mockNumber ? ` Mock ${payload.mockNumber}` : ''}</title>
<style>${CSS}</style></head><body><div class="wrap">
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
  var ta=document.getElementById('toolAnswers');
  var panel=document.getElementById('answersPanel');
  if(ta&&panel) ta.addEventListener('click', function(){
    var on = body.classList.toggle('answers-on');
    panel.hidden = !on; ta.classList.toggle('on', on);
    ta.textContent = on ? '📖 Back to passages' : '📋 Answers';
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

export default renderReadingReview;
