# Portfolio Lucas Pinheiro - Com Integração Amazon SES

## 📧 Sistema de Email Configurado

Este projeto está configurado com Amazon SES para envio automático de emails após o preenchimento do formulário de contato.

### ✅ Funcionalidades Implementadas

1. **API Route Serverless** (`/api/send-email`)
   - Processa o formulário de contato
   - Envia email para o proprietário com os dados do formulário
   - Envia email de confirmação para o cliente

2. **Templates de Email Profissionais**
   - Email HTML responsivo para o proprietário
   - Email de confirmação automático para o cliente
   - Design consistente com a identidade visual do site

3. **Validações e Tratamento de Erros**
   - Validação de campos obrigatórios
   - Validação de formato de email
   - Mensagens de erro específicas
   - Notificações visuais de sucesso/erro

4. **Segurança**
   - Variáveis de ambiente protegidas (.env.local)
   - CORS configurado
   - .gitignore configurado para não expor credenciais

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

O arquivo `.env.local` já está configurado com:
- Credenciais AWS (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
- Região AWS (us-east-2)
- Email remetente: `no-reply@lucaspinheiro.work`
- Email destinatário: `lucas.negociosagro@gmail.com`

### 3. Verificar Emails no Amazon SES

⚠️ **IMPORTANTE**: Antes de funcionar em produção, você precisa:

1. **Verificar o domínio ou email remetente** no Amazon SES:
   - Acesse o console AWS SES
   - Vá em "Verified identities"
   - Adicione e verifique `lucaspinheiro.work` (domínio) ou `no-reply@lucaspinheiro.work` (email)

2. **Sair do Sandbox Mode** (para enviar para qualquer email):
   - No console SES, solicite aumento de limite de envio
   - Ou verifique também os emails destinatários durante testes

### 4. Executar o Projeto

**Desenvolvimento local:**
```bash
npm run dev
```

**Deploy para produção (Vercel):**
```bash
npm run deploy
```

## 📝 Estrutura do Projeto

```
lucaspinheiro/
├── api/
│   └── send-email.js       # API Route para processar emails
├── public/
│   └── og-image.jpg        # Imagem para redes sociais
├── .env.local              # Variáveis de ambiente (não versionado)
├── .gitignore              # Arquivos ignorados pelo Git
├── index.html              # Página principal do portfolio
├── package.json            # Dependências do projeto
├── vercel.json             # Configurações da Vercel
└── README.md               # Este arquivo
```

## 🔧 Configurações AWS SES

### Região Configurada
- **us-east-2** (Ohio)

### Emails Configurados
- **Remetente**: no-reply@lucaspinheiro.work
- **Destinatário**: lucas.negociosagro@gmail.com

### Limites do SES
- **Sandbox**: 200 emails/dia (precisa verificar destinatários)
- **Produção**: Solicitar aumento de limite no console AWS

## 🎨 Personalizações

### Alterar Email Remetente
Edite no `.env.local`:
```
SENDER_EMAIL=seu-email@dominio.com
```

### Alterar Email Destinatário
Edite no `.env.local`:
```
RECIPIENT_EMAIL=seu-email@gmail.com
```

### Modificar Templates de Email
Edite os templates em `api/send-email.js`:
- `createEmailTemplate()` - Email para o proprietário
- `createConfirmationTemplate()` - Email de confirmação para o cliente

## 📊 Monitoramento

### Logs de Erro
Os erros são logados no console e retornados como resposta da API:
- Erros de validação (400)
- Erros de configuração SES (500)
- Erros de rede

### Métricas no AWS SES
Acesse o console AWS SES para ver:
- Taxa de entrega
- Bounces
- Complaints
- Emails enviados

## 🛡️ Segurança

1. **Nunca commite o arquivo `.env.local`**
2. **Use sempre variáveis de ambiente para credenciais**
3. **Mantenha as credenciais AWS com permissões mínimas**
4. **Rotacione as chaves de acesso regularmente**

## 📞 Suporte

Para dúvidas ou problemas:
- Email: lucas.negociosagro@gmail.com
- Site: https://lucaspinheiro.work

---

**Desenvolvido com ❤️ por Lucas Pinheiro**
