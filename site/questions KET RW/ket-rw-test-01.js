// KET (A2 Key) Reading & Writing — Mock 01
// Post-2020 Cambridge format: 60 min, 7 parts, 32 questions
// All content is original AI-authored material (Mock Stream).

window.KET_RW_TEST = {
  testInfo: {
    id: "ket-rw-01",
    title: "KET Reading & Writing Mock 01",
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
            source: "BLUEWATER SWIMMING POOL\n\nWe close at 8 p.m. on weekdays.\nLast swimmers must leave the water by 7:45 p.m.",
            question: "What does the notice say?",
            options: [
              { letter: "A", text: "You must finish swimming before 8 p.m." },
              { letter: "B", text: "The pool is open until 7:45 p.m." },
              { letter: "C", text: "You can stay in the water until 8 p.m." }
            ],
            correct: "A"
          },
          {
            id: 2,
            sourceType: "text-message",
            source: "From: Mia\n\nHi Tom! I'm at the cafe but I can't see you. Are you here yet? Let me know — I'll wait for 10 more minutes then go home.",
            question: "Mia is writing to Tom because",
            options: [
              { letter: "A", text: "she wants Tom to leave the cafe." },
              { letter: "B", text: "she does not know where Tom is." },
              { letter: "C", text: "she is going to be late." }
            ],
            correct: "B"
          },
          {
            id: 3,
            sourceType: "email",
            source: "Hello readers!\n\nOur next book club meeting is on Friday at 6 p.m. We will talk about chapters 1 to 4. Please bring your copy of the book and a pen.\n\nGreta",
            question: "Greta wants the book club members to",
            options: [
              { letter: "A", text: "read four chapters before Friday." },
              { letter: "B", text: "buy a new book this week." },
              { letter: "C", text: "write something for the meeting." }
            ],
            correct: "A"
          },
          {
            id: 4,
            sourceType: "sign",
            source: "MUSEUM RULES\n\nNo food or drinks.\nPhotos with phones are OK.\nPlease do not use camera flash.",
            question: "What is NOT allowed?",
            options: [
              { letter: "A", text: "taking phone photos" },
              { letter: "B", text: "eating inside" },
              { letter: "C", text: "wearing a coat" }
            ],
            correct: "B"
          },
          {
            id: 5,
            sourceType: "note",
            source: "Hi Sam,\n\nI used the last of the milk for my coffee this morning. Sorry! I'll buy some more on my way home tonight.\n\nLena",
            question: "Why is Lena writing to Sam?",
            options: [
              { letter: "A", text: "to ask Sam to buy milk" },
              { letter: "B", text: "to tell Sam there is no milk now" },
              { letter: "C", text: "to invite Sam for coffee" }
            ],
            correct: "B"
          },
          {
            id: 6,
            sourceType: "notice",
            source: "GREEN BEAN CAFE\n\nFree wifi for customers.\nAsk us for the password when you order.",
            question: "To use the wifi, you must",
            options: [
              { letter: "A", text: "buy something at the cafe." },
              { letter: "B", text: "stay for less than one hour." },
              { letter: "C", text: "bring your own password." }
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
        topic: "Three teenagers describe their summer holidays.",
        texts: [
          {
            id: "A",
            title: "Maya",
            body: "I went to the mountains with my aunt and uncle for two weeks. We walked a long way every day. The weather was very hot, so we always started early in the morning. I made friends with two girls who were staying at the same hotel, and we still send messages to each other now. My aunt took lots of photos and put them in a small book for me to keep. It was my favourite holiday ever."
          },
          {
            id: "B",
            title: "Leo",
            body: "I didn't go away this summer because my parents were busy at work. I stayed at home, but it wasn't boring. I learned how to cook three new things, and now I make dinner for my family one evening every week. I also watched a lot of films from different countries. My older sister came home for one week and we played computer games together. I think next summer I want to travel somewhere new."
          },
          {
            id: "C",
            title: "Nia",
            body: "I spent three weeks at my grandparents' house. They live in a small city by the sea. My grandmother runs a small bakery, and I helped her every morning before the shop opened. I learned how to make bread and small cakes. In the afternoons I walked on the beach with my grandfather and took photos of the sea birds. I'm going to print the best photos and give them to my grandparents."
          }
        ],
        questions: [
          { id: 7,  prompt: "Which person stayed in the same place for the whole holiday?", correct: "B" },
          { id: 8,  prompt: "Which person learned how to make food?",                       correct: "C" },
          { id: 9,  prompt: "Which person made new friends on holiday?",                    correct: "A" },
          { id: 10, prompt: "Which person did the same activity every morning?",            correct: "C" },
          { id: 11, prompt: "Which person wants to go away next summer?",                   correct: "B" },
          { id: 12, prompt: "Which person was given a present after the holiday?",          correct: "A" },
          { id: 13, prompt: "Which person is going to give photos to someone else?",        correct: "C" }
        ]
      },

      // ───────── PART 3 (Q14-18) — long-text MCQ ─────────
      {
        partNumber: 3,
        type: "long-text-mcq",
        instruction: "Read the text and questions. For each question, choose the correct answer (A, B or C).",
        title: "Sara's Greeting Cards",
        passage:
          "Sara Patel is fourteen years old. She lives with her parents and her younger brother in a small town. Two years ago, Sara started making her own birthday cards because she could not find any nice ones in the shops near her house. She used coloured paper and old buttons from her grandmother's sewing box. Her first cards were for her family, but soon her mother's friends began asking for them too.\n\nLast year, Sara's cousin showed her how to make a simple website. Now Sara sells her cards to people who live in different parts of the country. She makes about thirty cards every week. Each card costs six pounds. She uses some of the money to buy more paper and buttons, and she saves the rest. Sara wants to study art at university one day.\n\nMaking the cards takes a lot of time, so Sara only works on them at the weekend and for one hour after school. Her brother helps her by putting the cards into envelopes. Her mother takes the envelopes to the post office every Tuesday. Sara says that the most difficult part is not making the cards — it is answering all the messages from customers!",
        questions: [
          {
            id: 14,
            prompt: "Why did Sara start making cards?",
            options: [
              { letter: "A", text: "because she likes selling things" },
              { letter: "B", text: "because the cards in the shops were not nice enough for her" },
              { letter: "C", text: "because her grandmother asked her to" }
            ],
            correct: "B"
          },
          {
            id: 15,
            prompt: "Where did Sara get the buttons for her first cards?",
            options: [
              { letter: "A", text: "from her grandmother" },
              { letter: "B", text: "from a shop in town" },
              { letter: "C", text: "from her mother's friends" }
            ],
            correct: "A"
          },
          {
            id: 16,
            prompt: "How does Sara sell her cards now?",
            options: [
              { letter: "A", text: "She sells them at school." },
              { letter: "B", text: "She uses a website." },
              { letter: "C", text: "Her cousin sells them for her." }
            ],
            correct: "B"
          },
          {
            id: 17,
            prompt: "What does Sara do with the money she earns?",
            options: [
              { letter: "A", text: "She gives some to her brother." },
              { letter: "B", text: "She uses all of it to buy paper." },
              { letter: "C", text: "She buys more materials and saves some." }
            ],
            correct: "C"
          },
          {
            id: 18,
            prompt: "What is the hardest part of Sara's work?",
            options: [
              { letter: "A", text: "writing back to customers" },
              { letter: "B", text: "going to the post office" },
              { letter: "C", text: "making the cards" }
            ],
            correct: "A"
          }
        ]
      },

      // ───────── PART 4 (Q19-24) — cloze MCQ (vocabulary) ─────────
      {
        partNumber: 4,
        type: "cloze-mcq",
        instruction: "Read the text. Choose the best word (A, B or C) for each space.",
        title: "Octopuses",
        text:
          "Octopuses are amazing animals that ___1___ in the sea. They have eight long arms, and they use them to swim and to ___2___ for food. Some octopuses are very small — only ten centimetres long — but other ___3___ can grow to nine metres. Most octopuses live alone, and they like to ___4___ in small holes between the rocks.\n\nOctopuses are very ___5___ animals. Scientists say they can solve simple problems and even open jars. In some sea parks, octopuses learn to recognise the people who ___6___ them every day.",
        gaps: [
          {
            id: 19,
            options: [
              { letter: "A", text: "live" },
              { letter: "B", text: "stay" },
              { letter: "C", text: "rest" }
            ],
            correct: "A"
          },
          {
            id: 20,
            options: [
              { letter: "A", text: "watch" },
              { letter: "B", text: "look" },
              { letter: "C", text: "find" }
            ],
            correct: "C"
          },
          {
            id: 21,
            options: [
              { letter: "A", text: "kinds" },
              { letter: "B", text: "groups" },
              { letter: "C", text: "parts" }
            ],
            correct: "A"
          },
          {
            id: 22,
            options: [
              { letter: "A", text: "hide" },
              { letter: "B", text: "lose" },
              { letter: "C", text: "miss" }
            ],
            correct: "A"
          },
          {
            id: 23,
            options: [
              { letter: "A", text: "famous" },
              { letter: "B", text: "clever" },
              { letter: "C", text: "popular" }
            ],
            correct: "B"
          },
          {
            id: 24,
            options: [
              { letter: "A", text: "feed" },
              { letter: "B", text: "eat" },
              { letter: "C", text: "drink" }
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
          "Hi Alex,\n\nHow ___1___ you? I'm writing because I want to tell you ___2___ my new pet. Her name is Coco and ___3___ is a small black cat. We got her last week ___4___ my aunt because my aunt is moving ___5___ a smaller flat. Coco is very friendly and she sleeps on my bed every night. Why don't you come and meet ___6___ at the weekend?\n\nWrite soon!\nJamie",
        gaps: [
          { id: 25, accept: ["are"] },
          { id: 26, accept: ["about"] },
          { id: 27, accept: ["she"] },
          { id: 28, accept: ["from"] },
          { id: 29, accept: ["to","into"] },
          { id: 30, accept: ["her"] }
        ]
      }
    ]
  },

  writing: {
    parts: [

      // ───────── PART 6 (Q31) — guided writing (email/note, 25+ words) ─────────
      {
        partNumber: 6,
        type: "guided-writing",
        instruction: "You are going to a music concert next Saturday. Write an email to your English friend Sam.",
        instructionDetail: "In your email:",
        bullets: [
          "tell Sam about the concert",
          "say where it is",
          "invite Sam to come with you"
        ],
        wordMin: 25,
        scoringRubric:
          "Award full marks if the candidate addresses all three bullets clearly, uses A2-appropriate vocabulary and grammar, and writes 25 words or more. Penalise if a bullet is missing, the response is fewer than 25 words, or the email format is not recognisable."
      },

      // ───────── PART 7 (Q32) — picture story (35+ words, 3 pictures) ─────────
      {
        partNumber: 7,
        type: "picture-story",
        instruction: "Look at the three pictures. Write the story shown in the pictures.",
        wordMin: 35,
        // 3 sequential scenes, original inline SVG line art (Mock Stream)
        pictures: [
          {
            id: 1,
            alt: "A boy walks past a park bench and sees a wallet on it.",
            caption: "1. The boy sees a wallet.",
            svg:
              '<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A boy walks past a bench and notices a wallet on it">' +
              '<rect x="0" y="120" width="200" height="40" fill="#dcfce7"/>' +
              '<rect x="0" y="0" width="200" height="120" fill="#e0f2fe"/>' +
              '<rect x="100" y="100" width="80" height="6" fill="#92400e"/>' +
              '<rect x="106" y="106" width="6" height="20" fill="#92400e"/>' +
              '<rect x="168" y="106" width="6" height="20" fill="#92400e"/>' +
              '<rect x="130" y="92" width="22" height="10" rx="2" fill="#1e293b"/>' +
              '<rect x="134" y="95" width="14" height="3" fill="#fbbf24"/>' +
              '<circle cx="50" cy="80" r="9" fill="#fcd34d"/>' +
              '<rect x="44" y="89" width="12" height="22" fill="#3b82f6"/>' +
              '<line x1="44" y1="92" x2="36" y2="105" stroke="#3b82f6" stroke-width="3"/>' +
              '<line x1="56" y1="92" x2="64" y2="105" stroke="#3b82f6" stroke-width="3"/>' +
              '<line x1="46" y1="111" x2="42" y2="125" stroke="#1e293b" stroke-width="3"/>' +
              '<line x1="54" y1="111" x2="58" y2="125" stroke="#1e293b" stroke-width="3"/>' +
              '<text x="65" y="80" font-family="sans-serif" font-size="13" fill="#1e293b">!</text>' +
              '</svg>'
          },
          {
            id: 2,
            alt: "The boy opens the wallet and sees an identity card with a person's photo and address.",
            caption: "2. He looks inside and finds an ID card.",
            svg:
              '<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The boy opens the wallet and finds an ID card with photo and address">' +
              '<rect width="200" height="160" fill="#fef3c7"/>' +
              '<rect x="50" y="40" width="100" height="70" rx="6" fill="#1e293b"/>' +
              '<rect x="56" y="46" width="88" height="58" rx="4" fill="#fbbf24"/>' +
              '<rect x="64" y="55" width="34" height="42" rx="3" fill="#fff"/>' +
              '<circle cx="81" cy="68" r="6" fill="#fcd34d"/>' +
              '<path d="M71 92 q10 -10 20 0 v5 h-20 z" fill="#3b82f6"/>' +
              '<rect x="104" y="58" width="36" height="3" fill="#1e293b"/>' +
              '<rect x="104" y="66" width="32" height="2" fill="#1e293b"/>' +
              '<rect x="104" y="72" width="28" height="2" fill="#1e293b"/>' +
              '<rect x="104" y="78" width="34" height="2" fill="#1e293b"/>' +
              '<rect x="104" y="84" width="22" height="2" fill="#1e293b"/>' +
              '<text x="100" y="125" font-family="sans-serif" font-size="11" fill="#1e293b">ID Card</text>' +
              '</svg>'
          },
          {
            id: 3,
            alt: "The boy gives the wallet back to its owner. The owner smiles and says thank you.",
            caption: "3. He gives the wallet back to the owner.",
            svg:
              '<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The boy returns the wallet to its owner who smiles and thanks him">' +
              '<rect width="200" height="160" fill="#dcfce7"/>' +
              '<circle cx="65" cy="55" r="11" fill="#fcd34d"/>' +
              '<rect x="58" y="66" width="14" height="28" fill="#3b82f6"/>' +
              '<line x1="72" y1="72" x2="92" y2="80" stroke="#3b82f6" stroke-width="4"/>' +
              '<rect x="90" y="76" width="14" height="9" rx="2" fill="#1e293b"/>' +
              '<rect x="58" y="66" width="14" height="28" fill="#3b82f6"/>' +
              '<line x1="60" y1="94" x2="56" y2="115" stroke="#1e293b" stroke-width="3"/>' +
              '<line x1="70" y1="94" x2="74" y2="115" stroke="#1e293b" stroke-width="3"/>' +
              '<circle cx="135" cy="55" r="11" fill="#fcd34d"/>' +
              '<path d="M129 56 q6 5 12 0" stroke="#1e293b" stroke-width="2" fill="none"/>' +
              '<rect x="128" y="66" width="14" height="28" fill="#dc2626"/>' +
              '<line x1="128" y1="72" x2="108" y2="78" stroke="#dc2626" stroke-width="4"/>' +
              '<line x1="142" y1="72" x2="155" y2="80" stroke="#dc2626" stroke-width="4"/>' +
              '<line x1="130" y1="94" x2="126" y2="115" stroke="#1e293b" stroke-width="3"/>' +
              '<line x1="140" y1="94" x2="144" y2="115" stroke="#1e293b" stroke-width="3"/>' +
              '<text x="78" y="40" font-family="sans-serif" font-size="11" fill="#15803d">"Thank you!"</text>' +
              '</svg>'
          }
        ],
        scoringRubric:
          "Award full marks if the response describes all three pictures, uses A2-appropriate past or present tense, and writes 35 words or more. Penalise if pictures are skipped, the story is incoherent, or the response is fewer than 35 words."
      }
    ]
  }
};
