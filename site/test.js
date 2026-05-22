
// ===== SIDEBAR MENU TOGGLE =====
function toggleSidebar() {
  const hamburger = document.getElementById('hamburgerBtn');
  const sidebar = document.getElementById('sidebarMenu');
  const overlay = document.getElementById('sidebarOverlay');

  hamburger.classList.toggle('active');
  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
}

// ===== SUBMENU TOGGLE =====
function toggleSubmenu(id) {
  const submenu = document.getElementById(id);
  submenu.classList.toggle('open');
}

// ========== FULL MOCK ORCHESTRATION ==========
const FULL_MOCK_STORAGE_KEY = 'FULL_MOCK_DATA';

function startFullMock() {
  // Randomly select tests (name will be collected in full-mock.html gate screen)
  const L = (Math.floor(Math.random() * 9) + 1).toString().padStart(2, '0');
  const R = (Math.floor(Math.random() * 10) + 1).toString().padStart(2, '0');
  const W = (Math.floor(Math.random() * 5) + 1).toString().padStart(2, '0');
  const S = (Math.floor(Math.random() * 5) + 1).toString().padStart(2, '0');

  // Navigate to unified full mock engine
  window.location.href = `full-mock.html?L=${L}&R=${R}&W=${W}&S=${S}`;
}

function updateFullMockUI() {
  const dataStr = sessionStorage.getItem(FULL_MOCK_STORAGE_KEY);
  const bar = document.getElementById('fullMockBar');
  const progress = document.getElementById('fullMockProgress');

  if (!dataStr) {
    if (bar) bar.classList.add('visible');
    if (progress) progress.classList.remove('active');
    return;
  }

  const data = JSON.parse(dataStr);
  if (!data.active) {
    if (bar) bar.classList.add('visible');
    if (progress) progress.classList.remove('active');
    return;
  }

  // Show progress container, hide start bar
  if (bar) bar.classList.remove('visible');
  if (progress) progress.classList.add('active');

  // Update steps
  for (let i = 1; i <= 4; i++) {
    const stepEl = document.getElementById(`fm-step-${i}`);
    if (!stepEl) continue;
    stepEl.classList.remove('active', 'completed');
    if (i < data.step) {
      stepEl.classList.add('completed');
    } else if (i === data.step) {
      stepEl.classList.add('active');
    }
  }

  // Update resume button text
  const resumeBtn = progress.querySelector('.fm-resume-btn');
  if (resumeBtn) {
    const stepNames = ['', 'Start Listening', 'Start Reading', 'Start Writing', 'Start Speaking'];
    resumeBtn.textContent = data.step > 4 ? 'Finish Mock' : stepNames[data.step] || 'Resume Test';
  }
}

function resumeFullMock() {
  const dataStr = sessionStorage.getItem(FULL_MOCK_STORAGE_KEY);
  if (!dataStr) return;

  const data = JSON.parse(dataStr);
  if (!data.active) return;

  if (data.step > 4) {
    showFullMockCompletion();
    return;
  }

  let url = '';
  let type = '';

  switch (data.step) {
    case 1:
      // Load CEFR Listening.html directly (not Mocks.html) to keep iframe context
      url = `CEFR Listening.html?test=${data.tests.listening}&fullMock=true`;
      type = 'listening';
      break;
    case 2:
      // Load CEFR Reading.html directly (not Mocks.html) to keep iframe context
      url = `CEFR Reading.html?test=${data.tests.reading}&fullMock=true`;
      type = 'reading';
      break;
    case 3:
      url = `Writing Mocks.html?fullMock=true&name=${encodeURIComponent(data.name)}`;
      type = 'writing';
      break;
    case 4:
      url = `Speaking Mocks.html?fullMock=true&name=${encodeURIComponent(data.name)}`;
      type = 'speaking';
      break;
  }

  if (url) {
    loadMock(url, type);
  }
}

function exitFullMock() {
  if (confirm("Are you sure you want to exit the Full Mock? Your progress will be lost.")) {
    sessionStorage.removeItem(FULL_MOCK_STORAGE_KEY);
    updateFullMockUI();
  }
}

function showFullMockCompletion() {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;z-index:999999;padding:20px';

  overlay.innerHTML = `
        <div style="background:white;border-radius:24px;max-width:500px;width:100%;padding:40px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.4);animation:scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)">
          <div style="font-size:80px;margin-bottom:20px">🎉</div>
          <h2 style="font-size:28px;color:#116a60;margin-bottom:12px">Congratulations!</h2>
          <p style="color:#64748b;font-size:16px;line-height:1.6;margin-bottom:30px">You have successfully completed the Full Multi-Skill Mock Exam. You can find your individual skill certificates in each module's results section.</p>
          <button id="finishFullMockBtn" style="padding:14px 40px;background:linear-gradient(135deg,#116a60 0%,#0e5a52 100%);color:white;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 10px 20px rgba(17,106,96,0.3);transition:all 0.3s">Return to Dashboard</button>
        </div>
        <style>
          @keyframes scaleIn {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        </style>
      `;

  overlay.querySelector('#finishFullMockBtn').onclick = function () {
    sessionStorage.removeItem(FULL_MOCK_STORAGE_KEY);
    overlay.remove();
    updateFullMockUI();
  };

  document.body.appendChild(overlay);
}

// ===== DYNAMIC GRAMMAR MENU =====
// ✏️ TO ADD A NEW GRAMMAR TEST: Just add a new line
const grammarTests = [
  { file: 'test.html?test=subjunctive-mood01&type=grammar', name: 'Subjunctive Mood', icon: '📝' },
  { file: 'test.html?test=question-compare01&type=grammar', name: 'Question & Compare', icon: '❓' },
  { file: 'test.html?test=present-tenses-day04&type=grammar', name: 'Present Tenses Day 4', icon: '🕐' },
  { file: 'test.html?test=gerunds-infinitives01&type=grammar', name: 'Gerunds vs Infinitives', icon: '📖' }
  // Add more grammar tests here
];

// ===== DYNAMIC VOCABULARY MENU =====
// ✏️ TO ADD A NEW VOCABULARY TEST: Just add a new line
const vocabTests = [
  { file: 'test.html?test=mixed-vocab01&type=vocabulary', name: 'Mixed Vocabulary', icon: '🔤' },
  { file: 'test.html?test=architecture-urban01&type=vocabulary', name: 'Architecture & Urban Planning', icon: '🏙️' },
  { file: 'test.html?test=art-design-fashion01&type=vocabulary', name: 'Art, Design & Fashion', icon: '🎨' },
  { file: 'test.html?test=crime-law01&type=vocabulary', name: 'Crime & Law', icon: '⚖️' },
  { file: 'test.html?test=digital-frontier01&type=vocabulary', name: 'Digital Frontier', icon: '💻' },
  { file: 'test.html?test=disasters-geography01&type=vocabulary', name: 'Natural Disasters & Geography', icon: '🌋' },
  { file: 'test.html?test=education-learning01&type=vocabulary', name: 'Education & Learning', icon: '📚' },
  { file: 'test.html?test=environment-climate01&type=vocabulary', name: 'Environment & Climate', icon: '🌍' },
  { file: 'test.html?test=family-friends01&type=vocabulary', name: 'Family, Friends & Relationships', icon: '👨‍👩‍👧‍👦' },
  { file: 'test.html?test=films-books-music01&type=vocabulary', name: 'Films, Books & Music', icon: '🎬' },
  { file: 'test.html?test=food-nutrition01&type=vocabulary', name: 'Food & Nutrition', icon: '🥗' },
  { file: 'test.html?test=free-time-sports01&type=vocabulary', name: 'Free Time, Hobbies & Sports', icon: '⚽' },
  { file: 'test.html?test=health-body01&type=vocabulary', name: 'Health & Body', icon: '🏥' },
  { file: 'test.html?test=history-culture01&type=vocabulary', name: 'History & Cultural Heritage', icon: '📜' },
  { file: 'test.html?test=housing-city-life01&type=vocabulary', name: 'Housing & City Life', icon: '🏠' },
  { file: 'test.html?test=human-rights-social01&type=vocabulary', name: 'Human Rights & Social Issues', icon: '✊' },
  { file: 'test.html?test=idioms01&type=vocabulary', name: 'Idioms & Expressions', icon: '✨' },
  { file: 'test.html?test=media-advertising01&type=vocabulary', name: 'Media & Advertising', icon: '📢' },
  { file: 'test.html?test=money-consumerism01&type=vocabulary', name: 'Money & Consumerism', icon: '💰' },
  { file: 'test.html?test=personal-intro01&type=vocabulary', name: 'Personal Intro', icon: '👤' },
  { file: 'test.html?test=personality-behavior01&type=vocabulary', name: 'Personality & Behavior', icon: '🧠' },
  { file: 'test.html?test=proverbs01&type=vocabulary', name: 'Proverbs (A1–C2)', icon: '📜' },
  { file: 'test.html?test=science-research01&type=vocabulary', name: 'Science & Research', icon: '🔬' },
  { file: 'test.html?test=space-exploration01&type=vocabulary', name: 'Space Exploration', icon: '🚀' },
  { file: 'test.html?test=tech-social-media01&type=vocabulary', name: 'Technology & Social Media', icon: '📱' },
  { file: 'test.html?test=three-part-verbs01&type=vocabulary', name: 'Three-part Phrasal Verbs', icon: '🔗' },
  { file: 'test.html?test=travel-holiday01&type=vocabulary', name: 'Travel & Holiday', icon: '✈️' },
  { file: 'test.html?test=wildlife-conservation01&type=vocabulary', name: 'Wildlife & Conservation', icon: '🦁' },
  { file: 'test.html?test=work-career01&type=vocabulary', name: 'Work & Career', icon: '💼' }
];

// ===== DYNAMIC FLASHCARDS MENU =====
// ✏️ TO ADD A NEW FLASHCARD TOPIC:
// Just add a new line like: { file: 'your-file.js', name: 'Display Name' }
// Icon is OPTIONAL - if not provided, 📚 will be used as default
const flashcardTopics = [
  { file: 'idioms01.js', name: 'Idioms', icon: '💬' },
  { file: 'digital-frontier01.js', name: 'Digital Frontier', icon: '💻' },
  { file: 'short-questions01.js', name: 'Short Questions', icon: '❓' },
  { file: 'personal-intro01.js', name: 'Personal Intro', icon: '👤' },
  { file: 'present-tenses01.js', name: 'Present Tenses', icon: '🕐' },
  { file: 'family-friends01.js', name: 'Family, Friends & Relationships', icon: '👨‍👩‍👧‍👦' },
  { file: 'education-learning01.js', name: 'Education & Learning', icon: '📚' },
  { file: 'infinitive-gerund01.js', name: 'Infinitive & Gerund', icon: '📖' },
  { file: 'free-time-sports01.js', name: 'Free Time, Hobbies & Sports', icon: '⚽' },
  { file: 'travel-holiday01.js', name: 'Travel & Holiday', icon: '✈️' },
  { file: 'health-body01.js', name: 'Health & Body', icon: '🏥' },
  { file: 'tech-social-media01.js', name: 'Technology & Social Media', icon: '📱' },
  { file: 'environment-climate01.js', name: 'Environment & Climate', icon: '🌍' },
  { file: 'housing-city-life01.js', name: 'Housing & City Life', icon: '🏠' },
  { file: 'films-books-music01.js', name: 'Films, Books & Music', icon: '🎬' },
  { file: 'work-career01.js', name: 'Work & Career', icon: '💼' },
  { file: 'crime-law01.js', name: 'Crime & Law', icon: '⚖️' },
  { file: 'media-advertising01.js', name: 'Media & Advertising', icon: '📢' },
  { file: 'food-nutrition01.js', name: 'Food & Nutrition', icon: '🥗' },
  { file: 'money-consumerism01.js', name: 'Money & Consumerism', icon: '💰' },
  { file: 'personality-behavior01.js', name: 'Personality & Behavior', icon: '🧠' },
  { file: 'art-design-fashion01.js', name: 'Art, Design & Fashion', icon: '🎨' },
  { file: 'science-research01.js', name: 'Science & Research', icon: '🔬' },
  { file: 'history-culture01.js', name: 'History & Cultural Heritage', icon: '📜' },
  { file: 'architecture-urban01.js', name: 'Architecture & Urban Planning', icon: '🏙️' },
  { file: 'wildlife-conservation01.js', name: 'Wildlife & Conservation', icon: '🦁' },
  { file: 'space-exploration01.js', name: 'Space Exploration', icon: '🚀' },
  { file: 'disasters-geography01.js', name: 'Natural Disasters & Geography', icon: '🌋' },
  { file: 'human-rights-social01.js', name: 'Human Rights & Social Issues', icon: '⚖️' },
  { file: 'proverbs01.js', name: '100 Common Proverbs', icon: '📜' },
  { file: 'small-talk01.js', name: 'Small Talk Collocations', icon: '💬' },
  { file: 'three-part-verbs01.js', name: 'Three-part Phrasal Verbs', icon: '🔗' },
  { file: 'letter-email-phrases01.js', name: 'Letter & Email Phrases', icon: '✉️' }
  // Examples:




  // { file: 'phrasal-verbs01.js', name: 'Phrasal Verbs', icon: '🔤' },
  // { file: 'business01.js', name: 'Business Vocab' },  // ← no icon = uses default 📚
];

const cefrSpeakingTests = [
  {
    "file": "questions S/questions.js",
    "name": "Mock 01"
  },
  {
    "file": "questions S/questions02.js",
    "name": "Mock 02"
  },
  {
    "file": "questions S/questions03.js",
    "name": "Mock 03"
  },
  {
    "file": "questions S/questions04.js",
    "name": "Mock 04"
  },
  {
    "file": "questions S/questions05.js",
    "name": "Mock 05"
  },
  {
    "file": "questions S/questions06.js",
    "name": "Mock 06"
  },
  {
    "file": "questions S/questions07.js",
    "name": "Mock 07"
  },
  {
    "file": "questions S/questions08.js",
    "name": "Mock 08"
  },
  {
    "file": "questions S/questions09.js",
    "name": "Mock 09"
  },
  {
    "file": "questions S/questions10.js",
    "name": "Mock 10"
  },
  {
    "file": "questions S/questions11.js",
    "name": "Mock 11"
  },
  {
    "file": "questions S/questions12.js",
    "name": "Mock 12"
  },
  {
    "file": "questions S/questions13.js",
    "name": "Mock 13"
  },
  {
    "file": "questions S/questions14.js",
    "name": "Mock 14"
  },
  {
    "file": "questions S/questions15.js",
    "name": "Mock 15"
  },
  {
    "file": "questions S/questions16.js",
    "name": "Mock 16"
  },
  {
    "file": "questions S/questions17.js",
    "name": "Mock 17"
  },
  {
    "file": "questions S/questions18.js",
    "name": "Mock 18"
  },
  {
    "file": "questions S/questions19.js",
    "name": "Mock 19"
  },
  {
    "file": "questions S/questions20.js",
    "name": "Mock 20"
  },
  {
    "file": "questions S/questions21.js",
    "name": "Mock 21"
  },
  {
    "file": "questions S/questions22.js",
    "name": "Mock 22"
  },
  {
    "file": "questions S/questions23.js",
    "name": "Mock 23"
  },
  {
    "file": "questions S/questions24.js",
    "name": "Mock 24"
  },
  {
    "file": "questions S/questions25.js",
    "name": "Mock 25"
  },
  {
    "file": "questions S/questions26.js",
    "name": "Mock 26"
  },
  {
    "file": "questions S/questions27.js",
    "name": "Mock 27"
  },
  {
    "file": "questions S/questions28.js",
    "name": "Mock 28"
  },
  {
    "file": "questions S/questions29.js",
    "name": "Mock 29"
  },
  {
    "file": "questions S/questions30.js",
    "name": "Mock 30"
  },
  {
    "file": "questions S/questions31.js",
    "name": "Mock 31"
  },
  {
    "file": "questions S/questions32.js",
    "name": "Mock 32"
  },
  {
    "file": "questions S/questions33.js",
    "name": "Mock 33"
  },
  {
    "file": "questions S/questions34.js",
    "name": "Mock 34"
  },
  {
    "file": "questions S/questions35.js",
    "name": "Mock 35"
  },
  {
    "file": "questions S/questions36.js",
    "name": "Mock 36"
  },
  {
    "file": "questions S/questions37.js",
    "name": "Mock 37"
  },
  {
    "file": "questions S/questions38.js",
    "name": "Mock 38"
  },
  {
    "file": "questions S/questions39.js",
    "name": "Mock 39"
  },
  {
    "file": "questions S/questions40.js",
    "name": "Mock 40"
  },
  {
    "file": "questions S/questions41.js",
    "name": "Mock 41"
  },
  {
    "file": "questions S/questions42.js",
    "name": "Mock 42"
  },
  {
    "file": "questions S/questions43.js",
    "name": "Mock 43"
  },
  {
    "file": "questions S/questions44.js",
    "name": "Mock 44"
  },
  {
    "file": "questions S/questions45.js",
    "name": "Mock 45"
  },
  {
    "file": "questions S/questions46.js",
    "name": "Mock 46"
  },
  {
    "file": "questions S/questions47.js",
    "name": "Mock 47"
  },
  {
    "file": "questions S/questions48.js",
    "name": "Mock 48"
  },
  {
    "file": "questions S/questions49.js",
    "name": "Mock 49"
  },
  {
    "file": "questions S/questions50.js",
    "name": "Mock 50"
  },
  {
    "file": "questions S/questions51.js",
    "name": "Mock 51"
  },
  {
    "file": "questions S/questions52.js",
    "name": "Mock 52"
  },
  {
    "file": "questions S/questions53.js",
    "name": "Mock 53"
  },
  {
    "file": "questions S/questions54.js",
    "name": "Mock 54"
  },
  {
    "file": "questions S/questions55.js",
    "name": "Mock 55"
  },
  {
    "file": "questions S/questions56.js",
    "name": "Mock 56"
  },
  {
    "file": "questions S/questions57.js",
    "name": "Mock 57"
  },
  {
    "file": "questions S/questions58.js",
    "name": "Mock 58"
  },
  {
    "file": "questions S/questions59.js",
    "name": "Mock 59"
  },
  {
    "file": "questions S/questions60.js",
    "name": "Mock 60"
  },
  {
    "file": "questions S/questions61.js",
    "name": "Mock 61"
  },
  {
    "file": "questions S/questions62.js",
    "name": "Mock 62"
  },
  {
    "file": "questions S/questions63.js",
    "name": "Mock 63"
  },
  {
    "file": "questions S/questions64.js",
    "name": "Mock 64"
  },
  {
    "file": "questions S/questions65.js",
    "name": "Mock 65"
  },
  {
    "file": "questions S/questions66.js",
    "name": "Mock 66"
  },
  {
    "file": "questions S/questions67.js",
    "name": "Mock 67"
  },
  {
    "file": "questions S/questions68.js",
    "name": "Mock 68"
  },
  {
    "file": "questions S/questions69.js",
    "name": "Mock 69"
  },
  {
    "file": "questions S/questions70.js",
    "name": "Mock 70"
  },
  {
    "file": "questions S/questions71.js",
    "name": "Mock 71"
  },
  {
    "file": "questions S/questions72.js",
    "name": "Mock 72"
  },
  {
    "file": "questions S/questions73.js",
    "name": "Mock 73"
  },
  {
    "file": "questions S/questions74.js",
    "name": "Mock 74"
  },
  {
    "file": "questions S/questions75.js",
    "name": "Mock 75"
  },
  {
    "file": "questions S/questions76.js",
    "name": "Mock 76"
  },
  {
    "file": "questions S/questions77.js",
    "name": "Mock 77"
  },
  {
    "file": "questions S/questions78.js",
    "name": "Mock 78"
  },
  {
    "file": "questions S/questions79.js",
    "name": "Mock 79"
  },
  {
    "file": "questions S/questions80.js",
    "name": "Mock 80"
  },
  {
    "file": "questions S/questions81.js",
    "name": "Mock 81"
  },
  {
    "file": "questions S/questions82.js",
    "name": "Mock 82"
  },
  {
    "file": "questions S/questions83.js",
    "name": "Mock 83"
  },
  {
    "file": "questions S/questions84.js",
    "name": "Mock 84"
  },
  {
    "file": "questions S/questions85.js",
    "name": "Mock 85"
  },
  {
    "file": "questions S/questions86.js",
    "name": "Mock 86"
  },
  {
    "file": "questions S/questions87.js",
    "name": "Mock 87"
  },
  {
    "file": "questions S/questions88.js",
    "name": "Mock 88"
  },
  {
    "file": "questions S/questions89.js",
    "name": "Mock 89"
  },
  {
    "file": "questions S/questions90.js",
    "name": "Mock 90"
  },
  {
    "file": "questions S/questions91.js",
    "name": "Mock 91"
  },
  {
    "file": "questions S/questions92.js",
    "name": "Mock 92"
  },
  {
    "file": "questions S/questions93.js",
    "name": "Mock 93"
  },
  {
    "file": "questions S/questions94.js",
    "name": "Mock 94"
  },
  {
    "file": "questions S/questions95.js",
    "name": "Mock 95"
  },
  {
    "file": "questions S/questions96.js",
    "name": "Mock 96"
  },
  {
    "file": "questions S/questions97.js",
    "name": "Mock 97"
  },
  {
    "file": "questions S/questions98.js",
    "name": "Mock 98"
  },
  {
    "file": "questions S/questions99.js",
    "name": "Mock 99"
  },
  {
    "file": "questions S/questions100.js",
    "name": "Mock 100"
  }
];

const ieltsSpeakingTests = [
  {
    "file": "questions IELTS S/ielts-speaking-mock-1.js",
    "name": "Mock 01"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-2.js",
    "name": "Mock 02"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-3.js",
    "name": "Mock 03"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-4.js",
    "name": "Mock 04"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-5.js",
    "name": "Mock 05"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-6.js",
    "name": "Mock 06"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-7.js",
    "name": "Mock 07"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-8.js",
    "name": "Mock 08"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-9.js",
    "name": "Mock 09"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-10.js",
    "name": "Mock 10"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-11.js",
    "name": "Mock 11"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-12.js",
    "name": "Mock 12"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-13.js",
    "name": "Mock 13"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-14.js",
    "name": "Mock 14"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-15.js",
    "name": "Mock 15"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-16.js",
    "name": "Mock 16"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-17.js",
    "name": "Mock 17"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-18.js",
    "name": "Mock 18"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-19.js",
    "name": "Mock 19"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-20.js",
    "name": "Mock 20"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-21.js",
    "name": "Mock 21"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-22.js",
    "name": "Mock 22"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-23.js",
    "name": "Mock 23"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-24.js",
    "name": "Mock 24"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-25.js",
    "name": "Mock 25"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-26.js",
    "name": "Mock 26"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-27.js",
    "name": "Mock 27"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-28.js",
    "name": "Mock 28"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-29.js",
    "name": "Mock 29"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-30.js",
    "name": "Mock 30"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-31.js",
    "name": "Mock 31"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-32.js",
    "name": "Mock 32"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-33.js",
    "name": "Mock 33"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-34.js",
    "name": "Mock 34"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-35.js",
    "name": "Mock 35"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-36.js",
    "name": "Mock 36"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-37.js",
    "name": "Mock 37"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-38.js",
    "name": "Mock 38"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-39.js",
    "name": "Mock 39"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-40.js",
    "name": "Mock 40"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-41.js",
    "name": "Mock 41"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-42.js",
    "name": "Mock 42"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-43.js",
    "name": "Mock 43"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-44.js",
    "name": "Mock 44"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-45.js",
    "name": "Mock 45"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-46.js",
    "name": "Mock 46"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-47.js",
    "name": "Mock 47"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-48.js",
    "name": "Mock 48"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-49.js",
    "name": "Mock 49"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-50.js",
    "name": "Mock 50"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-51.js",
    "name": "Mock 51"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-52.js",
    "name": "Mock 52"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-53.js",
    "name": "Mock 53"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-54.js",
    "name": "Mock 54"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-55.js",
    "name": "Mock 55"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-56.js",
    "name": "Mock 56"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-57.js",
    "name": "Mock 57"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-58.js",
    "name": "Mock 58"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-59.js",
    "name": "Mock 59"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-60.js",
    "name": "Mock 60"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-61.js",
    "name": "Mock 61"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-62.js",
    "name": "Mock 62"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-63.js",
    "name": "Mock 63"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-64.js",
    "name": "Mock 64"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-65.js",
    "name": "Mock 65"
  },
  {
    "file": "questions IELTS S/ielts-speaking-mock-66.js",
    "name": "Mock 66"
  }
];


// ===== LISTENING TESTS =====

const cefrListeningTests = [
  { file: 'CEFR Listening.html?test=cefr-listening-test-01', name: 'CEFR Listening Test 01', icon: '🎧', actionText: 'Take Test' },
  { file: 'CEFR Listening.html?test=cefr-listening-test-02', name: 'CEFR Listening Test 02', icon: '🎧', actionText: 'Take Test' },
  { file: 'CEFR Listening.html?test=cefr-listening-test-03', name: 'CEFR Listening Test 03', icon: '🎧', actionText: 'Take Test' },
  { file: 'CEFR Listening.html?test=cefr-listening-test-04', name: 'CEFR Listening Test 04', icon: '🎧', actionText: 'Take Test' },
  { file: 'CEFR Listening.html?test=cefr-listening-test-05', name: 'CEFR Listening Test 05', icon: '🎧', actionText: 'Take Test' },
  { file: 'CEFR Listening.html?test=cefr-listening-test-06', name: 'CEFR Listening Test 06', icon: '🎧', actionText: 'Take Test' },
  { file: 'CEFR Listening.html?test=cefr-listening-test-07', name: 'CEFR Listening Test 07', icon: '🎧', actionText: 'Take Test' },
  { file: 'CEFR Listening.html?test=cefr-listening-test-08', name: 'CEFR Listening Test 08', icon: '🎧', actionText: 'Take Test' },
  { file: 'CEFR Listening.html?test=cefr-listening-test-09', name: 'CEFR Listening Test 09', icon: '🎧', actionText: 'Take Test' },
  { file: 'CEFR Listening.html?test=cefr-listening-test-10', name: 'CEFR Listening Test 10', icon: '🎧', actionText: 'Take Test' },
];

const ieltsListeningTests = [
  { file: 'IELTS listening.html?test=ielts-listening-test-01', name: 'IELTS Listening Practice Test 01', icon: '🎧', actionText: 'Take Test' },
  { file: 'IELTS listening.html?test=ielts-listening-test-02', name: 'IELTS Listening Practice Test 02', icon: '🎧', actionText: 'Take Test' },
  { file: 'IELTS listening.html?test=ielts-listening-test-03', name: 'IELTS Listening Practice Test 03', icon: '🎧', actionText: 'Take Test' },
  { file: 'IELTS listening.html?test=ielts-listening-test-04', name: 'IELTS Listening Practice Test 04', icon: '🎧', actionText: 'Take Test' },
  { file: 'IELTS listening.html?test=ielts-listening-test-05', name: 'IELTS Listening Practice Test 05', icon: '🎧', actionText: 'Take Test' },
  { file: 'IELTS listening.html?test=ielts-listening-test-06', name: 'IELTS Listening Practice Test 06', icon: '🎧', actionText: 'Take Test' },
  { file: 'IELTS listening.html?test=ielts-listening-test-07', name: 'IELTS Listening Practice Test 07', icon: '🎧', actionText: 'Take Test' },
  { file: 'IELTS listening.html?test=ielts-listening-test-08', name: 'IELTS Listening Practice Test 08', icon: '🎧', actionText: 'Take Test' },
  { file: 'IELTS listening.html?test=ielts-listening-test-09', name: 'IELTS Listening Practice Test 09', icon: '🎧', actionText: 'Take Test' },
  { file: 'IELTS listening.html?test=ielts-listening-test-10', name: 'IELTS Listening Practice Test 10', icon: '🎧', actionText: 'Take Test' },
  { file: 'IELTS listening.html?test=ielts-listening-test-11', name: 'IELTS Listening Practice Test 11', icon: '🎧', actionText: 'Take Test' },
  { file: 'IELTS listening.html?test=ielts-listening-test-12', name: 'IELTS Listening Practice Test 12', icon: '🎧', actionText: 'Take Test' },
  { file: 'IELTS listening.html?test=ielts-listening-test-13', name: 'IELTS Listening Practice Test 13', icon: '🎧', actionText: 'Take Test' },
  { file: 'IELTS listening.html?test=ielts-listening-test-14', name: 'IELTS Listening Practice Test 14', icon: '🎧', actionText: 'Take Test' },
  { file: 'IELTS listening.html?test=ielts-listening-test-15', name: 'IELTS Listening Practice Test 15', icon: '🎧', actionText: 'Take Test' },
  { file: 'IELTS listening.html?test=ielts-listening-test-16', name: 'IELTS Listening Practice Test 16', icon: '🎧', actionText: 'Take Test' },
  { file: 'IELTS listening.html?test=ielts-listening-test-17', name: 'IELTS Listening Practice Test 17', icon: '🎧', actionText: 'Take Test' },
];

// ===== READING TESTS =====

const cefrReadingTests = [
  { file: 'CEFR Reading.html?test=cefr-reading-test-01', name: 'CEFR Reading Test 01', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-02', name: 'CEFR Reading Test 02', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-03', name: 'CEFR Reading Test 03', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-04', name: 'CEFR Reading Test 04', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-05', name: 'CEFR Reading Test 05', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-06', name: 'CEFR Reading Test 06', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-07', name: 'CEFR Reading Test 07', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-08', name: 'CEFR Reading Test 08', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-09', name: 'CEFR Reading Test 09', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-10', name: 'CEFR Reading Test 10', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-11', name: 'CEFR Reading Test 11', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-12', name: 'CEFR Reading Test 12', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-13', name: 'CEFR Reading Test 13', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-14', name: 'CEFR Reading Test 14', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-15', name: 'CEFR Reading Test 15', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-16', name: 'CEFR Reading Test 16', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-17', name: 'CEFR Reading Test 17', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-18', name: 'CEFR Reading Test 18', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-19', name: 'CEFR Reading Test 19', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-20', name: 'CEFR Reading Test 20', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-21', name: 'CEFR Reading Test 21', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-22', name: 'CEFR Reading Test 22', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-23', name: 'CEFR Reading Test 23', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-24', name: 'CEFR Reading Test 24', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-25', name: 'CEFR Reading Test 25', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-26', name: 'CEFR Reading Test 26', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-27', name: 'CEFR Reading Test 27', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-28', name: 'CEFR Reading Test 28', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-29', name: 'CEFR Reading Test 29', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-30', name: 'CEFR Reading Test 30', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-31', name: 'CEFR Reading Test 31', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-32', name: 'CEFR Reading Test 32', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-33', name: 'CEFR Reading Test 33', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-34', name: 'CEFR Reading Test 34', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-35', name: 'CEFR Reading Test 35', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-36', name: 'CEFR Reading Test 36', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-37', name: 'CEFR Reading Test 37', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-38', name: 'CEFR Reading Test 38', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-39', name: 'CEFR Reading Test 39', icon: '📖', actionText: 'Take Test' },
  { file: 'CEFR Reading.html?test=cefr-reading-test-40', name: 'CEFR Reading Test 40', icon: '📖', actionText: 'Take Test' },
];

const ieltsReadingTests = [
  { file: 'IELTS reading.html?test=ielts-reading-test-01.js', name: 'IELTS Reading Practice Test 01', icon: '📖', actionText: 'Take Test' },
  { file: 'IELTS reading.html?test=ielts-reading-test-02.js', name: 'IELTS Reading Practice Test 02', icon: '📖', actionText: 'Take Test' },
  { file: 'IELTS reading.html?test=ielts-reading-test-03.js', name: 'IELTS Reading Practice Test 03', icon: '📖', actionText: 'Take Test' },
  { file: 'IELTS reading.html?test=ielts-reading-test-04.js', name: 'IELTS Reading Practice Test 04', icon: '📖', actionText: 'Take Test' },
  { file: 'IELTS reading.html?test=ielts-reading-test-46.js', name: 'IELTS Reading Practice Test 46', icon: '📖', actionText: 'Take Test' },
  { file: 'IELTS reading.html?test=ielts-reading-test-47.js', name: 'IELTS Reading Practice Test 47', icon: '📖', actionText: 'Take Test' },
  { file: 'IELTS reading.html?test=ielts-reading-test-48.js', name: 'IELTS Reading Practice Test 48', icon: '📖', actionText: 'Take Test' },
  { file: 'IELTS reading.html?test=ielts-reading-test-49.js', name: 'IELTS Reading Practice Test 49', icon: '📖', actionText: 'Take Test' },
  { file: 'IELTS reading.html?test=ielts-reading-test-50.js', name: 'IELTS Reading Practice Test 50', icon: '📖', actionText: 'Take Test' },
];

// ===== DYNAMIC ARTICLES MENU =====
const readingArticles = [
  { file: 'Articles.html?article=01', name: 'Article 01: Green Packaging (22 words)', icon: '📰' },
  { file: 'Articles.html?article=02', name: 'Article 02: Too Much Traffic (25 words)', icon: '📰' },
  { file: 'Articles.html?article=03', name: 'Article 03: Bullying (22 words)', icon: '📰' },
  { file: 'Articles.html?article=04', name: 'Article 04: Growing Old (24 words)', icon: '📰' },
  { file: 'Articles.html?article=05', name: 'Article 05: Parental Aspirations (18 words)', icon: '📰' },
  { file: 'Articles.html?article=06', name: 'Article 06: Discrimination against Disability (22 words)', icon: '📰' },
  { file: 'Articles.html?article=07', name: 'Article 07: Football Hooligans (21 words)', icon: '📰' },
  { file: 'Articles.html?article=08', name: 'Article 08: Travel Troubles (23 words)', icon: '📰' },
  { file: 'Articles.html?article=09', name: 'Article 09: New Research on Computer Games (18 words)', icon: '📰' },
  { file: 'Articles.html?article=10', name: 'Article 10: Terrorism (25 words)', icon: '📰' },
  { file: 'Articles.html?article=11', name: 'Article 11: Healthy Eating (22 words)', icon: '📰' },
  { file: 'Articles.html?article=12', name: 'Article 12: Food Scares (20 words)', icon: '📰' },
  { file: 'Articles.html?article=13', name: 'Article 13: The Dangers of Passive Smoking (18 words)', icon: '📰' },
  { file: 'Articles.html?article=14', name: 'Article 14: A Donor Shortage (21 words)', icon: '📰' },
  { file: 'Articles.html?article=15', name: 'Article 15: The Benefits of Chocolate (23 words)', icon: '📰' },
  { file: 'Articles.html?article=16', name: 'Article 16: Climate Change (24 words)', icon: '📰' },
  { file: 'Articles.html?article=17', name: 'Article 17: Endangered Species (22 words)', icon: '📰' },
  { file: 'Articles.html?article=18', name: 'Article 18: Modern Celebrities (22 words)', icon: '📰' },
  { file: 'Articles.html?article=19', name: 'Article 19: The Right to Die (19 words)', icon: '📰' },
  { file: 'Articles.html?article=20', name: 'Article 20: All Kinds of Rage (24 words)', icon: '📰' },
  { file: 'Articles.html?article=21', name: 'Article 21: Ageing Populations (22 words)', icon: '📰' },
  { file: 'Articles.html?article=22', name: 'Article 22: Gender Discrimination (20 words)', icon: '📰' },
  { file: 'Articles.html?article=23', name: 'Article 23: Taking Time Out (23 words)', icon: '📰' },
  { file: 'Articles.html?article=24', name: 'Article 24: Gambling Figures Escalate (24 words)', icon: '📰' },
  { file: 'Articles.html?article=25', name: 'Article 25: Advances in Detection (23 words)', icon: '📰' },
  { file: 'Articles.html?article=26', name: 'Article 26: Computer Crime (24 words)', icon: '📰' },
  { file: 'Articles.html?article=27', name: 'Article 27: Eating Disorders (24 words)', icon: '📰' },
  { file: 'Articles.html?article=28', name: 'Article 28: Stress at Work (23 words)', icon: '📰' },
  { file: 'Articles.html?article=29', name: 'Article 29: A Sudden Decision (16 words)', icon: '📰' },
  { file: 'Articles.html?article=30', name: 'Article 30: Blood Transfusion Fears (25 words)', icon: '📰' },
  { file: 'Articles.html?article=31', name: 'Article 31: The Mystery of Asthma (21 words)', icon: '📰' },
  { file: 'Articles.html?article=32', name: 'Article 32: Bad News (22 words)', icon: '📰' },
  { file: 'Articles.html?article=33', name: 'Article 33: Surprising News (21 words)', icon: '📰' },
  { file: 'Articles.html?article=34', name: 'Article 34: Coping with Misery (24 words)', icon: '📰' },
  { file: 'Articles.html?article=35', name: 'Article 35: Time to Study (22 words)', icon: '📰' },
  { file: 'Articles.html?article=36', name: 'Article 36: Job Losses (28 words)', icon: '📰' },
  { file: 'Articles.html?article=37', name: 'Article 37: Football Defeat (25 words)', icon: '📰' },
  { file: 'Articles.html?article=38', name: 'Article 38: A Disappointment (28 words)', icon: '📰' },
  { file: 'Articles.html?article=39', name: 'Article 39: A Letter of Apology (41 words)', icon: '📰' },
  { file: 'Articles.html?article=40', name: 'Article 40: A Lucky Escape (33 words)', icon: '📰' },
  { file: 'Articles.html?article=41', name: 'Article 41: A Day of Misfortunes (39 words)', icon: '📰' },
  { file: 'Articles.html?article=42', name: 'Article 42: Goodbye and Hello (35 words)', icon: '📰' },
  { file: 'Articles.html?article=43', name: 'Article 43: Bridge Delay (48 words)', icon: '📰' },
  { file: 'Articles.html?article=44', name: 'Article 44: A Birthday Party (41 words)', icon: '📰' },
  { file: 'Articles.html?article=45', name: 'Article 45: Reluctant Attendance (55 words)', icon: '📰' },
  { file: 'Articles.html?article=46', name: 'Article 46: Facing Angry Parents (51 words)', icon: '📰' },
  { file: 'Articles.html?article=47', name: 'Article 47: A Sudden Decision (51 words)', icon: '📰' },
  { file: 'Articles.html?article=48', name: 'Article 48: More Break-ins (58 words)', icon: '📰' },
  { file: 'Articles.html?article=49', name: 'Article 49: Obituary (66 words)', icon: '📰' },
  { file: 'Articles.html?article=50', name: 'Article 50: Going on a Diet (58 words)', icon: '📰' },
  { file: 'Articles.html?article=51', name: 'Article 51: A Change of Plan (50 words)', icon: '📰' },
  { file: 'Articles.html?article=52', name: 'Article 52: A Grim Discovery (18 words)', icon: '📰' },
  { file: 'Articles.html?article=53', name: 'Article 53: A Sales Report (20 words)', icon: '📰' },
  { file: 'Articles.html?article=54', name: 'Article 54: Problems at Work (19 words)', icon: '📰' },
  { file: 'Articles.html?article=55', name: 'Article 55: Health Scares (19 words)', icon: '📰' },
  { file: 'Articles.html?article=56', name: 'Article 56: Young Children Value the Lives of Animals More Than Adults Do (20 words)', icon: '📰' },
  { file: 'Articles.html?article=57', name: 'Article 57: Climate Strikes Grow Up (16 words)', icon: '📰' },
  { file: 'Articles.html?article=58', name: 'Article 58: Burning Issue (18 words)', icon: '📰' },
  { file: 'Articles.html?article=59', name: 'Article 59: No Planet B (18 words)', icon: '📰' },
  { file: 'Articles.html?article=60', name: 'Article 60: Ancestral Voices (18 words)', icon: '📰' },
  { file: 'Articles.html?article=61', name: 'Article 61: Who Wants a Predictable Life? (18 words)', icon: '📰' },
  { file: 'Articles.html?article=62', name: 'Article 62: Shift in the Gulf Stream (19 words)', icon: '📰' },
  { file: 'Articles.html?article=63', name: "Article 63: Why Yuri Gagarin Wasn't the First in Space (26 words)", icon: '📰' },
  { file: 'Articles.html?article=64', name: 'Article 64: The Real Reasons Birth Rates Are Declining Worldwide (29 words)', icon: '📰' },
  { file: 'Articles.html?article=65', name: 'Article 65: Why Falling Birth Rates Will Be a Bigger Problem Than Overpopulation (21 words)', icon: '📰' },
  { file: 'Articles.html?article=66', name: 'Article 66: How Worried Should You Be About Microplastics? (34 words)', icon: '📰' },
  { file: 'Articles.html?article=67', name: 'Article 67: Can Magnesium Supplements Improve Sleep, Energy and Concentration? (30 words)', icon: '📰' },
  { file: 'Articles.html?article=68', name: 'Article 68: People Who Eat a Lot of Fibre Spend More Time in Deep Sleep (20 words)', icon: '📰' },
  { file: 'Articles.html?article=69', name: 'Article 69: Earth Is Now Heating Up Twice as Fast as in Previous Decades (26 words)', icon: '📰' },
  { file: 'Articles.html?article=70', name: 'Article 70: Sea Levels Around the World Are Much Higher Than We Thought (27 words)', icon: '📰' },
  { file: 'Articles.html?article=71', name: 'Article 71: Claude AI: Why are there so many internet outages? (919 words)', icon: '📰' },
  { file: 'Articles.html?article=72', name: "Article 72: The internet feels super lonely right now. Here's why (850 words)", icon: '📰' },
  { file: 'Articles.html?article=73', name: 'Article 73: Atmospheric pollution caused by space junk could be a huge problem (480 words)', icon: '📰' },
  { file: 'Articles.html?article=74', name: "Article 74: It's your perception of sleep that's making you feel tired all day (1449 words)", icon: '📰' },
];

// ===== UPDATE LEARNING TOOLS COUNTS =====
function updateLearningToolsCounts() {
  const grammarCount = grammarTests.length;
  const vocabCount = vocabTests.length;
  const flashcardsCount = flashcardTopics.length;
  const testsCount = grammarCount + vocabCount;

  // Update sidebar badges (new structure)
  const testsSidebar = document.getElementById('testsCountSidebar');
  const flashcardsSidebar = document.getElementById('flashcardsCountSidebar');

  if (testsSidebar) testsSidebar.textContent = testsCount + ' Tests';
  if (flashcardsSidebar) flashcardsSidebar.textContent = flashcardsCount + ' Topics';

  // Update main content (new structure)
  const testsMain = document.getElementById('testsCountMain');
  const flashcardsMain = document.getElementById('flashcardsCountMain');
  const testsBadge = document.getElementById('testsCountBadge');
  const testsGrammar = document.getElementById('testsGrammarCount');
  const testsVocab = document.getElementById('testsVocabCount');

  if (testsMain) testsMain.textContent = 'Grammar & Vocabulary';
  if (flashcardsMain) flashcardsMain.textContent = flashcardsCount + ' topics for quick learning';
  if (testsBadge) testsBadge.textContent = testsCount;
  if (testsGrammar) testsGrammar.textContent = grammarCount + ' tests';
  if (testsVocab) testsVocab.textContent = vocabCount + ' tests';
}

// Update counts when page loads
document.addEventListener('DOMContentLoaded', updateLearningToolsCounts);

// ===== TESTS MODAL FUNCTIONS =====
function showTestsSubmenu() {
  document.getElementById('testsModal').classList.add('show');
}

function closeTestsModal(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById('testsModal').classList.remove('show');
}

function selectTestType(type) {
  closeTestsModal();
  if (type === 'grammar' || type === 'vocabulary') {
    openCategoryModal(type);
  }
}

// ===== CATEGORY MODAL FUNCTIONS =====
function openCategoryModal(category) {
  const modal = document.getElementById('categoryModal');
  const iconEl = document.getElementById('categoryModalIcon');
  const titleEl = document.getElementById('categoryModalTitle');
  const descEl = document.getElementById('categoryModalDesc');
  const countEl = document.getElementById('categoryModalCount');
  const listEl = document.getElementById('categoryModalList');

  let items = [];
  let icon = '';
  let title = '';
  let desc = '';
  let actionText = 'Start';

  if (category === 'grammar') {
    items = grammarTests;
    icon = '📖';
    title = 'Grammar Tests';
    desc = 'Choose a grammar topic to practice';
    actionText = 'Start';
  } else if (category === 'vocabulary') {
    items = vocabTests;
    icon = '📚';
    title = 'Vocabulary Tests';
    desc = 'Choose a vocabulary topic to test';
    actionText = 'Start';
  } else if (category === 'articles') {
    items = readingArticles;
    icon = '📰';
    title = 'Reading Articles';
    desc = 'Tap an article to read and learn vocabulary';
    actionText = 'Read';
  } else if (category === 'cefr-listening') {
    items = cefrListeningTests;
    icon = '🎧';
    title = 'CEFR Listening';
    desc = 'Select a practice test';
    actionText = 'Take Test';
  } else if (category === 'ielts-listening') {
    items = ieltsListeningTests;
    icon = '🌍';
    title = 'IELTS Listening';
    desc = 'Select an official practice test';
    actionText = 'Take Test';
  } else if (category === 'cefr-reading') {
    items = cefrReadingTests;
    icon = '📖';
    title = 'CEFR Reading';
    desc = 'Select a practice test';
    actionText = 'Take Test';
  } else if (category === 'ielts-reading') {
    items = ieltsReadingTests;
    icon = '📖';
    title = 'IELTS Reading';
    desc = 'Select an official practice test';
    actionText = 'Take Test';
  } else if (category === 'cefr-speaking') {
    items = cefrSpeakingTests;
    icon = '🎤';
    title = 'CEFR Speaking';
    desc = 'Select a practice test';
    actionText = 'Take Test';
  } else if (category === 'ielts-speaking') {
    items = ieltsSpeakingTests;
    icon = '🎙️';
    title = 'IELTS Speaking';
    desc = 'Select an official practice test';
    actionText = 'Take Test';
  } else if (category === 'flashcards') {
    items = flashcardTopics;
    icon = '🃏';
    title = 'Flashcard Decks';
    desc = 'Choose a topic to study';
    actionText = 'Study';
  }

  iconEl.textContent = icon;
  titleEl.textContent = title;
  descEl.textContent = desc;
  countEl.textContent = items.length;

  // Generate list items
  const defaultIcon = '📚';
  if (items.length === 0) {
    listEl.innerHTML = `
          <div style="text-align: center; padding: 40px 20px; color: var(--muted);">
            <span style="font-size: 48px; display: block; margin-bottom: 12px; opacity: 0.5;">🔜</span>
            <span style="font-size: 14px; font-style: italic;">Coming Soon</span>
          </div>`;
  } else {
    listEl.innerHTML = items.map(item => {
      const itemIcon = item.icon || defaultIcon;
      let pageUrl = '';
      let loadType = category;
      if (category === 'flashcards') {
        const baseName = item.file.replace('.js', '');
        pageUrl = `flashcards.html?topic=${baseName}`;
      } else {
        pageUrl = item.file;
      }
      let clickHandler = `loadLearningTool('${pageUrl}', '${loadType}'); return false;`;
      let secondaryAction = '';

      if (category.includes('listening') || category.includes('reading') || category.includes('speaking')) {
        let mockType = category.includes('listening') ? 'listening' : (category.includes('reading') ? 'reading' : 'speaking');
        clickHandler = `loadMock('${pageUrl}', '${mockType}'); document.getElementById('categoryModal').classList.remove('show'); return false;`;

        // Speaking special logic: pass `&action=practice` to primary, add secondary download button
        if (category.includes('speaking')) {
          clickHandler = `loadMock('${pageUrl}&action=practice', '${mockType}'); document.getElementById('categoryModal').classList.remove('show'); return false;`;

          let downloadHandler = `loadMock('${pageUrl}&action=download', '${mockType}'); document.getElementById('categoryModal').classList.remove('show'); event.stopPropagation(); return false;`;
          secondaryAction = `<button onclick="${downloadHandler}" title="Download PDF" style="background:transparent;border:none;font-size:22px;cursor:pointer;padding:4px 8px;border-radius:6px;transition:all 0.2s;" onmouseover="this.style.background='rgba(17,106,96,0.1)';this.style.transform='scale(1.1)';" onmouseout="this.style.background='transparent';this.style.transform='scale(1)';">📥</button>`;
        }
      }
      return `
            <a href="#" onclick="${clickHandler}" class="category-modal-item" style="display:flex;align-items:center;">
              <span class="item-icon">${itemIcon}</span>
              <span class="item-name" style="flex:1;">${item.name}</span>
              ${secondaryAction}
              <span class="item-action" style="margin-left:8px;">${actionText}</span>
            </a>`;
    }).join('');

  }

  modal.classList.add('show');
}

// Load learning tools (grammar, vocab, flashcards) in iframe
function loadLearningTool(page, type) {
  if (isLoadingMock) return;
  isLoadingMock = true;
  currentLoadingType = type;

  // Close category modal
  document.getElementById('categoryModal').classList.remove('show');

  // Configure loading screen based on type
  loadingOverlay.classList.remove('speaking', 'reading', 'listening');
  if (type === 'grammar') {
    loadingIcon.textContent = '📖';
    loadingTitle.textContent = 'Loading Grammar Test';
  } else if (type === 'vocabulary') {
    loadingIcon.textContent = '📚';
    loadingTitle.textContent = 'Loading Vocabulary Test';
  } else if (type === 'flashcards') {
    loadingIcon.textContent = '🃏';
    loadingTitle.textContent = 'Loading Flashcards';
  } else if (type === 'articles') {
    loadingIcon.textContent = '📰';
    loadingTitle.textContent = 'Loading Articles';
  } else if (type === 'reading-builder') {
    loadingIcon.textContent = '📖';
    loadingTitle.textContent = 'Loading Reading Builder';
  }
  loadingSubtitle.textContent = 'Preparing your learning environment';

  // Show loading overlay
  loadingOverlay.classList.add('show');

  // Reset and start progress animation
  resetLoadingState();
  isLoadingMock = true;

  // Start loading iframe in background
  mockFrame.src = page;

  let iframeReady = false;
  let progressDone = false;
  let alreadyShown = false;

  const showTool = () => {
    if (alreadyShown) return;
    alreadyShown = true;

    loadingOverlay.classList.remove('show');
    landingPage.style.display = 'none';
    mockFrame.style.display = 'block';
    mockFrame.style.zIndex = '9999';
    mockFrame.style.pointerEvents = 'auto';
    isLoadingMock = false;
  };

  mockFrame.onload = () => {
    iframeReady = true;
    if (progressDone) showTool();
  };

  // Faster progress for learning tools
  animateProgress(() => {
    progressDone = true;
    if (iframeReady) showTool();
  }, 800);
}

function closeCategoryModal(event) {
  if (event && event.target !== event.currentTarget) return;
  document.getElementById('categoryModal').classList.remove('show');
}

// Listen for close iframe message from learning tools
window.addEventListener('message', function (event) {
  if (event.data && event.data.action === 'closeLearningTool') {
    // Hide iframe and show landing page
    mockFrame.style.display = 'none';
    mockFrame.src = '';
    landingPage.style.display = 'block';
  }
});

// Theme locked to light — OS dark mode is intentionally ignored site-wide.
const html = document.documentElement;
function applySystemTheme() { html.setAttribute('data-theme', 'light'); }
applySystemTheme();

// Lock to portrait orientation on mobile
function lockPortrait() {
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('portrait').catch(() => { });
  }
}

// Fullscreen function
function enterFullscreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen().then(() => {
      sessionStorage.setItem('mockstream_fullscreen', 'true');
      lockPortrait();
    }).catch(() => { });
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
    sessionStorage.setItem('mockstream_fullscreen', 'true');
    lockPortrait();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
    sessionStorage.setItem('mockstream_fullscreen', 'true');
    lockPortrait();
  }
}

// Exit fullscreen function
function exitFullscreen() {
  sessionStorage.removeItem('mockstream_fullscreen');
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

// Make exitFullscreen globally available
window.exitFullscreenForDownload = exitFullscreen;

// Listen for fullscreen exit (ESC key or programmatic) to clear session flag
document.addEventListener('fullscreenchange', function () {
  if (!document.fullscreenElement) {
    sessionStorage.removeItem('mockstream_fullscreen');
  }
});

// Check if click target should NOT trigger fullscreen
function shouldSkipFullscreen(target) {
  // Skip if clicking on interactive elements
  if (target.closest('button, a, input, select, textarea, [role="button"], .card, label, [onclick]')) {
    return true;
  }
  return false;
}

// Universal fullscreen - tap anywhere to enter fullscreen (but not on interactive elements)
document.addEventListener('click', function (e) {
  if (!document.fullscreenElement && !shouldSkipFullscreen(e.target)) {
    enterFullscreen();
  }
});

// Also handle touch for mobile devices
document.addEventListener('touchstart', function (e) {
  if (!document.fullscreenElement && !shouldSkipFullscreen(e.target)) {
    enterFullscreen();
  }
}, { passive: true });

// ========== IFRAME MOCK LOADING ==========
const landingPage = document.getElementById('landingPage');
let mockFrame = document.getElementById('mockFrame');
const loadingOverlay = document.getElementById('loadingOverlay');
const progressFill = document.getElementById('progressFill');
const progressPercent = document.getElementById('progressPercent');
const progressStatus = document.getElementById('progressStatus');
const loadingSteps = document.getElementById('loadingSteps');
const loadingIcon = document.getElementById('loadingIcon');
const loadingTitle = document.getElementById('loadingTitle');
const loadingSubtitle = document.getElementById('loadingSubtitle');

// Loading steps with messages
const loadingStepsData = [
  { percent: 0, status: 'Initializing...', step: 'Starting up' },
  { percent: 12, status: 'Loading resources...', step: 'Fetching core assets' },
  { percent: 25, status: 'Loading resources...', step: 'Downloading stylesheets' },
  { percent: 38, status: 'Preparing interface...', step: 'Building UI components' },
  { percent: 50, status: 'Loading mock data...', step: 'Importing question banks' },
  { percent: 62, status: 'Loading mock data...', step: 'Parsing exam content' },
  { percent: 75, status: 'Configuring settings...', step: 'Applying preferences' },
  { percent: 88, status: 'Almost ready...', step: 'Final preparations' },
  { percent: 100, status: 'Ready!', step: 'Launching exam...' }
];

let isLoadingMock = false;
let currentLoadingType = '';
let iframeLoadedEarly = false;

// Animate progress bar - now faster and responsive to iframe loading
function animateProgress(onComplete) {
  let currentStep = 0;
  iframeLoadedEarly = false;

  function updateProgress() {
    if (currentStep >= loadingStepsData.length) {
      if (onComplete) onComplete();
      return;
    }

    const step = loadingStepsData[currentStep];
    progressFill.style.width = step.percent + '%';
    progressPercent.textContent = step.percent + '%';
    progressStatus.textContent = step.status;
    loadingSteps.textContent = step.step;

    currentStep++;

    // If iframe already loaded, speed through remaining steps
    if (iframeLoadedEarly) {
      setTimeout(updateProgress, 80); // Fast finish
    } else {
      // Normal speed: ~150ms per step (total ~1.2s for 8 steps)
      const delay = 150 + Math.random() * 50;
      setTimeout(updateProgress, delay);
    }
  }

  updateProgress();
}

// Mark iframe as loaded early to speed up progress
function markIframeLoaded() {
  iframeLoadedEarly = true;
}

// Reset loading state
function resetLoadingState() {
  progressFill.style.width = '0%';
  progressPercent.textContent = '0%';
  progressStatus.textContent = 'Initializing...';
  loadingSteps.textContent = '';
  isLoadingMock = false;
}

// Load mock in iframe with loading screen
function loadMock(page, type) {
  if (isLoadingMock) return;
  isLoadingMock = true;
  currentLoadingType = type || 'writing';

  // Configure loading screen based on type
  if (currentLoadingType === 'speaking') {
    loadingOverlay.classList.add('speaking');
    loadingOverlay.classList.remove('reading');
    loadingOverlay.classList.remove('listening');
    loadingIcon.textContent = '🎤';
    loadingTitle.textContent = 'Loading Speaking Mock';
  } else if (currentLoadingType === 'reading') {
    loadingOverlay.classList.remove('speaking');
    loadingOverlay.classList.add('reading');
    loadingOverlay.classList.remove('listening');
    loadingIcon.textContent = '📖';
    loadingTitle.textContent = 'Loading Reading Mock';
  } else if (currentLoadingType === 'listening') {
    loadingOverlay.classList.remove('speaking');
    loadingOverlay.classList.remove('reading');
    loadingOverlay.classList.add('listening');
    loadingIcon.textContent = '🎧';
    loadingTitle.textContent = 'Loading Listening Mock';
  } else {
    loadingOverlay.classList.remove('speaking');
    loadingOverlay.classList.remove('reading');
    loadingOverlay.classList.remove('listening');
    loadingIcon.textContent = '✍️';
    loadingTitle.textContent = 'Loading Writing Mock';
  }
  loadingSubtitle.textContent = 'Preparing your exam environment';

  // Hide modals and show loading
  writingModal.classList.remove('show');
  speakingModal.classList.remove('show');
  loadingOverlay.classList.add('show');

  // Reset and start progress animation
  resetLoadingState();
  isLoadingMock = true;

  // Start loading iframe in background
  mockFrame.src = page;

  let iframeReady = false;
  let progressDone = false;
  let alreadyShown = false;

  const showMock = () => {
    if (alreadyShown) return;
    alreadyShown = true;

    // Immediate transition
    loadingOverlay.classList.remove('show');
    loadingOverlay.classList.remove('speaking');
    loadingOverlay.classList.remove('reading');
    landingPage.style.display = 'none';
    mockFrame.style.display = 'block';
    mockFrame.style.zIndex = '9999';
    mockFrame.style.pointerEvents = 'auto';
    resetLoadingState();
  };

  const tryShowMock = () => {
    if (iframeReady && progressDone) {
      showMock();
    }
  };

  // Mark iframe as ready when loaded - also speed up remaining progress
  mockFrame.onload = () => {
    iframeReady = true;
    markIframeLoaded(); // Speed up remaining progress steps
    tryShowMock();
  };

  // Start progress animation
  animateProgress(() => {
    progressDone = true;
    tryShowMock();

    // Fallback: If iframe hasn't loaded after progress is done, show anyway after 500ms
    setTimeout(() => {
      if (!alreadyShown) {
        console.log('Fallback: showing mock after timeout');
        showMock();
      }
    }, 500);
  });
}

// Return to landing page
function returnToLanding() {
  // Check if full mock is active
  const dataStr = sessionStorage.getItem(FULL_MOCK_STORAGE_KEY);
  let autoResume = false;
  if (dataStr) {
    const data = JSON.parse(dataStr);
    if (data.active && data.step <= 4) {
      data.step++;
      sessionStorage.setItem(FULL_MOCK_STORAGE_KEY, JSON.stringify(data));
      updateFullMockUI();
      autoResume = true;
    }
  }

  // Completely remove old iframe and create new one
  if (mockFrame) mockFrame.remove();

  // Create fresh iframe
  const newFrame = document.createElement('iframe');
  newFrame.id = 'mockFrame';
  newFrame.setAttribute('allowfullscreen', '');
  newFrame.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;border:none;z-index:-1;background:#f3f9f7;pointer-events:none;';
  document.body.appendChild(newFrame);
  mockFrame = newFrame;

  // Show landing page
  landingPage.style.display = 'flex';

  // Auto-resume if in full mock mode
  if (autoResume) {
    resetLoadingState(); // Ensure loading flag is reset before loading next module
    resumeFullMock();
  }
}

// Make returnToLanding available globally (for iframe to call)
window.returnToLanding = returnToLanding;

// Also listen for postMessage from iframes (fallback communication)
window.addEventListener('message', function (event) {
  if (event.data === 'returnToLanding') {
    returnToLanding();
  }
});

// ========== WRITING OPTIONS MODAL ==========
const writingModal = document.getElementById('writingModal');

function showWritingOptions() {
  writingModal.classList.add('show');
}

function closeWritingModal(event) {
  if (!event || event.target === writingModal) {
    writingModal.classList.remove('show');
  }
}

function selectWritingType(type) {
  closeWritingModal();
  if (type === 'ielts') {
    loadMock('Writing IELTS Mock.html', 'writing');
  } else {
    loadMock('Writing Mocks.html', 'writing');
  }
}

// ========== LISTENING OPTIONS MODAL ==========
const listeningModal = document.getElementById('listeningModal');

function showListeningOptions() {
  listeningModal.classList.add('show');
}

function closeListeningModal(event) {
  if (!event || event.target === listeningModal) {
    listeningModal.classList.remove('show');
  }
}

function selectListeningType(type) {
  closeListeningModal();
  if (type === 'ielts') {
    openCategoryModal('ielts-listening');
  } else {
    openCategoryModal('cefr-listening');
  }
}
// ========== READING OPTIONS MODAL ==========
const readingModal = document.getElementById('readingModal');

function showReadingOptions() {
  readingModal.classList.add('show');
}

function closeReadingModal(event) {
  if (!event || event.target === readingModal) {
    readingModal.classList.remove('show');
  }
}

function selectReadingType(type) {
  closeReadingModal();
  if (type === 'ielts') {
    openCategoryModal('ielts-reading');
  } else {
    openCategoryModal('cefr-reading');
  }
}

// ========== FULL MOCK OPTIONS MODAL ==========
const fullMockModal = document.getElementById('fullMockModal');

function showFullMockOptions() {
  fullMockModal.classList.add('show');
}

function closeFullMockModal(event) {
  if (!event || event.target === fullMockModal) {
    fullMockModal.classList.remove('show');
  }
}

function selectFullMockType(type) {
  closeFullMockModal();
  if (type === 'cefr') {
    startFullMock();
  } else if (type === 'ielts') {
    window.location.href = 'ielts-full-mock.html';
  }
}

function showIELTSFullMockOptions() {
  window.location.href = 'ielts-full-mock.html';
}

// ========== SPEAKING OPTIONS MODAL ==========
const speakingModal = document.getElementById('speakingModal');

function showSpeakingOptions() {
  speakingModal.classList.add('show');
}

function closeSpeakingModal(event) {
  if (!event || event.target === speakingModal) {
    speakingModal.classList.remove('show');
  }
}

function selectSpeakingType(type) {
  closeSpeakingModal();
  if (type === 'ielts') {
    openCategoryModal('ielts-speaking');
  } else {
    openCategoryModal('cefr-speaking');
  }
}

// ========== IELTS SPEAKING MODE MODAL ==========
const ieltsSpeakingModeModal = document.getElementById('ieltsSpeakingModeModal');

function showIELTSSpeakingModeModal() {
  ieltsSpeakingModeModal.classList.add('show');
}

function closeIELTSSpeakingModeModal(event) {
  if (!event || event.target === ieltsSpeakingModeModal) {
    ieltsSpeakingModeModal.classList.remove('show');
  }
}

function selectIELTSSpeakingMode(mode) {
  closeIELTSSpeakingModeModal();
  if (mode === 'ai') {
    // Load AI Speaking Simulator directly
    loadMock('IELTS Speaking Mocks.html', 'speaking');
  } else {
    // Show tutorial and then booking form
    showIELTSSpeakingTutorial();
  }
}

function showIELTSSpeakingTutorial() {

  const steps = [
    { icon: '🎤', title: 'Welcome to IELTS Speaking!', text: 'This tutorial will guide you through the IELTS Speaking Mock Test process. Our speaking test simulates the real IELTS Speaking exam with a live video call with an examiner.' },
    { icon: '📅', title: 'Book Your Slot', text: 'You will need to schedule a video call with our examiner. Fill in your name, phone number, select your preferred date and time, and choose a mock test number.' },
    { icon: '💬', title: 'Telegram Confirmation', text: 'After booking, your request will be sent to our Telegram channel. You will receive a confirmation message and the examiner will contact you via Telegram.' },
    { icon: '🎥', title: 'Video Call Setup', text: 'Prepare for your video call: stable internet connection, quiet well-lit place, test your camera and microphone, and have your Telegram app ready.' },
    { icon: '📋', title: 'Exam Structure', text: 'The IELTS Speaking test has 3 parts: Part 1 (4-5 min) Introduction, Part 2 (3-4 min) Cue card, Part 3 (4-5 min) Discussion.' },
    { icon: '⏱️', title: 'Duration and Timing', text: 'Total exam duration: 11-14 minutes. Be online 5 minutes before your scheduled time. The examiner will call you on Telegram video.' },
    { icon: '📊', title: 'Scoring and Feedback', text: 'You will receive a detailed score report with feedback on Fluency, Vocabulary, Grammar and Pronunciation. Band score from 1.0 to 9.0.' },
    { icon: '🚀', title: 'Ready to Book!', text: 'You are all set! Fill in your booking details, wait for Telegram confirmation, join video call at scheduled time, and receive your score report.' }
  ];

  let current = 0;

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:999999;padding:20px';

  const popup = document.createElement('div');
  popup.style.cssText = 'background:white;border-radius:20px;max-width:450px;width:100%;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3)';

  function render() {
    const s = steps[current];
    const isLast = current === steps.length - 1;

    popup.innerHTML = '<div style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);padding:20px;position:relative">' +
      '<button id="closeBtn" style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,0.2);border:none;width:32px;height:32px;border-radius:50%;cursor:pointer;color:white;font-size:18px">X</button>' +
      '<div style="display:flex;align-items:center;gap:14px">' +
      '<div style="font-size:40px">' + s.icon + '</div>' +
      '<div><div style="color:rgba(255,255,255,0.8);font-size:11px;font-weight:600">STEP ' + (current + 1) + ' OF ' + steps.length + '</div>' +
      '<div style="color:white;font-size:18px;font-weight:700">' + s.title + '</div></div></div>' +
      '<div style="margin-top:16px;background:rgba(255,255,255,0.2);height:4px;border-radius:2px"><div style="height:100%;background:white;border-radius:2px;width:' + ((current + 1) / steps.length * 100) + '%"></div></div></div>' +
      '<div style="padding:24px"><p style="color:#475569;font-size:15px;line-height:1.7;margin:0">' + s.text + '</p></div>' +
      '<div style="padding:16px 24px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center">' +
      '<button id="prevBtn" style="padding:10px 20px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;background:' + (current === 0 ? '#f1f5f9' : 'white') + ';color:' + (current === 0 ? '#94a3b8' : '#64748b') + ';border:' + (current === 0 ? 'none' : '2px solid #e2e8f0') + '"' + (current === 0 ? ' disabled' : '') + '>Previous</button>' +
      '<button id="nextBtn" style="padding:10px 24px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;border:none;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:white">' + (isLast ? 'Book Now!' : 'Next') + '</button></div>';

    popup.querySelector('#closeBtn').onclick = function () { overlay.remove(); };
    popup.querySelector('#prevBtn').onclick = function () { if (current > 0) { current--; render(); } };
    popup.querySelector('#nextBtn').onclick = function () {
      if (isLast) {
        overlay.remove();
        loadMock('Speaking IELTS Booking.html', 'speaking');
      } else {
        current++;
        render();
      }
    };
  }

  render();
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
}

// Close modal with Escape key
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    if (writingModal.classList.contains('show')) {
      closeWritingModal();
    }
    if (speakingModal.classList.contains('show')) {
      closeSpeakingModal();
    }
    if (listeningModal.classList.contains('show')) {
      closeListeningModal();
    }
    if (readingModal.classList.contains('show')) {
      closeReadingModal();
    }
    if (ieltsSpeakingModeModal.classList.contains('show')) {
      closeIELTSSpeakingModeModal();
    }
  }
});


// Listen for messages from iframe (for back button - works with file:// protocol)
window.addEventListener('message', function (event) {
  // Handle both string and object formats
  if (event.data === 'returnToLanding' ||
    (event.data && event.data.action === 'returnToLanding')) {
    returnToLanding();
  }
});

// ========== BROWSER HISTORY MANAGEMENT ==========
// Track current navigation state
let currentView = 'landing'; // 'landing' or 'mock'

// Handle browser back button (from parent index.html)
window.addEventListener('message', function (event) {
  if (event.data === 'browserBack') {
    handleBackNavigation();
  }
});

// Also handle back button directly if not in iframe
window.addEventListener('popstate', function (event) {
  handleBackNavigation();
});

// Handle back navigation logic
function handleBackNavigation() {
  if (currentView === 'mock' && mockFrame.style.display === 'block') {
    // If viewing a mock, go back to landing page
    returnToLanding();
    currentView = 'landing';
  }
  // If already on landing, the parent (index.html) handles it
}

// Update loadMock to track state
const originalLoadMock = loadMock;
loadMock = function (page, type) {
  currentView = 'mock';
  originalLoadMock(page, type);
};

// Update returnToLanding to track state
const originalReturnToLanding = returnToLanding;
returnToLanding = function () {
  currentView = 'landing';
  originalReturnToLanding();
};
window.returnToLanding = returnToLanding;

// Keyboard shortcuts for navigation
document.addEventListener('keydown', (e) => {
  // Skip if user is typing in an input field
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
    return;
  }
  // Only work when on landing page
  if (!landingPage.classList.contains('hidden')) {
    if (e.key === '1') {
      loadMock('Speaking Mocks.html', 'speaking');
    } else if (e.key === '2') {
      loadMock('Writing Mocks.html', 'writing');
    }
  }
});

// ===== SECURITY: Disable right-click and developer shortcuts =====
let adminModeEnabled = false;

// Admin mode toggle: Ctrl+Shift+Alt+K
document.addEventListener('keydown', function (e) {
  if (e.ctrlKey && e.shiftKey && e.altKey && (e.key === 'K' || e.key === 'k' || e.keyCode === 75)) {
    e.preventDefault();
    adminModeEnabled = !adminModeEnabled;
    if (adminModeEnabled) {
      alert('🔓 ADMIN MODE ENABLED\n\nAll restrictions disabled:\n• DevTools (F12, Ctrl+Shift+I)\n• View Source (Ctrl+U)\n• Right-click\n• Save Page (Ctrl+S)\n• Print (Ctrl+P)');
    } else {
      alert('🔒 ADMIN MODE DISABLED\n\nAll restrictions re-enabled.');
    }
    return false;
  }
});

// Disable right-click context menu
document.addEventListener('contextmenu', function (e) {
  if (!adminModeEnabled) {
    e.preventDefault();
    return false;
  }
});

// Disable developer tools shortcuts
document.addEventListener('keydown', function (e) {
  if (adminModeEnabled) return; // Skip if admin mode is active

  // F12 - Developer Tools
  if (e.key === 'F12' || e.keyCode === 123) {
    e.preventDefault();
    return false;
  }
  // Ctrl+Shift+I - DevTools/Inspector
  if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
    e.preventDefault();
    return false;
  }
  // Ctrl+Shift+J - Console
  if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
    e.preventDefault();
    return false;
  }
  // Ctrl+Shift+C - Element picker
  if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
    e.preventDefault();
    return false;
  }
  // Ctrl+U - View page source
  if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
    e.preventDefault();
    return false;
  }
  // Ctrl+S - Save page
  if (e.ctrlKey && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
    e.preventDefault();
    return false;
  }
  // Ctrl+P - Print
  if (e.ctrlKey && (e.key === 'P' || e.key === 'p' || e.keyCode === 80)) {
    e.preventDefault();
    return false;
  }
});

// Add hover effect enhancement
const cards = document.querySelectorAll('.exam-card');
cards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-4px) scale(1.02)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0) scale(1)';
  });
});

// Load logo and wording from question files
function updateHeaderFromQuestionFiles() {
  // Try Speaking test data first (primary)
  if (window.SPEAKING_TEST_DATA && window.SPEAKING_TEST_DATA.settings) {
    const settings = window.SPEAKING_TEST_DATA.settings;
    if (settings.logoUrl) {
      document.getElementById('headerLogo').src = settings.logoUrl;
      document.getElementById('welcomeLogo').src = settings.logoUrl;
    }
    if (settings.logoWording) {
      document.getElementById('headerTitle').textContent = settings.logoWording + ' Exams';
      // Footer copyright always stays as Mock Stream - the true owner
    }
    // Subtitle is hardcoded - do not change it
  }
}

// Run after page loads
updateHeaderFromQuestionFiles();

// ===== SUPER CODE FUNCTIONALITY =====
// Using sessionStorage - clears when browser/tab is closed (more secure than localStorage)
const SUPER_ACCESS_KEY = 'vipSessionAccess';

// Check if super access is already unlocked on page load
function checkSuperAccessStatus() {
  const isUnlocked = sessionStorage.getItem(SUPER_ACCESS_KEY) === 'true';

  if (isUnlocked) {
    showSuperUnlockedState();
    return true;
  }
  return false;
}

function showSuperUnlockedState() {
  // Update VIP menu item in sidebar
  const vipMenuItem = document.getElementById('vipMenuItem');
  const vipStatusBadge = document.getElementById('vipStatusBadge');

  if (vipMenuItem) {
    vipMenuItem.classList.add('unlocked');
    vipMenuItem.innerHTML = '<span class="menu-icon vip-star">✅</span> VIP Client <span class="vip-status-badge active" id="vipStatusBadge">Active</span>';
  }

  // Also update Reading Builder menu item if it exists
  const readingBuilderMenuItem = document.getElementById('readingBuilderMenuItem');
  if (readingBuilderMenuItem) {
    readingBuilderMenuItem.classList.add('unlocked');
  }
}

// ===== READING BUILDER (Developer Only) =====
function openReadingBuilder() {
  // If VIP already active, load the tool directly
  if (sessionStorage.getItem(SUPER_ACCESS_KEY) === 'true') {
    loadLearningTool('Tools/Reading Mock Builder.html', 'reading-builder');
    return;
  }

  // Otherwise, show the super code modal for verification
  openSuperCodeModal();
}

function openSuperCodeModal() {
  // If already unlocked, just show a message
  if (sessionStorage.getItem(SUPER_ACCESS_KEY) === 'true') {
    alert('✅ VIP Access is already active for this session!');
    return;
  }

  const overlay = document.getElementById('superCodeOverlay');
  if (overlay) {
    overlay.classList.add('visible');
    setTimeout(() => {
      document.getElementById('superCodeInput')?.focus();
    }, 100);
  }
}

function closeSuperCodeModal() {
  const overlay = document.getElementById('superCodeOverlay');
  if (overlay) {
    overlay.classList.remove('visible');
  }
}

async function validateSuperCode() {
  const input = document.getElementById('superCodeInput');
  const btn = document.getElementById('superCodeBtn');
  const status = document.getElementById('superCodeStatus');

  const code = input.value.trim();

  if (!code) {
    status.className = 'status-text error';
    status.textContent = 'Please enter a code';
    return;
  }

  // Validate that code is a number
  const passcodeInt = parseInt(code, 10);
  if (isNaN(passcodeInt)) {
    status.className = 'status-text error';
    status.textContent = 'Code must be a number';
    return;
  }

  // Disable button and show loading
  btn.disabled = true;
  btn.textContent = '⏳';
  status.className = 'status-text loading';
  status.textContent = 'Verifying...';

  let validated = false;
  let isPremiumAi = false;

  // FIRST: Try admin0709 backend (premium AI codes - shorter, no year prefix)
  try {
    const response = await fetch('https://admin0709.alwaysdata.net/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: passcodeInt })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.access || data.valid) {
        validated = true;
        isPremiumAi = true;
      }
    }
  } catch (e) {
    console.log('[VIP] admin0709 backend check failed, trying davirbek...');
  }

  // SECOND: If admin0709 didn't validate, try davirbek backend (regular codes - auto-prepend year)
  if (!validated) {
    try {
      const currentYear = new Date().getFullYear();
      const fullPasscode = currentYear + code;

      const response = await fetch('https://davirbek.alwaysdata.net/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: fullPasscode })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access || data.valid) {
          validated = true;
          isPremiumAi = false;
        }
      }
    } catch (e) {
      console.log('[VIP] davirbek backend check also failed');
    }
  }

  if (validated) {
    // Success! Store super access in sessionStorage (clears when tab/browser closes)
    sessionStorage.setItem(SUPER_ACCESS_KEY, 'true');

    // Store whether this is a premium AI unlock or regular unlock
    if (isPremiumAi) {
      sessionStorage.setItem('vipPremiumAi', 'true');
    } else {
      sessionStorage.removeItem('vipPremiumAi');
    }

    status.className = 'status-text success';
    status.textContent = '✅ All features unlocked!';

    // Show unlocked state and close modal
    setTimeout(() => {
      showSuperUnlockedState();
      closeSuperCodeModal();
    }, 1000);
  } else {
    status.className = 'status-text error';
    status.textContent = '❌ Invalid or expired code';
    btn.disabled = false;
    btn.textContent = 'Verify';
  }
}

// Allow Enter key to submit
document.getElementById('superCodeInput')?.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    validateSuperCode();
  }
});

// Check super access status on page load
checkSuperAccessStatus();

// ===== TEST MAKER MODAL LOGIC =====
function openTestMakerModal() {
  // If VIP already active, skip passcode and go straight to picker
  if (sessionStorage.getItem(SUPER_ACCESS_KEY) === 'true') {
    document.getElementById('testMakerStep1').style.display = 'none';
    document.getElementById('testMakerStep2').style.display = 'block';
  } else {
    document.getElementById('testMakerStep1').style.display = 'block';
    document.getElementById('testMakerStep2').style.display = 'none';
    document.getElementById('testMakerCodeInput').value = '';
    document.getElementById('testMakerStatus').textContent = '';
    document.getElementById('testMakerStatus').className = 'status-text';
    document.getElementById('testMakerVerifyBtn').disabled = false;
    document.getElementById('testMakerVerifyBtn').textContent = 'Verify';
  }
  const overlay = document.getElementById('testMakerOverlay');
  overlay.classList.add('visible');
  if (sessionStorage.getItem(SUPER_ACCESS_KEY) !== 'true') {
    setTimeout(() => document.getElementById('testMakerCodeInput')?.focus(), 100);
  }
}

function closeTestMakerModal() {
  document.getElementById('testMakerOverlay').classList.remove('visible');
}

async function validateTestMakerCode() {
  const input = document.getElementById('testMakerCodeInput');
  const btn = document.getElementById('testMakerVerifyBtn');
  const status = document.getElementById('testMakerStatus');
  const code = input.value.trim();

  if (!code) {
    status.className = 'status-text error';
    status.textContent = 'Please enter a code';
    return;
  }

  const passcodeInt = parseInt(code, 10);
  if (isNaN(passcodeInt)) {
    status.className = 'status-text error';
    status.textContent = 'Code must be a number';
    return;
  }

  btn.disabled = true;
  btn.textContent = '⏳';
  status.className = 'status-text loading';
  status.textContent = 'Verifying...';

  try {
    const response = await fetch('https://admin0709.alwaysdata.net/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: passcodeInt })
    });

    if (!response.ok) throw new Error('Server error');
    const data = await response.json();

    if (data.access) {
      sessionStorage.setItem(SUPER_ACCESS_KEY, 'true');
      showSuperUnlockedState();
      status.className = 'status-text success';
      status.textContent = '✅ Access granted!';
      setTimeout(() => {
        document.getElementById('testMakerStep1').style.display = 'none';
        document.getElementById('testMakerStep2').style.display = 'block';
      }, 600);
    } else {
      throw new Error('Invalid code');
    }
  } catch (error) {
    status.className = 'status-text error';
    status.textContent = '❌ Invalid or expired code';
    btn.disabled = false;
    btn.textContent = 'Verify';
  }
}

document.getElementById('testMakerCodeInput')?.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') validateTestMakerCode();
});

// Global function to check if super access is unlocked (for other pages to use)
window.isSuperAccessUnlocked = function () {
  return sessionStorage.getItem(SUPER_ACCESS_KEY) === 'true';
};

// ===== PRELOAD ALL MOCK JS FILES =====
// This ensures all mocks are loaded before the gate opens (prevents blinking on mobile)
(async function preloadAllMocks() {
  console.log('🔄 Starting mock preload...');

  // List of all mock JS files to preload
  const speakingMocks = [];
  for (let i = 1; i <= 30; i++) {
    const num = i === 1 ? '' : String(i).padStart(2, '0');
    speakingMocks.push(`questions S/questions${num}.js`);
  }

  const writingMocks = [];
  for (let i = 1; i <= 69; i++) {
    const num = i === 1 ? '' : String(i).padStart(2, '0');
    writingMocks.push(`questions W/writing-questions${num}.js`);
  }

  const allMocks = [...speakingMocks, ...writingMocks];
  let loaded = 0;
  let failed = 0;

  // Preload function - just fetches the file to cache it
  const preloadFile = (url) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        loaded++;
        script.remove(); // Clean up after preloading
        resolve(true);
      };
      script.onerror = () => {
        failed++;
        script.remove();
        resolve(false); // Don't reject, just mark as failed
      };
      document.head.appendChild(script);
    });
  };

  // Preload in batches of 10 for better performance
  const batchSize = 10;
  for (let i = 0; i < allMocks.length; i += batchSize) {
    const batch = allMocks.slice(i, i + batchSize);
    await Promise.all(batch.map(preloadFile));
  }

  console.log(`✅ Mock preload complete: ${loaded} loaded, ${failed} not found`);

  // Notify parent that mocks are ready
  if (window.parent && window.parent !== window) {
    window.parent.postMessage('mocksReady', '*');
    console.log('📤 Sent mocksReady signal to parent');
  }
})();

// Auto-open modal if URL parameter is present (e.g., from flashcards Home button)
(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const openModal = urlParams.get('openModal');
  if (openModal) {
    // Small delay to ensure page is fully loaded
    setTimeout(() => {
      openCategoryModal(openModal);
      // Clean up URL without reloading
      history.replaceState({}, '', window.location.pathname);
    }, 100);
  }
})();

// Initialize Full Mock UI
updateFullMockUI();

// Auto-resume Full Mock if returning from a completed module
// This handles the case where CEFR Listening.html navigates directly to landing.html
(function checkAndResumeFullMock() {
  const dataStr = sessionStorage.getItem(FULL_MOCK_STORAGE_KEY);
  if (dataStr) {
    try {
      const data = JSON.parse(dataStr);
      // If active and we're on step 2+ (meaning Listening is done), auto-resume
      if (data.active && data.step >= 2 && data.step <= 4) {
        console.log('Full Mock detected, auto-resuming to step:', data.step);
        // Small delay to ensure UI is ready
        setTimeout(() => {
          resumeFullMock();
        }, 500);
      }
    } catch (e) {
      console.error('Error parsing Full Mock data:', e);
    }
  }
})();