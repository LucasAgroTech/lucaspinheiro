#!/bin/bash

echo "🔧 Testando servidor localmente..."
echo ""

# Verificar se o PostgreSQL está instalado e rodando
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL detectado"
    
    # Tentar criar o banco de dados
    echo "📊 Criando banco de dados local (se não existir)..."
    createdb portfolio 2>/dev/null || echo "ℹ️  Banco de dados 'portfolio' já existe ou PostgreSQL não está rodando"
else
    echo "⚠️  PostgreSQL não detectado. Instale para testar localmente com banco de dados."
    echo "   Você ainda pode testar sem banco, mas algumas funcionalidades não funcionarão."
fi

echo ""
echo "🔍 Verificando arquivo .env..."
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "📝 Copiando .env.example para .env..."
    cp .env.example .env
    echo "⚠️  Por favor, edite o arquivo .env com suas credenciais antes de continuar."
    exit 1
fi

echo "✅ Arquivo .env encontrado"
echo ""

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

echo ""
echo "🚀 Iniciando servidor em modo desenvolvimento..."
echo "📍 Servidor disponível em: http://localhost:3000"
echo ""
echo "Para parar o servidor, pressione Ctrl+C"
echo ""

# Iniciar servidor
npm run dev
