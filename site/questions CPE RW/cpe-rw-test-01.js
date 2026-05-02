// CPE (C2 Proficiency) Reading, Use of English & Writing — Mock 01
// Cambridge format: 180 min combined paper
//   Reading & Use of English: 90 min, 7 parts, 53 questions
//   Writing: 90 min, 2 tasks (Part 1 240-280 words, Part 2 280-320 words)
// All content is original AI-authored material (Mock Stream).

window.CPE_RW_TEST = {
  testInfo: {
    id: "cpe-rw-01",
    title: "CPE Reading, Use of English & Writing Mock 01",
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
        title: "Why we romanticise the past",
        text:
          "Few things are as ___1___ as the human tendency to look back on earlier periods with a fondness that the historical evidence rarely ___2___. Almost every generation, it seems, has its own private golden age — a decade, often the one in which its members were children, that supposedly ___3___ a quality of innocence, simplicity or community now sadly lost. ___4___ on closer examination, this image almost always ___5___ apart. The 1950s, fondly remembered by some as a time of stable family life, were in fact riddled with anxiety about the atomic bomb. The 1990s, recalled by others as the dawn of digital opportunity, ___6___ for many young people the deepest period of unemployment in living memory.\n\nPsychologists have an explanation. Memory, they tell us, is a strikingly ___7___ tool: it tends to retain what felt safe and emotionally significant, while quietly ___8___ what was painful or routine. Nostalgia, in other words, is not a window onto the past, but a mirror that flatters the person looking into it.",
        gaps: [
          { id: 1, options: [{letter:"A",text:"widespread"},{letter:"B",text:"usual"},{letter:"C",text:"universal"},{letter:"D",text:"ordinary"}], correct: "C" },
          { id: 2, options: [{letter:"A",text:"supports"},{letter:"B",text:"confirms"},{letter:"C",text:"endorses"},{letter:"D",text:"verifies"}], correct: "A" },
          { id: 3, options: [{letter:"A",text:"embodied"},{letter:"B",text:"presented"},{letter:"C",text:"carried"},{letter:"D",text:"showed"}], correct: "A" },
          { id: 4, options: [{letter:"A",text:"Yet"},{letter:"B",text:"Hence"},{letter:"C",text:"Thus"},{letter:"D",text:"So"}], correct: "A" },
          { id: 5, options: [{letter:"A",text:"breaks"},{letter:"B",text:"splits"},{letter:"C",text:"falls"},{letter:"D",text:"tears"}], correct: "C" },
          { id: 6, options: [{letter:"A",text:"marked"},{letter:"B",text:"wrote"},{letter:"C",text:"framed"},{letter:"D",text:"made"}], correct: "A" },
          { id: 7, options: [{letter:"A",text:"selective"},{letter:"B",text:"chosen"},{letter:"C",text:"preferential"},{letter:"D",text:"particular"}], correct: "A" },
          { id: 8, options: [{letter:"A",text:"erasing"},{letter:"B",text:"removing"},{letter:"C",text:"deleting"},{letter:"D",text:"wiping"}], correct: "A" }
        ]
      },

      // ───────── PART 2 (Q9-16) — open cloze (1 word per gap) ─────────
      {
        partNumber: 2,
        type: "cloze-open",
        instruction: "For questions 9–16, read the text below and think of the word which best fits each gap. Use only ONE word in each gap.",
        title: "The vanishing high street",
        text:
          "For most of the twentieth century, the small shops along a town's main street were ___1___ regarded as the natural heart of the community. Today, ___2___, these same streets are increasingly empty. Online retail has, ___3___ all reasonable doubt, played a major role in this transformation, but it would be a mistake to ___4___ at it as the only cause.\n\nLong before the rise of the internet, urban planning was already shifting commercial activity ___5___ from town centres towards out-of-town shopping parks, which were both cheaper to operate and more convenient for car owners. ___6___ the time online shopping became widespread, many high streets were already in serious decline.\n\nWhat is striking, however, is the speed at ___7___ they have continued to disappear over the past decade. Some local councils have begun to experiment with bold solutions, ranging from rent subsidies for new businesses ___8___ the wholesale conversion of empty shops into community spaces.",
        gaps: [
          { id: 9,  accept: ["long","widely"] },
          { id: 10, accept: ["however"] },
          { id: 11, accept: ["beyond"] },
          { id: 12, accept: ["look","point"] },
          { id: 13, accept: ["away"] },
          { id: 14, accept: ["By"] },
          { id: 15, accept: ["which"] },
          { id: 16, accept: ["to"] }
        ]
      },

      // ───────── PART 3 (Q17-24) — word formation ─────────
      {
        partNumber: 3,
        type: "word-formation",
        instruction: "For questions 17–24, read the text below. Use the word given in capitals at the end of some of the lines to form a word that fits in the gap in the same line.",
        title: "The challenge of writing simply",
        text:
          "Most people assume that writing simply must be the ___1___ of all literary tasks.\n\nThe truth, as any experienced ___2___ will tell you, is exactly the opposite: producing prose that feels effortless to read often demands the most painstaking effort to write.\n\nA passage that is ___3___ formal and full of long, abstract nouns can usually be improved by removing them. Yet the temptation to keep such language in is enormous, particularly when we are trying to sound serious. We have a curious ___4___ to mistake complexity for depth.\n\nWhat good editors offer their writers is, in essence, the ___5___ to defend simplicity against the writer's own pride.\n\nSome of the most ___6___ thinkers of the past century — Russell, Borges, Calvino — wrote with extraordinary clarity, not because their ideas were thin, but because they had no need to disguise them.\n\nThey believed that ___7___ — the polite acknowledgement that the reader's time has value — should be a writer's first priority.\n\nAnyone who has ___8___ themselves with the work of these writers will recognise their generosity at once.",
        gaps: [
          { id: 17, root: "EASY",        accept: ["easiest"] },
          { id: 18, root: "NOVEL",       accept: ["novelist"] },
          { id: 19, root: "UNNECESSARY", accept: ["unnecessarily"] },
          { id: 20, root: "TEND",        accept: ["tendency"] },
          { id: 21, root: "WILL",        accept: ["willingness"] },
          { id: 22, root: "INFLUENCE",   accept: ["influential"] },
          { id: 23, root: "COURTEOUS",   accept: ["courtesy"] },
          { id: 24, root: "ACQUAINT",    accept: ["acquainted"] }
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
            original: "The minister refused to comment on the decision.",
            keyWord: "DECLINED",
            gapped: "The minister ___ on the decision.",
            accept: ["declined to comment"]
          },
          {
            id: 26,
            original: "It was wrong of you not to tell me earlier.",
            keyWord: "SHOULD",
            gapped: "You ___ earlier.",
            accept: ["should have told me", "should have informed me"]
          },
          {
            id: 27,
            original: "Hardly had we sat down when the phone rang.",
            keyWord: "SOONER",
            gapped: "No ___ down than the phone rang.",
            accept: ["sooner had we sat"]
          },
          {
            id: 28,
            original: "I really regret never visiting Tokyo.",
            keyWord: "WISH",
            gapped: "I ___ visited Tokyo at some point.",
            accept: ["really wish I had", "wish I had", "wish that I had", "really wish that I had"]
          },
          {
            id: 29,
            original: "I'm not surprised that the project failed; the planning was completely inadequate.",
            keyWord: "WONDER",
            gapped: "It ___ , given how inadequate the planning was.",
            accept: ["is no wonder the project failed", "is no wonder that the project failed", "comes as no wonder the project failed", "comes as no wonder that the project failed"]
          },
          {
            id: 30,
            original: "She was so tired that she could hardly keep her eyes open.",
            keyWord: "EXHAUSTION",
            gapped: "Such ___ that she could hardly keep her eyes open.",
            accept: ["was her exhaustion"]
          }
        ]
      },

      // ───────── PART 5 (Q31-36) — long-text MCQ (4 options A-D) ─────────
      {
        partNumber: 5,
        type: "long-text-mcq",
        instruction: "You are going to read an article about original thought. For questions 31–36, choose the answer (A, B, C or D) which you think fits best according to the text.",
        title: "On the difficulty of original thought",
        passage:
          "For most of my adult life, I have been quietly suspicious of people who claim to have arrived, after long reflection, at an idea genuinely their own. The longer I have spent reading, listening and writing, the more convinced I have become that almost nothing we believe is truly ours. Our opinions are inherited from teachers, parents, half-remembered articles, lyrics, novels, and conversations whose origin we have long since forgotten. The illusion of independence is itself, in many cases, simply an indication that we have read widely enough to lose track of where each fragment came from.\n\nThat this view is itself unoriginal is, of course, the joke at the heart of the argument. Nietzsche made it; so, in his own way, did Borges, who once wrote with characteristic mischief that every writer creates his own precursors. To say so is hardly to discover a new continent. And yet the recognition has consequences which are not, I think, sufficiently appreciated, particularly in our current moment.\n\nThe first consequence is humility. If almost every idea I encounter in my own head has reached me through the patient work of others, then I owe a great deal more than I usually admit. The proper response to a sudden insight, in this view, is not pride but gratitude: an acknowledgement that the insight has been waiting in the language for a long time and merely happens to have arrived in my particular brain on a particular afternoon.\n\nA second consequence is a degree of suspicion towards strong claims of innovation. The figure of the entirely original thinker, working alone, owing nothing to anyone, is a Romantic invention, and a misleading one. Almost all the great moments of intellectual change have, on close inspection, been collective. Newton, who memorably claimed to have stood on the shoulders of giants, was not being particularly modest; he was being accurate. The history of science, like the history of the arts, is far better described as a long and overlapping conversation than as a series of solo performances.\n\nIt does not follow, of course, that nothing new is possible. New combinations of old material are made every day, and some of them genuinely matter. The novelist who notices a connection between two well-known feelings, or the scientist who proposes a small but unexpected experiment, has done something that did not exist a moment before. But these are recombinations, not eruptions. They are best understood as continuations of a conversation that began long before we joined it and will continue long after we have left.\n\nThis view of thought has a particular relevance now, in an age in which we are surrounded by tools — algorithmic recommendation systems, chatbots, the silent guidance of search engines — whose explicit purpose is to feed us, very cheaply, the next plausible idea. It would be naive to suggest that these tools have made original thought harder; the difficulty of original thought is far older than any technology. What they have made harder, perhaps, is recognising that the ideas we receive from them are the ideas of others, presented in the seamless first-person singular of our own internal voice.\n\nThe remedy, if there is one, is the slowest of intellectual exercises: tracing each interesting idea back to where one first encountered it, and giving credit, even silently, to those one has borrowed from. The aim is not academic accuracy. The aim is the small psychological shift from believing that one has had an insight to noticing that one has been given one. Done consistently, this practice has, in my experience, two effects. It makes one a great deal kinder to the people one is reading, because one realises how much of one's mind they have furnished. And it makes one rather quieter, in arguments, since the strong feeling that an idea is \"obviously\" right turns out, quite often, to be the strong feeling of having heard it many times before.\n\nWhether this exercise produces anything that could be called originality is a question I now find less interesting than I used to. What I am sure of is that it produces something rarer and, in the end, more useful: the patience to listen for the difference between an opinion that one has chosen and one that has merely settled.",
        questions: [
          {
            id: 31,
            prompt: "What is the writer's main claim in the first paragraph?",
            options: [
              { letter: "A", text: "Most people are remarkably good at remembering where they first heard an idea." },
              { letter: "B", text: "Apparent intellectual independence is often only the result of having forgotten one's sources." },
              { letter: "C", text: "Almost no thinker in the modern era has been truly intellectually independent." },
              { letter: "D", text: "The writer is among the first to have noticed how dependent our opinions are." }
            ],
            correct: "B"
          },
          {
            id: 32,
            prompt: "By acknowledging that his own argument is unoriginal, the writer is mainly:",
            options: [
              { letter: "A", text: "demonstrating an unexpected weakness in his position." },
              { letter: "B", text: "showing that the argument has stronger philosophical authority than first appears." },
              { letter: "C", text: "making a deliberately self-aware joke that supports his point." },
              { letter: "D", text: "admitting that he has nothing new to say and offering apology in advance." }
            ],
            correct: "C"
          },
          {
            id: 33,
            prompt: "According to the third paragraph, the appropriate reaction to a new idea is:",
            options: [
              { letter: "A", text: "careful checking of its accuracy before sharing it with others." },
              { letter: "B", text: "gratitude towards the people whose work made it possible." },
              { letter: "C", text: "a private feeling of pride balanced by public modesty." },
              { letter: "D", text: "caution about claims of intellectual originality." }
            ],
            correct: "B"
          },
          {
            id: 34,
            prompt: "Newton's famous remark about \"standing on the shoulders of giants\" is presented in paragraph 4 as:",
            options: [
              { letter: "A", text: "an example of unusual modesty in scientific writing." },
              { letter: "B", text: "a more or less literal description of how knowledge develops." },
              { letter: "C", text: "a statement that has often been misunderstood by historians of science." },
              { letter: "D", text: "a piece of polite formality with little serious meaning." }
            ],
            correct: "B"
          },
          {
            id: 35,
            prompt: "In paragraph 6, the writer suggests that modern tools such as algorithms:",
            options: [
              { letter: "A", text: "have made it almost impossible for individuals to think for themselves." },
              { letter: "B", text: "blur the distinction between our ideas and ideas we have absorbed from elsewhere." },
              { letter: "C", text: "are the main reason that genuine intellectual change has slowed down." },
              { letter: "D", text: "should be avoided altogether by anyone who hopes to think originally." }
            ],
            correct: "B"
          },
          {
            id: 36,
            prompt: "The writer's recommended exercise of tracing ideas to their sources mainly produces:",
            options: [
              { letter: "A", text: "a more accurate scholarly approach to citation and quotation." },
              { letter: "B", text: "a stronger sense of one's own originality through careful comparison." },
              { letter: "C", text: "increased respect for those whose ideas one has unconsciously adopted." },
              { letter: "D", text: "a complete loss of confidence in any of one's own opinions." }
            ],
            correct: "C"
          }
        ]
      },

      // ───────── PART 6 (Q37-43) — gapped text (7 paragraphs removed, 8 options A-H) ─────────
      {
        partNumber: 6,
        type: "gapped-text",
        instruction: "You are going to read a personal essay about cold-water swimming. Seven paragraphs have been removed from the article. Choose from the paragraphs A–H the one which fits each gap (37–43). There is one extra paragraph which you do not need to use.",
        title: "Cold mornings",
        text:
          "Three years ago, on the first of January, I waded fully clothed into the sea outside my front door. It was four degrees Celsius, and the air was even colder. I remember almost nothing about the fifteen seconds I spent in the water. What I remember instead is the long minute afterwards, sitting on a stone wall in a borrowed towel, when I realised that I had never felt more present in my own life.\n\n___1___\n\nThe change had been a long time coming. For most of the previous winter I had been struggling with what my doctor had described, with characteristic optimism, as \"low energy\". I had tried the usual remedies — running, vitamins, an early bedtime — and none of them had had any noticeable effect. A friend, who had been swimming in the sea throughout her own difficult year, suggested that I should join her on New Year's Day. I agreed mainly to be polite.\n\n___2___\n\nBy the time the cold of February arrived, however, I had been in the water more than a dozen times, and something in me had quietly shifted. I no longer needed to be persuaded; on most mornings, I was awake before my alarm, slightly excited about getting wet.\n\n___3___\n\nSea swimming, it turns out, is now extraordinarily popular. In the village where I live, the tiny car park beside the beach is, in winter, almost as full at seven on a Saturday morning as it is in the middle of August. My friend tells me that there is even a waiting list to join the local swimming group. The women in particular seem to have taken to it with extraordinary enthusiasm.\n\n___4___\n\nThere are explanations of various kinds — physiological, psychological, social — and I am sure that all of them have some truth to them. The cold water does, in fact, do something measurable to the body's stress system. The discipline of doing something difficult before breakfast probably helps. And there is no doubt that the small, friendly community of swimmers we have formed has been good for many of us.\n\n___5___\n\nFor me, however, the deepest reason is something rather harder to name. Standing in cold water seems to bring an unusually clear sense of being alive — not in an abstract or metaphorical way, but in the most basic physical sense of the term. The body is suddenly there, demanding attention. Worries about tomorrow disappear, because tomorrow does not, for the moment, matter; the only thing that matters is the next breath.\n\n___6___\n\nThis is not, I think, the same thing as the kind of \"mindfulness\" one is sold on retreats. It is much more obvious and much less polite. The cold does not invite you to notice your breathing; it forces you. There is no possibility of being elsewhere.\n\n___7___\n\nI no longer treat the morning swim as therapy. It is simply, by now, a part of how I begin the day, like brushing my teeth. The most striking thing, however, is that I no longer particularly wish I were the person I was three years ago. That is a small change, but, as far as I am concerned, it is the only change that really matters.",
        // 8 options A-H; 7 are correct (one per gap), 1 is a distractor
        options: [
          { letter: "A", text: "Whether it is also doing something to the rest of me, I am no longer entirely sure I need to know." },
          { letter: "B", text: "The first month was, frankly, awful. I did not enjoy a single moment of being in the water, and I was unable to explain to anyone, including myself, why I kept turning up." },
          { letter: "C", text: "None of these explanations, however, quite captures the reason I keep going back, even on mornings when the rain is sideways and the wind feels almost personally hostile." },
          { letter: "D", text: "Even now, three years later, I cannot quite believe what I am about to tell you, and I cannot in honesty recommend that you should try the same thing." },
          { letter: "E", text: "People often ask me, when they hear about the habit, what the appeal could possibly be." },
          { letter: "F", text: "I had also recently moved to a new town and found it quite hard to make friends." },
          { letter: "G", text: "I had thought it would be a single, mildly silly experience that would make a good story for the rest of January." },
          { letter: "H", text: "There is, perhaps, a similar appeal in fasting, which I tried briefly some years ago and then abandoned." }
        ],
        gaps: [
          { id: 37, correct: "G" },
          { id: 38, correct: "B" },
          { id: 39, correct: "D" },
          { id: 40, correct: "E" },
          { id: 41, correct: "C" },
          { id: 42, correct: "A" },
          { id: 43, correct: "H" }
        ]
      },

      // ───────── PART 7 (Q44-53) — multiple matching (10 Q to 4 sections A-D) ─────────
      {
        partNumber: 7,
        type: "multiple-matching",
        instruction: "You are going to read four short articles in which adults reflect on a period of returning to live with their parents. For questions 44–53, choose from the writers (A–D). The writers may be chosen more than once.",
        topic: "Four people share their experience of returning to live with their parents in adult life",
        sections: [
          {
            letter: "A",
            title: "Tomas (35) — returned at 32 for 18 months",
            body: "I had been living abroad for nine years when I came back to my parents' house at the age of thirty-two, technically for two months while I looked for a flat in my home city. I stayed for eighteen. The strangeness of the experience was less about practicalities than about identity. I had not been treated like a son for nearly a decade, and the change was, at first, almost insulting. My mother began doing my washing within the first week, and I let her, despite knowing that this was an act of mutual surrender. I left in the end not because I disliked it, but because I noticed that I was beginning to enjoy it more than was probably healthy. I was sleeping better than I had since university and was, I think, becoming slightly less ambitious without having decided to."
          },
          {
            letter: "B",
            title: "Mia (29) — returned at 27, still there",
            body: "My return home was financial and entirely unsentimental. I had a perfectly good job, but the rent in the city where I worked had risen by about forty per cent in three years, and I could no longer save anything. My parents were polite about the arrangement at the start; the longer it has gone on, the more relaxed everyone has become. We pay attention to each other in a way that did not happen during my teenage years, partly because I now ask my mother about her work in a way I never did when I lived here as a child. The biggest surprise is that I no longer find it embarrassing to admit that I live with them. Most of my colleagues, I have realised, would do the same if their families were close enough."
          },
          {
            letter: "C",
            title: "Vikram (42) — returned at 39 for one year",
            body: "I came home, in my late thirties, to look after my father in the months after his stroke. The first few weeks were physically demanding — helping him out of bed, supervising medication, learning the strange small rituals of recovery — and I was, frankly, frightened. By the second month I had become more practised, and our days began to develop a shape. We watched a great deal of cricket, talked more than we ever had during my childhood, and slowly, very slowly, I noticed that what had originally felt like a burden had become a privilege. He died eighteen months later, and I returned to my own life. The year I had spent in his house was, I think, the most important of my adult life. By the end, I had developed a closeness with him that I had never expected to have, after years of being closer to my mother."
          },
          {
            letter: "D",
            title: "Sara (31) — returned at 30 for six months",
            body: "I returned home to my parents at thirty, after the end of a long relationship. I had told my friends that I needed somewhere to stay 'for a few weeks', mostly to save face, although in truth I had nowhere else to go. The whole arrangement was supposed to be quiet and temporary. What I had not anticipated was the degree to which my parents had a fully formed adult life of their own — friends I had never met, weekend trips I knew nothing about, a small dog I disliked at first and now miss daily. I had to fit around them, rather than the other way around. By the end of the six months, I think I respected them, in a serious adult sense, for the first time."
          }
        ],
        questions: [
          { id: 44, prompt: "Who admits to misleading their friends about their reasons for returning home?",                                              correct: "D" },
          { id: 45, prompt: "Who returned mainly because of a serious financial pressure?",                                                                correct: "B" },
          { id: 46, prompt: "Who developed a much closer relationship with the parent they had previously been less close to?",                            correct: "C" },
          { id: 47, prompt: "Who recognises that the situation gradually shifted from temporary to comfortable in a way they consider potentially unhealthy?", correct: "A" },
          { id: 48, prompt: "Who acknowledges that they once felt the experience was emotionally overwhelming?",                                            correct: "C" },
          { id: 49, prompt: "Who came to see their parents as having an independent life of their own?",                                                    correct: "D" },
          { id: 50, prompt: "Who feels that the shared experience strengthened communication that had not really existed in the past?",                    correct: "B" },
          { id: 51, prompt: "Who points out that this kind of arrangement is more common than people often admit?",                                         correct: "B" },
          { id: 52, prompt: "Who describes a development they made in being able to do everyday physical tasks more confidently?",                          correct: "C" },
          { id: 53, prompt: "Who suggests that the experience has changed their attitude to ambition?",                                                     correct: "A" }
        ]
      }
    ]
  },

  writing: {
    parts: [

      // ───────── WRITING PART 1 (Q54) — compulsory summary essay (240-280 words, based on TWO short input texts) ─────────
      {
        partNumber: 8,                // continuous internal numbering after 7 reading parts
        writingPartNumber: 1,
        type: "summary-essay",
        taskType: "Essay",
        instruction: "Read the two texts below. Write an essay summarising and evaluating the key points from BOTH texts. Use your own words throughout as far as possible, and include your own ideas in your answer.",
        inputTexts: [
          {
            id: 1,
            title: "Text 1 — The case for hands-on learning",
            body: "Universities have, for too long, been driven by an obsession with theory at the expense of practical competence. Students leave with a sound grasp of abstractions but with little idea of how to function in the workplace they enter. Programmes that include extended internships, real client projects and structured contact with employers consistently produce graduates who report higher confidence and find work more quickly. The traditional defence of pure theoretical study — that it 'teaches you to think' — is increasingly difficult to support."
          },
          {
            id: 2,
            title: "Text 2 — Why theory still matters",
            body: "The greatest risk in shifting universities towards narrow vocational training is that we may, without realising it, be educating people for jobs that will not exist by the time they graduate. The world's most adaptable workers are those who have been trained to think systematically, to understand the structure of an unfamiliar problem, and to absorb new technical knowledge quickly. These habits of mind are formed by sustained engagement with theory, not by short courses on the latest software. Practical skills age. Theoretical understanding does not."
          }
        ],
        taskPrompt: "Write your essay in 240–280 words.",
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
            id: "article",
            taskType: "Article",
            heading: "Question 2 — Article",
            prompt:
              "You see this announcement in an English-language magazine:\n\nARTICLES WANTED\n\nWhat does it mean to be a 'good neighbour' in the twenty-first century? In an age of busy lives, online communities, and increased mobility, are the rules different from what they were a generation ago? Send us your reflections.\n\nThe most thoughtful articles will be published in our December issue.\n\nWrite your article."
          },
          {
            id: "report",
            taskType: "Report",
            heading: "Question 3 — Report",
            prompt:
              "As a member of the student council at your university, you have been asked by the head of the institution to prepare a report on the social and academic experience of first-year students. Your report should describe the most common difficulties faced by first-year students, suggest practical changes the university could introduce, and identify the change you believe would have the greatest impact.\n\nWrite your report."
          },
          {
            id: "review",
            taskType: "Review",
            heading: "Question 4 — Review",
            prompt:
              "You see this notice on an English-language website for international book lovers:\n\nREVIEWS WANTED\n\nWe are looking for reviews of a long, demanding book — fiction or non-fiction — that you have recently finished. Tell us briefly what the book is about, evaluate the reading experience and the writing itself, and explain whether you believe the time it took to read was justified.\n\nWrite your review."
          }
        ],
        wordMin: 280,
        wordMax: 320,
        scoringRubric:
          "Award full marks if the candidate has chosen ONE option, fully matched its expected register and conventions (article: engaging tone + clear opinion + reflective depth; report: clear sections / signposting + analysis + concrete recommendations; review: critical evaluation + balanced judgement + recommendation grounded in evidence), used C2-appropriate vocabulary, demonstrated a wide and confident range of grammatical structures (including inversion, advanced passives, hypotheticals), and written 280–320 words. Penalise off-topic content, mixing tasks, wrong register, or fewer than 280 words."
      }
    ]
  }
};
