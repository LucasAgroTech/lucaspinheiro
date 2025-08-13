#!/bin/bash

echo "🔧 Corrigindo erro do Nodemailer e fazendo deploy..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na pasta raiz do projeto"
    exit 1
fi

# Fazer commit da correção
git add .
git commit -m "Fix: Corrigir método nodemailer.createTransporter -> createTransport"

# Deploy para Heroku
echo "🚀 Fazendo deploy para Heroku..."
git push heroku master

echo "✅ Deploy realizado!"
echo ""
echo "📋 Para verificar se funcionou:"
echo "1. Aguarde alguns segundos para o app reiniciar"
echo "2. Teste o formulário no site: https://www.lucaspinheiro.work"
echo "3. Monitore os logs: heroku logs --tail --app lucaspinheiro"
echo ""
echo "📧 Configurações SMTP atuais:"
heroku config:grep SMTP --app lucaspinheiro
