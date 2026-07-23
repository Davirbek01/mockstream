#!/usr/bin/env python3
# =============================================================================
# Mock Stream — monthly AI provider/model health check
# -----------------------------------------------------------------------------
# Probes EVERY model wired into the platform through the ai-proxy Edge Function
# with page-shaped requests, plus catalog checks for silent retirements
# (Groq killed Llama-4-Scout + Qwen3-32B and Google killed gemini-3-pro-preview
# without any error surfacing to admins — that's why this exists).
#
# Run:  python ai_health_check.py        → prints PASS/FAIL table, exit 1 on any FAIL
# Cost: ~20 tiny calls (max ~30 tokens each) ≈ well under $0.01 total.
# =============================================================================
import json, sys, time, urllib.request

BASE = "https://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/ai-proxy"
HDRS = {"Content-Type": "application/json",
        "apikey": "sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2",
        "Authorization": "Bearer sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2",
        "x-ms-center": "mock_stream"}

results = []

def call(path, body=None, method="POST", timeout=90):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method, headers=HDRS)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())

def check(name, fn):
    t0 = time.time()
    try:
        fn()
        results.append((name, True, "%.1fs" % (time.time() - t0)))
    except Exception as e:
        try: detail = e.read().decode()[:160]
        except Exception: detail = str(e)[:160]
        results.append((name, False, detail))

def openai_chat(path, model, extra=None):
    body = {"model": model, "messages": [{"role": "user", "content": "Say OK"}]}
    body.update(extra or {})
    j = call(path, body)
    assert j["choices"][0]["message"] is not None

# ── Primary scorer tiers (exact strings the tier buttons set) ────────────────
check("gemini gemini-3.1-flash-lite", lambda: call(
    "/gemini/v1beta/models/gemini-3.1-flash-lite:generateContent",
    {"contents": [{"parts": [{"text": "Say OK"}]}], "generationConfig": {"temperature": 0.3, "maxOutputTokens": 200}}))
check("gemini gemini-flash-latest", lambda: call(
    "/gemini/v1beta/models/gemini-flash-latest:generateContent",
    {"contents": [{"parts": [{"text": "Say OK"}]}], "generationConfig": {"temperature": 0.3, "maxOutputTokens": 200}}))
check("gemini gemini-2.5-pro", lambda: call(
    "/gemini/v1beta/models/gemini-2.5-pro:generateContent",
    {"contents": [{"parts": [{"text": "Say OK"}]}], "generationConfig": {"temperature": 0.3, "maxOutputTokens": 400}}))

check("openai gpt-5.4-nano", lambda: openai_chat("/openai/v1/chat/completions", "gpt-5.4-nano", {"temperature": 0.3, "max_completion_tokens": 300}))
check("openai gpt-5.4-mini", lambda: openai_chat("/openai/v1/chat/completions", "gpt-5.4-mini", {"temperature": 0.3, "max_completion_tokens": 300}))
check("openai gpt-5.4 (no temp)", lambda: openai_chat("/openai/v1/chat/completions", "gpt-5.4", {"max_completion_tokens": 300}))
check("openai gpt-4o-mini (vision helper)", lambda: openai_chat("/openai/v1/chat/completions", "gpt-4o-mini", {"temperature": 0.3, "max_tokens": 30}))

def claude(model):
    j = call("/claude/v1/messages", {"model": model, "max_tokens": 10, "messages": [{"role": "user", "content": "Say OK"}]})
    assert j["content"][0]["text"]
check("claude claude-haiku-4-5", lambda: claude("claude-haiku-4-5"))
check("claude claude-sonnet-5", lambda: claude("claude-sonnet-5"))
check("claude claude-opus-4-8", lambda: claude("claude-opus-4-8"))

check("grok grok-4.20-0309-non-reasoning", lambda: openai_chat("/grok/v1/chat/completions", "grok-4.20-0309-non-reasoning", {"temperature": 0.3, "max_tokens": 30}))
check("grok grok-4.3", lambda: openai_chat("/grok/v1/chat/completions", "grok-4.3", {"temperature": 0.3, "max_tokens": 30}))
check("grok grok-4.5", lambda: openai_chat("/grok/v1/chat/completions", "grok-4.5", {"temperature": 0.3, "max_tokens": 30}))
check("grok grok-3-mini (legacy default)", lambda: openai_chat("/grok/v1/chat/completions", "grok-3-mini", {"temperature": 0.3, "max_tokens": 30}))

check("deepseek deepseek-chat", lambda: openai_chat("/deepseek/chat/completions", "deepseek-chat", {"temperature": 0.3, "max_tokens": 30}))
check("deepseek deepseek-reasoner", lambda: openai_chat("/deepseek/chat/completions", "deepseek-reasoner", {"max_tokens": 100}))

check("groq llama-3.1-8b-instant", lambda: openai_chat("/groq/openai/v1/chat/completions", "llama-3.1-8b-instant", {"temperature": 0.3, "max_tokens": 30}))
check("groq llama-3.3-70b-versatile", lambda: openai_chat("/groq/openai/v1/chat/completions", "llama-3.3-70b-versatile", {"temperature": 0.3, "max_tokens": 30}))
check("groq qwen/qwen3.6-27b", lambda: openai_chat("/groq/openai/v1/chat/completions", "qwen/qwen3.6-27b", {"temperature": 0.3, "max_tokens": 300}))
check("groq openai/gpt-oss-120b", lambda: openai_chat("/groq/openai/v1/chat/completions", "openai/gpt-oss-120b", {"temperature": 0.3, "max_tokens": 300}))

# ── Helpers ──────────────────────────────────────────────────────────────────
def groq_whisper_listed():
    j = call("/groq/openai/v1/models", method="GET")
    ids = {m["id"] for m in j.get("data", [])}
    assert "whisper-large-v3-turbo" in ids, "whisper-large-v3-turbo missing from Groq catalog"
check("groq whisper-large-v3-turbo (transcriber, catalog)", groq_whisper_listed)
check("assemblyai (transcriber backup)", lambda: call("/assemblyai/v2/transcript?limit=1", method="GET"))

# ── Catalog diffs: names the platform depends on must still exist ────────────
def catalog(path, needed, field="id", wrap="data"):
    j = call(path, method="GET")
    ids = {m[field] for m in j.get(wrap, [])}
    missing = [x for x in needed if x not in ids]
    assert not missing, "RETIRED from catalog: " + ", ".join(missing)
check("grok catalog (4.20/4.3/4.5 present)", lambda: catalog(
    "/grok/v1/models", ["grok-4.20-0309-non-reasoning", "grok-4.3", "grok-4.5"]))
check("groq catalog (8b/70b/qwen3.6/oss/whisper present)", lambda: catalog(
    "/groq/openai/v1/models",
    ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "qwen/qwen3.6-27b", "openai/gpt-oss-120b", "whisper-large-v3-turbo"]))

# ── Report ───────────────────────────────────────────────────────────────────
fails = [r for r in results if not r[1]]
print("\nAI HEALTH CHECK —", time.strftime("%Y-%m-%d %H:%M"))
print("=" * 74)
for name, ok, info in results:
    print(("PASS " if ok else "FAIL ") + name.ljust(46) + " " + info)
print("=" * 74)
print("TOTAL: %d  PASS: %d  FAIL: %d" % (len(results), len(results) - len(fails), len(fails)))
if fails:
    print("\nACTION NEEDED — these are retired/broken and wired into the platform:")
    for name, _, info in fails:
        print("  •", name, "→", info)
sys.exit(1 if fails else 0)
