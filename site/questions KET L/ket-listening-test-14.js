// Cambridge KET (Key English Test) — Paper 2 Listening — Test 14
// VERBATIM transcription from the official Cambridge KET Book 4 · Test 2.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-14",
    title: "KET Listening — Test 14",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://audio.mock-stream.com/KET-Listening/test14/",
    files: { 1: "PART1.m4a", 2: "PART2.m4a", 3: "PART3.m4a", 4: "PART4.m4a", 5: "PART5.m4a" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: ["You will hear five short conversations.","You will hear each conversation twice.","There is one question for each conversation.","For questions 1–5, put a tick (✓) under the right answer."],
      imageBase: "https://audio.mock-stream.com/KET-Listening/test14/p1/",
      // Q2 (day names) shown as text — book renders them on plain calendar cards.
      example: { number: 0, question: "How many people were at the meeting?", options: [{letter:"A",image:"q0A.png"},{letter:"B",image:"q0B.png"},{letter:"C",image:"q0C.png"}], answer: "C" },
      items: [
        { id: 1, question: "What are they going to buy for Pam?",         options: [{letter:"A",image:"q1A.png"},{letter:"B",image:"q1B.png"},{letter:"C",image:"q1C.png"}], answer: "B" },
        { id: 2, question: "When is the man's appointment?",                options: [{letter:"A",text:"Wednesday"},{letter:"B",text:"Thursday"},{letter:"C",text:"Friday"}], answer: "B" },
        { id: 3, question: "Which is the aunt's postcard?",                  options: [{letter:"A",image:"q3A.png"},{letter:"B",image:"q3B.png"},{letter:"C",image:"q3C.png"}], answer: "C" },
        { id: 4, question: "What time will the plane to Milan leave?",      options: [{letter:"A",image:"q4A.png"},{letter:"B",image:"q4B.png"},{letter:"C",image:"q4C.png"}], answer: "C" },
        { id: 5, question: "What does Sue's father do?",                     options: [{letter:"A",image:"q5A.png"},{letter:"B",image:"q5B.png"},{letter:"C",image:"q5C.png"}], answer: "A" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: ["Listen to Sarah and Matthew talking about the people they met at a party.","What do they say about each person?","For questions 6–10, write a letter A–H next to each person.","You will hear the conversation twice."],
      scenario: "Sarah and Matthew talking about people at a party — descriptions",
      example: { number: 0, name: "Jenny", answer: "A" },
      leftLabel: "People", rightLabel: "Descriptions",
      options: [{letter:"A",text:"blonde"},{letter:"B",text:"famous"},{letter:"C",text:"friendly"},{letter:"D",text:"interesting"},{letter:"E",text:"quiet"},{letter:"F",text:"short"},{letter:"G",text:"tall"},{letter:"H",text:"young"}],
      items: [
        { id: 6,  name: "John",  answer: "E" },
        { id: 7,  name: "Mary",  answer: "C" },
        { id: 8,  name: "Bob",   answer: "H" },
        { id: 9,  name: "David", answer: "G" },
        { id: 10, name: "Sally", answer: "D" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: ["Listen to Anne asking her friend about going to a shopping centre.","For questions 11–15, tick (✓) A, B or C.","You will hear the conversation twice."],
      example: { number: 0, stem: "The name of the new shopping centre is", options: [{letter:"A",text:"The Rivers."},{letter:"B",text:"The Forest Centre."},{letter:"C",text:"Queen's."}], answer: "C" },
      items: [
        { id: 11, stem: "At the moment, the shopping centre sells", options: [{letter:"A",text:"clothes."},{letter:"B",text:"books."},{letter:"C",text:"food."}], answer: "A" },
        { id: 12, stem: "You can take a coach to the shopping centre on", options: [{letter:"A",text:"Mondays."},{letter:"B",text:"Tuesdays."},{letter:"C",text:"Saturdays."}], answer: "B" },
        { id: 13, stem: "Anne's coach ticket will cost", options: [{letter:"A",text:"£2.50."},{letter:"B",text:"£5.60."},{letter:"C",text:"£10.80."}], answer: "B" },
        { id: 14, stem: "The nearest coach stop to Anne's house is", options: [{letter:"A",text:"in the bus station."},{letter:"B",text:"in the market square."},{letter:"C",text:"outside the museum."}], answer: "C" },
        { id: 15, stem: "The coach journey takes", options: [{letter:"A",text:"10 minutes."},{letter:"B",text:"20 minutes."},{letter:"C",text:"40 minutes."}], answer: "C" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: ["You will hear a telephone conversation about a journey to New York.","Listen and complete questions 16–20.","You will hear the conversation twice."],
      noteTitle: "JOHN LOCKE TRAVEL", subtitle: "Travel to: New York",
      rows: [
        { label: "Name:",                id: 16, prefix: "Mr",       answer: "Brierley" },
        { label: "Will leave on:",        id: 17, suffix: "December", answer: "9th" },
        { label: "Will return on:",       id: 18, prefix: "30th",     answer: "March" },
        { label: "Price:",                id: 19, prefix: "£",        answer: "365" },
        { label: "Travel to airport by:", id: 20,                      answer: "train" }
      ]
    },
    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: ["You will hear Susanna leaving a phone message for her mother.","Listen and complete questions 21–25.","You will hear the information twice."],
      noteTitle: "Message", subtitle: "From: Susanna",
      rows: [
        { label: "Buy:",                  id: 21, prefix: "a white", answer: "T-shirt" },
        { label: "Name of shop:",          id: 22,                    answer: "Davey's" },
        { label: "In High Street, next to:", id: 23,                    answer: "the cinema" },
        { label: "Size:",                  id: 24,                    answer: "large" },
        { label: "Price:",                 id: 25, prefix: "£",        answer: "8.99" }
      ]
    }
  ]
};
