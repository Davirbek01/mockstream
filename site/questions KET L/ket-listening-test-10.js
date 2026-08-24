// Cambridge KET (Key English Test) — Paper 2 Listening — Test 10
// VERBATIM transcription from the official Cambridge KET Book 3 · Test 2.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-10",
    title: "KET Listening — Test 10",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://storage.googleapis.com/mockstream-listening-audio/KET-Listening/test10/",
    files: { 1: "PART1.m4a", 2: "PART2.m4a", 3: "PART3.m4a", 4: "PART4.m4a", 5: "PART5.m4a" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: ["You will hear five short conversations.","You will hear each conversation twice.","There is one question for each conversation.","For questions 1–5, put a tick (✓) under the right answer."],
      imageBase: "https://storage.googleapis.com/mockstream-listening-audio/KET-Listening/test10/p1/",
      // Q1 (colours) and Q2 (platform numbers) shown as text — book renders them as plain text cards.
      example: { number: 0, question: "How many people were at the meeting?", options: [{letter:"A",image:"q0A.png"},{letter:"B",image:"q0B.png"},{letter:"C",image:"q0C.png"}], answer: "C" },
      items: [
        { id: 1, question: "What colour is Kathy's bedroom now?",        options: [{letter:"A",text:"PINK"},{letter:"B",text:"GREEN"},{letter:"C",text:"BLUE"}], answer: "C" },
        { id: 2, question: "Which platform does the woman's train leave from?", options: [{letter:"A",text:"PLATFORM 2"},{letter:"B",text:"PLATFORM 6"},{letter:"C",text:"PLATFORM 10"}], answer: "A" },
        { id: 3, question: "How is Susan going to get to the airport?",   options: [{letter:"A",image:"q3A.png"},{letter:"B",image:"q3B.png"},{letter:"C",image:"q3C.png"}], answer: "A" },
        { id: 4, question: "Which is Anna's family?",                       options: [{letter:"A",image:"q4A.png"},{letter:"B",image:"q4B.png"},{letter:"C",image:"q4C.png"}], answer: "B" },
        { id: 5, question: "When is Kim's birthday party?",                 options: [{letter:"A",text:"June 11"},{letter:"B",text:"June 16"},{letter:"C",text:"June 30"}], answer: "A" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: ["Listen to Rose talking to Steve about her day.","What is Rose going to do at each time?","For questions 6–10, write a letter A–H next to each time.","You will hear the conversation twice."],
      scenario: "Rose talking to Steve about her day — activities",
      example: { number: 0, name: "9.00 a.m.", answer: "E" },
      leftLabel: "TIMES", rightLabel: "ACTIVITIES",
      options: [{letter:"A",text:"art lesson"},{letter:"B",text:"have lunch"},{letter:"C",text:"help Steve"},{letter:"D",text:"meet Bill"},{letter:"E",text:"see doctor"},{letter:"F",text:"see teacher"},{letter:"G",text:"study"},{letter:"H",text:"swim"}],
      items: [
        { id: 6,  name: "10.00 a.m.", answer: "H" },
        { id: 7,  name: "11.00 a.m.", answer: "F" },
        { id: 8,  name: "12.00 p.m.", answer: "D" },
        { id: 9,  name: "1.00 p.m.",  answer: "B" },
        { id: 10, name: "2.00 p.m.",  answer: "A" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: ["Listen to Peter talking to a friend about learning to drive.","For questions 11–15, tick (✓) A, B or C.","You will hear the conversation twice."],
      example: { number: 0, stem: "The name of Peter's driving school is", options: [{letter:"A",text:"AA."},{letter:"B",text:"AC."},{letter:"C",text:"ABC."}], answer: "C" },
      items: [
        { id: 11, stem: "Each driving lesson costs", options: [{letter:"A",text:"£14."},{letter:"B",text:"£40."},{letter:"C",text:"£60."}], answer: "A" },
        { id: 12, stem: "A lesson is", options: [{letter:"A",text:"30 minutes."},{letter:"B",text:"45 minutes."},{letter:"C",text:"60 minutes."}], answer: "B" },
        { id: 13, stem: "The teacher's car is", options: [{letter:"A",text:"slow."},{letter:"B",text:"old."},{letter:"C",text:"big."}], answer: "A" },
        { id: 14, stem: "Peter failed the test because he", options: [{letter:"A",text:"drove too fast."},{letter:"B",text:"didn't see a crossing."},{letter:"C",text:"didn't stop at the traffic lights."}], answer: "C" },
        { id: 15, stem: "Peter thinks the teacher is too", options: [{letter:"A",text:"expensive."},{letter:"B",text:"unfriendly."},{letter:"C",text:"young."}], answer: "A" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: ["You will hear a man asking about theatre tickets.","Listen and complete questions 16–20.","You will hear the conversation twice."],
      noteTitle: "PLAYHOUSE THEATRE", subtitle: "EVENING SHOW: The White Room",
      rows: [
        { label: "Time:",            id: 16,                          answer: "7.30" },
        { label: "AFTERNOON SHOW:",   id: 17, prefix: "The School",   answer: "cats" },
        { label: "Time:",            prefilled: "3 o'clock" },
        { label: "Ticket prices:",   id: 18, prefix: "£15 and £",     answer: "12.50" },
        { label: "All tickets £6 on:", id: 19,                         answer: "Monday" },
        { label: "Car park in:",      id: 20, suffix: "Street",        answer: "Stuart" }
      ]
    },
    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: ["You will hear some information about a health centre.","Listen and complete questions 21–25.","You will hear the information twice."],
      noteTitle: "MILL HOUSE HEALTH CENTRE", subtitle: "Open again tomorrow at: 8 a.m.",
      rows: [
        { label: "Phone number (for appointments):", id: 21,                              answer: "793220" },
        { label: "Phone after:",                       id: 22,                              answer: "8.30" },
        { label: "Get medicines from:",                id: 23, suffix: "Chemist's Shop",   answer: "Padley's" },
        { label: "Bus number:",                          id: 24,                              answer: "77" },
        { label: "For accidents, go to:",                id: 25, suffix: "Hospital",         answer: "University" }
      ]
    }
  ]
};
