const nodemailer = require('nodemailer');
const { smtpConfig, emailDefaults, isConfigured } = require('../config/smtp');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.emailsSent = 0;
    this.lastEmailTime = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Verificar se as configurações estão disponíveis
      if (!isConfigured) {
        console.warn('⚠️ Configurações SMTP incompletas. Verifique as variáveis de ambiente.');
        return;
      }

      // Configurar o transporter do Nodemailer com as configurações centralizadas
      this.transporter = nodemailer.createTransport(smtpConfig);

      // Verificar a conexão
      this.verifyConnection();
      this.isConfigured = true;

      // Log de configuração em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Configuração SMTP:', {
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          user: smtpConfig.auth.user ? '***' + smtpConfig.auth.user.slice(-4) : 'N/A'
        });
      }

    } catch (error) {
      console.error('❌ Erro ao configurar serviço de email:', error);
      this.isConfigured = false;
    }
  }

  async verifyConnection() {
    if (!this.transporter) {
      console.log('❌ Transporter não configurado');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ Servidor SMTP conectado e pronto para enviar emails');
      return true;
    } catch (error) {
      console.error('❌ Erro ao verificar conexão SMTP:', error.message);
      return false;
    }
  }

  async sendEmail(options) {
    if (!this.isConfigured || !this.transporter) {
      throw new Error('Serviço de email não está configurado corretamente');
    }

    try {
      // Rate limiting simples
      if (this.lastEmailTime) {
        const timeSinceLastEmail = Date.now() - this.lastEmailTime;
        if (timeSinceLastEmail < 100) { // Mínimo 100ms entre emails
          await new Promise(resolve => setTimeout(resolve, 100 - timeSinceLastEmail));
        }
      }

      // Configurar opções do email com defaults
      const mailOptions = {
        from: options.from || `"${emailDefaults.from.name}" <${emailDefaults.from.address}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo || emailDefaults.replyTo,
        headers: {
          ...emailDefaults.headers,
          'X-Entity-Ref-ID': options.referenceId || undefined,
          'X-Email-Count': String(this.emailsSent + 1)
        }
      };

      // Enviar email
      const info = await this.transporter.sendMail(mailOptions);
      
      // Atualizar contadores
      this.emailsSent++;
      this.lastEmailTime = Date.now();
      
      console.log('📧 Email enviado com sucesso:', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject,
        count: this.emailsSent
      });

      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected
      };

    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      
      // Tratamento de erros específicos
      if (error.code === 'ECONNECTION') {
        throw new Error('Não foi possível conectar ao servidor de email. Verifique as configurações.');
      }
      if (error.code === 'EAUTH') {
        throw new Error('Falha na autenticação. Verifique as credenciais SMTP.');
      }
      if (error.responseCode === 554) {
        throw new Error('Email rejeitado pelo servidor. Verifique o endereço de destino.');
      }
      
      throw error;
    }
  }

  async sendBulkEmails(emailList) {
    const results = {
      sent: [],
      failed: []
    };

    for (const emailOptions of emailList) {
      try {
        const result = await this.sendEmail(emailOptions);
        results.sent.push({
          to: emailOptions.to,
          messageId: result.messageId
        });
        
        // Delay entre emails para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        results.failed.push({
          to: emailOptions.to,
          error: error.message
        });
      }
    }

    return results;
  }

  // Método para testar a configuração
  async testConfiguration(testEmail) {
    try {
      const { createTestEmailTemplate } = require('./emailTemplates');
      
      const result = await this.sendEmail({
        to: testEmail,
        subject: '🔧 Teste de Configuração SMTP - Lucas Pinheiro',
        html: createTestEmailTemplate({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          sender: process.env.SENDER_EMAIL,
          secure: smtpConfig.secure
        }),
        text: `Teste de Configuração SMTP\n\nEste é um email de teste.\n\nConfiguração:\n- Host: ${process.env.SMTP_HOST}\n- Porta: ${process.env.SMTP_PORT}\n- Remetente: ${process.env.SENDER_EMAIL}\n- Segurança: ${smtpConfig.secure ? 'SSL/TLS' : 'STARTTLS'}`,
        referenceId: `test-${Date.now()}`
      });

      return {
        success: true,
        message: 'Email de teste enviado com sucesso',
        details: {
          ...result,
          configuration: {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            sender: process.env.SENDER_EMAIL,
            totalEmailsSent: this.emailsSent
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Falha ao enviar email de teste',
        error: error.message,
        details: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          configured: this.isConfigured
        }
      };
    }
  }

  // Método para obter estatísticas
  getStatistics() {
    return {
      configured: this.isConfigured,
      emailsSent: this.emailsSent,
      lastEmailTime: this.lastEmailTime ? new Date(this.lastEmailTime).toISOString() : null,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };
  }

  // Método para recarregar configurações
  async reloadConfiguration() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
    return await this.verifyConnection();
  }
}

// Exportar uma instância única (Singleton)
module.exports = new EmailService();
