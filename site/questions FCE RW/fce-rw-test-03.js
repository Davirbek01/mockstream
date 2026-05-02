// FCE (B2 First) Reading, Use of English & Writing — Mock 03
// Post-2015 Cambridge format: 155 min combined paper
//   Reading & Use of English: 75 min, 7 parts, 52 questions
//   Writing: 80 min, 2 tasks, 140-190 words each
// All content is original AI-authored material (Mock Stream).

window.FCE_RW_TEST = {
  testInfo: {
    id: "fce-rw-03",
    title: "FCE Reading, Use of English & Writing Mock 03",
    level: "B2",
    totalTime: 155,
    totalQuestions: 54,
    readingQuestions: 52,
    writingTasks: 2
  },

  reading: {
    parts: [

      // ───────── PART 1 (Q1-8) — multiple-choice cloze (4 options) ─────────
      {
        partNumber: 1,
        type: "cloze-mcq",
        instruction: "For questions 1–8, read the text below and decide which answer (A, B, C or D) best fits each gap.",
        title: "The science of first impressions",
        text:
          "Most of us like to think that we judge other people slowly and ___1___, on the basis of what they actually say and do. ___2___ recent research suggests that this is not quite how the human brain works. We make our most lasting judgements within the first two or three seconds of meeting somebody, and we then spend the rest of the conversation looking, often unconsciously, ___3___ evidence that supports those original impressions.\n\nThis may sound rather depressing, but it is not, in fact, all bad news. The same studies show that people are surprisingly ___4___ at making quick decisions about whether someone is friendly, competent, or honest. The human brain seems to be very well ___5___ to picking up small signals — a slight smile, a particular way of standing — and combining them into a quick first picture. The trouble comes ___6___ when these first pictures are wrong, because they are then surprisingly difficult to change.\n\nMost experts agree that the best way to ___7___ this is not to pretend that first impressions don't exist, but to be aware of when we are forming one. Catching ourselves in the act of judging too quickly may be the only ___8___ defence we have against the small, hidden mistakes our own minds make.",
        gaps: [
          { id: 1, options: [{letter:"A",text:"carefully"},{letter:"B",text:"actually"},{letter:"C",text:"slowly"},{letter:"D",text:"finally"}], correct: "A" },
          { id: 2, options: [{letter:"A",text:"But"},{letter:"B",text:"Although"},{letter:"C",text:"However"},{letter:"D",text:"Despite"}], correct: "C" },
          { id: 3, options: [{letter:"A",text:"for"},{letter:"B",text:"on"},{letter:"C",text:"at"},{letter:"D",text:"with"}], correct: "A" },
          { id: 4, options: [{letter:"A",text:"careful"},{letter:"B",text:"good"},{letter:"C",text:"certain"},{letter:"D",text:"fair"}], correct: "B" },
          { id: 5, options: [{letter:"A",text:"suited"},{letter:"B",text:"made"},{letter:"C",text:"prepared"},{letter:"D",text:"born"}], correct: "A" },
          { id: 6, options: [{letter:"A",text:"closely"},{letter:"B",text:"however"},{letter:"C",text:"only"},{letter:"D",text:"wrongly"}], correct: "C" },
          { id: 7, options: [{letter:"A",text:"hold"},{letter:"B",text:"drag"},{letter:"C",text:"avoid"},{letter:"D",text:"approach"}], correct: "D" },
          { id: 8, options: [{letter:"A",text:"safe"},{letter:"B",text:"real"},{letter:"C",text:"right"},{letter:"D",text:"clear"}], correct: "B" }
        ]
      },

      // ───────── PART 2 (Q9-16) — open cloze (1 word per gap) ─────────
      {
        partNumber: 2,
        type: "cloze-open",
        instruction: "For questions 9–16, read the text below and think of the word which best fits each gap. Use only ONE word in each gap.",
        title: "How a tiny restaurant became world-famous",
        text:
          "In a small fishing village ___1___ the south of Spain, there is a restaurant that holds only twelve seats. The waiting list ___2___ a table, however, is currently more than two years long. People fly there from every continent, almost ___3___ exception, and many of them describe the meal afterwards ___4___ one of the most memorable they have ever had.\n\nThe restaurant has no menu. Each evening, the chef ___5___, who is a local fisherman by training, simply cooks whatever has been brought in by the village's small fishing boats earlier the same day. ___6___ a result, the meal is different every night, and there is no way of knowing in advance what one will be served.\n\n___7___ the chef started the restaurant nineteen years ago, he had no business plan and no formal training. He has, since then, refused to expand the restaurant, ___8___ the offers from larger restaurant groups have been very generous indeed.",
        gaps: [
          { id: 9,  accept: ["in"] },
          { id: 10, accept: ["for"] },
          { id: 11, accept: ["without"] },
          { id: 12, accept: ["as"] },
          { id: 13, accept: ["himself"] },
          { id: 14, accept: ["As"] },
          { id: 15, accept: ["When"] },
          { id: 16, accept: ["although","though"] }
        ]
      },

      // ───────── PART 3 (Q17-24) — word formation ─────────
      {
        partNumber: 3,
        type: "word-formation",
        instruction: "For questions 17–24, read the text below. Use the word given in capitals at the end of some of the lines to form a word that fits in the gap in the same line.",
        title: "How forests help our health",
        text:
          "Most of us know that forests are good for the planet, but recent research suggests they are also good for our personal ___1___.\n\nA surprisingly small amount of time spent walking among trees can produce ___2___ improvements in mood, blood pressure and even immune function.\n\nIn Japan, the practice has been given an official name — shinrin-yoku, or 'forest bathing' — and is increasingly recommended by ___3___ to patients suffering from stress.\n\nA growing number of European countries have begun to follow this example. ___4___, in some cases, doctors are now allowed to prescribe time in a forest in the same way that they once prescribed only medicine.\n\nThe reasons behind these benefits are still not fully ___5___, although several studies suggest that certain chemicals released by living trees, called phytoncides, play an important role.\n\nWhat seems clear, however, is that the ___6___ of forest visits go far beyond simple physical exercise.\n\nEven short, regular walks among trees have been shown to reduce ___7___ of depression, anxiety and chronic pain.\n\nWhether the world's forests will be ___8___ enough in fifty years' time to provide these benefits at the same scale, however, is a separate and far more troubling question.",
        gaps: [
          { id: 17, root: "HEALTHY",     accept: ["health"] },
          { id: 18, root: "MEASURE",     accept: ["measurable"] },
          { id: 19, root: "DOCTOR",      accept: ["doctors"] },
          { id: 20, root: "REMARK",      accept: ["Remarkably","remarkably"] },
          { id: 21, root: "UNDERSTAND",  accept: ["understood"] },
          { id: 22, root: "BENEFIT",     accept: ["benefits"] },
          { id: 23, root: "SYMPTOM",     accept: ["symptoms"] },
          { id: 24, root: "ABUNDANCE",   accept: ["abundant"] }
        ]
      },

      // ───────── PART 4 (Q25-30) — key word transformation (2-5 words) ─────────
      {
        partNumber: 4,
        type: "key-word-transformation",
        wordRange: "2–5",
        instruction: "For questions 25–30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do NOT change the word given. You must use between TWO and FIVE words, including the word given.",
        items: [
          {
            id: 25,
            original: "It's not a good idea to drive when you're very tired.",
            keyWord: "AVOID",
            gapped: "You should ___ when you're very tired.",
            accept: ["avoid driving"]
          },
          {
            id: 26,
            original: "They are repairing my computer at the moment.",
            keyWord: "BEING",
            gapped: "My computer ___ the moment.",
            accept: ["is being repaired at","'s being repaired at"]
          },
          {
            id: 27,
            original: "I think you should phone the doctor immediately.",
            keyWord: "WERE",
            gapped: "If I ___ phone the doctor immediately.",
            accept: ["were you, I would","were you, I'd"]
          },
          {
            id: 28,
            original: "Sara hadn't visited London before last summer.",
            keyWord: "TIME",
            gapped: "Last summer was the first ___ to London.",
            accept: ["time Sara had been"]
          },
          {
            id: 29,
            original: "Although it was raining hard, we went for a walk.",
            keyWord: "SPITE",
            gapped: "We went for a walk ___ raining hard.",
            accept: ["in spite of it","in spite of its"]
          },
          {
            id: 30,
            original: "If you don't ask politely, she won't help you.",
            keyWord: "UNLESS",
            gapped: "She won't help you ___ politely.",
            accept: ["unless you ask"]
          }
        ]
      },

      // ───────── PART 5 (Q31-36) — long-text MCQ (4 options A-D) ─────────
      {
        partNumber: 5,
        type: "long-text-mcq",
        instruction: "You are going to read a magazine article about a chef who teaches teenagers in his restaurant. For questions 31–36, choose the answer (A, B, C or D) which you think fits best according to the text.",
        title: "The chef who shares his kitchen",
        passage:
          "When 41-year-old Daniel Webb opened his small restaurant, The Glass Lantern, in a quiet street in Bristol seven years ago, his wife Elena warned him that running a restaurant by themselves would leave them with very little time for anything else. She was, by Daniel's own admission, almost entirely right. Their first three years were so busy that they barely saw their own children awake during the week. Yet Daniel has, more recently, made an unusual decision: every Sunday afternoon, his restaurant is closed to customers, and instead he opens the kitchen — for free — to seven local teenagers who want to learn to cook.\n\nThe idea began, Daniel says, almost by accident. About two years ago, the daughter of one of his regular customers came in for a milkshake on a quiet afternoon. While Daniel was preparing it, she watched him through the kitchen window, asked a few unusually intelligent questions, and admitted that she had been trying for nearly six months to make a particular kind of bread at home, with very poor results. Daniel offered, without thinking too much about it, to show her how he made his own version. By the end of that single Sunday, she had baked two loaves and was, to Daniel's surprise, extremely good with her hands.\n\nWord of this short visit got around the neighbourhood, and within a few weeks, Daniel had four other teenagers asking if they could come too. Rather than let it become an unmanageable crowd, he decided to formalise the arrangement. Each Sunday, between two and five in the afternoon, he now teaches a small group of six or seven students aged thirteen to seventeen. There is no charge. The students bring their own ingredients, although Daniel often shares more expensive items from the restaurant's own stock. Each student leaves at the end of the afternoon with whatever they have made.\n\nThe arrangement is not entirely without its difficulties. Daniel admits that he has had to refuse to take on certain students whose parents seemed mainly interested in finding cheap childcare for the afternoon. He has also, on at least two occasions, had to send students home when they refused to follow the basic rules of kitchen safety. But, on the whole, he says, the Sundays have been the most professionally rewarding part of his week. He is, in particular, struck by how often students develop confidence in unrelated areas of their lives once they realise that they can make a complicated meal for their family.\n\nDaniel does not believe that what he does is unusual or admirable. \"Plenty of restaurants are closed on Sundays anyway,\" he says. \"I'm just not throwing the kitchen away during those hours.\" Asked whether he hopes that any of his students will become professional chefs, he is quite firm. \"I genuinely don't mind. Most of them won't. The point is not to produce more chefs. The point is that, by the time they are eighteen, they don't think of cooking as something other, more competent people do.\"\n\nHis wife Elena, who was so worried about the time pressure of the original restaurant, has become one of his quiet supporters of the Sunday afternoons. She describes coming downstairs around three o'clock and finding the kitchen full of focused teenagers, with Daniel walking between them, saying surprisingly little. \"He's calmer on Sundays than he is at any other time of the week,\" she says. \"I think he likes the fact that, for once, nobody is paying him.\"",
        questions: [
          {
            id: 31,
            prompt: "What was Daniel's wife's view when he first opened the restaurant?",
            options: [
              { letter: "A", text: "She thought it would be more profitable than they expected." },
              { letter: "B", text: "She believed it would take up nearly all of their available time." },
              { letter: "C", text: "She was confident that the restaurant would do well from the start." },
              { letter: "D", text: "She suggested that they should hire extra staff immediately." }
            ],
            correct: "B"
          },
          {
            id: 32,
            prompt: "How did Daniel's Sunday teaching first start?",
            options: [
              { letter: "A", text: "It was a deliberate plan he had been considering for years." },
              { letter: "B", text: "The local council had asked him to teach young people in his area." },
              { letter: "C", text: "He spontaneously offered to help one teenager who was struggling." },
              { letter: "D", text: "He noticed that his own children needed cooking lessons at home." }
            ],
            correct: "C"
          },
          {
            id: 33,
            prompt: "Why did Daniel decide to limit the Sunday sessions to a small group?",
            options: [
              { letter: "A", text: "He was concerned about not being able to manage too many students at once." },
              { letter: "B", text: "His kitchen was physically too small to fit a larger number of people." },
              { letter: "C", text: "Local fire regulations required him to limit the size of the group." },
              { letter: "D", text: "He wanted to be able to charge a higher fee for personal teaching." }
            ],
            correct: "A"
          },
          {
            id: 34,
            prompt: "What problem has Daniel sometimes encountered with the students' parents?",
            options: [
              { letter: "A", text: "Some have complained about his teaching style and methods." },
              { letter: "B", text: "Some have demanded that their children become professional chefs later." },
              { letter: "C", text: "Some appear to use the sessions mainly as cheap childcare for the afternoon." },
              { letter: "D", text: "Some have asked Daniel to use cheaper ingredients for his classes." }
            ],
            correct: "C"
          },
          {
            id: 35,
            prompt: "According to Daniel, what is the main benefit for the students of his Sunday classes?",
            options: [
              { letter: "A", text: "They become more skilled cooks than most of their friends." },
              { letter: "B", text: "They develop a wider sense of confidence beyond cooking itself." },
              { letter: "C", text: "They are able to apply for chef apprenticeships afterwards." },
              { letter: "D", text: "They learn how to use professional kitchen equipment safely." }
            ],
            correct: "B"
          },
          {
            id: 36,
            prompt: "What does Elena say about Daniel on Sundays?",
            options: [
              { letter: "A", text: "He is unusually relaxed during the teaching sessions." },
              { letter: "B", text: "He talks much more during the lessons than in the restaurant." },
              { letter: "C", text: "He worries about the cost of letting students use ingredients." },
              { letter: "D", text: "He sometimes loses patience with his younger students." }
            ],
            correct: "A"
          }
        ]
      },

      // ───────── PART 6 (Q37-42) — gapped text (6 sentences removed, 7 options A-G) ─────────
      {
        partNumber: 6,
        type: "gapped-text",
        instruction: "You are going to read an article in which a writer describes how she returned to writing letters by hand. Six sentences have been removed from the article. Choose from the sentences A–G the one which fits each gap (37–42). There is one extra sentence which you do not need to use.",
        title: "How handwritten letters changed my friendships",
        text:
          "For nearly fifteen years, I had not written a single letter by hand. The closest I had come was filling in a card for a friend's wedding, and even then I had written only my name and a single short sentence. Like most people my age, I assumed that letter-writing was a slightly old-fashioned activity, and that texts and emails were perfectly adequate replacements.\n\n___1___\n\nThe change came, oddly, after a difficult conversation with my mother. She had been keeping, for nearly fifty years, a small box of letters from her own mother — my grandmother — and one Sunday afternoon, with no special reason, she showed them to me. We read them together for almost three hours. Many were ordinary; some were affectionate; one or two were very moving.\n\n___2___\n\nWhen I went home that evening, I bought, almost on impulse, a small pad of decent writing paper and a pen that was probably more expensive than was sensible. The next morning, before work, I wrote a short letter to my sister, who lives in a different city and whom I had been meaning to call for several weeks. It took me almost forty minutes. I had forgotten how slowly handwriting really was, and how much more carefully one chooses what to say.\n\n___3___\n\nTo my surprise, my sister wrote back within the week. Her letter was short — she had two small children and limited time — but it ended with a small drawing of a flower, which her older child had added. I have kept it on my desk ever since. Within a month, I was writing two or three letters a week.\n\n___4___\n\nThe letters that came back were, almost without exception, longer and more thoughtful than the texts I had been receiving from the same people for years. One old friend, whom I had known since university, ended up sending me a four-page letter about a difficult decision he was facing at work. He told me, when we met later, that he had not realised until he was halfway through writing how much he wanted to talk about it.\n\n___5___\n\nI do not, of course, believe that everybody should give up the rest of digital communication. The point is not to be old-fashioned for its own sake. It is, rather, that handwriting forces a particular kind of attention — to the person you are writing to, to your own sentences, and to the rhythm of conversation that messaging seems to have flattened.\n\n___6___\n\nI no longer write to all of my friends in this way; for most communications, a quick message remains the only sensible choice. But for the friendships that matter most to me, the handwritten letter has become my preferred form of contact. I write fewer letters than I send messages, but I notice, with surprise, that I now think more carefully about everyone I write to.",
        // 7 options A-G; 6 are correct (one per gap), 1 is a distractor
        options: [
          { letter: "A", text: "The pen, in particular, was a small revelation; I had not realised that the simple feel of writing could, in itself, slow down my thinking in a way I welcomed." },
          { letter: "B", text: "The next time I came home for the weekend, my mother insisted on giving me the entire box, and we spent the afternoon reading the rest of them." },
          { letter: "C", text: "I was struck, more than anything, by the way each writer seemed to have prepared what they were saying before sitting down to write." },
          { letter: "D", text: "I started to notice, however, that my friends were responding differently from how they responded to my texts." },
          { letter: "E", text: "I understood, that afternoon, that none of these letters could have been sent as a text." },
          { letter: "F", text: "There is a real risk, of course, of becoming sentimental about this kind of habit." },
          { letter: "G", text: "Yet over the past two years, I have written more than fifty letters by hand." }
        ],
        gaps: [
          { id: 37, correct: "G" },
          { id: 38, correct: "E" },
          { id: 39, correct: "A" },
          { id: 40, correct: "D" },
          { id: 41, correct: "C" },
          { id: 42, correct: "F" }
        ]
      },

      // ───────── PART 7 (Q43-52) — multiple matching (10 Q to 4 sections A-D) ─────────
      {
        partNumber: 7,
        type: "multiple-matching",
        instruction: "You are going to read four short articles in which adults describe a book that changed something in their lives. For questions 43–52, choose from the readers (A–D). The readers may be chosen more than once.",
        topic: "Four readers describe a book that changed something in their lives",
        sections: [
          {
            letter: "A",
            title: "Sarah (47) — accountant; a book about urban gardens",
            body: "For most of my adult life I had treated reading as a kind of pleasant background activity — something I did on holiday but rarely otherwise. The book that changed this was a small history of urban gardens that a colleague gave me as a leaving gift when she retired. I had no particular interest in gardening at the time, and I read the first chapter mostly out of politeness. By the third chapter I was making notes in the margin, which I had not done since university. The book did not just teach me about gardening; it reminded me that I had spent twenty years reading nothing more demanding than weekend newspapers. I am not, even now, a particularly skilled gardener — my flat has only a small balcony — but I am, for the first time in a long time, a real reader."
          },
          {
            letter: "B",
            title: "Marcus (29) — teacher; a Korean novel about a remote village",
            body: "I first picked up a small Korean novel about a man who walks back to the village he grew up in, on a day when I was extremely tired and had been planning to do something more entertaining. The novel turned out to be much harder than I had expected, and for the first sixty pages I thought I would not finish it. When I did, I went back and read it again, taking nearly twice as long the second time. The book did not change my life in any practical way — I am still a teacher, still living in the same city. What it changed was how patient I am with quiet things. Books, paintings, conversations: I now give them all far more time than I used to. I think this small book may have made me a better friend."
          },
          {
            letter: "C",
            title: "Petra (34) — software engineer; a book about silence",
            body: "I had a difficult year at thirty: a long illness, a relationship that ended badly, and a job that I had begun to find pointless. A friend recommended a book about silence — a slightly strange title for a person who, like me, was already feeling overwhelmed. The book was not exactly what I had expected. It was not a meditation guide or a self-help book. It was, in fact, a long argument that the modern world has lost its capacity to wait, and that this loss is the real source of much of our unhappiness. I read it slowly, over about three months. By the end, I had handed in my resignation, taken a six-month break, and was, for the first time in years, sleeping properly. I have a different job now, and I am much less impressed by people who appear to be busy."
          },
          {
            letter: "D",
            title: "Ahmed (52) — retired postman; a wartime diary",
            body: "My mother had given me the book about ten years before I finally read it. It is the diary of a woman whose husband is away at war, written in a small fishing village in the 1940s. I had ignored it for years, partly because the cover was rather dull, partly because I assumed it would be sad. When I finally read it, I was forty-eight and had recently lost my mother. The book turned out to be much more about the slow patience of waiting than about the war itself. I cried twice while reading it, which I had not done over a book since I was a boy. It did not solve anything for me, but it gave me a quieter way of thinking about loss, and I have, since then, given a copy to almost every friend who has lost someone."
          }
        ],
        questions: [
          { id: 43, prompt: "Whose decision to read the book was prompted by a colleague's gift?",                                  correct: "A" },
          { id: 44, prompt: "Who read the book during a particularly difficult period in their life?",                              correct: "C" },
          { id: 45, prompt: "Who initially thought the book would be too sad to read?",                                              correct: "D" },
          { id: 46, prompt: "Whose decision to read the book was based on a recommendation from a close friend?",                    correct: "C" },
          { id: 47, prompt: "Who admits that they nearly gave up halfway through reading the book?",                                  correct: "B" },
          { id: 48, prompt: "Whose reading led directly to a major change in their working life?",                                    correct: "C" },
          { id: 49, prompt: "Who describes the book as having made them a better friend or relative?",                                correct: "B" },
          { id: 50, prompt: "Who passes the book on to other people who are going through difficult times?",                          correct: "D" },
          { id: 51, prompt: "Who realised through reading the book that they had largely stopped doing something they once did?",     correct: "A" },
          { id: 52, prompt: "Whose long delay before reading the book was partly caused by its appearance?",                          correct: "D" }
        ]
      }
    ]
  },

  writing: {
    parts: [

      // ───────── WRITING PART 1 (Q53) — compulsory essay (140-190 words) ─────────
      {
        partNumber: 8,
        writingPartNumber: 1,
        type: "essay",
        taskType: "Essay",
        instruction: "In your English class you have been talking about education. Now your English teacher has asked you to write an essay.\n\nWrite an essay using all the notes and giving reasons for your point of view.",
        topic: "Some people say that school students should be given more homework than they are given today. Do you agree?",
        notes: [
          "developing study skills",
          "time for hobbies and family",
          "...... (your own idea)"
        ],
        wordMin: 140,
        wordMax: 190,
        scoringRubric:
          "Award full marks if the candidate addresses all three notes (including their own idea), produces a balanced argument with a clear opinion, uses B2-appropriate vocabulary and a range of grammatical structures (linkers, modals, conditionals), maintains an appropriate semi-formal essay register, and writes 140–190 words. Penalise off-topic content, missing notes, fewer than 140 words, or inappropriate register."
      },

      // ───────── WRITING PART 2 (Q54) — choose 1 of 3 (140-190 words) ─────────
      {
        partNumber: 9,
        writingPartNumber: 2,
        type: "choice-of-three",
        instruction: "Write an answer to ONE of the questions 2–4 in this part. Write your answer in 140–190 words in an appropriate style.",
        choices: [
          {
            id: "article",
            taskType: "Article",
            heading: "Question 2 — Article",
            prompt:
              "You see this announcement in an international magazine for young people:\n\nARTICLES WANTED\n\nWhat is the best birthday gift you have ever received? Tell us what it was, who gave it to you, and explain why it was so special.\n\nThe best articles will be published in our website's monthly magazine.\n\nWrite your article."
          },
          {
            id: "email",
            taskType: "Email",
            heading: "Question 3 — Email",
            prompt:
              "You have received this email from your English-speaking friend Robin:\n\nFrom: Robin\nSubject: Help with a new school!\n\nNext month I'm starting a new school in another town. I don't know anyone there yet, and I'm a bit nervous about making new friends. Could you give me some advice based on what has worked for you in the past?\n\nThanks!\nRobin\n\nWrite your email."
          },
          {
            id: "review",
            taskType: "Review",
            heading: "Question 4 — Review",
            prompt:
              "You see this announcement on an English-language website for TV fans:\n\nREVIEWS WANTED\n\nWe are looking for reviews of TV series that you have watched recently. Briefly tell us what the series is about, comment on what made it interesting or disappointing, and explain whether you would recommend it to other young people.\n\nWrite your review."
          }
        ],
        wordMin: 140,
        wordMax: 190,
        scoringRubric:
          "Award full marks if the candidate has chosen ONE option, fully matched its expected register and conventions, used B2-appropriate vocabulary and a good range of grammatical structures, and written 140–190 words. Penalise off-topic content, mixing tasks, wrong register, or fewer than 140 words."
      }
    ]
  }
};
