/* mock-code-verifier.js
 * Shared helper for verifying mock-stream-issued mock codes (8-digit, generated
 * via the Code Management panel or Telegram bot). Mock pages call this AFTER
 * trying their own legacy OTP paths.
 *
 * Returns { valid, premiumEntry, tier } or { valid:false, error }.
 *   tier === 'premium' → unlocks AI grading + premium features (sets PremiumEntry='true')
 *   tier === 'regular' → unlocks the mock only (sets PremiumEntry='false')
 */
(function () {
  var SB_URL  = 'https://zknyukkbtbcqgvkgjktb.supabase.co';
  // Publishable anon key — safe to expose. Required by the Supabase gateway
  // even when the function itself runs with --no-verify-jwt.
  var SB_ANON = window.SB_ANON_KEY || window.SUPABASE_ANON_KEY
             || 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';

  function _center() {
    try {
      var c = (window.SITE_CONFIG && window.SITE_CONFIG.testIdentifier) || 'mock_stream';
      return String(c).replace(/_/g, '');
    } catch (e) { return 'mockstream'; }
  }

  // Remember, for this tab only, the codes a student just typed to open a mock
  // or unlock VIP. All of them are 8 digits, exactly like the sign-in code we
  // email, and students were typing their teacher's code into the email-code
  // box. email-code-modal.js checks this list to say so plainly instead of
  // "invalid code". Kept in the browser on purpose: a server lookup would let
  // anyone test whether a guessed code exists.
  window.msRememberAccessCode = function (code) {
    try {
      var d = String(code || '').replace(/\D/g, '');
      if (d.length < 6) return;
      var list = JSON.parse(sessionStorage.getItem('ms_recent_access_codes') || '[]');
      if (!Array.isArray(list)) list = [];
      list = list.filter(function (x) { return x !== d; });
      list.unshift(d);
      sessionStorage.setItem('ms_recent_access_codes', JSON.stringify(list.slice(0, 5)));
    } catch (_e) {}
  };

  // Verify a code via our verify-passcode edge function.
  // skill/mockNumber are optional but help disambiguate when given.
  window.verifyMockStreamCode = async function (code, opts) {
    if (!code) return { valid: false };
    code = String(code).trim();
    window.msRememberAccessCode(code);
    opts = opts || {};
    var body = {
      code: code,
      center: _center()
    };
    if (opts.skill) body.skill = opts.skill;
    if (opts.mockNumber != null) body.mock_number = opts.mockNumber;
    try {
      var headers = { 'Content-Type': 'application/json' };
      if (SB_ANON) {
        headers['apikey'] = SB_ANON;
        headers['Authorization'] = 'Bearer ' + SB_ANON;
      }
      var resp = await fetch(SB_URL + '/functions/v1/verify-passcode', {
        method: 'POST', headers: headers, body: JSON.stringify(body)
      });
      if (!resp.ok) return { valid: false };
      var data = await resp.json();
      if (!(data.access || data.valid)) return { valid: false };
      var tier = data.tier || (data.role === 'regular' ? 'regular' : 'premium');
      return {
        valid: true,
        tier: tier,
        premiumEntry: tier === 'premium',
        skill: data.skill || null,
        mockNumber: data.mock_number || null
      };
    } catch (e) {
      return { valid: false, error: 'network' };
    }
  };
})();
