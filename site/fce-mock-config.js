// ===== FCE (B2 First) FULL MOCK CONFIGURATION =====
// Update these counts when adding new mock tests
// The selection menu will automatically show all available mocks

window.FCE_MOCK_CONFIG = {
    // Number of available STATIC tests for each module
    // Dynamic mocks from Supabase (mock_tests table) are loaded automatically
    reading_writing: 1,  // questions FCE RW/fce-rw-test-01.js to fce-rw-test-NN.js
    listening: 0,        // arriving in v2
    speaking: 0,         // arriving in v2

    // File naming patterns (for reference)
    // Reading & Use of English + Writing (combined paper, 155 min, 7 R&UoE parts + 2 writing tasks):
    //   site/questions FCE RW/fce-rw-test-{XX}.js  → window.FCE_RW_TEST
    // Listening (~40 min, 4 parts × ~7-8 Qs = 30 Qs):
    //   site/questions FCE L/fce-listening-test-{XX}.js  → window.FCE_LISTENING_TEST
    // Speaking (~14 min, paired — single-player support deferred to v2):
    //   site/questions FCE S/questions{XX}.js  → window.FCE_SPEAKING_TEST
};
