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
        'http://127.0.0.1:5500'
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
    res.json({ status: 'online', timestamp: new Date() });
});

// Rota raiz
app.get('/', (req, res) => {
    res.json({ 
        message: 'API do Sistema de Empréstimos',
        status: 'online',
        endpoints: {
            auth: '/api/auth',
            clientes: '/api/clientes',
            solicitacoes: '/api/solicitacoes'
        }
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
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV}`);
}); 