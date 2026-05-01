// KET (A2 Key) Reading & Writing — Mock 06
// Theme: cooking, baking & food. All content original (Mock Stream).

window.KET_RW_TEST = {
  testInfo: {
    id: "ket-rw-06",
    title: "KET Reading & Writing Mock 06",
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
            sourceType: "notice",
            source: "GOLDEN BAKERY\n\nFresh bread baked every morning at 6 a.m.\nSaturdays: extra cakes, ready by 10 a.m.",
            question: "What does the notice say?",
            options: [
              { letter: "A", text: "The bakery only sells cakes on Saturdays." },
              { letter: "B", text: "There are extra cakes on Saturday mornings." },
              { letter: "C", text: "Fresh bread is baked twice every day." }
            ],
            correct: "B"
          },
          {
            id: 2,
            sourceType: "note",
            source: "Tom,\n\nToday's lunch is in the green box (sandwich + apple). Don't forget your water bottle is on the kitchen counter!\n\nMum",
            question: "Why is Mum writing to Tom?",
            options: [
              { letter: "A", text: "to remind him about his water bottle" },
              { letter: "B", text: "to ask him what to bring for lunch" },
              { letter: "C", text: "to say sorry for forgetting his lunch" }
            ],
            correct: "A"
          },
          {
            id: 3,
            sourceType: "sign",
            source: "GREEN LEAF CAFE\n\nToday's special: vegetable pasta — £6\nDrinks not included.\nChildren's portions: HALF PRICE.",
            question: "What does the notice tell customers?",
            options: [
              { letter: "A", text: "Drinks come free with the pasta dish." },
              { letter: "B", text: "Children pay less for their portions." },
              { letter: "C", text: "The cafe only serves pasta today." }
            ],
            correct: "B"
          },
          {
            id: 4,
            sourceType: "email",
            source: "Hi Anna,\n\nI'm sorry — there are no free tables at our café for Saturday at 7 p.m. We have a free table at 8 p.m. or another at 6 p.m. Please tell me which time is best for you.\n\nManager",
            question: "What does the manager want Anna to do?",
            options: [
              { letter: "A", text: "choose a different day" },
              { letter: "B", text: "choose a new time on Saturday" },
              { letter: "C", text: "find a different café" }
            ],
            correct: "B"
          },
          {
            id: 5,
            sourceType: "sign",
            source: "FRESH FOOD MARKET\n\nSPECIAL OFFER\nBuy 2 pizzas — get a small bottle of water FREE.\nThis week only.",
            question: "What is the special offer this week?",
            options: [
              { letter: "A", text: "All pizzas are free this week." },
              { letter: "B", text: "Customers get free water if they buy two pizzas." },
              { letter: "C", text: "Water is cheaper than usual." }
            ],
            correct: "B"
          },
          {
            id: 6,
            sourceType: "email",
            source: "Hi Bilal,\n\nI hope you can come to our cooking class on Saturday afternoon. We are making pancakes — please bring an apron, but we have all the food and the pans here.\n\nMr Chen",
            question: "What does Mr Chen want Bilal to bring?",
            options: [
              { letter: "A", text: "an apron" },
              { letter: "B", text: "food and pans" },
              { letter: "C", text: "some pancakes" }
            ],
            correct: "A"
          }
        ]
      },

      // ───── PART 2 (Q7-13) ─────
      {
        partNumber: 2,
        type: "multi-text-matching",
        instruction: "Read the questions and the three texts. For each question, choose the correct answer (A, B or C).",
        topic: "Three young cooks describe a favourite recipe.",
        texts: [
          {
            id: "A",
            title: "Hassan",
            body: "My favourite thing to cook is tagine — a slow-cooked dish from Morocco. My grandmother taught me how to make it. We use lamb, vegetables and lots of different spices, and it cooks in a special clay pot for two or three hours. The kitchen smells amazing! I usually cook tagine on Sunday for my whole family. We sit around the table and eat it together with bread."
          },
          {
            id: "B",
            title: "Mei-Lin",
            body: "I love making dumplings. My mum and I started cooking them together when I was about ten. We make the soft pasta first, then we put the meat or vegetables inside. The most fun part is folding the little parcels — it took me a long time to get them looking right. We steam them for about fifteen minutes. I sometimes sell my dumplings at the school food fair."
          },
          {
            id: "C",
            title: "Sofia",
            body: "I make a really good apple pie. The recipe is from my great-grandmother — she wrote it in a small book over fifty years ago, and now I follow her instructions exactly. It takes about an hour to prepare, but most of that time is just waiting for the pie to cook in the oven. I bake one every Saturday and we eat it warm in the evening with cold ice cream."
          }
        ],
        questions: [
          { id: 7,  prompt: "Whose recipe comes from a very old family book?",                 correct: "C" },
          { id: 8,  prompt: "Who started cooking with their mother as a child?",               correct: "B" },
          { id: 9,  prompt: "Whose dish takes the longest time to cook?",                       correct: "A" },
          { id: 10, prompt: "Who sells their food at school?",                                  correct: "B" },
          { id: 11, prompt: "Who learned how to cook from a grandmother?",                      correct: "A" },
          { id: 12, prompt: "Who cooks the same food on the same day every week?",              correct: "C" },
          { id: 13, prompt: "Who says the most fun part is folding the food?",                  correct: "B" }
        ]
      },

      // ───── PART 3 (Q14-18) ─────
      {
        partNumber: 3,
        type: "long-text-mcq",
        instruction: "Read the text and questions. For each question, choose the correct answer (A, B or C).",
        title: "Talia at the Bakery",
        passage:
          "Talia is fifteen years old. Her grandmother runs a small bakery in the centre of their town. The bakery is famous for its honey bread, and people come from villages many kilometres away to buy it. Talia has been helping her grandmother in the bakery since she was twelve. She works there every Saturday and during school holidays.\n\nWhen Talia first started, she was only allowed to clean the tables and serve the customers. After a few months, her grandmother taught her how to make the easier breads. Now, Talia can make ten different kinds of bread by herself. She gets up at four in the morning, so the bread is ready by the time the bakery opens at seven.\n\nLast summer, Talia had an idea. She suggested that they sell smaller loaves for one person. Her grandmother liked the idea, so they tried it. The smaller loaves became very popular, especially with people who live alone. Talia is also writing a book of all her grandmother's recipes. She wants to keep them safe for her own children one day. Her grandmother has agreed to help her, but she has asked Talia not to share the honey bread recipe with anyone.",
        questions: [
          {
            id: 14,
            prompt: "How long has Talia been helping in the bakery?",
            options: [
              { letter: "A", text: "since she was four years old" },
              { letter: "B", text: "for about three years" },
              { letter: "C", text: "since last summer" }
            ],
            correct: "B"
          },
          {
            id: 15,
            prompt: "What did Talia do in the bakery at the very beginning?",
            options: [
              { letter: "A", text: "She baked the easier breads." },
              { letter: "B", text: "She helped her grandmother choose recipes." },
              { letter: "C", text: "She cleaned tables and served customers." }
            ],
            correct: "C"
          },
          {
            id: 16,
            prompt: "Why does Talia get up so early in the morning?",
            options: [
              { letter: "A", text: "to help with the breakfast at home" },
              { letter: "B", text: "to have the bread ready when the bakery opens" },
              { letter: "C", text: "to wake up her grandmother" }
            ],
            correct: "B"
          },
          {
            id: 17,
            prompt: "What was Talia's idea last summer?",
            options: [
              { letter: "A", text: "to bake smaller loaves of bread" },
              { letter: "B", text: "to open the bakery on Sundays too" },
              { letter: "C", text: "to start selling cakes" }
            ],
            correct: "A"
          },
          {
            id: 18,
            prompt: "Why is Talia writing the recipe book?",
            options: [
              { letter: "A", text: "to share the recipes online" },
              { letter: "B", text: "to keep the recipes for her future family" },
              { letter: "C", text: "to win a baking competition" }
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
        title: "Tea",
        text:
          "Tea is one of the most popular drinks in the world. It comes ___1___ a small green plant that grows in warm countries like India, China and Sri Lanka. The leaves of the plant are picked, dried and ___2___ packed in boxes or small bags.\n\nThere are ___3___ different kinds of tea: black, green and white. Each kind has its own special taste. In some countries, people add milk and ___4___ to their tea, but in others they drink it without anything else. Drinking tea is sometimes a special activity. ___5___ Japan, for example, the tea ceremony is a beautiful tradition. Today, more ___6___ four billion cups of tea are drunk every day around the world.",
        gaps: [
          { id: 19, options: [ {letter:"A",text:"from"},     {letter:"B",text:"on"},        {letter:"C",text:"by"} ],      correct: "A" },
          { id: 20, options: [ {letter:"A",text:"then"},     {letter:"B",text:"so"},        {letter:"C",text:"also"} ],    correct: "A" },
          { id: 21, options: [ {letter:"A",text:"several"},  {letter:"B",text:"many"},      {letter:"C",text:"each"} ],    correct: "B" },
          { id: 22, options: [ {letter:"A",text:"water"},    {letter:"B",text:"sugar"},     {letter:"C",text:"juice"} ],   correct: "B" },
          { id: 23, options: [ {letter:"A",text:"On"},       {letter:"B",text:"In"},        {letter:"C",text:"At"} ],      correct: "B" },
          { id: 24, options: [ {letter:"A",text:"than"},     {letter:"B",text:"from"},      {letter:"C",text:"of"} ],      correct: "A" }
        ]
      },

      // ───── PART 5 (Q25-30) ─────
      {
        partNumber: 5,
        type: "cloze-open",
        instruction: "Read the email. Write ONE word for each space.",
        text:
          "Hi Bilal,\n\nHow ___1___ you? I'm writing about the cooking class. Sara from school told ___2___ that she wants to try a class ___3___ us. She ___4___ coming on Saturday for ___5___ first time. Could ___6___ come at 9:30 instead of 10? I want to introduce her to everyone.\n\nThanks!\nLia",
        gaps: [
          { id: 25, accept: ["are"] },
          { id: 26, accept: ["me"] },
          { id: 27, accept: ["with"] },
          { id: 28, accept: ["is","'s"] },
          { id: 29, accept: ["the"] },
          { id: 30, accept: ["you"] }
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
        recipient: "Daisy",
        instruction: "You are going on a picnic next Sunday. Write an email inviting your friend Daisy to come.",
        instructionDetail: "In your email:",
        bullets: [
          "say where the picnic will be",
          "tell Daisy what time to meet you",
          "ask Daisy to bring some food"
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
        // Pexels — Gustavo Fring (free for commercial use)
        pictures: [
          { id: 1, alt: "A cheerful child holding a cookie cutter, ready to bake.",                caption: "1. Anya wants to make cookies.",          imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%206/picture-story/scene-1.jpg" },
          { id: 2, alt: "A smiling girl with messy hands taking dough from a glass bowl.",         caption: "2. She makes the cookie dough.",          imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%206/picture-story/scene-2.jpg" },
          { id: 3, alt: "Grandmother and granddaughter baking cookies together in the kitchen.",   caption: "3. She bakes them with her grandmother.", imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%206/picture-story/scene-3.jpg" }
        ],
        scoringRubric: "Award full marks if the response describes all three pictures, uses A2-appropriate past or present tense, and writes 35 words or more."
      }
    ]
  }
};
