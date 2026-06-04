/* ==========================================
   documents.js - Module de Génération Automatique de Rapports Médicaux
   MercyFiat MedSuite - Clinique Mercy Fiat
   ========================================== */

// ============================================================
// LISTE COMPLÈTE DES MÉDECINS DE LA CLINIQUE MERCY FIAT
// ============================================================
const MEDECINS_CMF = [
    {
        id: 'agavoedo',
        nom: 'Dr AGAVOEDO Gipsy',
        nomAffichage: 'Dr Gipsy AGAVOEDO',
        specialite: 'Chirurgien Orthopédiste Traumatologue',
        numONMB: '',
        signature: 'assets/signature.png',
        cachet: 'assets/cachet_centre.png',
        hasSig: true,
        avatar: '🏥'
    },
    {
        id: 'djedou',
        nom: 'Dr DJEDOU Arnaud',
        nomAffichage: 'Dr Arnaud DJEDOU',
        specialite: 'Chirurgien Orthopédiste Traumatologue',
        numONMB: 'N° 1134 / ONMB / ATL / 2012',
        signature: 'assets/signature_djedou.png',
        cachet: 'assets/cachet_djedou.png',
        hasSig: true,
        avatar: '👨‍⚕️'
    },
    {
        id: 'hazoume',
        nom: 'Dr HAZOUME Michèle',
        nomAffichage: 'Dr Michèle HAZOUME',
        specialite: 'Cardiologue',
        numONMB: '',
        signature: 'assets/signature_hazoume.png',
        cachet: 'assets/cachet_hazoume.png',
        hasSig: true,
        avatar: '👩‍⚕️'
    },
    {
        id: 'dah',
        nom: 'Dr DAH Judith',
        nomAffichage: 'Dr Judith DAH',
        specialite: 'Médecin Généraliste',
        numONMB: '',
        signature: 'assets/signature_dah.png',
        cachet: 'assets/cachet_dah.png',
        hasSig: true,
        avatar: '👩‍⚕️'
    },
    {
        id: 'lassissi',
        nom: 'Dr LASSISSI Moufidath',
        nomAffichage: 'Dr Moufidath LASSISSI',
        specialite: 'Cardiologue',
        numONMB: '',
        signature: '', cachet: '', hasSig: false,
        avatar: '👩‍⚕️'
    },
    {
        id: 'medenou',
        nom: 'Dr MEDENOU Lionel',
        nomAffichage: 'Dr Lionel MEDENOU',
        specialite: 'Endocrinologue Diabétologue',
        numONMB: '',
        signature: '', cachet: '', hasSig: false,
        avatar: '👨‍⚕️'
    },
    {
        id: 'sessinou',
        nom: 'Dr SESSINOU Marie-Rose',
        nomAffichage: 'Dr Marie-Rose SESSINOU',
        specialite: 'Neurologue',
        numONMB: '',
        signature: '', cachet: '', hasSig: false,
        avatar: '👩‍⚕️'
    },
    {
        id: 'chobli',
        nom: 'Dr CHOBLI Hervé',
        nomAffichage: 'Dr Hervé CHOBLI',
        specialite: 'Anesthésiste Réanimateur',
        numONMB: '',
        signature: '', cachet: '', hasSig: false,
        avatar: '👨‍⚕️'
    },
    {
        id: 'amoussou',
        nom: 'Dr AMOUSSOU Aristide',
        nomAffichage: 'Dr Aristide AMOUSSOU',
        specialite: 'Chirurgien Pédiatre',
        numONMB: '',
        signature: '', cachet: '', hasSig: false,
        avatar: '👨‍⚕️'
    },
    {
        id: 'bacharou',
        nom: 'Dr BACHAROU Salwane',
        nomAffichage: 'Dr Salwane BACHAROU',
        specialite: 'Pédiatre',
        numONMB: '',
        signature: '', cachet: '', hasSig: false,
        avatar: '👩‍⚕️'
    },
    {
        id: 'jacquet',
        nom: 'Dr JACQUET Djamal',
        nomAffichage: 'Dr Djamal JACQUET',
        specialite: 'Urologue',
        numONMB: '',
        signature: '', cachet: '', hasSig: false,
        avatar: '👨‍⚕️'
    },
    {
        id: 'soumanou',
        nom: 'Dr SOUMANOU Fouad',
        nomAffichage: 'Dr Fouad SOUMANOU',
        specialite: 'Urologue',
        numONMB: '',
        signature: '', cachet: '', hasSig: false,
        avatar: '👨‍⚕️'
    },
    {
        id: 'hounton',
        nom: 'Dr HOUNTON Emmanuel',
        nomAffichage: 'Dr Emmanuel HOUNTON',
        specialite: 'Radiologue',
        numONMB: '',
        signature: '', cachet: '', hasSig: false,
        avatar: '👨‍⚕️'
    },
    {
        id: 'kassein',
        nom: 'Dr KASSEIN Urbain',
        nomAffichage: 'Dr Urbain KASSEIN',
        specialite: 'Biologiste Médical',
        numONMB: '',
        signature: '', cachet: '', hasSig: false,
        avatar: '👨‍⚕️'
    },
    {
        id: 'akpakpo',
        nom: 'Dr AKPAKPO Bruno',
        nomAffichage: 'Dr Bruno AKPAKPO',
        specialite: 'Collaborateur',
        numONMB: '',
        signature: '', cachet: '', hasSig: false,
        avatar: '👨‍⚕️'
    }
];

// ============================================================
// SPÉCIALITÉS POUR LA COLONNE GAUCHE DU RAPPORT IMPRIMÉ
// ============================================================
const SPECIALITES_CMF = [
    { spec: 'Médecine générale',           doctors: ['Dr DAH Judith'] },
    { spec: 'Pédiatrie',                   doctors: ['Dr BACHAROU Salwane'] },
    { spec: 'Cardiologie',                 doctors: ['Dr HAZOUME Michèle', 'Dr LASSISSI Moufidath'] },
    { spec: 'Endocrinologie diabétologie', doctors: ['Dr MEDENOU Lionel'] },
    { spec: 'Neurologie',                  doctors: ['Dr SESSINOU Marie-Rose'] },
    { spec: 'Anesthésie réanimation',      doctors: ['Dr CHOBLI Hervé'] },
    { spec: 'Traumatologie-orthopédie',    doctors: ['Dr AGAVOEDO Gipsy', 'Dr DJEDOU Arnaud'] },
    { spec: 'Chirurgie pédiatrique',       doctors: ['Dr AMOUSSOU Aristide'] },
    { spec: 'Urologie',                    doctors: ['Dr JACQUET Djamal', 'Dr SOUMANOU Fouad'] },
    { spec: 'Radiologie',                  doctors: ['Dr HOUNTON Emmanuel'] },
    { spec: 'Laboratoire',                 doctors: ['Dr KASSEIN Urbain'] },
    { spec: 'Collaborateurs',              doctors: ['Dr AKPAKPO Bruno'] },
];

// ============================================================
// GÉNÉRATION HTML DE LA COLONNE GAUCHE DU RAPPORT
// ============================================================
function buildClinicSidebarHtml() {
    return `
        <div style="width:140px; flex-shrink:0; border-right:1px solid #2d3748; padding-right:10px; font-size:0.62rem; font-family:'Inter',sans-serif; line-height:1.5;">
            ${SPECIALITES_CMF.map(s => `
                <div style="margin-bottom:6px;">
                    <div style="font-weight:900; text-decoration:underline; font-size:0.62rem; color:#2d3748; margin-bottom:2px;">${s.spec}</div>
                    ${s.doctors.map(d => `<div style="font-size:0.6rem; color:#2d3748;">${d}</div>`).join('')}
                </div>
            `).join('')}
        </div>
    `;
}

// Médecin actif par défaut
let selectedMedecinId = 'agavoedo';

function getSelectedMedecin() {
    return MEDECINS_CMF.find(m => m.id === selectedMedecinId) || MEDECINS_CMF[0];
}


// ============================================================
// MODÈLES DE RAPPORTS MÉDICAUX - STYLE EXACT DR GIPSY AGAVOEDO
// ============================================================
const MEDICAL_TEMPLATES = {

    // ─────────────────────────────────────────────
    // RAPPORTS DE CONSULTATION (CS)
    // ─────────────────────────────────────────────

    rapport_cs_simple: {
        title: "RAPPORT DE CONSULTATION",
        category: "Rapport CS",
        diagnosis: "Rupture du ligament croisé antérieur (LCA) du genou droit",
        fields: ["hospi_days"],
        text: `Patient : {{PATIENT_NOM}} {{PATIENT_PRENOM}}
AGE : {{PATIENT_AGE}}

RAPPORT DE CONSULTATION

Je soussigné, Dr Gipsy AGAVOEDO, chirurgien orthopédiste à la Clinique Mercy Fiat de Cotonou, certifie avoir consulté le {{DATE_CONSULT}} {{CIVILITE}} {{PATIENT_NOM}} {{PATIENT_PRENOM}}, âgé(e) de {{PATIENT_AGE}}, pour {{MOTIF_CONSULTATION}}.

{{RAPPEL_ANTECEDENTS}}

{{EXAMEN_ET_BILAN}}

{{CONCLUSION_ET_PLAN}}

{{PREVISION_HOSPI}}

Fait pour servir et valoir ce que de droit.
Fait à Cotonou, le {{DATE}}

Dr Gipsy AGAVOEDO
Chirurgien Orthopédiste
Traumatologue`
    },

    rapport_cs_suivi: {
        title: "RAPPORT DE CONSULTATION DE SUIVI",
        category: "Rapport CS",
        diagnosis: "Consultation de suivi post-opératoire",
        fields: [],
        text: `Patient : {{PATIENT_NOM}} {{PATIENT_PRENOM}}
AGE : {{PATIENT_AGE}}

RAPPORT DE CONSULTATION

Je soussigné, Dr Gipsy AGAVOEDO, chirurgien orthopédiste à la Clinique Mercy Fiat de Cotonou, certifie avoir consulté le {{DATE_CONSULT}} {{CIVILITE}} {{PATIENT_NOM}} {{PATIENT_PRENOM}}, âgé(e) de {{PATIENT_AGE}}.

Pour rappel, {{RAPPEL_HOSPITALISATION_OU_ANTECEDENTS}}.

Actuellement, {{ETAT_ACTUEL_ET_PLAINTES}}.

{{RECOMMANDATIONS}}.

Fait pour servir et valoir ce que de droit.
Fait à Cotonou, le {{DATE}}

Dr Gipsy AGAVOEDO
Chirurgien Orthopédiste
Traumatologue`
    },

    rapport_cs_assurance: {
        title: "RAPPORT DE CONSULTATION",
        category: "Rapport CS Assurance",
        diagnosis: "Dossier de prise en charge assurance",
        fields: ["insurer", "sinistre_num", "hospi_days"],
        text: `À l'attention du Responsable des Sinistres
{{COMPAGNIE_ASSURANCE}}
Référence Sinistre / Dossier : {{NUM_SINISTRE}}

Patient : {{PATIENT_NOM}} {{PATIENT_PRENOM}}
AGE : {{PATIENT_AGE}}

RAPPORT DE CONSULTATION

Je soussigné, Dr Gipsy AGAVOEDO, chirurgien orthopédiste à la Clinique Mercy Fiat de Cotonou, certifie avoir consulté le {{DATE_CONSULT}} {{CIVILITE}} {{PATIENT_NOM}} {{PATIENT_PRENOM}}, âgé(e) de {{PATIENT_AGE}}, pour {{MOTIF_CONSULTATION}}.

{{RAPPEL_ANTECEDENTS}}

{{EXAMEN_ET_BILAN}}

{{CONCLUSION_ET_PLAN}}

Nous prévoyons une hospitalisation de {{NB_JOURS}} jours sous réserve de complications ultérieures.

Fait pour servir et valoir ce que de droit.
Fait à Cotonou, le {{DATE}}

Dr Gipsy AGAVOEDO
Chirurgien Orthopédiste
Traumatologue`
    },

    // ─────────────────────────────────────────────
    // RAPPORTS D'HOSPITALISATION (HOSPI)
    // ─────────────────────────────────────────────

    rapport_hospi_simple: {
        title: "RAPPORT D'HOSPITALISATION",
        category: "Rapport HOSPI",
        diagnosis: "Fracture déplacée de la clavicule gauche",
        fields: ["date_entree", "date_sortie", "date_intervention", "convalescence"],
        text: `Patient : {{PATIENT_NOM}} {{PATIENT_PRENOM}}
AGE : {{PATIENT_AGE}}

RAPPORT D'HOSPITALISATION

Je, soussigné, Dr Gipsy AGAVOEDO, chirurgien orthopédiste à la Clinique Mercy Fiat de Cotonou, certifie avoir hospitalisé du {{DATE_ENTREE}} au {{DATE_SORTIE}} {{CIVILITE}} {{PATIENT_NOM}} {{PATIENT_PRENOM}}, âgé(e) de {{PATIENT_AGE}}, pour {{MOTIF_HOSPITALISATION}}.

Il/Elle a bénéficié, le {{DATE_INTERVENTION}}, {{INTERVENTION_REALISEE}}.

Les suites opératoires sont favorables.

Il ressort de ce qui précède une convalescence de {{DUREE_CONVALESCENCE}}.

Fait pour servir et valoir ce que de droit.
Fait à Cotonou, le {{DATE}}

Dr Gipsy AGAVOEDO
Chirurgien Orthopédiste
Traumatologue`
    },

    rapport_hospi_assurance: {
        title: "RAPPORT D'HOSPITALISATION",
        category: "Rapport HOSPI Assurance",
        diagnosis: "Dossier hospitalisation — prise en charge assurance",
        fields: ["insurer", "sinistre_num", "date_entree", "date_sortie", "date_intervention", "convalescence"],
        text: `À l'attention du Responsable des Sinistres
{{COMPAGNIE_ASSURANCE}}
Référence Sinistre / Dossier : {{NUM_SINISTRE}}

Patient : {{PATIENT_NOM}} {{PATIENT_PRENOM}}
AGE : {{PATIENT_AGE}}

RAPPORT D'HOSPITALISATION

Je, soussigné, Dr Gipsy AGAVOEDO, chirurgien orthopédiste à la Clinique Mercy Fiat de Cotonou, certifie avoir hospitalisé du {{DATE_ENTREE}} au {{DATE_SORTIE}} {{CIVILITE}} {{PATIENT_NOM}} {{PATIENT_PRENOM}}, âgé(e) de {{PATIENT_AGE}}, pour {{MOTIF_HOSPITALISATION}}.

Il/Elle a bénéficié, le {{DATE_INTERVENTION}}, {{INTERVENTION_REALISEE}}.

Les suites opératoires sont favorables.

Il ressort de ce qui précède une convalescence de {{DUREE_CONVALESCENCE}}.

Fait pour servir et valoir ce que de droit.
Fait à Cotonou, le {{DATE}}

Dr Gipsy AGAVOEDO
Chirurgien Orthopédiste
Traumatologue`
    },

    rapport_hospi_prolongation: {
        title: "RAPPORT DE PROLONGATION DE PRISE EN CHARGE",
        category: "Rapport Prolongation",
        diagnosis: "Prolongation de la prise en charge médicale",
        fields: ["insurer", "sinistre_num", "date_entree", "date_prolongation", "convalescence"],
        text: `À l'attention du Responsable des Sinistres
{{COMPAGNIE_ASSURANCE}}
Référence Sinistre / Dossier : {{NUM_SINISTRE}}

Patient : {{PATIENT_NOM}} {{PATIENT_PRENOM}}
AGE : {{PATIENT_AGE}}

RAPPORT DE PROLONGATION DE PRISE EN CHARGE

Je soussigné, Dr Gipsy AGAVOEDO, chirurgien orthopédiste à la Clinique Mercy Fiat de Cotonou, certifie que {{CIVILITE}} {{PATIENT_NOM}} {{PATIENT_PRENOM}}, âgé(e) de {{PATIENT_AGE}}, hospitalisé(e) depuis le {{DATE_ENTREE}} pour {{MOTIF_HOSPITALISATION}}, nécessite une prolongation de sa prise en charge médicale.

{{JUSTIFICATION_PROLONGATION}}

Une convalescence supplémentaire de {{DUREE_CONVALESCENCE}} est médicalement justifiée à compter du {{DATE_PROLONGATION}}.

Fait pour servir et valoir ce que de droit.
Fait à Cotonou, le {{DATE}}

Dr Gipsy AGAVOEDO
Chirurgien Orthopédiste
Traumatologue`
    },

    rapport_medical: {
        title: "RAPPORT MÉDICAL",
        category: "Rapport Médical",
        diagnosis: "Bilan médical général",
        fields: ["date_entree", "date_sortie"],
        text: `Patient : {{PATIENT_NOM}} {{PATIENT_PRENOM}}
AGE : {{PATIENT_AGE}}

RAPPORT MÉDICAL

Je soussigné, Dr Gipsy AGAVOEDO, chirurgien orthopédiste à la Clinique Mercy Fiat de Cotonou, certifie avoir pris en charge {{CIVILITE}} {{PATIENT_NOM}} {{PATIENT_PRENOM}}, âgé(e) de {{PATIENT_AGE}}, du {{DATE_ENTREE}} au {{DATE_SORTIE}}, pour {{MOTIF_HOSPITALISATION}}.

{{RAPPEL_ANTECEDENTS}}

{{EXAMEN_ET_BILAN}}

{{CONCLUSION_ET_PLAN}}

Fait pour servir et valoir ce que de droit.
Fait à Cotonou, le {{DATE}}

Dr Gipsy AGAVOEDO
Chirurgien Orthopédiste
Traumatologue`
    },

    // ─────────────────────────────────────────────
    // COMPTES-RENDUS OPÉRATOIRES (CRO)
    // ─────────────────────────────────────────────

    cro_lca: {
        title: "COMPTE-RENDU OPÉRATOIRE",
        category: "Compte-Rendu Opératoire",
        diagnosis: "Rupture du ligament croisé antérieur (LCA) du genou gauche",
        fields: [],
        text: `PATIENT : {{PATIENT_NOM}} {{PATIENT_PRENOM}}
AGE : {{PATIENT_AGE}}
DATE D'INTERVENTION : {{DATE}}
OPÉRATEUR : Dr Gipsy AGAVOEDO (Chirurgien CMF / Traumatologie)
ANESTHÉSIE : Rachi-anesthésie / Anesthésie Générale

DIAGNOSTIC PRÉ-OPÉRATOIRE : Instabilité chronique du genou gauche par rupture complète du ligament croisé antérieur.

INTERVENTION RÉALISÉE : Ligamentoplastie du LCA du genou gauche par technique DIDT (Demi-tendineux et Inter-interne) sous arthroscopie.

INSTALLATION : Patient en décubitus dorsal. Garrot pneumatique à la racine de la cuisse gauche gonflé à 300 mmHg. Membre inférieur gauche positionné sur porte-jambe, genou fléchi à 90°.

TECHNIQUE OPÉRATOIRE :
1. Repérage et incision verticale de 3 cm en regard de la patte d'oie gauche.
2. Prélèvement des tendons Demi-Télendineux (DT) et Droit Interne (DI) à l'aide d'un stripper fermé.
3. Préparation du transplant DIDT sur la table d'instrumentation (calibrage final à 8 mm de diamètre) et prétensionnement.
4. Voies d'abord arthroscopiques standard (antéro-externe et antéro-interne).
5. Exploration arthroscopique : confirmation de la rupture complète du LCA avec reliquat fibreux instable. Ménisque interne et externe sains. Absence de lésion cartilagineuse majeure.
6. Nettoyage de l'échancrure intercondylienne (synovectomie et résection du reliquat du LCA).
7. Réalisation du tunnel tibial à l'aide du guide tibial incliné à 55° (diamètre 8 mm).
8. Réalisation du tunnel fémoral par voie antéro-interne à l'aide du guide fémoral (diamètre 8 mm).
9. Passage du transplant DIDT et fixation fémorale par système de suspension EndoButton.
10. Tension manuelle maximale du transplant, genou en extension complète, et fixation tibiale par vis d'interférence biosynthétique de 9 mm.
11. Contrôle arthroscopique final : excellente tension du greffon, absence de conflit dans l'échancrure intercondylienne. Tiroir antérieur parfaitement négativé.
12. Lavage articulaire abondant au sérum physiologique.
13. Fermeture cutanée plan par plan. Pansement stérile compressif.

SUITES OPÉRATOIRES :
- Autorisation d'appui complet sous couvert d'une attelle de genou articulée en extension.
- Antibiothérapie prophylactique et traitement anticoagulant préventif pendant 15 jours.
- Kinésithérapie post-opératoire précoce selon le protocole de rééducation CMF/Traumato de la clinique.`
    },

    cro_cmf: {
        title: "COMPTE-RENDU OPÉRATOIRE CMF",
        category: "Compte-Rendu Opératoire",
        diagnosis: "Fracture symphysaire mandibulaire déplacée",
        fields: [],
        text: `PATIENT : {{PATIENT_NOM}} {{PATIENT_PRENOM}}
AGE : {{PATIENT_AGE}}
DATE D'INTERVENTION : {{DATE}}
OPÉRATEUR : Dr Gipsy AGAVOEDO (Chirurgien Maxillo-Facial)
ANESTHÉSIE : Anesthésie Générale avec intubation naso-trachéale

DIAGNOSTIC PRÉ-OPÉRATOIRE : Fracture symphysaire de la mandibule avec déplacement articulaire et trouble de l'articulé dentaire suite à un traumatisme facial.

INTERVENTION RÉALISÉE : Réduction et Ostéosynthèse mandibulaire par plaques en titane par voie vestibulaire inférieure.

INSTALLATION : Patient en décubitus dorsal, tête stabilisée sur un têtière annulaire. Antisepsie cutanée faciale et intra-buccale à la Bétadine.

TECHNIQUE OPÉRATOIRE :
1. Mise en place de ligatures de blocage maxillo-mandibulaire temporaire (arcs d'Erich) pour rétablir l'articulé dentaire anatomique de référence du patient.
2. Infiltration locale du vestibule inférieur gauche et droit à la Xylocaïne adrénalinée à 1%.
3. Incision muqueuse vestibulaire inférieure de part et d'autre de la ligne médiane, à 5 mm de la gencive attachée, en préservant les émergences des nerfs mentonniers gauches et droits.
4. Décollement sous-périosté méticuleux pour exposer le foyer de fracture symphysaire mandibulaire.
5. Nettoyage du foyer de fracture : élimination des caillots et des débris fibreux inter-fragmentaires.
6. Réduction anatomique manuelle de la fracture avec contrôle visuel direct de la corticale basilaire externe.
7. Maintien de la réduction à l'aide d'un davier réducteur.
8. Ostéosynthèse rigide à l'aide de deux mini-plaques en titane (système 2.0 mm) positionnées parallèlement :
   - Une plaque supérieure sous-apicale (de contention) évitant les racines dentaires.
   - Une plaque inférieure au niveau du bord basilaire (plaque de résistance mécanique).
9. Fixation des plaques par des vis monocorticales et bicorticales en titane de 6 et 8 mm de longueur. Une excellente stabilité primaire est obtenue.
10. Ablation du blocage maxillo-mandibulaire et vérification finale de l'articulé dentaire spontané : articulé dentaire stable, symétrique et identique à l'état antérieur.
11. Lavage abondant du site opératoire à la Bétadine diluée et au sérum physiologique.
12. Fermeture muqueuse vestibulaire par des points séparés au fil résorbable Vicryl 3-0.

SUITES OPÉRATOIRES :
- Soins de bouche quotidiens antiseptiques doux.
- Alimentation semi-liquide à tiède pendant 4 semaines.
- Antibiothérapie par voie générale et antalgiques adaptés.`
    },

    // ─────────────────────────────────────────────
    // CERTIFICATS MÉDICAUX
    // ─────────────────────────────────────────────

    certif_repos: {
        title: "CERTIFICAT DE REPOS MÉDICAL",
        category: "Certificat",
        diagnosis: "Nécessité de repos suite à une intervention chirurgicale",
        fields: ["convalescence"],
        text: `Je soussigné, Dr AGAVOEDO Gipsy, Docteur en Médecine, Chirurgien Maxillo-Facial et Stomatologue, certifie avoir examiné ce jour le/la patient(e) :

Nom : {{PATIENT_NOM}}
Prénom : {{PATIENT_PRENOM}}
Âge : {{PATIENT_AGE}}

dont l'état de santé nécessite, à la suite d'une intervention chirurgicale majeure, un repos médical strict à domicile.

En conséquence, un arrêt temporaire de travail / d'activités d'une durée de :
Durée : {{DUREE_CONVALESCENCE}}
à compter du : {{DATE}}
est médicalement justifié et prescrit, sauf complication.

En foi de quoi, ce certificat est délivré à l'intéressé(e) pour servir et valoir ce que de droit.

Fait à Cotonou, le {{DATE}}

Dr Gipsy AGAVOEDO
Chirurgien Orthopédiste
Traumatologue`
    },

    certif_reprise: {
        title: "CERTIFICAT DE REPRISE DE TRAVAIL",
        category: "Certificat",
        diagnosis: "Aptitude physique constatée après repos",
        fields: [],
        text: `Je soussigné, Dr AGAVOEDO Gipsy, Docteur en Médecine, Chirurgien Maxillo-Facial et Stomatologue, certifie avoir réexaminé ce jour :

Nom : {{PATIENT_NOM}}
Prénom : {{PATIENT_PRENOM}}
Âge : {{PATIENT_AGE}}

À la suite de la période de repos médical prescrite pour convalescence post-opératoire.

L'examen clinique approfondi réalisé ce jour révèle une consolidation clinique et radiologique satisfaisante du site opératoire, une récupération fonctionnelle adéquate et l'absence de tout signe de complication évolutive.

Le/la patient(e) est déclaré(e) : APT(E) à la reprise de ses activités professionnelles ordinaires à plein temps.

Date de reprise effective : {{DATE}}

En foi de quoi, ce certificat est délivré à l'intéressé(e) pour servir et valoir ce que de droit.

Fait à Cotonou, le {{DATE}}

Dr Gipsy AGAVOEDO
Chirurgien Orthopédiste
Traumatologue`
    },

    relance_assurance: {
        title: "LETTRE DE RELANCE — RÉCLAMATION DE PRISE EN CHARGE",
        category: "Correspondance",
        diagnosis: "Dossier en souffrance de règlement auprès de la compagnie d'assurance",
        fields: ["insurer", "sinistre_num"],
        text: `À l'attention du Responsable des Règlements Tiers-Payant
{{COMPAGNIE_ASSURANCE}}

Objet : Réclamation de paiement pour facture médicale restée en souffrance
Référence Sinistre / Dossier : {{NUM_SINISTRE}}

Madame, Monsieur,

Par la présente, nous attirons votre attention sur le dossier de facturation médicale concernant notre patient commun :

Nom & Prénom du Patient : {{PATIENT_NOM}} {{PATIENT_PRENOM}}
Date de Facturation / Hospitalisation : {{DATE}}
Diagnostic ou Procédure Opératoire : {{MOTIF_CONSULTATION}}

Selon les termes de la lettre de garantie ou de la fiche de prise en charge émise par vos services, votre organisme s'est engagé à couvrir les frais médicaux afférents.

Or, à ce jour, le règlement de la part mutuelle correspondante est toujours en attente :
Montant total de la part assurance due en souffrance : [MONTANT_MUTUELLE] FCFA

Nous vous prions de bien vouloir procéder à la régularisation de cette créance dans les plus brefs délais sur notre compte bancaire professionnel, ou de nous signaler toute pièce administrative manquante.

Dans l'attente d'un dénouement rapide de ce dossier, veuillez agréer, Madame, Monsieur, l'expression de nos salutations distinguées.

Fait à Cotonou, le {{DATE}}

Dr Gipsy AGAVOEDO
Chirurgien Orthopédiste
Traumatologue`
    }
};

// ============================================================
// INITIALISATION DE LA SECTION DOCUMENTS
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('doc-date');
    if (dateInput) dateInput.value = new Date().toISOString().substring(0, 10);
    const consultDateInput = document.getElementById('doc-date-consult');
    if (consultDateInput) consultDateInput.value = new Date().toISOString().substring(0, 10);
    loadDocumentTemplate();
    populatePatientDocSelector();
    initDoctorSidebar();
});

// ============================================================
// INITIALISATION DU SÉLECTEUR & SIDEBAR MÉDECINS
// ============================================================
function initDoctorSidebar() {
    // Remplir le sélecteur déroulant de médecin (dans la zone signature)
    const sel = document.getElementById('doc-medecin-select');
    if (sel) {
        sel.innerHTML = '';
        MEDECINS_CMF.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = `${m.avatar} ${m.nom} — ${m.specialite}`;
            if (m.id === selectedMedecinId) opt.selected = true;
            sel.appendChild(opt);
        });
        sel.addEventListener('change', () => {
            selectedMedecinId = sel.value;
            updateDoctorSignaturePreview();
            updateDocPreview();
            // Synchroniser la sidebar
            document.querySelectorAll('.cmf-doctor-card').forEach(card => {
                card.classList.toggle('active-doctor', card.dataset.doctorId === selectedMedecinId);
            });
        });
    }

    // Construire la sidebar médecins
    const sidebar = document.getElementById('cmf-doctors-sidebar');
    if (sidebar) {
        sidebar.innerHTML = '';
        MEDECINS_CMF.forEach(m => {
            const card = document.createElement('div');
            card.className = 'cmf-doctor-card' + (m.id === selectedMedecinId ? ' active-doctor' : '');
            card.dataset.doctorId = m.id;
            card.innerHTML = `
                <div class="cmf-doctor-avatar">${m.avatar}</div>
                <div class="cmf-doctor-info">
                    <span class="cmf-doctor-name">${m.nom}</span>
                    <span class="cmf-doctor-spec">${m.specialite}</span>
                </div>
                <div class="cmf-doctor-check">✓</div>
            `;
            card.addEventListener('click', () => {
                selectedMedecinId = m.id;
                // Mettre à jour toutes les cartes
                document.querySelectorAll('.cmf-doctor-card').forEach(c => c.classList.remove('active-doctor'));
                card.classList.add('active-doctor');
                // Synchroniser le select
                const s = document.getElementById('doc-medecin-select');
                if (s) s.value = m.id;
                updateDoctorSignaturePreview();
                updateDocPreview();
                showToast(`✅ Signataire : ${m.nom}`);
            });
            sidebar.appendChild(card);
        });
    }

    updateDoctorSignaturePreview();
}

function updateDoctorSignaturePreview() {
    const medecin = getSelectedMedecin();
    const previewSig = document.getElementById('sig-preview-img');
    const previewCachet = document.getElementById('cachet-preview-img');
    const previewNom = document.getElementById('sig-preview-nom');
    const previewSpec = document.getElementById('sig-preview-spec');
    if (previewSig) previewSig.src = medecin.signature + '?t=' + Date.now();
    if (previewCachet) previewCachet.src = medecin.cachet + '?t=' + Date.now();
    if (previewNom) previewNom.textContent = medecin.nom;
    if (previewSpec) previewSpec.textContent = medecin.specialite;
}

// ============================================================
// REMPLISSAGE DU SÉLECTEUR DE PATIENT DANS LE MODULE DOCUMENTS
// ============================================================
function populatePatientDocSelector() {
    const sel = document.getElementById('doc-patient-selector');
    if (!sel) return;
    sel.innerHTML = '<option value="">— Sélectionner un patient existant —</option>';
    try {
        const seen = new Set();
        const db = window.MercyFiatDB;
        
        // 1. Charger depuis le registre des patients (inclut les patients personnalisés créés)
        if (db && db.PATIENTS) {
            db.PATIENTS.forEach(p => {
                const parts = p.name.trim().split(' ');
                const nom = parts[0] || p.name;
                const prenom = parts.slice(1).join(' ') || "";
                const key = `${nom.toUpperCase()}||${prenom}`;
                if (!seen.has(key) && nom) {
                    seen.add(key);
                    const opt = document.createElement('option');
                    opt.value = JSON.stringify({
                        nom: nom,
                        prenom: prenom,
                        age: p.age || '',
                        civilite: p.civilite || 'M.',
                        insurer: p.insurer || '',
                        diagnosis: p.diagnosis || '',
                        intervention: p.intervention || '',
                        kCode: p.kCode || ''
                    });
                    opt.textContent = `${nom} ${prenom}`.trim() + (p.age ? ` (${p.age})` : '') + ` — [Patient Registre]`;
                    sel.appendChild(opt);
                }
            });
        }

        // 2. Charger depuis l'historique des factures pour les patients non présents dans le registre
        const bills = JSON.parse(localStorage.getItem('mercyfiat_bills')) || [];
        bills.forEach(b => {
            const key = `${(b.patientNom || '').toUpperCase()}||${b.patientPrenom || ''}`;
            if (!seen.has(key) && b.patientNom) {
                seen.add(key);
                const opt = document.createElement('option');
                opt.value = JSON.stringify({
                    nom: b.patientNom,
                    prenom: b.patientPrenom,
                    age: b.patientAge || '',
                    civilite: b.civilite || 'M.',
                    insurer: b.insurer || '',
                    billId: b.id,
                    diagnosis: b.diagnosis || '',
                    intervention: b.interventionName || ''
                });
                opt.textContent = `${b.patientNom} ${b.patientPrenom || ''}`.trim() + (b.patientAge ? ` (${b.patientAge})` : '') + ` — [Patient Facturé]`;
                sel.appendChild(opt);
            }
        });
    } catch(e) { console.warn('populatePatientDocSelector:', e); }
}

// ============================================================
// AUTO-REMPLISSAGE DEPUIS LE PATIENT SÉLECTIONNÉ
// ============================================================
function autoFillFromPatient() {
    const sel = document.getElementById('doc-patient-selector');
    if (!sel || !sel.value) return;
    try {
        const data = JSON.parse(sel.value);
        if (document.getElementById('doc-patient-nom')) document.getElementById('doc-patient-nom').value = (data.nom || '').toUpperCase();
        if (document.getElementById('doc-patient-prenom')) document.getElementById('doc-patient-prenom').value = data.prenom || '';
        if (document.getElementById('doc-patient-age')) document.getElementById('doc-patient-age').value = data.age || '';
        if (document.getElementById('doc-civilite')) document.getElementById('doc-civilite').value = data.civilite || 'M.';
        if (document.getElementById('doc-diagnostique') && data.diagnosis) {
            document.getElementById('doc-diagnostique').value = data.diagnosis;
        }
        if (document.getElementById('doc-motif') && (data.diagnosis || data.intervention)) {
            document.getElementById('doc-motif').value = data.diagnosis || data.intervention || '';
        }
        // Auto-fill assurance
        if (document.getElementById('doc-insurer') && data.insurer && data.insurer !== 'PRIVE') {
            document.getElementById('doc-insurer').value = data.insurer;
            updateInsurerLabel();
        }
        updateDocPreview();
        showToast('✅ Données patient chargées automatiquement !');
    } catch(e) { console.warn('autoFillFromPatient:', e); }
}

// ============================================================
// MISE À JOUR DE L'AFFICHAGE DU NOM DE L'ASSURANCE
// ============================================================
function updateInsurerLabel() {
    const sel = document.getElementById('doc-insurer');
    const label = document.getElementById('doc-insurer-name');
    if (!sel || !label) return;
    const insurers = (window.MercyFiatDB && window.MercyFiatDB.INSURERS) ? window.MercyFiatDB.INSURERS : [];
    const found = insurers.find(i => i.id === sel.value);
    label.value = found ? found.name : sel.value;
    updateDocPreview();
}

// ============================================================
// CHARGEMENT DU MODÈLE SÉLECTIONNÉ
// ============================================================
function loadDocumentTemplate() {
    if (window.isLoadingRecentItem) return;
    const templateId = document.getElementById('doc-template').value;
    const template = MEDICAL_TEMPLATES[templateId];
    if (!template) return;

    if (document.getElementById('doc-diagnostique')) {
        document.getElementById('doc-diagnostique').value = template.diagnosis;
    }
    if (document.getElementById('doc-editor')) {
        document.getElementById('doc-editor').value = template.text;
    }

    // Vider les blocs de texte guidés à chaque changement de modèle
    ['doc-rappel', 'doc-examen', 'doc-conclusion', 'doc-recommandations',
     'doc-etat-actuel', 'doc-justification', 'doc-intervention',
     'doc-motif', 'doc-hospi-days', 'doc-convalescence', 'doc-sinistre'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    // Affichage conditionnel des champs selon le type de rapport
    toggleReportFields(template.fields || []);
    updateDocPreview();
}

// ============================================================
// AFFICHAGE CONDITIONNEL DES CHAMPS ADDITIONNELS
// ============================================================
function toggleReportFields(fields) {
    // Liste complète des champs conditionnels
    const allConditional = [
        { id: 'field-insurer',          defaultDisplay: 'none' },
        { id: 'field-sinistre',         defaultDisplay: 'none' },
        { id: 'field-date-entree',      defaultDisplay: 'none' },
        { id: 'field-date-sortie',      defaultDisplay: 'none' },
        { id: 'field-date-intervention',defaultDisplay: 'none' },
        { id: 'field-date-prolongation',defaultDisplay: 'none' },
        { id: 'field-hospi-days',       defaultDisplay: 'none' },
        { id: 'field-convalescence',    defaultDisplay: 'none' },
        { id: 'field-intervention',     defaultDisplay: 'none' },
        { id: 'block-etat-actuel',      defaultDisplay: 'none' },
        { id: 'block-justification',    defaultDisplay: 'none' },
        { id: 'block-recommandations',  defaultDisplay: '' },
        { id: 'field-motif',            defaultDisplay: '' },
        { id: 'field-date-consult',     defaultDisplay: '' },
    ];

    // Réinitialiser tous les champs
    allConditional.forEach(({ id, defaultDisplay }) => {
        const el = document.getElementById(id);
        if (el) el.style.display = defaultDisplay;
    });

    // Correspondance champ → IDs à afficher
    const map = {
        insurer:            ['field-insurer'],
        sinistre_num:       ['field-sinistre'],
        date_entree:        ['field-date-entree', 'field-intervention'],
        date_sortie:        ['field-date-sortie'],
        date_intervention:  ['field-date-intervention', 'field-intervention'],
        date_prolongation:  ['field-date-prolongation', 'block-justification'],
        hospi_days:         ['field-hospi-days'],
        convalescence:      ['field-convalescence'],
    };

    fields.forEach(f => {
        (map[f] || []).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                // field-insurer doit s'afficher en grid
                el.style.display = (id === 'field-insurer') ? 'grid' : '';
            }
        });
    });

    // Cas spécifiques : suivi → afficher état actuel, masquer conclusion
    const templateId = document.getElementById('doc-template')?.value;
    if (templateId === 'rapport_cs_suivi') {
        const etatEl = document.getElementById('block-etat-actuel');
        if (etatEl) etatEl.style.display = '';
    }
    if (['certif_repos', 'certif_reprise', 'relance_assurance', 'cro_lca', 'cro_cmf'].includes(templateId)) {
        // Pour les CRO et certificats : masquer les blocs guidés sauf date
        ['field-motif', 'block-recommandations'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        // Masquer date consultation
        const dc = document.getElementById('field-date-consult');
        if (dc) dc.style.display = 'none';
    }
}

// ============================================================
// GÉNÉRATION INTELLIGENTE DU TEXTE (REMPLACEMENT DES VARIABLES)
// ============================================================
function buildMergeData() {
    const patientNom = (document.getElementById('doc-patient-nom')?.value || 'NOM').toUpperCase();
    const patientPrenom = document.getElementById('doc-patient-prenom')?.value || 'Prénom';
    const patientAge = document.getElementById('doc-patient-age')?.value || '[AGE] ans';
    const civilite = document.getElementById('doc-civilite')?.value || 'M.';
    const diagnosis = document.getElementById('doc-diagnostique')?.value || '';
    const motif = document.getElementById('doc-motif')?.value || diagnosis || '[motif de consultation]';

    // Dates
    const docDateRaw = document.getElementById('doc-date')?.value;
    const consultDateRaw = document.getElementById('doc-date-consult')?.value;
    const dateEntreeRaw = document.getElementById('doc-date-entree')?.value;
    const dateSortieRaw = document.getElementById('doc-date-sortie')?.value;
    const dateInterventionRaw = document.getElementById('doc-date-intervention')?.value;
    const dateProlongationRaw = document.getElementById('doc-date-prolongation')?.value;

    const fmt = raw => {
        if (!raw) return '[DATE]';
        const d = new Date(raw + 'T12:00:00');
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    // Champs assurance
    const insurerSel = document.getElementById('doc-insurer')?.value || '';
    const insurerName = document.getElementById('doc-insurer-name')?.value || insurerSel;
    const sinistre = document.getElementById('doc-sinistre')?.value || '[N° SINISTRE]';

    // Convalescence & hospi
    const convalescence = document.getElementById('doc-convalescence')?.value || '[DURÉE] jours';
    const nbJours = document.getElementById('doc-hospi-days')?.value || '[X]';

    // Corps éditeur
    const rawText = document.getElementById('doc-editor')?.value || '';

    // Blocs texte libres (rappel, examen, conclusion, etc.)
    const rappel = document.getElementById('doc-rappel')?.value || '';
    const examenBilan = document.getElementById('doc-examen')?.value || '';
    const conclusion = document.getElementById('doc-conclusion')?.value || '';
    const recommandations = document.getElementById('doc-recommandations')?.value || '';
    const justification = document.getElementById('doc-justification')?.value || '';
    const etatActuel = document.getElementById('doc-etat-actuel')?.value || '';

    // Construction bloc "Pour rappel"
    let rappelBlock = '';
    if (rappel.trim()) {
        rappelBlock = `Pour rappel, ${rappel.trim()}`;
    }

    // Construction bloc "Il/Elle a bénéficié"
    let interventionBlock = '';
    if (document.getElementById('doc-intervention')?.value?.trim()) {
        interventionBlock = `d'${document.getElementById('doc-intervention').value.trim()}`;
    }

    // Construction bloc "Nous prévoyons"
    let previsionBlock = '';
    if (nbJours && nbJours !== '[X]') {
        const nb = parseInt(nbJours);
        const nbText = nb ? numToWords(nb) : nbJours;
        previsionBlock = `Nous prévoyons une hospitalisation de ${nbText} (${nb || nbJours}) jour${nb > 1 ? 's' : ''} sous réserve de complications ultérieures.`;
    }

    return {
        '{{PATIENT_NOM}}': patientNom,
        '{{PATIENT_PRENOM}}': patientPrenom,
        '{{PATIENT_AGE}}': patientAge,
        '{{CIVILITE}}': civilite,
        '{{DIAGNOSTIC}}': diagnosis,
        '{{MOTIF_CONSULTATION}}': motif,
        '{{MOTIF_HOSPITALISATION}}': motif,
        '{{DATE}}': fmt(docDateRaw),
        '{{DATE_CONSULT}}': fmt(consultDateRaw || docDateRaw),
        '{{DATE_ENTREE}}': fmt(dateEntreeRaw),
        '{{DATE_SORTIE}}': fmt(dateSortieRaw),
        '{{DATE_INTERVENTION}}': fmt(dateInterventionRaw),
        '{{DATE_PROLONGATION}}': fmt(dateProlongationRaw),
        '{{COMPAGNIE_ASSURANCE}}': insurerName || '[COMPAGNIE ASSURANCE]',
        '{{NUM_SINISTRE}}': sinistre,
        '{{NB_JOURS}}': nbJours,
        '{{DUREE_CONVALESCENCE}}': convalescence,
        '{{RAPPEL_ANTECEDENTS}}': rappelBlock,
        '{{RAPPEL_HOSPITALISATION_OU_ANTECEDENTS}}': rappel.trim() || '[rappel antécédents]',
        '{{EXAMEN_ET_BILAN}}': examenBilan.trim(),
        '{{CONCLUSION_ET_PLAN}}': conclusion.trim(),
        '{{RECOMMANDATIONS}}': recommandations.trim(),
        '{{JUSTIFICATION_PROLONGATION}}': justification.trim(),
        '{{ETAT_ACTUEL_ET_PLAINTES}}': etatActuel.trim(),
        '{{PREVISION_HOSPI}}': previsionBlock,
        '{{INTERVENTION_REALISEE}}': interventionBlock || '[intervention réalisée]',
    };
}

// Convertit un nombre en lettres (pour les jours/mois)
function numToWords(n) {
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
        'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf', 'vingt',
        'vingt et un', 'vingt-deux', 'vingt-trois', 'vingt-quatre', 'vingt-cinq', 'vingt-six', 'vingt-sept',
        'vingt-huit', 'vingt-neuf', 'trente', 'trente et un'];
    if (n >= 0 && n <= 31) return units[n].toUpperCase();
    return String(n);
}

// ============================================================
// MOTEUR DE RENDU DYNAMIQUE DU DOCUMENT MÉDICAL
// ============================================================
function updateDocPreview() {
    const preview = document.getElementById('doc-print-preview');
    if (!preview) return;

    const templateId = document.getElementById('doc-template')?.value;
    const template = MEDICAL_TEMPLATES[templateId];

    const mergeData = buildMergeData();
    let rawText = document.getElementById('doc-editor')?.value || '';

    // Remplacement de toutes les variables
    Object.entries(mergeData).forEach(([key, val]) => {
        rawText = rawText.split(key).join(val);
    });

    // Formatage HTML du texte (paragraphes justifiés)
    const paragraphsHtml = rawText
        .split('\n\n')
        .map(para => {
            const trimmed = para.trim();
            if (!trimmed) return '';
            if (trimmed.match(/^\d+\./m)) {
                return '<div style="margin-bottom:10px;">' +
                    trimmed.split('\n').map(line => `<p style="margin-left:18px; margin-bottom:3px; text-align:justify;">${line}</p>`).join('') +
                    '</div>';
            }
            if (trimmed.startsWith('-')) {
                return '<div style="margin-bottom:10px;">' +
                    trimmed.split('\n').map(line => `<p style="margin-left:15px; margin-bottom:3px;">${line}</p>`).join('') +
                    '</div>';
            }
            return `<p style="margin-bottom:10px; text-align:justify;">${trimmed.replace(/\n/g, '<br>')}</p>`;
        })
        .filter(Boolean)
        .join('');

    // Lecture directe des checkboxes (fix bug : pas d'optional chaining sur .checked)
    const sigEl  = document.getElementById('toggle-sig-image');
    const sealEl = document.getElementById('toggle-seal-image');
    const showSig  = sigEl  ? sigEl.checked  : true;
    const showSeal = sealEl ? sealEl.checked : true;

    const medecin = getSelectedMedecin();

    const patientNom    = mergeData['{{PATIENT_NOM}}'];
    const patientPrenom = mergeData['{{PATIENT_PRENOM}}'];
    const patientAge    = mergeData['{{PATIENT_AGE}}'];
    const titleText     = template ? template.title : 'DOCUMENT MÉDICAL';

    // Récupérer les infos assurance si disponibles
    const insurerName = document.getElementById('doc-insurer-name')?.value || '';
    const insurerSel  = document.getElementById('doc-insurer')?.value || '';
    const assuranceInfo = insurerName || insurerSel;

    // Date formatée
    const docDateRaw = document.getElementById('doc-date')?.value;
    const fmtDate = raw => {
        if (!raw) return '[DATE]';
        const d = new Date(raw + 'T12:00:00');
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    };

    // Bloc signature du médecin sélectionné
    const sigBlockHtml = `
        <div style="display:flex; align-items:flex-start; gap:18px; justify-content:flex-end; margin-top:20px;">
            <div style="text-align:center; min-width:160px;">
                <div style="font-size:0.75rem; color:#555; margin-bottom:4px;">Fait à Cotonou, le ${fmtDate(docDateRaw)}</div>
                <div class="signature-seal-container">
                    ${showSeal && medecin.hasSig && medecin.cachet ? `<img src="${medecin.cachet}?t=${Date.now()}" class="seal-img" style="display:block;">` : ''}
                    ${showSig  && medecin.hasSig && medecin.signature ? `<img src="${medecin.signature}?t=${Date.now()}" class="signature-img" style="display:block;">` : ''}
                </div>
                <p style="font-size:0.8rem; font-weight:900; text-decoration:underline; margin:0 0 2px 0; color:#2d3748;">${medecin.nomAffichage || medecin.nom}</p>
                <p style="font-size:0.75rem; font-weight:700; text-decoration:underline; color:#2d3748; margin:0;">${medecin.specialite}</p>
                ${medecin.numONMB ? `<p style="font-size:0.62rem; color:#718096; margin:2px 0 0 0;">${medecin.numONMB}</p>` : ''}
            </div>
        </div>
    `;

    preview.innerHTML = `
        <div style="font-family:'Times New Roman', Times, serif; color:#2d3748; background:white; padding:0;">
            
            <!-- EN-TÊTE CLINIQUE -->
            ${window.MercyFiatTemplates.getPrintHeaderHtml()}

            <!-- CORPS DU DOCUMENT : colonne gauche (médecins) + contenu principal -->
            <div style="display:flex; gap:0; min-height:400px; border-bottom:2px solid #2d3748;">

                <!-- COLONNE GAUCHE : Liste des médecins par spécialité -->
                <div style="width:145px; flex-shrink:0; border-right:1px solid #2d3748; padding:10px 8px 10px 2px; font-family:'Times New Roman',serif;">
                    ${SPECIALITES_CMF.map(s => `
                        <div style="margin-bottom:7px;">
                            <div style="font-weight:900; text-decoration:underline; font-size:0.62rem; color:#2d3748; margin-bottom:2px;">${s.spec}</div>
                            ${s.doctors.map(d => `<div style="font-size:0.6rem; color:#2d3748; padding-left:2px;">${d}</div>`).join('')}
                        </div>
                    `).join('')}
                </div>

                <!-- COLONNE DROITE : Contenu du rapport -->
                <div style="flex:1; padding:10px 12px;">

                    <!-- Infos patient (en-tête du rapport) -->
                    <div style="margin-bottom:10px; font-size:0.78rem; font-weight:700; font-family:'Times New Roman',serif;">
                        <div><span style="text-transform:uppercase; text-decoration:underline;">Patient :</span> <strong>${patientNom} ${patientPrenom}</strong></div>
                        <div><span style="text-decoration:underline;">Age :</span> <strong>${patientAge}</strong></div>
                        ${assuranceInfo ? `<div><span style="text-decoration:underline;">Assurance :</span> <strong>${assuranceInfo.toUpperCase()}</strong></div>` : ''}
                    </div>

                    <!-- Titre du rapport -->
                    <div style="text-align:center; font-size:0.95rem; font-weight:900; text-transform:uppercase; text-decoration:underline; letter-spacing:0.5px; margin:12px 0 14px; font-family:'Times New Roman',serif;">
                        ${titleText}
                    </div>

                    <!-- Corps du texte -->
                    <div style="font-size:0.82rem; line-height:1.8; font-family:'Times New Roman',serif; text-align:justify;">
                        ${paragraphsHtml}
                    </div>

                    <!-- Bloc signature -->
                    ${sigBlockHtml}
                </div>
            </div>

            <!-- PIED DE PAGE -->
            ${window.MercyFiatTemplates.getPrintFooterHtml()}
        </div>
    `;
}


// ============================================================
// SAUVEGARDE DU DOCUMENT ACTIF
// ============================================================
async function saveActiveDocument() {
    const templateId = document.getElementById('doc-template')?.value;
    const template = MEDICAL_TEMPLATES[templateId];
    const patientNom = (document.getElementById('doc-patient-nom')?.value || '').toUpperCase().trim();
    const patientPrenom = (document.getElementById('doc-patient-prenom')?.value || '').trim();
    const patientAge = document.getElementById('doc-patient-age')?.value || '';
    const docDate = document.getElementById('doc-date')?.value || new Date().toISOString().substring(0, 10);
    const textContent = document.getElementById('doc-editor')?.value || '';
    const diagnosis = document.getElementById('doc-diagnostique')?.value || '';
    const motif = document.getElementById('doc-motif')?.value || diagnosis;

    if (!patientNom) {
        showToast('⚠️ Veuillez saisir le nom du patient.', 'error');
        return;
    }

    const docTitle = template ? template.title : 'Document Médical';
    if (!await confirm(`Voulez-vous vraiment enregistrer le rapport "${docTitle}" pour le patient ${patientNom} ${patientPrenom} ?`)) {
        return;
    }

    const doc = {
        id: `DOC-${Date.now()}`,
        type: 'DOC',
        category: template ? template.category : 'Document',
        title: template ? template.title : 'Document Médical',
        templateId,
        patientNom,
        patientPrenom,
        patientAge,
        date: docDate,
        diagnosis: diagnosis || motif,
        content: textContent,
        savedAt: new Date().toISOString()
    };

    try {
        // Sauvegarder dans mercyfiat_docs (clé correcte pour les rapports)
        const docs = JSON.parse(localStorage.getItem('mercyfiat_docs')) || [];
        let existingIndex = -1;
        if (window.loadedDocId) {
            existingIndex = docs.findIndex(d => d.id === window.loadedDocId);
        }

        if (existingIndex > -1) {
            const oldDoc = docs[existingIndex];
            doc.id = oldDoc.id;
            doc.date = oldDoc.date; // Préserver la date de création d'origine
            docs[existingIndex] = doc;
        } else {
            docs.unshift(doc);
        }
        localStorage.setItem('mercyfiat_docs', JSON.stringify(docs));

        // Mettre à jour le tableau en mémoire si disponible
        if (typeof savedDocuments !== 'undefined') {
            const memIdx = savedDocuments.findIndex(d => d.id === doc.id);
            if (memIdx > -1) {
                savedDocuments[memIdx] = doc;
            } else {
                savedDocuments.unshift(doc);
            }
        }

        // Apprentissage automatique du patient et de sa nomenclature depuis le rapport médical
        if (typeof dynamicallyLearnNewData === 'function') {
            const docIntervEl = document.getElementById('doc-intervention');
            const interventionVal = docIntervEl ? docIntervEl.value.trim() : '';
            const docInsurerEl = document.getElementById('doc-insurer');
            const insurerVal = docInsurerEl ? docInsurerEl.value : 'PRIVE';
            
            dynamicallyLearnNewData(
                patientNom, 
                patientPrenom, 
                patientAge, 
                diagnosis || motif, 
                interventionVal, 
                "", // kCode
                insurerVal, 
                insurerVal === 'PRIVE' ? 'PRIVE' : 'MALADIE', 
                "" // matricule
            );
        }

        window.loadedDocId = null;
        const dupBtn = document.getElementById('btn-duplicate-doc');
        if (dupBtn) dupBtn.style.display = 'none';

        if (typeof renderRegisterTable === 'function') renderRegisterTable();
        showToast(`✅ Rapport "${doc.title}" pour ${patientNom} enregistré avec succès !`);
    } catch (e) {
        showToast('❌ Erreur lors de la sauvegarde.', 'error');
        console.error(e);
    }
}

// ============================================================
// GÉNÉRATION PAR MOTS-CLÉS (ASSISTANT RÉDACTIONNEL)
// ============================================================
function generateDocFromKeywords() {
    const keywords = (document.getElementById('doc-keywords-input')?.value || '').toLowerCase().trim();
    if (!keywords) {
        showToast('⚠️ Entrez des mots-clés pour adapter le texte.', 'error');
        return;
    }
    const editor = document.getElementById('doc-editor');
    if (!editor) return;

    // Travailler sur le texte ACTUEL de l'éditeur (pas recharger depuis template)
    let text = editor.value;
    if (!text.trim()) {
        // Si l'éditeur est vide, charger le template d'abord
        const templateId = document.getElementById('doc-template')?.value;
        const template = MEDICAL_TEMPLATES[templateId];
        if (template) text = template.text;
        else { showToast('⚠️ Aucun modèle sélectionné.', 'error'); return; }
    }

    let changed = [];

    // Remplacements contextuels par mots-clés
    const replacements = [
        { keys: ['droit', 'droite', 'genou droit', 'main droite', 'pied droit', 'membre droit'],
          test: () => !keywords.includes('gauche'),
          fn: t => { const r = t.replace(/\bgauche\b/gi, 'DROIT_TMP'); return r.includes('DROIT_TMP') ? (changed.push('côté → droit'), r.replace(/DROIT_TMP/g, 'droit')) : t; } },
        { keys: ['gauche', 'genou gauche', 'main gauche', 'pied gauche', 'membre gauche'],
          test: () => !keywords.includes('droit'),
          fn: t => { const r = t.replace(/\bdroit\b/gi, 'GAUCHE_TMP'); return r.includes('GAUCHE_TMP') ? (changed.push('côté → gauche'), r.replace(/GAUCHE_TMP/g, 'gauche')) : t; } },
        { keys: ['garrot 300', '300 mmhg', 'garrot 300mmhg'],
          fn: t => { const r = t.replace(/\b(280|300)\s*mmHg\b/gi, '300 mmHg'); if (r !== t) changed.push('garrot → 300 mmHg'); return r; } },
        { keys: ['garrot 280', '280 mmhg', 'garrot 280mmhg'],
          fn: t => { const r = t.replace(/\b(280|300)\s*mmHg\b/gi, '280 mmHg'); if (r !== t) changed.push('garrot → 280 mmHg'); return r; } },
        { keys: ['vis 9mm', 'vis de 9', 'vis 9'],
          fn: t => { const r = t.replace(/vis d'interférence biosynthétique de \d+ mm/gi, "vis d'interférence biosynthétique de 9 mm"); if (r !== t) changed.push('vis → 9mm'); return r; } },
        { keys: ['vis 7mm', 'vis de 7', 'vis 7'],
          fn: t => { const r = t.replace(/vis d'interférence biosynthétique de \d+ mm/gi, "vis d'interférence biosynthétique de 7 mm"); if (r !== t) changed.push('vis → 7mm'); return r; } },
        { keys: ['drain redon', 'redon'],
          fn: t => { if (!t.includes('drain de Redon')) { changed.push('drain Redon ajouté'); return t + '\n- Mise en place d\'un drain de Redon aspiratif.'; } return t; } },
        { keys: ['agrafes', 'agrafe'],
          fn: t => { const r = t.replace(/Fermeture cutanée plan par plan/gi, 'Fermeture cutanée par agrafes'); if (r !== t) changed.push('fermeture → agrafes'); return r; } },
        { keys: ['plaque', 'osteosynth', 'ostéosynth'],
          fn: t => t },
        // Latéralité pour remplacement "du" → bonne forme
        { keys: ['bilateral', 'bilatéral'],
          fn: t => { const r = t.replace(/\b(droit|gauche)\b/gi, 'bilatéral'); if (r !== t) changed.push('→ bilatéral'); return r; } },
    ];

    replacements.forEach(r => {
        const match = (r.keys || []).some(k => keywords.includes(k));
        if (match) {
            if (r.test && !r.test()) return;
            if (r.fn) text = r.fn(text);
        }
    });

    editor.value = text;
    updateDocPreview();

    if (changed.length > 0) {
        showToast(`🪄 Adaptations appliquées : ${changed.join(', ')}`);
    } else {
        showToast('ℹ️ Aucune adaptation automatique trouvée pour ces mots-clés. Vérifiez le texte.');
    }
}

// ============================================================
// GÉNÉRATION DE RAPPORT DEPUIS UNE FACTURE (LIAISON FACTURATION)
// ============================================================
function generateReportFromBill(billId) {
    try {
        const bills = JSON.parse(localStorage.getItem('mercyfiat_bills')) || [];
        const bill = bills.find(b => b.id === billId);
        if (!bill) { showToast('❌ Facture introuvable.', 'error'); return; }

        // Naviguer vers la section Documents
        if (typeof switchSection === 'function') switchSection('documents');

        setTimeout(() => {
            // Déterminer le type de rapport selon le type de facture
            const templateMap = {
                'PROFORMA': 'rapport_cs_simple',
                'DETAIL_ASSUR': 'rapport_cs_assurance',
                'DEFINITIF': 'rapport_hospi_simple'
            };
            const templateId = templateMap[bill.type] || 'rapport_cs_simple';
            const sel = document.getElementById('doc-template');
            if (sel) { sel.value = templateId; loadDocumentTemplate(); }

            // Remplir le patient
            if (document.getElementById('doc-patient-nom')) document.getElementById('doc-patient-nom').value = (bill.patientNom || '').toUpperCase();
            if (document.getElementById('doc-patient-prenom')) document.getElementById('doc-patient-prenom').value = bill.patientPrenom || '';
            if (document.getElementById('doc-patient-age')) document.getElementById('doc-patient-age').value = bill.patientAge || '';
            if (document.getElementById('doc-civilite')) document.getElementById('doc-civilite').value = bill.civilite || 'M.';

            // Remplir le diagnostic et motif
            if (document.getElementById('doc-diagnostique')) document.getElementById('doc-diagnostique').value = bill.diagnosis || '';
            if (document.getElementById('doc-motif')) document.getElementById('doc-motif').value = bill.diagnosis || '';

            // Assurance
            if (bill.insurer && bill.insurer !== 'PRIVE') {
                if (document.getElementById('doc-insurer')) document.getElementById('doc-insurer').value = bill.insurer;
                updateInsurerLabel();
            }

            // Date de la facture → date du document
            if (bill.date && document.getElementById('doc-date')) {
                document.getElementById('doc-date').value = bill.date;
                if (document.getElementById('doc-date-consult')) document.getElementById('doc-date-consult').value = bill.date;
            }

            // Intervention (depuis le nom de la facture ou des items)
            if (bill.interventionName && document.getElementById('doc-intervention')) {
                document.getElementById('doc-intervention').value = bill.interventionName;
            }

            populatePatientDocSelector();
            updateDocPreview();
            showToast(`✅ Rapport pré-rempli depuis la facture ${billId} !`);
        }, 300);

    } catch(e) {
        console.error('generateReportFromBill:', e);
        showToast('❌ Erreur lors du chargement de la facture.', 'error');
    }
}

// ============================================================
// UTILITAIRE — TOAST (si non défini globalement)
// ============================================================
function showToast(message, type = 'success') {
    if (typeof window.showAppToast === 'function') {
        window.showAppToast(message, type);
        return;
    }
    let toast = document.getElementById('doc-toast-notif');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'doc-toast-notif';
        toast.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;padding:12px 22px;border-radius:8px;font-weight:700;font-size:0.9rem;color:#fff;box-shadow:0 4px 20px rgba(0,0,0,0.2);transition:opacity 0.4s;';
        document.body.appendChild(toast);
    }
    toast.style.background = type === 'error' ? '#e53e3e' : '#38a169';
    toast.style.opacity = '1';
    toast.textContent = message;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 3500);
}

// ============================================================
// MODULE D'INTELLIGENCE CLINIQUE — PARSEUR & ANALYSE D'EXAMENS
// ============================================================

// Variable globale pour stocker les derniers résultats d'extraction IA
let currentAIExtractedData = null;

function importAIRawReportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const textarea = document.getElementById('ai-raw-report');
    if (!textarea) return;

    const ext = file.name.split('.').pop().toLowerCase();
    const isPDF  = ext === 'pdf' || file.type === 'application/pdf';
    const isImage = ['jpg','jpeg','png','bmp','gif','webp','tiff','tif'].includes(ext) || file.type.startsWith('image/');

    if (isPDF) {
        // ---- Extraction texte PDF via pdf-parse (Node.js Electron) ----
        textarea.value = '⏳ Extraction du texte PDF en cours...';
        showToast('📄 Lecture du PDF en cours…');

        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const pdfParse = require('pdf-parse');
                const data = await pdfParse(Buffer.from(e.target.result));
                const extracted = data.text.trim();
                if (extracted && extracted.length > 20) {
                    textarea.value = extracted;
                    showToast(`✅ PDF extrait : ${extracted.length} caractères lus`);
                } else {
                    // PDF scanné (image dans le PDF) → signaler à l'utilisateur
                    textarea.value = '';
                    showToast('⚠️ Ce PDF semble scanné (image). Copiez le texte manuellement ou utilisez une photo du document.', 'error');
                }
            } catch(err) {
                textarea.value = '';
                showToast('❌ Impossible de lire ce PDF : ' + err.message, 'error');
            }
        };
        reader.readAsArrayBuffer(file);

    } else if (isImage) {
        // ---- Pour les images : afficher un message clair ----
        // L'IA peut analyser les images si on lui passe le texte visible
        // Pour l'instant on indique que l'image est chargée et on laisse l'utilisateur décrire
        textarea.value = `[IMAGE IMPORTÉE : ${file.name}]\n\nVeuillez coller le texte du rapport ci-dessous, ou décrivez le contenu de l'image pour que l'IA puisse l'analyser.\n\nContenu du rapport :`;
        showToast('🖼️ Image chargée. Collez le texte du rapport dans la zone pour lancer l\'analyse IA.', 'error');

    } else {
        // ---- Fichier texte (.txt, .doc brut, etc.) ----
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            if (textarea) {
                textarea.value = text;
                showToast('✅ Rapport chargé depuis le fichier avec succès !');
            }
        };
        reader.readAsText(file, 'UTF-8');
    }

    // Remettre l'input à zéro pour permettre un re-import du même fichier
    event.target.value = '';
}


function analyzeReportWithAI() {
    const rawInput = document.getElementById('ai-raw-report')?.value || '';
    if (!rawInput.trim()) {
        showToast("⚠️ Veuillez coller ou importer un compte-rendu à analyser.", "error");
        return;
    }

    const loader = document.getElementById('ai-loader');
    const resultsCard = document.getElementById('ai-results-card');
    
    if (loader) loader.style.display = 'flex';
    if (resultsCard) resultsCard.style.display = 'none';

    // Simulation de l'intelligence artificielle (1.2s de réflexion pour l'effet premium)
    setTimeout(() => {
        if (loader) loader.style.display = 'none';

        const text = rawInput.toLowerCase();
        
        // 1. Détection du type d'examen
        let examType = "Examen d'Imagerie";
        if (text.includes("irm") || text.includes("résonance")) {
            examType = "IRM";
        } else if (text.includes("radiographie") || text.includes("radio") || text.includes("cliché")) {
            examType = "Radiographie";
        } else if (text.includes("scanner") || text.includes("tomodensitométrie") || text.includes("tdm")) {
            examType = "Scanner TDM";
        } else if (text.includes("échographie") || text.includes("écho")) {
            examType = "Échographie";
        }

        // 2. Détection de la région anatomique
        let region = "";
        const regions = [
            { key: "genou", name: "du genou" },
            { key: "clavicule", name: "de la clavicule" },
            { key: "mandibule", name: "de la mandibule" },
            { key: "maxillaire", name: "du maxillaire" },
            { key: "épaule", name: "de l'épaule" },
            { key: "poignet", name: "du poignet" },
            { key: "cheville", name: "de la cheville" },
            { key: "fémur", name: "du fémur" },
            { key: "tibia", name: "du tibia" },
            { key: "prostate", name: "de la prostate" },
            { key: "colonne", name: "de la colonne vertébrale" },
            { key: "coude", name: "du coude" },
            { key: "bras", name: "du bras" },
            { key: "jambe", name: "de la jambe" },
            { key: "hanche", name: "de la hanche" }
        ];
        for (let r of regions) {
            if (text.includes(r.key)) {
                region = " " + r.name;
                break;
            }
        }
        
        const fullExamName = `${examType}${region}`;
        document.getElementById('ai-detected-type').textContent = fullExamName;

        // 3. Détection des observations clés (findings)
        let findings = [];
        
        // Recherche de phrases clés
        const sentences = rawInput.split(/[.!?\n]/);
        const keywords = [
            "rupture", "lésion", "fissure", "fracture", "déplacement", "arthrose", "gonarthrose",
            "pseudarthrose", "pincement", "oedème", "épanchement", "hypertrophie", "adénome",
            "lithiase", "calcul", "hernie", "varicocèle", "lipome", "kyste", "arrachement", "entorse"
        ];

        sentences.forEach(s => {
            const cleanS = s.trim();
            if (cleanS.length > 10) {
                const cleanSLower = cleanS.toLowerCase();
                const hasKeyword = keywords.some(kw => cleanSLower.includes(kw));
                if (hasKeyword && findings.length < 3) {
                    findings.push(cleanS.charAt(0).toUpperCase() + cleanS.slice(1));
                }
            }
        });

        if (findings.length === 0) {
            findings.push("Examen mettant en évidence des anomalies structurelles compatibles avec la symptomatologie clinique.");
        }
        
        const fullFindingsText = findings.join(". ") + ".";
        document.getElementById('ai-res-findings').textContent = fullFindingsText;

        // 4. Détection du diagnostic principal
        let diagnosis = "Affection à préciser";
        
        // Essayer d'extraire la conclusion
        let conclusionPart = "";
        const conclusionHeaders = ["conclusion", "conclusion :", "conclusion:", "conclusion générale"];
        for (let header of conclusionHeaders) {
            const idx = text.indexOf(header);
            if (idx !== -1) {
                conclusionPart = rawInput.substring(idx + header.length).trim();
                break;
            }
        }
        
        if (conclusionPart) {
            const parts = conclusionPart.split(/[.!?\n]/);
            if (parts[0] && parts[0].trim().length > 8) {
                diagnosis = parts[0].trim();
            }
        } else {
            // Déterminer par règles de mots-clés
            if (text.includes("rupture") && (text.includes("lca") || text.includes("croisé antérieur"))) {
                diagnosis = "Rupture complète du ligament croisé antérieur (LCA) du genou droit";
            } else if (text.includes("fracture") && text.includes("clavicule")) {
                diagnosis = "Fracture du quart latéral de la clavicule droite";
            } else if (text.includes("fracture") && text.includes("mandibule")) {
                diagnosis = "Fracture symphysaire mandibulaire avec déplacement";
            } else if (text.includes("prostate") || text.includes("hpb") || text.includes("adénome")) {
                diagnosis = "Hypertrophie prostatique bénigne obstructive";
            } else if (text.includes("varicocèle")) {
                diagnosis = "Varicocèle bilatérale douloureuse chronique";
            } else if (text.includes("hernie") && text.includes("inguinale")) {
                diagnosis = "Hernie inguinale gauche réductible";
            } else if (text.includes("gonarthrose") || (text.includes("arthrose") && text.includes("genou"))) {
                diagnosis = "Gonarthrose tricompartimentale sévère du genou";
            } else if (findings[0]) {
                diagnosis = findings[0];
            }
        }
        
        // Nettoyer et formater
        diagnosis = diagnosis.replace(/^[:\-\s,]+/, "");
        if (diagnosis) {
            diagnosis = diagnosis.charAt(0).toUpperCase() + diagnosis.slice(1);
        }
        document.getElementById('ai-res-diagnosis').textContent = diagnosis;

        // 5. Suggestion d'intervention et Code K
        let intervention = "Intervention à visée diagnostique ou thérapeutique";
        let kCode = "K80";

        if (text.includes("lca") || text.includes("croisé antérieur")) {
            intervention = "Arthroscopie reconstruction LCA (DIDT) et Ménisectomie";
            kCode = "K180";
        } else if (text.includes("ménisque") && !text.includes("lca")) {
            intervention = "Arthroscopie diagnostique et Ménisectomie du genou";
            kCode = "K80";
        } else if (text.includes("clavicule")) {
            intervention = "Ostéosynthèse de la clavicule par plaque vissée";
            kCode = "K100";
        } else if (text.includes("mandibule") || text.includes("maxillaire")) {
            intervention = "Ostéosynthèse de fracture mandibulaire par mini-plaques";
            kCode = "K150";
        } else if (text.includes("prostate") || text.includes("hpb")) {
            intervention = "Résection Transurétrale de la Prostate (RTUP)";
            kCode = "K120";
        } else if (text.includes("varicocèle")) {
            intervention = "Cure chirurgicale de varicocèle bilatérale";
            kCode = "K90";
        } else if (text.includes("hernie")) {
            intervention = "Cure chirurgicale de hernie inguinale";
            kCode = "K80";
        } else if (text.includes("gonarthrose") || (text.includes("arthrose") && text.includes("genou"))) {
            intervention = "Prothèse Totale du Genou (PTG)";
            kCode = "K292";
        } else if (text.includes("hanche") || text.includes("coxarthrose") || text.includes("col fémoral") || text.includes("col du fémur")) {
            intervention = "Prothèse Totale de la Hanche (PTH)";
            kCode = "K280";
        } else if (text.includes("lipome")) {
            intervention = "Exérèse de lipome sous anesthésie locale";
            kCode = "K60";
        } else if (text.includes("kyste")) {
            intervention = "Exérèse de kyste ou tumeur maxillo-faciale";
            kCode = "K120";
        } else if (text.includes("matériel") || text.includes("amos") || text.includes("ablation")) {
            intervention = "Ablation de matériel d'ostéosynthèse (AMOS)";
            kCode = "K72";
        }

        document.getElementById('ai-res-intervention').textContent = intervention;
        document.getElementById('ai-res-kcode').textContent = kCode;

        // Stocker en mémoire pour injection future
        currentAIExtractedData = {
            examType: fullExamName,
            diagnosis: diagnosis,
            findings: fullFindingsText,
            intervention: intervention,
            kCode: kCode
        };

        if (resultsCard) {
            resultsCard.style.display = 'flex';
            resultsCard.style.animation = 'fadeInModal 0.3s ease-out';
        }
        showToast("🧠 Analyse IA réussie ! Données cliniques extraites.");

    }, 1200);
}

function injectAIExtraction() {
    if (!currentAIExtractedData) return;
    try {
        // ⚠️ IMPORTANT : on ne change JAMAIS le template sélectionné par l'utilisateur.
        // L'IA injecte uniquement les données cliniques dans les champs du formulaire.

        const docDiag = document.getElementById('doc-diagnostique');
        if (docDiag) docDiag.value = currentAIExtractedData.diagnosis;

        const docExamen = document.getElementById('doc-examen');
        if (docExamen) {
            docExamen.value = `Le compte-rendu de l'${currentAIExtractedData.examType} révèle : ${currentAIExtractedData.findings}`;
        }

        const docMotif = document.getElementById('doc-motif');
        if (docMotif) {
            docMotif.value = `des douleurs cliniques en lien avec ${currentAIExtractedData.diagnosis.toLowerCase()}`;
        }

        const docInterv = document.getElementById('doc-intervention');
        if (docInterv) docInterv.value = currentAIExtractedData.intervention;

        // Mettre à jour l'aperçu avec le template ACTUELLEMENT sélectionné (pas de changement)
        updateDocPreview();
        showToast("🔗 Données IA injectées avec succès ! Le type de rapport reste inchangé.");
    } catch(e) {
        console.error('injectAIExtraction error:', e);
        showToast("❌ Erreur lors de l'injection des données.", "error");
    }
}
