// Cambridge PET (Preliminary English Test) for Schools — Listening — Test 2
// VERBATIM from "Preliminary English Test for Schools 1" (Cambridge UP, 2010).
// Paper 2 Listening: ~35 min · 4 parts · 25 questions.
// Source pages: Test 2 listening = pp.44-50; key = p.123 of book.
// Part 1 image cells cropped + ESRGAN-upscaled from book pp.44-46.

window.PET_L_TEST = {
  testInfo: {
    id: "pet-l-02",
    title: "PET Listening — Test 2",
    paper: "Paper 2 · Listening",
    level: "B1",
    totalTime: 35,
    totalQuestions: 25,
    parts: 4
  },

  audio: {
    base: "https://storage.googleapis.com/mockstream-listening-audio/PET-Listening/test2/",
    files: { 1: "PART1.mp3", 2: "PART2.mp3", 3: "PART3.mp3", 4: "PART4.mp3" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–7",
      type: "picture-mcq",
      instruction: [
        "There are seven questions in this part.",
        "For each question there are three pictures and a short recording.",
        "For each question, choose the correct answer A, B or C."
      ],
      imageBase: "https://storage.googleapis.com/mockstream-listening-audio/PET-Listening/test2/p1/",
      example: {
        number: 0,
        question: "Where is the girl's hat?",
        options: [ { letter: "A", image: "q0A.png" }, { letter: "B", image: "q0B.png" }, { letter: "C", image: "q0C.png" } ],
        answer: "A"
      },
      items: [
        { id: 1, question: "What can't the woman find?",
          options: [ { letter: "A", image: "q1A.png" }, { letter: "B", image: "q1B.png" }, { letter: "C", image: "q1C.png" } ],
          answer: "B" },
        { id: 2, question: "What is the weather forecast for tomorrow?",
          options: [ { letter: "A", image: "q2A.png" }, { letter: "B", image: "q2B.png" }, { letter: "C", image: "q2C.png" } ],
          answer: "C" },
        { id: 3, question: "What did the boy buy?",
          options: [ { letter: "A", image: "q3A.png" }, { letter: "B", image: "q3B.png" }, { letter: "C", image: "q3C.png" } ],
          answer: "A" },
        { id: 4, question: "Which present has the girl bought her mother?",
          options: [ { letter: "A", image: "q4A.png" }, { letter: "B", image: "q4B.png" }, { letter: "C", image: "q4C.png" } ],
          answer: "C" },
        { id: 5, question: "Which TV programme will they watch together?",
          options: [ { letter: "A", image: "q5A.png" }, { letter: "B", image: "q5B.png" }, { letter: "C", image: "q5C.png" } ],
          answer: "B" },
        { id: 6, question: "What time is the swimming lesson today?",
          options: [ { letter: "A", image: "q6A.png" }, { letter: "B", image: "q6B.png" }, { letter: "C", image: "q6C.png" } ],
          answer: "B" },
        { id: 7, question: "Which subject does the boy like best?",
          options: [ { letter: "A", image: "q7A.png" }, { letter: "B", image: "q7B.png" }, { letter: "C", image: "q7C.png" } ],
          answer: "C" }
      ]
    },

    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 8–13",
      type: "mcq-conversation",
      instruction: [
        "You will hear an interview with a teenager called Simon about going to an indoor climbing centre that has a climbing wall.",
        "For each question, choose the correct answer A, B or C."
      ],
      items: [
        { id: 8, stem: "Simon's mum decided to take him to the climbing centre because",
          options: [
            { letter: "A", text: "she had enjoyed going there." },
            { letter: "B", text: "her friend had recommended it." },
            { letter: "C", text: "Simon had been there with his school." }
          ], answer: "A" },
        { id: 9, stem: "Before he went to the centre, Simon was",
          options: [
            { letter: "A", text: "worried about going climbing there." },
            { letter: "B", text: "interested in seeing the climbing wall." },
            { letter: "C", text: "disappointed to hear it was all indoors." }
          ], answer: "C" },
        { id: 10, stem: "Simon says that at the centre there were",
          options: [
            { letter: "A", text: "lots of people when it opened." },
            { letter: "B", text: "many different types of people." },
            { letter: "C", text: "no other people his age." }
          ], answer: "B" },
        { id: 11, stem: "What did Simon think about the climbing wall?",
          options: [
            { letter: "A", text: "He thought it looked very high." },
            { letter: "B", text: "He was afraid he might fall." },
            { letter: "C", text: "He found the foot holes helpful." }
          ], answer: "C" },
        { id: 12, stem: "Why was Simon unhappy with his first climb?",
          options: [
            { letter: "A", text: "He was slower than everyone else." },
            { letter: "B", text: "He found it hurt his arms." },
            { letter: "C", text: "He didn't get to the top." }
          ], answer: "A" },
        { id: 13, stem: "What does Simon feel he learnt from climbing at the centre?",
          options: [
            { letter: "A", text: "how to improve his fitness" },
            { letter: "B", text: "to think before he does something" },
            { letter: "C", text: "the best way to work with other people" }
          ], answer: "B" }
      ]
    },

    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 14–19",
      type: "note-completion",
      instruction: [
        "You will hear a girl called Hannah talking about her family's champion horse called Griffon.",
        "For each question, fill in the missing information in the numbered space."
      ],
      noteTitle: "Griffon the Horse",
      rows: [
        { label: "The international horse show will be held in the month of",                 id: 14, suffix: ", just after Hannah's birthday.", answer: "March" },
        { label: "The family will travel from Poland to the horse show in",                   id: 15, answer: "England" },
        { label: "The person who will ride Griffon round the ring in the international show is Hannah's", id: 16, answer: "father" },
        { label: "Two weeks ago Griffon won some",                                            id: 17, suffix: "as a prize.", answer: "money" },
        { label: "Hannah's ambition is to work as a",                                          id: 18, answer: "trainer" },
        { label: "When Griffon wins a competition, he is given some",                         id: 19, suffix: "by the family.", answer: "apples" }
      ]
    },

    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 20–25",
      type: "true-false",
      instruction: [
        "Look at the six sentences for this part.",
        "You will hear a conversation between a boy called Jamie and a girl called Miranda about sharing a bedroom with a brother or sister.",
        "Decide if each sentence is correct or incorrect.",
        "If it is correct, choose the letter A for YES. If it is not correct, choose the letter B for NO."
      ],
      scenario: "Jamie and Miranda — sharing a bedroom with a brother or sister",
      items: [
        { id: 20, statement: "Miranda accepts what her sister's side of the room looks like.",      answer: "A" },
        { id: 21, statement: "Jamie complains that his brother refuses to share his electronic equipment.", answer: "B" },
        { id: 22, statement: "Miranda is annoyed about some things that her sister tells their mother.",    answer: "A" },
        { id: 23, statement: "Miranda was surprised that she felt lonely when her sister was away.",        answer: "A" },
        { id: 24, statement: "Despite sharing a bedroom, Jamie finds he can still easily do his homework.", answer: "B" },
        { id: 25, statement: "Jamie and Miranda can both share problems with their brother or sister.",     answer: "A" }
      ]
    }
  ]
};
