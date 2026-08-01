// ═══════════════════════════════════════════════════════════════════════
// System Prompts — admin host panel (Phase 6-E pilot).
// Per-skill / per-exam AI scoring prompts (system + user), plus AI
// provider selector, fallback selector, transcription helper selector,
// and Models tab. Writes to site_settings.scoring_*.
//
// landing.html keeps its own inline copy of CSS + HTML + JS so the
// legacy /landing.html?openSiteMgmt=1 → System Prompts flow stays
// byte-for-byte untouched.
//
// Exposes window.AdminPanels.systemPrompts.open(container).
// ═══════════════════════════════════════════════════════════════════════
(function () {
  var _inlineContainer = null;
  var _spHtmlInjected = false;
  var _spTabsWired = false;
  var _siteAdminUnlocked = false;

  function _injectStyles() {
    if (document.getElementById('spPanelStyles')) return;
    var s = document.createElement('style');
    s.id = 'spPanelStyles';
    s.textContent = `

    .sysprompt-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 10001;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .sysprompt-overlay.visible {
      display: flex;
      opacity: 1;
    }
    .sysprompt-panel {
      background: var(--card);
      border-radius: 16px;
      width: 95%;
      max-width: 800px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      transform: scale(0.9);
      transition: transform 0.3s ease;
      overflow: hidden;
    }
    .sysprompt-overlay.visible .sysprompt-panel {
      transform: scale(1);
    }
    .sysprompt-header {
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      color: white;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .sysprompt-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
    }
    .sysprompt-close {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sysprompt-close:hover {
      background: rgba(255,255,255,0.35);
    }
    .sysprompt-tabs {
      display: flex;
      border-bottom: 2px solid var(--ring);
      flex-shrink: 0;
      overflow-x: auto;
    }
    .sysprompt-tab {
      padding: 10px 16px;
      font-size: 12px;
      font-weight: 700;
      color: var(--muted);
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
    }
    .sysprompt-tab:hover {
      color: var(--ink);
      background: rgba(124,58,237,0.05);
    }
    .sysprompt-tab.active {
      color: #7c3aed;
      border-bottom-color: #7c3aed;
    }
    .sysprompt-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }
    .sysprompt-section {
      display: none;
    }
    .sysprompt-section.active {
      display: block;
    }
    .sysprompt-field {
      margin-bottom: 20px;
    }
    .sysprompt-field label {
      display: block;
      font-size: 13px;
      font-weight: 700;
      color: var(--ink);
      margin-bottom: 6px;
    }
    .sysprompt-field textarea {
      width: 100%;
      min-height: 180px;
      padding: 12px;
      border-radius: 10px;
      border: 1.5px solid var(--ring);
      background: var(--bg);
      color: var(--ink);
      font-size: 12px;
      font-family: monospace;
      line-height: 1.5;
      resize: vertical;
      outline: none;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .sysprompt-field textarea:focus {
      border-color: #7c3aed;
    }
    .sysprompt-provider-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 20px;
      border-bottom: 1px solid var(--ring);
      flex-shrink: 0;
      flex-wrap: wrap;
    }
    /* Direct child only — the capability matrix has its own nested spans
       (pills, tags) that must not inherit this label styling. */
    .sysprompt-provider-row > span {
      font-size: 13px;
      font-weight: 600;
      color: var(--foreground);
    }
    .sysprompt-provider-btn {
      padding: 5px 12px;
      border: 2px solid var(--ring);
      border-radius: 8px;
      background: transparent;
      color: var(--muted);
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .sysprompt-provider-btn.active {
      border-color: #7c3aed;
      background: linear-gradient(135deg, #7c3aed22, #6d28d922);
      color: #7c3aed;
    }
    .sysprompt-provider-btn:hover:not(.active) {
      border-color: var(--muted);
      color: var(--foreground);
    }
    /* ── Provider capability matrix ─────────────────────────────────────
       Replaces the flat button wall. Same element ids + .active contract
       as the old buttons, so _spSetProvider/_spSetTierVariant are unchanged;
       only the presentation is a table. Kept inside .sysprompt-provider-row
       because _spSetProvider inserts the transcriber banner via .after(). */
    .sysprompt-provider-row.sp-matrix-wrap {
      display: block;
      overflow-x: auto;
      padding: 10px 20px 12px;
    }
    .sp-matrix-head {
      display: flex; align-items: baseline; gap: 10px;
      margin: 0 0 7px; flex-wrap: wrap;
    }
    .sp-matrix-head b { font-size: 13px; color: var(--foreground); }
    .sp-matrix-head i {
      font-style: normal; font-size: 10.5px; color: var(--muted); letter-spacing: .02em;
    }
    table.sp-matrix {
      border-collapse: separate; border-spacing: 0;
      width: 100%; min-width: 620px;
      font-size: 11.5px;
    }
    table.sp-matrix thead th {
      text-align: left; font-size: 9.5px; font-weight: 700;
      letter-spacing: .09em; text-transform: uppercase;
      color: var(--muted); padding: 0 8px 6px;
      border-bottom: 1px solid var(--ring); white-space: nowrap;
    }
    table.sp-matrix thead th.sp-c { text-align: center; }
    table.sp-matrix thead th.sp-r { text-align: right; }
    table.sp-matrix tbody tr.sp-vendor td {
      padding: 9px 8px 3px; font-size: 9.5px; font-weight: 700;
      letter-spacing: .08em; text-transform: uppercase; color: var(--muted);
      border: 0; background: transparent;
    }
    /* Row = the old button. Neutralise the button chrome, keep the contract. */
    table.sp-matrix tbody tr.sysprompt-provider-btn {
      display: table-row; padding: 0; border: 0; border-radius: 0;
      background: transparent; cursor: pointer; transition: background .15s;
    }
    table.sp-matrix tbody tr.sysprompt-provider-btn > td {
      padding: 5px 8px; border-bottom: 1px solid var(--ring);
      color: var(--foreground); white-space: nowrap; background: transparent;
      /* reset the inherited .sysprompt-provider-btn button type-scale */
      font-size: 11.5px; font-weight: 500;
    }
    table.sp-matrix tbody tr.sysprompt-provider-btn:hover:not(.active) > td {
      background: color-mix(in srgb, var(--muted) 12%, transparent);
      border-color: var(--ring);
    }
    table.sp-matrix tbody tr.sysprompt-provider-btn.active > td {
      background: linear-gradient(90deg, #7c3aed26, #7c3aed0d);
      color: #7c3aed; font-weight: 700;
    }
    table.sp-matrix tbody tr.sysprompt-provider-btn.active > td:first-child {
      box-shadow: inset 3px 0 0 #7c3aed;
    }
    .sp-cap { text-align: center; font-weight: 700; font-size: 12px; }
    .sp-yes { color: #16a34a; }
    .sp-no  { color: #cbd5e1; }
    .sp-num {
      text-align: right;
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
      font-size: 10.5px; letter-spacing: -.02em;
    }
    .sp-need {
      font-size: 10px; font-weight: 700; padding: 1.5px 7px;
      border-radius: 999px; display: inline-block;
    }
    .sp-need-none { background: #dcfce7; color: #15803d; }
    .sp-need-tr   { background: #fef3c7; color: #92400e; }
    .sp-need-both { background: #fee2e2; color: #b91c1c; }
    .sp-tag {
      font-size: 8.5px; font-weight: 700; letter-spacing: .05em;
      padding: 1px 5px; border-radius: 4px; margin-left: 6px;
      background: #7c3aed1a; color: #7c3aed; vertical-align: middle;
    }
    .sp-tag-warn { background: #fef3c7; color: #92400e; }
    .sysprompt-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      flex-wrap: wrap;
    }
    .sysprompt-save-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 10px;
      background: linear-gradient(135deg, #7c3aed, #6d28d9);
      color: white;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      transition: transform 0.15s;
    }
    .sysprompt-save-btn:hover {
      transform: translateY(-1px);
    }
    .sysprompt-reset-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 10px;
      background: var(--ring);
      color: var(--ink);
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
    }
    .sysprompt-status {
      font-size: 12px;
      margin-top: 8px;
      min-height: 18px;
    }
    @media (max-width: 480px) {
      .sysprompt-panel {
        width: 100%;
        max-width: 100%;
        max-height: 100vh;
        border-radius: 0;
      }
      .sysprompt-tab {
        padding: 8px 10px;
        font-size: 11px;
      }
    }
    /* Inline-mount mode (admin.html host): drop the modal sizing so the
       panel fills the host content pane instead of capping at 800px. */
    #sysPromptOverlay.sp-inline {
      width: 100%;
      max-width: 100%;
    }
    #sysPromptOverlay.sp-inline .sysprompt-panel {
      width: 100%;
      max-width: 100%;
      min-width: 0;
      max-height: none;
      transform: none;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid var(--ring, #e5e7eb);
    }
    /* Inline-mode mobile tuning: shrink the chrome that was sized for a
       desktop modal so a 320-600px viewport can show the full panel. */
    @media (max-width: 720px) {
      #sysPromptOverlay.sp-inline .sysprompt-header {
        padding: 12px 14px;
      }
      #sysPromptOverlay.sp-inline .sysprompt-header h3 {
        font-size: 15px;
      }
      #sysPromptOverlay.sp-inline .sysprompt-provider-row {
        padding: 8px 12px;
        gap: 6px;
      }
      #sysPromptOverlay.sp-inline .sysprompt-provider-btn {
        padding: 5px 9px;
        font-size: 10.5px;
      }
      #sysPromptOverlay.sp-inline .sysprompt-tab {
        padding: 9px 12px;
        font-size: 11px;
      }
      #sysPromptOverlay.sp-inline .sysprompt-body {
        padding: 14px;
      }
    }

    /* ===== TEST MAKER MODAL ===== */
    `;
    document.head.appendChild(s);
  }

  // ── Provider capability matrix data ────────────────────────────────────
  // cap: [text, image, audio]. need: 'none' | 'tr' (transcriber) | 'both'.
  // sec/rel: ONLY from real measurements against the live CEFR prompts —
  // '' means not benchmarked, never a guess. Re-measure before editing.
  var _SP_MATRIX = [
    { v: 'Groq · LPU', dot: '⚡', rows: [
      { id: 'spProviderGroqQwen',      name: 'Qwen 3.6 27B',      call: "_spSetGroqVariant('qwen/qwen3.6-27b','spProviderGroqQwen')",
        cap: [1,1,0], need: 'tr', sec: '21s', rel: '9/9', tag: 'FASTEST',
        note: 'Vision-capable (confirmed by Groq support + verified). JSON mode suppresses the <think> preamble. Groq caps output at 16k.' },
      { id: 'spProviderGroqLlama70B',  name: 'Llama 3.3 70B',     call: "_spSetGroqVariant('llama-3.3-70b-versatile','spProviderGroqLlama70B')",
        cap: [1,0,0], need: 'both', sec: '', rel: '', note: 'Text only — needs both helpers.' },
      { id: 'spProviderGroqOss',       name: 'GPT-OSS 120B',      call: "_spSetGroqVariant('openai/gpt-oss-120b','spProviderGroqOss')",
        cap: [1,0,0], need: 'both', sec: '', rel: '', note: 'Largest open-weight on Groq. Text only.' },
      { id: 'spProviderGroqLlama8B',   name: 'Llama 8B Instant',  call: "_spSetGroqVariant('llama-3.1-8b-instant','spProviderGroqLlama8B')",
        cap: [1,0,0], need: 'both', sec: '', rel: '', tagWarn: 'WEAK', note: 'Cheapest/fastest, but benchmarked poorly for scoring (hallucinated + arithmetic errors).' },
    ]},
    { v: 'Google · Gemini', dot: '✨', rows: [
      { id: 'spProviderGeminiFlash',   name: 'Gemini Flash',      call: "_spSetTierVariant('gemini','gemini-flash-latest','spProviderGeminiFlash')",
        cap: [1,1,1], need: 'none', sec: '32s', rel: '6/7', note: 'Balanced, auto-tracks latest flash. Native audio + vision — no helpers at all.' },
      { id: 'spProviderGeminiLite',    name: 'Gemini Flash-Lite 3.1', call: "_spSetTierVariant('gemini','gemini-3.1-flash-lite','spProviderGeminiLite')",
        cap: [1,1,1], need: 'none', sec: '', rel: '', note: 'Cheapest Gemini. Native audio + vision.' },
      { id: 'spProviderGeminiPro',     name: 'Gemini Pro 2.5',    call: "_spSetTierVariant('gemini','gemini-2.5-pro','spProviderGeminiPro')",
        cap: [1,1,1], need: 'none', sec: '', rel: '', note: 'Most capable stable Gemini, higher cost.' },
    ]},
    { v: 'OpenAI', dot: '🤖', rows: [
      { id: 'spProviderOpenaiMini',    name: 'GPT-5.4 Mini',      call: "_spSetTierVariant('openai','gpt-5.4-mini','spProviderOpenaiMini')",
        cap: [1,1,1], need: 'none', sec: '', rel: '', note: 'Balanced. Vision + its own Whisper on the same key.' },
      { id: 'spProviderOpenaiNano',    name: 'GPT-5.4 Nano',      call: "_spSetTierVariant('openai','gpt-5.4-nano','spProviderOpenaiNano')",
        cap: [1,1,1], need: 'none', sec: '', rel: '', note: 'Cheapest OpenAI tier.' },
      { id: 'spProviderOpenaiFull',    name: 'GPT-5.4',           call: "_spSetTierVariant('openai','gpt-5.4','spProviderOpenaiFull')",
        cap: [1,1,1], need: 'none', sec: '', rel: '', note: 'Top tier. Runs at API default temperature (sampling params unsupported).' },
    ]},
    { v: 'Anthropic · Claude', dot: '🟣', rows: [
      { id: 'spProviderClaudeHaiku',   name: 'Claude Haiku 4.5',  call: "_spSetClaudeVariant('claude-haiku-4-5','spProviderClaudeHaiku')",
        cap: [1,1,0], need: 'tr', sec: '', rel: '', note: 'Fastest/cheapest Claude. Also the default vision helper.' },
      { id: 'spProviderClaudeSonnet',  name: 'Claude Sonnet 5',   call: "_spSetClaudeVariant('claude-sonnet-5','spProviderClaudeSonnet')",
        cap: [1,1,0], need: 'tr', sec: '', rel: '', note: 'Balanced Claude.' },
      { id: 'spProviderClaudeOpus',    name: 'Claude Opus 4.8',   call: "_spSetClaudeVariant('claude-opus-4-8','spProviderClaudeOpus')",
        cap: [1,1,0], need: 'tr', sec: '', rel: '', note: 'Most capable Claude — highest cost per check.' },
    ]},
    { v: 'xAI · Grok', dot: '⚡', rows: [
      { id: 'spProviderGrokFast',      name: 'Grok 4.20 Fast',    call: "_spSetTierVariant('grok','grok-4.20-0309-non-reasoning','spProviderGrokFast')",
        cap: [1,1,0], need: 'tr', sec: '', rel: '', note: 'Cheapest Grok. Currently the platform-wide vision fact-checker.' },
      { id: 'spProviderGrok43',        name: 'Grok 4.3',          call: "_spSetTierVariant('grok','grok-4.3','spProviderGrok43')",
        cap: [1,1,0], need: 'tr', sec: '', rel: '', note: 'Balanced Grok.' },
      { id: 'spProviderGrok45',        name: 'Grok 4.5',          call: "_spSetTierVariant('grok','grok-4.5','spProviderGrok45')",
        cap: [1,1,0], need: 'tr', sec: '', rel: '', note: 'Most capable Grok.' },
    ]},
    { v: 'DeepSeek', dot: '🔵', rows: [
      { id: 'spProviderDeepseekChat',  name: 'DeepSeek V4 Flash', call: "_spSetTierVariant('deepseek','deepseek-v4-flash','spProviderDeepseekChat')",
        cap: [1,0,0], need: 'both', sec: '123s', rel: '17/18', tagWarn: 'SLOW',
        note: 'Successor to the retired deepseek-chat. Hybrid reasoner: thinking shares the token budget, so checks take ~2 min.' },
      { id: 'spProviderDeepseekReasoner', name: 'DeepSeek V4 Pro', call: "_spSetTierVariant('deepseek','deepseek-v4-pro','spProviderDeepseekReasoner')",
        cap: [1,0,0], need: 'both', sec: '119s', rel: '', tagWarn: 'SLOW',
        note: 'Successor to the retired deepseek-reasoner. Deepest reasoning, highest DeepSeek cost.' },
    ]},
  ];

  function _spMatrixRows() {
    var NEED = {
      none: ['sp-need-none', 'none needed'],
      tr:   ['sp-need-tr',   '🎤 transcriber'],
      both: ['sp-need-both', '🎤 + 🖼️ both']
    };
    var mark = function (on) {
      return on ? '<td class="sp-cap sp-yes">✓</td>' : '<td class="sp-cap sp-no">✗</td>';
    };
    return _SP_MATRIX.map(function (grp) {
      var head = '<tr class="sp-vendor"><td colspan="6">' + grp.dot + ' ' + grp.v + '</td></tr>';
      return head + grp.rows.map(function (r) {
        var n = NEED[r.need];
        var tag = r.tag ? '<span class="sp-tag">' + r.tag + '</span>'
                : r.tagWarn ? '<span class="sp-tag sp-tag-warn">' + r.tagWarn + '</span>' : '';
        // cap[0] (text) is intentionally not rendered — every scorer does text,
        // so the column carried no signal and only widened the table.
        return '<tr class="sysprompt-provider-btn" id="' + r.id + '" onclick="' + r.call + '" title="' +
          String(r.note || '').replace(/"/g, '&quot;') + '">' +
          '<td>' + r.name + tag + '</td>' +
          mark(r.cap[1]) + mark(r.cap[2]) +
          '<td class="sp-num">' + (r.sec || '<span class="sp-no">—</span>') + '</td>' +
          '<td class="sp-num">' + (r.rel || '<span class="sp-no">—</span>') + '</td>' +
          '<td><span class="sp-need ' + n[0] + '">' + n[1] + '</span></td>' +
        '</tr>';
      }).join('');
    }).join('');
  }

  function _injectHtml(container) {
    container.innerHTML = `
  <div class="sysprompt-overlay" id="sysPromptOverlay" onclick="closeSystemPromptsPanel()">
    <div class="sysprompt-panel" onclick="event.stopPropagation()">
      <div class="sysprompt-header">
        <h3>📝 System Prompts</h3>
        <button class="sysprompt-close" onclick="closeSystemPromptsPanel()">✕</button>
      </div>
      <div style="margin:4px 0 8px;padding:6px 12px;background:#eef2ff;border:1px solid #c7d2fe;border-radius:8px;font-size:11px;color:#4338ca;line-height:1.5;">
        💡 This provider also runs <b>Reading Plus</b> + <b>Listening Plus</b>. Per-centre AI in the Centers panel only affects graded mocks, not Plus modules.
      </div>
      <div class="sysprompt-provider-row sp-matrix-wrap">
        <div class="sp-matrix-head">
          <b>AI Provider</b>
          <i>click a row to select · ✓ = the model does it itself · speed &amp; passes are measured on the live CEFR prompts, “—” = not benchmarked</i>
        </div>
        <table class="sp-matrix">
          <thead><tr>
            <th>Model</th>
            <th class="sp-c" title="Reads charts (IELTS Task 1) and picture-comparison images (CEFR Speaking Q4) by itself">🖼️ image</th>
            <th class="sp-c" title="Accepts student audio directly — no separate transcriber needed">🎤 audio</th>
            <th class="sp-r" title="Median seconds for one full CEFR writing check, measured on the live prompt">Speed</th>
            <th class="sp-r" title="Complete, parseable results out of N measured runs">Passes</th>
            <th title="Secondary AI you must configure for this model">Needs helper</th>
          </tr></thead>
          <tbody>${_spMatrixRows()}</tbody>
        </table>
      </div>
      <div class="sysprompt-provider-row" style="margin-top:6px;align-items:center;">
        <span style="font-size:12px;color:#6b7280;font-weight:600;">🛟 Fallback if primary fails:</span>
        <select id="sp_scoring_ai_fallback" style="padding:6px 10px;border:1px solid var(--ring);border-radius:6px;font-size:12px;background:var(--bg);color:var(--text);">
          <option value="">— None (show error) —</option>
          <option value="gemini">Gemini</option>
          <option value="openai">OpenAI</option>
          <option value="claude">Claude</option>
          <option value="grok">Grok (vision · grok-4.x)</option>
          <option value="deepseek">DeepSeek (text only)</option>
          <option value="groq:llama-3.3-70b-versatile">Groq Llama 3.3 70B</option>
          <option value="groq:qwen/qwen3.6-27b">Groq Qwen 3.6 27B</option>
        </select>
        <span style="font-size:11px;color:#9ca3af;">Tried only when ALL primary keys fail terminally. Leave empty to disable.</span>
      </div>
      <div class="sysprompt-tabs" id="sysPromptTabs">
        <button class="sysprompt-tab active" data-tab="cefr-writing">CEFR Writing</button>
        <button class="sysprompt-tab" data-tab="cefr-speaking">CEFR Speaking</button>
        <button class="sysprompt-tab" data-tab="ielts-writing">IELTS Writing</button>
        <button class="sysprompt-tab" data-tab="ielts-speaking">IELTS Speaking</button>
        <button class="sysprompt-tab" data-tab="models">⚙️ Models</button>
      </div>
      <div class="sysprompt-body" id="sysPromptBody">
        <!-- CEFR Writing -->
        <div class="sysprompt-section active" id="sec-cefr-writing">
          <h4 style="margin:0 0 6px;font-size:15px;">CEFR Writing — Grading Rubric</h4>
          <div style="margin:0 0 12px;padding:8px 12px;background:#eef2ff;border:1px solid #c7d2fe;border-radius:8px;font-size:11px;color:#4338ca;line-height:1.5;">
            🔒 <b>Read-only.</b> The unified CEFR Writing rubric, maintained in code (<code>scoring-prompts.js</code>). Used by the standalone CEFR Writing mock (full + single-task practice); the 4-skill Full Mock Exam is being migrated to it. To change it, ask Claude — it cannot be edited here.
          </div>
          <div class="sysprompt-field">
            <textarea id="sp_view_cefr_writing_core" readonly placeholder="Loading rubric…" style="min-height:340px;background:#f1f5f9;color:#475569;cursor:default;"></textarea>
          </div>
          <div style="margin:10px 0 0;padding:8px 12px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:11px;color:#92400e;line-height:1.5;">
            🎯 <b>Practice mode</b> uses this <b>same rubric</b> — there is no separate practice rubric. It only prepends a scoping note: score ONLY the selected task on its own band scale (Task 1.1 &amp; 1.2 → 0–5, Part 2 → 0–6), return 0 for the other tasks, with an encouraging-but-fair calibration. (The half-point "selected-tasks" practice variant is the one exception — it runs on its own ½-point model.)
          </div>
        </div>
        <!-- CEFR Speaking -->
        <div class="sysprompt-section" id="sec-cefr-speaking">
          <h4 style="margin:0 0 6px;font-size:15px;">CEFR Speaking — Grading Rubric</h4>
          <div style="margin:0 0 12px;padding:8px 12px;background:#eef2ff;border:1px solid #c7d2fe;border-radius:8px;font-size:11px;color:#4338ca;line-height:1.5;">
            🔒 <b>Read-only.</b> The unified CEFR Speaking rubric (part-based, /21 → certificate), maintained in code (<code>scoring-prompts.js</code>). Used by the standalone Speaking mock (full + single-part practice) and the 4-skill Full Mock Exam. To change it, ask Claude — it cannot be edited here.
          </div>
          <div class="sysprompt-field">
            <textarea id="sp_view_cefr_speaking_core" readonly placeholder="Loading rubric…" style="min-height:340px;background:#f1f5f9;color:#475569;cursor:default;"></textarea>
          </div>
          <div style="margin:10px 0 0;padding:8px 12px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:11px;color:#92400e;line-height:1.5;">
            🎯 <b>Practice mode</b> uses this <b>same rubric</b> — there is no separate practice rubric. Single-part practice only prepends a scoping note: score ONLY the selected part on its own band scale (Parts 1.1/1.2/2 → 0–5, Part 3 → 0–6) and return 0 for the others.
          </div>
        </div>
        <!-- IELTS Writing -->
        <div class="sysprompt-section" id="sec-ielts-writing">
          <h4 style="margin:0 0 6px;font-size:15px;">IELTS Writing — Grading Rubric</h4>
          <div style="margin:0 0 12px;padding:8px 12px;background:#eef2ff;border:1px solid #c7d2fe;border-radius:8px;font-size:11px;color:#4338ca;line-height:1.5;">
            🔒 <b>Read-only.</b> This single rubric grades <b>all</b> IELTS Writing — standalone full mock, single-task practice, and the 4-skill Full Mock Exam. It is maintained in code (<code>scoring-prompts.js</code>). To change it, ask Claude — it cannot be edited here.
          </div>
          <div class="sysprompt-field">
            <textarea id="sp_view_ielts_writing_core" readonly placeholder="Loading rubric…" style="min-height:340px;background:#f1f5f9;color:#475569;cursor:default;"></textarea>
          </div>
          <div style="margin:10px 0 0;padding:8px 12px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:11px;color:#92400e;line-height:1.5;">
            🎯 <b>Practice mode</b> uses this <b>same rubric</b> — there is no separate practice rubric. Single-task practice only prepends a scoping note: score ONLY the selected task (TA or TR + CC/LR/GRA, each 0–9) and return 0 for the other task.
          </div>
        </div>
        <!-- IELTS Speaking -->
        <div class="sysprompt-section" id="sec-ielts-speaking">
          <h4 style="margin:0 0 6px;font-size:15px;">IELTS Speaking — Grading Rubric</h4>
          <div style="margin:0 0 12px;padding:8px 12px;background:#eef2ff;border:1px solid #c7d2fe;border-radius:8px;font-size:11px;color:#4338ca;line-height:1.5;">
            🔒 <b>Read-only.</b> The unified IELTS Speaking rubric (official band descriptors: FC / LR / GRA / P, each 0-9 → overall), maintained in code (<code>scoring-prompts.js</code>). Used by the standalone IELTS Speaking mock and the 4-skill Full Mock Exam. To change it, ask Claude — it cannot be edited here.
          </div>
          <div class="sysprompt-field">
            <textarea id="sp_view_ielts_speaking_core" readonly placeholder="Loading rubric…" style="min-height:340px;background:#f1f5f9;color:#475569;cursor:default;"></textarea>
          </div>
          <div style="margin:10px 0 0;padding:8px 12px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:11px;color:#92400e;line-height:1.5;">
            🎯 <b>Practice mode</b> uses this <b>same rubric</b> — there is no separate practice rubric. Part practice only prepends a scoping note: score the selected part on FC/LR/GRA/P (each 0–9).
          </div>
        </div>

        <!-- ⚙️ Models -->
        <div class="sysprompt-section" id="sec-models">
          <h4 style="margin:0 0 6px;font-size:15px;">⚙️ AI Model Versions</h4>
          <p style="margin:0 0 16px;font-size:12px;color:#888;">Update these when a provider releases a new model version. Leave blank to keep the current default.</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="sysprompt-field" style="margin:0">
              <label>OpenAI — Scoring model</label>
              <input type="text" id="sp_scoring_model_openai" placeholder="gpt-5.4-nano · gpt-5.4-mini · gpt-5.4" style="width:100%;padding:8px 10px;border:1px solid var(--ring);border-radius:6px;font-size:13px;background:var(--bg);color:var(--text)">
            </div>
            <div class="sysprompt-field" style="margin:0">
              <label>OpenAI — Transcription model (Whisper)</label>
              <input type="text" id="sp_scoring_model_whisper" placeholder="whisper-1" style="width:100%;padding:8px 10px;border:1px solid var(--ring);border-radius:6px;font-size:13px;background:var(--bg);color:var(--text)">
            </div>
            <div class="sysprompt-field" style="margin:0">
              <label>Gemini — Scoring &amp; Transcription model</label>
              <input type="text" id="sp_scoring_model_gemini" placeholder="gemini-3.1-flash-lite · gemini-flash-latest · gemini-2.5-pro" style="width:100%;padding:8px 10px;border:1px solid var(--ring);border-radius:6px;font-size:13px;background:var(--bg);color:var(--text)">
            </div>
            <div class="sysprompt-field" style="margin:0">
              <label>Claude model</label>
              <input type="text" id="sp_scoring_model_claude" placeholder="claude-haiku-4-5 · claude-sonnet-5 · claude-opus-4-8" style="width:100%;padding:8px 10px;border:1px solid var(--ring);border-radius:6px;font-size:13px;background:var(--bg);color:var(--text)">
            </div>
            <div class="sysprompt-field" style="margin:0">
              <label>Grok model</label>
              <input type="text" id="sp_scoring_model_grok" placeholder="grok-4.20-0309-non-reasoning · grok-4.3 · grok-4.5" style="width:100%;padding:8px 10px;border:1px solid var(--ring);border-radius:6px;font-size:13px;background:var(--bg);color:var(--text)">
            </div>
            <div class="sysprompt-field" style="margin:0">
              <label>DeepSeek model</label>
              <input type="text" id="sp_scoring_model_deepseek" placeholder="deepseek-v4-flash · deepseek-v4-pro" style="width:100%;padding:8px 10px;border:1px solid var(--ring);border-radius:6px;font-size:13px;background:var(--bg);color:var(--text)">
            </div>
            <div class="sysprompt-field" style="margin:0;grid-column:1 / -1">
              <label>Groq model (clicking a Groq provider button above prefills this)</label>
              <input type="text" id="sp_scoring_model_groq" placeholder="llama-3.1-8b-instant · llama-3.3-70b-versatile · qwen/qwen3.6-27b · openai/gpt-oss-120b" style="width:100%;padding:8px 10px;border:1px solid var(--ring);border-radius:6px;font-size:13px;background:var(--bg);color:var(--text)">
            </div>
            <div class="sysprompt-field" style="margin:0;grid-column:1 / -1">
              <label>Llama 4 Scout model (Groq · vision)</label>
              <input type="text" id="sp_scoring_model_llama_scout" placeholder="meta-llama/llama-4-scout-17b-16e-instruct" style="width:100%;padding:8px 10px;border:1px solid var(--ring);border-radius:6px;font-size:13px;background:var(--bg);color:var(--text)">
            </div>

            <div class="sysprompt-field" style="margin:0;grid-column:1 / -1;border-top:1px dashed var(--ring);padding-top:12px;">
              <label style="font-weight:700;color:#7c3aed;">✨ Gemini Multi-Key Billing</label>
              <p style="margin:4px 0 12px;font-size:12px;color:#888;">Pick which billing slot the AI proxy uses. <strong>Both</strong> mode tries slot 1 first and auto-fails over to slot 2 on rate-limit or quota errors — emergency backup if one billing account drains.</p>

              <div style="display:flex;flex-direction:column;gap:10px;">
                <div>
                  <div style="font-size:12px;color:#666;font-weight:600;margin-bottom:6px;">💰 Prepay accounts</div>
                  <div class="sp-gemini-row" data-group="prepay" style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button type="button" class="sp-gemini-btn" data-plan="prepay">Prepay 1</button>
                    <button type="button" class="sp-gemini-btn" data-plan="prepay_2">Prepay 2</button>
                    <button type="button" class="sp-gemini-btn" data-plan="prepay_both">Both (auto-failover)</button>
                  </div>
                </div>

                <div>
                  <div style="font-size:12px;color:#666;font-weight:600;margin-bottom:6px;">📆 Postpay accounts</div>
                  <div class="sp-gemini-row" data-group="postpay" style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button type="button" class="sp-gemini-btn" data-plan="postpay">Postpay 1</button>
                    <button type="button" class="sp-gemini-btn" data-plan="postpay_2">Postpay 2</button>
                    <button type="button" class="sp-gemini-btn" data-plan="postpay_both">Both (auto-failover)</button>
                  </div>
                </div>

                <div>
                  <button type="button" class="sp-gemini-btn" data-plan="">⚙ Server fallback (no plan)</button>
                </div>
              </div>

              <p style="margin:12px 0 0;font-size:11px;color:#94a3b8;">Selected plan saved to <code>site_settings.gemini_active_plan</code>. API keys live only in Edge Function secrets (<code>GEMINI_API_KEY_PREPAY</code>, <code>_PREPAY_2</code>, <code>_POSTPAY</code>, <code>_POSTPAY_2</code>) — no plaintext keys in the database.</p>

              <style>
                .sp-gemini-btn{padding:8px 14px;border:1.5px solid var(--ring);border-radius:8px;background:var(--bg);color:var(--text);font-size:13px;cursor:pointer;transition:all .15s;font-weight:500;}
                .sp-gemini-btn:hover{border-color:#7c3aed;background:rgba(124,58,237,.05);}
                .sp-gemini-btn.active{border-color:#7c3aed;background:#7c3aed;color:#fff;box-shadow:0 2px 8px rgba(124,58,237,.3);}
              </style>
            </div>
          </div>
        </div>
      </div>
      <div style="padding:12px 20px 16px;border-top:1px solid var(--ring);flex-shrink:0;">
        <div class="sysprompt-actions">
          <button class="sysprompt-save-btn" onclick="saveScoringPrompts()">💾 Save All</button>
          <button class="sysprompt-reset-btn" onclick="resetScoringPrompts()">↩️ Reset to Defaults</button>
        </div>
        <div class="sysprompt-status" id="sysPromptStatus"></div>
      </div>
    </div>
  </div>
    `;
    _spHtmlInjected = true;
    // Wire tab switching (event delegation on the tabs container) — done
    // here instead of at module-load time so it fires AFTER the HTML
    // exists in the DOM. Guarded so we only wire once across re-opens.
    if (!_spTabsWired) {
      var tabsEl = document.getElementById('sysPromptTabs');
      if (tabsEl) {
        tabsEl.addEventListener('click', function (e) {
          var tab = e.target.closest('.sysprompt-tab');
          if (!tab) return;
          document.querySelectorAll('.sysprompt-tab').forEach(function (t) { t.classList.remove('active'); });
          document.querySelectorAll('.sysprompt-section').forEach(function (s) { s.classList.remove('active'); });
          tab.classList.add('active');
          var sec = document.getElementById('sec-' + tab.dataset.tab);
          if (sec) sec.classList.add('active');
        });
        _spTabsWired = true;
      }
    }
  }

    var _SP_SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
    var _SP_SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
    var _SP_ALL_KEYS = [
      'scoring_cefr_writing_system','scoring_cefr_writing_prompt',
      'scoring_cefr_writing_task_system','scoring_cefr_writing_task_prompt',
      'scoring_cefr_writing_full_system','scoring_cefr_writing_full_prompt',
      'scoring_cefr_speaking_system','scoring_cefr_speaking_prompt',
      'scoring_cefr_speaking_part_system','scoring_cefr_speaking_part_prompt',
      'scoring_cefr_speaking_full_system','scoring_cefr_speaking_full_prompt',
      'scoring_ielts_writing_system','scoring_ielts_writing_prompt',
      'scoring_ielts_writing_task_system','scoring_ielts_writing_task_prompt',
      'scoring_ielts_writing_full_system','scoring_ielts_writing_full_prompt',
      'scoring_ielts_speaking_system','scoring_ielts_speaking_prompt',
      'scoring_ielts_speaking_part_system','scoring_ielts_speaking_part_prompt',
      'scoring_ielts_speaking_full_system','scoring_ielts_speaking_full_prompt',
      'scoring_model_openai','scoring_model_whisper',
      'scoring_model_gemini','scoring_model_claude',
      'scoring_model_grok','scoring_model_deepseek','scoring_model_groq',
      'scoring_model_llama_scout'
      // 'scoring_ai_fallback' is special-cased in saveScoringPrompts so it can
      // be cleared back to "no fallback" (empty value still gets upserted).
    ];

    var _spCurrentProvider = 'gemini';
    var _spTranscriptionProvider = 'gemini'; // helper AI for text-only providers

    function _spSetTranscriptionHelper(h) {
      _spTranscriptionProvider = h;
      var providerLabel = _spCurrentProvider.charAt(0).toUpperCase() + _spCurrentProvider.slice(1);
      // Must match the list in _spSetProvider — 'groq' and 'llama-scout' were
      // missing here, so the footnote claimed Groq transcribes its own audio.
      // No Groq chat model accepts audio; Whisper is a separate endpoint.
      var isTextOnly = (_spCurrentProvider === 'grok' || _spCurrentProvider === 'deepseek' ||
                        _spCurrentProvider === 'groq' || _spCurrentProvider === 'llama-scout');
      var theme = isTextOnly
        ? { active: '#f59e0b', text: '#92400e', border: '#f59e0b' }
        : { active: '#2563eb', text: '#1e40af', border: '#3b82f6' };
      ['default','gemini','openai','assemblyai','groq'].forEach(function(k) {
        var btn = document.getElementById('_spTrHelper_' + k);
        if (!btn) return;
        btn.style.background = (k === h) ? theme.active : 'transparent';
        btn.style.color = (k === h) ? '#ffffff' : theme.text;
        btn.style.borderColor = theme.border;
      });
      var labels = {
        'default':    isTextOnly ? ('Default — system prompts helper') : ('Default — ' + providerLabel + ' transcribes its own audio'),
        'gemini':     'Gemini Flash (latest)',
        'openai':     'OpenAI Whisper',
        'assemblyai': 'AssemblyAI Universal',
        'groq':       'Groq Whisper Turbo'
      };
      var note = document.getElementById('_spTrHelperNote');
      if (note) {
        if (h === 'default') {
          note.textContent = isTextOnly
            ? ('✓ Falls back to the helper AI defined in the system prompts (default: Gemini), then ' + providerLabel + ' scores the text.')
            : ('✓ ' + providerLabel + ' will transcribe student audio AND score it (one-step, native).');
        } else {
          note.textContent = '✓ ' + (labels[h] || h) + ' will transcribe student audio, then ' + providerLabel + ' scores the text.';
        }
      }
    }

    function _spSetProvider(p) {
      _spCurrentProvider = p;
      var _scoutBtn = document.getElementById('spProviderLlamaScout');
      // Tier-variant groups: buttons share a provider id and differ only by
      // the model they preset; _spSetTierVariant() lights the exact one.
      var _tierGroups = {
        gemini:   ['spProviderGeminiLite', 'spProviderGeminiFlash', 'spProviderGeminiPro'],
        openai:   ['spProviderOpenaiNano', 'spProviderOpenaiMini', 'spProviderOpenaiFull'],
        grok:     ['spProviderGrokFast', 'spProviderGrok43', 'spProviderGrok45'],
        deepseek: ['spProviderDeepseekChat', 'spProviderDeepseekReasoner']
      };
      Object.keys(_tierGroups).forEach(function (prov) {
        if (p !== prov) _tierGroups[prov].forEach(function (id) {
          var b = document.getElementById(id); if (b) b.classList.remove('active');
        });
      });
      // Claude variant buttons share provider id 'claude' (model differs);
      // _spSetClaudeVariant() lights the exact one clicked.
      var claudeBtns = ['spProviderClaudeHaiku', 'spProviderClaudeSonnet', 'spProviderClaudeOpus'];
      if (p !== 'claude') {
        claudeBtns.forEach(function (id) { var b = document.getElementById(id); if (b) b.classList.remove('active'); });
      }
      if (_scoutBtn) _scoutBtn.classList.toggle('active', p === 'llama-scout');
      // The three Groq variant buttons are deactivated when a non-Groq provider
      // is picked. _spSetGroqVariant() handles activating exactly the variant
      // the user clicked (since they all share provider id 'groq').
      var groqBtns = ['spProviderGroqQwen', 'spProviderGroqLlama70B', 'spProviderGroqLlama4Scout'];
      if (p !== 'groq') {
        groqBtns.forEach(function (id) { var b = document.getElementById(id); if (b) b.classList.remove('active'); });
      }
      var providerLabel = (p === 'llama-scout') ? 'Llama Scout' : (p.charAt(0).toUpperCase() + p.slice(1));
      // Llama Scout has vision but NO native audio — still needs a
      // transcriber for Speaking mocks, same warning category as the
      // text-only providers. Native-audio providers stay in the "blue"
      // branch.
      var isTextOnly = (p === 'grok' || p === 'deepseek' || p === 'groq' || p === 'llama-scout');
      var box = document.getElementById('_spAudioWarning');
      if (!box) {
        box = document.createElement('div');
        box.id = '_spAudioWarning';
        var providerRow = document.querySelector('.sysprompt-provider-row');
        if (providerRow) providerRow.after(box);
      }
      // Re-theme box every time provider changes (amber for text-only, blue for native-capable)
      var theme = isTextOnly
        ? { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', divider: 'rgba(245,158,11,0.35)' }
        : { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', divider: 'rgba(59,130,246,0.35)' };
      box.style.cssText = 'margin:6px 0 0;padding:6px 12px;background:' + theme.bg + ';border:1px solid ' + theme.border + ';border-radius:8px;font-size:11px;color:' + theme.text + ';flex-shrink:0;';
      // Vision status is per-MODEL, not per-provider: Groq is text-only except
      // qwen3.6-27b, which gained image input (verified 2026-08-01).
      var _mdlNow = (document.getElementById('sp_scoring_model_groq') || {}).value || '';
      var _needsVision = (p === 'deepseek') ||
        (p === 'groq' && _mdlNow.indexOf('qwen3.6') === -1) ||
        (p === 'llama-scout' && false);
      var headline = isTextOnly
        ? '⚠️ ' + providerLabel + ' cannot process audio' + (_needsVision ? ' or images' : '') + '. Pick transcriber:'
        : '🎙️ Transcriber (default = ' + providerLabel + ' itself):';
      box.innerHTML =
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
          '<span style="font-weight:600;font-size:11px;">' + headline + '</span>' +
          '<button id="_spTrHelper_default" onclick="_spSetTranscriptionHelper(\'default\')" style="padding:3px 10px;border-radius:6px;border:1px solid ' + theme.border + ';background:transparent;cursor:pointer;font-size:11px;font-weight:600;color:' + theme.text + ';">⚙ Default</button>' +
          '<button id="_spTrHelper_gemini" onclick="_spSetTranscriptionHelper(\'gemini\')" style="padding:3px 10px;border-radius:6px;border:1px solid ' + theme.border + ';background:transparent;cursor:pointer;font-size:11px;font-weight:600;color:' + theme.text + ';">✨ Gemini</button>' +
          '<button id="_spTrHelper_openai" onclick="_spSetTranscriptionHelper(\'openai\')" style="padding:3px 10px;border-radius:6px;border:1px solid ' + theme.border + ';background:transparent;cursor:pointer;font-size:11px;font-weight:600;color:' + theme.text + ';">🤖 OpenAI</button>' +
          '<button id="_spTrHelper_assemblyai" onclick="_spSetTranscriptionHelper(\'assemblyai\')" style="padding:3px 10px;border-radius:6px;border:1px solid ' + theme.border + ';background:transparent;cursor:pointer;font-size:11px;font-weight:600;color:' + theme.text + ';">📝 AssemblyAI</button>' +
          '<button id="_spTrHelper_groq" onclick="_spSetTranscriptionHelper(\'groq\')" style="padding:3px 10px;border-radius:6px;border:1px solid ' + theme.border + ';background:transparent;cursor:pointer;font-size:11px;font-weight:600;color:' + theme.text + ';">⚡ Groq</button>' +
          '<span id="_spTrHelperNote" style="font-size:10px;opacity:0.7;flex-basis:100%;"></span>' +
        '</div>';
      // For text-only providers, "default" maps to system-prompt helper (i.e. gemini-by-default).
      // For native providers, "default" means "use itself".
      _spSetTranscriptionHelper(_spTranscriptionProvider || 'default');
      // Scroll body back to top so the prompt fields are visible after banner re-flow.
      var body = document.getElementById('sysPromptBody');
      if (body) body.scrollTop = 0;
    }

    // Three Groq variant buttons all share provider id 'groq' but preset
    // a different model string in sp_scoring_model_groq. Backend code only
    // sees provider='groq' + model=<chosen>, so a single 'groq' branch in
    // each scoring page handles all three.
    // Same pattern for the three Claude tiers: provider stays 'claude',
    // only scoring_model_claude changes, so the pages' single claude
    // branch serves Haiku / Sonnet / Opus alike.
    function _spSetClaudeVariant(modelString, btnId) {
      _spSetProvider('claude');
      var fld = document.getElementById('sp_scoring_model_claude');
      if (fld) fld.value = modelString;
      var claudeBtns = ['spProviderClaudeHaiku', 'spProviderClaudeSonnet', 'spProviderClaudeOpus'];
      claudeBtns.forEach(function (id) {
        var b = document.getElementById(id);
        if (b) b.classList.toggle('active', id === btnId);
      });
    }

    // Generic tier setter: provider stays the family id, only its
    // scoring_model_<provider> field changes — pages need no edits.
    var _SP_TIER_FIELDS = { gemini: 'sp_scoring_model_gemini', openai: 'sp_scoring_model_openai', grok: 'sp_scoring_model_grok', deepseek: 'sp_scoring_model_deepseek', claude: 'sp_scoring_model_claude' };
    var _SP_TIER_BTNS = {
      gemini:   ['spProviderGeminiLite', 'spProviderGeminiFlash', 'spProviderGeminiPro'],
      openai:   ['spProviderOpenaiNano', 'spProviderOpenaiMini', 'spProviderOpenaiFull'],
      grok:     ['spProviderGrokFast', 'spProviderGrok43', 'spProviderGrok45'],
      deepseek: ['spProviderDeepseekChat', 'spProviderDeepseekReasoner']
    };
    function _spSetTierVariant(provider, modelString, btnId) {
      _spSetProvider(provider);
      var fld = document.getElementById(_SP_TIER_FIELDS[provider]);
      if (fld) fld.value = modelString;
      (_SP_TIER_BTNS[provider] || []).forEach(function (id) {
        var b = document.getElementById(id);
        if (b) b.classList.toggle('active', id === btnId);
      });
    }

    function _spSetGroqVariant(modelString, btnId) {
      // Set the model BEFORE _spSetProvider: the transcriber banner reads this
      // field to decide whether the picked Groq model also needs a vision
      // helper (qwen3.6-27b sees images; the Llama/OSS models do not).
      var fld = document.getElementById('sp_scoring_model_groq');
      if (fld) fld.value = modelString;
      _spSetProvider('groq');
      var groqBtns = ['spProviderGroqQwen', 'spProviderGroqLlama70B', 'spProviderGroqLlama4Scout'];
      groqBtns.forEach(function (id) {
        var b = document.getElementById(id);
        if (b) b.classList.toggle('active', id === btnId);
      });
    }

    var _spAdminUnlocked = false;

    function _showSpPasscode() {
      var existing = document.getElementById('spPasscodeOverlay');
      if (existing) { existing.classList.add('active'); document.getElementById('spPasscodeInput').value = ''; document.getElementById('spPasscodeInput').focus(); return; }
      var div = document.createElement('div');
      div.id = 'spPasscodeOverlay';
      div.className = 'ru-overlay';
      div.style.zIndex = '10150';
      div.onclick = function(e) { if (e.target === div) _closeSpPasscode(); };
      div.innerHTML = '<div style="background:var(--surface,#fff);border-radius:16px;padding:28px 24px;width:90vw;max-width:360px;box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center;">' +
        '<div style="font-size:28px;margin-bottom:8px;">🔐</div>' +
        '<h3 style="margin:0 0 4px;font-size:16px;">Admin Access Required</h3>' +
        '<p style="margin:0 0 16px;font-size:13px;color:#888;">Enter passcode to manage system prompts</p>' +
        '<input type="password" id="spPasscodeInput" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code" placeholder="••••••••" maxlength="20" style="width:100%;padding:12px 14px;border:1px solid var(--ring,#e5e7eb);border-radius:10px;font-size:15px;text-align:center;outline:none;background:var(--surface,#fff);color:var(--ink,#333);box-sizing:border-box;" onkeypress="if(event.key===\'Enter\')_verifySpPasscode()">' +
        '<div id="spPasscodeError" style="min-height:20px;margin:8px 0;font-size:13px;color:#f87171;"></div>' +
        '<button id="spPasscodeBtn" onclick="_verifySpPasscode()" style="width:100%;padding:12px;border:none;border-radius:10px;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;font-weight:600;font-size:14px;cursor:pointer;">Unlock</button>' +
        '<button onclick="_closeSpPasscode()" style="margin-top:8px;background:none;border:none;color:#888;font-size:13px;cursor:pointer;">Cancel</button>' +
        '</div>';
      document.body.appendChild(div);
      setTimeout(function() { div.classList.add('active'); document.getElementById('spPasscodeInput').focus(); }, 10);
    }

    function _closeSpPasscode() {
      var el = document.getElementById('spPasscodeOverlay');
      if (el) el.classList.remove('active');
    }

    async function _verifySpPasscode() {
      var input = document.getElementById('spPasscodeInput');
      var error = document.getElementById('spPasscodeError');
      var btn = document.getElementById('spPasscodeBtn');
      var code = (input.value || '').trim();
      if (!code) { error.textContent = '❌ Please enter a passcode'; return; }
      btn.disabled = true; btn.textContent = '⏳ Verifying...';
      error.textContent = '';
      try {
        var resp = await fetch('https://admin0709.alwaysdata.net/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passcode: code, type: 'bsb', validate: true, timestamp: Date.now(), source: 'system-prompts' , center: ((window.SITE_CONFIG&&window.SITE_CONFIG.testIdentifier)||'mock_stream').replace(/_/g,'')})
        });
        if (!resp.ok) throw new Error('Server error');
        var data = await resp.json();
        if (data.access) {
          _spAdminUnlocked = true;
          _closeSpPasscode();
          openSystemPromptsPanel();
        } else {
          throw new Error('Invalid');
        }
      } catch (e) {
        error.textContent = '❌ Incorrect passcode';
        input.value = '';
        input.focus();
      } finally {
        btn.disabled = false; btn.textContent = 'Unlock';
      }
    }

    function openSystemPromptsPanel() {
      if (!_spAdminUnlocked && !_siteAdminUnlocked) {
        _showSpPasscode();
        return;
      }
      var overlay = document.getElementById('sysPromptOverlay');
      overlay.style.display = 'flex';
      requestAnimationFrame(function() { overlay.classList.add('visible'); });
      loadScoringPrompts();
    }

    function closeSystemPromptsPanel() {
      var overlay = document.getElementById('sysPromptOverlay');
      overlay.classList.remove('visible');
      setTimeout(function() { overlay.style.display = 'none'; }, 300);
    }

    // Load the shared grading-prompt module (single source of truth) so the
    // read-only rubric views can mirror exactly what the runners use.
    function _spEnsureScoringPrompts(cb) {
      if (window.ScoringPrompts && window.ScoringPrompts.IELTS_WRITING_CORE) { cb(); return; }
      var existing = document.querySelector('script[data-sp-core]');
      if (existing) { existing.addEventListener('load', cb); existing.addEventListener('error', cb); return; }
      var s = document.createElement('script');
      s.src = 'scoring-prompts.js'; s.setAttribute('data-sp-core', '1');
      s.onload = cb; s.onerror = cb;
      document.head.appendChild(s);
    }
    function _spPopulateUnifiedCores() {
      _spEnsureScoringPrompts(function () {
        var SP = window.ScoringPrompts || {};
        // Map of read-only view <textarea> id → the code core it mirrors.
        // (More skills get added here as they are unified.)
        var map = {
          sp_view_ielts_writing_core: SP.IELTS_WRITING_CORE,
          sp_view_cefr_writing_core: SP.CEFR_WRITING_CORE,
          sp_view_cefr_speaking_core: SP.CEFR_SPEAKING_CORE,
          sp_view_ielts_speaking_core: SP.IELTS_SPEAKING_CORE
        };
        Object.keys(map).forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.value = map[id] || '(could not load scoring-prompts.js)';
        });
      });
    }

    async function loadScoringPrompts() {
      var status = document.getElementById('sysPromptStatus');
      status.innerHTML = '<span style="color:var(--muted);">Loading prompts...</span>';
      _spPopulateUnifiedCores();
      try {
        var resp = await fetch(_SP_SB_URL + '/rest/v1/site_settings?key=like.scoring_*&select=key,value', {
          headers: { 'apikey': _SP_SB_KEY, 'Authorization': 'Bearer ' + _SP_SB_KEY }
        });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        var rows = await resp.json();
        var map = {};
        rows.forEach(function(r) { map[r.key] = r.value; });
        _SP_ALL_KEYS.forEach(function(key) {
          var el = document.getElementById('sp_' + key);
          if (el) el.value = map[key] || '';
        });
        if (map['scoring_ai_provider']) _spSetProvider(map['scoring_ai_provider']);
        // Light the tier button matching the saved model for variant families
        (function () {
          var _prov = map['scoring_ai_provider'];
          var _tierMatch = {
            gemini:   [['lite', 'spProviderGeminiLite'], ['pro', 'spProviderGeminiPro'], ['', 'spProviderGeminiFlash']],
            openai:   [['nano', 'spProviderOpenaiNano'], ['mini', 'spProviderOpenaiMini'], ['', 'spProviderOpenaiFull']],
            grok:     [['4.20', 'spProviderGrokFast'], ['4.5', 'spProviderGrok45'], ['', 'spProviderGrok43']],
            deepseek: [['pro', 'spProviderDeepseekReasoner'], ['', 'spProviderDeepseekChat']],
            groq:     [['8b', 'spProviderGroqLlama8B'], ['qwen', 'spProviderGroqQwen'], ['oss', 'spProviderGroqOss'], ['', 'spProviderGroqLlama70B']]
          };
          if (!_tierMatch[_prov]) return;
          var _mv = (map['scoring_model_' + _prov] || '').trim().toLowerCase();
          for (var _ti = 0; _ti < _tierMatch[_prov].length; _ti++) {
            var _pair = _tierMatch[_prov][_ti];
            if (!_pair[0] || _mv.indexOf(_pair[0]) > -1) {
              var _bEl = document.getElementById(_pair[1]);
              if (_bEl) _bEl.classList.add('active');
              break;
            }
          }
        })();
        if (map['scoring_ai_provider'] === 'claude') {
          var _cm = (map['scoring_model_claude'] || '').trim();
          var _cBtn = _cm.indexOf('haiku') > -1 ? 'spProviderClaudeHaiku'
                    : _cm.indexOf('opus') > -1 ? 'spProviderClaudeOpus'
                    : 'spProviderClaudeSonnet';
          var _cEl = document.getElementById(_cBtn);
          if (_cEl) _cEl.classList.add('active');
        }
        if (map['scoring_transcription_provider']) { _spTranscriptionProvider = map['scoring_transcription_provider']; _spSetTranscriptionHelper(_spTranscriptionProvider); }
        // Load fallback selector (separate from generic loop since saveScoringPrompts
        // also special-cases it to allow clearing back to empty/no-fallback).
        var fbEl = document.getElementById('sp_scoring_ai_fallback');
        if (fbEl) fbEl.value = map['scoring_ai_fallback'] || '';
        // ── AI model health banner ──
        // Written monthly by the ai-health-check Edge Function (pg_cron job
        // 'ai-health-monthly'): probes every wired model so silent vendor
        // retirements (Groq/Scout, Google/3-pro…) surface HERE, not in a
        // student's broken scoring run.
        try {
          var _hr = map['scoring_ai_health_report'] ? JSON.parse(map['scoring_ai_health_report']) : null;
          var _hb = document.getElementById('_spHealthBanner');
          if (!_hb) {
            _hb = document.createElement('div');
            _hb.id = '_spHealthBanner';
            _hb.style.cssText = 'margin:8px 20px 0;padding:9px 14px;border-radius:10px;font-size:12px;font-weight:600;line-height:1.5;';
            var _pr = document.querySelector('.sysprompt-provider-row');
            if (_pr) _pr.parentNode.insertBefore(_hb, _pr);
          }
          if (!_hr) {
            _hb.style.background = '#fef3c7'; _hb.style.color = '#92400e';
            _hb.textContent = '🩺 AI model health: no report yet — the monthly check runs on the 1st, or trigger ai-health-check manually.';
          } else {
            var _age = (Date.now() - new Date(_hr.ts).getTime()) / 86400000;
            var _when = new Date(_hr.ts).toLocaleDateString();
            if (_hr.fail > 0) {
              _hb.style.background = '#fee2e2'; _hb.style.color = '#991b1b';
              _hb.innerHTML = '🩺 <b>AI model health: ' + _hr.fail + ' of ' + _hr.total + ' FAILED</b> (checked ' + _when + '): ' +
                _hr.fails.map(function (f) { return f.name; }).join(' · ') +
                ' — a wired model may be retired; update the tier buttons / model strings.';
            } else if (_age > 40) {
              _hb.style.background = '#fef3c7'; _hb.style.color = '#92400e';
              _hb.textContent = '🩺 AI model health: last report is ' + Math.round(_age) + ' days old (' + _when + ') — the monthly cron may have stopped.';
            } else {
              _hb.style.background = '#dcfce7'; _hb.style.color = '#166534';
              _hb.textContent = '🩺 AI model health: all ' + _hr.total + ' wired models verified working · checked ' + _when;
            }
            // Capability drift (a model gained/lost image or audio support)
            if (_hr.capability_changes && _hr.capability_changes.length) {
              var _cd = document.createElement('div');
              _cd.style.cssText = 'margin-top:6px;padding-top:6px;border-top:1px dashed rgba(0,0,0,0.15);';
              _cd.innerHTML = '🔀 <b>Capability changes since last check:</b> ' + _hr.capability_changes.join(' · ') +
                ' — a model changed modalities; review the provider table / helper choices.';
              _hb.appendChild(_cd);
            }
          }
        } catch (_he) { }
        // Load Gemini active plan + bind button selector
        try {
          var gResp = await fetch(_SP_SB_URL + '/rest/v1/site_settings?key=eq.gemini_active_plan&select=value', {
            headers: { 'apikey': _SP_SB_KEY, 'Authorization': 'Bearer ' + _SP_SB_KEY }
          });
          var gRows = await gResp.json();
          var activePlan = (gRows && gRows[0] && gRows[0].value) || '';
          _spSetGeminiPlan(activePlan, false);
          // One-time delegated click handler (idempotent)
          if (!window._spGeminiBound) {
            window._spGeminiBound = true;
            document.querySelectorAll('.sp-gemini-btn').forEach(function (btn) {
              btn.addEventListener('click', function () {
                _spSetGeminiPlan(btn.getAttribute('data-plan') || '', true);
              });
            });
          }
        } catch(ge) { console.warn('[Gemini multi-key] load failed:', ge); }
        status.innerHTML = '<span style="color:#10b981;">✓ Loaded ' + rows.length + ' saved prompt(s)</span>';
      } catch(e) {
        status.innerHTML = '<span style="color:#dc2626;">Failed to load: ' + e.message + '</span>';
      }
    }

    // Gemini active-plan button selector. `persist`=false → reflect DB only;
    // true → user clicked, mark dirty for next Save All.
    function _spSetGeminiPlan(plan, persist) {
      plan = plan || '';
      document.querySelectorAll('.sp-gemini-btn').forEach(function (btn) {
        var v = btn.getAttribute('data-plan') || '';
        if (v === plan) btn.classList.add('active');
        else btn.classList.remove('active');
      });
      if (persist) {
        window._spPendingPlan = plan;
        var status = document.getElementById('sysPromptStatus');
        if (status) status.innerHTML = '<span style="color:#f59e0b;">● Plan changed — click Save All to apply</span>';
      }
    }

    async function _spUpsertSetting(key, value) {
      var res = await fetch(_SP_SB_URL + '/rest/v1/site_settings?key=eq.' + encodeURIComponent(key), {
        method: 'PATCH',
        headers: {
          'apikey': _SP_SB_KEY, 'Authorization': 'Bearer ' + _SP_SB_KEY,
          'Content-Type': 'application/json', 'Prefer': 'return=representation'
        },
        body: JSON.stringify({ value: value, updated_at: new Date().toISOString() })
      });
      var data = await res.json();
      if (!data || data.length === 0) {
        await fetch(_SP_SB_URL + '/rest/v1/site_settings', {
          method: 'POST',
          headers: {
            'apikey': _SP_SB_KEY, 'Authorization': 'Bearer ' + _SP_SB_KEY,
            'Content-Type': 'application/json', 'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ key: key, value: value })
        });
      }
    }

    async function _spDeleteSetting(key) {
      await fetch(_SP_SB_URL + '/rest/v1/site_settings?key=eq.' + encodeURIComponent(key), {
        method: 'DELETE',
        headers: { 'apikey': _SP_SB_KEY, 'Authorization': 'Bearer ' + _SP_SB_KEY }
      });
    }

    async function saveScoringPrompts() {
      var status = document.getElementById('sysPromptStatus');
      status.innerHTML = '<span style="color:var(--muted);">Saving...</span>';
      try {
        // Safety: count non-empty textareas. If ALL prompt textareas are empty
        // (e.g. user opened the panel and clicked Save before the load finished,
        // or a network glitch returned no rows) refuse the save — we'd otherwise
        // wipe years of prompt work. Provider/transcriber config still saves.
        var nonEmptyCount = 0;
        for (var ci = 0; ci < _SP_ALL_KEYS.length; ci++) {
          var ce = document.getElementById('sp_' + _SP_ALL_KEYS[ci]);
          if (ce && ce.value.trim()) nonEmptyCount++;
        }
        if (nonEmptyCount === 0) {
          var ok = confirm('⚠️ All prompt fields are empty.\n\nIf you click OK, every saved prompt in the database will be DELETED.\n\nThis usually means the prompts did not finish loading. Click Cancel to abort.');
          if (!ok) {
            status.innerHTML = '<span style="color:#f59e0b;">Save aborted (empty form).</span>';
            return;
          }
        }
        var saved = 0, skipped = 0;
        await _spUpsertSetting('scoring_ai_provider', _spCurrentProvider);
        saved++;
        // Always persist transcriber-provider override (applies to ALL base providers now)
        await _spUpsertSetting('scoring_transcription_provider', _spTranscriptionProvider || 'default');
        saved++;
        // Always persist the fallback selector — even when set to empty
        // ("None"), so changing FROM a real fallback TO "no fallback" actually
        // takes effect. The generic loop below would otherwise skip-save
        // empty values (intentional safeguard for prompt textareas).
        var fbEl = document.getElementById('sp_scoring_ai_fallback');
        await _spUpsertSetting('scoring_ai_fallback', (fbEl ? fbEl.value : '').trim());
        saved++;
        for (var i = 0; i < _SP_ALL_KEYS.length; i++) {
          var key = _SP_ALL_KEYS[i];
          var el = document.getElementById('sp_' + key);
          if (!el) continue;
          var val = el.value.trim();
          if (val) {
            await _spUpsertSetting(key, val);
            saved++;
          } else {
            // SAFETY: do NOT delete on empty. To remove a prompt, use Reset to Defaults.
            // (Previous behaviour wiped prompts when textarea was blank — destroyed user data.)
            skipped++;
          }
        }
        // Gemini active plan (saved/cleared on Save All; key buttons set _spPendingPlan)
        try {
          var pendingPlan = (typeof window._spPendingPlan === 'string') ? window._spPendingPlan : null;
          if (pendingPlan !== null) {
            if (pendingPlan) { await _spUpsertSetting('gemini_active_plan', pendingPlan); saved++; }
            else { await _spDeleteSetting('gemini_active_plan'); }
            window._spPendingPlan = null;
          }
          // Security: ensure no plaintext API keys linger in site_settings.
          // (Older admin builds saved them here; new flow keeps keys only in
          // Edge Function secrets.) Idempotent — DELETE on missing row is a no-op.
          var legacySlots = ['prepay','prepay_2','postpay','postpay_2'];
          for (var lsi = 0; lsi < legacySlots.length; lsi++) {
            await _spDeleteSetting('gemini_api_key_' + legacySlots[lsi]);
          }
        } catch(ge) { console.warn('[Gemini multi-key] save failed:', ge); }
        status.innerHTML = '<span style="color:#10b981;">✓ Saved ' + saved + ' setting(s)' + (skipped ? ', ' + skipped + ' empty field(s) skipped (use Reset to remove)' : '') + '</span>';
      } catch(e) {
        status.innerHTML = '<span style="color:#dc2626;">Save failed: ' + e.message + '</span>';
      }
    }

    async function resetScoringPrompts() {
      if (!confirm('Reset all scoring prompts to defaults? This will remove all custom prompts from the database.')) return;
      var status = document.getElementById('sysPromptStatus');
      status.innerHTML = '<span style="color:var(--muted);">Resetting...</span>';
      try {
        for (var i = 0; i < _SP_ALL_KEYS.length; i++) {
          await _spDeleteSetting(_SP_ALL_KEYS[i]);
          var el = document.getElementById('sp_' + _SP_ALL_KEYS[i]);
          if (el) el.value = '';
        }
        status.innerHTML = '<span style="color:#10b981;">✓ All prompts reset to defaults</span>';
      } catch(e) {
        status.innerHTML = '<span style="color:#dc2626;">Reset failed: ' + e.message + '</span>';
      }
    }


  // ── Inline-mount adaptation ─────────────────────────────────────────
  // Wrap openSystemPromptsPanel so the admin host can call it via
  // AdminPanels.systemPrompts.open(container) — same passcode bypass
  // pattern the other extracted panels use.
  var _origOpen = openSystemPromptsPanel;
  openSystemPromptsPanel = function () {
    if (!_inlineContainer && !_spAdminUnlocked && !_siteAdminUnlocked) {
      _showSpPasscode();
      return;
    }
    _injectStyles();
    if (_inlineContainer) {
      // Re-inject HTML into the host container on every open so a panel
      // switch (e.g. → Centers → back to System Prompts) gets a clean
      // tree. Tabs listener guard above prevents double-binding.
      _injectHtml(_inlineContainer);
    }
    var overlay = document.getElementById('sysPromptOverlay');
    if (overlay) {
      if (_inlineContainer) {
        // Inline mode: render as in-flow block (not fixed-position).
        overlay.style.cssText = 'position:static;inset:auto;background:none;display:block;opacity:1;pointer-events:auto;visibility:visible;padding:0;z-index:auto;';
        overlay.classList.add('visible', 'sp-inline');
      } else {
        overlay.style.display = 'flex';
        requestAnimationFrame(function () { overlay.classList.add('visible'); });
      }
    }
    loadScoringPrompts();
  };

  // Expose handlers referenced from inline onclick="..." attributes.
  window._spSetProvider           = _spSetProvider;
  window._spSetGroqVariant        = _spSetGroqVariant;
  // These two back 14 of the 18 provider rows but were never exported, so the
  // inline onclick="" threw ReferenceError and picking Gemini/OpenAI/Claude/
  // Grok/DeepSeek from this panel silently did nothing (only the Groq rows
  // worked). Found 2026-08-01 while rebuilding the picker as a table.
  window._spSetTierVariant        = _spSetTierVariant;
  window._spSetClaudeVariant      = _spSetClaudeVariant;
  window._spSetTranscriptionHelper= _spSetTranscriptionHelper;
  window._spSetGeminiPlan         = _spSetGeminiPlan;
  window._verifySpPasscode        = _verifySpPasscode;
  window._closeSpPasscode         = _closeSpPasscode;
  window.openSystemPromptsPanel   = openSystemPromptsPanel;
  window.closeSystemPromptsPanel  = closeSystemPromptsPanel;
  window.saveScoringPrompts       = saveScoringPrompts;
  window.resetScoringPrompts      = resetScoringPrompts;

  window.AdminPanels = window.AdminPanels || {};
  window.AdminPanels.systemPrompts = {
    open: function (container) {
      _inlineContainer = container || null;
      return openSystemPromptsPanel();
    }
  };
})();
