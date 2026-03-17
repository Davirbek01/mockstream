// Test Questions: Natural Disasters & Geography (B2–C2)
// Questions are generated randomly from vocabulary terms

window.TEST_META = {
  title: "🌋 Disasters & Geography — Vocabulary Test",
  logo: "https://i.ibb.co/4RYmcG6R/Bekzod-Turgunov-Logo.jpg",
  brand: "Disasters & Geography",
  subtitle: "Bekzod Turg'unov",
  colors: {
    bg1: "#dc2626",
    bg2: "#991b1b",
    accent: "#f97316"
  }
};

const VOCAB_DATA = [
  { term: "seismic activity", en: "the frequency and intensity of earthquakes in a given area", uz: "seysmik faollik" },
  { term: "tectonic plate movement", en: "the motion of the large plates that make up the Earth's crust", uz: "tektonik plitalarning harakati" },
  { term: "catastrophic earthquake", en: "an extremely large and destructive earthquake", uz: "halokatli zilzila" },
  { term: "aftershock", en: "a smaller earthquake that follows a larger one", uz: "afshok" },
  { term: "epicenter", en: "the point on the Earth's surface directly above the focus of an earthquake", uz: "zilzila epitsentri" },
  { term: "volcanic eruption", en: "the sudden discharge of steam and lava from a volcano", uz: "vulqon otilishi" },
  { term: "dormant volcano", en: "a volcano that is not currently active but may erupt in the future", uz: "so'ngan vulqon" },
  { term: "lava flow", en: "a mass of flowing or solidified lava", uz: "lava oqimi" },
  { term: "tsunami warning", en: "a network of sensors and sirens used to detect approaching tsunamis", uz: "tsunami haqida ogohlantirish" },
  { term: "coastal erosion", en: "the loss of land along the coastline due to waves and currents", uz: "qirg'oq eroziyasi" },
  { term: "landslide", en: "the sliding down of a mass of earth from a mountain", uz: "ko'chki" },
  { term: "natural disaster mitigation", en: "actions taken to reduce the impact of natural disasters", uz: "ofatlar ta'sirini kamaytirish" },
  { term: "emergency relief", en: "the immediate assistance provided to victims of a disaster", uz: "shoshilinch yordam" },
  { term: "humanitarian aid", en: "assistance used to provide basic needs to people in distress", uz: "humanitar yordam" },
  { term: "state of emergency", en: "a situation where a government takes extra powers to deal with disaster", uz: "favqulodda holat" },
  { term: "search and rescue", en: "the process of finding and providing aid to people in danger", uz: "qidiruv-qutqaruv" },
  { term: "Richter scale", en: "a measure of the energy released by an earthquake", uz: "Rixter shkalasi" },
  { term: "fault line", en: "a crack in the Earth's crust along which movement has occurred", uz: "yoriq chizig'i" },
  { term: "evacuation order", en: "an official command to leave a dangerous area", uz: "evakuatsiya buyrug'i" },
  { term: "disaster-prone area", en: "an area that is likely to experience natural disasters", uz: "ofat xavfi yuqori hudud" },
  { term: "prolonged drought", en: "a long period of time with little or no rain", uz: "davomli qurg'oqchilik" },
  { term: "flash flood", en: "a sudden local flood, typically due to heavy rain", uz: "to'satdan suv toshqini" },
  { term: "torrential rain", en: "very heavy rain", uz: "sel / jala" },
  { term: "hurricane", en: "powerful tropical storms with high winds and heavy rain", uz: "to'fon / uragan" },
  { term: "eye of the storm", en: "the calm area at the center of a hurricane", uz: "to'fon ko'zi" },
  { term: "storm surge", en: "a rising of the sea as a result of atmospheric pressure changes", uz: "shtorm to'lqini" },
  { term: "blizzard", en: "severe snowstorm with high winds and low visibility", uz: "qor bo'roni" },
  { term: "heatwave", en: "a period of abnormally hot weather", uz: "issiq havo to'lqini" },
  { term: "wildfire", en: "a large uncontrolled fire in nature", uz: "o'rmon yong'ini" },
  { term: "monsoon season", en: "a seasonal change in winds, often bringing heavy rain", uz: "mussonlar mavsumi" },
  { term: "water scarcity", en: "the lack of sufficient water resources", uz: "suv tanqisligi" },
  { term: "avalanche", en: "a large mass of snow falling down a mountain", uz: "qor ko'chkisi" },
  { term: "dust storm", en: "a strong wind that carries clouds of dust and sand", uz: "chang bo'roni" },
  { term: "tornado", en: "a violent rotating column of air", uz: "tornado" },
  { term: "risk assessment", en: "the process of identifying and evaluating potential hazards", uz: "xavf-xatarni baholash" },
  { term: "mountain range", en: "a large group of connected mountains", uz: "tog' tizmasi" },
  { term: "fertile floodplains", en: "flat land near a river that has very good soil for farming", uz: "unumdor tekislik" },
  { term: "arid desert", en: "a dry and barren area of land with little water", uz: "qurg'oqchil cho'l" },
  { term: "continental shelf", en: "the area of seabed around a large landmass where the sea is shallow", uz: "kontinental shelf" },
  { term: "plateau", en: "an area of relatively level high ground", uz: "plato" },
  { term: "archipelago", en: "a group or chain of islands", uz: "orollar arxipelagi" },
  { term: "geological formation", en: "a natural feature of the Earth's surface", uz: "geologik tuzilma" },
  { term: "glacial retreat", en: "the movement of a glacier back up a mountain as it melts", uz: "muzliklarning chekinishi" },
  { term: "topographical map", en: "a map that shows the physical features of an area", uz: "topografik xarita" },
  { term: "subduction zone", en: "the region where one tectonic plate is being pushed under another", uz: "subduktsiya zonasi" },
  { term: "geothermal energy", en: "energy derived from the heat of the Earth's interior", uz: "geotermal energiya" },
  { term: "river delta", en: "a landform created by sediment where a river flows into an ocean", uz: "daryo deltasi" },
  { term: "estuary", en: "the area where a freshwater river meets the salty ocean water", uz: "estuariy" },
  { term: "coral reef", en: "a diverse underwater ecosystem characterized by corals", uz: "marjon riflari" },
  { term: "tremor", en: "a slight earthquake", uz: "yer qimirlashi" }
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
