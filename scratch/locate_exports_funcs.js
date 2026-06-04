const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'exports.js');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log("=== FUNCTIONS IN exports.js ===");
lines.forEach((line, idx) => {
    if (line.includes('function ') || line.includes(' = function') || line.includes('=>')) {
        const trimmed = line.trim();
        if (trimmed.startsWith('function') || trimmed.includes('function ') || trimmed.includes('=>')) {
            if (!trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
                console.log(`${idx + 1}: ${trimmed}`);
            }
        }
    }
});
