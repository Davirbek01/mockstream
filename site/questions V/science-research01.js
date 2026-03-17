// Test Questions: Science & Research (B2–C2)
// Questions are generated randomly from vocabulary terms

window.TEST_META = {
  title: "🔬 Science & Research — Vocabulary Test",
  logo: "https://i.ibb.co/4RYmcG6R/Bekzod-Turgunov-Logo.jpg",
  brand: "Science & Research",
  subtitle: "Bekzod Turg'unov",
  colors: {
    bg1: "#0891b2",
    bg2: "#0e7490",
    accent: "#06b6d4"
  }
};

const VOCAB_DATA = [
  { term: "hypothesis", en: "a proposed explanation as a starting point for investigation", uz: "gipoteza / faraz" },
  { term: "empirical evidence", en: "information acquired by observation or experimentation", uz: "empirik dalil" },
  { term: "trial and error", en: "the process of experimenting until an answer is found", uz: "sinov va xatolik usuli" },
  { term: "variable", en: "an element or factor that is liable to vary or change", uz: "o'zgaruvchi" },
  { term: "sample size", en: "the number of observations or individuals included in a study", uz: "tanlanma hajmi" },
  { term: "controlled environment", en: "an environment strictly regulated for experiment accuracy", uz: "nazorat qilinadigan muhit" },
  { term: "qualitative research", en: "research that relies on non-numerical data like observations", uz: "sifat tahlili" },
  { term: "quantitative research", en: "research that focuses on quantifiable data and statistics", uz: "miqdoriy tahlil" },
  { term: "findings", en: "the results or conclusions of a detailed investigation", uz: "tadqiqot natijalari" },
  { term: "peer-review", en: "evaluation of work by others in the same field", uz: "taqriz / o'zaro baholash" },
  { term: "publication", en: "the issuing of a book, journal for public sale", uz: "nashr / chop etish" },
  { term: "lab coat", en: "a white coat worn by laboratory workers for protection", uz: "laboratoriya xalati" },
  { term: "test tube", en: "a thin glass tube used to hold material for testing", uz: "probirka" },
  { term: "microscope", en: "an optical instrument used for viewing very small objects", uz: "mikroskop" },
  { term: "centrifuge", en: "a machine that applies centrifugal force to contents", uz: "sentrifuga" },
  { term: "safety goggles", en: "protective eyewear used in laboratories", uz: "himoya ko'zoynagi" },
  { term: "data collection", en: "the process of gathering and measuring information", uz: "ma'lumotlarni yig'ish" },
  { term: "observation", en: "the action of observing carefully to gain information", uz: "kuzatish" },
  { term: "methodology", en: "a system of methods used in a particular area of study", uz: "metodologiya" },
  { term: "experimental group", en: "the group that receives the variable being tested", uz: "tajriba guruhi" },
  { term: "control group", en: "the group that does not receive the variable being tested", uz: "nazorat guruhi" },
  { term: "validity", en: "the quality of being logically or factually sound", uz: "haqiqiylik / asoslilik" },
  { term: "reliability", en: "the quality of performing consistently well", uz: "ishonchlilik" },
  { term: "petri dish", en: "a shallow cylindrical dish used to culture cells", uz: "Petri likopchasi" },
  { term: "breakthrough", en: "a sudden, dramatic, and important discovery", uz: "muhim kashfiyot" },
  { term: "astrophysics", en: "the branch of astronomy about physical nature of stars", uz: "astrofizika" },
  { term: "genetics", en: "the study of heredity and variation of characteristics", uz: "genetika" },
  { term: "linguistics", en: "the scientific study of language and its structure", uz: "lingvistika / tilshunoslik" },
  { term: "psychology", en: "the scientific study of the human mind and its functions", uz: "psixologiya" },
  { term: "sociology", en: "the study of the development and functioning of human society", uz: "sotsiologiya" },
  { term: "botany", en: "the scientific study of plants", uz: "botanika" },
  { term: "zoology", en: "the scientific study of the behavior and physiology of animals", uz: "zoologiya" },
  { term: "geology", en: "the science dealing with the physical structure of the earth", uz: "geologiya" },
  { term: "meteorology", en: "the science concerned with weather and atmosphere", uz: "meteorologiya" },
  { term: "archaeology", en: "the study of human history through excavation of sites", uz: "arxeologiya" },
  { term: "neuroscience", en: "sciences dealing with the structure of the nervous system", uz: "neyrobiologiya" },
  { term: "artificial intelligence", en: "computer systems able to perform tasks requiring human intelligence", uz: "sun'iy intellekt" },
  { term: "renewable energy", en: "energy from a source that is not depleted when used", uz: "qayta tiklanadigan energiya" },
  { term: "nanotechnology", en: "technology dealing with dimensions less than 100 nanometers", uz: "nanotexnologiya" },
  { term: "space exploration", en: "the discovery of celestial structures in outer space", uz: "koinotni tadqiq qilish" },
  { term: "vaccine", en: "a substance used to stimulate production of antibodies", uz: "vaksina" },
  { term: "genome", en: "the complete set of genes in a cell or organism", uz: "genom" },
  { term: "climate change", en: "a change in global or regional climate patterns", uz: "iqlim o'zgarishi" },
  { term: "biodiversity", en: "the variety of life in the world or ecosystem", uz: "biologik xilma-xillik" },
  { term: "ecosystem", en: "a biological community of interacting organisms and environment", uz: "ekotizim" },
  { term: "sustainable development", en: "economic development without depletion of natural resources", uz: "barqaror rivojlanish" },
  { term: "robotics", en: "the branch of technology dealing with design of robots", uz: "robototexnika" },
  { term: "automation", en: "the use of automatic equipment in manufacturing", uz: "avtomatlashtirish" },
  { term: "informed consent", en: "permission granted in knowledge of possible consequences", uz: "ogohlantirilgan rozilik" },
  { term: "plagiarism", en: "taking someone else's work and passing it off as one's own", uz: "plagiat / ko'chirmachilik" }
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
