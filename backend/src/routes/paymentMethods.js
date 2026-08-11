const express = require('express');
const { listMethods, addMethod, updateMethod, deleteMethod } = require('../controllers/paymentMethodController');

const router = express.Router();

/**
 * @openapi
 * /meios-pagamento:
 *   get:
 *     summary: Lista todos os meios de pagamento.
 *     responses:
 *       200:
 *         description: Lista de meios de pagamento.
 */
router.get('/', listMethods);

/**
 * @openapi
 * /meios-pagamento:
 *   post:
 *     summary: Adiciona novo meio de pagamento.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Meio de pagamento adicionado.
 */
router.post('/', addMethod);

/**
 * @openapi
 * /meios-pagamento/{name}:
 *   put:
 *     summary: Renomeia meio de pagamento.
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Meio de pagamento renomeado.
 */
router.put('/:name', updateMethod);

/**
 * @openapi
 * /meios-pagamento/{name}:
 *   delete:
 *     summary: Exclui um meio de pagamento.
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Meio de pagamento excluído.
 */
router.delete('/:name', deleteMethod);

module.exports = router;
