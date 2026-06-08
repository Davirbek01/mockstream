// Cambridge PET — Writing — Test 7 (Cambridge Preliminary English Test 2 · Test 3)
// VERBATIM from "Cambridge Preliminary English Test 2" (Cambridge UP, 2003).
// Source pages: Writing pp.55-57; key + samples pp.118-128.

window.PET_W_TEST = {
  testInfo: {
    id: "pet-w-07",
    title: "PET Writing — Test 7",
    paper: "Paper 1 · Writing",
    level: "B1",
    totalTime: 45,
    parts: 3
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "sentence-transformation",
      topic: "Going to the cinema",
      instruction: [
        "Here are some sentences about going to the cinema.",
        "For each question, complete the second sentence so that it means the same as the first, using no more than three words.",
        "Write only the missing words on your answer sheet.",
        "You may use this page for any rough work."
      ],
      example: {
        first: "Dave and Jane have been to the cinema together.",
        beforeBlank: "Dave",
        answer: "has been",
        afterBlank: "to the cinema with Jane."
      },
      items: [
        { id: 1, first: "Nearly every seat was taken in the cinema.",   beforeBlank: "There weren't",            afterBlank: "in the cinema.",        answer: "many seats" },
        { id: 2, first: "Jane had a worse seat than Dave.",              beforeBlank: "Dave had",                 afterBlank: "than Jane.",            answer: "a better seat" },
        { id: 3, first: "Jane couldn't see the screen very well.",       beforeBlank: "Jane found",               afterBlank: "to see the screen.",    answer: "it difficult" },
        { id: 4, first: "Dave said that he had seen the film before.",   beforeBlank: "Dave said: 'I",            afterBlank: "this film before.'",    answer: "have already seen" },
        { id: 5, first: "They spent two hours watching the film.",        beforeBlank: "The film",                 afterBlank: "for two hours.",        answer: "lasted" }
      ]
    },

    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTION 6",
      type: "writing-task",
      prompt: "You have recently moved to a town and have bought this postcard of the town to send to your penfriend.\n\nIn your postcard to your penfriend, you should\n\n• explain why you have moved\n• tell your friend what facilities the town has\n• say what you dislike about living there.\n\nWrite 35–45 words on your answer sheet.",
      wordCount: "35–45 words",
      items: [
        {
          id: 6,
          band: "5",
          answer:
            "Hello Joana. How are you?\n" +
            "I hope you are fine.\n" +
            "I have moved recently to this town because we have more opportunities to have a better life. We can travel to every where by public transport so faster as you can't imagine, and taxis are cheap too. If you want see the town you can buy a ticket for one day by bus and you could visit many monuments.\n" +
            "The problem are the pickpockets we have to be carefull."
        }
      ]
    },

    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 7 or 8",
      type: "writing-task",
      choices: [
        { id: 7, prompt: "Your English teacher has asked you to write a story.\n\nYour story must begin with this sentence:\n\n  It was a fantastic party.\n\nWrite your story in about 100 words on your answer sheet." },
        { id: 8, prompt: "This is part of a letter you receive from an English friend.\n\n  \"I want to find out about music in your country. Are there many live concerts? What music do you like listening to?\"\n\nNow write a letter, answering your friend's questions.\nWrite your letter in about 100 words on your answer sheet." }
      ],
      wordCount: "about 100 words",
      items: [
        {
          id: 7,
          band: "4",
          answer:
            "It was a fantastic party. I hadn't expected it will be so cool! There were a lot of people from our school I hadn't see before. We danced, spoke, drank a bit and there was very friendly atmosphere. I met there my old friends I hadn't see since my birthday. All of us enjoied the party till the moment when parents of the hostes of the party suddenly came back from their trip they had started crying and even, one by one, we all jumped out of the house, and afterwards, having considered the situation decided don't pay much intention to the incident and to go to continue our evening at eauthore place",
          altSample: {
            q: 8,
            band: "4",
            text:
              "Hellollll\n" +
              "Do you know about music? Well, I will answer, firts, in my country, there are a types of music very different, depends If you stay in a cold city or a sunny city you will meet differents styles, but I prefer the latin music, because I love to dance!!! In my country, frewently do many concerts, but, depends the styles, can be romantic, pop music, latin music, salsa ... electronic music, you can find and get your preferents. In my personal opinion, I prefer to listen to pop music, I like madonna, aerosmith, bon jovi and I like too spanish music, you know! I speak spanish ...\n" +
              "And, I have a colection about the famous songs, I can give you, and you can say can listen to ... and then, you'll say me, what as you prefer? or what kind of music would you like? and why not, If you like latin music, If you want to learn to dance, I can teach you!! It's very easy, you only need to try!!! Well, I'll send you my colection and I hope your answer as soon as possible.\n" +
              "Kisses!!!"
          }
        }
      ]
    }
  ]
};
