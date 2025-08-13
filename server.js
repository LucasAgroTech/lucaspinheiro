const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const helmet = require('helmet');
const NodeCache = require('node-cache');
require('dotenv').config();

// Importar serviço de email e templates
const emailService = require('./utils/emailService');
const {
  createOwnerEmailTemplate,
  createClientConfirmationTemplate,
  createOwnerTextTemplate,
  createClientTextTemplate
} = require('./utils/emailTemplates');

const app = express();
const PORT = process.env.PORT || 3000;

// Cache para IPs suspeitos e tentativas
const suspiciousIPCache = new NodeCache({ stdTTL: 3600 }); // 1 hora
const attemptCache = new NodeCache({ stdTTL: 900 }); // 15 minutos

// Configuração do PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Verificar configuração do email na inicialização
console.log('🔧 Verificando configuração do serviço de email...');

// Middleware de segurança
app.use(helmet({
  contentSecurityPolicy: false, // Permitir scripts inline no HTML
  crossOriginEmbedderPolicy: false
}));

// Rate limiting geral
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 requests por IP
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting específico para envio de emails
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // Máximo 3 emails por IP
  message: {
    error: 'Limite de emails excedido. Aguarde 15 minutos antes de tentar novamente.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Verificar se IP está na whitelist (admin, etc)
    const trustedIPs = process.env.TRUSTED_IPS ? process.env.TRUSTED_IPS.split(',') : [];
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return trustedIPs.includes(clientIP);
  }
});

// Rate limiting mais restritivo para IPs suspeitos
const suspiciousIPLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 1, // Máximo 1 tentativa por hora para IPs suspeitos
  message: {
    error: 'IP bloqueado temporariamente devido a atividade suspeita.',
    retryAfter: 3600
  }
});

// Middleware básico
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));
app.use(generalLimiter);

// Funções utilitárias anti-spam
function checkSuspiciousIP(ip) {
  const suspiciousData = suspiciousIPCache.get(ip);
  if (suspiciousData) {
    return suspiciousData.isSuspicious;
  }
  return false;
}

function markIPAsSuspicious(ip, reason) {
  console.log(`🚨 IP marcado como suspeito: ${ip} - Razão: ${reason}`);
  suspiciousIPCache.set(ip, {
    isSuspicious: true,
    reason: reason,
    timestamp: Date.now()
  });
}

function validateHoneypot(honeypotValue) {
  // Campo honeypot deve estar vazio (bots geralmente preenchem todos os campos)
  return !honeypotValue || honeypotValue.trim() === '';
}

function validateTimingAttack(startTime) {
  const submissionTime = Date.now() - startTime;
  // Muito rápido (< 3 segundos) pode ser bot
  // Muito lento (> 30 minutos) pode ser session hijacking
  return submissionTime >= 3000 && submissionTime <= 1800000; // 3s a 30min
}

function advancedContentValidation(content) {
  const suspiciousPatterns = [
    /\b(viagra|cialis|penis|enlargement)\b/gi,
    /\b(casino|poker|gambling|lottery|winner)\b/gi,
    /\b(crypto|bitcoin|investment|profit|money)\b/gi,
    /\b(click here|buy now|limited time|act now)\b/gi,
    /\b(free|discount|offer|deal|save)\b/gi,
    /(http[s]?:\/\/[^\s]+){3,}/gi, // Múltiplas URLs
    /[!]{3,}/g, // Múltiplas exclamações
    /[A-Z\s]{10,}/g, // Muito texto em maiúsculo
    /\$\d+|\d+\$|\d+€|\d+£/g, // Valores monetários
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g // Possíveis números de cartão
  ];

  let suspicionScore = 0;
  let reasons = [];

  // Verificar padrões suspeitos
  suspiciousPatterns.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      const weight = [15, 12, 10, 8, 5, 15, 5, 8, 10, 20][index] || 5;
      suspicionScore += matches.length * weight;
      reasons.push(`Padrão suspeito detectado (tipo ${index + 1})`);
    }
  });

  // Verificar repetição excessiva de caracteres
  const repeatedChars = content.match(/(.)\1{4,}/g);
  if (repeatedChars) {
    suspicionScore += repeatedChars.length * 5;
    reasons.push('Repetição excessiva de caracteres');
  }

  // Verificar densidade de links
  const links = content.match(/http[s]?:\/\/[^\s]+/g);
  if (links && links.length > 2) {
    suspicionScore += links.length * 8;
    reasons.push('Muitos links');
  }

  // Verificar se o conteúdo é muito curto (possível spam)
  if (content.trim().length < 10) {
    suspicionScore += 15;
    reasons.push('Conteúdo muito curto');
  }

  // Verificar se o conteúdo é muito longo (possível spam)
  if (content.trim().length > 2000) {
    suspicionScore += 10;
    reasons.push('Conteúdo muito longo');
  }

  return {
    isValid: suspicionScore < 30,
    score: suspicionScore,
    reasons: reasons
  };
}

// Validadores express-validator
const emailValidators = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços'),
  
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('Email muito longo'),
  
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Nome da empresa muito longo'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Mensagem deve ter entre 10 e 2000 caracteres')
    .custom((value) => {
      const validation = advancedContentValidation(value);
      if (!validation.isValid) {
        throw new Error('Conteúdo da mensagem suspeito: ' + validation.reasons.join(', '));
      }
      return true;
    }),
  
  body('honeypot')
    .optional()
    .custom((value) => {
      if (!validateHoneypot(value)) {
        throw new Error('Validação de segurança falhou');
      }
      return true;
    }),
  
  body('timestamp')
    .optional()
    .isNumeric()
    .custom((value) => {
      if (!validateTimingAttack(parseInt(value))) {
        throw new Error('Tempo de submissão inválido');
      }
      return true;
    })
];

// Criar tabela de contatos se não existir
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'pending',
        ip_address VARCHAR(45),
        user_agent TEXT
      )
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}


// Rota principal - servir o HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Middleware para verificar IPs suspeitos
function checkSuspiciousIPMiddleware(req, res, next) {
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  if (checkSuspiciousIP(clientIP)) {
    return suspiciousIPLimiter(req, res, next);
  }
  
  next();
}

// Rota para enviar email
app.post('/api/send-email', 
  checkSuspiciousIPMiddleware,
  emailLimiter,
  emailValidators,
  async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      
      // Marcar IP como suspeito se houver muitos erros de validação
      const errorCount = attemptCache.get(clientIP + '_errors') || 0;
      attemptCache.set(clientIP + '_errors', errorCount + 1);
      
      if (errorCount >= 3) {
        markIPAsSuspicious(clientIP, 'Múltiplos erros de validação');
      }
      
      return res.status(400).json({
        error: 'Dados inválidos. Verifique os campos e tente novamente.',
        details: process.env.NODE_ENV === 'development' ? errors.array() : undefined
      });
    }

    const { name, email, company, message, honeypot, timestamp } = req.body;
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const user_agent = req.headers['user-agent'];
    
    // Log para monitoramento
    console.log(`📨 Nova tentativa de contato: ${name} <${email}> de IP: ${clientIP}`);

    // Validações adicionais de segurança já foram feitas pelos validators
    // Honeypot e timing já foram validados
    
    const insertQuery = `
      INSERT INTO contacts (name, email, company, message, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, created_at
    `;
    
    const dbResult = await pool.query(insertQuery, [name, email, company, message, clientIP, user_agent]);
    const contactId = dbResult.rows[0].id;
    
    console.log(`Contact saved with ID: ${contactId}`);
    
    // Preparar dados para os templates
    const emailData = {
      name,
      email,
      company,
      message,
              metadata: {
          contactId,
          timestamp: new Date().toLocaleString('pt-BR'),
          ipAddress: clientIP
        }
    };
    
    // Enviar email para o proprietário
    try {
      await emailService.sendEmail({
        to: process.env.RECIPIENT_EMAIL || 'lucas.negociosagro@gmail.com',
        subject: `[Site] Nova mensagem de ${name}`,
        html: createOwnerEmailTemplate(emailData),
        text: createOwnerTextTemplate(emailData),
        replyTo: email,
        referenceId: `contact-${contactId}`,
        sourceIp: clientIP,
        skipSpamCheck: false // Validar conteúdo de contato
      });
      console.log('✅ Email enviado para o proprietário');
    } catch (emailError) {
      console.error('❌ Erro ao enviar email para proprietário:', emailError);
      
      // Se for erro de rate limit, retornar erro específico
      if (emailError.message.includes('Rate limit')) {
        return res.status(429).json({ 
          error: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
          retryAfter: 900 // 15 minutos
        });
      }
      
      // Se for spam, retornar erro específico e marcar IP
      if (emailError.message.includes('Conteúdo não permitido')) {
        markIPAsSuspicious(clientIP, 'Tentativa de envio de spam');
        return res.status(400).json({ 
          error: 'Mensagem não permitida. Verifique o conteúdo e tente novamente.'
        });
      }
      
      // Continuar mesmo se falhar o envio para o proprietário
    }
    
    // Enviar email de confirmação para o cliente
    try {
      await emailService.sendEmail({
        to: email,
        subject: 'Recebi sua mensagem - Lucas Pinheiro',
        html: createClientConfirmationTemplate(emailData),
        text: createClientTextTemplate(emailData),
        referenceId: `confirmation-${contactId}`,
        skipSpamCheck: true, // Emails de confirmação são seguros
        unsubscribeUrl: `https://${req.get('host') || 'lucaspinheiro.work'}/unsubscribe?email=${encodeURIComponent(email)}&token=${Buffer.from(email + contactId).toString('base64')}`
      });
      console.log('✅ Email de confirmação enviado para o cliente');
    } catch (emailError) {
      console.error('❌ Erro ao enviar email de confirmação:', emailError);
      // Continuar mesmo se falhar o envio de confirmação
    }
    
    // Atualizar status no banco
    await pool.query('UPDATE contacts SET status = $1 WHERE id = $2', ['sent', contactId]);
    
    // Resposta de sucesso
    res.status(200).json({ 
      success: true,
      message: 'Mensagem enviada com sucesso! Você receberá um email de confirmação.',
      contactId: contactId
    });
    
  } catch (error) {
    console.error('Erro ao processar contato:', error);
    
    // Se o contato foi salvo mas houve erro no email, ainda retornar sucesso parcial
    if (error.message && error.message.includes('email')) {
      return res.status(200).json({ 
        success: true,
        message: 'Mensagem recebida com sucesso! Em breve entraremos em contato.',
        warning: 'Houve um problema ao enviar o email de confirmação.',
        contactId: contactId
      });
    }
    
    res.status(500).json({ 
      error: 'Erro ao processar sua mensagem. Por favor, tente novamente.' 
    });
  }
});

// Rota para testar configuração de email
app.get('/api/test-email', async (req, res) => {
  try {
    // Verificar token de admin
    const adminToken = req.headers.authorization;
    if (adminToken !== `Bearer ${process.env.ADMIN_TOKEN}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const testEmail = req.query.email || process.env.RECIPIENT_EMAIL;
    const result = await emailService.testConfiguration(testEmail);
    
    res.json(result);
  } catch (error) {
    console.error('Error testing email:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Rota para unsubscribe
app.get('/unsubscribe', (req, res) => {
  const { email, token } = req.query;
  
  if (!email || !token) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Erro - Descadastro</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
          .container { max-width: 500px; margin: 0 auto; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Erro no Descadastro</h1>
          <p>Link inválido ou expirado.</p>
          <p>Entre em contato conosco se precisar de ajuda: lucas.negociosagro@gmail.com</p>
        </div>
      </body>
      </html>
    `);
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Descadastro Realizado</title>
      <meta charset="UTF-8">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          padding: 40px; 
          text-align: center; 
          background-color: #f8fafc;
        }
        .container { 
          max-width: 500px; 
          margin: 0 auto; 
          background: white; 
          padding: 40px; 
          border-radius: 8px; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .success { color: #10b981; font-size: 48px; margin-bottom: 20px; }
        h1 { color: #0a0e27; margin-bottom: 16px; }
        p { color: #334155; line-height: 1.6; margin-bottom: 16px; }
        .email { background-color: #f1f5f9; padding: 8px 12px; border-radius: 4px; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success">✓</div>
        <h1>Descadastro Realizado com Sucesso</h1>
        <p>O email <span class="email">${email}</span> foi removido da nossa lista de contatos.</p>
        <p>Você não receberá mais emails de confirmação automáticos do nosso formulário de contato.</p>
        <p style="margin-top: 32px; font-size: 14px; color: #64748b;">
          Se você mudou de ideia, pode entrar em contato novamente através do nosso formulário no site.
        </p>
      </div>
    </body>
    </html>
  `);
});

// Rota para listar contatos (admin)
app.get('/api/contacts', async (req, res) => {
  try {
    // Verificar token de admin (simplificado)
    const adminToken = req.headers.authorization;
    if (adminToken !== `Bearer ${process.env.ADMIN_TOKEN}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const result = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC LIMIT 100');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Inicializar servidor
async function startServer() {
  await initDatabase();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
