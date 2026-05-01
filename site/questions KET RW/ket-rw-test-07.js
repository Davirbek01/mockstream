// KET (A2 Key) Reading & Writing — Mock 07
// Theme: travel & places. All content original (Mock Stream).

window.KET_RW_TEST = {
  testInfo: {
    id: "ket-rw-07",
    title: "KET Reading & Writing Mock 07",
    level: "A2",
    totalTime: 60,
    totalQuestions: 32,
    readingQuestions: 30,
    writingTasks: 2
  },

  reading: {
    parts: [

      // ───── PART 1 (Q1-6) ─────
      {
        partNumber: 1,
        type: "real-world-mcq",
        instruction: "Read the text. Choose the correct answer (A, B or C).",
        items: [
          {
            id: 1,
            sourceType: "sign",
            source: "GATE B12 — Flight 211 to Rome\n\nBoarding starts at 14:35.\nPlease have your passport ready before you come to the gate.",
            question: "What must passengers do before they reach Gate B12?",
            options: [
              { letter: "A", text: "arrive 30 minutes early" },
              { letter: "B", text: "find their passport" },
              { letter: "C", text: "show their ticket here" }
            ],
            correct: "B"
          },
          {
            id: 2,
            sourceType: "notice",
            source: "Welcome to BEACH VIEW HOTEL!\n\nBreakfast: 7 – 10 a.m. on the ground floor.\nPool: open 9 a.m. – 8 p.m.\nFree wifi password: 'beachview2025'",
            question: "Where can guests have breakfast?",
            options: [
              { letter: "A", text: "on the ground floor of the hotel" },
              { letter: "B", text: "by the swimming pool" },
              { letter: "C", text: "in their hotel room" }
            ],
            correct: "A"
          },
          {
            id: 3,
            sourceType: "notice",
            source: "PLATFORM 4\n\nThe 14:35 train to Manchester is delayed by 20 minutes.\nSorry for any problems.",
            question: "What does the notice tell passengers?",
            options: [
              { letter: "A", text: "They are sorry the train has been cancelled." },
              { letter: "B", text: "The train will leave 20 minutes later than planned." },
              { letter: "C", text: "Passengers will need a new ticket today." }
            ],
            correct: "B"
          },
          {
            id: 4,
            sourceType: "text-message",
            source: "Hi Mrs Lee,\n\nI'm in a yellow taxi outside the airport. I will be at your hotel in about 25 minutes — there is a lot of traffic on the road today.\n\nDriver Ian",
            question: "Why is Ian writing to Mrs Lee?",
            options: [
              { letter: "A", text: "to ask for a different hotel" },
              { letter: "B", text: "to say his arrival time will be later" },
              { letter: "C", text: "to tell her the airport is closed" }
            ],
            correct: "B"
          },
          {
            id: 5,
            sourceType: "email",
            source: "Dear Family,\n\nThe tour bus on Wednesday will leave from the city centre, NOT from the hotel. Please be at the bus stop near the museum by 8:50 a.m.\n\nCity Tours",
            question: "Where will the tour bus leave from on Wednesday?",
            options: [
              { letter: "A", text: "the bus stop near the museum" },
              { letter: "B", text: "inside the city museum" },
              { letter: "C", text: "the family's hotel" }
            ],
            correct: "A"
          },
          {
            id: 6,
            sourceType: "sign",
            source: "LOST LUGGAGE OFFICE\n\nOpen daily 7 a.m. – 11 p.m.\nPlease bring your ticket and information about your bag.",
            question: "What should travellers bring to the lost luggage office?",
            options: [
              { letter: "A", text: "a photo of themselves" },
              { letter: "B", text: "their ticket and details about their bag" },
              { letter: "C", text: "a colour picture of the bag's owner" }
            ],
            correct: "B"
          }
        ]
      },

      // ───── PART 2 (Q7-13) ─────
      {
        partNumber: 2,
        type: "multi-text-matching",
        instruction: "Read the questions and the three texts. For each question, choose the correct answer (A, B or C).",
        topic: "Three young people describe a recent holiday.",
        texts: [
          {
            id: "A",
            title: "Daniel",
            body: "Last summer, I went on a hiking trip to the Alps with my dad. We stayed in a small wooden hotel for ten days. The weather was very cold, even in July, so I wore warm clothes every day. We walked for about six hours each morning, then we ate lunch at small mountain cafés. My favourite memory is when we saw three wild deer on a quiet path. I took lots of photos to show my friends back home."
          },
          {
            id: "B",
            title: "Layla",
            body: "I visited Paris with my mum and my older sister last spring. We stayed in a small flat near the river. Every day we visited a different museum or famous building. The weather was sunny, but the streets were always full of tourists. The food was wonderful — I tried snails for the first time! In the evenings, we walked along the river before going home to sleep."
          },
          {
            id: "C",
            title: "Tomás",
            body: "My grandparents live on a small island, so we visit them every summer. We stay at their house, which is only a five-minute walk from the beach. I usually swim in the sea every day. My grandfather has a small boat, and last year he taught me how to fish. We caught two big fish, but I didn't want to eat them. My grandmother said I am too kind to be a fisherman!"
          }
        ],
        questions: [
          { id: 7,  prompt: "Which person stayed near a river?",                    correct: "B" },
          { id: 8,  prompt: "Which person visited family members on holiday?",      correct: "C" },
          { id: 9,  prompt: "Which person learned a new skill on holiday?",         correct: "C" },
          { id: 10, prompt: "Which person walked for many hours each morning?",     correct: "A" },
          { id: 11, prompt: "Which person tried food they had never eaten before?", correct: "B" },
          { id: 12, prompt: "Which person needed warm clothes on the trip?",        correct: "A" },
          { id: 13, prompt: "Which person took lots of photographs?",               correct: "A" }
        ]
      },

      // ───── PART 3 (Q14-18) ─────
      {
        partNumber: 3,
        type: "long-text-mcq",
        instruction: "Read the text and questions. For each question, choose the correct answer (A, B or C).",
        title: "Carlos's Free City Tours",
        passage:
          "Carlos is fifteen years old and lives in a beautiful old city in southern Spain. About a year ago, he had an idea: why not show visitors around his city for free? Carlos noticed that many tourists looked lost in the small streets near his home, so he started by helping a few people find their way.\n\nNow, every Saturday at 10 a.m., Carlos meets visitors near the old church in the city square. He shows them the most interesting places — the small museum, the old market, and the hidden streets that not many tourists visit. The walking tour takes about two hours. Carlos does not ask for any money, but his visitors usually give him a small tip at the end. He saves all this money for university.\n\nCarlos's parents help him by making small printed maps. His older sister speaks four languages — Spanish, English, French and Italian — and she has taught him useful words in each one. Carlos says the most surprising thing is how kind most tourists are. Many of them send him postcards from their countries when they get home. He has a big map on his wall now, with pins showing all the cities his visitors come from.",
        questions: [
          {
            id: 14,
            prompt: "Why did Carlos start giving tours?",
            options: [
              { letter: "A", text: "He wanted to make some money." },
              { letter: "B", text: "He wanted to help lost tourists." },
              { letter: "C", text: "His parents asked him to do it." }
            ],
            correct: "B"
          },
          {
            id: 15,
            prompt: "Where does Carlos meet visitors at the start of the tour?",
            options: [
              { letter: "A", text: "outside his own home" },
              { letter: "B", text: "near the old church in the square" },
              { letter: "C", text: "at the entrance of the city museum" }
            ],
            correct: "B"
          },
          {
            id: 16,
            prompt: "What does Carlos do with the money he gets?",
            options: [
              { letter: "A", text: "He saves it for university." },
              { letter: "B", text: "He gives it to his parents." },
              { letter: "C", text: "He buys things for his sister." }
            ],
            correct: "A"
          },
          {
            id: 17,
            prompt: "How did Carlos learn useful words in different languages?",
            options: [
              { letter: "A", text: "He took classes at school." },
              { letter: "B", text: "His sister taught him." },
              { letter: "C", text: "The tourists wrote them down for him." }
            ],
            correct: "B"
          },
          {
            id: 18,
            prompt: "What does Carlos do with the postcards he gets?",
            options: [
              { letter: "A", text: "He sells them to other tourists." },
              { letter: "B", text: "He puts pins on a big map for them." },
              { letter: "C", text: "He sends them back as letters." }
            ],
            correct: "B"
          }
        ]
      },

      // ───── PART 4 (Q19-24) ─────
      {
        partNumber: 4,
        type: "cloze-mcq",
        instruction: "Read the text. Choose the best word (A, B or C) for each space.",
        title: "Whales",
        text:
          "Whales are huge animals that live in all the world's seas. ___1___ they live in water, they are not fish — they are mammals like dogs and cats. This means whales must come up to ___2___ air, just like we do.\n\nThe blue whale is the ___3___ animal that has ever lived on our planet — it can be more than thirty metres long. Other whales are ___4___, but they are still very big. Most whales travel very far every year, looking ___5___ food and warmer waters. Sadly, many kinds of whale are now in danger because of changes ___6___ humans cause in the sea.",
        gaps: [
          { id: 19, options: [ {letter:"A",text:"Although"}, {letter:"B",text:"Because"},  {letter:"C",text:"If"} ],         correct: "A" },
          { id: 20, options: [ {letter:"A",text:"breathe"},  {letter:"B",text:"drink"},    {letter:"C",text:"eat"} ],        correct: "A" },
          { id: 21, options: [ {letter:"A",text:"smallest"}, {letter:"B",text:"biggest"},  {letter:"C",text:"oldest"} ],     correct: "B" },
          { id: 22, options: [ {letter:"A",text:"shorter"},  {letter:"B",text:"smaller"},  {letter:"C",text:"thinner"} ],    correct: "B" },
          { id: 23, options: [ {letter:"A",text:"in"},       {letter:"B",text:"at"},       {letter:"C",text:"for"} ],        correct: "C" },
          { id: 24, options: [ {letter:"A",text:"who"},      {letter:"B",text:"when"},     {letter:"C",text:"that"} ],       correct: "C" }
        ]
      },

      // ───── PART 5 (Q25-30) ─────
      {
        partNumber: 5,
        type: "cloze-open",
        instruction: "Read the email. Write ONE word for each space.",
        text:
          "Hi Sara,\n\nHow ___1___ you? I'm writing to tell you ___2___ a school trip. We are going to a science museum next Friday. Mr Lewis says we need ___3___ bring a packed lunch, ___4___ there is no café there. Would you like to come and have dinner ___5___ me when I get back? Maybe Saturday evening ___6___ my house?\n\nWrite back soon!\nLeo",
        gaps: [
          { id: 25, accept: ["are"] },
          { id: 26, accept: ["about"] },
          { id: 27, accept: ["to"] },
          { id: 28, accept: ["because"] },
          { id: 29, accept: ["with"] },
          { id: 30, accept: ["at"] }
        ]
      }
    ]
  },

  writing: {
    parts: [
      {
        partNumber: 6,
        type: "guided-writing",
        taskType: "Email",
        recipient: "Theo",
        instruction: "Your cousin Theo lives in another city. Write an email inviting Theo to visit you next month.",
        instructionDetail: "In your email:",
        bullets: [
          "say what you can do together",
          "tell Theo what to bring",
          "say which date is best for you"
        ],
        wordMin: 25,
        wordMax: 50,
        scoringRubric: "Award full marks if the candidate addresses all three bullets clearly, uses A2-appropriate vocabulary and grammar, and writes 25 words or more."
      },
      {
        partNumber: 7,
        type: "picture-story",
        taskType: "Story",
        instruction: "Look at the three pictures. Write the story shown in the pictures.",
        wordMin: 35,
        wordMax: 60,
        // Pexels — Kindelmedia (free for commercial use)
        pictures: [
          { id: 1, alt: "A young girl playing in the sand on a sunny beach.",                caption: "1. Lila plays in the sand.",      imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%207/picture-story/scene-1.jpg" },
          { id: 2, alt: "A cheerful child in colourful swimwear plays happily on the beach.", caption: "2. She has fun in the sun.",     imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%207/picture-story/scene-2.jpg" },
          { id: 3, alt: "A child enjoying a sunny day at the beach with toys.",              caption: "3. She builds a sandcastle.",     imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%207/picture-story/scene-3.jpg" }
        ],
        scoringRubric: "Award full marks if the response describes all three pictures, uses A2-appropriate past or present tense, and writes 35 words or more."
      }
    ]
  }
};
