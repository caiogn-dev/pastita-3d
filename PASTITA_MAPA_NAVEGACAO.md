# 🗺️ PASTITA Platform - Mapa de Navegação & Quick Reference

> Guia rápido para navegar e entender os 3 projetos

---

## 📍 Estrutura de Diretórios

```
/api (raiz do repositório)
│
├── 🍝 tom.yml                          ← CONFIGURAÇÃO MCP CODEX (COMECE AQUI!)
├── 📖 PASTITA_GUIA_COMPLETO.md        ← DOCUMENTAÇÃO COMPLETA
├── 🗺️ PASTITA_MAPA_NAVEGACAO.md       ← ESTE ARQUIVO
│
├── 📁 pastita-3d/                      ← FRONTEND LOJA ONLINE
│   ├── src/
│   │   ├── 🎨 components/             # Componentes reutilizáveis
│   │   ├── 🔄 context/                # Auth, Cart, Wishlist state
│   │   ├── 📄 pages/                  # Páginas principais
│   │   ├── 🔌 services/               # Integração com API
│   │   ├── 🪝 hooks/                  # Custom hooks
│   │   ├── 🎭 styles/                 # CSS e estilos globais
│   │   └── 🛠️ utils/                  # Funções auxiliares
│   ├── 📦 pages/                      # Next.js routing (wrappers)
│   ├── 🌐 public/                     # Arquivos estáticos
│   ├── 📋 package.json                # Dependências Node
│   ├── ⚙️ next.config.js              # Configuração Next.js
│   └── 🎨 tailwind.config.js          # Configuração Tailwind
│
├── 📁 pastita-dash/                    ← FRONTEND DASHBOARD ADMIN
│   ├── src/
│   │   ├── 🎨 components/             # Componentes React
│   │   ├── 📄 pages/                  # Páginas dashboard
│   │   ├── 🔌 services/               # Chamadas API
│   │   ├── 📦 stores/                 # Zustand state management
│   │   ├── 🪝 hooks/                  # Custom hooks
│   │   ├── 📝 types/                  # Tipos TypeScript
│   │   ├── 🎭 styles/                 # Estilos Tailwind
│   │   ├── App.tsx                    # Raiz app
│   │   ├── main.tsx                   # Entry point
│   │   └── index.css                  # Estilos globais
│   ├── 🌐 public/                     # Arquivos estáticos
│   ├── 📋 package.json                # Dependências Node
│   ├── ⚙️ vite.config.ts              # Configuração Vite
│   └── 🔤 tsconfig.json               # Configuração TypeScript
│
├── 📁 server/                     ← BACKEND DJANGO API
│   ├── apps/
│   │   ├── 🔐 core/                   # Autenticação & usuários
│   │   ├── 🛒 stores/              # Produtos, carrinho, checkout
│   │   ├── 📦 orders/                 # Pedidos e entregas
│   │   ├── 💳 payments/               # Integração Mercado Pago
│   │   ├── 💬 whatsapp/               # Integração WhatsApp
│   │   ├── 📧 notifications/          # Emails (Resend)
│   │   ├── 🤖 automation/             # Automação com Langflow
│   │   ├── 🧠 langflow/               # Layer de IA
│   │   ├── 💭 conversations/          # Histórico de conversas
│   │   ├── 📢 campaigns/              # Campanhas marketing
│   │   └── 📋 audit/                  # Auditoria & logs
│   ├── ⚙️ config/                     # Configurações Django
│   │   ├── settings/                  # base, development, production
│   │   ├── urls.py                    # Rotas principais
│   │   └── celery.py                  # Task queue
│   ├── 🏗️ domain/                     # Lógica de negócio (Clean Arch)
│   ├── 🔌 infrastructure/             # Integrações externas
│   ├── 🧪 tests/                      # Testes da API
│   ├── 📋 requirements.txt            # Dependências Python
│   ├── 🐳 Dockerfile                  # Containerização
│   ├── 🐳 docker-compose.yml          # Orquestração
│   └── manage.py                      # CLI Django
│
└── 📁 pastita-app/                     ← MOBILE APP (React Native)
    ├── src/
    ├── assets/
    └── package.json
```

---

## 🎯 Rotas & URLs

### PASTITA-3D (Frontend)

| Rota | Componente | Descrição | Auth |
|------|-----------|-----------|------|
| `/` | LandingPage | Página inicial | ❌ |
| `/cardapio` | Cardapio | Catálogo de produtos | ❌ |
| `/login` | Login | Autenticação | ❌ |
| `/registro` | Register | Novo usuário | ❌ |
| `/checkout` | Checkout | Finalizar compra | ✅ |
| `/perfil` | Profile | Meu perfil | ✅ |
| `/pendente` | Pending | Pedidos em progresso | ✅ |
| `/sucesso` | Success | Pedido confirmado | ✅ |
| `/erro` | Error | Erro genérico | ❌ |

### PASTITA-DASH (Frontend)

| Rota | Página | Descrição | Role |
|------|--------|-----------|------|
| `/` | Dashboard | Dashboard principal | Admin |
| `/orders` | Orders | Gestão de pedidos | Manager |
| `/customers` | Customers | Lista de clientes | Manager |
| `/analytics` | Analytics | Relatórios | Analyst |
| `/whatsapp` | WhatsApp | Gerenciador de mensagens | Operator |
| `/campaigns` | Campaigns | Campanhas marketing | Manager |
| `/settings` | Settings | Configurações | Admin |
| `/users` | Users | Gestão de usuários | Admin |

### SERVER-MAIN (Backend) - Principais Endpoints

#### Authentication
```
POST   /api/v1/auth/login/              # Fazer login
POST   /api/v1/auth/register/           # Criar conta
POST   /api/v1/auth/logout/             # Sair
POST   /api/v1/auth/refresh/            # Renovar token
POST   /api/v1/auth/password-reset/     # Reset de senha
```

#### Loja unificada via /stores
```
GET    /api/v1/stores/{store_slug}/catalog/           # Lista catálogo público
GET    /api/v1/stores/{store_slug}/cart/              # Carrinho por loja
POST   /api/v1/stores/{store_slug}/cart/add/          # Adicionar produto ao carrinho
POST   /api/v1/stores/{store_slug}/cart/clear/        # Limpar carrinho
POST   /api/v1/stores/{store_slug}/checkout/          # Criar checkout e iniciar pagamento
GET    /api/v1/stores/orders/by-token/{token}/          # Consultar pedido público
POST   /api/v1/stores/{store_slug}/validate-coupon/   # Validar cupom
POST   /api/v1/stores/{store_slug}/validate-delivery/ # Validar endereço por coordenadas
GET    /api/v1/stores/{store_slug}/delivery-zones/    # Delivery zones / isolines
```

#### Orders
```
GET    /api/v1/orders/                   # Meus pedidos
GET    /api/v1/orders/{id}/              # Detalhes do pedido
POST   /api/v1/orders/{id}/cancel/       # Cancelar pedido
GET    /api/v1/orders/{id}/tracking/     # Rastreamento
GET    /api/v1/orders/{id}/invoice/      # Nota fiscal
```

#### Payments
```
POST   /api/v1/payments/webhook/mercadopago/  # Webhook Mercado Pago
GET    /api/v1/payments/{id}/status/          # Status pagamento
```

#### WhatsApp
```
GET    /api/v1/whatsapp/messages/             # Listar mensagens
POST   /api/v1/whatsapp/send/                 # Enviar mensagem
GET    /api/v1/whatsapp/conversations/        # Conversas
POST   /api/v1/whatsapp/webhook/              # Webhook entrada
```

#### Users
```
GET    /api/v1/users/profile/            # Meu perfil
PUT    /api/v1/users/profile/            # Atualizar perfil
GET    /api/v1/users/addresses/          # Meus endereços
POST   /api/v1/users/addresses/          # Adicionar endereço
DELETE /api/v1/users/addresses/{id}/     # Remover endereço
GET    /api/v1/users/favorites/          # Meus favoritos
```

#### Admin Only
```
GET    /api/v1/admin/analytics/sales/         # Vendas
GET    /api/v1/admin/analytics/revenue/       # Receita
GET    /api/v1/admin/analytics/customers/     # Clientes
GET    /api/v1/admin/inventory/               # Inventário
PUT    /api/v1/admin/inventory/{id}/          # Atualizar stock
```

---

## 🔗 Fluxos de Dados Principais

### 1️⃣ Fluxo de Checkout

```
PASTITA-3D (Frontend)
    ↓
    [User clicks "Finalizar Compra"]
    ↓
    POST /api/v1/stores/checkout/create_checkout/
    ↓
SERVER-MAIN (Backend)
    ├── Validar carrinho
    ├── Calcular frete
    ├── Criar sessão de checkout
    └── Gerar QR code Mercado Pago
    ↓
    PASTITA-3D
    └── Redireciona para Mercado Pago
    ↓
    MERCADO PAGO
    ├── User paga (PIX/Boleto/Card)
    └── Webhook para /payments/webhook/mercadopago/
    ↓
    SERVER-MAIN
    ├── Verifica pagamento
    ├── Cria Order
    ├── Envia email de confirmação
    └── Notifica via WhatsApp
    ↓
    PASTITA-3D
    └── Redireciona para página de sucesso
```

### 2️⃣ Fluxo de Automação WhatsApp

```
CLIENTE envia mensagem
    ↓
    WHATSAPP BUSINESS API
    ├── Webhook para /whatsapp/webhook/
    ↓
SERVER-MAIN
    ├── Recebe mensagem
    ├── Analisa com Langflow LLM
    │   └── Entende intenção do cliente
    ├── Gera resposta automática
    └── Envia via WhatsApp
    ↓
CLIENTE recebe resposta automática
```

### 3️⃣ Fluxo de Admin Dashboard

```
PASTITA-DASH (Admin)
    ↓
    [Admin clica em "Pedidos"]
    ↓
    GET /api/v1/admin/orders/
    ↓
SERVER-MAIN (Backend)
    ├── Busca no banco de dados
    ├── Filtra por status/data
    └── Retorna lista paginada
    ↓
    PASTITA-DASH
    ├── Renderiza tabela
    ├── Mostra charts
    └── Permite ações (cancelar, mudar status, etc)
    ↓
    [Admin clica em "Mudar Status"]
    ↓
    PUT /api/v1/admin/orders/{id}/status/
    ↓
SERVER-MAIN
    ├── Valida permissões
    ├── Atualiza pedido
    ├── Cria auditoria
    ├── Notifica cliente via WhatsApp
    └── Retorna sucesso
```

---

## 🛠️ Arquivos Críticos por Projeto

### PASTITA-3D (Frontend)

**Arquivos mais importantes:**
- `src/context/AuthContext.jsx` - Autenticação global
- `src/context/CartContext.jsx` - Estado do carrinho
- `src/pages/Cardapio.jsx` - Página de produtos
- `src/pages/Checkout.jsx` - Checkout
- `src/services/api.js` - Configuração API
- `pastita-3d/src/services/api.ts` - Chamadas unificadas para /stores/
- `.env.local` - Variáveis de ambiente

**Componentes principais:**
- `Navbar.jsx` - Navegação
- `CartSidebar.jsx` - Carrinho lateral
- `LoginModal.jsx` - Modal de login
- `ProductFilters.jsx` - Filtros

### PASTITA-DASH (Frontend)

**Arquivos mais importantes:**
- `src/App.tsx` - Raiz da aplicação
- `src/stores/authStore.ts` - Autenticação (Zustand)
- `src/services/api.ts` - Configuração API
- `src/pages/Dashboard.tsx` - Dashboard principal
- `src/pages/Orders.tsx` - Gestão de pedidos
- `src/types/models.ts` - Tipos de dados
- `.env.local` - Variáveis de ambiente

**Componentes principais:**
- `Layout/Header.tsx` - Header
- `Layout/Sidebar.tsx` - Sidebar navegação
- `Charts/SalesChart.tsx` - Gráfico de vendas
- `Tables/OrdersTable.tsx` - Tabela de pedidos

### SERVER-MAIN (Backend)

**Arquivos mais importantes:**
- `config/settings/base.py` - Configurações Django
- `config/urls.py` - Rotas principais
- `apps/stores/api/views.py` - Endpoints do stores
- `apps/orders/models.py` - Modelo de pedidos
- `apps/payments/views.py` - Webhook de pagamentos
- `apps/whatsapp/views.py` - Webhook WhatsApp
- `config/celery.py` - Task queue
- `requirements.txt` - Dependências
- `.env` - Variáveis de ambiente

**Modelos (Models) importantes:**
- `core/models.py` - User, Company
- `stores/models.py` - Product, Cart, Order
- `orders/models.py` - Order, Delivery
- `payments/models.py` - Payment, Transaction
- `whatsapp/models.py` - Message, Conversation

---

## 🔄 Ciclo de Vida de um Pedido

```
1. NOVO PEDIDO
   Estado: pending_payment
   Ação: Aguardando pagamento
   Usuário vê: "Processando pagamento..."

2. PAGAMENTO CONFIRMADO (Webhook Mercado Pago)
   Estado: confirmed
   Ação: Email + WhatsApp enviados
   Usuário vê: "Pedido confirmado! ✓"

3. PREPARANDO (Admin muda status)
   Estado: preparing
   Ação: Notifica via WhatsApp
   Usuário vê: "Estamos preparando seu pedido"

4. PRONTO PARA ENTREGA
   Estado: ready_for_delivery
   Ação: Notifica entregador
   Usuário vê: "Seu pedido saiu para entrega"

5. EM TRÂNSITO
   Estado: in_transit
   Ação: GPS rastreamento (integração)
   Usuário vê: "Entregador está chegando"

6. ENTREGUE
   Estado: delivered
   Ação: Pede avaliação
   Usuário vê: "Pedido entregue! Avaliar?"

7. CANCELADO (opcional)
   Estado: cancelled
   Ação: Reembolso processado
   Usuário vê: "Pedido foi cancelado"
```

---

## 👥 Fluxo de Usuários por Tipo

### Cliente (PASTITA-3D)
```
1. Acessa landing page
2. Explora catálogo (cardápio)
3. Faz login/registro
4. Adiciona produtos ao carrinho
5. Vai para checkout
6. Seleciona endereço
7. Paga via Mercado Pago
8. Recebe confirmação por email + WhatsApp
9. Acompanha pedido em tempo real
10. Avalia pedido após entrega
```

### Admin (PASTITA-DASH)
```
1. Faz login no dashboard
2. Visualiza dashboard principal (métricas)
3. Gerencia pedidos (alterar status, cancelar)
4. Visualiza análises e relatórios
5. Monitora conversas WhatsApp
6. Gerencia campanhas de marketing
7. Configura automações com Langflow
8. Exporta dados para Excel
9. Gerencia usuários e permissões
10. Visualiza auditoria de operações
```

### Sistema (Background Jobs)
```
1. Celery Worker processa tasks
   - Envio de emails
   - Notificações WhatsApp
   - Processamento de pagamentos
   - Geração de relatórios

2. Celery Beat agenda tasks
   - Limpeza de dados antigos
   - Geração de relatórios diários
   - Sincronização com APIs externas
```

---

## 📊 Integrações Externas

| Serviço | Uso | Arquivo |
|---------|-----|---------|
| **Mercado Pago** | Pagamentos (PIX, Boleto, Card) | `infrastructure/external_apis/mercadopago.py` |
| **WhatsApp Business** | Envio de mensagens | `infrastructure/external_apis/whatsapp.py` |
| **Langflow** | IA para chatbot automático | `infrastructure/external_apis/langflow.py` |
| **Resend** | Envio de emails | `infrastructure/external_apis/resend.py` |
| **HERE Maps** | Cálculo de zonas de entrega | `infrastructure/external_apis/here_maps.py` |
| **AWS S3** | Armazenamento de arquivos | Django Storages |
| **Redis** | Cache e fila de tasks | `infrastructure/messaging/` |
| **PostgreSQL** | Banco de dados | Django ORM |

---

## 🚀 Comandos Rápidos

```bash
# FRONTEND
cd pastita-3d && npm install && npm run dev      # Loja
cd pastita-dash && npm install && npm run dev    # Admin

# BACKEND - Setup
cd server
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# BACKEND - Workers
celery -A config worker -l info
celery -A config beat -l info

# DATABASE
python manage.py shell              # Django REPL
python manage.py dbshell            # Conectar ao DB
python manage.py dumpdata > backup.json  # Backup
python manage.py migrate --fake initial  # Reset

# TESTS
cd pastita-3d && npm run lint       # Frontend lint
cd server && pytest                # Backend tests

# BUILD/DEPLOY
npm run build                       # Build Next.js
docker-compose up -d                # Subir com Docker
```

---

## 💡 Dicas Úteis

### Debugging Frontend
```bash
# Abrir DevTools
F12 ou Ctrl+Shift+I

# Ver requisições de API
Network tab → Filtrar por XHR/Fetch

# Inspecionar estado (React)
React DevTools extension

# Logs
console.log() ou debugger;
```

### Debugging Backend
```bash
# Django shell
python manage.py shell
>>> from apps.stores.models import StoreProduct
>>> StoreProduct.objects.all()

# Logs
# Ver arquivo de logs ou terminal

# Database
python manage.py dbshell

# API direto
curl http://localhost:8000/api/v1/stores/products/
```

### Performance
```bash
# Frontend: Lighthouse
F12 → Lighthouse tab → Gerar relatório

# Backend: Django Debug Toolbar
pip install django-debug-toolbar
Adicionar em settings (dev only)
```

---

## 🎓 Padrões de Código

### React Component Pattern (pastita-3d & pastita-dash)
```jsx
import { useContext } from 'react';
import { CartContext } from '@/context/CartContext';

export default function MyComponent({ title }) {
  const { cart } = useContext(CartContext);
  
  return (
    <div className="my-component">
      <h1>{title}</h1>
      {/* JSX aqui */}
    </div>
  );
}
```

### Django API Endpoint Pattern (server)
```python
from rest_framework import viewsets
from apps.stores.models import StoreProduct
from apps.stores.api.serializers import StoreProductSerializer

class StoreProductViewSet(viewsets.ModelViewSet):
    queryset = StoreProduct.objects.all()
    serializer_class = StoreProductSerializer
    permission_classes = [IsAuthenticated]
```

### API Service Pattern (frontend)
```javascript
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getProducts = (storeSlug = 'pastita') => api.get(`/stores/${storeSlug}/catalog/`);
```

---

## 📞 Quando Usar o Quê

| Preciso fazer | Arquivo | Ferramenta |
|---|---|---|
| Novo componente UI | `pastita-3d/src/components/` | React |
| Novo formulário | `pastita-dash/src/components/Forms/` | React + TypeScript |
| Nova página | `pastita-3d/src/pages/` | Next.js |
| Novo endpoint API | `server/apps/*/views.py` | Django REST |
| Novo modelo de dados | `server/apps/*/models.py` | Django ORM |
| Background job | `server/apps/*/tasks.py` | Celery |
| Enviar email | `server/apps/notifications/` | Resend |
| Enviar WhatsApp | `server/apps/whatsapp/` | WhatsApp API |
| Processar pagamento | `server/apps/payments/` | Mercado Pago |
| Autenticação | `server/apps/core/` | JWT (djangorestframework-simplejwt) |

---

**Atualizado em**: 11 de janeiro de 2026  
**Use juntamente com**: `tom.yml` e `PASTITA_GUIA_COMPLETO.md`
