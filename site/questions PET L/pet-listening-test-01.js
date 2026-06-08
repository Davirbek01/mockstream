// Cambridge PET (Preliminary English Test) for Schools — Listening — Test 1
// VERBATIM from "Preliminary English Test for Schools 1" (Cambridge UP, 2010).
// Paper 2 Listening: ~35 min · 4 parts · 25 questions.
// Source pages: Test 1 listening = pp.24-30; key = p.111 of book (PDF page 120).
//
// Part 1 picture-MCQ options are real cropped images from book pp.25-27,
// ESRGAN-upscaled x4 (realesrgan-x4plus-anime) and hosted on GCS.

window.PET_L_TEST = {
  testInfo: {
    id: "pet-l-01",
    title: "PET Listening — Test 1",
    paper: "Paper 2 · Listening",
    level: "B1",
    totalTime: 35,
    totalQuestions: 25,
    parts: 4
  },

  audio: {
    base: "https://storage.googleapis.com/mockstream-listening-audio/PET-Listening/test1/",
    // Single full-length recording until per-part splits are produced.
    files: { 1: "FULL.mp3", 2: "FULL.mp3", 3: "FULL.mp3", 4: "FULL.mp3" }
  },

  parts: [
    // ───────────────────────────────── PART 1 ─────────────────────────────────
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–7",
      type: "picture-mcq",
      instruction: [
        "There are seven questions in this part.",
        "For each question there are three pictures and a short recording.",
        "For each question, choose the correct answer A, B or C."
      ],
      imageBase: "https://storage.googleapis.com/mockstream-listening-audio/PET-Listening/test1/p1/",
      example: {
        number: 0,
        question: "Where is the girl's hat?",
        options: [ { letter: "A", image: "q0A.png" }, { letter: "B", image: "q0B.png" }, { letter: "C", image: "q0C.png" } ],
        answer: "A"
      },
      items: [
        { id: 1, question: "Which dish did Mark cook in the competition?",
          options: [ { letter: "A", image: "q1A.png" }, { letter: "B", image: "q1B.png" }, { letter: "C", image: "q1C.png" } ],
          answer: "C" },
        { id: 2, question: "Where is the girl's book now?",
          options: [ { letter: "A", image: "q2A.png" }, { letter: "B", image: "q2B.png" }, { letter: "C", image: "q2C.png" } ],
          answer: "B" },
        { id: 3, question: "Who lives with Josh in his house?",
          options: [ { letter: "A", image: "q3A.png" }, { letter: "B", image: "q3B.png" }, { letter: "C", image: "q3C.png" } ],
          answer: "A" },
        { id: 4, question: "What will the girl take with her on holiday?",
          options: [ { letter: "A", image: "q4A.png" }, { letter: "B", image: "q4B.png" }, { letter: "C", image: "q4C.png" } ],
          answer: "B" },
        { id: 5, question: "What time will the train to Manchester leave?",
          options: [ { letter: "A", image: "q5A.png" }, { letter: "B", image: "q5B.png" }, { letter: "C", image: "q5C.png" } ],
          answer: "C" },
        { id: 6, question: "Where will the friends meet?",
          options: [ { letter: "A", image: "q6A.png" }, { letter: "B", image: "q6B.png" }, { letter: "C", image: "q6C.png" } ],
          answer: "A" },
        { id: 7, question: "Which sport will the boy do soon at the centre?",
          options: [ { letter: "A", image: "q7A.png" }, { letter: "B", image: "q7B.png" }, { letter: "C", image: "q7C.png" } ],
          answer: "C" }
      ]
    },

    // ───────────────────────────────── PART 2 ─────────────────────────────────
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 8–13",
      type: "mcq-conversation",
      instruction: [
        "You will hear an interview with a singer called Nick Parker who plays in a band called Krispy with his sister Mel.",
        "For each question, choose the correct answer A, B or C."
      ],
      items: [
        { id: 8, stem: "When Nick and Mel were younger,",
          options: [
            { letter: "A", text: "they studied music at school." },
            { letter: "B", text: "their father took them to live concerts." },
            { letter: "C", text: "their mother encouraged them to play music." }
          ],
          answer: "B" },
        { id: 9, stem: "When Nick and Mel started writing music together, they",
          options: [
            { letter: "A", text: "disagreed about the style they should have." },
            { letter: "B", text: "didn't want to be the same as other bands." },
            { letter: "C", text: "were influenced by different kinds of music." }
          ],
          answer: "C" },
        { id: 10, stem: "The band Krispy was started after",
          options: [
            { letter: "A", text: "Nick began studying at music school." },
            { letter: "B", text: "two other musicians heard Nick and Mel playing." },
            { letter: "C", text: "Nick and Mel advertised for the band members." }
          ],
          answer: "B" },
        { id: 11, stem: "In the band's first year together,",
          options: [
            { letter: "A", text: "concert audiences liked their music." },
            { letter: "B", text: "they signed a recording contract." },
            { letter: "C", text: "their national tour was very successful." }
          ],
          answer: "A" },
        { id: 12, stem: "What does Nick say about life in the band today?",
          options: [
            { letter: "A", text: "The older members look after him and Mel." },
            { letter: "B", text: "He's pleased to have the chance to travel." },
            { letter: "C", text: "There's no opportunity for them to relax together." }
          ],
          answer: "A" },
        { id: 13, stem: "What disappointment has the band had?",
          options: [
            { letter: "A", text: "They haven't yet had a number one single." },
            { letter: "B", text: "Their first album sold under a million copies." },
            { letter: "C", text: "A health problem delayed their album recording." }
          ],
          answer: "C" }
      ]
    },

    // ───────────────────────────────── PART 3 ─────────────────────────────────
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 14–19",
      type: "note-completion",
      instruction: [
        "You will hear a man called Ben, from a young people's organisation, telling a youth group about a course they can do on Saturdays.",
        "For each question, fill in the missing information in the numbered space."
      ],
      noteTitle: "Saturday course",
      rows: [
        { label: "Name of Ben's organisation:",       id: 14, answer: "Nature" },
        { label: "Aim of course: Discovering",         id: 15, answer: "wildlife" },
        { label: "Closest course location for this group:", id: 16, answer: "forest" },
        { label: "Length of course:",                  id: 17, suffix: "weeks", answer: "12" },
        { label: "Examples of activities we will do: Make a", id: 18, answer: "fire" },
        { label: "Design a",                           id: 19, suffix: "to take home.", answer: "birdhouse" }
      ]
    },

    // ───────────────────────────────── PART 4 ─────────────────────────────────
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 20–25",
      type: "true-false",
      instruction: [
        "Look at the six sentences for this part.",
        "You will hear a boy called Thomas and a girl called Ruby talking about a poster for their school sports day.",
        "Decide if each sentence is correct or incorrect.",
        "If it is correct, choose the letter A for YES. If it is not correct, choose the letter B for NO."
      ],
      scenario: "Thomas and Ruby — discussing a poster for their school sports day",
      items: [
        { id: 20, statement: "Ruby realises that the first design of the poster may need improving.",  answer: "A" },
        { id: 21, statement: "Thomas thinks the poster should be bigger than last year's.",            answer: "B" },
        { id: 22, statement: "Ruby and Thomas agree that the poster should be in colour.",             answer: "B" },
        { id: 23, statement: "Ruby thinks the photograph should be in the middle of the poster.",      answer: "A" },
        { id: 24, statement: "Thomas suggests they use the same photograph as last year.",             answer: "B" },
        { id: 25, statement: "Ruby thinks every word on the poster should be the same size.",          answer: "B" }
      ]
    }
  ]
};
