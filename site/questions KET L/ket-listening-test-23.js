// Cambridge KET (Key English Test) — Paper 2 Listening — Test 23
// VERBATIM transcription from the official Cambridge KET Book 6 · Test 3.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-23",
    title: "KET Listening — Test 23",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://audio.mock-stream.com/KET-Listening/test23/",
    files: { 1: "PART1.m4a", 2: "PART2.m4a", 3: "PART3.m4a", 4: "PART4.m4a", 5: "PART5.m4a" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: ["You will hear five short conversations.","You will hear each conversation twice.","There is one question for each conversation.","For questions 1–5, put a tick (✓) under the right answer."],
      imageBase: "https://audio.mock-stream.com/KET-Listening/test23/p1/",
      // Q2 (dates) shown as text — book renders them as plain text cards.
      example: { number: 0, question: "How many people were at the meeting?", options: [{letter:"A",image:"q0A.png"},{letter:"B",image:"q0B.png"},{letter:"C",image:"q0C.png"}], answer: "C" },
      items: [
        { id: 1, question: "Where is the photograph now?",                  options: [{letter:"A",image:"q1A.png"},{letter:"B",image:"q1B.png"},{letter:"C",image:"q1C.png"}], answer: "C" },
        { id: 2, question: "When can Suzy come to dinner?",                  options: [{letter:"A",text:"9th"},{letter:"B",text:"16th"},{letter:"C",text:"23rd"}], answer: "A" },
        { id: 3, question: "Where did Jane go on holiday?",                  options: [{letter:"A",image:"q3A.png"},{letter:"B",image:"q3B.png"},{letter:"C",image:"q3C.png"}], answer: "B" },
        { id: 4, question: "What has Maria hurt?",                            options: [{letter:"A",image:"q4A.png"},{letter:"B",image:"q4B.png"},{letter:"C",image:"q4C.png"}], answer: "B" },
        { id: 5, question: "What time will Clare meet Jack at the station?",   options: [{letter:"A",image:"q5A.png"},{letter:"B",image:"q5B.png"},{letter:"C",image:"q5C.png"}], answer: "C" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: ["Listen to Diana talking to a friend about the days they can do some courses.","For questions 6–10, write a letter A–H next to each day.","You will hear the conversation twice."],
      scenario: "Diana talking about days for courses",
      example: { number: 0, name: "Monday", answer: "F" },
      leftLabel: "Days", rightLabel: "Courses",
      options: [{letter:"A",text:"Business Studies"},{letter:"B",text:"Computer Studies"},{letter:"C",text:"Cooking"},{letter:"D",text:"Film Studies"},{letter:"E",text:"Geography"},{letter:"F",text:"Guitar"},{letter:"G",text:"History of Art"},{letter:"H",text:"The Night Sky"}],
      items: [
        { id: 6,  name: "Tuesday",   answer: "C" },
        { id: 7,  name: "Wednesday", answer: "D" },
        { id: 8,  name: "Thursday",  answer: "A" },
        { id: 9,  name: "Friday",    answer: "H" },
        { id: 10, name: "Saturday",  answer: "G" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: ["Listen to a girl asking for information about a coach trip to Edinburgh.","For questions 11–15, tick (✓) A, B or C.","You will hear the conversation twice."],
      example: { number: 0, stem: "The girl wants to go to Edinburgh", options: [{letter:"A",text:"this morning."},{letter:"B",text:"this afternoon."},{letter:"C",text:"tomorrow morning."}], answer: "C" },
      items: [
        { id: 11, stem: "The girl will pay", options: [{letter:"A",text:"£5."},{letter:"B",text:"£7."},{letter:"C",text:"£9."}], answer: "B" },
        { id: 12, stem: "The girl will get on the coach", options: [{letter:"A",text:"outside the library."},{letter:"B",text:"in front of the Grand Hotel."},{letter:"C",text:"in Bridge Street."}], answer: "A" },
        { id: 13, stem: "The coach will be at the girl's stop at", options: [{letter:"A",text:"8.45 am."},{letter:"B",text:"8.55 am."},{letter:"C",text:"9.05 am."}], answer: "B" },
        { id: 14, stem: "In Edinburgh, the girl will visit", options: [{letter:"A",text:"the castle and shops."},{letter:"B",text:"the cathedral and museums."},{letter:"C",text:"the castle and cathedral."}], answer: "C" },
        { id: 15, stem: "The whole trip takes", options: [{letter:"A",text:"2 hours."},{letter:"B",text:"2¼ hours."},{letter:"C",text:"4¼ hours."}], answer: "C" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: ["You will hear the manager of a shop leaving a message for a customer.","Listen and complete questions 16–20.","You will hear the conversation twice."],
      noteTitle: "Message for Anna", subtitle: "From: Bob Watson",
      rows: [
        { label: "Name of shop:",          id: 16,                  answer: "FORSTER'S" },
        { label: "Boots — Size:",          id: 17,                  answer: "38" },
        { label: "Boots — Colour:",         id: 18,                  answer: "green" },
        { label: "Sale price:",              id: 19, prefix: "£",     answer: "65" },
        { label: "Tomorrow shop closes at:", id: 20,                  answer: "2" }
      ]
    },
    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: ["You will hear a man on the radio giving information about an art class.","Listen and complete questions 21–25.","You will hear the information twice."],
      noteTitle: "Art class for families", subtitle: "Place: Hadley College",
      rows: [
        { label: "Date:",                   id: 21, prefix: "9th",  answer: "October" },
        { label: "Start time:",              id: 22, suffix: "am",   answer: "10.15" },
        { label: "Name of special guest:",   id: 23, prefix: "J.P.", answer: "HAYWARD" },
        { label: "Price of family ticket:",  id: 24, prefix: "£",   answer: "8.70" },
        { label: "To book a place, call:",    id: 25,                 answer: "4497 6390" }
      ]
    }
  ]
};
