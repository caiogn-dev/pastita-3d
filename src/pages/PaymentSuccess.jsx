import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (orderNumber) {
        try {
          const response = await api.get(`/checkout/status/?order_number=${orderNumber}`);
          setOrderDetails(response.data);
        } catch (error) {
          console.error('Error fetching order details:', error);
        }
      }
      setLoading(false);
    };

    fetchOrderDetails();
  }, [orderNumber]);

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={iconContainerStyle}>
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="22,4 12,14.01 9,11.01" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h1 style={titleStyle}>Pagamento Confirmado!</h1>
        <p style={subtitleStyle}>
          Seu pedido foi processado com sucesso.
        </p>
        
        {orderNumber && (
          <div style={orderInfoStyle}>
            <span style={labelStyle}>Número do Pedido:</span>
            <span style={valueStyle}>{orderNumber}</span>
          </div>
        )}

        {orderDetails && (
          <div style={detailsStyle}>
            <div style={detailRowStyle}>
              <span>Status:</span>
              <span style={statusBadgeStyle}>{orderDetails.payment_status}</span>
            </div>
            <div style={detailRowStyle}>
              <span>Total:</span>
              <span style={priceStyle}>R$ {orderDetails.total_amount?.toFixed(2)}</span>
            </div>
          </div>
        )}

        <p style={infoTextStyle}>
          Você receberá um e-mail com os detalhes do seu pedido e informações de entrega.
        </p>

        <div style={buttonContainerStyle}>
          <Link to="/cardapio" style={primaryButtonStyle}>
            Continuar Comprando
          </Link>
          <Link to="/" style={secondaryButtonStyle}>
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
};

const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--color-cream)',
  padding: '20px',
};

const cardStyle = {
  backgroundColor: '#fff',
  borderRadius: '16px',
  padding: '50px 40px',
  maxWidth: '500px',
  width: '100%',
  textAlign: 'center',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
};

const iconContainerStyle = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: '#dcfce7',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 24px',
};

const iconStyle = {
  width: '40px',
  height: '40px',
  color: '#16a34a',
};

const titleStyle = {
  fontSize: '2rem',
  color: 'var(--color-marsala)',
  marginBottom: '12px',
  fontWeight: '700',
};

const subtitleStyle = {
  fontSize: '1.1rem',
  color: '#666',
  marginBottom: '24px',
};

const orderInfoStyle = {
  backgroundColor: '#f8f8f8',
  padding: '16px 24px',
  borderRadius: '8px',
  marginBottom: '24px',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.9rem',
  color: '#888',
  marginBottom: '4px',
};

const valueStyle = {
  display: 'block',
  fontSize: '1.2rem',
  fontWeight: '600',
  color: 'var(--color-marsala)',
  fontFamily: 'monospace',
};

const detailsStyle = {
  borderTop: '1px solid #eee',
  borderBottom: '1px solid #eee',
  padding: '16px 0',
  marginBottom: '24px',
};

const detailRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
  color: '#555',
};

const statusBadgeStyle = {
  backgroundColor: '#dcfce7',
  color: '#16a34a',
  padding: '4px 12px',
  borderRadius: '20px',
  fontSize: '0.85rem',
  fontWeight: '600',
  textTransform: 'capitalize',
};

const priceStyle = {
  fontWeight: '700',
  color: 'var(--color-marsala)',
  fontSize: '1.1rem',
};

const infoTextStyle = {
  fontSize: '0.9rem',
  color: '#888',
  marginBottom: '32px',
  lineHeight: '1.6',
};

const buttonContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const primaryButtonStyle = {
  display: 'block',
  backgroundColor: 'var(--color-marsala)',
  color: '#fff',
  padding: '14px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
};

const secondaryButtonStyle = {
  display: 'block',
  backgroundColor: 'transparent',
  color: 'var(--color-marsala)',
  padding: '14px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '1rem',
  border: '2px solid var(--color-marsala)',
  transition: 'all 0.3s ease',
};

export default PaymentSuccess;
