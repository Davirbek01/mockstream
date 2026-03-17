// Reading Mock Premium Codes - NUMBER-ONLY FILLER SYSTEM
// Each mock has 4 unique filler digits inserted at fixed positions
// Input: 6-digit OTP -> Output: 10 all-digit code
// Filler positions: 1, 4, 6, 8 (0-indexed)
// Real OTP at positions: 0, 2, 3, 5, 7, 9

window.READING_MOCK_CODES = {
  1: { fillers: [7, 1, 2, 6] },
  2: { fillers: [3, 2, 7, 9] },
  3: { fillers: [5, 2, 4, 3] },
  4: { fillers: [0, 2, 0, 2] },
  5: { fillers: [1, 9, 0, 5] },
  6: { fillers: [7, 5, 7, 6] },
  7: { fillers: [6, 8, 6, 1] },
  8: { fillers: [1, 6, 0, 4] },
  9: { fillers: [5, 5, 3, 3] },
  10: { fillers: [4, 2, 2, 3] },
  11: { fillers: [0, 3, 7, 7] },
  12: { fillers: [5, 6, 1, 9] },
  13: { fillers: [3, 1, 0, 3] },
  14: { fillers: [9, 7, 0, 4] },
  15: { fillers: [2, 7, 3, 3] },
  16: { fillers: [9, 9, 6, 5] },
  17: { fillers: [4, 8, 9, 0] },
  18: { fillers: [3, 1, 1, 9] },
  19: { fillers: [2, 0, 0, 3] },
  20: { fillers: [8, 9, 7, 0] },
  21: { fillers: [5, 1, 7, 1] },
  22: { fillers: [7, 8, 4, 9] },
  23: { fillers: [3, 1, 2, 2] },
  24: { fillers: [9, 4, 9, 7] },
  25: { fillers: [9, 1, 9, 7] },
  26: { fillers: [3, 0, 7, 6] },
  27: { fillers: [5, 4, 5, 8] },
  28: { fillers: [8, 9, 3, 8] },
  29: { fillers: [5, 5, 2, 5] },
  30: { fillers: [0, 5, 7, 2] },
  31: { fillers: [4, 1, 7, 6] },
  32: { fillers: [2, 4, 7, 1] },
  33: { fillers: [3, 5, 2, 6] },
  34: { fillers: [6, 1, 0, 9] },
  35: { fillers: [3, 3, 2, 8] },
  36: { fillers: [4, 5, 7, 0] },
  37: { fillers: [0, 0, 8, 5] },
  38: { fillers: [4, 3, 3, 9] },
  39: { fillers: [4, 4, 2, 6] },
  40: { fillers: [1, 2, 7, 4] },
  41: { fillers: [0, 6, 2, 3] },
  42: { fillers: [0, 8, 1, 7] },
  43: { fillers: [6, 6, 6, 1] },
  44: { fillers: [5, 0, 9, 0] },
  45: { fillers: [8, 1, 3, 1] },
  46: { fillers: [2, 3, 7, 9] },
  47: { fillers: [1, 0, 4, 7] },
  48: { fillers: [3, 7, 7, 8] },
  49: { fillers: [4, 9, 2, 9] },
  50: { fillers: [0, 2, 4, 6] },
  51: { fillers: [4, 8, 2, 2] },
  52: { fillers: [1, 7, 6, 2] },
  53: { fillers: [9, 7, 9, 2] },
  54: { fillers: [8, 6, 8, 2] },
  55: { fillers: [9, 7, 9, 0] },
  56: { fillers: [5, 7, 9, 9] },
  57: { fillers: [2, 5, 7, 0] },
  58: { fillers: [1, 6, 7, 1] },
  59: { fillers: [9, 2, 5, 5] },
  60: { fillers: [6, 3, 2, 3] },
  61: { fillers: [2, 9, 5, 5] },
  62: { fillers: [7, 3, 2, 5] },
  63: { fillers: [2, 1, 4, 9] },
  64: { fillers: [5, 0, 2, 0] },
  65: { fillers: [8, 4, 4, 3] },
  66: { fillers: [5, 4, 8, 5] },
  67: { fillers: [6, 7, 3, 3] },
  68: { fillers: [7, 7, 2, 2] },
  69: { fillers: [0, 5, 4, 2] },
  70: { fillers: [5, 6, 0, 2] },
  71: { fillers: [3, 4, 5, 7] },
  72: { fillers: [8, 4, 3, 3] },
  73: { fillers: [8, 2, 1, 2] },
  74: { fillers: [6, 1, 0, 0] },
  75: { fillers: [6, 2, 4, 4] },
  76: { fillers: [3, 3, 2, 7] },
  77: { fillers: [6, 0, 3, 5] },
  78: { fillers: [7, 3, 9, 7] },
  79: { fillers: [5, 8, 1, 4] },
  80: { fillers: [2, 5, 7, 8] },
  81: { fillers: [2, 2, 1, 8] },
  82: { fillers: [9, 7, 4, 5] },
  83: { fillers: [4, 5, 2, 9] },
  84: { fillers: [7, 0, 6, 0] },
  85: { fillers: [5, 9, 1, 3] },
  86: { fillers: [9, 7, 6, 8] },
  87: { fillers: [8, 1, 2, 8] },
  88: { fillers: [2, 0, 9, 1] },
  89: { fillers: [4, 3, 9, 3] },
  90: { fillers: [3, 3, 0, 7] },
  91: { fillers: [8, 6, 8, 5] },
  92: { fillers: [7, 1, 7, 1] },
  93: { fillers: [2, 9, 8, 7] },
  94: { fillers: [9, 0, 5, 0] },
  95: { fillers: [6, 8, 5, 9] },
  96: { fillers: [5, 4, 7, 7] },
  97: { fillers: [5, 5, 5, 1] },
  98: { fillers: [9, 3, 0, 9] },
  99: { fillers: [9, 3, 0, 4] }
};

// Build obfuscated 10-digit code from 6-digit OTP and fillers
// Filler positions: 1, 4, 6, 8 -> Real OTP at: 0, 2, 3, 5, 7, 9
window.buildReadingPremiumCode = function(raw6, fillers) {
  return '' + raw6[0] + fillers[0] + raw6[1] + raw6[2] + fillers[1] + raw6[3] + fillers[2] + raw6[4] + fillers[3] + raw6[5];
};

// Extract 6-digit OTP from 10-digit obfuscated code
// Returns null if fillers do not match
window.extractReadingPremiumOTP = function(code10, mockNumber) {
  if (!code10 || code10.length !== 10 || !/^\d{10}$/.test(code10)) return null;
  var mockData = window.READING_MOCK_CODES[parseInt(mockNumber)];
  if (!mockData || !mockData.fillers) return null;
  var f = mockData.fillers;
  if (parseInt(code10[1]) !== f[0]) return null;
  if (parseInt(code10[4]) !== f[1]) return null;
  if (parseInt(code10[6]) !== f[2]) return null;
  if (parseInt(code10[8]) !== f[3]) return null;
  return code10[0] + code10[2] + code10[3] + code10[5] + code10[7] + code10[9];
};
