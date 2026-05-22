// Audit CEFR Speaking mock timings.
// Expected per question:
//   Q1-Q3: prep 5  / speak 30
//   Q4   : prep 10 / speak 45
//   Q5-Q6: prep 5  / speak 30
//   Q7-Q8: prep 60 / speak 120
//
// Reads every site/questions S/questions*.js, evaluates the file in a
// minimal sandbox so window.SPEAKING_TEST_DATA gets populated, and
// reports per-mock mismatches.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DIR = path.join(__dirname, 'site', 'questions S');
const EXPECTED = {
  1: { prep: 5,  speak: 30  },
  2: { prep: 5,  speak: 30  },
  3: { prep: 5,  speak: 30  },
  4: { prep: 10, speak: 45  },
  5: { prep: 5,  speak: 30  },
  6: { prep: 5,  speak: 30  },
  7: { prep: 60, speak: 120 },
  8: { prep: 60, speak: 120 },
};

const files = fs.readdirSync(DIR)
  .filter(f => /^questions(\d*)\.js$/.test(f))
  .sort((a, b) => {
    const na = a === 'questions.js' ? 1 : Number(a.match(/(\d+)/)[1]);
    const nb = b === 'questions.js' ? 1 : Number(b.match(/(\d+)/)[1]);
    return na - nb;
  });

console.log(`Scanning ${files.length} mock files...\n`);

const issues = [];
let okCount = 0;

for (const f of files) {
  const mockNum = f === 'questions.js' ? 1 : Number(f.match(/(\d+)/)[1]);
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  try {
    vm.runInContext(src, sandbox, { filename: f });
  } catch (e) {
    issues.push({ mock: mockNum, file: f, error: `parse: ${e.message}` });
    continue;
  }
  const data = sandbox.window.SPEAKING_TEST_DATA;
  if (!data || !Array.isArray(data.questions)) {
    issues.push({ mock: mockNum, file: f, error: 'no SPEAKING_TEST_DATA.questions' });
    continue;
  }
  const mismatches = [];
  for (const q of data.questions) {
    const exp = EXPECTED[q.number];
    if (!exp) continue;
    if (q.prepTime !== exp.prep || q.speakTime !== exp.speak) {
      mismatches.push({
        q: q.number,
        gotPrep: q.prepTime,
        gotSpeak: q.speakTime,
        expPrep: exp.prep,
        expSpeak: exp.speak,
      });
    }
  }
  // Also flag if a question is missing
  const haveNums = new Set(data.questions.map(q => q.number));
  for (const n of Object.keys(EXPECTED).map(Number)) {
    if (!haveNums.has(n)) mismatches.push({ q: n, missing: true });
  }
  if (mismatches.length === 0) okCount++;
  else issues.push({ mock: mockNum, file: f, mismatches });
}

console.log(`OK: ${okCount}/${files.length}`);
console.log(`Mocks with issues: ${issues.length}\n`);

for (const it of issues) {
  console.log(`Mock ${String(it.mock).padStart(2, '0')} (${it.file}):`);
  if (it.error) {
    console.log(`  ERROR: ${it.error}`);
    continue;
  }
  for (const m of it.mismatches) {
    if (m.missing) {
      console.log(`  Q${m.q}: MISSING`);
    } else {
      console.log(`  Q${m.q}: got prep=${m.gotPrep}/speak=${m.gotSpeak}, expected prep=${m.expPrep}/speak=${m.expSpeak}`);
    }
  }
}
