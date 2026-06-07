/* ============================================================
   app_database.js - Persistance Physique, Nettoyage & Assainissement
   ============================================================ */

function cleanPatientName(name) {
    if (!name || typeof name !== 'string') return '';
    
    // 0. Enlever tout contenu entre parenthèses
    let clean = name.replace(/\(.*?\)/g, '').trim();
    
    // Étape 0 — Nettoyage structurel et préliminaire (rejets de bruit)
    clean = clean.replace(/\[\d+\]/g, ''); // Supprime les indices de fichier (ex: [1])
    clean = clean.replace(/^_+/, '');      // Supprime les underscores initiaux
    clean = clean.replace(/\.docx$/i, ''); // Supprime l'extension .docx
    clean = clean.replace(/\s*\bHOSPI\b\s*/gi, ' '); // Supprime la mention HOSPI
    clean = clean.replace(/\s*\bFACTURE\b\s*/gi, ' '); // Supprime la mention FACTURE
    
    // Retirer les préfixes CMI, CMC, CMF en début de chaîne
    clean = clean.replace(/^(?:CMC|CMI|CMF)\b\s*/i, '');
    
    // Supprime les dates de type "MOIS 202X" ou "202X" avec word boundary
    const monthsPattern = '\\b(JANVIER|FEVRIER|MARS|AVRIL|MAI|JUIN|JUILLET|AOUT|SEPTEMBRE|OCTOBRE|NOVEMBRE|DECEMBRE)\\b';
    clean = clean.replace(new RegExp('\\s*' + monthsPattern + '\\s+\\d{4}', 'gi'), '');
    clean = clean.replace(/\s*\b\d{4}\b/g, '');
    clean = clean.trim();
    
    const prefixPatterns = [
        /^(?:CERTIFICAT\s+DE\s+MARIAGE|CERTIFICAT\s+DE\s+NON\s+BEGAIEMENT|CERTIFICAT\s+MEDICAL\s+INITIAL\s+DE\s+CONSTATATION\s+DE\s+COUPS\s+ET\s+BLESSURES|CERTIFICAT\s+MEDICAL\s+POUR\s+COUPS\s+ET\s+BLESSURES|CERTIFICAT\s+MEDICAL\s+DE\s+L[’']ETAT\s+ACTUEL|CERTIFICAT\s+MEDICAL\s+INITIAL|CERTIFICAT\s+MEDICAL|CERTIFICAT\s+MED\s+INITIAL|CERTIFICAT\s+DE\s+REPOS|CERTIFICAT\s+DE\s+REPRISE|CERTIFICAT\s+DE\s+GUERISON|CERTIFICAT\s+DE\s+GUÉRISON|CERTIFICAT\s+DE|CERTIFICAT|RAPPORT\s+MEDICAL|RAPPORT\s+DE\s+MONSIEUR|RAPPORT\s+DE\s+MME|RAPPORT\s+DE|RAPPORT\s+D'HOSPI|RAPPORT\s+D'HOSPITALISATION|RAPPORT\s+DE\s+CONSULTATION|RAPPORT|CRO\s+MODELE|CRO|CMI|MEDICAL|MED\s+INITIAL|GUERISON\s+DE\s+MONSIEUR|GUERISON\s+DE\s+MME|GUERISON\s+DE|GUERISON|GUÉRISON|DECES\s+DE\s+MONSIEUR|DECES\s+DE\s+MME|DECES\s+DE|DECES|DÉCÈS|D'HOSPI\s+TYPE|D'HOSPI|DHOSPI|ATTESTATION\s+DE\s+GUERISON|ATTESTATION\s+DE\s+GUÉRISON|ATTESTATION\s+DE|ATTESTATION)\s+/i
    ];
    
    let oldClean = '';
    while (clean !== oldClean) {
        oldClean = clean;
        prefixPatterns.forEach(pat => {
            clean = clean.replace(pat, '').trim();
        });
    }
    
    const splitPattern = /(?:CERTIFICAT|JE\s+SOUSSIGN|JE\s+SOUSSIGNE|RAPPORT|DOSSIER|N°|NO\s+DOSSIER|CMI|CRO|CLINIQUE|MÉDECINE|MEDECINE|DIAGNOSTIC|INTERVENTION|CLIENT|ASSURANCE|AFRICAINE|NSIA|ALLIANZ|SUNU|AROO|SAAR|CORIS|FEDAS|MUTUELLE|SÉJOUR|SEJOUR|DATE|OPÉRATOIRE|OPERATOIRE|CERTFICAT|CERTIF|PATIENT|PATIENTE|COTONOU|RUE\s+PAVILLON|TEL\s*\:|E\-MAIL|EMAIL|E\s+MAIL|GUERISON|GUÉRISON|DECES|DÉCÈS)/i;
    const match = clean.match(splitPattern);
    if (match) {
        clean = clean.substring(0, match.index).trim();
    }
    
    // Nettoyage additionnel robuste pour les suffixes d'âge corrompus ou fusionnés (e.g. : ANS, AGE, AFFIWAAGE)
    clean = clean.replace(/(?:\s+|:)\b(?:ANS|AGE|ÂGE|ANS\s+D['’]ÂGE)\b.*$/i, '').trim();
    clean = clean.replace(/\b(?:ANS|AGE|ÂGE|ANS\s+D['’]ÂGE)\b.*$/i, '').trim();
    if (clean.toUpperCase().endsWith("AGE") && clean.length > 5) {
        clean = clean.substring(0, clean.length - 3).trim();
    }
    
    return clean.replace(/[\s\-\.\,\:\_]+$/, '').trim();
}
window.cleanPatientName = cleanPatientName;

function cleanClinicalTerm(term) {
    if (!term || typeof term !== 'string') return '';
    let clean = term.trim();
    
    // Extraction des interventions ou diagnostics dans les phrases de rapports
    const sentencePatterns = [
        // Nouveaux patterns pour les pronoms et récits
        /(?:il|elle)\s+est\s+indiqué[ee]?(?![a-z])\s+(?:une?|d['’]une?|la|le|l['’]|du|de|d['’]|\b)\s*(.*)$/i,
        /(?:il|elle)\s+(?:avait\s+|a\s+)?bénéficié(?![a-z]).*?\b(?:d['’]une?|d['’]l['’]|d['’]|de|du)\s*(.*)$/i,
        /(?:il|elle)\s+(?:a\s+)?(?:ensuite\s+)?été\s+opéré[ee]?(?![a-z]).*?\bpour\s+(?:une?|l['’]|la|le|du)\s*(.*)$/i,
        /(?:il|elle)\s+(?:a\s+)?présenté?e?(?![a-z])\s+(?:actuellement\s+)?(?:une?|des|la|le|l['’]|du|de|d['’])\s*(.*)$/i,
        /(?:il|elle)\s+présente(?![a-z])\s+(?:actuellement\s+)?(?:une?|des|la|le|l['’]|du|de|d['’])\s*(.*)$/i,
        /(?:l['’]irm|la\s+radiographie|l['’]examen\s+clinique|l['’]interrogatoire)\s+.*?(?:retrouvé?e?|objectivé?e?|retrouve|objective|montre|révèle)(?![a-z])\s+(?:une?|des|la|le|l['’]|du|de|d['’]|\b)\s*(.*)$/i,
        /(?:le\s+)?bilan\s+lésionnel\s+associe\s+(?:une?|des|la|le|l['’]|du|de|d['’]|\b)\s*(.*)$/i,
        /(?:ayant|a)\s+(?:entraîné|entrainé)(?![a-z])\s+(?:une?|d['’]une?|la|le|l['’]|du|de|d['’]|\b)\s*(.*)$/i,

        // Anciens patterns existants (mis à jour hospitalisé pour être flexible)
        /(?:consulte|consultée|reçu|reçue|hospitalisé|hospitalisée|admis|admise)\b.*?\bpour\s+(?:une?|l['’]|de|du|d['’]|\b)\s*(.*)$/i,
        /motif\s+de\s+consultation\s*\:\s*(.*)$/i,
        /diagnostic\s+principal\s*\:\s*(.*)$/i,
        /(?:âgé|âgée|age|âge)\s+de\s+\d+\s*(?:ans|mois)\s+pour\s+(?:une?|l['’]|le|la|les|des|du|\b)\s*(.*)$/i,
        /pour\s+(?:une?|l['’]|le|la|les|des|du|\b)\s*(ablation|ostéosynthèse|osteosynthèse|cure|arthroscopie|ligamentoplastie|résection|resection|réduction|reduction|exérèse|exerese|suture|parage|embrochage|enclouage|arthrodèse|arthrodese|prothèse|prothese|synovectomie|ténolyse|tenolyse|ténoplastie|tenoplastie|ténorraphie|tenorraphie|recalibrage|laminectomie|discectomie|libération|liberation|décompression|decompression|plastie|greffe|amputation|cystostomie|urétéroscopie|ureteroscopie|nlpc|extraction|dépose|depose|reconstruction).*$/i
    ];

    for (let pat of sentencePatterns) {
        const m = clean.match(pat);
        if (m && m[1]) {
            clean = m[1].trim();
            break;
        }
    }
    
    // Nettoyer les dates partout (global /g)
    clean = clean.replace(/\s+(?:,\s*)?le\s+\d{1,2}\s+\w+\s+\d{4}/ig, ''); // le 22 janvier 2025
    clean = clean.replace(/\s+(?:,\s*)?le\s+\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/ig, ''); // le 28/09/2024
    clean = clean.replace(/\s+(?:,\s*)?en\s+\w+\s+\d{4}/ig, ''); // en juin 2023
    clean = clean.replace(/\s+courant\s+\w+\s+\d{4}/ig, ''); // courant janvier 2025
    
    // Nettoyer les mentions cliniques / administratives de fin
    clean = clean.replace(/\s+à\s+la\s+Clinique\b.*$/i, '');
    clean = clean.replace(/\s+au\s+CHDO\/P.*$/i, '');
    clean = clean.replace(/,\s*à\s*savoir$/i, '');
    clean = clean.replace(/[\s\-\.\,\:\_]+$/, '').trim();
    
    // 1. Scissionner s'il y a un bloc de texte administratif
    const upper = clean.toUpperCase();
    const hasAdmin = /(?:JE\s+SOUSSIGN|CLINIQUE|ASSURANCE\:|CLIENT\:|DOSSIER|PATIENT|HOSPITALISATION|CONSULTATION|CERTIFICAT|ORABANK|TEL\s*\:|E\-MAIL|EMAIL)/i.test(upper);
    
    if (hasAdmin) {
        const patterns = [
            /(?:DIAGNOSTIC\s+PRÉ\-OPÉRATOIRE|DIAGNOSTIC\s+PRE\-OPERATOIRE|DIAGNOSTIC)\s*\:\s*([^\n\.\,]+)/i,
            /(?:INTERVENTION\s+RÉALISÉE|INTERVENTION\s+REALISEE|INTERVENTION)\s*\:\s*([^\n\.\,]+)/i,
            /MOTIF\s+DE\s+CONSULTATION\s*\:\s*([^\n\.\,]+)/i,
            /MOTIF\s*\:\s*([^\n\.\,]+)/i,
            /(?:BILAN\s+LÉSIONNEL|BILAN\s+LESIONNEL)\s+ASSOCIE\s*\:\s*([^\n\.\,]+)/i,
            /(?:LÉSION|LESION)\s*\:\s*([^\n\.\,]+)/i
        ];
        
        let found = false;
        for (let pat of patterns) {
            const m = clean.match(pat);
            if (m && m[1]) {
                clean = m[1].trim();
                found = true;
                break;
            }
        }
        
        if (!found) {
            const firstLine = clean.split('\n')[0].trim();
            if (firstLine.length > 8 && firstLine.length < 100 && !/(?:CLIENT|PATIENT|ASSURANCE|DOSSIER)/i.test(firstLine)) {
                clean = firstLine;
            } else {
                return ''; // Discard
            }
        }
    }
    
    // 2. Enlever les préfixes de noms de patients joints
    if (clean.includes('.')) {
        const parts = clean.split('.');
        if (parts[0].length < 25 && parts[1].trim().length > 8) {
            clean = parts.slice(1).join('.').trim();
        }
    }
    
    clean = clean.replace(/[\s\-\.\,\:\_]+$/, '').trim();
    
    // 3. Filtrer par longueur et mots interdits résiduels
    if (clean.length < 5 || clean.length > 110) return '';
    
    const finalUpper = clean.toUpperCase();
    const forbidden = ["JE SOUSSIGN", "CLINIQUE", "TEL :", "TEL:", "EMAIL:", "E-MAIL", "IFU", "RCCM", "ORABANK", "SEME AGUE"];
    if (forbidden.some(fw => finalUpper.includes(fw))) return '';
    
    return clean;
}
window.cleanClinicalTerm = cleanClinicalTerm;

// 2. Intercepteur de stockage physique (Electron Offline-first)
if (typeof require !== 'undefined') {
    try {
        const fs = require('fs');
        const path = require('path');

        const originalGetItem = localStorage.getItem.bind(localStorage);
        const originalSetItem = localStorage.setItem.bind(localStorage);

        localStorage.getItem = function(key) {
            if (key === 'mercyfiat_bills') {
                const billsPath = path.join(__dirname, 'bills_db.json');
                if (fs.existsSync(billsPath)) {
                    return fs.readFileSync(billsPath, 'utf8');
                }
            } else if (key === 'mercyfiat_docs') {
                const docsPath = path.join(__dirname, 'documents_db.json');
                if (fs.existsSync(docsPath)) {
                    return fs.readFileSync(docsPath, 'utf8');
                }
            }
            return originalGetItem(key);
        };

        localStorage.setItem = function(key, value) {
            originalSetItem(key, value);
            if (key === 'mercyfiat_bills') {
                const billsPath = path.join(__dirname, 'bills_db.json');
                fs.writeFileSync(billsPath, value, 'utf8');
            } else if (key === 'mercyfiat_docs') {
                const docsPath = path.join(__dirname, 'documents_db.json');
                fs.writeFileSync(docsPath, value, 'utf8');
            }
        };
    } catch (e) {
        console.error("[MercyFiatDB] Erreur initialisation intercepteur LocalStorage :", e);
    }
}

// 3. Base de données en mémoire
var savedBills = [];
var savedDocuments = [];

try {
    savedBills = JSON.parse(localStorage.getItem('mercyfiat_bills')) || [];
} catch (e) {
    console.error("Erreur de chargement des factures :", e);
    savedBills = [];
}

try {
    savedDocuments = JSON.parse(localStorage.getItem('mercyfiat_docs')) || [];
} catch (e) {
    console.error("Erreur de chargement des rapports :", e);
    savedDocuments = [];
}

window.savedBills = savedBills;
window.savedDocuments = savedDocuments;

// 4. Générateur de références officielles séquentielles permanentes
function generateSequentialBillReference(type) {
    const today = new Date();
    const yearMonth = today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0');
    const typeCode = type === 'PROFORMA' ? 'PRO' : (type === 'AVOIR' ? 'AVO' : (type === 'DETAIL_ASSUR' ? 'DET' : 'DEF'));
    const seqKey = `mercyfiat_sequence_${typeCode}_${yearMonth}`;
    let currentSequence = parseInt(localStorage.getItem(seqKey)) || 0;
    currentSequence++;
    localStorage.setItem(seqKey, currentSequence);
    return `MF-${typeCode}-${yearMonth}-${String(currentSequence).padStart(3, '0')}`;
}
window.generateSequentialBillReference = generateSequentialBillReference;

// 5. Assainissement général de la base de données
function sanitizeEntireDatabase() {
    console.log("Démarrage de l'assainissement complet et de la déduplication de la base de données...");

    // A. Assainir window.MercyFiatDB.PATIENTS si présent
    if (window.MercyFiatDB && window.MercyFiatDB.PATIENTS) {
        const uniquePatients = [];
        const seenKeys = new Set();
        
        // Mots-clés administratifs stricts
        const adminExclusions = ["REPONSE", "TARIFAIRE", "RAPPORT", "DOSSIER", "FACTURE", "MODELE", "CONTRAT", "CURRICULUM", "LETTRE", "ENTETE", "CV", "FEUIL", "SHEET", "TEMPLATE", "NOMÉ", "NOME", "PRENOM", "PRENOMS", "PATIENT", "CLIENT", "DIAGNOSTIC", "INTERVENTION", "TOTAL", "GRAND TOTAL"];
        
        // Exclure aussi les corporates/clubs
        const corpExclusions = ["SOBEMAP", "LOTO FC", "LOTO FOOTBALL", "UNITEVA", "ENERGIE BASKETBALL", "ENERGIE BASKET", "WINSU SPORTS", "MUTUELLE", "ASSURANCE", "SOCIETE", "SOCIÉTÉ"];
        
        window.MercyFiatDB.PATIENTS.forEach(p => {
            const rawName = p.name || '';
            const cleaned = window.cleanPatientName(rawName);
            if (!cleaned || cleaned.length < 2 || cleaned.length > 40) return;
            
            const key = cleaned.toUpperCase();
            
            // Règle de filtrage stricte sur les mots-clés administratifs et corporatifs
            if (adminExclusions.some(keyword => key.includes(keyword)) || corpExclusions.some(keyword => key.includes(keyword))) {
                return;
            }
            
            // Rejeter les placeholders de type NOM ou PRENOM avec des points ou des points de suspension
            if (/\bNOM\b\s*[\.\…\-\_]*/i.test(key) || /\bPRENOM\b/i.test(key) || /\bNOME\b/i.test(key) || /\bPRENOMS\b/i.test(key)) {
                return;
            }
            
            if (!seenKeys.has(key)) {
                seenKeys.add(key);
                p.name = cleaned;
                p.diagnosis = window.cleanClinicalTerm ? window.cleanClinicalTerm(p.diagnosis) : p.diagnosis;
                p.intervention = window.cleanClinicalTerm ? window.cleanClinicalTerm(p.intervention) : p.intervention;
                uniquePatients.push(p);
            }
        });
        
        window.MercyFiatDB.PATIENTS = uniquePatients;
    }

    // B. Charger et purifier les rapports cliniques
    let docs = [];
    try {
        docs = JSON.parse(localStorage.getItem('mercyfiat_docs')) || [];
    } catch(e) {
        docs = [];
    }

    const realIds = new Set((window.MercyFiatRealDocs || []).map(d => d.id));
    docs = docs.filter(d => !realIds.has(d.id) && !(d.id || '').startsWith('DOC-REAL-'));

    if (window.MercyFiatRealDocs && window.MercyFiatRealDocs.length > 0) {
        window.MercyFiatRealDocs.forEach(realDoc => {
            docs.push(realDoc);
        });
    }

    const cleanedDocs = [];
    const docMap = {};

    docs.forEach(d => {
        let nom = d.patientNom || '';
        let prenom = d.patientPrenom || '';
        let age = d.patientAge || '';

        const cleanNom = window.cleanPatientName(nom);
        if (cleanNom) {
            const parts = cleanNom.split(' ');
            if (parts.length > 1 && (!prenom || prenom.trim() === '')) {
                nom = parts[0];
                prenom = parts.slice(1).join(' ');
            } else {
                nom = cleanNom;
            }
        }

        const cleanPrenom = window.cleanPatientName(prenom);
        if (cleanPrenom && cleanPrenom !== prenom) {
            prenom = cleanPrenom;
        }

        nom = window.cleanPatientName(nom);
        prenom = window.cleanPatientName(prenom);

        if (age && typeof age === 'string') {
            const ageMatch = age.match(/^\d+\s*(?:ans|g|mois|ans\s+d['’]âge)/i) || age.match(/\d+\s*(?:ans|g|mois)/i);
            if (ageMatch) {
                age = ageMatch[0].trim();
            } else if (age.length > 10) {
                age = 'N/A';
            }
        }

        d.patientNom = nom;
        d.patientPrenom = prenom;
        d.patientAge = age;
        
        if (window.cleanClinicalTerm) {
            d.diagnosis = window.cleanClinicalTerm(d.diagnosis || d.motif || '');
        }

        let score = 0;
        const upperNom = nom.toUpperCase();
        const upperPrenom = prenom.toUpperCase();
        
        if (upperPrenom.includes("AGE") || upperPrenom.includes("ANS") || upperPrenom.includes("RAPPORT")) score += 10;
        if (upperNom.includes("RAPPORT") || upperNom.includes("MEDICAL")) score += 10;
        if (nom.length > 25) score += 5;
        if (prenom.length > 25) score += 5;
        if (prenom.includes(":") || nom.includes(":")) score += 8;

        d.qualityScore = score;

        const patientKey = `${nom.toUpperCase()}||${prenom.toUpperCase()}||${d.date}||${(d.category || '').toUpperCase()}||${(d.title || '').toUpperCase()}`;
        if (!docMap[patientKey]) {
            docMap[patientKey] = [];
        }
        docMap[patientKey].push(d);
    });

    Object.keys(docMap).forEach(key => {
        const docList = docMap[key];
        docList.sort((a, b) => a.qualityScore - b.qualityScore);
        const bestDoc = docList[0];
        delete bestDoc.qualityScore;
        cleanedDocs.push(bestDoc);
    });

    localStorage.setItem('mercyfiat_docs', JSON.stringify(cleanedDocs));
    savedDocuments = cleanedDocs;
    window.savedDocuments = cleanedDocs;

    // C. Charger et purifier les factures
    let bills = [];
    try {
        bills = JSON.parse(localStorage.getItem('mercyfiat_bills')) || [];
    } catch(e) {
        bills = [];
    }

    const cleanedBills = [];
    const billMap = {};

    bills.forEach(b => {
        let nom = b.patientNom || '';
        let prenom = b.patientPrenom || '';
        let age = b.patientAge || '';

        nom = window.cleanPatientName(nom);
        prenom = window.cleanPatientName(prenom);

        if (age && typeof age === 'string') {
            const ageMatch = age.match(/^\d+\s*(?:ans|g|mois|ans\s+d['’]âge)/i) || age.match(/\d+\s*(?:ans|g|mois)/i);
            if (ageMatch) {
                age = ageMatch[0].trim();
            } else if (age.length > 10) {
                age = 'N/A';
            }
        }

        b.patientNom = nom;
        b.patientPrenom = prenom;
        b.patientAge = age;
        if (window.cleanClinicalTerm) {
            b.diagnosis = window.cleanClinicalTerm(b.diagnosis);
        }

        let score = 0;
        const upperNom = nom.toUpperCase();
        const upperPrenom = prenom.toUpperCase();
        if (upperPrenom.includes("AGE") || upperPrenom.includes("ANS")) score += 10;
        if (upperNom.includes("RAPPORT")) score += 10;

        b.qualityScore = score;

        const billKey = `${nom.toUpperCase()}||${prenom.toUpperCase()}||${b.date}||${b.grossTotal}`;
        if (!billMap[billKey]) {
            billMap[billKey] = [];
        }
        billMap[billKey].push(b);
    });

    Object.keys(billMap).forEach(key => {
        const billList = billMap[key];
        billList.sort((a, b) => a.qualityScore - b.qualityScore);
        const bestBill = billList[0];
        delete bestBill.qualityScore;
        cleanedBills.push(bestBill);
    });

    localStorage.setItem('mercyfiat_bills', JSON.stringify(cleanedBills));
    window.savedBills = cleanedBills;

    // D. Purifier les autocomplétions personnalisées de patients
    let customPats = [];
    try {
        customPats = JSON.parse(localStorage.getItem('mercyfiat_custom_patients')) || [];
    } catch(e) {
        customPats = [];
    }

    const adminKeywords = ["ECMV", "ENTETE", "EXAMEN", "EXTRAIT", "FACTURE", "PROFORMA", "PRO FORMA", "FRACTURE", "HEBERGEMENT", "HERNIE", "HYMNE", "INITIAL", "JUIN", "AOUT", "MARS", "FEV", "AVRIL", "KIT OPERATOIRE", "LAVAGE", "LETTRE", "LOGO ENREGISTRE", "MARIAGE", "MEDICAL", "MERCY FIAT GROUP", "NOMS ET PRENOMS", "NON BEGAIEMENT", "OFFRE", "PAGE DE GARDE", "PALPATION", "PHARMACIE", "PLAQUE", "PRESENTATION", "PRESENTEE ET SOUTENUE", "PROGRAMME", "PSEUDARTHROSE", "PTG", "RECU", "REGARDE LETOILE", "SIGNATURE", "STATISTIQUE", "STRATEGIES", "TARIF", "TYPE", "VIS", "VISSAGE", "COLLABORATEURS", "DOSSIER", "SUITES", "PRENOM", "TARIFAIRE", "GRILLE", "IMPLANTS", "CNHU", "TAMOU BIO", "DETAILS", "MODELE", "ANJAN", "BIOLOGIE", "NGAP", "BENIN", "FORMATION", "REUNION", "CONTRAT", "DECHARGE", "MISSION", "STOCK", "IDENTIFICATION", "CLINIQUE MERCY", "MANUEL", "ASSURANCES", "ACTES", "CHIRURGIEN", "AGENDA", "ANTISEPTIQUE", "ASSEMBLE", "CURRICULUM", "CONSENTEMENT", "COMPLEMENTAIRE", "COMPLEXE", "COMPTE RENDU", "MENISCECTOMIE", "DATE OP", "CV", "DEMANDE", "ORGANOGRAMME", "REPONSE", "LISTE", "JANVIER", "FEVRIER", "MARS", "AVRIL", "MAI", "JUIN", "JUILLET", "AOUT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DECEMBRE", "DISPENSE", "RELANCE", "FACT", "RAPPORT"];
    
    const cleanedCustomPats = customPats.filter(p => {
        const rawName = p.name || '';
        const cleaned = window.cleanPatientName ? window.cleanPatientName(rawName) : rawName.trim().toUpperCase();
        if (!cleaned || cleaned.length < 3) return false;
        
        const upper = cleaned.toUpperCase();
        if (adminKeywords.some(k => upper.includes(k))) return false;
        
        p.name = cleaned;
        return true;
    });

    localStorage.setItem('mercyfiat_custom_patients', JSON.stringify(cleanedCustomPats));

    // Sauvegarder les modifications des patients sur le disque
    if (window.MercyFiatDB && typeof window.MercyFiatDB.savePatients === 'function') {
        window.MercyFiatDB.savePatients();
    }
}
window.sanitizeEntireDatabase = sanitizeEntireDatabase;
