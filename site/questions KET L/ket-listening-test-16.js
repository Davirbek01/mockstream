// Cambridge KET (Key English Test) — Paper 2 Listening — Test 16
// VERBATIM transcription from the official Cambridge KET Book 4 · Test 4.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-16",
    title: "KET Listening — Test 16",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://audio.mock-stream.com/KET-Listening/test16/",
    files: { 1: "PART1.m4a", 2: "PART2.m4a", 3: "PART3.m4a", 4: "PART4.m4a", 5: "PART5.m4a" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: ["You will hear five short conversations.","You will hear each conversation twice.","There is one question for each conversation.","For questions 1–5, put a tick (✓) under the right answer."],
      imageBase: "https://audio.mock-stream.com/KET-Listening/test16/p1/",
      // Q1 (car prices) shown as text — book renders them as plain text cards.
      example: { number: 0, question: "How many people were at the meeting?", options: [{letter:"A",image:"q0A.png"},{letter:"B",image:"q0B.png"},{letter:"C",image:"q0C.png"}], answer: "C" },
      items: [
        { id: 1, question: "How much is the car?",                       options: [{letter:"A",text:"£1000"},{letter:"B",text:"£2000"},{letter:"C",text:"£3000"}], answer: "C" },
        { id: 2, question: "What's Elena going to take to the party?",  options: [{letter:"A",image:"q2A.png"},{letter:"B",image:"q2B.png"},{letter:"C",image:"q2C.png"}], answer: "A" },
        { id: 3, question: "Where will Susan buy her eggs?",             options: [{letter:"A",image:"q3A.png"},{letter:"B",image:"q3B.png"},{letter:"C",image:"q3C.png"}], answer: "B" },
        { id: 4, question: "What time does the film begin?",              options: [{letter:"A",image:"q4A.png"},{letter:"B",image:"q4B.png"},{letter:"C",image:"q4C.png"}], answer: "C" },
        { id: 5, question: "How will the man travel to London?",          options: [{letter:"A",image:"q5A.png"},{letter:"B",image:"q5B.png"},{letter:"C",image:"q5C.png"}], answer: "A" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: ["Listen to Sarah talking to a friend about a sports centre.","What is the problem with the different things at the sports centre?","For questions 6–10, write a letter A–H next to each thing.","You will hear the conversation twice."],
      scenario: "Sarah talking about a sports centre — problems with each thing",
      example: { number: 0, name: "T-shirt", answer: "A" },
      leftLabel: "Things", rightLabel: "Problems",
      options: [{letter:"A",text:"big"},{letter:"B",text:"cold"},{letter:"C",text:"dirty"},{letter:"D",text:"expensive"},{letter:"E",text:"hot"},{letter:"F",text:"late"},{letter:"G",text:"noisy"},{letter:"H",text:"small"}],
      items: [
        { id: 6,  name: "swimming pool",  answer: "G" },
        { id: 7,  name: "car park",        answer: "H" },
        { id: 8,  name: "café",            answer: "C" },
        { id: 9,  name: "football club",  answer: "F" },
        { id: 10, name: "tennis lessons", answer: "D" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: ["Listen to Philip talking to a friend about his photography course.","For questions 11–15, tick (✓) A, B or C.","You will hear the conversation twice."],
      example: { number: 0, stem: "Where does Philip do the photography classes?", options: [{letter:"A",text:"Park College"},{letter:"B",text:"City College"},{letter:"C",text:"South College"}], answer: "B" },
      items: [
        { id: 11, stem: "What time do the photography classes begin?", options: [{letter:"A",text:"5.15 p.m."},{letter:"B",text:"6.00 p.m."},{letter:"C",text:"6.45 p.m."}], answer: "C" },
        { id: 12, stem: "How much does Philip pay for the photography course?", options: [{letter:"A",text:"£55"},{letter:"B",text:"£75"},{letter:"C",text:"£95"}], answer: "B" },
        { id: 13, stem: "Philip's happy with the course because he's", options: [{letter:"A",text:"learning about famous photographers."},{letter:"B",text:"using a new camera."},{letter:"C",text:"getting better at photography."}], answer: "C" },
        { id: 14, stem: "Philip thinks it's easy to take photographs of", options: [{letter:"A",text:"trees."},{letter:"B",text:"animals."},{letter:"C",text:"children."}], answer: "A" },
        { id: 15, stem: "After the course, Philip will", options: [{letter:"A",text:"buy a new camera."},{letter:"B",text:"get a job in photography."},{letter:"C",text:"make photography his hobby."}], answer: "C" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: ["You will hear a man asking for information about the Westwood English School.","Listen and complete questions 16–20.","You will hear the conversation twice."],
      noteTitle: "WESTWOOD ENGLISH SCHOOL", subtitle: "Evening classes on: Thursday",
      rows: [
        { label: "Next course starts on:", id: 16, prefix: "22",            answer: "September" },
        { label: "Speaking class with:",    id: 17, prefix: "Miss",          answer: "Jarvis" },
        { label: "Cost for 12 classes:",    id: 18, prefix: "£",              answer: "78" },
        { label: "Address:",                id: 19, suffix: "Fitzroy Square", answer: "223" },
        { label: "School is next to the:", id: 20,                            answer: "bookshop" }
      ]
    },
    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: ["You will hear some information about Finchester Zoo.","Listen and complete questions 21–25.","You will hear the information twice."],
      noteTitle: "Finchester Zoo", subtitle: "Closed on: Monday",
      rows: [
        { label: "Closing time in summer:", id: 21, suffix: "p.m.",            answer: "9.30" },
        { label: "Meeting place for tour:", id: 22,                              answer: "the entrance" },
        { label: "At 2 p.m., see:",          id: 23, suffix: "eat their food.", answer: "the lions" },
        { label: "Zoo shop sells:",          id: 24, prefix: "books and",      answer: "games" },
        { label: "Child's ticket costs:",    id: 25, prefix: "£",              answer: "4.65" }
      ]
    }
  ]
};
