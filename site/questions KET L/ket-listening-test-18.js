// Cambridge KET (Key English Test) — Paper 2 Listening — Test 18
// VERBATIM transcription from the official Cambridge KET Book 5 · Test 2.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-18",
    title: "KET Listening — Test 18",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://audio.mock-stream.com/KET-Listening/test18/",
    files: { 1: "PART1.m4a", 2: "PART2.m4a", 3: "PART3.m4a", 4: "PART4.m4a", 5: "PART5.m4a" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: ["You will hear five short conversations.","You will hear each conversation twice.","There is one question for each conversation.","For questions 1–5, put a tick (✓) under the right answer."],
      imageBase: "https://audio.mock-stream.com/KET-Listening/test18/p1/",
      // Q2 (calendar dates) and Q4 (ticket prices) shown as text — book renders them as plain text cards.
      example: { number: 0, question: "How many people were at the meeting?", options: [{letter:"A",image:"q0A.png"},{letter:"B",image:"q0B.png"},{letter:"C",image:"q0C.png"}], answer: "C" },
      items: [
        { id: 1, question: "Where will the man and woman meet?",       options: [{letter:"A",image:"q1A.png"},{letter:"B",image:"q1B.png"},{letter:"C",image:"q1C.png"}], answer: "A" },
        { id: 2, question: "What's the date of Emma's birthday party?", options: [{letter:"A",text:"21st June"},{letter:"B",text:"20th July"},{letter:"C",text:"21st July"}], answer: "C" },
        { id: 3, question: "Where is Norah's watch?",                    options: [{letter:"A",image:"q3A.png"},{letter:"B",image:"q3B.png"},{letter:"C",image:"q3C.png"}], answer: "A" },
        { id: 4, question: "How much is a ticket for tonight's match?",  options: [{letter:"A",text:"£3.50"},{letter:"B",text:"£6"},{letter:"C",text:"£10"}], answer: "A" },
        { id: 5, question: "Which is the boy's brother?",                 options: [{letter:"A",image:"q5A.png"},{letter:"B",image:"q5B.png"},{letter:"C",image:"q5C.png"}], answer: "B" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: ["Listen to Amy telling her father about her shopping trip.","What did she and her friends buy?","For questions 6–10, write a letter A–H next to each person.","You will hear the conversation twice."],
      scenario: "Amy telling her father about her shopping trip — things they bought",
      example: { number: 0, name: "Amy", answer: "H" },
      leftLabel: "People", rightLabel: "Things they bought",
      options: [{letter:"A",text:"CD"},{letter:"B",text:"magazine"},{letter:"C",text:"mobile phone"},{letter:"D",text:"picture"},{letter:"E",text:"shoes"},{letter:"F",text:"suitcase"},{letter:"G",text:"sweater"},{letter:"H",text:"video"}],
      items: [
        { id: 6,  name: "Alison", answer: "F" },
        { id: 7,  name: "Helen",  answer: "B" },
        { id: 8,  name: "Lucy",   answer: "G" },
        { id: 9,  name: "Kerry",  answer: "D" },
        { id: 10, name: "Jo",     answer: "A" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: ["Listen to Jamie talking to his mother about a flat.","For questions 11–15, tick (✓) A, B or C.","You will hear the conversation twice."],
      example: { number: 0, stem: "At the moment, Jamie is living", options: [{letter:"A",text:"at home."},{letter:"B",text:"in the university."},{letter:"C",text:"in a flat."}], answer: "B" },
      items: [
        { id: 11, stem: "Jamie will go to university from the new flat", options: [{letter:"A",text:"by bicycle."},{letter:"B",text:"by bus."},{letter:"C",text:"on foot."}], answer: "C" },
        { id: 12, stem: "The new flat is", options: [{letter:"A",text:"over a shop."},{letter:"B",text:"on a noisy road."},{letter:"C",text:"next to a café."}], answer: "A" },
        { id: 13, stem: "How much will Jamie pay a week for the flat?", options: [{letter:"A",text:"£200"},{letter:"B",text:"£40"},{letter:"C",text:"£14"}], answer: "B" },
        { id: 14, stem: "What doesn't the flat have?", options: [{letter:"A",text:"a cooker"},{letter:"B",text:"a fridge"},{letter:"C",text:"a washing machine"}], answer: "C" },
        { id: 15, stem: "Jamie agrees to move into the new flat on", options: [{letter:"A",text:"Saturday."},{letter:"B",text:"Sunday."},{letter:"C",text:"Monday."}], answer: "B" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: ["You will hear a woman asking about tickets for the theatre.","Listen and complete questions 16–20.","You will hear the conversation twice."],
      noteTitle: "Theatre tickets", subtitle: "Name of theatre: Queen's",
      rows: [
        { label: "There are tickets for show on:",   id: 16, suffix: "evening", answer: "Wednesday" },
        { label: "Price for one ticket:",             id: 17, prefix: "£",       answer: "8.50" },
        { label: "Get tickets from box office in:",   id: 18, suffix: "Road",    answer: "FERRET" },
        { label: "Show starts at:",                   id: 19, suffix: "p.m.",    answer: "7.45" },
        { label: "Bus number:",                       id: 20,                    answer: "136" }
      ]
    },
    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: ["You will hear some information about a competition to win a holiday.","Listen and complete questions 21–25.","You will hear the information twice."],
      noteTitle: "Holiday competition", subtitle: "Win a holiday in: Scotland",
      rows: [
        { label: "Number of nights:",      id: 21,                          answer: "3" },
        { label: "Name of hotel:",         id: 22, suffix: "Hotel",         answer: "FALKIRK" },
        { label: "At hotel, you can play:", id: 23,                          answer: "golf" },
        { label: "Call The Travel Programme", prefilled: "" },
        { label: "Phone before midnight on:", id: 24,                          answer: "Thursday" },
        { label: "Phone number:",            id: 25,                          answer: "0208 66873" }
      ]
    }
  ]
};
