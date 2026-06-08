// Cambridge PET (Preliminary English Test) for Schools — Reading — Test 4
// VERBATIM transcription from "Preliminary English Test for Schools 1" (Cambridge UP, 2010).
// Paper 1 Reading: 5 parts, 35 questions, ~50 minutes.
// Source pages: Test 4 = pp.72-80; answer key = p.141.

window.PET_R_TEST = {
  testInfo: {
    id: "pet-r-04",
    title: "PET Reading — Test 4",
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
        answer: "A"
      },
      items: [
        {
          id: 1, style: "message",
          noticeTitle: "From: Miss Phelps  ·  To: Class 9",
          noticeText: "Sorry – there are no theatre tickets left. Anyone who's ordered a ticket but not given me the money yet has until tomorrow to do so.",
          prompt: " ",
          options: [
            { letter: "A", text: "You can order your tickets for the trip tomorrow." },
            { letter: "B", text: "Reserved tickets must be paid for by tomorrow." },
            { letter: "C", text: "You should return unwanted tickets to Miss Phelps tomorrow." }
          ],
          answer: "B"
        },
        {
          id: 2, style: "note",
          noticeTitle: "Nick,",
          noticeText: "Your swimming teacher called about this week's lesson. It'll be on Tuesday, not Thursday as it usually is. It's still at 6 o'clock, but we'll have to leave earlier – by 5.30.",
          noticeSig: "Dad",
          prompt: " ",
          options: [
            { letter: "A", text: "Nick's lesson will be on Tuesdays from now on." },
            { letter: "B", text: "The time of Nick's lesson has changed." },
            { letter: "C", text: "Nick's lesson this week is at the same time on a different day." }
          ],
          answer: "C"
        },
        {
          id: 3, style: "formal",
          noticeTitle: "HIGHCLIFFE SCHOOL GALLERY",
          noticeText: "TAKING PHOTOS OF THE ART DISPLAYED HERE IS NOT PERMITTED",
          prompt: " ",
          options: [
            { letter: "A", text: "You are not allowed to remove any of the pictures here." },
            { letter: "B", text: "You are not allowed to display any of your photos here." },
            { letter: "C", text: "You are not allowed to use your camera here." }
          ],
          answer: "C"
        },
        {
          id: 4, style: "sign",
          noticeText: "After inserting CD, wait for computer to load it before clicking on 'start'.",
          prompt: "What should you do?",
          options: [
            { letter: "A", text: "Insert CD, click on 'start' and then wait." },
            { letter: "B", text: "Click on 'start', insert CD and then wait." },
            { letter: "C", text: "Insert CD, wait and then click on 'start'." }
          ],
          answer: "C"
        },
        {
          id: 5, style: "message",
          noticeTitle: "From: Eve  ·  To: Lara",
          noticeText: "Hi Lara, That video game I borrowed from you was great! I've lent it to Mick. He'll give it back to you on Monday. Hope that's OK.",
          noticeSig: "Eve xx",
          prompt: " ",
          options: [
            { letter: "A", text: "Mick will return Lara's computer game to her on Monday." },
            { letter: "B", text: "Lara will give Eve's computer game to Mick on Monday." },
            { letter: "C", text: "Mick and Eve will borrow Lara's computer game on Monday." }
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
        "The young people below all want to do something special this Saturday.",
        "On the opposite page there are descriptions of eight events.",
        "Decide which event would be the most suitable for the following people.",
        "For questions 6–10, mark the correct letter (A–H) on your answer sheet."
      ],
      textsTitle: "Special Events this Saturday",
      items: [
        { id: 6,  name: "Angela",            description: "Angela wants to go out with her younger sister in the evening. They both love learning about wildlife and would like to take part in an organised activity.", answer: "E" },
        { id: 7,  name: "Vic",               description: "Vic would like to go with his friends to listen to several different kinds of music. They also want to be able to buy something to eat.",                       answer: "B" },
        { id: 8,  name: "Beth and her sister", description: "Beth and her twin sister are interested in art and would like to make something which they can take home as a souvenir of their day. They also want a nice place to eat their packed lunch.", answer: "F" },
        { id: 9,  name: "Mike",              description: "Mike wants to spend the day with a couple of friends. They all enjoy water sports and the open air and are also keen on history.",                              answer: "H" },
        { id: 10, name: "Molly and her friend", description: "Molly and her friend are enjoying a school project on the environment and are keen to discover more about this topic. They want to go somewhere where they can spend the day and also get some lunch.", answer: "A" }
      ],
      texts: [
        { letter: "A", title: "Waspbrook Park",      body: "Have fun finding out how you can help save the planet. Learn from the experts who will give entertaining hands-on demonstrations about everything from water saving to energy efficiency. Everything sold in the park's restaurant is made from ingredients from the local area. 10 am – 6 pm." },
        { letter: "B", title: "Silverbank Island",   body: "Travel by boat to an open-air concert in the beautiful surroundings of this unspoilt island. Hear some of the biggest artists from the rock, pop and jazz worlds. There'll be stalls offering a range of international foods. It'll be a truly amazing evening." },
        { letter: "C", title: "Hopelands Hall",      body: "Bring a picnic lunch and relax for the afternoon in lovely landscaped gardens and watch a film. The large outdoor screen is well placed so all the audience can see it clearly. This week's film is the 1960s wildlife classic Born Free. It's a beautiful film which will be popular with young and old alike." },
        { letter: "D", title: "Bramley River Centre", body: "Learn some traditional fishing skills on this popular all-day sports course. You'll learn about different types of environmentally-friendly fishing and will then have the opportunity to try them out yourself. Bring your camera — you'll want a souvenir of your day as any fish you catch must be thrown back in the water!" },
        { letter: "E", title: "Downland Park",       body: "Discover the different types of birds and animals that come out in the evening in the park. Staff have arranged special games to help you find out about these creatures. Hot drinks and tasty snacks will be provided. Don't forget to wear comfortable boots! 8 pm – 10 pm." },
        { letter: "F", title: "The Collins Centre",  body: "In the morning you can visit the centre's large collection of 20th century advertising posters, then spend the afternoon working on your own poster design to print and keep. You can picnic in the centre's spacious gardens while listening to rap songs from local musicians." },
        { letter: "G", title: "Oakwood Manor",       body: "Do you like Brazilian music? Then come along to the all-day 'Samba' workshop at Oakwood Manor. You'll learn to play some cool sounds on the drums, and practise some great dances. A traditional Brazilian lunch is included in the price." },
        { letter: "H", title: "Westsea Castle",      body: "There are lots of things to do in and around the castle during special activity days. Spend half the day sailing and then, after a picnic, go mountain biking. In the evening you can watch a battle for the castle and discover what life was like for a soldier here a thousand years ago." }
      ]
    },

    // ───────────────────────────────── PART 3 ─────────────────────────────────
    {
      partNumber: 3,
      label: "PART 3",
      questionsLabel: "QUESTIONS 11–20",
      type: "true-false",
      instruction: [
        "Look at the sentences below about a trip to an Ocean Centre.",
        "Read the text on the opposite page to decide if each sentence is correct or incorrect.",
        "If it is correct, mark A on your answer sheet.",
        "If it is not correct, mark B on your answer sheet."
      ],
      passageTitle: "A visit to the Ocean Centre",
      passageSubtitle: "by Rebecca Hardy, aged 13",
      passage:
        "My family and I went to the Ocean Centre in my home town recently. It was one of the most amazing places I've ever been. We don't live near the sea, so I don't get much chance to see living sea creatures for myself.\n\n" +
        "Inside the Centre you go on what they call an ocean journey. It takes you from the smallest stream, through rivers, and out into the deepest ocean. Along the way you meet fish and other creatures that live in these places. And there are thousands of them — some pretty and peaceful, and others frightening and deadly.\n\n" +
        "Our guide told us that the Centre was originally set up to help look after the seas and protect the life within them. In fact, every entry ticket bought there helps the Centre to achieve this aim, so I felt my visit was in a good cause.\n\n" +
        "By chance, we arrived just at feeding time and watched staff give food to hundreds of fish. I wanted to do it too, but the staff wouldn't let me. But I'd still really recommend being there at feeding time. You'll see feeding times advertised at the ticket desk, or you can telephone in advance to find out when they are.\n\n" +
        "The most fascinating part of the visit for me was a new exhibition at the Centre that told the story of seahorses across the world. It has the biggest collection of these magical creatures in Europe, and almost as many as one in the USA. I found out about what they ate, and how a male seahorse managed to give birth to 1500 babies! And although our guide told us it was hard to see the young ones, we were lucky enough to catch sight of some in the tank!\n\n" +
        "We also went to one of the Centre's talks about the underwater world. Ours was called 'Sharks', and the one on the following day was called 'Creatures of the Deep'. There are talks on other topics given on different days, so it's best to check which talk will take place on the day you go.\n\n" +
        "Once we'd bought our ticket, we could go in and out of the Centre as many times as we liked during the day. You can also buy an annual pass that gives you unlimited entry all year round. I'm saving up for one!",
      items: [
        { id: 11, statement: "Rebecca Hardy's home is close to the coast.",                                            answer: "B" },
        { id: 12, statement: "At the Ocean Centre, you can see fish from both seas and rivers.",                       answer: "A" },
        { id: 13, statement: "All the creatures that are on display at the Centre are harmless.",                      answer: "B" },
        { id: 14, statement: "The admission fee for the Centre goes towards environmental projects.",                  answer: "A" },
        { id: 15, statement: "Rebecca was allowed to feed the fish at the Centre.",                                    answer: "B" },
        { id: 16, statement: "Rebecca had to book in advance to see the fish at their feeding time.",                  answer: "B" },
        { id: 17, statement: "The Ocean Centre has the largest collection of seahorses in the world.",                 answer: "B" },
        { id: 18, statement: "Rebecca was pleased that she was able to see baby seahorses in the exhibition.",         answer: "A" },
        { id: 19, statement: "Each day, the Centre holds lots of talks on different topics.",                          answer: "B" },
        { id: 20, statement: "Rebecca found she could leave and return to the Centre during her visit without paying again.", answer: "A" }
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
      passageTitle: "Skateboarding",
      passageSubtitle: "by Rachel Martin, aged 11",
      passage:
        "I've practised skateboarding for 18 months now, and I was the youngest person in a street skateboarding competition last year. I spend my free time at my town's new skatepark – I rarely stay at home and watch TV.\n\n" +
        "Before the new skatepark was built this year, the nearest skatepark was in a town 10 km away. Some of my older friends went there, but my mum wouldn't let me go because I wasn't old enough. The only place to skate was on the pavements, but then I fell and injured my arm. I wasn't popular with pedestrians either, so I stopped! Nowadays, though, I can use the new skatepark in the evenings – it's got huge lights, so you can use it even at night.\n\n" +
        "We've got a skatepark at our school now, too. It keeps us fit! The school skatepark is dangerous for smaller children like my little brother, though, as the teenage students also use their rollerskates or ride their BMX bikes there. I guess they prefer it because the skatepark in town is pretty busy.\n\n" +
        "I've always found schoolwork easy, but skateboarding is hard! My favourite trick is jumping over boxes. Doing things like that really makes you concentrate, which is a challenge, but it's something I really enjoy. My older sister works as a skateboard instructor, so one day I'd like to be like her. It's unusual for girls to skate around here, so although I love it, it's a bit lonely. I'd like more girls to join in!",
      items: [
        {
          id: 21, prompt: "In this text Rachel Martin",
          options: [
            { letter: "A", text: "explains what equipment is needed for skateboarding." },
            { letter: "B", text: "describes the places for skateboarding in her area." },
            { letter: "C", text: "persuades young people to enter skateboarding competitions." },
            { letter: "D", text: "compares skateboarding with other sports." }
          ],
          answer: "B"
        },
        {
          id: 22, prompt: "Why was it hard for Rachel to go skateboarding last year?",
          options: [
            { letter: "A", text: "There wasn't a skatepark near enough to her house." },
            { letter: "B", text: "None of her friends were able to go with her." },
            { letter: "C", text: "She was worried she would hurt herself." },
            { letter: "D", text: "She wasn't allowed to go out in the evenings." }
          ],
          answer: "A"
        },
        {
          id: 23, prompt: "What does Rachel say about the skatepark at her school?",
          options: [
            { letter: "A", text: "It allows younger children to practise their skating." },
            { letter: "B", text: "It takes too many people away from other sports." },
            { letter: "C", text: "It is used for several different activities." },
            { letter: "D", text: "It is more crowded than the skatepark in town." }
          ],
          answer: "C"
        },
        {
          id: 24, prompt: "What does Rachel like about skateboarding?",
          options: [
            { letter: "A", text: "getting the chance to be good at something" },
            { letter: "B", text: "having to think carefully" },
            { letter: "C", text: "learning new skills from her sister" },
            { letter: "D", text: "doing an activity with girls of her own age" }
          ],
          answer: "B"
        },
        {
          id: 25, prompt: "Which of the following might Rachel write in her diary?",
          options: [
            { letter: "A", text: "Did another competition today – I won, although I was the youngest. But then I have got two years' experience." },
            { letter: "B", text: "Didn't feel like practising tonight, so stayed in and watched TV instead. That's the fourth time this week!" },
            { letter: "C", text: "Was skating on the pavement today when I fell and hurt my ankle. I've done that three times now." },
            { letter: "D", text: "Couldn't use school skatepark today – there were too many bikers. My little brother wanted to play there but it wasn't safe for him." }
          ],
          answer: "D"
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
        prompt: "A see   B look   C show   D visit",
        answer: "A"
      },
      passageTitle: "Summer Work in Reykjavik",
      passage:
        "If you take a walk through Reykjavik – the capital of Iceland – this summer, you'll (0) ___ groups of young people working in parks, gardens and green areas around the city. Most (26) ___ these kids are in high school but they (27) ___ the summer keeping the city green as part of a program (28) ___ as 'work school'.\n\n" +
        "The 'work school' (29) ___ of a surprisingly large (30) ___ of Reykjavik's teenagers. Roughly 75% of Reykjavik's 14-year-olds and 60% of the city's 16-year-olds take (31) ___.\n\n" +
        "They get paid for their work, and at the same time they (32) ___ the environment of their city.\n\n" +
        "They also learn (33) ___ to work as a member of a team which is (34) ___ by an adult. This experience provides them with useful skills for (35) ___ they leave education and enter the world of work.",
      items: [
        { id: 26, options: [ { letter: "A", text: "for" },       { letter: "B", text: "of" },        { letter: "C", text: "from" },     { letter: "D", text: "with" } ],     answer: "B" },
        { id: 27, options: [ { letter: "A", text: "take" },      { letter: "B", text: "do" },        { letter: "C", text: "spend" },    { letter: "D", text: "make" } ],     answer: "C" },
        { id: 28, options: [ { letter: "A", text: "called" },    { letter: "B", text: "noted" },     { letter: "C", text: "known" },    { letter: "D", text: "said" } ],     answer: "C" },
        { id: 29, options: [ { letter: "A", text: "consists" },  { letter: "B", text: "involves" },  { letter: "C", text: "contains" }, { letter: "D", text: "employs" } ],  answer: "A" },
        { id: 30, options: [ { letter: "A", text: "size" },      { letter: "B", text: "number" },    { letter: "C", text: "level" },    { letter: "D", text: "lot" } ],      answer: "B" },
        { id: 31, options: [ { letter: "A", text: "part" },      { letter: "B", text: "away" },      { letter: "C", text: "place" },    { letter: "D", text: "up" } ],       answer: "A" },
        { id: 32, options: [ { letter: "A", text: "prepare" },   { letter: "B", text: "attend" },    { letter: "C", text: "improve" },  { letter: "D", text: "produce" } ],  answer: "C" },
        { id: 33, options: [ { letter: "A", text: "how" },       { letter: "B", text: "about" },     { letter: "C", text: "why" },      { letter: "D", text: "well" } ],     answer: "A" },
        { id: 34, options: [ { letter: "A", text: "moved" },     { letter: "B", text: "held" },      { letter: "C", text: "kept" },     { letter: "D", text: "led" } ],      answer: "D" },
        { id: 35, options: [ { letter: "A", text: "although" },  { letter: "B", text: "when" },      { letter: "C", text: "unless" },   { letter: "D", text: "while" } ],    answer: "B" }
      ]
    }
  ]
};
