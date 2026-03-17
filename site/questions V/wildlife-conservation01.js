// Vocabulary Test: Wildlife & Conservation (B2–C2)
// Questions and options are randomized on each load

const VOCAB_DATA = [
    { term: "habitat destruction", en: "the process by which a natural habitat becomes incapable of supporting its native species", uz: "tabiiy yashash muhitining yo'q qilinishi" },
    { term: "loss of biodiversity", en: "the decrease in the number and variety of different species in a particular area", uz: "biologik xilma-xillikning yo'qolishi" },
    { term: "encroach on natural habitats", en: "to gradually advance into or take over areas where wild animals live", uz: "tabiiy yashash hududlarini bosib olmoq" },
    { term: "agricultural expansion", en: "the increase in land used for farming, often at the expense of forests", uz: "qishloq xo'jaligining kengayishi" },
    { term: "fragmentation of habitats", en: "the process by which large, continuous habitats are divided into smaller, isolated patches", uz: "yashash muhitining bo'laklarga bo'linib ketishi" },
    { term: "disruption of the food chain", en: "an event or change that breaks the natural order of who eats whom in an ecosystem", uz: "oziq-ovqat zanjirining buzilishi" },
    { term: "upset the ecological balance", en: "to disturb the natural proportions and interactions of species in an environment", uz: "ekologik muvozanatni buzmoq" },
    { term: "poaching and illegal trade", en: "illegal hunting and the selling of wild animals or their parts", uz: "brakonerlik va noqonuniy savdo" },
    { term: "on the brink of extinction", en: "very close to disappearing forever", uz: "yo'q bo'lib ketish arafasida" },
    { term: "critically endangered species", en: "a species that faces an extremely high risk of extinction in the wild", uz: "yo'q bo'lib ketish xavfi ostidagi turlar" },
    { term: "vulnerable to predators", en: "easily harmed or attacked by animals that hunt others", uz: "yirtqichlar oldida himoyasiz" },
    { term: "conflict between humans and wildlife", en: "negative interactions between people and wild animals, often over land or food", uz: "inson va yovvoyi tabiat o'rtasidagi to'qnashuv" },
    { term: "overexploitation of resources", en: "using natural resources faster than they can be replaced", uz: "resurslardan haddan tashqari ko'p foydalanish" },
    { term: "degradation of the environment", en: "the deterioration of the environment through depletion of resources", uz: "atrof-muhitning yomonlashishi (degradatsiyasi)" },
    { term: "invasive species", en: "animals or plants that are not native to an area and cause harm to the ecosystem", uz: "invaziv turlar (begona zararli turlar)" },
    { term: "contaminate the water supply", en: "to make water dirty or poisonous", uz: "suv ta'minotini ifloslantirmoq" },
    { term: "pesticide runoff", en: "agricultural chemicals that wash into rivers or lakes", uz: "pestitsidlarning suvga oqib tushishi" },
    { term: "urban development", en: "the process of building cities and infrastructure", uz: "shaharsozlik / shahar qurilishi" },
    { term: "commercial logging", en: "the process of cutting down trees for timber production", uz: "tijorat maqsadida daraxt kesish" },
    { term: "soil erosion", en: "the washing or blowing away of the top layer of soil", uz: "tuproq eroziyasi" },
    { term: "greenhouse gas emissions", en: "the release of gases like CO2 that trap heat in the atmosphere", uz: "issiqxona gazlarining ajralishi" },
    { term: "melting ice caps", en: "the process of polar ice turning into water due to rising temperatures", uz: "muzliklarning erishi" },
    { term: "rising sea levels", en: "the increase in the average height of the ocean's surface", uz: "dengiz sathining ko'tarilishi" },
    { term: "extreme weather events", en: "unusually severe storms, droughts, or heatwaves", uz: "ekstremal ob-havo hodisalari" },
    { term: "ocean acidification", en: "the decrease in the pH level of the Earth's oceans, caused by the uptake of CO2", uz: "okean suvi kislotaliligining oshishi" },
    { term: "illegal wildlife trafficking", en: "the unauthorized trade of wild animals and plants, often across international borders", uz: "yovvoyi hayvonlar bilan noqonuniy savdo" },
    { term: "extinction is forever", en: "once a species is gone, it can never be brought back", uz: "yo'q bo'lib ketish — bu abadiy" },
    { term: "poach for ivory", en: "to illegally hunt animals, like elephants, for their tusks", uz: "fil suyagi uchun brakonerlik qilmoq" },
    { term: "on the edge of existence", en: "at a very high risk of disappearing or being destroyed", uz: "mavjudligini yo'qotish arafasida" },
    { term: "trade in endangered species", en: "the buying and selling of animals that are at risk of extinction", uz: "yo'q bo'lib ketish xavfi ostidagi turlar savdosi" },
    { term: "black market prices", en: "the high cost of illegal goods sold outside of official channels", uz: "qora bozordagi narxlar" },
    { term: "lose its natural habitat", en: "when the environment where an animal usually lives is destroyed", uz: "tabiiy yashash muhitini yo'qotmoq" },
    { term: "face a bleak future", en: "to have a future that is likely to be difficult or unsuccessful", uz: "qorong'u kelajak bilan to'qnash kelmoq" },
    { term: "wipe out a population", en: "to completely destroy a group of animals in a specific area", uz: "populyatsiyani butunlay yo'q qilmoq" },
    { term: "threaten the survival of", en: "to pose a risk to the continued existence of a species", uz: "yashab qolishiga tahdid solmoq" },
    { term: "the last of its kind", en: "the final remaining individual of a species", uz: "o'z turining oxirgisi" },
    { term: "man-made disaster", en: "a catastrophic event caused by human activity", uz: "inson qo'li bilan yaratilgan falokat" },
    { term: "overfishing to depletion", en: "catching so many fish that the population cannot recover", uz: "baliqni butunlay tugatguncha ovlash" },
    { term: "trophy hunting", en: "the regulated hunting of wild animals for their heads or skins to be displayed", uz: "kubok (sovrin) uchun ov qilish" },
    { term: "decimate a species", en: "to kill or destroy a large proportion of a group of animals", uz: "tur sonini keskin kamaytirib yubormoq" },
    { term: "devastate an ecosystem", en: "to cause great damage or destruction to a biological community", uz: "ekotizimni vayron qilmoq" },
    { term: "irreversible damage", en: "harm that cannot be repaired or undone", uz: "tuzatib bo'lmas zarar" },
    { term: "human interference", en: "the act of people getting involved in natural processes, often with negative results", uz: "inson aralashuvi" },
    { term: "displace wildlife", en: "to force animals to move from their natural home", uz: "yovvoyi tabiatni o'z joyidan siqib chiqarmoq" },
    { term: "ecological catastrophe", en: "a large-scale disaster that severely damages the environment", uz: "ekologik falokat" },
    { term: "vulnerable to extinction", en: "having characteristics that make a species likely to disappear", uz: "yo'q bo'lib ketishga moyil / zaif" },
    { term: "habitat restoration", en: "the process of returning a damaged environment to its original state", uz: "yashash muhitini qayta tiklash" },
    { term: "wildlife sanctuary", en: "a protected area for wild animals where hunting is forbidden", uz: "yovvoyi tabiat qo'riqxonasi" },
    { term: "captive breeding program", en: "the process of breeding animals in controlled environments like zoos to increase their population", uz: "asirlikda ko'paytirish dasturi" },
    { term: "climate change resilience", en: "the ability of a species or ecosystem to survive and adapt to a changing climate", uz: "iqlim o'zgarishiga bardoshlilik" }
];

const TEST_META = {
    title: "🦁 Wildlife & Conservation Vocabulary",
    logo: "🦁",
    brand: "Mock Stream",
    subtitle: "Wildlife & Conservation (B2–C2)",
    primary: "#16a34a",
    secondary: "#15803d"
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
