
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

    // Initialize back button trap on load
    setupBackButtonTrap();


    function goBack() {
      sessionStorage.setItem('listeningMockReturnCategory', 'ielts-listening');
      window.__okToLeave = true;
      _navToLanding();
    }
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

    function goBack() {
      sessionStorage.setItem('listeningMockReturnCategory', 'ielts-listening');
      window.__okToLeave = true;
      _navToLanding();
    }
      var startX, startY, initialLeft, initialTop;
      var hasMoved = false;

      // Always start FAB at bottom-right (CSS default)
      localStorage.removeItem('mobileFabPos_Listening');

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
        localStorage.setItem('mobileFabPos_Listening', JSON.stringify(pos));
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

    // ===== PLACEHOLDER - SCRIPT WILL BE ADDED IN NEXT BATCH =====
    const urlParams = new URLSearchParams(window.location.search);
    const testFile = urlParams.get('test') || 'ielts-listening-test-01';
    const isFullMock = urlParams.get('fullMock') === 'true';
    if (isFullMock) document.body.classList.add('is-full-mock');

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
    // Build a quick lookup map: word -> [variant1, variant2, ...]
    const _spellingMap = {};
    SPELLING_PAIRS.forEach(function(pair) {
      pair.forEach(function(w, i) {
        var wl = w.toLowerCase();
        if (!_spellingMap[wl]) _spellingMap[wl] = [];
        pair.forEach(function(v, j) { if (i !== j && _spellingMap[wl].indexOf(v.toLowerCase()) === -1) _spellingMap[wl].push(v.toLowerCase()); });
      });
      // Also handle plurals (add 's') and past tenses for key pairs
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

    const _logoEl = document.getElementById('logoImg');
    if (_logoEl) _logoEl.src = GLOBAL_LOGO_URL;
    const mockNum = testFile.match(/(\d+)/) ? testFile.match(/(\d+)/)[1] : '1';
    document.getElementById('mockNumber').textContent = 'в„–' + mockNum;

    // Load test
    function loadTest() {
      const script = document.createElement('script');
      script.src = 'questions IELTS L/' + testFile + '.js';
      script.onload = () => {
        if (window.IELTS_LISTENING_TEST) {
          TEST_DATA = window.IELTS_LISTENING_TEST;
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
          let settled = false;

          function done() {
            if (settled) return;
            settled = true;
            loadedCount++;
            const progress = (loadedCount / totalParts) * 100;
            audioPreloadProgress.style.width = progress + '%';
            audioPreloadDetail.textContent = loadedCount + ' / ' + totalParts + ' parts loaded';
            // Store preloaded audio URL
            window.preloadedAudios[part.partNumber || (index + 1)] = part.audioFile;
            resolve();
          }

          audio.addEventListener('canplaythrough', function onCanPlay() {
            audio.removeEventListener('canplaythrough', onCanPlay);
            audio.pause();
            audio.currentTime = 0;
            audio.muted = false;
            audioPreloadText.textContent = 'Loading Part ' + (index + 1) + ' audio... вњ“';
            done();
          });

          audio.addEventListener('error', function () {
            console.log('Failed to preload Part ' + (index + 1) + ' audio');
            done();
          });

          // Timeout: if canplaythrough doesn't fire within 15s, continue anyway
          setTimeout(function () {
            if (!settled) {
              console.log('Timeout preloading Part ' + (index + 1) + ' audio вЂ” continuing');
              audioPreloadText.textContent = 'Part ' + (index + 1) + ' audio timeout вЂ” continuing...';
              done();
            }
          }, 15000);

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
      window.__testStartTime = new Date();
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

    function generatePartNav() {
      const btnHtml = TEST_DATA.parts.map((part, i) =>
        '<button class="part-btn" data-part="' + i + '">' + part.title + '</button>'
      ).join('');

      // Populate PC part nav (desktop header)
      const pcNav = document.getElementById('partNavPC');
      if (pcNav) {
        pcNav.innerHTML = btnHtml;
        pcNav.querySelectorAll('.part-btn').forEach(btn => {
          btn.addEventListener('click', () => showPart(parseInt(btn.dataset.part)));
        });
      }

      // Generate mobile part navigation (circular numbered dots)
      const mobileNav = document.getElementById('mobilePartNav');
      if (mobileNav) {
        const totalParts = TEST_DATA.parts.length;
        let html = '';
        for (let i = 0; i < totalParts; i++) {
          html += '<div class="mobile-part-dot" data-part="' + i + '">' + (i + 1) + '</div>';
        }
        mobileNav.innerHTML = html;
        mobileNav.querySelectorAll('.mobile-part-dot').forEach(dot => {
          dot.addEventListener('click', () => showPart(parseInt(dot.dataset.part)));
        });
      }

      // Ensure Part 1 is visible on mobile by scrolling nav to start
      setTimeout(() => {
        const nav = document.getElementById('mobilePartNav');
        if (nav) nav.scrollLeft = 0;
      }, 100);
    }

    function generateParts() {
      const main = document.getElementById('mainContent');
      main.innerHTML = TEST_DATA.parts.map((part, i) => '<div class="part-section" id="part' + i + '">' + renderPart(part, i) + '</div>').join('');
    }

    function renderSectionContent(data) {
      if (data.type === 'mcq-reply' || data.type === 'mcq') {
        return data.questions.map(q => renderMCQ(q)).join('');
      } else if (data.type === 'mcq-multi') {
        var qIds = (data.questionIds || []).join(',');
        var idLabel = (data.questionIds || []).join(' & ');
        var numMerged = data.questionIds ? data.questionIds.length : 2;
        var html = '<div class="question-card merged-mcq" data-qids="' + qIds + '">';
        html += '<span class="merged-mcq-label">Q' + idLabel + '</span>';
        html += '<div class="merged-mcq-hint">Select exactly ' + numMerged + ' answers (accepted in any order)</div>';
        html += '<div class="options-list">';
        (data.options || []).forEach(function (opt) {
          html += '<label class="option-item" data-qids="' + qIds + '" data-val="' + opt.letter + '">' +
            '<input type="checkbox" name="merged-' + qIds + '" value="' + opt.letter + '" ' +
            'onchange="handleMergedMcqL(this, \'' + qIds + '\')">' +
            '<span class="option-letter">' + opt.letter + '</span>' +
            '<span class="option-text">' + opt.text + '</span></label>';
        });
        html += '</div></div>';
        return html;
      } else if (data.type === 'gap-fill-form') {
        return renderFormGapFill(data);
      } else if (data.type === 'matching-speakers') {
        return renderMatchingSpeakers(data);
      } else if (data.type === 'map-labeling') {
        return renderMapLabeling(data);
      } else if (data.type === 'mcq-extracts') {
        return renderExtracts(data);
      } else if (data.type === 'sentence-completion') {
        return renderSentenceCompletion(data);
      } else if (data.type === 'table-completion') {
        return renderTableCompletion(data);
      } else if (data.type === 'flowchart') {
        return renderFlowchart(data);
      }
      return '';
    }

    function renderFlowchart(part) {
      // Draggable options box (reuses dnd-matching styles)
      let html = '<div class="dnd-matching-container"><div class="dnd-options-box flow-dnd-options">';
      part.options.forEach(opt => {
        html += '<div class="dnd-option-item" data-letter="' + opt.letter + '" draggable="true"><strong>' + opt.letter + '</strong> ' + opt.text + '</div>';
      });
      html += '</div>';

      html += '<div class="flowchart-container">';
      part.steps.forEach((step, idx) => {
        html += '<div class="flow-step">' + step.text.replace(/(\d+)/, function(m, qNum) {
          return '<span class="gap-label">(' + qNum + ')</span> ' +
            '<span class="dnd-drop-zone flow-drop-zone" data-q="' + qNum + '">tap to fill</span>' +
            '<input type="hidden" class="gap-input dnd-hidden-input" data-q="' + qNum + '" id="q' + qNum + '">';
        }) + '</div>';
        if (idx < part.steps.length - 1) {
          html += '<div class="flow-arrow">в†“</div>';
        }
      });
      html += '</div></div>';
      return html;
    }

    function renderTableCompletion(part) {
      let html = '<div class="table-container">';
      if (part.tableTitle) html += '<div class="form-title" style="margin-bottom:15px; font-weight:700; color:var(--primary);">' + part.tableTitle + '</div>';
      html += '<table class="listening-table"><thead><tr>';
      part.headers.forEach(h => html += '<th>' + h + '</th>');
      html += '</tr></thead><tbody>';
      part.rows.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
          html += '<td>';
          if (typeof cell === 'string') {
            html += cell;
          } else if (cell && cell.type === 'gap') {
            html += (cell.prefix || '') + ' <span class="gap-label">(' + cell.gapId + ')</span> <input type="text" autocomplete="off" class="gap-input" data-q="' + cell.gapId + '"> ' + (cell.suffix || '');
          }
          html += '</td>';
        });
        html += '</tr>';
      });
      return html + '</tbody></table></div>';
    }

    function renderPart(part, partIndex) {
      let isLastPart = (partIndex === TEST_DATA.parts.length - 1);
      let headerStyle = isLastPart ? ' style="display:flex; justify-content:space-between; align-items:flex-start; gap:20px;"' : '';
      let submitBtnHtml = '';
      let html = '<div class="part-header"' + headerStyle + '><div><h2 class="part-title">рџЋ§ ' + part.title + ' <span style="font-size:13px;color:#64748b;">(Questions ' + part.questionRange + ')</span></h2><p class="part-instruction">' + part.instruction + '</p></div>' + submitBtnHtml + '</div>';

      if (part.type === 'mixed') {
        html += part.subParts.map(sp => {
          let subHead = sp.instruction ? '<div class="sub-instruction" style="margin:20px 0 10px; font-weight:700; color:var(--primary); font-size:15px; border-top:1px dashed #e2e8f0; padding-top:15px;">' + sp.instruction + '</div>' : '';
          return subHead + renderSectionContent(sp);
        }).join('');
      } else {
        html += renderSectionContent(part);
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

      // Support both structured form content (array) and prebuilt HTML (string)
      if (typeof part.formContent === 'string') {
        html += '<div class="form-html">' + part.formContent + '</div>';
        return html + '</div>';
      }

      if (!Array.isArray(part.formContent)) {
        return html + '</div>';
      }

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
      // Drag-and-drop / tap-to-fill matching style
      let html = '<div class="dnd-matching-container">';
      // Options box
      html += '<div class="dnd-options-box">';
      part.options.forEach(o => {
        html += '<div class="dnd-option-item" data-letter="' + o.letter + '" draggable="true"><strong>' + o.letter + '</strong> ' + o.text + '</div>';
      });
      html += '</div>';
      // Questions list
      html += '<div class="dnd-questions-list">';
      part.speakers.forEach(s => {
        html += '<div class="dnd-question-row">';
        html += '<span class="dnd-q-num">' + s.id + '</span>';
        html += '<span class="dnd-q-text">' + s.label + '</span>';
        html += '<span class="dnd-drop-zone" data-q="' + s.id + '">tap to fill</span>';
        html += '<input type="hidden" class="gap-input dnd-hidden-input" data-q="' + s.id + '" id="q' + s.id + '">';
        html += '</div>';
      });
      html += '</div></div>';
      return html;
    }

    function renderMapLabeling(part) {
      // For subparts in mixed sections, use mapTitle as title if title is missing
      const displayTitle = part.title || part.mapTitle || 'Map Labeling';
      const qRange = part.questionRange || (part.questions ? part.questions[0].id + '-' + part.questions[part.questions.length - 1].id : '');

      // Mobile collapsible instructions
      let html = '<div class="map-instructions-toggle" onclick="toggleMapInstructions(this)">';
      html += '<span class="toggle-title">рџ—єпёЏ ' + displayTitle + (qRange ? ' <span style="font-size:11px;color:#64748b;">(Questions ' + qRange + ')</span>' : '') + '</span>';
      html += '<span class="toggle-arrow">в–ј</span>';
      html += '</div>';
      html += '<div class="map-instructions-content">' + (part.instruction || '') + '</div>';

      html += '<div class="map-split-wrapper">';
      // Left panel - Map with canvas overlay
      html += '<div class="map-container">';
      html += '<div class="map-title"><span class="map-title-text">' + (part.mapTitle || 'Map') + '</span>';
      html += '<div class="drawing-toolbar">';
      html += '<button class="drawing-btn active" id="btnPen" title="Draw on map"><span>вњЏпёЏ</span> Pen</button>';
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
          // Detect merged group: consecutive identical questions
          var numMerged = 1;
          while (qi + numMerged < qs.length &&
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
        // fallback
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
      // Cap at maxPicks selections
      if (checked.length > maxPicks) { cb.checked = false; return; }
      // Visual update
      card.querySelectorAll('.option-item').forEach(function (item) {
        var c = item.querySelector('input[type="checkbox"]');
        item.classList.toggle('selected', c && c.checked);
      });
      // Dim when max reached
      var atMax = card.querySelectorAll('input[type="checkbox"]:checked').length >= maxPicks;
      card.querySelectorAll('.option-item').forEach(function (item) {
        var c = item.querySelector('input[type="checkbox"]');
        if (atMax && c && !c.checked) {
          item.classList.add('disabled-option');
        } else {
          item.classList.remove('disabled-option');
        }
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
      document.querySelectorAll('.part-section').forEach((s, i) => s.classList.toggle('active', i === index));
      document.querySelectorAll('.part-btn').forEach(b => b.classList.toggle('active', parseInt(b.dataset.part) === index));
      var _btnPrev = document.getElementById('btnPrev');
      var _btnNext = document.getElementById('btnNext');
      var _btnSubmit = document.getElementById('btnSubmit');
      if (_btnPrev) _btnPrev.style.display = index === 0 ? 'none' : 'flex';
      if (_btnNext) _btnNext.style.display = index === TEST_DATA.parts.length - 1 ? 'none' : 'flex';
      if (_btnSubmit) _btnSubmit.style.display = index === TEST_DATA.parts.length - 1 ? 'flex' : 'none';
      // When manually switching parts, load audio but don't auto-play
      if (window.loadPartAudio) {
        window.loadPartAudio(index, false);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Check if current part has map layout
      const activeSection = document.querySelectorAll('.part-section')[index];
      if (activeSection && activeSection.querySelector('.map-split-wrapper')) {
        document.body.classList.add('map-part-active');
      } else {
        document.body.classList.remove('map-part-active');
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

      // Toggle floating submit on last part (both PC and mobile) вЂ” but not after submission
      const floatingSubmit = document.getElementById('mobileFloatingSubmit');
      if (floatingSubmit) {
        if (index === TEST_DATA.parts.length - 1 && !hasSubmitted) {
          floatingSubmit.classList.add('visible');
        } else {
          floatingSubmit.classList.remove('visible');
        }
      }

      // NOTE: Audio does NOT auto-switch when browsing parts
      // Students can look through questions while listening to current audio
      // Audio only changes when the current part's audio finishes
    }

    function startTimer() {
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

    // ===== FULL MOCK AUTOMATED TRANSITIONS =====
    function startBreakTimer(duration, message, callback) {
      const overlay = document.getElementById('breakOverlay');
      const counter = document.getElementById('breakCountdown');
      const msgEl = document.getElementById('breakMessage');

      let timeLeft = duration;
      overlay.classList.add('active');
      counter.textContent = timeLeft;
      msgEl.textContent = message;

      const interval = setInterval(() => {
        timeLeft--;
        counter.textContent = timeLeft;
        if (timeLeft <= 0) {
          clearInterval(interval);
          overlay.classList.remove('active');
          if (callback) callback();
        }
      }, 1000);
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
        if (el.closest('.merged-mcq')) return; // skip merged
        userAnswers[el.dataset.q] = el.dataset.val;
      });
      // Gap fill inputs
      document.querySelectorAll('.gap-input').forEach(inp => {
        if (inp.dataset.q && inp.value.trim()) userAnswers[inp.dataset.q] = inp.value.trim();
      });
      // Selects (speaker matching)
      document.querySelectorAll('.speaker-select').forEach(sel => {
        if (sel.dataset.q && sel.value) userAnswers[sel.dataset.q] = sel.value;
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
      const selectedDisplay = document.querySelector('.map-selected-letter[data-q="' + qId + '"]');
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

    // ===== Drag-and-Drop / Tap-to-Fill Matching =====
    var dndActiveLetter = null;

    function placeDndLetter(zone, letter) {
      // Clear any existing zone that has this letter (optional: allow reuse)
      zone.textContent = letter;
      zone.classList.add('dnd-filled');
      var hiddenInput = zone.parentElement.querySelector('.dnd-hidden-input[data-q="' + zone.dataset.q + '"]');
      if (hiddenInput) hiddenInput.value = letter;
    }

    function clearDndZone(zone) {
      zone.textContent = 'tap to fill';
      zone.classList.remove('dnd-filled');
      var hiddenInput = zone.parentElement.querySelector('.dnd-hidden-input[data-q="' + zone.dataset.q + '"]');
      if (hiddenInput) hiddenInput.value = '';
    }

    // Make option items draggable
    document.addEventListener('dragstart', function (e) {
      var opt = e.target.closest('.dnd-option-item');
      if (!opt || isReviewMode) return;
      opt.setAttribute('draggable', 'true');
      dndActiveLetter = opt.dataset.letter;
      e.dataTransfer.setData('text/plain', dndActiveLetter);
      e.dataTransfer.effectAllowed = 'copy';
      opt.classList.add('dnd-dragging');
    });

    document.addEventListener('dragend', function (e) {
      var opt = e.target.closest('.dnd-option-item');
      if (opt) opt.classList.remove('dnd-dragging');
      dndActiveLetter = null;
    });

    document.addEventListener('dragover', function (e) {
      var zone = e.target.closest('.dnd-drop-zone');
      if (zone && !isReviewMode) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        zone.classList.add('dnd-over');
      }
    });

    document.addEventListener('dragleave', function (e) {
      var zone = e.target.closest('.dnd-drop-zone');
      if (zone) zone.classList.remove('dnd-over');
    });

    document.addEventListener('drop', function (e) {
      var zone = e.target.closest('.dnd-drop-zone');
      if (zone && !isReviewMode) {
        e.preventDefault();
        zone.classList.remove('dnd-over');
        var letter = e.dataTransfer.getData('text/plain');
        if (letter) placeDndLetter(zone, letter);
      }
    });

    // Tap-to-fill (mobile + desktop click)
    document.addEventListener('click', function (e) {
      if (isReviewMode) return;
      var opt = e.target.closest('.dnd-option-item');
      if (opt) {
        // Toggle selection
        if (dndActiveLetter === opt.dataset.letter) {
          dndActiveLetter = null;
          document.querySelectorAll('.dnd-option-item').forEach(function (o) { o.classList.remove('dnd-active'); });
        } else {
          dndActiveLetter = opt.dataset.letter;
          document.querySelectorAll('.dnd-option-item').forEach(function (o) { o.classList.remove('dnd-active'); });
          opt.classList.add('dnd-active');
        }
        return;
      }

      var zone = e.target.closest('.dnd-drop-zone');
      if (zone) {
        if (dndActiveLetter) {
          // Place the selected letter
          placeDndLetter(zone, dndActiveLetter);
          dndActiveLetter = null;
          document.querySelectorAll('.dnd-option-item').forEach(function (o) { o.classList.remove('dnd-active'); });
        } else if (zone.classList.contains('dnd-filled')) {
          // Tap a filled zone to clear it
          clearDndZone(zone);
        }
      }
    });

    // Enable draggable attribute on dnd-option-item elements when they appear
    new MutationObserver(function () {
      document.querySelectorAll('.dnd-option-item:not([draggable])').forEach(function (el) {
        el.setAttribute('draggable', 'true');
      });
    }).observe(document.body, { childList: true, subtree: true });

    // Track chosen options in matching questions
    function updateChosenOptions(changedSelect) {
      const container = changedSelect.closest('.matching-container');
      if (!container) return;

      // Get all selected values in this matching group
      const selects = container.querySelectorAll('.speaker-select');
      const letterCounts = {};
      const chosenLetters = new Set();

      // Count how many times each letter is selected
      selects.forEach(sel => {
        if (sel.value) {
          chosenLetters.add(sel.value);
          letterCounts[sel.value] = (letterCounts[sel.value] || 0) + 1;
        }
      });

      // Update option styling in all selects and mark duplicates
      selects.forEach(sel => {
        const speakerItem = sel.closest('.speaker-item');
        const currentValue = sel.value;

        // Check if this select has a duplicate value
        if (currentValue && letterCounts[currentValue] > 1) {
          speakerItem.classList.add('duplicate-warning');
        } else {
          speakerItem.classList.remove('duplicate-warning');
        }

        sel.querySelectorAll('option[data-letter]').forEach(opt => {
          const letter = opt.dataset.letter;
          const isChosen = chosenLetters.has(letter);
          const isCurrentValue = sel.value === letter;

          // Mark as chosen if selected elsewhere (not in this dropdown)
          if (isChosen && !isCurrentValue) {
            opt.textContent = letter + ' вЂ“ ' + opt.textContent.split(' вЂ“ ')[1].replace(' вњ“', '') + ' вњ“';
            opt.classList.add('chosen');
          } else {
            opt.textContent = letter + ' вЂ“ ' + opt.textContent.split(' вЂ“ ')[1].replace(' вњ“', '');
            opt.classList.remove('chosen');
          }
        });
      });

      // Update options box visual
      const optionsBox = container.querySelector('.options-box');
      if (optionsBox) {
        optionsBox.querySelectorAll('.option-box-item').forEach(item => {
          const letter = item.dataset.optionLetter;
          if (chosenLetters.has(letter)) {
            item.classList.add('chosen');
          } else {
            item.classList.remove('chosen');
          }
        });
      }

      // Update mobile options preview chips
      const mobilePreview = container.querySelector('.mobile-options-preview');
      if (mobilePreview) {
        mobilePreview.querySelectorAll('.mobile-option-chip').forEach(chip => {
          const letter = chip.dataset.optionLetter;
          if (chosenLetters.has(letter)) {
            chip.classList.add('chosen');
          } else {
            chip.classList.remove('chosen');
          }
        });
      }
    }

    // Official CEFR Multilevel Score Conversion (Out of 35)

    function getScaledModuleScore(correct) {
      if (typeof correct !== 'number' || correct <= 0) return 0;

      const IELTS_TABLE = {
        40: 9.0, 39: 9.0, 38: 8.5, 37: 8.5, 36: 8.0, 35: 8.0, 34: 7.5, 33: 7.5, 32: 7.5,
        31: 7.0, 30: 7.0, 29: 6.5, 28: 6.5, 27: 6.5, 26: 6.5, 25: 6.0, 24: 6.0, 23: 6.0,
        22: 5.5, 21: 5.5, 20: 5.5, 19: 5.0, 18: 5.0, 17: 5.0, 16: 5.0, 15: 4.5, 14: 4.5,
        13: 4.5, 12: 4.0, 11: 4.0, 10: 4.0, 9: 3.5, 8: 3.5, 7: 3.5, 6: 3.5, 5: 3.0, 4: 3.0
      };

      return IELTS_TABLE[correct] || 0;
    }

    // ---- Answer normalisation helpers (shared by calculateScore & submitTest) ----
    function normalizeForCompareL(s) {
      if (!s && s !== 0) return '';
      var t = String(s).trim().toUpperCase();
      t = t.replace(/[\u2018\u2019\u201C\u201D]/g, '');
      t = t.replace(/[^A-Z0-9\s\-]/g, '');
      t = t.replace(/\s+/g, ' ');
      t = t.replace(/\b(\d+)\s*(?:ST|ND|RD|TH)\b/g, '$1');
      t = t.trim();
      return t;
    }
    var monthNamesL = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    function canonicalDateL(norm) {
      var parts = norm.split(' ');
      if (parts.length === 2) {
        var hM = -1, hN = -1;
        for (var pi = 0; pi < 2; pi++) {
          if (monthNamesL.indexOf(parts[pi]) !== -1) hM = pi;
          if (/^\d+$/.test(parts[pi])) hN = pi;
        }
        if (hM !== -1 && hN !== -1) return parts[hN] + ' ' + parts[hM];
      }
      return null;
    }
    var numberWordsL = { '0': 'ZERO', '1': 'ONE', '2': 'TWO', '3': 'THREE', '4': 'FOUR', '5': 'FIVE', '6': 'SIX', '7': 'SEVEN', '8': 'EIGHT', '9': 'NINE', '10': 'TEN', '11': 'ELEVEN', '12': 'TWELVE', '13': 'THIRTEEN', '14': 'FOURTEEN', '15': 'FIFTEEN', '16': 'SIXTEEN', '17': 'SEVENTEEN', '18': 'EIGHTEEN', '19': 'NINETEEN', '20': 'TWENTY' };
    var ordinalWordsL = { 'FIRST': '1', 'SECOND': '2', 'THIRD': '3', 'FOURTH': '4', 'FIFTH': '5', 'SIXTH': '6', 'SEVENTH': '7', 'EIGHTH': '8', 'NINTH': '9', 'TENTH': '10', 'ELEVENTH': '11', 'TWELFTH': '12', 'THIRTEENTH': '13', 'FOURTEENTH': '14', 'FIFTEENTH': '15', 'SIXTEENTH': '16', 'SEVENTEENTH': '17', 'EIGHTEENTH': '18', 'NINETEENTH': '19', 'TWENTIETH': '20' };
    function equivalentsL(a) {
      var x = normalizeForCompareL(a);
      var res = [x];
      var cd = canonicalDateL(x);
      if (cd && res.indexOf(cd) === -1) res.push(cd);
      var digits = x.match(/^\d+$/);
      if (digits) { var w = numberWordsL[digits[0]]; if (w && res.indexOf(w) === -1) res.push(w); }
      for (var k in numberWordsL) { if (numberWordsL[k] === x && res.indexOf(k) === -1) res.push(k); }
      if (ordinalWordsL[x] && res.indexOf(ordinalWordsL[x]) === -1) res.push(ordinalWordsL[x]);
      for (var ow in ordinalWordsL) { if (ordinalWordsL[ow] === x && res.indexOf(ow) === -1) res.push(ow); }
      return res;
    }
    function isEquivalentL(userStr, correctStr) {
      var uEq = equivalentsL(userStr);
      var cEq = equivalentsL(correctStr);
      return uEq.some(function (v) { return cEq.indexOf(v) !== -1; });
    }
    // ---- End normalisation helpers ----

    function calculateScore() {
      let score = 0;
      TEST_DATA.parts.forEach(part => {
        if (!part.answers) return;
        // Detect merged pairs for either-order scoring
        var ids = Object.keys(part.answers).map(Number).sort(function (a, b) { return a - b; });
        var mergedSet = {};
        for (var mi = 0; mi < ids.length - 1; mi++) {
          var ca = part.answers[ids[mi]], cb = part.answers[ids[mi + 1]];
          if (Array.isArray(ca) && Array.isArray(cb) && ca.length === cb.length &&
            ca.every(function (v, vi) { return v === cb[vi]; })) {
            // Merged pair вЂ” score as set
            var u1 = normalizeForCompareL(userAnswers[ids[mi]] || '');
            var u2 = normalizeForCompareL(userAnswers[ids[mi + 1]] || '');
            var correctArr = ca.map(function (a) { return normalizeForCompareL(a); });
            if (u1 && correctArr.indexOf(u1) !== -1) score++;
            if (u2 && correctArr.indexOf(u2) !== -1) score++;
            mergedSet[ids[mi]] = true; mergedSet[ids[mi + 1]] = true;
            mi++;
          }
        }
        // Score remaining non-merged
        ids.forEach(function (qId) {
          if (mergedSet[qId]) return;
          var correct = part.answers[qId];
          var user = userAnswers[qId];
          if (user) {
            if (Array.isArray(correct)) {
              if (correct.some(function (c) { return isEquivalentL(user, c); })) score++;
            } else if (isEquivalentL(user, correct.toString())) {
              score++;
            }
          }
        });
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

      // Stop ALL audio when test is submitted
      const audio = document.getElementById('listeningAudio');
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      // Stop hidden background audio (plays when switching parts)
      const hiddenAudioEl = document.getElementById('hiddenAudio');
      if (hiddenAudioEl) {
        hiddenAudioEl.pause();
        hiddenAudioEl.currentTime = 0;
      }

      collectAnswers();
      const rawScore = calculateScore();
      const scaledScore = getScaledModuleScore(rawScore);

      document.getElementById('finalScore').textContent = scaledScore;
      document.getElementById('finalTotal').textContent = ' Band';

      // Keep raw score info for reference in the modal if needed, 
      // but the primary focus is now the officially scaled mark.

      if (isFullMock) {
        // Show 30s break before returning to landing
        startBreakTimer(30, "Module completed! Next module will start after the break.", () => {
          // Disable any beforeunload handlers to prevent "Leave site?" popup
          window.__okToLeave = true;

          // Try to call parent/top returnToLanding directly
          let parentHandled = false;
          try {
            if (window.top && window.top !== window && typeof window.top.returnToLanding === 'function') {
              window.top.returnToLanding();
              parentHandled = true;
            } else if (window.parent && window.parent !== window && typeof window.parent.returnToLanding === 'function') {
              window.parent.returnToLanding();
              parentHandled = true;
            }
          } catch (e) {
            console.log('Parent call error:', e);
          }

          // If parent didn't handle it, do it ourselves
          if (!parentHandled) {
            const FULL_MOCK_STORAGE_KEY = 'FULL_MOCK_DATA';
            const dataStr = sessionStorage.getItem(FULL_MOCK_STORAGE_KEY);
            if (dataStr) {
              try {
                const data = JSON.parse(dataStr);
                if (data.active && data.step <= 4) {
                  data.step++;
                  sessionStorage.setItem(FULL_MOCK_STORAGE_KEY, JSON.stringify(data));
                  console.log('Full Mock step incremented to:', data.step);
                }
              } catch (e) {
                console.error('Error updating Full Mock data:', e);
              }
            }
            try { window.top.location.href = 'landing.html'; } catch (e) { window.location.href = 'landing.html'; }
          }
        });
      }

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

          // Detect merged pairs in this part
          const rMergedPairs = {};
          for (let mi = 0; mi < sortedQIds.length - 1; mi++) {
            const ca = part.answers[sortedQIds[mi]], cb = part.answers[sortedQIds[mi + 1]];
            if (Array.isArray(ca) && Array.isArray(cb) && ca.length === cb.length &&
              ca.every((v, vi) => v === cb[vi])) {
              rMergedPairs[sortedQIds[mi]] = sortedQIds[mi + 1];
              rMergedPairs[sortedQIds[mi + 1]] = sortedQIds[mi];
              mi++;
            }
          }

          sortedQIds.forEach(qId => {
            partTotal++;
            const correct = part.answers[qId];
            const user = userAnswers[qId];
            const correctStr = Array.isArray(correct) ? correct.join(' / ') : correct;
            const userStr = user || '';

            let isCorrect = false;
            if (user) {
              if (rMergedPairs[qId]) {
                // Either-order: check if user's answer is in the correct set
                const correctArr = (Array.isArray(correct) ? correct : [correct]);
                isCorrect = correctArr.some(c => isEquivalentL(user, c.toString()));
              } else if (Array.isArray(correct)) {
                isCorrect = correct.some(c => isEquivalentL(user, c.toString()));
              } else {
                isCorrect = isEquivalentL(user, correct.toString());
              }
            }

            if (isCorrect) partCorrect++;

            const qNum = qId.replace(/\D/g, '') || qId;
            const eitherOrder = rMergedPairs[qId] ? ' <span style=\"font-size:11px;color:#64748b;font-style:italic;\">(in either order)</span>' : '';
            let rowClass = 'unanswered-row';
            let userClass = 'user-answer empty';
            let userDisplay = '(no answer)';

            if (user) {
              userClass = 'user-answer';
              userDisplay = userStr;
              rowClass = isCorrect ? 'correct-row' : 'incorrect-row';
            }

            answersTableRows += '<div class=\"answers-table-row ' + rowClass + '\">' +
              '<div class=\"q-num\">Q' + qNum + '</div>' +
              '<div class=\"' + userClass + '\">' + userDisplay + '</div>' +
              '<div class=\"correct-answer\">' + correctStr + eitherOrder + '</div>' +
              '</div>';
          });
        }

        var transcriptBtn = '';
        var transcriptDiv = '';
        if (part.transcript) {
          if (_isPremiumListen) {
            transcriptBtn = '<button class="part-transcript-toggle" onclick="event.stopPropagation();toggleTranscript(' + partIndex + ')">рџ“њ Show Transcript</button>';
            transcriptDiv = '<div class="part-transcript-content" id="transcript-' + partIndex + '">' + part.transcript.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\n/g, '<br>') + '</div>';
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
      if (!isFullMock) {
        document.getElementById('resultsModal').classList.add('active');
      }

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
      sendResultsToBackend(scaledScore);
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

    function _extractHighlightKeywordsL(text) {
      if (!text) return [];
      var stop = {
        'the': true, 'and': true, 'for': true, 'with': true, 'that': true, 'this': true,
        'from': true, 'into': true, 'about': true, 'there': true, 'they': true, 'their': true,
        'them': true, 'have': true, 'will': true, 'when': true, 'what': true, 'which': true,
        'were': true, 'been': true, 'only': true, 'each': true, 'your': true, 'you': true,
        'are': true, 'was': true, 'has': true, 'had': true, 'one': true, 'two': true,
        'letter': true, 'choose': true, 'correct': true, 'question': true, 'questions': true
      };
      return String(text)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(function (w) {
          return w && w.length >= 4 && !stop[w];
        });
    }

    function _collectQuestionContextL(part, qId) {
      var ctx = [];
      function addFromQuestion(q) {
        if (!q) return;
        if (q.text) ctx.push(q.text);
        if (q.label) ctx.push(q.label);
      }

      if (part.questions && Array.isArray(part.questions)) {
        for (var i = 0; i < part.questions.length; i++) {
          if (String(part.questions[i].id) === String(qId)) {
            addFromQuestion(part.questions[i]);
            break;
          }
        }
      }

      if (part.subParts && Array.isArray(part.subParts)) {
        for (var si = 0; si < part.subParts.length; si++) {
          var sp = part.subParts[si];
          if (sp.questions && Array.isArray(sp.questions)) {
            for (var qi = 0; qi < sp.questions.length; qi++) {
              if (String(sp.questions[qi].id) === String(qId)) addFromQuestion(sp.questions[qi]);
            }
          }
          if (sp.speakers && Array.isArray(sp.speakers)) {
            for (var sj = 0; sj < sp.speakers.length; sj++) {
              if (String(sp.speakers[sj].id) === String(qId)) addFromQuestion(sp.speakers[sj]);
            }
          }
        }
      }

      return ctx.join(' ');
    }

    function _findOptionTextForAnswerL(part, qId, answerLetters) {
      var letters = answerLetters || [];
      var out = [];

      function matchOptionText(options) {
        if (!options || !Array.isArray(options)) return;
        for (var oi = 0; oi < options.length; oi++) {
          var opt = options[oi];
          var ltr = String((opt.letter || '')).toUpperCase();
          if (letters.indexOf(ltr) !== -1 && opt.text) out.push(opt.text);
        }
      }

      if (part.questions && Array.isArray(part.questions)) {
        for (var i = 0; i < part.questions.length; i++) {
          var q = part.questions[i];
          if (String(q.id) === String(qId)) matchOptionText(q.options);
        }
      }

      if (part.subParts && Array.isArray(part.subParts)) {
        for (var si = 0; si < part.subParts.length; si++) {
          var sp = part.subParts[si];
          if (sp.questions && Array.isArray(sp.questions)) {
            for (var qi = 0; qi < sp.questions.length; qi++) {
              var sq = sp.questions[qi];
              if (String(sq.id) === String(qId)) matchOptionText(sq.options);
            }
          }
          if ((sp.type === 'matching-speakers' || sp.type === 'matching') && sp.options) {
            matchOptionText(sp.options);
          }
        }
      }

      return out;
    }

    function _findBestTranscriptLineL(linesLower, terms, cutoffIndex) {
      if (!terms || terms.length === 0) return -1;
      var bestIdx = -1;
      var bestScore = 0;
      var maxI = Math.max(0, cutoffIndex || linesLower.length);

      for (var i = 0; i < maxI; i++) {
        var line = linesLower[i];
        if (!line || !line.trim()) continue;
        var score = 0;
        for (var t = 0; t < terms.length; t++) {
          if (line.indexOf(terms[t]) !== -1) score++;
        }
        if (score > bestScore) {
          bestScore = score;
          bestIdx = i;
        }
      }

      return bestScore > 0 ? bestIdx : -1;
    }

    // ===== TRANSCRIPTS POPUP =====
    function openTranscriptsPopup() {
      if (!TEST_DATA || !TEST_DATA.parts) return;
      var parts = TEST_DATA.parts;
      var tabsHtml = '';
      var bodyHtml = '';
      var HIGHLIGHT_COLORS = 12;

      for (var pi = 0; pi < parts.length; pi++) {
        var part = parts[pi];
        if (!part.transcript) continue;

        tabsHtml += '<button class="transcript-tab' + (pi === 0 ? ' active' : '') + '" onclick="switchTranscriptTab(' + pi + ')" data-tab="' + pi + '">' +
          part.title + '</button>';

        var rawLines = part.transcript.split('\n');
        var linesLower = rawLines.map(function (ln) { return String(ln || '').toLowerCase(); });
        var cutoffIndex = rawLines.length;
        for (var ri = 0; ri < rawLines.length; ri++) {
          var lowerLine = linesLower[ri].trim();
          if (lowerLine.indexOf('now listen again') !== -1 || lowerLine.indexOf('now, listen again') !== -1 || lowerLine === 'you will hear the piece again.') {
            cutoffIndex = ri;
            break;
          }
        }

        var lineHighlights = {};
        var allQIds = [];
        if (part.answers) {
          for (var qk in part.answers) {
            if (part.answers.hasOwnProperty(qk)) allQIds.push(parseInt(qk, 10));
          }
        }
        allQIds = allQIds.filter(function (n) { return !isNaN(n); });
        allQIds.sort(function (a, b) { return a - b; });

        var qColorIndex = {};
        for (var qi = 0; qi < allQIds.length; qi++) qColorIndex[allQIds[qi]] = qi % HIGHLIGHT_COLORS;

        // 1) Manual highlights from test data
        if (part.answerHighlights) {
          var ahl = part.answerHighlights;
          for (var qId in ahl) {
            if (!ahl.hasOwnProperty(qId)) continue;
            var qNum = parseInt(qId, 10);
            if (isNaN(qNum)) continue;
            var lines = ahl[qId];
            if (!lines) continue;
            for (var li = 0; li < lines.length; li++) {
              var ln = lines[li];
              if (typeof ln !== 'number' || ln < 0 || ln >= cutoffIndex) continue;
              if (!lineHighlights[ln]) lineHighlights[ln] = [];
              lineHighlights[ln].push({ qId: qNum, colorIdx: qColorIndex[qNum] || 0 });
            }
          }
        }

        // 2) Auto-highlight any question not already mapped
        for (var ai = 0; ai < allQIds.length; ai++) {
          var aq = allQIds[ai];
          var alreadyMapped = false;
          for (var lk in lineHighlights) {
            if (!lineHighlights.hasOwnProperty(lk)) continue;
            var mapped = lineHighlights[lk] || [];
            for (var mz = 0; mz < mapped.length; mz++) {
              if (mapped[mz].qId === aq) {
                alreadyMapped = true;
                break;
              }
            }
            if (alreadyMapped) break;
          }
          if (alreadyMapped) continue;

          var correct = part.answers ? part.answers[String(aq)] : null;
          var candidates = Array.isArray(correct) ? correct.slice() : [correct];
          candidates = candidates.filter(function (v) { return v !== null && v !== undefined; });

          var letters = [];
          var directTerms = [];
          for (var ci = 0; ci < candidates.length; ci++) {
            var c = String(candidates[ci] || '').trim();
            if (/^[A-F]$/i.test(c)) {
              var u = c.toUpperCase();
              if (letters.indexOf(u) === -1) letters.push(u);
            } else {
              directTerms = directTerms.concat(_extractHighlightKeywordsL(c));
            }
          }

          var optionTexts = _findOptionTextForAnswerL(part, aq, letters);
          var contextText = _collectQuestionContextL(part, aq);
          var terms = [];
          terms = terms.concat(directTerms);
          for (var ot = 0; ot < optionTexts.length; ot++) terms = terms.concat(_extractHighlightKeywordsL(optionTexts[ot]));
          terms = terms.concat(_extractHighlightKeywordsL(contextText));

          var seen = {};
          terms = terms.filter(function (w) {
            if (!w || seen[w]) return false;
            seen[w] = true;
            return true;
          });

          var autoLine = _findBestTranscriptLineL(linesLower, terms, cutoffIndex);
          if (autoLine >= 0) {
            if (!lineHighlights[autoLine]) lineHighlights[autoLine] = [];
            lineHighlights[autoLine].push({ qId: aq, colorIdx: qColorIndex[aq] || 0 });
          }
        }

        var legendHtml = '';
        if (allQIds.length > 0) {
          legendHtml = '<div class="transcript-legend">';
          for (var qi = 0; qi < allQIds.length; qi++) {
            var cIdx = qi % HIGHLIGHT_COLORS;
            legendHtml += '<div class="legend-item"><div class="legend-dot hl-color-' + cIdx + '" style="background:' + getLegendColor(cIdx) + '"></div>Q' + allQIds[qi] + '</div>';
          }
          legendHtml += '</div>';
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

        var typeLabel = (part.type || '').replace(/-/g, ' ');
        bodyHtml += '<div class="transcript-part-section' + (pi === 0 ? ' active' : '') + '" data-part="' + pi + '">' +
          '<div class="transcript-part-label">' + part.title + ' \u2014 ' + typeLabel + ' (Questions ' + (part.questionRange || '') + ')</div>' +
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
          if (fullName && !sessionStorage.getItem('CANDIDATE_NAME')) {
            sessionStorage.setItem('CANDIDATE_NAME', fullName);
          }
        })();

        // Get candidate name from sessionStorage
        const candidateName = sessionStorage.getItem('CANDIDATE_NAME') || 'Unknown';

        const testIdentifier = TEST_DATA?.testInfo?.title || 'IELTS Listening Test';
        const mockNum = testFile.match(/(\d+)/) ? testFile.match(/(\d+)/)[1].padStart(2, '0') : '01';
        const total = TEST_DATA?.testInfo?.totalQuestions || 0;

        // Helper: check if user answer matches any acceptable answer, including "/" or "or" combined inputs
        // Also accepts British/American spelling variants automatically
        function matchesAnswer(userAns, correctArr) {
          if (!userAns) return false;
          var arr = Array.isArray(correctArr) ? correctArr : [correctArr];
          var uLow = userAns.toString().toLowerCase().trim();
          // Direct match
          if (arr.some(function(c){ return c.toString().toLowerCase().trim() === uLow; })) return true;
          // Spelling variant match: check if user's word is a variant of any correct answer
          var userVariants = getSpellingVariants(uLow);
          if (userVariants.length > 0 && arr.some(function(c){ return userVariants.indexOf(c.toString().toLowerCase().trim()) !== -1; })) return true;
          // Also check if any correct answer's variant matches user input
          if (arr.some(function(c){ var v = getSpellingVariants(c.toString().toLowerCase().trim()); return v.indexOf(uLow) !== -1; })) return true;
          // Split user input on "/" or " or " and check if any part matches
          if (arr.length > 1) {
            var parts = userAns.toString().split(/\s*[\/]\s*|\s+or\s+/i).map(function(p){ return p.toLowerCase().trim(); }).filter(Boolean);
            if (parts.length > 1 && parts.some(function(p){ return arr.some(function(c){ return c.toString().toLowerCase().trim() === p; }) || getSpellingVariants(p).some(function(v){ return arr.some(function(c){ return c.toString().toLowerCase().trim() === v; }); }); })) return true;
          }
          return false;
        }

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

        // Calculate IELTS Level based on actual score
        function getIELTSLevel(s) {
          if (s < 4.5) return { level: 'Foundation', color: '#ef4444', bg: '#fee2e2' };
          if (s < 6.0) return { level: 'Intermediate', color: '#f59e0b', bg: '#fef3c7' };
          if (s < 7.5) return { level: 'Advanced', color: '#3b82f6', bg: '#dbeafe' };
          return { level: 'Expert', color: '#10b981', bg: '#d1fae5' };
        }
        const scaledScore = getScaledModuleScore(actualScore);
        const ieltsResult = getIELTSLevel(scaledScore);

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
                if (userAns && matchesAnswer(userAns, correctAns)) {
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
                var isCorrect = userAns && matchesAnswer(userAns, correctAns);
                html += '<div class="question-item"><div class="question-text">' + speaker.label + ' (Q' + qId + ')</div>';
                html += '<div style="margin-top:8px"><span>Your answer: </span><span class="gap-answer ' + (isCorrect ? 'correct-ans' : (userAns ? 'user-wrong' : '')) + '">' + (userAns || '(empty)') + '</span>';
                if (!isCorrect) html += '<span> в†’ Correct: </span><span class="gap-answer correct-ans">' + correctAns + '</span>';
                html += '</div></div>';
              });
              if (part.options) {
                html += '<div style="margin-top:10px;padding:10px;background:#f0f9ff;border-radius:8px;font-size:13px"><strong>Options:</strong><br>';
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
        const reportHtml = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>IELTS Listening Results</title><style>' +
          'body { font-family: "Segoe UI", sans-serif; padding: 20px; background: #f0f9ff; }' +
          '.container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }' +
          'h1 { color: #0369a1; text-align: center; margin-bottom: 20px; }' +
          '.score-box { text-align: center; padding: 30px; background: linear-gradient(135deg, #0369a1, #075985); border-radius: 12px; color: white; margin: 20px 0; }' +
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
          '.part-score { color: #0369a1; font-weight: bold; }' +
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
          '.collapsible-header { background: linear-gradient(135deg, #0369a1, #075985); color: white; padding: 15px 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 16px; }' +
          '.collapsible-header:hover { background: linear-gradient(135deg, #075985, #065f46); }' +
          '.collapsible-header .arrow { transition: transform 0.3s; font-size: 12px; }' +
          '.collapsible-header.active .arrow { transform: rotate(180deg); }' +
          '.collapsible-content { max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; background: #fafafa; }' +
          '.collapsible-content.show { max-height: 50000px; }' +
          '.collapsible-inner { padding: 20px; }' +
          '.part-block { margin-bottom: 25px; padding: 15px; background: white; border-radius: 10px; border-left: 4px solid #0369a1; }' +
          '.part-title { color: #0369a1; font-size: 18px; font-weight: 700; margin-bottom: 10px; }' +
          '.part-instruction { color: #64748b; font-size: 13px; font-style: italic; margin-bottom: 15px; padding: 10px; background: #f0f9ff; border-radius: 6px; }' +
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
          '<h1>рџЋ§ IELTS Listening Mock ' + mockNum + '</h1>' +
          '<div style="text-align:center;margin-bottom:20px;padding:15px;background:#f0f9ff;border-radius:12px;border:2px solid #0369a1">' +
          '<div style="font-size:14px;color:#64748b;margin-bottom:5px">рџ‘¤ Candidate</div>' +
          '<div style="font-size:22px;font-weight:bold;color:#0369a1">' + candidateName + '</div></div>' +
          '<div style="text-align:center;margin-bottom:20px;padding:20px;background:' + ieltsResult.bg + ';border-radius:12px;border:3px solid ' + ieltsResult.color + '">' +
          '<div style="font-size:14px;color:#64748b;margin-bottom:5px">рџЋЇ CEFR Level</div>' +
          '<div style="font-size:32px;font-weight:bold;color:' + ieltsResult.color + '">' + ieltsResult.level + '</div></div>' +
          '<div class="score-box"><div class="score">' + actualScore + '</div><div class="total">/ ' + total + '</div>' +
          '<div style="margin-top:10px;font-size:18px">' + percentage + '%</div></div>' +
          '<div class="details">' +
          '<div class="detail correct"><div class="value">' + correct + '</div><div class="label">Correct</div></div>' +
          '<div class="detail incorrect"><div class="value">' + incorrect + '</div><div class="label">Incorrect</div></div>' +
          '<div class="detail unanswered"><div class="value">' + unanswered + '</div><div class="label">Unanswered</div></div></div>' +
          '<div class="parts"><h3 style="color:#0369a1;margin-bottom:10px">Part Results</h3>' + generatePartResults() + '</div>' +
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
            testType: 'IELTS Listening',
            mockNum: mockNum,
            testId: testIdentifier.replace(/"/g, ''),
            score: actualScore,
            total: total,
            percentage: percentage,
            cefrLevel: ieltsResult.level,
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
          'doc.text("IELTS PRACTICE ASSESSMENT",w-55,30,{align:"center"});' +
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

        // Build per-section score lines
        var sectionScoreLines = '';
        TEST_DATA.parts.forEach(function (part, idx) {
          var sc = 0, st = 0;
          if (part.answers) {
            Object.keys(part.answers).forEach(function (qId) {
              st++;
              var ca = part.answers[qId];
              var ua = userAnswers[qId];
              if (ua && matchesAnswer(ua, ca)) sc++;
            });
          }
          sectionScoreLines += '\nрџ“ќ Section ' + (idx + 1) + ': ' + sc + '/' + st;
        });

        // Duration calculation
        var startTime = window.__testStartTime || now;
        var durationMs = now - startTime;
        var durationMin = Math.floor(durationMs / 60000);
        var durationSec = Math.floor((durationMs % 60000) / 1000);
        var durationStr = durationMin + 'm ' + durationSec + 's';
        var startTimeStr = startTime.toLocaleTimeString();
        var finishTimeStr = now.toLocaleTimeString();
        var dateStr = now.getDate() + '/' + (now.getMonth() + 1) + '/' + now.getFullYear();

        // Build caption with hashtags
        const dateTag = String(now.getDate()).padStart(2, '0') + '_' + String(now.getMonth() + 1).padStart(2, '0') + '_' + String(now.getFullYear()).slice(-2);
        const monthTag = String(now.getMonth() + 1).padStart(2, '0') + '_' + String(now.getFullYear()).slice(-2);
        const yearTag = String(now.getFullYear());
        const testIdTag = GLOBAL_TEST_IDENTIFIER.replace(/-/g, '_');

        // IELTS Caption Format (matching CEFR style)
        const caption = 'рџ‘¤ #' + candidateName.replace(/ /g, '_') +
          '\n\nрџЋ§ IELTS Listening Mock ' + mockNum +
          '\n\nрџ§  Scoring:' +
          '\nрџ“Љ Raw score: ' + correct + '/' + total +
          '\nрџ“Љ IELTS Score: ' + scaledScore.toFixed(1) + '/9.0' +
          '\nвњ… Correct: ' + correct +
          '\nвќЊ Incorrect: ' + incorrect +
          '\nвЏ­пёЏ Unanswered: ' + unanswered +
          sectionScoreLines +
          '\n\nрџ“‹ Mock Details:' +
          '\nрџ”ў Mock в„–: ' + mockNum +
          '\nрџ“… Date: ' + dateStr +
          '\nрџ•ђ Start: ' + startTimeStr +
          '\nрџ•ђ Finish: ' + finishTimeStr +
          '\nвЏі Duration: ' + durationStr +
          '\n\nрџЏ›пёЏ Center: #' + testIdTag +
          '\nрџ“Љ #' + testIdTag + '_' + dateTag + '_ielts' +
          '\nрџ“Љ #' + testIdTag + '_' + monthTag + '_ielts' +
          '\nрџ“Љ #' + testIdTag + '_' + yearTag + '_ielts' +
          '\nOverall:' +
          '\nрџ“Љ #all_' + dateTag + '_ielts' +
          '\nрџ“Љ #all_' + monthTag + '_ielts' +
          '\nрџ“Љ #all_' + yearTag + '_ielts' +
          '\n#IELTS' +
          '\n#' + scaledScore.toFixed(1);

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

      console.log('[Review] Starting review. Parts:', TEST_DATA.parts.length, 'userAnswers:', Object.keys(userAnswers).length);

      // Helper: check if user answer matches any acceptable answer
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

      // Helper to apply review styles robustly (preserves existing inline styles, uses !important)
      function applyReviewStyle(el, styles) {
        for (var prop in styles) {
          el.style.setProperty(prop, styles[prop], 'important');
        }
      }

      // Mark all answers for review
      try {
        TEST_DATA.parts.forEach(part => {
          if (!part.answers) return;

          for (const [qId, correctAnswerRaw] of Object.entries(part.answers)) {
            const correctAnswers = Array.isArray(correctAnswerRaw) ? correctAnswerRaw : [correctAnswerRaw];
            const correctAnswer = correctAnswers[0];
            const userAnswer = userAnswers[qId] || '';

            // Check if correct
            const isCorrect = userAnswer && matchesAnswer(userAnswer, correctAnswers);

            // Handle text inputs (gap-fill questions) вЂ” skip hidden dnd inputs
            const input = document.querySelector('.gap-input[data-q="' + qId + '"]:not(.dnd-hidden-input)');
            if (input) {
              input.disabled = true;
              if (!userAnswer) {
                input.value = correctAnswer;
                applyReviewStyle(input, { 'border': '2px solid #f59e0b', 'background': '#fef3c7', 'color': '#92400e', 'font-style': 'italic', 'border-radius': '6px' });
              } else if (isCorrect) {
                applyReviewStyle(input, { 'border': '2px solid #10b981', 'background': '#dcfce7', 'border-radius': '6px' });
              } else {
                applyReviewStyle(input, { 'border': '2px solid #ef4444', 'background': '#fee2e2', 'border-radius': '6px' });
                if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('correct-answer-badge')) {
                  const badge = document.createElement('span');
                  badge.className = 'correct-answer-badge';
                  badge.textContent = 'вњ“ ' + correctAnswer;
                  badge.style.cssText = 'display:inline-block;background:#10b981;color:white;padding:4px 10px;border-radius:6px;font-size:13px;font-weight:600;margin-left:8px;vertical-align:middle;';
                  input.insertAdjacentElement('afterend', badge);
                }
              }
            }

            // Handle select dropdowns (matching/map questions)
            const select = document.querySelector('.speaker-select[data-q="' + qId + '"], .map-select[data-q="' + qId + '"], select[data-q="' + qId + '"]');
            if (select) {
              select.disabled = true;
              if (!userAnswer) {
                select.value = correctAnswer;
                applyReviewStyle(select, { 'border': '2px solid #f59e0b', 'background': '#fef3c7', 'color': '#92400e', 'font-style': 'italic' });
                if (!select.nextElementSibling || !select.nextElementSibling.classList.contains('unanswered-badge')) {
                  const badge = document.createElement('span');
                  badge.className = 'unanswered-badge';
                  badge.textContent = '(not answered)';
                  badge.style.cssText = 'display:inline-block;background:#f59e0b;color:white;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:600;margin-left:8px;vertical-align:middle;';
                  select.insertAdjacentElement('afterend', badge);
                }
              } else if (isCorrect) {
                applyReviewStyle(select, { 'border': '2px solid #10b981', 'background': '#dcfce7' });
              } else {
                applyReviewStyle(select, { 'border': '2px solid #ef4444', 'background': '#fee2e2' });
                if (!select.nextElementSibling || !select.nextElementSibling.classList.contains('correct-answer-badge')) {
                  const badge = document.createElement('span');
                  badge.className = 'correct-answer-badge';
                  badge.textContent = 'вњ“ ' + correctAnswer;
                  badge.style.cssText = 'display:inline-block;background:#10b981;color:white;padding:4px 10px;border-radius:6px;font-size:13px;font-weight:600;margin-left:8px;vertical-align:middle;';
                  select.insertAdjacentElement('afterend', badge);
                }
              }
            }

            // Handle DnD drop-zone matching questions
            const dndZone = document.querySelector('.dnd-drop-zone[data-q="' + qId + '"]');
            if (dndZone) {
              const dndInput = document.querySelector('.dnd-hidden-input[data-q="' + qId + '"]');
              if (!userAnswer) {
                dndZone.textContent = correctAnswer;
                dndZone.classList.add('dnd-filled', 'dnd-unanswered');
                if (dndInput) dndInput.value = correctAnswer;
                if (!dndZone.nextElementSibling || !dndZone.nextElementSibling.classList.contains('unanswered-badge')) {
                  const badge = document.createElement('span');
                  badge.className = 'unanswered-badge';
                  badge.textContent = '(not answered)';
                  badge.style.cssText = 'display:inline-block;background:#f59e0b;color:white;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600;margin-left:6px;vertical-align:middle;';
                  dndZone.insertAdjacentElement('afterend', badge);
                }
              } else if (isCorrect) {
                dndZone.classList.add('dnd-correct');
              } else {
                dndZone.classList.add('dnd-incorrect');
                if (!dndZone.nextElementSibling || !dndZone.nextElementSibling.classList.contains('correct-answer-badge')) {
                  const badge = document.createElement('span');
                  badge.className = 'correct-answer-badge';
                  badge.textContent = 'вњ“ ' + correctAnswer;
                  badge.style.cssText = 'display:inline-block;background:#10b981;color:white;padding:4px 8px;border-radius:6px;font-size:12px;font-weight:600;margin-left:6px;vertical-align:middle;';
                  dndZone.insertAdjacentElement('afterend', badge);
                }
              }
            }

            // Handle map-labeling questions (.map-selected-letter + .map-letter-btn)
            const mapDisplay = document.querySelector('.map-selected-letter[data-q="' + qId + '"]');
            if (mapDisplay) {
              // Disable all letter buttons for this question
              document.querySelectorAll('.map-letter-btn[data-q="' + qId + '"]').forEach(function(btn) {
                btn.disabled = true;
                btn.style.pointerEvents = 'none';
                btn.style.opacity = '0.5';
              });

              if (!userAnswer || userAnswer === 'вЂ”') {
                // Unanswered: show correct answer
                mapDisplay.textContent = correctAnswer;
                mapDisplay.classList.add('filled');
                applyReviewStyle(mapDisplay, { 'background': '#fef3c7', 'color': '#92400e', 'border-color': '#f59e0b', 'font-style': 'italic' });
                // Highlight the correct button
                var correctBtn = document.querySelector('.map-letter-btn[data-q="' + qId + '"][data-letter="' + correctAnswer + '"]');
                if (correctBtn) { correctBtn.style.opacity = '1'; correctBtn.style.background = '#fef3c7'; correctBtn.style.borderColor = '#f59e0b'; }
                if (!mapDisplay.nextElementSibling || !mapDisplay.nextElementSibling.classList.contains('unanswered-badge')) {
                  const badge = document.createElement('span');
                  badge.className = 'unanswered-badge';
                  badge.textContent = '(not answered)';
                  badge.style.cssText = 'display:inline-block;background:#f59e0b;color:white;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600;margin-left:6px;vertical-align:middle;';
                  mapDisplay.insertAdjacentElement('afterend', badge);
                }
              } else if (isCorrect) {
                applyReviewStyle(mapDisplay, { 'background': '#dcfce7', 'color': '#065f46', 'border-color': '#10b981' });
                var correctBtn = document.querySelector('.map-letter-btn[data-q="' + qId + '"][data-letter="' + correctAnswer + '"]');
                if (correctBtn) { correctBtn.style.opacity = '1'; correctBtn.style.background = '#dcfce7'; correctBtn.style.borderColor = '#10b981'; }
              } else {
                applyReviewStyle(mapDisplay, { 'background': '#fee2e2', 'color': '#991b1b', 'border-color': '#ef4444' });
                var wrongBtn = document.querySelector('.map-letter-btn[data-q="' + qId + '"][data-letter="' + userAnswer + '"]');
                if (wrongBtn) { wrongBtn.style.opacity = '1'; wrongBtn.style.background = '#fee2e2'; wrongBtn.style.borderColor = '#ef4444'; }
                var correctBtn = document.querySelector('.map-letter-btn[data-q="' + qId + '"][data-letter="' + correctAnswer + '"]');
                if (correctBtn) { correctBtn.style.opacity = '1'; correctBtn.style.background = '#dcfce7'; correctBtn.style.borderColor = '#10b981'; }
                if (!mapDisplay.nextElementSibling || !mapDisplay.nextElementSibling.classList.contains('correct-answer-badge')) {
                  const badge = document.createElement('span');
                  badge.className = 'correct-answer-badge';
                  badge.textContent = 'вњ“ ' + correctAnswer;
                  badge.style.cssText = 'display:inline-block;background:#10b981;color:white;padding:4px 8px;border-radius:6px;font-size:12px;font-weight:600;margin-left:6px;vertical-align:middle;';
                  mapDisplay.insertAdjacentElement('afterend', badge);
                }
              }
            }
          }
        });
      } catch (err) {
        console.error('[Review] Error marking answers:', err);
      }

      // Highlight merged MCQ options (correct/incorrect)
      document.querySelectorAll('.merged-mcq').forEach(function (card) {
        var qIdsAttr = card.dataset.qids;
        if (!qIdsAttr) {
          var q1 = card.dataset.q1, q2 = card.dataset.q2;
          if (q1 && q2) qIdsAttr = q1 + ',' + q2;
        }
        if (!qIdsAttr) return;
        var qIds = qIdsAttr.split(',');
        var firstQid = qIds[0];

        var correctAns = null;
        TEST_DATA.parts.forEach(function (p) { if (p.answers && p.answers[firstQid]) correctAns = p.answers[firstQid]; });
        if (!correctAns) return;
        var correctLetters = (Array.isArray(correctAns) ? correctAns : [correctAns]).map(function (a) { return a.toUpperCase(); });
        card.querySelectorAll('.option-item').forEach(function (el) {
          var val = el.dataset.val;
          var isCorrectAnswer = correctLetters.includes(val);
          var isSelected = el.classList.contains('selected');
          el.classList.remove('disabled-option');
          if (isCorrectAnswer) {
            el.classList.add('correct');
            if (!isSelected) el.innerHTML += '<span class="correct-badge">вњ“ Correct</span>';
          } else if (isSelected) {
            el.classList.add('incorrect');
            el.innerHTML += '<span class="incorrect-badge">вњ—</span>';
          }
        });
      });

      // Highlight non-merged MCQ options (correct/incorrect)
      document.querySelectorAll('.option-item').forEach(el => {
        if (el.closest('.merged-mcq')) return; // skip merged
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
      console.log('[Review] Review mode activated. Navigate sections to see marked answers.');
    }

    // Event listeners
    document.addEventListener('click', e => {
      if (e.target.closest('.option-item') && !isReviewMode) {
        const item = e.target.closest('.option-item');
        // Skip merged MCQ вЂ” handled by onchange on checkboxes
        if (item.closest('.merged-mcq')) return;
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
          .part-title { font-size: 17px; color: #0369a1; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; font-weight: bold; }
          .instruction { font-style: italic; color: #64748b; margin-bottom: 12px; font-size: 13px; }
          .mcq-item { margin-bottom: 12px; padding: 12px; background: #fafafa; border-left: 3px solid #0369a1; font-size: 14px; line-height: 1.6; }
          .form-box { padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; }
          .form-title { text-align: center; font-weight: bold; font-size: 15px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
          .form-heading { font-weight: 600; color: #0369a1; margin: 12px 0 6px; }
          .form-item { margin: 4px 0; padding-left: 12px; }
          .match-container { display: flex; gap: 20px; }
          .match-speakers { flex: 1; }
          .match-options { flex: 1; background: #f0f9ff; padding: 12px; border-radius: 8px; }
          .speaker-item { margin: 8px 0; font-size: 14px; }
          .map-box { text-align: center; margin-bottom: 12px; }
          .map-title { font-weight: bold; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
          .map-question { margin: 6px 0; font-size: 14px; }
          .extract-box { margin-bottom: 15px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
          .extract-title { background: #0369a1; color: white; padding: 8px 12px; font-weight: bold; font-size: 13px; }
          .extract-content { padding: 12px; }
          .passage-box { padding: 15px; background: #f8fafc; border-left: 4px solid #0369a1; }
          .passage-title { font-weight: bold; text-align: center; color: #0369a1; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
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
              colorDark: '#0369a1',
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
          <div style="text-align:center;margin-bottom:15px;padding-bottom:15px;border-bottom:3px solid #0369a1;">
            <img src="${logoUrl}" style="width:60px;height:60px;border-radius:50%;margin-bottom:8px;" onerror="this.style.display='none'">
            <div style="font-size:16px;font-weight:bold;color:#0369a1;">${line1}</div>
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
                <div class="match-options"><strong style="color:#0369a1;">Options:</strong><br>${optionsHtml}</div>
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
                  extractQuestionsHtml += '<div style="margin-bottom:14px"><div style="font-weight:600;margin-bottom:4px;color:#0369a1">' + qLabel + '</div>' +
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
          else if (part.type === 'mixed' && part.subParts) {
            // Render part header first
            console.log('[PDF v3] Mixed section: ' + part.title + ' with ' + part.subParts.length + ' subParts');
            var mixedHeaderCanvas = await renderBlockToCanvas(partHeaderHtml);
            await addCanvasWithQR(mixedHeaderCanvas, qrCodeBase64, false);

            // Render each subPart
            for (var si = 0; si < part.subParts.length; si++) {
              var sub = part.subParts[si];
              console.log('[PDF v3] Rendering subPart ' + si + ': type=' + sub.type);
              try {

                if (sub.type === 'gap-fill-form') {
                  var subFormContentHtml = '';
                  sub.formContent.forEach(function (item) {
                    if (item.type === 'heading') subFormContentHtml += '<div class="form-heading">' + item.text + '</div>';
                    else if (item.type === 'item') subFormContentHtml += '<div class="form-item">вЂў ' + item.text + '</div>';
                    else if (item.type === 'item-gap') subFormContentHtml += '<div class="form-item">вЂў ' + item.text + ' <strong>(' + item.gapId + ')</strong> ________ ' + (item.gapSuffix || '') + '</div>';
                    else if (item.type === 'text') subFormContentHtml += '<div style="margin:6px 0;">' + item.text + '</div>';
                  });
                  var subFormHtml = (sub.instruction ? '<p class="instruction">' + sub.instruction + '</p>' : '') + `
                  <div class="form-box">
                    <div class="form-title">${sub.formTitle || ''}</div>
                    ${subFormContentHtml}
                  </div>
                `;
                  var subFormCanvas = await renderBlockToCanvas(subFormHtml);
                  await addCanvasToPDF(subFormCanvas, false);
                }
                else if (sub.type === 'table-completion') {
                  var tableHeadersHtml = sub.headers.map(function (h) {
                    return '<th style="padding:8px 10px;border:1px solid #cbd5e1;background:#f1f5f9;color:#0369a1;font-weight:700;text-align:left;">' + h + '</th>';
                  }).join('');
                  var tableRowsHtml = sub.rows.map(function (row) {
                    var cellsHtml = row.map(function (cell) {
                      var cellContent = '';
                      if (typeof cell === 'string') {
                        cellContent = cell;
                      } else if (cell && cell.type === 'gap') {
                        cellContent = (cell.prefix || '') + ' <strong>(' + cell.gapId + ')</strong> ________ ' + (cell.suffix || '');
                      }
                      return '<td style="padding:8px 10px;border:1px solid #cbd5e1;">' + cellContent + '</td>';
                    }).join('');
                    return '<tr>' + cellsHtml + '</tr>';
                  }).join('');
                  var tableHtml = (sub.instruction ? '<p class="instruction">' + sub.instruction + '</p>' : '') + `
                  <div class="form-box">
                    <div class="form-title">${sub.tableTitle || ''}</div>
                    <table style="width:100%;border-collapse:collapse;margin-top:8px;">
                      <thead><tr>${tableHeadersHtml}</tr></thead>
                      <tbody>${tableRowsHtml}</tbody>
                    </table>
                  </div>
                `;
                  var tableCanvas = await renderBlockToCanvas(tableHtml);
                  await addCanvasToPDF(tableCanvas, false);
                }
                else if (sub.type === 'mcq-extracts') {
                  // Combine instruction with first extract to avoid orphan headers
                  for (var sei = 0; sei < sub.extracts.length; sei++) {
                    var sExt = sub.extracts[sei];
                    var sqs = sExt.questions || [];
                    var sExtQHtml = '';
                    var sqi = 0;
                    while (sqi < sqs.length) {
                      var sq = sqs[sqi];
                      var snext = sqs[sqi + 1];
                      var sPair = snext && /^\(Choice 2\)$/i.test((snext.text || '').trim());
                      if (sPair) {
                        var sMainText = (sq.text || '').replace(/\s*\(Choice\s*\d+\)\s*$/i, '');
                        var sQLabel = 'Questions ' + sq.id + ' and ' + snext.id;
                        sExtQHtml += '<div style="margin-bottom:14px"><div style="font-weight:600;margin-bottom:4px;color:#0369a1">' + sQLabel + '</div>' +
                          '<div style="font-size:12px;color:#64748b;margin-bottom:6px">Choose <strong>TWO</strong> letters, ' + sq.options[0].letter + '-' + sq.options[sq.options.length - 1].letter + '.</div>' +
                          '<div style="font-weight:600;margin-bottom:8px">' + sMainText + '</div>' +
                          sq.options.map(function (o) { return '<div style="margin:4px 0 4px 15px"><strong>' + o.letter + ')</strong> ' + o.text + '</div>'; }).join('') + '</div>';
                        sqi += 2;
                      } else {
                        sExtQHtml += '<div style="margin-bottom:10px;"><div style="font-weight:600;margin-bottom:6px;"><strong>' + sq.id + '.</strong> ' + sq.text + '</div>' +
                          sq.options.map(function (o) { return '<div style="margin:3px 0 3px 15px;"><strong>' + o.letter + ')</strong> ' + o.text + '</div>'; }).join('') + '</div>';
                        sqi++;
                      }
                    }
                    var sExtHtml = (sei === 0 && sub.instruction ? '<p class="instruction">' + sub.instruction + '</p>' : '') + `
                    <div class="extract-box">
                      <div class="extract-title">${sExt.title}</div>
                      <div class="extract-content">${sExtQHtml}</div>
                    </div>
                  `;
                    var sExtCanvas = await renderBlockToCanvas(sExtHtml);
                    await addCanvasToPDF(sExtCanvas, false);
                  }
                }
                else if (sub.type === 'matching-speakers') {
                  var subSpeakersHtml = sub.speakers.map(function (s) {
                    return '<div class="speaker-item"><strong>' + s.id + '. ' + s.label + '</strong> ________</div>';
                  }).join('');
                  var subOptionsHtml = sub.options.map(function (o) {
                    return '<div style="margin:4px 0;"><strong>' + o.letter + '</strong> ' + o.text + '</div>';
                  }).join('');
                  var subMatchHtml = (sub.instruction ? '<p class="instruction">' + sub.instruction + '</p>' : '') + `
                  <div class="match-container">
                    <div class="match-speakers">${subSpeakersHtml}</div>
                    <div class="match-options"><strong style="color:#0369a1;">Options:</strong><br>${subOptionsHtml}</div>
                  </div>
                `;
                  var subMatchCanvas = await renderBlockToCanvas(subMatchHtml, false);
                  await addCanvasToPDF(subMatchCanvas, false);
                }
                else if (sub.type === 'map-labeling') {
                  var subMapSrc = sub.mapImage || '';
                  var subMapQHtml = sub.questions.map(function (q) {
                    return '<div class="map-question"><strong>' + q.id + '.</strong> ' + q.place + ' ________</div>';
                  }).join('');
                  var subMapHtml = (sub.instruction ? '<p class="instruction">' + sub.instruction + '</p>' : '') + `
                  <div class="map-box">
                    <div class="map-title">${sub.mapTitle || ''}</div>
                    <img src="${subMapSrc}" style="max-width:100%;border:1px solid #e2e8f0;border-radius:8px;" onerror="this.style.display='none';this.nextElementSibling.style.display='block';">
                    <div style="display:none;padding:40px;text-align:center;color:#64748b;border:1px dashed #e2e8f0;border-radius:8px;">[Map Image - Scan QR code to view]</div>
                  </div>
                  ${subMapQHtml}
                  <div style="margin-top:10px;color:#64748b;font-size:11px;">Labels: ${(sub.mapLabels || []).join(', ')}</div>
                `;
                  var subMapCanvas = await renderBlockToCanvas(subMapHtml, true);
                  await addCanvasToPDF(subMapCanvas, false);
                }
                else if (sub.type === 'flowchart') {
                  var flowOptsHtml = sub.options.map(function (o) {
                    return '<span style="display:inline-block;margin:3px 8px;padding:4px 10px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:4px;font-size:13px;"><strong>' + o.letter + '</strong> ' + o.text + '</span>';
                  }).join('');
                  var flowStepsHtml = sub.steps.map(function (step, idx) {
                    var stepHtml = '<div style="padding:10px 14px;border:2px solid #0369a1;border-radius:8px;background:#f8fafc;margin:4px 0;">' + step.text.replace(/(\d+)/, '<strong>($1)</strong> ________') + '</div>';
                    if (idx < sub.steps.length - 1) {
                      stepHtml += '<div style="text-align:center;font-size:18px;color:#0369a1;margin:2px 0;">в†“</div>';
                    }
                    return stepHtml;
                  }).join('');
                  var flowHtml = (sub.instruction ? '<p class="instruction">' + sub.instruction + '</p>' : '') + `
                  <div style="margin-bottom:10px;">${flowOptsHtml}</div>
                  <div style="max-width:500px;margin:0 auto;">${flowStepsHtml}</div>
                `;
                  var flowCanvas = await renderBlockToCanvas(flowHtml);
                  await addCanvasToPDF(flowCanvas, false);
                }
                else {
                  // Unknown sub-type: render instruction only (no raw type name)
                  console.warn('[PDF v3] Unknown sub-type: ' + sub.type);
                  if (sub.instruction) {
                    var unknownHtml = '<p class="instruction">' + sub.instruction + '</p>';
                    var unknownCanvas = await renderBlockToCanvas(unknownHtml);
                    await addCanvasToPDF(unknownCanvas, false);
                  }
                }
              } catch (subErr) {
                console.error('[PDF v3] Error rendering subPart ' + si + ' (type=' + sub.type + '):', subErr);
              }
            }
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
            <div style="font-size:14px;font-weight:bold;color:#0369a1;margin-bottom:10px;">${line1}</div>
            <h2 style="font-size:20px;color:#0369a1;border-bottom:3px solid #0369a1;padding-bottom:10px;margin-bottom:15px;">рџ“ќ ANSWER KEY</h2>
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
          ansGridHtml += '<div style="display:inline-block;width:18%;padding:10px 6px;border:1px solid #e2e8f0;border-radius:4px;text-align:center;font-size:13px;background:#f8fafc;"><strong style="color:#0369a1;">' + i + '.</strong> <span style="color:#1e293b;font-weight:600;">' + answer + '</span></div>';
        }
        ansGridHtml += '</div>';
        var ansGridCanvas = await renderBlockToCanvas(ansGridHtml);
        await addCanvasToPDF(ansGridCanvas, false);

        // Copyright notice
        var copyrightHtml = `
          <div style="margin-top:30px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#64748b;">
            <div style="margin-bottom:8px;">В© ${currentYear} <strong style="color:#0369a1;">${line1}</strong>. All Rights Reserved.</div>
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
      toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.8);background:linear-gradient(135deg,#0369a1,#075985);color:white;padding:30px 40px;border-radius:20px;box-shadow:0 10px 40px rgba(3, 105, 161,0.4);z-index:100002;text-align:center;opacity:0;transition:all 0.3s ease;';
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

      // Primary controls (in header)
      const playPauseBtn = document.getElementById('playPauseBtn');
      const progressBar = document.getElementById('progressBar');
      const progressFill = document.getElementById('progressFill');
      const currentTimeEl = document.getElementById('currentTime');
      const durationEl = document.getElementById('duration');
      const volumeBtn = document.getElementById('volumeBtn');
      const volumeSlider = document.getElementById('volumeSlider');
      const speedBtn = document.getElementById('speedBtn');

      // ALL controls (header + mobile bar) for synced updates
      const allPlayPauseBtns = document.querySelectorAll('.play-pause-btn');
      const allProgressBars = document.querySelectorAll('.audio-progress');
      const allProgressFills = document.querySelectorAll('.audio-progress-fill');
      const allCurrentTimeEls = document.querySelectorAll('#currentTime, .mob-current-time');
      const allDurationEls = document.querySelectorAll('#duration, .mob-duration');
      const allVolumeBtns = document.querySelectorAll('.volume-btn');
      const allVolumeSliders = document.querySelectorAll('.volume-slider');
      const allSpeedBtns = document.querySelectorAll('.speed-btn');

      // Loading elements (only in header)
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

      // Check if test has per-part audio files (non-empty audioFile URLs)
      function checkPerPartAudio() {
        if (window.TEST_DATA && window.TEST_DATA.parts && window.TEST_DATA.parts.length > 0) {
          hasPerPartAudio = window.TEST_DATA.parts.some(p => p.audioFile && p.audioFile.trim() !== '');
        }
        return hasPerPartAudio;
      }

      // Update nav indicators to show which part is currently playing audio
      window.updateNavIndicators = function () {
        if (!window.TEST_DATA || !window.TEST_DATA.parts) return;
        document.querySelectorAll('.part-btn').forEach((btn, i) => {
          const partIdx = i % window.TEST_DATA.parts.length;
          btn.classList.toggle('active', partIdx === currentPart);
          btn.classList.toggle('playing', partIdx === soundingPartIndex);
        });
        document.querySelectorAll('.mobile-part-dot').forEach((dot, i) => {
          dot.classList.toggle('playing', i === soundingPartIndex);
        });
      };

      // Load audio for a specific part
      // autoPlay=true  в†’ stop background audio, play this part's audio immediately
      // autoPlay=false в†’ hand off current playing audio to background, load new part silently
      window.loadPartAudio = function (partIndex, autoPlay) {
        if (typeof autoPlay === 'undefined') autoPlay = true;

        // Re-check in case it wasn't set initially
        if (!hasPerPartAudio) checkPerPartAudio();
        if (!hasPerPartAudio) return;

        if (autoPlay) {
          // Stop background audio, we're playing a new part
          if (hiddenAudio) hiddenAudio.pause();
          soundingPartIndex = partIndex;
        } else if (!audio.paused) {
          // Hand off currently playing audio to hidden element for background playback
          if (hiddenAudio) {
            hiddenAudio.src = audio.src;
            hiddenAudio.currentTime = audio.currentTime;
            hiddenAudio.volume = audio.volume;
            hiddenAudio.playbackRate = audio.playbackRate;
            hiddenAudio.play().catch(() => { });
          }
        }

        // Skip if already loaded for same part AND it's the sounding part AND playing
        if (currentLoadedPart === partIndex && soundingPartIndex === partIndex && !audio.paused) return;

        const part = window.TEST_DATA.parts[partIndex];
        if (!part || !part.audioFile || part.audioFile.trim() === '') return;

        currentLoadedPart = partIndex;
        window.updateNavIndicators();

        // Check if audio is preloaded (cached in browser)
        const partNum = part.partNumber || (partIndex + 1);
        const audioUrl = (window.preloadedAudios && window.preloadedAudios[partNum]) || part.audioFile;

        // Reset UI
        allCurrentTimeEls.forEach(el => el.textContent = '00:00');
        allProgressFills.forEach(el => el.style.width = '0%');
        allDurationEls.forEach(el => el.textContent = '00:00');

        // Set the audio source (browser will use cache if preloaded)
        audio.src = audioUrl;
        audio.currentTime = 0;

        // Hide loading, show ready (instant since cached)
        loadingWrapper.classList.add('hidden');
        playerControls.classList.add('ready');
        isAudioReady = true;

        if (autoPlay) {
          audio.play().catch(function () {
            document.addEventListener('click', function autoPlay() {
              audio.play();
              document.removeEventListener('click', autoPlay);
            }, { once: true });
          });
        }
      };

      // When main audio starts playing, stop background and update indicators
      audio.addEventListener('play', function () {
        if (hiddenAudio) hiddenAudio.pause();
        soundingPartIndex = currentLoadedPart;
        window.updateNavIndicators();
      });

      audio.addEventListener('pause', function () {
        if (soundingPartIndex === currentLoadedPart) window.updateNavIndicators();
      });

      // Update loading text with animation
      const loadingMessages = [
        'Loading audio...',
        'Fetching from server...',
        'Almost ready...',
        'Preparing playback...'
      ];
      let msgIndex = 0;
      const loadingMsgInterval = setInterval(() => {
        if (!isAudioReady) {
          if (!hasPerPartAudio) {
            loadingText.textContent = loadingMessages[msgIndex % loadingMessages.length];
          }
          msgIndex++;
        }
      }, 2000);

      // Wait for TEST_DATA to be available, then load audio
      function initAudioLoading() {
        // Check if TEST_DATA is ready
        if (!window.TEST_DATA) {
          setTimeout(initAudioLoading, 200);
          return;
        }

        // Wait for preload to complete before playing
        if (!window.audioPreloadComplete) {
          setTimeout(initAudioLoading, 200);
          return;
        }

        // Check if we have per-part audio (non-empty URLs)
        if (checkPerPartAudio()) {
          const firstPart = window.TEST_DATA.parts[0];
          if (firstPart && firstPart.audioFile && firstPart.audioFile.trim() !== '') {
            hasPerPartAudio = true;
            currentLoadedPart = 0;

            // Use cached URL
            const partNum = firstPart.partNumber || 1;
            const audioUrl = (window.preloadedAudios && window.preloadedAudios[partNum]) || firstPart.audioFile;

            audio.src = audioUrl;
            audio.currentTime = 0;
            loadingWrapper.classList.add('hidden');
            playerControls.classList.add('ready');
            isAudioReady = true;

            // Show ready popup with countdown instead of auto-playing
            showReadyPopup();
            return;
          }
        }

        // No per-part audio found
        loadingWrapper.classList.add('hidden');
        playerControls.classList.add('ready');
      }

      // Show the ready popup with countdown
      function showReadyPopup() {
        const popup = document.getElementById('readyPopup');
        const countdownEl = document.getElementById('countdownNumber');
        const startBtn = document.getElementById('startNowBtn');
        const waitBtn = document.getElementById('waitBtn');

        popup.style.display = 'flex';
        let countdown = 5;
        countdownEl.textContent = countdown;

        // Auto-start for full mocks
        if (isFullMock) {
          popup.style.display = 'none';
          startAudioWithAnnouncement();
          return;
        }

        // Function to start audio
        function startAudioWithAnnouncement() {
          audio.play().catch(() => { });
        }

        const countdownInterval = setInterval(() => {
          countdown--;
          countdownEl.textContent = countdown;

          if (countdown <= 0) {
            clearInterval(countdownInterval);
            popup.style.display = 'none';
            startAudioWithAnnouncement();
          }
        }, 1000);

        // Start Now button
        startBtn.addEventListener('click', function () {
          clearInterval(countdownInterval);
          popup.style.display = 'none';
          startAudioWithAnnouncement();
        });

        // Wait button - pause countdown and close popup
        waitBtn.addEventListener('click', function () {
          clearInterval(countdownInterval);
          popup.style.display = 'none';
          // Audio is ready but paused - user can click play when ready
        });
      }

      // Start loading after a short delay to ensure TEST_DATA is ready
      setTimeout(initAudioLoading, 500);

      // Track buffering progress
      audio.addEventListener('progress', function () {
        if (audio.buffered.length > 0 && audio.duration) {
          const bufferedPercent = (audio.buffered.end(0) / audio.duration) * 100;
          const displayPercent = 70 + (bufferedPercent * 0.3); // 70% to 100%
          if (loadingProgress) loadingProgress.style.width = Math.min(displayPercent, 100) + '%';
        }
      });

      // Audio can play through
      audio.addEventListener('canplaythrough', function () {
        if (!isAudioReady) {
          isAudioReady = true;
          clearInterval(loadingMsgInterval);
          if (loadingProgress) loadingProgress.style.width = '100%';

          // Show ready notice briefly
          setTimeout(() => {
            loadingWrapper.classList.add('hidden');
            readyNotice.classList.add('show');

            // Show player controls and auto-play
            setTimeout(() => {
              readyNotice.classList.remove('show');
              playerControls.classList.add('ready');

              // Auto-play
              audio.play().catch(function () {
                // Autoplay blocked - wait for user interaction
                document.addEventListener('click', function autoPlay() {
                  audio.play();
                  document.removeEventListener('click', autoPlay);
                }, { once: true });
              });
            }, 1500);
          }, 500);
        }
      });

      function formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
      }

      // Play/Pause вЂ” bind ALL play buttons
      allPlayPauseBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (audio.paused) {
            audio.play().catch(e => console.log('Play error:', e));
          } else {
            audio.pause();
          }
        });
      });

      audio.addEventListener('play', function () {
        allPlayPauseBtns.forEach(b => b.innerHTML = 'вЏё');
      });

      audio.addEventListener('pause', function () {
        allPlayPauseBtns.forEach(b => b.innerHTML = 'в–¶');
      });

      // Progress update вЂ” sync ALL progress fills and time displays
      audio.addEventListener('timeupdate', function () {
        if (audio.duration) {
          const percent = (audio.currentTime / audio.duration) * 100;
          allProgressFills.forEach(f => f.style.width = percent + '%');
          allCurrentTimeEls.forEach(el => el.textContent = formatTime(audio.currentTime));
        }
      });

      audio.addEventListener('loadedmetadata', function () {
        allDurationEls.forEach(el => el.textContent = formatTime(audio.duration));
      });

      audio.addEventListener('durationchange', function () {
        allDurationEls.forEach(el => el.textContent = formatTime(audio.duration));
      });

      // Click on progress bar to seek вЂ” bind ALL progress bars
      allProgressBars.forEach(function (bar) {
        bar.addEventListener('click', function (e) {
          if (audio.duration) {
            const rect = bar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audio.currentTime = percent * audio.duration;
          }
        });
      });

      // Volume вЂ” bind ALL sliders and buttons
      allVolumeSliders.forEach(function (slider) {
        slider.addEventListener('input', function () {
          var val = this.value;
          audio.volume = val;
          if (hiddenAudio) hiddenAudio.volume = val;
          updateVolumeIcon();
          // Sync all sliders
          allVolumeSliders.forEach(s => s.value = val);
        });
      });

      allVolumeBtns.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          if (window.innerWidth <= 768) {
            e.stopPropagation();
            const volumeControl = btn.closest('.volume-control');
            volumeControl.classList.toggle('expanded');
          } else {
            audio.muted = !audio.muted;
            updateVolumeIcon();
          }
        });
      });

      // Close volume slider when clicking outside
      document.addEventListener('click', function (e) {
        document.querySelectorAll('.volume-control').forEach(function (vc) {
          if (!vc.contains(e.target)) vc.classList.remove('expanded');
        });
      });

      function updateVolumeIcon() {
        var icon = audio.muted || audio.volume === 0 ? 'рџ”‡' : audio.volume < 0.5 ? 'рџ”‰' : 'рџ”Љ';
        allVolumeBtns.forEach(b => b.textContent = icon);
      }

      // Speed control вЂ” bind ALL speed buttons
      allSpeedBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          speedIndex = (speedIndex + 1) % speeds.length;
          var newSpeed = speeds[speedIndex];
          audio.playbackRate = newSpeed;
          if (hiddenAudio) hiddenAudio.playbackRate = newSpeed;
          allSpeedBtns.forEach(b => b.textContent = newSpeed + 'x');
        });
      });

      // Audio Ended - Auto-advance to next part (works for both individual and full mock)
      let lastAutoAdvanceTime = 0;
      function handleAudioEnded() {
        // Debounce: changing audio.src can re-fire 'ended' in some browsers
        const now = Date.now();
        if (now - lastAutoAdvanceTime < 2000) return;

        // Check if there are more parts
        if (typeof currentPart !== 'undefined' && window.TEST_DATA && window.TEST_DATA.parts) {
          if (soundingPartIndex < TEST_DATA.parts.length - 1) {
            lastAutoAdvanceTime = now;
            const nextPart = soundingPartIndex + 1;

            if (isFullMock) {
              // Full Mock mode - 10-second break between parts
              startBreakTimer(10, "Part complete. Next part starting soon...", () => {
                showPart(nextPart);
                if (window.loadPartAudio) {
                  window.loadPartAudio(nextPart, true);
                }
              });
            } else {
              // Individual mock mode - switch immediately
              showPart(nextPart);
              if (window.loadPartAudio) {
                window.loadPartAudio(nextPart, true);
              }
            }
          } else {
            // Last part finished
            soundingPartIndex = -1;
            window.updateNavIndicators();
            if (isFullMock) {
              // Auto-submit after 3 seconds of silence
              setTimeout(submitTest, 3000);
            }
            // Individual mode - just stop, user submits manually
          }
        }
      }

      audio.addEventListener('ended', handleAudioEnded);
      if (hiddenAudio) hiddenAudio.addEventListener('ended', handleAudioEnded);
    })();

    // ===== MAP DRAWING FUNCTIONALITY =====
    (function initMapDrawing() {
      let canvas, ctx, isDrawing = false, isPenEnabled = true;
      let currentColor = '#ef4444';
      let lastX = 0, lastY = 0;

      function setupCanvas() {
        canvas = document.getElementById('mapDrawingCanvas');
        if (!canvas) return;

        const img = document.getElementById('mapImage');
        if (!img) return;

        function resizeCanvas() {
          canvas.width = img.offsetWidth;
          canvas.height = img.offsetHeight;
        }

        if (img.complete) {
          resizeCanvas();
        } else {
          img.onload = resizeCanvas;
        }

        ctx = canvas.getContext('2d');
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = currentColor;

        // Pen enabled by default
        canvas.classList.remove('disabled');

        // Pen toggle button
        const penBtn = document.getElementById('btnPen');
        if (penBtn) {
          penBtn.addEventListener('click', function () {
            isPenEnabled = !isPenEnabled;
            penBtn.classList.toggle('active', isPenEnabled);
            canvas.classList.toggle('disabled', !isPenEnabled);
          });
        }

        // Clear button
        const clearBtn = document.getElementById('btnClearCanvas');
        if (clearBtn) {
          clearBtn.addEventListener('click', function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          });
        }

        // Mouse drawing
        canvas.addEventListener('mousedown', function (e) {
          if (!isPenEnabled) return;
          isDrawing = true;
          const rect = canvas.getBoundingClientRect();
          lastX = e.clientX - rect.left;
          lastY = e.clientY - rect.top;
        });

        canvas.addEventListener('mousemove', function (e) {
          if (!isDrawing || !isPenEnabled) return;
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

        canvas.addEventListener('mouseup', () => isDrawing = false);
        canvas.addEventListener('mouseout', () => isDrawing = false);

        // Touch drawing
        canvas.addEventListener('touchstart', function (e) {
          if (!isPenEnabled) return;
          e.preventDefault();
          isDrawing = true;
          const rect = canvas.getBoundingClientRect();
          const touch = e.touches[0];
          lastX = touch.clientX - rect.left;
          lastY = touch.clientY - rect.top;
        });

        canvas.addEventListener('touchmove', function (e) {
          if (!isDrawing || !isPenEnabled) return;
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
        });

        canvas.addEventListener('touchend', () => isDrawing = false);
      }

      // Setup canvas when Part 4 is shown
      const originalShowPart = window.showPart || function () { };
      window.showPart = function (index) {
        originalShowPart(index);
        setTimeout(setupCanvas, 100);
      };

      // Also setup on initial load if Part 4 is visible
      setTimeout(setupCanvas, 500);
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
                background: linear-gradient(135deg, #0369a1, #075985);
                color: white;
                box-shadow: 0 4px 15px rgba(3, 105, 161, 0.3);
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
            box-shadow: 0 6px 20px rgba(3, 105, 161, 0.4);
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
        sessionStorage.setItem('listeningMockReturnCategory', 'ielts-listening');
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

    /* ===== ADMIN SKIP SHORTCUT (PROTECTED) ===== */
    const ADMIN_PASSCODE = '28141203';

    function showAdminSkipModal() {
      // Check if modal exists
      let modal = document.getElementById('adminSkipModal');
      if (!modal) {
        const modalHTML = `
          <div id="adminSkipModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:999999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(5px);">
            <div style="background:#1e293b;padding:30px;border-radius:20px;width:320px;text-align:center;box-shadow:0 25px 50px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.1);">
              <div style="font-size:40px;margin-bottom:15px;">рџ”ђ</div>
              <h3 style="color:white;margin:0 0 15px;font-size:18px;">Admin Skip</h3>
              <input type="password" id="adminPasscodeInput" placeholder="Enter Admin Code" style="width:100%;padding:12px;border-radius:8px;border:1px solid #334155;background:#0f172a;color:white;text-align:center;font-size:18px;letter-spacing:4px;margin-bottom:20px;outline:none;box-sizing:border-box;">
              <div style="display:flex;gap:10px;">
                <button id="adminSkipCancel" style="flex:1;padding:12px;border-radius:8px;border:none;background:#334155;color:white;cursor:pointer;">Cancel</button>
                <button id="adminSkipConfirm" style="flex:1;padding:12px;border-radius:8px;border:none;background:#116a60;color:white;cursor:pointer;font-weight:700;">Verify</button>
              </div>
            </div>
          </div>
          <style>
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              20%, 60% { transform: translateX(-5px); }
              40%, 80% { transform: translateX(5px); }
            }
          </style>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        modal = document.getElementById('adminSkipModal');
        const input = document.getElementById('adminPasscodeInput');
        const confirmBtn = document.getElementById('adminSkipConfirm');
        const cancelBtn = document.getElementById('adminSkipCancel');

        const verify = () => {
          if (input.value === ADMIN_PASSCODE) {
            modal.style.display = 'none';
            input.value = '';
            executeAdminSkip();
          } else {
            input.style.borderColor = '#ef4444';
            input.style.animation = 'shake 0.3s';
            setTimeout(() => {
              input.style.borderColor = '#334155';
              input.style.animation = '';
            }, 300);
            input.value = '';
          }
        };

        confirmBtn.onclick = verify;
        input.onkeydown = (e) => { if (e.key === 'Enter') verify(); };
        cancelBtn.onclick = () => { modal.style.display = 'none'; input.value = ''; };
      }

      modal.style.display = 'flex';
      setTimeout(() => document.getElementById('adminPasscodeInput').focus(), 100);
    }

    function executeAdminSkip() {
      const audio = document.getElementById('listeningAudio') || document.querySelector('audio');
      if (audio) {
        console.log('вЏ­пёЏ Admin Skip executed (Listening)');
        audio.currentTime = audio.duration || 0;
        if (isNaN(audio.duration) || audio.duration === 0) {
          audio.dispatchEvent(new Event('ended'));
        }
      }
    }

    window.addEventListener('keydown', function (e) {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        showAdminSkipModal();
      }
    });

    // ===== PC PART NAV =====
    // PC part nav is populated by generatePartNav() above
    // showPart() uses data-part attribute to toggle active on ALL .part-btn elements

    // ===== ZOOM MAGNIFIER =====
    (function initZoom() {
      var zoomBtn = document.getElementById('btnZoom');
      if (!zoomBtn) return;

      var zoomLevels = [1, 1.15, 1.3, 1.45];
      var zoomIndex = 0;

      // Inject zoom styles
      var zoomStyle = document.createElement('style');
      zoomStyle.textContent =
        '#mainContent.zoom-1 { zoom: 1.15; }' +
        '#mainContent.zoom-2 { zoom: 1.3; }' +
        '#mainContent.zoom-3 { zoom: 1.45; }' +
        '#mainContent.zoom-1 img, #mainContent.zoom-2 img, #mainContent.zoom-3 img { zoom: 1; max-width: 100%; }';
      document.head.appendChild(zoomStyle);

      zoomBtn.addEventListener('click', function () {
        var mc = document.getElementById('mainContent');
        if (!mc) return;

        mc.classList.remove('zoom-1', 'zoom-2', 'zoom-3');
        zoomIndex = (zoomIndex + 1) % zoomLevels.length;

        if (zoomIndex > 0) {
          mc.classList.add('zoom-' + zoomIndex);
        }

        // Update badge
        var badge = zoomBtn.querySelector('.zoom-level');
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

    // Initialize back button trap on load
    setupBackButtonTrap();
  