// ===== PET (B1 Preliminary) FULL MOCK CONFIGURATION =====
// Update these counts when adding new mock tests
// The selection menu will automatically show all available mocks

window.PET_MOCK_CONFIG = {
    // Number of available STATIC tests for each module
    // Dynamic mocks from Supabase (mock_tests table) are loaded automatically
    reading: 4,          // questions PET R/pet-reading-test-01.js .. -04.js (all 4 Tests from "Preliminary English Test for Schools 1")
    reading_writing: 0,  // pre-2020 combined paper format — currently splitting into reading-only mocks
    listening: 4,        // questions PET L/pet-listening-test-01.js .. -04.js (full-length audio per test; per-part splits next)
    speaking: 0,         // arriving in v2

    // File naming patterns (for reference)
    // Reading (~50 min, 5 parts × 35 Qs):
    //   site/questions PET R/pet-reading-test-{XX}.js  → window.PET_R_TEST
    // Listening (~30 min, 4 parts × 6/7 Qs = 25 Qs):
    //   site/questions PET L/pet-listening-test-{XX}.js  → window.PET_LISTENING_TEST
    // Speaking (~12 min, paired — single-player support deferred to v2):
    //   site/questions PET S/questions{XX}.js  → window.PET_SPEAKING_TEST
};
