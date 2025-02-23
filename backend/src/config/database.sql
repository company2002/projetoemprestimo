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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role ENUM('admin', 'operador') NOT NULL DEFAULT 'operador',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir usuário administrador inicial
-- Senha: admin123 (já criptografada com bcrypt)
INSERT INTO usuarios (nome, email, senha, role)
VALUES (
    'Administrador',
    'admin@sistema.com',
    '$2a$10$XYZ123ABC456DEF789GHI.abcdefghijklmnopqrstuvwxyz123456789',
    'admin'
) ON DUPLICATE KEY UPDATE id=id; 