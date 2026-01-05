import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const PaymentPending = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [cachedPayment, setCachedPayment] = useState(null);
  const [checking, setChecking] = useState(false);
  const activePayment = paymentInfo || cachedPayment;
  const isPendingStatus = orderDetails?.payment_status === 'pending';

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (orderNumber) {
        try {
          const cached = sessionStorage.getItem(`mp_payment_${orderNumber}`);
          if (cached) {
            setCachedPayment(JSON.parse(cached));
          }
        } catch (storageError) {
          setCachedPayment(null);
        }
        try {
          const response = await api.get(`/checkout/status/?order_number=${orderNumber}`);
          setOrderDetails(response.data);
          setPaymentInfo(response.data.payment || null);
        } catch (error) {
          console.error('Error fetching order details:', error);
        }
      }
    };

    fetchOrderDetails();
  }, [orderNumber]);

  const checkStatus = async () => {
    setChecking(true);
    try {
      const response = await api.get(`/checkout/status/?order_number=${orderNumber}`);
      setOrderDetails(response.data);
      setPaymentInfo(response.data.payment || null);
      
      if (response.data.payment_status === 'completed') {
        window.location.href = `/sucesso?order=${orderNumber}`;
      } else if (response.data.payment_status === 'failed') {
        window.location.href = `/erro?order=${orderNumber}`;
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
    setChecking(false);
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={iconContainerStyle}>
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
        </div>
        
        <h1 style={titleStyle}>Pagamento em Análise</h1>
        <p style={subtitleStyle}>
          Seu pagamento está sendo processado e será confirmado em breve.
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

        {isPendingStatus && activePayment?.payment_type_id === 'pix' && (
          <div style={pixBoxStyle}>
            <h3 style={pixTitleStyle}>PIX pronto para pagamento</h3>
            <p style={pixSubtitleStyle}>Escaneie o QR Code ou copie o codigo abaixo.</p>
            {activePayment?.qr_code_base64 && (
              <img
                src={`data:image/png;base64,${activePayment.qr_code_base64}`}
                alt="QR Code PIX"
                style={pixImageStyle}
              />
            )}
            {activePayment?.qr_code && (
              <textarea
                readOnly
                value={activePayment.qr_code}
                style={pixCodeStyle}
              />
            )}
          </div>
        )}

        {isPendingStatus && activePayment?.payment_type_id === 'ticket' && activePayment?.ticket_url && (
          <div style={pixBoxStyle}>
            <h3 style={pixTitleStyle}>Boleto gerado</h3>
            <p style={pixSubtitleStyle}>Abra o boleto para concluir o pagamento.</p>
            <a
              href={activePayment.ticket_url}
              target="_blank"
              rel="noreferrer"
              style={ticketButtonStyle}
            >
              Abrir boleto
            </a>
          </div>
        )}

        {!paymentInfo?.payment_type_id && orderDetails?.payment_link && (
          <div style={pixBoxStyle}>
            <h3 style={pixTitleStyle}>Link de pagamento</h3>
            <p style={pixSubtitleStyle}>Abra o link para concluir o pagamento.</p>
            <a
              href={orderDetails.payment_link}
              target="_blank"
              rel="noreferrer"
              style={ticketButtonStyle}
            >
              Abrir pagamento
            </a>
          </div>
        )}

        <div style={infoBoxStyle}>
          <h3 style={infoTitleStyle}>O que acontece agora?</h3>
          <ul style={infoListStyle}>
            <li>Pagamentos via boleto podem levar até 3 dias úteis</li>
            <li>Pagamentos via PIX são confirmados em minutos</li>
            <li>Você receberá um e-mail quando o pagamento for confirmado</li>
          </ul>
        </div>

        <button 
          onClick={checkStatus} 
          disabled={checking}
          style={{
            ...checkButtonStyle,
            opacity: checking ? 0.7 : 1,
            cursor: checking ? 'not-allowed' : 'pointer',
          }}
        >
          {checking ? 'Verificando...' : 'Verificar Status'}
        </button>

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
  backgroundColor: '#fef3c7',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 24px',
};

const iconStyle = {
  width: '40px',
  height: '40px',
  color: '#d97706',
};

const titleStyle = {
  fontSize: '2rem',
  color: '#d97706',
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
  backgroundColor: '#fef3c7',
  color: '#d97706',
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

const infoBoxStyle = {
  backgroundColor: '#f0f9ff',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '24px',
  textAlign: 'left',
};

const infoTitleStyle = {
  fontSize: '1rem',
  color: '#0369a1',
  marginBottom: '12px',
  marginTop: 0,
};

const infoListStyle = {
  margin: 0,
  paddingLeft: '20px',
  color: '#0369a1',
  fontSize: '0.9rem',
  lineHeight: '1.8',
};

const pixBoxStyle = {
  backgroundColor: '#fff7ed',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '24px',
  border: '1px solid #fed7aa',
  textAlign: 'left',
};

const pixTitleStyle = {
  fontSize: '1rem',
  color: '#9a3412',
  marginTop: 0,
  marginBottom: '10px',
};

const pixSubtitleStyle = {
  fontSize: '0.9rem',
  color: '#9a3412',
  marginBottom: '12px',
};

const pixImageStyle = {
  width: '200px',
  height: '200px',
  display: 'block',
  marginBottom: '12px',
};

const pixCodeStyle = {
  width: '100%',
  minHeight: '80px',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #fdba74',
  fontFamily: 'monospace',
  fontSize: '0.85rem',
  resize: 'vertical',
};

const ticketButtonStyle = {
  display: 'inline-block',
  padding: '10px 16px',
  borderRadius: '8px',
  backgroundColor: '#c2410c',
  color: '#fff',
  textDecoration: 'none',
  fontWeight: '600',
};

const checkButtonStyle = {
  width: '100%',
  backgroundColor: '#d97706',
  color: '#fff',
  padding: '14px 24px',
  borderRadius: '8px',
  border: 'none',
  fontWeight: '600',
  fontSize: '1rem',
  marginBottom: '16px',
  transition: 'all 0.3s ease',
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

export default PaymentPending;

