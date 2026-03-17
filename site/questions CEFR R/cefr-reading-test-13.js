// CEFR Reading Test 13
// 5 Parts, 35 Questions - B1-B2-C1 Level

window.CEFR_READING_TEST = {
    testInfo: {
        title: "CEFR B1-B2-C1 Reading Test 13",
        totalQuestions: 35,
        totalTime: 60,
        parts: 5,
        level: "B1-B2-C1"
    },
    parts: [
        // ===== PART 1: Gap Fill Text =====
        {
            partNumber: 1,
            title: "Part 1",
            type: "gap-fill-text",
            questionRange: "1-6",
            instruction: "Read the text. Fill in each gap with ONE word. You must use a word which is somewhere in the rest of the text.",
            passage: {
                title: "Health and Education",
                content: `<p>Lots of factors contribute to how healthy a person is. Some of these are obvious, like the medical care they receive. But some less <span class="gap" data-gap="1">_____(1)_____</span> factors can be even more important! <span class="gap" data-gap="2">_____(2)_____</span> determinants of health are the non-medical factors that impact our well-being. These are the personal circumstances that shape your daily life. Some examples include access to food, housing, healthcare, social support, and education. Research shows that social determinants of health have a big effect on our health. They also contribute to <span class="gap" data-gap="3">_____(3)_____</span> inequities. For example, getting more education leads to better employment, higher income, and access to healthcare. And all of these improve overall health. So, people with <span class="gap" data-gap="4">_____(4)_____</span> education tend to have higher life expectancies than people with less education. We knew from other studies that more <span class="gap" data-gap="5">_____(5)_____</span> is associated with longer lives. But no one had calculated exactly how much longer. We wanted to figure out how much mortality risk goes down with each year of schooling. In other words, how does education lower a person\u2019s risk of death? Of course, everyone still dies, but a lower mortality <span class="gap" data-gap="6">_____(6)_____</span> means a higher chance of a long life.</p>`
            },
            questions: [
                { id: 1, hint: "some less _____ factors" },
                { id: 2, hint: "_____ determinants of health" },
                { id: 3, hint: "contribute to _____ inequities" },
                { id: 4, hint: "people with _____ education" },
                { id: 5, hint: "more _____ is associated" },
                { id: 6, hint: "a lower mortality _____" }
            ],
            answers: {
                1: ["obvious"],
                2: ["social"],
                3: ["health"],
                4: ["more"],
                5: ["education"],
                6: ["risk"]
            }
        },

        // ===== PART 2: Matching - Home Products =====
        {
            partNumber: 2,
            title: "Part 2",
            type: "matching",
            questionRange: "7-14",
            instruction: "Read the texts 7-14 and the statements A-J. Decide which text matches with the situation described in the statements. Each statement can be used ONCE only. There are TWO extra statements which you do not need to use.",
            statementsFirst: true,
            statements: [
                { letter: "A", text: "You want something made from cherry wood." },
                { letter: "B", text: "You want to make something to get yourself and your family members clean as well as relaxing." },
                { letter: "C", text: "They will set-up your entertainment systems." },
                { letter: "D", text: "You want to set up a TV yourself." },
                { letter: "E", text: "Extra space for your room." },
                { letter: "F", text: "You want to store your high-quality drinks." },
                { letter: "G", text: "You need a big bed for your room." },
                { letter: "H", text: "You set the table with these." },
                { letter: "I", text: "You are looking for a discount." },
                { letter: "J", text: "Big or small \u2013 just for your books." }
            ],
            texts: [
                { number: 7, title: "Lifestyle Products Direct", content: "Massive Savings on Quality Teak Garden Furniture. Save up to 60%. Freephone: 0800 328 8924. Lifestyle Products Direct, Osbournby, Lincs." },
                { number: 8, title: "The London Wall Bed Company", content: "NEED AN EXTRA ROOM? THE LONDON WALL BED COMPANY. A UNIQUE IDEA. BEDS FOLD AWAY INTO THE WARDROBE. CALL FOR FULL DETAILS: 020 8742 8200 www.wallbed.co.uk" },
                { number: 9, title: "Brights", content: "BRIGHTS \u2013 UNREPEATABLE STOCK OFFER. Chippendale style dining room furniture in solid cherry. A complete set for only \u00a31950. Nettlebed of Oxon. Tel. 01491 641115 www.brightsofnettlebed.com" },
                { number: 10, title: "VIN Garde Ltd.", content: "Wine Storage Cabinets. Temperature and humidity controlled wine storage cabinets. Full installation service available. VIN Garde Ltd. 0208 398 9300 www.vin-garde.co.uk" },
                { number: 11, title: "Jacuzzi Pool Spas", content: "JACUZZI POOL SPAS. The genuine brand. Everything else is just a hot tub. Alone or with the whole family, everyone will enjoy the Jacuzzi experience. Tel: 0670 330 7220 www.jacuzzipool-spas.co.uk" },
                { number: 12, title: "Glazebrook and Co", content: "GLAZEBROOK AND CO. Finest British Stainless Steel Cutlery at Exceptional Value. Mail order catalogue and free sample service. Tel: 020 7731 7135 Fax: 020 7371 5434 www.glazebrook.com" },
                { number: 13, title: "Top 20 UK", content: "Looking for the best Hi-Fi, Home Cinema or Custom Installation Dealers? Visit www.top20uk.info" },
                { number: 14, title: "The Hungerford Bookcase Company", content: "THE HUNGERFORD BOOKCASE COMPANY. Made to measure or free standing bookcases, wall units, TV and video units and much more. Craftsman made in the finest solid woods. Telephone for our brochure and price list: 01486 1262 or www.hungerford.co.uk" }
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
                7: ["I"],
                8: ["E"],
                9: ["A"],
                10: ["F"],
                11: ["B"],
                12: ["H"],
                13: ["C"],
                14: ["J"]
            },
            extraStatements: ["D", "G"]
        },

        // ===== PART 3: Matching Headings - Rivers =====
        {
            partNumber: 3,
            title: "Part 3",
            type: "matching-headings",
            questionRange: "15-20",
            instruction: "Read the text and choose the correct heading for each paragraph from the list of headings below. There are more headings than paragraphs, so you will not use all of them. You cannot use any heading more than once.",
            headings: [
                { letter: "A", text: "Dangers beneath the surface" },
                { letter: "B", text: "A source of literary inspiration" },
                { letter: "C", text: "Flooding creates farmland" },
                { letter: "D", text: "Rivers sustain life" },
                { letter: "E", text: "Home to extraordinary nature" },
                { letter: "F", text: "Growth brings environmental damage" },
                { letter: "G", text: "Connecting nations" },
                { letter: "H", text: "An ancient civilization\u2019s lifeline" }
            ],
            passage: {
                title: "RIVERS",
                paragraphs: [
                    { number: "I", questionId: 15, content: "Rivers have been essential to human life since the beginning of civilization. They provide fresh water for drinking, water for irrigating crops, and transportation routes for trade and travel. Many of the world\u2019s greatest cities were founded on the banks of rivers, including London on the Thames, Paris on the Seine, and Cairo on the Nile. Rivers also support rich ecosystems, home to thousands of species of fish, birds, and other wildlife. Even today, billions of people around the world depend on rivers for their daily survival." },
                    { number: "II", questionId: 16, content: "The Nile is often considered the longest river in the world, stretching approximately 6,650 kilometers through northeastern Africa. It was the backbone of one of the greatest civilizations in history: ancient Egypt. The Pharaohs built temples, pyramids, and entire cities along its banks. The river provided water, food, and a transportation route through the desert. The ancient Egyptians worshipped the Nile as a god, and their entire calendar was based on the river\u2019s annual flood cycle." },
                    { number: "III", questionId: 17, content: "Each year, heavy rains in the mountains of East Africa cause the Nile to rise and overflow its banks. When the waters recede, they leave behind a thick layer of dark, fertile silt. For thousands of years, Egyptian farmers have used this rich soil to grow their crops. The annual flooding of the river creates rich agricultural soil, ideal for growing wheat and flax and other crops." },
                    { number: "IV", questionId: 18, content: "When people think of the Mississippi River, their first thought is usually of Mark Twain and the adventures of Tom Sawyer and Huck Finn. They may not recall from their childhood geography lessons that the Mississippi is the fourth longest river in the world. For thousands of years, Native Americans lived along the Mississippi, mostly living as hunter-gatherers and herders. That life changed forever when Europeans first arrived in the 16th century; today the Mississippi plays a crucial role in the economic life of dozens of cities and small towns situated along its shores." },
                    { number: "V", questionId: 19, content: "The third longest river is the Yangtze River in China. The river plays a very important role in China\u2019s history, culture and economy. Nearly one-third of China\u2019s huge population lives along the Yangtze river. The Yangtze is one of the world\u2019s busiest waterways. Everything is transported along the Yangtze: coal, cars, produce and people. The river also attracts many tourists who take cruises through the famous Three Gorges area. Sadly, because of the heavy traffic on the river and industry along its, banks the Yangtze is very polluted." },
                    { number: "VI", questionId: 20, content: "The Nile may still earn the title for longest river, but the Amazon \u2014 the second longest \u2014 has the greatest volume by far. The Amazon contains approximately one-fifth of the water flowing in the world\u2019s rivers. Uniquely, there are no bridges crossing the Amazon anywhere along its long route. Most of the Amazon flows through tropical rainforests, where there are few roads or cities \u2014 and therefore no need for bridges. The Amazon Rainforest is the home of more than one-third of all animal and plant species in the world." }
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
                15: ["D"],
                16: ["H"],
                17: ["C"],
                18: ["B"],
                19: ["F"],
                20: ["E"]
            },
            extraHeadings: ["A", "G"]
        },

        // ===== PART 4: Reading Comprehension - Silk Road =====
        {
            partNumber: 4,
            title: "Part 4",
            type: "reading-comprehension",
            questionRange: "21-29",
            instruction: "Read the following text for questions 21-29.",
            passage: {
                title: "Silk Road leads from Uzbekistan to London for landmark exhibition",
                content: `<p>A monumental six-metre-long wall painting created in the 7th century, and 8th-century ivory figures carved for one of the world\u2019s oldest surviving chess sets, are among treasures set to be seen in Britain for the first time. The items will travel from the ancient city of Samarkand to the UK for an exhibition opening in September, as part of the first-ever loan from museums in Uzbekistan to the British Museum.</p><p>Silk Roads, a groundbreaking exhibition spanning AD500 to 1000, will go beyond the popular image of trade between east and west, with camel caravans and merchants selling silks and spices in bazaars, to explore connections between cultures and continents, centuries before the development of today\u2019s globalised world. It will show that, rather than a single trade route, there were overlapping networks linking communities across Asia, Africa and Europe. More than 300 objects will include loans from 29 national and international institutions, many on display in the UK for the first time. Tickets for the exhibition, which runs until February, go on sale on Monday.</p><p>Yu-ping Luk, one of the lead curators of the show, said: \u201cWe will of course have camels, and there will be silk and references to camel caravans that are also a very important part of the Silk Roads. But we wanted to go beyond that and tell a richer story of the networks in multiple directions, not just east-west but north-south and elsewhere, and also the movement of objects, peoples and ideas.\u201d The six-metre wall painting, a vibrant depiction of a procession of people riding camels, horses and an elephant, is from the \u201cHall of the Ambassadors\u201d in Samarkand. Dating from the 660s and part of a series excavated in the 1960s, it is an unparalleled example of art created by the region\u2019s ancient Sogdians, who were great traders. Its title derives from its portrayal of peoples of different origins, from neighbouring regions and as far as the Korean peninsula, who were coming to Samarkand to trade.</p><p>Luk, the British Museum\u2019s curator of Chinese paintings, prints and central Asian collections, said it shows the cosmopolitanism of the Sogdians: \u201cWe\u2019re really excited to be able to borrow it and show it for the first time in the UK.\u201d She said Silk Road traders are sometimes depicted as \u201cpeddlers or small-scale merchants\u201d. \u201cBut here is an image from their homeland that shows them having prospered from their trade.\u201d</p><p>The 8th-century ivory carvings are seven chess set pieces which have survived. Luk said: \u201cThey are among the earliest \u2013 if not the earliest \u2013 chess pieces known in the world. They were excavated from a site in Samarkand and are thought to date from the 700s. The figures represent part of an army. There are foot soldiers, horse riders, people riding chariots, an elephant rider. Ivory was a luxury commodity at the time, which indicates that this set was a high-value object. \u201cWhen chess was first developed in India around AD500, before spreading to the Middle East and Europe, it was a game for training military strategy among the elite. This is a great example of how, during the period we\u2019re covering in the exhibition, all these networks and connections have a legacy to the contemporary period, when chess as a game is spreading.\u201d</p><p>Due to its scope and geographical coverage, the exhibition will feature objects from every department across the British Museum, including Indian garnets discovered in Suffolk and Chinese ceramics found in Egypt, reflecting the astonishing reach of the Silk Road networks.</p><p>Exhibits will also include a gilded container that probably held chrism, a blended oil used in Christian rituals such as baptism, which was often scented with balsam, a valuable plant resin from the eastern Mediterranean or Arabia. In the AD720s, tight export controls inspired an English bishop called Willibald to smuggle it past Umayyad customs officials at Tyre in present-day Lebanon. He concealed the balsam in a hollowed-out gourd beneath a layer of mineral oil, which masked its distinctive fragrance.</p>`
            },
            questionSections: [
                {
                    type: "mcq",
                    title: "Questions 21-24: Multiple Choice",
                    instruction: "For questions 21-24, choose the correct answer A, B, C, or D.",
                    questions: [
                        {
                            id: 21,
                            text: "According to the passage, the ancient wall is \u2026",
                            options: [
                                { letter: "A", text: "made centuries ago." },
                                { letter: "B", text: "six meters tall." },
                                { letter: "C", text: "created in Uzbekistan for the first time." },
                                { letter: "D", text: "carved with chess sets and ivory figures." }
                            ]
                        },
                        {
                            id: 22,
                            text: "We can understand from the passage that the exhibition \u2026",
                            options: [
                                { letter: "A", text: "covers only British and Uzbek historical trade." },
                                { letter: "B", text: "shows that an ancient trade network has survived from the past to the present." },
                                { letter: "C", text: "also cover objects made in 1960s" },
                                { letter: "D", text: "will feature connections of people and states\u2019 in the ancient past." }
                            ]
                        },
                        {
                            id: 23,
                            text: "Luk, the British museum\u2019s curator \u2026",
                            options: [
                                { letter: "A", text: "doesn\u2019t want to go beyond showing camels, spices and silk." },
                                { letter: "B", text: "is excited by the fact that he is borrowing some of the objects in the future." },
                                { letter: "C", text: "aren\u2019t really sure that merchants from the ancient era aren\u2019t as big as today\u2019s world." },
                                { letter: "D", text: "confirms that they will indeed want to go beyond one trade network." }
                            ]
                        },
                        {
                            id: 24,
                            text: "Exhibits also include \u2026",
                            options: [
                                { letter: "A", text: "ancient ritual oils and their ingredients." },
                                { letter: "B", text: "a valuable plant known as resin which is blended with balsam." },
                                { letter: "C", text: "tight export displays." },
                                { letter: "D", text: "an object which was probably used for religious purposes." }
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
                        { id: 25, text: "The Exhibit spans across 1500 years." },
                        { id: 26, text: "The six-meter-long wall is a part of \u201cHalls of the Ambassadors\u201d." },
                        { id: 27, text: "The Sogdians were skilled merchants." },
                        { id: 28, text: "Ivory carvings are made like soldiers." },
                        { id: 29, text: "The Sogdians traveled to Korea, Suffolk and Egypt." }
                    ]
                }
            ],
            answers: {
                21: ["A", "made centuries ago."],
                22: ["D", "will feature connections of people and states\u2019 in the ancient past."],
                23: ["C", "aren\u2019t really sure that merchants from the ancient era aren\u2019t as big as today\u2019s world."],
                24: ["D", "an object which was probably used for religious purposes."],
                25: ["False"],
                26: ["True"],
                27: ["True"],
                28: ["True"],
                29: ["No Information"]
            }
        },

        // ===== PART 5: Reading Comprehension - Emojis =====
        {
            partNumber: 5,
            title: "Part 5",
            type: "reading-comprehension",
            questionRange: "30-35",
            instruction: "Read the following text for questions 30-35.",
            passage: {
                title: "EMOJIS",
                content: `<p>Language always changes, of course. This is one of the few constants about it. But it\u2019s arguably changing at a faster rate now than at any previous moment in its history. And emojis - the set of picture characters that people use to punctuate their online correspondence - are at the forefront of this frenzy for change. As a form of global communication, emojis only began their growth in 2011. Four years later, it was estimated that they were being used by over 90 per cent of the online population. In excess of six billion were being sent every day. Their prevalence in the culture was such that Oxford Dictionaries recently chose one as their word of the year. \u2018Words of the Year\u2019 are those judged to be reflective of the \u2018ethos, mood, or preoccupations of that particular year\u2019. They\u2019re very much of their time. And often, once that time has passed, they fade from people\u2019s consciousness almost as quickly as they arose.</p><p>There\u2019s a good chance, then, that the emoji chosen by Oxford Dictionaries - the \u2018face with tears of joy\u2019 - will also appear to be dated in a few years. But the reasons for this offer a fascinating insight into the way that society is evolving. The little yellow circle with dots for eyes acts as a surprisingly good lens through which to view the history of human communication, and to predict its future.</p><p>There are two main reasons why language changes. One is to do with the way that language mirrors the changes in how we relate to each other. As an expression of identity, language is adapted by different groups and different generations to reflect their own sense of self. It also needs to constantly assimilate fresh concepts as these evolve. Words are being created for these reasons all the time. But what\u2019s interesting about emojis is that they\u2019ve contributed to this ever-expanding storehouse in a different way. At this point in our history, the gaps in our vocabulary are being filled not simply by new words, but by an absolutely new system of expression.</p><p>The second major reason that language changes is down to technology specifically, the ways in which the technologies we use have an effect on the process of communication itself. Both hardware and new technologies result in us subtly changing the way we interact with each other and also altering the shape of the language we use. Emojis have evolved as a solution to the needs of mobile communication. In particular, they compensate for the way that computer-mediated messaging on smartphones can sometimes tend towards the emotionally empty. Whereas face-to-face, or even voice-to-voice, conversations can express emotional closeness through facial expression or tone of voice, this is easy to miss when messages are rendered in a few short words on a small screen. Emojis are a means of restoring this emotional framing to an interaction - punctuating your message with a smile.</p><p>But unlike almost any other type of language system, emojis have something akin to a built-in obsolescence. Just as smartphones and their operating systems have a frequent refresh rate, emojis also get routine enhancements. The emojis you have on your phone now will undergo subtle redesigns over the course of time, and extra characters will be added. Because of this, their usefulness is artificially limited. In the context of communication systems, this is something that\u2019s never previously been the case. Twenty years ago, people might have bought a new landline phone when they were tired of the design of their old phone or if they wanted to get one with whatever latest innovation was going around - an inbuilt answering machine, say. But they didn\u2019t have to upgrade the language they were using as well. Emojis, on the other hand, are a case study of how technology and the human capacity for communication are working together - of how the onward march of technology exists at the intersection of consumerism, innovation and design. Moreover, the fact that they\u2019re at the front line of a relentless wave of technologically driven change in communications practices encourages - if not necessitates - a great amount of creativity in the way they\u2019re used.</p><p>Finally, there\u2019s the way they\u2019ve become implicated in almost all aspects of modern society, from politics and marketing to art and entertainment. Emojis are the subject of musicals and Hollywood films. They\u2019re the inspiration for fashion design, art and architecture. They\u2019re a staple in advertising and commerce. Understanding why they\u2019ve become so popular, and how they work, can not only explain something about the nature of language; it can also help us to understand our relationship with technology, society and ourselves.</p>`
            },
            questionSections: [
                {
                    type: "gap-fill",
                    title: "Questions 30-33: Gap Filling Section",
                    instruction: "For questions 30-33, fill in the missing information in the numbered spaces. Write no more than ONE WORD and/or A NUMBER for each question.",
                    summaryText: `<p><strong>The importance of the \u2018face with tears of joy\u2019</strong></p><p>It is probable that before long, an emoji such as the \u2018face with tears of joy\u2019 will seem <span class="gap-input" data-gap="30">_____(30)_____</span>. This is of interest as it tells us about developments in society providing an effective way to focus on both the <span class="gap-input" data-gap="31">_____(31)_____</span> and the future of human communication.</p><p>Changes in language reflect changes in people\u2019s relationships. They reflect the ways in which the <span class="gap-input" data-gap="32">_____(32)_____</span> of groups and generations changes over time, and they allow new <span class="gap-input" data-gap="33">_____(33)_____</span> to be included. However, emojis are interesting as they are a system that expresses these ideas in a completely new way.</p>`,
                    questions: [
                        { id: 30, hint: "will seem _____" },
                        { id: 31, hint: "both the _____ and the future" },
                        { id: 32, hint: "the _____ of groups" },
                        { id: 33, hint: "new _____ to be included" }
                    ]
                },
                {
                    type: "mcq",
                    title: "Questions 34-35: Multiple Choice",
                    instruction: "For questions 34-35, choose the correct answer A, B, C, or D.",
                    questions: [
                        {
                            id: 34,
                            text: "What does the writer say about \u2018Words of the Year\u2019?",
                            options: [
                                { letter: "A", text: "They include increasing numbers of emojis." },
                                { letter: "B", text: "They are soon forgotten by the public." },
                                { letter: "C", text: "They are required to have social significance." },
                                { letter: "D", text: "They are invented by the writers of dictionaries." }
                            ]
                        },
                        {
                            id: 35,
                            text: "What would be the best subtitle for this text?",
                            options: [
                                { letter: "A", text: "Will emojis take over from words one day?" },
                                { letter: "B", text: "How can emojis be made more meaningful?" },
                                { letter: "C", text: "Are emojis used too much in our society today?" },
                                { letter: "D", text: "What do emojis tell us about the world we live in?" }
                            ]
                        }
                    ]
                }
            ],
            answers: {
                30: ["dated"],
                31: ["history"],
                32: ["identity"],
                33: ["concepts"],
                34: ["B", "They are soon forgotten by the public."],
                35: ["D", "What do emojis tell us about the world we live in?"]
            }
        }
    ]
};
