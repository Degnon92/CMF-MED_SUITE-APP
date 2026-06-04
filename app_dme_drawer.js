/* ============================================================
   app_dme_drawer.js - Dossier Médical Patient & Convalescence
   ============================================================ */

// 1. Dossier médical patient 360 (DME Drawer)
function openPatientDMEDrawer(patientName) {
    window.activeDMEPatientName = patientName;
    const drawer = document.getElementById('patient-dme-drawer');
    if (!drawer) return;
    
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
    
    // Find patient in database to get age, diagnosis, intervention, kCode
    const dbPatientsList = (window.MercyFiatDB && window.MercyFiatDB.PATIENTS) || [];
    const dbPatient = dbPatientsList.find(p => areNamesMatching(p.name, patientName));
    
    const matchedBills = savedBills.filter(b => nameMatches(b.patientNom, b.patientPrenom));
    const matchedDocs = savedDocuments.filter(d => nameMatches(d.patientNom, d.patientPrenom));
    
    // Compute totals
    let totalBilled = matchedBills.reduce((sum, b) => sum + b.grossTotal, 0);
    let totalInsurance = matchedBills.reduce((sum, b) => sum + b.partAssurance, 0);
    let totalPatient = matchedBills.reduce((sum, b) => sum + b.partPatient, 0);
    
    // Set headers
    const avatarEl = document.getElementById('dme-patient-avatar');
    if (avatarEl) {
        const initials = patientName.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase();
        avatarEl.textContent = initials || "--";
    }
    
    const nameEl = document.getElementById('dme-patient-fullname');
    if (nameEl) nameEl.textContent = patientName.toUpperCase();
    
    // Get age
    let patientAge = "--";
    if (dbPatient && dbPatient.age) patientAge = dbPatient.age;
    if (patientAge === "--" && matchedDocs.length > 0) {
        const docWithAge = matchedDocs.find(d => d.patientAge && d.patientAge !== "--");
        if (docWithAge) patientAge = docWithAge.patientAge;
    }
    const ageEl = document.getElementById('dme-patient-age');
    if (ageEl) ageEl.textContent = `Âge: ${patientAge}`;
    
    // Diagnosis & Intervention
    let diagnosis = dbPatient ? (dbPatient.diagnosis || "N/A") : "N/A";
    if (diagnosis === "N/A" && matchedDocs.length > 0) {
        diagnosis = matchedDocs[0].diagnosis || "N/A";
    }
    const diagEl = document.getElementById('dme-patient-diagnosis');
    if (diagEl) diagEl.textContent = diagnosis;
    
    let intervention = dbPatient ? (dbPatient.intervention || "N/A") : "N/A";
    let kCode = dbPatient ? (dbPatient.kCode || "") : "";
    if (intervention === "N/A" && matchedBills.length > 0) {
        const surgItem = matchedBills[0].items.find(item => item.name.toLowerCase().includes('k'));
        if (surgItem) intervention = surgItem.name;
    }
    const intervEl = document.getElementById('dme-patient-intervention');
    if (intervEl) intervEl.textContent = intervention;
    
    const kCodeEl = document.getElementById('dme-patient-kcode');
    if (kCodeEl) {
        if (kCode) {
            kCodeEl.textContent = kCode;
            kCodeEl.style.display = 'inline-block';
        } else {
            kCodeEl.style.display = 'none';
        }
    }
    
    // Set financial numbers
    const formatFCFA = (val) => new Intl.NumberFormat('fr-FR').format(val) + " FCFA";
    const totalBilledEl = document.getElementById('dme-total-billed');
    const totalInsuranceEl = document.getElementById('dme-total-insurance');
    const totalPatientEl = document.getElementById('dme-total-patient');
    if (totalBilledEl) totalBilledEl.textContent = formatFCFA(totalBilled);
    if (totalInsuranceEl) totalInsuranceEl.textContent = formatFCFA(totalInsurance);
    if (totalPatientEl) totalPatientEl.textContent = formatFCFA(totalPatient);
    
    // Combine and sort events for timeline (bills + docs)
    const billEvents = matchedBills.map(b => {
        let title = "Facture";
        if (b.type === 'PROFORMA') title = "Facture Proforma";
        else if (b.type === 'ASSURANCE') title = "Prise en Charge";
        else if (b.type === 'DEFINITIF') title = "Point d'Hospitalisation";
        
        return {
            date: new Date(b.date),
            type: 'BILL',
            title: title,
            details: `${b.items.length} prestation(s) facturée(s)`,
            badge: '💵',
            amount: b.grossTotal,
            insurance: b.partAssurance,
            patient: b.partPatient,
            raw: b
        };
    });
    
    const docEvents = matchedDocs.map(d => {
        const catNames = {
            cro_lca: 'Compte-Rendu Opératoire (LCA)',
            cro_rtup: 'Compte-Rendu Opératoire (RTUP)',
            cro_cmf: 'Compte-Rendu Opératoire (Symphysaire)',
            certif_repos: 'Certificat de Repos Médical',
            certif_reprise: 'Certificat de Repise de Travail',
            rapport_cons: 'Rapport de Consultation',
            rapport_hospi: 'Rapport d\'Hospitalisation'
        };
        let badge = '📝';
        if (d.templateId.startsWith('cro_')) badge = '🩺';
        else if (d.templateId.startsWith('certif_')) badge = '⏱️';
        
        return {
            date: new Date(d.date),
            type: 'DOC',
            title: catNames[d.templateId] || 'Rapport Clinique',
            details: d.diagnosis ? `Diagnostic : ${d.diagnosis}` : `Document clinique rédigé`,
            badge: badge,
            raw: d
        };
    });
    
    const allEvents = [...billEvents, ...docEvents].sort((a, b) => b.date - a.date);
    
    const timelineContainer = document.getElementById('dme-timeline-container');
    if (timelineContainer) {
        timelineContainer.innerHTML = '';
        if (allEvents.length === 0) {
            timelineContainer.innerHTML = '<p style="font-style: italic; font-size: 0.78rem; color: var(--text-secondary); text-align: center; padding: 15px 0;">Aucune activité enregistrée pour ce patient.</p>';
        } else {
            allEvents.forEach(evt => {
                const item = document.createElement('div');
                item.className = 'dme-timeline-item';
                item.onclick = () => {
                    if (typeof viewRecentItem === 'function') {
                        viewRecentItem(evt.type, evt.raw.id);
                    }
                    closePatientDMEDrawer();
                };
                
                let amountHtml = '';
                let metaHtml = '';
                if (evt.type === 'BILL') {
                    amountHtml = `<span class="dme-timeline-amount">${formatFCFA(evt.amount)}</span>`;
                    metaHtml = `<span class="dme-timeline-meta">Patient: ${formatFCFA(evt.patient)} | Assur: ${formatFCFA(evt.insurance)}</span>`;
                } else {
                    metaHtml = `<span class="dme-timeline-meta">Rédigé par Dr Gipsy</span>`;
                }
                
                item.innerHTML = `
                    <div class="dme-timeline-badge">${evt.badge}</div>
                    <div class="dme-timeline-header">
                        <div class="dme-timeline-type">${evt.title}</div>
                        <div class="dme-timeline-date">${evt.date.toLocaleDateString('fr-FR')}</div>
                    </div>
                    <div class="dme-timeline-details">${evt.details}</div>
                    <div class="dme-timeline-footer">
                        ${metaHtml}
                        ${amountHtml}
                    </div>
                `;
                timelineContainer.appendChild(item);
            });
        }
    }
    
    // Open drawer
    drawer.style.display = 'flex';
    setTimeout(() => {
        drawer.classList.add('open');
    }, 10);
}
window.openPatientDMEDrawer = openPatientDMEDrawer;

function closePatientDMEDrawer() {
    const drawer = document.getElementById('patient-dme-drawer');
    if (!drawer) return;
    
    drawer.classList.remove('open');
    setTimeout(() => {
        drawer.style.display = 'none';
    }, 400);
}
window.closePatientDMEDrawer = closePatientDMEDrawer;

// 2. Convalescence Alerts
function processConvalescenceAlerts() {
    const container = document.getElementById('convalescence-alerts-container');
    const section = document.getElementById('convalescence-alerts-section');
    const badge = document.getElementById('alerts-count-badge');
    if (!container || !section) return;
    
    container.innerHTML = '';
    const alerts = [];
    const currentDate = new Date();
    
    // 1. Analyser les arrêts de travail (certif_repos)
    savedDocuments.forEach(doc => {
        if (doc.templateId === 'certif_repos') {
            const startDate = new Date(doc.date);
            const duration = parseDuration(doc.content || doc.text || '');
            const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);
            
            const timeDiff = endDate - currentDate;
            const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            
            if (daysRemaining >= -3 && daysRemaining <= 15) {
                let alertClass = 'alert-orange';
                let alertTitle = 'Convalescence Active';
                
                if (daysRemaining <= 3 && daysRemaining >= 0) {
                    alertClass = 'alert-green';
                    alertTitle = 'Reprise Imminente';
                } else if (daysRemaining < 0) {
                    alertClass = 'alert-red';
                    alertTitle = 'Date de Reprise Dépassée';
                }
                
                alerts.push({
                    type: 'repos',
                    patientNom: doc.patientNom,
                    patientPrenom: doc.patientPrenom,
                    patientAge: doc.patientAge,
                    title: alertTitle,
                    class: alertClass,
                    desc: daysRemaining < 0 
                        ? `L'arrêt de convalescence s'est terminé il y a ${Math.abs(daysRemaining)} jour(s) (le ${endDate.toLocaleDateString('fr-FR')}).`
                        : `En arrêt de travail pour encore ${daysRemaining} jour(s). Date de reprise prévue : ${endDate.toLocaleDateString('fr-FR')}.`,
                    actionText: 'Préparer la Reprise',
                    actionCallback: () => prepareReprise(doc.patientNom, doc.patientPrenom, doc.patientAge)
                });
            }
        }
    });
    
    // 2. Analyser les rapports cliniques pour les contrôles post-opératoires
    savedDocuments.forEach(doc => {
        if (doc.templateId && doc.templateId.startsWith('cro_')) {
            const opDate = new Date(doc.date);
            const timeDiff = currentDate - opDate;
            const daysPostOp = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            
            // J+15 contrôle
            if (daysPostOp >= 12 && daysPostOp <= 17) {
                alerts.push({
                    type: 'control15',
                    patientNom: doc.patientNom,
                    patientPrenom: doc.patientPrenom,
                    patientAge: doc.patientAge,
                    title: 'Contrôle Radiologique J+15',
                    class: 'alert-red',
                    desc: `Patient à J+${daysPostOp} post-opératoire. Planifier la radiographie de contrôle et le premier bilan de kinésithérapie.`,
                    actionText: 'Rédiger Bilan',
                    actionCallback: () => prepareControl(doc.patientNom, doc.patientPrenom, doc.patientAge, `Bilan Post-Opératoire J+15 - Suite de chirurgie.`)
                });
            }
            
            // J+30 contrôle
            if (daysPostOp >= 27 && daysPostOp <= 32) {
                alerts.push({
                    type: 'control30',
                    patientNom: doc.patientNom,
                    patientPrenom: doc.patientPrenom,
                    patientAge: doc.patientAge,
                    title: 'Bilan Clinique J+30',
                    class: 'alert-red',
                    desc: `Patient à J+${daysPostOp} post-opératoire. Consultation de suivi nécessaire pour évaluer la récupération fonctionnelle complète.`,
                    actionText: 'Rédiger Bilan',
                    actionCallback: () => prepareControl(doc.patientNom, doc.patientPrenom, doc.patientAge, `Consultation de Contrôle J+30 - Évaluation fonctionnelle.`)
                });
            }
        }
    });
    
    const classPriority = { 'alert-red': 1, 'alert-green': 2, 'alert-orange': 3 };
    alerts.sort((a, b) => classPriority[a.class] - classPriority[b.class]);
    
    if (alerts.length === 0) {
        section.style.display = 'none';
        if (badge) badge.textContent = '0 alerte active';
    } else {
        section.style.display = 'flex';
        if (badge) badge.textContent = `${alerts.length} alerte(s) active(s)`;
        
        alerts.forEach(alert => {
            const card = document.createElement('div');
            card.className = `alert-card ${alert.class}`;
            card.innerHTML = `
                <div class="alert-header">
                    <span class="alert-title">${alert.title}</span>
                    <span style="font-size: 1.1rem;">${alert.class === 'alert-red' ? '🚨' : alert.class === 'alert-green' ? '✅' : '⏳'}</span>
                </div>
                <div class="alert-patient">${alert.patientNom} ${alert.patientPrenom}</div>
                <div class="alert-desc">${alert.desc}</div>
                <div class="alert-actions">
                    <button class="btn btn-secondary btn-small" style="font-size:0.75rem; font-weight:700; border-color:var(--border-color);">${alert.actionText}</button>
                </div>
            `;
            
            const btn = card.querySelector('button');
            if (btn) {
                btn.addEventListener('click', alert.actionCallback);
            }
            
            container.appendChild(card);
        });
    }
}
window.processConvalescenceAlerts = processConvalescenceAlerts;

function parseDuration(text) {
    const matchParens = text.match(/\((\d+)\)\s*(jours|JOURS|Jours)/i);
    if (matchParens) return parseInt(matchParens[1]);
    
    const matchSimple = text.match(/Durée\s*:\s*(\d+)/i);
    if (matchSimple) return parseInt(matchSimple[1]);
    
    const matchJours = text.match(/(\d+)\s*(jours|JOURS)/i);
    if (matchJours) return parseInt(matchJours[1]);
    
    return 21;
}
window.parseDuration = parseDuration;

function prepareReprise(nom, prenom, age) {
    if (typeof switchSection === 'function') switchSection('documents');
    
    const select = document.getElementById('doc-template');
    if (select) {
        select.value = 'certif_reprise';
        if (typeof loadDocumentTemplate === 'function') loadDocumentTemplate();
    }
    
    document.getElementById('doc-patient-nom').value = nom;
    document.getElementById('doc-patient-prenom').value = prenom;
    document.getElementById('doc-patient-age').value = age;
    
    if (typeof updateDocPreview === 'function') updateDocPreview();
}
window.prepareReprise = prepareReprise;

function prepareControl(nom, prenom, age, initialText) {
    if (typeof switchSection === 'function') switchSection('documents');
    
    const select = document.getElementById('doc-template');
    if (select) {
        select.value = 'rapport_cons';
        if (typeof loadDocumentTemplate === 'function') loadDocumentTemplate();
    }
    
    document.getElementById('doc-patient-nom').value = nom;
    document.getElementById('doc-patient-prenom').value = prenom;
    document.getElementById('doc-patient-age').value = age;
    
    const diagInput = document.getElementById('doc-diagnostique');
    if (diagInput) diagInput.value = initialText;
    
    if (typeof updateDocPreview === 'function') updateDocPreview();
}
window.prepareControl = prepareControl;
