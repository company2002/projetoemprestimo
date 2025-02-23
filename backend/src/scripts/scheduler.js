const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const winston = require('winston');

// Configurar logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

// Adicionar log para console em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Função para executar backup
function executarBackup() {
    const scriptPath = path.join(__dirname, 'backup.js');
    exec(`node ${scriptPath}`, (error, stdout, stderr) => {
        if (error) {
            logger.error('Erro ao executar backup:', { error: error.message });
            return;
        }
        if (stderr) {
            logger.warn('Aviso durante backup:', { warning: stderr });
        }
        logger.info('Backup executado com sucesso:', { output: stdout });
    });
}

// Função para limpar logs antigos
function limparLogsAntigos() {
    const cmd = `mysql -h ${process.env.DB_HOST} -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} -e "CALL sp_limpar_logs_antigos(90)"`;
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            logger.error('Erro ao limpar logs:', { error: error.message });
            return;
        }
        logger.info('Limpeza de logs concluída');
    });
}

// Agendar backup diário às 23:00
cron.schedule('0 23 * * *', () => {
    logger.info('Iniciando backup agendado');
    executarBackup();
});

// Agendar limpeza de logs todo domingo à 01:00
cron.schedule('0 1 * * 0', () => {
    logger.info('Iniciando limpeza de logs');
    limparLogsAntigos();
});

logger.info('Agendador iniciado com sucesso');

// Manter processo rodando
process.stdin.resume(); 