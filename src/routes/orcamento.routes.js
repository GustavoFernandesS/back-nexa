'use strict';

const express = require('express');

const { criarOrcamentoController } = require('../controllers/orcamento.controller');
const { validateOrcamento } = require('../middleware/validateOrcamento');

const router = express.Router();

router.post('/', validateOrcamento, criarOrcamentoController);

module.exports = router;
