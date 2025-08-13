// Template de email HTML para o proprietário
const createOwnerEmailTemplate = (data) => {
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
        .metadata {
          background-color: #fef3c7;
          border: 1px solid #fcd34d;
          padding: 12px;
          margin: 20px 0;
          border-radius: 6px;
          font-size: 13px;
        }
        .metadata strong {
          color: #92400e;
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
          
          ${data.metadata ? `
          <div class="metadata">
            <strong>Informações Adicionais:</strong><br>
            ${data.metadata.contactId ? `ID do Contato: #${data.metadata.contactId}<br>` : ''}
            ${data.metadata.timestamp ? `Data/Hora: ${data.metadata.timestamp}<br>` : ''}
            ${data.metadata.ipAddress ? `IP: ${data.metadata.ipAddress}<br>` : ''}
          </div>
          ` : ''}
          
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
const createClientConfirmationTemplate = (data) => {
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
            <a href="https://lucaspinheiro.work" class="cta-button">Visitar Portfólio</a>
          </div>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; border-left: 4px solid #4f46e5;">
            <h4 style="margin: 0 0 12px 0; color: #0a0e27;">Informações de Contato</h4>
            <p style="margin: 0 0 8px 0; color: #334155;">
              <strong>Email:</strong> lucas.negociosagro@gmail.com
            </p>
            <p style="margin: 0 0 8px 0; color: #334155;">
              <strong>Telefone:</strong> Disponível mediante agendamento
            </p>
            <p style="margin: 0; color: #334155;">
              <strong>Dica:</strong> Para projetos urgentes, você pode me contatar diretamente via WhatsApp para uma resposta mais rápida.
            </p>
          </div>
          
          <div style="background-color: #e0f2fe; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <h4 style="margin: 0 0 12px 0; color: #0277bd;">Meus Serviços</h4>
            <ul style="margin: 0; padding-left: 20px; color: #334155;">
              <li style="margin-bottom: 8px;">Desenvolvimento de Aplicações Web</li>
              <li style="margin-bottom: 8px;">Sistemas de Gestão Empresarial</li>
              <li style="margin-bottom: 8px;">Automação de Processos</li>
              <li style="margin-bottom: 8px;">Consultoria em Tecnologia</li>
              <li>Soluções para Agronegócio</li>
            </ul>
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
          
          <div style="margin: 24px 0; padding: 16px; background-color: #f1f5f9; border-radius: 6px;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0; text-align: center;">
              Este email foi enviado porque você entrou em contato através do meu site.
            </p>
            <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">
              Caso não deseje receber mais emails, <a href="mailto:unsubscribe@lucaspinheiro.work?subject=Unsubscribe" style="color: #4f46e5;">clique aqui para se descadastrar</a>
            </p>
          </div>
          
          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
            © ${new Date().getFullYear()} Lucas Pinheiro - Especialista em Soluções Digitais<br>
            CNPJ: Não informado | Endereço: São Paulo, SP
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template de texto simples para o proprietário
const createOwnerTextTemplate = (data) => {
  const { name, email, company, message } = data;
  
  let text = `Nova mensagem recebida do site:\n\n`;
  text += `Nome: ${name}\n`;
  text += `Email: ${email}\n`;
  if (company) text += `Empresa: ${company}\n`;
  text += `\nMensagem:\n${message}\n\n`;
  
  if (data.metadata) {
    text += `---\n`;
    if (data.metadata.contactId) text += `ID do contato: ${data.metadata.contactId}\n`;
    if (data.metadata.timestamp) text += `Data: ${data.metadata.timestamp}\n`;
    if (data.metadata.ipAddress) text += `IP: ${data.metadata.ipAddress}\n`;
  }
  
  text += `\n---\nEste email foi enviado automaticamente pelo formulário de contato do site.`;
  
  return text;
};

// Template de texto simples para confirmação do cliente
const createClientTextTemplate = (data) => {
  const { name } = data;
  
  return `
Olá ${name}!

Recebi sua mensagem e agradeço pelo seu interesse.

O que acontece agora?
• Analisarei sua mensagem cuidadosamente
• Responderei em até 24 horas úteis
• Se necessário, agendaremos uma reunião para discutir detalhes
• Você receberá uma proposta personalizada para seu projeto

MEUS SERVIÇOS:
• Desenvolvimento de Aplicações Web
• Sistemas de Gestão Empresarial
• Automação de Processos
• Consultoria em Tecnologia
• Soluções para Agronegócio

CONTATO:
• Email: lucas.negociosagro@gmail.com
• Telefone: Disponível mediante agendamento
• Website: https://lucaspinheiro.work

Para projetos urgentes, você pode me contatar diretamente via WhatsApp para uma resposta mais rápida.

Atenciosamente,
Lucas Pinheiro
Especialista em Soluções Digitais

---
Este email foi enviado porque você entrou em contato através do meu site.
Para não receber mais emails, responda com "UNSUBSCRIBE" no assunto.

© ${new Date().getFullYear()} Lucas Pinheiro - Todos os direitos reservados
  `.trim();
};

// Template para email de teste
const createTestEmailTemplate = (config) => {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Courier New', monospace;
          background-color: #1a1a1a;
          color: #00ff00;
          padding: 20px;
        }
        .terminal {
          background-color: #000;
          border: 2px solid #00ff00;
          border-radius: 8px;
          padding: 20px;
          max-width: 600px;
          margin: 0 auto;
        }
        .header {
          border-bottom: 1px solid #00ff00;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .success {
          color: #00ff00;
          font-weight: bold;
        }
        .info {
          color: #ffff00;
        }
        .config-item {
          margin: 10px 0;
          padding: 5px;
          background-color: #0a0a0a;
        }
        pre {
          background-color: #0a0a0a;
          padding: 10px;
          border-radius: 4px;
          overflow-x: auto;
        }
      </style>
    </head>
    <body>
      <div class="terminal">
        <div class="header">
          <h2 class="success">✓ SMTP Configuration Test</h2>
          <p>Sistema de email configurado com sucesso!</p>
        </div>
        
        <div class="content">
          <h3 class="info">📊 Configurações Ativas:</h3>
          <div class="config-item">
            <strong>SMTP Host:</strong> ${config.host || 'N/A'}
          </div>
          <div class="config-item">
            <strong>SMTP Port:</strong> ${config.port || 'N/A'}
          </div>
          <div class="config-item">
            <strong>Sender:</strong> ${config.sender || 'N/A'}
          </div>
          <div class="config-item">
            <strong>TLS:</strong> ${config.secure ? 'Enabled' : 'STARTTLS'}
          </div>
          
          <h3 class="info">🔧 Status do Sistema:</h3>
          <pre>
[OK] Conexão SMTP estabelecida
[OK] Autenticação bem-sucedida
[OK] Templates carregados
[OK] Sistema pronto para produção
          </pre>
          
          <h3 class="info">📝 Próximos Passos:</h3>
          <ul>
            <li>Verificar recebimento deste email</li>
            <li>Testar formulário de contato</li>
            <li>Monitorar logs de envio</li>
            <li>Configurar alertas de falha</li>
          </ul>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #00ff00;">
            <p class="success">Timestamp: ${new Date().toISOString()}</p>
            <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  createOwnerEmailTemplate,
  createClientConfirmationTemplate,
  createOwnerTextTemplate,
  createClientTextTemplate,
  createTestEmailTemplate
};
