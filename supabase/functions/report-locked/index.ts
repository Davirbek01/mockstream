// ============================================================================
// report-locked — the ENCRYPTED report file attached to Telegram messages.
// ----------------------------------------------------------------------------
// The plain .html attachment let anyone in a results channel read a report
// without the access code the View Report link demands. This function returns a
// self-contained "locker" page instead:
//
//   • the report is rendered here, encrypted with a RANDOM per-report key
//     (AES-GCM), and embedded as ciphertext — the file holds no readable text
//     and no code, so View Source shows nothing;
//   • opening it asks for the access code, which is verified LIVE against
//     admin_passcodes (centre code or __super__), exactly like the link. Rotate
//     a code and every past file follows immediately — nothing is frozen;
//   • only after that does the server hand back the key, and the page decrypts
//     in the reader's browser.
//
// Internet is required to unlock (that is the price of a live code check).
//
// GET  ?p=<centre>/<uuid>.json          → the locker page (used by the apps)
// POST { p, code }                      → { key } when the code is valid now
// Deploy with --no-verify-jwt.
// ============================================================================
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
// @ts-ignore - plain ESM module shared with the report function + local harness
import { renderReadingReview } from '../report/renderReadingReview.js';

const SB_URL = Deno.env.get('SUPABASE_URL')!;
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const PATH_RE = /^[a-z0-9_-]+\/[0-9a-fA-F-]+\.json$/;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const b64 = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf as ArrayBuffer)));

/** Timing-safe compare so a wrong code can't be probed byte by byte. */
function ctEq(a: string, b: string): boolean {
  const x = new TextEncoder().encode(String(a ?? ''));
  const y = new TextEncoder().encode(String(b ?? ''));
  if (x.length !== y.length) return false;
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0;
}

/** The centre a report path belongs to ("bek/uuid.json" → "bek"). */
const centreOf = (p: string) => p.split('/')[0];

/** Is `code` a currently-valid passcode for this centre (or the super code)? */
async function codeOpensCentre(sb: ReturnType<typeof createClient>, centre: string, code: string) {
  for (const c of [centre, '__super__']) {
    const { data } = await sb.from('admin_passcodes').select('passcode').eq('center', c).maybeSingle();
    if (data && ctEq(String((data as { passcode: string }).passcode), code)) return true;
  }
  return false;
}

function lockerPage(pathname: string, fnUrl: string, ivB64: string, dataB64: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Protected report — Mock Stream</title>
<style>
/* Mirrors the view.html lock gate so the file and the link feel identical. */
:root{color-scheme:light}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;
 background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);
 font:16px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#0f172a}
.card{background:#fff;border-radius:16px;padding:32px 28px;max-width:380px;width:100%;
 box-shadow:0 20px 60px rgba(0,0,0,.4);text-align:center}
.lock{font-size:42px;margin-bottom:8px}
h1{color:#0d9488;font-size:20px;margin:0 0 6px}
p{color:#64748b;font-size:13px;margin:0 0 16px}
input{width:100%;padding:14px 16px;border:2px solid #e2e8f0;border-radius:12px;font-size:18px;text-align:center;
 letter-spacing:3px;font-weight:700;margin-bottom:12px;box-sizing:border-box;outline:none}
input:focus{border-color:#0d9488}
.msg{font-size:12px;min-height:18px;margin-bottom:10px;color:#dc2626}
button{width:100%;padding:12px;border:none;background:linear-gradient(135deg,#0d9488,#0f766e);color:#fff;
 font-size:14px;font-weight:700;border-radius:10px;cursor:pointer;letter-spacing:.3px}
button[disabled]{opacity:.6;cursor:default}
</style></head><body>
<div class="card">
  <div class="lock">🔒</div>
  <h1>Access Code Required</h1>
  <p>This report is protected. Enter your management access code to view.</p>
  <input id="code" type="password" inputmode="numeric" pattern="[0-9]*" autocomplete="off" autocorrect="off"
         spellcheck="false" placeholder="Enter access code" autofocus>
  <div class="msg" id="msg"></div>
  <button id="go">Unlock Report</button>
</div>
<script>
(function(){
  var P=${JSON.stringify(pathname)}, FN=${JSON.stringify(fnUrl)};
  var IV=${JSON.stringify(ivB64)}, DATA=${JSON.stringify(dataB64)};
  var msg=document.getElementById('msg'), btn=document.getElementById('go'), inp=document.getElementById('code');
  function bytes(b64s){var s=atob(b64s),a=new Uint8Array(s.length);for(var i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return a}
  async function unlock(){
    var code=(inp.value||'').trim();
    if(!code){msg.textContent='Please enter your access code';return}
    btn.disabled=true;btn.textContent='⏳ Verifying...';msg.textContent='';
    try{
      var r=await fetch(FN,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({p:P,code:code})});
      var j=await r.json().catch(function(){return{}});
      if(!r.ok||!j.key){msg.textContent=j.error==='rate'?'Too many attempts — wait a minute':'Invalid access code';
        btn.disabled=false;btn.textContent='Unlock Report';return}
      var key=await crypto.subtle.importKey('raw',bytes(j.key),{name:'AES-GCM'},false,['decrypt']);
      var plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(IV)},key,bytes(DATA));
      var html=new TextDecoder().decode(plain);
      document.open();document.write(html);document.close();
    }catch(e){
      msg.textContent='Could not open the report — check your connection';
      btn.disabled=false;btn.textContent='Unlock Report';
    }
  }
  btn.addEventListener('click',unlock);
  inp.addEventListener('keypress',function(e){if(e.key==='Enter')unlock()});
})();
</script></body></html>`;
}

// Per-instance throttle: cheap brake on code guessing against one report.
const attempts = new Map<string, { n: number; until: number }>();
function throttled(keyId: string): boolean {
  const now = Date.now();
  const rec = attempts.get(keyId);
  if (rec && rec.until > now && rec.n >= 8) return true;
  if (!rec || rec.until <= now) attempts.set(keyId, { n: 1, until: now + 60_000 });
  else rec.n += 1;
  return false;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  const sb = createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });

  // ── Unlock: hand back the content key when the code is valid RIGHT NOW ──
  if (req.method === 'POST') {
    let body: { p?: string; code?: string } = {};
    try { body = await req.json(); } catch { /* invalid json → treated as missing */ }
    const p = String(body.p || '').trim();
    const code = String(body.code || '').trim();
    if (!PATH_RE.test(p) || !code) {
      return new Response(JSON.stringify({ error: 'bad_request' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
    if (throttled(p)) {
      return new Response(JSON.stringify({ error: 'rate' }), { status: 429, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
    const centre = centreOf(p);
    if (!(await codeOpensCentre(sb, centre, code))) {
      return new Response(JSON.stringify({ error: 'invalid' }), { status: 403, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
    const { data } = await sb.from('report_keys').select('key_b64').eq('report_path', p).maybeSingle();
    if (!data) {
      return new Response(JSON.stringify({ error: 'no_key' }), { status: 404, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ key: (data as { key_b64: string }).key_b64 }), {
      headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  // ── Build: render the report, encrypt it, return the locker page ──
  const url = new URL(req.url);
  const p = (url.searchParams.get('p') || '').trim();
  if (!PATH_RE.test(p)) return new Response('Not found', { status: 404, headers: cors });

  const { data: file, error } = await sb.storage.from('reports').download(p);
  if (error || !file) return new Response('Report not found', { status: 404, headers: cors });

  let html: string;
  try {
    html = renderReadingReview(JSON.parse(await file.text()));
  } catch (e) {
    return new Response('Render failed: ' + (e as Error).message, { status: 500, headers: cors });
  }

  // One key per report, reused if this runs twice for the same attempt.
  const existing = await sb.from('report_keys').select('key_b64').eq('report_path', p).maybeSingle();
  let keyB64 = (existing.data as { key_b64?: string } | null)?.key_b64 ?? '';
  if (!keyB64) {
    keyB64 = b64(crypto.getRandomValues(new Uint8Array(32)));
    await sb.from('report_keys').insert({ report_path: p, center: centreOf(p), key_b64: keyB64 });
  }

  const rawKey = Uint8Array.from(atob(keyB64), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(html));

  const page = lockerPage(p, `${SB_URL}/functions/v1/report-locked`, b64(iv), b64(cipher));
  return new Response(page, {
    headers: { ...cors, 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
});
