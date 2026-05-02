// ===== CPE (C2 Proficiency) FULL MOCK CONFIGURATION =====
// Update these counts when adding new mock tests
// The selection menu will automatically show all available mocks

window.CPE_MOCK_CONFIG = {
    // Number of available STATIC tests for each module
    // Dynamic mocks from Supabase (mock_tests table) are loaded automatically
    reading_writing: 1,  // questions CPE RW/cpe-rw-test-01.js to cpe-rw-test-NN.js
    listening: 0,        // arriving in v2
    speaking: 0,         // arriving in v2

    // File naming patterns (for reference)
    // Reading & Use of English + Writing (combined paper, 180 min, 7 R&UoE parts + 2 writing tasks):
    //   site/questions CPE RW/cpe-rw-test-{XX}.js  → window.CPE_RW_TEST
    // Listening (~40 min, 4 parts × ~7-8 Qs = 30 Qs):
    //   site/questions CPE L/cpe-listening-test-{XX}.js  → window.CPE_LISTENING_TEST
    // Speaking (~16 min, paired — single-player support deferred to v2):
    //   site/questions CPE S/questions{XX}.js  → window.CPE_SPEAKING_TEST
};
