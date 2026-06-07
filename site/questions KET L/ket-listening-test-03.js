// Cambridge KET (Key English Test) — Paper 2 Listening — Test 3
// VERBATIM transcription from the official Cambridge KET Book 1 · Test 3.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-3",
    title: "KET Listening — Test 3",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://storage.googleapis.com/mockstream-listening-audio/KET-Listening/test3/",
    files: { 1: "PART1.mp3", 2: "PART2.mp3", 3: "PART3.mp3", 4: "PART4.mp3", 5: "PART5.mp3" }
  },

  parts: [

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
          { letter: "A", text: "06:00" },
          { letter: "B", text: "08:00" },
          { letter: "C", text: "09:00" }
        ],
        answer: "C"
      },
      items: [
        { id: 1, question: "How does the man travel to Liverpool?", options: [ { letter: "A", text: "train" },     { letter: "B", text: "car" },             { letter: "C", text: "bus" } ],          answer: "C" },
        { id: 2, question: "Which bill has just arrived?",            options: [ { letter: "A", text: "gas" },       { letter: "B", text: "water" },           { letter: "C", text: "electricity" } ],  answer: "B" },
        { id: 3, question: "What will they do tomorrow afternoon?",   options: [ { letter: "A", text: "walking" },    { letter: "B", text: "swimming" },         { letter: "C", text: "sailing" } ],       answer: "B" },
        { id: 4, question: "How did the man hear about the fire?",     options: [ { letter: "A", text: "newspaper" },  { letter: "B", text: "television" },       { letter: "C", text: "telephone" } ],    answer: "C" },
        { id: 5, question: "What time did Mr Thompson ring?",          options: [ { letter: "A", text: "clock A" },     { letter: "B", text: "clock B" },           { letter: "C", text: "clock C" } ],      answer: "A" }
      ]
    },

    {
      partNumber: 2,
      label: "PART 2",
      questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: [
        "Listen to Jim and Julie talking at a party.",
        "What do the guests want to eat or drink?",
        "For questions 6–10, write a letter A–H next to each person.",
        "You will hear the conversation twice."
      ],
      scenario: "Jim and Julie at a party — what guests want to eat/drink",
      example: { number: 0, name: "Kevin", answer: "E" },
      leftLabel: "PEOPLE",
      rightLabel: "FOOD AND DRINK",
      options: [
        { letter: "A", text: "coffee" },
        { letter: "B", text: "coke" },
        { letter: "C", text: "ice-cream" },
        { letter: "D", text: "milk" },
        { letter: "E", text: "orange juice" },
        { letter: "F", text: "sandwich" },
        { letter: "G", text: "tea" },
        { letter: "H", text: "water" }
      ],
      items: [
        { id: 6,  name: "Barbara", answer: "F" },
        { id: 7,  name: "Paul",    answer: "C" },
        { id: 8,  name: "Diana",   answer: "D" },
        { id: 9,  name: "Jim",     answer: "B" },
        { id: 10, name: "Julie",   answer: "G" }
      ]
    },

    {
      partNumber: 3,
      label: "PART 3",
      questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: [
        "Listen to a man asking for information in a travel agency.",
        "For questions 11–15, tick (✓) A, B or C.",
        "You will hear the conversation twice."
      ],
      example: {
        number: 0,
        stem: "You can fly to Buenos Aires",
        options: [
          { letter: "A", text: "once a week." },
          { letter: "B", text: "twice a week." },
          { letter: "C", text: "three times a week." }
        ],
        answer: "C"
      },
      items: [
        { id: 11, stem: "The plane leaves at",          options: [ { letter: "A", text: "12 a.m." },          { letter: "B", text: "2 p.m." },             { letter: "C", text: "3 p.m." } ],            answer: "B" },
        { id: 12, stem: "The bus station is in",         options: [ { letter: "A", text: "Bill Street." },       { letter: "B", text: "Hill Street." },        { letter: "C", text: "Mill Street." } ],     answer: "C" },
        { id: 13, stem: "The journey to the airport takes", options: [ { letter: "A", text: "1 hour 15 minutes." }, { letter: "B", text: "1 hour 30 minutes." },   { letter: "C", text: "1 hour 45 minutes." } ], answer: "B" },
        { id: 14, stem: "The man's ticket to Buenos Aires will cost", options: [ { letter: "A", text: "£240." }, { letter: "B", text: "£300." },                  { letter: "C", text: "£320." } ],            answer: "A" },
        { id: 15, stem: "The coach costs",                options: [ { letter: "A", text: "£13.50." },           { letter: "B", text: "£14.50." },              { letter: "C", text: "£30.50." } ],          answer: "A" }
      ]
    },

    {
      partNumber: 4,
      label: "PART 4",
      questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: [
        "You will hear a girl talking about her brother, Toni.",
        "Listen and complete questions 16–20.",
        "You will hear the conversation twice."
      ],
      noteTitle: "Toni's had an accident.",
      subtitle: "He's hurt his: leg",
      rows: [
        { label: "Name of hospital:", id: 16, answer: "City" },
        { label: "Room:",              id: 17, answer: "G8" },
        { label: "Floor:",             id: 18, answer: "3rd" },
        { label: "Visiting hours:",    id: 19, prefix: "4 p.m. to", suffix: "every day", answer: "7 p.m." },
        { label: "Please take:",       id: 20, answer: "some magazines" }
      ]
    },

    {
      partNumber: 5,
      label: "PART 5",
      questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: [
        "You will hear some information about a farm.",
        "Listen and complete questions 21–25.",
        "You will hear the information twice."
      ],
      noteTitle: "PARK FARM",
      subtitle: "To see: Farm Animals",
      rows: [
        { label: "Food in:",         id: 21, suffix: "Cat Tea Room", answer: "Black" },
        { label: "Opens at:",         id: 22, answer: "10.30" },
        { label: "Closes at:",        prefilled: "5 p.m." },
        { label: "Family ticket costs:", id: 23, prefix: "£", answer: "17" },
        { label: "Don't bring:",       id: 24, answer: "dog" },
        { label: "Not far from:",      id: 25, answer: "the river" }
      ]
    }
  ]
};
