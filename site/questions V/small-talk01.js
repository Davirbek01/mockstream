// Vocabulary Test: Small Talk Collocations (A1–C1)
// Questions and options are randomized on each load

const VOCAB_DATA = [
    { term: "break the ice", en: "to say or do something that makes people feel more relaxed in a social situation", uz: "muzni eritmoq (suhbatni boshlab bermoq)" },
    { term: "How have you been?", en: "Used to ask about someone's life since you last saw them", uz: "Ishlar qalay? (ko'rishmaganimizdan beri)" },
    { term: "What's new?", en: "Used as a friendly greeting to ask if anything interesting happened recently", uz: "Nima gaplar? (Yangi nima yangilik bor?)" },
    { term: "strike up a conversation", en: "to start a conversation with someone", uz: "suhbat boshlamoq (gapga solmoq)" },
    { term: "casual greeting", en: "an informal way of saying hello", uz: "norasmiy salomlashish" },
    { term: "exchange pleasantries", en: "to say polite things to each other when meeting for the first time or after a while", uz: "xushmuomalalik bilan gaplashmoq (salom-alik qilmoq)" },
    { term: "Haven't seen you for ages!", en: "Used when meeting someone after a very long time", uz: "Sizni ancha vaqtdan beri ko'rmadim!" },
    { term: "fancy meeting you here", en: "Used when you meet someone you know in an unexpected place", uz: "Sizni bu yerda uchrataman deb o'ylamagandim" },
    { term: "How's your day going?", en: "Used to ask about someone's progress and mood during the day", uz: "Kuningiz qanday o'tyapti?" },
    { term: "keep in touch", en: "to continue to communicate with someone", uz: "aloqada bo'lib turmoq" },
    { term: "catch up with someone", en: "to talk to someone you haven't seen for a while to find out what they have been doing", uz: "hol-ahvol so'rashmoq (yangiliklarni bilmoq)" },
    { term: "What brings you here?", en: "Used to ask why someone is in a particular place", uz: "Sizni bu yerga nima yetakladi?" },
    { term: "How's work?", en: "A common small talk question about someone's job", uz: "Ishlar qalay? (ishdagi holat)" },
    { term: "You're looking well!", en: "A polite way to compliment someone's appearance", uz: "Yaxshi ko'rinasiz! (Sizga ko'z tegmasin)" },
    { term: "Busy as usual?", en: "Used to ask if someone has been working hard as they normally do", uz: "Odatdagidek bandmisiz?" },
    { term: "give my regards to...", en: "tell someone hello for me", uz: "...ga mening salomimni yetkazib qo'ying" },
    { term: "How's the family?", en: "A common small talk question about someone's relatives", uz: "Oilangizdagilar yaxshimi?" },
    { term: "I've heard so much about you", en: "Used when meeting someone you have heard stories about", uz: "Siz haqingizda ko'p eshitganman" },
    { term: "What do you do for a living?", en: "A common way to ask about someone's job", uz: "Nima ish bilan shug'ullanasiz? (Kasbingiz nima?)" },
    { term: "How was your weekend?", en: "A common Monday small talk question", uz: "Dam olish kuningiz qanday o'tdi?" },
    { term: "Long time no see!", en: "Common expression used when seeing someone after a while", uz: "Ko'rishmaganimizga ancha bo'ldi!" },
    { term: "Any plans for the holidays?", en: "Used to ask about someone's upcoming vacation or break", uz: "Bayramlarga (ta'tilga) qandaydir rejalaring bormi?" },
    { term: "I should get going", en: "A polite way to signal that you need to end a conversation", uz: "Men borishim kerak (suhbatni tugatish)" },
    { term: "Speaking of which...", en: "A way to transition to a related topic", uz: "Shu haqda gap ketganda..." },
    { term: "Great to see you!", en: "A warm way to say hello or goodbye to someone you know", uz: "Sizni ko'rganimdan juda xursandman!" },
    { term: "Lovely weather, isn't it?", en: "A very common British/English opening line when the weather is nice", uz: "Havo ajoyib-a, shunday emasmi?" },
    { term: "miserable weather", en: "very unpleasant weather (usually cold and rainy)", uz: "yoqimsiz (iflos) havo" },
    { term: "soaked to the skin", en: "extremely wet from the rain", uz: "chimildiqdek (suvga) bo'kib ketgan" },
    { term: "bitterly cold", en: "extremely cold in an unpleasant way", uz: "qahraton (juda) sovuq" },
    { term: "How was your trip?", en: "Used to ask about someone's recent travel experience", uz: "Sayohatingiz (safaringiz) qanday o'tdi?" },
    { term: "safe travels", en: "Used to wish someone a safe journey", uz: "oq yo'l (xavfsiz safarlar)" },
    { term: "get away from it all", en: "to go somewhere different to rest and relax", uz: "hamma narsadan dam olmoq (uzilmoq)" },
    { term: "jet-lagged", en: "feeling tired after a long flight due to time zone differences", uz: "parvozdan charchagan (vaqt farqi tufayli)" },
    { term: "travel light", en: "to travel with very little luggage", uz: "ozgina yuk bilan sayohat qilmoq" },
    { term: "sightseeing", en: "the activity of visiting places of interest in a particular location", uz: "diqqatga sazovor joylarni tomosha qilish" },
    { term: "hit the road", en: "to start a journey or leave", uz: "yo'lga chiqmoq" },
    { term: "tourist trap", en: "a place that attracts many tourists and charges high prices", uz: "sayyohlar uchun qopqon (qimmat joy)" },
    { term: "local cuisine", en: "the traditional food of a particular area", uz: "mahalliy oshxona (taomlar)" },
    { term: "Have you heard about...?", en: "Used to introduce a topic from the news or current events", uz: "...haqida eshitdingizmi?" },
    { term: "hot topic", en: "a subject that a lot of people are talking and arguing about", uz: "dolzarb mavzu" },
    { term: "talk of the town", en: "the person or thing that everyone in a place is talking about", uz: "shahar og'zidagi gap (mashhur mavzu)" },
    { term: "stuck in a rut", en: "too fixed in one particular type of job, activity, method, etc., and needing to change", uz: "bir xillikdan zerikkan (bir joyda qotib qolgan)" },
    { term: "heavy workload", en: "a large amount of work that a person or organization has to do", uz: "og'ir ish yuki (ish ko'pligi)" },
    { term: "work-life balance", en: "the amount of time you spend doing your job compared with the amount of time you spend with your family", uz: "ish va shaxsiy hayot balansi" },
    { term: "into (something)", en: "to be very interested in and involved with something", uz: "biror narsaga qiziqmoq (ishqiboz bo'lmoq)" },
    { term: "take up a hobby", en: "to start doing a particular activity to enjoy yourself", uz: "yangi hobbi bilan shug'ullanishni boshlamoq" },
    { term: "couch potato", en: "a person who watches a lot of television and does not have an active style of life", uz: "dangasa (faqat televizor ko'rib yotadigan odam)" },
    { term: "social butterfly", en: "someone who is very social and likes to be among people", uz: "kirishimli (davralarni xush ko'radigan) odam" },
    { term: "unwind", en: "to relax and allow your mind to be free from worry", uz: "dam olmoq (hordiq chiqarmoq)" },
    { term: "broaden one's horizons", en: "to increase the range of one's knowledge, understanding, or experience", uz: "dunyoqarashni kengaytirmoq" }
];

const TEST_META = {
    title: "💬 Small Talk Test",
    logo: "💬",
    brand: "Mock Stream",
    subtitle: "Small Talk Collocations (A1–C1)",
    primary: "#059669",
    secondary: "#047857"
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
