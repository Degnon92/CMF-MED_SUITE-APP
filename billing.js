/* ==========================================
   billing.js - Gestion de la Facturation Clinique
   ========================================== */

// Fonction d'actualisation de l'affichage de réduction
function updateBillDiscountDisplay() {
    const typeEl = document.getElementById('bill-discount-type');
    const valEl = document.getElementById('bill-discount-value');
    const display = document.getElementById('bill-discount-display');
    if (typeEl && valEl && display) {
        const type = typeEl.value;
        const val = parseFloat(valEl.value) || 0;
        if (type === 'PERCENT') {
            display.textContent = `${val}% de réduction`;
        } else {
            display.textContent = `${new Intl.NumberFormat('fr-FR').format(val)} FCFA de réduction`;
        }
    }
}
window.updateBillDiscountDisplay = updateBillDiscountDisplay;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser la recherche rapide
    if (typeof searchQuickAdd === 'function') {
        searchQuickAdd();
    }
    
    // Charger la facture par défaut (Forfait bloc par défaut de départ)
    addCustomBillingRow("Frais de Bloc Opératoire et Stérilisation", 120000, 1);
    addCustomBillingRow("Hébergement / Séjour en Chambre Standard", 30000, 3);
    
    updateInsuranceCoverage();
    updateBillDiscountDisplay();
    updateBillPreview();
    
// Écouteur pour le remplissage automatique d'intervention, du code K, et auto-cochage
    const billInt = document.getElementById('bill-intervention');
    if (billInt) {
        billInt.addEventListener('change', (e) => {
            autoLoadPackageFromIntervention(e.target.value);
            autoFillKCodeFromIntervention(e.target.value);
        });
        billInt.addEventListener('input', (e) => {
            autoFillKCodeFromIntervention(e.target.value);
            if (!window.isLoadingRecentItem) {
                const cb = document.getElementById('bill-show-interv');
                if (cb) {
                    if (e.target.value.trim() !== '') {
                        if (!cb.checked) {
                            cb.checked = true;
                            updateBillPreview();
                        }
                    } else {
                        if (cb.checked) {
                            cb.checked = false;
                            updateBillPreview();
                        }
                    }
                }
            }
        });
    }

    const billDiag = document.getElementById('bill-diagnostic');
    if (billDiag) {
        billDiag.addEventListener('input', (e) => {
            if (!window.isLoadingRecentItem) {
                const cb = document.getElementById('bill-show-diag');
                if (cb) {
                    if (e.target.value.trim() !== '') {
                        if (!cb.checked) {
                            cb.checked = true;
                            updateBillPreview();
                        }
                    } else {
                        if (cb.checked) {
                            cb.checked = false;
                            updateBillPreview();
                        }
                    }
                }
            }
        });
    }

    // Support de la navigation au clavier pour l'ajout rapide
    const quickAddSearch = document.getElementById('quick-add-search-input');
    if (quickAddSearch) {
        let activeIdx = -1;
        
        quickAddSearch.addEventListener('keydown', (e) => {
            const container = document.getElementById('quick-add-floating-results');
            if (!container || container.style.display === 'none') return;
            
            const rows = container.querySelectorAll('.quick-add-row');
            if (rows.length === 0) return;
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                activeIdx = (activeIdx + 1) % rows.length;
                highlightRow(rows);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                activeIdx = (activeIdx - 1 + rows.length) % rows.length;
                highlightRow(rows);
            } else if (e.key === 'Enter') {
                if (activeIdx > -1) {
                    e.preventDefault();
                    rows[activeIdx].click();
                    activeIdx = -1;
                }
            } else if (e.key === 'Escape') {
                closeQuickAddResults();
                activeIdx = -1;
            }
        });
        
        function highlightRow(rows) {
            rows.forEach((r, idx) => {
                if (idx === activeIdx) {
                    r.classList.add('active');
                    r.scrollIntoView({ block: 'nearest' });
                } else {
                    r.classList.remove('active');
                }
            });
        }
        
        quickAddSearch.addEventListener('input', () => {
            activeIdx = -1;
        });
    }
});

// Remplissage du sélecteur d'actes (conservé pour compatibilité)
function populatePreconfigSelect() {
    // Remplacé par le widget d'ajout rapide intelligent
}

// Gère le changement de type de Prise en Charge Patient (Ordinaire, Assuré, Sinistré)
function handleBillPriseEnChargeChange() {
    const type = document.getElementById('bill-patient-type').value;
    const insContainer = document.getElementById('bill-insurance-container');
    const covContainer = document.getElementById('bill-coverage-container');
    const matContainer = document.getElementById('bill-matricule-container');
    const matLabel = document.getElementById('bill-matricule-label');
    const matInput = document.getElementById('bill-matricule');
    const insSelect = document.getElementById('bill-insurance');
    const covInput = document.getElementById('bill-coverage');
    
    if (type === 'PRIVE') {
        if (insContainer) insContainer.style.display = 'none';
        if (covContainer) covContainer.style.display = 'none';
        if (matContainer) matContainer.style.display = 'none';
        if (insSelect) insSelect.value = 'PRIVE';
        if (covInput) covInput.value = 0;
    } else {
        if (insContainer) insContainer.style.display = 'block';
        if (covContainer) covContainer.style.display = 'block';
        if (matContainer) matContainer.style.display = 'block';
        
        if (type === 'MALADIE') {
            if (matLabel) matLabel.textContent = "N° d'Assuré / Matricule";
            if (matInput) matInput.placeholder = "Ex: 4904-2022-400";
            if (covInput && (parseFloat(covInput.value) === 0 || covInput.value === '')) {
                covInput.value = 80;
            }
            if (insSelect && insSelect.value === 'PRIVE') {
                insSelect.value = 'SANLAM';
            }
        } else if (type === 'SINISTRE') {
            if (matLabel) matLabel.textContent = "N° de Sinistre / Bon de Charge";
            if (matInput) matInput.placeholder = "Ex: SIN-2026-8874";
            if (covInput) covInput.value = 100;
            if (insSelect && insSelect.value === 'PRIVE') {
                insSelect.value = 'SANLAM';
            }
        }
    }
    
    // Mettre à jour dynamiquement le libellé de l'option DETAIL_ASSUR
    const detailOption = document.querySelector('#bill-type option[value="DETAIL_ASSUR"]');
    if (detailOption) {
        if (type === 'PRIVE') {
            detailOption.textContent = "Détail Prestations (Proforma)";
        } else if (type === 'SINISTRE') {
            detailOption.textContent = "Détail Prise en Charge (Accord Proforma)";
        } else {
            detailOption.textContent = "Détail Assurance (Accord Proforma)";
        }
    }
    
    if (typeof updateInsuranceCoverage === 'function') {
        updateInsuranceCoverage();
    }
}
window.handleBillPriseEnChargeChange = handleBillPriseEnChargeChange;

// Met à jour la couverture d'assurance par défaut et gère l'affichage du split
function updateInsuranceCoverage() {
    const insuranceId = document.getElementById('bill-insurance').value;
    const coverageInput = document.getElementById('bill-coverage');
    const splitContainer = document.getElementById('split-mode-container');
    const splitCheckbox = document.getElementById('bill-use-split');
    
    const partner = window.MercyFiatDB.INSURERS.find(ins => ins.id === insuranceId);
    
    if (partner) {
        coverageInput.value = partner.defaultCoverage;
        coverageInput.disabled = partner.id === 'PRIVE';
    } else {
        coverageInput.value = 80;
        coverageInput.disabled = false;
    }
    
    if (splitContainer) {
        if (insuranceId === 'PRIVE') {
            splitContainer.style.display = 'none';
            if (splitCheckbox) {
                splitCheckbox.checked = false;
                toggleBillingSplitMode();
            }
        } else {
            splitContainer.style.display = 'flex';
        }
    }
    
    // Mettre à jour tous les taux de couverture et réappliquer les règles
    reapplyInsurerRulesToAllRows();
    updateBillPreview();
}

// Ajoute une ligne de facturation enrichie avec les champs de répartition d'assurance
let billingRowCount = 0;
function addCustomBillingRow(name = "", price = 0, qty = 1, limit = null, rate = null) {
    const container = document.getElementById('billing-items-container');
    if (!container) return;
    
    billingRowCount++;
    const rowId = `bill-row-${billingRowCount}`;
    const subtotal = price * qty;
    const defaultCoverage = document.getElementById('bill-coverage')?.value || 80;
    const useSplit = document.getElementById('bill-use-split')?.checked || false;
    
    const initialLimit = limit !== null ? limit : subtotal;
    const initialRate = rate !== null ? rate : defaultCoverage;
    const initialPartAssurance = Math.round(initialLimit * (initialRate / 100));
    const initialPartPatient = subtotal - initialPartAssurance;
    
    const row = document.createElement('div');
    row.className = `item-row ${useSplit ? 'split-mode-active' : ''}`;
    row.id = rowId;
    row.innerHTML = `
        <input type="text" class="item-name" placeholder="Désignation du frais..." value="${name}" oninput="updateBillPreview()" style="width:100%;">
        <input type="number" class="item-qty" placeholder="Qté" value="${qty}" min="1" oninput="updateRowSubtotal('${rowId}'); recalculateSplitItemRow('${rowId}'); updateBillPreview();" style="width:100%;">
        <input type="number" class="item-price" placeholder="P.U. (FCFA)" value="${price}" oninput="updateRowSubtotal('${rowId}'); recalculateSplitItemRow('${rowId}'); updateBillPreview();" style="width:100%;">
        <input type="text" class="item-subtotal" value="${formatGridNumber(subtotal)}" disabled style="width:100%; font-weight:700; text-align:right; background-color:#f1f5f9;">
        
        <!-- Champs de répartition Tiers-Payant (Masqués en standard, affichés en mode split) -->
        <input type="number" class="item-split-limit split-field" placeholder="Plafond..." value="${initialLimit}" oninput="recalculateSplitItemRow('${rowId}'); updateBillPreview();" style="width:100%;">
        <input type="number" class="item-split-rate split-field" placeholder="Taux %" min="0" max="100" value="${initialRate}" oninput="recalculateSplitItemRow('${rowId}'); updateBillPreview();" style="width:100%;">
        <input type="text" class="item-split-assurance split-field item-split-read-only" value="${formatGridNumber(initialPartAssurance)}" disabled style="width:100%;">
        <input type="text" class="item-split-patient split-field item-split-read-only" value="${formatGridNumber(initialPartPatient)}" disabled style="width:100%;">
        
        <button class="btn btn-danger btn-small" onclick="removeBillingRow('${rowId}')" style="padding: 6px 8px;">
            <svg viewBox="0 0 24 24" style="width:14px; height:14px; stroke:currentColor; stroke-width:3; fill:none;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
    `;
    
    container.appendChild(row);
    
    // Si limit ou rate ne sont pas passés (c'est une nouvelle ligne ajoutée manuellement), appliquer les règles par défaut
    if (limit === null && rate === null) {
        applyInsurerDefaultRulesForNewRow(rowId, name, price, qty);
    }
    
    updateBillPreview();
}

// Supprime une ligne de facturation
async function removeBillingRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        const name = row.querySelector('.item-name')?.value || "cet élément";
        if (await confirm(`Voulez-vous vraiment retirer "${name}" de la facture ?`)) {
            row.remove();
            updateBillPreview();
        }
    }
}

// Met à jour le sous-total de la ligne
function updateRowSubtotal(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;
    
    const priceInput = row.querySelector('.item-price');
    const qtyInput = row.querySelector('.item-qty');
    
    let price = parseFloat(priceInput.value) || 0;
    let qty = parseInt(qtyInput.value) || 0;
    
    // Contrôle en temps réel anti-faille (pas de prix négatifs ni de quantité inférieure à 1)
    if (price < 0) {
        price = 0;
        priceInput.value = 0;
    }
    if (qty < 1) {
        qty = 1;
        qtyInput.value = 1;
    }
    
    row.querySelector('.item-subtotal').value = formatGridNumber(price * qty);
}

// Logique interactive du Widget d'Ajout Rapide de Prestations
let currentQuickAddFilter = 'ALL';

function filterQuickAdd(filter, btn) {
    currentQuickAddFilter = filter;
    
    // Mettre à jour les classes actives sur les boutons
    const buttons = document.querySelectorAll('.quick-filter-btn');
    buttons.forEach(b => {
        b.classList.remove('active');
        b.style.background = 'white';
        b.style.color = '#4a5568';
        b.style.borderColor = 'var(--border-color)';
    });
    
    // Activer le bouton cliqué (ou via id si appelé dynamiquement)
    const activeBtn = btn || document.getElementById(`filter-btn-${filter.toLowerCase().replace('_', '-')}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.background = 'var(--accent-gold)';
        activeBtn.style.color = 'white';
        activeBtn.style.borderColor = 'var(--accent-gold)';
    }
    
    searchQuickAdd();
    showQuickAddResults();
}
window.filterQuickAdd = filterQuickAdd;

function showQuickAddResults() {
    const resultsContainer = document.getElementById('quick-add-floating-results');
    if (resultsContainer) {
        resultsContainer.style.display = 'block';
    }
}
window.showQuickAddResults = showQuickAddResults;

function closeQuickAddResults() {
    const resultsContainer = document.getElementById('quick-add-floating-results');
    if (resultsContainer) {
        resultsContainer.style.display = 'none';
    }
}
window.closeQuickAddResults = closeQuickAddResults;

// Click outside close
document.addEventListener('click', (e) => {
    const container = document.getElementById('quick-add-search-input')?.parentNode;
    if (container && !container.contains(e.target)) {
        closeQuickAddResults();
    }
});

function searchQuickAdd() {
    const query = (document.getElementById('quick-add-search-input')?.value || '').toLowerCase().trim();
    const container = document.getElementById('quick-add-floating-results');
    if (!container) return;
    
    const db = window.MercyFiatDB;
    if (!db) return;
    
    let allItems = [];
    
    // Collecter les forfaits complets
    if (currentQuickAddFilter === 'ALL' || currentQuickAddFilter === 'PACKS') {
        db.FORFAITS_COMPLETS.forEach(p => {
            allItems.push({
                type: 'PACK',
                id: p.id,
                name: p.name,
                category: 'Forfait Complet',
                subtitle: p.diagnosis || 'Forfait chirurgical pré-configuré',
                badgeColor: 'var(--accent-coral)'
            });
        });
    }
    
    // Collecter les actes chirurgicaux (calculés)
    if (currentQuickAddFilter === 'ALL' || currentQuickAddFilter === 'ACTES_K') {
        db.ACTES_CHIRURGICAUX.forEach(s => {
            allItems.push({
                type: 'SURGERY',
                id: s.id,
                name: `Forfait : ${s.name}`,
                category: `Cotation K${s.kCode}`,
                subtitle: `${s.category} — Calcul honoraires chirurgicaux`,
                badgeColor: 'var(--accent-blue)'
            });
        });
    }
    
    // Collecter les prestations communes
    db.PRESTATIONS_COMMUNES.forEach(p => {
        const catUpper = p.category.toUpperCase();
        let matched = false;
        let badgeColor = 'var(--accent-teal)';
        
        if (currentQuickAddFilter === 'ALL') matched = true;
        else if (currentQuickAddFilter === 'SEJOUR' && catUpper.includes('SÉJOUR')) matched = true;
        else if (currentQuickAddFilter === 'DIAGNOSTIC' && (catUpper.includes('DIAGNOSTIC') || catUpper.includes('SOINS') || catUpper.includes('BLOC'))) matched = true;
        
        if (matched) {
            allItems.push({
                type: 'PREST',
                id: p.id,
                name: p.name,
                category: p.category,
                subtitle: `${new Intl.NumberFormat('fr-FR').format(p.defaultPrice)} FCFA`,
                badgeColor: badgeColor
            });
        }
    });
    
    // Filtrer textuellement si requête
    if (query) {
        allItems = allItems.filter(item => 
            item.name.toLowerCase().includes(query) || 
            item.category.toLowerCase().includes(query) ||
            item.subtitle.toLowerCase().includes(query)
        );
    }
    
    // Rendre les résultats
    container.innerHTML = '';
    if (allItems.length === 0) {
        container.innerHTML = '<div style="padding:10px; text-align:center; color:#718096; font-style:italic; font-size:0.85rem;">Aucun élément correspondant.</div>';
        return;
    }
    
    allItems.forEach(item => {
        const row = document.createElement('div');
        row.className = 'quick-add-row';
        
        row.onclick = () => {
            selectQuickAddItem(item.type, item.id);
            closeQuickAddResults();
        };
        
        row.innerHTML = `
            <div style="flex-grow:1; text-align:left; padding-right:10px;">
                <div style="font-weight:600; font-size:0.82rem; color:var(--text-primary);">${item.name}</div>
                <div style="font-size:0.72rem; color:var(--text-secondary);">${item.subtitle}</div>
            </div>
            <span class="badge" style="font-size:0.65rem; background-color:${item.badgeColor}; color:white; padding:2px 6px; border-radius:10px; flex-shrink:0;">${item.category}</span>
        `;
        container.appendChild(row);
    });
}
window.searchQuickAdd = searchQuickAdd;

async function selectQuickAddItem(type, id) {
    const db = window.MercyFiatDB;
    if (!db) return;
    
    if (type === 'PACK') {
        const pack = db.FORFAITS_COMPLETS.find(p => p.id === id);
        if (pack) {
            if (await confirm(`Voulez-vous charger le forfait complet "${pack.name}" ? \n(Cela réinitialisera la grille de facturation actuelle)`)) {
                document.getElementById('billing-items-container').innerHTML = '';
                
                const diagInput = document.getElementById('bill-diagnostic');
                if (diagInput) {
                    diagInput.value = pack.diagnosis;
                    diagInput.dispatchEvent(new Event('input'));
                    diagInput.dispatchEvent(new Event('change'));
                }
                
                const intervInput = document.getElementById('bill-intervention');
                if (intervInput) {
                    intervInput.value = pack.name.replace("FORFAIT : ", "");
                    intervInput.dispatchEvent(new Event('input'));
                    intervInput.dispatchEvent(new Event('change'));
                }

                // Activer automatiquement les cases à cocher d'affichage
                const showDiagEl = document.getElementById('bill-show-diag');
                if (showDiagEl) showDiagEl.checked = true;
                const showIntervEl = document.getElementById('bill-show-interv');
                if (showIntervEl) showIntervEl.checked = true;
                
                pack.items.forEach(item => {
                    addCustomBillingRow(item.name, item.price, item.qty);
                });
                showBillingNotification(`🔥 Forfait standard chargé : ${pack.name}`);
            }
        }
    } else if (type === 'SURGERY') {
        const surgery = db.ACTES_CHIRURGICAUX.find(s => s.id === id);
        if (surgery) {
            let kVal = db.K_VALUE_STANDARD;
            if (await confirm("Souhaitez-vous appliquer la tarification d'Urgence / Prestige (K = 2 000 FCFA) ? \n(Annuler pour appliquer le K Standard = 1 500 FCFA)")) {
                kVal = db.K_VALUE_PRESTIGE;
            }
            const packCalcule = db.calculateSurgicalPackage(surgery.kCode, kVal);
            
            if (await confirm("Voulez-vous réinitialiser la grille de facturation actuelle ?")) {
                document.getElementById('billing-items-container').innerHTML = '';
            }
            
            const diagInput = document.getElementById('bill-diagnostic');
            if (diagInput && diagInput.value === '') {
                diagInput.value = `Forfait ${surgery.name} (K${surgery.kCode})`;
                diagInput.dispatchEvent(new Event('input'));
                diagInput.dispatchEvent(new Event('change'));
            }
            
            const intervInput = document.getElementById('bill-intervention');
            if (intervInput && intervInput.value === '') {
                intervInput.value = surgery.name;
                intervInput.dispatchEvent(new Event('input'));
                intervInput.dispatchEvent(new Event('change'));
            }

            const kCodeEl = document.getElementById('bill-k-code');
            if (kCodeEl) {
                kCodeEl.value = `K${surgery.kCode}`;
                kCodeEl.dispatchEvent(new Event('input'));
                kCodeEl.dispatchEvent(new Event('change'));
            }

            // Activer automatiquement les cases à cocher d'affichage
            const showDiagEl = document.getElementById('bill-show-diag');
            if (showDiagEl) showDiagEl.checked = true;
            const showIntervEl = document.getElementById('bill-show-interv');
            if (showIntervEl) showIntervEl.checked = true;
            
            addCustomBillingRow("Hébergement / Séjour en Chambre Standard", 30000, 4);
            addCustomBillingRow("Médicaments et Consommables Opératoires", 150000, 1);
            addCustomBillingRow("Actes médico-infirmiers et soins quotidiens", 7500, 4);
            
            addCustomBillingRow(packCalcule.surgeonPrincipal.name + ` (K${surgery.kCode})`, packCalcule.surgeonPrincipal.price, packCalcule.surgeonPrincipal.qty);
            addCustomBillingRow(packCalcule.secondChirurgien.name + ` (K${packCalcule.secondChirurgien.qty})`, packCalcule.secondChirurgien.price, packCalcule.secondChirurgien.qty);
            addCustomBillingRow(packCalcule.anesthesie.name + ` (K${packCalcule.anesthesie.qty})`, packCalcule.anesthesie.price, packCalcule.anesthesie.qty);
            addCustomBillingRow(packCalcule.aideOperatoireMini.name, packCalcule.aideOperatoireMini.price, packCalcule.aideOperatoireMini.qty);
            addCustomBillingRow(packCalcule.blocOperatoire.name + ` (K${packCalcule.blocOperatoire.qty})`, packCalcule.blocOperatoire.price, packCalcule.blocOperatoire.qty);
            
            addCustomBillingRow("Consultation d'Anesthésie pré-opératoire", 15000, 1);
            addCustomBillingRow("Consultation Cardiologique pré-opératoire", 15000, 1);
            addCustomBillingRow("Électrocardiogramme (ECG) avec tracé", 15000, 1);
            addCustomBillingRow("Bilan Biologique Pré-Opératoire Complet (Laboratoire)", 55000, 1);
            addCustomBillingRow("Forfait pansement et soins de plaie post-opératoire", 2000, 10);
            
            showBillingNotification(`⚡ Forfait calculé K${surgery.kCode} généré pour : ${surgery.name}`);
        }
    } else if (type === 'PREST') {
        const prest = db.PRESTATIONS_COMMUNES.find(p => p.id === id);
        if (prest) {
            addCustomBillingRow(`${prest.name}`, prest.defaultPrice, 1);
            showBillingNotification(`✅ Prestation ajoutée : ${prest.name}`);
        }
    }
    
    // Mettre à jour l'aperçu
    updateBillPreview();
}
window.selectQuickAddItem = selectQuickAddItem;

// Formate les chiffres en devise FCFA
// [Extracted to billing_utils.js] - formatCurrency()

// Formate les chiffres pour la grille de saisie (sans suffixe FCFA pour économiser l'espace)
// [Extracted to billing_utils.js] - formatGridNumber()

// Moteur de rendu de l'impression A4 clinique adaptatif
function updateBillPreview() {
    const preview = document.getElementById('bill-print-preview');
    if (!preview) return;
    
    const patientNom = (document.getElementById('bill-patient-nom').value || "PARAISO").toUpperCase();
    const patientPrenom = document.getElementById('bill-patient-prenom').value || "Alex";
    const billType = document.getElementById('bill-type').value;
    const insurance = document.getElementById('bill-insurance').value;
    const coverage = parseFloat(document.getElementById('bill-coverage').value) || 0;
    const matricule = document.getElementById('bill-matricule').value || "N/A";
    const patientType = document.getElementById('bill-patient-type')?.value || "PRIVE";
    
    // Le type DETAIL_ASSUR force la vue splitée (sauf si patient PRIVE)
    const useSplit = billType === "DETAIL_ASSUR" || (document.getElementById('bill-use-split')?.checked || false);
    
    let docTitle = "Facture Proforma";
    if (billType === "DETAIL_ASSUR") {
        if (patientType === "SINISTRE") {
            docTitle = "Détail Prise en Charge Sinistre Automobile";
        } else if (patientType === "PRIVE") {
            docTitle = "Détail Prestations Facture Proforma";
        } else {
            docTitle = "Détail Assurance Facture Proforma";
        }
    } else if (billType === "DEFINITIF") {
        docTitle = document.getElementById('bill-title-custom')?.value || "Point Définitif d'Hospitalisation";
    }
    const billDateInput = document.getElementById('bill-date')?.value;
    const dateFormatted = billDateInput
        ? new Date(billDateInput + 'T12:00:00').toLocaleDateString('fr-FR')
        : new Date().toLocaleDateString('fr-FR');
    
    // Référence officielle persistante ou temporaire
    let refStr = "";
    if (window.activeBillReference) {
        refStr = window.activeBillReference;
    } else {
        const today = new Date();
        const yearMonth = today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0');
        const typeCode = billType === 'PROFORMA' ? 'PRO' : (billType === 'DETAIL_ASSUR' ? 'DET' : 'DEF');
        // Numéro provisoire basé sur le compteur de factures existantes du même type et mois
        const existingCount = (typeof savedBills !== 'undefined' ? savedBills : [])
            .filter(b => {
                if (!b.reference) return false;
                const code = billType === 'PROFORMA' ? 'PRO' : (billType === 'DETAIL_ASSUR' ? 'DET' : 'DEF');
                return b.reference.startsWith(`MF-${code}-${yearMonth}`);
            }).length;
        const nextNum = String(existingCount + 1).padStart(3, '0');
        refStr = `MF-${typeCode}-${yearMonth}-${nextNum} (Provisoire)`;
    }
    
    // Collecte des items facturés avec gestion du split individuel par ligne
    const items = [];
    let grandTotal = 0;
    let totalPartAssurance = 0;
    let totalPartPatient = 0;
    
    const rows = document.querySelectorAll('#billing-items-container .item-row');
    rows.forEach(row => {
        const name = row.querySelector('.item-name').value.trim();
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const qty = parseInt(row.querySelector('.item-qty').value) || 0;
        const subtotal = price * qty;
        
        if (name) {
            let rowPartAssurance = 0;
            let rowPartPatient = subtotal;
            let rowLimit = subtotal;
            let rowRate = coverage;
            
            if (useSplit && patientType !== 'PRIVE') {
                const limitInput = row.querySelector('.item-split-limit');
                const rateInput = row.querySelector('.item-split-rate');
                rowLimit = parseFloat(limitInput?.value) || 0;
                rowRate = parseFloat(rateInput?.value) || 0;
                
                rowPartAssurance = Math.round(rowLimit * (rowRate / 100));
                rowPartPatient = subtotal - rowPartAssurance;
            } else if (patientType !== 'PRIVE') {
                rowPartAssurance = Math.round(subtotal * (coverage / 100));
                rowPartPatient = subtotal - rowPartAssurance;
            }
            
            items.push({ 
                name, 
                price, 
                qty, 
                subtotal,
                limit: rowLimit,
                rate: rowRate,
                partAssurance: rowPartAssurance,
                partPatient: rowPartPatient
            });
            
            grandTotal += subtotal;
            totalPartAssurance += rowPartAssurance;
            totalPartPatient += rowPartPatient;
        }
    });
    
    // Calcul de la réduction proactive (flexible : % ou FCFA)
    const discountTypeEl = document.getElementById('bill-discount-type');
    const discountValueEl = document.getElementById('bill-discount-value');
    let discountPct = 0;
    let reductionAmount = 0;

    if (discountTypeEl && discountValueEl) {
        const type = discountTypeEl.value;
        const val = parseFloat(discountValueEl.value || 0);
        if (type === 'PERCENT') {
            discountPct = val;
            reductionAmount = Math.round(grandTotal * (discountPct / 100));
        } else {
            reductionAmount = Math.round(val);
            discountPct = grandTotal > 0 ? (reductionAmount / grandTotal) * 100 : 0;
        }
    }
    const discountedTotal = grandTotal - reductionAmount;
    
    // Si réduction, on applique proportionnellement aux parts splitées
    if (reductionAmount > 0) {
        const splitDiscountRatio = grandTotal > 0 ? discountedTotal / grandTotal : 1;
        totalPartAssurance = Math.round(totalPartAssurance * splitDiscountRatio);
        totalPartPatient = discountedTotal - totalPartAssurance;
        
        items.forEach(item => {
            const itemDiscountedSubtotal = Math.round(item.subtotal * splitDiscountRatio);
            item.partAssurance = Math.round(item.partAssurance * splitDiscountRatio);
            item.partPatient = itemDiscountedSubtotal - item.partAssurance; // Ajustement sur le sous-total net
        });
    }

    const discountType = discountTypeEl ? discountTypeEl.value : 'PERCENT';
    const discountLabel = discountType === 'PERCENT' ? `(${Math.round(discountPct)}%)` : `(Remise)`;
    
    // Récupération des modes de règlement
    const paymentMethodId = document.getElementById('bill-payment-method')?.value || "CASH";
    const rawAmountPaid = parseFloat(document.getElementById('bill-amount-paid-patient')?.value);
    
    const totalPatientShare = (patientType !== 'PRIVE') ? totalPartPatient : discountedTotal;
    const amountPaidPatient = isNaN(rawAmountPaid) ? totalPatientShare : Math.min(rawAmountPaid, totalPatientShare);
    const balancePatient = totalPatientShare - amountPaidPatient;
    
    const paymentNames = {
        CASH: 'Espèces (Cash)',
        BANK_TRANSFER: 'Virement Bancaire',
        CHECK: 'Chèque Bancaire',
        MOBILE_MONEY: 'Mobile Money',
        TIERS_PAYANT: 'Attente Tiers-Payant'
    };
    const paymentName = paymentNames[paymentMethodId] || 'Espèces';
    
    // Rendu HTML du papier à en-tête Clinique Mercy Fiat adaptatif
    let tableHeaderHTML = "";
    let tableBodyHTML = "";
    
    if (useSplit && patientType !== 'PRIVE') {
        // En-tête multi-colonnes pour split d'assurance
        tableHeaderHTML = `
            <tr>
                <th style="width:28%; text-align:left; vertical-align:middle;">ACTES / DESIGNATIONS</th>
                <th style="width:6%; text-align:center; vertical-align:middle;">QTÉ</th>
                <th style="width:12%; text-align:center; vertical-align:middle; line-height:1.2;">PRIX<br>UNITAIRE</th>
                <th style="width:13%; text-align:center; vertical-align:middle;">MONTANT CLINIQUE</th>
                <th style="width:13%; text-align:center; vertical-align:middle;">PLAFOND</th>
                <th style="width:14%; text-align:center; vertical-align:middle; line-height:1.2;">PART<br>ASSURANCE</th>
                <th style="width:14%; text-align:center; vertical-align:middle; line-height:1.2;">PART<br>PATIENT</th>
            </tr>
        `;
        
        tableBodyHTML = items.length === 0 ? '<tr><td colspan="6" style="text-align:center; font-style:italic;">Aucun frais renseigné.</td></tr>' : 
          items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td style="text-align:center;">${item.qty}</td>
                <td style="text-align:right;">${formatGridNumber(item.price)}</td>
                <td style="text-align:right; font-weight:600;">${formatGridNumber(item.subtotal)}</td>
                <td style="text-align:right; font-weight:600; color:#2980b9;">${formatGridNumber(item.partAssurance)}</td>
                <td style="text-align:right; font-weight:600; color:#c0392b;">${formatGridNumber(item.partPatient)}</td>
            </tr>
          `).join('');
    } else {
        // En-tête standard mono-colonne
        tableHeaderHTML = `
            <tr>
                <th style="width:50%;">Désignation des Prestations et Consommables</th>
                <th style="width:10%; text-align:center;">Qté</th>
                <th style="width:20%; text-align:right;">P.U.</th>
                <th style="width:20%; text-align:right;">Total (FCFA)</th>
            </tr>
        `;
        
        tableBodyHTML = items.length === 0 ? '<tr><td colspan="4" style="text-align:center; font-style:italic;">Aucun frais renseigné.</td></tr>' : 
          items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td style="text-align:center;">${item.qty}</td>
                <td style="text-align:right;">${formatGridNumber(item.price)}</td>
                <td style="text-align:right; font-weight:600;">${formatGridNumber(item.subtotal)}</td>
            </tr>
          `).join('');
    }
    
    // Lire les options d'affichage des checkboxes
    const showSig    = document.getElementById('bill-show-sig')?.checked !== false;
    const showCachet = document.getElementById('bill-show-cachet')?.checked !== false;

    // Récupérer le diagnostic, l'intervention et le code K depuis les champs du formulaire
    const diagnostic = document.getElementById('bill-diagnostic')?.value?.trim() || '';
    const intervention = document.getElementById('bill-intervention')?.value?.trim() || '';
    const kCodeValue = document.getElementById('bill-k-code')?.value?.trim() || '';

    // Lire l'état des options d'affichage diagnostic / intervention
    const showDiag = document.getElementById('bill-show-diag')?.checked || false;
    const showInterv = document.getElementById('bill-show-interv')?.checked || false;

    // Les factures et proformas émises par la caisse utilisent toujours le cachet et la signature de la caisse
    const sigSrc     = 'assets/signature_caisse.png?t=' + Date.now();
    const cachetSrc  = 'assets/cachet_caisse.png?t=' + Date.now();

    // Bloc diagnostic/intervention optionnel
    let diagBlock = '';
    if ((showDiag && diagnostic) || (showInterv && intervention)) {
        diagBlock = `
            <div style="margin-bottom:12px; padding:8px 12px; background:#fdfbf7; border:1px solid #c3a17e; border-left:4px solid #c3a17e; border-radius:4px; font-size:0.82rem; text-align:left;">
                ${showDiag && diagnostic ? `<div><strong style="color:#1a202c;">Diagnostic :</strong> <span style="color:#2d3748;">${diagnostic}</span></div>` : ''}
                ${showInterv && intervention ? `<div style="${showDiag && diagnostic ? 'margin-top:4px;' : ''}"><strong style="color:#1a202c;">Intervention :</strong> <span style="color:#2d3748;">${intervention}${kCodeValue ? ` <em style="color:#718096;">(Code K : ${kCodeValue})</em>` : ''}</span></div>` : ''}
            </div>
        `;
    }

    // Bloc résumé financier selon le type de facture
    let summaryHtml = '';
    if (patientType === 'PRIVE') {
        // Patient privé → 100% à sa charge
        summaryHtml = `
            ${reductionAmount > 0 ? `
            <div class="summary-row" style="color:#c0392b; font-size:0.82rem; margin-bottom:2px;">
                <span>Réduction Accordée ${discountLabel} :</span>
                <strong style="font-size:0.88rem;">- ${formatCurrency(reductionAmount)}</strong>
            </div>` : ''}
            <div class="summary-row total" style="font-size:0.92rem; border-top:1px dashed #cbd5e0; padding-top:4px; margin-top:2px;">
                <span>Total à Acquitter Patient :</span>
                <span style="font-size:1.02rem; font-weight:900;">${formatCurrency(discountedTotal)}</span>
            </div>`;
    } else if (billType === 'PROFORMA') {
        // Proforma assurance → part assuré = 0, part assureur = 0 (accord non encore reçu)
        summaryHtml = `
            <div class="summary-row" style="font-size:0.82rem; margin-bottom:2px;">
                <span>Montant Brut Clinique :</span>
                <strong style="font-size:0.88rem;">${formatCurrency(grandTotal)}</strong>
            </div>
            ${reductionAmount > 0 ? `
            <div class="summary-row" style="color:#c0392b; font-size:0.82rem; margin-bottom:2px;">
                <span>Réduction Accordée ${discountLabel} :</span>
                <strong style="font-size:0.88rem;">- ${formatCurrency(reductionAmount)}</strong>
            </div>
            <div class="summary-row" style="border-bottom:1px dashed #cbd5e0; padding-bottom:2px; margin-bottom:2px; font-size:0.82rem;">
                <span>Total Net Clinique :</span>
                <strong style="font-size:0.88rem;">${formatCurrency(discountedTotal)}</strong>
            </div>` : ''}
            <div class="summary-row" style="color:#2980b9; font-size:0.82rem; margin-bottom:2px;">
                <span>Prise en charge Assureur (${coverage}%) :</span>
                <strong style="font-size:0.88rem;">0 FCFA</strong>
            </div>
            <div class="summary-row" style="color:#c0392b; font-size:0.82rem; margin-bottom:2px;">
                <span>Part Assuré (Ticket Modérateur) :</span>
                <strong style="font-size:0.88rem;">0 FCFA</strong>
            </div>
            <div class="summary-row total" style="border-top:1.5px solid #cbd5e0; margin-top:4px; padding-top:4px; font-size:0.92rem;">
                <span>Total à payer :</span>
                <span style="font-size:1.02rem; font-weight:900;">${formatCurrency(discountedTotal)}</span>
            </div>
            <div style="font-size:0.64rem; color:#718096; font-style:italic; border-top:1px dashed #edf2f7; padding-top:3px; margin-top:3px; line-height:1.25; text-align:right;">
                La part exacte du patient sera définie après accord formel de l'assurance.
            </div>`;
    } else {
        // Définitif / Détail assurance → affichage complet
        summaryHtml = `
            <div class="summary-row" style="font-size:0.82rem; margin-bottom:2px;">
                <span>Montant Brut Clinique :</span>
                <strong style="font-size:0.88rem;">${formatCurrency(grandTotal)}</strong>
            </div>
            ${reductionAmount > 0 ? `
            <div class="summary-row" style="color:#c0392b; font-size:0.82rem; margin-bottom:2px;">
                <span>Réduction Accordée ${discountLabel} :</span>
                <strong style="font-size:0.88rem;">- ${formatCurrency(reductionAmount)}</strong>
            </div>
            <div class="summary-row" style="border-bottom:1px dashed #cbd5e0; padding-bottom:2px; margin-bottom:2px; font-size:0.82rem;">
                <span>Total Net Clinique :</span>
                <strong style="font-size:0.88rem;">${formatCurrency(discountedTotal)}</strong>
            </div>` : ''}
            <div class="summary-row" style="color:#2980b9; font-size:0.82rem; margin-bottom:2px;">
                <span>Part Assurance (${coverage}%) :</span>
                <strong style="font-size:0.88rem;">- ${formatCurrency(totalPartAssurance)}</strong>
            </div>
            <div class="summary-row" style="color:#c0392b; font-size:0.82rem; margin-bottom:2px; font-weight:bold;">
                <span>Part Patient (Ticket Modérateur &amp; Exclusions) :</span>
                <strong style="font-size:0.88rem;">${formatCurrency(totalPartPatient)}</strong>
            </div>
            <div class="summary-row total" style="font-size:0.92rem; border-top:1.5px solid #cbd5e0; margin-top:4px; padding-top:4px;">
                <span>Total à Acquitter Patient :</span>
                <span style="font-size:1.02rem; font-weight:900;">${formatCurrency(totalPatientShare)}</span>
            </div>
            ${billType === 'DEFINITIF' ? `
            <div class="summary-row" style="border-top:1px dashed #e2e8f0; padding-top:3px; margin-top:3px; font-size:0.78rem; color:#718096;">
                <span>Mode de Règlement :</span>
                <strong>${paymentName}</strong>
            </div>
            <div class="summary-row" style="font-size:0.78rem; color:#38a169; margin-bottom:1px;">
                <span>Montant Encaissé Patient :</span>
                <strong style="font-size:0.82rem;">${formatCurrency(amountPaidPatient)}</strong>
            </div>
            ${balancePatient > 0 ? `
            <div class="summary-row" style="font-size:0.8rem; color:#e53e3e; font-weight:bold;">
                <span>Reste à payer Patient :</span>
                <strong style="font-size:0.85rem;">${formatCurrency(balancePatient)}</strong>
            </div>` : `
            <div class="summary-row" style="font-size:0.8rem; color:#38a169; font-weight:bold; text-transform:uppercase;">
                <span>Statut Patient :</span>
                <strong style="font-size:0.85rem;">SOLDÉ ✅</strong>
            </div>`}` : ''}`;
    }

    const proformaMentionsBlock = (billType === 'PROFORMA' || billType === 'DETAIL_ASSUR') ? window.MercyFiatTemplates.getProformaNotesHtml() : '';

    preview.innerHTML = `
        <div class="bill-page" style="font-family:'Times New Roman', Times, serif; color:#1a202c; background:white; display:flex; flex-direction:column; min-height:28.5cm; box-sizing:border-box;">

        <!-- EN-TÊTE -->
        ${window.MercyFiatTemplates.getPrintHeaderHtml()}

        <!-- INFO PATIENT -->
        <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.83rem; color:#1a202c;">
            <div>
                <p style="margin:0 0 3px 0;"><strong>Patient :</strong> ${patientNom} ${patientPrenom}</p>
                ${patientType === 'PRIVE' ? `
                    <p style="margin:0;"><strong>Prise en Charge :</strong> Secteur Privé (100% Patient)</p>
                ` : patientType === 'MALADIE' ? `
                    <p style="margin:0 0 3px 0;"><strong>Organisme :</strong> ${insurance} (Assurance Maladie)</p>
                    <p style="margin:0;"><strong>N° d'Assuré / Matricule :</strong> ${matricule}</p>
                ` : `
                    <p style="margin:0 0 3px 0;"><strong>Prise en Charge :</strong> Sinistre Automobile (Accord ${coverage}%)</p>
                    <p style="margin:0 0 3px 0;"><strong>Organisme Assureur :</strong> ${insurance}</p>
                    <p style="margin:0;"><strong>N° de Sinistre / Bon :</strong> ${matricule}</p>
                `}
            </div>
            <div style="text-align:right;">
                <p style="margin:0 0 3px 0;"><strong>Date :</strong> ${dateFormatted}</p>
                <p style="margin:0;"><strong>Réf :</strong> <span style="font-family:monospace; font-size:0.78rem;">${refStr}</span></p>
            </div>
        </div>

        <!-- Diagnostic/Intervention (optionnel) -->
        ${diagBlock}

        <!-- TITRE -->
        <div style="text-align:center; font-size:1.05rem; font-weight:900; text-transform:uppercase; color:#1a202c; letter-spacing:1.5px; border-top:2px solid #2d3748; border-bottom:2px solid #2d3748; padding:4px 0; margin-bottom:8px;">
            ${docTitle}
        </div>

        <!-- TABLEAU DES PRESTATIONS -->
        <table style="width:100%; border-collapse:collapse; margin-bottom:6px; font-size:0.82rem;">
            <thead>
                <tr style="background:#2d3748; color:#ffffff;">
                    ${useSplit && patientType !== 'PRIVE' ? `
                    <th style="padding:4px 6px; text-align:left; vertical-align:middle; font-weight:700; border:1px solid #2d3748; width:28%;">ACTES / DÉSIGNATIONS</th>
                    <th style="padding:4px 6px; text-align:center; vertical-align:middle; font-weight:700; border:1px solid #2d3748; width:6%;">QTÉ</th>
                    <th style="padding:4px 6px; text-align:center; vertical-align:middle; font-weight:700; border:1px solid #2d3748; width:12%; line-height:1.2;">PRIX<br>UNITAIRE</th>
                    <th style="padding:4px 6px; text-align:center; vertical-align:middle; font-weight:700; border:1px solid #2d3748; width:13%;">MONTANT</th>
                    <th style="padding:4px 6px; text-align:center; vertical-align:middle; font-weight:700; border:1px solid #2d3748; width:13%;">PLAFOND</th>
                    <th style="padding:4px 6px; text-align:center; vertical-align:middle; font-weight:700; border:1px solid #2d3748; width:14%; line-height:1.2;">PART<br>ASSURANCE</th>
                    <th style="padding:4px 6px; text-align:center; vertical-align:middle; font-weight:700; border:1px solid #2d3748; width:14%; line-height:1.2;">PART<br>PATIENT</th>
                    ` : `
                    <th style="padding:6px 10px; text-align:left; font-weight:700; border:1px solid #2d3748; width:52%;">Désignation des Prestations et Consommables</th>
                    <th style="padding:6px 10px; text-align:center; font-weight:700; border:1px solid #2d3748; width:10%;">Qté</th>
                    <th style="padding:6px 10px; text-align:right; font-weight:700; border:1px solid #2d3748; width:18%;">P.U.</th>
                    <th style="padding:6px 10px; text-align:right; font-weight:700; border:1px solid #2d3748; width:20%;">Total (FCFA)</th>
                    `}
                </tr>
            </thead>
            <tbody>
                ${items.length === 0 ? `<tr><td colspan="${useSplit && patientType !== 'PRIVE' ? 7 : 4}" style="text-align:center; font-style:italic; padding:6px; border:1px solid #cbd5e0; color:#2d3748;">Aucun frais renseigné.</td></tr>` :
                  items.map((item, idx) => `
                    <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f7f8fa'};">
                        <td style="padding:5px 10px; border:1px solid #cbd5e0; color:#1a202c; font-weight:500;">${item.name}</td>
                        <td style="padding:5px 10px; text-align:center; border:1px solid #cbd5e0; color:#1a202c;">${item.qty}</td>
                        <td style="padding:5px 10px; text-align:right; border:1px solid #cbd5e0; color:#1a202c;">${formatGridNumber(item.price)}</td>
                        <td style="padding:5px 10px; text-align:right; border:1px solid #cbd5e0; color:#1a202c; font-weight:700;">${formatGridNumber(item.subtotal)}</td>
                        ${useSplit && patientType !== 'PRIVE' ? `
                        <td style="padding:5px 10px; text-align:right; border:1px solid #cbd5e0; color:#4a5568; font-weight:600;">${formatGridNumber(item.limit)}</td>
                        <td style="padding:5px 10px; text-align:right; border:1px solid #cbd5e0; color:#2980b9; font-weight:600;">${formatGridNumber(billType === 'PROFORMA' ? 0 : item.partAssurance)}</td>
                        <td style="padding:5px 10px; text-align:right; border:1px solid #cbd5e0; color:#c0392b; font-weight:600;">${formatGridNumber(billType === 'PROFORMA' ? 0 : item.partPatient)}</td>
                        ` : ''}
                    </tr>`).join('')}
            </tbody>
        </table>

        <!-- RÉSUMÉ FINANCIER + SOMME EN LETTRES SOUS LE TABLEAU (côte à côte, alignés en haut) -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px; width:100%; gap:12px;">
            <!-- Gauche : Somme en lettres (alignée en haut avec le cadre) -->
            <div style="flex:1; padding:8px 12px; border-left:4px solid #2d3748; background:#fafbfc; border-radius:2px; font-size:0.84rem; color:#2d3748;">
                <span style="color:#4a5568; font-size:0.75rem; display:block; margin-bottom:2px;">Arrêtée la présente facture à la somme de :</span>
                <span style="font-weight:900; text-transform:uppercase; color:#1a202c; font-size:0.9rem; line-height:1.45; font-family:'Times New Roman', Times, serif; display:block;">
                    ${numberToFrenchWords(billType === 'PROFORMA' && patientType !== 'PRIVE' ? discountedTotal : totalPatientShare)} Francs CFA
                </span>
            </div>
            <!-- Droite : Résumé financier -->
            <div class="bill-summary" style="border:1.5px solid #c3d9f0; border-radius:0 0 8px 8px; border-top:2px solid #2d3748; padding:8px 14px 10px 14px; min-width:370px; max-width:420px; flex-shrink:0; background:linear-gradient(135deg, #f0f6fc, #f8fbff); box-sizing:border-box; box-shadow:0 3px 8px rgba(44,82,130,0.10);">
                ${summaryHtml}
            </div>
        </div>

        <!-- BLOC PIED DE FACTURE (Collé au bas de la page A4, aligné sur les mêmes bords que le tableau) -->
        <div class="bill-page-bottom-block" style="margin-top:4px; display:flex; flex-direction:column; gap:4px; page-break-inside:avoid; width:100%;">

        <!-- NOTES & CONDITIONS (gauche) + SIGNATURE (droite) côte à côte -->
        <div style="display:flex; justify-content:space-between; align-items:flex-end; width:100%; gap:10px;">

            <!-- Gauche : Notes & Conditions (58%) - seulement si proforma -->
            ${proformaMentionsBlock ? `
            <div style="width:58%; box-sizing:border-box;">
                ${proformaMentionsBlock}
            </div>` : `<div style="flex:1;"></div>`}

            <!-- Droite : Signature / Cachet (38%) -->
            <div style="width:38%; margin-left:auto; text-align:center; box-sizing:border-box;">
                <p style="font-size:0.85rem; font-weight:800; color:#1a202c; margin-top:0; margin-bottom:0;">Pour le Centre</p>
                <div class="signature-seal-container">
                    ${showCachet ? `<img src="${cachetSrc}" class="seal-img" id="preview-bill-seal" style="display:block;">` : ''}
                    ${showSig    ? `<img src="${sigSrc}"    class="signature-img" id="preview-bill-sig" style="display:block;">` : ''}
                </div>
                <p style="font-size:0.82rem; font-weight:800; color:#1a202c; margin-top:0; margin-bottom:0;">La Caisse</p>
            </div>

        </div>

        <!-- PIED DE PAGE OFFICIEL CLINIQUE -->
        ${window.MercyFiatTemplates.getPrintFooterHtml()}

        </div><!-- fin bill-page-bottom-block -->

        </div>
    `;
}

// Convertisseur simple de nombres en toutes lettres en français
// [Extracted to billing_utils.js] - numberToFrenchWords()

// Détermination et remplissage automatique du code K lié à l'intervention
// [Extracted to billing_packages.js] - autoFillKCodeFromIntervention()

// Analyse de l'intitulé de l'intervention et chargement automatique du forfait
// [Extracted to billing_packages.js] - autoLoadPackageFromIntervention()

// Rendu premium d'une notification toast flottante
function showBillingNotification(message) {
    if (typeof window.showNotificationToast === 'function') {
        window.showNotificationToast(message, 'success');
    } else {
        alert(message);
    }
}

// Fonction pour recalculer les colonnes de split d'une ligne d'item
function recalculateSplitItemRow(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;
    
    const priceInput = row.querySelector('.item-price');
    const qtyInput = row.querySelector('.item-qty');
    const limitInput = row.querySelector('.item-split-limit');
    const rateInput = row.querySelector('.item-split-rate');
    const assuranceInput = row.querySelector('.item-split-assurance');
    const patientInput = row.querySelector('.item-split-patient');
    
    if (!limitInput || !rateInput || !assuranceInput || !patientInput) return;
    
    const price = parseFloat(priceInput.value) || 0;
    const qty = parseInt(qtyInput.value) || 0;
    const subtotal = price * qty;
    
    let limit = parseFloat(limitInput.value);
    if (isNaN(limit)) {
        limit = subtotal;
        limitInput.value = subtotal;
    }
    if (limit < 0) {
        limit = 0;
        limitInput.value = 0;
    }
    if (limit > subtotal) {
        limit = subtotal;
        limitInput.value = subtotal;
    }
    
    let rate = parseFloat(rateInput.value);
    if (isNaN(rate)) {
        rate = 80;
        rateInput.value = 80;
    }
    if (rate < 0) {
        rate = 0;
        rateInput.value = 0;
    }
    if (rate > 100) {
        rate = 100;
        rateInput.value = 100;
    }
    
    const partAssurance = Math.round(limit * (rate / 100));
    const partPatient = subtotal - partAssurance;
    
    assuranceInput.value = formatGridNumber(partAssurance);
    patientInput.value = formatGridNumber(partPatient);
}
window.recalculateSplitItemRow = recalculateSplitItemRow;

// Active ou désactive le mode split visuellement dans le formulaire de facturation
function toggleBillingSplitMode() {
    const useSplit = document.getElementById('bill-use-split').checked;
    
    // Basculer la classe sur l'en-tête
    const header = document.getElementById('billing-items-header');
    if (header) {
        if (useSplit) {
            header.classList.add('split-mode-active');
        } else {
            header.classList.remove('split-mode-active');
        }
    }
    
    // Basculer la classe sur toutes les lignes actives
    const rows = document.querySelectorAll('#billing-items-container .item-row');
    rows.forEach(row => {
        if (useSplit) {
            row.classList.add('split-mode-active');
            
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            const qty = parseInt(row.querySelector('.item-qty').value) || 0;
            const subtotal = price * qty;
            
            const limitInput = row.querySelector('.item-split-limit');
            const rateInput = row.querySelector('.item-split-rate');
            
            const limitVal = parseFloat(limitInput?.value);
            if (limitInput && (limitInput.value === "" || isNaN(limitVal))) {
                limitInput.value = subtotal;
            }
            const rateVal = parseFloat(rateInput?.value);
            if (rateInput && (rateInput.value === "" || isNaN(rateVal))) {
                rateInput.value = document.getElementById('bill-coverage').value || 80;
            }
            
            recalculateSplitItemRow(row.id);
        } else {
            row.classList.remove('split-mode-active');
        }
    });
}
window.toggleBillingSplitMode = toggleBillingSplitMode;

// Applique des règles métiers automatiques sur une nouvelle ligne d'item
function applyInsurerDefaultRulesForNewRow(rowId, name, price, qty) {
    const row = document.getElementById(rowId);
    if (!row) return;
    
    const limitInput = row.querySelector('.item-split-limit');
    const rateInput = row.querySelector('.item-split-rate');
    
    if (!limitInput || !rateInput) return;
    
    const insuranceId = document.getElementById('bill-insurance').value;
    const partner = window.MercyFiatDB.INSURERS.find(ins => ins.id === insuranceId);
    
    const cleanName = name.toLowerCase().trim();
    const subtotal = price * qty;
    
    // Règle 1: Nuitée d'hébergement
    if (cleanName.includes("hébergement") || cleanName.includes("séjour") || cleanName.includes("chambre")) {
        if (partner && partner.accommodationCap > 0) {
            const cap = partner.accommodationCap;
            if (price > cap) {
                limitInput.value = cap * qty;
            }
        }
    }
    
    // Règle 2: Exclusions des consommables / implants
    if (cleanName.includes("implant") || cleanName.includes("consommables") || cleanName.includes("matériel spécifique")) {
        rateInput.value = 0; // Exclu de base
    }
    
    recalculateSplitItemRow(rowId);
}
window.applyInsurerDefaultRulesForNewRow = applyInsurerDefaultRulesForNewRow;

// Réapplique les règles à toutes les lignes actives lors du changement d'assureur
function reapplyInsurerRulesToAllRows() {
    const rows = document.querySelectorAll('#billing-items-container .item-row');
    rows.forEach(row => {
        const name = row.querySelector('.item-name').value;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const qty = parseInt(row.querySelector('.item-qty').value) || 0;
        
        const limitInput = row.querySelector('.item-split-limit');
        const rateInput = row.querySelector('.item-split-rate');
        
        if (limitInput) limitInput.value = price * qty;
        if (rateInput) rateInput.value = document.getElementById('bill-coverage').value || 80;
        
        applyInsurerDefaultRulesForNewRow(row.id, name, price, qty);
    });
}
window.reapplyInsurerRulesToAllRows = reapplyInsurerRulesToAllRows;

// Gère le changement manuel de type de document pour activer le split automatiquement si assuré et afficher/masquer le titre du point
function handleBillTypeChange() {
    const type = document.getElementById('bill-type').value;
    const insurance = document.getElementById('bill-insurance').value;
    const splitCheckbox = document.getElementById('bill-use-split');
    
    // Gérer l'affichage de l'intitulé personnalisé pour les points hospitaliers
    const customTitleContainer = document.getElementById('custom-title-container');
    if (customTitleContainer) {
        if (type === 'DEFINITIF') {
            customTitleContainer.style.display = 'block';
            // Pré-remplir le titre par défaut s'il est vide
            const titleInput = document.getElementById('bill-title-custom');
            if (titleInput && !titleInput.value.trim()) {
                titleInput.value = "Point Définitif d'Hospitalisation";
            }
        } else {
            customTitleContainer.style.display = 'none';
        }
    }
    
    const patientType = document.getElementById('bill-patient-type')?.value || "PRIVE";
    if (patientType === 'PRIVE') {
        if (splitCheckbox) {
            splitCheckbox.checked = false;
            toggleBillingSplitMode();
        }
    } else {
        if (type === 'DETAIL_ASSUR' || type === 'DEFINITIF') {
            if (splitCheckbox) {
                splitCheckbox.checked = true;
                toggleBillingSplitMode();
            }
        } else {
            if (splitCheckbox) {
                splitCheckbox.checked = false;
                toggleBillingSplitMode();
            }
        }
    }
}
window.handleBillTypeChange = handleBillTypeChange;

// Permet d'imprimer ou d'exporter une facture/proforma directement depuis le registre général
function printBillDirectlyFromRegister(itemId) {
    window.isLoadingRecentItem = true;
    const bill = savedBills.find(b => b.id === itemId);
    if (!bill) {
        alert("Facture introuvable.");
        window.isLoadingRecentItem = false;
        return;
    }
    
    // 1. Charger la facture dans le formulaire
    const nomEl = document.getElementById('bill-patient-nom');
    const prenomEl = document.getElementById('bill-patient-prenom');
    const typeEl = document.getElementById('bill-type');
    const insEl = document.getElementById('bill-insurance');
    const covEl = document.getElementById('bill-coverage');
    const matEl = document.getElementById('bill-matricule');
    
    if (nomEl) nomEl.value = bill.patientNom || '';
    if (prenomEl) prenomEl.value = bill.patientPrenom || '';
    if (typeEl) typeEl.value = bill.type || 'PROFORMA';
    
    // --- Correction automatique des factures importées ---
    // Si une facture DETAIL_ASSUR ou DEFINITIF est stockée avec insurance='PRIVE' (bug d'import),
    // on reconstruit l'affichage assurance à partir des totaux connus et du taux standard (80%)
    let effectiveInsurance  = bill.insurance  || 'PRIVE';
    let effectiveCoverage   = bill.coverage   || 0;
    const partner = window.MercyFiatDB?.INSURERS?.find(ins => ins.id === effectiveInsurance);
    let effectivePatientType = bill.patientType || ((partner && partner.category === 'Sinistres & Accidents Auto') ? 'SINISTRE' : ((!effectiveInsurance || effectiveInsurance === 'PRIVE') ? 'PRIVE' : 'MALADIE'));
    let effectiveUseSplit    = bill.useSplit   || false;

    const isInsuredBillType = (bill.type === 'DETAIL_ASSUR' || bill.type === 'DEFINITIF');
    const storedAsPrivate   = (effectiveInsurance === 'PRIVE' && effectiveCoverage === 0);

    if (isInsuredBillType && storedAsPrivate && bill.partAssurance === 0 && bill.grossTotal > 0) {
        // Heuristique : si grossTotal > 400 000 FCFA et c'est un DETAIL_ASSUR/DEFINITIF, c'est très probablement un assuré
        // On essaie de retrouver l'assureur depuis patients_db.json via window.MercyFiatDB
        let detectedCoverage = 80; // Taux par défaut clinique
        let detectedInsurance = 'ASSURANCE';

        const dbObj = window.MercyFiatDB || null;
        if (dbObj && dbObj.PATIENTS) {
            const fullName = `${bill.patientNom || ''} ${bill.patientPrenom || ''}`.trim().toUpperCase();
            const foundPat = dbObj.PATIENTS.find(p => p.name && p.name.toUpperCase() === fullName);
            if (foundPat) {
                if (foundPat.insurer && foundPat.insurer !== 'PRIVE') {
                    detectedInsurance = foundPat.insurer;
                }
                if (foundPat.coverage && parseFloat(foundPat.coverage) > 0) {
                    detectedCoverage = parseFloat(foundPat.coverage);
                }
            }
        }

        effectiveInsurance   = detectedInsurance;
        effectiveCoverage    = detectedCoverage;
        effectivePatientType = 'MALADIE';
        effectiveUseSplit    = true;
    }
    // --- Fin correction automatique ---

    if (insEl) insEl.value = effectiveInsurance;
    if (covEl) covEl.value = effectiveCoverage;
    if (matEl) matEl.value = bill.matricule || '';
    
    // Mettre à jour le type de prise en charge dans le formulaire
    const patTypeEl = document.getElementById('bill-patient-type');
    if (patTypeEl) {
        patTypeEl.value = effectivePatientType;
        if (typeof handleBillPriseEnChargeChange === 'function') handleBillPriseEnChargeChange();
    }
    
    // Charger le diagnostic, l'intervention, le code K et les options d'affichage
    const diagEl = document.getElementById('bill-diagnostic');
    const intervEl = document.getElementById('bill-intervention');
    const kCodeEl = document.getElementById('bill-k-code');
    const showDiagEl = document.getElementById('bill-show-diag');
    const showIntervEl = document.getElementById('bill-show-interv');
    const showSigEl = document.getElementById('bill-show-sig');
    const showCachetEl = document.getElementById('bill-show-cachet');

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

    if (diagEl) diagEl.value = activeDiag;
    if (intervEl) intervEl.value = activeInterv;
    if (kCodeEl) kCodeEl.value = activeKCode;
    
    if (showDiagEl) showDiagEl.checked = bill.hasOwnProperty('showDiag') ? bill.showDiag : (activeDiag !== '');
    if (showIntervEl) showIntervEl.checked = bill.hasOwnProperty('showInterv') ? bill.showInterv : (activeInterv !== '');
    if (showSigEl) showSigEl.checked = bill.hasOwnProperty('showSig') ? bill.showSig : true;
    if (showCachetEl) showCachetEl.checked = bill.hasOwnProperty('showCachet') ? bill.showCachet : true;
    
    if (document.getElementById('bill-payment-method')) {
        document.getElementById('bill-payment-method').value = bill.paymentMethod || 'CASH';
    }
    if (document.getElementById('bill-amount-paid-patient')) {
        document.getElementById('bill-amount-paid-patient').value = bill.amountPaidPatient !== undefined ? bill.amountPaidPatient : '';
    }
    
    const splitCheckbox = document.getElementById('bill-use-split');
    if (splitCheckbox) {
        splitCheckbox.checked = effectiveUseSplit;
    }

    const discountTypeEl = document.getElementById('bill-discount-type');
    const discountValueEl = document.getElementById('bill-discount-value');
    if (discountTypeEl && discountValueEl) {
        discountTypeEl.value = bill.discountType || 'PERCENT';
        discountValueEl.value = bill.hasOwnProperty('discountValue') ? bill.discountValue : (bill.discountPct || 0);
    }
    if (typeof updateBillDiscountDisplay === 'function') {
        updateBillDiscountDisplay();
    }
    
    const customTitleInput = document.getElementById('bill-title-custom');
    if (customTitleInput) {
        customTitleInput.value = bill.customTitle || "Point Définitif d'Hospitalisation";
    }
    
    // Recréer les lignes d'items
    const container = document.getElementById('billing-items-container');
    if (container) {
        container.innerHTML = '';
        if (bill.items && bill.items.length > 0) {
            bill.items.forEach(item => {
                addCustomBillingRow(
                    item.name, 
                    item.price, 
                    item.qty, 
                    item.splitLimit !== undefined ? item.splitLimit : null, 
                    item.splitRate !== undefined ? item.splitRate : null
                );
            });
        }
    }
    
    if (typeof handleBillTypeChange === 'function') {
        handleBillTypeChange();
    }
    if (typeof toggleBillingSplitMode === 'function') {
        toggleBillingSplitMode();
    }
    
    // 2. Mettre à jour l'aperçu et lancer la prévisualisation A4
    if (typeof updateBillPreview === 'function') {
        updateBillPreview();
    }
    
    window.activeBillReference = bill.reference || '';
    window.isLoadingRecentItem = false;
    
    if (typeof openPrintPreview === 'function') {
        openPrintPreview('billing');
    }
}
window.printBillDirectlyFromRegister = printBillDirectlyFromRegister;
