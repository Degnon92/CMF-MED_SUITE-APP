/* ============================================================
   app_workflow.js - Workflows de conversion & Duplications
   ============================================================ */

// 1. Suivi des impayés et règlements mutuelles
function toggleBillPaymentStatus(billId) {
    const bill = savedBills.find(b => b.id === billId);
    if (bill) {
        bill.status = (bill.status === 'IMPAYÉ') ? 'RÉGLÉ' : 'IMPAYÉ';
        localStorage.setItem('mercyfiat_bills', JSON.stringify(savedBills));
        if (typeof updateDashboardStats === 'function') updateDashboardStats();
        if (typeof renderRegisterTable === 'function') renderRegisterTable();
        if (typeof renderRecentActivity === 'function') renderRecentActivity();
    }
}
window.toggleBillPaymentStatus = toggleBillPaymentStatus;

// 2. Relance Assurance
function launchAssuranceRecovery(billId) {
    const bill = savedBills.find(b => b.id === billId);
    if (!bill) {
        alert("Facture introuvable.");
        return;
    }
    
    // Basculer sur la section documents
    if (typeof switchSection === 'function') switchSection('documents');
    
    // Remplir les champs de l'éditeur médical
    document.getElementById('doc-patient-nom').value = bill.patientNom;
    document.getElementById('doc-patient-prenom').value = bill.patientPrenom;
    
    // Pour la lettre de relance, on passe le nom de l'assureur dans le champ Âge
    // puisque le modèle utilise {{PATIENT_AGE}} comme COMPAGNIE D'ASSURANCE
    const foundInsurer = window.MercyFiatDB && window.MercyFiatDB.INSURERS 
        ? window.MercyFiatDB.INSURERS.find(ins => ins.id === bill.insurance) 
        : null;
    const insurerName = foundInsurer ? foundInsurer.name : bill.insurance;
                        
    document.getElementById('doc-patient-age').value = insurerName;
    
    // Remplir le diagnostic (Prestation principale ou acte)
    const primaryPrestation = bill.items && bill.items.length > 0 ? bill.items[0].name : "Soins hospitaliers";
    document.getElementById('doc-diagnostique').value = primaryPrestation;
    
    // Charger le modèle relance_assurance
    const selectTemp = document.getElementById('doc-template');
    if (selectTemp) {
        selectTemp.value = 'relance_assurance';
        if (typeof loadDocumentTemplate === 'function') loadDocumentTemplate();
    }
    
    // Remplacer [MONTANT_MUTUELLE] dans le texte de l'éditeur par le montant formaté
    const editor = document.getElementById('doc-editor');
    if (editor) {
        const partAssuranceFormatted = new Intl.NumberFormat('fr-FR').format(bill.partAssurance) + " FCFA";
        editor.value = editor.value.replace(/\[MONTANT_MUTUELLE\]/g, partAssuranceFormatted);
    }
    
    if (typeof updateDocPreview === 'function') updateDocPreview();
}
window.launchAssuranceRecovery = launchAssuranceRecovery;

// 3. Assistant de rédaction clinique IA (Offline)
function generateDocFromKeywords() {
    const inputEl = document.getElementById('doc-keywords-input');
    const editorEl = document.getElementById('doc-editor');
    if (!inputEl || !editorEl) return;
    
    const keywords = inputEl.value.trim();
    if (!keywords) {
        alert("Veuillez saisir des mots-clés dans le champ de l'assistant.");
        return;
    }
    
    let text = editorEl.value;
    const keywordsLower = keywords.toLowerCase();
    
    // 1. Gestion de la latéralité (Côté)
    const isDroit = /\b(droit|droite|dextre|d)\b/i.test(keywords);
    const isGauche = /\b(gauche|senestre|g)\b/i.test(keywords);
    
    if (isDroit && !isGauche) {
        // Remplacement Gauche -> Droit
        text = text
            .replace(/genou gauche/gi, "genou droit")
            .replace(/genou Gauche/gi, "genou Droit")
            .replace(/genou GAUCHE/gi, "genou DROIT")
            .replace(/cuisse gauche/gi, "cuisse droite")
            .replace(/cuisse Gauche/gi, "cuisse Droite")
            .replace(/cuisse GAUCHE/gi, "cuisse DROITE")
            .replace(/patte d'oie gauche/gi, "patte d'oie droite")
            .replace(/patte d'oie Gauche/gi, "patte d'oie Droite")
            .replace(/patte d'oie GAUCHE/gi, "patte d'oie DROITE")
            .replace(/membre inférieur gauche/gi, "membre inférieur droit")
            .replace(/nerf mentonnier gauche/gi, "nerf mentonnier droit")
            .replace(/nerfs mentonniers gauches/gi, "nerfs mentonniers droits")
            .replace(/LCA gauche/gi, "LCA droit")
            .replace(/\bgauche\b/g, "droit")
            .replace(/\bgauches\b/g, "droits")
            .replace(/\bGauche\b/g, "Droit")
            .replace(/\bGauches\b/g, "Droits")
            .replace(/\bGAUCHE\b/g, "DROIT")
            .replace(/\bGAUCHES\b/g, "DROITS");
            
        // Mettre aussi à jour le diagnostic
        const diagEl = document.getElementById('doc-diagnostique');
        if (diagEl) {
            diagEl.value = diagEl.value
                .replace(/genou gauche/gi, "genou droit")
                .replace(/genou Gauche/gi, "genou Droit")
                .replace(/genou GAUCHE/gi, "genou DROIT")
                .replace(/gauche/gi, "droit")
                .replace(/Gauche/gi, "Droit")
                .replace(/GAUCHE/gi, "DROIT");
        }
    } else if (isGauche && !isDroit) {
        // Remplacement Droit -> Gauche
        text = text
            .replace(/genou droit/gi, "genou gauche")
            .replace(/genou Droit/gi, "genou Gauche")
            .replace(/genou DROIT/gi, "genou GAUCHE")
            .replace(/cuisse droite/gi, "cuisse gauche")
            .replace(/cuisse Droite/gi, "cuisse Gauche")
            .replace(/cuisse DROITE/gi, "cuisse GAUCHE")
            .replace(/patte d'oie droite/gi, "patte d'oie gauche")
            .replace(/patte d'oie Droite/gi, "patte d'oie Gauche")
            .replace(/patte d'oie DROITE/gi, "patte d'oie GAUCHE")
            .replace(/membre inférieur droit/gi, "membre inférieur gauche")
            .replace(/nerf mentonnier droit/gi, "nerf mentonnier gauche")
            .replace(/nerfs mentonniers droits/gi, "nerfs mentonniers gauches")
            .replace(/LCA droit/gi, "LCA gauche")
            .replace(/\bdroit\b/g, "gauche")
            .replace(/\bdroite\b/g, "gauche")
            .replace(/\bdroits\b/g, "gauches")
            .replace(/\bDroit\b/g, "Gauche")
            .replace(/\bDroite\b/g, "Gauche")
            .replace(/\bDroits\b/g, "Gauches")
            .replace(/\bDROIT\b/g, "GAUCHE")
            .replace(/\bDROITE\b/g, "GAUCHE")
            .replace(/\bDROITS\b/g, "GAUCHES");
            
        const diagEl = document.getElementById('doc-diagnostique');
        if (diagEl) {
            diagEl.value = diagEl.value
                .replace(/genou droit/gi, "genou gauche")
                .replace(/genou Droit/gi, "genou Gauche")
                .replace(/genou DROIT/gi, "genou GAUCHE")
                .replace(/droit/gi, "gauche")
                .replace(/Droit/gi, "Gauche")
                .replace(/DROIT/gi, "GAUCHE");
        }
    }
    
    // 2. Gestion de la pression du garrot (rechercher un nombre à 3 chiffres entre 150 et 400)
    const garrotMatch = keywords.match(/\b(1[5-9]\d|[2-3]\d\d|400)\b/);
    if (garrotMatch) {
        const pressure = garrotMatch[1];
        text = text.replace(/\d+\s*mmHg/gi, `${pressure} mmHg`);
    }
    
    // 3. Gestion de la taille de la vis d'interférence et du transplant/tunnel
    const mmMatch = keywords.match(/\b(\d+(?:\.\d+)?)\s*mm\b/i);
    if (mmMatch) {
        const size = mmMatch[1];
        const sizeNum = parseFloat(size);
        
        // Vis
        text = text.replace(/vis d'interférence biosynthétique de \d+ mm/gi, `vis d'interférence biosynthétique de ${size} mm`);
        text = text.replace(/vis d'interférence de \d+ mm/gi, `vis d'interférence de ${size} mm`);
        
        // Calibrage et tunnel (size - 1)
        const transplantSize = sizeNum - 1;
        text = text.replace(/calibrage final à \d+ mm/gi, `calibrage final à ${transplantSize} mm`);
        text = text.replace(/tunnel tibial à l'aide du guide tibial incliné à 55° \(diamètre \d+ mm\)/gi, `tunnel tibial à l'aide du guide tibial incliné à 55° (diamètre ${transplantSize} mm)`);
        text = text.replace(/tunnel fémoral par voie antéro-interne à l'aide du guide fémoral \(diamètre \d+ mm\)/gi, `tunnel fémoral par voie antéro-interne à l'aide du guide fémoral (diamètre ${transplantSize} mm)`);
    }
    
    // 4. Gestion des drains et fermetures
    if (keywordsLower.includes('redon') || keywordsLower.includes('drain')) {
        if (!text.includes('drain de Redon')) {
            text = text.replace(/Fermeture cutanée plan par plan/gi, "Mise en place d'un drain de Redon aspiratif n°10. Fermeture cutanée plan par plan");
        }
    }
    if (keywordsLower.includes('agrafe')) {
        text = text.replace(/Fermeture cutanée plan par plan/gi, "Fermeture cutanée plan par plan par agrafes chirurgicales");
        text = text.replace(/fil résorbable Vicryl/gi, "agrafes métalliques");
    }
    
    // Mettre à jour l'éditeur
    editorEl.value = text;
    if (typeof updateDocPreview === 'function') updateDocPreview();
    
    // Notification visuelle
    alert("🪄 Moteur IA : Document rédigé et morphé avec succès selon vos notes !");
}
window.generateDocFromKeywords = generateDocFromKeywords;

// 4. Convertit une Facture Proforma en un Point Définitif avec Tiers-Payant Split automatique
function convertProformaToDefinitifSplit(billId) {
    const bill = savedBills.find(b => b.id === billId);
    if (!bill) {
        alert("Facture introuvable.");
        return;
    }
    
    // 1. Remplir les champs du formulaire de facturation
    document.getElementById('bill-patient-nom').value = bill.patientNom;
    document.getElementById('bill-patient-prenom').value = bill.patientPrenom;
    document.getElementById('bill-type').value = 'DEFINITIF'; // Forcer Point Définitif
    
    const partner = window.MercyFiatDB?.INSURERS?.find(ins => ins.id === bill.insurance);
    const pType = (partner && partner.category === 'Sinistres & Accidents Auto') ? 'SINISTRE' : ((!bill.insurance || bill.insurance === 'PRIVE') ? 'PRIVE' : 'MALADIE');
    const patientTypeEl = document.getElementById('bill-patient-type');
    if (patientTypeEl) {
        patientTypeEl.value = pType;
        if (typeof handleBillPriseEnChargeChange === 'function') {
            handleBillPriseEnChargeChange();
        }
    }
    
    document.getElementById('bill-insurance').value = bill.insurance;
    document.getElementById('bill-coverage').value = bill.coverage;
    document.getElementById('bill-matricule').value = bill.matricule;
    
    // Réinitialiser le titre personnalisé par défaut
    const customTitleInput = document.getElementById('bill-title-custom');
    if (customTitleInput) {
        customTitleInput.value = "Point Définitif d'Hospitalisation";
    }
    
    // Réinitialiser les modes de règlements pour une nouvelle facture définitive
    if (document.getElementById('bill-payment-method')) {
        document.getElementById('bill-payment-method').value = bill.insurance !== 'PRIVE' ? 'TIERS_PAYANT' : 'CASH';
    }
    if (document.getElementById('bill-amount-paid-patient')) {
        document.getElementById('bill-amount-paid-patient').value = '';
    }
    
    // 2. Activer automatiquement le Split si assuré
    const splitCheckbox = document.getElementById('bill-use-split');
    const splitContainer = document.getElementById('split-mode-container');
    
    if (splitContainer) {
        if (bill.insurance === 'PRIVE') {
            splitContainer.style.display = 'none';
            if (splitCheckbox) splitCheckbox.checked = false;
        } else {
            splitContainer.style.display = 'flex';
            if (splitCheckbox) splitCheckbox.checked = true; // Activer le split
        }
    }
    
    // 3. Charger les lignes de la proforma
    const container = document.getElementById('billing-items-container');
    if (container) {
        container.innerHTML = '';
        bill.items.forEach(item => {
            if (typeof addCustomBillingRow === 'function') {
                addCustomBillingRow(
                    item.name, 
                    item.price, 
                    item.qty,
                    item.splitLimit !== undefined ? item.splitLimit : null,
                    item.splitRate !== undefined ? item.splitRate : null
                );
            }
        });
    }
    
    // Réinitialiser la référence pour forcer la génération d'une nouvelle référence officielle MF-DEF-... lors du clic sur Enregistrer
    window.activeBillReference = null;
    
    // Gérer le changement de type de document pour afficher le titre personnalisé et le split mode
    if (typeof handleBillTypeChange === 'function') {
        handleBillTypeChange();
    }
    
    // Activer visuellement le split mode sur les lignes
    if (typeof toggleBillingSplitMode === 'function') {
        toggleBillingSplitMode();
    }
    
    // Ouvrir l'écran de facturation
    if (typeof switchSection === 'function') switchSection('billing');
    
    // Notification toast premium
    if (typeof showBillingNotification === 'function') {
        showBillingNotification(`Converti en Point d'Hospitalisation pour ${bill.patientNom} ! Plafonds et taux d'assurances appliqués.`);
    }
    if (typeof setFormLockState === 'function') {
        setFormLockState('billing', false);
    }
}
window.convertProformaToDefinitifSplit = convertProformaToDefinitifSplit;

// 5. Convertit une Facture Proforma en un Détail Assurance Facture Proforma
function convertProformaToDetailAssurance(billId) {
    const bill = savedBills.find(b => b.id === billId);
    if (!bill) {
        alert("Facture introuvable.");
        return;
    }
    
    // 1. Remplir les champs du formulaire de facturation
    document.getElementById('bill-patient-nom').value = bill.patientNom;
    document.getElementById('bill-patient-prenom').value = bill.patientPrenom;
    document.getElementById('bill-type').value = 'DETAIL_ASSUR'; // Forcer Détail Assurance
    
    const partner = window.MercyFiatDB?.INSURERS?.find(ins => ins.id === bill.insurance);
    const pType = (partner && partner.category === 'Sinistres & Accidents Auto') ? 'SINISTRE' : ((!bill.insurance || bill.insurance === 'PRIVE') ? 'PRIVE' : 'MALADIE');
    const patientTypeEl = document.getElementById('bill-patient-type');
    if (patientTypeEl) {
        patientTypeEl.value = pType;
        if (typeof handleBillPriseEnChargeChange === 'function') {
            handleBillPriseEnChargeChange();
        }
    }
    
    document.getElementById('bill-insurance').value = bill.insurance;
    document.getElementById('bill-coverage').value = bill.coverage;
    document.getElementById('bill-matricule').value = bill.matricule;
    
    // Réinitialiser les modes de règlements
    if (document.getElementById('bill-payment-method')) {
        document.getElementById('bill-payment-method').value = bill.insurance !== 'PRIVE' ? 'TIERS_PAYANT' : 'CASH';
    }
    if (document.getElementById('bill-amount-paid-patient')) {
        document.getElementById('bill-amount-paid-patient').value = '';
    }
    
    // 2. Activer automatiquement le Split
    const splitCheckbox = document.getElementById('bill-use-split');
    const splitContainer = document.getElementById('split-mode-container');
    
    if (splitContainer) {
        if (!bill.insurance || bill.insurance === 'PRIVE') {
            splitContainer.style.display = 'none';
            if (splitCheckbox) splitCheckbox.checked = false;
        } else {
            splitContainer.style.display = 'flex';
            if (splitCheckbox) splitCheckbox.checked = true; // Activer le split
        }
    }
    
    // 3. Charger les lignes de la proforma
    const container = document.getElementById('billing-items-container');
    if (container) {
        container.innerHTML = '';
        bill.items.forEach(item => {
            if (typeof addCustomBillingRow === 'function') {
                addCustomBillingRow(
                    item.name, 
                    item.price, 
                    item.qty, 
                    item.splitLimit !== undefined ? item.splitLimit : null, 
                    item.splitRate !== undefined ? item.splitRate : null
                );
            }
        });
    }
    
    // Réinitialiser la référence pour forcer la génération d'une nouvelle référence officielle MF-DET-... lors du clic sur Enregistrer
    window.activeBillReference = null;
    
    // Gérer le changement de type de document pour afficher le titre personnalisé et le split mode
    if (typeof handleBillTypeChange === 'function') {
        handleBillTypeChange();
    }
    
    // Activer visuellement le split mode sur les lignes
    if (typeof toggleBillingSplitMode === 'function') {
        toggleBillingSplitMode();
    }
    
    // Ouvrir l'écran de facturation
    if (typeof switchSection === 'function') switchSection('billing');
    
    // Notification toast premium
    if (typeof showBillingNotification === 'function') {
        showBillingNotification(`Converti en Détail Assurance pour ${bill.patientNom} ! Prêt à saisir l'accord physique.`);
    }
    if (typeof setFormLockState === 'function') {
        setFormLockState('billing', false);
    }
}
window.convertProformaToDetailAssurance = convertProformaToDetailAssurance;

// 6. Déclenchement de la duplication de facture depuis l'éditeur
function duplicateCurrentBillFromEditor() {
    if (!window.loadedBillId) {
        alert("Aucune facture n'est chargée actuellement pour duplication.");
        return;
    }
    // Cloner la facture courante en effaçant l'identifiant chargé et la référence pour qu'elle devienne une nouvelle facture lors de l'enregistrement
    window.loadedBillId = null;
    window.activeBillReference = null;
    const dupBtn = document.getElementById('btn-duplicate-bill');
    if (dupBtn) dupBtn.style.display = 'none';
    
    // Mettre à jour la référence affichée à l'écran (provisoire)
    if (typeof updateBillPreview === 'function') {
        updateBillPreview();
    }
    if (typeof setFormLockState === 'function') {
        setFormLockState('billing', false);
    }
    if (typeof showNotificationToast === 'function') {
        showNotificationToast("👯 Facture dupliquée dans l'éditeur. Modifiez le patient ou les actes, puis cliquez sur Enregistrer.");
    }
}
window.duplicateCurrentBillFromEditor = duplicateCurrentBillFromEditor;

// 7. Déclenchement de la duplication de document depuis l'éditeur
function duplicateCurrentDocFromEditor() {
    if (!window.loadedDocId) {
        alert("Aucun rapport n'est chargé actuellement pour duplication.");
        return;
    }
    window.loadedDocId = null;
    const dupBtn = document.getElementById('btn-duplicate-doc');
    if (dupBtn) dupBtn.style.display = 'none';
    
    if (typeof setFormLockState === 'function') {
        setFormLockState('documents', false);
    }
    if (typeof showNotificationToast === 'function') {
        showNotificationToast("👯 Rapport dupliqué dans l'éditeur. Modifiez le patient ou le contenu, puis cliquez sur Enregistrer.");
    }
}
window.duplicateCurrentDocFromEditor = duplicateCurrentDocFromEditor;
