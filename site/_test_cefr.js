
    // ===== BACK BUTTON (iframe support) =====
    // Parent-aware navigation: tell parent landing page to return, not navigate iframe
    function _navToLanding() {
      // Try window.top first (most reliable for nested iframes)
      try {
        if (window.top && window.top !== window && typeof window.top.returnToLanding === 'function') {
          window.top.returnToLanding(); return;
        }
      } catch (e1) { }
      // Fallback: try window.parent
      try {
        if (window.parent && window.parent !== window && typeof window.parent.returnToLanding === 'function') {
          window.parent.returnToLanding(); return;
        }
      } catch (e2) { }
      // Fallback: postMessage to top/parent
      try {
        if (window.top && window.top !== window) { window.top.postMessage('returnToLanding', '*'); return; }
        if (window.parent && window.parent !== window) { window.parent.postMessage('returnToLanding', '*'); return; }
      } catch (e3) { }
      // Last resort: navigate the TOP window (not the iframe)
      try { window.top.location.href = 'landing.html'; } catch (e4) { window.location.href = 'landing.html'; }
    }

    function goBack() {
      // Check if test is in progress - show warning modal
      if (typeof testInProgress !== 'undefined' && testInProgress && !isReviewMode) {
        showLeaveWarningModal();
        return;
      }
      // Otherwise navigate directly
      window.__okToLeave = true;
      _navToLanding();
    }

    // ===== PLACEHOLDER - SCRIPT WILL BE ADDED IN NEXT BATCH =====
    const urlParams = new URLSearchParams(window.location.search);
    const testFile = urlParams.get('test') || 'cefr-listening-test-01';

    let TEST_DATA = null;
    let currentPart = 0;
    let userAnswers = {};
    let timerInterval = null;
    let timeRemaining = 40 * 60;
    let isReviewMode = false;

    // British в†” American spelling variant pairs
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

    const GLOBAL_LOGO_URL = (window.SITE_CONFIG && window.SITE_CONFIG.logoUrl) || (window.SPEAKING_TEST_DATA && window.SPEAKING_TEST_DATA.settings && window.SPEAKING_TEST_DATA.settings.logoUrl) || 'https://i.ibb.co/WN0XY5Lv/logo.png';
    const GLOBAL_LOGO_WORDING = (window.SITE_CONFIG && window.SITE_CONFIG.brandName) || (window.SPEAKING_TEST_DATA && window.SPEAKING_TEST_DATA.settings && window.SPEAKING_TEST_DATA.settings.logoWording) || 'Mock Stream';
    const GLOBAL_TEST_IDENTIFIER = (window.SITE_CONFIG && window.SITE_CONFIG.testIdentifier) || (window.SPEAKING_TEST_DATA && window.SPEAKING_TEST_DATA.settings && window.SPEAKING_TEST_DATA.settings.testIdentifier) || 'mock_stream';

    // document.getElementById('logoImg').src = GLOBAL_LOGO_URL; (Logo removed from header)
    const mockNum = testFile.match(/(\d+)/) ? testFile.match(/(\d+)/)[1] : '1';
    document.getElementById('mockNumber').textContent = 'в„–' + mockNum;

    // Load test
    function loadTest() {
      const script = document.createElement('script');
      script.src = 'questions CEFR L/' + testFile + '.js';
      script.onload = () => {
        if (window.CEFR_LISTENING_TEST) {
          TEST_DATA = window.CEFR_LISTENING_TEST;
          window.TEST_DATA = TEST_DATA; // Make globally accessible for audio player

          // Skip audio preloading when only downloading PDF
          const isPdfDownload = urlParams.get('download') === 'pdf';
          const hasPerPartAudio = TEST_DATA.parts.some(p => p.audioFile && p.audioFile.trim() !== '');
          if (hasPerPartAudio && !isPdfDownload) {
            preloadAllAudio();
          } else {
            initTest();
          }
        } else {
          showError('Test data not found');
        }
      };
      script.onerror = () => showError('Failed to load test file');
      document.head.appendChild(script);
    }

    // Preload all audio files before starting the test
    window.preloadedAudios = {};
    window.audioPreloadComplete = false;
    function preloadAllAudio() {
      const audioPreloadStatus = document.getElementById('audioPreloadStatus');
      const audioPreloadText = document.getElementById('audioPreloadText');
      const audioPreloadProgress = document.getElementById('audioPreloadProgress');
      const audioPreloadDetail = document.getElementById('audioPreloadDetail');
      const loadingMainText = document.getElementById('loadingMainText');

      audioPreloadStatus.style.display = 'block';
      loadingMainText.textContent = 'Preparing your test...';

      const partsWithAudio = TEST_DATA.parts.filter(p => p.audioFile && p.audioFile.trim() !== '');
      const totalParts = partsWithAudio.length;
      let loadedCount = 0;

      if (totalParts === 0) {
        window.audioPreloadComplete = true;
        initTest();
        return;
      }

      audioPreloadDetail.textContent = '0 / ' + totalParts + ' parts loaded';

      const preloadPromises = partsWithAudio.map((part, index) => {
        return new Promise((resolve) => {
          const audio = new Audio();
          audio.preload = 'auto';
          audio.muted = true; // Mute during preload to prevent any sound

          audio.addEventListener('canplaythrough', function onCanPlay() {
            audio.removeEventListener('canplaythrough', onCanPlay);
            audio.pause(); // Ensure it's paused
            audio.currentTime = 0; // Reset to start
            audio.muted = false; // Unmute for later use

            loadedCount++;
            const progress = (loadedCount / totalParts) * 100;
            audioPreloadProgress.style.width = progress + '%';
            audioPreloadDetail.textContent = loadedCount + ' / ' + totalParts + ' parts loaded';
            audioPreloadText.textContent = 'Loading Part ' + (index + 1) + ' audio... вњ“';

            // Store preloaded audio URL (not the audio element to avoid auto-play issues)
            window.preloadedAudios[part.partNumber || (index + 1)] = part.audioFile;
            resolve();
          });

          audio.addEventListener('error', function () {
            loadedCount++;
            const progress = (loadedCount / totalParts) * 100;
            audioPreloadProgress.style.width = progress + '%';
            audioPreloadDetail.textContent = loadedCount + ' / ' + totalParts + ' parts loaded';
            console.log('Failed to preload Part ' + (index + 1) + ' audio');
            resolve(); // Continue even if one fails
          });

          audio.src = part.audioFile;
          audio.load();
        });
      });

      Promise.all(preloadPromises).then(() => {
        audioPreloadText.textContent = 'All audio files ready! вњ“';
        audioPreloadDetail.textContent = 'Loading map images...';

        preloadMapImages().then(() => {
          audioPreloadDetail.textContent = 'Starting test...';
          window.audioPreloadComplete = true;
          setTimeout(() => {
            initTest();
          }, 500);
        });
      });
    }

    // Preload map images as base64 for PDF export
    window.preloadedMapImages = {};
    async function preloadMapImages() {
      if (!TEST_DATA || !TEST_DATA.parts) return;

      for (var i = 0; i < TEST_DATA.parts.length; i++) {
        var part = TEST_DATA.parts[i];
        if (part.type === 'map-labeling' && part.mapImage) {
          try {
            console.log('Preloading map image for Part ' + (i + 1));
            // Use fetch with no-cors mode to get the image
            var response = await fetch(part.mapImage, { mode: 'cors' });
            if (response.ok) {
              var blob = await response.blob();
              var dataUrl = await new Promise(function (resolve) {
                var reader = new FileReader();
                reader.onloadend = function () { resolve(reader.result); };
                reader.readAsDataURL(blob);
              });
              window.preloadedMapImages[i] = dataUrl;
              console.log('Map image preloaded for Part ' + (i + 1));
            }
          } catch (e) {
            console.warn('Could not preload map image for Part ' + (i + 1) + ':', e.message);
          }
        }
      }
    }

    function showError(msg) {
      document.getElementById('loadingScreen').innerHTML = '<div style="text-align:center;color:#ef4444;"><h2>вќЊ Error</h2><p>' + msg + '</p></div>';
    }

    function initTest() {
      timeRemaining = TEST_DATA.testInfo.totalTime * 60;
      generatePartNav();
      generateParts();
      showPart(0);
      startTimer();
      document.getElementById('loadingScreen').style.display = 'none';
      // Show FAB now that test is ready
      var fabContainer = document.getElementById('mobileFabContainer');
      if (fabContainer) fabContainer.style.removeProperty('display');

      // Auto-download PDF if triggered from mock selector page
      if (urlParams.get('download') === 'pdf') {
        setTimeout(function () {
          if (typeof generatePDF === 'function') {
            generatePDF();
          }
        }, 1500);
      }
    }

    // Generate part navigation (Both PC and Mobile)
    function generatePartNav() {
      const pcNav = document.getElementById('partNav');
      const mobileNav = document.getElementById('partNavMobile');

      if (pcNav) pcNav.innerHTML = '';
      if (mobileNav) mobileNav.innerHTML = '';

      TEST_DATA.parts.forEach((part, index) => {
        const btn = document.createElement('button');
        btn.className = 'part-btn' + (index === 0 ? ' active' : '');
        btn.innerHTML = 'Part ' + (index + 1) + ' <span class="status" id="status-p' + index + '"></span>';
        btn.addEventListener('click', () => showPart(index));

        // Clone for mobile
        const btnMobile = btn.cloneNode(true);
        btnMobile.addEventListener('click', () => showPart(index));

        if (pcNav) pcNav.appendChild(btn);
        if (mobileNav) mobileNav.appendChild(btnMobile);
      });

      updateMobilePartDots(); // If needed for the special mobile indicator
    }

    // This function updates the circular numbered dots for mobile navigation.
    // It's called by generatePartNav and showPart.
    function updateMobilePartDots() {
      const mobileNavDotsContainer = document.getElementById('mobilePartNav');
      if (!mobileNavDotsContainer) return;

      // Clear existing dots if any (in case generatePartNav was called multiple times)
      mobileNavDotsContainer.innerHTML = '';

      const totalParts = TEST_DATA.parts.length;
      let html = '';
      for (let i = 0; i < totalParts; i++) {
        html += '<div class="mobile-part-dot" data-part="' + i + '">' + (i + 1) + '</div>';
      }
      mobileNavDotsContainer.innerHTML = html;

      mobileNavDotsContainer.querySelectorAll('.mobile-part-dot').forEach(dot => {
        dot.addEventListener('click', () => showPart(parseInt(dot.dataset.part)));
      });

      // Apply active/adjacent classes based on currentPart
      mobileNavDotsContainer.querySelectorAll('.mobile-part-dot').forEach((dot, i) => {
        dot.classList.remove('active', 'adjacent');
        if (i === currentPart) {
          dot.classList.add('active');
        } else if (i === currentPart - 1 || i === currentPart + 1) {
          dot.classList.add('adjacent');
        }
      });
    }

    function generateParts() {
      const main = document.getElementById('mainContent');
      main.innerHTML = TEST_DATA.parts.map((part, i) => '<div class="part-section" id="part' + i + '">' + renderPart(part, i) + '</div>').join('');
    }

    function renderPart(part, partIndex) {
      let isLastPart = (partIndex === TEST_DATA.parts.length - 1);
      let headerStyle = isLastPart ? 'style="display:flex; justify-content:space-between; align-items:flex-start; gap:20px;"' : '';
      let submitBtnHtml = '';

      let html = '<div class="part-header" ' + headerStyle + '>';
      html += '<div>';
      html += '<h2 class="part-title">рџЋ§ ' + part.title + ' <span style="font-size:13px;color:#64748b;">(Questions ' + part.questionRange + ')</span></h2>';
      html += '<p class="part-instruction">' + part.instruction + '</p>';
      html += '</div>';
      html += submitBtnHtml;
      html += '</div>';

      if (part.type === 'mcq-reply' || part.type === 'mcq') {
        html += part.questions.map(q => renderMCQ(q)).join('');
      } else if (part.type === 'gap-fill-form') {
        html += renderFormGapFill(part);
      } else if (part.type === 'matching-speakers') {
        html += renderMatchingSpeakers(part);
      } else if (part.type === 'map-labeling') {
        html += renderMapLabeling(part);
      } else if (part.type === 'mcq-extracts') {
        html += renderExtracts(part);
      } else if (part.type === 'sentence-completion') {
        html += renderSentenceCompletion(part);
      }
      return html;
    }

    function renderMCQ(q) {
      return '<div class="question-card"><div class="question-number">Question ' + q.id + (q.text ? ': ' + q.text : '') + '</div><div class="options-list">' +
        q.options.map(opt => '<label class="option-item" data-q="' + q.id + '" data-val="' + opt.letter + '"><input type="radio" name="q' + q.id + '" value="' + opt.letter + '"><span class="option-letter">' + opt.letter + '</span><span class="option-text">' + opt.text + '</span></label>').join('') +
        '</div></div>';
    }

    function renderFormGapFill(part) {
      let html = '<div class="form-container"><div class="form-title">' + part.formTitle + '</div>';
      part.formContent.forEach(item => {
        if (item.type === 'heading') {
          html += '<div class="form-heading">' + item.text + '</div>';
        } else if (item.type === 'item') {
          html += '<div class="form-item">' + item.text + '</div>';
        } else if (item.type === 'item-gap') {
          html += '<div class="form-item">' + item.text + ' <span class="gap-label">(' + item.gapId + ')</span> <input type="text" autocomplete="off" class="gap-input" data-q="' + item.gapId + '">' + (item.gapSuffix || '') + '</div>';
        } else if (item.type === 'text') {
          html += '<div class="form-text">' + item.text + '</div>';
        } else if (item.type === 'html') {
          html += '<div class="form-html">' + item.text + '</div>';
        }
      });
      return html + '</div>';
    }

    function renderMatchingSpeakers(part) {
      // Mobile options preview (collapsible on mobile)
      let html = '<div class="matching-container" data-part-type="matching">';
      html += '<div class="mobile-options-preview">';
      html += '<div class="mobile-options-toggle" onclick="toggleOptionsPreview(this)">';
      html += '<span class="mobile-options-title">рџ“‹ Options (tap to view)</span>';
      html += '<span class="toggle-arrow">в–ј</span>';
      html += '</div>';
      html += '<div class="mobile-options-grid">';
      part.options.forEach(o => {
        html += '<div class="mobile-option-chip" data-option-letter="' + o.letter + '">';
        html += '<span class="chip-letter">' + o.letter + '</span>';
        html += '<span class="chip-text">' + o.text + '</span>';
        html += '<span class="chip-check">вњ“</span>';
        html += '</div>';
      });
      html += '</div></div>';
      html += '<div class="speakers-list">';
      part.speakers.forEach(s => {
        html += '<div class="speaker-item"><span class="duplicate-icon">!</span><span class="speaker-label">' + s.id + '. ' + s.label + '</span>'
          + '<div class="rich-select-container" id="rs-container-' + s.id + '">'
          + '<div class="rich-select-trigger speaker-select" id="rs-trigger-' + s.id + '" data-q="' + s.id + '" onclick="toggleRichSelect(\'' + s.id + '\', event)">Select...</div>'
          + '<div class="rich-select-menu" id="rs-menu-' + s.id + '">'
          + part.options.map(o => '<div class="rich-select-option" data-letter="' + o.letter + '" onclick="selectSpeakerOption(\'' + s.id + '\',\'' + o.letter + '\',this,event)">' + o.letter + ' \u2013 ' + o.text + '</div>').join('')
          + '</div></div></div>';
      });
      html += '</div><div class="options-box"><div style="font-weight:700;color:var(--primary);margin-bottom:10px;">Options:</div>';
      part.options.forEach(o => {
        html += '<div class="option-box-item" data-option-letter="' + o.letter + '"><span class="option-box-letter">' + o.letter + '</span> ' + o.text + '</div>';
      });
      return html + '</div></div>';
    }

    function renderMapLabeling(part) {
      // Mobile collapsible instructions
      let html = '<div class="map-instructions-toggle" onclick="toggleMapInstructions(this)">';
      html += '<span class="toggle-title">рџЋ§ ' + part.title + ' <span style="font-size:11px;color:#64748b;">(Questions ' + part.questionRange + ')</span></span>';
      html += '<span class="toggle-arrow">в–ј</span>';
      html += '</div>';
      html += '<div class="map-instructions-content">' + part.instruction + '</div>';

      html += '<div class="map-split-wrapper">';
      // Left panel - Map with canvas overlay
      html += '<div class="map-container">';
      html += '<div class="map-title"><span class="map-title-text">' + part.mapTitle + '</span>';
      html += '<div class="drawing-toolbar">';
      html += '<button class="drawing-btn preview" onclick="openMapPreview()" title="Full screen preview"><span>рџ”Ќ</span> Enlarge</button>';
      html += '<button class="drawing-btn" id="btnPen" title="Draw on map"><span>вњЏпёЏ</span> Pen</button>';
      html += '<button class="drawing-btn clear" id="btnClearCanvas" title="Clear drawing">рџ—‘пёЏ Clear</button>';
      html += '</div></div>';
      html += '<div class="map-canvas-wrapper" id="mapCanvasWrapper">';
      html += '<img src="' + part.mapImage + '" class="map-image" id="mapImage" alt="Map">';
      html += '<canvas class="map-drawing-canvas" id="mapDrawingCanvas"></canvas>';
      html += '</div>';
      html += '</div>';
      // Partition
      html += '<div class="map-partition"></div>';
      // Right panel - Questions
      html += '<div class="map-questions-panel"><div class="map-questions-header">рџ“ќ Label the Map</div><div class="map-questions">';
      part.questions.forEach(q => {
        html += '<div class="map-question-item" data-q="' + q.id + '">';
        html += '<span class="map-duplicate-icon">!</span>';
        html += '<span class="map-question-num">' + q.id + '.</span>';
        html += '<span class="map-place">' + q.place + '</span>';
        html += '<span class="map-selected-letter" data-q="' + q.id + '">вЂ”</span>';
        html += '</div>';
        html += '<div class="map-letter-options" data-for="' + q.id + '">';
        part.mapLabels.forEach(l => {
          html += '<button class="map-letter-btn" data-q="' + q.id + '" data-letter="' + l + '">' + l + '</button>';
        });
        html += '</div>';
      });
      html += '</div></div></div>';
      return html;
    }

    // Toggle map instructions visibility
    function toggleMapInstructions(el) {
      el.classList.toggle('expanded');
      const content = el.nextElementSibling;
      if (content && content.classList.contains('map-instructions-content')) {
        content.classList.toggle('show');
      }
    }

    // Toggle options preview visibility
    function toggleOptionsPreview(el) {
      el.classList.toggle('expanded');
      const grid = el.nextElementSibling;
      if (grid && grid.classList.contains('mobile-options-grid')) {
        grid.classList.toggle('show');
      }
    }

    function renderExtracts(part) {
      let html = '';
      part.extracts.forEach(ext => {
        html += '<div class="extract-box"><div class="extract-header">' + ext.title + '</div><div class="extract-questions">';
        var qs = ext.questions || [];
        var qi = 0;
        while (qi < qs.length) {
          var q = qs[qi];
          var numMerged = 1;
          while (qi + numMerged < qs.length &&
            /^\(Choice \d+\)$/i.test((qs[qi + numMerged].text || '').trim()) &&
            qs[qi + numMerged].options && q.options &&
            q.options.length === qs[qi + numMerged].options.length &&
            q.options.every(function (o, oi) { return o.letter === qs[qi + numMerged].options[oi].letter && o.text === qs[qi + numMerged].options[oi].text; })) {
            numMerged++;
          }

          if (numMerged > 1) {
            var mergedQs = qs.slice(qi, qi + numMerged);
            var qIdsArr = mergedQs.map(function (mq) { return mq.id; });
            var qIds = qIdsArr.join(',');
            var idLabel = qIdsArr.join(' & ');
            var qText = (q.text || '').replace(/\s*\(Choice\s*\d+\)\s*$/i, '').trim();

            html += '<div class="question-card merged-mcq" data-qids="' + qIds + '">';
            html += '<span class="merged-mcq-label">Q' + idLabel + '</span>';
            html += '<div class="question-number">' + qText + '</div>';
            html += '<div class="merged-mcq-hint">Select exactly ' + numMerged + ' answers (accepted in any order)</div>';
            html += '<div class="options-list">';
            q.options.forEach(function (opt) {
              html += '<label class="option-item" data-qids="' + qIds + '" data-val="' + opt.letter + '">' +
                '<input type="checkbox" name="merged-' + qIds + '" value="' + opt.letter + '" ' +
                'onchange="handleMergedMcqL(this, \'' + qIds + '\')">' +
                '<span class="option-letter">' + opt.letter + '</span>' +
                '<span class="option-text">' + opt.text + '</span></label>';
            });
            html += '</div></div>';
            qi += numMerged;
          } else {
            html += renderMCQ(q);
            qi++;
          }
        }
        html += '</div></div>';
      });
      return html;
    }

    // Handle merged MCQ checkbox (Choose N)
    function handleMergedMcqL(cb, qIdsStr) {
      if (!qIdsStr) {
        var cardOld = cb.closest('.merged-mcq');
        if (cardOld) {
          var q1 = cardOld.dataset.q1, q2 = cardOld.dataset.q2;
          if (q1 && q2) qIdsStr = q1 + ',' + q2;
        }
      }
      var qIds = qIdsStr ? qIdsStr.split(',') : [];
      var maxPicks = qIds.length || 2;
      var card = cb.closest('.merged-mcq');
      var checked = card.querySelectorAll('input[type="checkbox"]:checked');
      if (checked.length > maxPicks) { cb.checked = false; return; }
      card.querySelectorAll('.option-item').forEach(function (item) {
        var c = item.querySelector('input[type="checkbox"]');
        item.classList.toggle('selected', c && c.checked);
      });
      var atMax = card.querySelectorAll('input[type="checkbox"]:checked').length >= maxPicks;
      card.querySelectorAll('.option-item').forEach(function (item) {
        var c = item.querySelector('input[type="checkbox"]');
        if (atMax && c && !c.checked) { item.classList.add('disabled-option'); }
        else { item.classList.remove('disabled-option'); }
      });
    }

    function renderSentenceCompletion(part) {
      // Replace span placeholders with actual input fields
      let content = part.passageContent.replace(/<span class="gap-input" data-gap="(\d+)">[^<]*<\/span>/g,
        '<input type="text" autocomplete="off" class="gap-input sentence-gap" data-q="$1" placeholder="($1)">');
      return '<div class="passage-container"><div class="passage-title">' + part.passageTitle + '</div><div class="passage-text">' + content + '</div></div>';
    }

    function showPart(index) {
      if (index < 0 || index >= TEST_DATA.parts.length) return;
      currentPart = index;

      // When manually switching parts, also load the audio but don't play it
      if (window.loadPartAudio) {
        window.loadPartAudio(index, false);
      }

      // Update visibility
      document.querySelectorAll('.part-section').forEach((s, i) => {
        s.classList.toggle('active', i === index);
      });

      // Update both nav bars
      document.querySelectorAll('.part-btn').forEach((btn, i) => {
        const isThisPart = i % TEST_DATA.parts.length === index;
        btn.classList.toggle('active', isThisPart);
      });

      // Update nav buttons (bottom)
      document.getElementById('btnPrev').style.visibility = index === 0 ? 'hidden' : 'visible';
      if (index === TEST_DATA.parts.length - 1) {
        document.getElementById('btnNext').style.display = 'none';
        document.getElementById('btnSubmit').style.display = 'flex';
      } else {
        document.getElementById('btnNext').style.display = 'flex';
        document.getElementById('btnSubmit').style.display = 'none';
      }

      // Floating submit вЂ” show on last part (both PC and mobile)
      const floatingSubmit = document.getElementById('mobileFloatingSubmit');
      if (floatingSubmit) {
        if (index === TEST_DATA.parts.length - 1) {
          floatingSubmit.classList.add('visible');
        } else {
          floatingSubmit.classList.remove('visible');
        }
      }

      // Update mobile part indicators
      document.querySelectorAll('.mobile-part-dot').forEach((dot, i) => {
        dot.classList.remove('active', 'adjacent');
        if (i === index) {
          dot.classList.add('active');
        } else if (i === index - 1 || i === index + 1) {
          dot.classList.add('adjacent');
        }
      });

      // NOTE: Audio does NOT auto-switch when browsing parts
      // Students can look through questions while listening to current audio
      // Audio only changes when the current part's audio finishes
    }

    function startTimer() {
      window.__testStartTime = new Date();
      updateTimerDisplay();
      timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        if (timeRemaining <= 0) {
          clearInterval(timerInterval);
          submitTest();
        }
      }, 1000);
    }

    function updateTimerDisplay() {
      const m = Math.floor(timeRemaining / 60);
      const s = timeRemaining % 60;
      document.getElementById('timerDisplay').textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
      if (timeRemaining < 300) document.getElementById('timerDisplay').style.color = '#fbbf24';
      if (timeRemaining < 60) document.getElementById('timerDisplay').style.color = '#ef4444';
    }

    function collectAnswers() {
      userAnswers = {};
      // Merged MCQ (Choose N) вЂ” collect checked checkboxes
      document.querySelectorAll('.merged-mcq').forEach(card => {
        var qIdsAttr = card.dataset.qids;
        if (!qIdsAttr) {
          var q1 = card.dataset.q1, q2 = card.dataset.q2;
          if (q1 && q2) qIdsAttr = q1 + ',' + q2;
        }
        if (!qIdsAttr) return;
        var qIds = qIdsAttr.split(',');
        var checked = card.querySelectorAll('input[type="checkbox"]:checked');
        var vals = Array.from(checked).map(function (c) { return c.value; });
        for (var i = 0; i < qIds.length; i++) {
          if (vals[i]) userAnswers[qIds[i]] = vals[i];
        }
      });
      // MCQ (non-merged)
      document.querySelectorAll('.option-item.selected').forEach(el => {
        if (el.closest('.merged-mcq')) return;
        userAnswers[el.dataset.q] = el.dataset.val;
      });
      // Gap fill inputs
      document.querySelectorAll('.gap-input').forEach(inp => {
        if (inp.dataset.q && inp.value.trim()) userAnswers[inp.dataset.q] = inp.value.trim();
      });
      // Rich selects (speaker matching)
      document.querySelectorAll('.rich-select-trigger.speaker-select').forEach(function(t) {
        var q = t.getAttribute('data-q');
        var v = t.getAttribute('data-value');
        if (q && v) userAnswers[q] = v;
      });
      // Map letter buttons
      document.querySelectorAll('.map-selected-letter').forEach(el => {
        if (el.dataset.q && el.textContent !== 'вЂ”') userAnswers[el.dataset.q] = el.textContent;
      });
    }

    // Handle map letter button clicks
    function handleMapLetterClick(btn) {
      const qId = btn.dataset.q;
      const letter = btn.dataset.letter;
      const optionsRow = btn.closest('.map-letter-options');

      // Update the selected letter display
      const selectedDisplay = document.querySelector('.map-selected-letter[data-q=\"' + qId + '\"]');
      if (selectedDisplay) {
        selectedDisplay.textContent = letter;
        selectedDisplay.classList.add('filled');
      }

      // Mark this button as selected
      optionsRow.querySelectorAll('.map-letter-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      // Update used status across all map letter buttons
      updateMapUsedLetters();
    }

    function updateMapUsedLetters() {
      // Count how many times each letter is selected
      const letterCounts = {};
      const usedLetters = new Set();

      document.querySelectorAll('.map-selected-letter').forEach(el => {
        const letter = el.textContent;
        if (letter !== 'вЂ”') {
          usedLetters.add(letter);
          letterCounts[letter] = (letterCounts[letter] || 0) + 1;
        }
      });

      // Update all letter buttons
      document.querySelectorAll('.map-letter-btn').forEach(btn => {
        const letter = btn.dataset.letter;
        const isSelected = btn.classList.contains('selected');
        if (usedLetters.has(letter) && !isSelected) {
          btn.classList.add('used');
        } else {
          btn.classList.remove('used');
        }
      });

      // Mark duplicate question items with warning
      document.querySelectorAll('.map-question-item').forEach(item => {
        const qId = item.dataset.q;
        const selectedLetter = document.querySelector('.map-selected-letter[data-q="' + qId + '"]');
        if (selectedLetter) {
          const letter = selectedLetter.textContent;
          if (letter !== 'вЂ”' && letterCounts[letter] > 1) {
            item.classList.add('duplicate-warning');
          } else {
            item.classList.remove('duplicate-warning');
          }
        }
      });
    }

    // Event delegation for map letter buttons
    document.addEventListener('click', function (e) {
      if (e.target.classList.contains('map-letter-btn')) {
        handleMapLetterClick(e.target);
      }
    });

    // Rich select toggle
    function toggleRichSelect(qId, event) {
      if (event) event.stopPropagation();
      var menu = document.getElementById('rs-menu-' + qId);
      var trigger = document.getElementById('rs-trigger-' + qId);
      var isOpen = menu.style.display === 'block';
      document.querySelectorAll('.rich-select-menu').forEach(function(m){ m.style.display = 'none'; });
      document.querySelectorAll('.rich-select-trigger').forEach(function(t){ t.classList.remove('open'); });
      document.querySelectorAll('.speaker-item').forEach(function(c){ c.classList.remove('elevated'); });
      if (!isOpen) {
        menu.style.display = 'block';
        trigger.classList.add('open');
        var card = trigger.closest('.speaker-item');
        if (card) card.classList.add('elevated');
      }
    }

    // Rich select option chosen (speaker matching)
    function selectSpeakerOption(qId, letter, optEl, event) {
      if (event) event.stopPropagation();
      var trigger = document.getElementById('rs-trigger-' + qId);
      var menu = document.getElementById('rs-menu-' + qId);
      trigger.textContent = optEl.textContent;
      trigger.setAttribute('data-value', letter);
      trigger.classList.remove('open');
      if (menu) menu.style.display = 'none';
      var card = trigger.closest('.speaker-item');
      if (card) card.classList.remove('elevated');
      menu.querySelectorAll('.rich-select-option').forEach(function(o){ o.classList.remove('selected'); });
      optEl.classList.add('selected');
      updateChosenOptions();
    }

    // Close all rich selects on outside click
    document.addEventListener('click', function(ev) {
      if (ev.target.closest && ev.target.closest('.rich-select-container')) return;
      document.querySelectorAll('.rich-select-menu').forEach(function(m){ m.style.display = 'none'; });
      document.querySelectorAll('.rich-select-trigger').forEach(function(t){ t.classList.remove('open'); });
      document.querySelectorAll('.speaker-item').forEach(function(c){ c.classList.remove('elevated'); });
    });

    // Track chosen options in matching questions
    function updateChosenOptions() {
      var container = document.querySelector('.matching-container');
      if (!container) return;

      var triggers = container.querySelectorAll('.rich-select-trigger.speaker-select');
      var letterCounts = {};
      var chosenLetters = new Set();

      triggers.forEach(function(t) {
        var v = t.getAttribute('data-value');
        if (v) {
          chosenLetters.add(v);
          letterCounts[v] = (letterCounts[v] || 0) + 1;
        }
      });

      // Duplicate warnings + option-used hints
      triggers.forEach(function(t) {
        var speakerItem = t.closest('.speaker-item');
        var myVal = t.getAttribute('data-value');
        if (myVal && letterCounts[myVal] > 1) {
          speakerItem.classList.add('duplicate-warning');
          t.classList.add('duplicate');
        } else {
          speakerItem.classList.remove('duplicate-warning');
          t.classList.remove('duplicate');
        }
        var menu = document.getElementById('rs-menu-' + t.getAttribute('data-q'));
        if (!menu) return;
        menu.querySelectorAll('.rich-select-option').forEach(function(opt) {
          var letter = opt.getAttribute('data-letter');
          var isUsedElsewhere = chosenLetters.has(letter) && myVal !== letter;
          opt.classList.toggle('option-used', isUsedElsewhere);
        });
      });

      // Update options box visual
      var optionsBox = container.querySelector('.options-box');
      if (optionsBox) {
        optionsBox.querySelectorAll('.option-box-item').forEach(function(item) {
          var letter = item.dataset.optionLetter;
          item.classList.toggle('chosen', chosenLetters.has(letter));
        });
      }

      // Update mobile options preview chips
      var mobilePreview = container.querySelector('.mobile-options-preview');
      if (mobilePreview) {
        mobilePreview.querySelectorAll('.mobile-option-chip').forEach(function(chip) {
          var letter = chip.dataset.optionLetter;
          chip.classList.toggle('chosen', chosenLetters.has(letter));
        });
      }
    }

    function matchesAnswer(userAns, correctArr) {
      if (!userAns) return false;
      var arr = Array.isArray(correctArr) ? correctArr : [correctArr];
      var uLow = userAns.toString().toLowerCase().trim();
      if (arr.some(function(c){ return c.toString().toLowerCase().trim() === uLow; })) return true;
      // Spelling variant match
      var userVariants = getSpellingVariants(uLow);
      if (userVariants.length > 0 && arr.some(function(c){ return userVariants.indexOf(c.toString().toLowerCase().trim()) !== -1; })) return true;
      if (arr.some(function(c){ var v = getSpellingVariants(c.toString().toLowerCase().trim()); return v.indexOf(uLow) !== -1; })) return true;
      if (arr.length > 1) {
        var parts = userAns.toString().split(/\s*[\/]\s*|\s+or\s+/i).map(function(p){ return p.toLowerCase().trim(); }).filter(Boolean);
        if (parts.length > 1 && parts.some(function(p){ return arr.some(function(c){ return c.toString().toLowerCase().trim() === p; }) || getSpellingVariants(p).some(function(v){ return arr.some(function(c){ return c.toString().toLowerCase().trim() === v; }); }); })) return true;
      }
      return false;
    }

    function calculateScore() {
      let score = 0;
      TEST_DATA.parts.forEach(part => {
        if (part.answers) {
          Object.keys(part.answers).forEach(qId => {
            const correct = part.answers[qId];
            const user = userAnswers[qId];
            if (matchesAnswer(user, correct)) score++;
          });
        }
      });
      return score;
    }

    let hasSubmitted = false;

    function submitTest() {
      // Prevent multiple submissions
      if (hasSubmitted) {
        return;
      }
      hasSubmitted = true;

      // Hide the submit buttons completely
      const submitBtn = document.getElementById('btnSubmit');
      if (submitBtn) {
        submitBtn.style.display = 'none';
      }

      // Hide floating submit button
      const floatSubmit = document.getElementById('mobileFloatingSubmit');
      if (floatSubmit) {
        floatSubmit.classList.remove('visible');
        floatSubmit.style.display = 'none';
      }

      // Also disable confirm submit button
      const confirmSubmitBtn = document.getElementById('confirmSubmit');
      if (confirmSubmitBtn) {
        confirmSubmitBtn.disabled = true;
        confirmSubmitBtn.style.opacity = '0.5';
        confirmSubmitBtn.style.cursor = 'not-allowed';
      }

      clearInterval(timerInterval);

      // Stop the audio when test is submitted
      const audio = document.getElementById('listeningAudio');
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      const hiddenAudio = document.getElementById('hiddenAudio');
      if (hiddenAudio) {
        hiddenAudio.pause();
        hiddenAudio.currentTime = 0;
      }

      collectAnswers();
      const score = calculateScore();
      document.getElementById('finalScore').textContent = score;
      document.getElementById('finalTotal').textContent = '/' + TEST_DATA.testInfo.totalQuestions;

      var _isPremiumListen = sessionStorage.getItem('listeningPremiumEntry') === 'true';
      if (!_isPremiumListen) {
        try { var _tk = JSON.parse(localStorage.getItem('takenListeningMocks') || '{}'); _tk[testFile] = true; localStorage.setItem('takenListeningMocks', JSON.stringify(_tk)); } catch(e) {}
      }
      let resultsHtml = '';
      TEST_DATA.parts.forEach((part, partIndex) => {
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
            const correct = part.answers[qId];
            const user = userAnswers[qId];
            const correctStr = Array.isArray(correct) ? correct.join(' or ') : correct;
            const userStr = user || '';

            let isCorrect = matchesAnswer(user, correct);

            if (isCorrect) partCorrect++;

            const qNum = qId.replace(/\D/g, '') || qId;
            let rowClass = 'unanswered-row';
            let userClass = 'user-answer empty';
            let userDisplay = '(no answer)';

            if (user) {
              userClass = 'user-answer';
              userDisplay = userStr;
              rowClass = isCorrect ? 'correct-row' : 'incorrect-row';
            }

            answersTableRows += '<div class="answers-table-row ' + rowClass + '">' +
              '<div class="q-num">Q' + qNum + '</div>' +
              '<div class="' + userClass + '">' + userDisplay + '</div>' +
              '<div class="correct-answer">' + correctStr + '</div>' +
              '</div>';
          });
        }

        var transcriptBtn = '';
        var transcriptDiv = '';
        if (part.transcript) {
          if (_isPremiumListen) {
            transcriptBtn = '<button class="part-transcript-toggle" onclick="event.stopPropagation();toggleTranscript(' + partIndex + ')">рџ“њ Show Transcript</button>';
            transcriptDiv = '<div class="part-transcript-content" id="transcript-' + partIndex + '">' + part.transcript.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>') + '</div>';
          } else {
            transcriptBtn = '<button class="part-transcript-toggle" style="background:#cbd5e1!important;color:#94a3b8!important;cursor:not-allowed!important;box-shadow:none!important;pointer-events:none;opacity:0.85;" onclick="event.stopPropagation()">рџ”’ Transcript (Premium)</button>';
          }
        }

        resultsHtml += '<div class="part-result-container" data-part="' + partIndex + '">' +
          '<div class="part-result-header" onclick="togglePartAnswers(' + partIndex + ')">' +
          '<div class="part-result-left">' +
          '<div class="part-result-toggle">в–ј</div>' +
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
          transcriptBtn +
          transcriptDiv +
          '</div>';
      });
      document.getElementById('resultsBody').innerHTML = resultsHtml;
      document.getElementById('resultsModal').classList.add('active');

      // Grey-out Review/TryAgain/Transcripts for regular (non-premium) codes
      (function () {
        var isPremium = sessionStorage.getItem('listeningPremiumEntry') === 'true';
        if (!isPremium) {
          var frozenStyle = 'background:#cbd5e1 !important;color:#94a3b8 !important;cursor:not-allowed !important;box-shadow:none !important;pointer-events:none;opacity:0.85;';
          var btns = [
            { el: document.getElementById('btnReview'),      label: 'рџ”’ Review Answers (Premium)' },
            { el: document.getElementById('btnTranscripts'), label: 'рџ”’ Transcripts (Premium)' },
            { el: document.getElementById('btnTryAgain'),    label: 'рџ”’ Try Again (Premium)' }
          ];
          btns.forEach(function (b) {
            if (b.el) {
              b.el.style.cssText += frozenStyle;
              b.el.innerHTML = b.label;
              b.el.onclick = function (e) { e.preventDefault(); e.stopPropagation(); };
              b.el.removeAttribute('onclick');
            }
          });
          var closeBtn = document.getElementById('resultsCloseBtn');
          if (closeBtn) closeBtn.style.display = 'none';
        }
      })();

      // Auto-submit results to backend
      sendResultsToBackend(score);
    }

    // Toggle part answers dropdown
    function togglePartAnswers(partIndex) {
      const container = document.querySelector('.part-result-container[data-part="' + partIndex + '"]');
      if (container) {
        container.classList.toggle('expanded');
      }
    }

    function toggleTranscript(partIndex) {
      const el = document.getElementById('transcript-' + partIndex);
      const btn = el.previousElementSibling;
      if (el.classList.toggle('visible')) {
        btn.textContent = 'рџ“њ Hide Transcript';
      } else {
        btn.textContent = 'рџ“њ Show Transcript';
      }
    }

    // ===== TRANSCRIPTS POPUP =====
    function openTranscriptsPopup() {
      if (!TEST_DATA || !TEST_DATA.parts) return;
      var parts = TEST_DATA.parts;
      var tabsHtml = '';
      var bodyHtml = '';

      // Color palette for question highlights (12 colors, cycled)
      var HIGHLIGHT_COLORS = 12;

      for (var pi = 0; pi < parts.length; pi++) {
        var part = parts[pi];
        if (!part.transcript) continue;

        tabsHtml += '<button class="transcript-tab' + (pi === 0 ? ' active' : '') + '" onclick="switchTranscriptTab(' + pi + ')" data-tab="' + pi + '">' +
          part.title + '</button>';

        // Build highlight map: lineIndex -> [{qId, colorIdx}]
        var lineHighlights = {};
        var allQIds = [];
        if (part.answerHighlights) {
          var ahl = part.answerHighlights;
          for (var qId in ahl) {
            if (!ahl.hasOwnProperty(qId)) continue;
            allQIds.push(parseInt(qId));
          }
          allQIds.sort(function (a, b) { return a - b; });
          for (var qi = 0; qi < allQIds.length; qi++) {
            var qid = allQIds[qi];
            var lines = ahl[qid];
            if (!lines) continue;
            for (var li = 0; li < lines.length; li++) {
              var ln = lines[li];
              if (!lineHighlights[ln]) lineHighlights[ln] = [];
              lineHighlights[ln].push({ qId: qid, colorIdx: qi % HIGHLIGHT_COLORS });
            }
          }
        }

        // Build legend
        var legendHtml = '';
        if (allQIds.length > 0) {
          legendHtml = '<div class="transcript-legend">';
          for (var qi = 0; qi < allQIds.length; qi++) {
            var cIdx = qi % HIGHLIGHT_COLORS;
            legendHtml += '<div class="legend-item"><div class="legend-dot hl-color-' + cIdx + '" style="background:' + getLegendColor(cIdx) + '"></div>Q' + allQIds[qi] + '</div>';
          }
          legendHtml += '</div>';
        }

        // Build transcript lines
        var rawLines = part.transcript.split('\n');
        // Find where "listen again" / "now listen again" starts to avoid duplicates
        var cutoffIndex = rawLines.length;
        for (var ri = 0; ri < rawLines.length; ri++) {
          var lowerLine = rawLines[ri].toLowerCase().trim();
          if (lowerLine.indexOf('now listen again') !== -1 || lowerLine.indexOf('now, listen again') !== -1 || lowerLine === 'you will hear the piece again.') {
            cutoffIndex = ri;
            break;
          }
        }

        var linesHtml = '';
        for (var ri = 0; ri < cutoffIndex; ri++) {
          var lineText = rawLines[ri].replace(/</g, '&lt;').replace(/>/g, '&gt;');
          if (lineText.trim() === '') {
            linesHtml += '<div class="transcript-line empty-line"></div>';
            continue;
          }
          var hlData = lineHighlights[ri];
          if (hlData && hlData.length > 0) {
            // Use the first highlight's color for the line background
            var mainColor = hlData[0].colorIdx;
            var badges = '';
            for (var h = 0; h < hlData.length; h++) {
              badges += '<span class="q-badge hl-color-' + hlData[h].colorIdx + '" style="background:' + getLegendColor(hlData[h].colorIdx) + '">Q' + hlData[h].qId + '</span>';
            }
            linesHtml += '<div class="transcript-line highlighted hl-color-' + mainColor + '">' + lineText + badges + '</div>';
          } else {
            linesHtml += '<div class="transcript-line">' + lineText + '</div>';
          }
        }

        bodyHtml += '<div class="transcript-part-section' + (pi === 0 ? ' active' : '') + '" data-part="' + pi + '">' +
          '<div class="transcript-part-label">' + part.title + ' \u2014 ' + (part.type || '').replace(/-/g, ' ') + ' (Questions ' + (part.questionRange || '') + ')</div>' +
          legendHtml +
          linesHtml +
          '</div>';
      }

      document.getElementById('transcriptTabs').innerHTML = tabsHtml;
      document.getElementById('transcriptBody').innerHTML = bodyHtml;
      document.getElementById('transcriptsOverlay').classList.add('active');
    }

    function getLegendColor(idx) {
      var colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#a855f7', '#06b6d4', '#eab308'];
      return colors[idx % colors.length];
    }

    function switchTranscriptTab(partIndex) {
      var tabs = document.querySelectorAll('.transcript-tab');
      var sections = document.querySelectorAll('.transcript-part-section');
      for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
      for (var i = 0; i < sections.length; i++) sections[i].classList.remove('active');
      var activeTab = document.querySelector('.transcript-tab[data-tab="' + partIndex + '"]');
      var activeSection = document.querySelector('.transcript-part-section[data-part="' + partIndex + '"]');
      if (activeTab) activeTab.classList.add('active');
      if (activeSection) activeSection.classList.add('active');
      // Scroll body to top
      var body = document.getElementById('transcriptBody');
      if (body) body.scrollTop = 0;
    }

    function closeTranscriptsPopup() {
      document.getElementById('transcriptsOverlay').classList.remove('active');
    }

    // Close transcripts popup on overlay click
    document.addEventListener('click', function (e) {
      if (e.target && e.target.id === 'transcriptsOverlay') {
        closeTranscriptsPopup();
      }
    });

    // ===== AUTO-SUBMIT RESULTS TO TELEGRAM =====
    async function sendResultsToBackend(score) {
      try {
        // Ensure candidate name is synced from universal input if available
        (function () {
          var fullName = sessionStorage.getItem('CANDIDATE_FULL_NAME');
          if (fullName && !sessionStorage.getItem('cefrListeningCandidateName')) {
            sessionStorage.setItem('cefrListeningCandidateName', fullName);
          }
        })();

        // Get candidate name from sessionStorage
        const candidateName = sessionStorage.getItem('cefrListeningCandidateName') || 'Unknown';

        const testIdentifier = TEST_DATA?.testInfo?.title || 'CEFR Listening Test';
        const mockNum = testFile.match(/(\d+)/) ? testFile.match(/(\d+)/)[1].padStart(2, '0') : '01';
        const total = TEST_DATA?.testInfo?.totalQuestions || 0;

        // Calculate correct/incorrect/unanswered FIRST
        var correct = 0, incorrect = 0, unanswered = 0;
        TEST_DATA.parts.forEach(function (part) {
          if (part.answers) {
            Object.keys(part.answers).forEach(function (qId) {
              var correctAns = part.answers[qId];
              var userAns = userAnswers[qId];
              if (!userAns) {
                unanswered++;
              } else if (matchesAnswer(userAns, correctAns)) {
                correct++;
              } else {
                incorrect++;
              }
            });
          }
        });

        // Use 'correct' as the actual score (more reliable than passed parameter)
        const actualScore = correct;
        const percentage = total > 0 ? Math.round((actualScore / total) * 100) : 0;

        // Certificate score conversion table for CEFR Listening (Tinglab tushunish)
        function getCertificateScore(rawScore) {
          const conversionTable = {
            0: 0, 1: 23, 2: 26, 3: 28, 4: 30, 5: 33, 6: 34, 7: 36, 8: 38, 9: 39,
            10: 41, 11: 42, 12: 44, 13: 45, 14: 47, 15: 48, 16: 50, 17: 51, 18: 53,
            19: 54, 20: 55, 21: 57, 22: 58, 23: 60, 24: 61, 25: 63, 26: 65, 27: 66,
            28: 68, 29: 70, 30: 72, 31: 73, 32: 74, 33: 75, 34: 75, 35: 75, 36: 75
          };
          return conversionTable[rawScore] || (rawScore > 36 ? 75 : 0);
        }
        const certificateScore = getCertificateScore(actualScore);

        // Calculate CEFR Level based on actual score
        function getCEFRLevel(s) {
          if (s <= 6) return { level: 'Below B1', color: '#ef4444', bg: '#fee2e2' };
          if (s <= 16) return { level: 'B1', color: '#f59e0b', bg: '#fef3c7' };
          if (s <= 25) return { level: 'B2', color: '#3b82f6', bg: '#dbeafe' };
          return { level: 'C1', color: '#10b981', bg: '#d1fae5' };
        }
        const cefrResult = getCEFRLevel(actualScore);

        // Build part results HTML
        function generatePartResults() {
          var html = '';
          TEST_DATA.parts.forEach(function (part) {
            var partCorrect = 0, partTotal = 0;
            if (part.answers) {
              Object.keys(part.answers).forEach(function (qId) {
                partTotal++;
                var correctAns = part.answers[qId];
                var userAns = userAnswers[qId];
                if (matchesAnswer(userAns, correctAns)) {
                  partCorrect++;
                }
              });
            }
            html += '<div class="part-result"><span class="part-name">' + part.title + '</span><span class="part-score">' + partCorrect + '/' + partTotal + '</span></div>';
          });
          return html;
        }

        // Build answer rows
        function generateAnswerRows() {
          var rows = '';
          TEST_DATA.parts.forEach(function (part) {
            if (part.answers) {
              for (var qId in part.answers) {
                var userAnswer = userAnswers[qId] || '';
                var correctAnswerRaw = part.answers[qId];
                var correctAnswers = Array.isArray(correctAnswerRaw) ? correctAnswerRaw : [correctAnswerRaw];
                var correctAnswer = correctAnswers[0] || '';
                var isCorrect = false;
                var rowClass = 'unanswered-row';
                var status = 'вЂ”';
                if (userAnswer) {
                  isCorrect = matchesAnswer(userAnswer, correctAnswers);
                  rowClass = isCorrect ? 'correct-row' : 'incorrect-row';
                  status = isCorrect ? 'вњ“' : 'вњ—';
                }
                rows += '<div class="answer-row ' + rowClass + '"><span class="q-num">' + qId + '</span><span class="user-ans">' + (userAnswer || '(empty)') + '</span><span class="correct-ans">' + correctAnswer + '</span><span class="status">' + status + '</span></div>';
              }
            }
          });
          return rows;
        }

        // Build detailed parts
        function generateDetailedParts() {
          var html = '';
          TEST_DATA.parts.forEach(function (part) {
            html += '<div class="part-block"><div class="part-title">' + part.title + ' (' + part.questionRange + ')</div>';
            html += '<div class="part-instruction">' + (part.instruction || '') + '</div>';

            // Handle questions array
            if (part.questions) {
              part.questions.forEach(function (q) {
                var qId = q.id;
                var userAns = userAnswers[qId] || '';
                var correctAnsRaw = part.answers[qId];
                var correctAnswers = Array.isArray(correctAnsRaw) ? correctAnsRaw : [correctAnsRaw];
                var correctAns = correctAnswers[0] || '';
                var isCorrect = userAns && matchesAnswer(userAns, correctAnswers);
                html += '<div class="question-item"><div class="question-text">Question ' + qId + (q.text ? ': ' + q.text : '') + (q.hint ? ' (' + q.hint + ')' : '') + '</div>';
                if (q.options) {
                  q.options.forEach(function (opt) {
                    var optClass = '';
                    var badges = '';
                    var isUserSelected = userAns === opt.letter;
                    var isCorrectOption = correctAns === opt.letter;
                    if (isUserSelected && isCorrectOption) { optClass = 'user-correct'; badges = '<span class="badge correct">вњ“ Your Answer</span>'; }
                    else if (isUserSelected) { optClass = 'user-selected'; badges = '<span class="badge your-answer">вњ— Your Answer</span>'; }
                    else if (isCorrectOption) { optClass = 'correct-answer'; badges = '<span class="badge correct">вњ“ Correct</span>'; }
                    html += '<div class="option-row ' + optClass + '"><span class="option-letter">' + opt.letter + '.</span><span>' + opt.text + '</span>' + badges + '</div>';
                  });
                } else {
                  html += '<div style="margin-top:8px"><span>Your answer: </span><span class="gap-answer ' + (isCorrect ? 'correct-ans' : (userAns ? 'user-wrong' : '')) + '">' + (userAns || '(empty)') + '</span>';
                  if (!isCorrect) html += '<span> в†’ Correct: </span><span class="gap-answer correct-ans">' + correctAns + '</span>';
                  html += '</div>';
                }
                html += '</div>';
              });
            }

            // Handle speakers (matching type)
            if (part.speakers) {
              part.speakers.forEach(function (speaker) {
                var qId = speaker.id;
                var userAns = userAnswers[qId] || '';
                var correctAns = part.answers[qId] || '';
                var isCorrect = matchesAnswer(userAns, correctAns);
                html += '<div class="question-item"><div class="question-text">' + speaker.label + ' (Q' + qId + ')</div>';
                html += '<div style="margin-top:8px"><span>Your answer: </span><span class="gap-answer ' + (isCorrect ? 'correct-ans' : (userAns ? 'user-wrong' : '')) + '">' + (userAns || '(empty)') + '</span>';
                if (!isCorrect) html += '<span> в†’ Correct: </span><span class="gap-answer correct-ans">' + correctAns + '</span>';
                html += '</div></div>';
              });
              if (part.options) {
                html += '<div style="margin-top:10px;padding:10px;background:#f0fdfa;border-radius:8px;font-size:13px"><strong>Options:</strong><br>';
                part.options.forEach(function (opt) { html += '<span style="margin-right:15px">' + opt.letter + '. ' + opt.text + '</span>'; });
                html += '</div>';
              }
            }

            html += '</div>';
          });
          return html;
        }

        // Build HTML report
        const now = new Date();
        const reportHtml = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CEFR Listening Results</title><style>' +
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
          '.pdf-btn { display: block; margin: 20px auto; padding: 15px 40px; background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(220,38,38,0.3); }' +
          '.pdf-btn:hover { background: linear-gradient(135deg, #b91c1c, #991b1b); transform: translateY(-2px); }' +
          '</style><script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><' + '/script></head><body><div class="container">' +
          '<h1>рџЋ§ CEFR Listening Mock ' + mockNum + '</h1>' +
          '<div style="text-align:center;margin-bottom:20px;padding:15px;background:#f0fdfa;border-radius:12px;border:2px solid #0d9488">' +
          '<div style="font-size:14px;color:#64748b;margin-bottom:5px">рџ‘¤ Candidate</div>' +
          '<div style="font-size:22px;font-weight:bold;color:#0d9488">' + candidateName + '</div></div>' +
          '<div style="text-align:center;margin-bottom:20px;padding:20px;background:' + cefrResult.bg + ';border-radius:12px;border:3px solid ' + cefrResult.color + '">' +
          '<div style="font-size:14px;color:#64748b;margin-bottom:5px">рџЋЇ CEFR Level</div>' +
          '<div style="font-size:32px;font-weight:bold;color:' + cefrResult.color + '">' + cefrResult.level + '</div></div>' +
          '<div class="score-box"><div class="score">' + actualScore + '</div><div class="total">/ ' + total + '</div>' +
          '<div style="margin-top:10px;font-size:18px">' + percentage + '%</div></div>' +
          '<div class="details">' +
          '<div class="detail correct"><div class="value">' + correct + '</div><div class="label">Correct</div></div>' +
          '<div class="detail incorrect"><div class="value">' + incorrect + '</div><div class="label">Incorrect</div></div>' +
          '<div class="detail unanswered"><div class="value">' + unanswered + '</div><div class="label">Unanswered</div></div></div>' +
          '<div class="parts"><h3 style="color:#0d9488;margin-bottom:10px">Part Results</h3>' + generatePartResults() + '</div>' +
          '<div class="collapsible-section"><div class="collapsible-header" onclick="this.classList.toggle(\'active\');this.nextElementSibling.classList.toggle(\'show\')">' +
          '<span>рџ“‹ Answer Summary</span><span class="arrow">в–ј</span></div>' +
          '<div class="collapsible-content"><div class="collapsible-inner">' + generateAnswerRows() + '</div></div></div>' +
          '<div class="collapsible-section"><div class="collapsible-header" onclick="this.classList.toggle(\'active\');this.nextElementSibling.classList.toggle(\'show\')">' +
          '<span>рџ“ќ Detailed Questions & Answers</span><span class="arrow">в–ј</span></div>' +
          '<div class="collapsible-content"><div class="collapsible-inner">' + generateDetailedParts() + '</div></div></div>' +
          '<div class="info"><strong>Test:</strong> ' + testIdentifier + '<br><strong>Date:</strong> ' + now.toLocaleDateString() + '<br><strong>Time:</strong> ' + now.toLocaleTimeString() + '</div>' +
          '<button class="pdf-btn" onclick="downloadPDF()">рџ“„ Download PDF Certificate</button>' +
          '</div><script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><' + '/script>' +
          '<script>var pdfData=' + JSON.stringify({
            name: candidateName.replace(/"/g, ''),
            brandName: (window._siteLogoWording || (window.SITE_CONFIG && window.SITE_CONFIG.brandName) || 'Mock Stream').toUpperCase(),
            brandNameMixed: window._siteLogoWording || (window.SITE_CONFIG && window.SITE_CONFIG.brandName) || 'Mock Stream',
            testType: 'CEFR Listening',
            mockNum: mockNum,
            testId: testIdentifier.replace(/"/g, ''),
            score: actualScore,
            total: total,
            percentage: percentage,
            cefrLevel: cefrResult.level,
            correct: correct,
            incorrect: incorrect,
            unanswered: unanswered,
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString(),
            logoUrl: GLOBAL_LOGO_URL,
            partResults: TEST_DATA.parts.map(function (part) {
              var pc = 0, pt = 0;
              if (part.answers) {
                for (var q in part.answers) {
                  pt++;
                  var ca = part.answers[q];
                  var ua = userAnswers[q];
                  if (matchesAnswer(ua, ca)) pc++;
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
          'doc.setFillColor(59,130,246);doc.roundedRect(w/2-32,y-4,64,11,3,3,"F");' +
          'doc.setTextColor(255,255,255);doc.setFontSize(8);doc.setFont("helvetica","bold");' +
          'doc.text("LISTENING MOCK TEST",w/2,y+3,{align:"center"});y+=10;' +
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
          'doc.setTextColor(100,100,100);doc.setFontSize(6);doc.setFont("helvetica","normal");' +
          'doc.text("Tinglab tushunish",bx+bw/2,y+9,{align:"center"});doc.text("Listening",bx+bw/2,y+13,{align:"center"});' +
          'doc.setTextColor(237,137,54);doc.setFontSize(12);doc.setFont("helvetica","bold");' +
          'doc.text(String(pdfData.score),bx+bw/2,y+20,{align:"center"});' +
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
          'doc.save(pdfData.name.replace(/[^a-zA-Z0-9]/g,"_")+"_Listening_Mock"+pdfData.mockNum+".pdf");};' +
          'img.onerror=function(){img.onload();};img.src=pdfData.logoUrl;}<' + '/script></body></html>';

        // Create HTML file blob
        const htmlBlob = new Blob([reportHtml], { type: 'text/html' });
        const safeName = candidateName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
        const filename = safeName + '_Listening_Mock' + mockNum + '_' + now.toISOString().slice(0, 10) + '.html';

        // Build caption with hashtags
        const dateTag = String(now.getDate()).padStart(2, '0') + '_' + String(now.getMonth() + 1).padStart(2, '0') + '_' + String(now.getFullYear()).slice(-2);
        const monthTag = String(now.getMonth() + 1).padStart(2, '0') + '_' + String(now.getFullYear()).slice(-2);
        const yearTag = String(now.getFullYear());
        const testIdTag = GLOBAL_TEST_IDENTIFIER.replace(/-/g, '_');
        // Build per-part score lines for caption
        var partScoreLines = '';
        TEST_DATA.parts.forEach(function (part, idx) {
          var pc = 0, pt = 0;
          if (part.answers) {
            Object.keys(part.answers).forEach(function (qId) {
              pt++;
              var ca = part.answers[qId];
              var ua = userAnswers[qId];
              if (matchesAnswer(ua, ca)) pc++;
            });
          }
          partScoreLines += '\nрџ“ќ Part ' + (idx + 1) + ': ' + pc + '/' + pt;
        });

        // Calculate duration
        var startTime = window.__testStartTime || now;
        var durationMs = now - startTime;
        var durationMin = Math.floor(durationMs / 60000);
        var durationSec = Math.floor((durationMs % 60000) / 1000);
        var durationStr = durationMin + 'm ' + durationSec + 's';

        var startTimeStr = startTime.toLocaleTimeString();
        var finishTimeStr = now.toLocaleTimeString();
        var dateStr = now.getDate() + '/' + (now.getMonth() + 1) + '/' + now.getFullYear();

        const caption = 'рџ‘¤ #' + candidateName.replace(/ /g, '_') +
          '\n\nрџ§  AI Scoring:' +
          '\nрџ“Љ Raw score: ' + actualScore + '/' + total +
          '\nрџ“Љ Certificate: ' + certificateScore + '/75' +
          '\nрџЏ† CEFR Level: ' + cefrResult.level +
          '\n' + partScoreLines +
          '\n\nрџ“‹ Mock Details:' +
          '\nрџ”ў Mock в„–: ' + mockNum +
          '\nрџ“… Date: ' + dateStr +
          '\nрџ•ђ Start: ' + startTimeStr +
          '\nрџ•ђ Finish: ' + finishTimeStr +
          '\nвЏі Duration: ' + durationStr +
          '\n\nрџЏ›пёЏ Center: #' + testIdTag +
          '\nрџ“Љ #' + testIdTag + '_' + dateTag +
          '\nрџ“Љ #' + testIdTag + '_' + monthTag +
          '\nрџ“Љ #' + testIdTag + '_' + yearTag +
          '\nOverall:' +
          '\nрџ“Љ #all_' + dateTag +
          '\nрџ“Љ #all_' + monthTag +
          '\nрџ“Љ #all_' + yearTag +
          '\n#CEFR_Listening #' + cefrResult.level.replace(/ /g, '_');

        // Send to backend
        const formData = new FormData();
        formData.append('file', new File([htmlBlob], filename, { type: 'text/html' }));
        formData.append('section', 'listening');
        formData.append('caption', caption);

        const response = await fetch('https://davirbek.alwaysdata.net/send-result', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          console.log('вњ… Results sent to Telegram successfully');
        } else {
          console.warn('вљ пёЏ Failed to send results:', response.status);
        }

        // Send to routing backend
        if (window.sendToRoutingBackend) {
          await window.sendToRoutingBackend({ skill: 'listening', caption: caption, file: new File([htmlBlob], filename, { type: 'text/html' }) });
        }
      } catch (error) {
        console.warn('вљ пёЏ Auto-submit error:', error);
      }
    }

    function showReview() {
      isReviewMode = true;
      document.getElementById('resultsModal').classList.remove('active');
      document.getElementById('pillScore').textContent = document.getElementById('finalScore').textContent + document.getElementById('finalTotal').textContent;
      document.getElementById('resultsMinPill').classList.add('visible');
      document.body.classList.add('review-mode');

      // Mark all answers for review
      TEST_DATA.parts.forEach(part => {
        if (!part.answers) return;

        for (const [qId, correctAnswerRaw] of Object.entries(part.answers)) {
          const correctAnswers = Array.isArray(correctAnswerRaw) ? correctAnswerRaw : [correctAnswerRaw];
          const correctAnswer = correctAnswers[0];
          const userAnswer = userAnswers[qId] || '';

          // Check if correct
          const isCorrect = matchesAnswer(userAnswer, correctAnswers);

          // Handle text inputs (gap-fill questions)
          const input = document.querySelector(`.gap-input[data-q="${qId}"]`);
          if (input) {
            if (!userAnswer) {
              // Auto-fill unanswered - use distinct orange/amber style
              input.value = correctAnswer;
              input.style.cssText = 'border-color: #f59e0b; background: #fef3c7; color: #92400e; font-style: italic;';
            } else if (isCorrect) {
              input.style.cssText = 'border-color: var(--success); background: #dcfce7;';
            } else {
              input.style.cssText = 'border-color: var(--danger); background: #fee2e2;';
              // Add correct answer badge right after the input
              if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('correct-answer-badge')) {
                const badge = document.createElement('span');
                badge.className = 'correct-answer-badge';
                badge.textContent = 'вњ“ ' + correctAnswer;
                badge.style.cssText = 'display: inline-block; background: #10b981; color: white; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 600; margin-left: 8px; vertical-align: middle;';
                input.insertAdjacentElement('afterend', badge);
              }
            }
          }

          // Handle rich-select triggers (speaker matching)
          const trigger = document.querySelector(`.rich-select-trigger.speaker-select[data-q="${qId}"]`);
          if (trigger) {
            trigger.classList.add('locked');
            // Find the correct option display text from the menu
            let correctDisplayText = correctAnswer;
            const menu = document.getElementById('rs-menu-' + qId);
            if (menu) {
              const correctOpt = menu.querySelector(`.rich-select-option[data-letter="${correctAnswer}"]`);
              if (correctOpt) correctDisplayText = correctOpt.textContent;
            }

            if (!userAnswer) {
              trigger.textContent = correctDisplayText;
              trigger.style.cssText = 'border: 2px solid #f59e0b; background: #fef3c7; color: #92400e; font-style: italic; pointer-events: none;';
              if (!trigger.parentNode.querySelector('.unanswered-badge')) {
                const badge = document.createElement('span');
                badge.className = 'unanswered-badge';
                badge.textContent = '(not answered)';
                badge.style.cssText = 'display: inline-block; background: #f59e0b; color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-top: 6px;';
                trigger.parentNode.appendChild(badge);
              }
            } else if (isCorrect) {
              trigger.style.cssText = 'border: 2px solid #10b981; background: #dcfce7; pointer-events: none;';
            } else {
              trigger.style.cssText = 'border: 2px solid #ef4444; background: #fee2e2; pointer-events: none;';
              if (!trigger.parentNode.querySelector('.correct-answer-badge')) {
                const badge = document.createElement('span');
                badge.className = 'correct-answer-badge';
                badge.textContent = 'вњ“ ' + correctAnswer;
                badge.style.cssText = 'display: inline-block; background: #10b981; color: white; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 600; margin-top: 6px;';
                trigger.parentNode.appendChild(badge);
              }
            }
          }

          // Handle native select dropdowns (map questions only now)
          const select = document.querySelector(`.map-select[data-q="${qId}"], select[data-q="${qId}"]`);
          if (select) {
            let correctDisplayText = correctAnswer;
            const correctOption = select.querySelector(`option[value="${correctAnswer}"]`);
            if (correctOption) {
              correctDisplayText = correctOption.textContent || correctAnswer;
            }

            if (!userAnswer) {
              select.value = correctAnswer;
              select.style.cssText = 'border: 2px solid #f59e0b !important; background: #fef3c7 !important; color: #92400e; font-style: italic;';
              if (!select.nextElementSibling || !select.nextElementSibling.classList.contains('unanswered-badge')) {
                const badge = document.createElement('span');
                badge.className = 'unanswered-badge';
                badge.textContent = '(not answered)';
                badge.style.cssText = 'display: inline-block; background: #f59e0b; color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-left: 8px; vertical-align: middle;';
                select.insertAdjacentElement('afterend', badge);
              }
            } else if (isCorrect) {
              select.style.cssText = 'border: 2px solid #10b981 !important; background: #dcfce7 !important;';
            } else {
              select.style.cssText = 'border: 2px solid #ef4444 !important; background: #fee2e2 !important;';
              if (!select.nextElementSibling || !select.nextElementSibling.classList.contains('correct-answer-badge')) {
                const badge = document.createElement('span');
                badge.className = 'correct-answer-badge';
                badge.textContent = 'вњ“ ' + correctAnswer;
                badge.style.cssText = 'display: inline-block; background: #10b981; color: white; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 600; margin-left: 8px; vertical-align: middle;';
                select.insertAdjacentElement('afterend', badge);
              }
            }
          }
        }
      });

      // Highlight MCQ options (correct/incorrect)
      document.querySelectorAll('.option-item').forEach(el => {
        const qId = el.dataset.q;
        const val = el.dataset.val;
        let correct = null;
        TEST_DATA.parts.forEach(p => { if (p.answers && p.answers[qId]) correct = p.answers[qId]; });
        if (correct) {
          const isCorrectAnswer = Array.isArray(correct) ? correct.includes(val) : correct === val;
          const isSelected = el.classList.contains('selected');
          if (isCorrectAnswer) {
            el.classList.add('correct');
            if (!isSelected) el.innerHTML += '<span class="correct-badge">вњ“ Correct</span>';
          } else if (isSelected) {
            el.classList.add('incorrect');
            el.innerHTML += '<span class="incorrect-badge">вњ—</span>';
          }
        }
      });

      // Also highlight correct option in options-box for matching questions
      document.querySelectorAll('.option-item-box').forEach(el => {
        const letter = el.dataset.letter;
        // Check if this option is a correct answer for any question
        TEST_DATA.parts.forEach(part => {
          if (part.answers) {
            for (const [qId, ans] of Object.entries(part.answers)) {
              const correctAnswer = Array.isArray(ans) ? ans[0] : ans;
              if (correctAnswer === letter) {
                el.style.background = '#dcfce7';
                el.style.borderLeft = '4px solid var(--success)';
                if (!el.querySelector('.tick-mark')) {
                  const tick = document.createElement('span');
                  tick.className = 'tick-mark';
                  tick.innerHTML = ' вњ“';
                  tick.style.cssText = 'color: var(--success); font-weight: bold;';
                  el.appendChild(tick);
                }
              }
            }
          }
        });
      });

      showPart(0);
    }

    // Event listeners
    document.addEventListener('click', e => {
      if (e.target.closest('.option-item') && !isReviewMode) {
        const item = e.target.closest('.option-item');
        const qId = item.dataset.q;
        document.querySelectorAll('.option-item[data-q="' + qId + '"]').forEach(el => el.classList.remove('selected'));
        item.classList.add('selected');
        item.querySelector('input').checked = true;
      }
    });

    document.getElementById('btnPrev').addEventListener('click', () => showPart(currentPart - 1));
    document.getElementById('btnNext').addEventListener('click', () => showPart(currentPart + 1));
    document.getElementById('btnSubmit').addEventListener('click', () => {
      document.getElementById('confirmModal').classList.add('active');
    });

    // Top bar button listeners
    const btnPrevTop = document.getElementById('btnPrevTop');
    const btnNextTop = document.getElementById('btnNextTop');
    const btnSubmitTop = document.getElementById('btnSubmitTop');

    if (btnPrevTop) btnPrevTop.addEventListener('click', () => showPart(currentPart - 1));
    if (btnNextTop) btnNextTop.addEventListener('click', () => showPart(currentPart + 1));
    if (btnSubmitTop) btnSubmitTop.addEventListener('click', () => {
      document.getElementById('confirmModal').classList.add('active');
    });

    document.getElementById('confirmCancel').addEventListener('click', () => {
      document.getElementById('confirmModal').classList.remove('active');
    });
    document.getElementById('confirmSubmit').addEventListener('click', () => {
      document.getElementById('confirmModal').classList.remove('active');
      submitTest();
    });
    document.getElementById('btnReview').addEventListener('click', showReview);
    document.getElementById('resultsCloseBtn').addEventListener('click', () => {
      document.getElementById('resultsModal').classList.remove('active');
      document.getElementById('pillScore').textContent = document.getElementById('finalScore').textContent + document.getElementById('finalTotal').textContent;
      document.getElementById('resultsMinPill').classList.add('visible');
    });

    function restoreResults() {
      document.getElementById('resultsMinPill').classList.remove('visible');
      document.getElementById('resultsModal').classList.add('active');
    }

    // Anti-cheat
    document.addEventListener('contextmenu', e => { if (!window.getSelection().toString()) e.preventDefault(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) || (e.ctrlKey && ['U', 'S'].includes(e.key.toUpperCase()))) {
        e.preventDefault();
      }
    });

    // Load test on page load
    loadTest();

    // Map Preview Functions
    window.openMapPreview = function () {
      const mapImg = document.getElementById('mapImage');
      const overlay = document.getElementById('mapPreviewOverlay');
      const previewImg = document.getElementById('mapPreviewImg');
      if (!mapImg || !overlay || !previewImg) return;

      previewImg.src = mapImg.src;
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    window.closeMapPreview = function () {
      const overlay = document.getElementById('mapPreviewOverlay');
      if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    };

    // ===== PDF DOWNLOAD FUNCTIONALITY =====
    document.getElementById('btnDownload').addEventListener('click', generatePDF);

    async function generatePDF() {
      var btn = document.getElementById('btnDownload');
      var originalText = btn.innerHTML;
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:16px;height:16px;animation:spin 1s linear infinite"><circle cx="12" cy="12" r="10" stroke-width="2" stroke-dasharray="30 30"></circle></svg> Generating...';
      btn.disabled = true;

      console.log('[PDF v3] Starting PDF generation (block-by-block)...');

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
        : (window.SPEAKING_TEST_DATA && window.SPEAKING_TEST_DATA.settings && window.SPEAKING_TEST_DATA.settings.heading2) || 'Listening Practice Test';

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
          p { margin-bottom: 12px; }
          p:last-child { margin-bottom: 0; }
          .part-title { font-size: 17px; color: #0d9488; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; font-weight: bold; }
          .instruction { font-style: italic; color: #64748b; margin-bottom: 12px; font-size: 13px; }
          .mcq-item { margin-bottom: 12px; padding: 12px; background: #fafafa; border-left: 3px solid #0d9488; font-size: 14px; line-height: 1.6; }
          .form-box { padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; }
          .form-title { text-align: center; font-weight: bold; font-size: 15px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
          .form-heading { font-weight: 600; color: #0d9488; margin: 12px 0 6px; }
          .form-item { margin: 4px 0; padding-left: 12px; }
          .match-container { display: flex; gap: 20px; }
          .match-speakers { flex: 1; }
          .match-options { flex: 1; background: #f0fdfa; padding: 12px; border-radius: 8px; }
          .speaker-item { margin: 8px 0; font-size: 14px; }
          .map-box { text-align: center; margin-bottom: 12px; }
          .map-title { font-weight: bold; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
          .map-question { margin: 6px 0; font-size: 14px; }
          .extract-box { margin-bottom: 15px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
          .extract-title { background: #0d9488; color: white; padding: 8px 12px; font-weight: bold; font-size: 13px; }
          .extract-content { padding: 12px; }
          .passage-box { padding: 15px; background: #f8fafc; border-left: 4px solid #0d9488; }
          .passage-title { font-weight: bold; text-align: center; color: #0d9488; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
          .passage-content { line-height: 2; font-size: 14px; }
        </style>
      `;

      // Helper function to render a single HTML block to canvas
      async function renderBlockToCanvas(html, waitForImages) {
        var iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;border:none;background:#fff;';
        document.body.appendChild(iframe);

        iframe.contentDocument.open();
        iframe.contentDocument.write('<!DOCTYPE html><html><head>' + baseStyles + '</head><body>' + html + '</body></html>');
        iframe.contentDocument.close();

        await new Promise(function (resolve) { setTimeout(resolve, 200); });

        // Always wait for all images to load (including base64 QR codes)
        var images = iframe.contentDocument.querySelectorAll('img');
        if (images.length > 0) {
          await Promise.all(Array.from(images).map(function (img) {
            return new Promise(function (resolve) {
              if (img.complete && img.naturalWidth > 0) {
                resolve();
              } else {
                img.onload = resolve;
                img.onerror = resolve;
                // Timeout after 3 seconds
                setTimeout(resolve, 3000);
              }
            });
          }));
          // Extra wait for rendering
          await new Promise(function (resolve) { setTimeout(resolve, 300); });
        }

        var contentHeight = iframe.contentDocument.body.scrollHeight;
        iframe.style.height = contentHeight + 'px';

        await new Promise(function (resolve) { setTimeout(resolve, 150); });

        var canvas = await html2canvas(iframe.contentDocument.body, {
          scale: 2.5,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: 794,
          windowWidth: 794,
          proxy: null
        });

        iframe.remove();
        return canvas;
      }

      // Helper: draw QR code directly onto PDF at top-right of current content area
      function drawQRonPDF(pdf, qrBase64, pdfWidth, margin, yPos) {
        if (!qrBase64) return;
        var qrSize = 22; // mm
        var qrX = pdfWidth - margin - qrSize;
        var qrY = yPos + 2;
        try {
          pdf.addImage(qrBase64, 'PNG', qrX, qrY, qrSize, qrSize);
          // Label under QR
          pdf.setFontSize(6);
          pdf.setTextColor(100, 116, 139);
          pdf.text('Scan for Audio', qrX + qrSize / 2, qrY + qrSize + 3, { align: 'center' });
        } catch (e) {
          console.warn('Failed to draw QR on PDF:', e);
        }
      }

      // Helper function to generate QR code as base64 image
      async function generateQRCodeBase64(url) {
        if (!url || url.trim() === '') return null;
        if (typeof QRCode === 'undefined') {
          console.error('QRCode library not loaded - cannot generate QR codes');
          return null;
        }
        return new Promise(function (resolve) {
          var tempDiv = document.createElement('div');
          tempDiv.style.cssText = 'position:absolute;left:0;top:0;opacity:0;pointer-events:none;z-index:-9999;';
          document.body.appendChild(tempDiv);
          try {
            new QRCode(tempDiv, {
              text: url,
              width: 80,
              height: 80,
              colorDark: '#0d9488',
              colorLight: '#ffffff',
              correctLevel: QRCode.CorrectLevel.L
            });
            // Poll for canvas element (QRCode.js renders synchronously on canvas)
            var attempts = 0;
            function checkForQR() {
              var canvas = tempDiv.querySelector('canvas');
              if (canvas && canvas.width > 0) {
                try {
                  var base64 = canvas.toDataURL('image/png');
                  tempDiv.remove();
                  resolve(base64);
                  return;
                } catch (e) { console.error('QR canvas.toDataURL failed:', e); }
              }
              var img = tempDiv.querySelector('img');
              if (img && img.src && img.src.startsWith('data:')) {
                tempDiv.remove();
                resolve(img.src);
                return;
              }
              attempts++;
              if (attempts < 15) {
                setTimeout(checkForQR, 100);
              } else {
                console.error('QR generation failed after polling. Contents:', tempDiv.innerHTML.substring(0, 300));
                tempDiv.remove();
                resolve(null);
              }
            }
            checkForQR();
          } catch (e) {
            console.error('QR code generation error:', e);
            tempDiv.remove();
            resolve(null);
          }
        });
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
          logoBase64 = await new Promise(function (resolve) {
            var reader = new FileReader();
            reader.onloadend = function () { resolve(reader.result); };
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

        // Helper: add canvas to PDF and draw QR, handling page breaks correctly
        async function addCanvasWithQR(canvas, qrBase64, forceNewPage) {
          var pagesBefore = pdf.internal.getNumberOfPages();
          var yBefore = currentY;
          await addCanvasToPDF(canvas, forceNewPage);
          if (!qrBase64) return;
          var pagesAfter = pdf.internal.getNumberOfPages();
          if (pagesAfter > pagesBefore) {
            // Content caused page break - draw QR on the page where content starts
            pdf.setPage(pagesBefore + 1);
            drawQRonPDF(pdf, qrBase64, pdfWidth, margin, margin);
            pdf.setPage(pagesAfter);
          } else {
            drawQRonPDF(pdf, qrBase64, pdfWidth, margin, yBefore);
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
        for (var partIdx = 0; partIdx < TEST_DATA.parts.length; partIdx++) {
          var part = TEST_DATA.parts[partIdx];

          // Generate QR code for part audio if available
          var qrCodeBase64 = null;
          if (part.audioFile && part.audioFile.trim() !== '') {
            qrCodeBase64 = await generateQRCodeBase64(part.audioFile);
            console.log('Generated QR code for Part ' + (partIdx + 1) + ':', qrCodeBase64 ? 'Success' : 'Failed');
          }

          // Part header HTML (QR code will be drawn directly onto PDF)
          var partHeaderHtml = `
            <div style="padding-right:${qrCodeBase64 ? '90px' : '0'};">
              <div class="part-title">${part.title} (Questions ${part.questionRange})</div>
              <p class="instruction">${part.instruction}</p>
            </div>
          `;

          // Handle different part types
          if (part.type === 'mcq-reply' || part.type === 'mcq') {
            // Combine part header with first question
            for (var qi = 0; qi < part.questions.length; qi++) {
              var q = part.questions[qi];
              var mcqHtml = (qi === 0 ? partHeaderHtml : '') + `
                <div class="mcq-item">
                  <div style="font-weight:600;margin-bottom:8px;"><strong>${q.id}.</strong> ${q.text || ''}</div>
                  ${q.options.map(function (o) { return '<div style="margin:4px 0 4px 15px;"><strong>' + o.letter + ')</strong> ' + o.text + '</div>'; }).join('')}
                </div>
              `;
              var mcqCanvas = await renderBlockToCanvas(mcqHtml);
              if (qi === 0) {
                await addCanvasWithQR(mcqCanvas, qrCodeBase64, false);
              } else {
                await addCanvasToPDF(mcqCanvas, false);
              }
            }
          }
          else if (part.type === 'gap-fill-form') {
            // Combine part header + form together
            var formContentHtml = '';
            part.formContent.forEach(function (item) {
              if (item.type === 'heading') formContentHtml += '<div class="form-heading">' + item.text + '</div>';
              else if (item.type === 'item') formContentHtml += '<div class="form-item">вЂў ' + item.text + '</div>';
              else if (item.type === 'item-gap') formContentHtml += '<div class="form-item">вЂў ' + item.text + ' <strong>(' + item.gapId + ')</strong> ________ ' + (item.gapSuffix || '') + '</div>';
              else if (item.type === 'text') formContentHtml += '<div style="margin:6px 0;">' + item.text + '</div>';
            });
            var formHtml = partHeaderHtml + `
              <div class="form-box">
                <div class="form-title">${part.formTitle}</div>
                ${formContentHtml}
              </div>
            `;
            var formCanvas = await renderBlockToCanvas(formHtml);
            await addCanvasWithQR(formCanvas, qrCodeBase64, false);
          }
          else if (part.type === 'matching-speakers') {
            // Combine part header + matching content
            var speakersHtml = part.speakers.map(function (s) {
              return '<div class="speaker-item"><strong>' + s.id + '. ' + s.label + '</strong> ________</div>';
            }).join('');
            var optionsHtml = part.options.map(function (o) {
              return '<div style="margin:4px 0;"><strong>' + o.letter + '</strong> ' + o.text + '</div>';
            }).join('');
            var matchHtml = partHeaderHtml + `
              <div class="match-container">
                <div class="match-speakers">${speakersHtml}</div>
                <div class="match-options"><strong style="color:#0d9488;">Options:</strong><br>${optionsHtml}</div>
              </div>
            `;
            var matchCanvas = await renderBlockToCanvas(matchHtml, false);
            await addCanvasWithQR(matchCanvas, qrCodeBase64, false);
          }
          else if (part.type === 'map-labeling') {
            // Use preloaded map image if available
            var mapImageSrc = (window.preloadedMapImages && window.preloadedMapImages[partIdx])
              ? window.preloadedMapImages[partIdx]
              : part.mapImage;

            // Combine part header + map content
            var questionsHtml = part.questions.map(function (q) {
              return '<div class="map-question"><strong>' + q.id + '.</strong> ' + q.place + ' ________</div>';
            }).join('');

            var mapHtml = partHeaderHtml + `
              <div class="map-box">
                <div class="map-title">${part.mapTitle}</div>
                <img src="${mapImageSrc}" style="max-width:100%;border:1px solid #e2e8f0;border-radius:8px;" onerror="this.style.display='none';this.nextElementSibling.style.display='block';">
                <div style="display:none;padding:40px;text-align:center;color:#64748b;border:1px dashed #e2e8f0;border-radius:8px;">[Map Image - Scan QR code to view]</div>
              </div>
              ${questionsHtml}
              <div style="margin-top:10px;color:#64748b;font-size:11px;">Labels: ${part.mapLabels.join(', ')}</div>
            `;
            var mapCanvas = await renderBlockToCanvas(mapHtml, true);
            await addCanvasWithQR(mapCanvas, qrCodeBase64, false);
          }
          else if (part.type === 'mcq-extracts') {
            // Render part header first, then each extract separately
            var partHeaderCanvas = await renderBlockToCanvas(partHeaderHtml);
            await addCanvasWithQR(partHeaderCanvas, qrCodeBase64, false);

            for (var ei = 0; ei < part.extracts.length; ei++) {
              var ext = part.extracts[ei];
              var eqs = ext.questions || [];
              var extractQuestionsHtml = '';
              var eqi = 0;
              while (eqi < eqs.length) {
                var eq = eqs[eqi];
                var enext = eqs[eqi + 1];
                var isPair = enext && /^\(Choice 2\)$/i.test((enext.text || '').trim());
                if (isPair) {
                  var mainText = (eq.text || '').replace(/\s*\(Choice\s*\d+\)\s*$/i, '');
                  var qLabel = 'Questions ' + eq.id + ' and ' + enext.id;
                  extractQuestionsHtml += '<div style="margin-bottom:14px"><div style="font-weight:600;margin-bottom:4px;color:#0d9488">' + qLabel + '</div>' +
                    '<div style="font-size:12px;color:#64748b;margin-bottom:6px">Choose <strong>TWO</strong> letters, ' + eq.options[0].letter + '-' + eq.options[eq.options.length - 1].letter + '.</div>' +
                    '<div style="font-weight:600;margin-bottom:8px">' + mainText + '</div>' +
                    eq.options.map(function (o) { return '<div style="margin:4px 0 4px 15px"><strong>' + o.letter + ')</strong> ' + o.text + '</div>'; }).join('') + '</div>';
                  eqi += 2;
                } else {
                  extractQuestionsHtml += '<div style="margin-bottom:10px;"><div style="font-weight:600;margin-bottom:6px;"><strong>' + eq.id + '.</strong> ' + eq.text + '</div>' +
                    eq.options.map(function (o) { return '<div style="margin:3px 0 3px 15px;"><strong>' + o.letter + ')</strong> ' + o.text + '</div>'; }).join('') + '</div>';
                  eqi++;
                }
              }
              var extractHtml = `
                <div class="extract-box">
                  <div class="extract-title">${ext.title}</div>
                  <div class="extract-content">${extractQuestionsHtml}</div>
                </div>
              `;
              var extractCanvas = await renderBlockToCanvas(extractHtml);
              await addCanvasToPDF(extractCanvas, false);
            }
          }
          else if (part.type === 'sentence-completion') {
            // Combine part header + passage
            var passContent = part.passageContent.replace(/<span class="gap-input"[^>]*>_+\(\d+\)_+<\/span>/g, '________');
            var passHtml = partHeaderHtml + `
              <div class="passage-box">
                <div class="passage-title">${part.passageTitle}</div>
                <div class="passage-content">${passContent}</div>
              </div>
            `;
            var passCanvas = await renderBlockToCanvas(passHtml);
            await addCanvasWithQR(passCanvas, qrCodeBase64, false);
          }
          else {
            // Default: just render part header for unknown types
            var defaultCanvas = await renderBlockToCanvas(partHeaderHtml);
            await addCanvasWithQR(defaultCanvas, qrCodeBase64, false);
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
            <h2 style="font-size:20px;color:#0d9488;border-bottom:3px solid #0d9488;padding-bottom:10px;margin-bottom:15px;">рџ“ќ ANSWER KEY</h2>
            <div style="font-size:12px;color:#64748b;">${TEST_DATA.testInfo.title}</div>
          </div>
        `;
        var ansHeaderCanvas = await renderBlockToCanvas(ansHeaderHtml);
        await addCanvasToPDF(ansHeaderCanvas, false);

        // Collect all answers
        var allAnswers = {};
        TEST_DATA.parts.forEach(function (part) {
          if (part.answers) {
            Object.keys(part.answers).forEach(function (qId) {
              var ans = part.answers[qId];
              allAnswers[qId] = Array.isArray(ans) ? ans[0] : ans;
            });
          }
        });

        // Answer grid
        var ansGridHtml = '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;">';
        for (var i = 1; i <= TEST_DATA.testInfo.totalQuestions; i++) {
          var answer = allAnswers[i] || 'вЂ”';
          ansGridHtml += '<div style="display:inline-block;width:18%;padding:10px 6px;border:1px solid #e2e8f0;border-radius:4px;text-align:center;font-size:13px;background:#f8fafc;"><strong style="color:#0d9488;">' + i + '.</strong> <span style="color:#1e293b;font-weight:600;">' + answer + '</span></div>';
        }
        ansGridHtml += '</div>';
        var ansGridCanvas = await renderBlockToCanvas(ansGridHtml);
        await addCanvasToPDF(ansGridCanvas, false);

        // Copyright notice
        var copyrightHtml = `
          <div style="margin-top:30px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#64748b;">
            <div style="margin-bottom:8px;">В© ${currentYear} <strong style="color:#0d9488;">${line1}</strong>. All Rights Reserved.</div>
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
          var copyrightText = 'В© ' + currentYear + ' ' + line1 + '. All rights reserved. Unauthorized reproduction prohibited.';
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
      setTimeout(function () {
        toast.style.opacity = '1';
        toast.style.transform = 'translate(-50%,-50%) scale(1)';
      }, 10);

      // Auto remove after 2.5 seconds
      setTimeout(function () {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%,-50%) scale(0.8)';
        setTimeout(function () { toast.remove(); }, 300);
      }, 2500);
    }

    // Add spin animation
    var spinStyle = document.createElement('style');
    spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(spinStyle);

    // ===== TEXT HIGHLIGHTING =====
    (function initHighlighting() {
      let longPressTimer = null;
      let isLongPress = false;

      function getHighlightColor(element) {
        if (element.closest('.question-card') || element.closest('.options-list') || element.closest('.mcq-question')) {
          return 'highlight-green';
        }
        return 'highlight-yellow';
      }

      function highlightSelection(highlightClass) {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !selection.toString().trim()) return;

        try {
          const range = selection.getRangeAt(0);
          const container = range.commonAncestorContainer;
          const parentEl = container.nodeType === 3 ? container.parentElement : container;
          if (parentEl.closest('input, select, button, textarea')) return;

          if (parentEl.classList && (parentEl.classList.contains('highlight-yellow') || parentEl.classList.contains('highlight-green'))) {
            const text = parentEl.textContent;
            const textNode = document.createTextNode(text);
            parentEl.parentNode.replaceChild(textNode, parentEl);
            selection.removeAllRanges();
            return;
          }

          const highlightSpan = document.createElement('span');
          highlightSpan.className = highlightClass;
          range.surroundContents(highlightSpan);
          selection.removeAllRanges();
        } catch (e) {
          console.log('Cannot highlight across elements');
        }
      }

      document.addEventListener('dblclick', function (e) {
        if (e.target.closest('input, select, button, textarea, a, canvas')) return;
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
          const highlightClass = getHighlightColor(e.target);
          setTimeout(() => highlightSelection(highlightClass), 10);
        }
      });

      let mouseDownTarget = null;
      document.addEventListener('mousedown', function (e) {
        mouseDownTarget = e.target;
      });

      document.addEventListener('mouseup', function (e) {
        if (e.button !== 0) return;
        if (e.target.closest('input, select, button, textarea, a, canvas')) return;
        setTimeout(function () {
          const selection = window.getSelection();
          if (selection && selection.toString().trim().length > 1) {
            const selText = selection.toString().trim();
            if (selText.includes(' ') || selText.length > 3) {
              const highlightClass = getHighlightColor(mouseDownTarget || e.target);
              highlightSelection(highlightClass);
            }
          }
        }, 50);
      });

      document.addEventListener('touchstart', function (e) {
        if (e.target.closest('input, select, button, textarea, a, canvas')) return;
        isLongPress = false;
        longPressTimer = setTimeout(function () {
          isLongPress = true;
          setTimeout(function () {
            const selection = window.getSelection();
            if (selection && selection.toString().trim()) {
              const highlightClass = getHighlightColor(e.target);
              highlightSelection(highlightClass);
            }
          }, 100);
        }, 500);
      }, { passive: true });

      document.addEventListener('touchend', function (e) {
        if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
      }, { passive: true });

      document.addEventListener('touchmove', function (e) {
        if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
      }, { passive: true });
    })();



    // ===== CUSTOM AUDIO PLAYER =====
    (function initAudioPlayer() {
      const audio = document.getElementById('listeningAudio');
      const hiddenAudio = document.getElementById('hiddenAudio');

      // UI Element Collections (Sync desktop header and mobile bar)
      const playPauseBtns = document.querySelectorAll('.play-pause-btn');
      const progressBars = document.querySelectorAll('.audio-progress');
      const progressFills = document.querySelectorAll('.audio-progress-fill');
      const currentTimeEls = document.querySelectorAll('#currentTime, .mob-current-time');
      const durationEls = document.querySelectorAll('#duration, .mob-duration');
      const volumeBtns = document.querySelectorAll('.volume-btn');
      const volumeSliders = document.querySelectorAll('.volume-slider');
      const speedBtns = document.querySelectorAll('.speed-btn');

      // Loading/Ready UI (usually unique in header, but handled safely)
      const loadingWrapper = document.getElementById('audioLoadingWrapper');
      const loadingText = document.getElementById('audioLoadingText');
      const loadingProgress = document.getElementById('audioLoadingProgress');
      const readyNotice = document.getElementById('audioReadyNotice');
      const playerControls = document.getElementById('audioPlayerControls');

      if (!audio) return;

      const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
      let speedIndex = 2;
      let isAudioReady = false;
      let currentLoadedPart = 0;
      let soundingPartIndex = 0;
      let hasPerPartAudio = false;

      function checkPerPartAudio() {
        if (window.TEST_DATA && window.TEST_DATA.parts) {
          hasPerPartAudio = window.TEST_DATA.parts.some(p => p.audioFile && p.audioFile.trim() !== '');
        }
        return hasPerPartAudio;
      }

      window.loadPartAudio = function (partIndex, autoPlay = true) {
        if (autoPlay) {
          hiddenAudio.pause();
          soundingPartIndex = partIndex;
        } else if (!audio.paused) {
          // Hand off to background if browsing
          hiddenAudio.src = audio.src;
          hiddenAudio.currentTime = audio.currentTime;
          hiddenAudio.volume = audio.volume;
          hiddenAudio.playbackRate = audio.playbackRate;
          hiddenAudio.play().catch(() => { });
        }

        if (!hasPerPartAudio) checkPerPartAudio();
        if (!hasPerPartAudio) return;

        if (currentLoadedPart === partIndex && soundingPartIndex === partIndex && !audio.paused) return;

        const part = window.TEST_DATA.parts[partIndex];
        if (!part || !part.audioFile) return;

        currentLoadedPart = partIndex;
        window.updateNavIndicators();

        const partNum = part.partNumber || (partIndex + 1);
        const audioUrl = (window.preloadedAudios && window.preloadedAudios[partNum]) || part.audioFile;

        // Reset UI Sync
        currentTimeEls.forEach(el => el.textContent = '00:00');
        progressFills.forEach(el => el.style.width = '0%');
        durationEls.forEach(el => el.textContent = '00:00');

        audio.src = audioUrl;
        audio.currentTime = 0;

        if (loadingWrapper) loadingWrapper.classList.add('hidden');
        if (playerControls) playerControls.classList.add('ready');
        isAudioReady = true;

        if (autoPlay) {
          audio.play().catch(waitForClick);
        }

        function waitForClick() {
          document.addEventListener('click', () => audio.play(), { once: true });
        }
      };

      window.updateNavIndicators = function () {
        if (!window.TEST_DATA || !window.TEST_DATA.parts) return;
        document.querySelectorAll('.part-btn').forEach((btn, i) => {
          const partIdx = i % window.TEST_DATA.parts.length;
          btn.classList.toggle('active', partIdx === currentPart);
          btn.classList.toggle('playing', partIdx === soundingPartIndex);
        });
        // Sync mobile dots too
        document.querySelectorAll('.mobile-part-dot').forEach((dot, i) => {
          dot.classList.toggle('playing', i === soundingPartIndex);
        });
      };

      audio.addEventListener('play', () => {
        hiddenAudio.pause();
        soundingPartIndex = currentLoadedPart;
        window.updateNavIndicators();
      });

      audio.addEventListener('pause', () => {
        if (soundingPartIndex === currentLoadedPart) window.updateNavIndicators();
      });

      function formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
      }

      // Sync Audio Events to ALL UI elements
      audio.addEventListener('loadedmetadata', () => {
        const timeStr = formatTime(audio.duration);
        durationEls.forEach(el => el.textContent = timeStr);
      });

      audio.addEventListener('play', () => {
        playPauseBtns.forEach(btn => btn.innerHTML = 'вЏё');
      });

      audio.addEventListener('pause', () => {
        playPauseBtns.forEach(btn => btn.innerHTML = 'в–¶');
      });

      audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
          const percent = (audio.currentTime / audio.duration) * 100;
          progressFills.forEach(el => el.style.width = percent + '%');
          const timeStr = formatTime(audio.currentTime);
          currentTimeEls.forEach(el => el.textContent = timeStr);
        }
      });

      // User Interactions
      playPauseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          if (audio.paused) audio.play().catch(() => { });
          else audio.pause();
        });
      });

      progressBars.forEach(bar => {
        bar.addEventListener('click', function (e) {
          if (audio.duration) {
            const rect = this.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audio.currentTime = percent * audio.duration;
          }
        });
      });

      volumeSliders.forEach(slider => {
        slider.addEventListener('input', function () {
          const val = this.value;
          audio.volume = val;
          if (hiddenAudio) hiddenAudio.volume = val;
          volumeSliders.forEach(s => s.value = val);
          volumeBtns.forEach(b => b.innerHTML = val == 0 ? 'рџ”‡' : 'рџ”Љ');
        });
      });

      speedBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          speedIndex = (speedIndex + 1) % speeds.length;
          const newSpeed = speeds[speedIndex];
          audio.playbackRate = newSpeed;
          if (hiddenAudio) hiddenAudio.playbackRate = newSpeed;
          speedBtns.forEach(b => b.textContent = newSpeed + 'x');
        });
      });

      // Auto-Advance Logic
      let lastAutoAdvanceTime = 0;
      function handleAudioEnded() {
        const now = Date.now();
        if (now - lastAutoAdvanceTime < 2000) return;
        if (soundingPartIndex < window.TEST_DATA.parts.length - 1) {
          lastAutoAdvanceTime = now;
          const nextPart = soundingPartIndex + 1;
          if (window.showPart) window.showPart(nextPart);
          window.loadPartAudio(nextPart, true);
        } else {
          soundingPartIndex = -1;
          window.updateNavIndicators();
        }
      }

      audio.addEventListener('ended', handleAudioEnded);
      if (hiddenAudio) hiddenAudio.addEventListener('ended', handleAudioEnded);

      // Startup Logic
      function initAudioLoading() {
        if (!window.TEST_DATA || !window.audioPreloadComplete) {
          setTimeout(initAudioLoading, 200);
          return;
        }
        if (checkPerPartAudio()) {
          const firstPart = window.TEST_DATA.parts[0];
          const partNum = firstPart.partNumber || 1;
          const audioUrl = (window.preloadedAudios && window.preloadedAudios[partNum]) || firstPart.audioFile;
          audio.src = audioUrl;
          if (loadingWrapper) loadingWrapper.classList.add('hidden');
          if (playerControls) playerControls.classList.add('ready');
          isAudioReady = true;
          window.updateNavIndicators();
          showReadyPopup();
        }
      }

      function showReadyPopup() {
        const popup = document.getElementById('readyPopup');
        const countdownEl = document.getElementById('countdownNumber');
        const startBtn = document.getElementById('startNowBtn');
        const waitBtn = document.getElementById('waitBtn');
        if (!popup) return;
        popup.style.display = 'flex';
        let countdown = 5;
        const countdownInterval = setInterval(() => {
          countdown--;
          if (countdownEl) countdownEl.textContent = countdown;
          if (countdown <= 0) {
            clearInterval(countdownInterval);
            popup.style.display = 'none';
            audio.play();
          }
        }, 1000);
        [startBtn, waitBtn].forEach(btn => {
          if (btn) btn.addEventListener('click', () => {
            clearInterval(countdownInterval);
            popup.style.display = 'none';
            if (btn === startBtn) {
              audio.play();
            }
          });
        });
      }

      setTimeout(initAudioLoading, 500);

      // Progress/Buffering UI
      audio.addEventListener('progress', () => {
        if (audio.buffered.length > 0 && audio.duration && loadingProgress) {
          const percent = (audio.buffered.end(0) / audio.duration) * 100;
          loadingProgress.style.width = (70 + percent * 0.3) + '%';
        }
      });

      audio.addEventListener('canplaythrough', () => {
        if (!isAudioReady) {
          isAudioReady = true;
          if (loadingProgress) loadingProgress.style.width = '100%';
          setTimeout(() => {
            if (loadingWrapper) loadingWrapper.classList.add('hidden');
            if (readyNotice) readyNotice.classList.add('show');
            setTimeout(() => {
              if (readyNotice) readyNotice.classList.remove('show');
              if (playerControls) playerControls.classList.add('ready');
            }, 1500);
          }, 500);
        }
      });
    })();

    // ===== MAP DRAWING FUNCTIONALITY =====
    (function initMapDrawing() {
      let canvas, ctx, isDrawing = false, isPenEnabled = false;
      let currentColor = '#ef4444';
      let lastX = 0, lastY = 0;
      let eventsAttached = false;

      function resizeCanvasOnly() {
        canvas = document.getElementById('mapDrawingCanvas');
        if (!canvas) return;
        const img = document.getElementById('mapImage');
        if (!img) return;

        function doResize() {
          canvas.width = img.offsetWidth;
          canvas.height = img.offsetHeight;
        }

        if (img.complete) doResize();
        else img.onload = doResize;

        if (!ctx) {
          ctx = canvas.getContext('2d');
        }
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = currentColor;

        // Set canvas disabled state to match current isPenEnabled
        canvas.classList.toggle('disabled', !isPenEnabled);

        if (!eventsAttached) {
          eventsAttached = true;
          attachEvents();
        }
      }

      function attachEvents() {
        // Pen toggle button
        const penBtn = document.getElementById('btnPen');
        if (penBtn) {
          penBtn.addEventListener('click', function () {
            isPenEnabled = !isPenEnabled;
            penBtn.classList.toggle('active', isPenEnabled);
            if (canvas) canvas.classList.toggle('disabled', !isPenEnabled);
          });
        }

        // Clear button
        const clearBtn = document.getElementById('btnClearCanvas');
        if (clearBtn) {
          clearBtn.addEventListener('click', function () {
            if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
          });
        }

        // Mouse drawing
        document.addEventListener('mousedown', function (e) {
          if (!isPenEnabled || !canvas) return;
          if (!canvas.contains(e.target)) return;
          isDrawing = true;
          const rect = canvas.getBoundingClientRect();
          lastX = e.clientX - rect.left;
          lastY = e.clientY - rect.top;
        });

        document.addEventListener('mousemove', function (e) {
          if (!isDrawing || !isPenEnabled || !canvas) return;
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          ctx.beginPath();
          ctx.moveTo(lastX, lastY);
          ctx.lineTo(x, y);
          ctx.stroke();
          lastX = x;
          lastY = y;
        });

        document.addEventListener('mouseup', () => isDrawing = false);

        // Touch drawing
        document.addEventListener('touchstart', function (e) {
          if (!isPenEnabled || !canvas) return;
          if (!canvas.contains(e.target)) return;
          e.preventDefault();
          isDrawing = true;
          const rect = canvas.getBoundingClientRect();
          const touch = e.touches[0];
          lastX = touch.clientX - rect.left;
          lastY = touch.clientY - rect.top;
        }, { passive: false });

        document.addEventListener('touchmove', function (e) {
          if (!isDrawing || !isPenEnabled || !canvas) return;
          e.preventDefault();
          const rect = canvas.getBoundingClientRect();
          const touch = e.touches[0];
          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;
          ctx.beginPath();
          ctx.moveTo(lastX, lastY);
          ctx.lineTo(x, y);
          ctx.stroke();
          lastX = x;
          lastY = y;
        }, { passive: false });

        document.addEventListener('touchend', () => isDrawing = false);
      }

      // Setup canvas when any part is shown (resize only, no re-binding)
      const originalShowPart = window.showPart || function () { };
      window.showPart = function (index) {
        originalShowPart(index);
        setTimeout(resizeCanvasOnly, 100);
      };

      // Also setup on initial load if Part 4 is visible
      setTimeout(resizeCanvasOnly, 500);
    })();
    // ===== ZOOM MAGNIFIER =====
    (function initZoom() {
      const zoomBtn = document.getElementById('btnZoom');
      if (!zoomBtn) return;

      const zoomLevels = [1, 1.15, 1.3, 1.45];
      let zoomIndex = 0;

      // Inject zoom styles вЂ” uses CSS zoom for universal scaling, images excluded
      const zoomStyle = document.createElement('style');
      zoomStyle.textContent = `
        #mainContent.zoom-1 { zoom: 1.15; }
        #mainContent.zoom-2 { zoom: 1.3; }
        #mainContent.zoom-3 { zoom: 1.45; }
        #mainContent.zoom-1 img,
        #mainContent.zoom-2 img,
        #mainContent.zoom-3 img {
          zoom: 1;
          max-width: 100%;
        }
      `;
      document.head.appendChild(zoomStyle);

      zoomBtn.addEventListener('click', function () {
        const mc = document.getElementById('mainContent');
        if (!mc) return;

        // Remove previous zoom class
        mc.classList.remove('zoom-1', 'zoom-2', 'zoom-3');

        zoomIndex = (zoomIndex + 1) % zoomLevels.length;

        if (zoomIndex > 0) {
          mc.classList.add('zoom-' + zoomIndex);
        }

        // Update badge
        let badge = zoomBtn.querySelector('.zoom-level');
        if (zoomIndex === 0) {
          if (badge) badge.remove();
          zoomBtn.title = 'Zoom In';
        } else {
          if (!badge) {
            badge = document.createElement('span');
            badge.className = 'zoom-level';
            zoomBtn.appendChild(badge);
          }
          badge.textContent = zoomIndex;
          zoomBtn.title = Math.round(zoomLevels[zoomIndex] * 100) + '%';
        }
      });
    })();

    // ===== LEAVE WARNING PROTECTION =====
    let testInProgress = false;
    window.__okToLeave = false;

    // Mark test as in progress when timer starts
    const originalStartTimer = startTimer;
    startTimer = function () {
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
              <span style="font-size: 40px;">вљ пёЏ</span>
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
              ">вњ“ Continue Test</button>
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

      document.getElementById('leaveStayBtn').addEventListener('click', function () {
        hideLeaveWarningModal();
      });

      document.getElementById('leaveConfirmBtn').addEventListener('click', function () {
        window.__okToLeave = true;
        var pendingAction = window.__pendingLeaveAction;
        hideLeaveWarningModal();
        if (typeof pendingAction === 'function') {
          pendingAction();
          return;
        }
        sessionStorage.setItem('listeningMockReturnCategory', 'cefr-listening');
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

      window.addEventListener('popstate', function (e) {
        if (testInProgress && !isReviewMode && !window.__okToLeave) {
          history.pushState(null, '', location.href);
          showLeaveWarningModal();
        }
      });
    }

    // Keyboard shortcuts blocking (F5, Ctrl+R, Ctrl+W)
    window.addEventListener('keydown', function (e) {
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
    window.addEventListener('beforeunload', function (e) {
      if (testInProgress && !isReviewMode && !window.__okToLeave) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    });

    // Initialize back button trap on load
    setupBackButtonTrap();

    // ===== MOBILE FAB & TOOLS MENU LOGIC =====
    var fabIdleTimer;
    function resetFabIdle() {
      var fab = document.getElementById('mobileFab');
      if (fab) {
        fab.classList.remove('idle');
        clearTimeout(fabIdleTimer);
        if (!document.getElementById('mobileToolsMenu').classList.contains('active')) {
          fabIdleTimer = setTimeout(function () {
            fab.classList.add('idle');
          }, 5000);
        }
      }
    }

    function handleFabFinish() {
      // Close the FAB menu first
      var menu = document.getElementById('mobileToolsMenu');
      var fab = document.getElementById('mobileFab');
      var overlay = document.getElementById('mobileMenuOverlay');
      if (menu && menu.classList.contains('active')) {
        menu.classList.remove('active');
        if (fab) fab.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        resetFabIdle();
      }
      // If already submitted, restore the results overlay; otherwise show confirm dialog
      if (hasSubmitted) {
        restoreResults();
      } else {
        document.getElementById('confirmModal').classList.add('active');
      }
    }

    function toggleMobileMenu() {
      var menu = document.getElementById('mobileToolsMenu');
      var fab = document.getElementById('mobileFab');
      var overlay = document.getElementById('mobileMenuOverlay');
      if (menu && fab) {
        var isActive = menu.classList.toggle('active');
        fab.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');

        if (isActive) {
          fab.classList.remove('idle');
          clearTimeout(fabIdleTimer);
          updateMobileMenuStatus();
        } else {
          resetFabIdle();
        }
      }
    }

    function updateMobileMenuStatus() {
      // Sync Timer
      const timerDisplay = document.getElementById('timerDisplay');
      const mobileTimer = document.getElementById('mobileTimer');
      if (timerDisplay && mobileTimer) mobileTimer.textContent = timerDisplay.textContent;

      // Sync Part Tabs
      const mobilePartTabs = document.getElementById('mobilePartTabs');
      if (mobilePartTabs && window.TEST_DATA) {
        mobilePartTabs.innerHTML = window.TEST_DATA.parts.map((part, i) => {
          const isActive = i === currentPart;
          return `<div class="part-tab ${isActive ? 'active' : ''}" onclick="showPart(${i}); toggleMobileMenu();">Part ${i + 1}</div>`;
        }).join('');
      }

      // Sync Zoom Badge
      const mobZoomBadge = document.getElementById('mobZoomBadge');
      if (mobZoomBadge) {
        const pcBadge = document.querySelector('#btnZoom .zoom-level');
        if (pcBadge) {
          mobZoomBadge.textContent = pcBadge.textContent;
          mobZoomBadge.style.display = 'flex';
        } else {
          mobZoomBadge.style.display = 'none';
        }
      }
    }

    // Close menu only when tapping the overlay
    (function() {
      var overlay = document.getElementById('mobileMenuOverlay');
      if (overlay) overlay.addEventListener('click', function() { toggleMobileMenu(); });
    })();

    function initDraggable(el) {
      var isDragging = false;
      var startX, startY, initialLeft, initialTop;
      var hasMoved = false;

      // Always start FAB at bottom-right (CSS default)
      localStorage.removeItem('mobileFabPos_CEFR_Listening');

      function onStart(e) {
        if (document.getElementById('mobileToolsMenu').classList.contains('active')) return;
        isDragging = true;
        hasMoved = false;
        var clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        var clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        startX = clientX;
        startY = clientY;
        var rect = el.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        el.style.transition = 'none';
        if (e.type === 'mousedown') document.addEventListener('mousemove', onMove);
        if (e.type === 'touchstart') document.addEventListener('touchmove', onMove, { passive: false });
      }

      function onMove(e) {
        if (!isDragging) return;
        if (e.type === 'touchmove') e.preventDefault();
        var clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        var clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        var dx = clientX - startX;
        var dy = clientY - startY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved = true;
        var newLeft = initialLeft + dx;
        var newTop = initialTop + dy;
        var margin = 10;
        newLeft = Math.max(margin, Math.min(newLeft, window.innerWidth - el.offsetWidth - margin));
        newTop = Math.max(margin, Math.min(newTop, window.innerHeight - el.offsetHeight - margin));
        el.style.left = newLeft + 'px';
        el.style.top = newTop + 'px';
        el.style.bottom = 'auto';
        el.style.right = 'auto';
      }

      function onEnd() {
        if (!isDragging) return;
        isDragging = false;
        el.style.transition = '';
        var rect = el.getBoundingClientRect();
        var pos = {};
        if (rect.top < window.innerHeight / 2) {
          pos.top = rect.top;
          el.style.top = pos.top + 'px';
          el.style.bottom = 'auto';
        } else {
          pos.bottom = window.innerHeight - rect.bottom;
          el.style.bottom = pos.bottom + 'px';
          el.style.top = 'auto';
        }
        if (rect.left < window.innerWidth / 2) {
          pos.left = rect.left;
          el.style.left = pos.left + 'px';
          el.style.right = 'auto';
        } else {
          pos.right = window.innerWidth - rect.right;
          el.style.right = pos.right + 'px';
          el.style.left = 'auto';
        }
        localStorage.setItem('mobileFabPos_CEFR_Listening', JSON.stringify(pos));
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('touchmove', onMove);
        resetFabIdle();
      }

      el.addEventListener('mousedown', onStart);
      el.addEventListener('touchstart', onStart, { passive: true });
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchend', onEnd);

      // Simple Click vs Drag logic
      el.querySelector('#mobileFab').addEventListener('click', function (e) {
        resetFabIdle();
        if (hasMoved) {
          e.stopImmediatePropagation();
          e.preventDefault();
        } else {
          toggleMobileMenu();
        }
      });
    }

    // Initialize FAB
    document.addEventListener('DOMContentLoaded', function () {
      var fabContainer = document.getElementById('mobileFabContainer');
      if (fabContainer) initDraggable(fabContainer);
      resetFabIdle();

      // Hook into existing Zoom logic
      var mobZoomBtn = document.getElementById('mobileZoomBtn');
      var pcZoomBtn = document.getElementById('btnZoom');
      if (mobZoomBtn && pcZoomBtn) {
        mobZoomBtn.addEventListener('click', function () {
          pcZoomBtn.click();
          updateMobileMenuStatus();
        });
      }
      
      // Sync Playback Controls
      initMobilePlaybackSync();
    });

    function initMobilePlaybackSync() {
      const audio = document.getElementById('listeningAudio');
      const pcPlayBtn = document.getElementById('playPauseBtn');
      const mobMenuPlayBtn = document.getElementById('mobMenuPlayBtn');
      const mobMenuProgressFill = document.getElementById('mobMenuProgressFill');
      const mobMenuProgressBar = document.getElementById('mobMenuProgressBar');
      const mobMenuCurrentTime = document.getElementById('mobMenuCurrentTime');
      const mobMenuDuration = document.getElementById('mobMenuDuration');
      const mobMenuSpeedBtn = document.getElementById('mobMenuSpeedBtn');
      const pcSpeedBtn = document.getElementById('speedBtn');

      if (!audio || !mobMenuPlayBtn) return;

      // Play/Pause Sync
      mobMenuPlayBtn.addEventListener('click', () => { if (pcPlayBtn) pcPlayBtn.click(); });
      
      const updateIcons = () => {
        mobMenuPlayBtn.textContent = audio.paused ? 'в–¶' : 'вЏё';
      };
      audio.addEventListener('play', updateIcons);
      audio.addEventListener('pause', updateIcons);
      
      // Progress Sync
      audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        const percent = (audio.currentTime / audio.duration) * 100;
        if (mobMenuProgressFill) mobMenuProgressFill.style.width = percent + '%';
        if (mobMenuCurrentTime) mobMenuCurrentTime.textContent = formatTime(audio.currentTime);
        if (mobMenuDuration) mobMenuDuration.textContent = formatTime(audio.duration);
      });

      function formatTime(secs) {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      }

      // Seek Sync
      if (mobMenuProgressBar) {
        mobMenuProgressBar.addEventListener('click', (e) => {
          const rect = mobMenuProgressBar.getBoundingClientRect();
          const pos = (e.clientX - rect.left) / rect.width;
          audio.currentTime = pos * audio.duration;
        });
      }

      // Speed Sync
      if (mobMenuSpeedBtn && pcSpeedBtn) {
        mobMenuSpeedBtn.addEventListener('click', () => {
          pcSpeedBtn.click();
          mobMenuSpeedBtn.textContent = pcSpeedBtn.textContent;
        });
        mobMenuSpeedBtn.textContent = pcSpeedBtn.textContent;
      }
    }
  