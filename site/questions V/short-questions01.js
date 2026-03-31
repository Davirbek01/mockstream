// Vocabulary Test: Short Questions — Conversational English (B1–C1)
// Questions and options are randomized on each load

const VOCAB_DATA = [
    { term: "What do you mean exactly?", en: "Explain / clarify (super common)", uz: "Aniqroq nimani nazarda tutyapsan?" },
    { term: "What's that supposed to mean?", en: "Explain / clarify (super common)", uz: "Bu nimani anglatadi o'zi? / Nima demoqchisan?" },
    { term: "How do you mean?", en: "Explain / clarify (super common)", uz: "Qanday ma'noda aytyapsan?" },
    { term: "What are you getting at?", en: "Explain / clarify (super common)", uz: "Nimani demoqchisan? / Nima tomonga olib ketyapsan?" },
    { term: "What's your point?", en: "Explain / clarify (super common)", uz: "Nimani aytmoqchisan? / Maqsading nima?" },
    { term: "What's the difference?", en: "Explain / clarify (super common)", uz: "Farqi nimada?" },
    { term: "What's that about?", en: "Explain / clarify (super common)", uz: "Bu nima haqida? / Bu nimasi?" },
    { term: "Which one?", en: "Details / specifics", uz: "Qaysi biri?" },
    { term: "Which part?", en: "Details / specifics", uz: "Qaysi qismi?" },
    { term: "When exactly?", en: "Details / specifics", uz: "Aniq qachon?" },
    { term: "Where exactly?", en: "Details / specifics", uz: "Aniq qayerda?" },
    { term: "Who with?", en: "Details / specifics", uz: "Kim bilan?" },
    { term: "How long for?", en: "Details / specifics", uz: "Qancha vaqtga?" },
    { term: "How many are we talking?", en: "Details / specifics", uz: "Qancha deyapsan o'zi?" },
    { term: "To what extent?", en: "Details / specifics", uz: "Qanchalik? / Qancha darajada?" },
    { term: "And what?", en: "Reaction questions", uz: "Keyin-chi? / Xo'sh?" },
    { term: "So what?", en: "Reaction questions", uz: "Xo'sh, nima bo'pti? / Undan nima?" },
    { term: "Then?", en: "Reaction questions", uz: "Keyin-chi?" },
    { term: "What now?", en: "Reaction questions", uz: "Endi nima?" },
    { term: "What's next?", en: "Reaction questions", uz: "Keyingi nima?" },
    { term: "Is that it?", en: "Reaction questions", uz: "Shumi xolos?" },
    { term: "For real?", en: "Surprise / disbelief (informal)", uz: "Rostdanmi?" },
    { term: "You're serious?", en: "Surprise / disbelief (informal)", uz: "Jiddiy aytyapsanmi?" },
    { term: "Are you kidding me?", en: "Surprise / disbelief (informal)", uz: "Hazillashyapsanmi?" },
    { term: "No kidding?", en: "Surprise / disbelief (informal)", uz: "Rostdan-a?" },
    { term: "You're joking, aren't you?", en: "Surprise / disbelief (informal)", uz: "Hazillashyapsan-a?" },
    { term: "What?!", en: "Surprise / disbelief (informal)", uz: "Nima?!" },
    { term: "Really though?", en: "Soft challenge / doubt", uz: "Rostdan ham shundaymi?" },
    { term: "Do you really think so?", en: "Soft challenge / doubt", uz: "Rostdan shunday deb o'ylaysanmi?" },
    { term: "Are you sure?", en: "Soft challenge / doubt", uz: "Ishonching komilmi?" },
    { term: "Sure about that?", en: "Soft challenge / doubt", uz: "Shunga aniqmisiz?" },
    { term: "Based on what?", en: "Soft challenge / doubt", uz: "Nimaga asoslanib?" },
    { term: "According to who?", en: "Soft challenge / doubt", uz: "Kimning gapiga ko'ra?" },
    { term: "Says who?", en: "Soft challenge / doubt", uz: "Kim aytdi? / Kim dedi?" },
    { term: "What's your source?", en: "Soft challenge / doubt", uz: "Manbang nima?" },
    { term: "Fair enough. But…?", en: "Agree/disagree prompts", uz: "Mayli, lekin…?" },
    { term: "True, but what about…?", en: "Agree/disagree prompts", uz: "To'g'ri, lekin …-chi?" },
    { term: "Yeah, but still?", en: "Agree/disagree prompts", uz: "Ha, lekin baribir-chi?" },
    { term: "Does that make sense?", en: "Agree/disagree prompts", uz: "Tushunarlimi? / Mantiqlimi?" },
    { term: "Right?", en: "Quick checking / confirming", uz: "To'g'rimi?" },
    { term: "Yeah?", en: "Quick checking / confirming", uz: "Ha? / Shunaqami?" },
    { term: "You get me?", en: "Quick checking / confirming", uz: "Tushundingmi?" },
    { term: "You know what I mean?", en: "Quick checking / confirming", uz: "Nimani nazarda tutganimni tushunyapsanmi?" },
    { term: "Is that what you mean?", en: "Quick checking / confirming", uz: "Shuni demoqchimisiz?" },
    { term: "What's up with that?", en: "Very informal / slangy (use with friends only)", uz: "Nega bunaqa bo'lyapti? / Nima bo'ldi bunga?" },
    { term: "What's going on?", en: "Very informal / slangy (use with friends only)", uz: "Nima bo'lyapti?" },
    { term: "What's the deal?", en: "Very informal / slangy (use with friends only)", uz: "Gap nima o'zi?" },
    { term: "What's the catch?", en: "Very informal / slangy (use with friends only)", uz: "Qandaydir hiylasi bormi? / \"Podvox\"i bormi?" },
    { term: "What's the story?", en: "Very informal / slangy (use with friends only)", uz: "Nima gap? / Nima bo'ldi?" },
    { term: "What else?", en: "Asking for more information", uz: "Yana nima? / Boshqa-chi?" }
];

const TEST_META = {
    title: "❓ Short Questions Test",
    logo: "❓",
    brand: "Mock Stream",
    subtitle: "Short Questions — Conversational English (B1–C1)",
    primary: "#dc2626",
    secondary: "#b91c1c"
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
