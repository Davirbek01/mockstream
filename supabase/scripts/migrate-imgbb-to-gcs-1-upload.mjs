#!/usr/bin/env node
// Phase 2 — Step 1 of 2: upload all ImgBB-hosted speaking-mock images to GCS.
//
// Usage:
//   ADMIN_PASSCODE=... node supabase/scripts/migrate-imgbb-to-gcs-1-upload.mjs
//
// Read-only with respect to the repo: scans every speaking JS file for
// ImgBB URLs, but does NOT modify any file. Writes the ImgBB→GCS mapping
// to supabase/scripts/imgbb-to-gcs-mapping.json so Step 2 (rewrite) can
// replace URLs in the static JS files.
//
// Idempotent: HEAD-checks the GCS public URL before each upload and skips
// if the file already exists. Safe to re-run.

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

// ── Step A: scan speaking JS files, build url → set(skill) map ────────
const SKILL_DIRS = [
  { dir: path.join(REPO_ROOT, 'site', 'questions S'),       skill: 'cefr-speaking'  },
  { dir: path.join(REPO_ROOT, 'site', 'questions IELTS S'), skill: 'ielts-speaking' }
];

const IMGBB_RE = /https:\/\/i\.ibb\.co\/[A-Za-z0-9]+\/[^"'\s)]+/g;
const urlToSkills = new Map();

for (const { dir, skill } of SKILL_DIRS) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js'));
  for (const f of files) {
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    const matches = text.match(IMGBB_RE) || [];
    for (const url of matches) {
      const clean = url.replace(/[",;]+$/, '');
      if (!urlToSkills.has(clean)) urlToSkills.set(clean, new Set());
      urlToSkills.get(clean).add(skill);
    }
  }
}

console.log(`Scope: ${urlToSkills.size} unique ImgBB URLs across speaking mocks.\n`);

// ── Step B: for each unique URL, ensure it's mirrored to GCS ──────────
const mapping = {};   // imgbbUrl → gcsPublicUrl
let ok = 0, skipped = 0, failed = 0;

const sorted = [...urlToSkills.keys()].sort();
for (const imgbbUrl of sorted) {
  const skills = urlToSkills.get(imgbbUrl);
  // Cross-skill URLs (the shared logo) → CEFR folder. Larger pool, doesn't matter functionally
  // since both CEFR and IELTS files will be rewritten to the same GCS URL.
  const skill = skills.has('cefr-speaking') ? 'cefr-speaking' : 'ielts-speaking';

  const m = imgbbUrl.match(/^https:\/\/i\.ibb\.co\/([A-Za-z0-9]+)\/(.+)$/);
  if (!m) { console.log(`✗ ${imgbbUrl} — bad URL pattern`); failed++; continue; }
  const filename = `${m[1]}-${m[2]}`;

  process.stdout.write(`  ${filename.padEnd(48)} `);

  // B.1: ask admin-mocks for a signed PUT URL — also gives us the publicUrl
  // we'd write to. This call is cheap; do it before the download so we
  // know the target before consuming ImgBB bandwidth.
  let signed;
  try {
    const probeContentType = filename.endsWith('.png')  ? 'image/png'
                           : filename.endsWith('.webp') ? 'image/webp'
                           : filename.endsWith('.gif')  ? 'image/gif'
                                                        : 'image/jpeg';
    const sig = await fetch(FN_URL, {
      method: 'POST',
      headers: { 'apikey': ANON, 'Authorization': `Bearer ${ANON}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'gcs_signed_upload_url',
        adminPasscode: passcode,
        skill, filename, contentType: probeContentType
      })
    });
    signed = await sig.json();
    if (!sig.ok || signed.error) throw new Error(signed.error || `HTTP ${sig.status}`);
  } catch (e) {
    console.log(`✗ signed-url: ${e.message}`);
    failed++; continue;
  }

  // B.2: idempotency — already in GCS?
  try {
    const head = await fetch(signed.publicUrl, { method: 'HEAD' });
    if (head.ok) {
      mapping[imgbbUrl] = signed.publicUrl;
      console.log(`↺ already in GCS`);
      skipped++; continue;
    }
  } catch { /* not present — continue to download + upload */ }

  // B.3: download from ImgBB
  let bytes, downloadedCT;
  try {
    const dl = await fetch(imgbbUrl);
    if (!dl.ok) throw new Error(`HTTP ${dl.status}`);
    downloadedCT = (dl.headers.get('content-type') || '').toLowerCase().split(';')[0].trim() || 'image/jpeg';
    bytes = new Uint8Array(await dl.arrayBuffer());
  } catch (e) {
    console.log(`✗ ImgBB download: ${e.message}`);
    failed++; continue;
  }

  // The signed URL was issued for `probeContentType` — if the actual
  // downloaded MIME doesn't match, GCS will reject the PUT (signature
  // covers the content-type header). Re-sign with the real MIME if needed.
  if (downloadedCT !== signed && downloadedCT !== (filename.endsWith('.png') ? 'image/png'
                              : filename.endsWith('.webp') ? 'image/webp'
                              : filename.endsWith('.gif')  ? 'image/gif'
                                                           : 'image/jpeg')) {
    try {
      const sig = await fetch(FN_URL, {
        method: 'POST',
        headers: { 'apikey': ANON, 'Authorization': `Bearer ${ANON}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'gcs_signed_upload_url',
          adminPasscode: passcode,
          skill, filename, contentType: downloadedCT
        })
      });
      signed = await sig.json();
      if (!sig.ok || signed.error) throw new Error(signed.error || `HTTP ${sig.status}`);
    } catch (e) {
      console.log(`✗ re-sign: ${e.message}`);
      failed++; continue;
    }
  }

  // B.4: PUT to GCS
  try {
    const put = await fetch(signed.uploadUrl, {
      method:  'PUT',
      headers: { 'Content-Type': downloadedCT },
      body:    bytes
    });
    if (!put.ok) {
      const errText = await put.text().catch(() => '');
      throw new Error(`HTTP ${put.status} — ${errText.slice(0, 120)}`);
    }
    mapping[imgbbUrl] = signed.publicUrl;
    console.log(`✓ ${(bytes.length / 1024).toFixed(0)} KB · ${downloadedCT}`);
    ok++;
  } catch (e) {
    console.log(`✗ GCS PUT: ${e.message}`);
    failed++;
  }
}

console.log(`\nDone: ${ok} uploaded · ${skipped} already-in-GCS · ${failed} failed.`);

// ── Step C: save the mapping ────────────────────────────────────────────
const mappingPath = path.join(__dirname, 'imgbb-to-gcs-mapping.json');
fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
console.log(`Mapping saved → ${path.relative(REPO_ROOT, mappingPath)} (${Object.keys(mapping).length} entries).`);

if (failed > 0) {
  console.log('\n⚠ Some uploads failed. Investigate before running Step 2 (rewrite).');
  process.exit(1);
}
