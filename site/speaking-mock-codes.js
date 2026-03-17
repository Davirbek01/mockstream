// Speaking Mock Premium Codes - NUMBER-ONLY FILLER SYSTEM
// Each mock has 4 unique filler digits inserted at fixed positions
// Input: 6-digit OTP -> Output: 10 all-digit code
// Filler positions: 1, 4, 6, 8 (0-indexed)
// Real OTP at positions: 0, 2, 3, 5, 7, 9

window.SPEAKING_MOCK_CODES = {
  1: { fillers: [9, 7, 2, 7] },
  2: { fillers: [4, 5, 5, 4] },
  3: { fillers: [0, 1, 4, 2] },
  4: { fillers: [9, 8, 3, 9] },
  5: { fillers: [8, 0, 7, 3] },
  6: { fillers: [1, 5, 8, 5] },
  7: { fillers: [1, 1, 7, 1] },
  8: { fillers: [4, 2, 0, 7] },
  9: { fillers: [6, 3, 5, 6] },
  10: { fillers: [1, 4, 4, 5] },
  11: { fillers: [0, 0, 3, 8] },
  12: { fillers: [2, 5, 1, 5] },
  13: { fillers: [0, 2, 4, 4] },
  14: { fillers: [2, 2, 0, 9] },
  15: { fillers: [3, 3, 4, 3] },
  16: { fillers: [9, 0, 3, 3] },
  17: { fillers: [9, 4, 2, 2] },
  18: { fillers: [1, 7, 5, 3] },
  19: { fillers: [5, 8, 2, 2] },
  20: { fillers: [1, 0, 9, 8] },
  21: { fillers: [6, 6, 9, 6] },
  22: { fillers: [4, 7, 0, 7] },
  23: { fillers: [9, 1, 0, 2] },
  24: { fillers: [9, 1, 0, 9] },
  25: { fillers: [1, 7, 8, 8] },
  26: { fillers: [3, 2, 5, 3] },
  27: { fillers: [9, 7, 7, 6] },
  28: { fillers: [0, 5, 3, 7] },
  29: { fillers: [3, 9, 4, 4] },
  30: { fillers: [9, 4, 3, 1] },
  31: { fillers: [9, 4, 6, 3] },
  32: { fillers: [7, 4, 7, 0] },
  33: { fillers: [0, 3, 6, 7] },
  34: { fillers: [9, 1, 5, 4] },
  35: { fillers: [2, 2, 4, 0] },
  36: { fillers: [6, 6, 4, 6] },
  37: { fillers: [9, 6, 4, 3] },
  38: { fillers: [3, 7, 3, 8] },
  39: { fillers: [1, 2, 8, 7] },
  40: { fillers: [2, 2, 1, 5] },
  41: { fillers: [6, 7, 2, 2] },
  42: { fillers: [9, 8, 6, 5] },
  43: { fillers: [9, 0, 5, 7] },
  44: { fillers: [0, 5, 9, 6] },
  45: { fillers: [4, 4, 6, 9] },
  46: { fillers: [7, 3, 6, 5] },
  47: { fillers: [8, 8, 0, 8] },
  48: { fillers: [8, 4, 2, 2] },
  49: { fillers: [4, 2, 6, 0] },
  50: { fillers: [7, 6, 9, 3] },
  51: { fillers: [7, 4, 2, 7] },
  52: { fillers: [4, 2, 1, 8] },
  53: { fillers: [5, 4, 9, 5] },
  54: { fillers: [7, 8, 3, 9] },
  55: { fillers: [6, 6, 1, 8] },
  56: { fillers: [2, 1, 1, 0] },
  57: { fillers: [7, 6, 5, 6] },
  58: { fillers: [9, 8, 5, 5] },
  59: { fillers: [9, 2, 7, 1] },
  60: { fillers: [5, 0, 0, 5] },
  61: { fillers: [2, 3, 1, 7] },
  62: { fillers: [1, 3, 0, 4] },
  63: { fillers: [5, 3, 4, 0] },
  64: { fillers: [5, 7, 1, 3] },
  65: { fillers: [0, 3, 4, 2] },
  66: { fillers: [4, 5, 6, 0] },
  67: { fillers: [6, 8, 8, 9] },
  68: { fillers: [1, 2, 1, 4] },
  69: { fillers: [8, 3, 7, 1] },
  70: { fillers: [7, 0, 9, 4] },
  71: { fillers: [5, 6, 9, 1] },
  72: { fillers: [0, 0, 8, 8] },
  73: { fillers: [3, 6, 2, 7] },
  74: { fillers: [6, 0, 2, 2] },
  75: { fillers: [6, 4, 2, 9] },
  76: { fillers: [3, 8, 5, 0] },
  77: { fillers: [2, 8, 0, 9] },
  78: { fillers: [1, 6, 1, 8] },
  79: { fillers: [2, 4, 5, 5] },
  80: { fillers: [2, 4, 8, 5] },
  81: { fillers: [0, 9, 8, 7] },
  82: { fillers: [1, 5, 0, 9] },
  83: { fillers: [8, 4, 6, 1] },
  84: { fillers: [0, 4, 6, 6] },
  85: { fillers: [9, 8, 3, 2] },
  86: { fillers: [2, 2, 0, 2] },
  87: { fillers: [7, 0, 1, 7] },
  88: { fillers: [3, 1, 4, 1] },
  89: { fillers: [2, 0, 8, 6] },
  90: { fillers: [6, 4, 6, 0] },
  91: { fillers: [1, 1, 3, 1] },
  92: { fillers: [4, 2, 4, 4] },
  93: { fillers: [2, 7, 0, 6] },
  94: { fillers: [5, 3, 6, 4] },
  95: { fillers: [7, 7, 6, 6] },
  96: { fillers: [9, 9, 9, 2] },
  97: { fillers: [1, 7, 0, 1] },
  98: { fillers: [3, 8, 9, 9] },
  99: { fillers: [0, 9, 8, 8] }
};

// Build obfuscated 10-digit code from 6-digit OTP and fillers
// Filler positions: 1, 4, 6, 8 -> Real OTP at: 0, 2, 3, 5, 7, 9
window.buildSpeakingPremiumCode = function(raw6, fillers) {
  return '' + raw6[0] + fillers[0] + raw6[1] + raw6[2] + fillers[1] + raw6[3] + fillers[2] + raw6[4] + fillers[3] + raw6[5];
};

// Extract 6-digit OTP from 10-digit obfuscated code
// Returns null if fillers do not match
window.extractSpeakingPremiumOTP = function(code10, mockNumber) {
  if (!code10 || code10.length !== 10 || !/^\d{10}$/.test(code10)) return null;
  var mockData = window.SPEAKING_MOCK_CODES[parseInt(mockNumber)];
  if (!mockData || !mockData.fillers) return null;
  var f = mockData.fillers;
  if (parseInt(code10[1]) !== f[0]) return null;
  if (parseInt(code10[4]) !== f[1]) return null;
  if (parseInt(code10[6]) !== f[2]) return null;
  if (parseInt(code10[8]) !== f[3]) return null;
  return code10[0] + code10[2] + code10[3] + code10[5] + code10[7] + code10[9];
};
