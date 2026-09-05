// Cambridge KET (Key English Test) — Paper 2 Listening — Test 12
// VERBATIM transcription from the official Cambridge KET Book 3 · Test 4.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-12",
    title: "KET Listening — Test 12",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://audio.mock-stream.com/KET-Listening/test12/",
    files: { 1: "PART1.m4a", 2: "PART2.m4a", 3: "PART3.m4a", 4: "PART4.m4a", 5: "PART5.m4a" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: ["You will hear five short conversations.","You will hear each conversation twice.","There is one question for each conversation.","For questions 1–5, put a tick (✓) under the right answer."],
      imageBase: "https://audio.mock-stream.com/KET-Listening/test12/p1/",
      // Q4 (school subjects) shown as text — book renders them as plain text cards.
      // Q2 uses one composite picture showing beach options A/B/C in a single image.
      example: { number: 0, question: "How many people were at the meeting?", options: [{letter:"A",image:"q0A.png"},{letter:"B",image:"q0B.png"},{letter:"C",image:"q0C.png"}], answer: "C" },
      items: [
        { id: 1, question: "Which is Tom's mother?",        options: [{letter:"A",image:"q1A.png"},{letter:"B",image:"q1B.png"},{letter:"C",image:"q1C.png"}], answer: "A" },
        { id: 2, question: "Where will the beach party be?", options: [{letter:"A",image:"q2full.png",composite:true},{letter:"B",image:"q2full.png",composite:true},{letter:"C",image:"q2full.png",composite:true}], answer: "C" },
        { id: 3, question: "What will Fiona wear to the dance?", options: [{letter:"A",image:"q3A.png"},{letter:"B",image:"q3B.png"},{letter:"C",image:"q3C.png"}], answer: "B" },
        { id: 4, question: "What homework is the girl doing now?", options: [{letter:"A",text:"Science"},{letter:"B",text:"Maths"},{letter:"C",text:"English"}], answer: "A" },
        { id: 5, question: "What's David going to buy?",                options: [{letter:"A",image:"q5A.png"},{letter:"B",image:"q5B.png"},{letter:"C",image:"q5C.png"}], answer: "A" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: ["Listen to Sonya talking to Martin about her family.","How old are her brothers and sisters?","For questions 6–10, write a letter A–H next to each person.","You will hear the conversation twice."],
      scenario: "Sonya talking to Martin about her family — ages",
      example: { number: 0, name: "Sonya", answer: "H" },
      leftLabel: "PEOPLE", rightLabel: "AGES",
      options: [{letter:"A",text:"two"},{letter:"B",text:"five"},{letter:"C",text:"seven"},{letter:"D",text:"ten"},{letter:"E",text:"thirteen"},{letter:"F",text:"fifteen"},{letter:"G",text:"eighteen"},{letter:"H",text:"twenty"}],
      items: [
        { id: 6,  name: "Sally",    answer: "F" },
        { id: 7,  name: "Vivienne", answer: "E" },
        { id: 8,  name: "Roger",    answer: "C" },
        { id: 9,  name: "Frank",    answer: "B" },
        { id: 10, name: "Deborah",  answer: "G" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: ["Listen to a woman asking a travel agent for some information about a park in the mountains.","For questions 11–15, tick (✓) A, B or C.","You will hear the conversation twice."],
      example: { number: 0, stem: "The woman will visit the park for", options: [{letter:"A",text:"one week."},{letter:"B",text:"two weeks."},{letter:"C",text:"four weeks."}], answer: "A" },
      items: [
        { id: 11, stem: "In the park, there is", options: [{letter:"A",text:"a café."},{letter:"B",text:"a hotel."},{letter:"C",text:"a guest-house."}], answer: "A" },
        { id: 12, stem: "The village has a", options: [{letter:"A",text:"swimming pool."},{letter:"B",text:"cinema."},{letter:"C",text:"food shop."}], answer: "C" },
        { id: 13, stem: "You can only go through the park", options: [{letter:"A",text:"by car."},{letter:"B",text:"by bus."},{letter:"C",text:"on foot."}], answer: "A" },
        { id: 14, stem: "On weekdays, a visit to the park costs", options: [{letter:"A",text:"$12."},{letter:"B",text:"$13."},{letter:"C",text:"$16."}], answer: "B" },
        { id: 15, stem: "In the park, the woman will see", options: [{letter:"A",text:"animals."},{letter:"B",text:"flowers."},{letter:"C",text:"snow."}], answer: "B" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: ["You will hear Mats talking to his friend, Sarah, about a trip to Manchester in England.","Listen and complete questions 16–20.","You will hear the conversation twice."],
      noteTitle: "TRIP TO MANCHESTER", subtitle: "Go to Manchester in: October",
      rows: [
        { label: "Temperature in autumn:",         id: 16, suffix: "degrees", answer: "14" },
        { label: "Will need to wear:",               id: 17,                    answer: "raincoat" },
        { label: "Name of train station in London:", id: 18,                    answer: "Euston" },
        { label: "Cost of train:",                   id: 19, prefix: "£",       answer: "30" },
        { label: "Take Sarah some:",                  id: 20,                    answer: "cheese" }
      ]
    },
    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: ["You will hear some information about a museum.","Listen and complete questions 21–25.","You will hear the information twice."],
      noteTitle: "THE REDFERN MUSEUM", subtitle: "Open: Monday to Thursday\nYou can see:",
      rows: [
        { label: "Downstairs:",        id: 21, prefix: "old",     answer: "clothes" },
        { label: "Upstairs: pictures by:", id: 22, suffix: "artists", answer: "Spanish" },
        { label: "Concerts during month of:", id: 23,              answer: "December" },
        { label: "Student ticket:",     id: 24, prefix: "£",      answer: "3.80" },
        { label: "Telephone number:",  id: 25,                    answer: "557642" }
      ]
    }
  ]
};
