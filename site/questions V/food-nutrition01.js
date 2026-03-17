// Test Questions: Food & Nutrition (B1–C1)
// Questions are generated randomly from vocabulary terms

window.TEST_META = {
  title: "🥗 Food & Nutrition — Vocabulary Test",
  logo: "https://i.ibb.co/4RYmcG6R/Bekzod-Turgunov-Logo.jpg",
  brand: "Food & Nutrition",
  subtitle: "Bekzod Turg'unov",
  colors: {
    bg1: "#ea580c",
    bg2: "#c2410c",
    accent: "#fb923c"
  }
};

const VOCAB_DATA = [
  { term: "balanced diet", en: "a diet that contains the proper proportions of nutrients", uz: "muvozanatlashgan parhez" },
  { term: "nutritional value", en: "how good a particular kind of food is for your health", uz: "ozuqaviy qiymat" },
  { term: "nutrient-dense", en: "foods that are high in nutrients but low in calories", uz: "oziq moddalarga boy" },
  { term: "processed food", en: "food that has been changed from its natural state", uz: "qayta ishlangan oziq-ovqat" },
  { term: "dietary requirements", en: "specific needs for what someone can or cannot eat", uz: "parhez talablari" },
  { term: "cut down on", en: "reduce the amount or consumption of something", uz: "iste'molni kamaytirmoq" },
  { term: "source of protein", en: "a food that provides the body with protein", uz: "oqsil manbai" },
  { term: "high in fiber", en: "containing a large amount of fiber", uz: "kletchatkaga boy" },
  { term: "low-carb diet", en: "a diet that restricts carbohydrates", uz: "past uglevodli parhez" },
  { term: "organic produce", en: "fruits and vegetables grown without chemicals", uz: "organik mahsulotlar" },
  { term: "empty calories", en: "calories from foods that offer no nutritional value", uz: "bo'sh kaloriyalar" },
  { term: "sedentary lifestyle", en: "a type of lifestyle with little or no physical activity", uz: "kamharakat turmush tarzi" },
  { term: "binge eating", en: "consuming large amounts of food in a short time", uz: "ko'p yeb yubormoq" },
  { term: "portion control", en: "managing the size of your food servings", uz: "porsiya nazorati" },
  { term: "food additives", en: "substances added to food to improve color or taste", uz: "oziq-ovqat qo'shimchalari" },
  { term: "genetically modified", en: "organisms whose DNA has been altered", uz: "genetik o'zgartirilgan" },
  { term: "whole grain", en: "made with all parts of the grain", uz: "yaxlit donli" },
  { term: "artificial sweeteners", en: "sugar substitutes that are made by humans", uz: "sun'iy tatlandiricilar" },
  { term: "calorie intake", en: "the total number of calories a person consumes", uz: "kaloriya iste'moli" },
  { term: "food poisoning", en: "illness caused by eating contaminated food", uz: "ovqatdan zaharlanish" },
  { term: "piece of cake", en: "something that is very easy to do", uz: "juda oson" },
  { term: "take it with a grain of salt", en: "to not completely believe something", uz: "shubha bilan qaramoq" },
  { term: "bite off more than you can chew", en: "to try to do something too difficult", uz: "kuching yetmaydigan ishga qo'l urmoq" },
  { term: "not my cup of tea", en: "not the type of thing that you like", uz: "mening didimdagi narsa emas" },
  { term: "full of beans", en: "having a lot of energy and enthusiasm", uz: "g'ayratga to'lgan" },
  { term: "cream of the crop", en: "the best of a particular group", uz: "eng sarasi / qaymog'i" },
  { term: "butter someone up", en: "to be very nice to someone so they will help you", uz: "xushomad qilmoq" },
  { term: "spill the beans", en: "to reveal a secret accidentally or on purpose", uz: "sirni ochib qo'ymoq" },
  { term: "sell like hotcakes", en: "to sell very quickly and in large numbers", uz: "chaqqon sotilmoq" },
  { term: "have a sweet tooth", en: "to have a strong liking for sweet foods", uz: "shirinlikxo'r bo'lmoq" },
  { term: "bring home the bacon", en: "to earn the money that a family needs to live", uz: "ro'zg'or tebratmoq" },
  { term: "a tough nut to crack", en: "a problem that is difficult to deal with", uz: "qiyin muammo" },
  { term: "in a nutshell", en: "using as few words as possible; briefly", uz: "qisqacha qilib aytganda" },
  { term: "apple of my eye", en: "someone who is very important to you", uz: "ko'z qorachig'i" },
  { term: "sour grapes", en: "pretending to dislike something because you can't have it", uz: "erisholmagan narsasini yomonlash" },
  { term: "bread and butter", en: "someone's basic income or livelihood", uz: "rizq-ro'z / tirikchilik manbai" },
  { term: "go bananas", en: "to become very angry, crazy or excited", uz: "juda g'azablanmoq" },
  { term: "cool as a cucumber", en: "very calm and relaxed", uz: "vazmin / parvoyi palak" },
  { term: "walk on eggshells", en: "to be very careful not to offend someone", uz: "ehtiyotkor bo'lmoq" },
  { term: "icing on the cake", en: "something that makes a good situation even better", uz: "nur ustiga a'lo nur" },
  { term: "wine and dine", en: "to entertain someone with food and drink", uz: "mehmon qilmoq" },
  { term: "eat like a horse", en: "to eat a lot of food", uz: "juda ko'p ovqat yemoq" },
  { term: "eat like a bird", en: "to eat very little food", uz: "juda kam ovqat yemoq" },
  { term: "grab a bite to eat", en: "to eat something quickly", uz: "tezda biror nima yeb olmoq" },
  { term: "mouth-watering", en: "smelling, looking, or sounding delicious", uz: "og'izdan suv keltiradigan" },
  { term: "dine out", en: "to eat at a restaurant instead of at home", uz: "restoranda ovqatlanmoq" },
  { term: "on the house", en: "provided free of charge by a restaurant", uz: "muassasa hisobidan / bepul" },
  { term: "have a big appetite", en: "to be regularly very hungry", uz: "ishtahasi kuchli bo'lmoq" },
  { term: "lose your appetite", en: "to no longer feel hungry", uz: "ishtahasi yo'qolmoq" },
  { term: "wolf down", en: "to eat something very quickly and hungrily", uz: "ochofatlarcha yeb yubormoq" }
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
