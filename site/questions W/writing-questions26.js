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
    "p1_context": "You recently rented a car for a weekend trip.",
    "p1_scenario": "Dear Customer,\n\nThank you for choosing DriveEasy Car Rentals for your recent trip!\nHow was your experience with our vehicle quality and customer service? Was the pick-up process smooth?\nWhat improvements would enhance your future rentals with us?\n\nDriveEasy Team",
    "t11": {
      "title": "Task 1.1",
      "target": "50 words",
      "prompt": "Write a letter to your friend, who is planning a road trip. Write about your feelings and what you think they should do.",
      "sample": "Hey!\n\nI <span class=\"ml-token adv\">just</span> rented from DriveEasy for my trip and it was <span class=\"ml-token adv\">super</span> easy! The car was in <span class=\"ml-token colloc\">perfect condition</span> and the <span class=\"ml-token colloc\">pick-up</span> was <span class=\"ml-token adv\">really</span> quick. <span class=\"ml-token adv\">Definitely</span> book with them for your road trip!\n\nTheir prices are <span class=\"ml-token adv\">pretty</span> reasonable too!",
      "sampleA1": "<p>Hi [Friend's Name],<br>Car good. DriveEasy good. You go DriveEasy. Bye.</p>",
      "sampleA2": "<p>Hi [Friend's Name],<br>I rented a car. It was DriveEasy. It was good and easy. The car was nice. You should use DriveEasy because it is good. Bye.</p>",
      "sampleB1": "<p>Hi [Friend's Name],<br>I just rented a car from DriveEasy for my trip. It was really good! The car was in good condition, and the pick-up was easy. I think you should use them for your road trip. It will be easier for you. Also, the price was okay. Good luck!</p>",
      "sampleB2": "<p>Hi [Friend's Name],<br>I wanted to tell you about my recent car rental experience with DriveEasy. Since you're planning a road trip, I thought it might be helpful. The whole process was surprisingly smooth, and the car was in excellent condition. I'd definitely recommend checking them out. It might save you some hassle, and their prices seem competitive. Let me know if you have any questions!</p>",
      "uzSample": "<p>Salom!</p>\n<p>Men yaqinda sayohatim uchun DriveEasy’dan mashina ijaraga oldim va bu juda oson bo'ldi! Mashina a'lo darajada edi va olib ketish juda tez bo'ldi. Sayohating uchun albatta ulardan bron qiling!</p>\n<p>Ularning narxlari ham ancha maqbul!</p>",
      "uzSampleA1": "<p>Salom, [Do'stingizning ismi],<br>Mashina yaxshi. DriveEasy yaxshi. Sen DriveEasyga bor. Xayr.</p>",
      "uzSampleA2": "<p>Salom, [Do'stingizning ismi],<br>Men mashina ijaraga oldim. U DriveEasy edi. U yaxshi va oson edi. Mashina chiroyli edi. Siz DriveEasy'dan foydalanishingiz kerak, chunki u yaxshi. Xayr.</p>",
      "uzSampleB1": "<p>Salom, [Do'stingizning ismi],<br>Men yaqinda DriveEasy'dan mashina ijaraga oldim, sayohatim uchun. Juda yaxshi bo'ldi! Mashina yaxshi holatda edi va olib ketish oson bo'ldi. O'ylaymanki, siz ham yo'l sayohatingiz uchun ulardan foydalanishingiz kerak. Siz uchun osonroq bo'ladi. Bundan tashqari, narxi ham yaxshi edi. Omad!</p>",
      "uzSampleB2": "<p>Salom, [Do'stingizning ismi],<br>Sizga yaqinda DriveEasy kompaniyasidan mashina ijaraga olganim haqida aytmoqchi edim. Siz sayohatga chiqmoqchi bo'lganingiz uchun, bu sizga yordam berishi mumkin deb o'yladim. Butun jarayon juda oson kechdi va mashina a'lo holatda edi. Men ularni tekshirib ko'rishni tavsiya qilaman. Bu sizni ba'zi muammolardan qutqarishi mumkin va ularning narxlari raqobatbardoshga o'xshaydi. Agar savollaringiz bo'lsa, menga xabar bering!</p>"
    },
    "t12": {
      "title": "Task 1.2",
      "target": "120–150 words",
      "prompt": "Write a letter to the car rental company. Write about your feelings and what you think they should do.",
      "sample": "<p>Dear DriveEasy Team,</p>\n\n<p>I am writing to share my experience with your <span class=\"ml-token colloc\">car rental service</span>.</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, the <span class=\"ml-token colloc\">vehicle condition</span> was <span class=\"ml-token colloc\">impeccable</span>. The car was clean, well-maintained, and drove <span class=\"ml-token adv\">smoothly</span> throughout my trip.</p>\n\n<p><span class=\"ml-token adv\">Moreover</span>, the <span class=\"ml-token colloc\">pick-up process</span> was efficient. The staff were friendly and explained everything <span class=\"ml-token adv\">clearly</span>.</p>\n\n<p><span class=\"ml-token adv\">However</span>, I have some suggestions. Offering a <span class=\"ml-token colloc\">mobile app</span> for bookings and digital keys <span class=\"ml-token modal\">would</span> streamline the process further.</p>\n\n<p><span class=\"ml-token adv\">Additionally</span>, providing <span class=\"ml-token colloc\">roadside assistance</span> coverage as a standard feature <span class=\"ml-token modal\">would</span> give customers greater <span class=\"ml-token colloc\">peace of mind</span>.</p>\n\n<p><span class=\"ml-token adv\">Furthermore</span>, a <span class=\"ml-token colloc\">loyalty program</span> with discounts for repeat customers <span class=\"ml-token modal\">would</span> encourage me to book with you again.</p>\n\n<p>Thank you for a pleasant <span class=\"ml-token colloc\">rental experience</span>.</p>\n\n<p>Kind regards,<br>A Happy Customer</p>",
      "sampleA1": "<p>Hi DriveEasy,</p><br><p>Car is good. I like car. Pick up okay. Bye.</p>",
      "sampleA2": "<p>Hi DriveEasy,</p><br><p>The car was good, and I liked driving it. But the pick up was slow, and I waited a long time. The people were nice, but I was late. Maybe you can be faster next time. Thank you.</p><br><p>Bye,</p><br><p>A Customer</p>",
      "sampleB1": "<p>Dear DriveEasy Team,</p><br><p>I am writing to you about my recent car rental. Overall, it was a good experience. The car was clean and comfortable. The pick-up process was mostly smooth, although there was a bit of a wait.</p><br><p>I think you could improve the experience by having more staff available at peak times. Also, it would be helpful if you offered a discount for returning customers. In my opinion, this would encourage people to use your service again.</p><br><p>Thank you for your service.</p><br><p>Sincerely,<br>A Customer</p>",
      "sampleB2": "<p>Dear DriveEasy Team,</p><br><p>I am writing to provide feedback regarding my recent car rental experience. Generally, I was satisfied with the vehicle itself; it was clean, reliable, and well-maintained. The pick-up process, while efficient in some respects, could benefit from some adjustments.</p><br><p>Specifically, the waiting time upon arrival was longer than anticipated. Perhaps implementing a more streamlined check-in system, or offering a priority service for pre-booked customers, could alleviate this issue. Furthermore, clearer signage within the rental facility would be beneficial for first-time users.</p><br><p>While the overall experience was positive, addressing these minor inconveniences would significantly enhance customer satisfaction and encourage repeat business. Thank you for your attention to these matters.</p><br><p>Yours sincerely,<br>A Satisfied Customer</p>",
      "uzSample": "<p>Hurmatli DriveEasy jamoasi,</p>\n\n<p>Sizning avtomobil ijarasi xizmatingiz bo'yicha o'z tajribamni baham ko'rish uchun yozyapman.</p>\n\n<p>Avvalo, avtomobilning holati a'lo darajada edi. Mashina toza, yaxshi saqlangan va sayohatim davomida bemalol haydaldim.</p>\n\n<p>Bundan tashqari, mashinani olish jarayoni samarali bo'ldi. Xodimlar do'stona munosabatda bo'lishdi va hamma narsani aniq tushuntirishdi.</p>\n\n<p>Biroq, mening ba'zi takliflarim bor. Bron qilish va raqamli kalitlar uchun mobil ilovani taklif qilish jarayonni yanada soddalashtiradi.</p>\n\n<p>Qo'shimcha ravishda, yo'lda yordam berish qamrovini standart xususiyat sifatida taqdim etish mijozlarga xotirjamlikni beradi.</p>\n\n<p>Bundan tashqari, doimiy mijozlar uchun chegirmalar bilan sodiqlik dasturi meni yana siz bilan bron qilishga undaydi.</p>\n\n<p>Yoqimli ijara tajribasi uchun rahmat.</p>\n\n<p>Hurmat bilan,<br>Baxtli mijoz</p>",
      "uzSampleA1": "<p>Salom DriveEasy,</p><br><p>Mashina yaxshi. Menga mashina yoqdi. Olib ketish yaxshi. Xayr.</p>",
      "uzSampleA2": "<p>Salom DriveEasy,</p><br><p>Mashina yaxshi edi va menga haydash yoqdi. Lekin olib ketish sekin bo'ldi va men uzoq kutdim. Odamlar yaxshi edi, lekin men kechikdim. Balki keyingi safar tezroq bo'lishingiz mumkin. Rahmat.</p><br><p>Xayr,</p><br><p>Mijoz</p>",
      "uzSampleB1": "<p>Hurmatli DriveEasy jamoasi,</p><br><p>Men sizga yaqinda avtomobil ijaraga olganim haqida yozmoqdaman. Umuman olganda, bu yaxshi tajriba bo'ldi. Mashina toza va qulay edi. Mashinani olish jarayoni asosan muammosiz kechdi, garchi biroz kutishga to'g'ri keldi.</p><br><p>O'ylaymanki, eng gavjum vaqtlarda ko'proq xodimlarni jalb qilish orqali tajribani yaxshilashingiz mumkin. Shuningdek, agar siz qaytib kelgan mijozlar uchun chegirma taklif qilsangiz, foydali bo'lardi. Mening fikrimcha, bu odamlarni sizning xizmatingizdan yana foydalanishga undaydi.</p><br><p>Xizmatingiz uchun rahmat.</p><br><p>Hurmat bilan,<br>Bir mijoz</p>",
      "uzSampleB2": "<p>Hurmatli DriveEasy jamoasi,</p><br><p>Men yaqinda avtomobil ijarasi bo'yicha tajribam haqida fikr-mulohazalarimni bildirish uchun yozyapman. Umuman olganda, men avtomobilning o'zi bilan qoniqdim; u toza, ishonchli va yaxshi saqlangan edi. Olishtirish jarayoni, ba'zi jihatlarda samarali bo'lsa-da, ba'zi tuzatishlardan foyda ko'rishi mumkin.</p><br><p>Xususan, yetib kelgandan keyin kutish vaqti kutilganidan uzoqroq bo'ldi. Ehtimol, yanada soddalashtirilgan ro'yxatdan o'tish tizimini joriy etish yoki oldindan buyurtma bergan mijozlar uchun ustuvor xizmatni taklif qilish bu muammoni hal qilishi mumkin. Bundan tashqari, ijara ob'ektida aniqroq belgilar birinchi marta foydalanuvchilar uchun foydali bo'ladi.</p><br><p>Umumiy tajriba ijobiy bo'lsa-da, bu kichik noqulayliklarni bartaraf etish mijozlar ehtiyojini sezilarli darajada oshiradi va qayta murojaat qilishga undaydi. Ushbu masalalarga e'tiboringiz uchun tashakkur.</p><br><p>Hurmat bilan,<br>Qoniqish hosil qilgan mijoz</p>"
    },
    "t2": {
      "title": "Task 2",
      "target": "180–200 words",
      "prompt": "You are participating in an online discussion forum. The topic is: \"Is it important to learn a second language in today's world?\" Write your response, giving reasons and examples. Write 180–200 words.",
      "sample": "<h2>Renting vs Public Transport: The Best Way to Explore</h2>\n\n<p>When visiting a new place, how you get around <span class=\"ml-token adv\">significantly</span> shapes your experience. Having tried all options, here's my take.</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, <span class=\"ml-token colloc\">rental cars</span> offer <span class=\"ml-token colloc\">unmatched freedom</span>. You <span class=\"ml-token modal\">can</span> explore hidden gems, stop whenever you want, and create your own schedule. For countryside trips, a car is <span class=\"ml-token adv\">often</span> essential.</p>\n\n<p><span class=\"ml-token adv\">Moreover</span>, traveling with family or groups makes <span class=\"ml-token colloc\">car rental</span> more <span class=\"ml-token colloc\">cost-effective</span> than multiple public transport tickets.</p>\n\n<p><span class=\"ml-token adv\">However</span>, in busy cities, <span class=\"ml-token colloc\">public transport</span> is <span class=\"ml-token adv\">often</span> faster and stress-free. Parking headaches and traffic <span class=\"ml-token modal\">can</span> ruin a city trip.</p>\n\n<p><span class=\"ml-token adv\">Additionally</span>, <span class=\"ml-token colloc\">guided tours</span> provide local knowledge and <span class=\"ml-token colloc\">insider access</span> that independent travelers might miss.</p>\n\n<p><span class=\"ml-token adv\">Ultimately</span>, the best option depends on your destination. For <span class=\"ml-token colloc\">scenic routes</span> and rural areas, rent a car. For cities with good transit, skip the wheels.</p>\n\n<p>What's your preferred way to explore?</p>",
      "sampleA1": "<p>Hi DriveEasy!</p><br><p>Car good. Pick up okay. I like car. Thank you. Bye.</p>",
      "sampleA2": "<p>Dear DriveEasy,</p><p>The car was good, and the pick up was easy. But the car was a little dirty. I want the car to be clean next time. And the price was okay, but maybe a little cheaper next time? Thank you.</p><p>Bye,</p><p>[Your Name]</p>",
      "sampleB1": "<p>Dear DriveEasy Team,</p><p>Thank you for your email. Overall, my experience renting the car was positive. The car was in good condition and drove well. The pick-up process was mostly smooth, although there was a slight delay because the person at the desk was busy. </p><p>One thing that could be improved is the cleanliness of the car. It wasn't very dirty, but there were some crumbs and dust inside. Also, it would be helpful if you provided a map of the area with the rental. I think these small changes would make the rental experience even better for future customers.</p><p>Sincerely,</p><p>[Your Name]</p>",
      "sampleB2": "<p>Dear DriveEasy Team,</p><p>Thank you for your follow-up email. My recent rental experience with DriveEasy was generally satisfactory, although there are a few areas that could be enhanced. The vehicle's performance was commendable, and I appreciated the fuel efficiency. However, the pick-up process was somewhat disorganized, resulting in an unnecessary delay. Streamlining this process would significantly improve the initial customer experience.</p><p>Furthermore, while the car was adequately clean, a more thorough interior detailing would be beneficial. Considering the premium you charge, customers expect a pristine vehicle. Finally, offering a complimentary GPS navigation system or a smartphone mount would be a valuable addition, particularly for customers unfamiliar with the area. Implementing these suggestions would undoubtedly elevate DriveEasy's service and reinforce customer loyalty.</p><p>Sincerely,</p><p>[Your Name]</p>",
      "uzSample": "<h2>Ijara Mashinalari va Jamoat Transporti: Sayohat Qilishning Eng Yaxshi Usuli</h2>\n\n<p>Yangi joyga tashrif buyurganingizda, u yerda qanday harakatlanishingiz tajribangizni sezilarli darajada shakllantiradi. Barcha variantlarni sinab ko'rganimdan so'ng, mening fikrim quyidagicha.</p>\n\n<p>Birinchidan, ijaraga olingan mashinalar beqiyos erkinlikni taqdim etadi. Siz yashirin gavharlarni o'rganishingiz, xohlagan vaqtingizda to'xtashingiz va o'z jadvalingizni yaratishingiz mumkin. Qishloq joylariga sayohat qilish uchun mashina ko'pincha zarurdir.</p>\n\n<p>Bundan tashqari, oila yoki guruhlar bilan sayohat qilish bir nechta jamoat transporti chiptalariga qaraganda mashina ijarasini yanada tejamli qiladi.</p>\n\n<p>Biroq, gavjum shaharlarda jamoat transporti ko'pincha tezroq va stresssizdir. Mashina qo'yish muammolari va tirbandlik shahar bo'ylab sayohatni buzishi mumkin.</p>\n\n<p>Qo'shimcha ravishda, ekskursiya gidlari mahalliy bilim va mustaqil sayohatchilar o'tkazib yuborishi mumkin bo'lgan ichki ma'lumotlarni taqdim etadi.</p>\n\n<p>Oxir oqibat, eng yaxshi variant sizning manzilingizga bog'liq. Manzarali yo'nalishlar va qishloq joylari uchun mashina ijaraga oling. Yaxshi tranzitga ega shaharlar uchun g'ildiraklarni tashlab keting.</p>\n\n<p>Sizning sayohat qilishning afzal ko'rgan usulingiz qanday?</p>",
      "uzSampleA1": "<p>Salom DriveEasy!</p><br><p>Mashina yaxshi. Olib kelish yaxshi. Menga mashina yoqdi. Rahmat. Xayr.</p>",
      "uzSampleA2": "<p>Hurmatli DriveEasy,</p><p>Mashina yaxshi edi va olib ketish oson bo'ldi. Lekin mashina biroz iflos edi. Keyingi safar mashinaning toza bo'lishini xohlayman. Narxi ham yaxshi edi, lekin keyingi safar biroz arzonroq bo'lsa yaxshi bo'lardi? Rahmat.</p><p>Xayr,</p><p>[Sizning ismingiz]</p>",
      "uzSampleB1": "<p>Hurmatli DriveEasy jamoasi,</p><p>Elektron pochtangiz uchun rahmat. Umuman olganda, mashinani ijaraga olish tajribam ijobiy bo'ldi. Mashina yaxshi holatda edi va yaxshi haydadi. Mashinani olish jarayoni asosan muammosiz kechdi, garchi stoldagi odam band bo'lgani uchun biroz kechikish bo'ldi.</p><p>Yaxshilanishi mumkin bo'lgan bir narsa - mashinaning tozaligi. U juda iflos emas edi, lekin ichida ba'zi mayda narsalar va chang bor edi. Shuningdek, agar siz ijaraga olish bilan birga hududning xaritasini taqdim etsangiz, foydali bo'lardi. O'ylaymanki, bu kichik o'zgarishlar kelajakdagi mijozlar uchun ijaraga olish tajribasini yanada yaxshilaydi.</p><p>Hurmat bilan,</p><p>[Sizning ismingiz]</p>",
      "uzSampleB2": "<p>Hurmatli DriveEasy jamoasi,</p><p>E'tiboringiz uchun rahmat. DriveEasy bilan yaqinda bo'lgan ijara tajribam umuman olganda qoniqarli bo'ldi, garchi yaxshilanishi mumkin bo'lgan bir nechta sohalar mavjud. Avtomobilning ishlashi maqtovga loyiq edi va men yoqilg'i tejamkorligini qadrladim. Biroq, olib ketish jarayoni biroz tartibsiz edi, bu esa keraksiz kechikishga olib keldi. Ushbu jarayonni soddalashtirish dastlabki mijoz tajribasini sezilarli darajada yaxshilaydi.</p><p>Bundan tashqari, mashina yetarlicha toza bo'lsa-da, ichki qismini yanada yaxshilab tozalash foydali bo'lar edi. Siz oladigan yuqori narxni hisobga olsak, mijozlar benuqson avtomobilni kutishadi. Nihoyat, bepul GPS navigatsiya tizimini yoki smartfon ushlagichini taklif qilish, ayniqsa, hudud bilan tanish bo'lmagan mijozlar uchun qimmatli qo'shimcha bo'ladi. Ushbu takliflarni amalga oshirish, shubhasiz, DriveEasy xizmatini yuqori darajaga ko'taradi va mijozlarning sodiqligini mustahkamlaydi.</p><p>Hurmat bilan,</p><p>[Sizning ismingiz]</p>"
    }
  },
  "vocabulary": {
    "task11": [
      {
        "en": "rented a car",
        "uz": "mashina ijaraga oldim"
      },
      {
        "en": "super easy",
        "uz": "juda oson"
      },
      {
        "en": "perfect condition",
        "uz": "mukammal holat"
      },
      {
        "en": "pick-up process",
        "uz": "olish jarayoni"
      },
      {
        "en": "really quick",
        "uz": "juda tez"
      },
      {
        "en": "definitely book",
        "uz": "albatta bron qiling"
      },
      {
        "en": "road trip",
        "uz": "yo'l sayohati"
      },
      {
        "en": "reasonable prices",
        "uz": "maqbul narxlar"
      },
      {
        "en": "highly recommend",
        "uz": "juda tavsiya qilaman"
      },
      {
        "en": "great experience",
        "uz": "ajoyib tajriba"
      },
      {
        "en": "clean vehicle",
        "uz": "toza avtomobil"
      },
      {
        "en": "friendly staff",
        "uz": "do'stona xodimlar"
      },
      {
        "en": "worth trying",
        "uz": "sinab ko'rishga arziydi"
      },
      {
        "en": "easy process",
        "uz": "oson jarayon"
      },
      {
        "en": "check them out",
        "uz": "ularni ko'rib chiqing"
      },
      {
        "en": "weekend trip",
        "uz": "hafta oxiri sayohati"
      },
      {
        "en": "smooth ride",
        "uz": "silliq haydash"
      },
      {
        "en": "no problems",
        "uz": "muammosiz"
      },
      {
        "en": "good service",
        "uz": "yaxshi xizmat"
      },
      {
        "en": "let me know",
        "uz": "menga ayting"
      }
    ],
    "task12": [
      {
        "en": "car rental service",
        "uz": "avtomobil ijarasi xizmati"
      },
      {
        "en": "vehicle condition",
        "uz": "avtomobil holati"
      },
      {
        "en": "impeccable",
        "uz": "nuqsonsiz"
      },
      {
        "en": "well-maintained",
        "uz": "yaxshi parvarishlangan"
      },
      {
        "en": "drove smoothly",
        "uz": "silliq haydadi"
      },
      {
        "en": "efficient process",
        "uz": "samarali jarayon"
      },
      {
        "en": "mobile app",
        "uz": "mobil ilova"
      },
      {
        "en": "digital keys",
        "uz": "raqamli kalitlar"
      },
      {
        "en": "streamline",
        "uz": "soddalashtirish"
      },
      {
        "en": "roadside assistance",
        "uz": "yo'l bo'yida yordam"
      },
      {
        "en": "peace of mind",
        "uz": "xotirjamlik"
      },
      {
        "en": "loyalty program",
        "uz": "sodiqlik dasturi"
      },
      {
        "en": "repeat customers",
        "uz": "takroriy mijozlar"
      },
      {
        "en": "rental experience",
        "uz": "ijara tajribasi"
      },
      {
        "en": "happy customer",
        "uz": "xursand mijoz"
      },
      {
        "en": "kind regards",
        "uz": "hurmat bilan"
      },
      {
        "en": "explained clearly",
        "uz": "aniq tushuntirildi"
      },
      {
        "en": "greater coverage",
        "uz": "kattaroq qamrov"
      },
      {
        "en": "standard feature",
        "uz": "standart xususiyat"
      },
      {
        "en": "booking process",
        "uz": "buyurtma jarayoni"
      }
    ],
    "task2": [
      {
        "en": "rental cars",
        "uz": "ijaraga olingan mashinalar"
      },
      {
        "en": "unmatched freedom",
        "uz": "tengsiz erkinlik"
      },
      {
        "en": "hidden gems",
        "uz": "yashirin durdonalar"
      },
      {
        "en": "create schedule",
        "uz": "jadval tuzish"
      },
      {
        "en": "countryside trips",
        "uz": "qishloq sayohatlari"
      },
      {
        "en": "cost-effective",
        "uz": "tejamkor"
      },
      {
        "en": "public transport",
        "uz": "jamoat transporti"
      },
      {
        "en": "parking headaches",
        "uz": "to'xtash joyi muammolari"
      },
      {
        "en": "traffic stress",
        "uz": "tirbandlik stressi"
      },
      {
        "en": "guided tours",
        "uz": "yo'riqchi sayohatlari"
      },
      {
        "en": "local knowledge",
        "uz": "mahalliy bilim"
      },
      {
        "en": "insider access",
        "uz": "ichki kirish"
      },
      {
        "en": "scenic routes",
        "uz": "manzarali yo'llar"
      },
      {
        "en": "rural areas",
        "uz": "qishloq joylari"
      },
      {
        "en": "skip the wheels",
        "uz": "mashinasiz"
      },
      {
        "en": "shapes experience",
        "uz": "tajribani shakllantiradi"
      },
      {
        "en": "significantly",
        "uz": "sezilarli darajada"
      },
      {
        "en": "independent travelers",
        "uz": "mustaqil sayohatchilar"
      },
      {
        "en": "multiple tickets",
        "uz": "bir nechta chiptalar"
      },
      {
        "en": "preferred way",
        "uz": "afzal usul"
      }
    ]
  },
  "tokenTranslations": {
    "just": {
      "uz": "faqat",
      "type": "adv"
    },
    "super": {
      "uz": "juda",
      "type": "adv"
    },
    "perfect condition": {
      "uz": "a'lo holat",
      "type": "colloc"
    },
    "pick-up": {
      "uz": "olib ketish",
      "type": "colloc"
    },
    "really": {
      "uz": "haqiqatan ham",
      "type": "adv"
    },
    "Definitely": {
      "uz": "albatta",
      "type": "adv"
    },
    "pretty": {
      "uz": "anchagina",
      "type": "adv"
    },
    "car rental service": {
      "uz": "avtomobil ijarasi xizmati",
      "type": "colloc"
    },
    "Firstly": {
      "uz": "avvalo",
      "type": "adv"
    },
    "vehicle condition": {
      "uz": "transport vositasining holati",
      "type": "colloc"
    },
    "impeccable": {
      "uz": "benuqson",
      "type": "colloc"
    },
    "smoothly": {
      "uz": "ravon",
      "type": "adv"
    },
    "Moreover": {
      "uz": "qolaversa",
      "type": "adv"
    },
    "pick-up process": {
      "uz": "olib ketish jarayoni",
      "type": "colloc"
    },
    "clearly": {
      "uz": "aniq",
      "type": "adv"
    },
    "However": {
      "uz": "ammo",
      "type": "adv"
    },
    "mobile app": {
      "uz": "mobil ilova",
      "type": "colloc"
    },
    "would": {
      "uz": "-moqchi edim",
      "type": "modal"
    },
    "Additionally": {
      "uz": "qo'shimcha ravishda",
      "type": "adv"
    },
    "roadside assistance": {
      "uz": "yo'lda yordam",
      "type": "colloc"
    },
    "peace of mind": {
      "uz": "xotirjamlik",
      "type": "colloc"
    },
    "Furthermore": {
      "uz": "bundan tashqari",
      "type": "adv"
    },
    "loyalty program": {
      "uz": "sodiqlik dasturi",
      "type": "colloc"
    },
    "rental experience": {
      "uz": "ijara tajribasi",
      "type": "colloc"
    },
    "significantly": {
      "uz": "sezilarli darajada",
      "type": "adv"
    },
    "rental cars": {
      "uz": "ijaraga olingan mashinalar",
      "type": "colloc"
    },
    "unmatched freedom": {
      "uz": "misli ko'rilmagan erkinlik",
      "type": "colloc"
    },
    "can": {
      "uz": "mumkin",
      "type": "modal"
    },
    "often": {
      "uz": "ko'pincha",
      "type": "adv"
    },
    "car rental": {
      "uz": "mashina ijarasi",
      "type": "colloc"
    },
    "cost-effective": {
      "uz": "tejamkor",
      "type": "colloc"
    },
    "public transport": {
      "uz": "jamoat transporti",
      "type": "colloc"
    },
    "guided tours": {
      "uz": "gid bilan sayohatlar",
      "type": "colloc"
    },
    "insider access": {
      "uz": "ichkaridan kirish imkoniyati",
      "type": "colloc"
    },
    "Ultimately": {
      "uz": "Oxir-oqibat",
      "type": "adv"
    },
    "scenic routes": {
      "uz": "manzarali yo'nalishlar",
      "type": "colloc"
    }
  }
};