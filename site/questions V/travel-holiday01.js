// Vocabulary Test: Travel & Holiday
// Questions and options are randomized on each load

const VOCAB_DATA = [
    { term: "book a flight / train", en: "Arrange and buy a ticket for air or rail travel", uz: "samolyotga / poyezdga chipta band qilmoq" },
    { term: "plan an itinerary", en: "Organise a travel plan with places and times", uz: "sayohat rejasini tuzmoq" },
    { term: "set a budget", en: "Decide how much money you can spend", uz: "byudjet belgilamoq" },
    { term: "check in online", en: "Complete check-in on the internet before arriving", uz: "onlayn ro'yxatdan o'tmoq" },
    { term: "go through security", en: "Pass the airport security check", uz: "xavfsizlik nazoratidan o'tmoq" },
    { term: "catch a connection", en: "Manage to get the next flight/train after the first one", uz: "ulanish reysiga ulgurmoq" },
    { term: "make a reservation", en: "Book a room/table/seat in advance", uz: "oldindan bron qilmoq" },
    { term: "request an upgrade", en: "Ask for a better room/seat/service level", uz: "yaxshiroq variant so'ramoq" },
    { term: "check in / check out", en: "Arrive and register / leave and finish your stay", uz: "mehmonxonaga kirish / chiqish" },
    { term: "take in the sights", en: "Visit and enjoy famous places and views", uz: "diqqatga sazovor joylarni tomosha qilmoq" },
    { term: "go on a guided tour", en: "Join a tour led by a guide", uz: "gid bilan ekskursiyaga bormoq" },
    { term: "a hidden gem", en: "A great place that not many tourists know", uz: "yashirin topilma, kam bilinadigan zo'r joy" },
    { term: "off the beaten track", en: "Away from popular tourist places; more unusual", uz: "odatiy yo'nalishdan chetda" },
    { term: "get lost", en: "Lose your way and not know where you are", uz: "adashib qolmoq" },
    { term: "ask for directions", en: "Ask someone how to get to a place", uz: "yo'l so'ramoq" },
    { term: "lose your luggage", en: "Your bag goes missing during travel", uz: "yukingiz yo'qolib qolmoq" },
    { term: "worth every penny", en: "Completely worth the cost; excellent value", uz: "har tiyiniga arziydi" },
    { term: "a once-in-a-lifetime trip", en: "A very special trip you may only experience once", uz: "umrda bir marta bo'ladigan sayohat" },
    { term: "exceed expectations", en: "Be better than you expected", uz: "kutilganidan ham yaxshi chiqmoq" },
    { term: "tourist trap", en: "A place made to overcharge tourists", uz: "turistlarni aldab qimmat sotadigan joy" },
    { term: "set off", en: "Start a journey", uz: "yo'lga chiqmoq" },
    { term: "get away", en: "Go on holiday; escape routine", uz: "dam olishga chiqib ketmoq" },
    { term: "stop over", en: "Break a journey for a short stay in another place", uz: "yo'lda qisqa to'xtab o'tmoq" },
    { term: "look around", en: "Explore a place by walking and seeing what's there", uz: "atrofni aylanib ko'rmoq" },
    { term: "head back", en: "Return to where you were", uz: "qaytib ketmoq" },
    { term: "run into (a problem)", en: "Meet unexpectedly / face a difficulty", uz: "kutilmaganda duch kelmoq" },
    { term: "miss out on", en: "Fail to experience something good", uz: "boy berib qo'ymoq" },
    { term: "wind down", en: "Relax after activity", uz: "sekin-asta tinchlanmoq" },
    { term: "Travel broadens the mind", en: "Travel makes you more open-minded", uz: "Sayohat dunyoqarashni kengaytiradi" },
    { term: "Take the scenic route", en: "Choose a longer but more beautiful way", uz: "manzarali yo'lni tanlamoq" },
    { term: "peak season", en: "The busiest time of year for tourism", uz: "eng gavjum mavsum" },
    { term: "long queue", en: "A line of people waiting for something", uz: "uzun navbat" },
    { term: "hand luggage", en: "A small bag you carry onto the plane", uz: "qo'l yuki" },
    { term: "overpriced", en: "Too expensive for what it is", uz: "haddan tashqari qimmat" },
    { term: "overspend", en: "Spend more money than you planned", uz: "keragidan ortiq sarflamoq" },
    { term: "get discounts", en: "Receive lower prices or special price reductions", uz: "chegirmaga ega bo'lmoq" },
    { term: "reception", en: "The front desk in a hotel where guests get help", uz: "resepshen, qabulxona" },
    { term: "explore freely", en: "Travel without a strict plan and choose places spontaneously", uz: "erkin aylanib ko'rmoq" },
    { term: "affordable", en: "Not too expensive; reasonably priced", uz: "hamyonbop" },
    { term: "departure gate", en: "The area where you wait to board your flight", uz: "uchish darvozasi" },
    { term: "boarding pass", en: "A document that allows you to get on a plane", uz: "chiqish kartasi" },
    { term: "passport control", en: "The place where officials check your passport", uz: "pasport nazorati" },
    { term: "baggage claim", en: "The area where you collect your luggage after a flight", uz: "bagaj olish joyi" },
    { term: "jet lag", en: "Tiredness after a long flight across time zones", uz: "vaqt zonasi farqidan charchoq" },
    { term: "travel insurance", en: "Protection you buy in case of problems during travel", uz: "sayohat sug'urtasi" },
    { term: "currency exchange", en: "The place or process of changing money to another currency", uz: "valyuta ayirboshlash" },
    { term: "round trip", en: "A journey to a place and back again", uz: "borib-qaytish sayohati" },
    { term: "one-way ticket", en: "A ticket for travel in one direction only", uz: "bir tomonlama chipta" },
    { term: "direct flight", en: "A flight with no stops between departure and arrival", uz: "to'g'ridan-to'g'ri reys" },
    { term: "layover", en: "A stop between flights during a journey", uz: "reyslar orasidagi kutish" }
];

const TEST_META = {
    title: "✈️ Travel & Holiday Vocabulary",
    logo: "✈️",
    brand: "Mock Stream",
    subtitle: "Travel & Holiday",
    primary: "#0ea5e9",
    secondary: "#0284c7"
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
