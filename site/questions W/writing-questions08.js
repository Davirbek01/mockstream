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
    "p1_context": "You are a regular visitor to your local community library.",
    "p1_scenario": "Dear Library Members,\n\nWe have received funding to renovate our community library. We are considering adding a children's reading corner, a digital media center, study rooms, and a café area. We would love to hear your suggestions on what features would make the library more appealing and useful to all age groups.\n\nThe Library Committee",
    "t11": {
      "title": "Task 1.1",
      "target": "50–70 words",
      "prompt": "Write a message to a friend who also uses the library. Share your thoughts about the renovation plans and discuss which new features you would like to see.",
      "sample": "Hey!\n\nGuess what? The library is getting a <span class=\"ml-token colloc\">major renovation</span>! I'm <span class=\"ml-token adv\">so excited</span> about the <span class=\"ml-token colloc\">digital media center</span> idea. It <span class=\"ml-token modal\">would</span> be perfect for researching stuff online. I also think a <span class=\"ml-token colloc\">quiet study room</span> <span class=\"ml-token modal\">could</span> be really useful during exam season. The café sounds cool too – imagine <span class=\"ml-token idiom\">grabbing a coffee</span> while reading! What features <span class=\"ml-token modal\">would</span> you want?\n\nLet's talk later!\n",
      "sampleA1": "<p>Hi [Friend's Name],<br>Library new! Good? I like books. Cafe? Yes! Bye.</p>",
      "sampleA2": "<p>Hi [Friend's Name],<br>The library will be new! They want to change it. I want a cafe because I like coffee. And maybe study room? What do you think? See you!</p>",
      "sampleB1": "<p>Hi [Friend's Name],<br>Did you hear about the library renovation? I think it's great news! I'd really like them to add a digital media center, it would be so useful for research. Also, some study rooms would be good for when I need to concentrate. A café would be nice too, but maybe not as important. What do you think they should do?<br>See you soon!</p>",
      "sampleB2": "<p>Hey [Friend's Name],<br>Have you heard about the proposed renovations to the library? I'm quite intrigued by the possibilities. Personally, I'm most enthusiastic about the prospect of a digital media center; it would be invaluable for conducting research and accessing online resources. I also believe that dedicated study rooms would be a significant asset, particularly during peak exam periods. While a café could certainly enhance the library's atmosphere, I consider the other options to be of greater practical importance. What are your thoughts on the matter? I'd be interested to hear your perspective.<br>Best,<br>[Your Name]</p>",
      "uzSample": "<p>Salom!</p>\n<p>Nima deb o'ylaysan? Kutubxona katta ta'mirdan o'tyapti! Raqamli media markazi g'oyasi meni juda xursand qildi. Bu narsa internetda ma'lumot izlash uchun juda mos bo'lardi. Shuningdek, imtihon paytida tinch o'qish xonasi juda foydali bo'lishi mumkin deb o'ylayman. Kafe ham ajoyib tuyuladi – o'qiyotganda bir chashka qahva ichishni tasavvur qiling! Senga qanday yangi jihozlar kerak bo'lardi?</p>\n<p>Keyinroq gaplashamiz!</p>",
      "uzSampleA1": "<p>Salom, [Do'stingizning ismi],<br>Kutubxona yangi! Yaxshi? Menga kitoblar yoqadi. Kafe? Ha! Xayr.</p>",
      "uzSampleA2": "<p>Salom, [Do'stingizning ismi],<br>Kutubxona yangi bo'ladi! Ular uni o'zgartirmoqchi. Men kofe ichishni yaxshi ko'rganim uchun kafe xohlayman. Va balki o'qish xonasi ham kerakdir? Sen nima deb o'ylaysan? Ko'rishguncha!</p>",
      "uzSampleB1": "<p>Salom, [Do'stingizning ismi],<br>Kutubxonani ta'mirlash haqida eshitdingizmi? Menimcha, bu ajoyib yangilik! Men ularning raqamli media markazini qo'shishlarini juda xohlardim, bu tadqiqot uchun juda foydali bo'lardi. Shuningdek, konsentratsiya qilishim kerak bo'lganda, ba'zi o'quv xonalari yaxshi bo'lardi. Kafe ham yaxshi bo'lardi, lekin unchalik muhim emas. Sizningcha, ular nima qilishlari kerak?<br>Tez orada ko'rishguncha!</p>",
      "uzSampleB2": "<p>Salom [Do'stingizning ismi],<br>Kutubxonani ta'mirlash bo'yicha takliflar haqida eshitdingizmi? Meni imkoniyatlar juda qiziqtirmoqda. Shaxsan men, raqamli media markazining istiqboliga eng ko'p qiziqaman; bu tadqiqot o'tkazish va onlayn resurslarga kirish uchun juda qimmatli bo'lardi. Shuningdek, men alohida o'quv xonalari, ayniqsa imtihonlarning eng qizg'in davrida, muhim afzallik bo'lishiga ishonaman. Qahvaxona kutubxonaning muhitini yaxshilashi mumkin bo'lsa-da, men boshqa variantlarni amaliy jihatdan muhimroq deb hisoblayman. Bu borada sizning fikringiz qanday? Sizning nuqtai nazaringizni eshitishga qiziqardim.<br>Eng yaxshi tilaklar bilan,<br>[Sizning ismingiz]</p>"
    },
    "t12": {
      "title": "Task 1.2",
      "target": "120–150 words",
      "prompt": "Write a formal letter to the Library Committee responding to their message. Suggest specific improvements and explain how they would benefit library users.",
      "sample": "<p>Dear Library Committee,</p>\n\n<p>Thank you for seeking <span class=\"ml-token colloc\">community input</span> regarding the upcoming renovation. I am delighted to share some suggestions that <span class=\"ml-token modal\">could</span> enhance the library's appeal.</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, a well-equipped <span class=\"ml-token colloc\">digital media center</span> <span class=\"ml-token modal\">would</span> be invaluable for students and researchers who require access to <span class=\"ml-token colloc\">online databases</span> and <span class=\"ml-token colloc\">digital resources</span>. <span class=\"ml-token adv\">Additionally</span>, creating dedicated <span class=\"ml-token colloc\">study rooms</span> with soundproofing <span class=\"ml-token modal\">would</span> provide quiet spaces for focused work.</p>\n\n<p>I <span class=\"ml-token modal\">would</span> also recommend expanding the <span class=\"ml-token colloc\">children's section</span> to include interactive learning stations. This <span class=\"ml-token modal\">could</span> help foster a <span class=\"ml-token colloc\">love of reading</span> from an early age.</p>\n\n<p><span class=\"ml-token adv\">Finally</span>, a small café area <span class=\"ml-token modal\">would</span> create a welcoming atmosphere and encourage longer visits.</p>\n\n<p>I <span class=\"ml-token phrasal\">look forward to</span> the transformation of our beloved library.</p>\n\n<p>Yours faithfully,<br>Sarah Mitchell</p>",
      "sampleA1": "<p>Hi Library,</p><br><p>I like books. More books for kids! And computers, please. Bye.</p>",
      "sampleA2": "<p>Dear Library Committee,</p><br><p>I like the library. I want a place for children with books. And computers are good, because I need them for my homework. A cafe is good too, because I am hungry when I read. Thank you.</p><br><p>Bye,</p><br><p>[Your Name]</p>",
      "sampleB1": "<p>Dear Library Committee,</p><br><p>I am writing to you about the library renovation. I think a children's reading corner would be a good idea because it would encourage children to read more. Also, study rooms would be useful for students who need a quiet place to study. I also think a cafe would be good because people could get a drink and a snack while they are at the library.</p><br><p>Thank you for considering my suggestions.</p><br><p>Sincerely,</p><br><p>[Your Name]</p>",
      "sampleB2": "<p>Dear Library Committee,</p><br><p>I am writing in response to your announcement regarding the planned library renovation. I have a few suggestions that I believe would significantly benefit library users of all ages.</p><br><p>Firstly, the addition of dedicated study rooms is crucial. These rooms would provide a quiet and focused environment for students and researchers, which is often lacking in the main library space. Secondly, a well-equipped digital media center would be highly valuable, allowing users to access online resources, create multimedia projects, and develop essential digital literacy skills. Furthermore, enhancing the children's section with interactive elements could foster a greater interest in reading among young children.</p><br><p>Finally, I believe that including a small cafe area would greatly improve the library's atmosphere, making it a more welcoming and social space for the community.</p><br><p>Thank you for considering my suggestions. I am excited about the prospect of these improvements.</p><br><p>Yours sincerely,</p><br><p>[Your Name]</p>",
      "uzSample": "<p>Hurmatli Kutubxona Qoʻmitasi,</p>\n\n<p>Yaqinda boʻladigan taʼmirlash boʻyicha jamoatchilik fikrini soʻraganingiz uchun tashakkur. Kutubxonaning jozibasini oshirishi mumkin boʻlgan baʼzi takliflar bilan boʻlishishdan mamnunman.</p>\n\n<p>Birinchidan, yaxshi jihozlangan raqamli media markazi onlayn maʼlumotlar bazalari va raqamli resurslarga kirishni talab qiladigan talabalar va tadqiqotchilar uchun bebaho boʻladi. Bundan tashqari, ovoz oʻtkazmaydigan maxsus oʻquv xonalari yaratish diqqatni jamlagan holda ishlash uchun tinch joylar bilan taʼminlaydi.</p>\n\n<p>Shuningdek, bolalar boʻlimini interaktiv oʻquv stantsiyalari bilan kengaytirishni tavsiya qilaman. Bu yoshligidan kitob oʻqishga muhabbatni rivojlantirishga yordam berishi mumkin.</p>\n\n<p>Nihoyat, kichik kafe maydoni mehmondoʻst muhit yaratadi va uzoqroq tashriflarni ragʻbatlantiradi.</p>\n\n<p>Sevimli kutubxonamizning oʻzgarishini intiqlik bilan kutaman.</p>\n\n<p>Sizning sadoqatliingiz bilan,<br>Sara Mitchell</p>",
      "uzSampleA1": "<p>Salom, Kutubxona,</p><br><p>Men kitoblarni yaxshi ko'raman. Bolalar uchun ko'proq kitoblar kerak! Va kompyuterlar ham bo'lsin, iltimos. Xayr.</p>",
      "uzSampleA2": "<p>Hurmatli Kutubxona Qoʻmitasi,</p><br><p>Menga kutubxona yoqadi. Men bolalar uchun kitoblari bor joy boʻlishini xohlayman. Va kompyuterlar yaxshi, chunki ular menga uy vazifalarim uchun kerak. Qahvaxona ham yaxshi, chunki men oʻqiganimda qornim ochadi. Rahmat.</p><br><p>Xayr,</p><br><p>[Sizning Ismingiz]</p>",
      "uzSampleB1": "<p>Hurmatli Kutubxona Qoʻmitasi,</p><br><p>Men sizga kutubxonani taʼmirlash boʻyicha murojaat qilmoqdaman. Mening fikrimcha, bolalar uchun oʻqish burchagi yaxshi gʻoya boʻlardi, chunki bu bolalarni koʻproq oʻqishga undaydi. Shuningdek, oʻqish uchun tinch joyga muhtoj boʻlgan talabalar uchun oʻquv xonalari foydali boʻladi. Menimcha, kafe ham yaxshi boʻlardi, chunki odamlar kutubxonada boʻlgan vaqtlarida ichimlik va yegulik olishlari mumkin boʻlardi.</p><br><p>Takliflarimni koʻrib chiqqaningiz uchun rahmat.</p><br><p>Hurmat bilan,</p><br><p>[Sizning Ismingiz]</p>",
      "uzSampleB2": "<p>Hurmatli Kutubxona Qoʻmitasi,</p><br><p>Men sizning kutubxonani rejalashtirilgan taʼmirlash boʻyicha eʼloningizga javoban yozmoqdaman. Mening fikrimcha, barcha yoshdagi kutubxona foydalanuvchilariga sezilarli foyda keltiradigan bir nechta takliflarim bor.</p><br><p>Birinchidan, alohida oʻquv xonalarini qoʻshish juda muhim. Ushbu xonalar talabalar va tadqiqotchilar uchun tinch va diqqatni jamlashga qulay muhit yaratadi, bu esa koʻpincha asosiy kutubxona maydonida yetishmaydi. Ikkinchidan, yaxshi jihozlangan raqamli media markazi juda qimmatli boʻladi, bu foydalanuvchilarga onlayn resurslardan foydalanish, multimedia loyihalarini yaratish va muhim raqamli savodxonlik koʻnikmalarini rivojlantirish imkonini beradi. Bundan tashqari, bolalar boʻlimini interaktiv elementlar bilan yaxshilash yosh bolalarda oʻqishga boʻlgan qiziqishni oshirishi mumkin.</p><br><p>Va nihoyat, men kichik kafe zonasini qoʻshish kutubxonaning muhitini sezilarli darajada yaxshilaydi, uni jamiyat uchun yanada qulay va ijtimoiy makonga aylantiradi, deb hisoblayman.</p><br><p>Takliflarimni koʻrib chiqayotganingiz uchun tashakkur. Ushbu yaxshilanishlar istiqbolidan xursandman.</p><br><p>Hurmat bilan,</p><br><p>[Sizning ismingiz]</p>"
    },
    "t2": {
      "title": "Task 2",
      "target": "180–200 words",
      "prompt": "You are writing an article for a community newsletter. The topic is: \"Are public libraries still relevant in the digital age?\" Write your article, giving reasons and examples.",
      "sample": "<h2>Public Libraries: A Timeless Resource in the Digital Era</h2>\n\n<p>In an age where information is available at our fingertips, some argue that <span class=\"ml-token colloc\">public libraries</span> have become obsolete. However, a closer examination reveals that these <span class=\"ml-token colloc\">community institutions</span> remain as relevant as ever.</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, libraries serve as <span class=\"ml-token colloc\">equalizing spaces</span>. Not everyone has access to the internet or digital devices at home. Libraries provide <span class=\"ml-token colloc\">free access</span> to technology, ensuring that all members of the community can <span class=\"ml-token phrasal\">keep up with</span> the <span class=\"ml-token colloc\">digital world</span>.</p>\n\n<p><span class=\"ml-token adv\">Moreover</span>, libraries have evolved beyond book lending. Many now offer <span class=\"ml-token colloc\">community programs</span>, workshops, and events that foster <span class=\"ml-token colloc\">social connection</span>. For instance, reading groups and author talks bring people together, something that <span class=\"ml-token colloc\">digital platforms</span> cannot fully replicate.</p>\n\n<p><span class=\"ml-token adv\">Furthermore</span>, libraries are <span class=\"ml-token colloc\">safe havens</span> for students and professionals seeking <span class=\"ml-token colloc\">quiet study spaces</span>. The structured environment promotes <span class=\"ml-token colloc\">focused learning</span>, free from household distractions.</p>\n\n<p>While the <span class=\"ml-token colloc\">digital revolution</span> has transformed how we access information, public libraries <span class=\"ml-token modal\">should</span> be viewed as complementary rather than redundant. By adapting to modern needs, they continue to play a <span class=\"ml-token colloc\">vital role</span> in our communities.</p>",
      "sampleA1": "<p>Hi!<br><br>Library is good. Books are good. I like books. My mom takes me.<br><br>Bye!</p>",
      "sampleA2": "<p>Hello,<br><br>I like the library. I go to the library with my family. I like to read books and my brother likes the computers. I think the library is important because not everyone has books at home. Also, the library has computers and the internet but my house does not. It is good for kids. <br><br>Thank you.</p>",
      "sampleB1": "<p>Are libraries still important today?<br><br>Some people think libraries are not important because we have the internet now. You can read books on your phone or computer. However, I think libraries are still very useful. <br><br>For example, libraries have free internet and computers for people who don't have them at home. Also, libraries are quiet places to study. It is hard to study at home with the TV and my family. I also like to read real books, not just on a screen. In my opinion, libraries are important for everyone in the community, especially students. They should stay open!<br><br>Thank you.</p>",
      "sampleB2": "<p>Public Libraries: Still Relevant in the Digital Age<br><br>In today's world, it's easy to question the relevance of traditional institutions like public libraries. With so much information available online, are libraries becoming obsolete? I believe the answer is a resounding no. Libraries continue to provide essential services and adapt to meet the evolving needs of our communities. <br><br>One crucial role libraries play is bridging the digital divide. Not everyone has access to reliable internet or computers at home. Libraries offer free access to these resources, enabling individuals to learn new skills, search for jobs, and connect with others. Furthermore, libraries provide a quiet, supportive environment for studying and research, which can be especially valuable for students. They also offer programs and workshops that promote literacy and lifelong learning. Libraries are also a valuable place for social interaction and community engagement.<br><br>While the internet offers convenience, libraries provide a curated and trustworthy source of information, as well as a valuable community hub. Therefore, libraries remain a vital resource in the digital age.</p>",
      "uzSample": "<h2>Ommaviy kutubxonalar: Raqamli davrda zamondan tashqari resurs</h2>\n\n<p>Axborot bizning qo'limizda mavjud bo'lgan davrda, ba'zilar ommaviy kutubxonalar eskirgan deb bahslashadi. Biroq, yaqindan o'rganish shuni ko'rsatadiki, bu jamoat muassasalari har doimgidek dolzarbligicha qolmoqda.</p>\n\n<p>Birinchidan, kutubxonalar tenglashtiruvchi joylar bo'lib xizmat qiladi. Hamma ham uyda internetga yoki raqamli qurilmalarga ega emas. Kutubxonalar texnologiyaga bepul kirishni ta'minlaydi, bu esa jamiyatning barcha a'zolari raqamli dunyo bilan hamnafas bo'lishini ta'minlaydi.</p>\n\n<p>Bundan tashqari, kutubxonalar kitob berishdan tashqari rivojlandi. Ularning ko'pchiligi hozirda ijtimoiy aloqani rivojlantiradigan jamoat dasturlari, seminarlar va tadbirlarni taklif qilmoqda. Misol uchun, kitobxonlar guruhlari va mualliflar bilan suhbatlar odamlarni birga olib keladi, buni raqamli platformalar to'liq takrorlay olmaydi.</p>\n\n<p>Bundan tashqari, kutubxonalar talabalar va mutaxassislar uchun tinch o'qish joylarini qidiradigan xavfsiz boshpanadir. Strukturaviy muhit uy sharoitidagi chalg'ituvchi omillardan xoli, diqqatni jamlagan holda o'qishga yordam beradi.</p>\n\n<p>Raqamli inqilob axborotga kirish usulimizni o'zgartirgan bo'lsa-da, ommaviy kutubxonalarni ortiqcha emas, balki to'ldiruvchi sifatida ko'rish kerak. Zamonaviy ehtiyojlarga moslashib, ular bizning jamiyatlarimizda muhim rol o'ynashda davom etmoqda.</p>",
      "uzSampleA1": "<p>Salom!<br><br>Kutubxona yaxshi. Kitoblar yaxshi. Menga kitoblar yoqadi. Onam meni olib boradi.<br><br>Xayr!</p>",
      "uzSampleA2": "<p>Salom,<br><br>Menga kutubxona yoqadi. Men oilam bilan kutubxonaga boraman. Men kitob o'qishni yaxshi ko'raman, akam esa kompyuterlarni yaxshi ko'radi. Menimcha, kutubxona muhim, chunki hamma ham uyida kitoblarga ega emas. Shuningdek, kutubxonada kompyuterlar va internet bor, lekin uyimda yo'q. Bu bolalar uchun yaxshi.<br><br>Rahmat.</p>",
      "uzSampleB1": "<p>Kutubxonalar bugungi kunda ham muhimmi?<br><br>Ba'zi odamlar kutubxonalar muhim emas deb o'ylashadi, chunki hozir bizda internet bor. Kitoblarni telefon yoki kompyuterda o'qishingiz mumkin. Biroq, menimcha, kutubxonalar hali ham juda foydali.<br><br>Misol uchun, kutubxonalarda uyi yo'q odamlar uchun bepul internet va kompyuterlar mavjud. Bundan tashqari, kutubxonalar o'qish uchun tinch joylar. Televizor va oilam bilan uyda o'qish qiyin. Menga shunchaki ekranda emas, balki haqiqiy kitoblarni o'qish ham yoqadi. Mening fikrimcha, kutubxonalar jamiyatdagi hamma uchun, ayniqsa talabalar uchun muhim. Ular ochiq qolishi kerak!<br><br>Rahmat.</p>",
      "uzSampleB2": "<p>Ommaviy kutubxonalar: Raqamli davrda hamon dolzarb<br><br>Bugungi kunda ommaviy kutubxonalar kabi an'anaviy muassasalarning dolzarbligini shubha ostiga olish oson. Internetda juda ko'p ma'lumot mavjud bo'lsa, kutubxonalar eskirib qolayaptimi? Menimcha, javob qat'iy ravishda yo'q. Kutubxonalar muhim xizmatlarni ko'rsatishda davom etmoqda va jamiyatimizning o'zgaruvchan ehtiyojlariga moslashmoqda.<br><br>Kutubxonalarning muhim rollaridan biri raqamli tafovutni bartaraf etishdir. Hamma ham uyda ishonchli internet yoki kompyuterlarga ega emas. Kutubxonalar ushbu resurslarga bepul kirishni taklif etadi, bu esa odamlarga yangi ko'nikmalarni o'rganish, ish qidirish va boshqalar bilan bog'lanish imkonini beradi. Bundan tashqari, kutubxonalar o'qish va tadqiqot uchun tinch, qo'llab-quvvatlovchi muhitni ta'minlaydi, bu ayniqsa talabalar uchun qimmatli bo'lishi mumkin. Ular, shuningdek, savodxonlikni va umrbod ta'limni targ'ib qiluvchi dasturlar va seminarlar taklif etadi. Kutubxonalar, shuningdek, ijtimoiy muloqot va jamiyat ishtiroki uchun qimmatli joydir.<br><br>Internet qulaylikni taklif qilsa-da, kutubxonalar ishonchli ma'lumot manbai, shuningdek, qimmatli jamoat markazini taqdim etadi. Shuning uchun kutubxonalar raqamli davrda muhim resurs bo'lib qolmoqda.</p>"
    }
  },
  "vocabulary": {
    "task11": [
      {
        "en": "guess what",
        "uz": "nima deb o'ylaysiz"
      },
      {
        "en": "major renovation",
        "uz": "katta ta'mirlash"
      },
      {
        "en": "so excited",
        "uz": "juda hayajonlangan"
      },
      {
        "en": "sounds cool",
        "uz": "ajoyib eshitiladi"
      },
      {
        "en": "would be perfect",
        "uz": "mukammal bo'lardi"
      },
      {
        "en": "really useful",
        "uz": "juda foydali"
      },
      {
        "en": "exam season",
        "uz": "imtihon mavjumi"
      },
      {
        "en": "grab a coffee",
        "uz": "qahva olmoq"
      },
      {
        "en": "let's talk",
        "uz": "gaplashaylik"
      },
      {
        "en": "what do you want",
        "uz": "nima xohlaysiz"
      },
      {
        "en": "quiet space",
        "uz": "tinch joy"
      },
      {
        "en": "digital stuff",
        "uz": "raqamli narsalar"
      },
      {
        "en": "reading corner",
        "uz": "o'qish burchagi"
      },
      {
        "en": "study area",
        "uz": "o'qish joyi"
      },
      {
        "en": "café vibes",
        "uz": "kafe muhiti"
      },
      {
        "en": "pretty awesome",
        "uz": "juda ajoyib"
      },
      {
        "en": "can't wait",
        "uz": "kutolmayman"
      },
      {
        "en": "checking it out",
        "uz": "ko'rib chiqish"
      },
      {
        "en": "hang out",
        "uz": "vaqt o'tkazmoq"
      },
      {
        "en": "catch up later",
        "uz": "keyinroq gaplashamiz"
      }
    ],
    "task12": [
      {
        "en": "Dear Committee",
        "uz": "Hurmatli Qo'mita"
      },
      {
        "en": "community input",
        "uz": "jamoa fikri"
      },
      {
        "en": "upcoming renovation",
        "uz": "kelgusi ta'mirlash"
      },
      {
        "en": "enhance the appeal",
        "uz": "jozibadorlikni oshirmoq"
      },
      {
        "en": "digital media center",
        "uz": "raqamli media markazi"
      },
      {
        "en": "online databases",
        "uz": "onlayn ma'lumotlar bazalari"
      },
      {
        "en": "dedicated study rooms",
        "uz": "maxsus o'quv xonalari"
      },
      {
        "en": "soundproofing",
        "uz": "tovush izolyatsiyasi"
      },
      {
        "en": "focused work",
        "uz": "e'tiborli ish"
      },
      {
        "en": "interactive learning",
        "uz": "interaktiv o'rganish"
      },
      {
        "en": "foster a love",
        "uz": "sevgi uyg'otmoq"
      },
      {
        "en": "welcoming atmosphere",
        "uz": "samimiy muhit"
      },
      {
        "en": "encourage longer visits",
        "uz": "uzoqroq tashrif buyurishni rag'batlantirmoq"
      },
      {
        "en": "look forward to",
        "uz": "intiqlik bilan kutmoq"
      },
      {
        "en": "transformation",
        "uz": "o'zgarish"
      },
      {
        "en": "yours faithfully",
        "uz": "hurmat bilan"
      },
      {
        "en": "I would recommend",
        "uz": "men tavsiya qilardim"
      },
      {
        "en": "invaluable resource",
        "uz": "bebaho resurs"
      },
      {
        "en": "children's section",
        "uz": "bolalar bo'limi"
      },
      {
        "en": "provide quiet spaces",
        "uz": "tinch joylar taqdim etmoq"
      }
    ],
    "task2": [
      {
        "en": "public libraries",
        "uz": "ommaviy kutubxonalar"
      },
      {
        "en": "digital age",
        "uz": "raqamli asr"
      },
      {
        "en": "community institutions",
        "uz": "jamoa muassasalari"
      },
      {
        "en": "equalizing spaces",
        "uz": "tenglashtiruvchi joylar"
      },
      {
        "en": "free access",
        "uz": "bepul kirish"
      },
      {
        "en": "digital world",
        "uz": "raqamli dunyo"
      },
      {
        "en": "community programs",
        "uz": "jamoa dasturlari"
      },
      {
        "en": "social connection",
        "uz": "ijtimoiy aloqa"
      },
      {
        "en": "digital platforms",
        "uz": "raqamli platformalar"
      },
      {
        "en": "safe havens",
        "uz": "xavfsiz joylar"
      },
      {
        "en": "quiet study spaces",
        "uz": "tinch o'quv joylari"
      },
      {
        "en": "focused learning",
        "uz": "e'tiborli o'rganish"
      },
      {
        "en": "digital revolution",
        "uz": "raqamli inqilob"
      },
      {
        "en": "complementary",
        "uz": "to'ldiruvchi"
      },
      {
        "en": "vital role",
        "uz": "muhim rol"
      },
      {
        "en": "adapt to needs",
        "uz": "ehtiyojlarga moslashmoq"
      },
      {
        "en": "book lending",
        "uz": "kitob berish"
      },
      {
        "en": "author talks",
        "uz": "mualliflar bilan suhbatlar"
      },
      {
        "en": "structured environment",
        "uz": "tuzilgan muhit"
      },
      {
        "en": "household distractions",
        "uz": "uy chalg'ituvchilari"
      }
    ]
  },
  "tokenTranslations": {
    "major renovation": {
      "uz": "katta ta'mirlash",
      "type": "colloc"
    },
    "so excited": {
      "uz": "juda xursand",
      "type": "adv"
    },
    "digital media center": {
      "uz": "raqamli media markazi",
      "type": "colloc"
    },
    "would": {
      "uz": "…ardi",
      "type": "modal"
    },
    "quiet study room": {
      "uz": "jim o'qish xonasi",
      "type": "colloc"
    },
    "could": {
      "uz": "…olardi",
      "type": "modal"
    },
    "grabbing a coffee": {
      "uz": "bir chashka qahva ichib olish",
      "type": "idiom"
    },
    "community input": {
      "uz": "jamiyat fikri",
      "type": "colloc"
    },
    "Firstly": {
      "uz": "Avvalo",
      "type": "adv"
    },
    "online databases": {
      "uz": "onlayn ma'lumotlar bazalari",
      "type": "colloc"
    },
    "digital resources": {
      "uz": "raqamli resurslar",
      "type": "colloc"
    },
    "Additionally": {
      "uz": "Bundan tashqari",
      "type": "adv"
    },
    "study rooms": {
      "uz": "o'qish xonalari",
      "type": "colloc"
    },
    "children's section": {
      "uz": "bolalar bo'limi",
      "type": "colloc"
    },
    "love of reading": {
      "uz": "kitobga muhabbat",
      "type": "colloc"
    },
    "Finally": {
      "uz": "Nihoyat",
      "type": "adv"
    },
    "look forward to": {
      "uz": "intizorlik bilan kutmoq",
      "type": "phrasal"
    },
    "public libraries": {
      "uz": "ommaviy kutubxonalar",
      "type": "colloc"
    },
    "community institutions": {
      "uz": "jamiyat muassasalari",
      "type": "colloc"
    },
    "equalizing spaces": {
      "uz": "tenglashtiruvchi makonlar",
      "type": "colloc"
    },
    "free access": {
      "uz": "bepul kirish",
      "type": "colloc"
    },
    "keep up with": {
      "uz": "bilan hamnafas bo'lmoq",
      "type": "phrasal"
    },
    "digital world": {
      "uz": "raqamli olam",
      "type": "colloc"
    },
    "Moreover": {
      "uz": "Qolaversa",
      "type": "adv"
    },
    "community programs": {
      "uz": "jamiyat dasturlari",
      "type": "colloc"
    },
    "social connection": {
      "uz": "ijtimoiy aloqa",
      "type": "colloc"
    },
    "digital platforms": {
      "uz": "raqamli platformalar",
      "type": "colloc"
    },
    "Furthermore": {
      "uz": "Bundan tashqari",
      "type": "adv"
    },
    "safe havens": {
      "uz": "xavfsiz joylar",
      "type": "colloc"
    },
    "quiet study spaces": {
      "uz": "tinch o'qish joylari",
      "type": "colloc"
    },
    "focused learning": {
      "uz": "diqqat bilan o'qish",
      "type": "colloc"
    },
    "digital revolution": {
      "uz": "raqamli inqilob",
      "type": "colloc"
    },
    "should": {
      "uz": "kerak",
      "type": "modal"
    },
    "vital role": {
      "uz": "muhim rol",
      "type": "colloc"
    }
  }
};