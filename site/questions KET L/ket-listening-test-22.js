// Cambridge KET (Key English Test) — Paper 2 Listening — Test 22
// VERBATIM transcription from the official Cambridge KET Book 6 · Test 2.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-22",
    title: "KET Listening — Test 22",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://audio.mock-stream.com/KET-Listening/test22/",
    files: { 1: "PART1.m4a", 2: "PART2.m4a", 3: "PART3.m4a", 4: "PART4.m4a", 5: "PART5.m4a" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: ["You will hear five short conversations.","You will hear each conversation twice.","There is one question for each conversation.","For questions 1–5, put a tick (✓) under the right answer."],
      imageBase: "https://audio.mock-stream.com/KET-Listening/test22/p1/",
      // Q1 (day names), Q3 (train times) and Q4 (price tags) shown as text — book renders them as plain text cards.
      example: { number: 0, question: "How many people were at the meeting?", options: [{letter:"A",image:"q0A.png"},{letter:"B",image:"q0B.png"},{letter:"C",image:"q0C.png"}], answer: "C" },
      items: [
        { id: 1, question: "Which day is the man's appointment?",        options: [{letter:"A",text:"Thursday"},{letter:"B",text:"Friday"},{letter:"C",text:"Monday"}], answer: "C" },
        { id: 2, question: "What is the woman going to eat?",              options: [{letter:"A",image:"q2A.png"},{letter:"B",image:"q2B.png"},{letter:"C",image:"q2C.png"}], answer: "B" },
        { id: 3, question: "Which train will the woman take?",              options: [{letter:"A",text:"11.30"},{letter:"B",text:"12.45"},{letter:"C",text:"2.15"}], answer: "B" },
        { id: 4, question: "How much did the man pay for the camera?",     options: [{letter:"A",text:"£150"},{letter:"B",text:"£160"},{letter:"C",text:"£175"}], answer: "B" },
        { id: 5, question: "Which race did the girl win?",                   options: [{letter:"A",image:"q5A.png"},{letter:"B",image:"q5B.png"},{letter:"C",image:"q5C.png"}], answer: "A" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: ["Listen to Rosie talking to a friend about places for a party.","What is the problem with each place?","For questions 6–10, write a letter A–H next to each place.","You will hear the conversation twice."],
      scenario: "Rosie talking about places for a party — problems",
      example: { number: 0, name: "University Hotel", answer: "G" },
      leftLabel: "Places", rightLabel: "Problems",
      options: [{letter:"A",text:"closed"},{letter:"B",text:"cold"},{letter:"C",text:"dark"},{letter:"D",text:"dirty"},{letter:"E",text:"expensive"},{letter:"F",text:"full"},{letter:"G",text:"old"},{letter:"H",text:"small"}],
      items: [
        { id: 6,  name: "Brown's Café",     answer: "A" },
        { id: 7,  name: "Rivers Hotel",     answer: "D" },
        { id: 8,  name: "Bridge Restaurant", answer: "F" },
        { id: 9,  name: "Garden House",    answer: "E" },
        { id: 10, name: "Opera Café",       answer: "H" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: ["Listen to Joe asking about a French language course.","For questions 11–15, tick (✓) A, B or C.","You will hear the conversation twice."],
      example: { number: 0, stem: "Lessons for beginners are on", options: [{letter:"A",text:"Monday."},{letter:"B",text:"Wednesday."},{letter:"C",text:"Friday."}], answer: "B" },
      items: [
        { id: 11, stem: "The best class for Joe is", options: [{letter:"A",text:"French Conversation."},{letter:"B",text:"Business French."},{letter:"C",text:"French for Tourists."}], answer: "C" },
        { id: 12, stem: "Joe's class begins at", options: [{letter:"A",text:"6.30."},{letter:"B",text:"7.15."},{letter:"C",text:"8.30."}], answer: "A" },
        { id: 13, stem: "How many other students will there be in Joe's class?", options: [{letter:"A",text:"9"},{letter:"B",text:"14"},{letter:"C",text:"15"}], answer: "B" },
        { id: 14, stem: "What should Joe take to his first class?", options: [{letter:"A",text:"a dictionary"},{letter:"B",text:"a coursebook"},{letter:"C",text:"a notebook"}], answer: "A" },
        { id: 15, stem: "Joe will pay", options: [{letter:"A",text:"£25."},{letter:"B",text:"£145."},{letter:"C",text:"£170."}], answer: "B" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: ["You will hear a girl asking for information about going to Kendal by bus.","Listen and complete questions 16–20.","You will hear the conversation twice."],
      noteTitle: "Bus to Kendal", subtitle: "First bus leaves at: 6.45 am",
      rows: [
        { label: "Cost of single ticket:",   id: 16, prefix: "£",       answer: "18.25" },
        { label: "Buy ticket from:",          id: 17,                    answer: "the driver" },
        { label: "Address of bus station:",   id: 18, suffix: "Street",  answer: "GATELY" },
        { label: "next to:",                   id: 19,                    answer: "the museum" },
        { label: "At bus station, you can buy:", id: 20, suffix: "and newspapers", answer: "drinks" }
      ]
    },
    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: ["You will hear a telephone message about a trip to the theatre.","Listen and complete questions 21–25.","You will hear the information twice."],
      noteTitle: "Telephone message", subtitle: "To: Jamie\nFrom: Michael",
      rows: [
        { label: "Name of play:",      id: 21, prefix: "The", suffix: "Party",  answer: "Dinner" },
        { label: "Date:",               id: 22, suffix: "August",                answer: "29th" },
        { label: "The theatre is opposite:", id: 23, prefix: "the",                  answer: "library" },
        { label: "Meet Michael at:",     id: 24, suffix: "pm",                    answer: "6.45" },
        { label: "Mobile number:",       id: 25,                                  answer: "0774 32316" }
      ]
    }
  ]
};
