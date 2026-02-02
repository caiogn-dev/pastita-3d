# 🏛️ PASTITA Platform - Arquitetura & Diagrama Técnico

---

## 📐 Arquitetura Geral da Plataforma

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        🍝 PASTITA E-COMMERCE PLATFORM                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│                          🖥️ CAMADA DE APRESENTAÇÃO (Frontend)                        │
│                                                                                       │
│  ┌──────────────────────────────────────┬──────────────────────────────────────┐    │
│  │                                      │                                      │    │
│  │  📱 PASTITA-3D (Customer App)       │  📊 PASTITA-DASH (Admin Dashboard)   │    │
│  │  ─────────────────────────────────  │  ────────────────────────────────────│    │
│  │  Next.js 15 + React 19               │  React 18 + TypeScript + Vite        │    │
│  │  Port: 3000                          │  Port: 12001                         │    │
│  │                                      │                                      │    │
│  │  📄 Pages:                           │  📄 Pages:                           │    │
│  │  • Landing page                      │  • Dashboard (KPIs)                  │    │
│  │  • Product catalog                   │  • Order management                  │    │
│  │  • Shopping cart                     │  • Customer analytics                │    │
│  │  • Checkout                          │  • WhatsApp conversations            │    │
│  │  • User profile                      │  • Campaign management               │    │
│  │  • Order tracking                    │  • Inventory control                 │    │
│  │                                      │  • User management                   │    │
│  │  🎨 State Management:                │  🎨 State Management:                │    │
│  │  • Context API (Auth, Cart)          │  • Zustand stores                    │    │
│  │  • SWR (data fetching)               │  • React Query (optional)            │    │
│  │                                      │                                      │    │
│  │  💻 UI Libraries:                    │  💻 UI Libraries:                    │    │
│  │  • Tailwind CSS                      │  • Tailwind CSS                      │    │
│  │  • Headless UI                       │  • Headless UI                       │    │
│  │  • React Hot Toast                   │  • Chart.js                          │    │
│  │                                      │  • Hero Icons                        │    │
│  └──────────────────────────────────────┴──────────────────────────────────────┘    │
│                                      ↓↑                                              │
│                         🔌 API Gateway (HTTP + WebSocket)                           │
│                                      ↓↑                                              │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                               │   │
│  │              🔧 CAMADA DE NEGÓCIO (Backend API)                              │   │
│  │                                                                               │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐    │   │
│  │  │  🚀 SERVER-MAIN (Django REST Framework)                             │    │   │
│  │  │  Port: 8000                                                          │    │   │
│  │  │  Language: Python 3.11+                                              │    │   │
│  │  │                                                                       │    │   │
│  │  │  📦 Core Applications:                                               │    │   │
│  │  │  ┌──────────────┬────────────┬────────────┬──────────────┐           │    │   │
│  │  │  │              │            │            │              │           │    │   │
│  │  │  │  🔐 CORE     │  🛒 ECMRC  │  📦 ORDERS │  💳 PAYMENTS │           │    │   │
│  │  │  │  ────────────│────────────│────────────│──────────────│           │    │   │
│  │  │  │ • Auth       │ • Products │ • Order    │ • Payment    │           │    │   │
│  │  │  │ • Users      │ • Cart     │ • Delivery │ • Webhook    │           │    │   │
│  │  │  │ • Perms      │ • Checkout │ • Timeline │ • Refund     │           │    │   │
│  │  │  │              │            │            │              │           │    │   │
│  │  │  └──────────────┴────────────┴────────────┴──────────────┘           │    │   │
│  │  │                                                                       │    │   │
│  │  │  ┌──────────────┬────────────┬────────────┬──────────────┐           │    │   │
│  │  │  │              │            │            │              │           │    │   │
│  │  │  │  💬 WHATSAPP │  📧 NOTIF  │  🤖 AUTO   │  🧠 LANGFLOW │           │    │   │
│  │  │  │  ────────────│────────────│────────────│──────────────│           │    │   │
│  │  │  │ • Messages   │ • Email    │ • Campaign │ • LLM Chain  │           │    │   │
│  │  │  │ • Webhook    │ • Templates│ • Trigger  │ • Chatbot    │           │    │   │
│  │  │  │ • Contacts   │ • Resend   │ • Action   │ • Agents     │           │    │   │
│  │  │  │              │            │            │              │           │    │   │
│  │  │  └──────────────┴────────────┴────────────┴──────────────┘           │    │   │
│  │  │                                                                       │    │   │
│  │  │  ┌──────────────┬────────────┬──────────────────────────┐            │    │   │
│  │  │  │              │            │                          │            │    │   │
│  │  │  │💭 CONVERSA   │  📢 CAMPAIGNS│  📋 AUDIT             │            │    │   │
│  │  │  │──────────────│────────────│──────────────────────────│            │    │   │
│  │  │  │ • History    │ • Marketing│ • Log all operations     │            │    │   │
│  │  │  │ • Context    │ • Segment  │ • Track changes         │            │    │   │
│  │  │  │ • Messages   │ • Analytics│ • User trail            │            │    │   │
│  │  │  │              │            │                          │            │    │   │
│  │  │  └──────────────┴────────────┴──────────────────────────┘            │    │   │
│  │  │                                                                       │    │   │
│  │  │  📚 Serializers & Business Logic:                                     │    │   │
│  │  │  • DRF Serializers for all models                                     │    │   │
│  │  │  • Custom validators                                                  │    │   │
│  │  │  • Permission classes (IsAuthenticated, IsAdmin)                      │    │   │
│  │  │  • Pagination & filtering                                             │    │   │
│  │  │  • Rate limiting                                                      │    │   │
│  │  └─────────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                               │   │
│  │  🔄 Background Tasks (Celery):                                              │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐    │   │
│  │  │ Queues: automation, whatsapp, orders, payments, langflow            │    │   │
│  │  │ • Email delivery (async)                                             │    │   │
│  │  │ • WhatsApp notifications (async)                                     │    │   │
│  │  │ • Payment verification                                               │    │   │
│  │  │ • Report generation                                                  │    │   │
│  │  │ • Data cleanup                                                       │    │   │
│  │  │ • LLM prompt execution                                               │    │   │
│  │  │ • Scheduled tasks (Celery Beat)                                      │    │   │
│  │  └─────────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                               │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                      ↓↑                                              │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                               │   │
│  │              💾 CAMADA DE DADOS & CACHE                                       │   │
│  │                                                                               │   │
│  │  ┌────────────────────────┬─────────────────────┬─────────────────────┐     │   │
│  │  │                        │                     │                     │     │   │
│  │  │  🗄️ PostgreSQL        │  ⚡ Redis Cache    │  📁 AWS S3         │     │   │
│  │  │  ──────────────────   │  ─────────────────  │  ──────────────    │     │   │
│  │  │  • Main database      │  • Session cache    │  • Product images  │     │   │
│  │  │  • All app tables     │  • Cart data        │  • User documents  │     │   │
│  │  │  • User data          │  • API responses    │  • Export files    │     │   │
│  │  │  • Order history      │  • Rate limit data  │  • Media files     │     │   │
│  │  │  • Transactions       │  • Task queue       │                     │     │   │
│  │  │  • Backups (daily)    │  • Celery results   │                     │     │   │
│  │  │                        │                     │                     │     │   │
│  │  └────────────────────┴─────────────────────┴─────────────────────┘     │   │
│  │                                                                               │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                       │
│                   🔌 INTEGRAÇÕES COM SERVIÇOS EXTERNOS                               │
│                                                                                       │
│  ┌──────────────────────┬──────────────────────┬──────────────────────┐             │
│  │                      │                      │                      │             │
│  │  💳 MERCADO PAGO     │  💬 WHATSAPP API     │  🤖 LANGFLOW         │             │
│  │  ──────────────────  │  ──────────────────  │  ──────────────────  │             │
│  │  • Create checkout   │  • Send messages     │  • Chat completions  │             │
│  │  • Process payment   │  • Receive webhook   │  • Auto-responses    │             │
│  │  • Verify status     │  • Template manager  │  • Custom workflows  │             │
│  │  • Refund handling   │  • Media handling    │  • LLM integration   │             │
│  │                      │                      │                      │             │
│  └──────────────────────┴──────────────────────┴──────────────────────┘             │
│                                                                                       │
│  ┌──────────────────────┬──────────────────────┬──────────────────────┐             │
│  │                      │                      │                      │             │
│  │  📧 RESEND           │  🗺️ HERE MAPS        │  🔐 JWT AUTH        │             │
│  │  ──────────────────  │  ──────────────────  │  ──────────────────  │             │
│  │  • Send emails       │  • Geocoding         │  • Token generation │             │
│  │  • Email templates   │  • Route planning    │  • Token refresh    │             │
│  │  • Delivery tracking │  • Distance calc     │  • Secure headers   │             │
│  │  • Analytics         │  • Zone mapping      │  • Expiration       │             │
│  │                      │                      │                      │             │
│  └──────────────────────┴──────────────────────┴──────────────────────┘             │
│                                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Dados - Sequência de Requisições

### 1. User Registration Flow

```
┌─────────────┐                           ┌──────────────┐
│ PASTITA-3D  │                           │ SERVER-MAIN  │
└─────────────┘                           └──────────────┘
      │                                           │
      │  1. POST /auth/register/                  │
      ├──────────────────────────────────────────>│
      │                                           │
      │                  2. Validate email        │
      │                  3. Hash password         │
      │                  4. Create User object    │
      │                  5. Save to DB            │
      │                                           │
      │                  6. Send welcome email    │
      │                  (via Resend - Celery)    │
      │                                           │
      │     7. Return JWT token + user data       │
      │<──────────────────────────────────────────┤
      │                                           │
      │  8. Save token to cookie + localStorage   │
      │  9. Redirect to /cardapio                 │
```

### 2. Product Purchase Flow

```
┌─────────────┐                           ┌──────────────┐        ┌─────────────┐
│ PASTITA-3D  │                           │ SERVER-MAIN  │        │ MERCADO PAGO│
└─────────────┘                           └──────────────┘        └─────────────┘
      │                                           │                      │
      │  1. POST /checkout/create_checkout/       │                      │
      ├──────────────────────────────────────────>│                      │
      │                                           │                      │
      │               2. Validate cart            │                      │
      │               3. Calculate shipping       │                      │
      │               4. Create Order object      │                      │
      │               5. Call Mercado Pago API    │                      │
      │                                           ├─────────────────────>│
      │                                           │                      │
      │                                           │ 6. Return checkout   │
      │                                           │    session + QR code │
      │                                           │<─────────────────────┤
      │     7. Return checkout data               │                      │
      │<──────────────────────────────────────────┤                      │
      │                                           │                      │
      │  8. Display QR code                       │                      │
      │  9. User scans QR → Mercado Pago app      │                      │
      │                                           │  10. User pays       │
      │                                           │  (PIX/Boleto/Card)   │
      │                                           │                      │
      │                   11. Webhook: /payments/webhook/mercadopago/    │
      │                                           │<─────────────────────┤
      │                                           │                      │
      │               12. Verify payment status   │                      │
      │               13. Update Order status     │                      │
      │               14. Send confirmation email │                      │
      │               15. Send WhatsApp message   │                      │
      │                                           │                      │
      │  16. Fetch order status (polling)         │                      │
      ├──────────────────────────────────────────>│                      │
      │                                           │                      │
      │     17. Return completed order            │                      │
      │<──────────────────────────────────────────┤                      │
      │                                           │                      │
      │  18. Redirect to /sucesso                 │                      │
```

### 3. WhatsApp Automation Flow

```
┌─────────────────┐                           ┌──────────────┐      ┌─────────────┐
│   CLIENTE       │                           │ SERVER-MAIN  │      │  LANGFLOW   │
└─────────────────┘                           └──────────────┘      └─────────────┘
      │                                           │                       │
      │  1. Envia mensagem no WhatsApp            │                       │
      ├───────────────────────────────────────────────────────────────────>│
      │                                           │ (via WhatsApp API)    │
      │                                           │                       │
      │                               2. Webhook: /whatsapp/webhook/      │
      │                                           │<──────────────────────┤
      │                                           │                       │
      │              3. Save message to DB        │                       │
      │              4. Extract text intent       │                       │
      │              5. POST to Langflow API      │                       │
      │                                           ├──────────────────────>│
      │                                           │                       │
      │                               6. Langflow analyzes message        │
      │                               7. Generates response text          │
      │                                           │<──────────────────────┤
      │                                           │                       │
      │        8. Format response message         │                       │
      │        9. Send via WhatsApp API           │                       │
      │        10. Save to conversation history   │                       │
      │                                           │                       │
      │  11. Cliente recebe resposta automática   │                       │
      │<───────────────────────────────────────────────────────────────────┤
```

### 4. Admin Dashboard Real-time Flow

```
┌─────────────────┐                           ┌──────────────┐
│ PASTITA-DASH    │                           │ SERVER-MAIN  │
└─────────────────┘                           └──────────────┘
      │                                           │
      │  1. WebSocket: ws://localhost:8000/ws    │
      ├──────────────────────────────────────────>│
      │                                           │
      │  2. Connection established                │
      │<──────────────────────────────────────────┤
      │                                           │
      │  3. GET /admin/orders/ (initial load)     │
      ├──────────────────────────────────────────>│
      │                                           │
      │     Return list + paginate                │
      │<──────────────────────────────────────────┤
      │                                           │
      │  4. Subscribe to order updates (WS)       │
      ├──────────────────────────────────────────>│
      │                                           │
      │  5. Order status changed (by customer)    │
      │     → Signal sent → WebSocket broadcast   │
      │                                           │
      │  Order update received in real-time       │
      │<──────────────────────────────────────────┤
      │                                           │
      │  6. Admin clicks "Change Status"          │
      │  7. PUT /admin/orders/{id}/status/        │
      ├──────────────────────────────────────────>│
      │                                           │
      │          Update DB                       │
      │          Send notification               │
      │          Log audit                       │
      │                                           │
      │     Return updated order                 │
      │<──────────────────────────────────────────┤
```

---

## 🏛️ Padrão de Diretórios Backend

```
server-main/
├── apps/
│   ├── core/
│   │   ├── __init__.py
│   │   ├── models.py                      # User, Profile, Company
│   │   ├── views.py                       # Auth endpoints
│   │   ├── serializers.py                 # User serializers
│   │   ├── permissions.py                 # Custom permissions
│   │   ├── admin.py                       # Django admin config
│   │   ├── urls.py                        # Auth routes
│   │   └── tests.py                       # Auth tests
│   │
│   ├── ecommerce/
│   │   ├── models.py                      # Product, Cart, Category
│   │   ├── views.py                       # Product viewsets
│   │   ├── serializers.py                 # DRF serializers
│   │   ├── filters.py                     # Search filters
│   │   ├── tasks.py                       # Celery tasks
│   │   ├── admin.py                       # Admin config
│   │   └── urls.py
│   │
│   ├── orders/
│   │   ├── models.py                      # Order, OrderItem
│   │   ├── views.py                       # Order management
│   │   ├── serializers.py                 # Order serializers
│   │   ├── signals.py                     # Auto triggers
│   │   ├── tasks.py                       # Background jobs
│   │   ├── admin.py
│   │   └── urls.py
│   │
│   ├── payments/
│   │   ├── models.py                      # Payment, Transaction
│   │   ├── views.py                       # Payment webhook handler
│   │   ├── serializers.py
│   │   ├── integrations.py                # Mercado Pago API calls
│   │   ├── tasks.py                       # Payment verification
│   │   └── urls.py
│   │
│   ├── whatsapp/
│   │   ├── models.py                      # Message, Conversation
│   │   ├── views.py                       # Webhook receiver
│   │   ├── services.py                    # WhatsApp send logic
│   │   ├── tasks.py                       # Async message tasks
│   │   └── urls.py
│   │
│   ├── notifications/
│   │   ├── models.py                      # Notification, Email
│   │   ├── services.py                    # Resend email service
│   │   ├── templates/                     # Email HTML templates
│   │   ├── tasks.py                       # Email queue
│   │   └── urls.py
│   │
│   ├── automation/
│   │   ├── models.py                      # Campaign, Trigger, Action
│   │   ├── services.py                    # Workflow execution
│   │   ├── tasks.py                       # Celery automation tasks
│   │   └── urls.py
│   │
│   ├── langflow/
│   │   ├── client.py                      # Langflow API client
│   │   ├── chains.py                      # Custom LLM chains
│   │   └── agents.py                      # AI agents
│   │
│   ├── conversations/
│   │   ├── models.py                      # Chat history
│   │   └── serializers.py
│   │
│   ├── campaigns/
│   │   ├── models.py                      # Campaign, Segment
│   │   ├── views.py                       # Campaign CRUD
│   │   └── analytics.py                   # Campaign metrics
│   │
│   └── audit/
│       ├── models.py                      # AuditLog
│       ├── middleware.py                  # Log middleware
│       └── signals.py                     # Auto logging
│
├── config/
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py                        # Common settings
│   │   ├── development.py                 # Dev overrides
│   │   ├── production.py                  # Prod overrides
│   │   └── constants.py                   # Global constants
│   │
│   ├── urls.py                            # Main router
│   ├── asgi.py                            # WebSocket config
│   ├── wsgi.py                            # Production WSGI
│   ├── celery.py                          # Celery config
│   └── settings.json                      # JSON config (optional)
│
├── domain/                                 # Clean Architecture layer
│   ├── entities/                          # Business models
│   ├── events/                            # Domain events
│   └── use_cases/                         # Business logic
│
├── infrastructure/
│   ├── external_apis/
│   │   ├── mercadopago.py                 # Payment integration
│   │   ├── whatsapp.py                    # WhatsApp integration
│   │   ├── langflow.py                    # LLM integration
│   │   ├── resend.py                      # Email integration
│   │   └── here_maps.py                   # Maps integration
│   │
│   └── messaging/
│       ├── celery_config.py               # Queue config
│       └── redis_client.py                # Redis wrapper
│
├── tests/
│   ├── test_ecommerce_api.py              # E-commerce tests
│   ├── test_orders_api.py                 # Order tests
│   ├── test_payments.py                   # Payment tests
│   ├── test_whatsapp.py                   # WhatsApp tests
│   └── conftest.py                        # Pytest config
│
├── manage.py                               # Django CLI
├── requirements.txt                        # Python deps
├── .env                                    # Environment vars
├── .env.example                            # Example env
├── Dockerfile                              # Container image
├── docker-compose.yml                      # Multi-container setup
├── entrypoint.sh                           # Container entry
├── railway.json                            # Railway deploy config
├── Procfile                                # Heroku/Railway config
├── db.sqlite3                              # Dev database
└── README.md                               # Documentation
```

---

## 📊 Database Schema Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     DATABASE: PostgreSQL                      │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  👤 USER TABLES                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ auth_user (Django User model)                           │  │
│  │ ├── id, username, email, password_hash                  │  │
│  │ ├── first_name, last_name, is_active                    │  │
│  │ ├── date_joined, last_login                             │  │
│  │ └── groups (M2M), user_permissions (M2M)                │  │
│  │                                                          │  │
│  │ core_userprofile                                        │  │
│  │ ├── user (FK to auth_user)                              │  │
│  │ ├── phone, address, city, state, zip                    │  │
│  │ ├── avatar, bio, preferences                            │  │
│  │ └── created_at, updated_at                              │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  🛒 ECOMMERCE TABLES                                           │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ ecommerce_category                                      │  │
│  │ ├── id, name, slug, description                         │  │
│  │ └── image, created_at                                   │  │
│  │                                                          │  │
│  │ ecommerce_product                                       │  │
│  │ ├── id, name, slug, description                         │  │
│  │ ├── price, cost, stock_quantity                         │  │
│  │ ├── category (FK), image                                │  │
│  │ ├── is_active, is_featured                              │  │
│  │ └── created_at, updated_at                              │  │
│  │                                                          │  │
│  │ ecommerce_cart                                          │  │
│  │ ├── id, user (FK), session_id                           │  │
│  │ └── created_at, updated_at                              │  │
│  │                                                          │  │
│  │ ecommerce_cartitem                                      │  │
│  │ ├── id, cart (FK), product (FK)                         │  │
│  │ ├── quantity, price_at_time                             │  │
│  │ └── added_at                                            │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  📦 ORDER TABLES                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ orders_order                                            │  │
│  │ ├── id, user (FK), status                               │  │
│  │ ├── total_amount, shipping_cost                         │  │
│  │ ├── delivery_address                                    │  │
│  │ ├── created_at, delivery_date                           │  │
│  │ └── notes                                               │  │
│  │                                                          │  │
│  │ orders_orderitem                                        │  │
│  │ ├── id, order (FK), product (FK)                        │  │
│  │ ├── quantity, price, total                              │  │
│  │ └── custom_notes                                        │  │
│  │                                                          │  │
│  │ orders_delivery                                         │  │
│  │ ├── id, order (FK), zone (FK)                           │  │
│  │ ├── distance_km, base_price, total_price                │  │
│  │ └── delivery_date                                       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  💳 PAYMENT TABLES                                             │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ payments_payment                                        │  │
│  │ ├── id, order (FK), amount                              │  │
│  │ ├── status, method                                      │  │
│  │ ├── external_id, webhook_received                       │  │
│  │ └── created_at, processed_at                            │  │
│  │                                                          │  │
│  │ payments_transaction                                    │  │
│  │ ├── id, payment (FK), type                              │  │
│  │ ├── amount, reference                                   │  │
│  │ └── created_at                                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  💬 WHATSAPP TABLES                                            │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ whatsapp_message                                        │  │
│  │ ├── id, conversation (FK), sender, recipient            │  │
│  │ ├── text, media_url, status                             │  │
│  │ ├── is_automated                                        │  │
│  │ └── sent_at, received_at                                │  │
│  │                                                          │  │
│  │ whatsapp_conversation                                   │  │
│  │ ├── id, user (FK), contact_number                       │  │
│  │ ├── last_message, unread_count                          │  │
│  │ └── created_at, updated_at                              │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  📧 NOTIFICATION TABLES                                        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ notifications_email                                     │  │
│  │ ├── id, user (FK), type                                 │  │
│  │ ├── subject, body, status                               │  │
│  │ ├── sent_at, delivery_timestamp                         │  │
│  │ └── error_message (if failed)                           │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  🤖 AUTOMATION TABLES                                          │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ automation_campaign                                     │  │
│  │ ├── id, name, description                               │  │
│  │ ├── target_segment, status                              │  │
│  │ ├── start_date, end_date                                │  │
│  │ └── created_by (FK to User)                             │  │
│  │                                                          │  │
│  │ automation_trigger                                      │  │
│  │ ├── id, campaign (FK), event_type                       │  │
│  │ ├── condition, actions (JSON)                           │  │
│  │ └── is_active                                           │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  💭 CONVERSATION TABLES                                        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ conversations_conversation                              │  │
│  │ ├── id, user (FK), title                                │  │
│  │ └── created_at, updated_at                              │  │
│  │                                                          │  │
│  │ conversations_message                                   │  │
│  │ ├── id, conversation (FK), user (FK)                    │  │
│  │ ├── text, role (user/system)                            │  │
│  │ └── created_at                                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  📋 AUDIT TABLES                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ audit_auditlog                                          │  │
│  │ ├── id, user (FK), action                               │  │
│  │ ├── model, object_id, changes                           │  │
│  │ ├── ip_address, user_agent                              │  │
│  │ └── created_at, timestamp                               │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔐 API Authentication & Security

```
┌──────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                        │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  1. USER LOGIN                                                │
│     POST /api/v1/auth/login/                                  │
│     {                                                         │
│       "email": "user@example.com",                            │
│       "password": "secure_password"                           │
│     }                                                         │
│                                                                │
│  2. SERVER RETURNS JWT TOKENS                                 │
│     {                                                         │
│       "access": "eyJhbGciOiJIUzI1NiIs...",  # 5 min         │
│       "refresh": "eyJhbGciOiJIUzI1NiIs...",  # 1 day         │
│       "user": {...}                                           │
│     }                                                         │
│                                                                │
│  3. CLIENT STORES TOKENS                                      │
│     ├── access: localStorage + HTTPOnly cookie               │
│     └── refresh: HTTPOnly cookie only (secure)               │
│                                                                │
│  4. REQUEST TO PROTECTED ENDPOINT                             │
│     GET /api/v1/users/profile/                                │
│     Headers: {                                                │
│       "Authorization": "Bearer <access_token>",               │
│       "X-CSRFToken": "<csrf_token>"                           │
│     }                                                         │
│                                                                │
│  5. TOKEN VALIDATION                                          │
│     ├── Decode JWT                                            │
│     ├── Verify signature                                      │
│     ├── Check expiration                                      │
│     ├── Fetch user from DB                                    │
│     └── Check permissions                                     │
│                                                                │
│  6. IF TOKEN EXPIRED → REFRESH                                │
│     POST /api/v1/auth/refresh/                                │
│     {                                                         │
│       "refresh": "<refresh_token>"                            │
│     }                                                         │
│                                                                │
│  7. RETURN NEW ACCESS TOKEN                                   │
│     {                                                         │
│       "access": "<new_access_token>"                          │
│     }                                                         │
│                                                                │
└──────────────────────────────────────────────────────────────┘

PERMISSION SYSTEM:
┌──────────────────────────────────────────────────────────────┐
│                                                                │
│  IsAuthenticated         - User must be logged in             │
│  IsAdmin                 - User has admin role                │
│  IsManager               - User is manager or admin            │
│  IsOperator              - User can process orders            │
│  IsOwner                 - User owns the resource             │
│  CustomPermission        - Any custom logic                   │
│                                                                │
│  Example endpoint:                                            │
│  permission_classes = [IsAuthenticated, IsOwner]             │
│                                                                │
└──────────────────────────────────────────────────────────────┘

RATE LIMITING:
┌──────────────────────────────────────────────────────────────┐
│                                                                │
│  Anonymous users:   10 requests per minute                    │
│  Authenticated:     100 requests per minute                   │
│  Admin:             No limit (or very high)                   │
│  Payment endpoints: 1 request per second per user             │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 📱 Mobile App (PASTITA-APP) Architecture

```
pastita-app/
├── src/
│   ├── navigation/
│   │   ├── RootNavigator.tsx            # Navegação principal
│   │   ├── AuthNavigator.tsx            # Fluxo autenticação
│   │   └── AppNavigator.tsx             # Fluxo pós-login
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── home/
│   │   │   ├── HomeScreen.tsx
│   │   │   └── ProductDetailScreen.tsx
│   │   ├── cart/
│   │   │   └── CartScreen.tsx
│   │   ├── orders/
│   │   │   ├── OrdersScreen.tsx
│   │   │   └── OrderDetailScreen.tsx
│   │   └── profile/
│   │       └── ProfileScreen.tsx
│   │
│   ├── components/
│   │   ├── ProductCard.tsx
│   │   ├── CartItem.tsx
│   │   ├── OrderTimeline.tsx
│   │   └── ...
│   │
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   │
│   ├── services/
│   │   ├── api.ts
│   │   └── auth.ts
│   │
│   └── App.tsx
│
├── package.json
├── tsconfig.json
└── app.json                             # Expo config

Technology:
- React Native / Expo
- TypeScript
- React Navigation
- Axios
- Redux / Context API
- Firebase (optional)
```

---

**Last Updated**: January 11, 2026  
**Format**: Architecture Documentation (Markdown + ASCII Diagrams)  
**Purpose**: Visual reference for system design and data flow
