// Vocabulary Test: Proverbs (A1–C2)
// Questions and options are randomized on each load

const VOCAB_DATA = [
    { term: "A journey of a thousand miles begins with a single step", en: "Big goals are achieved through continuous small efforts", uz: "Ming chaqirimlik yo'l ham birinchi qadamdan boshlanadi" },
    { term: "Every cloud has a silver lining", en: "Every difficult situation has some positive aspect", uz: "Har bir qiyinchilikning ortida bir yengillik bor" },
    { term: "Knowledge is power", en: "The more a person knows, the more powerful they are", uz: "Bilim — kuch" },
    { term: "Practice makes perfect", en: "Doing something repeatedly is the only way to become good at it", uz: "Mashq qilaverish mukammallikka yetaklaydi" },
    { term: "Where there's a will, there's a way", en: "If you are determined enough, you will find a way to achieve your goal", uz: "Iroda bor joyda yo'l topiladi" },
    { term: "Better late than never", en: "It is better to do something late than not to do it at all", uz: "Hechdan ko'ra kech yaxshi" },
    { term: "Absence makes the heart grow fonder", en: "Being away from someone makes you like them even more", uz: "Sog'inch muhabbatni kuchaytiradi" },
    { term: "Experience is the best teacher", en: "You learn more from doing something than from reading about it", uz: "Tajriba — eng yaxshi ustoz" },
    { term: "All that glitters is not gold", en: "Not everything that looks valuable or true is actually so", uz: "Yaltiragan narsaning hammasi ham oltin emas" },
    { term: "Failure is the stepping stone to success", en: "Failing helps you learn and eventually succeed", uz: "Muvaffaqiyatsizlik — muvaffaqiyatga eltuvchi pog'ona" },
    { term: "A smooth sea never made a skilled sailor", en: "Easy lives don't develop strong characters", uz: "Sokin dengizdan usta dengizchi chiqmaydi" },
    { term: "Honesty is the best policy", en: "It is always better to tell the truth", uz: "Halollik eng yaxshi yo'ldir" },
    { term: "Silence is golden", en: "It is often better to say nothing than to speak", uz: "Sukut — saodat" },
    { term: "Still waters run deep", en: "Quiet people often have complex or very interesting characters", uz: "Sokin suvning tubi chuqur" },
    { term: "Beauty is in the eye of the beholder", en: "What one person finds beautiful, another might not", uz: "Husn — ko'zda" },
    { term: "The pen is mightier than the sword", en: "Writing is more effective than physical force to change things", uz: "Qalam tig'dan o'tkir" },
    { term: "Wisdom comes with age", en: "People become wiser as they get older", uz: "Donolik yosh o'tishi bilan keladi" },
    { term: "Better safe than sorry", en: "It is better to be careful than to regret it later", uz: "Ehtiyotkorlik — sog'liq garovi" },
    { term: "Don't judge a book by its cover", en: "Don't form an opinion based on appearance alone", uz: "Tashqi ko'rinishga aldanma" },
    { term: "The early bird catches the worm", en: "Success comes to those who prepare well and act early", uz: "Erta turgan ishidan baraka topadi" },
    { term: "Necessity is the mother of invention", en: "When you really need something, you find a creative way to get it", uz: "Ehtiyoj — ixtiro onasi" },
    { term: "Rome wasn't built in a day", en: "Great things take time to achieve", uz: "Rim bir kunda qurilmagan" },
    { term: "Two heads are better than one", en: "It is easier to solve a problem with someone else", uz: "Kengashli to'y tarqamas" },
    { term: "Good things come to those who wait", en: "Patience is rewarded eventually", uz: "Sabrning tagi — sariq oltin" },
    { term: "What goes around, comes around", en: "The way you treat others will eventually affect how you are treated", uz: "Nima eksang, shuni o'rasan" },
    { term: "Birds of a feather flock together", en: "People with similar characters or interests tend to spend time together", uz: "O'xshatmasdan uchratmas" },
    { term: "Blood is thicker than water", en: "Family relationships are stronger than any other type", uz: "Qon qondan suvdan shirin" },
    { term: "A friend in need is a friend indeed", en: "A true friend is someone who helps you when you are in trouble", uz: "Do'st kulfatda bilinadi" },
    { term: "Don't wash your dirty linen in public", en: "Don't discuss your private problems or arguments in front of others", uz: "Uyning gapini ko'chaga chiqarma" },
    { term: "Great minds think alike", en: "Intelligent people often have the same ideas at the same time", uz: "Aqlli odamlar bir xil o'ylaydi" },
    { term: "It takes two to tango", en: "Both people in a situation or argument are responsible for it", uz: "Qars ikki qo'ldan chiqadi" },
    { term: "Like father, like son", en: "Sons often exhibit similar character traits to their fathers", uz: "Otaga tortgan o'g'il" },
    { term: "Man is known by the company he keeps", en: "Your character is judged by the people you spend time with", uz: "Do'sting kimligini ayt, sening kimligingni aytaman" },
    { term: "One man's meat is another man's poison", en: "What one person likes, another might dislike intensely", uz: "Birovga yoqqan — birovga yoqmas" },
    { term: "Opposites attract", en: "People who are very different often like each other", uz: "Qarama-qarshiliklar bir-birini tortadi" },
    { term: "Too many cooks spoil the broth", en: "If too many people try to do the same task, it will be done badly", uz: "Qo'ychi ko'p bo'lsa, qo'y harom o'ladi" },
    { term: "When in Rome, do as the Romans do", en: "Follow the customs of the place you are visiting", uz: "O'sha yerning udumiga bo'ysun" },
    { term: "Clothes make the man", en: "People judge you based on the clothes you wear", uz: "Kiyimiga qarab kutib olishadi" },
    { term: "Actions speak louder than words", en: "What people do is more important than what they say", uz: "Gapdan ko'ra amal muhim" },
    { term: "Don't count your chickens before they hatch", en: "Don't make plans based on something that hasn't happened yet", uz: "Jo'jani kuzda sanaymiz" },
    { term: "Don't cry over spilled milk", en: "Don't waste time worrying about things that have already happened", uz: "O'tgan ishga salovot" },
    { term: "Don't put all your eggs in one basket", en: "Don't risk everything on a single venture or possibility", uz: "Hamma narsangni bir narsaga tikma" },
    { term: "Easy come, easy go", en: "Something that is gained easily is also lost easily", uz: "Oson kelgan, oson ketar" },
    { term: "If you can't beat them, join them", en: "If you cannot change someone or something, it is better to cooperate with them", uz: "Agar yenga olmasang, qo'shil" },
    { term: "Look before you leap", en: "Think carefully before you make a decision or take action", uz: "Etti o'lchab, bir kes" },
    { term: "Make hay while the sun shines", en: "Take advantage of an opportunity while it exists", uz: "Temirni qizig'ida bos" },
    { term: "No pain, no gain", en: "You must work hard and suffer a little to achieve something", uz: "Mehnat qilmasang, rohat ko'rmaysan" },
    { term: "Out of sight, out of mind", en: "We tend to forget people or things that we do not see often", uz: "Ko'zdan nari — ko'ngildan nari" },
    { term: "Strike while the iron is hot", en: "Act quickly while the situation is favorable", uz: "Temirni qizig'ida bos" },
    { term: "Kill two birds with one stone", en: "Achieve two things with a single action", uz: "Bir o'q bilan ikki quyonni urmoq" }
];

const TEST_META = {
    title: "📜 Proverbs Vocabulary Test",
    logo: "📜",
    brand: "Mock Stream",
    subtitle: "Proverbs (A1–C2)",
    primary: "#854d0e",
    secondary: "#713f12"
};

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Get random wrong options for term questions
function getWrongOptions(correctTerm, count = 3) {
    const otherTerms = VOCAB_DATA.filter(item => item.term !== correctTerm);
    const shuffled = shuffleArray(otherTerms);
    return shuffled.slice(0, count).map(item => item.term);
}

// Get random wrong options for definition questions
function getWrongDefinitions(correctDef, count = 3) {
    const otherDefs = VOCAB_DATA.filter(item => item.en !== correctDef);
    const shuffled = shuffleArray(otherDefs);
    return shuffled.slice(0, count).map(item => item.en);
}

// Get random wrong options for Uzbek questions
function getWrongUzbekOptions(correctUz, count = 3) {
    const otherUz = VOCAB_DATA.filter(item => item.uz !== correctUz);
    const shuffled = shuffleArray(otherUz);
    return shuffled.slice(0, count).map(item => item.uz);
}

// Generate questions with randomization
function generateQuestions() {
    const questions = [];
    const shuffledVocab = shuffleArray(VOCAB_DATA);
    
    // Question types cycle through vocabulary
    const questionTypes = [
        // Type 1: English definition → Find the term
        (item) => ({
            q: `Tarjima qiling: "${item.en}"`,
            a: item.term,
            options: shuffleArray([item.term, ...getWrongOptions(item.term)])
        }),
        // Type 2: Uzbek → Find the English term
        (item) => ({
            q: `So'z toping: "${item.uz}"`,
            a: item.term,
            options: shuffleArray([item.term, ...getWrongOptions(item.term)])
        }),
        // Type 3: Term → Find English definition
        (item) => ({
            q: `Inglizchasi nima? "${item.term}"`,
            a: item.en,
            options: shuffleArray([item.en, ...getWrongDefinitions(item.en)])
        }),
        // Type 4: Term → Find Uzbek translation
        (item) => ({
            q: `O'zbekchasi nima? "${item.term}"`,
            a: item.uz,
            options: shuffleArray([item.uz, ...getWrongUzbekOptions(item.uz)])
        })
    ];
    
    // Generate 50 questions cycling through types
    for (let i = 0; i < 50; i++) {
        const vocabItem = shuffledVocab[i % shuffledVocab.length];
        const questionType = questionTypes[i % questionTypes.length];
        questions.push(questionType(vocabItem));
    }
    
    return shuffleArray(questions);
}

// Initialize questions
let QUESTIONS = generateQuestions();

// Function to regenerate questions (can be called to refresh)
function regenerateQuestions() {
    QUESTIONS = generateQuestions();
    return QUESTIONS;
}
