// ============================================================================
// Supabase Edge Function: speaking-draft
// ----------------------------------------------------------------------------
// Keeps a signed-in student's unfinished speaking answers on the server so the
// exam can be continued on another device (2026-09-16).
//
// Storage: private bucket `speaking-drafts`, service role only.
//   <sha256(email)[:32]>/<test_type>/<mock>/q<N>.webm   the recorded answer
//   <sha256(email)[:32]>/<test_type>/<mock>/q<N>.txt    its transcript (premium)
// One draft per test type: saving an answer for a different mock removes the
// previous mock's folder, the same way test_sessions keeps one row per type.
//
// Who is calling comes from the JWT the page holds, verified against the
// project's signing keys. An EXPIRED token is still accepted for 24 hours:
// exam pages cannot refresh a token, a mock outlives one, and the signature is
// what proves the account — expiry only limits how long a stolen token is
// useful, and here it could only touch its owner's own drafts.
//
// Actions:
//   put    multipart { test_type, mock, q, kind: audio|text, file }
//   list   json { test_type, mock }  → { files: [{ q, kind, size, url }] }
//          (signed URLs, 10 minutes)
//   clear  json { test_type }         → removes the whole draft for that type
//
// Deploy: supabase functions deploy speaking-draft --no-verify-jwt
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createRemoteJWKSet, jwtVerify } from 'npm:jose@5.9.6';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const BUCKET = 'speaking-drafts';
const TEST_TYPES = ['cefr-speaking', 'ielts-speaking'];
const MAX_BYTES = 8 * 1024 * 1024;
const TOKEN_GRACE_SECONDS = 24 * 60 * 60;

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const JWKS = createRemoteJWKSet(new URL(SUPABASE_URL + '/auth/v1/.well-known/jwks.json'));

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

async function callerEmail(req: Request): Promise<string> {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!token || token.split('.').length !== 3) return '';
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: SUPABASE_URL + '/auth/v1',
      clockTolerance: TOKEN_GRACE_SECONDS,
    });
    if (payload.role !== 'authenticated') return '';
    const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
    return email;
  } catch {
    return '';
  }
}

async function ownerPrefix(email: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('speaking-draft:' + email));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

function cleanMock(v: unknown): string {
  const s = String(v ?? '').trim();
  return /^[A-Za-z0-9_-]{1,40}$/.test(s) ? s : '';
}

async function listNames(prefix: string): Promise<{ name: string; size: number }[]> {
  const { data, error } = await sb.storage.from(BUCKET).list(prefix, { limit: 200 });
  if (error) throw new Error('list: ' + error.message);
  return (data || []).map((o) => ({ name: o.name, size: Number((o.metadata as Record<string, unknown> | null)?.size || 0) }));
}

async function removeFolder(folder: string) {
  const files = await listNames(folder);
  if (files.length) {
    const { error } = await sb.storage.from(BUCKET).remove(files.map((f) => folder + '/' + f.name));
    if (error) throw new Error('remove: ' + error.message);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST')    return json(405, { error: 'method_not_allowed' });

  const email = await callerEmail(req);
  if (!email) return json(401, { error: 'not_signed_in' });
  const owner = await ownerPrefix(email);

  try {
    const ctype = req.headers.get('content-type') || '';

    // ---- put (multipart) ----
    if (ctype.startsWith('multipart/form-data')) {
      const form = await req.formData();
      if (String(form.get('action') || '') !== 'put') return json(400, { error: 'bad_action' });
      const testType = String(form.get('test_type') || '');
      const mock = cleanMock(form.get('mock'));
      const q = Number(form.get('q'));
      const kind = String(form.get('kind') || 'audio') === 'text' ? 'text' : 'audio';
      const file = form.get('file');
      if (!TEST_TYPES.includes(testType) || !mock || !Number.isInteger(q) || q < 1 || q > 40 || !(file instanceof File)) {
        return json(400, { error: 'bad_request' });
      }
      if (file.size <= 0 || file.size > MAX_BYTES) return json(413, { error: 'bad_size' });

      // One draft per test type: a different mock replaces the old one.
      const typeFolder = `${owner}/${testType}`;
      const folders = await listNames(typeFolder);
      for (const f of folders) {
        if (f.name !== mock && !f.name.includes('.')) await removeFolder(`${typeFolder}/${f.name}`);
      }

      const path = `${typeFolder}/${mock}/q${q}.${kind === 'text' ? 'txt' : 'webm'}`;
      const { error } = await sb.storage.from(BUCKET).upload(path, file, {
        upsert: true,
        contentType: kind === 'text' ? 'text/plain; charset=utf-8' : (file.type || 'audio/webm'),
      });
      if (error) return json(500, { error: 'upload_failed', detail: error.message });
      return json(200, { ok: true, q, kind, size: file.size });
    }

    // ---- list / clear (json) ----
    let body: Record<string, unknown> = {};
    try { body = await req.json(); } catch { /* empty */ }
    const action = String(body.action || '');
    const testType = String(body.test_type || '');
    if (!TEST_TYPES.includes(testType)) return json(400, { error: 'bad_test_type' });

    if (action === 'clear') {
      const typeFolder = `${owner}/${testType}`;
      const folders = await listNames(typeFolder);
      for (const f of folders) await removeFolder(`${typeFolder}/${f.name}`);
      return json(200, { ok: true, cleared: folders.length });
    }

    if (action === 'list') {
      const mock = cleanMock(body.mock);
      if (!mock) return json(400, { error: 'bad_mock' });
      const folder = `${owner}/${testType}/${mock}`;
      const files = (await listNames(folder)).filter((f) => /^q\d+\.(webm|txt)$/.test(f.name));
      if (!files.length) return json(200, { files: [] });
      const { data: signed, error } = await sb.storage.from(BUCKET)
        .createSignedUrls(files.map((f) => `${folder}/${f.name}`), 600);
      if (error) return json(500, { error: 'sign_failed', detail: error.message });
      const urlByPath = new Map((signed || []).map((s) => [s.path, s.signedUrl]));
      return json(200, {
        files: files.map((f) => ({
          q: Number(f.name.match(/^q(\d+)/)![1]),
          kind: f.name.endsWith('.txt') ? 'text' : 'audio',
          size: f.size,
          url: urlByPath.get(`${folder}/${f.name}`) || null,
        })),
      });
    }

    return json(400, { error: 'bad_action' });
  } catch (e) {
    console.error('[speaking-draft]', (e as Error).message);
    return json(500, { error: 'server_error' });
  }
});
