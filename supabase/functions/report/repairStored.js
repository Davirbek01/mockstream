// ============================================================================
// repairStored — mend reports that were saved with a broken inline script.
// ----------------------------------------------------------------------------
// A report's JS is written inside a template literal, so `\d` in the source is
// eaten and the saved file got `/^Qd+s*(/`. An invalid regex literal is a PARSE
// error, which kills the whole script — and with it openAiModal(), so the AI
// view could not be opened at all. The generators are fixed, but reports saved
// in that window are static files sitting in storage and the archive.
//
// Rather than rewrite thousands of stored files, the two functions that serve a
// report repair the known-bad literals on the way out. Cheap, idempotent, and
// harmless for reports that never had the bug.
// ============================================================================
const BROKEN = [
  ['/^Qd+s*(/', '/^Q\\d+\\s*\\(/'],
  ['/^Qd+/', '/^Q\\d+/'],
  ['/^(?:s*S{1,2}s*)?(?:Task|Part)s[d.]+$/', '/^(?:\\s*\\S{1,2}\\s*)?(?:Task|Part)\\s[\\d.]+$/'],
  ['/(?:Task|Part)s[d.]+/', '/(?:Task|Part)\\s[\\d.]+/'],
];

export function repairStored(html) {
  if (!html || html.indexOf('/^Qd+') < 0) return html;
  let out = html;
  for (const [bad, good] of BROKEN) out = out.split(bad).join(good);
  return out;
}
