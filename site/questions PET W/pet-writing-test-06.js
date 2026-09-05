// Cambridge PET — Writing — Test 6 (Cambridge Preliminary English Test 2 · Test 2)
// VERBATIM from "Cambridge Preliminary English Test 2" (Cambridge UP, 2003).
// Source pages: Writing pp.35-37; key + samples pp.102-110.

window.PET_W_TEST = {
  testInfo: {
    id: "pet-w-06",
    title: "PET Writing — Test 6",
    paper: "Paper 1 · Writing",
    level: "B1",
    totalTime: 45,
    parts: 3
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "sentence-transformation",
      topic: "Going to the supermarket",
      instruction: [
        "Here are some sentences about going to the supermarket.",
        "For each question, complete the second sentence so that it means the same as the first, using no more than three words.",
        "Write only the missing words on your answer sheet.",
        "You may use this page for any rough work."
      ],
      example: {
        first: "My mother lives a long way from the supermarket.",
        beforeBlank: "There isn't",
        answer: "a supermarket near",
        afterBlank: "my mother's house."
      },
      items: [
        { id: 1, first: "When she has to walk to the supermarket she finds it tiring.", beforeBlank: "She gets",                                  afterBlank: "when she has to walk to the supermarket.", answer: "tired" },
        { id: 2, first: "She is often driven to the supermarket by her neighbour.",     beforeBlank: "Her neighbour often",                       afterBlank: "a lift to the supermarket.",               answer: "gives her" },
        { id: 3, first: "There are many types of coffee there.",                        beforeBlank: "You can buy",                               afterBlank: "types of coffee there.",                    answer: "a lot of" },
        { id: 4, first: "She asked an assistant how much the Colombian coffee cost.",   beforeBlank: "She asked: 'How",                           afterBlank: "the Colombian coffee cost?'",              answer: "much does" },
        { id: 5, first: "The Colombian coffee cost less than the Kenyan coffee.",       beforeBlank: "The Colombian coffee wasn't",               afterBlank: "as the Kenyan coffee.",                    answer: "as expensive" }
      ]
    },

    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTION 6",
      type: "writing-task",
      prompt: "You have just had a wonderful holiday staying with some English-speaking friends in the countryside.\n\nWrite an e-mail to your friends. In your e-mail, you should\n\n• thank them for your stay\n• say what you most enjoyed about the countryside\n• suggest where you could meet each other next time.\n\nWrite 35–45 words on your answer sheet.",
      wordCount: "35–45 words",
      items: [
        {
          id: 6,
          band: "5",
          answer:
            "Dear Mary and Fred\n" +
            "Are you already missing me? I'm very well. the travel back was good.\n" +
            "I really loved that peacefull place. I'm so thankfull for all and I'd like to offer you a dinner in my home next saturday. What do you think?\n" +
            "See you\n" +
            "Leticia"
        }
      ]
    },

    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 7 or 8",
      type: "writing-task",
      choices: [
        { id: 7,
          intro: "This is part of a letter you receive from your penfriend.",
          image: "https://audio.mock-stream.com/PET-Writing/test6/q7_ribbon.png",
          outro: "Now write a letter to your penfriend.\nWrite your letter in about 100 words on your answer sheet." },
        { id: 8,
          intro: "You have to write a story for your English homework.\n\nYour story must have this title:",
          highlight: "An exciting adventure",
          outro: "Write your story in about 100 words on your answer sheet." }
      ],
      wordCount: "about 100 words",
      items: [
        {
          id: 7,
          band: "5",
          answer:
            "Dear Jake,\n" +
            "The first and most important issue is not to reduce the food you eat daily. You can change the menu and the way you eat but if you start a diet by yourself the first thing you'll lose is your health.\n" +
            "You can find many good gyms and if you want I can read the names for you in another letter. However, you don't need necessarily to go to a gym to stay fit. Some small changes to your life can do a big difference. For example, you can start by walking some time during the morning or in the lunch time.\n" +
            "I hope you don't have any health problem and it would be nice if you went to a doctor for a check-up before starting any exercise.\n" +
            "Best regards,\n" +
            "Fabio",
          altSample: {
            q: 8,
            band: "5",
            text:
              "An exciting Adventure\n" +
              "Last january I travelled, with a friend, by car during 33 days in Brasil.\n" +
              "In this trip we visited a lot of places and we saw many beatiful things\n" +
              "At the begining we had to drive more than 4.000 km to get into the first beach. When we arrived we drank lots of beers to celebrate the first part of our trip.\n" +
              "We were very tired because we had been driving for 42 hours.\n" +
              "After that we went to other beach. We ate fish with vegetables and fruit juice right after we had drunk 20 beers!\n" +
              "To summarize our exciting trip, we spent one month travelling, drinking beer and visiting the beachs of the Brazilian coast."
          }
        }
      ]
    }
  ]
};
