const express = require('express');
const { getBalance, updateRenda } = require('../controllers/balanceController');

const router = express.Router();

/**
 * @openapi
 * /renda:
 *   get:
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
 */
router.get('/', getBalance);

/**
 * @openapi
 * /renda:
 *   put:
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
 */
router.put('/', updateRenda);

module.exports = router;
