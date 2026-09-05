// Cambridge KET (Key English Test) — Paper 2 Listening — Test 9
// VERBATIM transcription from the official Cambridge KET Book 3 · Test 1.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-9",
    title: "KET Listening — Test 9",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://audio.mock-stream.com/KET-Listening/test9/",
    files: { 1: "PART1.m4a", 2: "PART2.m4a", 3: "PART3.m4a", 4: "PART4.m4a", 5: "PART5.m4a" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: ["You will hear five short conversations.","You will hear each conversation twice.","There is one question for each conversation.","For questions 1–5, put a tick (✓) under the right answer."],
      imageBase: "https://audio.mock-stream.com/KET-Listening/test9/p1/",
      // Q1 (months), Q2 (film times) and Q4 (motorway numbers) shown as text — book renders them as plain text cards.
      example: { number: 0, question: "How many people were at the meeting?", options: [{letter:"A",image:"q0A.png"},{letter:"B",image:"q0B.png"},{letter:"C",image:"q0C.png"}], answer: "C" },
      items: [
        { id: 1, question: "When did Gary start his new job?",        options: [{letter:"A",text:"MARCH"},{letter:"B",text:"APRIL"},{letter:"C",text:"MAY"}], answer: "C" },
        { id: 2, question: "What time does the film start?",           options: [{letter:"A",text:"4.30 and 7.00"},{letter:"B",text:"4.30 and 7.30"},{letter:"C",text:"4.00 and 7.30"}], answer: "A" },
        { id: 3, question: "What was the weather like on Saturday?", options: [{letter:"A",image:"q3A.png"},{letter:"B",image:"q3B.png"},{letter:"C",image:"q3C.png"}], answer: "B" },
        { id: 4, question: "Which motorway will they take?",            options: [{letter:"A",text:"M1"},{letter:"B",text:"M6"},{letter:"C",text:"M62"}], answer: "B" },
        { id: 5, question: "Which book does Loma want?",                 options: [{letter:"A",image:"q5full.png",composite:true},{letter:"B",image:"q5full.png",composite:true},{letter:"C",image:"q5full.png",composite:true}], answer: "A" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: ["Listen to Sue talking to a friend about her new clothes.","Why did Sue decide to buy each thing?","For questions 6–10, write a letter A–H next to the clothes.","You will hear the conversation twice."],
      scenario: "Sue talking about her new clothes — why she bought each",
      example: { number: 0, name: "jeans", answer: "F" },
      leftLabel: "CLOTHES SUE BOUGHT", rightLabel: "WHY?",
      options: [{letter:"A",text:"big"},{letter:"B",text:"cheap"},{letter:"C",text:"expensive"},{letter:"D",text:"light"},{letter:"E",text:"long"},{letter:"F",text:"purple"},{letter:"G",text:"short"},{letter:"H",text:"soft"}],
      items: [
        { id: 6,  name: "jacket",  answer: "A" },
        { id: 7,  name: "dress",   answer: "B" },
        { id: 8,  name: "sweater", answer: "H" },
        { id: 9,  name: "coat",    answer: "D" },
        { id: 10, name: "t-shirt", answer: "E" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: ["Listen to Jan talking to Steve about getting a student travel card.","For questions 11–15, tick (✓) A, B or C.","You will hear the conversation twice."],
      example: { number: 0, stem: "How is Steve going to go to London?", options: [{letter:"A",text:"by bus"},{letter:"B",text:"by car"},{letter:"C",text:"by train"}], answer: "C" },
      items: [
        { id: 11, stem: "How much is a travel card?", options: [{letter:"A",text:"£6"},{letter:"B",text:"£16"},{letter:"C",text:"£60"}], answer: "B" },
        { id: 12, stem: "Jan will need", options: [{letter:"A",text:"one photo."},{letter:"B",text:"two photos."},{letter:"C",text:"four photos."}], answer: "B" },
        { id: 13, stem: "Photos are less expensive", options: [{letter:"A",text:"in the photographer's shop."},{letter:"B",text:"in the library."},{letter:"C",text:"in the post office."}], answer: "A" },
        { id: 14, stem: "For the travel card, Jan must take", options: [{letter:"A",text:"a letter."},{letter:"B",text:"her passport."},{letter:"C",text:"her driving licence."}], answer: "A" },
        { id: 15, stem: "Jan can get a travel card from", options: [{letter:"A",text:"her college."},{letter:"B",text:"the travel agent's."},{letter:"C",text:"the tourist office."}], answer: "C" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: ["You will hear a man speaking on the telephone.","Listen and complete questions 16–20.","You will hear the conversation twice."],
      noteTitle: "TELEPHONE MESSAGE", subtitle: "To: Mr Brown",
      rows: [
        { label: "From:",                              id: 16, prefix: "David",  answer: "Graham" },
        { label: "Not in school because he has:",      id: 17, prefix: "a bad",   answer: "back" },
        { label: "Students should read pages:",        id: 18,                    answer: "58 to 73" },
        { label: "David will return to school on:",    id: 19, suffix: "afternoon", answer: "Tuesday" },
        { label: "at:",                                id: 20, suffix: "p.m.",     answer: "2.15" }
      ]
    },
    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: ["You will hear some information about a pop concert.","Listen and complete questions 21–25.","You will hear the information twice."],
      noteTitle: "POP CONCERT", subtitle: "Name of group: Red River\nIn London:  From: October 28th",
      rows: [
        { label: "To:",              id: 21, prefix: "November",   answer: "2nd" },
        { label: "Price of ticket:", id: 22, prefix: "£",           answer: "37" },
        { label: "Telephone no:",    id: 23,                        answer: "283 0065" },
        { label: "Place:",           id: 24, suffix: "Bank Hall",   answer: "South" },
        { label: "In:",              id: 25, suffix: "Street",      answer: "Trinity" }
      ]
    }
  ]
};
