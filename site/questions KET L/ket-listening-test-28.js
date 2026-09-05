// Cambridge KET (Key English Test) — Paper 2 Listening — Test 28
// VERBATIM transcription from the official Cambridge KET Book 7 · Test 4.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-28",
    title: "KET Listening — Test 28",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://audio.mock-stream.com/KET-Listening/test28/",
    files: { 1: "PART1.m4a", 2: "PART2.m4a", 3: "PART3.m4a", 4: "PART4.m4a", 5: "PART5.m4a" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: ["You will hear five short conversations.","You will hear each conversation twice.","There is one question for each conversation.","For questions 1–5, put a tick (✓) under the right answer."],
      imageBase: "https://audio.mock-stream.com/KET-Listening/test28/p1/",
      example: { number: 0, question: "How many people were at the meeting?", options: [{letter:"A",image:"q0A.png"},{letter:"B",image:"q0B.png"},{letter:"C",image:"q0C.png"}], answer: "C" },
      items: [
        { id: 1, question: "How will they travel to the pop concert?",         options: [{letter:"A",image:"q1A.png"},{letter:"B",image:"q1B.png"},{letter:"C",image:"q1C.png"}], answer: "A" },
        { id: 2, question: "What was the weather like on Beth's holiday?",     options: [{letter:"A",image:"q2A.png"},{letter:"B",image:"q2B.png"},{letter:"C",image:"q2C.png"}], answer: "B" },
        { id: 3, question: "Where has the teacher put the dictionaries?",       options: [{letter:"A",image:"q3A.png"},{letter:"B",image:"q3B.png"},{letter:"C",image:"q3C.png"}], answer: "B" },
        { id: 4, question: "Where did Paul go running yesterday?",             options: [{letter:"A",image:"q4A.png"},{letter:"B",image:"q4B.png"},{letter:"C",image:"q4C.png"}], answer: "C" },
        { id: 5, question: "What does Karen still need to get for the school play?", options: [{letter:"A",image:"q5A.png"},{letter:"B",image:"q5B.png"},{letter:"C",image:"q5C.png"}], answer: "B" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: ["Listen to Gemma telling a friend about her visits to different countries.","What did she like most about each country?","For questions 6–10, write a letter A–H next to each country.","You will hear the conversation twice."],
      scenario: "Gemma telling about visits to different countries — favourite things",
      example: { number: 0, name: "France", answer: "H" },
      leftLabel: "Countries", rightLabel: "Favourite things",
      options: [{letter:"A",text:"animals"},{letter:"B",text:"beach"},{letter:"C",text:"countryside"},{letter:"D",text:"food"},{letter:"E",text:"hotel"},{letter:"F",text:"shops"},{letter:"G",text:"sport"},{letter:"H",text:"weather"}],
      items: [
        { id: 6,  name: "Italy",      answer: "F" },
        { id: 7,  name: "Mexico",     answer: "D" },
        { id: 8,  name: "India",      answer: "C" },
        { id: 9,  name: "Australia",  answer: "A" },
        { id: 10, name: "Canada",     answer: "E" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: ["Listen to Tony talking to Lisa about a science club competition.","For questions 11–15, tick (✓) A, B or C.","You will hear the conversation twice."],
      example: { number: 0, stem: "Tony says the competition is on", options: [{letter:"A",text:"Monday."},{letter:"B",text:"Tuesday."},{letter:"C",text:"Wednesday."}], answer: "C" },
      items: [
        { id: 11, stem: "Which building will the competition be in?", options: [{letter:"A",text:"the school"},{letter:"B",text:"the town hall"},{letter:"C",text:"the university"}], answer: "C" },
        { id: 12, stem: "How has the team decided to get there?", options: [{letter:"A",text:"They will catch a bus."},{letter:"B",text:"They will walk."},{letter:"C",text:"They will go on the underground."}], answer: "A" },
        { id: 13, stem: "The total number of questions in the quiz will be", options: [{letter:"A",text:"five."},{letter:"B",text:"fifteen."},{letter:"C",text:"twenty-five."}], answer: "C" },
        { id: 14, stem: "Tony's favourite area of science is", options: [{letter:"A",text:"biology."},{letter:"B",text:"chemistry."},{letter:"C",text:"physics."}], answer: "C" },
        { id: 15, stem: "Winners of the competition get", options: [{letter:"A",text:"T-shirts."},{letter:"B",text:"cinema tickets."},{letter:"C",text:"a box of chocolates."}], answer: "B" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: ["You will hear a girl asking for information about a summer job.","Listen and complete questions 16–20.","You will hear the conversation twice."],
      noteTitle: "Summer holiday job", subtitle: "Type of job: Farm worker",
      rows: [
        { label: "Time working day ends:", id: 16,                          answer: "2" },
        { label: "You need to be:",         id: 17, suffix: "and careful",  answer: "strong" },
        { label: "You will earn:",          id: 18, prefix: "£", suffix: "a week", answer: "300" },
        { label: "What you must pay for:", id: 19,                          answer: "bus ticket" },
        { label: "Date work begins:",       id: 20, suffix: "May",           answer: "24th" }
      ]
    },
    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: ["You will hear the manager of a cycling club giving some information about a bike race.","Listen and complete questions 21–25.","You will hear the information twice."],
      noteTitle: "Cardiff Bike Race", subtitle: "Date of race: 22nd September",
      rows: [
        { label: "Team colour:",            id: 21,                          answer: "blue" },
        { label: "Number of people per team:", id: 22,                          answer: "3" },
        { label: "Time of race:",           id: 23, suffix: "a.m.",          answer: "8.30" },
        { label: "Food at snack place:",     id: 24, suffix: "and drink",     answer: "cake" },
        { label: "First prize:",              id: 25, prefix: "a new",         answer: "watch" }
      ]
    }
  ]
};
