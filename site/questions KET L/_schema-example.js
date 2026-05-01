// EXAMPLE schema for a KET Listening mock (DOCUMENTATION ONLY — does not load)
// File naming: ket-listening-test-{NN}.js (NN = 01, 02, ...)
// Loaded by:   site/KET Listening.html
// Sets global: window.KET_LISTENING_TEST
// Audio:       gs://mockstream-listening-audio/KET Listening/ket-listening-{NN}-part{N}.mp3
//
// 30 min, 5 parts × 5 questions = 25 questions, A2 level

window.KET_LISTENING_TEST = {
  testInfo: {
    id: "ket-listening-01",
    title: "KET Listening Mock 01",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25
  },
  parts: [
    {
      partNumber: 1,
      type: "mcq-pictures",   // 5 short conversations → pick A/B/C picture
      audioFile: "https://storage.googleapis.com/mockstream-listening-audio/KET%20Listening/ket-listening-01-part1.mp3",
      transcript: "...",
      questions: [
        // { id: 1, prompt: "What is the woman buying?",
        //   options: [
        //     { letter: "A", img: "https://storage.googleapis.com/mockstream-listening-audio/KET%20Listening%20images/test01/q1a.jpg" },
        //     { letter: "B", img: "..." },
        //     { letter: "C", img: "..." }
        //   ],
        //   correct: "B" }
      ]
    },
    {
      partNumber: 2,
      type: "long-mcq",       // longer dialogue → 5 A/B/C MCQs
      audioFile: "https://storage.googleapis.com/mockstream-listening-audio/KET%20Listening/ket-listening-01-part2.mp3",
      transcript: "...",
      questions: [
        // { id: 6, prompt: "...", options: [A,B,C], correct: "A" }
      ]
    },
    {
      partNumber: 3,
      type: "gap-fill",       // form/notes — write 1 word or short answer per gap
      audioFile: "https://storage.googleapis.com/mockstream-listening-audio/KET%20Listening/ket-listening-01-part3.mp3",
      transcript: "...",
      formTemplate: "Name: ___11___\nDate: ___12___\n...",
      questions: [
        // { id: 11, accept: ["smith","Smith"] }
      ]
    },
    {
      partNumber: 4,
      type: "mcq-text",       // 5 short conversations, A/B/C text answers
      audioFile: "https://storage.googleapis.com/mockstream-listening-audio/KET%20Listening/ket-listening-01-part4.mp3",
      transcript: "...",
      questions: []
    },
    {
      partNumber: 5,
      type: "matching",       // 5 speakers → 8 options (3 distractors)
      audioFile: "https://storage.googleapis.com/mockstream-listening-audio/KET%20Listening/ket-listening-01-part5.mp3",
      transcript: "...",
      options: [
        // { letter: "A", text: "..." }  // 8 options
      ],
      questions: [
        // { id: 21, speaker: "Speaker 1", correct: "F" }
      ]
    }
  ]
};
