# Device-limit enforcement & account-sharing detection

**Date:** 2026-08-09
**Status:** design approved, not yet implemented
**Scope:** web (7 Netlify sites), mobile (iOS + Android), desktop (Windows + Mac), admin panel

## Problem

Premium is sold per account. Accounts are shared. The existing controls do not
stop it:

1. **Only the web registers devices.** `mockstream-mobile` and
   `mockstream-runner` contain zero references to `premium_devices`,
   `_device_count_for` or `hardware_fp` (verified 2026-08-09). Every phone and
   every desktop install is invisible to the counter.
2. **Enforcement is client-side.** `site/auth.js` sets `info.active = false`
   in JavaScript when `_device_count_for` returns > 5. A modified client, or
   simply using an app instead of a browser, walks past it.
3. **Device count alone is a weak sharing signal.** A teacher with a phone, a
   laptop and a tablet looks identical to three students sharing a password.

Net effect: a shared premium account is effectively unlimited today. This is
directly revenue-relevant, which is why it gets its own admin surface rather
than living inside the premium panel.

## Who is in scope — premium accounts ONLY

There are two ways students reach premium features:

1. **Premium accounts** (Google / Apple / Telegram identity with a purchased
   entitlement) — **this is the entire scope of this design.**
2. **Daily activation codes** handed out by B2B partner teachers, one per mock.
   These are shared by design — one code can be used by any number of students
   once issued. **They are explicitly OUT of scope:** no device registration,
   no counting, no signals, no gating. A classroom redeeming one daily code
   must never appear in the flagged list; if it did, every partner class would
   flag as severe "sharing" on day one.

Concretely: `device-gate` and client-side registration fire only when the
session belongs to an account with an active premium entitlement. Code-based
access paths skip the registry entirely.

## Goals

- Count devices across **all five platform identities**: web, Android, iOS,
  Windows, Mac.
- Give the admin a **Devices menu** that shows who is sharing, with evidence.
- **Manual blocking first.** The admin decides each case. A per-centre toggle
  switches to automatic enforcement when they are ready.
- Limit: **3 devices** per (email, centre), overridable per account.

## Non-goals

- **Do not touch the premium panel, `premium_devices`, or `_device_count_for`.**
  They work. Nothing in this design changes their behaviour, columns or
  semantics. See "The regression this avoids".
- No paid device-fingerprinting vendor (FingerprintJS, Castle, Seon). Evaluated
  and rejected for now: native platforms already give strong device IDs, the
  current leak is casual password sharing rather than deliberate evasion, and
  the enforcement point — not signal quality — is what is broken. Revisit only
  if the data shows evasion via browser-storage clearing.
- No IAP / paid extra-device slot. Proposed and declined 2026-08-09 (the
  mechanism — an extra-slot code type feeding `extra_slots` in
  `device_policy` — is recorded here in case it is wanted later).
- No tracking of daily-activation-code users (see scope section above).

## The regression this avoids

If app devices were written into `premium_devices`, every student's count would
jump, and the **existing > 5 web rule would start auto-blocking accounts** while
the new admin toggle is still off. That would look like this feature breaking
the premium panel.

Therefore: **`premium_devices` → `device_sessions` is a one-way mirror, never
the reverse.** The web client keeps writing only to `premium_devices` (no client
change); a trigger copies rows into `device_sessions`. Apps write to
`device_sessions` only. The legacy rule keeps seeing exactly the rows it sees
today.

## Architecture

### `device_sessions` (new table)

One row per (email, centre, device). All platforms land here.

| column | notes |
|---|---|
| `id` | pk |
| `email` | account identity |
| `center_id` | slots are counted per (email, centre) |
| `device_key` | stable per-device id (see identity table) |
| `platform` | `web` \| `android` \| `ios` \| `windows` \| `mac` |
| `device_label` | human string for the admin list (model / browser + OS) |
| `hardware_fp` | nullable; merges browsers on one machine, and phone app ⇄ phone browser |
| `first_seen`, `last_seen` | |
| `last_ip`, `last_geo` | abuse signals; see Privacy |
| `blocked_at`, `blocked_by` | per-device revoke |
| `source` | `native` \| `mirrored` (from `premium_devices`) |

UNIQUE `(email, center_id, device_key)`.

**Backfill:** existing `premium_devices` rows are copied in at migration time,
so the flagged list has real history on day one instead of being empty until
enough students sign in.

### `device_policy` (new table)

Per-account overrides and per-centre settings.

- `(email, center_id)` → `max_devices` (integer or `null` = unlimited),
  `status` (`normal` \| `blocked` \| `exempt`), `block_scope`
  (`center` \| `all`), `reason_note`, `updated_by`, `updated_at`
- Per-centre row: `auto_block_enabled` (default **false**), `default_limit` (3)

`reason_note` exists for the legal-agreement cases the admin described.

### `device-gate` (new Edge Function)

The single decision point. Clients never decide their own eligibility.

- **Input:** auth token, centre, device identity payload
- **Does:** upsert `device_sessions`, record IP/geo, evaluate policy
- **Returns:** `{ allowed, reason, lease_until, devices[] }`

Called at sign-in and roughly every 24h. With `auto_block_enabled = false` it
always returns `allowed: true` (detect-only) unless the account or device is
**manually** blocked — manual blocks are honoured regardless of the toggle.

### Device identity

| Platform | `device_key` source | Stability |
|---|---|---|
| Web | existing `device_id` (localStorage) + `hardware_fp` | survives normal use; lost on storage clear |
| Android | Android ID, cached in SecureStore | survives app updates |
| iOS | `identifierForVendor`, cached in SecureStore | survives updates; resets if all vendor apps removed |
| Windows / Mac | machine ID (hostname + MAC hash) | stable per install |

**Phone app ⇄ phone browser merge:** a native app and a browser cannot see each
other, so the merge matches model + OS + screen via `hardware_fp`.
**Accepted limitation:** two *identical* phone models on one account collapse
into one slot. It errs in the student's favour; the risk signals below catch the
egregious cases.

## Sharing signals

Device count alone is not the flag. Each signal is cheap SQL over data the
registry already collects, and each contributes to a risk score. Thresholds are
starting values, tunable in `device_policy` after real data arrives.

| Signal | Definition | Default threshold |
|---|---|---|
| **Concurrent sessions** | ≥2 devices active (heartbeat < 10 min) at once | ≥2 = flag; **≥2 simultaneous exam sessions = severe** |
| **Impossible travel** | two IPs whose distance ÷ elapsed time implies > 900 km/h | any occurrence in 7 days |
| **Distinct IP spread** | distinct /24 (IPv4) or /48 (IPv6) prefixes, trailing 7 days | ≥6 |
| **Device velocity** | new devices registered in a 48h window | ≥3 |

**Risk score** = weighted sum → `low` / `medium` / `high`. The queue sorts by
score, so the worst cases surface first. Simultaneous exam sessions carry the
heaviest weight: one person cannot sit two exams at once, which makes it the
strongest available evidence.

**Geo degradation:** impossible travel needs coarse geo. Use the CDN-provided
country/city header where available; where it is absent, degrade to
"different countries within 1 hour" rather than dropping the signal.

## Admin: Devices menu

New standalone page. Does not modify the premium panel.

- **Centre filter:** All centres · specific centre
- **Flagged list:** account, risk score, total slots, platform breakdown shown
  as `🌐 Web · 🤖 Android · 🍎 iOS · 🪟 Windows · 💻 Mac`, top contributing signal
- **Expand a row:** every device — platform, label, first/last seen, last city —
  plus the signal detail (e.g. "3 concurrent sessions, 2 cities, 14:20 today")
- **Actions per account:** Block · Allow · Set custom limit (number or
  unlimited) · Revoke a single device · **Reason note** (required on override)
- **Per-centre toggle:** *Auto-block over-limit accounts*, default **off** —
  lets Mock Stream pilot automation while the six clones stay detect-only

**Block scope:** `This centre only` (default) or `All centres`. Default is
per-centre because a genuine student attending two centres would otherwise be
cut off from both.

**Blocked-student UX:** an explicit message — "This device isn't authorised —
contact your centre" — never a silent failure, or the admin absorbs the
confusion as support messages.

## Privacy & retention

IP and coarse geo are collected solely for abuse detection. Raw IPs are retained
**90 days**, then truncated to /24 + city. No precise location, no GPS, no
third-party tracker. The devices table is admin-visible only, under the existing
admin RLS helpers.

## Phasing

1. **Detect only** — `device_sessions`, the mirror trigger, backfill, and
   registration in all three clients. Nothing blocks. Watch a week of real data.
2. **Devices menu** — flagged list, signals, manual block/allow/override.
3. **The gate** — `device-gate` honours blocks; the per-centre auto-toggle
   becomes meaningful. *Required even for manual blocking:* phase 1 can only
   observe, because a block needs a client that respects it.

**Later, deliberately (not in this spec):** premium content delivery validates
the lease server-side, closing the bypass available to a user who edits the web
client. Until then, enforcement stops sharing but not determined tampering —
stated plainly so the limitation is not discovered later.

## Verification

- Migration: existing `premium_devices` rows appear in `device_sessions`;
  `_device_count_for` returns **identical** values before and after (the
  regression guard — assert this explicitly).
- A device registered by each of the five platform identities appears with the
  correct `platform`.
- With `auto_block_enabled = false`, an account on 6 devices is **flagged but
  not blocked**.
- A manual block is honoured on all five platforms, and `This centre only` does
  not affect the same email at another centre.
- Each signal fires on a synthetic fixture and does not fire on a
  single-student-three-devices control case.
- **Scope guard:** a session using a daily activation code (no premium
  entitlement) creates **zero** rows in `device_sessions` on every platform.
