// KET (A2 Key) Reading & Writing — Mock 12
// Post-2020 Cambridge format: 60 min, 7 parts, 32 questions
// All content is original AI-authored material (Mock Stream).

window.KET_RW_TEST = {
  testInfo: {
    id: "ket-rw-12",
    title: "KET Reading & Writing Mock 12",
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
            source: "GREEN STREET GYM\n\nFrom 1 April, we will open one hour earlier on weekdays — at 6 a.m.\n\nWeekend opening times do not change.",
            question: "What does the gym tell members?",
            options: [
              { letter: "A", text: "The gym will close earlier on weekdays from April." },
              { letter: "B", text: "The weekday opening time has changed." },
              { letter: "C", text: "The weekend hours are now different too." }
            ],
            correct: "B"
          },
          {
            id: 2,
            sourceType: "text-message",
            source: "From: Mum\n\nMark — I'll be home about an hour late tonight because there was a problem with the train.\n\nYour dinner is in the fridge — heat it for 3 minutes only, please.",
            question: "Why is Mum writing?",
            options: [
              { letter: "A", text: "to ask Mark to cook dinner for her tonight" },
              { letter: "B", text: "to tell Mark she will arrive later than usual" },
              { letter: "C", text: "to invite Mark to a restaurant for dinner" }
            ],
            correct: "B"
          },
          {
            id: 3,
            sourceType: "email",
            source: "Dear Sara,\n\nWelcome to Riverside Tennis Club! Your first lesson is on Saturday at 10 a.m.\n\nPlease bring trainers and water. We have rackets you can borrow for free.\n\nBest wishes,\nCoach Peters",
            question: "What does the email tell Sara?",
            options: [
              { letter: "A", text: "She does not need to bring her own racket." },
              { letter: "B", text: "The lesson will cost extra money each time." },
              { letter: "C", text: "She has to wear special tennis shoes only." }
            ],
            correct: "A"
          },
          {
            id: 4,
            sourceType: "sign",
            source: "COMMUNITY GARDEN\n\nOpen every day, 8 a.m. to sunset.\n\nPlease do not pick the flowers.\n\nChildren must be with an adult.",
            question: "At the community garden, you can",
            options: [
              { letter: "A", text: "take some flowers home with you." },
              { letter: "B", text: "come at any time of the day or night." },
              { letter: "C", text: "bring children if you stay with them." }
            ],
            correct: "C"
          },
          {
            id: 5,
            sourceType: "note",
            source: "Hi Anna,\n\nA small parcel for you arrived at our house this morning. We've put it inside our hallway.\n\nCome and pick it up any time today before 8 p.m.\n\nBest,\nLila",
            question: "What does Lila want Anna to do?",
            options: [
              { letter: "A", text: "collect a parcel from her house today" },
              { letter: "B", text: "wait at home for a delivery driver later" },
              { letter: "C", text: "sign a paper for a parcel that just arrived" }
            ],
            correct: "A"
          },
          {
            id: 6,
            sourceType: "notice",
            source: "BLUE FOX CAFÉ\n\nWe make a fresh soup every day.\n\nToday's soup: tomato (only £4).\n\nWe close at 3 p.m. on Sundays.",
            question: "According to the notice,",
            options: [
              { letter: "A", text: "the café serves the same soup every day." },
              { letter: "B", text: "the café costs less to eat at on Sundays." },
              { letter: "C", text: "the Blue Fox Café shuts early on Sundays." }
            ],
            correct: "C"
          }
        ]
      },

      // ───────── PART 2 (Q7-13) — multi-text matching ─────────
      {
        partNumber: 2,
        type: "multi-text-matching",
        instruction: "Read the questions and the three texts. For each question, choose the correct answer (A, B or C).",
        topic: "Three teenagers describe a school club they have joined.",
        texts: [
          {
            id: "A",
            title: "Yara",
            body: "I joined the chess club at the start of this year because my older sister had been very good at chess at our school. I had never played before. The teacher who runs the club, Mr Hall, was very kind and taught me the basic rules in two short lessons. We meet on Tuesday afternoons in the library, and there are about ten of us. Last month, I played my first match against another school and won it, which surprised everyone, including me."
          },
          {
            id: "B",
            title: "Ben",
            body: "My uncle gave me a small camera for my fourteenth birthday, and a few weeks later I joined the photography club at school. We meet every Friday after class for an hour. Most of the work is done outside the school, in the park or near the river. The best thing about the club is that everyone shares their photos at the end of the month, and the most popular one goes in the school newspaper. Mine has not been chosen yet, but I am hoping it will be soon."
          },
          {
            id: "C",
            title: "Carla",
            body: "I joined the cooking club because I wanted to learn to make better dinners for my family. The club meets on Wednesday evenings in the school kitchen, and we have to bring our own ingredients each week. The teacher, Mrs Diaz, often invites a parent to come and teach us a special meal. Last month my own father came and taught us how to make his soup, which made me very proud. I have now started making dinner once a week at home."
          }
        ],
        questions: [
          { id: 7,  prompt: "Which person joined the club because they wanted to follow a relative's example?", correct: "A" },
          { id: 8,  prompt: "Which person was given a piece of equipment shortly before joining the club?",     correct: "B" },
          { id: 9,  prompt: "Which person joined the club to develop a useful everyday skill?",                  correct: "C" },
          { id: 10, prompt: "Which person's club mostly works outside the school building?",                      correct: "B" },
          { id: 11, prompt: "Which person had a recent success that surprised them?",                             correct: "A" },
          { id: 12, prompt: "Which person needs to bring their own materials to the club every week?",            correct: "C" },
          { id: 13, prompt: "Which person has not yet had something they hoped for?",                             correct: "B" }
        ]
      },

      // ───────── PART 3 (Q14-18) — long-text MCQ ─────────
      {
        partNumber: 3,
        type: "long-text-mcq",
        instruction: "Read the text and questions. For each question, choose the correct answer (A, B or C).",
        title: "Daniel's dogs",
        passage:
          "Daniel Owen is fourteen years old and lives in a small town with his family. After school, three afternoons a week, he walks the dogs of his neighbours for an hour. He has six regular dogs at the moment, although three of them are walked together, so he is never out for more than ninety minutes in total.\n\nDaniel started the small business a year ago, when he asked the elderly lady who lives next door if she would like help with her dog, Maya. She had recently broken her leg and was finding it hard to take Maya out. Daniel did not ask for any money at first, but the neighbour insisted on paying him three pounds for each walk. Other people in the same street started asking him too.\n\nDaniel does not advertise. New customers usually hear about him from someone who has used him before. He keeps a small notebook where he writes the names of the dogs, what they like to eat, and any health problems they have. He says that the most difficult part of the job is not the walking, but remembering all of this information correctly.\n\nDaniel's parents were a little worried about his free time at first, but they have noticed that his school work has actually improved this year. He now does his homework as soon as he comes home, before any walks, because he knows the dogs will not wait. Daniel's mother says that he has also become much better at managing his pocket money, and now saves about half of what he earns.\n\nIn the future, Daniel would like to be a vet. He says, however, that he will keep walking the same dogs for as long as the owners want him to. \"These animals trust me,\" he says, \"and I think that's worth more than any small business.\"",
        questions: [
          {
            id: 14,
            prompt: "Why did Daniel first decide to walk a dog?",
            options: [
              { letter: "A", text: "He wanted to make some pocket money quickly." },
              { letter: "B", text: "His next-door neighbour could not walk her own dog." },
              { letter: "C", text: "His parents had asked him to help an elderly lady." }
            ],
            correct: "B"
          },
          {
            id: 15,
            prompt: "How does Daniel get new customers?",
            options: [
              { letter: "A", text: "People he has already worked for tell their friends about him." },
              { letter: "B", text: "He puts small posters in the local supermarket." },
              { letter: "C", text: "His school teacher recommends him to families." }
            ],
            correct: "A"
          },
          {
            id: 16,
            prompt: "According to Daniel, the hardest part of his job is",
            options: [
              { letter: "A", text: "walking all the dogs in bad weather." },
              { letter: "B", text: "finishing his school work on time." },
              { letter: "C", text: "remembering details about each dog." }
            ],
            correct: "C"
          },
          {
            id: 17,
            prompt: "What change have Daniel's parents noticed?",
            options: [
              { letter: "A", text: "He spends much more time at home than before." },
              { letter: "B", text: "He does his homework earlier in the day now." },
              { letter: "C", text: "He has stopped asking them for any pocket money." }
            ],
            correct: "B"
          },
          {
            id: 18,
            prompt: "What does Daniel say about the future?",
            options: [
              { letter: "A", text: "He plans to stop walking dogs when he leaves school." },
              { letter: "B", text: "He hopes to walk the same dogs for as long as they need him." },
              { letter: "C", text: "He wants to open a small business with his sister soon." }
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
        title: "Bees",
        text:
          "Bees are small insects that ___1___ in most parts of the world. Although they are sometimes ___2___ of, they are very useful animals. Without bees, many of our favourite fruits — apples, strawberries, oranges — would not ___3___ as well as they do.\n\nA single bee colony can have more than fifty thousand bees, which all ___4___ in the same large home, called a hive. Each bee has a special ___5___, and they share the work between them. Some look for flowers; others stay at home and ___6___ the babies.",
        gaps: [
          { id: 19, options: [{letter:"A",text:"live"},{letter:"B",text:"stay"},{letter:"C",text:"sit"}], correct: "A" },
          { id: 20, options: [{letter:"A",text:"angry"},{letter:"B",text:"afraid"},{letter:"C",text:"sad"}], correct: "B" },
          { id: 21, options: [{letter:"A",text:"come"},{letter:"B",text:"grow"},{letter:"C",text:"get"}], correct: "B" },
          { id: 22, options: [{letter:"A",text:"sleep"},{letter:"B",text:"jump"},{letter:"C",text:"live"}], correct: "C" },
          { id: 23, options: [{letter:"A",text:"idea"},{letter:"B",text:"job"},{letter:"C",text:"name"}], correct: "B" },
          { id: 24, options: [{letter:"A",text:"feed"},{letter:"B",text:"cook"},{letter:"C",text:"cover"}], correct: "A" }
        ]
      },

      // ───────── PART 5 (Q25-30) — open cloze (1 word, email format) ─────────
      {
        partNumber: 5,
        type: "cloze-open",
        instruction: "Read the email. Write ONE word for each space.",
        text:
          "Hi Lia,\n\nI hope you ___1___ well! I'm writing to tell you about ___2___ great weekend I had last week. My family and I went ___3___ a small island for two days.\n\nWe took a slow boat from the city, ___4___ took about three hours but was very pleasant. The hotel was small but clean, and ___5___ of us had a nice room with a sea view. On the second day, we hired bicycles and rode all around the island, which I had never done ___6___.\n\nHope to see you soon,\nMarco",
        gaps: [
          { id: 25, accept: ["are"] },
          { id: 26, accept: ["a"] },
          { id: 27, accept: ["to"] },
          { id: 28, accept: ["which"] },
          { id: 29, accept: ["each","both"] },
          { id: 30, accept: ["before"] }
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
        recipient: "Tom",
        instruction: "You went to a great new restaurant last weekend. Write an email to your English friend Tom.",
        instructionDetail: "In your email:",
        bullets: [
          "tell Tom about the restaurant",
          "say what you ate",
          "recommend that Tom goes there one day"
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
        // Hosted in our GCS bucket: gs://mockstream-listening-audio/KET/test 12/picture-story/
        pictures: [
          { id: 1, alt: "A child with a parent learning to ride a bicycle outdoors.",                          caption: "1. Tom's family helps him learn to ride.",          imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%2012/picture-story/scene-1.jpg" },
          { id: 2, alt: "A child wearing a helmet, riding a bicycle on a sunny day.",                           caption: "2. Soon, Tom can ride his bike on his own.",         imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%2012/picture-story/scene-2.jpg" },
          { id: 3, alt: "A family riding bicycles together in a sunny park.",                                   caption: "3. On Sunday, the family rides together in the park.", imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%2012/picture-story/scene-3.jpg" }
        ],
        scoringRubric:
          "Award full marks if the response describes all three pictures, uses A2-appropriate past or present tense, and writes 35 words or more. Penalise if pictures are skipped, the story is incoherent, or the response is fewer than 35 words."
      }
    ]
  }
};
