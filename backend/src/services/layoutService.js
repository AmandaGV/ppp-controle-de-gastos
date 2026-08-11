class LayoutService {
  constructor(excelRepository) {
    this.excelRepository = excelRepository;
  }

  normalize(value) {
    return typeof value === 'string' ? value.trim().toLowerCase() : value;
  }

  async findMonthColumns({ year, month }) {
    const sheet = await this.excelRepository.getSheet();
    const monthLabel = `${String(month).padStart(2, '0')}/${year}`;
    const monthLabelAlt = `${year}-${String(month).padStart(2, '0')}`;

    const headerRow = sheet.getRow(1);
    for (let col = 1; col <= sheet.columnCount; col += 1) {
      const cell = headerRow.getCell(col);
      const value = cell.value;
      if (!value) continue;

      const normalized = this.normalize(value);
      if (normalized.includes(monthLabel.toLowerCase()) || normalized.includes(monthLabelAlt.toLowerCase()) || normalized.includes(String(year))) {
        const valueColumn = col;
        const paymentColumn = col + 1;
        return { valueColumn, paymentColumn };
      }
    }

    throw new Error(`Não foi possível localizar as colunas de ${month}/${year}.`);
  }

  async findCategorySubcategoryRow({ category, subcategory }) {
    const sheet = await this.excelRepository.getSheet();
    const normalizedCategory = this.normalize(category);
    const normalizedSubcategory = this.normalize(subcategory);

    for (let rowNumber = 1; rowNumber <= sheet.rowCount; rowNumber += 1) {
      const row = sheet.getRow(rowNumber);
      const first = this.normalize(row.getCell(1).value);
      const second = this.normalize(row.getCell(2).value);

      if (first === normalizedCategory && second === normalizedSubcategory) {
        return rowNumber;
      }

      if (first === normalizedCategory && !second && normalizedSubcategory) {
        const siblingSecond = this.normalize(row.getCell(2).value);
        if (siblingSecond === normalizedSubcategory) {
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
        const cell = sheet.getRow(rowNumber).getCell(col);
        if (this.normalize(cell.value) === normalizedLabel) {
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
      const cell = sheet.getRow(r).getCell(1).value;
      if (cell && String(cell).trim()) categories.add(String(cell).trim());
    }
    return Array.from(categories).filter(Boolean);
  }

  async listSubcategories(category) {
    const sheet = await this.excelRepository.getSheet();
    const subs = new Set();
    const normalizedCategory = this.normalize(category);
    for (let r = 1; r <= sheet.rowCount; r += 1) {
      const row = sheet.getRow(r);
      const first = this.normalize(row.getCell(1).value);
      const second = row.getCell(2).value;
      if (first === normalizedCategory && second && String(second).trim()) {
        subs.add(String(second).trim());
      }
    }
    return Array.from(subs).filter(Boolean);
  }

  async listMonths() {
    const sheet = await this.excelRepository.getSheet();
    const header = sheet.getRow(1);
    const months = [];
    const regex1 = /\d{2}\/\d{4}/; // 01/2026
    const regex2 = /\d{4}-\d{2}/; // 2026-01
    for (let col = 1; col <= sheet.columnCount; col += 1) {
      const cell = header.getCell(col).value;
      if (!cell || typeof cell !== 'string') continue;
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
