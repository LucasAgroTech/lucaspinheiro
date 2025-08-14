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
    name: process.env.SENDER_NAME || 'lucaspinheiro.work',
    address: process.env.SENDER_EMAIL || 'no-reply@lucaspinheiro.work'
  },
  replyTo: process.env.REPLY_TO_EMAIL || process.env.SENDER_EMAIL,
  headers: {
    'X-Priority': '3',
    'X-Mailer': 'NodeMailer v6.9.0',
    'X-Application': 'lucaspinheiro.work Portfolio',
    'X-Message-Source': 'Contact Form',
    'X-Auto-Response-Suppress': 'OOF, DR, RN, NRN',
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    'Precedence': 'bulk',
    'Return-Path': process.env.SENDER_EMAIL || 'no-reply@lucaspinheiro.work',
    // Headers para melhor deliverability
    'X-Report-Abuse': 'Please report abuse to abuse@lucaspinheiro.work',
    'X-Originating-IP': '[127.0.0.1]',
    'X-Authentication-Results': 'spf=pass smtp.mailfrom=' + (process.env.SENDER_EMAIL || 'no-reply@lucaspinheiro.work'),
    // Content-Type será definido pelo nodemailer
    'X-Content-Filtered-By': 'lucaspinheiro.work Mail System',
    'X-Spam-Status': 'No, hits=0.0 required=5.0',
    'MIME-Version': '1.0'
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
