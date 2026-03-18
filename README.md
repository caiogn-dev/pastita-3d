# Pastita 3D - Customer Frontend

Next.js storefront for Pastita integrated with the unified `server` API.

## Quick Start

```bash
npm install
npm run dev
```

App runs at: `http://localhost:3000`

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_MEDIA_URL=http://localhost:8000
NEXT_PUBLIC_STORE_SLUG=pastita

NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_HERE_API_KEY=your-here-api-key

NEXT_PUBLIC_CONTACT_EMAIL=contato@pastita.com.br
NEXT_PUBLIC_WHATSAPP_NUMBER=5563992957931
```

## API Contract

Store-scoped endpoints:

- `GET /api/v1/stores/{store_slug}/`
- `GET /api/v1/stores/{store_slug}/catalog/`
- `GET /api/v1/stores/{store_slug}/cart/`
- `POST /api/v1/stores/{store_slug}/cart/add/`
- `POST /api/v1/stores/{store_slug}/checkout/`
- `POST /api/v1/stores/{store_slug}/validate-delivery/`

Global endpoints used by status and order lookup:

- `GET /api/v1/stores/orders/by-token/{access_token}/`
- `GET /api/v1/stores/orders/{order_id}/payment-status/`
- `GET /api/v1/stores/orders/{order_id}/`
- `GET /api/v1/stores/orders/{order_id}/whatsapp/`

WebSocket endpoints:

- `/ws/orders/{order_id}/`
- `/ws/stores/{store_slug}/orders/`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
