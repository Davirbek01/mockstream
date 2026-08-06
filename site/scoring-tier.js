/* =====================================================================
 * scoring-tier.js
 * ---------------------------------------------------------------------
 * Report tier (standard | premium) + the delta→marked-up-text rebuilder,
 * defined ONCE and shared by every page that scores an exam.
 *
 * WHY THIS FILE EXISTS
 * The tier decides how much the model WRITES, not what it scores:
 *   premium  — echo the whole answer back with inline [TYPE: a -> b] marks,
 *              plus a generated model answer.
 *   standard — return only {t, from, to} deltas and no samples; the client
 *              rebuilds the marked-up text from the answer it already holds.
 * Output is ~90% of AI spend, so this is the main cost lever.
 *
 * Until now the resolver and the rebuilder were copy-pasted into
 * "Speaking Mocks.html" and "Writing Mocks.html", and the pages that were
 * never given a copy (full-mock, the IELTS pages) silently ignored the tier
 * entirely — a student got a different report depending on which page graded
 * them. Copying it a fourth and fifth time would guarantee the same drift, so
 * it lives here instead.
 *
 * Load with:  <script src="./scoring-tier.js"></script>
 * ===================================================================== */
(function () {
  'use strict';

  var SB_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  // The publishable key, spelled out the same way every exam page spells it.
  // It must NOT come from window.SUPABASE_ANON_KEY: no page in site/ defines
  // that global, so reading it yields '' -> 401 -> the catch below returns {}
  // -> every skill resolves to the 'premium' default. The tier would look
  // wired and do nothing, on every page, silently.
  var SB_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
  var _cache = { at: 0, rows: null };
  var TTL = 5 * 60 * 1000;

  function _pick(v) {
    v = String(v || '').trim().toLowerCase();
    return (v === 'standard' || v === 'premium') ? v : '';
  }

  /** The scoring_* rows of site_settings (the System Prompts panel). */
  async function _settings() {
    if (_cache.rows && (Date.now() - _cache.at) < TTL) return _cache.rows;
    try {
      var r = await fetch(SB_URL + '/rest/v1/site_settings?key=like.scoring_*&select=key,value', {
        headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY }
      });
      if (r.ok) {
        var rows = await r.json(), map = {};
        rows.forEach(function (x) { map[x.key] = x.value; });
        _cache = { at: Date.now(), rows: map };
        return map;
      }
    } catch (e) {}
    return _cache.rows || {};
  }

  /**
   * Resolve the tier for a skill.
   *
   * Precedence, first hit wins — identical to the original _getPromptTier so
   * that moving a page onto this helper cannot change its behaviour:
   *   centre promptTier<Skill> → centre promptTier
   *   → scoring_prompt_tier_<skill> → scoring_prompt_tier → 'premium'
   *
   * Centres store the string "default", which is deliberately NOT a valid
   * tier — it means "inherit", so it falls through to the global setting.
   */
  async function getPromptTier(skill) {
    skill = (skill === 'writing') ? 'writing' : 'speaking';
    var key = skill === 'writing' ? 'promptTierWriting' : 'promptTierSpeaking';
    try {
      var cc = window._centerConfig || {};
      var fromCentre = _pick(cc[key]) || _pick(cc.promptTier);
      if (fromCentre) return fromCentre;
    } catch (e) {}
    var cp = await _settings();
    return _pick(cp['scoring_prompt_tier_' + skill]) || _pick(cp.scoring_prompt_tier) || 'premium';
  }

  var _isWord = function (ch) { return !!ch && /[A-Za-z0-9_À-ɏ']/.test(ch); };

  /** Word-boundary aware search. Without it a one-character delta such as
   *  {"from":"i","to":"I"} matches the "i" INSIDE "Hi" and mangles the word. */
  function _find(hay, needle, from_i) {
    if (!needle) return -1;
    var needStart = _isWord(needle.charAt(0));
    var needEnd = _isWord(needle.charAt(needle.length - 1));
    var i = from_i;
    while (i <= hay.length - needle.length) {
      var idx = hay.indexOf(needle, i);
      if (idx === -1) return -1;
      var okS = !needStart || !_isWord(idx > 0 ? hay.charAt(idx - 1) : '');
      var okE = !needEnd || !_isWord(hay.charAt(idx + needle.length));
      if (okS && okE) return idx;
      i = idx + 1;
    }
    return -1;
  }

  /**
   * Rebuild the "[TYPE: wrong -> right]" annotated string from deltas, so the
   * existing renderers, PDF export and Telegram caption all work unchanged.
   *
   * Guards, each of which testing caught the hard way:
   *   • word boundaries (see _find)
   *   • a single forward cursor, so an inserted marker can never be re-matched
   *   • unlocatable fragments are APPENDED, never silently dropped — a
   *     correction the student cannot see is worse than an untidy one
   */
  function correctedFromDeltas(text, errors) {
    var src = String(text || '');
    if (!src) return '';
    if (!errors || !errors.length) return src;

    var out = '', cursor = 0, unmatched = [];
    errors.forEach(function (e) {
      if (!e) return;
      var type = String(e.t || e.type || 'GRAMMAR').toUpperCase();
      var from = String(e.from || '').trim();
      var to = String(e.to || '').trim();
      if (type === 'PRON') { unmatched.push('[PRON: ' + (to || from) + ']'); return; }
      if (!from) return;
      var marker = '[' + type + ': ' + from + ' -> ' + (to || '(omit)') + ']';
      var idx = _find(src, from, cursor);
      if (idx === -1) idx = _find(src.toLowerCase(), from.toLowerCase(), cursor);
      if (idx === -1) { unmatched.push(marker); return; }
      out += src.slice(cursor, idx) + marker;
      cursor = idx + from.length;
    });
    out += src.slice(cursor);
    if (unmatched.length) out += ' ' + unmatched.join(' ');
    return out;
  }

  /** The standard-tier delta contract, shared by every spec so the wording
   *  cannot drift between pages. */
  var DELTA_RULES =
    'Each error item: {"t":"GRAMMAR|SPELL|VOCAB|PUNCT|FLUENCY|PRON|L1","from":"<exact text as written/spoken>","to":"<replacement>"}\n' +
    '• "from" MUST be copied EXACTLY as it appears in the response — same words, same order, same spelling — so it can be located. Do NOT paraphrase or re-punctuate.\n' +
    '• Keep "from" short: the few words that are actually wrong, not the whole sentence.\n' +
    '• Use "to":"(omit)" for text that should simply be deleted.\n' +
    '• List errors in the order they appear.\n' +
    '• If a response is genuinely flawless, return an empty array [].';

  window.getPromptTier = getPromptTier;
  window.correctedFromDeltas = correctedFromDeltas;
  window.SCORING_DELTA_RULES = DELTA_RULES;
})();
