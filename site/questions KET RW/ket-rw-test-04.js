// KET (A2 Key) Reading & Writing — Mock 04
// Theme: nature, gardens & the outdoors. All content original (Mock Stream).

window.KET_RW_TEST = {
  testInfo: {
    id: "ket-rw-04",
    title: "KET Reading & Writing Mock 04",
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
            source: "GREEN VALLEY GARDEN CENTRE\n\nOpen daily 9 a.m. – 6 p.m.\nOn Saturdays we close at 5 p.m. for our weekly tree-planting event.",
            question: "What does the notice say?",
            options: [
              { letter: "A", text: "The garden centre is closed all Saturday." },
              { letter: "B", text: "The centre opens later on Saturdays." },
              { letter: "C", text: "Saturdays have shorter opening hours." }
            ],
            correct: "C"
          },
          {
            id: 2,
            sourceType: "sign",
            source: "OAK HILL TRAIL — 4 km\n\nPlease stay on the path.\nTake all rubbish home with you.\nDogs welcome (on a lead).",
            question: "At Oak Hill Trail you must",
            options: [
              { letter: "A", text: "leave your dog at home." },
              { letter: "B", text: "take your rubbish away with you." },
              { letter: "C", text: "walk only 4 km maximum." }
            ],
            correct: "B"
          },
          {
            id: 3,
            sourceType: "notice",
            source: "OAKWOOD LAKE\n\nFishing season: April – October only\nJunior fishing (under 16): FREE\nAdults: £10 per day",
            question: "What does the notice tell you?",
            options: [
              { letter: "A", text: "Children pay less than adults to fish." },
              { letter: "B", text: "Children under 16 don't pay anything to fish." },
              { letter: "C", text: "All fishing is free in October." }
            ],
            correct: "B"
          },
          {
            id: 4,
            sourceType: "notice",
            source: "BLUE BEAR FITNESS\n\nThis week only: Monday yoga class moved to Tuesday (same time).\nAll other classes are running normally.",
            question: "What is different this week at Blue Bear Fitness?",
            options: [
              { letter: "A", text: "Monday's yoga class is on a different day." },
              { letter: "B", text: "There are no classes this week." },
              { letter: "C", text: "The yoga teacher has changed." }
            ],
            correct: "A"
          },
          {
            id: 5,
            sourceType: "email",
            source: "Hi Sara,\n\nThe weather forecast shows heavy rain for our nature walk on Saturday. We will move it to Sunday at the same time. Same meeting place — by the bridge.\n\nLeader Greg",
            question: "Why is Greg writing to Sara?",
            options: [
              { letter: "A", text: "to cancel the nature walk completely" },
              { letter: "B", text: "to change the day of the walk" },
              { letter: "C", text: "to ask Sara for a new meeting place" }
            ],
            correct: "B"
          },
          {
            id: 6,
            sourceType: "sign",
            source: "WILDFIELD WILDLIFE PARK\n\nLast entry: 4:30 p.m.\nWe close at 6:00 p.m.\nPlease don't feed the animals.",
            question: "What does the notice tell visitors?",
            options: [
              { letter: "A", text: "They must arrive by 4:30 p.m. to come in." },
              { letter: "B", text: "They must leave by 4:30 p.m." },
              { letter: "C", text: "They can give food to small animals." }
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
        topic: "Three young people describe their garden.",
        texts: [
          {
            id: "A",
            title: "Anna",
            body: "I live in a small flat in the city centre, so my 'garden' is really just my balcony. I have about twenty plants in pots, mostly herbs like basil and mint, and some flowers. My favourite is the small lemon tree my grandmother gave me last year. It has not given me any lemons yet, but the leaves smell lovely. I water everything early in the morning before I go to school."
          },
          {
            id: "B",
            title: "Ben",
            body: "My family lives in the countryside, and we have a big garden behind the house. My parents grow vegetables — potatoes, carrots, beans — and my mum bakes cakes from the apples we get from our tree every autumn. I help by collecting the apples and taking them to the kitchen. I also have my own small area where I grow strawberries. I share them with my little sister."
          },
          {
            id: "C",
            title: "Carla",
            body: "At my school we have a special garden behind the science building. Every Wednesday after class, the gardening club meets to look after it. About fifteen students go to the meetings. We grow flowers and a few vegetables. Last summer we sold the vegetables at the school market and gave all the money to a children's hospital. I'm the youngest member, but the older students always help me."
          }
        ],
        questions: [
          { id: 7,  prompt: "Which person grows all their plants in pots?",                    correct: "A" },
          { id: 8,  prompt: "Which person shares fruit with someone in their family?",        correct: "B" },
          { id: 9,  prompt: "Which person works in a garden with other young people?",        correct: "C" },
          { id: 10, prompt: "Which person was given a plant by an older relative?",           correct: "A" },
          { id: 11, prompt: "Which person's garden helps to make money for charity?",         correct: "C" },
          { id: 12, prompt: "Which person's family uses garden fruit for cooking?",           correct: "B" },
          { id: 13, prompt: "Which person waters their plants very early in the day?",        correct: "A" }
        ]
      },

      // ───── PART 3 (Q14-18) ─────
      {
        partNumber: 3,
        type: "long-text-mcq",
        instruction: "Read the text and questions. For each question, choose the correct answer (A, B or C).",
        title: "Aiden's Bird Photos",
        passage:
          "Aiden is fourteen years old. He lives in a small village near a forest, and he has loved birds since he was very young. Two years ago, his parents gave him a small camera for his birthday. Since then, he has taken more than three thousand photos of birds.\n\nAiden often gets up at five in the morning, before the sun rises. He says this is the best time for taking photos because many birds are most active early in the day. He sits very quietly behind some bushes near the river and waits. Sometimes he waits for one hour without taking a single photo. He thinks that being patient is the most important part of bird photography.\n\nAiden writes the name of every bird in a small green notebook, with the date and the place. So far, he has seen seventy-eight different kinds of bird. His best photo is one of a kingfisher catching a fish — it took him six months to get the picture right! Aiden's older sister has put the photo on the family website, and lots of people from his town now visit the website to see Aiden's photos.",
        questions: [
          {
            id: 14,
            prompt: "How did Aiden get his first camera?",
            options: [
              { letter: "A", text: "He bought it himself." },
              { letter: "B", text: "His parents gave it to him as a present." },
              { letter: "C", text: "His sister gave it to him." }
            ],
            correct: "B"
          },
          {
            id: 15,
            prompt: "Why does Aiden go out very early in the morning?",
            options: [
              { letter: "A", text: "He has to go to school later." },
              { letter: "B", text: "More birds are active at that time." },
              { letter: "C", text: "The river is quieter then." }
            ],
            correct: "B"
          },
          {
            id: 16,
            prompt: "What does Aiden say is the most important thing for bird photography?",
            options: [
              { letter: "A", text: "having a good camera" },
              { letter: "B", text: "waiting patiently" },
              { letter: "C", text: "choosing a good place" }
            ],
            correct: "B"
          },
          {
            id: 17,
            prompt: "What does Aiden write in his notebook?",
            options: [
              { letter: "A", text: "the names, dates and places of every bird" },
              { letter: "B", text: "drawings of every bird he sees" },
              { letter: "C", text: "notes about the cameras he has used" }
            ],
            correct: "A"
          },
          {
            id: 18,
            prompt: "Who put Aiden's best photo on the family website?",
            options: [
              { letter: "A", text: "Aiden himself" },
              { letter: "B", text: "Aiden's parents" },
              { letter: "C", text: "Aiden's older sister" }
            ],
            correct: "C"
          }
        ]
      },

      // ───── PART 4 (Q19-24) ─────
      {
        partNumber: 4,
        type: "cloze-mcq",
        instruction: "Read the text. Choose the best word (A, B or C) for each space.",
        title: "Mountains",
        text:
          "Mountains are very high parts of the land. They are found on every continent in the world. There ___1___ many famous mountains, but the highest of all is Mount Everest, in Asia. It is more ___2___ 8,000 metres above sea level. Many mountains have snow on the top all year, ___3___ if it is summer.\n\nClimbing a mountain ___4___ a lot of energy, the right clothes and good boots. Some people climb only for fun, but ___5___ try to be the first to reach the top of a difficult new mountain. Today, climbers from many countries ___6___ to the world's highest mountains every year.",
        gaps: [
          { id: 19, options: [ {letter:"A",text:"are"},      {letter:"B",text:"is"},        {letter:"C",text:"has"} ],     correct: "A" },
          { id: 20, options: [ {letter:"A",text:"than"},     {letter:"B",text:"from"},      {letter:"C",text:"by"} ],      correct: "A" },
          { id: 21, options: [ {letter:"A",text:"also"},     {letter:"B",text:"still"},     {letter:"C",text:"even"} ],    correct: "C" },
          { id: 22, options: [ {letter:"A",text:"takes"},    {letter:"B",text:"gives"},     {letter:"C",text:"makes"} ],   correct: "A" },
          { id: 23, options: [ {letter:"A",text:"another"},  {letter:"B",text:"others"},    {letter:"C",text:"each"} ],    correct: "B" },
          { id: 24, options: [ {letter:"A",text:"travel"},   {letter:"B",text:"live"},      {letter:"C",text:"arrive"} ],  correct: "A" }
        ]
      },

      // ───── PART 5 (Q25-30) ─────
      {
        partNumber: 5,
        type: "cloze-open",
        instruction: "Read the email. Write ONE word for each space.",
        text:
          "Hi Lucia,\n\nHow ___1___ you? I'm writing to tell you ___2___ a great weekend. My family went camping ___3___ Friday to Sunday. We slept ___4___ a tent next to a lake. The weather ___5___ very sunny, and we cooked our food on a small fire. ___6___ Saturday morning, we even saw a deer in the forest!\n\nWrite back soon!\nMia",
        gaps: [
          { id: 25, accept: ["are"] },
          { id: 26, accept: ["about"] },
          { id: 27, accept: ["from"] },
          { id: 28, accept: ["in","inside"] },
          { id: 29, accept: ["was"] },
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
        recipient: "Olga",
        instruction: "Your school is having a tree-planting day next Saturday. Write an email inviting your friend Olga to come.",
        instructionDetail: "In your email:",
        bullets: [
          "say where the tree-planting day will be",
          "tell Olga what time to come",
          "ask Olga to bring something useful"
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
        // Pexels — shkrabaanthony (free for commercial use)
        pictures: [
          { id: 1, alt: "A young girl planting a flower in a clay pot with her mother.",     caption: "1. Sara plants a flower with her mum.",  imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%204/picture-story/scene-1.jpg" },
          { id: 2, alt: "The same girl smiling while holding a potted plant.",               caption: "2. She is happy with her plant.",        imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%204/picture-story/scene-2.jpg" },
          { id: 3, alt: "Mother and daughter watering the plants together.",                 caption: "3. They water the flower every day.",    imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%204/picture-story/scene-3.jpg" }
        ],
        scoringRubric: "Award full marks if the response describes all three pictures, uses A2-appropriate past or present tense, and writes 35 words or more."
      }
    ]
  }
};
