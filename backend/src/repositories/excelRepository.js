const ExcelJS = require('exceljs');
const path = require('path');

class ExcelRepository {
  constructor(filePath) {
    const defaultPath = path.resolve(__dirname, '..', '..', 'data', 'PLANILHA CONTROLE DE GASTOS.xlsx');
    this.filePath = filePath || defaultPath;
    this.workbook = null;
  }

  async loadWorkbook(reload = false) {
    if (this.workbook && !reload) {
      return this.workbook;
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(this.filePath);
    this.workbook = workbook;
    return workbook;
  }

  async getSheet(name) {
    const workbook = await this.loadWorkbook();
    if (name) {
      const sheet = workbook.getWorksheet(name);
      if (sheet) {
        return sheet;
      }
    }

    return workbook.worksheets[0];
  }

  async saveWorkbook() {
    if (!this.workbook) {
      throw new Error('Workbook não foi carregado.');
    }
    await this.workbook.xlsx.writeFile(this.filePath);
  }

  async reloadWorkbook() {
    this.workbook = null;
    return this.loadWorkbook(true);
  }
}

module.exports = ExcelRepository;
