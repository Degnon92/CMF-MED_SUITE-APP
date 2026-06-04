const fs = require('fs');
const path = require('path');

const files = [
    'app.js',
    'billing.js',
    'documents.js',
    'exports.js',
    'database.js',
    'styles.css',
    'index.html',
    'billing_calculations.js',
    'print_templates.js'
];

files.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').length;
        const sizeBytes = fs.statSync(filePath).size;
        console.log(`${file}: ${lines} lines, ${(sizeBytes / 1024).toFixed(1)} KB`);
    } else {
        console.log(`${file}: NOT FOUND`);
    }
});
