// ================================================================================
// WRITING MOCK TEST - QUESTIONS DATA
// ================================================================================
// This file contains all question content for the Writing Mock Test
// Update this file to change questions across all writing mocks automatically
// ================================================================================

window.WRITING_TEST_DATA = {
  "settings": {
    "logoUrl": "https://i.ibb.co/WN0XY5Lv/logo.png",
    "logoWording": "Mock Stream",
    "testIdentifier": "mock_stream",
    "heading1": "Bilim va malakalarni baholash agentligi",
    "heading2": "Chet tilini bilish darajasi",
    "examTitle": "Writing exam"
  },
  "tasks": {
    "p1_context": "You are a regular shopper at a local shopping mall.",
    "p1_scenario": "Dear Valued Shoppers,\n\nOur mall is planning a major renovation. We are considering adding more dining options, creating a children's play area, improving parking facilities, and adding a cinema.\nWhich improvements would make you visit more often? What other changes would you like to see?\n\nThe Mall Management",
    "t11": {
      "title": "Task 1.1",
      "target": "50 words",
      "prompt": "Write a message to a friend about the mall renovation plans. Share what you think.",
      "sample": "Hey!\n\nDid you hear about the <span class=\"ml-token colloc\">mall renovation</span>? A cinema <span class=\"ml-token modal\">would</span> be <span class=\"ml-token adv\">amazing</span> – we wouldn't have to drive across town anymore! I think they <span class=\"ml-token modal\">should</span> <span class=\"ml-token adv\">definitely</span> improve the <span class=\"ml-token colloc\">parking</span> too, it's always so crowded. What do you want them to add?\n\nLet me know!",
      "sampleA1": "<p>Hi!<br>Mall new? Cinema good. Parking bad. I like cinema.<br>Bye!</p>",
      "sampleA2": "<p>Hi!<br>The mall is new. They want to change it. I want a cinema and better parking because it is always full. What do you want?<br>See you!</p>",
      "sampleB1": "<p>Hey!<br>Have you heard about the mall renovation plans? I think it's a good idea. I would like a cinema because it would be fun to go there. Also, the parking is terrible, so they should definitely improve that. What do you think they should do?<br>Talk soon!</p>",
      "sampleB2": "<p>Hi!<br>Guess what? The mall's getting a major renovation! I'm pretty excited about it. Honestly, a cinema would be fantastic; it's something that's really missing. Improved parking is essential too, it's always such a nightmare to find a space. What are your thoughts? Any specific changes you'd like to see them implement?<br>Let me know!</p>"
    },
    "t12": {
      "title": "Task 1.2",
      "target": "120–150 words",
      "prompt": "Write a letter to the Mall Management with your suggestions.",
      "sample": "<p>Dear Mall Management,</p>\n\n<p>Thank you for seeking <span class=\"ml-token colloc\">customer feedback</span> on the proposed renovation. I am pleased to share my thoughts.</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, adding a cinema <span class=\"ml-token modal\">would</span> be <span class=\"ml-token adv\">highly</span> beneficial. This <span class=\"ml-token modal\">would</span> transform the mall into a complete <span class=\"ml-token colloc\">entertainment destination</span> and attract more visitors.</p>\n\n<p><span class=\"ml-token adv\">Additionally</span>, improving <span class=\"ml-token colloc\">parking facilities</span> <span class=\"ml-token modal\">should</span> be a priority. The current parking area is often <span class=\"ml-token colloc\">overcrowded</span>, especially on weekends, which discourages shoppers.</p>\n\n<p><span class=\"ml-token adv\">Furthermore</span>, a <span class=\"ml-token colloc\">children's play area</span> <span class=\"ml-token modal\">would</span> make the mall more <span class=\"ml-token colloc\">family-friendly</span> and allow parents to shop while children are entertained.</p>\n\n<p><span class=\"ml-token adv\">Finally</span>, I <span class=\"ml-token modal\">would</span> suggest adding more <span class=\"ml-token colloc\">seating areas</span> throughout the mall for tired shoppers.</p>\n\n<p>Thank you for your commitment to improving our shopping experience.</p>\n\n<p>Yours sincerely,<br>A Regular Shopper</p>",
      "sampleA1": "<p>Hi Mall,</p><br><p>I want a play area. And more food.  Parking bad. Bye.</p>",
      "sampleA2": "<p>Dear Mall,</p><br><p>I like the mall. I want a play area for kids because I have kids. And I want more food because I am hungry when I shop. Parking is bad, so you need more parking spaces. Thank you.</p><br><p>Bye,</p><br><p>A Shopper</p>",
      "sampleB1": "<p>Dear Mall Management,</p><br><p>I am writing to give my ideas about the mall renovation. I think a cinema would be a good idea because it would give people more to do. Also, the parking is often difficult, so improving the parking facilities would be helpful. In my opinion, a children's play area is also a good idea for families. However, I think you should also consider adding more coffee shops.</p><br><p>Thank you for listening to my suggestions.</p><br><p>Sincerely,<br>A Regular Shopper</p>",
      "sampleB2": "<p>Dear Mall Management,</p><br><p>I am writing in response to your request for feedback regarding the proposed mall renovation. I believe several improvements would significantly enhance the shopping experience and encourage more frequent visits.</p><br><p>Firstly, while additional dining options are always welcome, I strongly support the addition of a cinema. This would transform the mall into a more comprehensive entertainment hub, particularly appealing to younger demographics and families. Secondly, addressing the current parking situation is crucial. The limited spaces and often chaotic layout deter shoppers, especially during peak hours. Investing in improved parking facilities, perhaps including a parking guidance system, would be highly beneficial. Finally, a dedicated children's play area would undoubtedly make the mall more attractive to families with young children, allowing parents to shop more freely. Furthermore, I suggest exploring options for more eco-friendly initiatives, such as solar panels or rainwater harvesting, to align with growing environmental awareness.</p><br><p>Thank you for considering my suggestions. I look forward to seeing the improvements.</p><br><p>Yours sincerely,<br>A Concerned Shopper</p>"
    },
    "t2": {
      "title": "Task 2",
      "target": "180–200 words",
      "prompt": "A student magazine announced an article writing contest. The best ones will be published in the magazine. Write your article on this topic: \"Should governments invest more in renewable energy sources?\" Write 180–200 words, giving reasons and examples.",
      "sample": "<h2>Shopping Malls vs Online Shopping: A Changing Landscape</h2>\n\n<p>With the rise of <span class=\"ml-token colloc\">e-commerce</span>, many predict the death of <span class=\"ml-token colloc\">shopping malls</span>. However, I believe malls still have an important place in our lives – they just need to evolve.</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, malls offer a <span class=\"ml-token colloc\">social experience</span> that online shopping <span class=\"ml-token modal\">cannot</span> provide. People enjoy meeting friends, dining out, and <span class=\"ml-token colloc\">window shopping</span>. For many, a trip to the mall is an <span class=\"ml-token colloc\">outing</span>, not just a chore.</p>\n\n<p><span class=\"ml-token adv\">Moreover</span>, some purchases require a <span class=\"ml-token colloc\">physical experience</span>. Trying on clothes, testing electronics, or smelling perfumes <span class=\"ml-token modal\">cannot</span> be replicated online.</p>\n\n<p><span class=\"ml-token adv\">Additionally</span>, malls are <span class=\"ml-token adv\">increasingly</span> transforming into <span class=\"ml-token colloc\">entertainment hubs</span>. Those with cinemas, restaurants, and <span class=\"ml-token colloc\">event spaces</span> are thriving.</p>\n\n<p><span class=\"ml-token adv\">However</span>, malls that fail to adapt <span class=\"ml-token modal\">will</span> struggle. Offering unique experiences and services is essential.</p>\n\n<p><span class=\"ml-token adv\">Ultimately</span>, while online shopping offers <span class=\"ml-token colloc\">convenience</span>, malls offer <span class=\"ml-token colloc\">experience</span>. The most successful malls are those that understand this distinction and give shoppers reasons to visit in person.</p>",
      "sampleA1": "<p>Hi Mall,</p><p>I like cinema.  And food.  More food good.  Play area for kids is good.  Bye.</p>",
      "sampleA2": "<p>Dear Mall,</p><p>I like the mall.  I want a cinema because I like movies. And I want more places to eat because I am hungry when I shop. The parking is bad, so better parking is good.  Maybe a play area for kids, but I don't have kids. Thank you.</p>",
      "sampleB1": "<p>Dear Mall Management,</p><p>I am writing to give my opinion on the planned renovations. I think a cinema would be a great addition. Many people like to go to the movies, and it would bring more people to the mall. Also, improving the parking is very important. It's often difficult to find a space, especially on weekends. This makes me not want to visit.</p><p>I also think more restaurants would be good. There aren't enough choices now. However, I don't think a children's play area is necessary. There are already other things for kids to do. More shops would be better, especially clothes shops.</p><p>Thank you for considering my suggestions.</p>",
      "sampleB2": "<p>Dear Mall Management,</p><p>I am writing to express my views on the proposed mall renovations. I believe the addition of a cinema and improved parking facilities are crucial to revitalizing the mall and attracting more visitors. Currently, the lack of entertainment options limits the mall's appeal, particularly in comparison to online shopping.</p><p>A cinema would not only provide entertainment but also encourage longer visits, potentially leading to increased spending in other stores. Furthermore, addressing the inadequate parking situation is essential. The current difficulty in finding parking spaces is a significant deterrent for many shoppers. Improved parking, perhaps through the addition of a parking garage, would alleviate this issue.</p><p>While additional dining options are welcome, I believe the focus should be on providing a diverse range of cuisines to cater to different tastes. A children's play area is a decent idea, but perhaps not as impactful as a cinema and better parking. Ultimately, the renovations should aim to create a more enjoyable and convenient shopping experience.</p>"
    }
  },
  "vocabulary": {
    "task11": [
      {
        "en": "mall renovation",
        "uz": "savdo markazi ta'mirlashi"
      },
      {
        "en": "would be amazing",
        "uz": "ajoyib bo'lardi"
      },
      {
        "en": "drive across town",
        "uz": "shahar bo'ylab haydash"
      },
      {
        "en": "improve parking",
        "uz": "to'xtash joyini yaxshilash"
      },
      {
        "en": "always crowded",
        "uz": "doim gavjum"
      },
      {
        "en": "let me know",
        "uz": "menga ayting"
      },
      {
        "en": "sounds great",
        "uz": "ajoyib eshitiladi"
      },
      {
        "en": "good idea",
        "uz": "yaxshi fikr"
      },
      {
        "en": "more shops",
        "uz": "ko'proq do'konlar"
      },
      {
        "en": "better food",
        "uz": "yaxshiroq taom"
      },
      {
        "en": "really need",
        "uz": "juda kerak"
      },
      {
        "en": "about time",
        "uz": "vaqti keldi"
      },
      {
        "en": "what do you think",
        "uz": "nima deb o'ylaysiz"
      },
      {
        "en": "catch up",
        "uz": "gaplashmoq"
      },
      {
        "en": "weekend shopping",
        "uz": "dam olish kuni xaridlari"
      },
      {
        "en": "nice change",
        "uz": "yaxshi o'zgarish"
      },
      {
        "en": "go there",
        "uz": "u yerga bormoq"
      },
      {
        "en": "hang out",
        "uz": "vaqt o'tkazmoq"
      },
      {
        "en": "pretty excited",
        "uz": "ancha hayajonlangan"
      },
      {
        "en": "check it out",
        "uz": "ko'rib chiqmoq"
      }
    ],
    "task12": [
      {
        "en": "seeking customer feedback",
        "uz": "mijoz fikr-mulohazasini so'ramoq"
      },
      {
        "en": "proposed renovation",
        "uz": "taklif qilingan ta'mirlash"
      },
      {
        "en": "entertainment destination",
        "uz": "ko'ngilochar joy"
      },
      {
        "en": "attract visitors",
        "uz": "tashrif buyuruvchilarni jalb qilmoq"
      },
      {
        "en": "parking facilities",
        "uz": "to'xtash joyi sharoitlari"
      },
      {
        "en": "overcrowded",
        "uz": "haddan tashqari gavjum"
      },
      {
        "en": "discourages shoppers",
        "uz": "xaridorlarni chalg'itmoq"
      },
      {
        "en": "children's play area",
        "uz": "bolalar o'yin maydoni"
      },
      {
        "en": "family-friendly",
        "uz": "oilaga mos"
      },
      {
        "en": "seating areas",
        "uz": "o'tirish joylari"
      },
      {
        "en": "tired shoppers",
        "uz": "charchagan xaridorlar"
      },
      {
        "en": "shopping experience",
        "uz": "xarid tajribasi"
      },
      {
        "en": "regular shopper",
        "uz": "doimiy xaridor"
      },
      {
        "en": "yours sincerely",
        "uz": "hurmat bilan"
      },
      {
        "en": "priority improvement",
        "uz": "ustuvor yaxshilash"
      },
      {
        "en": "transform the mall",
        "uz": "savdo markazini o'zgartirmoq"
      },
      {
        "en": "dining options",
        "uz": "ovqatlanish imkoniyatlari"
      },
      {
        "en": "convenient access",
        "uz": "qulay kirish"
      },
      {
        "en": "commitment to improvement",
        "uz": "yaxshilashga sodiqlik"
      },
      {
        "en": "valued customer",
        "uz": "qimmatli mijoz"
      }
    ],
    "task2": [
      {
        "en": "e-commerce",
        "uz": "elektron tijorat"
      },
      {
        "en": "shopping malls",
        "uz": "savdo markazlari"
      },
      {
        "en": "social experience",
        "uz": "ijtimoiy tajriba"
      },
      {
        "en": "window shopping",
        "uz": "ko'rib yurish"
      },
      {
        "en": "outing",
        "uz": "sayr"
      },
      {
        "en": "physical experience",
        "uz": "jismoniy tajriba"
      },
      {
        "en": "trying on clothes",
        "uz": "kiyim kiyib ko'rish"
      },
      {
        "en": "entertainment hubs",
        "uz": "ko'ngilochar markazlar"
      },
      {
        "en": "event spaces",
        "uz": "tadbir joylari"
      },
      {
        "en": "adapt and evolve",
        "uz": "moslashish va rivojlanish"
      },
      {
        "en": "convenience",
        "uz": "qulaylik"
      },
      {
        "en": "experience",
        "uz": "tajriba"
      },
      {
        "en": "unique experiences",
        "uz": "noyob tajribalar"
      },
      {
        "en": "visit in person",
        "uz": "shaxsan tashrif buyurish"
      },
      {
        "en": "retail landscape",
        "uz": "chakana savdo landshafti"
      },
      {
        "en": "consumer behavior",
        "uz": "iste'molchi xulqi"
      },
      {
        "en": "brick-and-mortar stores",
        "uz": "oddiy do'konlar"
      },
      {
        "en": "shopping habits",
        "uz": "xarid qilish odatlari"
      },
      {
        "en": "thriving businesses",
        "uz": "rivojlanayotgan bizneslar"
      },
      {
        "en": "changing landscape",
        "uz": "o'zgaruvchan landshaft"
      }
    ]
  }
};
