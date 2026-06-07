const fs = require('fs');
const path = require('path');

const files = {
    patients: path.join(__dirname, '..', 'patients_db.json'),
    bills: path.join(__dirname, '..', 'bills_db.json'),
    docs: path.join(__dirname, '..', 'documents_db.json')
};

console.log("\n--- ANALYZING DOCUMENTS DATABASE ---");
if (fs.existsSync(files.docs)) {
    const docs = JSON.parse(fs.readFileSync(files.docs, 'utf8'));
    const noPrenom = docs.filter(d => {
        const nom = d.patientNom || '';
        const prenom = d.patientPrenom || '';
        return nom.trim().split(/\s+/).length > 1 && (!prenom || prenom.trim() === '');
    });
    console.log(`Found ${noPrenom.length} documents with empty prenom but multi-word Nom:`);
    noPrenom.forEach(d => {
        console.log(JSON.stringify(d, null, 2));
    });
}
