const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

class UsuarioController {
    async login(req, res) {
        try {
            const { email, senha } = req.body;

            const [usuarios] = await db.execute(
                'SELECT * FROM usuarios WHERE email = ?',
                [email]
            );

            if (usuarios.length === 0) {
                return res.status(401).json({ error: 'Usuário não encontrado' });
            }

            const usuario = usuarios[0];
            const senhaValida = await bcrypt.compare(senha, usuario.senha);

            if (!senhaValida) {
                return res.status(401).json({ error: 'Senha inválida' });
            }

            if (usuario.status !== 'aprovado') {
                return res.status(401).json({ error: 'Usuário aguardando aprovação' });
            }

            const token = jwt.sign(
                { id: usuario.id, role: usuario.role },
                process.env.JWT_SECRET,
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

            // Verificar se o email já existe
            const [usuarioExistente] = await db.execute(
                'SELECT id FROM usuarios WHERE email = ?',
                [email]
            );

            if (usuarioExistente.length > 0) {
                return res.status(400).json({ error: 'Email já cadastrado' });
            }

            // Criptografar senha
            const salt = await bcrypt.genSalt(10);
            const senhaCriptografada = await bcrypt.hash(senha, salt);

            // Inserir novo usuário
            const [result] = await db.execute(
                'INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)',
                [nome, email, senhaCriptografada, role]
            );

            res.status(201).json({
                message: 'Usuário criado com sucesso. Aguardando aprovação.',
                id: result.insertId
            });
        } catch (error) {
            console.error('Erro no registro:', error);
            res.status(500).json({ error: 'Erro no processo de registro' });
        }
    }

    async listar(req, res) {
        try {
            const [usuarios] = await db.execute(
                'SELECT id, nome, email, role, status, created_at FROM usuarios'
            );

            res.json(usuarios);
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            res.status(500).json({ error: 'Erro ao listar usuários' });
        }
    }

    async aprovar(req, res) {
        try {
            const { id } = req.params;
            
            // Verificar se o usuário existe
            const [usuario] = await db.execute(
                'SELECT * FROM usuarios WHERE id = ?',
                [id]
            );

            if (usuario.length === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            // Aprovar usuário
            await db.execute(
                'UPDATE usuarios SET status = ? WHERE id = ?',
                ['aprovado', id]
            );

            res.json({ message: 'Usuário aprovado com sucesso' });
        } catch (error) {
            console.error('Erro ao aprovar usuário:', error);
            res.status(500).json({ error: 'Erro ao aprovar usuário' });
        }
    }

    async recusar(req, res) {
        try {
            const { id } = req.params;
            
            // Verificar se o usuário existe
            const [usuario] = await db.execute(
                'SELECT * FROM usuarios WHERE id = ?',
                [id]
            );

            if (usuario.length === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            // Recusar usuário
            await db.execute(
                'UPDATE usuarios SET status = ? WHERE id = ?',
                ['recusado', id]
            );

            res.json({ message: 'Usuário recusado com sucesso' });
        } catch (error) {
            console.error('Erro ao recusar usuário:', error);
            res.status(500).json({ error: 'Erro ao recusar usuário' });
        }
    }
}

module.exports = new UsuarioController(); 