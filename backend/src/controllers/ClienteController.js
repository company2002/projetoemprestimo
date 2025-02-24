const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

class ClienteController {
    async registro(req, res) {
        try {
            const { 
                nome, 
                email, 
                senha, 
                cpf, 
                telefone, 
                data_nascimento, 
                endereco 
            } = req.body;

            // Validar dados obrigatórios
            if (!nome || !email || !senha || !cpf || !telefone || !data_nascimento || !endereco) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
            }

            // Verificar se o email já existe
            const [emailExistente] = await db.execute(
                'SELECT id FROM clientes WHERE email = ?',
                [email]
            );

            if (emailExistente.length > 0) {
                return res.status(400).json({ error: 'Email já cadastrado' });
            }

            // Verificar se o CPF já existe
            const [cpfExistente] = await db.execute(
                'SELECT id FROM clientes WHERE cpf = ?',
                [cpf]
            );

            if (cpfExistente.length > 0) {
                return res.status(400).json({ error: 'CPF já cadastrado' });
            }

            // Criptografar senha
            const salt = await bcrypt.genSalt(10);
            const senhaCriptografada = await bcrypt.hash(senha, salt);

            // Inserir cliente
            const [result] = await db.execute(
                `INSERT INTO clientes (
                    nome, email, senha, cpf, telefone, 
                    data_nascimento, endereco, status, score
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    nome, email, senhaCriptografada, cpf, telefone,
                    data_nascimento, endereco, 'ativo', 0
                ]
            );

            res.status(201).json({
                message: 'Cliente cadastrado com sucesso',
                id: result.insertId
            });
        } catch (error) {
            console.error('Erro no registro de cliente:', error);
            res.status(500).json({ error: 'Erro no processo de registro' });
        }
    }

    async login(req, res) {
        try {
            const { email, senha } = req.body;

            // Buscar cliente
            const [clientes] = await db.execute(
                'SELECT * FROM clientes WHERE email = ?',
                [email]
            );

            if (clientes.length === 0) {
                return res.status(401).json({ error: 'Cliente não encontrado' });
            }

            const cliente = clientes[0];

            // Verificar senha
            const senhaValida = await bcrypt.compare(senha, cliente.senha);
            if (!senhaValida) {
                return res.status(401).json({ error: 'Senha inválida' });
            }

            // Verificar status
            if (cliente.status !== 'ativo') {
                return res.status(401).json({ error: 'Conta bloqueada ou inativa' });
            }

            // Gerar token
            const token = jwt.sign(
                { 
                    id: cliente.id,
                    tipo: 'cliente'
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Retornar dados do cliente (exceto senha)
            const { senha: _, ...clienteData } = cliente;

            res.json({
                token,
                cliente: clienteData
            });
        } catch (error) {
            console.error('Erro no login de cliente:', error);
            res.status(500).json({ error: 'Erro no processo de login' });
        }
    }

    async perfil(req, res) {
        try {
            const { id } = req.usuario;

            const [clientes] = await db.execute(
                `SELECT id, nome, email, cpf, telefone, data_nascimento, 
                 endereco, status, score, tipo_cliente, created_at 
                 FROM clientes WHERE id = ?`,
                [id]
            );

            if (clientes.length === 0) {
                return res.status(404).json({ error: 'Cliente não encontrado' });
            }

            res.json(clientes[0]);
        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            res.status(500).json({ error: 'Erro ao buscar perfil' });
        }
    }

    async atualizarPerfil(req, res) {
        try {
            const { id } = req.usuario;
            const { 
                nome, 
                telefone, 
                endereco,
                senha_atual,
                nova_senha 
            } = req.body;

            // Se for atualizar a senha, verificar a senha atual
            if (senha_atual && nova_senha) {
                const [cliente] = await db.execute(
                    'SELECT senha FROM clientes WHERE id = ?',
                    [id]
                );

                const senhaValida = await bcrypt.compare(senha_atual, cliente[0].senha);
                if (!senhaValida) {
                    return res.status(400).json({ error: 'Senha atual inválida' });
                }

                const salt = await bcrypt.genSalt(10);
                const senhaCriptografada = await bcrypt.hash(nova_senha, salt);

                await db.execute(
                    'UPDATE clientes SET senha = ? WHERE id = ?',
                    [senhaCriptografada, id]
                );
            }

            // Atualizar dados do perfil
            await db.execute(
                'UPDATE clientes SET nome = ?, telefone = ?, endereco = ? WHERE id = ?',
                [nome, telefone, endereco, id]
            );

            res.json({ message: 'Perfil atualizado com sucesso' });
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            res.status(500).json({ error: 'Erro ao atualizar perfil' });
        }
    }

    async solicitacoes(req, res) {
        try {
            const { id } = req.usuario;

            const [solicitacoes] = await db.execute(
                `SELECT * FROM solicitacoes WHERE cliente_id = ? 
                 ORDER BY data_hora DESC`,
                [id]
            );

            res.json(solicitacoes);
        } catch (error) {
            console.error('Erro ao buscar solicitações:', error);
            res.status(500).json({ error: 'Erro ao buscar solicitações' });
        }
    }
}

module.exports = new ClienteController(); 