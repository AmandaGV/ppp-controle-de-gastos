const ExcelRepository = require('./repositories/excelRepository');
const ExpenseService = require('./services/expenseService');
const PaymentMethodService = require('./services/paymentMethodService');
const BalanceService = require('./services/balanceService');

const excelRepository = new ExcelRepository();
const expenseService = new ExpenseService(excelRepository);
const paymentMethodService = new PaymentMethodService(excelRepository);
const balanceService = new BalanceService(excelRepository);

module.exports = {
  excelRepository,
  expenseService,
  paymentMethodService,
  balanceService,
};
