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
    "p1_context": "You recently subscribed to a new streaming service.",
    "p1_scenario": "Dear Subscriber,\n\nThank you for joining StreamMax! We want to ensure you have the best experience possible.\nHow do you find the content library and recommendation system? Is the interface user-friendly?\nWhat features would improve your streaming experience?\n\nStreamMax Customer Team",
    "t11": {
      "title": "Task 1.1",
      "target": "50 words",
      "prompt": "Write a letter to your friend, who is considering subscribing. Write about your feelings and what you think they should do.",
      "sample": "Hey!\n\nI <span class=\"ml-token adv\">just</span> got StreamMax and it's <span class=\"ml-token adv\">pretty</span> awesome! The <span class=\"ml-token colloc\">content library</span> is huge and the <span class=\"ml-token colloc\">recommendations</span> are <span class=\"ml-token adv\">actually</span> good! The <span class=\"ml-token colloc\">monthly fee</span> is reasonable too.\n\nYou <span class=\"ml-token modal\">should</span> <span class=\"ml-token adv\">definitely</span> try the free trial!",
      "sampleA1": "<p>Hi [Friend's Name],</p>\n<p>StreamMax is good. I like movies. You watch StreamMax?</p>\n<p>Bye.</p>",
      "sampleA2": "<p>Hi [Friend's Name],</p>\n<p>I have StreamMax now. It is okay. There are many films and series. I like some films, but some are boring. It is not expensive.</p>\n<p>You can try it. Maybe you like it. </p>\n<p>See you!</p>",
      "sampleB1": "<p>Hi [Friend's Name],</p>\n<p>I wanted to tell you about StreamMax. I subscribed last week, and so far, I'm enjoying it. The selection of movies and shows is quite good, and the price isn't too bad. The recommendations are alright, sometimes they suggest things I actually want to watch.</p>\n<p>I think you should consider getting the free trial. You can see if you like it before paying. Let me know what you think if you try it!</p>\n<p>Best,</p>\n<p>[Your Name]</p>",
      "sampleB2": "<p>Hey [Friend's Name],</p>\n<p>Just wanted to give you my initial thoughts on StreamMax, since you were considering subscribing. Overall, I'm fairly impressed. The content library is extensive, although navigating it can be a bit clunky at times. The recommendation algorithm is surprisingly effective; it's already suggested a few hidden gems I wouldn't have found otherwise.</p>\n<p>Given your taste in movies and documentaries, I genuinely believe you'd find it worthwhile. I'd strongly suggest taking advantage of their free trial period to see if it aligns with your viewing preferences. It's definitely worth exploring before committing to a full subscription.</p>\n<p>Cheers,</p>\n<p>[Your Name]</p>"
    },
    "t12": {
      "title": "Task 1.2",
      "target": "120–150 words",
      "prompt": "Write a letter to the streaming service. Write about your feelings and what you think they should do.",
      "sample": "<p>Dear StreamMax Customer Team,</p>\n\n<p>Thank you for inviting my feedback. I am <span class=\"ml-token adv\">generally</span> pleased with my subscription.</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, the <span class=\"ml-token colloc\">content variety</span> is <span class=\"ml-token colloc\">impressive</span>. The mix of films, series, and documentaries <span class=\"ml-token colloc\">caters to</span> diverse tastes.</p>\n\n<p><span class=\"ml-token adv\">However</span>, I have noticed some issues. The <span class=\"ml-token colloc\">buffering</span> during <span class=\"ml-token colloc\">peak hours</span> is frustrating, <span class=\"ml-token adv\">particularly</span> during weekend evenings. Improving <span class=\"ml-token colloc\">server capacity</span> <span class=\"ml-token modal\">would</span> <span class=\"ml-token adv\">greatly</span> enhance the experience.</p>\n\n<p><span class=\"ml-token adv\">Additionally</span>, the <span class=\"ml-token colloc\">subtitle options</span> are limited. Adding more languages <span class=\"ml-token modal\">would</span> benefit <span class=\"ml-token colloc\">international viewers</span>.</p>\n\n<p><span class=\"ml-token adv\">Furthermore</span>, a <span class=\"ml-token colloc\">download feature</span> for offline viewing <span class=\"ml-token modal\">would</span> be <span class=\"ml-token adv\">extremely</span> useful for commuters like myself.</p>\n\n<p>Thank you for your <span class=\"ml-token colloc\">commitment to</span> improving user experience.</p>\n\n<p>Yours faithfully,<br>A Satisfied Subscriber</p>",
      "sampleA1": "<p>Hi StreamMax,</p><br><p>I like it. Movies are good. But sometimes stop. I want more movies. Bye.</p>",
      "sampleA2": "<p>Hi StreamMax,</p><br><p>Thank you for the email. I like StreamMax, it is good. The movies are good and I like the TV shows. But sometimes it stops and I don't like that. Can you fix it? I also want more movies because I watch a lot. Thank you.</p><br><p>Bye,</p><br><p>A Customer</p>",
      "sampleB1": "<p>Dear StreamMax Customer Team,</p><br><p>Thank you for asking about my experience. I think StreamMax is quite good. There are many films and series to watch, which is great. The recommendation system is also helpful because it shows me new things I might like.</p><br><p>However, I have a few suggestions. Sometimes the streaming stops and it's annoying. I think you should improve the servers. Also, it would be good if you had more subtitles in different languages. That would be helpful for more people.</p><br><p>Overall, I am happy with StreamMax. Thank you for listening to my feedback.</p><br><p>Sincerely,</p><br><p>A StreamMax Subscriber</p>",
      "sampleB2": "<p>Dear StreamMax Customer Team,</p><br><p>Thank you for soliciting feedback regarding my experience with StreamMax. Overall, I've been relatively satisfied with the service thus far.</p><br><p>The content library is extensive, offering a diverse range of films and series. The recommendation algorithm is also reasonably effective at suggesting content aligned with my viewing preferences. However, there are a couple of areas that could benefit from improvement.</p><br><p>Firstly, I've encountered occasional buffering issues, particularly during peak usage hours. Addressing these server-side bottlenecks would significantly enhance the viewing experience. Secondly, the range of available subtitle languages could be expanded to cater to a broader international audience. Finally, the implementation of an offline download feature would be a welcome addition, allowing users to consume content during commutes or in areas with limited internet connectivity.</p><br><p>Thank you for your attention to these matters. I trust that you will consider these suggestions as you continue to refine the StreamMax platform.</p><br><p>Yours sincerely,</p><br><p>A StreamMax User</p>"
    },
    "t2": {
      "title": "Task 2",
      "target": "180–200 words",
      "prompt": "You are participating in an online discussion forum. The topic is: \"Should social media platforms be regulated by governments?\" Write your response, giving reasons and examples. Write 180–200 words.",
      "sample": "<h2>The Future of Television: Is Traditional TV Dying?</h2>\n\n<p><span class=\"ml-token colloc\">Streaming services</span> have <span class=\"ml-token adv\">fundamentally</span> changed how we consume entertainment. But has <span class=\"ml-token colloc\">traditional television</span> become <span class=\"ml-token colloc\">obsolete</span>?</p>\n\n<p><span class=\"ml-token adv\">Undeniably</span>, streaming offers <span class=\"ml-token colloc\">significant advantages</span>. <span class=\"ml-token colloc\">On-demand content</span>, no advertisements, and <span class=\"ml-token colloc\">personalized recommendations</span> have made viewers less tolerant of <span class=\"ml-token colloc\">scheduled programming</span>. Younger generations, in particular, rarely watch <span class=\"ml-token colloc\">linear TV</span>.</p>\n\n<p><span class=\"ml-token adv\">However</span>, traditional television still serves important functions. <span class=\"ml-token colloc\">Live events</span> – sports, news, and award shows – remain the domain of broadcast TV. These <span class=\"ml-token colloc\">shared viewing experiences</span> create <span class=\"ml-token colloc\">cultural moments</span> that streaming <span class=\"ml-token modal\">cannot</span> replicate.</p>\n\n<p><span class=\"ml-token adv\">Moreover</span>, not everyone has <span class=\"ml-token colloc\">reliable internet access</span>. In many regions, traditional TV remains the primary entertainment source.</p>\n\n<p><span class=\"ml-token adv\">Interestingly</span>, we're seeing <span class=\"ml-token colloc\">convergence</span> rather than replacement. Many TV providers now offer <span class=\"ml-token colloc\">hybrid services</span> combining live broadcasting with streaming features.</p>\n\n<p><span class=\"ml-token adv\">Ultimately</span>, traditional TV won't disappear entirely, but its role <span class=\"ml-token modal\">will</span> <span class=\"ml-token adv\">certainly</span> diminish as technology evolves.</p>",
      "sampleA1": "<p>Hi StreamMax,<br>I like TV.<br>Movies good.<br>Easy to see.<br>Bye</p>",
      "sampleA2": "<p>Hello StreamMax,<br>I like the movies and shows. They are good. <br>The app is easy to use, and I can find things. But sometimes it is slow. <br>I want more cartoons because my kids like them. <br>Thank you.</p>",
      "sampleB1": "<p>Dear StreamMax Customer Team,<br><br>Thank you for asking about my experience. I think the content library is pretty good. There are lots of movies and TV shows to choose from. The recommendation system is okay, but it's not always right. Sometimes it suggests things I don't like.<br><br>The interface is mostly user-friendly. It's easy to find what I want. However, I think it could be faster. Sometimes it takes a long time to load. <br><br>One feature that would improve my experience is offline downloads. It would be great if I could download movies and watch them when I don't have internet access. Also, maybe more subtitles for different languages.<br><br>Thanks,<br>[Your Name]</p>",
      "sampleB2": "<p>Dear StreamMax Customer Team,<br><br>Thank you for reaching out regarding my initial experience with StreamMax. Overall, I'm relatively satisfied, but there are definitely areas for improvement.<br><br>The content library is extensive, which is a major plus. However, the recommendation system could be more refined. While it occasionally suggests relevant content, it often defaults to popular titles, neglecting niche genres I've previously enjoyed. A more sophisticated algorithm considering viewing history and ratings would be beneficial.<br><br>The interface is generally intuitive, although navigating between profiles and managing watchlists could be streamlined. A more prominent search function would also be appreciated.<br><br>In terms of features, I'd suggest implementing a 'continue watching' section that accurately reflects my progress across different devices. Furthermore, the ability to create custom playlists and share them with other users would enhance the social aspect of the platform. Finally, improving the subtitle options, including customizable font sizes and styles, would significantly improve accessibility.<br><br>Sincerely,<br>[Your Name]</p>"
    }
  },
  "vocabulary": {
    "task11": [
      {
        "en": "just got",
        "uz": "endigina oldim"
      },
      {
        "en": "pretty awesome",
        "uz": "juda ajoyib"
      },
      {
        "en": "content library",
        "uz": "kontent kutubxonasi"
      },
      {
        "en": "recommendations",
        "uz": "tavsiyalar"
      },
      {
        "en": "actually good",
        "uz": "haqiqatan yaxshi"
      },
      {
        "en": "monthly fee",
        "uz": "oylik to'lov"
      },
      {
        "en": "reasonable",
        "uz": "maqbul"
      },
      {
        "en": "free trial",
        "uz": "bepul sinov"
      },
      {
        "en": "definitely try",
        "uz": "albatta sinab ko'ring"
      },
      {
        "en": "so many shows",
        "uz": "juda ko'p ko'rsatuvlar"
      },
      {
        "en": "binge-watched",
        "uz": "ketma-ket ko'rdim"
      },
      {
        "en": "great quality",
        "uz": "ajoyib sifat"
      },
      {
        "en": "worth it",
        "uz": "bunga arziydi"
      },
      {
        "en": "check it out",
        "uz": "ko'rib chiqing"
      },
      {
        "en": "loving it",
        "uz": "juda yoqyapti"
      },
      {
        "en": "highly recommend",
        "uz": "juda tavsiya qilaman"
      },
      {
        "en": "tons of content",
        "uz": "juda ko'p kontent"
      },
      {
        "en": "easy to use",
        "uz": "ishlatish oson"
      },
      {
        "en": "no ads",
        "uz": "reklama yo'q"
      },
      {
        "en": "let me know",
        "uz": "menga ayting"
      }
    ],
    "task12": [
      {
        "en": "content variety",
        "uz": "kontent xilma-xilligi"
      },
      {
        "en": "impressive",
        "uz": "taassurot qoldiruvchi"
      },
      {
        "en": "caters to",
        "uz": "xizmat ko'rsatmoq"
      },
      {
        "en": "diverse tastes",
        "uz": "turli didlar"
      },
      {
        "en": "buffering",
        "uz": "yuklanish"
      },
      {
        "en": "peak hours",
        "uz": "eng gavjum soatlar"
      },
      {
        "en": "server capacity",
        "uz": "server sig'imi"
      },
      {
        "en": "subtitle options",
        "uz": "subtitr variantlari"
      },
      {
        "en": "international viewers",
        "uz": "xalqaro tomoshabinlar"
      },
      {
        "en": "download feature",
        "uz": "yuklab olish xususiyati"
      },
      {
        "en": "offline viewing",
        "uz": "oflayn ko'rish"
      },
      {
        "en": "commuters",
        "uz": "yo'lovchilar"
      },
      {
        "en": "commitment to",
        "uz": "bag'ishlanganlik"
      },
      {
        "en": "user experience",
        "uz": "foydalanuvchi tajribasi"
      },
      {
        "en": "satisfied subscriber",
        "uz": "mamnun obunachi"
      },
      {
        "en": "generally pleased",
        "uz": "umuman mamnun"
      },
      {
        "en": "noticed issues",
        "uz": "muammolarni sezdim"
      },
      {
        "en": "particularly frustrating",
        "uz": "ayniqsa asabiy"
      },
      {
        "en": "greatly enhance",
        "uz": "katta yaxshilamoq"
      },
      {
        "en": "extremely useful",
        "uz": "juda foydali"
      }
    ],
    "task2": [
      {
        "en": "streaming services",
        "uz": "striming xizmatlari"
      },
      {
        "en": "traditional television",
        "uz": "an'anaviy televideniye"
      },
      {
        "en": "obsolete",
        "uz": "eskirgan"
      },
      {
        "en": "significant advantages",
        "uz": "muhim afzalliklar"
      },
      {
        "en": "on-demand content",
        "uz": "talab bo'yicha kontent"
      },
      {
        "en": "personalized recommendations",
        "uz": "shaxsiy tavsiyalar"
      },
      {
        "en": "scheduled programming",
        "uz": "rejalashtirilgan dastur"
      },
      {
        "en": "linear TV",
        "uz": "chiziqli TV"
      },
      {
        "en": "live events",
        "uz": "jonli tadbirlar"
      },
      {
        "en": "shared viewing experiences",
        "uz": "umumiy ko'rish tajribalari"
      },
      {
        "en": "cultural moments",
        "uz": "madaniy lahzalar"
      },
      {
        "en": "reliable internet access",
        "uz": "ishonchli internet"
      },
      {
        "en": "convergence",
        "uz": "birlashuv"
      },
      {
        "en": "hybrid services",
        "uz": "gibrid xizmatlar"
      },
      {
        "en": "fundamentally changed",
        "uz": "tubdan o'zgardi"
      },
      {
        "en": "consume entertainment",
        "uz": "ko'ngilochiqlikni iste'mol qilish"
      },
      {
        "en": "younger generations",
        "uz": "yosh avlodlar"
      },
      {
        "en": "broadcast TV",
        "uz": "efir televiziyasi"
      },
      {
        "en": "primary entertainment source",
        "uz": "asosiy ko'ngilochiqlik manbai"
      },
      {
        "en": "technology evolves",
        "uz": "texnologiya rivojlanmoqda"
      }
    ]
  }
};
