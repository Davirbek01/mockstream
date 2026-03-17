// IELTS Listening Test 01
// 4 Sections, 40 Questions

window.IELTS_LISTENING_TEST = {
  testInfo: {
    id: "ielts-listening-test-01",
    title: "IELTS Listening Practice Test 01",
    totalTime: 40,
    totalQuestions: 40
  },
  parts: [
    // ===== SECTION 1: Form Completion =====
    {
      partNumber: 1,
      title: "Section 1",
      type: "gap-fill-form",
      questionRange: "1-10",
      instruction: "Write ONE WORD AND/OR A NUMBER for each answer.",
      audioFile: "https://storage.googleapis.com/mockstream-listening-audio/IELTS%20listening/test1/Test%201%20Part%201.mp3",
      transcript: "Narrator: IELTS 19, published by Cambridge University Press and Assessment, 2024. This recording is copyright.\n\nTest one. This is the IELTS listening test.\n\nYou will hear a number of different recordings and you will have to answer questions on what you hear. There will be time for you to read the instructions and questions and you will have a chance to check your work.\n\nAll the recordings will be played once only. The test is in four parts. At the end of the test, you will be given 10 minutes to transfer your answers to an answer sheet.\n\nNow turn to part one.\n\nPart one. You will hear a teaching assistant calling a country park about a school visit. First, you have some time to look at questions 1 to 6.\n\n[pause]\n[pause]\n[pause]\n[pause]\n\nSpeaker 1: to of our classes.\nSpeaker 2: Okay. What would you like to know?\nSpeaker 1: Well, I'm new to this area. So perhaps you could tell me something about the park first, please.\nSpeaker 2: Of course. All together, the park covers 170 acres. That's 69 hectares. There are three main types of habitat: wetland, grassland, and woodland. The woods are well established and varied with an oak plantation and other areas of mixed species.\nSpeaker 1: Right.\nSpeaker 2: The wetland is quite varied too. The original farmland was dug up around 40 years ago to extract gravel. Once this work was completed, the gravel pits filled with water, forming the two large lakes. There are also several smaller ones, ponds and a stream that flows through the park.\nSpeaker 1: Okay, so I suppose with these different habitats, there's quite a variety of wildlife.\nSpeaker 2: There certainly is. A lot of different species of birds and insects, and also animals like deer and rabbits.\nSpeaker 1: And I understand you organize educational visits for school parties.\nSpeaker 2: That's right. We can organize a wide range of activities and adapt them to suit all ages.\nSpeaker 1: Can you give me some examples of the activities?\nSpeaker 2: Well, one focus is on science, where we help children to discover and study plants, trees and insects. They also collect and analyze data about the things they see.\nSpeaker 1: Uh-huh.\nSpeaker 2: Another focus is on geography. The park is a great environment to learn and practice reading a map and using a compass to navigate around the park.\nSpeaker 1: Do you do anything connected with history?\nSpeaker 2: Yes, we do. For instance, the children can explore how the use of the land has changed over time. Then there's leisure and tourism.\nSpeaker 1: That focuses on your visitors, I would imagine.\nSpeaker 2: Yes, mostly. The children find out about them, their requirements, the problems they may cause, and how we manage these. And another subject we cover is music. Here the children experiment with natural materials to create sounds and explore rhythm and tempo.\nSpeaker 1: That must be fun.\nSpeaker 2: Most children really enjoy it.\n\nNarrator: Before you hear the rest of the conversation, you have some time to look at questions 7 to 10.\n\n[pause]\n\nNarrator: Now listen and answer questions 7 to 10.\n\nSpeaker 2: And of course, all the activities are educational too. Learning outside the classroom encourages children to be creative and to explore and discover for themselves.\nSpeaker 1: I would imagine they get a sense of freedom that might not be a normal part of their lives.\nSpeaker 2: That's right. And very often, the children discover that they can do things they didn't know they could do, and they develop new skills. This gives them greater self-confidence.\nSpeaker 1: It sounds great. So, what about the practical side of it? How much does it cost for a full day visit? We would expect to bring between 30 and 40 children.\nSpeaker 2: If there are over 30, it costs £4.95 for each child who attends on the day. We invoice you afterwards, so you don't pay for children who can't come because of sickness, for example. There's no charge for leaders and other adults, as many as you want to bring.\nSpeaker 1: That sounds very fair. Well, thanks for all the information. I'll need to discuss it with my colleagues and I hope to get back to you soon to make a booking.\nSpeaker 2: We'll look forward to hearing from you. Goodbye.\nSpeaker 1: Goodbye, and thank you.\n\nNarrator: That is the end of part one. You now have one minute to check your answers to part one.\n\n[pause]\n[pause]\n[pause]\n[pause]\n[pause]\n[pause]\n[pause]\n[pause]\n[pause]",
      formTitle: "Hinchingbrooke Country Park",
      formContent: [
        { type: "heading", text: "The park" },
        { type: "item-gap", text: "Area: ", gapId: 1, gapSuffix: " hectares" },
        { type: "item", text: "Habitats: wetland, grassland and woodland" },
        { type: "item-gap", text: "Wetland: lakes, ponds and a ", gapId: 2 },
        { type: "item", text: "Wildlife includes birds, insects and animals" },
        { type: "heading", text: "Subjects studied in educational visits include" },
        { type: "item-gap", text: "Science: Children look at ", gapId: 3, gapSuffix: " about plants, etc." },
        { type: "item-gap", text: "Geography: includes learning to use a ", gapId: 4, gapSuffix: " and compass" },
        { type: "item", text: "History: changes in land use" },
        { type: "item-gap", text: "Leisure and tourism: mostly concentrates on the park's ", gapId: 5 },
        { type: "item-gap", text: "Music: Children make ", gapId: 6, gapSuffix: " with natural materials, and experiment with rhythm and speed." },
        { type: "heading", text: "Benefits of outdoor educational visits" },
        { type: "item-gap", text: "They give children a feeling of ", gapId: 7, gapSuffix: " that they may not have elsewhere." },
        { type: "item-gap", text: "Children learn new ", gapId: 8, gapSuffix: " and gain self-confidence." },
        { type: "heading", text: "Practical issues" },
        { type: "item-gap", text: "Cost per child: £ ", gapId: 9 },
        { type: "item-gap", text: "Adults, such as ", gapId: 10, gapSuffix: ", free" }
      ],
      questions: [
        { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 },
        { id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }, { id: 10 }
      ],
      answers: {
        1: ["69", "sixty-nine"],
        2: ["stream"],
        3: ["data"],
        4: ["map"],
        5: ["visitors"],
        6: ["sounds"],
        7: ["freedom"],
        8: ["skills"],
        9: ["4.95"],
        10: ["leaders"]
      },
      answerHighlights: {
        1: [20],
        2: [22],
        3: [28],
        4: [30],
        5: [33],
        6: [34],
        7: [45],
        8: [46],
        9: [48],
        10: [48]
      }
    },

    // ===== SECTION 2: Mixed (MCQ + Map) =====
    {
      partNumber: 2,
      title: "Section 2",
      type: "mixed",
      questionRange: "11-20",
      instruction: "You will hear a representative from a Twinning Association talking to some people. Choose the correct letter, A, B or C.",
      audioFile: "https://storage.googleapis.com/mockstream-listening-audio/IELTS%20listening/test1/Test%201%20Part%202.mp3",
      transcript: "Narrator: Part two.\nYou will hear the chairman of Stanthorpe Twinning Association, which organizes the link between Stanthorpe in England and a town in France, talking to members about the year's events.\nFirst, you have some time to look at questions 11 to 15.\nNow listen carefully and answer questions 11 to 15.\n\nSpeaker 1: It's great to see so many members of the twinning association here tonight.\nSince the twinning link between our two towns, Stanthorpe, here in England, and Malat in France, was established, the relationship between the towns has gone from strength to strength.\nLast month, 25 members of the association from Stanthorpe spent a weekend in Malat.\nOur hosts had arranged a great program.\nWe learned how cheese is produced in the region and had the chance to taste the product.\nThe theme park trip had to be canceled, but we all had a great time on the final boat trip down the river. That was the real highlight.\nThis is a special year for the association, because it's 25 years since we were founded.\nIn Malat, they're planning to mark this by building a footbridge in the municipal park.\nWe've been discussing what to do here, and we've decided to plant a poplar tree in the museum gardens.\nWe considered buying a garden seat to put there, but the authorities weren't happy with that idea.\nIn terms of fundraising to support our activities, we've done very well.\nOur pancake evening was well attended and made record profits.\nAnd everyone enjoyed the demonstration of French cookery, which was nearly as successful.\nNumbers for our film show were limited because of the venue, so we're looking for somewhere bigger next year.\nWe're looking forward to welcoming our French visitors here next week, and I know that many of you here will be hosting individuals or families.\nThe coach from France will arrive at 5:00 p.m. on Friday.\nDon't try to do too much that first evening, as they'll be tired.\nSo, have dinner in the house or garden rather than eating out.\nThe weather looks as if it'll be okay, so you might like to plan a barbecue.\nThen, the next morning's market day in town, and that's always a good place to stroll round.\nOn Saturday evening, we'll all meet up at the football club, where once again we'll have Toby Sharp and his band performing English and Scottish country songs.\nToby will already be well known to many of you, as last year he organized our special quiz night and presented the prizes.\n\nNarrator: Before you hear the rest of the talk, you have some time to look at questions 16 to 20.\n\nNow listen and answer questions 16 to 20.\n\nSpeaker 1: Now, on Sunday, we'll be taking our visitors to Farly House.\nYou may not all be familiar with it, so here's a map to help you.\nYou can see the car park at the bottom of the map.\nThere's an excellent farm shop in the grounds where our visitors can buy local produce. It's in the old stables, which is the first building you come to.\nThey're built round a courtyard, and the shop's in the far corner on the left.\nThere's also a small cafe on the right as you go in.\nI know that one or two of our visitors may not be all that mobile.\nThe main entrance to the house has a lot of steps, so you might want to use the disabled entry.\nThis is on the far side of the house from the car park.\nChildren will probably be most interested in the adventure playground.\nThat's at the northern end of the larger lake, in a bend on the path that leads to the lake.\nThere's lots for children to do there.\nThere are a number of lovely gardens near the house.\nThe kitchen gardens are rectangular and surrounded by a wall.\nThey're to the northeast of the house, quite near the smaller lake.\nThey're still in use and have a great collection of fruit and vegetables.\nThe Temple of the Four Winds is a bit more of a walk, but it's worth it.\nTake the path from the car park and go past the western sides of the stables and the house.\nThen, when the path forks, take the right-hand path.\nGo up there with the woods on your left, and the temple is right at the end.\nThere are great views over the whole area.\nOkay, so that's the\n\nNarrator: That is the end of part two.\nYou now have 30 seconds to check your answers to part two.",
      subParts: [
        {
          type: "mcq-extracts",
          instruction: "Choose the correct letter, A, B or C.",
          extracts: [
            {
              title: "Stanthorpe Twinning Association",
              questions: [
                {
                  id: 11,
                  text: "During the visit to Malatte, in France, members especially enjoyed",
                  options: [
                    { letter: "A", text: "going to a theme park." },
                    { letter: "B", text: "experiencing a river trip." },
                    { letter: "C", text: "visiting a cheese factory." }
                  ]
                },
                {
                  id: 12,
                  text: "What will happen in Stanthorpe to mark the 25th anniversary of the Twinning Association?",
                  options: [
                    { letter: "A", text: "A tree will be planted." },
                    { letter: "B", text: "A garden seat will be bought." },
                    { letter: "C", text: "A footbridge will be built." }
                  ]
                },
                {
                  id: 13,
                  text: "Which event raised most funds this year?",
                  options: [
                    { letter: "A", text: "the film show" },
                    { letter: "B", text: "the pancake evening" },
                    { letter: "C", text: "the cookery demonstration" }
                  ]
                },
                {
                  id: 14,
                  text: "For the first evening with the French visitors host families are advised to",
                  options: [
                    { letter: "A", text: "take them for a walk round the town." },
                    { letter: "B", text: "go to a local restaurant." },
                    { letter: "C", text: "have a meal at home." }
                  ]
                },
                {
                  id: 15,
                  text: "On Saturday evening there will be the chance to",
                  options: [
                    { letter: "A", text: "listen to a concert." },
                    { letter: "B", text: "watch a match." },
                    { letter: "C", text: "take part in a competition." }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: "map-labeling",
          instruction: "Label the map below. Write the correct letter, A-H, next to Questions 16-20.",
          mapTitle: "Farley House",
          mapImage: "https://storage.googleapis.com/mockstream-listening-audio/IELTS%20listening/test1/map1.png",
          mapLabels: ["A", "B", "C", "D", "E", "F", "G", "H"],
          questions: [
            { id: 16, place: "Farm shop" },
            { id: 17, place: "Disabled entry" },
            { id: 18, place: "Adventure playground" },
            { id: 19, place: "Kitchen gardens" },
            { id: 20, place: "The Temple of the Four Winds" }
          ]
        }
      ],
      answers: {
        11: ["B"], 12: ["A"], 13: ["B"], 14: ["C"], 15: ["A"],
        16: ["G"], 17: ["C"], 18: ["B"], 19: ["D"], 20: ["A"]
      },
      answerHighlights: {
        11: [10],
        12: [13, 14],
        13: [16],
        14: [21, 22],
        15: [25, 26],
        16: [35, 36],
        17: [39, 40],
        18: [41, 42],
        19: [45, 46],
        20: [49, 50, 51]
      }
    },

    // ===== SECTION 3: Mixed (MCQ + Matching) =====
    {
      partNumber: 3,
      title: "Section 3",
      type: "mixed",
      questionRange: "21-30",
      instruction: "Choose TWO letters, A-E.",
      audioFile: "https://storage.googleapis.com/mockstream-listening-audio/IELTS%20listening/test1/Test%201%20Part%203.mp3",
      transcript: "Narrator: Part three. You will hear two food science students called Marie and Colin, discussing their final year projects. First, you have some time to look at questions 21 to 24. \nNow listen carefully and answer questions 21 to 24.\nMarie: I haven't seen you for a bit, Marie.\nColin: No. I've been busy with my project.\nMarie: You're making a vegan alternative to eggs, aren't you? Something that doesn't use animal products.\nColin: Yes. I'm using chickpeas. I had two main aims when I first started looking for an alternative to eggs, but actually, I've found chickpeas have got more advantages.\nMarie: Right. But how about your project on reusing waste food? You were looking at bread, weren't you?\nColin: Yes. It's been hard work, but I've enjoyed it. The basic process was quite straightforward, breaking the stale bread down to a paste, then reforming it.\nMarie: But you were using 3D printing, weren't you, to make the paste into biscuits?\nColin: Yeah, I'd used that before, but in this project, I had time to play around with different patterns for the biscuits, and finding how I could add fruit and vegetables to make them a more appetizing color. And I was really pleased with what I managed to produce.\nMarie: It must have been a great feeling to make something appetizing out of bits of old bread that would have been thrown away otherwise.\nColin: It was, and I'm hoping that some of the restaurants in town will be interested in the biscuits. I'm going to send them some samples.\nMarie: I came across something on the internet yesterday that might interest you. It was a company that's developed touch sensitive senses for food labels.\nColin: Mm.\nMarie: It's a special sort of label on the food package. When the label's smooth, the food is fresh, and then when you can feel bumps on the label, that means the food's gone bad. It started off as a project to help visually impaired people know whether food was fit to eat or not.\nColin: Interesting. So, just solid food?\nMarie: No. Things like milk and juice as well. But actually, I thought it might be really good for drug storage in hospitals and pharmacies.\nColin: Right. And coming back to food, maybe it would be possible to use it for other things besides freshness, like how many kilograms a joint of meat is, for example.\nMarie: Yes. There's all sorts of possibilities.\nNarrator: Before you hear the rest of the discussion, you have some time to look at questions 25 to 30.\nNow listen and answer questions 25 to 30.\nColin: I was reading an article about food trends, predicting how eating habits might change in the next few years.\nMarie: Oh, things like more focus on local products. That seems so obvious, but the shops are still full of imported foods.\nColin: Yes, they need to be more proactive to address that.\nMarie: And somehow motivate consumers to change. Yes.\nColin: One thing everyone's aware of is the need for a reduction in unnecessary packaging, but just about everything you buy in supermarkets is still covered in plastic. The government needs to do something about it.\nMarie: Absolutely. It's got to change.\nColin: Do you think there'll be more interest in gluten and lactose free food?\nMarie: For people with allergies or food intolerances? I don't know. Lots of people I know have been buying that type of food for years now.\nColin: Yes, even if they haven't been diagnosed with an allergy.\nMarie: That's right. One thing I've noticed is the number of branded products related to celebrity chefs. People watch them cooking on TV and then buy things like spice mixes or frozen foods with the chef's name on. I bought something like that once, but I went again.\nColin: Yeah, I bought a ready-made spice mix for chicken, which was supposed to be used by a chef I'd seen on television, and it didn't actually taste of anything.\nMarie: Hmm. Did the article mention ghost kitchens used to produce takeaway food?\nColin: No. What are they?\nMarie: Well, they might have the name of a restaurant, but actually, they're a cooking facility just for delivery meals. The public don't ever go there. But people aren't aware of that. It's all kept very quiet.\nColin: So people don't realize the food's not actually from the restaurant.\nMarie: Right. Hmm. Did you know more and more people are using all sorts of different mushrooms now to treat different health concerns, things like heart problems.\nColin: Hmm, they might be taking a big risk there.\nMarie: Yes, it's hard to know which varieties are safe to eat.\nColin: Anyway, maybe now we should\n\nNarrator: That is the end of part three. You now have 30 seconds to check your answers to part three.",
      subParts: [
        {
          type: "mcq-extracts",
          instruction: "Choose TWO letters, A-E.",
          extracts: [
            {
              title: "Bread Reuse Project",
              questions: [
                {
                  id: 21,
                  text: "Which TWO things did Colin find most satisfying about his bread reuse project? (Choice 1)",
                  options: [
                    { letter: "A", text: "receiving support from local restaurants" },
                    { letter: "B", text: "finding a good way to prevent waste" },
                    { letter: "C", text: "overcoming problems in a basic process" },
                    { letter: "D", text: "experimenting with designs and colours" },
                    { letter: "E", text: "learning how to apply 3-D printing" }
                  ]
                },
                {
                  id: 22,
                  text: "(Choice 2)",
                  options: [
                    { letter: "A", text: "receiving support from local restaurants" },
                    { letter: "B", text: "finding a good way to prevent waste" },
                    { letter: "C", text: "overcoming problems in a basic process" },
                    { letter: "D", text: "experimenting with designs and colours" },
                    { letter: "E", text: "learning how to apply 3-D printing" }
                  ]
                }
              ]
            },
            {
              title: "Food Label Sensors",
              questions: [
                {
                  id: 23,
                  text: "Which TWO ways do the students agree that touch-sensitive sensors for food labels could be developed in future? (Choice 1)",
                  options: [
                    { letter: "A", text: "for use on medical products" },
                    { letter: "B", text: "to show that food is no longer fit to eat" },
                    { letter: "C", text: "for use with drinks as well as foods" },
                    { letter: "D", text: "to provide applications for blind people" },
                    { letter: "E", text: "to indicate the weight of certain foods" }
                  ]
                },
                {
                  id: 24,
                  text: "(Choice 2)",
                  options: [
                    { letter: "A", text: "for use on medical products" },
                    { letter: "B", text: "to show that food is no longer fit to eat" },
                    { letter: "C", text: "for use with drinks as well as foods" },
                    { letter: "D", text: "to provide applications for blind people" },
                    { letter: "E", text: "to indicate the weight of certain foods" }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: "matching-speakers",
          instruction: "What is the students' opinion about each of the following food trends? Choose SIX answers from the box and write the correct letter, A-H, next to Questions 25-30.",
          speakers: [
            { id: 25, label: "Use of local products" },
            { id: 26, label: "Reduction in unnecessary packaging" },
            { id: 27, label: "Gluten-free and lactose-free food" },
            { id: 28, label: "Use of branded products related to celebrity chefs" },
            { id: 29, label: "Development of 'ghost kitchens' for takeaway food" },
            { id: 30, label: "Use of mushrooms for common health concerns" }
          ],
          options: [
            { letter: "A", text: "This is only relevant to young people." },
            { letter: "B", text: "This may have disappointing results." },
            { letter: "C", text: "This already seems to be widespread." },
            { letter: "D", text: "Retailers should do more to encourage this." },
            { letter: "E", text: "More financial support is needed for this." },
            { letter: "F", text: "Most people know little about this." },
            { letter: "G", text: "There should be stricter regulations about this." },
            { letter: "H", text: "This could be dangerous." }
          ]
        }
      ],
      answers: {
        21: ["B", "D"], 22: ["B", "D"], 23: ["A", "E"], 24: ["A", "E"],
        25: ["D"], 26: ["G"], 27: ["C"], 28: ["B"], 29: ["F"], 30: ["H"]
      },
      answerHighlights: {
        21: [9],
        22: [10],
        23: [17],
        24: [16],
        25: [9],
        26: [25],
        27: [7],
        28: [10],
        29: [35],
        30: [37]
      }
    },

    // ===== SECTION 4: Sentence Completion =====
    {
      partNumber: 4,
      title: "Section 4",
      type: "gap-fill-form",
      questionRange: "31-40",
      instruction: "Write ONE WORD ONLY for each answer.",
      audioFile: "https://storage.googleapis.com/mockstream-listening-audio/IELTS%20listening/test1/Test%201%20Part%204.mp3",
      transcript: "Narrator: Part four. You will hear an archaeology student giving a presentation on an important site in Ireland called the Cagey fields. First, you have some time to look at questions 31 to 40. Now listen carefully and answer questions 31 to 40.\nSpeaker 1: For my presentation today, I'm going to talk about the Cagey fields in the northwest of Ireland, one of the largest Neolithic sites in the world. I recently visited this site and observed the work that is currently being done by a team of archaeologists there. The site was first discovered in the 1930s by a local teacher, Patrick Caufield. He noticed that when local people were digging in the bog, they were constantly hitting against what seemed to be rows of stones. He realized that these must be walls, and that they must be thousands of years old for them to predate the bog, which subsequently grew over them. He wrote to the National Museum in Dublin to ask them to investigate, but no one took him seriously. It wasn't until 40 years later, when Patrick Caufield's son, Sheamus, who had become an archaeologist by then, began to explore further. He inserted iron probes into the bog to map the formation of the stones, a traditional method which local people had always used for finding fuel buried in the bog for thousands of years. Carbon dating later proved that the site was over 5,000 years old and was the largest Neolithic site in Ireland. Thanks to the bog, which covers the area, the remains of the settlement at Cagey fields, which is over 5,000 years old, are extremely well preserved. A bog is 90% water. It's soil so saturated that when the grasses and heathers that grow on its surface die, they don't fully decay, but accumulate in layers. Objects remain so well preserved in these conditions because of the acidity of the peat and the deficiency of oxygen. At least 175 days of rain a year are required for this to happen. This part of Ireland gets an average of 225 days. The Neolithic farmers at Cagey would have enjoyed several centuries of relative peace and stability. Neolithic farmers generally lived in larger communities than their predecessors, with a number of houses built around a community building. As they lived in permanent settlements, Neolithic farmers were able to build bigger houses. These weren't round as people often assume, but rectangular, with a small hole in the roof that allowed smoke to escape. This is one of many innovations and indicates that the Neolithic farmers were the first people to cook indoors. Another new technology that Neolithic settlers brought to Ireland was pottery. Fragments of Neolithic pots have been found in Cagey and elsewhere in Ireland. The pots were used for many things, as well as for storing food, pots were filled with a small amount of fat, and when this was set alight, they served as lamps. It's thought that the Cagey fields were mainly used as paddocks for animals to graze in. Evidence from the Cagey field suggests that each plot of land was of a suitable size to sustain an extended family. They may have used a system of rotational grazing in order to prevent overgrazing and to allow for plant recovery and regrowth. This must have been a year round activity, as no structures have been found which would have been used to shelter animals in the winter. However, archaeologists believe that this way of life at Cagey ceased abruptly. Why was this? Well, several factors may have contributed to the changing circumstances. The soil would have become less productive and led to the abandonment of farming. The crop rotation system was partly responsible for this, as it would have been very intensive and was not sustainable. But there were also climatic pressures, too. The farmers at Cagey would have enjoyed a relatively dry period, but this began to change and the conditions became wetter as there was a lot more rain. It was these conditions that encouraged the bog to form over the area, which survives today. So now I'd like to show you some\nNarrator: That is the end of part four. You now have one minute to check your answers to part four.",
      formTitle: "Céide Fields",
      formContent: [
        { type: "item", text: "an important Neolithic archaeological site in the northwest of Ireland" },
        { type: "heading", text: "Discovery" },
        { type: "item-gap", text: "In the 1930s, a local teacher realised that stones beneath the bog surface were once ", gapId: 31 },
        { type: "item-gap", text: "His ", gapId: 32, gapSuffix: " became an archaeologist and undertook an investigation of the site:" },
        { type: "item-gap", text: "– a traditional method used by local people to dig for ", gapId: 33, gapSuffix: " was used to identify where stones were located" },
        { type: "item", text: "– carbon dating later proved the site was Neolithic." },
        { type: "item-gap", text: "Items are well preserved in the bog because of a lack of ", gapId: 34 },
        { type: "heading", text: "Neolithic farmers" },
        { type: "item-gap", text: "Houses were ", gapId: 35, gapSuffix: " in shape and had a hole in the roof." },
        { type: "heading", text: "Neolithic innovations include:" },
        { type: "item", text: "– cooking indoors" },
        { type: "item-gap", text: "– pots used for storage and to make ", gapId: 36 },
        { type: "item-gap", text: "Each field at Céide was large enough to support a big ", gapId: 37 },
        { type: "item-gap", text: "The fields were probably used to restrict the grazing of animals – no evidence of structures to house them during ", gapId: 38 },
        { type: "heading", text: "Reasons for the decline in farming" },
        { type: "item-gap", text: "a decline in ", gapId: 39, gapSuffix: " quality" },
        { type: "item-gap", text: "an increase in ", gapId: 40 }
      ],
      questions: [
        { id: 31 }, { id: 32 }, { id: 33 }, { id: 34 }, { id: 35 },
        { id: 36 }, { id: 37 }, { id: 38 }, { id: 39 }, { id: 40 }
      ],
      answers: {
        31: ["walls"], 32: ["son"], 33: ["fuel"], 34: ["oxygen"], 35: ["rectangular"],
        36: ["lamps"], 37: ["family"], 38: ["winter"], 39: ["soil"], 40: ["rain"]
      },
      answerHighlights: {
        31: [1],
        32: [1],
        33: [1],
        34: [1],
        35: [1],
        36: [1],
        37: [1],
        38: [1],
        39: [1],
        40: [1]
      }
    }
  ]
};
