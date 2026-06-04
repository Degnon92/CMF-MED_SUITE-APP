const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'billing.js');
if (!fs.existsSync(filePath)) {
    console.log("billing.js not found!");
    process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Ranges to replace (1-based, inclusive)
const ranges = [
    { start: 525, end: 527, label: "// [Extracted to billing_utils.js] - formatCurrency()" },
    { start: 530, end: 532, label: "// [Extracted to billing_utils.js] - formatGridNumber()" },
    { start: 959, end: 1024, label: "// [Extracted to billing_utils.js] - numberToFrenchWords()" },
    { start: 1027, end: 1155, label: "// [Extracted to billing_packages.js] - autoFillKCodeFromIntervention()" },
    { start: 1158, end: 1257, label: "// [Extracted to billing_packages.js] - autoLoadPackageFromIntervention()" }
];

// Sort ranges in descending order of start line to avoid index shift
ranges.sort((a, b) => b.start - a.start);

ranges.forEach(range => {
    const count = range.end - range.start + 1;
    const startIdx = range.start - 1;
    lines.splice(startIdx, count, range.label);
});

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log(`Successfully cleaned billing.js! New line count: ${lines.length}`);
