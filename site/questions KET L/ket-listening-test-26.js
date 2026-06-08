// Cambridge KET (Key English Test) — Paper 2 Listening — Test 26
// VERBATIM transcription from the official Cambridge KET Book 7 · Test 2.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-26",
    title: "KET Listening — Test 26",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://storage.googleapis.com/mockstream-listening-audio/KET-Listening/test26/",
    files: { 1: "PART1.mp3", 2: "PART2.mp3", 3: "PART3.mp3", 4: "PART4.mp3", 5: "PART5.mp3" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: ["You will hear five short conversations.","You will hear each conversation twice.","There is one question for each conversation.","For questions 1–5, put a tick (✓) under the right answer."],
      imageBase: "https://storage.googleapis.com/mockstream-listening-audio/KET-Listening/test26/p1/",
      example: { number: 0, question: "How many people were at the meeting?", options: [{letter:"A",image:"q0A.png"},{letter:"B",image:"q0B.png"},{letter:"C",image:"q0C.png"}], answer: "C" },
      items: [
        { id: 1, question: "What does the woman order?",                     options: [{letter:"A",image:"q1A.png"},{letter:"B",image:"q1B.png"},{letter:"C",image:"q1C.png"}], answer: "C" },
        { id: 2, question: "What size boots is the woman going to try on next?", options: [{letter:"A",image:"q2A.png"},{letter:"B",image:"q2B.png"},{letter:"C",image:"q2C.png"}], answer: "B" },
        { id: 3, question: "Where will the man get off the bus?",            options: [{letter:"A",image:"q3A.png"},{letter:"B",image:"q3B.png"},{letter:"C",image:"q3C.png"}], answer: "C" },
        { id: 4, question: "How many books does the boy want to borrow now?", options: [{letter:"A",image:"q4A.png"},{letter:"B",image:"q4B.png"},{letter:"C",image:"q4C.png"}], answer: "A" },
        { id: 5, question: "What job does Mark's brother do?",                options: [{letter:"A",image:"q5A.png"},{letter:"B",image:"q5B.png"},{letter:"C",image:"q5C.png"}], answer: "A" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: ["Listen to Emily and John talking about activities they did last weekend.","Which activity did each person do?","For questions 6–10, write a letter A–H next to each person.","You will hear the conversation twice."],
      scenario: "Emily and John talking about activities last weekend",
      example: { number: 0, name: "John", answer: "C" },
      leftLabel: "People", rightLabel: "Activities",
      options: [{letter:"A",text:"basketball"},{letter:"B",text:"cycling"},{letter:"C",text:"fishing"},{letter:"D",text:"football"},{letter:"E",text:"skateboarding"},{letter:"F",text:"swimming"},{letter:"G",text:"table-tennis"},{letter:"H",text:"tennis"}],
      items: [
        { id: 6,  name: "Pete",  answer: "B" },
        { id: 7,  name: "Emily", answer: "H" },
        { id: 8,  name: "Jenny", answer: "E" },
        { id: 9,  name: "Joe",   answer: "D" },
        { id: 10, name: "Andy",  answer: "G" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: ["Listen to Suzy talking to a friend about a new shop.","For questions 11–15, tick (✓) A, B or C.","You will hear the conversation twice."],
      example: { number: 0, stem: "When did the new shop open?", options: [{letter:"A",text:"today"},{letter:"B",text:"yesterday"},{letter:"C",text:"last week"}], answer: "C" },
      items: [
        { id: 11, stem: "Where is the new shop?", options: [{letter:"A",text:"near the college"},{letter:"B",text:"outside the town centre"},{letter:"C",text:"opposite the newsagent's"}], answer: "C" },
        { id: 12, stem: "In the shop you cannot buy", options: [{letter:"A",text:"clothes."},{letter:"B",text:"bags."},{letter:"C",text:"boots."}], answer: "B" },
        { id: 13, stem: "What time does the shop close on a Thursday?", options: [{letter:"A",text:"6 p.m."},{letter:"B",text:"8 p.m."},{letter:"C",text:"10 p.m."}], answer: "B" },
        { id: 14, stem: "What days does the shop open?", options: [{letter:"A",text:"Tuesday to Sunday"},{letter:"B",text:"every day"},{letter:"C",text:"Monday to Friday"}], answer: "A" },
        { id: 15, stem: "What should Suzy's friend do if she wants a job?", options: [{letter:"A",text:"phone the manager"},{letter:"B",text:"go to the shop"},{letter:"C",text:"write a letter"}], answer: "B" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: ["You will hear a man phoning about a flat he wants to rent.","Listen and complete questions 16–20.","You will hear the conversation twice."],
      noteTitle: "Flat to rent", subtitle: "Address of flat: 25A Green Street",
      rows: [
        { label: "Price of flat:",        id: 16, prefix: "£", suffix: "a month",   answer: "825" },
        { label: "How far from station:", id: 17, suffix: "minutes on foot",        answer: "15" },
        { label: "Number of bedrooms:",   id: 18,                                    answer: "2" },
        { label: "Furniture in flat:",     id: 19, suffix: "and table",              answer: "sofa" },
        { label: "Day to see flat:",        id: 20,                                    answer: "Monday" }
      ]
    },
    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: ["You will hear some information for new students about a college.","Listen and complete questions 21–25.","You will hear the information twice."],
      noteTitle: "Langley College", subtitle: "Day classes start: Wednesday",
      rows: [
        { label: "Cost to join sports centre per year:", id: 21, prefix: "£",  answer: "79" },
        { label: "Closing time of café:",                  id: 22, suffix: "p.m.", answer: "3" },
        { label: "Name of receptionist:",                   id: 23, prefix: "Mrs", answer: "Myatt" },
        { label: "Phone number:",                           id: 24,                 answer: "99365412704" },
        { label: "What to bring to college:",               id: 25,                 answer: "photo" }
      ]
    }
  ]
};
