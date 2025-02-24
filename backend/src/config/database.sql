-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS emprestimos;
USE emprestimos;

-- Criar tabela de solicitações
CREATE TABLE IF NOT EXISTS solicitacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    tipo ENUM('avulso', 'parcelado', 'cartao', 'renovacao_parcelado', 'renovacao_cartao') NOT NULL,
    forma_recebimento VARCHAR(50),
    operador VARCHAR(50),
    juros DECIMAL(10,2),
    total DECIMAL(10,2),
    prestacao DECIMAL(10,2),
    valor_receber DECIMAL(10,2),
    data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    parcelas INT,
    detalhes_recebimento TEXT,
    observacao TEXT,
    status ENUM('pendente', 'aprovado', 'recusado') DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    cliente_id INT,
    parcelas_pagas INT DEFAULT 0,
    parcelas_restantes INT DEFAULT 0,
    proxima_parcela DATE,
    valor_total_pago DECIMAL(10,2) DEFAULT 0,
    valor_restante DECIMAL(10,2) DEFAULT 0,
    status_pagamento ENUM('em_dia', 'atrasado', 'quitado', 'inadimplente') DEFAULT 'em_dia',
    score_impacto INT DEFAULT 0,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role ENUM('master', 'admin', 'operador') NOT NULL DEFAULT 'operador',
    status ENUM('pendente', 'aprovado', 'recusado') DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    data_nascimento DATE NOT NULL,
    endereco TEXT NOT NULL,
    senha VARCHAR(255) NOT NULL,
    score INT DEFAULT 0,
    margem_avulso DECIMAL(10,2) DEFAULT 5000.00,
    margem_parcelado DECIMAL(10,2) DEFAULT 15000.00,
    margem_cartao DECIMAL(10,2) DEFAULT 10000.00,
    status ENUM('ativo', 'bloqueado', 'inadimplente') DEFAULT 'ativo',
    tipo_cliente ENUM('PG', 'NaoPG') DEFAULT 'NaoPG',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Criar tabela de controle de pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitacao_id INT NOT NULL,
    cliente_id INT NOT NULL,
    numero_parcela INT NOT NULL,
    valor_parcela DECIMAL(10,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    valor_pago DECIMAL(10,2),
    juros_atraso DECIMAL(10,2) DEFAULT 0,
    status ENUM('pendente', 'pago', 'atrasado', 'negociado') DEFAULT 'pendente',
    forma_pagamento VARCHAR(50),
    comprovante_url TEXT,
    observacao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes(id),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Criar tabela de solicitações de aumento de margem
CREATE TABLE IF NOT EXISTS solicitacoes_margem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    tipo_margem ENUM('avulso', 'parcelado', 'cartao', 'emergencial') NOT NULL,
    valor_solicitado DECIMAL(10,2) NOT NULL,
    motivo TEXT NOT NULL,
    status ENUM('pendente', 'aprovado', 'recusado') DEFAULT 'pendente',
    aprovado_por INT,
    data_aprovacao DATETIME,
    observacao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (aprovado_por) REFERENCES usuarios(id)
);

-- Criar tabela de histórico de alterações de margem
CREATE TABLE IF NOT EXISTS historico_margem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    tipo_margem ENUM('avulso', 'parcelado', 'cartao', 'emergencial') NOT NULL,
    valor_anterior DECIMAL(10,2) NOT NULL,
    valor_novo DECIMAL(10,2) NOT NULL,
    alterado_por INT NOT NULL,
    motivo TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (alterado_por) REFERENCES usuarios(id)
);

-- Criar tabela de níveis
CREATE TABLE IF NOT EXISTS niveis_cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome ENUM('Bronze', 'Prata', 'Ouro', 'Diamante') NOT NULL,
    score_minimo INT NOT NULL,
    desconto_juros DECIMAL(5,2) NOT NULL,
    multiplicador_margem DECIMAL(3,2) NOT NULL,
    tempo_analise_horas INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de medalhas/conquistas
CREATE TABLE IF NOT EXISTS medalhas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    icone VARCHAR(50) NOT NULL,
    pontos INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de medalhas do cliente
CREATE TABLE IF NOT EXISTS cliente_medalhas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    medalha_id INT NOT NULL,
    data_conquista TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (medalha_id) REFERENCES medalhas(id)
);

-- Criar tabela de tokens de recuperação de senha
CREATE TABLE IF NOT EXISTS recuperacao_senha (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    cliente_id INT,
    token VARCHAR(100) NOT NULL,
    expiracao DATETIME NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Criar tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS logs_auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    tipo_operacao ENUM('insert', 'update', 'delete', 'login', 'logout', 'aprovacao', 'rejeicao') NOT NULL,
    tabela_afetada VARCHAR(50) NOT NULL,
    registro_id INT,
    dados_anteriores JSON,
    dados_novos JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Criar tabela de configurações de backup
CREATE TABLE IF NOT EXISTS configuracoes_backup (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('completo', 'incremental') NOT NULL,
    frequencia ENUM('diario', 'semanal', 'mensal') NOT NULL,
    hora_execucao TIME NOT NULL,
    ultima_execucao DATETIME,
    proxima_execucao DATETIME,
    diretorio_backup VARCHAR(255) NOT NULL,
    retencao_dias INT DEFAULT 30,
    status ENUM('ativo', 'inativo') DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Criar tabela de histórico de backups
CREATE TABLE IF NOT EXISTS historico_backups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    configuracao_id INT,
    arquivo VARCHAR(255) NOT NULL,
    tamanho_bytes BIGINT NOT NULL,
    inicio_backup DATETIME NOT NULL,
    fim_backup DATETIME NOT NULL,
    status ENUM('sucesso', 'erro', 'em_andamento') NOT NULL,
    mensagem_erro TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (configuracao_id) REFERENCES configuracoes_backup(id)
);

-- Criar view para relatório de empréstimos
CREATE OR REPLACE VIEW vw_relatorio_emprestimos AS
SELECT 
    s.id,
    s.nome,
    s.valor,
    s.tipo,
    s.status,
    s.data_hora,
    s.parcelas,
    s.valor_total_pago,
    s.valor_restante,
    s.status_pagamento,
    c.nome AS nome_cliente,
    c.cpf,
    c.tipo_cliente,
    u.nome AS nome_operador
FROM solicitacoes s
LEFT JOIN clientes c ON s.cliente_id = c.id
LEFT JOIN usuarios u ON s.operador = u.nome;

-- Criar view para análise de inadimplência
CREATE OR REPLACE VIEW vw_analise_inadimplencia AS
SELECT 
    c.id AS cliente_id,
    c.nome AS nome_cliente,
    c.cpf,
    c.tipo_cliente,
    COUNT(s.id) AS total_emprestimos,
    SUM(CASE WHEN s.status_pagamento = 'inadimplente' THEN 1 ELSE 0 END) AS emprestimos_inadimplentes,
    SUM(s.valor) AS valor_total_emprestimos,
    SUM(s.valor_restante) AS valor_total_inadimplencia,
    c.score
FROM clientes c
LEFT JOIN solicitacoes s ON c.id = s.cliente_id
GROUP BY c.id, c.nome, c.cpf, c.tipo_cliente, c.score;

-- Criar view para desempenho de operadores
CREATE OR REPLACE VIEW vw_desempenho_operadores AS
SELECT 
    u.id AS operador_id,
    u.nome AS nome_operador,
    COUNT(s.id) AS total_solicitacoes,
    SUM(CASE WHEN s.status = 'aprovado' THEN 1 ELSE 0 END) AS solicitacoes_aprovadas,
    SUM(CASE WHEN s.status = 'recusado' THEN 1 ELSE 0 END) AS solicitacoes_recusadas,
    SUM(s.valor) AS valor_total_emprestimos,
    AVG(CASE WHEN s.status_pagamento = 'inadimplente' THEN 1 ELSE 0 END) * 100 AS taxa_inadimplencia
FROM usuarios u
LEFT JOIN solicitacoes s ON u.nome = s.operador
WHERE u.role = 'operador'
GROUP BY u.id, u.nome;

-- Adicionar índices para otimização
CREATE INDEX idx_solicitacoes_cliente ON solicitacoes(cliente_id);
CREATE INDEX idx_solicitacoes_status ON solicitacoes(status);
CREATE INDEX idx_solicitacoes_data ON solicitacoes(data_hora);
CREATE INDEX idx_pagamentos_status ON pagamentos(status);
CREATE INDEX idx_clientes_score ON clientes(score);
CREATE INDEX idx_usuarios_role ON usuarios(role);

-- Inserir usuário master inicial (senha: admin123)
INSERT INTO usuarios (nome, email, senha, role, status) VALUES 
('Administrador Master', 'admin@sistema.com', '$2a$10$XYZ123ABC456DEF789GHI.abcdefghijklmnopqrstuvwxyz123456789', 'master', 'aprovado')
ON DUPLICATE KEY UPDATE id=id;

-- Inserir operador inicial (senha: operador123)
INSERT INTO usuarios (nome, email, senha, role, status) VALUES 
('Operador Padrão', 'operador@sistema.com', '$2a$10$XYZ123ABC456DEF789GHI.abcdefghijklmnopqrstuvwxyz123456789', 'operador', 'aprovado')
ON DUPLICATE KEY UPDATE id=id;

-- Inserir cliente teste (senha: cliente123)
INSERT INTO clientes (nome, cpf, email, telefone, data_nascimento, endereco, senha, status) VALUES 
('Cliente Teste', '123.456.789-00', 'cliente@teste.com', '(21) 98765-4321', '1990-01-01', 'Rua Teste, 123', '$2a$10$XYZ123ABC456DEF789GHI.abcdefghijklmnopqrstuvwxyz123456789', 'ativo')
ON DUPLICATE KEY UPDATE id=id;

-- Inserir níveis padrão
INSERT INTO niveis_cliente (nome, score_minimo, desconto_juros, multiplicador_margem, tempo_analise_horas) VALUES
('Bronze', 0, 0.00, 1.00, 24),
('Prata', 300, 5.00, 1.25, 12),
('Ouro', 600, 10.00, 1.50, 6),
('Diamante', 900, 15.00, 2.00, 2);

-- Inserir medalhas iniciais
INSERT INTO medalhas (nome, descricao, icone, pontos) VALUES
('Primeiro Empréstimo', 'Realizou seu primeiro empréstimo', 'fa-star', 50),
('Pagador Pontual', 'Pagou 5 parcelas em dia consecutivamente', 'fa-clock', 100),
('Cliente VIP', 'Atingiu o nível Ouro', 'fa-crown', 200),
('Mestre do Crédito', 'Atingiu o nível Diamante', 'fa-gem', 300),
('Indicador Bronze', 'Indicou 3 amigos', 'fa-users', 150),
('Indicador Prata', 'Indicou 5 amigos', 'fa-user-plus', 250);

-- Inserir configuração padrão de backup
INSERT INTO configuracoes_backup 
(tipo, frequencia, hora_execucao, diretorio_backup) VALUES 
('completo', 'diario', '23:00:00', '/backups/database')
ON DUPLICATE KEY UPDATE id=id;

-- Criar procedure para limpeza automática de logs antigos
DELIMITER //
CREATE PROCEDURE sp_limpar_logs_antigos(IN dias_retencao INT)
BEGIN
    DELETE FROM logs_auditoria 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL dias_retencao DAY);
    
    DELETE FROM historico_backups 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL dias_retencao DAY);
END //
DELIMITER ;

-- Criar evento para execução automática da limpeza de logs
CREATE EVENT IF NOT EXISTS ev_limpar_logs
ON SCHEDULE EVERY 1 DAY
DO CALL sp_limpar_logs_antigos(90);

-- Criar trigger para registrar alterações em solicitações
DELIMITER //
CREATE TRIGGER tr_audit_solicitacoes_update
AFTER UPDATE ON solicitacoes
FOR EACH ROW
BEGIN
    INSERT INTO logs_auditoria (
        tipo_operacao,
        tabela_afetada,
        registro_id,
        dados_anteriores,
        dados_novos
    ) VALUES (
        'update',
        'solicitacoes',
        NEW.id,
        JSON_OBJECT(
            'status', OLD.status,
            'valor', OLD.valor,
            'parcelas', OLD.parcelas
        ),
        JSON_OBJECT(
            'status', NEW.status,
            'valor', NEW.valor,
            'parcelas', NEW.parcelas
        )
    );
END //
DELIMITER ;

-- Criar trigger para registrar alterações em clientes
DELIMITER //
CREATE TRIGGER tr_audit_clientes_update
AFTER UPDATE ON clientes
FOR EACH ROW
BEGIN
    INSERT INTO logs_auditoria (
        tipo_operacao,
        tabela_afetada,
        registro_id,
        dados_anteriores,
        dados_novos
    ) VALUES (
        'update',
        'clientes',
        NEW.id,
        JSON_OBJECT(
            'score', OLD.score,
            'status', OLD.status,
            'tipo_cliente', OLD.tipo_cliente
        ),
        JSON_OBJECT(
            'score', NEW.score,
            'status', NEW.status,
            'tipo_cliente', NEW.tipo_cliente
        )
    );
END //
DELIMITER ; 