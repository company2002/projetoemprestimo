const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { runQuery, getOne } = require('../config/database');

class AuthController {
    async login(req, res) {
        try {
            const { email, senha } = req.body;

            const usuario = getOne('SELECT * FROM usuarios WHERE email = ?', [email]);

            if (!usuario) {
                return res.status(401).json({ error: 'Usuário não encontrado' });
            }

            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            if (!senhaValida) {
                return res.status(401).json({ error: 'Senha inválida' });
            }

            const token = jwt.sign(
                { id: usuario.id, role: usuario.role },
                process.env.JWT_SECRET || 'sua-chave-secreta',
                { expiresIn: '24h' }
            );

            res.json({
                token,
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    role: usuario.role
                }
            });
        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ error: 'Erro no processo de login' });
        }
    }

    async registro(req, res) {
        try {
            const { nome, email, senha, role = 'operador' } = req.body;

            // Verifica se o email já existe
            const usuarioExistente = getOne('SELECT id FROM usuarios WHERE email = ?', [email]);
            if (usuarioExistente) {
                return res.status(400).json({ error: 'Email já cadastrado' });
            }

            // Criptografa a senha
            const salt = await bcrypt.genSalt(10);
            const senhaCriptografada = await bcrypt.hash(senha, salt);

            // Insere o novo usuário
            const result = runQuery(
                'INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)',
                [nome, email, senhaCriptografada, role]
            );

            res.status(201).json({
                message: 'Usuário criado com sucesso',
                id: result.lastInsertRowid
            });
        } catch (error) {
            console.error('Erro no registro:', error);
            res.status(500).json({ error: 'Erro no processo de registro' });
        }
    }

    async verificarToken(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                return res.status(401).json({ error: 'Token não fornecido' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua-chave-secreta');
            const usuario = getOne('SELECT id, nome, email, role FROM usuarios WHERE id = ?', [decoded.id]);

            if (!usuario) {
                return res.status(401).json({ error: 'Usuário não encontrado' });
            }

            res.json(usuario);
        } catch (error) {
            console.error('Erro na verificação do token:', error);
            res.status(401).json({ error: 'Token inválido' });
        }
    }
}

module.exports = new AuthController(); 