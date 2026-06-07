/* ============================================================
   app_autocomplete.js - Moteur d'Autocomplétion & Apprentissage
   ============================================================ */

// 1. Moteur d'Autocomplétion Sur-Mesure Premium (Défilable & Clavier-Friendly)
function setupCustomAutocomplete(inputEl, category, handleSelection) {
    if (!inputEl) return;

    // Encadrer l'input dans un wrapper positionné s'il n'existe pas
    let wrapper = inputEl.parentNode;
    if (!wrapper.classList.contains('autocomplete-wrapper')) {
        wrapper = document.createElement('div');
        wrapper.className = 'autocomplete-wrapper';
        wrapper.style.width = '100%';
        inputEl.parentNode.insertBefore(wrapper, inputEl);
        wrapper.appendChild(inputEl);
    }

    let suggestionsContainer = null;
    let activeIndex = -1;

    // Filtrer les suggestions selon la saisie
    function getSuggestions(query) {
        const db = window.MercyFiatDB;
        if (!db) return [];
        
        const q = query.trim().toUpperCase();
        const maxLimit = q === "" ? 200 : 50;

        if (category === 'patients') {
            return db.PATIENTS.filter(p => p.name.toUpperCase().includes(q)).slice(0, maxLimit);
        } else if (category === 'diagnoses') {
            return db.DIAGNOSES.filter(d => d.toUpperCase().includes(q)).slice(0, maxLimit);
        } else if (category === 'interventions') {
            const normalizeText = (str) => {
                if (!str) return "";
                return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
            };
            const matchingNames = db.INTERVENTIONS.filter(i => normalizeText(i).includes(normalizeText(query))).slice(0, maxLimit);
            return matchingNames.map(name => {
                let kCode = null;
                const normName = normalizeText(name);
                // 1. Chercher dans ACTES_CHIRURGICAUX (exact ou partiel flexible)
                const acte = db.ACTES_CHIRURGICAUX?.find(a => {
                    const normActName = normalizeText(a.name);
                    return normActName === normName || normActName.includes(normName) || normName.includes(normActName);
                });
                if (acte) {
                    kCode = acte.kCode;
                } else {
                    // 2. Chercher dans PATIENTS (exact ou partiel flexible)
                    const pat = db.PATIENTS?.find(p => {
                        if (!p.intervention || !p.kCode) return false;
                        const normPatInterv = normalizeText(p.intervention);
                        return normPatInterv === normName || normPatInterv.includes(normName) || normName.includes(normPatInterv);
                    });
                    if (pat) {
                        kCode = pat.kCode.replace(/[^0-9]/g, '');
                    } else {
                        // 3. Heuristiques sémantiques en fallback
                        const cleanText = normName;
                        if (cleanText.includes("lca") || cleanText.includes("didt") || cleanText.includes("ligamentoplastie") || cleanText.includes("macintosh") || cleanText.includes("kj") || cleanText.includes("croise")) {
                            kCode = 180;
                        } else if (cleanText.includes("ptg") || (cleanText.includes("prothese") && cleanText.includes("genou"))) {
                            kCode = 292;
                        } else if (cleanText.includes("pth") || (cleanText.includes("prothese") && cleanText.includes("hanche"))) {
                            kCode = 280;
                        } else if (cleanText.includes("clavicule") || cleanText.includes("acromio")) {
                            kCode = 100;
                        } else if (cleanText.includes("humerus") || cleanText.includes("radius") || cleanText.includes("cubitus") || cleanText.includes("olecrane") || cleanText.includes("bras") || cleanText.includes("ulna")) {
                            kCode = 120;
                        } else if (cleanText.includes("tibia") || cleanText.includes("femur") || cleanText.includes("diaphysaire") || cleanText.includes("retrograde") || cleanText.includes("supracondylienne") || cleanText.includes("supra-condylienne")) {
                            if (cleanText.includes("ablation") || cleanText.includes("amos") || cleanText.includes("retrait") || cleanText.includes("spacer") || cleanText.includes("depose") || cleanText.includes("extraction")) {
                                kCode = 72;
                            } else {
                                kCode = 180;
                            }
                        } else if (cleanText.includes("ablation") || cleanText.includes("amos") || cleanText.includes("retrait") || cleanText.includes("extraction") || cleanText.includes("depose")) {
                            if (cleanText.includes("jj") || cleanText.includes("double j")) {
                                kCode = 40;
                            } else {
                                kCode = 72;
                            }
                        } else if (cleanText.includes("rtup") || cleanText.includes("prostate") || cleanText.includes("resection")) {
                            kCode = 120;
                        } else if (cleanText.includes("sonde jj") || cleanText.includes("double j") || cleanText.includes("sonde double j")) {
                            if (cleanText.includes("ablation") || cleanText.includes("retrait") || cleanText.includes("retirer") || cleanText.includes("depose")) {
                                kCode = 40;
                            } else {
                                kCode = 50;
                            }
                        } else if (cleanText.includes("varicocele") || cleanText.includes("hydrocele")) {
                            kCode = 60;
                        } else if (cleanText.includes("peritonite") || cleanText.includes("volkmann") || cleanText.includes("laparotomie") || cleanText.includes("lavage")) {
                            kCode = 200;
                        } else if (cleanText.includes("hernie") || cleanText.includes("herniaire")) {
                            kCode = 80;
                        } else if (cleanText.includes("mandibule") || cleanText.includes("symphysaire") || cleanText.includes("mini-plaques") || cleanText.includes("plaques")) {
                            kCode = 150;
                        } else if (cleanText.includes("maxillaire") || cleanText.includes("le fort") || cleanText.includes("lefort")) {
                            kCode = 180;
                        } else if (cleanText.includes("kyste") || cleanText.includes("tumeur") || cleanText.includes("reconstruction")) {
                            kCode = 120;
                        } else if (cleanText.includes("lipome") || (cleanText.includes("tissus mous") && cleanText.includes("face"))) {
                            kCode = 60;
                        } else if (cleanText.includes("suture") || cleanText.includes("parage") || (cleanText.includes("plaie") && cleanText.includes("face"))) {
                            kCode = 50;
                        }
                    }
                }
                return { name, kCode };
            });
        }
        return [];
    }

    // Fermer les suggestions
    function closeSuggestions() {
        if (suggestionsContainer) {
            suggestionsContainer.remove();
            suggestionsContainer = null;
        }
        activeIndex = -1;
    }

    // Afficher le conteneur de suggestions défilable
    function renderSuggestions(items) {
        closeSuggestions();
        if (items.length === 0 && category !== 'patients') return;

        suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'autocomplete-suggestions';
        
        items.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'autocomplete-suggestion';
            
            if (category === 'patients') {
                row.innerHTML = `
                    <div><strong>${item.name}</strong></div>
                    ${item.intervention ? `<div class="suggestion-sub">${item.intervention.substring(0, 32)}...</div>` : ''}
                `;
            } else if (category === 'interventions') {
                row.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        <span>${item.name}</span>
                        ${item.kCode ? `<span class="k-badge" style="background: rgba(49, 151, 149, 0.15); color: var(--accent-teal); font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">K${item.kCode}</span>` : ''}
                    </div>
                `;
            } else {
                row.innerHTML = `<div>${item}</div>`;
            }

            row.addEventListener('click', () => {
                selectItem(item);
            });

            suggestionsContainer.appendChild(row);
        });

        // Option dynamique de création de patient
        if (category === 'patients') {
            const createRow = document.createElement('div');
            createRow.className = 'autocomplete-suggestion';
            createRow.style.background = 'rgba(56, 178, 172, 0.08)';
            createRow.style.borderTop = '1px dashed var(--border-color)';
            createRow.style.color = 'var(--accent-teal)';
            createRow.style.fontWeight = '700';
            
            const currentVal = inputEl.value.trim();
            if (currentVal) {
                createRow.innerHTML = `<div>➕ Créer "${currentVal.toUpperCase()}" comme nouveau patient</div>`;
            } else {
                createRow.innerHTML = `<div>➕ Créer un nouveau patient...</div>`;
            }
            
            createRow.addEventListener('click', (e) => {
                e.stopPropagation();
                closeSuggestions();
                if (typeof openNewPatientModal === 'function') openNewPatientModal();
                
                if (currentVal) {
                    const parts = currentVal.split(' ');
                    const nom = parts[0] || currentVal;
                    const prenom = parts.slice(1).join(' ') || "";
                    
                    const modalNom = document.getElementById('new-patient-nom');
                    const modalPrenom = document.getElementById('new-patient-prenom');
                    if (modalNom) modalNom.value = nom.toUpperCase();
                    if (modalPrenom) modalPrenom.value = prenom;
                }
            });
            suggestionsContainer.appendChild(createRow);
        }

        wrapper.appendChild(suggestionsContainer);
    }

    function selectItem(item) {
        if (category === 'patients') {
            inputEl.value = item.name;
        } else if (category === 'interventions') {
            inputEl.value = item.name;
        } else {
            inputEl.value = item;
        }
        closeSuggestions();
        
        if (handleSelection) {
            handleSelection(item);
        }
    }

    // Écouteur de saisie
    inputEl.addEventListener('input', (e) => {
        const val = e.target.value;
        const matched = getSuggestions(val);
        renderSuggestions(matched);
    });

    // Écouteur de focus
    inputEl.addEventListener('focus', () => {
        const matched = getSuggestions("");
        renderSuggestions(matched);
        setTimeout(() => {
            try {
                inputEl.select();
            } catch(e) {}
        }, 50);
    });

    // Écouteur de clic pour forcer l'affichage de la liste
    inputEl.addEventListener('click', () => {
        const matched = getSuggestions("");
        renderSuggestions(matched);
    });

    // Écouteurs de clavier (Flèches & Entrée)
    inputEl.addEventListener('keydown', (e) => {
        if (!suggestionsContainer) return;
        const items = suggestionsContainer.querySelectorAll('.autocomplete-suggestion');
        if (items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = (activeIndex + 1) % items.length;
            highlightItem(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = (activeIndex - 1 + items.length) % items.length;
            highlightItem(items);
        } else if (e.key === 'Enter') {
            if (activeIndex > -1) {
                e.preventDefault();
                items[activeIndex].click();
            }
        } else if (e.key === 'Escape') {
            closeSuggestions();
        }
    });

    function highlightItem(items) {
        items.forEach((item, idx) => {
            if (idx === activeIndex) {
                item.classList.add('active');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('active');
            }
        });
    }

    // Fermer si clic à l'extérieur
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            closeSuggestions();
        }
    });
}
window.setupCustomAutocomplete = setupCustomAutocomplete;

// 2. Initialisation des autocomplétions personnalisées
function initializeDatalists() {
    const db = window.MercyFiatDB;
    if (!db) return;

    const cleanPatientName = window.cleanPatientName || ((n) => n);
    const cleanClinicalTerm = window.cleanClinicalTerm || ((t) => t);

    // Assainissement dynamique et guérison au démarrage
    (function() {
        const garbageKeywords = [
            "JE SOUSSIGNÉ", "JE SOUSSIGNE", "CERTIFIE AVOIR", "CLINIQUE MERCY", "ASSURANCE:", 
            "CLIENT:", "DOSSIER", "PATIENT", "HOSPITALISATION", "CONSULTATION", 
            "CERTIFICAT", "SEME AGUE", "ORABANK", "MÉDICAUX", "CHIRURGICAUX", 
            "PERSONNELS :", "PHYSIQUE, ON NOTE", "DESCRIPTION", "SIGNATURE", 
            "TÉL :", "TEL :", "E-MAIL", "IFU :", "RCCM-RB-COT", "COTONOU VODJE", 
            "COLLABORATEURS", "MÉDECINE GÉNÉRALE", "MEDECINE GENERALE"
        ];

        function isCleanItem(item) {
            if (!item || typeof item !== 'string') return false;
            const trimmed = item.trim();
            if (trimmed.length < 3 || trimmed.length > 120) return false;
            
            const upper = trimmed.toUpperCase();
            return !garbageKeywords.some(keyword => upper.includes(keyword));
        }

        // Assainir la liste db.PATIENTS
        if (Array.isArray(db.PATIENTS)) {
            const forbiddenWords = [
                "POUR", "AVEC", "CONSTATATION", "COUPS", "BLESSURES", "BEGAIEMENT", 
                "REPOS", "REPRISE", "MODELE", "TEMPL", "LETTRE", "RELANCE", 
                "CORRESPONDANCE", "SUIVI", "COMPTE", "RENDU", "ASSURANCE", "DOSSIER", 
                "CLINIQUE", "MÉDECIN", "MEDECIN", "MONSIEUR", "MADAME", "MARIAGE",
                "INITIAL", "MEDICAL", "RAPPORT", "DECHARGE", "COMPTABILITE", "PV_VENTE",
                "ATTESTATION", "BILLET", "ACTE", "IDENTIFICATION", "OBJECTIFS", "PROTOCOLE"
            ];
            
            const uniquePatients = new Map();
            db.PATIENTS.forEach(p => {
                const cleanName = cleanPatientName(p.name);
                if (!cleanName) return;
                
                const upperName = cleanName.toUpperCase();
                if (cleanName.length < 3 || cleanName.length > 50) return;
                
                const hasForbiddenWord = forbiddenWords.some(fw => upperName.includes(fw));
                if (hasForbiddenWord) return;
                
                if (p.age && typeof p.age === 'string') {
                    const ageMatch = p.age.match(/^\d+\s*(?:ans|g|mois|ans\s+d['’]âge)/i) || p.age.match(/\d+\s*(?:ans|g|mois)/i);
                    if (ageMatch) {
                        p.age = ageMatch[0].trim();
                    } else if (p.age.length > 10) {
                        p.age = 'N/A';
                    }
                }
                
                const key = cleanName.toUpperCase();
                const existing = uniquePatients.get(key);
                if (!existing || (!existing.diagnosis && p.diagnosis) || (!existing.intervention && p.intervention)) {
                    p.name = cleanName;
                    uniquePatients.set(key, p);
                }
            });
            
            db.PATIENTS = Array.from(uniquePatients.values());
            
            if (typeof populatePatientDocSelector === 'function') {
                populatePatientDocSelector();
            }
        }

        if (Array.isArray(db.DIAGNOSES)) {
            const cleanedDiags = db.DIAGNOSES.map(cleanClinicalTerm).filter(Boolean);
            if (db.PATIENTS) {
                db.PATIENTS.forEach(p => {
                    const cd = cleanClinicalTerm(p.diagnosis);
                    if (cd) cleanedDiags.push(cd);
                });
            }
            db.DIAGNOSES = [...new Set(cleanedDiags)];
        }

        if (Array.isArray(db.INTERVENTIONS)) {
            const isValidSurgicalIntervention = (name) => {
                if (!name || typeof name !== 'string') return false;
                const clean = name.trim();
                if (clean.length < 5 || clean.length > 120) return false;
                
                // 1. Exclure les dates (toutes formes)
                if (/\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b/.test(clean)) return false;
                if (/\b\d{2}\/\d{4}\b/.test(clean)) return false;
                if (/^\d+[\/\-\.]\d+/.test(clean)) return false;
                
                // 2. Exclure les codes purs et préfixes de codes
                if (/^[A-Z0-9\-\_]+$/i.test(clean.replace(/\s/g, ''))) {
                    if (clean.length > 5) return false;
                }
                
                const lower = clean.toLowerCase();

                // 3. Exclure les dosages, tailles et spécifications
                const dosagePatterns = [
                    /\b\d+\s*mg\b/i,
                    /\b\d+\s*ml\b/i,
                    /\b\d+\s*mcg\b/i,
                    /\b\d+\s*mm\b/i,
                    /\b\d+\s*cm\b/i,
                    /\b\d+\s*g\b/i,
                    /ø\s*\d+/i,
                    /\d+\s*trous\b/i,
                    /\d+\s*holes\b/i,
                    /\b\d+\s*ui\b/i,
                    /\b\d+\s*iu\b/i,
                    /\b\d+\s*amp\b/i,
                    /\b\d+\s*cp\b/i,
                    /\b\d+\s*flac\b/i,
                    /\b\d+\s*boite\b/i,
                    /\b\d+\s*sachet\b/i,
                    /\b\d+\s*(?:ans|g|mois)\b/i,
                    /\bâgée?\b/i,
                    /\bâge de\b/i,
                    /\bné\s+le\b/i,
                    /\bnée\s+le\b/i,
                    /\bné\s+en\b/i,
                    /\bnée\s+en\b/i
                ];
                if (dosagePatterns.some(pat => pat.test(clean))) return false;

                // 4. Whitelist chirurgicale stricte (L'intervention doit correspondre à un acte)
                const whitelist = [
                    "ablation", "osteosynthese", "ostéosynthèse", "synthese", "synthèse", "resection", "résection", 
                    "cure", "arthroscopie", "menisectomie", "ménisectomie", "meniscectomie", "méniscectomie", 
                    "ligamentoplastie", "reduction", "réduction", "exerese", "exérèse", "suture", "parage", 
                    "arthroplastie", "pose", "montée", "descente", "retrait", "lavage", "drainage", 
                    "osteotomie", "ostéotomie", "tenorraphie", "ténorraphie", "tenoplastie", "ténoplastie", 
                    "amputation", "arthrodese", "arthrodèse", "confection", "enclouage", "embrochage", 
                    "cerclage", "fistule", "fistulectomie", "cystostomie", "ureteroscopie", "urétéroscopie", 
                    "plastie", "recalibrage", "liberation", "libération", "decompression", "décompression", 
                    "laminectomie", "discectomie", "greffe", "greff", "refection", "réfection", "tenolyse", 
                    "ténolyse", "vissage", "osteoclasie", "ostéoclasie", "arthrolyse", "cesarienne", "césarienne", 
                    "aspiration", "amiu", "exploration", "biopsie", "dilatation", "extraction", "depose", 
                    "dépose", "reconstruction", "synovectomie", "facette", "arthrodetese", "dénervation", 
                    "neurolyse", "reprise", "ostéoclasie", "recalibrage"
                ];
                if (!whitelist.some(w => lower.includes(w))) {
                    return false;
                }

                // 5. Mots clés de rejet stricts (médicaments, consommables, administration, etc.)
                const rejectKeywords = [
                    // Matériels & consommables
                    "davier", "mèche", "meche", "tournevis", "screw", "plate", "drill", "coupling", 
                    "hex.", "locking", "condylar", "reconstruction", "hole", "tube", "tige", 
                    "broche", "vis ", " vis", "clou ", "plaque ", "spacer", "ciment", "joint", 
                    "implant", "matériel", "materiel", "prothèse", "prothese", "insert", "cupule", 
                    "tête", "tete", "liner", "ancillaire", "malleolar", "pediculaire", "pedicle", 
                    "lcp", "dcp", "liss", "gant", "sterile", "stérile", "compresse", "bande", 
                    "sparadrap", "perfuseur", "seringue", "aiguille", "catheter", "cathéter", 
                    "redon", "drain", "lame", "tubulure", "poche à urine", "poche a urine", 
                    "poche de sang", "champ", "masque", "lunette", "electrodes", "blouse", 
                    "calot", "surchaussures", "savon", "brosse", "rasoir", "gelée", "vaseline", 
                    "formol", "alcool", "ether", "eau", "glace", "vessie", "thermometre", 
                    "tensiometre", "stéthoscope", "ancillaire", "fil ", "suture nylon", 
                    "suture vicryl", "suture prolene", "suture monocryl", "nylon sert", 
                    "vicryl sert", "prolene sert", "monocryl sert", "decimel", "vicryl 0", 
                    "vicryl 2", "vicryl 3", "vicryl 4", "nylon 2", "nylon 3", "soie ", "soie",
                    "instrument", "set d'", "needle", "absorbable", "synthetic", "prescrit", 
                    "système", "system",
                    
                    // Médicaments
                    "amoxicilline", "amoxicillin", "clavulanique", "paracetamol", "paracétamol", 
                    "tramadol", "perfalgan", "cefuroxime", "ceftriaxone", "quinine", "artesunate", 
                    "aciclovir", "betadine", "bétadine", "xylocaine", "bupivacaine", "diclofenac", 
                    "ketoprofene", "kétoprofène", "fluconazole", "metronidazole", "gentamicine", 
                    "ciprofloxacine", "ranitidine", "omeprazole", "spasfon", "laxis", "furosemide", 
                    "enoxaparine", "loxen", "nicardipine", "neosine", "zyloric", "allopurinol", 
                    "colchicine", "plaquenil", "piascledine", "salbutamol", "aerius", "desloratadine", 
                    "prednisolone", "solumedrol", "methylprednisolone", "hydrocortisone", "doliprane", 
                    "efferalgan", "dafalgan", "comprimé", "comprime", "tablet", "tab", "gélule", 
                    "gelule", "capsule", "ampoule", "flacon", "cp", "inj", "inject", "collyre", 
                    "suppo", "sirop", "crème", "creme", "pommade", "sachet", "solution", "intrants", 
                    "médicaments", "medicaments", "consommables", "consommable", "pharmacie", 
                    "laboratoire", "analyse", "achat", "wifi", "boissons", "boisson", "dépenses",
                    
                    // Administration & Facturation
                    "dossier", "facture", "proforma", "définitif", "definitif", "assurance", "sinistre",
                    "hébergement", "hebergement", "chambre", "séjour", "sejour", "repas", "restauration",
                    "nourriture", "cs ", "consultation", "visite", "analyses", "bilan", "laboratoire", 
                    "radio", "radiographie", "cardiologue", "cardio", "ecg", "devis", "reliquat", "solde", 
                    "payer", "remise", "réduction", "reduction", "rabais", "ristourne", "cro", "hospi", 
                    "billet", "certificat", "attestation", "rccm", "ifu", "orabank", "seme ague", 
                    "aide op", "deuxième", "aide-op", "principal", "chirurgien", "anesthésiste", 
                    "anesthésie", "bloc", "garde", "staff", "logo", "relance", "reçu", "recu", 
                    "decharge", "décharge", "contrat", "réunion", "reunion", "caisse", "payant", 
                    "téléphone", "telephone", "carburant", "essence", "transport", "ambulance", 
                    "retour", "domicile", "client", "patient", "zannou", "agbovi", "ulrich", "albert",
                    "pour une", "pour un", "pour le", "pour la", "pour l'", "docteur", "médecin", 
                    "medecin", "reçu pour", "reçue pour", "hospitalisé pour", "hospitalisée pour", 
                    "consulte pour", "consultée pour", "il est indiqué", "elle a été", "il a été", 
                    "il a bénéficié", "elle a bénéficié", "il avait bénéficié", "elle avait bénéficié"
                ];

                if (rejectKeywords.some(kw => lower.includes(kw))) {
                    // Autoriser l'ablation de matériel/clou/plaque/vis car c'est une vraie intervention
                    const isAblationInterv = ["ablation", "retrait", "depose", "dépose", "extraction"].some(x => lower.includes(x)) && ["matériel", "materiel", "clou", "plaque", "vis", "broche", "prothèse", "prothese", "spacer", "ciment", "joint"].some(x => lower.includes(x));
                    if (!isAblationInterv) {
                        return false;
                    }
                }
                return true;
            };

            const rawIntervs = [...db.INTERVENTIONS];
            if (db.ACTES_CHIRURGICAUX) {
                db.ACTES_CHIRURGICAUX.forEach(act => {
                    if (act.name) rawIntervs.push(act.name.trim());
                });
            }
            if (db.FORFAITS_COMPLETS) {
                db.FORFAITS_COMPLETS.forEach(f => {
                    if (f.name) rawIntervs.push(f.name.trim());
                });
            }
            if (db.PATIENTS) {
                db.PATIENTS.forEach(p => {
                    if (p.intervention) rawIntervs.push(p.intervention.trim());
                });
            }

            const cleanedIntervs = rawIntervs
                .map(cleanClinicalTerm)
                .filter(Boolean)
                .filter(isValidSurgicalIntervention);

            db.INTERVENTIONS = [...new Set(cleanedIntervs)];
        }
    })();

    const billNom = document.getElementById('bill-patient-nom');
    const docNom = document.getElementById('doc-patient-nom');
    const docDiag = document.getElementById('doc-diagnostique');
    const billIntervention = document.getElementById('bill-intervention');
    const billDiag = document.getElementById('bill-diagnostic');

    const handlePatientSelection = (found, prefix) => {
        if (found) {
            const parts = found.name.split(' ');
            const nom = parts[0] || found.name;
            const prenom = parts.slice(1).join(' ') || " ";

            if (prefix === 'bill') {
                document.getElementById('bill-patient-nom').value = nom;
                document.getElementById('bill-patient-prenom').value = prenom;
                
                const typeEl = document.getElementById('bill-patient-type');
                const partner = window.MercyFiatDB?.INSURERS?.find(ins => ins.id === found.insurer);
                const inferredType = (partner && partner.category === 'Sinistres & Accidents Auto') ? 'SINISTRE' : 'MALADIE';
                const pType = found.priseEnCharge || (found.insurer && found.insurer !== 'PRIVE' ? inferredType : 'PRIVE');
                if (typeEl) {
                    typeEl.value = pType;
                    if (typeof handleBillPriseEnChargeChange === 'function') {
                        handleBillPriseEnChargeChange();
                    }
                }

                if (found.diagnosis) {
                    const diagEl = document.getElementById('bill-diagnostic');
                    if (diagEl) {
                        diagEl.value = found.diagnosis;
                        diagEl.dispatchEvent(new Event('input'));
                        diagEl.dispatchEvent(new Event('change'));
                    }
                    const showDiagEl = document.getElementById('bill-show-diag');
                    if (showDiagEl) {
                        showDiagEl.checked = true;
                    }
                }
                
                if (found.intervention) {
                    const intEl = document.getElementById('bill-intervention');
                    if (intEl) {
                        intEl.value = found.intervention;
                        intEl.dispatchEvent(new Event('input'));
                        intEl.dispatchEvent(new Event('change'));
                    }
                    const showIntervEl = document.getElementById('bill-show-interv');
                    if (showIntervEl) {
                        showIntervEl.checked = true;
                    }
                }

                if (found.kCode) {
                    const kCodeEl = document.getElementById('bill-k-code');
                    if (kCodeEl) {
                        kCodeEl.value = found.kCode;
                        kCodeEl.dispatchEvent(new Event('input'));
                        kCodeEl.dispatchEvent(new Event('change'));
                    }
                }
                
                const matEl = document.getElementById('bill-matricule');
                if (matEl) {
                    matEl.value = found.matricule || (found.kCode ? `K-Code: ${found.kCode}` : "");
                }
                
                if (found.insurer && pType !== 'PRIVE') {
                    const insEl = document.getElementById('bill-insurance');
                    if (insEl) {
                        insEl.value = found.insurer;
                        insEl.dispatchEvent(new Event('change'));
                    }
                }

                if (typeof updateBillPreview === 'function') {
                    updateBillPreview();
                }
            } else if (prefix === 'doc') {
                document.getElementById('doc-patient-nom').value = nom;
                document.getElementById('doc-patient-prenom').value = prenom;
                if (found.diagnosis) {
                    document.getElementById('doc-diagnostique').value = found.diagnosis;
                }
                if (found.age) {
                    const ageEl = document.getElementById('doc-patient-age');
                    if (ageEl) ageEl.value = found.age;
                }
                
                if (found.insurer && found.insurer !== 'PRIVE') {
                    const insEl = document.getElementById('doc-insurer');
                    if (insEl) {
                        insEl.value = found.insurer;
                        if (typeof updateInsurerLabel === 'function') updateInsurerLabel();
                    }
                }
                
                if (found.intervention) {
                    const textLower = found.intervention.toLowerCase();
                    const selectTemp = document.getElementById('doc-template');
                    
                    if (textLower.includes('lca') || textLower.includes('ligament')) {
                        selectTemp.value = 'cro_lca';
                    } else if (textLower.includes('rtup') || textLower.includes('prostate') || textLower.includes('rsection')) {
                        selectTemp.value = 'cro_rtup';
                    } else if (textLower.includes('mandibule') || textLower.includes('symphysaire') || textLower.includes('maxillaire')) {
                        selectTemp.value = 'cro_cmf';
                    } else if (textLower.includes('repos')) {
                        selectTemp.value = 'certif_repos';
                    } else if (textLower.includes('reprise')) {
                        selectTemp.value = 'certif_reprise';
                    }
                    if (typeof loadDocumentTemplate === 'function') loadDocumentTemplate();
                }
            }
            if (typeof updateBillPreview === 'function') updateBillPreview();
            if (typeof updateDocPreview === 'function') updateDocPreview();
            if (typeof openPatientDMEDrawer === 'function') openPatientDMEDrawer(found.name);
        }
    };

    // Configuration des autocomplétions
    setupCustomAutocomplete(billNom, 'patients', (item) => handlePatientSelection(item, 'bill'));
    setupCustomAutocomplete(docNom, 'patients', (item) => handlePatientSelection(item, 'doc'));
    setupCustomAutocomplete(docDiag, 'diagnoses', () => {
        if (typeof updateDocPreview === 'function') updateDocPreview();
    });
    setupCustomAutocomplete(billIntervention, 'interventions', (item) => {
        if (typeof autoLoadPackageFromIntervention === 'function') {
            autoLoadPackageFromIntervention(item);
        }
        if (typeof autoFillKCodeFromIntervention === 'function') {
            autoFillKCodeFromIntervention(item);
        }
        if (typeof updateBillPreview === 'function') updateBillPreview();
    });
    setupCustomAutocomplete(billDiag, 'diagnoses', () => {
        if (typeof updateBillPreview === 'function') updateBillPreview();
    });

    // Autocomplétion sur le formulaire d'enregistrement de nouveau patient
    const modalDiag = document.getElementById('new-patient-diag');
    const modalInterv = document.getElementById('new-patient-interv');

    if (modalDiag) {
        setupCustomAutocomplete(modalDiag, 'diagnoses');
    }
    if (modalInterv) {
        setupCustomAutocomplete(modalInterv, 'interventions', (item) => {
            const modalKCode = document.getElementById('new-patient-kcode');
            if (modalKCode && item && item.kCode) {
                modalKCode.value = `K${item.kCode}`;
            }
        });
    }
}
window.initializeDatalists = initializeDatalists;

// 3. Apprentissage automatique à l'enregistrement
function dynamicallyLearnNewData(nom, prenom, age = "", diagnosis = "", intervention = "", kCode = "", insurer = "PRIVE", priseEnCharge = "PRIVE", matricule = "") {
    const db = window.MercyFiatDB;
    if (!db) return;

    const fullName = `${nom.trim().toUpperCase()} ${prenom.trim()}`;
    
    // A. Apprentissage patient
    if (fullName.trim() !== "") {
        const patientExists = db.PATIENTS.some(p => p.name.toUpperCase() === fullName.toUpperCase());
        if (!patientExists) {
            const newPatient = {
                name: fullName,
                diagnosis: diagnosis,
                intervention: intervention,
                kCode: kCode,
                age: age,
                insurer: insurer,
                priseEnCharge: priseEnCharge,
                matricule: matricule
            };
            db.PATIENTS.unshift(newPatient);
            if (db.savePatients) db.savePatients();
            
            const customPatients = JSON.parse(localStorage.getItem('mercyfiat_custom_patients')) || [];
            customPatients.unshift(newPatient);
            localStorage.setItem('mercyfiat_custom_patients', JSON.stringify(customPatients));
            console.log("Appris nouveau patient :", fullName);
        }
    }

    // B. Apprentissage diagnostic
    if (diagnosis && diagnosis.trim() !== "") {
        const diagExists = db.DIAGNOSES.some(d => d.toUpperCase() === diagnosis.trim().toUpperCase());
        if (!diagExists) {
            db.DIAGNOSES.unshift(diagnosis.trim());
            const customDiagnoses = JSON.parse(localStorage.getItem('mercyfiat_custom_diagnoses')) || [];
            customDiagnoses.unshift(diagnosis.trim());
            localStorage.setItem('mercyfiat_custom_diagnoses', JSON.stringify(customDiagnoses));
            console.log("Appris nouveau diagnostic :", diagnosis);
        }
    }

    // C. Apprentissage intervention
    if (intervention && intervention.trim() !== "") {
        const intervExists = db.INTERVENTIONS.some(i => i.toUpperCase() === intervention.trim().toUpperCase());
        if (!intervExists) {
            db.INTERVENTIONS.unshift(intervention.trim());
            const customInterventions = JSON.parse(localStorage.getItem('mercyfiat_custom_interventions')) || [];
            customInterventions.unshift(intervention.trim());
            localStorage.setItem('mercyfiat_custom_interventions', JSON.stringify(customInterventions));
            console.log("Appris nouvelle intervention :", intervention);
        }
    }
}
window.dynamicallyLearnNewData = dynamicallyLearnNewData;
