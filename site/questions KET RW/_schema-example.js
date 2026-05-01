// EXAMPLE schema for a KET Reading & Writing mock (DOCUMENTATION ONLY — does not load)
// File naming: ket-rw-test-{NN}.js (NN = 01, 02, ...)
// Loaded by:   site/KET Reading & Writing.html
// Sets global: window.KET_RW_TEST
//
// Combined paper: 60 min, 7 parts, 32 questions
// Reading parts 1-5 = 30 questions
// Writing parts 6-7 = 2 short tasks (25 / 35 words)

window.KET_RW_TEST = {
  testInfo: {
    id: "ket-rw-01",
    title: "KET Reading & Writing Mock 01",
    level: "A2",
    totalTime: 60,        // minutes (combined)
    totalQuestions: 32    // 30 R + 2 W tasks
  },
  reading: {
    parts: [
      {
        partNumber: 1,
        type: "matching",
        // 5 short messages (notice / sign / note / email) → pick meaning A/B/C
        title: "Read 5 short messages and choose the correct meaning",
        instruction: "...",
        items: [
          // { source: "<short text>", question: "What does this notice say?",
          //   options: [{letter:"A",text:"..."},{letter:"B",text:"..."},{letter:"C",text:"..."}],
          //   correct: "B" }
        ]
      },
      {
        partNumber: 2,
        type: "sentence-mcq",
        // 5 single sentences with one missing word, A/B/C
        items: [
          // { sentence: "She ___ the bus every morning.",
          //   options: [{letter:"A",text:"catch"},{letter:"B",text:"catches"},{letter:"C",text:"catching"}],
          //   correct: "B" }
        ]
      },
      {
        partNumber: 3,
        type: "long-text-mcq",
        // 1 long passage + 5 comprehension MCQs
        passage: "...",
        questions: [
          // { id: 1, prompt: "...", options: [A,B,C], correct: "A" }
        ]
      },
      {
        partNumber: 4,
        type: "cloze-mcq",
        // Short text with 6 vocabulary gaps; A/B/C for each gap
        text: "I went to the ___1___ ...",
        gaps: [
          // { id: 1, options: [{letter:"A",text:"shop"},...], correct: "A" }
        ]
      },
      {
        partNumber: 5,
        type: "cloze-open",
        // Short text with 6 grammar gaps; candidate writes ONE word per gap
        text: "...___1___...",
        gaps: [
          // { id: 1, accept: ["of","from"] }     // accepted answers (case-insensitive)
        ]
      }
    ]
  },
  writing: {
    parts: [
      {
        partNumber: 6,
        type: "short-message",
        instruction: "Write a note to your friend about ...",
        wordTarget: 25,
        scoringRubric: "..."   // used by AI scoring (premium)
      },
      {
        partNumber: 7,
        type: "story-or-email",
        choice: ["story", "email"],     // candidate picks one
        promptStory: "...",
        promptEmail: "...",
        wordTarget: 35,
        scoringRubric: "..."
      }
    ]
  }
};
