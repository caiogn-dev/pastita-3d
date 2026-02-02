# 🍝 PASTITA PLATFORM - Documentação Completa

> **Data**: 11 de janeiro de 2026  
> **Última Atualização**: Análise completa e configuração MCP Codex  
> **Status**: ✅ Pronto para desenvolvimento

---

## 📑 Índice

1. [Visão Geral do Projeto](#visão-geral)
2. [Arquitetura da Plataforma](#arquitetura)
3. [Projetos Detalhados](#projetos)
4. [Guia de Setup](#setup)
5. [Fluxos de Trabalho](#workflows)
6. [Comandos Essenciais](#comandos)
7. [Integração MCP Codex](#mcp)

---

## 🎯 Visão Geral {#visão-geral}

### O que é PASTITA?

PASTITA é uma plataforma completa de **e-commerce para venda de massas artesanais** com as seguintes características:

- 🛍️ **Loja Online**: Interface moderna com catálogo de produtos, carrinho e checkout
- 📊 **Dashboard Administrativo**: Gestão de pedidos, análise de vendas e automação
- 🤖 **Backend Robusto**: API REST com integração de pagamentos, WhatsApp e IA
- 🎨 **Design 3D**: Visualização interativa dos produtos em 3D

### Tecnologias Principais

```
Frontend:
├── PASTITA-3D (Customer-facing)
│   └── Next.js 15 + React 19
└── PASTITA-DASH (Admin Dashboard)
    └── React 18 + TypeScript + Vite

Backend:
└── SERVER-MAIN
    └── Django REST Framework (Python 3.11+)

Integrações:
├── Mercado Pago (Pagamentos)
├── WhatsApp Business (Comunicação)
├── Langflow (IA/Automação)
├── Resend (Email)
└── AWS S3 (Armazenamento)
```

---

## 🏗️ Arquitetura da Plataforma {#arquitetura}

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PASTITA PLATFORM                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐                          ┌──────────────┐          │
│  │ PASTITA-3D   │                          │ PASTITA-DASH │          │
│  │ (Customer)   │──────────────────────────│ (Admin)      │          │
│  │              │      HTTP REST           │              │          │
│  │ Next.js 15   │      WebSocket           │ React 18     │          │
│  └──────────────┘                          └──────────────┘          │
│        │                                           │                  │
│        └───────────────────┬───────────────────────┘                 │
│                            │                                          │
│                    ┌───────▼────────┐                                │
│                    │  SERVER-MAIN   │                                │
│                    │  (Backend API)  │                                │
│                    │                 │                                │
│                    │ Django REST     │                                │
│                    │ Framework       │                                │
│                    └─────┬───────────┘                                │
│                          │                                            │
│        ┌─────────────────┼─────────────────┬──────────────┐          │
│        │                 │                 │              │          │
│   ┌────▼────┐    ┌──────▼──────┐   ┌─────▼─────┐   ┌────▼───┐      │
│   │  ecommerce  │    │  orders   │   │ WhatsApp  │   │ payments │     │
│   │  (Product)  │    │ (Delivery)│   │(Messages) │   │(Mercado) │     │
│   └────────┘    └──────────────┘   └───────────┘   └──────────┘     │
│                                                                       │
│        ┌──────────────────────────────────────────────────────┐      │
│        │         EXTERNAL INTEGRATIONS                        │      │
│        ├──────────────────────────────────────────────────────┤      │
│        │ • Mercado Pago (Payments)                           │      │
│        │ • WhatsApp Business API (Communication)             │      │
│        │ • Langflow (LLM Automation)                         │      │
│        │ • Resend (Email Notifications)                      │      │
│        │ • HERE Maps (Delivery Zones)                        │      │
│        │ • AWS S3 (File Storage)                             │      │
│        └──────────────────────────────────────────────────────┘      │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

```
1. CHECKOUT FLOW:
   Customer → PASTITA-3D → SERVER-MAIN → Mercado Pago → ORDER CREATED
   
2. ORDER FULFILLMENT:
   ORDER CREATED → PASTITA-DASH (Admin) → SERVER-MAIN → DELIVERY TEAM
   
3. CUSTOMER COMMUNICATION:
   ORDER UPDATES → SERVER-MAIN → WhatsApp → CUSTOMER
   
4. AUTOMATION:
   MESSAGE RECEIVED → SERVER-MAIN → Langflow (LLM) → AUTO-RESPONSE
```

---

## 📦 Projetos Detalhados {#projetos}

### 1️⃣ PASTITA-3D (Frontend - Loja Online)

**Local**: `pastita-3d/`  
**Framework**: Next.js 15 + React 19  
**Porta**: 3000 (dev) / 3000 (prod)

#### Estrutura de Pastas

```
pastita-3d/
├── src/
│   ├── components/              # Componentes reutilizáveis
│   │   ├── Navbar.jsx           # Navegação principal
│   │   ├── CartSidebar.jsx      # Carrinho lateral
│   │   ├── LoginModal.jsx       # Modal de autenticação
│   │   ├── ProductFilters.jsx   # Filtros do catálogo
│   │   ├── OrderTimeline.jsx    # Timeline de pedidos
│   │   └── ...                  # Outros componentes
│   ├── context/                 # Context API providers
│   │   ├── AuthContext.jsx      # Estado de autenticação
│   │   ├── CartContext.jsx      # Estado do carrinho
│   │   └── WishlistContext.jsx  # Favoritos
│   ├── pages/                   # Páginas principais
│   │   ├── index.jsx            # Landing page
│   │   ├── cardapio.jsx         # Catálogo de produtos
│   │   ├── checkout.jsx         # Checkout
│   │   ├── login.jsx            # Login
│   │   ├── perfil.jsx           # Perfil do usuário
│   │   └── ...
│   ├── services/                # Chamadas à API
│   │   ├── api.js               # Config Axios
│   │   ├── auth.js              # Autenticação
│   │   ├── ecommerce.js         # Produtos e carrinho
│   │   └── orders.js            # Pedidos
│   ├── hooks/                   # Custom hooks
│   │   ├── useAuth.js           # Autenticação
│   │   ├── useCart.js           # Carrinho
│   │   └── useFetch.js          # Fetching de dados
│   ├── styles/                  # Estilos CSS
│   │   ├── global.css           # Estilos globais
│   │   └── variables.css        # CSS variables
│   └── index.css                # Estilos raiz
├── pages/                       # Next.js routing (wrappers)
├── public/                      # Arquivos estáticos
├── package.json                 # Dependências
├── next.config.js               # Configuração Next.js
├── tailwind.config.js           # Configuração Tailwind
└── vercel.json                  # Configuração Vercel
```

#### Fluxos Principais

**Autenticação**:
```
Usuário acessa /cardapio (público)
  ↓
Clica em "Adicionar ao Carrinho"
  ↓
LoginModal aparece (se não autenticado)
  ↓
Insere credenciais
  ↓
Token salvo em cookie + Context
  ↓
Produto adicionado ao carrinho automaticamente
```

**Checkout**:
```
Usuário clica "Finalizar Compra"
  ↓
Valida itens do carrinho
  ↓
Seleciona zona de entrega
  ↓
Calcula frete
  ↓
Envia para /api/ecommerce/checkout/create_checkout/
  ↓
Redireciona para Mercado Pago
  ↓
Pagamento confirmado
  ↓
Redireciona para página de sucesso
```

#### Variáveis de Ambiente

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=YOUR_PUBLIC_KEY
NEXT_PUBLIC_AUTH_COOKIE_NAME=auth_token
```

---

### 2️⃣ PASTITA-DASH (Frontend - Admin Dashboard)

**Local**: `pastita-dash/`  
**Framework**: React 18 + TypeScript + Vite  
**Porta**: 12001 (dev) / 12001 (prod)

#### Estrutura de Pastas

```
pastita-dash/
├── src/
│   ├── components/              # Componentes React
│   │   ├── Layout/              # Header, Sidebar, Footer
│   │   ├── Charts/              # Gráficos de dados
│   │   ├── Tables/              # Tabelas de dados
│   │   ├── Forms/               # Formulários
│   │   └── Cards/               # Cartões de métrica
│   ├── pages/                   # Páginas principais
│   │   ├── Dashboard.tsx        # Dashboard principal
│   │   ├── Orders.tsx           # Gestão de pedidos
│   │   ├── Customers.tsx        # Clientes
│   │   ├── Analytics.tsx        # Análises
│   │   ├── WhatsApp.tsx         # Integração WhatsApp
│   │   └── Settings.tsx         # Configurações
│   ├── services/                # Chamadas à API
│   │   ├── api.ts               # Config Axios
│   │   ├── orders.ts            # API de pedidos
│   │   ├── analytics.ts         # API de métricas
│   │   └── whatsapp.ts          # API WhatsApp
│   ├── stores/                  # Zustand stores
│   │   ├── authStore.ts         # Autenticação
│   │   ├── orderStore.ts        # Estado de pedidos
│   │   └── analyticsStore.ts    # Estado de métricas
│   ├── hooks/                   # Custom hooks
│   │   ├── useApi.ts            # Fetching de dados
│   │   ├── useAuth.ts           # Autenticação
│   │   └── useFilters.ts        # Gerenciamento de filtros
│   ├── types/                   # Tipos TypeScript
│   │   ├── api.ts               # Tipos de API
│   │   ├── models.ts            # Modelos de domínio
│   │   └── filters.ts           # Tipos de filtros
│   ├── styles/                  # Estilos
│   ├── App.tsx                  # Componente raiz
│   ├── main.tsx                 # Entry point
│   └── index.css                # Estilos globais
├── public/                      # Arquivos estáticos
├── package.json                 # Dependências
├── vite.config.ts               # Configuração Vite
├── tsconfig.json                # Configuração TypeScript
└── tailwind.config.js           # Configuração Tailwind
```

#### Painéis Disponíveis

1. **Dashboard Principal**: Resumo de vendas, pedidos, clientes
2. **Gestão de Pedidos**: Status, timeline, entregas
3. **Análise de Clientes**: Comportamento, segmentação
4. **Relatórios**: Receita, produtos mais vendidos
5. **WhatsApp**: Gerenciar conversas e automação
6. **Configurações**: Preferências da plataforma

#### Variáveis de Ambiente

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
VITE_ENV=development
```

---

### 3️⃣ SERVER-MAIN (Backend - Django API)

**Local**: `server-main/`  
**Framework**: Django 4.2 + Django REST Framework  
**Porta**: 8000 (dev) / 8000 (prod)

#### Estrutura de Aplicações

```
server-main/
├── apps/
│   ├── core/                    # Autenticação, usuários, permissões
│   │   ├── models.py            # User, Company, Settings
│   │   ├── views.py             # Autenticação, perfil
│   │   └── serializers.py       # Serializadores
│   │
│   ├── ecommerce/               # Lógica de vendas
│   │   ├── models.py            # Product, Category, Cart, Order
│   │   ├── views.py             # CRUD de produtos
│   │   ├── serializers.py       # Serializadores
│   │   └── filters.py           # Filtros de busca
│   │
│   ├── orders/                  # Gestão de pedidos
│   │   ├── models.py            # Order, OrderItem, Delivery
│   │   ├── views.py             # Ciclo de vida do pedido
│   │   ├── signals.py           # Gatilhos automáticos
│   │   └── tasks.py             # Tarefas Celery
│   │
│   ├── payments/                # Processamento de pagamentos
│   │   ├── models.py            # Payment, Transaction
│   │   ├── views.py             # Webhook handlers
│   │   ├── integrations.py      # Mercado Pago API
│   │   └── tasks.py             # Tarefas de pagamento
│   │
│   ├── whatsapp/                # Integração WhatsApp
│   │   ├── models.py            # Message, Contact, Account
│   │   ├── views.py             # Webhook receivers
│   │   ├── services.py          # Lógica de envio
│   │   └── tasks.py             # Tarefas async
│   │
│   ├── notifications/           # Notificações por email
│   │   ├── models.py            # Notification, Email
│   │   ├── services.py          # Resend integration
│   │   ├── templates/           # Templates de email
│   │   └── tasks.py             # Tarefas de envio
│   │
│   ├── automation/              # Automação com Langflow
│   │   ├── models.py            # Campaign, Trigger, Action
│   │   ├── services.py          # Langflow integration
│   │   └── tasks.py             # Execução de workflows
│   │
│   ├── langflow/                # Camada de IA
│   │   ├── client.py            # Cliente Langflow
│   │   ├── chains.py            # Chains customizadas
│   │   └── agents.py            # Agentes IA
│   │
│   ├── conversations/           # Histórico de conversas
│   │   ├── models.py            # Conversation, Message
│   │   └── serializers.py       # Serializadores
│   │
│   ├── campaigns/               # Campanhas de marketing
│   │   ├── models.py            # Campaign, Segment
│   │   ├── views.py             # CRUD de campanhas
│   │   └── analytics.py         # Métricas
│   │
│   └── audit/                   # Auditoria e logs
│       ├── models.py            # AuditLog
│       ├── middleware.py        # Captura de ações
│       └── signals.py           # Gatilhos de log
│
├── config/                      # Configurações Django
│   ├── settings/                # Configurações por ambiente
│   │   ├── base.py              # Comum
│   │   ├── development.py       # Dev
│   │   └── production.py        # Prod
│   ├── urls.py                  # Rotas principais
│   ├── asgi.py                  # WebSocket
│   ├── wsgi.py                  # Produção
│   └── celery.py                # Configuração de tasks
│
├── domain/                      # Lógica de domínio (Clean Architecture)
│   ├── entities/                # Modelos de domínio
│   ├── events/                  # Eventos de domínio
│   └── use_cases/               # Casos de uso
│
├── infrastructure/              # Integrações externas
│   ├── external_apis/
│   │   ├── mercadopago.py       # Pagamentos
│   │   ├── whatsapp.py          # WhatsApp
│   │   ├── langflow.py          # IA
│   │   ├── resend.py            # Email
│   │   └── here_maps.py         # Mapas
│   └── messaging/
│       ├── celery_config.py     # Task queue
│       └── redis_client.py      # Cache
│
├── tests/                       # Testes
│   ├── test_ecommerce_api.py
│   ├── test_orders_api.py
│   ├── test_payments.py
│   └── test_whatsapp_integration.py
│
├── manage.py                    # CLI Django
├── requirements.txt             # Dependências Python
├── Dockerfile                   # Containerização
├── docker-compose.yml           # Orquestração
└── .env.example                 # Variáveis de exemplo
```

#### Endpoints Principais

**Autenticação**:
```
POST   /api/v1/auth/login/
POST   /api/v1/auth/register/
POST   /api/v1/auth/logout/
GET    /api/v1/users/profile/
PUT    /api/v1/users/profile/
POST   /api/v1/auth/password-reset/
```

**E-commerce**:
```
GET    /api/v1/stores/{store_slug}/catalog/
GET    /api/v1/stores/{store_slug}/catalog/{product_id}/
GET    /api/v1/stores/{store_slug}/cart/
POST   /api/v1/stores/{store_slug}/cart/add/
POST   /api/v1/stores/{store_slug}/checkout/
GET    /api/v1/stores/orders/by-token/{token}/
```

**Pedidos**:
```
GET    /api/v1/orders/
GET    /api/v1/orders/{id}/
POST   /api/v1/orders/{id}/cancel/
GET    /api/v1/orders/{id}/tracking/
```

**Pagamentos**:
```
POST   /api/v1/payments/webhook/mercadopago/
GET    /api/v1/payments/{id}/status/
```

**WhatsApp**:
```
GET    /api/v1/whatsapp/messages/
POST   /api/v1/whatsapp/send/
GET    /api/v1/whatsapp/conversations/
POST   /api/v1/whatsapp/webhook/
```

#### Variáveis de Ambiente

```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3  # ou PostgreSQL em prod
REDIS_URL=redis://localhost:6379/0
ALLOWED_HOSTS=localhost,127.0.0.1

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=your-token

# WhatsApp
WHATSAPP_BUSINESS_ACCOUNT_ID=your-account-id
WHATSAPP_API_TOKEN=your-api-token

# Langflow
LANGFLOW_API_URL=http://localhost:7860
LANGFLOW_API_KEY=your-api-key

# Resend (Email)
RESEND_API_KEY=your-api-key

# AWS S3
AWS_S3_BUCKET_NAME=your-bucket
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:12001
```

---

## 🚀 Guia de Setup {#setup}

### Pré-requisitos

```bash
# Node.js 18+
node --version

# Python 3.11+
python --version

# PostgreSQL 15+ (opcional para prod)
psql --version

# Redis 7+
redis-cli --version

# Docker (recomendado)
docker --version
```

### Setup PASTITA-3D

```bash
cd pastita-3d

# 1. Instalar dependências
npm install

# 2. Criar arquivo .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=your-key
NEXT_PUBLIC_AUTH_COOKIE_NAME=auth_token
EOF

# 3. Executar dev server
npm run dev

# Acessa em: http://localhost:3000
```

### Setup PASTITA-DASH

```bash
cd pastita-dash

# 1. Instalar dependências
npm install

# 2. Criar arquivo .env.local
cat > .env.local << EOF
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
EOF

# 3. Executar dev server
npm run dev

# Acessa em: http://localhost:12001
```

### Setup SERVER-MAIN

```bash
cd server-main

# 1. Criar virtual environment
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# 2. Instalar dependências
pip install -r requirements.txt

# 3. Criar .env
cp .env.example .env
# Editar .env com suas credenciais

# 4. Executar migrações
python manage.py migrate

# 5. Criar superusuário
python manage.py createsuperuser

# 6. Executar dev server
python manage.py runserver

# Acessa em: http://localhost:8000
# Admin em: http://localhost:8000/admin
# API Docs em: http://localhost:8000/api/docs

# 7. Em OUTRO TERMINAL - Celery Worker
celery -A config worker -l info

# 8. Em OUTRO TERMINAL - Celery Beat (scheduler)
celery -A config beat -l info
```

### Setup com Docker

```bash
# Build das imagens
docker-compose build

# Iniciar contêineres
docker-compose up -d

# Aplicar migrações
docker-compose exec web python manage.py migrate

# Criar superusuário
docker-compose exec web python manage.py createsuperuser

# Parar contêineres
docker-compose down
```

---

## 🔄 Fluxos de Trabalho {#workflows}

### Workflow: Nova Funcionalidade

```
1. Criar branch
   git checkout -b feature/nova-funcionalidade

2. Design/Planejamento
   - Esboçar interfaces (se frontend)
   - Definir endpoints (se backend)
   - Documentar fluxo

3. Implementação
   - Criar componentes/models
   - Implementar lógica
   - Escrever testes

4. Testes Locais
   - Executar testes unitários
   - Testar manualmente
   - Validar integração

5. Commit e Push
   git add .
   git commit -m "feat: descrever funcionalidade"
   git push origin feature/nova-funcionalidade

6. Pull Request
   - Descrever mudanças
   - Apontar para issues
   - Pedir revisão

7. Code Review
   - Revisar alterações
   - Pedir ajustes se necessário

8. Merge
   git merge feature/nova-funcionalidade
   git push origin main
```

### Workflow: Bug Fix

```
1. Criar issue descrevendo bug
   - Passo a passo para reproduzir
   - Comportamento esperado vs atual
   - Screenshots/logs

2. Criar branch
   git checkout -b fix/bug-description

3. Reproduzir localmente
   - Executar passos do bug
   - Validar que é reproduzível

4. Implementar fix
   - Investigar causa raiz
   - Implementar solução
   - Adicionar testes se necessário

5. Testar
   - Confirmar que bug foi resolvido
   - Verificar se não quebrou outras coisas

6. Commit
   git commit -m "fix: descrever solução"

7. PR e merge (como acima)
```

### Workflow: Deploy para Produção

```
PASTITA-3D (Next.js → Vercel):
  1. Merge no branch main
  2. Vercel auto-deploya
  3. Validar em https://pastita-3d.vercel.app

PASTITA-DASH (React → Vercel/Docker):
  1. Build: npm run build
  2. Test: npm run lint
  3. Push imagem Docker se usando Docker
  4. Deploy via Vercel ou Kubernetes

SERVER-MAIN (Django → Railway/Docker):
  1. Merge no branch main
  2. Push Docker image
  3. Run migrations: python manage.py migrate
  4. Start workers: celery worker + beat
  5. Validar endpoints em produção
```

---

## ⌨️ Comandos Essenciais {#comandos}

### Frontend (PASTITA-3D & PASTITA-DASH)

```bash
# Instalar dependências
npm install

# Executar dev server
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Linting de código
npm run lint

# Formatar código (se tiver prettier)
npm run format
```

### Backend (SERVER-MAIN)

```bash
# Ativar virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Instalar dependências
pip install -r requirements.txt

# Migrações
python manage.py makemigrations
python manage.py migrate
python manage.py migrate --fake initial  # Para migração zerada

# Usuários
python manage.py createsuperuser

# Shell Django (REPL)
python manage.py shell

# Executar servidor
python manage.py runserver

# Rodas testes
python manage.py test
pytest

# Coletar arquivos estáticos
python manage.py collectstatic --noinput

# Criar dump do banco
python manage.py dumpdata > backup.json

# Restaurar banco
python manage.py loaddata backup.json
```

### Celery (Task Queue)

```bash
# Worker (processa tasks)
celery -A config worker -l info

# Worker com múltiplas filas
celery -A config worker -l info -Q automation,whatsapp,orders,payments

# Beat scheduler (executa tasks agendadas)
celery -A config beat -l info

# Monitorar tasks em tempo real
celery -A config events

# Limpar fila
celery -A config purge
```

### Database

```bash
# Acessar PostgreSQL
psql -U postgres -d pastita

# Backup
pg_dump -U postgres pastita > backup.sql

# Restaurar
psql -U postgres pastita < backup.sql

# Redis CLI
redis-cli

# Limpar todos os dados Redis
redis-cli FLUSHALL
```

### Docker

```bash
# Build
docker-compose build

# Iniciar (background)
docker-compose up -d

# Parar
docker-compose down

# Logs
docker-compose logs -f [serviço]

# Executar comando
docker-compose exec web python manage.py migrate

# Remover volumes
docker-compose down -v
```

---

## 🤖 Integração MCP Codex {#mcp}

### O que é MCP Codex?

MCP (Model Context Protocol) Codex é um protocolo que permite que modelos de IA como Claude naveguem, entendam e gerem código para seus projetos de forma inteligente.

### Arquivo tom.yml

O arquivo **`tom.yml`** (criado na raiz do projeto) contém:

- ✅ Estrutura completa de todos os 3 projetos
- ✅ Definição de ferramentas (code generation, testing, deployment)
- ✅ Padrões de código e conventions
- ✅ Fluxos de trabalho recomendados
- ✅ Integração com serviços externos
- ✅ Comandos de desenvolvimento
- ✅ Guias de deploy e testes

### Como usar com Copilot/Claude

```
1. Certifique-se que tom.yml está na raiz: /api/tom.yml

2. Faça perguntas específicas:
   ✅ "Cria um novo componente React para exibir produtos"
   ✅ "Gera um novo endpoint Django para listar pedidos"
   ✅ "Cria testes para o componente CartSidebar"
   ✅ "Deploy a aplicação para produção"

3. O MCP Codex vai:
   - Ler tom.yml
   - Entender estrutura dos projetos
   - Gerar código seguindo as conventions
   - Sugerir melhorias baseado em best practices
   - Criar testes automaticamente
   - Gerar documentação
```

### Ferramentas Disponíveis

**Code Generation**:
```
- Generate React Component
- Generate API Endpoint  
- Generate Database Model
- Generate Test Suite
```

**Project Management**:
```
- Analyze Project Structure
- Dependency Audit
- Code Quality Report
- Generate Migration Guide
```

**Documentation**:
```
- Generate API Documentation
- Generate Component Documentation
- Generate Architecture Diagram
- Generate Setup Instructions
```

**Deployment**:
```
- Generate Docker Configuration
- Generate CI/CD Pipeline
- Generate Environment Config
```

---

## 📝 Checklist para Novo Desenvolvedor

- [ ] Clonar repositório
- [ ] Instalar Node.js 18+
- [ ] Instalar Python 3.11+
- [ ] Instalar PostgreSQL e Redis (opcional)
- [ ] Setup PASTITA-3D (`npm install && npm run dev`)
- [ ] Setup PASTITA-DASH (`npm install && npm run dev`)
- [ ] Setup SERVER-MAIN (`pip install -r requirements.txt && python manage.py runserver`)
- [ ] Criar arquivos `.env` com credenciais
- [ ] Testar acesso a http://localhost:3000
- [ ] Testar acesso a http://localhost:12001
- [ ] Testar acesso a http://localhost:8000
- [ ] Revisar tom.yml
- [ ] Ler documentação de integração (Mercado Pago, WhatsApp, etc)
- [ ] Fazer primeiro PR com uma pequena mudança

---

## 🆘 Troubleshooting

### "Port already in use"
```bash
# Encontrar processo usando a porta
lsof -i :3000      # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Matar processo
kill -9 <PID>      # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### "ModuleNotFoundError: No module named 'config'"
```bash
# Garantir que está no diretório correto
cd server-main

# Ativar venv
source venv/bin/activate

# Reinstalar dependências
pip install -r requirements.txt
```

### "CORS error"
```
Verificar CORS_ALLOWED_ORIGINS em server-main/.env
Deve incluir: http://localhost:3000,http://localhost:12001
```

### "Database connection refused"
```bash
# Verificar se PostgreSQL está rodando
psql --version

# Para SQLite em dev, remover db.sqlite3 e recriar
rm db.sqlite3
python manage.py migrate
```

---

## 📚 Recursos Úteis

- [Next.js Docs](https://nextjs.org/docs)
- [Django REST Framework](https://www.django-rest-framework.org)
- [Mercado Pago SDK](https://github.com/mercadopago/sdk-python)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Langflow Documentation](https://docs.langflow.org)
- [Redis Documentation](https://redis.io/docs)
- [Celery Documentation](https://docs.celeryproject.io)

---

**Última atualização**: 11 de janeiro de 2026  
**Mantido por**: Pastita Team  
**Status**: ✅ Ativo e Completo
