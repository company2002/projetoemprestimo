-- Criar tabela de usuários
CREATE TABLE usuarios (
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
CREATE TABLE clientes (
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

-- Criar tabela de solicitações
CREATE TABLE solicitacoes (
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

-- Criar tabela de pagamentos
CREATE TABLE pagamentos (
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

-- Criar tabela de recuperação de senha
CREATE TABLE recuperacao_senha (
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

-- Inserir usuário administrador inicial
INSERT INTO usuarios (nome, email, senha, role, status) VALUES 
('Administrador', 'admin@sistema.com', '$2a$10$XYZ123ABC456DEF789GHI.abcdefghijklmnopqrstuvwxyz123456789', 'master', 'aprovado'); 