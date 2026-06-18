/* ============================================================
   app_patients_ui.js - Gestion de l'affichage Patients & Triggers
   ============================================================ */

var patientsCurrentPage = 1;
const patientsPageSize = 25;
let lastPatientsSearchQuery = '';

// Rendu de la table du module Patients (Patientèle unique)
function renderPatientsTable() {
    const tableBody = document.getElementById('patients-table-rows');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    
    const dbPatients = (window.MercyFiatDB && window.MercyFiatDB.PATIENTS) || [];
    const customPatients = JSON.parse(localStorage.getItem('mercyfiat_custom_patients')) || [];
    const allPatientsMap = new Map();
    
    // Charger les patients réels de database.js
    dbPatients.forEach(p => {
        const cleaned = window.cleanPatientName ? window.cleanPatientName(p.name) : p.name.trim().toUpperCase();
        if (!cleaned || cleaned.length < 3) return;
        allPatientsMap.set(cleaned, {
            name: cleaned,
            diagnosis: (p.diagnosis && p.diagnosis.toLowerCase() !== 'bilan clinique') ? p.diagnosis : '',
            intervention: p.intervention || '',
            kCode: p.kCode || '',
            age: p.age || '',
            matricule: p.matricule || '',
            insurer: p.insurer || 'PRIVE',
            priseEnCharge: p.priseEnCharge || 0,
            societe: p.societe || ''
        });
    });
    
    // Fusionner les patients personnalisés — priorité aux données enrichies
    customPatients.forEach(p => {
        const cleaned = window.cleanPatientName ? window.cleanPatientName(p.name) : p.name.trim().toUpperCase();
        if (!cleaned || cleaned.length < 3) return;
        
        const existing = allPatientsMap.get(cleaned);
        if (!existing) {
            // Patient uniquement en localStorage
            allPatientsMap.set(cleaned, {
                name: cleaned,
                diagnosis: (p.diagnosis && p.diagnosis.toLowerCase() !== 'bilan clinique') ? p.diagnosis : '',
                intervention: p.intervention || '',
                kCode: p.kCode || '',
                age: p.age || '',
                matricule: p.matricule || '',
                insurer: p.insurer || 'PRIVE',
                priseEnCharge: p.priseEnCharge || 0,
                societe: p.societe || ''
            });
        } else {
            // Enrichir l'entrée existante avec les données de localStorage (si plus complètes)
            const merged = {
                ...existing,
                age:          p.age          || existing.age,
                diagnosis:    ((p.diagnosis && p.diagnosis.toLowerCase() !== 'bilan clinique') ? p.diagnosis : existing.diagnosis) || existing.diagnosis,
                intervention: p.intervention  || existing.intervention,
                kCode:        p.kCode         || existing.kCode,
                matricule:    p.matricule      || existing.matricule,
                insurer:      (p.insurer && p.insurer !== 'PRIVE') ? p.insurer : existing.insurer,
                priseEnCharge:(p.priseEnCharge && p.priseEnCharge !== 'PRIVE' && p.priseEnCharge !== 0) ? p.priseEnCharge : existing.priseEnCharge,
                societe:      p.societe        || existing.societe
            };
            allPatientsMap.set(cleaned, merged);
        }
    });

    const allPatients = Array.from(allPatientsMap.values());
    
    const searchVal = (document.getElementById('patients-search')?.value || "").toLowerCase().trim();
    if (searchVal !== lastPatientsSearchQuery) {
        patientsCurrentPage = 1;
        lastPatientsSearchQuery = searchVal;
    }
    
    const filteredPatients = allPatients.filter(p => {
        return p.name.toLowerCase().includes(searchVal) ||
               p.diagnosis.toLowerCase().includes(searchVal) ||
               p.intervention.toLowerCase().includes(searchVal);
    });
    
    filteredPatients.sort((a, b) => a.name.localeCompare(b.name));
    
    const totalItems = filteredPatients.length;
    const totalPages = Math.ceil(totalItems / patientsPageSize) || 1;
    if (patientsCurrentPage > totalPages) {
        patientsCurrentPage = totalPages;
    }
    const pagePatients = filteredPatients.slice((patientsCurrentPage - 1) * patientsPageSize, patientsCurrentPage * patientsPageSize);
    
    const countBadge = document.getElementById('patients-result-count');
    if (countBadge) countBadge.textContent = `${totalItems} patient(s)`;
    
    if (pagePatients.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; font-style:italic; padding:30px;">Aucun patient trouvé.</td></tr>`;
        const paginationBar = document.getElementById('patients-pagination-controls');
        if (paginationBar) paginationBar.innerHTML = '';
        return;
    }
    
    pagePatients.forEach(p => {
        const initials = p.name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'P';
        
        const createProformaCallback = `createPatientPrefilledProforma('${p.name.replace(/'/g, "\\'")}', '${p.age}', '${p.diagnosis.replace(/'/g, "\\'")}', '${p.intervention.replace(/'/g, "\\'")}', '${p.kCode}', '${p.insurer}', ${p.priseEnCharge}, '${p.matricule}');`;
        const createDocCallback = `createPatientPrefilledDoc('${p.name.replace(/'/g, "\\'")}', '${p.age}', '${p.diagnosis.replace(/'/g, "\\'")}', '${p.intervention.replace(/'/g, "\\'")}', '${p.kCode}');`;
        const openDmeCallback = `openPatientDMEDrawer('${p.name.replace(/'/g, "\\'")}');`;
        
        const tr = document.createElement('tr');
        const safeN = p.name.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        tr.innerHTML = `
            <td>
                <strong onclick="${openDmeCallback}" class="patient-link" title="${p.name}" style="display:inline-flex; align-items:center; gap:8px;">
                    <span class="patient-avatar" style="background:var(--accent-teal); color:white;">${initials}</span>
                    <span>${p.name}</span>
                </strong>
                <div style="font-size:0.75rem; color:var(--text-secondary); margin-left:36px; margin-top:2px;">
                    🎂 ${p.age || 'Age non renseigné'} &nbsp;|&nbsp; 🛡️ ${p.insurer || 'PRIVE'}${p.societe ? ` &nbsp;|&nbsp; 🏢 <strong style="color:var(--accent-gold);">${p.societe}</strong>` : ''}
                </div>
            </td>
            <td><span style="font-size:0.85rem; color:var(--text-secondary);">${p.diagnosis || '-'}</span></td>
            <td><span style="font-size:0.85rem; font-weight:600; color:var(--accent-teal);">${p.intervention || '-'}</span></td>
            <td>${p.kCode ? `<span class="badge info" style="font-family:monospace; font-weight:700;">${p.kCode}</span>` : '-'}</td>
            <td style="text-align:center; position:relative;">
                <div class="patient-action-menu-wrap" style="position:relative; display:inline-block;">
                    <button class="btn btn-secondary btn-small patient-kebab-btn"
                        onclick="togglePatientMenu(this, event)"
                        style="padding:5px 12px; font-size:1rem; font-weight:900; letter-spacing:2px; border-radius:8px; line-height:1;">
                        ···
                    </button>
                    <div class="patient-action-dropdown" style="display:none; position:absolute; right:0; top:calc(100% + 4px); min-width:190px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:10px; box-shadow:0 8px 24px rgba(0,0,0,0.12); z-index:999; overflow:hidden; animation:fadeInModal 0.15s ease-out;">
                        <button class="patient-menu-item" onclick="closeAllPatientMenus(); ${createProformaCallback}" style="width:100%; text-align:left; padding:9px 14px; background:none; border:none; cursor:pointer; font-size:0.82rem; font-weight:700; color:var(--accent-teal); display:flex; align-items:center; gap:8px; border-bottom:1px solid var(--border-color);">
                            📊 Créer Proforma
                        </button>
                        <button class="patient-menu-item" onclick="closeAllPatientMenus(); ${createDocCallback}" style="width:100%; text-align:left; padding:9px 14px; background:none; border:none; cursor:pointer; font-size:0.82rem; font-weight:700; color:var(--accent-blue); display:flex; align-items:center; gap:8px; border-bottom:1px solid var(--border-color);">
                            📋 Créer Rapport
                        </button>
                        <button class="patient-menu-item" onclick="closeAllPatientMenus(); ${openDmeCallback}" style="width:100%; text-align:left; padding:9px 14px; background:none; border:none; cursor:pointer; font-size:0.82rem; font-weight:700; color:var(--text-primary); display:flex; align-items:center; gap:8px; border-bottom:1px solid var(--border-color);">
                            📂 Dossier DME
                        </button>
                        <button class="patient-menu-item" onclick="closeAllPatientMenus(); openEditPatientModal('${p.name.replace(/'/g, "\\'")}');" style="width:100%; text-align:left; padding:9px 14px; background:none; border:none; cursor:pointer; font-size:0.82rem; font-weight:700; color:var(--accent-gold); display:flex; align-items:center; gap:8px; border-bottom:1px solid var(--border-color);">
                            ✏️ Modifier
                        </button>
                        <button class="patient-menu-item" onclick="closeAllPatientMenus(); deletePatient('${p.name.replace(/'/g, "\\'")}');" style="width:100%; text-align:left; padding:9px 14px; background:none; border:none; cursor:pointer; font-size:0.82rem; font-weight:700; color:#e53e3e; display:flex; align-items:center; gap:8px;">
                            🗑️ Supprimer
                        </button>
                    </div>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
    

    renderPatientsPagination(totalItems);
}
window.renderPatientsTable = renderPatientsTable;

// ── Gestion du menu kebab (···) des patients ──
function togglePatientMenu(btn, event) {
    event.stopPropagation();
    let dropdown = btn._dropdown;
    if (!dropdown || !document.body.contains(dropdown)) {
        dropdown = btn.nextElementSibling || btn.parentElement.querySelector('.patient-action-dropdown');
        if (dropdown) {
            btn._dropdown = dropdown;
            dropdown._originalParent = btn.parentElement;
        }
    }
    if (!dropdown) return;
    
    const isOpen = dropdown.dataset.open === '1';
    closeAllPatientMenus(true);
    if (!isOpen) {
        // Teleport to body to bypass containment context limitations (transforms, filters, etc.)
        if (dropdown.parentElement !== document.body) {
            document.body.appendChild(dropdown);
        }
        
        const rect = btn.getBoundingClientRect();
        
        // Record scroll position
        const tableContainer = dropdown._originalParent ? dropdown._originalParent.closest('.table-container') : null;
        dropdown.dataset.openTableScrollTop = tableContainer ? tableContainer.scrollTop : 0;
        dropdown.dataset.openTableScrollLeft = tableContainer ? tableContainer.scrollLeft : 0;
        dropdown.dataset.openScrollTop = window.scrollY || document.documentElement.scrollTop;
        dropdown.dataset.openScrollLeft = window.scrollX || document.documentElement.scrollLeft;

        dropdown.style.display = 'block';
        dropdown.style.position = 'fixed';
        dropdown.style.top = (rect.bottom + 4) + 'px';
        
        const MENU_W = 210;
        dropdown.style.width = MENU_W + 'px';
        
        let left = rect.right - MENU_W;
        if (left < 8) left = 8;
        if (left + MENU_W > window.innerWidth - 8) left = window.innerWidth - MENU_W - 8;
        
        dropdown.style.left = left + 'px';
        dropdown.style.right = 'auto';
        dropdown.style.zIndex = '99999';
        dropdown.dataset.open = '1';
        dropdown.dataset.justOpened = '1';
        setTimeout(() => { dropdown.dataset.justOpened = '0'; }, 250);
        btn.style.background = 'var(--border-color)';
    }
}
window.togglePatientMenu = togglePatientMenu;

function closeAllPatientMenus(force) {
    document.querySelectorAll('.patient-action-dropdown').forEach(d => {
        if (!force && d.dataset.open === '1') {
            const openTop = parseFloat(d.dataset.openScrollTop || 0);
            const openLeft = parseFloat(d.dataset.openScrollLeft || 0);
            const currentTop = window.scrollY || document.documentElement.scrollTop;
            const currentLeft = window.scrollX || document.documentElement.scrollLeft;
            
            const tableContainer = d._originalParent ? d._originalParent.closest('.table-container') : null;
            const currentTableTop = tableContainer ? tableContainer.scrollTop : 0;
            const currentTableLeft = tableContainer ? tableContainer.scrollLeft : 0;
            
            const openTableTop = parseFloat(d.dataset.openTableScrollTop || 0);
            const openTableLeft = parseFloat(d.dataset.openTableScrollLeft || 0);
            
            const diffWin = Math.abs(currentTop - openTop) + Math.abs(currentLeft - openLeft);
            const diffTable = Math.abs(currentTableTop - openTableTop) + Math.abs(currentTableLeft - openTableLeft);
            
            if (diffWin < 15 && diffTable < 15) {
                // Scroll insignifiant, on ne ferme pas !
                return;
            }
        }

        if (d.dataset.justOpened === '1') return;
        d.style.display = 'none';
        d.style.position = '';
        d.style.top = '';
        d.style.left = '';
        d.style.right = '';
        d.style.width = '';
        d.style.zIndex = '';
        d.dataset.open = '0';
        
        // Put back to original parent to maintain DOM integrity when page re-renders/destroys, or remove if orphan
        if (d._originalParent) {
            if (document.body.contains(d._originalParent)) {
                if (d.parentElement !== d._originalParent) {
                    d._originalParent.appendChild(d);
                }
            } else {
                d.remove();
            }
        }
    });
    document.querySelectorAll('.patient-kebab-btn').forEach(b => {
        b.style.background = '';
    });
}
window.closeAllPatientMenus = closeAllPatientMenus;

// Fermer en cliquant ailleurs ou en scrollant
document.addEventListener('click', function(e) {
    if (e.target.closest('.patient-action-dropdown') || e.target.closest('.patient-action-menu-wrap')) return;
    closeAllPatientMenus(true);
});
window.addEventListener('scroll', () => closeAllPatientMenus(false), { passive: true });
document.addEventListener('scroll', () => closeAllPatientMenus(false), { capture: true, passive: true });



// Rendu de la pagination du module Patients
function renderPatientsPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / patientsPageSize) || 1;
    const paginationBar = document.getElementById('patients-pagination-controls');
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
    prevBtn.innerHTML = '← Précédent';
    prevBtn.disabled = patientsCurrentPage === 1;
    prevBtn.onclick = () => {
        if (patientsCurrentPage > 1) {
            patientsCurrentPage--;
            renderPatientsTable();
        }
    };

    // Label de la page active
    const pageLabel = document.createElement('span');
    pageLabel.style.fontSize = '0.8rem';
    pageLabel.style.fontWeight = '700';
    pageLabel.style.color = 'var(--text-secondary)';
    pageLabel.textContent = `Page ${patientsCurrentPage} sur ${totalPages}`;

    // Bouton Suivant
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-secondary btn-small';
    nextBtn.style.padding = '6px 12px';
    nextBtn.innerHTML = 'Suivant →';
    nextBtn.disabled = patientsCurrentPage === totalPages;
    nextBtn.onclick = () => {
        if (patientsCurrentPage < totalPages) {
            patientsCurrentPage++;
            renderPatientsTable();
        }
    };

    paginationBar.appendChild(prevBtn);
    paginationBar.appendChild(pageLabel);
    paginationBar.appendChild(nextBtn);
}
window.renderPatientsPagination = renderPatientsPagination;

// ============================================================
// SUPPRESSION D'UN PATIENT (DOUBLON / ERREUR DE SAISIE)
// ============================================================
async function deletePatient(patientName) {
    const nameUpper = patientName.trim().toUpperCase();
    
    if (!await confirm(`⚠️ Voulez-vous vraiment supprimer le patient "${patientName}" ?\n\nSes factures et documents ne seront pas supprimés, seule la fiche patient sera retirée de la base.`)) {
        return;
    }
    
    let removedFromDB = false;
    let removedFromCustom = false;
    
    // 1. Retirer de window.MercyFiatDB.PATIENTS
    const db = window.MercyFiatDB;
    if (db && db.PATIENTS) {
        const idx = db.PATIENTS.findIndex(p => p.name.trim().toUpperCase() === nameUpper);
        if (idx !== -1) {
            db.PATIENTS.splice(idx, 1);
            if (db.savePatients) db.savePatients();
            removedFromDB = true;
        }
    }
    
    // 2. Retirer de mercyfiat_custom_patients (localStorage)
    const customPatients = JSON.parse(localStorage.getItem('mercyfiat_custom_patients')) || [];
    const cIdx = customPatients.findIndex(p => p.name.trim().toUpperCase() === nameUpper);
    if (cIdx !== -1) {
        customPatients.splice(cIdx, 1);
        localStorage.setItem('mercyfiat_custom_patients', JSON.stringify(customPatients));
        removedFromCustom = true;
    }
    
    if (removedFromDB || removedFromCustom) {
        if (typeof showNotificationToast === 'function') {
            showNotificationToast(`🗑️ Patient "${patientName}" supprimé de la base.`);
        }
        renderPatientsTable();
    } else {
        alert(`Patient "${patientName}" introuvable dans la base.`);
    }
}
window.deletePatient = deletePatient;

// Préremplissage Facture Proforma
function createPatientPrefilledProforma(name, age, diagnosis, intervention, kCode, insurer, coverage, matricule) {
    if (typeof switchSubSection === 'function') switchSubSection('billing', 'proforma');
    
    setTimeout(() => {
        const nomInput = document.getElementById('bill-patient-nom');
        const prenomInput = document.getElementById('bill-patient-prenom');
        const ageInput = document.getElementById('bill-patient-age');
        const diagInput = document.getElementById('bill-patient-diagnostic');
        const insurerInput = document.getElementById('bill-insurer-select');
        const coverageInput = document.getElementById('bill-coverage-rate');
        const matriculeInput = document.getElementById('bill-patient-matricule');
        
        const parts = name.trim().split(' ');
        const nom = parts[0] || name;
        const prenom = parts.slice(1).join(' ') || '';
        
        if (nomInput) nomInput.value = nom;
        if (prenomInput) prenomInput.value = prenom;
        if (ageInput) ageInput.value = age;
        if (diagInput) diagInput.value = diagnosis;
        if (insurerInput) {
            insurerInput.value = insurer || 'PRIVE';
            if (typeof handleBillInsurerChange === 'function') handleBillInsurerChange();
        }
        if (coverageInput && coverage !== undefined) coverageInput.value = coverage;
        if (matriculeInput) matriculeInput.value = matricule || '';
        
        if (intervention) {
            const itemInput = document.getElementById('bill-search-items-input');
            if (itemInput) itemInput.value = intervention;
            if (typeof autoFillKCodeFromIntervention === 'function') {
                autoFillKCodeFromIntervention(intervention);
            }
        }
        if (typeof showNotificationToast === 'function') showNotificationToast('📊 Facture Proforma pré-remplie avec succès');
    }, 150);
}
window.createPatientPrefilledProforma = createPatientPrefilledProforma;

// Préremplissage Rapport Clinique
function createPatientPrefilledDoc(name, age, diagnosis, intervention, kCode) {
    const isCro = intervention && (intervention.toLowerCase().includes('ostéosynthèse') || intervention.toLowerCase().includes('ligamentoplastie') || intervention.toLowerCase().includes('ablation') || intervention.toLowerCase().includes('cro') || intervention.toLowerCase().includes('prothèse') || intervention.toLowerCase().includes('cure'));
    const subType = isCro ? 'cro' : 'consult';
    if (typeof switchSubSection === 'function') switchSubSection('documents', subType);
    
    setTimeout(() => {
        const nomInput = document.getElementById('doc-patient-nom');
        const prenomInput = document.getElementById('doc-patient-prenom');
        const ageInput = document.getElementById('doc-patient-age');
        const diagInput = document.getElementById('doc-diagnostique');
        const intervInput = document.getElementById('doc-intervention');
        
        const parts = name.trim().split(' ');
        const nom = parts[0] || name;
        const prenom = parts.slice(1).join(' ') || '';
        
        if (nomInput) nomInput.value = nom;
        if (prenomInput) prenomInput.value = prenom;
        if (ageInput) ageInput.value = age;
        if (diagInput) diagInput.value = diagnosis;
        if (intervInput) intervInput.value = intervention;
        
        if (typeof showNotificationToast === 'function') showNotificationToast('📋 Rapport Médical pré-rempli avec succès');
    }, 150);
}
window.createPatientPrefilledDoc = createPatientPrefilledDoc;
