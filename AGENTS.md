# 🍝 Pastita Platform - Guia para Agentes de Código

> Arquivo de referência para agentes de IA desenvolvendo na plataforma Pastita.
> Leia este arquivo antes de fazer qualquer modificação no código.

---

## 📋 Visão Geral do Projeto

A **Plataforma Pastita** é um sistema completo de e-commerce para uma loja de massas artesanais, composto por 4 projetos integrados:

| Projeto | Tecnologia | Função | Porta |
|---------|-----------|--------|-------|
| `server/` | Django 4.2 + DRF | Backend API | 8000 |
| `pastita-3d/` | Next.js 15 + React 19 | Loja online (cliente) | 3000 |
| `pastita-dash/` | React 18 + TypeScript + Vite | Dashboard administrativo | 12001 |
| `pastita-app/` | React Native + Expo | App mobile (em desenvolvimento) | 19006 |

---

## 🏗️ Arquitetura de Integração

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  pastita-3d     │     │  pastita-dash   │     │  pastita-app    │
│  (Cliente)      │     │  (Admin)        │     │  (Mobile)       │
│  Porta: 3000    │     │  Porta: 12001   │     │  Porta: 19006   │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │ HTTP REST / WebSocket
                         ┌───────▼────────┐
                         │     server/    │
                         │   Django API   │
                         │   Porta: 8000  │
                         └───────┬────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
     ┌──────▼──────┐    ┌────────▼────────┐   ┌──────▼──────┐
     │ PostgreSQL  │    │     Redis       │   │ AWS S3      │
     │   (Dados)   │    │ (Cache/Fila)    │   │  (Imagens)  │
     └─────────────┘    └─────────────────┘   └─────────────┘
```

### Fluxo de Dados
- **Frontends** → Comunicam com backend via REST API (`/api/v1/`)
- **WebSocket** → Atualizações em tempo real (`/ws/`)
- **Webhooks** → Integrações externas (`/webhooks/`)

---

## 📁 Estrutura de Diretórios

```
/api/
├── server/                     # Backend Django
│   ├── apps/                   # Aplicações Django
│   │   ├── core/              # Autenticação, usuários, WebSocket
│   │   ├── stores/            # E-commerce (produtos, pedidos, checkout)
│   │   ├── whatsapp/          # Integração WhatsApp Business API
│   │   ├── instagram/         # Integração Instagram Messaging
│   │   ├── conversations/     # Histórico de conversas
│   │   ├── campaigns/         # Campanhas de marketing
│   │   ├── marketing/         # Email marketing (Resend)
│   │   ├── automation/        # Automação e triggers
│   │   ├── langflow/          # Integração IA/LLM
│   │   └── audit/             # Logging e auditoria
│   ├── config/                # Configurações Django
│   │   ├── settings/
│   │   │   ├── base.py       # Configurações base
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py           # Rotas principais
│   │   ├── asgi.py           # Configuração ASGI (WebSocket)
│   │   └── celery.py         # Configuração Celery
│   ├── domain/                # Lógica de domínio (Clean Architecture)
│   ├── infrastructure/        # Infraestrutura e adapters
│   ├── tests/                 # Testes
│   ├── requirements.txt       # Dependências Python
│   ├── docker-compose.yml     # Configuração Docker
│   └── Dockerfile
│
├── pastita-3d/                # Frontend Loja (Next.js)
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   │   ├── ui/           # Componentes base (Button, Input, etc)
│   │   │   └── checkout/     # Fluxo de checkout
│   │   ├── context/          # Contexts (Auth, Cart, Wishlist)
│   │   ├── pages/            # Páginas Next.js
│   │   ├── services/         # APIs e serviços
│   │   └── styles/           # CSS e estilos
│   ├── package.json
│   └── next.config.js
│
├── pastita-dash/              # Dashboard Admin (React + Vite)
│   ├── src/
│   │   ├── components/        # Componentes
│   │   │   ├── common/       # Button, Card, Modal, Input
│   │   │   ├── layout/       # Sidebar, Header, Layout
│   │   │   ├── chat/         # Componentes de chat
│   │   │   └── orders/       # OrdersKanban, etc
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── services/         # APIs (axios)
│   │   ├── stores/           # Zustand stores
│   │   ├── hooks/            # Custom hooks
│   │   ├── types/            # TypeScript types
│   │   └── context/          # React Contexts
│   ├── package.json
│   └── vite.config.ts
│
├── pastita-app/               # App Mobile (React Native)
│   ├── src/
│   ├── App.tsx
│   └── package.json
│
└── venv/                      # Ambiente virtual Python
```

---

## 🛠️ Stack Tecnológico

### Backend (server/)
- **Framework**: Django 4.2 + Django REST Framework
- **Autenticação**: Token Authentication (DRF)
- **Documentação API**: drf-spectacular (OpenAPI/Swagger)
- **Banco de Dados**: PostgreSQL (produção) / SQLite (dev)
- **Cache/Fila**: Redis + Celery
- **WebSocket**: Django Channels + Daphne
- **Task Queue**: Celery com múltiplas filas
- **Storage**: AWS S3 (opcional) ou filesystem

### Frontend Loja (pastita-3d/)
- **Framework**: Next.js 15 + React 19
- **Linguagem**: JavaScript (JSX)
- **Styling**: Tailwind CSS 4 + CSS Variables
- **Data Fetching**: SWR + Axios
- **Maps**: HERE Maps JavaScript API
- **Pagamentos**: Mercado Pago SDK

### Dashboard (pastita-dash/)
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3 + Material UI
- **State Management**: Zustand
- **Charts**: Chart.js + Recharts
- **Icons**: Heroicons + Lucide React

### Mobile (pastita-app/)
- **Framework**: React Native + Expo
- **Navegação**: React Navigation

---

## 🚀 Comandos de Desenvolvimento

### Backend (server/)

```bash
cd server/

# Ativar ambiente virtual (Windows)
..\venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Configurar ambiente
cp .env.example .env
# Editar .env com suas configurações

# Banco de dados
python manage.py migrate
python manage.py createsuperuser

# Servidor de desenvolvimento
python manage.py runserver

# Ou com ASGI (WebSocket)
daphne -b 0.0.0.0 -p 8000 config.asgi:application

# Workers Celery
 celery -A config.celery worker -l info -Q whatsapp,orders,payments,langflow,automation,campaigns

# Scheduler Celery
celery -A config.celery beat -l info

# Docker Compose (tudo em um comando)
docker-compose up -d
```

### Frontend Loja (pastita-3d/)

```bash
cd pastita-3d/

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env.local

# Desenvolvimento
npm run dev          # Porta 3000

# Build e produção
npm run build
npm run start
npm run lint
```

### Dashboard (pastita-dash/)

```bash
cd pastita-dash/

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env

# Desenvolvimento
npm run dev          # Porta 12001

# Build
npm run build

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

### Mobile (pastita-app/)

```bash
cd pastita-app/

# Instalar dependências
npm install

# Desenvolvimento
npm start           # Expo dev server
npm run android     # Android
npm run ios         # iOS
npm run web         # Web
```

---

## 🔧 Variáveis de Ambiente Essenciais

### Backend (.env)
```bash
# Django
DJANGO_SECRET_KEY=seu-secret-key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Banco de dados
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Redis
REDIS_URL=redis://localhost:6379/1
CELERY_BROKER_URL=redis://localhost:6379/0

# Integrações
MERCADO_PAGO_ACCESS_TOKEN=...
WHATSAPP_WEBHOOK_VERIFY_TOKEN=...
RESEND_API_KEY=...
HERE_API_KEY=...

# URLs
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
DASHBOARD_URL=http://localhost:12001
```

### Frontend Loja (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=...
NEXT_PUBLIC_HERE_API_KEY=...
```

### Dashboard (.env)
```bash
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
```

---

## 📡 Principais Endpoints da API

### Autenticação
- `POST /api/v1/auth/login/` - Login
- `POST /api/v1/auth/register/` - Registro
- `POST /api/v1/auth/logout/` - Logout
- `GET /api/v1/auth/user/` - Usuário atual

### Loja (Stores) - API Unificada
- `GET /api/v1/stores/{slug}/catalogo/` - Catálogo completo
- `GET /api/v1/stores/{slug}/produtos/` - Produtos
- `GET /api/v1/stores/{slug}/combos/` - Combos
- `POST /api/v1/stores/{slug}/carrinho/adicionar/` - Adicionar ao carrinho
- `POST /api/v1/stores/{slug}/checkout/` - Checkout
- `GET /api/v1/stores/{slug}/pedidos/` - Pedidos do usuário

### Admin (Dashboard)
- `GET /api/v1/stores/` - Lista de lojas (admin)
- `GET /api/v1/stores/orders/` - Todos os pedidos
- `GET /api/v1/stores/products/` - Gerenciamento de produtos
- `GET /api/v1/whatsapp/accounts/` - Contas WhatsApp
- `GET /api/v1/conversations/` - Conversas
- `GET /api/v1/marketing/campaigns/` - Campanhas de email
- `GET /api/v1/campaigns/` - Campanhas WhatsApp

### Webhooks (Públicos)
- `POST /webhooks/whatsapp/` - Webhooks do WhatsApp
- `POST /webhooks/payments/mercadopago/` - Webhooks Mercado Pago
- `POST /webhooks/automation/` - Webhooks de automação

### Documentação
- `/api/docs/` - Swagger UI
- `/api/redoc/` - ReDoc
- `/api/schema/` - OpenAPI Schema

---

## 📂 Organização de Código

### Backend - Padrões

1. **Apps Django**: Cada app em `apps/` tem responsabilidade única
2. **Models**: Definidos em `models/` com arquivos separados por domínio
3. **APIs**: Views em `api/views.py`, serializers em `api/serializers.py`
4. **Serviços**: Lógica de negócio em `services/`
5. **Webhooks**: Separados em `webhooks/` ou `webhooks_urls.py`

### Frontend - Padrões

1. **pastita-3d**: Organizado por feature
   - `components/` - Componentes reutilizáveis
   - `context/` - Estados globais (Auth, Cart, Wishlist)
   - `pages/` - Rotas do Next.js
   - `services/` - Chamadas à API

2. **pastita-dash**: Organizado por tipo
   - `components/common/` - UI base
   - `components/layout/` - Layout components
   - `pages/` - Páginas por feature
   - `stores/` - Zustand stores
   - `services/` - API clients
   - `types/` - TypeScript definitions

---

## 🧪 Testes

### Backend
```bash
cd server/
python manage.py test apps.stores
python manage.py test apps.whatsapp
python manage.py test
```

### Frontend
```bash
# pastita-3d
npm run lint
npm run build

# pastita-dash
npm run lint
npx tsc --noEmit
npm run build
```

---

## 🔄 Fluxo de Trabalho Git

1. **Branch principal**: `main`
2. **Branches de feature**: `feature/nome-descritivo`
3. **Commits**: Mensagens em português, descritivas
4. **Pull Requests**: Revisão obrigatória antes de merge

### Convenções de Commit
```
feat: adiciona novo componente de checkout
fix: corrige cálculo de frete
refactor: simplifica lógica de autenticação
docs: atualiza documentação da API
```

---

## 🎨 Guia de Estilo

### Python (Django)
- PEP 8 compliance
- Docstrings em português
- Type hints onde apropriado
- Máximo 100 caracteres por linha
- Imports ordenados: stdlib → third-party → local

### JavaScript/TypeScript
- ESLint configurado em cada projeto
- Preferir `const`/`let` ao invés de `var`
- Arrow functions para callbacks
- Async/await para operações assíncronas
- Componentes funcionais com hooks

### CSS/Tailwind
- Usar classes utilitárias do Tailwind
- Variáveis CSS para cores da marca
- Mobile-first approach
- BEM naming para CSS customizado

---

## 🔐 Segurança

### Requisitos Obrigatórios
1. **Nunca commitar secrets**: Usar variáveis de ambiente
2. **CORS**: Configurar origins permitidas
3. **Rate Limiting**: Habilitado em produção
4. **Validação de entrada**: Sanitizar todos os inputs
5. **SQL Injection**: Usar ORM, nunca queries raw com concatenação

### Configurações de Produção
```python
# settings/production.py
DEBUG = False
ALLOWED_HOSTS = ['dominio.com']
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
```

---

## 🐛 Debugging

### Backend
```python
# Adicionar logs
import logging
logger = logging.getLogger(__name__)
logger.debug(f"Valor: {valor}")
```

### Frontend
```javascript
// React DevTools instalado
// Console para debugging
console.log('[Componente]', dados);

// React Query DevTools (se usar)
```

### WebSocket
- Testar conexão em `/ws/`
- Verificar logs do Daphne
- Inspecionar mensagens no DevTools → Network → WS

---

## 📚 Documentação Adicional

- `API_ENDPOINTS.md` - Referência completa de endpoints
- `PASTITA_GUIA_COMPLETO.md` - Guia detalhado da plataforma
- `PASTITA_ARQUITETURA.md` - Diagramas técnicos
- `PASTITA_MAPA_NAVEGACAO.md` - Mapa de navegação rápida
- `PASTITA_CHEATSHEET.md` - Referência rápida
- `tom.yml` - Configuração MCP Codex

---

## ⚠️ Cuidados Especiais

1. **Migrações Django**: Sempre verificar conflitos antes de aplicar
2. **Webhooks**: Meta envia sem trailing slash - rotas configuradas para ambos
3. **Celery**: Workers devem ser reiniciados após mudanças de código
4. **WebSocket**: Conexões precisam de autenticação via token
5. **Mercado Pago**: Webhooks de produção são diferentes de sandbox

---

## 📞 Contatos e Suporte

- **Documentação técnica**: Arquivos `PASTITA_*.md` na raiz
- **Configurações**: Arquivo `tom.yml` para MCP Codex
- **Issues**: Verificar `PLANEJAMENTO.md` e `CORRECOES_IMPLEMENTADAS.md`

---

**Última atualização**: Janeiro 2026
**Versão**: 1.0.0
**Idioma principal**: Português (código e documentação)
