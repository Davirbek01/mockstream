// Cambridge KET (Key English Test) — Paper 1 Reading and Writing — Test 1
// VERBATIM transcription from the official Cambridge KET book.
// 9 parts · 56 questions · 1 hour 10 minutes.
//
// Part format (Cambridge KET, pre-2020 edition):
//   Part 1 (Q1-5)   match-notices              — match descriptions to 8 notices A-H
//   Part 2 (Q6-10)  mcq-gap-fill-sentences     — A/B/C gap-fill (birthday)
//   Part 3a (Q11-15) mcq-response              — pick A/B/C reply to a statement
//   Part 3b (Q16-20) match-dialogue             — match A-H lines into a conversation
//   Part 4 (Q21-27) match-three-texts           — A/B/C which text (3 books)
//   Part 5 (Q28-35) mcq-cloze-passage           — A/B/C cloze (Schnauzer Dogs)
//   Part 6 (Q36-40) vocab-first-letter          — write a word given the first letter
//   Part 7 (Q41-50) open-cloze-letter           — write ONE word for each gap (Maria's letter)
//   Part 8 (Q51-55) info-transfer-notes         — complete Andy's notes
//   Part 9 (Q56)    writing-postcard            — write a 25-35 word postcard

window.KET_RW_TEST = {
  testInfo: {
    id: "ket-rw-01",
    title: "KET Reading & Writing — Test 1",
    paper: "Paper 1",
    level: "A2",
    totalTime: 70,           // 1 hour 10 minutes
    totalQuestions: 56,
    parts: 9
  },

  parts: [

    // ───────────────────── PART 1 (Q1–5) ─────────────────────
    {
      partNumber: 1,
      label: "PART 1",
      questionsLabel: "QUESTIONS 1–5",
      type: "match-notices",
      instruction: [
        "Which notice (A–H) says this (1–5)?",
        "For questions 1–5, mark the correct letter A–H on the answer sheet."
      ],
      example: { number: 0, prompt: "We can answer your questions.", answer: "E" },
      notices: [
        { letter: "A", text: "Adults £2.50\nUnder 12s FREE" },
        { letter: "B", text: "Shoes repaired while you wait" },
        { letter: "C", text: "MIND YOUR HEAD" },
        { letter: "D", text: "Open 24 hours a day" },
        { letter: "E", text: "INFORMATION" },
        { letter: "F", text: "Police Notice\nRoad Closed" },
        { letter: "G", text: "Open daily 10–6\n(except Mondays)" },
        { letter: "H", text: "WAITING ROOM" }
      ],
      items: [
        { id: 1, prompt: "You can't drive this way.",          answer: "F" },
        { id: 2, prompt: "Children do not have to pay.",        answer: "A" },
        { id: 3, prompt: "You can shop here six days a week.",  answer: "G" },
        { id: 4, prompt: "Be careful when you stand up.",       answer: "C" },
        { id: 5, prompt: "We work quickly.",                    answer: "B" }
      ]
    },

    // ───────────────────── PART 2 (Q6–10) ────────────────────
    {
      partNumber: 2,
      label: "PART 2",
      questionsLabel: "QUESTIONS 6–10",
      type: "mcq-gap-fill-sentences",
      instruction: [
        "Read the sentences (6–10) about a birthday.",
        "Choose the best word (A, B or C) for each space.",
        "For questions 6–10, mark A, B or C on the answer sheet."
      ],
      example: {
        number: 0,
        sentence: "Nina _____ up early that morning because it was her birthday.",
        options: [
          { letter: "A", text: "stood" },
          { letter: "B", text: "woke" },
          { letter: "C", text: "came" }
        ],
        answer: "B"
      },
      items: [
        {
          id: 6,
          sentence: "Nina was very _____ because she got lots of presents.",
          options: [
            { letter: "A", text: "interesting" },
            { letter: "B", text: "lovely" },
            { letter: "C", text: "happy" }
          ],
          answer: "C"
        },
        {
          id: 7,
          sentence: "She _____ some friends to her house for a party.",
          options: [
            { letter: "A", text: "decided" },
            { letter: "B", text: "agreed" },
            { letter: "C", text: "invited" }
          ],
          answer: "C"
        },
        {
          id: 8,
          sentence: "Her mother made a big chocolate _____ with 'Happy Birthday' on the top.",
          options: [
            { letter: "A", text: "meal" },
            { letter: "B", text: "cake" },
            { letter: "C", text: "dish" }
          ],
          answer: "B"
        },
        {
          id: 9,
          sentence: "Nina and her friends had a great time, singing and dancing and _____ to their favourite music.",
          options: [
            { letter: "A", text: "listening" },
            { letter: "B", text: "hearing" },
            { letter: "C", text: "looking" }
          ],
          answer: "A"
        },
        {
          id: 10,
          sentence: "When they had to go, everybody _____ Nina and her mother for the party.",
          options: [
            { letter: "A", text: "said" },
            { letter: "B", text: "thanked" },
            { letter: "C", text: "told" }
          ],
          answer: "B"
        }
      ]
    },

    // ───────────────── PART 3 (Q11–15) — Conversations ───────
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
        prompt: "How are you?",
        options: [
          { letter: "A", text: "I'm 18." },
          { letter: "B", text: "I'm Peter." },
          { letter: "C", text: "I'm fine." }
        ],
        answer: "C"
      },
      items: [
        {
          id: 11,
          prompt: "It's time for lunch.",
          options: [
            { letter: "A", text: "Oh good!" },
            { letter: "B", text: "One hour." },
            { letter: "C", text: "Half past twelve." }
          ],
          answer: "A"
        },
        {
          id: 12,
          prompt: "Would you like a drink?",
          options: [
            { letter: "A", text: "I don't like coffee." },
            { letter: "B", text: "I prefer tea." },
            { letter: "C", text: "Coffee, please." }
          ],
          answer: "C"
        },
        {
          id: 13,
          prompt: "How much was your new shirt?",
          options: [
            { letter: "A", text: "It's a red shirt." },
            { letter: "B", text: "It was very cheap." },
            { letter: "C", text: "It was in a shop." }
          ],
          answer: "B"
        },
        {
          id: 14,
          prompt: "I'm very sorry.",
          options: [
            { letter: "A", text: "I'm afraid so." },
            { letter: "B", text: "I think so." },
            { letter: "C", text: "That's all right." }
          ],
          answer: "C"
        },
        {
          id: 15,
          prompt: "Do you speak English?",
          options: [
            { letter: "A", text: "No, I'm not." },
            { letter: "B", text: "Only a little." },
            { letter: "C", text: "Yes, very much." }
          ],
          answer: "B"
        }
      ]
    },

    // ───────── PART 3 (Q16–20) — Garage dialogue match A–H ─────
    {
      partNumber: 3,
      partLetter: "b",
      questionsLabel: "QUESTIONS 16–20",
      type: "match-dialogue",
      instruction: [
        "Complete this conversation at a garage.",
        "What does the woman say to the car mechanic?",
        "For questions 16–20, mark the correct letter A–H on the answer sheet."
      ],
      example: { number: 0, answer: "B" },
      // The "Woman" lines marked 0/16/17/18/19/20 are the ones the student fills.
      dialogue: [
        { speaker: "Mechanic", line: "Good morning, Madam. What's the problem?" },
        { speaker: "Woman",    gap: 0 },
        { speaker: "Mechanic", line: "What do you mean?" },
        { speaker: "Woman",    gap: 16 },
        { speaker: "Mechanic", line: "I see. We can probably repair that easily. Can you leave the car now?" },
        { speaker: "Woman",    gap: 17 },
        { speaker: "Mechanic", line: "I'm sorry. We're completely full on Saturday." },
        { speaker: "Woman",    gap: 18 },
        { speaker: "Mechanic", line: "Yes, all right. Could you come in the morning?" },
        { speaker: "Woman",    gap: 19 },
        { speaker: "Mechanic", line: "OK." },
        { speaker: "Woman",    gap: 20 },
        { speaker: "Mechanic", line: "I'm not sure, but probably about £30." },
        { speaker: "Woman",    line: "That's fine. I'll see you on Monday." }
      ],
      options: [
        { letter: "A", text: "I'd prefer the afternoon." },
        { letter: "B", text: "I'm not sure. The brakes aren't working very well." },
        { letter: "C", text: "Oh! One other thing, how much will it cost?" },
        { letter: "D", text: "The engine is hard to start in the morning." },
        { letter: "E", text: "I work on Mondays." },
        { letter: "F", text: "I'm afraid I need it today. How about the weekend?" },
        { letter: "G", text: "When I brake, the car goes to the left." },
        { letter: "H", text: "Oh. Could you do it on Monday?" }
      ],
      items: [
        { id: 16, answer: "G" },
        { id: 17, answer: "F" },
        { id: 18, answer: "H" },
        { id: 19, answer: "A" },
        { id: 20, answer: "C" }
      ]
    },

    // ───────────────────── PART 4 (Q21–27) ────────────────────
    {
      partNumber: 4,
      label: "PART 4",
      questionsLabel: "QUESTIONS 21–27",
      type: "match-three-texts",
      instruction: [
        "Read the information about three books and then answer the questions.",
        "For questions 21–27, mark A, B or C on the answer sheet."
      ],
      heading: "New books this month",
      texts: [
        {
          letter: "A",
          title: "The Long Night",
          body:
            "This is David Reilly's first book. David became a writer after teaching English for several years.\n\n" +
            "Maha is a nurse in northern Australia, where she works in a small hospital. One day a baby is so ill that Maha has to drive all night to get her to the nearest big city. They have a lot of problems getting there and ..."
        },
        {
          letter: "B",
          title: "Hard Work",
          body:
            "This exciting story is Joanna Jones's twentieth.\n\n" +
            "Hard Work is about Sombat, who works with his father, a carpenter, in Thailand. They work long, hard hours making tables and chairs, but they do not have any money. Then one day a man dressed all in black buys the most beautiful table in the shop ..."
        },
        {
          letter: "C",
          title: "Hospital or Cinema?",
          body:
            "Marcie Jacome, who studies English in London, wrote this story earlier this year.\n\n" +
            "Tina is a young Brazilian woman whose dream is to become a doctor. She goes to London to study English and medicine but one day she meets a man who asks her to go to the USA with him to become a film star ... What will Tina do?"
        }
      ],
      example: {
        number: 0,
        prompt: "Which book is about somebody who works with doctors?",
        answer: "A"
      },
      items: [
        { id: 21, prompt: "Which book is by somebody who has written a lot of books?",   answer: "B" },
        { id: 22, prompt: "Which book is about somebody who is very poor?",              answer: "B" },
        { id: 23, prompt: "Which book is about somebody who would like to work in a hospital?", answer: "C" },
        { id: 24, prompt: "Which book is by somebody who worked in a school?",           answer: "A" },
        { id: 25, prompt: "Which book is about a difficult journey?",                    answer: "A" },
        { id: 26, prompt: "Which book is about a man and his son?",                      answer: "B" },
        { id: 27, prompt: "Which book is by a student?",                                 answer: "C" }
      ]
    },

    // ───────────────────── PART 5 (Q28–35) ────────────────────
    {
      partNumber: 5,
      label: "PART 5",
      questionsLabel: "QUESTIONS 28–35",
      type: "mcq-cloze-passage",
      instruction: [
        "Read the information about Schnauzer dogs.",
        "Choose the best word (A, B or C) for each space (28–35).",
        "For questions 28–35, mark A, B or C on the answer sheet."
      ],
      passageTitle: "Schnauzer Dogs",
      // The passage uses {N} placeholders for gaps.
      passage:
        "There are three sizes {0} Schnauzer dog.\n\n" +
        "The two smaller sizes first {28} to England over 50 years ago, but the Giant Schnauzer has not {29} here very long. The name Giant is a good one because the dogs are 65 to 67.5 cm high.\n\n" +
        "All the dogs {30} long hair, which should be cut quite often. Most smaller Schnauzers {31} grey in colour, {32} the Giant Schnauzer is usually black.\n\n" +
        "Schnauzers come from Germany, where farmers use the dogs to help {33} with their sheep, and they are also used {34} the police, because Schnauzer dogs are very intelligent.\n\n" +
        "A Schnauzer makes {35} nice family dog. It is friendly and very good with young children.",
      example: {
        number: 0,
        options: [
          { letter: "A", text: "with" },
          { letter: "B", text: "of" },
          { letter: "C", text: "in" }
        ],
        answer: "B"
      },
      items: [
        { id: 28, options: [ { letter: "A", text: "came" },  { letter: "B", text: "come" },  { letter: "C", text: "comes" } ], answer: "A" },
        { id: 29, options: [ { letter: "A", text: "being" }, { letter: "B", text: "be" },    { letter: "C", text: "been" } ],  answer: "C" },
        { id: 30, options: [ { letter: "A", text: "has" },   { letter: "B", text: "have" },  { letter: "C", text: "had" } ],   answer: "B" },
        { id: 31, options: [ { letter: "A", text: "were" },  { letter: "B", text: "is" },    { letter: "C", text: "are" } ],   answer: "C" },
        { id: 32, options: [ { letter: "A", text: "or" },    { letter: "B", text: "if" },    { letter: "C", text: "but" } ],   answer: "C" },
        { id: 33, options: [ { letter: "A", text: "them" },  { letter: "B", text: "him" },   { letter: "C", text: "us" } ],    answer: "A" },
        { id: 34, options: [ { letter: "A", text: "from" },  { letter: "B", text: "by" },    { letter: "C", text: "to" } ],    answer: "B" },
        { id: 35, options: [ { letter: "A", text: "the" },   { letter: "B", text: "a" },     { letter: "C", text: "any" } ],   answer: "B" }
      ]
    },

    // ───────────────────── PART 6 (Q36–40) ────────────────────
    {
      partNumber: 6,
      label: "PART 6",
      questionsLabel: "QUESTIONS 36–40",
      type: "vocab-first-letter",
      instruction: [
        "Read the descriptions (36–40) of some words about holidays and travel.",
        "What is the word for each description?",
        "The first letter is already there. There is one space for each other letter in the word.",
        "For questions 36–40, write the words on the answer sheet."
      ],
      example: {
        number: 0,
        prompt: "You can take photos of your holiday with this.",
        firstLetter: "c",
        answer: "camera"
      },
      items: [
        { id: 36, prompt: "You need this to travel to some foreign countries.", firstLetter: "p", letters: 8, answer: "passport" },
        { id: 37, prompt: "You need to buy this before you get on a plane.",    firstLetter: "t", letters: 6, answer: "ticket"   },
        { id: 38, prompt: "This is where you go to get a plane.",               firstLetter: "a", letters: 7, answer: "airport"  },
        { id: 39, prompt: "You put your clothes in this when you travel.",      firstLetter: "s", letters: 8, answer: "suitcase" },
        { id: 40, prompt: "This person likes visiting different places.",       firstLetter: "t", letters: 7, answer: "tourist"  }
      ]
    },

    // ───────────────────── PART 7 (Q41–50) ────────────────────
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
      header: "28 Long Road\nBrighton\n\n22nd March",
      greeting: "Dear Pat,",
      // {N} placeholders inside the letter body
      body:
        "I arrived ({0}) three weeks ago. I'm studying at a language school {41} Brighton. The students come {42} many different countries and I {43} made a lot of new friends.\n\n" +
        "There {44} classes for five hours every day. I like {45} teacher very much. {46} name is John and he helps me {47} I make a mistake.\n\n" +
        "I want {48} visit London next weekend because I {49} going back to my country on Monday. Can I see you there? Please write to {50} soon.",
      closing: "With best wishes from\nMaria",
      example: { number: 0, answer: "here" },
      items: [
        { id: 41, answer: "in" },
        { id: 42, answer: "from" },
        { id: 43, answer: "have" },
        { id: 44, answer: "are" },
        { id: 45, answer: "the" },
        { id: 46, answer: "His" },
        { id: 47, answer: "when" },
        { id: 48, answer: "to" },
        { id: 49, answer: "am" },
        { id: 50, answer: "me" }
      ]
    },

    // ───────────────────── PART 8 (Q51–55) ────────────────────
    {
      partNumber: 8,
      label: "PART 8",
      questionsLabel: "QUESTIONS 51–55",
      type: "info-transfer-notes",
      instruction: [
        "Read the notice and the note from Sheila.",
        "Complete Andy's notes.",
        "For questions 51–55, write the information on the answer sheet."
      ],
      notice: {
        title: "WALTON COLLEGE FILM CLUB",
        body:
          "Every Tuesday 8 p.m.\nIn the DRAMA STUDIO\n\n" +
          "2 April    City Lights\n" +
          "9 April    The Last King\n\n" +
          "Tickets    Students £3.50\n" +
          "           Visitors £5.00"
      },
      note: {
        dateLine: "2 April",
        body:
          "Andy,\n\n" +
          "Let's go to the Film Club next week. Can you get the tickets from the college office? Remember we pay the cheaper price. I must study at home for our exam on 8 April. Thanks!\n\n" +
          "See you next Tuesday in the Coffee Bar at 7.45, before it starts!",
        signature: "Sheila"
      },
      notesTitle: "Andy's Notes",
      notesSubtitle: "Film Club with Sheila",
      // Andy's Notes form rows. Filled rows have prefilled=true and no id.
      rows: [
        { label: "Day:",            prefilled: "Tuesday" },
        { label: "Date:",           id: 51, answer: "9 April" },
        { label: "Name of film:",   id: 52, answer: "The Last King" },
        { label: "Starting time:",  id: 53, answer: "8 p.m." },
        { label: "Ticket price:",   id: 54, prefix: "£", answer: "3.50" },
        { label: "Meet Sheila in:", id: 55, answer: "the Coffee Bar" }
      ]
    },

    // ───────────────────── PART 9 (Q56) ───────────────────────
    {
      partNumber: 9,
      label: "PART 9",
      questionsLabel: "QUESTION 56",
      type: "writing-postcard",
      instruction: [
        "Read the note from your friend Richard.",
        "Write a postcard to tell him what he wants to know."
      ],
      prompt:
        "It's great that you're coming to see me in England. Tell me when you are coming, how long you want to stay and what you want to do.\n\n" +
        "Write soon!",
      promptSignature: "Richard",
      wordCount: "25–35 words",
      footer: [
        "Write 25–35 words.",
        "Write your postcard on the answer sheet."
      ],
      items: [
        { id: 56, type: "free-text", minWords: 25, maxWords: 35, answer:
            "Dear Richard,\n" +
            "I am going to England next Monday for three months and I would like to do an excursion with you around London.\n" +
            "See you soon,\n" +
            "Lily" }
      ]
    }
  ]
};
