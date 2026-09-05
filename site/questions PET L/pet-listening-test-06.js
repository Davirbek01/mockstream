// Cambridge PET Listening — Test 6 (Book 2, Test 2)
// VERBATIM from "Cambridge Preliminary English Test 2" (Cambridge UP).
// Source pages: Test 2 listening = pp.38-44; key = p.121.

window.PET_L_TEST = {
  testInfo: {
    id: "pet-l-06",
    title: "PET Listening — Test 6",
    paper: "Paper 2 · Listening",
    level: "B1",
    totalTime: 35,
    totalQuestions: 25,
    parts: 4
  },
  audio: {
    base: "https://audio.mock-stream.com/PET-Listening/test6/",
    files: { 1: "PART1.m4a", 2: "PART2.m4a", 3: "PART3.m4a", 4: "PART4.m4a" }
  },
  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–7",
      type: "picture-mcq",
      instruction: [
        "There are seven questions in this part.",
        "For each question there are three pictures and a short recording.",
        "Choose the correct picture and put a tick (✓) in the box below it."
      ],
      imageBase: "https://audio.mock-stream.com/PET-Listening/test6/p1/",
      example: { number: 0, question: "What's the time?",
        options: [ { letter: "A", text: "(example pictures from book pp.38 — student sees A as worked example)" }, { letter: "B", text: "" }, { letter: "C", text: "" } ],
        answer: "A" },
      items: [
        { id: 1, question: "When and where are they meeting?",
          options: [ { letter: "A", image: "q1A.png" }, { letter: "B", image: "q1B.png" }, { letter: "C", image: "q1C.png" } ], answer: "C" },
        { id: 2, question: "What will Chris get for his birthday?",
          options: [ { letter: "A", image: "q2A.png" }, { letter: "B", image: "q2B.png" }, { letter: "C", image: "q2C.png" } ], answer: "C" },
        { id: 3, question: "What does Mr Jones look like?",
          options: [ { letter: "A", image: "q3A.png" }, { letter: "B", image: "q3B.png" }, { letter: "C", image: "q3C.png" } ], answer: "C" },
        { id: 4, question: "Where is he going to plant the tree?",
          options: [ { letter: "A", image: "q4A.png" }, { letter: "B", image: "q4B.png" }, { letter: "C", image: "q4C.png" } ], answer: "A" },
        { id: 5, question: "What is the man going to buy?",
          options: [ { letter: "A", image: "q5A.png" }, { letter: "B", image: "q5B.png" }, { letter: "C", image: "q5C.png" } ], answer: "C" },
        { id: 6, question: "Which is Gary's room?",
          options: [ { letter: "A", image: "q6A.png" }, { letter: "B", image: "q6B.png" }, { letter: "C", image: "q6C.png" } ], answer: "A" },
        { id: 7, question: "Which is the best vehicle for the man?",
          options: [ { letter: "A", image: "q7A.png" }, { letter: "B", image: "q7B.png" }, { letter: "C", image: "q7C.png" } ], answer: "A" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 8–13",
      type: "mcq-conversation",
      instruction: [
        "You will hear a recorded message about an arts festival.",
        "For each question, put a tick (✓) in the correct box."
      ],
      items: [
        { id: 8, stem: "The festival takes place from",
          options: [ { letter: "A", text: "12 to 18 May." }, { letter: "B", text: "12 to 20 May." }, { letter: "C", text: "12 to 28 May." } ], answer: "C" },
        { id: 9, stem: "What is on at the Theatre Royal on 19 May?",
          options: [ { letter: "A", text: "jazz" }, { letter: "B", text: "opera" }, { letter: "C", text: "classical music" } ], answer: "C" },
        { id: 10, stem: "During lunchtime jazz concerts at the Corn Exchange they sell",
          options: [ { letter: "A", text: "soft drinks and sandwiches." }, { letter: "B", text: "wine and sandwiches." }, { letter: "C", text: "soft drinks and light meals." } ], answer: "C" },
        { id: 11, stem: "What is on at the cathedral?",
          options: [ { letter: "A", text: "music" }, { letter: "B", text: "poetry" }, { letter: "C", text: "films" } ], answer: "A" },
        { id: 12, stem: "What does the festival programme offer at Ickworth?",
          options: [ { letter: "A", text: "a walk and a book reading" }, { letter: "B", text: "a concert and a meal" }, { letter: "C", text: "a walk and a concert" } ], answer: "C" },
        { id: 13, stem: "You can't use a credit card if you book",
          options: [ { letter: "A", text: "by post." }, { letter: "B", text: "by fax." }, { letter: "C", text: "by telephone." } ], answer: "A" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 14–19",
      type: "note-completion",
      instruction: [
        "You will hear someone talking on the radio about a Language Study Fair.",
        "For each question, fill in the missing information in the numbered space."
      ],
      noteTitle: "The Language Study Fair",
      rows: [
        { label: "Dates: 17th to 19th",         id: 14, answer: "March" },
        { label: "Fair includes:",              id: 15, suffix: "by educational speakers", answer: "talks" },
        { label: "demonstrations of latest",    id: 16, answer: "computer programs" },
        { label: "Opening hours: 9.30 a.m.–4.00 p.m on", id: 17, answer: "Saturday" },
        { label: "Tickets: £5 or £3 for",       id: 18, answer: "students" },
        { label: "Hotline:",                     id: 19, answer: "9847711" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 20–25",
      type: "true-false",
      instruction: [
        "Look at the six sentences for this part.",
        "You will hear a conversation between a girl, Kate, and a boy, George.",
        "Decide if each sentence is correct or incorrect.",
        "If it is correct, put a tick (✓) in the box under A for YES. If it is not correct, put a tick (✓) in the box under B for NO."
      ],
      scenario: "Kate and George — Kate's illness and missing lectures",
      items: [
        { id: 20, statement: "Kate has stopped taking her medicine.",                         answer: "B" },
        { id: 21, statement: "George thinks Kate should stay away from class.",                answer: "A" },
        { id: 22, statement: "Kate had an accident on her bike last week.",                    answer: "B" },
        { id: 23, statement: "George thinks Mr Gray is a lazy lecturer.",                      answer: "A" },
        { id: 24, statement: "Kate will miss three lectures.",                                  answer: "A" },
        { id: 25, statement: "Kate wants to stay at home at the weekend.",                      answer: "B" }
      ]
    }
  ]
};
