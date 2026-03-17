// Test Questions: Money & Consumerism (B1–C1)
// Questions are generated randomly from vocabulary terms

window.TEST_META = {
  title: "💰 Money & Consumerism — Vocabulary Test",
  logo: "https://i.ibb.co/4RYmcG6R/Bekzod-Turgunov-Logo.jpg",
  brand: "Money & Consumerism",
  subtitle: "Bekzod Turg'unov",
  colors: {
    bg1: "#059669",
    bg2: "#047857",
    accent: "#10b981"
  }
};

const VOCAB_DATA = [
  { term: "cost of living", en: "the amount of money needed to sustain a certain standard of living", uz: "yashash narxi" },
  { term: "standard of living", en: "the degree of wealth and material comfort available to a person", uz: "turmush darajasi" },
  { term: "disposable income", en: "money left after taxes and necessary expenses have been paid", uz: "ixtiyoriy foydalaniladigan daromad" },
  { term: "to be in the red", en: "to owe money to the bank", uz: "bankdan qarzdor bo'lmoq" },
  { term: "to be in the black", en: "to have money in your bank account; not owing money", uz: "foydada bo'lmoq" },
  { term: "pay off a debt", en: "to finish paying the money that you owe", uz: "qarzni uzmoq" },
  { term: "interest rate", en: "the percentage of a loan that is charged as interest", uz: "foiz stavkasi" },
  { term: "savings account", en: "a bank account that earns interest on the money kept in it", uz: "omonat hisob raqami" },
  { term: "budget deficit", en: "when spending exceeds income", uz: "budjet taqchilligi" },
  { term: "tax evasion", en: "the illegal non-payment or underpayment of taxes", uz: "soliqdan qochish" },
  { term: "pension plan", en: "a system for saving money to use after retirement", uz: "pensiya rejasi" },
  { term: "stock market", en: "a place where shares of companies are bought and sold", uz: "fond bozori" },
  { term: "inflation rate", en: "the rate at which prices for goods and services rise", uz: "inflatsiya darajasi" },
  { term: "recession", en: "a period of temporary economic decline", uz: "retsessiya / iqtisodiy pasayish" },
  { term: "utility bills", en: "payments for basic services like electricity, water, and gas", uz: "kommunal to'lovlar" },
  { term: "overdraft", en: "a deficit in a bank account caused by drawing more money than held", uz: "overdraft" },
  { term: "mortgage", en: "a legal agreement by which a bank lends money for property purchase", uz: "ipoteka" },
  { term: "financial stability", en: "the condition where the financial system can withstand shocks", uz: "moliyaviy barqarorlik" },
  { term: "make ends meet", en: "to have just enough money to pay for necessities", uz: "zo'rg'a kun kechirmoq" },
  { term: "live beyond one's means", en: "to spend more money than one earns", uz: "imkoniyatidan ortiqcha sarflamoq" },
  { term: "nest egg", en: "a sum of money saved for the future", uz: "kelajak uchun yig'ib qo'yilgan pul" },
  { term: "get by", en: "to manage with a limited amount of money", uz: "amal-taqal kun kechirmoq" },
  { term: "broke", en: "having no money", uz: "puli yo'q / bankrot" },
  { term: "wealthy", en: "having a great deal of money, resources, or assets", uz: "boy / badavlat" },
  { term: "tighten one's belt", en: "to spend less money than usual", uz: "tejamkorlik qilmoq" },
  { term: "impulse buy", en: "buying something suddenly without planning", uz: "o'ylamasdan sotib olish" },
  { term: "window shopping", en: "looking at goods in shop windows without intending to buy", uz: "do'kon oynalariga qarab yurish" },
  { term: "bargain hunting", en: "looking for goods that are being sold at a lower price", uz: "arzorroq narsa qidirish" },
  { term: "shop around", en: "to compare the price and quality in different shops", uz: "narxlarni solishtirib chiqmoq" },
  { term: "value for money", en: "something that is worth the money spent on it", uz: "puliga arziydigan narsa" },
  { term: "brand loyalty", en: "the tendency of consumers to continue buying the same brand", uz: "brendga sodiqlik" },
  { term: "consumer awareness", en: "knowledge of a consumer about their rights and products", uz: "iste'molchi xabardorligi" },
  { term: "ethical consumption", en: "buying products made without harming people or environment", uz: "axloqiy iste'mol" },
  { term: "e-commerce", en: "commercial transactions conducted electronically on the internet", uz: "elektron tijorat" },
  { term: "retail therapy", en: "shopping to make oneself feel happier", uz: "xarid terapiyasi" },
  { term: "shopping spree", en: "a short period of time when you buy a lot of things", uz: "ko'p narsa sotib olish davri" },
  { term: "throwaway society", en: "a society where disposable products are common", uz: "chiqindiga boy jamiyat" },
  { term: "knock-off", en: "a cheap and inferior copy of a well-known product", uz: "arzon nusxa (feyk)" },
  { term: "good deal", en: "a product or service sold at a very favorable price", uz: "foydali kelishuv" },
  { term: "rip-off", en: "something that is much more expensive than it should be", uz: "haddan tashqari qimmat" },
  { term: "overspend", en: "to spend more money than is planned or available", uz: "keragidan ortiq sarflamoq" },
  { term: "money-back guarantee", en: "a promise to refund money if a customer is not satisfied", uz: "pulni qaytarish kafolati" },
  { term: "refund", en: "an amount of money that is given back to you", uz: "pulni qaytarish (refand)" },
  { term: "income inequality", en: "the unequal distribution of income across an economy", uz: "daromadlar tengsizligi" },
  { term: "poverty line", en: "the estimated minimum level of income needed for life necessities", uz: "kambag'allik chegarasi" },
  { term: "wealth gap", en: "the difference in assets and income between groups in society", uz: "boylik tafovuti" },
  { term: "social mobility", en: "the movement between different layers of society", uz: "ijtimoiy mobillik" },
  { term: "underprivileged", en: "having less money and fewer opportunities than most people", uz: "kam ta'minlangan" },
  { term: "affluent", en: "having a great deal of money; wealthy", uz: "badavlat / boy" },
  { term: "minimum wage", en: "the lowest wage permitted by law or special agreement", uz: "eng kam ish haqi" }
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
