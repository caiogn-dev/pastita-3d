# 🚀 Railway - Múltiplos Serviços (Dockerfiles Separados)

> Configuração onde cada serviço tem seu próprio Dockerfile

---

## 📁 Estrutura de Dockerfiles

```
server/
├── Dockerfile.web              ⬅️ Django Web (ASGI)
├── Dockerfile.celery           ⬅️ Celery Worker
├── Dockerfile.beat             ⬅️ Celery Beat
├── Dockerfile.langflow-worker  ⬅️ Langflow Worker
└── Dockerfile.langflow         ⬅️ Langflow Service (já existente)
```

**Vantagem:** Cada serviço é independente, fácil de gerenciar no Dashboard.

---

## 🎯 Configuração no Railway Dashboard

### PASSO 1: Web (Já deve existir)

Seu serviço web atual precisa ser atualizado:

1. Vá no serviço `web` no Dashboard
2. **Settings** → **Dockerfile Path**
3. Altere para: `server/Dockerfile.web`
4. **Deploy**

✅ Pronto! O serviço web está atualizado.

---

### PASSO 2: Criar Serviço Celery

1. Dashboard → **New** → **Service**
2. Selecione seu **GitHub Repo**
3. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | `celery` |
| **Dockerfile Path** | `server/Dockerfile.celery` |
| **Start Command** | *(deixe em branco - usa CMD do Dockerfile)* |

4. Clique **Deploy**

#### Variáveis de Ambiente (Celery)

Vá em **Variables** → **Edit**:

```bash
# Copie TODAS do serviço web, depois adicione:
SKIP_MIGRATIONS=1
```

**Como copiar:**
- Vá no serviço `web` → Variables
- Clique em "Raw Editor" 
- Copie tudo
- Cole no serviço `celery`
- Adicione `SKIP_MIGRATIONS=1`

---

### PASSO 3: Criar Serviço Celery-Beat

1. **New** → **Service**
2. GitHub Repo
3. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | `celery-beat` |
| **Dockerfile Path** | `server/Dockerfile.beat` |
| **Start Command** | *(deixe em branco)* |

4. **Deploy**

#### Variáveis
Mesmo processo do celery (copiar do web + `SKIP_MIGRATIONS=1`)

---

### PASSO 4: Criar Serviço Langflow-Worker (Opcional)

Se você usa Langflow:

1. **New** → **Service**
2. GitHub Repo
3. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | `celery-langflow` |
| **Dockerfile Path** | `server/Dockerfile.langflow-worker` |
| **Start Command** | *(deixe em branco)* |

4. **Deploy**

#### Variáveis
Copie do web + adicione:
```env
SKIP_MIGRATIONS=1
LANGFLOW_API_URL=https://seu-langflow.com  # ou interno
```

---

### PASSO 5: Langflow Service (Opcional)

Se quer rodar Langflow no próprio Railway:

1. **New** → **Service**
2. GitHub Repo
3. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | `langflow` |
| **Dockerfile Path** | `server/Dockerfile.langflow` |
| **Start Command** | *(deixe em branco)* |

4. **Deploy**

#### Variáveis do Langflow
```env
LANGFLOW_HOST=0.0.0.0
LANGFLOW_PORT=${PORT}
LANGFLOW_AUTO_LOGIN=false
LANGFLOW_SUPERUSER=admin
LANGFLOW_SUPERUSER_PASSWORD=<senha segura>
LANGFLOW_SECRET_KEY=<chave secreta>
LANGFLOW_DATABASE_URL=${{Postgres.DATABASE_URL}}
```

---

## 📊 Resultado Final

Seu projeto no Railway terá:

```
🌐 web                (Django ASGI - HTTP/WebSocket)
⚙️ celery             (Worker - processa tarefas)
⏰ celery-beat        (Scheduler - cron jobs)
🤖 celery-langflow    (Worker AI - processa Langflow)
🧠 langflow           (Serviço Langflow - opcional)
🗄️ Postgres           (Database - já existente)
⚡ Redis              (Cache/Queue - já existente)
```

---

## ✅ Checklist de Configuração

### Serviço Web
- [ ] Dockerfile: `server/Dockerfile.web`
- [ ] Variáveis: `DJANGO_SECRET_KEY`, `DATABASE_URL`, `REDIS_URL`
- [ ] Health Check: `/api/v1/stores/stores/`

### Serviço Celery
- [ ] Dockerfile: `server/Dockerfile.celery`
- [ ] Variáveis: Copiadas do web
- [ ] Extra: `SKIP_MIGRATIONS=1`

### Serviço Celery-Beat
- [ ] Dockerfile: `server/Dockerfile.beat`
- [ ] Variáveis: Copiadas do web
- [ ] Extra: `SKIP_MIGRATIONS=1`

### Serviço Langflow-Worker (se usar)
- [ ] Dockerfile: `server/Dockerfile.langflow-worker`
- [ ] Variáveis: Copiadas do web
- [ ] Extra: `SKIP_MIGRATIONS=1`, `LANGFLOW_API_URL`

---

## 🧪 Testando

### Teste 1: Web funciona?
```bash
curl https://seu-app.up.railway.app/api/v1/stores/stores/
```

### Teste 2: Celery processando?
```bash
# Veja os logs do serviço "celery"
# Deve mostrar: "celery@... ready"

# Crie um pedido no site
# Veja se aparece processamento nos logs
```

### Teste 3: Beat agendando?
```bash
# Logs do "celery-beat"
# Deve mostrar: "beat: Starting..."
```

---

## 🆘 Troubleshooting

### "Cannot find Dockerfile"
Verifique o caminho:
- Deve ser: `server/Dockerfile.celery` (não `./server/...`)
- O arquivo existe no GitHub?

### "Service failed to start"
Verifique as variáveis:
- `DATABASE_URL` está correta?
- `REDIS_URL` está correta?
- `SKIP_MIGRATIONS=1` está definido?

### "Worker not processing"
Verifique o Redis:
- `CELERY_BROKER_URL` deve ser igual ao `REDIS_URL`
- O serviço Redis está rodando?

---

## 📝 Resumo dos Dockerfiles

| Serviço | Dockerfile | Propósito |
|---------|------------|-----------|
| web | `Dockerfile.web` | Django + ASGI + WebSocket |
| celery | `Dockerfile.celery` | Worker de tarefas |
| celery-beat | `Dockerfile.beat` | Agendador cron |
| celery-langflow | `Dockerfile.langflow-worker` | Worker AI dedicado |
| langflow | `Dockerfile.langflow` | Serviço Langflow |

---

**Pronto!** 🎉 Agora você tem múltiplos serviços independentes no Railway!
