const fs = require('fs');
const path = require('path');

const start = parseInt(process.argv[2]);
const end = parseInt(process.argv[3]);

if (!start || !end) {
    console.log("Usage: node print_lines.js <startLine> <endLine>");
    process.exit(1);
}

const filePath = path.join(__dirname, '..', 'app.js');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

for (let i = start - 1; i < end; i++) {
    if (lines[i] !== undefined) {
        console.log(`${i + 1}: ${lines[i]}`);
    }
}
