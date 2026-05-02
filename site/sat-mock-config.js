// ===== SAT (Digital Adaptive) FULL MOCK CONFIGURATION =====
// Update these counts when adding new mock tests
// The selection menu will automatically show all available mocks

window.SAT_MOCK_CONFIG = {
    // Number of available STATIC tests
    full_mock: 1,  // questions SAT/sat-mock-01.js to sat-mock-NN.js

    // Phase 1 note: this Mock 01 ships 8 questions per module = 48 total
    // (proof-of-concept for the runner architecture). Phase 2 will expand
    // each module to its full Cambridge-equivalent count (R&W 27/27, Math 22/22 = 147 total).

    // File naming pattern (for reference)
    //   site/questions SAT/sat-mock-{XX}.js  → window.SAT_TEST
};
