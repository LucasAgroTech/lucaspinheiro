# 📚 INSTRUÇÕES DE DEPLOY NO HEROKU

## ✅ Status do Projeto

O projeto foi completamente reestruturado e está pronto para deploy no Heroku com:
- ✅ Servidor Express configurado
- ✅ PostgreSQL para armazenamento de dados
- ✅ AWS SES para envio de emails
- ✅ Frontend otimizado
- ✅ Scripts de deploy automatizados

## 🚀 Deploy Rápido (Método Automatizado)

Execute o script de deploy que criamos:

```bash
./deploy-heroku.sh
```

Este script irá:
1. Fazer login no Heroku
2. Criar a aplicação
3. Configurar PostgreSQL
4. Configurar todas as variáveis de ambiente
5. Fazer o deploy automaticamente

## 📝 Deploy Manual (Passo a Passo)

### 1. Instalar Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows - baixe em:
# https://devcenter.heroku.com/articles/heroku-cli
```

### 2. Login no Heroku

```bash
heroku login
```

### 3. Criar Aplicação

```bash
heroku create seu-nome-app
```

### 4. Adicionar PostgreSQL

```bash
heroku addons:create heroku-postgresql:mini
```

### 5. Configurar AWS SES

Antes de configurar as variáveis, você precisa:

1. **Acessar o Console AWS**: https://console.aws.amazon.com/ses/
2. **Verificar seu email/domínio**:
   - Vá em "Verified identities"
   - Clique em "Create identity"
   - Escolha "Email address" ou "Domain"
   - Siga as instruções de verificação

3. **Criar credenciais IAM**:
   - Vá para IAM Console
   - Crie um novo usuário
   - Anexe a política "AmazonSESFullAccess"
   - Salve as credenciais (Access Key ID e Secret)

### 6. Configurar Variáveis de Ambiente

```bash
# AWS SES
heroku config:set AWS_ACCESS_KEY_ID=sua_access_key
heroku config:set AWS_SECRET_ACCESS_KEY=sua_secret_key
heroku config:set AWS_REGION=us-east-1

# Emails
heroku config:set SENDER_EMAIL=no-reply@seudominio.com
heroku config:set RECIPIENT_EMAIL=seu-email@gmail.com

# Admin
heroku config:set ADMIN_TOKEN=crie_um_token_seguro_aqui

# Ambiente
heroku config:set NODE_ENV=production
```

### 7. Deploy

```bash
git push heroku master
```

### 8. Verificar

```bash
# Ver logs
heroku logs --tail

# Abrir aplicação
heroku open

# Ver status
heroku ps
```

## 🔧 Teste Local

Para testar localmente antes do deploy:

```bash
# Método 1: Script automatizado
./test-local.sh

# Método 2: Manual
npm run dev
```

Acesse: http://localhost:3000

## ⚠️ IMPORTANTE - Configurações AWS SES

### Modo Sandbox vs Produção

Por padrão, o AWS SES está em **modo sandbox**, o que significa:
- ✅ Pode enviar emails apenas para endereços verificados
- ❌ Limite de 200 emails por dia
- ❌ Taxa máxima de 1 email por segundo

### Para sair do Sandbox:

1. No console AWS SES, vá para "Account dashboard"
2. Clique em "Request production access"
3. Preencha o formulário explicando:
   - Tipo de emails que enviará (transacionais)
   - Como gerencia bounces e complaints
   - Volume esperado de emails
4. Aguarde aprovação (24-48 horas)

## 🔍 Verificação de Funcionamento

### 1. Teste de Health Check
```bash
curl https://seu-app.herokuapp.com/health
```

### 2. Teste de Formulário
1. Acesse sua aplicação
2. Vá até o formulário de contato
3. Preencha e envie
4. Verifique se recebeu os emails

### 3. Verificar Banco de Dados
```bash
# Conectar ao banco
heroku pg:psql

# Ver contatos salvos
SELECT * FROM contacts;

# Sair
\q
```

## 🐛 Troubleshooting

### Erro: "Application error"
```bash
heroku logs --tail
```

### Erro: "Email not sending"
- Verifique se o email está verificado no SES
- Confirme as credenciais AWS
- Verifique a região do SES

### Erro: "Database connection failed"
- O DATABASE_URL é configurado automaticamente pelo Heroku
- Verifique com: `heroku config`

### Erro: "Port binding"
- Certifique-se de usar `process.env.PORT`
- Não hardcode a porta

## 📊 Monitoramento

### Comandos Úteis
```bash
# Ver logs em tempo real
heroku logs --tail

# Ver configurações
heroku config

# Reiniciar aplicação
heroku restart

# Ver informações do banco
heroku pg:info

# Fazer backup do banco
heroku pg:backups:capture
heroku pg:backups:download
```

## 🎯 Próximos Passos

1. **Configure o domínio personalizado**:
```bash
heroku domains:add www.seudominio.com
```

2. **Configure SSL**:
```bash
heroku certs:auto:enable
```

3. **Configure monitoramento**:
- New Relic
- Papertrail para logs
- Sentry para erros

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs: `heroku logs --tail`
2. Consulte a documentação do Heroku
3. Verifique o status do AWS SES
4. Revise as variáveis de ambiente

## ✨ Funcionalidades Implementadas

- ✅ Formulário de contato funcional
- ✅ Envio de email via AWS SES
- ✅ Email de confirmação para o cliente
- ✅ Armazenamento em PostgreSQL
- ✅ Registro de IP e User Agent
- ✅ API REST para consulta de contatos
- ✅ Proteção com token de admin
- ✅ Health check endpoint
- ✅ CORS configurado
- ✅ Templates de email responsivos

---

**Projeto pronto para deploy!** 🚀

Siga as instruções acima e sua aplicação estará online em minutos.
