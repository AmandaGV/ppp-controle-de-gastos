const { expenseService } = require('../dependencies');

async function getExpense(req, res) {
  try {
    const { category, subcategory, year, month } = req.query;
    const expense = await expenseService.getExpense({
      category,
      subcategory,
      year: Number(year),
      month: Number(month),
    });
    res.json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function addExpense(req, res) {
  try {
    const expense = await expenseService.addExpense(req.body);
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function updateExpense(req, res) {
  try {
    const expense = await expenseService.updateExpense(req.body);
    res.json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function deleteExpense(req, res) {
  try {
    const { category, subcategory, year, month } = req.query;
    const response = await expenseService.deleteExpense({
      category,
      subcategory,
      year: Number(year),
      month: Number(month),
    });
    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = {
  getExpense,
  addExpense,
  updateExpense,
  deleteExpense,
};
