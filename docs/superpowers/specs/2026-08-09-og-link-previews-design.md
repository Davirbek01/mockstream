# Telegram/OG link-preview covers for shared mock links

**Date:** 2026-08-09
**Status:** design approved; covers pending visual approval
**Scope:** web only (all 7 Netlify sites, one repo/deploy). Apps unaffected.

## Problem

Sharing a mock link in Telegram shows a bare URL — no cover, no title. The
share buttons produce `/take/<exam>-<skill>-<n>` links (e.g.
`/take/cefr-reading-45`); `site/_redirects` rewrites `/take/*` to
`/landing-v3.html?take=:splat` (200), and that HTML contains **zero `og:`
tags**. Crawlers never see `#hash` state, but here the identity is in the
PATH, so per-link previews are fully possible.

## Decisions

- **Covers are centre-neutral** (decided 2026-08-09): 8 images = exam
  (CEFR/IELTS) × skill (listening/reading/writing/speaking), 1200×630.
  Exam-family colours (IELTS red, CEFR blue), skill icon, "Mock Exam"
  wording, no centre logo. One set serves all 7 centres; centre identity
  shows via the preview's domain line.
- **Titles are generic patterns** — "CEFR Reading · Mock 45" — derived from
  the slug alone. No Supabase lookup in the edge function (fast,
  dependency-free; mock numbers are how students refer to mocks anyway).
- Images live in `site/og/*.png` and deploy with the site, so each centre
  serves them from its own domain (edge function builds the absolute URL
  from the request host). Static pages, which cannot know their domain, use
  a GCS copy of the same neutral images.

## Components

### 1. Cover images — `site/og/{cefr,ielts}-{listening,reading,writing,speaking}.png`

Generated with Pillow (script kept in scratchpad; regeneration is cheap).
1200×630, < 300 KB each. **Visual approval by Davirbek before shipping.**

### 2. Edge function — `netlify/edge-functions/og-take.ts` on `/take/*` only

First edge function in the repo — `netlify.toml` gains:

```toml
[[edge_functions]]
  path = "/take/*"
  function = "og-take"
```

Behaviour: parse `<exam>-<skill>-<n>` from the path; fetch
`/landing-v3.html` from origin; inject before `</head>`:
`og:title`, `og:description` ("Sit the mock online — timed, auto-scored,
with AI feedback."), `og:image` (absolute, request host), `og:url`,
`og:type=website`, `twitter:card=summary_large_image`.

- Unknown/malformed slug → generic title "Mock Exam", default cover
  (`cefr-reading.png`), page still served — never an error.
- No user-agent sniffing: everyone gets the injected HTML (byte-identical
  visually; tags are inert for browsers).
- The `?take=` query the redirect used to add is preserved by serving the
  same rewrite target the redirect served (the function replaces the
  rewrite for these paths — MUST verify the picker still opens the right
  mock after deploy).

### 3. Static OG tags — hand-written into `full-mock.html`,
`ielts-full-mock.html`, `landing-v3.html`

Full-mock pages use the matching GCS-hosted neutral cover; landing uses a
generic one. The 32 skill pages are excluded (share buttons never produce
direct links to them); adding later is mechanical.

## Rollout & verification

1. **Dev first** — first edge function = deploy risk. Verify on the dev
   site: `curl -A TelegramBot` a `/take/` URL → injected tags present;
   plain browser load → picker opens the correct mock (the rewrite
   behaviour survived); malformed slug → generic tags + working page.
2. Telegram caches previews per-URL — old links need a poke via
   **@WebpageBot** ("refresh link preview"); new links preview immediately.
3. Master merge only after Davirbek confirms the dev preview in real
   Telegram.

## Non-goals

- Per-mock unique artwork or real mock titles in previews.
- Centre-branded covers (56-image matrix) — revisit only if a partner asks.
- Learn/article/other link families — same mechanism extends later.
