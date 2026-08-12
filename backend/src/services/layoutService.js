// A planilha "Pessoa Física" tem o cabeçalho de meses na linha 2 (a linha 1 fica em
// branco) e as categorias/subcategorias vivem todas na coluna B: linhas de categoria
// têm as células de valor (colunas C:AA) mescladas e preenchimento dourado; linhas de
// subcategoria não são mescladas e têm preenchimento amarelo-claro.
const HEADER_ROW = 2;
const LABEL_COLUMN = 2;
const FIRST_VALUE_COLUMN = 3;
const CATEGORY_FILL = 'FFFFEC64';
const SUBCATEGORY_FILL = 'FFFFF7C5';

class LayoutService {
  constructor(excelRepository) {
    this.excelRepository = excelRepository;
  }

  normalize(value) {
    return typeof value === 'string' ? value.trim().toLowerCase() : value;
  }

  cellFill(cell) {
    return cell.fill && cell.fill.fgColor && cell.fill.fgColor.argb;
  }

  isCategoryRow(sheet, rowNumber) {
    const row = sheet.getRow(rowNumber);
    return this.cellFill(row.getCell(LABEL_COLUMN)) === CATEGORY_FILL && row.getCell(FIRST_VALUE_COLUMN).isMerged;
  }

  isSubcategoryRow(sheet, rowNumber) {
    const row = sheet.getRow(rowNumber);
    return this.cellFill(row.getCell(LABEL_COLUMN)) === SUBCATEGORY_FILL;
  }

  async findMonthColumns({ year, month }) {
    const sheet = await this.excelRepository.getSheet();
    const monthLabel = `${String(month).padStart(2, '0')}/${year}`;
    const monthLabelAlt = `${year}-${String(month).padStart(2, '0')}`;

    const headerRow = sheet.getRow(HEADER_ROW);
    for (let col = 1; col <= sheet.columnCount; col += 1) {
      const value = headerRow.getCell(col).value;
      if (!value) continue;

      if (value instanceof Date) {
        if (value.getUTCFullYear() === Number(year) && value.getUTCMonth() + 1 === Number(month)) {
          return { valueColumn: col, paymentColumn: col + 1 };
        }
        continue;
      }

      const normalized = this.normalize(value);
      if (typeof normalized === 'string' && (normalized.includes(monthLabel.toLowerCase()) || normalized.includes(monthLabelAlt.toLowerCase()))) {
        return { valueColumn: col, paymentColumn: col + 1 };
      }
    }

    throw new Error(`Não foi possível localizar as colunas de ${month}/${year}.`);
  }

  async findCategorySubcategoryRow({ category, subcategory }) {
    const sheet = await this.excelRepository.getSheet();
    const normalizedCategory = this.normalize(category);
    const normalizedSubcategory = this.normalize(subcategory);

    let currentCategory = null;
    for (let rowNumber = 1; rowNumber <= sheet.rowCount; rowNumber += 1) {
      if (this.isCategoryRow(sheet, rowNumber)) {
        currentCategory = this.normalize(sheet.getRow(rowNumber).getCell(LABEL_COLUMN).value);
        continue;
      }

      if (this.isSubcategoryRow(sheet, rowNumber) && currentCategory === normalizedCategory) {
        const label = this.normalize(sheet.getRow(rowNumber).getCell(LABEL_COLUMN).value);
        if (label === normalizedSubcategory) {
          return rowNumber;
        }
      }
    }

    throw new Error(`Classe não encontrada para categoria='${category}', subcategoria='${subcategory}'.`);
  }

  async findSpecialRow(label) {
    const sheet = await this.excelRepository.getSheet();
    const normalizedLabel = this.normalize(label);
    for (let rowNumber = 1; rowNumber <= sheet.rowCount; rowNumber += 1) {
      for (let col = 1; col <= 5; col += 1) {
        const normalizedCell = this.normalize(sheet.getRow(rowNumber).getCell(col).value);
        if (typeof normalizedCell === 'string' && normalizedCell.includes(normalizedLabel)) {
          return rowNumber;
        }
      }
    }
    throw new Error(`Linha especial '${label}' não encontrada.`);
  }

  async findPaymentMethodsSheet() {
    const workbook = await this.excelRepository.loadWorkbook();
    let sheet = workbook.getWorksheet('Meios de Pagamento');
    if (!sheet) {
      sheet = workbook.addWorksheet('Meios de Pagamento');
      sheet.getRow(1).values = ['Nome'];
      await this.excelRepository.saveWorkbook();
    }
    return sheet;
  }

  async listCategories() {
    const sheet = await this.excelRepository.getSheet();
    const categories = new Set();
    for (let r = 1; r <= sheet.rowCount; r += 1) {
      if (!this.isCategoryRow(sheet, r)) continue;
      const label = sheet.getRow(r).getCell(LABEL_COLUMN).value;
      if (label && String(label).trim()) categories.add(String(label).trim());
    }
    return Array.from(categories).filter(Boolean);
  }

  async listSubcategories(category) {
    const sheet = await this.excelRepository.getSheet();
    const subs = new Set();
    const normalizedCategory = this.normalize(category);
    let currentCategory = null;
    for (let r = 1; r <= sheet.rowCount; r += 1) {
      if (this.isCategoryRow(sheet, r)) {
        currentCategory = this.normalize(sheet.getRow(r).getCell(LABEL_COLUMN).value);
        continue;
      }
      if (this.isSubcategoryRow(sheet, r) && currentCategory === normalizedCategory) {
        const label = sheet.getRow(r).getCell(LABEL_COLUMN).value;
        if (label && String(label).trim()) subs.add(String(label).trim());
      }
    }
    return Array.from(subs).filter(Boolean);
  }

  async listMonths() {
    const sheet = await this.excelRepository.getSheet();
    const header = sheet.getRow(HEADER_ROW);
    const months = [];
    const regex1 = /\d{2}\/\d{4}/; // 01/2026
    const regex2 = /\d{4}-\d{2}/; // 2026-01
    for (let col = 1; col <= sheet.columnCount; col += 1) {
      const cell = header.getCell(col).value;
      if (!cell) continue;

      if (cell instanceof Date) {
        const year = cell.getUTCFullYear();
        const month = cell.getUTCMonth() + 1;
        const label = `${String(month).padStart(2, '0')}/${year}`;
        months.push({ label, year, month, valueColumn: col, paymentColumn: col + 1 });
        continue;
      }

      if (typeof cell !== 'string') continue;
      const txt = cell.trim();
      const match = txt.match(regex1) || txt.match(regex2);
      if (match) {
        const label = match[0];
        let year = null;
        let month = null;
        if (regex1.test(label)) {
          const parts = label.split('/');
          month = Number(parts[0]);
          year = Number(parts[1]);
        } else if (regex2.test(label)) {
          const parts = label.split('-');
          year = Number(parts[0]);
          month = Number(parts[1]);
        }
        months.push({ label, year, month, valueColumn: col, paymentColumn: col + 1 });
      }
    }
    return months;
  }
}

module.exports = LayoutService;
