// ===== PET (B1 Preliminary) FULL MOCK CONFIGURATION =====
// Update these counts when adding new mock tests
// The selection menu will automatically show all available mocks

window.PET_MOCK_CONFIG = {
    // Number of available STATIC tests for each module
    // Dynamic mocks from Supabase (mock_tests table) are loaded automatically
    reading_writing: 0,  // questions PET RW/pet-rw-test-01.js to pet-rw-test-NN.js
    listening: 0,        // arriving in v2
    speaking: 0,         // arriving in v2

    // File naming patterns (for reference)
    // Reading & Writing (combined paper, 90 min, 6 reading parts + 2 writing tasks):
    //   site/questions PET RW/pet-rw-test-{XX}.js  → window.PET_RW_TEST
    // Listening (~30 min, 4 parts × 6/7 Qs = 25 Qs):
    //   site/questions PET L/pet-listening-test-{XX}.js  → window.PET_LISTENING_TEST
    // Speaking (~12 min, paired — single-player support deferred to v2):
    //   site/questions PET S/questions{XX}.js  → window.PET_SPEAKING_TEST
};
