// Audit IELTS Speaking mock timings against the spec the user gave:
//   Q1-Q7  : prep 5  / speak 30
//   Q8     : prep 60 / speak 120
//   Q9-Q10 : prep 5  / speak 30
//   Q11-Q17: prep 5  / speak 45
//
// Reports per-mock mismatches.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DIR = path.join(__dirname, 'site', 'questions IELTS S');

const EXPECTED = {};
for (let q = 1;  q <= 7;  q++) EXPECTED[q] = { prep: 5,  speak: 30  };
EXPECTED[8] =                                  { prep: 60, speak: 120 };
EXPECTED[9] =                                  { prep: 5,  speak: 30  };
EXPECTED[10] =                                 { prep: 5,  speak: 30  };
for (let q = 11; q <= 17; q++) EXPECTED[q] = { prep: 5,  speak: 45  };

const files = fs.readdirSync(DIR)
  .filter(f => /^ielts-speaking-mock-(\d+)\.js$/.test(f))
  .sort((a, b) => Number(a.match(/(\d+)/)[1]) - Number(b.match(/(\d+)/)[1]));

console.log(`Scanning ${files.length} IELTS speaking mock files...\n`);

const issues = [];
let okCount = 0;

for (const f of files) {
  const mockNum = Number(f.match(/(\d+)/)[1]);
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  try {
    vm.runInContext(fs.readFileSync(path.join(DIR, f), 'utf8'), sandbox, { filename: f });
  } catch (e) {
    issues.push({ mockNum, file: f, error: `parse: ${e.message}` });
    continue;
  }
  // IELTS data lives at window.IELTS_SPEAKING_TEST_DATA or similar — try a few names
  const candidates = ['IELTS_SPEAKING_TEST_DATA', 'SPEAKING_TEST_DATA', 'IELTS_SPEAKING_DATA'];
  let data = null;
  for (const k of candidates) if (sandbox.window[k]) { data = sandbox.window[k]; break; }
  if (!data) {
    // try any global with .questions
    for (const k of Object.keys(sandbox.window)) {
      if (sandbox.window[k] && Array.isArray(sandbox.window[k].questions)) { data = sandbox.window[k]; break; }
    }
  }
  if (!data || !Array.isArray(data.questions)) {
    issues.push({ mockNum, file: f, error: 'no questions array' });
    continue;
  }
  const mismatches = [];
  for (const q of data.questions) {
    const exp = EXPECTED[q.number];
    if (!exp) continue;
    if (q.prepTime !== exp.prep || q.speakTime !== exp.speak) {
      mismatches.push({ q: q.number, gotPrep: q.prepTime, gotSpeak: q.speakTime, expPrep: exp.prep, expSpeak: exp.speak });
    }
  }
  const haveNums = new Set(data.questions.map(q => q.number));
  for (const n of Object.keys(EXPECTED).map(Number)) {
    if (!haveNums.has(n)) mismatches.push({ q: n, missing: true });
  }
  if (mismatches.length === 0) okCount++;
  else issues.push({ mockNum, file: f, mismatches });
}

console.log(`OK: ${okCount}/${files.length}`);
console.log(`Mocks with issues: ${issues.length}\n`);

// Group identical mismatch patterns
const patternMap = new Map();
for (const it of issues) {
  if (it.error) {
    const k = `ERROR: ${it.error}`;
    if (!patternMap.has(k)) patternMap.set(k, []);
    patternMap.get(k).push(it.mockNum);
    continue;
  }
  const k = JSON.stringify(it.mismatches.map(m => m.missing ? `Q${m.q}:MISSING` : `Q${m.q}:got=${m.gotPrep}/${m.gotSpeak}|exp=${m.expPrep}/${m.expSpeak}`));
  if (!patternMap.has(k)) patternMap.set(k, []);
  patternMap.get(k).push(it.mockNum);
}

console.log(`=== Pattern groups ===`);
for (const [k, mocks] of patternMap.entries()) {
  console.log(`\nMocks (${mocks.length}): ${mocks.join(', ')}`);
  console.log(`  ${k}`);
}
