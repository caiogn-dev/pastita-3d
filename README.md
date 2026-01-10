# Pastita 3D - Frontend

Next.js 15 + React 19 frontend for the Pastita e-commerce platform.

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs at: `http://localhost:3000` (default Next.js port).

## Environment Variables

Create a `.env.local` file:

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

## Project Structure

```
pastita-3d/
├── pages/               # Next.js routes (wrappers)
├── src/
│   ├── components/      # Reusable UI components
│   ├── context/         # Auth, cart, wishlist providers
│   ├── pages/           # Page components
│   ├── services/        # API clients
│   ├── styles/          # Shared styles
│   └── index.css         # Global styles
├── public/
├── package.json
└── next.config.js
```

## Authentication Flow

1. User visits `/cardapio` or `/checkout`
2. Auth context checks for a token (cookie + memory fallback)
3. If not authenticated, LoginModal is shown
4. Profile data is fetched from `/api/v1/users/profile/`

## Checkout Flow

1. Cart data comes from `/api/v1/ecommerce/cart/list/`
2. Checkout payload is posted to `/api/v1/ecommerce/checkout/create_checkout/`
3. Payment status is tracked on `/api/v1/ecommerce/checkout/status/`

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

