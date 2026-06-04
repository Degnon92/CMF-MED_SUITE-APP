const fs = require('fs');
const path = require('path');

const query = process.argv[2];
const file = process.argv[3] || 'app.js';

if (!query) {
    console.log("Usage: node find_query.js <query> [file]");
    process.exit(1);
}

const filePath = path.join(__dirname, '..', file);
if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log(`Searching for "${query}" in ${file}...`);
lines.forEach((line, idx) => {
    if (line.toLowerCase().includes(query.toLowerCase())) {
        console.log(`${idx + 1}: ${line.trim()}`);
    }
});
