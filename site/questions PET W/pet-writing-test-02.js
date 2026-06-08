// Cambridge PET (Preliminary English Test) for Schools — Writing — Test 2
// VERBATIM from "Preliminary English Test for Schools 1" (Cambridge UP, 2010).
// Source pages: Test 2 writing = pp.41-43; key + samples = pp.117-122.

window.PET_W_TEST = {
  testInfo: {
    id: "pet-w-02",
    title: "PET Writing — Test 2",
    paper: "Paper 1 · Writing",
    level: "B1",
    totalTime: 45,
    parts: 3
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "sentence-transformation",
      topic: "Going camping",
      instruction: [
        "Here are some sentences about going camping.",
        "For each question, complete the second sentence so that it means the same as the first.",
        "Use no more than three words.",
        "Write only the missing words on your answer sheet.",
        "You may use this page for any rough work."
      ],
      example: {
        first: "My cousin has lent me a very good tent.",
        beforeBlank: "I have",
        answer: "borrowed",
        afterBlank: "a very good tent from my cousin."
      },
      items: [
        { id: 1, first: "Everyone in our family enjoys camping holidays.",                 beforeBlank: "In our family, all of us",                       afterBlank: "camping holidays.", answer: "enjoy" },
        { id: 2, first: "Camping is cheaper than staying in a hotel.",                     beforeBlank: "Camping costs",                                   afterBlank: "than staying in a hotel.", answer: "less" },
        { id: 3, first: "The campsite we're going to is near the beach.",                  beforeBlank: "The campsite we're going to is not too",          afterBlank: "the beach.", answer: "far away from" },
        { id: 4, first: "The campsite has a swimming pool.",                                beforeBlank: "At the campsite",                                  afterBlank: "a swimming pool.", answer: "there is" },
        { id: 5, first: "I asked my friend if he wanted to come camping with us.",         beforeBlank: "I asked my friend: '",                            afterBlank: "want to come camping with us?'", answer: "Do you" }
      ]
    },

    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTION 6",
      type: "writing-task",
      prompt: "Your friend Alex has invited you to a party this Saturday afternoon but you can't go.\n\nWrite an email to Alex. In your email, you should\n\n• apologise to Alex\n• explain why you can't go\n• suggest another day when you could meet.\n\nWrite 35–45 words on your answer sheet.",
      wordCount: "35–45 words",
      items: [
        {
          id: 6,
          band: "5",
          answer:
            "Hi, Alex\n" +
            "I got your invitation. But I'm so sorry. I can't come because I will be out of city on this week-end for competitions. But I will be free next Saturday and we can celebrate your birthday together in a restaurant.\n" +
            "See you."
        }
      ]
    },

    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 7 or 8",
      type: "writing-task",
      choices: [
        { id: 7, prompt: "This is part of a letter you receive from an English friend.\n\n  \"My favourite subjects at school are history and art. I don't like maths. Tell me about the subjects you study and what you think about them! What would you like to study in the future? Why?\"\n\nNow write a letter answering your friend's questions.\nWrite your letter on your answer sheet." },
        { id: 8, prompt: "Your English teacher has asked you to write a story.\n\nYour story must begin with this sentence:\n\n  I was really excited when I opened the letter.\n\nWrite your story on your answer sheet." }
      ],
      wordCount: "about 100 words",
      items: [
        {
          id: 7,
          band: "5",
          answer:
            "Dear Jhon\n" +
            "My favourite subjects are Music and French literature because I've been playing the piano for 2 years. So, it makes it easier to be a sucessful person.\n" +
            "I don't like history because if you want to learn it, you must memorise all the past events. It is very boring! I hate memorising. Also I don't get on with my history teacher in the school. We argue in about each history lesson. So, I become angry and I don't want to study for the exams which are supplied by him.\n" +
            "I want to study French literature in the future because I am really interested in foreign languages and their literatures.\n" +
            "I am waiting your answer.",
          altSample: {
            q: 8,
            band: "5",
            text:
              "I was really excited when I opened the letter. I knew it was from my brother. We hadn't seen each other for twenty-four years. Actually nobody had seen him since he escaped from prison. I opened the letter. There was a note and a necklace. I remembered the necklace; our mum had given one to me and my brother. They symbolized that we wouldn't leave each other until one of us would die. So the letter meant he would die. Then I read the note. There was written \"I'm so sorry. I wouldn't want to leave you alone but I have to. Now it is not necessary for me to live.\""
          }
        }
      ]
    }
  ]
};
