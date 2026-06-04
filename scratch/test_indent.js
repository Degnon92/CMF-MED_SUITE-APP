const ExcelJS = require('exceljs');
const path = require('path');

const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Test Indent');

worksheet.columns = [{ width: 50 }];

const cell = worksheet.getCell('A1');
cell.value = 'CLINIQUE MERCY FIAT';
cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 13 };

workbook.xlsx.writeFile(path.join(__dirname, 'test_indent_output.xlsx')).then(() => {
    console.log("Written successfully!");
}).catch(err => {
    console.error(err);
});
