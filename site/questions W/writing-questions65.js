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
    "p1_context": "You recently booked a holiday through an online travel agency.",
    "p1_scenario": "Dear Traveler,\n\nThank you for booking your holiday with Wanderlust Travel! We hope you had an amazing trip.\nHow was your overall travel experience? Were the hotels and tours as described on our website?\nWhat destinations or travel packages would you like us to offer in the future?\n\nWanderlust Customer Service",
    "t11": {
      "title": "Task 1.1",
      "target": "50–70 words",
      "prompt": "Write a letter to your friend, who is planning a vacation. Write about your feelings and what you think they should do.",
      "sample": "Hey!\n\nI heard you're planning a vacation – perfect timing! I <span class=\"ml-token adv\">just</span> got back from Turkey and booked everything through Wanderlust Travel. They found us <span class=\"ml-token adv\">incredible</span> deals and the trip was <span class=\"ml-token colloc\">hassle-free</span>. You <span class=\"ml-token modal\">should</span> <span class=\"ml-token adv\">definitely</span> <span class=\"ml-token phrasal\">check them out</span> – they'll <span class=\"ml-token phrasal\">take care of</span> everything for you!\n\n<span class=\"ml-token colloc\">Safe travels</span>!",
      "sampleA1": "<p>Hi [Friend's Name],</p><br><p>I go holiday. It is good. Hotel good. You go too! Bye!</p>",
      "sampleA2": "<p>Hi [Friend's Name],</p><br><p>I went on holiday. It was good. I used Wanderlust. The hotel was nice and the tours were fun. You should go there too because it is easy and good. Have a nice holiday!</p>",
      "sampleB1": "<p>Hi [Friend's Name],</p><br><p>I just came back from my holiday! I booked it with Wanderlust Travel, and I think it was a good choice. The hotels were like they said, and the tours were interesting. I think you should check them out for your vacation. It could save you some time. Have fun!</p><br><p>Best,</p><p>[Your Name]</p>",
      "sampleB2": "<p>Dear [Friend's Name],</p><br><p>Guess what? I just returned from my holiday, and I wanted to share my experience since you're planning your own. I booked everything through Wanderlust Travel, and honestly, it was quite convenient. The hotels were accurately described, and the tours were well-organized. I'd recommend considering them for your trip; it simplified the entire process. I believe you'd appreciate the ease of planning. Let me know if you want more details.</p><br><p>Best regards,</p><p>[Your Name]</p>",
      "uzSample": "<p>Salom!</p>\n<p>Eshitishimcha, ta'tilni rejalashtiryapsan – ayni muddao! Men yaqinda Turkiyadan qaytdim va hamma narsani Wanderlust Travel orqali bron qildim. Ular bizga ajoyib narxlarni topib berishdi va sayohat hech qanday tashvishsiz o'tdi. Albatta, ularga murojaat qilib ko'rishing kerak – ular sening uchun hamma narsani hal qilishadi!</p>\n<p>Oq yo'l!</p>",
      "uzSampleA1": "<p>Salom, [Do'stingizning ismi],</p><br><p>Men ta'tilga boryapman. Bu yaxshi. Mehmonxona yaxshi. Sen ham bor! Xayr!</p>",
      "uzSampleA2": "<p>Salom, [Do'stingizning ismi],</p><br><p>Men ta'tilga bordim. Yaxshi bo'ldi. Men Wanderlustdan foydalandim. Mehmonxona yaxshi edi va ekskursiyalar qiziqarli edi. Siz ham u yerga borishingiz kerak, chunki u oson va yaxshi. Yaxshi ta'til tilayman!</p>",
      "uzSampleB1": "<p>Salom, [Do'stingizning ismi],</p><br><p>Men yaqinda ta'tildan qaytdim! Men uni Wanderlust Travel bilan bron qilgan edim va menimcha, bu yaxshi tanlov bo'ldi. Mehmonxonalar ular aytganidek edi va ekskursiyalar qiziqarli edi. O'ylaymanki, siz ta'tilingiz uchun ularni tekshirib ko'rishingiz kerak. Bu sizning vaqtingizni tejashga yordam berishi mumkin. Yaxshi dam oling!</p><br><p>Eng yaxshi tilaklar bilan,</p><p>[Sizning ismingiz]</p>",
      "uzSampleB2": "<p>Salom [Do'stingizning ismi],</p><br><p>Nima deb o'ylaysan? Men yaqinda ta'tildan qaytdim va sening ta'tilni rejalashtirayotganingni bilganim uchun, o'z tajribam bilan bo'lishmoqchiman. Men hamma narsani \"Wanderlust Travel\" orqali bron qildim va rostini aytsam, juda qulay bo'ldi. Mehmonxonalar aniq tasvirlangan edi va ekskursiyalar yaxshi tashkil etilgan edi. Sayohating uchun ularni ko'rib chiqishni tavsiya qilaman; bu butun jarayonni soddalashtirdi. O'ylaymanki, rejalashtirishning osonligini qadrlaysan. Agar batafsil ma'lumot kerak bo'lsa, menga xabar ber.</p><br><p>Eng yaxshi tilaklar bilan,</p><p>[Sizning ismingiz]</p>"
    },
    "t12": {
      "title": "Task 1.2",
      "target": "120–150 words",
      "prompt": "Write a letter to the travel agency. Write about your feelings and what you think they should do.",
      "sample": "Dear Wanderlust Customer Service,\n\nThank you for inquiring about my recent <span class=\"ml-token colloc\">travel experience</span>.\n\nI am <span class=\"ml-token adv\">very</span> pleased with my holiday to Turkey. The <span class=\"ml-token colloc\">hotel accommodation</span> was exactly as described, and the <span class=\"ml-token colloc\">guided tours</span> were <span class=\"ml-token adv\">exceptionally</span> well organized. Your team provided <span class=\"ml-token adv\">excellent</span> <span class=\"ml-token colloc\">customer support</span> when I needed to make last-minute changes.\n\n<span class=\"ml-token adv\">However</span>, there were some minor issues. The <span class=\"ml-token colloc\">airport transfer</span> was delayed, causing unnecessary stress. I <span class=\"ml-token modal\">would</span> suggest working with more reliable transport companies. <span class=\"ml-token adv\">Additionally</span>, the website <span class=\"ml-token modal\">could</span> include more <span class=\"ml-token colloc\">detailed reviews</span> from previous travelers.\n\nFor future offerings, I <span class=\"ml-token modal\">would</span> love to see more <span class=\"ml-token colloc\">adventure travel packages</span> including hiking and cultural immersion experiences. <span class=\"ml-token colloc\">Eco-tourism options</span> <span class=\"ml-token modal\">would</span> also appeal to <span class=\"ml-token colloc\">environmentally conscious</span> travelers like myself.\n\n<span class=\"ml-token adv\">Overall</span>, I had a wonderful trip and <span class=\"ml-token modal\">will</span> use Wanderlust again.\n\nYours sincerely,\n[Your name]",
      "sampleA1": "<p>Hi Wanderlust!</p><br><p>My trip good. Hotel good. Tours good. I like Turkey. Bye!</p>",
      "sampleA2": "<p>Hello Wanderlust,</p><br><p>Thank you for email. My holiday was good. The hotel was nice and the tours were fun, but the bus was late. It was not good. I want to go to Spain next time. Maybe you can help me? Thank you.</p><br><p>Bye,</p><br><p>[Your Name]</p>",
      "sampleB1": "<p>Dear Wanderlust Customer Service,</p><br><p>Thank you for your email. I wanted to tell you about my holiday. It was mostly good. The hotel was very nice and clean, just like on your website. The tours were also good, especially the city tour. However, I think the airport transfer was a problem. It was late, and I had to wait a long time. That was not very good.</p><br><p>In the future, I think you should offer more trips to Italy. Also, maybe you could have better airport transfers. Overall, I enjoyed my holiday.</p><br><p>Sincerely,</p><br><p>[Your Name]</p>",
      "sampleB2": "<p>Dear Wanderlust Customer Service,</p><br><p>Thank you for your email regarding my recent holiday booking. Overall, I had a positive experience, but there are a few points I'd like to address.</p><br><p>The hotels met the standards advertised on your website and the tours were generally well-organized and informative. I particularly appreciated the local guides' knowledge and enthusiasm. However, I encountered some issues with the communication regarding changes to the itinerary. I received conflicting information from different sources, which caused some confusion.</p><br><p>Looking ahead, I believe Wanderlust could benefit from offering more specialized tours catering to niche interests, such as photography or culinary experiences. Furthermore, clearer and more consistent communication channels would significantly improve the customer experience. I hope this feedback is helpful.</p><br><p>Yours sincerely,</p><br><p>[Your Name]</p>",
      "uzSample": "<p>Hurmatli \"Wanderlust\" mijozlarga xizmat ko'rsatish bo'limi,</p>\n<p>Yaqinda bo'lib o'tgan sayohat tajribam haqida so'raganingiz uchun tashakkur.</p>\n<p>Turkiyaga qilgan ta'tilimdan juda mamnunman. Mehmonxona joylashuvi aynan ta'riflanganidek edi va ekskursiyalar juda yaxshi tashkil etilgan edi. Sizning jamoangiz so'nggi daqiqalarda o'zgartirishlar kiritishim kerak bo'lganda, a'lo darajadagi mijozlarni qo'llab-quvvatlashni ta'minladi.</p>\n<p>Biroq, ba'zi kichik muammolar ham bo'ldi. Aeroport transferi kechiktirildi, bu esa keraksiz stressga olib keldi. Men yanada ishonchli transport kompaniyalari bilan ishlashni taklif qilaman. Bundan tashqari, veb-saytda avvalgi sayohatchilarning batafsilroq sharhlari bo'lishi mumkin edi.</p>\n<p>Kelajakdagi takliflar uchun, men piyoda sayr qilish va madaniy immersion tajribalarini o'z ichiga olgan ko'proq sarguzasht sayohat paketlarini ko'rishni xohlardim. Ekologik turizm variantlari men kabi atrof-muhitga e'tiborli sayohatchilarga ham yoqadi.</p>\n<p>Umuman olganda, ajoyib sayohat qildim va \"Wanderlust\"dan yana foydalanaman.</p>\n<p>Hurmat bilan,<br>[Sizning ismingiz]</p>",
      "uzSampleA1": "<p>Salom, Wanderlust!</p><br><p>Sayohatim yaxshi. Mehmonxona yaxshi. Ekskursiyalar yaxshi. Menga Turkiya yoqdi. Xayr!</p>",
      "uzSampleA2": "<p>Salom Wanderlust,</p><br><p>Xatingiz uchun rahmat. Ta'tilim yaxshi o'tdi. Mehmonxona yaxshi edi va ekskursiyalar qiziqarli bo'ldi, lekin avtobus kech keldi. Bu yaxshi emas edi. Keyingi safar Ispaniyaga bormoqchiman. Balki menga yordam bera olarsiz? Rahmat.</p><br><p>Xayr,</p><br><p>[Sizning ismingiz]</p>",
      "uzSampleB1": "<p>Hurmatli Wanderlust mijozlarga xizmat ko'rsatish bo'limi,</p><br><p>Xatingiz uchun rahmat. Men sizga o'z ta'tilim haqida aytib bermoqchiman. U asosan yaxshi o'tdi. Mehmonxona juda yaxshi va toza edi, xuddi veb-saytingizda ko'rsatilganidek. Ekskursiyalar ham yaxshi edi, ayniqsa shahar bo'ylab ekskursiya. Biroq, menimcha, aeroport transferi muammo bo'ldi. U kech qoldi va men uzoq kutishimga to'g'ri keldi. Bu juda yaxshi emas edi.</p><br><p>Kelajakda, menimcha, siz Italiyaga ko'proq sayohatlar taklif qilishingiz kerak. Shuningdek, ehtimol, sizda aeroport transferlari yaxshiroq bo'lishi mumkin. Umuman olganda, men ta'tilimdan zavq oldim.</p><br><p>Hurmat bilan,</p><br><p>[Sizning ismingiz]</p>",
      "uzSampleB2": "<p>Hurmatli Wanderlust mijozlarga xizmat ko'rsatish bo'limi,</p><br><p>Yaqinda bron qilgan ta'tilim bo'yicha elektron pochta xabaringiz uchun rahmat. Umuman olganda, ijobiy tajribaga ega bo'ldim, lekin men hal qilishni istagan bir nechta nuqtalar bor.</p><br><p>Mehmonxonalar veb-saytingizda e'lon qilingan standartlarga javob berdi va ekskursiyalar odatda yaxshi tashkil etilgan va ma'lumot beruvchi edi. Ayniqsa, mahalliy gidlarning bilimdonligi va ishtiyoqini qadrladim. Biroq, marshrutga kiritilgan o'zgarishlar haqida aloqa qilishda ba'zi muammolarga duch keldim. Turli manbalardan bir-biriga zid ma'lumotlar oldim, bu esa biroz chalkashlikka olib keldi.</p><br><p>Kelajakka nazar tashlasak, Wanderlust fotografiya yoki oshpazlik tajribasi kabi tor doiradagi qiziqishlarga mo'ljallangan ko'proq ixtisoslashgan ekskursiyalarni taklif qilishdan manfaatdor bo'lishi mumkin, deb hisoblayman. Bundan tashqari, aniqroq va izchil aloqa kanallari mijozlar tajribasini sezilarli darajada yaxshilaydi. Umid qilamanki, bu fikr-mulohazalar foydali bo'ladi.</p><br><p>Hurmat bilan,</p><br><p>[Sizning ismingiz]</p>"
    },
    "t2": {
      "title": "Task 2",
      "target": "180–200 words",
      "prompt": "You are participating in an online discussion forum. The topic is: \"Should zoos be banned?\" Write your response, giving reasons and examples. Write 180–200 words.",
      "sample": "<p>The ethics of keeping animals in <span class=\"ml-token colloc\">captivity</span> has sparked intense debate. While zoos have some benefits, I believe they <span class=\"ml-token modal\">should</span> be phased out in favor of better alternatives.</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, many zoos cannot provide adequate living conditions. Animals that roam vast territories in the wild are confined to small enclosures, causing <span class=\"ml-token colloc\">psychological distress</span> and <span class=\"ml-token colloc\">abnormal behaviors</span>. Elephants in zoos, for example, often develop <span class=\"ml-token colloc\">health problems</span> due to limited space.</p>\n\n<p><span class=\"ml-token adv\">Secondly</span>, the <span class=\"ml-token colloc\">educational value</span> of zoos is questionable. Seeing stressed animals in artificial environments teaches children little about <span class=\"ml-token colloc\">natural behavior</span>. Documentaries and <span class=\"ml-token colloc\">virtual reality</span> experiences <span class=\"ml-token modal\">could</span> provide better education.</p>\n\n<p><span class=\"ml-token adv\">However</span>, supporters argue that zoos protect <span class=\"ml-token colloc\">endangered species</span> through <span class=\"ml-token colloc\">breeding programs</span>. While true, resources <span class=\"ml-token modal\">could</span> be better spent protecting <span class=\"ml-token colloc\">natural habitats</span> and establishing <span class=\"ml-token colloc\">wildlife sanctuaries</span>.</p>\n\n<p><span class=\"ml-token adv\">Furthermore</span>, <span class=\"ml-token colloc\">animal welfare</span> <span class=\"ml-token modal\">should</span> take priority over entertainment. We <span class=\"ml-token modal\">must</span> reconsider whether our enjoyment justifies animals' suffering.</p>\n\n<p><span class=\"ml-token adv\">In conclusion</span>, traditional zoos <span class=\"ml-token modal\">should</span> be <span class=\"ml-token adv\">gradually</span> replaced with sanctuaries that prioritize <span class=\"ml-token colloc\">animal welfare</span> over profit and entertainment.</p>",
      "sampleA1": "<p>Hi!<br>Zoos? No. Animals sad.<br>Bye!</p>",
      "sampleA2": "<p>I think zoos are not good. Animals are in cages and it is small. They are not happy. I like animals but I don't like zoos because the animals are sad. I want the animals to be free. Maybe zoos can be better, but now I don't like them.</p>",
      "sampleB1": "<p>I think zoos are a difficult topic. On the one hand, they can help to protect endangered animals. For example, some zoos have breeding programs that are very important. Also, people can learn about animals at the zoo. However, I think it is also important to consider the animals' feelings. They are kept in small spaces and they can't live their normal lives. In my opinion, zoos should try to make the animals' enclosures bigger and more natural. Maybe some zoos are okay, but others need to change.</p>",
      "sampleB2": "<p>The question of whether zoos should be banned is complex, with valid arguments on both sides. While zoos often claim to contribute to conservation efforts and education, the ethical implications of keeping animals in captivity warrant serious consideration. <br><br>Many zoos fail to provide environments that adequately meet the physical and psychological needs of the animals they house. Confined spaces and artificial habitats can lead to stress, behavioral problems, and reduced lifespans. While some zoos participate in breeding programs for endangered species, these efforts are often outweighed by the suffering endured by individual animals. <br><br>Furthermore, the educational value of zoos is debatable. Observing animals in unnatural environments may not accurately reflect their behavior in the wild. Alternative methods, such as documentaries and virtual reality experiences, could offer more informative and ethical learning opportunities. <br><br>Ultimately, a balance must be struck between conservation goals and animal welfare. Stricter regulations and improved living conditions in zoos are necessary, but a gradual shift towards supporting wildlife sanctuaries and protecting natural habitats may be a more sustainable and ethical solution in the long run.</p>",
      "uzSample": "<p>Hayvonlarni asirlikda saqlash etikasi qizg'in bahslarga sabab bo'ldi. Zooparklarning ba'zi foydalari bo'lsa-da, menimcha, ularni yaxshiroq alternativlar foydasiga bosqichma-bosqich bekor qilish kerak.</p>\n\n<p>Birinchidan, ko'plab zooparklar yetarli yashash sharoitlarini ta'minlay olmaydi. Yovvoyi tabiatda keng hududlarda kezib yuradigan hayvonlar kichik qafaslarga qamalib, psixologik stress va g'ayritabiiy xatti-harakatlarga olib keladi. Misol uchun, zooparklardagi fillar cheklangan joy tufayli ko'pincha sog'lig'i bilan bog'liq muammolarga duch kelishadi.</p>\n\n<p>Ikkinchidan, zooparklarning ta'limiy qiymati shubhali. Sun'iy muhitda stressga uchragan hayvonlarni ko'rish bolalarga tabiiy xatti-harakatlar haqida kam narsa o'rgatadi. Hujjatli filmlar va virtual reallik tajribalari yaxshiroq ta'lim berishi mumkin.</p>\n\n<p>Biroq, tarafdorlar zooparklar yo'qolib ketish xavfi ostida turgan turlarni ko'paytirish dasturlari orqali himoya qilishini ta'kidlaydilar. To'g'ri, resurslarni tabiiy yashash joylarini himoya qilish va yovvoyi tabiat qo'riqxonalarini tashkil etishga sarflash yaxshiroq bo'lishi mumkin.</p>\n\n<p>Bundan tashqari, hayvonlarning farovonligi ko'ngilocharlikdan ustun turishi kerak. Bizning zavqimiz hayvonlarning azoblanishini oqlaydimi yoki yo'qmi, degan savolni qayta ko'rib chiqishimiz kerak.</p>\n\n<p>Xulosa qilib aytganda, an'anaviy zooparklar asta-sekin foyda va ko'ngilocharlikdan ko'ra hayvonlarning farovonligini ustuvor deb biladigan qo'riqxonalar bilan almashtirilishi kerak.</p>",
      "uzSampleA1": "<p>Salom!<br>Hayvonot bog'lari? Yo'q. Hayvonlar xafa.<br>Xayr!</p>",
      "uzSampleA2": "<p>Menimcha, hayvonot bog'lari yaxshi emas. Hayvonlar qafaslarda va u yer kichkina. Ular xursand emas. Menga hayvonlar yoqadi, lekin hayvonot bog'lari yoqmaydi, chunki hayvonlar xafa. Men hayvonlarning erkin bo'lishini xohlayman. Ehtimol, hayvonot bog'lari yaxshiroq bo'lishi mumkin, lekin hozir menga ular yoqmaydi.</p>",
      "uzSampleB1": "<p>Menimcha, hayvonot bog'lari murakkab mavzu. Bir tomondan, ular yo'qolib ketish xavfi ostida turgan hayvonlarni himoya qilishga yordam berishi mumkin. Misol uchun, ba'zi hayvonot bog'larida juda muhim bo'lgan ko'paytirish dasturlari mavjud. Shuningdek, odamlar hayvonot bog'ida hayvonlar haqida bilib olishlari mumkin. Biroq, menimcha, hayvonlarning his-tuyg'ularini ham hisobga olish muhim. Ular kichik joylarda saqlanadi va ular o'zlarining normal hayotlarini kechira olmaydilar. Mening fikrimcha, hayvonot bog'lari hayvonlarning qafaslarini kattaroq va tabiiyroq qilishga harakat qilishlari kerak. Ehtimol, ba'zi hayvonot bog'lari yaxshidir, lekin boshqalari o'zgarishi kerak.</p>",
      "uzSampleB2": "<p>Hayvonot bog'larini taqiqlash kerakmi degan savol murakkab bo'lib, har ikki tomonda ham asosli dalillar mavjud. Hayvonot bog'lari ko'pincha tabiatni muhofaza qilish va ta'lim berishga hissa qo'shishini da'vo qilsa-da, hayvonlarni asirlikda saqlashning axloqiy oqibatlari jiddiy e'tiborga loyiqdir. <br><br>Ko'pgina hayvonot bog'lari o'zlarida saqlanayotgan hayvonlarning jismoniy va psixologik ehtiyojlarini yetarli darajada qondira oladigan muhitni ta'minlay olmaydi. Cheklangan joylar va sun'iy yashash joylari stress, xulq-atvor muammolari va umr ko'rish davomiyligining qisqarishiga olib kelishi mumkin. Ba'zi hayvonot bog'lari yo'qolib ketish xavfi ostida turgan turlarni ko'paytirish dasturlarida ishtirok etsa-da, bu sa'y-harakatlar ko'pincha alohida hayvonlar tomonidan boshdan kechirilayotgan azob-uqubatlar bilan qoplanadi. <br><br>Bundan tashqari, hayvonot bog'larining ta'limiy ahamiyati bahsli. Hayvonlarni tabiiy bo'lmagan muhitda kuzatish ularning yovvoyi tabiatdagi xatti-harakatlarini to'g'ri aks ettirmasligi mumkin. Hujjatli filmlar va virtual reallik tajribalari kabi muqobil usullar yanada ma'lumot beruvchi va axloqiy o'rganish imkoniyatlarini taqdim etishi mumkin. <br><br>Oxir oqibat, tabiatni muhofaza qilish maqsadlari va hayvonlarning farovonligi o'rtasida muvozanat bo'lishi kerak. Hayvonot bog'larida qat'iyroq qoidalar va yaxshilangan yashash sharoitlari zarur, ammo uzoq muddatda yovvoyi tabiat qo'riqxonalarini qo'llab-quvvatlash va tabiiy yashash joylarini himoya qilishga bosqichma-bosqich o'tish yanada barqaror va axloqiy yechim bo'lishi mumkin.</p>"
    }
  },
  "vocabulary": {
    "task11": [
      {
        "en": "travel agency",
        "uz": "sayohat agentligi"
      },
      {
        "en": "planning a vacation",
        "uz": "ta'tilni rejalashtirmoq"
      },
      {
        "en": "incredible deals",
        "uz": "ajoyib takliflar"
      },
      {
        "en": "hassle-free",
        "uz": "muammosiz"
      },
      {
        "en": "check them out",
        "uz": "ularni ko'rib chiqing"
      },
      {
        "en": "take care of everything",
        "uz": "hamma narsani hal qilmoq"
      },
      {
        "en": "safe travels",
        "uz": "xavfsiz sayohat"
      },
      {
        "en": "perfect timing",
        "uz": "eng to'g'ri vaqt"
      },
      {
        "en": "book a holiday",
        "uz": "dam olishni band qilmoq"
      },
      {
        "en": "highly recommend",
        "uz": "qattiq tavsiya qilmoq"
      },
      {
        "en": "great experience",
        "uz": "ajoyib tajriba"
      },
      {
        "en": "dream destination",
        "uz": "orzu qilingan manzil"
      },
      {
        "en": "all-inclusive package",
        "uz": "hamma narsa kiritilgan paket"
      },
      {
        "en": "affordable prices",
        "uz": "arzon narxlar"
      },
      {
        "en": "stress-free booking",
        "uz": "xavotirsiz buyurtma"
      },
      {
        "en": "customer service",
        "uz": "mijozlarga xizmat"
      },
      {
        "en": "trip of a lifetime",
        "uz": "umrdagi eng yaxshi sayohat"
      },
      {
        "en": "you should try",
        "uz": "sinab ko'rishingiz kerak"
      },
      {
        "en": "let me know",
        "uz": "menga xabar bering"
      },
      {
        "en": "have fun",
        "uz": "quvnoq bo'ling"
      }
    ],
    "task12": [
      {
        "en": "travel experience",
        "uz": "sayohat tajribasi"
      },
      {
        "en": "hotel accommodation",
        "uz": "mehmonxona joylashuvi"
      },
      {
        "en": "guided tours",
        "uz": "gidli ekskursiyalar"
      },
      {
        "en": "customer support",
        "uz": "mijozlarni qo'llab-quvvatlash"
      },
      {
        "en": "airport transfer",
        "uz": "aeroportdan tashish"
      },
      {
        "en": "detailed reviews",
        "uz": "batafsil sharhlar"
      },
      {
        "en": "adventure travel packages",
        "uz": "sarguzasht sayohat paketlari"
      },
      {
        "en": "eco-tourism options",
        "uz": "eko-turizm variantlari"
      },
      {
        "en": "environmentally conscious",
        "uz": "ekologik onglilik"
      },
      {
        "en": "very pleased",
        "uz": "juda mamnun"
      },
      {
        "en": "exceptionally well organized",
        "uz": "juda yaxshi tashkil etilgan"
      },
      {
        "en": "last-minute changes",
        "uz": "oxirgi daqiqadagi o'zgarishlar"
      },
      {
        "en": "unnecessary stress",
        "uz": "keraksiz stress"
      },
      {
        "en": "reliable transport",
        "uz": "ishonchli transport"
      },
      {
        "en": "cultural immersion",
        "uz": "madaniy qo'shilish"
      },
      {
        "en": "I would suggest",
        "uz": "Men taklif qilardim"
      },
      {
        "en": "I would love to see",
        "uz": "Ko'rishni xohlardim"
      },
      {
        "en": "wonderful trip",
        "uz": "ajoyib sayohat"
      },
      {
        "en": "Yours sincerely",
        "uz": "Hurmat bilan"
      },
      {
        "en": "overall experience",
        "uz": "umumiy tajriba"
      }
    ],
    "task2": [
      {
        "en": "captivity",
        "uz": "asirlik"
      },
      {
        "en": "psychological distress",
        "uz": "ruhiy qiyinchilik"
      },
      {
        "en": "abnormal behaviors",
        "uz": "g'ayritabiiy xulq-atvor"
      },
      {
        "en": "health problems",
        "uz": "salomatlik muammolari"
      },
      {
        "en": "educational value",
        "uz": "ta'limiy qiymat"
      },
      {
        "en": "natural behavior",
        "uz": "tabiiy xulq"
      },
      {
        "en": "virtual reality",
        "uz": "virtual reallik"
      },
      {
        "en": "endangered species",
        "uz": "yo'qolib ketish xavfi ostidagi turlar"
      },
      {
        "en": "breeding programs",
        "uz": "ko'paytirish dasturlari"
      },
      {
        "en": "natural habitats",
        "uz": "tabiiy yashash joylari"
      },
      {
        "en": "wildlife sanctuaries",
        "uz": "yovvoyi tabiat qo'riqxonalari"
      },
      {
        "en": "animal welfare",
        "uz": "hayvonlar farovonligi"
      },
      {
        "en": "small enclosures",
        "uz": "kichik qafaslar"
      },
      {
        "en": "limited space",
        "uz": "cheklangan joy"
      },
      {
        "en": "artificial environments",
        "uz": "sun'iy muhitlar"
      },
      {
        "en": "phased out",
        "uz": "bosqichma-bosqich bekor qilmoq"
      },
      {
        "en": "ethical concerns",
        "uz": "axloqiy tashvishlar"
      },
      {
        "en": "prioritize over",
        "uz": "ustun qo'ymoq"
      },
      {
        "en": "in conclusion",
        "uz": "xulosa qilib aytganda"
      },
      {
        "en": "gradually replaced",
        "uz": "asta-sekin almashtirilgan"
      }
    ]
  },
  "tokenTranslations": {
    "just": {
      "uz": "faqat",
      "type": "adv"
    },
    "incredible": {
      "uz": "ajoyib",
      "type": "adv"
    },
    "hassle-free": {
      "uz": "muammosiz",
      "type": "colloc"
    },
    "should": {
      "uz": "kerak",
      "type": "modal"
    },
    "definitely": {
      "uz": "albatta",
      "type": "adv"
    },
    "check them out": {
      "uz": "ko'rib chiqmoq",
      "type": "phrasal"
    },
    "take care of": {
      "uz": "g'amxo'rlik qilmoq",
      "type": "phrasal"
    },
    "Safe travels": {
      "uz": "Oq yo'l!",
      "type": "colloc"
    },
    "travel experience": {
      "uz": "sayohat tajribasi",
      "type": "colloc"
    },
    "very": {
      "uz": "juda",
      "type": "adv"
    },
    "hotel accommodation": {
      "uz": "mehmonxona xizmatlari",
      "type": "colloc"
    },
    "guided tours": {
      "uz": "gid bilan sayohatlar",
      "type": "colloc"
    },
    "exceptionally": {
      "uz": "favqulodda",
      "type": "adv"
    },
    "excellent": {
      "uz": "a'lo",
      "type": "adv"
    },
    "customer support": {
      "uz": "mijozlarni qo'llab-quvvatlash",
      "type": "colloc"
    },
    "However": {
      "uz": "Biroq",
      "type": "adv"
    },
    "airport transfer": {
      "uz": "aeroport transferi",
      "type": "colloc"
    },
    "would": {
      "uz": "…moqchi edim",
      "type": "modal"
    },
    "Additionally": {
      "uz": "Bundan tashqari",
      "type": "adv"
    },
    "could": {
      "uz": "mumkin",
      "type": "modal"
    },
    "detailed reviews": {
      "uz": "batafsil sharhlar",
      "type": "colloc"
    },
    "adventure travel packages": {
      "uz": "sarguzasht sayohat paketlari",
      "type": "colloc"
    },
    "Eco-tourism options": {
      "uz": "Ekoturizm variantlari",
      "type": "colloc"
    },
    "environmentally conscious": {
      "uz": "atrof-muhitga e'tiborli",
      "type": "colloc"
    },
    "Overall": {
      "uz": "Umuman olganda",
      "type": "adv"
    },
    "will": {
      "uz": "-moqchi",
      "type": "modal"
    },
    "captivity": {
      "uz": "asirlik",
      "type": "colloc"
    },
    "Firstly": {
      "uz": "Birinchidan",
      "type": "adv"
    },
    "psychological distress": {
      "uz": "ruhiy iztirob",
      "type": "colloc"
    },
    "abnormal behaviors": {
      "uz": "g'ayrioddiy xatti-harakatlar",
      "type": "colloc"
    },
    "health problems": {
      "uz": "sog'liq muammolari",
      "type": "colloc"
    },
    "Secondly": {
      "uz": "Ikkinchidan",
      "type": "adv"
    },
    "educational value": {
      "uz": "ta'limiy ahamiyat",
      "type": "colloc"
    },
    "natural behavior": {
      "uz": "tabiiy xulq-atvor",
      "type": "colloc"
    },
    "virtual reality": {
      "uz": "virtual reallik",
      "type": "colloc"
    },
    "endangered species": {
      "uz": "yo'qolib borayotgan turlar",
      "type": "colloc"
    },
    "breeding programs": {
      "uz": "ko'paytirish dasturlari",
      "type": "colloc"
    },
    "natural habitats": {
      "uz": "tabiiy yashash joylari",
      "type": "colloc"
    },
    "wildlife sanctuaries": {
      "uz": "yovvoyi tabiat qo'riqxonalari",
      "type": "colloc"
    },
    "Furthermore": {
      "uz": "Bundan tashqari",
      "type": "adv"
    },
    "animal welfare": {
      "uz": "hayvonlar farovonligi",
      "type": "colloc"
    },
    "must": {
      "uz": "kerak",
      "type": "modal"
    },
    "In conclusion": {
      "uz": "Xulosa qilib aytganda",
      "type": "adv"
    },
    "gradually": {
      "uz": "asta-sekin",
      "type": "adv"
    }
  }
};