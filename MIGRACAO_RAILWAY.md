# 🚀 Migração Segura para Railway (Produção)

> Guia passo a passo para atualizar seu deploy no Railway sem downtime

---

## ⚠️ ANTES DE COMEÇAR

Seu projeto já está em produção! Siga este guia cuidadosamente para evitar downtime.

### Checklist de Segurança
- [ ] Código commitado no GitHub
- [ ] Backup do banco de dados (Railway faz automaticamente)
- [ ] Variáveis de ambiente documentadas
- [ ] Computador com Railway CLI instalado (opcional)

---

## 📋 Resumo da Mudança

### O que vai mudar?
1. **Dockerfile**: Otimizado com multi-stage build
2. **Novos serviços**: Celery Worker, Celery Beat, Langflow Worker
3. **Melhorias**: Build mais rápido, logs melhorados, health checks

### O que NÃO vai mudar?
- ✅ Seu serviço web continua funcionando normalmente
- ✅ Variáveis de ambiente mantidas
- ✅ Banco de dados PostgreSQL (mesmo)
- ✅ Redis (mesmo)
- ✅ URL do site (mesma)

---

## 🎯 Etapa 1: Preparação (5 min)

### 1.1 Verifique seu deploy atual
```bash
# Acesse o Railway Dashboard
# Confirme que tudo está funcionando
# Verifique os logs do serviço web
```

### 1.2 Commit das alterações
```bash
git add server/Dockerfile server/railway.toml
# ou se criou novos arquivos:
git add .

git commit -m "chore: otimiza Dockerfile para Railway com multi-stage build

- Adiciona targets: production, celery, beat, langflow-worker
- Mantém compatibilidade com deploy atual
- Melhora performance de build"

git push origin main
```

---

## 🎯 Etapa 2: Deploy do Serviço Web (10 min)

Esta etapa atualiza APENAS o serviço web (seu deploy atual).

### 2.1 Deploy Automático
O Railway vai detectar automaticamente o push e fazer deploy:

1. Acesse: https://railway.app/dashboard
2. Selecione seu projeto
3. Acompanhe o deploy na aba "Deployments"

### 2.2 Verifique se funcionou
```bash
# Teste seu site
curl https://seu-app.up.railway.app/api/v1/stores/stores/

# Verifique os logs no Dashboard
# Procure por: "[ENTRYPOINT] Application ready!"
```

### 2.3 Em caso de erro (ROLLBACK)
Se algo der errado:
```bash
# No Railway Dashboard:
# 1. Vá em "Deployments"
# 2. Encontre o deploy anterior (funcionando)
# 3. Clique nos 3 pontos → "Rollback"

# Ou via CLI:
railway rollback
```

---

## 🎯 Etapa 3: Adicionar Celery Worker (10 min)

Agora vamos adicionar o processamento de tarefas em background.

### 3.1 No Railway Dashboard

1. Clique em **"New"** → **"Service"**
2. Selecione **"GitHub Repo"** → Seu repositório
3. Configure:

| Campo | Valor |
|-------|-------|
| Service Name | `celery` |
| Dockerfile Path | `server/Dockerfile` |
| Build Target | `celery` |
| Start Command | *(deixe em branco)* |

4. Clique em **"Deploy"**

### 3.2 Configure as Variáveis de Ambiente

No novo serviço `celery`, clique em **"Variables"** → **"Edit"**:

Copie TODAS as variáveis do serviço `web`:

```bash
# Clique em "Raw Editor" e copie tudo
# Cole no serviço celery
# Ou use o botão "Copy from..." se disponível
```

**Variáveis obrigatórias:**
```env
DJANGO_SETTINGS_MODULE=config.settings.production
DJANGO_SECRET_KEY=<mesmo do web>
DJANGO_ALLOWED_HOSTS=<mesmo do web>
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
CELERY_BROKER_URL=${{Redis.REDIS_URL}}
SKIP_MIGRATIONS=1
```

### 3.3 Verifique se funcionou
```bash
# Nos logs do serviço celery, procure por:
# "celery@... ready"
```

---

## 🎯 Etapa 4: Adicionar Celery Beat (Scheduler) (10 min)

Para agendamento de tarefas periódicas.

### 4.1 Criar Serviço
Mesmo processo do Etapa 3, mas:
- **Service Name**: `celery-beat`
- **Build Target**: `beat`

### 4.2 Variáveis de Ambiente
Mesmas do celery, mas adicione:
```env
SKIP_MIGRATIONS=1
```

### 4.3 Verifique
Nos logs deve aparecer:
```
celery beat v... started
```

---

## 🎯 Etapa 5: Langflow (Opcional)

### Opção A: Langflow no Railway
Se quiser rodar Langflow no próprio Railway:

1. **Novo Serviço** → **"Docker Image"**
2. Image: `langflowai/langflow:latest`
3. Variables:
   ```env
   LANGFLOW_HOST=0.0.0.0
   LANGFLOW_PORT=${PORT}
   LANGFLOW_AUTO_LOGIN=false
   LANGFLOW_SUPERUSER=admin
   LANGFLOW_SUPERUSER_PASSWORD=<senha segura>
   LANGFLOW_DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```

### Opção B: Langflow Externo (Recomendado)
Se já tem Langflow rodando externamente:

1. Apenas adicione o **Langflow Worker** no Railway
2. Configure a variável:
   ```env
   LANGFLOW_API_URL=https://seu-langflow.com
   ```

---

## ✅ Verificação Final

### Teste as Funcionalidades
```bash
# 1. API Principal
curl https://seu-app.up.railway.app/api/v1/stores/stores/

# 2. Django Admin
https://seu-app.up.railway.app/admin/

# 3. Crie um pedido de teste
# Verifique se aparece nos logs do celery
```

### Logs para Monitorar
| Serviço | Log Esperado |
|---------|--------------|
| web | `[ENTRYPOINT] Application ready!` |
| celery | `celery@... ready` |
| celery-beat | `beat: Starting...` |

---

## 🆘 Troubleshooting

### Erro: "Cannot find module"
```bash
# Solução: Verifique se o requirements.txt está correto
# Adicione se faltar:
pip install uvicorn[standard]
```

### Erro: "Database connection failed"
```bash
# Verifique se DATABASE_URL está correta
# Formato: postgresql://user:pass@host:port/db
```

### Erro: "Redis connection failed"
```bash
# Verifique REDIS_URL
# Formato: redis://host:port/0
```

### Worker não processa tarefas
```bash
# Verifique se CELERY_BROKER_URL está igual ao REDIS_URL
# Verifique os logs do celery
```

---

## 📊 Resultado Final

Seu deploy no Railway agora terá:

```
┌─────────────────────────────────────────────────────────────┐
│                     Railway Project                          │
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │   Web   │  │  Celery │  │   Beat  │  │ Postgres│        │
│  │ (ASGI)  │  │ Worker  │  │Scheduler│  │   DB    │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
│       └────────────┴────────────┴────────────┘              │
│                         │                                    │
│                    ┌────┴────┐                              │
│                    │  Redis  │                              │
│                    │ (Broker)│                              │
│                    └─────────┘                              │
│                                                              │
│  Opcional:                                                   │
│  ┌─────────┐  ┌─────────────┐                               │
│  │ Langflow│  │Langflow     │                               │
│  │ Service │  │Worker       │                               │
│  └─────────┘  └─────────────┘                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Comandos Úteis (Railway CLI)

```bash
# Ver logs de todos serviços
railway logs

# Ver logs de um serviço específico
railway logs -s celery

# Conectar ao shell do web
railway connect web

# Executar comando no container
railway run python manage.py migrate

# Escala (se usar plano Pro)
railway scale web --replicas 2
```

---

**Sucesso!** 🎉 Seu deploy está otimizado e pronto para processar tarefas em background!
