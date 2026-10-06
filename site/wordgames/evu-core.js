/* EVU yadrosi — DOMsiz o'yin mantig'i (savol yasash, derange, clash,
   progress, qatlam qulfi). Brauzerda window.EVU, nodeda module.exports.
   Testlar: node --test evu/evu-core.test.mjs */
(function (root) {
  const PASS = 80;
  const LAYERS = [
    { n: 1, key: "tani",     name: "Tani",     choice: true  },
    { n: 2, key: "mano",     name: "Ma‘no",    choice: true  },
    { n: 3, key: "eshit",    name: "Eshit",    choice: true  },
    { n: 4, key: "imlo",     name: "Imlo",     choice: false },
    { n: 5, key: "kontekst", name: "Kontekst", choice: true  },
    { n: 6, key: "yoz",      name: "Yoz",      choice: false },
  ];

  function shuffle(a, rng = Math.random) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* Ikki jamoa bitta ekranga qaraydi: birorta variant ikkala tomonda bir
     xil o'rinda qolmasin (So'z poygasi saboqi). */
  function derange(a, rng = Math.random) {
    if (a.length < 2) return a.slice();
    for (let t = 0; t < 60; t++) {
      const b = shuffle(a, rng);
      if (b.every((x, k) => x !== a[k])) return b;
    }
    return a.slice(1).concat(a[0]);
  }

  /* Ma'nosi ustma-ust tushadigan so'zlar bir savolga tushmasin — aks holda
     ikkala javob ham to'g'ri ko'rinadi. */
  function clashes(unit, a, b) {
    if (a.uz === b.uz) return true;
    return (unit.clash || []).some(([x, y]) =>
      (x === a.id && y === b.id) || (x === b.id && y === a.id));
  }

  function askable(unit, layer) {
    return layer === 5 ? unit.words.filter(w => w.ex) : unit.words;
  }

  /* Chalg'ituvchilar avval o'sha unitdan (qiyinroq), yetmasa pool'dan. */
  function pickDistractors(unit, w, pool, rng) {
    const own = shuffle(unit.words.filter(x => x.id !== w.id), rng);
    const extra = shuffle(pool.filter(x => x.id !== w.id), rng);
    const out = [];
    for (const c of own.concat(extra)) {
      if (out.length === 3) break;
      if (clashes(unit, w, c) || out.some(o => o.id === c.id || clashes(unit, o, c))) continue;
      out.push(c);
    }
    return out;
  }

  function available(unit, layer, pool = []) {
    const ask = askable(unit, layer);
    if (!ask.length) return false;
    if (!LAYERS[layer - 1].choice) return true;
    return ask.every(w => pickDistractors(unit, w, pool, Math.random).length === 3);
  }

  function questions(unit, layer, rng = Math.random, pool = []) {
    const L = LAYERS[layer - 1];
    return shuffle(askable(unit, layer), rng).map(w => {
      if (!L.choice) return { word: w, prompt: w, options: null, answer: w };
      const d = pickDistractors(unit, w, pool, rng);
      if (d.length < 3) return null;
      return { word: w, prompt: w, options: shuffle([w].concat(d), rng), answer: w };
    }).filter(Boolean);
  }

  const norm = s => String(s).trim().toLowerCase()
    .replace(/[‘’ʼ`]/g, "'").replace(/\s+/g, " ");

  function checkTyped(input, w) {
    const v = norm(input);
    return [w.en].concat(w.alt || []).some(x => norm(x) === v);
  }

  /* localStorage Telegram ichida / private rejimda xato berishi mumkin —
     o'yin baribir ishlaydi, faqat progress saqlanmaydi. */
  const progress = {
    key: (b, u) => "evu:" + b + ":" + u,
    get(b, u) {
      try { return JSON.parse(localStorage.getItem(this.key(b, u))) || {}; }
      catch (e) { return {}; }
    },
    set(b, u, layer, pct) {
      try {
        const p = this.get(b, u);
        if (!(p[layer] >= pct)) {
          p[layer] = pct;
          localStorage.setItem(this.key(b, u), JSON.stringify(p));
        }
      } catch (e) { /* saqlanmaydi */ }
    },
  };

  /* Yulduzli taymer: tezlik BALL beradi, qatlamni ochish emas (80% qoidasi
     faqat to'g'ri javoblar bo'yicha). Eng yaxshi yulduz soni progress ichida
     "s<qatlam>" kaliti bilan saqlanadi — foizga tegmaydi. */
  const stars = frac => frac > 2 / 3 ? 3 : frac > 1 / 3 ? 2 : frac > 0 ? 1 : 0;
  const timerSec = layer => (layer === 4 || layer === 6) ? 30 : 15;
  progress.getStars = function (b, u, layer) { return this.get(b, u)["s" + layer] || 0; };
  progress.setStars = function (b, u, layer, n) {
    try {
      const p = this.get(b, u);
      if (!((p["s" + layer] || 0) >= n)) {
        p["s" + layer] = n;
        localStorage.setItem(this.key(b, u), JSON.stringify(p));
      }
    } catch (e) { /* saqlanmaydi */ }
  };

  const unlocked = (p, layer) => layer === 1 || (p[layer - 1] || 0) >= PASS;

  const EVU = { PASS, LAYERS, shuffle, derange, questions, available,
                checkTyped, progress, unlocked, stars, timerSec };
  if (typeof module !== "undefined" && module.exports) module.exports = EVU;
  else root.EVU = EVU;
})(typeof window !== "undefined" ? window : globalThis);
