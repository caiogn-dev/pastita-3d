# Compatibilidade de APIs LLM com Langflow

## 📊 Resumo de Compatibilidade

| Provedor | API Compatível | Componente Langflow | Base URL |
|----------|---------------|---------------------|----------|
| **OpenAI** | Nativa | OpenAI | `https://api.openai.com/v1` |
| **Groq** | OpenAI | OpenAI | `https://api.groq.com/openai/v1` |
| **Kimi (Moonshot)** | ✅ OpenAI | OpenAI | `https://api.moonshot.cn/v1` |
| **Anthropic** | Nativa | Anthropic | `https://api.anthropic.com` |
| **Ollama** | OpenAI | Ollama | `http://localhost:11434` |

---

## 🌙 Kimi (Moonshot AI) - Compatível OpenAI

O Kimi usa a **mesma API da OpenAI** (drop-in replacement). Funciona perfeitamente no Langflow!

### Configuração no Langflow:

1. **No nó "OpenAI", configure:**
   - **OpenAI API Key**: `sk-xxxxxxxxxxxxx` (sua key do Kimi)
   - **Model**: `moonshot-v1-8k` ou `moonshot-v1-32k` ou `moonshot-v1-128k`
   - **Temperature**: `0.7`
   - **Max Tokens**: `2000`

2. **Para usar via API (backend Django):**

```python
# No .env do servidor
KIMI_API_KEY=sk-your-kimi-key
KIMI_BASE_URL=https://api.moonshot.cn/v1
KIMI_MODEL=moonshot-v1-8k
```

3. **Modifique o LangflowService para suportar Kimi:**

```python
# server/apps/langflow/services/langflow_service.py

class LangflowService:
    def _run_flow(self, flow, message, session, context):
        # ... código existente ...
        
        # Se o flow usar Kimi (base URL do Moonshot)
        if "moonshot" in flow.endpoint_url or flow.model_provider == "kimi":
            return self._call_kimi(message, context)
    
    def _call_kimi(self, message, context):
        """Chama API do Kimi (OpenAI compatible)."""
        import openai
        
        client = openai.OpenAI(
            api_key=settings.KIMI_API_KEY,
            base_url="https://api.moonshot.cn/v1"
        )
        
        response = client.chat.completions.create(
            model=settings.KIMI_MODEL,
            messages=[
                {"role": "system", "content": context.get('system_prompt', '')},
                {"role": "user", "content": message}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        return {
            'response': response.choices[0].message.content,
            'model': response.model,
            'usage': response.usage
        }
```

---

## 🎭 Anthropic (Claude) - API Nativa

A Anthropic tem API própria, diferente da OpenAI. O Langflow tem componente específico!

### Configuração no Langflow:

1. **Adicione o componente "Anthropic" ao flow:**
   - Procure por "Anthropic" nos componentes
   - Arraste para o canvas

2. **Configure:**
   - **Anthropic API Key**: `sk-ant-api03-xxxxxxxxxxxxx`
   - **Model**: `claude-3-haiku-20240307` (mais rápido/cheap) ou `claude-3-sonnet-20240229` (melhor)
   - **Max Tokens**: `4096`
   - **Temperature**: `0.7`

### Modelos Claude disponíveis:

| Modelo | Uso | Custo (input/output) |
|--------|-----|---------------------|
| `claude-3-haiku-20240307` | Simples, rápido | $0.25/$1.25 por 1M tokens |
| `claude-3-sonnet-20240229` | Balanceado | $3/$15 por 1M tokens |
| `claude-3-opus-20240229` | Complexo | $15/$75 por 1M tokens |

---

## ⚡ Groq (Alternativa Rápida)

Já mencionado antes, mas importante reforçar - é a opção mais rápida!

### Configuração:
- **Base URL**: `https://api.groq.com/openai/v1`
- **Models**: `llama3-8b-8192`, `mixtral-8x7b-32768`, `gemma-7b-it`
- **API Key**: Grátis em console.groq.com

---

## 🔧 Recomendação de Configuração

Para o **Atendimento Pastita**, recomendo:

### Opção 1: Kimi (Moonshot) - Melhor para Português 🇧🇷
- Excelente em português
- Contexto de 128k tokens
- Preço competitivo

### Opção 2: Groq Llama3 - Mais Rápido ⚡
- Resposta instantânea
- Gratuito (até certo limite)
- Bom português

### Opção 3: Claude Haiku - Mais Confiável 🎯
- Menos alucinações
- Segue instruções perfeitamente
- Custo moderado

---

## 📋 Passos para Configurar Kimi

1. **Crie conta em**: https://platform.moonshot.cn
2. **Gere API Key**: Dashboard → API Keys → Create
3. **No Langflow**:
   - Use componente **OpenAI**
   - API Key: `sk-...` (do Kimi)
   - Model: `moonshot-v1-8k`
   - (Opcional) Custom Base URL: `https://api.moonshot.cn/v1`

4. **Teste a mensagem**:
   ```
   Olá, qual o preço do rondelli?
   ```

---

## 🐛 Troubleshooting

### Erro "Model not found"
Verifique se o nome do modelo está correto. Kimi usa:
- ❌ `gpt-3.5-turbo` 
- ✅ `moonshot-v1-8k`

### Erro "Invalid API Key"
A key do Kimi começa com `sk-` (igual OpenAI). Certifique-se de:
1. Copiar a key completa
2. Não haver espaços extras
3. A key ter créditos ativos

### Erro de CORS
Se usar Kimi direto do frontend, configure CORS no dashboard do Kimi.
