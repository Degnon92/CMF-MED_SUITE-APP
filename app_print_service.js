/* ============================================================
   app_print_service.js - Aperçu A4, PDF natifs & Impressions
   ============================================================ */

// Variable globale pour savoir quel type de document est en cours de prévisualisation
var activePrintType = 'billing';

// Ouvre la fenêtre d'aperçu avant impression A4
function openPrintPreview(type) {
    activePrintType = type; // Mémoriser le type actif
    const modal = document.getElementById('print-preview-modal');
    const sheet = document.getElementById('modal-a4-sheet');
    
    if (!modal || !sheet) return;
    
    // Vider le conteneur A4
    sheet.innerHTML = '';
    
    // Réinitialiser le mot de passe
    const pwdInput = document.getElementById('pdf-password');
    if (pwdInput) pwdInput.value = '';
    
    // Demander la liste des imprimantes installées de manière native via Electron IPC
    if (typeof require !== 'undefined') {
        try {
            const { ipcRenderer } = require('electron');
            ipcRenderer.send('get-printers');
        } catch (e) {
            console.error("Impossible de récupérer les imprimantes :", e);
        }
    }
    
    // Déterminer la source à cloner
    const sourceId = type === 'billing' ? 'bill-print-preview' : 'doc-print-preview';
    const sourceEl = document.getElementById(sourceId);
    
    if (sourceEl) {
        // Copier les enfants de la prévisualisation dans la feuille A4 (sans la div parent .preview-panel)
        Array.from(sourceEl.childNodes).forEach(child => {
            sheet.appendChild(child.cloneNode(true));
        });
        
        // Synchroniser l'affichage des cachets et signatures dans la feuille A4
        const originalSeal = sourceEl.querySelector('#preview-bill-seal') || sourceEl.querySelector('.seal-img');
        const originalSig = sourceEl.querySelector('#preview-bill-sig') || sourceEl.querySelector('.signature-img');
        
        const clonedSeal = sheet.querySelector('#preview-bill-seal') || sheet.querySelector('.seal-img');
        const clonedSig = sheet.querySelector('#preview-bill-sig') || sheet.querySelector('.signature-img');
        
        if (originalSeal && clonedSeal) {
            clonedSeal.style.display = originalSeal.style.display;
            clonedSeal.src = originalSeal.src;
        }
        if (originalSig && clonedSig) {
            clonedSig.style.display = originalSig.style.display;
            clonedSig.src = originalSig.src;
        }
        
        // Afficher le modal
        modal.style.display = 'flex';
    } else {
        alert("Erreur : Contenu d'aperçu introuvable.");
    }
}
window.openPrintPreview = openPrintPreview;

// Déclenche l'impression native Windows
function triggerNativePrint() {
    window.print();
}
window.triggerNativePrint = triggerNativePrint;

// Ferme le modal d'aperçu avant impression
function closePrintPreviewModal() {
    const modal = document.getElementById('print-preview-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}
window.closePrintPreviewModal = closePrintPreviewModal;

// Fonction auxiliaire pour isoler et consolider le code HTML et CSS de la feuille A4 pour l'export PDF
function getConsolidatedHTMLForPDF() {
    const element = document.getElementById('modal-a4-sheet');
    if (!element) return '';

    // Chemin absolu de l'application pour résoudre les images
    let appBasePath = '';
    try {
        const path = require('path');
        appBasePath = 'file:///' + __dirname.replace(/\\/g, '/') + '/';
    } catch(e) {
        appBasePath = '';
    }

    const rootStyle = getComputedStyle(document.documentElement);
    const cssVarValues = {
        '--bg-main': rootStyle.getPropertyValue('--bg-main').trim() || '#f9f8f6',
        '--bg-sidebar': rootStyle.getPropertyValue('--bg-sidebar').trim() || '#eae6df',
        '--bg-card': rootStyle.getPropertyValue('--bg-card').trim() || 'rgba(255,255,255,0.95)',
        '--border-color': rootStyle.getPropertyValue('--border-color').trim() || 'rgba(212,207,198,0.8)',
        '--text-primary': rootStyle.getPropertyValue('--text-primary').trim() || '#2d3748',
        '--text-secondary': rootStyle.getPropertyValue('--text-secondary').trim() || '#718096',
        '--accent-blue': rootStyle.getPropertyValue('--accent-blue').trim() || '#1e3a8a',
        '--accent-teal': rootStyle.getPropertyValue('--accent-teal').trim() || '#4b807b',
        '--accent-coral': rootStyle.getPropertyValue('--accent-coral').trim() || '#d48b7b',
        '--accent-gold': rootStyle.getPropertyValue('--accent-gold').trim() || '#c3a17e',
        '--radius-md': rootStyle.getPropertyValue('--radius-md').trim() || '10px',
        '--radius-sm': rootStyle.getPropertyValue('--radius-sm').trim() || '6px',
    };

    const cssVarsBlock = `:root { ${Object.entries(cssVarValues).map(([k,v]) => `${k}: ${v};`).join(' ')} }`;

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Impression Clinique Mercy Fiat</title>
    ${appBasePath ? `<base href="${appBasePath}">` : ''}
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        ${cssVarsBlock}
        @page { size: A4; margin: 0; }
        * { box-sizing: border-box; }
        body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: 'Times New Roman', Times, serif;
            color: #2d3748;
        }
        .a4-sheet {
            box-shadow: none !important;
            margin: 0 auto !important;
            border: none !important;
            width: 21cm !important;
            min-height: auto !important;
            padding: 0.6cm 1.2cm !important;
            box-sizing: border-box !important;
            position: relative !important;
            background: white !important;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        table {
            width: 100% !important;
            border-collapse: collapse !important;
            border: 2px solid #1a202c !important;
            margin: 10px 0 !important;
            table-layout: fixed !important;
        }
        th {
            background-color: #eae6df !important;
            color: #1a202c !important;
            font-weight: 800 !important;
            border: 1px solid #2d3748 !important;
            padding: 6px 10px !important;
            font-size: 0.8rem !important;
            text-align: left;
        }
        td {
            border: 1px solid #718096 !important;
            padding: 5px 8px !important;
            font-size: 0.8rem !important;
            color: #2d3748 !important;
            word-break: break-word !important;
            white-space: normal !important;
        }
        body td { color: #1a202c !important; }
        body th { background-color: #eae6df !important; color: #1a202c !important; }
        th:nth-child(2), td:nth-child(2) { text-align: center !important; }
        th:nth-child(3), td:nth-child(3) { text-align: right !important; }
        th:nth-child(4), td:nth-child(4) { text-align: right !important; }
        th:nth-child(5), td:nth-child(5) { text-align: right !important; }
        th:nth-child(6), td:nth-child(6) { text-align: right !important; }
        th:nth-child(7), td:nth-child(7) { text-align: right !important; }
        th:nth-child(8), td:nth-child(8) { text-align: right !important; }
        .doc-flex-header { display: flex; align-items: center; gap: 12px; border-bottom: 3px solid #2d3748; padding-bottom: 10px; margin-bottom: 0; }
        .doc-flex-body { display: flex; min-height: 350px; border-bottom: 2px solid #2d3748; }
        .doc-sidebar { width: 145px; flex-shrink: 0; border-right: 1px solid #2d3748; padding: 10px 8px; font-size: 0.62rem; }
        .doc-main { flex: 1; padding: 10px 14px; }
        img { display: inline-block; }
        .signature-seal-container {
            width: 150px;
            height: 90px;
            position: relative;
            margin: 2px auto;
        }
        .seal-img {
            position: absolute !important;
            top: 2px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: 85px !important;
            height: auto !important;
            opacity: 1 !important;
            display: block !important;
            z-index: 5 !important;
            mix-blend-mode: multiply !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        .signature-img {
            position: absolute !important;
            bottom: 2px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: 125px !important;
            height: auto !important;
            display: block !important;
            z-index: 10 !important;
            mix-blend-mode: multiply !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        .print-footer {
            margin-top: auto !important;
            text-align: center !important;
            border: 1px solid #4b807b !important;
            background-color: #f4f8f7 !important;
            border-radius: 6px !important;
            padding: 5px 10px !important;
            font-family: 'Inter', sans-serif !important;
            font-size: 0.59rem !important; /* Réduit pour tenir sur 2 lignes exactement */
            font-weight: 600 !important;
            color: #2d3748 !important;
            line-height: 1.5 !important;
            box-sizing: border-box !important;
            letter-spacing: 0em !important;
            white-space: normal !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02) !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            page-break-inside: avoid !important;
            width: 100% !important;
        }
        .bill-page-bottom-block {
            margin-top: auto !important;
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 4px !important;
            page-break-inside: avoid !important;
        }
        .a4-sheet > div {
            display: flex !important;
            flex-direction: column !important;
            flex-grow: 1 !important;
            min-height: 28.5cm !important;
            box-sizing: border-box !important;
        }
        .bill-summary {
            margin-top: 6px !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 4px !important;
            width: 320px !important;
            align-self: flex-end !important;
            margin-left: auto !important;
            border-top: 2px solid #cbd5e0 !important;
            padding-top: 8px !important;
        }
        .summary-row {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            font-size: 0.82rem !important;
            width: 100% !important;
        }
        .summary-row.total {
            font-size: 0.98rem !important;
            font-weight: 800 !important;
            color: #1a202c !important;
            border-top: 1px dashed #cbd5e0 !important;
            padding-top: 5px !important;
            margin-top: 2px !important;
        }
    </style>
</head>
<body>
    <div class="a4-sheet">
        ${element.innerHTML}
    </div>
</body>
</html>`;
}
window.getConsolidatedHTMLForPDF = getConsolidatedHTMLForPDF;

// Exporte en PDF de manière 100% native via le processus d'impression d'Electron
function exportActiveDocToPDF() {
    if (typeof require !== 'undefined') {
        try {
            const { ipcRenderer } = require('electron');
            
            let patientName = "PATIENT";
            let docType = "DOCUMENT";
            
            if (activePrintType === 'dme') {
                const full = window.activeDMEPatientName || "PATIENT";
                patientName = full.toUpperCase().replace(/\s+/g, '_');
                docType = 'DME_CONSOLIDE';
            } else if (activePrintType === 'billing') {
                const nom = document.getElementById('bill-patient-nom').value || "PARAISO";
                const prenom = document.getElementById('bill-patient-prenom').value || "Alex";
                const type = document.getElementById('bill-type').value;
                patientName = `${nom}_${prenom}`.toUpperCase().replace(/\s+/g, '_');
                docType = type === 'PROFORMA' ? 'PROFORMA' : 'POINT_DEFINITIF';
            } else {
                const nom = document.getElementById('doc-patient-nom').value || "KPADONOU";
                const prenom = document.getElementById('doc-patient-prenom').value || "Remi";
                patientName = `${nom}_${prenom}`.toUpperCase().replace(/\s+/g, '_');
                docType = document.getElementById('doc-template').value.toUpperCase();
            }
            
            const pwdInput = document.getElementById('pdf-password');
            const pdfPassword = pwdInput ? pwdInput.value : '';
            const htmlContent = getConsolidatedHTMLForPDF();
            ipcRenderer.send('save-to-pdf', patientName, docType, htmlContent, pdfPassword);
        } catch (e) {
            console.error("Erreur require electron :", e);
            printDOMElement('modal-a4-sheet');
        }
    } else {
        printDOMElement('modal-a4-sheet');
    }
}
window.exportActiveDocToPDF = exportActiveDocToPDF;

// Génère un PDF silencieusement dans les fichiers temporaires et l'ouvre
function printActiveDocViaPDF() {
    if (typeof require !== 'undefined') {
        try {
            const { ipcRenderer } = require('electron');
            
            let patientName = "PATIENT";
            if (activePrintType === 'dme') {
                const full = window.activeDMEPatientName || "PATIENT";
                patientName = full.toUpperCase().replace(/\s+/g, '_');
            } else if (activePrintType === 'billing') {
                const nom = document.getElementById('bill-patient-nom').value || "PARAISO";
                const prenom = document.getElementById('bill-patient-prenom').value || "Alex";
                patientName = `${nom}_${prenom}`.toUpperCase().replace(/\s+/g, '_');
            } else {
                const nom = document.getElementById('doc-patient-nom').value || "KPADONOU";
                const prenom = document.getElementById('doc-patient-prenom').value || "Remi";
                patientName = `${nom}_${prenom}`.toUpperCase().replace(/\s+/g, '_');
            }
            
            const htmlContent = getConsolidatedHTMLForPDF();
            ipcRenderer.send('print-to-pdf-temp', patientName, htmlContent);
        } catch (e) {
            console.error("Erreur Impression PDF :", e);
            printDOMElement('modal-a4-sheet');
        }
    } else {
        printDOMElement('modal-a4-sheet');
    }
}
window.printActiveDocViaPDF = printActiveDocViaPDF;

// Réception des status d'écriture PDF natifs et listes d'imprimantes via IPC
if (typeof require !== 'undefined') {
    try {
        const { ipcRenderer } = require('electron');
        
        ipcRenderer.on('printers-list', (event, printers) => {
            const select = document.getElementById('print-device');
            if (!select) return;
            
            select.innerHTML = '';
            
            if (!printers || printers.length === 0) {
                select.innerHTML = '<option value="">Aucune imprimante détectée</option>';
                return;
            }
            
            printers.forEach(p => {
                const option = document.createElement('option');
                option.value = p.name;
                option.textContent = p.displayName + (p.isDefault ? ' (Par défaut)' : '');
                if (p.isDefault) option.selected = true;
                select.appendChild(option);
            });
        });
        
        ipcRenderer.on('pdf-save-result', (event, result) => {
            if (result.success) {
                alert(`Fichier PDF exporté avec succès !\nSauvegardé sous : ${result.path}`);
                closePrintPreviewModal();
            } else {
                alert(`Erreur lors de l'exportation PDF : ${result.error}`);
            }
        });
        
        ipcRenderer.on('pdf-temp-result', (event, result) => {
            if (result.success) {
                closePrintPreviewModal();
            } else {
                alert(`Erreur d'impression PDF temporaire : ${result.error}`);
            }
        });
        
        ipcRenderer.on('print-result', (event, result) => {
            if (result.success) {
                alert("Impression lancée avec succès sur votre imprimante !");
                closePrintPreviewModal();
            } else {
                alert(`Erreur d'impression physique : ${result.error}`);
            }
        });
    } catch (e) {
        console.error("Erreur liaison IPC PDF :", e);
    }
}

// Fonction d'impression haute-fidélité via iframe
function printDOMElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
        alert("Erreur : Élément à imprimer introuvable.");
        return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.zIndex = '-99999';
    
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    let stylesHtml = '';
    stylesHtml += `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,800;1,600&display=swap" rel="stylesheet">`;
    
    Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).forEach(styleEl => {
        stylesHtml += styleEl.outerHTML;
    });

    stylesHtml += `
        <style>
            @page {
                size: A4;
                margin: 0;
            }
            body {
                background-color: white !important;
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .a4-sheet {
                box-shadow: none !important;
                margin: 0 !important;
                border: none !important;
                width: 21cm !important;
                min-height: auto !important;
                padding: 0.6cm 1.2cm !important;
                box-sizing: border-box !important;
                position: relative !important;
            }
            table {
                width: 100% !important;
                border-collapse: collapse !important;
                border: 2px solid #1a202c !important;
                margin: 10px 0 !important;
                table-layout: fixed !important;
            }
            th {
                background-color: #eae6df !important;
                color: #1a202c !important;
                font-weight: 800 !important;
                border: 1px solid #2d3748 !important;
                padding: 6px 10px !important;
                font-size: 0.8rem !important;
                text-align: left;
            }
            td {
                border: 1px solid #718096 !important;
                padding: 5px 8px !important;
                font-size: 0.8rem !important;
                color: #2d3748 !important;
                word-break: break-word !important;
                white-space: normal !important;
            }
            .signature-seal-container {
                width: 150px;
                height: 90px;
                position: relative;
                margin: 2px auto;
            }
            .seal-img {
                position: absolute !important;
                top: 2px !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                width: 85px !important;
                height: auto !important;
                opacity: 1 !important;
                display: block !important;
                z-index: 5 !important;
                mix-blend-mode: multiply !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .signature-img {
                position: absolute !important;
                bottom: 2px !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                width: 125px !important;
                height: auto !important;
                display: block !important;
                z-index: 10 !important;
                mix-blend-mode: multiply !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            body td { color: #1a202c !important; }
            body th { background-color: #eae6df !important; color: #1a202c !important; }
            th:nth-child(2), td:nth-child(2) { text-align: center !important; }
            th:nth-child(3), td:nth-child(3) { text-align: right !important; }
            th:nth-child(4), td:nth-child(4) { text-align: right !important; }
            th:nth-child(5), td:nth-child(5) { text-align: right !important; }
            th:nth-child(6), td:nth-child(6) { text-align: right !important; }
            th:nth-child(7), td:nth-child(7) { text-align: right !important; }
            th:nth-child(8), td:nth-child(8) { text-align: right !important; }
            .print-footer {
                margin-top: auto !important;
                text-align: center !important;
                border: 1px solid #4b807b !important;
                background-color: #f4f8f7 !important;
                border-radius: 6px !important;
                padding: 5px 10px !important;
                font-family: 'Inter', sans-serif !important;
                font-size: 0.59rem !important;
                font-weight: 600 !important;
                color: #2d3748 !important;
                line-height: 1.5 !important;
                box-sizing: border-box !important;
                letter-spacing: 0em !important;
                white-space: normal !important;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02) !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                page-break-inside: avoid !important;
                width: 100% !important;
            }
            .bill-page-bottom-block {
                margin-top: auto !important;
                width: 100% !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 4px !important;
                page-break-inside: avoid !important;
            }
            .a4-sheet > div {
                display: flex !important;
                flex-direction: column !important;
                flex-grow: 1 !important;
                min-height: 28.5cm !important;
                box-sizing: border-box !important;
            }
            .bill-summary {
                margin-top: 6px !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 4px !important;
                width: 320px !important;
                align-self: flex-end !important;
                margin-left: auto !important;
                border-top: 2px solid #cbd5e0 !important;
                padding-top: 8px !important;
            }
            .summary-row {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                font-size: 0.82rem !important;
                width: 100% !important;
            }
            .summary-row.total {
                font-size: 0.98rem !important;
                font-weight: 800 !important;
                color: #1a202c !important;
                border-top: 1px dashed #cbd5e0 !important;
                padding-top: 5px !important;
                margin-top: 2px !important;
            }
        </style>
    `;

    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Impression Clinique Mercy Fiat</title>
            ${stylesHtml}
        </head>
        <body>
            <div class="a4-sheet">
                ${element.innerHTML}
            </div>
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.focus();
                        window.print();
                    }, 250);
                };
            </script>
        </body>
        </html>
    `);
    doc.close();

    setTimeout(() => {
        iframe.remove();
    }, 6000);
}
window.printDOMElement = printDOMElement;

// Lancer l'impression physique native en tâche de fond
function launchSilentPrint() {
    if (typeof require !== 'undefined') {
        try {
            const { ipcRenderer } = require('electron');
            const printerName = document.getElementById('print-device').value;
            const copies = parseInt(document.getElementById('print-copies').value) || 1;
            const colorMode = document.getElementById('print-color').value;
            const marginsType = document.getElementById('print-margins').value;
            
            if (!printerName) {
                alert("Veuillez sélectionner une imprimante.");
                return;
            }
            
            ipcRenderer.send('silent-print', {
                printerName,
                copies,
                isMono: colorMode === 'mono',
                marginsType
            });
        } catch (e) {
            console.error("Erreur Impression Silencieuse :", e);
            printDOMElement('modal-a4-sheet');
        }
    } else {
        printDOMElement('modal-a4-sheet');
    }
}
window.launchSilentPrint = launchSilentPrint;
