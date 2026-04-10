// ===== CEFR FULL MOCK CONFIGURATION =====
// Update these counts when adding new mock tests
// The selection menu will automatically show all available mocks

window.CEFR_MOCK_CONFIG = {
    // Number of available STATIC tests for each module
    // Dynamic mocks from Supabase (mock_tests table) are loaded automatically
    listening: 32,   // cefr-listening-test-01.js to cefr-listening-test-32.js
    reading: 40,    // cefr-reading-test-01.js to cefr-reading-test-40.js
    writing: 99,    // cefr-mock-01.js to cefr-mock-99.js
    speaking: 65,   // questions01.js to questions65.js (+ Supabase dynamic mocks)

    // File naming patterns (for reference)
    // Listening: questions CEFR L/cefr-listening-test-{XX}.js
    // Reading:   questions CEFR R/cefr-reading-test-{XX}.js
    // Writing:   questions W/cefr-mock-{XX}.js
    // Speaking:  questions S/questions{XX}.js
};
