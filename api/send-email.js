import AWS from 'aws-sdk';

// Configuração do AWS SES
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

// Template de email HTML
const createEmailTemplate = (data) => {
  const { name, email, company, message } = data;
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #334155;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
          color: #ffffff;
          padding: 32px 24px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }
        .content {
          padding: 32px 24px;
        }
        .info-block {
          background-color: #f1f5f9;
          border-left: 4px solid #4f46e5;
          padding: 16px;
          margin: 16px 0;
          border-radius: 4px;
        }
        .info-block h3 {
          margin: 0 0 8px 0;
          color: #0a0e27;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .info-block p {
          margin: 0;
          color: #334155;
          font-size: 16px;
        }
        .message-block {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 20px;
          margin: 24px 0;
          border-radius: 6px;
        }
        .message-block h3 {
          margin: 0 0 12px 0;
          color: #0a0e27;
          font-size: 16px;
          font-weight: 600;
        }
        .message-block p {
          margin: 0;
          color: #475569;
          font-size: 15px;
          line-height: 1.7;
          white-space: pre-wrap;
        }
        .footer {
          background-color: #f8fafc;
          padding: 24px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        .footer p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }
        .badge {
          display: inline-block;
          background-color: #10b981;
          color: #ffffff;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .cta-button {
          display: inline-block;
          background-color: #4f46e5;
          color: #ffffff;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 Nova Mensagem Recebida</h1>
        </div>
        
        <div class="content">
          <span class="badge">✓ Formulário de Contato</span>
          
          <h2 style="color: #0a0e27; margin: 0 0 24px 0;">Você recebeu uma nova mensagem através do seu site</h2>
          
          <div class="info-block">
            <h3>Nome do Contato</h3>
            <p>${name}</p>
          </div>
          
          <div class="info-block">
            <h3>Email</h3>
            <p>${email}</p>
          </div>
          
          ${company ? `
          <div class="info-block">
            <h3>Empresa</h3>
            <p>${company}</p>
          </div>
          ` : ''}
          
          <div class="message-block">
            <h3>Mensagem</h3>
            <p>${message}</p>
          </div>
          
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px;">
              <strong>Próximos passos:</strong><br>
              • Responda este contato em até 24 horas<br>
              • Agende uma reunião se necessário<br>
              • Adicione o contato ao seu CRM
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p>Este email foi enviado automaticamente pelo sistema de contato do site</p>
          <p style="margin-top: 8px;">© ${new Date().getFullYear()} Lucas Pinheiro - Todos os direitos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template de email de confirmação para o cliente
const createConfirmationTemplate = (data) => {
  const { name } = data;
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #334155;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
          color: #ffffff;
          padding: 48px 24px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .content {
          padding: 40px 24px;
        }
        .success-icon {
          width: 64px;
          height: 64px;
          background-color: #10b981;
          border-radius: 50%;
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
        }
        .footer {
          background-color: #f8fafc;
          padding: 32px 24px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        .social-links {
          margin-top: 20px;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          color: #4f46e5;
          text-decoration: none;
          font-weight: 500;
        }
        .cta-button {
          display: inline-block;
          background-color: #4f46e5;
          color: #ffffff;
          padding: 14px 32px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          margin: 24px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Mensagem Recebida com Sucesso!</h1>
        </div>
        
        <div class="content">
          <div class="success-icon">✓</div>
          
          <h2 style="color: #0a0e27; text-align: center; margin: 0 0 16px 0;">Olá ${name}!</h2>
          
          <p style="text-align: center; font-size: 18px; color: #334155; margin-bottom: 32px;">
            Recebi sua mensagem e agradeço pelo seu interesse.
          </p>
          
          <div style="background-color: #f8fafc; padding: 24px; border-radius: 8px; margin: 32px 0;">
            <h3 style="color: #0a0e27; margin: 0 0 16px 0;">O que acontece agora?</h3>
            <ul style="color: #475569; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 12px;">Analisarei sua mensagem cuidadosamente</li>
              <li style="margin-bottom: 12px;">Responderei em até <strong>24 horas úteis</strong></li>
              <li style="margin-bottom: 12px;">Se necessário, agendaremos uma reunião para discutir detalhes</li>
              <li>Você receberá uma proposta personalizada para seu projeto</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <p style="color: #64748b; margin-bottom: 16px;">Enquanto isso, conheça mais sobre meu trabalho:</p>
            <a href="https://lucaspinheiro.work" class="cta-button">Visitar Portfolio</a>
          </div>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; border-left: 4px solid #4f46e5;">
            <p style="margin: 0; color: #334155;">
              <strong>Dica:</strong> Para projetos urgentes, você pode me contatar diretamente via WhatsApp para uma resposta mais rápida.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p style="color: #64748b; margin-bottom: 20px;">
            Siga-me nas redes sociais para acompanhar novidades e conteúdos exclusivos:
          </p>
          <div class="social-links">
            <a href="https://linkedin.com/in/lucaspinheiro">LinkedIn</a>
            <a href="https://github.com/lucaspinheiro">GitHub</a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
            © ${new Date().getFullYear()} Lucas Pinheiro - Especialista em Soluções Digitais
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    // Preparar dados do email para o proprietário
    const ownerEmailParams = {
      Source: process.env.SENDER_EMAIL || 'no-reply@lucaspinheiro.work',
      Destination: {
        ToAddresses: [process.env.RECIPIENT_EMAIL || 'lucas.negociosagro@gmail.com']
      },
      Message: {
        Subject: {
          Data: `[Site] Nova mensagem de ${name}`,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: createEmailTemplate({ name, email, company, message }),
            Charset: 'UTF-8'
          },
          Text: {
            Data: `
Nova mensagem recebida do site:

Nome: ${name}
Email: ${email}
${company ? `Empresa: ${company}` : ''}

Mensagem:
${message}

---
Este email foi enviado automaticamente pelo formulário de contato do site.
            `,
            Charset: 'UTF-8'
          }
        }
      },
      ReplyToAddresses: [email]
    };

    // Preparar email de confirmação para o cliente
    const clientEmailParams = {
      Source: process.env.SENDER_EMAIL || 'no-reply@lucaspinheiro.work',
      Destination: {
        ToAddresses: [email]
      },
      Message: {
        Subject: {
          Data: 'Recebi sua mensagem - Lucas Pinheiro',
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: createConfirmationTemplate({ name, email, company, message }),
            Charset: 'UTF-8'
          },
          Text: {
            Data: `
Olá ${name}!

Recebi sua mensagem e agradeço pelo seu interesse.

O que acontece agora?
• Analisarei sua mensagem cuidadosamente
• Responderei em até 24 horas úteis
• Se necessário, agendaremos uma reunião para discutir detalhes
• Você receberá uma proposta personalizada para seu projeto

Para projetos urgentes, você pode me contatar diretamente via WhatsApp para uma resposta mais rápida.

Atenciosamente,
Lucas Pinheiro
Especialista em Soluções Digitais

---
Este é um email automático de confirmação.
            `,
            Charset: 'UTF-8'
          }
        }
      }
    };

    // Enviar email para o proprietário
    await ses.sendEmail(ownerEmailParams).promise();
    
    // Enviar email de confirmação para o cliente
    await ses.sendEmail(clientEmailParams).promise();

    // Resposta de sucesso
    res.status(200).json({ 
      success: true,
      message: 'Mensagem enviada com sucesso! Você receberá um email de confirmação.' 
    });

  } catch (error) {
    console.error('Erro ao enviar email:', error);
    
    // Tratamento de erros específicos do SES
    if (error.code === 'MessageRejected') {
      return res.status(400).json({ 
        error: 'Email rejeitado. Por favor, verifique o endereço de email.' 
      });
    }
    
    if (error.code === 'ConfigurationSetDoesNotExist') {
      return res.status(500).json({ 
        error: 'Erro de configuração do servidor. Por favor, tente novamente mais tarde.' 
      });
    }

    res.status(500).json({ 
      error: 'Erro ao enviar mensagem. Por favor, tente novamente.' 
    });
  }
}
