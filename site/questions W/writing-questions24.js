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
      "sampleB2": "<p>Hi,</p><p>Have you had a chance to consider the proposed building improvements? I'm particularly drawn to the idea of a rooftop garden; it would be a fantastic amenity and add considerable value. That said, I feel the parking situation is also quite pressing. The limited spaces are a constant source of frustration. I'm curious to know your perspective on the priorities.</p><p>Best,</p>",
      "uzSample": "<p>Salom!</p>\n<p>Binoni yaxshilash haqidagi elektron xatni ko'rdingizmi? Men tom ustidagi bog' g'oyasidan juda xursandman! Bir oz yashil maydonga ega bo'lish juda yaxshi bo'lardi. Menimcha, avtoturargoh masalasiga ham e'tibor qaratish kerak. Sizning ustuvorligingiz nima?</p>\n<p>Tez orada gaplashamiz!</p>",
      "uzSampleA1": "<p>Salom!</p><p>Bino... bog' yaxshi. Mashinalar to'xtash joyi yomon. Xayr!</p>",
      "uzSampleA2": "<p>Salom!</p><p>Men binoga oid elektron xatni ko'rdim. Menga bog' yoqadi, va u juda yaxshi. Lekin mashinalar turar joyi muammo, chunki u har doim to'la. Siz nima deb o'ylaysiz?</p><p>Xayr!</p>",
      "uzSampleB1": "<p>Salom!</p><p>Binoni yaxshilash haqidagi elektron xatni o'qidingizmi? Menimcha, tom ustidagi bog' ajoyib g'oya; u binoni haqiqatan ham yaxshilaydi. Biroq, menimcha, avtoturargohni ham yaxshilash kerak, chunki ko'pincha joy topish qiyin. Sizningcha, eng muhimi nima?</p><p>Mengа xabar bering!</p>",
      "uzSampleB2": "<p>Salom,</p><p>Siz binoni yaxshilash bo'yicha takliflarni ko'rib chiqishga ulgurdingizmi? Meni ayniqsa tomda bog' yaratish g'oyasi juda qiziqtiradi; bu ajoyib qulaylik bo'lardi va ancha qiymat qo'shardi. Shunga qaramay, menimcha, avtoturargoh vaziyati ham juda dolzarb. Cheklangan joylar doimiy norozilik manbai bo'lib kelmoqda. Sizning ustuvorliklar haqidagi fikringizni bilishga qiziqaman.</p><p>Eng yaxshi tilaklar bilan,</p>"
    },
    "t12": {
      "title": "Task 1.2",
      "target": "120–150 words",
      "prompt": "Write a letter to the Building Management Committee with your preferences and suggestions.",
      "sample": "<p>Dear Committee Members,</p>\n\n<p>Thank you for inviting residents to share their views on the proposed <span class=\"ml-token colloc\">building improvements</span>. I appreciate this <span class=\"ml-token colloc\">collaborative approach</span>.</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, I <span class=\"ml-token modal\">would</span> strongly support the <span class=\"ml-token colloc\">rooftop garden</span> project. This <span class=\"ml-token modal\">would</span> provide residents with a <span class=\"ml-token colloc\">communal space</span> to relax and socialize, fostering a stronger <span class=\"ml-token colloc\">sense of community</span>.</p>\n\n<p><span class=\"ml-token adv\">Additionally</span>, <span class=\"ml-token colloc\">security improvements</span> <span class=\"ml-token modal\">should</span> be prioritized. Installing cameras at entry points <span class=\"ml-token modal\">would</span> <span class=\"ml-token adv\">significantly</span> enhance <span class=\"ml-token colloc\">resident safety</span>.</p>\n\n<p><span class=\"ml-token adv\">Furthermore</span>, the <span class=\"ml-token colloc\">parking area</span> <span class=\"ml-token modal\">could</span> benefit from better lighting and clearer markings. This <span class=\"ml-token modal\">would</span> make parking safer and more <span class=\"ml-token colloc\">organized</span>.</p>\n\n<p><span class=\"ml-token adv\">Finally</span>, I <span class=\"ml-token modal\">would</span> suggest adding <span class=\"ml-token colloc\">bicycle storage</span> facilities for <span class=\"ml-token colloc\">eco-conscious</span> residents.</p>\n\n<p>Thank you for your efforts to improve our building.</p>\n\n<p>Yours sincerely,<br>A Concerned Resident</p>",
      "sampleA1": "<p>Hi!</p><br><p>I like garden. And parking. Bye!</p>",
      "sampleA2": "<p>Hello.</p><br><p>I want a garden. Because I like flowers. And the parking is bad. I want better parking. But the cameras are good, I think. Thank you.</p><br><p>Bye.</p>",
      "sampleB1": "<p>Dear Building Management Committee,</p><br><p>I am writing to you about the improvements. I think the garden is a good idea. It would be nice to have a place to relax. Also, the parking area needs to be better. It is often difficult to find a space. Security cameras are also important, I think, for safety. However, the lobby is okay, so I don't think that is the most important thing. Thank you for listening to my ideas.</p><br><p>Sincerely,<br>A Resident</p>",
      "sampleB2": "<p>Dear Building Management Committee,</p><br><p>Thank you for the opportunity to provide feedback on the proposed building improvements. I believe that prioritizing certain projects over others would be most beneficial to the residents.</p><br><p>I strongly suggest giving precedence to the installation of security cameras. Enhancing the safety and security of our building should be the primary concern. Following this, improvements to the parking area would be greatly appreciated, particularly regarding lighting and space allocation. A well-lit and organized parking area would undoubtedly improve the overall living experience.</p><br><p>While the rooftop garden is an appealing concept, I believe it should be considered after addressing the more pressing issues of security and parking. Furthermore, I propose exploring the possibility of installing electric vehicle charging stations in the parking area to accommodate the growing number of electric cars.</p><br><p>Thank you for your time and consideration.</p><br><p>Sincerely,<br>A Resident</p>",
      "uzSample": "<p>Hurmatli Qo'mita A'zolari,</p>\n\n<p>Yashovchilarni taklif etilgan binoni yaxshilash bo'yicha o'z fikrlarini bildirishga taklif qilganingiz uchun tashakkur. Bunday hamkorlik yondashuvini qadrlayman.</p>\n\n<p>Avvalo, men tom ustidagi bog' loyihasini qat'iy qo'llab-quvvatlayman. Bu yashovchilarga dam olish va muloqot qilish uchun umumiy joy yaratib, jamiyat tuyg'usini kuchaytiradi.</p>\n\n<p>Bundan tashqari, xavfsizlikni yaxshilashga ustuvor ahamiyat berilishi kerak. Kirish joylariga kameralar o'rnatish yashovchilar xavfsizligini sezilarli darajada oshiradi.</p>\n\n<p>Shuningdek, avtoturargoh maydoni yaxshiroq yoritish va aniqroq belgilardan foyda ko'rishi mumkin. Bu avtoturargohni xavfsizroq va tartibliroq qiladi.</p>\n\n<p>Nihoyat, men ekologiyaga e'tiborli yashovchilar uchun velosiped saqlash joylarini qo'shishni taklif qilaman.</p>\n\n<p>Binomizni yaxshilashga qaratilgan sa'y-harakatlaringiz uchun tashakkur.</p>\n\n<p>Hurmat bilan,<br>Xavotirda bo'lgan yashovchi</p>",
      "uzSampleA1": "<p>Salom!</p><br><p>Menga bog' yoqadi. Va mashinalar turargohi. Xayr!</p>",
      "uzSampleA2": "<p>Salom.</p><br><p>Men bog' bo'lishini xohlayman. Chunki men gullarni yaxshi ko'raman. Va mashinalar to'xtash joyi yomon. Men yaxshiroq to'xtash joyini xohlayman. Lekin kameralar yaxshi, menimcha. Rahmat.</p><br><p>Xayr.</p>",
      "uzSampleB1": "<p>Hurmatli Bino Boshqaruv Qo'mitasi,</p><br><p>Men sizga yaxshilanishlar haqida yozmoqdaman. Menimcha, bog' yaxshi g'oya. Dam olish uchun joy bo'lishi yaxshi bo'lardi. Shuningdek, avtoturargoh hududi yaxshiroq bo'lishi kerak. Ko'pincha joy topish qiyin. Xavfsizlik kameralari ham muhim, menimcha, xavfsizlik uchun. Biroq, vestibyul yaxshi, shuning uchun men bu eng muhim narsa deb o'ylamayman. Fikrlarimni tinglaganingiz uchun rahmat.</p><br><p>Hurmat bilan,<br>Bir Rezident</p>",
      "uzSampleB2": "<p>Hurmatli Bino Boshqaruv Qo'mitasi,</p><br><p>Taklif etilayotgan bino yaxshilanishlari bo'yicha fikr bildirish imkoniyati uchun rahmat. Menimcha, ayrim loyihalarni boshqalardan ustun qo'yish aholi uchun eng foydali bo'ladi.</p><br><p>Men xavfsizlik kameralarini o'rnatishga ustunlik berishni qat'iy tavsiya qilaman. Binomizning xavfsizligi va himoyasini kuchaytirish asosiy vazifa bo'lishi kerak. Shundan so'ng, avtoturargoh hududini yaxshilash, ayniqsa yoritish va joy ajratish bo'yicha, juda minnatdor bo'lardik. Yaxshi yoritilgan va tashkil etilgan avtoturargoh, shubhasiz, umumiy yashash tajribasini yaxshilaydi.</p><br><p>Tomdagi bog' jozibali g'oya bo'lsa-da, menimcha, uni xavfsizlik va to'xtash joyi kabi dolzarb masalalarni hal qilgandan keyin ko'rib chiqish kerak. Bundan tashqari, elektr avtomobillarining soni ortib borayotganini hisobga olib, avtoturargohda elektr transport vositalarini zaryadlash stantsiyalarini o'rnatish imkoniyatini o'rganishni taklif qilaman.</p><br><p>Vaqtingiz va e'tiboringiz uchun rahmat.</p><br><p>Hurmat bilan,<br>Bir Aholi</p>"
    },
    "t2": {
      "title": "Task 2",
      "target": "180–200 words",
      "prompt": "You are participating in an online discussion forum. The topic is: \"Should fast food advertising be banned to combat obesity?\" Write your response, giving reasons and examples. Write 180–200 words.",
      "sample": "<h2>Building Community in the City: What Makes Apartment Living Great</h2>\n\n<p>Living in an apartment building <span class=\"ml-token modal\">can</span> either be an <span class=\"ml-token colloc\">isolating experience</span> or a wonderful <span class=\"ml-token colloc\">community</span>. What makes the difference?</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, <span class=\"ml-token colloc\">shared spaces</span> play a crucial role. Buildings with communal gardens, rooftops, or <span class=\"ml-token colloc\">recreation rooms</span> give residents opportunities to meet and interact. My building recently added a <span class=\"ml-token colloc\">community room</span>, and it has <span class=\"ml-token adv\">dramatically</span> improved <span class=\"ml-token colloc\">neighborly relations</span>.</p>\n\n<p><span class=\"ml-token adv\">Moreover</span>, <span class=\"ml-token colloc\">effective communication</span> from management is essential. Regular newsletters, notice boards, and <span class=\"ml-token colloc\">resident meetings</span> help keep everyone informed and involved.</p>\n\n<p><span class=\"ml-token adv\">Additionally</span>, <span class=\"ml-token colloc\">mutual respect</span> among neighbors is fundamental. This means being mindful of noise, keeping <span class=\"ml-token colloc\">common areas</span> clean, and following building rules.</p>\n\n<p><span class=\"ml-token adv\">Finally</span>, organizing <span class=\"ml-token colloc\">social events</span> like barbecues or holiday parties <span class=\"ml-token modal\">can</span> transform strangers into friends.</p>\n\n<p><span class=\"ml-token adv\">Ultimately</span>, a great apartment community requires both good <span class=\"ml-token colloc\">physical infrastructure</span> and a culture of <span class=\"ml-token colloc\">consideration</span>. When these elements combine, urban living becomes not just convenient, but truly <span class=\"ml-token colloc\">fulfilling</span>.</p>",
      "sampleA1": "<p>Hi!</p><p>I like garden. Garden good. Parking good too. Bye!</p>",
      "sampleA2": "<p>Hello,</p><p>I think the garden is good because it is nice. The parking is also important because I have a car. But security cameras are good too because I want to be safe. Thank you.</p><p>Bye.</p>",
      "sampleB1": "<p>Dear Building Management,</p><p>I am writing to give my opinion on the building improvements. I think the rooftop garden would be a good idea because it would make the building look nicer and give us a place to relax. Also, improving the parking area is important because sometimes it's hard to find a space. However, I think the security cameras are the most important because safety is a priority. Maybe we could also think about adding a small gym?</p><p>Thank you for considering my suggestions.</p><p>Sincerely,<br>A Resident</p>",
      "sampleB2": "<p>Dear Building Management Committee,</p><p>I am writing to express my views regarding the proposed building improvements. While all the suggestions have merit, I believe prioritizing the installation of security cameras is paramount. Ensuring the safety and security of residents should be the primary concern, and enhanced surveillance would undoubtedly contribute to peace of mind. </p><p>Furthermore, I support the idea of upgrading the lobby. A modern and welcoming entrance can significantly improve the building's overall image and create a positive first impression for visitors. The rooftop garden is an appealing concept, but its long-term maintenance and potential disruption during construction should be carefully considered. Perhaps a more cost-effective alternative would be to invest in landscaping around the building's perimeter.</p><p>Thank you for your consideration. I look forward to seeing these improvements implemented.</p><p>Sincerely,<br>A Resident</p>",
      "uzSample": "<h2>Shaharda Jamiyat Qurish: Kvartirada Yashashning Afzalliklari Nimada</h2>\n\n<p>Kvartirada yashash yoki ajratilgan tajriba yoki ajoyib jamiyat bo'lishi mumkin. Farq nimada?</p>\n\n<p>Birinchidan, umumiy joylar muhim rol o'ynaydi. Umumiy bog'lar, tomlar yoki dam olish xonalari bo'lgan binolar aholiga uchrashish va muloqot qilish imkoniyatini beradi. Mening binoyim yaqinda jamiyat xonasini qo'shdi va bu qo'shnichilik munosabatlarini sezilarli darajada yaxshiladi.</p>\n\n<p>Bundan tashqari, boshqaruvning samarali aloqasi juda muhimdir. Muntazam axborot byulletenlari, e'lonlar taxtalari va aholi yig'ilishlari hamma narsadan xabardor bo'lishga va ishtirok etishga yordam beradi.</p>\n\n<p>Bundan tashqari, qo'shnilar o'rtasida o'zaro hurmat juda muhimdir. Bu shovqinga e'tibor berish, umumiy joylarni toza saqlash va binoning qoidalariga rioya qilishni anglatadi.</p>\n\n<p>Nihoyat, barbekyu yoki bayram kechalari kabi ijtimoiy tadbirlarni tashkil qilish notanish odamlarni do'stga aylantirishi mumkin.</p>\n\n<p>Oxir oqibat, ajoyib kvartira jamiyati yaxshi jismoniy infratuzilmani ham, e'tibor madaniyatini ham talab qiladi. Ushbu elementlar birlashganda, shahar hayoti nafaqat qulay, balki haqiqatan ham qoniqarli bo'ladi.</p>",
      "uzSampleA1": "<p>Salom!</p><p>Menga bog' yoqadi. Bog' yaxshi. Mashinalar turargohi ham yaxshi. Xayr!</p>",
      "uzSampleA2": "<p>Salom,</p><p>Menimcha, bog' yaxshi, chunki u chiroyli. Mashinalar turargohi ham muhim, chunki menda mashina bor. Lekin xavfsizlik kameralari ham yaxshi, chunki men o'zimni xavfsiz his qilishni xohlayman. Rahmat.</p><p>Xayr.</p>",
      "uzSampleB1": "<p>Hurmatli Bino Ma'muriyati,</p><p>Men binoni yaxshilash bo'yicha o'z fikrimni bildirish uchun yozyapman. Menimcha, tom ustidagi bog' yaxshi fikr bo'lardi, chunki u binoni chiroyli qiladi va bizga dam olish uchun joy beradi. Shuningdek, avtoturargohni yaxshilash muhim, chunki ba'zan joy topish qiyin. Biroq, menimcha, xavfsizlik kameralari eng muhimi, chunki xavfsizlik birinchi o'rinda turadi. Balki biz kichik sport zalini qo'shish haqida ham o'ylasak bo'lar?</p><p>Takliflarimni ko'rib chiqqaningiz uchun rahmat.</p><p>Hurmat bilan,<br>Bir Rezident</p>",
      "uzSampleB2": "<p>Hurmatli Bino Boshqaruv Qo'mitasi,</p><p>Men taklif etilayotgan bino yaxshilanishlari bo'yicha o'z fikrlarimni bildirish uchun yozyapman. Barcha takliflar o'rinli bo'lsa-da, men xavfsizlik kameralarini o'rnatishni birinchi o'ringa qo'yish kerak deb hisoblayman. Rezidentlarning xavfsizligi va himoyasini ta'minlash asosiy vazifa bo'lishi kerak va kuchaytirilgan kuzatuv, shubhasiz, xotirjamlikka hissa qo'shadi.</p><p>Bundan tashqari, men lobini yangilash g'oyasini qo'llab-quvvatlayman. Zamonaviy va mehmondo'st kirish joyi binoning umumiy imidjini sezilarli darajada yaxshilashi va tashrif buyuruvchilar uchun ijobiy birinchi taassurot yaratishi mumkin. Tomdagi bog' jozibali kontseptsiya, ammo uning uzoq muddatli parvarishi va qurilish paytida yuzaga kelishi mumkin bo'lgan buzilishlar diqqat bilan ko'rib chiqilishi kerak. Ehtimol, binoning atrofini obodonlashtirishga sarmoya kiritish yanada tejamkorroq alternativa bo'lishi mumkin.</p><p>E'tiboringiz uchun rahmat. Ushbu yaxshilanishlarning amalga oshirilishini ko'rishni intiqlik bilan kutaman.</p><p>Hurmat bilan,<br>Rezident</p>"
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
  },
  "tokenTranslations": {
    "building upgrades": {
      "uz": "binoni yaxshilash",
      "type": "colloc"
    },
    "really": {
      "uz": "haqiqatan",
      "type": "adv"
    },
    "rooftop garden": {
      "uz": "tom bog'i",
      "type": "colloc"
    },
    "would": {
      "uz": "edi",
      "type": "modal"
    },
    "green space": {
      "uz": "yashil hudud",
      "type": "colloc"
    },
    "parking situation": {
      "uz": "mashinalar turar joyi holati",
      "type": "colloc"
    },
    "building improvements": {
      "uz": "binoni takomillashtirish",
      "type": "colloc"
    },
    "collaborative approach": {
      "uz": "hamkorlik yondashuvi",
      "type": "colloc"
    },
    "Firstly": {
      "uz": "Birinchidan",
      "type": "adv"
    },
    "communal space": {
      "uz": "umumiy foydalanish joyi",
      "type": "colloc"
    },
    "sense of community": {
      "uz": "hamjamiyat tuyg'usi",
      "type": "colloc"
    },
    "Additionally": {
      "uz": "Bundan tashqari",
      "type": "adv"
    },
    "security improvements": {
      "uz": "xavfsizlikni yaxshilash",
      "type": "colloc"
    },
    "should": {
      "uz": "kerak",
      "type": "modal"
    },
    "significantly": {
      "uz": "sezilarli darajada",
      "type": "adv"
    },
    "resident safety": {
      "uz": "aholining xavfsizligi",
      "type": "colloc"
    },
    "Furthermore": {
      "uz": "Qolaversa",
      "type": "adv"
    },
    "parking area": {
      "uz": "mashinalar turar joyi",
      "type": "colloc"
    },
    "could": {
      "uz": "mumkin edi",
      "type": "modal"
    },
    "organized": {
      "uz": "tashkillashtirilgan",
      "type": "colloc"
    },
    "Finally": {
      "uz": "Nihoyat",
      "type": "adv"
    },
    "bicycle storage": {
      "uz": "velosiped saqlash joyi",
      "type": "colloc"
    },
    "eco-conscious": {
      "uz": "ekologik ong",
      "type": "colloc"
    },
    "can": {
      "uz": "mumkin",
      "type": "modal"
    },
    "isolating experience": {
      "uz": "ajratilgan tajriba",
      "type": "colloc"
    },
    "community": {
      "uz": "jamoatchilik",
      "type": "colloc"
    },
    "shared spaces": {
      "uz": "umumiy joylar",
      "type": "colloc"
    },
    "recreation rooms": {
      "uz": "dam olish xonalari",
      "type": "colloc"
    },
    "community room": {
      "uz": "jamoat xonasi",
      "type": "colloc"
    },
    "dramatically": {
      "uz": "keskin",
      "type": "adv"
    },
    "neighborly relations": {
      "uz": "qo'shnichilik munosabatlari",
      "type": "colloc"
    },
    "Moreover": {
      "uz": "Bundan tashqari",
      "type": "adv"
    },
    "effective communication": {
      "uz": "samarali aloqa",
      "type": "colloc"
    },
    "resident meetings": {
      "uz": "aholi yig'ilishlari",
      "type": "colloc"
    },
    "mutual respect": {
      "uz": "o'zaro hurmat",
      "type": "colloc"
    },
    "common areas": {
      "uz": "umumiy hududlar",
      "type": "colloc"
    },
    "social events": {
      "uz": "ijtimoiy tadbirlar",
      "type": "colloc"
    },
    "Ultimately": {
      "uz": "Oxir-oqibat",
      "type": "adv"
    },
    "physical infrastructure": {
      "uz": "jismoniy infratuzilma",
      "type": "colloc"
    },
    "consideration": {
      "uz": "e'tibor",
      "type": "colloc"
    },
    "fulfilling": {
      "uz": "qoniqarli",
      "type": "colloc"
    }
  }
};