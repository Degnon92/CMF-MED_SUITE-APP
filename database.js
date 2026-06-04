/* ==========================================
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

    DIAGNOSES: [
        "APPENDICITE AIGUE",
        "ATCD hemocolectomie droite et porteur d'une HBP obstructive",
        "Amputation de régularisation des doigts",
        "CAL VICIEUX ARTICULAIRE DES PLATEAUX TIBIAUX GAUCHES",
        "CANAL LOMBAIRE RETRECI",
        "CANAL LOMBAIRE RETRECI L1 A L5",
        "CANAL LOMBAIRE RETRECI L3 A S1",
        "Cal vicieux plateau tibial latéral droit + raideur du genou droit",
        "DISJONCTION AC DROITE NEGLIGEE",
        "DOULEUR CHRONIQUE ,TENDINITE",
        "DOULEUR CHRONIQUE,TENDINITE",
        "Disjonction Acromio -clavi",
        "Douleur Méniscale du genou droit",
        "Déformation acquise des deux membres pelviens type genu valgum tibial",
        "EMBROCHAGE DU 5E RAYON GAUCHE",
        "ENGAINEMENT URETRAL",
        "ENTORSE GRAVE DU FEMUR",
        "EPIPHYSIOLYSE FEMORAL SUPERIEUR BILATERALE",
        "EVENTRATION MEDIANE SUS  ET SOUS OMBILICALE",
        "EVENTRATION MEDIANE SUS ET SOUS OMBILICALE",
        "EXERESE KISTE DE LA GAINE DES FLECHISSEURS DU 3E DOIGT",
        "Embrochage du 5e Doigt Droit",
        "Entorse de moyenne gravité lié cheville gauche",
        "FR JAMBE",
        "FRACTURE ANCIENNE DE L'OLECRANE GAUCHE",
        "FRACTURE BIMALLEOLAIRE",
        "FRACTURE BIMALLEOLAIRE DROITE OUVERTE",
        "FRACTURE DE LA PALETTE HUMERALE DROITE",
        "FRACTURE DEPLACE DE P1 DU 5E DOIGT GAUCHE",
        "FRACTURE DES DEUX OS DE L'AVANT BRAS",
        "FRACTURE EPIPHYSODIAPHYSAIRE FEMUR",
        "FRACTURE L1",
        "FRACTURE MALLEOLAIRE LATERALE",
        "FRACTURE OUVERTE DE LA JAMBE DROITE",
        "FRACTURE PATHOLOGIQUE DU FEMUR GAUCHE",
        "FRACTURE SOUS TROCHANTERO DIAPHYSAIRE",
        "Fracture complexe poignet gauche",
        "Fracture de la malléole fibulaire",
        "Fracture du col du fémur",
        "Fracture du quart latéral de la clavicule droite",
        "Fracture déplacée de l'extrémité proximale de l'humérus droit",
        "Fracture isolée du radius gauche",
        "Fracture négligée du 1/4 proximal du fémur droit avec pont osseux du petit trochanter et epiphysiolyse fémoral débutant",
        "Fracture ouverte de l'olecrane droite + Luxation tête radiale",
        "Fracture pilon et malléole latérale",
        "GONALGIE GAUCHE/BLOCAGE A LA FLEXION EXTENSION",
        "GONARTHROSE  AVEC DESTRUCTION DE CONDYLE INTERNE",
        "GONARTHROSE AVEC DESTRUCTION DE CONDYLE INTERNE",
        "Genouthrose bilat",
        "Gonalgie gauche trainante",
        "HERNIE DE LA LIGNE BLANCHE",
        "HERNIE DISCALE C5, C6",
        "HERNIE INGUINALE GAUCHE + VARICOCELE BILATERALE",
        "HSD CHRONIQUE BILATERAL",
        "HTA ELEVE",
        "HYPERTROPHIE PROSTATIQUE",
        "HYPERTROPHIE PROSTATIQUE+ HERNIE INGUINALE BILATÉRAL",
        "Hydrocèle vaginal gauche + pénis non circoncis",
        "Hypertrophie prostatique bénigne",
        "INFECTION DU SITE OPERATOIRE TARDIVE SUR CLOU GAMMA LONG DU FEMUR GAUCHE",
        "INSTABILITE DU GENOU DROIT",
        "LAXITE INTERNE DU GENOU GAUCHE",
        "LOMBOSCIATIQUE POUR HERNIE DISCALE L4 L5",
        "LUXATION NEGLIGEE DU COUDE DROIT",
        "LUXATION NEGLIGEE TRAPEZO METACARPIEN",
        "LUXATION RECIDIVANTE DE L'EPAULE",
        "Lithiase Ureteral Lombaire Droite",
        "Lésion du ménisque latéral du genou droit",
        "Lésion du ménisque latéral du genou gauche",
        "Lésion méniscale latérale gauche",
        "MALPOSITION D'IMPLANT SUR CLE",
        "Macrolithiase rénale droite obstructive",
        "ONGLE INCARNE",
        "ONGLE INCARNE DES DEUX HALLUX",
        "OSTEOSYNTHESE D'UNE FRACTURE DE LA BASE DE M5",
        "OSTEOSYNTHESE D'UNE FRACTURE DE LA BASE DE M5 DROIT",
        "OSTEOSYNTHESE DE LA CLAVICULE DROITE",
        "OSTEOSYNTHESE DE LA CLAVICULE GAUCHE",
        "OSTEOTOMIE DU FEMUR",
        "PARAGE ET TENORAPHIE  EXTENSEUR DU GROS  ORTEIL",
        "PARAGE ET TENORAPHIE EXTENSEUR DU GROS ORTEIL",
        "PERITONITE PAR PERFORATION SIGMOIDIENNE",
        "PIEDS BOT NEUROLOGUE",
        "PSEUDARTHROSE DE DEUX OS DE L'AVANT BRAS DROIT",
        "Pied (G) et varus équin bilatéral neurologique",
        "Plaie de pied",
        "Pouce a ressaut",
        "Pouce a ressaut droit",
        "Pseudarthrose atrophique de l'humérus droit",
        "Pseudarthrose atropique du 1/3 inférieur du fémur G sur matériel d'ostéosynthèse",
        "RUPTURE COMPLETE DU LCA + FISSURE DU MENISQUE MEDIAL",
        "Rupture du tendon pattelaire gauche",
        "Rupture partielle du ligament croisé antérieur ;",
        "SENSATION DE BLOCAGE DU GENOU DROIT:SUSPICION DE LESION MENISCALE",
        "SUBLUXATION NEGLIGEE MP DU POUCE DROIT",
        "Suspicion de lesion sous chondrale des rotules",
        "Syndrome de blocage du genou gauche",
        "Séquelles de fractures multiples / Ablation de matériel d'ostéosynthèse multi-sites",
        "TENORAPHIE DU TENDON CALCANEEN GAUCHE",
        "TRAUMATISME DU MEMBRE PELVIEN GAUCHE",
        "Tendinite de DEQUERVAIN",
        "Tumeur de col envahissant uretère",
        "cal vicieux articulaire de la tête de P1 du 4ème doigt gauche",
        "cal vicieux du 1/3 inférieur de la jambe droite",
        "entorse chronique du ligament collatéral interne du genou droit",
        "entorse du ligament latéral externe de la cheville droite",
        "entorse grave du genou droit",
        "fracture ancienne de la malléole latérale gauche",
        "fracture associant une fracture fermée du fémur droit, une fracture du bassin et de multiples der",
        "fracture associant une fracture fermée du fémur droit, une fracture du bassin et de multiples der...",
        "fracture bifocale du fémur gauche",
        "fracture comminutive médio-diaphysaire ouverte type 2 de GUSTILLO du fémur gauche avec perte de s",
        "fracture comminutive médio-diaphysaire ouverte type 2 de GUSTILLO du fémur gauche avec perte de s...",
        "fracture de la palette humérale droite",
        "fracture de l’avant-bras droit",
        "fracture de l’extrémité distale de la jambe, avec séquestre osseux au niveau du foyer de fracture",
        "fracture des deux os de la jambe droite et une fracture du poignet gauche",
        "fracture des deux os de la jambe gauche et un traumatisme oculaire gauche grave",
        "fracture des deux os de l’avant-bras gauche",
        "fracture des plateaux tibiaux droits et une fracture de la mandibule",
        "fracture des épines tibiales",
        "fracture du col du 5ème métacarpien droit",
        "fracture du col du 5ème métacarpien droit le 18 avril 2025",
        "fracture du fémur distal droit",
        "fracture du genou droit suite à un accident de la circulation survenu le 21 janvier 2024",
        "fracture déplacée de la clavicule gauche survenue à la suite d’un accident de la circulation le 1",
        "fracture déplacée de la clavicule gauche survenue à la suite d’un accident de la circulation le 1...",
        "fracture fermée de l’extrémité supérieure du fémur gauche, une fracture fermée des deux (02) os d",
        "fracture fermée de l’extrémité supérieure du fémur gauche, une fracture fermée des deux (02) os d...",
        "fracture fermée du fémur gauche",
        "fracture fermée du plateau tibial médial gauche, traitée avec une ostéosynthèse par plaque vissée",
        "fracture fermée du plateau tibial médial gauche, traitée avec une ostéosynthèse par plaque vissée...",
        "fracture isolée du radius gauche et une fracture céphalo-tubérositaire de l’humérus droit",
        "fracture mixte du plateau tibial latéral droit",
        "fracture ostéo-chondrale de la patella gauche",
        "fracture ouverte de la cheville gauche type 2 de GUSTILLO ET ANDERSON",
        "fracture ouverte de la jambe droite",
        "fracture ouverte de type II du 1/3 distal des deux os de la jambe gauche",
        "fracture ouverte supracondylienne du fémur gauche et une fracture du tibia proximal gauche",
        "fracture ouverte type IIIA des deux os de la jambe droite",
        "fracture pertrochantérienne",
        "fracture pertrochantérienne droite",
        "fracture pertrochantérienne droite, une facture de la diaphyse fémorale sous-jacente et une disjo",
        "fracture pertrochantérienne droite, une facture de la diaphyse fémorale sous-jacente et une disjo...",
        "fracture sous-trochantéro-diaphysaire double spiroïde déterminant trois segments s’étendant jusqu...",
        "fracture sus et intercondylienne gauche",
        "fracture très déplacée de l’extrémité distale du radius et de l’ulna gauche",
        "fracture équivalent bimalléolaire droite",
        "lesion osteochondrale fémorale gauche",
        "lésion dégénérative spondylo-discale étagée de L1-S1 AVEC PINCEMENT LATERALISE l3-l4",
        "lésion méniscale latérale gauche",
        "lésion ostéochondrale fémorale gauche",
        "lésion traumatique (confère compte rendu)",
        "rupture ancienne de ce ligament",
        "rupture complexe transfixante de la corne postérieure du ménisque latéral ;",
        "rupture complète du LCA et une fissure du ménisque médial",
        "rupture complète du ligament croisé antérieur et fissure du ménisque médial",
        "rupture complète du ligament croisé antérieur et une fissure du ménisque médial",
        "rupture complète du ligament croisé antérieur plus fissure corne postérieure ménisque latéral sur",
        "rupture complète du ligament croisé antérieur plus fissure corne postérieure ménisque latéral sur...",
        "rupture du Ligament Croisé antérieur du genou",
        "rupture du Ligament Croisé antérieur du genou droit",
        "rupture du clou dans le fragment distal",
        "rupture du ligament croisé antérieur",
        "rupture du ligament croisé antérieur droit associée à une fissure de la corne méniscale postérieu",
        "rupture du ligament croisé antérieur droit associée à une fissure de la corne méniscale postérieu...",
        "rupture du ligament croisé antérieur et une fissure de la corne postérieure du ménisque médial du...",
        "rupture du ligament croisé antérieur plus fissure verticale transfixiante de la corne postérieure...",
        "rupture du ménisque médial droit",
        "rupture du ménisque médial et du ménisque latéral, associée à une rupture incomplète du ligament",
        "rupture du ménisque médial et du ménisque latéral, associée à une rupture incomplète du ligament ...",
        "rupture du tendon patellaire gauche",
        "rupture en anse de seau de la corne antérieure du ménisque latéral, ainsi qu’une lésion ostéochon",
        "rupture en anse de seau de la corne antérieure du ménisque latéral, ainsi qu’une lésion ostéochon...",
        "rupture incomplète du ligament croisé antérieur ;",
        "rupture incomplète du ligament croisé antérieur plus fissure verticale transfixiante de la corne ...",
        "rupture méniscale médiale instable",
        "rupture quasi complète du ligament croisé antérieur",
        "rupture totale du 1/3 moyen du ligament croisé antérieur ;",
        "rupture verticale de la corne postérieure du ménisque latéral ;",
        "rupture verticale à la partie moyenne du ménisque latéral du genou gauche grade 3 de Stoller",
        "syndrome douloureux du ménisque médial droit",
        "syndrome infectieux",
        "tendinite d’insertion tibiale du fascia lata",
        "tendinite d’insertion tibiale du tendon patellaire droit",
        "tendinite patellaire",
        "varicocèle bilatérale douleur testiculaire chronique"
    ],
    INTERVENTIONS: [
        "AA01038 ostéosynthèse d'une fracture ancienne de la fibula k50+25",
        "AA01038 ostéosynthèse d'une fracture de la mlléole latérale K50/2",
        "AA01041 ostéosynthèse d'une fracture multifragmentaire",
        "AA01055 ostéosynthèse d'une fracture ancienne du fémur k120+60",
        "AB03005 prélèvement greffons iliaques k50/2",
        "ABLATION DE MATERIEL + OSTEOSYNTHESE PAR VIS + TIGE + CAGE L3 L4 L5",
        "ABLATION DE MATERIEL D'OSTEOSYNTHESE (0,6K150 soit K90)",
        "ABLATION DE MATERIEL FEMUR DISTAL 0,6 K150",
        "ABLATION MATERIEL D'OSTEOSYNTHESE DE L'HUMERUS DROIT",
        "AMOS + ALESAGE DE PROPRETE + FISTULECTOMIE + LAVAGE CHIRURGICAL PULSE + ANTIBIOTIQUE",
        "Ablation  Osteosynthese Humerus proximal",
        "Ablation Osteosynthese Humerus proximal",
        "Ablation de Matériel d'Osthéosynthèse Fémur",
        "Ablation de Sonde double J par urétéroscopie",
        "Ablation de broche fibulaire",
        "Ablation de clou tibial  droit",
        "Ablation de clou tibial droit",
        "Ablation de la plaque épiphysiodèsedroite & Ostéotomie de relaxation du tibia distal gauche",
        "Ablation de matériel d'ostéosynthèse (AMOS)",
        "Ablation de matériel d'ostéosynthèse de la cheville (D)",
        "Ablation de matériel d'ostéosynthèse des plateaux tibiaux (D)",
        "Ablation de matériel de la jambe gauche",
        "Ablation de sonde JJ",
        "Ablation des matériels d'ostéosynthèse des deux fémurs, du tibia gauche et de la cheville gauche",
        "Ablation du clou fémoral droit",
        "Accouchement par césarienne",
        "Arthroplastie intéressant fémur",
        "Arthroscopie",
        "Arthroscopie  Ménisectomie Genou (D)",
        "Arthroscopie ET Ménisectomie",
        "Arthroscopie Ménisectomie Genou (D)",
        "Arthroscopie diagnostique & debridement du genou",
        "Arthroscopie diagnostique + lavage des épines tibiales",
        "Arthroscopie diagnostique , thérapeutique du genou droit",
        "Arthroscopie diagnostique et Ménisectomie",
        "Arthroscopie diagnostique et Ménisectomie du genou (D)",
        "Arthroscopie diagnostique et méniscectomie du genou droit",
        "Arthroscopie diagnostique et méniscectomie du genou gauche",
        "Arthroscopie diagnostique et ménisectomie des 2 genoux",
        "Arthroscopie diagnostique et therapeutique du genou",
        "Arthroscopie diagnostique et therapeutique du genou (D)",
        "Arthroscopie diagnostique et therapeutique du genou (G)",
        "Arthroscopie diagnostique et therapeutique du genou Droit",
        "Arthroscopie diagnostique et therapeutique du genou droit",
        "Arthroscopie diagnostique et therapeutique du genou gauche",
        "Arthroscopie diagnostique et thérapeutique avec ménisectomie du genou",
        "Arthroscopie diagnostique et thérapeutique avec ménisectomie du genou (D)",
        "Arthroscopie diagnostique et thérapeutique avec ménisectomie du genou (G)",
        "Arthroscopie diagnostique et thérapeutique avec ménisectomie du genou GAUCHE",
        "Arthroscopie diagnostique et thérapeutique du genou",
        "Arthroscopie diagnostique et thérapeutique du genou (G)",
        "Arthroscopie diagnostique et thérapeutique du genou Droit",
        "Arthroscopie diagnostique et thérapeutique du genou droit",
        "Arthroscopie diagnostique;therapeutique du genou",
        "Arthroscopie du genou et Méniscectomie médiale",
        "Arthroscopie et Ménisectomie",
        "Arthroscopie, Ménisectomie et Ligamentoplastie du LCA",
        "Aspiration manuelle Intra Utérine (AMIU)",
        "CURE HERNIAIRE GAUCHE + CURE DE VARICOCELE BILATERALE",
        "CURETAGE + LAVAGE + PLASTIE CUTANEE DE RECOUVREMENT",
        "Colonne d'arthroscopie",
        "Cure Hernie Ombilicale",
        "Cure d'hydrocèle ou de varicocèle",
        "Cure de Ectopie testiculaire",
        "Cure de Hernie, y compris la hernie étranglée",
        "Cure de Pseudarthrose de l'humérus avec ostéosynthèse (K180)",
        "Cure de Péritonite",
        "Cure herniaire droite + adenomectomie prostatique",
        "Curetage de poches parodontales",
        "Curetage osseux et Plastie cutanée de couverture",
        "Descente de JJ Biatérale+ et RTUP bipolaire",
        "Descente de sonde JJ",
        "ENCLOUAGE DU FEMUR +HAUBANAGE DE LA PATELLA",
        "Embrochage Du 5e Métatarsien",
        "Embrochage de P1 du 5e doigt gauche",
        "Enclouage Gamma Long",
        "Enclouage Gamma Long + double Cerclage",
        "Enclouage Gamma Long Gauche",
        "Enclouage type gamma long (k 150+75)",
        "Extraction dent enclavée",
        "Extraction des corps étrangers",
        "Extraction simple",
        "Exérèse Hygroma du coude gauche K60",
        "Forfait Colonne d'Arthroscopie",
        "Forfait colonne Arthroscopie",
        "Forfait colonne arthroscopie",
        "Forfait colonne d'Arthroscopie",
        "Forfait colonne d'arthroscopie",
        "Greffe cutanée de la cuisse gauche",
        "HAUBANAGE DE LA PATELLA & AUTOGREFFE ILIAQUE",
        "Intervention 1: ostéosynthèse d'une fracture ancienne du femur K180",
        "Laminectomie + Arthrodèse T11, T12, L1 et L2",
        "Laminectomie Cervicale",
        "Levée d'une rétention d'urine: cystostomie suspubienne",
        "Ligamentoplastie du LCA par DIDT",
        "NLPC + URETEROSCOPIE",
        "OSTEOSYNTHESE DE L'HUMERUS PROXIMAL DROIT- K120",
        "OSTEOSYNTHESE DE L'HUMERUS PROXIMAL DROIT- K120 & AUTOGREFFE ILIAQUE- K80",
        "OSTEOSYNTHESE DE LA MALEOLE LATERALE + SYNDESMODESE",
        "OSTEOSYNTHESE DES DEUX OS DE L'AVANT BRAS",
        "Osteosynthese",
        "Osteosynthese Humerus proximal",
        "Osthéosynthese du fémur",
        "Ostéosynthese d'une fracture de la cheville",
        "Ostéosynthese d'une fracture récente des deux os",
        "Ostéosynthèse d'une fracture diaphysaire ancienne du tibia  K180",
        "Ostéosynthèse d'une fracture diaphysaire ancienne du tibia K180",
        "Ostéosynthèse de la cheville gauche",
        "Ostéosynthèse des deux (02) fémurs",
        "Ostéosynthèse du fémur distal droit",
        "Ostéosynthèse du tibia ou du fémur",
        "Ostéosynthèse fracture poignet gauche",
        "Ostéosynthèse radius",
        "Ostéotomie Calcanéenne de Translation et de relaxation +Ostéosynthèse",
        "Pose d'attelles de contention",
        "Pose de sonde urinaire à demeure 5 k",
        "Prelevement de greffe Iliaque K50/2",
        "REPRISE Ostéosynthèse radius",
        "RESECTION TRANSURETRALE DE LA PROSTATE (RTUP)",
        "RESECTION TRANSURETRALE DE LA PROSTATE (RTUP) - K180",
        "Recalibrage + Arthrodèse L1 à L5",
        "Recalibrage + Arthrodèse L3 A S1",
        "Recalibrage et arthrodese",
        "Résection Transurétrale de la Prostate (RTUP)",
        "SYNTHESE D'UNE  PSEUDOARTHROSE DU FEMUR DISTAL(K150)",
        "SYNTHESE D'UNE PSEUDOARTHROSE DU FEMUR DISTAL(K150)",
        "Suture + quadrage",
        "Suture de plaies",
        "Tenoplastie ( k",
        "Traitement confection d'une botte plâtrée",
        "Ténolyse des fléchisseurs",
        "URETEROSCOPLASTIE + SONDE JJ",
        "Une Urétéroscopie droite et une montée de Sonde JJ",
        "Ureteroscopie + Montée de sonde JJ",
        "Ureteroscopie droite",
        "Ureteroscopie droite + Montée de sonde JJ",
        "Ureteroscopie gauche + Montée de sonde JJ + NLPC",
        "ostéosynthèse d'une fracture ancienne du tibia k120",
        "ostéotomie et ostéosynthèse",
        "ostéotomie iliaque 0,5k80 comblement defect osseux 0,5k80",
        "synthèse d'une pseudarthrose du fémur distal(k 150+75)"
    ]
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
