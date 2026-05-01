// EXAMPLE schema for a KET Speaking mock (DOCUMENTATION ONLY — does not load)
// DEFERRED TO v2 — real KET Speaking is paired (2 candidates), single-player
// implementation TBD (solo monologue mode vs AI partner).
//
// File naming (when shipped): questions{NN}.js
// Loaded by:                  site/KET Speaking.html
// Sets global:                window.KET_SPEAKING_TEST

window.KET_SPEAKING_TEST = {
  testInfo: {
    id: "ket-speaking-01",
    title: "KET Speaking Mock 01",
    level: "A2",
    totalTime: 10
  },
  parts: [
    {
      partNumber: 1,
      type: "interview",
      duration: "3-4 min",
      // Examiner asks personal-info questions
      questions: []
    },
    {
      partNumber: 2,
      type: "collaborative",
      duration: "5-6 min",
      topic: "...",
      imgPrompts: []  // visual prompts for the discussion
    }
  ]
};
