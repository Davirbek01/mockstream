# AI Proxy — Deploy Guide (step-by-step, zero-coder friendly)

Goal: move Gemini (and other AI) calls off the browser into a Supabase Edge Function,
block fake centers like `examify`, rate-limit per IP, and log every call.

---

## Part A — Run the SQL (creates logs + blocklist + optional limits)

1. Open Supabase Dashboard → your project **Project Alpha**.
2. Left sidebar → **SQL Editor** → **New query**.
3. Open the file `supabase/migrations/20260423000000_ai_abuse_protection.sql` in VS Code.
4. Copy ALL of it → paste into the SQL Editor → click **Run**.
5. You should see: *Success. No rows returned.*

No center list is hardcoded. The Edge Function reads your existing
`site_settings` rows (`center_config_{testId}`) which the Center Hub
admin UI already writes. Whenever you add a new center in the Center
Hub, it is instantly accepted by the proxy — no extra step.

Verify the centers the Edge Function will accept:

    SELECT
      regexp_replace(key, '^center_config_', '') AS center_id,
      COALESCE((value::jsonb->>'active')::boolean, true) AS active
    FROM site_settings
    WHERE key LIKE 'center_config_%'
    ORDER BY 1;

Any `testId` that does NOT appear here (e.g. `examify`) will be rejected.

---

## Part B — Rotate and store the Gemini key (critical, do this NOW)

1. Open Google AI Studio → **API keys**.
2. Create a **new** API key.
3. **DELETE / disable the OLD key** (this stops current abuse).
4. In Google AI Studio, set a **daily quota** on the new key as a safety cap
   (Project settings → quotas).
5. In Supabase Dashboard → **Project Settings → Edge Functions → Secrets**
   → click **Add new secret**:
   - Name:  `GEMINI_API_KEY`
   - Value: the new key
6. (Optional) add other providers the same way:
   - `OPENAI_API_KEY`
   - `CLAUDE_API_KEY`
   - `GROK_API_KEY`
   - `DEEPSEEK_API_KEY`
7. (Optional) `RATE_LIMIT_PER_10MIN` = `20` (default is already 20).
8. (Optional) `AI_DAILY_CAP_DEFAULT` = `500` — used only when a center
   has **Daily Mock Limit = 0** (unlimited) in the Center Hub.

Per-center AI limit: set each center's **Daily Mock Limit** field in the
Center Hub (Limits & Quotas section). The Edge Function reads that
value directly — change it in the UI and it takes effect on the very
next request. No SQL, no redeploy.

DO NOT put the new key anywhere in your Git repo or in `davirbek.alwaysdata.net/key`.

---

## Part C — Deploy the Edge Function

You need the Supabase CLI once. In VS Code terminal:

    npm install -g supabase

Log in and link the project (run once):

    supabase login
    supabase link --project-ref zknyukkbtbcqgvkgjktb

Deploy:

    supabase functions deploy ai-proxy --no-verify-jwt

Test from terminal:

    curl -X POST https://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/ai-proxy ^
      -H "Content-Type: application/json" ^
      -H "apikey: sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2" ^
      -d "{\"provider\":\"gemini\",\"centerId\":\"mock_stream\",\"skill\":\"chat\",\"userPrompt\":\"Say hi in 3 words\"}"

Expected: `{"text":"..."}`.

Test a fake center (should be rejected):

    curl -X POST https://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/ai-proxy ^
      -H "Content-Type: application/json" ^
      -H "apikey: sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2" ^
      -d "{\"provider\":\"gemini\",\"centerId\":\"examify\",\"skill\":\"chat\",\"userPrompt\":\"hi\"}"

Expected: `403 {"error":"center not allowed"}`.

---

## Part D — Switch the browser to use the proxy

1. Copy `site/ai-proxy-client.js` is already created in your repo.
2. In each HTML page that does AI grading/chat, add this line in `<head>`
   BEFORE the scripts that call the AI:

       <script src="/ai-proxy-client.js"></script>

   Files to update (the ones your grading uses):
   - `site/full-mock.html`
   - `site/ielts-full-mock.html`
   - `site/IELTS Speaking Mocks.html`
   - `site/Writing Mocks.html`
   - `site/Writing IELTS Mock.html`
   - `site/Writing Plus.html`
   - `site/Listening Plus.html`
   - `site/chat-bubble.js` (loaded already on all pages — you can replace its inline Gemini fetches too)

3. Inside each `_callScoringAI` function (same pattern in every HTML file),
   replace the provider-specific fetch block with a single call:

       // instead of: fetch('https://generativelanguage.googleapis.com/...')
       return await window.AIProxy.call({
         provider:    provider,
         centerId:    (window.__CENTER_ID || 'mock_stream'),
         skill:       (opts && opts.skill) || 'writing',
         systemText:  systemText,
         userPrompt:  userPrompt,
         contentParts: opts && opts.contentParts,
         temperature: opts && opts.temperature,
         maxTokens:   opts && opts.maxTokens,
         jsonMode:    opts && opts.jsonMode,
         model:       opts && opts.model
       });

   Do this for `gemini`, `openai`, `claude`, `grok`, `deepseek` branches
   (the proxy handles the provider selection on the server).

4. Remove (or stop calling) `fetch('https://davirbek.alwaysdata.net/key...')`
   anywhere it appears — the browser no longer needs API keys.

---

## Part E — Monitor and block abusers

Run in SQL Editor to watch live:

    SELECT * FROM v_ai_abuse_watch LIMIT 50;

Top offender’s IP will be at the top. To ban:

    INSERT INTO blocked_ips (ip, reason)
    VALUES ('1.2.3.4', 'examify abuse');

Unban:

    DELETE FROM blocked_ips WHERE ip = '1.2.3.4';

Full recent log:

    SELECT created_at, ip, center_id, provider, skill, status, error_message
    FROM ai_submission_logs
    ORDER BY created_at DESC
    LIMIT 200;

---

## Part F — Verify it works, then harden `results` table

After a few real users successfully submit via the new flow (check
`ai_submission_logs` status = 'ok' and new rows in `results`),
you can tighten the `results` table so only the Edge Function can insert:

    ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "results_anon_insert"  ON public.results;
    DROP POLICY IF EXISTS "results_public_insert" ON public.results;
    -- keep read policies as needed by dashboards

From that point, fake centers cannot even land rows in `results` —
the Edge Function is the only path in, and it already rejects unknown centers.
