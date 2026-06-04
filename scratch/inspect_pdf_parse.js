const pdf = require('pdf-parse');
console.log("PDFParse type:", typeof pdf.PDFParse);
console.log("PDFParse keys:", Object.keys(pdf.PDFParse));
if (typeof pdf.PDFParse === 'function') {
    console.log("PDFParse string:", pdf.PDFParse.toString());
}
