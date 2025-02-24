const db = require('../config/database');

class Solicitacao {
    static async criar(solicitacao) {
        try {
            const [result] = await db.execute(
                `INSERT INTO solicitacoes 
                (nome, telefone, valor, tipo, forma_recebimento, operador, 
                juros, total, prestacao, valor_receber, data_hora, 
                parcelas, detalhes_recebimento, observacao) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)`,
                [
                    solicitacao.nome,
                    solicitacao.telefone,
                    solicitacao.valor,
                    solicitacao.tipo,
                    solicitacao.formaRecebimento,
                    solicitacao.operador,
                    solicitacao.juros,
                    solicitacao.total,
                    solicitacao.prestacao,
                    solicitacao.valorReceber,
                    solicitacao.parcelas,
                    solicitacao.detalhesRecebimento,
                    solicitacao.observacao
                ]
            );
            return result.insertId;
        } catch (error) {
            console.error('Erro ao criar solicitação:', error);
            throw error;
        }
    }

    static async listar() {
        try {
            const [rows] = await db.query('SELECT * FROM solicitacoes ORDER BY data_hora DESC');
            return rows;
        } catch (error) {
            console.error('Erro ao listar solicitações:', error);
            throw error;
        }
    }

    static async buscarPorId(id) {
        try {
            const [rows] = await db.execute('SELECT * FROM solicitacoes WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            console.error('Erro ao buscar solicitação:', error);
            throw error;
        }
    }

    static async atualizar(id, solicitacao) {
        try {
            const [result] = await db.execute(
                `UPDATE solicitacoes SET 
                nome = ?, telefone = ?, valor = ?, tipo = ?, 
                forma_recebimento = ?, operador = ?, juros = ?, 
                total = ?, prestacao = ?, valor_receber = ?, 
                parcelas = ?, detalhes_recebimento = ?, observacao = ? 
                WHERE id = ?`,
                [
                    solicitacao.nome,
                    solicitacao.telefone,
                    solicitacao.valor,
                    solicitacao.tipo,
                    solicitacao.formaRecebimento,
                    solicitacao.operador,
                    solicitacao.juros,
                    solicitacao.total,
                    solicitacao.prestacao,
                    solicitacao.valorReceber,
                    solicitacao.parcelas,
                    solicitacao.detalhesRecebimento,
                    solicitacao.observacao,
                    id
                ]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Erro ao atualizar solicitação:', error);
            throw error;
        }
    }

    static async deletar(id) {
        try {
            const [result] = await db.execute('DELETE FROM solicitacoes WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Erro ao deletar solicitação:', error);
            throw error;
        }
    }
}

module.exports = Solicitacao; 