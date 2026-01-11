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
NEXT_PUBLIC_HERE_API_KEY=your-here-api-key
```

### HERE Maps API Key

Get your API key at: https://platform.here.com/

Required services:
- HERE Vector Tile
- HERE Routing
- HERE Isoline Routing
- HERE Geocoding & Search

Free tier: 250,000 transactions/month

## Features

- Product catalog with categories and search
- Shopping cart with real-time sync
- Checkout with PIX, Card, and Cash payment
- Interactive delivery address selection with HERE Maps
- Route visualization and delivery time estimation
- Order scheduling (date/time selection)
- User profile and order history
- Wishlist/favorites
- Coupon validation
- Delivery fee calculation with zone-based pricing

## Tech Stack

- Next.js 15 + React 19
- SWR (data fetching)
- Axios
- HERE Maps JavaScript API (maps, routing, geocoding)
- Mercado Pago SDK

## Documentation

See `/docs` folder in the project root for full documentation:
- [Technical Evaluation](../docs/TECHNICAL_EVALUATION.md)
- [HERE Maps Integration](../docs/HERE_MAPS_INTEGRATION.md)
- [API Reference](../docs/API_REFERENCE.md)
- [Deployment Guide](../docs/DEPLOYMENT.md)

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```
