// Listening Mock Premium Codes - NUMBER-ONLY FILLER SYSTEM
// Each mock has 4 unique filler digits inserted at fixed positions
// Input: 6-digit OTP -> Output: 10 all-digit code
// Filler positions: 1, 4, 6, 8 (0-indexed)
// Real OTP at positions: 0, 2, 3, 5, 7, 9

window.LISTENING_MOCK_CODES = {
  1: { fillers: [2, 4, 6, 1] },
  2: { fillers: [5, 3, 9, 1] },
  3: { fillers: [2, 4, 6, 4] },
  4: { fillers: [4, 7, 0, 2] },
  5: { fillers: [8, 4, 0, 5] },
  6: { fillers: [0, 5, 4, 3] },
  7: { fillers: [8, 7, 5, 0] },
  8: { fillers: [8, 1, 3, 9] },
  9: { fillers: [4, 7, 9, 6] },
  10: { fillers: [1, 6, 6, 0] },
  11: { fillers: [4, 6, 2, 2] },
  12: { fillers: [0, 3, 9, 2] },
  13: { fillers: [2, 4, 8, 3] },
  14: { fillers: [2, 5, 4, 7] },
  15: { fillers: [6, 6, 4, 9] },
  16: { fillers: [2, 9, 3, 9] },
  17: { fillers: [9, 8, 5, 3] },
  18: { fillers: [0, 0, 7, 4] },
  19: { fillers: [5, 8, 3, 6] },
  20: { fillers: [7, 9, 2, 5] },
  21: { fillers: [1, 7, 3, 9] },
  22: { fillers: [1, 9, 1, 5] },
  23: { fillers: [6, 2, 9, 9] },
  24: { fillers: [5, 7, 9, 2] },
  25: { fillers: [0, 1, 3, 2] },
  26: { fillers: [6, 9, 5, 3] },
  27: { fillers: [3, 8, 9, 3] },
  28: { fillers: [5, 1, 9, 5] },
  29: { fillers: [7, 4, 0, 9] },
  30: { fillers: [7, 7, 0, 6] },
  31: { fillers: [0, 8, 9, 7] },
  32: { fillers: [8, 4, 8, 5] },
  33: { fillers: [2, 3, 4, 0] },
  34: { fillers: [7, 1, 8, 8] },
  35: { fillers: [7, 9, 8, 5] },
  36: { fillers: [1, 2, 4, 3] },
  37: { fillers: [8, 0, 3, 0] },
  38: { fillers: [3, 1, 8, 9] },
  39: { fillers: [5, 3, 1, 0] },
  40: { fillers: [2, 0, 1, 2] },
  41: { fillers: [5, 0, 9, 9] },
  42: { fillers: [5, 9, 7, 4] },
  43: { fillers: [6, 6, 9, 5] },
  44: { fillers: [2, 5, 4, 2] },
  45: { fillers: [5, 4, 2, 4] },
  46: { fillers: [7, 3, 5, 0] },
  47: { fillers: [2, 1, 7, 7] },
  48: { fillers: [6, 5, 6, 7] },
  49: { fillers: [4, 2, 7, 9] },
  50: { fillers: [4, 5, 4, 7] },
  51: { fillers: [3, 3, 0, 1] },
  52: { fillers: [4, 8, 3, 1] },
  53: { fillers: [5, 1, 3, 1] },
  54: { fillers: [5, 5, 5, 6] },
  55: { fillers: [6, 0, 5, 3] },
  56: { fillers: [9, 8, 3, 8] },
  57: { fillers: [6, 7, 2, 3] },
  58: { fillers: [1, 9, 6, 8] },
  59: { fillers: [0, 8, 7, 3] },
  60: { fillers: [2, 7, 1, 5] },
  61: { fillers: [0, 4, 4, 5] },
  62: { fillers: [5, 8, 8, 2] },
  63: { fillers: [3, 1, 2, 5] },
  64: { fillers: [3, 8, 4, 4] },
  65: { fillers: [3, 8, 9, 8] },
  66: { fillers: [0, 0, 2, 0] },
  67: { fillers: [2, 2, 3, 2] },
  68: { fillers: [8, 0, 7, 6] },
  69: { fillers: [3, 6, 0, 2] },
  70: { fillers: [3, 3, 4, 1] },
  71: { fillers: [2, 5, 1, 7] },
  72: { fillers: [3, 3, 7, 7] },
  73: { fillers: [8, 3, 3, 3] },
  74: { fillers: [1, 5, 0, 0] },
  75: { fillers: [3, 1, 9, 8] },
  76: { fillers: [5, 8, 4, 4] },
  77: { fillers: [4, 6, 4, 2] },
  78: { fillers: [0, 6, 7, 4] },
  79: { fillers: [1, 7, 0, 4] },
  80: { fillers: [1, 9, 7, 3] },
  81: { fillers: [6, 0, 1, 7] },
  82: { fillers: [5, 4, 0, 2] },
  83: { fillers: [0, 6, 9, 3] },
  84: { fillers: [0, 8, 5, 0] },
  85: { fillers: [7, 8, 7, 9] },
  86: { fillers: [0, 3, 8, 9] },
  87: { fillers: [5, 0, 2, 1] },
  88: { fillers: [1, 0, 8, 7] },
  89: { fillers: [4, 3, 0, 5] },
  90: { fillers: [4, 5, 8, 9] },
  91: { fillers: [7, 2, 9, 7] },
  92: { fillers: [4, 0, 2, 0] },
  93: { fillers: [9, 5, 6, 5] },
  94: { fillers: [1, 8, 8, 9] },
  95: { fillers: [2, 0, 2, 0] },
  96: { fillers: [9, 5, 2, 6] },
  97: { fillers: [0, 3, 3, 8] },
  98: { fillers: [9, 5, 9, 4] },
  99: { fillers: [7, 3, 9, 1] }
};

// Build obfuscated 10-digit code from 6-digit OTP and fillers
// Filler positions: 1, 4, 6, 8 -> Real OTP at: 0, 2, 3, 5, 7, 9
window.buildListeningPremiumCode = function(raw6, fillers) {
  return '' + raw6[0] + fillers[0] + raw6[1] + raw6[2] + fillers[1] + raw6[3] + fillers[2] + raw6[4] + fillers[3] + raw6[5];
};

// Extract 6-digit OTP from 10-digit obfuscated code
// Returns null if fillers do not match
window.extractListeningPremiumOTP = function(code10, mockNumber) {
  if (!code10 || code10.length !== 10 || !/^\d{10}$/.test(code10)) return null;
  var mockData = window.LISTENING_MOCK_CODES[parseInt(mockNumber)];
  if (!mockData || !mockData.fillers) return null;
  var f = mockData.fillers;
  if (parseInt(code10[1]) !== f[0]) return null;
  if (parseInt(code10[4]) !== f[1]) return null;
  if (parseInt(code10[6]) !== f[2]) return null;
  if (parseInt(code10[8]) !== f[3]) return null;
  return code10[0] + code10[2] + code10[3] + code10[5] + code10[7] + code10[9];
};
