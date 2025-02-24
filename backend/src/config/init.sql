-- Inserir usuário administrador inicial
-- Senha: admin123 (já criptografada com bcrypt)
INSERT INTO usuarios (nome, email, senha, role)
VALUES (
    'Administrador',
    'admin@sistema.com',
    '$2a$10$XYZ123ABC456DEF789GHI.abcdefghijklmnopqrstuvwxyz123456789',
    'admin'
); 