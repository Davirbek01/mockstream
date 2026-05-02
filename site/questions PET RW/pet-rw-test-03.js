// PET (B1 Preliminary) Reading & Writing — Mock 03
// Post-2020 Cambridge format: 90 min combined paper
//   Reading: 45 min, 6 parts, 32 questions
//   Writing: 45 min, 2 tasks, ~100 words each
// All content is original AI-authored material (Mock Stream).

window.PET_RW_TEST = {
  testInfo: {
    id: "pet-rw-03",
    title: "PET Reading & Writing Mock 03",
    level: "B1",
    totalTime: 90,
    totalQuestions: 34,        // 32 reading items + 2 writing tasks (Q33, Q34)
    readingQuestions: 32,
    writingTasks: 2
  },

  reading: {
    parts: [

      // ───────── PART 1 (Q1-5) — real-world MCQ (3 options) ─────────
      {
        partNumber: 1,
        type: "real-world-mcq",
        instruction: "For each question, choose the correct answer (A, B or C).",
        items: [
          {
            id: 1,
            sourceType: "pool-notice",
            source: "GREENVIEW SWIMMING POOL\n\nImportant: From Monday 10 March, the pool will close at 5 p.m. (not 8 p.m.) for two weeks because of repairs.\n\nThe morning hours do not change.",
            question: "What is changing at the pool for two weeks?",
            options: [
              { letter: "A", text: "The pool will not open in the mornings during these weeks." },
              { letter: "B", text: "The pool will close earlier in the evening than usual." },
              { letter: "C", text: "The pool will be closed completely until the repairs are done." }
            ],
            correct: "B"
          },
          {
            id: 2,
            sourceType: "text-message",
            source: "From: Marco\n\nHi Anna! I'm at your house, but nobody is home. The neighbour says you're at the supermarket.\n\nI'll wait in the garden if you can come back in 20 minutes — otherwise I'll head home and try again tomorrow. Cheers!",
            question: "Why is Marco writing to Anna?",
            options: [
              { letter: "A", text: "to invite her to lunch at his own house" },
              { letter: "B", text: "to ask if she will be back home soon" },
              { letter: "C", text: "to tell her that her neighbour is angry" }
            ],
            correct: "B"
          },
          {
            id: 3,
            sourceType: "restaurant-email",
            source: "Dear Mr Chen,\n\nThank you for booking a table for six on Saturday at 8 p.m. We have written your name in our diary.\n\nIf anyone in your group cannot eat nuts, please let us know by Friday so that we can prepare a special menu.\n\nBest wishes,\nOlive Tree Restaurant",
            question: "What does the email tell Mr Chen?",
            options: [
              { letter: "A", text: "The restaurant needs to know about food problems before the meal." },
              { letter: "B", text: "Six people are too many for a Saturday evening booking." },
              { letter: "C", text: "The restaurant will be closed on Friday for a special event." }
            ],
            correct: "A"
          },
          {
            id: 4,
            sourceType: "café-sign",
            source: "MUSEUM CAFÉ\n\nHot drinks from £2.\n\nCakes baked fresh every morning.\n\nYou may not bring your own food into the café.",
            question: "At the museum café,",
            options: [
              { letter: "A", text: "the hot drinks all cost the same as the cakes." },
              { letter: "B", text: "you cannot eat food you have brought from outside." },
              { letter: "C", text: "the cakes are sold only in the morning each day." }
            ],
            correct: "B"
          },
          {
            id: 5,
            sourceType: "sister-note",
            source: "Lily,\n\nI've taken your blue jacket — sorry! Mine is wet from the rain.\n\nI'll bring yours back tomorrow morning, before you leave for school. There's some hot chocolate in the cupboard if you're cold!\n\n— Mia",
            question: "Why is Mia writing to Lily?",
            options: [
              { letter: "A", text: "to apologise for borrowing something without asking" },
              { letter: "B", text: "to ask Lily to make her some hot chocolate now" },
              { letter: "C", text: "to tell Lily that she will be home late tomorrow" }
            ],
            correct: "A"
          }
        ]
      },

      // ───────── PART 2 (Q6-10) — match 5 people to 8 hobby clubs ─────────
      {
        partNumber: 2,
        type: "people-place-match",
        instruction: "The people below all want to join a weekly hobby club. On the next page there are descriptions of eight clubs. Decide which club (letters A–H) would be the most suitable for the following people (numbers 6–10).",
        people: [
          {
            id: 6,
            name: "Liam",
            description: "Liam is sixteen. He likes being outside but cannot run because of an old knee injury. He has Tuesday afternoons free after school, and he has no experience of any club activity. He would like something for total beginners.",
            correct: "A"
          },
          {
            id: 7,
            name: "Priya",
            description: "Priya is twenty-two and a university biology student. She wants something completely different from her studies — preferably creative — and has Wednesday evenings free. She already has some experience of painting from school.",
            correct: "D"
          },
          {
            id: 8,
            name: "Hugo",
            description: "Hugo is forty-five and works in an office. He has put on weight recently and wants to be more active, but cannot do early-morning sessions because of his job. He needs to be home by eight in the evening for dinner. He has not exercised regularly for years.",
            correct: "G"
          },
          {
            id: 9,
            name: "Mei",
            description: "Mei is thirty and has just moved to the city. She would like to make new friends through music. She plays the violin a little and would enjoy playing with other people. She has Friday evenings free.",
            correct: "F"
          },
          {
            id: 10,
            name: "Tomas",
            description: "Tomas is fifty and wants to do something with his hands. He has Saturday afternoons free. He prefers to learn slowly and would like a small group with personal advice. He has never tried this kind of activity before.",
            correct: "C"
          }
        ],
        places: [
          {
            letter: "A",
            title: "Tuesday Outdoor Photography Walks",
            description: "Tuesday afternoons, 4 – 6 p.m. Walk and photograph quiet places near the city, at a gentle pace. Group of 6–10 people, all ages welcome. No experience needed; bring any phone or simple camera."
          },
          {
            letter: "B",
            title: "Sunday Morning Choir",
            description: "Sundays, 10 a.m. – 12 p.m. Singing together in groups; all voices welcome and no experience needed. New members make friends very quickly. A separate children's choir runs at the same time."
          },
          {
            letter: "C",
            title: "Saturday Pottery Workshop",
            description: "Saturdays, 2 – 5 p.m. Small group of four to eight people. Beginners are very welcome. Slow, careful learning with personal advice from a master potter. All materials provided."
          },
          {
            letter: "D",
            title: "Wednesday Painting Studio",
            description: "Wednesdays, 7 – 9 p.m. For students who already have some experience with brushes or pencils. Large bright room and a friendly atmosphere. Bring your own materials."
          },
          {
            letter: "E",
            title: "Friday Mountain Hiking Group",
            description: "Fridays, 5 – 8 p.m. Long, fast walks in the mountains. Members are experienced walkers; not suitable for those with knee or back problems."
          },
          {
            letter: "F",
            title: "Friday String Ensemble",
            description: "Fridays, 6 – 7:30 p.m. For violin and cello players who already know the basics. Friendly group; we prepare a small concert for friends and family every term."
          },
          {
            letter: "G",
            title: "Tuesday Garden Yoga",
            description: "Tuesdays, 6 – 7 p.m. Outdoor yoga in the city park, suitable for adults of all fitness levels and abilities. No prior experience needed; just bring a mat."
          },
          {
            letter: "H",
            title: "Evening Boxing Class",
            description: "Tuesdays and Thursdays, 6 – 7:30 p.m. Energetic boxing for adults who want to improve their fitness. Not suitable for complete beginners; participants should already be physically active."
          }
        ]
      },

      // ───────── PART 3 (Q11-15) — long-text MCQ (4 options A-D) ─────────
      {
        partNumber: 3,
        type: "long-text-mcq",
        instruction: "Read the text below. For each question, choose the correct answer (A, B, C or D).",
        title: "Felix's free bike repairs",
        passage:
          "Felix Kovac is sixteen years old and lives in a small town with his mother. Twice a week, on Wednesday afternoons and Saturday mornings, he repairs bicycles for free in the small front garden of his mother's house. He has a wooden table where he keeps tools, and a sign on the gate that says \"Felix's Bike Hospital — by donation\".\n\nFelix learned to fix bikes from his uncle, who lives two streets away and ran a small bicycle shop until he retired last year. When the shop closed, Felix was given many of the older tools that the uncle no longer needed. Felix had been helping in the shop on Saturdays since he was eleven, so by the time the shop closed, he could change a tyre or fix a chain in less than ten minutes.\n\nThe idea of doing it for free came from his mother, who works at the local school. She had noticed that several of the children at her school had bikes that were broken — flat tyres, missing chains, broken bells — but their families could not afford to repair them. She suggested that Felix start with these students, and slowly other people in the town began to come too.\n\nFelix does not charge any money, but he asks for a small donation if people can manage. The donations go into an old metal box, and at the end of every month Felix and his mother give the money to a small local charity that helps elderly people in the town. So far, they have given just under three hundred pounds.\n\nFelix is hoping to study mechanical engineering at university, but he says that the bike repairs are not really about practising for a career. \"It's the conversations,\" he says. \"Most people who come to me are quite worried about their bikes — they need them for work or for school. To be able to give them back the bike, fixed, in twenty minutes — that's the part I enjoy.\"",
        questions: [
          {
            id: 11,
            prompt: "How did Felix learn to repair bicycles?",
            options: [
              { letter: "A", text: "He took a special class at his school." },
              { letter: "B", text: "His uncle taught him at the family bike shop." },
              { letter: "C", text: "He read about it in books from the library." },
              { letter: "D", text: "He learned by trying to fix his own broken bike." }
            ],
            correct: "B"
          },
          {
            id: 12,
            prompt: "Why did Felix's mother suggest the idea of free repairs?",
            options: [
              { letter: "A", text: "She thought Felix needed something to do at the weekends." },
              { letter: "B", text: "She knew that some children at her school had broken bikes their families could not afford to fix." },
              { letter: "C", text: "She wanted Felix to make new friends in the town." },
              { letter: "D", text: "She had been asked by the school to find a solution." }
            ],
            correct: "B"
          },
          {
            id: 13,
            prompt: "What happens to the donations Felix collects?",
            options: [
              { letter: "A", text: "Felix keeps the money to save for his university studies." },
              { letter: "B", text: "The money is used to buy new tools for the bike repairs." },
              { letter: "C", text: "It is given to a charity that helps elderly people in the town." },
              { letter: "D", text: "It is returned to the families who could not afford to pay." }
            ],
            correct: "C"
          },
          {
            id: 14,
            prompt: "According to Felix, what does he most enjoy about his work?",
            options: [
              { letter: "A", text: "the chance to practise for his future career as an engineer" },
              { letter: "B", text: "being able to return a working bike to a worried owner" },
              { letter: "C", text: "talking to his uncle about the family's old bike shop" },
              { letter: "D", text: "seeing his mother proud of what he is doing for others" }
            ],
            correct: "B"
          },
          {
            id: 15,
            prompt: "What kind of person does Felix seem to be, from the text?",
            options: [
              { letter: "A", text: "ambitious for himself rather than for other people" },
              { letter: "B", text: "interested mostly in earning extra money" },
              { letter: "C", text: "practical and willing to help his community" },
              { letter: "D", text: "shy with people he does not already know well" }
            ],
            correct: "C"
          }
        ]
      },

      // ───────── PART 4 (Q16-20) — gapped text (5 sentences removed, 8 options A-H) ─────────
      {
        partNumber: 4,
        type: "gapped-text",
        instruction: "Read the text below. Five sentences have been removed from the text. For each question, choose the correct answer (A–H). There are three extra sentences that you do not need to use.",
        title: "How I started waking up early",
        text:
          "I had spent my whole life as a 'late' person. From the age of about thirteen, I had hated mornings, often arrived at school sleepy, and as an adult I usually started work at the latest possible hour my employer allowed. ___1___ Most of my close friends, in fact, were the same.\n\nTwo years ago, however, my routine was forced to change. ___2___ The decision was not really mine: my new flat was a long bus ride from the office, and the only way to be on time was to leave home at half past six.\n\nThe first month was awful. I felt cold, slow and slightly angry every morning, and I drank too much coffee. ___3___ But, very gradually, something changed.\n\nI started to notice the silence of the streets at six thirty in the morning. ___4___ The same shopkeepers waved at me each day, the same dog ran past my bus stop. I had walked through this part of the city for years and had not really seen it.\n\nBy the end of the third month, I no longer needed an alarm clock. ___5___ For the first time in my life, I was looking forward to the start of the day.\n\nI do not think waking up early is a magic solution to anything, but I no longer dread the mornings. The slow, quiet first hour of the day, before anyone else needs anything from me, has turned out to be the part of the day I most enjoy.",
        // 8 options A-H, 5 are correct (one per gap), 3 are distractors
        options: [
          { letter: "A", text: "I had become, almost without noticing, a morning person." },
          { letter: "B", text: "I had told myself for years that this was simply the kind of person I was, and that nothing could change it." },
          { letter: "C", text: "The whole experience taught me that small, regular changes are easier than I had assumed." },
          { letter: "D", text: "I almost gave up several times, and once I nearly took a taxi instead of the bus." },
          { letter: "E", text: "I had moved to a new flat, and my journey to work had suddenly become much longer." },
          { letter: "F", text: "I had bought my first proper alarm clock the year before, but I had never used it." },
          { letter: "G", text: "I noticed, too, that the same people did the same things every morning." },
          { letter: "H", text: "I started to make notes about what I saw, planning to use them in a short story." }
        ],
        gaps: [
          { id: 16, correct: "B" },
          { id: 17, correct: "E" },
          { id: 18, correct: "D" },
          { id: 19, correct: "G" },
          { id: 20, correct: "A" }
        ]
      },

      // ───────── PART 5 (Q21-26) — cloze MCQ (vocabulary, 4 options A-D) ─────────
      {
        partNumber: 5,
        type: "cloze-mcq",
        instruction: "Read the text below and decide which answer (A, B, C or D) best fits each space.",
        title: "How dogs help people",
        text:
          "For thousands of years, dogs have ___1___ alongside humans, doing many useful jobs. Some dogs help shepherds with their sheep; others guard houses; and a small number are specially trained to ___2___ blind people through busy streets.\n\nIn recent years, dogs have ___3___ been used to help people with other kinds of problem. Some dogs visit hospitals, where they ___4___ time with patients who feel lonely or worried. Others work in airports, helping nervous travellers feel calmer before a long flight.\n\nDoctors and nurses ___5___ that the simple presence of a friendly dog can lower a person's heart rate and even reduce the amount of medicine some patients need. Few other animals have such a strong, helpful ___6___ on us.",
        gaps: [
          { id: 21, options: [{letter:"A",text:"lived"},{letter:"B",text:"worked"},{letter:"C",text:"acted"},{letter:"D",text:"joined"}], correct: "B" },
          { id: 22, options: [{letter:"A",text:"take"},{letter:"B",text:"lead"},{letter:"C",text:"bring"},{letter:"D",text:"drive"}], correct: "B" },
          { id: 23, options: [{letter:"A",text:"often"},{letter:"B",text:"ever"},{letter:"C",text:"yet"},{letter:"D",text:"always"}], correct: "A" },
          { id: 24, options: [{letter:"A",text:"spend"},{letter:"B",text:"put"},{letter:"C",text:"take"},{letter:"D",text:"make"}], correct: "A" },
          { id: 25, options: [{letter:"A",text:"say"},{letter:"B",text:"speak"},{letter:"C",text:"tell"},{letter:"D",text:"talk"}], correct: "A" },
          { id: 26, options: [{letter:"A",text:"result"},{letter:"B",text:"effect"},{letter:"C",text:"feeling"},{letter:"D",text:"sense"}], correct: "B" }
        ]
      },

      // ───────── PART 6 (Q27-32) — open cloze (1 word per gap) ─────────
      {
        partNumber: 6,
        type: "cloze-open",
        instruction: "For each question, write the correct answer. Write ONE word for each gap.",
        title: "How I painted my bedroom",
        text:
          "Last summer I decided ___1___ paint my bedroom by myself. My parents thought I was too young — I am thirteen — but they let me try.\n\nThe first thing I did ___2___ choose a colour. I spent at least an hour ___3___ the shop, looking at all the different greens before I finally chose one. The shop assistant, ___4___ was very kind, helped me work out exactly how much paint I would need.\n\nThe painting itself took a whole weekend. ___5___ Saturday morning I covered all the furniture with old sheets, and ___6___ Sunday evening the room was finally finished. I am extremely proud of it.",
        gaps: [
          { id: 27, accept: ["to"] },
          { id: 28, accept: ["was"] },
          { id: 29, accept: ["at","in"] },
          { id: 30, accept: ["who"] },
          { id: 31, accept: ["On"] },
          { id: 32, accept: ["By","on"] }
        ]
      }
    ]
  },

  writing: {
    parts: [

      // ───────── WRITING PART 1 (Q33) — email reply (~100 words) ─────────
      {
        partNumber: 7,
        writingPartNumber: 1,
        type: "guided-email",
        taskType: "Email",
        instruction: "Read this email from your English-speaking friend Charlie and the notes you have written.",
        sourceEmail:
          "From: Charlie\nSubject: Help with my school paragraph!\n\nHi! I hope school is going well!\n\nMy class has just started a new sport — basketball — and our teacher has asked us to write a paragraph about a sport we ourselves play or watch. The trouble is, I don't really play any sport at the moment! Could you help?\n\nWhat sport do you do or watch?\nWhy do you enjoy it?\nWould you recommend it to me?\n\nThanks!\nCharlie",
        bullets: [
          "Suggest the sport",
          "Tell why you enjoy it",
          "Recommend or not recommend",
          "Add a useful tip for starting"
        ],
        instructionDetail: "Write your email to Charlie using all the notes. Write about 100 words.",
        wordMin: 90,
        wordMax: 120,
        scoringRubric:
          "Award full marks if the candidate addresses all four notes clearly, uses B1-appropriate vocabulary and grammar (a range of tenses, linkers such as 'because', 'so', 'although'), produces a coherent reply that opens and closes appropriately, and writes 90 words or more. Penalise if any note is missing, the response is too short or off-topic, or the email format is unclear."
      },

      // ───────── WRITING PART 2 (Q34) — article OR story (~100 words) ─────────
      {
        partNumber: 8,
        writingPartNumber: 2,
        type: "article-or-story",
        instruction: "Choose ONE of the following tasks. Write your answer in about 100 words.",
        choices: [
          {
            id: "article",
            taskType: "Article",
            heading: "Question 1 — Article",
            prompt:
              "Your English teacher has asked you to write an article for the school magazine. Here is the question:\n\n\"What makes someone a good friend?\"\n\nTell us what you think a good friend should be like and give one example from your own life.\n\nWrite your article in about 100 words."
          },
          {
            id: "story",
            taskType: "Story",
            heading: "Question 2 — Story",
            prompt:
              "Your English teacher has asked you to write a story for the school magazine. Your story must begin with this sentence:\n\n\"When I looked at my phone, I saw a strange message.\"\n\nWrite your story in about 100 words."
          }
        ],
        wordMin: 90,
        wordMax: 120,
        scoringRubric:
          "Award full marks if the candidate has chosen ONE option, fully developed it (clear opinion + reasons + example for the article; logical narrative with a beginning, middle and end for the story), used B1-appropriate vocabulary and grammar with a good range of structures, and written 90 words or more. Penalise if the response is off-topic, too short, mixes both tasks, or fails to follow the given prompt sentence (story option)."
      }
    ]
  }
};
