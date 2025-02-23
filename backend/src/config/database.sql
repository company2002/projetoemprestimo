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

-- Inserir usuário master inicial
INSERT INTO usuarios (nome, email, senha, role, status)
VALUES (
    'Carlos Piquet',
    'carlospiquet2025',
    '$2a$10$XYZ123ABC456DEF789GHI.abcdefghijklmnopqrstuvwxyz123456789',
    'master',
    'aprovado'
) ON DUPLICATE KEY UPDATE id=id;

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