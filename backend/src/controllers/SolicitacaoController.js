const { runQuery, getQuery, getOne } = require('../config/database');
const PDFDocument = require('pdfkit');
const moment = require('moment');
const fs = require('fs');

class SolicitacaoController {
    async listar(req, res) {
        try {
            const solicitacoes = getQuery('SELECT * FROM solicitacoes ORDER BY data_hora DESC');
            res.json(solicitacoes);
        } catch (error) {
            console.error('Erro ao listar solicitações:', error);
            res.status(500).json({ error: 'Erro ao listar solicitações' });
        }
    }

    async criar(req, res) {
        try {
            const {
                nome,
                telefone,
                valor,
                tipo,
                forma_recebimento,
                operador,
                juros,
                total,
                prestacao,
                valor_receber,
                parcelas,
                detalhes_recebimento,
                observacao
            } = req.body;

            const result = runQuery(
                `INSERT INTO solicitacoes (
                    nome, telefone, valor, tipo, forma_recebimento, 
                    operador, juros, total, prestacao, valor_receber,
                    parcelas, detalhes_recebimento, observacao
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    nome, telefone, valor, tipo, forma_recebimento,
                    operador, juros, total, prestacao, valor_receber,
                    parcelas, detalhes_recebimento, observacao
                ]
            );

            res.status(201).json({
                id: result.lastInsertRowid,
                message: 'Solicitação criada com sucesso'
            });
        } catch (error) {
            console.error('Erro ao criar solicitação:', error);
            res.status(500).json({ error: 'Erro ao criar solicitação' });
        }
    }

    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const solicitacao = getOne('SELECT * FROM solicitacoes WHERE id = ?', [id]);

            if (!solicitacao) {
                return res.status(404).json({ error: 'Solicitação não encontrada' });
            }

            res.json(solicitacao);
        } catch (error) {
            console.error('Erro ao buscar solicitação:', error);
            res.status(500).json({ error: 'Erro ao buscar solicitação' });
        }
    }

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const dados = req.body;

            // Constrói a query dinamicamente baseada nos campos fornecidos
            const campos = Object.keys(dados);
            const valores = Object.values(dados);
            const setClause = campos.map(campo => `${campo} = ?`).join(', ');

            const result = runQuery(
                `UPDATE solicitacoes SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [...valores, id]
            );

            if (result.changes === 0) {
                return res.status(404).json({ error: 'Solicitação não encontrada' });
            }

            res.json({ message: 'Solicitação atualizada com sucesso' });
        } catch (error) {
            console.error('Erro ao atualizar solicitação:', error);
            res.status(500).json({ error: 'Erro ao atualizar solicitação' });
        }
    }

    async excluir(req, res) {
        try {
            const { id } = req.params;
            const result = runQuery('DELETE FROM solicitacoes WHERE id = ?', [id]);

            if (result.changes === 0) {
                return res.status(404).json({ error: 'Solicitação não encontrada' });
            }

            res.json({ message: 'Solicitação excluída com sucesso' });
        } catch (error) {
            console.error('Erro ao excluir solicitação:', error);
            res.status(500).json({ error: 'Erro ao excluir solicitação' });
        }
    }

    async relatorio(req, res) {
        try {
            const { dataInicio, dataFim } = req.query;
            
            let sql = 'SELECT * FROM solicitacoes WHERE 1=1';
            const params = [];

            if (dataInicio) {
                sql += ' AND data_hora >= ?';
                params.push(dataInicio);
            }
            if (dataFim) {
                sql += ' AND data_hora <= ?';
                params.push(dataFim);
            }

            sql += ' ORDER BY data_hora DESC';

            const solicitacoes = getQuery(sql, params);
            res.json(solicitacoes);
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            res.status(500).json({ error: 'Erro ao gerar relatório' });
        }
    }

    async gerarRelatorioPDF(req, res) {
        try {
            const { dataInicio, dataFim } = req.query;
            
            let sql = 'SELECT * FROM solicitacoes WHERE 1=1';
            const params = [];

            if (dataInicio) {
                sql += ' AND data_hora >= ?';
                params.push(dataInicio);
            }
            if (dataFim) {
                sql += ' AND data_hora <= ?';
                params.push(dataFim);
            }

            sql += ' ORDER BY data_hora DESC';

            const [solicitacoes] = await runQuery(sql, params);

            // Criar PDF
            const doc = new PDFDocument();
            const filename = `relatorio_${moment().format('YYYY-MM-DD')}.pdf`;
            
            // Configurar cabeçalho
            doc.fontSize(20).text('Relatório de Solicitações de Empréstimo', {align: 'center'});
            doc.moveDown();
            doc.fontSize(12).text(`Período: ${moment(dataInicio).format('DD/MM/YYYY')} a ${moment(dataFim).format('DD/MM/YYYY')}`);
            doc.moveDown();

            // Adicionar dados
            solicitacoes.forEach(sol => {
                doc.text(`Nome: ${sol.nome}`);
                doc.text(`Telefone: ${sol.telefone}`);
                doc.text(`Valor: R$ ${sol.valor}`);
                doc.text(`Tipo: ${sol.tipo}`);
                doc.text(`Status: ${sol.status}`);
                doc.text(`Data: ${moment(sol.data_hora).format('DD/MM/YYYY HH:mm')}`);
                doc.moveDown();
            });

            // Adicionar resumo
            doc.moveDown();
            const totalSolicitacoes = solicitacoes.length;
            const valorTotal = solicitacoes.reduce((acc, sol) => acc + parseFloat(sol.valor), 0);
            
            doc.fontSize(14).text('Resumo');
            doc.fontSize(12).text(`Total de Solicitações: ${totalSolicitacoes}`);
            doc.text(`Valor Total: R$ ${valorTotal.toFixed(2)}`);

            // Configurar resposta
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
            
            doc.pipe(res);
            doc.end();
        } catch (error) {
            console.error('Erro ao gerar relatório PDF:', error);
            res.status(500).json({ error: 'Erro ao gerar relatório PDF' });
        }
    }
}

module.exports = new SolicitacaoController(); 