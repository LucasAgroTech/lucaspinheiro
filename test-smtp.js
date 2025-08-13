#!/usr/bin/env node

/**
 * Script de teste para verificar a configuração SMTP
 * Uso: node test-smtp.js [email-destino]
 */

require('dotenv').config();
const emailService = require('./utils/emailService');
const { validateSmtpConfig } = require('./config/smtp');

// Cores para o terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(50));
  log(title, 'bright');
  console.log('='.repeat(50));
}

async function testSmtpConfiguration() {
  logSection('🔧 TESTE DE CONFIGURAÇÃO SMTP');
  
  // 1. Verificar variáveis de ambiente
  log('\n📋 Verificando variáveis de ambiente...', 'cyan');
  
  const requiredVars = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'SENDER_EMAIL',
    'RECIPIENT_EMAIL'
  ];
  
  let allVarsPresent = true;
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      log(`  ✅ ${varName}: ${varName.includes('PASS') ? '***' : process.env[varName]}`, 'green');
    } else {
      log(`  ❌ ${varName}: NÃO CONFIGURADO`, 'red');
      allVarsPresent = false;
    }
  });
  
  if (!allVarsPresent) {
    log('\n❌ Configuração incompleta. Configure todas as variáveis necessárias no arquivo .env', 'red');
    process.exit(1);
  }
  
  // 2. Validar configuração
  log('\n🔍 Validando configuração SMTP...', 'cyan');
  const isValid = validateSmtpConfig();
  
  if (!isValid) {
    log('❌ Configuração SMTP inválida', 'red');
    process.exit(1);
  }
  
  log('✅ Configuração SMTP válida', 'green');
  
  // 3. Testar conexão
  log('\n🌐 Testando conexão com servidor SMTP...', 'cyan');
  log(`  Host: ${process.env.SMTP_HOST}`, 'blue');
  log(`  Porta: ${process.env.SMTP_PORT}`, 'blue');
  log(`  Segurança: ${process.env.SMTP_PORT === '465' ? 'SSL/TLS' : 'STARTTLS'}`, 'blue');
  
  // Aguardar inicialização do serviço
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  if (!emailService.isConfigured) {
    log('\n❌ Falha ao configurar serviço de email', 'red');
    log('Verifique as credenciais SMTP e tente novamente', 'yellow');
    process.exit(1);
  }
  
  // 4. Enviar email de teste
  const testEmail = process.argv[2] || process.env.RECIPIENT_EMAIL;
  
  log(`\n📧 Enviando email de teste para: ${testEmail}`, 'cyan');
  
  try {
    const result = await emailService.testConfiguration(testEmail);
    
    if (result.success) {
      log('\n✅ EMAIL ENVIADO COM SUCESSO!', 'green');
      log('\nDetalhes:', 'cyan');
      log(`  Message ID: ${result.details.messageId}`, 'blue');
      log(`  Aceito por: ${result.details.accepted?.join(', ') || 'N/A'}`, 'blue');
      log(`  Total de emails enviados: ${result.details.configuration?.totalEmailsSent || 1}`, 'blue');
      
      log('\n📬 Verifique sua caixa de entrada para confirmar o recebimento', 'yellow');
      
      // 5. Mostrar estatísticas
      logSection('📊 ESTATÍSTICAS DO SERVIÇO');
      const stats = emailService.getStatistics();
      log(`  Configurado: ${stats.configured ? 'Sim' : 'Não'}`, stats.configured ? 'green' : 'red');
      log(`  Emails enviados: ${stats.emailsSent}`, 'blue');
      log(`  Último envio: ${stats.lastEmailTime || 'N/A'}`, 'blue');
      log(`  Uptime: ${Math.floor(stats.uptime)} segundos`, 'blue');
      log(`  Uso de memória: ${Math.round(stats.memoryUsage.heapUsed / 1024 / 1024)} MB`, 'blue');
      
    } else {
      log('\n❌ FALHA AO ENVIAR EMAIL DE TESTE', 'red');
      log(`Erro: ${result.error}`, 'red');
      
      if (result.details) {
        log('\nDetalhes do erro:', 'yellow');
        console.log(result.details);
      }
      
      log('\n💡 Dicas de solução:', 'yellow');
      log('  1. Verifique se as credenciais SMTP estão corretas', 'yellow');
      log('  2. Confirme se o servidor SMTP está acessível', 'yellow');
      log('  3. Verifique se a porta está correta (587 para STARTTLS, 465 para SSL)', 'yellow');
      log('  4. Para AWS SES, verifique se o email está verificado', 'yellow');
      log('  5. Verifique os logs do servidor para mais detalhes', 'yellow');
    }
    
  } catch (error) {
    log('\n❌ ERRO INESPERADO', 'red');
    log(error.message, 'red');
    console.error(error);
  }
  
  logSection('🏁 TESTE CONCLUÍDO');
  process.exit(0);
}

// Executar teste
testSmtpConfiguration().catch(error => {
  log('\n❌ Erro fatal durante o teste:', 'red');
  console.error(error);
  process.exit(1);
});
