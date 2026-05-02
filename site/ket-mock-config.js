// ===== KET (A2 Key) FULL MOCK CONFIGURATION =====
// Update these counts when adding new mock tests
// The selection menu will automatically show all available mocks

window.KET_MOCK_CONFIG = {
    // Number of available STATIC tests for each module
    // Dynamic mocks from Supabase (mock_tests table) are loaded automatically
    reading_writing: 12,  // questions KET RW/ket-rw-test-01.js to ket-rw-test-NN.js
    listening: 0,        // questions KET L/ket-listening-test-01.js to ket-listening-test-NN.js
    speaking: 0,         // questions KET S/questions01.js — speaking is v2 (placeholder for now)

    // File naming patterns (for reference)
    // Reading & Writing (combined paper, 60 min):
    //   site/questions KET RW/ket-rw-test-{XX}.js  → window.KET_RW_TEST
    // Listening (30 min, 5 parts × 5 Qs = 25 Qs):
    //   site/questions KET L/ket-listening-test-{XX}.js  → window.KET_LISTENING_TEST
    //   audio: gs://mockstream-listening-audio/KET Listening/ket-listening-{XX}-part{N}.mp3
    // Speaking (8-10 min, paired — single-player support deferred to v2):
    //   site/questions KET S/questions{XX}.js  → window.KET_SPEAKING_TEST
};
