#!/usr/bin/env node
// One-shot migration: every site/questions IELTS W/ielts-mock-NN.js read,
// parsed, POSTed to admin-mocks `create`. Mock 01 (id=8) is already in
// Supabase, so we skip ielts-mock-01.js (which doesn't exist anyway after
// Phase 1's rm). Mirrors _migrate_cefr_writing.js — see that file's docstring.
//
// Usage:  node _migrate_ielts_writing.js <super_admin_passcode>

const fs = require('fs');
const path = require('path');

const PASSCODE = process.argv[2];
if (!PASSCODE) {
  console.error('Usage: node _migrate_ielts_writing.js <super_admin_passcode>');
  process.exit(1);
}

const ENDPOINT = 'https://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/admin-mocks';
const QUESTIONS_DIR = path.join(__dirname, 'site', 'questions IELTS W');

function parseMockFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  // The IELTS Writing files wrap as `window.IELTS_WRITING_TEST_DATA = { ... };`.
  const m = raw.match(/window\.IELTS_WRITING_TEST_DATA\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
  if (!m) throw new Error('could not locate IELTS_WRITING_TEST_DATA assignment');
  return JSON.parse(m[1]);
}

function mockNumberFromName(name) {
  // ielts-mock-02.js → 2, ielts-mock-30.js → 30
  const m = name.match(/ielts-mock-(\d+)\.js$/);
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
    .filter(f => /^ielts-mock-\d+\.js$/.test(f))
    .map(f => ({ name: f, num: mockNumberFromName(f) }))
    .filter(x => x.num != null && x.num !== 1)   // skip Mock 01 — already in Supabase
    .sort((a, b) => a.num - b.num);

  console.log(`Found ${files.length} IELTS Writing mocks to migrate (skipping Mock 01).`);

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
      mock_type:   'ielts-writing',
      mock_number: f.num,
      title:       `IELTS Writing Mock ${padded}`,
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
