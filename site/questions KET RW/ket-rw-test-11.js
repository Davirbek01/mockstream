// KET (A2 Key) Reading & Writing — Mock 11
// Post-2020 Cambridge format: 60 min, 7 parts, 32 questions
// All content is original AI-authored material (Mock Stream).

window.KET_RW_TEST = {
  testInfo: {
    id: "ket-rw-11",
    title: "KET Reading & Writing Mock 11",
    level: "A2",
    totalTime: 60,
    totalQuestions: 32,
    readingQuestions: 30,
    writingTasks: 2
  },

  reading: {
    parts: [

      // ───────── PART 1 (Q1-6) — real-world MCQ ─────────
      {
        partNumber: 1,
        type: "real-world-mcq",
        instruction: "Read the text. Choose the correct answer (A, B or C).",
        items: [
          {
            id: 1,
            sourceType: "notice",
            source: "BUS STOP CHANGE\n\nFrom 1 March, the number 7 bus will stop at Park Road instead of Market Street.\n\nThe new stop is two minutes' walk from the old one.",
            question: "What does the notice tell passengers?",
            options: [
              { letter: "A", text: "The number 7 bus has been cancelled." },
              { letter: "B", text: "The place where the bus stops has changed." },
              { letter: "C", text: "The bus will be late from 1 March." }
            ],
            correct: "B"
          },
          {
            id: 2,
            sourceType: "text-message",
            source: "From: Lisa\n\nHi! I'm at the cinema but I forgot my purse. Can you bring it to me before 7? The film starts at 7:30.\n\nDon't worry if you can't — I'll pay you back tomorrow. Thanks!",
            question: "Why is Lisa writing?",
            options: [
              { letter: "A", text: "to tell her brother that she will be late tonight" },
              { letter: "B", text: "to ask her brother to bring something to her" },
              { letter: "C", text: "to invite her brother to a film with her" }
            ],
            correct: "B"
          },
          {
            id: 3,
            sourceType: "email",
            source: "Dear Mr Chen,\n\nThe book you ordered (The Sea Garden) has arrived.\n\nYou can collect it any day this week, but please come before Friday 5 p.m., as the library closes early on Friday this week.\n\nThank you,\nRiverside Library",
            question: "What does the email tell Mr Chen?",
            options: [
              { letter: "A", text: "The book he ordered is now waiting for him at the library." },
              { letter: "B", text: "The book he wanted has been sent to his home." },
              { letter: "C", text: "The library will be closed for the rest of the week." }
            ],
            correct: "A"
          },
          {
            id: 4,
            sourceType: "sign",
            source: "BUTTERFLY CAFÉ\n\nChildren under 10 eat free with an adult.\n\nFree wifi for all customers.\n\nWe are closed on Mondays.",
            question: "At Butterfly Café,",
            options: [
              { letter: "A", text: "wifi is only free if you buy a meal." },
              { letter: "B", text: "children always pay less than the adults." },
              { letter: "C", text: "the café does not open on Mondays." }
            ],
            correct: "C"
          },
          {
            id: 5,
            sourceType: "note",
            source: "Sam,\n\nI'm at work all day today. Your dinner is in the fridge — just put it in the microwave for two minutes.\n\nPlease don't use the oven, it's broken.\n\nMum",
            question: "Mum wants Sam to",
            options: [
              { letter: "A", text: "cook a new dinner for himself today." },
              { letter: "B", text: "heat up his dinner in the microwave." },
              { letter: "C", text: "buy a new oven for the kitchen." }
            ],
            correct: "B"
          },
          {
            id: 6,
            sourceType: "notice",
            source: "WINTER SALE\n\nAll boots and coats half price.\n\nDiscount only on Saturday and Sunday.\n\nThe sale starts at 10 a.m.",
            question: "To get the discount, customers must",
            options: [
              { letter: "A", text: "shop at the weekend." },
              { letter: "B", text: "come before 10 a.m." },
              { letter: "C", text: "buy more than two items." }
            ],
            correct: "A"
          }
        ]
      },

      // ───────── PART 2 (Q7-13) — multi-text matching ─────────
      {
        partNumber: 2,
        type: "multi-text-matching",
        instruction: "Read the questions and the three texts. For each question, choose the correct answer (A, B or C).",
        topic: "Three young people describe their first job.",
        texts: [
          {
            id: "A",
            title: "Mei",
            body: "I started working in a small bookshop near my school last summer. I worked there every Saturday for three months. The owner taught me how to use the computer system and how to put new books on the shelves. The best thing was that I could borrow any book for a week without paying. I made one good friend at the shop, and we still send each other book ideas now."
          },
          {
            id: "B",
            title: "Lukas",
            body: "My first job was helping in my aunt's small bakery. I started at five in the morning, which was very hard for me at first. My aunt taught me how to make bread and small cakes. Most of the customers were old people from the same neighbourhood, and many of them came every single day. After two months, I knew most of their names, and they sometimes brought me small presents for my work."
          },
          {
            id: "C",
            title: "Aria",
            body: "I worked in a sports shop for two months last year. I had no experience, so I was very nervous on the first day. My job was to help customers find their size and to keep the shoe shelves tidy. The shop had a lot of customers on Saturdays, and we sometimes worked very fast. I did not enjoy the job, but I learned how to talk to strangers, which has been very useful since."
          }
        ],
        questions: [
          { id: 7,  prompt: "Which person started work very early in the day?",                   correct: "B" },
          { id: 8,  prompt: "Which person was nervous on their first day?",                        correct: "C" },
          { id: 9,  prompt: "Which person could take products home for free?",                     correct: "A" },
          { id: 10, prompt: "Which person learned a useful skill that they still use now?",        correct: "C" },
          { id: 11, prompt: "Which person worked in a place that was busy at the weekend?",        correct: "C" },
          { id: 12, prompt: "Which person made a new friend at the place where they worked?",      correct: "A" },
          { id: 13, prompt: "Which person served the same customers again and again?",             correct: "B" }
        ]
      },

      // ───────── PART 3 (Q14-18) — long-text MCQ ─────────
      {
        partNumber: 3,
        type: "long-text-mcq",
        instruction: "Read the text and questions. For each question, choose the correct answer (A, B or C).",
        title: "Anna's free music lessons",
        passage:
          "Anna Roberts is fifteen years old and lives with her parents in a small town. Last year, Anna and her cousin started giving free guitar lessons to other young people in their neighbourhood, on Saturday afternoons. The lessons take place in Anna's grandfather's garden, which has a small wooden table where the students sit.\n\nAnna started playing the guitar when she was nine. Her older brother, who is now at university, was her first teacher. By the time she was thirteen, Anna could play more than fifty songs, but she had no friends who played a musical instrument. She felt that other young people in her town might enjoy learning if they had a place to start.\n\nThe first lesson, in April last year, had only two students. Anna and her cousin had put up small posters in the local supermarket and the public library. By the end of June, they were teaching twelve students every Saturday. They had to ask Anna's grandfather, who plays the guitar himself, to help them with the older students.\n\nAnna does not charge any money for the lessons, but her students often bring small gifts. One girl brought a homemade cake; another boy brought a notebook to write down chords in. Anna's mother says that the family has never had so much cake in the house.\n\nAnna is not planning to become a music teacher in the future. She wants to study medicine. But she says that the Saturday lessons have changed her. \"I used to think I was a very shy person,\" she says. \"Now I know that, with people I share something with, I can talk for hours.\"",
        questions: [
          {
            id: 14,
            prompt: "How did Anna learn to play the guitar?",
            options: [
              { letter: "A", text: "She had lessons at school." },
              { letter: "B", text: "Her brother taught her at home." },
              { letter: "C", text: "Her grandfather was her teacher." }
            ],
            correct: "B"
          },
          {
            id: 15,
            prompt: "Why did Anna decide to start the lessons?",
            options: [
              { letter: "A", text: "She wanted to make some extra pocket money." },
              { letter: "B", text: "She had no friends who played an instrument." },
              { letter: "C", text: "Her grandfather had asked her to start them." }
            ],
            correct: "B"
          },
          {
            id: 16,
            prompt: "By the end of June, the lessons had become",
            options: [
              { letter: "A", text: "too expensive for some families to pay for." },
              { letter: "B", text: "too small for Anna to continue with." },
              { letter: "C", text: "so popular that she needed help to teach them." }
            ],
            correct: "C"
          },
          {
            id: 17,
            prompt: "What does Anna's mother say about the family's house now?",
            options: [
              { letter: "A", text: "It has more cake in it than before." },
              { letter: "B", text: "It is much too noisy on Saturday afternoons." },
              { letter: "C", text: "Many old guitars are being kept in the kitchen." }
            ],
            correct: "A"
          },
          {
            id: 18,
            prompt: "What does Anna say has changed in herself?",
            options: [
              { letter: "A", text: "She no longer wants to study medicine at university." },
              { letter: "B", text: "She is less shy with people who like the same things as her." },
              { letter: "C", text: "She has started writing her own songs to play." }
            ],
            correct: "B"
          }
        ]
      },

      // ───────── PART 4 (Q19-24) — cloze MCQ (vocabulary) ─────────
      {
        partNumber: 4,
        type: "cloze-mcq",
        instruction: "Read the text. Choose the best word (A, B or C) for each space.",
        title: "Penguins",
        text:
          "Penguins are amazing birds that ___1___ in the cold parts of the world. Although they have wings, they cannot ___2___; instead, they use their wings to swim very fast under water.\n\nMost penguins ___3___ in big groups, sometimes with thousands of other penguins. This helps them keep ___4___ when the weather is very cold. The biggest penguins, called emperor penguins, are over a metre ___5___, and they can stay in the freezing sea for many minutes without coming up.\n\nSome young penguins do not know how to find food at first. Older penguins ___6___ them by sharing fish that they have already caught.",
        gaps: [
          {
            id: 19,
            options: [
              { letter: "A", text: "live" },
              { letter: "B", text: "stay" },
              { letter: "C", text: "sit" }
            ],
            correct: "A"
          },
          {
            id: 20,
            options: [
              { letter: "A", text: "jump" },
              { letter: "B", text: "fly" },
              { letter: "C", text: "climb" }
            ],
            correct: "B"
          },
          {
            id: 21,
            options: [
              { letter: "A", text: "sing" },
              { letter: "B", text: "study" },
              { letter: "C", text: "live" }
            ],
            correct: "C"
          },
          {
            id: 22,
            options: [
              { letter: "A", text: "warm" },
              { letter: "B", text: "tall" },
              { letter: "C", text: "wet" }
            ],
            correct: "A"
          },
          {
            id: 23,
            options: [
              { letter: "A", text: "thick" },
              { letter: "B", text: "tall" },
              { letter: "C", text: "wide" }
            ],
            correct: "B"
          },
          {
            id: 24,
            options: [
              { letter: "A", text: "help" },
              { letter: "B", text: "ask" },
              { letter: "C", text: "join" }
            ],
            correct: "A"
          }
        ]
      },

      // ───────── PART 5 (Q25-30) — open cloze (1 word, email format) ─────────
      {
        partNumber: 5,
        type: "cloze-open",
        instruction: "Read the email. Write ONE word for each space.",
        text:
          "Hi Tom,\n\nI'm writing because I want to tell you ___1___ a great trip my class had last week. We went ___2___ a small farm in the mountains, about an hour from our school.\n\nThe farmer showed us his cows, and ___3___ of us was allowed to give a small bottle of milk to a baby goat. Some boys ___4___ my class were a bit scared of the goats at first, but they soon got used to ___5___.\n\nFor lunch, we ate bread and cheese that the farmer had made ___6___, which was the best cheese I have ever tasted!\n\nWrite soon,\nJamie",
        gaps: [
          { id: 25, accept: ["about"] },
          { id: 26, accept: ["to"] },
          { id: 27, accept: ["each","one"] },
          { id: 28, accept: ["in","from"] },
          { id: 29, accept: ["them"] },
          { id: 30, accept: ["himself"] }
        ]
      }
    ]
  },

  writing: {
    parts: [

      // ───────── PART 6 (Q31) — guided writing (email, 25+ words) ─────────
      {
        partNumber: 6,
        type: "guided-writing",
        taskType: "Email",
        recipient: "Sam",
        instruction: "You are going to a school music concert next Friday. Write an email to your English friend Sam.",
        instructionDetail: "In your email:",
        bullets: [
          "tell Sam about the concert",
          "say what time it starts",
          "ask Sam to come with you"
        ],
        wordMin: 25,
        wordMax: 50,
        scoringRubric:
          "Award full marks if the candidate addresses all three bullets clearly, uses A2-appropriate vocabulary and grammar, and writes 25 words or more. Penalise if a bullet is missing, the response is fewer than 25 words, or the email format is not recognisable."
      },

      // ───────── PART 7 (Q32) — picture story (35+ words, 3 pictures) ─────────
      {
        partNumber: 7,
        type: "picture-story",
        taskType: "Story",
        instruction: "Look at the three pictures. Write the story shown in the pictures.",
        wordMin: 35,
        wordMax: 60,
        // 3 sequential scenes — Pexels-licensed photographs (free for commercial use)
        // Hosted in our GCS bucket: gs://mockstream-listening-audio/KET/test 11/picture-story/
        pictures: [
          { id: 1, alt: "Hands preparing a birthday cake with frosting and fresh berries.",       caption: "1. Friends prepare a special cake.",      imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%2011/picture-story/scene-1.jpg" },
          { id: 2, alt: "A group of friends holding a birthday cake with candles.",                caption: "2. They take the cake to Anna.",          imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%2011/picture-story/scene-2.jpg" },
          { id: 3, alt: "A young woman surprised by balloons at her birthday.",                    caption: "3. Anna is very surprised!",              imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%2011/picture-story/scene-3.jpg" }
        ],
        scoringRubric:
          "Award full marks if the response describes all three pictures, uses A2-appropriate past or present tense, and writes 35 words or more. Penalise if pictures are skipped, the story is incoherent, or the response is fewer than 35 words."
      }
    ]
  }
};
