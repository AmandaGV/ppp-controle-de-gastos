const { excelRepository } = require('../dependencies');

async function reloadWorkbook(req, res) {
  try {
    await excelRepository.reloadWorkbook();
    res.json({ message: 'Workbook recarregado com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function initWorkbook(req, res) {
  try {
    await excelRepository.reloadWorkbook();
    res.json({ message: 'Workbook inicializado com sucesso.', path: excelRepository.filePath });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getConsolidatedSheet(req, res) {
  try {
    const Layout = require('../services/layoutService');
    const layout = new Layout(excelRepository);

    // load workbook and main sheet
    const workbook = await excelRepository.loadWorkbook();
    const sheet = await excelRepository.getSheet();

    // months (header columns)
    const months = await layout.listMonths();

    // payment methods sheet content
    const pmSheet = await layout.findPaymentMethodsSheet();
    const paymentMethods = [];
    for (let r = 1; r <= pmSheet.rowCount; r += 1) {
      const v = pmSheet.getRow(r).getCell(1).value;
      if (v && String(v).trim()) paymentMethods.push(String(v).trim());
    }

    // read rows and map month columns to values/payment
    const rows = [];
    let currentCategory = null;
    for (let r = 1; r <= sheet.rowCount; r += 1) {
      const row = sheet.getRow(r);
      let category = null;
      let subcategory = null;
      if (layout.isCategoryRow(sheet, r)) {
        currentCategory = row.getCell(2).value || null;
        category = currentCategory;
      } else if (layout.isSubcategoryRow(sheet, r)) {
        category = currentCategory;
        subcategory = row.getCell(2).value || null;
      }
      const cells = {};
      for (const m of months) {
        const valueCell = row.getCell(m.valueColumn).value;
        const paymentCell = row.getCell(m.paymentColumn).value;
        cells[m.label] = { value: valueCell == null ? null : valueCell, payment: paymentCell == null ? null : paymentCell };
      }
      rows.push({ rowNumber: r, category, subcategory, cells });
    }

    res.json({ sheetName: sheet.name, rowCount: sheet.rowCount, columnCount: sheet.columnCount, months, paymentMethods, rows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { reloadWorkbook, initWorkbook, getConsolidatedSheet };
