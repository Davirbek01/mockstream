// Cambridge KET (Key English Test) — Paper 2 Listening — Test 13
// VERBATIM transcription from the official Cambridge KET Book 4 · Test 1.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-13",
    title: "KET Listening — Test 13",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://storage.googleapis.com/mockstream-listening-audio/KET-Listening/test13/",
    files: { 1: "PART1.m4a", 2: "PART2.m4a", 3: "PART3.m4a", 4: "PART4.m4a", 5: "PART5.m4a" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: ["You will hear five short conversations.","You will hear each conversation twice.","There is one question for each conversation.","For questions 1–5, put a tick (✓) under the right answer."],
      imageBase: "https://storage.googleapis.com/mockstream-listening-audio/KET-Listening/test13/p1/",
      // Q2 (month names) and Q4 (colour names) shown as text — book renders them as plain text cards.
      example: { number: 0, question: "How many people were at the meeting?", options: [{letter:"A",image:"q0A.png"},{letter:"B",image:"q0B.png"},{letter:"C",image:"q0C.png"}], answer: "C" },
      items: [
        { id: 1, question: "What music will they play at the party?",  options: [{letter:"A",image:"q1A.png"},{letter:"B",image:"q1B.png"},{letter:"C",image:"q1C.png"}], answer: "C" },
        { id: 2, question: "When will the man go on holiday?",          options: [{letter:"A",text:"June"},{letter:"B",text:"July"},{letter:"C",text:"August"}], answer: "B" },
        { id: 3, question: "What will the weather be like tomorrow?",   options: [{letter:"A",image:"q3A.png"},{letter:"B",image:"q3B.png"},{letter:"C",image:"q3C.png"}], answer: "B" },
        { id: 4, question: "What colour is Mary's coat?",                options: [{letter:"A",text:"yellow"},{letter:"B",text:"blue"},{letter:"C",text:"brown"}], answer: "A" },
        { id: 5, question: "What did the woman repair?",                  options: [{letter:"A",image:"q5A.png"},{letter:"B",image:"q5B.png"},{letter:"C",image:"q5C.png"}], answer: "B" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: ["Listen to Sarah talking to a friend about her holiday photographs.","What place is each person in?","For questions 6–10, write a letter A–H next to each person.","You will hear the conversation twice."],
      scenario: "Sarah talking about her holiday photographs — places",
      example: { number: 0, name: "Sarah's mother", answer: "E" },
      leftLabel: "People", rightLabel: "Places",
      options: [{letter:"A",text:"castle"},{letter:"B",text:"cathedral"},{letter:"C",text:"hotel"},{letter:"D",text:"market"},{letter:"E",text:"mountains"},{letter:"F",text:"museum"},{letter:"G",text:"restaurant"},{letter:"H",text:"sea"}],
      items: [
        { id: 6,  name: "Caroline",       answer: "H" },
        { id: 7,  name: "Jack",            answer: "B" },
        { id: 8,  name: "Sarah",           answer: "D" },
        { id: 9,  name: "Peter",           answer: "G" },
        { id: 10, name: "Sarah's father", answer: "F" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: ["Listen to Sue talking to her friend, Jim, about the new sports centre.","For questions 11–15, tick (✓) A, B or C.","You will hear the conversation twice."],
      example: { number: 0, stem: "The new sports centre is", options: [{letter:"A",text:"cheap."},{letter:"B",text:"big."},{letter:"C",text:"dark."}], answer: "B" },
      items: [
        { id: 11, stem: "Which bus goes to the sports centre?", options: [{letter:"A",text:"15"},{letter:"B",text:"18"},{letter:"C",text:"25"}], answer: "B" },
        { id: 12, stem: "From Monday to Saturday, the sports centre is open from", options: [{letter:"A",text:"6 a.m."},{letter:"B",text:"7 a.m."},{letter:"C",text:"9 a.m."}], answer: "A" },
        { id: 13, stem: "If Sue goes swimming, she must take", options: [{letter:"A",text:"soap."},{letter:"B",text:"a swimming hat."},{letter:"C",text:"a towel."}], answer: "C" },
        { id: 14, stem: "At the sports centre, you can buy", options: [{letter:"A",text:"sandwiches."},{letter:"B",text:"fruit."},{letter:"C",text:"drinks."}], answer: "A" },
        { id: 15, stem: "Jim and Sue are going to go to the sports centre next", options: [{letter:"A",text:"Wednesday."},{letter:"B",text:"Thursday."},{letter:"C",text:"Saturday."}], answer: "B" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: ["You will hear a man making a telephone call.","Listen and complete questions 16–20.","You will hear the conversation twice."],
      noteTitle: "MESSAGE", subtitle: "To: Diana\nFrom: Ian",
      rows: [
        { label: "Name of hotel:",   id: 16,                       answer: "April" },
        { label: "Address:",          id: 17, suffix: "Street",     answer: "Leith" },
        { label: "Meeting starts at:", id: 18,                       answer: "10.20" },
        { label: "Bring:",            id: 19,                       answer: "book" },
        { label: "Visit factory on:", id: 20,                       answer: "Tuesday" }
      ]
    },
    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: ["You will hear some information about a zoo.","Listen and complete questions 21–25.","You will hear the information twice."],
      noteTitle: "Park Zoo", subtitle: "Monday–Saturday, open from: 9 a.m.",
      rows: [
        { label: "to:",                            id: 21,                       answer: "7.30 p.m." },
        { label: "Name of nearest station:",       id: 22, suffix: "Station",    answer: "North" },
        { label: "Elephant House closed on:",      id: 23, suffix: "May",        answer: "3rd" },
        { label: "Shop sells books, postcards and:", id: 24,                       answer: "T-shirts" },
        { label: "Cost of family ticket:",          id: 25, prefix: "£",          answer: "12" }
      ]
    }
  ]
};
