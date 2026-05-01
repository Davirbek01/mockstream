// KET (A2 Key) Reading & Writing — Mock 08
// Theme: pets & animals. All content original (Mock Stream).

window.KET_RW_TEST = {
  testInfo: {
    id: "ket-rw-08",
    title: "KET Reading & Writing Mock 08",
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
            source: "BLUE PAW VETS\n\nMon – Fri: 8 a.m. – 7 p.m.\nSaturday: 9 a.m. – 1 p.m.\nClosed Sundays.\nEmergency line open 24 hours.",
            question: "When can you visit Blue Paw Vets?",
            options: [
              { letter: "A", text: "only on weekdays" },
              { letter: "B", text: "on six days each week" },
              { letter: "C", text: "every day of the week" }
            ],
            correct: "B"
          },
          {
            id: 2,
            sourceType: "sign",
            source: "PETS WORLD SHOP\n\nThis week only:\n20% off all dog food.\nGet a free brush when you buy a basket.",
            question: "What is special this week?",
            options: [
              { letter: "A", text: "Dog food is cheaper than usual." },
              { letter: "B", text: "All baskets come with a free brush." },
              { letter: "C", text: "All brushes are 20% off." }
            ],
            correct: "A"
          },
          {
            id: 3,
            sourceType: "notice",
            source: "OAK TREE ANIMAL SHELTER\n\nWe have 12 cats and 8 dogs looking for new families.\nVisit us any weekend, 10 a.m. – 5 p.m.",
            question: "When can people visit the shelter?",
            options: [
              { letter: "A", text: "every day of the week" },
              { letter: "B", text: "only at the weekend" },
              { letter: "C", text: "on Mondays only" }
            ],
            correct: "B"
          },
          {
            id: 4,
            sourceType: "text-message",
            source: "Hi Mr Brown,\n\nI will be at your house at 4 p.m. instead of 3 today. I am running a bit late because of the traffic. Sorry!\n\nDog walker Anya",
            question: "Why is Anya writing to Mr Brown?",
            options: [
              { letter: "A", text: "to tell him she will arrive later" },
              { letter: "B", text: "to ask him for help with the dog" },
              { letter: "C", text: "to cancel today's walk completely" }
            ],
            correct: "A"
          },
          {
            id: 5,
            sourceType: "notice",
            source: "CITY AQUARIUM\n\nFish feeding: every day at 11 a.m. and 3 p.m.\nPenguin feeding: only at 2 p.m.\nLast entry: 5 p.m.",
            question: "When are the penguins fed?",
            options: [
              { letter: "A", text: "only once a day, at 2 p.m." },
              { letter: "B", text: "twice a day" },
              { letter: "C", text: "just before the aquarium closes" }
            ],
            correct: "A"
          },
          {
            id: 6,
            sourceType: "email",
            source: "Dear Lara,\n\nThanks for booking 5 student tickets for City Zoo on 18 May. The tickets are at the main entrance — please bring a school letter and the names of the students. Tickets cannot be used on a different day.",
            question: "What does Lara need to bring on 18 May?",
            options: [
              { letter: "A", text: "just her school letter" },
              { letter: "B", text: "a school letter and a list of student names" },
              { letter: "C", text: "one ticket for each student" }
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
        topic: "Three young people describe a pet.",
        texts: [
          {
            id: "A",
            title: "Maya",
            body: "My pet is a small white rabbit called Snowy. My uncle gave her to me two years ago. Snowy lives in a big cage in our garden, but I let her run on the grass for an hour every day. She loves carrots and apples, but she's not allowed to eat too many — my mum says they will make her sick. I clean her cage every Sunday morning before breakfast. Snowy is very quiet and never bites — she's the perfect pet for me."
          },
          {
            id: "B",
            title: "Eleni",
            body: "I have a green parrot called Pico. He is six years old, but my mum says parrots like Pico can live for fifty years! Pico can say about ten words now, and he is learning new ones every month. He loves to sit on my shoulder while I do my homework. He is also very noisy in the morning, especially when the sun comes up. My grandfather is the only one in our family who lets Pico bite his finger — he says it doesn't hurt much."
          },
          {
            id: "C",
            title: "Sebastian",
            body: "My pet is a small turtle called Rocky. I gave him his name because he hides under stones all day. Rocky lives in a glass tank in my bedroom. I feed him special food twice a day, and I also give him small pieces of fruit. The most interesting thing about Rocky is that he is older than me — my parents bought him before I was born!"
          }
        ],
        questions: [
          { id: 7,  prompt: "Whose pet was given to them by a relative?",                correct: "A" },
          { id: 8,  prompt: "Whose pet is the noisiest?",                                correct: "B" },
          { id: 9,  prompt: "Whose pet is older than its owner?",                         correct: "C" },
          { id: 10, prompt: "Who feeds their pet special food twice a day?",              correct: "C" },
          { id: 11, prompt: "Whose pet can say some words?",                              correct: "B" },
          { id: 12, prompt: "Who lets their pet run on the grass every day?",             correct: "A" },
          { id: 13, prompt: "Whose pet sometimes sits on them while they study?",         correct: "B" }
        ]
      },

      // ───── PART 3 (Q14-18) ─────
      {
        partNumber: 3,
        type: "long-text-mcq",
        instruction: "Read the text and questions. For each question, choose the correct answer (A, B or C).",
        title: "Yara at the Cat Shelter",
        passage:
          "Yara is thirteen years old. She has loved cats since she was very small — her family has three. Two years ago, her mother started taking her to a small cat shelter once a week to help. The shelter looks after cats that don't have a home yet. There are usually about twenty cats there at any time.\n\nWhen Yara first started, the manager Mrs Patel only let her clean the food bowls and give the cats fresh water. Now, Yara does much more important jobs. Every Saturday, she helps with the new cats that arrive. She sits with them for half an hour to make them feel calm and safe. Some new cats are very afraid of people at first.\n\nLast year, Yara had an idea. She made a small website with photos and stories of every cat at the shelter. Now, when families want to give a cat a new home, they can read about each cat first. Twenty-eight cats have found new homes this way! Yara updates the website every Sunday afternoon. The shelter manager says Yara is one of their most useful helpers, even though she is the youngest.",
        questions: [
          {
            id: 14,
            prompt: "How does Yara help the new cats?",
            options: [
              { letter: "A", text: "She gives them special food and water." },
              { letter: "B", text: "She sits with them to help them feel calm." },
              { letter: "C", text: "She gives every cat a new name." }
            ],
            correct: "B"
          },
          {
            id: 15,
            prompt: "What did Yara do at the shelter at the very beginning?",
            options: [
              { letter: "A", text: "She cleaned bowls and gave fresh water." },
              { letter: "B", text: "She took photos of all the cats." },
              { letter: "C", text: "She trained the older cats." }
            ],
            correct: "A"
          },
          {
            id: 16,
            prompt: "What was Yara's idea last year?",
            options: [
              { letter: "A", text: "to make a website about the cats" },
              { letter: "B", text: "to start a new cat shelter herself" },
              { letter: "C", text: "to take a cat home with her" }
            ],
            correct: "A"
          },
          {
            id: 17,
            prompt: "How often does Yara update the website?",
            options: [
              { letter: "A", text: "every Saturday" },
              { letter: "B", text: "every Sunday" },
              { letter: "C", text: "every day of the week" }
            ],
            correct: "B"
          },
          {
            id: 18,
            prompt: "What does the shelter manager say about Yara?",
            options: [
              { letter: "A", text: "Yara is the loudest helper." },
              { letter: "B", text: "Yara is one of the most useful helpers." },
              { letter: "C", text: "Yara should bring more friends." }
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
        title: "Elephants",
        text:
          "Elephants are the largest land animals in the world. They live in two ___1___ places — Africa and Asia — and the African elephant is the bigger of the two. Elephants are easy to recognise because of their long noses, which we call 'trunks'. They use their trunks ___2___ many things, including eating and drinking.\n\nElephants live in groups called herds. The leader is usually the oldest mother. A baby elephant ___3___ called a calf. It can stand and walk just an hour after it is born, but it ___4___ very close to its mother for many years.\n\nElephants need a lot of food and water, ___5___ they travel many kilometres every day to find them. Sadly, the number of elephants in the world is becoming ___6___.",
        gaps: [
          { id: 19, options: [ {letter:"A",text:"same"},     {letter:"B",text:"different"}, {letter:"C",text:"large"} ],   correct: "B" },
          { id: 20, options: [ {letter:"A",text:"by"},       {letter:"B",text:"at"},        {letter:"C",text:"for"} ],     correct: "C" },
          { id: 21, options: [ {letter:"A",text:"has"},      {letter:"B",text:"is"},        {letter:"C",text:"does"} ],    correct: "B" },
          { id: 22, options: [ {letter:"A",text:"stays"},    {letter:"B",text:"makes"},     {letter:"C",text:"takes"} ],   correct: "A" },
          { id: 23, options: [ {letter:"A",text:"but"},      {letter:"B",text:"or"},        {letter:"C",text:"so"} ],      correct: "C" },
          { id: 24, options: [ {letter:"A",text:"bigger"},   {letter:"B",text:"smaller"},   {letter:"C",text:"faster"} ],  correct: "B" }
        ]
      },

      // ───── PART 5 (Q25-30) ─────
      {
        partNumber: 5,
        type: "cloze-open",
        instruction: "Read the email. Write ONE word for each space.",
        text:
          "Hi Hugo,\n\nHow ___1___ you? I want to tell ___2___ about something new. I started helping at our local animal shelter ___3___ week. We look ___4___ cats and dogs that don't have a home yet. Would you ___5___ to help with me ___6___ Sunday afternoon? It is hard work but a lot of fun!\n\nWrite back soon!\nMaya",
        gaps: [
          { id: 25, accept: ["are"] },
          { id: 26, accept: ["you"] },
          { id: 27, accept: ["last","this"] },
          { id: 28, accept: ["after"] },
          { id: 29, accept: ["like"] },
          { id: 30, accept: ["on","On"] }
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
        recipient: "Hugo",
        instruction: "Your friend Hugo has a new dog. Write an email to invite Hugo to go for a walk with the dog this weekend.",
        instructionDetail: "In your email:",
        bullets: [
          "say which day is best for you",
          "ask Hugo where to meet",
          "offer to bring something for the dog"
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
        // Pexels — Katya Wolf (free for commercial use)
        pictures: [
          { id: 1, alt: "A young boy with a small white dog at home.",       caption: "1. Tom meets a new puppy.",       imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%208/picture-story/scene-1.jpg" },
          { id: 2, alt: "A boy playing with a dog wearing a costume.",       caption: "2. They play together.",          imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%208/picture-story/scene-2.jpg" },
          { id: 3, alt: "A white dog standing happily near a boy.",          caption: "3. Now they are best friends.",   imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%208/picture-story/scene-3.jpg" }
        ],
        scoringRubric: "Award full marks if the response describes all three pictures, uses A2-appropriate past or present tense, and writes 35 words or more."
      }
    ]
  }
};
