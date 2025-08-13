const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
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

// Configuração do PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Verificar configuração do email na inicialização
console.log('🔧 Verificando configuração do serviço de email...');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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

// Rota para enviar email
app.post('/api/send-email', async (req, res) => {
  try {
    const { name, email, company, message } = req.body;
    
    // Validação básica
    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: 'Por favor, preencha todos os campos obrigatórios.' 
      });
    }
    
    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Por favor, forneça um email válido.' 
      });
    }
    
    // Salvar no banco de dados
    const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const user_agent = req.headers['user-agent'];
    
    const insertQuery = `
      INSERT INTO contacts (name, email, company, message, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, created_at
    `;
    
    const dbResult = await pool.query(insertQuery, [name, email, company, message, ip_address, user_agent]);
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
        ipAddress: ip_address
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
        referenceId: `contact-${contactId}`
      });
      console.log('✅ Email enviado para o proprietário');
    } catch (emailError) {
      console.error('❌ Erro ao enviar email para proprietário:', emailError);
      // Continuar mesmo se falhar o envio para o proprietário
    }
    
    // Enviar email de confirmação para o cliente
    try {
      await emailService.sendEmail({
        to: email,
        subject: 'Recebi sua mensagem - Lucas Pinheiro',
        html: createClientConfirmationTemplate(emailData),
        text: createClientTextTemplate(emailData),
        referenceId: `confirmation-${contactId}`
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
