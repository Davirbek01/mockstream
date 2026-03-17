// Test Questions: Environment & Climate (B1–C1)
// Questions are generated randomly from vocabulary terms

window.TEST_META = {
  title: "🌍 Environment & Climate — Vocabulary Test",
  logo: "https://i.ibb.co/4RYmcG6R/Bekzod-Turgunov-Logo.jpg",
  brand: "Environment & Climate",
  subtitle: "Bekzod Turg'unov",
  colors: {
    bg1: "#059669",
    bg2: "#047857",
    accent: "#10b981"
  }
};

const VOCAB_DATA = [
  { term: "climate change", en: "long-term shifts in temperature and weather patterns", uz: "iqlim o'zgarishi" },
  { term: "global warming", en: "rise in Earth's average temperature", uz: "global isish" },
  { term: "greenhouse gas emissions", en: "gases that trap heat in the atmosphere", uz: "issiqxona gazlari chiqindilari" },
  { term: "carbon footprint", en: "amount of CO2 produced by activities", uz: "uglerod izi" },
  { term: "fossil fuels", en: "coal, oil, gas from ancient organisms", uz: "qazilma yoqilg'ilar" },
  { term: "renewable energy", en: "energy from sources that won't run out", uz: "qayta tiklanuvchi energiya" },
  { term: "net zero", en: "balancing emissions with removal", uz: "nol emissiya" },
  { term: "climate action", en: "steps taken to fight climate change", uz: "iqlim bo'yicha choralar" },
  { term: "mitigation", en: "reducing the impact of climate change", uz: "yumshatish" },
  { term: "adaptation", en: "adjusting to climate change", uz: "moslashuv" },
  { term: "tipping point", en: "point of no return", uz: "burilish nuqtasi" },
  { term: "raise awareness", en: "help people understand an issue", uz: "xabardorlikni oshirmoq" },
  { term: "heatwave", en: "period of unusually hot weather", uz: "issiq to'lqin" },
  { term: "drought", en: "long period without rain", uz: "qurg'oqchilik" },
  { term: "flooding", en: "water covering normally dry land", uz: "toshqin" },
  { term: "wildfires", en: "large uncontrolled fires in nature", uz: "o'rmon yong'inlari" },
  { term: "sea-level rise", en: "oceans getting higher", uz: "dengiz sathi ko'tarilishi" },
  { term: "melting glaciers", en: "ice masses turning to water", uz: "muzliklarning erishi" },
  { term: "air quality", en: "how clean or polluted the air is", uz: "havo sifati" },
  { term: "smog", en: "smoky fog caused by pollution", uz: "smog, tutunli tuman" },
  { term: "water scarcity", en: "lack of enough water", uz: "suv tanqisligi" },
  { term: "ecosystem damage", en: "harm to natural environments", uz: "ekotizimga zarar" },
  { term: "biodiversity loss", en: "fewer species of plants and animals", uz: "biologik xilma-xillikning kamayishi" },
  { term: "habitat loss", en: "destruction of where animals live", uz: "yashash muhitining yo'qolishi" },
  { term: "plastic pollution", en: "plastic waste harming the environment", uz: "plastik ifloslanishi" },
  { term: "single-use plastics", en: "plastics used once then thrown away", uz: "bir martalik plastiklar" },
  { term: "microplastics", en: "tiny pieces of plastic", uz: "mikroplastiklar" },
  { term: "landfill", en: "place where rubbish is buried", uz: "chiqindi poligoni" },
  { term: "waste sorting", en: "separating different types of rubbish", uz: "chiqindini saralash" },
  { term: "recycling rate", en: "percentage of waste that gets recycled", uz: "qayta ishlash darajasi" },
  { term: "compost", en: "turn food waste into fertilizer", uz: "kompost" },
  { term: "toxic chemicals", en: "poisonous substances", uz: "zaharli kimyoviy moddalar" },
  { term: "water contamination", en: "pollution of water sources", uz: "suvning ifloslanishi" },
  { term: "noise pollution", en: "harmful levels of noise", uz: "shovqin ifloslanishi" },
  { term: "energy-efficient", en: "using less energy", uz: "energiya tejamkor" },
  { term: "public transport", en: "buses, trains, trams for everyone", uz: "jamoat transporti" },
  { term: "carpool", en: "share car rides with others", uz: "birga mashinada borish" },
  { term: "endangered species", en: "animals at risk of extinction", uz: "yo'qolib ketish xavfidagi turlar" },
  { term: "nature reserve", en: "protected natural area", uz: "qo'riqxona" },
  { term: "reforestation", en: "replanting forests", uz: "o'rmonlarni tiklash" },
  { term: "deforestation", en: "cutting down forests", uz: "o'rmonlarning kesilishi" },
  { term: "sustainable farming", en: "agriculture that doesn't harm nature", uz: "barqaror qishloq xo'jaligi" },
  { term: "soil erosion", en: "loss of topsoil", uz: "tuproq eroziyasi" },
  { term: "environmental education", en: "teaching about nature and ecology", uz: "ekologik ta'lim" },
  { term: "green technology", en: "eco-friendly technology", uz: "yashil texnologiya" },
  { term: "subsidies for renewables", en: "government money for clean energy", uz: "qayta tiklanuvchilar uchun subsidiya" },
  { term: "phase out coal", en: "gradually stop using coal", uz: "ko'mirni bosqichma-bosqich to'xtatmoq" },
  { term: "climate-friendly policies", en: "rules that help the climate", uz: "iqlimga do'stona siyosatlar" },
  { term: "community clean-up", en: "local group cleaning activity", uz: "jamoaviy tozalash aksiyasi" },
  { term: "practical solution", en: "a workable answer to a problem", uz: "amaliy yechim" }
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
