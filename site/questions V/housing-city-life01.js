// Test Questions: Housing & City Life (B1–C1)
// Questions are generated randomly from vocabulary terms

window.TEST_META = {
  title: "🏠 Housing & City Life — Vocabulary Test",
  logo: "https://i.ibb.co/4RYmcG6R/Bekzod-Turgunov-Logo.jpg",
  brand: "Housing & City Life",
  subtitle: "Bekzod Turg'unov",
  colors: {
    bg1: "#6366f1",
    bg2: "#4f46e5",
    accent: "#818cf8"
  }
};

const VOCAB_DATA = [
  { term: "in the city centre", en: "In the middle/downtown area of a city", uz: "shahar markazida" },
  { term: "in the suburbs", en: "In residential areas outside city centre", uz: "shahar chekkasida" },
  { term: "a well-connected area", en: "Place with good transport links", uz: "qatnovi qulay hudud" },
  { term: "within walking distance", en: "Close enough to walk to", uz: "piyoda boradigan masofada" },
  { term: "a quiet neighbourhood", en: "Peaceful residential area", uz: "tinch mahalla" },
  { term: "a safe area", en: "Place with low crime", uz: "xavfsiz hudud" },
  { term: "a lively district", en: "Area with lots of activity and people", uz: "jonli tuman" },
  { term: "close to amenities", en: "Near useful facilities like shops, banks", uz: "qulayliklarga yaqin" },
  { term: "a residential area", en: "Area mainly for housing, not businesses", uz: "turar-joy hududi" },
  { term: "a stone's throw from", en: "Very close to something", uz: "...dan juda yaqin" },
  { term: "a studio flat", en: "Small flat with one main room", uz: "studiya kvartira" },
  { term: "a one-bedroom flat", en: "Flat with separate bedroom", uz: "1 xonali kvartira" },
  { term: "a shared flat", en: "Flat where multiple people live together", uz: "birgalikda ijaradagi kvartira" },
  { term: "a high-rise building", en: "Tall building with many floors", uz: "baland qavatli bino" },
  { term: "a detached house", en: "House not connected to other buildings", uz: "alohida hovlili uy" },
  { term: "a gated community", en: "Private residential area with security", uz: "qo'riqlanadigan turar-joy majmuasi" },
  { term: "student accommodation", en: "Housing for university students", uz: "talabalar turar joyi" },
  { term: "a furnished flat", en: "Flat with furniture included", uz: "mebellangan kvartira" },
  { term: "a newly-built block", en: "Recently constructed building", uz: "yangi qurilgan uy" },
  { term: "an older building", en: "Building constructed long ago", uz: "eski bino" },
  { term: "pay rent monthly", en: "Give money for housing each month", uz: "oyma-oy ijara to'lamoq" },
  { term: "a rental agreement", en: "Contract between landlord and tenant", uz: "ijara shartnomasi" },
  { term: "a security deposit", en: "Money paid as guarantee when renting", uz: "garov puli (depozit)" },
  { term: "utilities included", en: "Water, electricity, gas in the rent", uz: "kommunal to'lovlar kiritilgan" },
  { term: "a landlord", en: "Person who owns and rents property", uz: "uy egasi" },
  { term: "a tenant", en: "Person who pays to live in a property", uz: "ijarachi" },
  { term: "give notice", en: "Inform landlord you're leaving", uz: "oldindan xabar bermoq" },
  { term: "rent out a room", en: "Let someone pay to use your room", uz: "xona ijaraga bermoq" },
  { term: "maintenance issues", en: "Problems needing repair", uz: "ta'mir muammolari" },
  { term: "an eviction notice", en: "Official letter to leave a property", uz: "uydan chiqarish xati" },
  { term: "the cost of living", en: "Money needed for basic expenses", uz: "yashash xarajati" },
  { term: "affordable housing", en: "Homes that aren't too expensive", uz: "arzon uy-joy" },
  { term: "soaring rents", en: "Rapidly increasing rental prices", uz: "ijaraning keskin oshishi" },
  { term: "a tight budget", en: "Limited money to spend", uz: "tor byudjet" },
  { term: "make ends meet", en: "Have enough money for basic needs", uz: "zo'rg'a yetkazmoq" },
  { term: "a lively nightlife", en: "Active entertainment scene at night", uz: "kechki hayot" },
  { term: "noise pollution", en: "Harmful or annoying sounds", uz: "shovqin ifloslanishi" },
  { term: "traffic congestion", en: "Too many vehicles causing delays", uz: "tirbandlik" },
  { term: "green spaces", en: "Parks and natural areas in cities", uz: "yashil hududlar" },
  { term: "a hectic lifestyle", en: "Very busy and stressful way of living", uz: "shoshqaloq hayot tarzi" },
  { term: "a housing shortage", en: "Not enough homes for people", uz: "uy-joy tanqisligi" },
  { term: "overcrowded buses", en: "Buses with too many passengers", uz: "gavjum avtobuslar" },
  { term: "poor infrastructure", en: "Bad roads, transport, utilities", uz: "infratuzilma yomon" },
  { term: "improve public transport", en: "Make buses/trains better", uz: "jamoat transportini yaxshilamoq" },
  { term: "rent control", en: "Government limits on rent prices", uz: "ijarani nazorat qilish" },
  { term: "urban planning", en: "Designing and organizing cities", uz: "shahar rejalashtrish" },
  { term: "gentrification", en: "Area becoming expensive, pushing locals out", uz: "gentrifikatsiya (hudud qimmatlashishi)" },
  { term: "public housing", en: "Government-provided affordable homes", uz: "davlat uy-joyi" },
  { term: "a long commute", en: "Travelling far to work/school", uz: "uzoq qatnov" },
  { term: "work-life balance", en: "Good mix of job and personal time", uz: "ish-hayot muvozanati" }
];

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getWrongOptions(correctAnswer, allTerms, count = 3) {
  const wrongTerms = allTerms.filter(t => t.term !== correctAnswer);
  return shuffleArray(wrongTerms).slice(0, count).map(t => t.term);
}

function getWrongDefinitions(correctDef, allTerms, count = 3) {
  const wrongTerms = allTerms.filter(t => t.en !== correctDef);
  return shuffleArray(wrongTerms).slice(0, count).map(t => t.en);
}

function getWrongUzbekOptions(correctUz, allTerms, count = 3) {
  const wrongTerms = allTerms.filter(t => t.uz !== correctUz);
  return shuffleArray(wrongTerms).slice(0, count).map(t => t.uz);
}

function generateQuestions() {
  const questions = [];
  const shuffledVocab = shuffleArray(VOCAB_DATA);
  
  const questionTypes = [
    (vocab) => ({
      type: "Tarjima qiling:",
      question: `"${vocab.term}" ning ma'nosi nima?`,
      correct: vocab.en,
      options: shuffleArray([vocab.en, ...getWrongDefinitions(vocab.en, VOCAB_DATA)]),
      def: vocab.uz
    }),
    (vocab) => ({
      type: "So'z toping:",
      question: `Qaysi so'z "${vocab.en}" ma'nosini bildiradi?`,
      correct: vocab.term,
      options: shuffleArray([vocab.term, ...getWrongOptions(vocab.term, VOCAB_DATA)]),
      def: vocab.uz
    }),
    (vocab) => ({
      type: "Inglizchasi nima?",
      question: `"${vocab.uz}" so'zining inglizchasi qaysi?`,
      correct: vocab.term,
      options: shuffleArray([vocab.term, ...getWrongOptions(vocab.term, VOCAB_DATA)]),
      def: vocab.en
    }),
    (vocab) => ({
      type: "O'zbekchasi nima?",
      question: `"${vocab.term}" so'zining o'zbekchasi qaysi?`,
      correct: vocab.uz,
      options: shuffleArray([vocab.uz, ...getWrongUzbekOptions(vocab.uz, VOCAB_DATA)]),
      def: vocab.en
    })
  ];
  
  for (let i = 0; i < 50; i++) {
    const vocab = shuffledVocab[i % shuffledVocab.length];
    const typeIndex = i % questionTypes.length;
    questions.push(questionTypes[typeIndex](vocab));
  }
  
  return shuffleArray(questions);
}

window.ALL_QUESTIONS = generateQuestions();
window.regenerateQuestions = function() {
  window.ALL_QUESTIONS = generateQuestions();
};
