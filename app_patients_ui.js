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
            age: p.age || '45 ans',
            matricule: p.matricule || '',
            insurer: p.insurer || 'PRIVE',
            priseEnCharge: p.priseEnCharge || 0
        });
    });
    
    // Fusionner les patients personnalisés
    customPatients.forEach(p => {
        const cleaned = window.cleanPatientName ? window.cleanPatientName(p.name) : p.name.trim().toUpperCase();
        if (!cleaned || cleaned.length < 3) return;
        if (!allPatientsMap.has(cleaned) || (p.intervention && !allPatientsMap.get(cleaned).intervention)) {
            allPatientsMap.set(cleaned, {
                name: cleaned,
                diagnosis: (p.diagnosis && p.diagnosis.toLowerCase() !== 'bilan clinique') ? p.diagnosis : '',
                intervention: p.intervention || '',
                kCode: p.kCode || '',
                age: p.age || '35 ans',
                matricule: p.matricule || '',
                insurer: p.insurer || 'PRIVE',
                priseEnCharge: p.priseEnCharge || 0
            });
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
        tr.innerHTML = `
            <td>
                <strong onclick="${openDmeCallback}" class="patient-link" title="${p.name}" style="display:inline-flex; align-items:center; gap:8px;">
                    <span class="patient-avatar" style="background:var(--accent-teal); color:white;">${initials}</span>
                    <span>${p.name}</span>
                </strong>
                <div style="font-size:0.75rem; color:var(--text-secondary); margin-left:36px; margin-top:2px;">
                    🎂 ${p.age || 'Age non renseigné'} &nbsp;|&nbsp; 🛡️ ${p.insurer || 'PRIVE'}
                </div>
            </td>
            <td><span style="font-size:0.85rem; color:var(--text-secondary);">${p.diagnosis || '-'}</span></td>
            <td><span style="font-size:0.85rem; font-weight:600; color:var(--accent-teal);">${p.intervention || '-'}</span></td>
            <td>${p.kCode ? `<span class="badge info" style="font-family:monospace; font-weight:700;">${p.kCode}</span>` : '-'}</td>
            <td>
                <div style="display:flex; gap:8px; justify-content:center;">
                    <button class="btn btn-secondary btn-small" onclick="${createProformaCallback}" style="padding:6px 10px; font-size:0.75rem; font-weight:700; border-color:var(--accent-teal); color:var(--accent-teal); display:flex; align-items:center; gap:4px;">
                        <span>📊 Créer Proforma</span>
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="${createDocCallback}" style="padding:6px 10px; font-size:0.75rem; font-weight:700; border-color:var(--accent-blue); color:var(--accent-blue); display:flex; align-items:center; gap:4px;">
                        <span>📋 Créer Rapport</span>
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="${openDmeCallback}" style="padding:6px 10px; font-size:0.75rem; font-weight:700; display:flex; align-items:center; gap:4px;">
                        <span>📂 Dossier DME</span>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
    
    renderPatientsPagination(totalItems);
}
window.renderPatientsTable = renderPatientsTable;

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

// Préremplissage Facture Proforma
function createPatientPrefilledProforma(name, age, diagnosis, intervention, kCode, insurer, coverage, matricule) {
    if (typeof switchSubSection === 'function') switchSubSection('billing', 'proforma');
    
    setTimeout(() => {
        const nomInput = document.getElementById('bill-patient-nom');
        const ageInput = document.getElementById('bill-patient-age');
        const diagInput = document.getElementById('bill-patient-diagnostic');
        const insurerInput = document.getElementById('bill-insurer-select');
        const coverageInput = document.getElementById('bill-coverage-rate');
        const matriculeInput = document.getElementById('bill-patient-matricule');
        
        if (nomInput) nomInput.value = name;
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
        const ageInput = document.getElementById('doc-patient-age');
        const diagInput = document.getElementById('doc-patient-diag');
        
        if (nomInput) nomInput.value = name;
        if (ageInput) ageInput.value = age;
        if (diagInput) diagInput.value = diagnosis;
        
        const intervInput = document.getElementById('doc-patient-interv') || document.getElementById('doc-intervention-nomenclature');
        if (intervInput) intervInput.value = intervention;
        
        if (typeof showNotificationToast === 'function') showNotificationToast('📋 Rapport Médical pré-rempli avec succès');
    }, 150);
}
window.createPatientPrefilledDoc = createPatientPrefilledDoc;
