/* =====================================================================
 * q4-descriptions.js
 * ---------------------------------------------------------------------
 * Pre-written descriptions of the CEFR speaking Q4 image pair.
 *
 * WHY THIS EXISTS
 * The Q4 photographs never change once a mock is published, but we were
 * re-describing them with a live vision call on every single attempt —
 * ~7,450 calls a month, ~9.8M input tokens, to re-derive the same two
 * paragraphs. The descriptions are now authored once and stored in
 * mock_data.images, so the scorer reads text instead of pixels.
 *
 * SAFETY: descImg1 / descImg2 record the exact image URLs the text was
 * written against. If an image is ever swapped in the admin panel the
 * URLs stop matching, this helper returns null, and the caller falls
 * back to real vision. A stale description is far more dangerous than
 * no description — it looks authoritative while describing a photo the
 * candidate never saw.
 *
 * Defined ONCE here and loaded by every page that scores speaking.
 * Do not inline a copy: a previous helper was called from six files but
 * defined in two, and every speaking score broke when one drifted.
 * ===================================================================== */
(function () {
  'use strict';

  /**
   * @param  {object} images  mock_data.images
   * @return {object|null}    {both, diff, p1, p2} or null when unusable
   */
  function getStoredQ4Descriptions(images) {
    if (!images) return null;
    var p1 = images.img1Desc, p2 = images.img2Desc;
    if (!p1 || !p2) return null;                       // not backfilled yet

    // The stamp must match the images actually on screen.
    if (images.descImg1 && images.descImg1 !== images.img1) {
      console.warn('[Q4Desc] img1 changed since the description was written — using live vision');
      return null;
    }
    if (images.descImg2 && images.descImg2 !== images.img2) {
      console.warn('[Q4Desc] img2 changed since the description was written — using live vision');
      return null;
    }
    // Older rows may carry descriptions with no stamp at all. Treat that as
    // unverifiable rather than trustworthy.
    if (!images.descImg1 || !images.descImg2) {
      console.warn('[Q4Desc] descriptions present but unstamped — using live vision');
      return null;
    }
    return {
      both: images.pairBoth || '',
      diff: images.pairDiff || '',
      p1: p1,
      p2: p2
    };
  }

  /**
   * Build the prompt block. The anti-inflation paragraph is the important
   * part: without it the scorer treats this text as the target answer and
   * marks down any candidate who says less than it does — which is every
   * candidate, since this is written and they are speaking under time.
   */
  function formatStoredQ4ForScoring(d) {
    if (!d) return '';
    return '\n=== Q4-Q6 PICTURE REFERENCE ===\n' +
      'The two pictures cannot be shown to you, so they are described below.\n' +
      '\n' +
      '⚠️ THIS IS NOT A MODEL ANSWER AND NOT THE EXPECTED LEVEL OF DETAIL.\n' +
      'It is a factual record of what is in the photographs, written for the\n' +
      'examiner. A real candidate speaking for one minute will mention only a\n' +
      'few of these things, and that is normal and fully acceptable. Do NOT\n' +
      'reduce any score because the candidate covered fewer details than\n' +
      'appear here, and do NOT expect this vocabulary or sentence structure.\n' +
      '\n' +
      'Use it for ONE purpose only: to check whether what the candidate said\n' +
      'is actually present in the pictures. If they describe something that\n' +
      'clearly contradicts this record, treat the answer as off-topic. If a\n' +
      'detail they mention is simply not listed here, do NOT treat that as an\n' +
      'error — the record is not exhaustive.\n' +
      '\n' +
      (d.both ? 'Both pictures: ' + d.both + '\n' : '') +
      (d.diff ? 'Main difference: ' + d.diff + '\n' : '') +
      'Picture 1: ' + d.p1 + '\n' +
      'Picture 2: ' + d.p2 + '\n' +
      '===============================\n';
  }

  window.getStoredQ4Descriptions = getStoredQ4Descriptions;
  window.formatStoredQ4ForScoring = formatStoredQ4ForScoring;
})();
