const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const pdfPath = "c:\\Users\\Degnon\\Documents\\2.MERCY FIAT CLINIQUE\\2. Dr Gipsy\\PROFORMA CHIRURGIE\\PROFORMA_KELLY ELIAS_OSTEOSYNTHESE CLAVICULE.pdf";

fs.readFile(pdfPath, (err, dataBuffer) => {
    if (err) {
        console.error("Erreur lors de la lecture du fichier :", err);
        return;
    }

    pdf(dataBuffer).then(function(data) {
        console.log("=== CONTENU PDF EXTRACT ===");
        console.log(data.text);
        console.log("===========================");
    }).catch(err => {
        console.error("Erreur lors de la conversion PDF :", err);
    });
});
