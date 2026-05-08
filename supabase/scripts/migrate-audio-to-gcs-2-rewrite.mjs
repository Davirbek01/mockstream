#!/usr/bin/env node
// Phase 2 — Step 2 of 2: rewrite static speaking JS files so every
// `audioFile` string points at the GCS-hosted MP3 instead of the
// repo-relative path.
//
// Reads supabase/scripts/audio-to-gcs-mapping.json (produced by Step 1).
// For every speaking JS file, replaces each repo-relative audio path
// with its GCS public URL. Does NOT touch git — only the JS files.
//
// Idempotent: if the JS file already has GCS URLs (script re-run), the
// literal-string replace finds no matches and the file is untouched.
//
// PRECONDITION: the upload script (Step 1) must have a clean tail of
// "Done: ... 0 failed." before running this. If even one MP3 is missing
// from GCS, students would get 404s on the runner page.

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const mappingPath = path.join(__dirname, 'audio-to-gcs-mapping.json');
if (!fs.existsSync(mappingPath)) {
  console.error('Missing supabase/scripts/audio-to-gcs-mapping.json — run Step 1 first.');
  process.exit(1);
}
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
const pairs = Object.entries(mapping);
console.log(`Loaded ${pairs.length} audio-to-GCS mappings.\n`);

// Sanity check: warn if any mapping entries point at the same GCS URL
// from different relPaths (shouldn't happen, but cheap to verify).
{
  const seen = new Map();
  for (const [rel, gcs] of pairs) {
    if (seen.has(gcs)) {
      console.error(`⚠ duplicate GCS URL: ${gcs} (used by both "${seen.get(gcs)}" and "${rel}")`);
    }
    seen.set(gcs, rel);
  }
}

const SKILL_DIRS = [
  path.join(REPO_ROOT, 'site', 'questions S'),
  path.join(REPO_ROOT, 'site', 'questions IELTS S')
];

let totalReplacements = 0;
let filesTouched = 0;
let filesScanned = 0;

for (const dir of SKILL_DIRS) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js'));
  for (const f of files) {
    filesScanned++;
    const fp = path.join(dir, f);
    let text = fs.readFileSync(fp, 'utf8');
    const before = text;
    let count = 0;
    for (const [relPath, gcsUrl] of pairs) {
      // Literal-string replace — looped because `String.replace(string, …)`
      // only replaces the first occurrence. The relPath is unique enough
      // (includes "questions S/audio/" or "questions IELTS S/audio/" prefix
      // plus a unique filename) that no false-positive replacements happen.
      while (text.includes(relPath)) {
        text = text.replace(relPath, gcsUrl);
        count++;
      }
    }
    if (text !== before) {
      fs.writeFileSync(fp, text);
      filesTouched++;
      totalReplacements += count;
      console.log(`  ${path.relative(REPO_ROOT, fp)}: ${count} replacements`);
    }
  }
}

console.log(`\nDone: ${filesTouched}/${filesScanned} files touched, ${totalReplacements} URL replacements total.`);
