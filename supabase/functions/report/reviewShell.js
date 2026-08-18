// ============================================================================
// reviewShell — the look and the text helpers every review page shares.
// ----------------------------------------------------------------------------
// Reading and listening reviews must be the SAME page with a different left
// column (passage vs transcript+audio), so the stylesheet and the small text
// utilities live here rather than being copied and drifting apart.
// ============================================================================
export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');


const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', hellip: '…' };
export function decodeEntities(s) {
  return String(s ?? '')
    .replace(/&#(\d+);/g, (_m, d) => String.fromCharCode(parseInt(d, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[String(name).toLowerCase()] ?? m);
}

/** Same conversion the apps use, so quotes anchor identically
 *  (mirror of readingScoring.htmlToText — keep the two in step). */
export function htmlToText(html) {
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
export function normalizeWithMap(raw) {
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
export function locateRanges(fullText, quotes) {
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
export function markPassage(text, ranges) {
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

export function passageQuotes(passage, questions) {
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
export function questionsForPassage(passage, questions, index, perPassage) {
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

export const CSS = `
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
/* Desktop: each side scrolls on its own, like the exam's split panes — the
   passage stays put while you work down the questions. */
.cols{height:calc(100vh - 150px);min-height:420px}
.col{padding:16px 18px;min-width:0;overflow-y:auto;overscroll-behavior:contain}
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
.answers{margin:0 0 18px;background:var(--surface);border:1px solid var(--line);border-radius:12px;overflow:hidden}
.atable-wrap{overflow-x:auto}
.atable{width:100%;border-collapse:collapse;font-size:14px}
.atable th{position:sticky;top:0;background:#f8fafc;text-align:left;padding:10px 14px;font-size:12px;letter-spacing:.03em;text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--line)}
.atable td{padding:9px 14px;border-bottom:1px solid var(--line);vertical-align:top}
.atable tr.no td{background:rgba(220,38,38,.05)}
.atable .anum{font-weight:800;width:56px;color:var(--muted)}
.atable .ayours{font-weight:700}
.atable tr.no .ayours{color:var(--no)}
.atable .aright{font-weight:800;color:var(--ok)}
.atable .averdict{width:44px;text-align:center;font-weight:800;color:var(--ok)}
.atable tr.no .averdict{color:var(--no)}
body.answers-on .psec{display:none}
body.answers-on .answers{display:block}
@media print{.answers{display:block!important}.cols{height:auto}.col{overflow:visible}}
@media (max-width:820px){
  /* Phones: one column, one page scroll (two nested scrollers is misery). */
  .cols{grid-template-columns:1fr;height:auto;min-height:0}
  .col{overflow:visible}
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

/* The question as the student saw it in the exam window: the prompt, and for a
   choice question every option, with the correct one marked and the student's
   pick shown. Without these the report was a bare answer key. */
.qtext{margin:6px 0 8px;font-weight:600;line-height:1.5}
.ginstr{margin:14px 0 8px;padding:8px 12px;background:#f1f5f9;border-left:3px solid var(--teal);
 border-radius:6px;font-size:13px;color:#475569}
.opts{margin:6px 0 2px;display:flex;flex-direction:column;gap:6px}
.opt{display:flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid var(--line);
 border-radius:8px;font-size:14px;background:var(--surface)}
.opt .mk{width:16px;flex:0 0 auto;font-weight:800;color:transparent}
.opt.right{border-color:var(--ok);background:var(--okbg)}
.opt.right .mk{color:var(--ok)}
.opt.chosen{border-color:var(--no);background:var(--nobg)}
.opt.chosen .mk{color:var(--no)}
.opt.right.chosen{border-color:var(--ok);background:var(--okbg)}
.opt .badge{margin-left:auto;font-size:10px;font-weight:800;letter-spacing:.04em;padding:3px 8px;
 border-radius:999px;background:var(--ok);color:#fff;white-space:nowrap}
.opt .badge.you{background:var(--no)}
.blank{margin:6px 0 0;font-size:13px;font-style:italic;color:var(--muted)}
@media print{body{background:#fff}.psec{break-inside:avoid}}
`;
