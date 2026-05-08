#!/usr/bin/env node
// Phase 3 follow-up: rewrite Mock 01 audio paths in Supabase to GCS URLs.
//
// Mocks 01 (cefr-speaking id=11, ielts-speaking id=10) were migrated to
// Supabase in Phase 1, BEFORE the Phase 2 audio rewrite happened. The
// Phase 2 rewrite touched the static JS files in site/questions S/ and
// site/questions IELTS S/ — it never opened the existing Supabase rows.
// So these two mocks still have relative-path audioFiles like
// "questions S/audio/cefr-speaking-mock-01-q1.mp3".
//
// Once Phase 3d deletes the audio dirs from the repo, those relative
// paths would 404. This script reads each Mock 01's mock_data, walks
// every question's audioFile, looks up the GCS URL in the existing
// audio-to-gcs-mapping.json, and pushes the updated mock_data back.
//
// Idempotent: if audioFile already starts with https://, leaves it alone.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FN_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/admin-mocks';
const ANON   = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';

const passcode = process.env.ADMIN_PASSCODE;
if (!passcode) {
  console.error('Set ADMIN_PASSCODE env var.');
  process.exit(1);
}

const mapping = JSON.parse(fs.readFileSync(path.join(__dirname, 'audio-to-gcs-mapping.json'), 'utf8'));
console.log(`Loaded ${Object.keys(mapping).length} audio→GCS pairs.\n`);

async function call(action, args) {
  const r = await fetch(FN_URL, {
    method: 'POST',
    headers: { 'apikey': ANON, 'Authorization': `Bearer ${ANON}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, adminPasscode: passcode, ...args })
  });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(j.error || `HTTP ${r.status}`);
  return j;
}

const TARGETS = [
  { id: 11, label: 'CEFR Speaking Mock 01' },
  { id: 10, label: 'IELTS Speaking Mock 01' }
];

for (const t of TARGETS) {
  process.stdout.write(`${t.label} (id=${t.id}): `);
  const got = await call('get', { id: t.id });
  const md = got.mock?.mock_data;
  if (!md || !Array.isArray(md.questions)) {
    console.log('✗ no questions array in mock_data');
    continue;
  }

  let rewrites = 0, alreadyGcs = 0, missing = 0;
  for (const q of md.questions) {
    if (!q || typeof q.audioFile !== 'string' || !q.audioFile) continue;
    if (q.audioFile.startsWith('https://')) { alreadyGcs++; continue; }
    const gcs = mapping[q.audioFile];
    if (!gcs) {
      console.log(`\n  ⚠ no mapping for "${q.audioFile}" (Q${q.number})`);
      missing++;
      continue;
    }
    q.audioFile = gcs;
    rewrites++;
  }

  if (rewrites === 0) {
    console.log(`already clean (${alreadyGcs} were already GCS, ${missing} missing)`);
    continue;
  }

  await call('update', { id: t.id, patch: { mock_data: md } });
  console.log(`✓ ${rewrites} audioFile(s) rewritten to GCS, ${alreadyGcs} already GCS, ${missing} missing — Supabase row updated.`);
}

console.log('\nDone.');
