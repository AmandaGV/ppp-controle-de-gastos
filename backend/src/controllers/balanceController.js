const { balanceService } = require('../dependencies');

async function getBalance(req, res) {
  try {
    const { year, month } = req.query;
    const balance = await balanceService.getBalance({ year: Number(year), month: Number(month) });
    res.json(balance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function updateRenda(req, res) {
  try {
    const { year, month } = req.query;
    const { rendaMensal } = req.body;
    const balance = await balanceService.updateRenda({ year: Number(year), month: Number(month), rendaMensal: Number(rendaMensal) });
    res.json(balance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = {
  getBalance,
  updateRenda,
};
