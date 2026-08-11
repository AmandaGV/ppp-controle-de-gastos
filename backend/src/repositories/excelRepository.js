const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

class ExcelRepository {
  constructor(filePath) {
    const fileName = 'PLANILHA CONTROLE DE GASTOS.xlsx';
    const envPath = process.env.PLANILHA_CONTROLE_GASTOS_PATH;
    const projectRootPath = path.resolve(__dirname, '..', '..', '..', 'data', fileName);
    const backendPath = path.resolve(__dirname, '..', '..', 'data', fileName);
    const candidatePaths = [envPath, projectRootPath, backendPath].filter(Boolean);

    const existingPath = candidatePaths.find((candidate) => fs.existsSync(candidate));
    this.filePath = filePath || existingPath || envPath || projectRootPath || backendPath;
    this.workbook = null;
  }

  async loadWorkbook(reload = false) {
    if (this.workbook && !reload) {
      return this.workbook;
    }

    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.readFile(this.filePath);
    } catch (err) {
      // If file not found, create a new workbook with expected sheets
      console.warn('ExcelRepository: failed to read', this.filePath, '-', err.message);
      const missingFile = err.code === 'ENOENT' || /File not found|No such file or directory|ENOENT/i.test(String(err.message));
      if (missingFile) {
        const mainNames = ['Pessoa Física', 'Pessoa Fisica', 'Pessoa'];
        const main = workbook.addWorksheet(mainNames[0]);
        // add minimal header row so layoutService can scan headers
        main.getRow(1).values = ['Categoria', 'Subcategoria'];
        // add special rows placeholders
        main.addRow(['Total das Despesas']);
        main.addRow(['Renda Mensal']);
        main.addRow(['Resultado Operacional']);

        const pm = workbook.addWorksheet('Meios de Pagamento');
        pm.getRow(1).values = ['Nome'];

        // ensure directory exists
        const dir = path.dirname(this.filePath);
        try { require('fs').mkdirSync(dir, { recursive: true }); } catch (e) {}

        await workbook.xlsx.writeFile(this.filePath);
      } else {
        throw err;
      }
    }
    this.workbook = workbook;
    return workbook;
  }

  async getSheet(name) {
    const workbook = await this.loadWorkbook();
    if (name) {
      const sheet = workbook.getWorksheet(name) || workbook.getWorksheet(String(name).trim());
      if (sheet) return sheet;
    }

    // Try to detect the main sheet by common Portuguese names
    const candidates = ['Pessoa Física', 'Pessoa Fisica', 'Pessoa', 'Pessoa Física '];
    for (const candidate of candidates) {
      const s = workbook.getWorksheet(candidate);
      if (s) return s;
    }

    // fallback to first worksheet
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
