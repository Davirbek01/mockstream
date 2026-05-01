// KET (A2 Key) Reading & Writing — Mock 09
// Theme: technology & communication. All content original (Mock Stream).

window.KET_RW_TEST = {
  testInfo: {
    id: "ket-rw-09",
    title: "KET Reading & Writing Mock 09",
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
            source: "PHONES PLUS\n\nWe repair all kinds of phones.\nDrop your phone with us in the morning, collect it after 5 p.m. on the same day.",
            question: "How long does a phone repair usually take?",
            options: [
              { letter: "A", text: "less than one day" },
              { letter: "B", text: "about one week" },
              { letter: "C", text: "only a few minutes" }
            ],
            correct: "A"
          },
          {
            id: 2,
            sourceType: "sign",
            source: "LIBRARY COMPUTERS\n\nFree for library members.\nMaximum 1 hour per day.\nPlease ask at the desk to start your session.",
            question: "What does the sign tell library members?",
            options: [
              { letter: "A", text: "They can use a computer for one hour each day." },
              { letter: "B", text: "They must pay to use the computers." },
              { letter: "C", text: "They can stay as long as they want." }
            ],
            correct: "A"
          },
          {
            id: 3,
            sourceType: "email",
            source: "Hi Anna,\n\nThank you for your order! Your new headphones will arrive between Wednesday and Friday this week. Someone over 16 must sign for the package.\n\nMusicShop",
            question: "What does the email say?",
            options: [
              { letter: "A", text: "The headphones will only arrive on Friday." },
              { letter: "B", text: "An adult needs to sign for the headphones." },
              { letter: "C", text: "Anna must pay extra for the delivery." }
            ],
            correct: "B"
          },
          {
            id: 4,
            sourceType: "notice",
            source: "WELCOME TO QUICKMAP!\n\n1. Type your address.\n2. Choose where you want to go.\n3. Press the green arrow.",
            question: "What does the user do first?",
            options: [
              { letter: "A", text: "press the green arrow" },
              { letter: "B", text: "type their address" },
              { letter: "C", text: "choose a destination" }
            ],
            correct: "B"
          },
          {
            id: 5,
            sourceType: "notice",
            source: "CHARGING POINTS\n\nFree for all customers.\nPlease don't leave your phone here for more than 2 hours.",
            question: "What does the notice say?",
            options: [
              { letter: "A", text: "Customers can charge their phones for up to 2 hours." },
              { letter: "B", text: "The charging points cost money to use." },
              { letter: "C", text: "Customers can leave phones here all day." }
            ],
            correct: "A"
          },
          {
            id: 6,
            sourceType: "sign",
            source: "BIG BYTE INTERNET CAFE\n\nOpen Monday – Friday, 10 a.m. – 10 p.m.\nClosed at the weekend.\nCoffee and snacks available all day.",
            question: "When is the cafe open?",
            options: [
              { letter: "A", text: "every day of the week" },
              { letter: "B", text: "only at the weekend" },
              { letter: "C", text: "only on weekdays" }
            ],
            correct: "C"
          }
        ]
      },

      // ───── PART 2 (Q7-13) ─────
      {
        partNumber: 2,
        type: "multi-text-matching",
        instruction: "Read the questions and the three texts. For each question, choose the correct answer (A, B or C).",
        topic: "Three young people describe how they use a computer for their hobby.",
        texts: [
          {
            id: "A",
            title: "Aria",
            body: "I love taking photos with my phone, but I love editing them even more. I use a free app on my computer to make my photos look like paintings or old pictures from a hundred years ago. I started learning two years ago by watching short videos online. Now my friends ask me to edit photos for their social media accounts. I do it for free, but I always say their account must say my name as the editor."
          },
          {
            id: "B",
            title: "Caleb",
            body: "I started learning to code when I was nine. I'm thirteen now, and I have made three small games for my younger sister to play on our family computer. The games are very simple — there are no special pictures or sounds — but my sister loves them. I take an online coding class on Saturday mornings with a teacher in another country. The class lasts ninety minutes and we are usually about ten students."
          },
          {
            id: "C",
            title: "Yuki",
            body: "I make short videos about my hobby — I'm building a small wooden house for my dog in our garden. I record one or two videos every weekend, then I edit them on my dad's old laptop and put them on a video website. About 200 people watch my videos now. I want to learn how to add music to them next, but I haven't found a free way to do this yet."
          }
        ],
        questions: [
          { id: 7,  prompt: "Who learned their hobby by watching online videos?",        correct: "A" },
          { id: 8,  prompt: "Who has made games for a younger sibling?",                  correct: "B" },
          { id: 9,  prompt: "Who takes classes with a teacher in another country?",       correct: "B" },
          { id: 10, prompt: "Who shares their work for free?",                            correct: "A" },
          { id: 11, prompt: "Who is making something for an animal?",                     correct: "C" },
          { id: 12, prompt: "Whose work is watched by many people online?",               correct: "C" },
          { id: 13, prompt: "Who hopes to learn something new soon?",                     correct: "C" }
        ]
      },

      // ───── PART 3 (Q14-18) ─────
      {
        partNumber: 3,
        type: "long-text-mcq",
        instruction: "Read the text and questions. For each question, choose the correct answer (A, B or C).",
        title: "Ravi's Tech Help",
        passage:
          "Ravi is fourteen years old. He lives with his parents and his two grandparents in a busy city in India. His grandparents are both over seventy years old, and they did not have any computers or smartphones when they were young. Ravi noticed that many older people in his neighbourhood find phones and apps very confusing.\n\nTwo years ago, Ravi started giving free 'tech help' lessons at the small community centre near his home. He goes every Tuesday and Thursday after school for one hour. Older people from the area come with their phones, tablets and questions. Ravi shows them how to make video calls, send photos and read the news online.\n\nThe most popular lesson is about how to use video calling apps. Many of the older people have grandchildren who live far away — sometimes in different countries — and they want to see them more often. Ravi has helped over fifty people so far. Last month, his school gave him an award for his work. Ravi was a little embarrassed, but he was also very happy. He wants to be a doctor one day, but he says he will always make time to help his community.",
        questions: [
          {
            id: 14,
            prompt: "Who lives with Ravi at home?",
            options: [
              { letter: "A", text: "only his parents" },
              { letter: "B", text: "his parents and his grandparents" },
              { letter: "C", text: "his grandparents only" }
            ],
            correct: "B"
          },
          {
            id: 15,
            prompt: "Why did Ravi start giving the lessons?",
            options: [
              { letter: "A", text: "He needed money for his school." },
              { letter: "B", text: "Many older people found technology confusing." },
              { letter: "C", text: "His grandparents asked him to start." }
            ],
            correct: "B"
          },
          {
            id: 16,
            prompt: "How often does Ravi give lessons?",
            options: [
              { letter: "A", text: "once a week" },
              { letter: "B", text: "twice a week" },
              { letter: "C", text: "every day" }
            ],
            correct: "B"
          },
          {
            id: 17,
            prompt: "What is the most popular lesson?",
            options: [
              { letter: "A", text: "how to read the news online" },
              { letter: "B", text: "how to send photos by phone" },
              { letter: "C", text: "how to use video calling apps" }
            ],
            correct: "C"
          },
          {
            id: 18,
            prompt: "What does Ravi want to do when he is older?",
            options: [
              { letter: "A", text: "become a doctor" },
              { letter: "B", text: "open a community centre" },
              { letter: "C", text: "work as a teacher in a school" }
            ],
            correct: "A"
          }
        ]
      },

      // ───── PART 4 (Q19-24) ─────
      {
        partNumber: 4,
        type: "cloze-mcq",
        instruction: "Read the text. Choose the best word (A, B or C) for each space.",
        title: "Stars",
        text:
          "On a clear night, you can see thousands of stars in the sky. ___1___ they look very small, most stars are actually huge. Our sun is also a star, but it ___2___ much closer to us than all the others. The next nearest star is so far away that its light ___3___ four years to reach us!\n\nLong ago, sailors used the stars to find ___4___ way across the sea, because the same patterns appear in the sky every night. Today, we use machines like phones and computers, ___5___ many people still enjoy looking at the stars for fun. If you go to a place far ___6___ city lights, you can sometimes see thousands of stars in just one part of the sky.",
        gaps: [
          { id: 19, options: [ {letter:"A",text:"Although"}, {letter:"B",text:"Because"},  {letter:"C",text:"If"} ],          correct: "A" },
          { id: 20, options: [ {letter:"A",text:"has"},      {letter:"B",text:"is"},       {letter:"C",text:"does"} ],         correct: "B" },
          { id: 21, options: [ {letter:"A",text:"makes"},    {letter:"B",text:"has"},      {letter:"C",text:"takes"} ],        correct: "C" },
          { id: 22, options: [ {letter:"A",text:"our"},      {letter:"B",text:"their"},    {letter:"C",text:"its"} ],          correct: "B" },
          { id: 23, options: [ {letter:"A",text:"so"},       {letter:"B",text:"and"},      {letter:"C",text:"but"} ],          correct: "C" },
          { id: 24, options: [ {letter:"A",text:"between"},  {letter:"B",text:"under"},    {letter:"C",text:"from"} ],         correct: "C" }
        ]
      },

      // ───── PART 5 (Q25-30) ─────
      {
        partNumber: 5,
        type: "cloze-open",
        instruction: "Read the email. Write ONE word for each space.",
        text:
          "Hi Yumi,\n\nHow ___1___ you? I want to tell you ___2___ a great new thing. ___3___ Saturday, I joined an online music class. ___4___ are about twenty students from many different countries. The teacher ___5___ from Italy! We have a class every Saturday ___6___ 4 to 5 p.m. our time. Would you like to join with me next week?\n\nWrite back soon!\nKai",
        gaps: [
          { id: 25, accept: ["are"] },
          { id: 26, accept: ["about"] },
          { id: 27, accept: ["last","Last"] },
          { id: 28, accept: ["there","There"] },
          { id: 29, accept: ["is","'s"] },
          { id: 30, accept: ["from"] }
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
        recipient: "Sasha",
        instruction: "Your school has started a new coding club after school on Wednesdays. Write an email inviting your friend Sasha to come with you.",
        instructionDetail: "In your email:",
        bullets: [
          "say what people do at the club",
          "tell Sasha when and where it meets",
          "ask Sasha to bring something useful"
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
        // Pexels — Mikhail Nilov (free for commercial use)
        pictures: [
          { id: 1, alt: "A child's hands typing on a laptop at home.",                       caption: "1. Typing on a laptop.",            imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%209/picture-story/scene-1.jpg" },
          { id: 2, alt: "A young child looking at a laptop screen.",                          caption: "2. Using a laptop at home.",        imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%209/picture-story/scene-2.jpg" },
          { id: 3, alt: "The same child relaxing on the sofa beside their mother with a laptop.", caption: "3. Sharing the laptop with mum.",  imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%209/picture-story/scene-3.jpg?v=2" }
        ],
        scoringRubric: "Award full marks if the response describes all three pictures, uses A2-appropriate past or present tense, and writes 35 words or more."
      }
    ]
  }
};
