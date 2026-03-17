// CEFR Reading Test 14
// 5 Parts, 35 Questions - B1-B2-C1 Level

window.CEFR_READING_TEST = {
    testInfo: {
        title: "CEFR B1-B2-C1 Reading Test 14",
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
                title: "The World\u2019s First Trillionaire",
                content: `<p>A famous song and a quiz show ask, "Who wants to be a millionaire?" For decades, having a million dollars was the goal of the super-rich. Now, the goal is a billion dollars. The anti-poverty charity Oxfam has just issued a report that says in the next ten years, the world will have its first trillionaire. A <span class="gap" data-gap="1">_____(1)_____</span> is a huge number and an unbelievable amount of money. It is a one, followed by 12 zeros. A trillion is equal to one million million. The charity said the wealth gap between the <span class="gap" data-gap="2">_____(2)_____</span> and poor is growing. It said the gap has been "supercharged" since the coronavirus pandemic. It added: "We will have a trillionaire within a decade, whereas to fight poverty, we need more than 200 <span class="gap" data-gap="3">_____(3)_____</span>."</p><p>Oxfam spoke about inequality at the World Economic Forum's annual meeting. As an example, it said the <span class="gap" data-gap="4">_____(4)_____</span>'s five richest people have seen their wealth increase by 114 per cent since 2020. A charity spokesperson said: "The top five billionaires have doubled their <span class="gap" data-gap="5">_____(5)_____</span>. On the other hand, almost five billion <span class="gap" data-gap="6">_____(6)_____</span> have become poorer." Tesla CEO Elon Musk is the richest man on the planet. He has a personal fortune of just under $250 billion. The AP news agency said: "If someone does reach that trillion-dollar milestone, he or she would have the same value as oil-rich Saudi Arabia." Oxfam said the world is now at the start of a "decade of division". It called for a "new era of public action" to reduce the wealth gap.</p>`
            },
            questions: [
                { id: 1, hint: "A _____ is a huge number" },
                { id: 2, hint: "gap between the _____ and poor" },
                { id: 3, hint: "more than 200 _____" },
                { id: 4, hint: "the _____'s five richest" },
                { id: 5, hint: "doubled their _____" },
                { id: 6, hint: "five billion _____ have become poorer" }
            ],
            answers: {
                1: ["trillion"],
                2: ["rich"],
                3: ["years"],
                4: ["world"],
                5: ["wealth"],
                6: ["people"]
            }
        },

        // ===== PART 2: Matching - Properties =====
        {
            partNumber: 2,
            title: "Part 2",
            type: "matching",
            questionRange: "7-14",
            instruction: "Read the texts 7-14 and the statements A-J. Decide which text matches with the situation described in the statements. Each statement can be used ONCE only. There are TWO extra statements which you do not need to use.",
            statementsFirst: true,
            statements: [
                { letter: "A", text: "This property is close to the study place." },
                { letter: "B", text: "There have the best transport options." },
                { letter: "C", text: "Retired person can live there." },
                { letter: "D", text: "This property may not be suitable for people who prefer silence." },
                { letter: "E", text: "The property has the biggest garage." },
                { letter: "F", text: "You may need to get a private car if you choose this house." },
                { letter: "G", text: "The cottage is near to the local town so you can walk there." },
                { letter: "H", text: "The property is suitable for single and hard-working individuals." },
                { letter: "I", text: "You can\u2019t stay there for more than twelve months." },
                { letter: "J", text: "Bedrooms is cut out for a family with at least two children." }
            ],
            texts: [
                { number: 7, title: "Rowan Avenue", content: "One room available in a family home. We welcome international students looking for accommodation. You will have your own room, but you should be prepared to live as part of the family. We have two young children and a dog so it can get a little noisy at times! All meals provided." },
                { number: 8, title: "Brooklyn Road", content: "This first-floor flat is in a great location. Excellent road and rail links with the station just a short five-minute walk away. This is a luxury property with new carpets and furniture in all rooms and so is not suitable for pet owners." },
                { number: 9, title: "Ash Lane", content: "A modern three-bedroom family home with a large garden. The property has its own garage. Situated in the heart of the countryside, there are excellent public transport links and a grocers and post office in the nearby village." },
                { number: 10, title: "College Street", content: "No bills to pay! Three spare bedrooms in this shared six-bedroom all-girl house. A regular bus and train service into the city centre and a short walk to the university. Share a very modern kitchen and living room. Hurry as rooms are going quickly!" },
                { number: 11, title: "Birch Hill", content: "This ground floor, one-bedroom flat is perfect for the older person. The lounge opens onto a garden area shared by other residents. Limited parking but good transport links. Local shops nearby. Pets are welcome." },
                { number: 12, title: "The Crescent", content: "An opportunity to share a beautiful city-centre apartment situated in the centre of the business area. Looking for a professional person to share this two-bedroom property. Rent includes all bills. One-year minimum stay. No pets." },
                { number: 13, title: "Baker Close", content: "A second floor, one-bedroom flat perfect for a professional person. Situated close to the train station and local shops, great nightlife with clubs and restaurants just a short walk away. The property has parking at the back of the building. No pets allowed." },
                { number: 14, title: "Meadow View Road", content: "Cosy one-bedroom cottage in the countryside with garage attached. Ideal for someone who wants to get away from the busy city. A car is necessary as there are no transport links into the local town. The local area is very popular with walkers and those wanting to enjoy nature. Pets welcome." }
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
                7: ["D"],
                8: ["B"],
                9: ["J"],
                10: ["A"],
                11: ["C"],
                12: ["I"],
                13: ["H"],
                14: ["F"]
            },
            extraStatements: ["E", "G"]
        },

        // ===== PART 3: Matching Headings - Plastic Is No Longer Fantastic =====
        {
            partNumber: 3,
            title: "Part 3",
            type: "matching-headings",
            questionRange: "15-20",
            instruction: "Read the text and choose the correct heading for each paragraph from the list of headings below. There are more headings than paragraphs, so you will not use all of them. You cannot use any heading more than once.",
            headings: [
                { letter: "A", text: "A time when opportunities were limited" },
                { letter: "B", text: "The reasons why Ferrando\u2019s product is needed" },
                { letter: "C", text: "A no-risk solution" },
                { letter: "D", text: "Two inventions and some physical details" },
                { letter: "E", text: "The contrasting views of different generations" },
                { letter: "F", text: "A disturbing experience" },
                { letter: "G", text: "The problems with replacing a consumer item" },
                { letter: "H", text: "Looking back at why water was bottled" }
            ],
            passage: {
                title: "PLASTIC IS NO LONGER FANTASTIC",
                paragraphs: [
                    { number: "I", questionId: 15, content: "In 2017, Carlos Ferrando, a Spanish engineer-turned-entrepreneur, saw a piece of art in a museum that profoundly affected him. \u2018What Lies Under\u2019, a photographic composition by Indonesian digital artist Ferdi Rizkiyanto, shows a child crouching by the edge of the ocean and \u2018lifting up\u2019 a wave, to reveal a cluster of assorted plastic waste, from polyethylene bags to water bottles. The artwork, designed to raise public awareness, left Ferrando angry \u2013 and fuelled with entrepreneurial ideas." },
                    { number: "II", questionId: 16, content: "Ferrando runs a Spanish-based design company, Closca, that produces an ingenious foldable bicycle helmet. But he has now also designed a stylish glass water bottle with a stretchy silicone strap and magnetic closure mechanism that means it can be attached to almost anything, from a bike to a bag to a pushchair handle. The product comes with an app that tells people where they can fill their bottles with water for free." },
                    { number: "III", questionId: 17, content: "The intention is to persuade people to stop buying water in plastic bottles, thus saving consumers money and reducing the plastic waste piling up in our oceans. \u2018Bottled water is now a $100 billion business, and 81 per cent of the bottles are not recycled. It\u2019s a complete waste \u2013 water is only 1.5 per cent of the price of the bottle!\u2019 Ferrando cries. Indeed, environmentalists estimate that by 2050 there will be more plastic in our oceans than fish and that\u2019s mainly down to such bottles. \u2018We are trying to create a sense that being environmentally sophisticated is a status symbol,\u2019 he adds. \u2018We want people to clip their bottles onto what they are wearing, to show that they are recycling \u2013 and to look cool.\u2019" },
                    { number: "IV", questionId: 18, content: "Ferrando\u2019s story is fascinating because it seems like an indicator of something unexpected. Three decades ago, conspicuous consumption \u2013 the purchase of luxuries, such as handbags, shoes, cars, etc. on a lavish scale \u2013 heightened people\u2019s social status. Indeed, the closing decades of the 20th century were a time when it seemed that anything could be turned into a commodity. Hence the fact that water became a consumer item, sold in plastic bottles, instead of just emerging, for free, from a tap." },
                    { number: "V", questionId: 19, content: "Today, though, conspicuous extravagance no longer seems desirable among consumers. Now, recycling is fashionable \u2013 as is cycling rather than driving. Plastic water bottles have become so common that they do not command status; instead, what many millennials \u2013 young people born in the late 20th century \u2013 prefer to post on social media are \u2018real\u2019 (refillable) bottles or even the once widespread Thermos bottles. Some teenagers currently think that these stainless-steel vacuum-insulated water bottles that are coming back onto the market are ultra \u2018cool\u2019; never mind the fact that they feel oddly out-of-date to anyone over the age of 40 or that teenagers in the 1970s would have avoided ever being seen with one." },
                    { number: "VI", questionId: 20, content: "It is uncertain whether Clesca will succeed in its goal. Although its foldable bike helmet is available in some outlets in New York, including the Museum of Modern Art, it can be very hard for any design entrepreneur to really take off in the global mass market, though not as hard as it might have been in the past. If an entrepreneur had wanted to fund a smart invention a few decades ago, he or she would have had to either raise a bank loan, borrow money from a family member or use a credit card. Things have moved on slightly since then." }
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
                16: ["D"],
                17: ["B"],
                18: ["H"],
                19: ["E"],
                20: ["A"]
            },
            extraHeadings: ["C", "G"]
        },

        // ===== PART 4: Reading Comprehension - The Power of Nothing =====
        {
            partNumber: 4,
            title: "Part 4",
            type: "reading-comprehension",
            questionRange: "21-29",
            instruction: "Read the following text for questions 21-29.",
            passage: {
                title: "The Power of Nothing",
                content: `<p><em>Geoff Watts, New Scientist (May 26th, 2001)</em></p><p>Placebos are treatments that have no direct effect on the body, yet still, work because the patient has faith in their power to heal. Most often the term refers to a dummy pill, but it applies just as much to any device or procedure, from a sticking plaster to a crystal to an operation. The existence of the placebo effect implies that even quackery may confer real benefits, which is why any mention of placebo is a touchy subject for many practitioners of complementary and alternative medicine, who are likely to regard it as tantamount to a charge of charlatanism. In fact, the placebo effect is a powerful part of all medical care, orthodox or otherwise, though its role is often neglected or misunderstood.</p><p>One of the great strengths of CAM may be its practitioners\u2019 skill in deploying the placebo effect to accomplish real healing. \u201cComplementary practitioners are miles better at producing non-specific effects and good therapeutic relationships,\u201d says Edzard Ernst, professor of CAM at Exeter University. The question is whether CAM could be integrated into conventional medicines, as some would like, without losing much of this power.</p><p>At one level, it should come as no surprise that our state of mind can influence our physiology: anger opens the superficial blood vessels of the face; sadness pumps the tear glands. But exactly how placebos work their medical magic is still largely unknown. Most of the scant research done so far has focused on the control of pain because it\u2019s one of the commonest complaints and lends itself to experimental study. Here, attention has turned to the endorphins, morphine-like neurochemicals known to help control pain.</p><p>But exactly how placebos work their medical magic is still largely unknown. Most of the scant research to date has focused on the control of pain because it\u2019s one of the commonest complaints and lends itself to experimental study. Here, attention has turned to the endorphins, natural counterparts of morphine that are known to help control pain. \u201cAny of the neurochemicals involved in transmitting pain impulses or modulating them might also be involved in generating the placebo response,\u201d says Don Price, an oral surgeon at the University of Florida who studies the placebo effect in dental pain.</p><p>\u201cBut endorphins are still out in front.\u201d That case has been strengthened by the recent work of Fabrizio Benedetti of the University of Turin, who showed that the placebo effect can be abolished by a drug, naloxone, which blocks the effects of endorphins. Benedetti induced pain in human volunteers by inflating a blood-pressure cuff on the forearm. He did this several times a day for several days, using morphine each time to control the pain. On the final day, without saying anything, he replaced the morphine with a saline solution. This still relieved the subjects\u2019 pain: a placebo effect. But when he added naloxone to the saline the pain relief disappeared. Here was direct proof that placebo analgesia is mediated, at least in part, by these natural opiates.</p><p>Still, no one knows how belief triggers endorphin release, or why most people can\u2019t achieve placebo pain relief simply by willing it. Though scientists don\u2019t know exactly how placebos work, they have accumulated a fair bit of knowledge about how to trigger the effect. A London rheumatologist found, for example, that red dummy capsules made more effective painkillers than blue, green or yellow ones. Research on American students revealed that blue pills make better sedatives than pink, a colour more suitable for stimulants. Even branding can make a difference: if Aspro or Tylenol is what you like to take for a headache, their chemically identical generic equivalents may be less effective.</p><p>It matters, too, how the treatment is delivered. Decades ago, when the major tranquilliser chlorpromazine was being introduced, a doctor in Kansas categorised his colleagues according to whether they were keen on it, openly skeptical of its benefits, or took a \u201clet\u2019s try and see\u201d attitude. His conclusion: the more enthusiastic the doctor, the better the drug performed. And this year Ernst surveyed published studies that compared doctors\u2019 bedside manners. The studies turned up one consistent finding: \u201cPhysicians who adopt a warm, friendly and reassuring manner,\u201d he reported, \u201care more effective than those whose consultations are formal and do not offer reassurance.\u201d</p>`
            },
            questionSections: [
                {
                    type: "mcq",
                    title: "Questions 21-24: Multiple Choice",
                    instruction: "For questions 21-24, choose the correct answer A, B, C, or D.",
                    questions: [
                        {
                            id: 21,
                            text: "Placebos work because \u2026",
                            options: [
                                { letter: "A", text: "it has an effect on the body" },
                                { letter: "B", text: "it grows patient's faith" },
                                { letter: "C", text: "it enhances the power to heal" },
                                { letter: "D", text: "people believe on their effect" }
                            ]
                        },
                        {
                            id: 22,
                            text: "According to the passage, what have most studies on placebos focused on?",
                            options: [
                                { letter: "A", text: "The role of endorphins in pain control" },
                                { letter: "B", text: "The effectiveness of placebos in treating various diseases" },
                                { letter: "C", text: "The psychological mechanisms behind the placebo effect" },
                                { letter: "D", text: "The potential integration of placebos into conventional medicine" }
                            ]
                        },
                        {
                            id: 23,
                            text: "The placebo effect, despite it's neglected status \u2026",
                            options: [
                                { letter: "A", text: "doesn\u2019t work" },
                                { letter: "B", text: "is very scientific in nature" },
                                { letter: "C", text: "is a big part of medical care" },
                                { letter: "D", text: "has too much power" }
                            ]
                        },
                        {
                            id: 24,
                            text: "Endorphins \u2026",
                            options: [
                                { letter: "A", text: "can help to overcome pain" },
                                { letter: "B", text: "makes blood vessels superficial" },
                                { letter: "C", text: "is a chemical hazard" },
                                { letter: "D", text: "is very distinct from morphine" }
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
                        { id: 25, text: "The placebo effect only works for controlling pain." },
                        { id: 26, text: "Endorphins are believed to play a role in the placebo effect." },
                        { id: 27, text: "Naloxone, a drug that blocks endorphins, can eliminate the placebo effect for pain relief." },
                        { id: 28, text: "Scientists fully understand how placebos trigger the release of endorphins." },
                        { id: 29, text: "The color, branding, and delivery of placebo treatments can influence their effectiveness." }
                    ]
                }
            ],
            answers: {
                21: ["D", "people believe on their effect"],
                22: ["A", "The role of endorphins in pain control"],
                23: ["C", "is a big part of medical care"],
                24: ["A", "can help to overcome pain"],
                25: ["False"],
                26: ["True"],
                27: ["True"],
                28: ["No Information"],
                29: ["True"]
            }
        },

        // ===== PART 5: Reading Comprehension - Dirty River But Clean Water =====
        {
            partNumber: 5,
            title: "Part 5",
            type: "reading-comprehension",
            questionRange: "30-35",
            instruction: "Read the following text for questions 30-35.",
            passage: {
                title: "DIRTY RIVER BUT CLEAN WATER",
                content: `<p>Floods can occur in rivers when the flow rate exceeds the capacity of the river channel, particularly at bends or meanders in the waterway. Floods often cause damage to homes and businesses if they are in the natural flood plains of rivers. While riverine flood damage can be eliminated by moving away from rivers and other bodies of water, people have traditionally lived and worked by rivers because the land is usually flat and fertile and because rivers provide easy travel and access to commerce and industry.</p><p>FIRE and flood are two of humanity\u2019s worst nightmares. People have, therefore, always sought to control them. Forest fires are snuffed out quickly. The flow of rivers is regulated by weirs and dams. At least, that is how it used to be. But foresters have learned that forests need fires to clear out the brush and even to get seeds to germinate. And a similar revelation is now dawning on hydrologists. Rivers \u2013 and the ecosystems they support \u2013 need floods. That is why a man-made torrent has been surging down the Grand Canyon. By Thursday, March 6th it was running at full throttle, which was expected to be sustained for 60 hours.</p><p>Floods once raged through the canyon every year. Spring Snow from as far away as Wyoming would melt and swell the Colorado river to a flow that averaged around 1,500 cubic metres (50,000 cubic feet) a second. Every eight years or so, that figure rose to almost 3,000 cubic metres. These floods infused the river with sediment, carved its beaches and built its sandbars.</p><p>However, in the four decades since the building of the Glen Canyon dam, just upstream of the Grand Canyon, the only sediment that it has collected has come from tiny, undammed tributaries. Even that has not been much use as those tributaries are not powerful enough to distribute the sediment in an ecologically valuable way.</p><p>This lack of flooding has harmed local wildlife. The humpback chub, for example, thrived in the rust-red waters of Colorado. Recently, though, its population has crashed. At first sight, it looked as if the reason was that the chub were being eaten by trout introduced for sport fishing in the mid-20th century. But trout and chub co-existed until the Glen Canyon dam was built, so something else is going on. Steve Gloss, of the United States Geological Survey (USGS), reckons that the chub\u2019s decline is the result of their losing their most valuable natural defense, Colorado\u2019s rusty sediment. The chub were well adapted to the poor visibility created by the chick, red water which gave the river its name and depended on it to hide from predators. Without the cloudy water, the chub became vulnerable.</p><p>And the chub are not alone. In the years since the Glen Canyon dam was built, several species have vanished altogether. These include the Colorado pike-minnow, the razorback sucker and the roundtail chub. Meanwhile, aliens including fathead minnows, channel catfish and common carp, which would have been hard, put to survive in the savage waters of the undammed canyon, have moved in.</p><p>So flooding is the obvious answer. Unfortunately, it is easier said than done. Floods were sent down the Grand Canyon in 1996 and 2004 and the results were mixed. In 1996 the flood was allowed to go on too long. To start with, all seemed well. The floodwaters built up sandbanks and infused the river with sediment. Eventually, however, the continued flow washed most of the sediment out of the canyon. This problem was avoided in 2004, but unfortunately, on that occasion, the volume of sand available behind the dam was too low to rebuild the sandbanks. This time, the USGS is convinced that things will be better. The amount of sediment available is three times greater than it was in 2004. So if a flood is going to do some good, this is the time to unleash one.</p><p>Even so, it may turn out to be an empty gesture. At less than 1,200 cubic metres a second, this flood is smaller than even an average spring flood, let alone one of the mightier deluges of the past. Those glorious inundations moved massive quantities of sediment through the Grand Canyon, wiping the slate dirty, and making a muddy mess of silt and muck that would make modern river rafters cringe.</p>`
            },
            questionSections: [
                {
                    type: "gap-fill",
                    title: "Questions 30-33: Gap Filling Section",
                    instruction: "For questions 30-33, fill in the missing information in the numbered spaces. Write no more than ONE WORD and/or A NUMBER for each question.",
                    summaryText: `<p><strong>The eco-impact of the Canyon Dam</strong></p><p>Floods are people\u2019s nightmare. In the past, the canyon was raged by flood every year. The snow from far Wyoming would melt in the season of <span class="gap-input" data-gap="30">_____(30)_____</span> and caused a flood flow peak in Colorado river. In the four decades after people built the Glen Canyon Dam, it only could gather <span class="gap-input" data-gap="31">_____(31)_____</span> together from tiny, undammed tributaries. humpback chub population reduced, why?</p><p>The non-stopped flow led to the washing away of the sediment out of the canyon, which poses a great threat to the chubs because it has poor <span class="gap-input" data-gap="32">_____(32)_____</span> away from predators. In addition, the volume of <span class="gap-input" data-gap="33">_____(33)_____</span> available behind the dam was too low to rebuild the bars and flooding became more serious.</p>`,
                    questions: [
                        { id: 30, hint: "season of _____" },
                        { id: 31, hint: "gather _____ together" },
                        { id: 32, hint: "poor _____ away from predators" },
                        { id: 33, hint: "volume of _____" }
                    ]
                },
                {
                    type: "mcq",
                    title: "Questions 34-35: Multiple Choice",
                    instruction: "For questions 34-35, choose the correct answer A, B, C, or D.",
                    questions: [
                        {
                            id: 34,
                            text: "Which of the following statements agree with the information given in the passage?",
                            options: [
                                { letter: "A", text: "The flood peaks at almost 1500 cubic meters every eight years." },
                                { letter: "B", text: "Contribution of sediments delivered by tributaries has little impact." },
                                { letter: "C", text: "The decreasing number of chubs is always caused by introducing of trout since the mid 20th century." },
                                { letter: "D", text: "It seemed that the artificial flood in 1996 had achieved success partly at the very beginning." }
                            ]
                        },
                        {
                            id: 35,
                            text: "According to the passage, which of these species aren\u2019t native to the Colorado river?",
                            options: [
                                { letter: "A", text: "the humpback chub" },
                                { letter: "B", text: "the common carp" },
                                { letter: "C", text: "the roundtail chub" },
                                { letter: "D", text: "the razorback sucker" }
                            ]
                        }
                    ]
                }
            ],
            answers: {
                30: ["spring"],
                31: ["sediment"],
                32: ["visibility"],
                33: ["sand"],
                34: ["D", "It seemed that the artificial flood in 1996 had achieved success partly at the very beginning."],
                35: ["B", "the common carp"]
            }
        }
    ]
};
