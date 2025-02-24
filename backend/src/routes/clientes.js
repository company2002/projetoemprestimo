const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/ClienteController');
const GamificacaoController = require('../controllers/GamificacaoController');
const authMiddleware = require('../middleware/auth');

// Rotas públicas
router.post('/registro', ClienteController.registro);
router.post('/login', ClienteController.login);

// Rotas protegidas
router.use(authMiddleware);
router.get('/perfil', ClienteController.perfil);
router.put('/perfil', ClienteController.atualizarPerfil);
router.get('/solicitacoes', ClienteController.solicitacoes);

// Rotas de gamificação
router.get('/nivel', GamificacaoController.verificarNivel);
router.get('/beneficios', GamificacaoController.getBeneficios);
router.get('/medalhas', async (req, res) => {
    try {
        const medalhas = await GamificacaoController.getMedalhas(req.usuario.id);
        res.json(medalhas);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar medalhas' });
    }
});

module.exports = router; 