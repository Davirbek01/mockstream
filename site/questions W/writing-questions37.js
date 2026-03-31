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
    "p1_context": "You recently visited a local history museum.",
    "p1_scenario": "Dear Museum Visitors,\n\nThank you for visiting Heritage History Museum! We value your feedback to improve our exhibits and services.\nWhat did you think of the exhibitions and interactive displays? How was the staff assistance?\nWhat additions would enhance your future visits?\n\nMuseum Management",
    "t11": {
      "title": "Task 1.1",
      "target": "50 words",
      "prompt": "Write a letter to your friend, who hasn't visited yet. Write about your feelings and what you think they should do.",
      "sample": "Hey!\n\nYou <span class=\"ml-token modal\">have to</span> visit the Heritage Museum! The <span class=\"ml-token colloc\">ancient artifacts</span> are <span class=\"ml-token adv\">incredible</span>! I <span class=\"ml-token adv\">especially</span> loved the <span class=\"ml-token colloc\">interactive exhibits</span>. <span class=\"ml-token adv\">Honestly</span>, it's <span class=\"ml-token adv\">way</span> more interesting than I expected!\n\nLet's go together next time!",
      "sampleA1": "<p>Hi [Friend's Name],<br>Museum good. Old things! I like. You go. Bye.</p>",
      "sampleA2": "<p>Hi [Friend's Name],<br>I went to the museum. It was good. I saw old things. You should go too. It is fun and you will like it because it is interesting.</p>",
      "sampleB1": "<p>Hi [Friend's Name],<br>I visited the Heritage History Museum yesterday. I think it's worth a visit! The exhibitions were quite interesting, especially the interactive displays. You should definitely go. In my opinion, it's a good way to spend an afternoon. Let me know if you want to go together sometime!</p>",
      "sampleB2": "<p>Dear [Friend's Name],<br>You absolutely must visit the Heritage History Museum! I went last week and was pleasantly surprised. The exhibitions were engaging, and the interactive displays brought history to life. I think you'd find it particularly fascinating, given your interest in local history. I highly recommend carving out some time to explore it. Perhaps we could even go together next time and discuss our impressions afterwards. What do you say?</p>",
      "uzSample": "<p>Salom!</p>\n\n<p>Sen albatta Meros muzeyiga borishing kerak! U yerdagi qadimiy artefaktlar aql bovar qilmas darajada! Menga ayniqsa interaktiv ko'rgazmalar juda yoqdi. Rostini aytsam, u men kutganimdan ancha qiziqarliroq!</p>\n\n<p>Kelasi safar birga boramiz!</p>",
      "uzSampleA1": "<p>Salom, [Do'stingizning ismi],<br>Muzey yaxshi. Eski narsalar! Menga yoqadi. Sen bor. Xayr.</p>",
      "uzSampleA2": "<p>Salom, [Do'stingizning ismi],<br>Men muzeyga bordim. Yaxshi edi. Men eski narsalarni ko'rdim. Sen ham borishing kerak. Bu qiziqarli va senga yoqadi, chunki u juda ham qiziqarli.</p>",
      "uzSampleB1": "<p>Salom, [Do'stingizning ismi],<br>Men kecha Meros Tarixi Muzeyiga bordim. O'ylaymanki, bu tashrifga arziydi! Ko'rgazmalar juda qiziqarli edi, ayniqsa interaktiv displeylar. Albatta borishing kerak. Mening fikrimcha, bu tushdan keyin vaqt o'tkazishning yaxshi usuli. Agar birga borishni xohlasang, menga xabar ber!</p>",
      "uzSampleB2": "<p>Aziz [Do'stingizning ismi],<br>Siz albatta Meros Tarixi Muzeyiga tashrif buyurishingiz kerak! Men o'tgan hafta bordim va juda xursand bo'ldim. Ko'rgazmalar juda qiziqarli edi va interaktiv displeylar tarixni jonlantirdi. O'ylashimcha, siz mahalliy tarixga qiziqishingizni hisobga olsak, bu sizga ayniqsa yoqadi. Uni o'rganish uchun biroz vaqt ajratishingizni tavsiya qilaman. Ehtimol, keyingi safar birga borib, keyin taassurotlarimizni muhokama qilar edik. Nima deysiz?</p>"
    },
    "t12": {
      "title": "Task 1.2",
      "target": "120–150 words",
      "prompt": "Write a letter to the museum management. Write about your feelings and what you think they should do.",
      "sample": "<p>Dear Museum Management,</p>\n\n<p>I am writing to share my feedback following my recent visit to your <span class=\"ml-token colloc\">establishment</span>.</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, the <span class=\"ml-token colloc\">exhibitions</span> were <span class=\"ml-token adv\">exceptionally</span> well-curated. The <span class=\"ml-token colloc\">interactive displays</span> engaged visitors of all ages and made learning <span class=\"ml-token colloc\">enjoyable</span>.</p>\n\n<p><span class=\"ml-token adv\">However</span>, I noticed some areas for improvement. The <span class=\"ml-token colloc\">information plaques</span> in certain sections were <span class=\"ml-token adv\">quite</span> small and difficult to read. Larger text <span class=\"ml-token modal\">would</span> benefit visitors with <span class=\"ml-token colloc\">visual impairments</span>.</p>\n\n<p><span class=\"ml-token adv\">Additionally</span>, the <span class=\"ml-token colloc\">audio guides</span> <span class=\"ml-token modal\">should</span> be available in more languages to <span class=\"ml-token colloc\">accommodate</span> international visitors.</p>\n\n<p><span class=\"ml-token adv\">Furthermore</span>, adding a <span class=\"ml-token colloc\">dedicated children's area</span> with hands-on activities <span class=\"ml-token modal\">would</span> make the museum more <span class=\"ml-token colloc\">family-friendly</span>.</p>\n\n<p>Thank you for your <span class=\"ml-token colloc\">dedication to</span> preserving our history.</p>\n\n<p>Kind regards,<br>A History Enthusiast</p>",
      "sampleA1": "<p>Hi Museum,</p><p>I like museum. It is good. Old things are cool. Staff is nice. I want more things to see. Bye.</p>",
      "sampleA2": "<p>Dear Museum,</p><p>I went to your museum last week. It was good, and I liked the old stuff. But it was a bit boring. The staff were helpful, but I think you need more things for kids. Maybe some games? Thank you. </p><p>From, [Your Name]</p>",
      "sampleB1": "<p>Dear Museum Management,</p><p>I am writing to give you some feedback about my recent visit to the Heritage History Museum. Overall, I enjoyed the exhibitions, and I found the interactive displays interesting. However, I think there are a few things you could improve.</p><p>For example, some of the displays were a bit crowded, and it was difficult to see everything. Also, I think it would be good to have more information in English, as I noticed some foreign tourists struggling to understand the exhibits. I also think a cafe would be a good addition.</p><p>Thank you for your time.</p><p>Sincerely,<br>[Your Name]</p>",
      "sampleB2": "<p>Dear Museum Management,</p><p>I am writing to provide feedback following my visit to the Heritage History Museum last week. While I appreciated the scope of the exhibitions and the effort put into the interactive displays, I believe there are several areas that could be enhanced to improve the visitor experience.</p><p>Firstly, the flow of the exhibits could be improved. I found myself backtracking several times, and the layout felt somewhat disjointed. A clearer, more intuitive path through the museum would be beneficial. Secondly, while the staff were generally helpful, their knowledge of specific artifacts seemed limited. Perhaps further training could be provided.</p><p>Finally, the addition of a small gift shop with unique, history-related items would be a welcome addition. Thank you for considering my suggestions.</p><p>Yours sincerely,<br>[Your Name]</p>",
      "uzSample": "<p>Hurmatli Muzey Rahbariyati,</p>\n\n<p>Sizning muassasangizga yaqinda tashrif buyurganimdan so'ng o'z fikr-mulohazalarimni bildirmoqchiman.</p>\n\n<p>Avvalo, ko'rgazmalar juda yaxshi tashkil etilgan edi. Interaktiv displeylar barcha yoshdagi tashrif buyuruvchilarni jalb qildi va o'rganishni yoqimli qildi.</p>\n\n<p>Biroq, men takomillashtirish uchun ba'zi sohalarni payqadim. Ayrim bo'limlardagi axborot lavhalari juda kichik va o'qishga qiyin edi. Kattaroq matn ko'rish qobiliyati cheklangan tashrif buyuruvchilarga foyda keltirishi mumkin.</p>\n\n<p>Bundan tashqari, xalqaro tashrif buyuruvchilarni qamrab olish uchun audio gidlar ko'proq tillarda mavjud bo'lishi kerak.</p>\n\n<p>Shuningdek, qo'l bilan bajariladigan mashg'ulotlar bilan ajratilgan bolalar maydonchasini qo'shish muzeyni yanada oilaviy qulay qiladi.</p>\n\n<p>Tariximizni saqlashga bo'lgan sadoqatingiz uchun tashakkur.</p>\n\n<p>Hurmat bilan,<br>Tarix Ishqibozi</p>",
      "uzSampleA1": "<p>Salom, Muzey!</p><p>Menga muzey yoqadi. U yaxshi. Eski narsalar zo'r. Xodimlar yaxshi. Men ko'rish uchun ko'proq narsalar bo'lishini xohlayman. Xayr.</p>",
      "uzSampleA2": "<p>Hurmatli Muzey,</p><p>Men o'tgan hafta sizning muzeyingizga bordim. Yaxshi edi, va menga eski narsalar yoqdi. Lekin biroz zerikarli edi. Xodimlar yordam berishdi, lekin menimcha sizga bolalar uchun ko'proq narsalar kerak. Balki o'yinlar? Rahmat.</p><p>Kimdan, [Sizning Ismingiz]</p>",
      "uzSampleB1": "<p>Hurmatli Muzey Rahbariyati,</p><p>Men sizga yaqinda Meros Tarixi Muzeyiga tashrifim haqida fikr-mulohazalarimni bildirish uchun yozyapman. Umuman olganda, ko‘rgazmalar menga yoqdi va interaktiv displeylar qiziqarli bo‘ldi. Biroq, menimcha, siz yaxshilashingiz mumkin bo'lgan bir nechta narsa bor.</p><p>Masalan, ba'zi displeylar biroz gavjum edi va hamma narsani ko'rish qiyin edi. Shuningdek, menimcha, ingliz tilida ko'proq ma'lumotga ega bo'lish yaxshi bo'lardi, chunki men ba'zi xorijiy sayyohlar eksponatlarni tushunishga qiynalayotganini payqadim. Menimcha, kafe ham yaxshi qo'shimcha bo'lardi.</p><p>Vaqtingiz uchun rahmat.</p><p>Hurmat bilan,<br>[Sizning Ismingiz]</p>",
      "uzSampleB2": "<p>Hurmatli Muzey Ma'muriyati,</p><p>O'tgan hafta Meros Tarixi Muzeyiga tashrifimdan so'ng fikr-mulohazalarimni bildirish uchun yozyapman. Ko'rgazmalarning ko'lami va interaktiv displeylarga qilingan harakatni qadrlagan bo'lsam-da, tashrif buyuruvchilar tajribasini yaxshilash uchun bir nechta sohalarni takomillashtirish mumkin deb hisoblayman.</p><p>Birinchidan, ko'rgazmalarning oqimini yaxshilash mumkin. Men bir necha marta orqaga qaytishga majbur bo'ldim va tartib biroz uzuq-yuluq tuyuldi. Muzey bo'ylab aniqroq, yanada intuitiv yo'l foydali bo'ladi. Ikkinchidan, xodimlar odatda yordam berishgan bo'lsa-da, ularning muayyan artefaktlar haqidagi bilimlari cheklangan ko'rinardi. Ehtimol, qo'shimcha treninglar o'tkazilishi mumkin.</p><p>Va nihoyat, noyob, tarixga oid buyumlar bilan jihozlangan kichik sovg'alar do'konining qo'shilishi mamnuniyat bilan qabul qilinadi. Takliflarimni ko'rib chiqqaningiz uchun tashakkur.</p><p>Hurmat bilan,<br>[Sizning Ismingiz]</p>"
    },
    "t2": {
      "title": "Task 2",
      "target": "180–200 words",
      "prompt": "A student magazine announced an article writing contest. The best ones will be published in the magazine. Write your article on this topic: \"Is it better to save money or enjoy life while you're young?\" Write 180–200 words, giving reasons and examples.",
      "sample": "<p>This is a <span class=\"ml-token colloc\">fascinating debate</span>. I believe museums <span class=\"ml-token modal\">should</span> consider <span class=\"ml-token colloc\">free entry</span>, at least on certain days.</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, <span class=\"ml-token colloc\">financial barriers</span> prevent many families from visiting museums. Free admission <span class=\"ml-token modal\">would</span> <span class=\"ml-token colloc\">democratize access</span> to cultural education, benefiting communities that need it most.</p>\n\n<p><span class=\"ml-token adv\">Furthermore</span>, increased <span class=\"ml-token colloc\">visitor numbers</span> can <span class=\"ml-token adv\">actually</span> boost revenue through <span class=\"ml-token colloc\">gift shop sales</span>, café purchases, and donations. Many museums in London have proven this model works.</p>\n\n<p><span class=\"ml-token adv\">However</span>, some argue that <span class=\"ml-token colloc\">admission fees</span> are necessary for <span class=\"ml-token colloc\">maintaining quality</span> exhibits and paying staff. This is a valid concern.</p>\n\n<p>A <span class=\"ml-token colloc\">compromise</span> <span class=\"ml-token modal\">could</span> be offering free entry on specific days while charging for <span class=\"ml-token colloc\">special exhibitions</span>. This balances <span class=\"ml-token colloc\">accessibility</span> with <span class=\"ml-token colloc\">financial sustainability</span>.</p>\n\n<p><span class=\"ml-token adv\">Ultimately</span>, the <span class=\"ml-token colloc\">primary purpose</span> of museums is education. We <span class=\"ml-token modal\">should</span> strive to remove barriers that prevent people from learning about our shared heritage.</p>\n\n<p>What are your thoughts on this approach?</p>",
      "sampleA1": "<p>Hi!<br>I go to museum. It was good. I like old things. Staff ok. I want more old cars. Bye!</p>",
      "sampleA2": "<p>Hello,<br>I went to the museum. It was interesting and I saw many old things. The staff was nice and helped me. But I think the museum needs more things for kids. For example, maybe a game or a special room. I want to come again.</p>",
      "sampleB1": "<p>Dear Museum Visitors,<br><br>I visited the Heritage History Museum last week, and overall, I enjoyed my visit. The exhibitions were quite informative, and I learned a lot about local history. However, I think some of the interactive displays weren't working properly, which was a bit disappointing. The staff were helpful when I asked questions.<br><br>In my opinion, the museum could benefit from having more information in English, as some of the descriptions were only in the local language. Also, maybe a small cafe would be a good addition, so people can have a drink or a snack during their visit. Thank you for asking for feedback.</p><p>Sincerely,<br>A Visitor</p>",
      "sampleB2": "<p>Dear Museum Management,<br><br>I am writing to provide feedback on my recent visit to the Heritage History Museum. I found the exhibitions to be well-curated and engaging, offering a comprehensive overview of the region's past. The interactive displays were generally effective, although some required maintenance to ensure optimal functionality. The staff were courteous and readily available to answer inquiries, enhancing the overall visitor experience.<br><br>To further improve the museum, I suggest incorporating more multimedia elements, such as video presentations and audio guides, to cater to diverse learning styles. Furthermore, the inclusion of temporary exhibitions focusing on specific historical periods or themes could attract repeat visitors. Finally, improving the signage throughout the museum would aid navigation and ensure a more seamless experience. Thank you for considering my suggestions.</p><p>Yours sincerely,<br>A Museum Enthusiast</p>",
      "uzSample": "<p>Bu juda qiziqarli bahs. Menimcha, muzeylar hech bo'lmaganda ma'lum kunlarda bepul kirishni ko'rib chiqishlari kerak.</p>\n\n<p>Birinchidan, moliyaviy to'siqlar ko'plab oilalarning muzeylarga tashrif buyurishiga to'sqinlik qiladi. Bepul kirish madaniy ta'limga kirishni demokratlashtiradi va bu eng ko'p muhtoj bo'lgan jamiyatlarga foyda keltiradi.</p>\n\n<p>Bundan tashqari, tashrif buyuruvchilar sonining ortishi, aslida, sovg'alar do'konidagi savdolar, kafedagi xaridlar va xayriyalar orqali daromadni oshirishi mumkin. Londondagi ko'plab muzeylar bu modelning ishlayotganini isbotladi.</p>\n\n<p>Biroq, ba'zilar kirish to'lovlari sifatli eksponatlarni saqlash va xodimlarga maosh to'lash uchun zarur deb ta'kidlaydi. Bu o'rinli xavotir.</p>\n\n<p>Kelishuv maxsus ko'rgazmalar uchun to'lov olgan holda, muayyan kunlarda bepul kirishni taklif qilish bo'lishi mumkin. Bu qulaylikni moliyaviy barqarorlik bilan muvozanatlashtiradi.</p>\n\n<p>Oxir oqibat, muzeylarning asosiy maqsadi - ta'lim. Biz odamlarning umumiy merosimiz haqida bilishiga to'sqinlik qiladigan to'siqlarni olib tashlashga intilishimiz kerak.</p>\n\n<p>Sizning bu yondashuvga fikringiz qanday?</p>",
      "uzSampleA1": "<p>Salom!<br>Men muzeyga bordim. Yaxshi edi. Menga eski narsalar yoqadi. Xodimlar yaxshi. Men ko'proq eski mashinalarni xohlayman. Xayr!</p>",
      "uzSampleA2": "<p>Salom,<br>Men muzeyga bordim. U qiziqarli edi va men ko'p eski narsalarni ko'rdim. Xodimlar yaxshi edi va menga yordam berishdi. Lekin menimcha, muzeyga bolalar uchun ko'proq narsalar kerak. Masalan, balki o'yin yoki maxsus xona. Men yana kelmoqchiman.</p>",
      "uzSampleB1": "<p>Hurmatli muzey tashrif buyuruvchilari,<br><br>Men o'tgan hafta Meros Tarixi muzeyiga tashrif buyurdim va umuman olganda, tashrifimdan mamnun bo'ldim. Ko'rgazmalar juda ma'lumotli edi va men mahalliy tarix haqida ko'p narsalarni o'rgandim. Biroq, menimcha, interaktiv displeylarning ba'zilari yaxshi ishlamadi, bu biroz xafa qildi. Xodimlar savollarimga javob berishda yordam berishdi.<br><br>Mening fikrimcha, muzey ingliz tilida ko'proq ma'lumotga ega bo'lishdan foyda ko'rishi mumkin, chunki ba'zi tavsiflar faqat mahalliy tilda edi. Shuningdek, ehtimol, kichik kafe yaxshi qo'shimcha bo'lar edi, shunda odamlar tashrif davomida ichimlik yoki gazak ichishlari mumkin. Fikr-mulohazalaringizni so'raganingiz uchun rahmat.</p><p>Hurmat bilan,<br>Tashrif buyuruvchi</p>",
      "uzSampleB2": "<p>Hurmatli Muzey Ma'muriyati,<br><br>Men yaqinda Meros Tarixi Muzeyiga tashrif buyurganim haqida fikr-mulohazalarimni bildirish uchun yozyapman. Ko'rgazmalar yaxshi tashkil etilgan va qiziqarli bo'lib, mintaqaning o'tmishiga oid keng qamrovli ma'lumot beradi. Interaktiv displeylar odatda samarali edi, garchi ularning optimal ishlashini ta'minlash uchun ba'zi birlariga texnik xizmat ko'rsatish zarur edi. Xodimlar xushmuomala va savollarga javob berishga tayyor bo'lib, tashrif buyuruvchilarning umumiy tajribasini yaxshiladi.<br><br>Muzeyni yanada yaxshilash uchun men turli xil o'rganish uslublariga moslashish uchun video taqdimotlar va audio gidlar kabi ko'proq multimedia elementlarini kiritishni taklif qilaman. Bundan tashqari, muayyan tarixiy davrlar yoki mavzularga qaratilgan vaqtinchalik ko'rgazmalarni kiritish takroriy tashrif buyuruvchilarni jalb qilishi mumkin. Nihoyat, muzey bo'ylab navigatsiyani yaxshilash va yanada uzluksiz tajribani ta'minlash uchun ko'rsatkichlarni yaxshilash kerak. Takliflarimni ko'rib chiqqaningiz uchun tashakkur.</p><p>Hurmat bilan,<br>Muzey Ishqibozi</p>"
    }
  },
  "vocabulary": {
    "task11": [
      {
        "en": "have to visit",
        "uz": "borishing kerak"
      },
      {
        "en": "ancient artifacts",
        "uz": "qadimiy artefaktlar"
      },
      {
        "en": "incredible",
        "uz": "ajoyib"
      },
      {
        "en": "interactive exhibits",
        "uz": "interaktiv ko'rgazmalar"
      },
      {
        "en": "especially loved",
        "uz": "ayniqsa yoqtirdim"
      },
      {
        "en": "way more interesting",
        "uz": "ancha qiziqroq"
      },
      {
        "en": "than I expected",
        "uz": "kutganimdan"
      },
      {
        "en": "let's go together",
        "uz": "birga boramiz"
      },
      {
        "en": "next time",
        "uz": "keyingi safar"
      },
      {
        "en": "really cool",
        "uz": "juda ajoyib"
      },
      {
        "en": "you'll love it",
        "uz": "sizga yoqadi"
      },
      {
        "en": "worth seeing",
        "uz": "ko'rishga arziydi"
      },
      {
        "en": "fascinating",
        "uz": "qiziqarli"
      },
      {
        "en": "so informative",
        "uz": "juda ma'lumotli"
      },
      {
        "en": "highly recommend",
        "uz": "juda tavsiya qilaman"
      },
      {
        "en": "must-see",
        "uz": "ko'rish shart"
      },
      {
        "en": "blown away",
        "uz": "hayratda qoldim"
      },
      {
        "en": "didn't expect",
        "uz": "kutmagan edim"
      },
      {
        "en": "pretty amazing",
        "uz": "juda ajoyib"
      },
      {
        "en": "check it out",
        "uz": "ko'rib chiqing"
      }
    ],
    "task12": [
      {
        "en": "establishment",
        "uz": "muassasa"
      },
      {
        "en": "well-curated",
        "uz": "yaxshi tuzilgan"
      },
      {
        "en": "interactive displays",
        "uz": "interaktiv displeylar"
      },
      {
        "en": "information plaques",
        "uz": "ma'lumot plitalari"
      },
      {
        "en": "visual impairments",
        "uz": "ko'rish muammolari"
      },
      {
        "en": "audio guides",
        "uz": "audio qo'llanmalar"
      },
      {
        "en": "accommodate",
        "uz": "qabul qilmoq"
      },
      {
        "en": "dedicated children's area",
        "uz": "bolalar uchun maxsus hudud"
      },
      {
        "en": "family-friendly",
        "uz": "oilaga mos"
      },
      {
        "en": "dedication to",
        "uz": "bag'ishlanganlik"
      },
      {
        "en": "preserving history",
        "uz": "tarixni saqlash"
      },
      {
        "en": "history enthusiast",
        "uz": "tarix ishqibozi"
      },
      {
        "en": "engaged visitors",
        "uz": "tashrif buyuruvchilarni jalb qildi"
      },
      {
        "en": "learning enjoyable",
        "uz": "o'rganishni yoqimli"
      },
      {
        "en": "areas for improvement",
        "uz": "yaxshilash sohalari"
      },
      {
        "en": "quite small",
        "uz": "juda kichik"
      },
      {
        "en": "difficult to read",
        "uz": "o'qish qiyin"
      },
      {
        "en": "larger text",
        "uz": "kattaroq matn"
      },
      {
        "en": "hands-on activities",
        "uz": "amaliy mashg'ulotlar"
      },
      {
        "en": "kind regards",
        "uz": "hurmat bilan"
      }
    ],
    "task2": [
      {
        "en": "fascinating debate",
        "uz": "qiziqarli munozara"
      },
      {
        "en": "free entry",
        "uz": "bepul kirish"
      },
      {
        "en": "financial barriers",
        "uz": "moliyaviy to'siqlar"
      },
      {
        "en": "democratize access",
        "uz": "kirishni demokratlashtirish"
      },
      {
        "en": "cultural education",
        "uz": "madaniy ta'lim"
      },
      {
        "en": "visitor numbers",
        "uz": "tashrif buyuruvchilar soni"
      },
      {
        "en": "gift shop sales",
        "uz": "sovg'a do'koni savdosi"
      },
      {
        "en": "admission fees",
        "uz": "kirish to'lovlari"
      },
      {
        "en": "maintaining quality",
        "uz": "sifatni saqlash"
      },
      {
        "en": "compromise",
        "uz": "murosaga kelish"
      },
      {
        "en": "special exhibitions",
        "uz": "maxsus ko'rgazmalar"
      },
      {
        "en": "accessibility",
        "uz": "kirish imkoniyati"
      },
      {
        "en": "financial sustainability",
        "uz": "moliyaviy barqarorlik"
      },
      {
        "en": "primary purpose",
        "uz": "asosiy maqsad"
      },
      {
        "en": "shared heritage",
        "uz": "umumiy meros"
      },
      {
        "en": "remove barriers",
        "uz": "to'siqlarni olib tashlash"
      },
      {
        "en": "valid concern",
        "uz": "asosli tashvish"
      },
      {
        "en": "proven model",
        "uz": "isbotlangan model"
      },
      {
        "en": "boost revenue",
        "uz": "daromadni oshirish"
      },
      {
        "en": "what are your thoughts",
        "uz": "fikringiz qanday"
      }
    ]
  },
  "tokenTranslations": {
    "have to": {
      "uz": "majbur bo'lmoq",
      "type": "modal"
    },
    "ancient artifacts": {
      "uz": "qadimiy artefaktlar",
      "type": "colloc"
    },
    "incredible": {
      "uz": "ajoyib",
      "type": "adv"
    },
    "especially": {
      "uz": "ayniqsa",
      "type": "adv"
    },
    "interactive exhibits": {
      "uz": "interaktiv ko'rgazmalar",
      "type": "colloc"
    },
    "Honestly": {
      "uz": "Rostini aytsam",
      "type": "adv"
    },
    "way": {
      "uz": "juda",
      "type": "adv"
    },
    "establishment": {
      "uz": "muassasa",
      "type": "colloc"
    },
    "Firstly": {
      "uz": "Avvalo",
      "type": "adv"
    },
    "exhibitions": {
      "uz": "ko'rgazmalar",
      "type": "colloc"
    },
    "exceptionally": {
      "uz": "g'oyatda",
      "type": "adv"
    },
    "interactive displays": {
      "uz": "interaktiv displeylar",
      "type": "colloc"
    },
    "enjoyable": {
      "uz": "yoqimli",
      "type": "colloc"
    },
    "However": {
      "uz": "Biroq",
      "type": "adv"
    },
    "information plaques": {
      "uz": "axborot lavhalari",
      "type": "colloc"
    },
    "quite": {
      "uz": "ancha",
      "type": "adv"
    },
    "would": {
      "uz": "bo'lardi",
      "type": "modal"
    },
    "visual impairments": {
      "uz": "ko'rish qobiliyati cheklanganlar",
      "type": "colloc"
    },
    "Additionally": {
      "uz": "Bundan tashqari",
      "type": "adv"
    },
    "audio guides": {
      "uz": "audio gidlar",
      "type": "colloc"
    },
    "should": {
      "uz": "kerak",
      "type": "modal"
    },
    "accommodate": {
      "uz": "moslashtirmoq",
      "type": "colloc"
    },
    "Furthermore": {
      "uz": "Qolaversa",
      "type": "adv"
    },
    "dedicated children's area": {
      "uz": "bolalar uchun maxsus ajratilgan joy",
      "type": "colloc"
    },
    "family-friendly": {
      "uz": "oilaviy",
      "type": "colloc"
    },
    "dedication to": {
      "uz": "sadoqat",
      "type": "colloc"
    },
    "fascinating debate": {
      "uz": "qiziqarli bahs",
      "type": "colloc"
    },
    "free entry": {
      "uz": "bepul kirish",
      "type": "colloc"
    },
    "financial barriers": {
      "uz": "moliyaviy to'siqlar",
      "type": "colloc"
    },
    "democratize access": {
      "uz": "ommaga ochiq qilish",
      "type": "colloc"
    },
    "visitor numbers": {
      "uz": "tashrif buyuruvchilar soni",
      "type": "colloc"
    },
    "actually": {
      "uz": "aslida",
      "type": "adv"
    },
    "gift shop sales": {
      "uz": "sovg'alar do'konining savdosi",
      "type": "colloc"
    },
    "admission fees": {
      "uz": "kirish to'lovlari",
      "type": "colloc"
    },
    "maintaining quality": {
      "uz": "sifatni saqlash",
      "type": "colloc"
    },
    "compromise": {
      "uz": "kelishuv",
      "type": "colloc"
    },
    "could": {
      "uz": "mumkin edi",
      "type": "modal"
    },
    "special exhibitions": {
      "uz": "maxsus ko'rgazmalar",
      "type": "colloc"
    },
    "accessibility": {
      "uz": "qulaylik",
      "type": "colloc"
    },
    "financial sustainability": {
      "uz": "moliyaviy barqarorlik",
      "type": "colloc"
    },
    "Ultimately": {
      "uz": "Oxir-oqibat",
      "type": "adv"
    },
    "primary purpose": {
      "uz": "asosiy maqsad",
      "type": "colloc"
    }
  }
};