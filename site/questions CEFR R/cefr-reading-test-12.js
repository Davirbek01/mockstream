// CEFR Reading Test 12
// 5 Parts, 35 Questions - B1-B2-C1 Level

window.CEFR_READING_TEST = {
    testInfo: {
        title: "CEFR B1-B2-C1 Reading Test 12",
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
                title: "University Exam Petition",
                content: `<p>Final-year students at a university in England are angry after they took an economics exam. Students from the University of Sheffield have signed a petition to say the (1)<span class="gap" data-gap="1">_____(1)_____</span> questions were \u2018impossible\u2019 to answer. Nearly all of the 100 students who took the exam complained and signed the online petition. They want the university to look into this. The (2)<span class="gap" data-gap="2">_____(2)_____</span> say the exam contained questions on topics that were not in their course. They also say the (3)<span class="gap" data-gap="3">_____(3)_____</span> included a lot of difficult maths that they had not been taught. One student said a lecturer told them they would only need \u2018simple\u2019 (4)<span class="gap" data-gap="4">_____(4)_____</span>. They are now worried that they will get low test scores, and that this will affect what kind of degree they get.</p><p>The head of the economics department, professor Andy Dickerson, told the BBC that the exam was fair. He said not all the questions needed maths. He said the level of maths in the exams was the same as the level taught to students on the course. Professor Dickerson also (5)<span class="gap" data-gap="5">_____(5)_____</span> all the exam questions were on topics the students had studied. He said: \u201cAll questions were based on topics taught in the (6)<span class="gap" data-gap="6">_____(6)_____</span> and for which further reading was provided.\u201d He added that one question in the exam used a term that students may not have seen before. He said this was no problem because the question explained the meaning of the term. The university said it would look carefully at the results.</p>`
            },
            questions: [
                { id: 1, hint: "the _____ questions" },
                { id: 2, hint: "The _____ say" },
                { id: 3, hint: "the _____ included" },
                { id: 4, hint: "need 'simple' _____" },
                { id: 5, hint: "Dickerson also _____" },
                { id: 6, hint: "taught in the _____" }
            ],
            answers: {
                1: ["exam"],
                2: ["students"],
                3: ["questions"],
                4: ["maths"],
                5: ["said"],
                6: ["course"]
            }
        },

        // ===== PART 2: Matching - Travel Tours =====
        {
            partNumber: 2,
            title: "Part 2",
            type: "matching",
            questionRange: "7-14",
            instruction: "Read the texts 7-14 and the statements A-J. Decide which text matches with the situation described in the statements. Each statement can be used ONCE only. There are TWO extra statements which you do not need to use.",
            statementsFirst: true,
            statements: [
                { letter: "A", text: "You and your partner want to go somewhere to experience nature in its true form." },
                { letter: "B", text: "You want to escape to an island for a week." },
                { letter: "C", text: "This tour is fully virtual." },
                { letter: "D", text: "You can learn a lot about ancient history there." },
                { letter: "E", text: "You feel like you haven\u2019t visited a romantic city." },
                { letter: "F", text: "You want to conquer a peak in your adventurous journey." },
                { letter: "G", text: "You want to experience everything: historical places, mountains, local dishes and a cool relaxation in your journey." },
                { letter: "H", text: "This 5-day island escapade tour has boat trip in the evening." },
                { letter: "I", text: "You want to stay in Paris for a week." },
                { letter: "J", text: "You can seek a natural beauty in this city tour." }
            ],
            texts: [
                { number: 7, title: "Global Wanderers", content: "\"Discover Paris, the city of love, for only $999! Includes a 5-day guided tour, accommodation, and airport transfers. Stroll through the Eiffel Tower, Louvre, and charming cafes. Book now at globalwanderers.com or call +1 555 789 1234.\"" },
                { number: 8, title: "Mystic Adventures Travel", content: "\"Explore the wonders of Machu Picchu for $1,499. Package includes a 7-day guided trek, meals, and a night in Cusco. Experience Peru\u2019s ancient mysticism. Call us today at +51 987 654 321 or visit mysticadventures.com.\"" },
                { number: 9, title: "Sunrise Safari Tours", content: "\"Embark on an African safari adventure for $2,799. Witness the Big Five in Kenya\u2019s Masai Mara Reserve. 10-day package includes accommodation, game drives, and meals. Email us at safaris@sunrise.com for details.\"" },
                { number: 10, title: "Island Bliss Getaways", content: "\"7 nights in the Maldives starting at $2,499 per person. Luxurious overwater villas, daily breakfast, and snorkeling tours included. Escape to paradise. Call +960 123 4567 or visit islandblissgetaways.com.\"" },
                { number: 11, title: "Northern Lights Expeditions", content: "\"Chase the Aurora Borealis in Iceland for $1,199. 4-day tour includes Reykjavik stays, guided northern lights hunts, and a Blue Lagoon visit. Reserve your spot at northernlightsxp.com or dial +354 456 7890.\"" },
                { number: 12, title: "Historic Horizons", content: "\"Immerse yourself in Rome\u2019s ancient beauty for just $1,099. Package includes 5 days of guided tours, Colosseum tickets, and accommodations near the Vatican. Contact us at explore@historichorizons.com.\"" },
                { number: 13, title: "Tropical Trails Agency", content: "\"5 nights in Bali for only $1,299. Package includes resort stays, guided temple tours, and a sunset cruise. Your tropical adventure awaits! Visit tropicaltrails.com or call +62 123 987 654.\"" },
                { number: 14, title: "Summit Seekers", content: "\"Conquer Mount Everest Base Camp for $2,999. A 12-day guided trek includes meals, porters, and accommodation. Perfect for thrill-seekers. Book now: summitseekers.com or call +977 555 4321.\"" }
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
                7: ["E"],
                8: ["G"],
                9: ["A"],
                10: ["B"],
                11: ["J"],
                12: ["D"],
                13: ["H"],
                14: ["F"]
            },
            extraStatements: ["C", "I"]
        },

        // ===== PART 3: Matching Headings - Locomotives =====
        {
            partNumber: 3,
            title: "Part 3",
            type: "matching-headings",
            questionRange: "15-20",
            instruction: "Read the text and choose the correct heading for each paragraph from the list of headings below. There are more headings than paragraphs, so you will not use all of them. You cannot use any heading more than once.",
            headings: [
                { letter: "A", text: "Art and life" },
                { letter: "B", text: "In a railway museum" },
                { letter: "C", text: "Airplane alternative" },
                { letter: "D", text: "Long and special" },
                { letter: "E", text: "Goods delivery" },
                { letter: "F", text: "User and nature friendly" },
                { letter: "G", text: "From steam to electricity" },
                { letter: "H", text: "Not any more" }
            ],
            passage: {
                title: "LOCOMOTIVES",
                paragraphs: [
                    { number: "I", questionId: 15, content: "The invention of the steam locomotive made a breakthrough in the development of the railway system in the 19th century. Today the technology seems ordinary, but two hundred years ago it was revolutionary. Steam locomotives were fueled by burning coal, wood or oil, to produce steam in a boiler, which drove the engine. Of course, large amounts of water were also needed. In the 20th century, steam engines were gradually replaced with trains fueled by diesel or electricity." },
                    { number: "II", questionId: 16, content: "Some long-distance passenger trains have become famous. For example, the Trans-Siberian Railway in Russia is the longest railway in the world, covering 9,259 kilometers and 10 time zones. In the United States, the California Zephyr travels between Chicago and San Francisco, and during the 3-day trip, passengers can enjoy amazing views of the Rocky Mountains. The Orient Express between Venice and Istanbul offers old-fashioned service that is luxurious, romantic, and expensive." },
                    { number: "III", questionId: 17, content: "Of course, not all trains carry passengers. Many trains are freight trains, transporting goods from one location to another. The busiest freight system in the world is in China. Freight trains are usually much longer than passenger trains. The longest freight train recorded was in Australia with over 682 cars. Freight trains can carry anything \u2014 coal, cars, clothing \u2014 anything that people need. Refrigeration, which keeps food cold and fresh, revolutionized freight transportation." },
                    { number: "IV", questionId: 18, content: "In many countries, overnight trains are a good option to air travel. For example, you might leave one city at 11:00 at night, and arrive at your destination at 7:00 the next morning. Typically, you share a cabin with three other people, who you might be travelling with, or who you might not know at all. Your seats become your beds and the price of your ticket includes your bedding. If you want, you can order tea and a snack from the cabin attendant." },
                    { number: "V", questionId: 19, content: "Authors have been using trains in literature for as long as trains have been running. Indeed, it\u2019s hard to imagine some stories without a train in them. Even people who have never read Anna Karenina know how the famous novel\u2019s heroine dies at the end. Many American children learn the important lessons of optimism and hard-work reading the classic story The Little Engine that Could. And of course almost everyone on the planet knows about Hogwarts Express in the Harry Potter books." },
                    { number: "VI", questionId: 20, content: "Many countries around the world are investing in high-speed trains. Today\u2019s high-speed railways are amazing. They can go twice as fast as regular trains, and they are designed for passenger comfort with spacious chairs, internet access, and multi-media entertainment. High speed rail makes it possible to move many more people much faster over longer distances. High speed rail also can help the environment because it is more energy efficient and reduces cars on the roads." }
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
                15: ["G"],
                16: ["D"],
                17: ["E"],
                18: ["C"],
                19: ["A"],
                20: ["F"]
            },
            extraHeadings: ["B", "H"]
        },

        // ===== PART 4: Reading Comprehension - Deserts =====
        {
            partNumber: 4,
            title: "Part 4",
            type: "reading-comprehension",
            questionRange: "21-29",
            instruction: "Read the following text for questions 21-29.",
            passage: {
                title: "Deserts",
                content: `<p><strong>Deserts</strong> are areas of land where there is almost no rainfall. The land can be rocky or sandy. Most deserts lie in hot zones although some are cold. Also, very hot deserts can be very cold at night. Very little grows in desert lands, although some plants can survive from water beneath the surface.</p><p>The animals which live in the desert have learned how to survive. Reptiles, insects, birds and some mammals live in deserts. <strong>Camels</strong> are mammals which can go for long periods of time without water. Very few people live in deserts. It is difficult to adjust to the hot, dry climate.</p><p>Only a fifth of the world's deserts are sand. <strong>Sand</strong> is made up of very small particles of stone. These particles have worn off rock in time by the wind. The rest of the desert area is stone of some kind, mountains, or various types of dry soil. Stony deserts are called <strong>reg</strong>. Rocky deserts are called <strong>hamada</strong>.</p><p>Not very many people live in desert areas. Some live at <strong>oases</strong>. These are spots in the desert that have a supply of water. The water comes from deep wells under the sand. Small towns can grow up around these oases. The residents keep farm animals and grow dates and olives. <strong>Nomads</strong> are farmers who wander from place to place in the desert. They use camels to travel from one oasis to another. The camels carry all of their possessions.</p><p>Animals which live in the desert usually go out at night when it is cooler. During the day they stay in the shade. The smaller ones dig burrows to stay in during the hot part of the day. The <strong>kangaroo rat</strong> does this as well. Reptiles in the desert can stand more heat than mammals. Their skin is waterproof and it helps them keep their body moisture.</p><p>Desert animals can go without water for a long time. Some, like the kangaroo rat, get water from plants. Desert birds travel to oases to find water. They can also get water from seeds or insects. Some animals can go for long periods of time without food. The scorpion is on one of these.</p><p>Few plants grow in the dry conditions of a desert. Some get their water from deep in the ground with long roots. Some can store water in leaves or stems. <strong>Cactus</strong> plants store a large amount of water. Some plants don\u2019t grow at all when it is dry. When rain appears, they shoot up from the ground. When the land dries up again, the seeds lie dormant. They may sprout after the next rain or it can be many years before this happens.</p><p>Many desert areas are getting bigger. People try to use the land for grazing. They can graze it too often and make the land bare. They chop down the trees and hen rain doesn\u2019t come droughts occur. The wind blows the soil away. There is nothing to hold the soil in place. Mining can add to the creation of desert land. Governments in many countries are trying to save the land. They plant trees and they provide food for animals so they won\u2019t have to graze. They are teaching farmers new ways of farming to help preserve the soil.</p><p>In summary, deserts are regions with little or no rainfall. They can be sandy or rocky. Most deserts lie in hot climate areas, though some can be in cold zones. Nights in hot deserts are may be cold as well. Not many plants can survive in the dryness of the desert. The ones which do often get their water from deep in the ground.</p>`
            },
            questionSections: [
                {
                    type: "mcq",
                    title: "Questions 21-24: Multiple Choice",
                    instruction: "For questions 21-24, choose the correct answer A, B, C, or D.",
                    questions: [
                        {
                            id: 21,
                            text: "Which of the following is an oasis?",
                            options: [
                                { letter: "A", text: "A dry spot in a valley" },
                                { letter: "B", text: "An area in the desert where water comes from the ground" },
                                { letter: "C", text: "A farm on grassy land" },
                                { letter: "D", text: "A small rounded mountain" }
                            ]
                        },
                        {
                            id: 22,
                            text: "Where do desert plants get their water?",
                            options: [
                                { letter: "A", text: "From deep under the ground" },
                                { letter: "B", text: "Occasional rainfall" },
                                { letter: "C", text: "Oases" },
                                { letter: "D", text: "From very small rivers throughout the deserts" }
                            ]
                        },
                        {
                            id: 23,
                            text: "Which of the following tells why desert areas are getting larger?",
                            options: [
                                { letter: "A", text: "Mining strips the land." },
                                { letter: "B", text: "Farmers overgraze the land." },
                                { letter: "C", text: "People chop down the trees." },
                                { letter: "D", text: "All of the above." }
                            ]
                        },
                        {
                            id: 24,
                            text: "Nomads \u2026",
                            options: [
                                { letter: "A", text: "live at oases." },
                                { letter: "B", text: "use camel to gain access to water." },
                                { letter: "C", text: "travel from place to place in the desert." },
                                { letter: "D", text: "often wonders why they live in the desert." }
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
                        { id: 25, text: "Deserts may be hot during the day and cool at night." },
                        { id: 26, text: "Kangaroo rats dig burrows in the heat of the day." },
                        { id: 27, text: "People who live in the desert plans to migrate to mild climates." },
                        { id: 28, text: "Grazing leads to desertification." },
                        { id: 29, text: "Governments aren\u2019t trying to save the land from desertification." }
                    ]
                }
            ],
            answers: {
                21: ["B", "An area in the desert where water comes from the ground"],
                22: ["A", "From deep under the ground"],
                23: ["D", "All of the above."],
                24: ["C", "travel from place to place in the desert."],
                25: ["True"],
                26: ["False"],
                27: ["No Information"],
                28: ["True"],
                29: ["False"]
            }
        },

        // ===== PART 5: Reading Comprehension - The History of Salt =====
        {
            partNumber: 5,
            title: "Part 5",
            type: "reading-comprehension",
            questionRange: "30-35",
            instruction: "Read the following text for questions 30-35.",
            passage: {
                title: "The History of Salt",
                content: `<p>Salt is so simple and plentiful that we almost take it for granted. In chemical terms, salt is the combination \u201cof a sodium ion with a chloride on, making it one of the most basic molecules on earth. It is also one of the most plentiful: it has been estimated that salt deposits under the state of Kansas alone could supply the entire world\u2019s needs for the next 250,000 years.</p><p>But is salt is also an essential element. Without it, life itself would be impossible since the human body requires the mineral in order to function properly. The concentration of sodium ions in the blood is directly related to the regulation of safe body fluid levels. And while we are all familiar with its many uses in cooking, we may not be aware that this element is used in some 14,000 commercial applications. From manufacturing pulp and paper to setting dyes in textiles and fabric, from producing soaps and detergents to making our roads safe in winter, salt plays an essential part in our daily lives.</p><p>Salt has a long and influential role in world history. From the dawn of civilization, it has been a key factor in economic, religious, social and political development. In every corner of the world, it has been the subject of superstition, folklore, and warfare, and has even been used as currency.</p><p>As a precious and portable commodity, salt has long been a cornerstone of economies throughout history. In fact, researcher M.R. Bloch conjectured that civilization began along the edges of the desert because of the natural surface deposits of salt found there. Bloch also believed that the first war \u2013 likely fought near the ancient city of Assault on the Jordan River \u2013 could have been fought over the city\u2019s precious supplies of the mineral.</p><p>In 2200 BC, the Chinese emperor Hsia Yu levied one of the first known taxes. He taxed salt. In Tibet, Marco Polo noted that tiny cakes of salt were pressed with images of the Grand Khan to be used as coins and to this day among the nomads of Ethiopia\u2019s Danakil Plains it is still used as money. Greek slave traders often bartered it for slaves, giving rise to the expression that someone was \u201cnot worth his salt.\u201d Roman legionnaires were paid in salt \u2013 a salarium, the Latin origin of the word \u201csalary.\u201d</p><p>Merchants in 12th-century Timbuktu \u2013 the gateway to the Sahara Desert and the seat of scholars \u2013 valued this mineral as highly as books and gold. In France, Charles of Anjou levied the gabelle, a salt tax, in 1259 to finance his conquest of the Kingdom of Naples. Outrage over the gabelle fueled the French Revolution. Though the revolutionaries eliminated the tax shortly after Louis XVI, the Republic of France re-established the gabelle in the early 19th Century; only in 1946 was it removed from the books.</p><p>The Erie Canal, an engineering marvel that connected the Great Lakes to New York\u2019s Hudson River in 1825, was called \u201cthe ditch that salt built.\u201d Salt tax revenues paid for half the cost of construction of the canal. The British monarchy supported itself with high salt taxes, leading to a bustling black market for the white crystal. In 1785, the earl of Dundonald wrote that every year in England, 10,000 people were arrested for salt smuggling. And protesting against British rule in 1930, Mahatma Gandhi led a 200-mile march to the Arabian Ocean to collect untaxed salt for India\u2019s poor.</p><p>In religion and culture, salt long held an important place with Greek worshippers consecrating it in their rituals. Further, in Buddhist tradition, salt repels evil spirits, which is why it is customary to throw it over your shoulder before entering your house after a funeral: it scares off any evil spirits that may be clinging to your back. Shinto religion also uses it to purify an area. Before sumo wrestlers enter the ring for a match \u2013 which is, in reality, an elaborate Shinto rite \u2013 a handful is thrown into the center to drive off malevolent spirits.</p><p>In the Southwest of the United States, the Pueblo worship the Salt Mother. Other native tribes had significant restrictions on who was permitted to eat salt Hopi legend holds that the angry Warrior Twins punished mankind by placing valuable salt deposits far from civilization, requiring hard work and bravery to harvest the precious mineral. Today, a gift of salt endures in India as a potent symbol of good luck and a reference to Mahatma Gandhi\u2019s liberation of India.</p><p>The effects of salt deficiency are highlighted in times of war, when human bodies and national economies are strained to their limits. Thousands of Napoleon\u2019s troops died during the French retreat from Moscow due to inadequate wound healing and lowered resistance to disease \u2013 the results of salt deficiency.</p>`
            },
            questionSections: [
                {
                    type: "gap-fill",
                    title: "Questions 30-33: Gap Filling Section",
                    instruction: "For questions 30-33, fill in the missing information in the numbered spaces. Write no more than ONE WORD and/or A NUMBER for each question.",
                    summaryText: `<p>Salt is such an essential <span class="gap-input" data-gap="30">_____(30)_____</span> that people would not be able to live without it. As well as its uses in cooking, this basic mineral has thousands of business <span class="gap-input" data-gap="31">_____(31)_____</span> ranging from making paper to the manufacture of soap. Being a prized and portable commodity, it has played a major part in the economies of many countries. As such, salt has not only led to war, but has also been used to raise <span class="gap-input" data-gap="32">_____(32)_____</span> by governments in many parts of the world. There are also many instances of its place in religion and culture, being used as a means to get rid of evil <span class="gap-input" data-gap="33">_____(33)_____</span>.</p>`,
                    questions: [
                        { id: 30, hint: "essential _____" },
                        { id: 31, hint: "business _____" },
                        { id: 32, hint: "raise _____" },
                        { id: 33, hint: "evil _____" }
                    ]
                },
                {
                    type: "mcq",
                    title: "Questions 34-35: Multiple Choice",
                    instruction: "For questions 34-35, choose the correct answer A, B, C, or D.",
                    questions: [
                        {
                            id: 34,
                            text: "Which of these statements is true of salt according to the passage?",
                            options: [
                                { letter: "A", text: "A number of cities take their name from the word salt." },
                                { letter: "B", text: "Salt has been produced in China for less than 2000 years." },
                                { letter: "C", text: "Slaves used salt as a currency." },
                                { letter: "D", text: "There are many commercial applications for salt." }
                            ]
                        },
                        {
                            id: 35,
                            text: "In this passage, the author argues that \u2026",
                            options: [
                                { letter: "A", text: "salt\u2019s importance throughout the history has always been misrepresented." },
                                { letter: "B", text: "salt is no longer used as a form of currency." },
                                { letter: "C", text: "the first war may have been started over salt." },
                                { letter: "D", text: "salt has been regarded as precious and dangerous in the ancient times." }
                            ]
                        }
                    ]
                }
            ],
            answers: {
                30: ["element"],
                31: ["applications"],
                32: ["taxes"],
                33: ["spirits"],
                34: ["D", "There are many commercial applications for salt."],
                35: ["C", "the first war may have been started over salt."]
            }
        }
    ]
};
