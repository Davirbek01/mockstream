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
    "p1_context": "You are a member of the Music Club. You received this email from the club leader.",
    "p1_scenario": "Dear Member,\n\nWe are planning some activities for next term and would like your help.\n\nShould we invite local musicians to perform? Is it a good idea to hold more concerts or workshops? How can we encourage new members to join the club?\n\nPlease write back with your ideas.\n\nThe Club Leader",
    "t11": {
      "title": "Task 1.1",
      "target": "50–70 words",
      "prompt": "Write a letter to your friend, who is also a member of the club. Write about your feelings and what you think the club management should do. Write your response in about 50 words.",
      "sample": "Hey there,\n\nGot the club's message about next term's activities. Honestly, I reckon inviting <span class=\"ml-token colloc\">local musicians</span> would be a brilliant move! It'd not only spice things up but also support local talent. Plus, having more concerts combined with interactive <span class=\"ml-token colloc\">music workshops</span> could really <span class=\"ml-token phrasal\">draw in</span> new folks. To <span class=\"ml-token colloc\">attract new members</span>, we <span class=\"ml-token modal\">might</span> offer a free first event or a buddy system. What do you think? Let's chat soon!\n\nCheers!",
      "sampleA1": "<p>Hi friend,<br>Music club! Good? Yes. <br>Musicians? Yes, good. Concert? Good.<br>New people? Yes. Bye.</p>",
      "sampleA2": "<p>Hi,<br>I think the music club is good. I think we can invite musicians, because it is fun. And we can have more concerts, but maybe not too many. New people can join if we have good music. What do you think? <br>Bye!</p>",
      "sampleB1": "<p>Hi,<br>I saw the email about the music club. I think it's a good idea to invite local musicians because it could be interesting for everyone. Also, maybe we should have more concerts and workshops to make the club more popular. To get new members, we could try advertising the club on social media or offering a discount for the first event. What do you think about these ideas?<br>See you soon,</p>",
      "sampleB2": "<p>Hey,<br>I received the email from the club leader, and I have some thoughts. I believe inviting local musicians is a worthwhile initiative, as it could enrich our club's events and provide exposure for emerging artists. Furthermore, a combination of concerts and interactive workshops would likely appeal to a broader audience. To attract new members, perhaps we could implement a referral program or offer introductory sessions to showcase the club's activities. What are your views on these suggestions?<br>Best regards,</p>",
      "uzSample": "<p>Salom!</p>\n<p>Klubning keyingi semestr tadbirlari haqidagi xabarini oldim. Rostini aytsam, mahalliy musiqachilarni taklif qilish ajoyib g'oya bo'lardi deb o'ylayman! Bu nafaqat vaziyatni jonlantiradi, balki mahalliy iste'dodlarni ham qo'llab-quvvatlaydi. Qolaversa, ko'proq konsertlar va interaktiv musiqa ustaxonalarini birga olib borish yangi odamlarni jalb qilishi mumkin. Yangi a'zolarni jalb qilish uchun biz birinchi tadbirni bepul yoki do'stlik tizimini taklif qilishimiz mumkin. Nima deb o'ylaysiz? Tez orada gaplashamiz!</p>\n<p>Xayr!</p>",
      "uzSampleA1": "<p>Salom do'stim,<br>Musiqa klubi! Yaxshimi? Ha. <br>Musiqachilar? Ha, yaxshi. Konsert? Yaxshi.<br>Yangi odamlar? Ha. Xayr.</p>",
      "uzSampleA2": "<p>Salom,<br>Menimcha, musiqa klubi yaxshi. O'ylaymanki, biz musiqachilarni taklif qila olamiz, chunki bu qiziqarli. Va biz ko'proq konsertlar o'tkazishimiz mumkin, lekin balki juda ko'p emas. Agar bizda yaxshi musiqa bo'lsa, yangi odamlar qo'shilishi mumkin. Siz nima deb o'ylaysiz? <br>Xayr!</p>",
      "uzSampleB1": "<p>Salom,<br>Musiqa klubi haqidagi elektron pochtani ko'rdim. Mahalliy musiqachilarni taklif qilish yaxshi fikr deb o'ylayman, chunki bu hamma uchun qiziqarli bo'lishi mumkin. Shuningdek, klubni yanada ommalashtirish uchun ko'proq konsertlar va seminarlar o'tkazishimiz kerak bo'lishi mumkin. Yangi a'zolarni jalb qilish uchun klubni ijtimoiy tarmoqlarda reklama qilishga yoki birinchi tadbir uchun chegirma taklif qilishga harakat qilishimiz mumkin. Bu fikrlar haqida nima deb o'ylaysiz?<br>Tez orada ko'rishguncha,</p>",
      "uzSampleB2": "<p>Salom,<br>Men klub rahbaridan xat oldim va menda ba'zi fikrlar bor. Menimcha, mahalliy musiqachilarni taklif qilish arziydigan tashabbus, chunki u klubimiz tadbirlarini boyitishi va yangi paydo bo'layotgan san'atkorlar uchun imkoniyat yaratishi mumkin. Bundan tashqari, konsertlar va interaktiv seminarlarning kombinatsiyasi kengroq auditoriyaga yoqishi mumkin. Yangi a'zolarni jalb qilish uchun, ehtimol, biz tavsiya dasturini amalga oshirishimiz yoki klub faoliyatini namoyish qilish uchun kirish sessiyalarini taklif qilishimiz mumkin. Sizning bu takliflar bo'yicha fikringiz qanday?<br>Eng yaxshi tilaklar bilan,</p>"
    },
    "t12": {
      "title": "Task 1.2",
      "target": "120–150 words",
      "prompt": "Write a letter to the club leader. Write about your feelings and what you think the club management should do. Write your response in 120-150 words.",
      "sample": "<!DOCTYPE html>\n<html>\n<head>\n    <style>\n        .ml-token.colloc { color: blue; font-weight: bold; }\n        .ml-token.phrasal { color: green; text-decoration: underline; }\n        .ml-token.adv { color: orange; font-style: italic; }\n        .ml-token.idiom { color: purple; text-decoration: underline; }\n    </style>\n</head>\n<body>\n    <p>Dear Club Leader,</p>\n    \n    <p>I <span class=\"ml-token modal\">believe</span> inviting local musicians <span class=\"ml-token colloc\">to perform</span> is a fantastic idea. Not only does it <span class=\"ml-token phrasal\">support local talent</span>, but it also enriches our events with diverse musical styles. We <span class=\"ml-token modal\">could</span> perhaps <span class=\"ml-token colloc\">organize monthly concerts</span> to maintain a vibrant atmosphere throughout the term. Holding more workshops <span class=\"ml-token adv\">certainly</span> <span class=\"ml-token modal\">would</span> provide an opportunity for members to enhance their skills, creating a more <span class=\"ml-token colloc\">engaging experience</span>.</p>\n\n    <p>To <span class=\"ml-token phrasal\">bring in new members</span>, we <span class=\"ml-token modal\">might consider</span> promoting our events through social media platforms actively. Additionally, a \"bring-a-friend\" scheme <span class=\"ml-token modal\">could</span> work wonders in spreading the word. Offering a <span class=\"ml-token colloc\">discounted membership</span> for those who refer others might also be enticing. I truly think such strategies <span class=\"ml-token modal\">could help</span> in making our club a more inclusive space.</p>\n\n    <p>Please <span class=\"ml-token phrasal\">keep me posted</span> on the plans, as I <span class=\"ml-token modal\">would love</span> to contribute further.</p>\n\n    <p>Best regards,<br>Muhammadrizo</p>\n</body>\n</html>",
      "sampleA1": "<p>Hi!</p><br><p>Music club good. I like music. Yes to music. New people good. Bye!</p>",
      "sampleA2": "<p>Hi,</p><p>I like the music club. I think it is good to have music. We can have concerts and people will come. And we can ask musicians to play. It is fun! New people are good because more people like music. I like music because it is good. Bye!</p>",
      "sampleB1": "<p>Dear Club Leader,</p><p>I think it's a good idea to invite local musicians to perform. This could be interesting for our members. Also, I think we should have more concerts. Maybe one concert every month? That would be good. Workshops are also a good idea because people can learn new things.</p><p>To get new members, we could use social media. For example, we can post photos and videos on Instagram. Also, we can tell our friends about the club. I think these ideas will help the club.</p><p>Sincerely,</p><p>[Your Name]</p>",
      "sampleB2": "<p>Dear Club Leader,</p><p>I am writing in response to your email regarding activities for the upcoming term. I strongly believe that inviting local musicians to perform would be a beneficial addition to our program. It offers them a platform and exposes our members to diverse musical perspectives. Furthermore, increasing the frequency of concerts and workshops would undoubtedly enhance engagement within the club.</p><p>Regarding attracting new members, I suggest implementing a multi-pronged approach. Actively promoting our events on social media platforms is crucial for reaching a wider audience. Additionally, we could organize an open day or taster session to allow prospective members to experience the club firsthand. Perhaps offering introductory discounts or buddy systems could also prove effective in encouraging sign-ups. I am confident that these strategies would contribute significantly to expanding our membership base.</p><p>Yours sincerely,</p><p>[Your Name]</p>",
      "uzSample": "<p>Hurmatli Klub Rahbari,</p>\n\n<p>Men mahalliy musiqachilarni chiqish qilishga taklif etish ajoyib g'oya deb hisoblayman. Bu nafaqat mahalliy iste'dodlarni qo'llab-quvvatlaydi, balki tadbirlarimizni turli xil musiqiy uslublar bilan boyitadi. Biz, ehtimol, butun semestr davomida jonli muhitni saqlab qolish uchun har oylik konsertlar tashkil qilishimiz mumkin. Ko'proq seminarlar o'tkazish, albatta, a'zolarga o'z mahoratini oshirish imkoniyatini beradi va yanada qiziqarli tajriba yaratadi.</p>\n\n<p>Yangi a'zolarni jalb qilish uchun tadbirlarimizni ijtimoiy media platformalari orqali faol ravishda targ'ib qilishni ko'rib chiqishimiz mumkin. Bundan tashqari, \"do'stingni olib kel\" sxemasi so'zni tarqatishda ajoyib natijalarga olib kelishi mumkin. Boshqalarni tavsiya qilganlar uchun chegirmali a'zolikni taklif qilish ham jozibali bo'lishi mumkin. Menimcha, bunday strategiyalar klubimizni yanada inklyuziv makonga aylantirishga yordam berishi mumkin.</p>\n\n<p>Iltimos, meni rejalardan xabardor qiling, chunki men bundan keyin ham hissa qo'shishni xohlayman.</p>\n\n<p>Eng yaxshi tilaklar bilan,<br>Muhammadrizo</p>",
      "uzSampleA1": "<p>Salom!</p><br><p>Musiqa klubi yaxshi. Men musiqani yaxshi ko'raman. Musiqaga ha. Yangi odamlar yaxshi. Xayr!</p>",
      "uzSampleA2": "<p>Salom,</p><p>Menga musiqa klubi yoqadi. O'ylaymanki, musiqa bo'lishi yaxshi. Biz konsertlar o'tkazishimiz mumkin va odamlar keladi. Va biz musiqachilardan o'ynashni so'rashimiz mumkin. Bu qiziqarli! Yangi odamlar yaxshi, chunki ko'proq odamlar musiqani yaxshi ko'radi. Menga musiqa yoqadi, chunki u yaxshi. Xayr!</p>",
      "uzSampleB1": "<p>Hurmatli Klub Rahbari,</p><p>Menimcha, mahalliy musiqachilarni chiqishga taklif qilish yaxshi fikr. Bu bizning a'zolarimiz uchun qiziqarli bo'lishi mumkin. Shuningdek, menimcha, bizda ko'proq konsertlar bo'lishi kerak. Ehtimol, har oyda bitta konsert? Bu yaxshi bo'lardi. Seminarlar ham yaxshi fikr, chunki odamlar yangi narsalarni o'rganishlari mumkin.</p><p>Yangi a'zolarni jalb qilish uchun biz ijtimoiy tarmoqlardan foydalanishimiz mumkin. Misol uchun, biz Instagramga fotosuratlar va videolar joylashtirishimiz mumkin. Shuningdek, biz do'stlarimizga klub haqida aytishimiz mumkin. Menimcha, bu g'oyalar klubga yordam beradi.</p><p>Hurmat bilan,</p><p>[Sizning ismingiz]</p>",
      "uzSampleB2": "<p>Hurmatli Klub Rahbari,</p><p>Men sizning kelgusi semestr uchun tadbirlar haqidagi elektron pochtangizga javoban yozyapman. Men mahalliy musiqachilarni chiqishga taklif qilish dasturimizga foydali qo'shimcha bo'lishiga qat'iy ishonaman. Bu ularga platforma taklif etadi va a'zolarimizni turli musiqiy nuqtai nazarlar bilan tanishtiradi. Bundan tashqari, konsertlar va seminarlar sonini ko'paytirish, shubhasiz, klub ichidagi ishtirokni kuchaytiradi.</p><p>Yangi a'zolarni jalb qilish borasida, men ko'p tomonlama yondashuvni amalga oshirishni taklif qilaman. Ijtimoiy media platformalarida tadbirlarimizni faol ravishda targ'ib qilish kengroq auditoriyaga yetib borish uchun juda muhimdir. Bundan tashqari, biz bo'lajak a'zolarga klubni bevosita his qilishlari uchun ochiq eshiklar kuni yoki sinov sessiyasini tashkil qilishimiz mumkin. Ehtimol, kirish chegirmalarini yoki do'stlik tizimlarini taklif qilish ham ro'yxatdan o'tishni rag'batlantirishda samarali bo'lishi mumkin. Ishonchim komilki, bu strategiyalar a'zolik bazamizni kengaytirishga sezilarli hissa qo'shadi.</p><p>Hurmat bilan,</p><p>[Sizning Ismingiz]</p>"
    },
    "t2": {
      "title": "Task 2",
      "target": "180–200 words",
      "prompt": "You are participating in an online discussion forum. The topic is: “Cell phones should not be allowed in schools” Write your response, giving reasons and examples. Write 180-200 words.",
      "sample": "```html\n<p>Hello everyone,</p>\n\n<p>I've been following this discussion with interest, and I think it's a tough one. While there may be valid reasons for banning cell phones in schools, I <span class=\"ml-token modal\">believe</span> there are downsides to consider too. Let me <span class=\"ml-token phrasal\">lay out</span> my thoughts.</p>\n\n<p><span class=\"ml-token adv\">Undoubtedly</span>, cell phones can <span class=\"ml-token colloc\">cause distractions</span> during class. Students <span class=\"ml-token phrasal\">may end up</span> texting or browsing social media instead of paying attention. It can <span class=\"ml-token colloc\">disrupt the learning environment</span> and make it hard for teachers to <span class=\"ml-token colloc\">maintain discipline</span>.</p>\n\n<p>However, I think we <span class=\"ml-token modal\">should</span> consider the benefits. Cell phones can be a <span class=\"ml-token colloc\">valuable resource</span> for learning. With <span class=\"ml-token idiom\">the click of a button</span>, students can <span class=\"ml-token phrasal\">look up</span> information, use educational apps, and even <span class=\"ml-token colloc\">engage in interactive learning</span>. Moreover, in terms of safety, having a cell phone can be crucial if a student needs to <span class=\"ml-token phrasal\">get in touch</span> with their parents or guardians quickly.</p>\n\n<p>Instead of an outright ban, schools <span class=\"ml-token modal\">might</span> implement guided usage. For instance, teachers can allow phone use for specific educational tasks or emergencies. Teaching students how to use technology responsibly could also be incorporated into the curriculum. <span class=\"ml-token idiom\">All in all</span>, it’s not just about putting the lid on phones; it’s about managing their use wisely.</p>\n\n<p>Looking forward to reading your thoughts!</p>\n```",
      "sampleA1": "<p>Hi! <br> I think no phones. <br> Phones bad. <br> Class time no phones. <br> Bye!</p>",
      "sampleA2": "<p>Hello. <br> I think phones are bad in school. <br> Because students play games. <br> And they don't listen to the teacher. <br> But phones are good for parents. <br> So maybe a little phone is okay.</p>",
      "sampleB1": "<p>Hi everyone, <br> I have some opinions about phones in schools. I think that phones can be a problem. For example, students might use them during class and not pay attention. This is not good for learning. <br> However, phones can also be useful. Students can use them to find information quickly. Also, if there is an emergency, they can call their parents. <br> Maybe schools should have some rules about when phones can be used. I think it's important to find a balance. Thanks for reading.</p>",
      "sampleB2": "<p>Hello, <br> This is an interesting debate. While I understand the arguments against cell phones in schools, I believe a complete ban might be too restrictive. <br> On the one hand, it's clear that cell phones can be a significant distraction. Students are often tempted to use them for social media or games instead of focusing on their studies. This can disrupt the learning environment and negatively impact academic performance. <br> On the other hand, cell phones can also be valuable tools. They provide access to a wealth of information and can be used for educational purposes. Furthermore, they offer a sense of security, allowing students to contact family in case of an emergency. <br> Perhaps a more nuanced approach is needed. Schools could implement policies that restrict cell phone use during class time but allow them during breaks or for specific educational activities. Educating students about responsible cell phone usage is also crucial. This would strike a better balance between minimizing distractions and maximizing the potential benefits of technology. <br> What are your thoughts?</p>",
      "uzSample": "<p>Hammaga salom,</p>\n\n<p>Men bu muhokazani qiziqish bilan kuzatib kelmoqdaman va bu murakkab masala deb o'ylayman. Maktablarda mobil telefonlarni taqiqlash uchun asosli sabablar bo'lishi mumkin bo'lsa-da, menimcha, e'tiborga olish kerak bo'lgan kamchiliklar ham bor. Keling, o'z fikrlarimni bayon qilay.</p>\n\n<p>Shubhasiz, mobil telefonlar dars paytida chalg'itishi mumkin. O'quvchilar darsga e'tibor berish o'rniga, SMS yozish yoki ijtimoiy tarmoqlarni ko'rib chiqish bilan mashg'ul bo'lishlari mumkin. Bu ta'lim muhitini buzishi va o'qituvchilarga intizomni saqlashni qiyinlashtirishi mumkin.</p>\n\n<p>Biroq, menimcha, biz foydali tomonlarini ham ko'rib chiqishimiz kerak. Mobil telefonlar o'rganish uchun qimmatli manba bo'lishi mumkin. Bir tugmani bosish orqali o'quvchilar ma'lumot qidirishlari, ta'limiy ilovalardan foydalanishlari va hatto interaktiv o'rganishda ishtirok etishlari mumkin. Bundan tashqari, xavfsizlik nuqtai nazaridan, o'quvchining ota-onalari yoki vasiylari bilan tezda bog'lanishi kerak bo'lsa, mobil telefonning bo'lishi juda muhim bo'lishi mumkin.</p>\n\n<p>To'liq taqiq o'rniga, maktablar boshqariladigan foydalanishni joriy qilishi mumkin. Misol uchun, o'qituvchilar telefonlardan muayyan ta'limiy vazifalar yoki favqulodda vaziyatlar uchun foydalanishga ruxsat berishlari mumkin. O'quvchilarga texnologiyadan mas'uliyat bilan foydalanishni o'rgatish ham o'quv dasturiga kiritilishi mumkin. Umuman olganda, gap shunchaki telefonlarni taqiqlash emas; ulardan oqilona foydalanishni boshqarish haqida.</p>\n\n<p>Sizning fikrlaringizni o'qishni intiqlik bilan kutaman!</p>",
      "uzSampleA1": "<p>Salom! <br> Menimcha, telefonlar kerak emas. <br> Telefonlar yomon. <br> Sinf vaqtida telefonlar bo'lmasligi kerak. <br> Xayr!</p>",
      "uzSampleA2": "<p>Salom. <br> Menimcha, telefonlar maktabda yomon. <br> Chunki o'quvchilar o'yin o'ynashadi. <br> Va ular o'qituvchini tinglashmaydi. <br> Lekin telefonlar ota-onalar uchun yaxshi. <br> Shuning uchun, balki ozgina telefon yaxshi bo'lishi mumkin.</p>",
      "uzSampleB1": "<p>Hammaga salom, <br> Maktablardagi telefonlar haqida ba'zi fikrlarim bor. Menimcha, telefonlar muammo bo'lishi mumkin. Misol uchun, o'quvchilar ulardan dars paytida foydalanishi va e'tibor bermasligi mumkin. Bu o'qish uchun yaxshi emas. <br> Biroq, telefonlar foydali ham bo'lishi mumkin. O'quvchilar ulardan tezda ma'lumot topish uchun foydalanishi mumkin. Shuningdek, agar favqulodda vaziyat bo'lsa, ular ota-onalariga qo'ng'iroq qilishlari mumkin. <br> Ehtimol, maktablar telefonlardan qachon foydalanish mumkinligi haqida ba'zi qoidalar belgilashi kerak. Men muvozanatni topish muhim deb o'ylayman. O'qiganingiz uchun rahmat.</p>",
      "uzSampleB2": "<p>Salom, <br> Bu qiziqarli munozara. Maktablarda mobil telefonlarga qarshi argumentlarni tushunsam ham, to'liq taqiq juda cheklovchi bo'lishi mumkin deb hisoblayman. <br> Bir tomondan, mobil telefonlar sezilarli chalg'ituvchi omil bo'lishi aniq. Talabalar ko'pincha ulardan ijtimoiy tarmoqlar yoki o'yinlar uchun foydalanishga vasvasaga tushishadi, o'qishga e'tibor qaratish o'rniga. Bu ta'lim muhitini buzishi va akademik ko'rsatkichlarga salbiy ta'sir ko'rsatishi mumkin. <br> Boshqa tomondan, mobil telefonlar ham qimmatli vosita bo'lishi mumkin. Ular axborot boyligiga kirishni ta'minlaydi va ta'lim maqsadlarida foydalanish mumkin. Bundan tashqari, ular xavfsizlik hissini beradi, talabalarga favqulodda vaziyatlarda oilasi bilan bog'lanish imkonini beradi. <br> Ehtimol, yanada nozik yondashuv kerakdir. Maktablar dars vaqtida mobil telefonlardan foydalanishni cheklaydigan, lekin tanaffuslarda yoki muayyan ta'lim faoliyatlari uchun ruxsat beradigan siyosatni amalga oshirishi mumkin. Talabalarni mobil telefonlardan mas'uliyatli foydalanish haqida o'rgatish ham juda muhim. Bu chalg'itishni minimallashtirish va texnologiyaning potentsial afzalliklarini maksimal darajada oshirish o'rtasida yaxshiroq muvozanatni ta'minlaydi. <br> Sizning fikringiz qanday?</p>"
    }
  },
  "vocabulary": {
    "task11": [
      {
        "en": "Hey there!",
        "uz": "Salom!"
      },
      {
        "en": "I'm super excited",
        "uz": "Juda hayajondaman"
      },
      {
        "en": "It sounds awesome!",
        "uz": "Bu juda ajoyib!"
      },
      {
        "en": "Let's invite them!",
        "uz": "Keling, ularni taklif qilaylik!"
      },
      {
        "en": "More concerts, yes!",
        "uz": "Ko'proq konsertlar, ha!"
      },
      {
        "en": "Workshops could be fun",
        "uz": "Seminarlar qiziqarli bo'lishi mumkin"
      },
      {
        "en": "Totally agree!",
        "uz": "To'liq rozi!"
      },
      {
        "en": "It'll be great!",
        "uz": "Bu ajoyib bo'ladi!"
      },
      {
        "en": "New members are welcome",
        "uz": "Yangi a'zolarni kutib olamiz"
      },
      {
        "en": "Spread the word",
        "uz": "Xabarni tarqat"
      },
      {
        "en": "Let's make it happen",
        "uz": "Keling, buni amalga oshiramiz"
      },
      {
        "en": "More events, more fun",
        "uz": "Ko'proq tadbirlar, ko'proq qiziqarli"
      },
      {
        "en": "Catch up soon",
        "uz": "Yaqinda uchrashamiz"
      },
      {
        "en": "Can't wait",
        "uz": "Kuta olmayman"
      },
      {
        "en": "Fingers crossed",
        "uz": "O'ta kutyapman"
      }
    ],
    "task12": [
      {
        "en": "I appreciate your initiative",
        "uz": "Sizning tashabbusingizni qadrlayman"
      },
      {
        "en": "Inviting musicians would be beneficial",
        "uz": "Musiqachilarni taklif qilish foydali bo'lardi"
      },
      {
        "en": "Concerts could enhance our club's reputation",
        "uz": "Konsertlar klubimizning obro'sini oshirishi mumkin"
      },
      {
        "en": "Workshops provide learning opportunities",
        "uz": "Seminarlar o'quv imkoniyatlarini taqdim etadi"
      },
      {
        "en": "We should consider diverse activities",
        "uz": "Biz turli tadbirlarni ko'rib chiqishimiz kerak"
      },
      {
        "en": "Engaging new members is crucial",
        "uz": "Yangi a'zolarni jalb qilish juda muhim"
      },
      {
        "en": "Effective promotion strategies",
        "uz": "Samarali targ'ibot strategiyalari"
      },
      {
        "en": "Potential collaborations with local artists",
        "uz": "Mahalliy san'atkorlar bilan hamkorlik imkoniyatlari"
      },
      {
        "en": "Enhancing community engagement",
        "uz": "Jamiyat ishtirokini oshirish"
      },
      {
        "en": "Broaden our audience",
        "uz": "Tomoshabinlarimizni kengaytiring"
      },
      {
        "en": "Consider feedback from members",
        "uz": "A'zolarning fikr-mulohazalarini ko'rib chiqing"
      },
      {
        "en": "Implement innovative ideas",
        "uz": "Innovatsion g'oyalarni amalga oshiring"
      },
      {
        "en": "Leverage social media",
        "uz": "Ijtimoiy tarmoqlarni qo'llang"
      },
      {
        "en": "Foster an inclusive environment",
        "uz": "Inklusiv muhitni rivojlantirish"
      },
      {
        "en": "Strengthen club identity",
        "uz": "Klub identifikatsiyasini mustahkamlash"
      },
      {
        "en": "Ensure diversity in events",
        "uz": "Tadbirlar xilma-xilligini ta'minlash"
      },
      {
        "en": "Cultivate a sense of belonging",
        "uz": "Mansublik hissini rivojlantirish"
      },
      {
        "en": "Promote creative expression",
        "uz": "Ijodiy ifodani targ'ib qilish"
      },
      {
        "en": "Develop long-term strategies",
        "uz": "Uzoq muddatli strategiyalarni ishlab chiqish"
      }
    ],
    "task2": [
      {
        "en": "Distraction in learning environments",
        "uz": "O'quv muhitida chalg'itish"
      },
      {
        "en": "Hinder academic performance",
        "uz": "Akademik natijalarga to'sqinlik qilish"
      },
      {
        "en": "Promote discipline among students",
        "uz": "Talabalar orasida intizomni targ'ib qilish"
      },
      {
        "en": "Enhance focus and concentration",
        "uz": "Diqqat va e'tiborni oshirish"
      },
      {
        "en": "Restrict access to inappropriate content",
        "uz": "Noto'g'ri mazmunga kirishni cheklash"
      },
      {
        "en": "Foster a conducive learning environment",
        "uz": "Qulay o'quv muhitini rivojlantirish"
      },
      {
        "en": "Limit cheating and academic dishonesty",
        "uz": "Firibgarlik va akademik halollikni cheklash"
      },
      {
        "en": "Encourage face-to-face interactions",
        "uz": "Yuzma-yuz muloqotlarni rag'batlantirish"
      },
      {
        "en": "Preserve educational integrity",
        "uz": "Ta'lim intellektini saqlash"
      },
      {
        "en": "Facilitate teacher-student engagement",
        "uz": "O'qituvchi va talaba o'rtasidagi muloqotni osonlashtirish"
      },
      {
        "en": "Promote active participation",
        "uz": "Faol ishtirokni rag'batlantirish"
      },
      {
        "en": "Minimize digital distractions",
        "uz": "Raqamli chalg'itishlarni kamaytirish"
      },
      {
        "en": "Encourages traditional learning methods",
        "uz": "An'anaviy o'qitish uslublarini rag'batlantiradi"
      },
      {
        "en": "Enhance educational outcomes",
        "uz": "Ta'lim natijalarini yaxshilash"
      },
      {
        "en": "Maintain a focused academic atmosphere",
        "uz": "Diqqatli akademik muhitni saqlash"
      },
      {
        "en": "Prevent cyberbullying in schools",
        "uz": "Maktablarda kiberhujumning oldini olish"
      },
      {
        "en": "Implement strict mobile phone policies",
        "uz": "Qattiq mobil telefon siyosatini amalga oshirish"
      },
      {
        "en": "Support educational goals",
        "uz": "Ta'lim maqsadlarini qo'llab-quvvatlash"
      },
      {
        "en": "Promote ethical use of technology",
        "uz": "Texnologiyadan axloqiy foydalanishni targ'ib qilish"
      }
    ]
  },
  "tokenTranslations": {
    "local musicians": {
      "uz": "mahalliy musiqachilar",
      "type": "colloc"
    },
    "music workshops": {
      "uz": "musiqa ustaxonalari",
      "type": "colloc"
    },
    "draw in": {
      "uz": "jalb qilish",
      "type": "phrasal"
    },
    "attract new members": {
      "uz": "yangi a'zolarni jalb qilish",
      "type": "colloc"
    },
    "might": {
      "uz": "mumkin",
      "type": "modal"
    },
    "believe": {
      "uz": "ishonaman",
      "type": "modal"
    },
    "to perform": {
      "uz": "chiqish qilish",
      "type": "colloc"
    },
    "support local talent": {
      "uz": "mahalliy iste'dodlarni qo'llab-quvvatlash",
      "type": "phrasal"
    },
    "could": {
      "uz": "mumkin edi",
      "type": "modal"
    },
    "organize monthly concerts": {
      "uz": "har oylik konsertlar tashkil qilish",
      "type": "colloc"
    },
    "certainly": {
      "uz": "albatta",
      "type": "adv"
    },
    "would": {
      "uz": "xohlardim",
      "type": "modal"
    },
    "engaging experience": {
      "uz": "qiziqarli tajriba",
      "type": "colloc"
    },
    "bring in new members": {
      "uz": "yangi a'zolarni olib kelish",
      "type": "phrasal"
    },
    "might consider": {
      "uz": "ko'rib chiqishingiz mumkin",
      "type": "modal"
    },
    "discounted membership": {
      "uz": "chegirmali a'zolik",
      "type": "colloc"
    },
    "could help": {
      "uz": "yordam berishi mumkin",
      "type": "modal"
    },
    "keep me posted": {
      "uz": "xabardor qilib turing",
      "type": "phrasal"
    },
    "would love": {
      "uz": "juda xohlardim",
      "type": "modal"
    },
    "lay out": {
      "uz": "bayon qilmoq",
      "type": "phrasal"
    },
    "Undoubtedly": {
      "uz": "Shubhasiz",
      "type": "adv"
    },
    "cause distractions": {
      "uz": "chalg'itishga sabab bo'ladi",
      "type": "colloc"
    },
    "may end up": {
      "uz": "olib kelishi mumkin",
      "type": "phrasal"
    },
    "disrupt the learning environment": {
      "uz": "ta'lim muhitini buzadi",
      "type": "colloc"
    },
    "maintain discipline": {
      "uz": "intizomni saqlash",
      "type": "colloc"
    },
    "should": {
      "uz": "kerak",
      "type": "modal"
    },
    "valuable resource": {
      "uz": "qimmatli manba",
      "type": "colloc"
    },
    "the click of a button": {
      "uz": "bir tugmani bosish orqali",
      "type": "idiom"
    },
    "look up": {
      "uz": "qidirmoq",
      "type": "phrasal"
    },
    "engage in interactive learning": {
      "uz": "interaktiv ta'limda ishtirok etmoq",
      "type": "colloc"
    },
    "get in touch": {
      "uz": "bog'lanmoq",
      "type": "phrasal"
    },
    "All in all": {
      "uz": "Xulosa qilib aytganda",
      "type": "idiom"
    }
  }
};