// Cambridge KET (Key English Test) — Paper 1 Reading and Writing — Test 11
// VERBATIM transcription from the official Cambridge KET Book 3 · Test 3.
// 9 parts · 56 questions · 1 hour 10 minutes.

window.KET_RW_TEST = {
  testInfo: {
    id: "ket-rw-11",
    title: "KET Reading & Writing — Test 11",
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
      example: { number: 0, prompt: "We sell clothes.", answer: "F" },
      notices: [
        // Notice A is rendered as an empty box in the source book.
        { letter: "A", text: "" },
        { letter: "B", text: "COFFEE MACHINE UPSTAIRS" },
        { letter: "C", text: "DANGER – FOG!\nMOTORWAY CLOSED" },
        { letter: "D", text: "COMPUTER ROOM\nNo food or drinks inside" },
        { letter: "E", text: "Restaurant closed\nTuesday and Thursday lunchtime" },
        { letter: "F", text: "Ladies' and children's\ncoats upstairs" },
        { letter: "G", text: "Kenyan Coffee Centre\nOpening hours:\n8 a.m. – 6 p.m. daily" },
        { letter: "H", text: "Under 12s swimming course\nSaturday 10 a.m." }
      ],
      items: [
        { id: 1, prompt: "This is only for young people.",                answer: "H" },
        { id: 2, prompt: "Go to the next floor if you want a drink.",      answer: "B" },
        { id: 3, prompt: "You cannot drive here today.",                   answer: "C" },
        { id: 4, prompt: "We are open every day.",                          answer: "G" },
        { id: 5, prompt: "Do not bring your lunch in here.",                answer: "D" }
      ]
    },

    // ─────────────────── PART 2 (Q6–10) ──────────────────
    {
      partNumber: 2,
      label: "PART 2",
      questionsLabel: "QUESTIONS 6–10",
      type: "mcq-gap-fill-sentences",
      instruction: [
        "Read the sentences (6–10) about a shopping trip.",
        "Choose the best word (A, B or C) for each space.",
        "For questions 6–10, mark A, B or C on the answer sheet."
      ],
      example: {
        number: 0,
        sentence: "Jack _____ to buy a new pair of shoes for school.",
        options: [
          { letter: "A", text: "enjoyed" },
          { letter: "B", text: "got" },
          { letter: "C", text: "needed" }
        ],
        answer: "C"
      },
      items: [
        { id: 6,  sentence: "He _____ a bus to the big department store in the centre of town.", options: [ { letter: "A", text: "travelled" }, { letter: "B", text: "went" }, { letter: "C", text: "took" } ], answer: "C" },
        { id: 7,  sentence: "The shoes were on the top _____ near to the café.", options: [ { letter: "A", text: "stairs" }, { letter: "B", text: "floor" }, { letter: "C", text: "room" } ], answer: "B" },
        { id: 8,  sentence: "The assistant showed Jack several pairs but they were all the _____ size.", options: [ { letter: "A", text: "wrong" }, { letter: "B", text: "different" }, { letter: "C", text: "big" } ], answer: "A" },
        { id: 9,  sentence: "Then he _____ on some red and black leather football boots.", options: [ { letter: "A", text: "tried" }, { letter: "B", text: "wore" }, { letter: "C", text: "chose" } ], answer: "A" },
        { id: 10, sentence: "'They're not too _____ so I'll have them,' Jack said.", options: [ { letter: "A", text: "high" }, { letter: "B", text: "great" }, { letter: "C", text: "expensive" } ], answer: "C" }
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
        "For conversations 11–15, mark A, B or C on the answer sheet."
      ],
      example: {
        number: 0,
        prompt: "How old are you?",
        options: [
          { letter: "A", text: "I'm 18." },
          { letter: "B", text: "I'm Sally." },
          { letter: "C", text: "I'm fine." }
        ],
        answer: "A"
      },
      items: [
        { id: 11, prompt: "It's my sister's birthday tomorrow!", options: [ { letter: "A", text: "Happy New Year!" }, { letter: "B", text: "Is she going to have a party?" }, { letter: "C", text: "How old are they?" } ], answer: "B" },
        { id: 12, prompt: "Mary will help the teacher.", options: [ { letter: "A", text: "Are you certain?" }, { letter: "B", text: "Do you understand?" }, { letter: "C", text: "Can you hear?" } ], answer: "A" },
        { id: 13, prompt: "I would like to see the doctor.", options: [ { letter: "A", text: "I hope you'll feel better soon." }, { letter: "B", text: "It hurts a lot." }, { letter: "C", text: "Have you got an appointment?" } ], answer: "C" },
        { id: 14, prompt: "Shall we leave now?", options: [ { letter: "A", text: "Have you got time?" }, { letter: "B", text: "Near the station?" }, { letter: "C", text: "I'd like to stay." } ], answer: "C" },
        { id: 15, prompt: "Anything else?", options: [ { letter: "A", text: "No, it isn't." }, { letter: "B", text: "Not at all." }, { letter: "C", text: "Not today, thanks." } ], answer: "C" }
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
        "What does Chris say to the waiter?",
        "For questions 16–20, mark the correct letter A–H on the answer sheet."
      ],
      example: { number: 0, answer: "G" },
      dialogue: [
        { speaker: "Waiter", line: "Good evening. Can I help you?" },
        { speaker: "Chris",  gap: 0 },
        { speaker: "Waiter", line: "I'm afraid we haven't got a table free at the moment." },
        { speaker: "Chris",  gap: 16 },
        { speaker: "Waiter", line: "About a quarter of an hour. Those people in the corner have nearly finished." },
        { speaker: "Chris",  gap: 17 },
        { speaker: "Waiter", line: "Of course. Can I bring you a drink?" },
        { speaker: "Chris",  gap: 18 },
        { speaker: "Waiter", line: "Certainly. Anything else I can do for you?" },
        { speaker: "Chris",  gap: 19 },
        { speaker: "Waiter", line: "There's a phone outside the kitchen." },
        { speaker: "Chris",  gap: 20 },
        { speaker: "Waiter", line: "I'll take them for you. Your table will be ready soon." }
      ],
      options: [
        { letter: "A", text: "I'd like a salad and a main course." },
        { letter: "B", text: "How long will we have to wait?" },
        { letter: "C", text: "Yes, we'll have two glasses of mineral water." },
        { letter: "D", text: "Right. Where can we leave our coats?" },
        { letter: "E", text: "I need to make a telephone call." },
        { letter: "F", text: "We'll go somewhere else." },
        { letter: "G", text: "Have you got a table for two, please?" },
        { letter: "H", text: "That's all right. Can we see the menu, please?" }
      ],
      items: [
        { id: 16, answer: "B" },
        { id: 17, answer: "H" },
        { id: 18, answer: "C" },
        { id: 19, answer: "E" },
        { id: 20, answer: "D" }
      ]
    },

    // ─────────────────── PART 4 (Q21–27) ─────────────────
    {
      partNumber: 4,
      label: "PART 4",
      questionsLabel: "QUESTIONS 21–27",
      type: "mcq-passage-rws",
      instruction: [
        "Read the article about some pop stars.",
        "Are sentences 21–27 'Right' (A) or 'Wrong' (B)?",
        "If there is not enough information to answer 'Right' (A) or 'Wrong' (B), choose 'Doesn't say' (C).",
        "For questions 21–27, mark A, B or C on the answer sheet."
      ],
      articleTitle: "HOW DO THE IRISH POP-GROUP 'BOYZONE' LIVE A HEALTHY LIFE?",
      article:
        "Stephen: Sleeping well is very important. When I can get home to my mother's house, I sleep for ten hours. But I find it very difficult to sleep at night after a concert because my head is full of music.\n\n" +
        "Keith: Sport is important. Before I had a car accident I was at the sports centre two and a half hours a day, five days a week. I can't do that now so I do about 150 sit-ups a day.\n\n" +
        "Ronan: I don't drink alcohol or smoke. I try to eat well. Also I drink a lot of water because it's good for your health. I should have about eight glasses a day but I don't always drink so much.\n\n" +
        "Shane: People shouldn't work all the time. I love my job but there are other things I like doing too. In my free time I just listen to music or watch TV. It's good for you to do nothing sometimes.\n\n" +
        "Mikey: I don't get tired any more since the doctor told me to eat better. Now I eat lots of things like carrots and spinach every day. But I still eat burgers sometimes!",
      example: { number: 0, statement: "Stephen sleeps well in his mother's house.", answer: "A" },
      items: [
        { id: 21, statement: "Stephen thinks a lot about music after a concert.",            answer: "A" },
        { id: 22, statement: "Keith's accident happened last year.",                         answer: "C" },
        { id: 23, statement: "Keith goes to the sports centre five days a week now.",         answer: "B" },
        { id: 24, statement: "Ronan thinks he drinks enough water every day.",                answer: "B" },
        { id: 25, statement: "Shane is only happy when he's working.",                        answer: "B" },
        { id: 26, statement: "Mikey was often tired before he started eating vegetables.",    answer: "A" },
        { id: 27, statement: "Mikey's favourite food is burgers.",                            answer: "C" }
      ]
    },

    // ─────────────────── PART 5 (Q28–35) ─────────────────
    {
      partNumber: 5,
      label: "PART 5",
      questionsLabel: "QUESTIONS 28–35",
      type: "mcq-cloze-passage",
      instruction: [
        "Read the article about a picture on a hill.",
        "Choose the best word (A, B or C) for each space (28–35).",
        "For questions 28–35, mark A, B or C on the answer sheet."
      ],
      passageTitle: "The Cerne Giant",
      passage:
        "Sherborne and Dorchester are two towns {0} the south of England that are quite near each other. On the road between them, {28} are a lot of green hills and fields. On one of {29} hills is a picture of a very large man. The man in the picture is called the Cerne Giant because the village that is {30} to him is called Cerne.\n\n" +
        "Nobody really {31} when the Cerne Giant was made, but people think that it was a very {32} time ago. To {33} nearer the picture, you can walk from Cerne. If you {34} on the first of May when the sun comes up, you will see all the people {35} the village dancing around the man on the hill.",
      example: {
        number: 0,
        options: [
          { letter: "A", text: "in" },
          { letter: "B", text: "on" },
          { letter: "C", text: "at" }
        ],
        answer: "A"
      },
      items: [
        { id: 28, options: [ { letter: "A", text: "there" },   { letter: "B", text: "here" },    { letter: "C", text: "they" } ],   answer: "A" },
        { id: 29, options: [ { letter: "A", text: "another" }, { letter: "B", text: "its" },     { letter: "C", text: "these" } ],  answer: "C" },
        { id: 30, options: [ { letter: "A", text: "beside" },  { letter: "B", text: "next" },    { letter: "C", text: "behind" } ], answer: "B" },
        { id: 31, options: [ { letter: "A", text: "known" },   { letter: "B", text: "knows" },   { letter: "C", text: "know" } ],   answer: "B" },
        { id: 32, options: [ { letter: "A", text: "longest" }, { letter: "B", text: "long" },    { letter: "C", text: "longer" } ], answer: "B" },
        { id: 33, options: [ { letter: "A", text: "get" },     { letter: "B", text: "got" },     { letter: "C", text: "getting" } ],answer: "A" },
        { id: 34, options: [ { letter: "A", text: "go" },      { letter: "B", text: "goes" },    { letter: "C", text: "going" } ],  answer: "A" },
        { id: 35, options: [ { letter: "A", text: "on" },      { letter: "B", text: "at" },      { letter: "C", text: "from" } ],   answer: "C" }
      ]
    },

    // ─────────────────── PART 6 (Q36–40) ─────────────────
    {
      partNumber: 6,
      label: "PART 6",
      questionsLabel: "QUESTIONS 36–40",
      type: "vocab-first-letter",
      instruction: [
        "Read the descriptions (36–40) of some things you may find at a party.",
        "What is the word for each description?",
        "The first letter is already there. There is one space for each other letter in the word.",
        "For questions 36–40, write the words on the answer sheet."
      ],
      example: { number: 0, prompt: "Everybody likes to eat a piece of this.", firstLetter: "c", answer: "cake" },
      items: [
        { id: 36, prompt: "You need this if you want to dance.",                       firstLetter: "m", letters: 5, answer: "music"    },
        { id: 37, prompt: "If it's your birthday, your guests may give you this.",     firstLetter: "p", letters: 7, answer: "present"  },
        { id: 38, prompt: "You need this to put your drink in.",                       firstLetter: "g", letters: 5, answer: "glass"    },
        { id: 39, prompt: "You can buy this drink in a bottle or a can.",              firstLetter: "l", letters: 8, answer: "lemonade" },
        { id: 40, prompt: "You hope these people will come to your party.",            firstLetter: "f", letters: 7, answer: "friends"  }
      ]
    },

    // ─────────────────── PART 7 (Q41–50) ─────────────────
    {
      partNumber: 7,
      label: "PART 7",
      questionsLabel: "QUESTIONS 41–50",
      type: "open-cloze-letter",
      instruction: [
        "Complete the letter.",
        "Write ONE word for each space (41–50).",
        "For questions 41–50, write your words on the answer sheet."
      ],
      letters: [
        {
          header: "",
          greeting: "Dear Lorna,",
          body:
            "How (Example: are) you? I'm happy because {41} month I got a new job in the city centre. I {42} working in a Tourist Information Office and {43} is very interesting. I start work {44} morning at half past seven, so I {45} to get up very early! I love this job because I meet people from a {46} of different countries. I like telling them {47} the city. Here is {48} photo of me. I'm {49} my uniform. {50} you like it?",
          closing: "Love,\nGloria"
        }
      ],
      example: { number: 0, answer: "are" },
      items: [
        { id: 41, answer: "last" },
        { id: 42, answer: "am" },
        { id: 43, answer: "it" },
        { id: 44, answer: "each" },
        { id: 45, answer: "have" },
        { id: 46, answer: "lot" },
        { id: 47, answer: "about" },
        { id: 48, answer: "a" },
        { id: 49, answer: "wearing" },
        { id: 50, answer: "Do" }
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
        "Fill in the Flower Order Form.",
        "For questions 51–55, write the information on the answer sheet."
      ],
      notice: {
        title: "E-mail from Mother",
        body:
          "To: Stephen Jones\nDate: 21 August\n\n" +
          "Stephen!\nRemember it's your sister's birthday tomorrow. She'll be 16. Have you got her new address in York? She lives in Shirley Road now, at number 47.\n\nMother"
      },
      note: {
        dateLine: "Date: 21 August",
        body:
          "Don't worry Mum! I won't forget Lulu's special day tomorrow! I'm getting her some flowers — Garden Gate Flowers will send them for £15 or £20. I'll choose the cheaper ones, of course, with a nice card saying 'Happy Birthday'!",
        signature: "Stephen"
      },
      notesTitle: "Garden Gate Flowers",
      notesSubtitle: "Flower Order Form",
      rows: [
        { label: "From:", prefilled: "Stephen Jones" },
        { label: "To:", id: 51, answer: "Lulu Jones" },
        { label: "Date to send:", id: 52, answer: "22 August" },
        { label: "Address:", id: 53, answer: "47 Shirley Road, York" },
        { label: "Price:", id: 54, answer: "£15" },
        { label: "Message on card:", id: 55, answer: "Happy Birthday" }
      ]
    },

    // ─────────────────── PART 9 (Q56) ────────────────────
    {
      partNumber: 9,
      label: "PART 9",
      questionsLabel: "QUESTION 56",
      type: "writing-postcard",
      instruction: [
        "You want to sell your bicycle and you see this notice at your college.",
        "Write a note to Gary Jones. Answer his questions about your bicycle."
      ],
      prompt:
        "BICYCLE WANTED\n\n" +
        "HAVE YOU GOT A BICYCLE TO SELL?\nHOW MUCH IS IT? HOW OLD IS IT?\nWHEN CAN I SEE IT?\n\n" +
        "(Leave a note in reception for Gary Jones.)",
      promptSignature: "",
      wordCount: "25–35 words",
      footer: [
        "Write 25–35 words.",
        "Write your note on the answer sheet."
      ],
      items: [
        { id: 56, type: "free-text", minWords: 25, maxWords: 35, answer:
            "Gary Jones\n" +
            "I want to sell my bicycle. I bought it 3 years ago, but I've never used it. It costs £25. You can see it every afternoon, Call me at home:\n" +
            "3642562\n" +
            "Lucey" }
      ]
    }
  ]
};
