// Cambridge KET (Key English Test) — Paper 2 Listening — Test 20
// VERBATIM transcription from the official Cambridge KET Book 5 · Test 4.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-20",
    title: "KET Listening — Test 20",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://storage.googleapis.com/mockstream-listening-audio/KET-Listening/test20/",
    files: { 1: "PART1.m4a", 2: "PART2.m4a", 3: "PART3.m4a", 4: "PART4.m4a", 5: "PART5.m4a" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: ["You will hear five short conversations.","You will hear each conversation twice.","There is one question for each conversation.","For questions 1–5, put a tick (✓) under the right answer."],
      imageBase: "https://storage.googleapis.com/mockstream-listening-audio/KET-Listening/test20/p1/",
      example: { number: 0, question: "How many people were at the meeting?", options: [{letter:"A",image:"q0A.png"},{letter:"B",image:"q0B.png"},{letter:"C",image:"q0C.png"}], answer: "C" },
      items: [
        { id: 1, question: "What are the boys going to do?",         options: [{letter:"A",image:"q1A.png"},{letter:"B",image:"q1B.png"},{letter:"C",image:"q1C.png"}], answer: "B" },
        { id: 2, question: "Which tent does the girl choose?",        options: [{letter:"A",image:"q2A.png"},{letter:"B",image:"q2B.png"},{letter:"C",image:"q2C.png"}], answer: "A" },
        { id: 3, question: "Which one is Ruth's bike?",                options: [{letter:"A",image:"q3A.png"},{letter:"B",image:"q3B.png"},{letter:"C",image:"q3C.png"}], answer: "C" },
        { id: 4, question: "What does Sarah's dad do?",                options: [{letter:"A",image:"q4A.png"},{letter:"B",image:"q4B.png"},{letter:"C",image:"q4C.png"}], answer: "A" },
        { id: 5, question: "Which picture is the woman asking about?", options: [{letter:"A",image:"q5A.png"},{letter:"B",image:"q5B.png"},{letter:"C",image:"q5C.png"}], answer: "B" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: ["Listen to Kerri talking to a friend about her new room.","Where do they decide to put her things?","For questions 6–10, write a letter A–H next to each thing.","You will hear the conversation twice."],
      scenario: "Kerri talking about her new room — where to put each thing",
      example: { number: 0, name: "computer", answer: "D" },
      leftLabel: "Things", rightLabel: "Places",
      options: [{letter:"A",text:"bed"},{letter:"B",text:"big cupboard"},{letter:"C",text:"small cupboard"},{letter:"D",text:"desk"},{letter:"E",text:"floor"},{letter:"F",text:"shelf"},{letter:"G",text:"sofa"},{letter:"H",text:"table"}],
      items: [
        { id: 6,  name: "books",    answer: "E" },
        { id: 7,  name: "plant",    answer: "B" },
        { id: 8,  name: "lamp",     answer: "H" },
        { id: 9,  name: "pillow",   answer: "G" },
        { id: 10, name: "toy bear", answer: "F" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: ["Listen to Jim talking to Sarah about things to take on holiday.","For questions 11–15, tick (✓) A, B or C.","You will hear the conversation twice."],
      example: { number: 0, stem: "Last month, Jim went to", options: [{letter:"A",text:"Italy."},{letter:"B",text:"England."},{letter:"C",text:"Austria."}], answer: "C" },
      items: [
        { id: 11, stem: "Where did Jim buy his walking shoes?", options: [{letter:"A",text:"at the market"},{letter:"B",text:"in a supermarket"},{letter:"C",text:"in a shoe shop"}], answer: "A" },
        { id: 12, stem: "The shoes cost Jim", options: [{letter:"A",text:"£20."},{letter:"B",text:"£48."},{letter:"C",text:"£68."}], answer: "B" },
        { id: 13, stem: "Jim says Sarah should take", options: [{letter:"A",text:"a jacket."},{letter:"B",text:"a sweater."},{letter:"C",text:"a sun hat."}], answer: "C" },
        { id: 14, stem: "How many T-shirts should Sarah take?", options: [{letter:"A",text:"one"},{letter:"B",text:"five"},{letter:"C",text:"seven"}], answer: "B" },
        { id: 15, stem: "Sarah should take her phone because she may want to", options: [{letter:"A",text:"phone the hotel."},{letter:"B",text:"phone home."},{letter:"C",text:"phone for help."}], answer: "C" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: ["You will hear Sally asking a friend about some homework.","Listen and complete questions 16–20.","You will hear the conversation twice."],
      noteTitle: "Homework", subtitle: "Subject: Biology",
      rows: [
        { label: "Name of book:", id: 16,                       answer: "River" },
        { label: "Written by:",    id: 17, prefix: "Martin",    answer: "COOPER" },
        { label: "Read:",          id: 18, suffix: "pages",     answer: "123-127" },
        { label: "Learn about:",   id: 19,                       answer: "fish" },
        { label: "Finish by:",     id: 20,                       answer: "Friday" }
      ]
    },
    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: ["You will hear some information on the radio about a summer music school.","Listen and complete questions 21–25.","You will hear the information twice."],
      noteTitle: "Summer music school", subtitle: "Place: Arts Centre",
      rows: [
        { label: "Starting date:",  id: 21, suffix: "July",                answer: "5th" },
        { label: "Learn to play:",   id: 22, prefix: "piano, guitar,",     answer: "drums" },
        { label: "Classes start at:", id: 23, suffix: "a.m.",                answer: "9.15" },
        { label: "Cost of classes:",  id: 24, prefix: "£", suffix: "a day",  answer: "3.25" },
        { label: "Phone number:",     id: 25,                                 answer: "217 3881" }
      ]
    }
  ]
};
