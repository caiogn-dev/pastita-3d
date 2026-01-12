import { useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';

import '../src/index.css';
import '../src/styles/forms.css';
import '../src/styles/status-pages.css';
import '../src/components/Navbar.css';
import '../src/components/CartSidebar.css';
import '../src/components/LoginModal.css';
import '../src/components/Toast.css';
import '../src/components/EmptyState.css';
import '../src/components/FavoriteButton.css';
import '../src/components/OrderTimeline.css';
import '../src/components/ProductFilters.css';
import '../src/components/Skeleton.css';
import '../src/components/StockBadge.css';
import '../src/components/ui/Button.css';
import '../src/components/ui/Badge.css';
import '../src/components/ui/Card.css';
import '../src/components/ui/Input.css';
import '../src/components/ui/EmptyState.css';
import '../src/components/ui/Modal.css';
import '../src/components/ui/OrderTimeline.css';
import '../src/components/ui/PixPayment.css';
import '../src/components/ui/Skeleton.css';
import '../src/components/ui/ProductCard.css';
import '../src/pages/LandingPage.css';
import '../src/pages/Cardapio.css';
import '../src/pages/Auth.css';
import '../src/pages/CheckoutPage.css';
import '../src/pages/Profile.css';

import { AuthProvider } from '../src/context/AuthContext';
import { CartProvider } from '../src/context/CartContext';
import { WishlistProvider } from '../src/context/WishlistContext';
import { StoreProvider } from '../src/context/StoreContext';
import ErrorBoundary from '../src/components/ErrorBoundary';
import CartSidebar from '../src/components/CartSidebar';
import { ToastProvider } from '../src/components/Toast';
import { fetchCsrfToken } from '../src/services/storeApi';

const GA_ID = 'G-F6RDSM45Q0';

const DEFAULT_SEO = {
  title: 'Pastita | Massas artesanais',
  description: 'Pastita: massas artesanais, molhos e refeicoes prontas. Peca online e receba em casa.',
  url: 'https://pastita.com.br/',
  image: 'https://pastita.com.br/design.webp'
};

export default function App({ Component, pageProps }) {
  useEffect(() => {
    fetchCsrfToken();
  }, []);

  return (
    <>
      <Head>
        <title>{DEFAULT_SEO.title}</title>
        <meta name="description" content={DEFAULT_SEO.description} />
        <meta name="robots" content="index,follow" />
        <link rel="icon" type="image/x-icon" href="/pastita-logo.ico" />
        <link rel="canonical" href={DEFAULT_SEO.url} />
        <meta name="theme-color" content="#722f37" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Pastita | Massas artesanais e molhos frescos" />
        <meta property="og:description" content="Massas artesanais, molhos e refeicoes prontas. Peca online e receba em casa." />
        <meta property="og:url" content={DEFAULT_SEO.url} />
        <meta property="og:image" content={DEFAULT_SEO.image} />
        <meta property="og:image:alt" content="Pastita massas artesanais" />
        <meta property="og:site_name" content="Pastita" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pastita | Massas artesanais e molhos frescos" />
        <meta name="twitter:description" content="Massas artesanais, molhos e refeicoes prontas. Peca online e receba em casa." />
        <meta name="twitter:image" content={DEFAULT_SEO.image} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Pastita',
              url: 'https://pastita.com.br/',
              logo: 'https://pastita.com.br/design.webp',
              image: 'https://pastita.com.br/design.webp'
            })
          }}
        />
      </Head>

      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>

      <ErrorBoundary>
        <AuthProvider>
          <StoreProvider>
            <WishlistProvider>
              <CartProvider>
                <ToastProvider>
                  <CartSidebar />
                  <Component {...pageProps} />
                </ToastProvider>
              </CartProvider>
            </WishlistProvider>
          </StoreProvider>
        </AuthProvider>
      </ErrorBoundary>
    </>
  );
}
