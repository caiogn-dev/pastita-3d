# Frontend Tasks - Pastita 3D

## 📋 Overview

Frontend do cardápio/e-commerce Pastita. Construído com Next.js 15 + React 19.

**Completude Estimada: 90% (atualizado 2026-01-10)**

---

## ✅ ARQUITETURA: Next.js (Resolvido)

O projeto usa **Next.js 15** com Pages Router corretamente:
- `pages/` contém as rotas do Next.js
- `src/pages/` contém os componentes de página
- `src/components/` contém componentes reutilizáveis
- Proteção de rotas feita nativamente no Next.js

**Arquivos legados removidos (2026-01-10):**
- ~~`src/components/PrivateRoute.jsx`~~ - Removido (não usado)
- ~~`index.html`~~ - Removido (era do Vite)

---

## ✅ Completed Tasks (2026-01-10)

### Payment Flow
- [x] Checkout flow redirects to pending page with order number
- [x] CPF included in checkout payload for PIX/Boleto
- [x] PaymentPending page shows order items, PIX QR code, Boleto link
- [x] `/perfil` route for user profile page
- [x] Payment status handling (approved, rejected, pending)

### Components Created
- [x] **OrderTimeline** - `src/components/OrderTimeline.jsx` - Order status progression
- [x] **WishlistContext** - `src/context/WishlistContext.jsx` - Favorites state
- [x] **FavoriteButton** - `src/components/FavoriteButton.jsx` - Heart button
- [x] **ProductFilters** - `src/components/ProductFilters.jsx` - Category + search
- [x] **StockBadge** - `src/components/StockBadge.jsx` - Stock status indicator
- [x] **Skeleton** - `src/components/Skeleton.jsx` - Loading skeletons
- [x] **EmptyState** - `src/components/EmptyState.jsx` - Empty state messages

### API Integration
- [x] Profile endpoint (`/users/profile/`)
- [x] Orders history endpoint (`/orders/history/`)
- [x] Auth endpoints (login, register, logout)
- [x] Cart endpoints (list, add, remove, update)
- [x] Wishlist endpoints (list, toggle)

---

## 🔴 High Priority - TODO

### ~~1. Corrigir Endpoint CSRF~~ ✅ RESOLVIDO (2026-01-10)
- `api` → `/api/v1/ecommerce/` (produtos, carrinho, checkout)
- `coreApi` → `/api/v1/` (auth, csrf, profile)

### 3. Integrar Componentes nos Cards
- [x] **FavoriteButton** nos cards de produto em `Cardapio.jsx`
  ```jsx
  // src/pages/Cardapio.jsx - adicionar no card
  <FavoriteButton productId={product.id} />
  ```
- [x] **StockBadge** nos cards de produto
  ```jsx
  <StockBadge quantity={product.stock_quantity} />
  ```

### 4. Checkout Responsivo
- [x] Mobile: colunas devem empilhar
- [x] Touch targets maiores em mobile
- [x] Arquivo: `src/pages/CheckoutPage.jsx` + `CheckoutPage.css`

### 5. Integrar Cupons no Checkout
**Backend pronto:** `POST /api/v1/ecommerce/coupons/validate/`
```javascript
// src/pages/CheckoutPage.jsx
const validateCoupon = async (code) => {
  const response = await api.post('/coupons/validate/', { 
    code, 
    total: cartTotal 
  });
  // response.data: { valid, discount_amount, final_total }
};
```
- [x] Adicionar estado para cupom aplicado
- [x] Mostrar desconto no resumo
- [x] Enviar `coupon_code` no payload do checkout

### 6. Integrar Cálculo de Frete
**Backend pronto:** `POST /api/v1/ecommerce/delivery/calculate/`
```javascript
// src/pages/CheckoutPage.jsx
const calculateDelivery = async (zipCode) => {
  const response = await api.post('/delivery/calculate/', { zip_code: zipCode });
  // response.data: { available, fee, estimated_days, zone_name }
};
```
- [x] Chamar ao preencher CEP
- [x] Mostrar taxa no resumo
- [x] Atualizar total com frete

---

## 🟡 Medium Priority - TODO

### UI/UX Improvements
- [ ] Responsive grid system (CSS classes reutilizáveis)
- [ ] Typography scale consistente
- [ ] Accessibility: focus states, aria labels
- [ ] Lazy load images

### Cart Sidebar
- [ ] Mobile spacing e touch targets
- [ ] Botão "continuar comprando"

### Auth Pages
- [ ] Normalizar estilos com componentes compartilhados
- [ ] Melhorar mensagens de erro
- [ ] Mobile consistency

### Profile Page
- [ ] Skeleton loading
- [ ] Validação de CPF no frontend
- [ ] Máscara de telefone melhorada

---

## 🟢 Low Priority - TODO

### Landing Page
- [ ] Social proof section
- [ ] Testimonials
- [ ] Delivery info

### New Features
- [ ] PWA (Progressive Web App)
- [ ] Product reviews/ratings
- [ ] WhatsApp notifications

---

## 📁 Project Structure

```
pastita-3d/
├── pages/                    # Next.js pages
│   ├── index.js
│   ├── cardapio.js
│   ├── checkout.js
│   └── ...
├── src/
│   ├── components/
│   │   ├── CartSidebar.jsx + .css
│   │   ├── EmptyState.jsx + .css
│   │   ├── ErrorBoundary.jsx
│   │   ├── FavoriteButton.jsx + .css
│   │   ├── LoginModal.jsx + .css
│   │   ├── Navbar.jsx + .css
│   │   ├── OrderTimeline.jsx + .css
│   │   ├── PrivateRoute.jsx
│   │   ├── ProductFilters.jsx + .css
│   │   ├── Skeleton.jsx + .css
│   │   ├── StockBadge.jsx + .css
│   │   ├── Toast.jsx + .css
│   │   └── ui/                          # Componentes UI base
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   └── WishlistContext.jsx
│   ├── pages/
│   │   ├── Cardapio.jsx + .css
│   │   ├── CheckoutPage.jsx + .css
│   │   ├── LandingPage.jsx + .css
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Profile.jsx + .css
│   │   ├── PaymentSuccess.jsx
│   │   ├── PaymentError.jsx
│   │   ├── PaymentPending.jsx
│   │   └── NotFound.jsx
│   ├── services/
│   │   └── api.js
│   │   └── auth.js
│   ├── hooks/
│   │   └── useWebSocket.js
│   └── index.css
├── public/
├── package.json                # Next.js scripts
└── next.config.js
```

---

## 🔌 API Endpoints

### E-commerce (baseURL: `/api/v1/ecommerce`)
```
GET    /products/                    ✅ Usado
GET    /products/categories/         ✅ Usado
GET    /cart/list/                   ✅ Usado
POST   /cart/add_item/               ✅ Usado
POST   /cart/update_item/            ✅ Usado
POST   /cart/remove_item/            ✅ Usado
POST   /cart/clear/                  ✅ Usado
POST   /checkout/create_checkout/    ✅ Usado
GET    /checkout/status/             ✅ Usado
GET    /wishlist/                    ✅ Usado
POST   /wishlist/toggle/             ✅ Usado
POST   /coupons/validate/            ✅ Usado
POST   /delivery/calculate/          ✅ Usado
GET    /orders/history/              ✅ Usado
```

### Core/Auth (baseURL: `/api/v1`)
```
GET    /csrf/                        ✅ Usado
POST   /auth/login/                  ✅ Usado
POST   /auth/register/               ✅ Usado
POST   /auth/logout/                 ✅ Usado
GET    /users/profile/               ✅ Usado
PATCH  /users/profile/               ✅ Usado
```

---

## 📊 Progress Summary

| Feature | Status | Completude |
|---------|--------|------------|
| Auth Flow | ✅ Complete | 100% |
| Products List | ✅ Complete | 100% |
| Cart | ✅ Complete | 100% |
| Checkout Basic | ✅ Complete | 80% |
| Payment Flow | ✅ Complete | 100% |
| Profile Page | ✅ Complete | 90% |
| Wishlist Context | ✅ Complete | 100% |
| FavoriteButton Integration | Complete | 100% |
| StockBadge Integration | Complete | 100% |
| Coupon Integration | Complete | 100% |
| Delivery Fee Integration | Complete | 100% |
| Responsive Checkout | Complete | 100% |
| Architecture Fix | Complete | 100% |

---

## 🔧 Environment Variables

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1/ecommerce

# WebSocket
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# Mercado Pago
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=xxx

# Auth Cookie
NEXT_PUBLIC_AUTH_COOKIE_NAME=auth_token
```

---

## 🚀 Próximos Passos Recomendados

1. Testar fluxo completo do checkout (PIX, cartao, dinheiro)
2. Melhorar responsividade mobile geral (checkout e carrinho)
3. Lazy load de imagens no cardapio
4. Accessibility improvements (focus e aria)

---
*Last updated: 2026-01-10*

---

## ✅ Completed Tasks (2026-01-10 - Sessão 2)

### Checkout Improvements
- [x] **Cupons** - Validação via API, botão "Aplicar", UI de cupom aplicado
- [x] **Frete dinâmico** - Cálculo via API ao preencher CEP, mostra zona e prazo
- [x] **Pagamento em dinheiro** - Nova opção "Dinheiro" com nota explicativa
- [x] **Agendamento** - Seletor de data e horário para entrega/retirada

### Components Integration
- [x] **StockBadge** integrado nos cards de produto (mostra "Esgotado", "Últimas unidades")

---

## 🔴 TODO - Próximos Passos

1. Testar fluxo completo do checkout (PIX, cartao, dinheiro)
2. Melhorar responsividade mobile geral (checkout e carrinho)
3. Lazy load de imagens no cardapio
4. Accessibility improvements (focus e aria)

---
*Last updated: 2026-01-10*
