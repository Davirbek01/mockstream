// Cambridge PET Listening — Test 7 (Book 2, Test 3)
// VERBATIM from "Cambridge Preliminary English Test 2" (Cambridge UP).
// Source pages: Test 3 listening = pp.58-64; key = p.138.

window.PET_L_TEST = {
  testInfo: {
    id: "pet-l-07",
    title: "PET Listening — Test 7",
    paper: "Paper 2 · Listening",
    level: "B1",
    totalTime: 35,
    totalQuestions: 25,
    parts: 4
  },
  audio: {
    base: "https://storage.googleapis.com/mockstream-listening-audio/PET-Listening/test7/",
    files: { 1: "PART1.mp3", 2: "PART2.mp3", 3: "PART3.mp3", 4: "PART4.mp3" }
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
      imageBase: "https://storage.googleapis.com/mockstream-listening-audio/PET-Listening/test7/p1/",
      example: { number: 0, question: "What's the time?",
        options: [ { letter: "A", text: "(example pictures — student sees A as worked example)" }, { letter: "B", text: "" }, { letter: "C", text: "" } ],
        answer: "A" },
      items: [
        { id: 1, question: "Where is the station?",
          options: [ { letter: "A", image: "q1A.png" }, { letter: "B", image: "q1B.png" }, { letter: "C", image: "q1C.png" } ], answer: "B" },
        { id: 2, question: "Where did the woman put the calculator?",
          options: [ { letter: "A", image: "q2A.png" }, { letter: "B", image: "q2B.png" }, { letter: "C", image: "q2C.png" } ], answer: "C" },
        { id: 3, question: "Where is Helen?",
          options: [ { letter: "A", image: "q3A.png" }, { letter: "B", image: "q3B.png" }, { letter: "C", image: "q3C.png" } ], answer: "A" },
        { id: 4, question: "Which building was hit by lightning?",
          options: [ { letter: "A", image: "q4A.png" }, { letter: "B", image: "q4B.png" }, { letter: "C", image: "q4C.png" } ], answer: "B" },
        { id: 5, question: "What does the woman want to buy?",
          options: [ { letter: "A", image: "q5A.png" }, { letter: "B", image: "q5B.png" }, { letter: "C", image: "q5C.png" } ], answer: "C" },
        { id: 6, question: "Which picture does the woman decide to send?",
          options: [ { letter: "A", image: "q6A.png" }, { letter: "B", image: "q6B.png" }, { letter: "C", image: "q6C.png" } ], answer: "A" },
        { id: 7, question: "Which hotel has the man chosen?",
          options: [ { letter: "A", image: "q7A.png" }, { letter: "B", image: "q7B.png" }, { letter: "C", image: "q7C.png" } ], answer: "C" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 8–13",
      type: "mcq-conversation",
      instruction: [
        "You will hear a radio interview with a man who works on an international camp.",
        "For each question, put a tick (✓) in the correct box."
      ],
      items: [
        { id: 8, stem: "If you want to apply for the Camp you must",
          options: [ { letter: "A", text: "be a student." }, { letter: "B", text: "be at least twenty-four years old." }, { letter: "C", text: "speak more than one language." } ], answer: "C" },
        { id: 9, stem: "In a Camp tent you can expect to",
          options: [ { letter: "A", text: "mix with other nationalities." }, { letter: "B", text: "share with five other people." }, { letter: "C", text: "know the other people." } ], answer: "A" },
        { id: 10, stem: "The Camp want people who are",
          options: [ { letter: "A", text: "good at cooking." }, { letter: "B", text: "good organisers." }, { letter: "C", text: "able to mix well." } ], answer: "C" },
        { id: 11, stem: "What do you have to take to the Camp?",
          options: [ { letter: "A", text: "a tent" }, { letter: "B", text: "a map" }, { letter: "C", text: "pictures" } ], answer: "C" },
        { id: 12, stem: "As a Camp member you should",
          options: [ { letter: "A", text: "be a good singer." }, { letter: "B", text: "join in performances." }, { letter: "C", text: "be good at acting." } ], answer: "B" },
        { id: 13, stem: "The Camp fees must be paid",
          options: [ { letter: "A", text: "in dollars." }, { letter: "B", text: "by cheque." }, { letter: "C", text: "before the Camp starts." } ], answer: "C" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 14–19",
      type: "note-completion",
      instruction: [
        "You will hear a young woman who has applied for an office job talking about her jobs abroad.",
        "For each question, fill in the missing information in the numbered space."
      ],
      noteTitle: "Interview Form · Vicky Brownlow, 22 years · Position: Office Manager",
      rows: [
        { label: "First job — worked for",     id: 14, answer: "family" },
        { label: "Length of time stayed:",      id: 15, answer: "six months" },
        { label: "Second job — worked as",     id: 16, suffix: "in a hotel", answer: "receptionist" },
        { label: "Third job — worked for",      id: 17, answer: "bakery" },
        { label: "Got up at",                   id: 18, answer: "four in the morning" },
        { label: "Bank International — worked in", id: 19, answer: "Foreign Desk" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 20–25",
      type: "true-false",
      instruction: [
        "Look at the six sentences for this part.",
        "You will hear a conversation between a father and his daughter, Sonia.",
        "Decide if each sentence is correct or incorrect.",
        "If it is correct, put a tick (✓) in the box under A for YES. If it is not correct, put a tick (✓) in the box under B for NO."
      ],
      scenario: "Sonia and her father — about a birthday gift and learning to drive",
      items: [
        { id: 20, statement: "Sonia would like a car for her birthday.",                   answer: "B" },
        { id: 21, statement: "Sonia's friend Maria has her own car.",                       answer: "B" },
        { id: 22, statement: "Sonia has talked to Maria about learning to drive.",          answer: "A" },
        { id: 23, statement: "Sonia offers to get a job at weekends.",                      answer: "A" },
        { id: 24, statement: "Sonia's father understands how his daughter feels.",          answer: "A" },
        { id: 25, statement: "Sonia suggests cooking a meal on her birthday.",              answer: "B" }
      ]
    }
  ]
};
