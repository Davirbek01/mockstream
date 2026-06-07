// Cambridge KET (Key English Test) — Paper 2 Listening — Test 7
// VERBATIM transcription from the official Cambridge KET Book 2 · Test 3.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-7",
    title: "KET Listening — Test 7",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://storage.googleapis.com/mockstream-listening-audio/KET-Listening/test7/",
    files: { 1: "PART1.mp3", 2: "PART2.mp3", 3: "PART3.mp3", 4: "PART4.mp3", 5: "PART5.mp3" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: ["You will hear five short conversations.","You will hear each conversation twice.","There is one question for each conversation.","For questions 1–5, put a tick (✓) under the right answer."],
      imageBase: "https://storage.googleapis.com/mockstream-listening-audio/KET-Listening/test7/p1/",
      // Q0 (day names) and Q2 (petrol amounts) shown as text — book renders them plain.
      example: { number: 0, question: "When's the school trip?", options: [{letter:"A",text:"Tuesday"},{letter:"B",text:"Wednesday"},{letter:"C",text:"Thursday"}], answer: "C" },
      items: [
        { id: 1, question: "Where's the sports centre?", options: [{letter:"A",image:"q1full.png",composite:true},{letter:"B",image:"q1full.png",composite:true},{letter:"C",image:"q1full.png",composite:true}], answer: "A" },
        { id: 2, question: "How much petrol does the woman want?", options: [{letter:"A",text:"13 litres"},{letter:"B",text:"30 litres"},{letter:"C",text:"33 litres"}], answer: "B" },
        { id: 3, question: "Which table do they buy?",                       options: [{letter:"A",image:"q3A.png"},{letter:"B",image:"q3B.png"},{letter:"C",image:"q3C.png"}], answer: "C" },
        { id: 4, question: "What time does the class start?",                 options: [{letter:"A",image:"q4A.png"},{letter:"B",image:"q4B.png"},{letter:"C",image:"q4C.png"}], answer: "A" },
        { id: 5, question: "What was the weather like on Emma's holiday?", options: [{letter:"A",image:"q5A.png"},{letter:"B",image:"q5B.png"},{letter:"C",image:"q5C.png"}], answer: "C" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: ["Listen to Jane talking to a friend about some clothes that she has bought for her holiday.","What colours are her clothes?","For questions 6–10, write a letter A–H next to each of her clothes.","You will hear the conversation twice."],
      scenario: "Jane talking about clothes for her holiday — colours",
      example: { number: 0, name: "shirt", answer: "H" },
      leftLabel: "CLOTHES", rightLabel: "COLOURS",
      options: [{letter:"A",text:"black"},{letter:"B",text:"blue"},{letter:"C",text:"brown"},{letter:"D",text:"green"},{letter:"E",text:"grey"},{letter:"F",text:"orange"},{letter:"G",text:"red"},{letter:"H",text:"white"}],
      items: [
        { id: 6,  name: "dress",   answer: "D" },
        { id: 7,  name: "jacket",  answer: "C" },
        { id: 8,  name: "sweater", answer: "F" },
        { id: 9,  name: "coat",    answer: "A" },
        { id: 10, name: "shoes",   answer: "B" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: ["Listen to Mrs Lee talking to her secretary about her business trip.","For questions 11–15, tick (✓) A, B or C.","You will hear the conversation twice."],
      example: { number: 0, stem: "Mrs Lee will leave on", options: [{letter:"A",text:"Friday."},{letter:"B",text:"Saturday."},{letter:"C",text:"Sunday."}], answer: "B" },
      items: [
        { id: 11, stem: "Mrs Lee's plane goes at", options: [{letter:"A",text:"8 a.m."},{letter:"B",text:"10 a.m."},{letter:"C",text:"11 a.m."}], answer: "B" },
        { id: 12, stem: "She is going to", options: [{letter:"A",text:"Amsterdam."},{letter:"B",text:"Frankfurt."},{letter:"C",text:"London."}], answer: "C" },
        { id: 13, stem: "First she will go to", options: [{letter:"A",text:"a factory."},{letter:"B",text:"an office."},{letter:"C",text:"a hotel."}], answer: "A" },
        { id: 14, stem: "She will have dinner in", options: [{letter:"A",text:"a restaurant."},{letter:"B",text:"her hotel."},{letter:"C",text:"someone's house."}], answer: "A" },
        { id: 15, stem: "The next morning she will travel by", options: [{letter:"A",text:"plane."},{letter:"B",text:"train."},{letter:"C",text:"car."}], answer: "B" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: ["You will hear a man asking for some information about a language school.","Listen and complete questions 16–20.","You will hear the conversation twice."],
      noteTitle: "School of Italian Studies", subtitle: "Length of courses: 6 or 9 months",
      rows: [
        { label: "Next course begins on:",             id: 16, answer: "Monday" },
        { label: "Number of students in each class:",  id: 17, answer: "15" },
        { label: "Cost of coursebook:",                 id: 18, prefix: "£", answer: "12.99" },
        { label: "School hours · Monday to Friday:",   prefilled: "From: 8 a.m. to: 7 p.m." },
        { label: "Saturday:",                            id: 19, prefix: "From:", suffix: "to: 1 p.m.", answer: "9 a.m." },
        { label: "Nearest underground station:",         id: 20, answer: "Green Park" }
      ]
    },
    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: ["You will hear a man talking about a day trip.","Listen and complete questions 21–25.","You will hear the information twice."],
      noteTitle: "DAY TRIP", subtitle: "Leave: 9.30 a.m.\nWe will stop at three places:",
      rows: [
        { label: "Trip will take:", id: 21, suffix: "hours", answer: "7" },
        { label: "Stop 1:",          id: 22, answer: "castle" },
        { label: "Stop 2:",          id: 23, suffix: "at 1 o'clock", answer: "café" },
        { label: "Stop 3:",          id: 24, answer: "beach" },
        { label: "Take your:",       id: 25, answer: "camera" }
      ]
    }
  ]
};
