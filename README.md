# Pastita 3D

Next.js 15 + React 19 customer-facing e-commerce frontend.

## Quick Start

```bash
npm install
npm run dev
```

App runs at: `http://localhost:3000`

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1/ecommerce
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=xxx
NEXT_PUBLIC_AUTH_COOKIE_NAME=auth_token
```

## Features

- Product catalog with categories and search
- Shopping cart with real-time sync
- Checkout with PIX, Card, and Cash payment
- Order scheduling (date/time selection)
- User profile and order history
- Wishlist/favorites
- Coupon validation
- Delivery fee calculation

## Documentation

See `/docs` folder in the project root for full documentation.

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

