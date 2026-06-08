// Cambridge PET Reading — Test 5 (Book 2, Test 1)
// VERBATIM from "Cambridge Preliminary English Test 2" (Cambridge UP).
// Source pages: Test 1 R&W = pp.6-16; reading key = p.86.

window.PET_R_TEST = {
  testInfo: {
    id: "pet-r-05",
    title: "PET Reading — Test 5",
    paper: "Paper 1 · Reading",
    level: "B1",
    totalTime: 50,
    totalQuestions: 35,
    parts: 5
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "sign-mcq",
      instruction: [
        "Look at the text in each question.",
        "What does it say?",
        "Mark the letter next to the correct explanation – A, B or C – on your answer sheet."
      ],
      example: {
        number: 0,
        prompt: "NO BICYCLES AGAINST GLASS PLEASE",
        answer: "A",
        image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test5/q0.png",
        options: [
          { letter: "A", text: "Do not leave your bicycle touching the window." },
          { letter: "B", text: "Do not ride your bicycle in this area." },
          { letter: "C", text: "Broken glass may damage your bicycle tyres." }
        ]
      },
      items: [
        { id: 1, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test5/q1.png",
          prompt: "Whose textbook does Natalie want to borrow?",
          options: [
            { letter: "A", text: "Ken's" },
            { letter: "B", text: "Maria's" },
            { letter: "C", text: "Francesco's" }
          ], answer: "C" },
        { id: 2, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test5/q2.png",
          prompt: " ",
          options: [
            { letter: "A", text: "Users must lock the car park after leaving." },
            { letter: "B", text: "People can park here while they are at work." },
            { letter: "C", text: "This car park is for employees only." }
          ], answer: "B" },
        { id: 3, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test5/q3.png",
          prompt: " ",
          options: [
            { letter: "A", text: "The basketball team only wants to see experienced players." },
            { letter: "B", text: "There aren't enough team members available on Friday." },
            { letter: "C", text: "The Barton College team will visit the gym later today." }
          ], answer: "B" },
        { id: 4, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test5/q4.png",
          prompt: " ",
          options: [
            { letter: "A", text: "All Sunday evening tickets are already sold." },
            { letter: "B", text: "You must book tickets for Sunday in advance." },
            { letter: "C", text: "A ticket is not necessary for Sunday evening." }
          ], answer: "A" },
        { id: 5, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test5/q5.png",
          prompt: " ",
          options: [
            { letter: "A", text: "Giacomo will be able to see Charlotte early tomorrow morning." },
            { letter: "B", text: "Charlotte needs to arrive in time for Giacomo's meeting tomorrow." },
            { letter: "C", text: "Giacomo can collect Charlotte from the airport tomorrow afternoon." }
          ], answer: "C" }
      ]
    },

    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "match-people-texts",
      instruction: [
        "The people below all want to go to the cinema.",
        "On the opposite page there are descriptions of eight films.",
        "Decide which film (letters A–H) would be the most suitable for each person or people (numbers 6–10).",
        "For each of these numbers mark the correct letter on your answer sheet."
      ],
      textsTitle: "Films",
      items: [
        { id: 6,  image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test5/p6.png",  name: "Jo",            description: "Jo is studying art at university. She usually goes to the cinema on Friday evenings. She enjoys films that are based on real life and from which she can learn something.", answer: "C" },
        { id: 7,  image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test5/p7.png",  name: "Sheila",        description: "Sheila has decided to take her mother to the cinema for her birthday. They both like love stories that have happy endings.", answer: "F" },
        { id: 8,  image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test5/p8.png",  name: "Brian",         description: "Brian is a hard-working medical student. He doesn't have very much free time, but he likes going to the cinema to relax, and enjoys a good laugh.", answer: "G" },
        { id: 9,  image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test5/p9.png",  name: "Adam",          description: "Adam wants to take his 8-year-old son Mark to the cinema at the weekend. They want to see a film with plenty of excitement.", answer: "D" },
        { id: 10, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test5/p10.png", name: "Harry and Joyce", description: "Harry and Joyce go to the cinema about twice a month. They particularly like detective stories and do not pay much attention to which actors are in the film.", answer: "B" }
      ],
      texts: [
        { letter: "A", title: "The Delivery",         body: "Jim Treace stars in this well-known comedy about two workmen who have to deliver a long piece of wood to a house. But unfortunately the performances are poor, and the film is too long for such a simple joke." },
        { letter: "B", title: "And Tomorrow We Find You", body: "A fast-moving adult story about a San Francisco policeman in danger. Based on a real-life happening, it keeps you guessing right until the last minute. Although there are no big stars, there are some fine performances." },
        { letter: "C", title: "The Ends of the Earth", body: "A story based on a real-life journey to the South Pole. This film contains some quite wonderful wildlife photography – make sure you see it while you have the chance, or you'll be sorry." },
        { letter: "D", title: "Island of Fire",        body: "You get spectacular scenery and lots of thrills in this action-packed story, in which a young sea-captain rescues terrified villagers from a volcanic island in the South Seas." },
        { letter: "E", title: "Out of School",         body: "Here we live through a day in the life of an American teenager who has problems not only with his parents and their boring friends but also with his first girlfriend who just doesn't seem to understand him." },
        { letter: "F", title: "A Time of Silence",     body: "Don't forget your handkerchief for this story of a young college boy and girl who manage to survive all the pressures of modern life. And what an unforgettable wedding scene!" },
        { letter: "G", title: "A Private Party",       body: "A wonderfully funny story, which takes place in the 1940s. A reporter and his very worried wife try to save a sheep from the local butcher. The actors really make the most of this clever script." },
        { letter: "H", title: "Who Shot Malone?",      body: "It's a surprise to see so many famous names wasting their time in this dull detective story. In the end you find yourself asking, 'Who cares!'" }
      ]
    },

    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–20",
      type: "true-false",
      instruction: [
        "Look at the sentences below about a tour of Australia.",
        "Read the text on the opposite page to decide if each sentence is correct or incorrect.",
        "If it is correct, mark A on your answer sheet.",
        "If it is not correct, mark B on your answer sheet."
      ],
      passageImage: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test5/passage3.jpg",
      passageTitle: "GLOBEWISE — Australia",
      passageSubtitle: "We'll show you the very best of Australia on a fully guided 22-day tour",
      passage:
        "For only £1985.\n\nOUR PRICE INCLUDES\n• Scheduled flights by Australia's national airline, Qantas, from London or Manchester to Perth, returning from Melbourne.\n• After arriving in Perth, Air Australia flights between Perth/Alice Springs/Cairns/Sydney.\n• Coach from Sydney to Melbourne via Canberra and Albury.\n• All airport transfers in Australia.\n• Nineteen nights' accommodation in good grade hotels with full continental breakfast.\n• Day trip to Ayers Rock, with a full day Barrier Reef boat trip, a visit to an Australian sheep station and city sightseeing tours in Perth, Alice Springs, Canberra and Melbourne.\n• All state and local taxes.\n• Hotel baggage handling.\n• Experienced Globewise Tour Manager at all stages of the trip.\n\nSOLD OUT FOR THIS YEAR — BOOKING NOW FOR NEXT YEAR\n\nYou can pay just £90 now to be sure of your place on this successful and popular touring holiday next year. There are departures right through the year. We make sure you see the very best of everything which Australia has to offer.\n\nPERTH — Wonderful long, golden beaches, superb restaurants serving fabulous food in delightful surroundings, lush green parks and the beautiful Swan River. City sightseeing tour included.\n\nALICE SPRINGS — Fly over the outback to famous Alice Springs in the heart of Aboriginal country. Full sightseeing tour. See Flying Doctor base and 'School of the Air'.\n\nAYERS ROCK — Drive to Yulara National Park. Visit the mysterious Olgas and Ayers Rock with its caves and Aboriginal rock paintings. Fly on to the lovely seaside town of Cairns and relax in the sun.\n\nGREAT BARRIER REEF — We've included a full day's boat trip on the famous reef with the chance to see amazing, brightly coloured fish and other sea creatures.\n\nSYDNEY — You'll love the excitement and beauty of Australia's biggest city – we've included a sightseeing tour and a visit to the famous Opera House. You can also book a day trip to the Blue Mountains.\n\nMELBOURNE — We've included a city sightseeing tour – or you can visit the Penguin Parade. We promise that by the end of the trip you'll be wanting to return!\n\nPHONE US ON 01303 692154 quoting reference GW/398 for our NEW FULL COLOUR BROCHURE. OUR OFFICES ARE OPEN: Monday to Friday 9 a.m. – 8 p.m. Saturday 9 a.m. – 4 p.m. BROCHURE REQUESTS ONLY: Sunday 10 a.m. – 2 p.m.",
      items: [
        { id: 11, statement: "If you start your holiday on April 1st, you will return on April 19th.",            answer: "B" },
        { id: 12, statement: "Return flights are from Melbourne.",                                                  answer: "A" },
        { id: 13, statement: "All travel between cities in Australia is by plane.",                                 answer: "B" },
        { id: 14, statement: "The cost covers accommodation and some meals.",                                       answer: "A" },
        { id: 15, statement: "You can make a reservation now for one of next year's tours.",                        answer: "A" },
        { id: 16, statement: "You have to pay the full price on the day you book.",                                  answer: "B" },
        { id: 17, statement: "You can only take this holiday in the spring or autumn.",                              answer: "B" },
        { id: 18, statement: "If you want to go on a city sightseeing tour, you will have to pay extra.",            answer: "B" },
        { id: 19, statement: "The trip to Ayers Rock ends with a flight.",                                          answer: "A" },
        { id: 20, statement: "Booking is possible seven days a week.",                                              answer: "B" }
      ]
    },

    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 21–25",
      type: "passage-mcq",
      instruction: [
        "Read the text and questions below.",
        "For each question, mark the letter next to the correct answer – A, B, C or D – on your answer sheet."
      ],
      passage:
        "A month ago I had no idea how on a Saturday afternoon in November I'd be hanging 30 metres above the ground and enjoying it. Now I looked down at the river far below me, and realised why people love rock-climbing.\n\n" +
        "My friend Matt and I had arrived at the Activity Centre on Friday evening. The accommodation wasn't wonderful, but we had everything we needed (beds, blankets, food), and we were pleased to be out of the city and in the fresh air.\n\n" +
        "On Saturday morning we met the other ten members of our group. Cameron had come along with two friends, Kevin and Simon, while sisters Carole and Lynn had come with Amanda. We had come from various places and none of us knew the area.\n\n" +
        "We knew we were going to spend the weekend outdoors, but none of us was sure exactly how. Half of us spent the morning caving while the others went rock-climbing and then we changed at lunchtime. Matt and I went to the caves first. Climbing out was harder than going in, but after a good deal of pushing, we were out at last – covered in mud but pleased and excited by what we'd done.",
      items: [
        { id: 21, prompt: "What is the writer trying to do in the text?",
          options: [
            { letter: "A", text: "advertise the Activity Centre" },
            { letter: "B", text: "describe some people she met" },
            { letter: "C", text: "explain how to do certain outdoor sports" },
            { letter: "D", text: "say how she spent some free time" }
          ], answer: "D" },
        { id: 22, prompt: "What can the reader learn from the text?",
          options: [
            { letter: "A", text: "when to depend on other people at the Centre" },
            { letter: "B", text: "how to apply for a place at the Centre" },
            { letter: "C", text: "what sort of activities you can experience at the Centre" },
            { letter: "D", text: "which time of year is best to attend the Centre" }
          ], answer: "C" },
        { id: 23, prompt: "How do you think the writer might describe her weekend?",
          options: [
            { letter: "A", text: "interesting" },
            { letter: "B", text: "relaxing" },
            { letter: "C", text: "frightening" },
            { letter: "D", text: "unpleasant" }
          ], answer: "A" },
        { id: 24, prompt: "What do we learn about the group?",
          options: [
            { letter: "A", text: "Some of them had been there before." },
            { letter: "B", text: "They had already chosen their preferred activities." },
            { letter: "C", text: "Some of them already knew each other." },
            { letter: "D", text: "They came from the same city." }
          ], answer: "C" },
        { id: 25, prompt: "Which of the following advertisements describes the Activity Centre?",
          options: [
            { letter: "A", text: "ACTIVITY CENTRE — Set in beautiful countryside. Accommodation and meals provided. Make up your own timetable – choose from a variety of activities (horse-riding, fishing, hill-walking, sailing, mountain-biking)." },
            { letter: "B", text: "ACTIVITY CENTRE — Set in beautiful countryside. Accommodation provided. Work with a group – we show you a range of outdoor activities that you didn't realise you could do!" },
            { letter: "C", text: "ACTIVITY CENTRE — Set in beautiful countryside. Enjoy the luxury of our accommodation – each room has its own bathroom. Work with a group, or have individual teaching." },
            { letter: "D", text: "ACTIVITY CENTRE — Set in beautiful countryside. You can spend the day doing outdoor activities and we will find your accommodation with a local family." }
          ], answer: "B" }
      ]
    },

    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 26–35",
      type: "passage-cloze",
      instruction: [
        "Read the text below and choose the correct word for each space.",
        "For each question, mark the letter next to the correct word – A, B, C or D – on your answer sheet."
      ],
      example: { number: 0, prompt: "A born   B the   C developed   D grown", answer: "A" },
      passageTitle: "THE FIRST WOMAN SCIENTIST",
      passage:
        "Hypatia was (0) ___ in Alexandria, in Egypt, in 370 A.D. For many centuries she was (26) ___ only woman scientist to have a place in the history books.\n\n" +
        "Hypatia's father was director of Alexandria University, and he (27) ___ sure his daughter had the best education available. This was unusual, as most women then had few (28) ___ to study.\n\n" +
        "After studying in Athens and Rome, Hypatia returned to Alexandria (29) ___ she began teaching mathematics. She soon became famous (30) ___ her knowledge of new ideas.\n\n" +
        "We have no copies of her books, (31) ___ we know that she wrote several mathematical works. Hypatia was also interested in technology and (32) ___ several scientific tools to help with her work.\n\n" +
        "At the (33) ___ of 45, many rulers were afraid of science, and (34) ___ men were against her. One day in March 415, Hypatia (35) ___ attacked in the street and killed.",
      items: [
        { id: 26, options: [ { letter: "A", text: "one" },         { letter: "B", text: "the" },         { letter: "C", text: "a" },          { letter: "D", text: "an" } ],          answer: "B" },
        { id: 27, options: [ { letter: "A", text: "could" },       { letter: "B", text: "made" },        { letter: "C", text: "said" },       { letter: "D", text: "put" } ],         answer: "B" },
        { id: 28, options: [ { letter: "A", text: "classes" },     { letter: "B", text: "customs" },     { letter: "C", text: "opportunities" }, { letter: "D", text: "teachers" } ],  answer: "C" },
        { id: 29, options: [ { letter: "A", text: "where" },       { letter: "B", text: "how" },         { letter: "C", text: "there" },      { letter: "D", text: "which" } ],       answer: "A" },
        { id: 30, options: [ { letter: "A", text: "from" },        { letter: "B", text: "by" },          { letter: "C", text: "for" },        { letter: "D", text: "in" } ],          answer: "C" },
        { id: 31, options: [ { letter: "A", text: "because" },     { letter: "B", text: "but" },         { letter: "C", text: "or" },         { letter: "D", text: "as" } ],          answer: "B" },
        { id: 32, options: [ { letter: "A", text: "did" },         { letter: "B", text: "experimented" }, { letter: "C", text: "invented" },   { letter: "D", text: "learnt" } ],      answer: "C" },
        { id: 33, options: [ { letter: "A", text: "day" },         { letter: "B", text: "period" },      { letter: "C", text: "year" },       { letter: "D", text: "time" } ],        answer: "D" },
        { id: 34, options: [ { letter: "A", text: "anyone" },      { letter: "B", text: "nobody" },      { letter: "C", text: "all" },        { letter: "D", text: "something" } ],   answer: "A" },
        { id: 35, options: [ { letter: "A", text: "was" },         { letter: "B", text: "had" },         { letter: "C", text: "has" },        { letter: "D", text: "is" } ],          answer: "A" }
      ]
    }
  ]
};
