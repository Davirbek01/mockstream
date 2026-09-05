// Cambridge KET (Key English Test) — Paper 2 Listening — Test 25
// VERBATIM transcription from the official Cambridge KET Book 7 · Test 1.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-25",
    title: "KET Listening — Test 25",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://audio.mock-stream.com/KET-Listening/test25/",
    files: { 1: "PART1.m4a", 2: "PART2.m4a", 3: "PART3.m4a", 4: "PART4.m4a", 5: "PART5.m4a" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: ["You will hear five short conversations.","You will hear each conversation twice.","There is one question for each conversation.","For questions 1–5, put a tick (✓) under the right answer."],
      imageBase: "https://audio.mock-stream.com/KET-Listening/test25/p1/",
      example: { number: 0, question: "How many people were at the meeting?", options: [{letter:"A",image:"q0A.png"},{letter:"B",image:"q0B.png"},{letter:"C",image:"q0C.png"}], answer: "C" },
      items: [
        { id: 1, question: "Which T-shirt does the woman buy?",                options: [{letter:"A",image:"q1A.png"},{letter:"B",image:"q1B.png"},{letter:"C",image:"q1C.png"}], answer: "A" },
        { id: 2, question: "When is the girl's swimming lesson next week?",  options: [{letter:"A",image:"q2A.png"},{letter:"B",image:"q2B.png"},{letter:"C",image:"q2C.png"}], answer: "C" },
        { id: 3, question: "Which bus stop does the woman need?",              options: [{letter:"A",image:"q3A.png"},{letter:"B",image:"q3B.png"},{letter:"C",image:"q3C.png"}], answer: "A" },
        { id: 4, question: "Which is the man's raincoat?",                      options: [{letter:"A",image:"q4A.png"},{letter:"B",image:"q4B.png"},{letter:"C",image:"q4C.png"}], answer: "B" },
        { id: 5, question: "Which is the office manager?",                      options: [{letter:"A",image:"q5A.png"},{letter:"B",image:"q5B.png"},{letter:"C",image:"q5C.png"}], answer: "C" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: ["Listen to Amy and James talking about planning a birthday party.","What job is each person going to do?","For questions 6–10, write a letter A–H next to each person.","You will hear the conversation twice."],
      scenario: "Amy and James planning a birthday party — jobs",
      example: { number: 0, name: "Chris", answer: "F" },
      leftLabel: "People", rightLabel: "Jobs",
      options: [{letter:"A",text:"book the room"},{letter:"B",text:"buy a present"},{letter:"C",text:"buy party food"},{letter:"D",text:"get drinks"},{letter:"E",text:"invite guests"},{letter:"F",text:"make cake"},{letter:"G",text:"plan the music"},{letter:"H",text:"put up balloons"}],
      items: [
        { id: 6,  name: "Amy",    answer: "A" },
        { id: 7,  name: "James",  answer: "E" },
        { id: 8,  name: "Claire", answer: "G" },
        { id: 9,  name: "Tom",    answer: "D" },
        { id: 10, name: "Jane",   answer: "B" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: ["Listen to Jessica talking to Frank about a dance class.","For questions 11–15, tick (✓) A, B or C.","You will hear the conversation twice."],
      example: { number: 0, stem: "What time does the class start?", options: [{letter:"A",text:"7.30 p.m."},{letter:"B",text:"8 p.m."},{letter:"C",text:"9 p.m."}], answer: "B" },
      items: [
        { id: 11, stem: "The class takes", options: [{letter:"A",text:"half an hour."},{letter:"B",text:"three quarters of an hour."},{letter:"C",text:"an hour."}], answer: "B" },
        { id: 12, stem: "What doesn't Frank need to take?", options: [{letter:"A",text:"trainers"},{letter:"B",text:"sports clothes"},{letter:"C",text:"drink"}], answer: "A" },
        { id: 13, stem: "The teacher needs to know", options: [{letter:"A",text:"if people are beginners."},{letter:"B",text:"how fit people are."},{letter:"C",text:"people's age."}], answer: "A" },
        { id: 14, stem: "The normal price of classes is", options: [{letter:"A",text:"£5."},{letter:"B",text:"£6."},{letter:"C",text:"£8."}], answer: "B" },
        { id: 15, stem: "They will meet", options: [{letter:"A",text:"at Jessica's house."},{letter:"B",text:"at college."},{letter:"C",text:"in the café."}], answer: "C" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: ["You will hear a woman asking about a tour of a castle.","Listen and complete questions 16–20.","You will hear the conversation twice."],
      noteTitle: "Castle Tours", subtitle: "Time of first tour: 10 a.m.",
      rows: [
        { label: "Tour takes:",              id: 16, suffix: "minutes",        answer: "45" },
        { label: "Price of a family ticket:", id: 17, prefix: "£",              answer: "22" },
        { label: "Ticket includes:",          id: 18, prefix: "soft drink or", answer: "tea" },
        { label: "Name of gardens:",          id: 19,                            answer: "Highclere" },
        { label: "What to see in gardens:",    id: 20, prefix: "800-year-old", answer: "tree" }
      ]
    },
    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: ["You will hear someone talking on the radio about a cooking programme.","Listen and complete questions 21–25.","You will hear the information twice."],
      noteTitle: "New cooking programme", subtitle: "Name of programme: Cooking for Beginners",
      rows: [
        { label: "Day of programme:",       id: 21,                          answer: "Friday" },
        { label: "Start time:",              id: 22, suffix: "p.m.",          answer: "3.15" },
        { label: "Total number of shows:",  id: 23,                          answer: "6" },
        { label: "Things to cook:",          id: 24, prefix: "cakes, main courses and", answer: "snacks" },
        { label: "Date of first programme:", id: 25,                          answer: "5th July" }
      ]
    }
  ]
};
