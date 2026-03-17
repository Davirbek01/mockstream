// Test Questions: Media & Advertising (B1–C1)
// Questions are generated randomly from vocabulary terms

window.TEST_META = {
  title: "📢 Media & Advertising — Vocabulary Test",
  logo: "https://i.ibb.co/4RYmcG6R/Bekzod-Turgunov-Logo.jpg",
  brand: "Media & Advertising",
  subtitle: "Bekzod Turg'unov",
  colors: {
    bg1: "#dc2626",
    bg2: "#b91c1c",
    accent: "#ef4444"
  }
};

const VOCAB_DATA = [
  { term: "mass media", en: "sources of information and news reaching many people", uz: "ommaviy axborot vositalari" },
  { term: "broadcast", en: "transmit by TV or radio", uz: "eshittirish / ko'rsatuv" },
  { term: "broadsheet", en: "a serious, large-format newspaper", uz: "jiddiy katta formatdagi gazeta" },
  { term: "tabloid", en: "a small newspaper with sensational stories", uz: "tabloid / sariq matbuot" },
  { term: "journalist", en: "a person who writes news stories", uz: "jurnalist" },
  { term: "correspondent", en: "a reporter based in a specific location or field", uz: "muxbir" },
  { term: "current affairs", en: "important political or social events happening now", uz: "dolzarb voqealar" },
  { term: "breaking news", en: "newly received information about an event happening now", uz: "shoshilinch xabarlar" },
  { term: "headline", en: "the heading or title of a news story", uz: "sarlavha" },
  { term: "editorial", en: "an article giving the newspaper's opinion", uz: "tahririyat maqolasi" },
  { term: "coverage", en: "the reporting of a particular story or event", uz: "yoritish (yangilikda)" },
  { term: "mainstream media", en: "traditional, widely accepted media sources", uz: "an'anaviy ommaviy axborot vositalari" },
  { term: "citizen journalism", en: "news reported by ordinary people using the internet", uz: "fuqarolik jurnalistikasi" },
  { term: "source", en: "a person or place where information comes from", uz: "manba" },
  { term: "eyewitness account", en: "a description of an event by someone who saw it", uz: "guvohning hikoyasi" },
  { term: "scoop", en: "an exclusive news story discovered by one reporter", uz: "eksklyuziv yangilik" },
  { term: "sensationalism", en: "exaggerating stories to attract attention", uz: "sensatsiyaga berilish" },
  { term: "bias", en: "prejudice in favor of or against something", uz: "moyillik / tarafdorlik" },
  { term: "objective", en: "not influenced by personal feelings; neutral", uz: "xolis / obyektiv" },
  { term: "subjective", en: "based on personal opinions or feelings", uz: "subyektiv" },
  { term: "circulate", en: "to move around or distribute", uz: "tarqalmoq / tarqatmoq" },
  { term: "circulation", en: "the number of copies of a newspaper sold", uz: "tiraj" },
  { term: "press release", en: "an official statement sent to the media", uz: "press-reliz" },
  { term: "press conference", en: "a meeting where reporters ask questions", uz: "matbuot anjumani" },
  { term: "subtitles", en: "words appearing on screen to translate speech", uz: "subtitrlar" },
  { term: "advertisement", en: "a public notice promoting a product or service", uz: "reklama" },
  { term: "commercial", en: "a television or radio advertisement", uz: "televizion reklamasi" },
  { term: "billboard", en: "a large outdoor board for displaying ads", uz: "bilbord / reklama taxtasi" },
  { term: "brand loyalty", en: "the tendency of consumers to continue buying the same brand", uz: "brendga sodiqlik" },
  { term: "brand awareness", en: "the extent to which consumers are familiar with a brand", uz: "brendni tanishlik" },
  { term: "target audience", en: "the specific group of people an ad is aimed at", uz: "maqsadli auditoriya" },
  { term: "endorse", en: "publicly support a product (often by a celebrity)", uz: "reklama qilish" },
  { term: "testimonial", en: "a formal statement praising a product's qualities", uz: "tavsiyanoma" },
  { term: "slogan", en: "a short, catchy phrase used in advertising", uz: "shior / lozung" },
  { term: "jingle", en: "a short, catchy tune used in commercials", uz: "reklama kuyi" },
  { term: "product placement", en: "showing commercial products in films or TV shows", uz: "shashka (mahsulotni filmda reklama)" },
  { term: "pop-up ad", en: "an advertisement that opens a new window on a computer", uz: "qalqib chiquvchi reklama" },
  { term: "spam", en: "unwanted emails or messages, often for advertising", uz: "spam" },
  { term: "manipulative", en: "trying to influence or control someone unfairly", uz: "manipulyativ" },
  { term: "persuasive", en: "able to convince someone to do or believe something", uz: "ishontiradigan / ko'ndiradigan" },
  { term: "eye-catching", en: "very attractive or noticeable", uz: "e'tiborni tortadigan" },
  { term: "overrated", en: "valued more highly than it deserves", uz: "oshirib baholangan" },
  { term: "misleading", en: "giving a wrong idea or impression", uz: "chalg'ituvchi" },
  { term: "social media", en: "websites and apps that allow people to share content", uz: "ijtimoiy tarmoqlar" },
  { term: "viral", en: "spreading very quickly on the internet", uz: "viral / tez tarqaladigan" },
  { term: "algorithm", en: "a set of rules a platform uses to decide what you see", uz: "algoritm" },
  { term: "influencer", en: "someone with many followers who can influence opinions", uz: "bloger / influenser" },
  { term: "follower", en: "someone who subscribes to a person's social media account", uz: "obunachi" },
  { term: "content creator", en: "someone who produces videos, photos, or articles online", uz: "kontent yaratuvchisi" },
  { term: "digital footprint", en: "the record of everything you do online", uz: "raqamli iz" }
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
