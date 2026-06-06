/* ─────────────────────────────────────────────────────────────
   Cambridge hub — shared JS helpers
   Exposes window.Cambridge with two things any exam hub needs:
     · Cambridge.renderMockGrid(targetId, paperConfig)
     · Cambridge.wireTabs(tabsContainerId)
   Per-exam HTML files (ket.html, pet.html, …) supply the paper
   config; this layer paints the picker + handles tab switching.
   ───────────────────────────────────────────────────────────── */

(function () {
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  /**
   * Render a grid of mock cards into the given container.
   *
   * @param {string} targetId
   *   id of the empty .mock-grid container in the hub HTML.
   * @param {object} cfg
   *   {
   *     count:        number of mocks available, e.g. 8
   *     runnerPath:   absolute path to the runner HTML, e.g.
   *                   '/KET Reading & Writing Mocks.html'
   *     mockParam:    URL param the runner reads, default 'mock'
   *     paperLabel:   short label shown under each card, e.g.
   *                   'Reading & Writing' (defaults to '')
   *     duration:     duration string per mock, e.g. '70 min'
   *     questions:    questions per mock, e.g. 56
   *     parts:        parts per mock, e.g. 9
   *     titleFn:      optional fn(n) → card title; default 'Test N'
   *   }
   */
  function renderMockGrid(targetId, cfg) {
    var host = document.getElementById(targetId);
    if (!host || !cfg) return;
    var n = cfg.count || 0;
    var runner = cfg.runnerPath || '#';
    var param = cfg.mockParam || 'mock';
    var titleFn = cfg.titleFn || function (i) { return 'Test ' + i; };
    var metaBits = [];
    if (cfg.parts)     metaBits.push(cfg.parts + ' parts');
    if (cfg.questions) metaBits.push(cfg.questions + ' questions');
    if (cfg.duration)  metaBits.push(cfg.duration);
    var meta = metaBits.join(' · ');
    var html = '';
    for (var i = 1; i <= n; i++) {
      var url = runner + '?' + param + '=' + i;
      html += '<a class="mock-card" href="' + escapeHtml(url) + '">'
            +   '<div class="mc-badge">' + i + '</div>'
            +   '<div class="mc-title">' + escapeHtml(titleFn(i)) + '</div>'
            +   '<div class="mc-meta">' + escapeHtml(meta) + '</div>'
            +   '<div class="mc-cta">Start</div>'
            + '</a>';
    }
    host.innerHTML = html;
  }

  /**
   * Wire a .hub-tabs container so clicking a [data-paper] tab
   * activates the matching [data-pane] section. Honours the
   * `disabled` attribute on tabs (used for "SOON" papers) so
   * they don't activate panes that aren't ready yet.
   */
  function wireTabs(tabsId) {
    var tabs = document.getElementById(tabsId);
    if (!tabs) return;
    tabs.addEventListener('click', function (e) {
      var btn = e.target.closest('.tab');
      if (!btn || btn.disabled || btn.classList.contains('disabled')) return;
      var paper = btn.getAttribute('data-paper');
      if (!paper) return;
      tabs.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
      btn.classList.add('active');
      document.querySelectorAll('.paper-pane').forEach(function (pane) {
        pane.hidden = pane.getAttribute('data-pane') !== paper;
      });
      // Update the URL hash so refreshes stick on the right tab
      try {
        var u = new URL(location.href);
        u.searchParams.set('paper', paper);
        history.replaceState(null, '', u.toString());
      } catch (_e) {}
    });
    // Honour ?paper=… on load (e.g. landing-v3 deep-links to a paper)
    try {
      var initial = new URLSearchParams(location.search).get('paper');
      if (initial) {
        var match = tabs.querySelector('.tab[data-paper="' + initial + '"]');
        if (match && !match.disabled && !match.classList.contains('disabled')) {
          match.click();
        }
      }
    } catch (_e) {}
  }

  window.Cambridge = { renderMockGrid: renderMockGrid, wireTabs: wireTabs };
})();
