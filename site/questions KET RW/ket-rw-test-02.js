// KET (A2 Key) Reading & Writing — Mock 02
// Post-2020 Cambridge format: 60 min, 7 parts, 32 questions
// All content is original AI-authored material (Mock Stream).

window.KET_RW_TEST = {
  testInfo: {
    id: "ket-rw-02",
    title: "KET Reading & Writing Mock 02",
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
            source: "GREENFIELD LIBRARY\n\nReturn books on time, please.\nLate fees: 50p per book per day.",
            question: "What does the notice say?",
            options: [
              { letter: "A", text: "The library is closed today." },
              { letter: "B", text: "You must pay if your books are late." },
              { letter: "C", text: "You can borrow only one book." }
            ],
            correct: "B"
          },
          {
            id: 2,
            sourceType: "text-message",
            source: "Hi Joe!\n\nTonight's drum lesson is cancelled because Mr Banks is sick. The next class is on Friday at the same time. Sorry!",
            question: "Why is Mr Banks writing to Joe?",
            options: [
              { letter: "A", text: "to invite Joe to a new class" },
              { letter: "B", text: "to tell Joe that today's class is not happening" },
              { letter: "C", text: "to ask Joe to bring a friend" }
            ],
            correct: "B"
          },
          {
            id: 3,
            sourceType: "email",
            source: "Hello Mrs Smith,\n\nMy dog Pepper is at your front gate. She is friendly but please don't give her any food. I will come to take her home in twenty minutes. Sorry!\n\nAdam (house number 22)",
            question: "Adam wants Mrs Smith to",
            options: [
              { letter: "A", text: "give Pepper some food." },
              { letter: "B", text: "wait until he arrives." },
              { letter: "C", text: "take Pepper to her own house." }
            ],
            correct: "B"
          },
          {
            id: 4,
            sourceType: "sign",
            source: "GUESTS\n\nBreakfast: 7:00–10:00\nCheck-out: by 11:00 a.m.\nWe keep your bags free of charge after check-out.",
            question: "After 11:00 a.m. you can",
            options: [
              { letter: "A", text: "still eat breakfast." },
              { letter: "B", text: "leave your bags at the hotel." },
              { letter: "C", text: "use a free hotel room." }
            ],
            correct: "B"
          },
          {
            id: 5,
            sourceType: "note",
            source: "Dad,\n\nI have taken your camera to the school trip. I will bring it back tomorrow night.\n\nThanks,\nAnna",
            question: "Why is Anna writing to her dad?",
            options: [
              { letter: "A", text: "to ask if she can use his camera" },
              { letter: "B", text: "to tell him she has his camera" },
              { letter: "C", text: "to say sorry for losing his camera" }
            ],
            correct: "B"
          },
          {
            id: 6,
            sourceType: "notice",
            source: "BLUE BAY BEACH\n\nLifeguard on duty: 10:00–18:00.\nPlease only swim between the red and yellow flags.",
            question: "What does the notice tell you?",
            options: [
              { letter: "A", text: "The beach is closed at 6 p.m." },
              { letter: "B", text: "There is a lifeguard all day and night." },
              { letter: "C", text: "You must swim in one safe area." }
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
        topic: "Three friends are learning a new musical instrument.",
        texts: [
          {
            id: "A",
            title: "Maria",
            body: "I started piano lessons six months ago. My teacher comes to my house every Saturday morning. I practise for thirty minutes before school each day, but my mum says I should practise for longer at the weekend. The pieces I'm playing are getting harder now, so sometimes I feel a little tired, but I really enjoy it. I want to play in our school concert next year."
          },
          {
            id: "B",
            title: "James",
            body: "My older brother gave me his old guitar last summer. He showed me a few songs but he isn't a great teacher, so now I learn from videos online. I practise in my bedroom every evening for about an hour. My neighbours don't mind because the guitar is acoustic, not electric. I want to write my own songs one day, but I think I need to learn many more chords first."
          },
          {
            id: "C",
            title: "Lily",
            body: "I started learning the drums three months ago because my best friend already plays. She is much better than me! I have lessons at a music school in town twice a week, on Mondays and Thursdays after school. Drums are very loud, so I can only practise at the school — there is no space for a drum kit at home. My teacher says I am improving quickly."
          }
        ],
        questions: [
          { id: 7,  prompt: "Which person learned a little from a family member?",          correct: "B" },
          { id: 8,  prompt: "Which person practises in their bedroom every evening?",       correct: "B" },
          { id: 9,  prompt: "Which person has lessons at home?",                            correct: "A" },
          { id: 10, prompt: "Which person says they want to perform soon?",                 correct: "A" },
          { id: 11, prompt: "Which person started because of a friend?",                    correct: "C" },
          { id: 12, prompt: "Which person learns from videos?",                             correct: "B" },
          { id: 13, prompt: "Which person can't practise at home?",                         correct: "C" }
        ]
      },

      // ───────── PART 3 (Q14-18) — long-text MCQ ─────────
      {
        partNumber: 3,
        type: "long-text-mcq",
        instruction: "Read the text and questions. For each question, choose the correct answer (A, B or C).",
        title: "Diego's Bicycle Workshop",
        passage:
          "Diego is thirteen years old. He lives in a small town where many families do not have much money. Two years ago, Diego's grandfather gave him an old bicycle that needed a lot of work. Diego repaired it himself, using YouTube videos and books from the library. When the bicycle was ready, he rode it to school every day. He felt very proud.\n\nAfter that, Diego started looking for other broken bicycles. People in his town gave him bikes that they did not want any more. Sometimes he found old bikes left near the rubbish bins. Diego cleaned them, fixed the broken parts and painted them. Then he gave them to younger children who didn't have a bicycle of their own.\n\nSo far, Diego has fixed twenty-five bicycles. He keeps a list of all of them in a small notebook. He writes the date he got the bike, the date he finished repairing it, and the name of the child who received it. Diego works in his uncle's small garage at the weekend. His uncle gives him tools and sometimes helps with difficult jobs. Diego says that the most exciting moment is always when a child sits on their new bike for the first time.",
        questions: [
          {
            id: 14,
            prompt: "How did Diego learn to fix bicycles?",
            options: [
              { letter: "A", text: "His grandfather taught him." },
              { letter: "B", text: "He used videos and books." },
              { letter: "C", text: "His uncle showed him." }
            ],
            correct: "B"
          },
          {
            id: 15,
            prompt: "What did Diego do after he repaired his first bicycle?",
            options: [
              { letter: "A", text: "He used it to go to school." },
              { letter: "B", text: "He sold it for money." },
              { letter: "C", text: "He gave it to a younger child." }
            ],
            correct: "A"
          },
          {
            id: 16,
            prompt: "Where does Diego sometimes find broken bicycles?",
            options: [
              { letter: "A", text: "at school" },
              { letter: "B", text: "near the rubbish bins" },
              { letter: "C", text: "on YouTube" }
            ],
            correct: "B"
          },
          {
            id: 17,
            prompt: "What does Diego write in his notebook?",
            options: [
              { letter: "A", text: "drawings of the bicycles" },
              { letter: "B", text: "the names of children and the dates" },
              { letter: "C", text: "videos he has watched" }
            ],
            correct: "B"
          },
          {
            id: 18,
            prompt: "What does Diego enjoy most about his work?",
            options: [
              { letter: "A", text: "when he finds a new bicycle" },
              { letter: "B", text: "when his uncle helps him" },
              { letter: "C", text: "when a child rides their new bike" }
            ],
            correct: "C"
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
          "Bees are very important little animals. They ___1___ from flower to flower, looking for sweet liquid to ___2___ back to their nests. When they do this, they also help flowers to make new seeds. Without bees, ___3___ of the foods we eat every day would not exist.\n\nThere are about 20,000 ___4___ kinds of bees in the world. Most bees are not dangerous to people. They only sting if they ___5___ afraid. Sadly, in some countries the ___6___ of bees is becoming smaller because there are fewer wild flowers.",
        gaps: [
          {
            id: 19,
            options: [
              { letter: "A", text: "fly" },
              { letter: "B", text: "drive" },
              { letter: "C", text: "walk" }
            ],
            correct: "A"
          },
          {
            id: 20,
            options: [
              { letter: "A", text: "give" },
              { letter: "B", text: "take" },
              { letter: "C", text: "put" }
            ],
            correct: "B"
          },
          {
            id: 21,
            options: [
              { letter: "A", text: "all" },
              { letter: "B", text: "many" },
              { letter: "C", text: "both" }
            ],
            correct: "B"
          },
          {
            id: 22,
            options: [
              { letter: "A", text: "same" },
              { letter: "B", text: "different" },
              { letter: "C", text: "equal" }
            ],
            correct: "B"
          },
          {
            id: 23,
            options: [
              { letter: "A", text: "find" },
              { letter: "B", text: "feel" },
              { letter: "C", text: "look" }
            ],
            correct: "B"
          },
          {
            id: 24,
            options: [
              { letter: "A", text: "piece" },
              { letter: "B", text: "size" },
              { letter: "C", text: "number" }
            ],
            correct: "C"
          }
        ]
      },

      // ───────── PART 5 (Q25-30) — open cloze (1 word, email format) ─────────
      {
        partNumber: 5,
        type: "cloze-open",
        instruction: "Read the email. Write ONE word for each space.",
        text:
          "Hi Sara,\n\nHow ___1___ you? I'm writing to tell you ___2___ my weekend. On Saturday I ___3___ going to a basketball game with my brother. The tickets are free for students who are under sixteen. Would you like to come ___4___ us? Please tell me ___5___ Friday so I can book another ticket. After the game, we can ___6___ pizza in a small restaurant.\n\nWrite back soon!\nDan",
        gaps: [
          { id: 25, accept: ["are"] },
          { id: 26, accept: ["about"] },
          { id: 27, accept: ["am","'m"] },
          { id: 28, accept: ["with"] },
          { id: 29, accept: ["before","by"] },
          { id: 30, accept: ["have","get","eat","try"] }
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
        taskType: "Email",
        recipient: "Pat",
        instruction: "Your friend Pat loves football. Write an email inviting Pat to play with you on Saturday.",
        instructionDetail: "In your email:",
        bullets: [
          "say what you are doing on Saturday",
          "tell Pat where and what time to meet",
          "ask Pat to bring something"
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
        // Pexels-licensed photographs (Kh Ali Li, free for commercial use)
        // Hosted at gs://mockstream-listening-audio/KET/test 2/picture-story/
        pictures: [
          {
            id: 1,
            alt: "A young girl holding a small fluffy red kitten in her hands, looking thoughtful in a park.",
            caption: "1. The girl finds a kitten.",
            imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%202/picture-story/scene-1.jpg"
          },
          {
            id: 2,
            alt: "Close-up of the same girl with the kitten meowing in her arms.",
            caption: "2. The kitten meows at her.",
            imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%202/picture-story/scene-2.jpg"
          },
          {
            id: 3,
            alt: "The girl gently embracing the fluffy red kitten and smiling.",
            caption: "3. They become best friends.",
            imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%202/picture-story/scene-3.jpg"
          }
        ],
        scoringRubric:
          "Award full marks if the response describes all three pictures, uses A2-appropriate past or present tense, and writes 35 words or more. Penalise if pictures are skipped, the story is incoherent, or the response is fewer than 35 words."
      }
    ]
  }
};
