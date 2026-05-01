// KET (A2 Key) Reading & Writing — Mock 05
// Theme: art & creativity. All content original (Mock Stream).

window.KET_RW_TEST = {
  testInfo: {
    id: "ket-rw-05",
    title: "KET Reading & Writing Mock 05",
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
            source: "OAKWOOD ART GALLERY\n\nFree entry every Tuesday afternoon (after 2 p.m.).\nPhotos with phones are OK — no flash, please.",
            question: "What does the notice tell visitors?",
            options: [
              { letter: "A", text: "The gallery is open only on Tuesdays." },
              { letter: "B", text: "Visitors can take photos but not with a flash." },
              { letter: "C", text: "Phone photos cost extra to take." }
            ],
            correct: "B"
          },
          {
            id: 2,
            sourceType: "text-message",
            source: "Hi Mira,\n\nJust to let you know — Saturday's drawing class will be in Studio B (downstairs), not the usual room. Bring your sketchbooks!\n\nMr Lee",
            question: "What does Mr Lee want Mira to know?",
            options: [
              { letter: "A", text: "The class will be in a different room." },
              { letter: "B", text: "The class is cancelled this week." },
              { letter: "C", text: "Mira needs to buy a new sketchbook." }
            ],
            correct: "A"
          },
          {
            id: 3,
            sourceType: "sign",
            source: "COLOURS PAINT SHOP\n\nThis week only:\nBuy any 3 paint pots, get the 4th one FREE!",
            question: "What is happening at the paint shop this week?",
            options: [
              { letter: "A", text: "All paint pots cost less than usual." },
              { letter: "B", text: "Customers get one free pot if they buy three." },
              { letter: "C", text: "The paint shop is closing." }
            ],
            correct: "B"
          },
          {
            id: 4,
            sourceType: "email",
            source: "Dear Tom,\n\nThank you for booking 4 tickets for 'The Magic Forest' on 18 May. Children under 5 enter free, but everyone still needs a ticket. Please arrive 20 minutes before the show starts.",
            question: "Tom should",
            options: [
              { letter: "A", text: "arrive 20 minutes before the show." },
              { letter: "B", text: "buy more tickets at the door." },
              { letter: "C", text: "leave young children at home." }
            ],
            correct: "A"
          },
          {
            id: 5,
            sourceType: "note",
            source: "TO ALL STUDENTS\n\nMrs Roberts is sick this week. Piano lessons are cancelled until next Monday. We will give you the missed lessons next month.",
            question: "What is happening with piano lessons?",
            options: [
              { letter: "A", text: "They will start at a different time." },
              { letter: "B", text: "They will not happen this week." },
              { letter: "C", text: "They have moved to a new school." }
            ],
            correct: "B"
          },
          {
            id: 6,
            sourceType: "notice",
            source: "YOUNG PHOTOGRAPHERS' CLUB\n\nMeeting every Friday, 4 p.m.\nBring your own camera or phone.\nNew members welcome!",
            question: "What does the notice tell us?",
            options: [
              { letter: "A", text: "You must own a camera to come." },
              { letter: "B", text: "New people can join the club." },
              { letter: "C", text: "The club only meets in summer." }
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
        topic: "Three young people describe their art.",
        texts: [
          {
            id: "A",
            title: "Lia",
            body: "I have loved drawing since I was very small. Now I am thirteen, and I draw almost every evening. I usually use pencils, but I sometimes try coloured ones for special pictures. My favourite thing to draw is animals — especially horses. I have a folder with hundreds of drawings, and my parents put my best ones on the wall in our kitchen. I would like to be a children's book illustrator one day."
          },
          {
            id: "B",
            title: "Marco",
            body: "I started painting two years ago, when my aunt gave me a small set of watercolours for my birthday. I paint mostly landscapes — mountains, forests and rivers. I'm very lucky because we have a big garden, and I can paint outside in the summer. I always finish my pictures at home because I need a quiet place. Last month I won a prize at the local art competition. I was very surprised!"
          },
          {
            id: "C",
            title: "Nadia",
            body: "I make small sculptures from clay. I take a class at the local art centre every Wednesday after school. We have a teacher called Jenna, who used to make sculptures for museums in Italy. I usually make small animals or strange faces — they're not always perfect, but I'm getting better. My grandfather has a special shelf in his living room for all my sculptures. He says I should make him a new one every birthday."
          }
        ],
        questions: [
          { id: 7,  prompt: "Which person makes things from clay?",                                correct: "C" },
          { id: 8,  prompt: "Which person sometimes paints outside in the garden?",                correct: "B" },
          { id: 9,  prompt: "Which person started because of a present from a family member?",     correct: "B" },
          { id: 10, prompt: "Which person draws nearly every evening?",                            correct: "A" },
          { id: 11, prompt: "Which person has a teacher who has worked in another country?",       correct: "C" },
          { id: 12, prompt: "Which person has won a prize for their art?",                         correct: "B" },
          { id: 13, prompt: "Which person wants an art job when they are older?",                  correct: "A" }
        ]
      },

      // ───── PART 3 (Q14-18) ─────
      {
        partNumber: 3,
        type: "long-text-mcq",
        instruction: "Read the text and questions. For each question, choose the correct answer (A, B or C).",
        title: "Lucas's Comic Books",
        passage:
          "Lucas is fourteen years old. He has been making his own comic books since he was eight. His first comic was about a little dog who could fly. He drew it on the back of his school notebooks, but his teacher saw it and asked him not to draw in class.\n\nWhen Lucas got home that day, he asked his parents for a special notebook just for his comics. Now Lucas has a shelf with twenty notebooks. Each one is full of comic stories. His most popular character is a girl called Star, who travels through space with her robot dog. Lucas's friends at school love reading his comics.\n\nLast year, Lucas's teacher Miss Adams suggested he should put his comics online. With his older brother's help, Lucas made a simple website. People from many different countries now read his comics. Lucas writes new pages every Saturday morning, before he meets his friends. He says the most difficult part is not the drawing — it is thinking of new ideas for the stories. He hopes to have a real comic book in a shop one day.",
        questions: [
          {
            id: 14,
            prompt: "Why did Lucas's teacher tell him not to draw in class?",
            options: [
              { letter: "A", text: "He drew on his school notebooks." },
              { letter: "B", text: "He drew on the classroom wall." },
              { letter: "C", text: "His drawings were not very good." }
            ],
            correct: "A"
          },
          {
            id: 15,
            prompt: "How many notebooks of comics does Lucas have now?",
            options: [
              { letter: "A", text: "eight" },
              { letter: "B", text: "twenty" },
              { letter: "C", text: "just one" }
            ],
            correct: "B"
          },
          {
            id: 16,
            prompt: "Who is Star?",
            options: [
              { letter: "A", text: "a popular character in Lucas's comics" },
              { letter: "B", text: "a friend of Lucas at school" },
              { letter: "C", text: "Lucas's older brother" }
            ],
            correct: "A"
          },
          {
            id: 17,
            prompt: "Who helped Lucas put his comics online?",
            options: [
              { letter: "A", text: "his teacher Miss Adams" },
              { letter: "B", text: "his older brother" },
              { letter: "C", text: "his school friends" }
            ],
            correct: "B"
          },
          {
            id: 18,
            prompt: "What does Lucas find most difficult?",
            options: [
              { letter: "A", text: "drawing the pictures" },
              { letter: "B", text: "thinking of new story ideas" },
              { letter: "C", text: "finding time on Saturdays" }
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
        title: "Colours",
        text:
          "The world is full of colours, but did you know that some animals see them in a very ___1___ way from us? Dogs, for example, only see a few colours, mostly blue and yellow. Bees can see colours that humans cannot — that is ___2___ they find flowers so easily.\n\nBabies are not born ___3___ to see all the colours we see. In the first few weeks, they ___4___ only see black, white and a little red. The first colour most babies can see clearly is red, ___5___ then they slowly start to see green, yellow and blue. By the time they are about five months old, ___6___ can see most colours like adults.",
        gaps: [
          { id: 19, options: [ {letter:"A",text:"similar"},  {letter:"B",text:"different"}, {letter:"C",text:"equal"} ],   correct: "B" },
          { id: 20, options: [ {letter:"A",text:"how"},      {letter:"B",text:"why"},       {letter:"C",text:"what"} ],    correct: "A" },
          { id: 21, options: [ {letter:"A",text:"ready"},    {letter:"B",text:"able"},      {letter:"C",text:"open"} ],    correct: "B" },
          { id: 22, options: [ {letter:"A",text:"can"},      {letter:"B",text:"will"},      {letter:"C",text:"are"} ],     correct: "A" },
          { id: 23, options: [ {letter:"A",text:"and"},      {letter:"B",text:"so"},        {letter:"C",text:"but"} ],     correct: "A" },
          { id: 24, options: [ {letter:"A",text:"they"},     {letter:"B",text:"he"},        {letter:"C",text:"it"} ],      correct: "A" }
        ]
      },

      // ───── PART 5 (Q25-30) ─────
      {
        partNumber: 5,
        type: "cloze-open",
        instruction: "Read the email. Write ONE word for each space.",
        text:
          "Hi Marco,\n\nHow ___1___ you? I'm writing because there is going ___2___ be an art exhibition at my school next Friday. One of my paintings is in ___3___! It's a picture of an old wooden bridge near our house. Would you ___4___ to come and see it? The exhibition opens ___5___ 5 p.m. and finishes at 8 p.m. After ___6___ we can have pizza in town together.\n\nWrite back soon!\nLia",
        gaps: [
          { id: 25, accept: ["are"] },
          { id: 26, accept: ["to"] },
          { id: 27, accept: ["it"] },
          { id: 28, accept: ["like"] },
          { id: 29, accept: ["at"] },
          { id: 30, accept: ["that","it"] }
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
        recipient: "Mira",
        instruction: "You have started a new Saturday morning art class at your local art centre. Write an email inviting your friend Mira to come with you next Saturday.",
        instructionDetail: "In your email:",
        bullets: [
          "tell Mira what you do at the class",
          "say where the class is",
          "ask Mira to bring something"
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
        // Pexels — Vlada Karpovich (free for commercial use)
        pictures: [
          { id: 1, alt: "A child beginning a painting on an easel in a studio.",            caption: "1. Starting a new painting.",        imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%205/picture-story/scene-1.jpg" },
          { id: 2, alt: "A child focusing on a painting at a table.",                       caption: "2. Painting carefully.",             imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%205/picture-story/scene-2.jpg" },
          { id: 3, alt: "A child painting on a canvas indoors, surrounded by art supplies.", caption: "3. The picture is finished.",        imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%205/picture-story/scene-3.jpg" }
        ],
        scoringRubric: "Award full marks if the response describes all three pictures, uses A2-appropriate past or present tense, and writes 35 words or more."
      }
    ]
  }
};
