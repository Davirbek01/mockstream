// Cambridge FCE 1 — Test 1 — Paper 4 Listening (4 parts, Q1-30)
// VERBATIM from "Cambridge First Certificate in English 1" (Cambridge UP).
// Source pages: Test 1 Listening = book pp. 22-27 (PDF idx 23-28); answer key = p. 119 (PDF idx 136).
// Audio: split from FCE-1-TEST-1.m4a at silence boundaries 856 / 902-1353 / 1384-1824 / 1885-2325.

window.FCE_L_TEST = {
  testInfo: {
    id: "fce-listening-test-01",
    title: "FCE Listening — Test 1 (Cambridge FCE 1)",
    paper: "Paper 4 · Listening",
    level: "B2",
    totalTime: 40,
    totalQuestions: 30
  },

  audio: {
    base: "https://audio.mock-stream.com/FCE-Listening/test1/",
    files: { 1: "PART1.m4a", 2: "PART2.m4a", 3: "PART3.m4a", 4: "PART4.m4a" }
  },

  parts: [

    {
      partNumber: 1,
      label: "PART 1",
      questionsLabel: "Questions 1–8",
      type: "mcq-conversation",
      instruction: [
        "You will hear people talking in eight different situations. For questions 1–8, choose the best answer (A, B or C).",
        "Each piece is played twice. Mark your answers on the separate answer sheet."
      ],
      items: [
        {
          id: 1,
          stem: "You hear a restaurant manager talking about the cooks who work for him. What does he say about them?",
          options: [
            { letter: "A", text: "They dislike cleaning tasks." },
            { letter: "B", text: "They have a choice of jobs." },
            { letter: "C", text: "They help to decide the menu." }
          ],
          answer: "B"
        },
        {
          id: 2,
          stem: "You hear a woman talking about a new book. What does she particularly like about the book?",
          options: [
            { letter: "A", text: "It is educational." },
            { letter: "B", text: "It is well organised." },
            { letter: "C", text: "It is enjoyable." }
          ],
          answer: "C"
        },
        {
          id: 3,
          stem: "You hear the writer of a television soap opera being interviewed about the programme. What will happen next in the story?",
          options: [
            { letter: "A", text: "Someone will make an important decision." },
            { letter: "B", text: "Someone will go away unexpectedly." },
            { letter: "C", text: "Someone will learn the truth at last." }
          ],
          answer: "C"
        },
        {
          id: 4,
          stem: "You hear part of a radio interview. Who is speaking?",
          options: [
            { letter: "A", text: "a taxi driver" },
            { letter: "B", text: "a porter" },
            { letter: "C", text: "a tourist guide" }
          ],
          answer: "B"
        },
        {
          id: 5,
          stem: "You hear a woman talking about how she keeps fit. Why did she decide to take up line dancing?",
          options: [
            { letter: "A", text: "She thought the pace would suit her." },
            { letter: "B", text: "She had heard about it on television." },
            { letter: "C", text: "She wanted to try exercising to music." }
          ],
          answer: "A"
        },
        {
          id: 6,
          stem: "You overhear a conversation in a restaurant. What does the woman think about the food she has just eaten?",
          options: [
            { letter: "A", text: "It was expensive." },
            { letter: "B", text: "It was delicious." },
            { letter: "C", text: "It looked wonderful." }
          ],
          answer: "B"
        },
        {
          id: 7,
          stem: "You turn on the radio and hear a man talking. What is he talking about?",
          options: [
            { letter: "A", text: "drawing pictures" },
            { letter: "B", text: "writing fiction" },
            { letter: "C", text: "composing music" }
          ],
          answer: "C"
        },
        {
          id: 8,
          stem: "You overhear a student phoning her parents. What is her opinion of the place she is living in while at college?",
          options: [
            { letter: "A", text: "She is not sure she will have enough room to study." },
            { letter: "B", text: "She has difficulty in working because of the noise." },
            { letter: "C", text: "She does not get on well with her room-mates." }
          ],
          answer: "A"
        }
      ]
    },

    {
      partNumber: 2,
      label: "PART 2",
      questionsLabel: "Questions 9–18",
      type: "note-completion",
      instruction: [
        "You will hear an interview with Elizabeth Holmes about her experience working in Africa. For questions 9–18, complete the sentences.",
        "You will hear the recording twice."
      ],
      noteTitle: "Volunteering in Africa",
      rows: [
        { id: 9,  label: "Elizabeth worked for a", suffix: "before she went to Africa.", answer: "travel agent/travel agent's/travel agents/travel agency" },
        { id: 10, label: "Elizabeth first found out about working as a volunteer from a", suffix: "she saw at the dentist's.", answer: "poster" },
        { id: 11, label: "The course in London that Elizabeth attended was called", answer: "Changes/'Changes'" },
        { id: 12, label: "Elizabeth's job in Africa was to teach", suffix: "how to market their goods.", answer: "farmers/local farmers/African farmers/local African farmers" },
        { id: 13, label: "On arrival in Africa, Elizabeth spent", suffix: "doing a training course with other volunteers.", answer: "three weeks/3 weeks" },
        { id: 14, label: "Elizabeth used a", suffix: "to travel short distances in Africa.", answer: "motorbike/motorcycle" },
        { id: 15, label: "Elizabeth feels that she got on best with", suffix: "in the area of Africa where she lived.", answer: "women/the women/local women/the local women" },
        { id: 16, label: "Back in England, Elizabeth found that she was disturbed by the", suffix: "in the city.", answer: "traffic/traffic noise" },
        { id: 17, label: "At the moment, Elizabeth buys and sells", suffix: "from Africa.", answer: "furniture/pieces of furniture" },
        { id: 18, label: "Nowadays, Elizabeth spends more time on her favourite pastime, which is", answer: "gardening" }
      ]
    },

    {
      partNumber: 3,
      label: "PART 3",
      questionsLabel: "Questions 19–23",
      type: "matching-list",
      instruction: [
        "You will hear five different employees talking about what makes a good boss. For questions 19–23, choose which of the opinions (A–F) each speaker expresses. Use the letters only once. There is one extra letter which you do not need to use.",
        "You will hear the recording twice."
      ],
      leftLabel: "SPEAKERS",
      rightLabel: "A GOOD BOSS SHOULD",
      items: [
        { id: 19, name: "Speaker 1", answer: "E" },
        { id: 20, name: "Speaker 2", answer: "A" },
        { id: 21, name: "Speaker 3", answer: "D" },
        { id: 22, name: "Speaker 4", answer: "B" },
        { id: 23, name: "Speaker 5", answer: "F" }
      ],
      options: [
        { letter: "A", text: "allow staff to take decisions." },
        { letter: "B", text: "encourage staff to work in teams." },
        { letter: "C", text: "listen to complaints from staff." },
        { letter: "D", text: "give information on individual progress." },
        { letter: "E", text: "have good qualifications." },
        { letter: "F", text: "set an example of hard work." }
      ]
    },

    {
      partNumber: 4,
      label: "PART 4",
      questionsLabel: "Questions 24–30",
      type: "mcq-conversation",
      instruction: [
        "You will hear an interview with Trina Trevose, a pop singer who is only fifteen. For questions 24–30, choose the best answer (A, B or C).",
        "You will hear the recording twice."
      ],
      items: [
        {
          id: 24,
          stem: "When Trina went to the USA, she",
          options: [
            { letter: "A", text: "thought the records she made would be unsuccessful." },
            { letter: "B", text: "knew her friends would be jealous of her." },
            { letter: "C", text: "didn't tell many people why she was going." }
          ],
          answer: "C"
        },
        {
          id: 25,
          stem: "When Trina was in the USA, she wrote songs about",
          options: [
            { letter: "A", text: "her home." },
            { letter: "B", text: "the weather." },
            { letter: "C", text: "people she met." }
          ],
          answer: "C"
        },
        {
          id: 26,
          stem: "Where was Trina performing when she was noticed by the record company?",
          options: [
            { letter: "A", text: "in London" },
            { letter: "B", text: "near her home" },
            { letter: "C", text: "in the USA" }
          ],
          answer: "B"
        },
        {
          id: 27,
          stem: "Why did Trina sing with David Pearson?",
          options: [
            { letter: "A", text: "He needed some help." },
            { letter: "B", text: "She wrote a song for him." },
            { letter: "C", text: "The record company asked her to." }
          ],
          answer: "A"
        },
        {
          id: 28,
          stem: "Trina was asked to return to the USA to",
          options: [
            { letter: "A", text: "re-do some work." },
            { letter: "B", text: "appear on TV again." },
            { letter: "C", text: "record a new song." }
          ],
          answer: "A"
        },
        {
          id: 29,
          stem: "Why isn't Trina popular in Britain?",
          options: [
            { letter: "A", text: "Her kind of music isn't popular in Britain." },
            { letter: "B", text: "The company don't want to sell her records in Britain." },
            { letter: "C", text: "Her records haven't been available in Britain." }
          ],
          answer: "C"
        },
        {
          id: 30,
          stem: "How does Trina see her future?",
          options: [
            { letter: "A", text: "She will continue making records in the USA." },
            { letter: "B", text: "She may make singing her career eventually." },
            { letter: "C", text: "She wants to study music at college." }
          ],
          answer: "B"
        }
      ]
    }

  ]
};
