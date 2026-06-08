// Cambridge KET (Key English Test) — Paper 1 Reading and Writing — Test 9
// VERBATIM transcription from the official Cambridge KET Book 3 · Test 1.
// 9 parts · 56 questions · 1 hour 10 minutes.

window.KET_RW_TEST = {
  testInfo: {
    id: "ket-rw-09",
    title: "KET Reading & Writing — Test 9",
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
      example: { number: 0, prompt: "We work fast.", answer: "H" },
      notices: [
        { letter: "A", text: "YOUTH CLUB\nUnder 16s only" },
        { letter: "B", text: "Half-price drinks\nwith 3-course meals!" },
        { letter: "C", text: "CITY CENTRE\nCLOSED TO TRAFFIC\nALL DAY TODAY" },
        { letter: "D", text: "Tourist Information\nopen 24 hours" },
        { letter: "E", text: "NO PETROL STATION\nON MOTORWAY" },
        { letter: "F", text: "TURNER TRAVEL\nFly away to the sun\nthis summer" },
        { letter: "G", text: "SCHOOL OFFICE\nCLOSED FOR LUNCH" },
        { letter: "H", text: "We repair shoes QUICKLY\n8 a.m. – 5 p.m." }
      ],
      items: [
        { id: 1, prompt: "This is not for adults.",         answer: "A" },
        { id: 2, prompt: "You can't drive this way.",       answer: "C" },
        { id: 3, prompt: "We can help you day and night.",  answer: "D" },
        { id: 4, prompt: "You can have dinner here.",       answer: "B" },
        { id: 5, prompt: "Come here to book a holiday.",    answer: "F" }
      ]
    },

    // ─────────────────── PART 2 (Q6–10) ──────────────────
    {
      partNumber: 2,
      label: "PART 2",
      questionsLabel: "QUESTIONS 6–10",
      type: "mcq-gap-fill-sentences",
      instruction: [
        "Read the sentences (6–10) about Sam's new computer.",
        "Choose the best word (A, B or C) for each space.",
        "For questions 6–10, mark A, B or C on the answer sheet."
      ],
      example: {
        number: 0,
        sentence: "Sam's father _____ him a new computer for his birthday.",
        options: [
          { letter: "A", text: "bought" },
          { letter: "B", text: "paid" },
          { letter: "C", text: "spent" }
        ],
        answer: "A"
      },
      items: [
        { id: 6,  sentence: "He _____ Sam how to use it.", options: [ { letter: "A", text: "learnt" }, { letter: "B", text: "showed" }, { letter: "C", text: "studied" } ], answer: "B" },
        { id: 7,  sentence: "Sam sent an e-mail _____ to his friend Billy to tell him about his nice present.", options: [ { letter: "A", text: "message" }, { letter: "B", text: "programme" }, { letter: "C", text: "form" } ], answer: "A" },
        { id: 8,  sentence: "Billy came to Sam's house and they did their geography _____ together.", options: [ { letter: "A", text: "subject" }, { letter: "B", text: "homework" }, { letter: "C", text: "class" } ], answer: "B" },
        { id: 9,  sentence: "They were _____ because they found some information about rivers on the internet.", options: [ { letter: "A", text: "happy" }, { letter: "B", text: "interesting" }, { letter: "C", text: "pleasant" } ], answer: "A" },
        { id: 10, sentence: "Afterwards, they _____ playing a new computer game together.", options: [ { letter: "A", text: "wanted" }, { letter: "B", text: "thanked" }, { letter: "C", text: "enjoyed" } ], answer: "C" }
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
        prompt: "Where do you come from?",
        options: [
          { letter: "A", text: "New York." },
          { letter: "B", text: "School." },
          { letter: "C", text: "Home." }
        ],
        answer: "A"
      },
      items: [
        { id: 11, prompt: "Who's that man with the green sweater?", options: [ { letter: "A", text: "He's my brother." }, { letter: "B", text: "It's John's." }, { letter: "C", text: "I don't know it." } ], answer: "A" },
        { id: 12, prompt: "Where's Amanda gone?", options: [ { letter: "A", text: "She's at the station." }, { letter: "B", text: "She'll arrive tomorrow." }, { letter: "C", text: "She's going to leave tonight." } ], answer: "A" },
        { id: 13, prompt: "I hate shopping.", options: [ { letter: "A", text: "So do I." }, { letter: "B", text: "Certainly." }, { letter: "C", text: "That's all right." } ], answer: "A" },
        { id: 14, prompt: "How long did the journey take?", options: [ { letter: "A", text: "About 500 kilometres." }, { letter: "B", text: "Almost 5 hours." }, { letter: "C", text: "Last week." } ], answer: "B" },
        { id: 15, prompt: "The room costs £55 a night.", options: [ { letter: "A", text: "I don't take it." }, { letter: "B", text: "Give me two, please." }, { letter: "C", text: "That's a lot." } ], answer: "C" }
      ]
    },

    // ─────────────── PART 3 (Q16–20) ────────────────
    {
      partNumber: 3,
      partLetter: "b",
      questionsLabel: "QUESTIONS 16–20",
      type: "match-dialogue",
      instruction: [
        "Complete the conversation in a garage.",
        "What does David say to the mechanic?",
        "For questions 16–20, mark the correct letter A–H on the answer sheet."
      ],
      example: { number: 0, answer: "E" },
      dialogue: [
        { speaker: "Mechanic", line: "Good morning. How can I help you?" },
        { speaker: "David",    gap: 0 },
        { speaker: "Mechanic", line: "Certainly. What's the problem?" },
        { speaker: "David",    gap: 16 },
        { speaker: "Mechanic", line: "How long have you had the car?" },
        { speaker: "David",    gap: 17 },
        { speaker: "Mechanic", line: "Hm, there may be something wrong with the engine." },
        { speaker: "David",    gap: 18 },
        { speaker: "Mechanic", line: "I'm afraid we have a lot of work at the moment. I can't do it until Friday." },
        { speaker: "David",    gap: 19 },
        { speaker: "Mechanic", line: "Well, I suppose I can do it on Wednesday." },
        { speaker: "David",    gap: 20 },
        { speaker: "Mechanic", line: "Bring it in at 8.30 in the morning." }
      ],
      options: [
        { letter: "A", text: "Oh dear. Can you repair it now?" },
        { letter: "B", text: "That will be fine." },
        { letter: "C", text: "Thanks. How much will it cost?" },
        { letter: "D", text: "It's only Monday today. I'll go to another garage." },
        { letter: "E", text: "Would you have a look at my car, please?" },
        { letter: "F", text: "I bought it new about four years ago." },
        { letter: "G", text: "Could you do it in an hour?" },
        { letter: "H", text: "It won't start in the morning." }
      ],
      items: [
        { id: 16, answer: "H" },
        { id: 17, answer: "F" },
        { id: 18, answer: "A" },
        { id: 19, answer: "D" },
        { id: 20, answer: "B" }
      ]
    },

    // ─────────────────── PART 4 (Q21–27) ─────────────────
    {
      partNumber: 4,
      label: "PART 4",
      questionsLabel: "QUESTIONS 21–27",
      type: "mcq-passage-rws",
      instruction: [
        "Read the article about Howard Bonnier.",
        "Are sentences 21–27 'Right' (A) or 'Wrong' (B)?",
        "If there is not enough information to answer 'Right' (A) or 'Wrong' (B), choose 'Doesn't say' (C).",
        "For questions 21–27, mark A, B or C on the answer sheet."
      ],
      articleTitle: "HOWARD BONNIER",
      article:
        "Bray is a beautiful village about fifty kilometres west of London. A young Englishman named Howard Bonnier opened a restaurant called The Palace there about three and a half months ago. Not many people in Britain know Mr Bonnier's name yet, but he's already quite famous in France. This is because he has written in French magazines about almost all the best restaurants in that country. He's only 29 years old.\n\n" +
        "When Howard was a teenager, he often went to restaurants with his mother and father. He liked doing this so much that he decided not to buy lots of clothes and CDs; instead, he used his money to visit France and eat in good restaurants. He also bought a lot of French and English cookbooks — he says he has more than two hundred and fifty!\n\n" +
        "So why did he decide to open a restaurant? Simply because he loves cooking. Has it been an easy thing to do? He says it's expensive to start your own restaurant and it's much more difficult to cook for fifty people than to cook for your family, but he's sure he's done the right thing.",
      example: { number: 0, statement: "Howard is French.", answer: "B" },
      items: [
        { id: 21, statement: "The Palace has been open for less than a year.",   answer: "A" },
        { id: 22, statement: "Lots of people in France know about Howard.",       answer: "A" },
        { id: 23, statement: "Howard's parents took him out to restaurants.",     answer: "A" },
        { id: 24, statement: "Howard has always spent a lot of money on clothes.", answer: "B" },
        { id: 25, statement: "Howard has written books about French cooking.",     answer: "C" },
        { id: 26, statement: "It costs a lot of money to eat in Howard's restaurant.", answer: "C" },
        { id: 27, statement: "Howard says cooking for a lot of people is easy.",   answer: "B" }
      ]
    },

    // ─────────────────── PART 5 (Q28–35) ─────────────────
    {
      partNumber: 5,
      label: "PART 5",
      questionsLabel: "QUESTIONS 28–35",
      type: "mcq-cloze-passage",
      instruction: [
        "Read the article about line dancing.",
        "Choose the best word (A, B or C) for each space (28–35).",
        "For questions 28–35, mark A, B or C on the answer sheet."
      ],
      passageTitle: "Line dancing",
      passage:
        "Thousands of people in Britain {0} a new hobby — line dancing. In almost {28} town, you will find clubs and classes for this new activity.\n\n" +
        "'Line dancing is easy to learn. If you have two feet and can walk, then you can do it!' Fiona Lever, a teacher, {29}. 'You don't need a partner because you dance {30} groups. It's the {31} way to make new friends. In my classes, {32} are young and old people. The boys like it because they can make a lot of noise with their feet {33} the dances!'\n\n" +
        "When {34} line dancing begin? Most people think it started about fifteen years {35} when American country music became famous in Britain.",
      example: {
        number: 0,
        options: [
          { letter: "A", text: "have" },
          { letter: "B", text: "has" },
          { letter: "C", text: "had" }
        ],
        answer: "A"
      },
      items: [
        { id: 28, options: [ { letter: "A", text: "every" },   { letter: "B", text: "all" },     { letter: "C", text: "any" } ],     answer: "C" },
        { id: 29, options: [ { letter: "A", text: "say" },     { letter: "B", text: "says" },    { letter: "C", text: "saying" } ],  answer: "B" },
        { id: 30, options: [ { letter: "A", text: "at" },      { letter: "B", text: "to" },      { letter: "C", text: "in" } ],      answer: "C" },
        { id: 31, options: [ { letter: "A", text: "best" },    { letter: "B", text: "better" },  { letter: "C", text: "good" } ],    answer: "A" },
        { id: 32, options: [ { letter: "A", text: "here" },    { letter: "B", text: "there" },   { letter: "C", text: "they" } ],    answer: "B" },
        { id: 33, options: [ { letter: "A", text: "among" },   { letter: "B", text: "across" },  { letter: "C", text: "during" } ],  answer: "C" },
        { id: 34, options: [ { letter: "A", text: "has" },     { letter: "B", text: "is" },      { letter: "C", text: "did" } ],     answer: "C" },
        { id: 35, options: [ { letter: "A", text: "after" },   { letter: "B", text: "ago" },     { letter: "C", text: "since" } ],   answer: "B" }
      ]
    },

    // ─────────────────── PART 6 (Q36–40) ─────────────────
    {
      partNumber: 6,
      label: "PART 6",
      questionsLabel: "QUESTIONS 36–40",
      type: "vocab-first-letter",
      instruction: [
        "Read the descriptions (36–40) of some things you may find in your bag.",
        "What is the word for each description?",
        "The first letter is already there. There is one space for each other letter in the word.",
        "For questions 36–40, write the words on the answer sheet."
      ],
      example: { number: 0, prompt: "You use this to write with.", firstLetter: "p", answer: "pen" },
      items: [
        { id: 36, prompt: "If you lose this, you won't be able to get into your house.",      firstLetter: "k", letters: 3, answer: "key"     },
        { id: 37, prompt: "Many people put these on when they want to read something.",       firstLetter: "g", letters: 7, answer: "glasses" },
        { id: 38, prompt: "People pay for things with this.",                                  firstLetter: "m", letters: 5, answer: "money"   },
        { id: 39, prompt: "If it has been windy, you may need to do your hair with this.",     firstLetter: "c", letters: 4, answer: "comb"    },
        { id: 40, prompt: "You write important dates in this so you don't forget them.",       firstLetter: "d", letters: 5, answer: "diary"   }
      ]
    },

    // ─────────────────── PART 7 (Q41–50) ─────────────────
    {
      partNumber: 7,
      label: "PART 7",
      questionsLabel: "QUESTIONS 41–50",
      type: "open-cloze-letter",
      instruction: [
        "Complete this letter.",
        "Write ONE word for each space (41–50).",
        "For questions 41–50, write your words on the answer sheet."
      ],
      letters: [
        {
          header: "",
          greeting: "Dear Lynne and Tony,",
          body:
            "I'm writing (Example: to) say thank you {41} the two nights I stayed in {42} lovely home. It {43} good to see you again.\n\n" +
            "Here {44} the photographs {45} your children that you asked for. They're good photos, aren't {46}? I hope you like {47}. I really love my new camera.\n\n" +
            "I {48} going to visit my sister in New York next week. I {49} take a lot of photos there, too. I haven't seen my sister for a long {50}.\n\nThanks again.",
          closing: "Love,\nRoy"
        }
      ],
      example: { number: 0, answer: "to" },
      items: [
        { id: 41, answer: "for" },
        { id: 42, answer: "your" },
        { id: 43, answer: "was" },
        { id: 44, answer: "are" },
        { id: 45, answer: "of" },
        { id: 46, answer: "they" },
        { id: 47, answer: "them" },
        { id: 48, answer: "am" },
        { id: 49, answer: "will" },
        { id: 50, answer: "time" }
      ]
    },

    // ─────────────────── PART 8 (Q51–55) ─────────────────
    {
      partNumber: 8,
      label: "PART 8",
      questionsLabel: "QUESTIONS 51–55",
      type: "info-transfer-notes",
      instruction: [
        "Read the two e-mail messages.",
        "Fill in the information on the visa application form.",
        "For questions 51–55, write the information on the answer sheet."
      ],
      notice: {
        title: "E-mail from Alice Silveiro",
        body:
          "To: Churchill Language School, Oxford\nFrom: Alice Silveiro\n\n" +
          "I would like to study at your school. I work in the reception of a hotel in my home town, Sao Paulo, Brazil, and English is important for my job.\n\n" +
          "Where can I stay in Oxford? I shall spend two months in Britain.\n\n" +
          "Alice Silveiro"
      },
      note: {
        dateLine: "",
        body:
          "To: Alice Silveiro\nFrom: Churchill Language School, Oxford\n\n" +
          "We have six-week courses for people who want to study English. There is a house for students next to the school, in Park Road, at number 26.\n\nYou will need a visa.",
        signature: "Churchill Language School"
      },
      notesTitle: "VISA APPLICATION FORM",
      notesSubtitle: "",
      rows: [
        { label: "Name:", prefilled: "Alice Silveiro" },
        { label: "Nationality:", id: 51, answer: "Brazilian" },
        { label: "Job:", id: 52, answer: "hotel receptionist" },
        { label: "Address in Britain:", id: 53, answer: "26 Park Road, Oxford" },
        { label: "Why are you visiting Britain?", id: 54, answer: "to study English" },
        { label: "How long will you stay?", id: 55, answer: "two months" }
      ]
    },

    // ─────────────────── PART 9 (Q56) ────────────────────
    {
      partNumber: 9,
      label: "PART 9",
      questionsLabel: "QUESTION 56",
      type: "writing-postcard",
      instruction: [
        "Read this postcard from your friend, Paul.",
        "Write Paul a postcard. Answer his questions."
      ],
      prompt:
        "I'm very pleased you're going to visit me on Saturday. How will you get here? What time will you arrive? What shall we do?\n\n" +
        "See you soon.",
      promptSignature: "Yours,\nPaul",
      wordCount: "25–35 words",
      footer: [
        "Write 25–35 words.",
        "Write your postcard on the answer sheet."
      ],
      items: [
        { id: 56, type: "free-text", minWords: 25, maxWords: 35, answer:
            "Dear Paul,\n" +
            "I'm going to visit you on Saturday.\n" +
            "I will come with my car. I will arrive on Saturday morning. First I want to see you, then we're going to the cinema. After that we're going to the football match.\n" +
            "See you on Saturday\n" +
            "Yours,\n" +
            "Diego" }
      ]
    }
  ]
};
