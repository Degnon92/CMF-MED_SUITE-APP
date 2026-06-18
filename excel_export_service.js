/* ============================================================
   excel_export_service.js - Service d'Exports de Classeurs Excel
   ============================================================ */

// Pré-chargement des modules Node & ExcelJS pour éviter le blocage du thread lors de l'exportation
const path = require('path');
const os = require('os');
let ExcelJS;
try {
    ExcelJS = require('exceljs');
} catch (e) {
    console.error("Erreur de pré-chargement global d'ExcelJS :", e);
}

// Fonction résiliente pour obtenir l'instance de SheetJS (XLSX) de manière dynamique et sans conflit de portée
function getXLSXInstance() {
    if (typeof window !== 'undefined' && window.XLSX) {
        return window.XLSX;
    }
    if (typeof global !== 'undefined' && global.XLSX) {
        return global.XLSX;
    }
    if (typeof require !== 'undefined') {
        try {
            const path = require('path');
            const baseDir = (typeof __dirname !== 'undefined') ? __dirname : '.';
            return require(path.join(baseDir, 'assets', 'xlsx.full.min.js'));
        } catch (e) {
            try {
                return require('./assets/xlsx.full.min.js');
            } catch (err) {
                console.error("SheetJS (XLSX) non détecté dans l'environnement de rendu :", err);
            }
        }
    }
    return null;
}

// Exporte le registre COMPLET (Financier + Clinique) dans un seul classeur Excel multi-feuilles
function exportFullRegisterToExcel() {
    const XLSX = getXLSXInstance();
    if (!XLSX) {
        alert("Erreur : Bibliothèque d'export Excel (SheetJS) introuvable.");
        return;
    }
    if (savedBills.length === 0 && savedDocuments.length === 0) {
        alert("Le registre est vide. Rien à exporter !");
        return;
    }
    
    try {
        // A. Création du classeur Excel vide
        const wb = XLSX.utils.book_new();
        
        // B. Construction de la feuille "Registre Financier (Facturation)"
        const financialData = savedBills.map(b => ({
            "Date": b.date,
            "ID Fiche": b.id,
            "Nom Patient": b.patientNom,
            "Prénom Patient": b.patientPrenom,
            "Type Fiche": b.type === 'PROFORMA' ? 'Facture Proforma' : (b.type === 'DETAIL_ASSUR' ? (b.insurance === 'PRIVE' ? 'Détail Prestations Proforma' : 'Détail Assurance Proforma') : (b.type === 'AVOIR' ? 'Facture d\'Avoir' : 'Point d\'Hospitalisation')),
            "Assurance": b.insurance,
            "Couverture (%)": b.coverage,
            "Matricule": b.matricule,
            "Montant Brut (FCFA)": b.grossTotal,
            "Part Assurance (FCFA)": b.partAssurance,
            "Ticket Modérateur Patient (FCFA)": b.partPatient
        }));
        
        const wsFinancial = XLSX.utils.json_to_sheet(financialData);
        XLSX.utils.book_append_sheet(wb, wsFinancial, "Registre Financier");
        
        // C. Construction de la feuille "Registre Clinique (Dossiers)"
        const clinicalTemplatesNames = {
            cro_lca: 'Compte-Rendu Opératoire Genou',
            cro_rtup: 'Compte-Rendu Opératoire Prostate',
            cro_cmf: 'Compte-Rendu Opératoire Maxillo-Facial',
            certif_repos: 'Certificat Repos Médical',
            certif_reprise: 'Certificat Reprise de Travail',
            rapport_cons: 'Rapport de Consultation',
            rapport_hospi: 'Rapport d\'Hospitalisation'
        };
        
        const clinicalData = savedDocuments.map(d => ({
            "Date": d.date,
            "ID Fiche": d.id,
            "Nom Patient": d.patientNom,
            "Prénom Patient": d.patientPrenom,
            "Âge": d.patientAge,
            "Type Document": clinicalTemplatesNames[d.templateId] || d.templateId,
            "Diagnostic / Motif": d.diagnosis,
            "Texte Rédigé": (d.content || d.text || '').substring(0, 150) + "..." // Petit aperçu
        }));
        
        const wsClinical = XLSX.utils.json_to_sheet(clinicalData);
        XLSX.utils.book_append_sheet(wb, wsClinical, "Registre Clinique");
        
        // D. Lancer le téléchargement dans le dossier Téléchargements
        const filename = `REGISTRE_CLINIQUE_MERCY_FIAT_${new Date().getFullYear()}.xlsx`;
        const savePath = path.join(os.homedir(), 'Downloads', filename);
        XLSX.writeFile(wb, savePath);
        alert(`Registre général Excel (.xlsx) exporté avec succès !\n\nSauvegardé sous : ${savePath}\n\nLe fichier va s'ouvrir automatiquement dans Excel.`);
        const { shell } = require('electron');
        shell.openPath(savePath);
    } catch (err) {
        console.error(err);
        alert("Erreur lors de la génération du fichier Excel : " + err.message);
    }
}

// Exporte une facture/proforma individuelle active sous forme de tableau Excel hautement stylé
function exportSingleBillToExcel(bill = null) {
    try {
        if (!ExcelJS) {
            try {
                ExcelJS = require('exceljs');
            } catch (e) {
                alert("Erreur : Le moteur d'exportation Excel (ExcelJS) n'a pas pu être initialisé.");
                return;
            }
        }
        
        let patientNom, patientPrenom, billType, insurance, coverage, patientType, useSplit, items, grossTotal, totalPartAssurance, totalPartPatient, discountType, discountPct, reductionAmount, discountedTotal, discountLabel, paymentMethodId, amountPaidPatient, balancePatient, paymentName;
        let billDateInput, refNumStr, diagStr, matriculeVal, interventionText, customTitle;

        if (bill) {
            patientNom = (bill.patientNom || "PARAISO").toUpperCase();
            patientPrenom = bill.patientPrenom || "Alex";
            billType = bill.type || 'PROFORMA';
            insurance = bill.insurance || 'PRIVE';
            coverage = parseFloat(bill.coverage) || 0;
            patientType = bill.patientType || (bill.insurance === 'PRIVE' ? 'PRIVE' : 'MALADIE');
            useSplit = bill.useSplit || false;
            
            items = (bill.items || []).map(item => ({
                name: item.name,
                qty: item.qty,
                price: item.price,
                subtotal: item.subtotal,
                limit: item.splitLimit !== undefined ? item.splitLimit : (item.limit !== undefined ? item.limit : item.subtotal),
                rate: item.splitRate !== undefined ? item.splitRate : (item.rate !== undefined ? item.rate : 0),
                partAssurance: item.partAssurance || 0,
                partPatient: item.partPatient || item.subtotal
            }));
            
            grossTotal = bill.grossTotal;
            totalPartAssurance = bill.partAssurance || 0;
            totalPartPatient = bill.partPatient || 0;
            discountType = bill.discountType || 'PERCENT';
            discountPct = bill.discountPct || 0;
            reductionAmount = bill.reductionAmount || 0;
            discountedTotal = bill.discountedTotal || grossTotal;
            discountLabel = discountType === 'PERCENT' ? `(${Math.round(discountPct)}%)` : `(Remise)`;
            paymentMethodId = bill.paymentMethod || "CASH";
            
            const totalPatientShare = (patientType !== 'PRIVE') ? totalPartPatient : discountedTotal;
            amountPaidPatient = bill.amountPaidPatient !== undefined ? bill.amountPaidPatient : totalPatientShare;
            balancePatient = totalPatientShare - amountPaidPatient;
            
            const paymentNames = {
                CASH: 'Espèces (Cash)',
                BANK_TRANSFER: 'Virement Bancaire',
                CHECK: 'Chèque Bancaire',
                MOBILE_MONEY: 'Mobile Money',
                TIERS_PAYANT: 'Attente Tiers-Payant'
            };
            paymentName = paymentNames[paymentMethodId] || 'Espèces';

            billDateInput = bill.date;
            refNumStr = bill.reference;
            diagStr = bill.diagnostic || bill.diagnosis || "";
            matriculeVal = bill.matricule || "Non spécifié";
            interventionText = bill.intervention || bill.interventionName || "";
            customTitle = bill.customTitle || "Point Définitif d'Hospitalisation";
        } else {
            patientNom = (document.getElementById('bill-patient-nom').value || "PARAISO").toUpperCase();
            patientPrenom = document.getElementById('bill-patient-prenom').value || "Alex";
            billType = document.getElementById('bill-type').value;
            insurance = document.getElementById('bill-insurance').value;
            coverage = parseFloat(document.getElementById('bill-coverage').value) || 0;
            patientType = document.getElementById('bill-patient-type')?.value || "PRIVE";
            const useSplitRaw = document.getElementById('bill-use-split')?.checked || false;
            useSplit = (patientType !== 'PRIVE') && (billType === 'DETAIL_ASSUR' || useSplitRaw);
            
            // A. Collecte et validation des items (avec gestion de la remise et de l'assurance)
            items = [];
            grossTotal = 0;
            totalPartAssurance = 0;
            totalPartPatient = 0;
            
            const rows = document.querySelectorAll('#billing-items-container .item-row');
            rows.forEach(row => {
                const name = row.querySelector('.item-name')?.value.trim() || "";
                const price = parseFloat(row.querySelector('.item-price')?.value) || 0;
                const qty = parseInt(row.querySelector('.item-qty')?.value) || 1;
                const subtotal = price * qty;
                
                if (name) {
                    let partAssurance = 0;
                    let partPatient = subtotal;
                    let itemLimit = subtotal;
                    let itemRate = (patientType !== 'PRIVE') ? coverage : 0;
                    
                    if (patientType !== 'PRIVE') {
                        if (useSplit) {
                            const limitRaw = parseFloat(row.querySelector('.item-split-limit')?.value);
                            itemLimit = isNaN(limitRaw) ? subtotal : limitRaw;
                            const rateRaw = parseFloat(row.querySelector('.item-split-rate')?.value);
                            itemRate = isNaN(rateRaw) ? 0 : rateRaw;
                            partAssurance = Math.round(itemLimit * (itemRate / 100));
                            partPatient = subtotal - partAssurance;
                        } else {
                            partAssurance = Math.round(subtotal * (coverage / 100));
                            partPatient = subtotal - partAssurance;
                        }
                    }
                    
                    grossTotal += subtotal;
                    totalPartAssurance += partAssurance;
                    totalPartPatient += partPatient;
                    
                    items.push({
                        name,
                        qty,
                        price,
                        subtotal,
                        limit: itemLimit,
                        rate: itemRate,
                        partAssurance,
                        partPatient
                    });
                }
            });
            
            if (items.length === 0) {
                alert("Veuillez saisir des frais avant d'exporter.");
                return;
            }
            
            // Calcul des réductions (identique à la logique applicative de billing.js)
            const discountTypeEl = document.getElementById('bill-discount-type');
            const discountValueEl = document.getElementById('bill-discount-value');
            discountPct = 0;
            reductionAmount = 0;
            discountType = 'PERCENT';

            if (discountTypeEl && discountValueEl) {
                discountType = discountTypeEl.value;
                const val = parseFloat(discountValueEl.value || 0);
                if (discountType === 'PERCENT') {
                    discountPct = val;
                    reductionAmount = Math.round(grossTotal * (discountPct / 100));
                } else {
                    reductionAmount = Math.round(val);
                    discountPct = grossTotal > 0 ? (reductionAmount / grossTotal) * 100 : 0;
                }
            }
            discountedTotal = grossTotal - reductionAmount;
            
            // Ajustement proportionnel aux parts splitées/assurance
            if (reductionAmount > 0) {
                const splitDiscountRatio = grossTotal > 0 ? discountedTotal / grossTotal : 1;
                totalPartAssurance = Math.round(totalPartAssurance * splitDiscountRatio);
                totalPartPatient = discountedTotal - totalPartAssurance;
                
                items.forEach(item => {
                    const itemDiscountedSubtotal = Math.round(item.subtotal * splitDiscountRatio);
                    item.partAssurance = Math.round(item.partAssurance * splitDiscountRatio);
                    item.partPatient = itemDiscountedSubtotal - item.partAssurance;
                });
            }
            
            discountLabel = discountType === 'PERCENT' ? `(${Math.round(discountPct)}%)` : `(Remise)`;
            
            // Mode de règlement et montants encaissés/reste à charge
            paymentMethodId = document.getElementById('bill-payment-method')?.value || "CASH";
            const rawAmountPaid = parseFloat(document.getElementById('bill-amount-paid-patient')?.value);
            
            const totalPatientShare = (patientType !== 'PRIVE') ? totalPartPatient : discountedTotal;
            amountPaidPatient = isNaN(rawAmountPaid) ? totalPatientShare : Math.min(rawAmountPaid, totalPatientShare);
            balancePatient = totalPatientShare - amountPaidPatient;
            
            const paymentNames = {
                CASH: 'Espèces (Cash)',
                BANK_TRANSFER: 'Virement Bancaire',
                CHECK: 'Chèque Bancaire',
                MOBILE_MONEY: 'Mobile Money',
                TIERS_PAYANT: 'Attente Tiers-Payant'
            };
            paymentName = paymentNames[paymentMethodId] || 'Espèces';

            billDateInput = document.getElementById('bill-date')?.value;
            refNumStr = document.getElementById('bill-reference')?.value || `MF-PRO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-XXXX`;
            diagStr = document.getElementById('bill-diagnostic')?.value?.trim() || "";
            matriculeVal = document.getElementById('bill-matricule')?.value || "Non spécifié";
            interventionText = document.getElementById('bill-intervention')?.value || "";
            customTitle = document.getElementById('bill-title-custom')?.value || 'POINT DEFINITIF';
        }
        
        // B. Création du Workbook ExcelJS
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Facture Médicale', {
            pageSetup: {
                paperSize: 9, // A4
                orientation: 'portrait',
                fitToPage: true,
                fitToWidth: 1
            }
        });
        
        worksheet.pageSetup.margins = {
            left: 0.4, right: 0.4,
            top: 0.8, bottom: 0.6,
            header: 0.3, footer: 0.4
        };
        worksheet.pageSetup.fitToPage = true;
        worksheet.pageSetup.fitToWidth = 1;
        // Supprimer fitToHeight pour éviter un bug de sérialisation XML connu d'ExcelJS
        delete worksheet.pageSetup.fitToHeight;
        
        // Pied de page officiel sur 2 lignes — \n dans oddFooter est supporté nativement par ExcelJS
        worksheet.headerFooter.oddFooter =
            '&C&8SEME AGUE PK 18  |  Tel : +229 69 62 02 02 / 98 00 00 55  |  Cotonou Vodje  |  Tel : +229 69 02 11 11 / 98 70 98 98\n' +
            '&C&8E-mail : cliniquemercyfiat@gmail.com  /  ORABANK Cpte bancaire : 02170730 0 201  /  N IFU : 3201710045937  /  N RCCM-RB-COT-17-B-19317';
        worksheet.headerFooter.differentFirst = false;
        worksheet.headerFooter.differentOddEven = false;
        
        // Configuration des largeurs de colonnes
        worksheet.columns = useSplit ? [
            { key: 'desc', width: 34 },
            { key: 'qty', width: 6 },
            { key: 'price', width: 12 },
            { key: 'subtotal', width: 13 },
            { key: 'limit', width: 13 },
            { key: 'assurance', width: 13 },
            { key: 'patient', width: 14 }
        ] : [
            { key: 'desc', width: 48 },
            { key: 'qty', width: 7 },
            { key: 'price', width: 13 },
            { key: 'subtotal', width: 16 }
        ];
        
        // C. Insertion du Logo Officiel en haut à gauche (Lignes 1 à 3, Colonne A)
        const baseDir = (typeof __dirname !== 'undefined') ? __dirname : '.';
        const logoPath = path.join(baseDir, 'assets', 'logo_clinique.jpg');
        const fs = require('fs');
        if (fs.existsSync(logoPath)) {
            try {
                const logoImageId = workbook.addImage({
                    filename: logoPath,
                    extension: 'jpeg',
                });
                worksheet.addImage(logoImageId, {
                    tl: { col: 0, row: 0 },
                    br: { col: 1, row: 3 }
                });
            } catch (logoErr) {
                console.error("Erreur de chargement du logo Excel :", logoErr);
            }
        }
        
        // D. Construction de l'en-tête
        const lastColLetter = useSplit ? 'G' : 'D';
        const numCols = useSplit ? 7 : 4;
        
        worksheet.getRow(1).height = 30;
        worksheet.getRow(2).height = 18;
        worksheet.getRow(3).height = 16;
        worksheet.getRow(4).height = 14;
        worksheet.getRow(5).height = 13;
        
        // 1. Titre Principal centré sur toute la largeur
        worksheet.mergeCells(`A1:${lastColLetter}1`);
        const titleCell = worksheet.getCell('A1');
        titleCell.value = 'CLINIQUE MERCY FIAT';
        titleCell.font = { name: 'Outfit', size: 16, bold: true, color: { argb: 'FF2D3748' } };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        
        // 2. Spécialité 1 — centrée
        worksheet.mergeCells(`A2:${lastColLetter}2`);
        const subCell = worksheet.getCell('A2');
        subCell.value = 'MEDECINE GENERALE - SPECIALITES MEDICALES ET CHIRURGICALES - LABORATOIRE';
        subCell.font = { name: 'Inter', size: 8.5, bold: true, color: { argb: 'FF4A5568' } };
        subCell.alignment = { vertical: 'middle', horizontal: 'center' };
        
        // 3. Spécialité 2 — centrée
        worksheet.mergeCells(`A3:${lastColLetter}3`);
        const cardCell = worksheet.getCell('A3');
        cardCell.value = 'CARDIOLOGIE 7J/7';
        cardCell.font = { name: 'Inter', size: 8.5, bold: true, color: { argb: 'FF4A5568' } };
        cardCell.alignment = { vertical: 'middle', horizontal: 'center' };
        
        // 4. Ligne Adresse — centrée, résumée
        worksheet.mergeCells(`A4:${lastColLetter}4`);
        const addrCell = worksheet.getCell('A4');
        addrCell.value = 'SEME AGUE PK 18  |  Tel : +229 69 62 02 02 / 98 00 00 55  |  Cotonou Vodje  |  Tel : +229 69 02 11 11 / 98 70 98 98';
        addrCell.font = { name: 'Inter', size: 7.5, italic: true, color: { argb: 'FF718096' } };
        addrCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };
        
        // 5. Double ligne de séparation sous l'en-tête
        for (let col = 1; col <= numCols; col++) {
            const cell = worksheet.getCell(4, col);
            cell.border = {
                bottom: { style: 'double', color: { argb: 'FF2D3748' } }
            };
        }
        
        // E. Bloc d'informations Patient (Lignes 6 à 8)
        worksheet.getRow(6).height = 20;
        worksheet.getRow(7).height = 20;
        worksheet.getRow(8).height = 20;
        worksheet.getRow(9).height = 12; // Vide
        
        // Patient & Date
        if (!billDateInput) {
            billDateInput = document.getElementById('bill-date')?.value;
        }
        const dateFormatted = billDateInput
            ? new Date(billDateInput + (billDateInput.includes('T') ? '' : 'T12:00:00')).toLocaleDateString('fr-FR')
            : new Date().toLocaleDateString('fr-FR');
            
        worksheet.mergeCells(`A6:${useSplit ? 'D' : 'B'}6`);
        const patCell = worksheet.getCell('A6');
        patCell.value = `Patient : ${patientNom} ${patientPrenom}`;
        patCell.font = { name: 'Inter', size: 10, bold: true, color: { argb: 'FF2D3748' } };
        patCell.alignment = { vertical: 'middle', horizontal: 'left' };
        
        worksheet.mergeCells(`${useSplit ? 'E' : 'C'}6:${lastColLetter}6`);
        const dateCell = worksheet.getCell(`${useSplit ? 'E' : 'C'}6`);
        dateCell.value = `Date : ${dateFormatted}`;
        dateCell.font = { name: 'Inter', size: 10, bold: true, color: { argb: 'FF2D3748' } };
        dateCell.alignment = { vertical: 'middle', horizontal: 'right' };
        
        // Organisme & Réf
        worksheet.mergeCells(`A7:${useSplit ? 'D' : 'B'}7`);
        const insCell = worksheet.getCell('A7');
        if (patientType === 'PRIVE') {
            insCell.value = `Prise en Charge : Secteur Privé (100% Patient)`;
        } else if (patientType === 'MALADIE') {
            insCell.value = `Organisme : ${insurance} (Mutuelle ${coverage}%)`;
        } else {
            insCell.value = `Prise en Charge : Sinistre Automobile (Accord ${coverage}%)`;
        }
        insCell.font = { name: 'Inter', size: 10, bold: true, color: { argb: 'FF2D3748' } };
        insCell.alignment = { vertical: 'middle', horizontal: 'left' };
        
        worksheet.mergeCells(`${useSplit ? 'E' : 'C'}7:${lastColLetter}7`);
        const refCell = worksheet.getCell(`${useSplit ? 'E' : 'C'}7`);
        if (!refNumStr) {
            refNumStr = document.getElementById('bill-reference')?.value || `MF-PRO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-XXXX`;
        }
        refCell.value = `Réf : ${refNumStr}`;
        refCell.font = { name: 'Inter', size: 10, bold: true, color: { argb: 'FF2D3748' } };
        refCell.alignment = { vertical: 'middle', horizontal: 'right' };
        
        // Diagnostic / Matricule & Type Document
        const fullName = `${patientNom} ${patientPrenom}`.toLowerCase().trim();
        const dbPatient = (typeof window !== 'undefined' && window.MercyFiatDB && window.MercyFiatDB.PATIENTS) ?
            window.MercyFiatDB.PATIENTS.find(p => {
                const pName = p.name.toLowerCase();
                return pName.includes(fullName) || fullName.includes(pName) || pName.includes(patientNom.toLowerCase());
            }) : null;
            
        if (!diagStr) {
            diagStr = document.getElementById('bill-diagnostic')?.value?.trim() || "";
            if (!diagStr) {
                if (dbPatient && dbPatient.diagnosis && dbPatient.diagnosis !== "N/A") {
                    diagStr = dbPatient.diagnosis;
                } else {
                    const diagEl = document.getElementById('dme-patient-diagnosis');
                    if (diagEl && diagEl.textContent && diagEl.textContent !== '--' && diagEl.textContent !== 'N/A') {
                        diagStr = diagEl.textContent;
                    }
                }
            }
        }
        
        worksheet.mergeCells(`A8:${useSplit ? 'D' : 'B'}8`);
        const diagCell = worksheet.getCell('A8');
        let detailStr = "";
        if (!matriculeVal) {
            matriculeVal = document.getElementById('bill-matricule')?.value || "Non spécifié";
        }
        
        if (patientType === 'PRIVE') {
            detailStr = diagStr ? `Diagnostic : ${diagStr}` : "";
        } else if (patientType === 'MALADIE') {
            detailStr = `N° Assuré / Matricule : ${matriculeVal}`;
        } else {
            detailStr = `Organisme : ${insurance}  •  N° de Sinistre / Bon : ${matriculeVal}`;
        }
        diagCell.value = detailStr;
        diagCell.font = { name: 'Inter', size: 10, bold: true, color: { argb: 'FF2D3748' } };
        diagCell.alignment = { vertical: 'middle', horizontal: 'left' };
        
        worksheet.mergeCells(`${useSplit ? 'E' : 'C'}8:${lastColLetter}8`);
        const typeCell = worksheet.getCell(`${useSplit ? 'E' : 'C'}8`);
        const billTypeName = billType === 'PROFORMA' ? 'Facture Proforma (Devis)' : (billType === 'DETAIL_ASSUR' ? (patientType === 'PRIVE' ? 'Détail Prestations' : 'Détail Assurance') : 'Point d\'Hospitalisation');
        typeCell.value = `(${billTypeName})`;
        typeCell.font = { name: 'Inter', size: 10, italic: true, color: { argb: 'FF718096' } };
        typeCell.alignment = { vertical: 'middle', horizontal: 'right' };
        
        // F. Intervention (Ligne 10)
        worksheet.getRow(10).height = 20;
        worksheet.mergeCells(`A10:${lastColLetter}10`);
        const intervCell = worksheet.getCell('A10');
        if (!interventionText) {
            interventionText = document.getElementById('bill-intervention')?.value || "";
        }
        intervCell.value = `INTERVENTION : ${interventionText.toUpperCase()}`;
        intervCell.font = { name: 'Inter', size: 10, bold: true, color: { argb: 'FF2D3748' } };
        intervCell.alignment = { vertical: 'middle', horizontal: 'left' };
        
        // K-Code
        let kCode = "";
        const kMatch = interventionText.match(/K\d+/i);
        if (kMatch) {
            kCode = kMatch[0].toUpperCase();
        } else if (dbPatient && dbPatient.kCode) {
            kCode = dbPatient.kCode.toUpperCase();
        }
        
        let currentTableStartRow = 13;
        if (kCode) {
            worksheet.getRow(11).height = 20;
            worksheet.mergeCells(`A11:${lastColLetter}11`);
            const kCell = worksheet.getCell('A11');
            kCell.value = kCode;
            kCell.font = { name: 'Inter', size: 10, bold: true, color: { argb: 'FF2D3748' } };
            kCell.alignment = { vertical: 'middle', horizontal: 'left' };
            currentTableStartRow = 14;
        }
        
        // Titre de facture
        const titleRowIdx = currentTableStartRow - 2;
        worksheet.getRow(titleRowIdx).height = 25;
        worksheet.mergeCells(`A${titleRowIdx}:${lastColLetter}${titleRowIdx}`);
        const docTitleCell = worksheet.getCell(`A${titleRowIdx}`);
        if (!customTitle) {
            customTitle = document.getElementById('bill-title-custom')?.value || 'POINT DEFINITIF';
        }
        const titleStr = billType === 'PROFORMA' ? 'FACTURE PROFORMA' : 
                         (billType === 'DETAIL_ASSUR' ? (patientType === 'SINISTRE' ? 'DETAIL PRISE EN CHARGE SINISTRE AUTOMOBILE' : (patientType === 'PRIVE' ? 'DETAIL PRESTATIONS FACTURE PROFORMA' : 'DETAIL ASSURANCE FACTURE PROFORMA')) : customTitle.toUpperCase());
        docTitleCell.value = titleStr;
        docTitleCell.font = { name: 'Outfit', size: 13, bold: true, color: { argb: 'FF2D3748' } };
        docTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        
        // G. En-tête du Tableau
        const tableHeaders = useSplit ? 
            ['ACTES / DESIGNATIONS', 'QTE', 'P. UNITAIRE', 'MONTANT CLINIQUE', 'PLAFOND', 'PART ASSURANCE', 'PART PATIENT'] :
            ['Désignation des Prestations et Consommables', 'Qté', 'P.U.', 'Total'];
            
        const headerRow = worksheet.getRow(currentTableStartRow);
        headerRow.height = 28;
        
        for (let colIdx = 1; colIdx <= numCols; colIdx++) {
            const cell = headerRow.getCell(colIdx);
            cell.value = tableHeaders[colIdx - 1];
            cell.font = { name: 'Inter', size: 9.5, bold: true, color: { argb: 'FF1A202C' } };
            cell.alignment = { vertical: 'middle', horizontal: colIdx === 1 ? 'left' : (colIdx === 2 ? 'center' : 'right') };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFEAE6DF' }
            };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFCBD5E0' } },
                bottom: { style: 'medium', color: { argb: 'FF718096' } },
                left: { style: 'thin', color: { argb: 'FFCBD5E0' } },
                right: { style: 'thin', color: { argb: 'FFCBD5E0' } }
            };
        }
        
        // H. Injection des items
        let currentRow = currentTableStartRow + 1;
        
        const itemsData = [];
        items.forEach(item => {
            if (useSplit) {
                const assuranceVal = (billType === 'PROFORMA') ? 0 : item.partAssurance;
                const patientVal = (billType === 'PROFORMA') ? 0 : item.partPatient;
                itemsData.push([item.name, item.qty, item.price, item.subtotal, item.limit, assuranceVal, patientVal]);
            } else {
                itemsData.push([item.name, item.qty, item.price, item.subtotal]);
            }
        });

        itemsData.forEach(item => {
            const row = worksheet.getRow(currentRow);
            row.height = 22;
            
            for (let colIdx = 1; colIdx <= numCols; colIdx++) {
                const cell = row.getCell(colIdx);
                cell.value = item[colIdx - 1];
                cell.font = { name: 'Inter', size: 9.5, color: { argb: 'FF2D3748' } };
                
                if (colIdx === 1) {
                    cell.alignment = { vertical: 'middle', horizontal: 'left' };
                } else if (colIdx === 2) {
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                } else {
                    cell.alignment = { vertical: 'middle', horizontal: 'right' };
                    cell.numFmt = '#,##0';
                }
                
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFCBD5E0' } },
                    bottom: { style: 'thin', color: { argb: 'FFCBD5E0' } },
                    left: { style: 'thin', color: { argb: 'FFCBD5E0' } },
                    right: { style: 'thin', color: { argb: 'FFCBD5E0' } }
                };
            }
            currentRow++;
        });
        
        // I. Ligne de Totalisation (TOTAL)
        const totalAssurance = (billType === 'PROFORMA') ? 0 : totalPartAssurance;
        const totalPatient = (billType === 'PROFORMA') ? 0 : totalPartPatient;
        
        const totalRow = useSplit ?
            ['TOTAL ', '', '', grossTotal, '', totalAssurance, totalPatient] :
            ['TOTAL ', '', '', grossTotal];
            
        const totalRowObj = worksheet.getRow(currentRow);
        totalRowObj.height = 24;
        
        for (let colIdx = 1; colIdx <= numCols; colIdx++) {
            const cell = totalRowObj.getCell(colIdx);
            cell.value = totalRow[colIdx - 1];
            cell.font = { name: 'Inter', size: 10, bold: true, color: { argb: 'FF1A202C' } };
            cell.alignment = { vertical: 'middle', horizontal: colIdx === 1 ? 'left' : (colIdx === 2 ? 'center' : 'right') };
            
            if (colIdx > 2 && cell.value !== '') {
                cell.numFmt = '#,##0';
            }
            
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF718096' } },
                bottom: { style: 'double', color: { argb: 'FF2D3748' } },
                left: { style: 'thin', color: { argb: 'FFCBD5E0' } },
                right: { style: 'thin', color: { argb: 'FFCBD5E0' } }
            };
            
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF7F5F2' }
            };
        }
        
        // J. Bas de page : Somme en toutes lettres & Synthèse financière (Côte à côte)
        const startSummaryRow = currentRow + 2;
        
        // 1. Gauche : Somme en toutes lettres & Mode de règlement
        worksheet.getRow(startSummaryRow).height = 18;
        const wordsLeftColLimit = useSplit ? 4 : 2;
        worksheet.mergeCells(startSummaryRow, 1, startSummaryRow, wordsLeftColLimit);
        const wordsHeaderCell = worksheet.getCell(startSummaryRow, 1);
        wordsHeaderCell.value = "Arrêtée la présente facture à la somme de :";
        wordsHeaderCell.font = { name: 'Inter', size: 9.5, italic: true, color: { argb: 'FF718096' } };
        wordsHeaderCell.alignment = { vertical: 'middle', horizontal: 'left' };
        
        worksheet.getRow(startSummaryRow + 1).height = 28;
        worksheet.mergeCells(startSummaryRow + 1, 1, startSummaryRow + 1, wordsLeftColLimit);
        const wordsValueCell = worksheet.getCell(startSummaryRow + 1, 1);
        const displayTotalShare = (billType === 'PROFORMA' && patientType !== 'PRIVE') ? discountedTotal : totalPatientShare;
        const sumInWords = window.numberToFrenchWords(displayTotalShare).toUpperCase() + " FRANCS CFA";
        wordsValueCell.value = sumInWords;
        wordsValueCell.font = { name: 'Inter', size: 10.5, bold: true, color: { argb: 'FF2D3748' } };
        wordsValueCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        
        if (billType === 'DEFINITIF') {
            worksheet.getRow(startSummaryRow + 3).height = 18;
            worksheet.mergeCells(startSummaryRow + 3, 1, startSummaryRow + 3, wordsLeftColLimit);
            const pmtCell = worksheet.getCell(startSummaryRow + 3, 1);
            pmtCell.value = `Mode de Règlement : ${paymentName}`;
            pmtCell.font = { name: 'Inter', size: 9, bold: true, color: { argb: 'FF718096' } };
            pmtCell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
        
        if (billType === 'PROFORMA' || billType === 'DETAIL_ASSUR') {
            worksheet.getRow(startSummaryRow + 4).height = 24;
            worksheet.mergeCells(startSummaryRow + 4, 1, startSummaryRow + 4, wordsLeftColLimit);
            const profCell = worksheet.getCell(startSummaryRow + 4, 1);
            profCell.value = "La part exacte du patient sera définie après accord formel de l'assurance.";
            profCell.font = { name: 'Inter', size: 8, italic: true, color: { argb: 'FF718096' } };
            profCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        }
        
        // 2. Droite : Résumé financier structuré
        const summaryRows = [];
        summaryRows.push({ label: "Montant Brut Clinique :", val: grossTotal, isBold: false });
        if (reductionAmount > 0) {
            summaryRows.push({ label: `Réduction Accordée ${discountLabel} :`, val: -reductionAmount, isBold: false, color: 'FFC0392B' });
            summaryRows.push({ label: "Total Net Clinique :", val: discountedTotal, isBold: false });
        }
        if (patientType !== 'PRIVE') {
            summaryRows.push({ label: `Part Assurance (${coverage}%) :`, val: -totalAssurance, isBold: false, color: 'FF2980B9' });
            summaryRows.push({ label: "Part Patient (Ticket Mod.) :", val: totalPatient, isBold: true, color: 'FFC0392B' });
        }
        summaryRows.push({ label: "Total à Acquitter Patient :", val: displayTotalShare, isBold: true, isTotal: true });

        if (billType === 'DEFINITIF') {
            summaryRows.push({ label: "Montant Encaissé Patient :", val: amountPaidPatient, isBold: false, color: 'FF38A169' });
            if (balancePatient > 0) {
                summaryRows.push({ label: "Reste à payer Patient :", val: balancePatient, isBold: true, color: 'FFE53E3E' });
            } else {
                summaryRows.push({ label: "Statut Patient :", val: "SOLDÉ", isString: true, isBold: true, color: 'FF38A169' });
            }
        }
        
        let summaryCurrentRow = startSummaryRow;
        summaryRows.forEach(row => {
            worksheet.getRow(summaryCurrentRow).height = 20;
            
            let labelCell, valCell;
            if (useSplit) {
                worksheet.mergeCells(summaryCurrentRow, 5, summaryCurrentRow, 6); // Fusionne E et F
                labelCell = worksheet.getCell(summaryCurrentRow, 5);
                valCell = worksheet.getCell(summaryCurrentRow, 7); // G
            } else {
                worksheet.mergeCells(summaryCurrentRow, 2, summaryCurrentRow, 3); // Fusionne B et C
                labelCell = worksheet.getCell(summaryCurrentRow, 2);
                valCell = worksheet.getCell(summaryCurrentRow, 4); // D
            }
            
            labelCell.value = row.label;
            labelCell.alignment = { vertical: 'middle', horizontal: 'right' };
            labelCell.font = { name: 'Inter', size: row.isTotal ? 9.5 : 9, bold: row.isBold || row.isTotal, color: row.color ? { argb: row.color } : { argb: 'FF2D3748' } };
            
            valCell.value = row.val;
            valCell.alignment = { vertical: 'middle', horizontal: 'right' };
            valCell.font = { name: 'Inter', size: row.isTotal ? 9.5 : 9, bold: row.isBold || row.isTotal, color: row.color ? { argb: row.color } : { argb: 'FF2D3748' } };
            
            if (!row.isString) {
                valCell.numFmt = '#,##0';
            }
            
            // Bordures et arrière-plans
            const cellBorder = {
                top: { style: 'thin', color: { argb: 'FFCBD5E0' } },
                bottom: { style: 'thin', color: { argb: 'FFCBD5E0' } },
                left: { style: 'thin', color: { argb: 'FFCBD5E0' } },
                right: { style: 'thin', color: { argb: 'FFCBD5E0' } }
            };
            
            labelCell.border = cellBorder;
            valCell.border = cellBorder;
            
            if (row.isTotal) {
                const fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF0F6FC' }
                };
                const totalBorder = {
                    top: { style: 'thin', color: { argb: 'FFCBD5E0' } },
                    bottom: { style: 'double', color: { argb: 'FF2D3748' } },
                    left: { style: 'thin', color: { argb: 'FFCBD5E0' } },
                    right: { style: 'thin', color: { argb: 'FFCBD5E0' } }
                };
                labelCell.fill = fill;
                valCell.fill = fill;
                labelCell.border = totalBorder;
                valCell.border = totalBorder;
            }
            
            summaryCurrentRow++;
        });
        
        currentRow = Math.max(startSummaryRow + 5, summaryCurrentRow) + 2;
        
        const dateRowObj = worksheet.getRow(currentRow);
        dateRowObj.height = 20;
        const dateCellIdx = useSplit ? 5 : 3;
        worksheet.mergeCells(currentRow, dateCellIdx, currentRow, numCols);
        const dateCellObj = worksheet.getCell(currentRow, dateCellIdx);
        dateCellObj.value = `Cotonou, le ${dateFormatted}`;
        dateCellObj.font = { name: 'Inter', size: 10, italic: true, color: { argb: 'FF2D3748' } };
        dateCellObj.alignment = { vertical: 'middle', horizontal: 'center' };
        
        currentRow += 2;

        // BUG CORRIGÉ #2 : Les 3 clauses A/B/C en UN SEUL bloc cellule (wrapText) 
        // au lieu de 5 lignes séparées cassées
        const clausesText = [
            'A - Cette facture est susceptible de modifications.',
            "B - Lorsque le patient est assuré, la compagnie d'assurance paie tout ou partie de la facture et il lui revient de payer la différence.",
            "C - Aucune autre tarification n'est acceptée à part celle pratiquée à la Clinique ou préalablement convenue entre les parties."
        ].join('\n');

        worksheet.getRow(currentRow).height = 52; // 3 lignes de texte
        worksheet.mergeCells(currentRow, 1, currentRow, numCols);
        const clCell = worksheet.getCell(currentRow, 1);
        clCell.value = clausesText;
        clCell.font = { name: 'Inter', size: 8.5, italic: true, color: { argb: 'FF718096' } };
        clCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        currentRow++;

        // BUG CORRIGÉ #1 : SUPPRESSION du double footer en cellules
        // Le footer est déjà géré par worksheet.headerFooter.oddFooter (pied de page natif Excel)
        // → On ne rajoute PAS de lignes de cellules footer ici pour éviter le doublon visible

        // Enregistrement du fichier XLSX dans le dossier Téléchargements
        const cleanRef = refNumStr.replace(/[^a-zA-Z0-9-]/g, '_');
        const fileName = `Facture_${patientNom}_${patientPrenom}_${cleanRef}.xlsx`.replace(/\s+/g, '_');
        const savePath = path.join(os.homedir(), 'Downloads', fileName);
        
        workbook.xlsx.writeFile(savePath).then(() => {
            alert(`Facture Excel (.xlsx) premium exportée avec succès !\n\nSauvegardée dans vos Téléchargements :\n${savePath}\n\nL'ouverture automatique dans Excel va être lancée.`);
            const { shell } = require('electron');
            shell.openPath(savePath);
        }).catch(writeErr => {
            console.error("Erreur lors de l'écriture ExcelJS :", writeErr);
            alert("Erreur lors de l'enregistrement du fichier Excel : " + writeErr.message);
        });
        
    } catch (err) {
        console.error("Erreur d'importation ExcelJS :", err);
        alert("Erreur d'initialisation du moteur Excel premium : " + err.message);
    }
}

// Exporte le Dossier DME 360° en fichier Excel multi-onglets structuré
function exportDMEToExcel() {
    const XLSX = getXLSXInstance();
    if (!XLSX) {
        alert("Erreur : Bibliothèque d'export Excel (SheetJS) introuvable.");
        return;
    }
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
    
    let totalBilled = matchedBills.reduce((sum, b) => sum + b.grossTotal, 0);
    let totalInsurance = matchedBills.reduce((sum, b) => sum + b.partAssurance, 0);
    let totalPatient = matchedBills.reduce((sum, b) => sum + b.partPatient, 0);
    
    try {
        const wb = XLSX.utils.book_new();
        
        // Onglet 1 : Synthèse DME
        const summaryRows = [
            ["SYNTHÈSE DU DOSSIER MÉDICAL ÉLECTRONIQUE (DME) 360°"],
            ["CLINIQUE MERCY FIAT - COTONOU, BÉNIN"],
            [],
            ["IDENTITÉ ET DONNÉES CLINIQUES DE BASE"],
            ["Nom & Prénom(s) du Patient", patientName.toUpperCase()],
            ["Âge", patientAge],
            ["Diagnostic Principal", diagnosis],
            ["Acte / Intervention Principale", intervention],
            ["Nomenclature Code K", kCode || "Non spécifié"],
            [],
            ["SYNTHÈSE FINANCIÈRE GLOBALE (FCFA)"],
            ["Total Brut Facturé", totalBilled],
            ["Prises en Charge Mutuelles (Tiers-Payant)", totalInsurance],
            ["Ticket Modérateur (Part Patient)", totalPatient],
            [],
            ["Fiche éditée le", new Date().toLocaleDateString('fr-FR')]
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Synthèse DME");
        
        // Onglet 2 : Actes & Facturation
        const billingData = matchedBills.map(b => ({
            "Référence": b.reference || "N/A",
            "Date": b.date,
            "Type de Fiche": b.type === 'PROFORMA' ? 'Facture Proforma' : (b.type === 'DETAIL_ASSUR' ? (b.insurance === 'PRIVE' ? 'Détail Prestations' : 'Détail Assurance') : (b.type === 'AVOIR' ? 'Facture d\'Avoir' : 'Point d\'Hospitalisation')),
            "Assurance / Tiers-Payant": b.insurance,
            "Couverture (%)": b.coverage,
            "Montant Brut (FCFA)": b.grossTotal,
            "Part Assurance (FCFA)": b.partAssurance,
            "Part Patient (FCFA)": b.partPatient,
            "Statut de Paiement": b.type === 'DEFINITIF' ? (b.status === 'IMPAYÉ' ? 'Impayé' : 'Réglé') : 'N/A',
            "Détail des Actes": b.items.map(item => `${item.name} (${item.qty}x)`).join(', ')
        }));
        
        const wsBilling = XLSX.utils.json_to_sheet(billingData);
        XLSX.utils.book_append_sheet(wb, wsBilling, "Actes & Facturation");
        
        // Onglet 3 : Dossiers Cliniques (CROs & Certificats)
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
        
        const clinicalData = matchedDocs.map(d => ({
            "Date": d.date,
            "Type de Document": clinicalTemplatesNames[d.templateId] || d.templateId,
            "Diagnostic / Motif": d.diagnosis,
            "Contenu Textuel Intégral": d.content || d.text || ''
        }));
        
        const wsClinical = XLSX.utils.json_to_sheet(clinicalData);
        XLSX.utils.book_append_sheet(wb, wsClinical, "Dossiers Cliniques");
        
        // Enregistrer le fichier dans le dossier Téléchargements
        const filename = `DME_${patientName.toUpperCase().replace(/\s+/g, '_')}.xlsx`;
        const savePath = path.join(os.homedir(), 'Downloads', filename);
        XLSX.writeFile(wb, savePath);
        alert(`Dossier DME Excel (.xlsx) exporté avec succès !\n\nSauvegardé sous : ${savePath}\n\nLe fichier va s'ouvrir automatiquement dans Excel.`);
        const { shell } = require('electron');
        shell.openPath(savePath);
        if (typeof closePatientDMEDrawer === 'function') closePatientDMEDrawer();
    } catch (err) {
        console.error(err);
        alert("Erreur lors de la génération du dossier Excel DME : " + err.message);
    }
}

// Exporte une facture directement depuis le registre via son ID
function exportBillToExcelDirectlyFromRegister(itemId) {
    const bills = window.savedBills || [];
    const bill = bills.find(b => b.id === itemId);
    if (!bill) {
        alert("Facture introuvable.");
        return;
    }
    exportSingleBillToExcel(bill);
}

// Liaison globale à window
window.getXLSXInstance = getXLSXInstance;
window.exportFullRegisterToExcel = exportFullRegisterToExcel;
window.exportSingleBillToExcel = exportSingleBillToExcel;
window.exportDMEToExcel = exportDMEToExcel;
window.exportBillToExcelDirectlyFromRegister = exportBillToExcelDirectlyFromRegister;
