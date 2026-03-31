// Vocabulary Test: Three-part Phrasal Verbs (B2–C2)
// Questions and options are randomized on each load

const VOCAB_DATA = [
    { term: "get along with", en: "to have a friendly relationship with someone", uz: "yaxshi chiqishmoq (murosaga kelish)" },
    { term: "look up to", en: "to admire and respect someone", uz: "hurmat qilmoq (o'rnak olmoq)" },
    { term: "look down on", en: "to think that you are better or more important than someone", uz: "past nazar bilan qaramoq (mensimaslik)" },
    { term: "fall out with", en: "to have a quarrel or argument with someone and stop being friends", uz: "urishib qolmoq (aloqani uzmoq)" },
    { term: "look forward to", en: "to feel pleased and excited about something that is going to happen", uz: "intizorlik bilan kutmoq" },
    { term: "get on with", en: "to have a friendly relationship with someone (synonymous with get along with)", uz: "chiqishib ketmoq (murosada bo'lmoq)" },
    { term: "look out for", en: "to take care of someone and make sure they are safe", uz: "g'amxo'rlik qilmoq (ehtiyot qilmoq)" },
    { term: "stand up for", en: "to defend or support an idea or a person who is being criticized or attacked", uz: "himoya qilmoq (tarafini olmoq)" },
    { term: "get back at", en: "to do something bad to someone because they have done something bad to you", uz: "o'ch olmoq (javob qaytarmoq)" },
    { term: "check up on", en: "to make sure that someone is doing what they should be doing", uz: "nazorat qilmoq (tekshirib turmoq)" },
    { term: "walk out on", en: "to abandon someone or a situation suddenly", uz: "tashlab ketmoq (tark etmoq)" },
    { term: "make up for", en: "to compensate for something bad or missing with something good", uz: "o'rnini to'ldirmoq (qoplanmoq)" },
    { term: "listen in on", en: "to listen secretly to what someone is saying", uz: "pinhona (maxfiy) eshitmoq" },
    { term: "catch up with", en: "to reach the same quality or standard as someone or something else", uz: "yetib olmoq (ortda qolmaslik)" },
    { term: "keep up with", en: "to stay informed about something or continue at the same speed/standard", uz: "ortda qolmaslik (bilan qadam tashlamoq)" },
    { term: "drop out of", en: "to stop going to a school, college, or course before you have finished your studies", uz: "tashlab ketmoq (o'qishni to'xtatmoq)" },
    { term: "cut in on", en: "to interrupt someone when they are speaking or dancing", uz: "gapga suqulmoq (bo'lmoq)" },
    { term: "go along with", en: "to agree with or support an idea or plan", uz: "rozi bo'lmoq (qo'shilmoq)" },
    { term: "lead up to", en: "to be the events or actions that happen before an important event", uz: "...ga olib bormoq (tayyorgarlik bo'lmoq)" },
    { term: "gang up on", en: "if a group of people gang up on someone, they join together to attack, criticize, or oppose them", uz: "to'planib qarshi chiqmoq" },
    { term: "look in on", en: "to visit someone for a short time to check they are okay", uz: "xabar olmoq (ko'rib o'tmoq)" },
    { term: "close in on", en: "to gradually get nearer to someone or something that you are pursuing", uz: "yaqinlashmoq (qisib kelmoq)" },
    { term: "run away with", en: "if your feelings or imagination run away with you, you lose control", uz: "hayolga berilmoq (nazoratni yo'qotmoq)" },
    { term: "talk back to", en: "to reply rudely to someone", uz: "gap qaytarmoq (hurmatsizlik bilan)" },
    { term: "get through to", en: "to succeed in making someone understand or believe something", uz: "tushuntirmoq (gap uqtirmoq)" },
    { term: "go through with", en: "to complete something you have started or agreed to do", uz: "oxirigacha yetkazmoq" },
    { term: "come up with", en: "to suggest or think of an idea or plan", uz: "o'ylab topmoq (taklif qilmoq)" },
    { term: "brush up on", en: "to improve your knowledge of something you have already learned", uz: "bilimlarni yangilamoq (mustahkamlamoq)" },
    { term: "get around to", en: "to finally do something that you have been intended to do for a long time", uz: "vaqt topib qilmoq (qo'l tegmoq)" },
    { term: "get down to", en: "to start to direct your efforts and attention towards something", uz: "astoydil kirishmoq" },
    { term: "fill in for", en: "to do someone else's job for a short period of time", uz: "o'rinbosarlik qilmoq (vaqtinchalik)" },
    { term: "measure up to", en: "to be as good as expected or needed", uz: "talabga javob bermoq" },
    { term: "push on with", en: "to continue doing something with effort and determination", uz: "matonat bilan davom ettirmoq" },
    { term: "get through with", en: "to finish doing something", uz: "yakunlamoq (tugatmoq)" },
    { term: "carry on with", en: "to continue doing something as before", uz: "davom ettirmoq (to'xtatmaslik)" },
    { term: "sign up for", en: "to agree to take part in something, such as a course", uz: "ro'yxatdan o'tmoq (a'zo bo'lmoq)" },
    { term: "zero in on", en: "to direct all your attention towards a particular person or thing", uz: "diqqatni qaratmoq (fokuslamoq)" },
    { term: "bone up on", en: "to learn as much as possible about something in a short time", uz: "qisqa vaqtda o'rganib olmoq (tayyorlanmoq)" },
    { term: "read up on", en: "to read a lot about a particular subject", uz: "o'qib o'rganmoq (ma'lumot to'plamoq)" },
    { term: "catch up on", en: "to do something that you did not have time to do earlier", uz: "yetib olmoq (o'rnini to'ldirmoq)" },
    { term: "back out of", en: "to decide not to do something that you had said you would do", uz: "voz kechmoq (va'dani buzmoq)" },
    { term: "look back on", en: "to think about something that happened in the past", uz: "eslamoq (ortga nazar tashlamoq)" },
    { term: "live up to", en: "to be as good as someone hopes or expects", uz: "ishonchni oqlamoq (kutganlarga mos bo'lmoq)" },
    { term: "stand in for", en: "to take someone's place for a short time", uz: "vaqtinchalik o'rnini bosmoq" },
    { term: "fit in with", en: "if something fits in with something else, it is suitable for it or consistent with it", uz: "mos tushmoq (mos kelmoq)" },
    { term: "walk away with", en: "to win something easily", uz: "osonlikcha qo'lga kiritmoq (yutib olmoq)" },
    { term: "lose out on", en: "to fail to get a benefit or an opportunity", uz: "imkoniyatni boy bermoq" },
    { term: "make off with", en: "to steal something and go away with it", uz: "o'g'irlab ketmoq" },
    { term: "get away with", en: "to escape blame or punishment when you do something wrong", uz: "jazosiz qolmoq (qutulib qolmoq)" },
    { term: "put up with", en: "to accept or continue to accept an unpleasant situation or experience", uz: "sabr qilmoq (chidamoq)" }
];

const TEST_META = {
    title: "🔗 Three-part Phrasal Verbs Test",
    logo: "🔗",
    brand: "Mock Stream",
    subtitle: "Three-part Phrasal Verbs (B2–C2)",
    primary: "#7c3aed",
    secondary: "#6d28d9"
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
window.ALL_QUESTIONS = generateQuestions();

// Function to regenerate questions (can be called to refresh)
window.regenerateQuestions = function() {
  window.ALL_QUESTIONS = generateQuestions();
  return window.ALL_QUESTIONS;
}
