// Cambridge KET (Key English Test) — Paper 2 Listening — Test 21
// VERBATIM transcription from the official Cambridge KET Book 6 · Test 1.
// 5 parts · 25 questions · approximately 30 minutes (including 8 minutes transfer time).

window.KET_L_TEST = {
  testInfo: {
    id: "ket-l-21",
    title: "KET Listening — Test 21",
    paper: "Paper 2",
    level: "A2",
    totalTime: 30,
    totalQuestions: 25,
    parts: 5
  },

  audio: {
    base: "https://audio.mock-stream.com/KET-Listening/test21/",
    files: { 1: "PART1.m4a", 2: "PART2.m4a", 3: "PART3.m4a", 4: "PART4.m4a", 5: "PART5.m4a" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "picture-mcq",
      instruction: ["You will hear five short conversations.","You will hear each conversation twice.","There is one question for each conversation.","For questions 1–5, put a tick (✓) under the right answer."],
      imageBase: "https://audio.mock-stream.com/KET-Listening/test21/p1/",
      example: { number: 0, question: "How many people were at the meeting?", options: [{letter:"A",image:"q0A.png"},{letter:"B",image:"q0B.png"},{letter:"C",image:"q0C.png"}], answer: "C" },
      items: [
        { id: 1, question: "What must the man turn off?",                 options: [{letter:"A",image:"q1A.png"},{letter:"B",image:"q1B.png"},{letter:"C",image:"q1C.png"}], answer: "A" },
        { id: 2, question: "Where's the girl's pen?",                       options: [{letter:"A",image:"q2A.png"},{letter:"B",image:"q2B.png"},{letter:"C",image:"q2C.png"}], answer: "C" },
        { id: 3, question: "What will the boy do this evening?",           options: [{letter:"A",image:"q3A.png"},{letter:"B",image:"q3B.png"},{letter:"C",image:"q3C.png"}], answer: "B" },
        { id: 4, question: "What animals did they see on their holiday?",  options: [{letter:"A",image:"q4A.png"},{letter:"B",image:"q4B.png"},{letter:"C",image:"q4C.png"}], answer: "C" },
        { id: 5, question: "What does the man want to buy?",                options: [{letter:"A",image:"q5A.png"},{letter:"B",image:"q5B.png"},{letter:"C",image:"q5C.png"}], answer: "C" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "matching-list",
      instruction: ["Listen to David and Eva talking about a school art lesson.","Where did they and their friends go to draw their pictures?","For questions 6–10, write a letter A–H next to each person.","You will hear the conversation twice."],
      scenario: "David and Eva talking about a school art lesson — where each went",
      example: { number: 0, name: "David", answer: "E" },
      leftLabel: "People", rightLabel: "Places",
      options: [{letter:"A",text:"bank"},{letter:"B",text:"café"},{letter:"C",text:"castle"},{letter:"D",text:"market"},{letter:"E",text:"museum"},{letter:"F",text:"park"},{letter:"G",text:"river"},{letter:"H",text:"swimming pool"}],
      items: [
        { id: 6,  name: "Eva",      answer: "D" },
        { id: 7,  name: "Luke",     answer: "F" },
        { id: 8,  name: "Mary",     answer: "H" },
        { id: 9,  name: "Patrick",  answer: "A" },
        { id: 10, name: "Cristina", answer: "B" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–15",
      type: "mcq-conversation",
      instruction: ["Listen to Dawn talking about her trip to California.","For questions 11–15, tick (✓) A, B or C.","You will hear the conversation twice."],
      example: { number: 0, stem: "Dawn went to California", options: [{letter:"A",text:"last week."},{letter:"B",text:"last month."},{letter:"C",text:"last year."}], answer: "B" },
      items: [
        { id: 11, stem: "Dawn booked the concert ticket", options: [{letter:"A",text:"on the internet."},{letter:"B",text:"over the phone."},{letter:"C",text:"by post."}], answer: "B" },
        { id: 12, stem: "Dawn's plane ticket cost", options: [{letter:"A",text:"£230."},{letter:"B",text:"£300."},{letter:"C",text:"£350."}], answer: "A" },
        { id: 13, stem: "Dawn stayed in", options: [{letter:"A",text:"a student hotel."},{letter:"B",text:"a family friend's home."},{letter:"C",text:"a campsite."}], answer: "B" },
        { id: 14, stem: "Dawn thought the concert was", options: [{letter:"A",text:"not very good."},{letter:"B",text:"too short."},{letter:"C",text:"too noisy."}], answer: "B" },
        { id: 15, stem: "Most of the time, Dawn was", options: [{letter:"A",text:"on the beach."},{letter:"B",text:"on a tour bus."},{letter:"C",text:"in the shops."}], answer: "C" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 16–20",
      type: "note-completion",
      instruction: ["You will hear André telling a friend about his tennis lessons.","Listen and complete questions 16–20.","You will hear the conversation twice."],
      noteTitle: "André's tennis lessons", subtitle: "Teacher's name: Paul",
      rows: [
        { label: "Day:",                id: 16,                          answer: "Wednesday" },
        { label: "Cost:",               id: 17, prefix: "£", suffix: "per hour", answer: "12" },
        { label: "At tennis courts in:", id: 18, suffix: "Street",        answer: "GERALD" },
        { label: "Starting time:",       id: 19, suffix: "pm",             answer: "6.15" },
        { label: "Wear:",                id: 20, suffix: "and T-shirt",   answer: "shorts" }
      ]
    },
    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 21–25",
      type: "note-completion",
      instruction: ["You will hear someone talking on the radio about a hotel in Ireland.","Listen and complete questions 21–25.","You will hear the information twice."],
      noteTitle: "Hotel in Ireland", subtitle: "Best time to visit: June",
      rows: [
        { label: "Name:",                    id: 21, prefix: "The", suffix: "Hotel", answer: "White" },
        { label: "Where:",                    id: 22, suffix: "Island",                answer: "ACHILL" },
        { label: "Hotel first built in the year:", id: 23,                              answer: "1859" },
        { label: "Number of bedrooms:",        id: 24,                                  answer: "36" },
        { label: "Restaurant famous for:",     id: 25,                                  answer: "fish" }
      ]
    }
  ]
};
