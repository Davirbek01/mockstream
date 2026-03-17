// Test Questions: Crime & Law (B1–C1)
// This file can be loaded by the test viewer
// Questions are generated randomly from vocabulary terms

window.TEST_META = {
  title: "⚖️ Crime & Law — Vocabulary Test",
  logo: "https://i.ibb.co/4RYmcG6R/Bekzod-Turgunov-Logo.jpg",
  brand: "Crime & Law",
  subtitle: "Bekzod Turg'unov",
  colors: {
    bg1: "#374151",
    bg2: "#1f2937",
    accent: "#ef4444"
  }
};

// Vocabulary data - all terms with definitions
const VOCAB_DATA = [
  { term: "commit a crime", en: "carry out an illegal act", uz: "jinoyat sodir etmoq" },
  { term: "break the law", en: "do something illegal", uz: "qonunni buzmoq" },
  { term: "offence", en: "an illegal act; a crime (formal)", uz: "huquqbuzarlik / jinoyat" },
  { term: "theft", en: "the general act of stealing", uz: "o'g'rilik" },
  { term: "burglary", en: "breaking into a building to steal", uz: "uyni buzib kirib o'g'irlik" },
  { term: "robbery", en: "stealing from a person or place using force", uz: "qaroqchilik / tunash" },
  { term: "shoplifting", en: "stealing goods from a shop while it's open", uz: "do'kon o'g'riligi" },
  { term: "vandalism", en: "damaging public or private property on purpose", uz: "vandalizm / mulkni payhon qilish" },
  { term: "arson", en: "setting fire to a building on purpose", uz: "atayin o't qo'yish" },
  { term: "murder", en: "killing someone on purpose", uz: "qotillik" },
  { term: "manslaughter", en: "killing someone without intending to", uz: "ehtiyotsizlikdan odam o'ldirish" },
  { term: "kidnapping", en: "taking someone away by force for money", uz: "odam o'g'irlash" },
  { term: "hijacking", en: "taking control of a plane or vehicle by force", uz: "transportni olib qochish" },
  { term: "blackmail", en: "threatening to reveal a secret unless paid", uz: "tovlamachilik / shantaj" },
  { term: "bribery", en: "giving money to someone to influence them", uz: "pora berish / poraxo'rlik" },
  { term: "corruption", en: "dishonest behavior by people in power", uz: "korrupsiya" },
  { term: "fraud", en: "deceiving people to get money", uz: "firibgarlik" },
  { term: "cybercrime", en: "crimes committed using a computer or internet", uz: "kiberjinoyat" },
  { term: "cyberbullying", en: "using the internet to harm or frighten someone", uz: "kiberta'qib / bulling" },
  { term: "stalk", en: "persistently follow or watch someone illegally", uz: "ta'qib qilmoq" },
  { term: "assault", en: "a physical attack on someone", uz: "hujum / hujum qilish" },
  { term: "mugging", en: "attacking someone in public to steal from them", uz: "ko'chada qaroqchilik" },
  { term: "pickpocketing", en: "stealing from someone's pocket or bag", uz: "cho'ntakkesarlik" },
  { term: "drug trafficking", en: "illegal trade of drugs", uz: "narkobiznes" },
  { term: "smuggling", en: "importing or exporting goods illegally", uz: "kontrabanda" },
  { term: "investigate", en: "examine a crime to find the truth", uz: "tadqiq qilmoq" },
  { term: "solve a crime", en: "find the perpetrator of a crime", uz: "jinoyatni ochmoq" },
  { term: "suspect", en: "someone who may have committed a crime", uz: "gumonlanuvchi" },
  { term: "witness", en: "someone who saw a crime happen", uz: "guvoh" },
  { term: "victim", en: "someone who has been harmed by a crime", uz: "jabrlanuvchi / qurbon" },
  { term: "gather evidence", en: "collect information to prove a crime", uz: "dalil to'plamoq" },
  { term: "forensics", en: "scientific tests used in crime investigation", uz: "sud ekspertizasi" },
  { term: "fingerprints", en: "marks made by the tips of fingers", uz: "barmoq izlari" },
  { term: "DNA evidence", en: "biological proof used to identify someone", uz: "DNK dalili" },
  { term: "alibi", en: "proof that someone was elsewhere during a crime", uz: "alibi" },
  { term: "arrest", en: "take someone into custody by the police", uz: "hibsga olmoq" },
  { term: "detention", en: "keeping someone in custody", uz: "ushlab turish / hibs" },
  { term: "interrogate", en: "ask someone many questions formally", uz: "so'roq qilmoq" },
  { term: "confession", en: "admitting that you committed a crime", uz: "aybini bo'yniga olish" },
  { term: "court", en: "the place where legal trials take place", uz: "sud / sud mahkamasi" },
  { term: "judge", en: "the official who decides cases in court", uz: "sudya" },
  { term: "jury", en: "a group of people who decide the verdict", uz: "hakamlar hay'ati" },
  { term: "lawyer", en: "a person whose job is to give legal advice", uz: "advokat / huquqshunos" },
  { term: "prosecutor", en: "the lawyer who tries to prove the suspect is guilty", uz: "prokuror / ayblovchi" },
  { term: "defendant", en: "the person accused of a crime in court", uz: "javobgar / sudlanuvchi" },
  { term: "trial", en: "the formal process of examining a case in court", uz: "sud jarayoni" },
  { term: "verdict", en: "the final decision of a jury or judge", uz: "hukm / qaror" },
  { term: "guilty", en: "having committed a crime", uz: "aybdor" },
  { term: "innocent", en: "not having committed a crime", uz: "aybsiz" },
  { term: "sentence", en: "the punishment given by a judge", uz: "jazo hukmi" }
];

// Function to shuffle array
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
  const shuffled = shuffleArray(wrongTerms);
  return shuffled.slice(0, count).map(t => t.term);
}

function getWrongDefinitions(correctDef, allTerms, count = 3) {
  const wrongTerms = allTerms.filter(t => t.en !== correctDef);
  const shuffled = shuffleArray(wrongTerms);
  return shuffled.slice(0, count).map(t => t.en);
}

function getWrongUzbekOptions(correctUz, allTerms, count = 3) {
  const wrongTerms = allTerms.filter(t => t.uz !== correctUz);
  const shuffled = shuffleArray(wrongTerms);
  return shuffled.slice(0, count).map(t => t.uz);
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
    const question = questionTypes[typeIndex](vocab);
    questions.push(question);
  }
  
  return shuffleArray(questions);
}

window.ALL_QUESTIONS = generateQuestions();
window.regenerateQuestions = function() {
  window.ALL_QUESTIONS = generateQuestions();
};
