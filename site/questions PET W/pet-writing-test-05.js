// Cambridge PET — Writing — Test 5 (Cambridge Preliminary English Test 2 · Test 1)
// VERBATIM from "Cambridge Preliminary English Test 2" (Cambridge UP, 2003).
// Source pages: Writing pp.15-17; key + samples pp.86-95.

window.PET_W_TEST = {
  testInfo: {
    id: "pet-w-05",
    title: "PET Writing — Test 5",
    paper: "Paper 1 · Writing",
    level: "B1",
    totalTime: 45,
    parts: 3
  },

  parts: [
    {
      partNumber: 1, label: "PART 1", questionsLabel: "QUESTIONS 1–5",
      type: "sentence-transformation",
      topic: "A family",
      instruction: [
        "Here are some questions about a family.",
        "For each question, complete the second sentence so that it means the same as the first, using no more than three words.",
        "Write only the missing words on your answer sheet.",
        "You may use this page for any rough work."
      ],
      example: {
        first: "My brother is older than me.",
        beforeBlank: "I am",
        answer: "younger than",
        afterBlank: "my brother."
      },
      items: [
        { id: 1, first: "My parents prefer jazz to classical music.",                  beforeBlank: "My parents think jazz",                       afterBlank: "than classical music.",          answer: "is better" },
        { id: 2, first: "My parents can only go swimming at the weekend.",             beforeBlank: "On weekdays, my parents aren't",              afterBlank: "go swimming.",                   answer: "able to" },
        { id: 3, first: "If I finish my homework, I can go out at the weekend.",       beforeBlank: "I can't go out at the weekend",               afterBlank: "I finish my homework.",          answer: "unless" },
        { id: 4, first: "My sister watches more TV than me.",                          beforeBlank: "I don't watch TV",                            afterBlank: "my sister does.",                answer: "as much as" },
        { id: 5, first: "My parents suggested going out for a meal.",                  beforeBlank: "My parents said, 'Why",                       afterBlank: "we go out for a meal?'",         answer: "don't" }
      ]
    },

    {
      partNumber: 2, label: "PART 2", questionsLabel: "QUESTION 6",
      type: "writing-task",
      prompt: "You have invited your English friend Jo to stay with you next month, but you now need to delay this visit.\n\nWrite a card to send to Jo. In your card, you should\n\n• apologise to Jo\n• explain why the visit has to be delayed\n• suggest when it would be convenient for Jo to come.\n\nWrite 35–45 words on your answer sheet.",
      wordCount: "35–45 words",
      items: [
        {
          id: 6,
          band: "5",
          answer:
            "Dear Jo\n" +
            "As you know, the other day I invited you next month. I'm sorry but I have to delay it because there is may friend's wedding party that day.\n" +
            "Could you come here on 22th of October.\n" +
            "Yours sincerely\n" +
            "Kyoko"
        }
      ]
    },

    {
      partNumber: 3, label: "PART 3", questionsLabel: "QUESTIONS 7 or 8",
      type: "writing-task",
      choices: [
        { id: 7, prompt: "Your English teacher has asked you to write a story.\n\nYour story must begin with this sentence:\n\n  Carla looked at the car in surprise.\n\nWrite your story in about 100 words on your answer sheet." },
        { id: 8, prompt: "This is part of a letter you receive from an English friend.\n\n  \"I know you often go to the cinema. Tell me about the last film you saw and whether you enjoyed it.\"\n\nNow write a letter to your friend.\nWrite your letter in about 100 words on your answer sheet." }
      ],
      wordCount: "about 100 words",
      items: [
        {
          id: 7,
          band: "4",
          answer:
            "Carla looked at the car in surprise.\n" +
            "When the driver noticed her, it was so late. She woke up at the driver's house in two or three hours. She asked him why he hadn't called an ambulance, but soon she found the answer before he explaines because he looks so young. She could guess that he had been driving without the license.\n" +
            "They talked each other about themselves. They fell in love by the time she leaves his house. They made a promise to see again before saying good-bye.",
          altSample: {
            q: 8,
            band: "5",
            text:
              "Hi, mate!!\n" +
              "How's it going? I was very busy this week. But. You know that I love films. I saw the film with the name of 'Bend it like Beckham' It's a very interesting film about football. An indian girl who wanted to play football was the main story. Her parents don't let her play. But she's a very good football player, she's better than a boy who doesn't know how to play football. Finally, she went to America for proffesional league. Santa Barbara. I'm not sure of the team name. Anyway, it's a happy ending for her and for her family.\n" +
              "I recomended the film to Mike and Mike saw the film. He loved it. So I do recoment to you the film 'Bend it like Beckham'.\n" +
              "If I were you, I'd go the cinema right now. Have a good weekend. See you soon.\n" +
              "Bye."
          }
        }
      ]
    }
  ]
};
