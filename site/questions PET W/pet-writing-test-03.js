// Cambridge PET (Preliminary English Test) for Schools — Writing — Test 3
// VERBATIM from "Preliminary English Test for Schools 1" (Cambridge UP, 2010).
// Source pages: Test 3 writing = pp.61-63; key + samples = pp.129-134.

window.PET_W_TEST = {
  testInfo: {
    id: "pet-w-03",
    title: "PET Writing — Test 3",
    paper: "Paper 1 · Writing",
    level: "B1",
    totalTime: 45,
    parts: 3
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "sentence-transformation",
      topic: "About schools in Britain",
      instruction: [
        "Here are some sentences about schools in Britain.",
        "For each question, complete the second sentence so that it means the same as the first.",
        "Use no more than three words.",
        "Write only the missing words on your answer sheet.",
        "You may use this page for any rough work."
      ],
      example: {
        first: "Most British children go to state schools.",
        beforeBlank: "Nearly",
        answer: "all",
        afterBlank: "British children go to state schools."
      },
      items: [
        { id: 1, first: "It costs nothing to attend a state school.",                          beforeBlank: "It doesn't cost",                                  afterBlank: "to attend a state school.", answer: "anything" },
        { id: 2, first: "City schools are usually larger than schools in the country.",        beforeBlank: "Schools in the country are not as",                afterBlank: "city schools.", answer: "large as" },
        { id: 3, first: "Uniforms must be worn by children in some schools.",                   beforeBlank: "Children must",                                     afterBlank: "uniforms in some schools.", answer: "wear" },
        { id: 4, first: "Each class has about thirty children.",                                beforeBlank: "In each class",                                     afterBlank: "are about thirty children.", answer: "there" },
        { id: 5, first: "Children can buy hot lunches at most schools.",                        beforeBlank: "At most schools",                                   afterBlank: "possible for children to buy hot lunches.", answer: "it is" }
      ]
    },

    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTION 6",
      type: "writing-task",
      prompt: "You would like to borrow a book from your Australian friend Charlie.\n\nWrite an email to your friend Charlie. In your email, you should\n\n• tell Charlie which book you would like to borrow\n• explain why you need to borrow this book\n• say how long you need the book for.\n\nWrite 35–45 words on your answer sheet.",
      wordCount: "35–45 words",
      items: [
        {
          id: 6,
          band: "5",
          answer:
            "Hi Charlie!\n" +
            "I write to you about the book \"The Adventures of Tom Sawyer\". Can you lend it to me? I need to borrow this book because it was advised me by my friends and you also. I need it for 2 weeks.\n" +
            "Stas"
        }
      ]
    },

    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 7 or 8",
      type: "writing-task",
      choices: [
        { id: 7, prompt: "This is part of a letter you receive from an English friend.\n\n  \"We might have a school trip to your country next year. What do you think is the best time of year to visit? What are the most interesting things for teenagers to do in your area?\"\n\nNow write a letter, answering your friend's questions.\nWrite your letter on your answer sheet." },
        { id: 8, prompt: "Your English teacher wants you to write a story.\n\nYour story must begin with this sentence:\n\n  I was on the bus when I got a text message.\n\nWrite your story on your answer sheet." }
      ],
      wordCount: "about 100 words",
      items: [
        {
          id: 7,
          band: "5",
          answer:
            "Dear Alice,\n" +
            "I'm very glad that you are going to come next year. I haven't seen you for a long time and I would like to make friends with your classmates very much. If the main question is when to come, I think the best answer is in May or in September Because it's not very hot but not cold too. The parks and squares are very beautiful in spring and autumn. I remember that you are keen on ancient architecture, so I think you'll enjoy walking along the old parts of our city. There is a lot of sightseeing in our area, saying nothing of amusement parks, theatres and museums with modern exhibitions. I think you'll find a lot to do. I'm really looking forward to seeing you.\n" +
            "Love,\n" +
            "Ksenia",
          altSample: {
            q: 8,
            band: "5",
            text:
              "I was on the bus when I got a text message. It was from my friend Julia. She asked me to come to the railway station, and help her. I had to go out of the bus and walk there, because it wasn't far away from the bus stop. When I arrived at the railway station I saw Julia with … a kitten! I was greatly surprized. Julia said that she didn't knew what was wrong with her kitten. He was crying all the time. I thought a little and then understood that the kitten wanted to eat. Julia bought him some food so that he became happy. Is was a funny day!"
          }
        }
      ]
    }
  ]
};
