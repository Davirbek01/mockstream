// ============================================================================
// twoUpImages — keep a question's pair of pictures on ONE line.
// ----------------------------------------------------------------------------
// The web full mock writes its own speaking section with
//
//   <div style="display:flex; gap:10px; flex-wrap:wrap;">
//     <img style="max-width:48%; border:2px solid …">
//
// and no border-box, so each picture actually occupies 48% + 4px of border.
// Two of them plus the 10px gap need 100% + 18px, which fits only while the
// column is wider than ~440px — below that `flex-wrap` drops the second
// picture onto its own line. On a phone the pair is always stacked, while the
// standalone speaking report (which sizes its images inside flex children) and
// both apps show them side by side.
//
// The generator is fixed, but every report already stored keeps the markup it
// was saved with, so the rule goes in on the way out. It is scoped to exactly
// that inline-style shape, and inert on a report that never had it.
// ============================================================================
const TWO_UP_CSS =
  '<style>div[style*="flex-wrap:wrap"] > img[style*="max-width:48%"]' +
  '{box-sizing:border-box;max-width:calc(50% - 7px)!important;height:auto}</style>';

/** Add the rule to a stored report whose pictures would otherwise wrap. */
export function withTwoUpImages(html) {
  if (!html) return html;
  if (html.indexOf('calc(50% - 7px)') >= 0) return html;      // already carries it
  if (html.indexOf('max-width:48%') < 0) return html;         // nothing to fix
  return html.indexOf('</body>') >= 0
    ? html.replace('</body>', TWO_UP_CSS + '</body>')
    : html + TWO_UP_CSS;
}

export default withTwoUpImages;
