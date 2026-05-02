// ===== CAE (C1 Advanced) FULL MOCK CONFIGURATION =====
// Update these counts when adding new mock tests
// The selection menu will automatically show all available mocks

window.CAE_MOCK_CONFIG = {
    // Number of available STATIC tests for each module
    // Dynamic mocks from Supabase (mock_tests table) are loaded automatically
    reading_writing: 2,  // questions CAE RW/cae-rw-test-01.js to cae-rw-test-NN.js
    listening: 0,        // arriving in v2
    speaking: 0,         // arriving in v2

    // File naming patterns (for reference)
    // Reading & Use of English + Writing (combined paper, 180 min, 8 R&UoE parts + 2 writing tasks):
    //   site/questions CAE RW/cae-rw-test-{XX}.js  → window.CAE_RW_TEST
    // Listening (~40 min, 4 parts × ~7-8 Qs = 30 Qs):
    //   site/questions CAE L/cae-listening-test-{XX}.js  → window.CAE_LISTENING_TEST
    // Speaking (~15 min, paired — single-player support deferred to v2):
    //   site/questions CAE S/questions{XX}.js  → window.CAE_SPEAKING_TEST
};
