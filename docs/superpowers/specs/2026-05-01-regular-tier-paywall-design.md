# Regular-tier paywall + universal mock-attempt tracker — Design

**Date:** 2026-05-01
**Status:** Draft, pending user review
**Author:** Brainstormed with the user; written by Claude

## 1. Goals

1. **Conversion pressure on regular tier.** Every premium-only feature is visible to regular users as a badged + locked surface that opens an "Upgrade to Premium" modal pointing to the founder's Telegram with a prefilled message.
2. **Navigation aid for all tiers.** Every user (premium and regular) sees which mocks they have already attempted, with an attempt counter, so they don't have to guess what they have or haven't tried.
3. **One-shot rule for regular tier.** A regular user (regular individual code OR regular VIP) gets exactly one attempt per mock. Re-entering the same mock shows the upgrade modal instead of the test.

## 2. Non-goals

- DRM-grade enforcement. Self-asserted candidate names and clearable localStorage are accepted bypass vectors. The goal is to nudge, not jail.
- Removing the legacy 10-/12-digit alwaysdata code paths in `Speaking Mocks.html`, `Writing Mocks.html`, etc. They are dead in practice (8-digit Supabase codes are issued today), but cleanup is a separate task. The new gates read sessionStorage flags, which are written by all paths identically, so this spec is unaffected.
- Building the global "🔥 Hot / ✨ Rare / Most-taken" popularity tracker. Data exists in `results`; the feature does not. Deferred to v2.

## 3. Tier model (canonical)

A single helper `isPremiumTier(skill)` returns `true | false` based on existing sessionStorage flags. Reads-only; the helper does not write. Resolution order:

1. **Speaking quirk.** If `sessionStorage.speakingIndividualCode` is set, use it (`'premium'` → premium, anything else → regular). This preserves the existing override where an individual code on Speaking masks a session-wide VIP. Skills other than Speaking skip this step.
2. **Site-wide VIP premium.** `sessionStorage.vipPremiumAi === 'true'` → premium.
3. **Per-skill individual code.** `sessionStorage.<skill>PremiumEntry === 'true'` → premium; `=== 'false'` → regular individual.
4. **Site-wide VIP regular.** `sessionStorage.vipSessionAccess === 'true'` (with `vipPremiumAi` absent) → regular.
5. **Default.** No code session → treat as regular for badge display purposes; gates fall through to the standard passcode entry (no behavior change for anonymous visitors).

`<skill>` is one of `speaking`, `writing`, `reading`, `listening`. Reading and Listening do not have a `*IndividualCode` flag — they only use `*PremiumEntry` and the VIP flags.

`isAdmin()` is a separate helper that returns `true` when the active session is an admin (existing admin-auth check). **`isAdmin() === true` short-circuits every gate** described in §4 and §5.

## 4. The three premium-locked surfaces

Each gate is a small wrapper that calls `isPremiumTier(skill)`. When the answer is `false` (and `isAdmin() === false`), the gate prevents the action and opens the shared upgrade modal (§7).

### 4.1 AI buttons (auto + manual)

Affected pages: `Speaking Mocks.html`, `IELTS Speaking Mocks.html`, `Writing Mocks.html`, `Writing IELTS Mock.html`, `CEFR Listening.html`, `CEFR Reading.html`, `IELTS listening.html`, `IELTS reading.html`.

Behavior changes for regular tier:

- **Auto-AI:** already gated today. No new logic needed; existing behavior preserved.
- **Manual AI buttons** (Writing's "Check with AI" today is clickable for regular users — line ~14027 in `Writing Mocks.html`): become disabled, render with a 🔒 lock icon and "Premium" badge. Click opens the upgrade modal.
- **Retry-AI buttons** (already locked for regular today): visual is upgraded to use the shared lock badge style for consistency.
- **Transcript / Model Answer / Review Answers buttons** on result screens: already locked today; their visuals are unified to the shared lock badge.

The expected visible state for a regular user finishing a mock is: every AI-related affordance is visible, badged, and routes to the upgrade modal on click.

### 4.2 Part Based Practice tile in the "Choose Your Mode" modal

The modal in the screenshot (Speaking, but the same UX exists for Writing/Reading/Listening per existing Plus integration) offers two tiles: "Full Mock" and "Part Based Practice".

For regular tier the **Part Based Practice tile** renders disabled, with a 🔒 + "Premium" badge overlay; click opens the upgrade modal. The Full Mock tile stays clickable and proceeds as today.

### 4.3 Plus pages (Writing/Speaking/Reading/Listening Plus)

Today the Plus menu items in `landing.html` (lines 6780–6789) render unconditionally for everyone but the click is wrapped in `_requireAdminAccess(...)`. Regular students see the items but can't open them; admins can.

For regular tier the visible change:

- The Plus menu items render with the shared 🔒 + "Premium" badge.
- Click for non-admin regular users opens the upgrade modal (instead of silently failing the admin check).
- **Admin bypass remains.** `_requireAdminAccess` still runs first; admins keep their current path. The premium gate is below the admin gate in priority.
- **Direct-URL hardening on the Plus pages themselves.** Each Plus page (`Speaking Plus.html`, `Writing Plus.html`, `Reading Plus.html`, `Listening Plus.html`) gets a top-of-page check: if `!isAdmin() && !isPremiumTier(<skill>)` then render the upgrade modal full-page (no test content). Today these pages have no admin check inside them — direct URL bypasses everything.

## 5. One-shot per-mock attempt rule

Applies to regular tier (individual code or VIP) and to admins NOT (they bypass).

### 5.1 Definition of "taken"

A mock is **taken** the moment the test page renders for the user — i.e., past the wizard / Choose Your Mode modal, when the user can see the actual questions. We write the attempt row at this point, NOT on submit.

For the Choose Your Mode modal: clicking "Full Mock" → write attempt row → render test page. Part Based Practice is locked for regular tier and never reaches a test page anyway.

### 5.2 Behavior

- **Regular tier user, mock not yet taken:** standard flow — enter code → wizard → render → write `mock_attempts` row → take the test.
- **Regular tier user, mock already taken** (per tracker): on attempting to enter the mock (after code verification), the upgrade modal appears in place of the wizard / test page. The user cannot retake.
- **Premium tier user:** standard flow — entry, attempt row written, retake allowed. Badge shows "Taken N×".
- **Admin:** bypassed. Attempt rows are not written for admins (avoid polluting per-user counts and global popularity). Admins can re-test freely.

### 5.3 Reading the rule

The read happens at two points:

1. **On landing page render:** to draw the "Taken N×" badge on each mock card.
2. **On mock entry:** to decide whether to render the upgrade modal or the test.

Both reads use the same source of truth (§6).

## 6. Tracker design

### 6.1 Supabase table

New table `mock_attempts`:

```sql
CREATE TABLE IF NOT EXISTS public.mock_attempts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_name TEXT NOT NULL,                -- self-asserted, lowercase-trimmed for matching
  center        TEXT NOT NULL,
  exam_type     TEXT NOT NULL,                 -- 'cefr' | 'ielts'
  skill         TEXT NOT NULL,                 -- 'speaking' | 'writing' | 'reading' | 'listening'
  mock_number   INT NOT NULL,
  tier_at_open  TEXT NOT NULL,                 -- 'regular' | 'premium' (snapshot of tier when opened)
  opened_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at  TIMESTAMPTZ,                   -- nullable; set on submit if available
  device_id     TEXT,                          -- optional, for cross-device same-user matching
  source        TEXT                           -- 'live' | 'backfill'
);

CREATE INDEX mock_attempts_lookup
  ON public.mock_attempts (candidate_name, center, exam_type, skill, mock_number);

CREATE INDEX mock_attempts_global_count
  ON public.mock_attempts (skill, exam_type, mock_number);
```

RLS:

- Anon `INSERT` allowed (matches existing `results` table policy).
- Anon `SELECT` allowed (badges and counters are not sensitive).
- Anon `UPDATE` allowed only on `submitted_at` for own row (best-effort; we do not gate on this).

### 6.2 localStorage mirror

Key: `ms_mock_attempts_v1`. Value: an array of `{skill, mock_number, exam_type, tier, opened_at, submitted_at}` objects, capped at the latest 500 entries.

The mirror is **append-only** on write and serves as a fallback when the Supabase write fails or the user has no candidate name yet. Reads merge `(candidate_name from Supabase) ∪ (localStorage)`.

### 6.3 Read logic

`hasTaken(skill, mock_number, exam_type)` returns `boolean` and `attemptCount(...)` returns `number`. Implementation:

1. Read `localStorage.ms_mock_attempts_v1`. Collect counts.
2. If `CANDIDATE_FULL_NAME` is present, fetch the user's rows from Supabase via REST (`/rest/v1/mock_attempts?candidate_name=eq.<name>&center=eq.<center>&select=skill,mock_number,exam_type,opened_at`). Cache for 60 s in memory.
3. Union both, dedupe on `(skill, exam_type, mock_number, opened_at-rounded-to-minute)`.

If Supabase fetch fails, fall back to localStorage only.

### 6.4 Write logic

`recordOpen({skill, mock_number, exam_type, center, tier})`:

1. Normalize `candidate_name` (read from `sessionStorage.CANDIDATE_FULL_NAME`) with `name.trim().toLowerCase()` before any storage write — same convention as the backfill SQL — so case/whitespace variants do not produce parallel histories for the same student.
2. Append to localStorage immediately.
3. Best-effort `INSERT` into Supabase (fire-and-forget; failure logged, not surfaced).
4. Don't block the test from rendering.

`recordSubmit({skill, mock_number, exam_type})`:

1. Find the latest matching open in localStorage; set `submitted_at`.
2. Best-effort `PATCH` against the matching Supabase row.

Submit-time write is non-essential (the open-time write already establishes "taken"); it exists so we can later distinguish "opened but abandoned" from "fully submitted" if needed.

## 7. Shared upgrade modal & lock badge

Two new shared components, both in a new file `site/premium-gate.js`:

### 7.1 `window.PremiumGate.openUpgradeModal(reason)`

Renders a modal styled to match the existing chat-bubble premium panel (`chat-bubble.js:1700-1733`). Contents:

- Heading: "🔥 Want more? Upgrade to Premium"
- Feature list (matches the screenshot):
  - 🤖 Instant AI scoring & feedback
  - 📜 Full transcripts (speaking + writing)
  - 🔁 Unlimited retries
  - 🎯 One code unlocks all skills
  - ⚡ No daily / hourly limits
- Primary CTA button: "Open Premium tab" — calls the existing `goPremium()` flow (`chat-bubble.js:1820-1833`) which opens `t.me/mrkhasanoff3` with the prefilled Uzbek message. Reuse the same URL and message text verbatim.
- Secondary "Close" / X.

`reason` is a free-text string used only for client-side analytics (e.g., `'manual_ai_writing'`, `'part_practice_speaking'`, `'plus_listening'`, `'retake_mock_05_writing'`). Logged to a `console.info` for now; can be wired to a future analytics endpoint without changing callers.

### 7.2 `window.PremiumGate.applyLockBadge(element, reason)`

Decorates a DOM element to look locked:

- Adds class `pg-locked` (CSS in `premium-gate.css`).
- Overlays a small "🔒 Premium" badge in the top-right (or replaces the visible label with a locked equivalent for buttons).
- Replaces the click handler so click invokes `openUpgradeModal(reason)` and `event.preventDefault()` / `stopImmediatePropagation()` runs first.

### 7.3 `window.PremiumGate.isPremium(skill)` and `.isAdmin()`

The §3 helpers, exported.

### 7.4 `window.PremiumGate.recordOpen({...})` / `recordSubmit({...})`

The §6.4 writers.

### 7.5 `window.PremiumGate.hasTaken({...})` / `attemptCount({...})`

The §6.3 readers.

## 8. Backfill from existing `results`

A one-shot SQL run by the user in Supabase SQL Editor:

```sql
INSERT INTO public.mock_attempts
  (candidate_name, center, exam_type, skill, mock_number, tier_at_open,
   opened_at, submitted_at, source)
SELECT
  LOWER(TRIM(student_name)),
  center,
  exam_type,
  skill,
  NULLIF(REGEXP_REPLACE(mock_number, '\D', '', 'g'), '')::INT,
  'unknown',                                  -- historical tier unknown
  created_at,                                 -- best proxy for opened_at
  created_at,                                 -- assume submitted, since results only contains submissions
  'backfill'
FROM public.results
WHERE student_name IS NOT NULL
  AND TRIM(student_name) <> ''
  AND mock_number ~ '\d';                     -- skip rows with no parseable mock number
```

Effects:

- Every submitted mock currently in `results` becomes an attempt row. Badge "Taken N×" appears immediately for every returning user with a stable name.
- Lock applies retroactively (per user choice): a regular user who finished mock #5 last week opens it tomorrow and sees the upgrade modal.
- `tier_at_open = 'unknown'` means we can't retroactively distinguish historical regular vs premium attempts; this is acceptable because the gate logic uses **current** session tier, not historical.

## 9. Admin bypass — unified

Single helper `isAdmin()` resolved via existing admin-auth path. `isAdmin() === true` causes:

- All locks in §4 are no-ops (button stays clickable, no badge).
- `recordOpen` / `recordSubmit` short-circuit and do nothing (admins do not pollute counts).
- Plus-page direct-URL guard does not fire.

`isAdmin()` is checked at gate-evaluation time, not cached, so an admin signing out mid-session immediately reverts to their tier.

## 10. File-level impact summary

### New files

- `site/premium-gate.js` — central tier helper, modal, lock decorator, tracker reader/writer.
- `site/premium-gate.css` — lock badge styling, modal styling.
- `supabase/migrations/20260501000000_mock_attempts.sql` — table + RLS.
- `supabase/migrations/20260501000001_mock_attempts_backfill.sql` — one-shot backfill (commit but document that it is run manually once).

### Modified files

- `site/landing.html` — load `premium-gate.js`/`.css`, badge mock cards with "Taken N×", badge Plus menu items as locked for non-admin non-premium.
- `site/Speaking Mocks.html`, `site/IELTS Speaking Mocks.html` — call `recordOpen` on test render, lock manual AI / retry buttons, lock Part Practice tile in mode picker, gate retake on entry.
- `site/Writing Mocks.html`, `site/Writing IELTS Mock.html` — same treatment (manual AI button is the most visible change here).
- `site/CEFR Listening.html`, `site/IELTS listening.html`, `site/CEFR Reading.html`, `site/IELTS reading.html` — same treatment minus part-practice and minus speaking-only quirks.
- `site/Speaking Plus.html`, `site/Writing Plus.html`, `site/Reading Plus.html`, `site/Listening Plus.html` — top-of-page guard: render upgrade modal if not premium and not admin.
- `site/sw.js` — bump cache version (so users pick up new JS/CSS immediately).

### Out of scope (cleanup tasks for follow-up)

- Removing dead 10-/12-digit alwaysdata branches in `Speaking Mocks.html`, `Writing Mocks.html`, `IELTS Speaking Mocks.html`, `Writing IELTS Mock.html`, `IELTS listening.html`, `IELTS reading.html`, `CEFR Listening.html`, `CEFR Reading.html`. Same with `extractSpeakingPremiumOTP` / `extractWritingPremiumOTP` / `extractSpeakingRegularOTP` / `extractWritingRegularOTP` and the `passcodes.js` / `*-promocodes.js` files where unused.
- Global popularity tracker ("🔥 Hot / ✨ Rare / Most-taken" badges).
- Server-side single-use enforcement on regular `mock_codes` (`consumed_at` column on the Supabase `mock_codes` row).

## 11. Rollout

1. Apply the migration in Supabase (`20260501000000_mock_attempts.sql`) on staging project, then prod.
2. Run the backfill SQL once (`20260501000001_mock_attempts_backfill.sql`).
3. Push to `dev` branch → verify on `mock-stream.com`:
   - Regular individual code → AI buttons locked, Part Practice locked, Plus locked, mock retake locked. Upgrade modal opens Telegram.
   - Premium individual code → no locks. Counter badge appears after submit.
   - Admin session → no locks anywhere; no attempt rows written.
   - "Taken N×" badge accurate on landing for both tiers.
4. Bump `sw.js` cache version.
5. After user confirms `dev` is good, push to `master` → 5 clones deploy.

## 12. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Tracker write fails silently → badge wrong | localStorage mirror means the user's own device still shows correct state. Cross-device drift is acceptable for a conversion-pressure feature. |
| Self-asserted name change bypasses lock | Accepted. Goal is nudge, not DRM. |
| Admin testing pollutes counts | `recordOpen`/`recordSubmit` short-circuit when `isAdmin()`. |
| User finishes mock then refreshes — "taken" double-fires | `recordOpen` is idempotent client-side: if the same `(skill, mock_number, opened_at)` pair was written within 5 s, skip. Server-side dedup is best-effort via `LOWER(TRIM(name))` in lookups; a duplicate row is harmless because `attemptCount` clamps to "Taken 1×" / "2×" / "3×" presentation. |
| Backfill mis-parses mock_number | The regex `\D` removal + `~ '\d'` filter skips unparseable rows. Bad rows are not migrated; nothing is destroyed. |
| Plus pages today inherit `_requireAdminAccess` from landing — direct URL goes unguarded | New top-of-page guard on each Plus page closes this. |
| Speaking individual-code override masks VIP | Preserved as today. The `isPremiumTier('speaking')` helper applies the same precedence the existing code uses, so no behavior change there. |

## 13. Open questions (none blocking implementation)

- **Counter rendering:** "Taken 1×" or just "✓ Taken" when count is 1? (Default to plain "✓ Taken" for 1, "✓ Taken · N×" for >1, finalized in implementation.)
- **Lock badge copy:** "Premium" vs "🔒 Premium" vs "Premium only". Default "🔒 Premium".
- **Modal localization:** the upgrade modal copy stays in English headings / Uzbek prefilled Telegram message, matching today's chat-bubble. Translate later if needed.
