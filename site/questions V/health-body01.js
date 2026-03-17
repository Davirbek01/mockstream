// Test Questions: Health & Body (B1–C1)
// Questions are generated randomly from vocabulary terms

window.TEST_META = {
  title: "🏥 Health & Body — Vocabulary Test",
  logo: "https://i.ibb.co/4RYmcG6R/Bekzod-Turgunov-Logo.jpg",
  brand: "Health & Body",
  subtitle: "Bekzod Turg'unov",
  colors: {
    bg1: "#10b981",
    bg2: "#059669",
    accent: "#34d399"
  }
};

const VOCAB_DATA = [
  { term: "come down with", en: "Start to have an illness", uz: "shamollab qolmoq / kasal bo'lib qolmoq" },
  { term: "runny nose", en: "When liquid keeps coming from your nose", uz: "burun oqishi" },
  { term: "sore throat", en: "Pain or irritation in the throat", uz: "tomoq og'rig'i" },
  { term: "high fever", en: "Body temperature much higher than normal", uz: "baland isitma" },
  { term: "food poisoning", en: "Illness caused by eating contaminated food", uz: "ovqatdan zaharlanish" },
  { term: "nausea", en: "Feeling like you might vomit", uz: "ko'ngil aynishi" },
  { term: "dizzy", en: "Feeling unsteady, like you might fall", uz: "boshi aylanmoq" },
  { term: "short of breath", en: "Difficulty breathing normally", uz: "nafas qisishi" },
  { term: "chronic pain", en: "Pain that lasts for a long time", uz: "surunkali og'riq" },
  { term: "allergic reaction", en: "Body's negative response to something", uz: "allergik reaksiya" },
  { term: "make an appointment", en: "Arrange a time to see a doctor", uz: "qabulga yozilmoq" },
  { term: "get a check-up", en: "Have a medical examination", uz: "ko'rikdan o'tmoq" },
  { term: "prescription", en: "Doctor's written order for medicine", uz: "retsept" },
  { term: "over-the-counter", en: "Medicine you can buy without a prescription", uz: "retseptsiz" },
  { term: "side effects", en: "Unwanted effects of a medicine", uz: "nojo'ya ta'sirlar" },
  { term: "take medication as prescribed", en: "Use medicine exactly as the doctor said", uz: "dorini retsept bo'yicha ichmoq" },
  { term: "recover from", en: "Get better after illness or injury", uz: "sog'aymoq / tiklanmoq" },
  { term: "undergo surgery", en: "Have a medical operation", uz: "operatsiya qilinmoq" },
  { term: "get vaccinated", en: "Receive a vaccine injection", uz: "emlanmoq" },
  { term: "first aid", en: "Basic emergency medical help", uz: "birinchi yordam" },
  { term: "balanced diet", en: "Eating the right amounts of different foods", uz: "muvozanatli ovqatlanish" },
  { term: "cut down on sugar", en: "Reduce the amount of sugar you eat", uz: "shakarni kamaytirmoq" },
  { term: "stay hydrated", en: "Drink enough water", uz: "suyuqlikni yetarli ichmoq" },
  { term: "get enough sleep", en: "Sleep for the recommended hours", uz: "yetarli uxlash" },
  { term: "work out", en: "Exercise to stay fit", uz: "mashq qilmoq" },
  { term: "warm up", en: "Do light exercise before main workout", uz: "qizib olish" },
  { term: "build up immunity", en: "Strengthen your body's defense system", uz: "immunitetni kuchaytirmoq" },
  { term: "avoid junk food", en: "Stay away from unhealthy processed food", uz: "tez tayyor ovqatlardan qochmoq" },
  { term: "manage your stress", en: "Control stress in healthy ways", uz: "stressni boshqarmoq" },
  { term: "routine", en: "Regular pattern of activities", uz: "kundalik tartib" },
  { term: "gain muscle", en: "Build more muscle through exercise", uz: "mushak to'plash" },
  { term: "lose weight", en: "Reduce your body weight", uz: "vazn tashlash" },
  { term: "keep fit", en: "Stay in good physical condition", uz: "sog'lom qolmoq / formani saqlamoq" },
  { term: "watch your portions", en: "Be careful about how much you eat", uz: "porsiyani nazorat qilmoq" },
  { term: "whole grains", en: "Grains that haven't been refined", uz: "butun don mahsulotlari" },
  { term: "strength training", en: "Exercise using weights or resistance", uz: "kuch mashqlari" },
  { term: "cardio", en: "Exercise that raises your heart rate", uz: "kardio (yurak-qon tomir mashqlari)" },
  { term: "stretch", en: "Extend muscles to improve flexibility", uz: "cho'zilish mashqlari qilmoq" },
  { term: "meal prep", en: "Preparing meals in advance", uz: "oldindan ovqat tayyorlab qo'yish" },
  { term: "cravings", en: "Strong desire for specific foods", uz: "xohish / ishtaha tortishi" },
  { term: "burn out", en: "Become exhausted from overwork", uz: "kuyib ketmoq (charchab qolmoq)" },
  { term: "feel overwhelmed", en: "Feel too much pressure or stress", uz: "o'zingizni bosimda his qilmoq" },
  { term: "talk it out", en: "Discuss problems to feel better", uz: "gaplashib olish" },
  { term: "set boundaries", en: "Create limits to protect yourself", uz: "chegaralar qo'ymoq" },
  { term: "take a mental break", en: "Rest your mind from stress", uz: "ruhiy tanaffus qilmoq" },
  { term: "anxiety", en: "Feeling of worry or fear", uz: "tashvish / xavotir" },
  { term: "keep a journal", en: "Write regularly about thoughts and feelings", uz: "kundalik yozmoq" },
  { term: "mindfulness", en: "Being fully present and aware", uz: "hushyorlik (mindfulness)" },
  { term: "sleep hygiene", en: "Habits that help you sleep well", uz: "uyqu gigiyenasi" },
  { term: "support system", en: "People who help you emotionally", uz: "qo'llab-quvvatlovchi doira" }
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
