# Pastita 3D (Customer Frontend) - Repository Knowledge

Next.js customer-facing storefront for Pastita e-commerce.

## Tech Stack
- **Framework**: Next.js 15.x (Pages Router)
- **Styling**: CSS Modules + Tailwind CSS
- **Payment**: MercadoPago SDK
- **Maps**: HERE Maps API

## Project Structure
```
src/
├── components/
│   ├── checkout/         # Checkout flow components
│   │   ├── CustomerForm.jsx
│   │   ├── PaymentStep.jsx
│   │   ├── LocationModal.jsx
│   │   └── hooks/        # Custom hooks for checkout
│   └── ui/               # Reusable UI components
├── context/
│   ├── AuthContext.jsx   # Authentication state
│   ├── CartContext.jsx   # Shopping cart
│   └── StoreContext.jsx  # Store information
├── pages/
│   ├── checkout.jsx      # Checkout page
│   ├── cardapio.jsx      # Menu/catalog
│   ├── sucesso.jsx       # Payment success
│   ├── pendente.jsx      # Payment pending
│   └── erro.jsx          # Payment error
└── services/
    ├── storeApi.js       # Main API client
    ├── auth.js           # Auth service
    └── tokenStorage.js   # Token management
```

## Key Files

### API Client (`src/services/storeApi.js`)
- Base URL: `/api/v1/stores/s/{STORE_SLUG}/`
- Token auth via `Authorization: Token {token}`
- Handles CSRF tokens automatically

### Checkout Flow
1. `CheckoutPage.jsx` - Main checkout orchestrator
2. `useCheckoutForm.js` - Form state management
3. `CustomerForm.jsx` - Customer info (phone, name, CPF only)
4. `PaymentStep.jsx` - Payment method selection
5. `LocationModal.jsx` - Delivery address via geolocation

## API Endpoints Used

### Store-specific (via storeApi)
```javascript
storeApi.post('/checkout/', data)      // Create order
storeApi.get('/catalog/')               // Get products
storeApi.post('/cart/add/', item)       // Add to cart
storeApi.get('/delivery-fee/')          // Calculate fee
```

### Global (via axios directly)
```javascript
axios.get(`${STORES_API_URL}/orders/by-token/${token}/`)  // Order status
```

## Checkout Data Structure

```javascript
{
  customer_name: "Nome Completo",
  customer_email: "11999999999@cliente.pastita.com.br",  // Auto-generated
  customer_phone: "11999999999",
  cpf: "12345678900",
  delivery_method: "delivery" | "pickup",
  delivery_address: {
    street: "Rua...",
    neighborhood: "Bairro",
    city: "Cidade",
    state: "UF",
    zip_code: "00000000"
  },
  payment_method: "pix" | "card" | "cash",
  coupon_code: "CUPOM10"
}
```

## Important Patterns

### Email Auto-generation
- Email field is hidden from user
- Generated from phone: `{phone}@cliente.pastita.com.br`
- Implemented in `useCheckoutForm.js` → `buildCheckoutPayload()`

### Order Access
- After checkout, redirect with `access_token`
- Status pages use `getOrderByToken(token)` for secure access
- Fallback to order number for legacy support

### WhatsApp Authentication
- Users can login via WhatsApp OTP
- Token stored in `tokenStorage.js`
- Synced across `storeApi` and `authApi` instances

## Environment Variables
```
NEXT_PUBLIC_API_URL=https://api.domain.com/api/v1
NEXT_PUBLIC_STORE_SLUG=pastita
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=APP_USR-xxx
NEXT_PUBLIC_HERE_API_KEY=xxx
NEXT_PUBLIC_WHATSAPP_NUMBER=5563999999999
```

## Commands
```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production
```

## Payment Status Pages

| Page | Route | Purpose |
|------|-------|---------|
| Success | `/sucesso?token=xxx` | Payment confirmed |
| Pending | `/pendente?token=xxx` | Awaiting payment (PIX) |
| Error | `/erro?token=xxx` | Payment failed |

All pages auto-refresh to check payment status and redirect accordingly.
