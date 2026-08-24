// Cambridge KET (Key English Test) — Paper 2 Listening — Test 8
// VERBATIM transcription from the official Cambridge KET Book 2 · Test 4.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-8",
    title: "KET Listening — Test 8",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://storage.googleapis.com/mockstream-listening-audio/KET-Listening/test8/",
    files: { 1: "PART1.m4a", 2: "PART2.m4a", 3: "PART3.m4a", 4: "PART4.m4a", 5: "PART5.m4a" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: ["You will hear five short conversations.","You will hear each conversation twice.","There is one question for each conversation.","For questions 1–5, put a tick (✓) under the right answer."],
      imageBase: "https://storage.googleapis.com/mockstream-listening-audio/KET-Listening/test8/p1/",
      example: { number: 0, question: "What time is it?", options: [{letter:"A",image:"q0A.png"},{letter:"B",image:"q0B.png"},{letter:"C",image:"q0C.png"}], answer: "C" },
      items: [
        { id: 1, question: "What was the weather like on Wednesday?",        options: [{letter:"A",image:"q1A.png"},{letter:"B",image:"q1B.png"},{letter:"C",image:"q1C.png"}], answer: "B" },
        { id: 2, question: "How much did Mark's pullover cost?",              options: [{letter:"A",image:"q2A.png"},{letter:"B",image:"q2B.png"},{letter:"C",image:"q2C.png"}], answer: "A" },
        { id: 3, question: "What did Raquel buy today?",                       options: [{letter:"A",image:"q3A.png"},{letter:"B",image:"q3B.png"},{letter:"C",image:"q3C.png"}], answer: "C" },
        { id: 4, question: "How many students are there at the college?",     options: [{letter:"A",image:"q4A.png"},{letter:"B",image:"q4B.png"},{letter:"C",image:"q4C.png"}], answer: "C" },
        { id: 5, question: "What is David going to buy?",                      options: [{letter:"A",image:"q5A.png"},{letter:"B",image:"q5B.png"},{letter:"C",image:"q5C.png"}], answer: "A" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: ["Listen to Philip talking to his mother about his son, Simon.","What is Simon going to do on Saturday and Sunday?","For questions 6–10, write a letter A–H next to each time of day.","You will hear the conversation twice."],
      scenario: "Philip talking to his mother — Simon's weekend activities",
      example: { number: 0, name: "Saturday morning", answer: "C" },
      leftLabel: "TIMES", rightLabel: "ACTIVITIES",
      options: [{letter:"A",text:"bicycle ride"},{letter:"B",text:"football match"},{letter:"C",text:"judo class"},{letter:"D",text:"party"},{letter:"E",text:"swimming"},{letter:"F",text:"the cinema"},{letter:"G",text:"the park"},{letter:"H",text:"watching television"}],
      items: [
        { id: 6,  name: "Saturday afternoon", answer: "B" },
        { id: 7,  name: "Saturday evening",   answer: "D" },
        { id: 8,  name: "Sunday morning",     answer: "A" },
        { id: 9,  name: "Sunday afternoon",   answer: "G" },
        { id: 10, name: "Sunday evening",     answer: "H" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: ["Listen to Chloe talking to a man about a sailing holiday.","For questions 11–15, tick (✓) A, B or C.","You will hear the conversation twice."],
      example: { number: 0, stem: "Chloe wants to go to", options: [{letter:"A",text:"Italy."},{letter:"B",text:"Sweden."},{letter:"C",text:"Switzerland."}], answer: "A" },
      items: [
        { id: 11, stem: "How many times has Chloe been sailing before?", options: [{letter:"A",text:"never"},{letter:"B",text:"once"},{letter:"C",text:"twice"}], answer: "A" },
        { id: 12, stem: "How much can Chloe spend?", options: [{letter:"A",text:"£300"},{letter:"B",text:"£380"},{letter:"C",text:"£450"}], answer: "B" },
        { id: 13, stem: "Chloe will go in", options: [{letter:"A",text:"August."},{letter:"B",text:"September."},{letter:"C",text:"October."}], answer: "B" },
        { id: 14, stem: "Chloe would like to sail on", options: [{letter:"A",text:"a lake."},{letter:"B",text:"the sea."},{letter:"C",text:"a river."}], answer: "A" },
        { id: 15, stem: "How does Chloe want to pay?", options: [{letter:"A",text:"by cheque"},{letter:"B",text:"with cash"},{letter:"C",text:"by credit card"}], answer: "C" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: ["You will hear Kate and Jeremy talking about a party.","Listen and complete questions 16–20.","You will hear the conversation twice."],
      noteTitle: "Kate's Birthday Party", subtitle: "Kate will be: 17 years old",
      rows: [
        { label: "Day:",      id: 16, answer: "Friday" },
        { label: "Time:",     id: 17, answer: "8.30" },
        { label: "Place:",    id: 18, answer: "London Hotel" },
        { label: "Address:",  id: 19, suffix: "Street", answer: "SHINDY" },
        { label: "Bring some:", id: 20, answer: "pencils" }
      ]
    },
    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: ["You will hear some information about a cinema.","Listen and complete questions 21–25.","You will hear the information twice."],
      noteTitle: "CINEMA", subtitle: "Name of cinema: North London Arts Cinema",
      rows: [
        { label: "Next week's film:",    id: 21, suffix: "Meeting", answer: "Midnight" },
        { label: "from:",                id: 22, prefix: "Monday to", answer: "Thursday" },
        { label: "times:",                id: 23, prefix: "6.45 p.m. and", answer: "9.15 p.m." },
        { label: "Student ticket costs:", id: 24, prefix: "£", answer: "2.80" },
        { label: "Nearest car park:",      id: 25, suffix: "Street", answer: "HAUXTON" }
      ]
    }
  ]
};
