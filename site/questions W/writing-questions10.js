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
    "p1_context": "You are a resident of a local neighborhood.",
    "p1_scenario": "Dear Residents,\n\nThe local council is planning to improve safety in our neighborhood. We are considering installing better street lighting, adding CCTV cameras, creating pedestrian crossings, and organizing neighborhood watch programs. We would like your input on which measures would be most effective and any additional suggestions you may have.\n\nThe Neighborhood Council",
    "t11": {
      "title": "Task 1.1",
      "target": "50–70 words",
      "prompt": "Write a message to a neighbor about the proposed safety improvements. Share your thoughts and discuss which measures you think would be most helpful.",
      "sample": "Hey neighbor!\n\nDid you get that letter from the council about <span class=\"ml-token colloc\">safety improvements</span>? I'm <span class=\"ml-token adv\">really glad</span> they're finally doing something! I think <span class=\"ml-token colloc\">better street lighting</span> <span class=\"ml-token modal\">would</span> make a <span class=\"ml-token colloc\">huge difference</span>, especially on Oak Street – it's so dark there at night! The <span class=\"ml-token colloc\">neighborhood watch</span> idea <span class=\"ml-token modal\">could</span> be good too. What do you think about the CCTV cameras?\n\nLet's chat about it!\n",
      "sampleA1": "<p>Hi! <br>Light good. <br>Street dark. <br>I like light. <br>Bye</p>",
      "sampleA2": "<p>Hi! <br>I see the letter about safety. <br>I think lights are good because it is dark at night. <br>Cameras are also good, but I don't know. <br>What do you think?</p>",
      "sampleB1": "<p>Hi! <br><br>I saw the letter about the new safety measures. I think the street lighting is a good idea because some streets are very dark. Also, the neighborhood watch could be helpful. <br><br>However, I'm not sure about the CCTV cameras. It might be too much. What are your thoughts on it?</p>",
      "sampleB2": "<p>Hi! <br><br>Did you see the council's letter regarding the proposed safety enhancements? I'm particularly keen on the idea of improved street lighting; it would significantly improve visibility, especially on quieter streets. I also think a neighborhood watch program could foster a stronger sense of community and deter crime. <br><br>I'm a little more ambivalent about the CCTV cameras, though. While they might offer some benefits, I worry about potential privacy implications. What are your thoughts on the matter?</p>",
      "uzSample": "<p>Salom qo'shni!</p>\n<p>Sizga kengashdan xavfsizlikni yaxshilash bo'yicha xat keldimi? Ular nihoyat biror narsa qilayotganidan juda xursandman! O'ylashimcha, ko'chalarni yaxshiroq yoritish juda katta farq qiladi, ayniqsa Oak Streetda - u yerda kechasi juda qorong'i! Qo'shnilar nazorati g'oyasi ham yaxshi bo'lishi mumkin. CCTV kameralari haqida nima deb o'ylaysiz?</p>\n<p>Keling, bu haqda gaplashaylik!</p>",
      "uzSampleA1": "<p>Salom! <br>Yorug'lik yaxshi. <br>Ko'cha qorong'i. <br>Menga yorug'lik yoqadi. <br>Xayr</p>",
      "uzSampleA2": "<p>Salom! <br>Men xavfsizlik haqidagi xatni ko'rdim. <br>Menimcha, chiroqlar yaxshi, chunki kechasi qorong'i. <br>Kameralar ham yaxshi, lekin men bilmayman. <br>Siz nima deb o'ylaysiz?</p>",
      "uzSampleB1": "<p>Salom! <br><br>Yangi xavfsizlik choralari haqidagi xatni ko'rdim. Menimcha, ko'cha yoritgichlari yaxshi fikr, chunki ba'zi ko'chalar juda qorong'i. Shuningdek, mahalla posbonligi ham foydali bo'lishi mumkin. <br><br>Biroq, men CCTV kameralari haqida ishonchim komil emas. Bu juda ko'p bo'lishi mumkin. Sizning fikringiz qanday?</p>",
      "uzSampleB2": "<p>Salom! <br><br>Kengashning xavfsizlikni yaxshilash bo'yicha takliflari haqidagi xatini ko'rdingizmi? Men ayniqsa ko'cha yoritilishini yaxshilash g'oyasiga qiziqib qoldim; bu, ayniqsa, tinchroq ko'chalarda ko'rinishni sezilarli darajada yaxshilaydi. Shuningdek, menimcha, mahalla kuzatuv dasturi hamjamiyatning kuchliroq tuyg'usini rivojlantirishi va jinoyatchilikni to'xtatishi mumkin. <br><br>Ammo, CCTV kameralariga nisbatan biroz ikkilanyapman. Ular ba'zi afzalliklarni taqdim etishi mumkin bo'lsa-da, shaxsiy hayotga potentsial ta'sirlardan xavotirdaman. Bu borada sizning fikringiz qanday?</p>"
    },
    "t12": {
      "title": "Task 1.2",
      "target": "120–150 words",
      "prompt": "Write a formal letter to the Neighborhood Council responding to their message. Suggest specific safety measures and explain how they would benefit residents.",
      "sample": "<p>Dear Neighborhood Council,</p>\n\n<p>Thank you for consulting residents regarding the proposed <span class=\"ml-token colloc\">safety improvements</span>. I am pleased to offer my perspective on this <span class=\"ml-token colloc\">important matter</span>.</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, improved <span class=\"ml-token colloc\">street lighting</span> <span class=\"ml-token modal\">should</span> be prioritized, particularly along poorly lit pathways such as Oak Street and the park area. This <span class=\"ml-token modal\">would</span> not only deter potential <span class=\"ml-token colloc\">criminal activity</span> but also help residents feel safer when walking at night.</p>\n\n<p><span class=\"ml-token adv\">Additionally</span>, I <span class=\"ml-token modal\">would</span> strongly support the establishment of a <span class=\"ml-token colloc\">neighborhood watch program</span>. Such initiatives foster <span class=\"ml-token colloc\">community spirit</span> and create a network of vigilant neighbors.</p>\n\n<p>Regarding CCTV cameras, strategic placement at key locations <span class=\"ml-token modal\">could</span> be effective, though <span class=\"ml-token colloc\">privacy concerns</span> <span class=\"ml-token modal\">should</span> be addressed.</p>\n\n<p>I appreciate the council's commitment to our <span class=\"ml-token colloc\">community's well-being</span>.</p>\n\n<p>Yours faithfully,<br>James Thompson</p>",
      "sampleA1": "<p>Hi Neighborhood Council,<br>I live here.<br>Lights good. More lights. Safe.<br>Bye</p>",
      "sampleA2": "<p>Hello,<br>I live here. I think we need more lights. It is dark at night and I am scared. Also, cameras are good, but not in my garden, please. I like the idea of watching the street with my neighbors because it is fun and safe. Thank you.<br>Bye.</p>",
      "sampleB1": "<p>Dear Neighborhood Council,<br><br>I am writing to you about the safety improvements. I think better street lighting is a good idea because it's very dark at night, especially near the park. Also, I think a neighborhood watch program would be helpful. People can look out for each other. <br><br>CCTV cameras are okay, but I'm not sure where they should go. Maybe near the shops? Thank you for asking us what we think.<br><br>Sincerely,<br>A Resident</p>",
      "sampleB2": "<p>Dear Neighborhood Council,<br><br>I am writing in response to your proposal regarding safety improvements in our neighborhood. I believe a multi-faceted approach would be most effective in enhancing the security and well-being of residents.<br><br>Firstly, upgrading the street lighting is crucial, particularly in areas such as the alleyway behind the supermarket and the poorly lit sections of the park. Improved lighting would deter crime and increase residents' sense of safety when walking at night.<br><br>Secondly, I strongly support the implementation of a neighborhood watch program. This would foster a greater sense of community and encourage residents to be more vigilant. Furthermore, the installation of strategically placed CCTV cameras could provide an additional layer of security, although it is important to consider privacy concerns and ensure appropriate data protection measures are in place. Finally, pedestrian crossings near the school are vital.<br><br>Thank you for considering these suggestions. I believe these measures would significantly improve the safety and quality of life in our neighborhood.<br><br>Yours sincerely,<br>A Concerned Resident</p>",
      "uzSample": "<p>Hurmatli Mahalla Kengashi,</p>\n\n<p>Taklif etilayotgan xavfsizlikni yaxshilash bo'yicha aholi bilan maslahatlashganingiz uchun tashakkur. Ushbu muhim masala bo'yicha o'z fikrlarimni bildirishdan mamnunman.</p>\n\n<p>Birinchidan, ko'cha yoritilishini yaxshilashga, ayniqsa, Oak Street va park hududi kabi kam yoritilgan yo'laklar bo'ylab ustuvor ahamiyat berilishi kerak. Bu nafaqat potentsial jinoiy faoliyatni to'xtatib qoladi, balki aholining tunda yurishda o'zini xavfsizroq his qilishiga yordam beradi.</p>\n\n<p>Bundan tashqari, men mahalla kuzatuv dasturini tashkil etishni qat'iy qo'llab-quvvatlayman. Bunday tashabbuslar jamoatchilik ruhini mustahkamlaydi va hushyor qo'shnilar tarmog'ini yaratadi.</p>\n\n<p>CCTV kameralariga kelsak, asosiy joylarda strategik joylashtirish samarali bo'lishi mumkin, ammo shaxsiy hayotga daxlsizlik masalalari hal qilinishi kerak.</p>\n\n<p>Kengashning jamiyatimiz farovonligiga sodiqligini qadrlayman.</p>\n\n<p>Hurmat bilan,<br>James Thompson</p>",
      "uzSampleA1": "<p>Salom, Mahalla Kengashi,<br>Men bu yerda yashayman.<br>Chiroqlar yaxshi. Yana ko'proq chiroqlar. Xavfsiz.<br>Xayr</p>",
      "uzSampleA2": "<p>Salom,<br>Men shu yerda yashayman. O'ylashimcha, bizga ko'proq yorug'lik kerak. Kechasi qorong'i va men qo'rqaman. Shuningdek, kameralar yaxshi, lekin iltimos, mening bog'imda emas. Qo'shnilarim bilan ko'chani kuzatish g'oyasi menga yoqadi, chunki bu qiziqarli va xavfsiz. Rahmat.<br>Xayr.</p>",
      "uzSampleB1": "<p>Hurmatli Mahalla Kengashi,<br><br>Men sizga xavfsizlikni yaxshilash bo'yicha murojaat qilmoqdaman. Menimcha, ko'cha yoritgichlarini yaxshilash yaxshi fikr, chunki kechasi juda qorong'i, ayniqsa park yaqinida. Shuningdek, menimcha, mahalla kuzatuv dasturi foydali bo'ladi. Odamlar bir-biriga g'amxo'rlik qilishlari mumkin.<br><br>CCTV kameralari yaxshi, lekin ularni qayerga o'rnatish kerakligiga ishonchim komil emas. Balki do'konlar yaqinidami? Bizning fikrimizni so'raganingiz uchun rahmat.<br><br>Hurmat bilan,<br>Mahalla A'zosi</p>",
      "uzSampleB2": "<p>Hurmatli Mahalla Kengashi,<br><br>Men sizning mahallamizda xavfsizlikni yaxshilash bo'yicha taklifingizga javoban yozmoqdaman. Menimcha, aholining xavfsizligi va farovonligini oshirishda ko'p qirrali yondashuv eng samarali bo'ladi.<br><br>Birinchidan, ko'cha yoritgichlarini yangilash juda muhim, ayniqsa supermarket orqasidagi tor ko'cha va parkning yomon yoritilgan qismlari kabi joylarda. Yaxshilangan yoritish jinoyatchilikni to'xtatadi va aholining kechasi yurish paytida xavfsizlik hissini oshiradi.<br><br>Ikkinchidan, men mahalla kuzatuv dasturini amalga oshirishni qat'iy qo'llab-quvvatlayman. Bu jamiyat tuyg'usini kuchaytiradi va aholini yanada hushyor bo'lishga undaydi. Bundan tashqari, strategik joylashtirilgan CCTV kameralarini o'rnatish xavfsizlikning qo'shimcha qatlamini ta'minlashi mumkin, garchi shaxsiy hayotga daxlsizlik masalalarini ko'rib chiqish va tegishli ma'lumotlarni himoya qilish choralarini ko'rish muhimdir. Nihoyat, maktab yaqinidagi piyodalar o'tish joylari juda zarur.<br><br>Ushbu takliflarni ko'rib chiqayotganingiz uchun tashakkur. Menimcha, bu choralar mahallamizda xavfsizlik va hayot sifatini sezilarli darajada yaxshilaydi.<br><br>Hurmat bilan,<br>Xavotirda bo'lgan Aholi</p>"
    },
    "t2": {
      "title": "Task 2",
      "target": "180–200 words",
      "prompt": "You are writing an article for a local newspaper. The topic is: \"Is CCTV surveillance an effective way to reduce crime in neighborhoods?\" Write your article, giving reasons and examples.",
      "sample": "<h2>CCTV Surveillance: A Double-Edged Sword in the Fight Against Crime</h2>\n\n<p>The proliferation of <span class=\"ml-token colloc\">CCTV cameras</span> in residential areas has sparked <span class=\"ml-token colloc\">heated debate</span>. While proponents argue they are essential for <span class=\"ml-token colloc\">crime prevention</span>, critics raise concerns about <span class=\"ml-token colloc\">privacy invasion</span>. So, is CCTV truly effective?</p>\n\n<p><span class=\"ml-token adv\">Undoubtedly</span>, CCTV <span class=\"ml-token modal\">can</span> serve as a powerful deterrent. Potential criminals are less likely to act when they know they are being watched. <span class=\"ml-token adv\">Moreover</span>, footage <span class=\"ml-token modal\">can</span> provide <span class=\"ml-token colloc\">crucial evidence</span> in solving crimes. For instance, a recent burglary in our area was solved thanks to clear CCTV footage identifying the suspects.</p>\n\n<p>However, the effectiveness of CCTV is not guaranteed. Studies suggest that cameras are more successful in <span class=\"ml-token colloc\">car parks</span> than in <span class=\"ml-token colloc\">residential streets</span>. Without proper monitoring, cameras may simply record crimes rather than prevent them.</p>\n\n<p><span class=\"ml-token adv\">Furthermore</span>, there are legitimate <span class=\"ml-token colloc\">privacy concerns</span>. Residents may feel uncomfortable being constantly watched, and there is potential for misuse of footage.</p>\n\n<p><span class=\"ml-token adv\">Ultimately</span>, CCTV <span class=\"ml-token modal\">should</span> be viewed as one component of a <span class=\"ml-token colloc\">comprehensive safety strategy</span>. When combined with <span class=\"ml-token colloc\">community initiatives</span> and proper lighting, it <span class=\"ml-token modal\">can</span> contribute to safer neighborhoods.</p>",
      "sampleA1": "<p>Hi! <br> CCTV is good. <br> It helps. <br> I like it. <br> Bye</p>",
      "sampleA2": "<p>Hello. <br> I think CCTV is good for the neighborhood. <br> It can help stop bad people because they see the camera. <br> But maybe it is not good because it watches people all the time. <br> I don't know. <br> Thank you.</p>",
      "sampleB1": "<p>Is CCTV a good idea for our streets? I think it could help stop some crime. If people know there are cameras, they might not do bad things. For example, if someone is thinking about stealing a car, they might not if they see a CCTV camera. <br> However, some people don't like CCTV because they think it watches them too much. They feel like they don't have any privacy. Also, CCTV costs money, and maybe that money could be used for other things, like more police. <br> In my opinion, CCTV can be useful, but we need to think about the privacy of people too.</p>",
      "sampleB2": "<p>CCTV surveillance has become increasingly common in residential areas, but is it truly an effective crime deterrent? While proponents argue for its benefits in crime prevention and detection, others express concerns about privacy and its overall impact. <br> On the one hand, CCTV can undoubtedly act as a deterrent. The presence of cameras can discourage potential offenders from committing crimes. For instance, shoplifting has been shown to decrease in areas with visible CCTV. Moreover, recorded footage can be invaluable for identifying and prosecuting criminals after a crime has been committed. <br> However, the effectiveness of CCTV is not always clear-cut. Some studies suggest that cameras simply displace crime to other areas. Additionally, the feeling of being constantly watched can create a sense of unease and erode trust within the community. Furthermore, the cost of installing and maintaining CCTV systems can be substantial, raising questions about whether the resources could be better allocated to other crime prevention strategies. <br> In conclusion, CCTV can be a useful tool, but it is not a panacea. Its effectiveness depends on factors such as camera placement, monitoring, and integration with other crime prevention measures. A balanced approach is needed, carefully considering both the potential benefits and the potential drawbacks.</p>",
      "uzSample": "<h2>CCTV kuzatuvi: Jinoyatchilikka qarshi kurashda ikki tomonlama tig'</h2>\n\n<p>Turar-joy hududlarida CCTV kameralarining ko'payishi qizg'in bahslarga sabab bo'ldi. Tarafdorlar ularni jinoyatchilikning oldini olish uchun zarur deb hisoblasa, tanqidchilar shaxsiy hayotga aralashish xavotirlarini ko'tarmoqda. Xo'sh, CCTV haqiqatan ham samaralimi?</p>\n\n<p>Shubhasiz, CCTV kuchli to'xtatuvchi vosita bo'lib xizmat qilishi mumkin. Potentsial jinoyatchilar kuzatilayotganini bilganlarida harakat qilish ehtimoli kamroq. Bundan tashqari, videoyozuvlar jinoyatlarni hal qilishda muhim dalil bo'lishi mumkin. Misol uchun, yaqinda bizning hududimizda sodir bo'lgan o'g'irlik gumonlanuvchilarni aniqlagan aniq CCTV videoyozuvi tufayli hal qilindi.</p>\n\n<p>Biroq, CCTVning samaradorligi kafolatlanmagan. Tadqiqotlar shuni ko'rsatadiki, kameralar turar-joy ko'chalariga qaraganda avtoturargohlarda ko'proq muvaffaqiyatli bo'ladi. Tegishli monitoring bo'lmasa, kameralar jinoyatlarning oldini olishdan ko'ra, shunchaki ularni yozib olishi mumkin.</p>\n\n<p>Bundan tashqari, qonuniy shaxsiy hayotga daxldorlik xavotirlari mavjud. Aholi doimiy ravishda kuzatilayotganini his qilib noqulaylik sezishi mumkin va videoyozuvlardan noto'g'ri foydalanish ehtimoli mavjud.</p>\n\n<p>Oxir oqibat, CCTV keng qamrovli xavfsizlik strategiyasining bir qismi sifatida ko'rib chiqilishi kerak. Jamoatchilik tashabbuslari va to'g'ri yoritish bilan birgalikda u xavfsizroq mahallalarga hissa qo'shishi mumkin.</p>",
      "uzSampleA1": "<p>Salom! <br> CCTV yaxshi narsa. <br> U yordam beradi. <br> Menga yoqadi. <br> Xayr</p>",
      "uzSampleA2": "<p>Salom. <br> Menimcha, CCTV mahallalar uchun yaxshi. <br> U yomon odamlarni to'xtatishga yordam berishi mumkin, chunki ular kamerani ko'rishadi. <br> Lekin, ehtimol, bu yaxshi emas, chunki u odamlarni doimiy ravishda kuzatib turadi. <br> Bilmayman. <br> Rahmat.</p>",
      "uzSampleB1": "<p>Ko'chalarimiz uchun videokuzatuv yaxshi fikrmi? Menimcha, bu ba'zi jinoyatlarni to'xtatishga yordam berishi mumkin. Agar odamlar kameralar borligini bilishsa, ular yomon ishlar qilmasligi mumkin. Misol uchun, agar kimdir mashina o'g'irlash haqida o'ylayotgan bo'lsa, videokuzatuv kamerasini ko'rsa, o'g'irlamasligi mumkin. <br> Biroq, ba'zi odamlarga videokuzatuv yoqmaydi, chunki ular bu ularni juda ko'p kuzatadi deb o'ylashadi. Ular hech qanday shaxsiy hayotga ega emasdek his qilishadi. Bundan tashqari, videokuzatuv pul turadi va ehtimol bu pulni boshqa narsalarga, masalan, ko'proq politsiyaga ishlatish mumkin. <br> Mening fikrimcha, videokuzatuv foydali bo'lishi mumkin, lekin biz odamlarning shaxsiy hayoti haqida ham o'ylashimiz kerak.</p>",
      "uzSampleB2": "<p>Yashash joylarida videokuzatuv tizimlari tobora keng tarqalib bormoqda, lekin ular haqiqatan ham jinoyatchilikni kamaytirishning samarali usulimi? Tarafdorlar jinoyatchilikning oldini olish va uni aniqlashdagi foydalari haqida bahslashsa, boshqalar shaxsiy hayot daxlsizligi va uning umumiy ta'siri haqida xavotir bildirishadi. <br> Bir tomondan, videokuzatuv, shubhasiz, to'xtatuvchi omil bo'lishi mumkin. Kameralarning mavjudligi potentsial jinoyatchilarni jinoyat sodir etishdan qaytarishi mumkin. Misol uchun, ko'rinadigan videokuzatuv kameralari o'rnatilgan hududlarda do'kon o'g'irligi kamaygani kuzatilgan. Bundan tashqari, yozib olingan videolar jinoyat sodir etilgandan keyin jinoyatchilarni aniqlash va ularni jinoiy javobgarlikka tortish uchun bebaho bo'lishi mumkin. <br> Biroq, videokuzatuvning samaradorligi har doim ham aniq emas. Ba'zi tadqiqotlar shuni ko'rsatadiki, kameralar shunchaki jinoyatni boshqa hududlarga ko'chiradi. Bundan tashqari, doimiy kuzatuv ostida bo'lish hissi jamiyat ichida noqulaylik hissini yaratishi va ishonchni yo'qotishi mumkin. Bundan tashqari, videokuzatuv tizimlarini o'rnatish va ularga xizmat ko'rsatish xarajatlari sezilarli bo'lishi mumkin, bu esa resurslarni jinoyatchilikning oldini olishning boshqa strategiyalariga yo'naltirish yaxshiroqmi degan savolni tug'diradi. <br> Xulosa qilib aytganda, videokuzatuv foydali vosita bo'lishi mumkin, ammo u barcha dardga davo emas. Uning samaradorligi kamera joylashuvi, monitoring va jinoyatchilikning oldini olish bo'yicha boshqa chora-tadbirlar bilan integratsiyalashuv kabi omillarga bog'liq. Muvozanatli yondashuv zarur, bunda potentsial foyda va potentsial kamchiliklarni diqqat bilan ko'rib chiqish kerak.</p>"
    }
  },
  "vocabulary": {
    "task11": [
      {
        "en": "hey neighbor",
        "uz": "salom qo'shni"
      },
      {
        "en": "did you get",
        "uz": "oldingizmi"
      },
      {
        "en": "really glad",
        "uz": "juda xursand"
      },
      {
        "en": "finally doing something",
        "uz": "nihoyat biror narsa qilyapti"
      },
      {
        "en": "huge difference",
        "uz": "katta farq"
      },
      {
        "en": "so dark",
        "uz": "juda qorong'u"
      },
      {
        "en": "at night",
        "uz": "kechqurun"
      },
      {
        "en": "could be good",
        "uz": "yaxshi bo'lishi mumkin"
      },
      {
        "en": "what do you think",
        "uz": "nima deb o'ylaysiz"
      },
      {
        "en": "let's chat",
        "uz": "gaplashaylik"
      },
      {
        "en": "street lighting",
        "uz": "ko'cha yoritgichlari"
      },
      {
        "en": "safety stuff",
        "uz": "xavfsizlik narsalari"
      },
      {
        "en": "watch program",
        "uz": "kuzatuv dasturi"
      },
      {
        "en": "sounds helpful",
        "uz": "foydali eshitiladi"
      },
      {
        "en": "not sure about",
        "uz": "ishonchim komil emas"
      },
      {
        "en": "pretty scary",
        "uz": "ancha qo'rqinchli"
      },
      {
        "en": "walking around",
        "uz": "atrofda yurish"
      },
      {
        "en": "feel safer",
        "uz": "xavfsizroq his qilish"
      },
      {
        "en": "great idea",
        "uz": "ajoyib fikr"
      },
      {
        "en": "catch up soon",
        "uz": "tez orada gaplashamiz"
      }
    ],
    "task12": [
      {
        "en": "Dear Council",
        "uz": "Hurmatli Kengash"
      },
      {
        "en": "consulting residents",
        "uz": "aholi bilan maslahatlashish"
      },
      {
        "en": "important matter",
        "uz": "muhim masala"
      },
      {
        "en": "improved lighting",
        "uz": "yaxshilangan yoritish"
      },
      {
        "en": "should be prioritized",
        "uz": "ustunlik berilishi kerak"
      },
      {
        "en": "deter criminal activity",
        "uz": "jinoyatchilikni oldini olmoq"
      },
      {
        "en": "feel safer",
        "uz": "xavfsizroq his qilmoq"
      },
      {
        "en": "neighborhood watch",
        "uz": "mahalla nazorati"
      },
      {
        "en": "community spirit",
        "uz": "jamoa ruhi"
      },
      {
        "en": "vigilant neighbors",
        "uz": "hushyor qo'shnilar"
      },
      {
        "en": "strategic placement",
        "uz": "strategik joylashtirish"
      },
      {
        "en": "privacy concerns",
        "uz": "maxfiylik xavotirlari"
      },
      {
        "en": "community's well-being",
        "uz": "jamoa farovonligi"
      },
      {
        "en": "yours faithfully",
        "uz": "hurmat bilan"
      },
      {
        "en": "strongly support",
        "uz": "qattiq qo'llab-quvvatlamoq"
      },
      {
        "en": "key locations",
        "uz": "asosiy joylar"
      },
      {
        "en": "address concerns",
        "uz": "xavotirlarni hal qilmoq"
      },
      {
        "en": "foster initiatives",
        "uz": "tashabbuslarni rag'batlantirmoq"
      },
      {
        "en": "prioritize safety",
        "uz": "xavfsizlikka ustunlik bermoq"
      },
      {
        "en": "appreciate commitment",
        "uz": "fidoyilikni qadrlamoq"
      }
    ],
    "task2": [
      {
        "en": "CCTV cameras",
        "uz": "CCTV kameralar"
      },
      {
        "en": "heated debate",
        "uz": "qizg'in munozara"
      },
      {
        "en": "crime prevention",
        "uz": "jinoyatchilik oldini olish"
      },
      {
        "en": "privacy invasion",
        "uz": "maxfiylikka tajovuz"
      },
      {
        "en": "powerful deterrent",
        "uz": "kuchli to'siq"
      },
      {
        "en": "crucial evidence",
        "uz": "muhim dalil"
      },
      {
        "en": "solving crimes",
        "uz": "jinoyatlarni ochish"
      },
      {
        "en": "residential streets",
        "uz": "turar joy ko'chalari"
      },
      {
        "en": "proper monitoring",
        "uz": "to'g'ri kuzatish"
      },
      {
        "en": "legitimate concerns",
        "uz": "asosli xavotirlar"
      },
      {
        "en": "misuse of footage",
        "uz": "video yozuvlarni suiiste'mol qilish"
      },
      {
        "en": "comprehensive strategy",
        "uz": "keng qamrovli strategiya"
      },
      {
        "en": "community initiatives",
        "uz": "jamoa tashabbusları"
      },
      {
        "en": "safer neighborhoods",
        "uz": "xavfsizroq mahallalar"
      },
      {
        "en": "crime reduction",
        "uz": "jinoyatchilikni kamaytirish"
      },
      {
        "en": "constant surveillance",
        "uz": "doimiy kuzatuv"
      },
      {
        "en": "public safety",
        "uz": "jamoat xavfsizligi"
      },
      {
        "en": "identify suspects",
        "uz": "gumonlanuvchilarni aniqlash"
      },
      {
        "en": "effective measure",
        "uz": "samarali chora"
      },
      {
        "en": "double-edged sword",
        "uz": "ikki tomonlama qilich"
      }
    ]
  },
  "tokenTranslations": {
    "safety improvements": {
      "uz": "xavfsizlikni yaxshilash",
      "type": "colloc"
    },
    "really glad": {
      "uz": "juda xursand",
      "type": "adv"
    },
    "better street lighting": {
      "uz": "ko'cha yoritilishini yaxshilash",
      "type": "colloc"
    },
    "would": {
      "uz": "bo'lardi",
      "type": "modal"
    },
    "huge difference": {
      "uz": "katta farq",
      "type": "colloc"
    },
    "neighborhood watch": {
      "uz": "mahalliy kuzatuv",
      "type": "colloc"
    },
    "could": {
      "uz": "mumkin",
      "type": "modal"
    },
    "important matter": {
      "uz": "muhim masala",
      "type": "colloc"
    },
    "Firstly": {
      "uz": "Birinchidan",
      "type": "adv"
    },
    "street lighting": {
      "uz": "ko'cha yoritilishi",
      "type": "colloc"
    },
    "should": {
      "uz": "kerak",
      "type": "modal"
    },
    "criminal activity": {
      "uz": "jinoiy faoliyat",
      "type": "colloc"
    },
    "Additionally": {
      "uz": "Bundan tashqari",
      "type": "adv"
    },
    "neighborhood watch program": {
      "uz": "mahalliy kuzatuv dasturi",
      "type": "colloc"
    },
    "community spirit": {
      "uz": "jamoatchilik ruhi",
      "type": "colloc"
    },
    "privacy concerns": {
      "uz": "shaxsiy hayot daxlsizligi bilan bog'liq xavotirlar",
      "type": "colloc"
    },
    "community's well-being": {
      "uz": "jamiyat farovonligi",
      "type": "colloc"
    },
    "CCTV cameras": {
      "uz": "videokuzatuv kameralari",
      "type": "colloc"
    },
    "heated debate": {
      "uz": "qizg'in bahs",
      "type": "colloc"
    },
    "crime prevention": {
      "uz": "jinoyatchilikning oldini olish",
      "type": "colloc"
    },
    "privacy invasion": {
      "uz": "shaxsiy hayotga aralashuv",
      "type": "colloc"
    },
    "Undoubtedly": {
      "uz": "Shubhasiz",
      "type": "adv"
    },
    "can": {
      "uz": "mumkin",
      "type": "modal"
    },
    "Moreover": {
      "uz": "Qolaversa",
      "type": "adv"
    },
    "crucial evidence": {
      "uz": "muhim dalil",
      "type": "colloc"
    },
    "car parks": {
      "uz": "avtoturargohlar",
      "type": "colloc"
    },
    "residential streets": {
      "uz": "turar joy ko'chalari",
      "type": "colloc"
    },
    "Furthermore": {
      "uz": "Bundan tashqari",
      "type": "adv"
    },
    "Ultimately": {
      "uz": "Oxir-oqibat",
      "type": "adv"
    },
    "comprehensive safety strategy": {
      "uz": "xavfsizlikni ta'minlash bo'yicha kompleks strategiya",
      "type": "colloc"
    },
    "community initiatives": {
      "uz": "mahalliy tashabbuslar",
      "type": "colloc"
    }
  }
};