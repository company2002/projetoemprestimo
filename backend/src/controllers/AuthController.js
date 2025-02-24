const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

class AuthController {
    async login(req, res) {
        try {
            const { email, senha, tipo } = req.body;
            let usuario = null;
            let tabela = tipo === 'cliente' ? 'clientes' : 'usuarios';

            // Buscar usuário
            const [usuarios] = await db.execute(
                `SELECT * FROM ${tabela} WHERE email = ?`,
                [email]
            );

            if (usuarios.length === 0) {
                return res.status(401).json({ error: 'Usuário não encontrado' });
            }

            usuario = usuarios[0];

            // Verificar senha
            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            if (!senhaValida) {
                return res.status(401).json({ error: 'Senha inválida' });
            }

            // Verificar status para usuários administrativos
            if (tipo !== 'cliente' && usuario.status !== 'aprovado') {
                return res.status(401).json({ error: 'Usuário aguardando aprovação' });
            }

            // Verificar role para login master/admin
            if (tipo === 'master' && usuario.role !== 'master') {
                return res.status(401).json({ error: 'Acesso não autorizado para área master' });
            }
            if (tipo === 'admin' && usuario.role !== 'admin') {
                return res.status(401).json({ error: 'Acesso não autorizado para área administrativa' });
            }

            // Gerar token
            const token = jwt.sign(
                { 
                    id: usuario.id, 
                    tipo,
                    role: usuario.role || 'cliente'
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Retornar resposta
            res.json({
                token,
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    role: usuario.role || 'cliente',
                    tipo
                }
            });
        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ error: 'Erro no processo de login' });
        }
    }

    async registro(req, res) {
        try {
            const { nome, email, senha, tipo = 'cliente', ...dadosAdicionais } = req.body;
            let tabela = tipo === 'cliente' ? 'clientes' : 'usuarios';

            // Verificar se o email já existe
            const [usuarioExistente] = await db.execute(
                `SELECT id FROM ${tabela} WHERE email = ?`,
                [email]
            );

            if (usuarioExistente.length > 0) {
                return res.status(400).json({ error: 'Email já cadastrado' });
            }

            // Criptografar senha
            const salt = await bcrypt.genSalt(10);
            const senhaCriptografada = await bcrypt.hash(senha, salt);

            if (tipo === 'cliente') {
                // Inserir cliente
                const [result] = await db.execute(
                    `INSERT INTO clientes (nome, email, senha, cpf, telefone, data_nascimento, endereco) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        nome, 
                        email, 
                        senhaCriptografada,
                        dadosAdicionais.cpf,
                        dadosAdicionais.telefone,
                        dadosAdicionais.data_nascimento,
                        dadosAdicionais.endereco
                    ]
                );

                res.status(201).json({
                    message: 'Cliente cadastrado com sucesso',
                    id: result.insertId
                });
            } else {
                // Inserir usuário administrativo
                const [result] = await db.execute(
                    `INSERT INTO usuarios (nome, email, senha, role, status) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [
                        nome,
                        email,
                        senhaCriptografada,
                        dadosAdicionais.role || 'operador',
                        'pendente'
                    ]
                );

                res.status(201).json({
                    message: 'Usuário criado com sucesso. Aguardando aprovação.',
                    id: result.insertId
                });
            }
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

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const tabela = decoded.tipo === 'cliente' ? 'clientes' : 'usuarios';

            const [usuario] = await db.execute(
                `SELECT id, nome, email, ${decoded.tipo !== 'cliente' ? 'role, status' : ''} 
                 FROM ${tabela} WHERE id = ?`,
                [decoded.id]
            );

            if (!usuario || usuario.length === 0) {
                return res.status(401).json({ error: 'Usuário não encontrado' });
            }

            res.json(usuario[0]);
        } catch (error) {
            console.error('Erro na verificação do token:', error);
            res.status(401).json({ error: 'Token inválido' });
        }
    }
}

module.exports = new AuthController(); 