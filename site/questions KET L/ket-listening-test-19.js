// Cambridge KET (Key English Test) — Paper 2 Listening — Test 19
// VERBATIM transcription from the official Cambridge KET Book 5 · Test 3.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-19",
    title: "KET Listening — Test 19",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://audio.mock-stream.com/KET-Listening/test19/",
    files: { 1: "PART1.m4a", 2: "PART2.m4a", 3: "PART3.m4a", 4: "PART4.m4a", 5: "PART5.m4a" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: ["You will hear five short conversations.","You will hear each conversation twice.","There is one question for each conversation.","For questions 1–5, put a tick (✓) under the right answer."],
      imageBase: "https://audio.mock-stream.com/KET-Listening/test19/p1/",
      // Q1 uses one composite picture showing three boys with A/B/C arrows.
      // Q2 (day names) shown as text — book renders them as plain text cards.
      example: { number: 0, question: "How many people were at the meeting?", options: [{letter:"A",image:"q0A.png"},{letter:"B",image:"q0B.png"},{letter:"C",image:"q0C.png"}], answer: "C" },
      items: [
        { id: 1, question: "Which boy is Peter?",                 options: [{letter:"A",image:"q1full.png",composite:true},{letter:"B",image:"q1full.png",composite:true},{letter:"C",image:"q1full.png",composite:true}], answer: "B" },
        { id: 2, question: "Which day will they go to the cinema?", options: [{letter:"A",text:"Tuesday"},{letter:"B",text:"Wednesday"},{letter:"C",text:"Thursday"}], answer: "A" },
        { id: 3, question: "What are they going to do on Saturday?", options: [{letter:"A",image:"q3A.png"},{letter:"B",image:"q3B.png"},{letter:"C",image:"q3C.png"}], answer: "A" },
        { id: 4, question: "Where does Paul live?",                 options: [{letter:"A",image:"q4A.png"},{letter:"B",image:"q4B.png"},{letter:"C",image:"q4C.png"}], answer: "C" },
        { id: 5, question: "Where are they going to put the computer?", options: [{letter:"A",image:"q5A.png"},{letter:"B",image:"q5B.png"},{letter:"C",image:"q5C.png"}], answer: "A" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: ["Listen to Janet talking to her friend about a party.","What did each person wear?","For questions 6–10, write a letter A–H next to each person.","You will hear the conversation twice."],
      scenario: "Janet talking about a party — clothes each person wore",
      example: { number: 0, name: "Janet", answer: "E" },
      leftLabel: "People", rightLabel: "Clothes",
      options: [{letter:"A",text:"blouse"},{letter:"B",text:"dress"},{letter:"C",text:"jacket"},{letter:"D",text:"jeans"},{letter:"E",text:"skirt"},{letter:"F",text:"suit"},{letter:"G",text:"sweater"},{letter:"H",text:"T-shirt"}],
      items: [
        { id: 6,  name: "Emma",     answer: "G" },
        { id: 7,  name: "Mike",     answer: "D" },
        { id: 8,  name: "Michelle", answer: "B" },
        { id: 9,  name: "Rachel",   answer: "A" },
        { id: 10, name: "Jason",    answer: "H" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: ["Listen to Zak talking to Maria about his sports bag.","For questions 11–15, tick (✓) A, B or C.","You will hear the conversation twice."],
      example: { number: 0, stem: "What colour is Zak's bag?", options: [{letter:"A",text:"blue"},{letter:"B",text:"white"},{letter:"C",text:"black"}], answer: "A" },
      items: [
        { id: 11, stem: "The bag is", options: [{letter:"A",text:"small."},{letter:"B",text:"old."},{letter:"C",text:"dirty."}], answer: "C" },
        { id: 12, stem: "Where is the bag?", options: [{letter:"A",text:"in the classroom"},{letter:"B",text:"on the sports field"},{letter:"C",text:"at the hospital"}], answer: "A" },
        { id: 13, stem: "What is inside the bag?", options: [{letter:"A",text:"money"},{letter:"B",text:"a watch"},{letter:"C",text:"clothes"}], answer: "C" },
        { id: 14, stem: "Maria should take the bag to Zak", options: [{letter:"A",text:"this afternoon."},{letter:"B",text:"this evening."},{letter:"C",text:"tomorrow morning."}], answer: "B" },
        { id: 15, stem: "Zak hurt himself when he was", options: [{letter:"A",text:"playing football."},{letter:"B",text:"running."},{letter:"C",text:"changing his clothes."}], answer: "B" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: ["You will hear a man asking for some information about a swimming pool.","Listen and complete questions 16–20.","You will hear the conversation twice."],
      noteTitle: "Swimming pool", subtitle: "Closing day: Monday",
      rows: [
        { label: "The 'early morning swim' starts at:", id: 16, suffix: "a.m.", answer: "6.00" },
        { label: "9.30–12.30, pool is used by:",         id: 17,                  answer: "the school" },
        { label: "Each lesson costs:",                    id: 18, prefix: "£",     answer: "7.50" },
        { label: "Date of next course:",                  id: 19,                  answer: "9th March" },
        { label: "Teacher's name:",                       id: 20, prefix: "Roy",   answer: "FOWLER" }
      ]
    },
    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: ["You will hear some information about free cinema tickets.","Listen and complete questions 21–25.","You will hear the information twice."],
      noteTitle: "Free cinema tickets", subtitle: "Usual price: £5",
      rows: [
        { label: "Name of film:",                  id: 21, prefix: "The Elephant",     answer: "Doctor" },
        { label: "Send postcard to:",               prefilled: "Radio South-West" },
        { label: "Address:",                        id: 22, prefix: "27", suffix: "Road, Bristol", answer: "ARGYLL" },
        { label: "Before:",                         id: 23, suffix: "July",             answer: "30th" },
        { label: "Number of tickets per family:",   id: 24,                              answer: "4" },
        { label: "Everybody will get a:",            id: 25,                              answer: "book" }
      ]
    }
  ]
};
