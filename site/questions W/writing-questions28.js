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
    "p1_context": "You live near a local park that is planning improvements.",
    "p1_scenario": "Dear Residents,\n\nThe Parks Department is planning improvements to Central Park. We are considering adding outdoor exercise equipment, creating a dog-friendly zone, improving walking trails, and installing more benches and lighting.\nWhich improvements would you use most? Are there other changes you would like?\n\nThe Parks Department",
    "t11": {
      "title": "Task 1.1",
      "target": "50 words",
      "prompt": "Write a message to a neighbor about the park improvements. Share your views.",
      "sample": "Hi there!\n\nHave you seen the letter about <span class=\"ml-token colloc\">park improvements</span>? I'm <span class=\"ml-token adv\">really</span> excited about <span class=\"ml-token colloc\">outdoor exercise equipment</span> – it <span class=\"ml-token modal\">would</span> be great for morning workouts! I think better <span class=\"ml-token colloc\">lighting</span> is important too for <span class=\"ml-token colloc\">evening walks</span>. What do you think?\n\nSee you around!",
      "sampleA1": "<p>Hi!<br>Park good. I like dog park. And benches. Bye!</p>",
      "sampleA2": "<p>Hi!<br>I see the letter about the park. I like the dog zone and the new benches. But I don't like exercise things because I don't do exercise. What do you think?</p>",
      "sampleB1": "<p>Hi!<br>Did you see the letter about the park improvements? I think the exercise equipment would be really good. I also think they should improve the walking trails because they are a bit muddy now. Maybe more flowers too? What do you think about it?</p>",
      "sampleB2": "<p>Hi,<br>Have you had a chance to look at the Parks Department's proposal for Central Park? I'm quite keen on the idea of outdoor exercise equipment; it would be a fantastic addition. I also believe improved lighting is essential for safety, especially during the darker months. While a dog zone could be nice, I wonder about potential noise issues. What are your initial thoughts?</p>",
      "uzSample": "<p>Salom!</p>\n<p>Siz bog‘ni obodonlashtirish haqidagi xatni ko‘rdingizmi? Men tashqi mashq uskunalaridan juda xursandman – bu ertalabki mashqlar uchun ajoyib bo‘lardi! Mening fikrimcha, kechki sayrlar uchun yaxshiroq yoritish ham muhim. Siz nima deb o‘ylaysiz?</p>\n<p>Ko'rishguncha!</p>",
      "uzSampleA1": "<p>Salom!<br>Park yaxshi. Menga itlar parki yoqadi. Va o'rindiqlar. Xayr!</p>",
      "uzSampleA2": "<p>Salom!<br>Bog' haqidagi xatni ko'rdim. Menga itlar zonasi va yangi o'rindiqlar yoqdi. Lekin mashq qilish uchun narsalar yoqmadi, chunki men mashq qilmayman. Siz nima deb o'ylaysiz?</p>",
      "uzSampleB1": "<p>Salom!<br>Parkdagi yaxshilanishlar haqidagi xatni ko'rdingizmi? Menimcha, mashq uskunasi juda yaxshi bo'lardi. Shuningdek, piyoda yo'laklarini ham yaxshilash kerak deb o'ylayman, chunki hozir ular biroz loyqa. Balki yana ko'proq gullar ham ekish kerakdir? Siz bu haqda nima deb o'ylaysiz?</p>",
      "uzSampleB2": "<p>Salom,<br>Markaziy bog‘ bo‘yicha Bog‘lar departamentining taklifini ko‘rishga ulgurdingizmi? Menga ochiq havoda mashq qilish uskunalari g‘oyasi juda yoqdi; bu ajoyib qo‘shimcha bo‘lardi. Shuningdek, qorong‘i oylarda xavfsizlik uchun yaxshilangan yoritish zarur deb hisoblayman. Itlar zonasi yaxshi bo‘lishi mumkin, lekin shovqin muammolari haqida o‘ylayapman. Sizning dastlabki fikrlaringiz qanday?</p>"
    },
    "t12": {
      "title": "Task 1.2",
      "target": "120–150 words",
      "prompt": "Write a letter to the Parks Department with your feedback and suggestions.",
      "sample": "<p>Dear Parks Department,</p>\n\n<p>Thank you for inviting community input on the <span class=\"ml-token colloc\">park improvements</span>. I appreciate the opportunity to share my views.</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, improved <span class=\"ml-token colloc\">walking trails</span> <span class=\"ml-token modal\">should</span> be prioritized. Smoother paths <span class=\"ml-token modal\">would</span> benefit joggers, cyclists, and families with strollers.</p>\n\n<p><span class=\"ml-token adv\">Additionally</span>, <span class=\"ml-token colloc\">outdoor exercise equipment</span> <span class=\"ml-token modal\">would</span> be <span class=\"ml-token adv\">incredibly</span> valuable. This <span class=\"ml-token modal\">would</span> encourage <span class=\"ml-token colloc\">physical fitness</span> and provide a free alternative to gym memberships.</p>\n\n<p><span class=\"ml-token adv\">Furthermore</span>, better <span class=\"ml-token colloc\">lighting</span> is essential for <span class=\"ml-token colloc\">evening safety</span>. Many residents enjoy walking after work, but dark paths can feel unsafe.</p>\n\n<p><span class=\"ml-token adv\">Finally</span>, I <span class=\"ml-token modal\">would</span> suggest adding <span class=\"ml-token colloc\">picnic areas</span> with tables, which <span class=\"ml-token modal\">would</span> make the park more suitable for family gatherings.</p>\n\n<p>Thank you for your efforts to enhance our <span class=\"ml-token colloc\">community space</span>.</p>\n\n<p>Best regards,<br>A Local Resident</p>",
      "sampleA1": "<p>Hi Parks!</p><br><p>I like park. I like walk. More light good. Dog park good. Bye.</p>",
      "sampleA2": "<p>Dear Parks Department,</p><br><p>I like the park. I want to walk more, and the paths are not good. I also want a place for dogs because I have a dog. More lights are good too because it is dark at night. Thank you.</p><br><p>From, A Resident</p>",
      "sampleB1": "<p>Dear Parks Department,</p><br><p>I am writing to give you my ideas about the park improvements. I think the walking trails are a good idea because I like to walk my dog there. However, the paths are sometimes difficult to use.</p><br><p>Also, I think outdoor exercise equipment would be very useful. Many people in the neighborhood would use it. More benches would also be good.</p><br><p>I think more lighting is important because it can be dark in the evenings and I don't feel safe. Thank you for listening to my ideas.</p><br><p>Sincerely, A Resident</p>",
      "sampleB2": "<p>Dear Parks Department,</p><br><p>I am writing to express my opinions regarding the proposed improvements to Central Park. I commend your initiative to enhance our community's green space.</p><br><p>I believe that improving the walking trails should be a high priority. Currently, some sections are uneven and poorly maintained, making them unsuitable for elderly residents or those with mobility issues. Resurfacing these trails would significantly improve accessibility.</p><br><p>Furthermore, the addition of outdoor exercise equipment would be a welcome amenity. This would encourage a healthier lifestyle among residents and provide a free alternative to commercial gyms. I also support the idea of increased lighting, particularly along the trails, to enhance safety during evening hours.</p><br><p>Finally, I suggest considering the installation of a water fountain, as this is a feature currently lacking in the park. Thank you for considering my suggestions.</p><br><p>Sincerely, A Concerned Resident</p>",
      "uzSample": "<p>Hurmatli Bog'lar Departamenti,</p>\n\n<p>Bog'ni yaxshilash bo'yicha jamoatchilik fikrini so'raganingiz uchun tashakkur. O'z fikrlarimni bildirsh imkoniyati uchun minnatdorman.</p>\n\n<p>Birinchidan, piyoda yo'laklarini yaxshilashga ustuvor ahamiyat berish kerak. Tekisroq yo'llar yuguruvchilar, velosipedchilar va bolalar aravachasi bilan sayr qiluvchi oilalarga foyda keltirardi.</p>\n\n<p>Bundan tashqari, ochiq havoda mashq qilish uskunalarining bo'lishi juda qimmatli bo'lardi. Bu jismoniy faollikni rag'batlantiradi va sport zallariga a'zolikka bepul alternativa yaratadi.</p>\n\n<p>Bundan tashqari, kechki xavfsizlik uchun yaxshiroq yoritish juda muhim. Ko'p aholi ishdan keyin sayr qilishni yaxshi ko'radi, ammo qorong'u yo'llar xavfli tuyulishi mumkin.</p>\n\n<p>Nihoyat, oilaviy yig'ilishlar uchun bog'ni yanada moslashtirish maqsadida, stolli piknik joylarini qo'shishni taklif qilaman.</p>\n\n<p>Jamiyatimiz hududini yaxshilashga qaratilgan sa'y-harakatlaringiz uchun tashakkur.</p>\n\n<p>Eng yaxshi tilaklar bilan,<br>Mahalliy Aholi</p>",
      "uzSampleA1": "<p>Salom Bog'lar!</p><br><p>Menga bog' yoqadi. Men sayr qilishni yoqtiraman. Ko'proq yorug'lik yaxshi. Itlar bog'i yaxshi. Xayr.</p>",
      "uzSampleA2": "<p>Hurmatli Bog'lar Departamenti,</p><br><p>Menga bog' yoqadi. Men ko'proq piyoda yurishni xohlayman, lekin yo'laklar yaxshi emas. Shuningdek, itlar uchun joy bo'lishini xohlayman, chunki mening itim bor. Kechasi qorong'i bo'lgani uchun ko'proq chiroqlar ham yaxshi bo'lardi. Rahmat.</p><br><p>Sizdan, Bir Mahalliy Aholi</p>",
      "uzSampleB1": "<p>Hurmatli Bog'lar Departamenti,</p><br><p>Men sizga bog'ni yaxshilash bo'yicha o'z fikrlarimni bildirish uchun yozyapman. O'ylaymanki, piyoda yo'laklari yaxshi g'oya, chunki men itimni u yerda sayr qildirishni yaxshi ko'raman. Biroq, yo'laklardan foydalanish ba'zan qiyin.</p><br><p>Shuningdek, men ochiq havoda mashq qilish uchun uskunalar juda foydali bo'ladi deb o'ylayman. Mahalladagi ko'p odamlar undan foydalanishadi. Ko'proq o'rindiqlar ham yaxshi bo'lardi.</p><br><p>Menimcha, ko'proq yoritish muhim, chunki kechqurunlari qorong'i bo'ladi va men o'zimni xavfsiz his qilmayman. Fikrlarimni tinglaganingiz uchun rahmat.</p><br><p>Hurmat bilan, Bir Mahalliy Aholi</p>",
      "uzSampleB2": "<p>Hurmatli Bog'lar Departamenti,</p><br><p>Men Markaziy bog'ga taklif etilayotgan yaxshilanishlar bo'yicha o'z fikrlarimni bildirish uchun yozyapman. Sizning jamiyatimizning yashil hududini yaxshilash tashabbusingizni olqishlayman.</p><br><p>Menimcha, piyoda yo'laklarini yaxshilash yuqori ustuvorlikka ega bo'lishi kerak. Hozirgi vaqtda ba'zi qismlari notekis va yomon saqlangan, bu ularni keksa aholi yoki harakatlanish qiyin bo'lganlar uchun yaroqsiz qiladi. Ushbu yo'laklarni qayta qoplash imkoniyatini sezilarli darajada oshiradi.</p><br><p>Bundan tashqari, ochiq havoda mashq qilish uskunalarini qo'shish mamnuniyat bilan qabul qilinadigan qulaylik bo'ladi. Bu aholi o'rtasida sog'lom turmush tarzini rag'batlantiradi va tijorat sport zallariga bepul alternativa taqdim etadi. Men, ayniqsa, kechki paytlarda xavfsizlikni oshirish uchun yo'laklar bo'ylab yoritishni ko'paytirish g'oyasini ham qo'llab-quvvatlayman.</p><br><p>Nihoyat, men favvora o'rnatishni ko'rib chiqishni taklif qilaman, chunki bu hozirda bog'da etishmayotgan xususiyatdir. Mening takliflarimni ko'rib chiqqaningiz uchun tashakkur.</p><br><p>Hurmat bilan, Tashvishli Aholi</p>"
    },
    "t2": {
      "title": "Task 2",
      "target": "180–200 words",
      "prompt": "You are participating in an online discussion forum. The topic is: \"Are traditional family values still important in modern society?\" Write your response, giving reasons and examples. Write 180–200 words.",
      "sample": "<h2>The Vital Role of Green Spaces in Our City</h2>\n\n<p>As our city continues to grow, <span class=\"ml-token colloc\">green spaces</span> become <span class=\"ml-token adv\">increasingly</span> precious. Parks and gardens are not luxuries – they are essential for <span class=\"ml-token colloc\">healthy communities</span>.</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, green spaces provide opportunities for <span class=\"ml-token colloc\">physical activity</span>. Parks offer space for jogging, cycling, and playing sports – activities that improve <span class=\"ml-token colloc\">physical health</span> and combat <span class=\"ml-token colloc\">sedentary lifestyles</span>.</p>\n\n<p><span class=\"ml-token adv\">Moreover</span>, nature has <span class=\"ml-token colloc\">proven benefits</span> for <span class=\"ml-token colloc\">mental health</span>. Studies show that spending time in green environments reduces <span class=\"ml-token colloc\">stress</span> and <span class=\"ml-token colloc\">anxiety</span>. In our busy urban lives, parks offer a welcome escape.</p>\n\n<p><span class=\"ml-token adv\">Additionally</span>, parks bring communities together. They are places where neighbors meet, children play, and <span class=\"ml-token colloc\">social bonds</span> are formed.</p>\n\n<p><span class=\"ml-token adv\">Furthermore</span>, green spaces <span class=\"ml-token adv\">significantly</span> improve <span class=\"ml-token colloc\">air quality</span> and help regulate urban temperatures – a <span class=\"ml-token colloc\">growing concern</span> with climate change.</p>\n\n<p><span class=\"ml-token adv\">Ultimately</span>, investing in parks is investing in our <span class=\"ml-token colloc\">community's well-being</span>. We <span class=\"ml-token modal\">should</span> protect and expand these vital <span class=\"ml-token colloc\">urban oases</span>.</p>",
      "sampleA1": "<p>Hi! <br> I like park. I like trees. More trees good. I like walk. More walk good. Bye!</p>",
      "sampleA2": "<p>Hello. <br> I like the park near my house. I want a place for dogs because I have a dog. And I want to walk more. The paths are not good now. I also want more seats because I am tired when I walk. Thank you!</p>",
      "sampleB1": "<p>Hello,<br><br>I think the park is very important for people who live here. I would like to use the walking trails because I need to exercise more. Also, a dog park would be great because I have a dog and he needs a place to play. <br><br>I also think more benches are a good idea. Sometimes I want to sit down and relax in the park. Maybe some new flowers would be nice too. Thank you for listening to my ideas.</p>",
      "sampleB2": "<p>Dear Parks Department,<br><br>I am writing to express my views on the proposed improvements to Central Park. I believe that enhancing our local green spaces is a worthwhile investment for the community. Of the suggestions listed, I would most frequently utilize improved walking trails and a designated dog-friendly zone. The current trails are often uneven and poorly maintained, making them unsuitable for regular exercise. A dedicated dog park would provide a safe and controlled environment for dog owners to exercise their pets and socialize.<br><br>Beyond these suggestions, I would also like to propose the installation of water fountains. This would be particularly beneficial during the warmer months, encouraging residents to stay active and hydrated. Furthermore, consider adding more shade structures, such as pergolas or trees, to provide respite from the sun.<br><br>Thank you for considering my input.</p>",
      "uzSample": "<h2>Shahrimizdagi yashil hududlarning muhim roli</h2>\n\n<p>Shahrimiz o'sishda davom etar ekan, yashil hududlar tobora qimmatli bo'lib bormoqda. Bog'lar va xiyobonlar hashamat emas – ular sog'lom jamiyatlar uchun zarurdir.</p>\n\n<p>Birinchidan, yashil hududlar jismoniy faollik uchun imkoniyatlar yaratadi. Bog'lar yugurish, velosipedda sayr qilish va sport bilan shug'ullanish uchun joy taklif etadi – bu faoliyatlar jismoniy salomatlikni yaxshilaydi va harakatsiz turmush tarziga qarshi kurashadi.</p>\n\n<p>Bundan tashqari, tabiatning ruhiy salomatlik uchun foydalari isbotlangan. Tadqiqotlar shuni ko'rsatadiki, yashil muhitda vaqt o'tkazish stress va xavotirni kamaytiradi. Band bo'lgan shahar hayotimizda bog'lar xush kelibsiz qochish imkoniyatini beradi.</p>\n\n<p>Qolaversa, bog'lar jamiyatlarni birlashtiradi. Ular qo'shnilar uchrashadigan, bolalar o'ynaydigan va ijtimoiy aloqalar shakllanadigan joylardir.</p>\n\n<p>Bundan tashqari, yashil hududlar havo sifatini sezilarli darajada yaxshilaydi va shahar haroratini tartibga solishga yordam beradi – bu iqlim o'zgarishi bilan bog'liq tobora ortib borayotgan muammodir.</p>\n\n<p>Yakuniy xulosa shuki, bog'larga sarmoya kiritish – bu jamiyatimiz farovonligiga sarmoya kiritishdir. Biz ushbu muhim shahar vohalarini himoya qilishimiz va kengaytirishimiz kerak.</p>",
      "uzSampleA1": "<p>Salom! <br> Menga park yoqadi. Menga daraxtlar yoqadi. Ko'proq daraxtlar yaxshi. Menga sayr qilish yoqadi. Ko'proq sayr qilish yaxshi. Xayr!</p>",
      "uzSampleA2": "<p>Salom. <br> Menga uyimning yonidagi park yoqadi. Menda itim borligi uchun itlar uchun joy bo'lishini xohlayman. Va men ko'proq sayr qilishni xohlayman. Hozir yo'laklar yaxshi emas. Shuningdek, men ko'proq o'rindiqlar bo'lishini xohlayman, chunki sayr qilganimda charchayman. Rahmat!</p>",
      "uzSampleB1": "<p>Salom,<br><br>Menimcha, park bu yerda yashovchi odamlar uchun juda muhim. Men piyoda yo'laklaridan foydalanmoqchiman, chunki menga ko'proq mashq qilish kerak. Shuningdek, itlar parki ham ajoyib bo'lardi, chunki mening itim bor va unga o'ynash uchun joy kerak.<br><br>Menimcha, ko'proq o'rindiqlar ham yaxshi fikr. Ba'zan parkda o'tirib dam olgim keladi. Ehtimol, yangi gullar ham yaxshi bo'lardi. Fikrlarimni tinglaganingiz uchun rahmat.</p>",
      "uzSampleB2": "<p>Hurmatli Bog'lar Departamenti,<br><br>Men Markaziy bog'ga taklif etilayotgan yaxshilanishlar bo'yicha o'z fikrlarimni bildirish uchun yozyapman. Menimcha, mahalliy yashil hududlarimizni yaxshilash jamiyat uchun arziydigan sarmoyadir. Ro'yxatda keltirilgan takliflardan men eng ko'p piyoda yurish yo'laklarini yaxshilash va itlar uchun mo'ljallangan zonadan foydalangan bo'lardim. Hozirgi yo'laklar ko'pincha notekis va yomon ta'mirlangan bo'lib, ularni muntazam mashq qilish uchun yaroqsiz qiladi. Itlar uchun maxsus bog' it egalari uchun o'z uy hayvonlarini mashq qildirish va muloqot qilish uchun xavfsiz va nazorat qilinadigan muhitni ta'minlaydi.<br><br>Ushbu takliflardan tashqari, men suv favvoralarini o'rnatishni ham taklif qilmoqchiman. Bu, ayniqsa, issiq oylarda foydali bo'ladi va aholini faol va suv bilan ta'minlangan holda qolishga undaydi. Bundan tashqari, quyoshdan dam olish uchun pergolalar yoki daraxtlar kabi soyali inshootlar qo'shishni o'ylab ko'ring.<br><br>Mening fikrlarimni ko'rib chiqqaningiz uchun tashakkur.</p>"
    }
  },
  "vocabulary": {
    "task11": [
      {
        "en": "park improvements",
        "uz": "park yaxshilanishlari"
      },
      {
        "en": "really excited",
        "uz": "juda hayajonlangan"
      },
      {
        "en": "outdoor exercise equipment",
        "uz": "ochiq havoda mashq jihozlari"
      },
      {
        "en": "morning workouts",
        "uz": "ertalabki mashqlar"
      },
      {
        "en": "better lighting",
        "uz": "yaxshiroq yoritish"
      },
      {
        "en": "evening walks",
        "uz": "kechki sayrlar"
      },
      {
        "en": "see you around",
        "uz": "ko'rishamiz"
      },
      {
        "en": "sounds great",
        "uz": "ajoyib eshitiladi"
      },
      {
        "en": "really needed",
        "uz": "juda kerak"
      },
      {
        "en": "good news",
        "uz": "yaxshi yangilik"
      },
      {
        "en": "what do you think",
        "uz": "nima deb o'ylaysiz"
      },
      {
        "en": "take the dog",
        "uz": "itni olib bormoq"
      },
      {
        "en": "go for a run",
        "uz": "yugurish uchun bormoq"
      },
      {
        "en": "nice place",
        "uz": "yaxshi joy"
      },
      {
        "en": "hang out",
        "uz": "vaqt o'tkazmoq"
      },
      {
        "en": "pretty cool",
        "uz": "ancha ajoyib"
      },
      {
        "en": "let me know",
        "uz": "menga ayting"
      },
      {
        "en": "about time",
        "uz": "vaqti keldi"
      },
      {
        "en": "good idea",
        "uz": "yaxshi fikr"
      },
      {
        "en": "talk soon",
        "uz": "tez gaplashamiz"
      }
    ],
    "task12": [
      {
        "en": "inviting community input",
        "uz": "jamoa fikrini so'ramoq"
      },
      {
        "en": "park improvements",
        "uz": "park yaxshilanishlari"
      },
      {
        "en": "walking trails",
        "uz": "sayr yo'laklari"
      },
      {
        "en": "smoother paths",
        "uz": "tekisroq yo'laklar"
      },
      {
        "en": "outdoor exercise equipment",
        "uz": "ochiq havoda mashq jihozlari"
      },
      {
        "en": "physical fitness",
        "uz": "jismoniy tayyorgarlik"
      },
      {
        "en": "free alternative",
        "uz": "bepul alternativa"
      },
      {
        "en": "evening safety",
        "uz": "kechki xavfsizlik"
      },
      {
        "en": "dark paths",
        "uz": "qorong'u yo'laklar"
      },
      {
        "en": "feel unsafe",
        "uz": "xavfli his qilmoq"
      },
      {
        "en": "picnic areas",
        "uz": "piknik joylari"
      },
      {
        "en": "family gatherings",
        "uz": "oilaviy yig'ilishlar"
      },
      {
        "en": "community space",
        "uz": "jamoa maydoni"
      },
      {
        "en": "local resident",
        "uz": "mahalliy aholi"
      },
      {
        "en": "best regards",
        "uz": "hurmat bilan"
      },
      {
        "en": "prioritize improvements",
        "uz": "yaxshilanishlarga ustuvorlik bermoq"
      },
      {
        "en": "enhance facilities",
        "uz": "sharoitlarni yaxshilamoq"
      },
      {
        "en": "benefit residents",
        "uz": "aholiga foyda keltirmoq"
      },
      {
        "en": "appreciate opportunity",
        "uz": "imkoniyatdan minnatdor"
      },
      {
        "en": "efforts to enhance",
        "uz": "yaxshilash harakatlari"
      }
    ],
    "task2": [
      {
        "en": "green spaces",
        "uz": "yashil maydonlar"
      },
      {
        "en": "healthy communities",
        "uz": "sog'lom jamoalar"
      },
      {
        "en": "physical activity",
        "uz": "jismoniy faollik"
      },
      {
        "en": "physical health",
        "uz": "jismoniy salomatlik"
      },
      {
        "en": "sedentary lifestyles",
        "uz": "harakatsiz turmush tarzi"
      },
      {
        "en": "proven benefits",
        "uz": "isbotlangan foydalari"
      },
      {
        "en": "mental health",
        "uz": "ruhiy salomatlik"
      },
      {
        "en": "stress and anxiety",
        "uz": "stress va tashvish"
      },
      {
        "en": "social bonds",
        "uz": "ijtimoiy aloqalar"
      },
      {
        "en": "air quality",
        "uz": "havo sifati"
      },
      {
        "en": "growing concern",
        "uz": "ortib borayotgan tashvish"
      },
      {
        "en": "community's well-being",
        "uz": "jamoa farovonligi"
      },
      {
        "en": "urban oases",
        "uz": "shahar vohalari"
      },
      {
        "en": "climate change",
        "uz": "iqlim o'zgarishi"
      },
      {
        "en": "urban temperatures",
        "uz": "shahar haroratlari"
      },
      {
        "en": "welcome escape",
        "uz": "yoqimli qochish joyi"
      },
      {
        "en": "neighbors meet",
        "uz": "qo'shnilar uchrashuvi"
      },
      {
        "en": "children play",
        "uz": "bolalar o'yinlari"
      },
      {
        "en": "protect and expand",
        "uz": "himoya qilish va kengaytirish"
      },
      {
        "en": "investing in parks",
        "uz": "parklarga sarmoya kiritish"
      }
    ]
  },
  "tokenTranslations": {
    "park improvements": {
      "uz": "bog'ni obodonlashtirish",
      "type": "colloc"
    },
    "really": {
      "uz": "haqiqatan ham",
      "type": "adv"
    },
    "outdoor exercise equipment": {
      "uz": "ko'cha trenajorlari",
      "type": "colloc"
    },
    "would": {
      "uz": "-ardi",
      "type": "modal"
    },
    "lighting": {
      "uz": "yoritish",
      "type": "colloc"
    },
    "evening walks": {
      "uz": "kechki sayrlar",
      "type": "colloc"
    },
    "Firstly": {
      "uz": "Avvalo",
      "type": "adv"
    },
    "walking trails": {
      "uz": "piyoda yo'laklari",
      "type": "colloc"
    },
    "should": {
      "uz": "kerak",
      "type": "modal"
    },
    "Additionally": {
      "uz": "Qo'shimcha ravishda",
      "type": "adv"
    },
    "incredibly": {
      "uz": "g'oyatda",
      "type": "adv"
    },
    "physical fitness": {
      "uz": "jismoniy tayyorgarlik",
      "type": "colloc"
    },
    "Furthermore": {
      "uz": "Bundan tashqari",
      "type": "adv"
    },
    "evening safety": {
      "uz": "kechki xavfsizlik",
      "type": "colloc"
    },
    "Finally": {
      "uz": "Nihoyat",
      "type": "adv"
    },
    "picnic areas": {
      "uz": "piknik maydonlari",
      "type": "colloc"
    },
    "community space": {
      "uz": "jamoat joyi",
      "type": "colloc"
    },
    "green spaces": {
      "uz": "yashil hududlar",
      "type": "colloc"
    },
    "increasingly": {
      "uz": "tobora",
      "type": "adv"
    },
    "healthy communities": {
      "uz": "sog'lom jamiyatlar",
      "type": "colloc"
    },
    "physical activity": {
      "uz": "jismoniy faollik",
      "type": "colloc"
    },
    "physical health": {
      "uz": "jismoniy salomatlik",
      "type": "colloc"
    },
    "sedentary lifestyles": {
      "uz": "harakatsiz turmush tarzi",
      "type": "colloc"
    },
    "Moreover": {
      "uz": "Qolaversa",
      "type": "adv"
    },
    "proven benefits": {
      "uz": "isbotlangan foydalari",
      "type": "colloc"
    },
    "mental health": {
      "uz": "ruhiy salomatlik",
      "type": "colloc"
    },
    "stress": {
      "uz": "stress",
      "type": "colloc"
    },
    "anxiety": {
      "uz": "xavotir",
      "type": "colloc"
    },
    "social bonds": {
      "uz": "ijtimoiy aloqalar",
      "type": "colloc"
    },
    "significantly": {
      "uz": "sezilarli darajada",
      "type": "adv"
    },
    "air quality": {
      "uz": "havo sifati",
      "type": "colloc"
    },
    "growing concern": {
      "uz": "ortib borayotgan tashvish",
      "type": "colloc"
    },
    "Ultimately": {
      "uz": "Oxir-oqibat",
      "type": "adv"
    },
    "community's well-being": {
      "uz": "jamiyat farovonligi",
      "type": "colloc"
    },
    "urban oases": {
      "uz": "shahar vohalari",
      "type": "colloc"
    }
  }
};