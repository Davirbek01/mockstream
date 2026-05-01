// KET (A2 Key) Reading & Writing — Mock 10
// Theme: music & instruments. All content original (Mock Stream).

window.KET_RW_TEST = {
  testInfo: {
    id: "ket-rw-10",
    title: "KET Reading & Writing Mock 10",
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
            source: "BLUEBIRD MUSIC SCHOOL\n\nLessons start again on Monday 6 March.\nNew piano students: please come on Tuesday afternoon (any time 3 – 5 p.m.) for a short meeting.",
            question: "When should new piano students come for the meeting?",
            options: [
              { letter: "A", text: "on Monday morning" },
              { letter: "B", text: "on Tuesday afternoon" },
              { letter: "C", text: "any day in the week" }
            ],
            correct: "B"
          },
          {
            id: 2,
            sourceType: "email",
            source: "Hi Anna,\n\nThank you for your tickets! Your seats for the school concert on Friday are J12 and J13. The doors open at 6:30 p.m. and the music starts at 7. Please be in your seats before 7.",
            question: "What does the email tell Anna?",
            options: [
              { letter: "A", text: "The concert starts at 6:30 p.m." },
              { letter: "B", text: "She needs to be sitting down before the music starts." },
              { letter: "C", text: "The doors close at 7 p.m." }
            ],
            correct: "B"
          },
          {
            id: 3,
            sourceType: "sign",
            source: "GUITAR WORLD\n\nThis week only:\n20% off all guitar strings.\nFree guitar lesson with every new guitar.",
            question: "What is special this week?",
            options: [
              { letter: "A", text: "All guitars are 20% cheaper." },
              { letter: "B", text: "Guitar strings cost less than usual." },
              { letter: "C", text: "Guitar lessons are free for everyone." }
            ],
            correct: "B"
          },
          {
            id: 4,
            sourceType: "text-message",
            source: "Hi Sam,\n\nDon't forget — band practice today is at Liam's house, same time, 5 p.m. I will bring my keyboard. Can you bring your old microphone?\n\nMaria",
            question: "What does Maria want Sam to do?",
            options: [
              { letter: "A", text: "bring his old microphone" },
              { letter: "B", text: "cancel the band practice" },
              { letter: "C", text: "arrive earlier than usual" }
            ],
            correct: "A"
          },
          {
            id: 5,
            sourceType: "notice",
            source: "FRIDAY NIGHT KARAOKE!\n\nFREE for under-18s.\nAdults: £3 entry. Drinks not included.\nDoors open 7 p.m.",
            question: "What does the notice tell us?",
            options: [
              { letter: "A", text: "Adults pay to enter karaoke night." },
              { letter: "B", text: "All drinks are free." },
              { letter: "C", text: "The event is only for adults." }
            ],
            correct: "A"
          },
          {
            id: 6,
            sourceType: "email",
            source: "Dear MusicNote user,\n\nA new version of MusicNote is ready! Update your app today to get the new music lessons. The update takes about 5 minutes.\n\nMusicNote Team",
            question: "What does the email ask the user to do?",
            options: [
              { letter: "A", text: "download a completely new app" },
              { letter: "B", text: "update their MusicNote app" },
              { letter: "C", text: "wait 5 minutes before opening the app" }
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
        topic: "Three young people describe the music they play.",
        texts: [
          {
            id: "A",
            title: "Maria",
            body: "I started learning the piano five years ago. I really love jazz music — my grandfather used to play in a jazz band when he was young, and he gave me his old jazz records. I take a private piano lesson every Sunday afternoon. My teacher is also a jazz musician and she has played in famous concert halls. Last summer, I played my first jazz piece in front of my family. I was very nervous, but they all clapped at the end."
          },
          {
            id: "B",
            title: "Tariq",
            body: "My hobby is playing the electric guitar. I bought my guitar with my own money two years ago — I saved for nearly a year! I practise in our garage because the guitar is loud. My older sister doesn't always like the noise, but she's a singer, so we sometimes play together. We are starting a small band with two friends from school. Our first rehearsal is next Saturday."
          },
          {
            id: "C",
            title: "Hana",
            body: "I have been playing the drums since I was eight. I'm fourteen now. My drum kit is in our basement because drums are very noisy! I have a lesson once a week at a music shop in town, and I practise at home for one hour every day. My teacher says drumming is good for the brain because you have to use your hands and feet at the same time. I want to play at our school's music festival in June."
          }
        ],
        questions: [
          { id: 7,  prompt: "Who paid for their own instrument?",                              correct: "B" },
          { id: 8,  prompt: "Whose teacher has played in famous places?",                       correct: "A" },
          { id: 9,  prompt: "Who plays the drums?",                                              correct: "C" },
          { id: 10, prompt: "Who is starting a band with friends?",                              correct: "B" },
          { id: 11, prompt: "Whose lessons take place at a music shop?",                         correct: "C" },
          { id: 12, prompt: "Who hopes to play at a school event soon?",                         correct: "C" },
          { id: 13, prompt: "Who was given something musical by a family member?",               correct: "A" }
        ]
      },

      // ───── PART 3 (Q14-18) ─────
      {
        partNumber: 3,
        type: "long-text-mcq",
        instruction: "Read the text and questions. For each question, choose the correct answer (A, B or C).",
        title: "Eleni's Hospital Concerts",
        passage:
          "Eleni is fifteen years old. She has been playing the guitar since she was eight. Her grandmother bought her first small guitar, and her older sister taught her how to play her first songs. Now Eleni can play more than a hundred songs. She practises for at least an hour every day after school.\n\nTwo years ago, Eleni's mother had to stay in hospital for a week. While Eleni was visiting her, she noticed that many of the young children in the hospital were sad and bored. They could not run or play like other children. That gave Eleni an idea: she would bring her guitar and play songs for them.\n\nNow, Eleni goes to the children's hospital every Saturday afternoon. She plays for an hour, and she tries to play songs that the children request. Her favourite moments are when the children sing along with her, even if they are very quiet. Last month, Eleni was on a local TV news programme. The hospital nurses say the children always smile more on the days when Eleni comes. Eleni doesn't think she is special — she says it's the children who help her, not the other way around.",
        questions: [
          {
            id: 14,
            prompt: "How did Eleni get her first guitar?",
            options: [
              { letter: "A", text: "Her grandmother bought it for her." },
              { letter: "B", text: "Her older sister gave her one." },
              { letter: "C", text: "She bought it with her own money." }
            ],
            correct: "A"
          },
          {
            id: 15,
            prompt: "How long does Eleni practise every day?",
            options: [
              { letter: "A", text: "less than an hour" },
              { letter: "B", text: "at least one hour" },
              { letter: "C", text: "about three hours" }
            ],
            correct: "B"
          },
          {
            id: 16,
            prompt: "Why did Eleni start playing at the children's hospital?",
            options: [
              { letter: "A", text: "She wanted to be on television." },
              { letter: "B", text: "She saw that sick children were sad and bored." },
              { letter: "C", text: "The hospital nurses asked her to come." }
            ],
            correct: "B"
          },
          {
            id: 17,
            prompt: "What does Eleni say about her favourite moments?",
            options: [
              { letter: "A", text: "when the children sing with her" },
              { letter: "B", text: "when she plays a difficult song" },
              { letter: "C", text: "when the nurses thank her" }
            ],
            correct: "A"
          },
          {
            id: 18,
            prompt: "What does Eleni say about herself?",
            options: [
              { letter: "A", text: "She is a very special person." },
              { letter: "B", text: "The children help her, not the other way round." },
              { letter: "C", text: "She wants to become famous." }
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
        title: "Forests",
        text:
          "Forests cover about a third of the land on our planet. They are home to ___1___ animals and plants — many more than we can find in cities or open fields. Different kinds of forests grow in different places. ___2___ example, the rainforests of South America are very hot and wet, while the forests of northern Russia are very cold for most of the year.\n\nForests are important because the trees ___3___ in a gas called carbon dioxide and give us back oxygen, which we need ___4___ breathe. Trees also give us many useful things, ___5___ wood, fruit and medicines. Sadly, many forests are getting smaller because people cut down too many trees. Today, ___6___ countries are trying to plant new forests to help the planet.",
        gaps: [
          { id: 19, options: [ {letter:"A",text:"any"},      {letter:"B",text:"few"},       {letter:"C",text:"many"} ],     correct: "C" },
          { id: 20, options: [ {letter:"A",text:"At"},       {letter:"B",text:"For"},       {letter:"C",text:"Of"} ],       correct: "B" },
          { id: 21, options: [ {letter:"A",text:"put"},      {letter:"B",text:"give"},      {letter:"C",text:"take"} ],     correct: "C" },
          { id: 22, options: [ {letter:"A",text:"of"},       {letter:"B",text:"to"},        {letter:"C",text:"at"} ],       correct: "B" },
          { id: 23, options: [ {letter:"A",text:"with"},     {letter:"B",text:"like"},      {letter:"C",text:"only"} ],     correct: "B" },
          { id: 24, options: [ {letter:"A",text:"any"},      {letter:"B",text:"each"},      {letter:"C",text:"many"} ],     correct: "C" }
        ]
      },

      // ───── PART 5 (Q25-30) ─────
      {
        partNumber: 5,
        type: "cloze-open",
        instruction: "Read the email. Write ONE word for each space.",
        text:
          "Hi Tariq,\n\nHow ___1___ you? I'm so excited to tell you something! ___2___ Saturday, my school is having a music night. ___3___ class is going to play one song. ___4___ are playing a song from a famous old film. Would you like ___5___ come and watch? My family is coming, ___6___ I will leave a ticket for you at the door.\n\nWrite back soon!\nMaria",
        gaps: [
          { id: 25, accept: ["are"] },
          { id: 26, accept: ["next","Next","this","This"] },
          { id: 27, accept: ["my","My"] },
          { id: 28, accept: ["we","We"] },
          { id: 29, accept: ["to"] },
          { id: 30, accept: ["so"] }
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
        recipient: "Liam",
        instruction: "You are learning a new song to play together with your friend Liam. Write an email inviting Liam to practise with you this Saturday.",
        instructionDetail: "In your email:",
        bullets: [
          "say what time to come",
          "tell Liam where to come",
          "ask Liam to bring his instrument"
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
        // Pexels — Pavel Danilyuk (free for commercial use)
        pictures: [
          { id: 1, alt: "A young girl learning the piano, focusing on sheet music.",       caption: "1. Mira starts to learn the piano.", imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%2010/picture-story/scene-1.jpg" },
          { id: 2, alt: "A girl in a hoodie smiling while playing piano.",                  caption: "2. She practises every day.",         imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%2010/picture-story/scene-2.jpg" },
          { id: 3, alt: "The same girl in a light shirt playing piano with sheet music.",  caption: "3. She is happy with her music.",     imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%2010/picture-story/scene-3.jpg" }
        ],
        scoringRubric: "Award full marks if the response describes all three pictures, uses A2-appropriate past or present tense, and writes 35 words or more."
      }
    ]
  }
};
