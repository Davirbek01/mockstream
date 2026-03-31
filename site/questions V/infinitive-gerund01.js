// Vocabulary Test: Infinitive & Gerund (B1-C1)
// Questions and options are randomized on each load

const VOCAB_DATA = [
    { term: "admit + gerund", en: "confess to doing something", uz: "tan olish / e'tirof etish" },
    { term: "advise + gerund", en: "recommend doing something", uz: "maslahat berish" },
    { term: "allow + gerund", en: "permit an activity", uz: "ruxsat berish" },
    { term: "anticipate + gerund", en: "expect or look forward to something", uz: "kutmoq / oldindan bilmoq" },
    { term: "appreciate + gerund", en: "value or be grateful for an action", uz: "qadrlash / minnatdor bo'lish" },
    { term: "avoid + gerund", en: "keep away from doing something", uz: "qochmoq / saqlanish" },
    { term: "begin + gerund/infinitive", en: "start an activity", uz: "boshlamoq" },
    { term: "can't bear + gerund/infinitive", en: "unable to tolerate", uz: "chiday olmaslik" },
    { term: "can't help + gerund", en: "unable to stop oneself", uz: "o'zini tutib turolmaslik" },
    { term: "can't stand + gerund", en: "strongly dislike", uz: "chiday olmaslik / yoqtirmaslik" },
    { term: "cease + gerund/infinitive", en: "stop", uz: "to'xtatmoq / to'xtamoq" },
    { term: "consider + gerund", en: "think about doing", uz: "o'ylamoq / ko'rib chiqmoq" },
    { term: "continue + gerund/infinitive", en: "keep doing", uz: "davom ettirmoq" },
    { term: "delay + gerund", en: "postpone", uz: "kechiktirmoq" },
    { term: "deny + gerund", en: "refuse to admit", uz: "inkor qilmoq" },
    { term: "discuss + gerund", en: "talk about an action", uz: "muhokama qilmoq" },
    { term: "dislike + gerund", en: "not enjoy", uz: "yoqtirmaslik" },
    { term: "dread + gerund", en: "fear doing something", uz: "qo'rqmoq" },
    { term: "enjoy + gerund", en: "take pleasure in", uz: "zavqlanmoq" },
    { term: "escape + gerund", en: "avoid something bad", uz: "qochmoq / qutulmoq" },
    { term: "fancy + gerund", en: "feel like doing", uz: "xohlamoq" },
    { term: "feel like + gerund", en: "want to do", uz: "xohlamoq / istamoq" },
    { term: "finish + gerund", en: "complete an action", uz: "tugatmoq" },
    { term: "forbid + gerund", en: "not allow", uz: "taqiqlamoq / man qilmoq" },
    { term: "forget + gerund", en: "not remember doing", uz: "unutmoq (qilingan ishni)" },
    { term: "forget + infinitive", en: "fail to remember to do", uz: "unutmoq (qilish kerak bo'lgan ishni)" },
    { term: "give up + gerund", en: "stop doing", uz: "tashlamoq / to'xtatmoq" },
    { term: "go on + gerund", en: "continue", uz: "davom etmoq" },
    { term: "go on + infinitive", en: "proceed to the next action", uz: "keyingi ishga o'tmoq" },
    { term: "hate + gerund/infinitive", en: "strongly dislike", uz: "yomon ko'rmoq" },
    { term: "have + infinitive", en: "must do", uz: "bajarishga majbur bo'lmoq" },
    { term: "help + infinitive", en: "assist in doing", uz: "yordam bermoq" },
    { term: "hesitate + infinitive", en: "be uncertain about doing", uz: "ikkilanmoq" },
    { term: "hope + infinitive", en: "want something to happen", uz: "umid qilmoq" },
    { term: "imagine + gerund", en: "think about a possibility", uz: "tasavvur qilmoq" },
    { term: "intend + infinitive", en: "plan to do", uz: "niyat qilmoq" },
    { term: "involve + gerund", en: "include as a part", uz: "o'z ichiga olmoq" },
    { term: "keep + gerund", en: "continue", uz: "davom ettirmoq" },
    { term: "learn + infinitive", en: "gain knowledge to do", uz: "o'rganmoq" },
    { term: "like + gerund/infinitive", en: "enjoy", uz: "yoqtirmoq" },
    { term: "love + gerund/infinitive", en: "greatly enjoy", uz: "juda yoqtirmoq" },
    { term: "manage + infinitive", en: "succeed in doing", uz: "uddalash / epdamoq" },
    { term: "mean + gerund", en: "involve", uz: "anglatmoq" },
    { term: "mean + infinitive", en: "intend", uz: "niyat qilmoq" },
    { term: "mind + gerund", en: "object to", uz: "qarshilik bildirmoq" },
    { term: "miss + gerund", en: "feel the loss of", uz: "sog'inmoq" },
    { term: "need + gerund", en: "require (passive meaning)", uz: "kerak bo'lmoq (passiv)" },
    { term: "need + infinitive", en: "have to", uz: "kerak bo'lmoq" },
    { term: "offer + infinitive", en: "volunteer to do", uz: "taklif qilmoq" },
    { term: "plan + infinitive", en: "intend", uz: "rejalashtirmoq" }
];

const TEST_META = {
    title: "📘 Infinitive & Gerund Test",
    logo: "📘",
    brand: "Mock Stream",
    subtitle: "Infinitive & Gerund Patterns (B1-C1)",
    primary: "#2563eb",
    secondary: "#1d4ed8"
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
