/* ============================================================
   billing_packages.js - Analyseurs cliniques, Forfaits & Codes K
   ============================================================ */

const normalizeText = (str) => {
    if (!str) return "";
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
};

// Détermination et remplissage automatique du code K lié à l'intervention
function autoFillKCodeFromIntervention(item) {
    if (!item) return;
    const db = window.MercyFiatDB;
    if (!db) return;

    const kCodeEl = document.getElementById('bill-k-code');
    if (!kCodeEl) return;

    // Si c'est un objet suggestion avec K-code, on l'applique directement
    if (typeof item === 'object' && item.kCode) {
        const parsedCode = `K${item.kCode}`;
        if (kCodeEl.value !== parsedCode) {
            kCodeEl.value = parsedCode;
            kCodeEl.dispatchEvent(new Event('input'));
            kCodeEl.dispatchEvent(new Event('change'));
        }
        return;
    }

    const text = typeof item === 'object' ? item.name : item;
    const cleanText = text.toLowerCase().trim();
    const normCleanText = normalizeText(text);

    // 1. Essayer d'extraire via Regex (ex: K180, KC 150, K 80, _K60, -K60, etc.)
    const regexMatch = cleanText.match(/(?:KC|K)\s*[-_]?\s*(\d+)/i);
    if (regexMatch) {
        const parsedCode = `K${regexMatch[1]}`;
        if (kCodeEl.value !== parsedCode) {
            kCodeEl.value = parsedCode;
            kCodeEl.dispatchEvent(new Event('input'));
            kCodeEl.dispatchEvent(new Event('change'));
        }
        return;
    }

    // 2. Sémantique et mots-clés spécifiques du cabinet du Dr Gipsy (Nomenclature & Forfaits)
    let resolvedK = null;
    
    if (normCleanText.includes("lca") || normCleanText.includes("didt") || normCleanText.includes("ligamentoplastie") || normCleanText.includes("macintosh") || normCleanText.includes("kj") || normCleanText.includes("croise")) {
        resolvedK = 180;
    } else if (normCleanText.includes("ptg") || (normCleanText.includes("prothese") && normCleanText.includes("genou"))) {
        resolvedK = 292;
    } else if (normCleanText.includes("pth") || (normCleanText.includes("prothese") && normCleanText.includes("hanche"))) {
        resolvedK = 280;
    } else if (normCleanText.includes("clavicule") || normCleanText.includes("acromio")) {
        resolvedK = 100;
    } else if (normCleanText.includes("humerus") || normCleanText.includes("radius") || normCleanText.includes("cubitus") || normCleanText.includes("olecrane") || normCleanText.includes("bras") || normCleanText.includes("ulna")) {
        resolvedK = 120;
    } else if (normCleanText.includes("tibia") || normCleanText.includes("femur") || normCleanText.includes("diaphysaire") || normCleanText.includes("retrograde") || normCleanText.includes("supracondylienne") || normCleanText.includes("supra-condylienne")) {
        if (normCleanText.includes("ablation") || normCleanText.includes("amos") || normCleanText.includes("retrait") || normCleanText.includes("spacer") || normCleanText.includes("depose") || normCleanText.includes("extraction")) {
            resolvedK = 72;
        } else {
            resolvedK = 180;
        }
    } else if (normCleanText.includes("ablation") || normCleanText.includes("amos") || normCleanText.includes("retrait") || normCleanText.includes("extraction") || normCleanText.includes("depose")) {
        if (normCleanText.includes("jj") || normCleanText.includes("double j")) {
            resolvedK = 40;
        } else {
            resolvedK = 72;
        }
    } else if (normCleanText.includes("rtup") || normCleanText.includes("prostate") || normCleanText.includes("resection")) {
        resolvedK = 120;
    } else if (normCleanText.includes("sonde jj") || normCleanText.includes("double j") || normCleanText.includes("sonde double j")) {
        if (normCleanText.includes("ablation") || normCleanText.includes("retrait") || normCleanText.includes("retirer") || normCleanText.includes("depose")) {
            resolvedK = 40;
        } else {
            resolvedK = 50;
        }
    } else if (normCleanText.includes("varicocele") || normCleanText.includes("hydrocele")) {
        resolvedK = 60;
    } else if (normCleanText.includes("peritonite") || normCleanText.includes("volkmann") || normCleanText.includes("laparotomie") || normCleanText.includes("lavage")) {
        resolvedK = 200;
    } else if (normCleanText.includes("hernie") || normCleanText.includes("herniaire")) {
        resolvedK = 80;
    } else if (normCleanText.includes("mandibule") || normCleanText.includes("symphysaire") || normCleanText.includes("mini-plaques") || normCleanText.includes("plaques")) {
        resolvedK = 150;
    } else if (normCleanText.includes("maxillaire") || normCleanText.includes("le fort") || normCleanText.includes("lefort")) {
        resolvedK = 180;
    } else if (normCleanText.includes("kyste") || normCleanText.includes("tumeur") || normCleanText.includes("reconstruction")) {
        resolvedK = 120;
    } else if (normCleanText.includes("lipome") || (normCleanText.includes("tissus mous") && normCleanText.includes("face"))) {
        resolvedK = 60;
    } else if (normCleanText.includes("suture") || normCleanText.includes("parage") || (normCleanText.includes("plaie") && normCleanText.includes("face"))) {
        resolvedK = 50;
    }
    
    if (resolvedK) {
        const parsedCode = `K${resolvedK}`;
        if (kCodeEl.value !== parsedCode) {
            kCodeEl.value = parsedCode;
            kCodeEl.dispatchEvent(new Event('input'));
            kCodeEl.dispatchEvent(new Event('change'));
        }
        return;
    }

    // 3. Essayer de trouver une correspondance exacte ou partielle dans ACTES_CHIRURGICAUX en nomenclature
    const matchedAct = db.ACTES_CHIRURGICAUX.find(act => {
        const normActName = normalizeText(act.name);
        const normActId = normalizeText(act.id);
        return normCleanText.includes(normActName) || 
               normActName.includes(normCleanText) ||
               normCleanText.includes(normActId);
    });
    if (matchedAct) {
        const parsedCode = `K${matchedAct.kCode}`;
        if (kCodeEl.value !== parsedCode) {
            kCodeEl.value = parsedCode;
            kCodeEl.dispatchEvent(new Event('input'));
            kCodeEl.dispatchEvent(new Event('change'));
        }
        return;
    }

    // 4. Essayer de trouver une correspondance dans l'historique des PATIENTS
    const matchedPatient = db.PATIENTS.find(p => {
        if (!p.intervention || !p.kCode) return false;
        const normPatInterv = normalizeText(p.intervention);
        return normPatInterv.includes(normCleanText) || normCleanText.includes(normPatInterv);
    });
    if (matchedPatient) {
        const cleanK = matchedPatient.kCode.replace(/[^0-9]/g, '');
        if (cleanK) {
            const parsedCode = `K${cleanK}`;
            if (kCodeEl.value !== parsedCode) {
                kCodeEl.value = parsedCode;
                kCodeEl.dispatchEvent(new Event('input'));
                kCodeEl.dispatchEvent(new Event('change'));
            }
            return;
        }
    }
}
window.autoFillKCodeFromIntervention = autoFillKCodeFromIntervention;

// Analyse de l'intitulé de l'intervention et chargement automatique du forfait
function autoLoadPackageFromIntervention(item) {
    if (!item) return false;
    const text = typeof item === 'object' ? item.name : item;
    const normCleanText = normalizeText(text);
    const db = window.MercyFiatDB;
    if (!db) return false;

    let pack = null;

    // 1. Recherche par mot-clé pour les packages complets pré-rédigés
    if (normCleanText.includes("arthroscopie") && !normCleanText.includes("lca") && !normCleanText.includes("lcr") && !normCleanText.includes("ligament")) {
        pack = db.FORFAITS_COMPLETS.find(p => p.id === "FORFAIT_ARTHRO");
    } else if (normCleanText.includes("lca") || normCleanText.includes("lcr") || normCleanText.includes("ligamentoplastie") || normCleanText.includes("ligament")) {
        pack = db.FORFAITS_COMPLETS.find(p => p.id === "FORFAIT_LCA");
    } else if (normCleanText.includes("rtup") || normCleanText.includes("prostate") || normCleanText.includes("resection")) {
        pack = db.FORFAITS_COMPLETS.find(p => p.id === "FORFAIT_RTUP");
    } else if (normCleanText.includes("clavicule")) {
        pack = db.FORFAITS_COMPLETS.find(p => p.id === "FORFAIT_CLAVICULE");
    } else if (normCleanText.includes("peritonite") || normCleanText.includes("volkmann") || normCleanText.includes("lavage")) {
        pack = db.FORFAITS_COMPLETS.find(p => p.id === "FORFAIT_PERITONITE");
    }

    if (pack) {
        // Nettoyer la grille actuelle
        document.getElementById('billing-items-container').innerHTML = '';
        
        // Remplir le diagnostic si vide
        const diagInput = document.getElementById('bill-diagnostic');
        if (diagInput && diagInput.value === "") {
            diagInput.value = pack.diagnosis;
            diagInput.dispatchEvent(new Event('input'));
            diagInput.dispatchEvent(new Event('change'));
        }

        // Activer automatiquement les cases à cocher d'affichage
        const showDiagEl = document.getElementById('bill-show-diag');
        if (showDiagEl) showDiagEl.checked = true;
        const showIntervEl = document.getElementById('bill-show-interv');
        if (showIntervEl) showIntervEl.checked = true;

        // Ajouter toutes les lignes d'un coup
        pack.items.forEach(item => {
            if (typeof addCustomBillingRow === 'function') {
                addCustomBillingRow(item.name, item.price, item.qty);
            }
        });

        if (typeof showBillingNotification === 'function') {
            showBillingNotification(`🔥 Forfait standard chargé : ${pack.name}`);
        }
        return true;
    }

    // 2. Si aucun forfait fixe n'est trouvé, chercher un code K dans la nomenclature pour calcul dynamique
    const matchedSurgery = db.ACTES_CHIRURGICAUX.find(s => {
        const normSurgName = normalizeText(s.name);
        const normSurgId = normalizeText(s.id);
        return normCleanText.includes(normSurgName) || 
               normSurgName.includes(normCleanText) ||
               normCleanText.includes(normSurgId);
    });

    if (matchedSurgery) {
        document.getElementById('billing-items-container').innerHTML = '';
        
        // Remplir le diagnostic et code K si vides
        const diagInput = document.getElementById('bill-diagnostic');
        if (diagInput && diagInput.value === "") {
            diagInput.value = `Forfait ${matchedSurgery.name} (K${matchedSurgery.kCode})`;
            diagInput.dispatchEvent(new Event('input'));
            diagInput.dispatchEvent(new Event('change'));
        }

        const kCodeEl = document.getElementById('bill-k-code');
        if (kCodeEl) {
            kCodeEl.value = `K${matchedSurgery.kCode}`;
            kCodeEl.dispatchEvent(new Event('input'));
            kCodeEl.dispatchEvent(new Event('change'));
        }

        // Activer automatiquement les cases à cocher d'affichage
        const showDiagEl = document.getElementById('bill-show-diag');
        if (showDiagEl) showDiagEl.checked = true;
        const showIntervEl = document.getElementById('bill-show-interv');
        if (showIntervEl) showIntervEl.checked = true;

        // Calculer les honoraires chirurgicaux
        const kVal = db.K_VALUE_STANDARD;
        const packCalcule = db.calculateSurgicalPackage(matchedSurgery.kCode, kVal);
        
        if (typeof addCustomBillingRow === 'function') {
            addCustomBillingRow(packCalcule.surgeonPrincipal.name + ` (K${matchedSurgery.kCode})`, packCalcule.surgeonPrincipal.price, packCalcule.surgeonPrincipal.qty);
            addCustomBillingRow(packCalcule.anesthesie.name + ` (K${packCalcule.anesthesie.qty})`, packCalcule.anesthesie.price, packCalcule.anesthesie.qty);
            addCustomBillingRow(packCalcule.secondChirurgien.name + ` (K${packCalcule.secondChirurgien.qty})`, packCalcule.secondChirurgien.price, packCalcule.secondChirurgien.qty);
            addCustomBillingRow(packCalcule.blocOperatoire.name + ` (K${packCalcule.blocOperatoire.qty})`, packCalcule.blocOperatoire.price, packCalcule.blocOperatoire.qty);
            addCustomBillingRow(packCalcule.aideOperatoireMini.name, packCalcule.aideOperatoireMini.price, packCalcule.aideOperatoireMini.qty);
            
            // Prestations cliniques complémentaires
            addCustomBillingRow("Hébergement / Séjour en Chambre Standard", 30000, 3);
            addCustomBillingRow("Actes médico-infirmiers et soins quotidiens", 7500, 3);
            addCustomBillingRow("Bilan Biologique Pré-Opératoire Complet (Laboratoire)", 55000, 1);
        }
        
        if (typeof showBillingNotification === 'function') {
            showBillingNotification(`⚡ Forfait calculé K${matchedSurgery.kCode} généré pour : ${matchedSurgery.name}`);
        }
        return true;
    }

    return false;
}
window.autoLoadPackageFromIntervention = autoLoadPackageFromIntervention;
