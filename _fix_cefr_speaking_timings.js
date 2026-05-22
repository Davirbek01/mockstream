// Fix CEFR Speaking mock timings in-place.
// Targets: each questionsNN.js — for question number 4, 5, 6 only,
// rewrite "prepTime": <num> and "speakTime": <num> to the canonical values.
//   Q4 -> prepTime 10, speakTime 45
//   Q5 -> prepTime 5,  speakTime 30
//   Q6 -> prepTime 5,  speakTime 30
//
// Approach: parse line-by-line. When we see `"number": 4|5|6,`, scan forward
// (up to 30 lines, stopping if we hit the next `"number":`) and rewrite the
// first matching prepTime/speakTime occurrences. Indentation and trailing
// commas are preserved from the original lines.

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'site', 'questions S');
const TARGETS = {
  4: { prep: 10, speak: 45 },
  5: { prep: 5,  speak: 30 },
  6: { prep: 5,  speak: 30 },
};

const files = fs.readdirSync(DIR)
  .filter(f => /^questions(\d*)\.js$/.test(f));

let totalFiles = 0;
let totalEdits = 0;
const perFile = [];

for (const f of files) {
  const fp = path.join(DIR, f);
  const orig = fs.readFileSync(fp, 'utf8');
  const lines = orig.split(/\r?\n/);
  let edits = 0;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*)"number"\s*:\s*([1-8])\s*,/);
    if (!m) continue;
    const qn = Number(m[2]);
    const tgt = TARGETS[qn];
    if (!tgt) continue;

    let prepDone = false;
    let speakDone = false;
    for (let j = i + 1; j < Math.min(i + 30, lines.length); j++) {
      // stop if we entered the next question
      if (/^\s*"number"\s*:\s*\d+\s*,/.test(lines[j])) break;
      if (!prepDone) {
        const pm = lines[j].match(/^(\s*)"prepTime"\s*:\s*(\d+)(\s*,?\s*)$/);
        if (pm) {
          const before = lines[j];
          const after = `${pm[1]}"prepTime": ${tgt.prep}${pm[3]}`;
          if (before !== after) {
            lines[j] = after;
            edits++;
          }
          prepDone = true;
          continue;
        }
      }
      if (!speakDone) {
        const sm = lines[j].match(/^(\s*)"speakTime"\s*:\s*(\d+)(\s*,?\s*)$/);
        if (sm) {
          const before = lines[j];
          const after = `${sm[1]}"speakTime": ${tgt.speak}${sm[3]}`;
          if (before !== after) {
            lines[j] = after;
            edits++;
          }
          speakDone = true;
          continue;
        }
      }
      if (prepDone && speakDone) break;
    }
  }

  if (edits > 0) {
    fs.writeFileSync(fp, lines.join('\n'), 'utf8');
    totalFiles++;
    totalEdits += edits;
    perFile.push({ f, edits });
  }
}

console.log(`Edited ${totalFiles} files, ${totalEdits} line changes total.`);
for (const p of perFile) console.log(`  ${p.f}: ${p.edits} edits`);
