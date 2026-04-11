// Listening Mock Regular Codes - NUMBER-ONLY FILLER SYSTEM
// Each mock has 4 unique filler digits inserted at fixed positions
// Input: 8-digit OTP -> Output: 12 all-digit code
// Filler positions: 1, 4, 7, 10 (0-indexed)
// Real OTP at positions: 0, 2, 3, 5, 6, 8, 9, 11
// Year is automatically added for backend validation

window.LISTENING_MOCK_PROMOCODES = {
  "01": { fillers: [4, 6, 8, 9] },
  "02": { fillers: [4, 8, 9, 5] },
  "03": { fillers: [2, 6, 8, 6] },
  "04": { fillers: [0, 8, 6, 1] },
  "05": { fillers: [1, 3, 7, 7] },
  "06": { fillers: [1, 6, 9, 8] },
  "07": { fillers: [2, 0, 4, 7] },
  "08": { fillers: [1, 2, 7, 7] },
  "09": { fillers: [3, 6, 3, 2] },
  "10": { fillers: [5, 0, 1, 4] },
  "11": { fillers: [9, 9, 3, 9] },
  "12": { fillers: [5, 7, 3, 0] },
  "13": { fillers: [0, 7, 5, 2] },
  "14": { fillers: [0, 8, 9, 2] },
  "15": { fillers: [3, 9, 7, 0] },
  "16": { fillers: [5, 9, 5, 4] },
  "17": { fillers: [0, 1, 1, 7] },
  "18": { fillers: [1, 1, 0, 0] },
  "19": { fillers: [4, 3, 7, 4] },
  "20": { fillers: [3, 6, 5, 2] },
  "20": { fillers: [7, 4, 4, 4] },
  "21": { fillers: [7, 1, 1, 6] },
  "22": { fillers: [5, 4, 4, 9] },
  "23": { fillers: [3, 2, 9, 3] },
  "24": { fillers: [3, 0, 1, 7] },
  "25": { fillers: [6, 0, 0, 8] },
  "26": { fillers: [8, 3, 2, 2] },
  "27": { fillers: [3, 4, 2, 1] },
  "28": { fillers: [8, 5, 6, 4] },
  "29": { fillers: [7, 9, 1, 8] },
  "30": { fillers: [9, 1, 0, 7] },
  "31": { fillers: [2, 5, 4, 0] },
  "32": { fillers: [9, 2, 0, 7] },
  "33": { fillers: [6, 2, 3, 6] },
  "34": { fillers: [6, 3, 1, 6] },
  "35": { fillers: [7, 1, 4, 8] },
  "36": { fillers: [8, 9, 8, 0] },
  "37": { fillers: [4, 1, 5, 8] },
  "38": { fillers: [4, 9, 5, 9] },
  "39": { fillers: [0, 1, 7, 8] },
  "40": { fillers: [6, 8, 9, 7] },
  "41": { fillers: [5, 8, 7, 6] },
  "42": { fillers: [7, 4, 8, 1] },
  "43": { fillers: [7, 6, 4, 5] },
  "44": { fillers: [0, 7, 8, 7] },
  "45": { fillers: [6, 2, 5, 0] },
  "46": { fillers: [4, 4, 0, 3] },
  "47": { fillers: [7, 1, 4, 5] },
  "48": { fillers: [0, 6, 5, 5] },
  "49": { fillers: [4, 5, 0, 6] },
  "50": { fillers: [1, 4, 1, 4] },
  "51": { fillers: [8, 6, 2, 9] },
  "52": { fillers: [5, 9, 3, 6] },
  "53": { fillers: [8, 5, 2, 1] },
  "54": { fillers: [8, 8, 9, 2] },
  "55": { fillers: [4, 9, 1, 2] },
  "56": { fillers: [3, 6, 9, 8] },
  "57": { fillers: [7, 3, 6, 1] },
  "58": { fillers: [4, 2, 3, 5] },
  "59": { fillers: [7, 6, 2, 7] },
  "60": { fillers: [7, 4, 6, 5] },
  "61": { fillers: [0, 0, 4, 2] },
  "62": { fillers: [9, 5, 9, 1] },
  "63": { fillers: [0, 0, 3, 3] },
  "64": { fillers: [8, 3, 9, 2] },
  "65": { fillers: [9, 7, 7, 8] },
  "66": { fillers: [6, 0, 2, 3] },
  "67": { fillers: [2, 2, 3, 8] },
  "68": { fillers: [4, 7, 2, 2] },
  "69": { fillers: [2, 1, 0, 1] },
  "70": { fillers: [4, 9, 9, 7] },
  "71": { fillers: [0, 3, 7, 0] },
  "72": { fillers: [6, 3, 7, 5] },
  "73": { fillers: [1, 5, 6, 6] },
  "74": { fillers: [7, 2, 0, 9] },
  "75": { fillers: [9, 1, 9, 0] },
  "76": { fillers: [6, 0, 7, 5] },
  "77": { fillers: [6, 7, 2, 5] },
  "78": { fillers: [3, 6, 0, 7] },
  "79": { fillers: [1, 6, 6, 8] },
  "80": { fillers: [6, 7, 2, 6] },
  "81": { fillers: [0, 4, 6, 8] },
  "82": { fillers: [7, 9, 3, 2] },
  "83": { fillers: [3, 0, 7, 5] },
  "84": { fillers: [8, 7, 8, 0] },
  "85": { fillers: [2, 9, 9, 2] },
  "86": { fillers: [6, 1, 0, 1] },
  "87": { fillers: [4, 8, 3, 8] },
  "88": { fillers: [4, 4, 5, 5] },
  "89": { fillers: [8, 0, 5, 3] },
  "90": { fillers: [5, 5, 8, 1] },
  "91": { fillers: [5, 3, 3, 2] },
  "92": { fillers: [8, 3, 2, 3] },
  "93": { fillers: [9, 6, 0, 2] },
  "94": { fillers: [7, 7, 7, 1] },
  "95": { fillers: [3, 1, 9, 3] },
  "96": { fillers: [8, 8, 1, 2] },
  "97": { fillers: [4, 1, 6, 3] },
  "98": { fillers: [4, 2, 2, 2] },
  "99": { fillers: [8, 0, 2, 4] }
};

// Build obfuscated 12-digit code from OTP and fillers
// Pads/trims to 8 digits. Filler positions: 1, 4, 7, 10
window.buildListeningRegularCode = function(rawOtp, fillers) {
  var raw8 = String(rawOtp).padEnd(8, '0').substring(0, 8);
  return '' + raw8[0] + fillers[0] + raw8[1] + raw8[2] + fillers[1] + raw8[3] + raw8[4] + fillers[2] + raw8[5] + raw8[6] + fillers[3] + raw8[7];
};

// Extract 8-digit OTP from 12-digit obfuscated code
// Returns null if fillers do not match
window.extractListeningRegularOTP = function(code12, mockNumber) {
  if (!code12 || code12.length !== 12 || !/^\d{12}$/.test(code12)) return null;
  var paddedMock = String(mockNumber).padStart(2, '0');
  var mockData = window.LISTENING_MOCK_PROMOCODES[paddedMock];
  if (!mockData || !mockData.fillers) return null;
  var f = mockData.fillers;
  if (parseInt(code12[1]) !== f[0]) return null;
  if (parseInt(code12[4]) !== f[1]) return null;
  if (parseInt(code12[7]) !== f[2]) return null;
  if (parseInt(code12[10]) !== f[3]) return null;
  return code12[0] + code12[2] + code12[3] + code12[5] + code12[6] + code12[8] + code12[9] + code12[11];
};
