// Cambridge PET (Preliminary English Test) for Schools — Writing — Test 1
// VERBATIM from "Preliminary English Test for Schools 1" (Cambridge UP, 2010).
// Paper 1 Writing: 3 parts · 45 minutes.
// Source pages: Test 1 writing = pp.21-23; key + samples = pp.104-110.

window.PET_W_TEST = {
  testInfo: {
    id: "pet-w-01",
    title: "PET Writing — Test 1",
    paper: "Paper 1 · Writing",
    level: "B1",
    totalTime: 45,
    parts: 3
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "sentence-transformation",
      topic: "A game called Jotto",
      instruction: [
        "Here are some sentences about a game.",
        "For each question, complete the second sentence so that it means the same as the first.",
        "Use no more than three words.",
        "Write only the missing words on your answer sheet.",
        "You may use this page for any rough work."
      ],
      example: {
        first: "The game is called Jotto.",
        beforeBlank: "The name",
        answer: "of the game",
        afterBlank: "is Jotto."
      },
      items: [
        { id: 1, first: "You can't play Jotto unless there are at least two players.", beforeBlank: "You can only play Jotto", afterBlank: "there are at least two players.", answer: "if" },
        { id: 2, first: "You can play Jotto in a team or by yourself.",                  beforeBlank: "You can play Jotto in a team or on",      afterBlank: "own.", answer: "your" },
        { id: 3, first: "I enjoy the game, and my parents enjoy it too.",                beforeBlank: "I enjoy the game and so",                  afterBlank: "my parents.", answer: "do" },
        { id: 4, first: "My friend said that she had never played Jotto.",              beforeBlank: "My friend said, 'I",                       afterBlank: "played Jotto.'", answer: "have never" },
        { id: 5, first: "What about playing the game now?",                              beforeBlank: "Shall",                                    afterBlank: "the game now?", answer: "we play" }
      ]
    },

    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTION 6",
      type: "writing-task",
      prompt: "Your English friend, Emma, has sent you some birthday money for you to buy a music CD.\n\nWrite an email to Emma. In your email, you should\n\n• thank Emma for the present\n• say which music CD you are going to buy\n• explain why you have chosen this CD.\n\nWrite 35–45 words on your answer sheet.",
      wordCount: "35–45 words",
      items: [
        {
          id: 6,
          band: "5",
          answer:
            "Hi Emma,\n" +
            "Thanks a million for the money. I was thinking in buying one of maroon5 because there is a new song that is called secret of the movie that I love.\n" +
            "Thanks\n" +
            "Love,\n" +
            "Krista"
        }
      ]
    },

    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 7 or 8",
      type: "writing-task",
      choices: [
        { id: 7,
          intro: "This is part of a letter you receive from a British friend.",
          image: "https://audio.mock-stream.com/PET-Writing/test1/q7_ribbon.png",
          outro: "Now write a letter to your friend.\nWrite your letter on your answer sheet." },
        { id: 8,
          intro: "Your English teacher wants you to write a story.\n\nThis is the title for your story:",
          highlight: "How I met my best friend",
          outro: "Write your story in about 100 words on your answer sheet." }
      ],
      wordCount: "about 100 words",
      items: [
        {
          id: 7,
          band: "5",
          answer:
            "Hi Amber\n" +
            "I am really happy to hear from you. How are you? I hope you are fine. I'm writing to tell you everything about restaurants.\n" +
            "First of all, I want to tell you that I love to go out to eat because it's a way to socialite and to talk about things that you don't want to talk about in another place. I also like to eat in a restaurant because you don't need to stand up for anything and its much more comfortable.\n" +
            "I hope to hear from you soon.\n" +
            "Love Rebeca",
          altSample: {
            q: 8,
            band: "5",
            text:
              "How I met my best friend:\n" +
              "When I was 7 years old, my cousin Erika was going to turn 14 years old and she had planed a party for her friends and family. I didn't want to go because I was much younger than my cousin's friends but my mom told me I needed to go. finally I went. I was playing with an 8 year old girl who was the sister of mi cousin's best friend.\n" +
              "She became A really close friend for me. Even after the party we kept in touch and now she is my best friend."
          }
        }
      ]
    }
  ]
};
