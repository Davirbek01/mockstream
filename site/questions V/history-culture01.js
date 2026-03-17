// Test Questions: History & Cultural Heritage (B2–C2)
// Questions are generated randomly from vocabulary terms

window.TEST_META = {
  title: "📜 History & Culture — Vocabulary Test",
  logo: "https://i.ibb.co/4RYmcG6R/Bekzod-Turgunov-Logo.jpg",
  brand: "History & Culture",
  subtitle: "Bekzod Turg'unov",
  colors: {
    bg1: "#92400e",
    bg2: "#78350f",
    accent: "#d97706"
  }
};

const VOCAB_DATA = [
  { term: "prehistoric era", en: "the period of time before written records", uz: "tarixga qadar bo'lgan davr" },
  { term: "ancient civilization", en: "a complex society with government and social hierarchy in the past", uz: "qadimgi sivilizatsiya" },
  { term: "medieval period", en: "the period in European history from the 5th to the 15th century", uz: "o'rta asrlar davri" },
  { term: "renaissance", en: "a period marking the transition from the Middle Ages to modernity", uz: "uyg'onish davri (renessans)" },
  { term: "industrial revolution", en: "the transition to new manufacturing processes in 18th–19th century", uz: "sanoat inqilobi" },
  { term: "colonial era", en: "the period when European powers established colonies on other continents", uz: "mustamlakachilik davri" },
  { term: "dynasty", en: "a line of hereditary rulers of a country", uz: "sulola" },
  { term: "empire", en: "an extensive group of states under a single supreme authority", uz: "imperiya" },
  { term: "predecessor", en: "a person who held a job or office before the current holder", uz: "o'tmishdosh / ajdod" },
  { term: "successor", en: "a person or thing that succeeds another", uz: "voris / davomchi" },
  { term: "monarchy", en: "a form of government with a monarch at the head", uz: "monarxiya / podshohlik" },
  { term: "heirloom", en: "a valuable object that has belonged to a family for several generations", uz: "meros (oilaviy)" },
  { term: "ancestry", en: "one's family or ethnic descent", uz: "ajdodlar / nasl-nasab" },
  { term: "artifact", en: "an object made by a human being of cultural or historical interest", uz: "artefakt / eksponat" },
  { term: "historical archives", en: "a collection of historical documents or records", uz: "tarixiy arxivlar" },
  { term: "cultural heritage", en: "the legacy of physical artifacts and intangible attributes of a society", uz: "madaniy meros" },
  { term: "oral tradition", en: "information passed down through generations by word of mouth", uz: "og'zaki an'ana" },
  { term: "monument", en: "a statue or structure erected to commemorate a person or event", uz: "monument / haykal / yodgorlik" },
  { term: "landmark", en: "an object or feature easily seen and recognized from a distance", uz: "diqqatga sazovor joy / bino" },
  { term: "preservation", en: "the action of preserving something", uz: "saqlash / muhofaza qilish" },
  { term: "reconstruction", en: "the action or process of reconstructing something", uz: "qayta qurish / rekonstruksiya" },
  { term: "excavation", en: "the action of excavating an archaeological site", uz: "qazishma / kovlash" },
  { term: "feudalism", en: "the dominant social system in medieval Europe", uz: "feodalizm" },
  { term: "enlightenment", en: "European intellectual movement of the late 17th and 18th centuries", uz: "ma'rifatparvarlik davri" },
  { term: "chronicle", en: "a factual written account of historical events in order", uz: "solnoma / xronika" },
  { term: "archaeological site", en: "a place where evidence of past activity is preserved", uz: "arxeologik ob'ekt / qazishma joyi" },
  { term: "fossil", en: "the remains of a prehistoric organism preserved in petrified form", uz: "toshga aylangan qoldiq / qazilma boylik" },
  { term: "relic", en: "an object surviving from an earlier time of historical interest", uz: "osori-atiqa / qoldiq" },
  { term: "manuscript", en: "a book or document written by hand rather than typed", uz: "qo'lyozma" },
  { term: "inscription", en: "words inscribed on a monument or in a book", uz: "bitik / yozuv" },
  { term: "curation", en: "the action of selecting and organizing items in an exhibition", uz: "kuratorlik / ekspozitsiya tayyorlash" },
  { term: "conservation", en: "the action of conserving and preserving something", uz: "konservatsiya / saqlash" },
  { term: "restoration", en: "the action of returning something to its former condition", uz: "restavratsiya / qayta tiklash" },
  { term: "antiquity", en: "the ancient past before the Middle Ages", uz: "qadimgi davr / antik davr" },
  { term: "excavate", en: "make a hole or channel by digging", uz: "qazib olmoq / kovlamoq" },
  { term: "indigenous culture", en: "the culture of the original inhabitants of a place", uz: "tub joy madaniyati" },
  { term: "tangible heritage", en: "physical artifacts produced and maintained across generations", uz: "moddiy meros" },
  { term: "intangible heritage", en: "traditions or living expressions inherited from ancestors", uz: "nomoddiy meros" },
  { term: "patronage", en: "the support given by a patron", uz: "homiylik / homiylik qilish" },
  { term: "hieroglyphics", en: "writing consisting of hieroglyphs", uz: "iyerogliflar" },
  { term: "mythology", en: "a collection of myths belonging to a cultural tradition", uz: "mifologiya" },
  { term: "folklore", en: "the traditional beliefs, customs, and stories of a community", uz: "folklor" },
  { term: "nomadic", en: "living the life of a nomad; wandering", uz: "ko'chmanchi" },
  { term: "fortress", en: "a military stronghold, especially a fortified town", uz: "qal'a / qo'rg'on" },
  { term: "shrine", en: "a place regarded as holy because of its associations", uz: "ziyoratgoh / muqaddas joy" },
  { term: "epic", en: "a long poem derived from ancient oral tradition", uz: "epos / doston" },
  { term: "heritage site", en: "a place listed as of special cultural or physical significance", uz: "merosi ob'ekti" },
  { term: "custodian", en: "a person who has responsibility for looking after something", uz: "vasiy / mas'ul shaxs / qo'riqchi" },
  { term: "legacy", en: "something left or handed down by a predecessor", uz: "meros" },
  { term: "time capsule", en: "a container storing objects chosen as typical of the present time", uz: "vaqt kapsulasi" }
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
