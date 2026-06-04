/* ============================================================
   app_ui_helpers.js - Alertes Premium, Thèmes & Configurations
   ============================================================ */

(function() {
    // Injecter les styles CSS pour le modal d'alerte premium
    const style = document.createElement('style');
    style.innerHTML = `
        .custom-alert-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(45, 55, 72, 0.4);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100000;
            opacity: 0;
            transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .custom-alert-overlay.show {
            opacity: 1;
        }
        .custom-alert-card {
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.05);
            width: 90%;
            max-width: 440px;
            padding: 24px;
            border: 1px solid rgba(234, 230, 223, 0.8);
            transform: scale(0.9) translateY(20px);
            transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .custom-alert-overlay.show .custom-alert-card {
            transform: scale(1) translateY(0);
        }
        .custom-alert-header {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .custom-alert-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .custom-alert-icon.success {
            background-color: rgba(56, 178, 172, 0.12);
            color: #319795;
        }
        .custom-alert-icon.error {
            background-color: rgba(212, 139, 123, 0.12);
            color: #c53030;
        }
        .custom-alert-icon.warning {
            background-color: rgba(221, 107, 32, 0.12);
            color: #dd6b20;
        }
        .custom-alert-icon.info {
            background-color: rgba(74, 111, 165, 0.12);
            color: #4a6fa5;
        }
        .custom-alert-title {
            font-family: 'Outfit', 'Inter', sans-serif;
            font-size: 1.15rem;
            font-weight: 800;
            color: #2d3748;
            letter-spacing: 0.3px;
        }
        .custom-alert-body {
            font-family: 'Inter', sans-serif;
            font-size: 0.88rem;
            line-height: 1.55;
            color: #4a5568;
            white-space: pre-line;
            max-height: 250px;
            overflow-y: auto;
            padding-right: 4px;
        }
        .custom-alert-actions {
            display: flex;
            justify-content: flex-end;
            margin-top: 4px;
        }
        .custom-alert-btn {
            font-family: 'Inter', sans-serif;
            font-size: 0.82rem;
            font-weight: 700;
            padding: 10px 20px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .custom-alert-btn.success {
            background-color: #319795;
            color: #ffffff;
        }
        .custom-alert-btn.success:hover {
            background-color: #2c7a7b;
            transform: translateY(-1px);
        }
        .custom-alert-btn.error {
            background-color: #c53030;
            color: #ffffff;
        }
        .custom-alert-btn.error:hover {
            background-color: #9b2c2c;
            transform: translateY(-1px);
        }
        .custom-alert-btn.warning {
            background-color: #dd6b20;
            color: #ffffff;
        }
        .custom-alert-btn.warning:hover {
            background-color: #c05621;
            transform: translateY(-1px);
        }
        .custom-alert-btn.info {
            background-color: #4a6fa5;
            color: #ffffff;
        }
        .custom-alert-btn.info:hover {
            background-color: #3a5b8a;
            transform: translateY(-1px);
        }
        
        /* Premium Custom Confirm Styles */
        .custom-confirm-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(45, 55, 72, 0.4);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100000;
            opacity: 0;
            transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .custom-confirm-overlay.show {
            opacity: 1;
        }
        .custom-confirm-card {
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.05);
            width: 90%;
            max-width: 440px;
            padding: 24px;
            border: 1px solid rgba(234, 230, 223, 0.8);
            transform: scale(0.9) translateY(20px);
            transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .custom-confirm-overlay.show .custom-confirm-card {
            transform: scale(1) translateY(0);
        }
        .custom-confirm-header {
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1.5px dashed rgba(234, 230, 223, 0.8);
            padding-bottom: 12px;
        }
        .custom-confirm-title {
            font-family: 'Outfit', 'Inter', sans-serif;
            font-size: 1.15rem;
            font-weight: 800;
            color: #2d3748;
            letter-spacing: 0.3px;
        }
        .custom-confirm-body {
            font-family: 'Inter', sans-serif;
            font-size: 0.88rem;
            line-height: 1.55;
            color: #4a5568;
            white-space: pre-line;
            max-height: 250px;
            overflow-y: auto;
            padding-right: 4px;
        }
        .custom-confirm-actions {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 4px;
        }
        .custom-confirm-btn {
            font-family: 'Inter', sans-serif;
            font-size: 0.82rem;
            font-weight: 700;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .custom-confirm-btn.confirm {
            background-color: #319795; /* Teal primary */
            color: #ffffff;
            border: none;
        }
        .custom-confirm-btn.confirm:hover {
            background-color: #2c7a7b;
            transform: translateY(-1px);
        }
        .custom-confirm-btn.cancel {
            background-color: #ffffff;
            color: #4a5568;
            border: 1px solid #cbd5e0;
        }
        .custom-confirm-btn.cancel:hover {
            background-color: #f7fafc;
            transform: translateY(-1px);
        }
    `;
    document.head.appendChild(style);

    // Surcharge de la fonction native window.alert
    window.alert = function(message) {
        const text = String(message).toLowerCase();
        let type = 'info'; // Défaut
        let title = 'Information Clinique';
        let iconSvg = '';

        if (text.includes('faille') || text.includes('erreur') || text.includes('introuvable') || text.includes('impossible') || text.includes('bloqué') || text.includes('vide')) {
            if (text.includes('faille') || text.includes('intégrité')) {
                type = 'warning';
                title = 'Contrôle Réglementaire';
            } else {
                type = 'error';
                title = 'Alerte Système';
            }
        } else if (text.includes('succès') || text.includes('enregistré') || text.includes('exporté') || text.includes('chargé') || text.includes('généré') || text.includes('calculé') || text.includes('solde')) {
            type = 'success';
            title = 'Opération Réussie';
        }

        if (type === 'success') {
            iconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        } else if (type === 'error') {
            iconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
        } else if (type === 'warning') {
            iconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
        } else {
            iconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
        }

        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';
        
        overlay.innerHTML = `
            <div class="custom-alert-card">
                <div class="custom-alert-header">
                    <div class="custom-alert-icon ${type}">
                        ${iconSvg}
                    </div>
                    <div class="custom-alert-title">${title}</div>
                </div>
                <div class="custom-alert-body">${message}</div>
                <div class="custom-alert-actions">
                    <button class="custom-alert-btn ${type}" id="custom-alert-ok-btn">D'accord</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        overlay.offsetWidth; 
        overlay.classList.add('show');

        const okBtn = overlay.querySelector('#custom-alert-ok-btn');
        okBtn.focus();

        function closeAlert() {
            overlay.classList.remove('show');
            setTimeout(() => {
                overlay.remove();
            }, 250);
            document.removeEventListener('keydown', handleKeydown);
        }

        function handleKeydown(e) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
                e.preventDefault();
                closeAlert();
            }
        }

        okBtn.addEventListener('click', closeAlert);
        document.addEventListener('keydown', handleKeydown);
    };

    // Surcharge de la fonction native window.confirm
    window.confirm = function(message) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'custom-confirm-overlay';

            overlay.innerHTML = `
                <div class="custom-confirm-card">
                    <div class="custom-confirm-header">
                        <img src="assets/logo_clinique.jpg" alt="Logo" style="height: 32px; width: 32px; object-fit: contain; border-radius: 4px;">
                        <div class="custom-confirm-title">Confirmation Clinique</div>
                    </div>
                    <div class="custom-confirm-body">${message}</div>
                    <div class="custom-confirm-actions">
                        <button class="custom-confirm-btn cancel" id="custom-confirm-cancel-btn">→ Annuler</button>
                        <button class="custom-confirm-btn confirm" id="custom-confirm-ok-btn">→ D'accord</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);
            overlay.offsetWidth;
            overlay.classList.add('show');

            const okBtn = overlay.querySelector('#custom-confirm-ok-btn');
            const cancelBtn = overlay.querySelector('#custom-confirm-cancel-btn');
            okBtn.focus();

            function closeConfirm(value) {
                overlay.classList.remove('show');
                setTimeout(() => {
                    overlay.remove();
                }, 250);
                document.removeEventListener('keydown', handleKeydown);
                resolve(value);
            }

            function handleKeydown(e) {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    closeConfirm(false);
                } else if (e.key === 'Enter' || e.key === ' ') {
                    if (document.activeElement === cancelBtn) {
                        e.preventDefault();
                        closeConfirm(false);
                    } else {
                        e.preventDefault();
                        closeConfirm(true);
                    }
                }
            }

            okBtn.addEventListener('click', () => closeConfirm(true));
            cancelBtn.addEventListener('click', () => closeConfirm(false));
            document.addEventListener('keydown', handleKeydown);
        });
    };

    // Toast de notification global
    window.showNotificationToast = function(message, type = 'success') {
        let toastContainer = document.getElementById('custom-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'custom-toast-container';
            toastContainer.style.position = 'fixed';
            toastContainer.style.bottom = '30px';
            toastContainer.style.right = '30px';
            toastContainer.style.display = 'flex';
            toastContainer.style.flexDirection = 'column';
            toastContainer.style.gap = '10px';
            toastContainer.style.zIndex = '999999';
            document.body.appendChild(toastContainer);
        }
        
        const toast = document.createElement('div');
        toast.className = `custom-toast ${type}`;
        toast.style.backgroundColor = '#2d3748';
        toast.style.color = '#ffffff';
        toast.style.padding = '14px 22px';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
        toast.style.fontSize = '0.85rem';
        toast.style.fontWeight = '600';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '12px';
        toast.style.transition = 'all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        
        let iconSvg = '';
        let borderLeftColor = '#319795';
        
        if (type === 'success') {
            iconSvg = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="#38b2ac" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            borderLeftColor = '#38b2ac';
        } else if (type === 'error') {
            iconSvg = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="#f56565" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
            borderLeftColor = '#f56565';
        } else if (type === 'warning') {
            iconSvg = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="#ed8936" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>`;
            borderLeftColor = '#ed8936';
        } else {
            iconSvg = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="#4299e1" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
            borderLeftColor = '#4299e1';
        }
        
        toast.style.borderLeft = `4px solid ${borderLeftColor}`;
        toast.innerHTML = `${iconSvg}<span>${message}</span>`;
        toastContainer.appendChild(toast);
        
        toast.offsetWidth;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                toast.remove();
                if (toastContainer.children.length === 0) {
                    toastContainer.remove();
                }
            }, 300);
        }, 4500);
    };
    window.showAppToast = window.showNotificationToast;
})();

// Gestion des thèmes graphiques (Zen Clair, Emerald, Dark)
function setTheme(themeName, showToastMsg = true) {
    document.body.classList.remove('dark-theme', 'emerald-theme');
    document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.getElementById(`theme-btn-${themeName}`);
    if (activeBtn) activeBtn.classList.add('active');
    
    if (themeName === 'dark') {
        document.body.classList.add('dark-theme');
    } else if (themeName === 'emerald') {
        document.body.classList.add('emerald-theme');
    }
    
    localStorage.setItem('mercyfiat_theme', themeName);
    
    if (showToastMsg) {
        let msg = "Thème Zen Clair activé ☀️. Teinte crème et bois de bouleau doux.";
        if (themeName === 'dark') msg = "Thème Nuit Obsidienne activé 🌙. Teinte anthracite et turquoise néon.";
        if (themeName === 'emerald') msg = "Thème Émeraude Impérial activé 🌲. Teinte vert forêt et accents or bruni.";
        if (typeof showNotificationToast === 'function') showNotificationToast(msg);
    }
}
window.setTheme = setTheme;

// Commutation de layout d'éditeur (Split vs Focus)
function setEditorLayout(moduleName, mode, showToastMsg = true) {
    const section = document.getElementById(`${moduleName}-section`);
    if (!section) return;
    
    const layoutContainer = section.querySelector('.editor-layout');
    if (!layoutContainer) return;
    
    const splitBtn = document.getElementById(`layout-toggle-${moduleName}-split`);
    const focusBtn = document.getElementById(`layout-toggle-${moduleName}-focus`);
    
    if (mode === 'focus') {
        layoutContainer.classList.add('layout-focus-active');
        if (splitBtn) splitBtn.classList.remove('active');
        if (focusBtn) focusBtn.classList.add('active');
    } else {
        layoutContainer.classList.remove('layout-focus-active');
        if (splitBtn) splitBtn.classList.add('active');
        if (focusBtn) focusBtn.classList.remove('active');
    }
    
    localStorage.setItem(`mercyfiat_layout_${moduleName}`, mode);
    
    if (showToastMsg && typeof showNotificationToast === 'function') {
        showNotificationToast(
            mode === 'focus' 
                ? `Mode Saisie Large activé. Les formulaires sont présentés sous forme de cartes aérées.` 
                : `Mode Écran Partagé activé. L'aperçu A4 papier est visible en temps réel.`
        );
    }
}
window.setEditorLayout = setEditorLayout;

function toggleSidebar(showToastMsg = false) {
    const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
    localStorage.setItem('mercyfiat_sidebar_collapsed', isCollapsed ? 'true' : 'false');
    
    const toggleBtn = document.getElementById('btn-toggle-sidebar');
    if (toggleBtn) {
        if (isCollapsed) {
            toggleBtn.title = "Afficher le menu latéral";
            toggleBtn.style.background = "var(--border-color)";
        } else {
            toggleBtn.title = "Masquer le menu latéral";
            toggleBtn.style.background = "";
        }
    }
    
    if (showToastMsg && typeof showNotificationToast === 'function') {
        showNotificationToast(isCollapsed ? "Menu masqué. Mode grand écran activé." : "Menu latéral affiché.");
    }
}
window.toggleSidebar = toggleSidebar;

function initializeThemeAndLayouts() {
    const savedTheme = localStorage.getItem('mercyfiat_theme') || 'light';
    setTheme(savedTheme, false);
    
    const billingLayout = localStorage.getItem('mercyfiat_layout_billing') || 'split';
    setEditorLayout('billing', billingLayout, false);
    
    const docsLayout = localStorage.getItem('mercyfiat_layout_documents') || 'split';
    setEditorLayout('documents', docsLayout, false);

    const sidebarCollapsed = localStorage.getItem('mercyfiat_sidebar_collapsed') === 'true';
    if (sidebarCollapsed) {
        document.body.classList.add('sidebar-collapsed');
        const toggleBtn = document.getElementById('btn-toggle-sidebar');
        if (toggleBtn) {
            toggleBtn.title = "Afficher le menu latéral";
            toggleBtn.style.background = "var(--border-color)";
        }
    }
}
window.initializeThemeAndLayouts = initializeThemeAndLayouts;

// Lancement de l'initialisation
setTimeout(initializeThemeAndLayouts, 50);

// Verrouiller / Déverrouiller les formulaires pour éviter les modifications accidentelles
function setFormLockState(type, locked) {
    if (type === 'billing') {
        window.isBillLocked = locked;
        
        // 1. Inputs du formulaire de facturation
        const inputSelectors = [
            '#bill-patient-nom',
            '#bill-patient-prenom',
            '#bill-patient-type',
            '#bill-insurance',
            '#bill-coverage',
            '#bill-matricule',
            '#bill-type',
            '#bill-title-custom',
            '#bill-diagnostic',
            '#bill-intervention',
            '#bill-k-code',
            '#bill-show-diag',
            '#bill-show-interv',
            '#bill-show-sig',
            '#bill-show-cachet',
            '#bill-payment-method',
            '#bill-amount-paid-patient',
            '#bill-discount-type',
            '#bill-discount-value',
            '#bill-use-split'
        ];
        
        inputSelectors.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) {
                el.disabled = locked;
                // Si déverrouillé et assureur est PRIVE, le taux doit rester désactivé
                if (!locked && sel === '#bill-coverage') {
                    const insVal = document.getElementById('bill-insurance')?.value;
                    if (insVal === 'PRIVE') el.disabled = true;
                }
            }
        });
        
        // 2. Lignes d'items facturés (et leurs inputs)
        const rows = document.querySelectorAll('#billing-items-container .item-row');
        rows.forEach(row => {
            row.querySelectorAll('input').forEach(inp => {
                if (!inp.classList.contains('item-subtotal') && 
                    !inp.classList.contains('item-split-assurance') && 
                    !inp.classList.contains('item-split-patient')) {
                    inp.disabled = locked;
                }
            });
            row.querySelectorAll('button').forEach(btn => {
                btn.disabled = locked;
                btn.style.opacity = locked ? '0.4' : '1';
                btn.style.pointerEvents = locked ? 'none' : 'auto';
            });
        });
        
        // 3. Boutons d'action globale de l'éditeur
        const saveBtn = document.querySelector('button[onclick="saveActiveBill()"]');
        const unlockBtn = document.getElementById('btn-unlock-bill');
        const addRowBtn = document.querySelector('button[onclick="addCustomBillingRow()"]');
        
        // Quick add prestations search & list
        const quickAddSearch = document.getElementById('quick-add-search-input');
        if (quickAddSearch) quickAddSearch.disabled = locked;
        const quickAddFilterBtns = document.querySelectorAll('.quick-filter-btn');
        quickAddFilterBtns.forEach(btn => btn.disabled = locked);
        
        if (unlockBtn) unlockBtn.style.display = locked ? 'block' : 'none';
        if (saveBtn) {
            saveBtn.disabled = locked;
            saveBtn.style.opacity = locked ? '0.5' : '1';
        }
        if (addRowBtn) {
            addRowBtn.disabled = locked;
            addRowBtn.style.opacity = locked ? '0.5' : '1';
        }
    } else if (type === 'documents') {
        window.isDocLocked = locked;
        
        const inputSelectors = [
            '#doc-patient-nom',
            '#doc-patient-prenom',
            '#doc-patient-age',
            '#doc-date',
            '#doc-diagnostique',
            '#doc-template',
            '#doc-editor',
            '#doc-keywords-input',
            '#doc-medecin-select',
            '#toggle-sig-image',
            '#toggle-seal-image',
            '#doc-insurer',
            '#doc-insurer-name',
            '#doc-sinistre',
            '#doc-date-entree',
            '#doc-date-sortie',
            '#doc-date-intervention',
            '#doc-date-prolongation',
            '#doc-intervention',
            '#doc-hospi-days',
            '#doc-convalescence',
            '#doc-rappel',
            '#doc-examen',
            '#doc-conclusion',
            '#doc-recommandations',
            '#doc-etat-actuel',
            '#block-justification'
        ];
        
        inputSelectors.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) el.disabled = locked;
        });
        
        const textareas = document.querySelectorAll('#documents-section textarea');
        textareas.forEach(ta => ta.disabled = locked);
        
        const saveBtn = document.querySelector('button[onclick="saveActiveDocument()"]');
        const unlockBtn = document.getElementById('btn-unlock-doc');
        const resetBtn = document.querySelector('button[onclick="loadDocumentTemplate()"]');
        
        if (unlockBtn) unlockBtn.style.display = locked ? 'block' : 'none';
        if (saveBtn) {
            saveBtn.disabled = locked;
            saveBtn.style.opacity = locked ? '0.5' : '1';
        }
        if (resetBtn) resetBtn.disabled = locked;
        
        const adaptBtn = document.querySelector('button[onclick="generateDocFromKeywords()"]');
        if (adaptBtn) adaptBtn.disabled = locked;
    }
}
window.setFormLockState = setFormLockState;
