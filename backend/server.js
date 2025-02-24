require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const winston = require('winston');
const path = require('path');
const jwt = require('jsonwebtoken');

// Importar rotas
const solicitacoesRoutes = require('./src/routes/solicitacoes');
const authRoutes = require('./src/routes/auth');
const clientesRoutes = require('./src/routes/clientes');
const adminRoutes = require('./src/routes/admin');
const masterRoutes = require('./src/routes/master');

// Configurar logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ 
            filename: path.join(__dirname, 'logs/error.log'), 
            level: 'error' 
        }),
        new winston.transports.File({ 
            filename: path.join(__dirname, 'logs/combined.log') 
        })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Iniciar Express
const app = express();

// Configurações de segurança avançadas
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.exemplo.com"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "same-site" },
    dnsPrefetchControl: true,
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: true,
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true
}));

app.use(compression());

// Rate limiting mais restritivo
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite por IP
    message: { erro: 'Muitas requisições deste IP, tente novamente mais tarde' },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiting específico para autenticação
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // 5 tentativas por hora
    message: { erro: 'Muitas tentativas de login, tente novamente mais tarde' }
});

app.use(limiter);
app.use('/api/auth/login', authLimiter);

// Lista de IPs dos administradores
const adminIPs = new Set();

// Função para registrar IP de admin
const registerAdminIP = (ip) => {
    adminIPs.add(ip);
    logger.info(`Novo IP admin registrado: ${ip}`);
};

// Configuração CORS mais restritiva
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            'https://company2002.github.io', // Frontend cliente
            'http://localhost:3000',         // Desenvolvimento local
            'http://localhost:10000',        // Servidor principal
        ];
        
        // Permitir IPs dos admins
        if (adminIPs.has(origin)) {
            callback(null, true);
            return;
        }
        
        // Permitir origens conhecidas
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Não permitido pelo CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400
};

app.use(cors(corsOptions));

// Middlewares
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));

// Middleware de autenticação para admin
const adminAuthMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    const ip = req.ip;

    if (!token) {
        return res.status(401).json({ erro: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'admin') {
            registerAdminIP(ip);
            req.admin = decoded;
            next();
        } else {
            res.status(403).json({ erro: 'Acesso não autorizado' });
        }
    } catch (error) {
        res.status(401).json({ erro: 'Token inválido' });
    }
};

// Middleware de autenticação para master
const masterAuthMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    const ip = req.ip;

    if (!token) {
        return res.status(401).json({ erro: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'master' && ip === '127.0.0.1') {
            req.master = decoded;
            next();
        } else {
            res.status(403).json({ erro: 'Acesso não autorizado' });
        }
    } catch (error) {
        res.status(401).json({ erro: 'Token inválido' });
    }
};

// Rotas API
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/solicitacoes', solicitacoesRoutes);
app.use('/api/admin', adminAuthMiddleware, adminRoutes);
app.use('/api/master', masterAuthMiddleware, masterRoutes);

// Rota para registro de admin
app.post('/api/admin/register-ip', adminAuthMiddleware, (req, res) => {
    const ip = req.ip;
    registerAdminIP(ip);
    res.json({ message: 'IP registrado com sucesso', ip });
});

// Rota de status
app.get('/status', (req, res) => {
    const isLocal = req.ip === '127.0.0.1' || req.ip === '::1';
    const status = {
        status: 'online',
        timestamp: new Date(),
        env: process.env.NODE_ENV,
        node_version: process.version,
        uptime: process.uptime()
    };
    
    // Informações sensíveis apenas para acesso local
    if (isLocal) {
        status.memory_usage = process.memoryUsage();
        status.connections = server.connections;
        status.admin_ips = Array.from(adminIPs);
    }
    
    res.json(status);
});

// Rota raiz
app.get('/', (req, res) => {
    logger.info('Root route requested');
    res.json({ 
        message: 'API do Sistema de Empréstimos',
        status: 'online',
        version: '1.0.0',
        env: process.env.NODE_ENV,
        endpoints: {
            auth: '/api/auth',
            clientes: '/api/clientes',
            solicitacoes: '/api/solicitacoes',
            status: '/status'
        }
    });
});

// Tratamento de rotas não encontradas
app.use((req, res) => {
    logger.warn(`404 - Rota não encontrada: ${req.url}`);
    res.status(404).json({ 
        error: 'Rota não encontrada',
        path: req.url,
        method: req.method
    });
});

// Tratamento de erros melhorado
app.use((err, req, res, next) => {
    logger.error('Erro na aplicação:', {
        erro: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
        ip: req.ip,
        user: req.user?.id
    });
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            erro: 'Erro de validação',
            detalhes: err.details
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            erro: 'Não autorizado',
            detalhes: err.message
        });
    }

    res.status(500).json({ 
        erro: 'Erro interno do servidor',
        id: Math.random().toString(36).substring(7)
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 10000;
let server;

const startServer = (port) => {
    try {
        server = app.listen(port, '0.0.0.0', () => {
            logger.info('=================================');
            logger.info(`Servidor iniciado com sucesso`);
            logger.info(`Ambiente: ${process.env.NODE_ENV}`);
            logger.info(`Porta: ${port}`);
            logger.info(`Node Version: ${process.version}`);
            logger.info(`Memória: ${JSON.stringify(process.memoryUsage())}`);
            logger.info('=================================');
            
            console.log(`
==========================================
Servidor rodando em http://localhost:${port}
Painéis:
- Cliente: https://company2002.github.io
- Admin: http://localhost:${port}/admin (local)
- Admin Remoto: Conectado via API
- Master: http://localhost:${port}/master (apenas local)
==========================================
            `);
        });

        // Graceful shutdown
        const shutdown = () => {
            logger.info('Iniciando shutdown graceful...');
            server.close(() => {
                logger.info('Servidor encerrado com sucesso');
                process.exit(0);
            });
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
        
    } catch (error) {
        logger.error('Erro fatal ao iniciar servidor:', error);
        process.exit(1);
    }
};

startServer(PORT); 