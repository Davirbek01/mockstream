#!/usr/bin/env node
// One-shot patcher: rewrites chartImageUrl for IELTS Writing Mocks 1/2/3
// to their new GCS-hosted URLs (after we copied the images out of ImgBB).
// Goes through admin-mocks `update` so the auto-snapshot to
// mock_tests_backups fires per row — every mutation stays reversible.

const PASSCODE = process.argv[2];
if (!PASSCODE) { console.error('Usage: node _patch_iw_chart_urls.js <super_admin_passcode>'); process.exit(1); }

const ENDPOINT = 'https://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/admin-mocks';
const BASE_URL = 'https://storage.googleapis.com/mockstream-listening-audio/IELTS%20writing%20task%20one%20graphs/';

const PATCHES = [
  { id: 8,   filename: '1.jpg' },
  { id: 111, filename: '2.png' },
  { id: 112, filename: '3.png' }
];

async function call(action, payload) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminPasscode: PASSCODE, action, ...payload })
  });
  const text = await res.text();
  let body; try { body = JSON.parse(text); } catch { body = { raw: text }; }
  return { status: res.status, body };
}

(async () => {
  for (const p of PATCHES) {
    const newUrl = BASE_URL + p.filename;
    // 1) Fetch the current mock_data
    const got = await call('get', { id: p.id });
    if (got.status !== 200 || !got.body || !got.body.mock) {
      console.log(`  ✗ id=${p.id}: GET failed — ${JSON.stringify(got.body)}`);
      continue;
    }
    const md = got.body.mock.mock_data;
    if (!md || !md.tasks || !md.tasks.task1) {
      console.log(`  ✗ id=${p.id}: mock_data.tasks.task1 missing`);
      continue;
    }
    const oldUrl = md.tasks.task1.chartImageUrl;
    md.tasks.task1.chartImageUrl = newUrl;
    // 2) PATCH the full mock_data back (auto-snapshot fires before write)
    const upd = await call('update', { id: p.id, patch: { mock_data: md } });
    if (upd.status === 200) {
      console.log(`  ✓ id=${p.id} (${p.filename})`);
      console.log(`        was: ${oldUrl}`);
      console.log(`        now: ${newUrl}`);
    } else {
      console.log(`  ✗ id=${p.id}: UPDATE failed — ${JSON.stringify(upd.body)}`);
    }
  }
})();
