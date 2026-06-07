// Cambridge KET (Key English Test) — Paper 2 Listening — Test 5
// VERBATIM transcription from the official Cambridge KET Book 2 · Test 1.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-5",
    title: "KET Listening — Test 5",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://storage.googleapis.com/mockstream-listening-audio/KET-Listening/test5/",
    files: { 1: "PART1.mp3", 2: "PART2.mp3", 3: "PART3.mp3", 4: "PART4.mp3", 5: "PART5.mp3" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: ["You will hear five short conversations.","You will hear each conversation twice.","There is one question for each conversation.","For questions 1–5, put a tick (✓) under the right answer."],
      example: { number: 0, question: "How many people were at the meeting?", options: [{letter:"A",text:"3"},{letter:"B",text:"13"},{letter:"C",text:"30"}], answer: "C" },
      items: [
        { id: 1, question: "What will they eat for dinner this evening?", options: [{letter:"A",text:"chicken"},{letter:"B",text:"fish"},{letter:"C",text:"salad"}], answer: "B" },
        { id: 2, question: "What time is it?", options: [{letter:"A",text:"2:10"},{letter:"B",text:"2:20"},{letter:"C",text:"2:30"}], answer: "C" },
        { id: 3, question: "What's Michele going to read?", options: [{letter:"A",text:"book"},{letter:"B",text:"newspaper"},{letter:"C",text:"window-display poster"}], answer: "B" },
        { id: 4, question: "How much did the tickets cost?", options: [{letter:"A",text:"$19"},{letter:"B",text:"$90"},{letter:"C",text:"$99"}], answer: "B" },
        { id: 5, question: "Where is the chemist's?", options: [{letter:"A",text:"A (top of map)"},{letter:"B",text:"B (middle)"},{letter:"C",text:"C (bottom right)"}], answer: "C" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: ["Listen to Kate telling Emma about her family.","Where is each person going today?","For questions 6–10, write a letter A–H next to each person.","You will hear the conversation twice."],
      scenario: "Kate telling Emma about her family — places",
      example: { number: 0, name: "Sam", answer: "B" },
      leftLabel: "PEOPLE", rightLabel: "PLACES",
      options: [{letter:"A",text:"concert"},{letter:"B",text:"dentist's"},{letter:"C",text:"driving school"},{letter:"D",text:"golf club"},{letter:"E",text:"hairdresser's"},{letter:"F",text:"shops"},{letter:"G",text:"Spanish class"},{letter:"H",text:"tennis club"}],
      items: [
        { id: 6, name: "Kate's mother", answer: "E" },
        { id: 7, name: "Tanya",         answer: "F" },
        { id: 8, name: "Len",            answer: "A" },
        { id: 9, name: "Tom",            answer: "C" },
        { id: 10, name: "Kate's father", answer: "G" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: ["Listen to a woman talking to a policeman.","For questions 11–15, tick (✓) A, B or C.","You will hear the conversation twice."],
      example: { number: 0, stem: "Where did the woman lose her bag?", options: [{letter:"A",text:"in town"},{letter:"B",text:"on the bus"},{letter:"C",text:"at home"}], answer: "A" },
      items: [
        { id: 11, stem: "How much money was in the bag?", options: [{letter:"A",text:"£20"},{letter:"B",text:"£40"},{letter:"C",text:"£50"}], answer: "A" },
        { id: 12, stem: "What else was in the bag?", options: [{letter:"A",text:"credit card"},{letter:"B",text:"driving licence"},{letter:"C",text:"gloves"}], answer: "C" },
        { id: 13, stem: "The bag was", options: [{letter:"A",text:"old."},{letter:"B",text:"expensive."},{letter:"C",text:"big."}], answer: "A" },
        { id: 14, stem: "What time did the woman lose the bag?", options: [{letter:"A",text:"9.30"},{letter:"B",text:"10.00"},{letter:"C",text:"10.30"}], answer: "B" },
        { id: 15, stem: "The policeman will telephone her in the", options: [{letter:"A",text:"morning."},{letter:"B",text:"afternoon."},{letter:"C",text:"evening."}], answer: "A" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: ["You will hear a man speaking on the telephone.","He wants to speak to Miss Dixon, but she is not there.","Listen and complete questions 16–20.","You will hear the conversation twice."],
      noteTitle: "Message", subtitle: "TO: Miss Dixon",
      rows: [
        { label: "FROM:",         id: 16, prefix: "Mr",  answer: "HYDE" },
        { label: "Meeting about:", id: 17, prefix: "new", answer: "factory" },
        { label: "On:",           prefilled: "Wednesday" },
        { label: "Time:",         id: 18, answer: "11.30" },
        { label: "In:",           id: 19, suffix: "room", answer: "21" },
        { label: "Please take:",  id: 20, answer: "photographs" }
      ]
    },
    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: ["You will hear a man talking about a day trip.","Listen and complete questions 21–25.","You will hear the information twice."],
      noteTitle: "DAY TRIP", subtitle: "To: Loch Ness",
      rows: [
        { label: "Breakfast at:",         id: 21, answer: "7.30" },
        { label: "Meet in:",              id: 22, answer: "car park" },
        { label: "Colour of lunch ticket:", id: 23, answer: "pink" },
        { label: "Get lunch ticket from:", id: 24, answer: "office" },
        { label: "Bring:",                  id: 25, answer: "jacket" }
      ]
    }
  ]
};
