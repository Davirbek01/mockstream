// Vocabulary Test: Work & Career (B1–C1)
// Questions and options are randomized on each load

const VOCAB_DATA = [
    { term: "apply for a job", en: "send your CV and documents to get a position", uz: "ishga ariza topshirmoq" },
    { term: "land a job", en: "successfully get a job", uz: "ishga kirmoq / ish topmoq" },
    { term: "job opening", en: "an available position at a company", uz: "bo'sh ish o'rni" },
    { term: "job vacancy", en: "an unfilled position (formal)", uz: "vakansiya" },
    { term: "submit a CV / resume", en: "send your work history document", uz: "rezyume topshirmoq" },
    { term: "cover letter", en: "a letter explaining why you want the job", uz: "motivatsion xat" },
    { term: "job interview", en: "a meeting to discuss if you're right for a job", uz: "ish suhbati" },
    { term: "get shortlisted", en: "be selected as a potential candidate", uz: "tanlov ro'yxatiga kirmoq" },
    { term: "get hired", en: "be officially given a job", uz: "ishga qabul qilinmoq" },
    { term: "turn down a job offer", en: "refuse a job opportunity", uz: "ish taklifini rad etmoq" },
    { term: "accept an offer", en: "agree to take a job", uz: "taklifni qabul qilmoq" },
    { term: "start a new job", en: "begin working at a new position", uz: "yangi ishni boshlamoq" },
    { term: "job hunting", en: "the process of looking for employment", uz: "ish qidirish" },
    { term: "employable", en: "having skills that employers want", uz: "ishga yaroqli" },
    { term: "work experience", en: "previous jobs you've had", uz: "ish tajribasi" },
    { term: "work full-time", en: "work the standard number of hours (usually 40/week)", uz: "to'liq stavkada ishlamoq" },
    { term: "work part-time", en: "work fewer hours than full-time", uz: "yarim stavkada ishlamoq" },
    { term: "work overtime", en: "work extra hours beyond normal schedule", uz: "qo'shimcha soat ishlamoq" },
    { term: "work remotely", en: "work from home or outside the office", uz: "masofaviy ishlamoq" },
    { term: "work from home", en: "do your job from your house", uz: "uydan ishlamoq" },
    { term: "9 to 5 job", en: "a typical office job with regular hours", uz: "standart ofis ishi" },
    { term: "meet a deadline", en: "finish work by the required time", uz: "muddatga ulgurib yetkazmoq" },
    { term: "miss a deadline", en: "fail to finish by the required time", uz: "muddatga ulgurmaslik" },
    { term: "be under pressure", en: "experience stress from demands at work", uz: "bosim ostida bo'lmoq" },
    { term: "heavy workload", en: "a lot of work to do", uz: "og'ir ish yuki" },
    { term: "take on responsibilities", en: "accept new duties", uz: "mas'uliyatni o'z zimmasiga olmoq" },
    { term: "delegate tasks", en: "give tasks to others to complete", uz: "vazifalarni topshirmoq" },
    { term: "multitasking", en: "doing several things at once", uz: "bir nechta ishni bajarish" },
    { term: "attend a meeting", en: "go to and participate in a meeting", uz: "yig'ilishda qatnashmoq" },
    { term: "run a meeting", en: "organize and lead a meeting", uz: "yig'ilishni olib bormoq" },
    { term: "work in a team", en: "collaborate with colleagues", uz: "jamoada ishlamoq" },
    { term: "office politics", en: "power struggles and relationships at work", uz: "ofis siyosati / munosabatlari" },
    { term: "workplace culture", en: "the atmosphere and values at a company", uz: "ish joyi madaniyati" },
    { term: "work-related stress", en: "stress caused by your job", uz: "ishga bog'liq stress" },
    { term: "get promoted", en: "move to a higher position", uz: "lavozimga ko'tarilmoq" },
    { term: "climb the career ladder", en: "advance in your career step by step", uz: "karyera zinapoyasidan ko'tarilmoq" },
    { term: "work your way up", en: "gradually move to higher positions", uz: "past pog'onadan yuqoriga ko'tarilmoq" },
    { term: "make progress in your career", en: "develop professionally", uz: "karyerada o'sish" },
    { term: "career advancement", en: "moving forward in your profession", uz: "karyera rivojlanishi" },
    { term: "career prospects", en: "future opportunities in your job", uz: "karyera istiqbollari" },
    { term: "reach the top", en: "get to the highest position", uz: "cho'qqiga erishmoq" },
    { term: "hit a glass ceiling", en: "face invisible barriers to advancement (often for women)", uz: "ko'rinmas to'siqqa duch kelmoq" },
    { term: "job security", en: "certainty that you won't lose your job", uz: "ish barqarorligi" },
    { term: "career change", en: "switching to a completely different profession", uz: "kasbni o'zgartirish" },
    { term: "professional development", en: "improving skills related to your job", uz: "kasbiy rivojlanish" },
    { term: "take a pay cut", en: "accept a lower salary", uz: "maoshni kamaytirishga rozi bo'lmoq" },
    { term: "get a pay rise", en: "receive an increase in salary", uz: "maosh oshirish olmoq" },
    { term: "earn a living", en: "make money to support yourself", uz: "kun kechirmoq / pul topmoq" },
    { term: "make a living", en: "earn enough money to live", uz: "tirikchilik qilmoq" },
    { term: "work-life balance", en: "having time for both work and personal life", uz: "ish-hayot muvozanati" }
];

const TEST_META = {
    title: "💼 Work & Career Vocabulary",
    logo: "💼",
    brand: "Mock Stream",
    subtitle: "Work & Career (B1–C1)",
    primary: "#475569",
    secondary: "#334155"
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
