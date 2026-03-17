// CEFR Reading Test 11
// 5 Parts, 35 Questions - B1-B2-C1 Level

window.CEFR_READING_TEST = {
    testInfo: {
        title: "CEFR B1-B2-C1 Reading Test 11",
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
                title: "Can Machines Think?",
                content: `<p>How can you tell if you are talking to a computer? New <span class="gap" data-gap="1">_____(1)_____</span> programs called language models have gotten very good at mimicking people. It can be really hard to tell if you\u2019re talking to a person or a computer. Can a machine think? Philosophers have been trying to answer this question for hundreds of years. It\u2019s surprisingly tricky to come up with a good answer! Alan Turing was a computer scientist who thought a lot about artificial intelligence (AI). He had an idea for a different way to test intelligence. Instead of measuring <span class="gap" data-gap="2">_____(2)_____</span> directly, what if you measured intelligent behavior? Can a computer answer questions in a human-like way? If a computer can respond to you so well that you can\u2019t tell whether it is a computer or a person, we say that it passes the Turing test.</p><p>Recently, computer programs called language models have gotten much better at mimicking <span class="gap" data-gap="3">_____(3)_____</span> language. These AI <span class="gap" data-gap="4">_____(4)_____</span> analyze millions of sentences from books and websites to learn hidden patterns in language. It\u2019s exciting to see AI generating realistic sentences. But there are also problems with AI-generated text. People have used AI-generated <span class="gap" data-gap="5">_____(5)_____</span> to cheat on tests. Chatbots can give harmful advice. And scammers can use AI to generate fake information so they can trick <span class="gap" data-gap="6">_____(6)_____</span>.</p>`
            },
            questions: [
                { id: 1, hint: "New _____ programs" },
                { id: 2, hint: "measuring _____ directly" },
                { id: 3, hint: "mimicking _____ language" },
                { id: 4, hint: "These AI _____" },
                { id: 5, hint: "AI-generated _____" },
                { id: 6, hint: "trick _____" }
            ],
            answers: {
                1: ["computer"],
                2: ["intelligence"],
                3: ["person"],
                4: ["programs"],
                5: ["text"],
                6: ["people"]
            }
        },

        // ===== PART 2: Matching - Hotels =====
        {
            partNumber: 2,
            title: "Part 2",
            type: "matching",
            questionRange: "7-14",
            instruction: "Read the texts 7-14 and the statements A-J. Decide which text matches with the situation described in the statements. Each statement can be used ONCE only. There are TWO extra statements which you do not need to use.",
            statementsFirst: true,
            statements: [
                { letter: "A", text: "You want a personal service." },
                { letter: "B", text: "You want visit a lakeside hotel during summer." },
                { letter: "C", text: "You want someone to go fishing for you." },
                { letter: "D", text: "You want to go someplace unique with nice foods during your holidays." },
                { letter: "E", text: "This hotel is suitable for exploration, visiting a beach etc." },
                { letter: "F", text: "This hotel is near docks." },
                { letter: "G", text: "You are looking for a reliable hotel to visit in autumn." },
                { letter: "H", text: "You want to visit beaches during September and October." },
                { letter: "I", text: "This hotel is a beach and has some relaxing facilities." },
                { letter: "J", text: "This place has golf and a fitness centre." }
            ],
            texts: [
                { number: 7, title: "HIGHBULLEN HOTEL - GOLF AND COUNTRY CLUB", content: "Spectacular scenery with sporting, golf and leisure facilities. State of the art \u201cLife Fitness\u201d Gym, Health and Beauty suite with Sauna. Offering excellent cuisine and all within easy reach of the M5. 01769 540561 www.highbullen.co.uk" },
                { number: 8, title: "THE FAT LAMB COUNTRY INN - RAVENSDALE CUMBRIA", content: "Award winning hotel situated in magnificent scenery between Lakes and Dales. Informal, warm and comfortable. SPECIAL TELEGRAPH SUMMER BREAKS AVAILABLE BROCHURE - 015396 23242 www.fatlamb.co.uk" },
                { number: 9, title: "NORTH WALES", content: "Enjoy the break of a lifetime any 3 nights for the price of 2. Just 20 minutes from Chester yet surrounded by 4000 acres of Welsh countryside. Award winning team of chefs. Log fires. Peace. Tel: 08707 292 292 www.bodidrishall.com" },
                { number: 10, title: "POLURRIAN HOTEL - MULLION, LIZARD PENINSULAR", content: "Overlooking sandy cove and surrounded by N.T. Coastline. Sea and Fresh Cornish air. Exceptional leisure facilities. Tel: 01326 240421 www.polurrianhotel.com" },
                { number: 11, title: "The Berry Head Hotel - Brixham South Devon", content: "Steeped in history, nestling on the water\u2019s edge - near picturesque fishing port. Suburb location for walking, sailing and fishing. Brochure Tel: 01803 8532225 www.berryheadhotel.com" },
                { number: 12, title: "ROYAL YORK FAULKNER HOTEL - SIDMOUTH", content: "Charming, well run promenade regency hotel. All amenities, excellent leisure facilities and renowned personal service. FREEPHONE: 0800 220714 www.royalyorkhotel.net" },
                { number: 13, title: "BLAKENEY HOTEL - BLAKENEY, NORFOLK", content: "Traditional privately owned friendly hotel overlooking the estuary. Ideal to explore Norfolk coast and countryside. Tel: 01263 740797 www.blakenly-hotel.co.uk" },
                { number: 14, title: "The Cottage Hotel - Hope Cove, Salcombe, Devon", content: "AUGUST AND SEPTEMBER AVAILABILITY. Family run for 30 successful years. First class service. www.hopecove.com Tel: 01548 561555" }
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
                7: ["J"],
                8: ["B"],
                9: ["D"],
                10: ["I"],
                11: ["F"],
                12: ["A"],
                13: ["E"],
                14: ["G"]
            },
            extraStatements: ["C", "H"]
        },

        // ===== PART 3: Matching Headings - Jakarta =====
        {
            partNumber: 3,
            title: "Part 3",
            type: "matching-headings",
            questionRange: "15-20",
            instruction: "Read the text and choose the correct heading for each paragraph from the list of headings below. There are more headings than paragraphs, so you will not use all of them. You cannot use any heading more than once.",
            headings: [
                { letter: "A", text: "A taste of everything" },
                { letter: "B", text: "Shop till you drop" },
                { letter: "C", text: "City\u2019s tourist attractions" },
                { letter: "D", text: "Ancient traditions live on" },
                { letter: "E", text: "Activities for the adventurous and hardy" },
                { letter: "F", text: "On the crossroads of religions" },
                { letter: "G", text: "For the body, mind and soul" },
                { letter: "H", text: "From the high peaks to the deep seas" }
            ],
            passage: {
                title: "JAKARTA",
                paragraphs: [
                    { number: "I", questionId: 15, content: "Today Jakarta has much to offer, ranging from museums, art and antique markets, first class shopping to accommodations and a wide variety of cultural activities. Jakarta\u2019s most famous landmark, the National Monument or Monas is a 137m obelisk topped with a flame sculpture coated with 35 kg of gold. Among other places one can mention the National museum that holds an extensive collection of ethnographic artifacts and relics, the Maritime Museum that exhibits Indonesia\u2019s seafaring traditions, including models of sea going vessels." },
                    { number: "II", questionId: 16, content: "Sumatra is a paradise for nature lovers, its national parks are the largest in the world, home to a variety of monkeys, tigers and elephants. Facing the open sea, the western coastline of Sumatra and the waters surrounding Nias Island have big waves that make them one of the best surfer\u2019s beaches in Indonesia. There are beautiful coral reefs that are ideal for diving. For those who prefer night dives, the waters of Riau Archipelago offer a rewarding experience with marine scavengers of the dark waters." },
                    { number: "III", questionId: 17, content: "Various establishments offer professional pampering service with floral baths, body scrubs, aromatic oils, massages and meditation; rituals and treatments that use spices and aromatic herbs to promote physical and mental wellness. Various spa hotels are extremely popular. Indonesians believe that when treating the body you cure the mind." },
                    { number: "IV", questionId: 18, content: "Jakarta has a distinctly cosmopolitan flavor. Tantalize your taste buds with a gastronomic spree around the city\u2019s many eateries. Like French gourmet dining, exotic Asian cuisine, American fast food, stylish cafes, restaurants all compete to find a way into your heart through your stomach. The taste of Indonesia\u2019s many cultures can be found in almost any corner of the city: hot and spicy food from West Sumatra, sweet tastes of Dental Java, the tangy fish dishes of North Sulawesi." },
                    { number: "V", questionId: 19, content: "In the face of constant exposure to modernization and foreign influences, the native people still faithfully cling to their culture and rituals. The pre-Hindu Bali Aga tribe still maintains their own traditions of architecture, pagan religion, dance and music, such as unique rituals of dances and gladiator-like battles between youths. On the island of Siberut native tribes have retained their Neolithic hunter-gathering culture." },
                    { number: "VI", questionId: 20, content: "Whether you are a serious spender or half hearted shopper, there is sure to be something for everybody in Jakarta. Catering to diverse tastes and pockets, the wide variety of things you can buy in Jakarta is mind boggling from the best of local handicrafts to haute couture labels. Modern super and hyper markets, multi-level shopping centers, retail and specialty shops, sell quality goods at a competitive price. Sidewalk bargains range from tropical blooms of vivid colors and scents in attractive bouquets to luscious fruits of the seasons." }
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
                15: ["C"],
                16: ["E"],
                17: ["G"],
                18: ["A"],
                19: ["D"],
                20: ["B"]
            },
            extraHeadings: ["F", "H"]
        },

        // ===== PART 4: Reading Comprehension - Sleep =====
        {
            partNumber: 4,
            title: "Part 4",
            type: "reading-comprehension",
            questionRange: "21-29",
            instruction: "Read the following text for questions 21-29.",
            passage: {
                title: "A good night\u2019s sleep \u2014 an impossible dream?",
                content: `<p>Tonight, do yourself a favor. Shut off the TV, log off the Internet and unplug the phone. Relax, take a bath, maybe sip some herbal tea. Then move into the bedroom. Set your alarm clock for a time no less than eight hours in the future, fluff up your pillows and lay your head down for a peaceful night of restorative shut-eye. That\u2019s what American doctors advise.</p><p>American sleep experts are sounding an alarm over America\u2019s sleep deficit. They say Americans are a somnambulant nation, stumbling groggily through their waking hours for lack of sufficient sleep. They are working longer days \u2014 and, increasingly, nights \u2014 and they are playing longer, too, as TV and the Internet expand the range of round-the-clock entertainment options. By some estimates, Americans are sleeping as much as an hour and a half less per night than they did at the turn of the century \u2014 and the problem is likely to get worse.</p><p>The health repercussions of sleep deprivation are not well understood, but sleep researchers point to ills ranging from heart problems to depression. In a famous experiment conducted at the University of Chicago in 1988, rats kept from sleeping died after two and a half weeks. People are not likely to drop dead in the same way, but sleep deprivation may cost them their lives indirectly, when an exhausted doctor prescribes the wrong dosage or a sleepy driver weaves into someone\u2019s lane.</p><p>What irritates sleep experts most is the fact that much sleep deprivation is voluntary. \u201cPeople have regarded sleep as a commodity that they could shortchange,\u201d says one of them. \u201cIt\u2019s been considered a mark of very hard work and upward mobility to get very little sleep. It\u2019s a macho attitude.\u201d Slumber scientists hope that attitude will change. They say people have learned to modify their behavior in terms of lowering their cholesterol and increasing exercise. Doctors also think people need to be educated that allowing enough time for sleep and taking strategic naps are the most reliable ways to promote alertness behind the wheel and on the job.</p><p>Well, naps would be nice, but at the moment, employers tend to frown on them. And what about the increasing numbers of people who work at night? Not only must they work while their bodies\u2019 light-activated circadian rhythms tell them to sleep, they also find it tough to get to sleep after work. Biologists say night workers have a hard time not paying attention to the 9-to-5 day because of noises or family obligations or that\u2019s the only time they can go to the dentist. There are not too many dentists open at midnight.</p><p>As one might imagine, companies are springing up to take advantage of sleeplessness. One of the companies makes specially designed shift-work lighting systems intended to keep workers alert around the clock. Shiftwork\u2019s theory is that bright light, delivered in a controlled fashion, can help adjust people\u2019s biological clocks. The company president says they are using light like a medicine. So far, such special lighting has been the province of NASA astronauts and nuclear power plant workers. He thinks that in the future, such systems may pop up in places like hospitals and 24-hour credit-card processing centers. Other researchers are experimenting with everything from welder\u2019s goggles (which night workers wear during the day) to human growth hormones. And, of course, there is always what doctors refer to as \u201ctherapeutic caffeine use\u201d, but everyone is already familiar with that.</p>`
            },
            questionSections: [
                {
                    type: "mcq",
                    title: "Questions 21-24: Multiple Choice",
                    instruction: "For questions 21-24, choose the correct answer A, B, C, or D.",
                    questions: [
                        {
                            id: 21,
                            text: "The advice of American doctors is all about \u2026",
                            options: [
                                { letter: "A", text: "ways to reduce negative effect of modern technologies." },
                                { letter: "B", text: "complex measures that ensure healthy sleep." },
                                { letter: "C", text: "positive effect of herbal therapy." },
                                { letter: "D", text: "the process of restoring from unexpected psychological stress." }
                            ]
                        },
                        {
                            id: 22,
                            text: "Having naps during the day would be nice, but \u2026",
                            options: [
                                { letter: "A", text: "doctors do not find them effective." },
                                { letter: "B", text: "people won\u2019t take them voluntarily." },
                                { letter: "C", text: "bosses are against this." },
                                { letter: "D", text: "it is difficult to arrange." }
                            ]
                        },
                        {
                            id: 23,
                            text: "People who work at night can hardly \u2026",
                            options: [
                                { letter: "A", text: "fulfill traditional family obligations." },
                                { letter: "B", text: "consult doctors when needed." },
                                { letter: "C", text: "socialize to their liking." },
                                { letter: "D", text: "ever sleep without ear-plugs." }
                            ]
                        },
                        {
                            id: 24,
                            text: "The main aim of specially designed shift-work lighting system is \u2026",
                            options: [
                                { letter: "A", text: "to help people feel alert at night." },
                                { letter: "B", text: "to provide better lightning." },
                                { letter: "C", text: "to prevent heart diseases." },
                                { letter: "D", text: "to stimulate human growth hormones." }
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
                        { id: 25, text: "If people are kept from sleeping for two weeks, they will most likely die." },
                        { id: 26, text: "Experts claim that working, entertaining and other factors are causing less and less time to sleep these days." },
                        { id: 27, text: "At the beginning of the century, people went to sleep and awakened more earlier than nowadays." },
                        { id: 28, text: "The bad fact is that people want to sleep less themselves." },
                        { id: 29, text: "Some companies such has NASA are planning to use shiftwork light systems in the future." }
                    ]
                }
            ],
            answers: {
                21: ["B", "complex measures that ensure healthy sleep."],
                22: ["C", "bosses are against this."],
                23: ["B", "consult doctors when needed."],
                24: ["A", "to help people feel alert at night."],
                25: ["False"],
                26: ["True"],
                27: ["No Information"],
                28: ["True"],
                29: ["False"]
            }
        },

        // ===== PART 5: Reading Comprehension - Clothkits =====
        {
            partNumber: 5,
            title: "Part 5",
            type: "reading-comprehension",
            questionRange: "30-35",
            instruction: "Read the following text for questions 30-35.",
            passage: {
                title: "A home-sewing revival: the return of Clothkits",
                content: `<p>In the 1970s, Clothkits revolutionised home sewing. Later, a woman from Sussex, England, revived the nostalgic brand and brought it up to date.</p><p>\u2018I can\u2019t remember many of the clothes I wore before I was six, but I have a vivid memory of a certain skirt whose patterns I can still trace in my mind. It was wraparound, with a belt that threaded through itself, decorated with cats in two shades of green. I wore it with a knitted red jersey my mum bought in a jumble sale, and brown sandals with flowers cut into the toes. It was 1979, and I was not yet five. I forgot about that skirt for a long time, but when a girlfriend mentioned the name Clothkits while we were chatting, it was as if a door suddenly opened on a moment in the past that resonated with vivid significance for me.\u2019 The brand, founded in 1968, had by the late 1980s mostly vanished from people\u2019s lives, but by a combination of determination and luck Kay Mawer brought it back.</p><p>Clothkits was created by the designer Anne Kennedy, who came up with the ingenious idea of printing a pattern straight on to coloured fabric so that a paper pattern was not needed. It was accompanied by instructions that almost anyone could follow on how to cut the pieces out and sew them together. \u2018I was rebelling against the formulaic lines of textile design at that time,\u2019 Kennedy says. \u2018My interest was in folk art and clothes that were simple to make as I had lots of unfinished sewing disasters in my cupboard.\u2019</p><p>Clothkits has always embodied the spirit of the late 1960s and 1970s. Its initial design was a dress in a geometric stripe in orange, pink, turquoise and purple. It cost 25 shillings (\u00a31.25), and after it was featured in the Observer newspaper, Kennedy received more than \u00a32,000 worth of orders. She ran the company from Lewes in Sussex, where at its peak it employed more than 400 people, selling to 44 countries worldwide. Sew-your-own kits formed the core of the business, supplemented by knitwear. Kennedy\u2019s children demonstrated the patterns by wearing them in photographs.</p><p>Kennedy sold the company in the late 1980s. There had been a few administrative problems with postal strikes and a new computer system, which back then took up an entire room, \u2018but the times were changing as well,\u2019 she says. \u2018More women were going out to work and sewing less for their children.\u2019 She sold the company to one of her suppliers, who then sold it on to Freeman\u2019s, which ran Clothkits alongside its own brand for a while, using Kennedy\u2019s impressive database, but its ethos are big, corporate company did not sit well alongside the alternative and artistic of Clothkits. In 1991, Clothkits was made dormant, and there the story may have ended, were it not for Mawer\u2019s fascination with discovering what happened Clothkits.</p><p>Mawer\u2019s mother bought her a sewing machine when she was ten and taught her basic pattern-cutting and garment construction, encouraging her to experiment with colour and design by trial and error. The first garment Mawer made was a pair of trousers, which she made by tracing around an existing pair of trousers. In her late twenties, she spent five years working on digital and sculptural installations. \u2018It was an amazing, mind-expanding experience, but I knew it was unlikely I could make a living as a practising artist. I was definitely looking for a way that I could work in a creative industry with a commercial edge.\u2019 The experience inspired Mawer to return to education, studying for a degree in fine art at the University of Chichester. Her passion for vintage fabric, which her mother had encouraged her to start collecting, led her back to Clothkits, and from there to a journey into the heart of Freeman\u2019s. Negotiations with the company took 18 months, but in October 2007 Clothkits was hers.</p><p>The ethos of Clothkits remains the same, and Mawer is proud that her fabric is printed either in London or the north of England, and that packaging is kept to an absolute minimum. \u2018I wanted to feel that everyone involved in the brand, from design to production, was part of a process I could witness. I couldn\u2019t see the point of manufacturing on the other side of the world, as that\u2019s not what Clothkits has ever been about.\u2019 The revival of Clothkits has also, of course, coincided with a growing sense of dissatisfaction at our disposable society, and the resulting resurgence of interest in skills such as sewing and knitting. \u2018Making your own clothes gives you a greater appreciation of the craftsmanship in the construction of a garment,\u2019 Mawer says. \u2018When you know the process involved in making a skirt, you treasure it in a way you wouldn\u2019t if you\u2019d bought it from a mass-producing manufacturer.\u2019</p>`
            },
            questionSections: [
                {
                    type: "gap-fill",
                    title: "Questions 30-33: Gap Filling Section",
                    instruction: "For questions 30-33, fill in the missing information in the numbered spaces. Write no more than ONE WORD and/or A NUMBER for each question.",
                    summaryText: `<p><strong>The early days of Clothkits</strong></p><p>Clothkits was started by a designer named Anne Kennedy. Her clothing company specialised in selling <span class="gap-input" data-gap="30">_____(30)_____</span> with a pattern printed on it. This came with instructions which meant that buyers were able to make their own garments.</p><p>The very first garment Anne Kennedy made was a multi-coloured striped dress with a <span class="gap-input" data-gap="31">_____(31)_____</span> pattern. A <span class="gap-input" data-gap="32">_____(32)_____</span> article led to many orders for this from around the world. As the company grew, she increased her workforce, and also sold <span class="gap-input" data-gap="33">_____(33)_____</span> as part of her business. She exhibited her designs using her children as models.</p>`,
                    questions: [
                        { id: 30, hint: "specialised in selling ____" },
                        { id: 31, hint: "a ____ pattern" },
                        { id: 32, hint: "A ____ article" },
                        { id: 33, hint: "also sold ____" }
                    ]
                },
                {
                    type: "mcq",
                    title: "Questions 34-35: Multiple Choice",
                    instruction: "For questions 34-35, choose the correct answer A, B, C, or D.",
                    questions: [
                        {
                            id: 34,
                            text: "What does the reader learn about Clothkits in the 1960s and 1970s?",
                            options: [
                                { letter: "A", text: "Its designs represented the attitudes of the time." },
                                { letter: "B", text: "Its products were only affordable for the wealthy." },
                                { letter: "C", text: "Its creator tried many times to launch her company." },
                                { letter: "D", text: "Its management was spread across numerous countries." }
                            ]
                        },
                        {
                            id: 35,
                            text: "Why did Clothkits close in 1991?",
                            options: [
                                { letter: "A", text: "There were unexpected staffing problems." },
                                { letter: "B", text: "The funding for sewing activities was inadequate." },
                                { letter: "C", text: "Freeman\u2019s was an unsuitable partner." },
                                { letter: "D", text: "Records on Kennedy\u2019s database were lost." }
                            ]
                        }
                    ]
                }
            ],
            answers: {
                30: ["fabric"],
                31: ["geometric"],
                32: ["newspaper"],
                33: ["knitwear"],
                34: ["A", "Its designs represented the attitudes of the time."],
                35: ["C", "Freeman\u2019s was an unsuitable partner."]
            }
        }
    ]
};
