// Vocabulary Test: Idioms
// Questions and options are randomized on each load

const VOCAB_DATA = [
    { term: "a drop in the ocean", en: "a very small, ineffective amount", uz: "dengizdagi tomchi; juda kichik ta'sir" },
    { term: "a home from home", en: "a place as comfortable as your own home", uz: "uydek qulay joy" },
    { term: "a leopard can't change its spots", en: "people don't change their true nature", uz: "tabiat o'zgarmaydi; bo'rining fe'li o'lmas" },
    { term: "a sight for sore eyes", en: "something/someone very pleasing to see", uz: "ko'ngilni yayratadigan manzara" },
    { term: "a stitch in time (saves nine)", en: "deal with a problem early", uz: "o'z vaqtida choraga qo'l urish" },
    { term: "a stone's throw (away/from)", en: "very close distance", uz: "tosh otim masofa" },
    { term: "Achilles' heel", en: "a weak point", uz: "Axilles tovoni; kuchsiz nuqta" },
    { term: "add fuel to the fire", en: "make a bad situation worse", uz: "olovga yog' quyish" },
    { term: "all in good time", en: "everything at the right time; don't rush", uz: "hammasi o'z vaqtida" },
    { term: "break the mould", en: "do something very different", uz: "andazani buzmoq" },
    { term: "cry over spilt milk", en: "waste time regretting the past", uz: "o'tgan ishga salovat" },
    { term: "come rain or shine", en: "no matter the conditions", uz: "har qanday sharoitda" },
    { term: "grin and bear it", en: "tolerate without complaining", uz: "chidamoq" },
    { term: "once in a blue moon", en: "very rarely", uz: "juda kamdan-kam" },
    { term: "out of the blue", en: "suddenly and unexpectedly", uz: "kutilmaganda" },
    { term: "pull a few strings", en: "use influence/contacts", uz: "aloqadan foydalanmoq" },
    { term: "touch wood", en: "said to avoid bad luck", uz: "ko'z tegmasin" },
    { term: "turn over a new leaf", en: "start to behave better", uz: "yangi hayot boshlamoq" },
    { term: "see eye to eye", en: "agree completely", uz: "kelishmoq" },
    { term: "put your feet up", en: "sit back and relax", uz: "oyoq uzatib dam olish" },
    { term: "the best of both worlds", en: "all the advantages of two different things", uz: "ikki dunyoning yaxshiligi" },
    { term: "speak of the devil", en: "said when someone appears just as you mention them", uz: "oti chiqdi, darhol keldi" },
    { term: "on cloud nine", en: "extremely happy", uz: "baxtdan osmonda uchish" },
    { term: "hit the nail on the head", en: "describe exactly what is causing a situation", uz: "to'g'ri aytish" },
    { term: "let the cat out of the bag", en: "reveal a secret by mistake", uz: "sirni oshkor qilish" },
    { term: "cost an arm and a leg", en: "be very expensive", uz: "juda qimmat turish" },
    { term: "break the ice", en: "make people feel more comfortable", uz: "muhitni yumshatish" },
    { term: "piece of cake", en: "very easy", uz: "juda oson" },
    { term: "under the weather", en: "feeling ill", uz: "sog'lom emas, kasal" },
    { term: "kill two birds with one stone", en: "achieve two things at once", uz: "bir o'q bilan ikki quyonni urish" },
    { term: "bite the bullet", en: "force yourself to do something unpleasant", uz: "majbur bo'lib qilish" },
    { term: "beat around the bush", en: "avoid saying what you mean", uz: "gapni aylanib yurish" },
    { term: "the ball is in your court", en: "it's your decision or responsibility now", uz: "navbat senda" },
    { term: "get cold feet", en: "suddenly become too frightened to do something", uz: "qo'rqib ketish" },
    { term: "spill the beans", en: "reveal secret information", uz: "sirni ochish" },
    { term: "hit the books", en: "study hard", uz: "qattiq o'qish" },
    { term: "when pigs fly", en: "something that will never happen", uz: "hech qachon bo'lmaydi" },
    { term: "burn the midnight oil", en: "work late into the night", uz: "kechagacha ishlash" },
    { term: "get your act together", en: "organize yourself and behave responsibly", uz: "o'zingni to'pla" },
    { term: "pull yourself together", en: "calm down and behave normally", uz: "o'zingni tut" },
    { term: "make a long story short", en: "tell something briefly", uz: "qisqa qilib aytish" },
    { term: "miss the boat", en: "miss an opportunity", uz: "imkoniyatni boy berish" },
    { term: "cross that bridge when you come to it", en: "deal with a problem when it happens", uz: "muammoni kelib chiqqanda hal qilish" },
    { term: "take it with a grain of salt", en: "not take something too seriously", uz: "ishonmaslik kerak" },
    { term: "the last straw", en: "the final problem that makes you lose patience", uz: "chidamning oxirgi chegarasi" },
    { term: "throw in the towel", en: "give up", uz: "taslim bo'lish" },
    { term: "cut corners", en: "do something badly to save time or money", uz: "tejash uchun sifatni pasaytirish" },
    { term: "go back to the drawing board", en: "start planning something again", uz: "qaytadan boshlash" },
    { term: "jump on the bandwagon", en: "join others in doing something fashionable", uz: "ommaga qo'shilish" },
    { term: "call it a day", en: "stop working", uz: "ishni yakunlash" }
];

const TEST_META = {
    title: "✨ Idioms Vocabulary Test",
    logo: "✨",
    brand: "Mock Stream",
    subtitle: "Idioms & Expressions",
    primary: "#f59e0b",
    secondary: "#d97706"
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
