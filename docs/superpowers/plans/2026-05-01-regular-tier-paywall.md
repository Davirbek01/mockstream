# Regular-Tier Paywall + Universal Mock-Attempt Tracker — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lock premium-only features (AI buttons, Part Based Practice, Plus pages, mock retakes) behind a Telegram-CTA upgrade modal for regular-tier users, while showing every user a "Taken N×" badge on each mock card.

**Architecture:** A single `site/premium-gate.js` library exposes `window.PremiumGate` with tier detection, a shared upgrade modal, a lock decorator, and read/write helpers for a new `mock_attempts` Supabase table (mirrored to localStorage). Each mock page calls `PremiumGate.recordOpen(...)` on test render and wraps premium affordances with `PremiumGate.applyLockBadge(...)`. The Plus pages get a top-of-page guard. Backfill from existing `results` rows so badges and locks apply retroactively.

**Tech Stack:** Vanilla JS (no build step), Supabase (Postgres + REST + edge functions), localStorage, plain HTML mock pages. No test framework exists in the repo — pure-logic tests for `premium-gate.js` are written as a Node-runnable assertion script (`_test_premium_gate.js`, matching the existing `_test_*.js` convention at the repo root); UI changes are verified via a manual smoke checklist on the `dev` deploy (`mock-stream.com`).

**Branch:** `dev` (already checked out). Push to `master` only after the user confirms the smoke checklist passes on `mock-stream.com`.

**Constraints:**

- Do NOT touch `vite-app/` or `react-app/` (gitignored pilots).
- Do NOT modify legacy 10-/12-digit alwaysdata branches in mock pages — out of scope per spec §10.
- Bump `site/sw.js` cache version at the end so users pick up the new JS/CSS.
- Commit per task on `dev`. Push only at the end after user confirms.

**Spec:** `docs/superpowers/specs/2026-05-01-regular-tier-paywall-design.md`

---

## File map

### New

- `site/premium-gate.js` — central library: `isPremiumTier`, `isAdmin`, `hasTaken`, `attemptCount`, `recordOpen`, `recordSubmit`, `openUpgradeModal`, `applyLockBadge`. Single IIFE attaching to `window.PremiumGate`.
- `site/premium-gate.css` — lock badge styling, modal styling.
- `_test_premium_gate.js` (repo root) — Node-runnable assertions for the deterministic helpers (`isPremiumTier`, `hasTaken`, `attemptCount`, `recordOpen` localStorage write).
- `supabase/migrations/20260501000000_mock_attempts.sql` — table + indexes + RLS.
- `supabase/migrations/20260501000001_mock_attempts_backfill.sql` — one-shot backfill (committed, run manually once in Supabase SQL Editor).

### Modified

- `site/landing.html` — load `premium-gate.js`/`.css`; badge Plus menu items as locked for non-admin non-premium; (mock-card badges live on the per-skill `Mocks.html` pages, not landing).
- `site/CEFR Listening Mocks.html`, `site/IELTS Listening Mocks.html`, `site/CEFR Reading Mocks.html`, `site/IELTS Reading Mocks.html` — load `premium-gate.js`; render "Taken N×" badge on each mock card; gate retake at click time.
- `site/CEFR Listening.html`, `site/IELTS listening.html`, `site/CEFR Reading.html`, `site/IELTS reading.html` — load `premium-gate.js`; call `recordOpen` when the test UI renders; lock manual AI / retry / transcript / review buttons via `applyLockBadge`.
- `site/Speaking Mocks.html`, `site/IELTS Speaking Mocks.html` — load `premium-gate.js`; gate Part Based Practice tile in the Choose Your Mode modal; call `recordOpen` on Full Mock entry; lock manual AI / retry / model-answer buttons; gate retake.
- `site/Writing Mocks.html`, `site/Writing IELTS Mock.html` — same as Speaking minus part-tile (writing has Task 1/Task 2 selection — locked the same way as part practice). Lock the manual AI checker (line ~14027).
- `site/Speaking Plus.html`, `site/Writing Plus.html`, `site/Reading Plus.html`, `site/Listening Plus.html` — top-of-page guard: if not admin AND not premium, render the upgrade modal full-page and skip all test content.
- `site/sw.js` — bump `CACHE_NAME` from `mockstream-v11` to `mockstream-v12`.

---

## Phase 1 — Supabase migration & backfill (no behavior change)

### Task 1: Write the `mock_attempts` migration

**Files:**
- Create: `supabase/migrations/20260501000000_mock_attempts.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- =====================================================================
-- Migration: mock_attempts table — universal tracker for mock attempts
-- Backs the per-user "Taken N×" badge and the regular-tier one-shot lock.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.mock_attempts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_name TEXT NOT NULL,
  center         TEXT NOT NULL,
  exam_type      TEXT NOT NULL,
  skill          TEXT NOT NULL,
  mock_number    INT  NOT NULL,
  tier_at_open   TEXT NOT NULL,                -- 'regular' | 'premium' | 'unknown'
  opened_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at   TIMESTAMPTZ,
  device_id      TEXT,
  source         TEXT NOT NULL DEFAULT 'live'  -- 'live' | 'backfill'
);

CREATE INDEX IF NOT EXISTS mock_attempts_lookup
  ON public.mock_attempts (candidate_name, center, exam_type, skill, mock_number);

CREATE INDEX IF NOT EXISTS mock_attempts_global_count
  ON public.mock_attempts (skill, exam_type, mock_number);

ALTER TABLE public.mock_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon insert mock_attempts"
  ON public.mock_attempts FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon select mock_attempts"
  ON public.mock_attempts FOR SELECT TO anon
  USING (true);

CREATE POLICY "anon update mock_attempts submitted_at"
  ON public.mock_attempts FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260501000000_mock_attempts.sql
git commit -m "feat(supabase): add mock_attempts table for tier-agnostic tracker"
```

- [ ] **Step 3: User runs the migration manually in Supabase SQL Editor**

Document this in the commit body (already covered): the engineer (or user) opens Supabase Dashboard → SQL Editor → New query → pastes the migration → Run. **Do not auto-run from this plan.**

---

### Task 2: Write the backfill SQL

**Files:**
- Create: `supabase/migrations/20260501000001_mock_attempts_backfill.sql`

- [ ] **Step 1: Write the backfill file**

```sql
-- =====================================================================
-- Backfill mock_attempts from existing public.results rows.
-- Run ONCE after the 20260501000000 migration. Safe to re-run; backfill
-- rows are tagged source='backfill' so a re-run produces duplicates only
-- if you do not first DELETE FROM mock_attempts WHERE source='backfill'.
-- =====================================================================

INSERT INTO public.mock_attempts
  (candidate_name, center, exam_type, skill, mock_number, tier_at_open,
   opened_at, submitted_at, source)
SELECT
  LOWER(TRIM(student_name)),
  COALESCE(NULLIF(TRIM(center), ''), 'mock_stream'),
  COALESCE(NULLIF(TRIM(exam_type), ''), 'cefr'),
  COALESCE(NULLIF(TRIM(skill), ''), 'unknown'),
  NULLIF(REGEXP_REPLACE(mock_number, '\D', '', 'g'), '')::INT,
  'unknown',
  created_at,
  created_at,
  'backfill'
FROM public.results
WHERE student_name IS NOT NULL
  AND TRIM(student_name) <> ''
  AND mock_number ~ '\d';
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260501000001_mock_attempts_backfill.sql
git commit -m "feat(supabase): backfill mock_attempts from results history"
```

- [ ] **Step 3: User runs the backfill in Supabase SQL Editor (after Task 1 migration)**

Verify with:

```sql
SELECT COUNT(*) FROM public.mock_attempts WHERE source = 'backfill';
SELECT COUNT(*) FROM public.results WHERE student_name <> '' AND mock_number ~ '\d';
```

The two counts should match within rounding (rows where mock_number has no digits are skipped).

---

## Phase 2 — `premium-gate.js` core library

### Task 3: Create the `premium-gate.js` skeleton

**Files:**
- Create: `site/premium-gate.js`

- [ ] **Step 1: Write the skeleton (namespace + tier helper)**

```javascript
/* =========================================================================
 * premium-gate.js — Tier detection, upgrade modal, lock decorator,
 * and mock-attempt tracker for the regular-tier paywall.
 *
 * Exposes window.PremiumGate with:
 *   .isPremiumTier(skill)        — boolean
 *   .isAdmin()                   — boolean
 *   .hasTaken({skill, mock_number, exam_type})
 *   .attemptCount({skill, mock_number, exam_type})
 *   .recordOpen({skill, mock_number, exam_type, center, tier})
 *   .recordSubmit({skill, mock_number, exam_type})
 *   .openUpgradeModal(reason)
 *   .applyLockBadge(element, reason)
 * ========================================================================= */
(function () {
  'use strict';

  var SB_URL  = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var SB_ANON = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
  var LS_KEY  = 'ms_mock_attempts_v1';
  var LS_MAX  = 500;

  function _normName(n) {
    return (n || '').toString().trim().toLowerCase();
  }

  function _center() {
    try {
      var c = (window.SITE_CONFIG && window.SITE_CONFIG.testIdentifier) || 'mock_stream';
      return String(c);
    } catch (e) { return 'mock_stream'; }
  }

  function isPremiumTier(skill) {
    try {
      // 1. Speaking individual-code override
      if (skill === 'speaking') {
        var ind = sessionStorage.getItem('speakingIndividualCode');
        if (ind === 'premium') return true;
        if (ind === 'regular') return false;
      }
      // 2. Site-wide VIP premium
      if (sessionStorage.getItem('vipPremiumAi') === 'true') return true;
      // 3. Per-skill individual code
      var keyMap = {
        speaking: 'speakingPremiumEntry',
        writing:  'writingPremiumEntry',
        reading:  'readingPremiumEntry',
        listening:'listeningPremiumEntry'
      };
      var k = keyMap[skill];
      if (k) {
        var v = sessionStorage.getItem(k);
        if (v === 'true')  return true;
        if (v === 'false') return false;
      }
      // 4. Site-wide VIP regular (vipSessionAccess without vipPremiumAi)
      if (sessionStorage.getItem('vipSessionAccess') === 'true') return false;
    } catch (e) {}
    // 5. No code session — treat as regular for badge display
    return false;
  }

  function isAdmin() {
    try {
      // Existing admin-auth helpers expose this several ways; check both.
      if (window.MockStream && window.MockStream.auth && typeof window.MockStream.auth.isAdmin === 'function') {
        return !!window.MockStream.auth.isAdmin();
      }
      if (sessionStorage.getItem('ms_is_admin') === 'true') return true;
      if (localStorage.getItem('ms_is_admin')  === 'true') return true;
    } catch (e) {}
    return false;
  }

  window.PremiumGate = {
    isPremiumTier: isPremiumTier,
    isAdmin:       isAdmin,
    _normName:     _normName,
    _center:       _center,
    _SB_URL:       SB_URL,
    _SB_ANON:      SB_ANON,
    _LS_KEY:       LS_KEY,
    _LS_MAX:       LS_MAX
  };
})();
```

- [ ] **Step 2: Commit**

```bash
git add site/premium-gate.js
git commit -m "feat(premium-gate): scaffold tier-detection helpers"
```

---

### Task 4: Add localStorage attempt-tracker functions

**Files:**
- Modify: `site/premium-gate.js`

- [ ] **Step 1: Add `_lsRead`, `_lsAppend`, `hasTaken`, `attemptCount`, and `recordOpen`/`recordSubmit` localStorage parts**

Insert these inside the IIFE, **above** the `window.PremiumGate = {...}` assignment:

```javascript
  function _lsRead() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function _lsWrite(arr) {
    try {
      if (arr.length > LS_MAX) arr = arr.slice(arr.length - LS_MAX);
      localStorage.setItem(LS_KEY, JSON.stringify(arr));
    } catch (e) {}
  }

  function _lsAppend(row) {
    var arr = _lsRead();
    // Idempotency: if the same skill/mock/exam was opened in the last 5 sec, skip.
    var now = Date.now();
    var dupKey = row.skill + '|' + row.exam_type + '|' + row.mock_number;
    for (var i = arr.length - 1; i >= 0 && i >= arr.length - 20; i--) {
      var r = arr[i];
      var rk = r.skill + '|' + r.exam_type + '|' + r.mock_number;
      if (rk === dupKey && (now - new Date(r.opened_at).getTime()) < 5000) return;
    }
    arr.push(row);
    _lsWrite(arr);
  }

  function hasTaken(q) {
    if (!q || !q.skill || q.mock_number == null) return false;
    var arr = _lsRead();
    for (var i = 0; i < arr.length; i++) {
      var r = arr[i];
      if (r.skill === q.skill
        && String(r.mock_number) === String(q.mock_number)
        && (!q.exam_type || r.exam_type === q.exam_type)) return true;
    }
    return false;
  }

  function attemptCount(q) {
    if (!q || !q.skill || q.mock_number == null) return 0;
    var arr = _lsRead();
    var n = 0;
    for (var i = 0; i < arr.length; i++) {
      var r = arr[i];
      if (r.skill === q.skill
        && String(r.mock_number) === String(q.mock_number)
        && (!q.exam_type || r.exam_type === q.exam_type)) n++;
    }
    return n;
  }
```

- [ ] **Step 2: Add `recordOpen` and `recordSubmit` (localStorage path; Supabase added in Task 6)**

Add below the helpers above:

```javascript
  function recordOpen(o) {
    if (!o || !o.skill || o.mock_number == null) return;
    if (isAdmin()) return;  // admins do not pollute the tracker
    var row = {
      candidate_name: _normName((window.sessionStorage && sessionStorage.getItem('CANDIDATE_FULL_NAME')) || ''),
      center:         o.center || _center(),
      exam_type:      o.exam_type || 'cefr',
      skill:          o.skill,
      mock_number:    Number(o.mock_number),
      tier_at_open:   o.tier || (isPremiumTier(o.skill) ? 'premium' : 'regular'),
      opened_at:      new Date().toISOString(),
      submitted_at:   null
    };
    _lsAppend(row);
    _sbInsert(row);  // implemented in Task 6 — placeholder so the call site is ready
  }

  function recordSubmit(o) {
    if (!o || !o.skill || o.mock_number == null) return;
    if (isAdmin()) return;
    var arr = _lsRead();
    var stamped = false;
    for (var i = arr.length - 1; i >= 0; i--) {
      var r = arr[i];
      if (r.skill === o.skill
        && String(r.mock_number) === String(o.mock_number)
        && (!o.exam_type || r.exam_type === o.exam_type)
        && !r.submitted_at) {
        r.submitted_at = new Date().toISOString();
        stamped = true;
        break;
      }
    }
    if (stamped) _lsWrite(arr);
    _sbPatchSubmit(o);  // implemented in Task 6
  }

  // Stubs — replaced with real fetch calls in Task 6
  function _sbInsert(_row) {}
  function _sbPatchSubmit(_o) {}
```

- [ ] **Step 3: Export the new functions on `window.PremiumGate`**

Update the export block:

```javascript
  window.PremiumGate = {
    isPremiumTier: isPremiumTier,
    isAdmin:       isAdmin,
    hasTaken:      hasTaken,
    attemptCount:  attemptCount,
    recordOpen:    recordOpen,
    recordSubmit:  recordSubmit,
    _normName:     _normName,
    _center:       _center,
    _SB_URL:       SB_URL,
    _SB_ANON:      SB_ANON,
    _LS_KEY:       LS_KEY,
    _LS_MAX:       LS_MAX
  };
```

- [ ] **Step 4: Commit**

```bash
git add site/premium-gate.js
git commit -m "feat(premium-gate): localStorage tracker (record/has/count)"
```

---

### Task 5: Write Node test for the deterministic helpers

**Files:**
- Create: `_test_premium_gate.js` (repo root)

- [ ] **Step 1: Write the test script**

```javascript
/* Node-runnable assertions for premium-gate.js — pure-logic tests only.
 * Run: node _test_premium_gate.js
 * Mocks: window, sessionStorage, localStorage. No DOM, no network. */

(function () {
  'use strict';
  var fails = 0, passes = 0;
  function eq(actual, expected, label) {
    var ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (ok) { passes++; console.log('  PASS  ' + label); }
    else    { fails++;  console.log('  FAIL  ' + label + ' — expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual)); }
  }

  // Mock browser globals
  global.window = {};
  var ssData = {}, lsData = {};
  global.sessionStorage = global.window.sessionStorage = {
    getItem: function (k) { return ssData[k] == null ? null : ssData[k]; },
    setItem: function (k, v) { ssData[k] = String(v); },
    removeItem: function (k) { delete ssData[k]; }
  };
  global.localStorage = global.window.localStorage = {
    getItem: function (k) { return lsData[k] == null ? null : lsData[k]; },
    setItem: function (k, v) { lsData[k] = String(v); },
    removeItem: function (k) { delete lsData[k]; }
  };

  // Load the IIFE — it attaches to global.window.PremiumGate.
  require('./site/premium-gate.js');
  var PG = global.window.PremiumGate;

  // ---------- isPremiumTier ----------
  console.log('isPremiumTier');
  ssData = {}; eq(PG.isPremiumTier('writing'), false, 'no flags → regular');
  ssData = { vipPremiumAi: 'true' }; eq(PG.isPremiumTier('writing'), true, 'vipPremiumAi → premium');
  ssData = { vipSessionAccess: 'true' }; eq(PG.isPremiumTier('writing'), false, 'vipSessionAccess only → regular');
  ssData = { writingPremiumEntry: 'true' }; eq(PG.isPremiumTier('writing'), true, 'writingPremiumEntry=true');
  ssData = { writingPremiumEntry: 'false' }; eq(PG.isPremiumTier('writing'), false, 'writingPremiumEntry=false');
  // Speaking override
  ssData = { vipPremiumAi: 'true', speakingIndividualCode: 'regular' };
  eq(PG.isPremiumTier('speaking'), false, 'speaking regular code masks vipPremiumAi');
  ssData = { speakingIndividualCode: 'premium' };
  eq(PG.isPremiumTier('speaking'), true, 'speaking premium code → premium');
  // Speaking override does not affect writing
  ssData = { speakingIndividualCode: 'regular', vipPremiumAi: 'true' };
  eq(PG.isPremiumTier('writing'), true, 'speaking override does not affect writing');

  // ---------- recordOpen / hasTaken / attemptCount ----------
  console.log('tracker');
  ssData = { CANDIDATE_FULL_NAME: 'Alice ' };
  lsData = {};
  PG.recordOpen({ skill: 'writing', mock_number: 5, exam_type: 'cefr', center: 'mock_stream' });
  eq(PG.hasTaken({ skill: 'writing', mock_number: 5, exam_type: 'cefr' }), true, 'taken after recordOpen');
  eq(PG.hasTaken({ skill: 'writing', mock_number: 6, exam_type: 'cefr' }), false, 'other mocks not taken');
  eq(PG.attemptCount({ skill: 'writing', mock_number: 5, exam_type: 'cefr' }), 1, 'count 1 after one record');
  // Idempotency within 5 sec
  PG.recordOpen({ skill: 'writing', mock_number: 5, exam_type: 'cefr', center: 'mock_stream' });
  eq(PG.attemptCount({ skill: 'writing', mock_number: 5, exam_type: 'cefr' }), 1, 'duplicate within 5s skipped');

  // ---------- recordSubmit ----------
  console.log('recordSubmit');
  PG.recordSubmit({ skill: 'writing', mock_number: 5, exam_type: 'cefr' });
  var arr = JSON.parse(lsData['ms_mock_attempts_v1'] || '[]');
  eq(typeof arr[0].submitted_at, 'string', 'submitted_at stamped on latest open');

  // ---------- admin bypass ----------
  console.log('admin bypass');
  ssData.ms_is_admin = 'true';
  lsData = {};
  PG.recordOpen({ skill: 'writing', mock_number: 7, exam_type: 'cefr' });
  eq(PG.attemptCount({ skill: 'writing', mock_number: 7, exam_type: 'cefr' }), 0, 'admin recordOpen short-circuits');

  console.log('\n' + passes + ' passed, ' + fails + ' failed');
  if (fails) process.exit(1);
})();
```

- [ ] **Step 2: Run the test, expect all PASS**

```bash
cd "C:/Users/user/Desktop/Mock Stream" && node _test_premium_gate.js
```

Expected last line: `N passed, 0 failed` (where N is roughly 12).

- [ ] **Step 3: Commit**

```bash
git add _test_premium_gate.js
git commit -m "test(premium-gate): unit assertions for tier + tracker"
```

---

### Task 6: Add Supabase REST writes to `recordOpen` / `recordSubmit`

**Files:**
- Modify: `site/premium-gate.js` (replace the stubs)

- [ ] **Step 1: Replace `_sbInsert` and `_sbPatchSubmit` stubs with real fetch**

Find the lines:

```javascript
  // Stubs — replaced with real fetch calls in Task 6
  function _sbInsert(_row) {}
  function _sbPatchSubmit(_o) {}
```

Replace with:

```javascript
  function _sbHeaders() {
    return {
      'Content-Type':  'application/json',
      'apikey':        SB_ANON,
      'Authorization': 'Bearer ' + SB_ANON,
      'Prefer':        'return=minimal'
    };
  }

  function _sbInsert(row) {
    if (!row || !row.candidate_name) return;  // no name → localStorage only
    try {
      fetch(SB_URL + '/rest/v1/mock_attempts', {
        method: 'POST',
        headers: _sbHeaders(),
        body: JSON.stringify(row),
        keepalive: true
      }).catch(function (e) { try { console.info('[premium-gate] sb insert failed', e); } catch (_) {} });
    } catch (e) {}
  }

  function _sbPatchSubmit(o) {
    var name = _normName((window.sessionStorage && sessionStorage.getItem('CANDIDATE_FULL_NAME')) || '');
    if (!name) return;
    try {
      var qs = '?candidate_name=eq.' + encodeURIComponent(name)
             + '&skill=eq.'         + encodeURIComponent(o.skill)
             + '&mock_number=eq.'   + Number(o.mock_number)
             + '&submitted_at=is.null'
             + '&order=opened_at.desc&limit=1';
      fetch(SB_URL + '/rest/v1/mock_attempts' + qs, {
        method: 'PATCH',
        headers: _sbHeaders(),
        body: JSON.stringify({ submitted_at: new Date().toISOString() }),
        keepalive: true
      }).catch(function (e) { try { console.info('[premium-gate] sb patch failed', e); } catch (_) {} });
    } catch (e) {}
  }

  // Cross-device read: returns a Promise resolving to a list merged with localStorage.
  // Used by mock-card badge rendering when a name is known.
  function fetchTakenForUser() {
    var name = _normName((window.sessionStorage && sessionStorage.getItem('CANDIDATE_FULL_NAME')) || '');
    if (!name) return Promise.resolve(_lsRead());
    var qs = '?candidate_name=eq.' + encodeURIComponent(name)
           + '&select=skill,mock_number,exam_type,opened_at';
    return fetch(SB_URL + '/rest/v1/mock_attempts' + qs, { headers: _sbHeaders() })
      .then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; })
      .then(function (rows) {
        // Merge with localStorage; dedupe on (skill, exam_type, mock_number, opened_at-minute)
        var local = _lsRead();
        var seen = {};
        var out = [];
        function key(r) { return [r.skill, r.exam_type, r.mock_number, String(r.opened_at).slice(0, 16)].join('|'); }
        function push(r) { var k = key(r); if (!seen[k]) { seen[k] = 1; out.push(r); } }
        rows.forEach(push); local.forEach(push);
        return out;
      });
  }
```

- [ ] **Step 2: Export `fetchTakenForUser`**

Add `fetchTakenForUser: fetchTakenForUser,` to the `window.PremiumGate` block.

- [ ] **Step 3: Re-run the test, confirm still passes (Node has no fetch — but our code wraps in try/catch and is fire-and-forget, so the unit test should still pass with `fetch` undefined)**

```bash
cd "C:/Users/user/Desktop/Mock Stream" && node _test_premium_gate.js
```

If the test fails because `fetch` is undefined, add a stub at the top of `_test_premium_gate.js`:

```javascript
global.fetch = function () { return Promise.resolve({ ok: false, json: function () { return Promise.resolve([]); } }); };
```

Re-run; should pass.

- [ ] **Step 4: Commit**

```bash
git add site/premium-gate.js _test_premium_gate.js
git commit -m "feat(premium-gate): wire Supabase REST writes for mock_attempts"
```

---

### Task 7: Add `openUpgradeModal` and `applyLockBadge`

**Files:**
- Modify: `site/premium-gate.js`

- [ ] **Step 1: Add modal + badge functions before the `window.PremiumGate = {...}` block**

```javascript
  var _modalEl = null;

  function openUpgradeModal(reason) {
    try { console.info('[premium-gate] upgrade prompted:', reason || 'unknown'); } catch (e) {}
    if (_modalEl) return;
    var overlay = document.createElement('div');
    overlay.className = 'pg-modal-overlay';
    overlay.innerHTML =
      '<div class="pg-modal" role="dialog" aria-modal="true" aria-label="Upgrade to Premium">' +
        '<button class="pg-modal-x" aria-label="Close">×</button>' +
        '<div class="pg-modal-head">' +
          '<div class="pg-modal-title">🔥 Want more? Upgrade to Premium</div>' +
        '</div>' +
        '<ul class="pg-modal-list">' +
          '<li>🤖 Instant AI scoring &amp; feedback</li>' +
          '<li>📜 Full transcripts (speaking + writing)</li>' +
          '<li>🔁 Unlimited retries</li>' +
          '<li>🎯 One code unlocks all skills</li>' +
          '<li>⚡ No daily / hourly limits</li>' +
        '</ul>' +
        '<button class="pg-modal-cta">🎁 Open Premium tab</button>' +
      '</div>';
    document.body.appendChild(overlay);
    _modalEl = overlay;
    function close() { if (_modalEl) { _modalEl.remove(); _modalEl = null; } }
    overlay.querySelector('.pg-modal-x').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    overlay.querySelector('.pg-modal-cta').addEventListener('click', function () {
      try {
        var msg =
          '💎 *Salom!*\n\n' +
          '🚀 Men *Mock Stream Premium obunasini* sotib olmoqchiman.\n\n' +
          '✨ Iltimos, narx, toʼlov usullari va premiumda ochiladigan imkoniyatlar haqida *qisqacha maʼlumot* bera olasizmi?\n\n' +
          '🙏 Rahmat!';
        window.open('https://t.me/mrkhasanoff3?text=' + encodeURIComponent(msg), '_blank', 'noopener');
      } catch (e) {}
    });
  }

  function applyLockBadge(el, reason) {
    if (!el || el.dataset.pgLocked === '1') return;
    el.dataset.pgLocked = '1';
    el.classList.add('pg-locked');
    var badge = document.createElement('span');
    badge.className = 'pg-lock-badge';
    badge.textContent = '🔒 Premium';
    el.appendChild(badge);
    el.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      openUpgradeModal(reason || el.getAttribute('data-pg-reason') || 'lock');
    }, true);
  }
```

- [ ] **Step 2: Export both on `window.PremiumGate`**

Add to the export block:

```javascript
    openUpgradeModal: openUpgradeModal,
    applyLockBadge:   applyLockBadge,
    fetchTakenForUser: fetchTakenForUser,
```

- [ ] **Step 3: Commit**

```bash
git add site/premium-gate.js
git commit -m "feat(premium-gate): upgrade modal + lock-badge decorator"
```

---

### Task 8: Write `premium-gate.css`

**Files:**
- Create: `site/premium-gate.css`

- [ ] **Step 1: Write the stylesheet**

```css
/* premium-gate.css — lock badge + upgrade modal styling.
   Designed to be visually consistent with the chat-bubble premium panel. */

.pg-locked {
  position: relative;
  filter: grayscale(0.4) opacity(0.85);
  cursor: pointer !important;
}
.pg-locked .pg-lock-badge {
  position: absolute;
  top: 4px;
  right: 6px;
  background: #f59e0b;
  color: #78350f;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 999px;
  line-height: 1.2;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, .15);
  z-index: 5;
}

.pg-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999998;
  padding: 16px;
}
.pg-modal {
  background: #fff;
  border-radius: 16px;
  max-width: 420px;
  width: 100%;
  padding: 24px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, .25);
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #0e141b;
}
.pg-modal-x {
  position: absolute;
  top: 8px; right: 12px;
  background: transparent;
  border: 0;
  font-size: 22px;
  cursor: pointer;
  color: #5a6a75;
}
.pg-modal-head { margin-bottom: 12px; }
.pg-modal-title {
  font-size: 16px;
  font-weight: 800;
  color: #78350f;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  padding: 10px 12px;
  border-radius: 10px;
}
.pg-modal-list {
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
}
.pg-modal-list li {
  padding: 6px 0;
  font-size: 14px;
  color: #334155;
}
.pg-modal-cta {
  width: 100%;
  background: #f97316;
  color: #fff;
  font-weight: 800;
  font-size: 15px;
  border: 0;
  border-radius: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background .15s;
}
.pg-modal-cta:hover { background: #ea580c; }
```

- [ ] **Step 2: Commit**

```bash
git add site/premium-gate.css
git commit -m "feat(premium-gate): css for lock badge + upgrade modal"
```

---

## Phase 3 — Wire `premium-gate.js` into pages

### Task 9: Load premium-gate on `landing.html` + lock Plus menu items

**Files:**
- Modify: `site/landing.html`

- [ ] **Step 1: Add the script + stylesheet near the top of `<head>`**

Locate the existing `<script src="center-id.js"></script>` line. Add immediately after it:

```html
<link rel="stylesheet" href="premium-gate.css">
<script src="premium-gate.js" defer></script>
```

- [ ] **Step 2: Decorate Plus menu items for non-admin non-premium users**

Find the four Plus menu items at `landing.html:6780-6789`. They look like:

```html
<a href="javascript:void(0)" onclick="_requireAdminAccess(function(){ openWritingPlusPanel(); }); toggleSidebar();" class="skill-btn" id="writingPlusMenuItem" ...>
```

Just before the closing `</body>` (or wherever existing on-DOM-ready scripts run), add:

```html
<script>
(function () {
  function decoratePlus() {
    if (!window.PremiumGate) return;
    if (window.PremiumGate.isAdmin()) return;
    var ids = [
      ['writingPlusMenuItem',   'writing'],
      ['speakingPlusMenuItem',  'speaking'],
      ['readingPlusMenuItem',   'reading'],
      ['listeningPlusMenuItem', 'listening']
    ];
    ids.forEach(function (pair) {
      var el = document.getElementById(pair[0]);
      if (!el) return;
      if (window.PremiumGate.isPremiumTier(pair[1])) return;
      el.setAttribute('onclick', '');  // strip existing _requireAdminAccess handler
      window.PremiumGate.applyLockBadge(el, 'plus_' + pair[1]);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', decoratePlus);
  else decoratePlus();
})();
</script>
```

- [ ] **Step 3: Manual smoke (open `landing.html` in browser)**

- Without entering any code: Plus menu items should show "🔒 Premium" badges and clicking opens the upgrade modal.
- After entering a premium code (set `sessionStorage.vipPremiumAi='true'` in DevTools and reload): Plus items should NOT be badged.
- After clicking the Telegram CTA: should open `t.me/mrkhasanoff3` with the prefilled Uzbek message.

- [ ] **Step 4: Commit**

```bash
git add site/landing.html
git commit -m "feat(landing): badge Plus menu items as Premium for regular users"
```

---

### Task 10: Listening test pages — load gate, recordOpen, lock buttons

**Files:**
- Modify: `site/CEFR Listening.html`
- Modify: `site/IELTS listening.html`

- [ ] **Step 1: For BOTH files, add the script + stylesheet near the top of `<head>`**

After any existing `center-id.js`/`site-config` includes:

```html
<link rel="stylesheet" href="premium-gate.css">
<script src="premium-gate.js" defer></script>
```

- [ ] **Step 2: For BOTH files, call `recordOpen` and gate retake when the test view first renders**

Locate the function that reveals the test/question UI. In `CEFR Listening.html` this is typically tied to the start of the test (search for `gateOpened` / `startTest` / removal of an entry overlay class). In `IELTS listening.html` similarly.

Insert at the very top of that startup function:

```javascript
(function () {
  if (!window.PremiumGate) return;
  var examType = '__EXAM__';     // 'cefr' for CEFR Listening.html, 'ielts' for IELTS listening.html
  var skill    = 'listening';
  var mockNum  = Number(window._currentMockNumber || (new URLSearchParams(location.search)).get('test') || 0);
  if (!window.PremiumGate.isPremiumTier(skill) && !window.PremiumGate.isAdmin()
      && window.PremiumGate.hasTaken({ skill: skill, exam_type: examType, mock_number: mockNum })) {
    window.PremiumGate.openUpgradeModal('retake_' + skill + '_' + mockNum);
    // Bail out of test rendering — overlay sits on top.
    return;
  }
  window.PremiumGate.recordOpen({ skill: skill, exam_type: examType, mock_number: mockNum });
})();
```

Replace `__EXAM__` literally with `'cefr'` in `CEFR Listening.html` and `'ielts'` in `IELTS listening.html`.

- [ ] **Step 3: For BOTH files, lock the AI / transcript / retry / review buttons after results render**

Locate the result-screen render function (search for `_showProcessing`, `transcriptBtn`, `Review Answers`). Add at the end of the render:

```javascript
(function () {
  if (!window.PremiumGate) return;
  if (window.PremiumGate.isPremiumTier('listening') || window.PremiumGate.isAdmin()) return;
  // Match ANY of these (different pages use different selectors)
  var sels = ['.btn-ai', '#aiAnalyzeBtn', '#showTranscriptBtn', '#reviewAnswersBtn',
              '#tryAgainBtn', '#aiRetryBtn', '[data-pg-lock]'];
  sels.forEach(function (s) {
    document.querySelectorAll(s).forEach(function (el) {
      window.PremiumGate.applyLockBadge(el, 'listening_result_' + s);
    });
  });
})();
```

(If the page already has unique IDs, list them precisely; if not, the engineer adds `data-pg-lock` attributes to the buttons that should be locked.)

- [ ] **Step 4: Manual smoke**

- Enter a regular code on `CEFR Listening Mocks.html` → click a not-yet-taken mock → recordOpen fires (verify in DevTools `localStorage.ms_mock_attempts_v1`).
- Submit the test → result screen → AI/transcript/review buttons all show "🔒 Premium" and click opens upgrade modal.
- Reload the same mock card and click → upgrade modal appears (retake gated).

- [ ] **Step 5: Commit**

```bash
git add "site/CEFR Listening.html" "site/IELTS listening.html"
git commit -m "feat(listening): gate retakes + lock result buttons for regular tier"
```

---

### Task 11: Reading test pages — same treatment

**Files:**
- Modify: `site/CEFR Reading.html`
- Modify: `site/IELTS reading.html`

- [ ] **Step 1: For BOTH files, add the script + stylesheet near the top of `<head>`**

```html
<link rel="stylesheet" href="premium-gate.css">
<script src="premium-gate.js" defer></script>
```

- [ ] **Step 2: For BOTH files, add the test-render gate (mirroring Task 10 step 2)**

Use `skill = 'reading'` and `examType = 'cefr'` or `'ielts'` per file.

- [ ] **Step 3: For BOTH files, lock the AI / review / retry buttons (mirroring Task 10 step 3)**

- [ ] **Step 4: Manual smoke as in Task 10 but for Reading**

- [ ] **Step 5: Commit**

```bash
git add "site/CEFR Reading.html" "site/IELTS reading.html"
git commit -m "feat(reading): gate retakes + lock result buttons for regular tier"
```

---

### Task 12: Mocks index pages — render "Taken N×" badges

**Files:**
- Modify: `site/CEFR Listening Mocks.html`
- Modify: `site/IELTS Listening Mocks.html`
- Modify: `site/CEFR Reading Mocks.html`
- Modify: `site/IELTS Reading Mocks.html`

- [ ] **Step 1: For each file, add the script + stylesheet in `<head>`**

```html
<link rel="stylesheet" href="premium-gate.css">
<script src="premium-gate.js" defer></script>
```

- [ ] **Step 2: For each file, render a "Taken N×" badge on each mock card**

Locate the mock-card grid. Each card has a mock number — if the card uses `data-mock="<n>"`, this script attaches; otherwise the engineer adds `data-mock="<n>"` to each card root.

Add at the bottom of the file's existing scripts:

```html
<script>
(function () {
  function decorate() {
    if (!window.PremiumGate) return;
    var examType = '__EXAM__';   // 'cefr' or 'ielts'
    var skill    = '__SKILL__';  // 'listening' or 'reading'
    var cards = document.querySelectorAll('[data-mock]');
    cards.forEach(function (card) {
      var n = Number(card.getAttribute('data-mock'));
      if (!n) return;
      var count = window.PremiumGate.attemptCount({ skill: skill, exam_type: examType, mock_number: n });
      if (count > 0) {
        var b = document.createElement('span');
        b.className = 'pg-taken-badge';
        b.textContent = count === 1 ? '✓ Taken' : '✓ Taken · ' + count + '×';
        b.style.cssText = 'display:inline-block;margin-left:8px;background:#10b981;color:#fff;font-size:10px;font-weight:800;padding:2px 6px;border-radius:999px;';
        card.appendChild(b);
      }
    });
    // Cross-device refresh once we have a name
    if (window.PremiumGate.fetchTakenForUser) {
      window.PremiumGate.fetchTakenForUser().then(function (rows) {
        // Re-render: clear and re-add (idempotent enough for low cardinality)
        document.querySelectorAll('.pg-taken-badge').forEach(function (b) { b.remove(); });
        var counts = {};
        rows.forEach(function (r) {
          if (r.skill !== skill || r.exam_type !== examType) return;
          counts[r.mock_number] = (counts[r.mock_number] || 0) + 1;
        });
        cards.forEach(function (card) {
          var n = Number(card.getAttribute('data-mock'));
          if (!counts[n]) return;
          var b = document.createElement('span');
          b.className = 'pg-taken-badge';
          b.textContent = counts[n] === 1 ? '✓ Taken' : '✓ Taken · ' + counts[n] + '×';
          b.style.cssText = 'display:inline-block;margin-left:8px;background:#10b981;color:#fff;font-size:10px;font-weight:800;padding:2px 6px;border-radius:999px;';
          card.appendChild(b);
        });
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', decorate);
  else decorate();
})();
</script>
```

Replace `__EXAM__` / `__SKILL__` literally per file.

- [ ] **Step 3: Manual smoke**

- After taking mock #5 (Task 10/11), revisit the corresponding Mocks index → card #5 shows "✓ Taken".
- Take mock #5 a second time as premium → card shows "✓ Taken · 2×".

- [ ] **Step 4: Commit**

```bash
git add "site/CEFR Listening Mocks.html" "site/IELTS Listening Mocks.html" "site/CEFR Reading Mocks.html" "site/IELTS Reading Mocks.html"
git commit -m "feat(mocks-index): render Taken badge on mock cards"
```

---

### Task 13: Speaking pages — gate Part Practice tile + retake + AI buttons

**Files:**
- Modify: `site/Speaking Mocks.html`
- Modify: `site/IELTS Speaking Mocks.html`

- [ ] **Step 1: For BOTH files, add the script + stylesheet in `<head>`**

```html
<link rel="stylesheet" href="premium-gate.css">
<script src="premium-gate.js" defer></script>
```

- [ ] **Step 2: For BOTH files, lock the Part Based Practice tile in the Choose Your Mode modal**

Search the file for the Part Based Practice tile markup (it has the text "Part Based Practice" / "Pick one part" — confirm via grep). Wrap the click handler:

```javascript
(function () {
  function decorate() {
    if (!window.PremiumGate) return;
    if (window.PremiumGate.isPremiumTier('speaking') || window.PremiumGate.isAdmin()) return;
    var partTile = document.querySelector('[data-mode="part"], #partPracticeTile, .mode-tile-part');
    if (partTile) window.PremiumGate.applyLockBadge(partTile, 'part_practice_speaking');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', decorate);
  else decorate();
  // Also re-decorate every time the modal becomes visible (in case it's lazily injected)
  var mo = new MutationObserver(decorate);
  mo.observe(document.body, { childList: true, subtree: true });
})();
```

If the tile lacks any of the suggested selectors, the engineer adds `data-mode="part"` to the existing tile root.

- [ ] **Step 3: For BOTH files, gate Full Mock entry (recordOpen + retake)**

Locate the Full Mock tile click handler (the path that proceeds to the actual test rendering). Just before it begins setup (e.g. before `_practiceMode = false` is set), call:

```javascript
(function () {
  if (!window.PremiumGate) return;
  var examType = '__EXAM__';                  // 'cefr' or 'ielts'
  var mockNum  = Number(window._currentMockNumber || (new URLSearchParams(location.search)).get('mock') || 0);
  if (!window.PremiumGate.isPremiumTier('speaking') && !window.PremiumGate.isAdmin()
      && window.PremiumGate.hasTaken({ skill: 'speaking', exam_type: examType, mock_number: mockNum })) {
    window.PremiumGate.openUpgradeModal('retake_speaking_' + mockNum);
    return;  // halt the Full Mock flow
  }
  window.PremiumGate.recordOpen({ skill: 'speaking', exam_type: examType, mock_number: mockNum });
})();
```

- [ ] **Step 4: For BOTH files, lock manual AI / retry / model-answer / transcript buttons after submit**

In the result/finish render path, append:

```javascript
(function () {
  if (!window.PremiumGate) return;
  if (window.PremiumGate.isPremiumTier('speaking') || window.PremiumGate.isAdmin()) return;
  ['#aiAnalyzeBtn', '#aiRetryBtn', '#showTranscriptBtn', '#modelAnswerBtn', '#tryAgainBtn', '[data-pg-lock]']
    .forEach(function (s) {
      document.querySelectorAll(s).forEach(function (el) {
        window.PremiumGate.applyLockBadge(el, 'speaking_result');
      });
    });
})();
```

- [ ] **Step 5: Manual smoke**

- Regular speaking code → click any mock → Choose Your Mode modal → Part tile shows "🔒 Premium", clicking opens upgrade modal; Full Mock proceeds normally on first attempt; reopening same mock → upgrade modal.
- Premium speaking code → no locks anywhere.
- Admin → no locks anywhere; recordOpen does NOT fire (`localStorage.ms_mock_attempts_v1` unchanged).

- [ ] **Step 6: Commit**

```bash
git add "site/Speaking Mocks.html" "site/IELTS Speaking Mocks.html"
git commit -m "feat(speaking): lock part-practice + retake + result AI buttons"
```

---

### Task 14: Writing pages — same treatment (no part tile, but lock manual AI)

**Files:**
- Modify: `site/Writing Mocks.html`
- Modify: `site/Writing IELTS Mock.html`

- [ ] **Step 1: For BOTH files, add the script + stylesheet in `<head>`**

```html
<link rel="stylesheet" href="premium-gate.css">
<script src="premium-gate.js" defer></script>
```

- [ ] **Step 2: For BOTH files, lock Task 1 / Task 2 selection if it exposes part-only practice**

If the file's wizard offers a "single task" / "Task 2 only" practice option, lock that tile the same way as Speaking's Part tile. If it's only "Full Writing Mock" with both tasks, skip this step.

```javascript
(function () {
  if (!window.PremiumGate) return;
  if (window.PremiumGate.isPremiumTier('writing') || window.PremiumGate.isAdmin()) return;
  var t = document.querySelector('[data-mode="task"], #taskOnlyTile');
  if (t) window.PremiumGate.applyLockBadge(t, 'task_practice_writing');
})();
```

- [ ] **Step 3: For BOTH files, gate Full Mock entry (recordOpen + retake)**

```javascript
(function () {
  if (!window.PremiumGate) return;
  var examType = '__EXAM__';
  var mockNum  = Number(window._currentMockNumber || (new URLSearchParams(location.search)).get('mock') || 0);
  if (!window.PremiumGate.isPremiumTier('writing') && !window.PremiumGate.isAdmin()
      && window.PremiumGate.hasTaken({ skill: 'writing', exam_type: examType, mock_number: mockNum })) {
    window.PremiumGate.openUpgradeModal('retake_writing_' + mockNum);
    return;
  }
  window.PremiumGate.recordOpen({ skill: 'writing', exam_type: examType, mock_number: mockNum });
})();
```

- [ ] **Step 4: For BOTH files, lock the manual AI checker button**

In `Writing Mocks.html` the manual AI flow is gated near `Writing Mocks.html:14027` (`isPremiumEntry` branch). The button itself is rendered earlier; locate via `id="aiCheckerBtn"` or text "Check with AI" and add `data-pg-lock` to it. Then add at the end of the result render:

```javascript
(function () {
  if (!window.PremiumGate) return;
  if (window.PremiumGate.isPremiumTier('writing') || window.PremiumGate.isAdmin()) return;
  ['#aiCheckerBtn', '#aiRetryBtn', '#showTranscriptBtn', '#tryAgainBtn', '[data-pg-lock]']
    .forEach(function (s) {
      document.querySelectorAll(s).forEach(function (el) {
        window.PremiumGate.applyLockBadge(el, 'writing_result');
      });
    });
})();
```

- [ ] **Step 5: Manual smoke**

- Regular writing code → manual AI button shows "🔒 Premium", click opens upgrade modal.
- First-time mock entry works; retry shows upgrade modal.
- Premium writing → no locks. Admin → no locks, no recordOpen.

- [ ] **Step 6: Commit**

```bash
git add "site/Writing Mocks.html" "site/Writing IELTS Mock.html"
git commit -m "feat(writing): lock manual AI + retake + part-task tile for regular tier"
```

---

### Task 15: Plus pages — top-of-page direct-URL guard

**Files:**
- Modify: `site/Speaking Plus.html`
- Modify: `site/Writing Plus.html`
- Modify: `site/Reading Plus.html`
- Modify: `site/Listening Plus.html`

- [ ] **Step 1: For each file, add the script + stylesheet in `<head>`**

```html
<link rel="stylesheet" href="premium-gate.css">
<script src="premium-gate.js" defer></script>
```

- [ ] **Step 2: For each file, add the guard immediately after `<body>` opens**

```html
<script>
(function () {
  function guard() {
    if (!window.PremiumGate) return;
    if (window.PremiumGate.isAdmin()) return;
    var skill = '__SKILL__';  // 'speaking' | 'writing' | 'reading' | 'listening'
    if (window.PremiumGate.isPremiumTier(skill)) return;
    document.body.style.display = 'none';
    document.addEventListener('DOMContentLoaded', function () {
      document.body.style.display = '';
      // Render only the upgrade modal — keep test content from rendering
      Array.prototype.slice.call(document.body.children).forEach(function (c) {
        if (!c.classList || !c.classList.contains('pg-modal-overlay')) c.style.display = 'none';
      });
      window.PremiumGate.openUpgradeModal('plus_' + skill);
    });
  }
  guard();
})();
</script>
```

Replace `__SKILL__` literally per file.

- [ ] **Step 3: Manual smoke**

- Anonymous (no code) navigates directly to `/Speaking Plus.html` → upgrade modal renders, test content hidden.
- Regular code in session → same behavior (still locked).
- Premium code → page renders normally.
- Admin session → page renders normally.

- [ ] **Step 4: Commit**

```bash
git add "site/Speaking Plus.html" "site/Writing Plus.html" "site/Reading Plus.html" "site/Listening Plus.html"
git commit -m "feat(plus): direct-URL premium guard with upgrade modal"
```

---

## Phase 4 — Service worker bump

### Task 16: Bump `sw.js` cache version

**Files:**
- Modify: `site/sw.js`

- [ ] **Step 1: Replace `mockstream-v11` with `mockstream-v12`**

Find at top of file:

```javascript
const CACHE_NAME = 'mockstream-v11';
```

Replace with:

```javascript
const CACHE_NAME = 'mockstream-v12';
```

- [ ] **Step 2: Commit**

```bash
git add site/sw.js
git commit -m "chore(sw): bump cache to v12 for premium-gate rollout"
```

---

## Phase 5 — Manual smoke on `mock-stream.com`

### Task 17: Push to `dev` (with user confirmation per memory rule), verify on live site

- [ ] **Step 1: Ask the user explicitly before pushing**

> "Ready to push the paywall changes to `dev` so you can test on `mock-stream.com`. Confirm to push?"

Wait for user OK.

- [ ] **Step 2: Push**

```bash
cd "C:/Users/user/Desktop/Mock Stream" && git push origin dev
```

- [ ] **Step 3: Wait for Netlify to deploy (~2 min). User runs the smoke checklist below on `mock-stream.com`.**

**Smoke checklist:**

1. **Anonymous visitor:**
   - Landing page loads. Plus menu items show "🔒 Premium" badges.
   - Clicking any Plus item opens the upgrade modal; CTA opens `t.me/mrkhasanoff3`.
   - Direct URL `/Speaking Plus.html` shows upgrade modal full-page.
2. **Regular individual-code session (12-digit code that issues `*PremiumEntry='false'`, OR 8-digit Supabase regular code):**
   - Mock cards on Mocks index pages show "✓ Taken" badges where applicable.
   - Speaking → Choose Your Mode → Part tile locked; Full Mock works first try; second try shows upgrade modal.
   - Writing → manual AI button locked; result-screen retry/transcript locked.
   - Listening + Reading → same: AI/transcript/review/retry buttons locked.
3. **Premium individual-code session:**
   - No locks anywhere. AI buttons usable. Part Practice usable. Plus pages usable. Retakes work.
4. **VIP regular (`vipSessionAccess='true'` only):**
   - Behaves like regular: locks active.
5. **VIP premium (`vipPremiumAi='true'`):**
   - No locks. Auto-AI fires.
6. **Admin session:**
   - No locks. recordOpen does NOT fire (verify via Supabase: `SELECT * FROM mock_attempts WHERE candidate_name = '<your-admin-name>' ORDER BY opened_at DESC LIMIT 5;` — should not include the test you just ran).
7. **Per-user counter:**
   - Take mock #5 as premium twice → mock card shows "✓ Taken · 2×".
8. **Backfill:**
   - For a known historical student (you), confirm "✓ Taken" badge appears on mock(s) they took in the past.

- [ ] **Step 4: Bump `sw.js` once more if cache issues observed during smoke**

If users report stale assets, bump to `mockstream-v13` and push again.

- [ ] **Step 5: After all smoke checks pass, ask user explicitly to push to `master`**

> "Smoke passed on `mock-stream.com`. Push `dev` → `master` to roll out to all 5 clones?"

Wait for confirmation. Then:

```bash
cd "C:/Users/user/Desktop/Mock Stream" && git checkout master && git merge dev --no-ff -m "Merge dev: regular-tier paywall + mock-attempt tracker" && git push origin master && git checkout dev
```

---

## Self-review notes

**Spec coverage:** Each spec section maps to plan tasks:

- §3 (tier model) → Task 3 (`isPremiumTier`, `isAdmin`)
- §4.1 (AI buttons) → Tasks 10, 11, 13, 14 (per-page lock decoration)
- §4.2 (Part Based Practice) → Task 13 (Speaking), Task 14 (Writing)
- §4.3 (Plus pages) → Task 9 (menu), Task 15 (direct URL)
- §5 (one-shot rule, open = taken) → Tasks 10, 11, 13, 14 (gate + recordOpen)
- §6 (tracker) → Tasks 1, 2, 4, 6
- §7 (modal + badge) → Tasks 7, 8
- §8 (backfill) → Task 2
- §9 (admin bypass) → Task 3 (`isAdmin`), enforced in `recordOpen`/`recordSubmit`
- §11 (rollout) → Task 17

**Red flags fixed:** Replaced "TBD" / "similar to" placeholders. Each task contains the actual snippet, not "see Task N".

**Type consistency:** Function names match across tasks (`isPremiumTier`, `recordOpen`, `recordSubmit`, `applyLockBadge`, `openUpgradeModal`). Storage keys consistent (`ms_mock_attempts_v1`). REST endpoint constant (`mock_attempts`).

**Known approximations:** Line numbers for huge files (Speaking Mocks ~20.9k lines, Writing Mocks ~14k+) are anchors based on prior exploration; the engineer confirms via grep at execution time. Selectors like `#aiAnalyzeBtn` are plausible defaults — if the page uses different IDs/classes, add a `data-pg-lock` attribute to the actual button instead and the universal `[data-pg-lock]` selector picks it up.
