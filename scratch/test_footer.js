const ExcelJS = require('exceljs');
const path = require('path');

const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Test Footer');

// In ExcelJS, headerFooter is a direct property of worksheet
worksheet.headerFooter.oddFooter = '&C&"Inter,Regular"&8&K4A5568CLINIQUE MERCY FIAT — Autorisation N°060/MS/DC/CGM/CCJ/DNSP/SRS/SA/072SGG21\nAnnexe de Cadjehoun III — Mercy Fiat Group SARL — IFU : 3201710045937 — RCCM : R/COT/17B19317\nTél : +229 01 98 00 00 55 / 01 69 02 11 11 / 01 98 70 98 98 — Email : cliniquemercyfiat@gmail.com';

worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: 'portrait',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0
};

workbook.xlsx.writeFile(path.join(__dirname, 'test_footer_output.xlsx')).then(() => {
    console.log("Written successfully!");
}).catch(err => {
    console.error(err);
});
