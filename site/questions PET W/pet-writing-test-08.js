// Cambridge PET — Writing — Test 8 (Cambridge Preliminary English Test 2 · Test 4)
// VERBATIM from "Cambridge Preliminary English Test 2" (Cambridge UP, 2003).
// Source pages: Writing pp.75-77; key + samples pp.135-144.

window.PET_W_TEST = {
  testInfo: {
    id: "pet-w-08",
    title: "PET Writing — Test 8",
    paper: "Paper 1 · Writing",
    level: "B1",
    totalTime: 45,
    parts: 3
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "sentence-transformation",
      topic: "Visiting a hospital",
      instruction: [
        "Here are some sentences about visiting a hospital.",
        "For each question, complete the second sentence so that it means the same as the first, using no more than three words.",
        "Write only the missing words on your answer sheet.",
        "You may use this page for any rough work."
      ],
      example: {
        first: "The nurses' home is behind the hospital.",
        beforeBlank: "The hospital is",
        answer: "in front of",
        afterBlank: "the nurses' home."
      },
      items: [
        { id: 1, first: "My appointment with Dr Gibson is at ten o'clock.",       beforeBlank: "At ten o'clock I am",       afterBlank: "an appointment with Dr Gibson.",  answer: "going to have" },
        { id: 2, first: "The office is Dr Gibson's.",                              beforeBlank: "This office",                afterBlank: "to Dr Gibson.",                    answer: "belongs" },
        { id: 3, first: "Dr Gibson told me to take off my shoes and socks.",       beforeBlank: "Dr Gibson said: 'Please take", afterBlank: "and socks off.'",               answer: "your shoes" },
        { id: 4, first: "It would be a good idea to take more exercise.",          beforeBlank: "'You really",                afterBlank: "to take more exercise.'",          answer: "ought to" },
        { id: 5, first: "I was given some information about a local gym.",         beforeBlank: "The hospital",               afterBlank: "some information about a local gym.", answer: "gave me" }
      ]
    },

    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTION 6",
      type: "writing-task",
      prompt: "You have received some good news and want to tell your friend in Australia about it.\n\nWrite an e-mail to your friend. In your e-mail, you should\n\n• explain your good news\n• say how you feel about it\n• ask about your friend's family.\n\nWrite 35–45 words on your answer sheet.",
      wordCount: "35–45 words",
      items: [
        {
          id: 6,
          band: "5",
          answer:
            "Hi! How are you? Yesterday, I passed a examination, so I can go the upper class. I'd been afraid that I didn't pass it, but I could. I can't believe it. How about you? Is anything special?\n" +
            "By the way, how are your parents? It is long time since I met them. Please say hello to them.\n" +
            "I'll write soon, bye bye.\n" +
            "Takako"
        }
      ]
    },

    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 7 or 8",
      type: "writing-task",
      choices: [
        { id: 7, prompt: "This is part of a letter you receive from your penfriend.\n\n  \"I'm glad you like learning English. Your teacher sounds really nice — and your friends do too! Tell me all about your English classes.\"\n\nNow write a letter to your penfriend.\nWrite your letter in about 100 words on your answer sheet." },
        { id: 8, prompt: "You have to write a story for your English teacher.\n\nYour story must have this title:\n\n  A broken window\n\nWrite your story in about 100 words on your answer sheet." }
      ],
      wordCount: "about 100 words",
      items: [
        {
          id: 7,
          band: "4",
          answer:
            "Hi!\n" +
            "Thank you for your letter. Learning English is still interesting and is very good for me, I have good English teacher and also good classmates. They make me more interest to learn English.\n" +
            "Let me introduce my English class.\n" +
            "There are above nice students and one nice teacher.\n" +
            "The nice teacher I saw is Pete! He is tall, handsome. Furthermore, he makes us very interest and feel comfortable in his class.\n" +
            "It is time to talk about my classmates!\n" +
            "They are all women except one man and they have variety nationality. For example South Korea (of course include me), Japan, Poland, Columbia and China etc. Most of them have cheerful character and pasive to learn English.\n" +
            "That's why I said that I like learning English.\n" +
            "I will need a letter even again.\n" +
            "Take it easy!!",
          altSample: {
            q: 8,
            band: "4",
            text:
              "This is a story of my english teacher's holiday. On last Sunday, he stayed at home with his son and wife. After lunch, he went to the park in front of the house with his son, and was playing baseball. He saw Tony wants to be a baseball player in the future. So, he always played the baseball with his friends. But, on this day, Tony was playing with his father. Mike wasn't good at the baseball. Tony throws a ball, and Mike hit it!! The ball that Mike had hit broke a window of his house. of course, his wife lost her temper. He apologised for her. His wife said 'It's ok, I don't mind. But, you must tidy up here, and from today, make meals on your own!!'\n" +
              "She was really angry."
          }
        }
      ]
    }
  ]
};
