const express = require('express');
const { reloadWorkbook, initWorkbook, getConsolidatedSheet } = require('../controllers/systemController');

const router = express.Router();

/**
 * @openapi
 * /sistema/reload:
 *   post:
 *     tags:
 *       - Sistema
 *     summary: Recarrega o arquivo Excel do disco.
 *     responses:
 *       200:
 *         description: Arquivo recarregado.
 *       500:
 *         description: Erro interno no servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/reload', reloadWorkbook);

/**
 * @openapi
 * /sistema/init:
 *   post:
 *     tags:
 *       - Sistema
 *     summary: Inicializa ou recria a planilha de controle no disco.
 *     responses:
 *       200:
 *         description: Planilha inicializada ou recriada.
 *       500:
 *         description: Erro interno no servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/init', initWorkbook);

/**
 * @openapi
 * /sistema/planilha:
 *   get:
 *     tags:
 *       - Sistema
 *     summary: Retorna uma visualização consolidada da planilha (headers, meses, meios de pagamento e linhas).
 *     responses:
 *       200:
 *         description: Visualização consolidada da planilha.
 *       500:
 *         description: Erro interno no servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/planilha', getConsolidatedSheet);

module.exports = router;
