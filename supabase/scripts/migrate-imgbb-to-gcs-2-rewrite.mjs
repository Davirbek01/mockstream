#!/usr/bin/env node
// Phase 2 — Step 2 of 2: rewrite static speaking JS files to point at GCS.
//
// Reads supabase/scripts/imgbb-to-gcs-mapping.json (produced by Step 1).
// For every speaking JS file, replaces each ImgBB URL with its GCS URL.
// Does NOT touch git. Writes only the JS files; the diff is staged
// separately so you can review with `git diff` before committing.

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const mapping = JSON.parse(fs.readFileSync(path.join(__dirname, 'imgbb-to-gcs-mapping.json'), 'utf8'));
const pairs = Object.entries(mapping);
console.log(`Loaded ${pairs.length} ImgBB→GCS mappings.\n`);

const SKILL_DIRS = [
  path.join(REPO_ROOT, 'site', 'questions S'),
  path.join(REPO_ROOT, 'site', 'questions IELTS S')
];

let totalReplacements = 0;
let filesTouched = 0;
let filesScanned = 0;

for (const dir of SKILL_DIRS) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js'));
  for (const f of files) {
    filesScanned++;
    const fp = path.join(dir, f);
    let text = fs.readFileSync(fp, 'utf8');
    const before = text;
    let count = 0;
    for (const [imgbb, gcs] of pairs) {
      // Use literal string replace (not regex) so URLs with special
      // characters can't bite us. Loop replacement until no more
      // occurrences remain.
      while (text.includes(imgbb)) {
        text = text.replace(imgbb, gcs);
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
