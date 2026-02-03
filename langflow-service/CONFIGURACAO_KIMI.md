# Configuração Kimi (Moonshot) no Langflow

## ✅ Compatibilidade

O **Kimi é 100% compatível** com a API da OpenAI! Você pode usar o componente "OpenAI" normalmente.

---

## 🚀 Passo a Passo

### 1. Obter API Key do Kimi

1. Acesse: https://platform.moonshot.cn
2. Faça login (pode usar GitHub)
3. Vá em **API Keys** → **Create API Key**
4. Copie a key (começa com `sk-`)

### 2. Configurar no Langflow

Abra o flow **"Atendimento Pastita"** e configure o nó **OpenAI**:

```
OpenAI API Key: sk-sua-key-do-kimi-aqui
Model: moonshot-v1-8k
Temperature: 0.7
Max Tokens: 500
```

> ⚠️ **Importante**: No Langflow padrão, o campo "Base URL" pode não estar visível. Se necessário, use a versão alternativa abaixo.

---

## 🔧 Alternativa: Usar com Base URL Custom

Se o Langflow permitir campo "Base URL" no nó OpenAI:

```
Base URL: https://api.moonshot.cn/v1
Model: moonshot-v1-8k
```

Se **NÃO** tiver campo Base URL, você precisa:

### Opção A: Modificar o componente OpenAI no código
Editar o arquivo do Langflow para suportar base_url (avançado)

### Opção B: Usar proxy/reverse proxy
Criar um proxy local que redirecione `localhost:8000/v1` → `api.moonshot.cn/v1`

### Opção C: Usar via backend Django (Recomendado)
Em vez de chamar o Langflow direto, chame seu backend Django que usa Kimi:

```typescript
// No frontend
const response = await api.post('/langflow/flows/process/', {
  flow_id: 'seu-flow-id',
  message: 'Olá!',
  use_kimi: true  // flag para usar Kimi no backend
});
```

---

## 📊 Modelos Kimi Disponíveis

| Modelo | Contexto | Uso |
|--------|----------|-----|
| `moonshot-v1-8k` | 8K tokens | Conversas simples |
| `moonshot-v1-32k` | 32K tokens | Conversas longas |
| `moonshot-v1-128k` | 128K tokens | Documentos grandes |

---

## 💰 Preços Kimi (atualizado)

| Modelo | Input | Output |
|--------|-------|--------|
| moonshot-v1-8k | ¥0.012 / 1K tokens | ¥0.012 / 1K tokens |
| moonshot-v1-32k | ¥0.024 / 1K tokens | ¥0.024 / 1K tokens |
| moonshot-v1-128k | ¥0.060 / 1K tokens | ¥0.060 / 1K tokens |

> Conversão: ¥1 ≈ R$ 0,70

---

## 🆚 Comparação: Kimi vs OpenAI

| Característica | Kimi | OpenAI GPT-3.5 |
|---------------|------|----------------|
| Português | ⭐⭐⭐⭐⭐ Excelente | ⭐⭐⭐⭐ Bom |
| Velocidade | ⭐⭐⭐⭐ Rápido | ⭐⭐⭐⭐⭐ Muito rápido |
| Contexto | 128K | 16K |
| Preço | ⭐⭐⭐⭐ Barato | ⭐⭐⭐⭐ Barato |
| Disponibilidade | ⭐⭐⭐ China | ⭐⭐⭐⭐⭐ Global |

---

## 🎯 Recomendação para Pastita

Use **Kimi** se:
- ✅ Quiser excelente português
- ✅ Quiser contexto longo (128K)
- ✅ Não se importar com latência ligeiramente maior

Use **OpenAI** se:
- ✅ Quiser respostas instantâneas
- ✅ Já tiver créditos na OpenAI
- ✅ Quiser máxima estabilidade

---

## 🐛 Troubleshooting

### "Invalid API Key"
- Verifique se copiou a key completa
- Kimi keys começam com `sk-` (mesmo formato OpenAI)

### "Model not found"
- Use exatamente: `moonshot-v1-8k`
- Não use `gpt-3.5-turbo` com Kimi

### Rate limit
- Kimi tem limites de requisição no plano gratuito
- Aguarde alguns segundos entre chamadas

---

## 🔗 Links Úteis

- Dashboard Kimi: https://platform.moonshot.cn
- Documentação: https://platform.moonshot.cn/docs
- Preços: https://platform.moonshot.cn/pricing
