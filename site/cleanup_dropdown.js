const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'IELTS Speaking Mocks.html');
const content = fs.readFileSync(filePath, 'utf8');

// Split by newline, preserve type
const lines = content.split(/\r?\n/);
let outputLines = [];

for (let i = 0; i < lines.length; i++) {
    const lineIndex = i; // 0-based index corresponds to line number i+1

    // Choose Mock Option (Line 2943, 2944) -> Index 2942, 2943
    // Mock 01 Option (Line 2945, 2946) -> Index 2944, 2945
    // Mock 02 Option (Line 2947) -> Index 2946 ...

    // Replace Mock 01 line (Index 2944)
    if (lineIndex === 2944) {
        outputLines.push('          <option value="questions IELTS S/ielts-speaking-mock-1.js" style="background:white;color:#10b981;font-weight:600;">✓ Mock 01');
        continue;
    }

    // Remove from index 2946 up to index 3143 (Line 3144)
    // Line 3144 is the end of Mock 100 option.
    if (lineIndex >= 2946 && lineIndex <= 3143) {
        continue;
    }

    outputLines.push(lines[i]);
}

// Write back with consistent newlines (LF or CRLF based on platform, but here we just use what node defaults to or convert to LF)
// Using .join('\n') creates LF files usually.
fs.writeFileSync(filePath, outputLines.join('\n'), 'utf8');
console.log('Cleanup complete');
