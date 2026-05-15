// ===== CEFR FULL MOCK CONFIGURATION =====
// Update these counts when adding new mock tests
// The selection menu will automatically show all available mocks

window.CEFR_MOCK_CONFIG = {
    // Baseline mock counts per module. All four skills are now on Supabase;
    // these values are floors only — discoverMockCounts() in full-mock.html
    // queries mock_tests.max(mock_number) and tops these up if admin has
    // added more rows. Bump these when (a) the floor needs lifting or
    // (b) a Supabase-less fallback is desired.
    listening: 32,
    reading: 40,
    writing: 99,
    speaking: 65,
};
