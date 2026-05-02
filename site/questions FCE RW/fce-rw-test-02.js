// FCE (B2 First) Reading, Use of English & Writing — Mock 02
// Post-2015 Cambridge format: 155 min combined paper
//   Reading & Use of English: 75 min, 7 parts, 52 questions
//   Writing: 80 min, 2 tasks, 140-190 words each
// All content is original AI-authored material (Mock Stream).

window.FCE_RW_TEST = {
  testInfo: {
    id: "fce-rw-02",
    title: "FCE Reading, Use of English & Writing Mock 02",
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
        title: "The forgotten benefits of walking",
        text:
          "Most of us, in modern cities, spend a great deal more time sitting than our bodies were ___1___ to handle. We sit in cars, at desks, on sofas, and even on benches when we go to the park. According to recent ___2___, the average adult now walks fewer than five thousand steps a day — well below the levels recommended by health experts.\n\nThe good news is that this is a problem we can ___3___ at almost no cost. Walking, more than almost any other activity, is a habit that fits ___4___ into a busy life. A short walk after lunch can help us digest our food and ___5___ down the rise in blood sugar that often follows a meal. A longer walk before bed can ___6___ stress and improve the quality of our sleep.\n\nSome doctors now even ___7___ a daily walk as a 'first treatment' for mild depression, before considering medication. The evidence is unusually strong: a walk of just thirty minutes can ___8___ a measurable difference to how we feel for the rest of the day.",
        gaps: [
          { id: 1, options: [{letter:"A",text:"designed"},{letter:"B",text:"built"},{letter:"C",text:"made"},{letter:"D",text:"shaped"}], correct: "A" },
          { id: 2, options: [{letter:"A",text:"tests"},{letter:"B",text:"studies"},{letter:"C",text:"papers"},{letter:"D",text:"checks"}], correct: "B" },
          { id: 3, options: [{letter:"A",text:"face"},{letter:"B",text:"treat"},{letter:"C",text:"tackle"},{letter:"D",text:"deal"}], correct: "C" },
          { id: 4, options: [{letter:"A",text:"easily"},{letter:"B",text:"freely"},{letter:"C",text:"directly"},{letter:"D",text:"widely"}], correct: "A" },
          { id: 5, options: [{letter:"A",text:"put"},{letter:"B",text:"bring"},{letter:"C",text:"slow"},{letter:"D",text:"hold"}], correct: "C" },
          { id: 6, options: [{letter:"A",text:"decrease"},{letter:"B",text:"reduce"},{letter:"C",text:"lower"},{letter:"D",text:"drop"}], correct: "B" },
          { id: 7, options: [{letter:"A",text:"recommend"},{letter:"B",text:"suggest"},{letter:"C",text:"advise"},{letter:"D",text:"propose"}], correct: "A" },
          { id: 8, options: [{letter:"A",text:"bring"},{letter:"B",text:"put"},{letter:"C",text:"make"},{letter:"D",text:"give"}], correct: "C" }
        ]
      },

      // ───────── PART 2 (Q9-16) — open cloze (1 word per gap) ─────────
      {
        partNumber: 2,
        type: "cloze-open",
        instruction: "For questions 9–16, read the text below and think of the word which best fits each gap. Use only ONE word in each gap.",
        title: "The unexpected return of vinyl records",
        text:
          "Most people in the music industry assumed, twenty years ___1___, that the vinyl record was finally finished. Streaming services and digital downloads ___2___ to be the future. Yet the past decade has seen one of the most surprising recoveries in the history of consumer products. Vinyl sales now ___3___ for a small but rapidly growing share of total music revenue.\n\nThe reasons ___4___ this revival are interesting. Some buyers, particularly those over forty, are returning to the format ___5___ which they grew up. ___6___ are younger listeners who never experienced records the first time round, but who now value the slower, more deliberate ___7___ of choosing a record, putting it on, and listening to it from beginning to end. As ___8___ result, a new generation of small independent record shops has appeared to serve them.",
        gaps: [
          { id: 9,  accept: ["ago"] },
          { id: 10, accept: ["appeared","seemed","promised"] },
          { id: 11, accept: ["account"] },
          { id: 12, accept: ["behind","for"] },
          { id: 13, accept: ["with"] },
          { id: 14, accept: ["Others"] },
          { id: 15, accept: ["act","process","experience"] },
          { id: 16, accept: ["a"] }
        ]
      },

      // ───────── PART 3 (Q17-24) — word formation ─────────
      {
        partNumber: 3,
        type: "word-formation",
        instruction: "For questions 17–24, read the text below. Use the word given in capitals at the end of some of the lines to form a word that fits in the gap in the same line.",
        title: "The unusual rise of cooking shows",
        text:
          "Cooking shows have undergone a remarkable rise in popularity over the past twenty years, and the most ___1___ of them now reach audiences of many millions.\n\nCritics, however, have ___2___ argued that the shows are not really about food at all.\n\nWhat makes a particular cooking programme ___3___ to viewers, it turns out, has very little to do with the actual recipes.\n\nThe most experienced ___4___ are aware of this, and they cast their shows accordingly.\n\nA friendly competition between two cooks who know nothing about each other can be far more entertaining than the most ___5___ chef demonstrating a perfect dish.\n\nEven the cooking instructions themselves are not always given ___6___; small mistakes by the presenters are sometimes left in to make the experience feel more genuine.\n\nFor most viewers, the appeal seems to be a combination of relaxation and a ___7___ source of cooking ideas.\n\nPerhaps the most surprising development of all is that millions of people now build their ___8___ of food largely from watching television.",
        gaps: [
          { id: 17, root: "SUCCESS",  accept: ["successful"] },
          { id: 18, root: "REPEAT",   accept: ["repeatedly"] },
          { id: 19, root: "ATTRACT",  accept: ["attractive"] },
          { id: 20, root: "PRODUCE",  accept: ["producers"] },
          { id: 21, root: "FAME",     accept: ["famous"] },
          { id: 22, root: "ACCURATE", accept: ["accurately"] },
          { id: 23, root: "RELY",     accept: ["reliable"] },
          { id: 24, root: "KNOW",     accept: ["knowledge"] }
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
            original: "I haven't ridden a bicycle for ten years.",
            keyWord: "SINCE",
            gapped: "It ___ I last rode a bicycle.",
            accept: ["has been ten years since", "is ten years since", "'s been ten years since", "'s ten years since"]
          },
          {
            id: 26,
            original: "I'm sorry I forgot your birthday last week.",
            keyWord: "REMEMBERED",
            gapped: "I wish ___ your birthday last week.",
            accept: ["I had remembered", "I'd remembered"]
          },
          {
            id: 27,
            original: "We were too busy to take a holiday last year.",
            keyWord: "ENOUGH",
            gapped: "We didn't ___ take a holiday last year.",
            accept: ["have enough time to"]
          },
          {
            id: 28,
            original: "Sara only became interested in photography after she got a new phone.",
            keyWord: "UNTIL",
            gapped: "Sara wasn't ___ she got a new phone.",
            accept: ["interested in photography until"]
          },
          {
            id: 29,
            original: "I really regret eating that whole pizza last night.",
            keyWord: "SHOULDN'T",
            gapped: "I ___ that whole pizza last night.",
            accept: ["shouldn't have eaten"]
          },
          {
            id: 30,
            original: "Don't open the door — it's still wet.",
            keyWord: "BETTER",
            gapped: "You ___ the door — it's still wet.",
            accept: ["had better not open", "'d better not open"]
          }
        ]
      },

      // ───────── PART 5 (Q31-36) — long-text MCQ (4 options A-D) ─────────
      {
        partNumber: 5,
        type: "long-text-mcq",
        instruction: "You are going to read a magazine article about a runner who got lost. For questions 31–36, choose the answer (A, B, C or D) which you think fits best according to the text.",
        title: "The runner who got lost",
        passage:
          "When 38-year-old Iris Larsen left her hotel one summer morning for a quick run before breakfast, she expected to be back within forty minutes. She was visiting a quiet town in the south of Norway for a friend's wedding, and she had brought her running shoes mostly out of habit; her plan was to follow the small road that led north, away from the town, for fifteen minutes, then turn round and run back in plenty of time to shower and change.\n\nThe road, as Iris later admitted, was easy to follow at first. After about ten minutes, however, she came to a small crossroads that her hotel map did not show. Two narrow paths branched off into a forest. The morning was unusually warm and bright, and Iris, feeling fit and confident, decided to take the path on the right \"for variety\". Within twenty minutes, she had no idea where she was.\n\nThe hours that followed were not, by Iris's own description, frightening — at least not at first. The forest was open and clearly walked by local people; she met a family with a small dog after about an hour and asked them, in basic Norwegian, the way back to her hotel. Their answer, as far as she could understand it, suggested that she was already very far from where she thought she was. She set off in the direction they had pointed, and quickly found herself on a small farm road which, after another forty minutes, came to an unexpected lake.\n\nBy this point, she had been out for nearly three hours. Her phone had no signal. She had no water and no food. The wedding ceremony was due to start in less than two hours. It was at the edge of the lake, sitting on a wooden bench and looking at the perfectly still water, that Iris began to feel something close to genuine fear.\n\nShe decided, after a moment, that the only sensible plan was to turn around and follow the farm road back to the family she had met earlier. They had not been far from a small village, she thought, and someone there would surely have a phone. She stood up, brushed grass off her trousers, and started walking — and then, on a complete impulse, she did one more thing. She took out her phone and, just in case, walked twenty metres further along the lake to see if a signal might appear.\n\nIt did. She managed to call the small hotel where the wedding was being held, explain in two minutes what had happened, and was promised that someone would come for her. The hotel owner's son arrived in a small white van forty minutes later. Iris reached the wedding ceremony fifteen minutes after it had started, in shorts, an old running top, and shoes that had picked up half the forest. Her friend, the bride, has since said that this was easily the most memorable arrival of any of her guests.\n\nWhat stayed with Iris was not the embarrassment, or the panic she had felt by the lake. What stayed with her was the moment when she had decided, without any real reason, to walk twenty metres further before giving up. She has no good explanation for it; she insists that she nearly didn't bother. \"I think the lesson, if there is one,\" she now says, \"is something about how often the small extra step is the one that actually matters. Most days I forget. But I remember that lake every single time I have to make a decision.\"",
        questions: [
          {
            id: 31,
            prompt: "Why had Iris brought her running shoes to Norway?",
            options: [
              { letter: "A", text: "She had specifically planned to do some running before the wedding." },
              { letter: "B", text: "She had packed them automatically rather than for any particular reason." },
              { letter: "C", text: "She had been told that running was very popular in the area." },
              { letter: "D", text: "She wanted to use the trip to train for an upcoming race." }
            ],
            correct: "B"
          },
          {
            id: 32,
            prompt: "What does the writer say about Iris's decision at the crossroads?",
            options: [
              { letter: "A", text: "She chose the right-hand path because it looked the most interesting." },
              { letter: "B", text: "She thought the right-hand path would lead back to her hotel." },
              { letter: "C", text: "She made the choice in a relaxed, almost casual mood." },
              { letter: "D", text: "She had been warned by her hotel not to go that way." }
            ],
            correct: "C"
          },
          {
            id: 33,
            prompt: "What was Iris's reaction during the first part of the time she was lost?",
            options: [
              { letter: "A", text: "She remained reasonably calm, although she realised she was lost." },
              { letter: "B", text: "She immediately tried to find a road back to her hotel." },
              { letter: "C", text: "She regretted having gone out for a run that morning at all." },
              { letter: "D", text: "She panicked when she realised her phone had no signal." }
            ],
            correct: "A"
          },
          {
            id: 34,
            prompt: "By the time Iris reached the lake, the situation had become difficult mainly because:",
            options: [
              { letter: "A", text: "the weather had suddenly become much colder." },
              { letter: "B", text: "she had no way of contacting anyone or knowing where she was." },
              { letter: "C", text: "she had injured herself during the long walk." },
              { letter: "D", text: "the family she had met earlier had refused to help her." }
            ],
            correct: "B"
          },
          {
            id: 35,
            prompt: "What stayed with Iris most after she returned to the wedding?",
            options: [
              { letter: "A", text: "how late she had been to the ceremony itself." },
              { letter: "B", text: "what her friend the bride later said about her arrival." },
              { letter: "C", text: "the way her own decision by the lake had affected her later." },
              { letter: "D", text: "the fact that nobody asked her where she had been." }
            ],
            correct: "C"
          },
          {
            id: 36,
            prompt: "What does Iris want others to take from her story?",
            options: [
              { letter: "A", text: "the importance of carrying a map and water on a run." },
              { letter: "B", text: "the value of making one extra small effort before giving up." },
              { letter: "C", text: "the danger of running in unfamiliar countries." },
              { letter: "D", text: "the kindness she experienced from the hotel owner's son." }
            ],
            correct: "B"
          }
        ]
      },

      // ───────── PART 6 (Q37-42) — gapped text (6 sentences removed, 7 options A-G) ─────────
      {
        partNumber: 6,
        type: "gapped-text",
        instruction: "You are going to read an article in which a writer reflects on returning to painting after many years away from it. Six sentences have been removed from the article. Choose from the sentences A–G the one which fits each gap (37–42). There is one extra sentence which you do not need to use.",
        title: "How I rediscovered painting",
        text:
          "I had not picked up a paintbrush since I was sixteen, when my school art teacher suggested, fairly gently, that my talents might lie elsewhere. She was probably right at the time; my paintings were, if I am honest, fairly bad. ___1___\n\nFor nearly twenty years, I avoided anything to do with painting. I did not visit galleries. I did not sketch. When friends said that they had taken up watercolours or oils, I changed the subject. The shame of having been politely steered away in childhood had, without my noticing, become a small prohibition on the activity itself.\n\n___2___\n\nIt was almost by accident, then, that I bought a set of children's poster paints in a supermarket last March. A neighbour's child was visiting for the afternoon and we needed something to occupy her. After she had gone home, the paints were still on the kitchen table. With a kind of half-hearted curiosity, I sat down and tried to paint the apple in front of me.\n\n___3___\n\nThe process of trying again, twenty years later, was strangely calming. I was not, in any meaningful sense, much better than I had been at sixteen. But the experience of failure was, for the first time in my life, completely without pressure. There was no teacher to disappoint. There was nobody for whom my painting was supposed to be the beginning of anything.\n\n___4___\n\nI began to paint regularly, mostly in the evenings, after dinner. My subjects were embarrassingly ordinary: a chair, a plate, my partner reading the newspaper. The point, increasingly, was not the painting itself. The point was the half-hour of close attention to the actual world that the painting required.\n\n___5___\n\nPeople who hear about this often ask me whether I am secretly hoping to become a better painter. I am not. The whole experiment has worked precisely because nothing depends on it. If I improve, I will be glad. If I never improve, I will still spend a calm half-hour every evening looking carefully at something familiar, and that, increasingly, is reason enough.\n\n___6___\n\nI no longer think the art teacher was wrong. I think she may have been quite right that my hands and eyes have a fairly limited talent. What she could not have known, however, is how useful even a limited talent can become if it is allowed to exist on its own terms.",
        // 7 options A-G; 6 are correct (one per gap), 1 is a distractor
        options: [
          { letter: "A", text: "The painting that resulted was, predictably, rather bad. But I noticed something curious: I had genuinely enjoyed the half-hour I had spent making it." },
          { letter: "B", text: "Something in the act of paying that kind of close attention also began to change what I noticed during the rest of the day." },
          { letter: "C", text: "I am, by training, a software engineer, and most of my professional life has been organised around getting things right." },
          { letter: "D", text: "My old paintings, none of which I had kept, had probably been tossed into a recycling bin years before." },
          { letter: "E", text: "Without realising it, I had spent two decades convinced that the verdict of one well-meaning adult, delivered when I was very young, was a final ruling." },
          { letter: "F", text: "There is, of course, the small risk that you will become good at the thing you originally gave up." },
          { letter: "G", text: "Perhaps you, like me, can think of an activity you stopped doing because somebody once suggested you should." }
        ],
        gaps: [
          { id: 37, correct: "E" },
          { id: 38, correct: "C" },
          { id: 39, correct: "A" },
          { id: 40, correct: "B" },
          { id: 41, correct: "F" },
          { id: 42, correct: "G" }
        ]
      },

      // ───────── PART 7 (Q43-52) — multiple matching (10 Q to 4 sections A-D) ─────────
      {
        partNumber: 7,
        type: "multiple-matching",
        instruction: "You are going to read four short articles in which young adults talk about starting their own small business. For questions 43–52, choose from the people (A–D). The people may be chosen more than once.",
        topic: "Four people who started their own small business in their twenties",
        sections: [
          {
            letter: "A",
            title: "Lena — vintage clothing shop, started at 25",
            body: "I had been working in fashion buying for a large company for three years when I noticed that nobody in the chain seemed to care very much about the actual clothes any more. The whole industry, I started to feel, had been hollowed out. I left in February with about three thousand pounds saved, and I opened a tiny vintage shop in the cheapest street I could find in my home city. The first six months were extremely lonely; I sometimes saw fewer than three customers a day. I was rescued, oddly, by a single article in a small online magazine that compared what I was doing to a kind of slow-fashion movement. Within a week, I had a small queue outside on Saturday mornings, and I have not looked back since."
          },
          {
            letter: "B",
            title: "Marek — mobile coffee bar, started at 27",
            body: "My first business was a complete failure. I had spent almost all my savings buying a small coffee van without realising that the city centre, where I had planned to park it, was full of identical vans run by people with much better connections than mine. Within four months I was almost broke and very nearly defeated. What saved me, in the end, was a cousin in a small mountain town two hours away. He told me, almost as a joke, that there was no decent coffee in his town at all, and that everyone there was sick of the instant kind. I drove out the following week, parked outside his school, and had sold out within forty minutes. I have been there ever since, and I now run two vans across three small towns."
          },
          {
            letter: "C",
            title: "Priya — children's bookshop, started at 26",
            body: "I had wanted to open a bookshop since I was about ten years old, and when my grandmother left me a small amount of money in her will, I decided to use it. The first few months were genuinely terrifying, mainly because almost every other independent bookshop I knew had closed in the previous five years. What I had not realised, however, was that there was almost no shop in my city dedicated to children's books, and that parents were quietly desperate for one. I was very careful about my opening hours, my reading sessions and my events; I learnt, slowly, that the parents were as much my customers as the children were. By the end of the first year, I was breaking even — which, for a small bookshop, was a small miracle."
          },
          {
            letter: "D",
            title: "Theo — music-lessons business, started at 24",
            body: "I never planned to start a business at all. I had been working as a part-time piano teacher for two years, mostly to support myself while I tried to do something more 'serious' as a composer. After a few months, however, I realised that I had a small queue of parents who wanted to bring their children to me, and that it actually paid better than most of my composing work. I rented a small room above a bakery, hired one other teacher, and started taking on more students. Within two years I had four teachers and a waiting list. The most surprising thing, looking back, is that I am much happier than I was when I was trying to be a 'proper' composer, even though I get less time to write my own music."
          }
        ],
        questions: [
          { id: 43, prompt: "Whose business was helped by an unexpected piece of media coverage?",                                              correct: "A" },
          { id: 44, prompt: "Who admits that their first attempt at the business ended in near-disaster?",                                       correct: "B" },
          { id: 45, prompt: "Whose business idea benefited from a clear gap in their local market that they had not initially identified?",      correct: "C" },
          { id: 46, prompt: "Who has expanded the geographical reach of their business since launching?",                                        correct: "B" },
          { id: 47, prompt: "Who admits to having drifted into the business almost by accident?",                                                correct: "D" },
          { id: 48, prompt: "Who relocated their business after their first attempt failed?",                                                    correct: "B" },
          { id: 49, prompt: "Who had been quietly planning the same business for many years before launching it?",                                correct: "C" },
          { id: 50, prompt: "Who was surprised to find that they preferred running the business to their original creative work?",               correct: "D" },
          { id: 51, prompt: "Who left a previous job partly because they were unhappy with the way the wider industry had developed?",            correct: "A" },
          { id: 52, prompt: "Who realised that their actual customer was not the person they had originally expected?",                          correct: "C" }
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
        topic: "It is more important for schools to teach students how to find and check information than to teach them facts that they have to remember. Do you agree?",
        notes: [
          "changes in technology",
          "usefulness in adult life",
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
              "You see this announcement in an English-language magazine for travellers:\n\nARTICLES WANTED\n\nWhat is the one place in your country that every visitor should see at least once? Tell us about your favourite place, what makes it special, and why you would recommend it to someone visiting your country for the first time.\n\nThe best articles will be published on our website.\n\nWrite your article."
          },
          {
            id: "email",
            taskType: "Email",
            heading: "Question 3 — Email",
            prompt:
              "You have received this email from your English-speaking friend Jamie, who is starting university next month:\n\nFrom: Jamie\nSubject: Help — starting uni!\n\nI'm a bit nervous about starting university next month. I'll be living in a new city, sharing a flat with people I don't know, and I'll have to manage my own money for the first time. Could you give me some practical advice — anything you wish you had known when you started studying somewhere new?\n\nThanks!\nJamie\n\nWrite your email."
          },
          {
            id: "review",
            taskType: "Review",
            heading: "Question 4 — Review",
            prompt:
              "You see this notice on an English-language website for food lovers:\n\nREVIEWS WANTED\n\nWe are looking for reviews of restaurants or cafés that have made a strong impression on you recently. Tell us briefly what the food and the atmosphere are like, comment on the service, and say whether you would recommend the place to other young people.\n\nWrite your review."
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
