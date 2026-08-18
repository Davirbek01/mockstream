// ============================================================================
// renderFullMock — one page holding all four skills of a full mock.
// ----------------------------------------------------------------------------
// A full mock used to ship as a ZIP: four report files plus a nested zip of the
// speaking audio. A zip cannot be opened by a link, cannot be encrypted (the
// audio would stop playing), and froze the day it was built. Instead the attempt
// now stores a small MANIFEST — which skills were sat, their scores, and the id
// of each skill's own report — and this renderer assembles the page on every
// open: the same four reports, each in its own tab, always current.
//
// Each skill report is embedded in an <iframe srcdoc> so its stylesheet cannot
// collide with its neighbours'. Speaking keeps pointing at the hosted audio, and
// the archive-retry script is injected INTO each frame (error events do not
// cross a frame boundary), so recordings still play after retention clears them.
//
// Manifest v1:
//   { v:1, kind:'full-mock', student, exam:'cefr'|'ielts', takenAt, source,
//     overall:{ label, note }, timing:{ startedAt, endedAt },
//     skills:[ { skill, label, score, mock, id } ] }
// ============================================================================
import { withAudioFallback } from './audioFallback.js';

const SKILL_ICON = { listening: '🎧', reading: '📖', writing: '✍️', speaking: '🎤' };
const ORDER = ['listening', 'reading', 'writing', 'speaking'];
const STORAGE = 'https://zknyukkbtbcqgvkgjktb.supabase.co/storage/v1/object/public/reports/';
const ARCHIVE = 'https://storage.googleapis.com/mockstream-report-archive/';

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Attribute-safe srcdoc: only & and " may end the value. */
function srcdocAttr(html) {
  return String(html).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}

/**
 * @param manifest the stored full-mock manifest (v1)
 * @param load     async (skillEntry) => html string | null — supplied by the
 *                 Edge Function so this file stays free of Supabase imports
 */
export async function renderFullMock(manifest, load) {
  const m = manifest || {};
  const examLabel = m.exam === 'ielts' ? 'IELTS' : 'Multilevel (CEFR)';
  const skills = (m.skills || [])
    .slice()
    .sort((a, b) => ORDER.indexOf(a.skill) - ORDER.indexOf(b.skill));

  const frames = await Promise.all(
    skills.map(async (s) => {
      let html = null;
      try {
        html = await load(s);
      } catch { /* a missing skill report must not sink the page */ }
      return { ...s, html: html ? withAudioFallback(html) : null };
    }),
  );
  const usable = frames.filter((f) => f.html);

  const tabs = frames
    .map((f, i) => {
      const icon = SKILL_ICON[f.skill] || '📄';
      const label = esc(f.label || f.skill);
      const dis = f.html ? '' : ' disabled';
      return `<button class="tab${i === 0 && f.html ? ' on' : ''}" data-i="${i}"${dis}>` +
        `<span class="ic">${icon}</span><span class="tl">${label}</span>` +
        `<span class="ts">${esc(f.score || (f.html ? '' : 'no report'))}</span></button>`;
    })
    .join('');

  const panes = frames
    .map((f, i) =>
      f.html
        ? `<iframe class="pane${i === 0 ? ' on' : ''}" data-i="${i}" srcdoc="${srcdocAttr(f.html)}"></iframe>`
        : '',
    )
    .join('');

  // The certificate PDF used to travel inside the zip. It is stored beside the
  // attempt now, so both the link and the encrypted file can offer it; the
  // click resolves storage first and the permanent archive second.
  const cert = m.certificate
    ? `<a class="cert" id="certLink" href="${esc(STORAGE + m.certificate)}" target="_blank" rel="noopener"
         data-path="${esc(m.certificate)}">📜 Certificate</a>`
    : '';

  const overall = m.overall && m.overall.label
    ? `<div class="ov"><span class="ovl">Overall</span><span class="ovv">${esc(m.overall.label)}</span>${
        m.overall.note ? `<span class="ovn">${esc(m.overall.note)}</span>` : ''
      }</div>`
    : '';

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="google" content="notranslate">
<title>Full Mock — ${esc(m.student || 'Student')}</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#f1f5f9;font:15px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#0f172a}
header{background:linear-gradient(135deg,#0f172a,#1e293b);color:#e2e8f0;padding:16px 20px}
.hrow{display:flex;flex-wrap:wrap;align-items:center;gap:10px 18px;max-width:1400px;margin:0 auto}
h1{font-size:17px;margin:0;font-weight:700;letter-spacing:.2px}
.meta{font-size:12.5px;color:#94a3b8}
.cert{margin-left:auto;display:inline-flex;align-items:center;gap:6px;background:rgba(94,234,212,.12);
 border:1px solid rgba(94,234,212,.35);color:#5eead4;text-decoration:none;border-radius:10px;
 padding:7px 13px;font-size:13px;font-weight:600;white-space:nowrap}
.cert:hover{background:rgba(94,234,212,.2)}
.cert + .ov{margin-left:0}
.ov{margin-left:auto;display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.08);
 border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:6px 12px}
.ovl{font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:#94a3b8}
.ovv{font-size:18px;font-weight:800;color:#5eead4}
.ovn{font-size:11px;color:#94a3b8}
nav{background:#fff;border-bottom:1px solid #e2e8f0;position:sticky;top:0;z-index:5}
.tabs{display:flex;gap:4px;max-width:1400px;margin:0 auto;padding:0 12px;overflow-x:auto}
.tab{flex:1 0 auto;display:flex;align-items:center;gap:8px;background:none;border:0;border-bottom:3px solid transparent;
 padding:12px 14px;font:inherit;font-weight:600;color:#64748b;cursor:pointer;white-space:nowrap}
.tab .ic{font-size:16px}
.tab .ts{font-size:12px;font-weight:600;color:#94a3b8}
.tab.on{color:#0f766e;border-bottom-color:#0d9488}
.tab.on .ts{color:#0d9488}
.tab[disabled]{opacity:.4;cursor:default}
.pane{display:none;width:100%;height:calc(100vh - 118px);border:0;background:#fff}
.pane.on{display:block}
.empty{padding:60px 20px;text-align:center;color:#64748b}
@media print{nav{display:none}.pane{display:block!important;height:auto;page-break-after:always}}
@media (max-width:640px){.tab .tl{display:none}.tab{flex:1 0 0}.ov{margin-left:0}}
</style></head><body>
<header><div class="hrow">
  <div>
    <h1>📋 Full Mock — ${esc(m.student || 'Student')}</h1>
    <div class="meta">${esc(examLabel)}${m.takenAt ? ' · ' + esc(fmtDate(m.takenAt)) : ''}${
      m.source ? ' · ' + esc(m.source) : ''
    }</div>
  </div>
  ${cert}
  ${overall}
</div></header>
${usable.length ? `<nav><div class="tabs">${tabs}</div></nav>${panes}` : '<div class="empty">No skill reports were saved for this full mock.</div>'}
<script>
(function(){
  // Retention clears the bucket after a week; fall back to the permanent
  // archive copy of the same path rather than opening a dead link.
  var cert=document.getElementById('certLink');
  if(cert){
    cert.addEventListener('click',function(e){
      e.preventDefault();
      var url=cert.getAttribute('href');
      fetch(url,{method:'HEAD'}).then(function(r){
        window.open(r.ok?url:${JSON.stringify(ARCHIVE)}+cert.dataset.path,'_blank','noopener');
      }).catch(function(){ window.open(${JSON.stringify(ARCHIVE)}+cert.dataset.path,'_blank','noopener'); });
    });
  }
  var tabs=[].slice.call(document.querySelectorAll('.tab'));
  var panes=[].slice.call(document.querySelectorAll('.pane'));
  tabs.forEach(function(t){
    if(t.disabled)return;
    t.addEventListener('click',function(){
      tabs.forEach(function(x){x.classList.remove('on')});
      panes.forEach(function(p){p.classList.remove('on')});
      t.classList.add('on');
      var p=panes.filter(function(x){return x.dataset.i===t.dataset.i})[0];
      if(p)p.classList.add('on');
    });
  });
})();
</script>
</body></html>`;
}
