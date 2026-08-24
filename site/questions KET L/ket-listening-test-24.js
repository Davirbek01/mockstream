// Cambridge KET (Key English Test) — Paper 2 Listening — Test 24
// VERBATIM transcription from the official Cambridge KET Book 6 · Test 4.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-24",
    title: "KET Listening — Test 24",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://storage.googleapis.com/mockstream-listening-audio/KET-Listening/test24/",
    files: { 1: "PART1.m4a", 2: "PART2.m4a", 3: "PART3.m4a", 4: "PART4.m4a", 5: "PART5.m4a" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: ["You will hear five short conversations.","You will hear each conversation twice.","There is one question for each conversation.","For questions 1–5, put a tick (✓) under the right answer."],
      imageBase: "https://storage.googleapis.com/mockstream-listening-audio/KET-Listening/test24/p1/",
      // Q3 (prize amounts) shown as text — book renders them as plain text cards.
      example: { number: 0, question: "How many people were at the meeting?", options: [{letter:"A",image:"q0A.png"},{letter:"B",image:"q0B.png"},{letter:"C",image:"q0C.png"}], answer: "C" },
      items: [
        { id: 1, question: "What is the man going to take to the repair shop?", options: [{letter:"A",image:"q1A.png"},{letter:"B",image:"q1B.png"},{letter:"C",image:"q1C.png"}], answer: "A" },
        { id: 2, question: "How will Nancy and Joe get to the sports centre?",  options: [{letter:"A",image:"q2A.png"},{letter:"B",image:"q2B.png"},{letter:"C",image:"q2C.png"}], answer: "B" },
        { id: 3, question: "How much is the prize for the competition?",        options: [{letter:"A",text:"£100"},{letter:"B",text:"£200"},{letter:"C",text:"£300"}], answer: "B" },
        { id: 4, question: "What will the weather be like tomorrow lunchtime?", options: [{letter:"A",image:"q4A.png"},{letter:"B",image:"q4B.png"},{letter:"C",image:"q4C.png"}], answer: "C" },
        { id: 5, question: "What time will they leave home?",                    options: [{letter:"A",image:"q5A.png"},{letter:"B",image:"q5B.png"},{letter:"C",image:"q5C.png"}], answer: "B" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: ["Listen to Ben talking to his wife about the clothes in his suitcase.","Which clothes will he wear each day?","For questions 6–10, write a letter A–H next to each day.","You will hear the conversation twice."],
      scenario: "Ben talking about clothes in his suitcase — which day for which clothes",
      example: { number: 0, name: "Sunday", answer: "D" },
      leftLabel: "Days", rightLabel: "Clothes",
      options: [{letter:"A",text:"blue shirt"},{letter:"B",text:"coat"},{letter:"C",text:"jacket"},{letter:"D",text:"jeans"},{letter:"E",text:"light trousers"},{letter:"F",text:"shorts"},{letter:"G",text:"suit"},{letter:"H",text:"sweater"}],
      items: [
        { id: 6,  name: "Monday",    answer: "G" },
        { id: 7,  name: "Tuesday",   answer: "E" },
        { id: 8,  name: "Wednesday", answer: "B" },
        { id: 9,  name: "Thursday",  answer: "F" },
        { id: 10, name: "Friday",    answer: "A" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: ["Listen to Duncan talking to a friend about a tennis course.","For questions 11–15, tick (✓) A, B or C.","You will hear the conversation twice."],
      example: { number: 0, stem: "How long was the tennis course?", options: [{letter:"A",text:"one day"},{letter:"B",text:"two days"},{letter:"C",text:"five days"}], answer: "C" },
      items: [
        { id: 11, stem: "Duncan stayed in a hotel", options: [{letter:"A",text:"in a town."},{letter:"B",text:"near the sea."},{letter:"C",text:"in the mountains."}], answer: "C" },
        { id: 12, stem: "Duncan's teacher comes from", options: [{letter:"A",text:"England."},{letter:"B",text:"France."},{letter:"C",text:"Canada."}], answer: "C" },
        { id: 13, stem: "How much did Duncan pay for the course?", options: [{letter:"A",text:"£185"},{letter:"B",text:"£205"},{letter:"C",text:"£265"}], answer: "B" },
        { id: 14, stem: "Before the course, Duncan bought himself some tennis", options: [{letter:"A",text:"shoes."},{letter:"B",text:"clothes."},{letter:"C",text:"balls."}], answer: "A" },
        { id: 15, stem: "On the last evening, there was", options: [{letter:"A",text:"a party."},{letter:"B",text:"a film show."},{letter:"C",text:"a tennis match."}], answer: "A" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: ["You will hear a woman phoning for information about a boat trip.","Listen and complete questions 16–20.","You will hear the conversation twice."],
      noteTitle: "Boat trip on the River Dee", subtitle: "Days of boat trip: Friday and Sunday",
      rows: [
        { label: "Get on boat at the:",  id: 16,                      answer: "bridge" },
        { label: "Time boat leaves:",     id: 17, suffix: "pm",         answer: "12.15" },
        { label: "Boat goes to:",         id: 18,                       answer: "ALDFORD" },
        { label: "On boat, you can buy:", id: 19, prefix: "drinks and", answer: "ice-creams" },
        { label: "Cost of adult ticket:",  id: 20, prefix: "£",          answer: "3.95" }
      ]
    },
    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: ["You will hear a woman giving information on the radio about a theatre school.","Listen and complete questions 21–25.","You will hear the information twice."],
      noteTitle: "Children's theatre school", subtitle: "Name of school: Silver Star",
      rows: [
        { label: "Cost for children over 14:",        id: 21, prefix: "£", suffix: "per week", answer: "89" },
        { label: "Children must take their own:",      id: 22,                                    answer: "lunch" },
        { label: "There is a show every:",              id: 23,                                    answer: "Friday" },
        { label: "The first summer course starts on:", id: 24, prefix: "21st",                    answer: "July" },
        { label: "Phone number:",                       id: 25,                                    answer: "8447 6953" }
      ]
    }
  ]
};
