// Speaking Mock Regular Codes - NUMBER-ONLY FILLER SYSTEM
// Each mock has 4 unique filler digits inserted at fixed positions
// Input: 8-digit OTP -> Output: 12 all-digit code
// Filler positions: 1, 4, 7, 10 (0-indexed)
// Real OTP at positions: 0, 2, 3, 5, 6, 8, 9, 11
// Year is automatically added for backend validation

window.SPEAKING_MOCK_PROMOCODES = {
  "01": { fillers: [1, 0, 4, 3] },
  "02": { fillers: [3, 2, 1, 8] },
  "03": { fillers: [1, 9, 6, 0] },
  "04": { fillers: [0, 1, 3, 3] },
  "05": { fillers: [8, 9, 0, 8] },
  "06": { fillers: [3, 8, 6, 3] },
  "07": { fillers: [7, 9, 4, 0] },
  "08": { fillers: [2, 6, 5, 4] },
  "09": { fillers: [2, 3, 5, 1] },
  "10": { fillers: [1, 6, 1, 5] },
  "11": { fillers: [5, 9, 4, 0] },
  "12": { fillers: [7, 8, 1, 6] },
  "13": { fillers: [1, 8, 4, 9] },
  "14": { fillers: [5, 9, 3, 1] },
  "15": { fillers: [0, 3, 4, 1] },
  "16": { fillers: [3, 1, 6, 4] },
  "17": { fillers: [7, 5, 2, 5] },
  "18": { fillers: [5, 3, 4, 1] },
  "19": { fillers: [9, 2, 8, 3] },
  "20": { fillers: [2, 7, 6, 4] },
  "21": { fillers: [8, 3, 5, 0] },
  "22": { fillers: [3, 0, 5, 6] },
  "23": { fillers: [4, 1, 3, 9] },
  "24": { fillers: [5, 3, 7, 6] },
  "25": { fillers: [7, 2, 4, 2] },
  "26": { fillers: [3, 8, 8, 4] },
  "27": { fillers: [9, 6, 9, 6] },
  "28": { fillers: [5, 3, 2, 8] },
  "29": { fillers: [7, 1, 0, 1] },
  "30": { fillers: [2, 2, 6, 9] },
  "31": { fillers: [1, 6, 6, 9] },
  "32": { fillers: [7, 8, 4, 8] },
  "33": { fillers: [0, 1, 8, 4] },
  "34": { fillers: [5, 1, 4, 6] },
  "35": { fillers: [2, 7, 0, 4] },
  "36": { fillers: [8, 2, 8, 1] },
  "37": { fillers: [4, 8, 9, 3] },
  "38": { fillers: [2, 5, 2, 8] },
  "39": { fillers: [8, 0, 9, 5] },
  "40": { fillers: [7, 0, 1, 5] },
  "41": { fillers: [4, 3, 0, 3] },
  "42": { fillers: [9, 1, 1, 7] },
  "43": { fillers: [1, 8, 2, 2] },
  "44": { fillers: [7, 8, 2, 4] },
  "45": { fillers: [8, 9, 6, 3] },
  "46": { fillers: [8, 3, 4, 6] },
  "47": { fillers: [5, 7, 8, 7] },
  "48": { fillers: [1, 3, 3, 1] },
  "49": { fillers: [5, 0, 9, 8] },
  "50": { fillers: [3, 9, 3, 0] },
  "51": { fillers: [1, 0, 3, 1] },
  "52": { fillers: [0, 5, 1, 8] },
  "53": { fillers: [3, 4, 7, 3] },
  "54": { fillers: [8, 2, 9, 9] },
  "55": { fillers: [7, 3, 7, 6] },
  "56": { fillers: [3, 1, 1, 6] },
  "57": { fillers: [5, 6, 6, 7] },
  "58": { fillers: [0, 1, 0, 6] },
  "59": { fillers: [5, 1, 3, 3] },
  "60": { fillers: [3, 8, 7, 2] },
  "61": { fillers: [6, 2, 4, 7] },
  "62": { fillers: [3, 1, 7, 8] },
  "63": { fillers: [1, 0, 8, 0] },
  "64": { fillers: [1, 3, 2, 6] },
  "65": { fillers: [7, 7, 3, 6] },
  "66": { fillers: [0, 2, 6, 0] },
  "67": { fillers: [6, 4, 7, 4] },
  "68": { fillers: [6, 8, 7, 2] },
  "69": { fillers: [3, 4, 3, 0] },
  "70": { fillers: [9, 8, 0, 5] },
  "71": { fillers: [0, 0, 9, 7] },
  "72": { fillers: [8, 8, 2, 0] },
  "73": { fillers: [8, 1, 2, 1] },
  "74": { fillers: [9, 1, 3, 6] },
  "75": { fillers: [1, 9, 3, 9] },
  "76": { fillers: [9, 0, 9, 1] },
  "77": { fillers: [6, 9, 9, 8] },
  "78": { fillers: [5, 4, 3, 5] },
  "79": { fillers: [3, 4, 6, 2] },
  "80": { fillers: [4, 7, 5, 1] },
  "81": { fillers: [0, 7, 9, 9] },
  "82": { fillers: [1, 1, 8, 3] },
  "83": { fillers: [8, 4, 2, 5] },
  "84": { fillers: [1, 3, 5, 4] },
  "85": { fillers: [2, 7, 8, 4] },
  "86": { fillers: [9, 8, 0, 8] },
  "87": { fillers: [4, 1, 2, 4] },
  "88": { fillers: [1, 1, 8, 2] },
  "89": { fillers: [4, 4, 9, 3] },
  "90": { fillers: [5, 3, 4, 8] },
  "91": { fillers: [7, 4, 0, 1] },
  "92": { fillers: [6, 4, 0, 0] },
  "93": { fillers: [5, 2, 4, 2] },
  "94": { fillers: [7, 8, 6, 8] },
  "95": { fillers: [0, 1, 1, 2] },
  "96": { fillers: [8, 0, 5, 9] },
  "97": { fillers: [8, 2, 6, 2] },
  "98": { fillers: [0, 4, 5, 0] },
  "99": { fillers: [5, 3, 3, 1] }
};

// Build obfuscated 12-digit code from OTP and fillers
// Pads/trims to 8 digits. Filler positions: 1, 4, 7, 10
window.buildSpeakingRegularCode = function(rawOtp, fillers) {
  var raw8 = String(rawOtp).padEnd(8, '0').substring(0, 8);
  return '' + raw8[0] + fillers[0] + raw8[1] + raw8[2] + fillers[1] + raw8[3] + raw8[4] + fillers[2] + raw8[5] + raw8[6] + fillers[3] + raw8[7];
};

// Extract 8-digit OTP from 12-digit obfuscated code
// Returns null if fillers do not match
window.extractSpeakingRegularOTP = function(code12, mockNumber) {
  if (!code12 || code12.length !== 12 || !/^\d{12}$/.test(code12)) return null;
  var paddedMock = String(mockNumber).padStart(2, '0');
  var mockData = window.SPEAKING_MOCK_PROMOCODES[paddedMock];
  if (!mockData || !mockData.fillers) return null;
  var f = mockData.fillers;
  if (parseInt(code12[1]) !== f[0]) return null;
  if (parseInt(code12[4]) !== f[1]) return null;
  if (parseInt(code12[7]) !== f[2]) return null;
  if (parseInt(code12[10]) !== f[3]) return null;
  return code12[0] + code12[2] + code12[3] + code12[5] + code12[6] + code12[8] + code12[9] + code12[11];
};
