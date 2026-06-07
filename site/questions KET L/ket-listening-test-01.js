// Cambridge KET (Key English Test) — Paper 2 Listening — Test 1
// VERBATIM transcription from the official Cambridge KET Book 1 · Test 1.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-1",
    title: "KET Listening — Test 1",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://storage.googleapis.com/mockstream-listening-audio/KET-Listening/test1/",
    files: { 1: "PART1.mp3", 2: "PART2.mp3", 3: "PART3.mp3", 4: "PART4.mp3", 5: "PART5.mp3" }
  },

  parts: [

    // ─────────────────── PART 1 (Q1–5) ───────────────────
    {
      partNumber: 1,
      label: "PART 1",
      questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: [
        "You will hear five short conversations.",
        "You will hear each conversation twice.",
        "There is one question for each conversation.",
        "For questions 1–5, put a tick (✓) under the right answer."
      ],
      example: {
        number: 0,
        question: "What time is it?",
        options: [
          { letter: "A", text: "05:00" },
          { letter: "B", text: "08:00" },
          { letter: "C", text: "09:00" }
        ],
        answer: "C"
      },
      items: [
        { id: 1, question: "What have they forgotten?",  options: [ { letter: "A", text: "tickets" },    { letter: "B", text: "camera" },         { letter: "C", text: "diary" } ],         answer: "B" },
        { id: 2, question: "What time does the train go?", options: [ { letter: "A", text: "6:15" },     { letter: "B", text: "6:00" },           { letter: "C", text: "6:45" } ],          answer: "A" },
        { id: 3, question: "Where is Room 22?",            options: [ { letter: "A", text: "A (above main hall)" }, { letter: "B", text: "B (below main hall)" }, { letter: "C", text: "C (bottom right)" } ], answer: "B" },
        { id: 4, question: "Which man wants to see him?",   options: [ { letter: "A", text: "man with hat & beard" }, { letter: "B", text: "man with hat, glasses & beard" }, { letter: "C", text: "man with beard only" } ], answer: "A" },
        { id: 5, question: "How did the woman get to work?", options: [ { letter: "A", text: "bicycle" },   { letter: "B", text: "bus" },             { letter: "C", text: "car" } ],            answer: "C" }
      ]
    },

    // ─────────────────── PART 2 (Q6–10) ──────────────────
    {
      partNumber: 2,
      label: "PART 2",
      questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: [
        "Listen to Paul talking to a friend about his family.",
        "What does each person do?",
        "For questions 6–10, write a letter A–H next to each person.",
        "You will hear the conversation twice."
      ],
      scenario: "Paul talking about his family — jobs",
      example: { number: 0, name: "Sally", answer: "H" },
      leftLabel: "PEOPLE",
      rightLabel: "JOBS",
      options: [
        { letter: "A", text: "bank clerk" },
        { letter: "B", text: "doctor" },
        { letter: "C", text: "farmer" },
        { letter: "D", text: "shop assistant" },
        { letter: "E", text: "stopped work" },
        { letter: "F", text: "student" },
        { letter: "G", text: "teacher" },
        { letter: "H", text: "writer" }
      ],
      items: [
        { id: 6,  name: "Bill",          answer: "F" },
        { id: 7,  name: "David",         answer: "G" },
        { id: 8,  name: "Paul's mother", answer: "E" },
        { id: 9,  name: "Paul's father", answer: "B" },
        { id: 10, name: "Paul",          answer: "A" }
      ]
    },

    // ─────────────────── PART 3 (Q11–15) ─────────────────
    {
      partNumber: 3,
      label: "PART 3",
      questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: [
        "Listen to Eric talking to Mary about the weekend.",
        "Their friend, Carlos, is coming to visit them.",
        "For questions 11–15, tick (✓) A, B or C.",
        "You will hear the conversation twice."
      ],
      example: {
        number: 0,
        stem: "What does Carlos hate?",
        options: [
          { letter: "A", text: "shopping" },
          { letter: "B", text: "museums" },
          { letter: "C", text: "football" }
        ],
        answer: "A"
      },
      items: [
        { id: 11, stem: "When is the football match?", options: [ { letter: "A", text: "Saturday morning" }, { letter: "B", text: "Saturday afternoon" }, { letter: "C", text: "Sunday afternoon" } ], answer: "B" },
        { id: 12, stem: "Where are they going to eat on Saturday evening?", options: [ { letter: "A", text: "at home" }, { letter: "B", text: "in an Italian restaurant" }, { letter: "C", text: "in a Chinese restaurant" } ], answer: "C" },
        { id: 13, stem: "What are they going to do on Sunday morning?", options: [ { letter: "A", text: "go for a drive" }, { letter: "B", text: "get up late" }, { letter: "C", text: "go to the cinema" } ], answer: "A" },
        { id: 14, stem: "Where are they going to have lunch on Sunday?", options: [ { letter: "A", text: "in a café" }, { letter: "B", text: "in a pub" }, { letter: "C", text: "at home" } ], answer: "B" },
        { id: 15, stem: "They can't go to the cinema on Sunday afternoon because", options: [ { letter: "A", text: "Carlos doesn't like films." }, { letter: "B", text: "Eric doesn't like films." }, { letter: "C", text: "they don't have time." } ], answer: "C" }
      ]
    },

    // ─────────────────── PART 4 (Q16–20) ─────────────────
    {
      partNumber: 4,
      label: "PART 4",
      questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: [
        "You will hear a telephone conversation.",
        "A girl wants to speak to Martin, but he is not there.",
        "Listen and complete questions 16–20.",
        "You will hear the conversation twice."
      ],
      noteTitle: "Phone Message",
      subtitle: "To: Martin",
      rows: [
        { label: "From:",            id: 16, answer: "Elaine" },
        { label: "Party at:",         id: 17, answer: "Grand Hotel" },
        { label: "Time:",             id: 18, answer: "8.30 p.m." },
        { label: "Please bring:",     id: 19, answer: "friend" },
        { label: "Her phone number:", id: 20, answer: "724 5936" }
      ]
    },

    // ─────────────────── PART 5 (Q21–25) ─────────────────
    {
      partNumber: 5,
      label: "PART 5",
      questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: [
        "You will hear some information about a travel agency.",
        "Listen and complete questions 21–25.",
        "You will hear the information twice."
      ],
      noteTitle: "South Seas Travel Agency",
      subtitle: "New phone number: 847 2296",
      rows: [
        { label: "New address:",       id: 21, prefix: "98", suffix: "Road", answer: "Norwich" },
        { label: "Opposite:",          id: 22, answer: "bank" },
        { label: "Opens on:",          id: 23, answer: "21st May" },
        { label: "Book a holiday for:", id: 24, prefix: "£", answer: "250" },
        { label: "and get a free:",     id: 25, answer: "travel bag" }
      ]
    }
  ]
};
