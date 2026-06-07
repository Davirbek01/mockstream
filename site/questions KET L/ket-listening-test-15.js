// Cambridge KET (Key English Test) — Paper 2 Listening — Test 15
// VERBATIM transcription from the official Cambridge KET Book 4 · Test 3.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-15",
    title: "KET Listening — Test 15",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://storage.googleapis.com/mockstream-listening-audio/KET-Listening/test15/",
    files: { 1: "PART1.mp3", 2: "PART2.mp3", 3: "PART3.mp3", 4: "PART4.mp3", 5: "PART5.mp3" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: ["You will hear five short conversations.","You will hear each conversation twice.","There is one question for each conversation.","For questions 1–5, put a tick (✓) under the right answer."],
      imageBase: "https://storage.googleapis.com/mockstream-listening-audio/KET-Listening/test15/p1/",
      // Q4 (colour names) shown as text — book renders them as plain text cards.
      example: { number: 0, question: "How many people were at the meeting?", options: [{letter:"A",image:"q0A.png"},{letter:"B",image:"q0B.png"},{letter:"C",image:"q0C.png"}], answer: "C" },
      items: [
        { id: 1, question: "What's George doing now?",            options: [{letter:"A",image:"q1A.png"},{letter:"B",image:"q1B.png"},{letter:"C",image:"q1C.png"}], answer: "C" },
        { id: 2, question: "Which room will the woman stay in?",  options: [{letter:"A",image:"q2A.png"},{letter:"B",image:"q2B.png"},{letter:"C",image:"q2C.png"}], answer: "B" },
        { id: 3, question: "What will the boy wear in the race?", options: [{letter:"A",image:"q3A.png"},{letter:"B",image:"q3B.png"},{letter:"C",image:"q3C.png"}], answer: "C" },
        { id: 4, question: "What colour will the room be?",        options: [{letter:"A",text:"YELLOW"},{letter:"B",text:"GREEN"},{letter:"C",text:"ORANGE"}], answer: "A" },
        { id: 5, question: "Where did Minnie and Richard first meet?", options: [{letter:"A",image:"q5A.png"},{letter:"B",image:"q5B.png"},{letter:"C",image:"q5C.png"}], answer: "C" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: ["Listen to Jack and Mark talking about a new sports centre.","Which sport can they do each day at the centre?","For questions 6–10, write a letter A–H next to each day.","You will hear the conversation twice."],
      scenario: "Jack and Mark talking about a new sports centre — sports per day",
      example: { number: 0, name: "Monday", answer: "D" },
      leftLabel: "Days", rightLabel: "Sports",
      options: [{letter:"A",text:"badminton"},{letter:"B",text:"basketball"},{letter:"C",text:"football"},{letter:"D",text:"golf"},{letter:"E",text:"hockey"},{letter:"F",text:"swimming"},{letter:"G",text:"tennis"},{letter:"H",text:"volleyball"}],
      items: [
        { id: 6,  name: "Tuesday",   answer: "B" },
        { id: 7,  name: "Wednesday", answer: "F" },
        { id: 8,  name: "Thursday",  answer: "C" },
        { id: 9,  name: "Friday",    answer: "H" },
        { id: 10, name: "Saturday",  answer: "G" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: ["Listen to Diane talking to a friend about a trip to London.","For questions 11–15, tick (✓) A, B or C.","You will hear the conversation twice."],
      example: { number: 0, stem: "Diane went to London yesterday", options: [{letter:"A",text:"morning."},{letter:"B",text:"afternoon."},{letter:"C",text:"evening."}], answer: "C" },
      items: [
        { id: 11, stem: "Diane went to London by", options: [{letter:"A",text:"car."},{letter:"B",text:"bus."},{letter:"C",text:"underground."}], answer: "B" },
        { id: 12, stem: "Diane and her friends ate", options: [{letter:"A",text:"Mexican food."},{letter:"B",text:"Chinese food."},{letter:"C",text:"Spanish food."}], answer: "B" },
        { id: 13, stem: "Diane says the restaurant was", options: [{letter:"A",text:"full."},{letter:"B",text:"expensive."},{letter:"C",text:"quiet."}], answer: "A" },
        { id: 14, stem: "After the meal, Diane and her friends", options: [{letter:"A",text:"sat and talked."},{letter:"B",text:"saw a film."},{letter:"C",text:"walked by the water."}], answer: "C" },
        { id: 15, stem: "During Diane's trip to London,", options: [{letter:"A",text:"it rained."},{letter:"B",text:"it snowed."},{letter:"C",text:"it was windy."}], answer: "C" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: ["You will hear a woman talking to a shop assistant about buying a video film for her daughter.","Listen and complete questions 16–20.","You will hear the conversation twice."],
      noteTitle: "VIDEO", subtitle: "Actor in film: Brad Smith",
      rows: [
        { label: "Name of film:",  id: 16, prefix: "Blue",                       answer: "Cafe" },
        { label: "For people:",     id: 17, suffix: "years old or more",         answer: "12" },
        { label: "Cost:",           id: 18, prefix: "£",                          answer: "5.99" },
        { label: "Video shop in:",  id: 19, suffix: "Street",                    answer: "Shirley" },
        { label: "Opposite:",       id: 20,                                       answer: "the bank" }
      ]
    },
    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: ["You will hear some information about a visitor to a school.","Listen and complete questions 21–25.","You will hear the information twice."],
      noteTitle: "BLACKBURN SCHOOL", subtitle: "Visiting Speaker\nDay: Thursday",
      rows: [
        { label: "Name:",                  id: 21, prefix: "Dr Robert",     answer: "Teale" },
        { label: "Subject:",                id: 22, prefix: "Space",          answer: "travel" },
        { label: "Place:",                  id: 23, prefix: "School",         answer: "hall" },
        { label: "Time of talk:",            id: 24, suffix: "p.m.",           answer: "2.30" },
        { label: "Tickets for parents cost:", id: 25, prefix: "£",              answer: "3.85" }
      ]
    }
  ]
};
