// Cambridge KET (Key English Test) — Paper 2 Listening — Test 2
// VERBATIM transcription from the official Cambridge KET Book 1 · Test 2.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-2",
    title: "KET Listening — Test 2",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://storage.googleapis.com/mockstream-listening-audio/KET-Listening/test2/",
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
        question: "How many people were at the meeting?",
        options: [
          { letter: "A", text: "13" },
          { letter: "B", text: "300" },
          { letter: "C", text: "30" }
        ],
        answer: "C"
      },
      items: [
        { id: 1, question: "What is John going to do tonight?",  options: [ { letter: "A", text: "swimming" },   { letter: "B", text: "motorbike riding" }, { letter: "C", text: "running" } ], answer: "C" },
        { id: 2, question: "Which is Ben's family?",              options: [ { letter: "A", text: "family A" },    { letter: "B", text: "family B" },           { letter: "C", text: "family C" } ], answer: "A" },
        { id: 3, question: "Which bag does the woman buy?",        options: [ { letter: "A", text: "handbag" },     { letter: "B", text: "evening bag" },         { letter: "C", text: "purse" } ],     answer: "C" },
        { id: 4, question: "How much did the woman pay for the apples?", options: [ { letter: "A", text: "30p" },  { letter: "B", text: "35p" },                  { letter: "C", text: "40p" } ],       answer: "A" },
        { id: 5, question: "What time does the film start?",        options: [ { letter: "A", text: "clock A" },     { letter: "B", text: "clock B" },              { letter: "C", text: "clock C" } ],   answer: "A" }
      ]
    },

    {
      partNumber: 2,
      label: "PART 2",
      questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: [
        "Listen to Liz and Michael talking about rooms in a hotel.",
        "They are going to paint the rooms.",
        "What colour are they going to paint each room?",
        "For questions 6–10, write a letter A–H next to each room.",
        "You will hear the conversation twice."
      ],
      scenario: "Liz and Michael — painting rooms in a hotel",
      example: { number: 0, name: "dining room", answer: "G" },
      leftLabel: "ROOMS",
      rightLabel: "COLOURS",
      options: [
        { letter: "A", text: "dark blue" },
        { letter: "B", text: "light blue" },
        { letter: "C", text: "dark green" },
        { letter: "D", text: "light green" },
        { letter: "E", text: "grey" },
        { letter: "F", text: "red" },
        { letter: "G", text: "white" },
        { letter: "H", text: "light yellow" }
      ],
      items: [
        { id: 6,  name: "television room",      answer: "H" },
        { id: 7,  name: "first floor bedrooms", answer: "C" },
        { id: 8,  name: "second floor bedrooms", answer: "B" },
        { id: 9,  name: "office",                answer: "E" },
        { id: 10, name: "kitchen",               answer: "F" }
      ]
    },

    {
      partNumber: 3,
      label: "PART 3",
      questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: [
        "Listen to Sarah talking to her friend, Jane, about a new job.",
        "For questions 11–15, tick (✓) A, B or C.",
        "You will hear the conversation twice."
      ],
      example: {
        number: 0,
        stem: "Sarah's boss wants a new",
        options: [
          { letter: "A", text: "manager." },
          { letter: "B", text: "shop assistant." },
          { letter: "C", text: "secretary." }
        ],
        answer: "C"
      },
      items: [
        { id: 11, stem: "Sarah usually starts work at",    options: [ { letter: "A", text: "6.00." },           { letter: "B", text: "8.30." },           { letter: "C", text: "9.00." } ],          answer: "C" },
        { id: 12, stem: "In the new job, Jane can earn",   options: [ { letter: "A", text: "£160 a week." },     { letter: "B", text: "£180 a week." },    { letter: "C", text: "£210 a week." } ],   answer: "C" },
        { id: 13, stem: "Sarah has lunch",                  options: [ { letter: "A", text: "in a café." },        { letter: "B", text: "in a park." },       { letter: "C", text: "at home." } ],        answer: "A" },
        { id: 14, stem: "In the new job, Jane can have",   options: [ { letter: "A", text: "3 weeks' holiday." }, { letter: "B", text: "4 weeks' holiday." }, { letter: "C", text: "5 weeks' holiday." } ], answer: "A" },
        { id: 15, stem: "The manager's name is Mr",         options: [ { letter: "A", text: "Fawset." },           { letter: "B", text: "Fawcett." },          { letter: "C", text: "Fausett." } ],         answer: "B" }
      ]
    },

    {
      partNumber: 4,
      label: "PART 4",
      questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: [
        "You will hear a student telephoning a school.",
        "Listen and complete questions 16–20.",
        "You will hear the conversation twice."
      ],
      noteTitle: "Notebook",
      subtitle: "Name of school: International Language School\nNext course begins:",
      rows: [
        { label: "Day:",           id: 16, answer: "Monday" },
        { label: "Date:",          id: 17, suffix: "3rd", answer: "January" },
        { label: "Classes begin at:", id: 18, answer: "9.15" },
        { label: "Address:",       id: 19, suffix: "London Road", answer: "57" },
        { label: "Near:",          id: 20, answer: "the station" }
      ]
    },

    {
      partNumber: 5,
      label: "PART 5",
      questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: [
        "You will hear a tour guide talking about a town in Scotland.",
        "Listen and complete questions 21–25.",
        "You will hear the information twice."
      ],
      noteTitle: "Notes",
      subtitle: "Guide's name: Jim",
      rows: [
        { label: "Banks open from:",      id: 21, answer: "9.30" },
        { label: "to:",                    id: 22, answer: "4.00" },
        { label: "closed on:",             id: 23, answer: "Sunday" },
        { label: "Bus to city centre — number:", id: 24, answer: "21" },
        { label: "cost:",                   id: 25, answer: "60p" }
      ]
    }
  ]
};
