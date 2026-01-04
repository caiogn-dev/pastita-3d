import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import CartSidebar from './components/CartSidebar';

// Services
import { fetchCsrfToken } from './services/api';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Cardapio = lazy(() => import('./pages/Cardapio'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentError = lazy(() => import('./pages/PaymentError'));
const PaymentPending = lazy(() => import('./pages/PaymentPending'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading component for Suspense
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: 'var(--color-cream)',
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid var(--color-marsala)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

function App() {
  // Fetch CSRF token on app initialization
  useEffect(() => {
    fetchCsrfToken();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
            <CartSidebar />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/cardapio" element={<Cardapio />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                
                {/* Payment Result Routes (Public - user may not be logged in after redirect) */}
                <Route path="/sucesso" element={<PaymentSuccess />} />
                <Route path="/erro" element={<PaymentError />} />
                <Route path="/pendente" element={<PaymentPending />} />
                
                {/* Protected Routes - Require Authentication */}
                <Route element={<PrivateRoute />}>
                  <Route path="/checkout" element={<CheckoutPage />} />
                </Route>

                {/* 404 Not Found */}
                <Route path="/404" element={<NotFound />} />
                
                {/* Fallback - redirect unknown routes to 404 */}
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
