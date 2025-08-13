# Como Testar o Sistema Anti-Spam

## Cenários de Teste

### ✅ Teste 1: Formulário Legítimo (Deve Funcionar)
```json
{
  "name": "João Silva",
  "email": "joao@empresa.com",
  "company": "Minha Empresa",
  "message": "Olá, tenho interesse em seus serviços de desenvolvimento web. Podemos conversar sobre um projeto?",
  "honeypot": "",
  "timestamp": "1734120000000"
}
```

### ❌ Teste 2: Honeypot Preenchido (Deve Ser Bloqueado)
```json
{
  "name": "Bot Name",
  "email": "bot@spam.com",
  "company": "Spam Corp",
  "message": "Mensagem de teste",
  "honeypot": "http://spam-site.com",
  "timestamp": "1734120000000"
}
```

### ❌ Teste 3: Conteúdo Spam (Deve Ser Bloqueado)
```json
{
  "name": "Spammer",
  "email": "spam@test.com",
  "company": "",
  "message": "CLICK HERE NOW! Buy viagra for only $50! LIMITED TIME OFFER! Visit http://site1.com http://site2.com http://site3.com for amazing deals on crypto investments! Make money fast!!!",
  "honeypot": "",
  "timestamp": "1734120000000"
}
```

### ❌ Teste 4: Timing Attack (Deve Ser Bloqueado)
```json
{
  "name": "Speed Bot",
  "email": "fast@bot.com",
  "company": "",
  "message": "Mensagem enviada muito rápido",
  "honeypot": "",
  "timestamp": "1734119999000"
}
```

### ❌ Teste 5: Nome Inválido (Deve Ser Bloqueado)
```json
{
  "name": "João123@#$",
  "email": "joao@empresa.com",
  "company": "",
  "message": "Mensagem válida mas nome com caracteres inválidos",
  "honeypot": "",
  "timestamp": "1734120000000"
}
```

## Testes via cURL

### Teste Básico Válido
```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@empresa.com",
    "company": "Minha Empresa",
    "message": "Olá, tenho interesse em seus serviços de desenvolvimento web.",
    "honeypot": "",
    "timestamp": "'$(echo $(date +%s)000)'"
  }'
```

### Teste Honeypot (Deve Falhar)
```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bot Name",
    "email": "bot@spam.com",
    "message": "Mensagem de bot",
    "honeypot": "preenchido",
    "timestamp": "'$(echo $(date +%s)000)'"
  }'
```

### Teste Spam (Deve Falhar)
```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Spammer",
    "email": "spam@test.com",
    "message": "CLICK HERE! Buy viagra now! FREE MONEY! http://spam1.com http://spam2.com http://spam3.com",
    "honeypot": "",
    "timestamp": "'$(echo $(date +%s)000)'"
  }'
```

### Teste Rate Limiting
```bash
# Execute este comando 4 vezes seguidas para testar o rate limiting
for i in {1..4}; do
  echo "Tentativa $i:"
  curl -X POST http://localhost:3000/api/send-email \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Teste Rate Limit",
      "email": "test'$i'@example.com",
      "message": "Teste de rate limiting - tentativa '$i'",
      "honeypot": "",
      "timestamp": "'$(echo $(date +%s)000)'"
    }'
  echo -e "\n---\n"
  sleep 1
done
```

## Verificar Logs

### Logs do Servidor
Monitore o console onde o servidor está rodando para ver:
- `📨 Nova tentativa de contato` - Tentativas válidas
- `🚨 IP marcado como suspeito` - IPs bloqueados
- `⚠️ Email suspeito bloqueado` - Spam detectado

### Headers de Rate Limiting
Observe os headers na resposta:
- `X-RateLimit-Limit` - Limite por janela
- `X-RateLimit-Remaining` - Tentativas restantes
- `X-RateLimit-Reset` - Quando o limite reseta

## Resultados Esperados

### ✅ Sucesso (200)
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso! Você receberá um email de confirmação.",
  "contactId": 123
}
```

### ❌ Validação Falhou (400)
```json
{
  "error": "Dados inválidos. Verifique os campos e tente novamente.",
  "details": ["erro específico aqui"]
}
```

### ❌ Rate Limiting (429)
```json
{
  "error": "Limite de emails excedido. Aguarde 15 minutos antes de tentar novamente.",
  "retryAfter": 900
}
```

### ❌ Spam Detectado (400)
```json
{
  "error": "Mensagem não permitida. Verifique o conteúdo e tente novamente."
}
```

## Teste no Frontend

1. Abra `http://localhost:3000` no navegador
2. Teste cenários válidos e inválidos
3. Observe notificações na interface
4. Verifique se o contador de caracteres funciona
5. Teste submissão muito rápida (< 3 segundos)

## Monitoramento

### Verificar IPs Suspeitos
O sistema mantém um cache de IPs suspeitos que são automaticamente bloqueados com rate limiting mais restritivo.

### Verificar Performance
- Tempo de resposta das validações
- Memory usage dos caches
- Taxa de falsos positivos

## Dicas para Desenvolvimento

1. Use `NODE_ENV=development` para ver detalhes dos erros
2. Adicione seu IP em `TRUSTED_IPS` para bypass dos limits
3. Monitore os logs para ajustar sensibilidade
4. Teste com diferentes User-Agents

---

**Nota**: Sempre teste em ambiente de desenvolvimento antes de colocar em produção!
