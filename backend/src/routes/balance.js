const express = require('express');
const { getBalance, updateRenda } = require('../controllers/balanceController');

const router = express.Router();

/**
 * @openapi
 * /renda:
 *   get:
 *     tags:
 *       - Renda
 *     summary: Obtém o balanço mensal.
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Balanço mensal.
 *       400:
 *         description: Requisição inválida.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
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
router.get('/', getBalance);

/**
 * @openapi
 * /renda:
 *   put:
 *     tags:
 *       - Renda
 *     summary: Atualiza a renda mensal.
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rendaMensal:
 *                 type: number
 *     responses:
 *       200:
 *         description: Renda atualizada.
 *       400:
 *         description: Requisição inválida.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
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
router.put('/', updateRenda);

module.exports = router;
