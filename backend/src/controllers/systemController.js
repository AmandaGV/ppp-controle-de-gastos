const { excelRepository } = require('../dependencies');

async function reloadWorkbook(req, res) {
  try {
    await excelRepository.reloadWorkbook();
    res.json({ message: 'Workbook recarregado com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { reloadWorkbook };
