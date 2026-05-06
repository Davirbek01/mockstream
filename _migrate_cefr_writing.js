#!/usr/bin/env node
// One-shot migration: every site/questions W/writing-questions*.js is read,
// parsed, and POSTed to the admin-mocks Edge Function as a `create` action.
// Mock 01 (id=9) is already in Supabase, so we skip writing-questions01.js
// (which doesn't exist anyway after Phase 1's rm). The script is idempotent
// over re-runs at the file level: if you run it twice, you'll duplicate
// rows — so check with the SQL guard before re-running.
//
// Usage:  node _migrate_cefr_writing.js <super_admin_passcode>
//
// Auth: super-admin passcode passed via argv (never written to disk, never
// logged). Same passcode the user types into the Mock Settings panel.
//
// On exit: prints a per-mock log + a summary { ok, fail }. Failures don't
// abort the run — we want to see ALL the broken ones in one pass.

const fs = require('fs');
const path = require('path');

const PASSCODE = process.argv[2];
if (!PASSCODE) {
  console.error('Usage: node _migrate_cefr_writing.js <super_admin_passcode>');
  process.exit(1);
}

const ENDPOINT = 'https://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/admin-mocks';
const QUESTIONS_DIR = path.join(__dirname, 'site', 'questions W');

function parseMockFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  // The files are wrapped as `window.WRITING_TEST_DATA = { ... };`.
  // Strip the prefix and trailing semicolon, then JSON.parse the body.
  const m = raw.match(/window\.WRITING_TEST_DATA\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
  if (!m) throw new Error('could not locate WRITING_TEST_DATA assignment');
  return JSON.parse(m[1]);
}

function mockNumberFromName(name) {
  // writing-questions02.js → 2, writing-questions100.js → 100
  const m = name.match(/writing-questions(\d+)\.js$/);
  if (!m) return null;
  return parseInt(m[1], 10);
}

async function postCreate(payload) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      adminPasscode: PASSCODE,
      action: 'create',
      ...payload
    })
  });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = { raw: text }; }
  return { status: res.status, body };
}

(async () => {
  if (!fs.existsSync(QUESTIONS_DIR)) {
    console.error('Questions directory missing:', QUESTIONS_DIR);
    process.exit(1);
  }
  const files = fs.readdirSync(QUESTIONS_DIR)
    .filter(f => /^writing-questions\d+\.js$/.test(f))
    .map(f => ({ name: f, num: mockNumberFromName(f) }))
    .filter(x => x.num != null && x.num !== 1)   // skip Mock 01 — already in Supabase
    .sort((a, b) => a.num - b.num);

  console.log(`Found ${files.length} CEFR Writing mocks to migrate (skipping Mock 01).`);

  const results = { ok: [], fail: [] };
  for (const f of files) {
    const padded = String(f.num).padStart(2, '0');
    const filePath = path.join(QUESTIONS_DIR, f.name);
    let mockData;
    try {
      mockData = parseMockFile(filePath);
    } catch (e) {
      console.log(`  ✗ ${f.name}: parse error — ${e.message}`);
      results.fail.push({ name: f.name, error: e.message });
      continue;
    }
    const payload = {
      mock_type:   'cefr-writing',
      mock_number: f.num,
      title:       `CEFR Writing Mock ${padded}`,
      status:      'published',
      mock_data:   mockData
    };
    const { status, body } = await postCreate(payload);
    if (status === 200 && body.id) {
      console.log(`  ✓ ${f.name} → mock_tests.id = ${body.id}`);
      results.ok.push({ name: f.name, mock_number: f.num, id: body.id });
    } else {
      console.log(`  ✗ ${f.name} → HTTP ${status}: ${JSON.stringify(body)}`);
      results.fail.push({ name: f.name, status, body });
    }
  }

  console.log('');
  console.log(`Summary: ${results.ok.length} OK, ${results.fail.length} failed`);
  if (results.fail.length) {
    console.log('Failures:');
    results.fail.forEach(f => console.log('  ', f));
    process.exit(2);
  }
})();
