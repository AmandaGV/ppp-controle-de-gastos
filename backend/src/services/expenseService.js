const LayoutService = require('./layoutService');
const { parseValue } = require('./utils');

class ExpenseService {
  constructor(excelRepository) {
    this.excelRepository = excelRepository;
    this.layoutService = new LayoutService(excelRepository);
  }

  parseValue(value) {
    return parseValue(value);
  }

  concatPayment(existing, next) {
    const existingText = existing ? String(existing).trim() : '';
    const nextText = next ? String(next).trim() : '';
    if (!existingText) return nextText;
    if (!nextText) return existingText;

    const items = existingText.split(',').map((item) => item.trim());
    if (!items.includes(nextText)) {
      items.push(nextText);
    }
    return items.filter(Boolean).join(', ');
  }

  async getExpense({ year, month, category, subcategory }) {
    const { valueColumn, paymentColumn } = await this.layoutService.findMonthColumns({ year, month });
    const rowNumber = await this.layoutService.findCategorySubcategoryRow({ category, subcategory });
    const sheet = await this.excelRepository.getSheet();
    const row = sheet.getRow(rowNumber);

    return {
      year,
      month,
      category,
      subcategory,
      value: this.parseValue(row.getCell(valueColumn).value),
      paymentMethod: row.getCell(paymentColumn).value || null,
    };
  }

  async addExpense(payload) {
    const { year, month, category, subcategory, value, paymentMethod } = payload;
    const { valueColumn, paymentColumn } = await this.layoutService.findMonthColumns({ year, month });
    const rowNumber = await this.layoutService.findCategorySubcategoryRow({ category, subcategory });
    const sheet = await this.excelRepository.getSheet();
    const row = sheet.getRow(rowNumber);

    const existingValue = this.parseValue(row.getCell(valueColumn).value);
    const updatedValue = existingValue + Number(value);
    row.getCell(valueColumn).value = updatedValue;

    if (paymentMethod) {
      const existingPayment = row.getCell(paymentColumn).value;
      row.getCell(paymentColumn).value = this.concatPayment(existingPayment, paymentMethod);
    }

    await this.updateTotals({ year, month });
    await this.excelRepository.saveWorkbook();

    return this.getExpense({ year, month, category, subcategory });
  }

  async updateExpense(payload) {
    const { year, month, category, subcategory, value, paymentMethod } = payload;
    const { valueColumn, paymentColumn } = await this.layoutService.findMonthColumns({ year, month });
    const rowNumber = await this.layoutService.findCategorySubcategoryRow({ category, subcategory });
    const sheet = await this.excelRepository.getSheet();
    const row = sheet.getRow(rowNumber);

    row.getCell(valueColumn).value = Number(value);
    if (paymentMethod !== undefined) {
      row.getCell(paymentColumn).value = paymentMethod ? String(paymentMethod).trim() : null;
    }

    await this.updateTotals({ year, month });
    await this.excelRepository.saveWorkbook();

    return this.getExpense({ year, month, category, subcategory });
  }

  async deleteExpense({ year, month, category, subcategory }) {
    const { valueColumn, paymentColumn } = await this.layoutService.findMonthColumns({ year, month });
    const rowNumber = await this.layoutService.findCategorySubcategoryRow({ category, subcategory });
    const sheet = await this.excelRepository.getSheet();
    const row = sheet.getRow(rowNumber);

    row.getCell(valueColumn).value = 0;
    row.getCell(paymentColumn).value = null;

    await this.updateTotals({ year, month });
    await this.excelRepository.saveWorkbook();

    return { message: 'Despesa removida com sucesso.' };
  }

  async updateTotals({ year, month }) {
    const sheet = await this.excelRepository.getSheet();
    const { valueColumn } = await this.layoutService.findMonthColumns({ year, month });
    const totalRow = await this.layoutService.findSpecialRow('Total das Despesas');
    const rendaRow = await this.layoutService.findSpecialRow('Renda Mensal');
    const resultadoRow = await this.layoutService.findSpecialRow('Resultado Operacional');

    let totalDespesas = 0;
    for (let rowNumber = 1; rowNumber <= sheet.rowCount; rowNumber += 1) {
      if ([totalRow, rendaRow, resultadoRow].includes(rowNumber)) continue;
      const row = sheet.getRow(rowNumber);
      const cellValue = this.parseValue(row.getCell(valueColumn).value);
      totalDespesas += cellValue;
    }

    sheet.getRow(totalRow).getCell(valueColumn).value = totalDespesas;

    const rendaMensal = this.parseValue(sheet.getRow(rendaRow).getCell(valueColumn).value);
    sheet.getRow(resultadoRow).getCell(valueColumn).value = rendaMensal - totalDespesas;
  }
}

module.exports = ExpenseService;
