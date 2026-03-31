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
      "sampleB2": "<p>Dear [Friend's Name],<br>Just wanted to give you my thoughts on that hotel you're planning to book. Overall, it was a positive experience. The room was immaculate, and the breakfast buffet offered a decent variety. The only slight drawback was the location; it's a bit further from the city center than I initially thought. I'd recommend it, but perhaps check the exact location in relation to where you need to be. Hope this helps!</p>",
      "uzSample": "<p>Salom!</p>\n<p>Men hozirgina sen ko'rib chiqayotgan o'sha mehmonxonadan qaytdim! Xona juda toza edi va nonushta bufeti ajoyib edi! Menimcha, sen albatta bron qilishing kerak. Yagona kamchiligi sekin wifi edi.</p>\n<p>Senga yoqadi!</p>",
      "uzSampleA1": "<p>Salom, [Do'stingizning ismi],<br>Mehmonxona yaxshi. Xona toza. Ovqat yaxshi. Xayr.</p>",
      "uzSampleA2": "<p>Salom [Do'stingizning ismi],<br>Men mehmonxonada qoldim. U yaxshi edi va xona toza edi. Nonushta ham yaxshi edi. Lekin u biroz qimmat edi. Menga yoqdi!</p>",
      "uzSampleB1": "<p>Salom, [Do'stingizning ismi],<br>Men yaqinda sen bormoqchi bo'lgan o'sha mehmonxonada bo'ldim! Menimcha, u juda yaxshi edi. Xona toza edi, bu men uchun muhim. Nonushta ham yaxshi edi, ularda tanlash uchun juda ko'p narsa bor edi. Biroq, kechasi biroz shovqinli edi. O'ylaymanki, senga yoqadi!</p>",
      "uzSampleB2": "<p>Salom [Do'stingizning ismi],<br>Siz bron qilmoqchi bo'lgan mehmonxona haqida o'z fikrlarimni bildirmoqchiman. Umuman olganda, bu ijobiy tajriba edi. Xona juda toza edi va nonushta bufeti yaxshi turli xilliklarni taklif etardi. Yagona kichik kamchilik - bu joylashuvi edi; u shahar markazidan men o'ylaganimdan biroz uzoqroq. Men uni tavsiya qilaman, lekin ehtiyojlaringizga nisbatan aniq joylashuvini tekshirib ko'ring. Umid qilamanki, bu yordam beradi!</p>"
    },
    "t12": {
      "title": "Task 1.2",
      "target": "120–150 words",
      "prompt": "Write a letter to the hotel manager. Write about your feelings and what you think the hotel management should do.",
      "sample": "<p>Dear Hotel Manager,</p>\n\n<p>Thank you for requesting feedback on my recent stay. I am pleased to share my experience.</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, the <span class=\"ml-token colloc\">room cleanliness</span> was <span class=\"ml-token adv\">exceptional</span>. The housekeeping staff <span class=\"ml-token modal\">should</span> be commended for their <span class=\"ml-token colloc\">attention to detail</span>.</p>\n\n<p><span class=\"ml-token adv\">Additionally</span>, the <span class=\"ml-token colloc\">breakfast service</span> offered excellent variety. The fresh fruits and <span class=\"ml-token colloc\">hot dishes</span> were <span class=\"ml-token adv\">particularly</span> enjoyable.</p>\n\n<p><span class=\"ml-token adv\">However</span>, I <span class=\"ml-token modal\">would</span> suggest improving the <span class=\"ml-token colloc\">wifi connectivity</span>. The connection was <span class=\"ml-token adv\">rather</span> slow, which was inconvenient for business travelers.</p>\n\n<p><span class=\"ml-token adv\">Furthermore</span>, extending <span class=\"ml-token colloc\">checkout time</span> to noon <span class=\"ml-token modal\">would</span> be appreciated by many guests.</p>\n\n<p>Overall, I had a <span class=\"ml-token colloc\">pleasant stay</span> and <span class=\"ml-token modal\">would</span> recommend your hotel.</p>\n\n<p>Yours sincerely,<br>A Satisfied Guest</p>",
      "sampleA1": "<p>Hi Hotel,</p>\n<p>Room good. Clean.</p>\n<p>Breakfast okay.</p>\n<p>Bye</p>",
      "sampleA2": "<p>Dear Hotel Manager,</p>\n<p>Thank you for the email. The room was good and it was clean. The breakfast was also good, but the coffee was not very hot.</p>\n<p>I think you should have more hot coffee. And maybe more fruit.</p>\n<p>Thank you.</p>",
      "sampleB1": "<p>Dear Hotel Manager,</p>\n<p>Thank you for your email asking about my stay. Overall, I had a good experience at your hotel.</p>\n<p>The room was clean and comfortable. I also thought the breakfast was nice, especially the variety of food available. However, I think the breakfast room was a bit crowded.</p>\n<p>One suggestion I have is to improve the signage in the hotel. I found it a little difficult to find my way around. Also, perhaps you could offer more vegetarian options at breakfast.</p>\n<p>Thank you again for a pleasant stay.</p>\n<p>Sincerely,</p>\n<p>[Your Name]</p>",
      "sampleB2": "<p>Dear Hotel Manager,</p>\n<p>Thank you for your email requesting feedback regarding my recent stay at your hotel. I am writing to provide you with my observations.</p>\n<p>In general, I found the room to be well-maintained and the level of cleanliness was commendable. The breakfast service was also quite satisfactory, with a decent selection of items on offer. However, I did feel that the quality of the pastries could be improved.</p>\n<p>Regarding suggestions for improvement, I would recommend investing in upgrading the gym equipment, as it appeared somewhat outdated. Furthermore, perhaps offering a wider range of international television channels would cater to a more diverse clientele.</p>\n<p>Overall, my stay was positive, and I would consider staying at your hotel again in the future. Thank you for your attention to these matters.</p>\n<p>Yours sincerely,</p>\n<p>[Your Name]</p>",
      "uzSample": "<p>Hurmatli mehmonxona menejeri,</p>\n\n<p>Yaqinda bo'lganim haqida fikr-mulohazalaringizni so'raganingiz uchun tashakkur. Tajribamni baham ko'rishdan mamnunman.</p>\n\n<p>Avvalo, xonaning tozaligi a'lo darajada edi. Uy tozalash xodimlari o'z ishlariga e'tiborli bo'lganliklari uchun maqtovga loyiq.</p>\n\n<p>Bundan tashqari, nonushta xizmati ajoyib xilma-xillikni taklif qildi. Yangi mevalar va issiq taomlar ayniqsa yoqimli edi.</p>\n\n<p>Biroq, Wi-Fi ulanishini yaxshilashni taklif qilaman. Ulanish juda sekin edi, bu esa biznes sayohatchilari uchun noqulaylik tug'dirdi.</p>\n\n<p>Bundan tashqari, ro'yxatdan o'tish vaqtini tushgacha uzaytirish ko'plab mehmonlar tomonidan qadrlanadi.</p>\n\n<p>Umuman olganda, men yaxshi dam oldim va sizning mehmonxonangizni tavsiya qilaman.</p>\n\n<p>Hurmat bilan,<br>Mamnun mehmon</p>",
      "uzSampleA1": "<p>Salom, mehmonxona,</p>\n<p>Xona yaxshi. Toza.</p>\n<p>Nonushta yaxshi.</p>\n<p>Xayr</p>",
      "uzSampleA2": "<p>Hurmatli mehmonxona menejeri,</p>\n<p>Elektron pochta uchun rahmat. Xona yaxshi va toza edi. Nonushta ham yaxshi edi, lekin kofe juda issiq emas edi.</p>\n<p>Menimcha, sizda ko'proq issiq kofe bo'lishi kerak. Va balki ko'proq meva.</p>\n<p>Rahmat.</p>",
      "uzSampleB1": "<p>Hurmatli mehmonxona menejeri,</p>\n<p>Mening qolishim haqida so'raganingiz uchun elektron pochtangizga rahmat. Umuman olganda, men sizning mehmonxonangizda yaxshi tajribaga ega bo'ldim.</p>\n<p>Xona toza va qulay edi. Men nonushta ham yaxshi deb o'yladim, ayniqsa mavjud ovqatlar xilma-xilligi. Biroq, menimcha, nonushta xonasi biroz gavjum edi.</p>\n<p>Mening bir taklifim shundaki, mehmonxonadagi yo'l-yo'riq ko'rsatkichlarini yaxshilash kerak. Men yo'limni topishda biroz qiynaldim. Shuningdek, ehtimol, nonushtada ko'proq vegetarian variantlarini taklif qilishingiz mumkin.</p>\n<p>Yana bir bor yoqimli dam olish uchun rahmat.</p>\n<p>Hurmat bilan,</p>\n<p>[Sizning ismingiz]</p>",
      "uzSampleB2": "<p>Hurmatli mehmonxona menejeri,</p>\n<p>Mehmonxonangizda yaqinda bo'lganim haqida fikr-mulohazalaringizni so'rab yozgan elektron pochtangiz uchun rahmat. Sizga o'z kuzatishlarimni taqdim etish uchun yozmoqdaman.</p>\n<p>Umuman olganda, xonani yaxshi saqlangan deb topdim va tozalik darajasi maqtovga loyiq edi. Nonushta xizmati ham juda qoniqarli bo'lib, taklif qilinadigan narsalar yaxshi tanlangan edi. Biroq, men xamir mahsulotlarining sifatini yaxshilash mumkin deb his qildim.</p>\n<p>Yaxshilash bo'yicha takliflarga kelsak, sport zalidagi jihozlarni yangilashga sarmoya kiritishni tavsiya qilaman, chunki u biroz eskirgan ko'rinardi. Bundan tashqari, ehtimol, xalqaro telekanallarning kengroq assortimentini taklif qilish ko'proq xilma-xil mijozlarga xizmat qilishi mumkin.</p>\n<p>Umuman olganda, mening mehmonxonada bo'lishim ijobiy bo'ldi va kelajakda yana sizning mehmonxonangizda qolishni o'ylab ko'raman. Ushbu masalalarga e'tiboringiz uchun tashakkur.</p>\n<p>Hurmat bilan,</p>\n<p>[Sizning ismingiz]</p>"
    },
    "t2": {
      "title": "Task 2",
      "target": "180–200 words",
      "prompt": "A student magazine announced an article writing contest. The best ones will be published in the magazine. Write your article on this topic: \"Should plastic bags and single-use plastics be completely banned?\" Write 180–200 words, giving reasons and examples.",
      "sample": "<h2>Hotels vs Vacation Rentals: Which is Better?</h2>\n\n<p>The choice between hotels and <span class=\"ml-token colloc\">vacation rentals</span> depends on <span class=\"ml-token colloc\">individual preferences</span> and travel circumstances. Both options have <span class=\"ml-token colloc\">distinct advantages</span>.</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, hotels offer <span class=\"ml-token colloc\">convenience and services</span>. Daily housekeeping, room service, and <span class=\"ml-token colloc\">24-hour reception</span> make travel easier. For <span class=\"ml-token colloc\">business trips</span> or short stays, hotels are often the <span class=\"ml-token colloc\">practical choice</span>.</p>\n\n<p><span class=\"ml-token adv\">However</span>, vacation rentals provide more <span class=\"ml-token colloc\">space and privacy</span>. Families <span class=\"ml-token modal\">can</span> enjoy separate bedrooms and <span class=\"ml-token colloc\">kitchen facilities</span>, making longer stays more comfortable and <span class=\"ml-token colloc\">cost-effective</span>.</p>\n\n<p><span class=\"ml-token adv\">Moreover</span>, rentals offer a more <span class=\"ml-token colloc\">authentic experience</span>. Staying in a local neighborhood helps travelers <span class=\"ml-token colloc\">immerse themselves</span> in the culture.</p>\n\n<p><span class=\"ml-token adv\">On the other hand</span>, hotels provide <span class=\"ml-token colloc\">security and reliability</span>. You know what to expect, and help is always available.</p>\n\n<p><span class=\"ml-token adv\">Ultimately</span>, the best choice depends on your <span class=\"ml-token colloc\">travel style</span>, budget, and needs. <span class=\"ml-token adv\">Personally</span>, I prefer hotels for city breaks but rentals for <span class=\"ml-token colloc\">family vacations</span>.</p>",
      "sampleA1": "<p>Hi Hotel,</p>\n<p>Room good. Clean. Breakfast good. <br> Bye.</p>",
      "sampleA2": "<p>Dear Hotel Manager,</p>\n<p>I stayed at your hotel. The room was nice and it was clean. The breakfast was good, but it was busy. <br> I think you could have more tables. Thank you.</p>\n<p>Bye.</p>",
      "sampleB1": "<p>Dear Hotel Manager,</p>\n<p>I am writing to give you some feedback about my recent stay at your hotel. Overall, I enjoyed my visit, but there are a few things that could be improved.</p>\n<p>The room was clean and comfortable, which was good. However, the breakfast service was very crowded, and it was difficult to find a table. I think you should consider adding more tables or extending the breakfast hours.</p>\n<p>Also, the Wi-Fi was a bit slow sometimes. It would be helpful if you could improve the internet connection.</p>\n<p>Thank you for your attention to these matters.</p>\n<p>Sincerely,<br> [Your Name]</p>",
      "sampleB2": "<p>Dear Hotel Manager,</p>\n<p>I am writing to provide feedback regarding my recent stay at your hotel. While I generally had a positive experience, I believe there are several areas that warrant attention and potential improvement.</p>\n<p>My room was adequately clean and comfortable; however, the breakfast service was noticeably overcrowded. The limited seating capacity resulted in considerable delays and a somewhat stressful dining experience. Expanding the breakfast hours or increasing the number of tables would likely alleviate this issue.</p>\n<p>Furthermore, the Wi-Fi connectivity proved inconsistent at times, which was particularly inconvenient. Investing in upgrading the internet infrastructure could significantly enhance guest satisfaction.</p>\n<p>Finally, while the staff were generally polite, a more proactive approach to addressing guest inquiries could be beneficial. Perhaps additional training in customer service would be worthwhile.</p>\n<p>Thank you for considering my comments. I hope this feedback proves useful in your ongoing efforts to improve the guest experience.</p>\n<p>Sincerely,<br> [Your Name]</p>",
      "uzSample": "<h2>Mehmonxonalar va Ijara Uylari: Qaysi Biri Yaxshiroq?</h2>\n\n<p>Mehmonxonalar va ijara uylari o'rtasidagi tanlov shaxsiy xohishlarga va sayohat sharoitlariga bog'liq. Ikkala variant ham o'ziga xos afzalliklarga ega.</p>\n\n<p>Birinchidan, mehmonxonalar qulaylik va xizmatlarni taklif etadi. Kundalik tozalash, xona xizmati va 24 soatlik resepshn sayohatni osonlashtiradi. Ish safari yoki qisqa muddatli qolish uchun mehmonxonalar ko'pincha amaliy tanlovdir.</p>\n\n<p>Biroq, ijara uylari ko'proq joy va maxfiylikni ta'minlaydi. Oilalar alohida yotoqxonalardan va oshxona jihozlaridan bahramand bo'lishlari mumkin, bu esa uzoqroq muddatga qolishni yanada qulay va tejamkor qiladi.</p>\n\n<p>Bundan tashqari, ijara uylari yanada haqiqiy tajribani taklif etadi. Mahalliy mahallada yashash sayohatchilarga madaniyatga sho'ng'ishga yordam beradi.</p>\n\n<p>Boshqa tomondan, mehmonxonalar xavfsizlik va ishonchlilikni ta'minlaydi. Siz nimani kutishni bilasiz va yordam har doim mavjud.</p>\n\n<p>Oxir oqibat, eng yaxshi tanlov sizning sayohat uslubingizga, byudjetingizga va ehtiyojlaringizga bog'liq. Shaxsan men shahar sayohatlari uchun mehmonxonalarni, oilaviy ta'tillar uchun esa ijara uylarini afzal ko'raman.</p>",
      "uzSampleA1": "<p>Salom Hotel,</p>\n<p>Xona yaxshi. Toza. Nonushta yaxshi. <br> Xayr.</p>",
      "uzSampleA2": "<p>Hurmatli mehmonxona menejeri,</p>\n<p>Men sizning mehmonxonangizda qoldim. Xona yaxshi va toza edi. Nonushta yaxshi edi, lekin odam ko'p edi. <br> O'ylashimcha, sizda ko'proq stol bo'lishi mumkin edi. Rahmat.</p>\n<p>Xayr.</p>",
      "uzSampleB1": "<p>Hurmatli mehmonxona menejeri,</p>\n<p>Men sizga yaqinda mehmonxonangizda bo'lganim haqida fikr-mulohazalarimni bildirish uchun yozyapman. Umuman olganda, tashrifimdan mamnun bo'ldim, lekin yaxshilanishi mumkin bo'lgan bir nechta narsalar bor.</p>\n<p>Xona toza va qulay edi, bu yaxshi. Biroq, nonushta xizmati juda gavjum edi va stol topish qiyin edi. O'ylaymanki, siz ko'proq stol qo'shishni yoki nonushta soatlarini uzaytirishni ko'rib chiqishingiz kerak.</p>\n<p>Shuningdek, Wi-Fi ba'zan biroz sekin edi. Agar siz internet aloqasini yaxshilashingiz mumkin bo'lsa, foydali bo'lardi.</p>\n<p>Ushbu masalalarga e'tiboringiz uchun rahmat.</p>\n<p>Hurmat bilan,<br> [Sizning ismingiz]</p>",
      "uzSampleB2": "<p>Hurmatli mehmonxona menejeri,</p>\n<p>Men sizning mehmonxonangizda yaqinda bo'lganim haqida fikr-mulohazalarimni bildirish uchun yozyapman. Umuman olganda, ijobiy tajribaga ega bo'lsam-da, e'tiborga loyiq va yaxshilanishi mumkin bo'lgan bir nechta sohalar bor, deb hisoblayman.</p>\n<p>Xonam yetarlicha toza va qulay edi; ammo, nonushta xizmati sezilarli darajada gavjum edi. O'rindiqlarning cheklanganligi sezilarli kechikishlarga va biroz stressli ovqatlanish tajribasiga olib keldi. Nonushta soatlarini uzaytirish yoki stollar sonini ko'paytirish bu muammoni hal qilishi mumkin.</p>\n<p>Bundan tashqari, Wi-Fi ulanishi ba'zan beqaror bo'lib chiqdi, bu ayniqsa noqulay edi. Internet infratuzilmasini yangilashga sarmoya kiritish mehmonlarning qoniqishini sezilarli darajada oshirishi mumkin.</p>\n<p>Nihoyat, xodimlar odatda xushmuomala bo'lishsa-da, mehmonlarning so'rovlariga javob berishda yanada faolroq yondashuv foydali bo'lishi mumkin. Ehtimol, mijozlarga xizmat ko'rsatish bo'yicha qo'shimcha treninglar foydali bo'lar edi.</p>\n<p>Izohlarimni ko'rib chiqqaningiz uchun tashakkur. Umid qilamanki, bu fikr-mulohazalar mehmonlar tajribasini yaxshilash bo'yicha doimiy sa'y-harakatlaringizda foydali bo'ladi.</p>\n<p>Hurmat bilan,<br> [Sizning ismingiz]</p>"
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
  },
  "tokenTranslations": {
    "room was spotless": {
      "uz": "xona juda toza edi",
      "type": "colloc"
    },
    "breakfast buffet": {
      "uz": "nonushta shved stoli",
      "type": "colloc"
    },
    "amazing": {
      "uz": "ajoyib",
      "type": "adv"
    },
    "should": {
      "uz": "kerak",
      "type": "modal"
    },
    "definitely": {
      "uz": "albatta",
      "type": "adv"
    },
    "slow wifi": {
      "uz": "sekin wifi",
      "type": "colloc"
    },
    "Firstly": {
      "uz": "Avvalo",
      "type": "adv"
    },
    "room cleanliness": {
      "uz": "xonaning tozaligi",
      "type": "colloc"
    },
    "exceptional": {
      "uz": "favqulodda",
      "type": "adv"
    },
    "attention to detail": {
      "uz": "har bir detalga e'tibor",
      "type": "colloc"
    },
    "Additionally": {
      "uz": "Bundan tashqari",
      "type": "adv"
    },
    "breakfast service": {
      "uz": "nonushta xizmati",
      "type": "colloc"
    },
    "hot dishes": {
      "uz": "issiq taomlar",
      "type": "colloc"
    },
    "particularly": {
      "uz": "ayniqsa",
      "type": "adv"
    },
    "However": {
      "uz": "Biroq",
      "type": "adv"
    },
    "would": {
      "uz": "bo'lardi",
      "type": "modal"
    },
    "wifi connectivity": {
      "uz": "wifi aloqasi",
      "type": "colloc"
    },
    "rather": {
      "uz": "ko'proq",
      "type": "adv"
    },
    "Furthermore": {
      "uz": "Qolaversa",
      "type": "adv"
    },
    "checkout time": {
      "uz": "ro'yxatdan chiqish vaqti",
      "type": "colloc"
    },
    "pleasant stay": {
      "uz": "yoqimli dam olish",
      "type": "colloc"
    },
    "vacation rentals": {
      "uz": "ta'til uchun ijaraga beriladigan joylar",
      "type": "colloc"
    },
    "individual preferences": {
      "uz": "shaxsiy xohishlar",
      "type": "colloc"
    },
    "distinct advantages": {
      "uz": "aniq afzalliklar",
      "type": "colloc"
    },
    "convenience and services": {
      "uz": "qulaylik va xizmatlar",
      "type": "colloc"
    },
    "24-hour reception": {
      "uz": "24 soatlik resepshn",
      "type": "colloc"
    },
    "business trips": {
      "uz": "xizmat safarlari",
      "type": "colloc"
    },
    "practical choice": {
      "uz": "amaliy tanlov",
      "type": "colloc"
    },
    "space and privacy": {
      "uz": "kenglik va shaxsiy hayot daxlsizligi",
      "type": "colloc"
    },
    "can": {
      "uz": "mumkin",
      "type": "modal"
    },
    "kitchen facilities": {
      "uz": "oshxona qulayliklari",
      "type": "colloc"
    },
    "cost-effective": {
      "uz": "tejamkor",
      "type": "colloc"
    },
    "Moreover": {
      "uz": "Qolaversa",
      "type": "adv"
    },
    "authentic experience": {
      "uz": "haqiqiy tajriba",
      "type": "colloc"
    },
    "immerse themselves": {
      "uz": "o'zlarini to'liq bag'ishlash",
      "type": "colloc"
    },
    "On the other hand": {
      "uz": "Boshqa tomondan",
      "type": "adv"
    },
    "security and reliability": {
      "uz": "xavfsizlik va ishonchlilik",
      "type": "colloc"
    },
    "Ultimately": {
      "uz": "Oxir-oqibat",
      "type": "adv"
    },
    "travel style": {
      "uz": "sayohat uslubi",
      "type": "colloc"
    },
    "Personally": {
      "uz": "Shaxsan",
      "type": "adv"
    },
    "family vacations": {
      "uz": "oila bilan ta'til",
      "type": "colloc"
    }
  }
};