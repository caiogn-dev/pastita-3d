# 🚀 Guia de Deploy - Pastita Platform

> Configurações otimizadas para Railway, Docker e desenvolvimento local

---

## 📋 Sumário

1. [Arquitetura de Deploy](#arquitetura)
2. [Deploy no Railway (Produção)](#railway)
3. [Deploy com Docker Compose (Desenvolvimento)](#docker-compose)
4. [Variáveis de Ambiente](#variaveis)
5. [Langflow Integration](#langflow)
6. [Celery Workers](#celery)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitetura de Deploy {#arquitetura}

```
┌─────────────────────────────────────────────────────────────────┐
│                         Railway / VPS                            │
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │   Nginx     │────│   Django    │────│  PostgreSQL │          │
│  │   (80/443)  │    │   (ASGI)    │    │  (Railway)  │          │
│  └─────────────┘    └──────┬──────┘    └─────────────┘          │
│                            │                                     │
│         ┌──────────────────┼──────────────────┐                  │
│         │                  │                  │                  │
│  ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐            │
│  │   Celery    │   │Celery Beat  │   │   Redis     │            │
│  │   Worker    │   │  Scheduler  │   │  (Railway)  │            │
│  └─────────────┘   └─────────────┘   └─────────────┘            │
│                                                                  │
│  ┌─────────────┐                                                 │
│  │  Langflow   │── Opcional: Rodar no Railway ou usar externo    │
│  │  (AI Flows) │                                                 │
│  └─────────────┘                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚂 Deploy no Railway (Produção) {#railway}

### 1. Preparação

```bash
# Instale o Railway CLI (opcional)
npm install -g @railway/cli

# Login
railway login

# Inicialize o projeto
railway init
```

### 2. Provisione os Serviços

No dashboard do Railway:

1. **New Project** → **Deploy from GitHub repo**
2. **Add Service** → **Database** → **Add PostgreSQL**
3. **Add Service** → **Database** → **Add Redis**

### 3. Configure as Variáveis de Ambiente

No Railway Dashboard → Variables:

```env
# Django
DJANGO_SETTINGS_MODULE=config.settings.production
DJANGO_SECRET_KEY=sua-chave-secreta-aqui-minimo-50-caracteres
DJANGO_ALLOWED_HOSTS=seu-app.up.railway.app,*.railway.app

# Database (auto-gerado pelo Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis (auto-gerado pelo Railway)
REDIS_URL=${{Redis.REDIS_URL}}
CELERY_BROKER_URL=${{Redis.REDIS_URL}}
CELERY_RESULT_BACKEND=${{Redis.REDIS_URL}}

# Langflow (opções)
# Opção 1: Langflow no Railway
LANGFLOW_API_URL=https://seu-langflow.up.railway.app
# Opção 2: Langflow externo
# LANGFLOW_API_URL=https://langflow.seu-dominio.com

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxx ou APP_USR-xxx
MERCADO_PAGO_PUBLIC_KEY=TEST-xxx ou APP_USR-xxx
MERCADO_PAGO_WEBHOOK_SECRET=seu-secret

# WhatsApp
WHATSAPP_WEBHOOK_VERIFY_TOKEN=seu-token-de-verificacao

# Email (Resend)
RESEND_API_KEY=re_xxx
DEFAULT_FROM_EMAIL=noreply@seudominio.com

# Storage (AWS S3 opcional)
USE_S3=True
AWS_ACCESS_KEY_ID=AKIAxxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_STORAGE_BUCKET_NAME=pastita-media
AWS_S3_REGION_NAME=us-east-1
```

### 4. Deploy Automático

O Railway detecta automaticamente o `railway.toml` e faz o deploy:

```bash
# Deploy manual (se necessário)
railway up
```

### 5. Execute Migrações

```bash
# Acesse o container
railway connect

# Ou execute comando remoto
railway run python manage.py migrate
railway run python manage.py createsuperuser
```

---

## 🐳 Docker Compose (Desenvolvimento) {#docker-compose}

### Quick Start

```bash
# Clone o repositório
git clone https://github.com/seu-user/pastita.git
cd pastita/server

# Copie o arquivo de variáveis de ambiente
cp .env.example .env

# Edite o .env com suas configurações
nano .env

# Inicie todos os serviços
docker-compose up -d

# Execute migrações
docker-compose exec web python manage.py migrate

# Crie um superusuário
docker-compose exec web python manage.py createsuperuser
```

### Serviços Incluídos

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| web | 8000 | Django ASGI |
| nginx | 80 | Reverse Proxy |
| langflow | 7860 | AI Flows |
| celery | - | Worker |
| celery-beat | - | Scheduler |
| celery-langflow | - | AI Worker |
| db | 5432 | PostgreSQL |
| redis | 6379 | Cache/Broker |

### Comandos Úteis

```bash
# Ver logs
docker-compose logs -f web
docker-compose logs -f celery

# Reiniciar serviço
docker-compose restart celery

# Escalar workers
docker-compose up -d --scale celery=3

# Backup do banco
docker-compose exec db pg_dump -U postgres pastita > backup.sql

# Restore do banco
cat backup.sql | docker-compose exec -T db psql -U postgres pastita

# Limpar tudo (cuidado!)
docker-compose down -v
```

---

## 🔧 Variáveis de Ambiente {#variaveis}

### Obrigatórias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DJANGO_SECRET_KEY` | Chave secreta do Django | `django-insecure-...` |
| `DJANGO_ALLOWED_HOSTS` | Hosts permitidos | `localhost,*.railway.app` |
| `DATABASE_URL` | URL do PostgreSQL | `postgresql://...` |
| `REDIS_URL` | URL do Redis | `redis://...` |

### Integrações

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `MERCADO_PAGO_ACCESS_TOKEN` | Token do MP | Para pagamentos |
| `RESEND_API_KEY` | API Key Resend | Para emails |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Token Meta | Para WhatsApp |
| `LANGFLOW_API_URL` | URL do Langflow | Para AI |

---

## 🧠 Langflow Integration {#langflow}

### Opção 1: Langflow no Railway (Recomendado)

O `railway.toml` já inclui o serviço Langflow. Para ativar:

1. No Railway Dashboard, o serviço `langflow` será deployado automaticamente
2. Configure `LANGFLOW_API_URL` para a URL do serviço
3. Acesse o Langflow UI e crie seus flows

### Opção 2: Langflow Externo

Se preferir usar Langflow hospedado externamente:

```env
LANGFLOW_API_URL=https://langflow.seu-dominio.com
LANGFLOW_API_KEY=sua-api-key
```

### Opção 3: Langflow Local (Docker)

```bash
# Já incluído no docker-compose.yml
docker-compose up -d langflow

# Acesse em http://localhost:7860
```

### Configurando Flows

1. Acesse o Langflow UI
2. Crie um novo flow para atendimento
3. Copie o Flow ID
4. Configure no Django Admin → CompanyProfile

---

## ⚙️ Celery Workers {#celery}

### Filas de Processamento

| Fila | Uso | Prioridade |
|------|-----|------------|
| `whatsapp` | Mensagens WhatsApp | Alta |
| `orders` | Pedidos | Alta |
| `payments` | Pagamentos | Alta |
| `langflow` | Processamento AI | Média |
| `automation` | Automações | Média |
| `campaigns` | Campanhas | Baixa |
| `messaging` | Mensageria unificada | Alta |
| `default` | Tarefas gerais | Normal |

### Monitoramento

```bash
# Ver status dos workers
docker-compose exec celery celery -A config.celery inspect active

# Limpar filas (cuidado!)
docker-compose exec celery celery -A config.celery purge

# Flower (monitoramento web)
docker-compose exec celery celery -A config.celery flower --port=5555
```

---

## 🐛 Troubleshooting {#troubleshooting}

### Erro: "Connection refused" ao Redis

```bash
# Verifique se o Redis está rodando
docker-compose ps redis

# Teste conexão
docker-compose exec web python -c "import redis; r = redis.from_url('redis://redis:6379'); print(r.ping())"
```

### Erro: "Static files not found"

```bash
# Regenerate static files
docker-compose exec web python manage.py collectstatic --noinput
```

### Erro: "Migrations pending"

```bash
# Run migrations
docker-compose exec web python manage.py migrate
```

### Erro: "Langflow not responding"

```bash
# Verifique logs
docker-compose logs -f langflow

# Reinicie
docker-compose restart langflow
```

### Railway: "Build failed"

```bash
# Verifique o Dockerfile
# Limpe cache do Railway
railway up --detach
```

---

## 📊 Health Checks

### Endpoints

- `/health/` - Health check básico
- `/api/v1/stores/stores/` - API check
- `/admin/` - Django Admin

### Comando de Verificação

```bash
# Local
curl http://localhost/api/v1/stores/stores/

# Railway
curl https://seu-app.up.railway.app/api/v1/stores/stores/
```

---

## 📝 Checklist de Deploy

- [ ] Configurar `DJANGO_SECRET_KEY` (mínimo 50 caracteres)
- [ ] Configurar `DJANGO_ALLOWED_HOSTS`
- [ ] Provisionar PostgreSQL no Railway
- [ ] Provisionar Redis no Railway
- [ ] Configurar `DATABASE_URL`
- [ ] Configurar `REDIS_URL` e `CELERY_BROKER_URL`
- [ ] Configurar integrações (MP, Resend, WhatsApp)
- [ ] Executar migrações
- [ ] Criar superusuário
- [ ] Configurar Langflow (interno ou externo)
- [ ] Testar webhooks
- [ ] Verificar logs

---

**Documentação gerada em:** 2026-02-02  
**Versão:** 1.0.0
