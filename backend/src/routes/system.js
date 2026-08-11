const express = require('express');
const { reloadWorkbook, getConsolidatedSheet } = require('../controllers/systemController');

const router = express.Router();

/**
 * @openapi
 * /sistema/reload:
 *   post:
 *     summary: Recarrega o arquivo Excel do disco.
 *     responses:
 *       200:
 *         description: Arquivo recarregado.
 */
router.post('/reload', reloadWorkbook);

/**
 * @openapi
 * /sistema/planilha:
 *   get:
 *     summary: Retorna uma visualização consolidada da planilha (headers, meses, meios de pagamento e linhas).
 *     responses:
 *       200:
 *         description: Visualização consolidada da planilha.
 */
router.get('/planilha', getConsolidatedSheet);

module.exports = router;
