// Vocabulary Test: Space Exploration (B2–C2)
// Questions and options are randomized on each load

const VOCAB_DATA = [
    { term: "vastness of the universe", en: "the internal and infinite space that contains everything", uz: "koinotning chegarsizligi" },
    { term: "luminous celestial objects", en: "objects in space that give off their own light, like stars", uz: "nur sochuvchi osmon jismlari" },
    { term: "elliptical orbit", en: "a path that is shaped like an oval, along which a planet or moon moves", uz: "elliptik orbita" },
    { term: "gravitational pull", en: "the force of attraction that pulls objects toward each other", uz: "tortishish kuchi (gravitatsiya)" },
    { term: "interstellar space", en: "the region between stars in a galaxy", uz: "yulduzlararo fazo" },
    { term: "binary star system", en: "a system of two stars in which one revolves around the other or both revolve around a common center", uz: "ikkilik yulduz tizimi" },
    { term: "cosmic radiation", en: "high-energy radiation that comes from outside the solar system", uz: "kosmik radiatsiya" },
    { term: "supernova explosion", en: "the brilliant explosion of a star at the end of its life", uz: "o'ta yangi yulduz portlashi (supernova)" },
    { term: "black hole", en: "a region of space where gravity is so strong that nothing, not even light, can escape", uz: "qora tuynuk" },
    { term: "milky way galaxy", en: "the galaxy that contains our Solar System", uz: "Somon yo'li galaktikasi" },
    { term: "nebula", en: "a cloud of gas and dust in outer space, visible in the night sky as an indistinct bright patch", uz: "tumanlik (nebula)" },
    { term: "light-year", en: "the distance that light travels in one year", uz: "yorug'lik yili" },
    { term: "event horizon", en: "the boundary around a black hole beyond which no light or other radiation can escape", uz: "voqealar gorizonti" },
    { term: "dark matter", en: "non-luminous material that is postulated to exist in space", uz: "qora materiya" },
    { term: "celestial navigation", en: "determining one's position by observing the sun, moon, and stars", uz: "osmon jismlari orqali mo'ljal olish" },
    { term: "planetary alignment", en: "the positions of planets when they appear to be in a straight line from Earth", uz: "sayyoralar paradi (tekislanishi)" },
    { term: "solar flare", en: "a brief eruption of intense high-energy radiation from the sun's surface", uz: "quyosh chaqnashi" },
    { term: "meteor shower", en: "a number of meteors that appear to radiate from the same point in the sky", uz: "meteorlar yomg'iri" },
    { term: "asteroid belt", en: "the region of the solar system between the orbits of Mars and Jupiter", uz: "asteroidlar kamari" },
    { term: "comet's tail", en: "the trail of gas and dust that flows out from a comet as it nears the Sun", uz: "kometa dumi" },
    { term: "exoplanet", en: "a planet that orbits a star outside our solar system", uz: "ekzosayyora" },
    { term: "habitable zone", en: "the region around a star where conditions are favorable for life", uz: "yashash uchun qulay hudud (zona)" },
    { term: "galactic core", en: "the rotational center of a galaxy", uz: "galaktika yadrosi (markazi)" },
    { term: "space-time continuum", en: "the four-dimensional coordination of space and time", uz: "fazo-vaqt kontinuumi" },
    { term: "astronomical phenomenon", en: "a naturally occurring event in space", uz: "astronomik hodisa" },
    { term: "manned spaceflight", en: "a journey into space by a vehicle that has people on board", uz: "boshqariladigan kosmik parvoz (odamli)" },
    { term: "unmanned space probe", en: "a robotic spacecraft that does not carry people, used for exploration", uz: "boshqarilmaydigan (robotik) kosmik zond" },
    { term: "low Earth orbit (LEO)", en: "an orbit around Earth with an altitude between 160 and 2,000 km", uz: "pastki Yer orbitasi (LEO)" },
    { term: "launch vehicle", en: "a rocket used to carry a payload from Earth's surface into outer space", uz: "eltuvchi raketa" },
    { term: "propulsion system", en: "a machine that produces thrust to push an object forward", uz: "harakatlantiruvchi tizim (dvigatel)" },
    { term: "reusable rocket technology", en: "rockets that can be landed and launched multiple times to reduce costs", uz: "ko'p marta ishlatiladigan raketa texnologiyasi" },
    { term: "space shuttle", en: "a multi-use spacecraft used for transporting people and cargo to and from orbit", uz: "kosmik kema (shattl)" },
    { term: "atmospheric reentry", en: "the movement of an object from outer space through the atmosphere of a planet", uz: "atmosferaga qayta kirish" },
    { term: "lunar landing module", en: "a spacecraft designed to land on the moon", uz: "Oyga qo'nish moduli" },
    { term: "geostationary satellite", en: "a satellite that remains over a fixed point on Earth's equator", uz: "geostatsionar sun'iy yo'ldosh" },
    { term: "deep space exploration", en: "exploration of regions outside our immediate solar system or beyond the Moon", uz: "chuqur koinotni tadqiq qilish" },
    { term: "zero-gravity environment", en: "a state in which the net force of gravity is zero, leading to weightlessness", uz: "vaznsizlik (nol gravitatsiya) muhiti" },
    { term: "extravehicular activity (EVA)", en: "work done by an astronaut outside a spacecraft, also known as a spacewalk", uz: "kemadan tashqaridagi faoliyat (fazo sayri)" },
    { term: "telecommunications array", en: "a group of antennas used for transmitting signals to and from space", uz: "telekommunikatsiya antennalari guruhi" },
    { term: "interplanetary travel", en: "travel between different planets in our solar system", uz: "sayyoralararo sayohat" },
    { term: "astronautical engineering", en: "the science and technology of space flight", uz: "astronavtika muhandisligi" },
    { term: "escape velocity", en: "the minimum speed needed for an object to break free from the gravitational attraction of a celestial body", uz: "ikkinchi kosmik tezlik (qochish tezligi)" },
    { term: "payload capacity", en: "the maximum amount of weight a rocket can carry into orbit", uz: "yuk ko'tarish qobiliyati (payloud)" },
    { term: "mission control center", en: "the facility that manages space flights from the ground", uz: "parvozlarni boshqarish markazi" },
    { term: "space debris", en: "man-made objects in orbit that are no longer useful", uz: "kosmik chiqindilar" },
    { term: "orbital mechanics", en: "the application of ballistics and celestial mechanics to the practical problems of spacecraft motion", uz: "orbital mexanika" },
    { term: "cryogenic fuel", en: "fuel that is kept at extremely low temperatures to remain liquid", uz: "kriogen yoqilg'i" },
    { term: "space-grade materials", en: "materials specifically engineered to withstand the harsh conditions of space", uz: "kosmosga chidamli materiallar" },
    { term: "docking maneuver", en: "the process of joining two spacecraft together in orbit", uz: "tutashish manevri (kosmosda)" },
    { term: "terraforming", en: "the process of deliberately modifying a planet's atmosphere and temperature to make it habitable", uz: "terraformlash (yashash uchun moslashtirish)" }
];

const TEST_META = {
    title: "🚀 Space Exploration Vocabulary",
    logo: "🚀",
    brand: "Mock Stream",
    subtitle: "Space Exploration (B2–C2)",
    primary: "#1e3a5f",
    secondary: "#0d253f"
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
