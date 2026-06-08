// Cambridge PET Listening — Test 8 (Book 2, Test 4)
// VERBATIM from "Cambridge Preliminary English Test 2" (Cambridge UP).
// Source pages: Test 4 listening = pp.78-84; key = p.154.

window.PET_L_TEST = {
  testInfo: {
    id: "pet-l-08",
    title: "PET Listening — Test 8",
    paper: "Paper 2 · Listening",
    level: "B1",
    totalTime: 35,
    totalQuestions: 25,
    parts: 4
  },
  audio: {
    base: "https://storage.googleapis.com/mockstream-listening-audio/PET-Listening/test8/",
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
      imageBase: "https://storage.googleapis.com/mockstream-listening-audio/PET-Listening/test8/p1/",
      example: { number: 0, question: "What's the time?",
        options: [ { letter: "A", text: "(example pictures — student sees A as worked example)" }, { letter: "B", text: "" }, { letter: "C", text: "" } ],
        answer: "A" },
      items: [
        { id: 1, question: "Where are the woman's glasses?",
          options: [ { letter: "A", image: "q1A.png" }, { letter: "B", image: "q1B.png" }, { letter: "C", image: "q1C.png" } ], answer: "A" },
        { id: 2, question: "What damage was done to the car?",
          options: [ { letter: "A", image: "q2A.png" }, { letter: "B", image: "q2B.png" }, { letter: "C", image: "q2C.png" } ], answer: "C" },
        { id: 3, question: "What did she bring?",
          options: [ { letter: "A", image: "q3A.png" }, { letter: "B", image: "q3B.png" }, { letter: "C", image: "q3C.png" } ], answer: "A" },
        { id: 4, question: "What did Sally buy?",
          options: [ { letter: "A", image: "q4A.png" }, { letter: "B", image: "q4B.png" }, { letter: "C", image: "q4C.png" } ], answer: "C" },
        { id: 5, question: "Where are the man and his grandma?",
          options: [ { letter: "A", image: "q5A.png" }, { letter: "B", image: "q5B.png" }, { letter: "C", image: "q5C.png" } ], answer: "A" },
        { id: 6, question: "What would John like to be?",
          options: [ { letter: "A", image: "q6A.png" }, { letter: "B", image: "q6B.png" }, { letter: "C", image: "q6C.png" } ], answer: "C" },
        { id: 7, question: "Which pianist are the two people talking about?",
          options: [ { letter: "A", image: "q7A.png" }, { letter: "B", image: "q7B.png" }, { letter: "C", image: "q7C.png" } ], answer: "C" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 8–13",
      type: "mcq-conversation",
      instruction: [
        "You will hear a talk given to visitors to a fashion museum.",
        "For each question, put a tick (✓) in the correct box."
      ],
      items: [
        { id: 8, stem: "The speaker says that fashion now interests",
          options: [ { letter: "A", text: "rich people." }, { letter: "B", text: "young people." }, { letter: "C", text: "most people." } ], answer: "C" },
        { id: 9, stem: "Fashion clothes which were made before the 1900s were",
          options: [ { letter: "A", text: "individually made." }, { letter: "B", text: "copied from pictures." }, { letter: "C", text: "made of light material." } ], answer: "A" },
        { id: 10, stem: "Coco Chanel",
          options: [ { letter: "A", text: "was born in 1908." }, { letter: "B", text: "changed people's ideas about fashion." }, { letter: "C", text: "liked wearing tight-fitting clothes." } ], answer: "B" },
        { id: 11, stem: "In the 1920s",
          options: [ { letter: "A", text: "white skirts were fashionable." }, { letter: "B", text: "clothes started to cost less." }, { letter: "C", text: "women took up sports." } ], answer: "B" },
        { id: 12, stem: "Which of these was part of the 'New Look'?",
          options: [ { letter: "A", text: "material with flowers" }, { letter: "B", text: "very short skirts" }, { letter: "C", text: "longer skirts" } ], answer: "C" },
        { id: 13, stem: "The speaker is introducing an exhibition of",
          options: [ { letter: "A", text: "clothes that are very old." }, { letter: "B", text: "fashion for the future." }, { letter: "C", text: "pictures of today's fashions." } ], answer: "B" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 14–19",
      type: "note-completion",
      instruction: [
        "You will hear a man talking about Tanya Perry's life.",
        "For each question, fill in the missing information in the numbered space."
      ],
      noteTitle: "Tanya Perry · Born in London in 1948",
      rows: [
        { label: "In 1952 family moved to",          id: 14, answer: "north-west" },
        { label: "At school with Jack Peters, the famous", id: 15, answer: "poet" },
        { label: "Wrote some",                        id: 16, suffix: "while still at school", answer: "short stories" },
        { label: "During the early 1970s worked as a", id: 17, answer: "waitress" },
        { label: "The film called",                   id: 18, suffix: "won a prize at a French Film Festival", answer: "City Life" },
        { label: "Now has",                            id: 19, suffix: "plays in print", answer: "24" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 20–25",
      type: "true-false",
      instruction: [
        "Look at the six sentences for this part.",
        "You will hear a conversation between a man and a woman at home.",
        "Decide if each sentence is correct or incorrect.",
        "If it is correct, put a tick (✓) in the box under A for YES. If it is not correct, put a tick (✓) in the box under B for NO."
      ],
      scenario: "A man and a woman at home — planning evening entertainment",
      items: [
        { id: 20, statement: "The man wants to spend the evening at home.",     answer: "B" },
        { id: 21, statement: "The woman suggests they hire a video.",            answer: "A" },
        { id: 22, statement: "They both want to see something light.",            answer: "B" },
        { id: 23, statement: "The woman only likes to see a film once.",          answer: "A" },
        { id: 24, statement: "In the end they decide to watch a video.",          answer: "A" },
        { id: 25, statement: "The man offers to prepare some food.",              answer: "A" }
      ]
    }
  ]
};
