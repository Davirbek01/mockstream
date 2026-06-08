// Cambridge PET Listening — Test 5 (Book 2, Test 1)
// VERBATIM from "Cambridge Preliminary English Test 2" (Cambridge UP).
// Source pages: Test 1 listening = pp.18-24; key = p.105.
// Part 1 cells cropped from book pp.18-20 + ESRGAN x4plus-anime + GCS.

window.PET_L_TEST = {
  testInfo: {
    id: "pet-l-05",
    title: "PET Listening — Test 5",
    paper: "Paper 2 · Listening",
    level: "B1",
    totalTime: 35,
    totalQuestions: 25,
    parts: 4
  },
  audio: {
    base: "https://storage.googleapis.com/mockstream-listening-audio/PET-Listening/test5/",
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
      imageBase: "https://storage.googleapis.com/mockstream-listening-audio/PET-Listening/test5/p1/",
      example: { number: 0, question: "What's the time?",
        options: [ { letter: "A", text: "(example pictures from book pp.18 — student sees A as worked example)" }, { letter: "B", text: "" }, { letter: "C", text: "" } ],
        answer: "A" },
      items: [
        { id: 1, question: "Where will the girls meet?",
          options: [ { letter: "A", image: "q1A.png" }, { letter: "B", image: "q1B.png" }, { letter: "C", image: "q1C.png" } ], answer: "C" },
        { id: 2, question: "Which chair does the man want?",
          options: [ { letter: "A", image: "q2A.png" }, { letter: "B", image: "q2B.png" }, { letter: "C", image: "q2C.png" } ], answer: "A" },
        { id: 3, question: "Which picture shows what the girls need?",
          options: [ { letter: "A", image: "q3A.png" }, { letter: "B", image: "q3B.png" }, { letter: "C", image: "q3C.png" } ], answer: "A" },
        { id: 4, question: "Which picture shows what happened?",
          options: [ { letter: "A", image: "q4A.png" }, { letter: "B", image: "q4B.png" }, { letter: "C", image: "q4C.png" } ], answer: "B" },
        { id: 5, question: "What is Sarah's mother doing?",
          options: [ { letter: "A", image: "q5A.png" }, { letter: "B", image: "q5B.png" }, { letter: "C", image: "q5C.png" } ], answer: "C" },
        { id: 6, question: "What luggage is the man taking on holiday?",
          options: [ { letter: "A", image: "q6A.png" }, { letter: "B", image: "q6B.png" }, { letter: "C", image: "q6C.png" } ], answer: "A" },
        { id: 7, question: "Which photograph does the man like?",
          options: [ { letter: "A", image: "q7A.png" }, { letter: "B", image: "q7B.png" }, { letter: "C", image: "q7C.png" } ], answer: "C" }
      ]
    },
    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 8–13",
      type: "mcq-conversation",
      instruction: [
        "You will hear part of a radio programme about classical music.",
        "For each question, put a tick (✓) in the correct box."
      ],
      items: [
        { id: 8, stem: "This week's prize is",
          options: [ { letter: "A", text: "a music cassette." }, { letter: "B", text: "two concert tickets." }, { letter: "C", text: "a classical CD." } ], answer: "C" },
        { id: 9, stem: "The person who wrote the music lived in",
          options: [ { letter: "A", text: "Italy." }, { letter: "B", text: "Spain." }, { letter: "C", text: "France." } ], answer: "B" },
        { id: 10, stem: "What else shares the title of this music?",
          options: [ { letter: "A", text: "a garden" }, { letter: "B", text: "a play" }, { letter: "C", text: "a park" } ], answer: "B" },
        { id: 11, stem: "What did people do when they first heard the music?",
          options: [ { letter: "A", text: "Some left before the end." }, { letter: "B", text: "Only a few clapped." }, { letter: "C", text: "Some asked for their money back." } ], answer: "A" },
        { id: 12, stem: "This piece of music has been",
          options: [ { letter: "A", text: "played in the cinema." }, { letter: "B", text: "used in advertising." }, { letter: "C", text: "used for a TV play." } ], answer: "B" },
        { id: 13, stem: "If you know the competition answer you should ring",
          options: [ { letter: "A", text: "0108 937 224." }, { letter: "B", text: "0018 739 242." }, { letter: "C", text: "0018 937 224." } ], answer: "C" }
      ]
    },
    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 14–19",
      type: "note-completion",
      instruction: [
        "You will hear a radio programme in which young people from different parts of the country are interviewed.",
        "For each question, fill in the missing information in the numbered space."
      ],
      noteTitle: "Information sheet · Mike Davis, age 15",
      rows: [
        { label: "Favourite subject:",     id: 14, answer: "science" },
        { label: "Favourite sport:",       id: 15, answer: "running" },
        { label: "Usual transport:",       id: 16, answer: "bicycle" },
        { label: "On Saturday:",           id: 17, answer: "helps his uncle" },
        { label: "On",                      id: 18, suffix: ": Young Farmers' Group", answer: "Mondays" },
        { label: "Future job:",             id: 19, answer: "farmer" }
      ]
    },
    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 20–25",
      type: "true-false",
      instruction: [
        "Look at the six sentences for this part.",
        "You will hear a conversation between a boy, Jim, and his mother.",
        "Decide if each sentence is correct or incorrect.",
        "If it is correct, put a tick (✓) in the box under A for YES. If it is not correct, put a tick (✓) in the box under B for NO."
      ],
      scenario: "Jim and his mother — about Jim's bicycle",
      items: [
        { id: 20, statement: "Jim's bicycle needs to be mended.",                                answer: "A" },
        { id: 21, statement: "He's keen to start saving money.",                                  answer: "B" },
        { id: 22, statement: "His mother thinks a mountain bike is suitable for their area.",    answer: "B" },
        { id: 23, statement: "She encourages Jim to manage his money better.",                    answer: "A" },
        { id: 24, statement: "His mother offers to lend him some money.",                         answer: "B" },
        { id: 25, statement: "Jim is disappointed by his mother's suggestion.",                   answer: "A" }
      ]
    }
  ]
};
