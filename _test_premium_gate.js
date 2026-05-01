/* Node-runnable assertions for premium-gate.js — pure-logic tests only.
 * Run: node _test_premium_gate.js
 * Mocks: window, sessionStorage, localStorage, fetch. No DOM, no network. */

(function () {
  'use strict';
  var fails = 0, passes = 0;
  function eq(actual, expected, label) {
    var ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (ok) { passes++; console.log('  PASS  ' + label); }
    else    { fails++;  console.log('  FAIL  ' + label + ' — expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual)); }
  }

  // Mock browser globals
  var ssData = {}, lsData = {};
  global.window = {};
  global.sessionStorage = global.window.sessionStorage = {
    getItem: function (k) { return ssData[k] == null ? null : ssData[k]; },
    setItem: function (k, v) { ssData[k] = String(v); },
    removeItem: function (k) { delete ssData[k]; }
  };
  global.localStorage = global.window.localStorage = {
    getItem: function (k) { return lsData[k] == null ? null : lsData[k]; },
    setItem: function (k, v) { lsData[k] = String(v); },
    removeItem: function (k) { delete lsData[k]; }
  };
  global.fetch = function () {
    return Promise.resolve({
      ok: false,
      json: function () { return Promise.resolve([]); }
    });
  };

  // Load the IIFE — it attaches to global.window.PremiumGate.
  require('./site/premium-gate.js');
  var PG = global.window.PremiumGate;

  // ---------- isPremiumTier ----------
  console.log('isPremiumTier');
  ssData = {}; eq(PG.isPremiumTier('writing'), false, 'no flags → regular');
  ssData = { vipPremiumAi: 'true' }; eq(PG.isPremiumTier('writing'), true, 'vipPremiumAi → premium');
  ssData = { vipSessionAccess: 'true' }; eq(PG.isPremiumTier('writing'), false, 'vipSessionAccess only → regular');
  ssData = { writingPremiumEntry: 'true' }; eq(PG.isPremiumTier('writing'), true, 'writingPremiumEntry=true');
  ssData = { writingPremiumEntry: 'false' }; eq(PG.isPremiumTier('writing'), false, 'writingPremiumEntry=false');
  ssData = { readingPremiumEntry: 'true' }; eq(PG.isPremiumTier('reading'), true, 'readingPremiumEntry=true');
  ssData = { listeningPremiumEntry: 'true' }; eq(PG.isPremiumTier('listening'), true, 'listeningPremiumEntry=true');

  // Speaking quirk: individual code overrides VIP
  ssData = { vipPremiumAi: 'true', speakingIndividualCode: 'regular' };
  eq(PG.isPremiumTier('speaking'), false, 'speaking regular code masks vipPremiumAi');
  ssData = { speakingIndividualCode: 'premium' };
  eq(PG.isPremiumTier('speaking'), true, 'speaking premium code → premium');
  // Speaking quirk does not affect writing
  ssData = { speakingIndividualCode: 'regular', vipPremiumAi: 'true' };
  eq(PG.isPremiumTier('writing'), true, 'speaking override does not affect writing');

  // ---------- recordOpen / hasTaken / attemptCount ----------
  console.log('tracker');
  ssData = { CANDIDATE_FULL_NAME: 'Alice ' };
  lsData = {};
  PG.recordOpen({ skill: 'writing', mock_number: 5, exam_type: 'cefr', center: 'mock_stream' });
  eq(PG.hasTaken({ skill: 'writing', mock_number: 5, exam_type: 'cefr' }), true, 'taken after recordOpen');
  eq(PG.hasTaken({ skill: 'writing', mock_number: 6, exam_type: 'cefr' }), false, 'other mocks not taken');
  eq(PG.attemptCount({ skill: 'writing', mock_number: 5, exam_type: 'cefr' }), 1, 'count 1 after one record');

  // Idempotency within 5 sec
  PG.recordOpen({ skill: 'writing', mock_number: 5, exam_type: 'cefr', center: 'mock_stream' });
  eq(PG.attemptCount({ skill: 'writing', mock_number: 5, exam_type: 'cefr' }), 1, 'duplicate within 5s skipped');

  // Different exam_type does NOT match
  PG.recordOpen({ skill: 'writing', mock_number: 5, exam_type: 'ielts', center: 'mock_stream' });
  eq(PG.attemptCount({ skill: 'writing', mock_number: 5, exam_type: 'cefr' }), 1, 'cefr count unaffected by ielts open');
  eq(PG.attemptCount({ skill: 'writing', mock_number: 5, exam_type: 'ielts' }), 1, 'ielts count = 1');

  // ---------- recordSubmit ----------
  console.log('recordSubmit');
  PG.recordSubmit({ skill: 'writing', mock_number: 5, exam_type: 'cefr' });
  var arr = JSON.parse(lsData['ms_mock_attempts_v1'] || '[]');
  var cefrRow = null;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].skill === 'writing' && arr[i].mock_number === 5 && arr[i].exam_type === 'cefr') { cefrRow = arr[i]; break; }
  }
  eq(typeof cefrRow.submitted_at, 'string', 'submitted_at stamped on cefr row');

  // ---------- candidate name normalization ----------
  console.log('candidate name normalization');
  ssData = { CANDIDATE_FULL_NAME: '  ALICE  ' };
  lsData = {};
  PG.recordOpen({ skill: 'reading', mock_number: 12, exam_type: 'cefr', center: 'mock_stream' });
  var arr2 = JSON.parse(lsData['ms_mock_attempts_v1'] || '[]');
  eq(arr2[0].candidate_name, 'alice', 'name lowercased + trimmed');

  // ---------- admin bypass ----------
  console.log('admin bypass');
  ssData = { ms_is_admin: 'true' };
  lsData = {};
  PG.recordOpen({ skill: 'writing', mock_number: 7, exam_type: 'cefr' });
  eq(PG.attemptCount({ skill: 'writing', mock_number: 7, exam_type: 'cefr' }), 0, 'admin recordOpen short-circuits');
  PG.recordSubmit({ skill: 'writing', mock_number: 7, exam_type: 'cefr' });
  var arr3 = JSON.parse(lsData['ms_mock_attempts_v1'] || '[]');
  eq(arr3.length, 0, 'admin recordSubmit does not stamp anything');

  // ---------- exports ----------
  console.log('exports');
  eq(typeof PG.openUpgradeModal, 'function', 'openUpgradeModal exported');
  eq(typeof PG.applyLockBadge, 'function', 'applyLockBadge exported');
  eq(typeof PG.fetchTakenForUser, 'function', 'fetchTakenForUser exported');

  console.log('\n' + passes + ' passed, ' + fails + ' failed');
  if (fails) process.exit(1);
})();
