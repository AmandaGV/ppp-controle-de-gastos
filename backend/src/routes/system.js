const express = require('express');
const { reloadWorkbook } = require('../controllers/systemController');

const router = express.Router();

/**
 * @openapi
 * /sistema/reload:
 *   post:
 *     summary: Recarrega o arquivo Excel do disco.
 *     responses:
 *       200:
 *         description: Arquivo recarregado.
 */
router.post('/reload', reloadWorkbook);

module.exports = router;
