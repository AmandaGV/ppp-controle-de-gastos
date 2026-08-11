class PaymentMethodService {
  constructor(excelRepository) {
    this.excelRepository = excelRepository;
  }

  async getSheet() {
    const workbook = await this.excelRepository.loadWorkbook();
    let sheet = workbook.getWorksheet('Meios de Pagamento');
    if (!sheet) {
      sheet = workbook.addWorksheet('Meios de Pagamento');
      sheet.getRow(1).getCell(1).value = 'Nome';
      await this.excelRepository.saveWorkbook();
    }
    return sheet;
  }

  async listMethods() {
    const sheet = await this.getSheet();
    const methods = [];
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;
      const name = row.getCell(1).value;
      if (name) {
        methods.push({ name: String(name).trim() });
      }
    });
    return methods;
  }

  async addMethod({ name }) {
    if (!name || !String(name).trim()) {
      throw new Error('Nome do meio de pagamento é obrigatório.');
    }

    const sheet = await this.getSheet();
    const methods = await this.listMethods();
    if (methods.some((method) => String(method.name).toLowerCase() === String(name).trim().toLowerCase())) {
      throw new Error('Meio de pagamento já existe.');
    }

    const row = sheet.addRow([String(name).trim()]);
    await this.excelRepository.saveWorkbook();
    return { name: row.getCell(1).value };
  }

  async updateMethod({ currentName, newName }) {
    if (!currentName || !newName) {
      throw new Error('Nome atual e novo nome são obrigatórios.');
    }

    const sheet = await this.getSheet();
    const workbook = await this.excelRepository.loadWorkbook();
    const mainSheet = workbook.worksheets[0];
    const currentLower = String(currentName).trim().toLowerCase();
    const newTrimmed = String(newName).trim();
    let updated = false;

    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;
      const existing = row.getCell(1).value;
      if (existing && String(existing).trim().toLowerCase() === currentLower) {
        row.getCell(1).value = newTrimmed;
        updated = true;
      }
    });

    mainSheet.eachRow({ includeEmpty: false }, (row) => {
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const value = cell.value;
        if (!value || typeof value !== 'string') return;
        const parts = String(value)
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
        const replaced = parts.map((item) => (item.toLowerCase() === currentLower ? newTrimmed : item));
        if (replaced.join(', ') !== String(value).trim()) {
          cell.value = [...new Set(replaced)].join(', ');
          updated = true;
        }
      });
    });

    if (!updated) {
      throw new Error('Meio de pagamento não encontrado.');
    }

    await this.excelRepository.saveWorkbook();
    return { name: newTrimmed };
  }

  async deleteMethod({ name }) {
    if (!name) {
      throw new Error('Nome do meio de pagamento é obrigatório.');
    }

    const sheet = await this.getSheet();
    let deleted = false;
    const rowsToKeep = [];

    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;
      const existing = row.getCell(1).value;
      if (existing && String(existing).trim().toLowerCase() === String(name).trim().toLowerCase()) {
        deleted = true;
        return;
      }
      rowsToKeep.push([row.getCell(1).value]);
    });

    if (!deleted) {
      throw new Error('Meio de pagamento não encontrado.');
    }

    if (sheet.rowCount > 1) {
      sheet.spliceRows(2, sheet.rowCount - 1);
    }
    rowsToKeep.forEach((rowData) => sheet.addRow(rowData));
    await this.excelRepository.saveWorkbook();
    return { message: 'Meio de pagamento excluído com sucesso.' };
  }
}

module.exports = PaymentMethodService;
