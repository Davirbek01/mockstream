// Add Q16 and Q17 to mocks 21 and 22.
// Strategy: build each question object in JS (no escaping pain), JSON.stringify
// with 2-space indent, re-indent to match the file's 4-space array level, and
// splice in before the closing `]` of the questions array.

const fs = require('fs');
const path = require('path');

const FILE21 = path.join(__dirname, 'site', 'questions IELTS S', 'ielts-speaking-mock-21.js');
const FILE22 = path.join(__dirname, 'site', 'questions IELTS S', 'ielts-speaking-mock-22.js');

// ---------- helpers ----------
const span = (cls, text) => `<span class="ml-token ${cls}">${text}</span>`;
const partThree = (number, prompt, content) => ({
  number,
  part: 'Part 3',
  badge: '45s',
  prepTime: 7,
  speakTime: 45,
  prompt,
  audioFile: '', // TTS fallback will generate at runtime
  ...content,
});

// ============================================================================
// MOCK 21
// ============================================================================
const M21Q16 = partThree(16,
  'How important is it to preserve natural beauty as cities continue to expand?',
  {
    sampleAnswer: "Preserving natural beauty as cities expand is, in my view, of paramount importance—not merely for aesthetic reasons but for ecological, psychological, and economic ones. As urban areas grow, they often encroach on forests, wetlands, and coastal zones, leading to habitat destruction and a sharp loss of biodiversity. From a human standpoint, green spaces have been consistently shown to improve mental well-being, reduce stress, and foster a sense of community. Cities like Singapore and Vienna demonstrate that high density and natural beauty are not mutually exclusive—through careful planning, green corridors, and protected reserves, urbanisation and nature can coexist. Economically, preserving natural assets also boosts tourism and raises property values. So while expansion is often inevitable in growing economies, doing so without safeguarding natural environments is short-sighted. The real challenge for policymakers is to strike a sustainable balance that allows cities to thrive without compromising the ecosystems that ultimately sustain them.",
    vocabulary: {
      title: 'Q16 - Preserving Natural Beauty Amid Urban Expansion',
      sentenceStarters: [
        'Preserving natural beauty is of paramount importance...',
        'As urban areas expand, they often encroach on...',
        'Cities like Singapore demonstrate that...',
      ],
      phrases: [
        'paramount importance',
        'encroach on',
        'habitat destruction',
        'loss of biodiversity',
        'green corridors',
        'mutually exclusive',
        'sustainable balance',
        'urban planning',
        'natural assets',
        'mental well-being',
        'high density',
        'short-sighted',
        'safeguard natural environments',
      ],
      idioms: [
        'strike a balance',
        'pay the price',
        'at the expense of',
      ],
    },
    sampleBand5: "I think it's important. Cities have many buildings and people need nature too. Without nature, cities are not nice. We should keep parks and trees. People feel happy when they see green.",
    sampleBand6: "I think it's quite important. Many cities are growing too fast and they're cutting down trees. People need green spaces to relax, and animals need places to live. Cities should plan better and keep parks and forests, otherwise everything becomes just concrete and that's not good for our health.",
    sampleBand7: `It's ${span('adv', 'incredibly')} important, in my opinion. As cities expand, they often consume natural land, which leads to environmental damage and the loss of green spaces. People in cities need contact with nature for their mental health and ${span('colloc', 'quality of life')}. I think governments should make sure urban development includes parks, green corridors and protected zones. Cities like Singapore have shown you can have a modern city and still preserve a lot of natural beauty if you plan well.`,
    sampleBand8: `Preserving natural beauty during urban expansion is, ${span('adv', 'undoubtedly')}, of paramount importance. Cities tend to grow ${span('idiom', 'at the expense of')} forests, wetlands and biodiversity, which not only damages ecosystems but also diminishes residents' well-being. Numerous studies have demonstrated that access to ${span('colloc', 'green spaces')} reduces stress and improves overall health. Beyond that, natural beauty contributes to a city's character and economic value through tourism. ${span('colloc', 'Sustainable urban planning')}—incorporating parks, green roofs, and protected reserves—is the key to balancing growth with preservation.`,
    sampleBand9: `Preserving natural beauty as cities expand is, in my view, ${span('adv', 'absolutely')} crucial—not just for aesthetic reasons but for ecological, psychological, and economic ones. Unchecked urbanisation tends to ${span('phrasal', 'encroach on')} forests, wetlands, and coastal zones, leading to ${span('colloc', 'habitat destruction')} and the disruption of ecosystems that regulate air, water and climate. From a human standpoint, green spaces have been consistently shown to enhance ${span('colloc', 'mental well-being')} and foster community cohesion. Cities like Singapore and Vienna prove that high density and natural beauty are not ${span('idiom', 'mutually exclusive')}—through careful planning, green corridors, and vertical gardens, urbanisation and nature can coexist. The real challenge for policymakers is to ${span('idiom', 'strike a balance')} that allows cities to thrive without compromising the environments that ultimately sustain them.`,
    uzSampleAnswer: "Shaharlar kengayganda tabiiy go'zallikni saqlash, mening fikrimcha, juda muhim ahamiyatga ega — faqat estetik sabablar uchun emas, balki ekologik, psixologik va iqtisodiy sabablar uchun ham. Shahar hududlari o'sgan sayin, ular ko'pincha o'rmonlar, sho'r erlar va sohil zonalarini egallaydi, bu yashash joylarining yo'q qilinishiga va biologik xilma-xillikning keskin yo'qolishiga olib keladi. Insoniy nuqtai nazardan, yashil maydonlar ruhiy salomatlikni yaxshilashi, stressni kamaytirishi va jamoa hissini rivojlantirishi izchil tasdiqlangan. Singapur va Vena kabi shaharlar yuqori zichlik va tabiiy go'zallik o'zaro istisno emasligini ko'rsatdi — puxta rejalashtirish, yashil koridorlar va himoyalangan zaxiralar orqali shaharsozlik va tabiat birga yashashi mumkin. Iqtisodiy jihatdan ham tabiiy boyliklarni saqlash turizmni rivojlantiradi va mulk qiymatini oshiradi. Shunday qilib, kengayish o'sayotgan iqtisodiyotlarda muqarrar bo'lsa-da, tabiiy muhitni himoya qilmasdan buni amalga oshirish noto'g'ri yondashuvdir. Siyosatchilar uchun haqiqiy muammo — shaharlarning gullab-yashnashiga imkon beradigan, lekin oxir-oqibat ularni saqlab turuvchi ekotizimlarni murosaga olib kelmaydigan barqaror muvozanatni topishdir.",
    uzSampleBand5: "Menimcha, bu muhim. Shaharlarda binolar bor va odamlarga tabiat ham kerak. Tabiatsiz shahar yoqimli emas. Biz parklar va daraxtlarni saqlashimiz kerak. Odamlar yashillikni ko'rganda baxtli bo'ladi.",
    uzSampleBand6: "Menimcha, bu juda muhim. Ko'p shaharlar tez o'sib bormoqda va ular daraxtlarni kesmoqda. Odamlarga dam olish uchun yashil maydonlar kerak, hayvonlarga esa yashash joylari kerak. Shaharlar yaxshiroq rejalashtirishi va parklar, o'rmonlarni saqlashi kerak, aks holda hammasi faqat beton bo'lib qoladi va bu sog'lig'imizga foydali emas.",
    uzSampleBand7: `Bu, mening fikrimcha, ${span('adv', 'juda')} muhim. Shaharlar kengayganda, ular ko'pincha tabiiy yerlarni yutib yuboradi, bu atrof-muhitga zarar yetkazadi va yashil maydonlarning yo'qolishiga olib keladi. Shahardagi odamlar ruhiy salomatlik va ${span('colloc', 'hayot sifati')} uchun tabiat bilan aloqada bo'lishi kerak. Menimcha, hukumatlar shaharsozlikda parklar, yashil koridorlar va himoyalangan zonalarni qo'shilishini ta'minlashi kerak. Singapur kabi shaharlar zamonaviy shahar bo'lishingiz va shu bilan birga tabiiy go'zallikni saqlab qolishingiz mumkinligini ko'rsatdi.`,
    uzSampleBand8: `Shaharlar kengayishida tabiiy go'zallikni saqlash, ${span('adv', 'shubhasiz')}, juda muhim. Shaharlar o'rmonlar, sho'r erlar va biologik xilma-xillik ${span('idiom', 'hisobiga')} o'sishga moyil, bu nafaqat ekotizimlarga zarar yetkazadi, balki aholi farovonligini ham kamaytiradi. Ko'plab tadqiqotlar ${span('colloc', "yashil maydonlar")}ga kirish stressni kamaytirib, umumiy salomatlikni yaxshilashini ko'rsatdi. Bundan tashqari, tabiiy go'zallik shahar xarakteriga va turizm orqali iqtisodiy qiymatga hissa qo'shadi. ${span('colloc', "Barqaror shahar rejalashtirishi")} — parklar, yashil tomlar va himoyalangan zaxiralarni o'z ichiga olgan — o'sish va saqlash o'rtasidagi muvozanatning kalitidir.`,
    uzSampleBand9: `Shaharlar kengayganda tabiiy go'zallikni saqlash, mening fikrimcha, ${span('adv', 'mutlaqo')} hayotiy ahamiyatga ega — faqat estetik sabablar uchun emas, balki ekologik, psixologik va iqtisodiy sabablar uchun ham. Cheklanmagan shaharsozlik o'rmonlar, sho'r erlar va sohil zonalariga ${span('phrasal', 'tajavuz qilishga')} moyil, bu ${span('colloc', "yashash joylarining yo'q qilinishi")}ga va havo, suv hamda iqlimni tartibga soluvchi ekotizimlarning buzilishiga olib keladi. Insoniy nuqtai nazardan, yashil maydonlar ${span('colloc', "ruhiy farovonlik")}ni yaxshilashi va jamoa birligini rivojlantirishi izchil tasdiqlangan. Singapur va Vena kabi shaharlar yuqori zichlik va tabiiy go'zallik ${span('idiom', "o'zaro istisno emas")} ekanligini isbotladi. Siyosatchilar uchun haqiqiy muammo — shaharlarning gullab-yashnashiga imkon beradigan, lekin ekotizimlarni murosaga olib kelmaydigan ${span('idiom', 'muvozanatni topish')}.`,
  });

const M21Q17 = partThree(17,
  "What role does architecture play in shaping a city's identity?",
  {
    sampleAnswer: "Architecture plays a profound role in shaping a city's identity—it is, in many ways, the most visible and enduring expression of that identity. The skyline, the layout of streets, the materials used, the fusion of old and new—all of these contribute to how a city is perceived both by its residents and by visitors. Iconic buildings often become synonymous with the cities they inhabit: the Eiffel Tower for Paris, the Sydney Opera House for Sydney, or Burj Khalifa for Dubai. These landmarks are not just structures; they are cultural symbols that convey values, aspirations, and history. Beyond famous landmarks, vernacular architecture—the traditional houses, religious buildings, and public spaces—reflects the climate, materials, and cultural traditions of a place, giving each city its distinctive character. When a city loses its architectural heritage to careless redevelopment, it often loses something of its soul too. Conversely, cities that thoughtfully integrate modern architecture with their historic fabric tend to develop richer, more layered identities that honour both their past and their future.",
    vocabulary: {
      title: "Q17 - Architecture and a City's Identity",
      sentenceStarters: [
        'Architecture plays a profound role in...',
        'Iconic buildings often become synonymous with...',
        'Cities that integrate modern architecture with their historic fabric...',
      ],
      phrases: [
        'enduring expression',
        'iconic landmarks',
        'cultural symbols',
        'architectural heritage',
        'vernacular architecture',
        'historic fabric',
        'distinctive character',
        'layered identities',
        'urban aesthetics',
        'cultural traditions',
        'public spaces',
        'careless redevelopment',
        'aspirations and history',
      ],
      idioms: [
        'lose its soul',
        'stand the test of time',
        'a window into the past',
      ],
    },
    sampleBand5: "Architecture is important for cities. Buildings show how the city looks. Some cities have famous buildings like Paris has Eiffel Tower. People remember cities by their buildings.",
    sampleBand6: "I think architecture is very important for a city's identity. When you think of a city, you usually think of its famous buildings. For example, Paris has the Eiffel Tower and London has Big Ben. Old buildings also show the history of the city, and new buildings show how modern it is. So buildings tell the story of a place.",
    sampleBand7: `Architecture plays a ${span('adv', 'really')} important role in shaping a city's identity. The buildings—both old and new—say a lot about the culture, history, and ambitions of a place. ${span('colloc', "Iconic landmarks")} like the Sydney Opera House or the Eiffel Tower become symbols that the whole world recognises. But it's not just the famous ones; even ordinary streets and traditional houses give a city its character. When cities lose their old buildings, they often lose part of their soul too.`,
    sampleBand8: `Architecture, ${span('adv', 'undoubtedly')}, plays a central role in shaping a city's identity. It functions as the ${span('colloc', 'enduring expression')} of a place's history, values, and aspirations. ${span('colloc', "Iconic landmarks")} often become synonymous with the cities they inhabit, while ${span('colloc', "vernacular architecture")} reflects local climate, materials, and cultural traditions. When historic buildings are sacrificed to ${span('colloc', 'careless redevelopment')}, cities risk losing the very character that distinguishes them. Conversely, thoughtful integration of modern design with the ${span('colloc', "historic fabric")} produces cities with ${span('colloc', "layered identities")} that ${span('idiom', 'stand the test of time')}.`,
    sampleBand9: `Architecture plays a ${span('adv', 'profoundly')} important role in shaping a city's identity—it is, in many ways, the most visible and enduring expression of that identity. The skyline, the layout of streets, the materials, and the fusion of old and new all contribute to how a city is perceived. ${span('colloc', "Iconic landmarks")} such as the Eiffel Tower or the Sydney Opera House become ${span('colloc', "cultural symbols")} that convey a city's values and aspirations to the world. Beyond famous landmarks, ${span('colloc', "vernacular architecture")}—traditional houses, religious buildings, and public spaces—reflects the climate, materials, and cultural traditions of a place, giving each city its distinctive character. When a city ${span('idiom', 'loses its soul')} to careless redevelopment, something irreplaceable is sacrificed. Conversely, cities that thoughtfully integrate modern architecture with their ${span('colloc', "historic fabric")} develop richer, more layered identities that honour both past and future.`,
    uzSampleAnswer: "Arxitektura shaharning o'ziga xosligini shakllantirishda chuqur rol o'ynaydi — u ko'p jihatdan o'sha o'ziga xoslikning eng ko'rinadigan va doimiy ifodasidir. Osmono'par chiziq, ko'chalar tartibi, ishlatiladigan materiallar, eski va yangining uyg'unligi — bularning barchasi shaharning aholisi va mehmonlari tomonidan qanday qabul qilinishiga hissa qo'shadi. Mashhur binolar ko'pincha shaharlar bilan bir ma'noli bo'lib qoladi: Parij uchun Eyfel minorasi, Sidney uchun Sidney opera teatri yoki Dubay uchun Burj Khalifa. Bu mo'jaz binolar shunchaki inshootlar emas; ular qadriyatlar, intilishlar va tarixni anglatuvchi madaniy belgilardir. Mashhur diqqatga sazovor joylardan tashqari, vernakulyar arxitektura — an'anaviy uylar, diniy binolar va jamoat joylari — joyning iqlimi, materiallari va madaniy an'analarini aks ettiradi va har bir shaharga o'ziga xos xarakter beradi. Shahar e'tiborsiz qayta qurish tufayli o'zining arxitektura merosini yo'qotsa, ko'pincha jonidan ham bir narsani yo'qotadi. Aksincha, zamonaviy arxitekturani tarixiy to'qima bilan o'ylab birlashtirgan shaharlar boyroq, ko'p qatlamli o'ziga xoslikni rivojlantirishga moyil.",
    uzSampleBand5: "Arxitektura shaharlar uchun muhim. Binolar shaharning qanday ko'rinishini ko'rsatadi. Ba'zi shaharlarda mashhur binolar bor — masalan, Parijda Eyfel minorasi. Odamlar shaharlarni ularning binolari orqali eslab qolishadi.",
    uzSampleBand6: "Menimcha, arxitektura shaharning o'ziga xosligi uchun juda muhim. Shahar haqida o'ylaganda, odatda uning mashhur binolari haqida o'ylaysiz. Masalan, Parijda Eyfel minorasi va Londonda Big Ben bor. Eski binolar shaharning tarixini ko'rsatadi, yangi binolar esa qanchalik zamonaviy ekanligini ko'rsatadi. Shunday qilib, binolar joyning hikoyasini aytib beradi.",
    uzSampleBand7: `Arxitektura shaharning o'ziga xosligini shakllantirishda ${span('adv', 'haqiqatan ham')} muhim rol o'ynaydi. Binolar — eski ham, yangi ham — joyning madaniyati, tarixi va orzulari haqida ko'p narsani aytib beradi. Sidney opera teatri yoki Eyfel minorasi kabi ${span('colloc', "mashhur diqqatga sazovor joylar")} butun dunyo tan oladigan ramzlarga aylanadi. Lekin faqat mashhur binolar emas; oddiy ko'chalar va an'anaviy uylar ham shaharga o'ziga xos xarakter beradi. Shaharlar eski binolarini yo'qotganda, ko'pincha jonlarining bir qismini ham yo'qotishadi.`,
    uzSampleBand8: `Arxitektura, ${span('adv', 'shubhasiz')}, shaharning o'ziga xosligini shakllantirishda markaziy rol o'ynaydi. U joyning tarixi, qadriyatlari va orzularining ${span('colloc', "doimiy ifodasi")} sifatida xizmat qiladi. ${span('colloc', "Mashhur diqqatga sazovor joylar")} ko'pincha o'zlari joylashgan shaharlar bilan bir ma'noli bo'lib qoladi, ${span('colloc', "vernakulyar arxitektura")} esa mahalliy iqlim, materiallar va madaniy an'analarni aks ettiradi. Tarixiy binolar ${span('colloc', "e'tiborsiz qayta qurish")}ga qurbon qilinganda, shaharlar o'zlarini farqlovchi xarakterni yo'qotish xavfi ostida qoladi. Aksincha, zamonaviy dizaynni ${span('colloc', "tarixiy to'qima")} bilan o'ylab birlashtirish ${span('idiom', "vaqt sinovidan o'tadigan")} ${span('colloc', "ko'p qatlamli o'ziga xoslik")}ka ega shaharlarni yaratadi.`,
    uzSampleBand9: `Arxitektura shaharning o'ziga xosligini shakllantirishda ${span('adv', "g'oyat")} muhim rol o'ynaydi — u ko'p jihatdan o'sha o'ziga xoslikning eng ko'rinadigan va doimiy ifodasidir. Osmono'par chiziq, ko'chalar tartibi, materiallar va eski va yangining uyg'unligi shahar qanday qabul qilinishiga hissa qo'shadi. Eyfel minorasi yoki Sidney opera teatri kabi ${span('colloc', "mashhur diqqatga sazovor joylar")} dunyoga shaharning qadriyatlari va orzularini yetkazib beruvchi ${span('colloc', "madaniy ramzlar")}ga aylanadi. Mashhur landmarklardan tashqari, ${span('colloc', "vernakulyar arxitektura")} — an'anaviy uylar, diniy binolar va jamoat joylari — joyning iqlimi va madaniy an'analarini aks ettiradi va har bir shaharga o'ziga xos xarakter beradi. Shahar e'tiborsiz qayta qurish tufayli ${span('idiom', "jonini yo'qotsa")}, qaytarilmas narsa qurbon qilinadi. Aksincha, zamonaviy arxitekturani ${span('colloc', "tarixiy to'qima")} bilan o'ylab birlashtirgan shaharlar o'tmish va kelajakni hurmat qiladigan boyroq, ko'p qatlamli o'ziga xoslikni rivojlantirishadi.`,
  });

// ============================================================================
// MOCK 22
// ============================================================================
const M22Q16 = partThree(16,
  'How does culture influence the way people make important decisions?',
  {
    sampleAnswer: "Culture exerts a powerful and often subconscious influence on how people make important decisions. In more collectivist cultures—common across much of East Asia, the Middle East, and Latin America—decision-making tends to be a consultative process involving family, elders, or community leaders, and individual choices are weighed against their impact on the group. By contrast, in more individualist cultures—particularly in Western Europe and North America—people are encouraged from a young age to make autonomous decisions and to prioritise personal goals, even when these conflict with family expectations. Beyond this broad spectrum, cultural attitudes toward risk, time, hierarchy, and authority also shape how decisions are made. Some cultures emphasise long-term thinking and patience, while others reward decisiveness and quick action. Religious and traditional values often play a significant role too, particularly in life-changing decisions such as marriage, career, or relocation. Even something as simple as how directly a person communicates a decision can be culturally conditioned. None of this means that culture is destiny, but it does mean that the same decision can look very different depending on the cultural lens through which it is made.",
    vocabulary: {
      title: 'Q16 - Cultural Influence on Decision-Making',
      sentenceStarters: [
        'Culture exerts a powerful influence on...',
        'In more collectivist cultures, decision-making tends to be...',
        'By contrast, in individualist cultures...',
      ],
      phrases: [
        'subconscious influence',
        'collectivist cultures',
        'individualist cultures',
        'consultative process',
        'autonomous decisions',
        'personal goals',
        'attitudes toward risk',
        'long-term thinking',
        'religious and traditional values',
        'cultural lens',
        'family expectations',
        'community leaders',
        'culturally conditioned',
      ],
      idioms: [
        'culture is not destiny',
        'when in Rome, do as the Romans do',
        'no man is an island',
      ],
    },
    sampleBand5: "Culture is important when people make decisions. Some cultures ask family first. Other cultures decide alone. People follow their culture's rules and values when they choose something big.",
    sampleBand6: "Culture has a big effect on decisions. For example, in some cultures, people always ask their parents or elders before making big choices, like marriage or jobs. In other cultures, people decide more by themselves. Religion and traditions also affect decisions a lot. So culture is really important in how people choose.",
    sampleBand7: `Culture has a ${span('colloc', 'huge influence')} on decision-making, ${span('adv', 'in my opinion')}. In ${span('colloc', "collectivist cultures")} like in many Asian countries, big decisions are usually made together with family or elders. In more ${span('colloc', "individualist cultures")} like the US or UK, people are expected to decide things on their own. Religion, tradition, and even attitudes toward time and risk all shape how people approach important choices.`,
    sampleBand8: `Culture, ${span('adv', 'undoubtedly')}, exerts a deep influence on decision-making, often in ways people don't fully recognise. ${span('colloc', "Collectivist cultures")} treat important choices as a ${span('colloc', "consultative process")} involving family or community, while ${span('colloc', "individualist cultures")} emphasise ${span('colloc', "autonomous decisions")} and personal goals. Cultural attitudes toward risk, hierarchy, and time horizons also matter — some cultures favour patience and consensus, others reward speed and assertiveness. ${span('colloc', "Religious and traditional values")} often play a decisive role in ${span('colloc', "life-changing decisions")} like marriage, career, or migration.`,
    sampleBand9: `Culture exerts a ${span('adv', "profoundly")} powerful and often ${span('colloc', "subconscious influence")} on how people make important decisions. In ${span('colloc', "collectivist cultures")}—common across much of East Asia, the Middle East, and Latin America—decision-making tends to be a ${span('colloc', "consultative process")} involving family or elders, and individual choices are weighed against their impact on the group. By contrast, in ${span('colloc', "individualist cultures")}—particularly in Western Europe and North America—people are encouraged from a young age to make ${span('colloc', "autonomous decisions")}. Cultural attitudes toward risk, time, hierarchy, and authority also shape how decisions unfold. ${span('colloc', "Religious and traditional values")} often play a significant role too, particularly in life-changing decisions such as marriage, career, or relocation. None of this means that ${span('idiom', "culture is destiny")}, but the same decision can look very different depending on the ${span('colloc', "cultural lens")} through which it is made.`,
    uzSampleAnswer: "Madaniyat odamlar muhim qarorlarni qabul qilish usuliga kuchli va ko'pincha ongsiz ta'sir ko'rsatadi. Sharqiy Osiyo, Yaqin Sharq va Lotin Amerikasining katta qismida keng tarqalgan kollektivistik madaniyatlarda qaror qabul qilish odatda oila, oqsoqollar yoki jamoa rahbarlari ishtirokidagi maslahat jarayonidir va shaxsiy tanlovlar guruhga ta'siri nuqtai nazaridan baholanadi. Aksincha, individualistik madaniyatlarda — ayniqsa G'arbiy Yevropa va Shimoliy Amerikada — odamlar yoshlikdan mustaqil qarorlar qabul qilishga va shaxsiy maqsadlarni birinchi o'ringa qo'yishga undaladi, hatto bu oilaviy umidlar bilan ziddiyatli bo'lsa ham. Bu keng spektrdan tashqari, xavf, vaqt, ierarxiya va hokimiyatga nisbatan madaniy munosabatlar ham qarorlar qanday qabul qilinishini shakllantiradi. Ba'zi madaniyatlar uzoq muddatli fikrlash va sabr-toqatga urg'u beradi, boshqalari esa qat'iyat va tezkor harakatni rag'batlantiradi. Diniy va an'anaviy qadriyatlar ham, ayniqsa nikoh, kasb yoki ko'chish kabi hayotni o'zgartiruvchi qarorlarda muhim rol o'ynaydi. Bularning birortasi madaniyat — taqdir degani emas, lekin bir xil qaror u qabul qilingan madaniy nuqtai nazardan juda boshqacha ko'rinishi mumkinligini anglatadi.",
    uzSampleBand5: "Madaniyat odamlar qaror qabul qilganda muhim. Ba'zi madaniyatlarda avval oilaga maslahat solishadi. Boshqa madaniyatlarda esa o'zlari qaror qiladi. Odamlar katta narsani tanlaganda madaniyatining qoidalari va qadriyatlariga amal qilishadi.",
    uzSampleBand6: "Madaniyat qarorlarga katta ta'sir qiladi. Masalan, ba'zi madaniyatlarda odamlar har doim katta tanlovlar — masalan, nikoh yoki ish — qilishdan oldin ota-onalari yoki oqsoqollardan so'rashadi. Boshqa madaniyatlarda esa odamlar ko'proq o'zlari qaror qilishadi. Din va an'analar ham qarorlarga juda ko'p ta'sir qiladi. Shunday qilib, odamlar qanday tanlashida madaniyat haqiqatan muhimdir.",
    uzSampleBand7: `Madaniyat qaror qabul qilishga ${span('colloc', "katta ta'sir")} ko'rsatadi, ${span('adv', "menimcha")}. Osiyo davlatlari kabi ${span('colloc', "kollektivistik madaniyatlarda")} katta qarorlar odatda oila yoki oqsoqollar bilan birga qabul qilinadi. AQSh yoki Buyuk Britaniya kabi ${span('colloc', "individualistik madaniyatlarda")} esa odamlar narsalarni o'zlari qaror qilishlari kutiladi. Din, an'ana va hatto vaqt va xavfga nisbatan munosabatlar ham odamlarning muhim tanlovlarga qanday yondashishini shakllantiradi.`,
    uzSampleBand8: `Madaniyat, ${span('adv', "shubhasiz")}, qaror qabul qilishga chuqur ta'sir ko'rsatadi, ko'pincha odamlar to'liq tan olmaydigan tarzda. ${span('colloc', "Kollektivistik madaniyatlar")} muhim tanlovlarga oila yoki jamoa ishtirokidagi ${span('colloc', "maslahat jarayoni")} sifatida munosabatda bo'ladi, ${span('colloc', "individualistik madaniyatlar")} esa ${span('colloc', "mustaqil qarorlar")} va shaxsiy maqsadlarga urg'u beradi. Xavf, ierarxiya va vaqt ufqlariga nisbatan madaniy munosabatlar ham muhim — ba'zi madaniyatlar sabr-toqat va kelishuvni afzal ko'radi, boshqalari esa tezlik va qat'iyatni rag'batlantiradi. ${span('colloc', "Diniy va an'anaviy qadriyatlar")} nikoh, kasb yoki migratsiya kabi ${span('colloc', "hayotni o'zgartiruvchi qarorlarda")} ko'pincha hal qiluvchi rol o'ynaydi.`,
    uzSampleBand9: `Madaniyat odamlar muhim qarorlarni qabul qilish usuliga ${span('adv', "g'oyat")} kuchli va ko'pincha ${span('colloc', "ongsiz ta'sir")} ko'rsatadi. Sharqiy Osiyo, Yaqin Sharq va Lotin Amerikasining katta qismida keng tarqalgan ${span('colloc', "kollektivistik madaniyatlarda")} qaror qabul qilish odatda oila yoki oqsoqollar ishtirokidagi ${span('colloc', "maslahat jarayoni")}dir va shaxsiy tanlovlar guruhga ta'siri nuqtai nazaridan baholanadi. Aksincha, ${span('colloc', "individualistik madaniyatlar")}da — ayniqsa G'arbiy Yevropa va Shimoliy Amerikada — odamlar yoshlikdan ${span('colloc', "mustaqil qarorlar")} qabul qilishga undaladi. Xavf, vaqt, ierarxiya va hokimiyatga nisbatan madaniy munosabatlar ham qarorlar qanday rivojlanishini shakllantiradi. ${span('colloc', "Diniy va an'anaviy qadriyatlar")} nikoh, kasb yoki ko'chish kabi hayotni o'zgartiruvchi qarorlarda ham muhim rol o'ynaydi. Bularning birortasi ${span('idiom', "madaniyat — taqdir")} degani emas, lekin bir xil qaror u qabul qilingan ${span('colloc', "madaniy nuqtai nazar")}dan juda boshqacha ko'rinishi mumkin.`,
  });

const M22Q17 = partThree(17,
  'Has technology changed the way people seek advice?',
  {
    sampleAnswer: "Technology has transformed advice-seeking in profound and somewhat paradoxical ways. On one hand, the internet has democratised access to information and expertise—within seconds, someone can read forums, watch tutorials, consult specialised websites, or even chat with AI assistants on virtually any topic. This has lowered the barrier to seeking guidance and broadened the range of perspectives available, especially for people in remote areas or those reluctant to ask in person. On the other hand, the sheer volume of online advice has introduced new challenges: separating reliable information from misinformation has become increasingly difficult, and the anonymity of online sources can make it hard to judge credibility. Social media has also blurred the line between expert advice and influencer opinion, sometimes substituting popularity for genuine expertise. Despite these shifts, there is evidence that for the most personal and emotionally weighty matters, people still prefer face-to-face conversations with people they trust. Technology, in other words, has expanded the toolkit but not entirely replaced the deep human need for personal connection in important moments.",
    vocabulary: {
      title: 'Q17 - Technology and Advice-Seeking',
      sentenceStarters: [
        'Technology has transformed advice-seeking in...',
        'On one hand, the internet has democratised...',
        'On the other hand, the sheer volume of...',
      ],
      phrases: [
        'transformed advice-seeking',
        'democratised access',
        'specialised websites',
        'AI assistants',
        'lowered the barrier',
        'sheer volume',
        'separating reliable information from misinformation',
        'anonymity of online sources',
        'judge credibility',
        'influencer opinion',
        'genuine expertise',
        'emotionally weighty matters',
        'expanded the toolkit',
      ],
      idioms: [
        'a double-edged sword',
        'at your fingertips',
        'take with a grain of salt',
      ],
    },
    sampleBand5: "Yes, technology changed how people get advice. Now we can search online or ask friends on social media. Before, people only asked family or doctors. Internet is faster but sometimes information is wrong.",
    sampleBand6: "Technology has definitely changed how people ask for advice. In the past, people asked their family or friends. Now they can use Google, YouTube, or even ChatGPT to get information quickly. It's much easier and faster, but the problem is that not all advice online is reliable. So you have to be careful where you take advice from.",
    sampleBand7: `${span('adv', 'Definitely')}, technology has changed advice-seeking ${span('adv', 'quite a lot')}. The internet means people can find advice on almost anything ${span('idiom', 'at their fingertips')} — they can search forums, watch YouTube tutorials, or use AI tools. This makes things much faster and more convenient. The downside is that not all online advice is trustworthy, and people sometimes follow bad advice from non-experts. So technology has been ${span('idiom', "a double-edged sword")} for advice-seeking.`,
    sampleBand8: `Technology has, ${span('adv', "undoubtedly")}, ${span('colloc', "transformed advice-seeking")} in profound ways. On one hand, the internet has ${span('colloc', "democratised access")} to information and expertise — people can consult ${span('colloc', "specialised websites")}, watch tutorials, or interact with ${span('colloc', "AI assistants")} on almost any topic. On the other hand, the sheer volume of online content makes it harder to ${span('colloc', "judge credibility")}, and social media often blurs the line between ${span('colloc', "genuine expertise")} and ${span('colloc', "influencer opinion")}. For ${span('colloc', "emotionally weighty matters")}, however, most people still prefer trusted face-to-face conversations.`,
    sampleBand9: `Technology has ${span('adv', 'profoundly')} ${span('colloc', "transformed advice-seeking")}, in somewhat paradoxical ways. On one hand, the internet has ${span('colloc', "democratised access")} to information and expertise — within seconds, someone can read forums, watch tutorials, or chat with ${span('colloc', "AI assistants")} on virtually any topic. This has ${span('phrasal', "lowered the barrier")} to seeking guidance and broadened the range of perspectives available, especially for people in remote areas. On the other hand, the ${span('colloc', "sheer volume")} of online advice has introduced new challenges: ${span('colloc', "separating reliable information from misinformation")} has become increasingly difficult, and social media often substitutes popularity for ${span('colloc', "genuine expertise")}. Despite these shifts, evidence suggests that for the most personal and ${span('colloc', "emotionally weighty matters")}, people still prefer face-to-face conversations with people they trust. Technology has ${span('phrasal', "expanded the toolkit")} but not entirely replaced the deep human need for personal connection in important moments.`,
    uzSampleAnswer: "Texnologiya maslahat olishni chuqur va biroz paradoksal usullarda o'zgartirdi. Bir tomondan, internet ma'lumot va tajribaga kirishni demokratlashtirdi — bir necha soniya ichida kimdir forumlarni o'qishi, qo'llanmalarni tomosha qilishi, ixtisoslashgan veb-saytlar bilan maslahatlashishi yoki deyarli har qanday mavzu bo'yicha sun'iy intellekt yordamchilari bilan suhbatlashishi mumkin. Bu yo'l-yo'riq olish to'sig'ini pasaytirdi va mavjud nuqtai nazarlar doirasini kengaytirdi, ayniqsa uzoq hududlarda yashovchilar yoki shaxsan so'rashga uyaladiganlar uchun. Boshqa tomondan, onlayn maslahatlarning katta hajmi yangi muammolarni keltirib chiqardi: ishonchli ma'lumotni noto'g'ri ma'lumotdan ajratish tobora qiyinlashib bormoqda va onlayn manbalarning anonimligi ishonchlilikni baholashni qiyinlashtirishi mumkin. Ijtimoiy tarmoqlar ham ekspert maslahati va influenser fikri o'rtasidagi chegarani xiralashtirdi. Bu o'zgarishlarga qaramay, eng shaxsiy va hissiy jihatdan og'ir masalalarda odamlar hali ham ishongan odamlar bilan yuzma-yuz suhbatlarni afzal ko'rishadi. Boshqacha aytganda, texnologiya asboblar to'plamini kengaytirdi, ammo muhim daqiqalarda shaxsiy aloqaga bo'lgan chuqur insoniy ehtiyojni butunlay almashtirmadi.",
    uzSampleBand5: "Ha, texnologiya maslahat olishni o'zgartirdi. Endi biz internetdan qidirishimiz yoki ijtimoiy tarmoqlarda do'stlardan so'rashimiz mumkin. Avvallari odamlar faqat oila yoki shifokorlardan so'rashardi. Internet tezroq, lekin ba'zida ma'lumot noto'g'ri.",
    uzSampleBand6: "Texnologiya odamlar maslahat olish usulini aniq o'zgartirdi. Avvallari odamlar oila yoki do'stlaridan so'rashardi. Endi ular ma'lumotni tezda olish uchun Google, YouTube yoki hatto ChatGPT'dan foydalanishlari mumkin. Bu juda oson va tez, lekin muammo shundaki, onlayn maslahatlarning hammasi ishonchli emas. Shunday qilib, qaerdan maslahat olishingizni ehtiyotkorlik bilan tanlashingiz kerak.",
    uzSampleBand7: `${span('adv', "Albatta")}, texnologiya maslahat olishni ${span('adv', "ancha")} o'zgartirdi. Internet odamlar deyarli har qanday mavzuda maslahat ${span('idiom', "qo'llari ostida")} topishlari mumkinligini anglatadi — ular forumlarni qidirishlari, YouTube qo'llanmalarini tomosha qilishlari yoki sun'iy intellekt vositalaridan foydalanishlari mumkin. Bu narsalarni ancha tez va qulay qiladi. Salbiy tomoni shundaki, onlayn maslahatlarning hammasi ishonchli emas va odamlar ba'zan mutaxassis bo'lmagan kishilardan yomon maslahat olishadi. Shunday qilib, texnologiya maslahat olish uchun ${span('idiom', "ikki tomonlama qilich")} bo'ldi.`,
    uzSampleBand8: `Texnologiya, ${span('adv', "shubhasiz")}, ${span('colloc', "maslahat olishni o'zgartirdi")} chuqur usullarda. Bir tomondan, internet ma'lumot va tajribaga ${span('colloc', "kirishni demokratlashtirdi")} — odamlar ${span('colloc', "ixtisoslashgan veb-saytlar")} bilan maslahatlashishlari, qo'llanmalarni tomosha qilishlari yoki deyarli har qanday mavzuda ${span('colloc', "sun'iy intellekt yordamchilari")} bilan muloqot qilishlari mumkin. Boshqa tomondan, onlayn kontentning katta hajmi ${span('colloc', "ishonchlilikni baholash")}ni qiyinlashtiradi va ijtimoiy tarmoqlar ko'pincha ${span('colloc', "haqiqiy ekspertlik")} va ${span('colloc', "influenser fikri")} o'rtasidagi chegarani xiralashtiradi. Biroq, ${span('colloc', "hissiy jihatdan og'ir masalalarda")} ko'pchilik hali ham ishonchli yuzma-yuz suhbatlarni afzal ko'radi.`,
    uzSampleBand9: `Texnologiya ${span('adv', "g'oyat")} ${span('colloc', "maslahat olishni o'zgartirdi")}, biroz paradoksal usullarda. Bir tomondan, internet ma'lumot va tajribaga ${span('colloc', "kirishni demokratlashtirdi")} — bir necha soniya ichida kimdir forumlarni o'qishi, qo'llanmalarni tomosha qilishi yoki deyarli har qanday mavzuda ${span('colloc', "sun'iy intellekt yordamchilari")} bilan suhbatlashishi mumkin. Bu yo'l-yo'riq olish ${span('phrasal', "to'sig'ini pasaytirdi")} va mavjud nuqtai nazarlar doirasini kengaytirdi. Boshqa tomondan, onlayn maslahatlarning ${span('colloc', "katta hajmi")} yangi muammolarni keltirib chiqardi: ${span('colloc', "ishonchli ma'lumotni noto'g'ri ma'lumotdan ajratish")} tobora qiyinlashib bormoqda va ijtimoiy tarmoqlar ko'pincha mashhurlikni ${span('colloc', "haqiqiy ekspertlik")} o'rniga qo'yadi. Bu o'zgarishlarga qaramay, eng shaxsiy va ${span('colloc', "hissiy jihatdan og'ir masalalarda")} odamlar hali ham ishongan odamlar bilan yuzma-yuz suhbatlarni afzal ko'rishadi. Texnologiya asboblar to'plamini ${span('phrasal', "kengaytirdi")}, ammo muhim daqiqalarda shaxsiy aloqaga bo'lgan chuqur insoniy ehtiyojni butunlay almashtirmadi.`,
  });

// ---------- inject ----------
function inject(filePath, q16, q17) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Detect EOL (CRLF vs LF) and match the questions-array close after Q15
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const closeRe = new RegExp(`(${eol}    \\})${eol}(  \\],)`);
  const m = content.match(closeRe);
  if (!m) throw new Error(`Could not find questions array close in ${filePath}`);

  const indent = (str) => str.split('\n').map(l => l ? '    ' + l : l).join(eol);
  const q16Json = indent(JSON.stringify(q16, null, 2));
  const q17Json = indent(JSON.stringify(q17, null, 2));

  const replacement = `${m[1]},${eol}${q16Json},${eol}${q17Json}${eol}${m[2]}`;
  const out = content.replace(closeRe, replacement);

  fs.writeFileSync(filePath, out, 'utf8');
  console.log(`Injected Q16+Q17 into ${path.basename(filePath)}`);
}

inject(FILE21, M21Q16, M21Q17);
inject(FILE22, M22Q16, M22Q17);

console.log('Done.');
