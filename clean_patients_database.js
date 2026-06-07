const fs = require('fs');
const path = require('path');

// Configuration des chemins
const patientsDbPath = path.join(__dirname, 'patients_db.json');
const backupDbPath = path.join(__dirname, 'patients_db.backup.json');
const rejectedLogPath = path.join(__dirname, 'scratch', 'import_rejected_log.json');
const cleanLogPath = path.join(__dirname, 'scratch', 'clean_patients_log.json');

const apply = process.argv.includes('--apply');

console.log("============================================================");
console.log("Nettoyage de la base de données patients (patients_db.json)");
console.log("============================================================");
console.log(`Mode : ${apply ? 'APPLIQUER (Modifications réelles + Backup)' : 'DRY-RUN (Simulation uniquement)'}`);
console.log("============================================================");

if (!fs.existsSync(patientsDbPath)) {
    console.error(`Erreur : Le fichier patients_db.json est introuvable à l'adresse : ${patientsDbPath}`);
    process.exit(1);
}

// Charger les patients
let patients = [];
try {
    patients = JSON.parse(fs.readFileSync(patientsDbPath, 'utf8'));
} catch (e) {
    console.error("Erreur lors de la lecture ou du parsage de patients_db.json :", e);
    process.exit(1);
}

console.log(`Total patients chargés : ${patients.length}`);

// Fonction de nettoyage préliminaire du nom
function cleanPatientName(raw) {
    if (!raw || typeof raw !== 'string') return '';
    
    // 0. Enlever tout contenu entre parenthèses
    let name = raw.replace(/\(.*?\)/g, '').trim();
    
    // 1. Indices de fichier [1], [2], etc.
    name = name.replace(/\[\d+\]/g, '');
    
    // 2. Underscores initiaux et finaux
    name = name.replace(/^_+/, '').replace(/_+$/, '');
    
    // 3. Extension .docx
    name = name.replace(/\.docx$/i, '');
    
    // 4. Mentions HOSPI et FACTURE avec word boundaries
    name = name.replace(/\bHOSPI\b/gi, ' ');
    name = name.replace(/\bFACTURE\b/gi, ' ');
    
    // Retirer les préfixes CMI, CMC, CMF en début de chaîne
    name = name.replace(/^(?:CMC|CMI|CMF)\b\s*/i, '');
    
    // 5. Dates de type MOIS 202X ou 202X
    const months = ["JANVIER", "FEVRIER", "MARS", "AVRIL", "MAI", "JUIN", "JUILLET", "AOUT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DECEMBRE"];
    const monthsPattern = '\\b(' + months.join('|') + ')\\b';
    name = name.replace(new RegExp('\\s*' + monthsPattern + '\\s+\\d{4}', 'gi'), '');
    name = name.replace(/\b\d{4}\b/g, '');
    
    // 6. Nettoyer les caractères de ponctuation au début et à la fin
    name = name.replace(/^[\s\-\.\,\:\_]+/, '').replace(/[\s\-\.\,\:\_]+$/, '');
    
    // Remplacer les espaces multiples par un seul
    name = name.replace(/\s+/g, ' ');
    
    return name.trim();
}

// Fonction de validation
function isValidPatientName(name) {
    if (!name) return { valid: false, reason: "Nom vide" };
    if (name.length < 3) return { valid: false, reason: `Nom trop court (< 3 caract.): "${name}"` };
    if (name.length > 50) return { valid: false, reason: `Nom trop long (> 50 caract.): "${name}"` };
    
    const upper = name.toUpperCase();
    
    // Liste des mots-clés administratifs ou techniques
    const adminKeywords = [
        "REPONSE", "TARIFAIRE", "RAPPORT", "DOSSIER", "FACTURE", 
        "MODELE", "CONTRAT", "CURRICULUM", "LETTRE", "ENTETE", 
        "CV", "PROFORMA", "EXAMEN", "TARIF", "STOCK", "PROCEDURES", 
        "ATTENDU", "FORMATION", "FEUIL", "SHEET", "TEMPLATE", 
        "ACTES", "BILAN CLINIQUE", "HOSPI", "IMAGE", "MATERIEL",
        "ORGANOGRAMME", "COMPTE RENDU", "LISTE", "DECHARGE",
        "NOMÉ", "NOME", "PRENOM", "PRENOMS", "PATIENT", "CLIENT",
        "DIAGNOSTIC", "INTERVENTION", "TOTAL", "GRAND TOTAL"
    ];
    
    const corpKeywords = [
        "SOBEMAP", "LOTO FC", "LOTO FOOTBALL", "UNITEVA", 
        "ENERGIE BASKETBALL", "ENERGIE BASKET", "WINSU SPORTS",
        "MUTUELLE", "ASSURANCE", "SOCIETE", "SOCIÉTÉ"
    ];
    
    for (const keyword of adminKeywords) {
        if (upper.includes(keyword)) {
            return { valid: false, reason: `Contient le mot-clé administratif "${keyword}"` };
        }
    }
    
    for (const corp of corpKeywords) {
        if (upper.includes(corp)) {
            return { valid: false, reason: `Contient un mot-clé corporatif/groupe "${corp}"` };
        }
    }
    
    // Rejeter les placeholders de type "NOM...", "PRENOM..."
    if (/\bNOM\b\s*[\.\…\-\_]*/i.test(upper) || /\bPRENOM\b/i.test(upper) || /\bNOME\b/i.test(upper) || /\bPRENOMS\b/i.test(upper)) {
        return { valid: false, reason: "Contient un placeholder (NOM / PRENOM)" };
    }
    
    // Si le nom ne contient que des chiffres ou des caractères spéciaux
    if (/^[0-9\s\-_.,()[\]{}&%#@!/?+*=:]+$/.test(name)) {
        return { valid: false, reason: "Contient uniquement des chiffres ou caractères spéciaux" };
    }
    
    // Si le nom contient trop de chiffres
    const digitCount = (name.match(/\d/g) || []).length;
    if (digitCount > 2) {
        return { valid: false, reason: `Trop de chiffres (${digitCount})` };
    }
    
    return { valid: true };
}

const cleanedPatientsMap = new Map();
const rejected = [];
let totalCleanedCount = 0;

patients.forEach((p, index) => {
    const rawName = p.name || '';
    const cleanedName = cleanPatientName(rawName);
    
    const validation = isValidPatientName(cleanedName);
    if (!validation.valid) {
        rejected.push({
            raw: rawName,
            cleaned: cleanedName,
            index: index,
            reason: validation.reason
        });
        return;
    }
    
    // Nom propre en MAJUSCULES pour uniformisation
    const finalName = cleanedName.toUpperCase();
    
    const existing = cleanedPatientsMap.get(finalName);
    if (existing) {
        // Fusionner
        if (p.diagnosis && p.diagnosis.toLowerCase() !== 'bilan clinique' && !existing.diagnosis) {
            existing.diagnosis = p.diagnosis;
        }
        if (p.intervention && !existing.intervention) {
            existing.intervention = p.intervention;
        }
        if (p.kCode && !existing.kCode) {
            existing.kCode = p.kCode;
        }
    } else {
        cleanedPatientsMap.set(finalName, {
            name: finalName,
            diagnosis: (p.diagnosis && p.diagnosis.toLowerCase() !== 'bilan clinique') ? p.diagnosis : '',
            intervention: p.intervention || '',
            kCode: p.kCode || ''
        });
    }
});

const resultPatients = Array.from(cleanedPatientsMap.values());

console.log("\n--- RESULTATS DU NETTOYAGE ---");
console.log(`Patients acceptés et nettoyés : ${resultPatients.length}`);
console.log(`Patients rejetés (bruit)     : ${rejected.length}`);
console.log(`Taux de rejet                 : ${((rejected.length / patients.length) * 100).toFixed(1)} %`);

if (rejected.length > 0) {
    console.log("\nExemples de rejets (10 premiers) :");
    rejected.slice(0, 10).forEach(r => {
        console.log(`  - "${r.raw}" => Raison: ${r.reason}`);
    });
}

// Vérifications de sécurité
const rejectionRate = rejected.length / patients.length;
if (rejectionRate > 0.30) {
    console.log("\n⚠️ ATTENTION : Le taux de rejet dépasse 30% !");
}

if (apply) {
    // 1. Sauvegarde (Backup)
    try {
        fs.writeFileSync(backupDbPath, JSON.stringify(patients, null, 4), 'utf8');
        console.log(`\n✅ Backup créé avec succès dans : ${path.basename(backupDbPath)}`);
    } catch (e) {
        console.error("Impossible de créer le backup :", e);
        process.exit(1);
    }
    
    // 2. Écriture de la nouvelle base de données
    try {
        fs.writeFileSync(patientsDbPath, JSON.stringify(resultPatients, null, 4), 'utf8');
        console.log(`✅ Base de données ${path.basename(patientsDbPath)} mise à jour !`);
    } catch (e) {
        console.error("Impossible de sauvegarder la base de données nettoyée :", e);
        process.exit(1);
    }
    
    // 3. Écriture des logs de rejets
    try {
        fs.mkdirSync(path.join(__dirname, 'scratch'), { recursive: true });
        
        const logContent = {
            date: new Date().toISOString(),
            total_initial: patients.length,
            total_final: resultPatients.length,
            total_rejected: rejected.length,
            rejections: rejected
        };
        
        fs.writeFileSync(rejectedLogPath, JSON.stringify(logContent, null, 4), 'utf8');
        fs.writeFileSync(cleanLogPath, JSON.stringify(logContent, null, 4), 'utf8');
        console.log(`✅ Journal des rejets écrit dans : scratch/import_rejected_log.json et scratch/clean_patients_log.json`);
    } catch (e) {
        console.error("Impossible d'écrire le journal des rejets :", e);
    }
    
    console.log("\nNettoyage physique terminé avec succès !");
} else {
    console.log("\nPour appliquer ces modifications, relancez le script avec l'option --apply :");
    console.log("node clean_patients_database.js --apply");
}
console.log("============================================================");
