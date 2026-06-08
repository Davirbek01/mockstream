// Cambridge PET (Preliminary English Test) for Schools — Reading — Test 3
// VERBATIM transcription from "Preliminary English Test for Schools 1" (Cambridge UP, 2010).
// Paper 1 Reading: 5 parts, 35 questions, ~50 minutes.
// Source pages: Test 3 = pp.52-60; answer key = p.129.

window.PET_R_TEST = {
  testInfo: {
    id: "pet-r-03",
    title: "PET Reading — Test 3",
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
          noticeTitle: "From: Juan  ·  To: Maria",
          noticeText: "I want to sell my guitar. Pedro wants it too, but you asked me first. Let me know tomorrow at school.",
          prompt: " ",
          options: [
            { letter: "A", text: "Juan will sell Maria his guitar if she wants it." },
            { letter: "B", text: "Pedro has a guitar which Maria might want to buy." },
            { letter: "C", text: "Juan would prefer to sell his guitar to Pedro." }
          ],
          answer: "A"
        },
        {
          id: 2, style: "note",
          noticeTitle: "Maths Homework",
          noticeText: "Some of you have told me the homework is a bit difficult. So if you haven't finished it by Friday, you can hand it in on Monday.",
          noticeSig: "Mr Peters",
          prompt: " ",
          options: [
            { letter: "A", text: "The homework given out on Friday must be returned by Monday." },
            { letter: "B", text: "Students who wish to hand in their homework on Monday should tell Mr Peters." },
            { letter: "C", text: "Anyone having problems with their homework may have extra time to complete it." }
          ],
          answer: "C"
        },
        {
          id: 3, style: "note",
          noticeTitle: "Dan,",
          noticeText: "Don't forget to put your football shirt in the washing machine as soon as you get home from the match. Add soap powder and turn dial to number 3.",
          noticeSig: "Mum",
          prompt: "What does Dan have to do?",
          options: [
            { letter: "A", text: "Remember to make sure his football shirt is clean in time for the match." },
            { letter: "B", text: "Remember where he put the football shirt that he needs for the match." },
            { letter: "C", text: "Remember to wash his football shirt after the match." }
          ],
          answer: "C"
        },
        {
          id: 4, style: "message",
          noticeTitle: "From: Sarah  ·  To: Janine",
          noticeText: "Janine - my birthday meal's booked for 6.30 Saturday at Luigi's restaurant. I know there are things you can't eat, so I've attached a menu. Tell me if it's OK.",
          noticeSig: "Sarah",
          prompt: "What does Sarah need to know?",
          options: [
            { letter: "A", text: "if Janine will be available to go to the restaurant" },
            { letter: "B", text: "if the food at the restaurant will be all right for Janine" },
            { letter: "C", text: "if Janine wants to see the restaurant menu before Saturday" }
          ],
          answer: "B"
        },
        {
          id: 5, style: "formal",
          noticeTitle: "PARKSIDE POOL",
          noticeText: "BEYOND THIS RED LINE THE WATER IS VERY SHALLOW – NO DIVING IN THIS AREA",
          prompt: " ",
          options: [
            { letter: "A", text: "Part of the pool is not deep enough for diving." },
            { letter: "B", text: "Diving is forbidden in all areas of the pool." },
            { letter: "C", text: "The far end of the pool is reserved for divers only." }
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
        "The young people below are all looking for a clothes shop to go to this weekend.",
        "On the opposite page there are eight online reviews of clothes shops.",
        "Decide which shop would be the most suitable for the following people.",
        "For questions 6–10, mark the correct letter (A–H) on your answer sheet."
      ],
      textsTitle: "Clothes Shops",
      items: [
        { id: 6,  name: "George", description: "George has to buy some new jeans but hasn't much money to spend. He's quite tall, so he likes to try on clothes to check that they fit.", answer: "F" },
        { id: 7,  name: "Rosa",   description: "Rosa would like a beautiful dress for her school's end-of-year party, with earrings to match. Her mother has given her quite a lot of money to spend, and she'd like to buy everything in one store.", answer: "D" },
        { id: 8,  name: "Stefan", description: "Stefan wants to get a smart designer rugby shirt, and doesn't mind how expensive it is. He prefers to choose his clothes online before he goes to town to buy anything.", answer: "A" },
        { id: 9,  name: "Tanya",  description: "Tanya wants to buy some skirts and tops that are a bit unusual, so that she'll look different from everyone else at school. She wants to try things on in the shop to make sure they suit her.", answer: "H" },
        { id: 10, name: "Suzie",  description: "Suzie needs to get some fairly cheap sports clothes for wearing at the gym. She's in a hurry, so doesn't want to spend too long shopping.", answer: "B" }
      ],
      texts: [
        { letter: "A", title: "Streetwear", body: "This shop has all the top-of-the-range sports and leisurewear labels. The clothes aren't cheap but they're all high quality. Keep up-to-date with their latest styles by going to their website." },
        { letter: "B", title: "Balloon",    body: "This is the place to come for great designs and low prices. There are no changing rooms, but the service is quick and helpful. They stock plenty of jeans, T-shirts and other everyday fashions, plus a range of clothes for indoor and outdoor fitness activities." },
        { letter: "C", title: "Zizi's",     body: "This small shop specialises in clothes for larger and smaller sizes and it's especially good for sportswear. The prices are high, but the assistants are friendly and efficient. The shop doesn't have a website yet." },
        { letter: "D", title: "Teenscape",  body: "This shop is really popular with young people looking for clothes for special events — you'll pay a bit more, but you'll look fantastic! It's a huge shop and has everything you could possibly want — including a wide selection of jewellery and shoes. You can see the full range of their products online." },
        { letter: "E", title: "Cinders",    body: "This tiny shop is full of the most wonderful partywear — for girls and smart suits for boys. There are some unusual styles too. They're planning to launch a range of matching shoes and jewellery some time next year — check their website for details." },
        { letter: "F", title: "Orange",     body: "A great store for shopping with pocket money. It stocks plenty of basic boys' and girls' clothes in a wide range of sizes and lengths, but the styles don't differ much from year to year. The staff are nice, and there are lots of changing rooms." },
        { letter: "G", title: "Fanfare",    body: "If you're looking for something plain and simple for school or leisure — dresses, jeans, shirts, skirts, sportswear — you're sure to find it here. It's always crowded because the prices are so low. There aren't any changing rooms, and the queues to pay are always long — so be prepared to wait!" },
        { letter: "H", title: "Wardrobe",   body: "This shop has an interesting range of reasonably-priced girls' clothes for everyday wear, with styles that you just don't see in other stores. There are plenty of changing rooms. Look out for their lovely hand-made jewellery — especially their earrings." }
      ]
    },

    // ───────────────────────────────── PART 3 ─────────────────────────────────
    {
      partNumber: 3,
      label: "PART 3",
      questionsLabel: "QUESTIONS 11–20",
      type: "true-false",
      instruction: [
        "Look at the sentences below about sports courses available in Newport.",
        "Read the text on the opposite page to decide if each sentence is correct or incorrect.",
        "If it is correct, mark A on your answer sheet.",
        "If it is not correct, mark B on your answer sheet."
      ],
      passageTitle: "Citisport in Newport",
      passage:
        "We at Citisport aim to improve sports training and facilities in Newport, giving you more opportunity to try both new and traditional sports.\n\n" +
        "As well as running our own courses, Citisport can also provide sports advisers and qualified coaches for youth groups, schools and colleges in and around Newport.\n\n" +
        "And if you can't find the sport you want to take up, let us know and we'll try to find you a local club which will help you.\n\n" +
        "Golf\nWe are pleased to be able to offer lessons at Kingsway Golf Centre just outside Newport. These are run by experienced golf professionals, and are held on an all-weather practice area. The Centre also has Pay and Play facilities so you can continue to play and make progress after the lessons have finished. These facilities are available to all players, whether or not they are members of the Centre.\n\n" +
        "The adult lessons are open to anyone aged 13 and over, and are suitable for all levels from beginners upwards. These take place on Wednesdays from 3.00 to 4.00 pm over a period of six weeks. Children's lessons for 7–12 year olds are held from 2.00 to 3.00 pm on Saturdays during term time.\n\n" +
        "Tennis\nThe Citisport tennis courses provide an opportunity for local people to develop their skills on the brand new indoor tennis court at Newport Leisure Centre. All equipment can be provided, but please feel free to use your own racket if you prefer. Our Starter course is held on Mondays from 7.00 to 8.00 pm, and is for beginners of 12 years and over. Our Improver course, which takes place on Tuesdays from 8.00 to 9.00 pm, is for players with some experience.\n\n" +
        "Football for girls\nBy popular request, Citisport is holding another one-day, girls-only football course. This aims to give local girls, whether new or experienced players, the chance to learn essential skills and develop more advanced ones. One of Newport City Football Club's players will come along to take part in a question and answer session during the day. The course fee of £30 includes morning and afternoon refreshments. Please bring a packed lunch. The course will take place on Saturday, 9th November from 9.00 to 5.00 pm, and is open to all girls aged 10–14 years living in the Newport area.\n\n" +
        "Gymnastics\nThis course is for beginners aged 8–14 and will provide an introduction to basic skills. There is a maximum of six pupils per coach in each class. At the end of the course there is a demonstration for friends and family of all the skills learnt there. Thursdays, 6.00 to 7.00 pm",
      items: [
        { id: 11, statement: "Citisport can send their own instructors to schools in the area.",                          answer: "A" },
        { id: 12, statement: "If the sport you want is unavailable, Citisport will set up a course for you.",              answer: "B" },
        { id: 13, statement: "The golf lessons can take place even in bad weather.",                                       answer: "B" },
        { id: 14, statement: "It is necessary to join the Kingsway Golf Centre in order to practise there.",               answer: "B" },
        { id: 15, statement: "Teenagers can attend golf lessons on Wednesday afternoons.",                                 answer: "A" },
        { id: 16, statement: "Citisport will provide you with a tennis racket if necessary.",                              answer: "A" },
        { id: 17, statement: "The football course is for girls of all levels of ability.",                                  answer: "A" },
        { id: 18, statement: "A Newport City player will organise the day's football training.",                            answer: "B" },
        { id: 19, statement: "A midday meal is included in the price of the girls' football course.",                       answer: "B" },
        { id: 20, statement: "Each coach will teach up to six people on the gymnastics course.",                            answer: "A" }
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
      passageTitle: "Baking",
      passageSubtitle: "By Sam Jarvis, aged 12",
      passage:
        "My grandmother loves making bread and cakes, and is always surprised that the rest of my family never do any baking. So my parents decided they'd take me and my younger sister on a course, so that we could all find out how to make bread — and pizza, our favourite food! We booked our places, and set off for Oakton Farm in the countryside.\n\n" +
        "It was a very long drive, and when we arrived we went straight to bed. The next morning we got up early, fed the ducks on the lake, and looked at the bull in the next field. Then we met our teacher, Michael, who seemed quite strict, and the other parents and children, who were really friendly.\n\n" +
        "The cooking part was brilliant. Michael gave us long white coats to wear, which we all felt a bit silly in. Then we all made bread rolls, mixing flour and water with our hands. My sister kept complaining at first. Then even she started to enjoy it, and to concentrate on following the instructions. Dad made lots of mess, I got flour on the floor and in my hair, and Mum didn't even get angry! I took ages to make my rolls, though.\n\n" +
        "We finally put our initials on the bottom of each roll, then made some pizzas and decorated them, which was fun. And we didn't even have to do the washing-up! Then for something to do while the pizzas were cooking, we all went for a swim in the lake. It was fantastic. Then we went back inside and ate our pizzas. They were the best we'd ever tasted!",
      items: [
        {
          id: 21, prompt: "What is Sam trying to do in the text?",
          options: [
            { letter: "A", text: "explain how to bake cakes" },
            { letter: "B", text: "discuss the importance of knowing how to cook" },
            { letter: "C", text: "describe how he enjoyed a day with his family" },
            { letter: "D", text: "inform readers about life on a farm" }
          ],
          answer: "C"
        },
        {
          id: 22, prompt: "Sam's parents took the children to Oakton Farm because they wanted them to",
          options: [
            { letter: "A", text: "learn a new skill." },
            { letter: "B", text: "make something for their grandmother." },
            { letter: "C", text: "spend time in the countryside." },
            { letter: "D", text: "meet other people the same age." }
          ],
          answer: "A"
        },
        {
          id: 23, prompt: "What do we learn about Oakton Farm?",
          options: [
            { letter: "A", text: "It had lots of animals living there." },
            { letter: "B", text: "It was far from where they lived." },
            { letter: "C", text: "It was just like Sam expected." },
            { letter: "D", text: "It was run by a friendly man." }
          ],
          answer: "B"
        },
        {
          id: 24, prompt: "What does Sam say about his cooking experience?",
          options: [
            { letter: "A", text: "He was better at it than his sister." },
            { letter: "B", text: "He liked wearing the clothes he was given." },
            { letter: "C", text: "He could be untidy without getting into trouble." },
            { letter: "D", text: "He was the first to finish." }
          ],
          answer: "C"
        },
        {
          id: 25, prompt: "What might Sam write in a postcard to his grandmother?",
          options: [
            { letter: "A", text: "I made some great bread rolls, but my sister ate them because we didn't know who they belonged to." },
            { letter: "B", text: "We had to clean up the kitchen, like at your house. But we've made great pizza, just like you taught us." },
            { letter: "C", text: "I loved it, but my sister didn't really. She found it hard to do what the teacher told her." },
            { letter: "D", text: "We liked swimming in the lake — it helped to pass the time while we waited for our lovely pizzas to be ready." }
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
        prompt: "A were   B did   C had   D got",
        answer: "A"
      },
      passageTitle: "Birth of the Movies",
      passage:
        "Did you know that cinema is more than 100 years old? Moving pictures (0) ___ invented by the brothers Louis and Auguste Lumière. The first showing of a moving picture or 'movie' (26) ___ place in a cinema in Paris on 28th December 1895. On that day, the Lumière brothers showed movies (27) ___ their newly-invented machine, called the Cinematographe. The audience saw a funny film in (28) ___ a gardener spilt a lot of water on (29) ___ by accident. Everyone really loved it!\n\n" +
        "Cinema very (30) ___ became popular all over the world. In 1907 the first film studios were built in a (31) ___ of Los Angeles called Hollywood. (32) ___ the 1920s, Hollywood had become the centre of the world film (33) ___.\n\n" +
        "To begin with, the movies had no sound. Words (34) ___ on the screen from time to time (35) ___ the story.",
      items: [
        { id: 26, options: [ { letter: "A", text: "found" },     { letter: "B", text: "took" },        { letter: "C", text: "went" },        { letter: "D", text: "gave" } ],       answer: "B" },
        { id: 27, options: [ { letter: "A", text: "doing" },     { letter: "B", text: "making" },      { letter: "C", text: "setting" },     { letter: "D", text: "using" } ],      answer: "C" },
        { id: 28, options: [ { letter: "A", text: "where" },     { letter: "B", text: "who" },         { letter: "C", text: "which" },       { letter: "D", text: "what" } ],       answer: "C" },
        { id: 29, options: [ { letter: "A", text: "yourself" },  { letter: "B", text: "himself" },     { letter: "C", text: "themselves" },  { letter: "D", text: "itself" } ],     answer: "B" },
        { id: 30, options: [ { letter: "A", text: "quickly" },   { letter: "B", text: "immediately" }, { letter: "C", text: "fast" },        { letter: "D", text: "early" } ],      answer: "A" },
        { id: 31, options: [ { letter: "A", text: "place" },     { letter: "B", text: "site" },        { letter: "C", text: "location" },    { letter: "D", text: "district" } ],   answer: "D" },
        { id: 32, options: [ { letter: "A", text: "To" },        { letter: "B", text: "At" },          { letter: "C", text: "For" },         { letter: "D", text: "By" } ],         answer: "D" },
        { id: 33, options: [ { letter: "A", text: "industry" },  { letter: "B", text: "company" },     { letter: "C", text: "trade" },       { letter: "D", text: "firm" } ],       answer: "A" },
        { id: 34, options: [ { letter: "A", text: "developed" }, { letter: "B", text: "happened" },    { letter: "C", text: "appeared" },    { letter: "D", text: "displayed" } ],  answer: "C" },
        { id: 35, options: [ { letter: "A", text: "prove" },     { letter: "B", text: "explain" },     { letter: "C", text: "direct" },      { letter: "D", text: "advise" } ],     answer: "B" }
      ]
    }
  ]
};
