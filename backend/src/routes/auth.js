const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');
const RecuperacaoSenhaController = require('../controllers/RecuperacaoSenhaController');
const authMiddleware = require('../middleware/auth');

// Rotas públicas
router.post('/login', UsuarioController.login);
router.post('/registro', UsuarioController.registro);
router.post('/recuperar-senha', RecuperacaoSenhaController.solicitarRecuperacao);
router.post('/resetar-senha', RecuperacaoSenhaController.resetarSenha);

// Rotas protegidas (apenas admin e master)
router.use(authMiddleware);
router.get('/usuarios', UsuarioController.listar);
router.post('/usuarios/:id/aprovar', UsuarioController.aprovar);
router.post('/usuarios/:id/recusar', UsuarioController.recusar);

module.exports = router; 