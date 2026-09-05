// Cambridge KET (Key English Test) — Paper 2 Listening — Test 6
// VERBATIM transcription from the official Cambridge KET Book 2 · Test 2.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-6",
    title: "KET Listening — Test 6",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://audio.mock-stream.com/KET-Listening/test6/",
    files: { 1: "PART1.m4a", 2: "PART2.m4a", 3: "PART3.m4a", 4: "PART4.m4a", 5: "PART5.m4a" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: ["You will hear five short conversations.","You will hear each conversation twice.","There is one question for each conversation.","For questions 1–5, put a tick (✓) under the right answer."],
      imageBase: "https://audio.mock-stream.com/KET-Listening/test6/p1/",
      example: { number: 0, question: "How many people were at the meeting?", options: [{letter:"A",image:"q0A.png"},{letter:"B",image:"q0B.png"},{letter:"C",image:"q0C.png"}], answer: "C" },
      items: [
        { id: 1, question: "How will Mary travel to Scotland?",         options: [{letter:"A",image:"q1A.png"},{letter:"B",image:"q1B.png"},{letter:"C",image:"q1C.png"}], answer: "B" },
        { id: 2, question: "Where are the shoes?",                       options: [{letter:"A",image:"q2A.png"},{letter:"B",image:"q2B.png"},{letter:"C",image:"q2C.png"}], answer: "A" },
        { id: 3, question: "When will the football match start next week?", options: [{letter:"A",image:"q3A.png"},{letter:"B",image:"q3B.png"},{letter:"C",image:"q3C.png"}], answer: "C" },
        { id: 4, question: "Which box of chocolates do they buy?",        options: [{letter:"A",image:"q4A.png"},{letter:"B",image:"q4B.png"},{letter:"C",image:"q4C.png"}], answer: "B" },
        { id: 5, question: "When's Wendy's birthday?",                     options: [{letter:"A",image:"q5A.png"},{letter:"B",image:"q5B.png"},{letter:"C",image:"q5C.png"}], answer: "B" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: ["Listen to Pete talking to a friend about his holiday.","What was the weather like each day?","For questions 6–10, write a letter A–H next to each day.","You will hear the conversation twice."],
      scenario: "Pete talking about his holiday weather",
      example: { number: 0, name: "Monday", answer: "B" },
      leftLabel: "DAYS", rightLabel: "WEATHER",
      options: [{letter:"A",text:"cloud"},{letter:"B",text:"cold"},{letter:"C",text:"fog"},{letter:"D",text:"rain"},{letter:"E",text:"snow"},{letter:"F",text:"sun"},{letter:"G",text:"warm"},{letter:"H",text:"wind"}],
      items: [
        { id: 6,  name: "Tuesday",   answer: "H" },
        { id: 7,  name: "Wednesday", answer: "F" },
        { id: 8,  name: "Thursday",  answer: "A" },
        { id: 9,  name: "Friday",    answer: "D" },
        { id: 10, name: "Saturday",  answer: "G" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: ["Listen to Michael talking to Marina about a new sports centre.","For questions 11–15, tick (✓) A, B or C.","You will hear the conversation twice."],
      example: { number: 0, stem: "Where is the new sports centre?", options: [{letter:"A",text:"Long Road"},{letter:"B",text:"Bridge Street"},{letter:"C",text:"Station Road"}], answer: "A" },
      items: [
        { id: 11, stem: "What sport can't you do at the sports centre?", options: [{letter:"A",text:"tennis"},{letter:"B",text:"table-tennis"},{letter:"C",text:"volleyball"}], answer: "A" },
        { id: 12, stem: "How much must Marina pay?", options: [{letter:"A",text:"£14 a year"},{letter:"B",text:"£30 a year"},{letter:"C",text:"£50 a year"}], answer: "B" },
        { id: 13, stem: "How many days a week is the sports centre open late?", options: [{letter:"A",text:"2"},{letter:"B",text:"3"},{letter:"C",text:"4"}], answer: "B" },
        { id: 14, stem: "Which bus goes to the sports centre?", options: [{letter:"A",text:"number 10"},{letter:"B",text:"number 16"},{letter:"C",text:"number 60"}], answer: "B" },
        { id: 15, stem: "When will Michael and Marina go to the sports centre?", options: [{letter:"A",text:"Tuesday"},{letter:"B",text:"Thursday"},{letter:"C",text:"Friday"}], answer: "C" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: ["You will hear a conversation about a flat for rent.","Listen and complete questions 16–20.","You will hear the conversation twice."],
      noteTitle: "LONFLATS AGENCY", subtitle: "Flat for rent in: Putney",
      rows: [
        { label: "Number of bedrooms:", id: 16, answer: "two" },
        { label: "Cost:",               id: 17, prefix: "£", suffix: "a month", answer: "440" },
        { label: "Address:",            id: 18, prefix: "27", suffix: "Street", answer: "EARSLEY" },
        { label: "When see flat?",      id: 19, prefix: "Tuesday at", answer: "5.30" },
        { label: "Free from:",          id: 20, prefix: "1st", answer: "March" }
      ]
    },
    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: ["You will hear a tour guide talking about a day trip.","Listen and complete questions 21–25.","You will hear the information twice."],
      noteTitle: "TRIP TO CHESTER", subtitle: "Coach leaves: 9.15 a.m.",
      rows: [
        { label: "Arrives Chester:",      id: 21, answer: "10.45" },
        { label: "Morning visit:",        id: 22, answer: "castle" },
        { label: "Price of family ticket:", id: 23, prefix: "£", answer: "8.00" },
        { label: "Lunch in:",              id: 24, answer: "park" },
        { label: "Afternoon visit:",       id: 25, answer: "markets" }
      ]
    }
  ]
};
