// Cambridge PET Reading — Test 8 (Book 2, Test 4)
// VERBATIM from "Cambridge Preliminary English Test 2" (Cambridge UP).
// Source pages: Test 4 R&W = pp.66-84; reading key = p.135.

window.PET_R_TEST = {
  testInfo: {
    id: "pet-r-08",
    title: "PET Reading — Test 8",
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
        image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test8/q0.png",
        options: [
          { letter: "A", text: "Do not leave your bicycle touching the window." },
          { letter: "B", text: "Do not ride your bicycle in this area." },
          { letter: "C", text: "Broken glass may damage your bicycle tyres." }
        ]
      },
      items: [
        { id: 1, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test8/q1.png",
          prompt: " ",
          options: [
            { letter: "A", text: "Tell the doctor if you need to park here." },
            { letter: "B", text: "Only the doctor working today can park here." },
            { letter: "C", text: "Park in this space only in an emergency." }
          ], answer: "B" },
        { id: 2, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test8/q2.png",
          prompt: " ",
          options: [
            { letter: "A", text: "Heidi will start her new job in September." },
            { letter: "B", text: "Ruth wants Heidi to help her find employment." },
            { letter: "C", text: "Ruth has offered to talk to Heidi's boss about her." }
          ], answer: "B" },
        { id: 3, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test8/q3.png",
          prompt: " ",
          options: [
            { letter: "A", text: "Cameras cannot be used near this building." },
            { letter: "B", text: "You must look after your cameras here." },
            { letter: "C", text: "This building is guarded by cameras." }
          ], answer: "C" },
        { id: 4, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test8/q4.png",
          prompt: "Where should Helena meet the others?",
          options: [
            { letter: "A", text: "at the café" },
            { letter: "B", text: "at the theatre" },
            { letter: "C", text: "at the club" }
          ], answer: "C" },
        { id: 5, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test8/q5.png",
          prompt: " ",
          options: [
            { letter: "A", text: "We offer a choice of flats to rent in this area." },
            { letter: "B", text: "This is the best area to find a flat." },
            { letter: "C", text: "Flats in this area do not cost a lot." }
          ], answer: "A" }
      ]
    },

    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "match-people-texts",
      instruction: [
        "The people below all want to go on a short trip.",
        "On the opposite page there are descriptions of eight trips which a ferry company is offering.",
        "Decide which place (letters A–H) would be the most suitable for each person or group of people (numbers 6–10).",
        "For each of these numbers mark the correct letter on your answer sheet."
      ],
      textsTitle: "Short Trips",
      items: [
        { id: 6,  image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test8/p6.png",  name: "Ray and three friends", description: "Ray and three of his friends would like to spend a whole weekend driving around in nice scenery and enjoying some of the local food.", answer: "C" },
        { id: 7,  image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test8/p7.png",  name: "Phil and Adam",          description: "Phil and Adam want to go on a comfortable trip which takes them quickly to an interesting city. Then they want to enjoy at least two days of sightseeing.", answer: "F" },
        { id: 8,  image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test8/p8.png",  name: "Mike, Kathy and family", description: "Mike, Kathy and their three children don't have much money, but they want a special day out this Saturday. They must be back home by 9 p.m.", answer: "D" },
        { id: 9,  image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test8/p9.png",  name: "Kirsten",                description: "Kirsten is a Dutch student who is studying in Scotland. She doesn't drive, but wants a day trip to see some beautiful scenery and spend a little time by the sea.", answer: "H" },
        { id: 10, image: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test8/p10.png", name: "Clare and Robert",       description: "Clare and Robert want to enjoy some good food, but would also like to give their two young children a day to remember. They don't mind if they spend a lot of money.", answer: "A" }
      ],
      texts: [
        { letter: "A", title: "Marine Life, France",                 body: "The chance to experience the oceans of the world. Children will love the observatory, with water all around them and enormous fish swimming above their heads! Afterwards you eat at a world-famous local restaurant before boarding the ferry at 9 p.m. Not cheap, but a great day out!" },
        { letter: "B", title: "Amsterdamer",                         body: "Sail out in the evening and enjoy over 12 hours in the Netherlands, returning the following night. After a good Dutch breakfast you travel by train direct to the heart of the wonderful city of Amsterdam. The sightseeing and places to shop will make this a day to remember. Weekends only." },
        { letter: "C", title: "Ireland by Car",                       body: "Once you arrive in Ireland you're quickly on beautiful country roads, with friendly villages where you can stop for a delicious bite to eat. The special price allows you to take your car and up to five people away for 48 hours, and two nights' hotel accommodation can be arranged for a little extra." },
        { letter: "D", title: "French Hypermarket Day Trip",         body: "Whether you want to buy or just look, you'll love this tour. The enormous Durosy shopping centre is a shopper's dream! You will find a great number of local goods on sale, and clothes and kitchen goods are excellent value. Free children's entertainment all day. Leaves 10:00, back at 19:00." },
        { letter: "E", title: "Shop Till You Drop",                   body: "For good value shopping, take our newest cruise-ferry and you needn't worry about getting off! Leaving at 11 a.m., our duty-free shopping centre, more a floating department store than an on-board shop, opens at midday. We're back by 4 p.m. Sorry, only four people per ticket." },
        { letter: "F", title: "Belgium by Hydrofoil",                 body: "A four-day trip. From England you cross to Belgium in just 100 minutes by hydrofoil! You are served food and drinks during the crossing, then continue your journey to Brussels, or another beautiful city, on the fast Belgian railway network." },
        { letter: "G", title: "A Taste of the Good Life in France",   body: "After a relaxing voyage, you visit a beautiful area which is famous for its good things to eat. There you can enjoy some sightseeing and choose from a number of wonderful restaurants. Sail back on the night crossing. Sorry, adults only!" },
        { letter: "H", title: "Sea and Mountains in Northern Ireland", body: "Explore the Northern Ireland countryside, including the amazing Mountains of Mourne and the small seaside holiday town of Newcastle. The ferry leaves the port in Scotland at 7:30 and arrives back at 22:20. Transport in Northern Ireland is by air-conditioned coach." }
      ]
    },

    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–20",
      type: "true-false",
      instruction: [
        "Look at the sentences below about Nene Valley Railway.",
        "Read the text on the opposite page to decide if each sentence is correct or incorrect.",
        "If it is correct, mark A on your answer sheet.",
        "If it is not correct, mark B on your answer sheet."
      ],
      passageImage: "https://storage.googleapis.com/mockstream-listening-audio/PET-Reading/test8/passage3.jpg",
      passageTitle: "NENE VALLEY RAILWAY",
      passage:
        "About the Railway\nThe twelve kilometre-long Nene Valley Railway passes through the lovely Nene Park, from an Eastern terminus at Peterborough to the Railway's headquarters in Wansford (next to the A1 main road). A two-kilometre extension of the Railway takes passengers through Wansford Tunnel to the quiet beauty of Yarwell, the present Western end of the line.\n\n" +
        "Fares: adult £10.00, child £5.00, Family Fare (up to 2 adults and 3 children) £25.00. Special prices may apply on public holidays.\n\n" +
        "Nene Park\nWith golf courses and a large Caravan Club site, why not make it a complete day out for the family by visiting Nene Park? There are thousands of hectares of public parkland with boating lakes, picnic areas and a nature reserve, as well as a miniature railway.\n\n" +
        "Wansford\nWansford Station is the home of a unique collection of historic trains from many parts of Europe. This includes such famous types as the elegant De Glen Compound locomotive from France, and the German Class 52 Kriegslok (the largest working steam engine in Britain) as well as '92 Squadron' and 'Mayflower' which were built in Britain. You can see these engines all year round whether or not the Nene Valley Railway is running. The buffet, bar and souvenir shop, however, are only open on days when the train is running. A site entrance fee of £2.00 for adults and £1.00 for children is charged at Wansford.\n\n" +
        "A Famous Railway\nNene Valley Railway is a favourite with film makers, due in particular to its ability to take on the appearance of a railway in any part of Europe. Octopussy, in the series of James Bond movies, is a good example of what can be done. Come and see where it was filmed.\n\n" +
        "Services for Schools\nThe Railway runs special timetable services from May to July to allow school groups to visit the railway and for teachers to set projects. The work can be done while pupils are here in the classroom. A special educational pack is available, price £1.50 plus postage. At other times of the year, school parties can hire the train ('Teddy Bear') with up to 3 carriages to travel along the Railway on non-service days. One month's prior booking is requested. There are special low fares for groups of 60 or more pupils. Telephone 01780 784444 for further information.\n\n" +
        "Private Hire of Trains\nThe Railway is a popular place for special family occasions or a company visit. It can provide the setting for a most interesting afternoon or evening out. Special programmes can be arranged to meet your wishes to include buffet, bar, entertainment, discos, etc. For further information please contact the General Manager at Wansford Station.",
      items: [
        { id: 11, statement: "Nene Valley Railway carries goods between distant cities.",                       answer: "B" },
        { id: 12, statement: "One adult and three children can buy a Family Fare.",                              answer: "A" },
        { id: 13, statement: "The Railway is the only attraction in Nene Park.",                                  answer: "B" },
        { id: 14, statement: "The biggest steam engine at Wansford is French.",                                  answer: "B" },
        { id: 15, statement: "You can see the German engine only at certain times of the year.",                  answer: "B" },
        { id: 16, statement: "Passengers must pay extra to see the train collection at Wansford.",                answer: "A" },
        { id: 17, statement: "The Railway has appeared in at least one film.",                                   answer: "A" },
        { id: 18, statement: "Groups of school children can only visit the railway in May or June.",              answer: "B" },
        { id: 19, statement: "A group of fifty pupils pays more per child than a group of sixty.",                answer: "A" },
        { id: 20, statement: "You can book a train for a private party.",                                         answer: "A" }
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
        "Some people have complained about this year's collection, New Writing 3, although I cannot understand why. Surely 500 pages of original writing of this quality, for £6.99, is pretty amazing?\n\n" +
        "Fiction – both parts of novels and complete short stories – makes up most of the book. There are some enjoyable pieces by famous writers, such as Candia McWilliam and Rose Tremain. It's a strange fact that the less well-known people seem to have written mainly about food. Take my advice about Jane Harris's Those Nails – this piece should definitely not be read just after meals. It contains some very unpleasant scenes which could turn your stomach!\n\n" +
        "There is fine work from nineteen poets, including R. S. Thomas and John Burnside. There are pieces from novels-in-progress by Jim Crace and Jane Rogers. Finally, there is a little non-fiction, which includes a very funny article by Alan Rusbridger on certain newspapers, and an extraordinary piece about herself from Ursula Owen. This is an exceptional collection and I for one can't wait to see what next year's choice will include.",
      items: [
        { id: 21, prompt: "What is the writer trying to do in the text?",
          options: [
            { letter: "A", text: "give her opinions about a new book" },
            { letter: "B", text: "give some information about new writers" },
            { letter: "C", text: "give some advice to writers" },
            { letter: "D", text: "give her opinion of newspaper journalists" }
          ], answer: "A" },
        { id: 22, prompt: "Why would somebody read the text?",
          options: [
            { letter: "A", text: "to find out more details about something" },
            { letter: "B", text: "to learn what next year's collection will contain" },
            { letter: "C", text: "to find out about Alan Rusbridger's new novel" },
            { letter: "D", text: "to decide whether to complain about something" }
          ], answer: "A" },
        { id: 23, prompt: "What does the writer think of New Writing 3?",
          options: [
            { letter: "A", text: "It's too long." },
            { letter: "B", text: "It's very amusing." },
            { letter: "C", text: "It's very good." },
            { letter: "D", text: "It's too serious." }
          ], answer: "C" },
        { id: 24, prompt: "How might you feel after reading Jane Harris's piece?",
          options: [
            { letter: "A", text: "hungry" },
            { letter: "B", text: "excited" },
            { letter: "C", text: "unhappy" },
            { letter: "D", text: "sick" }
          ], answer: "D" },
        { id: 25, prompt: "Which of the following describes New Writing 3?",
          cardLayout: true,
          options: [
            { letter: "A", title: "Great value:", body: "two novels, poems and articles for only £6.99" },
            { letter: "B", title: "Great value:", body: "the best of new writing for only £6.99" },
            { letter: "C", title: "Great value:", body: "poems by Tremain, Harris and Burnside for only £6.99" },
            { letter: "D", title: "Great value:", body: "newspapers for a whole year for only £6.99" }
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
      example: { number: 0, prompt: "A few   B any   C little   D much", answer: "A" },
      passageTitle: "CARTOON FILMS",
      passage:
        "Cartoon films have very (0) ___ limits. If you can draw something, you can (26) ___ it move on the cinema screen. The use (27) ___ computers now allows new ideas and advanced computer programs means that cartoons are becoming exciting again for people of (28) ___ ages.\n\n" +
        "By the (29) ___ of the 1970s, the cinema world had decided that cartoons were only for children. But soon (30) ___ , one or two new directors had some original new ideas. They proved that it was possible to make films in which both adults and children could (31) ___ the fun.\n\n" +
        "However, not (32) ___ cartoon films was successful. The Black Cauldron, for example, failed, mainly because it was too (33) ___ for children and too childish for adults. Directors learnt from this (34) ___ , and the film companies began to make large (35) ___ of money again.",
      items: [
        { id: 26, options: [ { letter: "A", text: "few" },        { letter: "B", text: "any" },          { letter: "C", text: "little" },       { letter: "D", text: "much" } ],         answer: "D" },
        { id: 27, options: [ { letter: "A", text: "for" },        { letter: "B", text: "of" },           { letter: "C", text: "with" },         { letter: "D", text: "by" } ],           answer: "B" },
        { id: 28, options: [ { letter: "A", text: "more" },       { letter: "B", text: "other" },        { letter: "C", text: "all" },          { letter: "D", text: "these" } ],        answer: "C" },
        { id: 29, options: [ { letter: "A", text: "end" },        { letter: "B", text: "finish" },       { letter: "C", text: "departure" },    { letter: "D", text: "back" } ],         answer: "A" },
        { id: 30, options: [ { letter: "A", text: "afterwards" }, { letter: "B", text: "later" },        { letter: "C", text: "next" },         { letter: "D", text: "then" } ],         answer: "A" },
        { id: 31, options: [ { letter: "A", text: "divide" },     { letter: "B", text: "add" },          { letter: "C", text: "mix" },          { letter: "D", text: "share" } ],        answer: "D" },
        { id: 32, options: [ { letter: "A", text: "every" },      { letter: "B", text: "both" },         { letter: "C", text: "any" },          { letter: "D", text: "each" } ],         answer: "A" },
        { id: 33, options: [ { letter: "A", text: "nervous" },    { letter: "B", text: "fearful" },      { letter: "C", text: "afraid" },       { letter: "D", text: "frightening" } ],  answer: "D" },
        { id: 34, options: [ { letter: "A", text: "damage" },     { letter: "B", text: "crime" },        { letter: "C", text: "mistake" },      { letter: "D", text: "fault" } ],        answer: "C" },
        { id: 35, options: [ { letter: "A", text: "amounts" },    { letter: "B", text: "accounts" },     { letter: "C", text: "numbers" },      { letter: "D", text: "totals" } ],       answer: "A" }
      ]
    }
  ]
};
