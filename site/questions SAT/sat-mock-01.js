// SAT (Digital Adaptive) — Mock 01 [PHASE 2: full 147-question test]
// Format mirrors the official Digital SAT:
//   Reading & Writing: 2 modules × 32 min × 27 Q = 64 min, 54 Q
//     - Each Q has its own 25-150 word passage
//     - 4 content domains (per module ~7 I&I + ~7 C&S + ~7 SEC + ~6 EoI)
//   Math: 2 modules × 35 min × 22 Q = 70 min, 44 Q
//     - 4 content domains (~8 Algebra + ~8 Advanced Math + ~3 PSDA + ~3 G&T)
//     - ~25% SPR (5-6 student-produced response per module)
//   Adaptive routing:
//     - R&W: ≥ 18/27 on M1 → hard M2; otherwise easy M2
//     - Math: ≥ 15/22 on M1 → hard M2; otherwise easy M2
//   10-min break between R&W and Math.
// All content is original AI-authored material (Mock Stream).

window.SAT_TEST = {
  testInfo: {
    id: "sat-01",
    title: "SAT Practice Mock 01",
    rwModuleTime: 32,
    mathModuleTime: 35,
    breakTime: 10,
    rwM1Threshold: 18,
    mathM1Threshold: 15,
    questionsPerModuleRW: 27,
    questionsPerModuleMath: 22
  },

  // ═══════════════════════════════════════════════════════════════════
  //                       READING & WRITING
  // ═══════════════════════════════════════════════════════════════════
  rw: {

    // ───── MODULE 1 — 27 Q, mixed difficulty, same for everyone ─────
    module1: {
      questions: [
        // ───── Information & Ideas (7 Q) ─────
        { id: 1, domain: "Information & Ideas",
          passage: "In a study published last year, biologists found that bumblebees rolled small wooden balls in apparent play. The bees were not rewarded with food and could have ignored the balls entirely; instead, they returned to them repeatedly, with younger bees rolling the balls more often than older ones.",
          stem: "According to the text, what do the researchers consider notable about the bees' behaviour?",
          options: [
            { letter: "A", text: "The bees rolled the balls only after being trained to do so." },
            { letter: "B", text: "The bees engaged in the behaviour despite no food reward." },
            { letter: "C", text: "Older bees showed more interest in the balls than younger bees did." },
            { letter: "D", text: "The behaviour was observed primarily in laboratory settings." }
          ], correct: "B" },

        { id: 2, domain: "Information & Ideas",
          passage: "Researchers studying urban birds have noticed something unusual: many city songbirds now sing at higher pitches than their forest counterparts. The most likely explanation is the constant low-frequency rumble of traffic, which would mask lower-pitched calls.",
          stem: "Which finding, if true, would most directly support the explanation given in the text?",
          options: [
            { letter: "A", text: "Urban birds whose songs are at the same pitch as forest birds tend to have larger territories." },
            { letter: "B", text: "Recordings of urban birds played in forests still attract mates from forest populations." },
            { letter: "C", text: "Birds in quieter parks sing at lower pitches than birds near busy roads." },
            { letter: "D", text: "Forest birds have begun migrating to cities during the past decade." }
          ], correct: "C" },

        { id: 3, domain: "Information & Ideas",
          passage: "The following text is from Kate Chopin's 1899 novel The Awakening. Edna, the protagonist, has just spent the day at the beach. \"A certain light was beginning to dawn dimly within her — the light which, showing the way, forbids it. At that early period it served but to bewilder her.\"",
          stem: "Based on the text, what is happening to Edna?",
          options: [
            { letter: "A", text: "She is recovering from a brief illness." },
            { letter: "B", text: "She is becoming aware of something that is troubling rather than freeing her." },
            { letter: "C", text: "She is preparing to leave on a long journey at sea." },
            { letter: "D", text: "She has decided to confide in a close friend." }
          ], correct: "B" },

        { id: 4, domain: "Information & Ideas",
          passage: "The Andean condor, the largest flying land bird in the western hemisphere, can soar for hours without flapping its wings, riding currents of warm air called thermals. Researchers tracking individual condors have shown that, on a single flight, the birds may flap their wings less than 1% of the total time in the air.",
          stem: "Which choice best describes the function of the second sentence in the text as a whole?",
          options: [
            { letter: "A", text: "It provides a striking quantitative detail that supports the general claim made in the previous sentence." },
            { letter: "B", text: "It questions the reliability of the data introduced earlier in the passage." },
            { letter: "C", text: "It describes a problem that researchers are trying to solve." },
            { letter: "D", text: "It introduces a new species that contrasts with the condor." }
          ], correct: "A" },

        { id: 5, domain: "Information & Ideas",
          passage: "Text 1: A long-running debate in linguistics concerns whether language fundamentally shapes the way we perceive the world. Some linguists argue that speakers of languages without separate words for 'blue' and 'green', for example, perceive these colours less distinctly than English speakers do.\n\nText 2: Recent experiments have weakened this view. When asked to identify a single odd colour among a set of nearly identical shades, speakers of languages that lack a 'blue/green' distinction perform almost as well as English speakers, suggesting that the perceptual difference, if it exists, is small.",
          stem: "Based on the texts, how would the author of Text 2 most likely respond to the linguists in Text 1?",
          options: [
            { letter: "A", text: "By agreeing that language strongly determines perception." },
            { letter: "B", text: "By suggesting that the perceptual gap they describe is much smaller than they have claimed." },
            { letter: "C", text: "By proposing an entirely new explanation for colour categorisation." },
            { letter: "D", text: "By insisting that linguistic categories have no influence on perception at all." }
          ], correct: "B" },

        { id: 6, domain: "Information & Ideas",
          passage: "Marine biologists studying coral reefs in the Pacific have observed that some young corals appear to settle preferentially in places where adult corals of the same species are already established. One hypothesis is that the young corals detect chemical signals from the established colonies and use them to choose suitable sites.",
          stem: "Which finding, if true, would most strongly support the hypothesis described in the text?",
          options: [
            { letter: "A", text: "Young corals settle in roughly equal numbers near established colonies and far from them." },
            { letter: "B", text: "Established coral colonies grow more slowly when young corals settle nearby." },
            { letter: "C", text: "When seawater is filtered to remove dissolved chemicals from established colonies, young corals settle randomly across the area." },
            { letter: "D", text: "Different coral species rarely settle in the same area as one another." }
          ], correct: "C" },

        { id: 7, domain: "Information & Ideas",
          passage: "An archaeologist has unearthed a small bronze figurine at a site in southern Spain. The figurine's style closely resembles statues produced in Phoenician colonies along the Mediterranean coast around 700 BCE, but the metal itself contains traces of tin from sources in central Europe. The archaeologist concludes that long-distance trade networks linking Phoenicia to central Europe were already active by 700 BCE.",
          stem: "Which finding, if true, would most weaken the archaeologist's conclusion?",
          options: [
            { letter: "A", text: "Several other figurines of the same style have been found at the same site." },
            { letter: "B", text: "Phoenician colonies are known to have practised long-distance trade with North Africa." },
            { letter: "C", text: "Tin from central Europe has been shown to occur naturally in some southern Spanish ores." },
            { letter: "D", text: "The figurine appears to have been produced using a casting technique typical of Phoenician workshops." }
          ], correct: "C" },

        // ───── Craft & Structure (7 Q) ─────
        { id: 8, domain: "Craft & Structure",
          passage: "Throughout her career, the architect Frida Escobedo has remained ___ to a single design principle. Whether designing a small pavilion or a major museum, she insists that the building must respond to its specific site, weather and history.",
          stem: "Which choice completes the text with the most logical and precise word?",
          options: [{letter:"A",text:"committed"},{letter:"B",text:"reluctant"},{letter:"C",text:"opposed"},{letter:"D",text:"indifferent"}],
          correct: "A" },

        { id: 9, domain: "Craft & Structure",
          passage: "Although the writer Patricia Highsmith was widely admired for her dialogue, critics often found her descriptive prose surprisingly ___: direct, undecorated and apparently uninterested in producing beautiful effects.",
          stem: "Which choice completes the text with the most logical and precise word?",
          options: [{letter:"A",text:"lush"},{letter:"B",text:"austere"},{letter:"C",text:"ornate"},{letter:"D",text:"effusive"}],
          correct: "B" },

        { id: 10, domain: "Craft & Structure",
          passage: "Most of us assume that a writer's first draft is the messy version, full of ideas that need cutting, while the final draft is the elegant one. The novelist Toni Morrison reversed this idea: her first drafts, she once said, were 'almost too tidy' — short, controlled paragraphs in which every sentence did exactly what she had asked it to. Revision, for her, was the work of adding.",
          stem: "What is the main purpose of the text?",
          options: [
            { letter: "A", text: "To compare two well-known novelists' approaches to writing." },
            { letter: "B", text: "To describe an unusual writing process that reverses common expectations." },
            { letter: "C", text: "To argue that final drafts are always longer than first drafts." },
            { letter: "D", text: "To explain why Toni Morrison was successful as a novelist." }
          ], correct: "B" },

        { id: 11, domain: "Craft & Structure",
          passage: "Cellist Yo-Yo Ma has often spoken about a recital he gave as a teenager that ended badly. Rather than treating the experience as a private failure, however, he describes it as the ___ moment in his understanding of what stage performance actually requires.",
          stem: "Which choice completes the text with the most logical and precise word?",
          options: [{letter:"A",text:"final"},{letter:"B",text:"defining"},{letter:"C",text:"forgettable"},{letter:"D",text:"interrupted"}],
          correct: "B" },

        { id: 12, domain: "Craft & Structure",
          passage: "The literary critic Helen Vendler once described a poem's first line as a 'door': sometimes obviously open, sometimes apparently closed, but always inviting the reader to decide whether to walk through.",
          stem: "Based on the text, the metaphor of the door is used to suggest that the first line of a poem:",
          options: [
            { letter: "A", text: "always reveals the poem's main idea." },
            { letter: "B", text: "establishes the boundary between reader and writer." },
            { letter: "C", text: "presents the reader with a choice about engagement." },
            { letter: "D", text: "conceals the meaning of the poem from most readers." }
          ], correct: "C" },

        { id: 13, domain: "Craft & Structure",
          passage: "In her 1962 book Silent Spring, Rachel Carson argued that the unrestricted use of pesticides was harming far more than the insects it was designed to kill. Carson's training as a biologist allowed her to make a technical case; her training as a writer allowed her to make that case __________ to readers who had never considered the question.",
          stem: "Which choice completes the text with the most logical and precise word?",
          options: [{letter:"A",text:"compelling"},{letter:"B",text:"hostile"},{letter:"C",text:"confusing"},{letter:"D",text:"invisible"}],
          correct: "A" },

        { id: 14, domain: "Craft & Structure",
          passage: "Text 1: The painter Hilma af Klint kept her most radical work hidden during her lifetime, asking that it not be shown for at least twenty years after her death. Critics have often described this decision as evidence of her humility.\n\nText 2: A rereading of af Klint's notebooks suggests something different. She wrote that her audience 'had not yet been born', a phrase that suggests not modesty but a strong conviction that her work was ahead of its time.",
          stem: "How would the author of Text 2 most likely characterise the decision described in Text 1?",
          options: [
            { letter: "A", text: "As a painful but unavoidable concession to social pressure." },
            { letter: "B", text: "As a reflection of confidence about the work's future significance, rather than humility." },
            { letter: "C", text: "As an early sign of doubt about the value of her painting." },
            { letter: "D", text: "As a strategy to increase commercial demand for her work." }
          ], correct: "B" },

        // ───── Standard English Conventions (7 Q) ─────
        { id: 15, domain: "Standard English Conventions",
          passage: "The novel is set in three cities ___ Lagos, Tokyo and Mexico City.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          options: [{letter:"A",text:"cities,"},{letter:"B",text:"cities;"},{letter:"C",text:"cities:"},{letter:"D",text:"cities"}],
          correct: "C" },

        { id: 16, domain: "Standard English Conventions",
          passage: "The collection of letters, written over thirty years and now stored at the university library, ___ a useful resource for historians.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          options: [{letter:"A",text:"is"},{letter:"B",text:"are"},{letter:"C",text:"being"},{letter:"D",text:"have been"}],
          correct: "A" },

        { id: 17, domain: "Standard English Conventions",
          passage: "The conference brought together specialists in three fields ___ engineering, economics and ethics ___ to discuss the social impact of large-scale construction projects.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          options: [{letter:"A",text:"— / —"},{letter:"B",text:", / ,"},{letter:"C",text:"— / ,"},{letter:"D",text:"; / ;"}],
          correct: "A" },

        { id: 18, domain: "Standard English Conventions",
          passage: "Each of the engineers ___ responsible for a different part of the bridge.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          options: [{letter:"A",text:"are"},{letter:"B",text:"is"},{letter:"C",text:"being"},{letter:"D",text:"have been"}],
          correct: "B" },

        { id: 19, domain: "Standard English Conventions",
          passage: "Driven by curiosity rather than profit, ___",
          stem: "Which choice completes the sentence so that it conforms to the conventions of Standard English?",
          options: [
            { letter: "A", text: "the experiment lasted nearly two decades." },
            { letter: "B", text: "the laboratory was unusually quiet at night." },
            { letter: "C", text: "Dr Patel continued the experiment for nearly two decades." },
            { letter: "D", text: "the experiment, kept private, ran for many years." }
          ], correct: "C" },

        { id: 20, domain: "Standard English Conventions",
          passage: "Among the books on the shelf ___ a small leather notebook that nobody had opened for a hundred years.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          options: [{letter:"A",text:"are"},{letter:"B",text:"were"},{letter:"C",text:"was"},{letter:"D",text:"is being"}],
          correct: "C" },

        { id: 21, domain: "Standard English Conventions",
          passage: "After hours of careful work, the team finally finished ___ the report.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          options: [{letter:"A",text:"to write"},{letter:"B",text:"writing"},{letter:"C",text:"to writing"},{letter:"D",text:"in writing"}],
          correct: "B" },

        // ───── Expression of Ideas (6 Q) ─────
        { id: 22, domain: "Expression of Ideas",
          passage: "While researching a presentation, a student took the following notes:\n• Mira Nair was born in 1957 in Rourkela, India.\n• Her debut feature film was Salaam Bombay! (1988).\n• Salaam Bombay! won the Caméra d'Or at the Cannes Film Festival.\n• The film was nominated for the Academy Award for Best Foreign Language Film.\n• Nair has since directed films in multiple languages and countries.",
          stem: "The student wants to emphasise an achievement of Nair's debut film. Which choice most effectively uses relevant information from the notes?",
          options: [
            { letter: "A", text: "Mira Nair was born in 1957 and has directed films in multiple countries since." },
            { letter: "B", text: "Mira Nair's debut feature film, Salaam Bombay!, was released in 1988." },
            { letter: "C", text: "Mira Nair's debut film, Salaam Bombay!, won the Caméra d'Or at Cannes and was nominated for an Academy Award for Best Foreign Language Film." },
            { letter: "D", text: "Born in Rourkela in 1957, Mira Nair has directed films in many languages." }
          ], correct: "C" },

        { id: 23, domain: "Expression of Ideas",
          passage: "Many of the early electric cars were limited by the slow battery technology of their time. ___, designers found imaginative ways to extend driving range, including swappable battery packs and unusual aerodynamic shapes.",
          stem: "Which choice completes the text with the most logical transition?",
          options: [{letter:"A",text:"For example,"},{letter:"B",text:"Nevertheless,"},{letter:"C",text:"Therefore,"},{letter:"D",text:"In fact,"}],
          correct: "B" },

        { id: 24, domain: "Expression of Ideas",
          passage: "The novelist publishes a new book only every five years. ___, her readers have grown to expect long waits between releases.",
          stem: "Which choice completes the text with the most logical transition?",
          options: [{letter:"A",text:"However,"},{letter:"B",text:"As a result,"},{letter:"C",text:"Otherwise,"},{letter:"D",text:"For instance,"}],
          correct: "B" },

        { id: 25, domain: "Expression of Ideas",
          passage: "While researching a presentation, a student took the following notes:\n• Mary Anning (1799–1847) was a British fossil collector.\n• She lived in Lyme Regis on the south coast of England.\n• She and her brother discovered the first complete ichthyosaur skeleton in 1810–1811.\n• She also discovered the first plesiosaur skeleton in 1823.\n• Her discoveries fundamentally changed scientific views about the history of life on Earth.",
          stem: "The student wants to emphasise the historical significance of Anning's contributions. Which choice most effectively uses relevant information from the notes?",
          options: [
            { letter: "A", text: "Mary Anning, born in 1799, lived in Lyme Regis on the south coast of England." },
            { letter: "B", text: "Mary Anning's discoveries of ichthyosaur and plesiosaur skeletons fundamentally changed scientific views about the history of life on Earth." },
            { letter: "C", text: "Mary Anning was a fossil collector who often worked with her brother in Lyme Regis." },
            { letter: "D", text: "In 1810–1811 Anning and her brother discovered an ichthyosaur skeleton." }
          ], correct: "B" },

        { id: 26, domain: "Expression of Ideas",
          passage: "Many studies have suggested that classical music can help concentration. ___, the size of the effect appears to be much smaller than it was originally claimed to be.",
          stem: "Which choice completes the text with the most logical transition?",
          options: [{letter:"A",text:"For example,"},{letter:"B",text:"Likewise,"},{letter:"C",text:"More recently,"},{letter:"D",text:"In addition,"}],
          correct: "C" },

        { id: 27, domain: "Expression of Ideas",
          passage: "While researching a presentation, a student took the following notes:\n• In 1850, fewer than 5% of the world's people lived in cities.\n• In 1950, around 30% of the world's people lived in cities.\n• In 2007, the global urban population overtook the rural population for the first time.\n• Today, more than half of the world's people live in cities.",
          stem: "The student wants to emphasise that the growth of urban populations has been a long process. Which choice most effectively uses relevant information from the notes?",
          options: [
            { letter: "A", text: "Today, more than half of the world's people live in cities." },
            { letter: "B", text: "The world's urban population has been steadily growing since at least 1850, when fewer than 5% of people lived in cities." },
            { letter: "C", text: "In 2007, urban populations overtook rural populations for the first time." },
            { letter: "D", text: "By 1950, around 30% of the world's people lived in cities." }
          ], correct: "B" }
      ]
    },

    // ───── MODULE 2 — EASY (delivered if M1 raw < 18) ─────
    module2_easy: {
      questions: [
        // ───── Information & Ideas (7 Q) ─────
        { id: 1, domain: "Information & Ideas",
          passage: "Mark Twain's novel The Adventures of Huckleberry Finn was first published in 1884 in the United Kingdom and a year later in the United States.",
          stem: "When was The Adventures of Huckleberry Finn first published?",
          options: [{letter:"A",text:"1884"},{letter:"B",text:"1885"},{letter:"C",text:"1900"},{letter:"D",text:"Earlier than 1880"}],
          correct: "A" },
        { id: 2, domain: "Information & Ideas",
          passage: "All members of the running club must wear bright colours during evening runs because the streets near the park have very poor lighting after sunset.",
          stem: "Why must club members wear bright colours?",
          options: [
            {letter:"A",text:"The colours are required by city law."},
            {letter:"B",text:"The streets are dark in the evening."},
            {letter:"C",text:"The colours keep runners warm at night."},
            {letter:"D",text:"The club organises a fashion competition."}
          ], correct: "B" },
        { id: 3, domain: "Information & Ideas",
          passage: "Most of the eggs sold in the United States are produced by white chickens, even though many breeds of brown chicken also lay eggs. Brown eggs and white eggs taste the same; the colour difference is purely cosmetic.",
          stem: "According to the text, what is true about brown and white eggs?",
          options: [
            {letter:"A",text:"They taste the same."},
            {letter:"B",text:"Brown eggs are healthier."},
            {letter:"C",text:"White eggs are larger."},
            {letter:"D",text:"Brown eggs cost less."}
          ], correct: "A" },
        { id: 4, domain: "Information & Ideas",
          passage: "The tomato plant is, biologically speaking, a fruit because it grows from a flower and contains seeds. In cooking, however, tomatoes are usually treated as vegetables.",
          stem: "Based on the text, the tomato is",
          options: [
            {letter:"A",text:"a fruit in biology but used as a vegetable in cooking."},
            {letter:"B",text:"a vegetable in biology but used as a fruit in cooking."},
            {letter:"C",text:"a fruit in both biology and cooking."},
            {letter:"D",text:"a vegetable in both biology and cooking."}
          ], correct: "A" },
        { id: 5, domain: "Information & Ideas",
          passage: "Solar panels work even on cloudy days, although they produce less electricity than they would in direct sunlight. In northern countries, solar power can supply a useful share of household electricity all year round.",
          stem: "What does the text say about solar panels on cloudy days?",
          options: [
            {letter:"A",text:"They stop working completely."},
            {letter:"B",text:"They produce less electricity than usual."},
            {letter:"C",text:"They produce more electricity than usual."},
            {letter:"D",text:"They become dangerous to use."}
          ], correct: "B" },
        { id: 6, domain: "Information & Ideas",
          passage: "The library will be closed for two weeks in August because the carpets and bookshelves on the second floor are being replaced.",
          stem: "Why will the library be closed?",
          options: [
            {letter:"A",text:"because some staff are on holiday"},
            {letter:"B",text:"because the building is being rebuilt"},
            {letter:"C",text:"because new carpets and shelves are being installed"},
            {letter:"D",text:"because students are not using it in summer"}
          ], correct: "C" },
        { id: 7, domain: "Information & Ideas",
          passage: "Honey can stay good to eat for a very long time. Archaeologists have even found pots of honey in ancient Egyptian tombs that are still safe to eat today.",
          stem: "What does the text say about ancient Egyptian honey?",
          options: [
            {letter:"A",text:"It tastes better than modern honey."},
            {letter:"B",text:"It has been thrown away by archaeologists."},
            {letter:"C",text:"It is still safe to eat today."},
            {letter:"D",text:"It was only used for religious ceremonies."}
          ], correct: "C" },

        // ───── Craft & Structure (7 Q) ─────
        { id: 8, domain: "Craft & Structure",
          passage: "When the children entered the kitchen, the smell of fresh bread was so ___ that they could think of nothing else.",
          stem: "Which choice completes the text with the most logical word?",
          options: [{letter:"A",text:"frightening"},{letter:"B",text:"inviting"},{letter:"C",text:"old"},{letter:"D",text:"cold"}],
          correct: "B" },
        { id: 9, domain: "Craft & Structure",
          passage: "When she arrived at the hotel, she was so tired that she could ___ keep her eyes open.",
          stem: "Which choice completes the text with the most logical word?",
          options: [{letter:"A",text:"hardly"},{letter:"B",text:"easily"},{letter:"C",text:"clearly"},{letter:"D",text:"often"}],
          correct: "A" },
        { id: 10, domain: "Craft & Structure",
          passage: "After running for an hour in the rain, Sara was completely ___ and could not wait to take a hot shower.",
          stem: "Which choice completes the text with the most logical word?",
          options: [{letter:"A",text:"dry"},{letter:"B",text:"warm"},{letter:"C",text:"soaked"},{letter:"D",text:"hungry"}],
          correct: "C" },
        { id: 11, domain: "Craft & Structure",
          passage: "The children's drawings were so ___ that the teacher decided to display all of them on the classroom wall.",
          stem: "Which choice completes the text with the most logical word?",
          options: [{letter:"A",text:"creative"},{letter:"B",text:"loud"},{letter:"C",text:"old"},{letter:"D",text:"empty"}],
          correct: "A" },
        { id: 12, domain: "Craft & Structure",
          passage: "When she opened the box, she was ___ to find that her grandmother's old ring was inside.",
          stem: "Which choice completes the text with the most logical word?",
          options: [{letter:"A",text:"angry"},{letter:"B",text:"surprised"},{letter:"C",text:"asleep"},{letter:"D",text:"hungry"}],
          correct: "B" },
        { id: 13, domain: "Craft & Structure",
          passage: "What is the main idea of the following text?\n\"Walking is one of the simplest forms of exercise. It does not require special clothes or equipment, and almost anyone can do it. A short walk every day can improve a person's mood and health.\"",
          stem: "What is the main idea?",
          options: [
            {letter:"A",text:"Walking is good for everyone."},
            {letter:"B",text:"Walking is the most expensive sport."},
            {letter:"C",text:"Walking is only safe in cities."},
            {letter:"D",text:"Walking should be done with friends."}
          ], correct: "A" },
        { id: 14, domain: "Craft & Structure",
          passage: "The instructions for the new printer were so ___ that even the manager could follow them without asking for help.",
          stem: "Which choice completes the text with the most logical word?",
          options: [{letter:"A",text:"clear"},{letter:"B",text:"long"},{letter:"C",text:"colourful"},{letter:"D",text:"quiet"}],
          correct: "A" },

        // ───── Standard English Conventions (7 Q) ─────
        { id: 15, domain: "Standard English Conventions",
          passage: "We bought apples___ pears and grapes at the market.",
          stem: "Which punctuation completes the text correctly?",
          options: [{letter:"A",text:";"},{letter:"B",text:","},{letter:"C",text:":"},{letter:"D",text:"(no punctuation)"}],
          correct: "B" },
        { id: 16, domain: "Standard English Conventions",
          passage: "Each of the students ___ a notebook for class.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          options: [{letter:"A",text:"need"},{letter:"B",text:"needs"},{letter:"C",text:"needing"},{letter:"D",text:"have needed"}],
          correct: "B" },
        { id: 17, domain: "Standard English Conventions",
          passage: "I went to the library yesterday___ I wanted to borrow a new book.",
          stem: "Which punctuation completes the text correctly?",
          options: [{letter:"A",text:","},{letter:"B",text:";"},{letter:"C",text:"."},{letter:"D",text:"(no punctuation)"}],
          correct: "C" },
        { id: 18, domain: "Standard English Conventions",
          passage: "Many of the children in the class ___ already learned to swim.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          options: [{letter:"A",text:"has"},{letter:"B",text:"have"},{letter:"C",text:"is"},{letter:"D",text:"having"}],
          correct: "B" },
        { id: 19, domain: "Standard English Conventions",
          passage: "Tomorrow we ___ to the museum if it does not rain.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          options: [{letter:"A",text:"go"},{letter:"B",text:"are going"},{letter:"C",text:"went"},{letter:"D",text:"were going"}],
          correct: "B" },
        { id: 20, domain: "Standard English Conventions",
          passage: "The teacher gave us three rules ___ be on time, be quiet and be kind.",
          stem: "Which punctuation completes the text correctly?",
          options: [{letter:"A",text:":"},{letter:"B",text:";"},{letter:"C",text:","},{letter:"D",text:"(no punctuation)"}],
          correct: "A" },
        { id: 21, domain: "Standard English Conventions",
          passage: "She ___ her homework every evening before dinner.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          options: [{letter:"A",text:"do"},{letter:"B",text:"does"},{letter:"C",text:"doing"},{letter:"D",text:"have done"}],
          correct: "B" },

        // ───── Expression of Ideas (6 Q) ─────
        { id: 22, domain: "Expression of Ideas",
          passage: "The film received excellent reviews. ___, it sold very few tickets in its first week.",
          stem: "Which choice completes the text with the most logical transition?",
          options: [{letter:"A",text:"Therefore"},{letter:"B",text:"However"},{letter:"C",text:"For example"},{letter:"D",text:"In particular"}],
          correct: "B" },
        { id: 23, domain: "Expression of Ideas",
          passage: "She had been waiting for her test results all week. ___, on Friday morning, the email finally arrived.",
          stem: "Which choice completes the text with the most logical transition?",
          options: [{letter:"A",text:"Despite this"},{letter:"B",text:"For this reason"},{letter:"C",text:"Finally"},{letter:"D",text:"Otherwise"}],
          correct: "C" },
        { id: 24, domain: "Expression of Ideas",
          passage: "Tom wanted to watch a film at home. ___, the internet was not working.",
          stem: "Which choice completes the text with the most logical transition?",
          options: [{letter:"A",text:"For example"},{letter:"B",text:"As a result"},{letter:"C",text:"However"},{letter:"D",text:"In conclusion"}],
          correct: "C" },
        { id: 25, domain: "Expression of Ideas",
          passage: "While researching a presentation, a student took the following notes:\n• The Eiffel Tower is in Paris, France.\n• It was built in 1889.\n• It is 330 metres tall.\n• Millions of tourists visit it every year.",
          stem: "The student wants to emphasise the height of the Eiffel Tower. Which choice most effectively uses relevant information from the notes?",
          options: [
            {letter:"A",text:"The Eiffel Tower, in Paris, was built in 1889."},
            {letter:"B",text:"The Eiffel Tower, which is 330 metres tall, is in Paris."},
            {letter:"C",text:"Millions of tourists visit the Eiffel Tower every year."},
            {letter:"D",text:"The Eiffel Tower is in Paris and was built in 1889."}
          ], correct: "B" },
        { id: 26, domain: "Expression of Ideas",
          passage: "Liam practises the guitar for an hour every day. ___, he is improving very quickly.",
          stem: "Which choice completes the text with the most logical transition?",
          options: [{letter:"A",text:"As a result"},{letter:"B",text:"However"},{letter:"C",text:"In contrast"},{letter:"D",text:"Otherwise"}],
          correct: "A" },
        { id: 27, domain: "Expression of Ideas",
          passage: "While researching a presentation, a student took the following notes:\n• The Great Barrier Reef is located off the coast of Australia.\n• It is the largest coral reef system in the world.\n• It can be seen from space.\n• It is home to thousands of species of marine life.",
          stem: "The student wants to emphasise how large the reef is. Which choice most effectively uses relevant information from the notes?",
          options: [
            {letter:"A",text:"The Great Barrier Reef, the largest coral reef system in the world, can be seen from space."},
            {letter:"B",text:"The Great Barrier Reef is off the coast of Australia."},
            {letter:"C",text:"The Great Barrier Reef is home to thousands of species."},
            {letter:"D",text:"The Great Barrier Reef contains many kinds of marine life."}
          ], correct: "A" }
      ]
    },

    // ───── MODULE 2 — HARD (delivered if M1 raw ≥ 18) ─────
    module2_hard: {
      questions: [
        // ───── Information & Ideas (7 Q) ─────
        { id: 1, domain: "Information & Ideas",
          passage: "In examining the wide variety of mating displays performed by male birds of paradise, biologists have long puzzled over why female preference would have produced behaviours that, in many cases, leave the males more visible to predators. One recent hypothesis proposes that the very visibility of these displays serves as an honest signal: only males healthy and skilful enough to survive despite being highly visible can perform them at all.",
          stem: "Which choice best states the central claim of the hypothesis described in the text?",
          options: [
            {letter:"A",text:"Female birds of paradise have come to prefer less visible males."},
            {letter:"B",text:"Visibility is a cost that limits the most elaborate displays in a species."},
            {letter:"C",text:"The most elaborate displays evolved because they reliably indicate male quality."},
            {letter:"D",text:"Bird-of-paradise displays have become less elaborate as predator populations have grown."}
          ], correct: "C" },
        { id: 2, domain: "Information & Ideas",
          passage: "Researchers tracked the movements of harbour seals in two coastal regions for five years. In one region, where commercial fishing was heavily restricted, seal populations grew by 18%. In the other region, where fishing continued at normal levels, populations declined by 6%. The researchers concluded that fishing restrictions had supported the population growth.",
          stem: "Which finding, if true, would most weaken the researchers' conclusion?",
          options: [
            {letter:"A",text:"Seal populations grow more rapidly in waters with no fishing at all than in those with restricted fishing."},
            {letter:"B",text:"During the study, seals in the restricted region had access to a new feeding ground that did not exist in the other region."},
            {letter:"C",text:"Some seals in the unrestricted region were harmed by old fishing equipment."},
            {letter:"D",text:"Seal populations are also affected by changes in water temperature."}
          ], correct: "B" },
        { id: 3, domain: "Information & Ideas",
          passage: "Text 1: Most studies of memory in older adults have focused on losses — what people no longer remember. Recent work, however, has begun to examine the kinds of memory that older adults retain unusually well, especially memory for emotional content and for recurring patterns.\n\nText 2: A growing number of educators argue that age-friendly learning environments should build on these preserved abilities, designing courses around emotionally meaningful tasks and slow repetition rather than the rapid factual recall that traditionally dominates the classroom.",
          stem: "Based on the texts, the educators in Text 2 are most likely making use of which point in Text 1?",
          options: [
            {letter:"A",text:"That memory loss in older adults has been overstated."},
            {letter:"B",text:"That older adults retain certain forms of memory particularly well."},
            {letter:"C",text:"That traditional classrooms are unsuited to all learners."},
            {letter:"D",text:"That emotional content is harder to remember than factual content."}
          ], correct: "B" },
        { id: 4, domain: "Information & Ideas",
          passage: "The following is from a 19th-century essay: \"It has often been said that a city's true character may be read from the small habits of its citizens, rather than from the public proclamations of its officials. The traveller who watches a market for a single morning will, in this view, learn more than the traveller who reads the local newspaper for a year.\"",
          stem: "Based on the text, the writer most likely believes that:",
          options: [
            {letter:"A",text:"Newspapers are the most reliable source of information about a city."},
            {letter:"B",text:"Markets are usually overlooked by serious travellers."},
            {letter:"C",text:"Everyday behaviour reveals a city more accurately than official communication does."},
            {letter:"D",text:"Officials and ordinary citizens generally agree about a city's character."}
          ], correct: "C" },
        { id: 5, domain: "Information & Ideas",
          passage: "Materials scientists studying ancient Roman concrete have noted that it has lasted, in some cases, for over two thousand years, while modern concrete typically begins to deteriorate within decades. Recent analysis suggests that small inclusions in the Roman material — once dismissed as the result of careless mixing — actually allowed the concrete to 'self-heal' small cracks over time as water seeped through them.",
          stem: "Which choice best summarises the recent finding described in the text?",
          options: [
            {letter:"A",text:"Roman builders used a more carefully prepared mixture than modern engineers do."},
            {letter:"B",text:"What earlier scientists had treated as a mistake in Roman concrete was, in fact, central to its durability."},
            {letter:"C",text:"Modern concrete contains the same self-healing inclusions as Roman concrete."},
            {letter:"D",text:"Roman concrete deteriorates only in the presence of seawater."}
          ], correct: "B" },
        { id: 6, domain: "Information & Ideas",
          passage: "An economist has proposed that small reductions in the working week — from 40 hours to 36 — might increase rather than decrease overall productivity, because well-rested workers make fewer errors and need to redo less work. The economist's argument depends on the assumption that the time saved on error-correction would more than compensate for the four lost hours of direct work.",
          stem: "Which finding, if true, would most strongly support the economist's argument?",
          options: [
            {letter:"A",text:"Workers prefer 36-hour weeks to 40-hour weeks."},
            {letter:"B",text:"In sectors where 36-hour weeks have been tried, the time required to correct errors has fallen by an amount greater than four hours per worker per week."},
            {letter:"C",text:"Many companies have rejected proposals to reduce working hours."},
            {letter:"D",text:"Employees with longer working weeks tend to report higher salaries."}
          ], correct: "B" },
        { id: 7, domain: "Information & Ideas",
          passage: "A literary scholar argues that the typical narrator of the modern short story differs from that of the traditional folk tale in one crucial respect: while the folk-tale narrator usually knows everything that happens, the modern story's narrator typically knows much less than the reader does. The pleasure of the modern story, in this view, often consists of watching a confined narrator discover what we already suspect.",
          stem: "Based on the text, which choice best describes the narrator of a modern short story, according to the scholar?",
          options: [
            {letter:"A",text:"More widely informed than either the folk-tale narrator or the modern reader."},
            {letter:"B",text:"More widely informed than the modern reader but less so than the folk-tale narrator."},
            {letter:"C",text:"Less widely informed than the modern reader but free from emotion."},
            {letter:"D",text:"Less widely informed than the modern reader, with the reader watching the narrator catch up."}
          ], correct: "D" },

        // ───── Craft & Structure (7 Q) ─────
        { id: 8, domain: "Craft & Structure",
          passage: "In her recent essay, the philosopher Naomi Lewis argues that we have come to use the word 'authentic' as if it were obviously good. To call a meal authentic, a piece of music authentic or a person authentic is to suggest that this is enough to recommend it. Lewis is not opposed to authenticity, but she insists that the word, by itself, settles nothing: a tradition can be authentically cruel; an emotion can be authentically misguided.",
          stem: "What is the main purpose of the text?",
          options: [
            {letter:"A",text:"To explain why the word 'authentic' has become so popular."},
            {letter:"B",text:"To question the assumption that authenticity, on its own, is morally valuable."},
            {letter:"C",text:"To compare authentic and inauthentic experiences in everyday life."},
            {letter:"D",text:"To argue that authenticity is rarely possible in modern society."}
          ], correct: "B" },
        { id: 9, domain: "Craft & Structure",
          passage: "The biographer notes that her subject, although widely admired for what readers found a 'natural' style of writing, in fact wrote slowly and laboriously. Each chapter went through, on average, eleven complete drafts. The apparent ___ of the prose, in other words, was the product of considerable hidden work.",
          stem: "Which choice completes the text with the most logical and precise word?",
          options: [{letter:"A",text:"effortlessness"},{letter:"B",text:"awkwardness"},{letter:"C",text:"obscurity"},{letter:"D",text:"complexity"}],
          correct: "A" },
        { id: 10, domain: "Craft & Structure",
          passage: "The conductor's reading of the slow movement was not merely careful; it was almost ___, lingering on each phrase as if reluctant to let it pass.",
          stem: "Which choice completes the text with the most logical and precise word?",
          options: [{letter:"A",text:"reverent"},{letter:"B",text:"hostile"},{letter:"C",text:"hurried"},{letter:"D",text:"absent-minded"}],
          correct: "A" },
        { id: 11, domain: "Craft & Structure",
          passage: "Text 1: For most of the twentieth century, urban planners assumed that more cars meant more freedom for citizens. Wider roads and more parking, in this view, were obvious public goods.\n\nText 2: A small but growing body of research now treats this old assumption as a kind of category mistake. Cars do increase the personal mobility of those who own them, but only by reducing the freedom of pedestrians, cyclists and children to move safely through their own neighbourhoods.",
          stem: "How would the writers of Text 2 most likely characterise the reasoning of the planners described in Text 1?",
          options: [
            {letter:"A",text:"As accurate but no longer relevant."},
            {letter:"B",text:"As confused, because it counted only one kind of freedom."},
            {letter:"C",text:"As an exaggeration of a fundamentally correct intuition."},
            {letter:"D",text:"As deliberately misleading."}
          ], correct: "B" },
        { id: 12, domain: "Craft & Structure",
          passage: "The author's own term for the device is 'soft surveillance': a watching that does not announce itself, that asks no questions, but that quietly accumulates information until refusal becomes more costly than compliance.",
          stem: "Based on the text, which choice best describes the central feature of 'soft surveillance' as the author defines it?",
          options: [
            {letter:"A",text:"It is conducted entirely by machines."},
            {letter:"B",text:"It is openly announced to those being watched."},
            {letter:"C",text:"It works by gradually making refusal seem too costly."},
            {letter:"D",text:"It collects only information that can be made public."}
          ], correct: "C" },
        { id: 13, domain: "Craft & Structure",
          passage: "The chef speaks of his apprenticeship as a long ___: years of preparing the same dishes hundreds of times before he was ever allowed to suggest a single change.",
          stem: "Which choice completes the text with the most logical and precise word?",
          options: [{letter:"A",text:"discipline"},{letter:"B",text:"festival"},{letter:"C",text:"holiday"},{letter:"D",text:"argument"}],
          correct: "A" },
        { id: 14, domain: "Craft & Structure",
          passage: "Text 1: Many critics regard the late films of director Yasujirō Ozu as exercises in restraint: his cameras barely move, his stories revolve around small family disagreements, and his endings are quiet rather than dramatic.\n\nText 2: A different reading sees this restraint as a particular kind of risk-taking. By stripping away the conventional pleasures of cinematic narrative, Ozu commits himself to making meaning through almost nothing — a posture, a glance, the way a teacup is set down.",
          stem: "How does the reading offered in Text 2 most differ from the description in Text 1?",
          options: [
            {letter:"A",text:"It treats Ozu's restraint as a flaw rather than a virtue."},
            {letter:"B",text:"It reframes Ozu's restraint as an unusually demanding artistic strategy rather than a simple absence of action."},
            {letter:"C",text:"It denies that Ozu's films are restrained."},
            {letter:"D",text:"It claims that Ozu's films are dramatic in ways that critics have failed to notice."}
          ], correct: "B" },

        // ───── Standard English Conventions (7 Q) ─────
        { id: 15, domain: "Standard English Conventions",
          passage: "The committee — which includes engineers, economists and ethicists ___ meets every two months in Geneva.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          options: [{letter:"A",text:"—"},{letter:"B",text:":"},{letter:"C",text:";"},{letter:"D",text:","}],
          correct: "A" },
        { id: 16, domain: "Standard English Conventions",
          passage: "Of the three candidates interviewed last week, only one ___ been offered the position.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          options: [{letter:"A",text:"have"},{letter:"B",text:"has"},{letter:"C",text:"having"},{letter:"D",text:"are"}],
          correct: "B" },
        { id: 17, domain: "Standard English Conventions",
          passage: "Looking back at the previous decade ___ the historian noted three turning points she had earlier missed.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          options: [{letter:"A",text:"."},{letter:"B",text:";"},{letter:"C",text:","},{letter:"D",text:":"}],
          correct: "C" },
        { id: 18, domain: "Standard English Conventions",
          passage: "The architect, ___ designs include the new town library, has won three international awards.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          options: [{letter:"A",text:"who's"},{letter:"B",text:"whose"},{letter:"C",text:"that"},{letter:"D",text:"which"}],
          correct: "B" },
        { id: 19, domain: "Standard English Conventions",
          passage: "Although the team had practised for three months, ___",
          stem: "Which choice completes the sentence so that it conforms to the conventions of Standard English?",
          options: [
            {letter:"A",text:"the field was muddy on the day of the match."},
            {letter:"B",text:"there was very little hope of winning."},
            {letter:"C",text:"the players still felt unprepared on match day."},
            {letter:"D",text:"the umpire arrived ten minutes late."}
          ], correct: "C" },
        { id: 20, domain: "Standard English Conventions",
          passage: "Neither the manager nor the assistants ___ aware of the change in policy.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          options: [{letter:"A",text:"is"},{letter:"B",text:"has been"},{letter:"C",text:"are"},{letter:"D",text:"being"}],
          correct: "C" },
        { id: 21, domain: "Standard English Conventions",
          passage: "Hidden behind the long curtains in the dining room ___ a small painting that the family had forgotten about.",
          stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          options: [{letter:"A",text:"are"},{letter:"B",text:"were"},{letter:"C",text:"was"},{letter:"D",text:"have been"}],
          correct: "C" },

        // ───── Expression of Ideas (6 Q) ─────
        { id: 22, domain: "Expression of Ideas",
          passage: "Although the manuscript was finally published in 1979, the author had begun writing it in 1962. ___, the project occupied her for nearly two decades.",
          stem: "Which choice completes the text with the most logical transition?",
          options: [{letter:"A",text:"For instance,"},{letter:"B",text:"Even so,"},{letter:"C",text:"In total,"},{letter:"D",text:"Otherwise,"}],
          correct: "C" },
        { id: 23, domain: "Expression of Ideas",
          passage: "Many cities have begun to encourage residents to give up their cars. ___ even small reductions in car ownership can produce noticeable improvements in air quality.",
          stem: "Which choice completes the text with the most logical transition?",
          options: [{letter:"A",text:"In contrast,"},{letter:"B",text:"Indeed,"},{letter:"C",text:"On the other hand,"},{letter:"D",text:"Otherwise,"}],
          correct: "B" },
        { id: 24, domain: "Expression of Ideas",
          passage: "While researching a presentation, a student took the following notes:\n• The painter Hilma af Klint (1862–1944) lived in Sweden.\n• She produced her most innovative paintings between 1906 and 1915.\n• These paintings used abstract forms before most other European artists had begun to do so.\n• They were not exhibited publicly during her lifetime.\n• They are now considered an important early step in the history of abstract art.",
          stem: "The student wants to emphasise the historical importance of af Klint's early abstract paintings. Which choice most effectively uses relevant information from the notes?",
          options: [
            {letter:"A",text:"Hilma af Klint (1862–1944) was a Swedish painter who produced her most innovative work between 1906 and 1915."},
            {letter:"B",text:"Hilma af Klint's paintings, produced between 1906 and 1915, used abstract forms before most other European artists, and are now seen as an important early step in the history of abstract art."},
            {letter:"C",text:"Hilma af Klint's paintings were not exhibited during her lifetime."},
            {letter:"D",text:"Hilma af Klint lived in Sweden and died in 1944."}
          ], correct: "B" },
        { id: 25, domain: "Expression of Ideas",
          passage: "The tourist board's new advertisements emphasise quiet beaches and traditional villages. ___, recent visitor surveys show that most travellers come to the region for its restaurants and nightlife.",
          stem: "Which choice completes the text with the most logical transition?",
          options: [{letter:"A",text:"As a result,"},{letter:"B",text:"In addition,"},{letter:"C",text:"However,"},{letter:"D",text:"Above all,"}],
          correct: "C" },
        { id: 26, domain: "Expression of Ideas",
          passage: "The festival's organisers had expected several hundred visitors. ___ they were astonished when more than five thousand people arrived on the opening day.",
          stem: "Which choice completes the text with the most logical transition?",
          options: [{letter:"A",text:"For example,"},{letter:"B",text:"Therefore,"},{letter:"C",text:"Instead,"},{letter:"D",text:"Likewise,"}],
          correct: "C" },
        { id: 27, domain: "Expression of Ideas",
          passage: "While researching a presentation, a student took the following notes:\n• The composer Florence Price (1887–1953) was born in Arkansas.\n• In 1933 her First Symphony was performed by the Chicago Symphony Orchestra.\n• She was the first African American woman to have a symphony performed by a major American orchestra.\n• Many of her manuscripts were lost for decades and rediscovered only in 2009.",
          stem: "The student wants to emphasise the historical significance of the 1933 performance. Which choice most effectively uses relevant information from the notes?",
          options: [
            {letter:"A",text:"Florence Price (1887–1953) was born in Arkansas."},
            {letter:"B",text:"In 1933 the Chicago Symphony Orchestra performed Florence Price's First Symphony, making her the first African American woman to have a symphony performed by a major American orchestra."},
            {letter:"C",text:"Many of Price's manuscripts were lost for decades."},
            {letter:"D",text:"Price died in 1953, and her manuscripts were rediscovered in 2009."}
          ], correct: "B" }
      ]
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  //                              MATH
  // ═══════════════════════════════════════════════════════════════════
  math: {

    // ───── MODULE 1 — 22 Q, mixed difficulty ─────
    module1: {
      questions: [
        // Algebra (8)
        { id: 1, domain: "Algebra", stem: "If $4x - 7 = 21$, what is the value of $x$?",
          options: [{letter:"A",text:"$5$"},{letter:"B",text:"$7$"},{letter:"C",text:"$11$"},{letter:"D",text:"$14$"}],
          correct: "B", spr: false },
        { id: 2, domain: "Algebra", stem: "Which value of $y$ satisfies the system $\\begin{cases} 2x + y = 10 \\\\ x - y = 2 \\end{cases}$?",
          options: [{letter:"A",text:"$0$"},{letter:"B",text:"$2$"},{letter:"C",text:"$4$"},{letter:"D",text:"$6$"}],
          correct: "B", spr: false },
        { id: 3, domain: "Algebra", stem: "If $\\dfrac{x}{3} + 5 = 11$, what is the value of $x$?",
          options: null, spr: true, accept: ["18"] },
        { id: 4, domain: "Algebra", stem: "Which expression is equivalent to $5(2x - 3) - 2(x + 4)$?",
          options: [{letter:"A",text:"$8x - 7$"},{letter:"B",text:"$8x - 23$"},{letter:"C",text:"$12x - 7$"},{letter:"D",text:"$12x - 23$"}],
          correct: "B", spr: false },
        { id: 5, domain: "Algebra", stem: "If $5x + 2 < 22$, which inequality represents all values of $x$?",
          options: [{letter:"A",text:"$x < 4$"},{letter:"B",text:"$x > 4$"},{letter:"C",text:"$x < -4$"},{letter:"D",text:"$x > -4$"}],
          correct: "A", spr: false },
        { id: 6, domain: "Algebra", stem: "The equation $y = 3x + 2$ describes a line in the $xy$-plane. What is the slope of this line?",
          options: null, spr: true, accept: ["3"] },
        { id: 7, domain: "Algebra", stem: "If $2(x + 3) = 4x - 6$, what is the value of $x$?",
          options: [{letter:"A",text:"$3$"},{letter:"B",text:"$6$"},{letter:"C",text:"$9$"},{letter:"D",text:"$12$"}],
          correct: "B", spr: false },
        { id: 8, domain: "Algebra", stem: "A taxi charges a $\\$3$ booking fee plus $\\$2$ per mile. Which equation gives the cost $C$, in dollars, of a taxi ride of $m$ miles?",
          options: [{letter:"A",text:"$C = 3m + 2$"},{letter:"B",text:"$C = 2m + 3$"},{letter:"C",text:"$C = 5m$"},{letter:"D",text:"$C = 3m - 2$"}],
          correct: "B", spr: false },

        // Advanced Math (8)
        { id: 9, domain: "Advanced Math", stem: "What are the solutions to $x^2 - 5x + 6 = 0$?",
          options: [{letter:"A",text:"$x = 2$ or $x = 3$"},{letter:"B",text:"$x = -2$ or $x = -3$"},{letter:"C",text:"$x = 1$ or $x = 6$"},{letter:"D",text:"$x = -1$ or $x = -6$"}],
          correct: "A", spr: false },
        { id: 10, domain: "Advanced Math", stem: "If $f(x) = 2x^2 - 3$, what is $f(4)$?",
          options: [{letter:"A",text:"$5$"},{letter:"B",text:"$13$"},{letter:"C",text:"$29$"},{letter:"D",text:"$32$"}],
          correct: "C", spr: false },
        { id: 11, domain: "Advanced Math", stem: "If $g(x) = (x - 2)(x + 5)$, for what value of $x$ does $g(x) = 0$ and $x > 0$?",
          options: null, spr: true, accept: ["2"] },
        { id: 12, domain: "Advanced Math", stem: "If $3^{x} = 81$, what is the value of $x$?",
          options: [{letter:"A",text:"$3$"},{letter:"B",text:"$4$"},{letter:"C",text:"$9$"},{letter:"D",text:"$27$"}],
          correct: "B", spr: false },
        { id: 13, domain: "Advanced Math", stem: "Which expression is equivalent to $(2x + 3)^2$?",
          options: [{letter:"A",text:"$4x^2 + 9$"},{letter:"B",text:"$4x^2 + 12x + 9$"},{letter:"C",text:"$4x^2 + 6x + 9$"},{letter:"D",text:"$2x^2 + 12x + 9$"}],
          correct: "B", spr: false },
        { id: 14, domain: "Advanced Math", stem: "If $\\sqrt{x + 5} = 7$, what is the value of $x$?",
          options: [{letter:"A",text:"$2$"},{letter:"B",text:"$12$"},{letter:"C",text:"$44$"},{letter:"D",text:"$49$"}],
          correct: "C", spr: false },
        { id: 15, domain: "Advanced Math", stem: "If $h(x) = x^3 - 1$, what is $h(2)$?",
          options: null, spr: true, accept: ["7"] },
        { id: 16, domain: "Advanced Math", stem: "What is the $y$-intercept of the parabola $y = x^2 - 4x + 7$?",
          options: [{letter:"A",text:"$-7$"},{letter:"B",text:"$-4$"},{letter:"C",text:"$4$"},{letter:"D",text:"$7$"}],
          correct: "D", spr: false },

        // Problem-Solving & Data Analysis (3)
        { id: 17, domain: "Problem-Solving & Data Analysis", stem: "A jacket originally priced at $\\$80$ is on sale for $25\\%$ off. What is the sale price?",
          options: [{letter:"A",text:"$\\$20$"},{letter:"B",text:"$\\$55$"},{letter:"C",text:"$\\$60$"},{letter:"D",text:"$\\$75$"}],
          correct: "C", spr: false },
        { id: 18, domain: "Problem-Solving & Data Analysis", stem: "A bag contains $12$ red marbles and $18$ blue marbles. What is the probability of drawing a red marble at random? Give your answer as a decimal.",
          options: null, spr: true, accept: ["0.4", ".4", "2/5"] },
        { id: 19, domain: "Problem-Solving & Data Analysis", stem: "The average (mean) of three numbers is $12$. If two of the numbers are $9$ and $14$, what is the third number?",
          options: [{letter:"A",text:"$11$"},{letter:"B",text:"$12$"},{letter:"C",text:"$13$"},{letter:"D",text:"$15$"}],
          correct: "C", spr: false },

        // Geometry & Trigonometry (3)
        { id: 20, domain: "Geometry & Trigonometry", stem: "In the right triangle shown, one leg has length $3$ and the hypotenuse has length $5$. What is the length of the other leg?",
          figureSvg: "<svg viewBox='0 0 220 160' xmlns='http://www.w3.org/2000/svg'><polygon points='40,130 40,40 160,130' fill='none' stroke='#0b3d91' stroke-width='2'/><rect x='40' y='115' width='15' height='15' fill='none' stroke='#0b3d91' stroke-width='1.5'/><text x='22' y='90' font-size='15' fill='#0b3d91' font-family='serif'>3</text><text x='95' y='75' font-size='15' fill='#0b3d91' font-family='serif'>5</text><text x='92' y='148' font-size='15' fill='#0b3d91' font-family='serif'>?</text></svg>",
          options: [{letter:"A",text:"$2$"},{letter:"B",text:"$4$"},{letter:"C",text:"$6$"},{letter:"D",text:"$8$"}],
          correct: "B", spr: false },
        { id: 21, domain: "Geometry & Trigonometry", stem: "The circle shown has radius $7$. What is the circumference of the circle? Use $\\pi \\approx 3.14$.",
          figureSvg: "<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><circle cx='100' cy='100' r='70' fill='none' stroke='#0b3d91' stroke-width='2'/><line x1='100' y1='100' x2='170' y2='100' stroke='#0b3d91' stroke-width='1.5'/><circle cx='100' cy='100' r='3' fill='#0b3d91'/><text x='128' y='95' font-size='15' fill='#0b3d91' font-family='serif'>7</text></svg>",
          options: [{letter:"A",text:"$14$"},{letter:"B",text:"$21.98$"},{letter:"C",text:"$43.96$"},{letter:"D",text:"$153.86$"}],
          correct: "C", spr: false },
        { id: 22, domain: "Geometry & Trigonometry", stem: "The rectangular garden shown is $12$ metres long and $5$ metres wide. What is the area of the garden, in square metres?",
          figureSvg: "<svg viewBox='0 0 240 140' xmlns='http://www.w3.org/2000/svg'><rect x='40' y='40' width='160' height='60' fill='#fef3c7' stroke='#0b3d91' stroke-width='2'/><text x='120' y='32' font-size='15' fill='#0b3d91' font-family='serif' text-anchor='middle'>12 m</text><text x='208' y='75' font-size='15' fill='#0b3d91' font-family='serif'>5 m</text></svg>",
          options: null, spr: true, accept: ["60"] }
      ]
    },

    // ───── MODULE 2 — EASY ─────
    module2_easy: {
      questions: [
        // Algebra (8)
        { id: 1, domain: "Algebra", stem: "If $x + 7 = 12$, what is the value of $x$?",
          options: [{letter:"A",text:"$5$"},{letter:"B",text:"$7$"},{letter:"C",text:"$12$"},{letter:"D",text:"$19$"}], correct: "A", spr: false },
        { id: 2, domain: "Algebra", stem: "What is $3a - a$ in simplest form?",
          options: [{letter:"A",text:"$2a$"},{letter:"B",text:"$3$"},{letter:"C",text:"$4a$"},{letter:"D",text:"$a^2$"}], correct: "A", spr: false },
        { id: 3, domain: "Algebra", stem: "Solve for $y$: $\\;2y = 14$.",
          options: [{letter:"A",text:"$6$"},{letter:"B",text:"$7$"},{letter:"C",text:"$12$"},{letter:"D",text:"$28$"}], correct: "B", spr: false },
        { id: 4, domain: "Algebra", stem: "If $3x = 21$, what is the value of $x$?",
          options: null, spr: true, accept: ["7"] },
        { id: 5, domain: "Algebra", stem: "Simplify: $4x + 3x$.",
          options: [{letter:"A",text:"$7$"},{letter:"B",text:"$x^7$"},{letter:"C",text:"$7x$"},{letter:"D",text:"$12x$"}], correct: "C", spr: false },
        { id: 6, domain: "Algebra", stem: "If $x - 4 = 9$, what is the value of $x$?",
          options: [{letter:"A",text:"$5$"},{letter:"B",text:"$9$"},{letter:"C",text:"$13$"},{letter:"D",text:"$36$"}], correct: "C", spr: false },
        { id: 7, domain: "Algebra", stem: "What value of $x$ satisfies $x + 3 = 2x$?",
          options: [{letter:"A",text:"$1$"},{letter:"B",text:"$2$"},{letter:"C",text:"$3$"},{letter:"D",text:"$5$"}], correct: "C", spr: false },
        { id: 8, domain: "Algebra", stem: "If $y = 2x$ and $x = 5$, what is the value of $y$?",
          options: null, spr: true, accept: ["10"] },

        // Advanced Math (8)
        { id: 9, domain: "Advanced Math", stem: "What is the value of $5^2 + 3$?",
          options: [{letter:"A",text:"$8$"},{letter:"B",text:"$13$"},{letter:"C",text:"$28$"},{letter:"D",text:"$53$"}], correct: "C", spr: false },
        { id: 10, domain: "Advanced Math", stem: "If $f(x) = x + 3$, what is $f(5)$?",
          options: null, spr: true, accept: ["8"] },
        { id: 11, domain: "Advanced Math", stem: "What is $2^3 \\times 2^2$?",
          options: [{letter:"A",text:"$8$"},{letter:"B",text:"$16$"},{letter:"C",text:"$32$"},{letter:"D",text:"$64$"}], correct: "C", spr: false },
        { id: 12, domain: "Advanced Math", stem: "Solve: $x^2 = 49$. (Give the positive value.)",
          options: null, spr: true, accept: ["7"] },
        { id: 13, domain: "Advanced Math", stem: "If $f(x) = 2x$, what is $f(6)$?",
          options: [{letter:"A",text:"$3$"},{letter:"B",text:"$6$"},{letter:"C",text:"$12$"},{letter:"D",text:"$36$"}], correct: "C", spr: false },
        { id: 14, domain: "Advanced Math", stem: "Which expression is equivalent to $x \\cdot x \\cdot x$?",
          options: [{letter:"A",text:"$3x$"},{letter:"B",text:"$x^3$"},{letter:"C",text:"$3 + x$"},{letter:"D",text:"$x^{3x}$"}], correct: "B", spr: false },
        { id: 15, domain: "Advanced Math", stem: "What is $\\sqrt{36}$?",
          options: [{letter:"A",text:"$3$"},{letter:"B",text:"$6$"},{letter:"C",text:"$9$"},{letter:"D",text:"$18$"}], correct: "B", spr: false },
        { id: 16, domain: "Advanced Math", stem: "If $g(x) = x^2$, what is $g(4)$?",
          options: [{letter:"A",text:"$2$"},{letter:"B",text:"$8$"},{letter:"C",text:"$16$"},{letter:"D",text:"$32$"}], correct: "C", spr: false },

        // Problem-Solving & Data Analysis (3)
        { id: 17, domain: "Problem-Solving & Data Analysis", stem: "What is $50\\%$ of $80$?",
          options: [{letter:"A",text:"$4$"},{letter:"B",text:"$40$"},{letter:"C",text:"$50$"},{letter:"D",text:"$80$"}], correct: "B", spr: false },
        { id: 18, domain: "Problem-Solving & Data Analysis", stem: "What is the mean (average) of $4$, $6$ and $8$?",
          options: [{letter:"A",text:"$4$"},{letter:"B",text:"$6$"},{letter:"C",text:"$8$"},{letter:"D",text:"$18$"}], correct: "B", spr: false },
        { id: 19, domain: "Problem-Solving & Data Analysis", stem: "A pizza is cut into $8$ equal slices. If you eat $3$ slices, what fraction of the pizza have you eaten?",
          options: [{letter:"A",text:"$\\dfrac{1}{8}$"},{letter:"B",text:"$\\dfrac{1}{3}$"},{letter:"C",text:"$\\dfrac{3}{8}$"},{letter:"D",text:"$\\dfrac{5}{8}$"}], correct: "C", spr: false },

        // Geometry & Trigonometry (3)
        { id: 20, domain: "Geometry & Trigonometry", stem: "What is the area of the square shown, which has side length $6$?",
          figureSvg: "<svg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'><rect x='40' y='40' width='100' height='100' fill='#fef3c7' stroke='#0b3d91' stroke-width='2'/><text x='90' y='32' font-size='15' fill='#0b3d91' font-family='serif' text-anchor='middle'>6</text></svg>",
          options: [{letter:"A",text:"$12$"},{letter:"B",text:"$24$"},{letter:"C",text:"$30$"},{letter:"D",text:"$36$"}], correct: "D", spr: false },
        { id: 21, domain: "Geometry & Trigonometry", stem: "What is the perimeter of the rectangle shown, which is $5$ units long and $3$ units wide?",
          figureSvg: "<svg viewBox='0 0 220 140' xmlns='http://www.w3.org/2000/svg'><rect x='40' y='40' width='120' height='60' fill='#fef3c7' stroke='#0b3d91' stroke-width='2'/><text x='100' y='32' font-size='15' fill='#0b3d91' font-family='serif' text-anchor='middle'>5</text><text x='168' y='75' font-size='15' fill='#0b3d91' font-family='serif'>3</text></svg>",
          options: [{letter:"A",text:"$8$"},{letter:"B",text:"$15$"},{letter:"C",text:"$16$"},{letter:"D",text:"$30$"}], correct: "C", spr: false },
        { id: 22, domain: "Geometry & Trigonometry", stem: "The triangle shown has angles of $60°$, $80°$, and $x°$. What is the value of $x$?",
          figureSvg: "<svg viewBox='0 0 220 180' xmlns='http://www.w3.org/2000/svg'><polygon points='50,150 170,150 110,40' fill='none' stroke='#0b3d91' stroke-width='2'/><text x='62' y='142' font-size='14' fill='#0b3d91' font-family='serif'>60°</text><text x='140' y='142' font-size='14' fill='#0b3d91' font-family='serif'>80°</text><text x='100' y='62' font-size='14' fill='#0b3d91' font-family='serif'>x°</text></svg>",
          options: null, spr: true, accept: ["40"] }
      ]
    },

    // ───── MODULE 2 — HARD ─────
    module2_hard: {
      questions: [
        // Algebra (8)
        { id: 1, domain: "Algebra", stem: "For what value of $a$ does the system $\\begin{cases} 3x + 2y = a \\\\ 6x + 4y = 18 \\end{cases}$ have infinitely many solutions?",
          options: [{letter:"A",text:"$9$"},{letter:"B",text:"$12$"},{letter:"C",text:"$18$"},{letter:"D",text:"$36$"}], correct: "A", spr: false },
        { id: 2, domain: "Algebra", stem: "If $-3x + 4 < 7$, which inequality represents all values of $x$?",
          options: [{letter:"A",text:"$x < -1$"},{letter:"B",text:"$x > -1$"},{letter:"C",text:"$x < 1$"},{letter:"D",text:"$x > 1$"}], correct: "B", spr: false },
        { id: 3, domain: "Algebra", stem: "If $5x - 2y = 14$ and $x + y = 7$, what is the value of $x$?",
          options: null, spr: true, accept: ["4"] },
        { id: 4, domain: "Algebra", stem: "The line shown in the $xy$-plane passes through the points $(2, 5)$ and $(6, 13)$. What is the slope of this line?",
          figureSvg: "<svg viewBox='0 0 240 200' xmlns='http://www.w3.org/2000/svg'><line x1='20' y1='180' x2='220' y2='180' stroke='#94a3b8' stroke-width='1'/><line x1='30' y1='10' x2='30' y2='200' stroke='#94a3b8' stroke-width='1'/><polygon points='216,176 224,180 216,184' fill='#94a3b8'/><polygon points='26,14 30,6 34,14' fill='#94a3b8'/><text x='223' y='176' font-size='11' fill='#94a3b8'>x</text><text x='22' y='12' font-size='11' fill='#94a3b8'>y</text><line x1='50' y1='150' x2='190' y2='30' stroke='#0b3d91' stroke-width='2'/><circle cx='70' cy='130' r='3' fill='#0b3d91'/><circle cx='150' cy='62' r='3' fill='#0b3d91'/><text x='75' y='148' font-size='11' fill='#0b3d91'>(2,5)</text><text x='155' y='58' font-size='11' fill='#0b3d91'>(6,13)</text></svg>",
          options: [{letter:"A",text:"$\\dfrac{1}{2}$"},{letter:"B",text:"$2$"},{letter:"C",text:"$3$"},{letter:"D",text:"$4$"}], correct: "B", spr: false },
        { id: 5, domain: "Algebra", stem: "If $3x + 2y = 12$, which expression equals $y$ in terms of $x$?",
          options: [{letter:"A",text:"$y = 6 - \\dfrac{3x}{2}$"},{letter:"B",text:"$y = 6 + \\dfrac{3x}{2}$"},{letter:"C",text:"$y = \\dfrac{12 - 3x}{2}$"},{letter:"D",text:"Both A and C"}], correct: "D", spr: false },
        { id: 6, domain: "Algebra", stem: "The cost $C$, in dollars, to print $n$ flyers is given by $C = 0.15n + 25$. How many flyers can be printed for exactly $\\$100$?",
          options: null, spr: true, accept: ["500"] },
        { id: 7, domain: "Algebra", stem: "If $\\dfrac{2}{x} + \\dfrac{1}{x} = \\dfrac{3}{4}$, what is the value of $x$?",
          options: [{letter:"A",text:"$1$"},{letter:"B",text:"$2$"},{letter:"C",text:"$4$"},{letter:"D",text:"$6$"}], correct: "C", spr: false },
        { id: 8, domain: "Algebra", stem: "The function $f$ is defined by $f(x) = ax + b$, where $a$ and $b$ are constants. If $f(2) = 7$ and $f(5) = 16$, what is the value of $a$?",
          options: [{letter:"A",text:"$1$"},{letter:"B",text:"$2$"},{letter:"C",text:"$3$"},{letter:"D",text:"$4$"}], correct: "C", spr: false },

        // Advanced Math (8)
        { id: 9, domain: "Advanced Math", stem: "What is the sum of the solutions of $x^2 + 7x + 12 = 0$?",
          options: [{letter:"A",text:"$-7$"},{letter:"B",text:"$-3$"},{letter:"C",text:"$3$"},{letter:"D",text:"$7$"}], correct: "A", spr: false },
        { id: 10, domain: "Advanced Math", stem: "If $2^{x+1} = 32$, what is the value of $x$?",
          options: [{letter:"A",text:"$4$"},{letter:"B",text:"$5$"},{letter:"C",text:"$6$"},{letter:"D",text:"$16$"}], correct: "A", spr: false },
        { id: 11, domain: "Advanced Math", stem: "If $g(x) = 2(x-3)^2 + 1$, what is the minimum value of $g(x)$?",
          options: [{letter:"A",text:"$-3$"},{letter:"B",text:"$0$"},{letter:"C",text:"$1$"},{letter:"D",text:"$3$"}], correct: "C", spr: false },
        { id: 12, domain: "Advanced Math", stem: "For what positive value of $k$ does $x^2 + kx + 16 = 0$ have exactly one real solution?",
          options: null, spr: true, accept: ["8"] },
        { id: 13, domain: "Advanced Math", stem: "A function $f$ satisfies $f(x+1) = 3 \\cdot f(x)$ and $f(0) = 2$. What is $f(3)$?",
          options: [{letter:"A",text:"$6$"},{letter:"B",text:"$18$"},{letter:"C",text:"$54$"},{letter:"D",text:"$162$"}], correct: "C", spr: false },
        { id: 14, domain: "Advanced Math", stem: "Which expression is equivalent to $(x^3 \\cdot x^4)^2$?",
          options: [{letter:"A",text:"$x^9$"},{letter:"B",text:"$x^{12}$"},{letter:"C",text:"$x^{14}$"},{letter:"D",text:"$x^{24}$"}], correct: "C", spr: false },
        { id: 15, domain: "Advanced Math", stem: "If $\\dfrac{x^2 - 9}{x - 3} = 7$ and $x \\neq 3$, what is the value of $x$?",
          options: null, spr: true, accept: ["4"] },
        { id: 16, domain: "Advanced Math", stem: "The graph of $y = (x-1)^2 - 4$ in the $xy$-plane is shown. The vertex of this parabola is at which point?",
          figureSvg: "<svg viewBox='0 0 240 220' xmlns='http://www.w3.org/2000/svg'><line x1='20' y1='110' x2='220' y2='110' stroke='#94a3b8' stroke-width='1'/><line x1='100' y1='10' x2='100' y2='210' stroke='#94a3b8' stroke-width='1'/><polygon points='216,106 224,110 216,114' fill='#94a3b8'/><polygon points='96,14 100,6 104,14' fill='#94a3b8'/><text x='223' y='106' font-size='11' fill='#94a3b8'>x</text><text x='92' y='12' font-size='11' fill='#94a3b8'>y</text><path d='M 40,30 Q 120,210 200,30' fill='none' stroke='#0b3d91' stroke-width='2'/><circle cx='120' cy='150' r='3' fill='#0b3d91'/><text x='128' y='168' font-size='11' fill='#0b3d91'>vertex</text></svg>",
          options: [{letter:"A",text:"$(-1, -4)$"},{letter:"B",text:"$(-1, 4)$"},{letter:"C",text:"$(1, -4)$"},{letter:"D",text:"$(1, 4)$"}], correct: "C", spr: false },

        // Problem-Solving & Data Analysis (3)
        { id: 17, domain: "Problem-Solving & Data Analysis", stem: "A school survey found that $60\\%$ of $250$ students bring lunch from home. How many students do NOT bring lunch from home?",
          options: null, spr: true, accept: ["100"] },
        { id: 18, domain: "Problem-Solving & Data Analysis", stem: "The five values $4$, $7$, $7$, $9$ and $13$ have a mean $m$ and a median $d$. What is $m - d$?",
          options: [{letter:"A",text:"$-1$"},{letter:"B",text:"$0$"},{letter:"C",text:"$1$"},{letter:"D",text:"$2$"}], correct: "C", spr: false },
        { id: 19, domain: "Problem-Solving & Data Analysis", stem: "A factory produced $2{,}400$ items in March and $3{,}000$ in April. What is the percentage increase from March to April?",
          options: [{letter:"A",text:"$20\\%$"},{letter:"B",text:"$25\\%$"},{letter:"C",text:"$30\\%$"},{letter:"D",text:"$60\\%$"}], correct: "B", spr: false },

        // Geometry & Trigonometry (3)
        { id: 20, domain: "Geometry & Trigonometry", stem: "In the right triangle shown, $\\sin\\theta = \\dfrac{3}{5}$. What is $\\cos\\theta$?",
          figureSvg: "<svg viewBox='0 0 220 160' xmlns='http://www.w3.org/2000/svg'><polygon points='40,130 160,130 160,40' fill='none' stroke='#0b3d91' stroke-width='2'/><rect x='145' y='115' width='15' height='15' fill='none' stroke='#0b3d91' stroke-width='1.5'/><path d='M 60,130 A 22,22 0 0 0 56,116' fill='none' stroke='#0b3d91' stroke-width='1.5'/><text x='62' y='122' font-size='14' fill='#0b3d91' font-family='serif'>θ</text><text x='90' y='75' font-size='14' fill='#0b3d91' font-family='serif'>(hyp)</text></svg>",
          options: [{letter:"A",text:"$\\dfrac{3}{5}$"},{letter:"B",text:"$\\dfrac{4}{5}$"},{letter:"C",text:"$\\dfrac{5}{4}$"},{letter:"D",text:"$\\dfrac{5}{3}$"}], correct: "B", spr: false },
        { id: 21, domain: "Geometry & Trigonometry", stem: "The circle shown in the $xy$-plane has equation $(x-2)^2 + (y+1)^2 = 25$. What is the length of its radius?",
          figureSvg: "<svg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'><line x1='20' y1='120' x2='220' y2='120' stroke='#94a3b8' stroke-width='1'/><line x1='120' y1='20' x2='120' y2='220' stroke='#94a3b8' stroke-width='1'/><polygon points='216,116 224,120 216,124' fill='#94a3b8'/><polygon points='116,24 120,16 124,24' fill='#94a3b8'/><text x='223' y='115' font-size='11' fill='#94a3b8'>x</text><text x='112' y='15' font-size='11' fill='#94a3b8'>y</text><circle cx='140' cy='130' r='50' fill='none' stroke='#0b3d91' stroke-width='2'/><circle cx='140' cy='130' r='3' fill='#0b3d91'/><text x='148' y='148' font-size='12' fill='#0b3d91' font-family='serif'>(2,−1)</text></svg>",
          options: null, spr: true, accept: ["5"] },
        { id: 22, domain: "Geometry & Trigonometry", stem: "The right circular cylinder shown has radius $3$ and height $10$. What is its volume? Use $\\pi \\approx 3.14$.",
          figureSvg: "<svg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'><ellipse cx='100' cy='50' rx='50' ry='14' fill='#fef3c7' stroke='#0b3d91' stroke-width='2'/><line x1='50' y1='50' x2='50' y2='170' stroke='#0b3d91' stroke-width='2'/><line x1='150' y1='50' x2='150' y2='170' stroke='#0b3d91' stroke-width='2'/><path d='M 50,170 A 50,14 0 0 0 150,170' fill='none' stroke='#0b3d91' stroke-width='2'/><path d='M 50,170 A 50,14 0 0 1 150,170' fill='none' stroke='#0b3d91' stroke-width='1.5' stroke-dasharray='4,4'/><line x1='100' y1='50' x2='150' y2='50' stroke='#0b3d91' stroke-width='1.5'/><text x='115' y='44' font-size='14' fill='#0b3d91' font-family='serif'>3</text><line x1='170' y1='50' x2='170' y2='170' stroke='#0b3d91' stroke-width='1.5'/><text x='176' y='115' font-size='14' fill='#0b3d91' font-family='serif'>10</text></svg>",
          options: [{letter:"A",text:"$60$"},{letter:"B",text:"$94.2$"},{letter:"C",text:"$188.4$"},{letter:"D",text:"$282.6$"}], correct: "D", spr: false }
      ]
    }
  }
};
