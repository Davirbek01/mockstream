// Cambridge KET (Key English Test) — Paper 2 Listening — Test 27
// VERBATIM transcription from the official Cambridge KET Book 7 · Test 3.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-27",
    title: "KET Listening — Test 27",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://audio.mock-stream.com/KET-Listening/test27/",
    files: { 1: "PART1.m4a", 2: "PART2.m4a", 3: "PART3.m4a", 4: "PART4.m4a", 5: "PART5.m4a" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: ["You will hear five short conversations.","You will hear each conversation twice.","There is one question for each conversation.","For questions 1–5, put a tick (✓) under the right answer."],
      imageBase: "https://audio.mock-stream.com/KET-Listening/test27/p1/",
      example: { number: 0, question: "How many people were at the meeting?", options: [{letter:"A",image:"q0A.png"},{letter:"B",image:"q0B.png"},{letter:"C",image:"q0C.png"}], answer: "C" },
      items: [
        { id: 1, question: "What instrument is Edward learning to play?",  options: [{letter:"A",image:"q1A.png"},{letter:"B",image:"q1B.png"},{letter:"C",image:"q1C.png"}], answer: "A" },
        { id: 2, question: "What will Anna have for breakfast today?",      options: [{letter:"A",image:"q2A.png"},{letter:"B",image:"q2B.png"},{letter:"C",image:"q2C.png"}], answer: "C" },
        { id: 3, question: "How much is the watch?",                          options: [{letter:"A",image:"q3A.png"},{letter:"B",image:"q3B.png"},{letter:"C",image:"q3C.png"}], answer: "A" },
        { id: 4, question: "What does Mandy's brother do?",                  options: [{letter:"A",image:"q4A.png"},{letter:"B",image:"q4B.png"},{letter:"C",image:"q4C.png"}], answer: "A" },
        { id: 5, question: "Who is coming to stay this weekend?",             options: [{letter:"A",image:"q5A.png"},{letter:"B",image:"q5B.png"},{letter:"C",image:"q5C.png"}], answer: "B" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: ["Listen to the conversation between Sally and her father about a computer course.","How many free places are there on the computer course each day?","For questions 6–10, write a letter A–H next to each day.","You will hear the conversation twice."],
      scenario: "Sally and her father — free places on each day of a computer course",
      example: { number: 0, name: "Monday", answer: "D" },
      leftLabel: "Days", rightLabel: "Number of free places",
      options: [{letter:"A",text:"none"},{letter:"B",text:"one"},{letter:"C",text:"two"},{letter:"D",text:"three"},{letter:"E",text:"four"},{letter:"F",text:"five"},{letter:"G",text:"six"},{letter:"H",text:"seven"}],
      items: [
        { id: 6,  name: "Tuesday",   answer: "A" },
        { id: 7,  name: "Wednesday", answer: "F" },
        { id: 8,  name: "Thursday",  answer: "B" },
        { id: 9,  name: "Friday",    answer: "C" },
        { id: 10, name: "Saturday",  answer: "E" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: ["Listen to Stephen talking to Jenny about making some soup.","For questions 11–15, tick (✓) A, B or C.","You will hear the conversation twice."],
      example: { number: 0, stem: "To make the soup, Jenny uses", options: [{letter:"A",text:"roast tomatoes."},{letter:"B",text:"fresh tomatoes."},{letter:"C",text:"a can of tomatoes."}], answer: "C" },
      items: [
        { id: 11, stem: "Jenny was shown how to make the soup by", options: [{letter:"A",text:"her aunt."},{letter:"B",text:"her friend."},{letter:"C",text:"her mother."}], answer: "C" },
        { id: 12, stem: "How has Jenny improved the soup?", options: [{letter:"A",text:"She adds less water."},{letter:"B",text:"She makes it thinner."},{letter:"C",text:"She uses bigger cups."}], answer: "A" },
        { id: 13, stem: "To make it really good, Jenny adds", options: [{letter:"A",text:"milk."},{letter:"B",text:"butter."},{letter:"C",text:"cream."}], answer: "A" },
        { id: 14, stem: "How long does the soup take to make?", options: [{letter:"A",text:"about 5 minutes"},{letter:"B",text:"about 10 minutes"},{letter:"C",text:"about 20 minutes"}], answer: "C" },
        { id: 15, stem: "What will they eat next?", options: [{letter:"A",text:"fruit cake"},{letter:"B",text:"pasta"},{letter:"C",text:"lemon chicken"}], answer: "B" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: ["You will hear a boy asking for information about a plant.","Listen and complete questions 16–20.","You will hear the conversation twice."],
      noteTitle: "Plant for Mum", subtitle: "Name of plant: Sweet William",
      rows: [
        { label: "Colour of flowers:",        id: 16,                  answer: "pink" },
        { label: "Season to see flowers:",     id: 17,                  answer: "Spring" },
        { label: "Month to put plant outside:", id: 18,                  answer: "September" },
        { label: "Final size of plant:",        id: 19, suffix: "cm tall", answer: "40" },
        { label: "Price of plant today:",        id: 20, prefix: "£",     answer: "8" }
      ]
    },
    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: ["You will hear some information about a day trip.","Listen and complete questions 21–25.","You will hear the information twice."],
      noteTitle: "Day trip to the lake", subtitle: "Name of lake: North Lake",
      rows: [
        { label: "Travel there by:",     id: 21,                                       answer: "train" },
        { label: "Time to meet:",         id: 22, suffix: "p.m.",                       answer: "1.15" },
        { label: "Activities:",            id: 23, prefix: "walking and",               answer: "fishing" },
        { label: "How much money to take:", id: 24, prefix: "£",                          answer: "12" },
        { label: "Meet at end of day at:",  id: 25, prefix: "the", suffix: "Hotel",       answer: "Aster" }
      ]
    }
  ]
};
