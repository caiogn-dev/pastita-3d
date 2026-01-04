# Pastita 3D - Frontend

React + Vite frontend for Pastita e-commerce platform with 3D product visualization.

## 🚀 Quick Start

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

The app runs at: **http://localhost:12001**

### Environment Variables

Create a `.env` file:
```env
VITE_API_URL=http://localhost:12000/api
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── CartSidebar.jsx     # Shopping cart drawer
│   ├── PrivateRoute.jsx    # Auth-protected route wrapper
│   ├── ErrorBoundary.jsx   # Error handling
│   └── InteractiveModel.jsx # 3D product viewer
│
├── context/             # React Context providers
│   ├── AuthContext.jsx     # Authentication state
│   └── CartContext.jsx     # Shopping cart state
│
├── pages/               # Page components
│   ├── LandingPage.jsx     # Home page with 3D hero
│   ├── Cardapio.jsx        # Product catalog (protected)
│   ├── CheckoutPage.jsx    # Checkout form (protected)
│   ├── Login.jsx           # Login page
│   ├── Register.jsx        # Registration page
│   ├── PaymentSuccess.jsx  # Payment success page
│   ├── PaymentError.jsx    # Payment error page
│   ├── PaymentPending.jsx  # Payment pending page
│   └── NotFound.jsx        # 404 page
│
├── services/            # API services
│   ├── api.js              # Axios instance with interceptors
│   └── auth.js             # Authentication functions
│
├── App.jsx              # Main app with routing
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## 🔐 Authentication Flow

1. User visits `/cardapio` or `/checkout`
2. `PrivateRoute` checks for authentication
3. If not authenticated, redirects to `/login`
4. After login, user is redirected back to original page
5. User profile is fetched and stored in `AuthContext`

## 🛒 Checkout Flow

1. User adds products to cart from `/cardapio`
2. User clicks "Finalizar Compra" in cart sidebar
3. Checkout page loads with:
   - Pre-filled user data from profile
   - Saved addresses from previous orders
   - Form validation for all fields
4. User confirms/edits information
5. On submit:
   - Address saved to profile (optional)
   - Order created on backend
   - Redirect to Mercado Pago payment

## 🎨 Styling

- CSS Variables for theming (defined in `index.css`)
- Inline styles for component-specific styling
- Responsive design with CSS Grid

### Theme Colors
```css
--color-marsala: #8B3A3A;
--color-gold: #C9A227;
--color-cream: #FDF8F3;
--color-text: #333333;
```

## 📦 Dependencies

- **React 19** - UI framework
- **React Router 7** - Client-side routing
- **Axios** - HTTP client
- **Three.js** - 3D graphics
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Three.js helpers
- **GSAP** - Animations

## 🔧 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy dist/ folder to Vercel
```

### Manual
```bash
npm run build
# Serve dist/ folder with any static file server
```

## 📝 Notes

- All protected routes require authentication
- Cart data is synced with backend API
- CEP auto-fill uses ViaCEP API
- Payment processing via Mercado Pago
