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
    "p1_context": "You are a student at your college. You received this message from the librarian.",
    "p1_scenario": "Dear Students,\n\nWe are planning to make some changes in the library this term.\n\nWhat kinds of books or materials would you like us to buy? How can we make the library a better place to study? Should we organize reading events or contests?\n\nPlease share your ideas by email.\n\nThe Librarian",
    "t11": {
      "title": "Task 1.1",
      "target": "50–70 words",
      "prompt": "Write a letter to your friend, who is also a member of the library. Write about your feelings and what you think the library management should do. Write your response in about 50 words.",
      "sample": "```html\n<!DOCTYPE html>\n<html>\n<head>\n    <style>\n        .adv { color: orange; font-style: italic; }\n        .phrasal { color: green; text-decoration: underline; }\n        .colloc { color: blue; font-weight: bold; }\n        .idiom { color: purple; text-decoration: underline; }\n    </style>\n</head>\n<body>\n    <p>Hey there,</p>\n    <p>Guess what? The library's <span class=\"ml-token phrasal\">shaking things up</span> this term, and they're asking for suggestions! I'm <span class=\"ml-token adv\">honestly excited</span> about this. I reckon we <span class=\"ml-token modal\">should suggest</span> getting more <span class=\"ml-token colloc\">non-fiction reads</span>, especially on technology and history. How cool would that be? Also, it <span class=\"ml-token modal\">might be</span> great if they <span class=\"ml-token phrasal\">set up</span> more <span class=\"ml-token colloc\">quiet study zones</span>. And what do you think about some <span class=\"ml-token colloc\">reading events</span>? It'd be a <span class=\"ml-token idiom\">win-win situation</span>—more engagement, more fun!</p>\n    <p>Cheers,</p>\n    <p>[Your Name]</p>\n</body>\n</html>\n```",
      "sampleA1": "<p>Hi [Friend's Name],<br>Library change. I like books. Buy more books. Bye.</p>",
      "sampleA2": "<p>Hi [Friend's Name],<br>The library wants new books! I want more books about animals and I want more chairs because it is difficult to study. Maybe they can have a party? What do you think? Write soon.<br>Bye,<br>[Your Name]</p>",
      "sampleB1": "<p>Dear [Friend's Name],<br>Did you see the email from the library? They want our ideas! I think it would be good if they bought some new novels and maybe some magazines too. Also, the library is sometimes noisy, so perhaps they could make a quiet area for studying. What do you think about having a book club? Let me know your ideas.<br>Best,<br>[Your Name]</p>",
      "sampleB2": "<p>Hi [Friend's Name],<br>Have you seen the librarian's email about the upcoming changes? I have a few thoughts, and I'd be interested to hear yours. Firstly, I think the library should invest in a wider range of academic journals, particularly in the social sciences. Secondly, the study spaces could be improved; perhaps they could add more individual desks with power outlets. Finally, organizing regular author talks or workshops could really boost engagement. What are your views?<br>Regards,<br>[Your Name]</p>",
      "uzSample": "<p>Salom,</p>\n<p>Nima deb oʻylaysan? Kutubxona bu semestr \"shov-shuv ko'tarmoqda\" va ular takliflar so'rashyapti! Rostini aytsam, bundan juda xursandman. Menimcha, biz ko'proq badiiy bo'lmagan adabiyotlar, ayniqsa texnologiya va tarix bo'yicha kitoblar olishni taklif qilishimiz kerak. Bu qanchalik zo'r bo'lardi-a? Shuningdek, agar ular ko'proq tinch o'qish zonalarini tashkil qilishsa, juda yaxshi bo'lardi. Va siz o'qish tadbirlari haqida nima deb o'ylaysiz? Bu ikki tomon uchun ham foydali bo'lardi - ko'proq ishtirok, ko'proq qiziqarli!</p>\n<p>Xayr,</p>\n<p>[Sizning ismingiz]</p>",
      "uzSampleA1": "<p>Salom [Do'stingizning ismi],<br>Kutubxona o'zgarishi. Men kitoblarni yaxshi ko'raman. Ko'proq kitoblar sotib oling. Xayr.</p>",
      "uzSampleA2": "<p>Salom, [Do'stingizning ismi],<br>Kutubxona yangi kitoblar xohlaydi! Men hayvonlar haqida ko'proq kitoblar xohlayman va ko'proq stullar xohlayman, chunki o'qish qiyin. Balki ular ziyofat o'tkazishlari mumkin? Siz nima deb o'ylaysiz? Tezroq yozing.<br>Xayr,<br>[Sizning ismingiz]</p>",
      "uzSampleB1": "<p>Salom [Do'stingizning ismi],<br>Kutubxonadan kelgan elektron pochtani ko'rdingmi? Ular bizning fikrlarimizni so'rashyapti! Menimcha, ular yangi romanlar va balki ba'zi jurnallar ham sotib olishsa yaxshi bo'lardi. Shuningdek, kutubxona ba'zan shovqinli bo'ladi, shuning uchun ular o'qish uchun tinch joy tashkil qilishlari mumkin. Kitob klubiga ega bo'lish haqida nima deb o'ylaysan? Menga o'z fikrlaringni bildir.<br>Eng yaxshi tilaklar bilan,<br>[Sizning ismingiz]</p>",
      "uzSampleB2": "<p>Salom [Do'stingizning ismi],<br>Kutubxonachining bo'lajak o'zgarishlar haqidagi elektron pochtasini ko'rdingizmi? Menda bir nechta fikrlar bor va sizning fikringizni ham eshitishga qiziqaman. Birinchidan, menimcha, kutubxona ijtimoiy fanlar bo'yicha kengroq akademik jurnallarga sarmoya kiritishi kerak. Ikkinchidan, o'qish joylarini yaxshilash mumkin; ehtimol, ular elektr rozetkalari bilan jihozlangan ko'proq individual stollar qo'shishlari mumkin. Nihoyat, muntazam ravishda mualliflar bilan suhbatlar yoki seminarlar tashkil etish ishtirokni sezilarli darajada oshirishi mumkin. Sizning fikrlaringiz qanday?<br>Hurmat bilan,<br>[Sizning ismingiz]</p>"
    },
    "t12": {
      "title": "Task 1.2",
      "target": "120–150 words",
      "prompt": "Write a letter to the librarian. Write about your feelings and what you think the library management should do. Write your response in 120-150 words.",
      "sample": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Letter to Librarian</title>\n</head>\n<body>\n    <p>Dear Librarian,</p>\n\n    <p>I’m <span class=\"ml-token adv\">truly impressed</span> by the initiative to <span class=\"ml-token phrasal\">bring about</span> changes in our library. It's heartening to see that you're keen on making it a better place for us. In terms of books, I think expanding our <span class=\"ml-token colloc\">collection of contemporary fiction</span> and non-fiction would <span class=\"ml-token modal\">greatly</span> enrich the library's offerings. There’s an increasing interest amongst students in these genres, and keeping up with <span class=\"ml-token colloc\">literary trends</span> would be <span class=\"ml-token idiom\">a feather in our cap</span>.</p>\n\n    <p>Furthermore, to enhance our study environment, I suggest introducing more comfortable seating and perhaps creating <span class=\"ml-token colloc\">designated quiet zones</span>. This would <span class=\"ml-token phrasal\">cater to</span> different student preferences and improve overall focus.</p>\n\n    <p>Lastly, I am <span class=\"ml-token adv\">definitely supportive</span> of organizing reading events or contests. They would not only foster a <span class=\"ml-token colloc\">love of reading</span> but also build a sense of community among students. Competitions could <span class=\"ml-token phrasal\">motivate students</span> to engage more with the library's resources.</p>\n\n    <p>Thank you for considering our input. I <span class=\"ml-token modal\">hope</span> these suggestions prove helpful.</p>\n\n    <p>Warm regards,</p>\n    <p>A Concerned Student</p>\n</body>\n</html>",
      "sampleA1": "<p>Hi Librarian,<br>I like books. Buy more books. Red books are good.  I like to read here. Bye.</p>",
      "sampleA2": "<p>Hi Librarian,<br>I like the library. I want more books and magazines because I like to read.  The chairs are not good.  They are old.  Maybe new chairs?  And maybe a reading club? That would be fun. Thank you. Bye.</p>",
      "sampleB1": "<p>Dear Librarian,<br><br>I am writing to give you some ideas about the library. I think it is a good idea to make changes.  I would like to see more books, especially new books about science and technology because I am studying engineering.  Also, the library could be better if it was quieter. Sometimes it is hard to concentrate.  Maybe you could have a special quiet area? I also think reading events are a good idea.  Maybe a book club or something similar. Thank you for listening.<br><br>Sincerely,<br>A Student</p>",
      "sampleB2": "<p>Dear Librarian,<br><br>I am writing in response to your message regarding potential changes to the library. I appreciate the opportunity to provide feedback. I believe the library could benefit from an updated collection of academic journals, particularly in the fields of social sciences and humanities. Access to current research is vital for students' academic success.<br><br>Furthermore, the study environment could be improved by addressing the issue of noise levels. Implementing soundproofing measures in certain areas, or designating specific quiet zones, would create a more conducive atmosphere for focused study. Finally, I strongly support the idea of organizing reading events. Perhaps a series of author talks or themed book discussions could foster a greater sense of community and encourage wider engagement with literature. These events could also attract students who may not typically utilize the library's resources.<br><br>Thank you for considering these suggestions.<br><br>Yours sincerely,<br>A Student</p>",
      "uzSample": "<p>Hurmatli kutubxonachi,</p>\n\n<p>Kutubxonamizda o'zgarishlar qilish tashabbusingiz meni chin dildan hayratga soldi. Sizning uni biz uchun yanada yaxshi joyga aylantirishga intilayotganingizni ko'rish juda quvonarli. Kitoblar borasida, menimcha, zamonaviy badiiy va badiiy bo'lmagan adabiyotlar to'plamimizni kengaytirish kutubxonaning takliflarini sezilarli darajada boyitadi. Talabalar orasida ushbu janrlarga qiziqish ortib bormoqda va adabiy tendentsiyalardan xabardor bo'lish biz uchun katta yutuq bo'ladi.</p>\n\n<p>Bundan tashqari, o'qish muhitini yaxshilash uchun men yanada qulay o'rindiqlar qo'yishni va, ehtimol, alohida tinch zonalar yaratishni taklif qilaman. Bu talabalarning turli xil xohishlariga mos keladi va umumiy diqqatni jamlashni yaxshilaydi.</p>\n\n<p>Va nihoyat, men o'qish tadbirlari yoki tanlovlar tashkil etilishini albatta qo'llab-quvvatlayman. Ular nafaqat o'qishga muhabbatni rivojlantiradi, balki talabalar o'rtasida hamjamiyat tuyg'usini ham yaratadi. Tanlovlar talabalarni kutubxona resurslari bilan ko'proq shug'ullanishga undashi mumkin.</p>\n\n<p>Fikrimizni inobatga olganingiz uchun tashakkur. Umid qilamanki, bu takliflar foydali bo'ladi.</p>\n\n<p>Samimiy hurmat bilan,</p>\n<p>Bezg'alangan talaba</p>",
      "uzSampleA1": "<p>Salom kutubxonachi,<br>Men kitoblarni yaxshi ko'raman. Ko'proq kitob sotib oling. Qizil kitoblar yaxshi. Men bu yerda o'qishni yaxshi ko'raman. Xayr.</p>",
      "uzSampleA2": "<p>Salom Kutubxonachi,<br>Menga kutubxona yoqadi. Men ko'proq kitoblar va jurnallar xohlayman, chunki o'qishni yaxshi ko'raman. Stullar yaxshi emas. Ular eski. Balki yangi stullar kerakdir? Va balki o'quv klubi kerakdir? Bu qiziqarli bo'lardi. Rahmat. Xayr.</p>",
      "uzSampleB1": "<p>Hurmatli kutubxonachi,<br><br>Sizga kutubxona haqida ba'zi fikrlarimni bildirish uchun yozyapman. O'zgarishlar qilish yaxshi fikr deb o'ylayman. Men ko'proq kitoblar, ayniqsa fan va texnologiya haqidagi yangi kitoblarni ko'rishni xohlayman, chunki men muhandislik bo'yicha o'qiyapman. Shuningdek, kutubxona tinchroq bo'lsa, yaxshiroq bo'lardi. Ba'zan diqqatni jamlash qiyin. Ehtimol, sizda maxsus tinch zona bo'lishi mumkin? Menimcha, kitob o'qish tadbirlari ham yaxshi fikr. Ehtimol, kitob klubi yoki shunga o'xshash narsa. E'tiboringiz uchun rahmat.<br><br>Hurmat bilan,<br>Talaba</p>",
      "uzSampleB2": "<p>Hurmatli kutubxonachi,<br><br>Men kutubxonadagi ehtimoliy o'zgarishlar haqidagi xabaringizga javoban yozyapman. Fikr bildirish imkoniyati uchun minnatdorman. Menimcha, kutubxona, ayniqsa ijtimoiy fanlar va gumanitar fanlar sohalarida, akademik jurnallarning yangilangan to'plamidan foyda ko'rishi mumkin. Talabalarning akademik muvaffaqiyati uchun dolzarb tadqiqotlarga kirish juda muhim.<br><br>Bundan tashqari, shovqin darajasi muammosini hal qilish orqali o'qish muhitini yaxshilash mumkin. Muayyan joylarda ovoz o'tkazmaslik choralarini ko'rish yoki maxsus tinch zonalarini belgilash, diqqatni jamlab o'qish uchun qulayroq muhit yaratadi. Nihoyat, men o'qish tadbirlarini tashkil etish g'oyasini qat'iy qo'llab-quvvatlayman. Ehtimol, mualliflar bilan suhbatlar yoki tematik kitob muhokamalari seriyasi hamjamiyat tuyg'usini kuchaytirishi va adabiyotga kengroq jalb qilishga yordam berishi mumkin. Ushbu tadbirlar odatda kutubxona resurslaridan foydalanmaydigan talabalarni ham jalb qilishi mumkin.<br><br>Ushbu takliflarni ko'rib chiqayotganingiz uchun tashakkur.<br><br>Hurmat bilan,<br>Talaba</p>"
    },
    "t2": {
      "title": "Task 2",
      "target": "180–200 words",
      "prompt": "On Facebook, you read a post about television and movies, and decided to express your opinion. The topic is: “How do movies or television influence people's behaviour?”\n\nWrite your response, giving reasons and examples. Write 180-200 words.",
      "sample": "```html\n<div class=\"forum-post\">\n    <p>Hey everyone,</p>\n    <p>I wanted to chime in on this interesting topic about movies and TV shows and their impact on our behavior. I've got to say, there's definitely a strong <span class=\"ml-token colloc\">influence on people's</span> habits and mindsets, and I've noticed it quite a bit myself. For starters, these forms of media can significantly shape our perspectives. Take a gripping documentary; it <span class=\"ml-token phrasal\">opens our eyes</span> to issues we might never have considered. I remember watching a series about environmental conservation. It <span class=\"ml-token phrasal\">changed my habits</span> overnight—I started recycling and using less plastic. I mean, talk about an immediate impact!</p>\n    <p>Moreover, the way TV shows and films <span class=\"ml-token colloc\">portray relationships</span> and social norms can often <span class=\"ml-token phrasal\">lead to</span> shifts in how we view our personal lives. Romantic comedies, for instance, sometimes set unrealistic expectations about love. As a result, people might feel pressured to mimic these on-screen romances, which isn't always healthy. On the flip side, seeing strong, independent characters can <span class=\"ml-token phrasal\">boost one's confidence</span>.</p>\n    <p>Finally, let's not forget about the influence on language and fashion. Popular shows often introduce new lingo or trends that quickly become part of our daily lives. So, while movies and TV can be a source of entertainment, their power to <span class=\"ml-token colloc\">shape behaviors</span> and attitudes is undeniable. What does everyone else think?</p>\n    <p>Cheers,</p>\n    <p>A TV Enthusiast</p>\n</div>\n```",
      "sampleA1": "<p>Hi! Movies good. TV good. I like movies. I like TV. People watch TV. People watch movies. I think TV is fun. Bye!</p>",
      "sampleA2": "<p>Hello. I like TV and movies. I think TV and movies are good. My friends like TV and movies too. They watch TV and movies every day. I think movies can change people because they see new things. But TV is just fun. I like to watch comedies because they are funny.</p>",
      "sampleB1": "<p>Hi everyone,<br>I want to say something about movies and television. I think they can change how people act. For example, if you watch a movie about being kind, you might be kinder to others. Also, TV shows can show us different ways of living. I saw a show about people helping animals, and I started to volunteer at an animal shelter. However, sometimes movies and TV can show bad things, and that's not good. In my opinion, it depends on what you watch. We should watch things that make us better people. What do you think?</p>",
      "sampleB2": "<p>Hi everyone,<br>I'd like to share my thoughts on how movies and television influence behavior. I believe they have a considerable impact, shaping our perceptions and even driving our actions. For instance, documentaries can expose us to realities we might otherwise ignore, prompting changes in our lifestyles. I recall watching a film about fast fashion and its environmental consequences, which led me to reconsider my shopping habits.<br>Furthermore, the characters we see on screen often serve as role models, both positive and negative. If a movie portrays a character overcoming adversity through hard work and determination, it can inspire viewers to persevere in their own lives. Conversely, the glamorization of unhealthy behaviors in certain shows can normalize those behaviors for some audiences.<br>In conclusion, while movies and television can be entertaining and informative, it's crucial to be aware of their potential influence on our behavior. Critical viewing and thoughtful reflection are essential to ensure that we're not passively absorbing potentially harmful messages. What are your thoughts on this?</p>",
      "uzSample": "<p>Hammaga salom,</p>\n<p>Men kino va teleseriallar hamda ularning xulq-atvorimizga ta'siri haqidagi ushbu qiziqarli mavzuga o'z fikrimni qo'shmoqchiman. Shuni aytishim kerakki, ularning odamlarning odatlari va dunyoqarashiga ta'siri juda kuchli va men buni o'zimda ham sezganman. Avvalo, bu media shakllari bizning nuqtai nazarimizni sezilarli darajada shakllantirishi mumkin. Birorta hayajonli hujjatli filmni olaylik; u biz hech qachon o'ylamagan muammolarga ko'zimizni ochadi. Esimda, atrof-muhitni muhofaza qilish haqida bir serial ko'rgan edim. U mening odatlarimni bir kechada o'zgartirdi — men qayta ishlashni boshladim va plastikdan kamroq foydalandim. Aytmoqchimanki, bu darhol ta'sir!</p>\n<p>Bundan tashqari, teleseriallar va filmlar munosabatlar va ijtimoiy me'yorlarni tasvirlash usuli ko'pincha shaxsiy hayotimizga bo'lgan qarashlarimizning o'zgarishiga olib kelishi mumkin. Masalan, romantik komediyalar ba'zan sevgi haqida noreal kutishlarni keltirib chiqaradi. Natijada, odamlar ekrandagi romantikani takrorlashga majbur bo'lishi mumkin, bu har doim ham sog'lom emas. Boshqa tomondan, kuchli, mustaqil personajlarni ko'rish o'ziga bo'lgan ishonchni oshirishi mumkin.</p>\n<p>Va nihoyat, til va moda ta'sirini unutmaylik. Ommabop seriallar ko'pincha yangi jargon yoki trendlarni taqdim etadi, ular tezda kundalik hayotimizning bir qismiga aylanadi. Shunday qilib, kino va televideniye ko'ngilochar manba bo'lishi bilan birga, ularning xatti-harakatlar va munosabatlarni shakllantirish kuchi inkor etib bo'lmaydi. Boshqalar nima deb o'ylaydi?</p>\n<p>Xayr,</p>\n<p>Televideniye ishqibozi</p>",
      "uzSampleA1": "<p>Salom! Kinolar yaxshi. Televizor yaxshi. Menga kinolar yoqadi. Menga televizor yoqadi. Odamlar televizor ko'radi. Odamlar kino ko'radi. Men o'ylaymanki, televizor qiziqarli. Xayr!</p>",
      "uzSampleA2": "<p>Salom. Men televizor va kinolarni yaxshi ko'raman. Menimcha, televizor va kinolar yaxshi. Mening do'stlarim ham televizor va kinolarni yaxshi ko'rishadi. Ular har kuni televizor va kino ko'rishadi. Menimcha, kinolar odamlarni o'zgartirishi mumkin, chunki ular yangi narsalarni ko'rishadi. Lekin televizor shunchaki qiziqarli. Men komediyalarni ko'rishni yaxshi ko'raman, chunki ular kulguli.</p>",
      "uzSampleB1": "<p>Hammaga salom,<br>Men kino va televideniye haqida bir narsa demoqchiman. Menimcha, ular odamlarning xatti-harakatlarini o'zgartirishi mumkin. Misol uchun, agar siz mehribon bo'lish haqida film ko'rsangiz, boshqalarga nisbatan mehribonroq bo'lishingiz mumkin. Shuningdek, teleshoular bizga turli xil hayot tarzlarini ko'rsatishi mumkin. Men hayvonlarga yordam berayotgan odamlar haqida bir ko'rsatuvni ko'rdim va hayvonlar boshpanasida ko'ngilli bo'lib ishlay boshladim. Biroq, ba'zida kino va televideniye yomon narsalarni ko'rsatishi mumkin va bu yaxshi emas. Mening fikrimcha, bu sizning nimani tomosha qilishingizga bog'liq. Bizni yaxshiroq inson qiladigan narsalarni tomosha qilishimiz kerak. Siz nima deb o'ylaysiz?</p>",
      "uzSampleB2": "<p>Hammaga salom,<br>Men kino va televideniyaning odamlarning xulq-atvoriga qanday ta'sir qilishi haqida o'z fikrlarimni baham ko'rmoqchiman. Menimcha, ularning ta'siri juda katta, ular bizning dunyoqarashimizni shakllantiradi va hatto harakatlarimizni ham boshqaradi. Misol uchun, hujjatli filmlar bizni boshqa paytlarda e'tibor bermasligimiz mumkin bo'lgan voqeliklar bilan tanishtirishi va turmush tarzimizda o'zgarishlarga olib kelishi mumkin. Men tez moda va uning atrof-muhitga ta'siri haqidagi filmni tomosha qilganim esimda, bu meni xarid qilish odatlarimni qayta ko'rib chiqishga undadi.<br>Bundan tashqari, ekranda ko'rgan qahramonlarimiz ko'pincha ijobiy va salbiy namuna bo'lib xizmat qiladi. Agar filmda qiyinchiliklarni mehnat va qat'iyatlilik orqali yengib o'tgan qahramon tasvirlansa, bu tomoshabinlarni o'z hayotida davom etishga ilhomlantirishi mumkin. Aksincha, ba'zi ko'rsatuvlarda nosog'lom xatti-harakatlarning jozibador qilib ko'rsatilishi ba'zi tomoshabinlar uchun bu xatti-harakatlarni normallashtirishi mumkin.<br>Xulosa qilib aytganda, kino va televidenie ko'ngilochar va ma'lumot beruvchi bo'lishi mumkin bo'lsa-da, ularning xatti-harakatlarimizga potentsial ta'siridan xabardor bo'lish juda muhim. Tanqidiy ko'rish va chuqur mulohaza yuritish biz potentsial zararli xabarlarni passiv ravishda o'zlashtirmasligimizni ta'minlash uchun zarurdir. Bu haqda sizning fikrlaringiz qanday?</p>"
    }
  },
  "vocabulary": {
    "task11": [
      {
        "en": "Hey buddy!",
        "uz": "Salom do'stim!"
      },
      {
        "en": "I'm really excited",
        "uz": "Men juda hayajonlandim"
      },
      {
        "en": "library updates",
        "uz": "kutubxona yangiliklari"
      },
      {
        "en": "more comfy chairs",
        "uz": "ko'proq qulay stullar"
      },
      {
        "en": "chill zone",
        "uz": "dam olish zonasi"
      },
      {
        "en": "grab some new books",
        "uz": "yangi kitoblar olish"
      },
      {
        "en": "study vibes",
        "uz": "o'qish muhitlari"
      },
      {
        "en": "book contests",
        "uz": "kitob tanlovlari"
      },
      {
        "en": "read-a-thon",
        "uz": "o'qish marafoni"
      },
      {
        "en": "cozy spots",
        "uz": "qulay joylar"
      },
      {
        "en": "snack corner",
        "uz": "atirlar burchagi"
      },
      {
        "en": "extra outlets",
        "uz": "qo'shimcha rozetkalar"
      },
      {
        "en": "reading events",
        "uz": "o'qish tadbirlari"
      },
      {
        "en": "better lighting",
        "uz": "yaxshi yoritish"
      },
      {
        "en": "fun activities",
        "uz": "qiziqarli faoliyatlar"
      },
      {
        "en": "catch up soon",
        "uz": "yaqinda ko'rishamiz"
      }
    ],
    "task12": [
      {
        "en": "Dear Librarian,",
        "uz": "Hurmatli Kutubxonachi,"
      },
      {
        "en": "I am writing to express",
        "uz": "Men ifoda etmoqchiman"
      },
      {
        "en": "enhancing the library experience",
        "uz": "kutubxona tajribasini yaxshilash"
      },
      {
        "en": "consider acquiring",
        "uz": "sotib olishni ko'rib chiqing"
      },
      {
        "en": "latest publications",
        "uz": "so'nggi nashrlar"
      },
      {
        "en": "academic resources",
        "uz": "akademik manbalar"
      },
      {
        "en": "improve study environment",
        "uz": "o'qish muhitini yaxshilash"
      },
      {
        "en": "comfortable seating arrangements",
        "uz": "qulay o'tirish tartiblari"
      },
      {
        "en": "host interactive events",
        "uz": "interaktiv tadbirlar o'tkazish"
      },
      {
        "en": "reading challenges",
        "uz": "o'qish sinovlari"
      },
      {
        "en": "broaden our horizons",
        "uz": "dunyoqarashimizni kengaytirish"
      },
      {
        "en": "quiet study areas",
        "uz": "jim o'qish joylari"
      },
      {
        "en": "additional power outlets",
        "uz": "qo'shimcha quvvat rozetkalar"
      },
      {
        "en": "aesthetic improvements",
        "uz": "estetik yaxshilanishlar"
      },
      {
        "en": "foster a love for reading",
        "uz": "o'qishga muhabbatni rivojlantirish"
      },
      {
        "en": "sincerely",
        "uz": "samimiyat bilan"
      }
    ],
    "task2": [
      {
        "en": "media influence",
        "uz": "omma ta'siri"
      },
      {
        "en": "social behavior",
        "uz": "ijtimoiy xulq"
      },
      {
        "en": "role models",
        "uz": "o'rnak bo'ladigan shaxslar"
      },
      {
        "en": "depict lifestyles",
        "uz": "turmush tarzini tasvirlash"
      },
      {
        "en": "affect perceptions",
        "uz": "tushunchalarga ta'sir qilish"
      },
      {
        "en": "emotional impact",
        "uz": "emotsional ta'sir"
      },
      {
        "en": "shaping attitudes",
        "uz": "munosabatlarni shakllantirish"
      },
      {
        "en": "influence trends",
        "uz": "tendentsiyalarga ta'sir qilish"
      },
      {
        "en": "cultural norms",
        "uz": "madaniy me'yorlar"
      },
      {
        "en": "behavioral patterns",
        "uz": "xulq-atvor turlari"
      },
      {
        "en": "representation",
        "uz": "vakillik"
      },
      {
        "en": "engage audiences",
        "uz": "tomoshabinlarni jalb qilish"
      },
      {
        "en": "drive consumer habits",
        "uz": "iste'mol odatlarini boshqarish"
      },
      {
        "en": "persuasive narratives",
        "uz": "ishonchli hikoyalar"
      },
      {
        "en": "critical thinking",
        "uz": "tanqidiy fikrlash"
      },
      {
        "en": "inform public opinion",
        "uz": "jamoat fikrini shakllantirish"
      },
      {
        "en": "visual storytelling",
        "uz": "vizual hikoya qilish"
      },
      {
        "en": "construct reality",
        "uz": "haqiqatni qurish"
      },
      {
        "en": "entertainment value",
        "uz": "ko'ngilochar qiymat"
      },
      {
        "en": "media literacy",
        "uz": "omma savodxonligi"
      }
    ]
  },
  "tokenTranslations": {
    "shaking things up": {
      "uz": "o'zgarishlar qilish",
      "type": "phrasal"
    },
    "honestly excited": {
      "uz": "chin dildan hayajonlangan",
      "type": "adv"
    },
    "should suggest": {
      "uz": "tavsiya qilish kerak",
      "type": "modal"
    },
    "non-fiction reads": {
      "uz": "badiiy bo'lmagan asarlar",
      "type": "colloc"
    },
    "might be": {
      "uz": "bo'lishi mumkin",
      "type": "modal"
    },
    "set up": {
      "uz": "tashkil etmoq",
      "type": "phrasal"
    },
    "quiet study zones": {
      "uz": "jim o'qish joylari",
      "type": "colloc"
    },
    "reading events": {
      "uz": "kitobxonlik tadbirlari",
      "type": "colloc"
    },
    "win-win situation": {
      "uz": "ikki tomon uchun ham foydali vaziyat",
      "type": "idiom"
    },
    "truly impressed": {
      "uz": "chindan ta'sirlangan",
      "type": "adv"
    },
    "bring about": {
      "uz": "amalga oshirmoq",
      "type": "phrasal"
    },
    "collection of contemporary fiction": {
      "uz": "zamonaviy adabiyotlar to'plami",
      "type": "colloc"
    },
    "greatly": {
      "uz": "juda katta",
      "type": "modal"
    },
    "literary trends": {
      "uz": "adabiy tendensiyalar",
      "type": "colloc"
    },
    "a feather in our cap": {
      "uz": "biz uchun faxr",
      "type": "idiom"
    },
    "designated quiet zones": {
      "uz": "ajratilgan jim zonalar",
      "type": "colloc"
    },
    "cater to": {
      "uz": "xizmat ko'rsatmoq",
      "type": "phrasal"
    },
    "definitely supportive": {
      "uz": "albatta qo'llab-quvvatlovchi",
      "type": "adv"
    },
    "love of reading": {
      "uz": "kitobga muhabbat",
      "type": "colloc"
    },
    "motivate students": {
      "uz": "talabalarni rag'batlantirmoq",
      "type": "phrasal"
    },
    "hope": {
      "uz": "umid qilaman",
      "type": "modal"
    },
    "influence on people's": {
      "uz": "odamlarning ...ga ta'siri",
      "type": "colloc"
    },
    "opens our eyes": {
      "uz": "ko'zimizni ochadi",
      "type": "phrasal"
    },
    "changed my habits": {
      "uz": "odatlarimni o'zgartirdi",
      "type": "phrasal"
    },
    "portray relationships": {
      "uz": "munosabatlarni tasvirlamoq",
      "type": "colloc"
    },
    "lead to": {
      "uz": "olib kelmoq",
      "type": "phrasal"
    },
    "boost one's confidence": {
      "uz": "o'ziga bo'lgan ishonchni oshirmoq",
      "type": "phrasal"
    },
    "shape behaviors": {
      "uz": "xulq-atvorni shakllantirmoq",
      "type": "colloc"
    }
  }
};