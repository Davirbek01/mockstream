// idiom-clips.js — the Learn section's fifth category: 301 short vertical
// clips of idioms, proverbs and phrasal verbs as they are actually spoken in
// film and TV.
//
// The clips and their posters already live on R2 (iboralar.sozlar.com), were
// rendered 9:16 at 1080x1920 and are branded mock-stream.com, so nothing is
// copied here — the page plays them where they are. The catalogue ships with
// the site (site/idiom-catalog.json, 44 KB) rather than being fetched from
// that bucket: same origin, no CORS, and it versions with the deploy.
//
// This file renders its own cards instead of going through _renderLearnGrid.
// That function is woven through the other four categories — levels, view
// counts, grid/list modes, per-category key rules — and a clip has none of
// that. It borrows the overlay chrome (title, count, search box) and nothing
// else, which keeps the change inside landing-v3.html down to one category
// entry and two delegation branches.
//
// ACCESS: the first FREE_PER_LABEL of each label are open; the rest ask for
// premium. ⚠️ That gate is advisory, not enforced — the clips are public
// objects on R2 and anyone reading devtools can fetch one directly. Making it
// real would mean the treatment the mock PDFs got (close the public route,
// hand out signed URLs), but that same bucket also serves sozlar.com's own
// idioms page, so closing it would break that site. The gate is here to point
// people at the subscription, not to stop a determined download.
(function () {
  var BASE = 'https://iboralar.sozlar.com/v';
  var CATALOG = '/idiom-catalog.json';
  var FREE_PER_LABEL = 10;

  var items = null;        // [{u,l,m,s,f,free,i}]
  var loading = null;
  var playIdx = -1;
  var playList = [];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function clipUrl(f) { return BASE + '/clips/' + encodeURIComponent(f); }
  function posterUrl(f) {
    return BASE + '/posters/' + encodeURIComponent(f.replace(/\.mp4$/i, '.jpg'));
  }

  async function load() {
    if (items) return items;
    if (loading) return loading;
    loading = (async function () {
      var r = await fetch(CATALOG + '?v=1', { cache: 'no-store' });
      var raw = r.ok ? await r.json() : [];
      // Free picks are the first N of each label IN CATALOGUE ORDER, so the
      // same clips are free for everyone and stay free as the set grows.
      var seen = {};
      items = raw.map(function (x, i) {
        var n = (seen[x.l] = (seen[x.l] || 0) + 1);
        return { u: x.u, l: x.l, m: x.m, s: x.s, f: x.f,
                 free: n <= FREE_PER_LABEL, i: i };
      });
      return items;
    })();
    return loading;
  }

  // ── entitlement ───────────────────────────────────────────────────────────
  // Same signals the rest of the page uses. Deliberately read at click time,
  // not cached: a student can unlock premium in another tab mid-session.
  function entitled() {
    try {
      if (sessionStorage.getItem('vipPremiumAi') === 'true') return true;
    } catch (_e) {}
    try {
      var t = localStorage.getItem('ms_vip_tier');
      if (t === 'premium' || t === 'ultra') return true;
      if (localStorage.getItem('ms_admin_email')) return true;
    } catch (_e) {}
    return false;
  }

  function style() {
    if (document.getElementById('idc-style')) return;
    var s = document.createElement('style');
    s.id = 'idc-style';
    s.textContent = [
      '.idc-card{position:relative;border:1px solid #e2e8f0;border-radius:14px;',
      'overflow:hidden;background:#fff;cursor:pointer;display:flex;',
      'flex-direction:column;transition:transform .15s,box-shadow .15s;}',
      '.idc-card:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(15,23,42,.12);}',
      // 9:16 so the poster is never letterboxed inside the card.
      '.idc-thumb{position:relative;aspect-ratio:9/16;background:#0f172a;overflow:hidden;}',
      '.idc-thumb img{width:100%;height:100%;object-fit:cover;display:block;}',
      '.idc-badge{position:absolute;top:8px;left:8px;padding:3px 8px;border-radius:999px;',
      'font-size:10px;font-weight:800;letter-spacing:.04em;color:#fff;background:rgba(15,23,42,.72);}',
      '.idc-lock{position:absolute;inset:0;display:flex;align-items:center;',
      'justify-content:center;flex-direction:column;gap:6px;color:#fff;font-weight:700;',
      'font-size:12px;background:rgba(15,23,42,.55);backdrop-filter:blur(3px);}',
      '.idc-lock span{font-size:22px;}',
      '.idc-meta{padding:9px 11px 11px;}',
      '.idc-unit{font-weight:800;font-size:14px;color:#0f172a;line-height:1.3;}',
      '.idc-src{font-size:11.5px;color:#64748b;margin-top:3px;}',
      // The player sits above the Learn overlay (z-index 100005). Anything
      // lower opens behind it and looks like a dead click.
      '.idc-player{position:fixed;inset:0;z-index:100030;background:rgba(2,6,23,.94);',
      'display:none;align-items:center;justify-content:center;}',
      '.idc-player.open{display:flex;}',
      '.idc-stage{position:relative;height:min(92vh,980px);aspect-ratio:9/16;',
      'max-width:94vw;border-radius:16px;overflow:hidden;background:#000;}',
      '.idc-stage video{width:100%;height:100%;object-fit:contain;background:#000;display:block;}',
      '.idc-info{position:absolute;left:0;right:0;bottom:0;padding:16px 16px 18px;',
      'color:#fff;background:linear-gradient(transparent,rgba(2,6,23,.86) 42%);}',
      '.idc-info b{display:block;font-size:19px;line-height:1.25;}',
      '.idc-info .m{font-size:13.5px;opacity:.92;margin-top:5px;line-height:1.45;}',
      '.idc-info .s{font-size:11.5px;opacity:.72;margin-top:6px;}',
      '.idc-x{position:absolute;top:10px;right:10px;z-index:3;width:38px;height:38px;',
      'border:0;border-radius:50%;background:rgba(2,6,23,.6);color:#fff;font-size:19px;',
      'cursor:pointer;line-height:1;}',
      '.idc-nav{position:absolute;right:-56px;display:flex;flex-direction:column;gap:10px;}',
      '.idc-nav button{width:44px;height:44px;border:0;border-radius:50%;cursor:pointer;',
      'background:rgba(255,255,255,.14);color:#fff;font-size:18px;}',
      '.idc-nav button:disabled{opacity:.3;cursor:default;}',
      '@media (max-width:760px){.idc-nav{display:none;}}',
      '.idc-count{position:absolute;top:14px;left:14px;z-index:3;color:#fff;',
      'font-size:12px;font-weight:700;background:rgba(2,6,23,.55);padding:4px 10px;',
      'border-radius:999px;}'
    ].join('');
    document.head.appendChild(s);
  }

  function cardHtml(it) {
    var lock = it.free ? '' :
      '<div class="idc-lock"><span>🔒</span>Premium</div>';
    return '<article class="idc-card" data-i="' + it.i + '">'
      + '<div class="idc-thumb">'
      + '<img loading="lazy" src="' + esc(posterUrl(it.f)) + '" alt="">'
      + '<span class="idc-badge">' + esc(it.l) + '</span>' + lock
      + '</div><div class="idc-meta"><div class="idc-unit">' + esc(it.u) + '</div>'
      + '<div class="idc-src">' + esc(it.s) + '</div></div></article>';
  }

  function render(list) {
    var grid = document.getElementById('learnGrid');
    var empty = document.getElementById('learnEmpty');
    var count = document.getElementById('learnCount');
    if (count) count.textContent = String(list.length);
    if (!list.length) {
      grid.innerHTML = '';
      if (empty) empty.style.display = '';
      return;
    }
    if (empty) empty.style.display = 'none';
    grid.innerHTML = list.map(cardHtml).join('');
    playList = list;
  }

  // ── player ────────────────────────────────────────────────────────────────
  function stage() {
    var el = document.getElementById('idcPlayer');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'idcPlayer';
    el.className = 'idc-player';
    el.innerHTML =
      '<div class="idc-stage">'
      + '<span class="idc-count" id="idcCount"></span>'
      + '<button class="idc-x" id="idcClose" aria-label="Close">✕</button>'
      + '<video id="idcVideo" playsinline controls preload="metadata"></video>'
      + '<div class="idc-info" id="idcInfo"></div>'
      + '<div class="idc-nav"><button id="idcPrev" aria-label="Previous">▲</button>'
      + '<button id="idcNext" aria-label="Next">▼</button></div>'
      + '</div>';
    document.body.appendChild(el);
    el.addEventListener('click', function (e) {
      if (e.target === el) close();           // backdrop
    });
    el.querySelector('#idcClose').addEventListener('click', close);
    el.querySelector('#idcPrev').addEventListener('click', function () { step(-1); });
    el.querySelector('#idcNext').addEventListener('click', function () { step(1); });

    // Swipe up/down — the gesture people already use on Shorts and Reels.
    var y0 = null;
    var st = el.querySelector('.idc-stage');
    st.addEventListener('touchstart', function (e) {
      y0 = e.touches && e.touches.length === 1 ? e.touches[0].clientY : null;
    }, { passive: true });
    st.addEventListener('touchend', function (e) {
      if (y0 == null) return;
      var y1 = (e.changedTouches && e.changedTouches[0] || {}).clientY;
      var d = y0 - y1;
      y0 = null;
      if (Math.abs(d) > 60) step(d > 0 ? 1 : -1);
    }, { passive: true });
    return el;
  }

  function close() {
    var el = document.getElementById('idcPlayer');
    if (!el) return;
    var v = document.getElementById('idcVideo');
    try { v.pause(); v.removeAttribute('src'); v.load(); } catch (_e) {}
    el.classList.remove('open');
  }

  function upsell() {
    close();
    var b = document.getElementById('topbarSubscribeBtn');
    if (b) b.click();
  }

  function step(d) {
    var n = playIdx + d;
    // Walk past anything locked rather than dead-ending on it.
    while (n >= 0 && n < playList.length && !playList[n].free && !entitled()) n += d;
    if (n < 0 || n >= playList.length) return;
    play(n);
  }

  function play(n) {
    var it = playList[n];
    if (!it) return;
    if (!it.free && !entitled()) { upsell(); return; }
    playIdx = n;
    style();
    var el = stage();
    var v = document.getElementById('idcVideo');
    v.poster = posterUrl(it.f);
    v.src = clipUrl(it.f);
    document.getElementById('idcInfo').innerHTML =
      '<b>' + esc(it.u) + '</b><div class="m">' + esc(it.m) + '</div>'
      + '<div class="s">' + esc(it.s) + '</div>';
    document.getElementById('idcCount').textContent = (n + 1) + ' / ' + playList.length;
    document.getElementById('idcPrev').disabled = n <= 0;
    document.getElementById('idcNext').disabled = n >= playList.length - 1;
    el.classList.add('open');
    v.play().catch(function () {});   // a blocked autoplay is not an error
  }

  document.addEventListener('keydown', function (e) {
    var el = document.getElementById('idcPlayer');
    if (!el || !el.classList.contains('open')) return;
    if (e.key === 'Escape') { close(); e.preventDefault(); }
    else if (e.key === 'ArrowDown') { step(1); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { step(-1); e.preventDefault(); }
  });

  document.addEventListener('click', function (e) {
    var c = e.target && e.target.closest ? e.target.closest('.idc-card') : null;
    if (!c) return;
    e.preventDefault();
    var i = Number(c.getAttribute('data-i'));
    var at = playList.findIndex(function (x) { return x.i === i; });
    if (at === -1) return;
    var it = playList[at];
    if (!it.free && !entitled()) { upsell(); return; }
    play(at);
  }, true);

  window.IdiomClips = {
    // Mirrors openLearningCategory's chrome so the overlay looks the same,
    // then renders clips instead of calling _renderLearnGrid.
    open: async function (opts) {
      style();
      var ti = document.getElementById('learnTitleIcon');
      var tt = document.getElementById('learnTitleText');
      if (ti) ti.textContent = '🎬';
      if (tt) tt.textContent = 'Idiom Clips';
      var s = document.getElementById('learnSearch');
      if (s) s.value = '';
      var grid = document.getElementById('learnGrid');
      if (grid) grid.innerHTML = '';
      var overlay = document.getElementById('learnPicker');
      overlay.classList.add('learn-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (!(opts && opts.fromRestore)) {
        try { history.pushState({ picker: 'learn', cat: 'idioms' }, ''); } catch (_e) {}
      }
      render(await load());
    },
    filter: async function (q) {
      var all = await load();
      q = (q || '').toLowerCase().trim();
      if (!q) { render(all); return; }
      render(all.filter(function (x) {
        return (x.u + ' ' + x.m + ' ' + x.s + ' ' + x.l).toLowerCase().indexOf(q) !== -1;
      }));
    },
    close: close
  };
})();
