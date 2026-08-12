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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Workbook recarregado com sucesso."
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 path:
 *                   type: string
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sheetName:
 *                   type: string
 *                 rowCount:
 *                   type: integer
 *                 columnCount:
 *                   type: integer
 *                 months:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       label:
 *                         type: string
 *                       valueColumn:
 *                         type: integer
 *                       paymentColumn:
 *                         type: integer
 *                 paymentMethods:
 *                   type: array
 *                   items:
 *                     type: string
 *                 rows:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rowNumber:
 *                         type: integer
 *                       category:
 *                         type: string
 *                         nullable: true
 *                       subcategory:
 *                         type: string
 *                         nullable: true
 *                       cells:
 *                         type: object
 *                         additionalProperties:
 *                           type: object
 *                           properties:
 *                             value:
 *                               type: string
 *                               nullable: true
 *                             payment:
 *                               type: string
 *                               nullable: true
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
