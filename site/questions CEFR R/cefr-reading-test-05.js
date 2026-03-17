window.CEFR_READING_TEST = {
  testInfo: {
    title: "CEFR B1-B2-C1 Reading Test 05",
    totalQuestions: 35,
    totalTime: 60,
    parts: 5
  },
  parts: [
    // ========== PART 1: Gap-fill (Questions 1-6) ==========
    {
      partNumber: 1,
      type: "gap-fill-text",
      title: "Part 1",
      questionRange: "1-6",
      instruction: "Read the text. Fill in each gap with ONE word. You must use a word which is somewhere in the rest of the text.",
      passage: {
        title: "Electric Cars",
        content: `<p>Car makers are spending a lot of money on electric cars. In the future, electric <span class="gap" data-gap="1">_____(1)_____</span> will replace petrol cars. Environmentalists believe this will reduce the amount of CO2 put into the atmosphere. A big problem for <span class="gap" data-gap="2">_____(2)_____</span> cars is charging the battery. Some batteries in today's electric cars can take up to 12 hours to charge fully. However, a company in Israel says it has created a lithium-ion battery that people can <span class="gap" data-gap="3">_____(3)_____</span> in just five minutes. This is the same amount of time it takes to fill a tank of gas with petrol. The new lithium-ion <span class="gap" data-gap="4">_____(4)_____</span> were developed by the Israeli company StoreDot. They are being manufactured by a Chinese company called Eve Energy.</p>

<p>The new batteries could totally transform driving. They would mean electric cars would be able to travel as far as <span class="gap" data-gap="5">_____(5)_____</span> cars. Many people with electric cars today suffer from "range anxiety". This is stress caused by worrying about the battery running out of electricity. A StoreDot spokesperson said: "You're either afraid that you're going to get stuck on the highway, or that you're going to need to sit in a charging station for two hours." The new batteries would end this anxiety. The StoreDot <span class="gap" data-gap="6">_____(6)_____</span> said: "We're at the point of achieving a revolution in the electric vehicle charging experience". He said it means the switch from petrol to electric cars will happen much faster.</p>`
      },
      questions: [
        { id: 1, hint: "noun - vehicles" },
        { id: 2, hint: "adjective - battery-powered" },
        { id: 3, hint: "verb - power up" },
        { id: 4, hint: "noun - power cells" },
        { id: 5, hint: "noun - fuel vehicles" },
        { id: 6, hint: "noun - representative" }
      ],
      answers: {
        1: ["cars"],
        2: ["electric"],
        3: ["charge"],
        4: ["batteries"],
        5: ["petrol"],
        6: ["spokesperson"]
      }
    },
    // ========== PART 2: Matching (Questions 7-14) ==========
    {
      partNumber: 2,
      type: "matching",
      title: "Part 2",
      questionRange: "7-14",
      instruction: "Read the texts 7-14 and the statements A-J. Decide which text matches with the situation described in the statements. Each statement can be used ONCE only. There are TWO extra statements which you do not need to use.",
      statements: [
        { letter: "A", text: "You can go somewhere nice in a year." },
        { letter: "B", text: "You can meet up with a lot of famous people there." },
        { letter: "C", text: "You can choose your work time." },
        { letter: "D", text: "They can accept a person with a diploma with no prior experience." },
        { letter: "E", text: "They are looking for a hotel manager." },
        { letter: "F", text: "You can work and learn simultaneously there." },
        { letter: "G", text: "You have to work there all week." },
        { letter: "H", text: "They will give you a car if you want to work there." },
        { letter: "I", text: "You can get an insurance for your teeth there." },
        { letter: "J", text: "You don't have to go there to work." }
      ],
      texts: [
        {
          number: 7,
          title: "TechNova Solutions",
          content: `<p>"We're hiring Software Engineers! Location: San Francisco, CA. Requirements: 3+ years of experience in Python, cloud computing, and agile methodologies. Facilities: Competitive salary, remote work options, stock options, and free professional development courses. Apply at technovasolutions.com/careers."</p>`
        },
        {
          number: 8,
          title: "Green Horizons Landscaping",
          content: `<p>"Join our team as a Landscape Architect! Location: Denver, CO. Experience: 2+ years in landscape design and environmental planning. Benefits: Paid time off, health insurance, and ongoing training. Call us at +1 303 456 7890 or send your CV to careers@greenhorizons.com."</p>`
        },
        {
          number: 9,
          title: "Aurora HealthTech",
          content: `<p>"Seeking a Marketing Manager to drive innovation in healthcare! Location: New York City, NY. Experience: 5+ years in digital marketing and branding. Perks: Flexible hours, gym membership, commuter benefits, and wellness programs. Learn more at aurorahealthtech.com/jobs."</p>`
        },
        {
          number: 10,
          title: "Skyline Architects",
          content: `<p>"We're hiring Project Managers for exciting construction projects! Location: Chicago, IL. Requirements: 4+ years in project management with PMP certification. Facilities: Company car, annual bonuses and team-building retreats. Email us at join@skylinearchitects.com."</p>`
        },
        {
          number: 11,
          title: "Global Connect Logistics",
          content: `<p>"Now hiring Logistics Coordinators! Location: Dallas, TX. Experience: 2+ years in supply chain management or a related field. Perks: Competitive salary, 401(k) matching, travel opportunities, and professional growth support and an annual reward: a ticket to go to somewhere exotic. Apply at globalconnect.com/jobs."</p>`
        },
        {
          number: 12,
          title: "Future Minds Academy",
          content: `<p>"Join us as a High School Science Teacher! Location: Boston, MA. Requirements: Bachelor's degree in Education or Science with 3+ years of teaching experience. Facilities: Competitive salary, classroom supplies budget. Apply now: futuremindsacademy.org/careers."</p>`
        },
        {
          number: 13,
          title: "BrightStar Media Group",
          content: `<p>"Looking for a Creative Content Producer! Location: Los Angeles, CA. Experience: 3+ years in video editing, scriptwriting, or multimedia production. Benefits: Free access to our studio and collaboration with industry leaders. Send your portfolio to careers@brightstarmedia.com."</p>`
        },
        {
          number: 14,
          title: "EcoPure Industries",
          content: `<p>"Join us as an Environmental Consultant! Location: Seattle, WA. Requirements: 5+ years of experience in sustainability projects and environmental assessments. Benefits: Hybrid work model, health and dental insurance, and company-sponsored certifications. Apply today at ecopureindustries.com/careers."</p>`
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
        7: "J",
        8: "H",
        9: "C",
        10: "F",
        11: "A",
        12: "D",
        13: "B",
        14: "I"
      }
    },
    // ========== PART 3: Matching Headings (Questions 15-20) ==========
    {
      partNumber: 3,
      type: "matching-headings",
      title: "Part 3",
      questionRange: "15-20",
      instruction: "Read the text and choose the correct heading for each paragraph from the list of headings below. There are more headings than paragraphs, so you will not use all of them. You cannot use any heading more than once.",
      headings: [
        { letter: "A", text: "Another name for inhabitants." },
        { letter: "B", text: "A returned house." },
        { letter: "C", text: "The emblem." },
        { letter: "D", text: "Local life." },
        { letter: "E", text: "A cheap electricity." },
        { letter: "F", text: "Education system." },
        { letter: "G", text: "Foreign involvement." },
        { letter: "H", text: "A violent war." }
      ],
      passage: {
        title: "FALKLAND ISLANDS",
        paragraphs: [
          {
            number: "I",
            questionId: 15,
            content: `About 250 miles off the coast of South America lie the Falkland Islands, a British overseas territory. About 3,000 people live on the islands. Like most isolated communities around the world, they are always pleased to welcome tourists. The people of the Falkland Islands mostly work in sheep farming and fishing.`
          },
          {
            number: "II",
            questionId: 16,
            content: `Everything outside Stanley, known locally as Camp, is home to numerous farms and settlements spread across the islands. In fact, over three quarters of the population live in Stanley. Although one of the smallest capitals in the world, Stanley provides a variety of supermarkets, excellent restaurants and hotels, a swimming pool, gym and golf course.`
          },
          {
            number: "III",
            questionId: 17,
            content: `Open whenever tour ships are in the port, the Falkland Islands Museum contains artifacts from everyday life, natural history samples and a fine collection relating to the islands' shipwrecks. Outdoor exhibition sites include the Reclus Hut, originally made in Stanley, then shipped to Antarctica and set up there in 1956. Forty years later the famous house was brought back.`
          },
          {
            number: "IV",
            questionId: 18,
            content: `There are only about 380 children of school age living on the islands. For them, there is a primary and a secondary school in Stanley and three small settlement schools on large farms. Other rural pupils are taught by 'travelling' teachers. Schooling is free and compulsory for children between five and sixteen years of age. The government pays for older students to attend colleges, usually in the UK.`
          },
          {
            number: "V",
            questionId: 19,
            content: `The Falkland Islands government is taking advantage of cheap wind power. Since 1996, the government has been investing in the development of alternative sources of energy and can already enjoy the results. The Islands have experimented with other forms of energy, including hydro-electric and solar power. However, these forms cannot match the effectiveness of wind power yet.`
          },
          {
            number: "VI",
            questionId: 20,
            content: `The Falklands War was fought in 1982 between Argentina and the United Kingdom. It started with the Argentine invasion and occupation of the Falkland Islands and South Georgia. The war lasted 74 days and ended with an Argentine defeat. However, Argentina still has not fully given up its claim to the territory of the islands.`
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
        15: "D",
        16: "A",
        17: "B",
        18: "F",
        19: "E",
        20: "G"
      }
    },
    // ========== PART 4: Reading Comprehension - Fish and Chips (Questions 21-29) ==========
    {
      partNumber: 4,
      type: "reading-comprehension",
      title: "Part 4",
      questionRange: "21-29",
      instruction: "Read the following text for questions 21-29.",
      passage: {
        title: "Fish and Chips",
        content: `<p>Long before the Big Mac was invented, Britain had its own national form of fast food – fish and chips (or fish'n'chips for short). Fish'n'chips was a relatively balanced and healthy meal that people could eat in the street on the way home from work, or during their lunch-break. Wrapped in newspaper, it would keep warm even on the coldest days of the year. Besides, serving fish'n'chips in newspaper helped to keep prices low.</p>

<p>No British town is more than 150 km from a sea port, and most are much closer. So when railways were built in the 19th century, fresh sea fish could easily be bought in all British towns. Cheaper than meat, sea fish became a popular source of protein. By 1870, fish and chip shops were opening all over the country and soon every town in Britain had its fish'n'chip shops. For a hundred years, they were a popular British style restaurant.</p>

<p>In the last quarter of the 20th century, things changed. "Fish and chips are not so popular with young people these days," says Lizzie, a teenager. "Most of the time, if young people want to eat out, they'll go to a Burger King or a Chinese take-away. Fish 'n' chips is a bit old-fashioned. But there are still cheap chip shops around. We sometimes have it at home, and we go and get it from the chip shop. It saves cooking!"</p>

<p>Thousands of chip shops have closed in the last twenty-five years. Some have been turned into Chinese or Indian take-aways, others have just closed. They have survived best in seaside towns, where the fish is really fresh, and people visit them more as a tradition than for any other reason.</p>

<p>Yet nothing, perhaps, can save the classic fish'n'chip shop from disappearance. Fish'n'chips wrapped in newspaper is already just a memory. European hygiene rules don't allow food to be wrapped in old newspapers, so today's chip shops use cardboard boxes. Of course, you can still eat fish and chips with your fingers if you want, but there are now plastic throw-away forks for people who do not want to get greasy fingers!</p>

<p>In spite of these changes, the classic fish'n'chip shop could disappear in a few years' time for another reason – lack of fish. For over ten years European agriculture ministers have been trying to solve the fish problem but with little success. As a result of industrial fishing, some types of fish are disappearing. Limits on the number of fish that can be caught have been introduced, but fishermen in Britain and other countries protest against them because jobs are lost. At some point, thousands of European fishermen could lose their jobs anyway, as there will be few fish left to catch. Soon sea fish will become rarer and, as a result, more expensive.</p>

<p>The traditional fish'n'chip shops will certainly continue to reduce in number. Soon cheap fish'n'chip shops will be gone completely. Fish and chips, however, will survive as a high-priced specialty in some expensive restaurants. In the years to come, they may become the only place where you can try this traditional English dish.</p>`
      },
      questionSections: [
        {
          type: "mcq",
          title: "Questions 21-24: Multiple Choice",
          instruction: "For questions 21-24, choose the correct answer A, B, C, or D. Mark your answers on the answer sheet.",
          questions: [
            {
              id: 21,
              text: "Fish'n'chips …",
              options: [
                { letter: "A", text: "were as popular as Big Mac in the 19th century." },
                { letter: "B", text: "were originally Chinese or Indian food." },
                { letter: "C", text: "is not popular among the youth nowadays." },
                { letter: "D", text: "may completely disappear from markets including restaurants." }
              ]
            },
            {
              id: 22,
              text: "Fish'n'chips were wrapped …",
              options: [
                { letter: "A", text: "during a lunch-break" },
                { letter: "B", text: "in magazines." },
                { letter: "C", text: "on the coldest days." },
                { letter: "D", text: "to keep it cheap." }
              ]
            },
            {
              id: 23,
              text: "In the last twenty years, …",
              options: [
                { letter: "A", text: "a lot of shops turned into restaurants." },
                { letter: "B", text: "'fish'n'chips' has vanished from everywhere." },
                { letter: "C", text: "people started to like Chinese foods more than Big Macs." },
                { letter: "D", text: "many chip shops closed." }
              ]
            },
            {
              id: 24,
              text: "The author argues that …",
              options: [
                { letter: "A", text: "The British people should care about Fish'n'chips more than Big Macs or Indian foods." },
                { letter: "B", text: "In the near future, Fish'n'chips will vanish from daily lives." },
                { letter: "C", text: "Some restaurants are trying to preserve Fish'n'chips as a delicate food." },
                { letter: "D", text: "European hygiene rules are wrong to assume that wrapping in newspaper is unhealthy." }
              ]
            }
          ]
        },
        {
          type: "tfni",
          title: "Questions 25-29: True/False/No Information",
          instruction: "For questions 25-29, decide if the following statements agree with the information given in the text.",
          options: ["True", "False", "No Information"],
          questions: [
            { id: 25, text: "Traditionally only fish with white meat were used to make fish'n'chips." },
            { id: 26, text: "In the 19th century, in Britain, fish was more expensive than meat." },
            { id: 27, text: "According to Lizzie, today's young people prefer burgers to fish'n'chips." },
            { id: 28, text: "New packaging has made fish'n'chips more popular." },
            { id: 29, text: "In the near future there will be fewer places where people can try fish'n'chips." }
          ]
        }
      ],
      answers: {
        21: "C",
        22: "B",
        23: "D",
        24: "B",
        25: "No Information",
        26: "False",
        27: "True",
        28: "No Information",
        29: "True"
      }
    },
    // ========== PART 5: Reading Comprehension - The Secret of the Yawn (Questions 30-35) ==========
    {
      partNumber: 5,
      type: "reading-comprehension",
      title: "Part 5",
      questionRange: "30-35",
      instruction: "Read the following text for questions 30-35.",
      passage: {
        title: "The Secret of the Yawn",
        content: `<p>When a scientist began to study yawning in the 1980s, it was difficult to convince some of his research students of the merits of "yawning science." Although it may appear quirky, his decision to study yawning was a logical extension to human beings of my research in developmental neuroscience, reported in such papers as "Wing-flapping during Development and Evolution." As a neurobehavioral problem, there is not much difference between the wing-flapping of birds and the face – and body-flapping of human yawners. Yawning is an ancient, primitive act. Humans do it even before they are born, opening wide in the womb. Some snakes unhinge their jaws to do it. One species of penguins yawns as part of mating. Only now are researchers beginning to understand why we yawn, when we yawn and why we yawn back. A professor of cognitive neuroscience at Drexel University in Philadelphia, Steven Platek, studies the act of contagious yawning, something done only by people and other primates.</p>

<p>In his first experiment, he used a psychological test to rank people on their empathic feelings. He found that participants who did not score high on compassion did not yawn back. "We literally had people saying, 'Why am I looking at people yawning?'" Professor Platek said. "It just had no effect."</p>

<p>For his second experiment, he put 10 students in a magnetic resonance imaging machine as they watched video tapes of people yawning. When the students watched the videos, the part of the brain which reacted was the part scientists believe controls empathy – the posterior cingulate, in the brain's middle rear. "I don't know if it's necessarily that nice people yawn more, but I think it's a good indicator of a state of mind," said Professor Platek. "It's also a good indicator if you're empathizing with me and paying attention."</p>

<p>His third experiment is studying yawning in those with brain disorders, such as autism and schizophrenia, in which victims have difficulty connecting emotionally with others. A psychology professor at the University of Maryland, Robert Provine, is one of the few other researchers into yawning. He found the basic yawn lasts about six seconds and they come in bouts with an interval of about 68 seconds. Men and women yawn or half-yawn equally often, but men are significantly less likely to cover their mouths which may indicate complex distinction in genders." A watched yawner never yawns," Professor Provine said. However, the physical root of yawning remains a mystery. Some researchers say it's coordinated within the hypothalamus of the brain, the area that also controls breathing.</p>

<p>Yawning and stretching also share properties and may be performed together as parts of a global motor complex. But they do not always co-occur – people usually yawn when we stretch, but we don't always stretch when we yawn, especially before bedtime. Studies by J.I.P, G.H.A. Visser and H.F. Prechtl in the early 1980s, charting movement in the developing fetus using ultrasound, observed not just yawning but a link between yawning and stretching as early as the end of the first prenatal trimester.</p>

<p>The most extraordinary demonstration of the yawn-stretch linkage occurs in many people paralyzed on one side of their body because of brain damage caused by a stroke. The prominent British neurologist Sir Francis Walshe noted in 1923 that when these hemiplegics yawn, they are startled and mystified to observe that their otherwise paralyzed arm rises and flexes automatically in what neurologists term an "associated response." Yawning apparently activates undamaged, unconsciously controlled connections between the brain and the cord motor system innervating the paralyzed limb.</p>

<p>It is not known whether the associated response is a positive prognosis for recovery, nor whether yawning is therapeutic for reinnervation or prevention of muscular atrophy. Clinical neurology offers other surprises. Some patients with "locked-in" syndrome, who are almost totally deprived of the ability to move voluntarily, can yawn normally. The neural circuits for spontaneous yawning must exist in the brain stem near other respiratory and vasomotor centers, because yawning is performed by anencephalic who possess only the medulla oblongata. The multiplicity of stimuli of contagious yawning, by contrast, implicates many higher brain regions.</p>`
      },
      questionSections: [
        {
          type: "gap-fill",
          title: "Questions 30-33: Gap Filling Section",
          instruction: "Fill in the missing information in the numbered spaces. Write no more than ONE WORD and/or A NUMBER for each question.",
          summaryText: `<p>A psychology professor drew a conclusion after observation that it takes about six seconds to complete average yawning which needs <span class="gap-input" data-gap="30">_____(30)_____</span> seconds before the following yawning comes. It is almost at the same frequency that male and female yawn or half, yet behavior accompanied with yawning showing a complex <span class="gap-input" data-gap="31">_____(31)_____</span> in genders. Some parts within the brain may affect the movement which also has something to do with breathing another finding also finds there is a link between a yawn and <span class="gap-input" data-gap="32">_____(32)_____</span> before a baby was born, which two can be automatically co-operating even among people whose <span class="gap-input" data-gap="33">_____(33)_____</span> is damaged.</p>`,
          questions: [
            { id: 30, hint: "number - interval" },
            { id: 31, hint: "noun - difference" },
            { id: 32, hint: "verb/noun - body movement" },
            { id: 33, hint: "noun - body part" }
          ]
        },
        {
          type: "mcq",
          title: "Questions 34-35: Multiple Choice",
          instruction: "For questions 34-35, choose the correct answer A, B, C, or D.",
          questions: [
            {
              id: 34,
              text: "According to the passage, the yawning and stretching…",
              options: [
                { letter: "A", text: "isn't primitive and ancient, as the research suggest." },
                { letter: "B", text: "is something we do before we even born." },
                { letter: "C", text: "has something to do our bedtimes." },
                { letter: "D", text: "is just a response to our stress." }
              ]
            },
            {
              id: 35,
              text: "The author of this passage concludes that …",
              options: [
                { letter: "A", text: "even the people who doesn't move voluntarily can yawn." },
                { letter: "B", text: "the yawning is still a mystery to many scientists." },
                { letter: "C", text: "contagious yawning is a neural disorder." },
                { letter: "D", text: "yawning happens inside the brain simultaneously." }
              ]
            }
          ]
        }
      ],
      answers: {
        30: ["68"],
        31: ["distinction"],
        32: ["stretch", "stretching"],
        33: ["brain"],
        34: "B",
        35: "A"
      }
    }
  ]
};
