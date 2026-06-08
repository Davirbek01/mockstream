// Cambridge PET (Preliminary English Test) for Schools — Reading — Test 1
// VERBATIM transcription from "Preliminary English Test for Schools 1" (Cambridge UP, 2010).
// Paper 1 Reading: 5 parts, 35 questions, ~50 minutes (Reading half of the combined R&W paper).
// Source pages: Test 1 R&W = pp.12-20; answer key = p.113.

window.PET_R_TEST = {
  testInfo: {
    id: "pet-r-01",
    title: "PET Reading — Test 1",
    paper: "Paper 1 · Reading",
    level: "B1",
    totalTime: 50,
    totalQuestions: 35,
    parts: 5
  },

  parts: [
    // ───────────────────────────────── PART 1 ─────────────────────────────────
    {
      partNumber: 1,
      label: "PART 1",
      questionsLabel: "QUESTIONS 1–5",
      type: "sign-mcq",
      instruction: [
        "Look at the text in each question.",
        "What does it say?",
        "Mark the correct letter A, B or C on your answer sheet."
      ],
      example: {
        number: 0,
        prompt: "LOST FLOPPY DISC — Lost on Tuesday - contains important schoolwork. Hand in to office.",
        answer: "A",
        image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test1/q0.png",
        options: [
          { letter: "A", text: "Go to the office if you have lost a floppy disc." },
          { letter: "B", text: "Make sure all schoolwork is given in on floppy disc to the office." },
          { letter: "C", text: "If you have found a floppy disc, please leave it at the office." }
        ]
      },
      items: [
        {
          id: 1, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test1/q1.png",
                    prompt: " ",
          options: [
            { letter: "A", text: "Lost locker keys can be replaced for a charge of 6€." },
            { letter: "B", text: "You cannot collect your locker key until you have paid a 6€ deposit." },
            { letter: "C", text: "We cannot return your 6€ deposit if you lose your locker key." }
          ],
          answer: "C"
        },
        {
          id: 2, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test1/q2.png",
                    prompt: " ",
          options: [
            { letter: "A", text: "Hannah has got a purple 'Fast Boys' T-shirt and wants one in another colour." },
            { letter: "B", text: "Hannah would rather have a purple 'Fast Boys' T-shirt if possible." },
            { letter: "C", text: "Hannah only wants a 'Fast Boys' T-shirt if it's a purple one." }
          ],
          answer: "B"
        },
        {
          id: 3, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test1/q3.png",
                    prompt: "What has changed about Class 5's party?",
          options: [
            { letter: "A", text: "the time" },
            { letter: "B", text: "the place" },
            { letter: "C", text: "the refreshments" }
          ],
          answer: "B"
        },
        {
          id: 4, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test1/q4.png",
                    prompt: "Mum is writing to",
          options: [
            { letter: "A", text: "tell Becky to stay at home to see her aunt." },
            { letter: "B", text: "ask Becky to tidy the house before she leaves." },
            { letter: "C", text: "remind Becky to go to her aunt's house." }
          ],
          answer: "B"
        },
        {
          id: 5, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test1/q5.png",
                    prompt: "The school fitness centre will",
          options: [
            { letter: "A", text: "change its opening hours at the end of August." },
            { letter: "B", text: "have shorter opening hours until the end of August." },
            { letter: "C", text: "open again to students at the end of August." }
          ],
          answer: "A"
        }
      ]
    },

    // ───────────────────────────────── PART 2 ─────────────────────────────────
    {
      partNumber: 2,
      label: "PART 2",
      questionsLabel: "QUESTIONS 6–10",
      type: "match-people-texts",
      instruction: [
        "The young people below all want to do an art course during their school holidays.",
        "On the opposite page there are descriptions of eight short art courses.",
        "Decide which course would be the most suitable for the following people.",
        "For questions 6–10, mark the correct letter (A–H) on your answer sheet."
      ],
      textsTitle: "Short Art Courses",
      items: [
        { id: 6, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test1/p6.jpg", name: "Alice",  description: "Alice wants a course to help her with her drawing skills, particularly with drawing the latest styles of clothes, shoes and bags, because she wants to study this later at college.", answer: "E" },
        { id: 7, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test1/p7.jpg", name: "Darius", description: "Darius loves making comic books, but isn't confident about his drawing. He wants to draw superheroes and animals and create adventures about them, but doesn't want to display his work.", answer: "C" },
        { id: 8, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test1/p8.jpg", name: "Cassie", description: "Cassie enjoys making pictures and objects from different materials. During the course she'd like to use her love of sport in her designs, and visit an exhibition to get new ideas.", answer: "B" },
        { id: 9, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test1/p9.jpg", name: "Marc",   description: "Marc is talented at drawing, but also likes filming his friends on an old digital camera. He wants to develop this skill by learning to use more advanced equipment, and prepare for further study.", answer: "D" },
        { id: 10, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test1/p10.jpg", name: "Harry",  description: "Harry has done a course about printing on paper, and would like to learn how to print on other materials. He also wants to produce something to take home and wear.", answer: "H" }
      ],
      texts: [
        { letter: "A", title: "Wild Art",     body: "This course concentrates on teaching drawing and painting, and you'll use your new skills to make a wall poster on the theme of animals, to take home. And we've got lots of picture books from galleries around the world to give you ideas! There'll be an exhibition of everyone's work at the end, too." },
        { letter: "B", title: "Colourscape",  body: "Come and make a bag to keep your school games clothes in! We supply lots of colourful wool and printed cotton — you choose the design and colour (like your favourite football or hockey team colours!). There'll also be a trip to a gallery to help you get creative in your designs." },
        { letter: "C", title: "Create!",      body: "This course is all about telling good stories in pictures. We'll be cartoon films to watch, and instruction in how to draw your favourite characters — but your imagination is much more important than your drawing skills here! The course includes a visit to a cartoon museum." },
        { letter: "D", title: "Art Attack",   body: "You'll work on developing creative skills, like printing, photography, cartoons and movie-making, using the latest technology. This course is great for anyone wanting to take these subjects at college. Good drawing skills are helpful on this course, and students' work will be put into a book, where suitable, for everyone to buy." },
        { letter: "E", title: "Art Matters",  body: "This course will concentrate on different drawing techniques, including using inks and colour. We'll get you to draw live models wearing designer fashions and sportswear — so if you like designing fashion and think your future is in this area, then this course is for you!" },
        { letter: "F", title: "Art Magic",    body: "This fun course shows you how to design and make fashion jewellery from natural materials, and particularly how to use photography to help you get ideas for your designs. So if you have your own camera, bring it along!" },
        { letter: "G", title: "Arts Centre",  body: "Ever wondered what your comic stories would look like on film? Here's your chance to find out! Bring along your own comic drawings or prints — good quality ones if possible — and we'll transfer the action from your page onto the screen! Film show of the best cartoons at the end!" },
        { letter: "H", title: "Rainbow",      body: "Bring along a clean white T-shirt for this fun course! Using printing inks and paints, we'll show you how to transfer a picture onto your T-shirt and create a special artwork that you can put on for everyone to admire!" }
      ]
    },

    // ───────────────────────────────── PART 3 ─────────────────────────────────
    {
      partNumber: 3,
      label: "PART 3",
      questionsLabel: "QUESTIONS 11–20",
      type: "true-false",
      instruction: [
        "Look at the sentences below about a family trip to see dolphins.",
        "Read the text on the opposite page to decide if each sentence is correct or incorrect.",
        "If it is correct, mark A on your answer sheet.",
        "If it is not correct, mark B on your answer sheet."
      ],
      passageImage: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test1/passage3.jpg",
      passageTitle: "Dolphin Trip",
      passageSubtitle: "By Paul Hannan",
      passage:
        "My family have always been huge fans of New Zealand — my mum comes from the capital — so we saved up and went for a holiday there. We started with a week in the city she grew up in. After that, we toured around for a while before ending up by chance in Kaikoura, a small town on the coast. The first evening it seemed a rather dull place, but the next day I remembered what I'd read about it — that it was often possible to see dolphins and whales there! I'll always think of Kaikoura as the place where I finally achieved my lifelong ambition — to swim with wild dolphins.\n\n" +
        "My family and I set off on a dolphin trip on a cold, grey day with a number of other people on a small boat. However, the sky soon turned blue, and we raced across the waves in the sunshine until we finally reached the place where we were supposed to go swimming. To my surprise, this was more than 40 km from land. I was quite cold by this time, and really starting to wonder why my family had made me come all the way out there, when suddenly someone shouted 'Dolphins!'.\n\n" +
        "All I could see were fins everywhere — there were more than a hundred dolphins, all swimming towards our boat! Many of them were jumping around in the water as if they were asking us to come and play. I put on my snorkel and jumped into the sea. Everywhere I looked, all I could see was dolphins, swimming under me and round me. Then I remembered the guide had told us to make sounds in the water to attract them. So I did and actually heard them making similar sounds, as if they were trying to answer me. I even made eye contact with one dolphin, and watched it carefully as I swam round in a circle. Amazingly, the dolphin almost followed me, but then changed its mind, although it kept eye contact with me all the time. It really made me realise how intelligent and beautiful these creatures are.\n\n" +
        "Then after an hour of swimming the guides called us to get back onto the boat. Although I had enjoyed myself, I was keen to leave the water by then as I was very cold. As I got dry I noticed that everyone on board was smiling and I realised what a very special moment we'd had.\n\n" +
        "I'll never forget that experience, and Kaikoura will always have a special place in my heart.",
      items: [
        { id: 11, statement: "Paul has family connections with the place he first visited in New Zealand.", answer: "A" },
        { id: 12, statement: "Paul and his family chose to go to Kaikoura as part of their tour.",         answer: "B" },
        { id: 13, statement: "As soon as Paul arrived in Kaikoura he knew he might see some dolphins there.", answer: "B" },
        { id: 14, statement: "The weather got worse during Paul's boat trip.",                            answer: "B" },
        { id: 15, statement: "Paul had expected to go swimming closer to land.",                          answer: "A" },
        { id: 16, statement: "Paul was beginning to feel unhappy about the trip until someone saw the dolphins.", answer: "A" },
        { id: 17, statement: "Paul believed the dolphins were inviting him to join them in the water.",   answer: "A" },
        { id: 18, statement: "Paul felt that he had failed to communicate with the dolphins.",            answer: "B" },
        { id: 19, statement: "One dolphin copied exactly what Paul did in the water.",                    answer: "B" },
        { id: 20, statement: "Paul was pleased when the guides finally called them back onto the boat.",  answer: "A" }
      ]
    },

    // ───────────────────────────────── PART 4 ─────────────────────────────────
    {
      partNumber: 4,
      label: "PART 4",
      questionsLabel: "QUESTIONS 21–25",
      type: "passage-mcq",
      instruction: [
        "Read the text and questions below.",
        "For each question, mark the correct letter A, B, C or D on your answer sheet."
      ],
      passageTitle: "One to watch!",
      passageSubtitle: "Essay by Jessica Bourne, aged 14",
      passage:
        "I'm a big fan of films featuring the spy James Bond. I've got most of them on DVD. We've recently bought Quantum of Solace, in which Daniel Craig plays the part of Bond. I don't know why the film's got that name — but it's a great movie, anyway.\n\n" +
        "All the actors who've played James Bond have been great, but Daniel Craig, who's made lots of other films, plays the part better than any of them. Even though he doesn't talk very much, I think he's the most perfect actor for the role. He even does a few of the more dangerous things in the film himself, instead of getting someone else to do them. I did wonder sometimes whether he'd be clever enough to defeat the bad people — but I'm not going to tell you the ending! The actress who stars with Craig gives a fantastic performance too — I loved all the glamorous clothes she wore!\n\n" +
        "The director probably had a hard job making this Bond film as full of action as earlier ones. But the excitement starts right at the beginning here, with a car chase along a mountain road, and plenty of other thrilling scenes, too — Bond leaping off tall buildings and so on. Unfortunately I found the story difficult to follow in places, and it also seemed to be over very quickly — it lasted under two hours. I also felt there weren't as many jokes as in the old Bond films. And where was all the ridiculous Bond equipment — the underwater car or exploding watch that everyone laughed at? This is a more serious, darker Bond film, but I still really enjoyed it.",
      items: [
        {
          id: 21, prompt: "What is Jessica trying to do in her essay?",
          options: [
            { letter: "A", text: "explain what first attracted her to Bond films" },
            { letter: "B", text: "tell readers about the Bond DVDs she owns" },
            { letter: "C", text: "give a balanced view of a Bond film she has seen" },
            { letter: "D", text: "describe how Daniel Craig got the part of James Bond" }
          ],
          answer: "C"
        },
        {
          id: 22, prompt: "What can a reader find out from Jessica's essay?",
          options: [
            { letter: "A", text: "whether Quantum of Solace is her favourite Bond film" },
            { letter: "B", text: "what other films Daniel Craig has made" },
            { letter: "C", text: "which other actors have played James Bond" },
            { letter: "D", text: "whether she thinks Daniel Craig is the best James Bond" }
          ],
          answer: "B"
        },
        {
          id: 23, prompt: "What does Jessica tell us about Craig in the new Bond film?",
          options: [
            { letter: "A", text: "He performs some of the action scenes." },
            { letter: "B", text: "He wears some stylish clothes." },
            { letter: "C", text: "He is given a lot of lines to say." },
            { letter: "D", text: "He looks strong and fit enough to fight the criminals." }
          ],
          answer: "A"
        },
        {
          id: 24, prompt: "What is one problem with the film, according to Jessica?",
          options: [
            { letter: "A", text: "It seems a bit too long." },
            { letter: "B", text: "It's sometimes hard to understand what's happening." },
            { letter: "C", text: "It has too much silly technology in it." },
            { letter: "D", text: "It has jokes that aren't very funny." }
          ],
          answer: "B"
        },
        {
          id: 25, prompt: "Which of these might appear in a magazine review of the new Bond film?",
          options: [
            { letter: "A", text: "It's full of excitement, with Bond jumping across rooftops, so don't be disappointed by the slow start." },
            { letter: "B", text: "The director wanted to move away from the last Bond film and include a bit less action." },
            { letter: "C", text: "I'm not sure the title tells you much . . . but be prepared to watch a rather different kind of Bond movie." },
            { letter: "D", text: "Daniel Craig performed well as James Bond, but the main female star was disappointing." }
          ],
          answer: "C"
        }
      ]
    },

    // ───────────────────────────────── PART 5 ─────────────────────────────────
    {
      partNumber: 5,
      label: "PART 5",
      questionsLabel: "QUESTIONS 26–35",
      type: "passage-cloze",
      instruction: [
        "Read the text below and choose the correct word for each space.",
        "For each question, mark the correct letter A, B, C or D on your answer sheet."
      ],
      example: {
        number: 0,
        prompt: "A which   B where   C who   D what",
        answer: "B"
      },
      passageTitle: "New Home – New School",
      passageSubtitle: "by Megan Williams, aged 13",
      passage:
        "Last year my Dad got a new job. It was in a town (0) ___ was 100 kms from our home. Mum and Dad (26) ___ we would have to move, because it was a long way for Dad to (27) ___ every day.\n\n" +
        "When they (28) ___ me about their plan I was upset (29) ___ . I loved my home and school. I was worried that I would (30) ___ all my friends and teachers a lot.\n\n" +
        "Anyway, six months (31) ___ that, my family moved to the town of Hexford. The house was much bigger than our old one, and (32) ___ my bedroom window I (33) ___ see the sea.\n\n" +
        "I wasn't looking forward to the first day at my new school. I felt really (34) ___ about meeting lots of new people. But when I got there everyone was great! My class teacher was nice and I (35) ___ friends with two girls in my class. Moving home isn't that bad, after all!",
      items: [
        { id: 26, options: [ { letter: "A", text: "chose" },     { letter: "B", text: "decided" },      { letter: "C", text: "selected" }, { letter: "D", text: "picked" } ],     answer: "B" },
        { id: 27, options: [ { letter: "A", text: "transport" }, { letter: "B", text: "carry" },         { letter: "C", text: "tour" },     { letter: "D", text: "travel" } ],     answer: "D" },
        { id: 28, options: [ { letter: "A", text: "said" },      { letter: "B", text: "spoke" },         { letter: "C", text: "told" },     { letter: "D", text: "explained" } ],  answer: "C" },
        { id: 29, options: [ { letter: "A", text: "because" },   { letter: "B", text: "so" },            { letter: "C", text: "but" },      { letter: "D", text: "and" } ],        answer: "A" },
        { id: 30, options: [ { letter: "A", text: "forget" },    { letter: "B", text: "lose" },          { letter: "C", text: "leave" },    { letter: "D", text: "miss" } ],       answer: "D" },
        { id: 31, options: [ { letter: "A", text: "further" },   { letter: "B", text: "after" },         { letter: "C", text: "next" },     { letter: "D", text: "later" } ],      answer: "B" },
        { id: 32, options: [ { letter: "A", text: "down" },      { letter: "B", text: "along" },         { letter: "C", text: "from" },     { letter: "D", text: "away" } ],       answer: "C" },
        { id: 33, options: [ { letter: "A", text: "shall" },     { letter: "B", text: "could" },         { letter: "C", text: "must" },     { letter: "D", text: "would" } ],      answer: "B" },
        { id: 34, options: [ { letter: "A", text: "nervous" },   { letter: "B", text: "disappointed" },  { letter: "C", text: "angry" },    { letter: "D", text: "bored" } ],      answer: "A" },
        { id: 35, options: [ { letter: "A", text: "knew" },      { letter: "B", text: "found" },         { letter: "C", text: "made" },     { letter: "D", text: "met" } ],        answer: "C" }
      ]
    }
  ]
};
