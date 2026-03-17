// Writing Mock Regular Codes - NUMBER-ONLY FILLER SYSTEM
// Each mock has 4 unique filler digits inserted at fixed positions
// Input: 8-digit OTP -> Output: 12 all-digit code
// Filler positions: 1, 4, 7, 10 (0-indexed)
// Real OTP at positions: 0, 2, 3, 5, 6, 8, 9, 11
// Year is automatically added for backend validation

window.WRITING_MOCK_PROMOCODES = {
  "01": { fillers: [5, 0, 7, 8] },
  "02": { fillers: [9, 7, 8, 2] },
  "03": { fillers: [0, 3, 4, 8] },
  "04": { fillers: [3, 3, 9, 6] },
  "05": { fillers: [0, 9, 5, 6] },
  "06": { fillers: [5, 3, 0, 0] },
  "07": { fillers: [8, 6, 7, 7] },
  "08": { fillers: [5, 5, 1, 2] },
  "09": { fillers: [8, 3, 1, 1] },
  "10": { fillers: [9, 2, 2, 5] },
  "11": { fillers: [8, 9, 9, 3] },
  "12": { fillers: [5, 4, 8, 3] },
  "13": { fillers: [2, 2, 0, 1] },
  "14": { fillers: [3, 2, 1, 5] },
  "15": { fillers: [9, 9, 7, 2] },
  "16": { fillers: [9, 6, 4, 8] },
  "17": { fillers: [9, 0, 8, 2] },
  "18": { fillers: [9, 8, 5, 4] },
  "19": { fillers: [9, 0, 4, 2] },
  "20": { fillers: [5, 2, 6, 0] },
  "21": { fillers: [0, 1, 8, 9] },
  "22": { fillers: [9, 9, 5, 3] },
  "23": { fillers: [2, 0, 6, 8] },
  "24": { fillers: [8, 6, 3, 7] },
  "25": { fillers: [2, 6, 5, 6] },
  "26": { fillers: [3, 6, 5, 0] },
  "27": { fillers: [5, 0, 5, 9] },
  "28": { fillers: [8, 7, 2, 3] },
  "29": { fillers: [6, 0, 0, 0] },
  "30": { fillers: [2, 8, 7, 8] },
  "31": { fillers: [8, 3, 8, 5] },
  "32": { fillers: [0, 5, 9, 0] },
  "33": { fillers: [9, 4, 1, 1] },
  "34": { fillers: [0, 3, 7, 2] },
  "35": { fillers: [5, 6, 7, 9] },
  "36": { fillers: [1, 2, 9, 1] },
  "37": { fillers: [7, 4, 5, 4] },
  "38": { fillers: [3, 4, 7, 4] },
  "39": { fillers: [5, 0, 7, 0] },
  "40": { fillers: [3, 3, 1, 2] },
  "41": { fillers: [3, 2, 9, 9] },
  "42": { fillers: [4, 6, 3, 2] },
  "43": { fillers: [8, 8, 5, 3] },
  "44": { fillers: [4, 2, 0, 6] },
  "45": { fillers: [2, 2, 6, 1] },
  "46": { fillers: [9, 2, 0, 3] },
  "47": { fillers: [6, 9, 7, 2] },
  "48": { fillers: [6, 9, 1, 6] },
  "49": { fillers: [3, 0, 2, 2] },
  "50": { fillers: [0, 2, 0, 9] },
  "51": { fillers: [3, 0, 9, 0] },
  "52": { fillers: [0, 0, 8, 8] },
  "53": { fillers: [0, 5, 0, 7] },
  "54": { fillers: [7, 9, 1, 6] },
  "55": { fillers: [9, 6, 1, 0] },
  "56": { fillers: [3, 1, 1, 1] },
  "57": { fillers: [6, 6, 8, 0] },
  "58": { fillers: [2, 9, 7, 2] },
  "59": { fillers: [8, 1, 4, 6] },
  "60": { fillers: [1, 4, 9, 1] },
  "61": { fillers: [6, 9, 8, 3] },
  "62": { fillers: [9, 4, 2, 2] },
  "63": { fillers: [2, 3, 5, 8] },
  "64": { fillers: [3, 3, 4, 3] },
  "65": { fillers: [2, 2, 1, 2] },
  "66": { fillers: [8, 1, 3, 4] },
  "67": { fillers: [2, 1, 9, 4] },
  "68": { fillers: [0, 2, 4, 9] },
  "69": { fillers: [9, 6, 7, 5] },
  "70": { fillers: [2, 0, 6, 9] },
  "71": { fillers: [1, 4, 9, 5] },
  "72": { fillers: [9, 0, 2, 2] },
  "73": { fillers: [3, 7, 3, 2] },
  "74": { fillers: [1, 4, 8, 1] },
  "75": { fillers: [7, 0, 4, 9] },
  "76": { fillers: [1, 1, 3, 1] },
  "77": { fillers: [2, 8, 2, 9] },
  "78": { fillers: [8, 8, 9, 6] },
  "79": { fillers: [3, 2, 3, 4] },
  "80": { fillers: [2, 9, 1, 8] },
  "81": { fillers: [9, 9, 2, 7] },
  "82": { fillers: [6, 6, 8, 4] },
  "83": { fillers: [9, 9, 9, 8] },
  "84": { fillers: [3, 1, 3, 6] },
  "85": { fillers: [5, 8, 8, 9] },
  "86": { fillers: [1, 7, 8, 9] },
  "87": { fillers: [3, 7, 8, 8] },
  "88": { fillers: [2, 6, 6, 1] },
  "89": { fillers: [6, 4, 7, 3] },
  "90": { fillers: [7, 4, 1, 3] },
  "91": { fillers: [1, 6, 2, 7] },
  "92": { fillers: [3, 3, 1, 1] },
  "93": { fillers: [3, 5, 3, 5] },
  "94": { fillers: [8, 1, 6, 7] },
  "95": { fillers: [2, 0, 0, 9] },
  "96": { fillers: [3, 5, 6, 9] },
  "97": { fillers: [6, 5, 0, 1] },
  "98": { fillers: [8, 1, 1, 6] },
  "99": { fillers: [6, 3, 9, 0] }
};

// Build obfuscated 12-digit code from 8-digit OTP and fillers
// Filler positions: 1, 4, 7, 10 -> Real OTP at: 0, 2, 3, 5, 6, 8, 9, 11
window.buildWritingRegularCode = function(raw8, fillers) {
  return '' + raw8[0] + fillers[0] + raw8[1] + raw8[2] + fillers[1] + raw8[3] + raw8[4] + fillers[2] + raw8[5] + raw8[6] + fillers[3] + raw8[7];
};

// Extract 8-digit OTP from 12-digit obfuscated code
// Returns null if fillers do not match
window.extractWritingRegularOTP = function(code12, mockNumber) {
  if (!code12 || code12.length !== 12 || !/^\d{12}$/.test(code12)) return null;
  var paddedMock = String(mockNumber).padStart(2, '0');
  var mockData = window.WRITING_MOCK_PROMOCODES[paddedMock];
  if (!mockData || !mockData.fillers) return null;
  var f = mockData.fillers;
  if (parseInt(code12[1]) !== f[0]) return null;
  if (parseInt(code12[4]) !== f[1]) return null;
  if (parseInt(code12[7]) !== f[2]) return null;
  if (parseInt(code12[10]) !== f[3]) return null;
  return code12[0] + code12[2] + code12[3] + code12[5] + code12[6] + code12[8] + code12[9] + code12[11];
};
