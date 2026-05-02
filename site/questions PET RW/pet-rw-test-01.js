// PET (B1 Preliminary) Reading & Writing — Mock 01
// Post-2020 Cambridge format: 90 min combined paper
//   Reading: 45 min, 6 parts, 32 questions
//   Writing: 45 min, 2 tasks, ~100 words each
// All content is original AI-authored material (Mock Stream).

window.PET_RW_TEST = {
  testInfo: {
    id: "pet-rw-01",
    title: "PET Reading & Writing Mock 01",
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
            sourceType: "school-notice",
            source: "NORTHWOOD PRIMARY SCHOOL\n\nWednesday's swimming lesson has been moved to the afternoon. We will leave the school at 1:45 p.m. instead of 10 a.m. Buses will return by 4 p.m., as usual.\n\nPlease bring a packed lunch.",
            question: "What is the purpose of this notice?",
            options: [
              { letter: "A", text: "to inform parents that swimming has been cancelled this week" },
              { letter: "B", text: "to tell parents that the time of the lesson has changed" },
              { letter: "C", text: "to warn parents that the bus will arrive home late" }
            ],
            correct: "B"
          },
          {
            id: 2,
            sourceType: "text-message",
            source: "From: Alex\n\nHi Sara — I'm at the bus stop on Maple Street, but the number 14 was supposed to come at 9:15 and it still hasn't arrived. I checked the timetable on the wall and it doesn't even mention this stop! Should I walk to the next one?",
            question: "Why is Alex writing to Sara?",
            options: [
              { letter: "A", text: "He wants Sara to come and meet him at the bus stop." },
              { letter: "B", text: "He cannot understand the bus timetable on the wall." },
              { letter: "C", text: "He is not sure that his bus stops where he is waiting." }
            ],
            correct: "C"
          },
          {
            id: 3,
            sourceType: "hotel-email",
            source: "Dear Mr Lopez,\n\nThank you for booking with us. Your room (number 207) will be ready at 2 p.m. on Friday. If you arrive earlier, you are welcome to leave your bags at reception, but the room itself will not be available before that time.\n\nBreakfast is served between 7 and 10 a.m. on the ground floor.\n\nBest wishes,\nRiverside Hotel",
            question: "What does the email tell Mr Lopez?",
            options: [
              { letter: "A", text: "He is not allowed to enter the hotel before 2 p.m." },
              { letter: "B", text: "He can leave his luggage at reception if he comes early." },
              { letter: "C", text: "Breakfast is included in the price of room 207." }
            ],
            correct: "B"
          },
          {
            id: 4,
            sourceType: "museum-sign",
            source: "VALLEY MUSEUM — TODAY\n\nThe third floor is closed for cleaning until 1 p.m.\n\nThe new Egypt exhibition (floor 2) has free entry with your ticket.\n\nThe café is open as normal.",
            question: "A visitor at the museum at 11 a.m. on this day",
            options: [
              { letter: "A", text: "has to pay an extra fee to see the Egypt exhibition." },
              { letter: "B", text: "is not allowed to use the museum café this morning." },
              { letter: "C", text: "cannot visit the third floor of the museum yet." }
            ],
            correct: "C"
          },
          {
            id: 5,
            sourceType: "kitchen-note",
            source: "Mum,\n\nDon't make pasta for dinner — I already cooked some and put it in the fridge. There's enough for three of us.\n\nI left a note for Dad too, but I don't know where his phone is, so please don't bother trying to call him about it.\n\n— Eli",
            question: "Why has Eli left this note?",
            options: [
              { letter: "A", text: "to tell his mother that the family already has a meal ready" },
              { letter: "B", text: "to ask his mother to phone his father about dinner" },
              { letter: "C", text: "to find out where his father has gone with his phone" }
            ],
            correct: "A"
          }
        ]
      },

      // ───────── PART 2 (Q6-10) — match 5 people to 8 evening classes ─────────
      {
        partNumber: 2,
        type: "people-place-match",
        instruction: "The people below all want to take an evening class this autumn. On the next page there are descriptions of eight evening classes. Decide which class (letters A–H) would be the most suitable for the following people (numbers 6–10).",
        people: [
          {
            id: 6,
            name: "Tom",
            description: "Tom is forty-five. He wants to take a creative class but cannot do anything physical because of a back problem. He works during the day and can only attend after 7 p.m. He prefers small groups (under ten people) so that he can ask the teacher questions easily. He has no experience of the activity at all.",
            correct: "C"
          },
          {
            id: 7,
            name: "Karina",
            description: "Karina is a 22-year-old university student looking for a class that will help her with her future career in marketing. She wants a course that includes digital tools and ends before 9 p.m. so that she can study for her degree afterwards. She has used basic photo software before.",
            correct: "G"
          },
          {
            id: 8,
            name: "Nadia",
            description: "Nadia is sixty and has recently retired. She wants to spend more time outdoors and likes the idea of a class that meets in different places each week. However, she is not very fit, so she does not want to walk long distances. She would also like a friendly group where she can make new friends.",
            correct: "A"
          },
          {
            id: 9,
            name: "Felix",
            description: "Felix plays the guitar at home, but he has never played with other people. He would like a class that ends with a small public performance, because he has never performed in front of an audience and wants to try the experience. He cannot read music well.",
            correct: "E"
          },
          {
            id: 10,
            name: "Priya",
            description: "Priya is moving to Italy next year and wants an Italian course. She has already studied Italian for one year, so a complete-beginner course would be too easy for her. She works long hours during the week, so the class must take place on Saturday morning, not on a weekday evening.",
            correct: "F"
          }
        ],
        places: [
          {
            letter: "A",
            title: "Friday Photography Walks",
            description: "Meet at a different park every Friday and learn how to take great photos using just your phone. The walking is gentle (no more than ten minutes between stops) and the group is small and friendly — six to twelve people, all ages welcome. No previous experience needed."
          },
          {
            letter: "B",
            title: "Saturday Italian for Travel",
            description: "Saturday mornings, 10–12. A complete-beginner course covering greetings, ordering food, and asking for directions — perfect for your first short trip to Italy. No previous knowledge of the language is required."
          },
          {
            letter: "C",
            title: "Wednesday Drawing Studio",
            description: "A relaxed evening class, 7–9 p.m., for adults who want to learn to draw from scratch. The group is kept small (maximum eight students) so the teacher can give plenty of individual advice. No equipment needed in the first lesson."
          },
          {
            letter: "D",
            title: "Sunday Mountain Walking Club",
            description: "Every Sunday we meet at 7 a.m. for a five- to seven-hour mountain walk. Members are experienced walkers who enjoy a challenge, and the routes are steep. After each walk we have lunch together at a local pub."
          },
          {
            letter: "E",
            title: "Tuesday Guitar Ensemble",
            description: "For players who already know the basic chords. We meet on Tuesdays from 6:30–8 p.m. and prepare songs for a December concert in front of family and friends. Reading music is not required — we work from chord sheets."
          },
          {
            letter: "F",
            title: "Saturday Italian Conversation Club",
            description: "Saturday mornings, 10–12. For students who already have at least one year of Italian. We practise everyday conversation through games and discussions, ideal for those planning to live in Italy or travel there for longer periods."
          },
          {
            letter: "G",
            title: "Tuesday Digital Marketing Starter",
            description: "Tuesdays, 6:30–8:30 p.m. Learn to design eye-catching social-media posts and run small online campaigns using the latest free design software. Ideal for younger students starting a career. Some previous computer experience recommended."
          },
          {
            letter: "H",
            title: "Sunday Beginners' French",
            description: "Sunday mornings, 9–11 a.m. A complete-beginner course in French for total beginners. Learn enough French for a one-week holiday in Paris. No previous knowledge required."
          }
        ]
      },

      // ───────── PART 3 (Q11-15) — long-text MCQ (4 options A-D) ─────────
      {
        partNumber: 3,
        type: "long-text-mcq",
        instruction: "Read the text below. For each question, choose the correct answer (A, B, C or D).",
        title: "The teenager who saves bread",
        passage:
          "For most people, baking bread is just one of many ordinary activities at home. For 17-year-old Madina Yusupova, however, it has become a passion that has changed her life. Madina lives in a small town near the city of Bukhara, in central Uzbekistan, and she is one of the country's youngest professional bread bakers.\n\nMadina's grandmother taught her to bake traditional bread when she was eight years old. \"I used to wait by the oven for hours, watching her work,\" Madina remembers. \"I was never bored, even when she repeated the same actions a hundred times.\" Her grandmother told her that each region of Uzbekistan has its own special bread, with shapes and patterns that have been used for hundreds of years. By the time Madina was twelve, she could already make seven different kinds.\n\nThree years ago, Madina noticed that fewer and fewer people in her town were baking these traditional breads. Most families simply bought ordinary white loaves from the supermarket, and Madina was worried that the old recipes would disappear. She decided to do something about it. With her father's help, she started a small business at the local market: every Saturday morning, she sells bread that she has baked the night before. Although her bread costs more than supermarket bread, it nearly always sells out before lunch.\n\nMadina's most popular bread is decorated with patterns made using small wooden tools called \"chekich\". Each pattern means something different, and Madina enjoys explaining the meanings to customers who have never seen them before. Last year she also began making short videos for social media. In these videos, she shows young people how the patterns are created and why they were originally used. Her most popular video has now been watched more than two million times — which surprised even Madina herself.\n\nNext autumn, Madina will start studying food science at university, but she does not want to give up baking. \"Bread is not just food,\" she says. \"It is part of who we are.\" One day, she hopes to publish a book about the breads of her region, including the recipes that her grandmother taught her — and some new ones of her own.",
        questions: [
          {
            id: 11,
            prompt: "Why did Madina start her business three years ago?",
            options: [
              { letter: "A", text: "She needed to earn money for university." },
              { letter: "B", text: "She was afraid that traditional breads might be forgotten." },
              { letter: "C", text: "Her grandmother asked her to continue the family work." },
              { letter: "D", text: "She could not find any nice bread in the supermarket." }
            ],
            correct: "B"
          },
          {
            id: 12,
            prompt: "What does the third paragraph tell us about Madina's bread?",
            options: [
              { letter: "A", text: "It is sold at the market every day of the week." },
              { letter: "B", text: "It costs about the same as bread in supermarkets." },
              { letter: "C", text: "It is usually all sold by the middle of Saturday." },
              { letter: "D", text: "Most of it is actually baked by her father." }
            ],
            correct: "C"
          },
          {
            id: 13,
            prompt: "What are \"chekich\" used for?",
            options: [
              { letter: "A", text: "weighing the bread before it is cooked" },
              { letter: "B", text: "cutting the bread into smaller pieces" },
              { letter: "C", text: "measuring the ingredients more accurately" },
              { letter: "D", text: "making decorative patterns on the bread" }
            ],
            correct: "D"
          },
          {
            id: 14,
            prompt: "How does Madina feel about her social-media videos?",
            options: [
              { letter: "A", text: "She is disappointed that older people watch them more than young people." },
              { letter: "B", text: "She is surprised that one of them has reached so many viewers." },
              { letter: "C", text: "She is worried that the videos take too much time away from baking." },
              { letter: "D", text: "She is upset that other bakers have copied her ideas." }
            ],
            correct: "B"
          },
          {
            id: 15,
            prompt: "What are Madina's plans for the future?",
            options: [
              { letter: "A", text: "She wants to give up baking when she goes to university." },
              { letter: "B", text: "She has decided not to study food science after all." },
              { letter: "C", text: "She is hoping one day to write a book about the bread of her region." },
              { letter: "D", text: "She would like to open her own large bakery in Bukhara." }
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
        title: "My first long bicycle ride",
        text:
          "I bought my first bicycle when I was twenty-five years old, after years of borrowing other people's. ___1___ My uncle had told me that the route was beautiful but quite hilly, so I decided to train at home for a few weeks first. I started with short rides around my neighbourhood and gradually moved on to longer ones in the countryside near my flat.\n\nThe day of the trip finally arrived. The weather was warm, but the sky was an unusual shade of grey. ___2___ In the end, I packed two large bottles of water, a small lunch and a thin jacket, and I set off at seven in the morning, when the streets were still quiet.\n\nThe first hour went very well. I felt strong, the road was flat and I enjoyed the fresh air. ___3___ I had to push my bicycle up several long hills, and by lunchtime I was already exhausted. I stopped under a tall tree to eat my sandwich, and I almost fell asleep.\n\nThe second part of the ride was much more difficult. I got lost twice, and once I had to go back almost a kilometre to find the right road again. ___4___ He was older than me, and he had ridden the same route many times before. We finished the last twenty kilometres together, talking about everything from food to films.\n\nWhen I finally reached my uncle's house, I was tired but very happy. ___5___ I had ridden ninety-two kilometres in a single day — the longest distance I had ever travelled on a bicycle. My uncle hugged me, gave me an enormous plate of soup, and told me he was proud. I think I slept for twelve hours that night.",
        // 8 options A-H, 5 are correct (one per gap), 3 are distractors
        options: [
          { letter: "A", text: "Luckily, I met a friendly cyclist at a small village café, and he kindly offered to show me the way." },
          { letter: "B", text: "Owning my own bicycle felt special, and I wanted to use it for something I would always remember." },
          { letter: "C", text: "I considered cancelling the whole trip because of the weather, but in the end I decided to go anyway." },
          { letter: "D", text: "I had no time to repair my old bicycle before I needed to leave the next morning." },
          { letter: "E", text: "After about two hours, however, the road suddenly started to climb very steeply." },
          { letter: "F", text: "The whole experience had been much harder than I had ever expected." },
          { letter: "G", text: "I have always preferred eating dinner at home with my family." },
          { letter: "H", text: "My grandfather often used to tell me stories about his own long cycling trips." }
        ],
        gaps: [
          { id: 16, correct: "B" },
          { id: 17, correct: "C" },
          { id: 18, correct: "E" },
          { id: 19, correct: "A" },
          { id: 20, correct: "F" }
        ]
      },

      // ───────── PART 5 (Q21-26) — cloze MCQ (vocabulary, 4 options A-D) ─────────
      {
        partNumber: 5,
        type: "cloze-mcq",
        instruction: "Read the text below and decide which answer (A, B, C or D) best fits each space.",
        title: "How animals find their way home",
        text:
          "Many animals have an amazing ___1___ to find their way home, even from very far away. Some birds fly thousands of kilometres every winter to warmer countries, then ___2___ to exactly the same place the following spring. Bees can also remember the ___3___ to the best flowers and lead the rest of their group there.\n\nScientists do not yet fully ___4___ how these animals do it. Recent studies ___5___ that they may use the position of the sun, the shape of the land, and even the magnetic field of the Earth. ___6___ all this information, animals can travel long distances without ever getting lost.",
        gaps: [
          {
            id: 21,
            options: [
              { letter: "A", text: "ability" },
              { letter: "B", text: "decision" },
              { letter: "C", text: "opinion" },
              { letter: "D", text: "experience" }
            ],
            correct: "A"
          },
          {
            id: 22,
            options: [
              { letter: "A", text: "arrive" },
              { letter: "B", text: "return" },
              { letter: "C", text: "leave" },
              { letter: "D", text: "escape" }
            ],
            correct: "B"
          },
          {
            id: 23,
            options: [
              { letter: "A", text: "journey" },
              { letter: "B", text: "speed" },
              { letter: "C", text: "way" },
              { letter: "D", text: "road" }
            ],
            correct: "C"
          },
          {
            id: 24,
            options: [
              { letter: "A", text: "understand" },
              { letter: "B", text: "discover" },
              { letter: "C", text: "believe" },
              { letter: "D", text: "recognise" }
            ],
            correct: "A"
          },
          {
            id: 25,
            options: [
              { letter: "A", text: "say" },
              { letter: "B", text: "suggest" },
              { letter: "C", text: "repeat" },
              { letter: "D", text: "speak" }
            ],
            correct: "B"
          },
          {
            id: 26,
            options: [
              { letter: "A", text: "After" },
              { letter: "B", text: "During" },
              { letter: "C", text: "With" },
              { letter: "D", text: "Without" }
            ],
            correct: "C"
          }
        ]
      },

      // ───────── PART 6 (Q27-32) — open cloze (1 word per gap) ─────────
      {
        partNumber: 6,
        type: "cloze-open",
        instruction: "For each question, write the correct answer. Write ONE word for each gap.",
        title: "How I learned to cook",
        text:
          "Until last year, I had never made anything more difficult ___1___ a cheese sandwich. Then my older brother, who is studying at a cooking school, came home for the summer. He said it was time ___2___ me to learn some simple dishes, so we agreed to cook dinner together every Friday.\n\n___3___ first, I made a lot of mistakes — I burnt the rice twice and once I put salt in my coffee instead of sugar. But after about a month, I noticed that I was getting better. Now I can make six or seven dishes from start to finish, and my parents say my pasta is ___4___ best in the family! I have also started inviting friends over ___5___ Sunday afternoons, and most of them are very surprised that I can cook ___6___ all.",
        gaps: [
          { id: 27, accept: ["than"] },
          { id: 28, accept: ["for"] },
          { id: 29, accept: ["At"] },
          { id: 30, accept: ["the"] },
          { id: 31, accept: ["on"] },
          { id: 32, accept: ["at"] }
        ]
      }
    ]
  },

  writing: {
    parts: [

      // ───────── WRITING PART 1 (Q33) — email reply (~100 words) ─────────
      {
        partNumber: 7,                // continuous internal numbering after reading
        writingPartNumber: 1,         // displayed as "Writing Part 1"
        type: "guided-email",
        taskType: "Email",
        instruction: "Read this email from your English-speaking friend Sam and the notes you have written.",
        sourceEmail:
          "From: Sam\nSubject: A trip to your country!\n\nHi!\n\nHow are you? Guess what — my school is organising a summer trip to your country next August! Our teacher is asking each of us to choose ONE place we should visit and to give some advice for the trip. So I need your help.\n\nWhere should our group go for the most interesting day out?\nWhat kind of clothes should we bring?\nIs there any local food we should try? You know what I like!\n\nWrite back soon!\nSam",
        bullets: [
          "Suggest the place",
          "Tell about clothes",
          "Recommend the food",
          "Add a reason for the food"
        ],
        instructionDetail: "Write your email to Sam using all the notes. Write about 100 words.",
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
              "Your English teacher has asked you to write an article for the school magazine. Here is the question:\n\n\"Is it better to learn a foreign language online or in a classroom? Why?\"\n\nWrite your article in about 100 words."
          },
          {
            id: "story",
            taskType: "Story",
            heading: "Question 2 — Story",
            prompt:
              "Your English teacher has asked you to write a story for the school magazine. Your story must begin with this sentence:\n\n\"When I opened the box, I was amazed by what I saw inside.\"\n\nWrite your story in about 100 words."
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
