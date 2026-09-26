/* ============================================================================
 * correction-diff — mark the word that changed, not the sentence it was in
 * ----------------------------------------------------------------------------
 * The AI returns each correction as a pair: what the student wrote and what it
 * should say. The report drew both in full — the original struck through, the
 * replacement beside it — so a missing article looked like a rewritten clause:
 *
 *     GRAMMAR  p̶r̶o̶t̶e̶c̶t̶ ̶a̶n̶i̶m̶a̶l̶s̶ ̶a̶n̶d̶ ̶e̶n̶v̶i̶r̶o̶n̶m̶e̶n̶t̶  →  protect animals and the environment
 *
 * A student reading that cannot tell what they did wrong, and it makes four
 * correct words look like mistakes. The pair already contains the answer, so
 * this compares the two and marks only what actually differs:
 *
 *     GRAMMAR  protect animals and the environment
 *                                 ^^^ added
 *
 * Nothing about the scoring or the model's output changes — this is the same
 * correction, read the way a teacher would mark it.
 *
 * It rewrites the chips already on the page rather than the sixty-odd places
 * that build them, so every report page gets it from one include, and a chip
 * it cannot parse is left exactly as it was.
 * ==========================================================================*/

(function () {
  'use strict';

  var MARK = 'data-msdiff';           // set once a chip has been handled

  /** Words, keeping punctuation attached the way a reader sees it. */
  function tokenize(s) {
    return String(s == null ? '' : s).split(/(\s+)/).filter(function (t) { return t !== ''; });
  }

  function bare(t) {
    return t.toLowerCase().replace(/^[^\w']+|[^\w']+$/g, '');
  }

  /**
   * Longest common subsequence over words, which is what makes a one-word
   * insertion read as one word rather than as a rewritten line. Bounded: a
   * very long pair falls back to showing both in full, because past a certain
   * size the diff stops being the clearer picture anyway.
   */
  function diff(aTok, bTok) {
    var n = aTok.length, m = bTok.length;
    if (n > 120 || m > 120) return null;
    var dp = [], i, j;
    for (i = 0; i <= n; i++) { dp[i] = []; for (j = 0; j <= m; j++) dp[i][j] = 0; }
    for (i = n - 1; i >= 0; i--) {
      for (j = m - 1; j >= 0; j--) {
        dp[i][j] = bare(aTok[i]) === bare(bTok[j])
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    var out = [];
    i = 0; j = 0;
    while (i < n && j < m) {
      if (bare(aTok[i]) === bare(bTok[j])) {
        // Same word, different punctuation — "add." against "add?", "Hello"
        // against "Hello,". Alignment ignores punctuation so the two line up,
        // but the difference IS the correction, so it still has to be shown.
        if (aTok[i] === bTok[j]) out.push({ op: '=', text: bTok[j] });
        else { out.push({ op: '-', text: aTok[i] }); out.push({ op: '+', text: bTok[j] }); }
        i++; j++;
      }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ op: '-', text: aTok[i] }); i++; }
      else { out.push({ op: '+', text: bTok[j] }); j++; }
    }
    while (i < n) { out.push({ op: '-', text: aTok[i++] }); }
    while (j < m) { out.push({ op: '+', text: bTok[j++] }); }
    return out;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;';
    });
  }

  /**
   * The marked-up correction, or null when the two sides share too little for
   * a diff to help — a wholly rewritten sentence is clearer shown as before.
   */
  function render(from, to, strikeColor) {
    var parts = diff(tokenize(from), tokenize(to));
    if (!parts) return null;

    var kept = 0, changed = 0;
    parts.forEach(function (p) {
      if (/^\s+$/.test(p.text)) return;
      if (p.op === '=') kept++; else changed++;
    });
    if (!changed) return null;                 // nothing to point at
    // Nothing in common. For one word against one word the old side-by-side is
    // already the clearest thing to show; for longer text it means the sentence
    // was rewritten, and a diff of a rewrite is noise.
    if (kept === 0) return null;

    var html = '';
    parts.forEach(function (p) {
      if (p.op === '=') { html += esc(p.text); return; }
      if (/^\s+$/.test(p.text)) { html += p.text; return; }
      html += p.op === '-'
        ? '<i style="text-decoration:line-through;color:' + strikeColor + ';font-style:normal;">' + esc(p.text) + '</i>'
        : '<b style="color:#059669;">' + esc(p.text) + '</b>';
    });
    return html;
  }

  /**
   * One chip: an <i> holding what was written and a <b> holding the fix. Both
   * are replaced by a single marked-up line.
   */
  function upgrade(chip) {
    if (chip.getAttribute(MARK)) return;
    var oldEl = chip.querySelector('i[style*="line-through"]');
    var newEl = oldEl && oldEl.parentNode.querySelector('b:last-of-type');
    if (!oldEl || !newEl || newEl === oldEl) return;

    var from = oldEl.textContent.trim();
    var to = newEl.textContent.trim();
    if (!from || !to || from === to) return;

    var colour = (oldEl.style && oldEl.style.color) || '#dc2626';
    var html = render(from, to, colour);
    chip.setAttribute(MARK, '1');
    if (!html) return;                          // leave the original wording alone

    // Drop the arrow and the old/new pair, leaving the label in place.
    var arrow = null;
    [].forEach.call(chip.querySelectorAll('span'), function (sp) {
      if (/^[→>-]+$/.test((sp.textContent || '').trim())) arrow = sp;
    });
    if (arrow && arrow.parentNode) arrow.parentNode.removeChild(arrow);
    newEl.parentNode.removeChild(newEl);
    oldEl.outerHTML = '<span style="font-style:normal;">' + html + '</span>';
  }

  /** Every chip that carries a struck-through original. */
  function sweep(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var olds = scope.querySelectorAll('i[style*="line-through"]');
    for (var i = 0; i < olds.length; i++) {
      var chip = olds[i].closest ? olds[i].closest('span') : null;
      if (chip) upgrade(chip);
    }
  }

  var pending = null;
  function schedule(root) {
    clearTimeout(pending);
    pending = setTimeout(function () { try { sweep(root); } catch (e) { } }, 80);
  }

  window.MsCorrectionDiff = { render: render, sweep: sweep };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { schedule(); });
  } else {
    schedule();
  }
  // Feedback arrives after its own request, and results screens are rebuilt as
  // the student moves between tasks.
  try {
    new MutationObserver(function () { schedule(); })
      .observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) { }
})();
