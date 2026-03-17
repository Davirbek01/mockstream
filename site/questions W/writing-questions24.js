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
    "p1_context": "You live in an apartment building.",
    "p1_scenario": "Dear Residents,\n\nWe are planning to make improvements to our building. We are considering upgrading the lobby, adding a rooftop garden, improving the parking area, and installing security cameras.\nWhich improvements would you prioritize? Do you have any other suggestions?\n\nThe Building Management Committee",
    "t11": {
      "title": "Task 1.1",
      "target": "50 words",
      "prompt": "Write a message to a neighbor about the proposed building improvements. Share your thoughts.",
      "sample": "Hi!\n\nDid you see the email about <span class=\"ml-token colloc\">building upgrades</span>? I'm <span class=\"ml-token adv\">really</span> excited about the <span class=\"ml-token colloc\">rooftop garden</span> idea! It <span class=\"ml-token modal\">would</span> be so nice to have some <span class=\"ml-token colloc\">green space</span>. I think the <span class=\"ml-token colloc\">parking situation</span> needs attention too. What's your priority?\n\nCatch up soon!",
      "sampleA1": "<p>Hi!</p><p>Building... garden good. Parking bad. Bye!</p>",
      "sampleA2": "<p>Hi!</p><p>I see the email about the building. I like the garden, and it is very nice. But the parking is a problem because it is always full. What do you think?</p><p>Bye!</p>",
      "sampleB1": "<p>Hi!</p><p>Did you read the email about the building improvements? I think the rooftop garden is a great idea; it would really improve the building. However, I also think the parking area needs to be improved because it's often difficult to find a space. What do you think is most important?</p><p>Let me know!</p>",
      "sampleB2": "<p>Hi,</p><p>Have you had a chance to consider the proposed building improvements? I'm particularly drawn to the idea of a rooftop garden; it would be a fantastic amenity and add considerable value. That said, I feel the parking situation is also quite pressing. The limited spaces are a constant source of frustration. I'm curious to know your perspective on the priorities.</p><p>Best,</p>"
    },
    "t12": {
      "title": "Task 1.2",
      "target": "120–150 words",
      "prompt": "Write a letter to the Building Management Committee with your preferences and suggestions.",
      "sample": "<p>Dear Committee Members,</p>\n\n<p>Thank you for inviting residents to share their views on the proposed <span class=\"ml-token colloc\">building improvements</span>. I appreciate this <span class=\"ml-token colloc\">collaborative approach</span>.</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, I <span class=\"ml-token modal\">would</span> strongly support the <span class=\"ml-token colloc\">rooftop garden</span> project. This <span class=\"ml-token modal\">would</span> provide residents with a <span class=\"ml-token colloc\">communal space</span> to relax and socialize, fostering a stronger <span class=\"ml-token colloc\">sense of community</span>.</p>\n\n<p><span class=\"ml-token adv\">Additionally</span>, <span class=\"ml-token colloc\">security improvements</span> <span class=\"ml-token modal\">should</span> be prioritized. Installing cameras at entry points <span class=\"ml-token modal\">would</span> <span class=\"ml-token adv\">significantly</span> enhance <span class=\"ml-token colloc\">resident safety</span>.</p>\n\n<p><span class=\"ml-token adv\">Furthermore</span>, the <span class=\"ml-token colloc\">parking area</span> <span class=\"ml-token modal\">could</span> benefit from better lighting and clearer markings. This <span class=\"ml-token modal\">would</span> make parking safer and more <span class=\"ml-token colloc\">organized</span>.</p>\n\n<p><span class=\"ml-token adv\">Finally</span>, I <span class=\"ml-token modal\">would</span> suggest adding <span class=\"ml-token colloc\">bicycle storage</span> facilities for <span class=\"ml-token colloc\">eco-conscious</span> residents.</p>\n\n<p>Thank you for your efforts to improve our building.</p>\n\n<p>Yours sincerely,<br>A Concerned Resident</p>",
      "sampleA1": "<p>Hi!</p><br><p>I like garden. And parking. Bye!</p>",
      "sampleA2": "<p>Hello.</p><br><p>I want a garden. Because I like flowers. And the parking is bad. I want better parking. But the cameras are good, I think. Thank you.</p><br><p>Bye.</p>",
      "sampleB1": "<p>Dear Building Management Committee,</p><br><p>I am writing to you about the improvements. I think the garden is a good idea. It would be nice to have a place to relax. Also, the parking area needs to be better. It is often difficult to find a space. Security cameras are also important, I think, for safety. However, the lobby is okay, so I don't think that is the most important thing. Thank you for listening to my ideas.</p><br><p>Sincerely,<br>A Resident</p>",
      "sampleB2": "<p>Dear Building Management Committee,</p><br><p>Thank you for the opportunity to provide feedback on the proposed building improvements. I believe that prioritizing certain projects over others would be most beneficial to the residents.</p><br><p>I strongly suggest giving precedence to the installation of security cameras. Enhancing the safety and security of our building should be the primary concern. Following this, improvements to the parking area would be greatly appreciated, particularly regarding lighting and space allocation. A well-lit and organized parking area would undoubtedly improve the overall living experience.</p><br><p>While the rooftop garden is an appealing concept, I believe it should be considered after addressing the more pressing issues of security and parking. Furthermore, I propose exploring the possibility of installing electric vehicle charging stations in the parking area to accommodate the growing number of electric cars.</p><br><p>Thank you for your time and consideration.</p><br><p>Sincerely,<br>A Resident</p>"
    },
    "t2": {
      "title": "Task 2",
      "target": "180–200 words",
      "prompt": "You are participating in an online discussion forum. The topic is: \"Should fast food advertising be banned to combat obesity?\" Write your response, giving reasons and examples. Write 180–200 words.",
      "sample": "<h2>Building Community in the City: What Makes Apartment Living Great</h2>\n\n<p>Living in an apartment building <span class=\"ml-token modal\">can</span> either be an <span class=\"ml-token colloc\">isolating experience</span> or a wonderful <span class=\"ml-token colloc\">community</span>. What makes the difference?</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, <span class=\"ml-token colloc\">shared spaces</span> play a crucial role. Buildings with communal gardens, rooftops, or <span class=\"ml-token colloc\">recreation rooms</span> give residents opportunities to meet and interact. My building recently added a <span class=\"ml-token colloc\">community room</span>, and it has <span class=\"ml-token adv\">dramatically</span> improved <span class=\"ml-token colloc\">neighborly relations</span>.</p>\n\n<p><span class=\"ml-token adv\">Moreover</span>, <span class=\"ml-token colloc\">effective communication</span> from management is essential. Regular newsletters, notice boards, and <span class=\"ml-token colloc\">resident meetings</span> help keep everyone informed and involved.</p>\n\n<p><span class=\"ml-token adv\">Additionally</span>, <span class=\"ml-token colloc\">mutual respect</span> among neighbors is fundamental. This means being mindful of noise, keeping <span class=\"ml-token colloc\">common areas</span> clean, and following building rules.</p>\n\n<p><span class=\"ml-token adv\">Finally</span>, organizing <span class=\"ml-token colloc\">social events</span> like barbecues or holiday parties <span class=\"ml-token modal\">can</span> transform strangers into friends.</p>\n\n<p><span class=\"ml-token adv\">Ultimately</span>, a great apartment community requires both good <span class=\"ml-token colloc\">physical infrastructure</span> and a culture of <span class=\"ml-token colloc\">consideration</span>. When these elements combine, urban living becomes not just convenient, but truly <span class=\"ml-token colloc\">fulfilling</span>.</p>",
      "sampleA1": "<p>Hi!</p><p>I like garden. Garden good. Parking good too. Bye!</p>",
      "sampleA2": "<p>Hello,</p><p>I think the garden is good because it is nice. The parking is also important because I have a car. But security cameras are good too because I want to be safe. Thank you.</p><p>Bye.</p>",
      "sampleB1": "<p>Dear Building Management,</p><p>I am writing to give my opinion on the building improvements. I think the rooftop garden would be a good idea because it would make the building look nicer and give us a place to relax. Also, improving the parking area is important because sometimes it's hard to find a space. However, I think the security cameras are the most important because safety is a priority. Maybe we could also think about adding a small gym?</p><p>Thank you for considering my suggestions.</p><p>Sincerely,<br>A Resident</p>",
      "sampleB2": "<p>Dear Building Management Committee,</p><p>I am writing to express my views regarding the proposed building improvements. While all the suggestions have merit, I believe prioritizing the installation of security cameras is paramount. Ensuring the safety and security of residents should be the primary concern, and enhanced surveillance would undoubtedly contribute to peace of mind. </p><p>Furthermore, I support the idea of upgrading the lobby. A modern and welcoming entrance can significantly improve the building's overall image and create a positive first impression for visitors. The rooftop garden is an appealing concept, but its long-term maintenance and potential disruption during construction should be carefully considered. Perhaps a more cost-effective alternative would be to invest in landscaping around the building's perimeter.</p><p>Thank you for your consideration. I look forward to seeing these improvements implemented.</p><p>Sincerely,<br>A Resident</p>"
    }
  },
  "vocabulary": {
    "task11": [
      {
        "en": "building upgrades",
        "uz": "bino yangilanishlari"
      },
      {
        "en": "really excited",
        "uz": "juda hayajonlangan"
      },
      {
        "en": "rooftop garden",
        "uz": "tom bog'i"
      },
      {
        "en": "green space",
        "uz": "yashil maydon"
      },
      {
        "en": "parking situation",
        "uz": "to'xtash holati"
      },
      {
        "en": "catch up soon",
        "uz": "tez gaplashamiz"
      },
      {
        "en": "great idea",
        "uz": "ajoyib fikr"
      },
      {
        "en": "need fixing",
        "uz": "tuzatish kerak"
      },
      {
        "en": "sounds good",
        "uz": "yaxshi eshitiladi"
      },
      {
        "en": "what's your priority",
        "uz": "sizning ustuvorligingiz nima"
      },
      {
        "en": "common areas",
        "uz": "umumiy joylar"
      },
      {
        "en": "security cameras",
        "uz": "xavfsizlik kameralari"
      },
      {
        "en": "lobby upgrade",
        "uz": "vestibul yangilanishi"
      },
      {
        "en": "feel safer",
        "uz": "xavfsizroq his qilmoq"
      },
      {
        "en": "looks nice",
        "uz": "chiroyli ko'rinadi"
      },
      {
        "en": "about time",
        "uz": "vaqti keldi"
      },
      {
        "en": "really needed",
        "uz": "juda kerak"
      },
      {
        "en": "pretty old",
        "uz": "ancha eski"
      },
      {
        "en": "let me know",
        "uz": "menga ayting"
      },
      {
        "en": "talk later",
        "uz": "keyinroq gaplashamiz"
      }
    ],
    "task12": [
      {
        "en": "inviting residents",
        "uz": "aholiga murojaat qilmoq"
      },
      {
        "en": "building improvements",
        "uz": "bino yaxshilanishlari"
      },
      {
        "en": "collaborative approach",
        "uz": "hamkorlik yondashuvi"
      },
      {
        "en": "rooftop garden project",
        "uz": "tom bog'i loyihasi"
      },
      {
        "en": "communal space",
        "uz": "umumiy maydon"
      },
      {
        "en": "sense of community",
        "uz": "jamoa hissi"
      },
      {
        "en": "security improvements",
        "uz": "xavfsizlik yaxshilanishlari"
      },
      {
        "en": "resident safety",
        "uz": "aholi xavfsizligi"
      },
      {
        "en": "parking area",
        "uz": "to'xtash joyi"
      },
      {
        "en": "better lighting",
        "uz": "yaxshiroq yoritish"
      },
      {
        "en": "clearer markings",
        "uz": "aniqroq belgilar"
      },
      {
        "en": "bicycle storage",
        "uz": "velosiped saqlash joyi"
      },
      {
        "en": "eco-conscious",
        "uz": "ekologik onglilik"
      },
      {
        "en": "yours sincerely",
        "uz": "hurmat bilan"
      },
      {
        "en": "concerned resident",
        "uz": "xavotir olgan aholi"
      },
      {
        "en": "strongly support",
        "uz": "qattiq qo'llab-quvvatlash"
      },
      {
        "en": "foster community",
        "uz": "jamoani rivojlantirmoq"
      },
      {
        "en": "entry points",
        "uz": "kirish joylari"
      },
      {
        "en": "significantly enhance",
        "uz": "sezilarli darajada yaxshilamoq"
      },
      {
        "en": "organized parking",
        "uz": "tartibli to'xtash joyi"
      }
    ],
    "task2": [
      {
        "en": "isolating experience",
        "uz": "yakkalanish tajribasi"
      },
      {
        "en": "shared spaces",
        "uz": "umumiy joylar"
      },
      {
        "en": "recreation rooms",
        "uz": "dam olish xonalari"
      },
      {
        "en": "community room",
        "uz": "jamoa xonasi"
      },
      {
        "en": "neighborly relations",
        "uz": "qo'shnichilik munosabatlari"
      },
      {
        "en": "effective communication",
        "uz": "samarali muloqot"
      },
      {
        "en": "resident meetings",
        "uz": "aholi yig'ilishlari"
      },
      {
        "en": "mutual respect",
        "uz": "o'zaro hurmat"
      },
      {
        "en": "common areas",
        "uz": "umumiy joylar"
      },
      {
        "en": "social events",
        "uz": "ijtimoiy tadbirlar"
      },
      {
        "en": "physical infrastructure",
        "uz": "jismoniy infratuzilma"
      },
      {
        "en": "consideration",
        "uz": "e'tibor"
      },
      {
        "en": "fulfilling",
        "uz": "qoniqarli"
      },
      {
        "en": "urban living",
        "uz": "shahar hayoti"
      },
      {
        "en": "apartment community",
        "uz": "kvartira jamoasi"
      },
      {
        "en": "building management",
        "uz": "bino boshqaruvi"
      },
      {
        "en": "notice boards",
        "uz": "e'lonlar doskasi"
      },
      {
        "en": "mindful of noise",
        "uz": "shovqinga e'tiborli"
      },
      {
        "en": "holiday parties",
        "uz": "bayram bazmlari"
      },
      {
        "en": "transform strangers",
        "uz": "begonalarni o'zgartirmoq"
      }
    ]
  }
};
