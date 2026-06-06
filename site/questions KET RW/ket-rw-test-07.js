// Cambridge KET (Key English Test) — Paper 1 Reading and Writing — Test 7
// VERBATIM transcription from the official Cambridge KET 2 book · Test 3.
// 9 parts · 56 questions · 1 hour 10 minutes.

window.KET_RW_TEST = {
  testInfo: {
    id: "ket-rw-07",
    title: "KET Reading & Writing — Test 7",
    paper: "Paper 1",
    level: "A2",
    totalTime: 70,
    totalQuestions: 56,
    parts: 9
  },

  parts: [

    // ─────────────────── PART 1 (Q1–5) ───────────────────
    {
      partNumber: 1,
      label: "PART 1",
      questionsLabel: "QUESTIONS 1–5",
      type: "match-notices",
      instruction: [
        "Which notice (A–H) says this (1–5)?",
        "For questions 1–5, mark the correct letter A–H on the answer sheet."
      ],
      example: { number: 0, prompt: "Don't bring your dog in here.", answer: "F" },
      notices: [
        { letter: "A", text: "KEEP IN FRIDGE" },
        { letter: "B", text: "Door\nlocked at midnight —\nask for key before going\nout." },
        { letter: "C", text: "SOUP AND HOT PIES ONLY" },
        { letter: "D", text: "TICKETS FOR OASIS\nCONCERT ON SALE HERE\nfrom 8 p.m." },
        { letter: "E", text: "ALL THIS WEEK\nBUY 5\nGET 1 FREE" },
        { letter: "F", text: "NO ANIMALS IN\nRESTAURANT" },
        { letter: "G", text: "ALL TICKETS SOLD" },
        { letter: "H", text: "USE BY 19 JULY" }
      ],
      items: [
        { id: 1, prompt: "These are cheaper if you buy several of them.", answer: "E" },
        { id: 2, prompt: "You can't get many different meals here.",      answer: "C" },
        { id: 3, prompt: "Put this in a cold place.",                     answer: "A" },
        { id: 4, prompt: "You are too late to get a seat for this show.", answer: "G" },
        { id: 5, prompt: "This place is not open all night.",             answer: "B" }
      ]
    },

    // ─────────────────── PART 2 (Q6–10) ──────────────────
    {
      partNumber: 2,
      label: "PART 2",
      questionsLabel: "QUESTIONS 6–10",
      type: "mcq-gap-fill-sentences",
      instruction: [
        "Read the sentences (6–10) about Lisa and her friend, Jane.",
        "Choose the best word (A, B or C) for each space.",
        "For questions 6–10, mark A, B or C on the answer sheet."
      ],
      example: {
        number: 0,
        sentence: "Lisa _____ her friend Jane on the phone.",
        options: [
          { letter: "A", text: "spoke" },
          { letter: "B", text: "talked" },
          { letter: "C", text: "called" }
        ],
        answer: "C"
      },
      items: [
        { id: 6,  sentence: "'Let's get a video and _____ it at my house this evening,' she said.", options: [ { letter: "A", text: "look" }, { letter: "B", text: "watch" }, { letter: "C", text: "listen" } ], answer: "B" },
        { id: 7,  sentence: "'That's a great _____!' said Jane. 'I've got nothing else to do.'", options: [ { letter: "A", text: "pity" }, { letter: "B", text: "thing" }, { letter: "C", text: "idea" } ], answer: "C" },
        { id: 8,  sentence: "They went to the video shop and _____ a film with their favourite actor in it.", options: [ { letter: "A", text: "chose" }, { letter: "B", text: "decided" }, { letter: "C", text: "thought" } ], answer: "A" },
        { id: 9,  sentence: "Then they bought some _____ of cola to drink and a big bag of sweets.", options: [ { letter: "A", text: "plates" }, { letter: "B", text: "cups" }, { letter: "C", text: "cans" } ], answer: "C" },
        { id: 10, sentence: "They took everything back to Lisa's house and _____ the film together.", options: [ { letter: "A", text: "enjoyed" }, { letter: "B", text: "laughed" }, { letter: "C", text: "liked" } ], answer: "A" }
      ]
    },

    // ─────────────────── PART 3 (Q11–15) ─────────────────
    {
      partNumber: 3,
      partLetter: "a",
      label: "PART 3",
      questionsLabel: "QUESTIONS 11–15",
      type: "mcq-response",
      instruction: [
        "Complete the five conversations.",
        "For questions 11–15, mark A, B or C on the answer sheet."
      ],
      example: {
        number: 0,
        prompt: "What's the time?",
        options: [
          { letter: "A", text: "Tuesday." },
          { letter: "B", text: "Half past eight." },
          { letter: "C", text: "1998." }
        ],
        answer: "B"
      },
      items: [
        { id: 11, prompt: "Let's walk to the park.", options: [ { letter: "A", text: "All right." }, { letter: "B", text: "I think so." }, { letter: "C", text: "I'm sorry." } ], answer: "A" },
        { id: 12, prompt: "When did you arrive?", options: [ { letter: "A", text: "Tomorrow." }, { letter: "B", text: "Yesterday." }, { letter: "C", text: "For two days." } ], answer: "B" },
        { id: 13, prompt: "Shall I open the window?", options: [ { letter: "A", text: "Yes, I shall." }, { letter: "B", text: "Yes, you will." }, { letter: "C", text: "Yes, please." } ], answer: "C" },
        { id: 14, prompt: "I got a letter from Paul this morning.", options: [ { letter: "A", text: "I'm afraid not." }, { letter: "B", text: "That's nice." }, { letter: "C", text: "He's fine." } ], answer: "B" },
        { id: 15, prompt: "How's your sister?", options: [ { letter: "A", text: "She's Jane." }, { letter: "B", text: "She's at school." }, { letter: "C", text: "She's very well." } ], answer: "C" }
      ]
    },

    // ─────────────── PART 3 (Q16–20) ────────────────
    {
      partNumber: 3,
      partLetter: "b",
      questionsLabel: "QUESTIONS 16–20",
      type: "match-dialogue",
      instruction: [
        "Complete the conversation.",
        "What does the tourist say to the shop assistant?",
        "For questions 16–20, mark the correct letter A–H on the answer sheet."
      ],
      example: { number: 0, answer: "D" },
      dialogue: [
        { speaker: "Assistant", line: "Good morning. Can I help you?" },
        { speaker: "Tourist",   gap: 0 },
        { speaker: "Assistant", line: "For children or adults?" },
        { speaker: "Tourist",   gap: 16 },
        { speaker: "Assistant", line: "A lot of tourists buy this one." },
        { speaker: "Tourist",   gap: 17 },
        { speaker: "Assistant", line: "What about this one with fewer pages?" },
        { speaker: "Tourist",   gap: 18 },
        { speaker: "Assistant", line: "The hardback is £8, and the paperback £3.50." },
        { speaker: "Tourist",   gap: 19 },
        { speaker: "Assistant", line: "Fine. Shall I put it in a bag for you?" },
        { speaker: "Tourist",   gap: 20 },
        { speaker: "Assistant", line: "Here you are. Thank you." },
        { speaker: "Tourist",   line: "Thanks. Goodbye." }
      ],
      options: [
        { letter: "A", text: "I'll take the cheaper one." },
        { letter: "B", text: "Oh, it's for me. I want a guide book." },
        { letter: "C", text: "I haven't got any children." },
        { letter: "D", text: "Yes, please. I'd like a book about London." },
        { letter: "E", text: "No, thank you. I want to use it now." },
        { letter: "F", text: "That's very heavy. Have you got a smaller one?" },
        { letter: "G", text: "Is it a good book?" },
        { letter: "H", text: "That looks better. How much is it?" }
      ],
      items: [
        { id: 16, answer: "B" },
        { id: 17, answer: "F" },
        { id: 18, answer: "H" },
        { id: 19, answer: "A" },
        { id: 20, answer: "E" }
      ]
    },

    // ─────────────────── PART 4 (Q21–27) ─────────────────
    {
      partNumber: 4,
      label: "PART 4",
      questionsLabel: "QUESTIONS 21–27",
      type: "mcq-passage-stems",
      instruction: [
        "Read the article about a young woman and then answer the questions.",
        "For questions 21–27, mark A, B or C on the answer sheet."
      ],
      articleTitle: "REBECCA STEVENS",
      article:
        "Rebecca Stevens was the first woman to climb Mount Everest. Before she went up the highest mountain in the world, she was a journalist and lived in a small flat in south London.\n\n" +
        "In 1993, Rebecca left her job and her family and travelled to Asia with some other climbers. She found that life on Everest is hard. 'You must carry everything on your back,' she explained, 'so you can only take things that you will need. You can't wash on the mountain, and in the end I didn't even take a toothbrush. I am usually a clean person but there is no water, only snow. Water is very heavy so you only take enough to drink!'\n\n" +
        "When Rebecca reached the top of Mount Everest on May 17 1993, it was the best moment of her life. Suddenly she became famous.\n\n" +
        "Now she has written a book about the trip and people often ask her to talk about it. She has a new job too, on a science programme on television.\n\n" +
        "Rebecca is well known today and she has more money, but she still lives in the little flat in south London among her pictures and books about mountains!",
      example: {
        number: 0,
        stem: "Everest is a",
        options: [
          { letter: "A", text: "country." },
          { letter: "B", text: "mountain." },
          { letter: "C", text: "town." }
        ],
        answer: "B"
      },
      items: [
        { id: 21, stem: "Before Rebecca climbed Everest, she worked for", options: [ { letter: "A", text: "a bookshop." }, { letter: "B", text: "a newspaper." }, { letter: "C", text: "a travel agent." } ], answer: "B" },
        { id: 22, stem: "Rebecca went to Everest", options: [ { letter: "A", text: "with her family." }, { letter: "B", text: "with a climbing group." }, { letter: "C", text: "without anyone." } ], answer: "B" },
        { id: 23, stem: "Rebecca didn't take much luggage because she", options: [ { letter: "A", text: "didn't have many things." }, { letter: "B", text: "had a bad back." }, { letter: "C", text: "had to carry it herself." } ], answer: "C" },
        { id: 24, stem: "Rebecca didn't wash on Everest because", options: [ { letter: "A", text: "it was too cold." }, { letter: "B", text: "there was not enough water." }, { letter: "C", text: "she is a dirty person." } ], answer: "B" },
        { id: 25, stem: "Rebecca carried water for", options: [ { letter: "A", text: "drinking." }, { letter: "B", text: "cooking." }, { letter: "C", text: "cleaning her teeth." } ], answer: "A" },
        { id: 26, stem: "Rebecca became famous when she", options: [ { letter: "A", text: "got to the highest place in the world." }, { letter: "B", text: "wrote a book about her trip." }, { letter: "C", text: "was on a television programme." } ], answer: "A" },
        { id: 27, stem: "After her trip, Rebecca", options: [ { letter: "A", text: "earned the same money." }, { letter: "B", text: "stayed in the same flat." }, { letter: "C", text: "did the same job." } ], answer: "B" }
      ]
    },

    // ─────────────────── PART 5 (Q28–35) ─────────────────
    {
      partNumber: 5,
      label: "PART 5",
      questionsLabel: "QUESTIONS 28–35",
      type: "mcq-cloze-passage",
      instruction: [
        "Read the article about the ostrich.",
        "Choose the best word (A, B or C) for each space (28–35).",
        "For questions 28–35, mark A, B or C on the answer sheet."
      ],
      passageTitle: "THE OSTRICH",
      passage:
        "The ostrich is the {0} bird in the world, and an adult can be more {28} 90 kilos. Most wild ostriches live {29} southern Africa, but there are only a {30} of them left. Like all birds, ostriches have wings, {31} they cannot fly. They use {32} wings to help them turn when they are running. Ostriches can run very fast, from 65 to 90 kilometres {33} hour, so it is very difficult {34} other animals to catch them.\n\n" +
        "Baby ostriches are the same size as chickens and take about 3 years to become adults. Ostriches {35} plants and can live for many days without water.",
      example: {
        number: 0,
        options: [
          { letter: "A", text: "large" },
          { letter: "B", text: "larger" },
          { letter: "C", text: "largest" }
        ],
        answer: "C"
      },
      items: [
        { id: 28, options: [ { letter: "A", text: "than" },  { letter: "B", text: "of" },    { letter: "C", text: "like" } ],  answer: "A" },
        { id: 29, options: [ { letter: "A", text: "on" },    { letter: "B", text: "in" },    { letter: "C", text: "at" } ],    answer: "B" },
        { id: 30, options: [ { letter: "A", text: "few" },   { letter: "B", text: "little" },{ letter: "C", text: "lot" } ],   answer: "A" },
        { id: 31, options: [ { letter: "A", text: "or" },    { letter: "B", text: "and" },   { letter: "C", text: "but" } ],   answer: "C" },
        { id: 32, options: [ { letter: "A", text: "them" },  { letter: "B", text: "their" }, { letter: "C", text: "its" } ],   answer: "B" },
        { id: 33, options: [ { letter: "A", text: "a" },     { letter: "B", text: "an" },    { letter: "C", text: "one" } ],   answer: "B" },
        { id: 34, options: [ { letter: "A", text: "for" },   { letter: "B", text: "to" },    { letter: "C", text: "by" } ],    answer: "A" },
        { id: 35, options: [ { letter: "A", text: "ate" },   { letter: "B", text: "eats" },  { letter: "C", text: "eat" } ],   answer: "C" }
      ]
    },

    // ─────────────────── PART 6 (Q36–40) ─────────────────
    {
      partNumber: 6,
      label: "PART 6",
      questionsLabel: "QUESTIONS 36–40",
      type: "vocab-first-letter",
      instruction: [
        "Read the descriptions (36–40) of some things you can find in a house.",
        "What is the word for each description?",
        "The first letter is already there. There is one space for each other letter in the word.",
        "For questions 36–40, write the words on the answer sheet."
      ],
      example: {
        number: 0,
        prompt: "You sleep in this at night.",
        firstLetter: "b",
        answer: "bed"
      },
      items: [
        { id: 36, prompt: "People sit round this to eat their meals.",         firstLetter: "t", letters: 5, answer: "table"    },
        { id: 37, prompt: "You can keep your clothes in this.",                firstLetter: "c", letters: 8, answer: "cupboard" },
        { id: 38, prompt: "You wash yourself with soap and water in this.",    firstLetter: "s", letters: 6, answer: "shower"   },
        { id: 39, prompt: "You look through this to see outside.",             firstLetter: "w", letters: 6, answer: "window"   },
        { id: 40, prompt: "People often put books or flowers on this.",        firstLetter: "s", letters: 5, answer: "shelf"    }
      ]
    },

    // ─────────────────── PART 7 (Q41–50) ─────────────────
    {
      partNumber: 7,
      label: "PART 7",
      questionsLabel: "QUESTIONS 41–50",
      type: "open-cloze-letter",
      instruction: [
        "Complete these letters.",
        "Write ONE word for each space (41–50).",
        "For questions 41–50, write your words on the answer sheet."
      ],
      letters: [
        {
          header: "",
          greeting: "Dear Jacqueline,",
          body:
            "Would you (Example: like) to come {41} the cinema {42} me after school today? We can go to see Pocahontas at the ABC cinema. The film starts {43} 6 o'clock. Shall {44} meet outside the cinema?",
          closing: "Love,\nIsabella"
        },
        {
          header: "",
          greeting: "Dear Isabella,",
          body:
            "I am very sorry but I can't go to the cinema {45} evening. My mother has {46} work, and I {47} going to cook dinner.\n\n" +
            "Why don't you {48} Karen to go? I hope {49} like the film. You can tell me {50} about it tomorrow.",
          closing: "Love,\nJacqueline"
        }
      ],
      example: { number: 0, answer: "like" },
      items: [
        { id: 41, answer: "to" },
        { id: 42, answer: "with" },
        { id: 43, answer: "at" },
        { id: 44, answer: "we" },
        { id: 45, answer: "this" },
        { id: 46, answer: "to" },
        { id: 47, answer: "am" },
        { id: 48, answer: "ask" },
        { id: 49, answer: "you" },
        { id: 50, answer: "about" }
      ]
    },

    // ─────────────────── PART 8 (Q51–55) ─────────────────
    {
      partNumber: 8,
      label: "PART 8",
      questionsLabel: "QUESTIONS 51–55",
      type: "info-transfer-notes",
      instruction: [
        "Read the letter and the information about Mr Ando, who is staying at a hotel in Leeds.",
        "Fill in the Hotel Registration Form.",
        "For questions 51–55, write the information on the answer sheet."
      ],
      notice: {
        title: "OXFORD WORLD COMPUTERS",
        body:
          "Toshi Ando\nEngineer\n\n" +
          "Date and place of birth: 12.03.76\nTokyo, Japan\n\n" +
          "Married, no children"
      },
      note: {
        dateLine: "Grange Hotel, Leeds\nSunday 14 April",
        body:
          "Dear Joe,\n\n" +
          "We like Oxford and I love my job there. We're renting a nice house at 23 Mount Road. We arrived in Leeds yesterday and will go back to Oxford tomorrow. I am here for a meeting and my wife, Keiko, has come too. She has a job as a teacher in Oxford. We will return to Japan next year.",
        signature: "Yours,\nToshi"
      },
      notesTitle: "HOTEL REGISTRATION FORM",
      notesSubtitle: "",
      rows: [
        { label: "Name:", prefilled: "Toshi Ando" },
        { label: "UK address:", id: 51, answer: "23 Mount Road, Oxford" },
        { label: "Nationality:", id: 52, answer: "Japanese" },
        { label: "Occupation:", id: 53, answer: "computer engineer" },
        { label: "Name of wife/husband:", id: 54, answer: "Keiko Ando" },
        { label: "Leaving date:", id: 55, answer: "Monday 15th April" }
      ]
    },

    // ─────────────────── PART 9 (Q56) ────────────────────
    {
      partNumber: 9,
      label: "PART 9",
      questionsLabel: "QUESTION 56",
      type: "writing-postcard",
      instruction: [
        "You are going to have a party. Write a note to a friend:",
        "— Ask your friend to come.",
        "— Say when and where the party is."
      ],
      prompt: "",
      promptSignature: "",
      wordCount: "25–35 words",
      footer: [
        "Write 25–35 words.",
        "Write your note on the answer sheet."
      ],
      items: [
        { id: 56, type: "free-text", minWords: 25, maxWords: 35 }
      ]
    }
  ]
};
