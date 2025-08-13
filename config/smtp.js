require('dotenv').config();

// Configuração SMTP
const smtpConfig = {
  // Configurações do servidor SMTP
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === '465', // true para porta 465, false para outras
  
  // Credenciais de autenticação
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  
  // Configurações de segurança
  tls: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2',
    ciphers: 'HIGH:MEDIUM:!aNULL:!eNULL:!EXPORT:!DES:!MD5:!PSK:!RC4'
  },
  
  // Timeouts
  connectionTimeout: 10000, // 10 segundos
  greetingTimeout: 10000,   // 10 segundos
  socketTimeout: 10000,      // 10 segundos
  
  // Configurações de pool (para múltiplos envios)
  pool: false, // Definir como true se precisar enviar muitos emails
  maxConnections: 5,
  maxMessages: 100,
  
  // Rate limiting
  rateDelta: 1000, // Tempo em ms entre emails
  rateLimit: 5,    // Número máximo de emails por rateDelta
  
  // Debug (apenas em desenvolvimento)
  debug: process.env.NODE_ENV === 'development',
  logger: process.env.NODE_ENV === 'development'
};

// Configurações de email padrão
const emailDefaults = {
  from: {
    name: process.env.SENDER_NAME || 'Lucas Pinheiro',
    address: process.env.SENDER_EMAIL || 'no-reply@lucaspinheiro.work'
  },
  replyTo: process.env.REPLY_TO_EMAIL || process.env.SENDER_EMAIL,
  headers: {
    'X-Priority': '3',
    'X-Mailer': 'NodeMailer',
    'X-Application': 'Lucas Pinheiro Portfolio'
  }
};

// Configurações específicas para AWS SES
const awsSesConfig = {
  // Limites do AWS SES
  maxSendRate: 14, // emails por segundo (ajustar conforme seu limite)
  dailyQuota: 50000, // quota diária (ajustar conforme seu limite)
  
  // Configurações de bounce e complaint
  handleBounces: true,
  handleComplaints: true,
  
  // Tags para rastreamento no AWS SES
  tags: [
    { Name: 'Environment', Value: process.env.NODE_ENV || 'development' },
    { Name: 'Application', Value: 'portfolio-contact-form' }
  ]
};

// Validar configuração
function validateSmtpConfig() {
  const errors = [];
  
  if (!process.env.SMTP_HOST) {
    errors.push('SMTP_HOST não configurado');
  }
  
  if (!process.env.SMTP_USER) {
    errors.push('SMTP_USER não configurado');
  }
  
  if (!process.env.SMTP_PASS) {
    errors.push('SMTP_PASS não configurado');
  }
  
  if (!process.env.SENDER_EMAIL) {
    errors.push('SENDER_EMAIL não configurado');
  }
  
  if (!process.env.RECIPIENT_EMAIL) {
    errors.push('RECIPIENT_EMAIL não configurado');
  }
  
  if (errors.length > 0) {
    console.warn('⚠️ Configuração SMTP incompleta:');
    errors.forEach(error => console.warn(`  - ${error}`));
    return false;
  }
  
  return true;
}

// Função para obter configuração baseada no ambiente
function getEnvironmentConfig() {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return {
        ...smtpConfig,
        debug: false,
        logger: false,
        pool: true // Usar pool em produção para melhor performance
      };
      
    case 'development':
      return {
        ...smtpConfig,
        debug: true,
        logger: true,
        pool: false
      };
      
    case 'test':
      return {
        ...smtpConfig,
        debug: false,
        logger: false,
        pool: false,
        // Usar configuração de teste se disponível
        host: process.env.TEST_SMTP_HOST || smtpConfig.host,
        port: process.env.TEST_SMTP_PORT || smtpConfig.port
      };
      
    default:
      return smtpConfig;
  }
}

module.exports = {
  smtpConfig: getEnvironmentConfig(),
  emailDefaults,
  awsSesConfig,
  validateSmtpConfig,
  isConfigured: validateSmtpConfig()
};
