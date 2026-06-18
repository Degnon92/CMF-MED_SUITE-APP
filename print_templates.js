/* ============================================================
   print_templates.js - Centralisation des En-têtes & Pieds de page
   ============================================================ */

window.MercyFiatTemplates = {
    // Génère l'en-tête officiel de la clinique avec logo et spécialités
    getPrintHeaderHtml: function() {
        return `
            <div style="display:flex; align-items:center; border-bottom:3px double #2d3748; padding-bottom:4px; margin-bottom:6px; gap:20px; width:100%; box-sizing:border-box;">
                <div style="flex:0 0 90px; display:flex; justify-content:center; align-items:center;">
                    <img src="assets/logo_clinique.jpg" alt="Logo" style="max-height:75px; max-width:90px; object-fit:contain;">
                </div>
                <div style="flex:1; text-align:center; padding-right:90px;">
                    <div style="font-family:'Outfit','Inter',sans-serif; font-size:1.5rem; font-weight:900; color:#2d3748; text-transform:uppercase; letter-spacing:1px; margin-bottom:2px;">CLINIQUE MERCY FIAT</div>
                    <div style="font-size:0.56rem; font-weight:700; color:#4a5568; text-transform:uppercase; letter-spacing:0.1px; margin-bottom:1px; white-space:nowrap;">MEDECINE GENERALE - SPECIALITES MEDICALES ET CHIRURGICALES - LABORATOIRE</div>
                    <div style="font-size:0.58rem; font-weight:700; color:#4a5568; text-transform:uppercase; letter-spacing:0.1px;">CARDIOLOGIE 7J/7</div>
                </div>
            </div>
        `;
    },

    // Génère le pied de page officiel encadré et coloré (Teal)
    getPrintFooterHtml: function() {
        return `
            <div class="print-footer">
                SEME AGUE PK 18 &nbsp;|&nbsp; Tél : +229 69 62 02 02 / 98 00 00 55 &nbsp;|&nbsp; Cotonou Vodjè &nbsp;|&nbsp; Tél : +229 69 02 11 11 / 98 70 98 98<br>
                E-mail : cliniquemercyfiat@gmail.com &nbsp;/&nbsp; ORABANK Cpte bancaire : 02170730 0 201 &nbsp;/&nbsp; N° IFU : 3201710045937 &nbsp;/&nbsp; N° RCCM-RB-COT-17-B-19317
            </div>
        `;
    },

    // Génère le bloc Notes & Conditions des devis/proformas encadré
    getProformaNotesHtml: function() {
        return `
            <div style="border: 1px solid #4b807b; background: #f4f8f7; border-radius: 6px; padding: 6px 10px; font-size: 0.58rem; line-height: 1.35; color: #2d3748; font-family:'Times New Roman', Times, serif; text-align:left; box-sizing:border-box; width:100%; display: flex; flex-direction: column; gap: 3px; page-break-inside: avoid;">
                <strong style="color: #4b807b; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.2px; font-weight:800; display: inline-flex; align-items: center; gap: 3px; margin-bottom: 1px;">📌 Notes &amp; Conditions :</strong>
                <span style="display: block;"><strong>A -</strong> Cette facture est susceptible de modifications.</span>
                <span style="display: block;"><strong>B -</strong> Lorsque le patient est assuré, la compagnie d'assurance paie toute ou une partie de la facture et il lui revient de payer la différence.</span>
                <span style="display: block;"><strong>C -</strong> Aucune autre tarification n'est acceptée à part celle pratiquée à la Clinique.</span>
            </div>
        `;
    },

    // Sépare dynamiquement le contenu en plusieurs pages A4 virtuelles
    paginateReport: function(options) {
        const {
            paragraphs,
            patientInfoHtml,
            titleHtml,
            diagnosticHtml,
            sigBlockHtml,
            specialites
        } = options;

        const sidebarContentHtml = specialites.map(s => `
            <div style="margin-bottom:16px;">
                <div style="font-weight:900; text-decoration:underline; font-size:11.5px; color:#1a202c; margin-bottom:4px; line-height:1.25; white-space:nowrap;">${s.spec}</div>
                ${s.doctors.map(d => `<div style="font-size:12px; color:#2d3748; padding-left:2px; margin-bottom:2px; font-weight:600; line-height:1.25;">${d}</div>`).join('')}
            </div>
        `).join('');

        let tempContainer = document.getElementById('temp-pagination-container');
        if (!tempContainer) {
            tempContainer = document.createElement('div');
            tempContainer.id = 'temp-pagination-container';
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '-9999px';
            tempContainer.style.width = '21cm';
            tempContainer.style.height = 'auto';
            document.body.appendChild(tempContainer);
        }
        tempContainer.innerHTML = '';

        // Mesurer la hauteur physique cible d'une page A4 (29.7cm) dans la résolution courante à zoom 1
        const dummyPage = document.createElement('div');
        dummyPage.className = 'clinical-page';
        dummyPage.style.zoom = '1';
        dummyPage.style.visibility = 'hidden';
        dummyPage.style.position = 'absolute';
        tempContainer.appendChild(dummyPage);
        const targetHeight = dummyPage.offsetHeight;
        tempContainer.removeChild(dummyPage);

        function createNewPage() {
            const pageDiv = document.createElement('div');
            pageDiv.className = 'clinical-page';
            // Forcer zoom 1 temporairement pour une mesure physique 1:1 fiable
            pageDiv.style.zoom = '1'; 
            pageDiv.style.height = 'auto'; // Forcer height auto pour permettre la mesure lors de l'empilement
            
            pageDiv.innerHTML = `
                ${window.MercyFiatTemplates.getPrintHeaderHtml()}
                <div class="doc-flex-body" style="display:flex; gap:0; flex-grow:1 !important; align-items:stretch; border-bottom:2px solid #2d3748; overflow:hidden;">
                    <div class="doc-sidebar" style="width:180px; flex-shrink:0; border-right:1px solid #2d3748; padding:10px 8px 10px 2px; font-family:'Times New Roman',serif; align-self:stretch;">
                        ${sidebarContentHtml}
                    </div>
                    <div class="doc-content-col" style="flex:1; padding:10px 12px; display:flex; flex-direction:column; overflow:hidden;">
                    </div>
                </div>
                ${window.MercyFiatTemplates.getPrintFooterHtml()}
            `;
            tempContainer.appendChild(pageDiv);
            return pageDiv;
        }

        let currentPage = createNewPage();
        let currentContentCol = currentPage.querySelector('.doc-content-col');
        
        console.log("[DEBUG] TargetHeight:", targetHeight);
        console.log("[DEBUG] Initial currentPage height:", currentPage.offsetHeight);
        const sidebarEl = currentPage.querySelector('.doc-sidebar');
        if (sidebarEl) {
            console.log("[DEBUG] Sidebar dimensions:", {
                clientHeight: sidebarEl.clientHeight,
                offsetHeight: sidebarEl.offsetHeight,
                scrollHeight: sidebarEl.scrollHeight
            });
        }

        // 1. Infos Patient sur la page 1 uniquement
        const patientInfoDiv = document.createElement('div');
        patientInfoDiv.innerHTML = patientInfoHtml;
        currentContentCol.appendChild(patientInfoDiv);

        // 2. Titre du rapport sur la page 1 uniquement
        const titleDiv = document.createElement('div');
        titleDiv.innerHTML = titleHtml;
        currentContentCol.appendChild(titleDiv);

        // 3. Diagnostic s'il existe (page 1)
        if (diagnosticHtml) {
            const diagDiv = document.createElement('div');
            diagDiv.innerHTML = diagnosticHtml;
            currentContentCol.appendChild(diagDiv);
        }

        // 4. Distribution des paragraphes de texte
        let paraIndex = 0;
        for (const paraHtml of paragraphs) {
            const paraDiv = document.createElement('div');
            paraDiv.innerHTML = paraHtml;
            currentContentCol.appendChild(paraDiv);
            paraIndex++;

            console.log(`[DEBUG] Para ${paraIndex} added. Page offsetHeight: ${currentPage.offsetHeight}, targetHeight: ${targetHeight}, contentCol children: ${currentContentCol.children.length}`);

            // Si la hauteur de page réelle dépasse la hauteur A4 cible
            if (currentPage.offsetHeight > targetHeight) {
                if (currentContentCol.children.length > 1) {
                    console.log(`[DEBUG] Para ${paraIndex} overflows! Removing and pushing to next page.`);
                    currentContentCol.removeChild(paraDiv);
                    
                    // Rétablir la hauteur fixe par défaut pour finaliser la page courante
                    currentPage.style.height = '';

                    // Nouvelle page
                    currentPage = createNewPage();
                    currentContentCol = currentPage.querySelector('.doc-content-col');
                    currentContentCol.appendChild(paraDiv);
                    console.log(`[DEBUG] Created new page for Para ${paraIndex}. New page height: ${currentPage.offsetHeight}`);
                }
            }
        }

        // 5. Bloc de signature sur la dernière page
        const sigDiv = document.createElement('div');
        sigDiv.innerHTML = sigBlockHtml;
        currentContentCol.appendChild(sigDiv);

        if (currentPage.offsetHeight > targetHeight) {
            if (currentContentCol.children.length > 1) {
                currentContentCol.removeChild(sigDiv);
                
                // Rétablir la hauteur fixe par défaut pour finaliser la page courante
                currentPage.style.height = '';
                
                currentPage = createNewPage();
                currentContentCol = currentPage.querySelector('.doc-content-col');
                currentContentCol.appendChild(sigDiv);
            }
        }

        // Enlever le zoom forcé et laisser la hauteur revenir aux 29.7cm standard de la classe CSS
        Array.from(tempContainer.children).forEach(page => {
            page.style.zoom = '';
            page.style.height = '';
        });

        const resultHtml = tempContainer.innerHTML;
        tempContainer.innerHTML = '';
        return resultHtml;
    }
};

