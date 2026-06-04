const ExcelJS = require('exceljs');
const path = require('path');

const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Facture Médicale', {
    pageSetup: {
        paperSize: 9, // A4
        orientation: 'portrait',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0
    }
});

// Configure pageSetup properties individually to avoid overriding the PageSetup class prototype!
worksheet.pageSetup.margins = {
    left: 0.4, right: 0.4,
    top: 0.8, bottom: 0.4,
    header: 0.3, footer: 0.3
};
worksheet.pageSetup.fitToPage = true;
worksheet.pageSetup.fitToWidth = 1;
worksheet.pageSetup.fitToHeight = 0;

// Add oddFooter natively on headerFooter property
worksheet.headerFooter.oddFooter = '&C&"Inter,Regular"&8&K4A5568CLINIQUE MERCY FIAT — Autorisation N°060/MS/DC/CGM/CCJ/DNSP/SRS/SA/072SGG21\nAnnexe de Cadjehoun III — Mercy Fiat Group SARL — IFU : 3201710045937 — RCCM : R/COT/17B19317\nTél : +229 01 98 00 00 55 / 01 69 02 11 11 / 01 98 70 98 98 — Email : cliniquemercyfiat@gmail.com';
worksheet.headerFooter.differentFirst = false;

workbook.xlsx.writeFile(path.join(__dirname, 'test_fix_output.xlsx')).then(() => {
    console.log("Fix written successfully!");
}).catch(err => {
    console.error(err);
});
