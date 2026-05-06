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

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });
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

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return json(400, { error: 'invalid_json' }); }

  const passcode = (body.adminPasscode || '') as string;
  const userJwt  = (body.userJwt || '') as string;
  // Prefer JWT (browser-based admins). Fall back to numeric passcode (bots / scripts).
  let auth: AuthResult = { role: 'none' };
  if (userJwt)  auth = await authenticateViaJwt(userJwt);
  if (auth.role === 'none' && passcode) auth = await authenticate(passcode);
  if (auth.role === 'none') return json(401, { error: 'unauthorized' });
  const actor = auth.role === 'super_admin' ? 'super_admin' : `admin:${auth.center}`;

  const action = (body.action || '') as string;

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

      default:
        return json(400, { error: 'unknown_action' });
    }
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }
});
