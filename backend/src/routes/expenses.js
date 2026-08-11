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
 * /despesas/categorias:
 *   get:
 *     summary: Lista categorias disponíveis.
 *     responses:
 *       200:
 *         description: Lista de categorias.
 */
router.get('/categorias', async (req, res) => {
	try {
		const Layout = require('../services/layoutService');
		const layout = new Layout(require('../dependencies').excelRepository);
		const cats = await layout.listCategories();
		res.json(cats);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

/**
 * @openapi
 * /despesas/categorias/{categoria}/subcategorias:
 *   get:
 *     summary: Lista subcategorias de uma categoria.
 *     parameters:
 *       - in: path
 *         name: categoria
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de subcategorias.
 */
router.get('/categorias/:categoria/subcategorias', async (req, res) => {
	try {
		const Layout = require('../services/layoutService');
		const layout = new Layout(require('../dependencies').excelRepository);
		const subs = await layout.listSubcategories(req.params.categoria);
		res.json(subs);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

/**
 * @openapi
 * /despesas/meses:
 *   get:
 *     summary: Lista meses/anos disponíveis na planilha.
 *     responses:
 *       200:
 *         description: Lista de meses.
 */
router.get('/meses', async (req, res) => {
	try {
		const Layout = require('../services/layoutService');
		const layout = new Layout(require('../dependencies').excelRepository);
		const months = await layout.listMonths();
		res.json(months);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

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
