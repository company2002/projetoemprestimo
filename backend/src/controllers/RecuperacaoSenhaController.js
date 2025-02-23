const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../config/database');
const nodemailer = require('nodemailer');

class RecuperacaoSenhaController {
    // Configuração do nodemailer
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async solicitarRecuperacao(req, res) {
        try {
            const { email, tipo } = req.body;
            let usuario = null;
            let tabela = '';
            let id_campo = '';

            // Verificar se é cliente ou usuário administrativo
            if (tipo === 'cliente') {
                [usuario] = await db.execute('SELECT id, nome FROM clientes WHERE email = ?', [email]);
                tabela = 'clientes';
                id_campo = 'cliente_id';
            } else {
                [usuario] = await db.execute('SELECT id, nome FROM usuarios WHERE email = ?', [email]);
                tabela = 'usuarios';
                id_campo = 'usuario_id';
            }

            if (!usuario || usuario.length === 0) {
                return res.status(404).json({ error: 'Email não encontrado' });
            }

            // Gerar token único
            const token = crypto.randomBytes(20).toString('hex');
            const expiracao = new Date();
            expiracao.setHours(expiracao.getHours() + 1); // Token válido por 1 hora

            // Salvar token no banco
            await db.execute(
                'INSERT INTO recuperacao_senha (token, expiracao, ' + id_campo + ') VALUES (?, ?, ?)',
                [token, expiracao, usuario[0].id]
            );

            // Enviar email
            const resetUrl = `http://localhost:3000/${tipo === 'cliente' ? '' : 'admin/'}reset-senha.html?token=${token}`;
            
            await this.transporter.sendMail({
                to: email,
                subject: 'Recuperação de Senha - Sistema de Empréstimos',
                html: `
                    <h1>Recuperação de Senha</h1>
                    <p>Olá ${usuario[0].nome},</p>
                    <p>Você solicitou a recuperação de senha. Clique no link abaixo para redefinir sua senha:</p>
                    <a href="${resetUrl}">Redefinir Senha</a>
                    <p>Este link é válido por 1 hora.</p>
                    <p>Se você não solicitou esta recuperação, ignore este email.</p>
                `
            });

            res.json({ message: 'Email de recuperação enviado com sucesso' });
        } catch (error) {
            console.error('Erro na solicitação de recuperação:', error);
            res.status(500).json({ error: 'Erro ao processar solicitação' });
        }
    }

    async resetarSenha(req, res) {
        try {
            const { token, novaSenha } = req.body;

            // Verificar token
            const [recuperacao] = await db.execute(
                'SELECT * FROM recuperacao_senha WHERE token = ? AND usado = FALSE AND expiracao > NOW()',
                [token]
            );

            if (!recuperacao || recuperacao.length === 0) {
                return res.status(400).json({ error: 'Token inválido ou expirado' });
            }

            // Criptografar nova senha
            const salt = await bcrypt.genSalt(10);
            const senhaCriptografada = await bcrypt.hash(novaSenha, salt);

            // Atualizar senha
            if (recuperacao[0].cliente_id) {
                await db.execute(
                    'UPDATE clientes SET senha = ? WHERE id = ?',
                    [senhaCriptografada, recuperacao[0].cliente_id]
                );
            } else {
                await db.execute(
                    'UPDATE usuarios SET senha = ? WHERE id = ?',
                    [senhaCriptografada, recuperacao[0].usuario_id]
                );
            }

            // Marcar token como usado
            await db.execute(
                'UPDATE recuperacao_senha SET usado = TRUE WHERE id = ?',
                [recuperacao[0].id]
            );

            res.json({ message: 'Senha atualizada com sucesso' });
        } catch (error) {
            console.error('Erro ao resetar senha:', error);
            res.status(500).json({ error: 'Erro ao resetar senha' });
        }
    }
}

module.exports = new RecuperacaoSenhaController(); 