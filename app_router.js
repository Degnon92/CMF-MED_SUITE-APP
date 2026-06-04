/* ============================================================
   app_router.js - Routage et Navigation SPA de l'application
   ============================================================ */

// Routage simple des sections (SPA)
function switchSection(sectionId) {
    if (sectionId === 'billing') {
        switchSubSection('billing', window.activeBillingSubSection || 'proforma');
        return;
    } else if (sectionId === 'documents') {
        switchSubSection('documents', window.activeDocumentsSubSection || 'cro');
        return;
    }

    if (!window.isPerformingBackNavigation) {
        const currentState = typeof getCurrentNavigationState === 'function' ? getCurrentNavigationState() : null;
        if (currentState && currentState.sectionId !== sectionId) {
            if (!window.navigationHistory) window.navigationHistory = [];
            window.navigationHistory.push(currentState);
            if (window.navigationHistory.length > 20) {
                window.navigationHistory.shift();
            }
        }
    }

    // Retirer la classe active de tous les onglets de navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Ajouter la classe active à l'onglet cliqué
    const activeItem = document.getElementById(`nav-${sectionId}`);
    if (activeItem) {
        activeItem.classList.add('active');
    } else {
        // Fallback par recherche textuelle si ID manquant
        const clickedItem = Array.from(document.querySelectorAll('.nav-item')).find(item => {
            return item.textContent.includes(
                sectionId === 'dashboard' ? 'Tableau de Bord' : (sectionId === 'patients' ? 'Patients' : 'Registre Général')
            );
        });
        if (clickedItem) clickedItem.classList.add('active');
    }
    
    // Retirer la classe active de toutes les sections de contenu
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Afficher la section active
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) targetSection.classList.add('active');
    
    // Mettre à jour le titre de l'en-tête de page
    const title = document.getElementById('page-title');
    const subtitle = document.getElementById('page-subtitle');
    
    if (sectionId === 'dashboard') {
        if (title) title.textContent = "Tableau de Bord";
        if (subtitle) subtitle.textContent = "Aperçu général de votre activité clinique et comptable.";
        if (typeof updateDashboardStats === 'function') updateDashboardStats();
        if (typeof renderRecentActivity === 'function') renderRecentActivity();
        if (typeof processConvalescenceAlerts === 'function') processConvalescenceAlerts();
        if (typeof renderAnalyticsCharts === 'function') renderAnalyticsCharts();
    } else if (sectionId === 'register') {
        if (title) title.textContent = "Registre Clinique Général";
        if (subtitle) subtitle.textContent = "Historique centralisé de tous vos documents et fiches de facturation.";
        if (typeof renderRegisterTable === 'function') renderRegisterTable();
    } else if (sectionId === 'patients') {
        if (title) title.textContent = "Dossiers Patientèle";
        if (subtitle) subtitle.textContent = "Base consolidée et assainie de tous vos patients uniques.";
        if (typeof renderPatientsTable === 'function') renderPatientsTable();
    }
    
    if (typeof updateBackButtonVisibility === 'function') {
        updateBackButtonVisibility();
    }
}
window.switchSection = switchSection;

// Routage hiérarchique et personnalisé par sous-module (SPA)
function switchSubSection(moduleName, subType) {
    if (!window.isPerformingBackNavigation) {
        const currentState = typeof getCurrentNavigationState === 'function' ? getCurrentNavigationState() : null;
        if (currentState && (currentState.sectionId !== moduleName || currentState.state.subSection !== subType)) {
            if (!window.navigationHistory) window.navigationHistory = [];
            window.navigationHistory.push(currentState);
            if (window.navigationHistory.length > 20) {
                window.navigationHistory.shift();
            }
        }
    }

    // 1. Gérer l'état actif dans la Sidebar du sous-module
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    let activeSubId = `nav-${moduleName}-${subType}`;
    if (moduleName === 'billing' && (subType === 'detail' || subType === 'assurance')) {
        activeSubId = 'nav-billing-assurance';
    }
    
    const activeItem = document.getElementById(activeSubId);
    if (activeItem) {
        activeItem.classList.add('active');
    }
    
    // Mémoriser le sous-onglet actif dans window pour la restauration lors des switchs
    if (moduleName === 'billing') {
        window.activeBillingSubSection = subType;
    } else if (moduleName === 'documents') {
        window.activeDocumentsSubSection = subType;
    }
    
    // 2. Afficher la section de contenu correspondante (billing-section ou documents-section)
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    const targetSection = document.getElementById(`${moduleName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // 3. Mettre à jour le titre de l'en-tête de page (visuel global)
    const title = document.getElementById('page-title');
    const subtitle = document.getElementById('page-subtitle');
    
    // 4. Mettre à jour le sélecteur type dans l'éditeur
    if (moduleName === 'billing') {
        const typeSelect = document.getElementById('bill-type');
        if (typeSelect) {
            typeSelect.value = subType === 'proforma' ? 'PROFORMA' : ((subType === 'detail' || subType === 'assurance') ? 'DETAIL_ASSUR' : 'DEFINITIF');
            // Déclencher le change pour les hooks de masquage
            if (typeof handleBillTypeChange === 'function') {
                handleBillTypeChange();
            }
        }
        
        // Ajuster le titre de l'éditeur de factures et l'en-tête de page
        const formTitle = document.getElementById('billing-form-title');
        const formDesc = document.getElementById('billing-form-desc');
        
        if (subType === 'proforma') {
            if (title) title.textContent = "Facture Proforma";
            if (subtitle) subtitle.textContent = "Établissez une estimation détaillée des soins pour accord préalable de l'assurance.";
            if (formTitle) formTitle.textContent = "Création de Facture Proforma";
            if (formDesc) formDesc.textContent = "Établissez une estimation détaillée des soins pour accord préalable de l'assurance.";
        } else if (subType === 'detail' || subType === 'assurance') {
            if (title) title.textContent = "Prise en Charge Assurance";
            if (subtitle) subtitle.textContent = "Générez un relevé de facturation avec part patient et part assurance.";
            if (formTitle) formTitle.textContent = "Détail de Facturation Assurance";
            if (formDesc) formDesc.textContent = "Générez un relevé détaillé de facturation destiné aux remboursements de la compagnie.";
        } else if (subType === 'definitif') {
            if (title) title.textContent = "Point d'Hospitalisation";
            if (subtitle) subtitle.textContent = "Validez les frais de séjour et d'actes pour la facture finale de sortie.";
            if (formTitle) formTitle.textContent = "Point Définitif d'Hospitalisation";
            if (formDesc) formDesc.textContent = "Validez les frais de séjour et d'actes pour sortie du patient de la clinique.";
        }
        
        // Rafraîchir l'aperçu de facturation
        if (typeof updateBillPreview === 'function') {
            updateBillPreview();
        }
    } 
    else if (moduleName === 'documents') {
        // Toggles visuels des conteneurs de saisie
        const fieldsToToggle = {
            'field-motif': ['hospi', 'consult'],
            'field-date-consult': ['consult'],
            'field-insurer': ['hospi', 'consult', 'certif'],
            'field-sinistre': ['hospi', 'consult', 'certif'],
            'field-date-entree': ['hospi'],
            'field-date-sortie': ['hospi'],
            'field-date-intervention': ['cro', 'hospi'],
            'field-date-prolongation': ['certif'],
            'field-intervention': ['cro', 'hospi'],
            'field-hospi-days': ['hospi'],
            'field-convalescence': ['hospi', 'certif'],
            'field-rappel': ['cro', 'hospi'],
            'field-examen': ['cro', 'hospi', 'consult'],
            'field-conclusion': ['cro', 'hospi', 'consult'],
            'block-recommandations': ['hospi', 'consult'],
            'block-etat-actuel': ['certif'],
            'block-justification': ['certif']
        };
        
        Object.keys(fieldsToToggle).forEach(fieldId => {
            const el = document.getElementById(fieldId);
            if (el) {
                const supportedTypes = fieldsToToggle[fieldId];
                if (supportedTypes.includes(subType)) {
                    el.style.display = (fieldId === 'field-insurer') ? 'grid' : 'block';
                } else {
                    el.style.display = 'none';
                }
            }
        });
        
        if (subType === 'cro') {
            if (title) title.textContent = "Comptes-Rendus Opératoires (CRO)";
            if (subtitle) subtitle.textContent = "Saisie ciblée pour vos protocoles opératoires et fiches de chirurgie.";
        } else if (subType === 'hospi') {
            if (title) title.textContent = "Rapports d'Hospitalisation";
            if (subtitle) subtitle.textContent = "Résumés de séjours hospitaliers et demandes de prolongation.";
        } else if (subType === 'consult') {
            if (title) title.textContent = "Rapports de Consultation";
            if (subtitle) subtitle.textContent = "Notes cliniques de consultation initiale et de suivi post-opératoire.";
        } else if (subType === 'certif') {
            if (title) title.textContent = "Certificats & Correspondances";
            if (subtitle) subtitle.textContent = "Certificats d'arrêt de travail, repos médical, reprises et relances d'assurances.";
        }
        
        // Mettre à jour l'aperçu
        if (typeof updateDocPreview === 'function') {
            updateDocPreview();
        }
    }

    if (typeof updateBackButtonVisibility === 'function') {
        updateBackButtonVisibility();
    }
}
window.switchSubSection = switchSubSection;

// ============================================================
// GESTION DE L'HISTORIQUE DE NAVIGATION ET DE L'ÉTAT (RETOUR)
// ============================================================
window.navigationHistory = [];
window.isPerformingBackNavigation = false;

function getCurrentNavigationState() {
    const activeSectionEl = document.querySelector('.content-section.active');
    if (!activeSectionEl) return null;
    
    const sectionId = activeSectionEl.id.replace('-section', '');
    let state = {};
    
    if (sectionId === 'register') {
        state = {
            tab: window.currentRegisterTab || 'ALL',
            subFilter: window.currentRegisterSubFilter || 'ALL',
            page: window.registerCurrentPage || 1,
            search: document.getElementById('register-search')?.value || ''
        };
    } else if (sectionId === 'patients') {
        state = {
            page: window.patientsCurrentPage || 1,
            search: document.getElementById('patients-search')?.value || ''
        };
    } else if (sectionId === 'billing') {
        state = {
            subSection: window.activeBillingSubSection || 'proforma'
        };
    } else if (sectionId === 'documents') {
        state = {
            subSection: window.activeDocumentsSubSection || 'cro'
        };
    }
    
    return {
        sectionId: sectionId,
        state: state
    };
}
window.getCurrentNavigationState = getCurrentNavigationState;

function restoreNavigationState(historyEntry) {
    const { sectionId, state } = historyEntry;
    
    if (sectionId === 'register') {
        window.currentRegisterTab = state.tab || 'ALL';
        window.currentRegisterSubFilter = state.subFilter || 'ALL';
        window.registerCurrentPage = state.page || 1;
        
        const searchInput = document.getElementById('register-search');
        if (searchInput) {
            searchInput.value = state.search || '';
        }
        
        // Mettre à jour visuellement les onglets
        document.querySelectorAll('.register-tab').forEach(t => {
            t.classList.remove('active');
            if (t.getAttribute('onclick') && t.getAttribute('onclick').includes(`'${state.tab}'`)) {
                t.classList.add('active');
            }
        });
        
        // Mettre à jour visuellement les sous-filtres
        const subFilters = document.getElementById('register-sub-filters');
        if (subFilters) {
            subFilters.style.display = state.tab === 'ARCHIVES' ? 'flex' : 'none';
            subFilters.querySelectorAll('.register-sub-filter').forEach(f => {
                f.classList.remove('active');
                if (f.getAttribute('onclick') && f.getAttribute('onclick').includes(`'${state.subFilter}'`)) {
                    f.classList.add('active');
                }
            });
        }
    } else if (sectionId === 'patients') {
        window.patientsCurrentPage = state.page || 1;
        
        const searchInput = document.getElementById('patients-search');
        if (searchInput) {
            searchInput.value = state.search || '';
        }
    }
    
    window.isPerformingBackNavigation = true;
    try {
        if (sectionId === 'billing' || sectionId === 'documents') {
            switchSubSection(sectionId, state.subSection);
        } else {
            switchSection(sectionId);
        }
    } finally {
        window.isPerformingBackNavigation = false;
    }
}
window.restoreNavigationState = restoreNavigationState;

function navigateBack() {
    if (!window.navigationHistory || window.navigationHistory.length === 0) return;
    const previousState = window.navigationHistory.pop();
    restoreNavigationState(previousState);
    updateBackButtonVisibility();
}
window.navigateBack = navigateBack;

function updateBackButtonVisibility() {
    const btn = document.getElementById('btn-back-nav');
    if (!btn) return;
    
    const activeSectionEl = document.querySelector('.content-section.active');
    const sectionId = activeSectionEl ? activeSectionEl.id.replace('-section', '') : '';
    
    const hasHistory = window.navigationHistory && window.navigationHistory.length > 0;
    const isEditorSection = sectionId === 'billing' || sectionId === 'documents';
    
    if (hasHistory && isEditorSection) {
        btn.style.display = 'inline-flex';
    } else {
        btn.style.display = 'none';
    }
}
window.updateBackButtonVisibility = updateBackButtonVisibility;
