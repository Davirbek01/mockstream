// KET (A2 Key) Reading & Writing — Mock 03
// Theme: school & studying. All content original AI-authored (Mock Stream).

window.KET_RW_TEST = {
  testInfo: {
    id: "ket-rw-03",
    title: "KET Reading & Writing Mock 03",
    level: "A2",
    totalTime: 60,
    totalQuestions: 32,
    readingQuestions: 30,
    writingTasks: 2
  },

  reading: {
    parts: [

      // ───── PART 1 (Q1-6) — real-world MCQ ─────
      {
        partNumber: 1,
        type: "real-world-mcq",
        instruction: "Read the text. Choose the correct answer (A, B or C).",
        items: [
          {
            id: 1,
            sourceType: "notice",
            source: "GREENWOOD SCHOOL\n\nFriday 15 March: school will close at 1:00 p.m. because of the staff meeting.",
            question: "What does the notice say?",
            options: [
              { letter: "A", text: "Students will have no school on Friday." },
              { letter: "B", text: "Friday classes finish earlier than usual." },
              { letter: "C", text: "There is a meeting for parents on Friday." }
            ],
            correct: "B"
          },
          {
            id: 2,
            sourceType: "text-message",
            source: "Hi Sam,\n\nDon't forget the books for our reading club tomorrow! We're starting chapter 5. See you in the library at 4 p.m.\n\nMrs Park",
            question: "Why is Mrs Park writing to Sam?",
            options: [
              { letter: "A", text: "to tell him the meeting is cancelled" },
              { letter: "B", text: "to remind him about the books and the time" },
              { letter: "C", text: "to ask him to read chapter 5 today" }
            ],
            correct: "B"
          },
          {
            id: 3,
            sourceType: "notice",
            source: "BIOLOGY ROOM\n\nToday's class is in Room 12 (not here). Mr Oliver will start at 2:30 p.m. — please bring your notebooks.",
            question: "What should students do today?",
            options: [
              { letter: "A", text: "Cancel today's biology class." },
              { letter: "B", text: "Wait outside this room." },
              { letter: "C", text: "Go to a different room." }
            ],
            correct: "C"
          },
          {
            id: 4,
            sourceType: "sign",
            source: "SCHOOL CAFETERIA\n\nOn Mondays, lunch starts 15 minutes earlier (12:15).\nPlease tell your teacher before leaving the classroom.",
            question: "On Mondays, students must",
            options: [
              { letter: "A", text: "eat lunch by 12:15." },
              { letter: "B", text: "tell a teacher before going to lunch." },
              { letter: "C", text: "bring their own lunch." }
            ],
            correct: "B"
          },
          {
            id: 5,
            sourceType: "email",
            source: "Hi Diana,\n\nDon't worry about the trip on Saturday — I will pick you up from school at 3 p.m. as we agreed. Bring your raincoat!\n\nMum xx",
            question: "Diana's mum wants Diana to",
            options: [
              { letter: "A", text: "take a raincoat with her." },
              { letter: "B", text: "find a way home alone." },
              { letter: "C", text: "cancel the trip on Saturday." }
            ],
            correct: "A"
          },
          {
            id: 6,
            sourceType: "note",
            source: "BUS 22 — Important\n\nTomorrow morning, the bus will leave from the BACK gate, NOT the front gate. The first stop is at 7:50 a.m.",
            question: "What is changing tomorrow?",
            options: [
              { letter: "A", text: "The bus arrives later than usual." },
              { letter: "B", text: "The bus leaves from a different place." },
              { letter: "C", text: "The bus is not running." }
            ],
            correct: "B"
          }
        ]
      },

      // ───── PART 2 (Q7-13) — multi-text matching ─────
      {
        partNumber: 2,
        type: "multi-text-matching",
        instruction: "Read the questions and the three texts. For each question, choose the correct answer (A, B or C).",
        topic: "Three students talk about their favourite school subject.",
        texts: [
          {
            id: "A",
            title: "Maya",
            body: "My favourite subject is maths. I know a lot of students don't like it, but I think solving problems is like playing a game. My maths teacher gives us extra puzzles after class for anyone who wants them. I usually finish them at home in the evening. I would like to be an engineer one day, so maths is very important for me."
          },
          {
            id: "B",
            title: "Sam",
            body: "I love science, especially the chemistry lessons. We do a lot of experiments in the school lab. Last week we made our own slime — it was a bit messy! Our teacher, Mr Khan, lets us choose what we want to study at the end of each month. I'm going to choose space next month because I love stars and planets."
          },
          {
            id: "C",
            title: "Ria",
            body: "Art is my favourite class. We have it twice a week, on Tuesdays and Fridays after lunch. I usually draw with pencils, but I'm now learning to paint with watercolours. My older brother is studying art at university, and he sometimes shows me new techniques. I want to put my pictures in the next school art show."
          }
        ],
        questions: [
          { id: 7,  prompt: "Which student does extra work at home?",                       correct: "A" },
          { id: 8,  prompt: "Which student does experiments at school?",                    correct: "B" },
          { id: 9,  prompt: "Which student has a family member who teaches them at home?",  correct: "C" },
          { id: 10, prompt: "Which student has classes on two days each week?",             correct: "C" },
          { id: 11, prompt: "Which student wants to study space next month?",               correct: "B" },
          { id: 12, prompt: "Which student is thinking about a future job?",                correct: "A" },
          { id: 13, prompt: "Which student wants to show their work soon?",                 correct: "C" }
        ]
      },

      // ───── PART 3 (Q14-18) — long-text MCQ ─────
      {
        partNumber: 3,
        type: "long-text-mcq",
        instruction: "Read the text and questions. For each question, choose the correct answer (A, B or C).",
        title: "The School Book Club",
        passage:
          "Mei is twelve years old and lives in a small town. She loves reading, but she did not know any other students at her school who liked books as much as she did. Last year, Mei decided to start a book club after school. She put a small poster on the noticeboard and asked the librarian, Mrs Davis, if they could meet in the library every Wednesday afternoon.\n\nAt first, only two students came to the meetings. But Mei did not give up. She asked her friends to come, and she made a website where students could see the new book of the month. Now, fifteen students go to the book club every week. They sit in a circle in the library and talk about the chapters they have read.\n\nEach member of the club takes turns choosing the new book. Last month, Mei's friend Hugo chose a science fiction story about a girl who travels to Mars. This month, the club is reading a book about a young detective. Mei's parents bought her a special notebook for the club, and she writes her thoughts about every book inside it. She wants to keep all her notebooks for many years, so she can remember every story.",
        questions: [
          {
            id: 14,
            prompt: "Why did Mei start the book club?",
            options: [
              { letter: "A", text: "Her librarian asked her to." },
              { letter: "B", text: "She wanted to meet other readers." },
              { letter: "C", text: "Her teacher gave her the idea." }
            ],
            correct: "B"
          },
          {
            id: 15,
            prompt: "How many students came to the first meeting?",
            options: [
              { letter: "A", text: "just Mei" },
              { letter: "B", text: "two students" },
              { letter: "C", text: "fifteen students" }
            ],
            correct: "B"
          },
          {
            id: 16,
            prompt: "What did Mei do to bring more students to the club?",
            options: [
              { letter: "A", text: "She asked her friends and made a website." },
              { letter: "B", text: "She asked the school to pay for new books." },
              { letter: "C", text: "She changed the meeting day to Sunday." }
            ],
            correct: "A"
          },
          {
            id: 17,
            prompt: "What kind of book did Hugo choose last month?",
            options: [
              { letter: "A", text: "a real-life story about Mars" },
              { letter: "B", text: "a science fiction story" },
              { letter: "C", text: "a story about a young detective" }
            ],
            correct: "B"
          },
          {
            id: 18,
            prompt: "Why does Mei keep a special notebook?",
            options: [
              { letter: "A", text: "to lend it to other club members" },
              { letter: "B", text: "to write down her thoughts about every book" },
              { letter: "C", text: "to plan future club meetings" }
            ],
            correct: "B"
          }
        ]
      },

      // ───── PART 4 (Q19-24) — vocab cloze ─────
      {
        partNumber: 4,
        type: "cloze-mcq",
        instruction: "Read the text. Choose the best word (A, B or C) for each space.",
        title: "Penguins",
        text:
          "Penguins are interesting black-and-white birds that live in cold places like Antarctica. They cannot ___1___, but they swim very well, using their wings like flippers. There are about eighteen ___2___ kinds of penguin in the world. Some are quite small — only thirty centimetres tall — ___3___ others can be more than a metre high.\n\nPenguins live in large ___4___ called colonies. In every colony, the mother and father birds work together to ___5___ care of their babies. Sadly, the lives of many penguins are now becoming ___6___ because the weather is changing in cold places.",
        gaps: [
          { id: 19, options: [ {letter:"A",text:"fly"},      {letter:"B",text:"drive"},     {letter:"C",text:"walk"} ],     correct: "A" },
          { id: 20, options: [ {letter:"A",text:"several"},  {letter:"B",text:"different"}, {letter:"C",text:"equal"} ],    correct: "B" },
          { id: 21, options: [ {letter:"A",text:"but"},      {letter:"B",text:"or"},        {letter:"C",text:"so"} ],       correct: "A" },
          { id: 22, options: [ {letter:"A",text:"groups"},   {letter:"B",text:"families"},  {letter:"C",text:"parts"} ],    correct: "A" },
          { id: 23, options: [ {letter:"A",text:"take"},     {letter:"B",text:"give"},      {letter:"C",text:"make"} ],     correct: "A" },
          { id: 24, options: [ {letter:"A",text:"easier"},   {letter:"B",text:"harder"},    {letter:"C",text:"longer"} ],   correct: "B" }
        ]
      },

      // ───── PART 5 (Q25-30) — open cloze ─────
      {
        partNumber: 5,
        type: "cloze-open",
        instruction: "Read the email. Write ONE word for each space.",
        text:
          "Hi Tom,\n\nHow ___1___ you? I'm writing to tell ___2___ about my school project. Our class is going to the science museum on Friday. Mr Khan wants us ___3___ make a short film about the things we see. I have a video camera ___4___ I'm going to bring it. Would you ___5___ to work with me on the film? ___6___ will be much more fun together.\n\nWrite back soon!\nAlex",
        gaps: [
          { id: 25, accept: ["are"] },
          { id: 26, accept: ["you"] },
          { id: 27, accept: ["to"] },
          { id: 28, accept: ["and"] },
          { id: 29, accept: ["like"] },
          { id: 30, accept: ["it","It"] }
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
        recipient: "Tom",
        instruction: "Your friend Tom has a maths exam next week. Write an email inviting Tom to study with you on Saturday morning.",
        instructionDetail: "In your email:",
        bullets: [
          "say where you can study together",
          "tell Tom what time to come",
          "ask Tom to bring something useful"
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
          { id: 1, alt: "A child reading a book in a library.",                                 caption: "1. Reading in the library.",     imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%203/picture-story/scene-1.jpg" },
          { id: 2, alt: "The same boy reading a colourful comic book at home.",                 caption: "2. Reading at home.",            imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%203/picture-story/scene-2.jpg?v=2" },
          { id: 3, alt: "A child reading a colourful comic book indoors.",                     caption: "3. Reading is fun.",             imageUrl: "https://storage.googleapis.com/mockstream-listening-audio/KET/test%203/picture-story/scene-3.jpg" }
        ],
        scoringRubric: "Award full marks if the response describes all three pictures, uses A2-appropriate past or present tense, and writes 35 words or more."
      }
    ]
  }
};
