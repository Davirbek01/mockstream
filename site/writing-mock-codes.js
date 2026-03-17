// Writing Mock Premium Codes - NUMBER-ONLY FILLER SYSTEM
// Each mock has 4 unique filler digits inserted at fixed positions
// Input: 6-digit OTP -> Output: 10 all-digit code
// Filler positions: 1, 4, 6, 8 (0-indexed)
// Real OTP at positions: 0, 2, 3, 5, 7, 9

window.WRITING_MOCK_CODES = {
  1: { fillers: [1, 3, 9, 1] },
  2: { fillers: [1, 1, 7, 1] },
  3: { fillers: [8, 4, 9, 0] },
  4: { fillers: [8, 8, 5, 7] },
  5: { fillers: [0, 2, 1, 2] },
  6: { fillers: [9, 0, 6, 4] },
  7: { fillers: [9, 7, 2, 0] },
  8: { fillers: [4, 9, 1, 5] },
  9: { fillers: [9, 4, 3, 6] },
  10: { fillers: [4, 2, 7, 4] },
  11: { fillers: [8, 8, 6, 9] },
  12: { fillers: [2, 4, 1, 9] },
  13: { fillers: [4, 5, 6, 6] },
  14: { fillers: [5, 8, 7, 1] },
  15: { fillers: [0, 6, 2, 1] },
  16: { fillers: [7, 7, 0, 1] },
  17: { fillers: [2, 0, 1, 7] },
  18: { fillers: [4, 5, 0, 8] },
  19: { fillers: [5, 6, 2, 1] },
  20: { fillers: [2, 1, 7, 9] },
  21: { fillers: [6, 8, 9, 5] },
  22: { fillers: [1, 3, 3, 0] },
  23: { fillers: [5, 3, 6, 7] },
  24: { fillers: [2, 0, 2, 5] },
  25: { fillers: [9, 9, 2, 9] },
  26: { fillers: [4, 2, 6, 8] },
  27: { fillers: [5, 7, 4, 3] },
  28: { fillers: [1, 2, 8, 2] },
  29: { fillers: [3, 1, 2, 4] },
  30: { fillers: [2, 1, 9, 8] },
  31: { fillers: [8, 4, 5, 4] },
  32: { fillers: [0, 4, 3, 2] },
  33: { fillers: [4, 4, 6, 8] },
  34: { fillers: [1, 8, 7, 3] },
  35: { fillers: [8, 1, 6, 0] },
  36: { fillers: [1, 8, 3, 5] },
  37: { fillers: [1, 5, 2, 8] },
  38: { fillers: [9, 8, 8, 0] },
  39: { fillers: [2, 8, 4, 4] },
  40: { fillers: [5, 2, 6, 6] },
  41: { fillers: [2, 1, 3, 4] },
  42: { fillers: [1, 2, 6, 4] },
  43: { fillers: [1, 4, 1, 2] },
  44: { fillers: [7, 9, 1, 9] },
  45: { fillers: [1, 5, 5, 9] },
  46: { fillers: [2, 4, 4, 1] },
  47: { fillers: [0, 9, 8, 0] },
  48: { fillers: [0, 3, 5, 3] },
  49: { fillers: [9, 5, 8, 7] },
  50: { fillers: [8, 1, 1, 4] },
  51: { fillers: [2, 4, 0, 3] },
  52: { fillers: [5, 3, 4, 0] },
  53: { fillers: [5, 9, 7, 0] },
  54: { fillers: [7, 3, 3, 8] },
  55: { fillers: [3, 6, 2, 3] },
  56: { fillers: [7, 2, 1, 2] },
  57: { fillers: [2, 0, 0, 1] },
  58: { fillers: [9, 5, 1, 9] },
  59: { fillers: [7, 3, 6, 3] },
  60: { fillers: [8, 1, 9, 9] },
  61: { fillers: [7, 9, 8, 9] },
  62: { fillers: [0, 3, 8, 4] },
  63: { fillers: [8, 9, 4, 1] },
  64: { fillers: [9, 0, 7, 7] },
  65: { fillers: [1, 0, 4, 5] },
  66: { fillers: [1, 4, 1, 8] },
  67: { fillers: [5, 3, 2, 8] },
  68: { fillers: [6, 4, 0, 1] },
  69: { fillers: [0, 4, 4, 3] },
  70: { fillers: [6, 1, 3, 4] },
  71: { fillers: [6, 3, 4, 7] },
  72: { fillers: [5, 0, 6, 6] },
  73: { fillers: [5, 9, 6, 2] },
  74: { fillers: [3, 7, 4, 1] },
  75: { fillers: [0, 2, 3, 5] },
  76: { fillers: [1, 5, 5, 2] },
  77: { fillers: [2, 6, 2, 6] },
  78: { fillers: [1, 5, 2, 0] },
  79: { fillers: [4, 3, 4, 6] },
  80: { fillers: [7, 8, 0, 7] },
  81: { fillers: [1, 5, 4, 6] },
  82: { fillers: [0, 2, 3, 8] },
  83: { fillers: [9, 8, 2, 4] },
  84: { fillers: [2, 7, 9, 2] },
  85: { fillers: [5, 1, 1, 3] },
  86: { fillers: [1, 5, 0, 1] },
  87: { fillers: [2, 9, 1, 3] },
  88: { fillers: [2, 0, 2, 2] },
  89: { fillers: [3, 6, 6, 9] },
  90: { fillers: [5, 3, 4, 7] },
  91: { fillers: [1, 9, 0, 6] },
  92: { fillers: [6, 9, 2, 0] },
  93: { fillers: [1, 0, 9, 4] },
  94: { fillers: [4, 9, 2, 1] },
  95: { fillers: [5, 7, 0, 6] },
  96: { fillers: [5, 8, 2, 7] },
  97: { fillers: [0, 0, 6, 8] },
  98: { fillers: [0, 6, 9, 8] },
  99: { fillers: [1, 3, 7, 9] }
};

// Build obfuscated 10-digit code from 6-digit OTP and fillers
// Filler positions: 1, 4, 6, 8 -> Real OTP at: 0, 2, 3, 5, 7, 9
window.buildWritingPremiumCode = function(raw6, fillers) {
  return '' + raw6[0] + fillers[0] + raw6[1] + raw6[2] + fillers[1] + raw6[3] + fillers[2] + raw6[4] + fillers[3] + raw6[5];
};

// Extract 6-digit OTP from 10-digit obfuscated code
// Returns null if fillers do not match
window.extractWritingPremiumOTP = function(code10, mockNumber) {
  if (!code10 || code10.length !== 10 || !/^\d{10}$/.test(code10)) return null;
  var mockData = window.WRITING_MOCK_CODES[parseInt(mockNumber)];
  if (!mockData || !mockData.fillers) return null;
  var f = mockData.fillers;
  if (parseInt(code10[1]) !== f[0]) return null;
  if (parseInt(code10[4]) !== f[1]) return null;
  if (parseInt(code10[6]) !== f[2]) return null;
  if (parseInt(code10[8]) !== f[3]) return null;
  return code10[0] + code10[2] + code10[3] + code10[5] + code10[7] + code10[9];
};
