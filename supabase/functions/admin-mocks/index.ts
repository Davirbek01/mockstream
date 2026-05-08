// =====================================================================
// Supabase Edge Function: admin-mocks
// ---------------------------------------------------------------------
// Admin-gated CRUD for the Mock Settings panel. Every request must
// include a valid admin passcode (super_admin or center admin). The
// function uses the service_role key internally so RLS doesn't block
// writes — the adminPasscode check is the only thing keeping random
// visitors out.
//
// Every INSERT / UPDATE / DELETE on mock_tests snapshots the prior
// row state into mock_tests_backups *before* the mutation, so
// "Restore" is a one-click revert.
//
// Request shape:
//   POST { adminPasscode, action, ...args }
//
// Actions:
//   list                                      → [{ id, mock_type, mock_number, title, status, updated_at }]
//   get          { id }                       → { id, mock_data, mock_type, mock_number, title, status }
//   create       { mock_type, mock_number, title?, status?, mock_data }
//                                             → { id }
//   update       { id, patch: { mock_data?, title?, status?, mock_number?, mock_type? } }
//                                             → { id }
//   delete       { id }                       → { ok: true }
//   list_backups { id }                       → [{ backup_id, action, taken_at, actor }]
//   restore      { backup_id }                → { id, restored: true }
//
// Deploy:
//   supabase functions deploy admin-mocks --no-verify-jwt
// =====================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info'
};

// Per-IP rate limit on auth attempts. Tighter than verify-passcode's
// 10/min because admin auth is rare (one human, occasional batch jobs)
// while student verify is high-frequency. With 5/min the brute-force
// budget for the 6-digit numeric passcode space is ~14 years.
const RATE_LIMIT_MAX = 5;        // attempts
const RATE_LIMIT_SEC = 60;       // window

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}

function getIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim()
      || req.headers.get('cf-connecting-ip')
      || '';
}

async function rateLimited(ip: string): Promise<boolean> {
  if (!ip) return false;
  const since = new Date(Date.now() - RATE_LIMIT_SEC * 1000).toISOString();
  const { count } = await sb
    .from('admin_mocks_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip', ip)
    .eq('ok', false)
    .gte('ts', since);
  return (count ?? 0) >= RATE_LIMIT_MAX;
}

async function logAttempt(ip: string, ok: boolean, action: string, actor: string) {
  if (!ip) return;
  // Fire-and-forget; failure to log must not break the request path.
  sb.from('admin_mocks_attempts').insert({ ip, ok, action, actor }).then(() => {});
}

function ctEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

type AuthResult =
  | { role: 'super_admin' }
  | { role: 'admin'; center: string }
  | { role: 'none' };

async function authenticate(passcode: string): Promise<AuthResult> {
  if (!passcode) return { role: 'none' };
  const { data } = await sb.from('admin_passcodes').select('center, passcode');
  if (!data) return { role: 'none' };
  for (const row of data) {
    if (ctEq(row.passcode, passcode)) {
      if (row.center === '__super__') return { role: 'super_admin' };
      return { role: 'admin', center: row.center };
    }
  }
  return { role: 'none' };
}

// Browser admins authenticate via their Supabase JWT — matches the
// codes-manager authenticateViaJwt pattern exactly.
async function authenticateViaJwt(jwt: string): Promise<AuthResult> {
  if (!jwt) return { role: 'none' };
  let email = '';
  try {
    const { data, error } = await sb.auth.getUser(jwt);
    if (error || !data || !data.user || !data.user.email) return { role: 'none' };
    email = data.user.email.toLowerCase();
  } catch {
    return { role: 'none' };
  }
  if (!email) return { role: 'none' };
  if (email === 'davirbekkhasanov02@gmail.com') return { role: 'super_admin' };
  const { data: row } = await sb
    .from('premium_emails')
    .select('center, role, active')
    .eq('email', email)
    .eq('role', 'admin')
    .eq('active', true)
    .maybeSingle();
  if (!row) return { role: 'none' };
  const center = (row.center || '').toString();
  if (!center) return { role: 'super_admin' };
  return { role: 'admin', center: center.toLowerCase().replace(/[_\s]/g, '') };
}

// ─────────────────────────────────────────────────────────────────────
// GCS V4 signed URL generation
// ─────────────────────────────────────────────────────────────────────
// We sign PUT URLs locally using the service account's private key — no
// network call to Google's IAM API needed. The browser then uploads the
// file directly to GCS using the signed URL, so the file bytes never
// pass through this Edge Function (saves Supabase bandwidth, faster).
//
// Service account JSON shape (from Supabase secret GCS_SERVICE_ACCOUNT_JSON):
//   { client_email: "...", private_key: "-----BEGIN PRIVATE KEY-----\n..." }
// ─────────────────────────────────────────────────────────────────────

const GCS_BUCKET = 'mockstream-listening-audio';

// Folder layout in the bucket. Each skill that has uploaded media gets
// its own subfolder. Anything new (charts, audio, images for new skills)
// drops into the matching path.
const GCS_FOLDERS: Record<string, string> = {
  'ielts-writing':   'IELTS writing task one graphs',
  'cefr-writing':    'CEFR writing media',
  'ielts-listening': 'IELTS listening audio',
  'cefr-listening':  'CEFR listening audio',
  'ielts-speaking':  'IELTS speaking media',
  'cefr-speaking':   'CEFR speaking media',
  'ielts-reading':   'IELTS reading media',
  'cefr-reading':    'CEFR reading media',
  'voice-preview':   'Voice previews'
};

// Allowed MIME types per kind. Browser sends a content type with the file;
// we refuse anything outside this list to keep the bucket clean.
const ALLOWED_MIME = new Set([
  'image/png','image/jpeg','image/webp','image/gif',
  'audio/mpeg','audio/mp4','audio/ogg','audio/wav','audio/x-m4a','audio/x-wav'
]);

// Max upload size in MB. The browser is told this before it tries to upload.
const MAX_UPLOAD_MB = 25;

// PEM private key → CryptoKey for RSA-SHA256 signing.
async function importPrivateKey(pem: string): Promise<CryptoKey> {
  // Strip PEM headers/footers and whitespace, then base64-decode to DER.
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');
  const der = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    'pkcs8',
    der.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

// Hex-encode a byte array (lowercase).
function toHex(buf: ArrayBuffer): string {
  const arr = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < arr.length; i++) s += arr[i].toString(16).padStart(2, '0');
  return s;
}

// SHA-256 hex digest.
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return toHex(buf);
}

// RFC 3986 percent-encoding. encodeURIComponent is close but doesn't
// escape '!*()'. GCS canonicalisation requires the strict version.
function encodeRfc3986(s: string): string {
  return encodeURIComponent(s).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

// Encode an object path for use inside a URL, BUT preserve forward slashes
// (per GCS V4 signing spec — slashes are part of the canonical resource).
function encodeObjectPath(path: string): string {
  return path.split('/').map(encodeRfc3986).join('/');
}

// Wrap raw 16-bit signed PCM mono bytes in a 44-byte RIFF/WAVE header.
// Gemini TTS returns 24 kHz mono PCM (mime audio/L16;codecs=pcm;rate=24000).
// Browsers play WAV natively — wrap once on the server and we never need
// a client-side decoder.
function pcmToWav(pcmBytes: Uint8Array, sampleRate: number = 24000): Uint8Array {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = pcmBytes.length;
  const fileSize = 36 + dataSize;
  const buf = new Uint8Array(44 + dataSize);
  const dv = new DataView(buf.buffer);
  // "RIFF" chunk descriptor
  buf.set([0x52,0x49,0x46,0x46], 0);            // "RIFF"
  dv.setUint32(4, fileSize, true);
  buf.set([0x57,0x41,0x56,0x45], 8);            // "WAVE"
  // "fmt " sub-chunk
  buf.set([0x66,0x6d,0x74,0x20], 12);           // "fmt "
  dv.setUint32(16, 16, true);                   // PCM fmt chunk size
  dv.setUint16(20, 1, true);                    // audio format = PCM
  dv.setUint16(22, numChannels, true);
  dv.setUint32(24, sampleRate, true);
  dv.setUint32(28, byteRate, true);
  dv.setUint16(32, blockAlign, true);
  dv.setUint16(34, bitsPerSample, true);
  // "data" sub-chunk
  buf.set([0x64,0x61,0x74,0x61], 36);           // "data"
  dv.setUint32(40, dataSize, true);
  buf.set(pcmBytes, 44);
  return buf;
}

interface SignedPutUrlOpts {
  objectPath: string;          // e.g. 'IELTS writing task one graphs/foo.png'
  contentType: string;         // exact value the browser will send in Content-Type
  ttlSeconds: number;          // typically 600
  serviceAccountEmail: string; // from JSON
  privateKey: CryptoKey;       // imported via importPrivateKey
}
async function generateV4SignedPutUrl(opts: SignedPutUrlOpts): Promise<{ uploadUrl: string; expiresAt: string }> {
  const now = new Date();
  const datestamp   = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timestamp   = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const credentialScope = `${datestamp}/auto/storage/goog4_request`;
  const credential      = `${opts.serviceAccountEmail}/${credentialScope}`;
  const host = 'storage.googleapis.com';

  // Headers we commit to in the signature. The browser MUST send exactly
  // the same content-type, otherwise GCS rejects the PUT.
  const signedHeaders = ['content-type', 'host'];
  const canonicalHeaders =
      `content-type:${opts.contentType}\n` +
      `host:${host}\n`;

  // Query string in canonical (sorted) order.
  const queryParams: Record<string, string> = {
    'X-Goog-Algorithm':     'GOOG4-RSA-SHA256',
    'X-Goog-Credential':    credential,
    'X-Goog-Date':          timestamp,
    'X-Goog-Expires':       String(opts.ttlSeconds),
    'X-Goog-SignedHeaders': signedHeaders.join(';')
  };
  const canonicalQueryString = Object.keys(queryParams).sort()
    .map((k) => `${encodeRfc3986(k)}=${encodeRfc3986(queryParams[k])}`).join('&');

  const canonicalUri = `/${GCS_BUCKET}/${encodeObjectPath(opts.objectPath)}`;
  const canonicalRequest =
      `PUT\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders.join(';')}\nUNSIGNED-PAYLOAD`;
  const hashedCanonicalRequest = await sha256Hex(canonicalRequest);
  const stringToSign = `GOOG4-RSA-SHA256\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;
  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    opts.privateKey,
    new TextEncoder().encode(stringToSign)
  );
  const signature = toHex(sig);

  const uploadUrl =
    `https://${host}${canonicalUri}?${canonicalQueryString}&X-Goog-Signature=${signature}`;
  const expiresAt = new Date(Date.now() + opts.ttlSeconds * 1000).toISOString();
  return { uploadUrl, expiresAt };
}

// Snapshot a row before mutating it. Reads the current row (or null for
// inserts) and appends to mock_tests_backups so "Restore" can replay.
async function snapshotMock(mockId: string | null, action: 'insert' | 'update' | 'delete', actor: string) {
  let prior: Record<string, unknown> | null = null;
  if (mockId) {
    const { data } = await sb
      .from('mock_tests')
      .select('id, mock_data, mock_type, mock_number, title, status')
      .eq('id', mockId)
      .maybeSingle();
    prior = (data as Record<string, unknown>) || null;
  }
  await sb.from('mock_tests_backups').insert({
    mock_id:     prior?.id ?? mockId ?? '00000000-0000-0000-0000-000000000000',
    mock_data:   prior?.mock_data ?? null,
    mock_type:   prior?.mock_type ?? null,
    mock_number: prior?.mock_number ?? null,
    title:       prior?.title ?? null,
    status:      prior?.status ?? null,
    action,
    actor
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST')    return json(405, { error: 'POST required' });

  const ip = getIp(req);

  // Reject early if this IP has burned through the recent-failure budget.
  // Only failed attempts count against the limit, so a legitimate admin
  // doing many rapid edits is never throttled.
  if (await rateLimited(ip)) {
    await logAttempt(ip, false, '', 'rate_limited');
    return json(429, { error: 'rate_limited' });
  }

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return json(400, { error: 'invalid_json' }); }

  const passcode = (body.adminPasscode || '') as string;
  const userJwt  = (body.userJwt || '') as string;
  // Prefer JWT (browser-based admins). Fall back to numeric passcode (bots / scripts).
  let auth: AuthResult = { role: 'none' };
  if (userJwt)  auth = await authenticateViaJwt(userJwt);
  if (auth.role === 'none' && passcode) auth = await authenticate(passcode);
  if (auth.role === 'none') {
    await logAttempt(ip, false, (body.action || '') as string, '');
    return json(401, { error: 'unauthorized' });
  }
  const actor = auth.role === 'super_admin' ? 'super_admin' : `admin:${auth.center}`;

  const action = (body.action || '') as string;
  // Log success up-front (request still might fail with 4xx/5xx after this,
  // but auth itself was OK — the audit trail wants both signals).
  await logAttempt(ip, true, action, actor);

  // mock_tests is global content shared by all 6 sites — a single mock change
  // affects every clone's students. Only super_admin can mutate. Centre admins
  // can still list/get/list_backups for visibility, but writes are gated.
  // Signed-upload URLs are also super-admin only — anyone with one can write
  // a single file to the bucket.
  const WRITE_ACTIONS = new Set(['create', 'update', 'delete', 'restore', 'gcs_signed_upload_url']);
  if (WRITE_ACTIONS.has(action) && auth.role !== 'super_admin') {
    return json(403, { error: 'super_admin_required' });
  }

  try {
    switch (action) {

      // ── list ──────────────────────────────────────────────────────────
      case 'list': {
        const { data, error } = await sb
          .from('mock_tests')
          .select('id, mock_type, mock_number, title, status, updated_at')
          .order('mock_type', { ascending: true })
          .order('mock_number', { ascending: true });
        if (error) return json(500, { error: error.message });
        return json(200, { mocks: data || [] });
      }

      // ── get full mock (incl. mock_data JSONB) ────────────────────────
      case 'get': {
        const id = (body.id || '') as string;
        if (!id) return json(400, { error: 'id required' });
        const { data, error } = await sb
          .from('mock_tests')
          .select('id, mock_type, mock_number, title, status, mock_data, updated_at')
          .eq('id', id)
          .maybeSingle();
        if (error) return json(500, { error: error.message });
        if (!data)  return json(404, { error: 'not_found' });
        return json(200, { mock: data });
      }

      // ── create ───────────────────────────────────────────────────────
      case 'create': {
        const mt = (body.mock_type || '') as string;
        if (!mt) return json(400, { error: 'mock_type required' });
        const row = {
          mock_type:   mt,
          mock_number: (body.mock_number ?? null) as number | null,
          title:       (body.title ?? null) as string | null,
          status:      ((body.status as string) || 'published'),
          mock_data:   body.mock_data || {}
        };
        const { data, error } = await sb
          .from('mock_tests')
          .insert(row)
          .select('id')
          .single();
        if (error) return json(500, { error: error.message });
        await snapshotMock((data as { id: string }).id, 'insert', actor);
        return json(200, { id: (data as { id: string }).id });
      }

      // ── update (snapshot prior state first) ──────────────────────────
      case 'update': {
        const id = (body.id || '') as string;
        if (!id) return json(400, { error: 'id required' });
        const patch = (body.patch || {}) as Record<string, unknown>;
        await snapshotMock(id, 'update', actor);
        const { error } = await sb.from('mock_tests').update(patch).eq('id', id);
        if (error) return json(500, { error: error.message });
        return json(200, { id });
      }

      // ── delete (snapshot prior state first) ──────────────────────────
      case 'delete': {
        const id = (body.id || '') as string;
        if (!id) return json(400, { error: 'id required' });
        await snapshotMock(id, 'delete', actor);
        const { error } = await sb.from('mock_tests').delete().eq('id', id);
        if (error) return json(500, { error: error.message });
        return json(200, { ok: true });
      }

      // ── list backups for one mock ────────────────────────────────────
      case 'list_backups': {
        const id = (body.id || '') as string;
        if (!id) return json(400, { error: 'id required' });
        const { data, error } = await sb
          .from('mock_tests_backups')
          .select('backup_id, action, actor, taken_at')
          .eq('mock_id', id)
          .order('taken_at', { ascending: false })
          .limit(50);
        if (error) return json(500, { error: error.message });
        return json(200, { backups: data || [] });
      }

      // ── restore from a specific backup ───────────────────────────────
      case 'restore': {
        const backupId = body.backup_id as number | undefined;
        if (!backupId) return json(400, { error: 'backup_id required' });
        const { data: snap, error: e1 } = await sb
          .from('mock_tests_backups')
          .select('*')
          .eq('backup_id', backupId)
          .maybeSingle();
        if (e1) return json(500, { error: e1.message });
        if (!snap) return json(404, { error: 'backup_not_found' });
        const s = snap as {
          mock_id: string; mock_data: unknown; mock_type: string; mock_number: number | null;
          title: string | null; status: string | null; action: string;
        };
        // Snapshot whatever's currently there so we never clobber silently.
        await snapshotMock(s.mock_id, 'update', actor + ':restore');
        // Upsert by id — restores both deleted rows and overwrites edits.
        const restored = {
          id:          s.mock_id,
          mock_data:   s.mock_data,
          mock_type:   s.mock_type,
          mock_number: s.mock_number,
          title:       s.title,
          status:      s.status || 'published'
        };
        const { error } = await sb.from('mock_tests').upsert(restored, { onConflict: 'id' });
        if (error) return json(500, { error: error.message });
        return json(200, { id: s.mock_id, restored: true });
      }

      // ── GCS signed PUT URL — for in-editor media uploads ────────────
      // Body: { skill, filename, contentType }
      // Returns: { uploadUrl, publicUrl, objectPath, expiresAt }
      // The browser then PUTs the file directly to uploadUrl with the
      // EXACT same Content-Type header. publicUrl is what gets stored in
      // mock_data (chartImageUrl / audioFile / etc).
      case 'gcs_signed_upload_url': {
        const skill = (body.skill || '') as string;
        const filename = (body.filename || '') as string;
        const contentType = (body.contentType || '') as string;
        if (!skill)       return json(400, { error: 'skill required' });
        if (!filename)    return json(400, { error: 'filename required' });
        if (!contentType) return json(400, { error: 'contentType required' });
        const folder = GCS_FOLDERS[skill];
        if (!folder)      return json(400, { error: 'unknown_skill' });
        if (!ALLOWED_MIME.has(contentType.toLowerCase())) {
          return json(400, { error: 'unsupported_content_type', contentType });
        }
        // Sanitise filename — strip path separators, NUL bytes, leading dots.
        // Keep alnum + dash/underscore/dot/space; everything else → underscore.
        const safe = filename
          .replace(/[\\\/\x00]/g, '')
          .replace(/^\.+/, '')
          .replace(/[^A-Za-z0-9._\- ]/g, '_')
          .slice(0, 200);
        if (!safe || safe === '.') return json(400, { error: 'bad_filename' });
        const objectPath = `${folder}/${safe}`;

        const sa = Deno.env.get('GCS_SERVICE_ACCOUNT_JSON') || '';
        if (!sa) return json(500, { error: 'gcs_secret_missing' });
        let saObj: { client_email: string; private_key: string };
        try { saObj = JSON.parse(sa); } catch { return json(500, { error: 'gcs_secret_invalid' }); }
        if (!saObj.client_email || !saObj.private_key) {
          return json(500, { error: 'gcs_secret_missing_fields' });
        }
        let privateKey: CryptoKey;
        try { privateKey = await importPrivateKey(saObj.private_key); }
        catch (e) { return json(500, { error: 'gcs_key_import_failed', detail: (e as Error).message }); }

        const { uploadUrl, expiresAt } = await generateV4SignedPutUrl({
          objectPath,
          contentType,
          ttlSeconds: 600,             // 10 minutes — plenty for a chart/audio upload
          serviceAccountEmail: saObj.client_email,
          privateKey
        });
        // Public URL (assumes the bucket has Allow Public Read on its
        // contents — same configuration as the existing audio).
        const publicUrl = `https://storage.googleapis.com/${GCS_BUCKET}/${encodeObjectPath(objectPath)}`;
        return json(200, {
          uploadUrl,
          publicUrl,
          objectPath,
          expiresAt,
          maxBytes: MAX_UPLOAD_MB * 1024 * 1024
        });
      }

      default:
        return json(400, { error: 'unknown_action' });
    }
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }
});
