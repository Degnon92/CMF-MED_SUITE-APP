/* ============================================================
   app.js - Noyau applicatif principal de MercyFiat MedSuite
   ============================================================ */

// Initialisation globale au chargement de l'application
document.addEventListener('DOMContentLoaded', () => {
    // Purger les anciens caches d'apprentissage utilisateur résiduels corrompus
    localStorage.removeItem('mercyfiat_custom_patients');
    localStorage.removeItem('mercyfiat_custom_diagnoses');
    localStorage.removeItem('mercyfiat_custom_interventions');

    // Lancer la routine d'assainissement et de déduplication complète
    // (inclut la fusion propre de window.MercyFiatRealDocs depuis real_data.js)
    if (typeof sanitizeEntireDatabase === 'function') {
        sanitizeEntireDatabase();
    }

    // Curer les rapports médicaux et les factures sauvegardés des anomalies d'importation (noms et âges corrompus)
    (function() {
        let docsUpdated = false;
        savedDocuments.forEach(d => {
            const origNom = d.patientNom || '';
            const cleanNom = typeof cleanPatientName === 'function' ? cleanPatientName(origNom) : origNom;
            if (cleanNom && cleanNom !== origNom) {
                const parts = cleanNom.split(' ');
                d.patientNom = parts[0] || cleanNom;
                d.patientPrenom = parts.slice(1).join(' ') || d.patientPrenom || '';
                docsUpdated = true;
            }
            
            const origAge = d.patientAge || '';
            if (origAge && typeof origAge === 'string') {
                const ageMatch = origAge.match(/^\d+\s*(?:ans|g|mois|ans\s+d['’]âge)/i) || origAge.match(/\d+\s*(?:ans|g|mois)/i);
                let newAge = origAge;
                if (ageMatch) {
                    newAge = ageMatch[0].trim();
                } else if (origAge.length > 10) {
                    newAge = 'N/A';
                }
                if (newAge !== origAge) {
                    d.patientAge = newAge;
                    docsUpdated = true;
                }
            }
        });
        if (docsUpdated) {
            localStorage.setItem('mercyfiat_docs', JSON.stringify(savedDocuments));
        }

        let billsUpdated = false;
        savedBills.forEach(b => {
            const origNom = b.patientNom || '';
            const cleanNom = typeof cleanPatientName === 'function' ? cleanPatientName(origNom) : origNom;
            if (cleanNom && cleanNom !== origNom) {
                const parts = cleanNom.split(' ');
                b.patientNom = parts[0] || cleanNom;
                b.patientPrenom = parts.slice(1).join(' ') || b.patientPrenom || '';
                billsUpdated = true;
            }
            
            const origAge = b.patientAge || '';
            if (origAge && typeof origAge === 'string') {
                const ageMatch = origAge.match(/^\d+\s*(?:ans|g|mois|ans\s+d['’]âge)/i) || origAge.match(/\d+\s*(?:ans|g|mois)/i);
                let newAge = origAge;
                if (ageMatch) {
                    newAge = ageMatch[0].trim();
                } else if (origAge.length > 10) {
                    newAge = 'N/A';
                }
                if (newAge !== origAge) {
                    b.patientAge = newAge;
                    billsUpdated = true;
                }
            }
        });
        if (billsUpdated) {
            localStorage.setItem('mercyfiat_bills', JSON.stringify(savedBills));
        }
    })();
    
    // Initialiser les widgets et tableaux de bord
    if (typeof updateDashboardStats === 'function') updateDashboardStats();
    if (typeof renderRecentActivity === 'function') renderRecentActivity();
    if (typeof processConvalescenceAlerts === 'function') processConvalescenceAlerts();
    if (typeof renderAnalyticsCharts === 'function') renderAnalyticsCharts();
});

// Enregistre une facture
async function saveActiveBill() {
    const patientNom = (document.getElementById('bill-patient-nom').value || "").trim().toUpperCase();
    const patientPrenom = (document.getElementById('bill-patient-prenom').value || "").trim();
    const billType = document.getElementById('bill-type').value;
    const insurance = document.getElementById('bill-insurance').value;
    const coverage = parseFloat(document.getElementById('bill-coverage').value) || 0;
    const matricule = document.getElementById('bill-matricule').value || "N/A";
    const patientType = document.getElementById('bill-patient-type')?.value || "PRIVE";
    
    if (!patientNom || !patientPrenom) {
        alert("🔒 Faille de saisie : Le nom et le prénom du patient sont obligatoires pour générer une facture officielle.");
        return;
    }
    
    if (coverage < 0 || coverage > 100) {
        alert("🔒 Faille de tarification : Le taux de couverture d'assurance doit être compris entre 0% et 100%.");
        return;
    }

    const typeText = billType === 'PROFORMA' ? 'la facture PROFORMA' : (billType === 'DETAIL_ASSUR' ? "le DETAIL ASSURANCE" : "le POINT DEFINITIF");
    if (!await confirm(`Voulez-vous vraiment enregistrer ${typeText} pour le patient ${patientNom} ${patientPrenom} ?`)) {
        return;
    }
    
    const useSplit = document.getElementById('bill-use-split')?.checked || false;
    const rawItems = [];
    let hasInvalidItem = false;
    const rows = document.querySelectorAll('#billing-items-container .item-row');
    
    rows.forEach(row => {
        const name = row.querySelector('.item-name').value.trim();
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const qty = parseInt(row.querySelector('.item-qty').value) || 0;
        
        if (name) {
            if (price <= 0) {
                alert(`🔒 Faille logicielle : Le prix de la prestation "${name}" doit être strictement supérieur à 0 FCFA.`);
                hasInvalidItem = true;
                return;
            }
            if (qty <= 0) {
                alert(`🔒 Faille logicielle : La quantité pour "${name}" doit être strictement supérieure à 0.`);
                hasInvalidItem = true;
                return;
            }
            
            let itemSplitLimit = price * qty;
            let itemSplitRate = coverage;
            
            if (useSplit && patientType !== 'PRIVE') {
                const limitInput = row.querySelector('.item-split-limit');
                const rateInput = row.querySelector('.item-split-rate');
                itemSplitLimit = parseFloat(limitInput?.value) || (price * qty);
                itemSplitRate = parseFloat(rateInput?.value) || coverage;
            }
            
            rawItems.push({ 
                name, 
                price, 
                qty, 
                splitLimit: itemSplitLimit, 
                splitRate: itemSplitRate
            });
        }
    });
    
    if (hasInvalidItem) return;
    
    if (rawItems.length === 0) {
        alert("🔒 Faille logicielle : Veuillez saisir au moins une prestation ou frais de soins.");
        return;
    }
    
    // Calculs financiers isolés
    const discountTypeEl = document.getElementById('bill-discount-type');
    const discountValueEl = document.getElementById('bill-discount-value');
    const discountType = discountTypeEl ? discountTypeEl.value : 'PERCENT';
    const discountValue = discountValueEl ? parseFloat(discountValueEl.value) || 0 : 0;
    
    const paymentMethod = document.getElementById('bill-payment-method').value;
    const rawAmountPaid = parseFloat(document.getElementById('bill-amount-paid-patient').value);
    
    const totals = window.MercyFiatCalculations.calculateBillTotals(
        rawItems,
        discountType,
        discountValue,
        patientType,
        coverage,
        rawAmountPaid,
        useSplit
    );
    
    if (totals.amountPaidPatient < 0) {
        alert("🔒 Faille logicielle : Le montant réglé par le patient ne peut pas être inférieur à 0 FCFA.");
        return;
    }
    
    // Référence séquentielle unique et permanente
    const reference = generateSequentialBillReference(billType);
    const status = (billType === 'DEFINITIF' && (patientType !== 'PRIVE' || totals.balancePatient > 0)) ? 'IMPAYÉ' : 'RÉGLÉ';
    
    // Titre personnalisé pour les points hospitaliers
    const customTitle = billType === 'DEFINITIF' ? (document.getElementById('bill-title-custom')?.value || "Point Définitif d'Hospitalisation").trim() : "";
    
    const diagnostic = document.getElementById('bill-diagnostic')?.value?.trim() || '';
    const intervention = document.getElementById('bill-intervention')?.value?.trim() || '';
    const kCode = document.getElementById('bill-k-code')?.value?.trim() || '';
    const showDiag = document.getElementById('bill-show-diag')?.checked || false;
    const showInterv = document.getElementById('bill-show-interv')?.checked || false;
    const showSig = document.getElementById('bill-show-sig')?.checked !== false;
    const showCachet = document.getElementById('bill-show-cachet')?.checked !== false;

    const newBill = {
        id: 'BILL-' + Date.now(),
        reference,
        patientNom,
        patientPrenom,
        type: billType, // PROFORMA, DETAIL_ASSUR ou DEFINITIF
        customTitle,
        insurance: patientType === 'PRIVE' ? 'PRIVE' : insurance,
        coverage: patientType === 'PRIVE' ? 0 : coverage,
        matricule: patientType === 'PRIVE' ? '' : matricule,
        patientType,
        diagnostic,
        intervention,
        kCode,
        showDiag,
        showInterv,
        showSig,
        showCachet,
        useSplit,
        items: totals.items,
        grossTotal: totals.grossTotal,
        discountPct: totals.discountPct,
        reductionAmount: totals.reductionAmount,
        discountedTotal: totals.discountedTotal,
        discountType: discountType,
        discountValue: discountValue,
        partAssurance: totals.partAssurance,
        partPatient: totals.partPatient,
        paymentMethod: patientType === 'PRIVE' ? 'CASH' : paymentMethod,
        amountPaidPatient: totals.amountPaidPatient,
        balancePatient: totals.balancePatient,
        status,
        date: document.getElementById('bill-date')?.value || new Date().toISOString().substring(0, 10)
    };
    
    let existingIndex = -1;
    if (window.loadedBillId) {
        existingIndex = savedBills.findIndex(b => b.id === window.loadedBillId);
    }
    
    if (existingIndex > -1) {
        const oldBill = savedBills[existingIndex];
        newBill.id = oldBill.id;
        newBill.reference = oldBill.reference; // Préserver la référence officielle d'origine
        newBill.date = oldBill.date; // Préserver la date de création d'origine
        savedBills[existingIndex] = newBill;
    } else {
        savedBills.unshift(newBill);
    }
    
    localStorage.setItem('mercyfiat_bills', JSON.stringify(savedBills));
    window.loadedBillId = null;
    const dupBtn = document.getElementById('btn-duplicate-bill');
    if (dupBtn) dupBtn.style.display = 'none';
    
    // Apprentissage automatique du patient et de sa nomenclature
    dynamicallyLearnNewData(
        patientNom, 
        patientPrenom, 
        "", 
        diagnostic, 
        intervention, 
        kCode, 
        patientType === 'PRIVE' ? 'PRIVE' : insurance, 
        patientType, 
        patientType === 'PRIVE' ? '' : matricule
    );
    
    showNotificationToast(`Facture enregistrée sous la Réf officielle : ${reference}`);
    if (window.navigationHistory && window.navigationHistory.length > 0) {
        navigateBack();
    } else {
        switchSection('dashboard');
    }
}

// Contrôleurs de création manuelle de patient (Modal)
function handleModalPriseEnChargeChange() {
    const type = document.getElementById('new-patient-type').value;
    const insBlock = document.getElementById('new-patient-insurance-block');
    const label = document.getElementById('new-patient-matricule-label');
    const input = document.getElementById('new-patient-matricule');
    
    if (!insBlock) return;
    
    if (type === 'PRIVE') {
        insBlock.style.display = 'none';
    } else {
        insBlock.style.display = 'block';
        if (type === 'MALADIE') {
            if (label) label.textContent = "N° d'Assuré / Matricule";
            if (input) input.placeholder = "Ex: 4904-2022-400";
        } else if (type === 'SINISTRE') {
            if (label) label.textContent = "N° de Sinistre / Bon de Charge";
            if (input) input.placeholder = "Ex: SIN-2026-8874";
        }
    }
}

function openNewPatientModal() {
    const modal = document.getElementById('new-patient-modal');
    if (modal) {
        document.getElementById('new-patient-form').reset();
        modal.style.display = 'flex';
        handleModalPriseEnChargeChange(); // initialiser l'affichage
    }
}

function closeNewPatientModal() {
    const modal = document.getElementById('new-patient-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function saveNewPatientFromModal() {
    const nom = (document.getElementById('new-patient-nom').value || "").toUpperCase().trim();
    const prenom = (document.getElementById('new-patient-prenom').value || "").trim();
    const age = (document.getElementById('new-patient-age').value || "").trim();
    const diag = (document.getElementById('new-patient-diag').value || "").trim();
    const interv = (document.getElementById('new-patient-interv').value || "").trim();
    const kcode = (document.getElementById('new-patient-kcode').value || "").trim();
    const insurer = (document.getElementById('new-patient-insurer')?.value || "PRIVE");
    const type = (document.getElementById('new-patient-type')?.value || "PRIVE");
    const matricule = (document.getElementById('new-patient-matricule')?.value || "");

    if (!nom || !prenom) {
        alert("Le nom et le prénom sont requis.");
        return;
    }

    if (!await confirm(`Voulez-vous vraiment enregistrer le patient "${nom} ${prenom}" dans la base de données ?`)) {
        return;
    }

    dynamicallyLearnNewData(nom, prenom, age, diag, interv, kcode, insurer, type, matricule);
    showNotificationToast(`Patient ${nom} ${prenom} enregistré avec succès !`);
    closeNewPatientModal();
    
    // Remplissage automatique des formulaires actifs
    const billNomEl = document.getElementById('bill-patient-nom');
    const billPrenomEl = document.getElementById('bill-patient-prenom');
    if (billNomEl) {
        billNomEl.value = nom;
        if (billPrenomEl) billPrenomEl.value = prenom;
        
        const billTypeEl = document.getElementById('bill-patient-type');
        if (billTypeEl) {
            billTypeEl.value = type;
            if (typeof handleBillPriseEnChargeChange === 'function') {
                handleBillPriseEnChargeChange();
            }
        }

        if (interv) {
            const intEl = document.getElementById('bill-intervention');
            if (intEl) {
                intEl.value = interv;
                intEl.dispatchEvent(new Event('change'));
            }
        }

        const insEl = document.getElementById('bill-insurance');
        if (insEl) {
            insEl.value = insurer;
            insEl.dispatchEvent(new Event('change'));
        }

        const matEl = document.getElementById('bill-matricule');
        if (matEl) {
            matEl.value = (type !== 'PRIVE' && matricule) ? matricule : (kcode ? `K-Code: ${kcode}` : "");
        }
        
        if (typeof updateBillPreview === 'function') {
            updateBillPreview();
        }
    }
    
    const docNomEl = document.getElementById('doc-patient-nom');
    const docPrenomEl = document.getElementById('doc-patient-prenom');
    if (docNomEl) {
        docNomEl.value = nom;
        if (docPrenomEl) docPrenomEl.value = prenom;
        if (age) {
            const docAgeEl = document.getElementById('doc-patient-age');
            if (docAgeEl) docAgeEl.value = age;
        }
        if (diag) {
            const docDiagEl = document.getElementById('doc-diagnostique');
            if (docDiagEl) docDiagEl.value = diag;
        }
        if (insurer && insurer !== 'PRIVE') {
            const docInsEl = document.getElementById('doc-insurer');
            if (docInsEl) {
                docInsEl.value = insurer;
                updateInsurerLabel();
            }
        }
        
        if (typeof updateDocPreview === 'function') {
            updateDocPreview();
        }
    }

    if (typeof renderRegisterTable === 'function') {
        renderRegisterTable();
    }

    if (typeof populatePatientDocSelector === 'function') {
        populatePatientDocSelector();
    }
}

// Fonction pour déclencher l'ouverture de la console système via IPC
function toggleDevTools() {
    const req = (typeof window !== 'undefined' && window.require) || (typeof require !== 'undefined' && require);
    if (req) {
        try {
            const electron = req('electron');
            if (electron && electron.ipcRenderer) {
                electron.ipcRenderer.send('toggle-devtools');
            } else {
                alert("Erreur: Le module ipcRenderer d'Electron est introuvable.");
            }
        } catch (e) {
            alert("Erreur d'appel du Mode Développeur : " + e.message);
            console.error("Erreur d'appel du Mode Développeur :", e);
        }
    } else {
        alert("Le mode développeur est uniquement disponible au sein de l'application de bureau Electron (require/window.require est indéfini).");
    }
}

// Raccourcis clavier F12 et Ctrl+Shift+I au niveau du Rendu (double redondance)
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    const isCmdOrCtrl = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;

    if (key === 'f12' || (key === 'i' && isCmdOrCtrl && isShift)) {
        e.preventDefault();
        toggleDevTools();
    }
});

// Remplit dynamiquement tous les sélecteurs d'assurance depuis MercyFiatDB.INSURERS
function populateAllInsuranceSelects() {
    const db = window.MercyFiatDB;
    if (!db || !db.INSURERS) return;

    const selects = [
        { id: 'bill-insurance' },
        { id: 'new-patient-insurer' },
        { id: 'doc-insurer' }
    ];

    selects.forEach(selInfo => {
        const select = document.getElementById(selInfo.id);
        if (!select) return;

        const currentValue = select.value;
        select.innerHTML = '';

        if (selInfo.id === 'doc-insurer') {
            const defaultOpt = document.createElement('option');
            defaultOpt.value = '';
            defaultOpt.textContent = '— Sélectionner —';
            select.appendChild(defaultOpt);
        }

        const categories = {};
        db.INSURERS.forEach(ins => {
            const catName = ins.category || "Autres";
            if (!categories[catName]) {
                categories[catName] = [];
            }
            categories[catName].push(ins);
        });

        for (const [catName, insurers] of Object.entries(categories)) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = catName;
            insurers.forEach(ins => {
                const option = document.createElement('option');
                option.value = ins.id;
                option.textContent = ins.name;
                optgroup.appendChild(option);
            });
            select.appendChild(optgroup);
        }

        if (currentValue) {
            select.value = currentValue;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    populateAllInsuranceSelects();
    if (typeof initializeDatalists === 'function') {
        setTimeout(initializeDatalists, 100);
    }
});

// 1. Réinitialisation complète du formulaire de facturation
function resetBillEditorForm() {
    if (confirm("Voulez-vous vraiment vider le formulaire pour commencer un nouveau devis/facture de zéro ?")) {
        const form = document.getElementById('billing-form');
        if (form) form.reset();
        
        if (window.activeBillingSubSection) {
            const subType = window.activeBillingSubSection;
            if (subType === 'proforma') {
                document.getElementById('bill-type').value = 'PROFORMA';
            } else if (subType === 'assurance') {
                document.getElementById('bill-type').value = 'DETAIL_ASSUR';
            } else if (subType === 'definitif') {
                document.getElementById('bill-type').value = 'DEFINITIF';
            }
        }

        const container = document.getElementById('billing-items-container');
        if (container) container.innerHTML = '';
        
        if (typeof addCustomBillingRow === 'function') {
            addCustomBillingRow("Frais de Bloc Opératoire et Stérilisation", 120000, 1);
            addCustomBillingRow("Hébergement / Séjour en Chambre Standard", 30000, 3);
        }
        
        window.loadedBillId = null;
        window.activeBillReference = null;
        
        const dupBtn = document.getElementById('btn-duplicate-bill');
        if (dupBtn) dupBtn.style.display = 'none';
        
        if (typeof updateInsuranceCoverage === 'function') updateInsuranceCoverage();
        if (typeof updateBillDiscountDisplay === 'function') updateBillDiscountDisplay();
        if (typeof updateBillPreview === 'function') updateBillPreview();
        if (typeof setFormLockState === 'function') setFormLockState('billing', false);
        
        showNotificationToast("✨ Formulaire de facturation réinitialisé !");
    }
}

// 2. Réinitialisation complète de l'éditeur de documents cliniques
function resetDocEditorForm() {
    if (confirm("Voulez-vous vraiment vider l'éditeur pour rédiger un nouveau rapport ?")) {
        const nomInput = document.getElementById('doc-patient-nom');
        const prenomInput = document.getElementById('doc-patient-prenom');
        const ageInput = document.getElementById('doc-patient-age');
        const diagInput = document.getElementById('doc-diagnostique');
        const editorTextarea = document.getElementById('doc-editor');
        
        if (nomInput) nomInput.value = '';
        if (prenomInput) prenomInput.value = '';
        if (ageInput) ageInput.value = '';
        if (diagInput) diagInput.value = '';
        if (editorTextarea) editorTextarea.value = '';
        
        const today = new Date().toISOString().substring(0, 10);
        const dateInput = document.getElementById('doc-date');
        if (dateInput) dateInput.value = today;
        
        window.loadedDocId = null;
        
        const dupBtn = document.getElementById('btn-duplicate-doc');
        if (dupBtn) dupBtn.style.display = 'none';
        
        if (typeof loadDocumentTemplate === 'function') {
            loadDocumentTemplate();
        }
        
        if (typeof updateDocPreview === 'function') updateDocPreview();
        if (typeof setFormLockState === 'function') setFormLockState('documents', false);
        showNotificationToast("✨ Éditeur clinique réinitialisé !");
    }
}

// Ouvre un document archivé en mode lecture dans le modal d'aperçu A4
function openArchiveDocPreview(docId) {
    const doc = savedDocuments.find(d => d.id === docId);
    if (!doc) {
        alert("Document archivé introuvable.");
        return;
    }
    
    let patientName = (doc.patientNom || 'Patient inconnu').trim();
    if (patientName.length > 100) {
        patientName = patientName.split(/[A-Z]{3,}/)[0].trim() || patientName.substring(0, 50) + '...';
    }
    
    const catLabels = {
        'Hospitalisation': '🏥 Rapport d\'Hospitalisation',
        'Consultation': '📋 Rapport de Consultation',
        'Compte-Rendu Opératoire': '🔬 Compte-Rendu Opératoire',
        'Certificat Médical': '📄 Certificat Médical'
    };
    const catLabel = catLabels[doc.category] || doc.category || 'Document Médical';
    
    let contentHtml = '';
    if (doc.content) {
        let cleanContent = doc.content;
        const clinicHeaderPattern = /(?:MEDECINE GENERALE.*?LABORATOIRE|CLINIQUE MERCY FIAT|SEME AGUE PK 18.*?RCCM.*?\d+|Cotonou.*?hospitalisations\).*?\d+|E-mail\s*:\s*cliniquemercyfiat.*?\d+)\\?\n?/gi;
        cleanContent = cleanContent.replace(clinicHeaderPattern, '');
        
        const collabPattern = /(?:Médecine générale\s*Dr DAH|Collaborateurs\s*Dr AKPAKPO|Dr CHOBLI Hervé|Dr ADJIBADE Aminatou|Dr ELEGBEDE Anicet|Dr KASSEIN Urbain|Anesthésie réanimation|Traumatologie-orthopédie|Endocrinologie diabétologie|Chirurgie pédiatrique|Dr SOUMANOU Fouad|Dr DJEDOU Arnaud|Dr LASSISSI Moufidath|Dr MEDENOU Lionel|Dr BACHAROU Salwane|Dr HAZOUME Michèle|Dr JACQUET Djamal).*?\\n?/gi;
        cleanContent = cleanContent.replace(collabPattern, '');
        
        cleanContent = cleanContent.replace(/\n{3,}/g, '\n\n');
        
        const lines = cleanContent.split(/\r?\n/).filter(l => l.trim().length > 0);
        contentHtml = lines.map(line => {
            const trimmed = line.trim();
            if (trimmed === trimmed.toUpperCase() && trimmed.length < 80 && trimmed.length > 3 && !trimmed.startsWith('-')) {
                return `<p style="font-weight:800; font-size:1rem; color:#1a202c; margin:10px 0 4px 0; text-transform:uppercase;">${trimmed}</p>`;
            }
            if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
                return `<p style="margin:2px 0 2px 20px; padding-left:10px; border-left:2px solid #d4a76a;">• ${trimmed.substring(1).trim()}</p>`;
            }
            return `<p style="margin:4px 0; line-height:1.6;">${trimmed}</p>`;
        }).join('');
    }
    
    const previewContainer = document.getElementById('doc-print-preview');
    if (!previewContainer) return;
    
    previewContainer.innerHTML = `
        <div style="font-family:'Times New Roman', Times, serif; color:#1a202c; background:white; position:relative; min-height:29.7cm; padding-bottom:80px;">
        
        <!-- EN-TÊTE -->
        ${window.MercyFiatTemplates.getPrintHeaderHtml()}
        
        <!-- INFOS PATIENT & DOCUMENT -->
        <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:0.85rem; color:#1a202c;">
            <div>
                <p style="margin:0 0 3px 0;"><strong>Patient :</strong> ${patientName}</p>
                <p style="margin:0;"><strong>Catégorie :</strong> ${catLabel}</p>
            </div>
            <div style="text-align:right;">
                <p style="margin:0 0 3px 0;"><strong>Date :</strong> ${doc.date ? new Date(doc.date).toLocaleDateString('fr-FR') : 'N/A'}</p>
                <p style="margin:0;"><strong>Réf :</strong> <span style="font-family:monospace; font-size:0.78rem; color:var(--text-secondary);">${doc.id} (Archive)</span></p>
            </div>
        </div>
        
        <!-- TITRE DU DOCUMENT -->
        <div style="text-align:center; margin:20px 0; padding:12px; border:2px solid #2d3748; border-radius:4px;">
            <h2 style="margin:0; font-size:1.15rem; font-weight:900; text-transform:uppercase; letter-spacing:1px; color:#2d3748;">${doc.title || catLabel}</h2>
        </div>
        
        <!-- DIAGNOSTIC -->
        ${doc.diagnosis && doc.diagnosis !== 'Bilan et traitement clinique' ? `
        <div style="margin-bottom:12px; padding:8px 12px; background:#f7fafc; border-left:4px solid #4a6fa5; border-radius:0 6px 6px 0;">
            <strong style="font-size:0.82rem; color:#4a6fa5;">Diagnostic :</strong>
            <span style="font-size:0.88rem;">${doc.diagnosis}</span>
        </div>` : ''}
        
        <!-- CONTENU DU RAPPORT -->
        <div style="font-size:0.88rem; line-height:1.65; color:#2d3748; text-align:justify;">
            ${contentHtml || '<p style="font-style:italic; color:#999;">Contenu du document non disponible.</p>'}
        </div>
        
        <!-- PIED DE PAGE OFFICIEL -->
        ${window.MercyFiatTemplates.getPrintFooterHtml()}
        
        </div>
    `;
    
    if (typeof openPrintPreview === 'function') {
        openPrintPreview('documents');
    }
    window._archivePreviewDocId = docId;
    showNotificationToast('📖 Document archivé ouvert en lecture');
}

// Imprimer un document archivé directement
function printArchiveDoc(docId) {
    openArchiveDocPreview(docId);
    setTimeout(() => {
        if (typeof printActiveDocViaPDF === 'function') {
            printActiveDocViaPDF();
        } else {
            window.print();
        }
    }, 500);
}

// Liaison globale à window
window.saveActiveBill = saveActiveBill;
window.handleModalPriseEnChargeChange = handleModalPriseEnChargeChange;
window.openNewPatientModal = openNewPatientModal;
window.closeNewPatientModal = closeNewPatientModal;
window.saveNewPatientFromModal = saveNewPatientFromModal;
window.toggleDevTools = toggleDevTools;
window.populateAllInsuranceSelects = populateAllInsuranceSelects;
window.resetBillEditorForm = resetBillEditorForm;
window.resetDocEditorForm = resetDocEditorForm;
window.openArchiveDocPreview = openArchiveDocPreview;
window.printArchiveDoc = printArchiveDoc;
