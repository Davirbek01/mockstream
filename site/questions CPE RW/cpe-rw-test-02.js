// CPE (C2 Proficiency) Reading, Use of English & Writing — Mock 02
// Cambridge format: 180 min combined paper
//   Reading & Use of English: 90 min, 7 parts, 53 questions
//   Writing: 90 min, 2 tasks (Part 1 240-280 words, Part 2 280-320 words)
// All content is original AI-authored material (Mock Stream).

window.CPE_RW_TEST = {
  testInfo: {
    id: "cpe-rw-02",
    title: "CPE Reading, Use of English & Writing Mock 02",
    level: "C2",
    totalTime: 180,
    totalQuestions: 55,        // 53 reading items + 2 writing tasks (Q54, Q55)
    readingQuestions: 53,
    writingTasks: 2
  },

  reading: {
    parts: [

      // ───────── PART 1 (Q1-8) — multiple-choice cloze (4 options) ─────────
      {
        partNumber: 1,
        type: "cloze-mcq",
        instruction: "For questions 1–8, read the text below and decide which answer (A, B, C or D) best fits each gap.",
        title: "Why advice is so hard to take",
        text:
          "There is something almost paradoxical ___1___ the way we treat advice. We routinely complain that nobody tells us anything useful about money, relationships, or careers, ___2___ we then ignore, with remarkable consistency, the advice we are eventually given. ___3___ on closer examination, this is less surprising than it appears. Most advice ___4___ from people whose situation, however slightly, differs from our own. The recipient must therefore translate the advice into a different set of circumstances — and translation, as anyone who has tried to learn a foreign language knows, is rarely a simple ___5___.\n\nThere is also a deeper problem. Useful advice usually ___6___ a recommendation that is at least mildly unwelcome: spend less, exercise more, end the difficult conversation sooner. The harder the recommendation, the more easily we tell ourselves that the adviser does not really understand our particular situation, and that the advice does not, ___7___, apply. Only later, when we have ___8___ the consequences ourselves, does it occur to us that the advice was probably right after all.",
        gaps: [
          { id: 1, options: [{letter:"A",text:"about"},{letter:"B",text:"for"},{letter:"C",text:"with"},{letter:"D",text:"of"}], correct: "A" },
          { id: 2, options: [{letter:"A",text:"until"},{letter:"B",text:"since"},{letter:"C",text:"yet"},{letter:"D",text:"where"}], correct: "C" },
          { id: 3, options: [{letter:"A",text:"Yet"},{letter:"B",text:"Hence"},{letter:"C",text:"Thus"},{letter:"D",text:"Whereas"}], correct: "A" },
          { id: 4, options: [{letter:"A",text:"flies"},{letter:"B",text:"drifts"},{letter:"C",text:"comes"},{letter:"D",text:"departs"}], correct: "C" },
          { id: 5, options: [{letter:"A",text:"point"},{letter:"B",text:"issue"},{letter:"C",text:"matter"},{letter:"D",text:"chance"}], correct: "C" },
          { id: 6, options: [{letter:"A",text:"avoids"},{letter:"B",text:"involves"},{letter:"C",text:"refuses"},{letter:"D",text:"rejects"}], correct: "B" },
          { id: 7, options: [{letter:"A",text:"by chance"},{letter:"B",text:"at last"},{letter:"C",text:"in fact"},{letter:"D",text:"on purpose"}], correct: "C" },
          { id: 8, options: [{letter:"A",text:"gone"},{letter:"B",text:"faced"},{letter:"C",text:"hit"},{letter:"D",text:"bound"}], correct: "B" }
        ]
      },

      // ───────── PART 2 (Q9-16) — open cloze (1 word per gap) ─────────
      {
        partNumber: 2,
        type: "cloze-open",
        instruction: "For questions 9–16, read the text below and think of the word which best fits each gap. Use only ONE word in each gap.",
        title: "How olive trees survive everything",
        text:
          "For more than four thousand years, the olive tree has been a quietly remarkable inhabitant of the Mediterranean. Few other crops can claim ___1___ much continuity. Some of the trees that produce oil for sale today were already old ___2___ the Romans were building their first villas around them. Their secret lies partly ___3___ a slow-growing root system that, ___4___ broad-leaved trees, can find water at depths most other plants never reach.\n\nThis patience ___5___ extraordinary practical effects. An olive grove that has been carefully tended for two centuries will, in good years, produce more oil than a young grove twice ___6___ size. ___7___ neglected trees, given enough time, often recover from damage that would kill almost any other crop. Farmers in some southern regions still tell stories of olive trees that survived a fire, a drought and a long period of being forgotten ___8___ all.",
        gaps: [
          { id: 9,  accept: ["such"] },
          { id: 10, accept: ["when","as"] },
          { id: 11, accept: ["in"] },
          { id: 12, accept: ["unlike"] },
          { id: 13, accept: ["has"] },
          { id: 14, accept: ["its","the"] },
          { id: 15, accept: ["Even"] },
          { id: 16, accept: ["at"] }
        ]
      },

      // ───────── PART 3 (Q17-24) — word formation ─────────
      {
        partNumber: 3,
        type: "word-formation",
        instruction: "For questions 17–24, read the text below. Use the word given in capitals at the end of some of the lines to form a word that fits in the gap in the same line.",
        title: "Why we daydream",
        text:
          "For most of human history, daydreaming was treated by educators with deep ___1___.\n\nChildren who failed to attend to their lessons were considered guilty of a kind of ___2___ at best, dishonesty at worst.\n\nModern psychologists, however, are beginning to see daydreaming as something ___3___ different.\n\nFar from being a ___4___ of mental discipline, the wandering mind appears to be doing essential, hidden work.\n\nBrain-imaging studies have shown that the so-called default mode network — the part of the brain most active when we are not concentrating — is ___5___ involved in long-term planning, social understanding, and creative problem-solving.\n\nIn one ___6___ experiment, participants who had been allowed to daydream for ten minutes between two tasks performed nearly twice as well on the second one as those who had been kept busy.\n\nThe ___7___ for parents and teachers, the researchers argue, is not to discourage children's wandering attention, but to leave space for it.\n\nWhether we will ever see classrooms in which empty time is treated as a ___8___ resource, however, remains to be seen.",
        gaps: [
          { id: 17, root: "SUSPECT", accept: ["suspicion"] },
          { id: 18, root: "LAZY",    accept: ["laziness"] },
          { id: 19, root: "REMARK",  accept: ["remarkably"] },
          { id: 20, root: "FAIL",    accept: ["failure"] },
          { id: 21, root: "DEEP",    accept: ["deeply"] },
          { id: 22, root: "NOTE",    accept: ["notable"] },
          { id: 23, root: "IMPLY",   accept: ["implication"] },
          { id: 24, root: "VALUE",   accept: ["valuable"] }
        ]
      },

      // ───────── PART 4 (Q25-30) — key word transformation (3-8 words) ─────────
      {
        partNumber: 4,
        type: "key-word-transformation",
        wordRange: "3–8",
        instruction: "For questions 25–30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do NOT change the word given. You must use between THREE and EIGHT words, including the word given.",
        items: [
          {
            id: 25,
            original: "He had no idea that his car had been stolen.",
            keyWord: "KNOW",
            gapped: "Little ___ that his car had been stolen.",
            accept: ["did he know"]
          },
          {
            id: 26,
            original: "I'm sure she'll arrive on time tomorrow.",
            keyWord: "BOUND",
            gapped: "She ___ on time tomorrow.",
            accept: ["is bound to arrive","'s bound to arrive"]
          },
          {
            id: 27,
            original: "Even if he had apologised, I wouldn't have forgiven him.",
            keyWord: "HAD",
            gapped: "I wouldn't have forgiven him ___ apologised.",
            accept: ["even if he had","even had he"]
          },
          {
            id: 28,
            original: "It is essential that you read the contract before signing it.",
            keyWord: "ABSOLUTE",
            gapped: "Reading the contract before signing it ___ priority.",
            accept: ["should be your absolute","is your absolute","ought to be your absolute"]
          },
          {
            id: 29,
            original: "I find it impossible to forgive what he did.",
            keyWord: "BRING",
            gapped: "I cannot ___ what he did.",
            accept: ["bring myself to forgive"]
          },
          {
            id: 30,
            original: "I'd rather you didn't tell anyone about this.",
            keyWord: "PREFER",
            gapped: "I ___ tell anyone about this.",
            accept: ["would prefer you not to","'d prefer you not to","would prefer you didn't","'d prefer you didn't"]
          }
        ]
      },

      // ───────── PART 5 (Q31-36) — long-text MCQ (4 options A-D) ─────────
      {
        partNumber: 5,
        type: "long-text-mcq",
        instruction: "You are going to read a feature article about an unusual bookseller. For questions 31–36, choose the answer (A, B, C or D) which you think fits best according to the text.",
        title: "The bookseller who buys back his own books",
        passage:
          "When 52-year-old Henrik Vogel opened his small bookshop in the centre of Antwerp twenty years ago, he had a stock of around six thousand titles, and he was mildly embarrassed at how small that figure was compared with his nearest competitor. By the time the larger shop closed last December, beaten by online sales, Henrik's own shop had reduced its stock — quite deliberately — to fewer than nine hundred. The reduction had not been forced upon him; it was his own most carefully considered business decision.\n\nThe idea began with a question Henrik had started asking customers in his early forties. \"If I told you,\" he would say, \"that you could only buy six books from this shop in the whole of next year, and that the next year I would let you buy six more, would you choose differently?\" Most of the answers, he says, surprised him. The customers who said yes outnumbered those who said no by about four to one. Many of them said that the constraint sounded almost like a relief.\n\nHenrik did not act on the idea immediately. For about three years, he watched his customers' actual purchasing behaviour, and he found something he had not expected. About twelve per cent of his customers bought more than half of all the books he sold. Most of the rest visited the shop only as a kind of pleasant browsing space. They might leave with a notebook or a postcard, but rarely with a book.\n\nThis second observation, more than the first, changed the way Henrik thought about his shop. The browsers, he realised, were not failing to buy books because the books were the wrong ones. They were failing to buy because there were too many. A wall of seven thousand spines was, to a person who had not yet decided what kind of book to buy, very nearly invisible. Reducing the stock might, in theory, increase the rate at which his casual visitors actually purchased something.\n\nThe harder question, however, was which books to remove. Henrik admits that his first attempts at this were almost paralysing. He created spreadsheets, he rang publishers, he asked friends, and he abandoned the project twice in eighteen months. The eventual solution was almost embarrassingly simple. He decided to keep only the books he himself had finished and could honestly say that he would re-read at some point in his life. Anything else, however excellent, was sent back. He calls this his \"second-shelf rule\" — the idea being that a book he would not place on the shelf above his own bed had no place in the shop he was personally responsible for.\n\nThe economic results, against all his fears, have been surprisingly stable. Henrik turns over about the same money as he did when he kept five times as many books, and the average shop visit, by his own measurement, now lasts almost twice as long. Customers come not in spite of the small selection, but partly because of it. Several have told him that the shop has begun to function for them as a kind of recommendation service, in which a missing book is taken as an honest signal that the bookseller did not, on balance, find it worth keeping.\n\nHe has, he admits, made some mistakes. He removed a translated poet two years ago whom he has since come to admire, and now keeps a cheap copy on a small shelf behind the till as a private reminder. He also concedes that the model would be very difficult to imitate at a larger scale. \"I have one shop and I read four books a week,\" he says. \"I am not running an algorithm.\"\n\nFor Henrik, however, the deeper change has been less about the books and more about the conversations the shop now produces. Customers, knowing that the small stock has been chosen rather than accepted, ask much more interesting questions. \"When you walk into a shop with seven thousand books,\" he says, \"you can pretend the books chose themselves. When there are nine hundred, somebody had to choose. And usually that's the beginning of a real conversation.\"",
        questions: [
          {
            id: 31,
            prompt: "What does the writer say about Henrik's attitude to his stock when he opened the shop?",
            options: [
              { letter: "A", text: "He felt that his collection was unusually well chosen for a small shop." },
              { letter: "B", text: "He was slightly self-conscious about how limited it was." },
              { letter: "C", text: "He intended to expand it as quickly as he could afford to." },
              { letter: "D", text: "He saw it as a temporary stock until his savings increased." }
            ],
            correct: "B"
          },
          {
            id: 32,
            prompt: "Henrik says that the customers' answers to his \"six-book\" question:",
            options: [
              { letter: "A", text: "reflected a wide range of attitudes that he had broadly expected." },
              { letter: "B", text: "showed that most of them strongly resisted the idea of restriction." },
              { letter: "C", text: "leaned towards welcoming the idea more often than not." },
              { letter: "D", text: "suggested that they would spend more money under such a system." }
            ],
            correct: "C"
          },
          {
            id: 33,
            prompt: "What did Henrik observe during his three years of watching his customers?",
            options: [
              { letter: "A", text: "A small group of customers were responsible for most book sales." },
              { letter: "B", text: "Customers were leaving the shop disappointed by the selection." },
              { letter: "C", text: "The same books were being purchased again and again." },
              { letter: "D", text: "Sales were dropping sharply for newly published titles." }
            ],
            correct: "A"
          },
          {
            id: 34,
            prompt: "According to the fourth paragraph, why were many of Henrik's casual visitors not buying books?",
            options: [
              { letter: "A", text: "The books on offer were not the kinds they were interested in." },
              { letter: "B", text: "The shop's location was inconvenient for purchases." },
              { letter: "C", text: "The size of the selection prevented them from making a choice." },
              { letter: "D", text: "The pricing was higher than at competitor shops." }
            ],
            correct: "C"
          },
          {
            id: 35,
            prompt: "What is the main idea behind Henrik's \"second-shelf rule\"?",
            options: [
              { letter: "A", text: "Only books he would willingly re-read deserve a place in the shop." },
              { letter: "B", text: "A book must have appeared on a major bestseller list." },
              { letter: "C", text: "Each book must have a personal recommendation from a friend." },
              { letter: "D", text: "The book must have been recently translated into Dutch." }
            ],
            correct: "A"
          },
          {
            id: 36,
            prompt: "What does Henrik suggest is the main change in the way customers now talk to him?",
            options: [
              { letter: "A", text: "They ask shorter, more practical questions about specific titles." },
              { letter: "B", text: "They are mainly interested in his personal reading recommendations." },
              { letter: "C", text: "They engage in more substantial conversations about choice itself." },
              { letter: "D", text: "They more frequently complain about the limited selection." }
            ],
            correct: "C"
          }
        ]
      },

      // ───────── PART 6 (Q37-43) — gapped text (7 paragraphs removed, 8 options A-H) ─────────
      {
        partNumber: 6,
        type: "gapped-text",
        instruction: "You are going to read an article in which a writer reflects on learning her grandmother's first language. Seven paragraphs have been removed from the article. Choose from the paragraphs A–H the one which fits each gap (37–43). There is one extra paragraph which you do not need to use.",
        title: "Learning my grandmother's language",
        text:
          "When my grandmother died seven years ago, in her late nineties, I realised — much too late — that there had been a whole half of her life I had never been able to enter. She had spoken three languages in different parts of her childhood, and the one she retained most affectionately, until her final months, was a small regional language from the Hungarian-Romanian border that perhaps eighty thousand people in the world still use. I had grown up calling her by a name from that language. Beyond that, I knew almost nothing.\n\n___1___\n\nThe decision to do something about this came, predictably, on a flight. I had taken a job that involved a great deal of long-haul travel, and on a flight from Frankfurt to Singapore I happened to be sitting beside a young researcher who studied minority languages. We talked for the entire journey, and by the time we landed, I had agreed to begin lessons. My teacher, she said, would be a retired primary-school teacher in a town of about six hundred people, who would charge me almost nothing because she was bored.\n\n___2___\n\nThe lessons began on Sundays, on a slow internet connection, with my teacher reading me children's stories from a book that had been printed in 1958. For the first three months, I did not understand a single word. My teacher, however, was wonderfully patient, and what I had thought would be a dry exercise in vocabulary turned almost immediately into something else. We would spend forty-five minutes on a story; she would then spend a further hour telling me what the story had reminded her of from her own life.\n\n___3___\n\nAfter about a year, I began to understand more than I had expected. Whole phrases of my grandmother's came back to me, attached now to meanings I had only guessed at as a child. I remembered her sometimes muttering a particular word, almost angrily, when she was peeling potatoes; it turned out to mean \"the small piece of skin that you can never quite remove\". I had heard her say it for forty years and never thought to ask.\n\n___4___\n\nThere were also more difficult discoveries. The language has a particular form of past tense that is used only when speaking of people now dead, which means that my grandmother, in much of what she had told me about her own grandmother, had been quietly using a grammar I had never heard her use about anyone else. I understood, suddenly, why her stories about her childhood had always felt unusually grave, even when their content was quite ordinary.\n\n___5___\n\nI cannot pretend that I have become fluent. After six years of one weekly lesson, I can read children's stories, follow most adult conversations if they are slow, and produce my own halting sentences on a small range of subjects. My teacher tells me, with characteristic honesty, that I am at about the level of a careful eight-year-old. I am, on most days, content with this.\n\n___6___\n\nWhat has changed more than my actual ability with the language, however, is my relationship to my own memories. There are now small pockets of my grandmother's life that I can re-enter, in a way that was not previously possible. I sometimes find that a story she once told me, which I half-remembered and had assumed I had distorted in the retelling, was in fact accurate; I had simply heard it through a foreign ear, and parts of it had refused to settle.\n\n___7___\n\nI am writing this, I should say, on the first anniversary of my teacher's retirement. She has handed me on, at her insistence, to her granddaughter, who is twenty-six and works as a journalist. My grandmother would, I think, find this funny. The language, like a great deal of what she taught me, has turned out to be something one is given, briefly, by particular people, and obliged in time to pass on.",
        // 8 options A-H; 7 are correct (one per gap), 1 is a distractor
        options: [
          { letter: "A", text: "There is also, I think, a wider point about minority languages, although I am now uneasy about making it on behalf of speakers I am only beginning to know." },
          { letter: "B", text: "I was, frankly, ashamed of how easy it had been not to ask. While she was alive, the language had felt like an exotic accessory of her old age, not a possible subject of conversation." },
          { letter: "C", text: "The agreement turned out to be very strange. I would speak to her on the phone every Sunday for an hour, twice my own working hour, and I would pay her in a small monthly transfer." },
          { letter: "D", text: "Slowly, in this way, I was learning two things at once: a few hundred new words, and a way of treating language as a kind of human exchange that I had completely forgotten." },
          { letter: "E", text: "I do not quite have the words for what was painful in this small grammatical observation, but I think it has something to do with the fact that I had heard the form before and assumed it was a regional accent." },
          { letter: "F", text: "None of this is a good reason, in my view, to continue lessons." },
          { letter: "G", text: "I had also forgotten the particular kind of silence I had once been around as a child — a silence that was, I now understand, mostly composed of two people not sharing a language." },
          { letter: "H", text: "By the time I began my lessons, the small town had been almost entirely abandoned by younger speakers, and my teacher was one of fewer than thirty fluent speakers under sixty in the whole region." }
        ],
        gaps: [
          { id: 37, correct: "B" },
          { id: 38, correct: "C" },
          { id: 39, correct: "D" },
          { id: 40, correct: "G" },
          { id: 41, correct: "E" },
          { id: 42, correct: "A" },
          { id: 43, correct: "H" }
        ]
      },

      // ───────── PART 7 (Q44-53) — multiple matching (10 Q to 4 sections A-D) ─────────
      {
        partNumber: 7,
        type: "multiple-matching",
        instruction: "You are going to read four short articles in which people describe a place they keep returning to. For questions 44–53, choose from the people (A–D). The people may be chosen more than once.",
        topic: "Four people describe a place they keep returning to",
        sections: [
          {
            letter: "A",
            title: "Hannah Lim (44) — travel writer; a small fishing village in Croatia",
            body: "I have been to Komiža, on the small Croatian island of Vis, eleven times in the last twenty years. The first time was for work, the second was a small holiday, and the others have been for no clear reason that I can put into words. The village is almost laughably ordinary: a single harbour, three cafés, a small church, an indifferent beach. Most of the people who visit Vis go to the larger town fifteen kilometres north, which has a famous cave and good restaurants. I have never been to that town. Komiža is the place I go when, for reasons that I usually cannot identify, my own life has begun to feel slightly thin. I sit in the same café in the morning, take the same walk along the harbour wall in the evening, and within about three days I can feel the small, helpful click of returning to my own size. I once tried to recommend the place in a magazine article. Almost nobody who has read it has gone."
          },
          {
            letter: "B",
            title: "Daniel Reyes (51) — architect; a parish church in central Portugal",
            body: "It is a parish church of no particular architectural distinction in a village of perhaps six hundred people, in the central uplands of Portugal. I have visited it, by my own count, almost forty times. I do not, anymore, think this is a religious habit, although it began as one when I was twenty-two. What draws me back, I think, is the building's almost perfect ordinariness. The walls are a particular kind of yellow plaster that nobody now uses; the floor has been worn smooth in two narrow paths by the feet of the same families for two hundred years; the small windows let in a quality of light that I have not seen in any other building. I am, for my profession, almost wilfully unsentimental about heritage architecture. But this church reminds me, every time, of why I trained as an architect at all."
          },
          {
            letter: "C",
            title: "Mariam El-Khalil (38) — former diplomat; her grandmother's house in northern Lebanon",
            body: "My grandmother's house, where I now spend three weeks every August, has been continuously inhabited by my family for nine generations. My grandmother died last year, and my elderly aunt, who lives there for most of the year, has begun to ask me when I will move in permanently. I will not. I lived in twelve cities during my career as a diplomat, and the experience of belonging to none of them has shaped, more than I ever quite admit to friends, what I want my life to be. The house is the place I go to repair myself. It is also the place I refuse to live in. The conversations I have on the long shaded balcony with my aunt, who reads three newspapers a day and disagrees with all of them, are the most useful conversations of my year. I cannot have them anywhere else. I cannot have them all the time."
          },
          {
            letter: "D",
            title: "Tomás Veiga (60) — retired chemistry teacher; an old-growth forest in northern Spain",
            body: "There is a forest about two hundred kilometres from where I live, on a hillside in the Asturian mountains, which I have walked through every September for thirty-one years. I started going there in the year I lost a brother. The first few visits were obviously about grief; the later ones, I now realise, were about something more practical. The trees in this forest have not been cut in at least three centuries. There are several oak trees that pre-date the discovery of the Americas. The simple fact of standing among them does something useful to a sense of one's own importance. I am sixty now, and most of the small problems I would once have brought to the forest no longer make the journey with me; my children's marriages, my late father's debts, my own mistaken decisions of the early nineteen-eighties, have all been left somewhere among those trees. I cannot point to where."
          }
        ],
        questions: [
          { id: 44, prompt: "Whose return-place is connected to a personal loss?",                                                                                       correct: "D" },
          { id: 45, prompt: "Who admits that the appeal of the place is connected to its complete unimportance to other visitors?",                                       correct: "A" },
          { id: 46, prompt: "Who explicitly states that they could not actually live full-time in the place they return to?",                                              correct: "C" },
          { id: 47, prompt: "Who describes a place that, given their professional preferences, would not normally interest them?",                                          correct: "B" },
          { id: 48, prompt: "Who has tried to share their place with others through their writing, with little effect?",                                                    correct: "A" },
          { id: 49, prompt: "Whose returns are most clearly connected to family relationships?",                                                                            correct: "C" },
          { id: 50, prompt: "Who reports that the things they used to think about during their visits no longer trouble them?",                                              correct: "D" },
          { id: 51, prompt: "Whose visits have shifted, over time, from being about personal sadness to being about a more general kind of perspective?",                    correct: "D" },
          { id: 52, prompt: "Who describes an unusual quality of light or material that the place possesses?",                                                              correct: "B" },
          { id: 53, prompt: "Who relies on conversations with another particular person as the centre of their visits?",                                                    correct: "C" }
        ]
      }
    ]
  },

  writing: {
    parts: [

      // ───────── WRITING PART 1 (Q54) — compulsory summary essay (240-280 words) ─────────
      {
        partNumber: 8,
        writingPartNumber: 1,
        type: "summary-essay",
        taskType: "Essay",
        instruction: "Read the two texts below. Write an essay summarising and evaluating the key points from BOTH texts. Use your own words throughout as far as possible, and include your own ideas in your answer.",
        inputTexts: [
          {
            id: 1,
            title: "Text 1 — The case for honesty",
            body: "Children are remarkably good at sensing when adults are hiding something, and the discovery that they have been lied to, even with good intentions, often does more long-term damage than the difficult truth itself. Modern child psychologists are nearly unanimous in their view that children of every age can be told the truth about death, illness, divorce and money, provided that the truth is delivered patiently and at a level the child can actually process. The right of a child to information about his or her own life is, increasingly, regarded as fundamental."
          },
          {
            id: 2,
            title: "Text 2 — The case for kind silence",
            body: "Children are not small adults. The fashion for telling the youngest among us 'the whole truth' often ignores the simple fact that a four-year-old does not have the cognitive equipment to handle adult anxieties about money, illness or family conflict. Adults exist, in part, to filter the world for children until those children are equipped to filter it themselves. The very small white lies of childhood — that the dog has gone to a farm, that money is not really a worry — are not failures of honesty; they are the ordinary work of being a parent."
          }
        ],
        taskPrompt: "Write your answer in 240–280 words.",
        wordMin: 240,
        wordMax: 280,
        scoringRubric:
          "Award full marks if the candidate clearly summarises the key points from BOTH input texts in their own words, evaluates each text's argument (rather than merely paraphrasing it), integrates a clear personal opinion or original idea, uses C2-appropriate vocabulary and a wide range of grammatical structures (complex linkers, hedging, passive forms, nominalisations), maintains an appropriate semi-formal essay register, and writes 240–280 words. Penalise off-topic content, missing one of the texts, copying phrases verbatim from the inputs, fewer than 240 words, or a register that is too informal."
      },

      // ───────── WRITING PART 2 (Q55) — choose 1 of 3 (280-320 words) ─────────
      {
        partNumber: 9,
        writingPartNumber: 2,
        type: "choice-of-three",
        instruction: "Write an answer to ONE of the questions 2–4 in this part. Write your answer in 280–320 words in an appropriate style.",
        choices: [
          {
            id: "email",
            taskType: "Email",
            heading: "Question 2 — Email",
            prompt:
              "You are a member of an international book club. The club organiser has emailed all members asking for suggestions on how to encourage discussion at the monthly meetings, where attendance has recently declined. Write an email to the organiser describing what you think the main reasons for the decline are, suggesting two or three changes that could be tried, and explaining which change you think would be most effective.\n\nWrite your email."
          },
          {
            id: "report",
            taskType: "Report",
            heading: "Question 3 — Report",
            prompt:
              "You are studying at an international university. The student union has asked you to write a report on the food currently served in the university canteen. Your report should describe how the canteen is currently used by students, identify the main problems with the food and service, and recommend specific changes that you believe would improve students' satisfaction.\n\nWrite your report."
          },
          {
            id: "proposal",
            taskType: "Proposal",
            heading: "Question 4 — Proposal",
            prompt:
              "You belong to a local environmental group. The town council has invited the group to submit a proposal for the use of a small piece of unused public land in the town centre. Your proposal should suggest how the land should be used, explain what benefits this would bring to local residents, and outline how the project could be funded and maintained over the long term.\n\nWrite your proposal."
          }
        ],
        wordMin: 280,
        wordMax: 320,
        scoringRubric:
          "Award full marks if the candidate has chosen ONE option, fully matched its expected register and conventions (email: appropriate greeting/closing + answers to all elements; report: clear sections with signposting + analysis + concrete recommendations; proposal: persuasive tone + concrete plan + funding/feasibility), used C2-appropriate vocabulary, demonstrated a wide and confident range of grammatical structures (including inversion, advanced passives, hypotheticals), and written 280–320 words. Penalise off-topic content, mixing tasks, wrong register, or fewer than 280 words."
      }
    ]
  }
};
