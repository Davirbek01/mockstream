// Vocabulary Test: Personality & Human Behavior (B1–C1)
// Questions and options are randomized on each load

const VOCAB_DATA = [
    { term: "broad-minded", en: "willing to understand and accept other people's ideas and opinions", uz: "dunyoqarashi keng" },
    { term: "strong-willed", en: "determined to do what you want even if other people advise you not to", uz: "irodali / qat'iy" },
    { term: "self-assured", en: "having confidence in your own abilities", uz: "o'ziga ishongan" },
    { term: "easy-going", en: "relaxed and not easily upset or worried", uz: "kirishimli / og'ir-vazmin" },
    { term: "trustworthy", en: "able to be relied on as honest or truthful", uz: "ishonchli" },
    { term: "charismatic", en: "possessing a compelling charm that inspires devotion in others", uz: "karizmatik / o'ziga tortuvchi" },
    { term: "resourceful", en: "having the ability to find quick and clever ways to overcome difficulties", uz: "topqir / uddaburon" },
    { term: "diligent", en: "showing care and effort in your work or duties", uz: "tirishqoq / g'ayratli" },
    { term: "down-to-earth", en: "practical, reasonable, and friendly", uz: "samimiy / kamtar / hayotiy" },
    { term: "life and soul of the party", en: "someone who is energetic and funny and at the center of social activity", uz: "davraning guli" },
    { term: "heart of gold", en: "a very kind and generous character", uz: "mehribon / oltin qalb egasi" },
    { term: "quick-witted", en: "able to think and understand things quickly", uz: "hozirjavob / o'tkir zehnli" },
    { term: "empathetic", en: "having the ability to understand and share the feelings of another", uz: "hamdard / tushunadigan" },
    { term: "industrious", en: "hard-working and persistent", uz: "mehnatsevar / g'ayratli" },
    { term: "level-headed", en: "calm and sensible in making judgments or decisions", uz: "mulohazali / vazmin" },
    { term: "humble", en: "not proud or arrogant; modest", uz: "kamtarin" },
    { term: "good-natured", en: "kind, friendly, and patient", uz: "ko'ngli ochiq / muloyim" },
    { term: "ambitious", en: "having a strong desire to succeed or achieve something", uz: "intiluvchan / ambitsiyali" },
    { term: "conscientious", en: "wishing to do what is right, especially to do one's work or duty well", uz: "vijdonli / mas'uliyatli" },
    { term: "witty", en: "showing or characterized by quick and inventive verbal humor", uz: "zukko / qiziqarli javob beruvchi" },
    { term: "thoughtful", en: "showing consideration for the needs of other people", uz: "mulohazali / e'tiborli" },
    { term: "sociable", en: "willing to talk and engage in activities with other people", uz: "kirishimli / xushchaqchaq" },
    { term: "adventurous", en: "willing to take risks or to try out new methods, ideas, or experiences", uz: "sarguzashtsevar" },
    { term: "persistent", en: "continuing firmly in a course of action in spite of difficulty or opposition", uz: "qat'iyatli / bo'sh kelmaydigan" },
    { term: "upbeat", en: "cheerful and optimistic", uz: "xushkayfiyat / optimistik" },
    { term: "narrow-minded", en: "not willing to listen to or tolerate other people's views", uz: "dunyoqarashi tor / fikri qisqa" },
    { term: "self-centered", en: "preoccupied with oneself and one's affairs", uz: "xudbin / faqat o'zini o'ylaydigan" },
    { term: "absent-minded", en: "having or showing a habitually forgetful or inattentive disposition", uz: "parishonxotir" },
    { term: "conceited", en: "excessively proud of oneself; vain", uz: "kibrli / manman" },
    { term: "stubborn", en: "having or showing dogged determination not to change one's attitude or position", uz: "o'jar / qaysar" },
    { term: "hypocritical", en: "behaving in a way that suggests one has higher standards or more noble beliefs than is the case", uz: "munofiq / ikkiyuzlamachi" },
    { term: "unreliable", en: "not able to be relied upon", uz: "ishonchsiz / so'zida turmaydigan" },
    { term: "manipulative", en: "characterised by unscrupulous control of a situation or person", uz: "manipulyator / odamlardan foydalanadigan" },
    { term: "envious", en: "feeling or showing envy", uz: "hasadgo'y / ichi qora" },
    { term: "arrogant", en: "having or revealing an exaggerated sense of one's own importance or abilities", uz: "takabbur / kibrli" },
    { term: "complacent", en: "showing smug or uncritical satisfaction with oneself or one's achievements", uz: "o'zidan mamnun / xotirjamlikka berilgan" },
    { term: "vindictive", en: "having or showing a strong or unreasoning desire for revenge", uz: "kekchi / o'ch oluvchi" },
    { term: "pessimistic", en: "tending to see the worst aspect of things or believe that the worst will happen", uz: "pessimist / yomonlikni kutuvchi" },
    { term: "moody", en: "given to unpredictable changes of mood, especially sudden bouts of gloominess or sullenness", uz: "kayfiyati tez o'zgaruvchan / injiq" },
    { term: "judgmental", en: "having or displaying an excessively critical point of view", uz: "boshqalarni tanqid qiluvchi / hukm chiqaruvchi" },
    { term: "greedy", en: "having or showing an intense and selfish desire for wealth or power", uz: "ochko'z / ochofat" },
    { term: "big-headed", en: "conceited or arrogant", uz: "kibrli / manman" },
    { term: "clumsy", en: "awkward in movement or in handling things", uz: "no'noq / lapashang / beo'xshov" },
    { term: "cunning", en: "having or showing skill in achieving one's ends by deceit or evasion", uz: "ayyor / tullak" },
    { term: "fickle", en: "changing frequently, especially as regards one's loyalties or interests", uz: "beqaror / o'zgaruvchan" },
    { term: "overwhelmed", en: "feeling a strong emotional effect that is difficult to cope with", uz: "dong qotgan / hislar ostida qolgan" },
    { term: "ecstatic", en: "feeling or expressing overwhelming happiness or joyful excitement", uz: "juda xursand / sarmast" },
    { term: "apprehensive", en: "anxious or fearful that something bad or unpleasant will happen", uz: "xavotirda / hadiksiragan" },
    { term: "devastated", en: "extremely shocked and upset", uz: "qattiq qayg'uda / ruhan singan" },
    { term: "resilient", en: "able to withstand or recover quickly from difficult conditions", uz: "bardoshli / chidamli" }
];

const TEST_META = {
    title: "🧠 Personality Vocabulary Test",
    logo: "🧠",
    brand: "Mock Stream",
    subtitle: "Personality & Human Behavior (B1–C1)",
    primary: "#ec4899",
    secondary: "#db2777"
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
