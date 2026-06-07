// Cambridge KET (Key English Test) — Paper 2 Listening — Test 17
// VERBATIM transcription from the official Cambridge KET Book 5 · Test 1.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-17",
    title: "KET Listening — Test 17",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://storage.googleapis.com/mockstream-listening-audio/KET-Listening/test17/",
    files: { 1: "PART1.mp3", 2: "PART2.mp3", 3: "PART3.mp3", 4: "PART4.mp3", 5: "PART5.mp3" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: ["You will hear five short conversations.","You will hear each conversation twice.","There is one question for each conversation.","For questions 1–5, put a tick (✓) under the right answer."],
      imageBase: "https://storage.googleapis.com/mockstream-listening-audio/KET-Listening/test17/p1/",
      example: { number: 0, question: "How many people were at the meeting?", options: [{letter:"A",image:"q0A.png"},{letter:"B",image:"q0B.png"},{letter:"C",image:"q0C.png"}], answer: "C" },
      items: [
        { id: 1, question: "How will Jill go to the football match?",  options: [{letter:"A",image:"q1A.png"},{letter:"B",image:"q1B.png"},{letter:"C",image:"q1C.png"}], answer: "A" },
        { id: 2, question: "Who's going to visit the woman?",            options: [{letter:"A",image:"q2A.png"},{letter:"B",image:"q2B.png"},{letter:"C",image:"q2C.png"}], answer: "C" },
        { id: 3, question: "What will Ruby do tonight?",                  options: [{letter:"A",image:"q3A.png"},{letter:"B",image:"q3B.png"},{letter:"C",image:"q3C.png"}], answer: "C" },
        { id: 4, question: "How much did the woman's desk cost?",          options: [{letter:"A",image:"q4A.png"},{letter:"B",image:"q4B.png"},{letter:"C",image:"q4C.png"}], answer: "A" },
        { id: 5, question: "Where is the man's watch?",                    options: [{letter:"A",image:"q5A.png"},{letter:"B",image:"q5B.png"},{letter:"C",image:"q5C.png"}], answer: "B" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: ["Listen to Lena talking to a friend about some restaurants.","What is the problem with each one?","For questions 6–10, write a letter A–H next to each restaurant.","You will hear the conversation twice."],
      scenario: "Lena talking about some restaurants — problems",
      example: { number: 0, name: "Rose Garden", answer: "B" },
      leftLabel: "Restaurants", rightLabel: "Problems",
      options: [{letter:"A",text:"closed"},{letter:"B",text:"cold"},{letter:"C",text:"dark"},{letter:"D",text:"expensive"},{letter:"E",text:"full"},{letter:"F",text:"noisy"},{letter:"G",text:"small"},{letter:"H",text:"unfriendly"}],
      items: [
        { id: 6,  name: "Carla's Café",  answer: "G" },
        { id: 7,  name: "Pizza Place",    answer: "C" },
        { id: 8,  name: "Curry House",    answer: "E" },
        { id: 9,  name: "Captain Crab",   answer: "F" },
        { id: 10, name: "Carlton Hotel",  answer: "D" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: ["Listen to Helen talking to her friend, Sam, about being in a rock band.","For questions 11–15, tick (✓) A, B or C.","You will hear the conversation twice."],
      example: { number: 0, stem: "In Nick's band, Helen", options: [{letter:"A",text:"plays the guitar."},{letter:"B",text:"sings."},{letter:"C",text:"plays the drums."}], answer: "B" },
      items: [
        { id: 11, stem: "Sam agrees to play the guitar on", options: [{letter:"A",text:"Wednesday."},{letter:"B",text:"Thursday."},{letter:"C",text:"Friday."}], answer: "B" },
        { id: 12, stem: "Where does Nick's band practise?", options: [{letter:"A",text:"in a garage"},{letter:"B",text:"at Helen's flat"},{letter:"C",text:"in Nick's bedroom"}], answer: "A" },
        { id: 13, stem: "Sam should bring", options: [{letter:"A",text:"sandwiches."},{letter:"B",text:"CDs."},{letter:"C",text:"a sweater."}], answer: "C" },
        { id: 14, stem: "The band will next play at", options: [{letter:"A",text:"a party."},{letter:"B",text:"a club."},{letter:"C",text:"a college."}], answer: "C" },
        { id: 15, stem: "How much does Helen earn, per night, in the band?", options: [{letter:"A",text:"£10"},{letter:"B",text:"£25"},{letter:"C",text:"£110"}], answer: "B" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: ["You will hear a man talking on the telephone about a party.","Listen and complete questions 16–20.","You will hear the conversation twice."],
      noteTitle: "Party for old school friends", subtitle: "For pupils from: Romford School",
      rows: [
        { label: "Date of party:",          id: 16, suffix: "September",  answer: "7" },
        { label: "Day of party:",            id: 17,                       answer: "Saturday" },
        { label: "Place:",                   prefilled: "Margaret's house" },
        { label: "Margaret's new surname:",   id: 18,                       answer: "JAGGARD" },
        { label: "Margaret's address:",       id: 19, prefix: "11", suffix: "Road", answer: "Park" },
        { label: "Bring:",                    id: 20,                       answer: "photos" }
      ]
    },
    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: ["You will hear some information about a place called Sea World.","Listen and complete questions 21–25.","You will hear the information twice."],
      noteTitle: "Sea World", subtitle: "Open: Tuesday–Sunday",
      rows: [
        { label: "Closed during month of:",         id: 21,                              answer: "March" },
        { label: "Watch a film about the sea in:",   id: 22, prefix: "The", suffix: "Centre", answer: "Visitors" },
        { label: "Dolphin show starts at:",          id: 23, suffix: "p.m.",              answer: "2.15" },
        { label: "Shop sells:",                       id: 24, suffix: "and books",         answer: "toys" },
        { label: "Child's ticket costs:",             id: 25, prefix: "£",                  answer: "4.25" }
      ]
    }
  ]
};
