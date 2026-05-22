# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Mock Stream** — a live English exam mock-test platform (CEFR + IELTS) used by real students. The repo deploys to **6 separate Netlify "center" sites** from this single repo.

## Branch / deployment fan-out (critical to understand before pushing)

- `dev` branch → **only** the main site `mock-stream.com`. Use it as the canary / staging ground.
- `master` branch → simultaneously deploys to **6 student-facing clones**:
  1. `bekzodsmultilevel.com` (center id `bek`)
  2. `ninersacademy.com` (center id `niners`)
  3. `global-education.netlify.app` (center id `global`)
  4. `muzaffars-english.netlify.app` (center id `muzaffars`)
  5. `acheivers-mocks.netlify.app` (center id `achievers` — the "acheivers" misspelling in the subdomain is intentional)
  6. `multilevelrecord.com` (center id `record`)

All 7 sites (mock-stream.com + 6 clones) share identical code/content. They differ only by branding (logo, name) and per-center VIP code, both injected at runtime. Each Netlify build overwrites `site/center-id.js` with `window.__CENTER_ID = '<id>';` — that ID is what `site/site-config/site-config.js` and `center-guard.js` use to fetch per-center settings from Supabase (`site_settings` rows keyed `center_config_<id>` and `center_site_config_<id>`), with a 5-min localStorage cache. To verify which centre any URL is serving: `curl https://<url>/center-id.js`.

**Workflow rule:** push to `dev`, verify on `mock-stream.com`, only then push to `master`. Never skip the dev step.

## Production source: `site/` (no build step)

`site/` is plain HTML + JS. Netlify serves it as-is. There is no bundler, no transpile, no test runner for the production app. Edits to `.html` / `.js` under `site/` go straight to production on push.

A few of the production page files are huge (`site/Speaking Mocks.html` ≈ 20.9k lines, `site/Writing Mocks.html`, `site/Reading Mocks.html` are also large). When working in them, **grep first, read targeted line ranges**; do not read the whole file.

### Sibling apps that **never deploy**

`vite-app/` and `react-app/` are local-only pilots, both listed in `.gitignore` and excluded from Netlify. Don't mirror changes from `site/` into them unless explicitly asked. Both have `npm run dev` / `npm run build` scripts but only for local exploration.

`gtts-server/` is a small Flask service (`flask`, `flask-cors`, `gtts`) used to generate TTS audio for content authoring. Run with `python gtts-server/app.py`.

## Three-tier entry system (drives AI gating across all skills)

After a passcode is verified, sessionStorage flags determine what features are unlocked. Code shape dispatches the tier:

| Code | Backend | Sets | Tier semantics |
|---|---|---|---|
| 8-digit | `verify-passcode` Edge Function (Supabase) | `vipPremiumAi='true'` if `tier==='premium'`; or `vipSessionAccess='true'` only | Site-wide unlock |
| 10-digit | `admin0709.alwaysdata.net/verify` | `<skill>PremiumEntry='true'` (+ `speakingIndividualCode='premium'` for speaking) | Per-skill premium individual code |
| 12-digit | `davirbek.alwaysdata.net/verify` | `<skill>PremiumEntry='false'` (+ `speakingIndividualCode='regular'` for speaking) | Per-skill regular individual code |

**Auto AI analysis fires only when the page evaluates `isPremiumEntry === true`** at submit:

- Reading / Listening (CEFR + IELTS) gate the *entire backend submission flow*, not a separate AI call. Regular = spinner + backend; premium = jump to results modal. Flags: `readingPremiumEntry`, `listeningPremiumEntry`.
- Writing checks `writingPremiumEntry==='true' || vipPremiumAi==='true'`.
- Speaking is the odd one: if `speakingIndividualCode` is set, **only** that code's tier counts (VIP flag is ignored). Without it, falls back to `speakingPremiumEntry || vipPremiumAi`. This means a regular individual code on Speaking *masks* a session-wide VIP — Writing does not have this override.

Premium-gated UI on the result screens: transcripts (listening), Review Answers, Try Again, AI retry, model answers. All use the same flag.

Helpers: `site/auth.js` (Google sign-in + session restore), `site/mock-code-verifier.js` (8-digit code path).

## AI calls go through a proxy, never browser → provider

Pages must call AI via `site/ai-proxy-client.js` → `supabase/functions/ai-proxy/index.ts`. The Edge Function holds the provider keys (`GEMINI_API_KEY`, `OPENAI_API_KEY`, `CLAUDE_API_KEY`, `GROK_API_KEY`, `DEEPSEEK_API_KEY` — all set as Supabase function secrets), enforces an allowed-centers list (read from `site_settings` rows `center_config_*`), rate-limits per IP, and logs each call. See `supabase/DEPLOY_AI_PROXY.md` for the deploy/rotate procedure. `site/ai-proxy-interceptor.js` is the legacy shim that retrofits older pages.

## Content layout (per-skill)

Mock content lives in per-skill directories under `site/`:

- CEFR Speaking: `site/questions S/questions.js` (mock 01) and `questions02.js`–`questions65.js`. Each sets `window.SPEAKING_TEST_DATA`. Audio at `site/questions S/audio/cefr-speaking-mock-NN-qN.mp3`.
- CEFR Listening: `site/questions CEFR L/cefr-listening-test-NN.js`
- CEFR Reading: `site/questions CEFR R/cefr-reading-test-NN.js`
- CEFR Writing: `site/questions W/cefr-mock-NN.js`
- IELTS variants: `site/questions IELTS L|R|S|W/`
- Articles, grammar, vocab: `site/questions Articles|G|V/`

Counts and naming patterns are declared in `site/cefr-mock-config.js` and `site/ielts-mock-config.js` — bump these when adding new mocks. Dynamic mocks created via the admin UI are loaded from Supabase (`mock_tests` table) on top of the static set.

CEFR Speaking structure: 8 questions across 4 parts. Q1–Q3 prep 5/speak 30, Q4 prep 10/speak 45, Q5–Q6 prep 5/speak 30, Q7–Q8 prep 60/speak 120. Defaults are hardcoded as `data-prep`/`data-speak` on `<details class="q">` in `site/Speaking Mocks.html`; per-mock JS files override via `prepTime`/`speakTime`.

When the user says "speaking mock" without qualifier, default to **CEFR** (`Speaking Mocks.html`) — IELTS is a separate file.

## Supabase

- Project URL: `https://zknyukkbtbcqgvkgjktb.supabase.co`. Publishable anon key is committed in client code (it's safe to expose) — never commit the service role key.
- Migrations: `supabase/migrations/*.sql`, dated `20260423…` and forward. Stage 1 RLS lockdown is applied; treat anon access as locked-down by default and update the whitelist explicitly when adding new public reads.
- Edge Functions in `supabase/functions/`: `verify-passcode`, `ai-proxy`, `codes-manager`, `send-to-telegram`, `routing-proxy`, `support-bot`, `telegram-bot-webhook`, `telegram-center-bot`, `validate-vip-token`, `authorize-finish`, `admin-ips`, `get-promo-code`.
- Deploy guides: `supabase/DEPLOY_AI_PROXY.md`, `supabase/DEPLOY_ADMIN_LOCKDOWN.md`.

## Service worker — bump the cache version

`site/sw.js` uses a network-first strategy for HTML/JS and cache-first for icons. The cache name has a version suffix (e.g. `mockstream-v11`). **Bump it any time you change the precached shell or want to force clients to drop stale assets** — otherwise users keep serving the old version from cache.

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
