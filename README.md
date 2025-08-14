# lucaspinheiro.work - Portfolio Profissional

Sistema de portfolio profissional com formulário de contato integrado, utilizando AWS SES para envio de emails e PostgreSQL para armazenamento de dados.

## 🚀 Tecnologias

- **Backend**: Node.js + Express
- **Banco de Dados**: PostgreSQL
- **Email**: AWS SES (Simple Email Service)
- **Deploy**: Heroku
- **Frontend**: HTML5, CSS3, JavaScript Vanilla

## 📋 Pré-requisitos

- Node.js 18.x ou superior
- NPM 9.x ou superior
- Conta na AWS com SES configurado
- Conta no Heroku
- PostgreSQL (local para desenvolvimento)

## 🔧 Instalação Local

1. Clone o repositório:
```bash
git clone https://github.com/LucasAgroTech/lucaspinheiro.git
cd lucaspinheiro
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio
AWS_ACCESS_KEY_ID=sua_chave_aws
AWS_SECRET_ACCESS_KEY=sua_chave_secreta_aws
AWS_REGION=us-east-1
SENDER_EMAIL=no-reply@seudominio.com
RECIPIENT_EMAIL=seu-email@example.com
ADMIN_TOKEN=token_seguro_admin
```

5. Execute o servidor:
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## 🚀 Deploy no Heroku

### 1. Preparação Inicial

Certifique-se de ter o Heroku CLI instalado:
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Baixe o instalador em https://devcenter.heroku.com/articles/heroku-cli

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

### 2. Login no Heroku

```bash
heroku login
```

### 3. Criar a Aplicação no Heroku

```bash
heroku create lucaspinheiro-portfolio
```

### 4. Adicionar PostgreSQL

```bash
heroku addons:create heroku-postgresql:mini
```

### 5. Configurar Variáveis de Ambiente

```bash
# AWS SES
heroku config:set AWS_ACCESS_KEY_ID=sua_chave_aws
heroku config:set AWS_SECRET_ACCESS_KEY=sua_chave_secreta_aws
heroku config:set AWS_REGION=us-east-1

# Emails
heroku config:set SENDER_EMAIL=no-reply@seudominio.com
heroku config:set RECIPIENT_EMAIL=seu-email@example.com

# Admin
heroku config:set ADMIN_TOKEN=token_seguro_admin

# Ambiente
heroku config:set NODE_ENV=production
```

### 6. Deploy

```bash
git add .
git commit -m "Deploy para Heroku"
git push heroku master
```

### 7. Verificar o Deploy

```bash
heroku open
```

### 8. Monitorar Logs

```bash
heroku logs --tail
```

## 📧 Configuração do AWS SES

### 1. Verificar Domínio/Email

1. Acesse o console AWS SES
2. Vá para "Verified identities"
3. Adicione e verifique seu domínio ou email
4. Siga as instruções de verificação (DNS ou confirmação por email)

### 2. Sair do Sandbox (Produção)

Por padrão, o SES está em modo sandbox. Para produção:

1. No console AWS SES, vá para "Account dashboard"
2. Clique em "Request production access"
3. Preencha o formulário explicando o uso
4. Aguarde aprovação (geralmente 24-48h)

### 3. Configurar IAM

Crie um usuário IAM com as seguintes permissões:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ses:SendEmail",
                "ses:SendRawEmail"
            ],
            "Resource": "*"
        }
    ]
}
```

## 🗄️ Estrutura do Banco de Dados

A tabela `contacts` é criada automaticamente com a seguinte estrutura:

```sql
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    ip_address VARCHAR(45),
    user_agent TEXT
);
```

## 📁 Estrutura do Projeto

```
lucaspinheiro/
├── public/
│   ├── index.html      # Página principal do portfolio
│   └── og-image.jpg    # Imagem para compartilhamento social
├── server.js           # Servidor Express principal
├── package.json        # Dependências e scripts
├── Procfile           # Configuração do Heroku
├── .env.example       # Exemplo de variáveis de ambiente
├── .gitignore         # Arquivos ignorados pelo Git
└── README.md          # Este arquivo
```

## 🔍 Endpoints da API

### POST /api/send-email
Envia email através do formulário de contato

**Body:**
```json
{
    "name": "Nome do Cliente",
    "email": "cliente@example.com",
    "company": "Empresa (opcional)",
    "message": "Mensagem do formulário"
}
```

**Resposta de Sucesso:**
```json
{
    "success": true,
    "message": "Mensagem enviada com sucesso!",
    "contactId": 123
}
```

### GET /api/contacts
Lista contatos (requer autenticação)

**Headers:**
```
Authorization: Bearer SEU_ADMIN_TOKEN
```

### GET /health
Verifica status do servidor

**Resposta:**
```json
{
    "status": "OK",
    "timestamp": "2024-12-08T18:00:00.000Z"
}
```

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento local
npm run dev

# Produção
npm start

# Verificar logs no Heroku
heroku logs --tail

# Acessar console do PostgreSQL no Heroku
heroku pg:psql

# Backup do banco de dados
heroku pg:backups:capture
heroku pg:backups:download

# Resetar banco de dados (CUIDADO!)
heroku pg:reset DATABASE_URL

# Ver configurações
heroku config

# Escalar dynos
heroku ps:scale web=1
```

## 🐛 Troubleshooting

### Erro de conexão com PostgreSQL
- Verifique se a variável `DATABASE_URL` está configurada corretamente
- No Heroku, ela é configurada automaticamente ao adicionar o addon

### Emails não são enviados
- Verifique se o domínio/email está verificado no AWS SES
- Confirme se saiu do modo sandbox do SES
- Verifique as credenciais AWS

### Erro 503 no Heroku
- Verifique os logs: `heroku logs --tail`
- Confirme se o Procfile está correto
- Verifique se todas as variáveis de ambiente estão configuradas

## 📝 Licença

MIT

## 👤 Autor

**lucaspinheiro.work**
- GitHub: [@LucasAgroTech](https://github.com/LucasAgroTech)
- LinkedIn: [lucaspinheiro.work](https://linkedin.com/in/lucaspinheiro)

## 🤝 Contribuições

Contribuições, issues e feature requests são bem-vindas!

## ⭐ Mostre seu apoio

Dê uma ⭐️ se este projeto te ajudou!
