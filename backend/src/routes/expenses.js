const express = require('express');
const { getExpense, addExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');

const router = express.Router();

/**
 * @openapi
 * /despesas:
 *   get:
 *     tags:
 *       - Despesas
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
 *       400:
 *         description: Requisição inválida.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Despesa não encontrada.
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
router.get('/', getExpense);

/**
 * @openapi
 * /despesas/categorias:
 *   get:
 *     tags:
 *       - Despesas
 *     summary: Lista categorias disponíveis.
 *     responses:
 *       200:
 *         description: Lista de categorias.
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
 *     tags:
 *       - Despesas
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
 *       404:
 *         description: Categoria não encontrada.
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
 *     tags:
 *       - Despesas
 *     summary: Lista meses/anos disponíveis na planilha.
 *     responses:
 *       200:
 *         description: Lista de meses.
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
 *     tags:
 *       - Despesas
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
router.post('/', addExpense);

/**
 * @openapi
 * /despesas:
 *   put:
 *     tags:
 *       - Despesas
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
 *       400:
 *         description: Requisição inválida.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Despesa não encontrada.
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
router.put('/', updateExpense);

/**
 * @openapi
 * /despesas:
 *   delete:
 *     tags:
 *       - Despesas
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
 *       400:
 *         description: Requisição inválida.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Despesa não encontrada.
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
router.delete('/', deleteExpense);

module.exports = router;
