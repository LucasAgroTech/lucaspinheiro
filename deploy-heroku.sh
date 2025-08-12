#!/bin/bash

echo "🚀 Iniciando deploy para Heroku..."
echo ""

# Verificar se o Heroku CLI está instalado
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI não está instalado."
    echo "Por favor, instale em: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

echo "✅ Heroku CLI detectado"
echo ""

# Login no Heroku
echo "📝 Fazendo login no Heroku..."
heroku login

# Nome da aplicação
read -p "Digite o nome da aplicação no Heroku (ex: lucaspinheiro-portfolio): " APP_NAME

# Criar aplicação no Heroku
echo ""
echo "🔨 Criando aplicação $APP_NAME..."
heroku create $APP_NAME

# Adicionar PostgreSQL
echo ""
echo "🗄️ Adicionando PostgreSQL..."
heroku addons:create heroku-postgresql:mini --app $APP_NAME

# Configurar variáveis de ambiente
echo ""
echo "⚙️ Configurando variáveis de ambiente..."
echo "Por favor, forneça as seguintes informações:"
echo ""

read -p "AWS Access Key ID: " AWS_KEY
read -p "AWS Secret Access Key: " AWS_SECRET
read -p "AWS Region (default: us-east-1): " AWS_REGION
AWS_REGION=${AWS_REGION:-us-east-1}
read -p "Email remetente (ex: no-reply@seudominio.com): " SENDER_EMAIL
read -p "Email destinatário (seu email): " RECIPIENT_EMAIL
read -p "Token de admin (crie um token seguro): " ADMIN_TOKEN

# Configurar variáveis no Heroku
heroku config:set AWS_ACCESS_KEY_ID=$AWS_KEY --app $APP_NAME
heroku config:set AWS_SECRET_ACCESS_KEY=$AWS_SECRET --app $APP_NAME
heroku config:set AWS_REGION=$AWS_REGION --app $APP_NAME
heroku config:set SENDER_EMAIL=$SENDER_EMAIL --app $APP_NAME
heroku config:set RECIPIENT_EMAIL=$RECIPIENT_EMAIL --app $APP_NAME
heroku config:set ADMIN_TOKEN=$ADMIN_TOKEN --app $APP_NAME
heroku config:set NODE_ENV=production --app $APP_NAME

# Adicionar remote do Heroku
echo ""
echo "🔗 Configurando remote do Git..."
heroku git:remote -a $APP_NAME

# Deploy
echo ""
echo "🚀 Fazendo deploy..."
git push heroku master

# Verificar status
echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📊 Status da aplicação:"
heroku ps --app $APP_NAME

echo ""
echo "🌐 Abrindo aplicação no navegador..."
heroku open --app $APP_NAME

echo ""
echo "📝 Para ver os logs, execute:"
echo "heroku logs --tail --app $APP_NAME"
echo ""
echo "🎉 Deploy finalizado com sucesso!"
