import os

database_js_path = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\database.js"

original_content = """/* ==========================================
   database.js - Base de Données Modulaire & Nomenclature MercyFiat
   ========================================== */

const MercyFiatDB = {
    // Tarifs de base par lettre clé (K) en vigueur au Bénin
    K_VALUE_STANDARD: 1500, 
    K_VALUE_PRESTIGE: 2000, 

    // Assurances Partenaires au Bénin
    INSURERS: [
        // Mutuelles (Assurances Maladie) - Couverture par défaut 80%
        { id: "AFG", name: "Africaine des Assurances Maladie", defaultCoverage: 80, accommodationCap: 15000, category: "Mutuelles / Assurances Maladie", color: "#4e73df" },
        { id: "ASCOMA", name: "ASCOMA", defaultCoverage: 80, accommodationCap: 20000, category: "Mutuelles / Assurances Maladie", color: "var(--accent-coral)" },
        { id: "ATLANTIQUE", name: "Atlantique Assurance", defaultCoverage: 80, accommodationCap: 15000, category: "Mutuelles / Assurances Maladie", color: "#36b9cc" },
        { id: "DAYO", name: "DAYO Assurance", defaultCoverage: 80, accommodationCap: 15000, category: "Mutuelles / Assurances Maladie", color: "#f6c23e" },
        { id: "GRAS SAVOYE", name: "Gras Savoye", defaultCoverage: 80, accommodationCap: 20000, category: "Mutuelles / Assurances Maladie", color: "var(--accent-gold)" },
        { id: "NOBILA", name: "NOBILA Assurance", defaultCoverage: 80, accommodationCap: 15000, category: "Mutuelles / Assurances Maladie", color: "#e74a3b" },
        { id: "NSIA", name: "NSIA", defaultCoverage: 80, accommodationCap: 15000, category: "Mutuelles / Assurances Maladie", color: "#858796" },
        { id: "OLEA", name: "OLEA", defaultCoverage: 80, accommodationCap: 15000, category: "Mutuelles / Assurances Maladie", color: "var(--accent-teal)" },
        { id: "SANLAM", name: "SANLAM Maladie", defaultCoverage: 80, accommodationCap: 15000, category: "Mutuelles / Assurances Maladie", color: "var(--accent-blue)" },
        { id: "SUNU", name: "SUNU Assurance Maladie", defaultCoverage: 80, accommodationCap: 15000, category: "Mutuelles / Assurances Maladie", color: "#d66a8a" },
        { id: "TRANSVIE", name: "TRANSVIE", defaultCoverage: 80, accommodationCap: 15000, category: "Mutuelles / Assurances Maladie", color: "#5a5c69" },

        // Sinistres & Accidents Auto - Couverture par défaut 100%
        { id: "AFRICAINE_SINISTRE", name: "Africaine des Assurances Sinitres", defaultCoverage: 100, accommodationCap: 20000, category: "Sinistres & Accidents Auto", color: "#2e59d9" },
        { id: "FONDS_GARANTIE_AUTO", name: "Fonds de Garantie Automobile", defaultCoverage: 100, accommodationCap: 15000, category: "Sinistres & Accidents Auto", color: "#1cc88a" },
        { id: "GENERAL_ASSURANCE_SINISTRE", name: "Général Assurance du Bénin (Sinistre)", defaultCoverage: 100, accommodationCap: 20000, category: "Sinistres & Accidents Auto", color: "#36b9cc" },
        { id: "SANLAM_SINISTRE", name: "SANLAM Sinistre", defaultCoverage: 100, accommodationCap: 20000, category: "Sinistres & Accidents Auto", color: "#f6c23e" },
        { id: "SUNU_SINISTRE_AUTO", name: "SUNU Sinistre Auto", defaultCoverage: 100, accommodationCap: 20000, category: "Sinistres & Accidents Auto", color: "#e74a3b" },

        // Sociétés & Clubs (Accords Directs) - Couverture par défaut 100%
        { id: "COTON_SPORT", name: "COTON SPORT", defaultCoverage: 100, accommodationCap: 25000, category: "Sociétés & Clubs (Accords Directs)", color: "#4e73df" },
        { id: "ENERGIE_BASKET_BALL", name: "ENERGIE BASKET-BALL", defaultCoverage: 100, accommodationCap: 25000, category: "Sociétés & Clubs (Accords Directs)", color: "#1cc88a" },
        { id: "LOTTO_FOOTBALL_CLUB", name: "LOTTO FOOTBALL CLUB", defaultCoverage: 100, accommodationCap: 25000, category: "Sociétés & Clubs (Accords Directs)", color: "#36b9cc" },
        { id: "PORT_AUTONOME_COTONOU", name: "PORT AUTONOME DE COTONOU", defaultCoverage: 100, accommodationCap: 30000, category: "Sociétés & Clubs (Accords Directs)", color: "#f6c23e" },
        { id: "SOBEMAP", name: "SOBEMAP", defaultCoverage: 100, accommodationCap: 25000, category: "Sociétés & Clubs (Accords Directs)", color: "#e74a3b" },

        // Secteur Privé
        { id: "PRIVE", name: "Secteur Privé (100% Patient)", defaultCoverage: 0, accommodationCap: 0, category: "Secteur Privé", color: "#718096" }
    ],

    // Nomenclature Générale des Actes Chirurgicaux (K-codes)
    ACTES_CHIRURGICAUX: [
        { id: "LCA", name: "Ligamentoplastie du LCA (DIDT / MacIntosh / KJ)", kCode: 180, category: "Orthopédie" },
        { id: "PTG", name: "Prothèse Totale du Genou (PTG)", kCode: 292, category: "Orthopédie" },
        { id: "PTH", name: "Prothèse Totale de la Hanche (PTH)", kCode: 280, category: "Orthopédie" },
        { id: "CLAVICULE", name: "Ostéosynthèse de la clavicule", kCode: 100, category: "Orthopédie" },
        { id: "HUMERUS", name: "Ostéosynthèse de l'humérus / radius / cubitus", kCode: 120, category: "Orthopédie" },
        { id: "TIBIA", name: "Ostéosynthèse du tibia ou du fémur", kCode: 180, category: "Orthopédie" },
        { id: "AMOS_CLE", name: "Ablation de matériel d'ostéosynthèse (AMOS) de cheville / bras", kCode: 72, category: "Orthopédie" },
        { id: "ARTHRO_DIAG", name: "Arthroscopie diagnostique & debridement du genou", kCode: 80, category: "Orthopédie" },
        { id: "LUXATION_CMF", name: "Réduction orthopédique de luxation de membre", kCode: 55, category: "Orthopédie" },
        
        { id: "FX_MANDIBULE", name: "Ostéosynthèse de fracture symphysaire mandibulaire par mini-plaques", kCode: 150, category: "Maxillo-Facial" },
        { id: "FX_MAXILLAIRE", name: "Ostéosynthèse de fracture du maxillaire (Le Fort I, II, III)", kCode: 180, category: "Maxillo-Facial" },
        { id: "KYSTE_MAX", name: "Exérèse de kyste ou tumeur maxillo-faciale avec reconstruction osseuse", kCode: 120, category: "Maxillo-Facial" },
        { id: "PLASTIE_LIPOME", name: "Exérèse de lipome ou tumeur des tissus mous de la face", kCode: 60, category: "Maxillo-Facial" },
        { id: "SUTURE_ESTHETIQUE", name: "Suture esthétique et parage de plaie complexe de la face", kCode: 50, category: "Maxillo-Facial" },
        
        { id: "RTUP", name: "Résection Transurétrale de la Prostate (RTUP)", kCode: 120, category: "Urologie" },
        { id: "SONDE_JJ_POSE", name: "Pose ou descente de Sonde Double J (JJ)", kCode: 50, category: "Urologie" },
        { id: "SONDE_JJ_ABLATION", name: "Ablation de Sonde double J par urétéroscopie", kCode: 40, category: "Urologie" },
        { id: "HYDROCELE", name: "Cure d'hydrocèle ou de varicocèle", kCode: 60, category: "Urologie" },
        
        { id: "PERITONITE", name: "Lavage - drainage / Intervention de Volkmann pour péritonite", kCode: 200, category: "Viscérale" },
        { id: "HERNIE", name: "Cure d'hernie en urgence", kCode: 80, category: "Viscérale" }
    ],

    // Prestations Cliniques Communes (Hors calcul K)
    PRESTATIONS_COMMUNES: [
        { id: "HOSP_VIP", name: "Hébergement / Séjour en Chambre VIP", defaultPrice: 50000, unit: "nuitée", category: "Séjour" },
        { id: "HOSP_STD", name: "Hébergement / Séjour en Chambre Standard", defaultPrice: 30000, unit: "nuitée", category: "Séjour" },
        { id: "HOSP_LONG", name: "Hébergement / Séjour long (Convalescence)", defaultPrice: 15000, unit: "nuitée", category: "Séjour" },
        { id: "REPAS", name: "Forfait Repas quotidien du patient", defaultPrice: 10000, unit: "jour", category: "Séjour" },
        { id: "MED_INFIRMIER", name: "Actes médico-infirmiers et soins quotidiens", defaultPrice: 7500, unit: "jour", category: "Séjour" },
        
        { id: "CS_ANESTHESISTE", name: "Consultation d'Anesthésie pré-opératoire", defaultPrice: 15000, unit: "acte", category: "Diagnostic" },
        { id: "CS_ANESTH_URG", name: "Consultation d'Anesthésie en Urgence", defaultPrice: 22000, unit: "acte", category: "Diagnostic" },
        { id: "CS_CARDIO", name: "Consultation Cardiologique pré-opératoire", defaultPrice: 15000, unit: "acte", category: "Diagnostic" },
        { id: "CS_CARDIO_URG", name: "Consultation Cardiologique en Urgence", defaultPrice: 22000, unit: "acte", category: "Diagnostic" },
        { id: "ECG_ACTE", name: "Électrocardiogramme (ECG) avec tracé", defaultPrice: 15000, unit: "acte", category: "Diagnostic" },
        
        { id: "LABO_PREOP", name: "Bilan Biologique Pré-Opératoire Complet (Laboratoire)", defaultPrice: 55000, unit: "forfait", category: "Diagnostic" },
        { id: "LABO_AVANCE", name: "Bilan Biologique Élargi (Péritonite / Urgences)", defaultPrice: 81000, unit: "forfait", category: "Diagnostic" },
        { id: "RADIO_POSTOP", name: "Radiographie de contrôle post-opératoire", defaultPrice: 15000, unit: "cliché", category: "Diagnostic" },
        { id: "RADIO_DOUKPON", name: "Radiographie numérisée de grand format", defaultPrice: 25000, unit: "cliché", category: "Diagnostic" },
        
        { id: "BLOC_AMPLI", name: "Forfait Amplificateur de brillance au bloc", defaultPrice: 100000, unit: "forfait", category: "Bloc" },
        { id: "COLONNE_ARTHRO", name: "Forfait Colonne d'Arthroscopie", defaultPrice: 50000, unit: "forfait", category: "Bloc" },
        { id: "KINE_SEANCE", name: "Séance de Kinésithérapie et rééducation", defaultPrice: 6000, unit: "séance", category: "Soins" },
        { id: "FORFAIT_PANSEMENT", name: "Forfait pansement et soins de plaie", defaultPrice: 2000, unit: "pansement", category: "Soins" }
    ],

    // FORFAITS CHIRURGICAUX STANDARDS EXTRAITS DES PROFORMAS RÉELLES
    FORFAITS_COMPLETS: [
        {
            id: "FORFAIT_ARTHRO",
            name: "FORFAIT : Arthroscopie du Genou (Total : 852 000 FCFA)",
            diagnosis: "Douleur Méniscale du genou droit / Lésion articulaire",
            items: [
                { name: "Hébergement", price: 25000, qty: 3 },
                { name: "Médicaments et Consommables", price: 200000, qty: 1 },
                { name: "Actes médico-infirmiers", price: 5000, qty: 3 },
                { name: "Chirurgien Principal (K80)", price: 1500, qty: 80 },
                { name: "Actes d'Anesthésie (K40)", price: 1500, qty: 40 },
                { name: "Forfait Bloc Opératoire (K48)", price: 1500, qty: 48 },
                { name: "Aide-Op 2nd chirurgien (K40)", price: 1500, qty: 40 },
                { name: "CS Anesthésiste", price: 15000, qty: 1 },
                { name: "CS Cardio", price: 15000, qty: 1 },
                { name: "ECG", price: 15000, qty: 1 },
                { name: "Laboratoire", price: 55000, qty: 1 },
                { name: "Forfait matériel", price: 50000, qty: 1 },
                { name: "Forfait colonne d'arthroscopie", price: 100000, qty: 1 }
            ]
        },
        {
            id: "FORFAIT_LCA",
            name: "FORFAIT : Ligamentoplastie LCA / LCR Genou (Total : 1 631 000 FCFA)",
            diagnosis: "Rupture complète du ligament croisé antérieur (LCA)",
            items: [
                { name: "Hébergement ordinaire", price: 30000, qty: 5 },
                { name: "Médicaments et consommables", price: 250000, qty: 1 },
                { name: "Actes médico-infirmiers", price: 5000, qty: 5 },
                { name: "Chirurgien Principal (K180)", price: 1500, qty: 180 },
                { name: "Actes d'Anesthésie (K90)", price: 1500, qty: 90 },
                { name: "2nd chirurgien (K90)", price: 1500, qty: 90 },
                { name: "Forfait Bloc Opératoire (K108)", price: 1500, qty: 108 },
                { name: "Aide-Opératoire", price: 30000, qty: 1 },
                { name: "Cs anesthésiste", price: 12000, qty: 1 },
                { name: "ECG", price: 15000, qty: 1 },
                { name: "Cs cardio", price: 12000, qty: 1 },
                { name: "Laboratoire", price: 55000, qty: 1 },
                { name: "Repas", price: 6000, qty: 5 },
                { name: "Forfait colonne d'arthroscopie", price: 100000, qty: 1 },
                { name: "Forfait matériels", price: 250000, qty: 1 }
            ]
        },
        {
            id: "FORFAIT_RTUP",
            name: "FORFAIT : Résection Prostate RTUP (Total : 818 000 FCFA)",
            diagnosis: "Hypertrophie prostatique bénigne obstructive",
            items: [
                { name: "Hébergement", price: 20000, qty: 4 },
                { name: "Consommables", price: 140000, qty: 1 },
                { name: "Actes médico-infirmiers", price: 7500, qty: 4 },
                { name: "Chirurgien Principal (K120)", price: 1500, qty: 120 },
                { name: "Actes d'Anesthésie (K60)", price: 1500, qty: 60 },
                { name: "2nd chirurgien", price: 1500, qty: 50 },
                { name: "Forfait Bloc Opératoire (K72)", price: 1500, qty: 72 },
                { name: "Cs anesthésiste", price: 15000, qty: 1 },
                { name: "Forfait colonne d'arthroscopie", price: 50000, qty: 1 },
                { name: "Matériels Urologique", price: 50000, qty: 1 }
            ]
        },
        {
            id: "FORFAIT_CLAVICULE",
            name: "FORFAIT : Ostéosynthèse Clavicule (Total : 954 800 FCFA)",
            diagnosis: "Fracture du quart latéral de la clavicule droite",
            items: [
                { name: "Hébergement", price: 30000, qty: 2 },
                { name: "Médicaments et Consommables", price: 150000, qty: 1 },
                { name: "Actes médico-infirmiers", price: 7500, qty: 2 },
                { name: "Chirurgien Principal (K100)", price: 1500, qty: 100 },
                { name: "Actes d'Anesthésie (K50)", price: 1500, qty: 50 },
                { name: "Aide Opérateur", price: 30000, qty: 1 },
                { name: "Forfait Bloc Opératoire (K60)", price: 1500, qty: 60 },
                { name: "CS Anesthésiste", price: 15000, qty: 1 },
                { name: "CS Cardio", price: 15000, qty: 1 },
                { name: "ECG", price: 15000, qty: 1 },
                { name: "Laboratoire", price: 55000, qty: 1 },
                { name: "IMPLANTS", price: 284800, qty: 1 }
            ]
        },
        {
            id: "FORFAIT_PERITONITE",
            name: "FORFAIT : Urgence Péritonite (Total : 1 856 795 FCFA)",
            diagnosis: "Péritonite par perforation sigmoïdienne",
            items: [
                { name: "Hébergement", price: 35000, qty: 8 },
                { name: "Consommables", price: 354795, qty: 1 },
                { name: "Actes médico-infirmiers", price: 7500, qty: 8 },
                { name: "Chirurgien Principal (K200)", price: 2000, qty: 200 },
                { name: "Actes d'Anesthésie (K100)", price: 2000, qty: 100 },
                { name: "Aide-Op 2nd chirurgien", price: 2000, qty: 50 },
                { name: "Forfait Bloc Opératoire (K120)", price: 2000, qty: 120 },
                { name: "CS Anesthésiste", price: 22000, qty: 1 },
                { name: "Cons Chirurgie Viscérale", price: 22000, qty: 1 },
                { name: "CS Cardio Urgence", price: 22000, qty: 1 },
                { name: "ECG", price: 15000, qty: 1 },
                { name: "Laboratoire", price: 81000, qty: 1 },
                { name: "Forfait pansement", price: 2000, qty: 30 }
            ]
        }
    ],

    // BASE DE DONNÉES RÉELLE DES PATIENTS EXTRAITE D'EXEMPLAIRE PROFORMA (156 Patients)
    PATIENTS: (function() {
        let loaded = [];
        if (typeof require !== 'undefined') {
            try {
                const fs = require('fs');
                const path = require('path');
                const patientsPath = path.join(__dirname, 'patients_db.json');
                if (fs.existsSync(patientsPath)) {
                    loaded = JSON.parse(fs.readFileSync(patientsPath, 'utf8'));
                    console.log(`[MercyFiatDB] Base patients_db.json chargée : ${loaded.length} patients.`);
                } else {
                    console.log("[MercyFiatDB] patients_db.json introuvable, création d'une base vide.");
                    fs.writeFileSync(patientsPath, JSON.stringify([], null, 4), 'utf8');
                }
            } catch (e) {
                console.error("[MercyFiatDB] Erreur de chargement de patients_db.json :", e);
            }
        }
        return loaded;
    })(),

    // Méthode de persistance pour sauvegarder la base de données patients locale
    savePatients: function() {
        if (typeof require !== 'undefined') {
            try {
                const fs = require('fs');
                const path = require('path');
                const patientsPath = path.join(__dirname, 'patients_db.json');
                fs.writeFileSync(patientsPath, JSON.stringify(window.MercyFiatDB.PATIENTS, null, 4), 'utf8');
                console.log("[MercyFiatDB] patients_db.json sauvegardé avec succès.");
            } catch (e) {
                console.error("[MercyFiatDB] Erreur d'écriture de patients_db.json :", e);
            }
        }
    },

    DIAGNOSES: [],
    INTERVENTIONS: []
};

// Calcule automatiquement les lignes du forfait chirurgical réglementaire (Bénin) selon le code K de l'acte
MercyFiatDB.calculateSurgicalPackage = function(kCode, kValue = 1500) {
    return {
        surgeonPrincipal: {
            name: "Chirurgien Principal",
            qty: kCode,
            price: kValue,
            subtotal: kCode * kValue
        },
        anesthesie: {
            name: "Actes d'Anesthésie",
            qty: Math.round(kCode * 0.5), 
            price: kValue,
            subtotal: Math.round(kCode * 0.5) * kValue
        },
        secondChirurgien: {
            name: "Deuxième Chirurgien (Aide Opérateur)",
            qty: Math.round(kCode * 0.5), 
            price: kValue,
            subtotal: Math.round(kCode * 0.5) * kValue
        },
        blocOperatoire: {
            name: "Forfait Bloc Opératoire",
            qty: Math.round(kCode * 0.6), 
            price: kValue,
            subtotal: Math.round(kCode * 0.6) * kValue
        },
        aideOperatoireMini: {
            name: "Aide Opératoire (Stagiaire/Infirmier de Bloc)",
            qty: Math.round(kCode * 0.15), 
            price: kValue,
            subtotal: Math.round(kCode * 0.15) * kValue
        }
    };
};

// Fusion avec les données personnalisées créées dynamiquement par l'utilisateur (localStorage)
try {
    const customPatients = JSON.parse(localStorage.getItem('mercyfiat_custom_patients')) || [];
    if (customPatients.length > 0) {
        MercyFiatDB.PATIENTS = [...customPatients, ...MercyFiatDB.PATIENTS];
    }
} catch (e) {
    console.error("Erreur de fusion des patients personnalisés :", e);
}

try {
    const customDiagnoses = JSON.parse(localStorage.getItem('mercyfiat_custom_diagnoses')) || [];
    if (customDiagnoses.length > 0) {
        MercyFiatDB.DIAGNOSES = [...new Set([...customDiagnoses, ...MercyFiatDB.DIAGNOSES])];
    }
} catch (e) {
    console.error("Erreur de fusion des diagnostics personnalisés :", e);
}

try {
    const customInterventions = JSON.parse(localStorage.getItem('mercyfiat_custom_interventions')) || [];
    if (customInterventions.length > 0) {
        MercyFiatDB.INTERVENTIONS = [...new Set([...customInterventions, ...MercyFiatDB.INTERVENTIONS])];
    }
} catch (e) {
    console.error("Erreur de fusion des interventions personnalisées :", e);
}

// Déduplication intelligente à l'initialisation pour garantir un registre propre sans exacts doublons
const uniquePatientsMap = new Map();
MercyFiatDB.PATIENTS.forEach(p => {
    // Clé unique basée sur le nom, le diagnostic, l'intervention et le kCode
    const key = `${p.name.trim().toUpperCase()}||${(p.diagnosis || "").trim()}||${(p.intervention || "").trim()}||${(p.kCode || "").trim()}`;
    uniquePatientsMap.set(key, p);
});
MercyFiatDB.PATIENTS = Array.from(uniquePatientsMap.values());

// Rendre global
window.MercyFiatDB = MercyFiatDB;
"""

with open(database_js_path, "w", encoding="utf-8") as f:
    f.write(original_content)

print("database.js restored to a clean state.")
