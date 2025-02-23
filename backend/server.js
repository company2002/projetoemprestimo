require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const solicitacoesRoutes = require('./src/routes/solicitacoes');
const authRoutes = require('./src/routes/auth');
const path = require('path');

// Iniciar agendador de tarefas
require('./src/scripts/scheduler');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Diretório para logs
const logDir = path.join(__dirname, 'logs');
if (!require('fs').existsSync(logDir)) {
    require('fs').mkdirSync(logDir);
}

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/solicitacoes', solicitacoesRoutes);

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ erro: 'Algo deu errado!' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 