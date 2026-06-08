// Cambridge PET (Preliminary English Test) for Schools — Writing — Test 4
// VERBATIM from "Preliminary English Test for Schools 1" (Cambridge UP, 2010).
// Source pages: Test 4 writing = pp.81-83; key + samples = pp.141-146.

window.PET_W_TEST = {
  testInfo: {
    id: "pet-w-04",
    title: "PET Writing — Test 4",
    paper: "Paper 1 · Writing",
    level: "B1",
    totalTime: 45,
    parts: 3
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "sentence-transformation",
      topic: "About a boy called Max who has got a new mobile phone",
      instruction: [
        "Here are some sentences about a boy called Max who has got a new mobile phone.",
        "For each question, complete the second sentence so that it means the same as the first.",
        "Use no more than three words.",
        "Write only the missing words on your answer sheet.",
        "You may use this page for any rough work."
      ],
      example: {
        first: "Max's parents gave him a mobile phone for his birthday.",
        beforeBlank: "Max",
        answer: "was",
        afterBlank: "given a mobile phone for his birthday by his parents."
      },
      items: [
        { id: 1, first: "The phone was Max's favourite present.",                                        beforeBlank: "Max likes his phone more",                                  afterBlank: "any of his other presents.", answer: "than" },
        { id: 2, first: "Max has never had his own phone before.",                                       beforeBlank: "This is the",                                                afterBlank: "that Max has had his own phone.", answer: "first time" },
        { id: 3, first: "Max's phone is very similar to his sister's phone.",                            beforeBlank: "Max's phone is almost the same",                              afterBlank: "his sister's phone.", answer: "as" },
        { id: 4, first: "Max uses his phone for calling his friends and family.",                        beforeBlank: "Max uses his phone",                                          afterBlank: "call his friends and family.", answer: "in order to" },
        { id: 5, first: "Max likes playing games on his phone, and all his friends do too.",             beforeBlank: "Max likes playing games on his phone, and",                   afterBlank: "do all his friends.", answer: "so" }
      ]
    },

    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTION 6",
      type: "writing-task",
      prompt: "You are going to the cinema this afternoon, and you'd like to invite your Canadian friend Daryl.\n\nWrite a note to leave for Daryl. In your note, you should\n\n• invite Daryl to the cinema\n• tell Daryl about the film you plan to see\n• suggest a time to meet.\n\nWrite 35–45 words on your answer sheet.",
      wordCount: "35–45 words",
      items: [
        {
          id: 6,
          band: "5",
          answer:
            "Dear Daryl\n" +
            "I want you to come with me at cinema at 8.30 which is the time that start a oscar winning film. This film is Harry Poter. I will wait you on Saturday."
        }
      ]
    },

    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 7 or 8",
      type: "writing-task",
      choices: [
        { id: 7, prompt: "This is part of a letter you receive from an English friend.\n\n  \"I'm starting a new school next term and I'm worried because I won't know anyone there. What do you think are the best ways to make new friends? Please write back soon.\"\n\nNow write a letter giving your friend some advice.\nWrite your letter on your answer sheet." },
        { id: 8, prompt: "Your English teacher has asked you to write a story.\n\nYour story must begin with this sentence:\n\n  As soon as I woke up I knew that it was going to be a special day.\n\nWrite your story on your answer sheet." }
      ],
      wordCount: "about 100 words",
      items: [
        {
          id: 7,
          band: "5",
          answer:
            "Hello! How are you? Thanks for your letter. I know it's very hard to start new school. It's not very easy to find new friends, but I think you can find ways to do it. First you should meet with somebody, then talk with him about music, films, games, and something like that. Maybe you two will be interested in something together. It is easy for you, because you are a very interesting and handsome boy. Don't worry about it! Next week you'll know everyone in your class, I promise you. Please write me, when you'll have a friend.\n" +
            "Goodbye\n" +
            "Love, Leo.",
          altSample: {
            q: 8,
            band: "5",
            text:
              "As soon as I woke up I knew it was going to be a special day. It was my mother's birthday! And it was going to be a birthday party at 3.00. But I didn't have any present! I didn't know what to do. And then I had a wonderful idea — to buy a present for Mummy, but I didn't have any money! I asked my father and granny to give me some money, but they didn't want to give me any. My mother heard me asking about money and gave me £50! I was so happy and bought some flowers and a CD player. I thought it was a wonderful present, but why wasn't my Mummy happy, I wonder?"
          }
        }
      ]
    }
  ]
};
