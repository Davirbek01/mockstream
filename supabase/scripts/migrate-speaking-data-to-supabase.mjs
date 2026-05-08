#!/usr/bin/env node
// Phase 3 — migrate static speaking mock JS files into Supabase mock_tests rows.
//
// Usage:
//   ADMIN_PASSCODE=... node supabase/scripts/migrate-speaking-data-to-supabase.mjs           # dry-run
//   ADMIN_PASSCODE=... node supabase/scripts/migrate-speaking-data-to-supabase.mjs --commit  # actually write
//
// Reads each `site/questions S/questionsNN.js` and `site/questions IELTS
// S/ielts-speaking-mock-N.js` via Node's `vm` module so JS quirks (single
// quotes, comments, trailing commas) are handled by the JS engine — not a
// fragile regex parser. Extracts `window.SPEAKING_TEST_DATA` and POSTs it
// to `admin-mocks` create/update.
//
// Skips mock 01 for both skills (Phase-1 pilots already exist in Supabase
// and may have been customised post-migration — don't trample them).
//
// Idempotent: re-running with --commit upserts (creates if (mock_type,
// mock_number) row is missing, updates the existing row otherwise).

import fs   from 'node:fs';
import path from 'node:path';
import vm   from 'node:vm';
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

const COMMIT = process.argv.includes('--commit');
console.log(COMMIT ? '*** LIVE MODE — will create/update Supabase rows ***\n'
                   : '--- DRY-RUN MODE — no DB writes (use --commit to actually migrate) ---\n');

// ── Skill mapping ──────────────────────────────────────────────────────
const SKILLS = [
  {
    dir:        path.join(REPO_ROOT, 'site', 'questions S'),
    skill:      'cefr-speaking',
    filenameRe: /^questions(\d+)\.js$/,
    label:      'CEFR Speaking'
  },
  {
    dir:        path.join(REPO_ROOT, 'site', 'questions IELTS S'),
    skill:      'ielts-speaking',
    filenameRe: /^ielts-speaking-mock-(\d+)\.js$/,
    label:      'IELTS Speaking'
  }
];

// ── Helpers ────────────────────────────────────────────────────────────
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

// Build a Map<"skill:mockNumber", id> from /list — used to detect updates vs creates.
console.log('Querying existing mocks from Supabase...');
const existing = new Map();
{
  const j = await call('list', {});
  for (const m of j.mocks || []) {
    if (m.mock_type === 'cefr-speaking' || m.mock_type === 'ielts-speaking') {
      existing.set(`${m.mock_type}:${m.mock_number}`, m.id);
    }
  }
}
console.log(`  ${existing.size} speaking rows already in Supabase.\n`);

// ── Step A: scan + parse ───────────────────────────────────────────────
const todo = [];
const errors = [];

for (const { dir, skill, filenameRe, label } of SKILLS) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js'));
  for (const f of files) {
    const m = f.match(filenameRe);
    if (!m) continue;            // ielts-mocks-selection.js, questions.js, etc. — not mock data
    const mockNumber = parseInt(m[1], 10);
    if (!Number.isInteger(mockNumber) || mockNumber < 2) continue;  // skip mock 01 (Phase-1 pilot) and any pre-1 IDs

    const fp = path.join(dir, f);
    const code = fs.readFileSync(fp, 'utf8');

    // Sandboxed evaluation. window.SPEAKING_TEST_DATA gets assigned when
    // the script runs. We only expose a fresh `window` object — nothing
    // else from our process leaks in.
    const ctx = { window: {} };
    try {
      vm.createContext(ctx);
      vm.runInContext(code, ctx, { timeout: 5000, filename: f });
    } catch (e) {
      errors.push({ file: f, err: 'vm.runInContext: ' + e.message });
      continue;
    }
    const mockData = ctx.window.SPEAKING_TEST_DATA;
    if (!mockData || typeof mockData !== 'object') {
      errors.push({ file: f, err: 'no SPEAKING_TEST_DATA after eval' });
      continue;
    }
    if (!Array.isArray(mockData.questions) || !mockData.questions.length) {
      errors.push({ file: f, err: 'mock_data.questions missing or empty' });
      continue;
    }

    const titlePadded = String(mockNumber).padStart(2, '0');
    todo.push({
      file:        f,
      skill,
      mock_number: mockNumber,
      title:       `${label} Mock ${titlePadded}`,
      mock_data:   mockData,
      existing_id: existing.get(`${skill}:${mockNumber}`) || null,
      questions:   mockData.questions.length
    });
  }
}

todo.sort((a, b) => a.skill.localeCompare(b.skill) || a.mock_number - b.mock_number);

console.log(`Plan: ${todo.length} files parsed, ${errors.length} errors.\n`);
if (errors.length) {
  console.log('Errors:');
  for (const e of errors) console.log(`  ${e.file}: ${e.err}`);
  console.log();
}

// ── Step B: print summary table (always; both modes) ──────────────────
const creates = todo.filter((t) => !t.existing_id);
const updates = todo.filter((t) =>  t.existing_id);
console.log(`Would CREATE: ${creates.length} rows`);
console.log(`Would UPDATE: ${updates.length} rows (existing for that mock_type+mock_number)`);
console.log();

console.log('Per-skill counts:');
for (const skill of ['cefr-speaking', 'ielts-speaking']) {
  const rows = todo.filter((t) => t.skill === skill);
  const c = rows.filter((t) => !t.existing_id).length;
  const u = rows.filter((t) =>  t.existing_id).length;
  console.log(`  ${skill}: ${rows.length} total — ${c} create, ${u} update`);
}
console.log();

console.log('First 5 + last 5 sample of plan:');
const sample = [...todo.slice(0, 5), ...(todo.length > 10 ? [{ file: '...', skill: '...' }] : []), ...todo.slice(-5)];
for (const t of sample) {
  if (t.file === '...') { console.log('  ...'); continue; }
  const op = t.existing_id ? `UPDATE id=${t.existing_id}` : 'CREATE';
  console.log(`  ${t.file.padEnd(38)}  ${t.skill.padEnd(15)}  #${String(t.mock_number).padStart(2, '0')}  "${t.title}"  ${t.questions}q  ${op}`);
}
console.log();

if (!COMMIT) {
  console.log('--- DRY-RUN COMPLETE — no changes made. Re-run with --commit to migrate.');
  process.exit(0);
}

// ── Step C: live writes ────────────────────────────────────────────────
let okC = 0, okU = 0, fail = 0;
for (let i = 0; i < todo.length; i++) {
  const t = todo[i];
  const idx = `[${String(i + 1).padStart(3)}/${todo.length}]`;
  process.stdout.write(`${idx} ${t.file.padEnd(38)} ${t.skill.padEnd(15)} #${String(t.mock_number).padStart(2,'0')} ... `);
  try {
    if (t.existing_id) {
      await call('update', {
        id: t.existing_id,
        patch: { mock_data: t.mock_data, title: t.title, status: 'published' }
      });
      console.log(`✓ updated id=${t.existing_id}`);
      okU++;
    } else {
      const j = await call('create', {
        mock_type: t.skill,
        mock_number: t.mock_number,
        title: t.title,
        status: 'published',
        mock_data: t.mock_data
      });
      console.log(`✓ created id=${j.id}`);
      okC++;
    }
  } catch (e) {
    console.log(`✗ ${e.message}`);
    fail++;
  }
}

console.log(`\nDone: ${okC} created · ${okU} updated · ${fail} failed.`);
if (fail > 0) process.exit(1);
