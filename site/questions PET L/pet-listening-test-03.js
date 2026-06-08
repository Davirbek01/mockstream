// Cambridge PET (Preliminary English Test) for Schools — Listening — Test 3
// VERBATIM from "Preliminary English Test for Schools 1" (Cambridge UP, 2010).
// Paper 2 Listening: ~35 min · 4 parts · 25 questions.
// Source pages: Test 3 listening = pp.64-70; key = p.135 of book.
// Part 1 image cells cropped + ESRGAN-upscaled from book pp.64-66.

window.PET_L_TEST = {
  testInfo: {
    id: "pet-l-03",
    title: "PET Listening — Test 3",
    paper: "Paper 2 · Listening",
    level: "B1",
    totalTime: 35,
    totalQuestions: 25,
    parts: 4
  },

  audio: {
    base: "https://storage.googleapis.com/mockstream-listening-audio/PET-Listening/test3/",
    files: { 1: "FULL.mp3", 2: "FULL.mp3", 3: "FULL.mp3", 4: "FULL.mp3" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–7",
      type: "picture-mcq",
      instruction: [
        "There are seven questions in this part.",
        "For each question, there are three pictures and a short recording.",
        "For each question, choose the correct answer A, B or C."
      ],
      imageBase: "https://storage.googleapis.com/mockstream-listening-audio/PET-Listening/test3/p1/",
      example: {
        number: 0,
        question: "Where is the girl's hat?",
        options: [ { letter: "A", image: "q0A.png" }, { letter: "B", image: "q0B.png" }, { letter: "C", image: "q0C.png" } ],
        answer: "A"
      },
      items: [
        { id: 1, question: "Which T-shirt does the boy decide to buy?",
          options: [ { letter: "A", image: "q1A.png" }, { letter: "B", image: "q1B.png" }, { letter: "C", image: "q1C.png" } ],
          answer: "A" },
        { id: 2, question: "Who will be on the stage next?",
          options: [ { letter: "A", image: "q2A.png" }, { letter: "B", image: "q2B.png" }, { letter: "C", image: "q2C.png" } ],
          answer: "C" },
        { id: 3, question: "What time will the pie be ready?",
          options: [ { letter: "A", image: "q3A.png" }, { letter: "B", image: "q3B.png" }, { letter: "C", image: "q3C.png" } ],
          answer: "C" },
        { id: 4, question: "Which photo does the girl dislike?",
          options: [ { letter: "A", image: "q4A.png" }, { letter: "B", image: "q4B.png" }, { letter: "C", image: "q4C.png" } ],
          answer: "B" },
        { id: 5, question: "What should the students take on the school trip?",
          options: [ { letter: "A", image: "q5A.png" }, { letter: "B", image: "q5B.png" }, { letter: "C", image: "q5C.png" } ],
          answer: "C" },
        { id: 6, question: "Where do the boys decide to go?",
          options: [ { letter: "A", image: "q6A.png" }, { letter: "B", image: "q6B.png" }, { letter: "C", image: "q6C.png" } ],
          answer: "A" },
        { id: 7, question: "What has the girl lost?",
          options: [ { letter: "A", image: "q7A.png" }, { letter: "B", image: "q7B.png" }, { letter: "C", image: "q7C.png" } ],
          answer: "B" }
      ]
    },

    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 8–13",
      type: "mcq-conversation",
      instruction: [
        "You will hear a radio interview with a teenage surfer called Abby Fielding.",
        "For each question, choose the correct answer A, B or C."
      ],
      items: [
        { id: 8, stem: "Abby first decided to go surfing when",
          options: [
            { letter: "A", text: "her mother offered to teach her." },
            { letter: "B", text: "she saw some local competitions." },
            { letter: "C", text: "her mother gave her money for a surfboard." }
          ], answer: "B" },
        { id: 9, stem: "What did Abby discover when she started surfing?",
          options: [
            { letter: "A", text: "Her local surfing school was expensive." },
            { letter: "B", text: "She needed more equipment than she'd expected." },
            { letter: "C", text: "It was good to try different surfboards." }
          ], answer: "C" },
        { id: 10, stem: "What does Abby say about surfing in the winter?",
          options: [
            { letter: "A", text: "The sea is warm enough where she lives." },
            { letter: "B", text: "She wears a special suit for winter surfing." },
            { letter: "C", text: "The beaches are very quiet then." }
          ], answer: "A" },
        { id: 11, stem: "How did Abby feel about surfing the enormous wave?",
          options: [
            { letter: "A", text: "disappointed she didn't have the right board" },
            { letter: "B", text: "worried at first by the size of the wave" },
            { letter: "C", text: "scared about falling off her board" }
          ], answer: "B" },
        { id: 12, stem: "What advice does Abby give to teenagers interested in surfing?",
          options: [
            { letter: "A", text: "don't start until you're a very strong swimmer" },
            { letter: "B", text: "find a good surfing teacher" },
            { letter: "C", text: "learn to surf in different conditions" }
          ], answer: "C" },
        { id: 13, stem: "What does Abby want to do next?",
          options: [
            { letter: "A", text: "find out about surfing as a career" },
            { letter: "B", text: "study surfing science at university" },
            { letter: "C", text: "train for the next surfing competition" }
          ], answer: "A" }
      ]
    },

    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 14–19",
      type: "note-completion",
      instruction: [
        "You will hear a boy called Caspar, who is part of a circus family, talking about his life.",
        "For each question, fill in the missing information in the numbered space."
      ],
      noteTitle: "Caspar and the Circus Family",
      rows: [
        { label: "Caspar's mother dances across a",                                            id: 14, suffix: "in the circus.", answer: "rope" },
        { label: "Caspar's brother is in an act where as many as",                              id: 15, suffix: "people balance on a motorbike.", answer: "20" },
        { label: "Caspar's dad is a good circus boss because he is",                            id: 16, suffix: "and has a strong voice.", answer: "tall" },
        { label: "Caspar starts the show by marching in front of the",                          id: 17, answer: "band" },
        { label: "There are no animals in the show except a",                                   id: 18, answer: "rabbit" },
        { label: "One of Caspar's jobs is selling",                                              id: 19, answer: "ice cream" }
      ]
    },

    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 20–25",
      type: "true-false",
      instruction: [
        "Look at the six sentences for this part.",
        "You will hear a girl called Lisa and a boy called Sam talking about a book they have both read.",
        "Decide if each sentence is correct or incorrect.",
        "If it is correct, choose the letter A for YES. If it is not correct, choose the letter B for NO."
      ],
      scenario: "Lisa and Sam — discussing a book they have both read",
      items: [
        { id: 20, statement: "Lisa disliked the book when she first started reading it.",          answer: "B" },
        { id: 21, statement: "Sam and Lisa felt sorry for Paul, the main character in the book.",   answer: "B" },
        { id: 22, statement: "Sam was interested in the mystery about Paul and his brother.",       answer: "B" },
        { id: 23, statement: "Lisa thought the author helped the reader to understand Paul.",        answer: "A" },
        { id: 24, statement: "Sam wished there was more information about football in the book.",   answer: "B" },
        { id: 25, statement: "Lisa liked the way the author developed Paul's character.",            answer: "A" }
      ]
    }
  ]
};
