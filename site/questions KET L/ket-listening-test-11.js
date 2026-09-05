// Cambridge KET (Key English Test) — Paper 2 Listening — Test 11
// VERBATIM transcription from the official Cambridge KET Book 3 · Test 3.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-11",
    title: "KET Listening — Test 11",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://audio.mock-stream.com/KET-Listening/test11/",
    files: { 1: "PART1.m4a", 2: "PART2.m4a", 3: "PART3.m4a", 4: "PART4.m4a", 5: "PART5.m4a" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: ["You will hear five short conversations.","You will hear each conversation twice.","There is one question for each conversation.","For questions 1–5, put a tick (✓) under the right answer."],
      imageBase: "https://audio.mock-stream.com/KET-Listening/test11/p1/",
      // Q1 (month names) shown as text — book renders them as plain text cards.
      example: { number: 0, question: "How many people were at the meeting?", options: [{letter:"A",image:"q0A.png"},{letter:"B",image:"q0B.png"},{letter:"C",image:"q0C.png"}], answer: "C" },
      items: [
        { id: 1, question: "When will they go on holiday?",         options: [{letter:"A",text:"June"},{letter:"B",text:"July"},{letter:"C",text:"September"}], answer: "A" },
        { id: 2, question: "How is Patti going to travel?",          options: [{letter:"A",image:"q2A.png"},{letter:"B",image:"q2B.png"},{letter:"C",image:"q2C.png"}], answer: "C" },
        { id: 3, question: "What will Sam do?",                       options: [{letter:"A",image:"q3A.png"},{letter:"B",image:"q3B.png"},{letter:"C",image:"q3C.png"}], answer: "B" },
        { id: 4, question: "What was the weather like in Portugal?", options: [{letter:"A",image:"q4A.png"},{letter:"B",image:"q4B.png"},{letter:"C",image:"q4C.png"}], answer: "A" },
        { id: 5, question: "What has the girl broken?",                options: [{letter:"A",image:"q5A.png"},{letter:"B",image:"q5B.png"},{letter:"C",image:"q5C.png"}], answer: "B" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: ["Listen to Patrick talking to his mother about a photo of his old school friends.","What is each person wearing?","For questions 6–10, write a letter A–H next to each person.","You will hear the conversation twice."],
      scenario: "Patrick talking to his mother about a photo — what each person is wearing",
      example: { number: 0, name: "Peter", answer: "D" },
      leftLabel: "PEOPLE", rightLabel: "THEIR CLOTHES",
      options: [{letter:"A",text:"coat"},{letter:"B",text:"dress"},{letter:"C",text:"hat"},{letter:"D",text:"jacket"},{letter:"E",text:"jeans"},{letter:"F",text:"shirt"},{letter:"G",text:"sweater"},{letter:"H",text:"t-shirt"}],
      items: [
        { id: 6,  name: "Martin", answer: "E" },
        { id: 7,  name: "Joanna", answer: "G" },
        { id: 8,  name: "Amy",    answer: "B" },
        { id: 9,  name: "James",  answer: "C" },
        { id: 10, name: "Robert", answer: "H" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: ["Listen to Jenny asking Mark about school holiday activities.","For questions 11–15, tick (✓) A, B or C.","You will hear the conversation twice."],
      example: { number: 0, stem: "The children's show is at", options: [{letter:"A",text:"the theatre."},{letter:"B",text:"the shopping centre."},{letter:"C",text:"the library."}], answer: "C" },
      items: [
        { id: 11, stem: "The show begins at", options: [{letter:"A",text:"1.15."},{letter:"B",text:"2.00."},{letter:"C",text:"3.30."}], answer: "B" },
        { id: 12, stem: "A child's ticket costs", options: [{letter:"A",text:"25p."},{letter:"B",text:"75p."},{letter:"C",text:"£1.50."}], answer: "B" },
        { id: 13, stem: "The holiday reading course is for", options: [{letter:"A",text:"4 weeks."},{letter:"B",text:"6 weeks."},{letter:"C",text:"10 weeks."}], answer: "B" },
        { id: 14, stem: "This year from the library, children can win", options: [{letter:"A",text:"a pen."},{letter:"B",text:"a school bag."},{letter:"C",text:"a book."}], answer: "A" },
        { id: 15, stem: "Jenny should meet Mark again", options: [{letter:"A",text:"next week."},{letter:"B",text:"tomorrow."},{letter:"C",text:"today."}], answer: "C" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: ["You will hear Judy asking about music lessons.","Listen and complete questions 16–20.","You will hear the conversation twice."],
      noteTitle: "GUITAR LESSONS FOR JUDY", subtitle: "Class: Beginners",
      rows: [
        { label: "Day:",                  id: 16,                  answer: "Wednesday" },
        { label: "Starting time:",         id: 17,                  answer: "7.30" },
        { label: "Price of each lesson:", id: 18, prefix: "£",      answer: "20" },
        { label: "Teacher's name:",        id: 19, prefix: "Mrs",    answer: "Capel" },
        { label: "Room number:",            id: 20,                  answer: "328" }
      ]
    },
    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: ["You will hear a teacher talking about a school trip.","Listen and complete questions 21–25.","You will hear the information twice."],
      noteTitle: "SCHOOL TRIP", subtitle: "Day: Saturday",
      rows: [
        { label: "Visit:",    id: 21,                  answer: "film museum" },
        { label: "Leave at:", id: 22,                  answer: "8.45" },
        { label: "Meet in:",  id: 23,                  answer: "car park" },
        { label: "Cost:",     id: 24, prefix: "£",     answer: "6.70" },
        { label: "Bring:",    id: 25,                  answer: "pencils" }
      ]
    }
  ]
};
