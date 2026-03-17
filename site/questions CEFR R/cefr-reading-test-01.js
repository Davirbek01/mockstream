// CEFR Reading Test 01
// 5 Parts, 35 Questions - B1/B2 Level

window.CEFR_READING_TEST = {
  testInfo: {
    title: "CEFR B1-B2-C1 Reading Test 01",
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
      instruction: "Read the texts. Fill in each gap with ONE word. You must use a word which is somewhere in the rest of the text.",
      passage: {
        title: "Dinosaur Sounds",
        content: `<p>There are many movies with dinosaurs making all kinds of noises. However, these <span class="gap" data-gap="1">_____(1)_____</span> are just guesses that movie directors make. A new discovery has given scientists a better idea of what dinosaurs sounded like. The <span class="gap" data-gap="2">_____(2)_____</span> examined a rare fossil from a dinosaur called an ankylosaur. The <span class="gap" data-gap="3">_____(3)_____</span> is 78 million years old. It includes a record of the ankylosaur's voice box. The scientists think the shape of the creature's <span class="gap" data-gap="4">_____(4)_____</span> box means it probably made bird-like sounds.</p>

<p>The research was led by a dinosaur researcher at the Fukushima Museum in Japan. He did many tests on the shape of the fossilized voice box. He compared it with the voice box of birds, crocodiles and turtles. He now has an idea of what the voice box muscles looked like. The <span class="gap" data-gap="5">_____(5)_____</span> controlled the sounds of the voice box. The research may mean that movies like Jurassic Park got it wrong. Tyrannosaurus rex probably made more of a tweeting sound, like a bird. Hollywood may have to change its scary roars in future dinosaur films to a <span class="gap" data-gap="6">_____(6)_____</span> sound.</p>`
      },
      questions: [
        { id: 1, hint: "These _____ are just guesses" },
        { id: 2, hint: "The _____ examined a rare fossil" },
        { id: 3, hint: "The _____ is 78 million years old" },
        { id: 4, hint: "creature's _____ box" },
        { id: 5, hint: "The _____ controlled the sounds" },
        { id: 6, hint: "change its scary roars to a _____ sound" }
      ],
      answers: {
        1: ["noises"],
        2: ["scientists"],
        3: ["fossil"],
        4: ["voice"],
        5: ["muscles"],
        6: ["tweeting"]
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
        { letter: "A", text: "Visitor can help to make one particular event a success at this festival." },
        { letter: "B", text: "People can listen to local musicians here." },
        { letter: "C", text: "At this festival, people can listen to music in lots of different places." },
        { letter: "D", text: "It is not necessary to pay for one of the events here." },
        { letter: "E", text: "It is possible to stay overnight at this festival." },
        { letter: "F", text: "Visitors can get advice here." },
        { letter: "G", text: "People can watch craftspeople at work here." },
        { letter: "H", text: "Learning what all the different sections of a plant do." },
        { letter: "I", text: "Seeing art showing plants from a different part of the world." },
        { letter: "J", text: "The possibility of having your work exhibited." }
      ],
      texts: [
        {
          number: 7,
          content: "From electronics to folk, jazz and classical, this festival is renowned for bringing world-class musicians to this historical city. Starting with a great night of free music, 'Party in the city' this year is going to be no exception."
        },
        {
          number: 8,
          content: "Often referred to as Europe's leading festival for new music, more than 300 bands will perform to around 10,000 people in 30-plus venues, meaning you are sure to see the next big thing in music."
        },
        {
          number: 9,
          content: "The much loved television series Springwatch celebrates the countryside as it does every year, with sheep herding, wood carving demonstrations, insect hunts and more activities, accompanied by live music and a great farmers' market, offering all sorts of mouth-watering produce."
        },
        {
          number: 10,
          content: "Rightly nominated for the best family festival award every year since it began in 2005, this festival offers a combination of different music genres—many featuring artists from around the Wychwood area—and comedy, alongside a selection of outdoor cafes serving amazing world foods."
        },
        {
          number: 11,
          content: "Bringing together a selection of the finest produce, this festival aims to educate visitors about how food should be produced and where it should come from, through sampling a range of tasty treats, cooked on site."
        },
        {
          number: 12,
          content: "The UK's most magical, this is a three-day festival of folk art, live music and fashion shows set in the beautiful wild surroundings of Bodmin Moor. If you don't fancy taking a tent, some local residents usually offer to put visitors up."
        },
        {
          number: 13,
          content: "Featuring demonstrations from world champion dancers and star from the TV series Strictly Come Dancing, the festival promises toe tapping action, including a world record attempt, where everyone is invited to join in."
        },
        {
          number: 14,
          content: "Visit our exciting and colourful exhibition of South American botanical paintings, which brings the continent's exotic and lush plants to life in works from two hundred years ago and from this century."
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
        7: ["D"],
        8: ["C"],
        9: ["G"],
        10: ["B"],
        11: ["A"],
        12: ["E"],
        13: ["A"],
        14: ["I"]
      },
      extraStatements: ["F", "J"]
    },

    // ===== PART 3: Matching Headings =====
    {
      partNumber: 3,
      title: "Part 3",
      type: "matching-headings",
      questionRange: "15-20",
      instruction: "Read the text and choose the correct heading for each paragraph from the list of headings below. There are more headings than paragraphs, so you will not use all of them. You cannot use any heading more than once. Mark your answers on the answer sheet.",
      headings: [
        { letter: "A", text: "Beautiful money" },
        { letter: "B", text: "Ideal indeed" },
        { letter: "C", text: "Rose family traits" },
        { letter: "D", text: "Discovering origins" },
        { letter: "E", text: "Many choices" },
        { letter: "F", text: "A flower of luxury" },
        { letter: "G", text: "A flower of conflict" },
        { letter: "H", text: "A symbol for all times" }
      ],
      passage: {
        title: "THE BEAUTIFUL ROSE",
        paragraphs: [
          {
            number: "I",
            questionId: 15,
            content: "The rose is the most deeply ingrained flower in human history and human culture. It has been immortalised and integrated into music, festivals, poetry and even wars. It has been used as a sign of passion as well as grief. It is also the sign of human love, given on different occasions. William Shakespeare surely immortalised the rose for the world in 1597, in his play \"Romeo and Juliet\", when Juliet so passionately said, \"What's in a name? That which we call a rose. By any other name would smell as sweet.\""
          },
          {
            number: "II",
            questionId: 16,
            content: "All species of roses are naturally found throughout the Northern Hemisphere. Some 150 wild species are spread worldwide, from Alaska to Mexico, from Northern Africa to China. All roses are close relatives of cherries, apples, pears, raspberries, and plums. Most species of roses have long been cultivated for their hips, the fruit of the rose flower that has nutritional and medicinal value. A unique characteristic of all species of roses is its ability to bloom over and over again, from early summer to late autumn."
          },
          {
            number: "III",
            questionId: 17,
            content: "The Romans at first believed that the rose was useful as a source of natural medicines. Soon, the beautiful flowers became necessities at Roman festivals. Roman emperors demanded that their baths be filled with rose water, and they reclined on carpets of rose petals during their feasts. Perfumes made from roses became a high-priority treasure for the ruling elite, and it resulted in hardships among the peasant class, who were forced to grow roses instead of cultivating much needed food."
          },
          {
            number: "IV",
            questionId: 18,
            content: "During the 15th century in England, the rose became the symbol of war between two families, both of whom had laid claim to the English crown. The War of the Roses lasted for 30 years and involved the House of York, whose symbol was the white rose, and the House of Lancaster, whose symbol was the red rose. Only in 1486, King Henry VII of the House of Lancaster, who was the first Tudor king, married Elizabeth of York, uniting the families and finally bringing the English civil war to an end."
          },
          {
            number: "V",
            questionId: 19,
            content: "In the 17th century, the rose became so valuable across Europe that it along with rose water was often used as currency. Roses were used to barter in market places across Europe, and commoners could pay their taxes to kings using roses and rose water. Josephine, wife of the Emperor Napoleon Bonaparte, created a great rose garden on the edge of Paris that contained over 200 varieties of the cherished rose. Most of the roses of Europe at that time were shades of pink or white until the early 19th century."
          },
          {
            number: "VI",
            questionId: 20,
            content: "Roses have always been extremely popular all over the world, and fossil records show the presence of ancient roses in the Tertiary Period, which began about 70 million years ago. Where, exactly, first roses appeared is still unknown. It is often believed that roses were probably first cultivated in the royal gardens of ancient China about 5,000 years ago. In Ur, an ancient city of Mesopotamia, 3,000-year-old clay tablets contain the first known written reference about roses growing in gardens of the city."
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
        15: ["H"],
        16: ["C"],
        17: ["F"],
        18: ["G"],
        19: ["A"],
        20: ["D"]
      },
      extraHeadings: ["B", "E"]
    },

    // ===== PART 4: MCQ + True/False/No Information =====
    {
      partNumber: 4,
      title: "Part 4",
      type: "reading-comprehension",
      questionRange: "21-29",
      instruction: "Read the following text for questions 21-29.",
      passage: {
        title: "Icon's Life",
        content: `<p>Hillary Clinton is certainly the incarnation of the dreams of many American women of her generation. She has got "everything": a family, a fine career, and a husband who not only supports her and approves of what she does, but also allows her to use her talents to the full. Hillary Rodham was born in Chicago in 1947, the daughter of a textile manufacturer. Her family was comfortably off, but not rich; she had two brothers, and her mother did not work.</p>

<p>At school, she was always a brilliant student, though not the kind of girl who spent all her time in her books. On the contrary, she spent a lot of time on outside activities, something which is always greatly appreciated in American schools. It was while she was still at high school that Hillary began to take an interest in social issues, working in the poorer districts of town among immigrant families, and helping them to participate in elections. After graduating from high school, she went on to study at Wellesley College, one of the best universities on the East Coast, where she was elected President of the Students' Union. Photos taken at the time show her as a fairly plump young woman, dressed in rather shapeless clothes, and wearing large glasses. Looking smart was not one of her major concerns.</p>

<p>It was at Yale Law School that Hillary first met Bill Clinton, a good-looking young man who, in spite of his reputation as a dilettante, was actually one of the brightest students in his year. The legend says that Bill finally "noticed" Hillary because she spoke so well. At the time, Hillary was actively involved in the Women's Liberation movement, and seemed to be much more interested in her career than in marriage. When, several years later, she was asked how it was that, after a long-complicated relationship, she finally ended up marrying Bill Clinton, she answered: "Because he was the only guy I dated who wasn't afraid of me!"</p>

<p>Meanwhile, while Bill had gone back to his native Arkansas, intending to follow a career in politics, Hillary became a brilliant lawyer in Washington, where she took part in the famous Watergate hearings. Though several major firms of lawyers asked her to join them, she decided in 1973 to leave Washington and join Bill in Arkansas. They got married in 1975, and Hillary joined a firm of lawyers in Little Rock (the capital of Arkansas). In 1979, at the age of 32, Bill Clinton was elected Governor of Arkansas, becoming the youngest state Governor in the U.S.A. A year later, Hillary gave birth to their daughter Chelsea, named after a favorite hit song of the 1960's. During Bill's twelve years in office as Governor of Arkansas, Hillary helped him to radically reform the state's public-school system, and establish a school medical welfare system that had no equivalent anywhere else in the United States.</p>

<p>As a solitary concession to the powerful conservative lobby in the Deep South, who were not accustomed to seeing wives working in partnership with their husbands, she agreed to add her husband's name to her own, and be called Hillary Rodham Clinton just to show that she really was married. She also changed her look, began to dress more smartly, did what was necessary and replaced her glasses with contact lenses. She was ready for Washington.</p>`
      },
      questionSections: [
        {
          type: "mcq",
          title: "Questions 21-24: Multiple Choice",
          instruction: "For questions 21-24, choose the correct answer A, B, C, or D. Mark your answers on the answer sheet.",
          questions: [
            {
              id: 21,
              text: "Hillary was a bright learner at school who ……",
              options: [
                { letter: "A", text: "was busy with trade" },
                { letter: "B", text: "had good handwriting skills" },
                { letter: "C", text: "was always busy with social interactions" },
                { letter: "D", text: "had few friends and reserved" }
              ]
            },
            {
              id: 22,
              text: "She was a fairly chubby young woman……",
              options: [
                { letter: "A", text: "wearing oversized glasses and formless clothing" },
                { letter: "B", text: "with reserved character" },
                { letter: "C", text: "with classical output and hat" },
                { letter: "D", text: "with looking smart lady" }
              ]
            },
            {
              id: 23,
              text: "Bill had returned to his native Arkansas at the time with plans….",
              options: [
                { letter: "A", text: "to finance his deputy" },
                { letter: "B", text: "to collaborate with native land" },
                { letter: "C", text: "to pursue a career in politics" },
                { letter: "D", text: "to start his new life" }
              ]
            },
            {
              id: 24,
              text: "A program specialized for school medical services was implemented by ….",
              options: [
                { letter: "A", text: "Bill Clinton" },
                { letter: "B", text: "Hillary Rodham" },
                { letter: "C", text: "a group of lawyers" },
                { letter: "D", text: "the governor of Arkansas" }
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
              text: "Hillary and Bill contributed actively in the struggle for women's liberation."
            },
            {
              id: 26,
              text: "Chelsea got her name from a popular 1960s hit song."
            },
            {
              id: 27,
              text: "Bill Clinton rejected to become the youngest state governor in American history when he was appointed governor of Arkansas at the age of thirty-two."
            },
            {
              id: 28,
              text: "At Students Union, Hillary encountered a handsome young man named Bill Clinton for the first time."
            },
            {
              id: 29,
              text: "Every year, the Students Union recognized the most distinguished individuals in the field with scholarships."
            }
          ]
        }
      ],
      answers: {
        21: ["C", "was always busy with social interactions"],
        22: ["A", "wearing oversized glasses and formless clothing"],
        23: ["C", "to pursue a career in politics"],
        24: ["B", "Hillary Rodham"],
        25: ["True"],
        26: ["True"],
        27: ["False"],
        28: ["False"],
        29: ["No Information"]
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
        title: "Rodeo",
        content: `<p>At 1 p.m. the air is still, heavy with a confusion of smells that drifts among the stalls and the barbeques, the animal enclosures and the ice-cream vendors. In the hot midday sun, the fair throngs with visitors, but there's little shade to sit in, just narrow strips of shadow alongside the buildings and the tents. All around, the music is playing while kids run riot and stall-holders beckon passing visitors with their colorful displays. Then, as the time moves towards 2.30, there is a new sense of excitement in the air: people are no longer moving round randomly, but heading in the same direction, towards the dusty arena to the south of the showground. It's almost time for the rodeo! Here at last there is shade for everyone: the grandstand, with its tiered seating, rapidly fills up, as thousands of fair-goers pile in, eager for a good view of the excitement that is soon to begin.</p>

<p>For some people it has already begun. Microlight kids on minuscule ponies are cavorting round the empty arena, while a handful of cowboys impeccably trained horses, walk or trot sedately round the ring. Suddenly a little blonde girl, hardly four feet tall, careers into view, riding bareback at the speed of light on bright white pony. No-one pays much attention. The folk in the stands are too busy talking about horses and rodeo-riders, discussing the last rodeo, predicting the winners of the next. Somehow, as someone who has not been brought up in the company of horses, I feel slightly out of place, as if everyone here except me knows everything about what is going on.</p>

<p>I had been to a couple of rodeos before, including the biggest of them all, Canada's Calgary Stampede; but the other rodeos I had been to were put on for the tourists. Not this one; in central Oregon, there are few tourists. Rodeos here are for the locals, people who know them and understand them; most of the folk round me are from Redmond, or Prineville or Madras or Bend, certainly not from Europe! Then action: suddenly the gates at the end of the arena burst open, and a posse of flag-carrying girls erupts into view, circling the arena in formation on shining dark ponies. Dressed in patriotic red white and blue, courtesy of Pepsi-Cola, the girls come to a stop in the middle of the ring, as the crowd rise to their feet, the men take off their Stetson hats, and everyone joins in the singing of God Bless America.</p>

<p>The rodeo has begun! For the next couple of hours, spectators watch with excitement as local heroes perform feats of dexterity on the backs of bucking animals! While some show their skills at calf roping — catching a running calf with a lasso and tying it up in just a few seconds — others demonstrate their daredevil skills by riding untamed broncos or bounding round on the backs of enormous raging bulls. As intrepid riders master for all of their wild mounts, the crowd cheer wildly or in apprehension, then burst into laughter as the obligatory clown, the matador of the rodeo, distracts the attention of the raging animals while mounted cowboys round them up and calm them down, coaxing them away into the pens from which they originally emerged, their day's work finished.</p>

<p>Katie Sharpe, 21, the local Rodeo Queen, does a lap of honor, then participates in the ladies' events; but in this macho part of the world, the ladies do not get to pit themselves against untamed bulls and broncos! That's men's stuff! Katie and the other young ladies show their skills at "barrel racing", hurling their horses at breakneck speed round a triangular shaped race-course, marked out with barrels, in the middle of the arena. It's not as dramatic as bull-riding, but it's exciting, and the crowd roar their approval.</p>

<p>As the sun falls lower in the sky and the shadows begin to lengthen, the final rounds of calf-roping and saddle-bronc riding bring another half hour of thrills and spills before the commentator finally announces that the Rodeo is drawing to an end. The last prizes are handed out, the last riders leave the arena, and the show is over. As the spectators pick up their belongings and move slowly towards the exits, the kids on their ponies come back again for another few minutes as imaginary champions, tomorrow's local heroes in the arena of the stars. Here, it seems, if rodeo does not flow in the blood, at least it's all in the family.</p>`
      },
      questionSections: [
        {
          type: "gap-fill",
          title: "Questions 30-33: Gap Filling Section",
          instruction: "Fill in the missing information in the numbered spaces. Write no more than ONE WORD and/or A NUMBER for each question.",
          summaryText: `<p>Microlight kids were involved in their lovely sport in an empty arena, whereas horses were trained by <span class="gap-input" data-gap="30">_____(30)_____</span> around the ring. All young boys standing discussing winners, sharing their ideas with others around the ring came all around the continent except <span class="gap-input" data-gap="31">_____(31)_____</span>. God Bless America was played in the arena by young fellows not wearing their <span class="gap-input" data-gap="32">_____(32)_____</span> hats, with red white and blue outfits mostly, like brand drinks color. During the rodeo different performance were acted with many spectators by showing their talents to rope calf with a <span class="gap-input" data-gap="33">_____(33)_____</span> riding untamed bulls and broncs.</p>`,
          questions: [
            { id: 30, hint: "horses were trained by _____" },
            { id: 31, hint: "all around the continent except _____" },
            { id: 32, hint: "not wearing their _____ hats" },
            { id: 33, hint: "rope calf with a _____" }
          ]
        },
        {
          type: "mcq",
          title: "Questions 34-35: Multiple Choice",
          instruction: "Choose the correct answer A, B, C, or D. Mark your answers on the answer sheet.",
          questions: [
            {
              id: 34,
              text: "Katie Sharpe, who was the local Rodeo Queen, demonstrated her talents by acting all types of rodeo apart from ….",
              options: [
                { letter: "A", text: "calf roping" },
                { letter: "B", text: "saddle-bronc riding" },
                { letter: "C", text: "triangular shaped race-course" },
                { letter: "D", text: "dexterity on the backs" }
              ]
            },
            {
              id: 35,
              text: "Who turns up in the arena when there is a failure with wild mounts?",
              options: [
                { letter: "A", text: "former cowboys" },
                { letter: "B", text: "spectators roar" },
                { letter: "C", text: "clowns" },
                { letter: "D", text: "rodeo-riders" }
              ]
            }
          ]
        }
      ],
      answers: {
        30: ["cowboys"],
        31: ["Europe"],
        32: ["Stetson"],
        33: ["lasso"],
        34: ["C", "triangular shaped race-course"],
        35: ["C", "clowns"]
      }
    }
  ]
};
