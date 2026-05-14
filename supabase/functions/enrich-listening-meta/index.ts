// enrich-listening-meta — for an existing ielts-listening mock row,
// read its transcripts + ask Gemini to (a) generate a short topic per
// section (replaces "Section 1/2/3/4" placeholder titles) and (b) guess
// the source if it recognises the test (e.g. "Cambridge IELTS 18 Test 3").
// UPDATEs mock_tests.mock_data with the new fields.

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

// Cap transcript per section to keep total prompt under ~30K chars even
// for verbose mocks. 1800 chars × 4 sections = ~7000 chars of content.
function preview(text: string, max = 1800): string {
  if (!text) return "(no transcript)";
  const t = String(text);
  return t.length > max ? t.slice(0, max) + "…" : t;
}

async function enrichOne(mockNumber: number, geminiKey: string, supabaseUrl: string, supabaseKey: string) {
  const fetchUrl = `${supabaseUrl}/rest/v1/mock_tests?mock_type=eq.ielts-listening&mock_number=eq.${mockNumber}&select=id,mock_data`;
  const r = await fetch(fetchUrl, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
  });
  if (!r.ok) throw new Error(`fetch failed: ${r.status}`);
  const rows = await r.json();
  if (!rows || !rows.length) throw new Error(`no row for mock ${mockNumber}`);
  const row = rows[0];
  const md = row.mock_data || {};
  const parts = Array.isArray(md.parts) ? md.parts : [];
  if (parts.length === 0) throw new Error(`mock ${mockNumber} has no parts`);

  const sectionSummaries = parts.map((p: any, i: number) => {
    const transcript = preview(p.transcript || "", 1800);
    const instr = String(p.instruction || "").slice(0, 200);
    return `### Section ${i + 1}
Instruction: ${instr}
Transcript preview:
${transcript}`;
  }).join("\n\n");

  const prompt =
    `You are an IELTS Listening test cataloguer. For the test below, output JSON with:
- "sectionTitles": array of ${parts.length} short topic phrases (3-6 words each), one per section. Capture the CONTENT topic — what each section is actually about. Examples: "Guitar group enrolment", "Lifeboat volunteer interview", "Tardigrades zoology lecture". Do NOT include "Section N" prefixes. No trailing punctuation.
- "source": string — if you recognise this as a specific published test (e.g. "Cambridge IELTS 18 Test 3", "Cambridge IELTS 17 Test 1"), output that exact label. If you can't identify the publication with reasonable confidence, output an empty string "". Do NOT guess.

Test material:

${sectionSummaries}

Output JSON only, no markdown fences, no preamble. Schema:
{
  "sectionTitles": ["string","string","string","string"],
  "source": "string"
}`;

  const gr = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
      }),
    },
  );
  if (!gr.ok) {
    const t = await gr.text();
    throw new Error(`Gemini error ${gr.status}: ${t.slice(0, 300)}`);
  }
  const gj = await gr.json();
  const raw = gj?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) {
    const candidate = gj?.candidates?.[0];
    const finishReason = candidate?.finishReason || "(none)";
    const blockReason = gj?.promptFeedback?.blockReason || "(none)";
    throw new Error(`Gemini returned no text — finishReason=${finishReason} blockReason=${blockReason} candidatesLen=${(gj?.candidates || []).length}`);
  }
  const clean = String(raw).replace(/^```(?:json)?\n?/i, "").replace(/\n?```\s*$/, "").trim();
  let parsed: any;
  try {
    parsed = JSON.parse(clean);
  } catch {
    throw new Error(`Gemini output not JSON: ${clean.slice(0, 200)}`);
  }
  const newTitles: string[] = Array.isArray(parsed.sectionTitles) ? parsed.sectionTitles : [];
  const newSource: string = String(parsed.source || "").trim();

  const updatedParts = parts.map((p: any, i: number) => {
    const t = newTitles[i];
    return (t && typeof t === "string" && t.trim()) ? { ...p, title: t.trim() } : p;
  });
  const newMd: any = { ...md, parts: updatedParts };
  if (newSource) newMd.source = newSource;

  const updateUrl = `${supabaseUrl}/rest/v1/mock_tests?id=eq.${row.id}`;
  const ur = await fetch(updateUrl, {
    method: "PATCH",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ mock_data: newMd }),
  });
  if (!ur.ok) {
    const t = await ur.text();
    throw new Error(`update failed ${ur.status}: ${t.slice(0, 200)}`);
  }
  return { mock_number: mockNumber, titles: newTitles, source: newSource };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, { status: 405 });

  let body: any;
  try { body = await req.json(); }
  catch { return json({ error: "invalid JSON" }, { status: 400 }); }

  const mockNumber = Number(body?.mockNumber || 0);
  if (!mockNumber || !Number.isInteger(mockNumber)) {
    return json({ error: "mockNumber (integer) required" }, { status: 400 });
  }

  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiKey) return json({ error: "GEMINI_API_KEY not set" }, { status: 500 });
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://zknyukkbtbcqgvkgjktb.supabase.co";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseKey) return json({ error: "SUPABASE_SERVICE_ROLE_KEY not set" }, { status: 500 });

  try {
    const result = await enrichOne(mockNumber, geminiKey, supabaseUrl, supabaseKey);
    return json({ ok: true, ...result });
  } catch (e) {
    return json({ error: (e as Error).message }, { status: 500 });
  }
});
