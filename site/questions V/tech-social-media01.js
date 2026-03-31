// Vocabulary Test: Technology & Social Media
// Questions and options are randomized on each load

const VOCAB_DATA = [
    { term: "scroll through your feed", en: "Look at posts by moving up/down on social media", uz: "lenta bo'ylab skroll qilish" },
    { term: "post a story", en: "Share temporary content that disappears after 24 hours", uz: "stori joylash" },
    { term: "go live / livestream", en: "Broadcast video in real-time", uz: "jonli efirga chiqmoq" },
    { term: "share a link", en: "Send a URL to others", uz: "havolani ulashmoq" },
    { term: "mute notifications", en: "Turn off alerts from an app", uz: "bildirishnomalarni o'chirib qo'ymoq" },
    { term: "block/report a user", en: "Prevent someone from contacting you / complain about them", uz: "foydalanuvchini bloklash / shikoyat qilish" },
    { term: "privacy settings", en: "Controls for who can see your information", uz: "maxfiylik sozlamalari" },
    { term: "two-factor authentication", en: "Extra security step using two verification methods", uz: "ikki bosqichli tasdiqlash" },
    { term: "data breach", en: "When private information is stolen or leaked", uz: "ma'lumotlar sizib chiqishi" },
    { term: "phishing scam", en: "Fake message trying to steal your information", uz: "phishing firibgarligi" },
    { term: "fake account", en: "Account pretending to be someone else", uz: "soxta akkaunt" },
    { term: "digital footprint", en: "Trail of data you leave online", uz: "raqamli iz" },
    { term: "the app is down", en: "The application is not working", uz: "ilova ishlamay qoldi" },
    { term: "weak Wi-Fi signal", en: "Poor internet connection", uz: "Wi-Fi signali kuchsiz" },
    { term: "software bug", en: "Error or problem in a program", uz: "dastur xatosi (bug)" },
    { term: "latest update", en: "Most recent version of an app or software", uz: "so'nggi yangilanish" },
    { term: "battery is drained", en: "Battery has no power left", uz: "batareya tugab qolgan" },
    { term: "the phone is lagging", en: "Phone is running slowly", uz: "telefon sekin ishlayapti" },
    { term: "digital detox", en: "Taking a break from technology", uz: "raqamli detoks" },
    { term: "screen-time limits", en: "Restrictions on how long you use devices", uz: "ekran vaqtini cheklash" },
    { term: "information overload", en: "Too much information to process", uz: "axborot haddan tashqari ko'pligi" },
    { term: "fact-check sources", en: "Verify if information is true", uz: "manbalarni tekshirib ko'rmoq" },
    { term: "online harassment", en: "Bullying or abuse on the internet", uz: "onlayn bezorilik/tazyiq" },
    { term: "set boundaries", en: "Create limits for healthy tech use", uz: "chegaralar qo'ymoq" },
    { term: "go viral", en: "Spread very quickly online", uz: "tez tarqalib ketmoq" },
    { term: "doomscrolling", en: "Endlessly scrolling through negative news", uz: "uzluksiz salbiy postlarni skroll qilish" },
    { term: "trending topic", en: "Subject that many people are discussing online", uz: "trendda bo'lgan mavzu" },
    { term: "influencer", en: "Person with many followers who affects opinions", uz: "influenser" },
    { term: "content creator", en: "Person who makes videos, posts, or other media", uz: "kontent yaratuvchi" },
    { term: "follower / subscriber", en: "Person who follows your account", uz: "obunachi / kuzatuvchi" },
    { term: "algorithm", en: "System that decides what content you see", uz: "algoritm" },
    { term: "engagement", en: "Likes, comments, shares on a post", uz: "faollik / engagement" },
    { term: "click-bait", en: "Misleading headline to get clicks", uz: "klik-beyt" },
    { term: "unfollow / unsubscribe", en: "Stop following someone's account", uz: "obunadan chiqish" },
    { term: "hashtag", en: "Word with # used to categorize posts", uz: "heshteg" },
    { term: "tag someone", en: "Mention a person in a post", uz: "birovni belgilamoq" },
    { term: "direct message (DM)", en: "Private message on social media", uz: "shaxsiy xabar (DM)" },
    { term: "comment section", en: "Area below a post where people write responses", uz: "izohlar bo'limi" },
    { term: "repost / retweet / share", en: "Share someone else's content on your profile", uz: "qayta ulashmoq" },
    { term: "like / react", en: "Show approval on a post", uz: "layk bosmoq / reaksiya bildirmoq" },
    { term: "save a post", en: "Bookmark content to view later", uz: "postni saqlab qo'ymoq" },
    { term: "notification", en: "Alert about activity on your account", uz: "bildirishnoma" },
    { term: "log in / log out", en: "Enter or exit your account", uz: "tizimga kirish / chiqish" },
    { term: "sign up / register", en: "Create a new account", uz: "ro'yxatdan o'tmoq" },
    { term: "username", en: "Name you choose for your account", uz: "foydalanuvchi nomi" },
    { term: "password", en: "Secret word to access your account", uz: "parol" },
    { term: "verify your account", en: "Prove your identity to get a badge", uz: "akkauntni tasdiqlash" },
    { term: "spam", en: "Unwanted or repetitive messages", uz: "spam" },
    { term: "bot", en: "Automated account that isn't a real person", uz: "bot" },
    { term: "cybersecurity", en: "Protection of computer systems from attacks", uz: "kibersecurity" }
];

const TEST_META = {
    title: "📱 Tech & Social Media Vocabulary",
    logo: "📱",
    brand: "Mock Stream",
    subtitle: "Technology & Social Media",
    primary: "#6366f1",
    secondary: "#4f46e5"
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
