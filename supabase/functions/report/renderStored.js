// ============================================================================
// renderStored — turn a stored report path into a finished HTML document.
// ----------------------------------------------------------------------------
// One resolution path shared by `report` (the View Report link) and
// `report-locked` (the encrypted Telegram file), so a report looks the same
// whichever way it is opened:
//
//   <uuid>.html  → a finished report, served as it stands
//   <uuid>.json  → an ATTEMPT PAYLOAD, rendered fresh:
//                    kind 'ielts-reading' / 'cefr-reading' → the review page
//                    kind 'full-mock'                      → the four-skill page
//
// Storage is checked first, then the permanent GCS archive (retention clears
// the bucket after a week; the archive keeps every report and recording).
// ============================================================================
import { renderReadingReview } from './renderReadingReview.js';
import { renderFullMock } from './renderFullMock.js';

const ARCHIVE = 'https://storage.googleapis.com/mockstream-report-archive/';

/** Raw bytes of a stored path as text: bucket first, archive second, else null. */
export async function loadRaw(sb, path) {
  try {
    const { data, error } = await sb.storage.from('reports').download(path);
    if (!error && data) return await data.text();
  } catch { /* fall through to the archive */ }
  try {
    const arch = await fetch(ARCHIVE + encodeURI(path));
    if (arch.ok) return await arch.text();
  } catch { /* nothing left to try */ }
  return null;
}

/** The stored path of one full-mock skill entry: an explicit path, the row's
 *  own report_path, or a guess (payload first — reading now stores JSON). */
async function skillPath(sb, centre, entry) {
  if (entry.path) return entry.path;
  const id = String(entry.id || '').trim();
  if (!id) return null;
  try {
    const { data } = await sb.from('results').select('report_path').eq('id', id).maybeSingle();
    if (data && data.report_path) return data.report_path;
  } catch { /* fall back to the naming convention */ }
  return `${centre}/${id}.json`;
}

/**
 * @param sb   service-role Supabase client
 * @param path "<centre>/<uuid>.html" | "<centre>/<uuid>.json"
 * @param raw  the stored text (pass it in when the caller already downloaded it)
 * @returns { html } or { error }
 */
export async function renderStored(sb, path, raw) {
  const text = raw != null ? raw : await loadRaw(sb, path);
  if (text == null) return { error: 'not_found' };
  if (!path.endsWith('.json')) return { html: text };

  let payload;
  try {
    payload = JSON.parse(text);
  } catch (e) {
    return { error: 'bad_payload: ' + e.message };
  }

  if (payload && payload.kind === 'full-mock') {
    const centre = path.split('/')[0];
    const html = await renderFullMock(payload, async (entry) => {
      const sp = await skillPath(sb, centre, entry);
      // A legacy zip skill report holds binary — embedding it would paint
      // garbage into the frame; show the tab as missing instead.
      if (!sp || sp.endsWith('.zip')) return null;
      let sub = await loadRaw(sb, sp);
      // A reading skill saved as a payload renders through the review page; a
      // guessed .json that does not exist falls back to the .html twin.
      if (sub == null && !entry.path && sp.endsWith('.json')) {
        sub = await loadRaw(sb, sp.replace(/\.json$/, '.html'));
        if (sub != null) return sub;
      }
      if (sub == null) return null;
      if (!sp.endsWith('.json')) return sub;
      try {
        return renderReadingReview(JSON.parse(sub));
      } catch {
        return null;
      }
    });
    return { html };
  }

  try {
    return { html: renderReadingReview(payload) };
  } catch (e) {
    return { error: 'render_failed: ' + e.message };
  }
}
