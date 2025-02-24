const db = require('../config/database');

class GamificacaoController {
    async verificarNivel(cliente_id) {
        try {
            // Buscar score atual do cliente
            const [cliente] = await db.execute(
                'SELECT score FROM clientes WHERE id = ?',
                [cliente_id]
            );

            if (!cliente) return null;

            // Buscar novo nível baseado no score
            const [nivel] = await db.execute(
                'SELECT * FROM niveis_cliente WHERE score_minimo <= ? ORDER BY score_minimo DESC LIMIT 1',
                [cliente[0].score]
            );

            // Atualizar nível do cliente se necessário
            await db.execute(
                'UPDATE clientes SET nivel = ? WHERE id = ?',
                [nivel[0].nome, cliente_id]
            );

            // Verificar se conquistou medalha de nível
            if (nivel[0].nome === 'Ouro') {
                await this.concederMedalha(cliente_id, 'Cliente VIP');
            } else if (nivel[0].nome === 'Diamante') {
                await this.concederMedalha(cliente_id, 'Mestre do Crédito');
            }

            return nivel[0];
        } catch (error) {
            console.error('Erro ao verificar nível:', error);
            throw error;
        }
    }

    async concederMedalha(cliente_id, nome_medalha) {
        try {
            // Verificar se o cliente já tem a medalha
            const [medalhaExistente] = await db.execute(
                `SELECT cm.id FROM cliente_medalhas cm 
                 JOIN medalhas m ON m.id = cm.medalha_id 
                 WHERE cm.cliente_id = ? AND m.nome = ?`,
                [cliente_id, nome_medalha]
            );

            if (medalhaExistente.length > 0) return;

            // Buscar medalha
            const [medalha] = await db.execute(
                'SELECT * FROM medalhas WHERE nome = ?',
                [nome_medalha]
            );

            if (!medalha.length) return;

            // Conceder medalha
            await db.execute(
                'INSERT INTO cliente_medalhas (cliente_id, medalha_id) VALUES (?, ?)',
                [cliente_id, medalha[0].id]
            );

            // Adicionar pontos ao score do cliente
            await db.execute(
                'UPDATE clientes SET score = score + ? WHERE id = ?',
                [medalha[0].pontos, cliente_id]
            );

            return medalha[0];
        } catch (error) {
            console.error('Erro ao conceder medalha:', error);
            throw error;
        }
    }

    async verificarConquistas(cliente_id) {
        try {
            // Verificar pagamentos em dia consecutivos
            const [pagamentos] = await db.execute(
                `SELECT COUNT(*) as total FROM pagamentos 
                 WHERE cliente_id = ? AND status = 'pago' 
                 AND data_pagamento <= data_vencimento 
                 ORDER BY data_pagamento DESC LIMIT 5`,
                [cliente_id]
            );

            if (pagamentos[0].total >= 5) {
                await this.concederMedalha(cliente_id, 'Pagador Pontual');
            }

            // Verificar indicações
            const [indicacoes] = await db.execute(
                'SELECT COUNT(*) as total FROM indicacoes WHERE indicador_id = ?',
                [cliente_id]
            );

            if (indicacoes[0].total >= 3) {
                await this.concederMedalha(cliente_id, 'Indicador Bronze');
            }
            if (indicacoes[0].total >= 5) {
                await this.concederMedalha(cliente_id, 'Indicador Prata');
            }
        } catch (error) {
            console.error('Erro ao verificar conquistas:', error);
            throw error;
        }
    }

    async getBeneficios(cliente_id) {
        try {
            const [nivel] = await db.execute(
                `SELECT nc.* FROM clientes c 
                 JOIN niveis_cliente nc ON c.nivel = nc.nome 
                 WHERE c.id = ?`,
                [cliente_id]
            );

            if (!nivel.length) return null;

            return {
                desconto_juros: nivel[0].desconto_juros,
                multiplicador_margem: nivel[0].multiplicador_margem,
                tempo_analise_horas: nivel[0].tempo_analise_horas
            };
        } catch (error) {
            console.error('Erro ao buscar benefícios:', error);
            throw error;
        }
    }
}

module.exports = new GamificacaoController(); 