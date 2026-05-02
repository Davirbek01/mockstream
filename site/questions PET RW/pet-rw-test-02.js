// PET (B1 Preliminary) Reading & Writing — Mock 02
// Post-2020 Cambridge format: 90 min combined paper
//   Reading: 45 min, 6 parts, 32 questions
//   Writing: 45 min, 2 tasks, ~100 words each
// All content is original AI-authored material (Mock Stream).

window.PET_RW_TEST = {
  testInfo: {
    id: "pet-rw-02",
    title: "PET Reading & Writing Mock 02",
    level: "B1",
    totalTime: 90,
    totalQuestions: 34,        // 32 reading items + 2 writing tasks (Q33, Q34)
    readingQuestions: 32,
    writingTasks: 2
  },

  reading: {
    parts: [

      // ───────── PART 1 (Q1-5) — real-world MCQ (3 options) ─────────
      {
        partNumber: 1,
        type: "real-world-mcq",
        instruction: "For each question, choose the correct answer (A, B or C).",
        items: [
          {
            id: 1,
            sourceType: "library-notice",
            source: "CITY LIBRARY\n\nNext Wednesday, our children's reading hour will move from 4 p.m. to 5 p.m. because of building work on the second floor.\n\nWe will return to the usual time the following week.",
            question: "Why has the children's reading hour been moved?",
            options: [
              { letter: "A", text: "because the children prefer to come at a later time" },
              { letter: "B", text: "because work is being carried out in the building" },
              { letter: "C", text: "because the second floor will be closed permanently" }
            ],
            correct: "B"
          },
          {
            id: 2,
            sourceType: "text-message",
            source: "From: Lia\n\nHey Daniel — I won't make it to the gym tonight. My sister has just arrived from Madrid without warning, and she wants to go out for dinner. Sorry — see you on Saturday for the morning class?",
            question: "Why is Lia writing to Daniel?",
            options: [
              { letter: "A", text: "to invite him to dinner with her sister tonight" },
              { letter: "B", text: "to explain why she will miss their gym session" },
              { letter: "C", text: "to suggest a new time for the Saturday class" }
            ],
            correct: "B"
          },
          {
            id: 3,
            sourceType: "tour-email",
            source: "Dear Mr Diaz,\n\nThank you for your booking. The walking tour you have chosen is suitable for adults and children over twelve only. If you wish to bring younger children, we can offer you a different tour at the same price — please reply within 48 hours to confirm.\n\nBest wishes,\nWalkTours",
            question: "What does the email tell Mr Diaz?",
            options: [
              { letter: "A", text: "The tour he booked does not allow children under twelve." },
              { letter: "B", text: "He must pay extra to bring younger children on the tour." },
              { letter: "C", text: "His booking has been cancelled because of his children." }
            ],
            correct: "A"
          },
          {
            id: 4,
            sourceType: "park-sign",
            source: "WESTGATE PARK\n\nBicycles are not allowed on the grass. Please use the marked paths only.\n\nDogs must be kept on a lead between 7 a.m. and 9 a.m.",
            question: "According to the sign, you can",
            options: [
              { letter: "A", text: "cycle anywhere in the park as long as it is not raining." },
              { letter: "B", text: "walk a dog without a lead at any time of the day." },
              { letter: "C", text: "cycle in the park, but only on certain paths." }
            ],
            correct: "C"
          },
          {
            id: 5,
            sourceType: "flatmate-note",
            source: "Sam,\n\nI've used the last of the pasta — sorry! I've put a few coins by the kettle, that's my share.\n\nCould you pick some up tomorrow if you're going past the supermarket?\n\n— Mia",
            question: "Mia is asking Sam to",
            options: [
              { letter: "A", text: "buy some pasta for the flat tomorrow." },
              { letter: "B", text: "cook her some dinner this evening." },
              { letter: "C", text: "collect her share of the rent for her." }
            ],
            correct: "A"
          }
        ]
      },

      // ───────── PART 2 (Q6-10) — match 5 people to 8 weekend trips ─────────
      {
        partNumber: 2,
        type: "people-place-match",
        instruction: "The people below all want to take a weekend trip. On the next page there are descriptions of eight trips. Decide which trip (letters A–H) would be the most suitable for the following people (numbers 6–10).",
        people: [
          {
            id: 6,
            name: "Hassan",
            description: "Hassan is twenty-eight. He wants to do something active outdoors, but he cannot do long-distance hiking because of a knee injury. He needs to be able to reach the trip from his city by train, as he does not drive. He also has a fairly limited budget.",
            correct: "B"
          },
          {
            id: 7,
            name: "Yuki",
            description: "Yuki is thirty-five and looking for peace and quiet. She is planning to do nothing more energetic than reading for the entire weekend. She does not want to travel further than two hours from home and prefers to stay in just one place rather than moving around.",
            correct: "A"
          },
          {
            id: 8,
            name: "Lewis",
            description: "Lewis is forty-five and wants to take his eight-year-old son away for the weekend. He is looking for something educational that the boy will find genuinely interesting. They can both swim, but Lewis is not keen to do any swimming during this weekend himself.",
            correct: "D"
          },
          {
            id: 9,
            name: "Aria",
            description: "Aria is twenty-two and wants a sociable weekend. She hopes to meet new people, ideally other young adults. She does not mind sharing a room and cannot afford to spend much money on the trip.",
            correct: "F"
          },
          {
            id: 10,
            name: "Marcus",
            description: "Marcus is sixty and wants to visit his grandchildren for the first time in a year. They live in a small mountain village. He needs accommodation that is comfortable rather than basic, and he particularly enjoys good food.",
            correct: "C"
          }
        ],
        places: [
          {
            letter: "A",
            title: "Riverbank Yoga Retreat",
            description: "Three days of gentle yoga and meditation by a quiet river, two hours from the capital by direct train. Single rooms with reading nooks. All meals included. Suitable for travellers who want to do almost nothing for the whole weekend."
          },
          {
            letter: "B",
            title: "Adventure Cycling Weekend",
            description: "Three days of guided cycling along a flat coastal path, one hour from the capital by train. Camping or cheap dormitory beds. The group is mostly under thirty, and there are two communal dinners included in the price."
          },
          {
            letter: "C",
            title: "Mountain Village Inn",
            description: "A small family-run hotel high in the mountains, with private rooms, log fires, and a well-known restaurant serving local food. The train station is a ten-minute walk away. Bring your hiking boots, or just relax with the locals."
          },
          {
            letter: "D",
            title: "Family Ocean Science Centre",
            description: "Two-night educational trip to a coastal science centre. Children's workshops on marine biology, dolphins and underwater volcanoes. Family rooms (two adults plus one child). No swimming activities are offered."
          },
          {
            letter: "E",
            title: "Long-Distance Mountain Trekking",
            description: "Three days of demanding hill walking, covering up to twenty kilometres a day. For experienced walkers only — please bring proper boots. Reachable by car only; there is no public transport to the start of the route."
          },
          {
            letter: "F",
            title: "Student Beach Festival",
            description: "Live music, group activities and shared dormitories in a lively festival town. Three days of concerts, sport and parties, with cheap food included. The train station is right next to the festival entrance."
          },
          {
            letter: "G",
            title: "Solo Writers' Cottage",
            description: "A quiet weekend in a small countryside cottage, three hours from the capital by train. Includes a one-day creative writing workshop. Single rooms only. Perfect for those who want to spend most of the day alone."
          },
          {
            letter: "H",
            title: "Family Adventure Pool",
            description: "Three-night stay at a hotel with a huge water park and waterslides for all ages. Family rooms and a child-friendly menu. Plenty of swimming activities for parents and children together."
          }
        ]
      },

      // ───────── PART 3 (Q11-15) — long-text MCQ (4 options A-D) ─────────
      {
        partNumber: 3,
        type: "long-text-mcq",
        instruction: "Read the text below. For each question, choose the correct answer (A, B, C or D).",
        title: "The fifteen-year-old gardener",
        passage:
          "When she was twelve years old, Lila Chen lived with her family in a small flat in the centre of a busy city. The block of flats had a wide concrete courtyard at the back, where children sometimes played football, but where there were no plants of any kind, not even in the corners. Lila had grown up visiting her grandmother in the countryside every summer, and she missed seeing leaves, flowers and small living things during the rest of the year.\n\nOne Saturday afternoon, with about twenty pounds saved from her birthday, Lila bought four large pots, a bag of soil, and three packets of vegetable seeds at a local market. She put the pots in the corner of the courtyard, next to a tap that the residents used for washing their cars. Her father told her gently that she was going to be disappointed; the courtyard, he said, did not get enough sun.\n\nHe was wrong. By the middle of July, two of the pots were full of small green tomatoes and the other two had produced more lettuce than Lila's family could eat. Lila gave the extra lettuce to two elderly neighbours, who were so pleased that they came down the same evening and asked her how they could help with her garden.\n\nThat was the beginning. Over the following winter, Lila and the two neighbours collected old wooden boxes from local shops, planted seeds with a school friend who had heard about the project, and asked the building's owner if they could use a larger area of the courtyard. The owner, who had not expected the question, said yes. By the next spring, they had eleven boxes producing strawberries, herbs, beans and cucumbers, and a small wooden table where children sometimes sat with their books.\n\nLila is now fifteen and has started giving free gardening lessons to other teenagers in her neighbourhood every other Saturday. Two further blocks of flats nearby have started their own small gardens, partly with seeds donated by Lila's group. She wants to study agriculture at university one day, but for now she is happy spending her weekends in the courtyard, talking to the older residents and watching her cucumbers grow.",
        questions: [
          {
            id: 11,
            prompt: "Why did Lila start the garden?",
            options: [
              { letter: "A", text: "She wanted to grow food cheaply for her family." },
              { letter: "B", text: "She missed seeing plants in her daily life." },
              { letter: "C", text: "Her grandmother had asked her to start one." },
              { letter: "D", text: "Her parents had suggested it as a hobby." }
            ],
            correct: "B"
          },
          {
            id: 12,
            prompt: "What did Lila's father think when she put the first pots in the courtyard?",
            options: [
              { letter: "A", text: "The pots were too small for vegetables to grow in." },
              { letter: "B", text: "The plants would not get enough sunshine to grow well." },
              { letter: "C", text: "The neighbours would steal the food before it was ripe." },
              { letter: "D", text: "She had spent too much of her birthday money on it." }
            ],
            correct: "B"
          },
          {
            id: 13,
            prompt: "What happened at the end of the first summer?",
            options: [
              { letter: "A", text: "Lila had to spend more money on bigger pots." },
              { letter: "B", text: "Two of her elderly neighbours offered to help her." },
              { letter: "C", text: "Her family asked her to stop giving food away." },
              { letter: "D", text: "The building owner began to charge her rent." }
            ],
            correct: "B"
          },
          {
            id: 14,
            prompt: "What does the writer say about the owner of the building?",
            options: [
              { letter: "A", text: "He had not been expecting Lila to ask for permission." },
              { letter: "B", text: "He refused her request at first but later agreed." },
              { letter: "C", text: "He demanded a small payment for the use of the space." },
              { letter: "D", text: "He had been planning a similar project of his own." }
            ],
            correct: "A"
          },
          {
            id: 15,
            prompt: "What does Lila do in her garden now?",
            options: [
              { letter: "A", text: "She grows food only for her own family." },
              { letter: "B", text: "She charges visitors a small fee for tours." },
              { letter: "C", text: "She teaches gardening to other teenagers nearby." },
              { letter: "D", text: "She supplies vegetables to local restaurants." }
            ],
            correct: "C"
          }
        ]
      },

      // ───────── PART 4 (Q16-20) — gapped text (5 sentences removed, 8 options A-H) ─────────
      {
        partNumber: 4,
        type: "gapped-text",
        instruction: "Read the text below. Five sentences have been removed from the text. For each question, choose the correct answer (A–H). There are three extra sentences that you do not need to use.",
        title: "Learning to swim at twenty-five",
        text:
          "I had not been able to swim since I was a child, when one bad afternoon at a swimming pool had given me a fear of the water that I never quite got over. ___1___ I told everyone, and myself, that I just preferred dry land.\n\nLast spring, an old school friend invited me to spend a weekend at her family's house by the sea. I knew that all of her family swam every morning, and I had been planning to make some quiet excuse and stay on the beach with a book. ___2___ The day before the trip, I rang a local swimming pool and asked if anyone could give me a single one-hour beginner lesson the next morning.\n\nThe teacher, who was about seventy years old and had been swimming all his life, was extremely patient. ___3___ Instead, he made me sit on the steps in the shallow end and put my face in the water, again and again, until I began to feel that I could breathe at the right moments. By the end of the hour, I could float, and I was about as proud of myself as I had ever been.\n\nI went on the trip and, on the last morning, I swam out into the sea for the first time in nearly twenty years. ___4___ I went in slowly, with one of my friend's brothers next to me, and I came out shaking with cold and a kind of unfamiliar happiness.\n\nTwo years later, I now swim three times a week. ___5___ I sometimes wonder how many other small things I am avoiding because of a single bad afternoon I have only half remembered.",
        // 8 options A-H, 5 are correct (one per gap), 3 are distractors
        options: [
          { letter: "A", text: "He did not, however, try to teach me any of the proper swimming techniques on that first day." },
          { letter: "B", text: "As an adult, I had simply organised my life around avoiding pools, lakes and beaches." },
          { letter: "C", text: "The water was much colder than I had expected, and I was, of course, frightened." },
          { letter: "D", text: "I have not become particularly fast or skilful, but the fear has gone, and that, for me, is enough." },
          { letter: "E", text: "Then, a week before the trip, I changed my mind for reasons I still cannot fully explain." },
          { letter: "F", text: "The pool I learned in has since closed and been turned into a small supermarket." },
          { letter: "G", text: "The cost of the lessons turned out to be quite reasonable, especially in the off-season." },
          { letter: "H", text: "I had also lost a great deal of the confidence I once had in my own body." }
        ],
        gaps: [
          { id: 16, correct: "B" },
          { id: 17, correct: "E" },
          { id: 18, correct: "A" },
          { id: 19, correct: "C" },
          { id: 20, correct: "D" }
        ]
      },

      // ───────── PART 5 (Q21-26) — cloze MCQ (vocabulary, 4 options A-D) ─────────
      {
        partNumber: 5,
        type: "cloze-mcq",
        instruction: "Read the text below and decide which answer (A, B, C or D) best fits each space.",
        title: "Why we love taking photos",
        text:
          "Most of us now ___1___ photographs of things almost every day, often without thinking about it. We photograph our food before we eat it, our friends as they wave goodbye, the cat as it sits on the window. According to a recent ___2___, the average smartphone user takes more than thirty pictures every week.\n\nFew of these pictures are ever printed. Most of them stay in our phones, where we ___3___ a quick look at them now and then, but we rarely ___4___ them with anyone else. Why, then, do we keep taking them?\n\nPsychologists ___5___ several reasons. The act of taking a photo helps us notice what is in front of us. It also gives us a small sense of control over time, especially during ___6___ moments such as a child's birthday or the end of a long journey.",
        gaps: [
          {
            id: 21,
            options: [
              { letter: "A", text: "make" },
              { letter: "B", text: "take" },
              { letter: "C", text: "do" },
              { letter: "D", text: "get" }
            ],
            correct: "B"
          },
          {
            id: 22,
            options: [
              { letter: "A", text: "study" },
              { letter: "B", text: "review" },
              { letter: "C", text: "look" },
              { letter: "D", text: "check" }
            ],
            correct: "A"
          },
          {
            id: 23,
            options: [
              { letter: "A", text: "cast" },
              { letter: "B", text: "take" },
              { letter: "C", text: "put" },
              { letter: "D", text: "make" }
            ],
            correct: "B"
          },
          {
            id: 24,
            options: [
              { letter: "A", text: "divide" },
              { letter: "B", text: "share" },
              { letter: "C", text: "split" },
              { letter: "D", text: "spread" }
            ],
            correct: "B"
          },
          {
            id: 25,
            options: [
              { letter: "A", text: "say" },
              { letter: "B", text: "suggest" },
              { letter: "C", text: "tell" },
              { letter: "D", text: "speak" }
            ],
            correct: "B"
          },
          {
            id: 26,
            options: [
              { letter: "A", text: "particular" },
              { letter: "B", text: "special" },
              { letter: "C", text: "personal" },
              { letter: "D", text: "private" }
            ],
            correct: "B"
          }
        ]
      },

      // ───────── PART 6 (Q27-32) — open cloze (1 word per gap) ─────────
      {
        partNumber: 6,
        type: "cloze-open",
        instruction: "For each question, write the correct answer. Write ONE word for each gap.",
        title: "How my brother taught me to drive",
        text:
          "My brother first started teaching me to drive when I was seventeen. ___1___ a teacher he was extremely calm — much calmer ___2___ I had expected from someone who shouts at football matches. We went out every Sunday morning ___3___ the road was still quiet, and I would drive him round the empty streets near our house ___4___ at least an hour.\n\nAlthough I was nervous at first, I gradually got ___5___ to it. Two months later, I passed my driving test on the first try. My brother says he was just as proud ___6___ I was, but I think he was probably more relieved that the lessons were finally over.",
        gaps: [
          { id: 27, accept: ["As"] },
          { id: 28, accept: ["than"] },
          { id: 29, accept: ["when","while"] },
          { id: 30, accept: ["for"] },
          { id: 31, accept: ["used"] },
          { id: 32, accept: ["as"] }
        ]
      }
    ]
  },

  writing: {
    parts: [

      // ───────── WRITING PART 1 (Q33) — email reply (~100 words) ─────────
      {
        partNumber: 7,
        writingPartNumber: 1,
        type: "guided-email",
        taskType: "Email",
        instruction: "Read this email from your English-speaking friend Eli and the notes you have written.",
        sourceEmail:
          "From: Eli\nSubject: Help with my class presentation!\n\nHi!\n\nHow are you? I wanted to ask your advice. My class has just been told that we have to write a short presentation about a person from another country who has done something interesting. I'd really like to write about someone from your country, but I don't know who to choose!\n\nCould you suggest a person?\nWhat did this person do that was interesting?\nWhy do you think my class would enjoy hearing about them?\n\nThanks!\nEli",
        bullets: [
          "Suggest the person",
          "Tell about what they did",
          "Explain why students will enjoy",
          "Add a useful tip for the presentation"
        ],
        instructionDetail: "Write your email to Eli using all the notes. Write about 100 words.",
        wordMin: 90,
        wordMax: 120,
        scoringRubric:
          "Award full marks if the candidate addresses all four notes clearly, uses B1-appropriate vocabulary and grammar (a range of tenses, linkers such as 'because', 'so', 'although'), produces a coherent reply that opens and closes appropriately, and writes 90 words or more. Penalise if any note is missing, the response is too short or off-topic, or the email format is unclear."
      },

      // ───────── WRITING PART 2 (Q34) — article OR story (~100 words) ─────────
      {
        partNumber: 8,
        writingPartNumber: 2,
        type: "article-or-story",
        instruction: "Choose ONE of the following tasks. Write your answer in about 100 words.",
        choices: [
          {
            id: "article",
            taskType: "Article",
            heading: "Question 1 — Article",
            prompt:
              "Your English teacher has asked you to write an article for the school magazine. Here is the question:\n\n\"What is one thing all young people in your country should try at least once? Why?\"\n\nWrite your article in about 100 words."
          },
          {
            id: "story",
            taskType: "Story",
            heading: "Question 2 — Story",
            prompt:
              "Your English teacher has asked you to write a story for the school magazine. Your story must begin with this sentence:\n\n\"When the lights came on, everyone in the room started laughing.\"\n\nWrite your story in about 100 words."
          }
        ],
        wordMin: 90,
        wordMax: 120,
        scoringRubric:
          "Award full marks if the candidate has chosen ONE option, fully developed it (clear opinion + reasons for the article; logical narrative with a beginning, middle and end for the story), used B1-appropriate vocabulary and grammar with a good range of structures, and written 90 words or more. Penalise if the response is off-topic, too short, mixes both tasks, or fails to follow the given prompt sentence (story option)."
      }
    ]
  }
};
