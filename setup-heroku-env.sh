#!/bin/bash

# Script to configure Heroku environment variables for SMTP/SES
# Run this script to set up your email configuration

echo "🔧 Configurando variáveis de ambiente do Heroku para SMTP/SES..."

# Heroku app name
APP_NAME="lucaspinheiro"

# AWS SES SMTP Configuration for us-east-2 region
# Note: You'll need to replace these with your actual credentials
echo "Setting up AWS SES SMTP configuration..."

# Set SMTP configuration for AWS SES (Ohio region)
heroku config:set SMTP_HOST="email-smtp.us-east-2.amazonaws.com" --app $APP_NAME
heroku config:set SMTP_PORT="587" --app $APP_NAME

# You need to set these with your actual AWS SES SMTP credentials
echo "⚠️  You need to set these manually with your AWS SES SMTP credentials:"
echo "heroku config:set SMTP_USER=\"your-ses-smtp-username\" --app $APP_NAME"
echo "heroku config:set SMTP_PASS=\"your-ses-smtp-password\" --app $APP_NAME"

# Email configuration
heroku config:set SENDER_EMAIL="no-reply@lucaspinheiro.work" --app $APP_NAME
heroku config:set SENDER_NAME="Lucas Pinheiro" --app $APP_NAME
heroku config:set RECIPIENT_EMAIL="lucas.negociosagro@gmail.com" --app $APP_NAME
heroku config:set REPLY_TO_EMAIL="lucas.negociosagro@gmail.com" --app $APP_NAME

# Admin token for testing (generate a secure random token)
ADMIN_TOKEN=$(openssl rand -hex 32)
heroku config:set ADMIN_TOKEN="$ADMIN_TOKEN" --app $APP_NAME

echo "✅ Configurações básicas aplicadas!"
echo ""
echo "📋 Próximos passos:"
echo "1. Atualize a política IAM do usuário SES no AWS console"
echo "2. Configure as credenciais SMTP_USER e SMTP_PASS"
echo "3. Verifique se o domínio/email está verificado no AWS SES"
echo "4. Teste a configuração com: curl -H \"Authorization: Bearer $ADMIN_TOKEN\" https://www.lucaspinheiro.work/api/test-email"
echo ""
echo "🔑 Admin Token para testes: $ADMIN_TOKEN"
echo "   (salve este token em local seguro)"


