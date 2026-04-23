// =====================================================================
// Supabase Edge Function: admin-ips
// ---------------------------------------------------------------------
// Admin-only API for managing the IP blocklist and reviewing suspicious
// activity. Gated by the caller's Supabase Auth JWT — the email on the
// JWT must be in premium_emails with role='admin' AND active=true AND
// no center (super_admin). Per-center admins are NOT allowed to touch
// blocking; this is a global control.
//
// Endpoints (all require Authorization: Bearer <admin-jwt>):
//   GET  /admin-ips?view=blocked       → list blocked IPs
//   GET  /admin-ips?view=suspicious    → last 24h aggregate per IP
//   GET  /admin-ips?view=log&limit=100 → recent raw log entries (failures first)
//   GET  /admin-ips?view=config        → { enforce, threshold, window_minutes }
//   POST /admin-ips  body={ip,reason}  → block IP
//   POST /admin-ips  body={config:{…}} → update autoblock config
//   DELETE /admin-ips?ip=x.x.x.x       → unblock IP
//
// Deploy:
//   supabase functions deploy admin-ips --no-verify-jwt
// (We verify the JWT manually so we can return JSON errors.)
// =====================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY         = Deno.env.get('SUPABASE_ANON_KEY')!;

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}

// Validate bearer JWT → return admin email or null.
async function adminEmail(req: Request): Promise<string | null> {
  const auth = req.headers.get('authorization') || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const token = m[1];

  // Ask Supabase auth for the user behind this JWT.
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  const { data, error } = await userClient.auth.getUser();
  if (error || !data?.user?.email) return null;
  const email = String(data.user.email).toLowerCase();

  // Must be active admin with no center (super_admin / global).
  const { data: row } = await sb
    .from('premium_emails')
    .select('active, role, center')
    .eq('email', email)
    .maybeSingle();
  if (!row) return null;
  if (!row.active || row.role !== 'admin') return null;
  if (row.center && String(row.center).trim() !== '') return null; // per-center admins cannot manage IPs
  return email;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS });
  }

  const who = await adminEmail(req);
  if (!who) return json(401, { error: 'admin_required' });

  const url  = new URL(req.url);
  const view = (url.searchParams.get('view') || '').toLowerCase();

  // ----------------- GET: list blocked ------------------------------
  if (req.method === 'GET' && view === 'blocked') {
    const { data, error } = await sb
      .from('blocked_ips')
      .select('ip, reason, created_at')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) return json(500, { error: error.message });
    return json(200, { ok: true, items: data || [] });
  }

  // ----------------- GET: suspicious aggregate ----------------------
  if (req.method === 'GET' && view === 'suspicious') {
    const { data, error } = await sb
      .from('v_suspicious_ips')
      .select('*')
      .limit(500);
    if (error) return json(500, { error: error.message });
    return json(200, { ok: true, items: data || [] });
  }

  // ----------------- GET: raw log -----------------------------------
  if (req.method === 'GET' && view === 'log') {
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10) || 100, 500);
    const onlyFailures = (url.searchParams.get('failures') || '').toLowerCase() === '1';
    let q = sb.from('ai_submission_logs')
      .select('id, created_at, ip, center_id, student_name, provider, skill, status, error_message, user_agent')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (onlyFailures) q = q.neq('status', 'ok');
    const { data, error } = await q;
    if (error) return json(500, { error: error.message });
    return json(200, { ok: true, items: data || [] });
  }

  // ----------------- GET: config ------------------------------------
  if (req.method === 'GET' && view === 'config') {
    const { data } = await sb
      .from('site_settings')
      .select('value')
      .eq('key', 'ip_autoblock_config')
      .maybeSingle();
    let v: Record<string, unknown> = { enforce: false, threshold: 5, window_minutes: 60 };
    if (data && data.value) {
      try { v = typeof data.value === 'string' ? JSON.parse(data.value) : data.value; }
      catch { /* keep default */ }
    }
    return json(200, { ok: true, config: v });
  }

  // ----------------- POST: block IP or update config ----------------
  if (req.method === 'POST') {
    let body: Record<string, unknown> = {};
    try { body = await req.json(); } catch { /* empty ok */ }

    if (body.config && typeof body.config === 'object') {
      const cfg = body.config as Record<string, unknown>;
      const enforce       = !!cfg.enforce;
      const threshold     = Math.max(2, Math.min(100, parseInt(String(cfg.threshold || '5'), 10) || 5));
      const window_minutes= Math.max(5, Math.min(1440, parseInt(String(cfg.window_minutes || '60'), 10) || 60));
      const { error } = await sb.from('site_settings')
        .upsert({ key: 'ip_autoblock_config', value: { enforce, threshold, window_minutes } }, { onConflict: 'key' });
      if (error) return json(500, { error: error.message });
      return json(200, { ok: true, config: { enforce, threshold, window_minutes } });
    }

    const ip     = typeof body.ip     === 'string' ? body.ip.trim()     : '';
    const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
    if (!ip) return json(400, { error: 'ip_required' });

    const { error } = await sb.from('blocked_ips')
      .upsert({ ip, reason: reason || `manual by ${who}` }, { onConflict: 'ip' });
    if (error) return json(500, { error: error.message });
    return json(200, { ok: true, ip, reason });
  }

  // ----------------- DELETE: unblock --------------------------------
  if (req.method === 'DELETE') {
    const ip = (url.searchParams.get('ip') || '').trim();
    if (!ip) return json(400, { error: 'ip_required' });
    const { error } = await sb.from('blocked_ips').delete().eq('ip', ip);
    if (error) return json(500, { error: error.message });
    return json(200, { ok: true, ip });
  }

  return json(404, { error: 'unknown_route' });
});
