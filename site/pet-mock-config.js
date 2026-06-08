// ===== PET (B1 Preliminary) FULL MOCK CONFIGURATION =====
// Update these counts when adding new mock tests
// The selection menu will automatically show all available mocks

window.PET_MOCK_CONFIG = {
    // Number of available STATIC tests for each module
    // Dynamic mocks from Supabase (mock_tests table) are loaded automatically
    reading: 8,          // questions PET R/pet-reading-test-01.js .. -08.js (Tests 1-4 from "Preliminary English Test for Schools 1"; Tests 5-8 from "Cambridge Preliminary English Test 2")
    reading_writing: 0,  // pre-2020 combined paper format — currently splitting Reading and Writing into separate runners
    writing: 4,          // questions PET W/pet-writing-test-01.js .. -04.js (3 parts: sentence transformation + Q6 short + Q7/Q8 long; verbatim Band-5 samples auto-fill on submit)
    listening: 8,        // questions PET L/pet-listening-test-01.js .. -08.js (per-part audio splits; Tests 5-8 from "Cambridge Preliminary English Test 2")
    speaking: 0,         // arriving in v2

    // File naming patterns (for reference)
    // Reading (~50 min, 5 parts × 35 Qs):
    //   site/questions PET R/pet-reading-test-{XX}.js  → window.PET_R_TEST
    // Listening (~30 min, 4 parts × 6/7 Qs = 25 Qs):
    //   site/questions PET L/pet-listening-test-{XX}.js  → window.PET_LISTENING_TEST
    // Speaking (~12 min, paired — single-player support deferred to v2):
    //   site/questions PET S/questions{XX}.js  → window.PET_SPEAKING_TEST
};
