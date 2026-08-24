// Cambridge PET (Preliminary English Test) for Schools — Listening — Test 4
// VERBATIM from "Preliminary English Test for Schools 1" (Cambridge UP, 2010).
// Paper 2 Listening: ~35 min · 4 parts · 25 questions.
// Source pages: Test 4 listening = pp.84-90; key = p.147 of book.
// Part 1 image cells cropped + ESRGAN-upscaled from book pp.84-86.

window.PET_L_TEST = {
  testInfo: {
    id: "pet-l-04",
    title: "PET Listening — Test 4",
    paper: "Paper 2 · Listening",
    level: "B1",
    totalTime: 35,
    totalQuestions: 25,
    parts: 4
  },

  audio: {
    base: "https://storage.googleapis.com/mockstream-listening-audio/PET-Listening/test4/",
    files: { 1: "PART1.m4a", 2: "PART2.m4a", 3: "PART3.m4a", 4: "PART4.m4a" }
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–7",
      type: "picture-mcq",
      instruction: [
        "There are seven questions in this part.",
        "For each question, there are three pictures and a short recordings.",
        "For each question, choose the correct answer A, B or C."
      ],
      imageBase: "https://storage.googleapis.com/mockstream-listening-audio/PET-Listening/test4/p1/",
      example: {
        number: 0,
        question: "Where is the girl's hat?",
        options: [ { letter: "A", image: "q0A.png" }, { letter: "B", image: "q0B.png" }, { letter: "C", image: "q0C.png" } ],
        answer: "A"
      },
      items: [
        { id: 1, question: "When will Jack's mum pick him up?",
          options: [ { letter: "A", image: "q1A.png" }, { letter: "B", image: "q1B.png" }, { letter: "C", image: "q1C.png" } ],
          answer: "B" },
        { id: 2, question: "Which postcard will they send?",
          options: [ { letter: "A", image: "q2A.png" }, { letter: "B", image: "q2B.png" }, { letter: "C", image: "q2C.png" } ],
          answer: "A" },
        { id: 3, question: "What do they decide to buy?",
          options: [ { letter: "A", image: "q3A.png" }, { letter: "B", image: "q3B.png" }, { letter: "C", image: "q3C.png" } ],
          answer: "A" },
        { id: 4, question: "What has the girl forgotten to bring?",
          options: [ { letter: "A", image: "q4A.png" }, { letter: "B", image: "q4B.png" }, { letter: "C", image: "q4C.png" } ],
          answer: "B" },
        { id: 5, question: "How does the man want his son to help him?",
          options: [ { letter: "A", image: "q5A.png" }, { letter: "B", image: "q5B.png" }, { letter: "C", image: "q5C.png" } ],
          answer: "C" },
        { id: 6, question: "Which TV programme is on at nine o'clock tonight?",
          options: [ { letter: "A", image: "q6A.png" }, { letter: "B", image: "q6B.png" }, { letter: "C", image: "q6C.png" } ],
          answer: "C" },
        { id: 7, question: "What will the boy do first?",
          options: [ { letter: "A", image: "q7A.png" }, { letter: "B", image: "q7B.png" }, { letter: "C", image: "q7C.png" } ],
          answer: "A" }
      ]
    },

    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 8–13",
      type: "mcq-conversation",
      instruction: [
        "You will hear an interview with a champion gymnast called Maria Anderson.",
        "For each question, choose the correct answer A, B or C."
      ],
      items: [
        { id: 8, stem: "Maria decided to take up gymnastics",
          options: [
            { letter: "A", text: "at a gymnastics competition." },
            { letter: "B", text: "in a sports lesson at the school." },
            { letter: "C", text: "when she read a book about a gymnast." }
          ], answer: "A" },
        { id: 9, stem: "When did Maria realise she could be champion gymnast?",
          options: [
            { letter: "A", text: "when she won some local competitions" },
            { letter: "B", text: "as soon as she started to practise gymnastics" },
            { letter: "C", text: "when a well-known coach offered to teach her" }
          ], answer: "C" },
        { id: 10, stem: "Why does Maria think success has not changed her?",
          options: [
            { letter: "A", text: "She believes she's a sensible person." },
            { letter: "B", text: "Her parents help her live a normal life." },
            { letter: "C", text: "People tell her she's the same as before." }
          ], answer: "A" },
        { id: 11, stem: "What does Maria say about school?",
          options: [
            { letter: "A", text: "She feels too tired to study." },
            { letter: "B", text: "She has little time with school friends." },
            { letter: "C", text: "She is allowed to miss some lessons." }
          ], answer: "B" },
        { id: 12, stem: "What does Maria do in her free time?",
          options: [
            { letter: "A", text: "make videos" },
            { letter: "B", text: "go to concerts" },
            { letter: "C", text: "watch cartoon films" }
          ], answer: "A" },
        { id: 13, stem: "What is Maria's favourite thing in her room at home?",
          options: [
            { letter: "A", text: "a poster of a band with a singer" },
            { letter: "B", text: "a glass case with her cups and prizes" },
            { letter: "C", text: "a picture of herself with another gymnast" }
          ], answer: "C" }
      ]
    },

    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 14–19",
      type: "note-completion",
      instruction: [
        "You will hear a schoolteacher talking to a group of students about a national poetry competition.",
        "For each question, fill in the missing information in the numbered space."
      ],
      noteTitle: "Poetry Competition for Schools",
      rows: [
        { label: "The competition for 11-14s is called the",      id: 14, suffix: "Prize.",            answer: "Tiger" },
        { label: "The topic for this year is",                     id: 15,                              answer: "Change" },
        { label: "The title of last year's winning poem was",     id: 16,                              answer: "Trains" },
        { label: "This year the prize money available is",        id: 17, suffix: "euros.",            answer: "2000" },
        { label: "If successful, the school will spend the money on the", id: 18,                              answer: "library" },
        { label: "For further help, see the",                      id: 19,                              answer: "website" }
      ]
    },

    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 20–25",
      type: "true-false",
      instruction: [
        "Look at the six sentences for this part.",
        "You will hear a conversation between a boy called Lucas and a girl called Claire who have just been to a concert by a band called Candy Floss.",
        "Decide if each sentence is correct or incorrect.",
        "If it is correct, choose the letter A for YES. If it is not correct, choose the letter B for NO."
      ],
      scenario: "Lucas and Claire — after a Candy Floss concert",
      items: [
        { id: 20, statement: "Claire could see the band clearly from where she sat.",                  answer: "A" },
        { id: 21, statement: "Lucas thinks Candy Floss gave a great performance during the concert.",   answer: "A" },
        { id: 22, statement: "Claire feels the band's dancing was better in the summer.",               answer: "B" },
        { id: 23, statement: "Lucas and Claire have the same opinion about the band's costumes.",       answer: "B" },
        { id: 24, statement: "Claire is planning to buy the next album by Candy Floss.",                answer: "A" },
        { id: 25, statement: "Lucas thinks tickets for the next concert will be difficult to get.",     answer: "B" }
      ]
    }
  ]
};
