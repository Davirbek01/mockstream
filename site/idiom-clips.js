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
// That function is woven through the other four categories — levels, grid/list
// modes, per-category key rules — and a clip has none of that. It borrows the
// overlay chrome (title, count, search box) and nothing else, which keeps the
// change inside landing-v3.html down to one category entry and two delegation
// branches.
//
// ACCESS: open to everyone (FREE_FOR_ALL). The per-label gate below is kept
// intact but switched off — if usage grows enough to justify putting clips
// behind the subscription, flip the flag back and nothing else changes.
// ⚠️ The gate was never enforceable anyway: the clips are public objects on R2
// and anyone reading devtools can fetch one directly. Making it real would
// mean the treatment the mock PDFs got (close the public route, hand out
// signed URLs), but that same bucket also serves sozlar.com's own idioms page.
//
// STATS: views and likes both key on the clip's FILE NAME minus .mp4 — not on
// the idiom text, because 12 of the 301 idioms have two clips each and would
// otherwise share one counter. Views go through the same learn_views table and
// learn_view_bump RPC the other four categories use ('idiom' kind added
// 2026-10-05, with no mock_tests lookup since the catalogue is a JSON file).
// Likes live in learn_likes, are per account, and need a signed-in user.
(function () {
  var BASE = 'https://iboralar.sozlar.com/v';
  var CATALOG = '/idiom-catalog.json';
  var SB = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
  var FREE_PER_LABEL = 10;
  var FREE_FOR_ALL = true;   // flip to false to re-arm the premium gate

  var items = null;        // [{u,l,m,s,f,free,i,k}]
  var loading = null;
  var playIdx = -1;
  var playList = [];
  var views = {};          // key -> all-time views
  var likeCounts = {};     // key -> like total
  var myLikes = {};        // key -> true, for the signed-in account only
  var cmtCounts = {};      // key -> number of comments
  var likedOnly = false;
  var statsOnce = false;
  var fromPop = false;     // close() was reached through popstate

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function clipUrl(f) { return BASE + '/clips/' + encodeURIComponent(f); }
  // ⚠️ The render pipeline STRIPS ' , and & from poster names while the clip
  // keeps them, so a straight .mp4 -> .jpg swap missed 18 of the 301 and those
  // cards showed a black rectangle. Checked against R2 on 2026-10-05: 283/301
  // without this rule, 301/301 with it. ("Lilo & Stitch" becomes "Lilo  Stitch"
  // — the & goes but its spaces stay, so do not collapse whitespace here.)
  function posterUrl(f) {
    return BASE + '/posters/'
      + encodeURIComponent(f.replace(/\.mp4$/i, '').replace(/[',&]/g, '') + '.jpg');
  }

  async function load() {
    if (items) return items;
    if (loading) return loading;
    loading = (async function () {
      // Cached on purpose: the landing page fetches this at idle just to fill
      // the tool card's count, so no-store would re-download 44 KB on every
      // visit. ⚠️ Adding clips means bumping the ?v= below — Pages ignores
      // _headers, so the query string is the only cache key that moves.
      var r = await fetch(CATALOG + '?v=1');
      var raw = r.ok ? await r.json() : [];
      // Free picks are the first N of each label IN CATALOGUE ORDER, so the
      // same clips are free for everyone and stay free as the set grows.
      // Inert while FREE_FOR_ALL is on, but computed either way so flipping
      // the flag needs no reload.
      var seen = {};
      items = raw.map(function (x, i) {
        var n = (seen[x.l] = (seen[x.l] || 0) + 1);
        return { u: x.u, l: x.l, m: x.m, s: x.s, f: x.f,
                 k: String(x.f).replace(/\.mp4$/i, ''),
                 free: n <= FREE_PER_LABEL, i: i };
      });
      return items;
    })();
    return loading;
  }

  function locked(it) { return !FREE_FOR_ALL && !it.free && !entitled(); }

  // ── identity ──────────────────────────────────────────────────────────────
  // Read at click time, not cached: premium can be unlocked in another tab.
  function currentEmail() {
    var em = '';
    try {
      var a = window.MockStream && window.MockStream.auth;
      var u = a && a.getCurrentUser ? a.getCurrentUser() : null;
      if (u && u.email) em = u.email;
    } catch (_e) {}
    if (!em) {
      try {
        var s = JSON.parse(localStorage.getItem('ms_auth_session') || 'null');
        var su = s && (s.user || (s.currentSession && s.currentSession.user));
        if (su && su.email) em = su.email;
      } catch (_e) {}
    }
    return String(em || '').trim().toLowerCase();
  }

  // The signed-in user's Supabase JWT. learn_likes is RLS'd to auth.uid(), so
  // the anon key cannot read or write it — a like needs this token or nothing.
  async function jwt() {
    try {
      var a = window.MockStream && window.MockStream.auth;
      var c = a && a.getClient ? a.getClient() : null;
      if (!c || !c.auth || !c.auth.getSession) return '';
      var s = await c.auth.getSession();
      return (s && s.data && s.data.session && s.data.session.access_token) || '';
    } catch (_e) { return ''; }
  }

  function entitled() {
    // A VIP code unlocks the session it was typed into. sessionStorage dies
    // with the tab, so this one needs no owner check.
    try {
      if (sessionStorage.getItem('vipPremiumAi') === 'true') return true;
    } catch (_e) {}
    // ms_vip_tier / ms_vip_email / ms_admin_email are per BROWSER and survive
    // sign-out, so they only count for whoever is signed in RIGHT NOW. Caught
    // in testing: a browser where an admin had signed in days earlier played
    // every locked clip. The subscribe button hit the same trap on 2026-09-12
    // and was fixed the same way — only a live session counts.
    var me = currentEmail();
    if (!me) return false;
    try {
      var tier = localStorage.getItem('ms_vip_tier');
      var vipEmail = String(localStorage.getItem('ms_vip_email') || '').trim().toLowerCase();
      if ((tier === 'premium' || tier === 'ultra') && vipEmail && vipEmail === me) return true;
      var adminEmail = String(localStorage.getItem('ms_admin_email') || '').trim().toLowerCase();
      if (adminEmail && adminEmail === me) return true;
    } catch (_e) {}
    return false;
  }

  // ── stats ─────────────────────────────────────────────────────────────────
  function rpc(fn, body, token) {
    var t = token || SB_KEY;
    return fetch(SB + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: { apikey: SB_KEY, Authorization: 'Bearer ' + t,
                 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    }).then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  function nice(n) {
    n = Number(n) || 0;
    if (n >= 1000000) return (n / 1000000).toFixed(n >= 10000000 ? 0 : 1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k';
    return String(n);
  }

  // Totals are public (learn_like_counts is security definer and returns only
  // counts, never who liked what); the "mine" list needs the user's token.
  async function loadStats(force) {
    if (statsOnce && !force) return;
    statsOnce = true;
    var tk = await jwt();
    var r = await Promise.all([
      rpc('learn_view_counts', { p_kind: 'idiom' }),
      rpc('learn_like_counts', { p_kind: 'idiom' }),
      rpc('learn_comment_counts', { p_kind: 'idiom' }),
      tk ? rpc('learn_my_likes', { p_kind: 'idiom' }, tk) : Promise.resolve(null)
    ]);
    if (r[0] && typeof r[0] === 'object') views = r[0];
    if (r[1] && typeof r[1] === 'object') likeCounts = r[1];
    if (r[2] && typeof r[2] === 'object') cmtCounts = r[2];
    myLikes = {};
    if (Array.isArray(r[3])) r[3].forEach(function (k) { myLikes[String(k)] = true; });
  }

  // Same once-per-key-per-day guard as flashcards.html / test.html, sharing
  // the same localStorage record so one reader cannot inflate a count.
  function bumpView(it) {
    try {
      var d = new Date();
      var today = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
      var seen = {};
      try { seen = JSON.parse(localStorage.getItem('_learnViewsSeen') || '{}') || {}; } catch (_e) {}
      if (seen.date !== today) seen = { date: today, keys: [] };
      var tag = 'idiom:' + it.k;
      if (seen.keys.indexOf(tag) !== -1) return;
      seen.keys.push(tag);
      try { localStorage.setItem('_learnViewsSeen', JSON.stringify(seen)); } catch (_e) {}
      views[it.k] = (Number(views[it.k]) || 0) + 1;
      paintStats(it.k);
      fetch(SB + '/rest/v1/rpc/learn_view_bump', {
        method: 'POST',
        headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY,
                   'Content-Type': 'application/json' },
        body: JSON.stringify({ p_kind: 'idiom', p_key: it.k }),
        keepalive: true
      }).catch(function () {});
    } catch (_e) {}
  }

  // Repaint one clip's numbers wherever they appear (its card, the player)
  // instead of re-rendering the grid — a like must not reshuffle the list.
  function paintStats(key) {
    var v = nice(views[key]), l = nice(likeCounts[key]), mine = !!myLikes[key];
    // Matched by reading the attribute rather than through an attribute
    // selector: a key is a file name, so it carries spaces, commas, colons
    // and apostrophes that would all need escaping inside the selector.
    document.querySelectorAll('[data-sk]').forEach(function (el) {
      if (el.getAttribute('data-sk') !== key) return;
      var vv = el.querySelector('.idc-v');
      var lv = el.querySelector('.idc-l');
      var cv = el.querySelector('.idc-c');
      if (vv) vv.textContent = v;
      if (lv) lv.textContent = l;
      if (cv) cv.textContent = nice(cmtCounts[key]);
      var b = el.querySelector('[data-like]');
      if (b) {
        b.classList.toggle('on', mine);
        b.setAttribute('aria-pressed', mine ? 'true' : 'false');
        b.title = mine ? 'Liked' : 'Like';
      }
    });
  }

  async function toggleLike(key) {
    var tk = await jwt();
    if (!tk) { signInNudge(); return; }
    var was = !!myLikes[key];
    // Optimistic, then corrected by the server's own answer.
    myLikes[key] = !was;
    likeCounts[key] = Math.max(0, (Number(likeCounts[key]) || 0) + (was ? -1 : 1));
    paintStats(key);
    var r = await rpc('learn_like_toggle', { p_kind: 'idiom', p_key: key }, tk);
    if (r === true || r === false) {
      if (r !== myLikes[key]) {
        likeCounts[key] = Math.max(0, (Number(likeCounts[key]) || 0) + (r ? 1 : -1));
        myLikes[key] = r;
      }
      if (!r) delete myLikes[key];
      paintStats(key);
    }
    if (likedOnly) renderCurrent();
  }

  function signInNudge() {
    var el = document.getElementById('idcToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'idcToast';
      el.className = 'idc-toast';
      document.body.appendChild(el);
    }
    el.textContent = 'Sign in to save your liked clips.';
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('show'); }, 2600);
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
      // The in-grid preview. One of these exists at a time and is moved from
      // card to card. pointer-events:none so the tap still reaches the card
      // and opens the full player. It is 9:16 like the thumb, so cover is an
      // exact fit — unlike the poster, which is a 560x286 crop.
      '.idc-prev{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;',
      'background:#0f172a;display:block;opacity:0;transition:opacity .25s;',
      'pointer-events:none;z-index:1;}',
      '.idc-prev.on{opacity:1;}',
      // Tap-to-unmute, shown only while that card is the one playing. A web
      // page cannot see the phone's volume keys — there is no API for it,
      // which is why every web feed uses a speaker button instead.
      '.idc-sound{position:absolute;top:8px;right:8px;z-index:3;width:30px;height:30px;',
      'border:0;border-radius:50%;background:rgba(2,6,23,.6);color:#fff;cursor:pointer;',
      'display:flex;align-items:center;justify-content:center;padding:0;',
      '-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);}',
      '.idc-sound:hover{background:rgba(2,6,23,.82);}',
      '.idc-badge{position:absolute;top:8px;left:8px;z-index:2;padding:3px 8px;border-radius:999px;',
      'font-size:10px;font-weight:800;letter-spacing:.04em;color:#fff;background:rgba(15,23,42,.72);}',
      '.idc-lock{position:absolute;inset:0;z-index:2;display:flex;align-items:center;',
      'justify-content:center;flex-direction:column;gap:6px;color:#fff;font-weight:700;',
      'font-size:12px;background:rgba(15,23,42,.55);backdrop-filter:blur(3px);}',
      '.idc-lock span{font-size:22px;}',
      '.idc-meta{padding:9px 11px 11px;}',
      '.idc-unit{font-weight:800;font-size:14px;color:#0f172a;line-height:1.3;}',
      '.idc-src{font-size:11.5px;color:#64748b;margin-top:3px;}',
      // Views sit on the poster (bottom-left, like the article cards' eye),
      // the like button opposite them so a tap on it never opens the clip.
      '.idc-stat{position:absolute;left:8px;bottom:8px;z-index:2;display:inline-flex;align-items:center;',
      'gap:4px;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:700;color:#fff;',
      'background:rgba(2,6,23,.6);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);}',
      // Comment and like sit together bottom-right; the group is one element
      // so neither has to know how wide the other is.
      '.idc-acts{position:absolute;right:8px;bottom:8px;z-index:2;display:flex;gap:6px;align-items:center;}',
      '.idc-like,.idc-cmt{display:inline-flex;align-items:center;',
      'gap:4px;padding:3px 9px;border:0;border-radius:999px;font-size:11px;font-weight:800;',
      'cursor:pointer;color:#fff;background:rgba(2,6,23,.6);line-height:1.5;',
      '-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);}',
      '.idc-like:hover,.idc-cmt:hover{background:rgba(2,6,23,.8);}',
      '.idc-like.on{background:#e11d48;}',
      '.idc-v,.idc-l,.idc-c{font-style:normal;}',
      // The player sits above the Learn overlay (z-index 100005). Anything
      // lower opens behind it and looks like a dead click.
      '.idc-player{position:fixed;inset:0;z-index:100030;background:rgba(2,6,23,.94);',
      'display:none;align-items:center;justify-content:center;}',
      '.idc-player.open{display:flex;}',
      // The frame carries the 9:16 box; the stage inside it does the clipping.
      // They are separate because the stage must hide the pane sliding in from
      // off-screen, and overflow:hidden on the element the arrows hang off
      // (right:-56px) clipped the arrows away too.
      '.idc-frame{position:relative;height:min(92vh,980px);aspect-ratio:9/16;max-width:94vw;}',
      '.idc-stage{position:absolute;inset:0;border-radius:16px;overflow:hidden;',
      'background:#000;}',
      // One pane per clip, stacked. Both are on screen during a swipe, which
      // is the whole point — see the player section below.
      '.idc-pane{position:absolute;inset:0;will-change:transform;}',
      '.idc-pane.idle{visibility:hidden;pointer-events:none;}',
      '.idc-pane.settle{transition:transform .34s cubic-bezier(.22,.61,.36,1);}',
      '.idc-pane video{width:100%;height:100%;object-fit:contain;background:#000;display:block;}',
      // padding-right clears the action rail, which sits over the video's
      // bottom-right corner, exactly where Shorts puts it. The arrows
      // ours are on the left because the ▲▼ arrows own the right side).
      // pointer-events:none so the video's own controls underneath stay
      // reachable; the caption has no interactive children of its own since
      // the stats moved to the rail. Its bottom is set from JS — see
      // placeChrome(), which keeps it off the control bar.
      '.idc-info{position:absolute;left:0;right:0;bottom:54px;pointer-events:none;',
      'padding:16px 78px 18px 16px;',
      'color:#fff;background:linear-gradient(transparent,rgba(2,6,23,.86) 42%);}',
      '.idc-info b{display:block;font-size:19px;line-height:1.25;}',
      '.idc-info .m{font-size:13.5px;opacity:.92;margin-top:5px;line-height:1.45;}',
      '.idc-info .s{font-size:11.5px;opacity:.72;margin-top:6px;}',
      // The player's like / comment / views, as a vertical rail instead of a
      // row under the caption. Same data-like / data-cmt hooks as the cards,
      // so one click delegation and one paintStats serve both.
      '.idc-rail{position:absolute;right:12px;bottom:14px;z-index:2;display:flex;',
      'flex-direction:column;align-items:center;gap:15px;}',
      '.idc-rail .it{display:flex;flex-direction:column;align-items:center;gap:3px;',
      'border:0;background:none;padding:0;color:#fff;cursor:pointer;font:inherit;}',
      '.idc-rail .st{cursor:default;}',
      '.idc-rail .ic{width:46px;height:46px;border-radius:50%;display:flex;',
      'align-items:center;justify-content:center;font-size:21px;line-height:1;',
      'background:rgba(2,6,23,.45);-webkit-backdrop-filter:blur(6px);',
      'backdrop-filter:blur(6px);transition:background .15s,transform .15s;}',
      '.idc-rail .it:hover .ic{background:rgba(2,6,23,.7);}',
      '.idc-rail .it:active .ic{transform:scale(.9);}',
      '.idc-rail .it.on .ic{background:#e11d48;}',
      '.idc-rail .n{font-size:11.5px;font-weight:800;',
      'text-shadow:0 1px 3px rgba(2,6,23,.65);}',
      '@media (max-width:420px){.idc-rail{gap:12px;bottom:10px;}',
      '.idc-rail .ic{width:42px;height:42px;font-size:19px;}}',
      '.idc-x{position:absolute;top:10px;right:10px;z-index:3;width:38px;height:38px;',
      'border:0;border-radius:50%;background:rgba(2,6,23,.6);color:#fff;font-size:19px;',
      'cursor:pointer;line-height:1;}',
      '.idc-nav{position:absolute;right:-56px;top:50%;transform:translateY(-50%);',
      'display:flex;flex-direction:column;gap:10px;}',
      '.idc-nav button{width:44px;height:44px;border:0;border-radius:50%;cursor:pointer;',
      'background:rgba(255,255,255,.14);color:#fff;font-size:18px;}',
      '.idc-nav button:hover:not(:disabled){background:rgba(255,255,255,.26);}',
      '.idc-nav button:disabled{opacity:.3;cursor:default;}',
      // Phone: the reel takes the whole screen. A 9:16 box centred on a
      // 94%-opaque backdrop left the picker grid glowing through above and
      // below it, which is not what a reel looks like. The arrows go (swipe
      // replaces them) and so does ✕ — the system Back closes the player, and
      // on a phone a close button is one more thing covering the clip. ✕ stays
      // on desktop, where there is no Back gesture over a modal.
      '@media (max-width:760px){',
      '.idc-player{background:#000;}',
      '.idc-frame{position:absolute;inset:0;height:auto;max-width:none;aspect-ratio:auto;}',
      '.idc-stage{border-radius:0;}',
      '.idc-nav,.idc-x{display:none;}',
      '.idc-info{padding-bottom:calc(18px + env(safe-area-inset-bottom));}',
      '.idc-rail{bottom:calc(14px + env(safe-area-inset-bottom));}',
      '.idc-count{top:calc(14px + env(safe-area-inset-top));}',
      '}',
      '.idc-count{position:absolute;top:14px;left:14px;z-index:3;color:#fff;',
      'font-size:12px;font-weight:700;background:rgba(2,6,23,.55);padding:4px 10px;',
      'border-radius:999px;}',
      // "Liked" toggle, dropped into the overlay header beside the search box
      // and removed again when another category opens.
      '#idcLikedBtn{border:1px solid #e2e8f0;background:#fff;color:#0f172a;',
      'border-radius:999px;padding:8px 13px;font-size:13px;font-weight:800;cursor:pointer;',
      'white-space:nowrap;}',
      '#idcLikedBtn.on{background:#e11d48;border-color:#e11d48;color:#fff;}',
      // Comment sheet. It is parented to the PLAYER while the player is open,
      // because on Android the player may be the fullscreen element and only
      // that element's own subtree is painted — a sheet on <body> would simply
      // not appear. z-index sits above the player (100030), below the toast.
      '.idc-cwrap{position:fixed;inset:0;z-index:100035;display:none;}',
      '.idc-cwrap.open{display:block;}',
      '.idc-cwrap .idc-bd{position:absolute;inset:0;background:rgba(2,6,23,.55);}',
      '.idc-sheet{position:absolute;left:0;right:0;bottom:0;margin:0 auto;max-width:560px;',
      'max-height:78%;display:flex;flex-direction:column;background:#fff;color:#0f172a;',
      'border-radius:18px 18px 0 0;box-shadow:0 -14px 40px rgba(2,6,23,.45);',
      'transform:translateY(100%);transition:transform .28s cubic-bezier(.22,.61,.36,1);}',
      '.idc-cwrap.in .idc-sheet{transform:translateY(0);}',
      '.idc-shead{display:flex;align-items:center;gap:9px;padding:14px 16px 10px;',
      'border-bottom:1px solid #eef2f7;}',
      '.idc-shead b{font-size:15px;}',
      '.idc-shead .n{font-size:12px;font-weight:800;color:#64748b;background:#f1f5f9;',
      'padding:2px 9px;border-radius:999px;}',
      '.idc-shead button{margin-left:auto;border:0;background:#f1f5f9;color:#0f172a;',
      'width:32px;height:32px;border-radius:50%;font-size:16px;cursor:pointer;line-height:1;}',
      '.idc-clist{overflow:auto;-webkit-overflow-scrolling:touch;padding:6px 16px 10px;',
      'flex:1 1 auto;min-height:90px;}',
      '.idc-crow{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #f1f5f9;}',
      '.idc-crow:last-child{border-bottom:0;}',
      '.idc-cav{flex:0 0 32px;width:32px;height:32px;border-radius:50%;display:flex;',
      'align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;}',
      '.idc-cmain{flex:1 1 auto;min-width:0;}',
      '.idc-cwho{font-size:12.5px;font-weight:800;color:#0f172a;}',
      '.idc-cwho i{font-style:normal;font-weight:600;color:#94a3b8;margin-left:6px;}',
      '.idc-cbody{font-size:14px;line-height:1.45;margin-top:2px;white-space:pre-wrap;',
      'word-break:break-word;}',
      '.idc-cdel{flex:0 0 auto;border:0;background:none;color:#cbd5e1;font-size:15px;',
      'cursor:pointer;padding:0 2px;line-height:1;}',
      '.idc-cdel:hover{color:#e11d48;}',
      '.idc-cempty{color:#94a3b8;font-size:13.5px;text-align:center;padding:26px 0;}',
      '.idc-cbox{border-top:1px solid #eef2f7;padding:10px 12px calc(12px + env(safe-area-inset-bottom));}',
      '.idc-cbox textarea{width:100%;box-sizing:border-box;border:1px solid #e2e8f0;',
      'border-radius:12px;padding:10px 12px;font:inherit;font-size:14px;resize:none;',
      'min-height:42px;max-height:120px;outline:none;background:#fff;color:#0f172a;}',
      '.idc-cbox textarea:focus{border-color:#6366f1;}',
      '.idc-crow2{display:flex;align-items:center;gap:10px;margin-top:8px;}',
      '.idc-cnum{font-size:11.5px;color:#94a3b8;}',
      '.idc-cerr{font-size:12px;color:#e11d48;font-weight:700;}',
      '.idc-csend{margin-left:auto;border:0;border-radius:999px;background:#6366f1;color:#fff;',
      'font-weight:800;font-size:13.5px;padding:9px 18px;cursor:pointer;}',
      '.idc-csend:disabled{opacity:.45;cursor:default;}',
      '.idc-csignin{color:#64748b;font-size:13.5px;text-align:center;padding:4px 0 6px;}',
      '.idc-toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%) translateY(14px);',
      'z-index:100040;background:#0f172a;color:#fff;padding:11px 18px;border-radius:999px;',
      'font-size:13px;font-weight:700;opacity:0;pointer-events:none;transition:.22s;',
      'box-shadow:0 12px 30px rgba(2,6,23,.4);}',
      '.idc-toast.show{opacity:1;transform:translateX(-50%) translateY(0);}'
    ].join('');
    document.head.appendChild(s);
  }

  var EYE = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"'
    + ' stroke-width="2.1"><path d="M1.6 12S5.3 5.4 12 5.4 22.4 12 22.4 12 18.7 18.6 12 18.6'
    + ' 1.6 12 1.6 12Z"/><circle cx="12" cy="12" r="3.1"/></svg>';
  function svgSpeech(px) {
    return '<svg viewBox="0 0 24 24" width="' + px + '" height="' + px + '" fill="none"'
      + ' stroke="currentColor" stroke-width="2.1" stroke-linejoin="round">'
      + '<path d="M21 11.6c0 3.8-4 6.9-9 6.9-.9 0-1.8-.1-2.6-.3L4 20.4l1.3-3.4C3.9 15.6 3 13.7'
      + ' 3 11.6c0-3.8 4-6.9 9-6.9s9 3.1 9 6.9Z"/></svg>';
  }
  function svgEye(px) {
    return '<svg viewBox="0 0 24 24" width="' + px + '" height="' + px + '" fill="none"'
      + ' stroke="currentColor" stroke-width="2.1"><path d="M1.6 12S5.3 5.4 12 5.4 22.4 12'
      + ' 22.4 12 18.7 18.6 12 18.6 1.6 12 1.6 12Z"/><circle cx="12" cy="12" r="3.1"/></svg>';
  }

  // Where the film picture sits inside the 1080x1920 template, measured from
  // frames pulled off R2 on 2026-10-05: it runs from 24.5% to ~56% of the video
  // height, the rest being the title card above and the meaning box below. The
  // rail is hung off the BOTTOM of that picture so the buttons sit beside the
  // footage instead of down on the letterbox black.
  var FILM_BOTTOM = 0.56;
  var CTRL_BAR = 54;        // the native <video controls> strip

  // The video is object-fit:contain, so on a screen taller than 9:16 it is
  // letterboxed and the stage's bottom edge is nowhere near the clip's. Both
  // the rail and the caption are therefore placed from the VIDEO's own box,
  // not the stage's.
  function placeChrome(p) {
    if (!p || !p.v || !p.rail) return;
    var bw = p.v.clientWidth, bh = p.v.clientHeight;
    if (!bw || !bh) return;
    var vw = p.v.videoWidth || 1080, vh = p.v.videoHeight || 1920;
    var sc = Math.min(bw / vw, bh / vh);
    var dh = vh * sc;                      // displayed video height
    var pad = Math.max(0, (bh - dh) / 2);  // one letterbox band
    // Caption: clear of the control bar, and never sitting on the black.
    var cap = Math.max(CTRL_BAR, Math.round(pad) + 6);
    p.info.style.bottom = cap + 'px';
    // Rail: bottom aligned with the bottom edge of the film picture.
    var rail = Math.round(bh - (pad + dh * FILM_BOTTOM));
    var rh = p.rail.firstChild ? p.rail.firstChild.offsetHeight : 200;
    rail = Math.max(cap + 10, Math.min(rail, bh - rh - 16));
    var r = p.rail.querySelector('.idc-rail');
    if (r) r.style.bottom = rail + 'px';
  }

  function placeAll() {
    panes.forEach(placeChrome);
  }

  // The player's rail. Mirrors statHtml's data hooks exactly, so the one click
  // delegation and the one paintStats keep serving both shapes.
  function railHtml(it) {
    var mine = !!myLikes[it.k];
    return '<div class="idc-rail" data-sk="' + esc(it.k) + '">'
      + '<button class="it' + (mine ? ' on' : '') + '" type="button" data-like="'
      + esc(it.k) + '" aria-pressed="' + (mine ? 'true' : 'false') + '" title="'
      + (mine ? 'Liked' : 'Like') + '"><span class="ic">♥</span>'
      + '<span class="n idc-l">' + nice(likeCounts[it.k]) + '</span></button>'
      + '<button class="it" type="button" data-cmt="' + esc(it.k) + '" title="Comments">'
      + '<span class="ic">' + svgSpeech(21) + '</span>'
      + '<span class="n idc-c">' + nice(cmtCounts[it.k]) + '</span></button>'
      + '<span class="it st" title="Views"><span class="ic">' + svgEye(21) + '</span>'
      + '<span class="n idc-v">' + nice(views[it.k]) + '</span></span>'
      + '</div>';
  }

  var SPEECH = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none"'
    + ' stroke="currentColor" stroke-width="2.1" stroke-linejoin="round">'
    + '<path d="M21 11.6c0 3.8-4 6.9-9 6.9-.9 0-1.8-.1-2.6-.3L4 20.4l1.3-3.4C3.9 15.6 3 13.7'
    + ' 3 11.6c0-3.8 4-6.9 9-6.9s9 3.1 9 6.9Z"/></svg>';

  function statHtml(it) {
    return '<span class="idc-stat">' + EYE + '<i class="idc-v">'
      + nice(views[it.k]) + '</i></span>'
      + '<span class="idc-acts">'
      + '<button class="idc-cmt" type="button" data-cmt="' + esc(it.k) + '"'
      + ' title="Comments">' + SPEECH + '<i class="idc-c">'
      + nice(cmtCounts[it.k]) + '</i></button>'
      + '<button class="idc-like' + (myLikes[it.k] ? ' on' : '') + '" type="button"'
      + ' data-like="' + esc(it.k) + '" aria-pressed="' + (myLikes[it.k] ? 'true' : 'false')
      + '" title="' + (myLikes[it.k] ? 'Liked' : 'Like') + '">♥'
      + '<i class="idc-l">' + nice(likeCounts[it.k]) + '</i></button>'
      + '</span>';
  }

  function cardHtml(it) {
    var lock = locked(it) ? '<div class="idc-lock"><span>🔒</span>Premium</div>' : '';
    return '<article class="idc-card" data-i="' + it.i + '" data-sk="' + esc(it.k) + '">'
      + '<div class="idc-thumb">'
      + '<img loading="lazy" src="' + esc(posterUrl(it.f)) + '" alt="">'
      + '<span class="idc-badge">' + esc(it.l) + '</span>' + lock + statHtml(it)
      + '</div><div class="idc-meta"><div class="idc-unit">' + esc(it.u) + '</div>'
      + '<div class="idc-src">' + esc(it.s) + '</div></div></article>';
  }

  function render(list) {
    var grid = document.getElementById('learnGrid');
    var empty = document.getElementById('learnEmpty');
    var count = document.getElementById('learnCount');
    if (count) count.textContent = String(list.length);
    playList = list;
    if (!list.length) {
      stopPreview();
      grid.innerHTML = '';
      if (empty) {
        empty.style.display = '';
        var msg = empty.querySelector('.learn-empty-msg');
        if (msg) {
          msg._idcOrig = msg._idcOrig || msg.textContent;
          msg.textContent = likedOnly
            ? 'No liked clips yet — tap ♥ on a clip to save it here.'
            : msg._idcOrig;
        }
      }
      return;
    }
    if (empty) empty.style.display = 'none';
    grid.innerHTML = list.map(cardHtml).join('');
    armPreviews();   // the old cards are gone; observe the new ones
  }

  // ── list order ────────────────────────────────────────────────────────────
  // Shuffled on every entry, so the first screen is not the same three shows
  // each time. The order is held for the session the overlay is open, so
  // search and the Liked filter do not reshuffle under the user.
  var order = null;
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var lastQuery = '';
  function current() {
    var list = order || [];
    var q = lastQuery;
    if (likedOnly) list = list.filter(function (x) { return !!myLikes[x.k]; });
    if (q) {
      list = list.filter(function (x) {
        return (x.u + ' ' + x.m + ' ' + x.s + ' ' + x.l).toLowerCase().indexOf(q) !== -1;
      });
    }
    return list;
  }
  function renderCurrent() { render(current()); }

  // ── in-grid preview ────────────────────────────────────────
  // The card the reader is looking at plays itself, muted, the way Instagram's
  // grid does. Tapping still opens the full player — this only removes the
  // first of the two taps it used to take to see anything move.
  //
  // ⚠️ THE COST IS REAL: these clips are ~19s at 1.1 Mbps, so five seconds of
  // preview is about 0.7 MB. Scrolling a 301-card grid could burn a phone's
  // data allowance, so: exactly ONE preview is ever live, it only starts after
  // the card has held focus for DWELL ms (so a fast scroll starts nothing),
  // and it is skipped entirely on a metered or slow connection.
  var DWELL = 380;
  // Sticky across the session, like Instagram's: unmute once and the clips you
  // scroll to afterwards keep the sound.
  var soundOn = false;
  try { soundOn = localStorage.getItem('ms_idc_sound') === '1'; } catch (_e) {}
  var SND = {
    on: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"'
      + ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
      + '<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/>'
      + '<path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
    off: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"'
      + ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
      + '<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m16 9 5 6"/><path d="m21 9-5 6"/></svg>'
  };
  var prevVid = null, prevCard = null, prevTimer = null, obs = null;
  var vis = new Map();      // card element -> how much of it is on screen

  function previewsAllowed() {
    try {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
      var c = navigator.connection;
      if (c && (c.saveData || /^(slow-2g|2g)$/.test(c.effectiveType || ''))) return false;
    } catch (_e) {}
    return true;
  }

  function pickerOpen() {
    var o = document.getElementById('learnPicker');
    return !!(o && o.classList.contains('learn-open'));
  }

  function soundBtn() {
    var b = document.getElementById('idcSound');
    if (!b) {
      b = document.createElement('button');
      b.id = 'idcSound';
      b.className = 'idc-sound';
      b.type = 'button';
      b.setAttribute('data-sound', '1');
    }
    b.innerHTML = soundOn ? SND.on : SND.off;
    b.title = soundOn ? 'Sound on' : 'Sound off';
    b.setAttribute('aria-label', b.title);
    return b;
  }

  function toggleSound() {
    soundOn = !soundOn;
    try { localStorage.setItem('ms_idc_sound', soundOn ? '1' : '0'); } catch (_e) {}
    soundBtn();
    if (!prevVid) return;
    prevVid.muted = !soundOn;
    // Turning it ON is a tap, so the browser lets the sound through; it can
    // still refuse, in which case fall back rather than killing playback.
    prevVid.play().catch(function () {
      prevVid.muted = true;
      prevVid.play().catch(function () {});
    });
  }

  function stopPreview() {
    clearTimeout(prevTimer);
    prevTimer = null;
    prevCard = null;
    var b = document.getElementById('idcSound');
    if (b && b.parentNode) b.parentNode.removeChild(b);
    if (!prevVid) return;
    try {
      prevVid.pause();
      prevVid.removeAttribute('src');
      prevVid.load();        // drop the stream rather than leave it buffering
    } catch (_e) {}
    if (prevVid.parentNode) prevVid.parentNode.removeChild(prevVid);
    prevVid.classList.remove('on');
  }

  function startPreview(card) {
    var i = Number(card.getAttribute('data-i'));
    var it = null;
    for (var n = 0; n < playList.length; n++) if (playList[n].i === i) { it = playList[n]; break; }
    if (!it || locked(it)) return;
    var thumb = card.querySelector('.idc-thumb');
    var img = thumb && thumb.querySelector('img');
    if (!thumb) return;
    if (!prevVid) {
      prevVid = document.createElement('video');
      prevVid.className = 'idc-prev';
      prevVid.muted = true;
      prevVid.loop = true;
      prevVid.playsInline = true;
      // The attributes matter as well as the properties: iOS only honours
      // muted autoplay when both are on the element itself.
      prevVid.setAttribute('muted', '');
      prevVid.setAttribute('playsinline', '');
      prevVid.setAttribute('disablepictureinpicture', '');
      prevVid.preload = 'auto';
      prevVid.addEventListener('playing', function () { prevVid.classList.add('on'); });
    }
    prevVid.classList.remove('on');
    prevVid.muted = !soundOn;
    prevVid.poster = posterUrl(it.f);
    // insert straight after the poster so the badge and counters stay on top
    thumb.insertBefore(prevVid, img ? img.nextSibling : thumb.firstChild);
    thumb.appendChild(soundBtn());
    prevVid.src = clipUrl(it.f);
    prevCard = card;
    prevVid.play().catch(function () {
      // Autoplay with sound needs more credit with the browser than a tap
      // always buys, so an unmuted start that is refused retries muted rather
      // than leaving a dead card. The preference itself is left alone.
      if (!prevVid.muted) {
        prevVid.muted = true;
        prevVid.play().catch(function () { stopPreview(); });
        return;
      }
      stopPreview();
    });
  }

  function schedule(card) {
    if (card === prevCard) return;
    clearTimeout(prevTimer);
    stopPreview();
    if (!card) return;
    prevCard = card;                 // claimed now so a repeat tick is a no-op
    prevTimer = setTimeout(function () {
      prevTimer = null;
      var c = prevCard;
      prevCard = null;
      if (c && pickerOpen() && !isOpen()) startPreview(c);
    }, DWELL);
  }

  // The card the eye is on: the most visible one, ties broken by whichever
  // sits closest to the middle of the screen.
  function pickFocus() {
    if (!pickerOpen() || isOpen()) { stopPreview(); return; }
    var best = null, bestScore = -1, mid = innerHeight / 2;
    vis.forEach(function (ratio, card) {
      if (ratio < 0.55 || !card.isConnected) return;
      var r = card.getBoundingClientRect();
      var score = ratio * 1000 - Math.abs((r.top + r.bottom) / 2 - mid);
      if (score > bestScore) { bestScore = score; best = card; }
    });
    schedule(best);
  }

  // Desktop has a dozen cards on screen at once, so "the one you are looking
  // at" is the one under the cursor; a phone shows one or two, so there it is
  // the one in the middle of the screen.
  function hoverMode() {
    try { return matchMedia('(hover: hover) and (pointer: fine)').matches; }
    catch (_e) { return false; }
  }

  function armPreviews() {
    if (!previewsAllowed()) return;
    stopPreview();
    vis.clear();
    if (hoverMode()) return;          // hover is handled by delegation below
    if (!obs) {
      obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) vis.set(e.target, e.intersectionRatio);
          else vis.delete(e.target);
        });
        pickFocus();
      }, { threshold: [0, 0.25, 0.55, 0.8, 1] });
    }
    obs.disconnect();
    document.querySelectorAll('#learnGrid .idc-card').forEach(function (c) { obs.observe(c); });
  }

  document.addEventListener('mouseover', function (e) {
    if (!hoverMode() || !previewsAllowed() || isOpen()) return;
    var c = e.target && e.target.closest ? e.target.closest('.idc-card') : null;
    if (c && c !== prevCard && pickerOpen()) schedule(c);
  });
  document.addEventListener('mouseout', function (e) {
    if (!hoverMode()) return;
    var c = e.target && e.target.closest ? e.target.closest('.idc-card') : null;
    if (c && !c.contains(e.relatedTarget)) stopPreview();
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopPreview();
  });

  // ── player ──────────────────────────────────────────────
  // TWO panes, ping-ponged. A single <video> cannot slide one clip out while
  // the next slides in: it would have to drop its source first, so the whole
  // transition would be a black rectangle. Each pane therefore owns a video
  // and its own caption, and a swipe moves both together — the drag follows
  // the finger and on release either completes or springs back, the gesture
  // people already know from Shorts and Reels.
  var DUR = 340;           // must match .idc-pane.settle's transition
  var panes = [];          // [{el, v, info, item}]
  var cur = 0;             // which pane is on screen
  var settling = null;     // { t, done } — a transition still in flight
  var drag = null;

  function reduced() {
    try { return matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (_e) { return false; }
  }

  function setY(p, y) { p.el.style.transform = 'translate3d(0,' + y + 'px,0)'; }

  // Every transition ends through here, so a gesture that interrupts one can
  // land it instantly instead of fighting it.
  function settle(done) {
    var s = { done: done };
    s.t = setTimeout(function () { settling = null; done(); }, reduced() ? 0 : DUR);
    settling = s;
  }
  function finishSettle() {
    if (!settling) return;
    var s = settling;
    settling = null;
    clearTimeout(s.t);
    s.done();
  }

  function fill(p, it) {
    p.item = it;
    p.v.poster = posterUrl(it.f);
    p.v.src = clipUrl(it.f);
    // Idiom and source only. The meaning is already burned into the clip, in
    // its own teal box, so repeating it here just covered the footage twice
    // over. (it.m still feeds the search and the cards.)
    p.info.innerHTML =
      '<b>' + esc(it.u) + '</b><div class="s">' + esc(it.s) + '</div>';
    p.rail.innerHTML = railHtml(it);
    placeChrome(p);   // again on loadedmetadata, once the real size is known
  }

  // The next index in direction d, walking past anything locked rather than
  // dead-ending on it. -1 when there is nothing left that way.
  function nextIdx(d) {
    var n = playIdx + d;
    while (n >= 0 && n < playList.length && locked(playList[n])) n += d;
    return (n < 0 || n >= playList.length) ? -1 : n;
  }

  function activate(n) {
    playIdx = n;
    var a = panes[cur], b = panes[1 - cur];
    a.el.classList.remove('idle');
    b.el.classList.add('idle');
    try { b.v.pause(); } catch (_e) {}
    document.getElementById('idcCount').textContent = (n + 1) + ' / ' + playList.length;
    document.getElementById('idcPrev').disabled = nextIdx(-1) === -1;
    document.getElementById('idcNext').disabled = nextIdx(1) === -1;
    // One history entry for the whole player, replaced as the reader moves —
    // otherwise Back would walk 300 clips before it reached the grid.
    try { history.replaceState({ picker: 'learn', cat: 'idioms', clip: 1 }, ''); } catch (_e) {}
    bumpView(playList[n]);
    a.v.play().catch(function () {});   // a blocked autoplay is not an error
  }

  function commit(n) {
    var out = panes[cur], inn = panes[1 - cur];
    out.el.classList.remove('settle');
    inn.el.classList.remove('settle');
    setY(out, 0);
    setY(inn, 0);
    cur = 1 - cur;
    activate(n);        // marks the outgoing pane idle, so its reset is unseen
  }

  function stage() {
    var el = document.getElementById('idcPlayer');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'idcPlayer';
    el.className = 'idc-player';
    var pane = '<div class="idc-pane idle"><video playsinline controls preload="metadata">'
      + '</video><div class="idc-rail-slot"></div><div class="idc-info"></div></div>';
    el.innerHTML =
      '<div class="idc-frame">'
      + '<div class="idc-stage">' + pane + pane
      + '<span class="idc-count" id="idcCount"></span>'
      + '<button class="idc-x" id="idcClose" aria-label="Close">✕</button>'
      + '</div>'
      + '<div class="idc-nav"><button id="idcPrev" aria-label="Previous">▲</button>'
      + '<button id="idcNext" aria-label="Next">▼</button></div>'
      + '</div>';
    document.body.appendChild(el);
    panes = Array.prototype.map.call(el.querySelectorAll('.idc-pane'), function (p) {
      return { el: p, v: p.querySelector('video'), info: p.querySelector('.idc-info'),
               rail: p.querySelector('.idc-rail-slot') };
    });
    // videoWidth is 0 until metadata lands, and the letterbox changes with the
    // viewport, so the chrome is placed again on each of these.
    panes.forEach(function (p) {
      p.v.addEventListener('loadedmetadata', function () { placeChrome(p); });
    });
    window.addEventListener('resize', placeAll);
    window.addEventListener('orientationchange', function () { setTimeout(placeAll, 250); });
    document.addEventListener('fullscreenchange', function () { setTimeout(placeAll, 120); });
    el.addEventListener('click', function (e) {
      if (e.target === el) close();           // backdrop
    });
    el.querySelector('#idcClose').addEventListener('click', function () { close(); });
    el.querySelector('#idcPrev').addEventListener('click', function () { step(-1); });
    el.querySelector('#idcNext').addEventListener('click', function () { step(1); });

    // ── swipe ───────────────────────────────────────────
    var st = el.querySelector('.idc-stage');

    function down(x, y) {
      if (commentsOpen()) { drag = null; return; }
      finishSettle();
      drag = { x0: x, y0: y, dy: 0, dx: 0, dir: 0, n: -1, H: st.offsetHeight || 1 };
    }
    function move(x, y, e) {
      if (!drag) return;
      drag.dy = y - drag.y0;
      drag.dx = x - drag.x0;
      if (!drag.dir) {
        // Claim the gesture only once it is clearly vertical. Comparing against
        // the horizontal travel is what keeps dragging the scrub bar working:
        // a seek is mostly sideways, and swallowing it left no way to rewind.
        if (Math.abs(drag.dy) < 10 || Math.abs(drag.dy) <= Math.abs(drag.dx)) return;
        drag.dir = drag.dy < 0 ? 1 : -1;      // finger up = next clip
        drag.n = nextIdx(drag.dir);
        panes[cur].el.classList.remove('settle');
        if (drag.n !== -1) {
          var b = panes[1 - cur];
          fill(b, playList[drag.n]);
          b.el.classList.remove('idle');
          b.el.classList.remove('settle');
        }
      }
      if (e && e.cancelable) e.preventDefault();
      // At the ends there is no neighbour to reveal, so the pane gives a
      // little and comes back rather than exposing the backdrop.
      var dy = drag.n === -1 ? drag.dy * 0.28 : drag.dy;
      setY(panes[cur], dy);
      if (drag.n !== -1) setY(panes[1 - cur], dy + drag.dir * drag.H);
    }
    function up() {
      if (!drag) return;
      var d = drag;
      drag = null;
      if (!d.dir) return;
      var a = panes[cur], b = panes[1 - cur];
      a.el.classList.add('settle');
      if (d.n !== -1) b.el.classList.add('settle');
      if (d.n !== -1 && Math.abs(d.dy) > Math.max(56, d.H * 0.16)) {
        setY(a, -d.dir * d.H);
        setY(b, 0);
        settle(function () { commit(d.n); });
      } else {
        setY(a, 0);
        if (d.n !== -1) setY(b, d.dir * d.H);
        settle(function () {
          a.el.classList.remove('settle');
          b.el.classList.remove('settle');
          if (d.n !== -1) {
            b.el.classList.add('idle');
            setY(b, 0);
            try { b.v.pause(); } catch (_e) {}
          }
        });
      }
    }

    st.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches.length === 1) down(e.touches[0].clientX, e.touches[0].clientY);
      else drag = null;
    }, { passive: true });
    st.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches.length === 1) move(e.touches[0].clientX, e.touches[0].clientY, e);
    }, { passive: false });
    st.addEventListener('touchend', up, { passive: true });
    st.addEventListener('touchcancel', function () { drag = null; }, { passive: true });

    // Trackpad / wheel, one clip per gesture.
    var wlock = 0;
    el.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaY) < 8) return;
      var now = Date.now();
      if (now < wlock) return;
      wlock = now + DUR + 60;
      step(e.deltaY > 0 ? 1 : -1);
    }, { passive: true });
    return el;
  }

  function isOpen() {
    var el = document.getElementById('idcPlayer');
    return !!(el && el.classList.contains('open'));
  }

  // ── fullscreen (phones only) ──────────────────────────────────────────────
  // The CSS above already makes the overlay cover the viewport, which is as
  // far as iOS Safari can go — it has no element fullscreen, only the native
  // video player, and that would replace our panes and swipe wholesale. Where
  // element fullscreen does exist (Android Chrome) we take it too, so the
  // browser's own chrome gets out of the way.
  var fsOn = false;
  function isPhone() {
    try { return matchMedia('(max-width:760px)').matches; } catch (_e) { return false; }
  }
  function enterFs(el) {
    if (!isPhone() || !el.requestFullscreen) return;
    try {
      var p = el.requestFullscreen();
      fsOn = true;
      if (p && p.catch) p.catch(function () { fsOn = false; });
    } catch (_e) { fsOn = false; }
  }
  function exitFs() {
    if (!fsOn) return;
    fsOn = false;                 // set first: the change event must ignore this
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch (_e) {}
  }
  document.addEventListener('fullscreenchange', function () {
    // Android's Back leaves fullscreen WITHOUT firing popstate. Treat that as
    // the dismissal it is meant to be — otherwise the player sits there with
    // no ✕ on it and takes a second press to get rid of.
    if (!fsOn || document.fullscreenElement) return;
    fsOn = false;
    if (isOpen()) close();
  });

  function close() {
    var el = document.getElementById('idcPlayer');
    if (!el) return;
    var was = el.classList.contains('open');
    if (commentsOpen()) {
      var w = document.getElementById('idcCwrap');
      w.classList.remove('in', 'open');
      cmtKey = null;
    }
    finishSettle();
    exitFs();
    drag = null;
    panes.forEach(function (p) {
      try { p.v.pause(); p.v.removeAttribute('src'); p.v.load(); } catch (_e) {}
      p.el.classList.remove('settle');
      setY(p, 0);
    });
    el.classList.remove('open');
    playIdx = -1;
    // Back on the grid: let the card under the eye pick up again.
    setTimeout(function () { if (pickerOpen()) pickFocus(); }, 60);
    // The player owns a history entry of its own (see play()), so closing it
    // by ✕, backdrop or Escape has to unwind that entry — otherwise the next
    // Back press lands on the entry a closed player left behind and appears
    // to do nothing. When close() came FROM popstate the entry is already
    // gone and calling back() again would exit the picker too.
    if (was && !fromPop) {
      try {
        if (history.state && history.state.clip) history.back();
      } catch (_e) {}
    }
  }

  function upsell() {
    close();
    var b = document.getElementById('topbarSubscribeBtn');
    if (b) b.click();
  }

  // Arrow keys, the nav buttons and the wheel all animate exactly like a
  // swipe, so the clip never changes without the motion that says which way.
  function step(d) {
    // Land any transition still running FIRST. nextIdx() reads playIdx, which
    // only advances when a transition commits — computing the target before
    // settling made a second press inside those 340ms resolve to the clip
    // already on its way in, so the press was swallowed (three quick taps
    // moved two clips).
    finishSettle();
    var n = nextIdx(d);
    if (n === -1) return;
    go(n, d);
  }

  function go(n, dir) {
    if (!isOpen()) { play(n); return; }
    finishSettle();
    if (n === playIdx) return;
    drag = null;
    var a = panes[cur], b = panes[1 - cur];
    var H = a.el.offsetHeight || 1;
    fill(b, playList[n]);
    b.el.classList.remove('idle');
    if (reduced()) { commit(n); return; }
    a.el.classList.remove('settle');
    b.el.classList.remove('settle');
    setY(b, dir > 0 ? H : -H);
    void b.el.offsetHeight;        // start from off-screen, not from 0
    a.el.classList.add('settle');
    b.el.classList.add('settle');
    setY(a, dir > 0 ? -H : H);
    setY(b, 0);
    settle(function () { commit(n); });
  }

  function play(n) {
    var it = playList[n];
    if (!it) return;
    if (locked(it)) { upsell(); return; }
    stopPreview();          // one video at a time, never the grid and the player
    style();
    var el = stage();
    if (el.classList.contains('open')) { go(n, n > playIdx ? 1 : -1); return; }
    finishSettle();
    drag = null;
    panes.forEach(function (p) { p.el.classList.remove('settle'); setY(p, 0); });
    fill(panes[cur], it);
    el.classList.add('open');
    enterFs(el);   // same task as the tap that opened it, or the request is refused
    try { history.pushState({ picker: 'learn', cat: 'idioms', clip: 1 }, ''); } catch (_e) {}
    activate(n);
  }

  document.addEventListener('keydown', function (e) {
    if (commentsOpen()) {
      if (e.key === 'Escape') { closeComments(); e.preventDefault(); }
      return;        // arrows must not change the clip while someone is typing
    }
    if (!isOpen()) return;
    if (e.key === 'Escape') { close(); e.preventDefault(); }
    else if (e.key === 'ArrowDown') { step(1); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { step(-1); e.preventDefault(); }
  });

  // Browser / Android / Telegram back closes the player, not the picker. This
  // listener runs alongside the landing's own learn-state handler; because the
  // state it leaves behind is still {picker:'learn',cat:'idioms'}, that one
  // sees the overlay already open on the same category and does nothing.
  window.addEventListener('popstate', function () {
    // The sheet sits on top of the player, so Back peels it off first.
    if (commentsOpen()) {
      fromPop = true;
      closeComments();
      fromPop = false;
      return;
    }
    if (!isOpen()) return;
    fromPop = true;
    close();
    fromPop = false;
  });

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var del = t.closest('.idc-cdel');
    if (del) {
      e.preventDefault();
      e.stopPropagation();
      var row = del.closest('.idc-crow');
      if (row) removeComment(row.getAttribute('data-cid'), row);
      return;
    }
    // Matched by ATTRIBUTE, not class: the player's rail buttons carry the
    // same data-cmt / data-like hooks but none of the cards' pill classes, and
    // keying off .idc-cmt / .idc-like left every rail button dead.
    var sb = t.closest('[data-sound]');
    if (sb) {
      e.preventDefault();
      e.stopPropagation();
      toggleSound();
      return;
    }
    var cb = t.closest('[data-cmt]');
    if (cb) {
      e.preventDefault();
      e.stopPropagation();
      openComments(cb.getAttribute('data-cmt'));
      return;
    }
    var lb = t.closest('[data-like]');
    if (lb) {
      e.preventDefault();
      e.stopPropagation();
      toggleLike(lb.getAttribute('data-like'));
      return;
    }
    var c = t.closest('.idc-card');
    if (!c) return;
    e.preventDefault();
    var i = Number(c.getAttribute('data-i'));
    var at = playList.findIndex(function (x) { return x.i === i; });
    if (at === -1) return;
    if (locked(playList[at])) { upsell(); return; }
    play(at);
  }, true);

  // ── comments ────────────────────────────────────────────
  // One discussion per clip, shared by all seven centres, published with no
  // approval step (both decided 2026-10-05). Everything that matters is
  // enforced in learn_comment_add, not here: length, links, the rate limits,
  // and above all the author name, which is read from the JWT so nobody can
  // post under someone else's. The client only reports what the server says.
  var cmtKey = null;
  var cmtBusy = false;

  function ago(iso) {
    var t = Date.parse(iso);
    if (!isFinite(t)) return '';
    var s = Math.max(0, (Date.now() - t) / 1000);
    if (s < 60) return 'now';
    if (s < 3600) return Math.floor(s / 60) + 'm';
    if (s < 86400) return Math.floor(s / 3600) + 'h';
    if (s < 604800) return Math.floor(s / 86400) + 'd';
    try { return new Date(t).toLocaleDateString(); } catch (_e) { return ''; }
  }

  // Only a hint for the UI — learn_comment_delete re-checks with is_any_admin()
  // server-side, so a wrong guess here costs a failed request, nothing more.
  function isAdminViewer() {
    try {
      var me = currentEmail();
      var a = String(localStorage.getItem('ms_admin_email') || '').trim().toLowerCase();
      return !!(me && a && a === me);
    } catch (_e) { return false; }
  }

  var AVC = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#e11d48', '#8b5cf6', '#14b8a6'];
  function avatar(name) {
    var n = String(name || '?').trim();
    var h = 0;
    for (var i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0;
    return '<span class="idc-cav" style="background:' + AVC[h % AVC.length] + '">'
      + esc(n.charAt(0).toUpperCase() || '?') + '</span>';
  }

  function sheet() {
    var el = document.getElementById('idcCwrap');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'idcCwrap';
    el.className = 'idc-cwrap';
    el.innerHTML =
      '<div class="idc-bd"></div>'
      + '<div class="idc-sheet">'
      + '<div class="idc-shead"><b>Comments</b><span class="n" id="idcCTotal">0</span>'
      + '<button type="button" id="idcCClose" aria-label="Close">✕</button></div>'
      + '<div class="idc-clist" id="idcCList"></div>'
      + '<div class="idc-cbox" id="idcCBox"></div>'
      + '</div>';
    document.body.appendChild(el);
    el.querySelector('.idc-bd').addEventListener('click', function () { closeComments(); });
    el.querySelector('#idcCClose').addEventListener('click', function () { closeComments(); });
    return el;
  }

  function rowHtml(c, admin) {
    var canDel = c.mine || admin;
    return '<div class="idc-crow" data-cid="' + esc(c.id) + '">'
      + avatar(c.author)
      + '<div class="idc-cmain"><div class="idc-cwho">' + esc(c.author)
      + '<i>' + esc(ago(c.at)) + '</i></div>'
      + '<div class="idc-cbody">' + esc(c.body) + '</div></div>'
      + (canDel ? '<button class="idc-cdel" type="button" title="Delete">✕</button>' : '')
      + '</div>';
  }

  function paintList(rows, total) {
    var list = document.getElementById('idcCList');
    var admin = isAdminViewer();
    document.getElementById('idcCTotal').textContent = nice(total);
    list.innerHTML = rows.length
      ? rows.map(function (c) { return rowHtml(c, admin); }).join('')
      : '<div class="idc-cempty">No comments yet — say the first thing.</div>';
  }

  async function paintBox() {
    var box = document.getElementById('idcCBox');
    var tk = await jwt();
    if (!tk) {
      box.innerHTML = '<div class="idc-csignin">Sign in to join the conversation.</div>';
      return;
    }
    box.innerHTML =
      '<textarea id="idcCText" maxlength="400" rows="1" placeholder="Add a comment…"></textarea>'
      + '<div class="idc-crow2"><span class="idc-cnum" id="idcCNum">0/400</span>'
      + '<span class="idc-cerr" id="idcCErr"></span>'
      + '<button class="idc-csend" id="idcCSend" type="button" disabled>Post</button></div>';
    var ta = document.getElementById('idcCText');
    var send = document.getElementById('idcCSend');
    ta.addEventListener('input', function () {
      document.getElementById('idcCNum').textContent = ta.value.length + '/400';
      document.getElementById('idcCErr').textContent = '';
      send.disabled = !ta.value.trim();
      ta.style.height = 'auto';
      ta.style.height = Math.min(120, ta.scrollHeight) + 'px';
    });
    ta.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); post(); }
    });
    send.addEventListener('click', post);
  }

  // The server speaks in short codes; turn them into something a student can
  // act on rather than showing the raw message.
  var CERR = {
    'sign in required': 'Sign in first.',
    'no links': 'Links are not allowed here.',
    'too fast': 'Give it a few seconds between comments.',
    'limit reached for this clip': 'You already have 3 comments on this clip.',
    'hourly limit': 'That is enough for one hour.',
    'too long': 'Keep it under 400 characters.',
    'empty': 'Write something first.'
  };

  async function post() {
    if (cmtBusy || !cmtKey) return;
    var ta = document.getElementById('idcCText');
    var send = document.getElementById('idcCSend');
    var err = document.getElementById('idcCErr');
    var body = (ta.value || '').trim();
    if (!body) return;
    var tk = await jwt();
    if (!tk) { paintBox(); return; }
    cmtBusy = true;
    send.disabled = true;
    err.textContent = '';
    var center = '';
    try { center = String(window.__CENTER_ID || ''); } catch (_e) {}
    var r = await fetch(SB + '/rest/v1/rpc/learn_comment_add', {
      method: 'POST',
      headers: { apikey: SB_KEY, Authorization: 'Bearer ' + tk,
                 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_kind: 'idiom', p_key: cmtKey, p_body: body, p_center: center })
    }).then(function (x) { return x.json().then(function (j) { return { ok: x.ok, j: j }; }); })
      .catch(function () { return { ok: false, j: null }; });
    cmtBusy = false;
    if (!r.ok) {
      var m = (r.j && r.j.message) || '';
      err.textContent = CERR[m] || 'Could not post that.';
      send.disabled = false;
      return;
    }
    ta.value = '';
    ta.style.height = 'auto';
    document.getElementById('idcCNum').textContent = '0/400';
    cmtCounts[cmtKey] = (Number(cmtCounts[cmtKey]) || 0) + 1;
    paintStats(cmtKey);
    await refresh();
  }

  async function refresh() {
    var tk = await jwt();   // the token is what decides which rows are "mine"
    var r = await rpc('learn_comments_list',
                      { p_kind: 'idiom', p_key: cmtKey, p_limit: 100 }, tk);
    var rows = (r && r.rows) || [];
    var total = (r && r.total) || 0;
    cmtCounts[cmtKey] = total;
    paintStats(cmtKey);
    paintList(rows, total);
  }

  async function removeComment(id, el) {
    var tk = await jwt();
    if (!tk) return;
    var ok = await rpc('learn_comment_delete', { p_id: id }, tk);
    if (ok !== true) return;
    el.remove();
    cmtCounts[cmtKey] = Math.max(0, (Number(cmtCounts[cmtKey]) || 1) - 1);
    document.getElementById('idcCTotal').textContent = nice(cmtCounts[cmtKey]);
    paintStats(cmtKey);
    if (!document.querySelector('#idcCList .idc-crow')) {
      document.getElementById('idcCList').innerHTML =
        '<div class="idc-cempty">No comments yet — say the first thing.</div>';
    }
  }

  function openComments(key) {
    style();
    var el = sheet();
    cmtKey = key;
    // Re-parent: while the player is open the sheet must live INSIDE it, or on
    // Android it is invisible whenever the player holds the fullscreen.
    var host = isOpen() ? document.getElementById('idcPlayer') : document.body;
    if (el.parentNode !== host) host.appendChild(el);
    document.getElementById('idcCList').innerHTML =
      '<div class="idc-cempty">Loading…</div>';
    document.getElementById('idcCTotal').textContent = nice(cmtCounts[key]);
    el.classList.add('open');
    void el.offsetHeight;          // so the sheet slides up rather than appearing
    el.classList.add('in');
    try { history.pushState({ picker: 'learn', cat: 'idioms', clip: isOpen() ? 1 : 0, cmt: 1 }, ''); }
    catch (_e) {}
    paintBox();
    refresh();
  }

  function commentsOpen() {
    var el = document.getElementById('idcCwrap');
    return !!(el && el.classList.contains('open'));
  }

  function closeComments() {
    var el = document.getElementById('idcCwrap');
    if (!el || !el.classList.contains('open')) return;
    el.classList.remove('in');
    setTimeout(function () { el.classList.remove('open'); }, 280);
    cmtKey = null;
    if (!fromPop) {
      try { if (history.state && history.state.cmt) history.back(); } catch (_e) {}
    }
  }

  // ── "Liked" header toggle ─────────────────────────────────────────────────
  function likedBtn(show) {
    var host = document.querySelector('#learnPicker .learn-header-tools');
    var b = document.getElementById('idcLikedBtn');
    if (!show) { if (b) b.remove(); return; }
    if (!host) return;
    if (!b) {
      b = document.createElement('button');
      b.id = 'idcLikedBtn';
      b.type = 'button';
      b.innerHTML = '♥ Liked';
      b.addEventListener('click', function () {
        likedOnly = !likedOnly;
        b.classList.toggle('on', likedOnly);
        renderCurrent();
      });
      host.appendChild(b);
    }
    b.classList.toggle('on', likedOnly);
  }

  // ── tool-card count pill ──────────────────────────────────────────────────
  // The other three categories read an in-page catalogue array, so their badge
  // fills itself; the clips catalogue is a JSON file, which left Idiom Clips
  // as the one card with an empty pill. Fetched at idle, which also warms the
  // cache for the first open. The sidebar copy of the tools grid has its ids
  // rewritten to data-ltc-copy, and it is built on its own schedule, so the
  // badge is written a few times rather than once.
  function badge() {
    load().then(function (list) {
      var txt = list.length + ' clips';
      function paint() {
        var el = document.getElementById('ltCountIdioms');
        if (el) el.textContent = txt;
        document.querySelectorAll('[data-ltc-copy="ltCountIdioms"]')
          .forEach(function (c) { c.textContent = txt; });
      }
      paint();
      setTimeout(paint, 2000);
      setTimeout(paint, 5000);
    }).catch(function () {});
  }
  if (window.requestIdleCallback) requestIdleCallback(badge, { timeout: 4000 });
  else setTimeout(badge, 1500);

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
      lastQuery = '';
      likedOnly = false;
      var grid = document.getElementById('learnGrid');
      if (grid) grid.innerHTML = '';
      var overlay = document.getElementById('learnPicker');
      overlay.classList.add('learn-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      likedBtn(true);
      if (!(opts && opts.fromRestore)) {
        try { history.pushState({ picker: 'learn', cat: 'idioms' }, ''); } catch (_e) {}
      }
      order = shuffle((await load()).slice());
      renderCurrent();
      // Numbers arrive a moment later; the grid is already usable without
      // them, so nothing waits on this.
      await loadStats(true);
      renderCurrent();
    },
    filter: async function (q) {
      await load();
      lastQuery = (q || '').toLowerCase().trim();
      if (!order) order = shuffle(items.slice());
      renderCurrent();
    },
    close: close,
    // Called when the picker switches to one of the four catalogue
    // categories, so the Liked chip does not linger over their grids.
    leave: function () {
      stopPreview();
      likedBtn(false);
      likedOnly = false;
      close();
      // The Liked filter rewrites the shared empty-state line; put the
      // original back or an Articles search with no hits shows it.
      var msg = document.querySelector('#learnEmpty .learn-empty-msg');
      if (msg && msg._idcOrig) msg.textContent = msg._idcOrig;
    }
  };
})();
