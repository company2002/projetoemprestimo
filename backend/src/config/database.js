require('dotenv').config();
const mysql = require('mysql2');
const winston = require('winston');

// Configurar logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ 
            filename: 'logs/database-error.log', 
            level: 'error' 
        }),
        new winston.transports.File({ 
            filename: 'logs/database.log' 
        })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Configuração do pool de conexões principal
const masterPool = mysql.createPool({
    host: process.env.DB_MASTER_HOST || process.env.DB_HOST,
    user: process.env.DB_MASTER_USER || process.env.DB_USER,
    password: process.env.DB_MASTER_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: process.env.DB_MASTER_CONNECTION_LIMIT || 50,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    timezone: 'Z',
    charset: 'utf8mb4',
    connectTimeout: 10000,
    acquireTimeout: 10000,
    multipleStatements: true
});

// Configuração do pool de conexões para leitura (réplicas)
const slavePool = process.env.DB_SLAVE_HOSTS ? mysql.createPoolCluster() : null;

if (slavePool) {
    const slaveHosts = process.env.DB_SLAVE_HOSTS.split(',');
    slaveHosts.forEach((host, index) => {
        slavePool.add(`slave${index}`, {
            host: host.trim(),
            user: process.env.DB_SLAVE_USER || process.env.DB_USER,
            password: process.env.DB_SLAVE_PASSWORD || process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            connectionLimit: process.env.DB_SLAVE_CONNECTION_LIMIT || 100
        });
    });

    // Configurar estratégia de seleção de réplica
    slavePool.on('remove', (nodeId) => {
        logger.warn(`Nó de réplica removido: ${nodeId}`);
    });

    slavePool.on('warn', (warning) => {
        logger.warn('Aviso do cluster:', warning);
    });
}

// Converter pools em promises
const masterPromisePool = masterPool.promise();
const slavePromisePool = slavePool ? slavePool.promise() : null;

// Função para escolher pool apropriado
function getPool(isReadOnly = false) {
    if (isReadOnly && slavePromisePool) {
        return slavePromisePool;
    }
    return masterPromisePool;
}

// Monitorar eventos do pool master
masterPool.on('connection', (connection) => {
    logger.info('Nova conexão estabelecida com o banco master');
    
    connection.on('error', (err) => {
        logger.error('Erro na conexão master:', err);
    });
});

// Função para testar conexões
async function testConnections() {
    try {
        // Testar master
        const masterConnection = await masterPromisePool.getConnection();
        logger.info('Conexão master estabelecida com sucesso');
        masterConnection.release();

        // Testar réplicas
        if (slavePromisePool) {
            const slaveConnection = await slavePromisePool.getConnection();
            logger.info('Conexão com réplica estabelecida com sucesso');
            slaveConnection.release();
        }

        return true;
    } catch (error) {
        logger.error('Erro ao testar conexões:', error);
        return false;
    }
}

// Função para retry de conexão
async function connectWithRetry(retries = 5, delay = 5000) {
    for (let i = 0; i < retries; i++) {
        const connected = await testConnections();
        if (connected) return true;
        
        logger.warn(`Tentativa ${i + 1} de ${retries} falhou. Tentando novamente em ${delay/1000} segundos...`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    return false;
}

// Função para executar query com failover
async function executeQuery(sql, params = [], isReadOnly = false) {
    try {
        const pool = getPool(isReadOnly);
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        logger.error('Erro na execução da query:', error);
        throw error;
    }
}

// Iniciar conexão com retry
connectWithRetry().then(success => {
    if (!success) {
        logger.error('Falha ao estabelecer conexões após várias tentativas');
        process.exit(1);
    }
}).catch(error => {
    logger.error('Erro fatal nas conexões:', error);
    process.exit(1);
});

// Exportar funções e pools
module.exports = {
    masterPool: masterPromisePool,
    slavePool: slavePromisePool,
    executeQuery,
    testConnections,
    connectWithRetry
}; 