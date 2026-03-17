// CEFR Reading Test 02
// 5 Parts, 35 Questions - B1/B2/C1 Level

window.CEFR_READING_TEST = {
  testInfo: {
    title: "CEFR B1-B2-C1 Reading Test 02",
    totalQuestions: 35,
    totalTime: 60, // minutes
    parts: 5,
    level: "B1-B2-C1"
  },
  
  parts: [
    // ===== PART 1: Gap Fill from Text =====
    {
      partNumber: 1,
      title: "Part 1",
      type: "gap-fill-text",
      questionRange: "1-6",
      instruction: "Read the text. Fill in each gap with ONE word. You must use a word which is somewhere in the rest of the text.",
      passage: {
        title: "Thanksgiving",
        content: `<p>Thanksgiving is celebrated in the USA on the 4th Thursday of November. The tradition comes from the <span class="gap" data-gap="1">_____(1)_____</span> people to arrive from England to North America. The Native Americans taught them to grow food and hunt, and the pilgrims invited the Native Americans for a <span class="gap" data-gap="2">_____(2)_____</span> to eat after the harvest. This was the first Thanksgiving that people <span class="gap" data-gap="3">_____(3)_____</span>.</p>

<p>Nowadays, <span class="gap" data-gap="4">_____(4)_____</span> is the country's largest secular holiday and represents a time when friends and family get together for a large turkey dinner. Traditionally people make stuffing, mashed potatoes, cranberry sauce, sweet potatoes, and pumpkin pie to go with the huge roast <span class="gap" data-gap="5">_____(5)_____</span>.</p>

<p>In the morning, there is a massive parade in NYC called the Macy's Thanksgiving Day parade, which has a lot of giant balloons, famous people, and marching bands. In the afternoon, people watch an American football game. There is usually one <span class="gap" data-gap="6">_____(6)_____</span> in the afternoon and one in the evening.</p>`
      },
      questions: [
        { id: 1, hint: "The tradition comes from the _____ people" },
        { id: 2, hint: "invited the Native Americans for a _____" },
        { id: 3, hint: "the first Thanksgiving that people _____" },
        { id: 4, hint: "Nowadays, _____ is the country's largest" },
        { id: 5, hint: "to go with the huge roast _____" },
        { id: 6, hint: "There is usually one _____ in the afternoon" }
      ],
      answers: {
        1: ["first"],
        2: ["dinner"],
        3: ["celebrated"],
        4: ["thanksgiving"],
        5: ["turkey"],
        6: ["game"]
      }
    },

    // ===== PART 2: Matching Texts to Statements =====
    {
      partNumber: 2,
      title: "Part 2",
      type: "matching",
      questionRange: "7-14",
      instruction: "Read the texts 7-14 and the statements A-J. Decide which text matches with the situation described in the statements. Each statement can be used ONCE only. There are TWO extra statements which you do not need to use.",
      statementsFirst: true,
      statements: [
        { letter: "A", text: "Friendly Hotel- lots of sheep perhaps!" },
        { letter: "B", text: "The National Trust owns the surrounding land" },
        { letter: "C", text: "Overlooking the river" },
        { letter: "D", text: "Situated close to a port." },
        { letter: "E", text: "Lakes and mountains." },
        { letter: "F", text: "Fitness center and golf hotel." },
        { letter: "G", text: "Family-owned and run-good sea views." },
        { letter: "H", text: "A special discount is available if you quote this newspaper advertisement." },
        { letter: "I", text: "Special offer and free car parking." },
        { letter: "J", text: "Good personal service on the seafront." }
      ],
      texts: [
        {
          number: 7,
          content: "HIGHBULLEN HOTEL – GOLF AND COUNTRY CLUB\nSpectacular scenery with sporting, golf and leisure facilities. State of the art \"Life Fitness\" Gym, Health and Beauty suite with Sauna. Offering excellent cuisine and all within easy reach of the M5.\n01769540561    www.highbullen.co.uk"
        },
        {
          number: 8,
          content: "The Berry Head Hotel – Brixham South Devon\nSteeped in history, nestling on the water edge – near picturesque fishing port. Suburb location of walking, sailing and fishing.\nBrochure tele: 018038532225\nwww.berryheadhotel.com"
        },
        {
          number: 9,
          content: "THE FAT LAMB COUNTRY INN – RAVENSDALE CUMBRIA\nAward winning hotel situated in magnificent scenery between lakes and valleys. Informal, warm and comfortable.\nSPECIAL TELEGRAPH SUMMER BREAKS AVAILABLE\nBROCHURE - 01539623242"
        },
        {
          number: 10,
          content: "ROYAL YORK FAULKNER HOTEL – SIDMOUTH\nCharming, well-run promenade beach hotel. All amenities, excellent leisure facilities and renowned personal service.\nFREEPHONE: 0800220714\nwww.royalyorkhotel.net"
        },
        {
          number: 11,
          content: "BLAKENEY HOTEL – BLAKENEY, NORFOLK\nTraditional privately owned friendly hotel overlooking the estuary. Ideal to explore Norfolk coast and countryside.\nTel: 01263740797\nwww.blakenly-hotel.co.uk"
        },
        {
          number: 12,
          content: "The Cottage Hotel – Hope Cove, Salcombe, Devon\nAUGUST AND SEPTEMBER AVAILABILITY\nFamily run for 30 successful years. First class service.\nwww.hopecove.com\nTel: 01548561555"
        },
        {
          number: 13,
          content: "BATH – OLD MILL HOTEL AND LODGE\nSPECIAL OFFER SHORT BREAKS – 2 NIGHTS 82 DBB\nETC***** and silver award for quality. FREE car parking\nwww.oldmillbath.com.uk\nTel: 01225858476"
        },
        {
          number: 14,
          content: "POLURRIAN HOTEL – MULLION, LIZARD PENINSULAR\nOverlooking sandy cove and surrounded by National Trust Coastline. Sea and Fresh Cornish air.\nExceptional leisure facilities.\nTel: 01326240421    www.polurreanhotel.com"
        }
      ],
      questions: [
        { id: 7, textNumber: 7 },
        { id: 8, textNumber: 8 },
        { id: 9, textNumber: 9 },
        { id: 10, textNumber: 10 },
        { id: 11, textNumber: 11 },
        { id: 12, textNumber: 12 },
        { id: 13, textNumber: 13 },
        { id: 14, textNumber: 14 }
      ],
      answers: {
        7: ["F"],
        8: ["D"],
        9: ["A"],
        10: ["J"],
        11: ["C"],
        12: ["G"],
        13: ["I"],
        14: ["B"]
      },
      extraStatements: ["E", "H"]
    },

    // ===== PART 3: Matching Headings =====
    {
      partNumber: 3,
      title: "Part 3",
      type: "matching-headings",
      questionRange: "15-20",
      instruction: "Read the text and choose the correct heading for each paragraph from the list of headings below. There are more headings than paragraphs, so you will not use all of them. You cannot use any heading more than once. Mark your answers on the answer sheet.",
      headings: [
        { letter: "A", text: "Overcoming problems is part of the challenge of sailing" },
        { letter: "B", text: "Sailing tends to run in families" },
        { letter: "C", text: "Enthusiasm about sailing was infectious" },
        { letter: "D", text: "There's no hiding these sailors' ambitions" },
        { letter: "E", text: "There's always more you can learn about sailing" },
        { letter: "F", text: "Some basics about sailing were explained" },
        { letter: "G", text: "Sailors are used to waiting around" },
        { letter: "H", text: "These sailors have other talents" }
      ],
      passage: {
        title: "Rock the Boat",
        paragraphs: [
          {
            number: "I",
            questionId: 15,
            content: "The boats, or 'Oppies' as they are affectionately called, were lying bottom-up on the beach, their sails tightly wrapped beside them. 'There's delay,' the race organizer said, pointing at two flags waving in the breeze. He said the red-and white-striped one meant that there was been a delay, while the red, white and blue one meant it would be for three hours."
          },
          {
            number: "II",
            questionId: 16,
            content: "No one looks disappointed, probably because they are accustomed to being ruled by the weather Competitors – casually dressed in baggy shorts, T-shirts, deck shoes and an assortment of anoraks and baseball caps – played on bikes or skateboards or just chatted to kill the time. Spectators sat in groups in the clubhouse, eating rolls and drinking tea."
          },
          {
            number: "III",
            questionId: 17,
            content: "I suddenly felt very pale and 'indoors' as I sat down with some of the tanned, blond champs. Nicky Barnes, 15, Elliot Willis, 14, Eddie Huntley, 13, and Paul Campbell Jones, 14, have been sailing for years, and certainly have the sea in their blood. Paul's dad sailed in the Olympics and Nicky started sailing because her dad dragged her along. 'I was terrified at first,' she confesses. Recently they successfully competed at the world championships."
          },
          {
            number: "IV",
            questionId: 18,
            content: "Varying degrees of hard work go into their preparation, but Nicky does the most. She trains in winter and says it is hard, 'especially when all your friends are out partying'. Then she practices techniques, boat handling and wind strategy. Meanwhile, Elliot had learned how the shape of clouds and hills affects the wind. Eddie is more relaxed and a bit more confident about it: 'I don't like training. I've got better things to do.'"
          },
          {
            number: "V",
            questionId: 19,
            content: "They all get on well, joking and teasing each other, but out on the water, competition is fierce. Paul doesn't hesitate to say the best thing about sailing is winning. They've all had nasty moments, but no one will admit to falling in. The boys happily told me of Micky's fear of fish, and Elliot tells a good tale about his boat being hit by a shark."
          },
          {
            number: "VI",
            questionId: 20,
            content: "So what are their plans? 'I want to be world champion,' says Nicky without hesitation. Paul agrees: 'I want to go to the Olympics like my dad.' Elliot and Eddie share similar dreams. For now, though, they're content to wait for the wind to pick up so they can get back on the water and do what they love most."
          }
        ]
      },
      questions: [
        { id: 15, paragraphNumber: "I" },
        { id: 16, paragraphNumber: "II" },
        { id: 17, paragraphNumber: "III" },
        { id: 18, paragraphNumber: "IV" },
        { id: 19, paragraphNumber: "V" },
        { id: 20, paragraphNumber: "VI" }
      ],
      answers: {
        15: ["F"],
        16: ["G"],
        17: ["B"],
        18: ["A"],
        19: ["D"],
        20: ["H"]
      },
      extraHeadings: ["C", "E"]
    },

    // ===== PART 4: MCQ + True/False/No Information =====
    {
      partNumber: 4,
      title: "Part 4",
      type: "reading-comprehension",
      questionRange: "21-29",
      instruction: "Read the following text for questions 21-29.",
      passage: {
        title: "Personality and Health",
        content: `<p>There is increasing evidence that health is linked to personality. However, until now, the relationship has not affected the way health care is delivered. There are several reasons for this. Some health workers doubt whether there is a direct link between health and personality or whether it's just a coincidence. Some feel it is their professional duty to treat all patients in the same way. Others argue that delivering health services according to behaviour, for instance, has been found in some studies to increase the risk of death, in others to protect people from illness and in others to have no link to health at all. patients' personalities will have minimal impact and therefore isn't worth the effort.</p>

<p>However, some psychologists believe that applying different procedures to people with different personalities could have a significant, positive effect on health. Research into personality has, in recent years, focused on the Big Five model of personality types. This model measures how neurotic, extrovert, open to experience, agreeable and conscientious a person is. Some of these personality types have been studied in relation to health. For example, conscientious people tend to be less likely to smoke, drink too much alcohol or be inactive. However, in other cases, the relationship is less clear.</p>

<p><strong>Neurotic</strong></p>

<p>Even so, if health workers applied an understanding of personality to the services they provide, they could influence the extent to which patients act on advice and follow their treatment. For example, high sensation-seeking individuals, who are extroverts and unconscientiously in the Big Five model and tend to take part in risky activities, respond to drama, energy and emotion. Thus, to encourage those people to follow health advice, health promotions can be designed to incorporate those factors. An example of this was the campaign SENTAR which aimed to reduce cannabis use among high sensation-seeking teenagers. By creating a suitable television advert, they successfully engaged these youths and reduced their recreational drug use. Of course, this approach isn't always possible. It is often impractical and expensive to create several versions of a campaign to reach different personality types. However, recent developments in computer technology, cookies and targeted advertising may allow this approach to be used more in future.</p>

<p>Personality could also be considered when sending messages, information and guidance to specific patients. Already, health information is usually available in various forms-printed, digital, audio, and so on - to be suitable and accessible for different users, such as the blind, the elderly, and people with reading difficulties. Research has also shown that, by identifying different patients' motivations for treatment and then corresponding with them in a way that reflects their motivations, patients will become more involved in their treatment, compared to when the same messages are sent to everyone. Correspondence could, therefore, be adapted to reflect patients' personality type, too. For example, less conscientious people could be sent phone reminders to attend appointments. So far, there has been very little research into the effectiveness of tailoring health guidance according to personality, so this area deserves further study.</p>

<p>Until now, the focus of personality-health research has been to explore the link between personality and health and has had very little practical application. Thus, health workers have not engaged deeply with it. However, by suggesting, trialing and implementing practices to engage patients with different personalities, the relationship between psychology researchers and health workers could improve, along with the health of the general public.</p>`
      },
      questionSections: [
        {
          type: "mcq",
          title: "Questions 21-24: Multiple Choice",
          instruction: "For questions 21-24, choose the correct answer A, B, C, or D. Mark your answers on the answer sheet.",
          questions: [
            {
              id: 21,
              text: "Who is the article most aimed at?",
              options: [
                { letter: "A", text: "psychologists" },
                { letter: "B", text: "patients at a clinic" },
                { letter: "C", text: "neurotic people" },
                { letter: "D", text: "health workers outside psychology" }
              ]
            },
            {
              id: 22,
              text: "Which of these is NOT a reason why clinicians do not currently consider personality in their approach to healthcare?",
              options: [
                { letter: "A", text: "They consider it their duty to treat all patients equally." },
                { letter: "B", text: "They think the effect on a patient's health will be hardly noticeable." },
                { letter: "C", text: "They lack sufficient training in psychology." },
                { letter: "D", text: "They doubt whether a person's personality directly affects their health." }
              ]
            },
            {
              id: 23,
              text: "What can be concluded from the text about neurotic patients?",
              options: [
                { letter: "A", text: "They are at greater risk from early death than non-neurotic patients." },
                { letter: "B", text: "There is no consistent link between a patient's level of neurosis and their health." },
                { letter: "C", text: "Their neurosis protects them from becoming sick." },
                { letter: "D", text: "They are more likely than non-neurotic patients to report illness." }
              ]
            },
            {
              id: 24,
              text: "It can be inferred that the campaign SENTAR...",
              options: [
                { letter: "A", text: "used drama and energy in its design." },
                { letter: "B", text: "failed to reduce cannabis use among teenagers." },
                { letter: "C", text: "was designed to attract conscientious, high sensation-seeking teenagers." },
                { letter: "D", text: "was delivered across multiple media, including television and online." }
              ]
            }
          ]
        },
        {
          type: "tfni",
          title: "Questions 25-29: True/False/No Information",
          instruction: "For questions 25-29, decide if the following statements agree with the information given in the text. Mark your answers on the answer sheet.",
          options: ["True", "False", "No Information"],
          questions: [
            {
              id: 25,
              text: "The correlation between health and personality has always been taken into account in the health care system."
            },
            {
              id: 26,
              text: "Some doctors believe that it is inefficient to treat patients depending on their personalities."
            },
            {
              id: 27,
              text: "There are controversial opinions about the effect of neurotic behavior on health."
            },
            {
              id: 28,
              text: "SENTAR campaign predicted a positive impact of their promotion on reducing drug use among teenagers."
            },
            {
              id: 29,
              text: "Understanding health information can be difficult for disabled people."
            }
          ]
        }
      ],
      answers: {
        21: ["D", "health workers outside psychology"],
        22: ["C", "They lack sufficient training in psychology."],
        23: ["B", "There is no consistent link between a patient's level of neurosis and their health."],
        24: ["A", "used drama and energy in its design."],
        25: ["False"],
        26: ["True"],
        27: ["True"],
        28: ["No Information"],
        29: ["False"]
      }
    },

    // ===== PART 5: Gap Fill + MCQ =====
    {
      partNumber: 5,
      title: "Part 5",
      type: "reading-comprehension",
      questionRange: "30-35",
      instruction: "Read the following text for questions 30-35.",
      passage: {
        title: "Plutons and Disease",
        content: `<p>Sometimes there is a common cause for apparently different illnesses. Take for instance various kinds of tumors, which are groupings of cells continuously separating. And lately, a spectacular medical theory has developed. It speculates how illnesses of the central nervous system-such as Lou Gehrig's disease, AIDS and rubella - use a similar process of reproduction.</p>

<p>The theory replaces the idea of continuous re-creation with the idea that the body does not remove its own waste properly. Normally, the cause of these diseases is mishandled plutons. What keeps the system busy, is the process of collecting the waste of healthy cells. Carrier cells pick up the waste as they travel through the blood stream and deposit it in waste depots. Healthy cells create plenty of junk that keep the system busy. The process includes compressing the waste by the means of folding. This can be a lengthy process and with so many steps, that an error is likely to occur. In such a case, the waste must be removed before it causes damage to any serious degree.</p>

<p>In a recent issue of the Pacific Rim Journal of Medicine, Al Chervik of Tokyo Medical School, who helped discover the proteasome 20 years ago, explained the process of the biological waste-disposal system when the brain is infected by a particularly nasty, communicable protein called a pluton. Plutons cause Kluziod-Johan disease (or "wasting disease" in deer) by reorganizing the structure of normal proteins in their own image. Dr Chervik proposes that small groups of plutons penetrate the waste-processing proteasome and cease the cellular garbage disposal. Waste material would remain in the brain and the accumulating toxins would kill the nerve cells.</p>

<p>Experimentations on how plutons disrupt nerve cells have revealed the transformation of the brain into a semi-hard substance. The astonishingly young Janice Laub of Ripon College, was successfully able to demonstrate this process by using a Petri dish of mouse nerve cells and an incandescent reading lamp. Her results clearly showed how the cells had been transformed to a waste acid.</p>

<p>The whole process began with Laub administering a deadly substance to the nerve cells with disease-causing plutons. This caused the cells to degrade quickly and create a loose inner core. The plutons passed though the cells skin, then gathered in bunches and liquidated the center. She then administered an antidote that isolated the accumulated plutons, but left the cell's essential components. The hypothesis was proven as the cell regained its faculties and was able to begin removing waste.</p>

<p>Living pelicans were used in a separate experiment, and similar results were proven. When the pelicans were infected with plutons, toxins collected in their brains. The toxin was connected to amino acids slated for disposal. However, once the plutons had entered the brain, the garbage managed to remain.</p>

<p>Laub's results support the hypothesis that brain cells are motivated by plutons to make long latent viruses come back. She further speculated that these viruses might even carry plutons to other nerve cells, spreading the infection and causing even greater damage to other parts of the brain. If that idea proves correct, plutons would provide many answers to tumor creation.</p>`
      },
      questionSections: [
        {
          type: "gap-fill",
          title: "Questions 30-33: Gap Filling Section",
          instruction: "Fill in the missing information in the numbered spaces. Write no more than ONE WORD and/or A NUMBER for each question.",
          summaryText: `<p>The waste which is generated in the <span class="gap-input" data-gap="30">_____(30)_____</span> cells is later collected by another cell responsible for delivering it in depots.</p>
<p>It is not surprising to observe an <span class="gap-input" data-gap="31">_____(31)_____</span> due to the complex and long-lasting process of waste removal.</p>
<p>The findings of Ripon's research demonstrate that plutons played an essential role in converting the cells into an <span class="gap-input" data-gap="32">_____(32)_____</span>.</p>
<p>Apart from the mouse, <span class="gap-input" data-gap="33">_____(33)_____</span> were also applied in an observation to provide evidence on the direct impact of plutons on the collection of toxins in the brain.</p>`,
          questions: [
            { id: 30, hint: "waste which is generated in the _____ cells" },
            { id: 31, hint: "not surprising to observe an _____" },
            { id: 32, hint: "converting the cells into an _____" },
            { id: 33, hint: "Apart from the mouse, _____ were also applied" }
          ]
        },
        {
          type: "mcq",
          title: "Questions 34-35: Multiple Choice",
          instruction: "Choose the correct answer A, B, C, or D. Mark your answers on the answer sheet.",
          questions: [
            {
              id: 34,
              text: "The basis of the new theory is...",
              options: [
                { letter: "A", text: "the waste handling mechanisms of the cells." },
                { letter: "B", text: "the continuous reproduction of cells." },
                { letter: "C", text: "called plutons." },
                { letter: "D", text: "the importance of keeping the body busy." }
              ]
            },
            {
              id: 35,
              text: "An error is likely to occur, because...",
              options: [
                { letter: "A", text: "the process takes a long time." },
                { letter: "B", text: "the process is difficult." },
                { letter: "C", text: "it is bound to happen." },
                { letter: "D", text: "plutons cause damage before they are handled." }
              ]
            }
          ]
        }
      ],
      answers: {
        30: ["healthy"],
        31: ["error"],
        32: ["acid"],
        33: ["pelicans"],
        34: ["D", "the importance of keeping the body busy."],
        35: ["B", "the process is difficult."]
      }
    }
  ]
};
