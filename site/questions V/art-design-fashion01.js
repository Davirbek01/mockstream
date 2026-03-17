// Test Questions: Art, Design & Fashion (B1–C1)
// This file can be loaded by the test viewer
// Questions are generated randomly from vocabulary terms

window.TEST_META = {
  title: "🎨 Art, Design & Fashion — Vocabulary Test",
  logo: "https://i.ibb.co/4RYmcG6R/Bekzod-Turgunov-Logo.jpg",
  brand: "Art & Fashion",
  subtitle: "Bekzod Turg'unov",
  colors: {
    bg1: "#e91e63",
    bg2: "#9c27b0",
    accent: "#e91e63"
  }
};

// Vocabulary data - all terms with definitions
const VOCAB_DATA = [
  { term: "abstract art", en: "art that does not attempt to represent external reality", uz: "abstrakt san'at" },
  { term: "contemporary art", en: "art produced at the present period in time", uz: "zamonaviy san'at" },
  { term: "masterpiece", en: "a work of outstanding artistry, skill, or workmanship", uz: "shohasar" },
  { term: "aesthetic appeal", en: "the visual attractiveness of something", uz: "estetik joziba" },
  { term: "visual arts", en: "art forms such as painting, drawing, and sculpture", uz: "tasviriy san'at" },
  { term: "art gallery", en: "a room or building for the display or sale of works of art", uz: "badiiy galereya" },
  { term: "fine arts", en: "creative art, especially visual art whose products are to be appreciated primarily for their imaginative, aesthetic, or intellectual content", uz: "nafis san'at" },
  { term: "self-expression", en: "the expression of one's feelings, thoughts, or ideas through activities such as art", uz: "o'zini ifoda etish" },
  { term: "cultural heritage", en: "the legacy of physical artifacts and intangible attributes of a group or society", uz: "madaniy meros" },
  { term: "sculpture", en: "the art of making two- or three-dimensional representative or abstract forms", uz: "haykaltaroshlik" },
  { term: "performance art", en: "an art form that combines visual art with dramatic performance", uz: "performans" },
  { term: "artistic talent", en: "a natural ability to create art", uz: "badiiy iste'dod" },
  { term: "portrait", en: "a painting, drawing, or photograph of a person", uz: "portret" },
  { term: "landscape", en: "a painting or photograph depicting an area of land", uz: "manzara / peyzaj" },
  { term: "curator", en: "a keeper or custodian of a museum or other collection", uz: "kurator / muzey xodimi" },
  { term: "exhibition", en: "a public display of works of art or items of interest", uz: "ko'rgazma" },
  { term: "avant-garde", en: "new and experimental ideas and methods in art, music, or literature", uz: "avant-gard" },
  { term: "canvas", en: "a strong, coarse unbleached cloth used as a surface for oil painting", uz: "polotno / mato" },
  { term: "brushstroke", en: "a mark made by a paintbrush drawn across a surface", uz: "mo'yqalam zarbi" },
  { term: "sketch", en: "a rough or unfinished drawing or painting", uz: "eskiz / xomaki rasm" },
  { term: "still life", en: "a painting or drawing of an arrangement of objects, typically including fruit and flowers", uz: "natyurmort" },
  { term: "mural", en: "a painting or other work of art executed directly on a wall", uz: "devoriy rasm" },
  { term: "commission", en: "an instruction, command, or role given to a person", uz: "buyurtma bermoq" },
  { term: "artifact", en: "an object made by a human being, typically one of cultural or historical interest", uz: "eksponat / artefakt" },
  { term: "vandalism", en: "action involving deliberate destruction of or damage to public or private property", uz: "vandalizm / buzg'unchilik" },
  { term: "minimalist design", en: "design that uses the fewest possible elements to create the desired effect", uz: "minimalistik dizayn" },
  { term: "ergonomics", en: "the study of people's efficiency in their working environment", uz: "ergonomika" },
  { term: "functionality", en: "the quality of being suited to serve a purpose well; practicality", uz: "funksionallik / amaliylik" },
  { term: "user-friendly", en: "easy for people who are not experts to use or understand", uz: "foydalanuvchi uchun qulay" },
  { term: "innovative", en: "featuring new methods; advanced and original", uz: "innovatsion / yangi" },
  { term: "prototype", en: "a first, typical or preliminary model of something", uz: "prototip / nusxa" },
  { term: "sustainability", en: "the ability to be maintained at a certain rate or level", uz: "barqarorlik" },
  { term: "visual identity", en: "the visible elements of a brand, such as color, form, and shape", uz: "vizual identifikatsiya" },
  { term: "typography", en: "the style and appearance of printed matter", uz: "tipografiya" },
  { term: "color palette", en: "the range of colors used in a particular work or by a particular artist", uz: "ranglar palitrasi" },
  { term: "symmetry", en: "the quality of being made up of exactly similar parts facing each other or around an axis", uz: "simmetriya" },
  { term: "intricate", en: "very complicated or detailed", uz: "murakkab / batafsil" },
  { term: "streamlined", en: "designed or organized to give maximum efficiency", uz: "ixcham / samarali" },
  { term: "industrial design", en: "design applied to products that are to be manufactured by mass production", uz: "sanoat dizayni" },
  { term: "craftsmanship", en: "skill in a particular craft", uz: "mahorat / hunarmandchilik" },
  { term: "haute couture", en: "expensive, fashionable clothes produced by leading fashion houses", uz: "yuqori moda" },
  { term: "fast fashion", en: "inexpensive clothing produced rapidly by mass-market retailers in response to the latest trends", uz: "tezkor moda" },
  { term: "vintage clothing", en: "clothing from a previous era", uz: "vintaj kiyimlar" },
  { term: "trendsetter", en: "a person who leads the way in fashion or ideas", uz: "moda yo'nalishini belgilovchi" },
  { term: "ready-to-wear", en: "clothing made in standard sizes and intended to be sold in high-street shops", uz: "tayyor kiyim-kechak" },
  { term: "fashion statement", en: "a way of dressing that draws attention to oneself", uz: "moda orqali o'zini ifoda etish" },
  { term: "catwalk", en: "a platform along which models walk in a fashion show", uz: "podium" },
  { term: "tailor-made", en: "made to fit a particular person", uz: "maxsus tikilgan" },
  { term: "accessories", en: "things added to something else in order to make it more useful, versatile, or attractive", uz: "aksessuarlar" },
  { term: "wardrobe", en: "a person's entire collection of clothes", uz: "garderob" }
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

// Function to generate wrong options
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

// Generate questions dynamically
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
