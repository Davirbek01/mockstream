// Test Questions: Free Time, Hobbies & Sports (B1–B2)
// Questions are generated randomly from vocabulary terms

window.TEST_META = {
  title: "⚽ Free Time & Sports — Vocabulary Test",
  logo: "https://i.ibb.co/4RYmcG6R/Bekzod-Turgunov-Logo.jpg",
  brand: "Free Time & Sports",
  subtitle: "Bekzod Turg'unov",
  colors: {
    bg1: "#2563eb",
    bg2: "#1d4ed8",
    accent: "#3b82f6"
  }
};

const VOCAB_DATA = [
  { term: "spare time", en: "free time when you are not working or studying", uz: "bo'sh vaqt" },
  { term: "downtime", en: "time to rest and relax after being busy", uz: "dam olish vaqti" },
  { term: "pastime", en: "an activity you do for pleasure in your free time", uz: "bo'sh vaqt mashg'uloti" },
  { term: "unwind", en: "to relax after stress or hard work", uz: "bo'shashmoq, dam olmoq" },
  { term: "wind down", en: "to gradually become calmer and more relaxed", uz: "sekin-asta tinchlanmoq" },
  { term: "take a break", en: "to stop for a short rest", uz: "tanaffus qilmoq" },
  { term: "recharge", en: "to regain energy and feel fresh again", uz: "quvvat to'plamoq" },
  { term: "kill time", en: "to spend time while waiting for something", uz: "vaqt o'tkazmoq" },
  { term: "make time for", en: "to arrange time in your schedule for something", uz: "vaqt ajratmoq" },
  { term: "be in the mood for", en: "to feel like doing or having something", uz: "xohishi bo'lmoq" },
  { term: "once in a while", en: "sometimes, but not often", uz: "vaqti-vaqti bilan" },
  { term: "every now and then", en: "occasionally; from time to time", uz: "ba'zan, goh-goh" },
  { term: "hang out", en: "to spend time casually with friends", uz: "birga vaqt o'tkazmoq" },
  { term: "catch up", en: "to meet and share news after time apart", uz: "gaplashib olish, yangilik almashmoq" },
  { term: "meet up", en: "to meet someone, usually by arrangement", uz: "uchrashmoq" },
  { term: "keep in touch", en: "to stay connected with someone", uz: "aloqada bo'lmoq" },
  { term: "go for a walk", en: "to take a walk for pleasure or exercise", uz: "sayrga chiqmoq" },
  { term: "scroll", en: "to move through content on a phone or screen", uz: "telefon titkilamoq" },
  { term: "read for pleasure", en: "to read because you enjoy it, not for study", uz: "zavq uchun o'qimoq" },
  { term: "grab coffee", en: "to get coffee quickly with someone", uz: "qahva ichib olish" },
  { term: "get out of the house", en: "to leave home and go somewhere", uz: "uydan chiqmoq" },
  { term: "work out", en: "to exercise, usually in a planned way", uz: "mashq qilmoq" },
  { term: "stay in shape", en: "to keep your body fit and healthy", uz: "formada bo'lmoq" },
  { term: "warm up", en: "to prepare your body before exercise", uz: "qizish" },
  { term: "cool down", en: "to relax muscles after exercise", uz: "sovish" },
  { term: "stretch", en: "to extend your muscles to avoid injury", uz: "cho'zilmoq" },
  { term: "build stamina", en: "to increase your physical endurance", uz: "chidamlilikni oshirmoq" },
  { term: "break a sweat", en: "to start sweating because of hard effort", uz: "terlab ketmoq" },
  { term: "personal best", en: "your best-ever performance or result", uz: "shaxsiy rekord" },
  { term: "push yourself", en: "to force yourself to try harder", uz: "o'zingni majburlamoq" },
  { term: "take it easy", en: "to do less and avoid too much effort", uz: "yengilroq qilmoq" },
  { term: "overdo it", en: "to do something too much", uz: "haddan oshirmoq" },
  { term: "cardio", en: "exercise that increases heart rate", uz: "kardio mashq" },
  { term: "strength training", en: "exercises to build muscle power", uz: "kuch mashqlari" },
  { term: "train", en: "to practise a sport or skill seriously", uz: "mashq qilmoq, tayyorlanmoq" },
  { term: "practise", en: "to do something repeatedly to improve", uz: "mashq qilmoq" },
  { term: "compete", en: "to take part in a contest or match", uz: "musobaqalashmoq" },
  { term: "take up (a hobby)", en: "to start a new hobby or activity", uz: "boshlamoq" },
  { term: "give up", en: "to stop doing something", uz: "tashlab qo'ymoq" },
  { term: "try out", en: "to test something to see if you like it", uz: "sinab ko'rmoq" },
  { term: "sign up for", en: "to register officially for something", uz: "ro'yxatdan o'tmoq" },
  { term: "stick with", en: "to continue doing something despite difficulty", uz: "davom ettirmoq" },
  { term: "burn out", en: "to become extremely tired and lose motivation", uz: "holdan toyib ketmoq" },
  { term: "get back into", en: "to start doing something again after a break", uz: "yana qaytib boshlamoq" },
  { term: "kick off", en: "to start (a match or event)", uz: "boshlanmoq (o'yin)" },
  { term: "score a goal", en: "to get a point in football or hockey", uz: "gol urmoq" },
  { term: "make a pass", en: "to send the ball to a teammate", uz: "pas bermoq" },
  { term: "defend", en: "to protect your goal or area from attack", uz: "himoyalanmoq" },
  { term: "come from behind", en: "to win after being behind in score", uz: "orqadan yetib yutmoq" },
  { term: "fair play", en: "playing honestly and respecting the rules", uz: "halol o'yin" }
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
