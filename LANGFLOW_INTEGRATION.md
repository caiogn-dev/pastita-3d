# 🤖 Integração Langflow - Guia de Produção

> Como configurar Langflow no seu deploy Railway existente

---

## 🎯 Cenários Possíveis

### Cenário 1: Langflow Externo (Mais Fácil)
Você já tem Langflow rodando em outro servidor/serviço.

### Cenário 2: Langflow no Railway (Novo)
Quer adicionar Langflow como novo serviço no Railway.

---

## 📍 Cenário 1: Langflow Externo (Recomendado)

Se você já tem Langflow configurado em outro lugar:

### 1.1 Configure a URL no Railway
No Dashboard do Railway, no serviço `web`:

```env
LANGFLOW_API_URL=https://seu-langflow-atual.com
LANGFLOW_API_KEY=sua-api-key-aqui  # se necessário
```

### 1.2 Adicione o Langflow Worker
Este worker processa as chamadas para Langflow:

**Novo Serviço no Railway:**
- Name: `celery-langflow`
- Dockerfile: `server/Dockerfile`
- Target: `langflow-worker`

**Variáveis:**
```env
# Copie todas do serviço web, incluindo:
LANGFLOW_API_URL=https://seu-langflow-atual.com
DJANGO_SETTINGS_MODULE=config.settings.production
DJANGO_SECRET_KEY=<mesmo do web>
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
CELERY_BROKER_URL=${{Redis.REDIS_URL}}
SKIP_MIGRATIONS=1
```

✅ **Pronto!** Seu Django agora pode chamar Langflow via fila Celery.

---

## 📍 Cenário 2: Langflow no Railway

Se quer rodar Langflow no próprio Railway:

### 2.1 Crie o Serviço Langflow

**Opção A: Via Dashboard (Fácil)**
1. Railway Dashboard → New Service
2. Selecione "Deploy from GitHub repo"
3. Configure:
   - Name: `langflow`
   - Dockerfile: `server/Dockerfile.langflow`

**Opção B: Via CLI**
```bash
railway service create langflow
railway service langflow config --dockerfile "server/Dockerfile.langflow"
```

### 2.2 Configure as Variáveis
```env
LANGFLOW_HOST=0.0.0.0
LANGFLOW_PORT=${PORT}
LANGFLOW_AUTO_LOGIN=false
LANGFLOW_SUPERUSER=admin
LANGFLOW_SUPERUSER_PASSWORD=<senha forte aqui>
LANGFLOW_SECRET_KEY=<outra chave secreta>
LANGFLOW_DATABASE_URL=${{Postgres.DATABASE_URL}}
LANGFLOW_SAVE_DB_IN_ROOT=false
```

### 2.3 Configure o Django para usar
No serviço `web`, atualize:
```env
LANGFLOW_API_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}  # URL do serviço langflow
```

### 2.4 Adicione o Worker
Crie o serviço `celery-langflow` (mesmo do Cenário 1).

---

## 🔧 Configuração do Django Admin

### 1. Acesse o Admin
```
https://seu-app.up.railway.app/admin/
```

### 2. Configure CompanyProfile
Vá em **Automation** → **Company Profiles**:

- **use_langflow**: ✅ Marque como True
- **langflow_flow_id**: Cole o ID do seu flow

### 3. Como pegar o Flow ID

#### Via Langflow UI:
1. Acesse sua interface do Langflow
2. Abra seu flow
3. O ID está na URL: `/flow/XXXX-XXXX-XXXX-XXXX`

#### Via API:
```bash
curl https://seu-langflow.com/api/v1/flows \
  -H "Authorization: Bearer $LANGFLOW_API_KEY"
```

---

## 🧪 Testando a Integração

### Teste 1: Verificar conexão
```python
# Django Shell (railway run python manage.py shell)
from apps.langflow.services import LangflowService

service = LangflowService()
result = service.check_health()
print(result)  # Deve retornar status ok
```

### Teste 2: Executar flow
```python
from apps.langflow.services import LangflowService

service = LangflowService()
response = service.run_flow(
    flow_id="seu-flow-id",
    message="Olá, tudo bem?"
)
print(response)
```

### Teste 3: Via WhatsApp
1. Envie mensagem para seu número de WhatsApp Business
2. Verifique nos logs do `celery-langflow`
3. Deve aparecer: `Processing langflow task...`

---

## 📊 Monitoramento

### Logs Importantes

**Serviço `langflow`:**
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Serviço `celery-langflow`:**
```
[celery] Connected to redis://...
[celery] Ready
Task apps.langflow.tasks.process_message[xxx] received
```

### Health Checks

| Serviço | URL |
|---------|-----|
| Langflow | `https://seu-langflow.up.railway.app/api/v1/health` |
| Django | `https://seu-app.up.railway.app/api/v1/stores/stores/` |

---

## 🆘 Troubleshooting

### "Connection refused" ao Langflow
```bash
# Verifique se a URL está correta
# Se no mesmo Railway project, use:
LANGFLOW_API_URL=http://langflow.railway.internal:8000
# Ou:
LANGFLOW_API_URL=https://${{langflow.RAILWAY_PUBLIC_DOMAIN}}
```

### "Flow not found"
```bash
# Verifique se o langflow_flow_id está correto no CompanyProfile
# Deve ser UUID completo: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Timeout nas requisições
```python
# No settings.py, aumente o timeout:
LANGFLOW_TIMEOUT = 60  # segundos
```

### Worker não processa
```bash
# Verifique se a fila langflow existe no celery:
railway logs -s celery-langflow

# Deve aparecer:
# [queues]
# .> langflow          exchange=langflow(direct) key=langflow
```

---

## 🎨 Fluxo de Dados

```
WhatsApp Message
       ↓
   Webhook
       ↓
Django View (apps.whatsapp)
       ↓
Automation Service
       ↓
Langflow Celery Task  ──►  Redis Queue (langflow)
                               ↓
                       celery-langflow Worker
                               ↓
                       HTTP Request ──► Langflow API
                               ↓
                       Response to WhatsApp
```

---

## ✅ Checklist Final

- [ ] Langflow acessível (externo ou no Railway)
- [ ] Variável `LANGFLOW_API_URL` configurada
- [ ] Worker `celery-langflow` rodando
- [ ] `use_langflow=True` no CompanyProfile
- [ ] `langflow_flow_id` preenchido
- [ ] Teste de mensagem funcionando

---

**Dúvidas?** Verifique os logs no Railway Dashboard!
