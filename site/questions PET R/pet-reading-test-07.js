// Cambridge PET Reading — Test 7 (Book 2, Test 3)
// VERBATIM from "Cambridge Preliminary English Test 2" (Cambridge UP).
// Source pages: Test 3 R&W = pp.46-56; reading key = p.118.

window.PET_R_TEST = {
  testInfo: {
    id: "pet-r-07",
    title: "PET Reading — Test 7",
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
      example: { number: 0, prompt: "NO BICYCLES AGAINST GLASS PLEASE", answer: "C" },
      items: [
        { id: 1, style: "message",
          noticeTitle: "To: All students  ·  From: College Secretary",
          noticeText: "Monday 6 May\nCan I remind you that all essays are due this Friday. No late work will be accepted unless accompanied by a doctor's letter.",
          prompt: " ",
          options: [
            { letter: "A", text: "The college secretary will post students their essays on Friday." },
            { letter: "B", text: "Students may hand in their essays after Friday if they can prove illness." },
            { letter: "C", text: "Unless your essay is due by Friday, you do not need to reply." }
          ], answer: "B" },
        { id: 2, style: "formal",
          noticeTitle: "PRESCRIPTION",
          noticeText: "TAKE ONE TABLET THREE TIMES A DAY AFTER MEALS. FINISH THE PRESCRIPTION.",
          prompt: " ",
          options: [
            { letter: "A", text: "Take the tablets regularly until the bottle is empty." },
            { letter: "B", text: "Take one tablet every day until they are finished." },
            { letter: "C", text: "Take three tablets after meals until you feel better." }
          ], answer: "A" },
        { id: 3, style: "note",
          noticeText: "Ben,\nWhy not bring your new game round tonight – we can use my brother's TV. I'm playing football till 7.00, so anytime after that.",
          noticeSig: "Kim",
          prompt: "Kim suggests",
          options: [
            { letter: "A", text: "meeting at the football match." },
            { letter: "B", text: "going to Ben's house later." },
            { letter: "C", text: "playing on his brother's computer." }
          ], answer: "C" },
        { id: 4, style: "note",
          noticeTitle: "FREE SOFA! (Owner moving back to New Zealand)",
          noticeText: "Must have transport – collect from John any evening this week. Phone 452611 to arrange a suitable time.",
          prompt: " ",
          options: [
            { letter: "A", text: "John can deliver the sofa if the time is convenient." },
            { letter: "B", text: "Anyone wanting this sofa must pick it up this week." },
            { letter: "C", text: "Call John with advice on how he can transport his sofa." }
          ], answer: "B" },
        { id: 5, style: "formal",
          noticeTitle: "BOAT HIRE",
          noticeText: "INSURANCE INCLUDED · FUEL EXTRA · NO HIDDEN CHARGES",
          prompt: "The hire charge covers all the costs",
          options: [
            { letter: "A", text: "including fuel and insurance." },
            { letter: "B", text: "except insurance." },
            { letter: "C", text: "apart from fuel." }
          ], answer: "C" }
      ]
    },

    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTIONS 6–10",
      type: "match-people-texts",
      instruction: [
        "The people below all want to come to Britain to study English.",
        "On the opposite page there are descriptions of eight colleges.",
        "Decide which college (letters A–H) would be the most suitable for each person (numbers 6–10).",
        "For each of these numbers mark the correct letter on your answer sheet."
      ],
      textsTitle: "English Colleges in Britain",
      items: [
        { id: 6,  name: "Marta",  description: "Marta wants a course in Business Studies and English, starting in September. She would prefer to be in a city, but wants a college which will organise visits, so she can see something of Britain.", answer: "H" },
        { id: 7,  name: "Jean",   description: "Jean wants to attend classes for a few hours a week in July, so that he has plenty of free time to visit the countryside. He wants to stay in a city, with a family.", answer: "A" },
        { id: 8,  name: "Laura",  description: "Laura is looking for a full-time beginners' course and can come to Britain at any time. She is keen on sport and wants to stay with a family.", answer: "F" },
        { id: 9,  name: "Marek",  description: "Marek likes big cities. He hopes to find work during the day, so he is looking for an evening class. He wants to live in a flat or house.", answer: "C" },
        { id: 10, name: "Birgit", description: "Birgit is going to spend August in Britain. She knows some English already and wants a full-time course. She wants to meet people through the college and live with a family.", answer: "E" }
      ],
      texts: [
        { letter: "A", title: "Lowton College",     body: "Situated in a pleasant area of the city close to the river. Convenient for North Wales and the English Lake District.\n• Courses in English run all year.\n• Part-time courses available in the evenings/days.\n• We will arrange accommodation with an English family." },
        { letter: "B", title: "Bristow College",    body: "The college is in the centre of Bristow.\n• Full-time courses at all levels, beginners to advanced, from September to June.\n• Visits arranged to places of interest.\n• Excellent range of sports offered.\n• Students arrange their own accommodation in flats and houses." },
        { letter: "C", title: "Shepton College",    body: "Shepton College is in the centre of London close to underground and buses.\n☆ Classes are offered all through the year.\n☆ Daytime English courses up to ten hours per week. Evening classes of four hours per week.\n☆ Extra classes offered in English for Business.\n☆ Students arrange their own accommodation in flats and houses." },
        { letter: "D", title: "Frampton College",   body: "Situated in West London close to bus and underground.\n● Courses run from September to July (daytime only).\n● Special courses available, e.g. English for Business.\n● Summer school in July and August.\n● Accommodation arranged in student hostels." },
        { letter: "E", title: "Daunston College",   body: "Daunston is a small town in the Midlands near pleasant countryside.\n● Part-time and full-time classes available in August.\n● Full-time summer school in August.\n● Complete beginners part-time only.\n● Trips and other social events arranged regularly.\n● Accommodation in the college or with families." },
        { letter: "F", title: "Exford College",     body: "Exford is beside the sea and surrounded by beautiful countryside.\n➤ Courses at all levels, September to June (full-time).\n➤ Summer schools (mornings only) during August.\n➤ Full social programme including sports and hobby clubs provided by the college.\n➤ Students live in college rooms or with families." },
        { letter: "G", title: "Chesford College",   body: "Situated in the centre of Chesford, a quiet market town.\n◊ English courses offered from September to June, daytime and evenings.\n◊ Trips organised to Cambridge, Oxford and London.\n◊ Accommodation is with local families." },
        { letter: "H", title: "Howe College",       body: "The college is in the city centre, but near the North Yorkshire countryside and the sea.\n• Classes run from September to June.\n• Part-time and full-time courses from beginners to advanced (daytime only).\n• Full-time courses in English with Business Studies.\n• Trips arranged to places of interest.\n• Help given in finding a flat or room in the area." }
      ]
    },

    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 11–20",
      type: "true-false",
      instruction: [
        "Look at the sentences below about an English city.",
        "Read the text on the opposite page to decide if each sentence is correct or incorrect.",
        "If it is correct, mark A on your answer sheet.",
        "If it is not correct, mark B on your answer sheet."
      ],
      passageTitle: "Norwich",
      passage:
        "Norwich, the capital of the part of Britain known as East Anglia, has existed as a place to live for more than two thousand years. It began as a small village beside the River Wensum. At the time of the Norman invasion in 1066 it had grown to become one of the largest towns in England.\n\n" +
        "With two cathedrals and a mosque, Norwich has long been a popular centre for various religions. The first cathedral was built in 1095 and has recently celebrated its 900th anniversary, while Norwich itself had a year of celebration in 1994 to mark the 800th anniversary of the city receiving a Royal Charter. This allowed it to be called a city and to govern itself independently.\n\n" +
        "Today, in comparison with places like London or Manchester, Norwich is quite small, with a population of around 150,000, but in the 16th century Norwich was the second city of England. It continued to grow for the next 300 years and got richer and richer, becoming famous for having as many churches as there are weeks in the year and as many pubs as there are days in the year.\n\n" +
        "Nowadays, there are far fewer churches and pubs, but in 1964 the University of East Anglia was built in Norwich. With its fast-growing student population and its success as a modern commercial centre (Norwich is the biggest centre for insurance services outside London), the city now has a wide choice of entertainment: theatres, cinemas, nightclubs, busy cafés, excellent restaurants, and a number of arts and leisure centres. There is also a football team, whose colours are green and yellow. The team is known as 'The Canaries', though nobody can be sure why.\n\n" +
        "Now the city's attractions include another important development, a modern shopping centre called 'The Castle Mall'. The people of Norwich lived with a very large hole in the middle of their city for over two years, as builders dug up the main car park. Lorries moved nearly a million tons of earth so that the roof of the Mall could become a city centre park, with attractive water pools and hundreds of trees. But the local people are really pleased that the old open market remains, right in the heart of the city and next to the new development. Both areas continue to do good business, proving that Norwich has managed to mix the best of the old and the new.",
      items: [
        { id: 11, statement: "The River Wensum flows through East Anglia.",                                    answer: "A" },
        { id: 12, statement: "People have lived by the River Wensum for at least 2000 years.",                  answer: "A" },
        { id: 13, statement: "In the 11th century, Norwich was a small village.",                                answer: "B" },
        { id: 14, statement: "Norwich has been a city since its first cathedral was built.",                     answer: "B" },
        { id: 15, statement: "Norwich has always been one of the smallest English cities.",                      answer: "B" },
        { id: 16, statement: "There are more than 50 churches in Norwich.",                                       answer: "B" },
        { id: 17, statement: "The number of students in Norwich is increasing.",                                 answer: "A" },
        { id: 18, statement: "The Norwich City football team is called 'The Canaries' because of the colours the players wear.", answer: "B" },
        { id: 19, statement: "'The Castle Mall' took more than two years to build.",                              answer: "A" },
        { id: 20, statement: "Norwich people still like using the old market as well as shopping in 'The Castle Mall'.", answer: "A" }
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
        "When I opened the first 'Body Shop' in 1976 my only object was to earn enough to feed my children. Today 'The Body Shop' is an international company rapidly growing all around the world. In the years since we began I have learned a lot. Much of what I have learned will be found in this book, for I believe that we, as a company, have something worth saying about how to run a successful business without giving up what we really believe in.\n\n" +
        "It's not a normal business book, nor is it just about my life. The message is that to succeed in business you have to be different. Business can be fun, a business can be run with love and it can do good. In business, as in life, I need to enjoy myself, to have a feeling of family and to feel excited by the unexpected. I have always wanted the people who work for 'The Body Shop' to feel the same way.\n\n" +
        "Now this book sends these ideas of mine out into the world, makes them public. I'd like to think there are no limits to our 'family', no limits to what can be done. I find that an exciting thought. I hope you do, too.",
      items: [
        { id: 21, prompt: "What is the writer's main purpose in writing this text?",
          options: [
            { letter: "A", text: "to tell the reader her life story" },
            { letter: "B", text: "to introduce her ideas to the reader" },
            { letter: "C", text: "to explain how international companies operate" },
            { letter: "D", text: "to tell the reader how she brought up a family" }
          ], answer: "B" },
        { id: 22, prompt: "What would someone learn from this text?",
          options: [
            { letter: "A", text: "how to make a lot of money" },
            { letter: "B", text: "how to write a book about business" },
            { letter: "C", text: "what the writer's family is like" },
            { letter: "D", text: "what the writer's book is about" }
          ], answer: "D" },
        { id: 23, prompt: "How does the writer feel about the business she runs?",
          options: [
            { letter: "A", text: "She doesn't care about success if her children are fed." },
            { letter: "B", text: "She just runs it for her own entertainment." },
            { letter: "C", text: "It is not like any other company." },
            { letter: "D", text: "It is likely to become even more successful." }
          ], answer: "C" },
        { id: 24, prompt: "What kind of workers does the writer like to employ?",
          options: [
            { letter: "A", text: "workers who can explain her ideas" },
            { letter: "B", text: "workers who get on well with the public" },
            { letter: "C", text: "workers who have the same attitudes as she does" },
            { letter: "D", text: "workers who have their own families" }
          ], answer: "C" },
        { id: 25, prompt: "What kind of person does the writer seem to be?",
          options: [
            { letter: "A", text: "She seems to be someone with strong opinions." },
            { letter: "B", text: "She doesn't seem to be very confident." },
            { letter: "C", text: "She is mainly interested in making money." },
            { letter: "D", text: "She sees running a business as just a job." }
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
      example: { number: 0, prompt: "A of   B down   C in   D through", answer: "A" },
      passageTitle: "THE ROCKIES",
      passage:
        "The Rocky Mountains run almost the length (0) ___ North America. They start in the North-west, but lie only a (26) ___ hundred miles from the centre in more southern areas. Although the Rockies are smaller (27) ___ the Alps, they are no less wonderful.\n\n" +
        "There are many roads across the Rockies, (28) ___ the best way to see them is to (29) ___ by train. You start from Vancouver, (30) ___ most attractive of Canada's big cities. Standing with its feet in the water and its head in the mountains, this city (31) ___ its residents to ski on slopes just 15 minutes by car from the city (32) ___.\n\n" +
        "Thirty passenger trains a day used to (33) ___ off from Vancouver on the cross-continent railway. Now there are just three a week, but the ride is still a great adventure. You sleep on board, (34) ___ is fun, but travel through some of the best (35) ___ at night.",
      items: [
        { id: 26, options: [ { letter: "A", text: "of" },         { letter: "B", text: "lot" },          { letter: "C", text: "few" },          { letter: "D", text: "couple" } ],       answer: "C" },
        { id: 27, options: [ { letter: "A", text: "from" },       { letter: "B", text: "to" },           { letter: "C", text: "as" },           { letter: "D", text: "than" } ],         answer: "D" },
        { id: 28, options: [ { letter: "A", text: "but" },        { letter: "B", text: "because" },      { letter: "C", text: "unless" },       { letter: "D", text: "since" } ],        answer: "A" },
        { id: 29, options: [ { letter: "A", text: "drive" },      { letter: "B", text: "travel" },       { letter: "C", text: "ride" },         { letter: "D", text: "pass" } ],         answer: "B" },
        { id: 30, options: [ { letter: "A", text: "a" },          { letter: "B", text: "one" },          { letter: "C", text: "the" },          { letter: "D", text: "its" } ],          answer: "C" },
        { id: 31, options: [ { letter: "A", text: "lets" },       { letter: "B", text: "allows" },       { letter: "C", text: "offers" },       { letter: "D", text: "gives" } ],        answer: "B" },
        { id: 32, options: [ { letter: "A", text: "centre" },     { letter: "B", text: "circle" },       { letter: "C", text: "middle" },       { letter: "D", text: "heart" } ],        answer: "A" },
        { id: 33, options: [ { letter: "A", text: "leave" },      { letter: "B", text: "period" },       { letter: "C", text: "take" },         { letter: "D", text: "set" } ],          answer: "D" },
        { id: 34, options: [ { letter: "A", text: "but" },        { letter: "B", text: "which" },        { letter: "C", text: "who" },          { letter: "D", text: "where" } ],        answer: "B" },
        { id: 35, options: [ { letter: "A", text: "scenery" },    { letter: "B", text: "view" },         { letter: "C", text: "site" },         { letter: "D", text: "beauty" } ],       answer: "A" }
      ]
    }
  ]
};
