// Cambridge KET (Key English Test) — Paper 2 Listening — Test 4
// VERBATIM transcription from the official Cambridge KET Book 1 · Test 4.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-4",
    title: "KET Listening — Test 4",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://storage.googleapis.com/mockstream-listening-audio/KET-Listening/test4/",
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
      imageBase: "https://storage.googleapis.com/mockstream-listening-audio/KET-Listening/test4/p1/",
      example: {
        number: 0,
        question: "How many people were at the meeting?",
        options: [ { letter: "A", image: "q0A.png" }, { letter: "B", image: "q0B.png" }, { letter: "C", image: "q0C.png" } ],
        answer: "C"
      },
      items: [
        { id: 1, question: "When is the party?",                              options: [{letter:"A",image:"q1A.png"},{letter:"B",image:"q1B.png"},{letter:"C",image:"q1C.png"}], answer: "C" },
        { id: 2, question: "Where are the glasses?",                          options: [{letter:"A",image:"q2A.png"},{letter:"B",image:"q2B.png"},{letter:"C",image:"q2C.png"}], answer: "A" },
        { id: 3, question: "How much are the shoes?",                          options: [{letter:"A",image:"q3A.png"},{letter:"B",image:"q3B.png"},{letter:"C",image:"q3C.png"}], answer: "C" },
        { id: 4, question: "What will the weather be like in the afternoon?", options: [{letter:"A",image:"q4A.png"},{letter:"B",image:"q4B.png"},{letter:"C",image:"q4C.png"}], answer: "A" },
        { id: 5, question: "What time will she take the train?",               options: [{letter:"A",image:"q5A.png"},{letter:"B",image:"q5B.png"},{letter:"C",image:"q5C.png"}], answer: "C" }
      ]
    },

    {
      partNumber: 2,
      label: "PART 2",
      questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: [
        "Listen to Teresa talking to Paul about presents for his family.",
        "What is she going to buy for each person?",
        "For questions 6–10, write a letter A–H next to each person.",
        "You will hear the conversation twice."
      ],
      scenario: "Teresa talking to Paul — presents for his family",
      example: { number: 0, name: "Kevin", answer: "A" },
      leftLabel: "PEOPLE",
      rightLabel: "PRESENTS",
      options: [
        { letter: "A", text: "book" },
        { letter: "B", text: "cassette" },
        { letter: "C", text: "football" },
        { letter: "D", text: "meal" },
        { letter: "E", text: "shirt" },
        { letter: "F", text: "theatre tickets" },
        { letter: "G", text: "tie" },
        { letter: "H", text: "video" }
      ],
      items: [
        { id: 6,  name: "Jon",    answer: "E" },
        { id: 7,  name: "Ann",    answer: "F" },
        { id: 8,  name: "Mother", answer: "B" },
        { id: 9,  name: "Father", answer: "G" },
        { id: 10, name: "Paul",   answer: "D" }
      ]
    },

    {
      partNumber: 3,
      label: "PART 3",
      questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: [
        "Listen to Carlos asking for information about a library.",
        "For questions 11–15, tick (✓) A, B or C.",
        "You will hear the conversation twice."
      ],
      example: {
        number: 0,
        stem: "The library is closed until",
        options: [
          { letter: "A", text: "Tuesday." },
          { letter: "B", text: "Wednesday." },
          { letter: "C", text: "Thursday." }
        ],
        answer: "C"
      },
      items: [
        { id: 11, stem: "What must Carlos take to the library?",  options: [ { letter: "A", text: "a student card" }, { letter: "B", text: "a teacher's letter" }, { letter: "C", text: "a passport" } ], answer: "B" },
        { id: 12, stem: "How much will it cost Carlos to join?",   options: [ { letter: "A", text: "10 euros" },        { letter: "B", text: "15 euros" },             { letter: "C", text: "20 euros" } ],    answer: "A" },
        { id: 13, stem: "Carlos will get",                           options: [ { letter: "A", text: "2 library tickets." }, { letter: "B", text: "3 library tickets." }, { letter: "C", text: "4 library tickets." } ], answer: "C" },
        { id: 14, stem: "On Saturdays, the library opens at",        options: [ { letter: "A", text: "10.30 a.m." },      { letter: "B", text: "11.00 a.m." },           { letter: "C", text: "2.30 p.m." } ], answer: "B" },
        { id: 15, stem: "The library is in",                          options: [ { letter: "A", text: "Murdoch Street." }, { letter: "B", text: "Murdosh Street." },       { letter: "C", text: "Murdock Street." } ], answer: "A" }
      ]
    },

    {
      partNumber: 4,
      label: "PART 4",
      questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: [
        "You will hear a woman telephoning a garage about her car.",
        "Listen and complete questions 16–20.",
        "You will hear the conversation twice."
      ],
      noteTitle: "Jackson's Garage",
      subtitle: "Customer's name: Mary Wilson",
      rows: [
        { label: "Trouble with car:",       id: 16, answer: "brakes" },
        { label: "Office address:",          id: 17, prefix: "31", suffix: "Road", answer: "Hill" },
        { label: "Customer's phone number:", id: 18, answer: "350519" },
        { label: "Time of appointment:",     id: 19, answer: "2.00" },
        { label: "Colour of car:",           id: 20, answer: "red" }
      ]
    },

    {
      partNumber: 5,
      label: "PART 5",
      questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: [
        "You will hear a man talking on the radio.",
        "Listen and complete questions 21–25.",
        "You will hear the information twice."
      ],
      noteTitle: "Old School Friends",
      subtitle: "Please contact:\nFirst name: Janet",
      rows: [
        { label: "Last name:",       id: 21, answer: "Craig" },
        { label: "Name of school:",   id: 22, suffix: "School", answer: "Park" },
        { label: "From:",             id: 23, answer: "1984" },
        { label: "To:",               id: 24, answer: "1990" },
        { label: "Telephone number:", id: 25, answer: "587 634" }
      ]
    }
  ]
};
