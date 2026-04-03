// ================================================================================
// WRITING MOCK TEST - QUESTIONS DATA
// ================================================================================
// Mock 100 — Printed Books vs E-Books
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
    "p1_context": "You are a student at a local college. The college library has recently announced a plan to replace most of its printed books with e-books and digital reading devices.",
    "p1_scenario": "Dear Students,\n\nWe are excited to announce that our library will soon transition to a primarily digital collection! E-readers and tablets will be available for loan, and thousands of new e-book titles will be added.\nWe would love to hear your thoughts. How do you feel about this change? Do you prefer reading printed books or e-books?\nWhat suggestions do you have to make this transition smoother for everyone?\n\nBest regards,\nThe Library Committee",
    "t11": {
      "title": "Task 1.1",
      "target": "50–70 words",
      "prompt": "Write a letter to your friend, who loves reading but has never tried e-books. Tell them about the library's plan and share your opinion about printed books versus e-books.",
      "sample": "Hey [Friend's Name],\n\nGuess what? The library is <span class=\"ml-token phrasal\">getting rid of</span> most printed books! They're switching to e-books and <span class=\"ml-token colloc\">lending out</span> e-readers.\n\nI’m a bit <span class=\"ml-token adv\">unsure</span> about it. I <span class=\"ml-token modal\">still</span> prefer <span class=\"ml-token colloc\">real books</span>; I love the feel and smell. But <span class=\"ml-token adv\">maybe</span> e-books will be easier to carry around? What do you think? <span class=\"ml-token modal\">We should</span> check it out together <span class=\"ml-token adv\">soon</span>.\n",
      "sampleA1": "<p>Hi [Friend's Name],<br>\nThe library is changing! No more books, only computers. You can read on a tablet. I like real books. What do you think? It is good or bad?<br>\nSee you,<br>\n[Your Name]</p>\n",
      "sampleA2": "<p>Hi [Friend's Name],<br>\nGuess what! The library is changing. They want to have more e-books and less paper books. You can borrow a tablet to read them. I like paper books, but e-books are easy to carry. What do you think? Maybe we can try reading an e-book together sometime. It's new and maybe fun! Write back soon!</p>\n",
      "sampleB1": "<p>Hi [Friend's Name],<br>\nGuess what? The college library is going mostly digital! They're replacing many printed books with e-books and lending out e-readers. <br>\nI'm not sure how I feel. E-books are convenient, but I love the feel of a real book. In my opinion, it's easier to concentrate when reading a physical book. However, e-books are lighter to carry around.<br>\nWhat do you think? Let me know!</p>\n",
      "sampleB2": "<p>Hey! Guess what? The library's going almost entirely digital! <br>They're swapping books for e-readers. I'm torn. I love the smell of old books, but e-books are convenient. Furthermore, they save space. Nevertheless, I worry about eye strain and accessibility for everyone. What do you think? You should try an e-reader sometime!</p>\n",
      "uzSample": "Salom, [Do'stingizning ismi]!\n\nNima bo'lganini bilasanmi? Kutubxona chop etilgan kitoblarning ko'p qismidan voz kechyapti! Ular elektron kitoblarga o'tishyapti va elektron o'quvchilarni ijaraga berishyapti.\n\nMen bu haqda biroz ikkilanib turibman. Men hali ham haqiqiy kitoblarni afzal ko'raman; ularning hissiyotini va hidini yaxshi ko'raman. Ammo, ehtimol, elektron kitoblarni olib yurish osonroq bo'lar? Nima deb o'ylaysiz? Buni tez orada birga tekshirib ko'rishimiz kerak.\n",
      "uzSampleA1": "<p>Salom [Do'stingizning ismi],<br>\nKutubxona o'zgaryapti! Endi kitoblar yo'q, faqat kompyuterlar bor. Planshetda o'qishingiz mumkin. Menga haqiqiy kitoblar yoqadi. Nima deb o'ylaysiz? Bu yaxshimi yoki yomon?<br>\nKo'rishguncha,<br>\n[Sizning ismingiz]</p>\n",
      "uzSampleA2": "<p>Salom [Do'stingizning ismi],<br>\nNima bo'lishini bilasanmi! Kutubxona o'zgaryapti. Ular ko'proq elektron kitoblar va kamroq qog'oz kitoblar bo'lishini xohlashmoqda. Ularni o'qish uchun planshetni ijaraga olishing mumkin. Menga qog'oz kitoblar yoqadi, lekin elektron kitoblarni olib yurish oson. Sening fikring qanday? Balki birgalikda elektron kitob o'qishga harakat qilarmoiz. Bu yangi va balki qiziqarli bo'lar!</p>\n",
      "uzSampleB1": "<p>Salom [Do'stingizning ismi],<br>\nNima bo'lganini bilasanmi? Universitet kutubxonasi asosan raqamli ko'rinishga o'tmoqda! Ular ko'plab bosma kitoblarni elektron kitoblar bilan almashtirmoqda va elektron o'quvchilarni ijaraga bermoqda.<br>\nMen qanday his qilishimni bilmayman. Elektron kitoblar qulay, lekin men haqiqiy kitobning hissini yaxshi ko'raman. Mening fikrimcha, jismoniy kitobni o'qiyotganda diqqatni jamlash osonroq. Biroq, elektron kitoblarni olib yurish osonroq.<br>\nSiz nima deb o'ylaysiz? Menga xabar bering!</p>\n",
      "uzSampleB2": "<p>Salom! Nima gapligini bilasanmi? Kutubxona deyarli butunlay raqamli ko'rinishga o'tyapti! <br>Ular kitoblarni elektron o'quvchilarga almashtirishmoqda. Men ikkilanib qoldim. Men eski kitoblarning hidini yaxshi ko'raman, lekin elektron kitoblar qulay. Qolaversa, ular joyni tejashadi. Shunga qaramay, men ko'zning zo'riqishi va hamma uchun ochiqlik haqida tashvishlanaman. Siz nima deb o'ylaysiz? Bir kun kelib elektron o'quvchini sinab ko'rishingiz kerak!</p>\n"
    },
    "t12": {
      "title": "Task 1.2",
      "target": "120–150 words",
      "prompt": "Write a letter to the library committee. Share your feelings about the plan and suggest what they should do to improve the transition.",
      "sample": "Dear Library Committee,\n\nI am writing to express my thoughts on the <span class=\"ml-token adv\">recently</span> announced plan to switch to a primarily digital collection. <span class=\"ml-token idiom\">To be honest</span>, I have mixed feelings. While I understand the potential benefits, I also have some concerns.\n\nOn the one hand, having access to thousands of e-books sounds fantastic. It <span class=\"ml-token modal\">would</span> be convenient and save space. However, I <span class=\"ml-token adv\">personally</span> prefer the feel of a physical book. I find it easier to concentrate, and I don't get the same eye strain as I do with screens.\n\nTo make the transition smoother, I suggest the library offer workshops on how to use the e-readers and tablets effectively. It <span class=\"ml-token modal\">might</span> also be helpful to maintain a <span class=\"ml-token colloc\">small collection</span> of popular printed books for those who, like me, still <span class=\"ml-token phrasal\">prefer to stick with</span> traditional reading. <span class=\"ml-token adv\">Furthermore</span>, providing comfortable seating areas specifically designed for e-reader use <span class=\"ml-token modal\">could</span> enhance the digital reading experience. Finally, please ensure that <span class=\"ml-token colloc\">technical support</span> is readily available to help students <span class=\"ml-token phrasal\">sort out</span> any issues they <span class=\"ml-token modal\">may</span> encounter.\n\nThank you for considering my suggestions.\n\nSincerely,\n\n[Your Name]\n",
      "sampleA1": "<p>Dear Library Committee,<br>\nI am a student. I like the library. I don't like e-books. I like books. Books are good. E-books are not good. I want books. Please don't take books. I read books. My friends read books. We like books. Maybe some e-books ok. But keep books too. More books good. Thank you.<br>\nFrom,<br>\n[Your Name]</p>\n",
      "sampleA2": "<p>Dear Library Committee,<br><br>Thank you for telling us about the new e-books. I am a student here. I like the library. I am a little worried about the change. I like to read paper books. It is easy for my eyes. <br><br>E-books are okay, but I think some students like paper books too. Maybe you can keep some paper books? And maybe you can teach us how to use the new e-readers? That would be very helpful. Also, good internet is important for e-books. Thank you for listening to me.<br><br>Sincerely,<br>A Student</p>\n",
      "sampleB1": "<p>Dear Library Committee,\n\nI am writing to you in response to your announcement about the library's transition to a digital collection. While I understand the potential benefits of this change, I also have some concerns I would like to share.\n\nPersonally, I prefer reading printed books. I find it easier to concentrate without the distractions of a screen. However, I can see how e-books could be convenient for some students, especially for carrying many books at once. In my opinion, completely replacing printed books is a mistake.\n\nTo make the transition smoother, I suggest keeping a selection of popular printed books available. Also, please provide clear instructions and training sessions on how to use the e-readers and access the digital collection. For example, a workshop on downloading and managing e-books would be very helpful. Finally, ensure there is adequate technical support available for students who experience difficulties. Thank you for considering my suggestions.\n\nSincerely,\n[Your Name]</p>\n",
      "sampleB2": "<p>Dear Library Committee,\n\nI am writing to express my thoughts regarding the proposed transition to a primarily digital collection. While I understand the potential benefits, such as increased accessibility and storage efficiency, I have some reservations about the plan. <br><br>Personally, I prefer the tactile experience of reading printed books. Furthermore, studies suggest that comprehension and retention can be higher with physical texts. Nevertheless, I am willing to adapt if the transition is handled effectively. <br><br>Consequently, I suggest the library provide comprehensive training sessions on using e-readers and accessing digital resources. It is also crucial to maintain a selection of popular printed books for students who struggle with digital formats. Finally, ensuring sufficient loan periods for devices would prevent unnecessary pressure on students. Implementing these suggestions would greatly improve the transition process.\n\nBest regards,<br>\n[Your Name]\n</p>\n",
      "uzSample": "Hurmatli Kutubxona Qo'mitasi,\n\n<p>Men yaqinda e'lon qilingan asosan raqamli to'plamga o'tish rejasiga o'z fikrlarimni bildirish uchun yozmoqdaman. Rostini aytsam, meni aralash tuyg'ular qamrab olgan. Imkoniyatdagi afzalliklarni tushunsam ham, ba'zi xavotirlarim ham bor.</p>\n\n<p>Bir tomondan, minglab elektron kitoblarga kirish imkoniga ega bo'lish ajoyib eshitiladi. Bu qulay bo'ladi va joyni tejaydi. Biroq, men shaxsan jismoniy kitobning tuyg'usini afzal ko'raman. Men diqqatni jamlashni osonroq topaman va ekrandagidek ko'zlarim zo'riqmaydi.</p>\n\n<p>O'tishni yanada silliqroq qilish uchun kutubxona elektron o'quv qurilmalari va planshetlardan qanday samarali foydalanish bo'yicha seminarlar taklif qilishni taklif qilaman. Shuningdek, men kabi, hali ham an'anaviy o'qishga sodiq qolishni afzal ko'radiganlar uchun mashhur bosma kitoblarning kichik to'plamini saqlab qolish foydali bo'lishi mumkin. Bundan tashqari, aynan elektron o'quv qurilmalaridan foydalanish uchun mo'ljallangan qulay o'tirish joylarini ta'minlash raqamli o'qish tajribasini yaxshilashi mumkin. Nihoyat, talabalarga duch kelishi mumkin bo'lgan har qanday muammolarni hal qilishda yordam berish uchun texnik yordam doimo mavjud bo'lishini ta'minlang.</p>\n\n<p>Takliflarimni ko'rib chiqqaningiz uchun rahmat.</p>\n\n<p>Hurmat bilan,</p>\n\n<p>[Sizning Ismingiz]</p>\n",
      "uzSampleA1": "<p>Hurmatli Kutubxona Qo'mitasi,<br>\nMen talabaman. Menga kutubxona yoqadi. Menga elektron kitoblar yoqmaydi. Menga kitoblar yoqadi. Kitoblar yaxshi. Elektron kitoblar yaxshi emas. Men kitoblar xohlayman. Iltimos, kitoblarni olmang. Men kitob o'qiyman. Do'stlarim kitob o'qiydi. Bizga kitoblar yoqadi. Balki ba'zi elektron kitoblar yaxshidir. Lekin kitoblarni ham saqlang. Ko'proq kitoblar yaxshi. Rahmat.<br>\nKimdan,<br>\n[Sizning ismingiz]</p>\n",
      "uzSampleA2": "<p>Hurmatli Kutubxona Qo'mitasi,<br><br>Yangi elektron kitoblar haqida xabar berganingiz uchun rahmat. Men bu yerda talabaman. Kutubxonani yaxshi ko'raman. O'zgarishdan biroz xavotirdaman. Qog'oz kitoblarni o'qishni yaxshi ko'raman. Ko'zlarim uchun osonroq.<br><br>Elektron kitoblar yaxshi, lekin menimcha, ba'zi talabalar qog'oz kitoblarni ham yaxshi ko'rishadi. Balki siz ba'zi qog'oz kitoblarni saqlab qolarsiz? Va balki siz bizga yangi elektron o'quvchilardan qanday foydalanishni o'rgatarsiz? Bu juda foydali bo'lardi. Shuningdek, elektron kitoblar uchun yaxshi internet muhim. Meni tinglaganingiz uchun rahmat.<br><br>Hurmat bilan,<br>Bir Talaba</p>\n",
      "uzSampleB1": "<p>Hurmatli Kutubxona Qoʻmitasi,</p>\n\nMen sizga kutubxonaning raqamli toʻplamga oʻtishi haqidagi e’loningizga javoban yozmoqdaman. Ushbu oʻzgarishning potentsial afzalliklarini tushunsam ham, men baham koʻrmoqchi boʻlgan ba'zi xavotirlarim bor.\n\nShaxsan men bosma kitoblarni oʻqishni afzal koʻraman. Ekranning chalgʻituvchi omillarisiz diqqatni jamlash osonroq deb bilaman. Biroq, elektron kitoblar ba'zi talabalar uchun, ayniqsa, bir vaqtning oʻzida koʻp kitob olib yurish uchun qulay boʻlishi mumkinligini koʻraman. Mening fikrimcha, bosma kitoblarni butunlay almashtirish xato.\n\nOʻtishni osonlashtirish uchun mashhur bosma kitoblarning tanlovini saqlab qolishni taklif qilaman. Shuningdek, elektron oʻquvchilardan qanday foydalanish va raqamli toʻplamga kirish boʻyicha aniq koʻrsatmalar va oʻquv mashgʻulotlarini taqdim eting. Misol uchun, elektron kitoblarni yuklab olish va boshqarish boʻyicha seminar juda foydali boʻladi. Nihoyat, qiyinchiliklarga duch kelgan talabalar uchun etarli texnik yordam mavjudligini ta'minlang. Takliflarimni koʻrib chiqqaningiz uchun tashakkur.\n\nHurmat bilan,\n[Sizning ismingiz]</p>\n",
      "uzSampleB2": "<p>Hurmatli Kutubxona Qo'mitasi,</p>\n\nMen asosan raqamli to'plamga o'tish bo'yicha taklif etilayotgan o'zgarishlar haqida o'z fikrlarimni bildirish uchun yozyapman. Men oshirilgan qulaylik va saqlash samaradorligi kabi potentsial afzalliklarni tushunsam ham, reja bo'yicha ba'zi e'tirozlarim bor. <br><br>Shaxsan men bosma kitoblarni o'qishning taktil tajribasini afzal ko'raman. Bundan tashqari, tadqiqotlar shuni ko'rsatadiki, tushunish va esda saqlash jismoniy matnlar bilan yuqori bo'lishi mumkin. Shunga qaramay, agar o'tish samarali amalga oshirilsa, men moslashishga tayyorman. <br><br>Shunday qilib, men kutubxonaga elektron o'quvchilaridan foydalanish va raqamli resurslarga kirish bo'yicha keng qamrovli trening sessiyalarini taqdim etishni taklif qilaman. Raqamli formatlar bilan kurashayotgan talabalar uchun mashhur bosma kitoblarning tanlovini saqlab qolish ham muhimdir. Nihoyat, qurilmalar uchun etarli kredit muddatlarini ta'minlash talabalarga keraksiz bosimning oldini oladi. Ushbu takliflarni amalga oshirish o'tish jarayonini sezilarli darajada yaxshilaydi.\n\nEng yaxshi tilaklar bilan,<br>\n[Sizning Ismingiz]\n</p>\n"
    },
    "t2": {
      "title": "Task 2",
      "target": "180–200 words",
      "prompt": "You saw an online forum discussion on this topic:\n\"Should people read printed books or e-books?\"\n Write a post sharing your opinion. Give reasons and examples. Write 180–200 words.",
      "sample": "Hi everyone,\n\nI'd like to share my thoughts on the library's plan to <span class=\"ml-token phrasal\">move towards</span> a digital collection. <span class=\"ml-token adv\">Personally</span>, I have mixed feelings about it. While I see the advantages of e-books, I <span class=\"ml-token modal\">still</span> prefer printed books.\n\nE-books are <span class=\"ml-token adv\">undoubtedly</span> convenient. You can carry hundreds of books on a single device, which is great for travel or research. They are also often cheaper than printed versions, and the library <span class=\"ml-token modal\">could</span> save money in the long run. However, I find it harder to <span class=\"ml-token colloc\">focus on</span> the text when reading on a screen. I get distracted more easily.\n\nPrinted books, on the other hand, offer a different experience. I enjoy the <span class=\"ml-token colloc\">physical feel</span> of turning the pages and the smell of old books. For me, it’s a more immersive and enjoyable experience. <span class=\"ml-token adv\">Also</span>, I worry about <span class=\"ml-token colloc\">eye strain</span> from reading screens for long periods.\n\nTo make this transition smoother, the library <span class=\"ml-token modal\">should</span> offer workshops on using e-readers and provide clear instructions. <span class=\"ml-token adv\">Perhaps</span> they <span class=\"ml-token modal\">could</span> also keep a smaller collection of popular printed books for those who prefer them. Finding a balance is key.\n",
      "sampleA1": "<p>Hello! My name is Alex. I am a student. I like the library. But I don't like the new plan. I like books. Books are good. I like to touch the paper. E-books are okay, but not good. My eyes hurt after e-books. <br><br>\nI like to read in bed. Books are easy in bed. E-readers are big. Maybe small e-readers are good. But I like books more. Please keep some books. Maybe half books and half e-books? This is my idea. Thank you. I hope you listen.</p>\n",
      "sampleA2": "<p>Hello everyone,<br><br>I want to say something about the library changes. I like reading. I think both printed books and e-books are good, but I like printed books more. I like to hold the book in my hands. It feels nice. Also, I don't need a charger for a printed book! My e-reader always runs out of battery when I am reading something very interesting.<br><br>E-books are good too because they are easy to carry. I can have many books on one device. But sometimes my eyes hurt after reading on the screen for a long time. I think the library should still have some printed books, especially for students who don't have e-readers. Maybe the library can buy special lamps so people can read e-books without hurting their eyes. Thank you.</p>\n",
      "sampleB1": "<p>Hello everyone,<br>\nI wanted to share my thoughts about the library's plan to switch to e-books. I have mixed feelings about it. On the one hand, I understand the benefits. E-books are more environmentally friendly because they don't use paper. Also, they can save a lot of space in the library, and we can access them from anywhere with an internet connection.\n\nHowever, I still prefer printed books. For example, I find it easier to concentrate when I'm reading a physical book. I also like the feeling of turning the pages and the smell of old books! It's just a more enjoyable experience for me. Plus, I worry about eye strain from reading on a screen for too long.\n\nTo make the transition smoother, I suggest the library offers training sessions on how to use e-readers and find e-books. Also, it would be great if they kept a small collection of popular printed books for those of us who still prefer them. In my opinion, a mix of both would be the best solution. Thanks for listening.</p>\n",
      "sampleB2": "<p>The library's transition to a digital collection is a significant change, and while I understand the potential benefits, I also have some reservations. The question of printed books versus e-books isn't a simple one, and I believe there are valid arguments on both sides. <br><br> Personally, while I appreciate the convenience of e-books, I still strongly prefer reading printed books. There's a tactile element that enhances the reading experience for me – the feel of the paper, the smell of the ink. Furthermore, I find it easier to concentrate when reading a physical book; the lack of distractions from notifications or other apps allows for deeper immersion. For example, when studying complex texts for my history course, I find highlighting and annotating in the margins of a physical book far more effective than using digital tools. <br><br> Nevertheless, I recognise the advantages of e-books, particularly in terms of accessibility and portability. Consequently, I suggest the library considers a hybrid approach, retaining a core collection of printed books while expanding the digital offerings. This would cater to different learning styles and preferences, ensuring a more inclusive and effective learning environment for all students.</p>\n",
      "uzSample": "Assalomu alaykum hammaga,\n\n<p>Men kutubxonaning raqamli to‘plamga o‘tish rejalari haqidagi fikrlarimni bo‘lishmoqchiman. Shaxsan men bu borada aralash his-tuyg'ularga egaman. Elektron kitoblarning afzalliklarini ko'rsam ham, men hali ham bosma kitoblarni afzal ko'raman.</p>\n\n<p>Elektron kitoblar, shubhasiz, qulay. Siz yuzlab kitoblarni bitta qurilmada olib yurishingiz mumkin, bu sayohat yoki tadqiqot uchun juda yaxshi. Ular ko'pincha bosma nashrlardan arzonroq va kutubxona uzoq muddatda pulni tejashi mumkin. Biroq, ekranda o'qiyotganda matnga e'tiborni qaratish men uchun qiyinroq. Men osonroq chalg'iyman.</p>\n\n<p>Bosma kitoblar esa boshqacha tajriba taklif etadi. Men varaqlarni o'girishning jismoniy hissini va eski kitoblarning hidini yaxshi ko'raman. Men uchun bu yanada qamrab oluvchi va yoqimli tajriba. Shuningdek, uzoq vaqt davomida ekrandan o'qishdan ko'zlarim zo'riqishi haqida xavotirdaman.</p>\n\n<p>Ushbu o'tishni yanada ravonroq qilish uchun kutubxona elektron o'quvchilardan foydalanish bo'yicha seminarlar o'tkazishi va aniq ko'rsatmalar berishi kerak. Ehtimol, ular o'zlariga yoqqan bosma kitoblarning kichikroq to'plamini ham saqlashlari mumkin. Muvozanatni topish muhim.</p>\n",
      "uzSampleA1": "<p>Salom! Mening ismim Aleks. Men talabaman. Menga kutubxona yoqadi. Lekin menga yangi reja yoqmaydi. Menga kitoblar yoqadi. Kitoblar yaxshi. Menga qog'ozga tegish yoqadi. Elektron kitoblar yaxshi, lekin juda emas. Elektron kitoblardan keyin ko'zlarim og'riydi. <br><br>\nMenga yotog'imda o'qish yoqadi. Kitoblar yotoqda oson. Elektron o'quvchilar katta. Balki kichik elektron o'quvchilar yaxshidir. Lekin menga kitoblar ko'proq yoqadi. Iltimos, bir nechta kitoblarni saqlang. Balki yarmi kitoblar va yarmi elektron kitoblar? Bu mening g'oyam. Rahmat. Umid qilaman, meni tinglaysiz.</p>\n",
      "uzSampleA2": "<p>Hammaga salom,<br><br>Kutubxonadagi o'zgarishlar haqida bir narsa demoqchiman. Men o'qishni yaxshi ko'raman. Menimcha, bosma kitoblar ham, elektron kitoblar ham yaxshi, lekin men bosma kitoblarni ko'proq yaxshi ko'raman. Kitobni qo'limda ushlashni yaxshi ko'raman. Bu yoqimli tuyuladi. Bundan tashqari, bosma kitob uchun zaryadlovchi kerak emas! Mening elektron kitob o'quvchim doimo juda qiziqarli narsa o'qiyotganimda batareyasi tugaydi.<br><br>Elektron kitoblar ham yaxshi, chunki ularni olib yurish oson. Men bitta qurilmada ko'plab kitoblarga ega bo'lishim mumkin. Ammo ba'zida ekranda uzoq vaqt o'qigandan keyin ko'zlarim og'riydi. Menimcha, kutubxonada hali ham bosma kitoblar bo'lishi kerak, ayniqsa elektron kitob o'quvchilari bo'lmagan talabalar uchun. Ehtimol, kutubxona maxsus lampalar sotib olishi mumkin, shunda odamlar ko'zlarini og'ritmasdan elektron kitoblarni o'qishlari mumkin. Rahmat.</p>\n",
      "uzSampleB1": "<p>Hammaga salom,<br>\nKutubxonaning elektron kitoblarga o'tish rejasi haqidagi fikrlarimni baham ko'rmoqchiman. Bu borada aralash tuyg'ularga egaman. Bir tomondan, foydalarini tushunaman. Elektron kitoblar qog'oz ishlatmagani uchun ekologik jihatdan qulayroq. Shuningdek, ular kutubxonada ko'p joyni tejashlari mumkin va biz ularga internet aloqasi orqali istalgan joydan kirishimiz mumkin.</p>\n\n<p>Biroq, men hali ham bosma kitoblarni afzal ko'raman. Misol uchun, jismoniy kitob o'qiyotganimda diqqatimni jamlash osonroq bo'ladi. Shuningdek, varaqlarni aylantirish va eski kitoblarning hidini yoqtiraman! Bu men uchun shunchaki yoqimliroq tajriba. Bundan tashqari, ekranda juda uzoq vaqt o'qishdan ko'zlarim zo'riqishidan xavotirdaman.</p>\n\n<p>O'tish jarayonini yanada muammosiz qilish uchun, kutubxona elektron o'quvchilardan qanday foydalanish va elektron kitoblarni qanday topish bo'yicha mashg'ulotlar o'tkazishni taklif qilaman. Shuningdek, agar ular hali ham bosma kitoblarni afzal ko'radiganlar uchun mashhur bosma kitoblarning kichik to'plamini saqlab qolishsa, juda yaxshi bo'lardi. Mening fikrimcha, ikkalasining aralashmasi eng yaxshi yechim bo'ladi. Tinglaganingiz uchun rahmat.</p>\n",
      "uzSampleB2": "<p>Kutubxonaning raqamli to'plamga o'tishi muhim o'zgarishdir va men potentsial afzalliklarni tushunsam ham, ba'zi bir e'tirozlarim bor. Bosma kitoblar va elektron kitoblar masalasi oddiy emas va menimcha, har ikki tomonda ham asosli argumentlar mavjud. <br><br> Shaxsan men elektron kitoblarning qulayligini qadrlasam ham, bosma kitoblarni o'qishni afzal ko'raman. Qog'ozning hissi, siyohning hidi kabi taktil element o'qish tajribasini yaxshilaydi. Bundan tashqari, jismoniy kitobni o'qiyotganda diqqatimni jamlash osonroq; bildirishnomalar yoki boshqa ilovalardan chalg'imaslik chuqurroq sho'ng'ish imkonini beradi. Misol uchun, tarix kursi uchun murakkab matnlarni o'rganayotganda, jismoniy kitobning chetlarida belgilash va izoh yozish digital vositalardan ko'ra ancha samaraliroqdir. <br><br> Shunga qaramay, men elektron kitoblarning afzalliklarini, ayniqsa, ularning qulayligi va ko'chma ekanligini tan olaman. Shuning uchun men kutubxonaga raqamli takliflarni kengaytirish bilan birga bosma kitoblarning asosiy to'plamini saqlab qolishni taklif qilaman. Bu turli xil o'rganish uslublari va imtiyozlariga mos keladi va barcha talabalar uchun yanada inklyuziv va samarali o'quv muhitini ta'minlaydi.</p>\n"
    }
  },
  "vocabulary": {
    "task11": [
      {
        "en": "library transition",
        "uz": "kutubxona o'tishi"
      },
      {
        "en": "digital collection",
        "uz": "raqamli to'plam"
      },
      {
        "en": "e-reader loan",
        "uz": "elektron kitob o'quvchini ijaraga olish"
      },
      {
        "en": "e-book titles",
        "uz": "elektron kitob sarlavhalari"
      },
      {
        "en": "printed books",
        "uz": "bosma kitoblar"
      },
      {
        "en": "e-books",
        "uz": "elektron kitoblar"
      },
      {
        "en": "reading experience",
        "uz": "o'qish tajribasi"
      },
      {
        "en": "eye strain",
        "uz": "ko'z zo'riqishi"
      },
      {
        "en": "portability",
        "uz": "ko'chirish imkoniyati"
      },
      {
        "en": "accessibility",
        "uz": "qulaylik"
      },
      {
        "en": "page turning",
        "uz": "sahifa aylantirish"
      },
      {
        "en": "book smell",
        "uz": "kitob hidi"
      },
      {
        "en": "environmental impact",
        "uz": "atrof-muhitga ta'siri"
      },
      {
        "en": "technology adoption",
        "uz": "texnologiyani qabul qilish"
      },
      {
        "en": "digital divide",
        "uz": "raqamli tafovut"
      }
    ],
    "task12": [
      {
        "en": "digital transition",
        "uz": "raqamli o'tish"
      },
      {
        "en": "e-book accessibility",
        "uz": "elektron kitob qulayligi"
      },
      {
        "en": "reading experience",
        "uz": "o'qish tajribasi"
      },
      {
        "en": "eye strain",
        "uz": "ko'zning zo'riqishi"
      },
      {
        "en": "digital divide",
        "uz": "raqamli tafovut"
      },
      {
        "en": "borrowing system",
        "uz": "qarz olish tizimi"
      },
      {
        "en": "technical support",
        "uz": "texnik yordam"
      },
      {
        "en": "user training",
        "uz": "foydalanuvchilarni o'qitish"
      },
      {
        "en": "digital literacy",
        "uz": "raqamli savodxonlik"
      },
      {
        "en": "preserve physical books",
        "uz": "jismoniy kitoblarni saqlash"
      },
      {
        "en": "internet access",
        "uz": "internetga ulanish"
      },
      {
        "en": "affordability of devices",
        "uz": "qurilmalarning arzonligi"
      },
      {
        "en": "environmental impact",
        "uz": "atrof-muhitga ta'siri"
      },
      {
        "en": "reading preferences",
        "uz": "o'qish afzalliklari"
      },
      {
        "en": "library resources",
        "uz": "kutubxona resurslari"
      }
    ],
    "task2": [
      {
        "en": "e-books",
        "uz": "elektron kitoblar"
      },
      {
        "en": "printed books",
        "uz": "bosma kitoblar"
      },
      {
        "en": "digital library",
        "uz": "raqamli kutubxona"
      },
      {
        "en": "reading experience",
        "uz": "o'qish tajribasi"
      },
      {
        "en": "eye strain",
        "uz": "ko'z zo'riqishi"
      },
      {
        "en": "accessibility",
        "uz": "qulaylik"
      },
      {
        "en": "portability",
        "uz": "ko'chirish imkoniyati"
      },
      {
        "en": "digital divide",
        "uz": "raqamli tafovut"
      },
      {
        "en": "battery life",
        "uz": "batareya quvvati"
      },
      {
        "en": "physical copy",
        "uz": "jismoniy nusxa"
      },
      {
        "en": "environmental impact",
        "uz": "atrof-muhitga ta'siri"
      },
      {
        "en": "reading comprehension",
        "uz": "o'qishni tushunish"
      },
      {
        "en": "personal preference",
        "uz": "shaxsiy afzallik"
      },
      {
        "en": "transition period",
        "uz": "o'tish davri"
      },
      {
        "en": "loan system",
        "uz": "qarz berish tizimi"
      }
    ]
  },
  "tokenTranslations": {
    "getting rid of": {
      "uz": "xalos bo'lish",
      "type": "phrasal"
    },
    "lending out": {
      "uz": "qarzga berish",
      "type": "colloc"
    },
    "unsure": {
      "uz": "ishonchsiz",
      "type": "adv"
    },
    "still": {
      "uz": "hali ham",
      "type": "modal"
    },
    "real books": {
      "uz": "haqiqiy kitoblar",
      "type": "colloc"
    },
    "maybe": {
      "uz": "balki",
      "type": "adv"
    },
    "We should": {
      "uz": "Biz kerak",
      "type": "modal"
    },
    "soon": {
      "uz": "tez orada",
      "type": "adv"
    },
    "recently": {
      "uz": "yaqinda",
      "type": "adv"
    },
    "To be honest": {
      "uz": "rostini aytsam",
      "type": "idiom"
    },
    "would": {
      "uz": "ederdim",
      "type": "modal"
    },
    "personally": {
      "uz": "shaxsan",
      "type": "adv"
    },
    "might": {
      "uz": "mumkin",
      "type": "modal"
    },
    "small collection": {
      "uz": "kichik to'plam",
      "type": "colloc"
    },
    "prefer to stick with": {
      "uz": "afzal ko'raman",
      "type": "phrasal"
    },
    "Furthermore": {
      "uz": "Bundan tashqari",
      "type": "adv"
    },
    "could": {
      "uz": "mumkin",
      "type": "modal"
    },
    "technical support": {
      "uz": "texnik yordam",
      "type": "colloc"
    },
    "sort out": {
      "uz": "hal qilmoq",
      "type": "phrasal"
    },
    "may": {
      "uz": "mumkin",
      "type": "modal"
    },
    "move towards": {
      "uz": "tomon harakatlanmoq",
      "type": "phrasal"
    },
    "Personally": {
      "uz": "Shaxsan",
      "type": "adv"
    },
    "undoubtedly": {
      "uz": "shubhasiz",
      "type": "adv"
    },
    "focus on": {
      "uz": "diqqat qaratmoq",
      "type": "colloc"
    },
    "physical feel": {
      "uz": "jismoniy his",
      "type": "colloc"
    },
    "Also": {
      "uz": "Shuningdek",
      "type": "adv"
    },
    "eye strain": {
      "uz": "ko'z zo'riqishi",
      "type": "colloc"
    },
    "should": {
      "uz": "kerak",
      "type": "modal"
    },
    "Perhaps": {
      "uz": "Ehtimol",
      "type": "adv"
    }
  }
};
