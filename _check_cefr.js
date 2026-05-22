
    // ===== BACK BUTTON (iframe support) =====
    // Parent-aware navigation: tell parent landing page to return, not navigate iframe
    function _navToLanding() {
      // Try window.top first (most reliable for nested iframes)
      try {
        if (window.top && window.top !== window && typeof window.top.returnToLanding === 'function') {
          window.top.returnToLanding(); return;
        }
      } catch (e1) {}
      // Fallback: try window.parent
      try {
        if (window.parent && window.parent !== window && typeof window.parent.returnToLanding === 'function') {
          window.parent.returnToLanding(); return;
        }
      } catch (e2) {}
      // Fallback: postMessage to top/parent
      try {
        if (window.top && window.top !== window) { window.top.postMessage('returnToLanding', '*'); return; }
        if (window.parent && window.parent !== window) { window.parent.postMessage('returnToLanding', '*'); return; }
      } catch (e3) {}
      // Last resort: navigate the TOP window (not the iframe)
      try { window.top.location.href = 'landing.html'; } catch (e4) { window.location.href = 'landing.html'; }
    }

    function goBack() {
      // Check if test is in progress - show warning modal
      try {
        if (testInProgress && !isReviewMode) {
          showLeaveWarningModal();
          return;
        }
      } catch(e) { /* testInProgress not yet defined */ }
      // Otherwise navigate directly
      window.__okToLeave = true;
      _navToLanding();
    }

    // ===== FULLSCREEN TOGGLE =====
    function toggleExamFullscreen() {
      try {
        window.top.postMessage('toggleFullscreen', '*');
      } catch(e) {
        var isFS = !!(document.fullscreenElement || document.webkitFullscreenElement);
        if (isFS) {
          if (document.exitFullscreen) document.exitFullscreen();
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        } else {
          var el = document.documentElement;
          if (el.requestFullscreen) el.requestFullscreen().catch(function(){});
          else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        }
      }
    }
    function _updateFSBtnIcons(isFS) {
      var pcBtn = document.getElementById('btnFS');
      var mobBtn = document.getElementById('mobFSBtn');
      if (pcBtn) pcBtn.textContent = isFS ? '✕' : '⛶';
      if (mobBtn) mobBtn.textContent = isFS ? '✕ Exit Fullscreen' : '⛶ Fullscreen';
    }
    try {
      window.top.document.addEventListener('fullscreenchange', function() {
        _updateFSBtnIcons(!!(window.top.document.fullscreenElement || window.top.document.webkitFullscreenElement));
      });
      window.top.document.addEventListener('webkitfullscreenchange', function() {
        _updateFSBtnIcons(!!(window.top.document.fullscreenElement || window.top.document.webkitFullscreenElement));
      });
    } catch(e) {
      document.addEventListener('fullscreenchange', function() { _updateFSBtnIcons(!!document.fullscreenElement); });
      document.addEventListener('webkitfullscreenchange', function() { _updateFSBtnIcons(!!document.webkitFullscreenElement); });
    }

    // ===== CONFIGURATION =====
    const urlParams = new URLSearchParams(window.location.search);
    const testFile = urlParams.get('test') || 'cefr-reading-test-01';

    // Practice part mode: ?part=1..5
    var _partParam = urlParams.get('part');
    if (_partParam) {
      var _ptNum = parseInt(_partParam, 10);
      if (_ptNum >= 1 && _ptNum <= 5) { window._practicePart = _ptNum; }
    }

    // Global variables
    let TEST_DATA = null;
    let currentPart = 0;
    let userAnswers = {};
    let timerInterval = null;
    let timeRemaining = window._practicePart ? 15 * 60 : 60 * 60; // 15 min practice / 60 min full
    let isReviewMode = false;

    // British ↔ American spelling variant pairs
    const SPELLING_PAIRS = [
      ['colour','color'],['favourite','favorite'],['honour','honor'],['humour','humor'],['labour','labor'],['neighbour','neighbor'],['behaviour','behavior'],['favour','favor'],['flavour','flavor'],['harbour','harbor'],['rumour','rumor'],['savour','savor'],['vapour','vapor'],['vigour','vigor'],['valour','valor'],['armour','armor'],['clamour','clamor'],['glamour','glamor'],['odour','odor'],['tumour','tumor'],['rancour','rancor'],['splendour','splendor'],['candour','candor'],
      ['centre','center'],['metre','meter'],['litre','liter'],['theatre','theater'],['fibre','fiber'],['lustre','luster'],['sombre','somber'],['spectre','specter'],['calibre','caliber'],['sabre','saber'],['manoeuvre','maneuver'],['reconnoitre','reconnoiter'],['meagre','meager'],['ochre','ocher'],['sepulchre','sepulcher'],['titre','titer'],['goitre','goiter'],['mitre','miter'],['nitre','niter'],['louvre','louver'],
      ['organise','organize'],['realise','realize'],['recognise','recognize'],['analyse','analyze'],['paralyse','paralyze'],['catalyse','catalyze'],['summarise','summarize'],['memorise','memorize'],['apologise','apologize'],['criticise','criticize'],['emphasise','emphasize'],['specialise','specialize'],['utilise','utilize'],['harmonise','harmonize'],['normalise','normalize'],['stabilise','stabilize'],['minimise','minimize'],['maximise','maximize'],['prioritise','prioritize'],['authorise','authorize'],['capitalise','capitalize'],['characterise','characterize'],['civilise','civilize'],['colonise','colonize'],['commercialise','commercialize'],['customise','customize'],['digitalise','digitalize'],['equalise','equalize'],['fertilise','fertilize'],['finalise','finalize'],['globalise','globalize'],['idealise','idealize'],['immunise','immunize'],['industrialise','industrialize'],['initialise','initialize'],['legalise','legalize'],['liberalise','liberalize'],['localise','localize'],['materialise','materialize'],['mechanise','mechanize'],['mineralise','mineralize'],['modernise','modernize'],['monopolise','monopolize'],['nationalise','nationalize'],['neutralise','neutralize'],['optimise','optimize'],['personalise','personalize'],['polarise','polarize'],['privatise','privatize'],['publicise','publicize'],['rationalise','rationalize'],['revitalise','revitalize'],['revolutionise','revolutionize'],['symbolise','symbolize'],['sympathise','sympathize'],['terrorise','terrorize'],['trivialise','trivialize'],['visualise','visualize'],['vocalise','vocalize'],
      ['defence','defense'],['offence','offense'],['licence','license'],['pretence','pretense'],
      ['travelling','traveling'],['traveller','traveler'],['cancelled','canceled'],['cancelling','canceling'],['channelled','channeled'],['counsellor','counselor'],['counselling','counseling'],['fuelled','fueled'],['fuelling','fueling'],['jewellery','jewelry'],['labelled','labeled'],['labelling','labeling'],['levelled','leveled'],['levelling','leveling'],['marshalled','marshaled'],['marvellous','marvelous'],['modelled','modeled'],['modelling','modeling'],['panelled','paneled'],['quarrelled','quarreled'],['revelled','reveled'],['rivalled','rivaled'],['signalled','signaled'],['signalling','signaling'],['travelled','traveled'],['woollen','woolen'],['enrolment','enrollment'],['fulfilment','fulfillment'],['instalment','installment'],['skilful','skillful'],['wilful','willful'],['distil','distill'],['enthral','enthrall'],['fulfil','fulfill'],['instil','instill'],['enrol','enroll'],
      ['aeroplane','airplane'],['aluminium','aluminum'],['annexe','annex'],['axe','ax'],['catalogue','catalog'],['cheque','check'],['cosy','cozy'],['dialogue','dialog'],['doughnut','donut'],['draught','draft'],['enquiry','inquiry'],['grey','gray'],['kerb','curb'],['mould','mold'],['moult','molt'],['moustache','mustache'],['pyjamas','pajamas'],['plough','plow'],['programme','program'],['sceptic','skeptic'],['storey','story'],['sulphur','sulfur'],['tyre','tire'],['waggon','wagon'],['ageing','aging'],['judgement','judgment'],['acknowledgement','acknowledgment']
    ];
    const _spellingMap = {};
    SPELLING_PAIRS.forEach(function(pair) {
      pair.forEach(function(w, i) {
        var wl = w.toLowerCase();
        if (!_spellingMap[wl]) _spellingMap[wl] = [];
        pair.forEach(function(v, j) { if (i !== j && _spellingMap[wl].indexOf(v.toLowerCase()) === -1) _spellingMap[wl].push(v.toLowerCase()); });
      });
      pair.forEach(function(w, i) {
        var ws = w.toLowerCase() + 's';
        if (!_spellingMap[ws]) _spellingMap[ws] = [];
        pair.forEach(function(v, j) { if (i !== j && _spellingMap[ws].indexOf(v.toLowerCase() + 's') === -1) _spellingMap[ws].push(v.toLowerCase() + 's'); });
      });
    });
    function getSpellingVariants(word) {
      if (!word) return [];
      return _spellingMap[word.toLowerCase()] || [];
    }

    // Get global logo
    const GLOBAL_LOGO_URL = (window.SITE_CONFIG && window.SITE_CONFIG.logoUrl) || (window.SPEAKING_TEST_DATA && window.SPEAKING_TEST_DATA.settings && window.SPEAKING_TEST_DATA.settings.logoUrl) || 'https://i.ibb.co/WN0XY5Lv/logo.png';
    const GLOBAL_LOGO_WORDING = (window.SITE_CONFIG && window.SITE_CONFIG.brandName) || (window.SPEAKING_TEST_DATA && window.SPEAKING_TEST_DATA.settings && window.SPEAKING_TEST_DATA.settings.logoWording) || 'Mock Stream';
    const GLOBAL_TEST_IDENTIFIER = (window.SITE_CONFIG && window.SITE_CONFIG.testIdentifier) || (window.SPEAKING_TEST_DATA && window.SPEAKING_TEST_DATA.settings && window.SPEAKING_TEST_DATA.settings.testIdentifier) || 'mock_stream';

    // Set logo
    document.getElementById('logoImg').src = GLOBAL_LOGO_URL;

    // Set mock number from test file name (extract number)
    const mockNum = testFile.match(/(\d+)/) ? testFile.match(/(\d+)/)[1] : '1';
    document.getElementById('mockNumber').textContent = mockNum.padStart(2, '0');

    // ===== LOAD TEST =====
    function loadTest() {
      // ── Supabase dynamic mock ──
      var sbMockId = urlParams.get('sbmock');
      if (sbMockId) {
        console.log('🌐 Loading CEFR Reading from Supabase, id=' + sbMockId);
        var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
        var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
        fetch(SB_URL + '/rest/v1/mock_tests?id=eq.' + encodeURIComponent(sbMockId) + '&select=mock_data', {
          headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
        })
        .then(function(r) { if (!r.ok) throw new Error('Supabase ' + r.status); return r.json(); })
        .then(function(rows) {
          if (!rows || !rows.length || !rows[0].mock_data) throw new Error('Empty response');
          window.CEFR_READING_TEST = rows[0].mock_data;
          TEST_DATA = window.CEFR_READING_TEST;
          initTest();
        })
        .catch(function(err) { console.error('❌ Supabase load failed:', err); showError('Failed to load test from Supabase'); });
        return;
      }
      // ── End Supabase ──
      const script = document.createElement('script');
      script.src = 'questions CEFR R/' + testFile + '.js';
      script.onload = () => {
        if (window.CEFR_READING_TEST) {
          TEST_DATA = window.CEFR_READING_TEST;
          initTest();
        } else {
          showError('Test data not found');
        }
      };
      script.onerror = () => showError('Failed to load test file');
      document.head.appendChild(script);
    }

    function showError(message) {
      document.getElementById('loadingScreen').innerHTML = `
        <div style="text-align:center;color:#ef4444;">
          <h2>Error</h2>
          <p>${message}</p>
          <a href="landing.html" style="color:#0d9488;">< Back to Home</a>
        </div>
      `;
    }

    // Track start time for caption
    let mockStartTime = null;

    // ===== INITIALIZE TEST =====
    function initTest() {
      // ── Premium gate: block retake by regular tier, otherwise record open ──
      try {
        (function () {
          if (!window.PremiumGate) return;
          var __pgSkill = 'reading';
          var __pgExam  = 'cefr';
          var __pgMock  = Number(window._currentMockNumber || (new URLSearchParams(location.search)).get('test') || (new URLSearchParams(location.search)).get('mock') || 0);
          if (!__pgMock) {
            try { var _m = (urlParams.get('test') || '').match(/(\d+)/); if (_m) __pgMock = Number(_m[1]); } catch (e) {}
          }
          if (!__pgMock) return;
          if (!window.PremiumGate.isPremiumTier(__pgSkill) && !window.PremiumGate.isAdmin()
              && window.PremiumGate.hasTaken({ skill: __pgSkill, exam_type: __pgExam, mock_number: __pgMock })) {
            window.PremiumGate.openUpgradeModal('retake_' + __pgSkill + '_' + __pgMock);
            throw new Error('PG_RETAKE_BLOCKED');
          }
          window.PremiumGate.recordOpen({ skill: __pgSkill, exam_type: __pgExam, mock_number: __pgMock });
        })();
      } catch (e) {
        if (e && e.message === 'PG_RETAKE_BLOCKED') return;
        throw e;
      }
      try {
        mockStartTime = new Date();
        // Set timer (practice mode uses shorter time)
        if (window._practicePart) {
          var practiceTimeLookup = { 1: 10, 2: 12, 3: 14, 4: 12, 5: 12 };
          timeRemaining = (practiceTimeLookup[window._practicePart] || 15) * 60;
        } else {
          timeRemaining = TEST_DATA.testInfo.totalTime * 60;
        }
        
        // Generate part navigation
        generatePartNav();
        
        // Generate all parts
        generateParts();
        
        // Show first part (or practice part)
        showPart(window._practicePart ? (window._practicePart - 1) : 0);
        
        // Practice mode: hide part nav, show only practised part, always show submit
        if (window._practicePart) {
          var partIdx = window._practicePart - 1;
          // Hide PC part nav
          var pcNav = document.getElementById('partNav');
          if (pcNav) pcNav.style.display = 'none';
          // Hide mobile dots
          var mobDots = document.getElementById('mobilePartNav');
          if (mobDots) mobDots.style.display = 'none';
          // Hide mobile FAB part tabs
          document.querySelectorAll('.part-tab').forEach(function(t){ t.style.display = 'none'; });
          // Hide non-practice part containers
          document.querySelectorAll('.part-container').forEach(function(p, i){
            p.style.display = i === partIdx ? '' : 'none';
            if (i === partIdx) p.classList.add('active');
          });
          // Always show submit, hide prev/next
          var btnSubmit = document.getElementById('btnSubmit');
          if (btnSubmit) btnSubmit.style.display = 'flex';
          var btnNext = document.getElementById('btnNext');
          if (btnNext) btnNext.style.display = 'none';
          var btnPrev = document.getElementById('btnPrev');
          if (btnPrev) btnPrev.style.display = 'none';
          // Show floating submit
          var floatingSubmit = document.getElementById('mobileFloatingSubmit');
          if (floatingSubmit) floatingSubmit.classList.add('visible');
        }
        
        // Start timer
        startTimer();

        // Auto-download PDF if triggered from mock selector page
        if (urlParams.get('download') === 'pdf') {
          setTimeout(function () {
            if (typeof generatePDF === 'function') {
              generatePDF();
            }
          }, 1500);
        }

        // Session recovery: restore saved state or start fresh auto-save
        if (window.SessionRecovery) {
          if (window._srResumeData) {
            var rd = window._srResumeData;
            timeRemaining = rd.timeRemaining != null ? rd.timeRemaining : timeRemaining;
            updateTimerDisplay();
            if (rd.currentPart != null) { showPart(rd.currentPart); }
            if (rd.userAnswers) {
              userAnswers = rd.userAnswers;
              SessionRecovery.restoreAnswers(rd.userAnswers);
            }
            window._srResumeData = null;
          }
          SessionRecovery.start();
        }
      } catch (err) {
        console.error('Error initializing test:', err);
      } finally {
        // Always hide loading screen
        document.getElementById('loadingScreen').style.display = 'none';
      }
    }

    // ===== GENERATE PART NAVIGATION =====
    function generatePartNav() {
      // PC part buttons in header
      const nav = document.getElementById('partNav');
      nav.innerHTML = TEST_DATA.parts.map((part, index) => `
        <button class="part-btn ${index === currentPart ? 'active' : ''}" data-part="${index}">
          Part ${part.partNumber}
        </button>
      `).join('');
      nav.querySelectorAll('.part-btn').forEach(btn => {
        btn.addEventListener('click', () => showPart(parseInt(btn.dataset.part)));
      });

      // Mobile part dots (original logic)
      const mobileDots = document.getElementById('mobilePartNav');
      if (mobileDots) {
        mobileDots.innerHTML = TEST_DATA.parts.map((part, index) => 
          '<div class="mobile-part-dot' + (index === currentPart ? ' active' : '') + '" data-part="' + index + '">' + part.partNumber + '</div>'
        ).join('');
        mobileDots.querySelectorAll('.mobile-part-dot').forEach(dot => {
          dot.addEventListener('click', () => showPart(parseInt(dot.dataset.part)));
        });
      }

      // Mobile FAB menu tabs (new logic)
      const fabTabs = document.getElementById('mobilePartTabs');
      if (fabTabs) {
        fabTabs.innerHTML = TEST_DATA.parts.map((part, index) => `
          <div class="part-tab ${index === currentPart ? 'active' : ''}" data-part="${index}">
            Part ${part.partNumber}
          </div>
        `).join('') + '<div class="fab-back-btn" id="fabBackBtn" onclick="window._fabBack()">↩ Back</div>';
        fabTabs.querySelectorAll('.part-tab').forEach(tab => {
          tab.addEventListener('click', () => {
            showPart(parseInt(tab.dataset.part));
            toggleMobileMenu();
          });
        });
      }
    }

    // ===== GENERATE PARTS =====
    function generateParts() {
      const container = document.getElementById('mainContainer');
      
      TEST_DATA.parts.forEach((part, partIndex) => {
        const partDiv = document.createElement('div');
        // Add full-width-split class for reading-comprehension type parts.
        // Also mirror the type on a data attribute so mobile CSS can hide
        // the part-header for matching-headings (its split-view needs every
        // pixel of vertical room on a phone).
        partDiv.className = part.type === 'reading-comprehension'
          ? 'part-container full-width-split'
          : 'part-container';
        partDiv.dataset.partType = part.type;
        partDiv.id = `part-${partIndex}`;
        
        // For reading-comprehension, part-header goes inside the split pane
        let html = part.type === 'reading-comprehension' ? '' : `
          <div class="part-header">
            <h2>${part.title}: Questions ${part.questionRange}</h2>
            <p class="instruction">${part.instruction}</p>
          </div>
        `;

        // Generate content based on part type
        switch(part.type) {
          case 'gap-fill-text':
            html += generateGapFillText(part);
            break;
          case 'matching':
            html += generateMatching(part);
            break;
          case 'matching-headings':
            html += generateMatchingHeadings(part);
            break;
          case 'reading-comprehension':
            html += generateReadingComprehension(part, partIndex);
            break;
        }

        partDiv.innerHTML = html;
        container.appendChild(partDiv);
      });

      // Add event listeners
      addEventListeners();

      // Wire the matching-headings split-view drag-and-drop + tap-to-assign
      // for every Part 3 container that just got rendered. Idempotent via
      // the `data-mh-wired` flag on .mh-split-container.
      document.querySelectorAll('.part-container').forEach(_mhWireSplitView);
    }

    // ===== PART TYPE GENERATORS =====
    
    function generateGapFillText(part) {
      // Replace gap spans with inline inputs
      let passageContent = part.passage.content;
      part.questions.forEach(q => {
        const gapPattern = new RegExp(`<span class="gap" data-gap="${q.id}">.*?</span>`, 'g');
        const inputHtml = `<span class="inline-gap-input"><span class="gap-number">${q.id}</span><input type="text" autocomplete="off" id="answer-${q.id}" data-question="${q.id}" placeholder="Type answer..."></span>`;
        passageContent = passageContent.replace(gapPattern, inputHtml);
      });

      return `
        <div class="passage-card">
          <h3>${part.passage.title}</h3>
          ${passageContent}
        </div>
      `;
    }

    function generateMatching(part) {
      const lastLetter = part.statements[part.statements.length - 1].letter;

      // ── PC view (≥1024px): split-view with statement chips on the LEFT
      // and text cards (with drop slots) on the RIGHT. Reuses the .mh-*
      // CSS + drag wiring from Part 3 so the UX is identical between
      // matching and matching-headings.
      const pcStatementsHtml = part.statements.map(s => `
        <div class="mh-heading-chip"
             data-letter="${s.letter}"
             tabindex="0"
             role="button">
          <span class="mh-heading-letter">${s.letter}</span>
          <span class="mh-heading-text">${s.text}</span>
          <span class="mh-heading-check" aria-hidden="true">✓</span>
        </div>
      `).join('');

      // Each text card on the right gets its own .mh-slot drop target
      // (carries .rich-select-trigger + data-question for backwards
      // compat with markAnswer). IDs are namespaced `m2-slot-${n}` to
      // avoid collision with the legacy mobile dropdown's
      // `rs-trigger-${n}` id below.
      const pcTextsHtml = part.texts.map(text => {
        const num = text.number || text.id;
        return `
          <div class="mh-para-card" data-part-type="matching" data-text-number="${num}">
            <div class="mh-para-head">
              <span class="mh-para-num">Text ${num}<span class="mh-para-qbadge">Q${num}</span></span>
              <div class="mh-slot rich-select-trigger matching-select"
                   id="m2-slot-${num}"
                   data-question="${num}"
                   data-qid="${num}"
                   tabindex="0"
                   role="button"
                   aria-label="Statement slot for text ${num}">
                <span class="mh-slot-empty">↳ Drop a statement here</span>
                <span class="mh-slot-filled" hidden>
                  <span class="mh-slot-letter"></span>
                  <span class="mh-slot-text"></span>
                  <button type="button"
                          class="mh-slot-clear"
                          aria-label="Clear statement"
                          onclick="_mhClear(${num}, event)">×</button>
                </span>
              </div>
            </div>
            <div class="para-content mh-para-body">${text.content}</div>
          </div>
        `;
      }).join('');

      const pcView = `
        <div class="m2-pc-view">
          <div class="mh-split-container" data-part="matching">
            <aside class="mh-headings-pane" aria-label="List of statements">
              <div class="mh-headings-title">📋 Statements (A-${lastLetter})</div>
              <div class="mh-headings-hint">Drag a statement onto a text — or tap one, then tap the slot.</div>
              <div class="mh-headings-list">${pcStatementsHtml}</div>
            </aside>
            <main class="mh-passage-pane">
              ${pcTextsHtml}
            </main>
          </div>
        </div>
      `;

      // ── Mobile view (<1024px): keep the legacy collapsible statements
      // + text cards with dropdown, untouched per user request — that
      // layout already works well at phone width.
      let mobileView = `<div class="m2-mobile-view">`;
      mobileView += `
        <div class="collapsible-statements" id="statementsCollapse">
          <div class="collapsible-header" onclick="toggleStatements(this)">
            <h4>📋 Statements (A-${lastLetter})</h4>
            <span class="collapsible-icon">▼</span>
          </div>
          <div class="collapsible-content">
            <div class="statements-inner">
              ${part.statements.map(s => `
                <div class="statement-item">
                  <span class="letter">${s.letter})</span>
                  <span>${s.text}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
      mobileView += `<div class="questions-card matching-questions" data-part-type="matching">
        <h4>Match each text with a statement:</h4>`;
      part.texts.forEach(text => {
        const num = text.number || text.id;
        mobileView += `
          <div class="text-card">
            <div class="text-header">
              <span class="text-number">${num}</span>
              ${text.title ? `<span style="font-weight:600;color:var(--primary);">${text.title}</span>` : `<span style="font-weight:600;color:#64748b;">Question ${num}</span>`}
            </div>
            <div class="text-content">${text.content}</div>
            <div class="rich-select-container" id="rs-container-${num}">
              <div class="rich-select-trigger matching-select" id="rs-trigger-${num}" data-question="${num}"
                   onclick="toggleRichSelect('${num}', event)">-- Select Statement --</div>
              <div class="rich-select-menu" id="rs-menu-${num}">
                ${part.statements.map(s =>
                  `<div class="rich-select-option" data-letter="${s.letter}"
                       onclick="selectRichOption('${num}','${s.letter}',this,event)">${s.letter}) ${s.text}</div>`
                ).join('')}
              </div>
            </div>
          </div>
        `;
      });
      mobileView += '</div></div>';

      return pcView + mobileView;
    }

    // Toggle collapsible statements
    function toggleStatements(header) {
      const container = header.closest('.collapsible-statements');
      container.classList.toggle('open');
    }

    // Rich select toggle
    function toggleRichSelect(qId, event) {
      if (event) event.stopPropagation();
      var menu = document.getElementById('rs-menu-' + qId);
      var trigger = document.getElementById('rs-trigger-' + qId);
      var isOpen = menu.style.display === 'block';
      // Close all
      document.querySelectorAll('.rich-select-menu').forEach(function(m){ m.style.display = 'none'; });
      document.querySelectorAll('.rich-select-trigger').forEach(function(t){ t.classList.remove('open'); });
      document.querySelectorAll('.text-card, .paragraph-card').forEach(function(c){ c.classList.remove('elevated'); });
      if (!isOpen) {
        menu.style.display = 'block';
        trigger.classList.add('open');
        var card = trigger.closest('.text-card') || trigger.closest('.paragraph-card');
        if (card) card.classList.add('elevated');
      }
    }

    // Rich select option chosen
    function selectRichOption(qId, letter, optEl, event) {
      if (event) event.stopPropagation();
      var trigger = document.getElementById('rs-trigger-' + qId);
      var menu = document.getElementById('rs-menu-' + qId);
      // Update display
      trigger.textContent = optEl.textContent;
      trigger.setAttribute('data-value', letter);
      trigger.classList.remove('open');
      if (menu) menu.style.display = 'none';
      var card = trigger.closest('.text-card') || trigger.closest('.paragraph-card');
      if (card) card.classList.remove('elevated');
      // Mark selected option
      menu.querySelectorAll('.rich-select-option').forEach(function(o){ o.classList.remove('selected'); });
      optEl.classList.add('selected');
      // Record answer
      userAnswers[qId] = letter;
      // Cross-sync to the PC mh-slot for Part 2 — when the user is on
      // mobile and picks via this dropdown, mirror the assignment into
      // the (hidden) PC pill so resizing back to desktop shows the same
      // answer. No-op for Part 3 since it has no legacy dropdown.
      try {
        var mhSlot = document.querySelector('.mh-slot[data-qid="' + qId + '"]');
        if (mhSlot) {
          var split = mhSlot.closest('.mh-split-container');
          var chip = split ? split.querySelector('.mh-heading-chip[data-letter="' + letter + '"]') : null;
          mhSlot.classList.add('mh-slot-filled-state');
          mhSlot.setAttribute('data-value', letter);
          var emptyEl = mhSlot.querySelector('.mh-slot-empty');
          if (emptyEl) emptyEl.hidden = true;
          var filledEl = mhSlot.querySelector('.mh-slot-filled');
          if (filledEl) {
            filledEl.hidden = false;
            filledEl.querySelector('.mh-slot-letter').textContent = letter;
            filledEl.querySelector('.mh-slot-text').textContent =
              chip ? chip.querySelector('.mh-heading-text').textContent : letter;
          }
          if (typeof _mhRefreshChipUsed === 'function') _mhRefreshChipUsed(split);
        }
      } catch (e) {}
      // Update used hints
      updateMatchingOptions();
      updateHeadingOptions();
    }

    // Close all rich selects on outside click
    document.addEventListener('click', function() {
      document.querySelectorAll('.rich-select-menu').forEach(function(m){ m.style.display = 'none'; });
      document.querySelectorAll('.rich-select-trigger').forEach(function(t){ t.classList.remove('open'); });
      document.querySelectorAll('.text-card, .paragraph-card').forEach(function(c){ c.classList.remove('elevated'); });
    });

    // Update matching dropdown options to show which are already selected
    function updateMatchingOptions() {
      var container = document.querySelector('.matching-questions');
      if (!container) return;
      var allTriggers = container.querySelectorAll('.rich-select-trigger');
      var selectedValues = new Set();
      allTriggers.forEach(function(t) {
        var v = t.getAttribute('data-value');
        if (v) selectedValues.add(v);
      });
      // Mark used options + duplicate triggers
      allTriggers.forEach(function(t) {
        var myVal = t.getAttribute('data-value');
        var menu = document.getElementById('rs-menu-' + t.getAttribute('data-question'));
        if (!menu) return;
        menu.querySelectorAll('.rich-select-option').forEach(function(opt) {
          var letter = opt.getAttribute('data-letter');
          var isUsedElsewhere = selectedValues.has(letter) && myVal !== letter;
          opt.classList.toggle('option-used', isUsedElsewhere);
        });
      });
    }

    // Initialize matching options on part show
    function initMatchingOptions() {
      updateMatchingOptions();
    }

    // Part 3 — matching-headings. Split-view: passage with numbered
    // paragraph cards on the left, draggable headings list on the right.
    // On mobile the right pane collapses to a sticky horizontal-scroll
    // chip row pinned to the top, and assignment falls back to tap-select
    // + tap-paragraph. The thin pill on each paragraph (.mh-slot) keeps
    // the legacy `.rich-select-trigger` + `data-question` attribute so
    // markAnswer() + the inline-review Q-pill injector both keep working
    // unchanged. selectRichOption is reused on success so the existing
    // updateHeadingOptions / used-elsewhere hints still apply.
    function generateMatchingHeadings(part) {
      const lastLetter = part.headings[part.headings.length - 1].letter;
      const headingsListHtml = part.headings.map(h => `
        <div class="mh-heading-chip"
             data-letter="${h.letter}"
             tabindex="0"
             role="button">
          <span class="mh-heading-letter">${h.letter}</span>
          <span class="mh-heading-text">${h.text}</span>
          <span class="mh-heading-check" aria-hidden="true">✓</span>
        </div>
      `).join('');

      const paragraphsHtml = part.passage.paragraphs.map(para => `
        <div class="mh-para-card" data-part-type="matching-headings" data-paragraph="${para.number}" data-paragraph-number="${para.number}">
          <div class="mh-para-head">
            <span class="mh-para-num">Paragraph ${para.number}<span class="mh-para-qbadge">Q${para.questionId}</span></span>
            <div class="mh-slot rich-select-trigger heading-select"
                 id="rs-trigger-${para.questionId}"
                 data-question="${para.questionId}"
                 data-qid="${para.questionId}"
                 tabindex="0"
                 role="button"
                 aria-label="Heading slot for paragraph ${para.number}">
              <span class="mh-slot-empty">↳ Drop a heading here</span>
              <span class="mh-slot-filled" hidden>
                <span class="mh-slot-letter"></span>
                <span class="mh-slot-text"></span>
                <button type="button"
                        class="mh-slot-clear"
                        aria-label="Clear heading"
                        onclick="_mhClear(${para.questionId}, event)">×</button>
              </span>
            </div>
          </div>
          <div class="para-content mh-para-body">${para.content}</div>
        </div>
      `).join('');

      // Note: outer wrapper gets .mh-split-container which CSS flips between
      // flex-row (desktop) and flex-column (mobile). The legacy collapsible
      // headings markup is gone — the right pane is always visible.
      return `
        <div class="mh-split-container" data-part="matching-headings">
          <aside class="mh-headings-pane" aria-label="List of headings">
            <div class="mh-headings-title">📋 List of Headings (A-${lastLetter})</div>
            <div class="mh-headings-hint">Drag a heading onto a paragraph — or tap one, then tap the slot.</div>
            <div class="mh-headings-list" id="mhHeadingsList">${headingsListHtml}</div>
          </aside>
          <div class="mh-mobile-divider" role="separator" aria-orientation="horizontal" aria-label="Resize headings pane" tabindex="0">
            <span class="mh-mobile-divider-grip"></span>
          </div>
          <main class="mh-passage-pane">
            <div class="passage-card matching-headings-container" data-part-type="matching-headings">
              <h3>${part.passage.title}</h3>
            </div>
            ${paragraphsHtml}
          </main>
        </div>
      `;
    }

    // Drag-and-drop + tap-to-assign wiring. Runs once on first render, then
    // again on each part switch (idempotent: bails out if the part is not
    // matching-headings or the listeners are already in place).
    function _mhWireSplitView(container) {
      if (!container) return;
      const split = container.querySelector('.mh-split-container');
      if (!split || split.dataset.mhWired === '1') return;
      split.dataset.mhWired = '1';

      const chips = split.querySelectorAll('.mh-heading-chip');
      const slots = split.querySelectorAll('.mh-slot');

      let tapSelectedLetter = null;
      function clearTapSelected() {
        tapSelectedLetter = null;
        chips.forEach(c => c.classList.remove('mh-chip-selected'));
      }

      // ── Custom pointer-events drag (mouse + touch + pen) ───────────
      // HTML5 drag-and-drop was unreliable in Chrome desktop — events
      // would silently fail. Pointer-based drag works on every input
      // type, with a fully visible floating ghost element that the user
      // can see drag with the cursor.
      chips.forEach(chip => {
        chip.addEventListener('pointerdown', e => {
          // Only react to primary mouse / touch / pen — and not on the
          // inline clear button or any future actionable child.
          if (e.pointerType === 'mouse' && e.button !== 0) return;
          if (e.target.closest('.mh-slot-clear')) return;

          const startX = e.clientX;
          const startY = e.clientY;
          let dragging = false;
          let ghost = null;
          let overSlot = null;

          // Don't capture pointer immediately — we want clicks (no movement
          // = tap-to-select) to still work normally. We only switch to drag
          // mode once movement exceeds the threshold.
          const onMove = (mv) => {
            const dx = mv.clientX - startX;
            const dy = mv.clientY - startY;
            if (!dragging && (dx * dx + dy * dy) < 36) return; // 6px²

            if (!dragging) {
              dragging = true;
              chip.classList.add('mh-chip-dragging');
              clearTapSelected();
              // Build a floating clone the cursor will drag around.
              ghost = chip.cloneNode(true);
              ghost.classList.add('mh-chip-ghost');
              ghost.style.cssText = 'position:fixed;pointer-events:none;z-index:99999;'
                + 'left:0;top:0;width:' + chip.offsetWidth + 'px;'
                + 'transform:translate3d(0,0,0);opacity:.92;'
                + 'box-shadow:0 8px 20px rgba(20,184,166,.35);'
                + 'border-color:#14b8a6;background:#fff;';
              document.body.appendChild(ghost);
              try { chip.setPointerCapture(mv.pointerId); } catch (_) {}
            }
            // Move ghost
            ghost.style.left = (mv.clientX - chip.offsetWidth / 2) + 'px';
            ghost.style.top  = (mv.clientY - chip.offsetHeight / 2) + 'px';
            // Find slot under cursor (hide ghost temporarily for hit-testing).
            ghost.style.display = 'none';
            const elUnder = document.elementFromPoint(mv.clientX, mv.clientY);
            ghost.style.display = '';
            const slot = elUnder ? elUnder.closest('.mh-slot') : null;
            if (slot !== overSlot) {
              if (overSlot) overSlot.classList.remove('mh-slot-over');
              if (slot) slot.classList.add('mh-slot-over');
              overSlot = slot;
            }
            mv.preventDefault();
          };

          const onUp = (up) => {
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
            document.removeEventListener('pointercancel', onUp);
            if (dragging) {
              chip.classList.remove('mh-chip-dragging');
              if (ghost) ghost.remove();
              if (overSlot) {
                overSlot.classList.remove('mh-slot-over');
                _mhAssign(overSlot.dataset.qid, chip.dataset.letter);
              }
              try { chip.releasePointerCapture(up.pointerId); } catch (_) {}
            } else {
              // No drag movement — treat as tap to select / unselect.
              if (tapSelectedLetter === chip.dataset.letter) {
                clearTapSelected();
              } else {
                clearTapSelected();
                tapSelectedLetter = chip.dataset.letter;
                chip.classList.add('mh-chip-selected');
              }
            }
          };

          document.addEventListener('pointermove', onMove);
          document.addEventListener('pointerup', onUp);
          document.addEventListener('pointercancel', onUp);
        });

        // Keyboard a11y: Enter/Space toggles tap-select on the chip.
        chip.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (tapSelectedLetter === chip.dataset.letter) {
              clearTapSelected();
            } else {
              clearTapSelected();
              tapSelectedLetter = chip.dataset.letter;
              chip.classList.add('mh-chip-selected');
            }
          }
        });
      });

      // Slots: tap-to-assign once a chip is selected, and keyboard handler.
      slots.forEach(slot => {
        slot.addEventListener('click', e => {
          // The inline clear (×) handler stops propagation, so this branch
          // is only hit on a true slot tap.
          if (!tapSelectedLetter) return;
          _mhAssign(slot.dataset.qid, tapSelectedLetter);
          clearTapSelected();
        });
        slot.addEventListener('keydown', e => {
          if ((e.key === 'Enter' || e.key === ' ') && tapSelectedLetter) {
            e.preventDefault();
            _mhAssign(slot.dataset.qid, tapSelectedLetter);
            clearTapSelected();
          }
        });
      });

      // Mobile divider drag — resize the top (headings) vs bottom (passage)
      // panes. Only wired when the divider element exists (mobile only;
      // CSS keeps it hidden on desktop).
      _mhWireMobileDivider(split);
    }

    // Mobile-only: divider between headings (top) and passage (bottom).
    // Drag the bar to resize the top pane's height. Persists nothing —
    // each visit starts at the CSS default. CSS hides the divider above
    // 1023px so this becomes a no-op on desktop.
    function _mhWireMobileDivider(split) {
      const divider = split.querySelector('.mh-mobile-divider');
      const top = split.querySelector('.mh-headings-pane');
      if (!divider || !top) return;
      divider.addEventListener('pointerdown', e => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        const startY = e.clientY;
        const startH = top.getBoundingClientRect().height;
        const splitRect = split.getBoundingClientRect();
        divider.setPointerCapture(e.pointerId);
        const onMove = (mv) => {
          const dy = mv.clientY - startY;
          // Clamp between 100px and (splitHeight - 100px) so the bottom
          // pane stays usable.
          const newH = Math.max(120, Math.min(splitRect.height - 160, startH + dy));
          top.style.height = newH + 'px';
          top.style.maxHeight = newH + 'px';
          top.style.flex = '0 0 ' + newH + 'px';
        };
        const onUp = (up) => {
          divider.removeEventListener('pointermove', onMove);
          divider.removeEventListener('pointerup', onUp);
          divider.removeEventListener('pointercancel', onUp);
          try { divider.releasePointerCapture(up.pointerId); } catch (_) {}
        };
        divider.addEventListener('pointermove', onMove);
        divider.addEventListener('pointerup', onUp);
        divider.addEventListener('pointercancel', onUp);
      });
    }

    // Apply the assignment: stamps the letter + heading text into the slot,
    // updates userAnswers, refreshes the chip "used" state, and forwards to
    // selectRichOption for the legacy used-elsewhere hint pipeline.
    function _mhAssign(qid, letter) {
      const slot = document.querySelector('.mh-slot[data-qid="' + qid + '"]');
      if (!slot) return;
      const split = slot.closest('.mh-split-container');
      const chip = split ? split.querySelector('.mh-heading-chip[data-letter="' + letter + '"]') : null;
      if (!chip) return;

      // Visual update
      slot.classList.add('mh-slot-filled-state');
      slot.setAttribute('data-value', letter);
      slot.querySelector('.mh-slot-empty').hidden = true;
      const filledEl = slot.querySelector('.mh-slot-filled');
      filledEl.hidden = false;
      filledEl.querySelector('.mh-slot-letter').textContent = letter;
      filledEl.querySelector('.mh-slot-text').textContent = chip.querySelector('.mh-heading-text').textContent;

      // Persist
      userAnswers[qid] = letter;

      // Refresh chip "used" state across all slots
      _mhRefreshChipUsed(split);

      // Cross-sync to Part 2's mobile dropdown — if there's a legacy
      // .rich-select-trigger for the same qid that is NOT the mh-slot,
      // update its visible text + data-value so when the viewport resizes
      // to mobile, the answer is still shown there.
      try {
        const legacy = document.getElementById('rs-trigger-' + qid);
        if (legacy && !legacy.classList.contains('mh-slot')) {
          const headingText = chip.querySelector('.mh-heading-text').textContent;
          legacy.textContent = letter + ') ' + headingText;
          legacy.setAttribute('data-value', letter);
          const menu = document.getElementById('rs-menu-' + qid);
          if (menu) {
            menu.querySelectorAll('.rich-select-option').forEach(o => {
              o.classList.toggle('selected', o.getAttribute('data-letter') === letter);
            });
          }
        }
      } catch (e) {}

      // Keep legacy hint pipeline happy (used-elsewhere indicators on the
      // hidden rich-select menus that the answers panel still walks).
      if (typeof updateMatchingOptions === 'function') updateMatchingOptions();
      if (typeof updateHeadingOptions === 'function') updateHeadingOptions();
    }

    // Clear an assignment — re-enables the heading chip on the right.
    function _mhClear(qid, event) {
      if (event) { event.stopPropagation(); event.preventDefault(); }
      const slot = document.querySelector('.mh-slot[data-qid="' + qid + '"]');
      if (!slot) return;
      slot.classList.remove('mh-slot-filled-state');
      slot.removeAttribute('data-value');
      slot.querySelector('.mh-slot-empty').hidden = false;
      slot.querySelector('.mh-slot-filled').hidden = true;
      delete userAnswers[qid];
      const split = slot.closest('.mh-split-container');
      _mhRefreshChipUsed(split);
      // Mirror clear to the legacy mobile dropdown if it exists (Part 2).
      try {
        const legacy = document.getElementById('rs-trigger-' + qid);
        if (legacy && !legacy.classList.contains('mh-slot')) {
          legacy.textContent = '-- Select Statement --';
          legacy.removeAttribute('data-value');
          const menu = document.getElementById('rs-menu-' + qid);
          if (menu) menu.querySelectorAll('.rich-select-option').forEach(o => o.classList.remove('selected'));
        }
      } catch (e) {}
      if (typeof updateMatchingOptions === 'function') updateMatchingOptions();
      if (typeof updateHeadingOptions === 'function') updateHeadingOptions();
    }
    window._mhClear = _mhClear;

    // Mark heading chips that have already been assigned to a paragraph so
    // students can see, at a glance, which letters are still in play.
    function _mhRefreshChipUsed(split) {
      if (!split) return;
      const used = new Set();
      split.querySelectorAll('.mh-slot[data-value]').forEach(s => used.add(s.getAttribute('data-value')));
      split.querySelectorAll('.mh-heading-chip').forEach(c => {
        c.classList.toggle('mh-chip-used', used.has(c.dataset.letter));
      });
    }

    // Update heading dropdown options to show which are already selected
    function updateHeadingOptions() {
      var allTriggers = document.querySelectorAll('.heading-select');
      if (!allTriggers.length) return;
      var selectedValues = new Set();
      allTriggers.forEach(function(t) {
        var v = t.getAttribute('data-value');
        if (v) selectedValues.add(v);
      });
      allTriggers.forEach(function(t) {
        var myVal = t.getAttribute('data-value');
        var menu = document.getElementById('rs-menu-' + t.getAttribute('data-question'));
        if (!menu) return;
        menu.querySelectorAll('.rich-select-option').forEach(function(opt) {
          var letter = opt.getAttribute('data-letter');
          var isUsedElsewhere = selectedValues.has(letter) && myVal !== letter;
          opt.classList.toggle('option-used', isUsedElsewhere);
        });
      });
    }

    function generateReadingComprehension(part, partIndex) {
      // Part header embedded at top of passage pane
      const partHeaderHtml = `
        <div class="part-header">
          <h2>${part.title}: Questions ${part.questionRange}</h2>
          <p class="instruction">${part.instruction}</p>
        </div>
      `;

      // Build passage HTML
      let passageHtml = `
        <div class="passage-card">
          <h3>${part.passage.title}</h3>
          ${part.passage.content}
        </div>
      `;

      // Build questions HTML
      let questionsHtml = '';
      part.questionSections.forEach(section => {
        questionsHtml += `<div class="questions-card">
          <h4>${section.title}</h4>
          <p style="color:#64748b;margin-bottom:16px;font-style:italic;">${section.instruction}</p>`;

        if (section.type === 'mcq') {
          section.questions.forEach(q => {
            questionsHtml += `
              <div class="mcq-question">
                <div class="question-text"><strong>${q.id}.</strong> ${q.text}</div>
                <div class="mcq-options">
                  ${q.options.map(opt => `
                    <label class="mcq-option" data-question="${q.id}" data-value="${opt.letter}">
                      <input type="radio" name="q${q.id}" value="${opt.letter}" data-question="${q.id}">
                      <span><strong>${opt.letter})</strong> ${opt.text}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
            `;
          });
        } else if (section.type === 'tfni') {
          // TFNI options render as vertically-stacked radio cards (same
          // shape as MCQ) so the UX matches IELTS Reading. Each option is
          // a <label> wrapping a hidden-checked <input type="radio"> plus
          // the option text. data-question / data-value attrs stay on the
          // label so markAnswer + the inline-review injector keep working.
          section.questions.forEach(q => {
            questionsHtml += `
              <div class="tfni-question">
                <div class="question-text"><strong>${q.id}.</strong> ${q.text}</div>
                <div class="tfni-options">
                  ${section.options.map(opt => `
                    <label class="tfni-option" data-question="${q.id}" data-value="${opt}">
                      <input type="radio" name="q${q.id}" value="${opt}" data-question="${q.id}">
                      <span>${opt}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
            `;
          });
        } else if (section.type === 'gap-fill') {
          // Replace gap spans with inline inputs in summary text
          let summaryContent = section.summaryText;
          section.questions.forEach(q => {
            const gapPattern = new RegExp(`<span class="gap-input" data-gap="${q.id}">.*?</span>`, 'g');
            const inputHtml = `<span class="inline-gap-input"><span class="gap-number">${q.id}</span><input type="text" autocomplete="off" id="answer-${q.id}" data-question="${q.id}" placeholder="Type answer..."></span>`;
            summaryContent = summaryContent.replace(gapPattern, inputHtml);
          });
          questionsHtml += `<div class="summary-text">${summaryContent}</div>`;
        }

        questionsHtml += '</div>';
      });

      // Return split-screen layout — part-header embedded in left pane
      return `
        <div class="split-screen-container">
          <div class="split-pane split-pane-left" id="splitLeft">
            ${partHeaderHtml}
            ${passageHtml}
          </div>
          <div class="split-divider" id="splitDivider"></div>
          <div class="split-pane split-pane-right" id="splitRight">
            ${questionsHtml}
          </div>
        </div>
      `;
    }

    // ===== EVENT LISTENERS =====
    function addEventListeners() {
      // Text inputs
      document.querySelectorAll('input[type="text"][data-question]').forEach(input => {
        input.addEventListener('input', (e) => {
          userAnswers[e.target.dataset.question] = e.target.value.trim().toLowerCase();
        });
      });

      // Selects — all handled by rich-select selectRichOption()

      // Radio buttons (MCQ)
      document.querySelectorAll('.mcq-option').forEach(option => {
        option.addEventListener('click', (e) => {
          const qId = option.dataset.question;
          const value = option.dataset.value;
          
          // Remove selected from siblings
          option.closest('.mcq-options').querySelectorAll('.mcq-option').forEach(opt => {
            opt.classList.remove('selected');
          });
          
          // Select this one
          option.classList.add('selected');
          option.querySelector('input').checked = true;
          userAnswers[qId] = value;
        });
      });

      // TFNI radio labels — same shape as MCQ now (each option is a
      // <label> wrapping a radio input). Click flips the `.selected`
      // class for visual state AND ticks the native radio for keyboard /
      // a11y semantics.
      document.querySelectorAll('.tfni-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const qId = btn.dataset.question;
          const value = btn.dataset.value;

          // Remove selected from siblings
          btn.closest('.tfni-options').querySelectorAll('.tfni-option').forEach(opt => {
            opt.classList.remove('selected');
          });

          // Select this one + tick the radio
          btn.classList.add('selected');
          var radio = btn.querySelector('input[type="radio"]');
          if (radio) radio.checked = true;
          userAnswers[qId] = value;
        });
      });

      // Navigation buttons
      document.getElementById('btnPrev').addEventListener('click', () => showPart(currentPart - 1));
      document.getElementById('btnNext').addEventListener('click', () => showPart(currentPart + 1));
      document.getElementById('btnSubmit').addEventListener('click', () => {
        document.getElementById('confirmModal').classList.add('active');
      });
      document.getElementById('confirmCancel').addEventListener('click', () => {
        document.getElementById('confirmModal').classList.remove('active');
      });
      document.getElementById('confirmSubmit').addEventListener('click', () => {
        document.getElementById('confirmModal').classList.remove('active');
        submitTest();
      });
      document.getElementById('btnReview').addEventListener('click', reviewAnswers);

      // Initialize split-screen divider drag
      initSplitDividers();
    }

    // ===== SPLIT SCREEN DRAG FUNCTIONALITY =====
    function initSplitDividers() {
      const dividers = document.querySelectorAll('.split-divider');
      
      dividers.forEach(divider => {
        let isResizing = false;
        let startX, startY, startLeftWidth, startLeftHeight, container, leftPane, rightPane;

        const isMobileView = () => window.innerWidth <= 900;

        const startResize = (e) => {
          isResizing = true;
          divider.classList.add('dragging');
          container = divider.closest('.split-screen-container');
          leftPane = container.querySelector('.split-pane-left');
          rightPane = container.querySelector('.split-pane-right');
          
          if (isMobileView()) {
            // Vertical resize for mobile
            startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
            startLeftHeight = leftPane.offsetHeight;
            document.body.style.cursor = 'row-resize';
          } else {
            // Horizontal resize for desktop
            startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            startLeftWidth = leftPane.offsetWidth;
            document.body.style.cursor = 'col-resize';
          }
          
          document.body.style.userSelect = 'none';
          e.preventDefault();
        };

        const doResize = (e) => {
          if (!isResizing) return;
          
          if (isMobileView()) {
            // Vertical resize for mobile
            const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
            const delta = clientY - startY;
            const newLeftHeight = Math.max(150, Math.min(window.innerHeight - 250, startLeftHeight + delta));
            
            leftPane.style.maxHeight = `${newLeftHeight}px`;
            leftPane.style.minHeight = `${newLeftHeight}px`;
          } else {
            // Horizontal resize for desktop
            const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const delta = clientX - startX;
            const containerWidth = container.offsetWidth - divider.offsetWidth;
            const newLeftWidth = Math.max(250, Math.min(containerWidth - 250, startLeftWidth + delta));
            const leftPercent = (newLeftWidth / containerWidth) * 100;
            
            leftPane.style.flex = `0 0 ${leftPercent}%`;
            rightPane.style.flex = `0 0 ${100 - leftPercent}%`;
          }
        };

        const stopResize = () => {
          if (!isResizing) return;
          isResizing = false;
          divider.classList.remove('dragging');
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
        };

        // Mouse events
        divider.addEventListener('mousedown', startResize);
        document.addEventListener('mousemove', doResize);
        document.addEventListener('mouseup', stopResize);

        // Touch events for mobile/tablets
        divider.addEventListener('touchstart', startResize, { passive: false });
        document.addEventListener('touchmove', doResize, { passive: false });
        document.addEventListener('touchend', stopResize);
      });
    }

    // ===== SHOW PART =====
    function showPart(index) {
      if (index < 0 || index >= TEST_DATA.parts.length) return;
      // In practice mode, lock to the practised part
      if (window._practicePart && index !== (window._practicePart - 1)) return;
      
      currentPart = index;
      
      // Update part containers
      document.querySelectorAll('.part-container').forEach((p, i) => {
        p.classList.toggle('active', i === index);
      });
      
      // Update nav buttons
      document.querySelectorAll('.part-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
      });

      // Update mobile dots
      document.querySelectorAll('.mobile-part-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });

      // Update FAB part tabs
      document.querySelectorAll('.part-tab').forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
      });
      
      // Update footer buttons
      document.getElementById('btnPrev').disabled = index === 0;
      document.getElementById('btnNext').style.display = index === TEST_DATA.parts.length - 1 ? 'none' : 'flex';
      document.getElementById('btnSubmit').style.display = index === TEST_DATA.parts.length - 1 ? 'flex' : 'none';

      // Toggle floating submit on last part (both PC and mobile)
      const floatingSubmit = document.getElementById('mobileFloatingSubmit');
      if (floatingSubmit) {
        if (index === TEST_DATA.parts.length - 1) {
          floatingSubmit.classList.add('visible');
        } else {
          floatingSubmit.classList.remove('visible');
        }
      }
      
      // Scroll to top
      window.scrollTo(0, 0);
    }

    // ===== TIMER =====
    function startTimer() {
      updateTimerDisplay();
      timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        // Timer continues into negative - no auto submit
      }, 1000);
    }

    function updateTimerDisplay() {
      const timerBox = document.getElementById('timerBox');
      const timerDisplay = document.getElementById('timerDisplay');
      const mobileTimer = document.getElementById('mobileTimerValue');
      
      timerBox.classList.remove('warning', 'danger', 'overtime');
      
      let timerText = "";
      if (timeRemaining >= 0) {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeRemaining <= 300) timerBox.classList.add('danger');
        else if (timeRemaining <= 600) timerBox.classList.add('warning');
      } else {
        const absTime = Math.abs(timeRemaining);
        const minutes = Math.floor(absTime / 60);
        const seconds = absTime % 60;
        timerText = `-${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timerBox.classList.add('overtime');
      }
      
      timerDisplay.textContent = timerText;
      if (mobileTimer) mobileTimer.textContent = timerText;
    }

    // ===== SUBMIT TEST =====
    let hasSubmitted = false;
    
    // Helper: check if user answer matches any acceptable answer, including "/" or "or" combined inputs
    // Also accepts British/American spelling variants automatically
    function matchesAnswer(userAns, correctArr) {
      if (!userAns) return false;
      var arr = Array.isArray(correctArr) ? correctArr : [correctArr];
      var uLow = userAns.toString().toLowerCase().trim();
      if (arr.some(function(c){ return c.toString().toLowerCase().trim() === uLow; })) return true;
      var userVariants = getSpellingVariants(uLow);
      if (userVariants.length > 0 && arr.some(function(c){ return userVariants.indexOf(c.toString().toLowerCase().trim()) !== -1; })) return true;
      if (arr.some(function(c){ var v = getSpellingVariants(c.toString().toLowerCase().trim()); return v.indexOf(uLow) !== -1; })) return true;
      if (arr.length > 1) {
        var parts = userAns.toString().split(/\s*[\/]\s*|\s+or\s+/i).map(function(p){ return p.toLowerCase().trim(); }).filter(Boolean);
        if (parts.length > 1 && parts.some(function(p){ return arr.some(function(c){ return c.toString().toLowerCase().trim() === p; }) || getSpellingVariants(p).some(function(v){ return arr.some(function(c){ return c.toString().toLowerCase().trim() === v; }); }); })) return true;
      }
      return false;
    }

    /* Processing spinner overlay — prevents premature tab close */
    (function(){var o=document.createElement('div');o.id='processingOverlay';o.style.cssText='display:none;position:fixed;inset:0;z-index:100000;background:rgba(15,23,42,0.85);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);flex-direction:column;align-items:center;justify-content:center;gap:18px;';o.innerHTML='<div style="width:56px;height:56px;border:5px solid rgba(255,255,255,0.15);border-top-color:#fff;border-radius:50%;animation:_procSpin .7s linear infinite"></div><p style="color:#fff;font-size:18px;font-weight:700;margin:0;text-align:center">Submitting your results\u2026</p><p style="color:#f87171;font-size:14px;font-weight:700;margin:0;text-align:center;animation:_procPulse 1.5s ease-in-out infinite">\u26A0\uFE0F Do NOT close this window</p><p style="color:#93c5fd;font-size:13px;font-weight:600;margin:0;text-align:center">\uD83D\uDCE8 Sending notification\u2026</p>';var s=document.createElement('style');s.textContent='@keyframes _procSpin{to{transform:rotate(360deg)}}@keyframes _procPulse{0%,100%{opacity:1}50%{opacity:.4}}';document.head.appendChild(s);document.body.appendChild(o);window._showProcessing=function(){o.style.display='flex';};window._hideProcessing=function(){o.style.display='none';};window.addEventListener('beforeunload',function(e){if(o.style.display==='flex'){e.preventDefault();e.returnValue='';}});})();

    function submitTest() {
      // Prevent multiple submissions
      if (hasSubmitted) {
        return;
      }
      hasSubmitted = true;

      // Clear session recovery on submit
      if (window.SessionRecovery) SessionRecovery.clear();
      
      // Disable the submit button
      const submitBtn = document.getElementById('btnSubmit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        submitBtn.style.cursor = 'not-allowed';
      }
      
      // Also disable confirm submit button
      const confirmSubmitBtn = document.getElementById('confirmSubmit');
      if (confirmSubmitBtn) {
        confirmSubmitBtn.disabled = true;
        confirmSubmitBtn.style.opacity = '0.5';
        confirmSubmitBtn.style.cursor = 'not-allowed';
      }
      
      clearInterval(timerInterval);
      isReviewMode = true;
      
      let correct = 0;
      let incorrect = 0;
      let unanswered = 0;

      // In practice mode, only score the practised part
      var _scoreParts = window._practicePart
        ? [TEST_DATA.parts[window._practicePart - 1]]
        : TEST_DATA.parts;

      // Check answers
      _scoreParts.forEach(part => {
        for (const [qId, correctAnswerRaw] of Object.entries(part.answers)) {
          const userAnswer = userAnswers[qId] || '';
          
          // Normalize correctAnswers to always be an array
          const correctAnswers = Array.isArray(correctAnswerRaw) ? correctAnswerRaw : [correctAnswerRaw];
          
          if (!userAnswer) {
            unanswered++;
            // Mark unanswered and show correct answer
            markAnswer(qId, false, correctAnswers[0], true);
          } else {
            // Check if answer is correct (case insensitive for text)
            const isCorrect = matchesAnswer(userAnswer, correctAnswers);
            
            if (isCorrect) {
              correct++;
              markAnswer(qId, true, correctAnswers[0]);
            } else {
              incorrect++;
              markAnswer(qId, false, correctAnswers[0]);
            }
          }
        }
      });

      // Show results
      var _totalQ = correct + incorrect + unanswered;
      document.getElementById('finalScore').textContent = correct;
      document.getElementById('finalTotal').textContent = `/ ${_totalQ}`;
      document.getElementById('correctCount').textContent = correct;
      document.getElementById('incorrectCount').textContent = incorrect;
      document.getElementById('unansweredCount').textContent = unanswered;
      
      // Set pill score for minimized state
      var pillScore = document.getElementById('pillScore');
      if (pillScore) pillScore.textContent = correct + '/' + _totalQ;
      
      // Generate part-by-part breakdown with expandable dropdowns
      let partsHtml = '';
      _scoreParts.forEach((part, partIndex) => {
        let partCorrect = 0, partTotal = 0;
        let answersTableRows = '';
        
        if (part.answers) {
          const sortedQIds = Object.keys(part.answers).sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.replace(/\D/g, '')) || 0;
            return numA - numB;
          });
          
          sortedQIds.forEach(qId => {
            partTotal++;
            const correctAnswerRaw = part.answers[qId];
            const correctAnswers = Array.isArray(correctAnswerRaw) ? correctAnswerRaw : [correctAnswerRaw];
            const user = userAnswers[qId] || '';
            const correctStr = correctAnswers.length > 1 ? correctAnswers.join(' or ') : correctAnswers[0];
            
            let isCorrect = false;
            if (user) {
              isCorrect = matchesAnswer(user, correctAnswers);
            }
            
            if (isCorrect) partCorrect++;
            
            const qNum = qId.replace(/\D/g, '') || qId;
            let rowClass = 'unanswered-row';
            let userClass = 'user-answer empty';
            let userDisplay = '(no answer)';
            
            if (user) {
              userClass = 'user-answer';
              userDisplay = user;
              rowClass = isCorrect ? 'correct-row' : 'incorrect-row';
            }
            
            answersTableRows += '<div class="answers-table-row ' + rowClass + '">' +
              '<div class="q-num">Q' + qNum + '</div>' +
              '<div class="' + userClass + '">' + userDisplay + '</div>' +
              '<div class="correct-answer">' + correctStr + '</div>' +
            '</div>';
          });
        }
        
        partsHtml += '<div class="part-result-container" data-part="' + partIndex + '">' +
          '<div class="part-result-header" onclick="togglePartAnswers(' + partIndex + ')">' +
            '<div class="part-result-left">' +
              '<div class="part-result-toggle">▼</div>' +
              '<span>' + part.title + '</span>' +
            '</div>' +
            '<span class="part-result-score">' + partCorrect + '/' + partTotal + '</span>' +
          '</div>' +
          '<div class="part-answers-table">' +
            '<div class="answers-table-header">' +
              '<div>#</div>' +
              '<div>Your Answer</div>' +
              '<div>Correct Answer</div>' +
            '</div>' +
            answersTableRows +
          '</div>' +
        '</div>';
      });
      document.getElementById('partsBreakdown').innerHTML = partsHtml;
      
      document.getElementById('resultsModal').classList.remove('minimized');
      var _regReading = !(sessionStorage.getItem('readingPremiumEntry') === 'true');
      if (!_regReading) {
        document.getElementById('resultsModal').classList.add('show');
        if (typeof window._updateFabBack === 'function') window._updateFabBack();
        if (typeof resetFabIdle === 'function') resetFabIdle();
      }

      // Grey-out Review/TryAgain for regular (non-premium) codes
      (function() {
        var isPremium = sessionStorage.getItem('readingPremiumEntry') === 'true';
        if (!isPremium) {
        }
        var reviewBtn = document.getElementById('btnReview');
        var tryAgainBtn = document.getElementById('btnTryAgain');
        if (!isPremium) {
          var frozenStyle = 'background:#cbd5e1 !important;color:#94a3b8 !important;cursor:not-allowed !important;box-shadow:none !important;pointer-events:none;opacity:0.85;';
          [{ el: reviewBtn, label: '🔒 Review Answers (Premium)' },
           { el: tryAgainBtn, label: '🔒 Try Again (Premium)' }
          ].forEach(function(b) {
            if (b.el) {
              b.el.style.cssText += frozenStyle;
              b.el.innerHTML = b.label;
              b.el.onclick = function(e) { e.preventDefault(); e.stopPropagation(); };
              b.el.removeAttribute('onclick');
            }
          });
        }
      })();

      // ── Premium gate: lock AI / review / retry buttons for regular tier ──
      (function () {
        if (!window.PremiumGate) return;
        if (window.PremiumGate.isPremiumTier('reading') || window.PremiumGate.isAdmin()) return;
        ['#aiAnalyzeBtn', '#aiRetryBtn', '#reviewAnswersBtn', '#tryAgainBtn',
         '#btnReview', '#btnTryAgain', '[data-pg-lock]'].forEach(function (s) {
          document.querySelectorAll(s).forEach(function (el) {
            window.PremiumGate.applyLockBadge(el, 'reading_result_' + s);
          });
        });
      })();

      // The standalone "💡 Explanations" button is intentionally always
      // hidden now — Review Answers handles both jobs (return to test view
      // AND show explanations as inline drop-downs near each question, with
      // passage-side Q-pill highlights for Parts 2-5). The old crExplPanel
      // function still exists as a fallback that nobody triggers.
      (function() {
        var btn = document.getElementById('btnShowExpl');
        if (btn) btn.style.display = 'none';
      })();

      // Auto-submit results to backend (with processing spinner for regular entries)
      if (_regReading && window._showProcessing) window._showProcessing();
      sendResultsToBackend(correct, incorrect, unanswered).finally(function() {
        if (window._hideProcessing) window._hideProcessing();
        if (_regReading) {
          document.getElementById('resultsModal').classList.add('show');
          if (typeof window._updateFabBack === 'function') window._updateFabBack();
          if (typeof resetFabIdle === 'function') resetFabIdle();
        }
      });
    }
    
    // Toggle part answers dropdown
    function togglePartAnswers(partIndex) {
      const container = document.querySelector('.part-result-container[data-part="' + partIndex + '"]');
      if (container) {
        container.classList.toggle('expanded');
      }
    }

    // ===== AUTO-SUBMIT RESULTS TO TELEGRAM =====
    async function sendResultsToBackend(correct, incorrect, unanswered) {
      try {
        // Ensure candidate name is synced from universal input if available
        (function () {
          var fullName = sessionStorage.getItem('CANDIDATE_FULL_NAME');
          if (fullName && !sessionStorage.getItem('cefrReadingCandidateName')) {
            sessionStorage.setItem('cefrReadingCandidateName', fullName);
          }
        })();

        // Get candidate name from sessionStorage
        const candidateName = sessionStorage.getItem('cefrReadingCandidateName') || 'Unknown';
        
        const testIdentifier = TEST_DATA?.testInfo?.title || 'CEFR Reading Test';
        const mockNum = testFile.match(/(\d+)/) ? testFile.match(/(\d+)/)[1].padStart(2, '0') : '01';
        const total = correct + incorrect + unanswered;
        const percentage = Math.round((correct / total) * 100);

        // Certificate score conversion table for CEFR Reading (O'qish)
        function getCertificateScore(rawScore) {
          const conversionTable = {
            0: 0, 1: 20, 2: 24, 3: 27, 4: 29, 5: 32, 6: 34, 7: 36, 8: 38, 9: 39,
            10: 41, 11: 42, 12: 44, 13: 45, 14: 46, 15: 48, 16: 49, 17: 51, 18: 52,
            19: 54, 20: 55, 21: 57, 22: 58, 23: 60, 24: 61, 25: 63, 26: 65, 27: 66,
            28: 68, 29: 70, 30: 71, 31: 73, 32: 74, 33: 75, 34: 75, 35: 75
          };
          return conversionTable[rawScore] || (rawScore > 35 ? 75 : 0);
        }
        const certificateScore = getCertificateScore(correct);

        // Calculate CEFR Level based on score
        function getCEFRLevel(score) {
          if (score <= 6) return { level: 'Below B1', color: '#ef4444', bg: '#fee2e2' };
          if (score <= 16) return { level: 'B1', color: '#f59e0b', bg: '#fef3c7' };
          if (score <= 25) return { level: 'B2', color: '#3b82f6', bg: '#dbeafe' };
          return { level: 'C1', color: '#10b981', bg: '#d1fae5' };
        }
        const cefrResult = getCEFRLevel(correct);

        // Build part results
        var _reportParts = window._practicePart ? [TEST_DATA.parts[window._practicePart - 1]] : TEST_DATA.parts;
        function generatePartResults() {
          var html = '';
          _reportParts.forEach(function(part) {
            var partCorrect = 0, partTotal = 0;
            if (part.answers) {
              for (var qId in part.answers) {
                partTotal++;
                var correctAns = part.answers[qId];
                var userAns = userAnswers[qId];
                if (userAns && matchesAnswer(userAns, correctAns)) {
                  partCorrect++;
                }
              }
            }
            html += '<div class="part-result"><span class="part-name">' + part.title + '</span><span class="part-score">' + partCorrect + '/' + partTotal + '</span></div>';
          });
          return html;
        }

        // Build answer rows
        function generateAnswerRows() {
          var rows = '';
          _reportParts.forEach(function(part) {
            for (var qId in part.answers) {
              var userAnswer = userAnswers[qId] || '';
              var correctAnswerRaw = part.answers[qId];
              var correctAnswers = Array.isArray(correctAnswerRaw) ? correctAnswerRaw : [correctAnswerRaw];
              var correctAnswer = correctAnswers[0] || '';
              var isCorrect = false;
              var rowClass = 'unanswered-row';
              var status = '-';
              if (userAnswer) {
                isCorrect = matchesAnswer(userAnswer, correctAnswers);
                rowClass = isCorrect ? 'correct-row' : 'incorrect-row';
                status = isCorrect ? 'O' : 'X';
              }
              rows += '<div class="answer-row ' + rowClass + '"><span class="q-num">' + qId + '</span><span class="user-ans">' + (userAnswer || '(empty)') + '</span><span class="correct-ans">' + correctAnswer + '</span><span class="status">' + status + '</span></div>';
            }
          });
          return rows;
        }

        // Build detailed parts
        function generateDetailedParts() {
          var html = '';
          _reportParts.forEach(function(part) {
            html += '<div class="part-block"><div class="part-title">' + part.title + ' (' + part.questionRange + ')</div>';
            html += '<div class="part-instruction">' + (part.instruction || '') + '</div>';
            
            // Show passage if exists
            if (part.passage) {
              html += '<div class="passage-box">';
              if (part.passage.title) html += '<div class="passage-title">' + part.passage.title + '</div>';
              if (part.passage.content) html += '<div class="passage-content">' + part.passage.content + '</div>';
              if (part.passage.paragraphs) {
                part.passage.paragraphs.forEach(function(para) {
                  var qId = para.questionId;
                  var userAns = userAnswers[qId] || '';
                  var correctAnsRaw = part.answers[qId];
                  var correctAnswers = Array.isArray(correctAnsRaw) ? correctAnsRaw : [correctAnsRaw];
                  var correctAns = correctAnswers[0] || '';
                  var isCorrect = userAns && matchesAnswer(userAns, correctAnswers);
                  html += '<div class="paragraph-box"><div class="paragraph-number">Paragraph ' + para.number + ' (Q' + qId + ')</div>';
                  html += '<div class="text-content">' + para.content + '</div>';
                  html += '<div style="margin-top:10px;padding-top:10px;border-top:1px dashed #e2e8f0"><span>Your answer: </span>';
                  html += '<span class="gap-answer ' + (isCorrect ? 'correct-ans' : (userAns ? 'user-wrong' : '')) + '">' + (userAns || '(empty)') + '</span>';
                  if (!isCorrect) html += '<span> > Correct: </span><span class="gap-answer correct-ans">' + correctAns + '</span>';
                  html += '</div></div>';
                });
              }
              html += '</div>';
            }
            
            // Show texts for matching type
            if (part.texts) {
              part.texts.forEach(function(text) {
                var qId = text.number;
                var userAns = userAnswers[qId] || '';
                var correctAnsRaw = part.answers[qId];
                var correctAnswers = Array.isArray(correctAnsRaw) ? correctAnsRaw : [correctAnsRaw];
                var correctAns = correctAnswers[0] || '';
                var isCorrect = userAns && matchesAnswer(userAns, correctAnswers);
                html += '<div class="text-item"><div class="text-number">Text ' + text.number + '</div>';
                html += '<div class="text-content">' + text.content + '</div>';
                html += '<div style="margin-top:10px;padding-top:10px;border-top:1px dashed #e2e8f0"><span>Your answer: </span>';
                html += '<span class="gap-answer ' + (isCorrect ? 'correct-ans' : (userAns ? 'user-wrong' : '')) + '">' + (userAns || '(empty)') + '</span>';
                if (!isCorrect) html += '<span> > Correct: </span><span class="gap-answer correct-ans">' + correctAns + '</span>';
                html += '</div></div>';
              });
              if (part.statements) {
                html += '<div style="margin-top:15px;padding:12px;background:#f0fdfa;border-radius:8px"><strong>Statements:</strong><br>';
                part.statements.forEach(function(st) { html += '<div style="margin:5px 0"><strong>' + st.letter + '.</strong> ' + st.text + '</div>'; });
                html += '</div>';
              }
            }
            
            // Show headings
            if (part.headings) {
              html += '<div style="margin-bottom:15px;padding:12px;background:#f0fdfa;border-radius:8px"><strong>Available Headings:</strong><br>';
              part.headings.forEach(function(h) { html += '<div style="margin:5px 0"><strong>' + h.letter + '.</strong> ' + h.text + '</div>'; });
              html += '</div>';
            }
            
            // Handle questions array
            if (part.questions) {
              part.questions.forEach(function(q) {
                var qId = q.id;
                var userAns = userAnswers[qId] || '';
                var correctAnsRaw = part.answers[qId];
                var correctAnswers = Array.isArray(correctAnsRaw) ? correctAnsRaw : [correctAnsRaw];
                var correctAns = correctAnswers[0] || '';
                var isCorrect = userAns && matchesAnswer(userAns, correctAnswers);
                html += '<div class="question-item"><div class="question-text">Question ' + qId + (q.text ? ': ' + q.text : '') + (q.hint ? ' (' + q.hint + ')' : '') + '</div>';
                if (q.options) {
                  q.options.forEach(function(opt) {
                    var optClass = '';
                    var badges = '';
                    var isUserSelected = userAns === opt.letter;
                    var isCorrectOption = correctAns === opt.letter;
                    if (isUserSelected && isCorrectOption) { optClass = 'user-correct'; badges = '<span class="badge correct">? Your Answer</span>'; }
                    else if (isUserSelected) { optClass = 'user-selected'; badges = '<span class="badge your-answer">? Your Answer</span>'; }
                    else if (isCorrectOption) { optClass = 'correct-answer'; badges = '<span class="badge correct">? Correct</span>'; }
                    html += '<div class="option-row ' + optClass + '"><span class="option-letter">' + opt.letter + '.</span><span>' + opt.text + '</span>' + badges + '</div>';
                  });
                } else {
                  html += '<div style="margin-top:8px"><span>Your answer: </span><span class="gap-answer ' + (isCorrect ? 'correct-ans' : (userAns ? 'user-wrong' : '')) + '">' + (userAns || '(empty)') + '</span>';
                  if (!isCorrect) html += '<span> > Correct: </span><span class="gap-answer correct-ans">' + correctAns + '</span>';
                  html += '</div>';
                }
                html += '</div>';
              });
            }
            
            // Handle questionSections
            if (part.questionSections) {
              part.questionSections.forEach(function(section) {
                html += '<div style="margin:15px 0;padding:10px;background:#f8fafc;border-radius:8px">';
                html += '<div style="font-weight:600;color:#6366f1;margin-bottom:10px">' + (section.title || '') + '</div>';
                html += '<div style="font-size:13px;color:#64748b;margin-bottom:10px">' + (section.instruction || '') + '</div>';
                section.questions.forEach(function(q) {
                  var qId = q.id;
                  var userAns = userAnswers[qId] || '';
                  var correctAnsRaw = part.answers[qId];
                  var correctAnswers = Array.isArray(correctAnsRaw) ? correctAnsRaw : [correctAnsRaw];
                  var correctAns = correctAnswers[0] || '';
                  var isCorrect = userAns && matchesAnswer(userAns, correctAnswers);
                  html += '<div class="question-item"><div class="question-text">Q' + qId + ': ' + (q.text || '') + '</div>';
                  if (q.options) {
                    q.options.forEach(function(opt) {
                      var optClass = '';
                      var badges = '';
                      var isUserSelected = userAns === opt.letter;
                      var isCorrectOption = correctAns === opt.letter;
                      if (isUserSelected && isCorrectOption) { optClass = 'user-correct'; badges = '<span class="badge correct">? Your Answer</span>'; }
                      else if (isUserSelected) { optClass = 'user-selected'; badges = '<span class="badge your-answer">? Your Answer</span>'; }
                      else if (isCorrectOption) { optClass = 'correct-answer'; badges = '<span class="badge correct">? Correct</span>'; }
                      html += '<div class="option-row ' + optClass + '"><span class="option-letter">' + opt.letter + '.</span><span>' + opt.text + '</span>' + badges + '</div>';
                    });
                  } else {
                    html += '<div style="margin-top:8px"><span>Your answer: </span><span class="gap-answer ' + (isCorrect ? 'correct-ans' : (userAns ? 'user-wrong' : '')) + '">' + (userAns || '(empty)') + '</span>';
                    if (!isCorrect) html += '<span> > Correct: </span><span class="gap-answer correct-ans">' + correctAns + '</span>';
                    html += '</div>';
                  }
                  html += '</div>';
                });
                html += '</div>';
              });
            }
            
            html += '</div>';
          });
          return html;
        }

        // Build HTML report
        const now = new Date();
        const reportHtml = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CEFR Reading Results</title><style>' +
          'body { font-family: "Segoe UI", sans-serif; padding: 20px; background: #f0fdfa; }' +
          '.container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }' +
          'h1 { color: #0d9488; text-align: center; margin-bottom: 20px; }' +
          '.score-box { text-align: center; padding: 30px; background: linear-gradient(135deg, #0d9488, #0f766e); border-radius: 12px; color: white; margin: 20px 0; }' +
          '.score { font-size: 48px; font-weight: bold; }' +
          '.total { font-size: 24px; opacity: 0.9; }' +
          '.details { display: flex; justify-content: space-around; margin: 20px 0; }' +
          '.detail { text-align: center; padding: 15px; border-radius: 8px; flex: 1; margin: 0 5px; }' +
          '.detail.correct { background: #d1fae5; color: #065f46; }' +
          '.detail.incorrect { background: #fee2e2; color: #991b1b; }' +
          '.detail.unanswered { background: #e0e7ff; color: #3730a3; }' +
          '.detail .value { font-size: 28px; font-weight: bold; }' +
          '.detail .label { font-size: 14px; margin-top: 5px; }' +
          '.parts { margin: 20px 0; }' +
          '.part-result { display: flex; justify-content: space-between; padding: 12px 15px; background: #f8fafc; border-radius: 8px; margin: 8px 0; }' +
          '.part-name { font-weight: 600; color: #334155; }' +
          '.part-score { color: #0d9488; font-weight: bold; }' +
          '.info { margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; font-size: 14px; color: #64748b; }' +
          '.answer-row { display: flex; padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }' +
          '.answer-row.correct-row { background: #d1fae5; }' +
          '.answer-row.incorrect-row { background: #fee2e2; }' +
          '.answer-row.unanswered-row { background: #f1f5f9; }' +
          '.q-num { width: 50px; font-weight: bold; }' +
          '.user-ans { flex: 1; }' +
          '.correct-ans { flex: 1; color: #065f46; }' +
          '.status { width: 40px; text-align: center; }' +
          '.collapsible-section { margin: 15px 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }' +
          '.collapsible-header { background: linear-gradient(135deg, #0d9488, #0f766e); color: white; padding: 15px 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 16px; }' +
          '.collapsible-header:hover { background: linear-gradient(135deg, #0f766e, #065f46); }' +
          '.collapsible-header .arrow { transition: transform 0.3s; font-size: 12px; }' +
          '.collapsible-header.active .arrow { transform: rotate(180deg); }' +
          '.collapsible-content { max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; background: #fafafa; }' +
          '.collapsible-content.show { max-height: 50000px; }' +
          '.collapsible-inner { padding: 20px; }' +
          '.part-block { margin-bottom: 25px; padding: 15px; background: white; border-radius: 10px; border-left: 4px solid #0d9488; }' +
          '.part-title { color: #0d9488; font-size: 18px; font-weight: 700; margin-bottom: 10px; }' +
          '.part-instruction { color: #64748b; font-size: 13px; font-style: italic; margin-bottom: 15px; padding: 10px; background: #f0fdfa; border-radius: 6px; }' +
          '.passage-box { margin: 15px 0; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }' +
          '.passage-title { font-weight: 700; color: #334155; margin-bottom: 10px; font-size: 16px; }' +
          '.passage-content { font-size: 14px; line-height: 1.8; color: #475569; }' +
          '.question-item { margin: 12px 0; padding: 12px; background: #f8fafc; border-radius: 8px; }' +
          '.question-text { font-weight: 600; color: #334155; margin-bottom: 8px; }' +
          '.option-row { padding: 6px 12px; margin: 4px 0; border-radius: 6px; font-size: 14px; display: flex; align-items: center; gap: 8px; }' +
          '.option-row.user-selected { background: #fee2e2; border: 2px solid #ef4444; }' +
          '.option-row.correct-answer { background: #d1fae5; border: 2px solid #10b981; }' +
          '.option-row.user-correct { background: #d1fae5; border: 2px solid #10b981; }' +
          '.option-letter { font-weight: 700; color: #64748b; min-width: 25px; }' +
          '.badge { font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 600; margin-left: auto; }' +
          '.badge.your-answer { background: #ef4444; color: white; }' +
          '.badge.correct { background: #10b981; color: white; }' +
          '.gap-answer { display: inline-block; padding: 4px 12px; border-radius: 6px; margin: 4px 0; }' +
          '.gap-answer.user-wrong { background: #fee2e2; color: #991b1b; text-decoration: line-through; }' +
          '.gap-answer.correct-ans { background: #d1fae5; color: #065f46; font-weight: 600; }' +
          '.text-item { margin: 10px 0; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0; }' +
          '.text-number { font-weight: 700; color: #0d9488; margin-bottom: 5px; }' +
          '.text-content { font-size: 14px; color: #475569; line-height: 1.6; }' +
          '.paragraph-box { margin: 10px 0; padding: 15px; background: white; border-radius: 8px; border-left: 3px solid #6366f1; }' +
          '.paragraph-number { font-weight: 700; color: #6366f1; margin-bottom: 8px; }' +
          '.pdf-btn { display: block; margin: 20px auto; padding: 15px 40px; background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(220,38,38,0.3); }' +
          '.pdf-btn:hover { background: linear-gradient(135deg, #b91c1c, #991b1b); transform: translateY(-2px); }' +
          '</style><script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><' + '/script></head><body><div class="container">' +
          '<h1>📖 ' + (window._practicePart ? 'CEFR Reading Practice — Part ' + window._practicePart + '<br><span style="font-size:18px;font-weight:500;">Mock ' + mockNum + '</span>' : 'CEFR Reading Mock ' + mockNum) + '</h1>' +
          '<div style="text-align:center;margin-bottom:20px;padding:15px;background:#f0fdfa;border-radius:12px;border:2px solid #0d9488">' +
          '<div style="font-size:14px;color:#64748b;margin-bottom:5px">👤 Candidate</div>' +
          '<div style="font-size:22px;font-weight:bold;color:#0d9488">' + candidateName + '</div></div>' +
          '<div style="text-align:center;margin-bottom:20px;padding:20px;background:' + cefrResult.bg + ';border-radius:12px;border:3px solid ' + cefrResult.color + '">' +
          '<div style="font-size:14px;color:#64748b;margin-bottom:5px">🎯 CEFR Level</div>' +
          '<div style="font-size:32px;font-weight:bold;color:' + cefrResult.color + '">' + cefrResult.level + '</div></div>' +
          '<div class="score-box"><div class="score">' + correct + '</div><div class="total">/ ' + total + '</div>' +
          '<div style="margin-top:10px;font-size:18px">' + percentage + '%</div></div>' +
          '<div class="details">' +
          '<div class="detail correct"><div class="value">' + correct + '</div><div class="label">Correct</div></div>' +
          '<div class="detail incorrect"><div class="value">' + incorrect + '</div><div class="label">Incorrect</div></div>' +
          '<div class="detail unanswered"><div class="value">' + unanswered + '</div><div class="label">Unanswered</div></div></div>' +
          '<div class="parts"><h3 style="color:#0d9488;margin-bottom:10px">Part Results</h3>' + generatePartResults() + '</div>' +
          '<div class="collapsible-section"><div class="collapsible-header" onclick="this.classList.toggle(\'active\');this.nextElementSibling.classList.toggle(\'show\')">' +
          '<span>📋 Answer Summary</span><span class="arrow">▼</span></div>' +
          '<div class="collapsible-content"><div class="collapsible-inner">' + generateAnswerRows() + '</div></div></div>' +
          '<div class="collapsible-section"><div class="collapsible-header" onclick="this.classList.toggle(\'active\');this.nextElementSibling.classList.toggle(\'show\')">' +
          '<span>📖 Passages & Questions Detail</span><span class="arrow">▼</span></div>' +
          '<div class="collapsible-content"><div class="collapsible-inner">' + generateDetailedParts() + '</div></div></div>' +
          '<div class="info"><strong>Test:</strong> ' + testIdentifier + '<br><strong>Date:</strong> ' + now.toLocaleDateString() + '<br><strong>Time:</strong> ' + now.toLocaleTimeString() + '</div>' +
          '<button class="pdf-btn" onclick="downloadPDF()">📄 Download PDF Certificate</button>' +
          '</div><script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><' + '/script>' +
          '<script>var pdfData=' + JSON.stringify({
            name: candidateName.replace(/"/g, ''),
            brandName: (window._siteLogoWording || (window.SITE_CONFIG && window.SITE_CONFIG.brandName) || 'Mock Stream').toUpperCase(),
            brandNameMixed: window._siteLogoWording || (window.SITE_CONFIG && window.SITE_CONFIG.brandName) || 'Mock Stream',
            testType: 'CEFR Reading',
            mockNum: mockNum,
            testId: testIdentifier.replace(/"/g, ''),
            score: correct,
            total: total,
            percentage: percentage,
            cefrLevel: cefrResult.level,
            correct: correct,
            incorrect: incorrect,
            unanswered: unanswered,
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString(),
            logoUrl: GLOBAL_LOGO_URL,
            partResults: _reportParts.map(function(part) {
              var pc = 0, pt = 0;
              if (part.answers) {
                for (var q in part.answers) {
                  pt++;
                  var ca = part.answers[q];
                  var ua = userAnswers[q];
                  if (ua && matchesAnswer(ua, ca)) pc++;
                }
              }
              return { title: part.title.replace(/"/g, ''), correct: pc, total: pt };
            })
          }) + ';function downloadPDF(){' +
          'var img=new Image();img.crossOrigin="anonymous";img.onload=function(){' +
          'var jsPDF=window.jspdf.jsPDF;var doc=new jsPDF();var w=210,h=297;' +
          'doc.setDrawColor(237,137,54);doc.setLineWidth(1.5);doc.rect(8,8,w-16,h-16);' +
          'doc.setFillColor(237,137,54);doc.rect(15,15,w-30,40,"F");' +
          'doc.setTextColor(255,255,255);doc.setFontSize(10);doc.setFont("helvetica","bold");' +
          'doc.text(pdfData.brandName,55,30,{align:"center"});' +
          'doc.text("CEFR PRACTICE ASSESSMENT",w-55,30,{align:"center"});' +
          'doc.setFontSize(7);doc.setFont("helvetica","normal");' +
          'doc.text("Language Proficiency",55,38,{align:"center"});' +
          'doc.text("Mock Examination",w-55,38,{align:"center"});' +
          'doc.setFillColor(255,255,255);doc.circle(w/2,35,14,"F");' +
          'try{var canvas=document.createElement("canvas");canvas.width=img.width;canvas.height=img.height;' +
          'var ctx=canvas.getContext("2d");ctx.drawImage(img,0,0);' +
          'var imgData=canvas.toDataURL("image/png");' +
          'doc.addImage(imgData,"PNG",w/2-12,23,24,24);}catch(e){' +
          'doc.setTextColor(237,137,54);doc.setFontSize(10);doc.setFont("helvetica","bold");' +
          'doc.text("CEFR",w/2,33,{align:"center"});doc.text("MOCK",w/2,39,{align:"center"});}' +
          'var y=65;' +
          'doc.setTextColor(120,120,120);doc.setFontSize(9);doc.setFont("helvetica","normal");' +
          'doc.text("CHET TILINI BILISH DARAJASI TO\'G\'RISIDA",w/2,y,{align:"center"});y+=9;' +
          'doc.setTextColor(237,137,54);doc.setFontSize(24);doc.setFont("helvetica","bold");' +
          'doc.text("SERTIFIKAT",w/2,y,{align:"center"});y+=9;' +
          'doc.setFontSize(20);doc.text("CERTIFICATE",w/2,y,{align:"center"});y+=7;' +
          'doc.setTextColor(120,120,120);doc.setFontSize(9);doc.setFont("helvetica","normal");' +
          'doc.text("OF FOREIGN LANGUAGE PROFICIENCY",w/2,y,{align:"center"});y+=7;' +
          'doc.setFillColor(13,148,136);doc.roundedRect(w/2-30,y-4,60,11,3,3,"F");' +
          'doc.setTextColor(255,255,255);doc.setFontSize(8);doc.setFont("helvetica","bold");' +
          'doc.text("READING MOCK TEST",w/2,y+3,{align:"center"});y+=10;' +
          'doc.setDrawColor(237,137,54);doc.setLineWidth(0.5);doc.line(40,y,w-40,y);y+=8;' +
          'doc.setFillColor(255,248,240);doc.roundedRect(125,y-5,65,12,2,2,"F");' +
          'doc.setDrawColor(237,137,54);doc.roundedRect(125,y-5,65,12,2,2,"S");' +
          'doc.setTextColor(100,100,100);doc.setFontSize(8);' +
          'doc.text("Sertifikat No | Reference Number",22,y+3);' +
          'doc.setTextColor(0,0,0);doc.setFont("helvetica","bold");doc.setFontSize(9);' +
          'var tid=pdfData.testId.length>18?pdfData.testId.substring(0,18)+"..":pdfData.testId;' +
          'doc.text(tid,157,y+3,{align:"center"});y+=15;' +
          'doc.setFillColor(255,248,240);doc.rect(20,y,w-40,38,"F");' +
          'doc.setDrawColor(237,137,54);doc.rect(20,y,w-40,38,"S");' +
          'doc.setTextColor(237,137,54);doc.setFontSize(9);doc.setFont("helvetica","bold");' +
          'doc.text("Talabgor to\'g\'risidagi ma\'lumot | Candidate Details",25,y+7);' +
          'doc.setTextColor(100,100,100);doc.setFontSize(8);doc.setFont("helvetica","normal");' +
          'doc.text("Ismi | Full Name:",25,y+16);' +
          'doc.setTextColor(0,0,0);doc.setFont("helvetica","bold");' +
          'var nm=pdfData.name.toUpperCase();nm=nm.length>35?nm.substring(0,35)+"..":nm;' +
          'doc.text(nm,70,y+16);' +
          'doc.setTextColor(100,100,100);doc.setFont("helvetica","normal");' +
          'doc.text("Test raqami | Mock No:",25,y+25);' +
          'doc.setTextColor(0,0,0);doc.setFont("helvetica","bold");doc.text("MOCK "+pdfData.mockNum,80,y+25);' +
          'doc.setTextColor(100,100,100);doc.setFont("helvetica","normal");' +
          'doc.text("Sana | Date:",120,y+25);' +
          'doc.setTextColor(0,0,0);doc.setFont("helvetica","bold");doc.text(pdfData.date,150,y+25);y+=45;' +
          'doc.setFillColor(255,248,240);doc.rect(20,y,80,20,"F");' +
          'doc.setDrawColor(237,137,54);doc.rect(20,y,80,20,"S");' +
          'doc.setTextColor(100,100,100);doc.setFontSize(7);doc.setFont("helvetica","normal");' +
          'doc.text("Chet tili | Foreign Language",25,y+7);' +
          'doc.setTextColor(0,0,0);doc.setFontSize(9);doc.setFont("helvetica","bold");' +
          'doc.text("INGLIZ TILI",25,y+15);' +
          'doc.setFillColor(237,137,54);doc.rect(105,y,40,20,"F");' +
          'doc.setTextColor(255,255,255);doc.setFontSize(7);doc.setFont("helvetica","normal");' +
          'doc.text("Daraja | Level",125,y+7,{align:"center"});' +
          'doc.setFontSize(12);doc.setFont("helvetica","bold");doc.text(pdfData.cefrLevel,125,y+16,{align:"center"});' +
          'doc.setFillColor(255,248,240);doc.rect(150,y,40,20,"F");' +
          'doc.setDrawColor(237,137,54);doc.rect(150,y,40,20,"S");' +
          'doc.setTextColor(100,100,100);doc.setFontSize(6);doc.setFont("helvetica","normal");' +
          'doc.text("Umumiy ball",170,y+6,{align:"center"});doc.text("Overall Score:",170,y+11,{align:"center"});' +
          'doc.setTextColor(237,137,54);doc.setFontSize(11);doc.setFont("helvetica","bold");' +
          'doc.text(pdfData.score+"/"+pdfData.total,170,y+17,{align:"center"});y+=28;' +
          'doc.setTextColor(237,137,54);doc.setFontSize(10);doc.setFont("helvetica","bold");' +
          'doc.text("Test natijalari | Test Results",22,y);y+=6;' +
          'doc.setFillColor(255,248,240);doc.rect(20,y,w-40,28,"F");' +
          'doc.setDrawColor(237,137,54);doc.rect(20,y,w-40,28,"S");' +
          'var bx=25,bw=50,bh=20,bg=5;' +
          'doc.setFillColor(255,255,255);doc.rect(bx,y+4,bw,bh,"F");doc.setDrawColor(200,200,200);doc.rect(bx,y+4,bw,bh,"S");' +
          'doc.setTextColor(100,100,100);doc.setFontSize(7);doc.setFont("helvetica","normal");' +
          'doc.text("O\'qish | Reading",bx+bw/2,y+10,{align:"center"});' +
          'doc.setTextColor(237,137,54);doc.setFontSize(12);doc.setFont("helvetica","bold");' +
          'doc.text(String(pdfData.score),bx+bw/2,y+19,{align:"center"});' +
          'doc.setFillColor(255,255,255);doc.rect(bx+bw+bg,y+4,bw,bh,"F");doc.setDrawColor(200,200,200);doc.rect(bx+bw+bg,y+4,bw,bh,"S");' +
          'doc.setTextColor(100,100,100);doc.setFontSize(7);doc.setFont("helvetica","normal");' +
          'doc.text("To\'g\'ri | Correct",bx+bw+bg+bw/2,y+10,{align:"center"});' +
          'doc.setTextColor(16,185,129);doc.setFontSize(12);doc.setFont("helvetica","bold");' +
          'doc.text(String(pdfData.correct),bx+bw+bg+bw/2,y+19,{align:"center"});' +
          'doc.setFillColor(255,255,255);doc.rect(bx+(bw+bg)*2,y+4,bw,bh,"F");doc.setDrawColor(200,200,200);doc.rect(bx+(bw+bg)*2,y+4,bw,bh,"S");' +
          'doc.setTextColor(100,100,100);doc.setFontSize(7);doc.setFont("helvetica","normal");' +
          'doc.text("Noto\'g\'ri | Wrong",bx+(bw+bg)*2+bw/2,y+10,{align:"center"});' +
          'doc.setTextColor(220,38,38);doc.setFontSize(12);doc.setFont("helvetica","bold");' +
          'doc.text(String(pdfData.incorrect),bx+(bw+bg)*2+bw/2,y+19,{align:"center"});y+=35;' +
          'doc.setTextColor(100,100,100);doc.setFontSize(8);doc.setFont("helvetica","normal");' +
          'doc.text("Berilgan sanasi | Date of Issue:",22,y);' +
          'doc.setTextColor(237,137,54);doc.setFont("helvetica","bold");doc.text(pdfData.date,70,y);' +
          'doc.setTextColor(100,100,100);doc.setFont("helvetica","normal");doc.text("Vaqti | Time:",120,y);' +
          'doc.setTextColor(237,137,54);doc.setFont("helvetica","bold");doc.text(pdfData.time,152,y);y+=12;' +
          'doc.setDrawColor(237,137,54);doc.line(22,y,75,y);doc.line(125,y,180,y);' +
          'doc.setTextColor(100,100,100);doc.setFontSize(7);doc.setFont("helvetica","normal");' +
          'doc.text(pdfData.brandNameMixed,48,y+5,{align:"center"});doc.text("Automated Result",152,y+5,{align:"center"});y+=15;' +
          'doc.setTextColor(237,137,54);doc.setFontSize(6);' +
          'doc.text("Bu sertifikat avtomatik tarzda yaratilgan | This is an auto-generated mock test certificate",w/2,y,{align:"center"});' +
          'doc.save(pdfData.name.replace(/[^a-zA-Z0-9]/g,"_")+"_Reading_Mock"+pdfData.mockNum+".pdf");};' +
          'img.onerror=function(){img.onload();};img.src=pdfData.logoUrl;}<' + '/script></body></html>';

        // Create HTML file blob
        const htmlBlob = new Blob([reportHtml], { type: 'text/html' });
        const safeName = candidateName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
        const filename = safeName + '_Reading_Mock' + mockNum + '_' + now.toISOString().slice(0,10) + '.html';

        // Build caption with hashtags
        const dateTag = String(now.getDate()).padStart(2,'0') + '_' + String(now.getMonth()+1).padStart(2,'0') + '_' + String(now.getFullYear()).slice(-2);
        const monthTag = String(now.getMonth()+1).padStart(2,'0') + '_' + String(now.getFullYear()).slice(-2);
        const yearTag = String(now.getFullYear());
        // Read SITE_CONFIG at submit time so the caption hashtag matches the
        // routingId that sendToRoutingBackend will send. The page-load const
        // can capture the default ('mock_stream') if site-config.js's async
        // Supabase fetch hasn't resolved yet — and that mismatch was sending
        // some students' results to the wrong centre's Telegram channel
        // (#mock_stream caption landing in another centre's reading channel).
        const _liveTestId = (window.SITE_CONFIG && window.SITE_CONFIG.testIdentifier) || GLOBAL_TEST_IDENTIFIER;
        const testIdTag = _liveTestId.replace(/-/g, '_');

        // Per-part scores for caption
        var partLines = '';
        _reportParts.forEach(function(part, idx) {
          var pc = 0, pt = 0;
          if (part.answers) {
            for (var qId in part.answers) {
              pt++;
              var ca = part.answers[qId];
              var ua = userAnswers[qId];
              if (matchesAnswer(ua, ca)) pc++;
            }
          }
          partLines += '\n📝 ' + part.title + ': ' + pc + '/' + pt;
        });

        // Timing
        var startT = mockStartTime || now;
        var finishT = now;
        var durSec = Math.round((finishT - startT) / 1000);
        var durMin = Math.floor(durSec / 60);
        var durS = durSec % 60;
        var startStr = startT.toLocaleTimeString('ru-RU');
        var finishStr = finishT.toLocaleTimeString('ru-RU');
        var dateStr = String(now.getDate()) + '/' + String(now.getMonth()+1) + '/' + now.getFullYear();

        const caption = '👤 #' + candidateName.replace(/ /g, '_') + '\n\n' +
          '🧠 AI Scoring:\n' +
          '📊 Raw score: ' + correct + '/' + total + '\n' +
          '📊 Certificate: ' + certificateScore + '/75\n' +
          '🏆 CEFR Level: ' + cefrResult.level + '\n' +
          partLines + '\n\n' +
          '📋 Mock Details:\n' +
          (window._practicePart ? '📖 Practice Mode: Part ' + window._practicePart + '\n' : '') +
          '🔢 Mock №: ' + (window._practicePart ? 'Part ' + window._practicePart + ' · Mock ' + mockNum : mockNum) + '\n' +
          '📅 Date: ' + dateStr + '\n' +
          '🕐 Start: ' + startStr + '\n' +
          '🕐 Finish: ' + finishStr + '\n' +
          '⏳ Duration: ' + durMin + 'm ' + (durS < 10 ? '0' : '') + durS + 's\n\n' +
          '🏛️ Center: #' + testIdTag + '\n' +
          '📊 #' + testIdTag + '_' + dateTag + '\n' +
          '📊 #' + testIdTag + '_' + monthTag + '\n' +
          '📊 #' + testIdTag + '_' + yearTag + '\n' +
          'Overall:\n' +
          '📊 #all_' + dateTag + '\n' +
          '📊 #all_' + monthTag + '\n' +
          '📊 #all_' + yearTag + '\n' +
          '#CEFR_Reading' + (window._practicePart ? '_Practice' : '') + ' #' + cefrResult.level.replace(/ /g, '_');

        // Send to Supabase first (get result link for caption)
        var finalCaption = caption;
        if (window.sendToSupabase) {
          try {
            var sbResult = await window.sendToSupabase({
              studentName: candidateName,
              examType: 'cefr',
              skill: 'reading',
              score: certificateScore + '/75',
              level: cefrResult.level,
              mockNumber: window._practicePart ? ('Practice Part ' + window._practicePart + ' - Mock ' + mockNum) : ('Mock ' + mockNum),
              file: htmlBlob,
              fileType: 'html',
              caption: caption,
              metadata: Object.assign(
                { raw: correct, total: total, percentage: percentage },
                window._practicePart ? { is_practice: true, part: 'p' + window._practicePart } : {}
              )
            });
            if (sbResult) finalCaption = window.appendResultLink(caption, sbResult.viewUrl);
          } catch (e) { console.warn('[Supabase] skipped:', e); }
        }

        // Send to backend
        const formData = new FormData();
        formData.append('file', new File([htmlBlob], filename, { type: 'text/html' }));
        formData.append('section', 'reading');
        formData.append('caption', finalCaption);

        // Send to routing backend (Supabase edge function — handles per-center +
        // general fanout). Legacy alwaysdata /send-result removed: it was
        // double-posting to the general channel.
        if (window.sendToRoutingBackend) {
          await window.sendToRoutingBackend({ skill: 'reading', caption: finalCaption, file: new File([htmlBlob], filename, { type: 'text/html' }) });
        }
        if (window.msProgress) window.msProgress.success('✅ Results saved successfully!');
      } catch (error) {
        console.warn('⚠️ Auto-submit error:', error);
        if (window.msProgress) window.msProgress.hide();
      }
    }

    function markAnswer(qId, isCorrect, correctAnswer, isUnanswered = false) {
      // Mark inputs
      const input = document.querySelector(`input[data-question="${qId}"]`);
      if (input && input.type === 'text') {
        if (isUnanswered) {
          // Fill in the correct answer for unanswered
          input.value = correctAnswer;
          input.classList.add('unanswered-filled');
          input.style.cssText = 'border-color: var(--primary); background: #e0f2f1; color: var(--primary); font-style: italic;';
        } else {
          input.classList.add(isCorrect ? 'correct' : 'incorrect');
          if (!isCorrect) {
            input.title = `Correct: ${correctAnswer}`;
            // Add visible correct answer badge
            const badge = document.createElement('span');
            badge.className = 'correct-answer-badge';
            badge.textContent = correctAnswer;
            input.parentNode.insertBefore(badge, input.nextSibling);
          }
        }
      }

      // Mark rich-select triggers (and the new .mh-slot pills, which
      // still carry .rich-select-trigger for backwards compat). Part 2
      // renders BOTH a legacy mobile dropdown AND a PC mh-slot pill for
      // the same question id, so we need to mark every matching element
      // (querySelectorAll, not querySelector) — CSS hides whichever
      // doesn't apply to the current viewport.
      const triggers = document.querySelectorAll(`.rich-select-trigger[data-question="${qId}"]`);
      triggers.forEach((trigger) => {
        trigger.classList.add('locked');
        const isMhSlot = trigger.classList.contains('mh-slot');
        if (isUnanswered) {
          if (isMhSlot) {
            // Pour the correct heading letter into the pill via the slot's
            // own DOM structure instead of nuking innerHTML — keeps the
            // letter chip + heading text visible after submit.
            var emptyEl = trigger.querySelector('.mh-slot-empty');
            var filledEl = trigger.querySelector('.mh-slot-filled');
            if (emptyEl) emptyEl.hidden = true;
            if (filledEl) {
              filledEl.hidden = false;
              var letEl = filledEl.querySelector('.mh-slot-letter');
              var txtEl = filledEl.querySelector('.mh-slot-text');
              if (letEl) letEl.textContent = correctAnswer;
              // Try to look up the heading text from the right-pane chip
              var chip = document.querySelector('.mh-heading-chip[data-letter="' + correctAnswer + '"]');
              if (txtEl) txtEl.textContent = chip
                ? (chip.querySelector('.mh-heading-text')?.textContent || '')
                : correctAnswer;
              var clr = filledEl.querySelector('.mh-slot-clear');
              if (clr) clr.style.display = 'none';
            }
            trigger.classList.add('unanswered-filled');
            trigger.setAttribute('data-value', correctAnswer);
          } else {
            trigger.textContent = correctAnswer;
            trigger.classList.add('unanswered-filled');
          }
        } else {
          trigger.classList.add(isCorrect ? 'correct' : 'incorrect');
          if (!isCorrect) {
            trigger.title = `Correct: ${correctAnswer}`;
            if (isMhSlot) {
              // Hang the correct-letter badge below the slot inline so it
              // doesn't overflow the right-edge of the paragraph card.
              var badgeMh = document.createElement('div');
              badgeMh.className = 'correct-answer-badge';
              badgeMh.style.cssText = 'margin-top:6px;font-size:11.5px;color:#065f46;';
              badgeMh.textContent = '✓ Correct: ' + correctAnswer;
              trigger.parentNode.insertBefore(badgeMh, trigger.nextSibling);
            } else {
              const badge = document.createElement('span');
              badge.className = 'correct-answer-badge';
              badge.textContent = correctAnswer;
              trigger.parentNode.insertBefore(badge, trigger.nextSibling);
            }
          }
        }
      });

      // Mark MCQ options
      const mcqOptions = document.querySelectorAll(`.mcq-option[data-question="${qId}"]`);
      mcqOptions.forEach(opt => {
        if (opt.dataset.value === correctAnswer) {
          opt.classList.add('correct');
          // Add checkmark to correct option
          if (!opt.querySelector('.correct-mark')) {
            const mark = document.createElement('span');
            mark.className = 'correct-mark';
            mark.innerHTML = ' ✓';
            mark.style.cssText = 'color: var(--success); font-weight: bold; margin-left: 8px;';
            opt.appendChild(mark);
          }
        } else if (opt.classList.contains('selected') && !isCorrect) {
          opt.classList.add('incorrect');
        }
      });

      // Mark TFNI options
      const tfniOptions = document.querySelectorAll(`.tfni-option[data-question="${qId}"]`);
      tfniOptions.forEach(opt => {
        if (opt.dataset.value === correctAnswer) {
          opt.classList.add('correct');
        } else if (opt.classList.contains('selected') && !isCorrect) {
          opt.classList.add('incorrect');
        }
      });
    }

    function reviewAnswers() {
      // Minimize results modal to pill instead of closing
      minimizeResultModal();
      document.body.classList.add('review-mode');

      // Inject inline explanation drop-downs + passage-side Q-pill highlights
      // for every part with explanations data. Idempotent — guarded by a class
      // on the body so re-clicking Review Answers doesn't double-inject.
      if (!document.body.classList.contains('review-injected')) {
        try { _crInjectInlineReview(); }
        catch (e) { console.warn('inline review injection failed:', e); }
        document.body.classList.add('review-injected');
      }

      // Navigate to first part
      showPart(0);
    }

    // ── Inline-review injection (drop-downs + passage marks) ──────────
    // Walks every part once after submission. For each question that has an
    // explanation, inserts a <details> drop-down right after its answer
    // input/control, and (for Parts 2-5) tags the relevant passage / text /
    // paragraph element with a Q-pill badge and a <mark> on the verbatim
    // quote. Part 1 (gap-fill-text) gets drop-downs only — no in-passage
    // highlights since the gap IS the question.
    function _crInjectInlineReview() {
      var parts = (TEST_DATA && TEST_DATA.parts) || [];
      var partContainers = document.querySelectorAll('.part-container');
      parts.forEach(function (part, partIdx) {
        var container = partContainers[partIdx];
        if (!container) return;
        var explanations = part.explanations || {};
        if (!explanations || Object.keys(explanations).length === 0) return;

        // Gather every question id from both top-level questions and
        // nested questionSections (reading-comprehension parts).
        var allQs = [];
        if (Array.isArray(part.questions)) allQs = allQs.concat(part.questions);
        if (Array.isArray(part.questionSections)) {
          part.questionSections.forEach(function (sec) {
            if (Array.isArray(sec.questions)) allQs = allQs.concat(sec.questions);
          });
        }

        // ── 1. Per-question drop-downs ────────────────────────────────
        allQs.forEach(function (q) {
          var qid = q.id;
          var expl = explanations['q' + qid] || explanations[String(qid)] || null;
          if (!expl || typeof expl !== 'object') return;
          var text  = String(expl.text  || '').trim();
          var quote = String(expl.quote || '').trim();
          if (!text && !quote) return;

          // Find any element rendered for this question. data-question is
          // already used by markAnswer for text inputs, MCQ options, TFNI
          // options and rich-select triggers, so it's a reliable hook.
          var anchor = container.querySelector('[data-question="' + qid + '"]');
          if (!anchor) return;

          // Walk up to a block-level container to inject below. Stop at the
          // first parent that contains the question's text/options, so the
          // drop-down doesn't end up inside an inline <span>.
          var host = anchor.closest('.mcq-question, .tfni-question, .gap-question, .question-row, .question, .question-card, .mh-para-card, li, .text-content, .para-content');
          if (!host) host = anchor.parentElement;
          if (!host) return;
          // Skip if already injected for this question
          if (host.parentNode && host.parentNode.querySelector('.cr-inline-expl[data-qid="' + qid + '"]')) return;

          var d = document.createElement('details');
          d.className = 'cr-inline-expl';
          d.setAttribute('data-qid', String(qid));
          var body = document.createElement('div');
          body.className = 'cr-inline-expl-body';
          var summary = document.createElement('summary');
          summary.textContent = '💡 Click for explanation — Q' + qid;
          d.appendChild(summary);
          if (text) {
            var pEl = document.createElement('p');
            pEl.className = 'cr-inline-expl-text';
            pEl.textContent = text;
            body.appendChild(pEl);
          }
          if (quote) {
            var bq = document.createElement('blockquote');
            bq.className = 'cr-inline-expl-quote';
            bq.textContent = '"' + quote + '"';
            body.appendChild(bq);
          }
          d.appendChild(body);
          host.parentNode.insertBefore(d, host.nextSibling);
        });

        // ── 2. Passage-side Q-pill highlights ─────────────────────────
        // Part 1 (gap-fill-text) deliberately skipped per spec — the gaps
        // ARE the questions and re-marking them would just visual noise.
        var pType = part.type || '';
        if (pType === 'matching') {
          _crAttachQPillsToMatchingTexts(container, part, explanations);
        } else if (pType === 'matching-headings') {
          _crAttachQPillsToHeadingsParas(container, part, explanations);
        } else if (pType === 'reading-comprehension') {
          _crHighlightQuotesInPassage(container, part, explanations);
        }
      });
    }

    // For matching (Part 2): each question's textNumber points at one of
    // the texts[]. Find the rendered text-block element by data-text-number
    // (or fall back to a numeric label) and append a Q-pill above it. We
    // do NOT modify the text body itself — picking the right phrase to
    // mark across 8 unrelated short blurbs is unreliable.
    function _crAttachQPillsToMatchingTexts(container, part, explanations) {
      if (!Array.isArray(part.questions)) return;
      part.questions.forEach(function (q) {
        if (q.textNumber == null) return;
        var expl = explanations['q' + q.id];
        if (!expl) return;
        var block = container.querySelector('[data-text-number="' + q.textNumber + '"]')
          || container.querySelector('[data-number="' + q.textNumber + '"]')
          || container.querySelector('.text-' + q.textNumber);
        if (!block) return;
        block.classList.add('cr-q-anchor');
        block.setAttribute('data-marked', '1');
        if (!block.querySelector('.cr-q-pill[data-qid="' + q.id + '"]')) {
          var pill = document.createElement('span');
          pill.className = 'cr-q-pill';
          pill.setAttribute('data-qid', String(q.id));
          pill.textContent = String(q.id);
          pill.title = 'Question ' + q.id + ' — matches this text';
          // Drop the pill at the very start so it doesn't disrupt the
          // ad / blurb's existing visual layout.
          block.insertBefore(pill, block.firstChild);
        }
      });
    }

    // For matching-headings (Part 3): each question's paragraphNumber
    // points at one of passage.paragraphs[]. Find the rendered paragraph
    // block and tag with a Q-pill (same approach as Part 2).
    function _crAttachQPillsToHeadingsParas(container, part, explanations) {
      if (!Array.isArray(part.questions)) return;
      part.questions.forEach(function (q) {
        if (q.paragraphNumber == null) return;
        var expl = explanations['q' + q.id];
        if (!expl) return;
        var pn = String(q.paragraphNumber);
        var block = container.querySelector('[data-paragraph-number="' + pn + '"]')
          || container.querySelector('[data-paragraph="' + pn + '"]')
          || container.querySelector('.para-' + pn);
        if (!block) return;
        block.classList.add('cr-q-anchor');
        block.setAttribute('data-marked', '1');
        if (!block.querySelector('.cr-q-pill[data-qid="' + q.id + '"]')) {
          var pill = document.createElement('span');
          pill.className = 'cr-q-pill';
          pill.setAttribute('data-qid', String(q.id));
          pill.textContent = String(q.id);
          pill.title = 'Question ' + q.id + ' — refers to this paragraph';
          block.insertBefore(pill, block.firstChild);
        }
      });
    }

    // For reading-comprehension (Parts 4-5): the passage is a single long
    // HTML block. Walk every paragraph and try to substring-match each
    // question's quote (after stripping smart quotes / collapsing whitespace).
    // First quote that matches a paragraph wins; we wrap the substring in
    // <mark class="cr-q-mark"> and append a Q-pill at the end of the mark.
    function _crHighlightQuotesInPassage(container, part, explanations) {
      var passageEl = container.querySelector('.passage-content, .text-content, .passage-card .para-content');
      if (!passageEl) {
        // Fallback — search the part-container for the longest text block
        var candidates = container.querySelectorAll('div, section');
        var best = null, bestLen = 0;
        candidates.forEach(function (el) {
          var t = (el.textContent || '').length;
          if (t > bestLen) { best = el; bestLen = t; }
        });
        passageEl = best;
      }
      if (!passageEl) return;
      var paras = passageEl.querySelectorAll('p');
      if (paras.length === 0) paras = [passageEl];

      // Gather questions from both top-level (unusual for RC) and sections.
      var allQs = [];
      if (Array.isArray(part.questions)) allQs = allQs.concat(part.questions);
      if (Array.isArray(part.questionSections)) {
        part.questionSections.forEach(function (sec) {
          if (Array.isArray(sec.questions)) allQs = allQs.concat(sec.questions);
        });
      }

      function norm(s) {
        return String(s || '')
          .replace(/[‘’]/g, "'")
          .replace(/[“”]/g, '"')
          .replace(/\s+/g, ' ')
          .toLowerCase()
          .trim();
      }

      allQs.forEach(function (q) {
        var expl = explanations['q' + q.id];
        if (!expl || !expl.quote) return;
        var quote = String(expl.quote).trim();
        if (quote.length < 12) return; // too short to safely substring-match
        var normQuote = norm(quote).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (!normQuote) return;

        // Find the first paragraph whose textContent (normalised) contains
        // the quote. Walk paragraphs in order so earlier questions get
        // matched first (and we keep the natural reading order).
        for (var i = 0; i < paras.length; i++) {
          var pEl = paras[i];
          var plain = (pEl.textContent || '');
          var normPlain = norm(plain);
          var m = normPlain.match(new RegExp(normQuote));
          if (!m) continue;
          // Found it. Now we need to find the matching substring in the
          // original (un-normalised) text so the highlight lines up with
          // the real characters. Walk the paragraph's children and replace
          // the matched range with <mark>...<Q-pill></mark>.
          _crWrapMatchInElement(pEl, quote, q.id);
          break;
        }
      });
    }

    // Wraps the first verbatim (smart-quote-tolerant, whitespace-collapsing)
    // occurrence of `quote` inside `root` with a <mark class="cr-q-mark">
    // and trailing Q-pill. Works on a flat textNode of root's first text-
    // bearing descendant for simplicity — most passage paragraphs are plain
    // text within <p>, so this is fine. If the paragraph contains rich
    // inline markup we just append the pill at the end without marking.
    function _crWrapMatchInElement(root, quote, qid) {
      // Bail if we've already marked this paragraph for this question
      if (root.querySelector('.cr-q-pill[data-qid="' + qid + '"]')) return;
      var fullText = root.textContent || '';
      var normFull = fullText.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').toLowerCase();
      var normQuote = quote.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').toLowerCase();
      var idx = normFull.indexOf(normQuote);
      // If the paragraph has nested inline markup, just stamp a pill at the
      // end. The drop-down's quote still points the user to the right spot.
      var hasNestedNontext = false;
      for (var i = 0; i < root.childNodes.length; i++) {
        if (root.childNodes[i].nodeType !== 3) { hasNestedNontext = true; break; }
      }
      if (idx < 0 || hasNestedNontext) {
        root.classList.add('cr-q-anchor');
        root.setAttribute('data-marked', '1');
        var pill = document.createElement('span');
        pill.className = 'cr-q-pill';
        pill.setAttribute('data-qid', String(qid));
        pill.textContent = String(qid);
        pill.title = 'Question ' + qid;
        root.appendChild(pill);
        return;
      }

      // Map normalised idx back to the original-text position. Walk the
      // original text and count "normalised" chars (skipping multi-spaces)
      // until we hit idx, then again for idx + normQuote.length.
      function mapOrigPos(targetNormIdx) {
        var ni = 0, oi = 0, lastWasSpace = false;
        while (oi < fullText.length && ni < targetNormIdx) {
          var c = fullText.charAt(oi);
          var nc = c;
          if (c === '‘' || c === '’') nc = "'";
          else if (c === '“' || c === '”') nc = '"';
          else nc = c.toLowerCase();
          if (/\s/.test(nc)) {
            if (!lastWasSpace) ni++;
            lastWasSpace = true;
          } else {
            ni++;
            lastWasSpace = false;
          }
          oi++;
        }
        return oi;
      }

      var startOrig = mapOrigPos(idx);
      var endOrig   = mapOrigPos(idx + normQuote.length);
      if (endOrig <= startOrig) {
        // Couldn't map cleanly — just add a pill, no <mark>
        var pillF = document.createElement('span');
        pillF.className = 'cr-q-pill';
        pillF.setAttribute('data-qid', String(qid));
        pillF.textContent = String(qid);
        pillF.title = 'Question ' + qid;
        root.appendChild(pillF);
        return;
      }

      var before = fullText.slice(0, startOrig);
      var mid    = fullText.slice(startOrig, endOrig);
      var after  = fullText.slice(endOrig);

      // Replace the paragraph's children with: textBefore + <mark>mid<Q-pill></mark> + textAfter
      root.textContent = ''; // clear
      if (before) root.appendChild(document.createTextNode(before));
      var markEl = document.createElement('mark');
      markEl.className = 'cr-q-mark';
      markEl.textContent = mid;
      var pillEl = document.createElement('span');
      pillEl.className = 'cr-q-pill';
      pillEl.setAttribute('data-qid', String(qid));
      pillEl.textContent = String(qid);
      pillEl.title = 'Question ' + qid;
      markEl.appendChild(pillEl);
      root.appendChild(markEl);
      if (after) root.appendChild(document.createTextNode(after));
    }

    function minimizeResultModal() {
      var modal = document.getElementById('resultsModal');
      if (modal) modal.classList.add('minimized');
    }

    function restoreResultModal() {
      var modal = document.getElementById('resultsModal');
      if (modal) modal.classList.remove('minimized');
    }

    function closeReviewModal() {
      document.getElementById('reviewModal').classList.remove('show');
    }

    // ===== EXPLANATIONS PANEL =====
    function _crEscHtml(s) {
      return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    window.showCrExplPanel = function() {
      var panel = document.getElementById('crExplPanel');
      var list  = document.getElementById('crExplList');
      if (!panel || !list || !TEST_DATA) return;

      var scoreParts = window._practicePart
        ? [TEST_DATA.parts[window._practicePart - 1]]
        : TEST_DATA.parts;

      var html = '';
      scoreParts.forEach(function(part, pIdx) {
        var pTitle = part.title || ('Part ' + part.partNumber);
        var pType = part.type || '';
        var qRange = part.questionRange || '';
        var isFirst = (pIdx === 0);
        // Real index in TEST_DATA.parts (not the filtered scoreParts index)
        var realPartIdx = TEST_DATA.parts.indexOf(part);

        var explanations = part.explanations || {};

        // Collect all question IDs from this part
        var allQs = [];
        if (part.questions) {
          part.questions.forEach(function(q) { allQs.push(q); });
        }
        if (part.questionSections) {
          part.questionSections.forEach(function(sec) {
            (sec.questions || []).forEach(function(q) { allQs.push(q); });
          });
        }

        // Count correct/wrong/unanswered for summary
        var cntCorrect = 0, cntWrong = 0, cntUn = 0;
        allQs.forEach(function(q) {
          var correctRaw = part.answers[q.id] || part.answers[String(q.id)] || [];
          var correctArr = Array.isArray(correctRaw) ? correctRaw : [correctRaw];
          var uAns = userAnswers[q.id] || userAnswers[String(q.id)] || '';
          if (!uAns) cntUn++;
          else if (matchesAnswer(uAns, correctArr)) cntCorrect++;
          else cntWrong++;
        });
        var summary = '✓ ' + cntCorrect + '  ✗ ' + cntWrong + '  — ' + cntUn;

        html += '<div class="cr-expl-phead' + (isFirst ? ' open' : '') + '" onclick="this.classList.toggle(\'open\');var b=this.nextElementSibling;b.classList.toggle(\'open\')">';
        html += '<span>' + _crEscHtml(pTitle) + ' — ' + _crEscHtml(qRange) + '&nbsp;&nbsp;<span style="font-size:11px;font-weight:600;color:#64748b;letter-spacing:0;text-transform:none">' + summary + '</span></span>';
        html += '<span class="cr-expl-phead-arrow">▼</span>';
        html += '</div>';
        html += '<div class="cr-expl-part-body' + (isFirst ? ' open' : '') + '">';

        allQs.forEach(function(q) {
          var qId = q.id;
          var key = 'q' + qId;
          var expl = explanations[key] || null;
          var explText  = expl ? (typeof expl === 'object' ? (expl.text  || '') : expl) : '';
          var explQuote = expl && typeof expl === 'object' ? (expl.quote || '') : '';

          var correctRaw = part.answers[qId] || part.answers[String(qId)] || [];
          var correctArr = Array.isArray(correctRaw) ? correctRaw : [correctRaw];
          var correctStr = correctArr.length > 1 ? correctArr.join(' / ') : (correctArr[0] || '');
          var userAns = userAnswers[qId] || userAnswers[String(qId)] || '';
          var isCorrect = userAns && matchesAnswer(userAns, correctArr);

          var cls, badge;
          if (!userAns)         { cls = 'un'; badge = '— Unanswered'; }
          else if (isCorrect)   { cls = 'ct'; badge = '✓ Correct'; }
          else                  { cls = 'in'; badge = '✗ Incorrect'; }

          // Get question display text
          var qDisplay = q.text || q.hint || '';
          var tmp = document.createElement('div');
          tmp.innerHTML = qDisplay;
          var qplain = (tmp.textContent || tmp.innerText || '').trim();

          html += '<div class="cr-expl-card ' + cls + '">';
          html += '<div class="cr-expl-card-head">';
          html +=   '<span class="cr-expl-qnum">Q' + qId + '</span>';
          html +=   '<span class="cr-expl-qtext">' + _crEscHtml(qplain) + '</span>';
          html +=   '<span class="cr-expl-badge">' + badge + '</span>';
          html += '</div>';
          html += '<div class="cr-expl-card-body">';
          html +=   '<div class="cr-expl-ans-row">';
          html +=     '<span class="yours">Your answer: <strong>' + _crEscHtml(userAns || '(blank)') + '</strong></span>';
          if (cls !== 'ct') {
            html += '<span class="arrow">→</span>';
            html += '<span class="correct-ans">Correct: ' + _crEscHtml(correctStr) + '</span>';
          }
          html +=   '</div>';
          if (explText)  html += '<p class="cr-expl-text">'  + _crEscHtml(explText)  + '</p>';
          if (explQuote) html += '<blockquote class="cr-expl-quote">' + _crEscHtml(explQuote) + '</blockquote>';
          html += '</div>';
          html += '<div class="cr-pv-toggle-row"><button class="cr-show-passage-btn" id="cr-pvbtn-' + qId + '" onclick="window._crTogglePassage(' + qId + ',' + realPartIdx + ')">📖 Show in passage ▼</button></div>';
          html += '<div class="cr-pv-wrap" id="cr-pv-' + qId + '"></div>';
          html += '</div>';
        });

        html += '</div>'; // close cr-expl-part-body
      });

      list.innerHTML = html;
      panel.style.display = 'block';
      panel.scrollTop = 0;
      var overlay = document.getElementById('resultsModal');
      if (overlay) overlay.classList.add('minimized');
      window._updateFabBack();
      if (typeof resetFabIdle === 'function') resetFabIdle();
    };

    window.closeCrExplPanel = function() {
      var panel = document.getElementById('crExplPanel');
      if (panel) panel.style.display = 'none';
      var overlay = document.getElementById('resultsModal');
      if (overlay) overlay.classList.remove('minimized');
      window._updateFabBack();
    };

    /* ---- FAB Back button helpers ---- */
    window._updateFabBack = function() {
      var btn = document.getElementById('fabBackBtn');
      if (!btn) return;
      var explPanel = document.getElementById('crExplPanel');
      var explOpen = explPanel && explPanel.style.display === 'block';
      var reviewOpen = document.getElementById('reviewModal') && document.getElementById('reviewModal').classList.contains('show');
      var resultsOpen = document.getElementById('resultsModal') && document.getElementById('resultsModal').classList.contains('show');
      var show = !!(explOpen || reviewOpen || resultsOpen);
      btn.classList.toggle('visible', show);
      // Keep FAB fully visible when an overlay is open
      if (show) {
        var fab = document.getElementById('mobileFab');
        if (fab) { fab.classList.remove('idle'); clearTimeout(fabIdleTimer); }
      }
    };

    window._fabBack = function() {
      var expl = document.getElementById('crExplPanel');
      var review = document.getElementById('reviewModal');
      var results = document.getElementById('resultsModal');

      // Close mobile menu first
      var menu = document.getElementById('mobileToolsMenu');
      if (menu && menu.classList.contains('active')) toggleMobileMenu();

      // If explanations panel is open → close it (returns to results overlay)
      if (expl && expl.style.display === 'block') {
        window.closeCrExplPanel();
        return;
      }
      // If review mode active → restore results modal
      if (document.body.classList.contains('review-mode')) {
        document.body.classList.remove('review-mode');
        restoreResultModal();
        window._updateFabBack();
        return;
      }
      // If results overlay is open → go back to landing
      if (results && results.classList.contains('show')) {
        sessionStorage.setItem('readingMockReturnCategory', 'cefr-reading');
        window.__okToLeave = true;
        _navToLanding();
        return;
      }
    };

    window._crTogglePassage = function(qid, partIdx) {
      var wrap = document.getElementById('cr-pv-' + qid);
      var btn  = document.getElementById('cr-pvbtn-' + qid);
      if (!wrap) return;

      // Toggle close
      if (wrap.classList.contains('open')) {
        wrap.classList.remove('open');
        if (btn) { btn.classList.remove('open'); btn.innerHTML = '\uD83D\uDCD6 Show in passage \u25BC'; }
        return;
      }

      // Render lazily on first open
      if (!wrap.dataset.rendered) {
        if (!TEST_DATA || !TEST_DATA.parts[partIdx]) return;
        var part = TEST_DATA.parts[partIdx];
        var pTitle = part.title || ('Part ' + part.partNumber);
        var pType = part.type || '';

        // Get the quote for this question
        var explanations = part.explanations || {};
        var quoteRaw = explanations['q' + qid] || '';
        var quoteText = quoteRaw ? (typeof quoteRaw === 'object' ? (quoteRaw.quote || '') : '') : '';
        quoteText = quoteText.replace(/^[\u201c\u201d\u2018\u2019"']+|[\u201c\u201d\u2018\u2019"']+$/g, '').trim();
        var normQ = quoteText.toLowerCase()
          .replace(/[\u201c\u201d]/g, '"').replace(/[\u2018\u2019]/g, "'");
        var safeQ = normQ ? normQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';

        var paras = [];

        if (pType === 'matching' && part.texts) {
          // Part 2: individual text snippets
          part.texts.forEach(function(t) {
            paras.push({ num: 'T' + t.number, text: t.content || '' });
          });
        } else if (pType === 'matching-headings' && part.passage && part.passage.paragraphs) {
          // Part 3: paragraphs array
          part.passage.paragraphs.forEach(function(p, i) {
            paras.push({ num: 'P' + (p.number || (i + 1)), text: p.content || '' });
          });
        } else if (part.passage && part.passage.content) {
          // Parts 1, 4, 5: HTML content with <p> tags
          var tmpDiv = document.createElement('div');
          tmpDiv.innerHTML = part.passage.content;
          var pEls = tmpDiv.querySelectorAll('p');
          var passageTitle = (part.passage.title || '').trim().toLowerCase();
          if (pEls.length === 0) {
            // Fallback: split by newlines
            var lines = (tmpDiv.textContent || '').split(/\n+/).filter(function(l) { return l.trim(); });
            var pNum = 1;
            lines.forEach(function(l) {
              var lt = l.trim();
              // Skip line that matches passage title (source attribution)
              if (passageTitle && lt.toLowerCase() === passageTitle) return;
              paras.push({ num: 'P' + pNum, text: lt });
              pNum++;
            });
          } else {
            var pNum = 1;
            Array.from(pEls).forEach(function(p) {
              var txt = (p.textContent || '').trim();
              // Skip <p> that matches passage title (source attribution)
              if (passageTitle && txt.toLowerCase() === passageTitle) return;
              paras.push({ num: 'P' + pNum, text: txt });
              pNum++;
            });
          }
        }

        if (paras.length === 0) {
          wrap.innerHTML = '<div class="cr-pv-header">\uD83D\uDCC4 No passage available</div>';
          wrap.dataset.rendered = '1';
        } else {
          var targetIdx = -1;
          var renderedParas = paras.map(function(p, i) {
            var plain = p.text;
            var normPlain = plain.toLowerCase()
              .replace(/[\u201c\u201d]/g, '"').replace(/[\u2018\u2019]/g, "'")
              .replace(/\s*_+\(\d+\)_+\s*/g, ' ');
            var matchObj = safeQ ? normPlain.match(new RegExp(safeQ)) : null;
            var isTarget = !!matchObj && targetIdx < 0;
            if (isTarget) targetIdx = i;

            var content;
            if (isTarget) {
              var idx = matchObj.index, len = matchObj[0].length;
              content = _crEscHtml(plain.substring(0, idx))
                + '<mark class="cr-hl" id="cr-hl-' + qid + '">'
                + _crEscHtml(plain.substring(idx, idx + len))
                + '</mark>'
                + _crEscHtml(plain.substring(idx + len));
            } else {
              content = _crEscHtml(plain);
            }
            return '<div class="cr-pv-para' + (isTarget ? ' cr-pv-para-hl' : '') + '">'
              + '<span class="cr-pv-pnum">' + p.num + '</span>'
              + '<span class="cr-pv-ptext">' + content + '</span>'
              + '</div>';
          });

          var paraInfo = targetIdx >= 0 ? ' \u00b7 ' + paras[targetIdx].num : '';
          wrap.innerHTML =
            '<div class="cr-pv-header">\uD83D\uDCC4 ' + _crEscHtml(pTitle) + paraInfo + '</div>'
            + '<div class="cr-pv-scroll" id="cr-pvscroll-' + qid + '">' + renderedParas.join('') + '</div>';
          wrap.dataset.rendered = '1';
        }
      }

      // Open
      wrap.classList.add('open');
      if (btn) { btn.classList.add('open'); btn.innerHTML = '\uD83D\uDCD6 Hide passage \u25B2'; }

      // Scroll to the highlighted sentence
      setTimeout(function() {
        var hl = document.getElementById('cr-hl-' + qid);
        var scrollBox = document.getElementById('cr-pvscroll-' + qid);
        if (hl && scrollBox) {
          var hlRect = hl.getBoundingClientRect();
          var sbRect = scrollBox.getBoundingClientRect();
          scrollBox.scrollTop += hlRect.top - sbRect.top - (scrollBox.clientHeight / 2) + (hl.offsetHeight / 2);
        }
      }, 80);
    };

    // ===== TEXT HIGHLIGHTING =====
    (function initHighlighting() {
      let longPressTimer = null;
      let isLongPress = false;

      // Determine highlight color based on element
      function getHighlightColor(element) {
        // Check if inside passage
        if (element.closest('.passage-card') || element.closest('.text-content') || element.closest('.para-content') || element.closest('.summary-text')) {
          return 'highlight-yellow';
        }
        // Check if inside questions area
        if (element.closest('.questions-card') || element.closest('.mcq-question') || element.closest('.tfni-question') || element.closest('.gap-question') || element.closest('.mcq-options') || element.closest('.tfni-options') || element.closest('.question-text')) {
          return 'highlight-green';
        }
        // Default to yellow for other readable content
        return 'highlight-yellow';
      }

      // Wrap selected text with highlight span
      function highlightSelection(highlightClass) {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !selection.toString().trim()) return;

        try {
          const range = selection.getRangeAt(0);
          const selectedText = selection.toString();
          
          // Don't highlight if inside input/select/button
          const container = range.commonAncestorContainer;
          const parentEl = container.nodeType === 3 ? container.parentElement : container;
          if (parentEl.closest('input, select, button, textarea')) return;
          
          // Check if already highlighted - toggle off
          if (parentEl.classList && (parentEl.classList.contains('highlight-yellow') || parentEl.classList.contains('highlight-green'))) {
            const text = parentEl.textContent;
            const textNode = document.createTextNode(text);
            parentEl.parentNode.replaceChild(textNode, parentEl);
            selection.removeAllRanges();
            return;
          }

          // Create highlight span
          const highlightSpan = document.createElement('span');
          highlightSpan.className = highlightClass;
          
          // Wrap the selection
          range.surroundContents(highlightSpan);
          selection.removeAllRanges();
        } catch (e) {
          // Selection spans multiple elements, highlight word by word not possible
          console.log('Cannot highlight across elements');
        }
      }

      // Double click handler for PC
      document.addEventListener('dblclick', function(e) {
        // Ignore if clicking on interactive elements
        if (e.target.closest('input, select, button, textarea, a')) return;
        
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
          const highlightClass = getHighlightColor(e.target);
          setTimeout(() => highlightSelection(highlightClass), 10);
        }
      });

      // Right-click context menu selection for PC
      document.addEventListener('contextmenu', function(e) {
        if (e.target.closest('input, select, button, textarea')) return;
        
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
          e.preventDefault(); // Prevent context menu from appearing
          const highlightClass = getHighlightColor(e.target);
          highlightSelection(highlightClass);
        }
      });

      // Left-click release after selection (select text then release)
      let mouseDownTarget = null;
      document.addEventListener('mousedown', function(e) {
        mouseDownTarget = e.target;
      });

      document.addEventListener('mouseup', function(e) {
        // Only left click
        if (e.button !== 0) return;
        if (e.target.closest('input, select, button, textarea, a')) return;
        
        // Small delay to let selection complete
        setTimeout(function() {
          const selection = window.getSelection();
          if (selection && selection.toString().trim().length > 1) {
            // Only highlight if it's a drag selection (not just a click)
            const selText = selection.toString().trim();
            if (selText.includes(' ') || selText.length > 3) {
              const highlightClass = getHighlightColor(mouseDownTarget || e.target);
              highlightSelection(highlightClass);
            }
          }
        }, 50);
      });

      // Long press for mobile
      document.addEventListener('touchstart', function(e) {
        if (e.target.closest('input, select, button, textarea, a')) return;
        
        isLongPress = false;
        longPressTimer = setTimeout(function() {
          isLongPress = true;
          // Let the native selection happen, then highlight
          setTimeout(function() {
            const selection = window.getSelection();
            if (selection && selection.toString().trim()) {
              const highlightClass = getHighlightColor(e.target);
              highlightSelection(highlightClass);
            }
          }, 100);
        }, 500); // 500ms for long press
      }, { passive: true });

      document.addEventListener('touchend', function(e) {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      }, { passive: true });

      document.addEventListener('touchmove', function(e) {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      }, { passive: true });
    })();

    // ===== START (with session recovery check) =====
    (async function() {
      if (window.SessionRecovery) {
        SessionRecovery.init({
          testType: 'cefr-reading',
          getUserId: function() { return sessionStorage.getItem('cefrReadingCandidateName') || sessionStorage.getItem('CANDIDATE_FULL_NAME') || ''; },
          getTestId: function() { return testFile; },
          getState: function() {
            if (!testInProgress || isReviewMode || hasSubmitted) return null;
            return { currentPart: currentPart, userAnswers: userAnswers, timeRemaining: timeRemaining, testFile: testFile };
          }
        });
        try {
          var session = await SessionRecovery.check();
          if (session && session.test_id === testFile) {
            var choice = await SessionRecovery.prompt(session);
            if (choice === 'resume') {
              window._srResumeData = session.session_data;
            } else {
              await SessionRecovery.clear();
            }
          } else if (session) {
            await SessionRecovery.clear();
          }
        } catch(e) { console.warn('Session recovery check failed:', e); }
      }
      loadTest();
    })();

    // ===== ANTI-CHEAT: Disable dev tools and context menu =====
    (function initAntiCheat() {
      // Block keyboard shortcuts for dev tools
      document.addEventListener('keydown', function(e) {
        // F12
        if (e.key === 'F12' || e.keyCode === 123) {
          e.preventDefault();
          return false;
        }
        // Ctrl+Shift+I (Inspect)
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
          e.preventDefault();
          return false;
        }
        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
          e.preventDefault();
          return false;
        }
        // Ctrl+Shift+C (Inspect element)
        if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
          e.preventDefault();
          return false;
        }
        // Ctrl+U (View source)
        if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
          e.preventDefault();
          return false;
        }
        // Ctrl+S (Save page)
        if (e.ctrlKey && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
          e.preventDefault();
          return false;
        }
      });

      // Block right-click ONLY when there's no text selection (preserve highlighting)
      document.addEventListener('contextmenu', function(e) {
        const selection = window.getSelection();
        // If there's a text selection, let the highlighting handler deal with it
        if (selection && selection.toString().trim()) {
          return; // Allow - highlighting will handle it
        }
        // No selection - block the context menu
        e.preventDefault();
        return false;
      }, true); // Use capture phase to run before other handlers

      // Detect if dev tools are open (basic detection)
      let devToolsOpen = false;
      const threshold = 160;
      
      const checkDevTools = function() {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
          if (!devToolsOpen) {
            devToolsOpen = true;
            // Optional: You can add a warning or action here
            // console.clear(); // Removed
            console.log('%c⚠️ Dev tools detected. Please close to continue the test.', 'font-size: 20px; color: red;');
          }
        } else {
          devToolsOpen = false;
        }
      };

      // Check periodically (every 1 second)
      setInterval(checkDevTools, 1000);

      // Disable text selection via keyboard (Ctrl+A)
      document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && (e.key === 'A' || e.key === 'a' || e.keyCode === 65)) {
          e.preventDefault();
          return false;
        }
      });

      // Disable drag to prevent text dragging outside
      document.addEventListener('dragstart', function(e) {
        if (!e.target.closest('input, textarea')) {
          e.preventDefault();
          return false;
        }
      });
    })();

    // ===== PDF DOWNLOAD FUNCTIONALITY =====
    document.getElementById('btnDownload').addEventListener('click', generatePDF);

    async function generatePDF() {
      var btn = document.getElementById('btnDownload');
      var originalText = btn.innerHTML;
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:16px;height:16px;animation:spin 1s linear infinite"><circle cx="12" cy="12" r="10" stroke-width="2" stroke-dasharray="30 30"></circle></svg> Generating...';
      btn.disabled = true;

      console.log('Starting PDF generation (block-by-block)...');

      // Check libraries
      if (typeof html2canvas === 'undefined') {
        console.error('html2canvas not loaded');
        alert('html2canvas library not loaded. Please refresh.');
        btn.innerHTML = originalText;
        btn.disabled = false;
        return;
      }
      
      if (!window.jspdf) {
        console.error('jspdf not loaded');
        alert('jsPDF library not loaded. Please refresh.');
        btn.innerHTML = originalText;
        btn.disabled = false;
        return;
      }

      console.log('Libraries loaded OK');
      var jsPDF = window.jspdf.jsPDF;

      // Get settings for header
      var logoUrl = (window.SITE_CONFIG && window.SITE_CONFIG.logoUrl) 
        ? window.SITE_CONFIG.logoUrl 
        : (window.SPEAKING_TEST_DATA && window.SPEAKING_TEST_DATA.settings && window.SPEAKING_TEST_DATA.settings.logoUrl) || 'https://i.ibb.co/WN0XY5Lv/logo.png';
      var line1 = (window.SITE_CONFIG && window.SITE_CONFIG.brandName) 
        ? window.SITE_CONFIG.brandName 
        : (window.SPEAKING_TEST_DATA && window.SPEAKING_TEST_DATA.settings && window.SPEAKING_TEST_DATA.settings.logoWording) || 'Mock Stream';
      var line2 = (window.SITE_CONFIG && window.SITE_CONFIG.heading2) 
        ? window.SITE_CONFIG.heading2 
        : (window.SPEAKING_TEST_DATA && window.SPEAKING_TEST_DATA.settings && window.SPEAKING_TEST_DATA.settings.heading2) || 'Reading Practice Test';

      if (!TEST_DATA || !TEST_DATA.testInfo) {
        alert('Test data not loaded yet. Please wait for the test to load.');
        btn.innerHTML = originalText;
        btn.disabled = false;
        return;
      }

      // Base styles for rendering blocks - UNIVERSAL 14px font size
      var baseStyles = `
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Georgia, "Times New Roman", serif; background: #fff; padding: 12px; color: #1e293b; line-height: 1.7; width: 794px; font-size: 14px; }
          p { margin-bottom: 12px; text-indent: 20px; }
          p:last-child { margin-bottom: 0; }
          .part-title { font-size: 17px; color: #0d9488; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; font-weight: bold; }
          .instruction { font-style: italic; color: #64748b; margin-bottom: 12px; font-size: 13px; }
          .text-box { margin-bottom: 15px; padding: 14px; background: #f8fafc; border-left: 4px solid #0d9488; }
          .passage-title { font-weight: bold; color: #1e293b; margin-bottom: 14px; font-size: 16px; text-align: center; text-transform: uppercase; letter-spacing: 1px; }
          .passage-content { line-height: 1.8; font-size: 14px; text-align: justify; }
          .passage-content p { margin-bottom: 12px; text-indent: 20px; }
          .passage-content p:first-child { text-indent: 20px; }
          .statement-box { padding: 14px; background: #f0fdfa; margin-bottom: 12px; font-size: 14px; }
          .text-item { margin-bottom: 12px; padding: 14px; border: 1px solid #e2e8f0; font-size: 14px; line-height: 1.7; }
          .heading-box { padding: 14px; background: #f0fdfa; margin-bottom: 12px; font-size: 14px; }
          .para-box { margin-bottom: 12px; padding: 14px; border: 1px solid #e2e8f0; font-size: 14px; line-height: 1.7; }
          .section-title { font-size: 15px; color: #0d9488; margin-bottom: 6px; font-weight: bold; }
          .section-instr { font-size: 13px; font-style: italic; color: #64748b; margin-bottom: 10px; }
          .mcq-item { margin-bottom: 12px; padding: 10px; background: #fafafa; font-size: 14px; line-height: 1.6; }
          .tfni-item { margin-bottom: 8px; padding: 8px; background: #fafafa; font-size: 14px; line-height: 1.6; }
          .gap-summary { padding: 14px; background: #fffef7; line-height: 1.8; font-size: 14px; }
        </style>
      `;

      // Helper function to render a single HTML block to canvas
      async function renderBlockToCanvas(html) {
        var iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;border:none;background:#fff;';
        document.body.appendChild(iframe);
        
        iframe.contentDocument.open();
        iframe.contentDocument.write('<!DOCTYPE html><html><head>' + baseStyles + '</head><body>' + html + '</body></html>');
        iframe.contentDocument.close();
        
        await new Promise(function(resolve) { setTimeout(resolve, 200); });
        
        var contentHeight = iframe.contentDocument.body.scrollHeight;
        iframe.style.height = contentHeight + 'px';
        
        await new Promise(function(resolve) { setTimeout(resolve, 150); });
        
        var canvas = await html2canvas(iframe.contentDocument.body, {
          scale: 2.5,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: 794,
          windowWidth: 794
        });
        
        iframe.remove();
        return canvas;
      }

      try {
        // Create PDF
        var pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        var pdfWidth = pdf.internal.pageSize.getWidth();
        var pdfHeight = pdf.internal.pageSize.getHeight();
        var margin = 8;
        var footerSpace = 25; // Space reserved for footer (generous)
        var usableHeight = pdfHeight - margin - footerSpace; // Content must stop before footer
        var currentY = margin;
        var pageNum = 1;
        var currentYear = new Date().getFullYear();
        
        // Load logo as base64 for footer
        var logoBase64 = null;
        try {
          var logoResponse = await fetch(logoUrl);
          var logoBlob = await logoResponse.blob();
          logoBase64 = await new Promise(function(resolve) {
            var reader = new FileReader();
            reader.onloadend = function() { resolve(reader.result); };
            reader.readAsDataURL(logoBlob);
          });
          console.log('Logo loaded for footer');
        } catch (e) {
          console.warn('Could not load logo for footer:', e);
        }

        // Helper to add canvas to PDF with smart page management and slicing for large blocks
        async function addCanvasToPDF(canvas, forceNewPage) {
          var imgWidth = pdfWidth - (margin * 2);
          var imgHeight = (canvas.height * imgWidth) / canvas.width;
          var maxContentHeight = usableHeight - margin; // Maximum content height per page
          
          if (forceNewPage && currentY > margin) {
            pdf.addPage();
            pageNum++;
            currentY = margin;
          }
          
          // If block is taller than max content height, slice it across multiple pages
          if (imgHeight > maxContentHeight) {
            if (currentY > margin) {
              pdf.addPage();
              pageNum++;
              currentY = margin;
            }
            
            // Slice the canvas into page-sized chunks
            var canvasY = 0;
            var canvasHeight = canvas.height;
            var scale = canvas.width / imgWidth;
            var sliceHeightPx = Math.floor(maxContentHeight * scale);
            
            while (canvasY < canvasHeight) {
              var remainingPx = canvasHeight - canvasY;
              var thisSlicePx = Math.min(sliceHeightPx, remainingPx);
              var thisSliceMm = thisSlicePx / scale;
              
              // Create a slice canvas
              var sliceCanvas = document.createElement('canvas');
              sliceCanvas.width = canvas.width;
              sliceCanvas.height = thisSlicePx;
              var sliceCtx = sliceCanvas.getContext('2d');
              sliceCtx.drawImage(canvas, 0, canvasY, canvas.width, thisSlicePx, 0, 0, canvas.width, thisSlicePx);
              
              pdf.addImage(sliceCanvas.toDataURL('image/png', 1.0), 'PNG', margin, currentY, imgWidth, thisSliceMm);
              
              canvasY += thisSlicePx;
              
              if (canvasY < canvasHeight) {
                pdf.addPage();
                pageNum++;
                currentY = margin;
              } else {
                currentY += thisSliceMm + 2;
              }
            }
          } else {
            // Normal block - check if fits on current page
            if (currentY + imgHeight > usableHeight) {
              pdf.addPage();
              pageNum++;
              currentY = margin;
            }
            pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', margin, currentY, imgWidth, imgHeight);
            currentY += imgHeight + 2;
          }
        }

        // ===== RENDER HEADER =====
        var headerHtml = `
          <div style="text-align:center;margin-bottom:15px;padding-bottom:15px;border-bottom:3px solid #0d9488;">
            <img src="${logoUrl}" style="width:60px;height:60px;border-radius:50%;margin-bottom:8px;" onerror="this.style.display='none'">
            <div style="font-size:16px;font-weight:bold;color:#0d9488;">${line1}</div>
            <div style="font-size:12px;color:#64748b;margin-bottom:6px;">${line2}</div>
            <h1 style="font-size:22px;margin:10px 0 6px;color:#1e293b;">${TEST_DATA.testInfo.title}</h1>
            <div style="font-size:12px;color:#64748b;">Level: <strong>${TEST_DATA.testInfo.level}</strong> | Time: <strong>${TEST_DATA.testInfo.totalTime} min</strong> | Questions: <strong>${TEST_DATA.testInfo.totalQuestions}</strong></div>
          </div>
        `;
        var headerCanvas = await renderBlockToCanvas(headerHtml);
        await addCanvasToPDF(headerCanvas, false);

        // ===== RENDER EACH PART =====
        var _dlParts = window._practicePart ? [{ part: TEST_DATA.parts[window._practicePart - 1], idx: window._practicePart - 1 }]
          : TEST_DATA.parts.map(function(p, i){ return { part: p, idx: i }; });
        for (var _di = 0; _di < _dlParts.length; _di++) {
          var part = _dlParts[_di].part;
          
          // Part header HTML (will be combined with first content)
          var partHeaderHtml = `
            <div class="part-title">${part.title} (Questions ${part.questionRange})</div>
            <p class="instruction">${part.instruction}</p>
          `;

          // Handle different part types - COMBINE header with first content block
          if (part.type === 'gap-fill-text' && part.passage) {
            var contentWithGaps = part.passage.content.replace(/<span class="gap"[^>]*>_+\(\d+\)_+<\/span>/g, '________');
            // Combine part header + passage together
            var gapFillHtml = partHeaderHtml + `
              <div class="text-box">
                <div class="passage-title">${part.passage.title}</div>
                <div class="passage-content">${contentWithGaps}</div>
              </div>
            `;
            var gapFillCanvas = await renderBlockToCanvas(gapFillHtml);
            await addCanvasToPDF(gapFillCanvas, false);
          } 
          else if (part.type === 'matching') {
            // Combine part header + statements box
            var stmtsHtml = partHeaderHtml + '<div class="statement-box"><strong style="color:#0d9488;">Statements:</strong><br>' + 
              part.statements.map(function(s) { return '<div style="margin:4px 0;"><strong>' + s.letter + ')</strong> ' + s.text + '</div>'; }).join('') + '</div>';
            var stmtsCanvas = await renderBlockToCanvas(stmtsHtml);
            await addCanvasToPDF(stmtsCanvas, false);
            
            // Each text as separate block
            for (var ti = 0; ti < part.texts.length; ti++) {
              var text = part.texts[ti];
              var textHtml = `
                <div class="text-item">
                  <div class="passage-title">Text ${text.number}</div>
                  <div style="margin:8px 0;line-height:1.7;font-size:13px;">${text.content}</div>
                  <div style="color:#64748b;font-size:12px;"><strong>Question ${text.number}:</strong> ____</div>
                </div>
              `;
              var textCanvas = await renderBlockToCanvas(textHtml);
              await addCanvasToPDF(textCanvas, false);
            }
          } 
          else if (part.type === 'matching-headings') {
            // Combine part header + headings box
            var hdHtml = partHeaderHtml + '<div class="heading-box"><strong style="color:#0d9488;">Headings:</strong><br>' + 
              part.headings.map(function(h) { return '<div style="margin:4px 0;"><strong>' + h.letter + ')</strong> ' + h.text + '</div>'; }).join('') + '</div>';
            var hdCanvas = await renderBlockToCanvas(hdHtml);
            await addCanvasToPDF(hdCanvas, false);
            
            // Each paragraph as separate block
            if (part.passage && part.passage.paragraphs) {
              for (var pi = 0; pi < part.passage.paragraphs.length; pi++) {
                var para = part.passage.paragraphs[pi];
                var paraHtml = `
                  <div class="para-box">
                    <div class="passage-title">Paragraph ${para.number} (Question ${para.questionId}): ____</div>
                    <div style="line-height:1.7;font-size:13px;">${para.content}</div>
                  </div>
                `;
                var paraCanvas = await renderBlockToCanvas(paraHtml);
                await addCanvasToPDF(paraCanvas, false);
              }
            }
          } 
          else if (part.type === 'reading-comprehension') {
            // Combine part header + passage together
            if (part.passage) {
              var passHtml = partHeaderHtml + `
                <div class="text-box">
                  <div class="passage-title">${part.passage.title}</div>
                  <div class="passage-content">${part.passage.content}</div>
                </div>
              `;
              var passCanvas = await renderBlockToCanvas(passHtml);
              await addCanvasToPDF(passCanvas, false);
            } else {
              // No passage, just render header
              var partHeaderCanvas = await renderBlockToCanvas(partHeaderHtml);
              await addCanvasToPDF(partHeaderCanvas, false);
            }
            
            // Question sections
            if (part.questionSections) {
              for (var si = 0; si < part.questionSections.length; si++) {
                var section = part.questionSections[si];
                
                // Section header HTML
                var secHeaderHtml = `
                  <div class="section-title">${section.title}</div>
                  <p class="section-instr">${section.instruction}</p>
                `;
                
                if (section.type === 'mcq') {
                  // Combine section header with first MCQ
                  for (var qi = 0; qi < section.questions.length; qi++) {
                    var q = section.questions[qi];
                    var mcqHtml = (qi === 0 ? secHeaderHtml : '') + `
                      <div class="mcq-item">
                        <div style="font-weight:600;margin-bottom:8px;"><strong>${q.id}.</strong> ${q.text}</div>
                        ${q.options.map(function(opt) { return '<div style="margin:4px 0 4px 15px;"><strong>' + opt.letter + ')</strong> ' + opt.text + '</div>'; }).join('')}
                      </div>
                    `;
                    var mcqCanvas = await renderBlockToCanvas(mcqHtml);
                    await addCanvasToPDF(mcqCanvas, false);
                  }
                } else if (section.type === 'tfni') {
                  // Combine section header + all TFNI questions together
                  var tfniHtml = secHeaderHtml + section.questions.map(function(q) {
                    return '<div class="tfni-item"><strong>' + q.id + '.</strong> ' + q.text + ' <span style="color:#64748b;">[T / F / NI]: ____</span></div>';
                  }).join('');
                  var tfniCanvas = await renderBlockToCanvas(tfniHtml);
                  await addCanvasToPDF(tfniCanvas, false);
                } else if (section.type === 'gap-fill') {
                  // Combine section header + gap fill summary
                  var summaryWithGaps = section.summaryText.replace(/<span class="gap-input"[^>]*>_+\(\d+\)_+<\/span>/g, '________');
                  var gapSumHtml = secHeaderHtml + '<div class="gap-summary">' + summaryWithGaps + '</div>';
                  var gapSumCanvas = await renderBlockToCanvas(gapSumHtml);
                  await addCanvasToPDF(gapSumCanvas, false);
                }
              }
            }
          }
        }

        // ===== ANSWER KEY ON NEW PAGE =====
        pdf.addPage();
        pageNum++;
        currentY = margin;

        // Answer key header
        var ansHeaderHtml = `
          <div style="text-align:center;margin-bottom:20px;">
            <img src="${logoUrl}" style="width:50px;height:50px;border-radius:50%;margin-bottom:8px;" onerror="this.style.display='none'">
            <div style="font-size:14px;font-weight:bold;color:#0d9488;margin-bottom:10px;">${line1}</div>
            <h2 style="font-size:20px;color:#0d9488;border-bottom:3px solid #0d9488;padding-bottom:10px;margin-bottom:15px;">📝 ANSWER KEY</h2>
            <div style="font-size:12px;color:#64748b;">${TEST_DATA.testInfo.title}</div>
          </div>
        `;
        var ansHeaderCanvas = await renderBlockToCanvas(ansHeaderHtml);
        await addCanvasToPDF(ansHeaderCanvas, false);

        // Collect all answers (practice mode: only practised part)
        var allAnswers = {};
        var _pdfParts = window._practicePart ? [TEST_DATA.parts[window._practicePart - 1]] : TEST_DATA.parts;
        _pdfParts.forEach(function(part) {
          if (part.answers) {
            Object.keys(part.answers).forEach(function(qId) {
              var ans = part.answers[qId];
              allAnswers[qId] = Array.isArray(ans) ? ans[0] : ans;
            });
          }
        });

        // Answer grid
        var _pdfTotalQ = Object.keys(allAnswers).length;
        var ansGridHtml = '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">';
        var ansKeys = Object.keys(allAnswers).sort(function(a,b){ return (parseInt(a)||0)-(parseInt(b)||0); });
        ansKeys.forEach(function(i) {
          var answer = allAnswers[i] || '-';
          ansGridHtml += '<div style="display:inline-block;width:18%;padding:10px 6px;border:1px solid #e2e8f0;border-radius:4px;text-align:center;font-size:13px;background:#f8fafc;"><strong style="color:#0d9488;">' + i + '.</strong> <span style="color:#1e293b;font-weight:600;">' + answer + '</span></div>';
        });
        ansGridHtml += '</div>';
        var ansGridCanvas = await renderBlockToCanvas(ansGridHtml);
        await addCanvasToPDF(ansGridCanvas, false);

        // Copyright notice
        var copyrightHtml = `
          <div style="margin-top:30px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#64748b;">
            <div style="margin-bottom:8px;">(c) ${currentYear} <strong style="color:#0d9488;">${line1}</strong>. All Rights Reserved.</div>
            <div style="margin-bottom:8px;">This material is protected by copyright law. Unauthorized reproduction, distribution, or transmission of this content is strictly prohibited.</div>
            <div style="font-style:italic;">For educational purposes only. Not for commercial use or resale.</div>
          </div>
        `;
        var copyrightCanvas = await renderBlockToCanvas(copyrightHtml);
        await addCanvasToPDF(copyrightCanvas, false);

        // ===== ADD FOOTER WITH LOGO TO ALL PAGES =====
        var totalPages = pdf.internal.getNumberOfPages();
        
        for (var p = 1; p <= totalPages; p++) {
          pdf.setPage(p);
          
          var footerY = pdfHeight - 10;
          
          // Draw footer background line
          pdf.setDrawColor(13, 148, 136);
          pdf.setLineWidth(0.5);
          pdf.line(margin, footerY - 2, pdfWidth - margin, footerY - 2);
          
          // Add logo if available (left side)
          if (logoBase64) {
            try {
              pdf.addImage(logoBase64, 'PNG', margin, footerY, 7, 7);
            } catch (e) {
              console.warn('Could not add logo to footer:', e);
            }
          }
          
          // Add copyright text (center)
          pdf.setFontSize(7);
          pdf.setTextColor(100, 116, 139);
          var copyrightText = '(c) ' + currentYear + ' ' + line1 + '. All rights reserved. Unauthorized reproduction prohibited.';
          pdf.text(copyrightText, pdfWidth / 2, footerY + 3, { align: 'center' });
          
          // Add page number (right side)
          pdf.setFontSize(8);
          pdf.setTextColor(13, 148, 136);
          var pageText = 'Page ' + p + ' of ' + totalPages;
          pdf.text(pageText, pdfWidth - margin, footerY + 3, { align: 'right' });
        }

        // Save PDF
        var fileName = TEST_DATA.testInfo.title.replace(/\s+/g, '_') + '.pdf';
        console.log('Saving PDF:', fileName, 'Pages:', totalPages);
        pdf.save(fileName);
        
        btn.innerHTML = originalText;
        btn.disabled = false;
        
        // Show success notification
        showPDFSuccessToast(fileName, totalPages);
        
      } catch (err) {
        console.error('PDF generation error:', err);
        btn.innerHTML = originalText;
        btn.disabled = false;
        alert('Failed to generate PDF: ' + err.message);
      }
    }
    
    // Success toast notification
    function showPDFSuccessToast(fileName, pageCount) {
      var toast = document.createElement('div');
      toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.8);background:linear-gradient(135deg,#0d9488,#0f766e);color:white;padding:30px 40px;border-radius:20px;box-shadow:0 10px 40px rgba(13,148,136,0.4);z-index:100002;text-align:center;opacity:0;transition:all 0.3s ease;';
      toast.innerHTML = `
        <div style="width:70px;height:70px;margin:0 auto 16px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div style="font-size:20px;font-weight:700;margin-bottom:8px;">PDF Downloaded!</div>
        <div style="font-size:14px;opacity:0.9;margin-bottom:4px;">${fileName}</div>
        <div style="font-size:12px;opacity:0.7;">${pageCount} pages</div>
      `;
      document.body.appendChild(toast);
      
      // Animate in
      setTimeout(function() {
        toast.style.opacity = '1';
        toast.style.transform = 'translate(-50%,-50%) scale(1)';
      }, 10);
      
      // Auto remove after 2.5 seconds
      setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%,-50%) scale(0.8)';
        setTimeout(function() { toast.remove(); }, 300);
      }, 2500);
    }

    // Add spin animation
    var spinStyle = document.createElement('style');
    spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(spinStyle);

    // ===== LEAVE WARNING PROTECTION =====
    let testInProgress = false;
    window.__okToLeave = false;

    // Mark test as in progress when timer starts
    const originalStartTimer = startTimer;
    startTimer = function() {
      testInProgress = true;
      return originalStartTimer.apply(this, arguments);
    };

    // Create leave warning modal
    function createLeaveWarningModal() {
      if (document.getElementById('leaveWarningModal')) return;
      
      const modalHTML = `
        <div id="leaveWarningModal" style="
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          z-index: 999999;
          justify-content: center;
          align-items: center;
          backdrop-filter: blur(5px);
        ">
          <div style="
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border-radius: 20px;
            padding: 40px;
            max-width: 420px;
            width: 90%;
            text-align: center;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
            animation: modalPop 0.3s ease-out;
          ">
            <div style="
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #ef4444, #dc2626);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 25px;
              box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
            ">
              <span style="font-size: 40px;">⚠️</span>
            </div>
            <h2 style="
              color: #f8fafc;
              font-size: 24px;
              margin-bottom: 15px;
              font-weight: 700;
            ">Wait! Test in Progress</h2>
            <p style="
              color: #94a3b8;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 30px;
            ">
              Are you sure you want to leave?<br>
              <strong style="color: #f87171;">Your progress will be lost!</strong>
            </p>
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
              <button id="leaveStayBtn" style="
                padding: 14px 35px;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                background: linear-gradient(135deg, #0d9488, #0f766e);
                color: white;
                box-shadow: 0 4px 15px rgba(13, 148, 136, 0.3);
              ">✓ Continue Test</button>
              <button id="leaveConfirmBtn" style="
                padding: 14px 35px;
                border: 2px solid #475569;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                background: transparent;
                color: #94a3b8;
              ">Leave Anyway</button>
            </div>
          </div>
        </div>
        <style>
          @keyframes modalPop {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          #leaveStayBtn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(13, 148, 136, 0.4);
          }
          #leaveConfirmBtn:hover {
            background: #334155;
            border-color: #64748b;
            color: #e2e8f0;
          }
        </style>
      `;
      
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      
      document.getElementById('leaveStayBtn').addEventListener('click', function() {
        hideLeaveWarningModal();
      });
      
      document.getElementById('leaveConfirmBtn').addEventListener('click', function() {
        window.__okToLeave = true;
        var pendingAction = window.__pendingLeaveAction;
        hideLeaveWarningModal();
        if (typeof pendingAction === 'function') {
          pendingAction();
          return;
        }
        sessionStorage.setItem('readingMockReturnCategory', 'cefr-reading');
        _navToLanding();
      });
    }

    function showLeaveWarningModal() {
      createLeaveWarningModal();
      const modal = document.getElementById('leaveWarningModal');
      modal.style.display = 'flex';
    }

    function hideLeaveWarningModal() {
      const modal = document.getElementById('leaveWarningModal');
      if (modal) modal.style.display = 'none';
      window.__pendingLeaveAction = null;
    }

    function promptFriendlyLeave(leaveAction) {
      window.__pendingLeaveAction = (typeof leaveAction === 'function') ? leaveAction : null;
      showLeaveWarningModal();
    }

    // Back button trap using History API
    function setupBackButtonTrap() {
      history.pushState(null, '', location.href);
      history.pushState(null, '', location.href);
      
      window.addEventListener('popstate', function(e) {
        if (testInProgress && !isReviewMode && !window.__okToLeave) {
          history.pushState(null, '', location.href);
          showLeaveWarningModal();
        }
      });
    }

    // Keyboard shortcuts blocking (F5, Ctrl+R, Ctrl+W)
    window.addEventListener('keydown', function(e) {
      if (!testInProgress || isReviewMode || window.__okToLeave) return;
      
      const isF5 = e.key === 'F5';
      const isCtrlR = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r';
      const isCtrlW = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w';
      
      if (isF5 || isCtrlR || isCtrlW) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        showLeaveWarningModal();
        return false;
      }
    }, true);

    // Fallback beforeunload for browser button clicks
    window.addEventListener('beforeunload', function(e) {
      if (testInProgress && !isReviewMode && !window.__okToLeave) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    });

    // Initialize back button trap on load
    setupBackButtonTrap();
  