const express = require('express');
const { listMethods, addMethod, updateMethod, deleteMethod } = require('../controllers/paymentMethodController');

const router = express.Router();

/**
 * @openapi
 * /meios-pagamento:
 *   get:
 *     tags:
 *       - Meios de Pagamento
 *     summary: Lista todos os meios de pagamento.
 *     responses:
 *       200:
 *         description: Lista de meios de pagamento.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
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
router.get('/', listMethods);

/**
 * @openapi
 * /meios-pagamento:
 *   post:
 *     tags:
 *       - Meios de Pagamento
 *     summary: Adiciona novo meio de pagamento.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do meio de pagamento.
 *                 example: Pix
 *     responses:
 *       201:
 *         description: Meio de pagamento adicionado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
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
 *               missingName:
 *                 summary: Campo obrigatório ausente.
 *                 value:
 *                   message: "O campo 'name' é obrigatório."
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
router.post('/', addMethod);

/**
 * @openapi
 * /meios-pagamento/{name}:
 *   put:
 *     tags:
 *       - Meios de Pagamento
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
 *             required:
 *               - newName
 *             properties:
 *               newName:
 *                 type: string
 *                 description: Novo nome do meio de pagamento.
 *                 example: Cartão de débito
 *     responses:
 *       200:
 *         description: Meio de pagamento renomeado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
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
 *               invalidPayload:
 *                 summary: Campo obrigatorio ausente ou inválido.
 *                 value:
 *                   message: "O campo 'newName' é obrigatório."
 *       404:
 *         description: Meio de pagamento não encontrado.
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
router.put('/:name', updateMethod);

/**
 * @openapi
 * /meios-pagamento/{name}:
 *   delete:
 *     tags:
 *       - Meios de Pagamento
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Meio de pagamento excluído com sucesso."
 *       404:
 *         description: Meio de pagamento não encontrado.
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
router.delete('/:name', deleteMethod);

module.exports = router;
