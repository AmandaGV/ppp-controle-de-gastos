const LayoutService = require('./layoutService');

class BalanceService {
  constructor(excelRepository) {
    this.excelRepository = excelRepository;
    this.layoutService = new LayoutService(excelRepository);
  }

  parseValue(value) {
    if (value === null || value === undefined || value === '') {
      return 0;
    }
    if (typeof value === 'number') {
      return value;
    }
    const parsed = Number(String(value).replace(/[^0-9,-]/g, '').replace(',', '.'));
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  async getBalance({ year, month }) {
    const { valueColumn } = await this.layoutService.findMonthColumns({ year, month });
    const sheet = await this.excelRepository.getSheet();
    const rendaRow = await this.layoutService.findSpecialRow('Renda Mensal');
    const totalRow = await this.layoutService.findSpecialRow('Total das Despesas');
    const resultadoRow = await this.layoutService.findSpecialRow('Resultado Operacional');

    return {
      year,
      month,
      rendaMensal: this.parseValue(sheet.getRow(rendaRow).getCell(valueColumn).value),
      totalDespesas: this.parseValue(sheet.getRow(totalRow).getCell(valueColumn).value),
      resultadoOperacional: this.parseValue(sheet.getRow(resultadoRow).getCell(valueColumn).value),
    };
  }

  async updateRenda({ year, month, rendaMensal }) {
    const { valueColumn } = await this.layoutService.findMonthColumns({ year, month });
    const sheet = await this.excelRepository.getSheet();
    const rendaRow = await this.layoutService.findSpecialRow('Renda Mensal');
    const totalRow = await this.layoutService.findSpecialRow('Total das Despesas');
    const resultadoRow = await this.layoutService.findSpecialRow('Resultado Operacional');

    sheet.getRow(rendaRow).getCell(valueColumn).value = Number(rendaMensal);
    const totalDespesas = this.parseValue(sheet.getRow(totalRow).getCell(valueColumn).value);
    sheet.getRow(resultadoRow).getCell(valueColumn).value = Number(rendaMensal) - totalDespesas;
    await this.excelRepository.saveWorkbook();

    return this.getBalance({ year, month });
  }
}

module.exports = BalanceService;
