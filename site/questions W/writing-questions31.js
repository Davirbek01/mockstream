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
    "p1_context": "You recently stayed at a hotel.",
    "p1_scenario": "Dear Guest,\n\nThank you for staying at our hotel. We hope you enjoyed your visit. We would appreciate your feedback on our services.\nHow was your room and the cleanliness? What did you think of our breakfast service?\nAre there any improvements you would suggest?\n\nThe Hotel Manager",
    "t11": {
      "title": "Task 1.1",
      "target": "50 words",
      "prompt": "Write a letter to your friend, who is planning to stay at the same hotel. Write about your feelings and what you think about the hotel.",
      "sample": "Hey!\n\nI just got back from that hotel you're considering! The <span class=\"ml-token colloc\">room was spotless</span> and the <span class=\"ml-token colloc\">breakfast buffet</span> was <span class=\"ml-token adv\">amazing</span>! I think you <span class=\"ml-token modal\">should</span> <span class=\"ml-token adv\">definitely</span> book it. The only downside was the <span class=\"ml-token colloc\">slow wifi</span>.\n\nYou'll love it!",
      "sampleA1": "<p>Hi [Friend's Name],<br>Hotel good. Room clean. Food good. Bye.</p>",
      "sampleA2": "<p>Hi [Friend's Name],<br>I stayed at the hotel. It was good and the room was clean. The breakfast was nice too. But it was a bit expensive. I liked it!</p>",
      "sampleB1": "<p>Hi [Friend's Name],<br>I just stayed at that hotel you're going to! I thought it was pretty good. The room was clean, which is important to me. The breakfast was also nice, they had lots of choices. However, it was a little noisy at night. I think you'll like it though!</p>",
      "sampleB2": "<p>Dear [Friend's Name],<br>Just wanted to give you my thoughts on that hotel you're planning to book. Overall, it was a positive experience. The room was immaculate, and the breakfast buffet offered a decent variety. The only slight drawback was the location; it's a bit further from the city center than I initially thought. I'd recommend it, but perhaps check the exact location in relation to where you need to be. Hope this helps!</p>"
    },
    "t12": {
      "title": "Task 1.2",
      "target": "120–150 words",
      "prompt": "Write a letter to the hotel manager. Write about your feelings and what you think the hotel management should do.",
      "sample": "<p>Dear Hotel Manager,</p>\n\n<p>Thank you for requesting feedback on my recent stay. I am pleased to share my experience.</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, the <span class=\"ml-token colloc\">room cleanliness</span> was <span class=\"ml-token adv\">exceptional</span>. The housekeeping staff <span class=\"ml-token modal\">should</span> be commended for their <span class=\"ml-token colloc\">attention to detail</span>.</p>\n\n<p><span class=\"ml-token adv\">Additionally</span>, the <span class=\"ml-token colloc\">breakfast service</span> offered excellent variety. The fresh fruits and <span class=\"ml-token colloc\">hot dishes</span> were <span class=\"ml-token adv\">particularly</span> enjoyable.</p>\n\n<p><span class=\"ml-token adv\">However</span>, I <span class=\"ml-token modal\">would</span> suggest improving the <span class=\"ml-token colloc\">wifi connectivity</span>. The connection was <span class=\"ml-token adv\">rather</span> slow, which was inconvenient for business travelers.</p>\n\n<p><span class=\"ml-token adv\">Furthermore</span>, extending <span class=\"ml-token colloc\">checkout time</span> to noon <span class=\"ml-token modal\">would</span> be appreciated by many guests.</p>\n\n<p>Overall, I had a <span class=\"ml-token colloc\">pleasant stay</span> and <span class=\"ml-token modal\">would</span> recommend your hotel.</p>\n\n<p>Yours sincerely,<br>A Satisfied Guest</p>",
      "sampleA1": "<p>Hi Hotel,</p>\n<p>Room good. Clean.</p>\n<p>Breakfast okay.</p>\n<p>Bye</p>",
      "sampleA2": "<p>Dear Hotel Manager,</p>\n<p>Thank you for the email. The room was good and it was clean. The breakfast was also good, but the coffee was not very hot.</p>\n<p>I think you should have more hot coffee. And maybe more fruit.</p>\n<p>Thank you.</p>",
      "sampleB1": "<p>Dear Hotel Manager,</p>\n<p>Thank you for your email asking about my stay. Overall, I had a good experience at your hotel.</p>\n<p>The room was clean and comfortable. I also thought the breakfast was nice, especially the variety of food available. However, I think the breakfast room was a bit crowded.</p>\n<p>One suggestion I have is to improve the signage in the hotel. I found it a little difficult to find my way around. Also, perhaps you could offer more vegetarian options at breakfast.</p>\n<p>Thank you again for a pleasant stay.</p>\n<p>Sincerely,</p>\n<p>[Your Name]</p>",
      "sampleB2": "<p>Dear Hotel Manager,</p>\n<p>Thank you for your email requesting feedback regarding my recent stay at your hotel. I am writing to provide you with my observations.</p>\n<p>In general, I found the room to be well-maintained and the level of cleanliness was commendable. The breakfast service was also quite satisfactory, with a decent selection of items on offer. However, I did feel that the quality of the pastries could be improved.</p>\n<p>Regarding suggestions for improvement, I would recommend investing in upgrading the gym equipment, as it appeared somewhat outdated. Furthermore, perhaps offering a wider range of international television channels would cater to a more diverse clientele.</p>\n<p>Overall, my stay was positive, and I would consider staying at your hotel again in the future. Thank you for your attention to these matters.</p>\n<p>Yours sincerely,</p>\n<p>[Your Name]</p>"
    },
    "t2": {
      "title": "Task 2",
      "target": "180–200 words",
      "prompt": "A student magazine announced an article writing contest. The best ones will be published in the magazine. Write your article on this topic: \"Should plastic bags and single-use plastics be completely banned?\" Write 180–200 words, giving reasons and examples.",
      "sample": "<h2>Hotels vs Vacation Rentals: Which is Better?</h2>\n\n<p>The choice between hotels and <span class=\"ml-token colloc\">vacation rentals</span> depends on <span class=\"ml-token colloc\">individual preferences</span> and travel circumstances. Both options have <span class=\"ml-token colloc\">distinct advantages</span>.</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, hotels offer <span class=\"ml-token colloc\">convenience and services</span>. Daily housekeeping, room service, and <span class=\"ml-token colloc\">24-hour reception</span> make travel easier. For <span class=\"ml-token colloc\">business trips</span> or short stays, hotels are often the <span class=\"ml-token colloc\">practical choice</span>.</p>\n\n<p><span class=\"ml-token adv\">However</span>, vacation rentals provide more <span class=\"ml-token colloc\">space and privacy</span>. Families <span class=\"ml-token modal\">can</span> enjoy separate bedrooms and <span class=\"ml-token colloc\">kitchen facilities</span>, making longer stays more comfortable and <span class=\"ml-token colloc\">cost-effective</span>.</p>\n\n<p><span class=\"ml-token adv\">Moreover</span>, rentals offer a more <span class=\"ml-token colloc\">authentic experience</span>. Staying in a local neighborhood helps travelers <span class=\"ml-token colloc\">immerse themselves</span> in the culture.</p>\n\n<p><span class=\"ml-token adv\">On the other hand</span>, hotels provide <span class=\"ml-token colloc\">security and reliability</span>. You know what to expect, and help is always available.</p>\n\n<p><span class=\"ml-token adv\">Ultimately</span>, the best choice depends on your <span class=\"ml-token colloc\">travel style</span>, budget, and needs. <span class=\"ml-token adv\">Personally</span>, I prefer hotels for city breaks but rentals for <span class=\"ml-token colloc\">family vacations</span>.</p>",
      "sampleA1": "<p>Hi Hotel,</p>\n<p>Room good. Clean. Breakfast good. <br> Bye.</p>",
      "sampleA2": "<p>Dear Hotel Manager,</p>\n<p>I stayed at your hotel. The room was nice and it was clean. The breakfast was good, but it was busy. <br> I think you could have more tables. Thank you.</p>\n<p>Bye.</p>",
      "sampleB1": "<p>Dear Hotel Manager,</p>\n<p>I am writing to give you some feedback about my recent stay at your hotel. Overall, I enjoyed my visit, but there are a few things that could be improved.</p>\n<p>The room was clean and comfortable, which was good. However, the breakfast service was very crowded, and it was difficult to find a table. I think you should consider adding more tables or extending the breakfast hours.</p>\n<p>Also, the Wi-Fi was a bit slow sometimes. It would be helpful if you could improve the internet connection.</p>\n<p>Thank you for your attention to these matters.</p>\n<p>Sincerely,<br> [Your Name]</p>",
      "sampleB2": "<p>Dear Hotel Manager,</p>\n<p>I am writing to provide feedback regarding my recent stay at your hotel. While I generally had a positive experience, I believe there are several areas that warrant attention and potential improvement.</p>\n<p>My room was adequately clean and comfortable; however, the breakfast service was noticeably overcrowded. The limited seating capacity resulted in considerable delays and a somewhat stressful dining experience. Expanding the breakfast hours or increasing the number of tables would likely alleviate this issue.</p>\n<p>Furthermore, the Wi-Fi connectivity proved inconsistent at times, which was particularly inconvenient. Investing in upgrading the internet infrastructure could significantly enhance guest satisfaction.</p>\n<p>Finally, while the staff were generally polite, a more proactive approach to addressing guest inquiries could be beneficial. Perhaps additional training in customer service would be worthwhile.</p>\n<p>Thank you for considering my comments. I hope this feedback proves useful in your ongoing efforts to improve the guest experience.</p>\n<p>Sincerely,<br> [Your Name]</p>"
    }
  },
  "vocabulary": {
    "task11": [
      {
        "en": "just got back",
        "uz": "hozirgina qaytdim"
      },
      {
        "en": "room was spotless",
        "uz": "xona terandan toza edi"
      },
      {
        "en": "breakfast buffet",
        "uz": "nonushta bufeti"
      },
      {
        "en": "definitely book",
        "uz": "albatta bron qiling"
      },
      {
        "en": "slow wifi",
        "uz": "sekin wifi"
      },
      {
        "en": "you'll love it",
        "uz": "sizga yoqadi"
      },
      {
        "en": "great location",
        "uz": "ajoyib joylashuv"
      },
      {
        "en": "friendly staff",
        "uz": "samimiy xodimlar"
      },
      {
        "en": "comfy bed",
        "uz": "qulay yotoq"
      },
      {
        "en": "nice view",
        "uz": "chiroyli manzara"
      },
      {
        "en": "worth the price",
        "uz": "narxiga arziydi"
      },
      {
        "en": "highly recommend",
        "uz": "qattiq tavsiya qilaman"
      },
      {
        "en": "check it out",
        "uz": "ko'rib chiqing"
      },
      {
        "en": "pretty good",
        "uz": "ancha yaxshi"
      },
      {
        "en": "small issue",
        "uz": "kichik muammo"
      },
      {
        "en": "let me know",
        "uz": "menga ayting"
      },
      {
        "en": "have fun",
        "uz": "yaxshi dam oling"
      },
      {
        "en": "safe travels",
        "uz": "xavfsiz sayohat"
      },
      {
        "en": "awesome place",
        "uz": "ajoyib joy"
      },
      {
        "en": "can't wait",
        "uz": "sabrsizlik bilan kutaman"
      }
    ],
    "task12": [
      {
        "en": "requesting feedback",
        "uz": "fikr-mulohaza so'ramoq"
      },
      {
        "en": "room cleanliness",
        "uz": "xona tozaligi"
      },
      {
        "en": "exceptional",
        "uz": "ajoyib"
      },
      {
        "en": "attention to detail",
        "uz": "tafsilotlarga e'tibor"
      },
      {
        "en": "breakfast service",
        "uz": "nonushta xizmati"
      },
      {
        "en": "excellent variety",
        "uz": "ajoyib xilma-xillik"
      },
      {
        "en": "hot dishes",
        "uz": "issiq taomlar"
      },
      {
        "en": "wifi connectivity",
        "uz": "wifi ulanishi"
      },
      {
        "en": "rather slow",
        "uz": "ancha sekin"
      },
      {
        "en": "business travelers",
        "uz": "biznes sayohatchilar"
      },
      {
        "en": "checkout time",
        "uz": "chiqish vaqti"
      },
      {
        "en": "pleasant stay",
        "uz": "yoqimli turar joy"
      },
      {
        "en": "yours sincerely",
        "uz": "hurmat bilan"
      },
      {
        "en": "satisfied guest",
        "uz": "mamnun mehmon"
      },
      {
        "en": "commended",
        "uz": "maqtalgan"
      },
      {
        "en": "inconvenient",
        "uz": "noqulay"
      },
      {
        "en": "would recommend",
        "uz": "tavsiya qilardim"
      },
      {
        "en": "overall experience",
        "uz": "umumiy tajriba"
      },
      {
        "en": "improvement suggestion",
        "uz": "yaxshilash taklifi"
      },
      {
        "en": "appreciated by guests",
        "uz": "mehmonlar tomonidan qadrlanadi"
      }
    ],
    "task2": [
      {
        "en": "vacation rentals",
        "uz": "dam olish uchun ijaralar"
      },
      {
        "en": "individual preferences",
        "uz": "shaxsiy afzalliklar"
      },
      {
        "en": "distinct advantages",
        "uz": "aniq afzalliklar"
      },
      {
        "en": "convenience and services",
        "uz": "qulaylik va xizmatlar"
      },
      {
        "en": "24-hour reception",
        "uz": "24 soatlik qabul"
      },
      {
        "en": "business trips",
        "uz": "biznes safarlari"
      },
      {
        "en": "practical choice",
        "uz": "amaliy tanlov"
      },
      {
        "en": "space and privacy",
        "uz": "joy va maxfiylik"
      },
      {
        "en": "kitchen facilities",
        "uz": "oshxona sharoitlari"
      },
      {
        "en": "cost-effective",
        "uz": "tejamkor"
      },
      {
        "en": "authentic experience",
        "uz": "haqiqiy tajriba"
      },
      {
        "en": "immerse themselves",
        "uz": "o'zlarini singdirmoq"
      },
      {
        "en": "security and reliability",
        "uz": "xavfsizlik va ishonchlilik"
      },
      {
        "en": "travel style",
        "uz": "sayohat uslubi"
      },
      {
        "en": "family vacations",
        "uz": "oilaviy dam olish"
      },
      {
        "en": "local neighborhood",
        "uz": "mahalliy mahalla"
      },
      {
        "en": "city breaks",
        "uz": "shahar sayohatlari"
      },
      {
        "en": "longer stays",
        "uz": "uzoqroq turish"
      },
      {
        "en": "daily housekeeping",
        "uz": "kundalik tozalash"
      },
      {
        "en": "room service",
        "uz": "xona xizmati"
      }
    ]
  }
};
