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
    "p1_context": "You are a university student who has completed a course.",
    "p1_scenario": "Dear Students,\n\nAs the semester ends, we would like your feedback on the course. How did you find the course materials and lecture style? Was the workload manageable? What suggestions do you have for improving the course?\n\nThe Course Coordinator",
    "t11": {
      "title": "Task 1.1",
      "target": "50 words",
      "prompt": "Write a message to a classmate about the feedback request. Share your thoughts on the course.",
      "sample": "Hey!\n\nDid you get the <span class=\"ml-token colloc\">feedback request</span>? I thought the <span class=\"ml-token colloc\">lectures</span> were <span class=\"ml-token adv\">really</span> interesting, but the <span class=\"ml-token colloc\">workload</span> was a bit heavy! I think they <span class=\"ml-token modal\">should</span> add more <span class=\"ml-token colloc\">practical examples</span>. What <span class=\"ml-token modal\">would</span> you tell them?\n\nLet's compare notes!",
      "sampleA1": "<p>Hi! <br>Class finish! Good? I think so. <br>Teacher ask feedback. I say good. Book good. <br>Bye!</p>",
      "sampleA2": "<p>Hi! <br>Did you see the email about the course? <br>I liked the class, but it was hard. The homework was a lot. <br>What do you think? Tell me! <br>Bye!</p>",
      "sampleB1": "<p>Hey!<br>Did you see the email asking for feedback on the course? <br>I thought the lectures were quite interesting, but the workload was a bit much, especially towards the end. I think it would be better if they spread out the assignments more evenly. <br>What are your thoughts? What are you going to say?<br>Let me know!</p>",
      "sampleB2": "<p>Hi!<br>Have you had a chance to look at the feedback request for the course? I'm trying to formulate my response. <br>Personally, I found the lecture content engaging and thought-provoking, although the sheer volume of reading each week was occasionally overwhelming. I'm considering suggesting they incorporate more interactive elements, perhaps smaller group discussions, to consolidate the material. Also, a clearer alignment between the assessment criteria and the lecture content would be beneficial.<br>What are your initial impressions? Perhaps we could compare notes before submitting our feedback.</p>"
    },
    "t12": {
      "title": "Task 1.2",
      "target": "120–150 words",
      "prompt": "Write a letter to the Course Coordinator with your feedback and suggestions.",
      "sample": "<p>Dear Course Coordinator,</p>\n\n<p>Thank you for seeking student feedback. I am pleased to share my thoughts on the course.</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, the <span class=\"ml-token colloc\">course materials</span> were <span class=\"ml-token adv\">exceptionally</span> well-prepared and <span class=\"ml-token colloc\">comprehensive</span>. The textbook and <span class=\"ml-token colloc\">online resources</span> complemented each other <span class=\"ml-token adv\">effectively</span>.</p>\n\n<p><span class=\"ml-token adv\">However</span>, I found the <span class=\"ml-token colloc\">workload</span> <span class=\"ml-token adv\">somewhat</span> demanding, particularly when assignments coincided with <span class=\"ml-token colloc\">midterm exams</span>. Spreading deadlines more evenly <span class=\"ml-token modal\">would</span> help students manage their time better.</p>\n\n<p><span class=\"ml-token adv\">Additionally</span>, I <span class=\"ml-token modal\">would</span> suggest incorporating more <span class=\"ml-token colloc\">real-world case studies</span>. This <span class=\"ml-token modal\">would</span> help students see the <span class=\"ml-token colloc\">practical applications</span> of theoretical concepts.</p>\n\n<p><span class=\"ml-token adv\">Finally</span>, more <span class=\"ml-token colloc\">interactive elements</span> like group discussions <span class=\"ml-token modal\">could</span> enhance <span class=\"ml-token colloc\">student engagement</span>.</p>\n\n<p>Thank you for your dedication to improving the course.</p>\n\n<p>Yours sincerely,<br>A Dedicated Student</p>",
      "sampleA1": "<p>Hi!<br>The course is good. I like the book. It is hard. I need help. Thank you.<br>Bye</p>",
      "sampleA2": "<p>Hi,<br>I liked the course. The book was good, and the teacher was nice. But the homework was a lot, and it was difficult sometimes. I think maybe less homework would be better. Thank you for the course.<br>Bye</p>",
      "sampleB1": "<p>Dear Course Coordinator,<br>I am writing to give you feedback on the course. Overall, I enjoyed the course and I learned a lot. I thought the materials were good and the lectures were interesting. However, I think the workload was quite heavy, especially with the assignments and exams. It was difficult to manage my time. I also think it would be helpful to have more examples in the lectures to understand the topics better. For example, real-life examples would be great. Thank you for the course.<br>Sincerely,<br>A Student</p>",
      "sampleB2": "<p>Dear Course Coordinator,<br>I am writing to provide feedback on the recently completed course. I found the course content to be generally well-structured and engaging. The lectures were informative, and the supplementary materials were helpful in reinforcing key concepts. However, I believe there are areas where the course could be improved.<br>Firstly, the workload, while challenging, occasionally felt disproportionate. The frequency of assignments, particularly those coinciding with examination periods, placed considerable strain on students. Perhaps a more staggered distribution of deadlines would alleviate this issue.<br>Secondly, while the theoretical foundations were thoroughly covered, I suggest incorporating more practical applications. Including real-world examples or case studies would enhance the students' understanding of how the concepts apply in professional settings. This would make the course even more valuable.<br>Thank you for considering my feedback.<br>Yours sincerely,<br>A Student</p>"
    },
    "t2": {
      "title": "Task 2",
      "target": "180–200 words",
      "prompt": "A student magazine announced an article writing contest. The best ones will be published in the magazine. Write your article on this topic: \"Is it better to travel abroad or explore your own country?\" Write 180–200 words, giving reasons and examples.",
      "sample": "<h2>The Art of the Effective Lecture: What Works for Students</h2>\n\n<p>Having attended countless lectures, I've noticed that some professors <span class=\"ml-token adv\">genuinely</span> engage students while others struggle to hold attention. What makes the difference?</p>\n\n<p><span class=\"ml-token adv\">Firstly</span>, <span class=\"ml-token colloc\">clear structure</span> is essential. Effective lecturers begin with an <span class=\"ml-token colloc\">outline</span>, making it easy for students to follow the flow of ideas. They also summarize <span class=\"ml-token colloc\">key points</span> at the end.</p>\n\n<p><span class=\"ml-token adv\">Moreover</span>, the best lecturers use <span class=\"ml-token colloc\">real-world examples</span> to illustrate abstract concepts. When theory connects to <span class=\"ml-token colloc\">practical situations</span>, understanding deepens.</p>\n\n<p><span class=\"ml-token adv\">Additionally</span>, <span class=\"ml-token colloc\">interaction</span> is crucial. Lectures that include questions, discussions, or <span class=\"ml-token colloc\">quick polls</span> keep students <span class=\"ml-token colloc\">mentally active</span> rather than passively listening.</p>\n\n<p><span class=\"ml-token adv\">Furthermore</span>, <span class=\"ml-token colloc\">enthusiasm</span> is contagious. Professors who show genuine passion for their subject inspire students to <span class=\"ml-token colloc\">engage more deeply</span>.</p>\n\n<p><span class=\"ml-token adv\">Ultimately</span>, an effective lecture combines <span class=\"ml-token colloc\">organization</span>, <span class=\"ml-token colloc\">relevance</span>, <span class=\"ml-token colloc\">interaction</span>, and <span class=\"ml-token colloc\">passion</span>. While content matters, <span class=\"ml-token colloc\">delivery</span> often determines whether students <span class=\"ml-token adv\">truly</span> learn.</p>",
      "sampleA1": "<p>Hi!<br>The class is okay. The books are okay. I like the teacher. It is hard. I need help. Bye!</p>",
      "sampleA2": "<p>Hi,<br>I like the class, and the teacher is good. But the books are difficult, and there is too much homework. I think the class is interesting, but I need more time. I like the lectures because they are fun. Maybe less homework is better. Bye!</p>",
      "sampleB1": "<p>Dear Editor,<br>I'm writing about whether it's better to travel abroad or explore your own country. I think both are good, but I prefer to explore my own country. <br><br>Firstly, it's cheaper. Traveling abroad can be very expensive, but exploring my own country is usually more affordable. For example, I can visit national parks or historical sites without spending a lot of money. <br><br>Secondly, it's easier to understand the culture. When you travel abroad, there can be language barriers and cultural differences. In my own country, I already understand the language and customs. <br><br>However, I understand that traveling abroad is exciting and can be a great experience. But for me, exploring my own country is a better choice. <br><br>Sincerely,<br>A Student</p>",
      "sampleB2": "<p>Dear Editor,<br>I am writing to express my perspective on the age-old debate: is it more advantageous to travel abroad or to delve into the wonders of one's own nation? While both options offer unique benefits, I lean towards the latter, believing that exploring one's own country often provides a more profound and accessible experience.<br><br>Firstly, the financial aspect cannot be ignored. International travel often entails significant expenses, including flights, accommodation, and visa fees. Conversely, exploring local destinations tends to be considerably more budget-friendly, allowing for more frequent and extensive travel experiences within the same financial constraints. For instance, instead of a single expensive trip to Europe, one could embark on several shorter, more immersive journeys to different regions within their own country.<br><br>Secondly, exploring one's own country fosters a deeper understanding of its history, culture, and diversity. It provides an opportunity to connect with local communities, learn about regional traditions, and appreciate the nuances that make the nation unique. While experiencing foreign cultures is undoubtedly enriching, neglecting the cultural tapestry of one's own country seems like a missed opportunity. Furthermore, it allows one to engage with the issues and challenges facing different regions, fostering a sense of civic responsibility.<br><br>Of course, international travel offers unparalleled opportunities for personal growth and broadening one's horizons. However, the value of exploring and appreciating the rich heritage and diverse landscapes within one's own country should not be underestimated. It is an accessible and rewarding way to deepen one's understanding of the world and one's place within it.<br><br>Yours sincerely,<br>A Student</p>"
    }
  },
  "vocabulary": {
    "task11": [
      {
        "en": "feedback request",
        "uz": "fikr-mulohaza so'rovi"
      },
      {
        "en": "really interesting",
        "uz": "juda qiziqarli"
      },
      {
        "en": "workload",
        "uz": "ish yuki"
      },
      {
        "en": "bit heavy",
        "uz": "biroz og'ir"
      },
      {
        "en": "practical examples",
        "uz": "amaliy misollar"
      },
      {
        "en": "let's compare notes",
        "uz": "yozuvlarimizni solishtiraylik"
      },
      {
        "en": "final exam",
        "uz": "yakuniy imtihon"
      },
      {
        "en": "course content",
        "uz": "kurs tarkibi"
      },
      {
        "en": "study materials",
        "uz": "o'quv materiallari"
      },
      {
        "en": "pretty good",
        "uz": "ancha yaxshi"
      },
      {
        "en": "what would you tell",
        "uz": "nima deb aytardingiz"
      },
      {
        "en": "hard assignments",
        "uz": "qiyin topshiriqlar"
      },
      {
        "en": "good lectures",
        "uz": "yaxshi ma'ruzalar"
      },
      {
        "en": "boring parts",
        "uz": "zerikarli qismlar"
      },
      {
        "en": "learned a lot",
        "uz": "ko'p o'rgandim"
      },
      {
        "en": "need more time",
        "uz": "ko'proq vaqt kerak"
      },
      {
        "en": "helpful teacher",
        "uz": "foydali o'qituvchi"
      },
      {
        "en": "tough course",
        "uz": "qiyin kurs"
      },
      {
        "en": "let me know",
        "uz": "menga ayting"
      },
      {
        "en": "talk later",
        "uz": "keyinroq gaplashamiz"
      }
    ],
    "task12": [
      {
        "en": "seeking student feedback",
        "uz": "talaba fikrini so'ramoq"
      },
      {
        "en": "course materials",
        "uz": "kurs materiallari"
      },
      {
        "en": "exceptionally well-prepared",
        "uz": "nihoyatda yaxshi tayyorlangan"
      },
      {
        "en": "comprehensive",
        "uz": "to'liq"
      },
      {
        "en": "online resources",
        "uz": "onlayn resurslar"
      },
      {
        "en": "workload demanding",
        "uz": "ish yuki og'ir"
      },
      {
        "en": "midterm exams",
        "uz": "oraliq imtihonlar"
      },
      {
        "en": "spreading deadlines",
        "uz": "muddatlarni tarqatish"
      },
      {
        "en": "real-world case studies",
        "uz": "real dunyo tadqiqotlari"
      },
      {
        "en": "practical applications",
        "uz": "amaliy qo'llanmalar"
      },
      {
        "en": "theoretical concepts",
        "uz": "nazariy tushunchalar"
      },
      {
        "en": "interactive elements",
        "uz": "interaktiv elementlar"
      },
      {
        "en": "student engagement",
        "uz": "talaba jalb qilinishi"
      },
      {
        "en": "dedication to improvement",
        "uz": "yaxshilashga bag'ishlanganlik"
      },
      {
        "en": "dedicated student",
        "uz": "sodiq talaba"
      },
      {
        "en": "yours sincerely",
        "uz": "hurmat bilan"
      },
      {
        "en": "complemented effectively",
        "uz": "samarali to'ldirdi"
      },
      {
        "en": "manage time better",
        "uz": "vaqtni yaxshiroq boshqarish"
      },
      {
        "en": "group discussions",
        "uz": "guruh munozaralari"
      },
      {
        "en": "enhance learning",
        "uz": "o'qishni yaxshilamoq"
      }
    ],
    "task2": [
      {
        "en": "effective lecture",
        "uz": "samarali ma'ruza"
      },
      {
        "en": "engage students",
        "uz": "talabalarni jalb qilmoq"
      },
      {
        "en": "hold attention",
        "uz": "e'tiborni ushlab turmoq"
      },
      {
        "en": "clear structure",
        "uz": "aniq tuzilma"
      },
      {
        "en": "outline",
        "uz": "konspekt"
      },
      {
        "en": "key points",
        "uz": "asosiy fikrlar"
      },
      {
        "en": "real-world examples",
        "uz": "real dunyo misollari"
      },
      {
        "en": "abstract concepts",
        "uz": "mavhum tushunchalar"
      },
      {
        "en": "practical situations",
        "uz": "amaliy vaziyatlar"
      },
      {
        "en": "interaction",
        "uz": "o'zaro ta'sir"
      },
      {
        "en": "quick polls",
        "uz": "tezkor so'rovnomalar"
      },
      {
        "en": "mentally active",
        "uz": "aqliy faol"
      },
      {
        "en": "enthusiasm",
        "uz": "ishtiyoq"
      },
      {
        "en": "engage more deeply",
        "uz": "chuqurroq jalb bo'lmoq"
      },
      {
        "en": "organization",
        "uz": "tashkilotchilik"
      },
      {
        "en": "relevance",
        "uz": "dolzarblik"
      },
      {
        "en": "passion",
        "uz": "ehtiros"
      },
      {
        "en": "delivery",
        "uz": "taqdimot"
      },
      {
        "en": "truly learn",
        "uz": "haqiqatan o'rganmoq"
      },
      {
        "en": "content matters",
        "uz": "kontent muhim"
      }
    ]
  }
};
