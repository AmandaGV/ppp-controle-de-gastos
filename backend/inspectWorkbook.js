const ExcelJS = require('exceljs');
const path = require('path');
(async () => {
  try {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, '..', 'data', 'PLANILHA CONTROLE DE GASTOS.xlsx');
    await workbook.xlsx.readFile(filePath);
    console.log('sheets:', workbook.worksheets.map((ws) => ws.name));
    const sheet = workbook.worksheets[0];
    console.log('rowCount:', sheet.rowCount, 'columnCount:', sheet.columnCount);
    for (let r = 1; r <= Math.min(20, sheet.rowCount); r += 1) {
      const row = sheet.getRow(r);
      console.log(r, row.values.slice(1, 25));
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
