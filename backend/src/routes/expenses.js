const express = require('express');
const { getExpense, addExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');

const router = express.Router();

/**
 * @openapi
 * /despesas:
 *   get:
 *     summary: Busca uma despesa existente.
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: subcategory
 *         schema:
 *           type: string
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
 *         description: Despesa encontrada.
 */
router.get('/', getExpense);

/**
 * @openapi
 * /despesas:
 *   post:
 *     summary: Adiciona uma nova despesa.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               subcategory:
 *                 type: string
 *               year:
 *                 type: integer
 *               month:
 *                 type: integer
 *               value:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Despesa adicionada.
 */
router.post('/', addExpense);

/**
 * @openapi
 * /despesas:
 *   put:
 *     summary: Atualiza uma despesa existente.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               subcategory:
 *                 type: string
 *               year:
 *                 type: integer
 *               month:
 *                 type: integer
 *               value:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       200:
 *         description: Despesa atualizada.
 */
router.put('/', updateExpense);

/**
 * @openapi
 * /despesas:
 *   delete:
 *     summary: Remove uma despesa.
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: subcategory
 *         schema:
 *           type: string
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
 *         description: Despesa removida.
 */
router.delete('/', deleteExpense);

module.exports = router;
