# Device Registry Phase 1 (Detect-Only) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every device used by a premium account is recorded in a new `device_sessions` registry across all five platform identities — with **zero blocking** and **zero change** to the premium panel or its data.

**Architecture:** New tables `device_sessions` + `device_session_events` fed three ways: a one-way trigger mirrors the web's existing `premium_devices` writes (web client unchanged); mobile and desktop call a new SECURITY DEFINER RPC `register_device_session`; a backfill seeds history. The RPC derives centres server-side from `premium_emails` — clients never claim their own centre. Nothing reads the registry yet (admin menu is phase 2; gating is phase 3).

**Tech Stack:** Supabase Postgres (migrations via MCP `apply_migration`), PostgREST request headers for IP capture, TypeScript in `mockstream-runner` (vitest) and `mockstream-mobile` (no test runner — tsc + manual).

## Global Constraints

- **Scope guard (spec):** only identities with an `active = true` row in `premium_emails` ever create registry rows. Guests, non-premium sign-ins, and daily-activation-code users create **zero** rows.
- **Do not touch** `premium_devices`, `_device_count_for`, `site/auth.js`, or anything under the premium panel. The mirror is one-way: `premium_devices → device_sessions`, never the reverse.
- **Centre normalisation:** live data has both `mock_stream` (73 rows) and `mockstream` (18) plus `''` (2). Canonical id = `mockstream`; `''` → `mockstream`. All writes go through `_norm_center()`.
- Registry tables are **admin-read only** (`is_any_admin()` — existing helper, verified present) — no anon/authenticated SELECT.
- Web repo: docs-only changes this phase (schema reference file) — no `site/` runtime change, so **no sw.js bump and no push needed** beyond riding along.
- Desktop repo rule: validate with `npm run build` (tsc -b — stricter than `--noEmit`).
- Mobile: JS-only change (OTA-able). **Do not OTA or release without Davirbek's go.**
- Live DB facts (verified 2026-08-09): `premium_devices(id, email, device_id, device_info jsonb, created_at, last_seen, hardware_fp)` — **no centre column**, so mirror/backfill join `premium_emails` on `email OR telegram_username` (web stores Telegram identities in the `email` column). `premium_emails(email, tier, center, active, role, expires_at, telegram_username, telegram_id)`.

---

### Task 1: Registry tables + RLS

**Files:**
- Migration: `device_registry_tables` (via MCP `apply_migration`, project `zknyukkbtbcqgvkgjktb`)
- Modify: `site/supabase-schema.sql` (append the same DDL as documentation — the repo's schema record)

**Interfaces:**
- Produces: tables `device_sessions`, `device_session_events`; function `_norm_center(text) returns text`; function `_req_ip() returns inet`. Later tasks insert into these exact columns.

- [ ] **Step 1: Apply the migration**

```sql
-- Canonical centre id. Live premium_emails.center holds both 'mock_stream'
-- and 'mockstream' for the same centre, plus '' on 2 rows.
CREATE OR REPLACE FUNCTION _norm_center(c text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN c IS NULL OR btrim(c) = '' OR lower(c) IN ('mock_stream','mockstream')
      THEN 'mockstream'
    ELSE lower(btrim(c))
  END
$$;

-- Client IP as seen by PostgREST (first hop of x-forwarded-for).
-- Safe: returns NULL outside a PostgREST request or on any parse failure.
CREATE OR REPLACE FUNCTION _req_ip() RETURNS inet
LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN split_part(
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    ',', 1)::inet;
EXCEPTION WHEN OTHERS THEN RETURN NULL;
END $$;

-- One row per (identity, centre, device). Fed by the premium_devices mirror
-- (web) and register_device_session (apps). Detect-only in phase 1:
-- nothing reads this yet, and blocked_at is honoured only from phase 3.
CREATE TABLE IF NOT EXISTS device_sessions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email        text NOT NULL,             -- identity as premium_emails knows it
  center_id    text NOT NULL,             -- ALWAYS _norm_center()'d
  device_key   text NOT NULL,
  platform     text NOT NULL CHECK (platform IN ('web','android','ios','windows','mac')),
  device_label text,
  hardware_fp  text,
  first_seen   timestamptz NOT NULL DEFAULT now(),
  last_seen    timestamptz NOT NULL DEFAULT now(),
  last_ip      inet,
  last_geo     text,                      -- country hint when available
  blocked_at   timestamptz,
  blocked_by   text,
  source       text NOT NULL DEFAULT 'native' CHECK (source IN ('native','mirrored')),
  CONSTRAINT device_sessions_uniq UNIQUE (email, center_id, device_key)
);
CREATE INDEX IF NOT EXISTS idx_device_sessions_email  ON device_sessions (email);
CREATE INDEX IF NOT EXISTS idx_device_sessions_center ON device_sessions (center_id);

-- Append-only observations powering the sharing signals (concurrency,
-- impossible travel, IP spread, velocity). 90-day retention per spec.
CREATE TABLE IF NOT EXISTS device_session_events (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email      text NOT NULL,
  center_id  text NOT NULL,
  device_key text NOT NULL,
  ip         inet,
  country    text,
  at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dse_email_at ON device_session_events (email, at);

ALTER TABLE device_sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_session_events ENABLE ROW LEVEL SECURITY;

-- Admin-read only. All writes go through SECURITY DEFINER paths.
CREATE POLICY dev_sessions_admin_read ON device_sessions
  FOR SELECT USING (is_any_admin());
CREATE POLICY dev_events_admin_read ON device_session_events
  FOR SELECT USING (is_any_admin());
```

- [ ] **Step 2: Verify tables + RLS**

Run via `execute_sql`:
```sql
SELECT _norm_center('mock_stream') AS a, _norm_center('') AS b, _norm_center('Bek') AS c;
-- expect: mockstream | mockstream | bek
SELECT count(*) FROM device_sessions;  -- 0, and no error (service role bypasses RLS)
```
Then confirm anon is locked out — from a shell:
```bash
curl -s "https://zknyukkbtbcqgvkgjktb.supabase.co/rest/v1/device_sessions?select=id" \
  -H "apikey: <anon key from site/auth.js SB_KEY>" -H "Authorization: Bearer <same>"
# Expected: [] (RLS filters everything) — NOT rows, NOT a 5xx
```

- [ ] **Step 3: Append the DDL to `site/supabase-schema.sql` and commit**

```bash
cd "/c/Users/user/Desktop/Mock Stream"
git add site/supabase-schema.sql
git commit -m "Device registry phase 1: device_sessions + events tables (docs record)"
```

---

### Task 2: `register_device_session` RPC

**Files:**
- Migration: `device_registry_rpc`
- Modify: `site/supabase-schema.sql` (append)

**Interfaces:**
- Consumes: `_norm_center`, `_req_ip`, `device_sessions`, `device_session_events` (Task 1)
- Produces: `register_device_session(p_email text, p_telegram text, p_device_key text, p_platform text, p_label text, p_hardware_fp text) returns integer` — the exact signature Tasks 4 and 5 call via PostgREST `/rest/v1/rpc/register_device_session`. Returns number of (centre) rows registered; **0 = identity is not premium** (the scope guard).

- [ ] **Step 1: Apply the migration**

```sql
-- Registers the calling device for EVERY active premium centre of the given
-- identity. Centres are derived server-side from premium_emails -- the client
-- cannot claim a centre it does not have. Returns the number of centre rows
-- touched; 0 means "not premium" and the caller stores nothing.
-- SECURITY DEFINER: callers have no direct write access to the tables.
CREATE OR REPLACE FUNCTION register_device_session(
  p_email text, p_telegram text, p_device_key text,
  p_platform text, p_label text DEFAULT NULL, p_hardware_fp text DEFAULT NULL
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_center text; v_n integer := 0;
  v_ip inet := _req_ip();
  v_geo text;
BEGIN
  IF p_device_key IS NULL OR btrim(p_device_key) = '' THEN RETURN 0; END IF;
  IF p_platform NOT IN ('web','android','ios','windows','mac') THEN RETURN 0; END IF;
  BEGIN
    v_geo := current_setting('request.headers', true)::json->>'cf-ipcountry';
  EXCEPTION WHEN OTHERS THEN v_geo := NULL; END;

  FOR v_center IN
    SELECT DISTINCT _norm_center(center) FROM premium_emails
    WHERE active = true
      AND tier = 'premium'
      AND (expires_at IS NULL OR expires_at > now())
      AND (   (p_email    IS NOT NULL AND btrim(p_email) <> ''
               AND (lower(email) = lower(p_email)
                    OR lower(telegram_username) = lower(p_email)))
           OR (p_telegram IS NOT NULL AND btrim(p_telegram) <> ''
               AND lower(telegram_username) = lower(p_telegram)))
  LOOP
    INSERT INTO device_sessions
      (email, center_id, device_key, platform, device_label, hardware_fp,
       last_ip, last_geo, source)
    VALUES
      (lower(coalesce(nullif(btrim(p_email),''), p_telegram)), v_center,
       p_device_key, p_platform, p_label, p_hardware_fp, v_ip, v_geo, 'native')
    ON CONFLICT (email, center_id, device_key) DO UPDATE SET
      last_seen = now(), last_ip = coalesce(EXCLUDED.last_ip, device_sessions.last_ip),
      last_geo = coalesce(EXCLUDED.last_geo, device_sessions.last_geo),
      device_label = coalesce(EXCLUDED.device_label, device_sessions.device_label),
      hardware_fp = coalesce(EXCLUDED.hardware_fp, device_sessions.hardware_fp);

    INSERT INTO device_session_events (email, center_id, device_key, ip, country)
    VALUES (lower(coalesce(nullif(btrim(p_email),''), p_telegram)), v_center,
            p_device_key, v_ip, v_geo);
    v_n := v_n + 1;
  END LOOP;
  RETURN v_n;
END $$;

GRANT EXECUTE ON FUNCTION register_device_session(text,text,text,text,text,text)
  TO anon, authenticated;
```

- [ ] **Step 2: Test the scope guard and the happy path**

Via `execute_sql` (pick a real active premium email first: `SELECT email, center FROM premium_emails WHERE active AND tier='premium' LIMIT 1;` — call it `<P>`):
```sql
-- Non-premium identity: MUST register nothing
SELECT register_device_session('nobody@example.com', NULL, 'test_dev_1', 'android', 't', NULL);
-- expect 0
SELECT count(*) FROM device_sessions WHERE device_key = 'test_dev_1';   -- 0
-- Premium identity: registers one row per active centre
SELECT register_device_session('<P>', NULL, 'test_dev_1', 'android', 'test device', NULL);
-- expect >= 1
SELECT email, center_id, platform FROM device_sessions WHERE device_key = 'test_dev_1';
SELECT count(*) FROM device_session_events WHERE device_key = 'test_dev_1'; -- >= 1
-- Idempotent: same call again does not add rows
SELECT register_device_session('<P>', NULL, 'test_dev_1', 'android', 'test device', NULL);
SELECT count(*) FROM device_sessions WHERE device_key = 'test_dev_1';   -- unchanged
-- Cleanup
DELETE FROM device_sessions WHERE device_key = 'test_dev_1';
DELETE FROM device_session_events WHERE device_key = 'test_dev_1';
```

- [ ] **Step 3: Append to schema file, commit** (same pattern as Task 1 Step 3, message `Device registry phase 1: register_device_session RPC`)

---

### Task 3: One-way mirror trigger + backfill + regression guard

**Files:**
- Migration: `device_registry_mirror`
- Modify: `site/supabase-schema.sql` (append)

**Interfaces:**
- Consumes: everything from Tasks 1–2
- Produces: trigger `trg_mirror_premium_device` on `premium_devices`; backfilled `device_sessions` rows with `source='mirrored'`, `platform='web'`, `device_key = premium_devices.device_id`

- [ ] **Step 1: Capture the regression baseline**

```sql
SELECT count(*) AS n, max(last_seen) AS latest FROM premium_devices;
```
Record both values — they must be identical after Steps 2–3.

- [ ] **Step 2: Apply the migration**

```sql
-- ONE-WAY mirror: premium_devices -> device_sessions. Never the reverse --
-- writing app devices into premium_devices would push accounts past the
-- legacy >5 web rule and auto-block them (see spec, "The regression this
-- avoids"). The web client keeps writing premium_devices exactly as today.
CREATE OR REPLACE FUNCTION _mirror_premium_device() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_center text; v_ip inet; v_geo text;
BEGIN
  -- Scope guard: mirror ONLY identities premium_emails knows as active
  -- premium. premium_devices also collects non-premium rows (admin-DM
  -- registration in auth.js) -- those must not enter the registry.
  v_ip := _req_ip();
  BEGIN
    v_geo := current_setting('request.headers', true)::json->>'cf-ipcountry';
  EXCEPTION WHEN OTHERS THEN v_geo := NULL; END;

  FOR v_center IN
    SELECT DISTINCT _norm_center(center) FROM premium_emails
    WHERE active = true AND tier = 'premium'
      AND (expires_at IS NULL OR expires_at > now())
      AND (lower(email) = lower(NEW.email)
           OR lower(telegram_username) = lower(NEW.email))
  LOOP
    INSERT INTO device_sessions
      (email, center_id, device_key, platform, device_label, hardware_fp,
       last_ip, last_geo, source, first_seen, last_seen)
    VALUES
      (lower(NEW.email), v_center, NEW.device_id, 'web',
       nullif(concat_ws(' · ', NEW.device_info->>'model', NEW.device_info->>'os'), ''),
       NEW.hardware_fp, v_ip, v_geo, 'mirrored', NEW.created_at, NEW.last_seen)
    ON CONFLICT (email, center_id, device_key) DO UPDATE SET
      last_seen   = greatest(device_sessions.last_seen, EXCLUDED.last_seen),
      last_ip     = coalesce(EXCLUDED.last_ip, device_sessions.last_ip),
      last_geo    = coalesce(EXCLUDED.last_geo, device_sessions.last_geo),
      hardware_fp = coalesce(EXCLUDED.hardware_fp, device_sessions.hardware_fp);

    -- Event row only on first sight or a >10 min gap: auth.js upserts
    -- last_seen on every premium check, and per-check events would bloat
    -- the 90-day signal table for zero extra signal.
    IF TG_OP = 'INSERT'
       OR OLD.last_seen IS NULL
       OR NEW.last_seen > OLD.last_seen + interval '10 minutes' THEN
      INSERT INTO device_session_events (email, center_id, device_key, ip, country)
      VALUES (lower(NEW.email), v_center, NEW.device_id, v_ip, v_geo);
    END IF;
  END LOOP;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_mirror_premium_device ON premium_devices;
CREATE TRIGGER trg_mirror_premium_device
  AFTER INSERT OR UPDATE ON premium_devices
  FOR EACH ROW EXECUTE FUNCTION _mirror_premium_device();

-- Backfill: seed the registry from existing web history so the phase-2
-- flagged list has real data on day one.
INSERT INTO device_sessions
  (email, center_id, device_key, platform, device_label, hardware_fp,
   source, first_seen, last_seen)
SELECT DISTINCT ON (lower(pd.email), _norm_center(pe.center), pd.device_id)
  lower(pd.email), _norm_center(pe.center), pd.device_id, 'web',
  nullif(concat_ws(' · ', pd.device_info->>'model', pd.device_info->>'os'), ''),
  pd.hardware_fp, 'mirrored', pd.created_at, pd.last_seen
FROM premium_devices pd
JOIN premium_emails pe
  ON pe.active = true AND pe.tier = 'premium'
 AND (pe.expires_at IS NULL OR pe.expires_at > now())
 AND (lower(pe.email) = lower(pd.email)
      OR lower(pe.telegram_username) = lower(pd.email))
ON CONFLICT (email, center_id, device_key) DO NOTHING;
```

- [ ] **Step 3: Verify mirror + regression guard**

```sql
-- Backfill landed:
SELECT count(*) AS mirrored FROM device_sessions WHERE source = 'mirrored';  -- > 0
-- Every registry row belongs to an active premium identity (scope guard):
SELECT count(*) FROM device_sessions ds
WHERE NOT EXISTS (
  SELECT 1 FROM premium_emails pe
  WHERE pe.active AND pe.tier = 'premium'
    AND (lower(pe.email) = ds.email OR lower(pe.telegram_username) = ds.email));
-- expect 0
-- REGRESSION GUARD -- must equal the Step 1 baseline exactly:
SELECT count(*) AS n, max(last_seen) AS latest FROM premium_devices;
-- Live trigger check: touch one premium row's last_seen (harmless), then
-- confirm the mirrored row's last_seen advanced. Use a device of <P>:
UPDATE premium_devices SET last_seen = now()
WHERE lower(email) = lower('<P>') AND device_id =
  (SELECT device_id FROM premium_devices WHERE lower(email)=lower('<P>') LIMIT 1);
SELECT last_seen FROM device_sessions WHERE email = lower('<P>') AND platform='web';
```

- [ ] **Step 4: Append to schema file, commit** (message `Device registry phase 1: one-way premium_devices mirror + backfill`)

---

### Task 4: Desktop registration (`mockstream-runner`)

**Files:**
- Create: `src/lib/deviceRegistry.ts`
- Create: `src/lib/deviceRegistry.test.ts`
- Modify: `src/lib/accountPremium.ts` (one call at the point premium resolves as granted)

**Interfaces:**
- Consumes: RPC `register_device_session` (Task 2 signature, via PostgREST); existing `getDeviceId()` from `src/platform/deviceId`; the runner's Supabase URL/key constants (same source `accountPremium.ts` already imports)
- Produces: `maybeRegisterDevice(identity: { email?: string | null; telegramUsername?: string | null }): void` — fire-and-forget, self-throttled

- [ ] **Step 1: Write the failing test**

`src/lib/deviceRegistry.test.ts` — the throttle and platform detection are the only pure logic; test those, not the network:

```ts
import { describe, expect, it } from 'vitest'
import { detectPlatform, shouldRegister } from './deviceRegistry'

describe('deviceRegistry', () => {
  it('throttles to one registration per identity+device per 24h', () => {
    const now = Date.now()
    expect(shouldRegister(null, now)).toBe(true)                       // never sent
    expect(shouldRegister(now - 23 * 3600e3, now)).toBe(false)         // 23h ago
    expect(shouldRegister(now - 25 * 3600e3, now)).toBe(true)          // 25h ago
    expect(shouldRegister(NaN, now)).toBe(true)                        // corrupt stamp
  })

  it('detects desktop platform from the bridge + UA, web otherwise', () => {
    expect(detectPlatform(true, 'Mozilla/5.0 (Macintosh; Intel Mac OS X)')).toBe('mac')
    expect(detectPlatform(true, 'Mozilla/5.0 (Windows NT 10.0; Win64)')).toBe('windows')
    expect(detectPlatform(false, 'Mozilla/5.0 (Windows NT 10.0; Win64)')).toBe('web')
  })
})
```

- [ ] **Step 2: Run it — must fail with "module not found"**

`cd "/c/Users/user/Desktop/Mock Stream Mega/mockstream-runner" && npx vitest run src/lib/deviceRegistry.test.ts`

- [ ] **Step 3: Implement `src/lib/deviceRegistry.ts`**

```ts
// Detect-only device registration (spec 2026-08-09, phase 1).
// Fire-and-forget: a failure here must NEVER affect sign-in or premium.
// The RPC derives centres server-side and returns 0 for non-premium
// identities, so calling it for a non-premium user stores nothing --
// but we still only call it when accountPremium has already granted.
import { getDeviceId } from '../platform/deviceId'

const STAMP_PREFIX = 'ms_devreg_'
const DAY_MS = 24 * 3600 * 1000

/** Exported for tests. True when no valid stamp newer than 24h exists. */
export function shouldRegister(lastMs: number | null, nowMs: number): boolean {
  return !(typeof lastMs === 'number' && isFinite(lastMs) && nowMs - lastMs < DAY_MS)
}

/** Exported for tests. The desktop shell always sets window.desktop. */
export function detectPlatform(hasBridge: boolean, ua: string): 'windows' | 'mac' | 'web' {
  if (!hasBridge) return 'web'
  return /mac/i.test(ua) ? 'mac' : 'windows'
}

export function maybeRegisterDevice(identity: {
  email?: string | null
  telegramUsername?: string | null
}): void {
  void (async () => {
    try {
      const id = (identity.email || identity.telegramUsername || '').trim()
      if (!id) return
      const key = STAMP_PREFIX + id.toLowerCase()
      const last = Number(localStorage.getItem(key))
      if (!shouldRegister(isFinite(last) && last > 0 ? last : null, Date.now())) return

      const deviceKey = await getDeviceId()
      if (!deviceKey) return
      const hasBridge = typeof (window as { desktop?: unknown }).desktop !== 'undefined'
      const platform = detectPlatform(hasBridge, navigator.userAgent)
      const label = platform === 'web' ? 'Desktop runner (browser)'
        : platform === 'mac' ? 'Desktop app (Mac)' : 'Desktop app (Windows)'

      // Same constants accountPremium.ts uses -- adjust the import to match
      // that file's actual source of SUPABASE_URL / SUPABASE_ANON_KEY.
      const { SUPABASE_URL, SUPABASE_ANON_KEY } = await import('../config/constants')
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/register_device_session`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_email: identity.email ?? null,
          p_telegram: identity.telegramUsername ?? null,
          p_device_key: deviceKey,
          p_platform: platform,
          p_label: label,
          p_hardware_fp: null,
        }),
      })
      if (res.ok) localStorage.setItem(key, String(Date.now()))
    } catch {
      /* detect-only: never surface */
    }
  })()
}
```

**Note to implementer:** before writing the import line, open `src/lib/accountPremium.ts` and copy however IT reaches the Supabase URL + anon key (config module or client instance). If the runner uses a shared supabase-js client, prefer `supabase.rpc('register_device_session', {...})` over raw fetch — same arguments, same throttle.

- [ ] **Step 4: Call it where premium resolves as granted**

In `src/lib/accountPremium.ts`, at the point the fetched `premium_emails` rows yield an active granting row (mirror the mobile file's `grants()` structure), add — **after** the grant decision, never on the error path:

```ts
import { maybeRegisterDevice } from './deviceRegistry'
// ...at the point a granting row exists:
maybeRegisterDevice({ email: signInEmail, telegramUsername: tgUsername })
```

Use the identity variables that file already holds (the same values it matched `premium_emails` against).

- [ ] **Step 5: Test + build**

```bash
npx vitest run src/lib/deviceRegistry.test.ts   # PASS
npm run build                                    # tsc -b + vite, must pass
```

- [ ] **Step 6: Manual localhost check** — `npm run dev`, sign in with a premium account, then via `execute_sql`: a `device_sessions` row with `platform='web'` (browser run has no bridge) and `source='native'` exists for that email. Then clean up that test row.

- [ ] **Step 7: Commit**

```bash
git add src/lib/deviceRegistry.ts src/lib/deviceRegistry.test.ts src/lib/accountPremium.ts
git commit -m "Device registry phase 1: detect-only registration on premium grant"
```

**Ship note:** rides the next desktop release (do NOT cut one for this — Davirbek decides when).

---

### Task 5: Mobile registration (`mockstream-mobile`)

**Files:**
- Create: `src/lib/deviceRegistry.ts`
- Modify: `src/lib/accountPremium.ts` (call at grant point, ~line 80 where `grants()` finds a row)

**Interfaces:**
- Consumes: RPC `register_device_session`; existing `supabase` client from `@/lib/supabase`; device id logic per `src/lib/access.ts:50-51` (`Application.getAndroidId()` / `Application.getIosIdForVendorAsync()`); AsyncStorage for the throttle stamp
- Produces: `maybeRegisterDevice(identity: { email?: string | null; telegramUsername?: string | null }): void` — same contract as desktop

- [ ] **Step 1: Implement `src/lib/deviceRegistry.ts`**

```ts
// Detect-only device registration (spec 2026-08-09, phase 1).
// Fire-and-forget; a failure must never affect sign-in or premium.
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

const STAMP_PREFIX = 'ms_devreg_';
const DAY_MS = 24 * 3600 * 1000;

async function deviceKey(): Promise<string> {
  // Same id source access.ts uses for free-attempt tracking.
  if (Platform.OS === 'android') return Application.getAndroidId() || '';
  return (await Application.getIosIdForVendorAsync()) || '';
}

export function maybeRegisterDevice(identity: {
  email?: string | null;
  telegramUsername?: string | null;
}): void {
  void (async () => {
    try {
      const id = (identity.email || identity.telegramUsername || '').trim();
      if (!id) return;
      const key = STAMP_PREFIX + id.toLowerCase();
      const last = Number((await AsyncStorage.getItem(key)) || 0);
      if (isFinite(last) && last > 0 && Date.now() - last < DAY_MS) return;

      const dk = await deviceKey();
      if (!dk) return;
      const { error } = await supabase.rpc('register_device_session', {
        p_email: identity.email ?? null,
        p_telegram: identity.telegramUsername ?? null,
        p_device_key: dk,
        p_platform: Platform.OS === 'ios' ? 'ios' : 'android',
        p_label: Platform.OS === 'ios' ? 'iPhone/iPad app' : 'Android app',
        p_hardware_fp: null,
      });
      if (!error) await AsyncStorage.setItem(key, String(Date.now()));
    } catch {
      /* detect-only: never surface */
    }
  })();
}
```

(If the repo's supabase client lives at a different import path, copy the import `accountPremium.ts` itself uses.)

- [ ] **Step 2: Call it at the grant point**

In `src/lib/accountPremium.ts`, after the `grants()` scan finds an active granting row (NOT in the catch/offline path — a cached offline grant must not mint registrations with stale identity), add:

```ts
import { maybeRegisterDevice } from '@/lib/deviceRegistry';
// ...where a granting row was found:
maybeRegisterDevice({ email, telegramUsername });
```

using the identity variables that function already built its `clauses` from.

- [ ] **Step 3: Typecheck** — `cd "/c/Users/user/Desktop/mockstream-mobile" && npx tsc --noEmit` (no test runner in this repo)

- [ ] **Step 4: Manual check** — run the dev client (or Expo Go) with a premium account; confirm via `execute_sql` an `android`/`ios` row appears in `device_sessions`; clean up the row.

- [ ] **Step 5: Commit**

```bash
git add src/lib/deviceRegistry.ts src/lib/accountPremium.ts
git commit -m "Device registry phase 1: detect-only registration on premium grant"
```

**Ship note:** OTA-able JS, but **ask Davirbek before OTA** (all-centre rule: OTA Mock Stream production + each clone twice — Android `preview`, iOS `production`).

---

### Task 6: End-to-end scope verification + docs

**Files:**
- Modify: `docs/superpowers/specs/2026-08-09-device-limit-enforcement-design.md` (mark phase 1 done)
- Memory: update per memory-system rules at session level (not part of this repo)

- [ ] **Step 1: Run the full verification battery** (via `execute_sql`)

```sql
-- 1. Regression: premium_devices untouched vs Task 3 baseline
SELECT count(*), max(last_seen) FROM premium_devices;
-- 2. Scope: zero registry rows without an active premium identity
SELECT count(*) FROM device_sessions ds
WHERE NOT EXISTS (
  SELECT 1 FROM premium_emails pe WHERE pe.active AND pe.tier='premium'
    AND (lower(pe.email) = ds.email OR lower(pe.telegram_username) = ds.email));
-- 3. Centre hygiene: every center_id already normalised
SELECT count(*) FROM device_sessions WHERE center_id <> _norm_center(center_id);
-- 4. Platform census (expect web-heavy from backfill; apps appear as they ship)
SELECT platform, source, count(*) FROM device_sessions GROUP BY 1, 2 ORDER BY 3 DESC;
```
Expected: (1) equals baseline, (2) `0`, (3) `0`.

- [ ] **Step 2: Confirm `_device_count_for` still behaves** — run it for 3 real premium emails; values must match a direct `SELECT count(DISTINCT coalesce(hardware_fp, device_id)) FROM premium_devices WHERE ...` for the same emails (its historic definition — we changed nothing, this proves it).

- [ ] **Step 3: Mark phase 1 complete in the spec status line; commit both repos' outstanding docs.**

---

## Self-review notes (already applied)

- Spec coverage: table ✓ (T1), mirror one-way ✓ (T3), backfill ✓ (T3), all-platform registration ✓ (T3 web via mirror, T4 desktop, T5 mobile), scope guard ✓ (RPC + trigger both filter on active premium; verified in T2/T3/T6), detect-only ✓ (nothing reads registry; no client behaviour change), IP/geo for future signals ✓ (events table). Signals themselves + admin menu = phase 2 by design.
- The web client is deliberately untouched — the mirror covers it. Any temptation to "also call the RPC from auth.js" is wrong: double registration paths for one platform.
- `register_device_session` takes identity from the caller, not the JWT — the spoof ceiling is "add devices to someone's registry" in a detect-only phase; phase 3's gate binds identity properly. Accepted for phase 1, noted for phase 3.
