// Audit copy that targets vite-app/questions S/.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DIR = path.join(__dirname, 'vite-app', 'questions S');
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

const files = fs.readdirSync(DIR).filter(f => /^questions(\d*)\.js$/.test(f));
const issues = [];
let ok = 0;
for (const f of files) {
  const mockNum = f === 'questions.js' ? 1 : Number(f.match(/(\d+)/)[1]);
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  try { vm.runInContext(fs.readFileSync(path.join(DIR, f), 'utf8'), sandbox, { filename: f }); }
  catch (e) { issues.push({ mockNum, error: e.message }); continue; }
  const data = sandbox.window.SPEAKING_TEST_DATA;
  if (!data || !Array.isArray(data.questions)) { issues.push({ mockNum, error: 'no questions' }); continue; }
  const ms = [];
  for (const q of data.questions) {
    const e = EXPECTED[q.number]; if (!e) continue;
    if (q.prepTime !== e.prep || q.speakTime !== e.speak) {
      ms.push({ q: q.number, gp: q.prepTime, gs: q.speakTime, ep: e.prep, es: e.speak });
    }
  }
  if (ms.length === 0) ok++; else issues.push({ mockNum, ms });
}
console.log(`vite-app: OK ${ok}/${files.length}, issues ${issues.length}`);
for (const it of issues.slice(0, 5)) {
  console.log(`  Mock ${it.mockNum}:`, it.ms || it.error);
}
if (issues.length > 5) console.log(`  ... and ${issues.length - 5} more`);
