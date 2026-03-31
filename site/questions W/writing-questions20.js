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
    "p1_context": "You received this email from a local restaurant.",
    "p1_scenario": "Dear Guest,\n\nThank you for dining with us recently. We hope you had a wonderful experience!\nCould you tell us what you thought of the food quality and variety on our menu?\nWe would also like to know about the service you received. Was our staff attentive and friendly?\nFinally, what did you think of the restaurant's atmosphere and cleanliness?\nYour feedback is valuable to us!\n\nThe Restaurant Manager",
    "t11": {
      "title": "Task 1.1",
      "target": "50 words",
      "prompt": "Write a message to your friend, who also eats at this restaurant. Write about your feelings and what you think the restaurant management should do.",
      "sample": "Hey!\n\nI just got an email from that restaurant we went to! The food was <span class=\"ml-token adv\">absolutely</span> <span class=\"ml-token colloc\">delicious</span>, but I think they <span class=\"ml-token modal\">should</span> add more <span class=\"ml-token colloc\">vegetarian options</span>. The service was a bit slow, wasn't it? But the <span class=\"ml-token colloc\">cozy atmosphere</span> made up for it!\n\nShall we go back soon?",
      "sampleA1": "<p>Hi friend,<br>Restaurant good. Food good. I like it. Bye.</p>",
      "sampleA2": "<p>Hi! I went to the restaurant. The food was good, and the people were nice. But it was slow. They need to be faster. See you!</p>",
      "sampleB1": "<p>Hey!<br><br>I got an email about that restaurant. The food was really good, I think. However, there weren't many choices. The service was okay, but they could be quicker. In my opinion, they should add more things to the menu and train the staff to be faster. What do you think?</p>",
      "sampleB2": "<p>Hey,<br><br>Guess what? I received a feedback request from the restaurant we visited. The food quality was generally impressive, although the menu could benefit from greater diversity, particularly in vegetarian dishes. The service, while friendly, was somewhat lacking in efficiency. I believe management should consider streamlining their processes to improve wait times. Overall, a pleasant experience, but with room for improvement. Fancy going again sometime?</p>",
      "uzSample": "<p>Salom!</p>\n<p>Men hozirgina biz borgan restorandan xat oldim! Ovqat <span class=\"ml-token adv\">juda ham</span> <span class=\"ml-token colloc\">mazali</span> edi, lekin menimcha ular ko'proq <span class=\"ml-token colloc\">vegetarian taomlarni</span> qo'shishlari <span class=\"ml-token modal\">kerak</span>. Xizmat biroz sekin edi, shunday emasmi? Lekin <span class=\"ml-token colloc\">qulay muhit</span> buni qopladi!</p>\n<p>Yaqinda yana boramizmi?</p>",
      "uzSampleA1": "<p>Salom do'stim,<br>Restoran yaxshi. Ovqat yaxshi. Menga yoqadi. Xayr.</p>",
      "uzSampleA2": "<p>Salom! Men restoranga bordim. Ovqat yaxshi edi, odamlar ham yaxshi. Lekin juda sekin edi. Ular tezroq bo'lishi kerak. Ko'rishguncha!</p>",
      "uzSampleB1": "<p>Salom!<br><br>Menga o'sha restoran haqida xat keldi. Ovqat juda mazali edi, menimcha. Lekin tanlash uchun ko'p narsa yo'q edi. Xizmat yaxshi edi, lekin ular tezroq bo'lishi mumkin edi. Mening fikrimcha, ular menyuga ko'proq narsa qo'shishlari va xodimlarni tezroq bo'lishga o'rgatishlari kerak. Siz nima deb o'ylaysiz?</p>",
      "uzSampleB2": "<p>Salom,<br><br>Nima bo'lganini bilasanmi? Biz borgan restorandan fikr-mulohaza so'rovi keldi. Ovqat sifati umuman olganda yaxshi edi, lekin menyu xilma-xillikni, ayniqsa vegetarian taomlar bo'yicha ko'proq bo'lishi kerak. Xizmat ko'rsatish do'stona bo'lsa-da, unumdorlik yetishmas edi. Menimcha, rahbariyat kutish vaqtini yaxshilash uchun jarayonlarni soddalashtirishni o'ylab ko'rishi kerak. Umuman olganda, yoqimli tajriba, lekin yaxshilanishga joy bor. Qachondir yana borishni xohlaysanmi?</p>"
    },
    "t12": {
      "title": "Task 1.2",
      "target": "120–150 words",
      "prompt": "Write a letter to the restaurant. Write about your feelings and what you think the restaurant management should do.",
      "sample": "<p>Dear Restaurant Manager,</p>\n\n<p>Thank you for asking for my feedback. I <span class=\"ml-token adv\">recently</span> dined at your restaurant and <span class=\"ml-token modal\">would</span> like to share my thoughts.</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, the <span class=\"ml-token colloc\">food quality</span> was <span class=\"ml-token colloc\">outstanding</span>. The dishes were <span class=\"ml-token adv\">beautifully</span> presented and <span class=\"ml-token colloc\">bursting with flavor</span>. <span class=\"ml-token adv\">However</span>, I <span class=\"ml-token modal\">would</span> suggest expanding the <span class=\"ml-token colloc\">vegetarian selection</span>, as options were <span class=\"ml-token adv\">somewhat</span> limited.</p>\n\n<p><span class=\"ml-token adv\">Additionally</span>, while your staff were <span class=\"ml-token adv\">extremely</span> friendly and <span class=\"ml-token colloc\">professional</span>, the service was a little slow during <span class=\"ml-token colloc\">busy periods</span>. <span class=\"ml-token adv\">Perhaps</span> hiring additional staff during <span class=\"ml-token colloc\">peak times</span> <span class=\"ml-token modal\">could</span> help.</p>\n\n<p><span class=\"ml-token adv\">Furthermore</span>, the <span class=\"ml-token colloc\">ambiance</span> was <span class=\"ml-token colloc\">warm and inviting</span>, and the restaurant was <span class=\"ml-token adv\">spotlessly</span> clean. The <span class=\"ml-token colloc\">background music</span> created a <span class=\"ml-token colloc\">relaxing atmosphere</span>.</p>\n\n<p>Overall, I had a <span class=\"ml-token colloc\">pleasant dining experience</span> and will <span class=\"ml-token adv\">definitely</span> return.</p>\n\n<p>Best regards,<br>A Satisfied Customer</p>",
      "sampleA1": "<p>Hi!<br>Food good. I like pizza. Staff nice. Restaurant clean. Bye!</p>",
      "sampleA2": "<p>Hello,<br><br>Thank you for email. The food was good, and I liked the pasta. But the menu had not many choices. The people working there were nice and helpful. The restaurant was clean and I liked it. Thank you.<br><br>Bye,<br>A Customer</p>",
      "sampleB1": "<p>Dear Restaurant Manager,<br><br>Thank you for your email. I wanted to tell you about my visit to your restaurant. I think the food was very good. I especially liked the steak. However, I think you could have more desserts on the menu. The service was also good. The staff were friendly and helpful. The restaurant was clean and the atmosphere was nice. I would come again.<br><br>Sincerely,<br>A Happy Customer</p>",
      "sampleB2": "<p>Dear Restaurant Manager,<br><br>Thank you for your email requesting feedback. I am writing to express my opinion regarding my recent dining experience at your establishment.<br><br>Regarding the food, I found the quality to be generally high. However, the menu could benefit from a greater variety of dishes, particularly in the seafood section. While the options available were well-prepared, the selection was somewhat limited.<br><br>The service was generally satisfactory; the staff were polite and efficient. However, there were a couple of instances where I had to wait longer than expected to be served, despite the restaurant not being overly crowded. More attention to table management might be beneficial.<br><br>The restaurant's atmosphere was pleasant and inviting, and I appreciated the cleanliness of the premises. Overall, I enjoyed my visit and would consider returning in the future.<br><br>Yours sincerely,<br>A Valued Customer</p>",
      "uzSample": "<p>Hurmatli restoran menejeri,</p>\n\n<p>Fikrimni so'raganingiz uchun rahmat. Yaqinda restoraningizda ovqatlandim va o'z fikrlarimni bo'lishmoqchiman.</p>\n\n<p>Avvalo, taomlarning sifati juda yuqori edi. Taomlar chiroyli tarzda taqdim etilgan va ta'mga boy edi. Biroq, vegetarian taomlar tanlovini kengaytirishni taklif qilaman, chunki variantlar biroz cheklangan edi.</p>\n\n<p>Bundan tashqari, xodimlaringiz juda do'stona va professional bo'lishiga qaramay, xizmat ko'rsatish gavjum paytlarda biroz sekin edi. Ehtimol, eng yuqori vaqtlarda qo'shimcha xodimlar yollash yordam berishi mumkin.</p>\n\n<p>Bundan tashqari, muhit iliq va jozibali edi, restoran esa juda toza edi. Fon musiqasi tinchlantiruvchi muhit yaratdi.</p>\n\n<p>Umuman olganda, men yoqimli ovqatlanish tajribasiga ega bo'ldim va albatta qaytib kelaman.</p>\n\n<p>Eng yaxshi tilaklar bilan,<br>Qoniqan mijoz</p>",
      "uzSampleA1": "<p>Salom!<br>Ovqat yaxshi. Menga pizza yoqadi. Xodimlar yaxshi. Restoran toza. Xayr!</p>",
      "uzSampleA2": "<p>Salom,<br><br>Xat uchun rahmat. Ovqat yaxshi edi, va menga pasta yoqdi. Lekin menyuda tanlash uchun ko'p narsa yo'q edi. U yerda ishlaydigan odamlar yaxshi va yordam berishga tayyor edilar. Restoran toza edi va menga yoqdi. Rahmat.<br><br>Xayr,<br>Mijoz</p>",
      "uzSampleB1": "<p>Hurmatli Restoran Menejeri,<br><br>Elektron pochtangiz uchun rahmat. Men sizga restoraningizga tashrifim haqida aytmoqchi edim. Menimcha, ovqat juda yaxshi edi. Menga ayniqsa biftek yoqdi. Biroq, menimcha, menyuda ko'proq desertlar bo'lishi mumkin edi. Xizmat ham yaxshi edi. Xodimlar do'stona va yordam berishga tayyor edilar. Restoran toza va muhit yoqimli edi. Men yana kelardim.<br><br>Hurmat bilan,<br>Baxtli Mijoz</p>",
      "uzSampleB2": "<p>Hurmatli Restoran Menejeri,<br><br>Fikr-mulohazalaringizni so'rab yozgan elektron pochtangiz uchun rahmat. Men sizning muassasangizda yaqinda bo'lib o'tgan ovqatlanish tajribam haqida o'z fikrimni bildirish uchun yozyapman.<br><br>Ovqatga kelsak, men sifatni umuman yuqori deb topdim. Biroq, menyu, ayniqsa dengiz mahsulotlari bo'limida, ko'proq turli xil taomlardan foyda ko'rishi mumkin. Mavjud variantlar yaxshi tayyorlangan bo'lsa-da, tanlov biroz cheklangan edi.<br><br>Xizmat ko'rsatish umuman qoniqarli edi; xodimlar xushmuomala va samarali edi. Biroq, restoranda haddan tashqari gavjum bo'lmasa ham, menga xizmat ko'rsatishni kutilganidan uzoqroq kutishga to'g'ri kelgan bir-ikki holat bo'ldi. Stol boshqaruviga ko'proq e'tibor qaratish foydali bo'lishi mumkin.<br><br>Restoranning muhiti yoqimli va jozibali edi va men binolarning tozaligini qadrladim. Umuman olganda, tashrifimdan zavqlandim va kelajakda qaytib kelishni o'ylab ko'raman.<br><br>Hurmat bilan,<br>Qadrdon Mijoz</p>"
    },
    "t2": {
      "title": "Task 2",
      "target": "180–200 words",
      "prompt": "A student magazine announced an article writing contest. The best ones will be published in the magazine. Write your article on this topic: \"Should schools teach students practical life skills like cooking and managing money?\" Write 180–200 words, giving reasons and examples.",
      "sample": "<h2>Beyond Textbooks: Why Life Skills Matter</h2>\n\n<p>While academic subjects remain essential, there is a growing argument that schools <span class=\"ml-token modal\">should</span> also teach <span class=\"ml-token colloc\">practical life skills</span> such as cooking and <span class=\"ml-token colloc\">financial management</span>.</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, many young adults leave school <span class=\"ml-token adv\">completely</span> unprepared for <span class=\"ml-token colloc\">independent living</span>. Basic skills like preparing meals, budgeting, and managing bills are <span class=\"ml-token adv\">often</span> learned through <span class=\"ml-token colloc\">trial and error</span>, leading to <span class=\"ml-token colloc\">financial difficulties</span> and <span class=\"ml-token colloc\">poor nutrition</span>.</p>\n\n<p><span class=\"ml-token adv\">Moreover</span>, teaching cooking <span class=\"ml-token modal\">could</span> <span class=\"ml-token adv\">significantly</span> improve <span class=\"ml-token colloc\">public health</span>. Understanding nutrition and being able to prepare <span class=\"ml-token colloc\">healthy meals</span> <span class=\"ml-token modal\">would</span> reduce reliance on <span class=\"ml-token colloc\">fast food</span> and processed foods.</p>\n\n<p><span class=\"ml-token adv\">Similarly</span>, <span class=\"ml-token colloc\">financial literacy</span> is <span class=\"ml-token adv\">increasingly</span> important. Students <span class=\"ml-token modal\">should</span> learn about saving, investing, and avoiding debt. This knowledge <span class=\"ml-token modal\">would</span> help prevent many of the <span class=\"ml-token colloc\">financial problems</span> young people face today.</p>\n\n<p><span class=\"ml-token adv\">However</span>, some argue that parents, not schools, <span class=\"ml-token modal\">should</span> teach these skills. While this is valid, not all children have access to such guidance at home.</p>\n\n<p><span class=\"ml-token adv\">Ultimately</span>, incorporating <span class=\"ml-token colloc\">life skills</span> into the curriculum <span class=\"ml-token modal\">would</span> better prepare students for <span class=\"ml-token colloc\">adult life</span> and create more <span class=\"ml-token colloc\">capable citizens</span>.</p>",
      "sampleA1": "<p>Hi! <br> The restaurant is good. <br> Food is good. <br> I like it. <br> Bye!</p>",
      "sampleA2": "<p>Hello, <br> I went to your restaurant. The food was good, and the people were nice. I liked the food because it was tasty. But the restaurant was a little dirty. I think you should clean it more. Thank you!</p>",
      "sampleB1": "<p>Dear Editor,<br><br>I think schools should teach students life skills. It's very important. For example, cooking is a useful skill. If you can cook, you can eat healthy food and save money. Also, managing money is important. Students need to learn about saving and spending. <br><br>Some people say that parents should teach these skills. However, not all parents have time. Schools can help students learn these things. It will make them more independent. In my opinion, life skills are as important as other subjects.<br><br>Thank you.</p>",
      "sampleB2": "<p>To the Editor,<br><br>There's a growing debate about whether schools should incorporate practical life skills into their curriculum, such as cooking and money management. I firmly believe that they should. <br><br>Firstly, many young people leave education without the basic knowledge required for independent living. They may struggle to cook nutritious meals, leading to unhealthy diets. Teaching basic culinary skills could empower them to make healthier choices and reduce reliance on processed foods. Moreover, learning to cook can be a fun and creative activity, fostering a sense of accomplishment.<br><br>Secondly, financial literacy is crucial in today's complex economic landscape. Students should be taught how to budget, save, and understand credit. This knowledge would equip them to make informed financial decisions and avoid debt, ultimately contributing to their long-term financial well-being. While some argue that these skills are best taught at home, the reality is that not all students have access to this kind of support. Schools can provide a level playing field, ensuring that all students have the opportunity to learn these essential skills.<br><br>Sincerely,<br>A Concerned Student</p>",
      "uzSample": "<h2>Darsliklardan tashqari: Hayotiy ko'nikmalar nega muhim?</h2>\n\n<p>Akademik fanlar muhimligicha qolsa-da, maktablar oshpazlik va moliyaviy boshqaruv kabi amaliy hayotiy ko'nikmalarni ham o'rgatishi kerak degan fikr tobora kuchayib bormoqda.</p>\n\n<p>Birinchidan, ko'plab yoshlar maktabni mustaqil hayotga butunlay tayyorgarliksiz tark etadilar. Ovqat tayyorlash, byudjetlashtirish va to'lovlarni boshqarish kabi asosiy ko'nikmalar ko'pincha xato va tajriba orqali o'rganiladi, bu esa moliyaviy qiyinchiliklar va noto'g'ri ovqatlanishga olib keladi.</p>\n\n<p>Bundan tashqari, oshpazlikni o'rgatish jamoat salomatligini sezilarli darajada yaxshilashi mumkin. Oziqlanishni tushunish va sog'lom ovqatlar tayyorlay olish tez tayyorlanadigan ovqatlar va qayta ishlangan oziq-ovqatlarga bog'liqlikni kamaytiradi.</p>\n\n<p>Shunga o'xshash tarzda, moliyaviy savodxonlik tobora muhim ahamiyat kasb etmoqda. Talabalar jamg'arish, investitsiya qilish va qarzdan qochish haqida bilishlari kerak. Bu bilim yoshlarning bugungi kunda duch kelayotgan ko'plab moliyaviy muammolarining oldini olishga yordam beradi.</p>\n\n<p>Biroq, ba'zilar bu ko'nikmalarni maktablar emas, balki ota-onalar o'rgatishi kerak, deb ta'kidlaydilar. Bu to'g'ri bo'lsa-da, hamma bolalar ham uyda bunday yo'l-yo'riqlarga ega emas.</p>\n\n<p>Nihoyat, hayotiy ko'nikmalarni o'quv dasturiga kiritish talabalarni kattalar hayotiga yaxshiroq tayyorlaydi va yanada qobiliyatli fuqarolarni yaratadi.</p>",
      "uzSampleA1": "<p>Salom! <br> Restoran yaxshi. <br> Ovqat yaxshi. <br> Menga yoqadi. <br> Xayr!</p>",
      "uzSampleA2": "<p>Salom, <br> Men sizning restoraningizga bordim. Ovqat yaxshi edi, odamlar ham yaxshi edi. Menga ovqat yoqdi, chunki u mazali edi. Lekin restoran biroz iflos edi. O'ylaymanki, siz uni ko'proq tozalashingiz kerak. Rahmat!</p>",
      "uzSampleB1": "<p>Hurmatli muharrir,<br><br>Menimcha, maktablar o'quvchilarga hayotiy ko'nikmalarni o'rgatishi kerak. Bu juda muhim. Masalan, ovqat pishirish foydali ko'nikma. Agar siz ovqat pishira olsangiz, sog'lom ovqatlar yeyishingiz va pulni tejashingiz mumkin. Shuningdek, pulni boshqarish ham muhim. O'quvchilar tejash va sarflash haqida bilishlari kerak.<br><br>Ba'zi odamlar bu ko'nikmalarni ota-onalar o'rgatishi kerak deyishadi. Biroq, hamma ota-onalarning ham vaqti yo'q. Maktablar o'quvchilarga bu narsalarni o'rganishga yordam berishi mumkin. Bu ularni yanada mustaqil qiladi. Mening fikrimcha, hayotiy ko'nikmalar boshqa fanlar kabi muhimdir.<br><br>Rahmat.</p>",
      "uzSampleB2": "<p>Muharrirga,<br><br>Maktablar o'quv dasturiga ovqat pishirish va pulni boshqarish kabi amaliy hayotiy ko'nikmalarni kiritishi kerakmi yoki yo'qmi, degan bahs tobora kuchayib bormoqda. Men shaxsan ular kiritishi kerak, deb hisoblayman.<br><br>Birinchidan, ko'plab yoshlar mustaqil hayot kechirish uchun zarur bo'lgan asosiy bilimlarsiz ta'limni tark etishadi. Ular to'yimli ovqat tayyorlashda qiynalishi, bu esa noto'g'ri ovqatlanishga olib kelishi mumkin. Oddiy pazandalik ko'nikmalarini o'rgatish ularga sog'lom tanlov qilish va qayta ishlangan mahsulotlarga qaramlikni kamaytirish imkonini beradi. Bundan tashqari, ovqat pishirishni o'rganish qiziqarli va ijodiy faoliyat bo'lishi mumkin, bu esa muvaffaqiyat hissini uyg'otadi.<br><br>Ikkinchidan, moliyaviy savodxonlik bugungi murakkab iqtisodiy sharoitda juda muhimdir. Talabalarga byudjetni rejalashtirish, pul yig'ish va kreditni tushunish o'rgatilishi kerak. Bu bilim ularga moliyaviy jihatdan to'g'ri qarorlar qabul qilish va qarzdan qochish imkonini beradi, bu esa oxir-oqibatda ularning uzoq muddatli moliyaviy farovonligiga hissa qo'shadi. Ba'zilar bu ko'nikmalar uyda o'rgatilgani yaxshiroq, deb ta'kidlashsa-da, haqiqat shuki, hamma talabalarda ham bunday yordam olish imkoniyati yo'q. Maktablar barcha talabalarga ushbu muhim ko'nikmalarni o'rganish imkoniyatiga ega bo'lishini ta'minlab, teng sharoit yaratishi mumkin.<br><br>Hurmat bilan,<br>Beparvo bo'lmagan talaba</p>"
    }
  },
  "vocabulary": {
    "task11": [
      {
        "en": "absolutely delicious",
        "uz": "mutlaqo mazali"
      },
      {
        "en": "vegetarian options",
        "uz": "vegetarian variantlari"
      },
      {
        "en": "service was slow",
        "uz": "xizmat sekin edi"
      },
      {
        "en": "cozy atmosphere",
        "uz": "qulay muhit"
      },
      {
        "en": "made up for it",
        "uz": "qopladi"
      },
      {
        "en": "go back soon",
        "uz": "tez orada qaytmoq"
      },
      {
        "en": "great food",
        "uz": "ajoyib taom"
      },
      {
        "en": "friendly staff",
        "uz": "samimiy xodimlar"
      },
      {
        "en": "nice place",
        "uz": "yaxshi joy"
      },
      {
        "en": "recommend it",
        "uz": "tavsiya qilmoq"
      },
      {
        "en": "worth trying",
        "uz": "sinab ko'rishga arziydi"
      },
      {
        "en": "menu selection",
        "uz": "menyu tanlovi"
      },
      {
        "en": "table booking",
        "uz": "stol bron qilish"
      },
      {
        "en": "portion sizes",
        "uz": "porsiya o'lchamlari"
      },
      {
        "en": "reasonable prices",
        "uz": "maqbul narxlar"
      },
      {
        "en": "waiting time",
        "uz": "kutish vaqti"
      },
      {
        "en": "main course",
        "uz": "asosiy taom"
      },
      {
        "en": "dessert menu",
        "uz": "desert menyusi"
      },
      {
        "en": "dining experience",
        "uz": "ovqatlanish tajribasi"
      },
      {
        "en": "shall we go",
        "uz": "boramizmi"
      }
    ],
    "task12": [
      {
        "en": "food quality",
        "uz": "taom sifati"
      },
      {
        "en": "outstanding",
        "uz": "ajoyib"
      },
      {
        "en": "beautifully presented",
        "uz": "chiroyli bezatilgan"
      },
      {
        "en": "bursting with flavor",
        "uz": "ta'mga boy"
      },
      {
        "en": "vegetarian selection",
        "uz": "vegetarian tanlovi"
      },
      {
        "en": "somewhat limited",
        "uz": "biroz cheklangan"
      },
      {
        "en": "professional staff",
        "uz": "professional xodimlar"
      },
      {
        "en": "busy periods",
        "uz": "band davrlar"
      },
      {
        "en": "peak times",
        "uz": "eng band vaqtlar"
      },
      {
        "en": "warm and inviting",
        "uz": "iliq va jozibali"
      },
      {
        "en": "spotlessly clean",
        "uz": "terandan toza"
      },
      {
        "en": "background music",
        "uz": "fon musiqasi"
      },
      {
        "en": "relaxing atmosphere",
        "uz": "dam olish muhiti"
      },
      {
        "en": "pleasant dining experience",
        "uz": "yoqimli ovqatlanish tajribasi"
      },
      {
        "en": "satisfied customer",
        "uz": "mamnun mijoz"
      },
      {
        "en": "attentive service",
        "uz": "e'tiborli xizmat"
      },
      {
        "en": "menu variety",
        "uz": "menyu xilma-xilligi"
      },
      {
        "en": "value for money",
        "uz": "pulga arziydi"
      },
      {
        "en": "return visit",
        "uz": "qayta tashrif"
      },
      {
        "en": "highly recommend",
        "uz": "qattiq tavsiya qilmoq"
      }
    ],
    "task2": [
      {
        "en": "practical life skills",
        "uz": "amaliy hayotiy ko'nikmalar"
      },
      {
        "en": "financial management",
        "uz": "moliyaviy boshqaruv"
      },
      {
        "en": "independent living",
        "uz": "mustaqil yashash"
      },
      {
        "en": "trial and error",
        "uz": "sinov va xato"
      },
      {
        "en": "financial difficulties",
        "uz": "moliyaviy qiyinchiliklar"
      },
      {
        "en": "poor nutrition",
        "uz": "yomon ovqatlanish"
      },
      {
        "en": "public health",
        "uz": "jamoat salomatligi"
      },
      {
        "en": "healthy meals",
        "uz": "sog'lom taomlar"
      },
      {
        "en": "fast food",
        "uz": "tez taom"
      },
      {
        "en": "financial literacy",
        "uz": "moliyaviy savodxonlik"
      },
      {
        "en": "avoiding debt",
        "uz": "qarzdan qochish"
      },
      {
        "en": "financial problems",
        "uz": "moliyaviy muammolar"
      },
      {
        "en": "life skills",
        "uz": "hayotiy ko'nikmalar"
      },
      {
        "en": "adult life",
        "uz": "kattalar hayoti"
      },
      {
        "en": "capable citizens",
        "uz": "qobiliyatli fuqarolar"
      },
      {
        "en": "curriculum",
        "uz": "o'quv dasturi"
      },
      {
        "en": "basic skills",
        "uz": "asosiy ko'nikmalar"
      },
      {
        "en": "budget management",
        "uz": "byudjet boshqaruvi"
      },
      {
        "en": "money management",
        "uz": "pulni boshqarish"
      },
      {
        "en": "essential knowledge",
        "uz": "zaruriy bilim"
      }
    ]
  },
  "tokenTranslations": {
    "absolutely": {
      "uz": "mutlaqo",
      "type": "adv"
    },
    "delicious": {
      "uz": "mazali",
      "type": "colloc"
    },
    "should": {
      "uz": "kerak",
      "type": "modal"
    },
    "vegetarian options": {
      "uz": "vegetarian taomlar",
      "type": "colloc"
    },
    "cozy atmosphere": {
      "uz": "shinam muhit",
      "type": "colloc"
    },
    "recently": {
      "uz": "yaqinda",
      "type": "adv"
    },
    "would": {
      "uz": "edi",
      "type": "modal"
    },
    "Firstly": {
      "uz": "Avvalo",
      "type": "adv"
    },
    "food quality": {
      "uz": "taom sifati",
      "type": "colloc"
    },
    "outstanding": {
      "uz": "ajoyib",
      "type": "colloc"
    },
    "beautifully": {
      "uz": "chiroyli tarzda",
      "type": "adv"
    },
    "bursting with flavor": {
      "uz": "ta'mga boy",
      "type": "colloc"
    },
    "However": {
      "uz": "Biroq",
      "type": "adv"
    },
    "vegetarian selection": {
      "uz": "vegetarian tanlov",
      "type": "colloc"
    },
    "somewhat": {
      "uz": "bir oz",
      "type": "adv"
    },
    "Additionally": {
      "uz": "Qo'shimcha ravishda",
      "type": "adv"
    },
    "extremely": {
      "uz": "juda",
      "type": "adv"
    },
    "professional": {
      "uz": "professional",
      "type": "colloc"
    },
    "busy periods": {
      "uz": "band vaqtlar",
      "type": "colloc"
    },
    "Perhaps": {
      "uz": "Ehtimol",
      "type": "adv"
    },
    "peak times": {
      "uz": "eng gavjum vaqtlar",
      "type": "colloc"
    },
    "could": {
      "uz": "mumkin",
      "type": "modal"
    },
    "Furthermore": {
      "uz": "Bundan tashqari",
      "type": "adv"
    },
    "ambiance": {
      "uz": "muhit",
      "type": "colloc"
    },
    "warm and inviting": {
      "uz": "iliq va jozibali",
      "type": "colloc"
    },
    "spotlessly": {
      "uz": "jilvalanib",
      "type": "adv"
    },
    "background music": {
      "uz": "fon musiqasi",
      "type": "colloc"
    },
    "relaxing atmosphere": {
      "uz": "xotirjam muhit",
      "type": "colloc"
    },
    "pleasant dining experience": {
      "uz": "yoqimli ovqatlanish tajribasi",
      "type": "colloc"
    },
    "definitely": {
      "uz": "albatta",
      "type": "adv"
    },
    "practical life skills": {
      "uz": "amaliy hayotiy ko'nikmalar",
      "type": "colloc"
    },
    "financial management": {
      "uz": "moliyaviy boshqaruv",
      "type": "colloc"
    },
    "completely": {
      "uz": "butunlay",
      "type": "adv"
    },
    "independent living": {
      "uz": "mustaqil hayot",
      "type": "colloc"
    },
    "often": {
      "uz": "ko'pincha",
      "type": "adv"
    },
    "trial and error": {
      "uz": "sinov va xato",
      "type": "colloc"
    },
    "financial difficulties": {
      "uz": "moliyaviy qiyinchiliklar",
      "type": "colloc"
    },
    "poor nutrition": {
      "uz": "noto'g'ri ovqatlanish",
      "type": "colloc"
    },
    "Moreover": {
      "uz": "Qolaversa",
      "type": "adv"
    },
    "significantly": {
      "uz": "sezilarli darajada",
      "type": "adv"
    },
    "public health": {
      "uz": "jamoat salomatligi",
      "type": "colloc"
    },
    "healthy meals": {
      "uz": "sog'lom taomlar",
      "type": "colloc"
    },
    "fast food": {
      "uz": "tez tayyorlanadigan ovqat",
      "type": "colloc"
    },
    "Similarly": {
      "uz": "Shunga o'xshash",
      "type": "adv"
    },
    "financial literacy": {
      "uz": "moliyaviy savodxonlik",
      "type": "colloc"
    },
    "increasingly": {
      "uz": "tobora",
      "type": "adv"
    },
    "financial problems": {
      "uz": "moliyaviy muammolar",
      "type": "colloc"
    },
    "Ultimately": {
      "uz": "Oxir-oqibat",
      "type": "adv"
    },
    "life skills": {
      "uz": "hayotiy ko'nikmalar",
      "type": "colloc"
    },
    "adult life": {
      "uz": "kattalar hayoti",
      "type": "colloc"
    },
    "capable citizens": {
      "uz": "layoqatli fuqarolar",
      "type": "colloc"
    }
  }
};