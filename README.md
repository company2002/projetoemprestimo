# Sistema de Gerenciamento de Empréstimos

Sistema web completo para gerenciamento de empréstimos, com áreas específicas para clientes, administradores e master.

## 🌐 URLs do Sistema

**Área do Cliente:**
- Login: https://company2002.github.io/projetoemprestimo/frontend/index.html
- Cadastro: https://company2002.github.io/projetoemprestimo/frontend/cadastro.html
- Área do Cliente: https://company2002.github.io/projetoemprestimo/frontend/area-cliente.html
- Recuperação de Senha: https://company2002.github.io/projetoemprestimo/frontend/recuperar-senha.html
- Reset de Senha: https://company2002.github.io/projetoemprestimo/frontend/reset-senha.html

**Área Administrativa:**
- Login: https://company2002.github.io/projetoemprestimo/frontend/admin/index.html
- Cadastro: https://company2002.github.io/projetoemprestimo/frontend/admin/cadastro.html
- Painel Admin: https://company2002.github.io/projetoemprestimo/frontend/admin/painel.html
- Recuperação de Senha: https://company2002.github.io/projetoemprestimo/frontend/admin/recuperar-senha.html
- Reset de Senha: https://company2002.github.io/projetoemprestimo/frontend/admin/reset-senha.html

**Área Master:**
- Login: https://company2002.github.io/projetoemprestimo/frontend/master/index.html
- Painel Master: https://company2002.github.io/projetoemprestimo/frontend/master/painel.html

## 📋 Requisitos

- Node.js v14 ou superior
- MySQL 8.0 ou superior
- Git

## 🚀 Instalação

### Instalação Automática (Windows)
1. Baixe o instalador: https://company2002.github.io/projetoemprestimo/download.bat
2. Execute o arquivo `download.bat`
3. Siga as instruções do instalador

### Instalação Manual
1. Clone o repositório:
```bash
git clone https://github.com/company2002/projetoemprestimo.git
cd projetoemprestimo
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações

4. Configure o banco de dados:
```bash
mysql -u root -p < backend/src/config/database.sql
```

5. Inicie o servidor:
```bash
npm run dev
```

## 🔑 Credenciais Iniciais

**Área Master:**
- Email: admin@sistema.com
- Senha: admin123

## 🛠️ Funcionalidades

### Área do Cliente
- Simulação de empréstimos
- Solicitação de empréstimos
- Visualização de status
- Gerenciamento de perfil
- Histórico de operações

### Área Administrativa
- Gestão de solicitações
- Aprovação/rejeição de empréstimos
- Relatórios operacionais
- Gestão de clientes

### Área Master
- Gestão de usuários do sistema
- Configurações do sistema
- Logs e auditoria
- Gestão de backups
- Monitoramento geral

## 📊 Tipos de Empréstimo

1. **Avulso**
   - 20 dias: 20% de juros
   - 30 dias: 30% de juros

2. **Parcelado**
   - 2x: 30% de juros
   - 6x: 45% de juros
   - 10x: 65% de juros

3. **Cartão**
   - 5x: 15% de juros
   - 10x: 20% de juros

## 🔒 Segurança

- Autenticação via JWT
- Senhas criptografadas com bcrypt
- Proteção contra SQL Injection
- Sistema de recuperação de senha
- Logs de auditoria
- Backup automático

## 📱 Integrações

- WhatsApp para notificações
- Email para recuperação de senha
- Backup automático
- Sistema de logs

## 🤝 Contribuição

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Para suporte, envie um email para suporte@sistema.com ou abra uma issue no GitHub. 