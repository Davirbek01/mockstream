/* =====================================================================
 * task1-chart-data.js
 * ---------------------------------------------------------------------
 * Pre-extracted data records for IELTS Writing Task 1 charts.
 *
 * WHY
 * Task 1 grading turns on whether the candidate reported the figures
 * accurately. That used to mean a live vision call on every submission —
 * re-reading the same fixed chart for every student, at cost, and
 * NON-DETERMINISTICALLY: vision misreads charts differently run to run, so
 * two identical essays could be told different things about the same graph.
 * The record is now extracted once at authoring time and verified, so
 * grading is reproducible as well as cheaper.
 *
 * SAFETY
 * chartDescImg stamps the image URL the record was built from. If the chart
 * is replaced the URLs stop matching, this returns null, and the caller
 * falls back to live vision. A stale record is far worse than none here:
 * a wrong figure marks a CORRECT student wrong, silently, on every future
 * attempt of that mock.
 *
 * Defined once, loaded by every client that grades Task 1.
 * ===================================================================== */
(function () {
  'use strict';

  /**
   * @param  {object} task1  mock_data.tasks.task1
   * @return {object|null}   the stored record, or null → use live vision
   */
  function getStoredChartData(task1) {
    if (!task1 || !task1.chartDesc) return null;
    if (!task1.chartDescImg) {
      console.warn('[T1Chart] record present but unstamped — using live vision');
      return null;
    }
    if (task1.chartDescImg !== task1.chartImageUrl) {
      console.warn('[T1Chart] chart image changed since the record was made — using live vision');
      return null;
    }
    return task1.chartDesc;
  }

  function line(label, v) { return v ? label + ': ' + v + '\n' : ''; }

  function seriesBlock(series) {
    return (series || []).map(function (s) {
      var pts = (s.points || []).map(function (p) { return p.at + '=' + p.value; }).join(', ');
      return '  ' + s.name + ': ' + pts;
    }).join('\n');
  }

  /**
   * Render the record for the scoring prompt.
   *
   * The framing matters as much as the figures. This is a FACT SHEET, not a
   * model answer: the examiner must judge whether the candidate selected and
   * reported the important data, not whether they mentioned every number. An
   * exhaustive record presented as the standard would fail candidates for
   * omitting detail that no Band 9 answer would include either.
   */
  function formatChartDataForScoring(d) {
    if (!d) return '';
    var out = '\n=== TASK 1 CHART — VERIFIED DATA ===\n' +
      'You cannot see the chart. This is a transcription of what it contains,\n' +
      'checked by a human against the image.\n' +
      '\n' +
      '⚠️ THIS IS NOT A MODEL ANSWER. A Band 9 response selects the significant\n' +
      'features and makes comparisons — it does NOT list every figure. Do not\n' +
      'penalise a candidate for omitting data, only for reporting it WRONGLY or\n' +
      'for missing the main trend.\n' +
      '\n' +
      'Use it to check: (a) are the figures the candidate quotes correct?\n' +
      '(b) did they identify the overview/main trend? (c) did they invent data\n' +
      'that is not here?\n\n';

    out += line('Chart type', d.chartType);
    out += line('Title', d.title);
    out += line('Horizontal axis', d.xAxis);
    out += line('Vertical axis', d.yAxis);
    out += line('Period', d.period);

    if (d.series && d.series.length) out += '\nDATA:\n' + seriesBlock(d.series) + '\n';

    if (d.visuals && d.visuals.length) {
      out += '\nThis task shows MORE THAN ONE visual. Their figures are separate —\n' +
             'do not treat a value from one as belonging to the other.\n';
      d.visuals.forEach(function (v, i) {
        out += '\n[' + (i + 1) + '] ' + (v.kind || 'visual') + (v.caption ? ' — ' + v.caption : '') + '\n';
        if (v.xAxis) out += '  x: ' + v.xAxis + (v.yAxis ? '  y: ' + v.yAxis : '') + '\n';
        out += seriesBlock(v.series) + '\n';
      });
    }

    if (d.stages && d.stages.length) {
      out += '\nSTAGES (in order):\n' + d.stages.map(function (s) {
        return '  ' + s.n + '. ' + s.label + (s.detail ? ' — ' + s.detail : '');
      }).join('\n') + '\n';
    }

    if (d.views && d.views.length) {
      out += '\nVIEWS:\n' + d.views.map(function (v) {
        return '  ' + v.name + ': ' + (v.features || []).join(', ');
      }).join('\n') + '\n';
      if (d.changes && d.changes.length) out += 'CHANGES: ' + d.changes.join('; ') + '\n';
      if (d.unchanged && d.unchanged.length) out += 'UNCHANGED: ' + d.unchanged.join('; ') + '\n';
    }

    if (d.overview) out += '\nOVERVIEW (the main trend the candidate should identify):\n  ' + d.overview + '\n';
    if (d.keyFeatures && d.keyFeatures.length) {
      out += '\nKEY FEATURES:\n' + d.keyFeatures.map(function (k) { return '  • ' + k; }).join('\n') + '\n';
    }

    // Honesty about the record's own limits. Without this the examiner treats
    // absence of a figure as proof the candidate invented it.
    if (d.unreadable && d.unreadable.length) {
      out += '\nNOT CAPTURED — the following could not be read off the chart, so a\n' +
             'candidate may legitimately mention detail that is missing above.\n' +
             'Do NOT treat such a mention as invented:\n' +
             d.unreadable.map(function (u) { return '  • ' + u; }).join('\n') + '\n';
    }
    if (String(d.confidence || '').toLowerCase() !== 'high') {
      out += '\nNote: values on this chart are not printed and were read off the\n' +
             'axis, so a candidate figure within one gridline of the value above\n' +
             'should be accepted as correct.\n';
    }

    return out + '====================================\n';
  }

  window.getStoredChartData = getStoredChartData;
  window.formatChartDataForScoring = formatChartDataForScoring;
})();
