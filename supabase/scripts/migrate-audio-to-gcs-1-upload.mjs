#!/usr/bin/env node
// Phase 2 — Step 1 of 2: upload all repo-hosted speaking-mock audio MP3s to GCS.
//
// Usage:
//   ADMIN_PASSCODE=... node supabase/scripts/migrate-audio-to-gcs-1-upload.mjs
//
// Read-only with respect to JS files. Scans every MP3 under
// site/questions\ S/audio/ + site/questions\ IELTS\ S/audio/, uploads each
// to GCS at <skill> speaking media/<filename>, then writes the
// audio-to-gcs-mapping.json the rewrite step (Step 2) reads.
//
// Idempotent: HEAD-checks the GCS public URL before each upload and skips
// existing files. Safe to re-run after a network blip.

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const FN_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/admin-mocks';
const ANON   = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';

const passcode = process.env.ADMIN_PASSCODE;
if (!passcode) {
  console.error('Set ADMIN_PASSCODE env var (super-admin passcode).');
  process.exit(1);
}

// Each entry: { localDir, repoPath, skill }
const SKILL_DIRS = [
  { localDir: path.join(REPO_ROOT, 'site', 'questions S',       'audio'), repoPath: 'questions S/audio',       skill: 'cefr-speaking'  },
  { localDir: path.join(REPO_ROOT, 'site', 'questions IELTS S', 'audio'), repoPath: 'questions IELTS S/audio', skill: 'ielts-speaking' }
];

// ── Step A: scan ────────────────────────────────────────────────────────
const todo = [];
for (const { localDir, repoPath, skill } of SKILL_DIRS) {
  if (!fs.existsSync(localDir)) continue;
  const files = fs.readdirSync(localDir).filter((f) => /\.(mp3|wav|m4a)$/i.test(f));
  for (const f of files) {
    todo.push({
      localPath:   path.join(localDir, f),
      filename:    f,
      relPath:     `${repoPath}/${f}`,            // matches the `audioFile` string in mock JSON
      skill
    });
  }
}
console.log(`Scope: ${todo.length} audio files to mirror to GCS.\n`);

// ── Step B: upload each ─────────────────────────────────────────────────
const mapping = {};   // relPath → publicUrl
let ok = 0, skipped = 0, failed = 0;

for (let i = 0; i < todo.length; i++) {
  const { localPath, filename, relPath, skill } = todo[i];
  const progress = `[${String(i + 1).padStart(4)}/${todo.length}]`;
  process.stdout.write(`${progress} ${filename.padEnd(45)} `);

  // B.1: signed PUT URL — also gives us publicUrl. Audio is mp3 → audio/mpeg.
  const ext = filename.toLowerCase().split('.').pop();
  const contentType = ext === 'mp3' ? 'audio/mpeg'
                    : ext === 'wav' ? 'audio/wav'
                    : ext === 'm4a' ? 'audio/x-m4a'
                                    : 'application/octet-stream';

  let signed;
  try {
    const sig = await fetch(FN_URL, {
      method: 'POST',
      headers: { 'apikey': ANON, 'Authorization': `Bearer ${ANON}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'gcs_signed_upload_url',
        adminPasscode: passcode,
        skill, filename, contentType
      })
    });
    signed = await sig.json();
    if (!sig.ok || signed.error) throw new Error(signed.error || `HTTP ${sig.status}`);
  } catch (e) {
    console.log(`✗ signed-url: ${e.message}`);
    failed++; continue;
  }

  // B.2: idempotency
  try {
    const head = await fetch(signed.publicUrl, { method: 'HEAD' });
    if (head.ok) {
      mapping[relPath] = signed.publicUrl;
      console.log(`↺ already in GCS`);
      skipped++; continue;
    }
  } catch { /* not present — fall through */ }

  // B.3: read local + PUT
  let bytes;
  try {
    bytes = fs.readFileSync(localPath);
  } catch (e) {
    console.log(`✗ read: ${e.message}`);
    failed++; continue;
  }

  try {
    const put = await fetch(signed.uploadUrl, {
      method:  'PUT',
      headers: { 'Content-Type': contentType },
      body:    bytes
    });
    if (!put.ok) {
      const errText = await put.text().catch(() => '');
      throw new Error(`HTTP ${put.status} — ${errText.slice(0, 120)}`);
    }
    mapping[relPath] = signed.publicUrl;
    console.log(`✓ ${(bytes.length / 1024).toFixed(0)} KB`);
    ok++;
  } catch (e) {
    console.log(`✗ GCS PUT: ${e.message}`);
    failed++;
  }
}

console.log(`\nDone: ${ok} uploaded · ${skipped} already-in-GCS · ${failed} failed.`);

// ── Step C: save mapping ────────────────────────────────────────────────
const mappingPath = path.join(__dirname, 'audio-to-gcs-mapping.json');
fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
console.log(`Mapping saved → ${path.relative(REPO_ROOT, mappingPath)} (${Object.keys(mapping).length} entries).`);

if (failed > 0) {
  console.log('\n⚠ Some uploads failed. Investigate before running Step 2 (rewrite).');
  process.exit(1);
}
