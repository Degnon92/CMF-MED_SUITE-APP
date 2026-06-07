const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'bills_db.json');
if (fs.existsSync(dbPath)) {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const matches = db.filter(b => JSON.stringify(b).toUpperCase().includes('FEUIL'));
    console.log(`Found ${matches.length} matching bills in bills_db.json:`);
    matches.forEach(b => {
        console.log(`- ID: ${b.id}, Nom: ${b.patientNom}, Prenom: ${b.patientPrenom}, Ref: ${b.reference}`);
    });
} else {
    console.log("bills_db.json does not exist at " + dbPath);
}
