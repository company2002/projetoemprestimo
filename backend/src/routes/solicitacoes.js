const express = require('express');
const router = express.Router();
const SolicitacaoController = require('../controllers/SolicitacaoController');
const authMiddleware = require('../middleware/auth');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas para solicitações
router.post('/', SolicitacaoController.criar);
router.get('/', SolicitacaoController.listar);
router.get('/relatorio', SolicitacaoController.relatorio);
router.get('/relatorio-pdf', SolicitacaoController.gerarRelatorioPDF);
router.get('/:id', SolicitacaoController.buscarPorId);
router.put('/:id', SolicitacaoController.atualizar);
router.delete('/:id', SolicitacaoController.excluir);

module.exports = router; 