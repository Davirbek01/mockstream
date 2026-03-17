// Vocabulary Test: Letter & Email Phrases
// Questions and options are randomized on each load

const VOCAB_DATA = [
    { term: "[Formal] Dear Sir or Madam,", en: "Used when you do not know the name of the person you are writing to", uz: "Hurmatli janob yoki xonim (ism-sharifi noma'lumligida)" },
    { term: "[Formal] Dear Mr. Smith / Dear Ms. Jones,", en: "Used when you know the surname but want to remain formal", uz: "Hurmatli janob Smit / Hurmatli xonim Jons (familiya bilan)" },
    { term: "[Semi-formal] Dear John,", en: "Used for someone you have a professional but friendly relationship with", uz: "Hurmatli Jon (ism bilan, yarim-rasmiy)" },
    { term: "[Informal] Hi Sarah / Hey Sarah,", en: "Used for friends or close colleagues", uz: "Salom Sara (norasmiy)" },
    { term: "[Formal] To whom it may concern,", en: "Used for general inquiries or testimonials where the specific recipient is unknown", uz: "Tegishli shaxslar (idora) e'tiboriga," },
    { term: "[Formal] I am writing to...", en: "A standard way to start stating the purpose of your letter/email", uz: "Men ... maqsadda yozyapman" },
    { term: "[Formal] With reference to your letter of...", en: "Used to refer back to previous correspondence", uz: "... sanadagi xatingizga tayanib / asosan" },
    { term: "[Formal] Further to our phone conversation,", en: "Used when writing to confirm something discussed over the phone", uz: "Telefon orqali suhbatimizga qo'shimcha ravishda" },
    { term: "[Informal] I'm just writing to say...", en: "A casual way to introduce the point of your message", uz: "Shunchaki ... deyish uchun yozyapman" },
    { term: "[Informal] Hope you're doing well!", en: "A very common friendly opening", uz: "Umid qilamanki, ishlaring yaxshi!" },
    { term: "[Formal] I am writing on behalf of...", en: "Used when writing for another person or organization", uz: "... nomidan yozyapman" },
    { term: "[Formal] Please accept my apologies for...", en: "A formal way to start an apology", uz: "... uchun uzrimni qabul qiling" },
    { term: "[Informal] Sorry I haven't written for a while,", en: "Used when starting a letter to a friend after a long silence", uz: "Ancha vaqtdan beri yozmaganim uchun uzr," },
    { term: "[Formal] I would like to express my gratitude for...", en: "A formal way of saying thank you", uz: "... uchun o'z minnatdorchiligimni bildirmoqchi edim" },
    { term: "[Informal] Thanks a lot for...", en: "A casual way of thanking someone", uz: "... uchun katta rahmat" },
    { term: "[Formal] It is my pleasure to inform you that...", en: "Used to introduce positive news", uz: "Sizga ...ni ma'lum qilishdan mamnunman" },
    { term: "[Formal] I regret to inform you that...", en: "Used to introduce negative news", uz: "Afsus bilan shuni ma'lum qilamanki..." },
    { term: "[Formal] I would be grateful if you could...", en: "A polite and formal way to make a request", uz: "...sangiz, minnatdor bo'lar edim (iltimos)" },
    { term: "[Formal] I would appreciate it if you could...", en: "Another polite way to request something", uz: "...sangiz, juda mamnun (minnatdor) bo'lardim" },
    { term: "[Informal] Do you think you could...?", en: "A casual way to ask for a favor", uz: "... bera olasanmi deb o'ylayman? (iltimos)" },
    { term: "[Informal] Could you do me a favor and...?", en: "Asking for help from a friend", uz: "Menga bir yaxshilik qilib, ... olasanmi?" },
    { term: "[Formal] I am writing to complain about...", en: "Standard opening for a letter of complaint", uz: "... haqida shikoyat qilish uchun yozyapman" },
    { term: "[Formal] I am writing to request...", en: "A direct formal request", uz: "...ni so'rash (so'rov yuborish) uchun yozyapman" },
    { term: "[Formal] Please find attached...", en: "The standard way to refer to email attachments", uz: "Ilova qilingan ... bilan tanishib chiqing" },
    { term: "[Informal] I've attached...", en: "Casual way to mention attachments", uz: "Menga ...ni biriktirib qo'ydim" },
    { term: "[Formal] I am pleased to confirm that...", en: "Used to provide official positive confirmation", uz: "...ni tasdiqlashdan mamnunman" },
    { term: "[Formal] I am writing to inform you that...", en: "Standard way to provide official information", uz: "Sizga ...ni ma'lum qilish uchun yozyapman" },
    { term: "[Formal] Please be advised that...", en: "A formal way to give a notice or warning", uz: "Shuni ma'lum qilamizki (e'tibor bering)," },
    { term: "[Informal] Just wanted to let you know that...", en: "Casual way to give information", uz: "Shunchaki ...ni aytib (xabar berib) qo'ymoqchi edim" },
    { term: "[Formal] I would like to offer my sincerest apologies for...", en: "A very deep and formal apology", uz: "... uchun o'zimning samimiy uzrimni bildirmoqchiman" },
    { term: "[Formal] We apologize for the inconvenience caused by...", en: "Formal business apology", uz: "... keltirgan noqulayliklar uchun uzr so'raymiz" },
    { term: "[Informal] I'm really sorry about...", en: "Common casual apology", uz: "... uchun juda ham afsusdaman (kechir)" },
    { term: "[Formal] I am writing to express my dissatisfaction with...", en: "Formal way to lead into a complaint", uz: "...dan noroziligimni bildirish uchun yozyapman" },
    { term: "[Formal] I would like a refund as soon as possible.", en: "Direct formal demand for money back", uz: "To'lovni (pulni) imkon qadar tezroq qaytarishingizni so'rayman." },
    { term: "[Informal] I was really disappointed with...", en: "Casual way to express a complaint", uz: "... meni juda xafa (hafsalamni pir) qildi" },
    { term: "[Formal] Should you require further information, please...", en: "Standard offer of more details", uz: "Agar qo'shimcha ma'lumot kerak bo'lsa, iltimos..." },
    { term: "[Informal] If you need anything else, just let me know.", en: "Casual offer of help or information", uz: "Agar yana biror narsa kerak bo'lsa, manga aytib qo'y." },
    { term: "[Formal] I look forward to hearing from you.", en: "Standard formal closing", uz: "Sizdan javob kutib qolaman." },
    { term: "[Formal] I look forward to your reply.", en: "Standard formal closing", uz: "Sizning javobingizni kutib qolaman." },
    { term: "[Informal] I can't wait to see you!", en: "Excited closing for a friend", uz: "Seni ko'rishni sabrsizlik bilan kutyapman!" },
    { term: "[Formal] Thank you in advance for your cooperation.", en: "Used when you have asked for help or action", uz: "Hamkorligingiz (ko'magingiz) uchun oldindan rahmat." },
    { term: "[Informal] Write back soon!", en: "Casual request for a reply", uz: "Tezroq javob yoz!" },
    { term: "[Formal] Yours faithfully,", en: "Used when the letter begins with 'Dear Sir or Madam'", uz: "Hurmat bilan (ism-sharifi noma'lumligida)" },
    { term: "[Formal] Yours sincerely,", en: "Used when the letter begins with the person's name", uz: "Hurmat bilan (ism-sharifi ma'lumligida)" },
    { term: "[Semi-formal] Kind regards / Best regards,", en: "The most common professional closing", uz: "Ehtirom ila (yaxshi tilaklar bilan)" },
    { term: "[Informal] Best wishes,", en: "A friendly closing for friends or acquaintances", uz: "Eng ezgu tilaklar bilan," },
    { term: "[Informal] All the best,", en: "Another friendly and casual way to end a message", uz: "Hammasi yaxshi bo'lsin (yaxshi qol)," },
    { term: "[Informal] Take care,", en: "Warm closing for friends", uz: "O'zingni ehtiyot qil," },
    { term: "[Informal] Love / Lots of love,", en: "Used for family or very close friends", uz: "Mehr bilan (ko'p mehr ila)," },
    { term: "[Informal] Keep in touch!", en: "Used when you want to stay in contact", uz: "Aloqada bo'lib turaylik!" }
];

const TEST_META = {
    title: "✉️ Letter & Email Phrases Test",
    logo: "✉️",
    brand: "Mock Stream",
    subtitle: "Letter & Email Phrases (Formal/Informal)",
    primary: "#0891b2",
    secondary: "#0e7490"
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
