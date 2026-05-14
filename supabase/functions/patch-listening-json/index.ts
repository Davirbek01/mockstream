// patch-listening-json — applies a natural-language instruction to an
// existing JSON object via Gemini 2.5 Pro. Used by the IELTS Listening
// editor's "Other" tab to let zero-coder admins edit subParts without
// hand-touching JSON ("add Q10 …", "renumber gapIds 1..10", etc.).

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
function json(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { ...CORS, "Content-Type": "application/json", ...(init?.headers || {}) },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, { status: 405 });

  let body: any;
  try { body = await req.json(); }
  catch { return json({ error: "invalid JSON body" }, { status: 400 }); }

  const currentJsonStr = String(body?.currentJson || "").trim();
  const instruction = String(body?.instruction || "").trim();
  if (!currentJsonStr) return json({ error: "currentJson required" }, { status: 400 });
  if (!instruction)    return json({ error: "instruction required" }, { status: 400 });
  if (instruction.length > 4000) return json({ error: "instruction too long (max 4000 chars)" }, { status: 400 });

  // Validate the current JSON server-side so we never ship malformed
  // input to Gemini.
  let currentObj: any;
  try { currentObj = JSON.parse(currentJsonStr); }
  catch (e) { return json({ error: "currentJson is not valid JSON: " + (e as Error).message }, { status: 400 }); }
  if (currentObj === null || typeof currentObj !== "object" || Array.isArray(currentObj)) {
    return json({ error: "currentJson must be an object { … } at the top level" }, { status: 400 });
  }

  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiKey) return json({ error: "GEMINI_API_KEY not set" }, { status: 500 });

  const prompt =
    `You are an IELTS Listening mock-data editor. The user wants to apply a SURGICAL change to an existing JSON object — typically the per-section "Other" structure (type, subParts[], answerHighlights, etc.).

INSTRUCTION FROM THE USER:
<<<
${instruction}
>>>

CURRENT JSON:
<<<
${JSON.stringify(currentObj, null, 2)}
>>>

Rules:
1. Apply ONLY the change the user described. Preserve EVERYTHING ELSE byte-for-byte.
2. Do NOT renumber, reorder, or rename keys unless the instruction explicitly says so.
3. Preserve the same top-level structure (type, subParts, answerHighlights, etc.) and the same shape of every sub-part object that already exists.
4. New entries must match the shape of nearby entries (e.g. a new item-gap inside formContent must have "text", "type": "item-gap", "gapId", and optionally "gapSuffix" — match the surrounding pattern).
5. If the instruction is unclear or risky (e.g. renaming a field across many entries when the user only mentioned one), apply the safest interpretation and add a one-sentence note to your output under a "_notes" key. Drop "_notes" if there's nothing to flag.
6. Output JSON only — a single valid JSON object. No markdown fences, no preamble, no explanation outside the JSON itself.

Output schema: the same shape as CURRENT JSON, plus optionally a "_notes" key on the top level if you needed to flag anything.`;

  let geminiResp: Response;
  try {
    geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
          },
        }),
      },
    );
  } catch (e) {
    return json({ error: "Gemini network error: " + (e as Error).message }, { status: 502 });
  }
  if (!geminiResp.ok) {
    const t = await geminiResp.text();
    return json({ error: `Gemini error ${geminiResp.status}: ${t.slice(0, 300)}` }, { status: 502 });
  }
  const gj = await geminiResp.json();
  const raw = gj?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) {
    const finish = gj?.candidates?.[0]?.finishReason || "(none)";
    return json({ error: `Gemini returned no text (finishReason=${finish})` }, { status: 502 });
  }

  // Defensive — strip markdown fences if Gemini sneaks them in.
  const clean = String(raw)
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();

  let patched: any;
  try { patched = JSON.parse(clean); }
  catch (e) {
    return json({
      error: "Gemini output is not valid JSON: " + (e as Error).message,
      raw: clean.slice(0, 500),
    }, { status: 502 });
  }
  if (patched === null || typeof patched !== "object" || Array.isArray(patched)) {
    return json({
      error: "Gemini output is not a JSON object at the top level.",
      raw: clean.slice(0, 500),
    }, { status: 502 });
  }

  // Lift _notes out so the frontend can show it as a banner, then drop
  // it from the patched object so it doesn't leak into mock_data.
  const notes: string | undefined = (typeof patched._notes === "string" && patched._notes.trim())
    ? patched._notes.trim()
    : undefined;
  delete patched._notes;

  return json({
    ok: true,
    patched,
    patchedFormatted: JSON.stringify(patched, null, 2),
    notes,
  });
});
