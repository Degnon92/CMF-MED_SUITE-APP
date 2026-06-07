const fs = require('fs');
const path = require('path');

const docPath = path.join(__dirname, '..', 'documents_db.json');
if (fs.existsSync(docPath)) {
    const docs = JSON.parse(fs.readFileSync(docPath, 'utf8'));
    const doc = docs.find(d => d.id === 'DOC-REAL-AUTO-254');
    console.log(JSON.stringify(doc, null, 2));
}
