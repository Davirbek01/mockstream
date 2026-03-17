// Test Questions: Films, Books & Music (B1–C1)
// Questions are generated randomly from vocabulary terms

window.TEST_META = {
  title: "🎬 Films, Books & Music — Vocabulary Test",
  logo: "https://i.ibb.co/4RYmcG6R/Bekzod-Turgunov-Logo.jpg",
  brand: "Films, Books & Music",
  subtitle: "Bekzod Turg'unov",
  colors: {
    bg1: "#7c3aed",
    bg2: "#5b21b6",
    accent: "#a78bfa"
  }
};

const VOCAB_DATA = [
  { term: "plot twist", en: "unexpected turn in the story", uz: "syujetdagi kutilmagan burilish" },
  { term: "slow build-up", en: "story develops gradually", uz: "sekin-asta rivojlanish" },
  { term: "predictable storyline", en: "story you can guess easily", uz: "oldindan bilinadigan syujet" },
  { term: "gripping opening scene", en: "exciting start that hooks you", uz: "juda qiziqarli boshlanish" },
  { term: "well-paced film", en: "film with good rhythm and timing", uz: "tempi yaxshi film" },
  { term: "satisfying ending", en: "conclusion that feels complete", uz: "qoniqarli yakun" },
  { term: "based on a true story", en: "inspired by real events", uz: "haqiqiy voqeaga asoslangan" },
  { term: "standout performance", en: "acting that really impresses", uz: "ajralib turadigan ijro" },
  { term: "steal the show", en: "be the most impressive", uz: "hammaning e'tiborini tortmoq" },
  { term: "natural dialogue", en: "conversation that sounds real", uz: "tabiiy dialoglar" },
  { term: "character development", en: "characters that grow and change", uz: "qahramonning rivojlanishi" },
  { term: "cinematography", en: "beautiful camera work", uz: "operatorlik ishi" },
  { term: "soundtrack", en: "music that accompanies a film", uz: "soundtrack" },
  { term: "page-turner", en: "book you can't stop reading", uz: "o'qishni to'xtatib bo'lmaydigan kitob" },
  { term: "couldn't put it down", en: "kept reading non-stop", uz: "qo'limdan qo'ya olmadim" },
  { term: "beautifully written", en: "has lovely writing style", uz: "chiroyli yozilgan" },
  { term: "thought-provoking novel", en: "book that makes you think", uz: "o'ylantiradigan roman" },
  { term: "coming-of-age story", en: "story about growing up", uz: "voyaga yetish hikoyasi" },
  { term: "character-driven", en: "focused on characters, not plot", uz: "qahramonga tayangan" },
  { term: "plot-driven", en: "focused on story events", uz: "syujetga tayangan" },
  { term: "explore a theme", en: "examine an idea deeply", uz: "mavzuni yoritmoq" },
  { term: "vivid description", en: "clear, detailed writing", uz: "jonli tasvir" },
  { term: "twist ending", en: "surprising conclusion", uz: "kutilmagan yakun" },
  { term: "catchy chorus", en: "memorable repeated part of song", uz: "quloqqa yoqadigan refren" },
  { term: "lyrics that hit home", en: "words that feel personal", uz: "yurakka tegadigan matn" },
  { term: "lift my mood", en: "make me feel happier", uz: "kayfiyatni ko'tarish" },
  { term: "help me unwind", en: "help me relax", uz: "bo'shashishga yordam berish" },
  { term: "blast music", en: "play music very loud", uz: "baland qilib qo'ymoq" },
  { term: "live performance", en: "concert/show in person", uz: "jonli ijro" },
  { term: "go to a gig", en: "attend a music concert", uz: "konsertga borish" },
  { term: "sing along", en: "sing with the music", uz: "birga kuylamoq" },
  { term: "sold out", en: "all tickets purchased", uz: "bileti tugagan" },
  { term: "cultural event", en: "important arts/music event", uz: "madaniy tadbir" },
  { term: "great atmosphere", en: "wonderful feeling/vibe", uz: "muhit zo'r" },
  { term: "discover new artists", en: "find musicians you didn't know", uz: "yangi ijodkorlarni topmoq" },
  { term: "broaden my horizons", en: "expand my knowledge", uz: "dunyoqarashni kengaytirmoq" },
  { term: "blockbuster", en: "very successful popular film", uz: "blokbaster" },
  { term: "box office hit", en: "film that made lots of money", uz: "kassada muvaffaqiyat" },
  { term: "sequel", en: "continuation of a previous film", uz: "davomi" },
  { term: "remake", en: "new version of an old film", uz: "qayta ishlangan film" },
  { term: "special effects", en: "visual tricks in films", uz: "maxsus effektlar" },
  { term: "the plot", en: "main story of a film/book", uz: "syujet" },
  { term: "main character", en: "central person in a story", uz: "bosh qahramon" },
  { term: "supporting role", en: "secondary character", uz: "ikkinchi darajali rol" },
  { term: "director", en: "person who leads film production", uz: "rejissyor" },
  { term: "the cast", en: "all actors in a film", uz: "aktyorlar tarkibi" },
  { term: "documentary", en: "non-fiction film about real events", uz: "hujjatli film" },
  { term: "thriller", en: "exciting suspenseful film/book", uz: "triller" },
  { term: "comedy", en: "funny film/book", uz: "komediya" },
  { term: "bestseller", en: "very popular book", uz: "bestseller" }
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
