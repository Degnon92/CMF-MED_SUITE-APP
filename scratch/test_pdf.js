const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = "c:\\Users\\Degnon\\Documents\\2.MERCY FIAT CLINIQUE\\2. Dr Gipsy\\PROFORMA CHIRURGIE\\PROFORMA_KELLY ELIAS_OSTEOSYNTHESE CLAVICULE.pdf";

fs.readFile(pdfPath, async (err, dataBuffer) => {
    if (err) {
        console.error("Erreur de lecture :", err);
        return;
    }

    try {
        const parser = new pdf.PDFParse(new Uint8Array(dataBuffer));
        const res = await parser.getText();
        console.log("=== TXT DE KELLY ===");
        console.log(res.text);
        console.log("====================");
    } catch (e) {
        console.error("Erreur de parsing :", e);
    }
});
