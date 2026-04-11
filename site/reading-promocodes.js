// Reading Mock Regular Codes - NUMBER-ONLY FILLER SYSTEM
// Each mock has 4 unique filler digits inserted at fixed positions
// Input: 8-digit OTP -> Output: 12 all-digit code
// Filler positions: 1, 4, 7, 10 (0-indexed)
// Real OTP at positions: 0, 2, 3, 5, 6, 8, 9, 11
// Year is automatically added for backend validation

window.READING_MOCK_PROMOCODES = {
  "01": { fillers: [5, 7, 9, 7] },
  "02": { fillers: [6, 6, 7, 6] },
  "03": { fillers: [2, 9, 3, 5] },
  "04": { fillers: [6, 1, 3, 5] },
  "05": { fillers: [3, 2, 7, 6] },
  "06": { fillers: [8, 3, 6, 6] },
  "07": { fillers: [2, 2, 4, 1] },
  "08": { fillers: [6, 9, 6, 3] },
  "09": { fillers: [9, 6, 7, 3] },
  "10": { fillers: [0, 2, 8, 2] },
  "11": { fillers: [7, 7, 3, 2] },
  "12": { fillers: [3, 7, 7, 3] },
  "13": { fillers: [9, 2, 7, 3] },
  "14": { fillers: [2, 7, 4, 4] },
  "15": { fillers: [7, 7, 1, 7] },
  "16": { fillers: [1, 7, 0, 6] },
  "17": { fillers: [9, 2, 7, 6] },
  "18": { fillers: [0, 4, 3, 4] },
  "19": { fillers: [2, 9, 9, 1] },
  "20": { fillers: [2, 3, 8, 3] },
  "21": { fillers: [4, 1, 9, 6] },
  "22": { fillers: [5, 9, 5, 9] },
  "23": { fillers: [1, 3, 2, 8] },
  "24": { fillers: [5, 2, 1, 2] },
  "25": { fillers: [2, 5, 4, 5] },
  "26": { fillers: [3, 0, 3, 5] },
  "27": { fillers: [0, 8, 7, 6] },
  "28": { fillers: [4, 2, 2, 8] },
  "29": { fillers: [2, 2, 9, 1] },
  "30": { fillers: [7, 5, 5, 0] },
  "31": { fillers: [1, 7, 4, 3] },
  "32": { fillers: [3, 5, 5, 7] },
  "33": { fillers: [9, 0, 3, 4] },
  "34": { fillers: [3, 4, 4, 8] },
  "35": { fillers: [7, 8, 4, 5] },
  "36": { fillers: [3, 5, 1, 1] },
  "37": { fillers: [0, 8, 0, 0] },
  "38": { fillers: [7, 3, 9, 9] },
  "39": { fillers: [8, 4, 4, 8] },
  "40": { fillers: [4, 8, 9, 4] },
  "41": { fillers: [7, 4, 0, 6] },
  "42": { fillers: [6, 7, 1, 9] },
  "43": { fillers: [3, 7, 5, 7] },
  "44": { fillers: [6, 4, 1, 6] },
  "45": { fillers: [6, 9, 4, 0] },
  "46": { fillers: [6, 6, 4, 8] },
  "47": { fillers: [5, 5, 6, 9] },
  "48": { fillers: [3, 3, 0, 4] },
  "49": { fillers: [7, 1, 5, 6] },
  "50": { fillers: [1, 4, 4, 6] },
  "51": { fillers: [7, 9, 2, 6] },
  "52": { fillers: [0, 9, 6, 4] },
  "53": { fillers: [9, 8, 4, 9] },
  "54": { fillers: [3, 6, 6, 7] },
  "55": { fillers: [5, 2, 5, 2] },
  "56": { fillers: [0, 8, 1, 4] },
  "57": { fillers: [6, 3, 8, 2] },
  "58": { fillers: [4, 2, 3, 6] },
  "59": { fillers: [1, 8, 0, 4] },
  "60": { fillers: [5, 9, 2, 2] },
  "61": { fillers: [2, 3, 0, 9] },
  "62": { fillers: [2, 4, 5, 8] },
  "63": { fillers: [0, 7, 5, 9] },
  "64": { fillers: [0, 1, 2, 5] },
  "65": { fillers: [4, 6, 0, 3] },
  "66": { fillers: [7, 3, 7, 4] },
  "67": { fillers: [9, 7, 0, 5] },
  "68": { fillers: [6, 6, 1, 1] },
  "69": { fillers: [5, 6, 7, 8] },
  "70": { fillers: [1, 9, 4, 1] },
  "71": { fillers: [7, 5, 6, 5] },
  "72": { fillers: [3, 4, 4, 2] },
  "73": { fillers: [6, 5, 6, 1] },
  "74": { fillers: [6, 0, 1, 2] },
  "75": { fillers: [6, 4, 6, 4] },
  "76": { fillers: [8, 3, 8, 0] },
  "77": { fillers: [1, 6, 9, 6] },
  "78": { fillers: [3, 6, 0, 9] },
  "79": { fillers: [0, 1, 2, 3] },
  "80": { fillers: [7, 8, 1, 5] },
  "81": { fillers: [2, 6, 9, 0] },
  "82": { fillers: [4, 2, 4, 7] },
  "83": { fillers: [4, 7, 3, 0] },
  "84": { fillers: [1, 7, 2, 1] },
  "85": { fillers: [4, 9, 9, 5] },
  "86": { fillers: [5, 9, 9, 1] },
  "87": { fillers: [9, 3, 0, 5] },
  "88": { fillers: [1, 1, 4, 2] },
  "89": { fillers: [8, 1, 5, 2] },
  "90": { fillers: [3, 9, 4, 9] },
  "91": { fillers: [4, 4, 2, 0] },
  "92": { fillers: [1, 7, 0, 8] },
  "93": { fillers: [9, 3, 3, 5] },
  "94": { fillers: [5, 2, 0, 8] },
  "95": { fillers: [9, 1, 7, 2] },
  "96": { fillers: [9, 0, 1, 1] },
  "97": { fillers: [2, 5, 7, 3] },
  "98": { fillers: [7, 2, 2, 0] },
  "99": { fillers: [6, 3, 8, 3] }
};

// Build obfuscated 12-digit code from OTP and fillers
// Pads/trims to 8 digits. Filler positions: 1, 4, 7, 10
window.buildReadingRegularCode = function(rawOtp, fillers) {
  var raw8 = String(rawOtp).padEnd(8, '0').substring(0, 8);
  return '' + raw8[0] + fillers[0] + raw8[1] + raw8[2] + fillers[1] + raw8[3] + raw8[4] + fillers[2] + raw8[5] + raw8[6] + fillers[3] + raw8[7];
};

// Extract 8-digit OTP from 12-digit obfuscated code
// Returns null if fillers do not match
window.extractReadingRegularOTP = function(code12, mockNumber) {
  if (!code12 || code12.length !== 12 || !/^\d{12}$/.test(code12)) return null;
  var paddedMock = String(mockNumber).padStart(2, '0');
  var mockData = window.READING_MOCK_PROMOCODES[paddedMock];
  if (!mockData || !mockData.fillers) return null;
  var f = mockData.fillers;
  if (parseInt(code12[1]) !== f[0]) return null;
  if (parseInt(code12[4]) !== f[1]) return null;
  if (parseInt(code12[7]) !== f[2]) return null;
  if (parseInt(code12[10]) !== f[3]) return null;
  return code12[0] + code12[2] + code12[3] + code12[5] + code12[6] + code12[8] + code12[9] + code12[11];
};
