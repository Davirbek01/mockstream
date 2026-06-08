// Cambridge PET Reading — Test 6 (Book 2, Test 2)
// VERBATIM from "Cambridge Preliminary English Test 2" (Cambridge UP).
// Source pages: Test 2 R&W = pp.26-36; reading key = p.111.

window.PET_R_TEST = {
  testInfo: {
    id: "pet-r-06",
    title: "PET Reading — Test 6",
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
        image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test6/q0.png",
        options: [
          { letter: "A", text: "Do not leave your bike touching the window." },
          { letter: "B", text: "Do not ride your bicycle in this area." },
          { letter: "C", text: "Broken glass may damage your bicycle tyres." }
        ]
      },
      items: [
        { id: 1, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test6/q1.png",
          prompt: " ",
          options: [
            { letter: "A", text: "You must show a receipt if you want to remove luggage." },
            { letter: "B", text: "When you remove your luggage you are given a receipt." },
            { letter: "C", text: "You can leave your luggage here without change." }
          ], answer: "A" },
        { id: 2, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test6/q2.png",
          prompt: "For the festival, Anna should bring",
          options: [
            { letter: "A", text: "her ticket." },
            { letter: "B", text: "a blanket." },
            { letter: "C", text: "the programme." }
          ], answer: "B" },
        { id: 3, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test6/q3.png",
          prompt: " ",
          options: [
            { letter: "A", text: "Don't turn the lights on until it's necessary." },
            { letter: "B", text: "Switch the lights on when you're in the room." },
            { letter: "C", text: "Don't leave the lights on if the room is empty." }
          ], answer: "C" },
        { id: 4, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test6/q4.png",
          prompt: " ",
          options: [
            { letter: "A", text: "Sally has given a chain to someone as a present." },
            { letter: "B", text: "Sally's boyfriend knows about the missing chain." },
            { letter: "C", text: "Sally lost her chain when she got changed for sport." }
          ], answer: "C" },
        { id: 5, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test6/q5.png",
          prompt: "This shop",
          options: [
            { letter: "A", text: "has just opened and jobs are available." },
            { letter: "B", text: "is opening for longer and needs extra staff." },
            { letter: "C", text: "will open late because of job interviews." }
          ], answer: "B" }
      ]
    },

    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "match-people-texts",
      instruction: [
        "The people below all want to buy a book on travel.",
        "On the opposite page there are descriptions of eight books.",
        "Decide which book (letters A–H) would be the most suitable for each person or people (numbers 6–10).",
        "For each of these numbers mark the correct letter on your answer sheet."
      ],
      textsTitle: "Travel books",
      items: [
        { id: 6,  image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test6/p6.png",  name: "Robert",        description: "Robert is planning to travel round the world by train. He would like a book with pictures and maps to take with him on his long journeys.", answer: "D" },
        { id: 7,  image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test6/p7.png",  name: "Mrs Jones",     description: "Mrs Jones used to love visiting France, but now she is too old to travel. She wants a book with lots of photographs which will help her to remember everything she enjoyed.", answer: "G" },
        { id: 8,  image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test6/p8.png",  name: "The Harpers",   description: "The Harpers are planning to go on holiday round Europe. They intend to drive their car and go for walks, so they need a book with maps and pictures to guide them on their way.", answer: "F" },
        { id: 9,  image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test6/p9.png",  name: "Clive",         description: "Clive wants to buy a book as a present for his friend Tom. Tom enjoys fishing and driving round England.", answer: "B" },
        { id: 10, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test6/p10.png", name: "Peter",         description: "Peter has to write something for his history teacher about world explorers. He wants to know about explorers from the past and their travels to different parts of the world.", answer: "C" }
      ],
      texts: [
        { letter: "A", title: "Allan Jowett — Jowett's Railway Centres: Volume I", body: "Packed with information about 20 British railway centres, this wonderful book is handwritten and illustrated throughout with clear hand-drawn maps – a true collector's piece for those who are interested in railways." },
        { letter: "B", title: "Alan Titchmarsh — The English River",                body: "Alan Titchmarsh explores 18 rivers, telling their interesting stories with his appreciation of them. A saying from a past age introduces each chapter as his exploration moves across the English countryside." },
        { letter: "C", title: "Robin Hanbury-Tenison — The Oxford Book of Exploration", body: "This is a collection of the writing of explorers through the centuries. It describes the feelings and experiences of these brave adventurers who changed the world through their search for new lands." },
        { letter: "D", title: "The Travel Club — Train Journeys of the World",     body: "First-hand accounts of 30 of the world's most beautiful and dramatic railway journeys are found together with specially drawn maps and wonderful photographs that show the people and places on the route." },
        { letter: "E", title: "Bruce Chatwin — Photographs and Notebooks",          body: "On all his travels, Bruce Chatwin took thousands of photographs and kept daily notebooks. Published here for the first time, the photographs are excellent, the notebooks both scholarly and funny. Will give great pleasure." },
        { letter: "F", title: "Automobile Association — Walks and Tours in France", body: "Explore spectacular and pretty France with 61 expertly researched motor tours and 114 walks, complete with route directions, super mapping, and descriptions and pictures of places of interest for the traveller." },
        { letter: "G", title: "Shirley Pike — The Book of French Life",             body: "This beautiful volume contains forty wonderful photographs that show the very nature of French life – the perfect gift for anyone who finds this country as wonderful as Shirley Pike does." },
        { letter: "H", title: "Ranulph Fiennes — Mind over Matter",                 body: "The epic crossing of the Antarctic continent. The amazing story of his recent crossing of the Antarctic continent with another explorer, in which both showed great strength and courage." }
      ]
    },

    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–20",
      type: "true-false",
      instruction: [
        "Look at the sentences below about a river journey.",
        "Read the text on the opposite page to decide if each sentence is correct or incorrect.",
        "If it is correct, mark A on your answer sheet.",
        "If it is not correct, mark B on your answer sheet."
      ],
      passageTitle: "A JOURNEY ALONG THE BEAUTIFUL DOURO RIVER",
      passageSubtitle: "7 nights from £1050",
      passage:
        "VOYAGES JULES VERNE operate a 'hotel ship' along the Douro river in Portugal. The MV Lady Ivy May can take 160 guests in double cabins, all of which face outside and have a private shower and WC. On board the ship, which has air-conditioning, you will find a sun-deck, lounge, bar, dining room, shop and library facilities.\n\n" +
        "Itinerary\n\n" +
        "Day 1 Depart in the early evening from London Heathrow to Oporto. Your guide will meet you on arrival and take you to the Lady Ivy May, where you will spend the night.\n\n" +
        "Day 2 After a morning's sightseeing in Oporto, you will return to the ship and depart for Entre-os-Rios. This part of the journey up the river takes four hours.\n\n" +
        "Day 3 You will continue travelling up the river. In the early evening, the ship stops at Pêso da Régua, where port wine is produced. At dinner you will be able to try the delicious food and drink from this area.\n\n" +
        "Day 4 After breakfast you will travel south by bus to the ancient town of Lamego and visit the cathedral, several churches and a museum. The museum was formerly a palace and now has an excellent collection of paintings, tapestries and sculptures. You will then return to the ship and sail on to Tua.\n\n" +
        "Day 5 At this point the Douro becomes very narrow. Depending on the depth of the river at the time, you may be able to continue by a smaller boat to the Spanish frontier at Barca d'Alva. The return journey to Tua is by coach and there is much to see along the way.\n\n" +
        "Day 6 In the morning you will drive to São João da Pesqueira for one of the most wonderful views in the whole of the Douro valley. You will return to the ship for lunch and then join the Douro river valley railway for a beautiful ride through the countryside to Régua, where the Lady Ivy May will be waiting for you.\n\n" +
        "Day 7 There will be a trip to Vila Real before returning to the ship and setting off down the river to Oporto. You will sleep on board the Lady Ivy May.\n\n" +
        "Day 8 You will arrive in Oporto in plenty of time for independent sightseeing and last-minute shopping, before you catch the flight home to London Heathrow.\n\n" +
        "Departure dates and prices (all prices are per person):\nJune 5, 12, 19, 26 — £1100\nJuly 3, 10, 17, 24, 31 — £1050\nAugust 7, 14, 21, 28 — £1050\nSeptember 4, 11, 18, 25 — £1100\n\n" +
        "Prices include: return flights, 7 nights' accommodation on board the Lady Ivy May with all meals, excursions and guides.\n\n" +
        "Not included: travel insurance, tips.",
      items: [
        { id: 11, statement: "Each cabin on the Lady Ivy May is for two people.",                         answer: "A" },
        { id: 12, statement: "You can borrow books on board the ship.",                                   answer: "A" },
        { id: 13, statement: "On arrival at Oporto, guests find their own way to the ship.",              answer: "B" },
        { id: 14, statement: "You spend a day looking round Oporto.",                                     answer: "B" },
        { id: 15, statement: "It takes a day to travel from Oporto to Entre-os-Rios.",                    answer: "B" },
        { id: 16, statement: "The museum at Lamego used to be a palace.",                                  answer: "A" },
        { id: 17, statement: "It is sometimes possible for the Lady Ivy May to sail to the Spanish border.", answer: "B" },
        { id: 18, statement: "The trip includes some travel by train.",                                    answer: "A" },
        { id: 19, statement: "You arrive back in Oporto on the day before your return flight.",            answer: "B" },
        { id: 20, statement: "Voyages Jules Verne arrange your travel insurance.",                         answer: "B" }
      ]
    },

    {
      partNumber: 4, label: "PART 4", questionsLabel: "QUESTIONS 21–25",
      type: "passage-mcq",
      instruction: [
        "Read the text and questions below.",
        "For each question, mark the letter next to the correct answer – A, B, C or D – on your answer sheet."
      ],
      passageTitle: "Winter Driving",
      passage:
        "Winter is dangerous because it's so difficult to know what is going to happen and accidents take place so easily. Fog can be waiting to meet you over the top of a hill. Ice might be hiding beneath the melting snow, waiting to send you off the road. The car coming towards you may suddenly slide across the road.\n\n" +
        "Rule Number One for driving on icy roads is to drive smoothly. Uneven movements can make a car suddenly very difficult to control. So every time you either turn the wheel, touch the brakes or increase your speed, you must be as gentle and slow as possible. Imagine you are driving with a full cup of hot coffee on the seat next to you. Drive so that you wouldn't spill it.\n\n" +
        "Rule Number Two is to pay attention to what might happen. The more ice there is, the further down the road you have to look. Test how long it takes to stop by gently braking. Remember that you may be driving more quickly than you think. In general, allow double your normal stopping distance when the road is wet, three times this distance on snow, and even more on ice. Try to stay in control of your car at all times and you will avoid trouble.",
      items: [
        { id: 21, prompt: "What is the writer trying to do in the text?",
          options: [
            { letter: "A", text: "complain about bad winter driving" },
            { letter: "B", text: "give information about winter weather" },
            { letter: "C", text: "warn people against driving in winter" },
            { letter: "D", text: "advise people about safe driving in winter" }
          ], answer: "D" },
        { id: 22, prompt: "Why would somebody read this?",
          options: [
            { letter: "A", text: "to find out about the weather" },
            { letter: "B", text: "for information on driving lessons" },
            { letter: "C", text: "to learn about better driving" },
            { letter: "D", text: "to decide when to travel" }
          ], answer: "C" },
        { id: 23, prompt: "What does the writer think?",
          options: [
            { letter: "A", text: "People should avoid driving in the snow." },
            { letter: "B", text: "Drivers should expect problems in winter." },
            { letter: "C", text: "People drive too fast in winter." },
            { letter: "D", text: "Winter drivers should use their brakes less." }
          ], answer: "B" },
        { id: 24, prompt: "Why does the writer talk about a cup of coffee?",
          options: [
            { letter: "A", text: "to explain the importance of smooth movements" },
            { letter: "B", text: "because he thinks refreshments are important for drivers" },
            { letter: "C", text: "because he wants drivers to be more relaxed" },
            { letter: "D", text: "to show how it can be spilled" }
          ], answer: "A" },
        { id: 25, prompt: "Which traffic sign shows the main idea of the text?",
          cardLayout: true,
          cardStyle: "sign",
          options: [
            { letter: "A", title: "DRIVE CAREFULLY",  body: "ICE ON ROAD AHEAD" },
            { letter: "B", title: "REDUCE SPEED NOW", body: "FOG AHEAD" },
            { letter: "C", title: "DRIVE CAREFULLY",  body: "ROAD REPAIRS AHEAD" },
            { letter: "D", title: "SLOW DOWN",        body: "ACCIDENT AHEAD" }
          ], answer: "A" }
      ]
    },

    {
      partNumber: 5, label: "PART 5", questionsLabel: "QUESTIONS 26–35",
      type: "passage-cloze",
      instruction: [
        "Read the text below and choose the correct word for each space.",
        "For each question, mark the letter next to the correct word – A, B, C or D – on your answer sheet."
      ],
      example: { number: 0, prompt: "A in   B about   C from   D story", answer: "A" },
      passageTitle: "SAMUEL PEPYS",
      passage:
        "The most famous diary (0) ___ English was written by Samuel Pepys. It gives a detailed and interesting (26) ___ of everyday life in England (27) ___ 1660 and 1669. Pepys writes about important news stories of the time, like disease, an enemy navy (28) ___ up the River Thames and the Great Fire of London.\n\n" +
        "He also writes about himself, even about his plan (29) ___ he often slept during church or (30) ___ at the petty job. He describes his home life – a (31) ___ with his wife and how they became friends again, his worry about her illness. As well as books, he liked music, the theatre, card (32) ___ , and parties with good food and (33) ___ of fun. Pepys was a busy man who had many important (34) ___ – he was a Member of Parliament and President of the Royal Society. He is also (35) ___ for his work for the British Navy.",
      items: [
        { id: 26, options: [ { letter: "A", text: "look" },         { letter: "B", text: "letter" },        { letter: "C", text: "notice" },        { letter: "D", text: "story" } ],        answer: "A" },
        { id: 27, options: [ { letter: "A", text: "between" },      { letter: "B", text: "from" },          { letter: "C", text: "through" },       { letter: "D", text: "to" } ],           answer: "A" },
        { id: 28, options: [ { letter: "A", text: "driving" },      { letter: "B", text: "flying" },        { letter: "C", text: "running" },       { letter: "D", text: "sailing" } ],      answer: "D" },
        { id: 29, options: [ { letter: "A", text: "accidents" },    { letter: "B", text: "plans" },         { letter: "C", text: "dreams" },        { letter: "D", text: "faults" } ],       answer: "D" },
        { id: 30, options: [ { letter: "A", text: "looked" },       { letter: "B", text: "prayed" },        { letter: "C", text: "talked" },        { letter: "D", text: "thought" } ],      answer: "A" },
        { id: 31, options: [ { letter: "A", text: "conversation" }, { letter: "B", text: "discussion" },    { letter: "C", text: "quarrel" },       { letter: "D", text: "talk" } ],         answer: "C" },
        { id: 32, options: [ { letter: "A", text: "battles" },      { letter: "B", text: "games" },         { letter: "C", text: "matches" },       { letter: "D", text: "plays" } ],        answer: "B" },
        { id: 33, options: [ { letter: "A", text: "amount" },       { letter: "B", text: "plenty" },        { letter: "C", text: "much" },          { letter: "D", text: "some" } ],         answer: "B" },
        { id: 34, options: [ { letter: "A", text: "acts" },         { letter: "B", text: "hobbies" },       { letter: "C", text: "jobs" },          { letter: "D", text: "studies" } ],      answer: "C" },
        { id: 35, options: [ { letter: "A", text: "reviewed" },     { letter: "B", text: "remembered" },    { letter: "C", text: "reminded" },      { letter: "D", text: "reported" } ],     answer: "B" }
      ]
    }
  ]
};
