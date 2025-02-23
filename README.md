# Sistema de Gerenciamento de Empréstimos

Sistema web para gerenciamento de solicitações de empréstimos, com interface administrativa e simulador para clientes.

## Requisitos

- Node.js v14 ou superior
- MySQL 8.0 ou superior

## Instalação

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
- Crie um banco de dados MySQL
- Execute os scripts SQL localizados em `backend/src/config/database.sql`

5. Inicie o servidor:
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

## Funcionalidades

- Interface administrativa para gestão de empréstimos
- Simulador de empréstimos para clientes
- Gestão de usuários e permissões
- Relatórios e estatísticas

## Estrutura do Projeto

```
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── server.js
├── frontend/
│   └── public/
└── README.md
```

## Contribuição

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🚀 Funcionalidades

- ✅ Cadastro de solicitações de empréstimo
- ✅ Cálculo automático de juros e parcelas
- ✅ Integração com WhatsApp
- ✅ Sistema de autenticação
- ✅ Dashboard administrativo
- ✅ Múltiplos tipos de empréstimo

## 🛠️ Tecnologias Utilizadas

- Node.js
- Express
- MySQL
- JWT para autenticação
- HTML/CSS/JavaScript puro
- Font Awesome para ícones

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- MySQL (versão 5.7 ou superior)
- Git

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/sistema-emprestimos.git
cd sistema-emprestimos
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o banco de dados:
- Crie um banco MySQL
- Execute o script em `backend/src/config/database.sql`
- Execute o script em `backend/src/config/init.sql`

4. Configure o arquivo .env:
```env
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=emprestimos
JWT_SECRET=sua_chave_secreta
PORT=3000
```

## 🚀 Executando o Projeto

1. Inicie o servidor:
```bash
npm run dev
```

2. Acesse no navegador:
- Login: http://localhost:3000/login.html
- Painel: http://localhost:3000/index.html

## 👤 Credenciais Iniciais

- Email: admin@sistema.com
- Senha: admin123

## 📝 Tipos de Empréstimo

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
- CORS configurado

## 📱 Integração WhatsApp

O sistema envia automaticamente mensagens formatadas via WhatsApp Web com os detalhes da solicitação.

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Faça o Commit das suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Faça o Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ✨ Autor

Seu Nome - [GitHub](https://github.com/seu-usuario)

## 📞 Suporte

Para suporte, envie um email para seu.email@exemplo.com 