# Center-Specific Mock Visibility — Design Spec

- **Date:** 2026-07-06
- **Status:** PLANNED — not started. Near-future plan, not urgent. Pick up later.
- **Owner:** davirbekkhasanov02@gmail.com (super-admin / platform owner)
- **Announced to partners:** Yes (Telegram, 2026-07-05) — "your mocks appear only on your site + main". So the promise is public; honor it on every student-facing surface before tagging any mock.

## 1. Policy
A mock is either **public** (all 7 sites) or **restricted** to specific centres. Restricted = appears **only** on those centres **plus Mock Stream (main), always**. On every other site it is **completely absent** — no card, no badge, no "coming soon". This is **soft-hide**: the row stays in the shared `mock_tests` table, just never listed on non-owning sites. Mock numbers remain **one global consecutive sequence** (an exclusive mock consumes a global number; other clones simply skip that number).

### Three distinct states (do not conflate)
| State | Trigger | Non-owning clone shows |
|---|---|---|
| Coming soon 🕓 | number not built/ready | visible greyed card |
| Deactivated 🚫 | `status='deactivated'` (global) | visible "Unavailable" card, on ALL sites |
| **Center-hidden (NEW)** | `visible_centers` excludes this site | **nothing at all** |

## 2. Locked decisions (confirmed by owner)
1. **Soft-hide** (row stays in DB; absent from lists). Accepted trade-off: a direct `?sbmock=<internal id>` on a non-owning clone could still load content if someone knows the id — acceptable; hard-hide is out of scope.
2. **Natural consecutive global numbering** — no per-centre renumbering, no reserved band.
3. **Main (`mock_stream`) always sees everything.**
4. **Admin control = dedicated owner-only panel in `admin.html`** (not build-time only) so visibility can be **changed later** (e.g. flip an exclusive mock to public once a partner agrees).
5. **Rollout order:** web + mobile + desktop (student surfaces) first, then Telegram bots + PDF. No mock is tagged exclusive until the student surfaces are live → zero leak window.

## 3. Data model
Add one nullable column to `mock_tests`:
```sql
ALTER TABLE public.mock_tests ADD COLUMN visible_centers text[];  -- default NULL
```
- `NULL` / empty ⇒ **public** (all sites). All ~565 existing mocks stay NULL ⇒ zero behavior change.
- `['record']` ⇒ record + main only.
- **Never store `'mock_stream'`** in the array — main is always-included by code rule.

**Why a real column (not a `mock_data` JSON key):**
- `admin-mocks` `update` action passes its `patch` straight to `.from('mock_tests').update(patch)` — so writing `visible_centers` needs **no function change** (only `create` needs one line to include it, or create-then-update).
- Server-side filterable in one PostgREST param.
- Web writing/reading pickers fetch only `id,mock_number,title` — a column lets them filter without also pulling `mock_data`.

## 4. Visibility predicate (identical everywhere)
For a site whose centre id is `cid`:
> **show** if `cid is main` OR `visible_centers IS NULL` OR `cid = ANY(visible_centers)`

- **Main detection:** `window.__CENTER_ID` ∈ {undefined, `''`, `mock_stream`, `mockstream`} ⇒ main ⇒ apply **no** filter.
- **Server-side (PostgREST):** append `&or=(visible_centers.is.null,visible_centers.cs.{<cid>})`; main omits it.
- **Client libs (mobile/desktop):** same boolean check after fetch, or push into the query.

## 5. Surfaces & filter locations
| Surface | File(s) | Change | Ship |
|---|---|---|---|
| Web hubs | `Mock Stream/site/landing-v3.html` — ~8 pickers (cspet/ispet/cwet/iwet/clet/ilet/cret/iret) | add REST filter to each mock-list fetch **+ "absent-not-coming-soon" fix** for contiguous-range pickers (writing/reading loop 1..N; a hidden number must be SKIPPED, never rendered "coming soon") | dev push → cherry-pick master per-clone (confirm each master push) |
| Mobile | `mockstream-mobile` central mock-list fetch (RN) + flavor centre | one filter | OTA |
| Desktop | `mockstream-runner/src/lib/mocks.ts` + `src/config/flavor.ts` (+ `CenterConfigContext`) | one filter | **mechanism TBD** — confirm if runner is bundled (needs app release) or loads a hosted feed (web-deploy updates it) |
| Telegram bots | `supabase/functions/telegram-center-bot`, `telegram-bot-webhook` — mock-list queries | filter by the bot's centre | `supabase functions deploy … --no-verify-jwt` (shared backend, all sites at once) |
| PDF | `print-mock.html` + `mock-pdf` Netlify fn | filter the mock list/serve | dev + clones |
| Deactivated-merge | `mock_availability_map` RPC | must ALSO respect visibility, else a hidden mock can appear as 🚫 on a non-owning clone | migration |

Reference: web reads `__CENTER_ID` via `_resolveCenter()` (landing-v3 ~line 33) and per-picker fetches like `landing-v3.html:9527` (cspet), `:10466`/`:10694` (cwet writing), `:11046` (iwet). Speaking picker renders **present keys only** (`_cspetRenderAll`, ~line 9685) ⇒ naturally absent, no coming-soon fix needed. Writing/IELTS-writing use contiguous loops (`for i=2;i<=100` ~line 10442; `for i=2;i<=30` ~line 11028) ⇒ these need the absent-not-coming-soon fix. **Re-verify all line numbers at implementation time — file changes.**

## 6. Admin panel — "Center-Specific Mocks" (owner-only, in `admin.html`)
- New super-admin card/panel matching `admin.html` style.
- Lists mocks (skill filter + search). Each row shows current visibility: **"Public (all)"** or **"Only: record, bek"**.
- Per mock: a 6-centre multi-select (bek, niners, global, muzaffars, achievers, record). **Main shown as always-on, non-editable.**
- Save ⇒ `admin-mocks` `update` `{ id, patch:{ visible_centers:[…] } }` (empty ⇒ `null` ⇒ public).
- Quick **"Make public"** action.
- Live change, no rebuild.

## 7. Codes auto-gen trigger tweak
`public.autogen_mock_codes()` (migration `20260703180000`) currently mints Regular+Premium for **all 7 centres** on publish. Change:
- If `visible_centers` is set ⇒ mint only for those centres **+ main**; if `NULL` ⇒ all 7 (unchanged).
- **Flip exclusive→public** in panel ⇒ mint the now-missing centres' codes (panel action, or a trigger on `visible_centers` change).
- **Flip public→exclusive** ⇒ other centres' codes become unused (harmless under soft-hide; optional cleanup later — codes unlock nothing that isn't listed).
- Keep the non-blocking inner `BEGIN/EXCEPTION` pattern.

## 8. Edge cases
- **Direct URL** on non-owning clone: soft-hide, may still load if internal id known — accepted.
- **Number/count panel** (`get_mock_counts` union-max): an exclusive #66 still bumps the global per-skill ceiling — correct (numbers are global); only its codes are centre-scoped.
- **Backups:** extend `snapshotMock` + `mock_tests_backups` to carry `visible_centers` so Restore preserves visibility (small add; otherwise restore resets a mock to public).
- **Main id variants:** treat `mock_stream` AND `mockstream` (and unset/empty) as main.

## 9. Safety on 7 live sites
- Column is additive + nullable + default NULL ⇒ no behavioral change until a mock is tagged.
- Predicate treats NULL as public ⇒ fully backward-compatible.
- No mock tagged until student surfaces (web+mobile+desktop) are verified live ⇒ no leak window.
- Every surface verified on localhost/dev before master/clone pushes; master pushes confirmed per-push.
- Engine-migration freeze still applies: cherry-pick single commits to master, no full dev→master merges.

## 10. Phase plan
- **Phase 0 — DB:** add `visible_centers`; update `autogen_mock_codes` + `mock_availability_map` (+ backups col). Invisible; nothing tagged.
- **Phase 1 — Web:** 8 picker filters + absent-not-coming-soon fix + `admin.html` panel. Verify localhost + dev → clones.
- **Phase 2 — Apps:** mobile (OTA) + desktop (mechanism TBD). ← **after this, owner may start tagging exclusive mocks.**
- **Phase 3 — Listers:** Telegram bots + PDF.
Each phase independently shippable with its own verification gate.

## 11. Open items to resolve at implementation
1. Desktop ship mechanism (bundled runner vs hosted feed).
2. Exact current line numbers for each web picker fetch + render loop (re-grep).
3. Whether `mock_availability_map` should take a `p_center_id` param, or filter client-side after the RPC.
4. Whether to auto-clean orphan codes on public→exclusive flip (probably not — harmless).

## Key reference facts (so future pickup is fast)
- Supabase project `zknyukkbtbcqgvkgjktb`; anon key `sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2`.
- `mock_tests` cols: `id, mock_type, mock_number, title, status, mock_data, created_at, updated_at` (+ new `visible_centers`).
- `admin-mocks` `update` = raw patch passthrough (super_admin only, passcode gate). `create` builds an explicit row (add `visible_centers` there).
- Centre ids: `bek, niners, global, muzaffars, achievers, record`, main = `mock_stream`.
- Branches: `dev` → mock-stream.com only; `master` → 6 clones. Content lives in shared Supabase (no push needed for data).
