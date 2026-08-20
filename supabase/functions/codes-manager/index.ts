// =====================================================================
// Supabase Edge Function: codes-manager
// ---------------------------------------------------------------------
// Admin-gated CRUD for the Code Management panel.
// Every request MUST include a valid admin passcode; super-admin can act on
// any center, clone admins (matched by center) can only act on their own.
//
// Request shape:
//   POST  { adminPasscode, action, ...args }
//
// Actions:
//   list_centers
//   list_codes              { center }
//   add_center              { id, displayName }
//   set_center_flag         { center, flag: 'clone_can_edit'|'premium_mode', value: bool }
//   set_admin_passcode      { center, newPasscode }       // super-admin only
//   renew_vip               { center, type: 'regular'|'premium', length?: 4..8, expiry?: ISO|null }
//   renew_mock              { center, skill, mock_number, length?, expiry? }
//   set_expiry              { kind:'vip'|'mock', center, type?, skill?, mock_number?, expiry: ISO|null }
//   revoke_vip              { center, type }
//   revoke_mock             { center, skill, mock_number }
//   audit                   { center?, limit? }            // last N actions
//
// Security note: this function uses service-role internally. The ONLY thing
// preventing a random visitor from calling it is the adminPasscode check.
// If you forget the super-admin passcode, reset directly in the DB.
//
// Deploy:
//   supabase functions deploy codes-manager --no-verify-jwt
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

function genCode(length = 8): string {
  // Cryptographically random numeric string of given length, no fixed pattern.
  const buf = new Uint32Array(length);
  crypto.getRandomValues(buf);
  let out = '';
  for (let i = 0; i < length; i++) out += String(buf[i] % 10);
  return out;
}

function normCenter(c: unknown): string {
  return typeof c === 'string' ? c.toLowerCase().replace(/[_\s]/g, '') : '';
}

type AuthResult =
  | { role: 'super_admin' }
  | { role: 'admin'; center: string }
  | { role: 'none' };

async function authenticate(passcode: string): Promise<AuthResult> {
  if (!passcode) return { role: 'none' };
  const { data } = await sb
    .from('admin_passcodes')
    .select('center, passcode');
  if (!data) return { role: 'none' };
  for (const row of data) {
    if (ctEq(row.passcode, passcode)) {
      if (row.center === '__super__') return { role: 'super_admin' };
      return { role: 'admin', center: row.center };
    }
  }
  return { role: 'none' };
}

// Browser-side admins authenticate via their Supabase JWT instead of a
// numeric passcode. We resolve the JWT to an email via
// supabase.auth.getUser(), then look up the email in `premium_emails` to
// determine super-admin (center is empty/null) vs center-scoped admin.
// Telegram bots / manager bots continue to use `adminPasscode`.
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
  // Hardcoded super-admin escape hatch (matches the DB-side _caller_is_admin).
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
  return { role: 'admin', center: normCenter(center) };
}

async function audit(actor: string, action: string, center: string | null, details: unknown) {
  sb.from('code_audit').insert({ actor, action, center, details }).then(() => {});
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST')    return json(405, { ok: false, error: 'method_not_allowed' });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return json(400, { ok: false, error: 'bad_json' }); }

  const adminPasscode = String(body.adminPasscode ?? '').trim();
  const userJwt       = String(body.userJwt ?? '').trim();
  // Prefer JWT (browser admins). Fall back to passcode (bots).
  let auth: AuthResult = { role: 'none' };
  if (userJwt) auth = await authenticateViaJwt(userJwt);
  if (auth.role === 'none' && adminPasscode) auth = await authenticate(adminPasscode);
  if (auth.role === 'none') return json(401, { ok: false, error: 'unauthorized' });

  const action = String(body.action ?? '');
  const isSuper = auth.role === 'super_admin';
  const actorTag = isSuper ? 'super_admin' : `clone:${(auth as { role:'admin'; center:string }).center}`;

  // Helper: check that a clone admin only touches their own center
  function ownsCenter(target: string): boolean {
    if (isSuper) return true;
    return (auth as { role:'admin'; center:string }).center === normCenter(target);
  }

  // Helper: check that clone is allowed to edit (clone_can_edit flag).
  // Super-admin always allowed.
  async function canMutate(center: string): Promise<boolean> {
    if (isSuper) return true;
    const { data } = await sb.from('centers').select('clone_can_edit').eq('id', center).maybeSingle();
    return !!data?.clone_can_edit;
  }

  try {
    switch (action) {
      // ── READ ─────────────────────────────────────────────────────────
      case 'list_centers': {
        const q = sb.from('centers').select('*').order('id');
        const { data, error } = await q;
        if (error) throw error;
        // Clone admins only see their own row
        const filtered = isSuper ? data : (data ?? []).filter(c => ownsCenter(c.id));
        return json(200, { ok: true, centers: filtered, role: auth.role });
      }

      // Does this passcode open System Administration on this site?
      //
      // The site asks before revealing the admin rows. A centre's own passcode
      // opens that centre and nothing else; the super-admin passcode opens any
      // of them. Nothing is returned but the verdict — no codes, no centre
      // list — so the answer is useless to anyone guessing.
      case 'admin_gate': {
        const center = normCenter(body.center);
        const ok = isSuper || (!!center && ownsCenter(center));
        // A refusal says only "no": telling a wrong caller that their code is
        // an admin code for SOME centre is a hint they should not get.
        if (!ok) return json(403, { ok: false });
        return json(200, { ok: true, role: auth.role, scope: isSuper ? 'super' : center });
      }

      case 'list_codes': {
        const center = normCenter(body.center);
        if (!center)            return json(400, { ok: false, error: 'no_center' });
        if (!ownsCenter(center)) return json(403, { ok: false, error: 'forbidden' });
        const [vip, mock, centerRow] = await Promise.all([
          sb.from('vip_codes').select('*').eq('center', center),
          sb.from('mock_codes').select('*').eq('center', center).order('skill').order('mock_number'),
          sb.from('centers').select('*').eq('id', center).maybeSingle()
        ]);
        return json(200, {
          ok: true,
          center: centerRow.data,
          vip: vip.data ?? [],
          mock: mock.data ?? []
        });
      }

      case 'audit': {
        if (!isSuper && !body.center) return json(403, { ok: false, error: 'forbidden' });
        const limit = Math.min(parseInt(String(body.limit ?? '100'), 10) || 100, 500);
        let q = sb.from('code_audit').select('*').order('ts', { ascending: false }).limit(limit);
        if (body.center) {
          const c = normCenter(body.center);
          if (!ownsCenter(c)) return json(403, { ok: false, error: 'forbidden' });
          q = q.eq('center', c);
        }
        const { data } = await q;
        return json(200, { ok: true, audit: data ?? [] });
      }

      // ── WRITE: centers ───────────────────────────────────────────────
      case 'add_center': {
        if (!isSuper) return json(403, { ok: false, error: 'super_admin_only' });
        const id = normCenter(body.id);
        const displayName = String(body.displayName ?? id);
        if (!id) return json(400, { ok: false, error: 'no_id' });
        const { error } = await sb.from('centers').upsert({ id, display_name: displayName });
        if (error) throw error;
        await audit(actorTag, 'add_center', id, { displayName });
        return json(200, { ok: true });
      }

      case 'set_center_flag': {
        if (!isSuper) return json(403, { ok: false, error: 'super_admin_only' });
        const center = normCenter(body.center);
        const flag = String(body.flag);
        const value = !!body.value;
        if (!center || !['clone_can_edit', 'premium_mode'].includes(flag)) {
          return json(400, { ok: false, error: 'bad_args' });
        }
        const { error } = await sb.from('centers')
          .update({ [flag]: value, updated_at: new Date().toISOString() })
          .eq('id', center);
        if (error) throw error;
        await audit(actorTag, 'set_center_flag', center, { flag, value });
        return json(200, { ok: true });
      }

      case 'set_admin_passcode': {
        if (!isSuper) return json(403, { ok: false, error: 'super_admin_only' });
        const center = body.center === '__super__' ? '__super__' : normCenter(body.center);
        const newPasscode = String(body.newPasscode ?? '').trim();
        if (!center || !/^\d{4,8}$/.test(newPasscode)) {
          return json(400, { ok: false, error: 'passcode_must_be_4_to_8_digits' });
        }
        const { error } = await sb.from('admin_passcodes').upsert({
          center, passcode: newPasscode,
          updated_at: new Date().toISOString(), updated_by: actorTag
        });
        if (error) throw error;
        await audit(actorTag, 'set_passcode', center, {});
        return json(200, { ok: true });
      }

      case 'get_admin_passcode': {
        if (!isSuper) return json(403, { ok: false, error: 'super_admin_only' });
        const center = body.center === '__super__' ? '__super__' : normCenter(body.center);
        if (!center) return json(400, { ok: false, error: 'no_center' });
        const { data } = await sb.from('admin_passcodes')
          .select('passcode, updated_at, updated_by')
          .eq('center', center)
          .maybeSingle();
        return json(200, { ok: true, passcode: data?.passcode ?? null, updated_at: data?.updated_at ?? null, updated_by: data?.updated_by ?? null });
      }

      // ── WRITE: VIP codes ─────────────────────────────────────────────
      case 'renew_vip': {
        const center = normCenter(body.center);
        const type   = String(body.type ?? '');
        if (!ownsCenter(center)) return json(403, { ok: false, error: 'forbidden' });
        if (!await canMutate(center)) return json(403, { ok: false, error: 'clone_edit_disabled' });
        if (!['regular','premium'].includes(type)) return json(400, { ok: false, error: 'bad_type' });
        const length = Math.min(Math.max(parseInt(String(body.length ?? '8'), 10) || 8, 4), 8);
        const expiry = body.expiry ? new Date(String(body.expiry)).toISOString() : null;
        const code = genCode(length);
        const { error } = await sb.from('vip_codes').upsert({
          center, type, code, expires_at: expiry,
          last_renewed_at: new Date().toISOString(),
          last_renewed_by: actorTag
        });
        if (error) throw error;
        await audit(actorTag, 'renew_vip', center, { type, length, expiry });
        return json(200, { ok: true, code, expires_at: expiry });
      }

      case 'revoke_vip': {
        const center = normCenter(body.center);
        const type   = String(body.type ?? '');
        if (!ownsCenter(center)) return json(403, { ok: false, error: 'forbidden' });
        if (!await canMutate(center)) return json(403, { ok: false, error: 'clone_edit_disabled' });
        const { error } = await sb.from('vip_codes').delete().eq('center', center).eq('type', type);
        if (error) throw error;
        await audit(actorTag, 'revoke_vip', center, { type });
        return json(200, { ok: true });
      }

      // ── WRITE: mock codes ────────────────────────────────────────────
      case 'renew_mock': {
        const center = normCenter(body.center);
        const skill  = String(body.skill ?? '').toLowerCase().replace(/-/g, '_');
        const num    = parseInt(String(body.mock_number ?? ''), 10);
        const tier   = String(body.tier ?? 'premium').toLowerCase();
        if (!ownsCenter(center)) return json(403, { ok: false, error: 'forbidden' });
        if (!await canMutate(center)) return json(403, { ok: false, error: 'clone_edit_disabled' });
        if (!['listening','reading','writing','speaking','full_mock'].includes(skill)) {
          return json(400, { ok: false, error: 'bad_skill' });
        }
        if (!['regular','premium'].includes(tier)) return json(400, { ok: false, error: 'bad_tier' });
        if (!Number.isInteger(num) || num < 1 || num > 999) return json(400, { ok: false, error: 'bad_mock_number' });
        const length = Math.min(Math.max(parseInt(String(body.length ?? '8'), 10) || 8, 4), 8);
        const expiry = body.expiry ? new Date(String(body.expiry)).toISOString() : null;
        const code = genCode(length);
        const { error } = await sb.from('mock_codes').upsert({
          center, skill, mock_number: num, tier, code, expires_at: expiry,
          last_renewed_at: new Date().toISOString(),
          last_renewed_by: actorTag
        });
        if (error) throw error;
        await audit(actorTag, 'renew_mock', center, { skill, mock_number: num, tier, length, expiry });
        return json(200, { ok: true, code, tier, expires_at: expiry });
      }

      case 'revoke_mock': {
        const center = normCenter(body.center);
        const skill  = String(body.skill ?? '').toLowerCase().replace(/-/g, '_');
        const num    = parseInt(String(body.mock_number ?? ''), 10);
        const tier   = body.tier ? String(body.tier).toLowerCase() : null;
        if (!ownsCenter(center)) return json(403, { ok: false, error: 'forbidden' });
        if (!await canMutate(center)) return json(403, { ok: false, error: 'clone_edit_disabled' });
        let q = sb.from('mock_codes').delete()
          .eq('center', center).eq('skill', skill).eq('mock_number', num);
        if (tier && ['regular','premium'].includes(tier)) q = q.eq('tier', tier);
        const { error } = await q;
        if (error) throw error;
        await audit(actorTag, 'revoke_mock', center, { skill, mock_number: num, tier });
        return json(200, { ok: true });
      }

      // Bulk-issue/regenerate codes for every (skill × mock# 1..max × tier) for a center.
      // Body: { center, max_mock?, max_mock_by_skill?, mode? 'missing'|'all', skills?, tiers?, expiry?, length? }
      //   max_mock_by_skill: { listening: 100, reading: 99, writing: 99, speaking: 99 }
      //     (preferred; falls back to max_mock for missing skills)
      //   mode='missing' (default) → only insert rows that don't exist (existing codes preserved)
      //   mode='all'                → upsert every cell (revokes/replaces existing codes)
      case 'bulk_renew_mocks': {
        const center = normCenter(body.center);
        if (!ownsCenter(center)) return json(403, { ok: false, error: 'forbidden' });
        if (!await canMutate(center)) return json(403, { ok: false, error: 'clone_edit_disabled' });
        const allSkills = ['listening','reading','writing','speaking'] as const;
        const allTiers  = ['regular','premium'] as const;
        const skills = Array.isArray(body.skills) && body.skills.length
          ? body.skills.map((s: any) => String(s).toLowerCase()).filter((s: string) => (allSkills as readonly string[]).includes(s))
          : [...allSkills];
        const tiers = Array.isArray(body.tiers) && body.tiers.length
          ? body.tiers.map((t: any) => String(t).toLowerCase()).filter((t: string) => (allTiers as readonly string[]).includes(t))
          : [...allTiers];
        if (!skills.length || !tiers.length) return json(400, { ok: false, error: 'bad_scope' });
        const fallbackMax = parseInt(String(body.max_mock ?? ''), 10);
        const bySkill: Record<string, number> = {};
        const rawBy = body.max_mock_by_skill && typeof body.max_mock_by_skill === 'object' ? body.max_mock_by_skill : {};
        for (const s of skills) {
          let n = parseInt(String((rawBy as Record<string, unknown>)[s] ?? ''), 10);
          if (!Number.isInteger(n) || n < 1) n = Number.isInteger(fallbackMax) ? fallbackMax : NaN;
          if (!Number.isInteger(n) || n < 1 || n > 200) {
            return json(400, { ok: false, error: 'bad_max_mock_for_' + s });
          }
          bySkill[s] = n;
        }
        const mode = body.mode === 'all' ? 'all' : 'missing';
        const length = Math.min(Math.max(parseInt(String(body.length ?? '8'), 10) || 8, 4), 8);
        const expiry = body.expiry ? new Date(String(body.expiry)).toISOString() : null;
        const nowIso = new Date().toISOString();

        // Pre-load existing rows so we can skip in 'missing' mode
        const existing = new Set<string>();
        if (mode === 'missing') {
          const { data: rows, error: e0 } = await sb.from('mock_codes')
            .select('skill, mock_number, tier').eq('center', center);
          if (e0) throw e0;
          for (const r of rows ?? []) existing.add(`${r.skill}#${r.mock_number}#${r.tier}`);
        }

        const batch: Array<Record<string, unknown>> = [];
        for (const skill of skills) {
          const cap = bySkill[skill];
          for (let n = 1; n <= cap; n++) {
            for (const tier of tiers) {
              if (mode === 'missing' && existing.has(`${skill}#${n}#${tier}`)) continue;
              batch.push({
                center, skill, mock_number: n, tier,
                code: genCode(length), expires_at: expiry,
                last_renewed_at: nowIso, last_renewed_by: actorTag
              });
            }
          }
        }

        // Chunked upsert (Supabase POST limit ≈ 1000 rows; we stay well under)
        let written = 0;
        for (let i = 0; i < batch.length; i += 250) {
          const chunk = batch.slice(i, i + 250);
          const { error } = await sb.from('mock_codes').upsert(chunk);
          if (error) throw error;
          written += chunk.length;
        }
        await audit(actorTag, 'bulk_renew_mocks', center, {
          mode, max_mock_by_skill: bySkill, skills, tiers, written
        });
        return json(200, { ok: true, written, mode, max_mock_by_skill: bySkill, skills, tiers });
      }

      // Mock count registry — tells the panel/bot how many mocks exist per skill.
      // Computed LIVE from mock_tests (the source of truth) as the highest
      // mock_number per skill, unioned across both exams (cefr-<skill> +
      // ielts-<skill>), since a per-mock code is keyed by (skill, number) with
      // no exam dimension. All statuses count, so the ceiling is aware of a
      // mock the moment it's created — never lags. Falls back to a sane default
      // per skill if a query fails or a skill has no mocks yet.
      case 'get_mock_counts': {
        const def: Record<string, number> = { listening: 100, reading: 99, writing: 99, speaking: 99 };
        const skills = ['listening', 'reading', 'writing', 'speaking'];
        const counts: Record<string, number> = { ...def };
        let source = 'mock_tests';
        try {
          const maxes = await Promise.all(skills.map(async (s) => {
            const { data, error } = await sb.from('mock_tests')
              .select('mock_number')
              .in('mock_type', ['cefr-' + s, 'ielts-' + s])
              .order('mock_number', { ascending: false })
              .limit(1);
            if (error) throw error;
            const n = data && data[0] ? parseInt(String(data[0].mock_number), 10) : 0;
            return Number.isInteger(n) && n >= 1 ? n : def[s];
          }));
          skills.forEach((s, i) => { counts[s] = maxes[i]; });
        } catch (_e) {
          source = 'default';
        }
        return json(200, {
          ok: true, counts,
          source,
          updated_at: new Date().toISOString()
        });
      }

      // Sync detected counts (called by the panel on open).
      case 'set_mock_counts': {
        const raw = body.counts && typeof body.counts === 'object' ? body.counts : {};
        const def = { listening: 100, reading: 99, writing: 99, speaking: 99 };
        const counts: Record<string, number> = {};
        for (const k of Object.keys(def)) {
          const n = parseInt(String((raw as Record<string, unknown>)[k] ?? ''), 10);
          if (!Number.isInteger(n) || n < 1 || n > 200) {
            return json(400, { ok: false, error: 'bad_count_for_' + k });
          }
          counts[k] = n;
        }
        const { error } = await sb.from('site_settings')
          .upsert({ key: 'mock_counts', value: counts, updated_at: new Date().toISOString() });
        if (error) throw error;
        await audit(actorTag, 'set_mock_counts', null, { counts });
        return json(200, { ok: true, counts });
      }

      case 'set_expiry': {
        const kind = String(body.kind ?? '');
        const center = normCenter(body.center);
        if (!ownsCenter(center)) return json(403, { ok: false, error: 'forbidden' });
        if (!await canMutate(center)) return json(403, { ok: false, error: 'clone_edit_disabled' });
        const expiry = body.expiry ? new Date(String(body.expiry)).toISOString() : null;
        if (kind === 'vip') {
          const type = String(body.type ?? '');
          const { error } = await sb.from('vip_codes')
            .update({ expires_at: expiry })
            .eq('center', center).eq('type', type);
          if (error) throw error;
        } else if (kind === 'mock') {
          const skill = String(body.skill ?? '').toLowerCase().replace(/-/g, '_');
          const num = parseInt(String(body.mock_number ?? ''), 10);
          const { error } = await sb.from('mock_codes')
            .update({ expires_at: expiry })
            .eq('center', center).eq('skill', skill).eq('mock_number', num);
          if (error) throw error;
        } else {
          return json(400, { ok: false, error: 'bad_kind' });
        }
        await audit(actorTag, 'set_expiry', center, { kind, expiry });
        return json(200, { ok: true, expires_at: expiry });
      }

      default:
        return json(400, { ok: false, error: 'unknown_action' });
    }
  } catch (e) {
    return json(500, { ok: false, error: 'server_error', detail: (e as Error).message });
  }
});
