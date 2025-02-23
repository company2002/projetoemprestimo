const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

// Rotas de autenticação
router.post('/login', AuthController.login);
router.post('/registro', AuthController.registro);

module.exports = router; 