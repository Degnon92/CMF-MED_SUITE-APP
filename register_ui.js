/* ============================================================
   register_ui.js - Gestion UI du Registre Général, Actions et DME Consolidé
   ============================================================ */

// État global des onglets du registre et pagination
let currentRegisterTab = 'ALL';
let currentRegisterSubFilter = 'ALL';
let registerCurrentPage = 1;
const registerPageSize = 50;
let lastRegisterSearchQuery = '';

// Commutateur d'onglet principal du Registre
function switchRegisterTab(tabValue, btn) {
    currentRegisterTab = tabValue;
    currentRegisterSubFilter = 'ALL'; // Reset sub-filter on tab change
    registerCurrentPage = 1;

    // Mise à jour visuelle des onglets
    document.querySelectorAll('.register-tab').forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');

    // Afficher/masquer les sous-filtres (uniquement pour Archives)
    const subFilters = document.getElementById('register-sub-filters');
    if (subFilters) {
        subFilters.style.display = tabValue === 'ARCHIVES' ? 'flex' : 'none';
        // Reset sub-filter active state
        subFilters.querySelectorAll('.register-sub-filter').forEach(f => f.classList.remove('active'));
        const allBtn = subFilters.querySelector('[data-sub="ALL"]');
        if (allBtn) allBtn.classList.add('active');
    }

    renderRegisterTable();
}

// Commutateur de sous-filtre (catégorie d'archives)
function switchRegisterSubFilter(subValue, btn) {
    currentRegisterSubFilter = subValue;
    registerCurrentPage = 1;
    document.querySelectorAll('.register-sub-filter').forEach(f => f.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderRegisterTable();
}

// Rendu du tableau du Registre Général (avec support onglets + sous-filtres)
function renderRegisterTable() {
    const tableBody = document.getElementById('register-table-rows');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    const rawSearch = (document.getElementById('register-search')?.value || "");
    const searchQuery = rawSearch.toLowerCase().trim();
    if (searchQuery !== lastRegisterSearchQuery) {
        registerCurrentPage = 1;
        lastRegisterSearchQuery = searchQuery;
    }
    const filterType = currentRegisterTab;
    
    // Union des factures et des documents
    const allRecords = [];
    
    // Inclure les factures selon l'onglet
    const showBills = (filterType === 'ALL' || filterType === 'BILLS_ONLY');
    if (showBills) {
        savedBills.forEach(b => {
            try {
                allRecords.push({
                    id: b.id,
                    reference: b.reference || '',
                    name: (function() {
                        let rawName = `${b.patientNom || ''} ${b.patientPrenom || ''}`.trim();
                        if (rawName.length > 60) {
                            const cleanNamePart = rawName.split(/(?:RAPPORT|JE SOUSSIGNÉ|CERTIFIE|ORDONNANCE)/i)[0].trim();
                            rawName = cleanNamePart.substring(0, 45) + (cleanNamePart.length > 45 ? '...' : '');
                        }
                        return rawName;
                    })(),
                    category: b.type === 'PROFORMA' ? 'Facture Proforma (Devis)' : (b.type === 'DETAIL_ASSUR' ? 'Détail Assurance Proforma' : (b.type === 'AVOIR' ? 'Facture d\'Avoir (Annulation)' : 'Point d\'Hospitalisation')),
                    detail: (b.items || []).map(item => item.name || '').join(', '),
                    insurance: `${b.insurance || 'PRIVE'} (${b.coverage || 0}%)`,
                    value: b.discountedTotal || 0,
                    date: b.date || '',
                    status: b.status || 'RÉGLÉ',
                    categoryType: 'BILL',
                    rawBill: b,
                    isArchive: false
                });
            } catch (err) {
                console.error("Erreur de rendu d'une facture du registre:", err, b);
            }
        });
    }
    
    // Inclure les documents selon l'onglet
    const showMyDocs = (filterType === 'ALL' || filterType === 'MY_DOCS');
    const showArchives = (filterType === 'ALL' || filterType === 'ARCHIVES');
    
    if (showMyDocs || showArchives) {
        savedDocuments.forEach(d => {
            try {
                const isArchive = (d.id || '').startsWith('DOC-REAL-');
                
                // Filtrer selon l'onglet actif
                if (filterType === 'MY_DOCS' && isArchive) return; // Exclure les archives de "Mes Rapports"
                if (filterType === 'ARCHIVES' && !isArchive) return; // Exclure les nouveaux de "Archives"
                
                // Sous-filtre par catégorie (uniquement pour les archives)
                if (filterType === 'ARCHIVES' && currentRegisterSubFilter !== 'ALL') {
                    const cat = (d.category || '').toLowerCase();
                    const tpl = (d.templateId || '').toLowerCase();
                    if (currentRegisterSubFilter === 'CRO' && !cat.includes('compte-rendu') && !tpl.startsWith('cro_')) return;
                    if (currentRegisterSubFilter === 'HOSPI' && !cat.includes('hospitalisation') && !tpl.includes('hospi')) return;
                    if (currentRegisterSubFilter === 'CONSULT' && !cat.includes('consultation') && !tpl.includes('cs_')) return;
                    if (currentRegisterSubFilter === 'CERTIF' && !cat.includes('certificat') && !tpl.startsWith('certif')) return;
                }

                const catNames = {
                    rapport_cs_simple: 'Rapport de Consultation (CS)',
                    rapport_cs_suivi: 'Rapport CS — Suivi Post-Op',
                    rapport_cs_assurance: 'Rapport CS — Assurance',
                    rapport_hospi_simple: "Rapport d'Hospitalisation (HOSPI)",
                    rapport_hospi_assurance: 'Rapport HOSPI — Assurance',
                    rapport_hospi_prolongation: 'Rapport Prolongation',
                    rapport_medical: 'Rapport Médical Général',
                    cro_lca: 'CRO — LCA Genou (DIDT)',
                    cro_cmf: 'CRO — Fracture CMF',
                    certif_repos: 'Certificat de Repos Médical',
                    certif_reprise: 'Certificat de Reprise de Travail',
                    relance_assurance: 'Lettre de Relance Mutuelle'
                };
                allRecords.push({
                    id: d.id,
                    reference: '',
                    name: (function() {
                        let rawName = `${d.patientNom || ''} ${d.patientPrenom || ''}`.trim();
                        if (rawName.length > 60) {
                            const cleanNamePart = rawName.split(/(?:RAPPORT|JE SOUSSIGNÉ|CERTIFIE|ORDONNANCE)/i)[0].trim();
                            rawName = cleanNamePart.substring(0, 45) + (cleanNamePart.length > 45 ? '...' : '');
                        }
                        return rawName;
                    })(),
                    category: catNames[d.templateId] || d.category || 'Rapport Clinique',
                    detail: `Diagnostic: ${d.diagnosis || ''}`,
                    insurance: 'N/A',
                    value: 0,
                    date: d.date || '',
                    status: 'N/A',
                    categoryType: 'DOC',
                    isArchive: isArchive,
                    archiveCategory: d.category || ''
                });
            } catch (err) {
                console.error("Erreur de rendu d'un rapport du registre:", err, d);
            }
        });
    }
    
    // Filtrage par texte recherché
    const filteredRecords = allRecords.filter(rec => {
        return rec.name.toLowerCase().includes(searchQuery) ||
               rec.category.toLowerCase().includes(searchQuery) ||
               rec.detail.toLowerCase().includes(searchQuery) ||
               rec.insurance.toLowerCase().includes(searchQuery) ||
               (rec.reference && rec.reference.toLowerCase().includes(searchQuery));
    });
    
    // Tri par date décroissante
    filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Mettre à jour le compteur de résultats
    const countEl = document.getElementById('register-result-count');
    if (countEl) countEl.textContent = `${filteredRecords.length} fiche(s)`;
    
    // Mettre à jour le badge du nombre d'archives
    const archiveBadge = document.getElementById('archive-count-badge');
    if (archiveBadge) {
        const archiveCount = savedDocuments.filter(d => (d.id || '').startsWith('DOC-REAL-')).length;
        archiveBadge.textContent = archiveCount;
    }
    
    if (filteredRecords.length === 0) {
        const emptyMsgs = {
            'ALL': 'Aucune fiche trouvée dans les archives.',
            'BILLS_ONLY': 'Aucune facture ou proforma enregistrée.',
            'MY_DOCS': 'Aucun rapport créé par vous pour le moment.',
            'ARCHIVES': 'Aucun rapport archivé dans cette catégorie.'
        };
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; font-style:italic; padding:30px;">${emptyMsgs[filterType] || emptyMsgs['ALL']}</td></tr>`;
        const paginationBar = document.getElementById('register-pagination-controls');
        if (paginationBar) paginationBar.innerHTML = '';
        return;
    }
    
    // Pagination slicing
    const totalItems = filteredRecords.length;
    const totalPages = Math.ceil(totalItems / registerPageSize) || 1;
    if (registerCurrentPage > totalPages) {
        registerCurrentPage = totalPages;
    }
    const pageRecords = filteredRecords.slice((registerCurrentPage - 1) * registerPageSize, registerCurrentPage * registerPageSize);

    pageRecords.forEach(rec => {
        // 1. Déterminer les initiales pour l'avatar premium
        const initials = (rec.name || 'P')
            .split(' ')
            .filter(Boolean)
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
            
        // 2. Déterminer la couleur et le badge du type de document
        let badgeClass = 'light';
        let categoryText = rec.category;
        
        if (rec.categoryType === 'BILL') {
            if (rec.rawBill.type === 'PROFORMA') {
                badgeClass = 'dark'; // bleu
            } else if (rec.rawBill.type === 'DETAIL_ASSUR') {
                badgeClass = 'info'; // bronze
            } else if (rec.rawBill.type === 'AVOIR') {
                badgeClass = 'danger'; // rouge
            } else if (rec.rawBill.type === 'DEFINITIF') {
                badgeClass = 'success'; // vert
            }
        } else if (rec.isArchive) {
            // Badge coloré par catégorie d'archive
            const archCat = (rec.archiveCategory || '').toLowerCase();
            if (archCat.includes('compte-rendu')) badgeClass = 'archive-cro';
            else if (archCat.includes('hospitalisation')) badgeClass = 'archive-hospi';
            else if (archCat.includes('consultation')) badgeClass = 'archive-consult';
            else if (archCat.includes('certificat')) badgeClass = 'archive-certif';
            else badgeClass = 'light';
        }
        
        // 3. Badge de statut de paiement pour les points définitifs
        let statusBadgeHtml = '';
        if (rec.categoryType === 'BILL' && rec.rawBill.type === 'DEFINITIF' && rec.rawBill.insurance !== 'PRIVE') {
            const isImpaye = rec.status === 'IMPAYÉ';
            statusBadgeHtml = `
                <span onclick="toggleBillPaymentStatus('${rec.id}'); event.stopPropagation();" 
                      class="badge ${isImpaye ? 'warning' : 'success'}" 
                      style="cursor:pointer; margin-left:6px;" 
                      title="Cliquez pour changer le statut de paiement">
                    ${isImpaye ? 'Impayé ⏳' : 'Réglé ✅'}
                </span>`;
        }
        
        const refHtml = rec.reference ? `<div style="font-size:0.7rem; color:var(--text-secondary); margin-top:4px; font-family:monospace; font-weight:700; letter-spacing:0.3px;">${rec.reference}</div>` : '';
        
        // 4. Formater l'assurance
        let insuranceHtml = '-';
        if (rec.insurance && rec.insurance !== 'N/A') {
            const isPrive = rec.insurance.includes('PRIVE');
            insuranceHtml = `<span class="badge ${isPrive ? 'light' : 'dark'}" style="font-size:0.72rem; text-transform:none; font-weight:600;">${rec.insurance}</span>`;
        }
        
        // 5. Construire le menu déroulant d'actions premium (anti-débordement)
        let dropdownItemsHtml = '';
        let primaryActionCallback = '';
        
        if (rec.categoryType === 'BILL') {
            primaryActionCallback = `viewRecentItem('BILL', '${rec.id}'); window.activeBillReference='${rec.reference || ''}';`;
            
            if (rec.rawBill.type === 'DEFINITIF') {
                const isImpaye = rec.status === 'IMPAYÉ';
                dropdownItemsHtml = `
                    <button onclick="printBillDirectlyFromRegister('${rec.id}');"><span style="font-size:0.95rem;">🖨️</span> Imprimer / PDF</button>
                    <button onclick="duplicateBillFromRegister('${rec.id}');"><span style="font-size:0.95rem;">👯</span> Dupliquer</button>
                    <button onclick="generateReportFromBill('${rec.id}');"><span style="font-size:0.95rem;">📋</span> Rapport Médical</button>
                    ${isImpaye ? `<button onclick="launchAssuranceRecovery('${rec.id}');"><span style="font-size:0.95rem;">✉️</span> Relance Mutuelle</button>` : ''}
                    <div class="divider"></div>
                    <button class="btn-danger-hover" onclick="cancelBillAndGenerateCreditNote('${rec.id}');"><span style="font-size:0.95rem;">🚫</span> Annuler (Avoir)</button>
                `;
            } else if (rec.rawBill.type === 'AVOIR') {
                dropdownItemsHtml = `
                    <button onclick="printBillDirectlyFromRegister('${rec.id}');"><span style="font-size:0.95rem;">🖨️</span> Imprimer / PDF</button>
                    <button onclick="duplicateBillFromRegister('${rec.id}');"><span style="font-size:0.95rem;">👯</span> Dupliquer</button>
                    <div class="divider"></div>
                    <button disabled style="opacity:0.5; cursor:not-allowed;"><span style="font-size:0.95rem;">🔒</span> Fiche d'Avoir verrouillée</button>
                `;
            } else if (rec.rawBill.type === 'DETAIL_ASSUR') {
                dropdownItemsHtml = `
                    <button onclick="printBillDirectlyFromRegister('${rec.id}');"><span style="font-size:0.95rem;">🖨️</span> Imprimer / PDF</button>
                    <button onclick="duplicateBillFromRegister('${rec.id}');"><span style="font-size:0.95rem;">👯</span> Dupliquer</button>
                    <button onclick="convertProformaToDefinitifSplit('${rec.id}');"><span style="font-size:0.95rem;">📄</span> Facturer (Point)</button>
                    <div class="divider"></div>
                    <button class="btn-danger-hover" onclick="deleteRegisterItem('BILL', '${rec.id}');"><span style="font-size:0.95rem;">❌</span> Supprimer</button>
                `;
            } else { // PROFORMA
                dropdownItemsHtml = `
                    <button onclick="printBillDirectlyFromRegister('${rec.id}');"><span style="font-size:0.95rem;">🖨️</span> Imprimer / PDF</button>
                    <button onclick="duplicateBillFromRegister('${rec.id}');"><span style="font-size:0.95rem;">👯</span> Dupliquer</button>
                    <button onclick="generateReportFromBill('${rec.id}');"><span style="font-size:0.95rem;">📋</span> Rapport Médical</button>
                    <button onclick="convertProformaToDetailAssurance('${rec.id}');"><span style="font-size:0.95rem;">📊</span> Détail Assurance</button>
                    <button onclick="convertProformaToDefinitifSplit('${rec.id}');"><span style="font-size:0.95rem;">📄</span> Facturer (Point)</button>
                    <div class="divider"></div>
                    <button class="btn-danger-hover" onclick="deleteRegisterItem('BILL', '${rec.id}');"><span style="font-size:0.95rem;">❌</span> Supprimer</button>
                `;
            }
        } else if (rec.isArchive) {
            // ARCHIVE : lecture seule + impression
            primaryActionCallback = `openArchiveDocPreview('${rec.id}');`;
            dropdownItemsHtml = `
                <button onclick="printArchiveDoc('${rec.id}');"><span style="font-size:0.95rem;">🖨️</span> Imprimer / PDF</button>
                <button onclick="duplicateDocFromRegister('${rec.id}');"><span style="font-size:0.95rem;">👯</span> Dupliquer comme nouveau</button>
            `;
        } else {
            // MES RAPPORTS : édition complète
            primaryActionCallback = `viewRecentItem('DOC', '${rec.id}'); window.activeBillReference='';`;
            dropdownItemsHtml = `
                <button onclick="duplicateDocFromRegister('${rec.id}');"><span style="font-size:0.95rem;">👯</span> Dupliquer</button>
                <button class="btn-danger-hover" onclick="deleteRegisterItem('DOC', '${rec.id}');"><span style="font-size:0.95rem;">❌</span> Supprimer</button>
            `;
        }
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                <strong onclick="openPatientDMEDrawer('${rec.name.replace(/'/g, "\\'")}')" class="patient-link" title="${rec.name}" style="display:inline-flex; align-items:center; gap:8px; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                    <span class="patient-avatar">${initials}</span>
                    <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${rec.name}</span>
                </strong>
            </td>
            <td>
                <span class="badge ${badgeClass}">${categoryText}</span>
                ${rec.isArchive ? '<span class="badge light" style="font-size:0.6rem; padding:2px 5px; margin-left:3px; opacity:0.7;">📚 Archive</span>' : ''}
                ${statusBadgeHtml}
                ${refHtml}
            </td>
            <td style="max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${rec.detail}">
                <span style="font-size:0.85rem; color:var(--text-secondary);">${rec.detail}</span>
            </td>
            <td>${insuranceHtml}</td>
            <td style="font-weight:700; color:var(--text-primary); white-space:nowrap;">${rec.value !== 0 ? formatCurrency(rec.value) : '-'}</td>
            <td style="font-weight:500; font-size:0.82rem; color:var(--text-secondary);">${new Date(rec.date).toLocaleDateString('fr-FR')}</td>
            <td>
                <div class="actions-cell-wrapper">
                    <button class="btn btn-secondary btn-small" onclick="${primaryActionCallback}" style="padding:6px 12px; font-weight:800; font-size:0.78rem; display:flex; align-items:center; gap:4px;">
                        <span>${rec.isArchive ? '📖 Lire' : 'Ouvrir'}</span>
                    </button>
                    <div class="dropdown-actions">
                        <button class="dropdown-trigger" onclick="toggleRowDropdown(event, '${rec.id}')" title="Plus d'options">⋮</button>
                        <div id="dropdown-menu-${rec.id}" class="dropdown-menu-content">
                            ${dropdownItemsHtml}
                        </div>
                    </div>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    renderRegisterPagination(totalItems);
}

// Fonction de rendu de la barre de pagination interactif
function renderRegisterPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / registerPageSize) || 1;
    const paginationBar = document.getElementById('register-pagination-controls');
    if (!paginationBar) return;

    paginationBar.innerHTML = '';
    paginationBar.className = 'pagination-bar';
    paginationBar.style.display = 'flex';
    paginationBar.style.justifyContent = 'space-between';
    paginationBar.style.alignItems = 'center';
    paginationBar.style.padding = '12px 20px';
    paginationBar.style.background = 'var(--bg-main)';
    paginationBar.style.borderTop = '1px solid var(--border-color)';
    paginationBar.style.borderBottomLeftRadius = 'var(--border-radius-lg)';
    paginationBar.style.borderBottomRightRadius = 'var(--border-radius-lg)';

    // Bouton Précédent
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn btn-secondary btn-small';
    prevBtn.style.padding = '6px 12px';
    prevBtn.disabled = registerCurrentPage === 1;
    prevBtn.innerHTML = '&larr; Précédent';
    prevBtn.style.fontWeight = '700';
    prevBtn.onclick = () => {
        if (registerCurrentPage > 1) {
            registerCurrentPage--;
            renderRegisterTable();
        }
    };

    // Label Info
    const label = document.createElement('span');
    label.style.fontWeight = '700';
    label.style.fontSize = '0.8rem';
    label.style.color = 'var(--text-secondary)';
    const startIdx = totalItems === 0 ? 0 : (registerCurrentPage - 1) * registerPageSize + 1;
    const endIdx = Math.min(registerCurrentPage * registerPageSize, totalItems);
    label.textContent = `Affichage ${startIdx}-${endIdx} sur ${totalItems} fiches (Page ${registerCurrentPage} sur ${totalPages})`;

    // Bouton Suivant
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-secondary btn-small';
    nextBtn.style.padding = '6px 12px';
    nextBtn.disabled = registerCurrentPage === totalPages;
    nextBtn.innerHTML = 'Suivant &rarr;';
    nextBtn.style.fontWeight = '700';
    nextBtn.onclick = () => {
        if (registerCurrentPage < totalPages) {
            registerCurrentPage++;
            renderRegisterTable();
        }
    };

    paginationBar.appendChild(prevBtn);
    paginationBar.appendChild(label);
    paginationBar.appendChild(nextBtn);
}

// Annule une facture définitive en générant une note de crédit d'Avoir officielle (Tarification négative compensatoire)
async function cancelBillAndGenerateCreditNote(billId) {
    const bill = savedBills.find(b => b.id === billId);
    if (!bill) {
        alert("Facture introuvable.");
        return;
    }
    
    if (bill.type !== 'DEFINITIF') {
        alert("Seules les factures définitives peuvent faire l'objet d'un avoir d'annulation.");
        return;
    }
    
    if (await confirm(`Confirmez-vous l'annulation comptable réglementaire de la facture ${bill.reference} ? \n(Cette action va générer automatiquement une facture d'Avoir négative équivalente pour compenser vos bilans et graphiques financiers sans altérer l'intégrité comptable)`)) {
        // 1. Forcer le statut de la facture d'origine à "RÉGLÉ" pour retirer des impayés d'assurance
        bill.status = 'RÉGLÉ';
        
        // 2. Générer la référence d'Avoir unique
        const nextAvoirRef = generateSequentialBillReference('AVOIR');
        
        const creditNote = {
            id: 'BILL-' + Date.now(),
            reference: nextAvoirRef,
            patientNom: bill.patientNom,
            patientPrenom: bill.patientPrenom,
            type: 'AVOIR',
            insurance: bill.insurance,
            coverage: bill.coverage,
            patientType: bill.patientType || (function() {
                const partner = window.MercyFiatDB?.INSURERS?.find(ins => ins.id === bill.insurance);
                return (partner && partner.category === 'Sinistres & Accidents Auto') ? 'SINISTRE' : (bill.insurance === 'PRIVE' ? 'PRIVE' : 'MALADIE');
            })(),
            matricule: `Avoir sur ${bill.reference}`,
            items: bill.items.map(item => ({
                name: `Avoir sur : ${item.name}`,
                price: -item.price, // Prix négatif
                qty: item.qty,
                subtotal: -item.subtotal
            })),
            grossTotal: -bill.grossTotal,
            discountPct: bill.discountPct,
            reductionAmount: -bill.reductionAmount,
            discountedTotal: -bill.discountedTotal,
            partAssurance: -bill.partAssurance,
            partPatient: -bill.partPatient,
            paymentMethod: bill.paymentMethod,
            amountPaidPatient: -bill.amountPaidPatient,
            balancePatient: -bill.balancePatient,
            status: 'RÉGLÉ',
            date: new Date().toISOString().substring(0, 10)
        };
        
        savedBills.unshift(creditNote);
        localStorage.setItem('mercyfiat_bills', JSON.stringify(savedBills));
        
        // Rafraîchir les tableaux de bord et les vues
        updateDashboardStats();
        renderRegisterTable();
        if (typeof renderRecentActivity === 'function') renderRecentActivity();
        
        showNotificationToast(`Facture d'Avoir ${nextAvoirRef} générée avec succès !`);
    }
}

// Supprime une fiche du registre (Uniquement Proformas et documents)
async function deleteRegisterItem(category, itemId) {
    if (!await confirm("Êtes-vous sûr de vouloir supprimer définitivement cette fiche ?")) return;
    
    if (category === 'BILL') {
        const bill = savedBills.find(b => b.id === itemId);
        if (bill && bill.type === 'DEFINITIF') {
            alert("🔒 Intégrité comptable : Les factures définitives ne peuvent pas être supprimées directement. Veuillez utiliser la fonction d'annulation.");
            return;
        }
        savedBills = savedBills.filter(b => b.id !== itemId);
        localStorage.setItem('mercyfiat_bills', JSON.stringify(savedBills));
    } else {
        savedDocuments = savedDocuments.filter(d => d.id !== itemId);
        localStorage.setItem('mercyfiat_docs', JSON.stringify(savedDocuments));
    }
    
    renderRegisterTable();
    updateDashboardStats();
    showNotificationToast("Fiche supprimée des archives avec succès !");
}

// Gestion du menu déroulant d'actions premium
function toggleRowDropdown(event, id) {
    event.stopPropagation();
    const dropdown = document.getElementById(`dropdown-menu-${id}`);
    if (!dropdown) return;
    
    const wasShowing = dropdown.classList.contains('show');
    
    // Fermer tous les menus ouverts et nettoyer leurs styles inline
    document.querySelectorAll('.dropdown-menu-content').forEach(menu => {
        menu.classList.remove('show');
        menu.style.position = '';
        menu.style.top = '';
        menu.style.right = '';
        menu.style.left = '';
    });
    
    if (!wasShowing) {
        const trigger = event.currentTarget;
        const rect = trigger.getBoundingClientRect();
        dropdown.style.position = 'fixed';
        dropdown.style.top = (rect.bottom + 6) + 'px'; // Décale de 6px sous le déclencheur
        dropdown.style.right = (window.innerWidth - rect.right) + 'px';
        dropdown.style.left = 'auto';
        dropdown.classList.add('show');
    }
}

// Helper de récupération des données DME actives du patient
function getActiveDMEData() {
    const patientName = window.activeDMEPatientName;
    if (!patientName) return null;

    // Helper to see if name matches
    const areNamesMatching = (nameA, nameB) => {
        const normA = (nameA || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
        const normB = (nameB || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
        
        if (normA === normB) return true;
        if (!normA || !normB) return false;
        
        const particles = new Set(['de', 'le', 'la', 'du', 'el', 'da', 'di', 'en', 'et', 'les', 'des', 'dr', 'mr', 'mme', 'mlle']);
        const getSignificantWords = (normStr) => {
            return normStr.split(' ').filter(w => w.length > 1 && !particles.has(w));
        };
        
        const wordsA = getSignificantWords(normA);
        const wordsB = getSignificantWords(normB);
        
        if (wordsA.length === 0 || wordsB.length === 0) {
            return false;
        }
        
        const setA = new Set(wordsA);
        const setB = new Set(wordsB);
        
        const isSubset = (set1, set2) => {
            for (const item of set1) {
                if (!set2.has(item)) return false;
            }
            return true;
        };
        
        return isSubset(setA, setB) || isSubset(setB, setA);
    };

    const nameMatches = (recNom, recPrenom) => {
        return areNamesMatching(patientName, `${recNom || ''} ${recPrenom || ''}`);
    };
    
    // Trouver le patient dans la base
    const dbPatient = (window.MercyFiatDB && window.MercyFiatDB.PATIENTS)
        ? window.MercyFiatDB.PATIENTS.find(p => areNamesMatching(p.name, patientName))
        : null;
    
    const matchedBills = savedBills.filter(b => nameMatches(b.patientNom, b.patientPrenom));
    const matchedDocs = savedDocuments.filter(d => nameMatches(d.patientNom, d.patientPrenom));
    
    return {
        patientName: patientName,
        dbPatient: dbPatient,
        matchedBills: matchedBills,
        matchedDocs: matchedDocs
    };
}

// Impression d'un Dossier DME A4 consolidé soigné
function printDMEConsolidated() {
    const data = getActiveDMEData();
    if (!data) {
        alert("Aucun patient actif sélectionné pour le dossier DME.");
        return;
    }
    
    const { patientName, dbPatient, matchedBills, matchedDocs } = data;
    
    let patientAge = "--";
    if (dbPatient && dbPatient.age) patientAge = dbPatient.age;
    if (patientAge === "--" && matchedDocs.length > 0) {
        const docWithAge = matchedDocs.find(d => d.patientAge && d.patientAge !== "--");
        if (docWithAge) patientAge = docWithAge.patientAge;
    }
    
    let diagnosis = dbPatient ? (dbPatient.diagnosis || "N/A") : "N/A";
    if (diagnosis === "N/A" && matchedDocs.length > 0) {
        diagnosis = matchedDocs[0].diagnosis || "N/A";
    }
    
    let intervention = dbPatient ? (dbPatient.intervention || "N/A") : "N/A";
    let kCode = dbPatient ? (dbPatient.kCode || "") : "";
    if (intervention === "N/A" && matchedBills.length > 0) {
        const surgItem = matchedBills[0].items.find(item => item.name.toLowerCase().includes('k'));
        if (surgItem) intervention = surgItem.name;
    }
    
    const formatFCFA = (val) => new Intl.NumberFormat('fr-FR').format(val) + " FCFA";
    
    let totalBilled = matchedBills.reduce((sum, b) => sum + b.grossTotal, 0);
    let totalInsurance = matchedBills.reduce((sum, b) => sum + b.partAssurance, 0);
    let totalPatient = matchedBills.reduce((sum, b) => sum + b.partPatient, 0);
    
    const clinicalTemplatesNames = {
        cro_lca: 'Compte-Rendu Opératoire Genou',
        cro_rtup: 'Compte-Rendu Opératoire Prostate',
        cro_cmf: 'Compte-Rendu Opératoire Maxillo-Facial',
        certif_repos: 'Certificat Repos Médical',
        certif_reprise: 'Certificat Reprise de Travail',
        rapport_cons: 'Rapport de Consultation',
        rapport_hospi: 'Rapport d\'Hospitalisation',
        rapport_medical: 'Rapport Médical Général',
        relance_assurance: 'Lettre de Relance Mutuelle'
    };
    
    const modal = document.getElementById('print-preview-modal');
    const sheet = document.getElementById('modal-a4-sheet');
    if (!modal || !sheet) return;
    
    activePrintType = 'dme';
    sheet.innerHTML = '';
    
    // Construction de la structure de la synthèse DME
    let html = `
        ${window.MercyFiatTemplates.getPrintHeaderHtml()}

        <div style="margin: 10px 0 8px 0; padding: 10px 16px; background: #eae6df; border-left: 4px solid var(--accent-blue); border-radius: 4px; font-size: 0.95rem; font-weight:800; display:flex; justify-content:space-between; align-items:center;">
            <span>📂 DOSSIER MÉDICAL ÉLECTRONIQUE (DME) 360°</span>
            <span style="font-size:0.75rem; font-weight:700; color:#4a5568;">Édition du ${new Date().toLocaleDateString('fr-FR')}</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 12px; background: #f7f5f2; padding: 12px; border-radius: 6px; border: 1px solid var(--border-color); font-size:0.83rem;">
            <div>
                <p style="margin:0 0 6px 0;"><strong>Patient :</strong> <span style="text-transform:uppercase; font-weight:700;">${patientName}</span></p>
                <p style="margin:0 0 6px 0;"><strong>Âge :</strong> ${patientAge}</p>
                <p style="margin:0;"><strong>Diagnostic Principal :</strong> ${diagnosis}</p>
            </div>
            <div>
                <p style="margin:0 0 6px 0;"><strong>Acte / Intervention :</strong> ${intervention}</p>
                <p style="margin:0;"><strong>Nomenclature :</strong> <span class="badge dark" style="font-size:0.7rem; padding: 2px 6px; display:inline-block; margin-top:2px;">${kCode || "Non spécifié"}</span></p>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px; text-align: center;">
            <div style="background: rgba(74, 111, 165, 0.08); padding: 8px; border-radius: var(--radius-md); border: 1px solid rgba(74, 111, 165, 0.2);">
                <span style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; display: block;">Total Brut Facturé</span>
                <strong style="font-size: 0.9rem; color: #1a202c; display: block; margin-top: 2px;">${formatFCFA(totalBilled)}</strong>
            </div>
            <div style="background: rgba(56, 178, 172, 0.08); padding: 8px; border-radius: var(--radius-md); border: 1px solid rgba(56, 178, 172, 0.2);">
                <span style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; display: block;">Tiers-Payant Assurances</span>
                <strong style="font-size: 0.9rem; color: var(--accent-teal); display: block; margin-top: 2px;">${formatFCFA(totalInsurance)}</strong>
            </div>
            <div style="background: rgba(212, 139, 123, 0.08); padding: 8px; border-radius: var(--radius-md); border: 1px solid rgba(212, 139, 123, 0.2);">
                <span style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; display: block;">Ticket Modérateur Patient</span>
                <strong style="font-size: 0.9rem; color: var(--accent-coral); display: block; margin-top: 2px;">${formatFCFA(totalPatient)}</strong>
            </div>
        </div>
    `;

    // Insertion des factures
    if (matchedBills.length > 0) {
        html += `
            <div style="margin-bottom: 15px;">
                <h4 style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--accent-blue); margin: 0 0 5px 0;">🧾 Synthèse des Actes &amp; Facturations</h4>
                <table style="width: 100%; border-collapse: collapse; border: 2px solid #1a202c;">
                    <thead>
                        <tr>
                            <th>Référence / Désignation de la Fiche</th>
                            <th>Total Brut (FCFA)</th>
                            <th>Part Assur. (FCFA)</th>
                            <th>Part Patient (FCFA)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${matchedBills.map(b => {
                            const bType = b.type === 'PROFORMA' ? 'Proforma' : (b.type === 'DETAIL_ASSUR' ? 'Détail Assur.' : (b.type === 'AVOIR' ? 'Avoir' : 'Point'));
                            return `
                                <tr>
                                    <td><strong>${bType}</strong> - ${b.reference || 'N/A'} <span style="font-size:0.7rem; color:#718096;">(${new Date(b.date).toLocaleDateString('fr-FR')})</span></td>
                                    <td>${formatFCFA(b.grossTotal)}</td>
                                    <td>${formatFCFA(b.partAssurance)}</td>
                                    <td>${formatFCFA(b.partPatient)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Insertion des documents cliniques
    if (matchedDocs.length > 0) {
        html += `
            <div style="margin-bottom: 15px;">
                <h4 style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--accent-teal); margin: 15px 0 8px 0; border-bottom: 2px solid var(--border-color); padding-bottom: 4px;">📝 Rapports Médicaux, CROs &amp; Certificats</h4>
                ${matchedDocs.map(d => {
                    const docTitle = clinicalTemplatesNames[d.templateId] || 'Rapport Clinique';
                    const docParagraphs = (d.content || d.text || '').split('\n\n').map(para => {
                        const trimmed = para.trim();
                        if (!trimmed) return '';
                        return `<p style="margin-bottom: 6px; text-align: justify; font-size: 0.78rem; line-height: 1.5;">${trimmed.replace(/\n/g, '<br>')}</p>`;
                    }).filter(Boolean).join('');
                    
                    return `
                        <div style="margin-bottom: 14px; page-break-inside: avoid; border: 1px dashed var(--border-color); padding: 10px; border-radius: 4px; background: #faf9f6;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; border-bottom:1px solid rgba(0,0,0,0.06); padding-bottom:3px;">
                                <strong style="font-size: 0.8rem; color: var(--accent-teal);">${docTitle.toUpperCase()}</strong>
                                <span style="font-size: 0.7rem; color: #718096; font-weight: 600;">Émis le ${new Date(d.date).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div style="margin-top: 4px;">
                                ${docParagraphs}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // Bloc de signature officielle
    html += `
        <div style="margin-top: 25px; display: flex; justify-content: flex-end; page-break-inside: avoid;">
            <div style="text-align: center; min-width: 220px;">
                <p style="font-size: 0.82rem; font-weight: 800; margin-bottom: 2px;">Dr Gipsy AGAVOEDO</p>
                <p style="font-size: 0.72rem; color: #718096; margin-bottom: 4px;">Chirurgien Orthopédiste Traumatologue</p>
                <div class="signature-seal-container">
                    <img src="assets/cachet_centre.png?t=${Date.now()}" class="seal-img" style="display:block;">
                    <img src="assets/signature.png?t=${Date.now()}" class="signature-img" style="display:block;">
                </div>
            </div>
        </div>

        ${window.MercyFiatTemplates.getPrintFooterHtml()}
    `;

    sheet.innerHTML = html;
    
    // Ouvrir le modal d'aperçu
    modal.style.display = 'flex';
    closePatientDMEDrawer();
}

// Fonction pour dupliquer une facture depuis le registre
async function duplicateBillFromRegister(itemId) {
    const bills = JSON.parse(localStorage.getItem('mercyfiat_bills')) || [];
    const bill = bills.find(b => b.id === itemId);
    if (!bill) {
        alert("Facture introuvable pour duplication.");
        return;
    }

    if (!await confirm(`Voulez-vous dupliquer cette facture pour le patient ${bill.patientNom} ${bill.patientPrenom} ?`)) {
        return;
    }

    // Cloner l'objet complet
    const clonedBill = JSON.parse(JSON.stringify(bill));
    clonedBill.id = 'BILL-' + Date.now();
    
    // Générer une nouvelle référence séquentielle
    if (typeof generateSequentialBillReference === 'function') {
        clonedBill.reference = generateSequentialBillReference(clonedBill.type);
    } else {
        clonedBill.reference = bill.reference + '-COPY';
    }
    
    clonedBill.date = new Date().toISOString().substring(0, 10);
    
    // Ajouter au registre
    bills.unshift(clonedBill);
    localStorage.setItem('mercyfiat_bills', JSON.stringify(bills));
    
    // Mettre à jour en mémoire si disponible
    if (typeof savedBills !== 'undefined') {
        savedBills.unshift(clonedBill);
    }

    // Mettre à jour l'affichage
    if (typeof renderRegisterTable === 'function') renderRegisterTable();
    if (typeof updateDashboardStats === 'function') updateDashboardStats();
    if (typeof renderRecentActivity === 'function') renderRecentActivity();
    
    // Ouvrir immédiatement dans l'éditeur
    if (typeof viewRecentItem === 'function') {
        viewRecentItem('BILL', clonedBill.id);
    }
    
    if (typeof showNotificationToast === 'function') {
        showNotificationToast('✅ Facture dupliquée et chargée dans l\'éditeur !', 'success');
    } else {
        alert('Facture dupliquée et chargée dans l\'éditeur !');
    }
}

// Fonction pour dupliquer un document médical/rapport depuis le registre
async function duplicateDocFromRegister(itemId) {
    const docs = JSON.parse(localStorage.getItem('mercyfiat_docs')) || [];
    const doc = docs.find(d => d.id === itemId);
    if (!doc) {
        alert("Rapport médical introuvable pour duplication.");
        return;
    }

    if (!await confirm(`Voulez-vous dupliquer le rapport "${doc.title}" pour le patient ${doc.patientNom} ${doc.patientPrenom} ?`)) {
        return;
    }

    // Cloner l'objet complet
    const clonedDoc = JSON.parse(JSON.stringify(doc));
    clonedDoc.id = 'DOC-' + Date.now();
    clonedDoc.date = new Date().toISOString().substring(0, 10);
    clonedDoc.savedAt = new Date().toISOString();
    clonedDoc.title = doc.title + ' (Copie)';
    
    // Ajouter au registre
    docs.unshift(clonedDoc);
    localStorage.setItem('mercyfiat_docs', JSON.stringify(docs));
    
    // Mettre à jour en mémoire si disponible
    if (typeof savedDocuments !== 'undefined') {
        savedDocuments.unshift(clonedDoc);
    }

    // Mettre à jour l'affichage
    if (typeof renderRegisterTable === 'function') renderRegisterTable();
    
    // Ouvrir immédiatement dans l'éditeur
    if (typeof viewRecentItem === 'function') {
        viewRecentItem('DOC', clonedDoc.id);
    }
    
    if (typeof showNotificationToast === 'function') {
        showNotificationToast('✅ Rapport médical dupliqué et chargé dans l\'éditeur !', 'success');
    } else {
        alert('Rapport médical dupliqué et chargé dans l\'éditeur !');
    }
}

// Fermer tous les menus ouverts lors d'un clic ailleurs dans l'application ou lors du défilement
function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu-content').forEach(menu => {
        menu.classList.remove('show');
        menu.style.position = '';
        menu.style.top = '';
        menu.style.right = '';
        menu.style.left = '';
    });
}

document.addEventListener('click', closeAllDropdowns);
window.addEventListener('scroll', closeAllDropdowns, { passive: true });
document.addEventListener('scroll', closeAllDropdowns, { capture: true, passive: true });

// Liaison globale à window
window.switchRegisterTab = switchRegisterTab;
window.switchRegisterSubFilter = switchRegisterSubFilter;
window.renderRegisterTable = renderRegisterTable;
window.renderRegisterPagination = renderRegisterPagination;
window.cancelBillAndGenerateCreditNote = cancelBillAndGenerateCreditNote;
window.deleteRegisterItem = deleteRegisterItem;
window.toggleRowDropdown = toggleRowDropdown;
window.getActiveDMEData = getActiveDMEData;
window.printDMEConsolidated = printDMEConsolidated;
window.duplicateBillFromRegister = duplicateBillFromRegister;
window.duplicateDocFromRegister = duplicateDocFromRegister;
