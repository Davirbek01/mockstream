# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Mock Stream** — a live English exam mock-test platform (CEFR + IELTS) used by real students. The repo deploys to **7 separate Cloudflare Pages projects** from this single repo — one per centre. (It was on Netlify until 2026-09-10; every Netlify build is now stopped and those sites are kept only as rollback targets.)

## Branch / deployment fan-out (critical to understand before pushing)

- `dev` branch → **only** the main site `mock-stream.com` (Pages project `mock-stream`). Use it as the canary / staging ground.
- `master` branch → simultaneously deploys to **6 student-facing clones**, each its own Pages project:
  1. `bekzodturgunovkx.com` (center id `bek`) — **also still served on the old
     `bekzodsmultilevel.com`**, which is being retired (decided 2026-09-13,
     "within a month"). Both answer today and serve identical builds. Telegram
     allows one `/setdomain` per bot, so the centre owns TWO login bots and TWO
     mini-app bots; the site picks between them by **hostname**, not centre id
     (`TELEGRAM_LOGIN_KEY_BY_HOST` in `index.html`, `landing-v3.html` and
     `site/tg-login.html` → key `bek_kx`). `verify-telegram-login` and
     `verify-telegram-initdata` try every token the centre owns, so either bot
     signs into the same account.
     ⚠️ The desktop and mobile apps still hardcode the OLD domain (runner
     `platform/telegramAuth.ts` + `platform/env.ts`, mobile `lib/telegramAuth.ts`
     + `config/flavor.ts`). They load the login bridge FROM that domain, so
     deleting it breaks Telegram sign-in and report links for every installed
     app. Switch those four and ship before the domain goes.
  2. `ninersacademy.com` (center id `niners`)
  3. `asrolingo.com` (center id `global` — rebranded to Asrolingo 2026-09-09; **the centre id stayed `global`**)
  4. `muzaffarsenglish.com` (center id `muzaffars`)
  5. `achieversmocks.com` (center id `achievers`)
  6. `multilevelrecord.com` (center id `record`)

  The old `*.netlify.app` addresses still answer, frozen at their last build. They are rollback targets — never probe them to verify a deploy.

All 7 sites (mock-stream.com + 6 clones) share identical code/content. They differ only by branding (logo, name) and per-center VIP code, both injected at runtime. Each Pages build overwrites `site/center-id.js` with `window.__CENTER_ID = '<id>';` — that ID is what `site/site-config/site-config.js` and `site/site-config/center-guard.js` (both in that subfolder, not in `site/` itself) use to fetch per-center settings from Supabase (`site_settings` rows keyed `center_config_<id>` and `center_site_config_<id>`), with a 5-min localStorage cache. To verify which centre any URL is serving: `curl https://<url>/center-id.js`.

**Workflow rule:** push to `dev`, verify on `mock-stream.com`, only then push to `master`. Never skip the dev step.

⚠️ **Some changes cannot be fully verified on `dev`, and pretending otherwise is
the trap.** Anything keyed on *hostname* — the two-domain Telegram bot selection
above is the live example — simply does not fire on `mock-stream.com`, because
that host is not in the map. There, `dev` can only prove two things: the new code
shipped, and nothing regressed for `mock_stream`. The behaviour itself is only
testable after `master`, on the domain that triggers it. Say which of the two you
actually verified rather than calling the dev check a pass.

## Production source: `site/` (no build step)

`site/` is plain HTML + JS, and it is the Pages **output directory**. There is no bundler, no transpile, no test runner for the production app. Edits to `.html` / `.js` under `site/` go straight to production on push.

Two directories at the repo root are **not** part of `site/` and are built separately by Pages:

- `functions/` — Cloudflare Pages Functions, one file per route. Currently the five Open Graph link-preview handlers (`/take/*`, `/vip`, `/vip/*`, `/Articles`, `/test`, `/flashcards`), ported from the Netlify edge functions that Pages cannot run. **Every file in here becomes a public route**, so shared code must live elsewhere.
- `og-shared/` — the helper those functions import. It sits outside `functions/` for exactly that reason.

`netlify.toml` and `netlify/edge-functions/` are **dead** — Pages does not read either. They are kept as the reference the port was made from; `site/_redirects` is what actually routes.

A few of the production page files are huge — `site/Speaking Mocks.html` ≈ 21.1k lines, `site/Writing Mocks.html` ≈ 19.5k, `site/IELTS Speaking Mocks.html` ≈ 17.6k, `site/full-mock.html` ≈ 11.6k, `site/Writing IELTS Mock.html` ≈ 11.5k, `site/ielts-full-mock.html` ≈ 9.5k. When working in them, **grep first, read targeted line ranges**; do not read the whole file.

⚠️ **There is no `site/Reading Mocks.html`** (this file used to claim there was). The reading pages are `site/CEFR Reading.html` + `site/CEFR Reading Mocks.html`, and `site/IELTS reading.html` + `site/IELTS Reading Mocks.html` — note the **lowercase** `reading` in the IELTS exam page but capitalised in its picker. Listening is the same shape: `site/CEFR Listening.html`, `site/IELTS listening.html`.

### Sibling apps that **never deploy**

`vite-app/` and `react-app/` are local-only pilots, both listed in `.gitignore` and excluded from Netlify. Don't mirror changes from `site/` into them unless explicitly asked. Both have `npm run dev` / `npm run build` scripts but only for local exploration.

`gtts-server/` is a small Flask service (`flask`, `flask-cors`, `gtts`) used to generate TTS audio for content authoring. Run with `python gtts-server/app.py`.

## Three-tier entry system (drives AI gating across all skills)

After a passcode is verified, sessionStorage flags determine what features are unlocked. Code shape dispatches the tier:

| Code | Backend | Sets | Tier semantics |
|---|---|---|---|
| 8-digit | `verify-passcode` Edge Function (Supabase) | `vipPremiumAi='true'` if `tier==='premium'`; or `vipSessionAccess='true'` only | Site-wide unlock |
| 10-digit | ~~`admin0709.alwaysdata.net/verify`~~ — **RETIRED** | `<skill>PremiumEntry='true'` (+ `speakingIndividualCode='premium'` for speaking) | Per-skill premium individual code — **legacy, no codes issued** |
| 12-digit | ~~`davirbek.alwaysdata.net/verify`~~ — **RETIRED** | `<skill>PremiumEntry='false'` (+ `speakingIndividualCode='regular'` for speaking) | Per-skill regular individual code — **legacy, no codes issued** |

⚠️ **alwaysdata is dead — only the 8-digit tier is live.** Checked 2026-09-13: `davirbek.alwaysdata.net` no longer resolves at all (no DNS record) and `admin0709.alwaysdata.net` answers **503**. Every code in the database is 8 digits — `mock_codes` 6,053 rows (all active) and `vip_codes` 14 — and there are **zero** 10- or 12-digit codes, so in practice the three-tier system is now one tier: an 8-digit code checked by `verify-passcode` through `site/mock-code-verifier.js`.

The dead calls are still in the source (`site/CEFR Reading Mocks.html`, `site/CEFR Listening Mocks.html`, and the admin gates in `site/admin/registered-users.js`, `site/admin/writing-plus.js`, `site/admin/system-prompts.js`, `site/chat-bubble.js`). Two shapes, and the difference matters if you ever touch them:

- The **10-digit** branches sit in their own `try/catch`, so a failure falls through to the 8-digit `verifyMockStreamCode` check below.
- The **12-digit** branches are **not** guarded. With DNS gone, `fetch` throws rather than returning a response, the function's outer `catch` swallows it, and it returns "Connection error" **without ever reaching the 8-digit fallback**. Unreachable today (no 12-digit code exists to get that far), but it is a live trap the moment anyone types a 12-character numeric string.

Admin panels gated on `admin0709` cannot unlock through those modals any more. The live admin mechanism is the `admin_passcodes` table + the `adminPasscode` argument that admin Edge Functions (e.g. `admin-mocks`) take.

⚠️ **`IELTS Reading Mocks.html`, `IELTS Listening Mocks.html`, `IELTS Speaking Mocks.html` and `ielts-full-mock.html` have no 8-digit fallback at all** — `verifyMockStreamCode` is simply not called there, so their only code paths are the two dead tiers. **This is not a bug, so don't "fix" it on sight:** `landing-v3.html` validates the code at its own gate and only then launches those pages (`_msv3LaunchIeltsFullMock()` → `/ielts-full-mock.html`; `IELTS Speaking Mocks.html?sbmock=…&auto=1`), and IELTS results keep arriving normally (54 reading / 50 speaking / 32 listening / 19 writing / 15 full-mock in the 14 days to 2026-09-13). The in-page verifiers are legacy, reached only by opening those pages directly. Adding the fallback there would be a new feature, not a repair.

Decision 2026-09-13: the dead branches stay. Removing ~20 call sites across ten 8k–21k-line live pages buys nothing visible and risks breaking an inline `<script>`. `landing.html` keeps its copies too — it is frozen.

**Auto AI analysis fires only when the page evaluates `isPremiumEntry === true`** at submit:

- Reading / Listening (CEFR + IELTS) gate the *entire backend submission flow*, not a separate AI call. Regular = spinner + backend; premium = jump to results modal. Flags: `readingPremiumEntry`, `listeningPremiumEntry`.
- Writing checks `writingPremiumEntry==='true' || vipPremiumAi==='true'`.
- Speaking is the odd one: if `speakingIndividualCode` is set, **only** that code's tier counts (VIP flag is ignored). Without it, falls back to `speakingPremiumEntry || vipPremiumAi`. This means a regular individual code on Speaking *masks* a session-wide VIP — Writing does not have this override.

Premium-gated UI on the result screens: transcripts (listening), Review Answers, Try Again, AI retry, model answers. All use the same flag.

Helpers: `site/auth.js` (Google sign-in + session restore), `site/mock-code-verifier.js` (8-digit code path).

## AI calls go through a proxy, never browser → provider

Pages must call AI via `site/ai-proxy-client.js` → `supabase/functions/ai-proxy/index.ts`. The Edge Function holds the provider keys (`GEMINI_API_KEY`, `OPENAI_API_KEY`, `CLAUDE_API_KEY`, `GROK_API_KEY`, `DEEPSEEK_API_KEY` — all set as Supabase function secrets), enforces an allowed-centers list (read from `site_settings` rows `center_config_*`), rate-limits per IP, and logs each call. See `supabase/DEPLOY_AI_PROXY.md` for the deploy/rotate procedure. `site/ai-proxy-interceptor.js` is the legacy shim that retrofits older pages.

## Content layout (per-skill)

**The main CEFR + IELTS mocks are no longer static files.** They live in Supabase `mock_tests`, keyed by `mock_type` + `mock_number`, and the per-mock `.js` files were deleted once migrated (CEFR Speaking's went in commit `22fb02e0`, "Phase 3d cleanup"). Counted 2026-09-12:

| `mock_type` | rows | `mock_type` | rows |
|---|---|---|---|
| `cefr-speaking` | 66 | `ielts-speaking` | 99 |
| `cefr-writing` | 104 | `ielts-writing` | 96 |
| `cefr-reading` | 71 | `ielts-reading` | 116 |
| `cefr-listening` | 59 | `ielts-listening` | 113 |
| `article` | 220 | `flashcard` | 507 |
| `grammar` | 402 | `vocabulary` | 342 |

Mock **media** (audio, images, covers) is on Cloudflare R2 at `audio.mock-stream.com`, referenced from inside `mock_data` — so moving a file is a DB update that reaches every platform at once, including old app builds, with no deploy.

What genuinely remains as static `.js` under `site/` is the **other exam families**:

- `site/questions KET L/` (28) · `site/questions KET RW/` (28)
- `site/questions PET L|R|W/` (8 each)
- `site/questions CAE RW/` (2) · `site/questions CPE RW/` (2) · `site/questions FCE L|RW/` (1 each) · `site/questions SAT/` (1)

⚠️ Paths this file used to list that **no longer exist**: `site/questions S/`, `site/questions W/`, `site/questions IELTS R/`, `site/questions IELTS W/`, `site/questions G/`, `site/questions V/`. And `site/questions CEFR L|R/`, `site/questions IELTS L|S/` and `site/questions Articles/` still exist but hold 1 or 0 `.js` — leftovers, not the live content. Check a folder before assuming it feeds anything.

`site/cefr-mock-config.js` and `site/ielts-mock-config.js` still exist and still declare counts / naming patterns for what is left.

CEFR Speaking structure: 8 questions across 4 parts. Q1–Q3 prep 5/speak 30, Q4 prep 10/speak 45, Q5–Q6 prep 5/speak 30, Q7–Q8 prep 60/speak 120. Defaults are hardcoded as `data-prep`/`data-speak` on `<details class="q">` in `site/Speaking Mocks.html`. Per-mock overrides used to come from the static `questions*.js` files; those are gone, so a mock's own timings now travel in its `mock_tests` row.

When the user says "speaking mock" without qualifier, default to **CEFR** (`Speaking Mocks.html`) — IELTS is a separate file.

## Supabase

- Project URL: `https://zknyukkbtbcqgvkgjktb.supabase.co`. Publishable anon key is committed in client code (it's safe to expose) — never commit the service role key.
- Migrations: `supabase/migrations/*.sql`, dated `20260423…` and forward. Stage 1 RLS lockdown is applied; treat anon access as locked-down by default and update the whitelist explicitly when adding new public reads.
- Edge Functions in `supabase/functions/` — **46 of them**, not the dozen this file used to list. Run `ls supabase/functions` for the real set rather than trusting a list here. Most often touched: `ai-proxy` (all AI traffic), `verify-passcode`, `codes-manager`, `send-to-telegram`, `report` / `report-locked`, `guest-results`, `check-mock-limit`, `transcribe-audio`, `web-push` / `send-push`, the watchers (`daily-health-check`, `ai-credit-watch`, `unscored-watch`, `shared-account-watch`), and the bot/auth webhooks (`telegram-bot-webhook`, `telegram-center-bot`, `news-bot-webhook`, `verify-telegram-login`, `verify-telegram-initdata`).
- ⚠️ **Several functions must be deployed with `--no-verify-jwt`, `ai-proxy` above all.** A redeploy that silently reset it on 2026-09-11 made the gateway reject every scoring call *before the function ran* — so nothing was logged, every provider alarm reported healthy, and 268 submissions came back unscored over 24 h.
- Deploy guides: `supabase/DEPLOY_AI_PROXY.md`, `supabase/DEPLOY_ADMIN_LOCKDOWN.md`.

## Service worker — bump the cache version

`site/sw.js` uses a network-first strategy for HTML/JS and cache-first for icons. The cache name has a version suffix — currently `mockstream-v1043`. **Bump it any time you change the precached shell or want to force clients to drop stale assets** — otherwise users keep serving the old version from cache.

## Smoke / probe scripts (root)

- `smoke_test.ps1` — fans out a test POST to `send-to-telegram` for each (center × skill) combination and prints OK/FAIL counts. Run after touching anything in the Telegram routing path.
- `probe_rest.ps1` — quick GETs against several `rest/v1/<table>` endpoints to verify RLS / publishable-key access.

Both are PowerShell. There is no other test runner in this repo.

## Auxiliary tools and portals

- `site/Tools/*-builder.html` — content authoring UIs (test-builder, listening/reading/writing/speaking-maker, flashcard-builder, article-builder).
- `site/mock examiner portals/{Full mock,Listening,Reading mocks,Speaking mocks,Writing mocks}/` — examiner-side review pages.
- `site/results/{index,view,my-results}.html` — student results history.

## Things to avoid

- Don't deploy `vite-app/` or `react-app/`. They're gitignored on purpose.
- Don't add direct browser-to-AI-provider calls; route through `ai-proxy`.
- Don't widen `site_settings` anon read whitelist without reviewing `supabase/migrations/` for the active RLS policies.
- Don't push to `master` before verifying the change live on `mock-stream.com` from `dev`.
