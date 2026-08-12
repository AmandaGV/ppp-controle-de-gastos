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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 year:
 *                   type: integer
 *                 month:
 *                   type: integer
 *                 rendaMensal:
 *                   type: number
 *                 totalDespesas:
 *                   type: number
 *                 resultadoOperacional:
 *                   type: number
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
 *         required: true
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rendaMensal
 *             properties:
 *               rendaMensal:
 *                 type: number
 *                 description: Valor da renda mensal para o mês selecionado.
 *                 example: 6500.00
 *     responses:
 *       200:
 *         description: Renda atualizada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 year:
 *                   type: integer
 *                 month:
 *                   type: integer
 *                 rendaMensal:
 *                   type: number
 *       400:
 *         description: Requisição inválida.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               invalidRequest:
 *                 summary: Renda mensal ausente ou mês inválido.
 *                 value:
 *                   message: "O campo 'rendaMensal' é obrigatório e deve ser um número."
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
