// CAE (C1 Advanced) Reading, Use of English & Writing — Mock 01
// Post-2015 Cambridge format: 180 min combined paper
//   Reading & Use of English: 90 min, 8 parts, 56 questions
//   Writing: 90 min, 2 tasks, 220-260 words each
// All content is original AI-authored material (Mock Stream).

window.CAE_RW_TEST = {
  testInfo: {
    id: "cae-rw-01",
    title: "CAE Reading, Use of English & Writing Mock 01",
    level: "C1",
    totalTime: 180,
    totalQuestions: 58,        // 56 reading items + 2 writing tasks (Q57, Q58)
    readingQuestions: 56,
    writingTasks: 2
  },

  reading: {
    parts: [

      // ───────── PART 1 (Q1-8) — multiple-choice cloze (4 options) ─────────
      {
        partNumber: 1,
        type: "cloze-mcq",
        instruction: "For questions 1–8, read the text below and decide which answer (A, B, C or D) best fits each gap.",
        title: "The hidden language of scent",
        text:
          "Scientists have long suspected that the human sense of smell is far more ___1___ than we tend to give it credit for. Recent research from a Stockholm-based laboratory ___2___ that the average adult can distinguish more than one trillion different smells — a figure that comfortably ___3___ even the most optimistic earlier estimates. The findings ___4___ a long-held belief that humans had a comparatively poor sense of smell, particularly when ___5___ alongside that of other mammals.\n\nWhat is more, scent appears to play a far greater ___6___ in human social life than we realise. Studies have shown that people unconsciously use smell to ___7___ judgements about who they trust, who they find attractive, and even, in some cases, what mood another person is in. So the next time you ___8___ a feeling that you simply 'don't like' someone, your nose may be partly responsible.",
        gaps: [
          { id: 1, options: [{letter:"A",text:"sophisticated"},{letter:"B",text:"detailed"},{letter:"C",text:"acute"},{letter:"D",text:"thorough"}], correct: "C" },
          { id: 2, options: [{letter:"A",text:"ensures"},{letter:"B",text:"implies"},{letter:"C",text:"promises"},{letter:"D",text:"reveals"}], correct: "D" },
          { id: 3, options: [{letter:"A",text:"overcomes"},{letter:"B",text:"outdoes"},{letter:"C",text:"exceeds"},{letter:"D",text:"prevails"}], correct: "C" },
          { id: 4, options: [{letter:"A",text:"revise"},{letter:"B",text:"overturn"},{letter:"C",text:"overwrite"},{letter:"D",text:"deny"}], correct: "B" },
          { id: 5, options: [{letter:"A",text:"compared"},{letter:"B",text:"contrasted"},{letter:"C",text:"ranked"},{letter:"D",text:"measured"}], correct: "A" },
          { id: 6, options: [{letter:"A",text:"part"},{letter:"B",text:"hand"},{letter:"C",text:"function"},{letter:"D",text:"place"}], correct: "A" },
          { id: 7, options: [{letter:"A",text:"form"},{letter:"B",text:"make"},{letter:"C",text:"take"},{letter:"D",text:"do"}], correct: "B" },
          { id: 8, options: [{letter:"A",text:"take"},{letter:"B",text:"get"},{letter:"C",text:"feel"},{letter:"D",text:"have"}], correct: "D" }
        ]
      },

      // ───────── PART 2 (Q9-16) — open cloze (1 word per gap) ─────────
      {
        partNumber: 2,
        type: "cloze-open",
        instruction: "For questions 9–16, read the text below and think of the word which best fits each gap. Use only ONE word in each gap.",
        title: "Why we remember music so well",
        text:
          "There is something curious ___1___ the way music sticks in our minds. A song you have not heard for twenty years can come on the radio and, almost ___2___ thinking about it, you find yourself singing every word. Few other types of memory work in ___3___ a powerful way.\n\nNeuroscientists have begun to understand ___4___ this is. Music, it turns out, activates an unusually wide range of brain regions, including those involved ___5___ emotion, movement and language. ___6___ a result, when we listen carefully to a song, we are creating multiple memory paths at once.\n\nThis may also be the reason why music can sometimes help people ___7___ memory difficulties. Patients who can no longer remember the names of their own children have ___8___ known to sing the songs of their youth from start to finish, without missing a single line.",
        gaps: [
          { id: 9,  accept: ["about"] },
          { id: 10, accept: ["without"] },
          { id: 11, accept: ["such"] },
          { id: 12, accept: ["why"] },
          { id: 13, accept: ["in"] },
          { id: 14, accept: ["As"] },
          { id: 15, accept: ["with"] },
          { id: 16, accept: ["been"] }
        ]
      },

      // ───────── PART 3 (Q17-24) — word formation ─────────
      {
        partNumber: 3,
        type: "word-formation",
        instruction: "For questions 17–24, read the text below. Use the word given in capitals at the end of some of the lines to form a word that fits in the gap in the same line.",
        title: "The art of saying nothing",
        text:
          "Most of us spend a great deal of time trying to fill silences in conversation, but for the best communicators, this can actually be a ___1___ rather than an aid.\n\nStudies of skilled negotiators show that they speak only half as ___2___ as their less experienced colleagues. When they do speak, their ___3___ tend to be carefully chosen and brief.\n\nThe same is true of effective doctors. A patient who is given the ___4___ to talk for even thirty seconds longer is much more likely to mention the symptom that really matters. A short pause at the end of a question can be remarkably ___5___.\n\nIn personal life, too, learning to be ___6___ with silence can transform our relationships. Children, in particular, will often tell us things they have been trying to say for days, but only if we have the ___7___ not to interrupt them.\n\nSo next time you find yourself rushing to fill a pause, try waiting instead. The ___8___ may surprise you.",
        gaps: [
          { id: 17, root: "HINDER",     accept: ["hindrance"] },
          { id: 18, root: "FREQUENT",   accept: ["frequently"] },
          { id: 19, root: "CONTRIBUTE", accept: ["contributions"] },
          { id: 20, root: "FREE",       accept: ["freedom"] },
          { id: 21, root: "REVEAL",     accept: ["revealing"] },
          { id: 22, root: "COMFORT",    accept: ["comfortable"] },
          { id: 23, root: "PATIENT",    accept: ["patience"] },
          { id: 24, root: "RESPOND",    accept: ["response"] }
        ]
      },

      // ───────── PART 4 (Q25-30) — key word transformation (3-6 words) ─────────
      {
        partNumber: 4,
        type: "key-word-transformation",
        wordRange: "3–6",
        instruction: "For questions 25–30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do NOT change the word given. You must use between THREE and SIX words, including the word given.",
        items: [
          {
            id: 25,
            original: "I really regret not learning to drive when I was younger.",
            keyWord: "WISH",
            gapped: "I ___ to drive when I was younger.",
            accept: ["wish I had learned", "wish I had learnt", "wish that I had learned", "wish that I had learnt"]
          },
          {
            id: 26,
            original: "Sara found it difficult to admit she was wrong.",
            keyWord: "DIFFICULTY",
            gapped: "Sara ___ that she was wrong.",
            accept: ["had difficulty admitting", "had some difficulty admitting", "had great difficulty admitting"]
          },
          {
            id: 27,
            original: "It is not necessary to bring a packed lunch on the trip.",
            keyWord: "NEED",
            gapped: "You ___ a packed lunch on the trip.",
            accept: ["do not need to bring", "don't need to bring", "needn't bring"]
          },
          {
            id: 28,
            original: "I'd rather you didn't tell anyone about this.",
            keyWord: "PREFER",
            gapped: "I ___ anyone about this.",
            accept: ["would prefer you not to tell", "'d prefer you not to tell", "would prefer you didn't tell", "'d prefer you didn't tell"]
          },
          {
            id: 29,
            original: "The town has changed so much that I hardly recognised it.",
            keyWord: "BARELY",
            gapped: "The town has changed so much that I ___ recognise it.",
            accept: ["was barely able to", "could barely"]
          },
          {
            id: 30,
            original: "I'll only help you if you promise to listen carefully.",
            keyWord: "CONDITION",
            gapped: "I'll help you ___ listen carefully.",
            accept: ["on condition that you", "on the condition that you"]
          }
        ]
      },

      // ───────── PART 5 (Q31-36) — long-text MCQ (4 options A-D) ─────────
      {
        partNumber: 5,
        type: "long-text-mcq",
        instruction: "You are going to read a magazine article about a librarian who transformed a small-town library. For questions 31–36, choose the answer (A, B, C or D) which you think fits best according to the text.",
        title: "The librarian who saved a town",
        passage:
          "When Anna Petrov first arrived in the small town of Riverstone, in the north of her country, she was not expecting to stay long. Trained as a librarian in the capital, she had taken a temporary post at the local public library because she needed work and the rent in the town was extremely cheap. The library itself was almost empty. It had once served three thousand readers a year; by the time Anna arrived, that number had dropped to under three hundred. The previous librarian, who had been in post for twenty-eight years, had retired without replacement, and the town council was openly discussing closing the building down.\n\nAnna's first instinct was to refuse the job. The library, she felt, did not really need a librarian; it needed a miracle. Her parents agreed. Her old college tutor, when she telephoned him for advice, told her bluntly that the post would damage her career and that she should take the next train back to the city. Yet something about the building — its cracked white walls, its abandoned reading room, the long row of children's books which had clearly not been opened for years — made her hesitate. She accepted on a six-month contract, with the quiet intention of leaving as soon as she possibly could.\n\nTwo weeks into the job, however, an old man came in and asked, very politely, whether the library still organised the Saturday morning reading club. Anna had no idea what he was talking about. Half an hour and several phone calls later, she discovered that the previous librarian had once run a reading group for elderly residents, but it had stopped during the long final years of his retirement. She also learned, that same afternoon, that there had once been a children's storytelling hour, a knitting circle, an English-language conversation group, and even a small repair café. None of these had been closed for any practical reason; they had simply faded, one by one, after the last librarian had become too tired to keep them going.\n\nAnna decided to make a list. Within a month, she had restarted three of the old groups and created two new ones. She did almost no advertising; instead, she rang round the older readers whose names she had found in dusty membership cards, and asked them, as a personal favour, to come to the first meeting and to bring one friend each. By the end of her first year, the library was hosting nineteen different events a week, from school homework help to a small writers' circle which has since produced two locally published novels.\n\nThe town council, initially sceptical, has become Anna's greatest supporter. The annual visitor numbers, which were under three hundred when she arrived, are now over six thousand, and the council has agreed to keep the library open for at least the next ten years. Anna, for her part, is no longer planning to return to the capital. She is, however, keen to point out that she has done very little on her own: 'It was already in the building,' she says, gesturing at the now-busy reading room. 'I just had to listen for it.'",
        questions: [
          {
            id: 31,
            prompt: "Why did Anna originally take the job in Riverstone?",
            options: [
              { letter: "A", text: "She had family connections to the town." },
              { letter: "B", text: "She had specifically wanted a quiet library to work in." },
              { letter: "C", text: "She needed work and the town was inexpensive." },
              { letter: "D", text: "She had been recommended for the post by her old tutor." }
            ],
            correct: "C"
          },
          {
            id: 32,
            prompt: "The previous librarian's retirement is described as having affected the library mainly because:",
            options: [
              { letter: "A", text: "it left the building physically damaged." },
              { letter: "B", text: "the activities he had run gradually came to an end." },
              { letter: "C", text: "the council had immediately stopped funding it." },
              { letter: "D", text: "readers in the town had started to use the larger city library instead." }
            ],
            correct: "B"
          },
          {
            id: 33,
            prompt: "What does the writer suggest about Anna's tutor in the second paragraph?",
            options: [
              { letter: "A", text: "He thought the job was likely to harm Anna's professional future." },
              { letter: "B", text: "He had personally worked at the Riverstone library many years before." },
              { letter: "C", text: "He believed Anna was the only person who could save the building." },
              { letter: "D", text: "He felt that Anna lacked the experience needed for the role." }
            ],
            correct: "A"
          },
          {
            id: 34,
            prompt: "The reference to \"cracked white walls\" and \"abandoned reading room\" suggests that:",
            options: [
              { letter: "A", text: "Anna found the building physically very unpleasant to work in." },
              { letter: "B", text: "the library was beyond any reasonable hope of being restored." },
              { letter: "C", text: "the building's poor state had a paradoxical effect on Anna's decision." },
              { letter: "D", text: "the council was already preparing to demolish the building." }
            ],
            correct: "C"
          },
          {
            id: 35,
            prompt: "According to the third paragraph, the old activities at the library:",
            options: [
              { letter: "A", text: "had been deliberately stopped by the council." },
              { letter: "B", text: "had been moved to a different building in the town." },
              { letter: "C", text: "had stopped because the previous librarian could no longer manage them." },
              { letter: "D", text: "had been kept going on a small scale by a few volunteers." }
            ],
            correct: "C"
          },
          {
            id: 36,
            prompt: "Anna's comment \"I just had to listen for it\" suggests that she believes:",
            options: [
              { letter: "A", text: "she succeeded mainly through luck rather than skill." },
              { letter: "B", text: "her job was largely to notice what the community already wanted." },
              { letter: "C", text: "the library will always need a librarian as patient as she is." },
              { letter: "D", text: "the town is no longer interested in returning to its older traditions." }
            ],
            correct: "B"
          }
        ]
      },

      // ───────── PART 6 (Q37-40) — cross-text multiple matching (4 short opinion-texts, 4 questions) ─────────
      {
        partNumber: 6,
        type: "multiple-matching",
        instruction: "You are going to read four short articles in which education experts give their views on early foreign-language learning. For questions 37–40, choose from the experts (A–D). The experts may be chosen more than once.",
        topic: "Four educators give their views on early foreign-language learning",
        sections: [
          {
            letter: "A",
            title: "Dr Helen Marwick — child psychologist",
            body: "The advantages of an early start are very often overstated. Children who learn a second language before age seven do tend to acquire near-perfect pronunciation, but this is just one part of language learning, and the fact is that with equal teaching, children who start at eleven catch up — and in many cases overtake — their younger peers within a few years. What really matters is the quality and the consistency of the contact: thirty minutes a week with an unenthusiastic teacher will achieve far less than ten minutes a day with someone who really enjoys the language."
          },
          {
            letter: "B",
            title: "Professor Sasha Lim — applied linguist",
            body: "For decades, the standard view has been that 'younger is better' when it comes to second languages. I think this view should be abandoned, or at least considerably modified. Long-term studies suggest that, given equal hours of contact, older children — those starting at around eleven — actually progress faster than younger ones, because they can use their first-language reading skills to support the second language. The famous advantage of younger learners in pronunciation is real, but it is also short-lived if the child does not continue to use the language at home."
          },
          {
            letter: "C",
            title: "Maria Conti — primary teacher and curriculum designer",
            body: "Speaking from years of classroom experience, I believe that there is a unique opportunity in the early years that simply does not exist later. Children of seven absorb a new language differently — through play, through music, and most importantly without any of the self-consciousness that prevents older learners from speaking up. I have repeatedly seen pupils who started Spanish with me at six end up far more confident speakers in their teens than those who started later, even when the older pupils had more total study hours. What matters is using the brain's natural openness when it is most available."
          },
          {
            letter: "D",
            title: "Tom Fielding — educational policy researcher",
            body: "There is a growing tendency, especially in private schools, to introduce a foreign language as early as age four or five. Much of this is driven by parents rather than evidence. The honest truth is that we still do not have clear data showing that children who start at four end up better than children who start at eight, when both are given the same number of hours of high-quality teaching. What we do know is that very early learners can develop a confident accent, particularly if the teacher is a near-native speaker, but this advantage tends to fade quickly when contact is occasional."
          }
        ],
        questions: [
          { id: 37, prompt: "Which expert has a view different from the other three about whether starting at a very young age gives a real long-term language advantage?", correct: "C" },
          { id: 38, prompt: "Which expert expresses a similar view to D about how the advantage in pronunciation is affected by the amount of contact a child has with the language?", correct: "B" },
          { id: 39, prompt: "Which expert agrees with B that older learners can keep up with or overtake younger ones?", correct: "A" },
          { id: 40, prompt: "Which expert holds a different view from the others about why early language learning is currently being introduced in some schools?", correct: "D" }
        ]
      },

      // ───────── PART 7 (Q41-46) — gapped text (6 paragraphs removed, 7 options A-G) ─────────
      {
        partNumber: 7,
        type: "gapped-text",
        instruction: "You are going to read an article in which a writer reflects on living without a smartphone. Six paragraphs have been removed from the article. Choose from the paragraphs A–G the one which fits each gap (41–46). There is one extra paragraph which you do not need to use.",
        title: "Why I decided to live without a smartphone",
        text:
          "Three years ago, I made what felt at the time like a small decision: I would leave my smartphone at home for a single weekend. By Sunday evening, I knew that the experiment would not end there. The two days had been so different from any I could remember in the previous decade that, the following morning, I drove to a small electronics shop on the edge of town and bought a cheap mobile phone of the kind that does almost nothing. I have not owned a smartphone since.\n\n___1___\n\nI did not, for example, become more productive. I read no more books than I had read before, learned no new languages, and started no thrilling hobbies. The evenings, free of social-media scrolling, were not suddenly transformed into long, candle-lit hours of useful achievement. Instead, I was often more bored than I had been before. Sometimes I simply went to sleep at half past nine because I could not think what else to do.\n\n___2___\n\nIt was not so much that life became more interesting. It was that I started to notice it again. I noticed the way my neighbour always says good morning to the bus driver. I noticed the seven different bird species that visit our garden in autumn. I noticed that the tomatoes I had planted in a small corner near the kitchen window were ripening unevenly because of the angle of the afternoon sun.\n\n___3___\n\nThere were less pleasant changes too. I had been used to checking my email last thing at night, the way other people used to check that the back door was locked. Without that, I lay awake for the first few weeks worrying about messages I had not yet read. My family complained that I was harder to reach, and several friends seemed to find it personally offensive that I could no longer be reached at any hour of the day.\n\n___4___\n\nThe change I had not expected at all, however, was the slow shift in my relationships. Conversations grew longer because nobody glanced down at a screen mid-sentence. My partner started asking me what I was thinking, because there was no longer the unspoken assumption that I was thinking about something on a phone. My children, too, began telling me longer stories about their school day, perhaps because for the first time they felt my full attention.\n\n___5___\n\nIt would be misleading, of course, to suggest that this is the only valid way of living. People with caring responsibilities, complicated medical conditions, or jobs that depend on instant communication may find it impossible to live this way. I am very aware that my own situation makes the experiment relatively easy to maintain.\n\n___6___\n\nI do not, in the end, recommend that everyone follow my example. But I would gently suggest that almost anyone might benefit from putting their device away for a single weekend. What you find may not be world-changing. It may, however, be more interesting than you expect.",
        // 7 options A-G; 6 are correct (one per gap), 1 is a distractor
        options: [
          { letter: "A", text: "The benefits, when they did appear, were therefore far smaller than I had expected. They were also, in a strange way, more valuable." },
          { letter: "B", text: "After about three months, however, these difficulties began to fade. My friends adjusted, and I began to enjoy the sense that my evenings did not, in fact, belong to my employer." },
          { letter: "C", text: "I want to be honest about what happened next, because I have grown tired of articles that exaggerate the consequences of small lifestyle changes." },
          { letter: "D", text: "There is also, I now realise, a small but real pleasure in knowing that I am no longer contributing to the constant pressure on the global mineral supply chain — and I have saved nearly three hundred pounds a year as a side effect." },
          { letter: "E", text: "None of these things are dramatic. Yet, taken together, they have made the world feel a great deal larger." },
          { letter: "F", text: "Even now, when I am offered a smartphone for free, I refuse it without hesitation." },
          { letter: "G", text: "There is also, I think, a quieter argument for trying it that has nothing to do with productivity or even with relationships." }
        ],
        gaps: [
          { id: 41, correct: "C" },
          { id: 42, correct: "A" },
          { id: 43, correct: "E" },
          { id: 44, correct: "B" },
          { id: 45, correct: "D" },
          { id: 46, correct: "F" }
        ]
      },

      // ───────── PART 8 (Q47-56) — multiple matching (10 Q to 4 sections A-D) ─────────
      {
        partNumber: 8,
        type: "multiple-matching",
        instruction: "You are going to read a feature article about four authors who began publishing fiction later in life. For questions 47–56, choose from the writers (A–D). The writers may be chosen more than once.",
        topic: "Four authors who started writing later in life",
        sections: [
          {
            letter: "A",
            title: "Yulia Marsh — started at 52",
            body: "Yulia Marsh worked as a primary-school teacher for almost thirty years before she began writing seriously. Her first novel, 'The Slow River', was published when she was 54, after fourteen rejections from different agents. She insists, however, that she did not really start writing late: she had filled notebooks all through her twenties and thirties, but had never shown them to anyone. 'I think I was waiting for permission,' she now says, 'and at fifty I just decided to give it to myself.' Her novels are mostly set in small fishing villages, and they typically focus on relationships within families. Critics have particularly praised her unusual ability to write about silence — long, unspoken disagreements between family members are a frequent feature of her work. Yulia continues to teach part-time at the same school where she worked for thirty years, and most of her summer holidays are still spent looking after her grandchildren rather than promoting her books."
          },
          {
            letter: "B",
            title: "Marco Lin — started at 45",
            body: "Marco Lin trained as an architect and ran a small but successful firm in Hong Kong for many years. He turned to writing only after a long illness in his early forties forced him to stop work. His first published book was a short collection of essays about the buildings he had designed and the cities he had lived in — a fairly conventional architecture book. Few readers, however, have followed the path he has taken since. His most recent work is a novel told entirely from the point of view of an empty office building. Marco himself laughs about this: 'I spent twenty-five years putting buildings up. Now I write about what they think after we have gone home.' Marco does almost no publicity for his work and dislikes giving readings, although he agreed to one of the most-watched online interviews of the year, which he answered while gardening. He now lives in a small village three hours from any city."
          },
          {
            letter: "C",
            title: "Aisha Bouzid — started at 48",
            body: "Aisha Bouzid is one of the most-translated writers of her generation, but she did not write a word of fiction until her forty-eighth birthday. Before that, she had worked as a translator herself, mostly between French and English. 'Translation taught me everything I know about writing,' she has said. 'Especially that there is no such thing as a perfect sentence — only one that is right for this paragraph today.' Her first novel was rejected several times, and she eventually paid to print three hundred copies herself. The book sold nine hundred copies in its first year, almost entirely through one independent bookshop in Marseille whose owner had loved the manuscript. Today, her work has been translated into thirty-one languages. Aisha believes strongly that older writers have certain advantages that younger ones do not, in particular a tolerance for slow progress. She now mentors three or four younger writers each year."
          },
          {
            letter: "D",
            title: "Daniel Park — started at 60",
            body: "Daniel Park retired from a career in engineering at the age of sixty and began writing fiction the following Monday. He has often joked that his career as a writer began on a particular day. His first novel was a science-fiction story written in the form of letters between an astronaut and his elderly mother. It became a quiet success in his country, but did not attract much attention abroad. His second book, however, was an entirely different kind of work — a detective novel set in a small mountain town — and it sold over a million copies worldwide. Daniel, who once said in an interview that he had 'no ear for poetry', has nevertheless published a small book of poems in the last two years which has surprised everyone, including himself. He still travels to most of his readings by train, often arriving with a small leather suitcase that he has owned for forty years."
          }
        ],
        questions: [
          { id: 47, prompt: "Whose first published work was non-fiction?",                                                  correct: "B" },
          { id: 48, prompt: "Who paid to publish their own first book?",                                                    correct: "C" },
          { id: 49, prompt: "Whose first published novel belonged to the science-fiction genre?",                            correct: "D" },
          { id: 50, prompt: "Who admits to having delayed showing their writing to anyone for many years?",                  correct: "A" },
          { id: 51, prompt: "Who continues to do, on a smaller scale, the same job they had before becoming a writer?",      correct: "A" },
          { id: 52, prompt: "Whose change of career was triggered by a serious health problem?",                             correct: "B" },
          { id: 53, prompt: "Who has produced work in a literary form they previously claimed they had no talent for?",       correct: "D" },
          { id: 54, prompt: "Who explicitly argues that beginning to write later in life can have specific advantages?",     correct: "C" },
          { id: 55, prompt: "Who actively avoids most public events linked to their writing?",                                correct: "B" },
          { id: 56, prompt: "Who credits earlier work with another language for their understanding of how to write?",        correct: "C" }
        ]
      }
    ]
  },

  writing: {
    parts: [

      // ───────── WRITING PART 1 (Q57) — compulsory essay (220-260 words) ─────────
      {
        partNumber: 9,                // continuous internal numbering after 8 reading parts
        writingPartNumber: 1,
        type: "essay",
        taskType: "Essay",
        instruction: "Your class has had a discussion on how governments could encourage people to spend more time outdoors. You have made the notes below.",
        topic: "How can governments encourage people to spend more time outdoors?",
        bullets: [
          "Building more parks and green spaces",
          "Limiting working hours by law",
          "Improving public transport to natural areas"
        ],
        opinions: [
          "If you make it cheaper and faster to reach the countryside, people will go.",
          "Working long hours is the real reason most of us never go outside.",
          "We don't need more parks; we need to teach children to enjoy the parks we have."
        ],
        taskPrompt: "Write an essay discussing TWO of the methods in your notes. You should explain which method would be more effective in encouraging people to spend more time outdoors and provide reasons to support your opinion.\n\nYou may, if you wish, make use of the opinions expressed in the discussion, but you should use your own words as far as possible.",
        wordMin: 220,
        wordMax: 260,
        scoringRubric:
          "Award full marks if the candidate selects exactly TWO of the three methods, develops a balanced argument with a clear final position, integrates (in their own words) at least one of the quoted opinions, uses C1-appropriate vocabulary and a wide range of grammatical structures (linkers, modals, conditionals, complex noun phrases), maintains an appropriate semi-formal essay register, and writes 220–260 words. Penalise off-topic content, discussing fewer or more than two methods, fewer than 220 words, or inappropriate register."
      },

      // ───────── WRITING PART 2 (Q58) — choose 1 of 3 (220-260 words) ─────────
      {
        partNumber: 10,
        writingPartNumber: 2,
        type: "choice-of-three",
        instruction: "Write an answer to ONE of the questions 2–4 in this part. Write your answer in 220–260 words in an appropriate style.",
        choices: [
          {
            id: "letter",
            taskType: "Letter",
            heading: "Question 2 — Letter",
            prompt:
              "You see this notice on an English-language website:\n\nLETTERS TO OUR READERS\n\nWe are running a special edition next month on the topic of work-life balance. Have you found a way to combine work and free time that really works for you? Tell us what you do, why you would recommend it to other young professionals, and what difficulties you had to overcome to make it work.\n\nThe most interesting letters will be published online.\n\nWrite your letter."
          },
          {
            id: "proposal",
            taskType: "Proposal",
            heading: "Question 3 — Proposal",
            prompt:
              "Your local council is planning to spend money on improving facilities for young people in your area. You have been asked by the council to write a proposal explaining what facility you think the money should be spent on, why young people in the area would benefit from it, and how the new facility could be advertised to encourage them to use it.\n\nWrite your proposal."
          },
          {
            id: "review",
            taskType: "Review",
            heading: "Question 4 — Review",
            prompt:
              "You see this announcement on an English-language website:\n\nREVIEWS NEEDED\n\nWe are looking for reviews of recent books you have read which were translated into English from another language. Please briefly tell us what the book is about, comment on how successful you think the translation has been, and say whether you would recommend the book to readers your age.\n\nWrite your review."
          }
        ],
        wordMin: 220,
        wordMax: 260,
        scoringRubric:
          "Award full marks if the candidate has chosen ONE option, fully matched its expected register and conventions (letter: appropriate opening/closing + answers to all elements; proposal: clear sections with headings or signposting + recommendations + persuasive tone; review: summary + critical evaluation + recommendation for the target audience), used C1-appropriate vocabulary, demonstrated a wide range of grammatical structures, and written 220–260 words. Penalise off-topic content, mixing tasks, wrong register, or fewer than 220 words."
      }
    ]
  }
};
