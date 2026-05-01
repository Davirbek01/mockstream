// EXAMPLE schema for a KET (A2 Key) Reading & Writing mock — POST-2020 FORMAT
// Source: https://www.cambridgeenglish.org/exams-and-tests/key/exam-format/
//
// 60 minutes, 7 parts, 32 questions
//   Reading (Parts 1-5):  6+7+5+6+6 = 30 questions
//   Writing (Parts 6-7):  2 tasks (guided email/note, picture story)
//
// File naming: ket-rw-test-{NN}.js   (NN = 01, 02, ...)
// Loaded by:   site/KET Reading & Writing.html
// Sets global: window.KET_RW_TEST

window.KET_RW_TEST = {
  testInfo: {
    id: "ket-rw-01",
    title: "KET Reading & Writing Mock 01",
    level: "A2",
    totalTime: 60,            // minutes
    totalQuestions: 32,       // 30 R + 2 W
    readingQuestions: 30,
    writingTasks: 2
  },

  reading: {
    parts: [
      {
        partNumber: 1,
        type: "real-world-mcq",
        // 6 short real-world texts (notice/sign/email/text/note) + question with A/B/C
        instruction: "Read the text. Choose the correct answer (A, B or C).",
        items: [
          // { source: "<short real-world text>",
          //   sourceType: "notice|sign|email|text-message|note|sticker",
          //   question: "What does this notice say?",
          //   options: [{letter:"A",text:"..."},{letter:"B",text:"..."},{letter:"C",text:"..."}],
          //   correct: "B" }
          // ... 6 items
        ]
      },
      {
        partNumber: 2,
        type: "multi-text-matching",
        // 3 short texts on a related topic + 7 questions; for each Q, pick text A/B/C
        instruction: "Read the questions and the three texts. For each question, choose the correct answer.",
        topic: "...",
        texts: [
          // { id: "A", title: "Anna", body: "<~80-120 word short text>" },
          // { id: "B", title: "Ben",  body: "..." },
          // { id: "C", title: "Carla", body: "..." }
        ],
        questions: [
          // { id: 7, prompt: "Which person ...?", correct: "A" }
          // ... 7 questions (numbered 7-13 across the test)
        ]
      },
      {
        partNumber: 3,
        type: "long-text-mcq",
        // 1 long passage (~250-300 words) + 5 comprehension MCQs
        instruction: "Read the text and questions. For each question, choose the correct answer.",
        passage: "...",
        questions: [
          // { id: 14, prompt: "...", options: [A,B,C], correct: "A" }
          // ... 5 questions
        ]
      },
      {
        partNumber: 4,
        type: "cloze-mcq",
        // Factual text with 6 vocabulary gaps; each gap has 3 A/B/C options
        instruction: "Choose the best word (A, B or C) for each space.",
        title: "...",
        // text uses placeholders ___1___, ___2___, ... in order
        text: "Some people like cats. They are quiet ___1___ easy to look after. Cats often ___2___ ...",
        gaps: [
          // { id: 19, options: [{letter:"A",text:"and"},{letter:"B",text:"or"},{letter:"C",text:"but"}], correct: "A" }
          // ... 6 gaps (numbered 19-24)
        ]
      },
      {
        partNumber: 5,
        type: "cloze-open",
        // Short email with 6 grammar gaps; candidate writes ONE word per gap
        instruction: "Write ONE word for each space.",
        text: "Hi Tom,\n\nI ___1___ going to ...",
        gaps: [
          // { id: 25, accept: ["am","'m"] }   // case-insensitive
          // ... 6 gaps (numbered 25-30)
        ]
      }
    ]
  },

  writing: {
    parts: [
      {
        partNumber: 6,
        type: "guided-writing",
        // Write a short email or note. Three bullet points to address. Target: 25+ words.
        instruction: "Write an email to your English friend Sam.\nIn your email:",
        bullets: [
          "tell Sam where you are going",
          "say when you are going",
          "ask Sam to come with you"
        ],
        wordMin: 25,
        scoringRubric: "..."  // optional, used by AI scoring (premium)
      },
      {
        partNumber: 7,
        type: "picture-story",
        // Write a story shown by 3 pictures. Target: 35+ words.
        instruction: "Look at the three pictures. Write the story shown in the pictures.\nWrite 35 words or more.",
        pictures: [
          // { id: 1, alt: "<short alt text>", svg: "<inline SVG>" or imageUrl: "https://..." }
          // ... 3 sequential pictures
        ],
        wordMin: 35,
        scoringRubric: "..."
      }
    ]
  }
};
