// FCE (B2 First) Reading, Use of English & Writing — Mock 01
// Post-2015 Cambridge format: 155 min combined paper
//   Reading & Use of English: 75 min, 7 parts, 52 questions
//   Writing: 80 min, 2 tasks, 140-190 words each
// All content is original AI-authored material (Mock Stream).

window.FCE_RW_TEST = {
  testInfo: {
    id: "fce-rw-01",
    title: "FCE Reading, Use of English & Writing Mock 01",
    level: "B2",
    totalTime: 155,
    totalQuestions: 54,        // 52 reading items + 2 writing tasks (Q53, Q54)
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
        title: "The science behind a good night's sleep",
        text:
          "Most of us know that getting enough sleep is important, but few realise just how much the quality of our rest can affect our daily lives. According to recent ___1___ carried out at universities across Europe, even one bad night can have a ___2___ effect on our memory, mood and reaction times. People who regularly sleep less than six hours a night are also more ___3___ to develop serious health problems later in life.\n\nThe good news is that most of us can improve our sleep with a few simple changes. Experts ___4___ that we should avoid drinking coffee after lunchtime and ___5___ down on the time we spend looking at our phones in bed. Keeping the bedroom cool and dark also ___6___ a real difference. Some people even ___7___ that listening to gentle music helps them fall asleep more quickly, although there is no clear evidence that this works for everyone.\n\nIf, after trying all these things, you still find that you cannot sleep, it may be ___8___ talking to a doctor. Sleep is too important to ignore.",
        gaps: [
          { id: 1, options: [{letter:"A",text:"studies"},{letter:"B",text:"tests"},{letter:"C",text:"papers"},{letter:"D",text:"checks"}], correct: "A" },
          { id: 2, options: [{letter:"A",text:"huge"},{letter:"B",text:"major"},{letter:"C",text:"main"},{letter:"D",text:"chief"}], correct: "B" },
          { id: 3, options: [{letter:"A",text:"likely"},{letter:"B",text:"possible"},{letter:"C",text:"probable"},{letter:"D",text:"sure"}], correct: "A" },
          { id: 4, options: [{letter:"A",text:"tell"},{letter:"B",text:"say"},{letter:"C",text:"recommend"},{letter:"D",text:"propose"}], correct: "C" },
          { id: 5, options: [{letter:"A",text:"cut"},{letter:"B",text:"put"},{letter:"C",text:"get"},{letter:"D",text:"take"}], correct: "A" },
          { id: 6, options: [{letter:"A",text:"does"},{letter:"B",text:"gets"},{letter:"C",text:"makes"},{letter:"D",text:"takes"}], correct: "C" },
          { id: 7, options: [{letter:"A",text:"claim"},{letter:"B",text:"blame"},{letter:"C",text:"explain"},{letter:"D",text:"inform"}], correct: "A" },
          { id: 8, options: [{letter:"A",text:"value"},{letter:"B",text:"worth"},{letter:"C",text:"cost"},{letter:"D",text:"priced"}], correct: "B" }
        ]
      },

      // ───────── PART 2 (Q9-16) — open cloze (1 word per gap) ─────────
      {
        partNumber: 2,
        type: "cloze-open",
        instruction: "For questions 9–16, read the text below and think of the word which best fits each gap. Use only ONE word in each gap.",
        title: "Learning a musical instrument as an adult",
        text:
          "Many people think that learning a musical instrument is something you can only do ___1___ a child. ___2___, recent research suggests that adults can become surprisingly good musicians, often in ___3___ time than children. The reason is simple: adults can usually concentrate for longer periods and are more able to understand the theory ___4___ what they are doing.\n\nOf course, there are also ___5___ disadvantages. Adults tend to have busy lives and ___6___ less free time to practise than children, who are often pushed to play ___7___ their parents. Still, even thirty minutes a day, three or four times a week, is enough to make real progress.\n\nThe most important thing, perhaps, is to choose an instrument that you really enjoy — ___8___ that you can imagine yourself playing for many years to come.",
        gaps: [
          { id: 9,  accept: ["as"] },
          { id: 10, accept: ["however","nevertheless","yet"] },
          { id: 11, accept: ["less"] },
          { id: 12, accept: ["behind","of"] },
          { id: 13, accept: ["some"] },
          { id: 14, accept: ["have"] },
          { id: 15, accept: ["by"] },
          { id: 16, accept: ["one"] }
        ]
      },

      // ───────── PART 3 (Q17-24) — word formation ─────────
      {
        partNumber: 3,
        type: "word-formation",
        instruction: "For questions 17–24, read the text below. Use the word given in capitals at the end of some of the lines to form a word that fits in the gap in the same line.",
        title: "Why we love stories",
        text:
          "Humans have been telling stories for thousands of years. From the earliest cave paintings to the latest streaming series, stories help us make sense of the world and our ___1___ in it.\n\nRecent research suggests that stories are far more ___2___ than we used to believe. When we listen to a good story, the same parts of our brain become active as when we ___3___ live the events ourselves.\n\nThis is one reason why ___4___ teachers often use stories in the classroom: information presented in this way is much easier to remember.\n\nStories also help us understand other people. By following a character through ___5___ situations, we develop our ability to imagine how others might feel. Some psychologists even believe that reading fiction can make us kinder and more ___6___.\n\nOf course, not every story has to be ___7___ in some deep way. Sometimes we just want to laugh, escape from our daily problems, or experience the ___8___ of being scared in a safe environment.",
        gaps: [
          { id: 17, root: "PLACE",      accept: ["place"] },
          { id: 18, root: "POWER",      accept: ["powerful"] },
          { id: 19, root: "ACTUAL",     accept: ["actually"] },
          { id: 20, root: "EXPERIENCE", accept: ["experienced"] },
          { id: 21, root: "DIFFER",     accept: ["different"] },
          { id: 22, root: "THOUGHT",    accept: ["thoughtful"] },
          { id: 23, root: "MEAN",       accept: ["meaningful"] },
          { id: 24, root: "EXCITE",     accept: ["excitement"] }
        ]
      },

      // ───────── PART 4 (Q25-30) — key word transformation ─────────
      {
        partNumber: 4,
        type: "key-word-transformation",
        instruction: "For questions 25–30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do NOT change the word given. You must use between two and five words, including the word given.",
        items: [
          {
            id: 25,
            original: "It's a long time since I last visited my grandparents.",
            keyWord: "SEEN",
            gapped: "I ___ for a long time.",
            accept: ["haven't seen my grandparents", "have not seen my grandparents", "havent seen my grandparents"]
          },
          {
            id: 26,
            original: "He didn't know the answer because he hadn't listened in class.",
            keyWord: "ATTENTION",
            gapped: "He didn't know the answer because he ___ in class.",
            accept: ["hadn't paid attention", "had not paid attention", "hadnt paid attention"]
          },
          {
            id: 27,
            original: "I'm sure that wasn't Sara at the party last night.",
            keyWord: "HAVE",
            gapped: "That ___ Sara at the party last night.",
            accept: ["can't have been", "cannot have been", "cant have been"]
          },
          {
            id: 28,
            original: "The teacher told me to be quiet.",
            keyWord: "WAS",
            gapped: "I ___ be quiet by the teacher.",
            accept: ["was told to"]
          },
          {
            id: 29,
            original: "Although Tom was tired, he kept on running.",
            keyWord: "SPITE",
            gapped: "Tom kept on running ___ tired.",
            accept: ["in spite of being", "in spite of feeling"]
          },
          {
            id: 30,
            original: "If she doesn't leave now, she'll miss the train.",
            keyWord: "UNLESS",
            gapped: "She'll miss the train ___ now.",
            accept: ["unless she leaves"]
          }
        ]
      },

      // ───────── PART 5 (Q31-36) — long-text MCQ (4 options A-D) ─────────
      {
        partNumber: 5,
        type: "long-text-mcq",
        instruction: "You are going to read a magazine article about a young woman's approach to travel. For questions 31–36, choose the answer (A, B, C or D) which you think fits best according to the text.",
        title: "The slow way to see the world",
        passage:
          "When 26-year-old Mira Patel finished her university degree last summer, her friends were full of advice about the kind of trip she should take to celebrate. Most of them suggested some version of the same plan: a month-long tour of seven or eight European capitals, visiting as many famous sights as possible. Mira listened politely, but in the end she decided to do something completely different. With the same budget that her friends had used to cover their busy itineraries, she bought a one-way ticket to a small town in northern Spain and stayed there for three full months.\n\nMira is one of a growing number of young travellers who describe themselves as part of the \"slow travel\" movement. The idea behind it is simple: instead of trying to see as many places as possible in a short time, spend longer periods in fewer places, and try to live like a local rather than tick off tourist attractions. For Mira, this meant renting a small flat above a bakery, learning some Spanish, getting to know the people in the market, and exploring the surrounding mountains on foot at the weekends. \"By the end of the second month,\" she says, \"the woman in the corner shop was saving the freshest bread for me. That kind of thing doesn't happen in three days.\"\n\nSlow travel is not a new idea — long-term travellers have always existed — but social media has helped to give it a name and a community. Online groups now share tips about which towns are most welcoming to long-term visitors, where it is possible to volunteer in exchange for accommodation, and how to handle practical questions like visas and local transport. According to a recent industry survey, the number of people taking trips of more than 30 days has risen sharply over the past five years, and the average age of these travellers is younger than many in the tourism industry expected.\n\nCritics argue that slow travel is only realistic for people with savings, no children, and the kind of jobs that allow them to work remotely or take long breaks. There is some truth in this. However, supporters point out that, in many cases, slow travel actually costs less than the kind of high-speed sightseeing tours that fill the pages of guidebooks. A single train ticket between two cities, plus a week in a hotel, can easily be more expensive than a month in a small flat in a quiet town, especially if the traveller is willing to cook their own meals and use public transport.\n\nThe benefits, supporters say, go far beyond money. Mira describes how, by the end of her three months, she felt that she understood the rhythm of the town in a way that was simply impossible during a short visit. She began to recognise the same faces in the cafés, was invited to a wedding, and even helped a neighbour translate a difficult letter from a government office. \"I wasn't a tourist any more,\" she says. \"I was just a person living in this town for a while. That changes the way you see everything.\"\n\nShe is now planning her next trip, which she hopes will last six months and take her to a small fishing village in Portugal. Friends still tease her about her unusual approach. \"They tell me I'm 'wasting' time, when I could be seeing twenty countries,\" she says with a laugh. \"But the way I see it, I'm not collecting countries. I'm collecting moments. And those, you can't rush.\"",
        questions: [
          {
            id: 31,
            prompt: "What did Mira's friends originally suggest she should do after university?",
            options: [
              { letter: "A", text: "travel alone in a country she had never visited before" },
              { letter: "B", text: "take a fast trip around several European capital cities" },
              { letter: "C", text: "save money for a longer trip in a few years' time" },
              { letter: "D", text: "volunteer in another country for a month or two" }
            ],
            correct: "B"
          },
          {
            id: 32,
            prompt: "According to the second paragraph, how is \"slow travel\" different from ordinary tourism?",
            options: [
              { letter: "A", text: "It always costs less than other types of holiday." },
              { letter: "B", text: "It is only popular among very young travellers." },
              { letter: "C", text: "It focuses on getting to know one place well rather than seeing many." },
              { letter: "D", text: "It avoids using social media to share experiences." }
            ],
            correct: "C"
          },
          {
            id: 33,
            prompt: "What does the writer say about the role of social media in slow travel?",
            options: [
              { letter: "A", text: "It has reduced the number of people choosing this style of travel." },
              { letter: "B", text: "It has helped this type of travel become better known and supported." },
              { letter: "C", text: "It mainly attracts older travellers who are nervous of being alone." },
              { letter: "D", text: "It has made finding cheap accommodation more difficult than before." }
            ],
            correct: "B"
          },
          {
            id: 34,
            prompt: "What is the writer's attitude to the criticism that slow travel is not for everyone?",
            options: [
              { letter: "A", text: "The writer completely agrees with this criticism." },
              { letter: "B", text: "The writer rejects it as having no truth at all." },
              { letter: "C", text: "The writer accepts part of it but mentions an important counter-argument." },
              { letter: "D", text: "The writer believes the criticism applies only to older travellers." }
            ],
            correct: "C"
          },
          {
            id: 35,
            prompt: "What does Mira say about her time in the Spanish town in the fifth paragraph?",
            options: [
              { letter: "A", text: "She found it harder to make friends than she had hoped." },
              { letter: "B", text: "She started to feel like a member of the local community." },
              { letter: "C", text: "She did not really enjoy living above a bakery." },
              { letter: "D", text: "She was too busy studying Spanish to meet many people." }
            ],
            correct: "B"
          },
          {
            id: 36,
            prompt: "How does Mira respond to her friends' jokes about \"wasting time\"?",
            options: [
              { letter: "A", text: "She admits that they are probably right but does not want to change." },
              { letter: "B", text: "She suggests that they should join her next trip to see for themselves." },
              { letter: "C", text: "She explains that she values different things from a journey than they do." },
              { letter: "D", text: "She agrees to take a faster trip with them next year." }
            ],
            correct: "C"
          }
        ]
      },

      // ───────── PART 6 (Q37-42) — gapped text (6 sentences removed, 7 options A-G) ─────────
      {
        partNumber: 6,
        type: "gapped-text",
        instruction: "You are going to read an article in which a writer describes returning to her childhood village. Six sentences have been removed from the article. Choose from the sentences A–G the one which fits each gap (37–42). There is one extra sentence which you do not need to use.",
        title: "Going back to where I grew up",
        text:
          "I had not visited the village where I grew up for almost twenty-five years. Every time I tried to plan a trip, something more interesting always came up — a new job, a friend's wedding, a holiday in a country I had never seen. I told myself that the village would still be there next year. ___1___\n\nWhen I finally bought a train ticket last spring, I expected to find the place exactly as I remembered it. I knew, of course, that some things would have changed. But in my mind it was still a quiet village of about three hundred people, with a single small shop, a primary school where everyone knew everyone, and a ruined castle on a hill at the end of the main street.\n\nThe reality was rather different. ___2___ Several large new houses had appeared on what used to be open fields, and the school had grown to include a modern building with bright blue windows.\n\nI walked through the streets feeling slightly lost. ___3___ The bakery where my grandmother used to send me to buy bread on Saturday mornings was now a small art gallery. The corner shop, where the owner had always given me a sweet for free if I behaved, was an estate agent's office. Even the playground where I had spent so many afternoons had been replaced by a small car park.\n\nI sat down on a bench in front of the church to get my thoughts together. ___4___ It was a girl of about seven, holding a piece of paper and a pencil. She wanted to know if I could draw the church for her, because she was making a \"village book\" for school and I \"looked like a kind person\".\n\nI told her honestly that I was not very good at drawing, but that I would try. As we sat together, the girl chatted easily about her teacher, her two cats and her favourite tree near the river. ___5___ I had walked to school down the same paths and even drawn the same church for an art project. Some things in the village had clearly not changed at all.\n\nI returned home the next day with a different feeling from the one I had expected. The buildings I had remembered so well were mostly gone, and the people I had known had moved away or grown old. ___6___ For the first time in many years, I felt I belonged somewhere again.",
        // 7 options A-G; 6 are correct (one per gap), 1 is a distractor
        options: [
          { letter: "A", text: "The village had grown noticeably, and there were now perhaps twice as many houses as I remembered." },
          { letter: "B", text: "As she chatted, I realised that her childhood was not so different from my own." },
          { letter: "C", text: "After a few minutes, a small voice asked me a strange question." },
          { letter: "D", text: "And then, almost without warning, twenty-five years had passed." },
          { letter: "E", text: "But the rhythm of life — the children walking to school, the bells of the church on a Sunday morning, the sound of a tractor on the road — felt exactly the same as I had always remembered." },
          { letter: "F", text: "The journey by train took almost six hours, but I barely noticed it pass." },
          { letter: "G", text: "Almost every shop I remembered from my childhood had been turned into something else." }
        ],
        gaps: [
          { id: 37, correct: "D" },
          { id: 38, correct: "A" },
          { id: 39, correct: "G" },
          { id: 40, correct: "C" },
          { id: 41, correct: "B" },
          { id: 42, correct: "E" }
        ]
      },

      // ───────── PART 7 (Q43-52) — multiple matching (10 Q to 4 sections A-D) ─────────
      {
        partNumber: 7,
        type: "multiple-matching",
        instruction: "You are going to read four short articles in which young people talk about volunteering in another country. For questions 43–52, choose from the people (A–D). The people may be chosen more than once.",
        topic: "Four people talk about volunteering in another country",
        sections: [
          {
            letter: "A",
            title: "Lukas — Vietnam",
            body: "I was 24 when I decided to take a year out and volunteer abroad. After looking at lots of programmes online, I chose one that placed teachers in small schools in northern Vietnam. Before I left, I imagined the experience would be mainly about helping the children, but in fact the children helped me as much as I helped them. They taught me three songs in Vietnamese on my first day, even though their English was at the level of single words. The school I worked at had no electricity for half the day, which was a shock at first, but after about a month I found I liked the silence. The biggest challenge was actually adapting to the food — I ate noodle soup almost every day for breakfast, and I missed bread terribly. Looking back, I would do it all again, but I would prepare more for the food and less for the teaching."
          },
          {
            letter: "B",
            title: "Marisol — Costa Rica",
            body: "My six months in Costa Rica were not what I had expected at all. I had imagined I would spend my days walking through the rainforest with monkeys jumping above my head, but most of my time was actually spent cleaning enclosures and chopping fruit for animals that were too injured to live in the wild. It was hard physical work, and I was always tired. The other volunteers were from many different countries, and we became close very quickly because we shared everything — the same small kitchen, the same long days, even the same insect bites. The food was fantastic, and I now cook Costa Rican beans and rice at home almost every week. The most surprising thing is that I came back wanting to study to be a vet, even though I had never thought about that before. The animals had completely changed my plans for my future."
          },
          {
            letter: "C",
            title: "Theo — Nepal",
            body: "I went to Nepal with a small team from my university, and we worked for two months on a project to rebuild houses in a village that had been damaged by an earthquake. None of us knew anything about building when we arrived. The local team taught us everything, and they were endlessly patient with us, even though we made many mistakes at first. By the end I could lay bricks and mix cement, although I would still not call myself a builder. The food was simple but really good — I never grew tired of dal bhat, the local rice and lentil dish, which we ate twice a day. What surprised me most was the friendliness of the village. We were strangers, and yet within a few days the children were running to meet us every morning, and one elderly woman insisted on washing my T-shirt for me, even though I tried hard to say no. I felt much closer to the families than I had to most people I met during my travels before."
          },
          {
            letter: "D",
            title: "Saskia — South Africa",
            body: "I had been working as an accountant for ten years when I decided I needed a complete change. I took a four-month break and joined a programme that runs small libraries in townships near Cape Town. My job was to organise the books, run reading sessions for children after school, and help adults who wanted to use the computers. The work itself was much less physical than I had imagined, but it was emotionally exhausting in a way I hadn't expected. Some of the children had very difficult home lives, and listening to them talk about their day was sometimes hard. I had wonderful colleagues — three other volunteers and two local staff — and we cooked simple meals together every evening. When I came back to my old job, I found I no longer wanted to spend my career counting numbers. I am now studying part-time to become a teacher."
          }
        ],
        questions: [
          { id: 43, prompt: "Who decided to start a completely new career path because of the experience?",                                  correct: "B" },
          { id: 44, prompt: "Who mentions making a lot of mistakes when they first arrived?",                                              correct: "C" },
          { id: 45, prompt: "Who felt that they received as much from the local people as they had given?",                                correct: "A" },
          { id: 46, prompt: "Who was surprised that the work was less physical than they had expected?",                                  correct: "D" },
          { id: 47, prompt: "Who became close to the other volunteers very quickly?",                                                       correct: "B" },
          { id: 48, prompt: "Who had difficulty adapting to the local food?",                                                              correct: "A" },
          { id: 49, prompt: "Who was welcomed by a member of the local community in a personal way?",                                       correct: "C" },
          { id: 50, prompt: "Who has begun training to do a different job since returning home?",                                           correct: "D" },
          { id: 51, prompt: "Who spent most of their time doing different tasks from the ones they had imagined?",                          correct: "B" },
          { id: 52, prompt: "Whose work was emotionally challenging in an unexpected way?",                                                 correct: "D" }
        ]
      }
    ]
  },

  writing: {
    parts: [

      // ───────── WRITING PART 1 (Q53) — compulsory essay (140-190 words) ─────────
      {
        partNumber: 8,                // continuous internal numbering after 7 reading parts
        writingPartNumber: 1,
        type: "essay",
        taskType: "Essay",
        instruction: "In your English class you have been talking about education. Now your English teacher has asked you to write an essay.\n\nWrite an essay using all the notes and giving reasons for your point of view.",
        topic: "Some people think that schools should focus more on practical subjects such as cooking, money management and basic medicine, instead of traditional subjects like history. Do you agree?",
        notes: [
          "usefulness in daily life",
          "preparation for the future",
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
              "You see this announcement in an international magazine for young people:\n\nARTICLES WANTED!\nWhat is the best way to spend a free Saturday in your town or city? Tell us about your favourite activity and why you would recommend it to a visitor of your age.\n\nThe best articles will be published next month.\n\nWrite your article."
          },
          {
            id: "email",
            taskType: "Email",
            heading: "Question 3 — Email",
            prompt:
              "You have received this email from your English-speaking friend Joe:\n\nFrom: Joe\nSubject: Help!\n\nI'm thinking of buying my younger sister a book for her 14th birthday. She loves science and adventure, but she doesn't read very often. Could you suggest a book and tell me why she would like it? Also, where is the best place to buy English books in your country?\n\nThanks!\nJoe\n\nWrite your email."
          },
          {
            id: "review",
            taskType: "Review",
            heading: "Question 4 — Review",
            prompt:
              "You have seen this notice on an English-language website for film lovers:\n\nREVIEWS WANTED\nWe are looking for reviews of a film that you have watched recently which made you laugh. Tell us briefly what the film is about, why it is funny, and whether you would recommend it to other young people.\n\nWrite your review."
          }
        ],
        wordMin: 140,
        wordMax: 190,
        scoringRubric:
          "Award full marks if the candidate has chosen ONE option, fully matched its expected register and conventions (article: engaging tone + clear opinion; email: appropriate greeting + answers to all questions; review: brief summary + evaluation + recommendation), used B2-appropriate vocabulary and a good range of grammatical structures, and written 140–190 words. Penalise off-topic content, mixing tasks, wrong register, or fewer than 140 words."
      }
    ]
  }
};
