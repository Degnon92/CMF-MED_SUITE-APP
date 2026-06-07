/* ============================================================
   app_recent_activity.js - Activité Récente & Modal Preview
   ============================================================ */

// Helper local résilient pour le formatage monétaire
function safeFormatCurrency(amount) {
    if (typeof window.formatCurrency === 'function') {
        return window.formatCurrency(amount);
    }
    return new Intl.NumberFormat('fr-FR').format(amount) + " FCFA";
}

// Rendu du tableau d'activité récente (Dashboard)
function renderRecentActivity() {
    const list = document.getElementById('recent-patients-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    // Combiner les factures et les documents récents
    const recentActivity = [];
    const billsList = window.savedBills || [];
    const docsList = window.savedDocuments || [];
    
    billsList.slice(0, 5).forEach(b => {
        recentActivity.push({
            name: `${b.patientNom} ${b.patientPrenom}`,
            type: b.type === 'PROFORMA' ? 'Facture Proforma' : 'Point Définitif',
            insurance: b.insurance,
            value: safeFormatCurrency(b.grossTotal),
            date: b.date,
            rawItem: b,
            category: 'BILL'
        });
    });
    
    docsList.slice(0, 3).forEach(d => {
        recentActivity.push({
            name: `${d.patientNom} ${d.patientPrenom}`,
            type: 'Rapport Clinique',
            insurance: 'N/A',
            value: d.diagnosis.length > 30 ? d.diagnosis.substring(0, 30) + '...' : d.diagnosis,
            date: d.date,
            rawItem: d,
            category: 'DOC'
        });
    });
    
    // Trier par date décroissante
    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    recentActivity.slice(0, 5).forEach(act => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong onclick="if (typeof openPatientDMEDrawer === 'function') openPatientDMEDrawer('${act.name.replace(/'/g, "\\'")}')" style="cursor:pointer; color:var(--accent-blue); text-decoration:underline;">${act.name}</strong></td>
            <td><span class="badge ${act.category === 'BILL' ? 'dark' : 'light'}">${act.type}</span></td>
            <td>${act.insurance}</td>
            <td>${act.value}</td>
            <td>${new Date(act.date).toLocaleDateString('fr-FR')}</td>
            <td>
                <button class="btn btn-secondary btn-small" onclick="viewRecentItem('${act.category}', '${act.rawItem.id}')">Ouvrir</button>
            </td>
        `;
        list.appendChild(tr);
    });
}
window.renderRecentActivity = renderRecentActivity;

// Ouvre une fiche récente
function viewRecentItem(category, itemId) {
    window.isLoadingRecentItem = true;
    try {
        if (category === 'BILL') {
            const billsList = window.savedBills || [];
            const bill = billsList.find(b => b.id === itemId);
            if (bill) {
                window.loadedBillId = itemId;
                const dupBtn = document.getElementById('btn-duplicate-bill');
                if (dupBtn) dupBtn.style.display = 'block';

                // Remplir le formulaire
                const patientNomEl = document.getElementById('bill-patient-nom');
                if (patientNomEl) patientNomEl.value = bill.patientNom || '';
                
                const patientPrenomEl = document.getElementById('bill-patient-prenom');
                if (patientPrenomEl) patientPrenomEl.value = bill.patientPrenom || '';
                
                const typeEl = document.getElementById('bill-type');
                if (typeEl) typeEl.value = bill.type || 'PROFORMA';
                
                const partner = window.MercyFiatDB?.INSURERS?.find(ins => ins.id === bill.insurance);
                const pType = (partner && partner.category === 'Sinistres & Accidents Auto') ? 'SINISTRE' : ((!bill.insurance || bill.insurance === 'PRIVE') ? 'PRIVE' : 'MALADIE');
                const patientTypeEl = document.getElementById('bill-patient-type');
                if (patientTypeEl) {
                    patientTypeEl.value = pType;
                    if (typeof handleBillPriseEnChargeChange === 'function') {
                        handleBillPriseEnChargeChange();
                    }
                }
                
                const insuranceEl = document.getElementById('bill-insurance');
                if (insuranceEl) insuranceEl.value = bill.insurance || 'PRIVE';
                
                // Charger la date d'origine de la facture
                const billDateEl = document.getElementById('bill-date');
                if (billDateEl) billDateEl.value = bill.date || '';
                
                const coverageEl = document.getElementById('bill-coverage');
                if (coverageEl) coverageEl.value = bill.coverage !== undefined ? bill.coverage : 0;
                
                const matriculeEl = document.getElementById('bill-matricule');
                if (matriculeEl) matriculeEl.value = bill.matricule || '';
                
                // Récupération dynamique depuis la base de données des patients si les champs cliniques de la facture sont vides (factures anciennes)
                let activeDiag = bill.diagnostic || '';
                let activeInterv = bill.intervention || '';
                let activeKCode = bill.kCode || '';

                const dbObj = window.MercyFiatDB || (typeof MercyFiatDB !== 'undefined' ? MercyFiatDB : null);
                if (dbObj && dbObj.PATIENTS && (!activeDiag || !activeInterv)) {
                    const patientName = `${bill.patientNom || ''} ${bill.patientPrenom || ''}`.trim().toUpperCase();
                    const foundPatient = dbObj.PATIENTS.find(p => p.name.trim().toUpperCase() === patientName);
                    if (foundPatient) {
                        if (!activeDiag) activeDiag = foundPatient.diagnosis || '';
                        if (!activeInterv) activeInterv = foundPatient.intervention || '';
                        if (!activeKCode) activeKCode = foundPatient.kCode || '';
                    }
                }

                // Nouveaux champs diagnostic, intervention et code K
                const diagEl = document.getElementById('bill-diagnostic');
                if (diagEl) diagEl.value = activeDiag;
                
                const intervEl = document.getElementById('bill-intervention');
                if (intervEl) intervEl.value = activeInterv;
                
                const kcodeEl = document.getElementById('bill-k-code');
                if (kcodeEl) kcodeEl.value = activeKCode;
                
                // Toggles d'affichage
                const showDiagEl = document.getElementById('bill-show-diag');
                if (showDiagEl) {
                    showDiagEl.checked = bill.hasOwnProperty('showDiag') ? bill.showDiag : (activeDiag !== '');
                }
                const showIntervEl = document.getElementById('bill-show-interv');
                if (showIntervEl) {
                    showIntervEl.checked = bill.hasOwnProperty('showInterv') ? bill.showInterv : (activeInterv !== '');
                }
                const showSigEl = document.getElementById('bill-show-sig');
                if (showSigEl) {
                    showSigEl.checked = bill.hasOwnProperty('showSig') ? bill.showSig : true;
                }
                const showCachetEl = document.getElementById('bill-show-cachet');
                if (showCachetEl) {
                    showCachetEl.checked = bill.hasOwnProperty('showCachet') ? bill.showCachet : true;
                }
                
                // Mode de règlement et versé patient
                const paymentMethodEl = document.getElementById('bill-payment-method');
                if (paymentMethodEl) {
                    paymentMethodEl.value = bill.paymentMethod || 'CASH';
                }
                const amountPaidPatientEl = document.getElementById('bill-amount-paid-patient');
                if (amountPaidPatientEl) {
                    amountPaidPatientEl.value = bill.amountPaidPatient !== undefined ? bill.amountPaidPatient : '';
                }
                
                // État du Tiers-Payant Split
                const splitCheckbox = document.getElementById('bill-use-split');
                if (splitCheckbox) {
                    splitCheckbox.checked = bill.useSplit || false;
                }
                
                // Chargement de la réduction flexible
                const discountTypeEl = document.getElementById('bill-discount-type');
                const discountValueEl = document.getElementById('bill-discount-value');
                if (discountTypeEl && discountValueEl) {
                    discountTypeEl.value = bill.discountType || 'PERCENT';
                    discountValueEl.value = bill.hasOwnProperty('discountValue') ? bill.discountValue : (bill.discountPct || 0);
                }
                if (typeof updateBillDiscountDisplay === 'function') {
                    updateBillDiscountDisplay();
                }
                
                // Intitulé personnalisé pour les points hospitaliers
                const customTitleInput = document.getElementById('bill-title-custom');
                if (customTitleInput) {
                    customTitleInput.value = bill.customTitle || "Point Définitif d'Hospitalisation";
                }
                
                // Recréer les lignes d'items avec les split limits et rates
                const container = document.getElementById('billing-items-container');
                if (container) {
                    container.innerHTML = '';
                    if (Array.isArray(bill.items)) {
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
                }
                
                // Gérer le changement de type de document pour afficher le titre personnalisé et le split mode
                if (typeof handleBillTypeChange === 'function') {
                    handleBillTypeChange();
                }
                
                // Déterminer la bonne sous-section de facturation et activer
                let subType = 'proforma';
                if (bill.type === 'DETAIL_ASSUR') {
                    subType = 'assurance';
                } else if (bill.type === 'DEFINITIF') {
                    subType = 'definitif';
                }
                if (typeof switchSubSection === 'function') switchSubSection('billing', subType);
                if (typeof setFormLockState === 'function') setFormLockState('billing', true);
            }
        } else {
            const docsList = window.savedDocuments || [];
            const doc = docsList.find(d => d.id === itemId);
            if (doc) {
                window.loadedDocId = itemId;
                const dupBtn = document.getElementById('btn-duplicate-doc');
                if (dupBtn) dupBtn.style.display = 'block';

                let nom = doc.patientNom || '';
                let prenom = doc.patientPrenom || '';
                let age = doc.patientAge || '';

                // Dynamically heal patient Nom/Prenom on opening
                const cleanPatientNameFn = window.cleanPatientName || ((n) => n.trim().toUpperCase());
                const cleanNom = cleanPatientNameFn(nom);
                if (cleanNom) {
                    const parts = cleanNom.split(' ');
                    if (parts.length > 1 && (!prenom || prenom.trim() === '')) {
                        nom = parts[0];
                        prenom = parts.slice(1).join(' ');
                    } else {
                        nom = cleanNom;
                    }
                }

                // Dynamically heal patient Age on opening
                if (age && typeof age === 'string') {
                    const ageMatch = age.match(/^\d+\s*(?:ans|g|mois|ans\s+d['’]âge)/i) || age.match(/\d+\s*(?:ans|g|mois)/i);
                    if (ageMatch) {
                        age = ageMatch[0].trim();
                    } else if (age.length > 10) {
                        age = 'N/A';
                    }
                }

                const docPatientNomEl = document.getElementById('doc-patient-nom');
                if (docPatientNomEl) docPatientNomEl.value = nom;
                
                const docPatientPrenomEl = document.getElementById('doc-patient-prenom');
                if (docPatientPrenomEl) docPatientPrenomEl.value = prenom;
                
                const docPatientAgeEl = document.getElementById('doc-patient-age');
                if (docPatientAgeEl) docPatientAgeEl.value = age;
                
                const docDateEl = document.getElementById('doc-date');
                if (docDateEl) docDateEl.value = doc.date || '';
                
                const docDiagEl = document.getElementById('doc-diagnostique');
                if (docDiagEl) docDiagEl.value = doc.diagnosis || '';
                
                const docEditorEl = document.getElementById('doc-editor');
                if (docEditorEl) docEditorEl.value = doc.content || doc.text || '';
                
                const docTemplateEl = document.getElementById('doc-template');
                if (docTemplateEl) docTemplateEl.value = doc.templateId || 'rapport_cs_simple';
                
                // Auto-détection du médecin signataire à partir du contenu
                const fullText = (doc.content || doc.text || '').toLowerCase();
                let matchedMedecinId = 'agavoedo'; // par défaut
                
                const docKeywords = [
                    { id: 'agavoedo', keys: ['agavoedo'] },
                    { id: 'djedou', keys: ['djedou'] },
                    { id: 'hazoume', keys: ['hazoume'] },
                    { id: 'dah', keys: ['dah'] },
                    { id: 'lassissi', keys: ['lassissi'] },
                    { id: 'medenou', keys: ['medenou'] },
                    { id: 'sessinou', keys: ['sessinou'] },
                    { id: 'chobli', keys: ['chobli'] },
                    { id: 'amoussou', keys: ['amoussou'] },
                    { id: 'bacharou', keys: ['bacharou'] },
                    { id: 'jacquet', keys: ['jacquet'] },
                    { id: 'soumanou', keys: ['soumanou'] },
                    { id: 'hounton', keys: ['hounton'] },
                    { id: 'kassein', keys: ['kassein'] },
                    { id: 'akpakpo', keys: ['akpakpo'] },
                    { id: 'hounsou', keys: ['hounsou'] }
                ];
                
                for (const dk of docKeywords) {
                    if (dk.keys.some(k => fullText.includes(k))) {
                        matchedMedecinId = dk.id;
                        break;
                    }
                }
                
                if (typeof window.setSelectedDoctor === 'function') {
                    window.setSelectedDoctor(matchedMedecinId);
                }
                
                // Déterminer la bonne sous-section clinique et activer
                let subType = 'consult';
                const tempId = doc.templateId || '';
                if (tempId.startsWith('cro_')) {
                    subType = 'cro';
                } else if (tempId.startsWith('rapport_hospi_') || tempId === 'rapport_medical') {
                    subType = 'hospi';
                } else if (tempId.startsWith('rapport_cs_')) {
                    subType = 'consult';
                } else if (tempId.startsWith('certif_') || tempId === 'relance_assurance') {
                    subType = 'certif';
                }
                if (typeof switchSubSection === 'function') switchSubSection('documents', subType);
                if (typeof setFormLockState === 'function') setFormLockState('documents', true);
            }
        }
    } catch (err) {
        console.error("Erreur critique dans viewRecentItem:", err);
    } finally {
        window.isLoadingRecentItem = false;
        if (category === 'BILL') {
            if (typeof updateBillPreview === 'function') updateBillPreview();
        } else {
            if (typeof updateDocPreview === 'function') updateDocPreview();
        }
    }
}
window.viewRecentItem = viewRecentItem;
