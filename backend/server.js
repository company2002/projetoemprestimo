require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const solicitacoesRoutes = require('./src/routes/solicitacoes');
const authRoutes = require('./src/routes/auth');
const clientesRoutes = require('./src/routes/clientes');
const path = require('path');

// Iniciar agendador de tarefas
require('./src/scripts/scheduler');

const app = express();

// Configuração CORS
const corsOptions = {
    origin: [
        'https://company2002.github.io',
        'http://localhost:3000',
        'http://localhost:5000',
        'http://localhost:3001',
        'http://127.0.0.1:5500',
        'https://sistema-emprestimo.onrender.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false
};

// Middlewares
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../frontend')));

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${process.env.NODE_ENV}] ${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
});

// Diretório para logs
const logDir = path.join(__dirname, 'logs');
if (!require('fs').existsSync(logDir)) {
    require('fs').mkdirSync(logDir);
}

// Rotas API
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/solicitacoes', solicitacoesRoutes);

// Rota de teste/status
app.get('/status', (req, res) => {
    console.log('Status check requested');
    res.json({ 
        status: 'online', 
        timestamp: new Date(),
        env: process.env.NODE_ENV,
        port: process.env.PORT,
        node_version: process.version,
        memory_usage: process.memoryUsage()
    });
});

// Rota raiz
app.get('/', (req, res) => {
    console.log('Root route requested');
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
    console.log('404 - Rota não encontrada:', req.url);
    res.status(404).json({ 
        error: 'Rota não encontrada',
        path: req.url,
        method: req.method
    });
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro na aplicação:', err);
    res.status(500).json({ 
        erro: 'Algo deu errado!',
        mensagem: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 10000;

// Verificar se a porta está em uso
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('=================================');
    console.log(`Servidor iniciado com sucesso`);
    console.log(`Ambiente: ${process.env.NODE_ENV}`);
    console.log(`Porta: ${PORT}`);
    console.log(`Node Version: ${process.version}`);
    console.log(`Memória: ${JSON.stringify(process.memoryUsage())}`);
    console.log('=================================');
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Porta ${PORT} já está em uso. Tentando outra porta...`);
        server.close();
        const newPort = PORT + 1;
        app.listen(newPort, '0.0.0.0', () => {
            console.log(`Servidor rodando na nova porta ${newPort}`);
        });
    } else {
        console.error('Erro ao iniciar servidor:', err);
    }
}); 