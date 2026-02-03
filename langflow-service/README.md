# Langflow Service - Pastita

Configuração e flows para o Langflow AI na plataforma Pastita.

## 🚀 Quick Start

### 1. Iniciar o Langflow

```bash
cd ~/api
docker-compose -f docker-compose.cloudflared.yml up -d langflow
```

### 2. Acessar a interface

- URL: http://localhost:7860
- Login: `admin` / `admin123` (ou o que configurou no .env)

### 3. Configurar API Key da OpenAI (opcional)

Na interface do Langflow, vá em **Settings** → **API Keys** e adicione sua OpenAI API Key.

## 📁 Flows Disponíveis

### `atendimento_pastita.json`

Assistente virtual para atendimento ao cliente da Pastita Massas Artesanais.

**Funcionalidades:**
- Responde sobre cardápio (Rondelli, Molhos, Combos)
- Informa horários de funcionamento
- Orienta sobre formas de pagamento
- Direciona para delivery/retirada
- Personalidade cordial e profissional

**Como importar:**
1. Acesse o Langflow em http://localhost:7860
2. Clique em **"Import"** (ícone de upload)
3. Selecione o arquivo `flows/atendimento_pastita.json`
4. Configure sua **OpenAI API Key** no nó "OpenAI GPT"
5. Salve o flow e copie o **Flow ID** da URL (ex: `abc123-def456`)

**Como usar no Django:**
1. Acesse `/admin/langflow/langflowflow/add/`
2. Preencha:
   - **Name**: `Atendimento WhatsApp`
   - **Flow ID**: *(cole o ID copiado)*
   - **Status**: `Active`
   - **Endpoint URL**: `api/v1/run/{flow_id}`
   - **Timeout**: `30`
   - **Max Retries**: `3`
3. Salve e associe às contas WhatsApp desejadas

**Testar no dashboard:**
1. Acesse **Langflow AI** no menu lateral
2. Aba **Playground**
3. Selecione o flow criado
4. Envie uma mensagem de teste

## 🔧 Estrutura do Flow

```
Input (ChatInput) 
    ↓
Prompt (PromptComponent) - Contexto do restaurante
    ↓
OpenAI (OpenAI Model) - GPT-3.5 Turbo
    ↓
Output (ChatOutput)
```

## 📝 Personalização

Para editar o prompt do atendimento:
1. Abra o flow no Langflow
2. Clique no nó "Prompt Atendimento"
3. Edite o template com as informações do seu cardápio
4. Salve e exporte o novo JSON

## 🐛 Troubleshooting

### Erro "Connection refused"
Verifique se o container está rodando:
```bash
docker ps | grep langflow
```

### Erro "API Key not found"
Configure a OpenAI API Key no nó "OpenAI GPT" do flow.

### Flow não aparece no dashboard
Certifique-se de que:
1. O Flow ID está correto no Django Admin
2. O status está "Active"
3. A conta WhatsApp está associada ao flow
