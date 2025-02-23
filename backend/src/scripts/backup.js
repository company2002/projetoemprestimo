const mysql = require('mysql2/promise');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
require('dotenv').config();

class DatabaseBackup {
    constructor() {
        this.config = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        };
    }

    async iniciarBackup() {
        try {
            const connection = await mysql.createConnection(this.config);
            
            // Buscar configuração ativa de backup
            const [configs] = await connection.execute(
                'SELECT * FROM configuracoes_backup WHERE status = "ativo" AND hora_execucao <= NOW() AND (ultima_execucao IS NULL OR DATE(ultima_execucao) < CURDATE())'
            );

            if (configs.length === 0) {
                console.log('Nenhum backup agendado para agora');
                return;
            }

            for (const config of configs) {
                await this.executarBackup(config, connection);
            }

            await connection.end();
        } catch (error) {
            console.error('Erro ao iniciar backup:', error);
            this.registrarErro(error);
        }
    }

    async executarBackup(config, connection) {
        const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
        const backupPath = path.join(config.diretorio_backup, `backup_${timestamp}.sql`);

        // Criar diretório se não existir
        if (!fs.existsSync(config.diretorio_backup)) {
            fs.mkdirSync(config.diretorio_backup, { recursive: true });
        }

        // Registrar início do backup
        const [result] = await connection.execute(
            'INSERT INTO historico_backups (configuracao_id, arquivo, tamanho_bytes, inicio_backup, fim_backup, status) VALUES (?, ?, 0, NOW(), NOW(), "em_andamento")',
            [config.id, backupPath]
        );
        const backupId = result.insertId;

        try {
            // Executar backup
            await new Promise((resolve, reject) => {
                const cmd = `mysqldump -h ${this.config.host} -u ${this.config.user} -p${this.config.password} ${this.config.database} > "${backupPath}"`;
                exec(cmd, (error, stdout, stderr) => {
                    if (error) reject(error);
                    else resolve();
                });
            });

            // Atualizar registro com sucesso
            const stats = fs.statSync(backupPath);
            await connection.execute(
                'UPDATE historico_backups SET tamanho_bytes = ?, fim_backup = NOW(), status = "sucesso" WHERE id = ?',
                [stats.size, backupId]
            );

            // Atualizar última execução
            await connection.execute(
                'UPDATE configuracoes_backup SET ultima_execucao = NOW(), proxima_execucao = DATE_ADD(NOW(), INTERVAL CASE frequencia WHEN "diario" THEN 1 WHEN "semanal" THEN 7 WHEN "mensal" THEN 30 END DAY) WHERE id = ?',
                [config.id]
            );

            // Limpar backups antigos
            await this.limparBackupsAntigos(config, connection);

            console.log(`Backup concluído com sucesso: ${backupPath}`);
        } catch (error) {
            // Registrar erro
            await connection.execute(
                'UPDATE historico_backups SET fim_backup = NOW(), status = "erro", mensagem_erro = ? WHERE id = ?',
                [error.message, backupId]
            );
            console.error('Erro ao executar backup:', error);
        }
    }

    async limparBackupsAntigos(config, connection) {
        try {
            const diretorio = config.diretorio_backup;
            const diasRetencao = config.retencao_dias;

            // Buscar arquivos antigos
            const arquivos = fs.readdirSync(diretorio);
            const dataLimite = moment().subtract(diasRetencao, 'days');

            for (const arquivo of arquivos) {
                const caminhoCompleto = path.join(diretorio, arquivo);
                const stats = fs.statSync(caminhoCompleto);
                const dataArquivo = moment(stats.mtime);

                if (dataArquivo.isBefore(dataLimite)) {
                    fs.unlinkSync(caminhoCompleto);
                    console.log(`Arquivo antigo removido: ${arquivo}`);
                }
            }
        } catch (error) {
            console.error('Erro ao limpar backups antigos:', error);
        }
    }

    async registrarErro(error) {
        try {
            const connection = await mysql.createConnection(this.config);
            await connection.execute(
                'INSERT INTO logs_auditoria (tipo_operacao, tabela_afetada, dados_novos) VALUES ("error", "backup", ?)',
                [JSON.stringify({ erro: error.message })]
            );
            await connection.end();
        } catch (e) {
            console.error('Erro ao registrar erro:', e);
        }
    }
}

// Executar backup
const backup = new DatabaseBackup();
backup.iniciarBackup(); 