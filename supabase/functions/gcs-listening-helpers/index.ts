// gcs-listening-helpers — V4-signed GCS upload URLs + Gemini multimodal
// audio transcription, called by the IELTS Listening editor.
//
// Actions:
//   diag             — returns which service-account env var was found
//   sign-upload      — issues a V4 signed PUT URL for `mockstream-listening-audio`
//   transcribe-audio — fetches audio from a GCS URL, calls Gemini multimodal

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { encodeBase64 } from "jsr:@std/encoding/base64";

const ALLOWED_BUCKET = "mockstream-listening-audio";
const SIGNED_URL_EXPIRES_SEC = 15 * 60;

const SA_ENV_NAMES = [
  "GCS_SERVICE_ACCOUNT_JSON",
  "GCS_SIGNER_KEY",
  "GCP_SA_KEY",
  "GOOGLE_SERVICE_ACCOUNT_JSON",
  "GCS_SA_JSON",
  "GOOGLE_APPLICATION_CREDENTIALS_JSON",
  "SERVICE_ACCOUNT_JSON",
  "GCS_SERVICE_ACCOUNT_KEY",
  "GOOGLE_CLOUD_SERVICE_ACCOUNT",
  "GCP_SERVICE_ACCOUNT",
  "GCP_SERVICE_ACCOUNT_KEY",
];
function findServiceAccountJson(): { name: string | null; raw: string | null } {
  for (const k of SA_ENV_NAMES) {
    const v = Deno.env.get(k);
    if (v && v.trim()) return { name: k, raw: v };
  }
  return { name: null, raw: null };
}

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

function pad2(n: number) { return String(n).padStart(2, "0"); }
function formatTimestamps(d: Date) {
  const datestamp = `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}`;
  const requestTimestamp = `${datestamp}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`;
  return { datestamp, requestTimestamp };
}
async function sha256Hex(data: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}
async function signRsaSha256Hex(data: string, pemPrivateKey: string): Promise<string> {
  const pemContents = pemPrivateKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\\n/g, "\n")
    .replace(/\s+/g, "");
  const keyBytes = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8", keyBytes,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false, ["sign"],
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}
function encodeRfc3986(s: string): string {
  return encodeURIComponent(s).replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}
function encodeObjectPath(p: string): string {
  return p.split("/").map(encodeRfc3986).join("/");
}

async function generateV4SignedPutUrl(opts: {
  serviceAccount: { client_email: string; private_key: string };
  bucket: string;
  object: string;
  contentType: string;
  expiresInSeconds: number;
}): Promise<{ uploadUrl: string; finalUrl: string }> {
  const { serviceAccount, bucket, object, contentType, expiresInSeconds } = opts;
  const now = new Date();
  const { datestamp, requestTimestamp } = formatTimestamps(now);
  const credentialScope = `${datestamp}/auto/storage/goog4_request`;
  const credential = `${serviceAccount.client_email}/${credentialScope}`;
  const host = "storage.googleapis.com";
  const canonicalPath = `/${bucket}/${encodeObjectPath(object)}`;

  const headers: Record<string, string> = {
    host,
    "content-type": contentType,
  };
  const sortedHeaderKeys = Object.keys(headers).sort();
  const signedHeaders = sortedHeaderKeys.join(";");
  const canonicalHeaders = sortedHeaderKeys.map(k => `${k}:${headers[k]}`).join("\n") + "\n";

  const queryEntries: [string, string][] = [
    ["X-Goog-Algorithm", "GOOG4-RSA-SHA256"],
    ["X-Goog-Credential", credential],
    ["X-Goog-Date", requestTimestamp],
    ["X-Goog-Expires", String(expiresInSeconds)],
    ["X-Goog-SignedHeaders", signedHeaders],
  ];
  queryEntries.sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
  const canonicalQueryString = queryEntries
    .map(([k, v]) => `${encodeRfc3986(k)}=${encodeRfc3986(v)}`).join("&");

  const canonicalRequest = [
    "PUT", canonicalPath, canonicalQueryString,
    canonicalHeaders, signedHeaders, "UNSIGNED-PAYLOAD",
  ].join("\n");

  const canonicalRequestHash = await sha256Hex(canonicalRequest);
  const stringToSign = [
    "GOOG4-RSA-SHA256", requestTimestamp, credentialScope, canonicalRequestHash,
  ].join("\n");

  const signatureHex = await signRsaSha256Hex(stringToSign, serviceAccount.private_key);
  const uploadUrl = `https://${host}${canonicalPath}?${canonicalQueryString}&X-Goog-Signature=${signatureHex}`;
  const finalUrl = `https://${host}${canonicalPath}`;
  return { uploadUrl, finalUrl };
}

// Auto-detect section start times in a merged IELTS Listening audio.
// Uses Gemini's File API (/upload/v1beta/files) rather than inline
// base64 — merged listening audio is typically ~30 min / 20-40 MB,
// well past the ~18 MB inline cap that transcribe-audio runs into.
// File API uploads stream the bytes through the function (memory
// roughly equal to the audio size) and Gemini hosts the file for ~48 h.
async function detectSectionStartsWithGemini(opts: {
  audioUrl: string;
  geminiKey: string;
  // examType controls prompt + section count + output key prefix.
  // 'ielts-listening' (default): 4 sections, "Section One/Two/Three/Four" cues, keys section1..4.
  // 'cefr-listening': 6 parts, "Part One/Two/.../Six" cues + numbered question announcements
  //                   ("Now we'll move on to Part 3", etc.), keys section1..6 (caller maps to parts).
  examType?: string;
}): Promise<Record<string, number>> {
  // 1. Fetch audio bytes from GCS.
  const audioResp = await fetch(opts.audioUrl);
  if (!audioResp.ok) throw new Error(`audio fetch failed (${audioResp.status})`);
  const audioBytes = new Uint8Array(await audioResp.arrayBuffer());
  const mime = audioResp.headers.get("content-type") || "audio/mpeg";
  const sizeMB = audioBytes.byteLength / (1024 * 1024);
  if (sizeMB > 200) {
    throw new Error(`audio too large (${sizeMB.toFixed(1)} MB) — Gemini File API limit is 2 GB but we cap at 200 MB for sanity.`);
  }

  // 2. Resumable upload to Gemini's File API.
  //    Step A: POST to start; get the X-Goog-Upload-URL in the response header.
  const startResp = await fetch(
    `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${opts.geminiKey}`,
    {
      method: "POST",
      headers: {
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command":  "start",
        "X-Goog-Upload-Header-Content-Length": String(audioBytes.byteLength),
        "X-Goog-Upload-Header-Content-Type":   mime,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file: { displayName: "ielts-listening-merged" } }),
    },
  );
  if (!startResp.ok) {
    const t = await startResp.text();
    throw new Error(`File API start failed (${startResp.status}): ${t.slice(0, 200)}`);
  }
  const uploadUrl = startResp.headers.get("X-Goog-Upload-URL")
                 || startResp.headers.get("x-goog-upload-url");
  if (!uploadUrl) throw new Error("File API didn't return X-Goog-Upload-URL");

  //    Step B: upload + finalize in one call.
  const upResp = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Length":        String(audioBytes.byteLength),
      "X-Goog-Upload-Offset":  "0",
      "X-Goog-Upload-Command": "upload, finalize",
    },
    body: audioBytes,
  });
  if (!upResp.ok) {
    const t = await upResp.text();
    throw new Error(`File API upload failed (${upResp.status}): ${t.slice(0, 200)}`);
  }
  const upJson = await upResp.json();
  const fileUri = upJson?.file?.uri;
  const fileName = upJson?.file?.name;  // e.g. "files/abc123"
  if (!fileUri || !fileName) throw new Error("File API didn't return file.uri / file.name");

  // 3. Poll until the file's state is ACTIVE. The File API returns
  //    PROCESSING immediately on upload completion; referencing the file
  //    in generateContent while it's still PROCESSING comes back as an
  //    empty-text response ("Gemini returned no text"). Audio files
  //    typically transition to ACTIVE in ~5-15s.
  const POLL_TIMEOUT_MS = 60_000;
  const POLL_INTERVAL_MS = 2_000;
  const pollStart = Date.now();
  let fileState = String(upJson?.file?.state || "PROCESSING").toUpperCase();
  while (fileState !== "ACTIVE") {
    if (Date.now() - pollStart > POLL_TIMEOUT_MS) {
      throw new Error(`File API never reached ACTIVE state (last: ${fileState})`);
    }
    if (fileState === "FAILED") {
      throw new Error("File API processing FAILED");
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    const statResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${opts.geminiKey}`,
    );
    if (!statResp.ok) {
      const t = await statResp.text();
      throw new Error(`File API stat failed (${statResp.status}): ${t.slice(0, 200)}`);
    }
    const sj = await statResp.json();
    fileState = String(sj?.state || sj?.file?.state || "PROCESSING").toUpperCase();
  }

  // 4. Call generateContent referencing the uploaded file. Prompt varies
  //    by exam type — IELTS has 4 sections with "Section One/Two/…" cues,
  //    CEFR Listening has 6 parts with "Part One/Two/…" or numbered
  //    "Part 1/2/…" cues plus question-range announcements between parts.
  const isCefrListening = opts.examType === 'cefr-listening';
  const prompt = isCefrListening
    ? `You are listening to a merged CEFR Listening test audio that contains all SIX parts back-to-back. ` +
      `Each part begins with a narrator cue. Look for any of these cue patterns: ` +
      `"Part One"/"Part Two"/.../"Part Six"; "Part 1"/"Part 2"/.../"Part 6"; ` +
      `or numbered question announcements like "Now you will hear Part 2" / "Look at questions 9 to 14" / "For questions 15 to 19" / etc. ` +
      `(CEFR Listening uses Q1-8 in Part 1, Q9-14 in Part 2, Q15-19 in Part 3, Q20-24 in Part 4, Q25-30 in Part 5, Q31-36 in Part 6.) ` +
      `Find the timestamp (in whole seconds from the start of the file) at which the narrator BEGINS each part's announcement / instructions. ` +
      `Part 1 typically starts at or near 0. ` +
      `Output ONLY a JSON object — no markdown, no preamble — with exactly these six integer keys: ` +
      `{"section1": <seconds>, "section2": <seconds>, "section3": <seconds>, "section4": <seconds>, "section5": <seconds>, "section6": <seconds>}.`
    : `You are listening to a merged IELTS Listening test audio that contains all four sections back-to-back. ` +
      `Each section begins with the narrator saying "Section One" / "Section Two" / "Section Three" / "Section Four" (sometimes preceded by a short instructional preamble). ` +
      `Find the timestamp (in whole seconds from the start of the file) at which the narrator BEGINS the announcement for each section. ` +
      `Section 1 typically starts at or near 0. ` +
      `Output ONLY a JSON object — no markdown, no preamble — with exactly these four integer keys: ` +
      `{"section1": <seconds>, "section2": <seconds>, "section3": <seconds>, "section4": <seconds>}.`;

  const genResp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${opts.geminiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { fileData: { mimeType: mime, fileUri } },
          ],
        }],
        generationConfig: {
          temperature: 0.1,
          // 2.5 Pro shares output budget with thinking tokens, so a 512
          // ceiling leaves nothing for the actual JSON when thinking is
          // dynamic. 4096 gives plenty of headroom for a tiny 4-key
          // object.
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: -1 },
        },
      }),
    },
  );
  if (!genResp.ok) {
    const t = await genResp.text();
    throw new Error(`Gemini generate failed (${genResp.status}): ${t.slice(0, 300)}`);
  }
  const gj = await genResp.json();
  const cand = gj?.candidates?.[0];
  const fr = cand?.finishReason;
  const raw = cand?.content?.parts?.map((p: { text?: string }) => p?.text || "").join("") || "";
  if (!raw) {
    throw new Error(`Gemini returned no text (finishReason=${fr || "unknown"}, fileState=ACTIVE — model may have timed out on a long audio)`);
  }
  const cleaned = String(raw)
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
  let parsed: any;
  try { parsed = JSON.parse(cleaned); }
  catch (e) { throw new Error(`Gemini output is not JSON: ${(e as Error).message} — raw: ${cleaned.slice(0, 200)}`); }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Gemini output is not a JSON object");
  }
  const out: Record<string, number> = {};
  for (let i = 1; i <= 4; i++) {
    const key = `section${i}`;
    const v = parsed[key];
    if (typeof v === "number" && isFinite(v) && v >= 0) {
      out[key] = Math.round(v);
    }
  }
  if (Object.keys(out).length === 0) {
    throw new Error("Gemini returned no usable section timestamps");
  }
  return out;
}

async function transcribeWithGemini(opts: {
  audioUrl: string;
  startSec?: number;
  endSec?: number | null;
  geminiKey: string;
}): Promise<{ transcript: string }> {
  const audioResp = await fetch(opts.audioUrl);
  if (!audioResp.ok) throw new Error(`audio fetch failed (${audioResp.status})`);
  const audioBytes = new Uint8Array(await audioResp.arrayBuffer());
  const sizeMB = audioBytes.byteLength / (1024 * 1024);
  if (sizeMB > 18) {
    throw new Error(`audio too large (${sizeMB.toFixed(1)} MB) — Gemini inline limit is 20 MB total. Split into per-section files for now.`);
  }
  const mime = audioResp.headers.get("content-type") || "audio/mpeg";
  // Single-pass, native base64 encoder from @std/encoding. The previous
  // char-by-char concat scaled O(n²) in V8 and built a 7-10 MB transient
  // binary string before btoa — when a hot Edge Function instance from a
  // back-to-back call hadn\'t GC\'d yet, that tipped the worker over the
  // memory cap and surfaced as 546 WORKER_RESOURCE_LIMIT.
  const base64 = encodeBase64(audioBytes);

  const timeNote = (opts.startSec || opts.endSec)
    ? `Transcribe only the segment from ${opts.startSec || 0}s to ${opts.endSec ? opts.endSec + "s" : "the end"} of the audio. Ignore everything outside that range. `
    : "";
  const prompt =
    `You are transcribing an IELTS Listening test audio. ${timeNote}` +
    `Produce a verbatim transcript with speaker labels (Speaker 1, Speaker 2, Narrator, etc.). ` +
    `Preserve speech disfluencies only when they are diegetic to the test. ` +
    `Output plain text — no markdown, no JSON, no preamble.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${opts.geminiKey}`;
  const body = {
    contents: [{
      parts: [
        { text: prompt },
        { inlineData: { mimeType: mime, data: base64 } },
      ],
    }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 8192 },
  };
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Gemini error (${r.status}): ${t.slice(0, 300)}`);
  }
  const j = await r.json();
  const text = j?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no transcript");
  return { transcript: String(text).trim() };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, { status: 405 });

  let body: any;
  try { body = await req.json(); }
  catch { return json({ error: "invalid JSON body" }, { status: 400 }); }

  const action = body?.action || "";

  if (action === "diag") {
    const found = findServiceAccountJson();
    const allEnv = Object.keys(Deno.env.toObject())
      .filter(k => /gcs|gcp|google|service|sa/i.test(k));
    return json({
      foundServiceAccountVar: found.name,
      relevantEnvKeys: allEnv,
      geminiKeyPresent: !!Deno.env.get("GEMINI_API_KEY"),
    });
  }

  if (action === "sign-upload") {
    const bucket = String(body.bucket || "");
    if (bucket !== ALLOWED_BUCKET) {
      return json({ error: `bucket must be "${ALLOWED_BUCKET}"` }, { status: 400 });
    }
    const filename = String(body.filename || "").replace(/^\/+/, "");
    if (!filename || filename.includes("..") || !/^ielts-listening\//i.test(filename)) {
      return json({ error: "filename must start with 'ielts-listening/'" }, { status: 400 });
    }
    const contentType = String(body.contentType || "");
    if (!/^(audio|image)\//.test(contentType)) {
      return json({ error: "contentType must be audio/* or image/*" }, { status: 400 });
    }
    const found = findServiceAccountJson();
    if (!found.raw) {
      return json({
        error: "GCS service-account JSON not found in env. Set one of: " + SA_ENV_NAMES.join(", "),
      }, { status: 500 });
    }
    let sa: any;
    try { sa = JSON.parse(found.raw); }
    catch (e) { return json({ error: "service-account JSON parse error: " + (e as Error).message }, { status: 500 }); }
    if (!sa.client_email || !sa.private_key) {
      return json({ error: "service-account JSON missing client_email or private_key" }, { status: 500 });
    }
    try {
      const { uploadUrl, finalUrl } = await generateV4SignedPutUrl({
        serviceAccount: { client_email: sa.client_email, private_key: sa.private_key },
        bucket,
        object: filename,
        contentType,
        expiresInSeconds: SIGNED_URL_EXPIRES_SEC,
      });
      return json({ uploadUrl, finalUrl, foundVarName: found.name });
    } catch (e) {
      return json({ error: "sign failed: " + (e as Error).message }, { status: 500 });
    }
  }

  if (action === "detect-section-starts") {
    const audioUrl = String(body.audioUrl || "");
    if (!/^https:\/\/storage\.googleapis\.com\//.test(audioUrl)) {
      return json({ error: "audioUrl must be a storage.googleapis.com URL" }, { status: 400 });
    }
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) return json({ error: "GEMINI_API_KEY not set" }, { status: 500 });
    try {
      const examType = String(body.examType || "ielts-listening");
      const sections = await detectSectionStartsWithGemini({ audioUrl, geminiKey, examType });
      return json({ sections });
    } catch (e) {
      return json({ error: (e as Error).message }, { status: 500 });
    }
  }

  if (action === "transcribe-audio") {
    const audioUrl = String(body.audioUrl || "");
    if (!/^https:\/\/storage\.googleapis\.com\//.test(audioUrl)) {
      return json({ error: "audioUrl must be a storage.googleapis.com URL" }, { status: 400 });
    }
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) return json({ error: "GEMINI_API_KEY not set" }, { status: 500 });
    const startSec = Number(body.startSec || 0);
    const endSec = body.endSec != null ? Number(body.endSec) : null;
    try {
      const { transcript } = await transcribeWithGemini({ audioUrl, startSec, endSec, geminiKey });
      return json({ transcript });
    } catch (e) {
      return json({ error: (e as Error).message }, { status: 500 });
    }
  }

  return json({ error: `unknown action: ${action}` }, { status: 400 });
});
